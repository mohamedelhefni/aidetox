package storage

import (
	"path/filepath"
	"reflect"
	"testing"
	"time"
)

func TestEngineSetGetDeleteAndExistsAgree(t *testing.T) {
	engine := NewEngine()
	if _, ok := engine.Get("missing"); ok || engine.Exists("missing") || engine.Delete("missing") {
		t.Fatal("missing key was reported present")
	}
	engine.Set("name", "Mohamed")
	engine.Set("name", "Hefni")
	if value, ok := engine.Get("name"); !ok || value != "Hefni" || !engine.Exists("name") {
		t.Fatalf("stored key = (%q, %v), Exists = %v", value, ok, engine.Exists("name"))
	}
	if !engine.Delete("name") || engine.Exists("name") {
		t.Fatal("Delete did not remove key")
	}
}

func TestLazyExpirationAndTTLSentinels(t *testing.T) {
	engine := NewEngine()
	if got := engine.TTL("missing"); got != MissingTTL {
		t.Fatalf("missing TTL = %v, want %v", got, MissingTTL)
	}
	engine.Set("persistent", "value")
	if got := engine.TTL("persistent"); got != NoExpirationTTL {
		t.Fatalf("persistent TTL = %v, want %v", got, NoExpirationTTL)
	}
	engine.Set("short", "value")
	if !engine.Expire("short", 20*time.Millisecond) {
		t.Fatal("Expire rejected existing key")
	}
	if ttl := engine.TTL("short"); ttl <= 0 || ttl > 20*time.Millisecond {
		t.Fatalf("active TTL = %v", ttl)
	}
	time.Sleep(30 * time.Millisecond)
	if _, ok := engine.Get("short"); ok || engine.Exists("short") || engine.TTL("short") != MissingTTL {
		t.Fatal("expired key remained visible")
	}
	if engine.Expire("missing", time.Second) {
		t.Fatal("Expire accepted missing key")
	}
}

func TestWALPersistsOrderedRecordsAcrossReopen(t *testing.T) {
	path := filepath.Join(t.TempDir(), "data.wal")
	w, err := OpenWAL(path)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"SET name Mohamed", "SET age 23", "DEL old"}
	for _, command := range want {
		if err := w.Append(command); err != nil {
			t.Fatal(err)
		}
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}

	reopened, err := OpenWAL(path)
	if err != nil {
		t.Fatal(err)
	}
	defer reopened.Close()
	var got []string
	if err := reopened.Replay(func(command string) error {
		got = append(got, command)
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("replayed records = %v, want %v", got, want)
	}
}
