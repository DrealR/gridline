# GRIDLINE

A real-time, terminal-first cyber arena.

Players jack in via CLI as operators on a shared grid, see each other live, and battle for control in a smooth, cinematic, Matrix-style experience.

## Quickstart (local demo)

Requirements:
- Node.js 18+
- (Optional) Python 3 for static file server

1. Start GRIDLINE core server (includes a local test client):

```bash
node gridline-server.js
```

This will:
- start the HTTP state server at `http://localhost:31337/state`
- jack you in as an operator (see the ASCII grid + prompt)

2. Start the web viewer (separate terminal):

```bash
python3 -m http.server 8000
```

Then open:
- `http://localhost:8000/web-viewer.html`

You will see a live neon sector view driven by the CLI state.

3. Play (from the GRIDLINE terminal):

Commands:
- `/m w|a|s|d` – move
- `/map`        – redraw grid
- `/whoami`     – show your id/role/position
- `/tag`        –
  - INFILTRATOR: mark neutral cell as infiltrated
  - SENTINEL: secure an infiltrated cell
- `/scan`       – SENTINEL only, reveal nearby operators
- `/quit`       – exit local client

## Game loop (v0.1)

- You jack in and are assigned a role:
  - `INFILTRATOR` (◇): spread influence by tagging neutral cells.
  - `SENTINEL` (■): lock down infiltrated cells and scan for opponents.
- Move across the grid and use `/tag` to change control.
- The web viewer shows operators and control in real time.
- Future rounds/scoring will count infiltrated vs secured cells per match.

## OpenCode / AI CLI integration

GRIDLINE is designed so CLIs like OpenCode can act as operators:
- They call the HTTP API exposed by `gridline-server.js`:
  - `POST /join` to register/resume a player
  - `POST /command` to issue moves (`/m`, `/tag`, etc.)
  - `GET /state` for snapshots (used by the web viewer)
- A sample client is provided in `gridline-cli.js`.

Example (after starting the server):

```bash
node gridline-cli.js
```

This will:
- call `/join` to get an id + role
- show the jack-in sequence
- let you play by sending `/command` requests

An OpenCode command would mirror this flow (e.g. `opencode gridline connect`) using the same API, but implemented inside OpenCode.

For now, use `node gridline-server.js` (built-in client) or `node gridline-cli.js` (external client) plus the web viewer to experience GRIDLINE.