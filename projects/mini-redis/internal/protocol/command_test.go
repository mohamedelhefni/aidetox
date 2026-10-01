package protocol

import (
	"reflect"
	"testing"
)

func TestSupportedCommandsParse(t *testing.T) {
	checks := []struct {
		line string
		want Command
	}{
		{"set name Mohamed", Command{Name: "SET", Args: []string{"name", "Mohamed"}}},
		{" GET   name ", Command{Name: "GET", Args: []string{"name"}}},
		{"DEL name", Command{Name: "DEL", Args: []string{"name"}}},
		{"EXISTS name", Command{Name: "EXISTS", Args: []string{"name"}}},
		{"EXPIRE name 60", Command{Name: "EXPIRE", Args: []string{"name", "60"}}},
		{"TTL name", Command{Name: "TTL", Args: []string{"name"}}},
	}
	for _, check := range checks {
		t.Run(check.line, func(t *testing.T) {
			got, err := Parse(check.line)
			if err != nil || !reflect.DeepEqual(got, check.want) {
				t.Fatalf("Parse() = (%+v, %v), want (%+v, nil)", got, err, check.want)
			}
		})
	}
}

func TestMalformedCommandsReturnErrors(t *testing.T) {
	for _, line := range []string{
		"",
		"UNKNOWN key",
		"GET",
		"GET key extra",
		"SET key",
		"DEL",
		"EXPIRE key nope",
		"TTL key extra",
	} {
		t.Run(line, func(t *testing.T) {
			if _, err := Parse(line); err == nil {
				t.Fatalf("Parse(%q) returned nil error", line)
			}
		})
	}
}
