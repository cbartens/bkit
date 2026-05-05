# bkit

Agent workflow system that wires Claude Code (and Cursor) into a five-phase Linear-integrated development cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

## Install

bkit is distributed as a **git dependency** from this private GitHub repo (no npm registry — `package.json` is `private: true`). Add to a consumer repo:

```bash
# pinned to a release tag (recommended)
pnpm add -D github:cbartens/bkit#v0.2.0

# or floating on `main`
pnpm add -D github:cbartens/bkit
```

> **Heads-up — pnpm tag-drop:** `pnpm add` may rewrite the spec in `package.json` as `git+https://github.com/cbartens/bkit.git` (no `#vX.Y.Z` suffix). The lockfile still pins the resolved commit, so `pnpm install --frozen-lockfile` stays deterministic — but `pnpm update` will float to `main`. After `pnpm add`, verify `package.json` shows `"github:cbartens/bkit#vX.Y.Z"`; if it doesn't, rewrite it and re-run `pnpm install`.

### ⚠️ One-time consumer config (pnpm 10+)

pnpm 10 sandboxes build scripts of git-hosted dependencies by default for security (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`). bkit needs its `prepare` script to run (it compiles TypeScript → `dist/`), so the consumer repo must allowlist it once:

**Option A — `pnpm-workspace.yaml`** (recommended for monorepos):

```yaml
onlyBuiltDependencies:
  - "@cbartens/bkit"
```

**Option B — `package.json`** (single-package repos):

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@cbartens/bkit"]
  }
}
```

Re-run `pnpm install` after adding this. Without it, bkit's `dist/` won't be built and the `bkit` bin won't resolve.

### Then in the consumer repo

Run `bkit install` once to seed the full stack (agent files, CI, lint, git-hooks). After that, re-run `install` after package updates. Use `bkit check` as a CI drift gate.

```bash
# First install — seeds full stack (all modules: core + claude + cursor + ci + lint + git-hooks)
pnpm exec bkit install

# Selective install — only the modules you need + core (implicit)
pnpm exec bkit install --claude         # .claude/** + core only
pnpm exec bkit install --ci --lint      # CI + lint stack + core; nothing else
pnpm exec bkit install --cursor         # .cursor/** + core only
pnpm exec bkit install --full           # all modules (explicit; same as no flags)

# Ongoing sync — re-run after `pnpm update @cbartens/bkit`
pnpm exec bkit install

# Drift detection — exits non-zero if managed files drift from bkit templates (CI gate)
pnpm exec bkit check --full
```

**Module flags:** `--core` `--claude` `--cursor` `--ci` `--lint` `--git-hooks` `--full`. Multiple flags compose. No flags = `--full`.

> **Removed in v0.2.0 (breaking):** `bkit init` (use `bkit install --full`) and `bkit install --host=claude|cursor` (use `--claude` / `--cursor`). Both error as unknown.

**Auth:** consumer needs read access to `github.com/cbartens/bkit` — SSH key or HTTPS PAT (`GH_TOKEN`) configured for git.

## Consumer CI auth

bkit seeds a CI auth shim in `.github/workflows/ci.yml` that allows private-repo `pnpm install` to succeed in GitHub Actions. You must add a secret to your repo:

1. **Create a fine-grained PAT** on GitHub:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Repository access: `cbartens/bkit` only
   - Permissions: **Contents: read** (minimum)
   - Copy the generated token

2. **Add the secret** to your consumer repo:
   - GitHub repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GH_BKIT_TOKEN`
   - Value: paste the PAT

3. **Add allowlist** to your `pnpm-workspace.yaml` or `package.json` (if not already done):

   ```yaml
   # pnpm-workspace.yaml
   onlyBuiltDependencies:
     - "@cbartens/bkit"
   ```

4. **Add CI scripts** to your `package.json` (bkit prints these on first install):
   ```json
   {
     "scripts": {
       "lint:prose": "bash -c 'if command -v vale >/dev/null 2>&1; then vale $(find . -name \"*.md\" -not -path \"*/node_modules/*\"); else echo \"[bkit] vale not in PATH — skipping\"; fi'",
       "lint:slop": "slop-scan scan .",
       "format:check": "prettier --check .",
       "prepare": "husky install"
     }
   }
   ```

The CI shim in `ci.yml` configures git to use `GH_BKIT_TOKEN` for HTTPS auth:

```yaml
- name: Configure bkit auth
  run: git config --global url."https://x-access-token:${{ secrets.GH_BKIT_TOKEN }}@github.com/cbartens/bkit/".insteadOf "https://github.com/cbartens/bkit/"
```

## Consumer Vercel auth

Vercel runs its own `pnpm install` in a fresh build container and **does not** apply the GitHub Actions auth-shim above. If the consumer also deploys via Vercel, you need a parallel setup on the Vercel side.

1. **Add `GH_BKIT_TOKEN` to Vercel env vars** for each environment that builds (preview + production at minimum):

   ```bash
   vercel env add GH_BKIT_TOKEN preview
   vercel env add GH_BKIT_TOKEN production
   ```

   Or via web: Vercel project → Settings → Environment Variables. Token value is the same fine-grained PAT used for the GitHub Actions secret (scope: `cbartens/bkit`, permission: Contents:read).

2. **Add an `installCommand` to your `vercel.json`** (root, or `apps/<name>/vercel.json` for monorepos) that applies the auth-shim before pnpm install:

   ```json
   {
     "installCommand": "git config --global url.\"https://x-access-token:$GH_BKIT_TOKEN@github.com/cbartens/bkit/\".insteadOf \"https://github.com/cbartens/bkit/\" && pnpm install"
   }
   ```

3. **Trigger a redeploy** (push a commit) and watch the Vercel build log for `pnpm install` succeeding.

Without both pieces, Vercel preview builds fail with `fatal: could not read Username for 'https://github.com'` during `git fetch` of the bkit dep — same root cause as the GitHub Actions shim, separate surface to provision.

## Documentation

**Full reference:** [`.agents/README.md`](.agents/README.md) — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** [`.agents/workflows.md`](.agents/workflows.md).

**Subagent metadata:** [`.agents/prompts.md`](.agents/prompts.md).
