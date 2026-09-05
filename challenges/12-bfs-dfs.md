# Day 12 — BFS and DFS

**Timebox:** 75 minutes  
**Files:** `pkg/graph/traversal.go`, `pkg/graph/graph_test.go`

Using Day 11's graph, implement `BFS(start)`, `DFS(start)`, and `PathExists(a, b)`. Trace a small graph by hand, recording the queue/stack, visited set, and current node before coding.

Test cycles, disconnected vertices, self paths, missing starts, and deterministic traversal if your graph promises neighbor order. Each traversal should be O(V + E).

