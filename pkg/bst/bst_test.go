package bst

import (
	"slices"
	"testing"
)

func newIntTree(t *testing.T) *Tree[int] {
	t.Helper()
	tree := New(func(a, b int) bool { return a < b })
	for _, number := range []int{5, 3, 7, 2, 4, 6, 8} {
		if !tree.Insert(number) {
			t.Fatalf("Insert(%d) rejected", number)
		}
	}
	return tree
}

func TestTraversalsRespectTreeShape(t *testing.T) {
	tree := newIntTree(t)
	checks := []struct {
		name string
		got  []int
		want []int
	}{
		{"inorder", tree.InOrder(), []int{2, 3, 4, 5, 6, 7, 8}},
		{"preorder", tree.PreOrder(), []int{5, 3, 2, 4, 7, 6, 8}},
		{"postorder", tree.PostOrder(), []int{2, 4, 3, 6, 8, 7, 5}},
	}
	for _, check := range checks {
		t.Run(check.name, func(t *testing.T) {
			if !slices.Equal(check.got, check.want) {
				t.Fatalf("got %v, want %v", check.got, check.want)
			}
		})
	}
	if tree.Insert(5) {
		t.Fatal("duplicate insert should be rejected")
	}
}

func TestDeleteHandlesAllChildCounts(t *testing.T) {
	tree := newIntTree(t)
	for _, number := range []int{2, 3, 5} {
		if !tree.Delete(number) || tree.Search(number) {
			t.Fatalf("Delete(%d) did not remove value", number)
		}
	}
	if tree.Delete(99) {
		t.Fatal("deleting missing value returned true")
	}
	if got, want := tree.InOrder(), []int{4, 6, 7, 8}; !slices.Equal(got, want) {
		t.Fatalf("InOrder() = %v, want %v", got, want)
	}
}

func TestMinMaxAndEmptyTree(t *testing.T) {
	empty := New(func(a, b int) bool { return a < b })
	if _, ok := empty.Min(); ok {
		t.Fatal("empty Min returned a value")
	}
	if _, ok := empty.Max(); ok {
		t.Fatal("empty Max returned a value")
	}
	tree := newIntTree(t)
	if min, ok := tree.Min(); !ok || min != 2 {
		t.Fatalf("Min() = (%d, %v), want (2, true)", min, ok)
	}
	if max, ok := tree.Max(); !ok || max != 8 {
		t.Fatalf("Max() = (%d, %v), want (8, true)", max, ok)
	}
}
