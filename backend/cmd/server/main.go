package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"streamquiz-backend/internal/database"
	"streamquiz-backend/internal/manager"
	"streamquiz-backend/internal/questions"
	"streamquiz-backend/internal/service"
)

func main() {
	// Try loading .env from current dir or parent (root)
	_ = godotenv.Load()
	_ = godotenv.Load("../.env.local")

	// Verify API Key - support both standard and VITE_ prefixed keys
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("VITE_OPENROUTER_API_KEY")
		if apiKey != "" {
			os.Setenv("OPENROUTER_API_KEY", apiKey) // normalize for inner services
		}
	}

	if apiKey == "" {
		log.Println("WARNING: OPENROUTER_API_KEY is not set.")
	}

	// Init Database
	database.Init()
	defer database.Close()

	// Init Manager
	manager.Init()

	// Init Questions Service
	qRepo := questions.NewPgRepository()
	aiAdapter := questions.NewAIAdapter()
	// No static questions for now, using DB and AI
	qService := questions.NewService(qRepo, nil, questions.HybridStrategy{StaticPct: 0, DBPct: 50, AIPct: 50}, aiAdapter, nil, nil, nil)

	// Inject qService into global manager if needed, or just use it in handlers.
	// For simplicity, let's keep it local to main or make a global var if we had to split handlers

	mux := http.NewServeMux()

	mux.HandleFunc("/api/questions/hybrid", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req questions.HybridRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid body", http.StatusBadRequest)
			return
		}

		// Set UserID if available from auth (placeholder)
		// req.UserID = ...

		res, err := qService.Hybrid(r.Context(), req)
		if err != nil {
			log.Printf("Hybrid fetch error: %v", err)
			http.Error(w, fmt.Sprintf("Error: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	})

	mux.HandleFunc("/api/questions/prewarm", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req questions.HybridRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid body", http.StatusBadRequest)
			return
		}

		qService.Replenish(r.Context(), req.SkillID, req.Section, req.Count)
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{"status": "job_started"})
	})

	// Old endpoint (optional, keep for reference or remove)
	mux.HandleFunc("/api/generate-quiz", handleGenerateQuiz)

	// New Batch Endpoints
	mux.HandleFunc("/api/quiz/start", handleStartSession)
	mux.HandleFunc("/api/quiz/next", handleNextQuiz)

	// CORS setup
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173", "http://127.0.0.1:5173",
			"http://localhost:3000", "http://127.0.0.1:3000",
		},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func handleStartSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Topic   string `json:"topic"`
		Section string `json:"section"`
		Count   int    `json:"count"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.Count <= 0 {
		req.Count = 1
	}
	if req.Count > 10 {
		req.Count = 10 // Safety limit
	}

	sessionID := manager.GlobalManager.StartSession(req.Topic, req.Section, req.Count)

	// Wait for the FIRST quiz to be ready so the user doesn't get an empty "next" immediately
	// Or we can just return ID and let the client poll "next".
	// UX-wise: client needs 1 immediately.
	// So let's peek/pop one immediately here?
	// Use GetNextQuiz which blocks until 1 is available.
	firstQuiz := manager.GlobalManager.GetNextQuiz(sessionID)
	if firstQuiz == nil {
		http.Error(w, "Failed to generate initial quiz", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"sessionId": sessionID,
		"firstQuiz": firstQuiz,
		"remaining": req.Count - 1,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func handleNextQuiz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionID := r.URL.Query().Get("sessionId")
	if sessionID == "" {
		http.Error(w, "sessionId required", http.StatusBadRequest)
		return
	}

	quiz := manager.GlobalManager.GetNextQuiz(sessionID)
	if quiz == nil {
		// Could mean done or session invalid
		// We return generic done for simplicity
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"done": true})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}

func handleGenerateQuiz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req service.QuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Topic == "" {
		http.Error(w, "Topic is required", http.StatusBadRequest)
		return
	}

	log.Printf("Generating quiz for topic: %s, section: %s", req.Topic, req.Section)

	quiz, err := service.GenerateQuiz(req.Topic, req.Section)
	if err != nil {
		log.Printf("Error generating quiz: %v", err)
		http.Error(w, fmt.Sprintf("Failed to generate quiz: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}
