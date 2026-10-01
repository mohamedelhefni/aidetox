# Mini Redis

Built incrementally on Days 25–30.

Planned command set:

```text
SET key value
GET key
DEL key
EXISTS key
EXPIRE key seconds
TTL key
```

Line-based response contract used by the acceptance tests:

```text
SET                -> OK
GET existing       -> value
GET missing        -> (nil)
DEL / EXISTS       -> 1 or 0
EXPIRE              -> 1 or 0
TTL                 -> whole seconds, -1 persistent, -2 missing
malformed command   -> ERR followed by a useful message
```

`Stop`/`Close` operations should be safe and graceful. Mutating TCP commands must be appended and synced to the WAL before changing in-memory state.

Final path:

```text
TCP connection -> command parser -> engine -> WAL
                                  -> TTL checks
```

Document the final architecture, durability decisions, wire responses, and run instructions here on Day 30.
