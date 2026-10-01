// Package list is the Day 1 doubly linked list exercise.
package list

type List[T any] struct {
	head, tail *Node[T]
	length     int
}

type Node[T any] struct {
	Value T
	next  *Node[T]
	prev  *Node[T]
}

func (l *List[T]) Front() *Node[T] {
	return l.head
}

func (l *List[T]) Back() *Node[T] {
	return l.tail
}

func (l *List[T]) PushFront(v T) *Node[T] {
	l.length++
	if l.head == nil && l.tail == nil {
		h := &Node[T]{Value: v, prev: nil, next: nil}
		l.head = h
		l.tail = h
		return h
	}
	n := new(Node[T])
	n.Value = v
	n.prev = nil
	n.next = l.head
	l.head.prev = n
	l.head = n
	return n
}

func (l *List[T]) PushBack(v T) *Node[T] {
	l.length++

	return l.head
}

func (l *List[T]) PopFront() *Node[T] {
	l.length--
	if l.length == 0 {
		return nil
	}
	return l.head
}

func (l *List[T]) MoveToFront(n *Node[T]) *Node[T] {

	return l.head
}

func (l *List[T]) MoveToBack(n *Node[T]) *Node[T] {

	return l.head
}

func (l *List[T]) PopBack() *Node[T] {
	l.length--
	if l.length == 0 {
		return nil
	}
	return l.head
}

func (l *List[T]) Remove(v *Node[T]) *Node[T] {
	l.length--

	return l.head
}

func (l *List[T]) Len() int {
	return l.length
}
