# Day 1 — Doubly Linked List

**Timebox:** 75–90 minutes  
**Files:** `pkg/list/list.go`, `pkg/list/list_test.go`

Implement a generic `Node[T]` and list with `PushFront`, `PushBack`, `PopFront`, `PopBack`, `Remove`, `MoveToFront`, `MoveToBack`, `Front`, `Back`, and `Len`. Do not use `container/list`; aim for useful zero-value behavior.

Before coding, record the head/tail and `prev`/`next` invariants. Test empty and one-element lists, removing head/tail/middle, and moving head/tail. Every listed operation should be O(1).

