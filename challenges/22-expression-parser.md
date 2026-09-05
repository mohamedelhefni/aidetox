# Day 22 — Expression Parser

**Timebox:** 2 hours  
**Files:** `pkg/expression/parser.go`, `pkg/expression/parser_test.go`

Parse and evaluate or build an AST for `+`, `-`, `*`, `/`, and parentheses while preserving precedence. Start from this grammar:

```text
expr   = term (("+" | "-") term)*
term   = factor (("*" | "/") factor)*
factor = NUMBER | "(" expr ")"
```

Test precedence, associativity, nesting, missing operands/parentheses, unexpected tokens, and division by zero according to your chosen contract.

