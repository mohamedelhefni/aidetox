# Day 2 — Ring Buffer

**Timebox:** 60–90 minutes  
**Files:** `pkg/ringbuffer/ringbuffer.go`, `pkg/ringbuffer/ringbuffer_test.go`

Implement `NewRingBuffer(capacity)`, `Push`, `Pop`, `Peek`, `Len`, `Cap`, `IsFull`, and `IsEmpty` using fixed storage, head/tail indexes, and modulo wrap-around. Popping must not move the remaining elements.

Decide and document behavior for zero capacity and pushing into a full buffer. Test repeated wrap-around, transitions between empty/full, capacity one, and retained references if `T` can hold pointers.

