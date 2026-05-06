# bkit

Agent workflow system that wires Claude Code (and Cursor) into a five-phase Linear-integrated development cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

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
pnpm add -D @cbartens/bkit@^0.4.0
```

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

## Documentation

**Full reference:** [`.agents/README.md`](.agents/README.md) — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** [`.agents/workflows.md`](.agents/workflows.md).

**Subagent metadata:** [`.agents/prompts.md`](.agents/prompts.md).
