package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"streamquiz-backend/internal/questions"
	"time"

	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

type RedisQuestionCache struct {
	client *redis.Client
	logger *zap.Logger
	ttl    time.Duration
	prefix string
}

func NewRedisQuestionCache(client *redis.Client, logger *zap.Logger) *RedisQuestionCache {
	return &RedisQuestionCache{
		client: client,
		logger: logger,
		ttl:    1 * time.Hour, // Default TTL
		prefix: "streamquiz",
	}
}

func (r *RedisQuestionCache) key(skillID string, limit int, excludeUsed bool) string {
	return fmt.Sprintf("%s:skill:%s:%d:%t", r.prefix, skillID, limit, excludeUsed)
}

func (r *RedisQuestionCache) Get(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]questions.Question, bool) {
	if r == nil || r.client == nil {
		return nil, false
	}
	val, err := r.client.Get(ctx, r.key(skillID, limit, excludeUsed)).Result()
	if err != nil {
		return nil, false
	}
	var qs []questions.Question
	if err := json.Unmarshal([]byte(val), &qs); err != nil {
		return nil, false
	}
	return qs, true
}

func (r *RedisQuestionCache) Set(ctx context.Context, skillID string, limit int, excludeUsed bool, qs []questions.Question) {
	if r == nil || r.client == nil {
		return
	}
	b, err := json.Marshal(qs)
	if err != nil {
		return
	}
	if err := r.client.Set(ctx, r.key(skillID, limit, excludeUsed), b, r.ttl).Err(); err != nil && r.logger != nil {
		r.logger.Warn("[redis] cache set failed", zap.Error(err))
	}
}

func (r *RedisQuestionCache) InvalidateSkill(ctx context.Context, skillID string) {
	if r == nil || r.client == nil {
		return
	}
	iter := r.client.Scan(ctx, 0, fmt.Sprintf("%s:skill:%s:*", r.prefix, skillID), 50).Iterator()
	for iter.Next(ctx) {
		r.client.Del(ctx, iter.Val())
	}
}
