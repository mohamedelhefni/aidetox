# Day 11 — Graph

**Timebox:** 75 minutes  
**Files:** `pkg/graph/graph.go`, `pkg/graph/graph_test.go`

Build a generic adjacency-list `Graph[T]` supporting `AddVertex`, `AddEdge`, `RemoveEdge`, and `Neighbors`, with a directed/undirected choice at construction.

Define duplicate-edge, self-edge, missing-vertex, and neighbor-order behavior. Test directed and undirected semantics and ensure callers cannot accidentally corrupt internal adjacency state.

