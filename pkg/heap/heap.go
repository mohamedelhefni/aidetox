// Package heap is the Day 7 binary min-heap exercise.
package heap

type Heap[T any] struct{}

func New[T any](less func(T, T) bool) *Heap[T] { panic("TODO") }
func (h *Heap[T]) Push(value T)                { panic("TODO") }
func (h *Heap[T]) Pop() (T, bool)              { panic("TODO") }
func (h *Heap[T]) Peek() (T, bool)             { panic("TODO") }
func (h *Heap[T]) Len() int                    { panic("TODO") }
