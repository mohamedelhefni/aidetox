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

Final path:

```text
TCP connection -> command parser -> engine -> WAL
                                  -> TTL checks
```

Document the final architecture, durability decisions, wire responses, and run instructions here on Day 30.

