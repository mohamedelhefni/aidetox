# Contributing

## Add a challenge
1. Add `challenges/NN-name.md` (brief) and a starter package under `pkg/` or `projects/` whose bodies `panic("TODO")`, plus an acceptance test suite.
2. Add a row to the schedule table in `README.md`.
3. `go test ./...` must compile; tests fail only on the `TODO` panics.

## Website (`web/`)
`cd web && npm ci && npm run build && npm test`

## Deploy (Cloudflare)
Build command: `cd web && npm ci && npm run build` — deploy via `wrangler.json` (`npx wrangler deploy`).
