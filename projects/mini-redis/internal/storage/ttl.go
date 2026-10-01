package storage

import "time"

const (
	MissingTTL      time.Duration = -2 * time.Second
	NoExpirationTTL time.Duration = -1 * time.Second
)

func (e *Engine) Expire(key string, ttl time.Duration) bool { panic("TODO") }
func (e *Engine) TTL(key string) time.Duration              { panic("TODO") }
