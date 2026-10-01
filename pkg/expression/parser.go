// Package expression is the Day 22 recursive-descent parser exercise.
package expression

type Expr interface {
	String() string
}

func Parse(input string) (Expr, error)          { panic("TODO") }
func Evaluate(expression Expr) (float64, error) { panic("TODO") }
