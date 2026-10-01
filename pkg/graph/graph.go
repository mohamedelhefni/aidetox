// Package graph contains the Day 11–14 graph exercises.
package graph

type Edge[T comparable] struct {
	To     T
	Weight int
}

type Graph[T comparable] struct{}

func New[T comparable](directed bool) *Graph[T] { panic("TODO") }
func (g *Graph[T]) AddVertex(vertex T) bool     { panic("TODO") }
func (g *Graph[T]) AddEdge(from, to T) bool     { panic("TODO") }
func (g *Graph[T]) AddWeightedEdge(from, to T, weight int) bool {
	panic("TODO")
}
func (g *Graph[T]) RemoveEdge(from, to T) bool       { panic("TODO") }
func (g *Graph[T]) Neighbors(vertex T) ([]T, bool)   { panic("TODO") }
func (g *Graph[T]) Edges(vertex T) ([]Edge[T], bool) { panic("TODO") }
