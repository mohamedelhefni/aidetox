# Day 7 — Binary Min-Heap

**Timebox:** 90 minutes  
**Files:** `pkg/heap/heap.go`, `pkg/heap/heap_test.go`

Implement generic `Push`, `Pop`, `Peek`, and `Len` over a slice. Use index arithmetic for parent, left child, and right child; do not create tree nodes.

Record the min-heap invariant, then implement bubble-up and bubble-down. Test empty/single heaps, duplicates, ascending/descending insertion, and that every pop produces sorted order. Push and pop should be O(log n); peek O(1).

