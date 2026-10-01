// Package lexer is the Day 21 tokenization exercise.
package lexer

type TokenType uint8

const (
	Illegal TokenType = iota
	EOF
	Identifier
	Number
	String
	Operator
	LeftParen
	RightParen
)

type Token struct {
	Type     TokenType
	Literal  string
	Position int
}

type Lexer struct{}

func New(input string) *Lexer { panic("TODO") }
func (l *Lexer) Next() Token  { panic("TODO") }
func (l *Lexer) All() []Token { panic("TODO") }
