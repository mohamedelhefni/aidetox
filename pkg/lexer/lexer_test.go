package lexer

import (
	"slices"
	"testing"
)

func TestCommandProducesExpectedTokens(t *testing.T) {
	got := New(`SET name "Mohamed"`).All()
	want := []Token{
		{Type: Identifier, Literal: "SET"},
		{Type: Identifier, Literal: "name"},
		{Type: String, Literal: "Mohamed"},
		{Type: EOF},
	}
	assertTokens(t, got, want)
}

func TestAdjacentOperatorsAndParenthesesTokenize(t *testing.T) {
	got := New("sum=(1+23)*2").All()
	want := []Token{
		{Type: Identifier, Literal: "sum"},
		{Type: Operator, Literal: "="},
		{Type: LeftParen, Literal: "("},
		{Type: Number, Literal: "1"},
		{Type: Operator, Literal: "+"},
		{Type: Number, Literal: "23"},
		{Type: RightParen, Literal: ")"},
		{Type: Operator, Literal: "*"},
		{Type: Number, Literal: "2"},
		{Type: EOF},
	}
	assertTokens(t, got, want)
}

func TestInvalidAndEmptyInputTerminate(t *testing.T) {
	if tokens := New("").All(); len(tokens) != 1 || tokens[0].Type != EOF {
		t.Fatalf("empty input tokens = %+v", tokens)
	}
	token := New(`"unterminated`).Next()
	if token.Type != Illegal || token.Position != 0 {
		t.Fatalf("unterminated string token = %+v", token)
	}
}

func assertTokens(t *testing.T, got, want []Token) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("token count = %d, want %d: %+v", len(got), len(want), got)
	}
	for index := range want {
		actual := []any{got[index].Type, got[index].Literal}
		expected := []any{want[index].Type, want[index].Literal}
		if !slices.Equal(actual, expected) {
			t.Fatalf("token %d = %+v, want %+v", index, got[index], want[index])
		}
	}
}
