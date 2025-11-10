# GRIDLINE v0.1 Spec

Goal: Deliver a small, fun, visually satisfying terminal experience where players "jack in" via CLI and see themselves and others on a shared grid in real time.

## Core Concepts

- Players connect as OPERATORS.
- Each operator has:
  - id/handle
  - role: `INFILTRATOR` or `SENTINEL`
  - position on a 2D grid.
- There is a shared GRID (e.g. 8x5) with cells that can be:
  - `.` neutral
  - `i` infiltrated (INFILTRATOR control)
  - `s` secured (SENTINEL control)

## Jack-In Flow (CLI)

1. User runs: `gridline connect`.
2. CLI prints a short cinematic sequence (<= 1s total):
   - `[BOOT] Initializing secure tunnel...`
   - `[LINK] Syncing with GRIDLINE core...`
   - `[AUTH] Generating ident...`
   - `[OK] Welcome, OPERATIVE <handle>.`
   - `[ZONE] Assigned role: <INFILTRATOR|SENTINEL>`
3. Immediately render the GRID with:
   - Player marker for self
   - Markers for other active operators
   - Legend + available commands

## Commands (v0.1)

All commands are short and responsive. Each returns updated state + minimal flavor.

- `/whoami`
  - Show handle, role, coordinates.

- `/map`
  - Redraw the grid and legend.

- `/m <w|a|s|d>`
  - Move 1 cell up/left/down/right if inside bounds.

- `/tag`
  - INFILTRATOR: mark current neutral cell as `i`.
  - SENTINEL: if cell is `i`, flip to `s`.

- `/scan` (SENTINEL only)
  - Reveal nearby operators within radius 2.

## Scoring / Round

- Fixed duration (e.g. 3 minutes) per match.
- Score at end:
  - INFILTRATORS: number of `i` cells
  - SENTINELS: number of `s` cells
- v0.1 can simulate a single shared match without persistence.

## Implementation Notes

- v0.1 can fake "real-time" by:
  - Single local process storing game state in memory or JSON.
  - CLI polling `/map` or re-rendering after each command.
- Focus on:
  - Clean, readable ASCII grid.
  - Fast feedback.
  - Strong "jack in" feeling.

This spec is intentionally tiny so we can implement and iterate visually and mechanically without overcomplicating the system.