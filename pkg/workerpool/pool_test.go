package workerpool

import (
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

func TestStopDrainsAcceptedJobsExactlyOnce(t *testing.T) {
	pool, err := NewPool(3)
	if err != nil {
		t.Fatal(err)
	}
	if err := pool.Start(); err != nil {
		t.Fatal(err)
	}
	var completed atomic.Int64
	for range 50 {
		if err := pool.Submit(func() { completed.Add(1) }); err != nil {
			t.Fatal(err)
		}
	}
	if err := pool.Stop(); err != nil {
		t.Fatal(err)
	}
	if got := completed.Load(); got != 50 {
		t.Fatalf("completed jobs = %d, want 50", got)
	}
	if err := pool.Submit(func() {}); !errors.Is(err, ErrStopped) {
		t.Fatalf("Submit after Stop error = %v, want ErrStopped", err)
	}
}

func TestWorkerConcurrencyNeverExceedsLimit(t *testing.T) {
	pool, err := NewPool(3)
	if err != nil {
		t.Fatal(err)
	}
	pool.Start()
	release := make(chan struct{})
	entered := make(chan struct{}, 3)
	for range 3 {
		if err := pool.Submit(func() {
			entered <- struct{}{}
			<-release
		}); err != nil {
			t.Fatal(err)
		}
	}
	for range 3 {
		<-entered
	}
	fourthEntered := make(chan struct{}, 1)
	fourthSubmitted := make(chan error, 1)
	go func() { fourthSubmitted <- pool.Submit(func() { fourthEntered <- struct{}{} }) }()
	select {
	case <-fourthEntered:
		t.Fatal("fourth job ran while all three workers were occupied")
	case <-time.After(20 * time.Millisecond):
	}
	close(release)
	if err := <-fourthSubmitted; err != nil {
		t.Fatal(err)
	}
	pool.Stop()
}

func TestInvalidLifecycleCallsReturnErrors(t *testing.T) {
	if _, err := NewPool(0); !errors.Is(err, ErrInvalidWorkerCount) {
		t.Fatalf("NewPool(0) error = %v", err)
	}
	pool, _ := NewPool(1)
	if err := pool.Submit(func() {}); !errors.Is(err, ErrNotStarted) {
		t.Fatalf("Submit before Start error = %v", err)
	}
}
