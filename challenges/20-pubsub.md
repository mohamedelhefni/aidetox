# Day 20 — In-Memory Pub/Sub

**Timebox:** 2 hours  
**Files:** `pkg/pubsub/pubsub.go`, `pkg/pubsub/pubsub_test.go`

Implement `Subscribe(topic)`, `Publish(topic, msg)`, and `Unsubscribe(topic)`. Before coding, decide the slow-subscriber policy, whether publish blocks, how disconnection works, and who owns channel closure.

Test multiple topics/subscribers, unsubscribe during publish, slow subscribers, repeated unsubscribe, and shutdown if you add it. Run the race detector; never send on a channel that another goroutine may close.

