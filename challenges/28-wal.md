# Day 28 — Write-Ahead Log

**Timebox:** 2 hours  
**Files:** `projects/mini-redis/internal/storage/wal.go`, `projects/mini-redis/internal/storage/storage_test.go`

Before mutating memory, append the command to disk, sync it, then apply it. On startup, replay the append-only log to restore state. Study append-only logs, crash recovery, `fsync`, and partial final records first.

Define record framing and escaping—reuse Day 24 if appropriate. Test replay, ordering, deletes, restart recovery, partial/corrupt records, failed append/sync without memory mutation, and file closure. Use temporary directories in tests.

