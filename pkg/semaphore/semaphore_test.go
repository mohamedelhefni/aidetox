package semaphore

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
)

func TestConcurrentHoldersNeverExceedCapacity(t *testing.T) {
	semaphore, err := New(3)
	if err != nil {
		t.Fatal(err)
	}
	var active atomic.Int64
	var maximum atomic.Int64
	var workers sync.WaitGroup
	release := make(chan struct{})
	entered := make(chan struct{}, 30)
	workers.Add(30)
	for range 30 {
		go func() {
			defer workers.Done()
			if err := semaphore.Acquire(context.Background()); err != nil {
				t.Errorf("Acquire: %v", err)
				return
			}
			current := active.Add(1)
			for previous := maximum.Load(); current > previous && !maximum.CompareAndSwap(previous, current); previous = maximum.Load() {
			}
			entered <- struct{}{}
			<-release
			active.Add(-1)
			if err := semaphore.Release(); err != nil {
				t.Errorf("Release: %v", err)
			}
		}()
	}
	for range 3 {
		<-entered
	}
	select {
	case <-entered:
		t.Fatal("a fourth goroutine acquired before a permit was released")
	default:
	}
	close(release)
	workers.Wait()
	if maximum.Load() != 3 {
		t.Fatalf("maximum concurrent holders = %d, want 3", maximum.Load())
	}
}

func TestCancelledAcquireDoesNotConsumePermit(t *testing.T) {
	semaphore, _ := New(1)
	if err := semaphore.Acquire(context.Background()); err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := semaphore.Acquire(ctx); !errors.Is(err, context.Canceled) {
		t.Fatalf("Acquire error = %v, want context.Canceled", err)
	}
	if err := semaphore.Release(); err != nil {
		t.Fatal(err)
	}
	if err := semaphore.Acquire(context.Background()); err != nil {
		t.Fatal("cancelled acquire consumed the permit")
	}
	semaphore.Release()
	if err := semaphore.Release(); !errors.Is(err, ErrOverRelease) {
		t.Fatalf("extra Release error = %v, want ErrOverRelease", err)
	}
}

func TestInvalidCapacityReturnsError(t *testing.T) {
	if _, err := New(0); !errors.Is(err, ErrInvalidCapacity) {
		t.Fatalf("New(0) error = %v, want ErrInvalidCapacity", err)
	}
}
