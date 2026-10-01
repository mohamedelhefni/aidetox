package graph

import "errors"

var ErrCycle = errors.New("graph contains a cycle")

func (g *Graph[T]) TopologicalSort() ([]T, error) { panic("TODO") }
