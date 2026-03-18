package database

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// ConnectRedis creates a new Redis client and verifies the connection.
func ConnectRedis(addr, password string) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️  Redis connection failed: %v (caching will be disabled)", err)
		return nil
	}

	log.Println("✅ Connected to Redis")
	return rdb
}
