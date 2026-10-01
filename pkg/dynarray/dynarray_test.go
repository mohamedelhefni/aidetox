package dynarray

import (
	"slices"
	"testing"
)

func TestAppendGrowsAndPreservesValues(t *testing.T) {
	a := New[int](1)
	for _, number := range []int{10, 20, 30} {
		a.Append(number)
	}
	if a.Len() != 3 || a.Cap() != 4 {
		t.Fatalf("after three appends: Len() = %d, Cap() = %d; want 3, 4", a.Len(), a.Cap())
	}
	if got := arrayValues(a); !slices.Equal(got, []int{10, 20, 30}) {
		t.Fatalf("values = %v", got)
	}
}

func TestAppendGrowsFromZeroCapacity(t *testing.T) {
	a := New[int](0)
	a.Append(42)
	if got, ok := a.Get(0); !ok || got != 42 || a.Len() != 1 || a.Cap() < 1 {
		t.Fatalf("after Append: Get(0) = (%d, %v), Len() = %d, Cap() = %d", got, ok, a.Len(), a.Cap())
	}
}

func TestInsertDeleteAndSetMaintainOrder(t *testing.T) {
	a := New[string](1)
	a.Append("b")
	if !a.Insert(0, "a") || !a.Insert(2, "d") || !a.Insert(2, "c") {
		t.Fatal("valid insert was rejected")
	}
	if !a.Set(3, "D") {
		t.Fatal("valid set was rejected")
	}
	if removed, ok := a.Delete(1); !ok || removed != "b" {
		t.Fatalf("Delete(1) = (%q, %v), want (b, true)", removed, ok)
	}
	if got := arrayValues(a); !slices.Equal(got, []string{"a", "c", "D"}) {
		t.Fatalf("values = %v", got)
	}
}

func TestInvalidIndexesLeaveArrayUnchanged(t *testing.T) {
	a := New[int](1)
	a.Append(7)
	if _, ok := a.Get(-1); ok || a.Set(1, 8) || a.Insert(2, 8) {
		t.Fatal("invalid index was accepted")
	}
	if _, ok := a.Delete(1); ok || a.Len() != 1 {
		t.Fatal("invalid delete changed the array")
	}
}

func arrayValues[T any](a *Array[T]) []T {
	values := make([]T, a.Len())
	for i := range values {
		values[i], _ = a.Get(i)
	}
	return values
}
