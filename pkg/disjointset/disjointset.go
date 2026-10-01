// Package disjointset is the Day 10 union-find exercise.
package disjointset

type Set[T comparable] struct{}

func New[T comparable](items ...T) *Set[T] { panic("TODO") }
func (s *Set[T]) Add(item T) bool          { panic("TODO") }
func (s *Set[T]) Find(item T) (T, bool)    { panic("TODO") }
func (s *Set[T]) Union(a, b T) bool        { panic("TODO") }
func (s *Set[T]) Connected(a, b T) bool    { panic("TODO") }
