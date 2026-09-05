# Day 27 — TTL Engine

**Timebox:** 90 minutes  
**Files:** `projects/mini-redis/internal/storage/ttl.go`, `projects/mini-redis/internal/storage/storage_test.go`

Add `Expire(key, duration)` and `TTL(key)` plus lazy expiration: reads check expiry and delete expired keys. Decide sentinel results for missing keys and keys without expiration, and whether overwriting a key preserves TTL.

Test immediate expiry, no expiry, extending/replacing expiry, delete/overwrite interactions, and lazy removal. Optional after the core works: background cleanup with a clean shutdown path.

