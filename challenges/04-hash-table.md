# Day 4 — Hash Table

**Timebox:** 2 hours  
**Files:** `pkg/hashmap/hashmap.go`, `pkg/hashmap/hashmap_test.go`

Implement a `string -> string` hash table with `Set`, `Get`, `Delete`, `Contains`, and `Len`. Do not use `map`. Use buckets with separate chaining and resize/rehash when load factor exceeds 0.75.

Write down how empty buckets, updates, collisions, and rehashing affect length. Test forced collisions, updating an existing key, missing deletes/lookups, and entries surviving multiple resizes.

