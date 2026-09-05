# Day 17 — Counting Semaphore

**Timebox:** 60 minutes  
**Files:** `pkg/semaphore/semaphore.go`, `pkg/semaphore/semaphore_test.go`

Implement `Acquire(ctx)` and `Release()` with a channel-backed permit count. Define construction rules and behavior for release without acquire.

Test that at most three workers enter a protected section, waiting acquisition respects context cancellation, and permits are reusable. Run the race detector.

