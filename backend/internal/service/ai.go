package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const (
	OpenRouterAPIURL = "https://openrouter.ai/api/v1/chat/completions"
)

var Models = []string{
	"xiaomi/mimo-v2-flash:free",
	"qwen/qwen3-next-80b-a3b-instruct:free",
	"meta-llama/llama-3.1-405b-instruct:free",
}

type QuizRequest struct {
	Topic   string `json:"topic"`
	Section string `json:"section"`
}

type QuizResponse struct {
	Type          string   `json:"type"`
	PassageText   string   `json:"passageText,omitempty"`
	Question      string   `json:"question"`
	Options       []Option `json:"options"`
	CorrectAnswer string   `json:"correctAnswer"`
	Explanation   string   `json:"explanation"`
	PatternTip    string   `json:"patternTip"`
	Hints         []string `json:"hints,omitempty"`
	Section       string   `json:"section,omitempty"`
}

type Option struct {
	Key  string `json:"key"`
	Text string `json:"text"`
}

func QueryLLM(ctx context.Context, systemInstruction, userPrompt string) (string, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPENROUTER_API_KEY is missing")
	}

	var lastErr error

	for _, model := range Models {
		content, err := queryModel(ctx, apiKey, model, systemInstruction, userPrompt)
		if err == nil {
			return content, nil
		}
		// Log the error but continue to next model
		fmt.Printf("Model %s failed: %v. Trying next...\n", model, err)
		lastErr = err
	}

	return "", fmt.Errorf("all models failed. Last error: %v", lastErr)
}

func queryModel(ctx context.Context, apiKey, model, systemInstruction, userPrompt string) (string, error) {
	reqBody, _ := json.Marshal(map[string]interface{}{
		"model": model,
		"messages": []map[string]string{
			{"role": "system", "content": systemInstruction},
			{"role": "user", "content": userPrompt},
		},
		"response_format": map[string]string{"type": "json_object"},
	})

	req, err := http.NewRequestWithContext(ctx, "POST", OpenRouterAPIURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("HTTP-Referer", "http://localhost:5173")
	req.Header.Set("X-Title", "StreamQuiz AI")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OpenRouter API Error: %d", resp.StatusCode)
	}

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

	return aiResp.Choices[0].Message.Content, nil
}

func GenerateQuiz(topic, section string) (*QuizResponse, error) {
	systemInstruction := "You are a helpful AI that generates TOEFL exercises. You must strictly output valid JSON."
	var prompt string

	if section == "READING" {
		prompt = fmt.Sprintf(`Generate a TOEFL Reading Comprehension exercise for the topic: "%s".
      
      1. Write an academic reading passage (approx 150-200 words) suitable for TOEFL. Topics can be History, Science, Art, etc.
      2. Create ONE difficult multiple-choice question based on that passage and the specific skill mentioned in the topic.
      
      Return the response in JSON format matching this schema:
      {
          "type": "reading_comprehension",
          "passageText": "string",
          "question": "string",
          "options": [
              {"key": "A", "text": "string"},
              {"key": "B", "text": "string"},
              {"key": "C", "text": "string"},
              {"key": "D", "text": "string"}
          ],
          "correctAnswer": "string (A, B, C, or D)",
          "explanation": "string",
          "patternTip": "string (e.g., 'Scan for Keywords')",
          "hints": ["string"]
      }
      
      The 'patternTip' should be a specific reading strategy.`, topic)
	} else {
		prompt = fmt.Sprintf(`Generate a difficult %s multiple-choice question for TOEFL Structure section.
      
      It must be one of two types:
      1. 'sentence_completion': A sentence with a blank marked as "____".
      2. 'error_identification': A sentence with 4 underlined parts marked as {A}text{/A}, {B}text{/B}, {C}text{/C}, {D}text{/D}. One of them is grammatically incorrect.

      Return the response in JSON format matching this schema:
      {
          "type": "sentence_completion" OR "error_identification",
          "question": "string",
          "options": [
              {"key": "A", "text": "string"},
              {"key": "B", "text": "string"},
              {"key": "C", "text": "string"},
              {"key": "D", "text": "string"}
          ],
          "correctAnswer": "string (A, B, C, or D)",
          "explanation": "string",
          "patternTip": "string (e.g., 'Subject-Verb Agreement')"
      }
      
      For 'options', provide an array of objects with 'key' (A, B, C, D) and 'text'. 
      For error_identification, the 'text' of the option should match the text inside the braces.
      Include a 'patternTip' which is a very short, catchy grammar rule name.`, topic)
	}

	// Call QueryLLM with background context since GenerateQuiz doesn't take one
	content, err := QueryLLM(context.Background(), systemInstruction, prompt)
	if err != nil {
		return nil, err
	}

	var quizData QuizResponse
	if err := json.Unmarshal([]byte(content), &quizData); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	quizData.Section = section
	return &quizData, nil
}
