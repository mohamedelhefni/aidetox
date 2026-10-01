package heap

import "testing"

func TestPopReturnsComparatorOrder(t *testing.T) {
	h := New(func(a, b int) bool { return a < b })
	for _, number := range []int{5, 1, 4, 1, 3, 2} {
		h.Push(number)
	}
	if h.Len() != 6 {
		t.Fatalf("Len() = %d, want 6", h.Len())
	}
	if root, ok := h.Peek(); !ok || root != 1 || h.Len() != 6 {
		t.Fatalf("Peek() = (%d, %v), Len() = %d", root, ok, h.Len())
	}
	for _, want := range []int{1, 1, 2, 3, 4, 5} {
		if got, ok := h.Pop(); !ok || got != want {
			t.Fatalf("Pop() = (%d, %v), want (%d, true)", got, ok, want)
		}
	}
	if _, ok := h.Pop(); ok || h.Len() != 0 {
		t.Fatal("empty heap returned a value")
	}
}

func TestComparatorCanCreateMaxHeap(t *testing.T) {
	h := New(func(a, b int) bool { return a > b })
	for _, number := range []int{1, 3, 2} {
		h.Push(number)
	}
	if got, ok := h.Pop(); !ok || got != 3 {
		t.Fatalf("Pop() = (%d, %v), want (3, true)", got, ok)
	}
}
