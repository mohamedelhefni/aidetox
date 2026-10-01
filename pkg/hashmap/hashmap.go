// Package hashmap is the Day 4–5 separate-chaining hash table exercise.
package hashmap

type Table[V any] struct{}

func New[V any]() *Table[V]                          { panic("TODO") }
func (h *Table[V]) Set(key string, value V)          { panic("TODO") }
func (h *Table[V]) Get(key string) (V, bool)         { panic("TODO") }
func (h *Table[V]) Delete(key string) bool           { panic("TODO") }
func (h *Table[V]) Contains(key string) bool         { panic("TODO") }
func (h *Table[V]) Len() int                         { panic("TODO") }
func (h *Table[V]) Range(yield func(string, V) bool) { panic("TODO") }
