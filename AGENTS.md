# AGENTS.md

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

- **Rules file:** Read `.agents/rules.md` → follow all rules.
- **Workflows:** **If** the prompt contains `bkit-{command}` (`bkit-design`, `bkit-plan`, `bkit-build`, `bkit-debug`, `bkit-ship`, `bkit-auto`) → read `.bkit/router.md` → follow it. **Else** → no workflow routing; handle the request as asked.
- **Memory hygiene:** agent memories (notes a host keeps across sessions) are pointers, never copies. Facts in `docs/*.md` or `.agents/rules.md` → save only path, section and one-line hook. Issue states → query the tracker or `docs/roadmap.md`; NEVER snapshot them into memory.

<!-- bkit:end -->
