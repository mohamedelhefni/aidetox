// Package shardedmap is the Day 19 concurrent map exercise.
package shardedmap

type Map[V any] struct{}

func New[V any](shards int) (*Map[V], error) { panic("TODO") }
func (m *Map[V]) Get(key string) (V, bool)   { panic("TODO") }
func (m *Map[V]) Set(key string, value V)    { panic("TODO") }
func (m *Map[V]) Delete(key string) bool     { panic("TODO") }
func (m *Map[V]) Len() int                   { panic("TODO") }
