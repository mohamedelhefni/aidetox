package disjointset

import "testing"

func TestUnionCreatesOnlyRequestedConnections(t *testing.T) {
	s := New("a", "b", "c", "d")
	if s.Connected("a", "b") {
		t.Fatal("new elements started connected")
	}
	if !s.Union("a", "b") || !s.Union("b", "c") {
		t.Fatal("union of separate components returned false")
	}
	if !s.Connected("a", "c") || s.Connected("a", "d") {
		t.Fatal("transitive or isolated connectivity is incorrect")
	}
	if s.Union("a", "c") || s.Union("a", "a") {
		t.Fatal("union inside one component should report no change")
	}
}

func TestAddFindAndMissingElements(t *testing.T) {
	s := New[int]()
	if !s.Add(1) || s.Add(1) {
		t.Fatal("Add duplicate semantics are incorrect")
	}
	root, ok := s.Find(1)
	if !ok || root != 1 {
		t.Fatalf("Find(1) = (%d, %v), want (1, true)", root, ok)
	}
	if _, ok := s.Find(2); ok || s.Union(1, 2) || s.Connected(1, 2) {
		t.Fatal("missing element was treated as present")
	}
}
