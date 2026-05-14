<!-- bkit:start -->

# Deployments

> [!CAUTION]
> **Purpose:** Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Pre-push runs the project's gate set locally (see "Pre-push checklist" below); never `--no-verify`.

## Production rollback runbook

> Triggered when a bad commit reaches `main` (production) and must be unwound to a prior known-good SHA. Vercel deployments are assumed; adjust the deploy-side step for other hosting.

### Preconditions

- A known-good SHA on `main` to roll back to. Confirm via `gh run list --branch main --status success --limit 5` (must include the target SHA in green state).
- Local repo on `main`, working tree clean, `gh auth status` green.
- `jq` installed (`brew install jq` / system package manager).

### One-shot script

```bash
pnpm rollback:main <green-sha>
```

The script: (1) saves current branch protection JSON → (2) disables protection → (3) force-resets `main` ref to the green SHA via the GitHub API → (4) restores the saved protection. Idempotent; safe to re-run. Pass `--dry-run` first to print every API call without executing.

### Manual playbook (when the script does not apply)

Use when the script errors, when restoring protection from a non-current owner, or when the platform CLI is unavailable.

1. **Save current protection JSON** so it can be restored verbatim. The GET and PUT shapes differ; capturing the raw GET response avoids hand-mapping fields.
   ```bash
   gh api repos/{OWNER}/{REPO}/branches/main/protection > /tmp/main-protection.json
   ```
2. **Disable protection** so the force-reset is accepted.
   ```bash
   gh api -X DELETE repos/{OWNER}/{REPO}/branches/main/protection
   ```
3. **Force-reset the `main` ref** to the known-good SHA.
   ```bash
   gh api -X PATCH repos/{OWNER}/{REPO}/git/refs/heads/main -f sha=<green-sha> -F force=true
   ```
4. **Restore protection** from the saved JSON. Note the GET → PUT shape mismatch: required-status-checks → required_status_checks, contexts list, etc. Inspect the saved JSON and PUT the equivalent shape.
   ```bash
   gh api -X PUT repos/{OWNER}/{REPO}/branches/main/protection --input /tmp/main-protection.json
   ```
5. **Re-point the production deployment** (Vercel does NOT auto-rollback on git ref rewrites — the deployment alias remains on the most-recently-pushed deployment until manually promoted). Look up the prior good deployment by commit SHA and promote it:
   ```bash
   vercel ls --meta githubCommitSha=<green-sha>
   vercel promote <prior-deployment-url>
   ```
   Without this step the git ref is rolled back but production traffic still serves the bad build.

### Why force-push on `main` alone is not enough

- `git revert` of a cross-branch squash (e.g. a `feat/*` branch that landed directly on `main` instead of `dev`) can delete files that surviving code in `main` still references. The result is a tree that fails CI even though git history is "clean".
- The `feat/*`-onto-`main` path is the root cause that makes recovery destructive; production merges MUST come from `dev` to keep the squash diff scoped to a single feature.
- The pre-push hook is bypassed on `revert-*` branches (test suite skipped — only typecheck + format:check run) so a revert PR can be pushed even when its source state is transitionally inconsistent.

### Post-rollback verification

- `gh api repos/{OWNER}/{REPO}/git/refs/heads/main --jq .object.sha` must equal the green SHA.
- `curl -sI https://{prod-alias}` headers report the rolled-back deployment id.
- Run the production smoke suite to confirm the rolled-back app behaves as expected.

## Dev rollback runbook

> Triggered when a bad commit reaches `dev` and must be unwound to a prior known-good SHA. Use when the rolled-out range included applied migrations — code rollback alone leaves the linked dev DB ahead of the code, and schema-aware tests (cdc-schema, schema-introspection, RLS-aware integration) fail on the otherwise-clean tree. Supabase is assumed; adjust the DB step for other providers.

### Preconditions

- A known-good SHA on `dev` to roll back to. Confirm via `gh run list --branch dev --status success --limit 5` (must include the target SHA in green state).
- Local repo on `dev`, working tree clean, `gh auth status` green.
- `supabase` CLI installed and linked to the dev project (`supabase link --project-ref <dev-ref>`).
- Service-role connection string for the dev DB available in the local env (`SUPABASE_DB_URL` or equivalent).

### Playbook

1. **Force-reset the `dev` ref** to the known-good SHA. `dev` is typically unprotected; if protection is on, follow the production-rollback save/disable/restore pattern.
   ```bash
   git reset --hard <green-sha>
   git push --force-with-lease origin dev
   ```
2. **Reset the linked dev DB.** Drop all consumer-managed schemas with `CASCADE`, truncate the migrations ledger, then replay the surviving migration files. Substitute schema names for the consumer's actual managed set.
   ```bash
   psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS stripe CASCADE;'
   psql "$SUPABASE_DB_URL" -c 'TRUNCATE supabase_migrations.schema_migrations;'
   supabase db push --linked --include-all
   ```
3. **Re-seed fixtures** (if the consumer runs a seed script on dev).
   ```bash
   pnpm db:seed
   ```
4. **Re-trigger CI** on the rolled-back `dev` ref to confirm the green-on-rollback baseline.
   ```bash
   git commit --allow-empty -m "chore: trigger CI after dev rollback"
   git push origin dev
   ```

### Why code-only rollback is not enough

- `git reset` rewinds the source tree; Supabase migrations applied during the rolled-out range remain materialised. The DB has no "unapply" semantics for code-driven migrations.
- Any test that introspects the live schema (column lists, RLS policies, table presence) sees structure the code no longer declares and flags the drift as a failure.
- Re-running `supabase db push --linked --include-all` after truncating the ledger reapplies only the migrations present in the rolled-back tree — bringing the DB back into alignment with the code.

### Post-rollback verification

- `git rev-parse origin/dev` must equal the green SHA.
- `psql "$SUPABASE_DB_URL" -c 'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;'` must match `ls supabase/migrations/` on the rolled-back tree.
- Re-run the schema-aware test suite (`pnpm test:integration` or the consumer's equivalent) to confirm DB and code agree.

<!-- bkit:end -->
