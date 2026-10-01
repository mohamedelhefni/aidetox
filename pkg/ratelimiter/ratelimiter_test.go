package ratelimiter

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestBurstCannotExceedCapacity(t *testing.T) {
	limiter, err := New(20, 2)
	if err != nil {
		t.Fatal(err)
	}
	if !limiter.Allow() || !limiter.Allow() || limiter.Allow() {
		t.Fatal("initial token capacity is incorrect")
	}
}

func TestWaitRefillsTokenAndHonorsCancellation(t *testing.T) {
	limiter, _ := New(20, 1)
	if !limiter.Allow() {
		t.Fatal("initial token unavailable")
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	started := time.Now()
	if err := limiter.Wait(ctx); err != nil {
		t.Fatal(err)
	}
	if elapsed := time.Since(started); elapsed < 25*time.Millisecond {
		t.Fatalf("Wait returned too early after %v", elapsed)
	}

	slow, _ := New(0.01, 1)
	slow.Allow()
	cancelled, cancelNow := context.WithCancel(context.Background())
	cancelNow()
	if err := slow.Wait(cancelled); !errors.Is(err, context.Canceled) {
		t.Fatalf("Wait error = %v, want context.Canceled", err)
	}
}

func TestInvalidConfigurationReturnsError(t *testing.T) {
	for _, config := range []struct {
		rate     float64
		capacity int
	}{{0, 1}, {-1, 1}, {1, 0}} {
		if _, err := New(config.rate, config.capacity); err == nil {
			t.Fatalf("New(%v, %d) returned nil error", config.rate, config.capacity)
		}
	}
}
