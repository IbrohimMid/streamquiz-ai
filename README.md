# StreamQuiz AI

An AI-powered TOEFL preparation application that generates personalized quiz questions using advanced language models. The app features a React frontend, Go backend, and PostgreSQL database for a comprehensive learning experience.

## Features

- **AI-Generated Questions**: Dynamic TOEFL questions generated using OpenRouter API with skill-specific prompts
- **Hybrid Question Sources**: Combines AI-generated, database-stored, and static questions
- **Multiple Sections**: Structure, Listening, Reading, and Writing practice
- **Interactive Quizzes**: Real-time quiz sessions with progress tracking
- **Dashboard**: User progress, streaks, XP, and achievements
- **Mobile-Responsive**: Optimized for both desktop and mobile devices
- **Streaming Generation**: Real-time question generation with progress updates
- **Caching Layer**: Redis-based caching for improved performance
- **Database Persistence**: PostgreSQL storage with repository pattern
- **Question Validation**: Quality scoring and validation systems
- **User Progress Tracking**: Difficulty adaptation and performance analytics

## Architecture

- **Frontend**: React 19 with TypeScript, Vite build tool
- **Backend**: Go with Gin framework, repository pattern, and service layer
- **Database**: PostgreSQL with pgx driver
- **Cache**: Redis for question caching and performance optimization
- **AI Integration**: OpenRouter API for LLM-powered question generation
- **Streaming**: Real-time question generation with WebSocket-like streaming

## Prerequisites

- Node.js (v18 or higher)
- Go (v1.21 or higher)
- PostgreSQL
- Redis (for caching)
- OpenRouter API key

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Backend dependencies are managed via Go modules
cd backend
go mod tidy
cd ..
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/streamquiz?sslmode=disable
```

### 3. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
createdb streamquiz
```

Run database migrations (if available) or set up tables manually based on the schema in `plans/database-optimization-plan.md`.

### 4. Run the Application

#### Option 1: Run Frontend and Backend Separately

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend
npm run dev:backend
```

#### Option 2: Run Both Concurrently

```bash
npm run dev:all
```

The frontend will be available at `http://localhost:5173` and backend at `http://localhost:8080`.

## Project Structure

```
streamquiz-ai/
├── backend/                 # Go backend
│   ├── cmd/server/         # Server entry point
│   ├── internal/
│   │   ├── database/       # Database connections
│   │   ├── questions/      # Question generation logic
│   │   ├── service/        # AI and prompt services
│   │   └── manager/        # Quiz session management
│   └── go.mod
├── src/                    # React frontend
│   ├── components/         # Shared UI components
│   ├── features/           # Feature-specific components
│   │   ├── quiz/          # Quiz functionality
│   │   ├── dashboard/     # User dashboard
│   │   └── ...
│   └── ...
├── plans/                  # Development plans and documentation
├── package.json
└── README.md
```

## Current Status & Roadmap

### Implemented Features
- AI question generation using OpenRouter API with skill-specific prompts
- Hybrid question sourcing (AI + database + static)
- PostgreSQL database with repository pattern
- Redis caching for performance optimization
- Streaming question generation with progress tracking
- Question validation and quality scoring
- Quiz session management with user tracking
- Responsive UI with multiple views (dashboard, quiz, learning paths)
- User progress tracking with difficulty adaptation

### Planned Enhancements

#### Authentication System
- User registration and login
- Session-based authentication
- Password hashing with bcrypt
- Protected routes

#### Database Optimization (Partially Implemented)
- Basic schema with PostgreSQL and repository pattern ✓
- Question quality tracking and validation ✓
- Indexing on frequently queried columns ✓
- **Pending**: Gamification tables (XP, leaderboards, streaks)
- **Pending**: Comprehensive user progress tracking
- **Pending**: Migration versioning system
- **Pending**: Vector search capabilities
- **Pending**: Spaced repetition system

#### AI Integration Improvements (Phase 1 Complete, Phase 2 Planned)
- Enhanced prompt engineering with skill-specific strategies ✓
- Structured JSON output validation ✓
- Response caching with Redis ✓
- Retry logic with exponential backoff ✓
- Batch processing capabilities ✓
- **Phase 2 Plan**: See `plans/ai-phase2-implementation-plan.md` for detailed roadmap
  - Content generation (blog posts, cheat sheets, examples)
  - Grammar analysis and error correction
  - Writing evaluation with TOEFL scoring
  - Vector embeddings for semantic search

See `plans/` directory for detailed implementation plans.

## API Endpoints

- `POST /api/questions/hybrid` - Generate hybrid questions (AI + DB + static)
- `GET /api/quiz/next` - Get next question in session
- `POST /api/quiz/answer` - Submit answer and get feedback
- `GET /api/progress` - Get user progress and statistics
- `POST /api/questions/stream` - Stream question generation (WebSocket-like)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (when available)
5. Submit a pull request

## License

This project is private and proprietary.
