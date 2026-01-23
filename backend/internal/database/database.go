package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
)

var Pool *pgxpool.Pool

func Init() {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		// Default to localhost for dev
		dbUrl = "postgres://postgres:postgres@localhost:5432/streamquiz?sslmode=disable"
		log.Println("DATABASE_URL not set, using default:", dbUrl)
	}

	config, err := pgxpool.ParseConfig(dbUrl)
	if err != nil {
		log.Fatalf("Unable to parse database config: %v\n", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	Pool, err = pgxpool.ConnectConfig(ctx, config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	log.Println("Connected to PostgreSQL successfully.")

	// Auto Migrate
	Migrate()
}

func Migrate() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email TEXT UNIQUE NOT NULL,
			name TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS quiz_sessions (
			id TEXT PRIMARY KEY,
			user_id UUID REFERENCES users(id),
			topic TEXT NOT NULL,
			section TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		// New Schema
		`CREATE TABLE IF NOT EXISTS passages (
		    id TEXT PRIMARY KEY,
		    text TEXT NOT NULL,
		    topic TEXT,
		    created_at TIMESTAMPTZ DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS question_bank (
		    id TEXT PRIMARY KEY,
		    skill_id TEXT NOT NULL,
		    section TEXT,
		    question_text TEXT NOT NULL,
		    options JSONB,
		    correct_answer TEXT,
		    explanation TEXT,
		    source TEXT,
		    passage_id TEXT REFERENCES passages(id),
		    type TEXT,
		    difficulty TEXT,
		    used_at TIMESTAMPTZ,
		    quality_score DECIMAL(4,3),
		    times_served INTEGER DEFAULT 0,
		    correct_count INTEGER DEFAULT 0,
		    content_hash TEXT,
		    is_verified BOOLEAN DEFAULT FALSE,
		    updated_at TIMESTAMPTZ DEFAULT NOW(),
		    created_at TIMESTAMPTZ DEFAULT NOW()
		);`,
		// Add indexes if possible, though strict SQL block here is simpler.
		`CREATE INDEX IF NOT EXISTS idx_question_bank_skill_id ON question_bank(skill_id);`,
	}

	for _, query := range queries {
		_, err := Pool.Exec(context.Background(), query)
		if err != nil {
			log.Fatalf("Migration failed: %v\nQuery: %s", err, query)
		}
	}
	log.Println("Database migrations applied.")
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
