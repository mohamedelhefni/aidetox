// Command aidetox serves the built website (web/dist) plus a local runner that executes
// the repo's real Go tests, for the Go-only days that can't run in the browser.
//
// Run from the repo root: (cd web && npm run build) && go run ./cmd/aidetox
package main

import (
	"context"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type Challenge struct {
	ID      string `json:"id"`
	Track   string `json:"track"`
	Title   string `json:"title"`
	Brief   string `json:"brief"`
	File    string `json:"file"`
	Starter string `json:"starter"`
}

var (
	filesRe = regexp.MustCompile("\\*\\*Files:\\*\\* `([^`]+)`")
	dayRe   = regexp.MustCompile(`^#\s*(Day \d+ — |\d+\. )?`)
)

// tracks maps a brief glob to its track name.
var tracks = []struct{ glob, name string }{
	{"challenges/*.md", "Build from scratch"},
}

// loadChallenges reads briefs from disk on every call so new ones show up without a restart.
func loadChallenges() ([]Challenge, error) {
	var out []Challenge
	for _, t := range tracks {
		paths, err := filepath.Glob(t.glob)
		if err != nil {
			return nil, err
		}
		for _, p := range paths {
			brief, err := os.ReadFile(p)
			if err != nil {
				return nil, err
			}
			m := filesRe.FindSubmatch(brief)
			if m == nil {
				continue // brief without a work file
			}
			file := string(m[1])
			starter, err := os.ReadFile(file)
			if err != nil {
				return nil, err
			}
			title, _, _ := strings.Cut(string(brief), "\n")
			out = append(out, Challenge{
				ID:      strings.TrimSuffix(filepath.Base(p), ".md"),
				Track:   t.name,
				Title:   dayRe.ReplaceAllString(title, ""),
				Brief:   string(brief),
				File:    file,
				Starter: string(starter),
			})
		}
	}
	return out, nil
}

func handleChallenges(w http.ResponseWriter, r *http.Request) {
	cs, err := loadChallenges()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cs)
}

type runRequest struct {
	File   string            `json:"file"`   // challenge being run
	Drafts map[string]string `json:"drafts"` // work file -> code; lets day 12 see your day 11 graph
}

func handleRun(w http.ResponseWriter, r *http.Request) {
	var req runRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	cs, err := loadChallenges()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	known := map[string]bool{}
	for _, c := range cs {
		known[c.File] = true
	}
	if !known[req.File] {
		http.Error(w, "unknown challenge file", http.StatusBadRequest)
		return
	}

	tmp, err := os.MkdirTemp("", "aidetox-")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.RemoveAll(tmp)

	// go test -overlay swaps file contents without touching the repo or copying it.
	replace := map[string]string{}
	for path, code := range req.Drafts {
		if !known[path] { // only work files may be overridden, never tests
			continue
		}
		abs, _ := filepath.Abs(path)
		dst := filepath.Join(tmp, strings.ReplaceAll(path, "/", "_"))
		if err := os.WriteFile(dst, []byte(code), 0o600); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		replace[abs] = dst
	}
	overlay := filepath.Join(tmp, "overlay.json")
	b, _ := json.Marshal(map[string]any{"Replace": replace})
	os.WriteFile(overlay, b, 0o600)

	ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "go", "test", "-count=1", "-timeout=30s", "-overlay="+overlay, "./"+filepath.Dir(req.File))
	out, err := cmd.CombinedOutput()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"passed": err == nil, "output": string(out)})
}

func main() {
	// ponytail: submitted code runs unsandboxed as your user. Fine on localhost;
	// before hosting publicly, run `go test` inside a container/gVisor/nsjail.
	addr := flag.String("addr", "127.0.0.1:8080", "listen address")
	flag.Parse()

	http.Handle("GET /", http.FileServer(http.Dir("web/dist")))
	http.HandleFunc("GET /api/challenges", handleChallenges)
	http.HandleFunc("POST /api/run", handleRun)
	log.Printf("aidetox on http://%s", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
