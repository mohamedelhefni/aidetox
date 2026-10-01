// Package pubsub is the Day 20 in-memory broker exercise.
package pubsub

type Subscription[T any] struct {
	C <-chan T
}

type Broker[T any] struct{}

func New[T any]() *Broker[T] { panic("TODO") }
func (b *Broker[T]) Subscribe(topic string) *Subscription[T] {
	panic("TODO")
}
func (b *Broker[T]) Publish(topic string, message T) { panic("TODO") }
func (b *Broker[T]) Unsubscribe(topic string, subscription *Subscription[T]) bool {
	panic("TODO")
}
func (b *Broker[T]) Close() { panic("TODO") }
