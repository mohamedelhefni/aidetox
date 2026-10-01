// Package priorityqueue is the Day 8 exercise built on pkg/heap.
package priorityqueue

type Item[T any] struct {
	Value    T
	Priority int
}

type Queue[T any] struct{}

func New[T any]() *Queue[T]                       { panic("TODO") }
func (q *Queue[T]) Enqueue(value T, priority int) { panic("TODO") }
func (q *Queue[T]) Dequeue() (Item[T], bool)      { panic("TODO") }
func (q *Queue[T]) Peek() (Item[T], bool)         { panic("TODO") }
func (q *Queue[T]) Len() int                      { panic("TODO") }
