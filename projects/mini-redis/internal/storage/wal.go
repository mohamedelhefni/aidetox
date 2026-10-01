package storage

type WAL struct{}

func OpenWAL(path string) (*WAL, error)              { panic("TODO") }
func (w *WAL) Append(command string) error           { panic("TODO") }
func (w *WAL) Replay(apply func(string) error) error { panic("TODO") }
func (w *WAL) Close() error                          { panic("TODO") }
