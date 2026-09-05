# Day 21 — Lexer

**Timebox:** 90 minutes  
**Files:** `pkg/lexer/lexer.go`, `pkg/lexer/lexer_test.go`

Tokenize identifiers, numbers, strings, operators, parentheses, and EOF. Example: `SET name "Mohamed"` becomes identifier, identifier, string, EOF tokens.

Define token type, literal, and error-position representation before coding. Test whitespace, adjacent punctuation, unterminated strings, empty strings, invalid characters, and end-of-input boundaries using a state-machine style scanner.

