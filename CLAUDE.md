# CLAUDE.md

<!-- bkit:start -->

<!-- bkit:managed v5.5.1 — do not edit; run `bkit upgrade` to refresh -->

- **Rules file:** Read `.agents/rules.md` → follow all rules.

**Memory hygiene:** Claude Code auto-memories (`MEMORY.md` + `memory/*.md`) are pointers, never copies. Facts in `docs/*.md`, `.agents/rules.md`, or `CLAUDE.md` → ONLY save path, section, and one-line hook. Issue states → query tracker or `docs/roadmap.md`; NEVER snapshot into memory.

<!-- bkit:end -->
