# Day 24 — Tiny Binary Serialization Format

**Timebox:** 90 minutes  
**Files:** `pkg/wire/codec.go`, `pkg/wire/codec_test.go`

Design a format such as one type byte, four payload-length bytes, then N payload bytes. Implement `Encode(Message)` and `Decode([]byte)` using `encoding/binary`.

Specify byte order, valid types, maximum payload, and trailing-byte behavior. Test round trips, empty/binary payloads, truncated headers/payloads, declared-length overflow, unknown types, and oversized input.

