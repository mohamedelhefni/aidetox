# Day 3 — Dynamic Array

**Timebox:** 60–75 minutes  
**Files:** `pkg/dynarray/dynarray.go`, `pkg/dynarray/dynarray_test.go`

Pretend slices do not resize automatically. Implement `Append`, `Get`, `Set`, `Insert`, `Delete`, `Len`, and `Cap`. When full, allocate storage with twice the old capacity and copy elements using `copy`; shrinking is optional.

Choose behavior for invalid indexes and zero capacity. Test inserts/deletes at both ends and in the middle, several growth events, and preserved ordering. Be ready to explain why append is amortized O(1).

