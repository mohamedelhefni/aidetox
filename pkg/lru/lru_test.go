package lru

import "testing"

func TestGetPromotesItemBeforeEviction(t *testing.T) {
	cache := New[int](2)
	cache.Put("a", 1)
	cache.Put("b", 2)
	if value, ok := cache.Get("a"); !ok || value != 1 {
		t.Fatalf("Get(a) = (%d, %v)", value, ok)
	}
	cache.Put("c", 3)
	if _, ok := cache.Get("b"); ok {
		t.Fatal("least recently used key b was not evicted")
	}
	if value, ok := cache.Get("a"); !ok || value != 1 {
		t.Fatal("promoted key a was evicted")
	}
}

func TestUpdateDeleteAndCapacity(t *testing.T) {
	cache := New[string](2)
	cache.Put("a", "old")
	cache.Put("a", "new")
	if cache.Len() != 1 {
		t.Fatalf("update changed Len() to %d", cache.Len())
	}
	if value, ok := cache.Get("a"); !ok || value != "new" {
		t.Fatalf("updated value = (%q, %v)", value, ok)
	}
	if !cache.Delete("a") || cache.Delete("a") || cache.Len() != 0 {
		t.Fatal("delete semantics are incorrect")
	}
	zero := New[int](0)
	zero.Put("ignored", 1)
	if zero.Len() != 0 {
		t.Fatal("zero-capacity cache stored a value")
	}
}
