package shardedmap

import (
	"strconv"
	"sync"
	"testing"
)

func BenchmarkShardedMap(b *testing.B) {
	m, _ := New[int](32)
	b.RunParallel(func(pb *testing.PB) {
		for i := 0; pb.Next(); i++ {
			key := strconv.Itoa(i % 1_000)
			m.Set(key, i)
			m.Get(key)
		}
	})
}

func BenchmarkGlobalMap(b *testing.B) {
	var lock sync.RWMutex
	m := make(map[string]int)
	b.RunParallel(func(pb *testing.PB) {
		for i := 0; pb.Next(); i++ {
			key := strconv.Itoa(i % 1_000)
			lock.Lock()
			m[key] = i
			lock.Unlock()
			lock.RLock()
			_ = m[key]
			lock.RUnlock()
		}
	})
}
