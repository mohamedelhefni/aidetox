package wire

import (
	"bytes"
	"testing"
)

func TestEncodeUsesTypeLengthPayloadFormat(t *testing.T) {
	encoded, err := Encode(Message{Type: 2, Payload: []byte{0, 1, 255}})
	want := []byte{2, 0, 0, 0, 3, 0, 1, 255}
	if err != nil || !bytes.Equal(encoded, want) {
		t.Fatalf("Encode() = (%v, %v), want (%v, nil)", encoded, err, want)
	}
}

func TestRoundTripPreservesMessages(t *testing.T) {
	for _, message := range []Message{{Type: 1}, {Type: 7, Payload: []byte("hello")}} {
		encoded, err := Encode(message)
		if err != nil {
			t.Fatal(err)
		}
		decoded, err := Decode(encoded)
		if err != nil || decoded.Type != message.Type || !bytes.Equal(decoded.Payload, message.Payload) {
			t.Fatalf("round trip = (%+v, %v), want %+v", decoded, err, message)
		}
	}
}

func TestMalformedFramesReturnErrors(t *testing.T) {
	for _, frame := range [][]byte{
		nil,
		{1, 0, 0, 0},
		{1, 0, 0, 0, 3, 1, 2},
		{1, 0, 0, 0, 0, 9},
	} {
		if _, err := Decode(frame); err == nil {
			t.Fatalf("Decode(%v) returned nil error", frame)
		}
	}
}
