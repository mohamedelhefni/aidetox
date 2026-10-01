// Package storage contains the mini Redis engine, TTL logic, and WAL.
package storage

type Engine struct{}

func NewEngine() *Engine                        { panic("TODO") }
func (e *Engine) Set(key, value string)         { panic("TODO") }
func (e *Engine) Get(key string) (string, bool) { panic("TODO") }
func (e *Engine) Delete(key string) bool        { panic("TODO") }
func (e *Engine) Exists(key string) bool        { panic("TODO") }
