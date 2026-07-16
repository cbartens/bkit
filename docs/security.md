<!-- bkit:start -->

<!-- bkit:managed v4.5.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Security

> [!CAUTION]
> **Purpose:** Authentication, authorization, input validation, rate limiting, secrets management, PII handling.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Auth standards live ONLY here. Other docs link, do not restate.

## Supply-Chain (GitHub Actions)

Action SHA-pinning and the dependency-update pipeline — Renovate / Dependabot activation, private-registry read-auth, consumer customization (`renovate-local.json5`), and CVE handling — are CI/CD pipeline rules. Their canonical home is `deployments.md` § GitHub Actions pinning; this section keeps only the security-relevant invariant.

**Token isolation:** Renovate PRs run with a restricted `GITHUB_TOKEN` and have no access to the cloud lane's model-auth secrets (`secrets.ANTHROPIC_API_KEY` / `secrets.OPENCODE_PROVIDER_KEY`) — `bkit-cloud.yml` will not dispatch on them by design. A compromised or malicious dependency PR therefore cannot reach the agent's API credentials.

<!-- bkit:end -->

## Scope

bkit has no database, no server, no user-authentication surface. Security concerns: secrets management (tokens), supply-chain (action pinning), shell-injection guards, PII avoidance in logs.

## Secrets Management

### `.bkit/.env` scope

`.bkit/.env` (gitignored, auto-loaded via `.envrc`/direnv) holds **bkit and agent-tooling secrets ONLY**: tracker / cloud-agent tokens (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `LINEAR_API_KEY`, `ANTHROPIC_API_KEY`, `CURSOR_API_KEY`) and opencode provider keys (`OPENCODE_API_KEY`, `NVIDIA_API_KEY`, `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_API_KEY`).

App/stack credentials do NOT belong here — an app's runtime keys AND the `/bkit-debug` observability tokens (e.g. a deploy-host or database log-read token) live in the app's own env files (e.g. `apps/web/.env.local`, sourced by `.envrc`). Never re-add stack creds to `.bkit/.env`. Runtime-log source config → `.agents/config.md` (see `docs/observability.md`).

`LINEAR_ISSUE_ID` is injected per-session by the cloud integration — never put it in `.bkit/.env`.

### Credential surfaces

<!-- prettier-ignore -->
| Credential | Scope | Notes |
| --- | --- | --- |
| `GH_BKIT_TOKEN_INSTALL` | Registry read-auth for `@cbartens/bkit` | Classic PAT, `read:packages`. Required at four surfaces — see `docs/deployments.md` for the presence matrix. |
| `GH_BKIT_TOKEN` | GitHub MCP server; self-hosted Renovate platform auth | Broader fine-grained write PAT. **Cannot** authenticate to GitHub Packages (fine-grained PATs 403 there) — registry auth stays on `GH_BKIT_TOKEN_INSTALL`. Keep the two separate (least privilege). |
| `NODE_AUTH_TOKEN` | `npm publish` in `release.yml` | Set from `${{ secrets.GITHUB_TOKEN }}` (auto-injected) with `permissions: packages: write`. Never persisted outside the CI job. |
| opencode provider keys | opencode host model access | Referenced as `{env:KEY}` in `.opencode/opencode.json` — never inlined. In CI the single `OPENCODE_PROVIDER_KEY` secret fans out to the configured provider's env-var name. |
| `ANTHROPIC_API_KEY` / `CURSOR_API_KEY` / `LINEAR_API_KEY` | Cloud agents and tracker | Optional; opt-in surfaces only. |

### `GH_BKIT_TOKEN_INSTALL`

Must be a **classic** GitHub PAT with `read:packages` scope. A fine-grained PAT cannot authenticate to the GitHub Packages npm registry — never substitute one (`bkit install` Phase 3 states classic; `docs/deployments.md` § presence matrix scaffolds `<classic PAT>`).

- NEVER commit the token as a literal value anywhere. The committed `.npmrc` carries ONLY the registry mapping; the token goes into pnpm's user-level config via `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"` (not the project `.npmrc` — pnpm >=10.34.3 401s on a project-`.npmrc` env-substitution; see `docs/knowledge.jsonl` KN-CORE-7).
- NEVER log or print the token value. `detectShellToken` (Phase 3) reads the env var's presence; it does NOT log its value.
- `git status` review before every commit — `.env*` files are in `.gitignore` and must never be staged.

### `.claude/cloud.md` — generated, holds live secrets

`bkit install` / `upgrade` generate `.claude/cloud.md` with the Claude-Code-on-the-web env block resolved to **REAL secret values**. Handling rules:

- **Gitignored + `chmod 600`. NEVER commit it.** It is deliberately UNTRACKED — absent from every WriteSet / manifest / `canonicalHashes` — so it never enters `bkit check` drift or the upgrade template walk (its values are machine-local and expected to differ).
- **Resolution follows the consumer's `.envrc`** — bkit reads whatever dotenv files it sources and honours its `unset` lines. bkit hardcodes NO stack-specific key list; that knowledge stays in the consumer's `.envrc`, keeping bkit's shipped surface stack-independent.
- **Session-hijack keys are always dropped** from the paste block: `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`. Exporting them into a cloud env redirects Claude Code's OWN model calls onto API-key billing instead of the user's subscription.
- Empty-valued keys are skipped; absent baseline tokens (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`) emit a placeholder, never a fabricated value.

## Shell Injection

Any subprocess call that INTERPOLATES a variable MUST use `execFileSync` (not `execSync`) to bypass shell metacharacter interpretation. Pattern:

```ts
execFileSync("vercel", ["env", "ls", env]); // correct
execSync(`vercel env ls ${env}`); // PROHIBITED
```

`execSync` is permitted ONLY with a constant, fully-literal command string. Prefer non-throwing `spawnSync` where a non-zero exit is an expected answer rather than an error — a try/catch-default-return around it reads as an error-obscuring catch to `slop:delta`.

Add runtime type-guards for any string passed to subprocess arguments, even TypeScript-typed ones (type erasure at runtime). See `docs/knowledge.jsonl` KN-6.

GHA-injection: user-controlled text (commit message, PR title, dispatch inputs) reaches a `run:` body ONLY via `env:` (runtime expansion), never inlined into `${{ }}` — see `docs/deployments.md` § `bkit-cloud.yml`.

## CI Auto-Route Trust (bkit-cloud)

**PR-body marker trust:** The `bkit-cloud.yml` SHARED-DERIV block parses `bkit:issue=#N` / `bkit:fid=X` from the PR body to resolve which issue's `bkit:auto` label to re-check (kill switch). The PR body is editable by anyone with triage/write on the PR — it is collaborator-trusted, not commit-signed. A collaborator who edits the PR body to point at a different issue could defeat the live kill switch for the original issue (if the replacement issue still carries `bkit:auto`). Mitigation: the `bkit [auto route]` commit marker (free tier) must still be present on HEAD; editing the PR body cannot forge a commit marker. The trust gap is collaborator-vs-collaborator only (not external), and the branch-derived FID fallback fires when body markers are absent. Future hardening: cross-check `bkit:issue` against `gh pr view --json closingIssuesReferences`.

## PII

bkit does not process, store, or transmit user PII. Log lines use the `[bkit-*]` prefix format per the naming convention. Never log consumer repo content verbatim in production output paths.

## RLS

Not applicable — bkit has no database.
