package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"streamquiz-backend/internal/database"
	"streamquiz-backend/internal/manager"
	"streamquiz-backend/internal/questions"
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

	// Init Questions Service
	qRepo := questions.NewPgRepository()
	aiAdapter := questions.NewAIAdapter()
	// No static questions for now, using DB and AI
	qService := questions.NewService(qRepo, nil, questions.HybridStrategy{StaticPct: 0, DBPct: 50, AIPct: 50}, aiAdapter, nil, nil, nil)

	// Init Quiz Manager
	quizMgr := manager.NewQuizManager(&manager.ServiceQuizGenerator{})

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

		// Run in background with a detached context so it persists after request
		// But Replenish expects a context that CAN be cancelled or timed out.
		// We should use a background context with timeout.
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
			defer cancel()
			qService.Replenish(ctx, req.SkillID, req.Section, req.Count)
		}()

		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{"status": "job_started"})
	})

	// New Batch Endpoints
	mux.HandleFunc("/api/quiz/start", func(w http.ResponseWriter, r *http.Request) {
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

		// Pass context from request? No, StartSession spawns background work.
		// But we check limiter on caller context if we want.
		// For now, pass r.Context() to StartSession if it uses it for initial setup,
		// but remember StartSession now uses detached context for the goroutine.
		sessionID := quizMgr.StartSession(r.Context(), req.Topic, req.Section, req.Count)

		// NON-BLOCKING: Return ID immediately. Client must poll /next.
		resp := map[string]interface{}{
			"sessionId": sessionID,
			"remaining": req.Count,
			"status":    "started",
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	})

	mux.HandleFunc("/api/quiz/next", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		sessionID := r.URL.Query().Get("sessionId")
		if sessionID == "" {
			http.Error(w, "sessionId required", http.StatusBadRequest)
			return
		}

		quiz := quizMgr.GetNextQuiz(sessionID)
		if quiz == nil {
			// Check if session exists or errors?
			// GetNextQuiz returns nil when channel closed (done).
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"done": true})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quiz)
	})

	mux.HandleFunc("/api/quiz/stream", func(w http.ResponseWriter, r *http.Request) {
		// SSE requires GET
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		sessionID := r.URL.Query().Get("sessionId")
		if sessionID == "" {
			http.Error(w, "sessionId required", http.StatusBadRequest)
			return
		}

		// Set SSE headers
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*") // Handle CORS manually if needed, or rely on middleware

		// Flush headers immediately
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
			return
		}
		flusher.Flush()

		// Stream loop
		// We listen for client disconnect via r.Context()
		ctx := r.Context()

		for {
			// Check if client disconnected
			select {
			case <-ctx.Done():
				return
			default:
			}

			// GetNextQuiz blocks if no quiz is ready, or returns nil if done/closed
			// Note: This blocks until a quiz is ready. If client disconnects while we wait here,
			// we won't know until GetNextQuiz returns. Ideally GetNextQuiz should accept Context.
			// But since sessions have timeouts and generation has limits, it won't block forever.
			quiz := quizMgr.GetNextQuiz(sessionID)
			if quiz == nil {
				// End of stream
				// Send a specific event or just close connection?
				// Usually we can send a "done" event
				fmt.Fprintf(w, "event: done\ndata: {}\n\n")
				flusher.Flush()
				return
			}

			// Marshal quiz to JSON
			data, err := json.Marshal(quiz)
			if err != nil {
				log.Printf("Error marshaling quiz for stream: %v", err)
				continue
			}

			// Write SSE event
			// Default event type is "message"
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		}
	})

	mux.HandleFunc("/api/quiz/submit", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			SessionID string            `json:"sessionId"`
			Answers   map[string]string `json:"answers"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid body", http.StatusBadRequest)
			return
		}

		score, err := quizMgr.SubmitQuiz(req.SessionID, req.Answers)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "submitted",
			"score":  score,
		})
	})

	mux.HandleFunc("/api/quiz/results", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		sessionID := r.URL.Query().Get("sessionId")
		if sessionID == "" {
			http.Error(w, "sessionId required", http.StatusBadRequest)
			return
		}

		result, err := quizMgr.GetQuizResult(sessionID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	})

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
	// Use qService and quizMgr to silence unused variable errors if logic was different?
	// They are used in closures.
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

// Remove standalone handlers handleStartSession/handleNextQuiz/handleGenerateQuiz to avoid confusion/unused errors
