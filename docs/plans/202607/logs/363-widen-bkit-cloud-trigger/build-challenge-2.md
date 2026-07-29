Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS / tenancy.

## Findings Log

Scope: `git diff $(git merge-base HEAD origin/dev)..HEAD` — full diff read (host mirrors under `.claude/`, `.cursor/`, `.opencode/` differ from their `.bkit/` sources only in frontmatter / tracker-block rendering — the changed logic blocks, including the new `CI_DEV` branch, are identical, so findings carry across unchanged; `.bkit/templates/.github/workflows/bkit-cloud.yml` differs from the live copy only in the `{{CLOUD_RUNNER}}` substitution, so every finding below applies to both). Not a partial diff.

Verified-good (no finding): untrusted `head_commit.message` / `head_sha` are passed via the ctx step's `env:` block and only ever consumed as `printf '%s' "$COMMIT_MSG" | grep`, never inlined into `${{ }}` in a `run:` body — the GHA-injection rule in `docs/security.md` is honoured. `actions/checkout` pins `ref: dev`, so the guard's `. .bkit/scripts/bkit-counter-bus-config.sh` sources trusted code, not PR-head code. The `dev` FID derivation is slug-asserted before use. No secrets are echoed, and `git push` stderr is suppressed.

Prioritized findings (5): 0 CRITICAL, 1 HIGH, 2 MEDIUM, 2 LOW.

### F1 — HIGH · mechanical · `.github/workflows/bkit-cloud.yml:329,364-368` (+ `:565,586-590`; mirrored in `.bkit/templates/.github/workflows/bkit-cloud.yml`)

**Unvalidated PR-body `bkit:fid=` value reaches filesystem-path construction and a `git commit`/`git push origin dev` inside the new `bkit_dev_dispatch_guard`.**

On the `feat/**`/`fix/**` branch of SHARED-DERIV, `FID` is extracted as `grep -oE 'bkit:fid=[^[:space:]>]+'` (charset admits `/`, `.`, `..`) and is **never** slug-asserted before the new `fix/*` call site passes it to `bkit_dev_dispatch_guard "$FID" "$HEAD_SHA"`. Inside the guard the value is interpolated into `find -path "docs/plans/*/logs/$guard_fid"` (:218), the fallback path `status_dir="docs/plans/$(date -u +%Y%m)/logs/$guard_fid/"` (:221), `mkdir -p` (:223), `status_file` (:224), `git add`/`git commit -m "docs($guard_fid): …"` and `git show "origin/dev:${status_file}"`. Contrast the `dev` branch, which _does_ assert `^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$` at :285 before any use.

This directly violates the documented MUST in `docs/security.md` § CI Auto-Route Trust → **FID slug allowlist**: "every FID resolution site MUST assert a strict slug allowlist before path construction … rejecting `/`, `.`, `..` … so a marker like `bkit:fid=../../elsewhere` cannot redirect writes." The new guard is a new FID resolution/path-construction site and was shipped without the assertion; the same doc's new #363 paragraph asserts the allowlist is applied — the claim is true only for the `dev` path, not for the `fix/**` path that shares the guard.

**Exploit scenario:** an actor who can author a PR body on a `fix/**` branch (collaborator on a private consumer repo; any fork contributor whose CI is allowed to run on a public one) sets `bkit:issue=#<any issue carrying bkit:auto>` plus `bkit:fid=../../../../.bkit/scripts`, and lands a commit whose subject contains `bkit [auto route]`. On the first red CI run the privileged `workflow_run` job resolves `status_dir` to `docs/plans/YYYYMM/logs/../../../../.bkit/scripts/`, `mkdir -p`s and appends `status.jsonl` outside the intended log tree, then **commits it and pushes it to `dev`** as `bkit-auto[bot]`. Variants reach any in-repo directory (`.github/workflows/**` is blocked only incidentally, by GITHUB_TOKEN lacking the `workflows` scope) or write outside `$GITHUB_WORKSPACE` on the runner. Glob metacharacters are also live: `bkit:fid=*` makes the `find -path` pattern match an unrelated FID's log dir and redirects the write there.

**Suggested fix:** assert the allowlist on `FID` at the top of `bkit_dev_dispatch_guard` (both job copies + template), fail-closed on mismatch: `[[ "$guard_fid" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]] || { echo "::notice::Invalid FID '$guard_fid' — refusing to write counter."; return 1; }` — or, better, apply the same assertion to the marker-derived `FID` in the `feat/**`/`fix/**` branch itself (falling through to the branch-derive fallback on failure, exactly as `docs/security.md` prescribes), so every downstream consumer inherits it.

### F2 — MEDIUM · mechanical · `.bkit/workflows/bkit-auto.md:86-102` (new `CI_DEV` branch of Step 5; mirrors `.claude/commands/bkit-auto.md`, `.opencode/commands/bkit-auto.md`)

**New `CI_DEV` FID resolution site sets `FID="$ARG"` with a non-empty check only — no slug allowlist.**

Step 5's new else-branch does `FID="$ARG"`, derives `ISSUE_ID` from it, and asserts only `ISSUE_ID` non-empty; the added Step-1 checklist row likewise says "CI_DEV placeholders **non-empty** (`FID`, `ISSUE_ID`, `BRANCH`, `HEAD_SHA`)". Every other FID resolution site in this file carries `[[ "{FID}" =~ ^[a-z0-9][a-z0-9-]*$ ]]` (Step 9 marker path, Step 10 branch-derive path — the latter re-asserted in this same diff when `fix/` was folded in). `{FID}` flows straight into `docs/plans/{YYYYMM}/logs/{FID}/`, `.worktrees/{FID}` and the `/bkit-debug {FID}` dispatch, so this is exactly the site class `docs/security.md` § FID slug allowlist says MUST assert.

**Exploit scenario:** `/bkit-auto` is not reachable only from `bkit-cloud.yml` — it is an operator-invocable command (`/bkit-auto debug <arg>`) and, in the cloud path, `ARG` is only filtered by the coarse `^[0-9A-Za-z._/-]+$` guard at `bkit-cloud.yml:376`, which explicitly permits `.` and `/`. An `ARG` of `../../../.bkit` therefore passes the workflow-side guard, passes `CI_DEV` (non-empty), and reaches `mkdir -p docs/plans/{YYYYMM}/logs/../../../.bkit/` plus `.worktrees/../../../.bkit` — redirecting bookkeeping writes and worktree creation outside the log tree, with the cloud job holding `contents: write` and pushing to `dev`.

**Suggested fix:** in the `CI_DEV` branch add the tracker-agnostic assertion before use — `[[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]` (or the file's existing `^[a-z0-9][a-z0-9-]*$`) → **Failure Path** on mismatch — and tighten the Step-1 checklist row from "non-empty" to "slug-asserted". Optionally narrow `bkit-cloud.yml`'s `ARG` guard to drop `/` and `.` for the CI-driven paths.

### F3 — MEDIUM · architectural · `.github/workflows/bkit-cloud.yml:33-36,102-108,412-418` (+ template)

**The widened `workflow_run` trigger adds a privileged `git push origin dev` on a code path reachable from untrusted PR-origin events, with no `head_repository == repository` guard.**

`workflow_run` always executes in the _base_ repo context with `contents: write`, `issues: write`, `pull-requests: write`, `id-token: write` and `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` in scope — including when the triggering CI run came from a fork PR (the classic "pwn request" shape). The pre-existing `feat/**` filter already had this exposure, but this diff (a) folds in `fix/**`, whose CI **success** now auto-merges via `/bkit-ship` ("newly folded — fix-PR green CI now auto-merges via the cloud", :16-17), and (b) newly makes that untrusted-origin path perform `git commit` + `git push origin dev` from the ctx step itself (F1's guard), i.e. a write to the integration branch driven by attacker-supplied data before any agent even boots. No condition anywhere checks `github.event.workflow_run.head_repository.full_name == github.repository` or `event == 'push'` for the `dev` row.

**Exploit scenario (public consumer repo — this template ships to consumers; `cbartens/bkit` itself is private, so the repo-local blast radius is collaborator-only):** a fork contributor whose CI is allowed to run opens a PR from branch `fix/363-x`, puts `bkit [auto route]` in the head commit subject and `bkit:issue=#N` (any issue already carrying `bkit:auto`) in the PR body. The free-tier gate and the live kill switch both pass — the attacker controls both signals the gate reads, and the label check is on _someone else's_ issue. Green CI → the cloud dispatches `/bkit-ship <PR>` with write scope, merging unreviewed fork code into `dev`. Red CI → `/bkit-debug` is dispatched against the fork branch with secrets present, after the guard has already pushed to `dev`.

**Suggested fix:** add a same-repo predicate to both jobs' `if:` gate — `github.event_name == 'workflow_dispatch' || github.event.workflow_run.head_repository.full_name == github.repository` — and additionally require `github.event.workflow_run.event == 'push'` for the `dev` row. Record the fork-origin trust boundary in `docs/security.md` § CI Auto-Route Trust alongside the existing collaborator-vs-collaborator note, which currently scopes the threat model to collaborators only and does not cover fork-originated `workflow_run`.

### F4 — LOW · mechanical · `.github/workflows/bkit-cloud.yml:309` (new `dev` path; also `:550`, + template)

**Kill-switch label check is an unanchored substring match.**

The new `dev` route re-implements the live revocation check as `[ ... ] | grep -q 'bkit:auto'` over a comma-joined label list. Any label whose name merely _contains_ `bkit:auto` satisfies it — e.g. `bkit:auto-disabled`, `bkit:auto-paused`, `no-bkit:auto`. The pattern is copied from the pre-existing `feat/**` path, but this diff replicates it onto a new, post-merge surface where the kill switch is the only human veto between a red `dev` CI and an automatically dispatched paid agent session with `contents: write`.

**Exploit scenario:** an operator revokes automation by swapping `bkit:auto` for a `bkit:auto-paused` marker label (a natural convention, and precisely the shape the substring test fails on) and believes the route is disabled; every subsequent post-merge `dev` CI failure on that FID still dispatches `/bkit-debug`, up to the cap, spending budget and pushing commits to `dev`.

**Suggested fix:** match exactly — `jq -e '[.labels[].name] | index("bkit:auto")'` on the `gh issue view --json labels` output, or `grep -qx 'bkit:auto'` over a newline-separated list. Apply to all four call sites so the `feat/**` path is not left divergent.

### F5 — LOW · architectural · `.github/workflows/bkit-cloud.yml:213-260` + `.bkit/scripts/bkit-counter-bus-config.sh:24`

**The dispatch cap — explicitly designated a security control — is enforced from a repo file the controlled principal can rewrite.**

`docs/security.md` (new #363 paragraph) states `MAX_DEV_DISPATCH_ATTEMPTS=3` "is itself a cost/security control: without it, a stuck `dev`/`fix/**` feedback loop could dispatch unbounded paid agent sessions". Enforcement reads `dev-dispatch` rows out of `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` on `origin/dev` — the same file the dispatched `/bkit-debug` session writes to, with `contents: write`, and the operator-facing reset procedure is literally "delete dev-dispatch rows in status.jsonl to reset" (:239). There is no independent counter (no GitHub Actions cache, no issue-comment ledger, no run-count query), so any actor or malfunctioning/prompt-injected agent that can push to `dev` — which every dispatched session can — resets the only bound on the loop back to zero.

**Exploit scenario:** a `/bkit-debug` session dispatched by this route is steered (by a poisoned failure log or test fixture it reads as context) into rewriting `status.jsonl` — a file it legitimately edits every run — dropping the `dev-dispatch` rows. The cap silently returns to 3 remaining, and the failure→debug→push→failure cycle continues indefinitely, billing agent minutes and repeatedly pushing to `dev` until a human notices. The fail-closed push verification (:250-257) protects only against _under_-counting from lost pushes, not against deliberate or accidental _reset_.

**Suggested fix:** derive the count from a source the dispatched session cannot rewrite — e.g. `gh run list --workflow bkit-cloud.yml` filtered by FID, or an append-only tracker comment/label written with a token the session does not hold — or, minimally, cross-check the file-derived count against `gh api` run history and take the maximum before dispatching. At the very least, document the self-reset property next to the "cost/security control" claim in `docs/security.md` rather than presenting the cap as a hard bound.
