// Package protocol parses commands for the mini Redis project.
package protocol

type Command struct {
	Name string
	Args []string
}

func Parse(line string) (Command, error) { panic("TODO") }
