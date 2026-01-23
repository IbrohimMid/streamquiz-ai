package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/google/uuid"
)

const (
	OllamaAPIURL     = "http://localhost:11434/api/chat"
	OpenRouterAPIURL = "https://openrouter.ai/api/v1/chat/completions"
)

var OllamaModels = []string{
	"llama3.2",
}

var OpenRouterModels = []string{
	"xiaomi/mimo-v2-flash:free",
	"qwen/qwen3-next-80b-a3b-instruct:free",
	"meta-llama/llama-3.1-405b-instruct:free",
}

type QuizRequest struct {
	Topic   string `json:"topic"`
	Section string `json:"section"`
}

type QuizResponse struct {
	ID             string   `json:"id"`
	Type           string   `json:"type"`
	PassageText    string   `json:"passageText,omitempty"`
	Text           string   `json:"text"` // Standardized to "text" to match Question struct
	Options        []Option `json:"options"`
	CorrectAnswer  string   `json:"correctAnswer"`
	Explanation    string   `json:"explanation"`
	PatternTip     string   `json:"patternTip"`
	Hints          []string `json:"hints,omitempty"`
	ReferencedText string   `json:"referencedText,omitempty"`
	Section        string   `json:"section,omitempty"`
}

type Option struct {
	Key  string `json:"key"`
	Text string `json:"text"`
}

func QueryLLM(ctx context.Context, systemInstruction, userPrompt string) (string, error) {
	// 1. Try OpenRouter (Cloud) - PRIMARY
	fmt.Println("Attempting to generate with OpenRouter (Main)...")
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	var lastErr error

	if apiKey != "" {
		for _, model := range OpenRouterModels {
			content, err := queryModel(ctx, "openrouter", OpenRouterAPIURL, apiKey, model, systemInstruction, userPrompt)
			if err == nil {
				fmt.Printf("Success with OpenRouter model: %s\n", model)
				return content, nil
			}
			fmt.Printf("OpenRouter model %s failed: %v. Trying next...\n", model, err)
			lastErr = err
		}
	} else {
		fmt.Println("OPENROUTER_API_KEY missing, skipping OpenRouter.")
	}

	// 2. Fallback to Ollama (Local)
	fmt.Println("Falling back to Ollama (Local)...")
	for _, model := range OllamaModels {
		content, err := queryModel(ctx, "ollama", OllamaAPIURL, "", model, systemInstruction, userPrompt)
		if err == nil {
			fmt.Printf("Success with Ollama model: %s\n", model)
			return content, nil
		}
		fmt.Printf("Ollama model %s failed: %v\n", model, err)
	}

	return "", fmt.Errorf("all providers failed. Last OpenRouter error: %v", lastErr)
}

func queryModel(ctx context.Context, provider, apiURL, apiKey, model, systemInstruction, userPrompt string) (string, error) {
	var reqBody []byte
	var err error

	if provider == "ollama" {
		reqBody, _ = json.Marshal(map[string]interface{}{
			"model": model,
			"messages": []map[string]string{
				{"role": "system", "content": systemInstruction},
				{"role": "user", "content": userPrompt},
			},
			"stream": false,
			"format": "json",
		})
	} else {
		// OpenRouter
		reqBody, _ = json.Marshal(map[string]interface{}{
			"model": model,
			"messages": []map[string]string{
				{"role": "system", "content": systemInstruction},
				{"role": "user", "content": userPrompt},
			},
			"response_format": map[string]string{"type": "json_object"},
		})
	}

	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	if provider == "openrouter" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
		req.Header.Set("HTTP-Referer", "http://localhost:5173")
		req.Header.Set("X-Title", "StreamQuiz AI")
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API Error (%s): %d", provider, resp.StatusCode)
	}

	var content string

	if provider == "ollama" {
		var aiResp struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
			return "", err
		}
		content = aiResp.Message.Content
	} else {
		var aiResp struct {
			Choices []struct {
				Message struct {
					Content string `json:"content"`
				} `json:"message"`
			} `json:"choices"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
			return "", err
		}
		if len(aiResp.Choices) == 0 {
			return "", fmt.Errorf("no content received from AI")
		}
		content = aiResp.Choices[0].Message.Content
	}

	if content == "" {
		return "", fmt.Errorf("empty content received")
	}

	return content, nil
}

func GenerateQuiz(topic, section string) (*QuizResponse, error) {
	// Try to get a specific strategy first
	strategy := GetSkillStrategy(topic)

	systemInstruction := strategy.SystemPrompt
	taskPrompt := strategy.TaskPrompt

	// Append JSON Schema requirement strictly
	prompt := fmt.Sprintf(`%s

      Return the response in JSON format matching this schema:
      {
          "type": "sentence_completion", "error_identification", or "reading_comprehension",
          "passageText": "string (only for reading)",
          "text": "string (the main question text)",
          "options": [
              {"key": "A", "text": "string"},
              {"key": "B", "text": "string"},
              {"key": "C", "text": "string"},
              {"key": "D", "text": "string"}
          ],
          "correctAnswer": "string (A, B, C, or D)",
          "explanation": "string",
          "patternTip": "string",
          "hints": ["string"],
          "referencedText": "string (optional, text being tested)"
      }
      
      Ensure 'options' has exactly 4 items.`, taskPrompt)

	// Call QueryLLM with background context since GenerateQuiz doesn't take one
	content, err := QueryLLM(context.Background(), systemInstruction, prompt)
	if err != nil {
		return nil, err
	}

	var quizData QuizResponse
	if err := json.Unmarshal([]byte(content), &quizData); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	quizData.ID = uuid.New().String()
	quizData.Section = section
	return &quizData, nil
}
