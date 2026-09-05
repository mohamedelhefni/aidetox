# Day 10 — Union-Find / Disjoint Set

**Timebox:** 60–90 minutes  
**Files:** `pkg/disjointset/disjointset.go`, `pkg/disjointset/disjointset_test.go`

Implement `Find`, `Union`, and `Connected`. First make a naive parent-based version correct; then add path compression and union by rank or size.

Test isolated elements, repeated/self unions, transitive connectivity, and multiple components. Capture the parent structure before and after compression so you can explain the optimization.

