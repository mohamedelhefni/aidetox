package list

import "testing"

func TestListZeroValue(t *testing.T) {
	var l List[int]

	if got := l.Len(); got != 0 {
		t.Fatalf("Len() = %d, want 0", got)
	}
	if got := l.Front(); got != nil {
		t.Fatalf("Front() = %v, want nil", got)
	}
	if got := l.Back(); got != nil {
		t.Fatalf("Back() = %v, want nil", got)
	}

	if got := l.PopFront(); got != nil {
		t.Fatalf("PopFront() = %v, want nil", got)
	}
	if got := l.PopBack(); got != nil {
		t.Fatalf("PopBack() = %v, want nil", got)
	}
	if l.Len() != 0 {
		t.Fatalf("empty pops changed Len() to %d", l.Len())
	}

}
func TestPushFront(t *testing.T) {
	var l List[int]

	a := l.PushFront(1)
	if l.Front() != a || l.Back() != a {
		t.Fatal("one-element list has incorrect head/tail")
	}
	if a.prev != nil || a.next != nil {
		t.Fatal("one-element node should have nil prev/next")
	}

	b := l.PushFront(2)

	if l.Front() != b {
		t.Fatal("Front() is not the newly pushed node")
	}
	if l.Back() != a {
		t.Fatal("Back() changed unexpectedly")
	}
	if b.next != a || a.prev != b {
		t.Fatal("prev/next links are incorrect")
	}
	if b.prev != nil || a.next != nil {
		t.Fatal("boundary links should be nil")
	}
	if l.Len() != 2 {
		t.Fatalf("Len() = %d, want 2", l.Len())
	}

}
func TestPushBack(t *testing.T) {
	var l List[int]

	a := l.PushBack(1)
	b := l.PushBack(2)

	if l.Front() != a {
		t.Fatal("Front() is incorrect")
	}
	if l.Back() != b {
		t.Fatal("Back() is incorrect")
	}
	if a.prev != nil {
		t.Fatal("head.prev should be nil")
	}
	if b.next != nil {
		t.Fatal("tail.next should be nil")
	}
	if a.next != b || b.prev != a {
		t.Fatal("prev/next links are incorrect")
	}
	if l.Len() != 2 {
		t.Fatalf("Len() = %d, want 2", l.Len())
	}

}
func TestPopFront(t *testing.T) {
	var l List[int]

	if got := l.PopFront(); got != nil {
		t.Fatalf("PopFront() = %v, want nil", got)
	}

	a := l.PushBack(1)
	b := l.PushBack(2)

	if got := l.PopFront(); got != a {
		t.Fatalf("PopFront() = %v, want first node", got)
	}

	if l.Front() != b || l.Back() != b {
		t.Fatal("remaining one-element list has incorrect head/tail")
	}
	if b.prev != nil || b.next != nil {
		t.Fatal("remaining node should be detached from removed node")
	}
	if l.Len() != 1 {
		t.Fatalf("Len() = %d, want 1", l.Len())
	}

	if got := l.PopFront(); got != b {
		t.Fatalf("PopFront() = %v, want second node", got)
	}
	if l.Len() != 0 || l.Front() != nil || l.Back() != nil {
		t.Fatal("list should be empty")
	}

}
func TestPopBack(t *testing.T) {
	var l List[int]

	if got := l.PopBack(); got != nil {
		t.Fatalf("PopBack() = %v, want nil", got)
	}

	a := l.PushBack(1)
	b := l.PushBack(2)

	if got := l.PopBack(); got != b {
		t.Fatalf("PopBack() = %v, want last node", got)
	}

	if l.Front() != a || l.Back() != a {
		t.Fatal("remaining one-element list has incorrect head/tail")
	}
	if a.prev != nil || a.next != nil {
		t.Fatal("remaining node should be detached from removed node")
	}
	if l.Len() != 1 {
		t.Fatalf("Len() = %d, want 1", l.Len())
	}

}
func TestRemoveHeadTailMiddle(t *testing.T) {
	var l List[int]

	a := l.PushBack(1)
	b := l.PushBack(2)
	c := l.PushBack(3)

	l.Remove(a)

	if l.Front() != b {
		t.Fatal("removing head did not update head")
	}
	if b.prev != nil {
		t.Fatal("new head.prev should be nil")
	}
	if l.Len() != 2 {
		t.Fatalf("Len() = %d, want 2", l.Len())
	}

	l.Remove(c)

	if l.Back() != b {
		t.Fatal("removing tail did not update tail")
	}
	if b.next != nil {
		t.Fatal("new tail.next should be nil")
	}
	if l.Len() != 1 {
		t.Fatalf("Len() = %d, want 1", l.Len())
	}

	l.Remove(b)

	if l.Len() != 0 {
		t.Fatalf("Len() = %d, want 0", l.Len())
	}
	if l.Front() != nil || l.Back() != nil {
		t.Fatal("empty list should have nil head/tail")
	}

}
func TestRemoveMiddle(t *testing.T) {
	var l List[int]

	a := l.PushBack(1)
	b := l.PushBack(2)
	c := l.PushBack(3)

	l.Remove(b)

	if l.Front() != a || l.Back() != c {
		t.Fatal("head/tail changed when removing middle")
	}
	if a.next != c || c.prev != a {
		t.Fatal("middle removal did not reconnect neighbors")
	}
	if l.Len() != 2 {
		t.Fatalf("Len() = %d, want 2", l.Len())
	}

	if b.prev != nil || b.next != nil {
		t.Fatal("removed node should be detached")
	}

}
func TestMoveToFront(t *testing.T) {
	var l List[int]

	a := l.PushBack(1)
	b := l.PushBack(2)
	c := l.PushBack(3)

	l.MoveToFront(a) // already head
	if l.Front() != a || l.Back() != c {
		t.Fatal("moving head changed list incorrectly")
	}

	l.MoveToFront(c)

	if l.Front() != c || l.Back() != b {
		t.Fatal("moving tail to front failed")
	}
	if c.prev != nil || c.next != a {
		t.Fatal("moved node has incorrect links")
	}
	if a.prev != c || a.next != b {
		t.Fatal("middle links are incorrect")
	}
	if b.prev != a || b.next != nil {
		t.Fatal("tail links are incorrect")
	}

}
func TestMoveToBack(t *testing.T) {
	var l List[int]

	a := l.PushBack(1)
	b := l.PushBack(2)
	c := l.PushBack(3)

	l.MoveToBack(c) // already tail
	if l.Front() != a || l.Back() != c {
		t.Fatal("moving tail changed list incorrectly")
	}

	l.MoveToBack(a)

	if l.Front() != b || l.Back() != a {
		t.Fatal("moving head to back failed")
	}
	if b.prev != nil || b.next != c {
		t.Fatal("new head links are incorrect")
	}
	if c.prev != b || c.next != a {
		t.Fatal("middle links are incorrect")
	}
	if a.prev != c || a.next != nil {
		t.Fatal("new tail links are incorrect")
	}

}
func TestMoveOneElement(t *testing.T) {
	var l List[int]

	n := l.PushBack(42)

	l.MoveToFront(n)
	l.MoveToBack(n)

	if l.Front() != n || l.Back() != n {
		t.Fatal("moving sole element changed head/tail")
	}
	if n.prev != nil || n.next != nil {
		t.Fatal("sole element should have nil prev/next")
	}
	if l.Len() != 1 {
		t.Fatalf("Len() = %d, want 1", l.Len())
	}

}
func TestListInvariants(t *testing.T) {
	var l List[int]

	nodes := []*Node[int]{
		l.PushBack(1),
		l.PushBack(2),
		l.PushBack(3),
		l.PushBack(4),
	}

	assertListInvariants(t, &l, nodes)

	l.Remove(nodes[1])
	assertListInvariants(t, &l, []*Node[int]{
		nodes[0],
		nodes[2],
		nodes[3],
	})

	l.MoveToFront(nodes[3])
	assertListInvariants(t, &l, []*Node[int]{
		nodes[3],
		nodes[0],
		nodes[2],
	})

	l.MoveToBack(nodes[0])
	assertListInvariants(t, &l, []*Node[int]{
		nodes[3],
		nodes[2],
		nodes[0],
	})

}
func assertListInvariants[T comparable](t *testing.T, l *List[T], want []*Node[T]) {
	t.Helper()

	if l.Len() != len(want) {
		t.Fatalf("Len() = %d, want %d", l.Len(), len(want))
	}

	if len(want) == 0 {
		if l.head != nil || l.tail != nil {
			t.Fatal("empty list must have nil head and tail")
		}
		return
	}

	if l.head != want[0] {
		t.Fatal("head does not match expected first node")
	}
	if l.tail != want[len(want)-1] {
		t.Fatal("tail does not match expected last node")
	}
	if l.head.prev != nil {
		t.Fatal("head.prev must be nil")
	}
	if l.tail.next != nil {
		t.Fatal("tail.next must be nil")
	}

	for i, node := range want {
		var prev, next *Node[T]

		if i > 0 {
			prev = want[i-1]
		}
		if i+1 < len(want) {
			next = want[i+1]
		}

		if node.prev != prev {
			t.Fatalf("node %v: prev = %p, want %p", node.Value, node.prev, prev)
		}
		if node.next != next {
			t.Fatalf("node %v: next = %p, want %p", node.Value, node.next, next)
		}
	}

}
