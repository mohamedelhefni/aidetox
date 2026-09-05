# Day 14 — Topological Sort

**Timebox:** 90 minutes  
**Files:** `pkg/graph/topological.go`, `pkg/graph/graph_test.go`

Implement dependency ordering for a directed graph and detect cycles. Choose Kahn's algorithm or DFS states and explain the invariant before coding.

Test a chain, a diamond, multiple independent components, no edges, and a cycle. Validate output by checking that every dependency appears before its dependent rather than asserting one arbitrary valid order.

