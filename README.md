# 30-Day Go Rebuild Challenge

A six-week program with 30 coding days and two rest days per week. This repository is intentionally a scaffold: the implementation and tests are yours to write.

## Daily loop

1. Study the concept without reading Go implementation code (10–20 min).
2. Write the API, representation, invariants, edge cases, and complexities (10–15 min).
3. Implement with references closed (45–90 min).
4. Write and run your own tests (20–30 min).
5. Review other implementations only after your attempt (10–20 min).

Use AI for explanations, hints, edge-case prompts, and post-implementation review—not for solutions or tests. Investigate meaningful bugs for 30 minutes before asking for diagnosis.

## Schedule and files

| Day | Challenge | Work file |
|---:|---|---|
| 1 | [Doubly linked list](challenges/01-linked-list.md) | `pkg/list/list.go` |
| 2 | [Ring buffer](challenges/02-ring-buffer.md) | `pkg/ringbuffer/ringbuffer.go` |
| 3 | [Dynamic array](challenges/03-dynamic-array.md) | `pkg/dynarray/dynarray.go` |
| 4 | [Hash table](challenges/04-hash-table.md) | `pkg/hashmap/hashmap.go` |
| 5 | [Hash table improvements](challenges/05-hash-table-improvements.md) | `pkg/hashmap/hashmap.go` |
| 6 | [Binary search tree](challenges/06-bst.md) | `pkg/bst/bst.go` |
| 7 | [Binary heap](challenges/07-heap.md) | `pkg/heap/heap.go` |
| 8 | [Priority queue](challenges/08-priority-queue.md) | `pkg/priorityqueue/priorityqueue.go` |
| 9 | [Trie](challenges/09-trie.md) | `pkg/trie/trie.go` |
| 10 | [Union-find](challenges/10-union-find.md) | `pkg/disjointset/disjointset.go` |
| 11 | [Graph](challenges/11-graph.md) | `pkg/graph/graph.go` |
| 12 | [BFS and DFS](challenges/12-bfs-dfs.md) | `pkg/graph/traversal.go` |
| 13 | [Dijkstra](challenges/13-dijkstra.md) | `pkg/graph/dijkstra.go` |
| 14 | [Topological sort](challenges/14-topological-sort.md) | `pkg/graph/topological.go` |
| 15 | [LRU cache](challenges/15-lru-cache.md) | `pkg/lru/lru.go` |
| 16 | [Worker pool](challenges/16-worker-pool.md) | `pkg/workerpool/pool.go` |
| 17 | [Semaphore](challenges/17-semaphore.md) | `pkg/semaphore/semaphore.go` |
| 18 | [Rate limiter](challenges/18-rate-limiter.md) | `pkg/ratelimiter/ratelimiter.go` |
| 19 | [Concurrent sharded map](challenges/19-sharded-map.md) | `pkg/shardedmap/shardedmap.go` |
| 20 | [Pub/Sub](challenges/20-pubsub.md) | `pkg/pubsub/pubsub.go` |
| 21 | [Lexer](challenges/21-lexer.md) | `pkg/lexer/lexer.go` |
| 22 | [Expression parser](challenges/22-expression-parser.md) | `pkg/expression/parser.go` |
| 23 | [JSON parser](challenges/23-json-parser.md) | `pkg/jsonparser/parser.go` |
| 24 | [Binary serialization](challenges/24-serialization.md) | `pkg/wire/codec.go` |
| 25 | [Command parser](challenges/25-command-parser.md) | `projects/mini-redis/internal/protocol/command.go` |
| 26 | [Key/value engine](challenges/26-kv-engine.md) | `projects/mini-redis/internal/storage/engine.go` |
| 27 | [TTL engine](challenges/27-ttl-engine.md) | `projects/mini-redis/internal/storage/ttl.go` |
| 28 | [Write-ahead log](challenges/28-wal.md) | `projects/mini-redis/internal/storage/wal.go` |
| 29 | [TCP server](challenges/29-tcp-server.md) | `projects/mini-redis/internal/server/server.go` |
| 30 | [Mini Redis integration](challenges/30-mini-redis.md) | `projects/mini-redis/cmd/server/main.go` |

## Commands

```bash
go test ./...
go test -race ./...
go test -bench=. -benchmem ./...
```

Copy the entry in [`docs/DAY_TEMPLATE.md`](docs/DAY_TEMPLATE.md) into [`PROGRESS.md`](PROGRESS.md) after each coding day.

