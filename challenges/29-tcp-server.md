# Day 29 — TCP Server

**Timebox:** 2 hours  
**Files:** `projects/mini-redis/internal/server/server.go`, `projects/mini-redis/internal/server/server_test.go`

Expose the engine over TCP using `net.Listen`, `net.Conn`, and buffered I/O. Support multiple clients concurrently and connect each request through parser, command dispatch, engine, and WAL.

Define line framing, responses, maximum request size, read/write deadlines if any, and graceful shutdown. Test multiple commands per connection, multiple concurrent clients, malformed commands, disconnects, and server shutdown under `go test -race`.

