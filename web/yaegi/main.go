//go:build js

package main

import (
	"bytes"
	"syscall/js"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

// runGo evaluates each source chunk in order in one interpreter and returns combined output.
func main() {
	js.Global().Set("runGo", js.FuncOf(func(this js.Value, args []js.Value) any {
		var out bytes.Buffer
		i := interp.New(interp.Options{Stdout: &out, Stderr: &out})
		i.Use(stdlib.Symbols)
		for _, a := range args {
			if _, err := i.Eval(a.String()); err != nil {
				out.WriteString("\n@@CE " + err.Error() + "\n")
				break
			}
		}
		return out.String()
	}))
	select {}
}
