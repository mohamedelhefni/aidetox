// Package semaphore is the Day 17 context-aware counting semaphore exercise.
package semaphore

import (
	"context"
	"errors"
)

var (
	ErrInvalidCapacity = errors.New("capacity must be positive")
	ErrOverRelease     = errors.New("release without acquire")
)

type Semaphore struct{}

func New(capacity int) (*Semaphore, error)             { panic("TODO") }
func (s *Semaphore) Acquire(ctx context.Context) error { panic("TODO") }
func (s *Semaphore) Release() error                    { panic("TODO") }
