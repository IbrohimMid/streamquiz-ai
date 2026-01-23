# AI Integration Phase 2: Advanced Services Implementation Plan

## Overview
This plan details the implementation of Phase 2 AI services for the StreamQuiz AI application, building upon the completed Phase 1 infrastructure. Phase 2 focuses on advanced AI capabilities including content generation, grammar analysis, and writing evaluation.

## Current Status
- ✅ Phase 1 Complete: Core infrastructure, validation, caching, and basic question generation
- 🚧 Phase 2 Pending: Content generation, grammar analysis, writing evaluation

## Phase 2 Services Architecture

### Service Components
```
backend/internal/service/
├── content_generation.go      # Blog posts, cheat sheets, examples
├── grammar_analysis.go        # Error detection and correction
├── writing_evaluation.go      # Essay scoring and feedback
├── embedding.go              # Vector embeddings for semantic search
└── advanced_prompts.go       # Enhanced prompt engineering
```

## 1. Content Generation Service

### Objectives
- Generate educational content (blog posts, cheat sheets, guided examples)
- Create skill-specific learning materials
- Provide comprehensive explanations and examples

### Implementation Details

#### 1.1 Service Structure
**Location**: `backend/internal/service/content_generation.go`

```go
type ContentGenerationService struct {
    aiClient    *OpenRouterClient
    cache       *RedisQuestionCache
    validator   *ContentValidator
    logger      *zap.Logger
}

type ContentRequest struct {
    SkillID     string `json:"skillId"`
    Section     string `json:"section"`
    ContentType string `json:"contentType"` // "blog", "cheatsheet", "examples"
    Difficulty  string `json:"difficulty"`
}

type ContentResponse struct {
    Title       string                 `json:"title"`
    Content     string                 `json:"content"`
    Metadata    map[string]interface{} `json:"metadata"`
    Examples    []Example              `json:"examples,omitempty"`
    CheatSheet  *CheatSheet           `json:"cheatSheet,omitempty"`
}
```

#### 1.2 Content Types

##### Blog Post Generation
```go
func (s *ContentGenerationService) GenerateBlogPost(req ContentRequest) (*BlogPost, error) {
    prompt := s.buildBlogPrompt(req.SkillID, req.Section)
    response, err := s.aiClient.ChatCompletion(context.Background(), []ChatMessage{
        {Role: "system", Content: "You are an expert TOEFL instructor writing educational blog posts."},
        {Role: "user", Content: prompt},
    })
    // Process and validate response
}
```

**Prompt Template**:
```
Write a comprehensive blog post about [SKILL] in TOEFL [SECTION].
Include:
- Clear explanation of the concept
- 3-5 practical examples
- Common mistakes and how to avoid them
- Practice tips
- Difficulty: [LEVEL]

Format as JSON with title, content, and examples array.
```

##### Cheat Sheet Generation
```go
type CheatSheet struct {
    Rules       []string               `json:"rules"`
    Examples    []string               `json:"examples"`
    CommonErrors []string              `json:"commonErrors"`
    QuickTips   []string               `json:"quickTips"`
    VisualMap   string                 `json:"visualMap,omitempty"`
}
```

**Prompt Template**:
```
Create a concise cheat sheet for TOEFL [SKILL] focusing on [SECTION].
Include:
- 5-7 key rules
- 3 examples per rule
- 3 common errors
- 3 quick tips

Return as structured JSON.
```

##### Guided Examples Generation
```go
type Example struct {
    Scenario    string   `json:"scenario"`
    Question    string   `json:"question"`
    Solution    string   `json:"solution"`
    Explanation string   `json:"explanation"`
    Difficulty  string   `json:"difficulty"`
    Tips        []string `json:"tips"`
}
```

#### 1.3 API Endpoints
```
POST /api/content/generate
- Generate educational content
- Body: ContentRequest
- Response: ContentResponse

GET /api/content/:skillId/:type
- Retrieve cached content
- Query params: section, difficulty
```

#### 1.4 Caching Strategy
- Cache content for 24 hours
- Key format: `content:{skillId}:{section}:{type}:{difficulty}`
- Invalidate on content updates

#### 1.5 Validation
```go
type ContentValidator struct {
    minLength      int
    requiredFields []string
    qualityChecks  []QualityCheck
}

func (v *ContentValidator) Validate(content ContentResponse) ValidationResult {
    // Check content length, structure, educational value
}
```

## 2. Grammar Analysis Service

### Objectives
- Detect grammatical errors in user responses
- Provide detailed correction feedback
- Explain grammar rules and patterns
- Support multiple error types

### Implementation Details

#### 2.1 Service Structure
**Location**: `backend/internal/service/grammar_analysis.go`

```go
type GrammarAnalysisService struct {
    aiClient      *OpenRouterClient
    heuristicEngine *HeuristicEngine
    ruleEngine    *GrammarRuleEngine
    cache         *RedisQuestionCache
}

type GrammarAnalysisRequest struct {
    Text           string `json:"text"`
    Context        string `json:"context,omitempty"` // Original question/passage
    ErrorType      string `json:"errorType,omitempty"` // If known
    UserLevel      string `json:"userLevel"`
}

type GrammarAnalysisResponse struct {
    Errors         []GrammarError     `json:"errors"`
    Corrections    []Correction       `json:"corrections"`
    Suggestions    []string           `json:"suggestions"`
    OverallScore   float64            `json:"overallScore"`
    RuleExplanations []RuleExplanation `json:"ruleExplanations"`
}
```

#### 2.2 Error Detection Types

##### Primary AI-Based Analysis
```go
func (s *GrammarAnalysisService) AnalyzeText(req GrammarAnalysisRequest) (*GrammarAnalysisResponse, error) {
    prompt := s.buildAnalysisPrompt(req)
    response, err := s.aiClient.ChatCompletion(context.Background(), []ChatMessage{
        {Role: "system", Content: "You are an expert TOEFL grammar analyzer."},
        {Role: "user", Content: prompt},
    })
    // Process response and apply heuristics
}
```

**Analysis Prompt Template**:
```
Analyze this TOEFL response for grammatical errors:

Text: "[USER_TEXT]"
Context: "[QUESTION/PASSAGE]"

Identify:
1. Subject-verb agreement errors
2. Tense inconsistencies
3. Article usage errors
4. Preposition errors
5. Word form errors
6. Parallel structure issues

For each error, provide:
- Error type
- Incorrect text
- Correction
- Grammar rule explanation
- Example of correct usage

Return as structured JSON.
```

##### Heuristic Fallback System
```go
type HeuristicEngine struct {
    patterns []GrammarPattern
}

type GrammarPattern struct {
    Pattern     *regexp.Regexp
    ErrorType   string
    Confidence  float64
    Correction  string
    Explanation string
}

func (h *HeuristicEngine) DetectErrors(text string) []HeuristicError {
    // Apply regex patterns for common errors
}
```

#### 2.3 Grammar Rules Database
```go
type GrammarRule struct {
    ID          string
    Name        string
    Description string
    Examples    []RuleExample
    Difficulty  string
    Category    string
}

type RuleExample struct {
    Incorrect string
    Correct   string
    Explanation string
}
```

#### 2.4 API Endpoints
```
POST /api/grammar/analyze
- Analyze text for grammar errors
- Body: GrammarAnalysisRequest
- Response: GrammarAnalysisResponse

GET /api/grammar/rules
- Get grammar rules database
- Query params: category, difficulty

POST /api/grammar/feedback
- Get detailed feedback on specific error
- Body: {errorId, userText, ruleId}
```

## 3. Writing Evaluation Service

### Objectives
- Score TOEFL writing responses (1.0-6.0 scale)
- Provide detailed feedback on organization, grammar, development
- Generate improvement suggestions
- Support both integrated and independent writing tasks

### Implementation Details

#### 3.1 Service Structure
**Location**: `backend/internal/service/writing_evaluation.go`

```go
type WritingEvaluationService struct {
    aiClient    *OpenRouterClient
    rubric      *TOEFLRubric
    cache       *RedisQuestionCache
    analyzer    *GrammarAnalysisService
}

type WritingEvaluationRequest struct {
    Essay       string `json:"essay"`
    TaskType    string `json:"taskType"` // "integrated", "independent"
    Topic       string `json:"topic"`
    TimeLimit   int    `json:"timeLimit,omitempty"` // minutes
}

type WritingEvaluationResponse struct {
    Score       float64             `json:"score"`
    Breakdown   ScoreBreakdown      `json:"breakdown"`
    Feedback    DetailedFeedback    `json:"feedback"`
    Suggestions []ImprovementSuggestion `json:"suggestions"`
    Rubric      RubricEvaluation   `json:"rubric"`
}
```

#### 3.2 TOEFL Scoring Rubric
```go
type TOEFLRubric struct {
    Criteria []Criterion
}

type Criterion struct {
    Name        string
    Weight      float64
    Levels      []ScoreLevel
}

type ScoreLevel struct {
    Score       float64
    Description string
    Indicators  []string
}
```

**Scoring Criteria**:
1. **Task Fulfillment** (25%): How well the response addresses the task
2. **Organization** (20%): Logical structure and coherence
3. **Grammar** (25%): Accuracy and range of grammar structures
4. **Vocabulary** (15%): Word choice and range
5. **Development** (15%): Idea development and support

#### 3.3 Evaluation Process
```go
func (s *WritingEvaluationService) EvaluateEssay(req WritingEvaluationRequest) (*WritingEvaluationResponse, error) {
    // Step 1: Basic analysis
    basicAnalysis := s.performBasicAnalysis(req.Essay)

    // Step 2: AI-powered detailed evaluation
    aiEvaluation := s.performAIEvaluation(req)

    // Step 3: Grammar analysis integration
    grammarIssues := s.analyzer.AnalyzeText(GrammarAnalysisRequest{
        Text: req.Essay,
        Context: req.Topic,
    })

    // Step 4: Combine and score
    return s.combineEvaluations(basicAnalysis, aiEvaluation, grammarIssues)
}
```

**Evaluation Prompt Template**:
```
Evaluate this TOEFL [TASK_TYPE] writing response:

Topic: "[TOPIC]"
Essay: "[ESSAY_TEXT]"

Score on a scale of 1.0-6.0 for each criterion:
1. Task Fulfillment
2. Organization
3. Grammar
4. Vocabulary
5. Development

Provide:
- Overall score
- Criterion scores with explanations
- Specific strengths
- Areas for improvement
- Detailed feedback with examples

Return as structured JSON.
```

#### 3.4 Feedback Generation
```go
type DetailedFeedback struct {
    Strengths       []string           `json:"strengths"`
    Weaknesses      []string           `json:"weaknesses"`
    CriterionFeedback map[string]string `json:"criterionFeedback"`
    Examples        []FeedbackExample  `json:"examples"`
}

type FeedbackExample struct {
    Type        string `json:"type"` // "good", "needs_improvement"
    Text        string `json:"text"`
    Explanation string `json:"explanation"`
    Suggestion  string `json:"suggestion"`
}
```

#### 3.5 API Endpoints
```
POST /api/writing/evaluate
- Evaluate writing response
- Body: WritingEvaluationRequest
- Response: WritingEvaluationResponse

GET /api/writing/rubric
- Get TOEFL scoring rubric
- Response: TOEFLRubric

POST /api/writing/feedback
- Get additional feedback on specific aspects
- Body: {essayId, focusArea}
```

## 4. Vector Embeddings Service

### Objectives
- Enable semantic search capabilities
- Support content similarity matching
- Improve question retrieval accuracy

### Implementation Details

#### 4.1 Service Structure
**Location**: `backend/internal/service/embedding.go`

```go
type EmbeddingService struct {
    aiClient    *OpenRouterClient
    cache       *RedisQuestionCache
    dimension   int
}

func (s *EmbeddingService) GenerateEmbedding(text string) ([]float32, error) {
    // Use OpenRouter embedding model
}

func (s *EmbeddingService) CalculateSimilarity(a, b []float32) float64 {
    // Cosine similarity calculation
}
```

#### 4.2 Integration Points
- Question similarity for duplicate detection
- Content-based question retrieval
- User performance pattern analysis

## Implementation Timeline

### Week 1-2: Content Generation Service
- [ ] Implement ContentGenerationService
- [ ] Create blog post generation
- [ ] Add cheat sheet generation
- [ ] Implement guided examples
- [ ] Add validation and caching
- [ ] Create API endpoints
- [ ] Update frontend integration

### Week 3-4: Grammar Analysis Service
- [ ] Implement GrammarAnalysisService
- [ ] Build heuristic engine
- [ ] Create grammar rules database
- [ ] Add AI-powered analysis
- [ ] Implement feedback generation
- [ ] Create API endpoints
- [ ] Add frontend components

### Week 5-6: Writing Evaluation Service
- [ ] Implement WritingEvaluationService
- [ ] Create TOEFL rubric system
- [ ] Build evaluation pipeline
- [ ] Add detailed feedback generation
- [ ] Implement scoring algorithms
- [ ] Create API endpoints
- [ ] Build writing interface

### Week 7-8: Integration and Testing
- [ ] Integrate all services
- [ ] Add comprehensive testing
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation updates
- [ ] User acceptance testing

## Dependencies and Prerequisites

### Technical Requirements
- OpenRouter API access with embedding models
- Redis for caching
- PostgreSQL for data persistence
- Updated Go dependencies for new services

### Data Requirements
- Grammar rules database population
- TOEFL rubric calibration data
- Content templates and examples
- Validation test cases

## Success Metrics

### Functional Metrics
- Content generation accuracy > 90%
- Grammar error detection precision > 85%
- Writing evaluation inter-rater reliability > 0.80
- Response time < 3 seconds for analysis

### Quality Metrics
- User satisfaction scores > 4.0/5.0
- Educational value assessment
- Reduction in common errors
- Improvement in writing scores

## Risk Mitigation

### Technical Risks
- **AI API Reliability**: Implement fallback strategies and caching
- **Performance**: Optimize with batch processing and smart caching
- **Accuracy**: Combine AI with rule-based systems

### Operational Risks
- **Data Quality**: Implement validation and human review processes
- **Scalability**: Design for horizontal scaling
- **Maintenance**: Create comprehensive monitoring and logging

## Testing Strategy

### Unit Testing
- Service layer testing with mocks
- AI response parsing validation
- Scoring algorithm verification

### Integration Testing
- End-to-end service workflows
- API endpoint testing
- Frontend integration testing

### Quality Assurance
- Human evaluation of AI outputs
- Comparative analysis with existing systems
- User feedback collection and analysis

This implementation plan provides a comprehensive roadmap for Phase 2 AI services, ensuring robust, scalable, and educationally valuable features for the StreamQuiz AI platform.