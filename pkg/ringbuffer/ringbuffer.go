// Package ringbuffer is the Day 2 circular queue exercise.
package ringbuffer

type RingBuffer[T any] struct{}

func New[T any](capacity int) *RingBuffer[T] { panic("TODO") }
func (r *RingBuffer[T]) Push(value T) bool   { panic("TODO") }
func (r *RingBuffer[T]) Pop() (T, bool)      { panic("TODO") }
func (r *RingBuffer[T]) Peek() (T, bool)     { panic("TODO") }
func (r *RingBuffer[T]) Len() int            { panic("TODO") }
func (r *RingBuffer[T]) Cap() int            { panic("TODO") }
func (r *RingBuffer[T]) IsFull() bool        { panic("TODO") }
func (r *RingBuffer[T]) IsEmpty() bool       { panic("TODO") }
