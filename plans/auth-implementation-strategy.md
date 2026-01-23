# User Authentication Implementation Strategy

## Overview
Implement server-side session-based authentication for the streamquiz-ai application to enable user registration, login, and session management.

## Architecture
- **Backend**: Go with PostgreSQL database
- **Frontend**: React with TypeScript
- **Session Storage**: Database-backed sessions
- **Security**: Password hashing with bcrypt, secure session tokens

## Database Schema Changes

### Extend users table
```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;
```

### Create sessions table
```sql
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient token lookup
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Backend Implementation

### Dependencies
Add to `backend/go.mod`:
```
require golang.org/x/crypto v0.0.0
```

### Auth Service (`backend/internal/auth/service.go`)
- `Register(email, password, name)`: Hash password, create user
- `Login(email, password)`: Verify credentials, create session
- `Logout(sessionToken)`: Delete session
- `ValidateSession(sessionToken)`: Check if session exists and valid

### Session Management
- Generate cryptographically secure tokens using `crypto/rand`
- Store sessions in database with expiration (24 hours)
- Cleanup expired sessions periodically

### Middleware (`backend/internal/auth/middleware.go`)
- Extract session cookie from request
- Validate session against database
- Set user context for authenticated requests

### API Endpoints
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login and return session cookie
- `POST /api/auth/logout`: Logout and clear session
- `GET /api/auth/me`: Get current user info

## Frontend Implementation

### Auth Context (`src/contexts/AuthContext.tsx`)
- Manage authentication state
- Provide login/logout functions
- Handle session persistence

### Custom Hooks
- `useAuth()`: Access auth functions
- `useUser()`: Get current user data

### Components (`src/features/auth/`)
- `LoginForm.tsx`: Login form with validation
- `RegisterForm.tsx`: Registration form
- `AuthGuard.tsx`: Protect routes requiring authentication

### API Integration (`src/services/auth.ts`)
- `register(userData)`
- `login(credentials)`
- `logout()`
- `getCurrentUser()`

## Security Considerations
- Password hashing with bcrypt (cost 12)
- Secure session tokens (32 bytes, hex encoded)
- Session expiration (24 hours)
- CORS configured for credentials
- CSRF protection (if needed for forms)

## Integration Points
- Quiz sessions: Associate with user_id
- User progress: Track per user
- Protected routes: Require authentication

## Implementation Order
1. Database schema updates
2. Backend auth service and middleware
3. Auth API endpoints
4. Frontend auth context and hooks
5. Login/register forms
6. Integration with existing features
7. Testing and security audit

## Testing
- Unit tests for auth service
- Integration tests for API endpoints
- E2E tests for login/register flow
- Security testing (password cracking, session hijacking)

## Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Register/Login
    F->>B: POST /api/auth/register|login
    B->>DB: Validate/Create User
    B->>DB: Create Session
    B->>F: Set Session Cookie
    F->>U: Authenticated

    U->>F: Access Protected Route
    F->>B: Request with Cookie
    B->>DB: Validate Session
    B->>F: Authenticated Response