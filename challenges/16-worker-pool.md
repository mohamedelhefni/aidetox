# Day 16 — Worker Pool

**Timebox:** 90 minutes  
**Files:** `pkg/workerpool/pool.go`, `pkg/workerpool/pool_test.go`

Implement `NewPool(workers int)`, `Submit(job)`, `Start()`, and `Stop()` using goroutines, channels, and `sync.WaitGroup`. Define whether submit blocks and what calls are legal before start or after stop.

Test every accepted job runs once, worker concurrency is bounded, shutdown drains or cancels according to your contract, and repeated lifecycle calls behave predictably. Run `go test -race ./...` and check for goroutine leaks.

