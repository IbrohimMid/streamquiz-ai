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
		`CREATE TABLE IF NOT EXISTS questions (
			id TEXT PRIMARY KEY,
			skill_id TEXT NOT NULL,
			section TEXT NOT NULL,
			question_type TEXT,
			text TEXT NOT NULL,
			options JSONB NOT NULL,
			correct_answer TEXT NOT NULL,
			explanation TEXT,
			source TEXT DEFAULT 'ai',
			difficulty TEXT DEFAULT 'medium',
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
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
