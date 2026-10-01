package jsonparser

import (
	"reflect"
	"testing"
)

func TestObjectsArraysNestingAndEscapes(t *testing.T) {
	input := `{"name":"Mohamed","age":23,"active":true,"tags":["go",null],"meta":{"line":"a\nb"}}`
	want := map[string]any{
		"name":   "Mohamed",
		"age":    float64(23),
		"active": true,
		"tags":   []any{"go", nil},
		"meta":   map[string]any{"line": "a\nb"},
	}
	got, err := Parse(input)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Parse() = %#v, want %#v", got, want)
	}
}

func TestScalarAndEmptyContainers(t *testing.T) {
	checks := []struct {
		input string
		want  any
	}{
		{"null", nil},
		{"false", false},
		{"-12.5e2", float64(-1250)},
		{"[]", []any{}},
		{"{}", map[string]any{}},
	}
	for _, check := range checks {
		t.Run(check.input, func(t *testing.T) {
			got, err := Parse(check.input)
			if err != nil || !reflect.DeepEqual(got, check.want) {
				t.Fatalf("Parse(%q) = (%#v, %v), want %#v", check.input, got, err, check.want)
			}
		})
	}
}

func TestMalformedOrTrailingInputReturnsError(t *testing.T) {
	for _, input := range []string{`{"a":1,}`, `{"a" 1}`, `[1 2]`, `"unterminated`, `true false`} {
		t.Run(input, func(t *testing.T) {
			if _, err := Parse(input); err == nil {
				t.Fatalf("Parse(%q) returned nil error", input)
			}
		})
	}
}
