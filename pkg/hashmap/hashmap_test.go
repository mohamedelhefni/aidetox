package hashmap

import (
	"fmt"
	"testing"
)

func TestEntriesSurviveUpdatesDeletesAndResizes(t *testing.T) {
	h := New[int]()
	for i := range 1_000 {
		h.Set(fmt.Sprintf("key-%d", i), i)
	}
	if h.Len() != 1_000 {
		t.Fatalf("Len() = %d, want 1000", h.Len())
	}
	for i := range 1_000 {
		key := fmt.Sprintf("key-%d", i)
		if got, ok := h.Get(key); !ok || got != i {
			t.Fatalf("Get(%q) = (%d, %v), want (%d, true)", key, got, ok, i)
		}
	}
	h.Set("key-10", 999)
	if h.Len() != 1_000 {
		t.Fatal("updating a key changed length")
	}
	if !h.Delete("key-10") || h.Delete("key-10") || h.Contains("key-10") {
		t.Fatal("delete semantics are incorrect")
	}
	if h.Len() != 999 {
		t.Fatalf("Len() = %d, want 999", h.Len())
	}
}

func TestRangeVisitsEveryEntryOnce(t *testing.T) {
	h := New[string]()
	want := map[string]string{"a": "one", "b": "two", "c": "three"}
	for key, value := range want {
		h.Set(key, value)
	}
	seen := make(map[string]string)
	h.Range(func(key, value string) bool {
		seen[key] = value
		return true
	})
	if len(seen) != len(want) {
		t.Fatalf("Range visited %d entries, want %d", len(seen), len(want))
	}
	for key, value := range want {
		if seen[key] != value {
			t.Fatalf("Range value for %q = %q, want %q", key, seen[key], value)
		}
	}
}

func TestRangeStopsWhenYieldReturnsFalse(t *testing.T) {
	h := New[int]()
	for i := range 10 {
		h.Set(fmt.Sprint(i), i)
	}
	visits := 0
	h.Range(func(string, int) bool {
		visits++
		return false
	})
	if visits != 1 {
		t.Fatalf("yield called %d times, want 1", visits)
	}
}
