package shardedmap

import (
	"fmt"
	"sync"
	"testing"
)

func TestSetGetDeleteAndLength(t *testing.T) {
	m, err := New[int](8)
	if err != nil {
		t.Fatal(err)
	}
	for i := range 100 {
		m.Set(fmt.Sprint(i), i)
	}
	m.Set("10", 999)
	if m.Len() != 100 {
		t.Fatalf("Len() = %d, want 100", m.Len())
	}
	if value, ok := m.Get("10"); !ok || value != 999 {
		t.Fatalf("Get(10) = (%d, %v)", value, ok)
	}
	if !m.Delete("10") || m.Delete("10") || m.Len() != 99 {
		t.Fatal("delete semantics are incorrect")
	}
}

func TestConcurrentAccessPreservesEveryKey(t *testing.T) {
	m, _ := New[int](16)
	var writers sync.WaitGroup
	writers.Add(200)
	for i := range 200 {
		go func() {
			defer writers.Done()
			key := fmt.Sprint(i)
			m.Set(key, i)
			m.Get(key)
		}()
	}
	writers.Wait()
	if m.Len() != 200 {
		t.Fatalf("Len() = %d, want 200", m.Len())
	}
	for i := range 200 {
		if value, ok := m.Get(fmt.Sprint(i)); !ok || value != i {
			t.Fatalf("key %d = (%d, %v)", i, value, ok)
		}
	}
}

func TestInvalidShardCountReturnsError(t *testing.T) {
	if _, err := New[int](0); err == nil {
		t.Fatal("New with zero shards returned nil error")
	}
}
