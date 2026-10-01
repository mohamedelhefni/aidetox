package server

import (
	"bufio"
	"errors"
	"fmt"
	"net"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"testing"
	"time"

	"go-rebuild/projects/mini-redis/internal/storage"
)

func TestTCPCommandsShareStateAcrossClients(t *testing.T) {
	server, shutdown := startTestServer(t)
	defer shutdown()

	first := dialServer(t, server)
	defer first.Close()
	assertResponse(t, first, "SET name Mohamed", "OK")
	assertResponse(t, first, "GET name", "Mohamed")
	assertResponse(t, first, "EXISTS name", "1")
	assertResponse(t, first, "EXPIRE name 60", "1")
	ttl, err := strconv.Atoi(sendCommand(t, first, "TTL name"))
	if err != nil || ttl < 0 || ttl > 60 {
		t.Fatalf("TTL response = %d, error = %v", ttl, err)
	}

	second := dialServer(t, server)
	defer second.Close()
	assertResponse(t, second, "DEL name", "1")
	assertResponse(t, first, "GET name", "(nil)")
	assertResponse(t, first, "bad command", "ERR")
}

func TestMutationsAreAppendedToWAL(t *testing.T) {
	path := filepath.Join(t.TempDir(), "data.wal")
	server, shutdown := startTestServerWithWAL(t, path)
	connection := dialServer(t, server)
	assertResponse(t, connection, "SET name Mohamed", "OK")
	assertResponse(t, connection, "DEL name", "1")
	connection.Close()
	shutdown()

	w, err := storage.OpenWAL(path)
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()
	var records []string
	if err := w.Replay(func(command string) error {
		records = append(records, command)
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if want := []string{"SET name Mohamed", "DEL name"}; !slices.Equal(records, want) {
		t.Fatalf("WAL records = %v, want %v", records, want)
	}
}

func TestCloseStopsListener(t *testing.T) {
	server, shutdown := startTestServer(t)
	address := server.Addr().String()
	shutdown()
	connection, err := net.DialTimeout("tcp", address, 100*time.Millisecond)
	if err == nil {
		connection.Close()
		t.Fatal("dial succeeded after Close")
	}
}

func startTestServer(t *testing.T) (*Server, func()) {
	t.Helper()
	return startTestServerWithWAL(t, filepath.Join(t.TempDir(), "data.wal"))
}

func startTestServerWithWAL(t *testing.T, path string) (*Server, func()) {
	t.Helper()
	w, err := storage.OpenWAL(path)
	if err != nil {
		t.Fatal(err)
	}
	server := New("127.0.0.1:0", storage.NewEngine(), w)
	stopped := make(chan error, 1)
	go func() { stopped <- server.ListenAndServe() }()
	deadline := time.Now().Add(time.Second)
	for server.Addr() == nil && time.Now().Before(deadline) {
		time.Sleep(time.Millisecond)
	}
	if server.Addr() == nil {
		t.Fatal("server did not start listening")
	}
	return server, func() {
		t.Helper()
		if err := server.Close(); err != nil {
			t.Fatal(err)
		}
		if err := <-stopped; err != nil && !errors.Is(err, net.ErrClosed) {
			t.Fatalf("ListenAndServe after Close: %v", err)
		}
		if err := w.Close(); err != nil {
			t.Fatal(err)
		}
	}
}

func dialServer(t *testing.T, server *Server) net.Conn {
	t.Helper()
	connection, err := net.DialTimeout("tcp", server.Addr().String(), time.Second)
	if err != nil {
		t.Fatal(err)
	}
	return connection
}

func assertResponse(t *testing.T, connection net.Conn, command, want string) {
	t.Helper()
	response := sendCommand(t, connection, command)
	if want == "ERR" {
		if !strings.HasPrefix(response, "ERR") {
			t.Fatalf("%s response = %q, want ERR prefix", command, response)
		}
		return
	}
	if response != want {
		t.Fatalf("%s response = %q, want %q", command, response, want)
	}
}

func sendCommand(t *testing.T, connection net.Conn, command string) string {
	t.Helper()
	if _, err := fmt.Fprintln(connection, command); err != nil {
		t.Fatal(err)
	}
	connection.SetReadDeadline(time.Now().Add(time.Second))
	response, err := bufio.NewReader(connection).ReadString('\n')
	if err != nil {
		t.Fatal(err)
	}
	response = strings.TrimSpace(response)
	return response
}
