package ringbuffer

import "testing"

func TestWrapAroundPreservesFIFOOrder(t *testing.T) {
	r := New[int](3)
	if r.Cap() != 3 || r.Len() != 0 || !r.IsEmpty() || r.IsFull() {
		t.Fatal("new buffer has invalid state")
	}
	for _, number := range []int{1, 2, 3} {
		if !r.Push(number) {
			t.Fatalf("Push(%d) rejected before buffer was full", number)
		}
	}
	if !r.IsFull() || r.Push(4) {
		t.Fatal("full buffer must report full and reject another push")
	}
	if number, ok := r.Pop(); !ok || number != 1 {
		t.Fatalf("first Pop() = (%d, %v), want (1, true)", number, ok)
	}
	if !r.Push(4) {
		t.Fatal("push after pop should reuse wrapped slot")
	}
	for _, want := range []int{2, 3, 4} {
		if got, ok := r.Pop(); !ok || got != want {
			t.Fatalf("Pop() = (%d, %v), want (%d, true)", got, ok, want)
		}
	}
	if _, ok := r.Pop(); ok || !r.IsEmpty() || r.Len() != 0 {
		t.Fatal("drained buffer must be empty and return no value")
	}
}

func TestPeekDoesNotRemoveValue(t *testing.T) {
	r := New[string](1)
	if _, ok := r.Peek(); ok {
		t.Fatal("Peek on empty buffer returned a value")
	}
	r.Push("only")
	if got, ok := r.Peek(); !ok || got != "only" || r.Len() != 1 {
		t.Fatalf("Peek() = (%q, %v), Len() = %d", got, ok, r.Len())
	}
}
