# AI Integration and Prompt Engineering Plan

## Overview
Implement comprehensive AI integration for the streamquiz-ai application, focusing on TOEFL question generation, content creation, grammar analysis, and writing evaluation using OpenRouter API with structured prompts and robust error handling.

## Current AI Implementation Analysis

### Existing Components
- **AI Service**: `backend/internal/service/ai.go` - Basic question generation
- **Prompts**: `backend/internal/service/prompts.go` - Skill-specific prompt strategies
- **AI Adapter**: `backend/internal/questions/ai_adapter.go` - Question generation interface

### Issues Identified
- Limited prompt engineering sophistication
- No structured output validation
- Missing error analysis and correction features
- No content generation capabilities
- No writing evaluation
- Basic retry logic without fallback strategies

## Enhanced AI Architecture

### Core AI Services

#### 1. Question Generation Service
**Location**: `backend/internal/service/question_generation.go`

**Features**:
- Batch question generation with concurrency control
- Structured JSON output validation
- Skill-specific prompt engineering
- Quality assurance checks

**Key Prompts**:

```go
func buildQuestionPrompt(skillID, section string, count int) string {
    return fmt.Sprintf(`You are an expert TOEFL PBT question generator.
Generate exactly %d high-quality %s questions for skill: %s

LEVEL & STYLE:
- TOEFL PBT difficulty (upper-intermediate/advanced, B2–C1).
- Academic or formal contexts only (campus, lectures, research, policies).
- Grammatically targeted stems that test structure/grammar, not trivia.

CRITICAL: Return a JSON array. Each question MUST have this EXACT structure:
{
  "text": "Question text with blank ____ for completion OR {A}word{/A} markers for error identification",
  "type": "SENTENCE_COMPLETION" or "ERROR_IDENTIFICATION",
  "options": [
    {"key": "A", "text": "first option text"},
    {"key": "B", "text": "second option text"},
    {"key": "C", "text": "third option text"},
    {"key": "D", "text": "fourth option text"}
  ],
  "correctAnswer": "A",
  "explanation": "Brief explanation why this is correct",
  "patternTip": "Short strategy tip"
}

RULES:
1. "options" MUST be an array of objects with "key" and "text" fields
2. Each option's "text" field must contain the actual answer choice
3. Include exactly 4 options (A, B, C, D)
4. For SENTENCE_COMPLETION: use ____ in text field for the blank
5. For ERROR_IDENTIFICATION: mark 4 parts with {A}...{/A}, {B}...{/B}, etc.
6. correctAnswer must be one of: "A", "B", "C", or "D"

Return ONLY the JSON array, no markdown, no explanation.`, count, section, skillID)
}
```

#### 2. Content Generation Service
**Location**: `backend/internal/service/content_generation.go`

**Features**:
- Skill content creation (blog posts, cheat sheets)
- Guided examples generation
- Writing prompts creation

**Key Prompts**:

```go
func buildSkillContentPrompt(skillName, section, description string) string {
    sectionContext := mapSectionContext(section)
    return fmt.Sprintf(`You are an expert TOEFL PBT Instructor creating educational content.
Skill: %s
Section: %s
Description: %s
TASK: Generate comprehensive learning content.
OUTPUT JSON:
{
  "blogContent": "Detailed explanation with examples...",
  "cheatSheet": {
    "rules": ["Rule 1", "Rule 2"],
    "examples": ["Example 1", "Example 2"],
    "commonErrors": ["Error 1", "Error 2"]
  },
  "examples": [
    {
      "question": "Sample question",
      "explanation": "Step by step solution"
    }
  ]
}
Return ONLY JSON, no additional text.`, skillName, sectionContext, description)
}
```

#### 3. Grammar Analysis Service
**Location**: `backend/internal/service/grammar_analysis.go`

**Features**:
- Error analysis and correction
- Option validity explanation
- Reasoning validation
- Heuristic fallbacks for faster analysis

**Key Prompts**:

```go
func buildErrorAnalysisPrompt(sentence, userAnswer, correctAnswer, questionType string) string {
    return fmt.Sprintf(`You are an expert TOEFL Grammar Coach. The user made a mistake on this question.

**Sentence:** "%s"
**User Answer:** %s
**Correct Answer:** %s
**Question Type:** %s

Provide structured feedback in JSON format:
{
  "errorType": "Subject-Verb Agreement|Parallel Structure|etc",
  "errorExplanation": "Brief explanation of the grammar rule",
  "correction": "The corrected sentence",
  "patternTip": "Strategy to avoid this error",
  "similarExamples": ["Example 1", "Example 2"]
}

Return ONLY JSON, no additional text.`, sentence, userAnswer, correctAnswer, questionType)
}
```

#### 4. Writing Evaluation Service
**Location**: `backend/internal/service/writing_evaluation.go`

**Features**:
- Essay scoring (1.0-6.0 scale)
- Detailed feedback on organization, grammar, development, vocabulary
- TOEFL-specific criteria

**Key Prompts**:

```go
func buildEssayEvaluationPrompt(topic, essay string) string {
    return fmt.Sprintf(`You are a strict TOEFL Writing Grader.
Grade this essay based on Organization, Grammar, Development, Vocabulary.
Score scale: 1.0 to 6.0 (can use 0.5 increments).

Topic: "%s"

Essay:
"%s"

Output JSON:
{
  "score": 4.5,
  "feedback": {
    "organization": "Comments on essay structure and coherence",
    "grammar": "Analysis of grammatical accuracy",
    "development": "Evaluation of idea development",
    "vocabulary": "Assessment of word choice and range"
  },
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "generalComment": "Overall feedback and suggestions"
}

Return ONLY JSON, no additional text.`, topic, essay)
}
```

## Response Processing and Validation

### Output Validation
**Location**: `backend/internal/service/validation.go`

```go
type QuestionValidator struct {
    requiredFields []string
    optionKeys     []string
}

func (v *QuestionValidator) ValidateQuestion(q map[string]interface{}) error {
    // Check required fields
    for _, field := range v.requiredFields {
        if _, exists := q[field]; !exists {
            return fmt.Errorf("missing required field: %s", field)
        }
    }

    // Validate options structure
    options, ok := q["options"].([]interface{})
    if !ok || len(options) != 4 {
        return errors.New("options must be array of 4 objects")
    }

    // Validate option keys and text
    for i, opt := range options {
        optMap, ok := opt.(map[string]interface{})
        if !ok {
            return fmt.Errorf("option %d must be object", i)
        }

        key, hasKey := optMap["key"]
        text, hasText := optMap["text"]

        if !hasKey || !hasText {
            return fmt.Errorf("option %d missing key or text", i)
        }

        if key != v.optionKeys[i] {
            return fmt.Errorf("option %d key must be %s", i, v.optionKeys[i])
        }
    }

    return nil
}
```

### Response Cleaning and Parsing
**Location**: `backend/internal/service/parser.go`

```go
func CleanAndParseJSON(rawResponse string) (interface{}, error) {
    // Remove markdown code blocks
    cleaned := stripMarkdownCodeBlocks(rawResponse)

    // Extract JSON array/object
    cleaned = extractJSON(cleaned)

    // Parse JSON
    var result interface{}
    if err := json.Unmarshal([]byte(cleaned), &result); err != nil {
        return nil, fmt.Errorf("JSON parse error: %w", err)
    }

    return result, nil
}

func stripMarkdownCodeBlocks(text string) string {
    re := regexp.MustCompile(`(?s)```(?:json)?\s*([\s\S]*?)````)
    if matches := re.FindStringSubmatch(text); len(matches) > 1 {
        return strings.TrimSpace(matches[1])
    }
    return strings.TrimSpace(text)
}

func extractJSON(text string) string {
    start := strings.Index(text, "{")
    end := strings.LastIndex(text, "}")
    if start != -1 && end > start {
        return text[start : end+1]
    }

    start = strings.Index(text, "[")
    end = strings.LastIndex(text, "]")
    if start != -1 && end > start {
        return text[start : end+1]
    }

    return text
}
```

## Error Handling and Fallbacks

### Retry Logic with Exponential Backoff
**Location**: `backend/internal/service/retry.go`

```go
type RetryConfig struct {
    MaxAttempts int
    BaseDelay   time.Duration
    MaxDelay    time.Duration
}

func (c *RetryConfig) RetryWithBackoff(operation func() error) error {
    delay := c.BaseDelay

    for attempt := 1; attempt <= c.MaxAttempts; attempt++ {
        err := operation()
        if err == nil {
            return nil
        }

        if attempt == c.MaxAttempts {
            return err
        }

        time.Sleep(delay)
        delay = time.Duration(float64(delay) * 1.5)
        if delay > c.MaxDelay {
            delay = c.MaxDelay
        }
    }

    return errors.New("max retry attempts exceeded")
}
```

### Heuristic Fallbacks
**Location**: `backend/internal/service/heuristics.go`

```go
type GrammarHeuristic struct {
    Pattern     *regexp.Regexp
    ErrorType   string
    Confidence  float64
    Hint        string
    Explanation string
}

func DetectAgreementIssue(sentence string) *HeuristicResult {
    text := normalizeSentence(sentence)

    heuristics := []GrammarHeuristic{
        {
            Pattern:     regexp.MustCompile(`\b(is|was|has|does)\b.*\b(students?|people?|they|we)\b`),
            ErrorType:   "Subject-Verb Agreement",
            Confidence:  0.8,
            Hint:        "Check if singular subjects have singular verbs",
            Explanation: "Singular subjects need singular verbs (is/was/has/does)",
        },
        // More heuristics...
    }

    for _, h := range heuristics {
        if h.Pattern.MatchString(text) {
            return &HeuristicResult{
                Matched:         true,
                ErrorType:       h.ErrorType,
                Confidence:      h.Confidence,
                NudgeHint:       h.Hint,
                RuleExplanation: h.Explanation,
            }
        }
    }

    return &HeuristicResult{Matched: false}
}
```

## Caching and Performance Optimization

### Response Caching
**Location**: `backend/internal/service/cache.go`

```go
type AICache struct {
    store map[string]CacheEntry
    mu    sync.RWMutex
    ttl   time.Duration
}

type CacheEntry struct {
    Response   interface{}
    Timestamp  time.Time
    HitCount   int
}

func (c *AICache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()

    entry, exists := c.store[key]
    if !exists {
        return nil, false
    }

    if time.Since(entry.Timestamp) > c.ttl {
        return nil, false
    }

    entry.HitCount++
    return entry.Response, true
}

func (c *AICache) Set(key string, response interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()

    c.store[key] = CacheEntry{
        Response:  response,
        Timestamp: time.Now(),
        HitCount:  1,
    }
}
```

### Batch Processing
**Location**: `backend/internal/service/batch.go`

```go
func GenerateQuestionsBatch(ctx context.Context, requests []QuestionRequest, maxConcurrency int) ([]QuestionResponse, error) {
    semaphore := make(chan struct{}, maxConcurrency)
    results := make([]QuestionResponse, len(requests))
    var wg sync.WaitGroup
    var mu sync.Mutex
    var firstError error

    for i, req := range requests {
        wg.Add(1)
        go func(index int, request QuestionRequest) {
            defer wg.Done()

            semaphore <- struct{}{} // Acquire
            defer func() { <-semaphore }() // Release

            response, err := GenerateQuestion(ctx, request)
            mu.Lock()
            if err != nil && firstError == nil {
                firstError = err
            }
            results[index] = response
            mu.Unlock()
        }(i, req)
    }

    wg.Wait()

    if firstError != nil {
        return nil, firstError
    }

    return results, nil
}
```

## API Integration

### OpenRouter Client
**Location**: `backend/internal/service/openrouter.go`

```go
type OpenRouterClient struct {
    apiKey     string
    baseURL    string
    httpClient *http.Client
    model      string
}

func (c *OpenRouterClient) ChatCompletion(ctx context.Context, messages []ChatMessage) (*ChatResponse, error) {
    reqBody := ChatRequest{
        Model:    c.model,
        Messages: messages,
    }

    jsonData, err := json.Marshal(reqBody)
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }

    req.Header.Set("Authorization", "Bearer "+c.apiKey)
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API error: %s", resp.Status)
    }

    var response ChatResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return nil, err
    }

    return &response, nil
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. **Enhanced AI Service**: Upgrade existing service with structured prompts
2. **Validation Framework**: Implement response validation and parsing
3. **Error Handling**: Add retry logic and fallback strategies
4. **Caching Layer**: Implement response caching

### Phase 2: New AI Services
1. **Content Generation**: Blog posts, cheat sheets, examples
2. **Grammar Analysis**: Error detection and correction
3. **Writing Evaluation**: Essay scoring and feedback
4. **Batch Processing**: Concurrent question generation

### Phase 3: Advanced Features
1. **Heuristic Fallbacks**: Fast grammar analysis
2. **Quality Assurance**: Automated quality scoring
3. **Vector Search**: Semantic question matching (future)
4. **Analytics**: Response time tracking and optimization

### Phase 4: Integration and Testing
1. **API Endpoints**: Expose new AI services
2. **Frontend Integration**: Update UI for new features
3. **Comprehensive Testing**: Unit tests, integration tests
4. **Performance Monitoring**: Response times, success rates

## Performance Targets

- **Response Time**: < 3 seconds for single questions, < 10 seconds for batches
- **Success Rate**: > 95% with retry logic
- **Cache Hit Rate**: > 70% for repeated requests
- **Concurrent Processing**: Support 10+ simultaneous requests

## Monitoring and Analytics

### Metrics to Track
- Response times by prompt type
- Success/failure rates
- Cache hit rates
- Token usage and costs
- Quality scores over time

### Logging
```go
type AIServiceLogger struct {
    requestID string
    startTime time.Time
    promptType string
}

func (l *AIServiceLogger) LogRequest(prompt string, params map[string]interface{}) {
    log.WithFields(log.Fields{
        "request_id": l.requestID,
        "prompt_type": l.promptType,
        "prompt_length": len(prompt),
        "params": params,
    }).Info("AI request started")
}

func (l *AIServiceLogger) LogResponse(response interface{}, duration time.Duration, success bool) {
    log.WithFields(log.Fields{
        "request_id": l.requestID,
        "duration_ms": duration.Milliseconds(),
        "success": success,
        "response_size": len(fmt.Sprintf("%v", response)),
    }).Info("AI request completed")
}
```

This comprehensive AI integration plan incorporates advanced prompt engineering techniques, robust error handling, and performance optimizations to create a reliable and sophisticated TOEFL question generation and analysis system.