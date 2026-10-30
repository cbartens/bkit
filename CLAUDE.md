# CLAUDE.md

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

- **Rules file:** Read `.agents/rules.md` → follow all rules.

**Memory hygiene:** Claude Code auto-memories (`MEMORY.md` + `memory/*.md`) are pointers, never copies.

- For a fact in `docs/*.md`, `.agents/rules.md` or `CLAUDE.md`, save only its path, its section and a one-line hook.
- Query the tracker or `docs/roadmap.md` for an issue's state.
- Never save a snapshot of an issue's state in memory.

<!-- bkit:end -->
