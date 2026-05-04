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

### ⚠️ One-time consumer config (pnpm 10+)

pnpm 10 sandboxes build scripts of git-hosted dependencies by default for security (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`). bkit needs its `prepare` script to run (it compiles TypeScript → `dist/`), so the consumer repo must allowlist it once:

**Option A — `pnpm-workspace.yaml`** (recommended for monorepos):

```yaml
onlyBuiltDependencies:
  - "@bartens/bkit"
```

**Option B — `package.json`** (single-package repos):

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@bartens/bkit"]
  }
}
```

Re-run `pnpm install` after adding this. Without it, bkit's `dist/` won't be built and the `bkit` bin won't resolve.

### Then in the consumer repo

```bash
pnpm exec bkit init       # first-time bootstrap (also runs first install)
pnpm exec bkit install    # ongoing sync (run after `pnpm update @bartens/bkit`)
pnpm exec bkit check      # drift detection (CI gate; exit non-zero on drift)
```

**Auth:** consumer needs read access to `github.com/cbartens/bkit` — SSH key or HTTPS PAT (`GH_TOKEN`) configured for git.

## Documentation

**Full reference:** [`.agents/README.md`](.agents/README.md) — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** [`.agents/workflows.md`](.agents/workflows.md).

**Subagent metadata:** [`.agents/prompts.md`](.agents/prompts.md).
