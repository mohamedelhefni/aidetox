// Package wire is the Day 24 tiny binary protocol exercise.
package wire

type Message struct {
	Type    byte
	Payload []byte
}

func Encode(message Message) ([]byte, error) { panic("TODO") }
func Decode(data []byte) (Message, error)    { panic("TODO") }
