// Package ratelimiter is the Day 18 token-bucket exercise.
package ratelimiter

import "context"

type Limiter struct{}

func New(rate float64, capacity int) (*Limiter, error) { panic("TODO") }
func (l *Limiter) Allow() bool                         { panic("TODO") }
func (l *Limiter) Wait(ctx context.Context) error      { panic("TODO") }
