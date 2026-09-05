# Day 15 — LRU Cache

**Timebox:** 2 hours  
**Files:** `pkg/lru/lru.go`, `pkg/lru/lru_test.go`

Reuse your hash table and doubly linked list to implement `Get`, `Put`, `Delete`, and `Len` with O(1) targets. Keep the most recently used item at one documented end of the list.

Test zero/one capacity, updates, reads changing recency, eviction order, deletes, and repeated churn. After every mutation, validate that map/list lengths agree and every indexed node belongs to the list.

