// Package bst is the Day 6 binary search tree exercise.
package bst

type Tree[T any] struct{}

func New[T any](less func(T, T) bool) *Tree[T] { panic("TODO") }
func (t *Tree[T]) Insert(value T) bool         { panic("TODO") }
func (t *Tree[T]) Search(value T) bool         { panic("TODO") }
func (t *Tree[T]) Delete(value T) bool         { panic("TODO") }
func (t *Tree[T]) Min() (T, bool)              { panic("TODO") }
func (t *Tree[T]) Max() (T, bool)              { panic("TODO") }
func (t *Tree[T]) InOrder() []T                { panic("TODO") }
func (t *Tree[T]) PreOrder() []T               { panic("TODO") }
func (t *Tree[T]) PostOrder() []T              { panic("TODO") }
