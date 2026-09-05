# Day 30 — Mini Redis Integration

**Timebox:** 2–3 hours  
**Files:** `projects/mini-redis/cmd/server/main.go`, `projects/mini-redis/README.md`

Wire the finished parser, engine, TTL, WAL, and TCP server together. Required commands are `SET`, `GET`, `DEL`, `EXISTS`, `EXPIRE`, and `TTL`; include concurrent TCP clients and WAL recovery. Do not add a major new feature today.

Run:

```bash
go test ./...
go test -race ./...
go test -bench=. -benchmem ./...
```

Manually verify with `nc`, restart to check recovery, and finish the project README with run instructions, protocol responses, architecture, and known limits. LRU eviction, Pub/Sub, rate limiting, and metrics remain optional.

