// Package workerpool is the Day 16 concurrency exercise.
package workerpool

import "errors"

var (
	ErrInvalidWorkerCount = errors.New("worker count must be positive")
	ErrNotStarted         = errors.New("pool is not started")
	ErrStopped            = errors.New("pool is stopped")
)

type Job func()

type Pool struct{}

func NewPool(workers int) (*Pool, error) { panic("TODO") }
func (p *Pool) Start() error             { panic("TODO") }
func (p *Pool) Submit(job Job) error     { panic("TODO") }
func (p *Pool) Stop() error              { panic("TODO") }
