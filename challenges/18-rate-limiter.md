# Day 18 — Token-Bucket Rate Limiter

**Timebox:** 90–120 minutes  
**Files:** `pkg/ratelimiter/ratelimiter.go`, `pkg/ratelimiter/ratelimiter_test.go`

Implement `Allow() bool` and `Wait(ctx) error` using a token bucket with a rate, capacity, current token count, and refill over elapsed time.

Specify initial tokens, fractional refill, thread safety, invalid rates/capacities, and cancellation. Test bursts up to capacity and eventual refill without timing-flaky assertions; an injectable clock is acceptable if you find real-time tests unreliable.

