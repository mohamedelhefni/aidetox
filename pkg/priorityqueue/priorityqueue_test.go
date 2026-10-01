package priorityqueue

import "testing"

func TestDequeueReturnsLowestPriorityFirst(t *testing.T) {
	q := New[string]()
	q.Enqueue("low", 30)
	q.Enqueue("urgent", 1)
	q.Enqueue("normal", 10)
	if q.Len() != 3 {
		t.Fatalf("Len() = %d, want 3", q.Len())
	}
	if got, ok := q.Peek(); !ok || got.Value != "urgent" || got.Priority != 1 || q.Len() != 3 {
		t.Fatalf("Peek() = (%+v, %v), Len() = %d", got, ok, q.Len())
	}
	for _, want := range []string{"urgent", "normal", "low"} {
		if got, ok := q.Dequeue(); !ok || got.Value != want {
			t.Fatalf("Dequeue() = (%+v, %v), want value %q", got, ok, want)
		}
	}
	if _, ok := q.Dequeue(); ok {
		t.Fatal("empty queue returned an item")
	}
}
