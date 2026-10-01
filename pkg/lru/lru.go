// Package lru is the Day 15 cache exercise built on your list and hash table.
package lru

type Cache[V any] struct{}

func New[V any](capacity int) *Cache[V]      { panic("TODO") }
func (c *Cache[V]) Get(key string) (V, bool) { panic("TODO") }
func (c *Cache[V]) Put(key string, value V)  { panic("TODO") }
func (c *Cache[V]) Delete(key string) bool   { panic("TODO") }
func (c *Cache[V]) Len() int                 { panic("TODO") }
