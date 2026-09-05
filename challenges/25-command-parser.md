# Day 25 — Command Parser

**Timebox:** 90 minutes  
**Files:** `projects/mini-redis/internal/protocol/command.go`, `projects/mini-redis/internal/protocol/command_test.go`

Parse commands such as `SET name Mohamed`, `GET name`, `DEL name`, and `EXPIRE name 60` into a `Command` with `Name` and `Args`.

Define whitespace, case, quoting, arity, integer, and unknown-command behavior. Test blank/malformed input, extra/missing arguments, value spacing if supported, and useful errors. Keep the parser independent from storage.

