package expression

import "testing"

func TestPrecedenceParenthesesAndAssociativity(t *testing.T) {
	checks := []struct {
		input string
		want  float64
	}{
		{"1 + 2 * 3", 7},
		{"(1 + 2) * 3", 9},
		{"10 - 3 - 2", 5},
		{"20 / 5 * 2", 8},
	}
	for _, check := range checks {
		t.Run(check.input, func(t *testing.T) {
			expression, err := Parse(check.input)
			if err != nil {
				t.Fatal(err)
			}
			got, err := Evaluate(expression)
			if err != nil || got != check.want {
				t.Fatalf("Evaluate() = (%v, %v), want (%v, nil)", got, err, check.want)
			}
		})
	}
}

func TestMalformedExpressionsReturnErrors(t *testing.T) {
	for _, input := range []string{"", "1 +", "(1 + 2", "1 2", "1 + * 2"} {
		t.Run(input, func(t *testing.T) {
			if _, err := Parse(input); err == nil {
				t.Fatalf("Parse(%q) returned nil error", input)
			}
		})
	}
}

func TestDivisionByZeroReturnsError(t *testing.T) {
	expression, err := Parse("1 / 0")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Evaluate(expression); err == nil {
		t.Fatal("division by zero returned nil error")
	}
}
