# Day 26 — Key/Value Engine

**Timebox:** 2 hours  
**Files:** `projects/mini-redis/internal/storage/engine.go`, `projects/mini-redis/internal/storage/storage_test.go`

Implement an in-memory `Engine` with `Set`, `Get`, `Delete`, and `Exists`; do not add networking yet. Define missing-key return values and ownership/copying of values.

Test empty keys/values according to your contract, updates, deletes, missing keys, and concurrent access only if you intentionally promise it. Keep command parsing outside the engine.

