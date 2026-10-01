package hashmap

import (
	"strconv"
	"testing"
)

func BenchmarkTableSet(b *testing.B) {
	h := New[int]()
	b.ReportAllocs()
	for i := range b.N {
		h.Set(strconv.Itoa(i%1_000), i)
	}
}

func BenchmarkBuiltinMapSet(b *testing.B) {
	h := make(map[string]int)
	b.ReportAllocs()
	for i := range b.N {
		h[strconv.Itoa(i%1_000)] = i
	}
}

func BenchmarkTableGet(b *testing.B) {
	h := New[int]()
	for i := range 1_000 {
		h.Set(strconv.Itoa(i), i)
	}
	b.ReportAllocs()
	b.ResetTimer()
	for i := range b.N {
		h.Get(strconv.Itoa(i % 1_000))
	}
}

func BenchmarkBuiltinMapGet(b *testing.B) {
	h := make(map[string]int)
	for i := range 1_000 {
		h[strconv.Itoa(i)] = i
	}
	b.ReportAllocs()
	b.ResetTimer()
	for i := range b.N {
		_ = h[strconv.Itoa(i%1_000)]
	}
}
