// Package server exposes the mini Redis engine over TCP.
package server

import (
	"net"

	"go-rebuild/projects/mini-redis/internal/storage"
)

type Server struct{}

func New(address string, engine *storage.Engine, wal *storage.WAL) *Server {
	panic("TODO")
}
func (s *Server) ListenAndServe() error { panic("TODO") }
func (s *Server) Addr() net.Addr        { panic("TODO") }
func (s *Server) Close() error          { panic("TODO") }
