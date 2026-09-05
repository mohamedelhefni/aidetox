# Day 19 — Concurrent Sharded Map

**Timebox:** 90 minutes  
**Files:** `pkg/shardedmap/shardedmap.go`, `pkg/shardedmap/shardedmap_test.go`, `pkg/shardedmap/shardedmap_bench_test.go`

Implement `Get`, `Set`, `Delete`, and `Len` across N hash-selected shards, each protected by an `RWMutex`. Also create a one-global-mutex version for comparison.

Define valid shard counts and a safe strategy for `Len`. Test concurrent readers/writers with `go test -race`, then benchmark both lock designs under comparable contention.

