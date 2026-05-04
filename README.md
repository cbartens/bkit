# bkit

Agent workflow system that wires Claude Code (and Cursor) into a five-phase Linear-integrated development cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

## Install

bkit is distributed as a **git dependency** from this private GitHub repo (no npm registry — `package.json` is `private: true`). Add to a consumer repo:

```bash
# pinned to a release tag (recommended)
pnpm add -D github:cbartens/bkit#v0.1.0

# or floating on `main`
pnpm add -D github:cbartens/bkit
```

On install, pnpm clones the repo, runs the `prepare` script (`tsc` → `dist/`), and exposes the `bkit` bin. Then in the consumer repo:

```bash
pnpm exec bkit init       # first-time bootstrap (run once)
pnpm exec bkit install    # ongoing sync (run after `pnpm update @bartens/bkit`)
pnpm exec bkit check      # drift detection (CI gate; exit non-zero on drift)
```

**Auth:** consumer needs read access to `github.com/cbartens/bkit` — SSH key or HTTPS PAT (`GH_TOKEN`) configured for git.

## Documentation

**Full reference:** [`.agents/README.md`](.agents/README.md) — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** [`.agents/workflows.md`](.agents/workflows.md).

**Subagent metadata:** [`.agents/prompts.md`](.agents/prompts.md).
