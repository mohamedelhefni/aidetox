# Day 5 — Hash Table Improvements

**Timebox:** 90 minutes  
**Files:** `pkg/hashmap/hashmap.go`, `pkg/hashmap/hashmap_test.go`, `pkg/hashmap/hashmap_bench_test.go`

Improve Day 4 rather than starting over. Add generic values, iteration/range behavior, better resizing if needed, and benchmarks against `map[string]string`.

Define what happens if iteration observes mutation. Benchmark comparable workloads with allocations reported via `-benchmem`; explain the major reasons Go's built-in map wins.

