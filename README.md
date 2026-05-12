# bkit

Agent workflow system wiring Claude Code (and Cursor) into a five-phase Linear-integrated dev cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

> [!IMPORTANT]
> **`GH_BKIT_TOKEN` is required everywhere bkit installs.** Without it, `pnpm install` fails with an opaque 401 (or the silent-ignore-then-fall-back-to-npmjs footgun → 404). Set it in **all four** places before running `pnpm add -D @cbartens/bkit`:
>
> 1. **Local shell** — `export GH_BKIT_TOKEN=<classic PAT, read:packages>` in your shell rc
> 2. **`.npmrc` at repo root** — two lines (registry + auth) — see § Consumer CI auth below
> 3. **GitHub Actions repo secret** — `gh secret set GH_BKIT_TOKEN --body=<token>` per consumer repo
> 4. **Vercel env vars** (if applicable) — `vercel env add GH_BKIT_TOKEN preview/production`
>
> **Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403 even when `Packages: read` is granted (verified 2026-05). Until GitHub fixes this, classic with `read:packages` scope is the only working option.

## Install

bkit is distributed via the **GitHub Packages npm registry** (`https://npm.pkg.github.com`). Add to a consumer repo:

```bash
pnpm add -D @cbartens/bkit@^2.0.0
```

### Adding a new consumer — checklist

Run these in order on a brand-new consumer repo. Each step links to its detail section below.

| #   | Step                                                                                                       | Detail                                          |
| --- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | Create a classic PAT with `read:packages` (fine-grained PATs are rejected by GitHub Packages)              | [§ Consumer CI auth](#consumer-ci-auth) step 1  |
| 2   | Add `GH_BKIT_TOKEN` repo secret                                                                            | [§ Consumer CI auth](#consumer-ci-auth) step 2  |
| 3   | Commit `.npmrc` at repo root (registry + `${GH_BKIT_TOKEN}` substitution)                                  | [§ Consumer CI auth](#consumer-ci-auth) step 3  |
| 4   | Export `GH_BKIT_TOKEN` locally (`export GH_BKIT_TOKEN=…` in shell rc) and run `pnpm add -D @cbartens/bkit` | [§ Install](#install) (this section)            |
| 5   | Run `pnpm exec bkit install` to seed the full stack                                                        | [§ Install](#install) (this section)            |
| 6   | If deploying to Vercel: add `GH_BKIT_TOKEN` to Vercel env vars                                             | [§ Consumer Vercel auth](#consumer-vercel-auth) |
| 7   | Push to a feature branch and verify CI runs green                                                          | —                                               |

The seeded `.github/workflows/ci.yml` carries the install step env block — the only thing CI needs to authenticate `@cbartens/bkit` is the `GH_BKIT_TOKEN` secret set in step 2. No cross-org `uses:` reference is added; `bkit` stays private without affecting consumer auth.

### Then in the consumer repo

Run `bkit install` once to seed the full stack (agent files, CI, lint, git-hooks). Re-run after package updates. Use `bkit check` as a CI drift gate.

```bash
# First install — seeds full stack (all modules: core + claude + cursor + ci + lint + git-hooks)
pnpm exec bkit install

# Selective install — only the modules you need + core (implicit)
pnpm exec bkit install --claude         # .claude/** + core only
pnpm exec bkit install --ci --lint      # CI + lint stack + core; nothing else
pnpm exec bkit install --cursor         # .cursor/** + core only
pnpm exec bkit install --full           # all modules (explicit; same as no flags)

# Ongoing sync — MANDATORY after every `@cbartens/bkit` version bump
pnpm exec bkit install

# Drift detection — exits non-zero if managed files drift from bkit templates (CI gate)
pnpm exec bkit check --full
```

**Module flags:** `--core` `--claude` `--cursor` `--ci` `--lint` `--git-hooks` `--full`. Multiple flags compose. No flags = `--full`.

> **⚠️ Always run `pnpm exec bkit install` after bumping `@cbartens/bkit`.** Plain `pnpm add -D @cbartens/bkit@<new-version>` (or `pnpm update`) only refreshes `package.json` + lockfile — it does **not** resync `.agents/` payload or update the version pin in `.agents/.bkit-version`. Skipping the resync will red CI on the `bkit check` drift gate ("DRIFT DETECTED" on `.agents/.bkit-version`). Commit the resync changes alongside the version bump in the same PR. This applies to every version change — initial 0.3.x → 0.4.0 / 1.x → 2.0.0 cutovers **and** routine 2.0.x → 2.0.y upgrades.

> **⚠️ pnpm 10: `pnpm update @cbartens/bkit` overwrites the manifest range.** pnpm 10 rewrites `package.json` from `"@cbartens/bkit": "^2"` to the resolved exact-minor (e.g. `"^2.0.5"`) and pins the lockfile specifier to match. To preserve a major-floating range, restore the manifest and re-resolve the lockfile after `pnpm update`:
>
> ```bash
> pnpm update @cbartens/bkit
> # Check whether pnpm 10 narrowed the manifest range
> grep '"@cbartens/bkit"' package.json   # expect "^2", not "^2.x.y"
> # If narrowed: edit package.json back to "^2", then re-resolve:
> pnpm install --frozen-lockfile=false
> # Verify lockfile specifier:
> grep -A2 "'@cbartens/bkit'" pnpm-lock.yaml   # expect specifier: ^2
> ```

> **Removed in v0.2.0 (breaking):** `bkit init` (use `bkit install --full`) and `bkit install --host=claude|cursor` (use `--claude` / `--cursor`). Both error as unknown.

## JSON ownership model — deep-containment (v2.0.0+)

Starting v2.0.0, `.claude/settings.json` and `.cursor/hooks.json` are managed via **deep-containment** instead of the former `__bkit__` envelope. bkit declares a scope (the full template JSON tree) that must be present as a subset of the consumer document. Consumer-added keys outside the template tree survive every `bkit install` upgrade byte-identically — no special key or wrapper required.

```json
// .claude/settings.json (v2.0.0+)
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "bash .claude/hooks/preflight.sh" }] }
    ],
    "Stop": [{ "hooks": [{ "type": "command", "command": "postflight.sh" }] }]
  },
  "failClosed": true
}
```

In this example, `hooks.SessionStart` is the bkit-declared scope (from the template). `hooks.Stop` and `failClosed` are consumer-added keys — bkit never touches them.

**Rules:**

- Consumer keys outside the template tree survive every `bkit install` upgrade byte-identically.
- `bkit install` uses `deepContains(template, consumer)` to check that every template leaf is present. On drift, it deep-merges template-wins — consumer-only siblings are preserved.
- `bkit check` surfaces a `tier2-json-drift` advisory when `deepContains` fails; exits 0 so the consumer can review before next install.
- `.cursor/hooks.json` uses the Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.

**Upgrading from v0.8.0–v1.1.1 (legacy `__bkit__` envelope):** Run `pnpm bkit upgrade` after bumping to v2.0.0. bkit automatically strips the `__bkit__` block, verifies deep-containment, and logs `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`. Consumer-added keys are preserved. Re-running is idempotent. See [CHANGELOG v2.0.0](./CHANGELOG.md) for full breaking-change details.

## Consumer CI auth

bkit resolves from the **GitHub Packages npm registry**. Authentication requires:

1. **Create a classic PAT** on GitHub with `read:packages` scope:
   - GitHub Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Scope: `read:packages`
   - Copy the generated token

   > **⚠️ Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403, even when `Packages: read` is granted. Confirmed against `npm.pkg.github.com` 2026-05-06. If/when GitHub fixes this, fine-grained PATs will become preferred (narrower scope); for now classic is the only working option.

2. **Add the secret** to your consumer repo:
   - GitHub repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GH_BKIT_TOKEN`
   - Value: paste the PAT

3. **Add `.npmrc`** at your repo root (committed, no secrets):

   ```
   @cbartens:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}
   ```

4. The seeded `ci.yml` install step already carries the required env block (added by `bkit install`):

   ```yaml
   - name: Install dependencies
     run: pnpm install --frozen-lockfile
     env:
       GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}
   ```

> **⚠️ pnpm silent-ignore footgun:** If `GH_BKIT_TOKEN` is unset (missing shell export, missing GHA secret, missing Vercel env var), pnpm v7.20+ **silently ignores the entire `.npmrc`** and falls back to npmjs.org — which has no `@cbartens/bkit` — producing an opaque 401. The error does NOT say "token missing"; it looks like a generic registry auth failure. Always verify with `echo "${GH_BKIT_TOKEN:-MISSING}"` before `pnpm install` if you're troubleshooting.

### Agent access to `GH_BKIT_TOKEN`

If permission rules block direct reads of `.env*` files (e.g. `Read(./.env*)`, `Bash(grep ... .env*)` denied), the token still cannot be read — but it **can** be exported into a child process for the duration of a single command. Use this pattern in a single Bash tool call:

```bash
set -a; source apps/web/.env.preview 2>/dev/null; set +a; <command that needs the token>
```

- `source` is a shell builtin, not file I/O — the agent's permission layer (which gates `Read` / `grep` / `cat`) does not see it. The token text never enters the agent's context.
- `<command>` (e.g. `pnpm view @cbartens/bkit`, `pnpm exec bkit check`) inherits `GH_BKIT_TOKEN` via the environment.
- Verify the token loaded **without leaking the value**: `echo "len=${#GH_BKIT_TOKEN}"`.

**Caveat:** shell state does not persist between separate Bash tool calls. The `source` and the consuming command MUST run in the **same** invocation — chain with `;` or `&&`. When directing another agent, name the file path explicitly (e.g. _"source `apps/web/.env.preview` in-line; the registry needs `GH_BKIT_TOKEN`"_).

## Consumer Vercel auth

Vercel runs its own `pnpm install` in a fresh build container. With `.npmrc` committed to your repo root, auth is handled via a single Vercel env var — **no `installCommand` shim required**.

1. **Add `GH_BKIT_TOKEN` to Vercel env vars** for each environment that builds (preview + production at minimum):

   ```bash
   vercel env add GH_BKIT_TOKEN preview
   vercel env add GH_BKIT_TOKEN production
   ```

   Or via web: Vercel project → Settings → Environment Variables. Token value is the same PAT used for the GitHub Actions secret (scope: `read:packages`).

2. **Remove any pre-existing `installCommand` git-shim** from `vercel.json` if present:

   ```json
   // REMOVE THIS — no longer needed (was only required for git-dep model):
   {
     "installCommand": "git config --global url.\"https://x-access-token:$GH_BKIT_TOKEN@github.com/cbartens/bkit/\".insteadOf \"https://github.com/cbartens/bkit/\" && pnpm install"
   }
   ```

   With `.npmrc` committed and `GH_BKIT_TOKEN` set as a Vercel env var, a plain `pnpm install` resolves `@cbartens/bkit` from the registry directly.

3. **Trigger a redeploy** (push a commit) and watch the Vercel build log for `pnpm install` resolving `@cbartens/bkit` from `npm.pkg.github.com`.

> **Removed in v0.4.0 (breaking):** Git-dependency install path (`pnpm add -D github:cbartens/bkit#vX.Y.Z`), GHA `Configure private-repo auth` step, and `installCommand` git-shim are all removed. Consumers upgrading from v0.3.x must add `.npmrc`, expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, and drop the auth-shim from CI and Vercel config.

## Install lifecycle

`bkit install` runs three phases in sequence:

**Phase 1 — Preflight (read-only, before any writes)**

bkit checks preconditions and known advisory patterns before touching any file. If a blocker fires, install exits 1 immediately with a formatted `[blocker]` line and zero writes. Advisories are accumulated for Phase 3.

| Severity | When                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| Blocker  | `package.json` absent or unparseable JSON                                         |
| Blocker  | `--core` requested but `.git/` absent                                             |
| Advisory | `.husky/pre-commit` or `pre-push` exists without bkit markers                     |
| Advisory | `.prettierignore` exists without bkit markers                                     |
| Advisory | `lint:prose` script lacks the write-good guard (`[ -d .vale/styles/write-good ]`) |
| Advisory | On-disk `.bkit-version` major > installing major (downgrade)                      |
| Advisory | `node_modules/@cbartens/bkit` version > `.agents/.bkit-version` (stale pin)       |

**Phase 2 — Install (current behaviour)**

Module dispatch writes managed files. Same as before this feature shipped.

**Phase 3 — Post-install (re-detect + unified output)**

After writes, bkit re-runs token-surface and environment checks — some are only accurate post-install (e.g. `.npmrc` content written by the CI module, devDeps added to `package.json`).

| `id`                            | When                                                   |
| ------------------------------- | ------------------------------------------------------ |
| `gh-bkit-token-missing-shell`   | `GH_BKIT_TOKEN` not set in shell                       |
| `npmrc-missing-gh-packages`     | `.npmrc` exists but lacks registry/auth lines          |
| `gh-bkit-token-secret-missing`  | `gh secret list` confirms secret absent                |
| `gh-bkit-token-secret-unknown`  | `gh` CLI unavailable/unauthenticated                   |
| `vercel-env-missing-preview`    | `vercel.json` detected; token absent in preview        |
| `vercel-env-missing-production` | `vercel.json` detected; token absent in production     |
| `ci-yml-missing-token-env`      | ci.yml install step has no `GH_BKIT_TOKEN` env mapping |
| `vale-package-not-synced`       | vale on PATH but `.vale/styles/write-good/` absent     |
| `devdeps-need-fetch`            | bkit added devDeps in this run — `pnpm install` needed |

Phase 1 and Phase 3 findings are merged and deduplicated by `id` (Phase 3 wins on conflict — re-detection is more accurate post-write). If zero findings, no banner is printed.

**`bkit check` (dry-run)** runs Phase 1 and renders any Phase 1 advisories via the same banner formatter. Phase 3 is skipped (check stays read-only). See `docs/knowledge.md` KN-4 for details.

**`PreflightFinding` shape** — the stable contract for downstream tooling:

```typescript
interface PreflightFinding {
  id: string; // stable kebab-case identifier
  severity: "blocker" | "advisory";
  detect: string; // one-line description of the detected condition
  action: string; // AI-pasteable fix instruction
}
```

Findings are rendered in the format `--- i/N [severity] id ---` with `DETECT:` and `ACTION:` sections — copy-paste the whole banner into a coding assistant to apply fixes in sequence.

For the four-surface token sweep, see [§ Consumer CI auth](#consumer-ci-auth).

## Doctor

`bkit doctor` is a **read-only diagnostic verb** — runs Phase 1 preflight + Phase 3 token-surface detectors without writing any files and exits 0.

```bash
# Diagnose drift without running install
pnpm exec bkit doctor
```

Use `bkit doctor` to:

- Check whether `GH_BKIT_TOKEN` is set in the shell and on the GitHub repo.
- Surface `bkit-version-pin-stale` advisory (installed version ahead of `.agents/.bkit-version`).
- Preview all advisories that `bkit install` would show post-install, without triggering writes.
- Verify the environment is ready before running `bkit install` on a new machine.

`bkit doctor` always exits 0. Advisories found → printed in the same checklist banner format as `bkit install`. None found → prints `[bkit-doctor] No advisories found.`

## Uninstall

`bkit uninstall` surgically removes bkit-managed content while preserving consumer customisations.

```bash
# Uninstall full stack (all modules)
pnpm exec bkit uninstall

# Preview what would be removed (no writes)
pnpm exec bkit uninstall --dry-run

# Uninstall specific modules
pnpm exec bkit uninstall --ci --lint

# Also strip managed package.json scripts/devDeps
pnpm exec bkit uninstall --package

# Force-delete byte-equal-text files even if consumer modified them
pnpm exec bkit uninstall --force

# Delete ALL bkit files regardless of consumer modifications (confirm prompt)
pnpm exec bkit uninstall --nuke
# Skip interactive confirm:
pnpm exec bkit uninstall --nuke --yes
```

### Format semantics during uninstall

| Format            | Behaviour                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fully-managed`   | Always deleted (bkit owns 100% of the file).                                                                                                                   |
| `markered-text`   | bkit block stripped; consumer content above/below preserved. File deleted if only whitespace remains.                                                          |
| `byte-equal-text` | Deleted only if current hash matches the hash recorded at install time. Consumer modifications → preserved. No recorded hash (pre-v0.7.x install) → preserved. |

### Idempotency

Running `bkit uninstall` twice is safe — subsequent runs skip absent files and produce zero writes.

## Phase 3 exit-1 and recovery

When `bkit install` detects a **blocker-severity** finding in Phase 3 (e.g. `ci.yml` missing `GH_BKIT_TOKEN` env mapping with `.npmrc` referencing the token), it exits 1 and prints a single-line recovery command:

```
[bkit-install] 1 Phase 3 blocker(s) detected. Recovery:
  pnpm bkit uninstall <flags> && <fix the issue> && pnpm bkit install <flags>
```

Advisories (non-blockers) are informational only and do NOT trigger exit-1.

### --auto-revert

Add `--auto-revert` to `bkit install` to automatically run `bkit uninstall` in-process when a Phase 3 blocker fires:

```bash
pnpm exec bkit install --auto-revert
```

Useful in CI scripts to guarantee a clean state on failure.

## .bkitignore

Create a `.bkitignore` file at your repo root to suppress `bkit check` drift for specific files or JSON keys.

### Syntax

- Lines starting with `#` are comments.
- Blank lines are ignored.
- All other lines are [picomatch](https://github.com/micromatch/picomatch) glob patterns.
- Append `:dotted.key` to ignore a specific JSON key (opt-in, requires `BKIT_BKITIGNORE_PER_KEY=1`).

### Examples

```
# Suppress ci.yml drift entirely (consumer has custom jobs)
.github/workflows/ci.yml

# Suppress all Vale style drift
.vale/**

# Suppress specific JSON key drift (requires BKIT_BKITIGNORE_PER_KEY=1)
.claude/settings.json:hooks.Stop
```

### Per-key mode

Per-key (`:dotted.key`) matching is off by default. Enable with:

```bash
BKIT_BKITIGNORE_PER_KEY=1 pnpm exec bkit check
```

This allows consumers to add their own JSON keys (e.g. `hooks.Stop` in `.claude/settings.json`) without triggering drift detection, while still letting bkit manage its own keys in the same file.

## Upgrade (v0.9.0+)

`bkit upgrade` diffs old vs new template content against your consumer drift and applies non-conflicting changes. Files modified since install are flagged as conflicts — never silently overwritten.

```bash
# Review what would change (no writes)
pnpm exec bkit upgrade --dry-run

# Upgrade non-conflicting files; show conflict list (interactive)
pnpm exec bkit upgrade

# CI-safe: auto-apply non-conflicting; exit non-zero on conflicts
pnpm exec bkit upgrade --non-interactive
```

**Conflict behaviour:** When `bkit upgrade` detects that a managed file has consumer drift (on-disk content differs from the hash recorded at last install), it emits the conflict to stderr and does NOT overwrite the file. The conflict entry includes both the new template content and the current on-disk content — paste into a coding assistant to apply the three-way merge manually.

**How drift detection works:** Each `bkit install` records a `canonicalHashes` map in `.agents/.bkit-version` — sha256 of every file bkit wrote. On upgrade, `bkit upgrade` compares the current on-disk hash to the recorded canonical hash to detect consumer modifications.

**Backward compatibility:** Consumers without a `canonicalHashes` entry (installed before v0.9.0) have no recorded hash for any file. `bkit upgrade` treats these as "unknown" and does not silently overwrite them — run `bkit install` once to seed the canonical hashes before using `bkit upgrade`.

## Transactional install (v0.9.0+)

`bkit install` writes to a `.bkit-staging/<module>/` staging directory per module. Staged files are atomically renamed to their consumer destination only after ALL modules complete successfully.

**Mid-failure guarantee:** If install crashes or is interrupted after some modules complete but before all commit, the staging directory is discarded (`discardAllStaging`). Consumer files are left byte-identical to pre-install state — no partial writes.

**Rollback:** On uninstall or install failure, `.bkit-staging/` is always cleaned up. The staging root never persists in a committed consumer repo state.

## Documentation

**Full reference:** [`.agents/README.md`](.agents/README.md) — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** [`.agents/workflows.md`](.agents/workflows.md).

**Subagent metadata:** [`.agents/prompts.md`](.agents/prompts.md).
