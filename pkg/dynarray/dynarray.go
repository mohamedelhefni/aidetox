// Package dynarray is the Day 3 dynamic array exercise.
package dynarray

type Array[T any] struct{}

func New[T any](capacity int) *Array[T]            { panic("TODO") }
func (a *Array[T]) Append(value T)                 { panic("TODO") }
func (a *Array[T]) Get(index int) (T, bool)        { panic("TODO") }
func (a *Array[T]) Set(index int, value T) bool    { panic("TODO") }
func (a *Array[T]) Insert(index int, value T) bool { panic("TODO") }
func (a *Array[T]) Delete(index int) (T, bool)     { panic("TODO") }
func (a *Array[T]) Len() int                       { panic("TODO") }
func (a *Array[T]) Cap() int                       { panic("TODO") }
