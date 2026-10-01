package pubsub

import (
	"sync"
	"testing"
	"time"
)

func TestPublishReachesCurrentSubscribersOnly(t *testing.T) {
	broker := New[string]()
	first := broker.Subscribe("news")
	second := broker.Subscribe("news")
	other := broker.Subscribe("sports")
	received := make(chan string, 2)
	for _, subscription := range []*Subscription[string]{first, second} {
		go func() { received <- <-subscription.C }()
	}
	published := make(chan struct{})
	go func() {
		broker.Publish("news", "hello")
		close(published)
	}()
	for index := range 2 {
		select {
		case message := <-received:
			if message != "hello" {
				t.Fatalf("subscriber %d received %q", index, message)
			}
		case <-time.After(time.Second):
			t.Fatalf("subscriber %d received no message", index)
		}
	}
	select {
	case message := <-other.C:
		t.Fatalf("other topic received %q", message)
	default:
	}
	<-published
}

func TestUnsubscribeAndCloseCloseChannels(t *testing.T) {
	broker := New[int]()
	subscription := broker.Subscribe("numbers")
	if !broker.Unsubscribe("numbers", subscription) || broker.Unsubscribe("numbers", subscription) {
		t.Fatal("unsubscribe result is incorrect")
	}
	if _, open := <-subscription.C; open {
		t.Fatal("unsubscribed channel remained open")
	}
	remaining := broker.Subscribe("numbers")
	broker.Close()
	if _, open := <-remaining.C; open {
		t.Fatal("Close did not close subscriber channel")
	}
}

func TestPublishCanRaceWithUnsubscribe(t *testing.T) {
	broker := New[int]()
	subscription := broker.Subscribe("numbers")
	drained := make(chan struct{})
	go func() {
		for range subscription.C {
		}
		close(drained)
	}()
	var operations sync.WaitGroup
	operations.Add(2)
	go func() {
		defer operations.Done()
		for number := range 100 {
			broker.Publish("numbers", number)
		}
	}()
	go func() {
		defer operations.Done()
		broker.Unsubscribe("numbers", subscription)
	}()
	finished := make(chan struct{})
	go func() {
		operations.Wait()
		close(finished)
	}()
	select {
	case <-finished:
	case <-time.After(time.Second):
		t.Fatal("Publish racing with Unsubscribe deadlocked")
	}
	select {
	case <-drained:
	case <-time.After(time.Second):
		t.Fatal("unsubscribe did not close the subscription channel")
	}
}
