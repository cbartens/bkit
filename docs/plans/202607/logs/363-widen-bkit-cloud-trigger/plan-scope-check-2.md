Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Scope Check 2 — #363 widen bkit-cloud trigger

**Plan:** `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v2-reviewed.md`
**Lens:** Plan stays within the settled design boundary — no scope expansion beyond issue-comment decisions; no in-scope work silently dropped; deferred work explicitly logged.

## Findings

None.

## Scope Boundary Trace

### Scope expansion — NONE found

Every task was checked against the OUT-OF-SCOPE list. No smuggling detected.

<!-- prettier-ignore -->
| Out-of-scope item | Verdict | Evidence |
| --- | --- | --- |
| `bkit-ship` Step 10 "Verify Deploy" / ship-verify block / preflight advisories / renumber cascade / ship-verify artifact / Failure-Path sentinel | NOT smuggled | Task 4 scope is **only** `.bkit/workflows/bkit-ship.md` Step 5 lines 634-635 (append `${AUTO_ROUTE_SUFFIX}` to squash `--subject`). No Step 10, no renumber, no block contract. Out of Scope § line 174 fences it explicitly. |
| `main` automation of any kind | NOT smuggled | Task 1b branch filter = `['feat/**', 'fix/**', 'dev']` — `main` absent. Ctx step has `if [ "$BRANCH" = "dev" ]` + `else` (feat/fix); no `main` branch. Header comment (Architecture § item 1) routes `main` to `workflow_dispatch` (manual only). |
| #397 cross-surface same-FID arbitration | NOT smuggled | Only the **shared** `cancel-in-progress: false` flip touches the concurrency surface (Task 1c — in-scope per plan-input line 220). Cross-surface same-FID arbitration remains #397-owned: Out of Scope § line 173 + Supersession Inventory line 519 + Related Issues line 48 all fence it. The `bkit-auto-dev` concurrency group collapses all dev runs into one group (does NOT attempt FID-level mutual exclusion, which GHA cannot see at group-evaluation time). |
| #80 audit-logs-ship migration | NOT smuggled | Out of Scope § line 175 defers it to the triggered debug's `debug-fetch`. No task touches `bkit-utility-audit-logs-ship` or `audit-gcp-errors.sh`. Related Issues line 49 restates the deferral. |

### Silent drops — NONE found

Every IN-SCOPE item maps to at least one concrete task with implementation detail.

<!-- prettier-ignore -->
| In-scope item | Task(s) | Implementation verified |
| --- | --- | --- |
| Widen `workflow_run.branches` to `['feat/**','fix/**','dev']` (not `main`) | Task 1 Sub-step 1b | ✅ Explicit before/after YAML; `Done when` asserts `yq` parse contains `dev`. |
| Branch-aware routing (feat/fix→ship/debug; dev→no-op/debug; main→manual/excluded) | Task 1 Sub-step 1f | ✅ Ctx step bash: `case "$CONCLUSION"` → `if [ "$BRANCH" = "dev" ]` (dev: success→skip, failure→debug) / `else` (feat/fix: PR-backed ship/debug). `workflow_dispatch` handled at top. |
| FID recovery from merge-commit scope on dev | Task 1 Sub-step 1f | ✅ Primary: `grep -oE '^\w+\(([0-9]+-[a-z0-9-]+)\):'` on `$COMMIT_MSG`. Fallback: `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` → PR body `bkit:fid`. Slug assertion `^[0-9]+-[a-z0-9-]+$` gates fail-safe skip. |
| Option A: thread `AUTO_ROUTE_SUFFIX` onto PR squash-merge `--subject` in `bkit-ship`, gated on `bkit:auto` | Task 4 | ✅ Single-line change: append `${AUTO_ROUTE_SUFFIX}` after `#{PR_NUMBER})`. `AUTO_ROUTE_SUFFIX` already derived at line 626. `Done when` asserts bash unit for labeled/unlabeled. |
| Concurrency sub-risk 1: `cancel-in-progress: false` (queue) for dev | Task 1 Sub-step 1c | ✅ Expression `${{ github.event.workflow_run.head_branch != 'dev' }}`. Narrative (Open Q #3, Architecture § item 3) documents GHA queue semantics (one pending; older pendings cancelled as newer arrive); queued run re-evaluates cap. feat/fix/dispatch keep `true` (no regression). |
| Concurrency sub-risk 2: cross-session loop cap (`MAX_DEV_DISPATCH_ATTEMPTS`) | Task 1 Sub-step 1a (config) + 1f (enforcement + write) | ✅ Config: `MAX_DEV_DISPATCH_ATTEMPTS=3` under new `# bkit-cloud.yml counters` header. Enforcement: `DEV_COUNT=$(jq ... unique \| length)`; `if [ "$DEV_COUNT" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]` → skip. Distinct-headSha counting (dual-job race counts as one cycle). Write BEFORE dispatch closes the early-crash undercount defect (lines 366-377). |
| Concurrency sub-risk 3: stale-run guard for no-PR dev case | Task 1 Sub-step 1f | ✅ Option A: `gh run list --branch dev --workflow CI --status completed --json headSha --jq '.[0].headSha'`; skip iff differs from `$HEAD_SHA`. Close commits carry `[skip ci]` so never appear in `gh run list` — guards against the `git rev-parse origin/dev` race (R3 F1). Fails OPEN on empty `gh run list`. |
| Docs: `.bkit/cloud.md` decision log + routing table | Task 5 | ✅ Decision-log entry + routing table `dev` row + stale-guard Option A + loop-bound + concurrency rationale. |
| Docs: `docs/deployments.md` | Task 6 | ✅ CI/CD matrix `dev` row + auto-route contract + docs-only-diff (Vercel-CANCELED) precondition. |
| Docs: `docs/security.md` § CI Auto-Route Trust | Task 7 | ✅ `dev` push trigger trust surface (env-safe, FID slug allowlist, kill switch, loop cap as cost control). |
| Mirror regen (`.claude/`, `.cursor/`, `.opencode/`) | Task 8 | ✅ `pnpm bkit upgrade` regenerates mirrors from `.bkit/`; `Depends on: Tasks 1-7` (runs AFTER all canonical edits). |
| Version bump (4.10.0 → 4.11.0) | Task 8 | ✅ `.bkit/version` `pinnedVersion` + `package.json` `version`. |
| CHANGELOG | Task 8 | ✅ Unreleased entry `widen bkit-cloud trigger to post-merge dev CI (#363)`. |
| Testing: in-repo validation | Task 9 | ✅ YAML parse, ctx step bash dry-runs (dev success/failure/cap), `bkit-auto` CI_DEV dry-run, `bkit-counter-bus-config.sh` source, lint/typecheck. |
| Testing: consumer-repo acceptance note | Task 10 | ✅ Consumer-repo-only exercisable path documented; docs-only-diff precondition manual-verification per consumer. |

**Three explicitly-flagged "actually implemented, not silent drop" checks (per the scope-check brief):**

1. **`fix/**` folding actually implemented?** YES. Task 1b adds `fix/**` to `workflow_run.branches`. Task 1f ctx step `else` branch runs `gh pr list --head "$BRANCH" --base dev` for ANY non-dev branch (including `fix/{FID}`) → success→ship, failure→debug. Breaking Changes § (lines 116-120) documents this as the intended behaviour change (`fix/**` PRs newly cloud-auto-merged on green CI). NOT dropped.
2. **Loop cap actually enforced?** YES. Task 1f ctx step bash reads `MAX_DEV_DISPATCH_ATTEMPTS` via `source`, computes distinct-headSha count via `jq`, and exits `skip=true` when `DEV_COUNT -ge MAX_DEV_DISPATCH_ATTEMPTS`. The counter row is written BEFORE dispatch (lines 366-377), closing the early-crash undercount. NOT inert.
3. **Mirror regen actually last?** YES. Task 8 `Depends on: Tasks 1-7 (must run after all canonical .bkit/ edits)`. Task 9 (validation) `Depends on: Tasks 1-8`. No task edits `.bkit/` canonical files after Task 8 runs. NOT reordered.

### Deferred work — explicitly logged

The plan defers four items, all explicitly fenced — NOT silently dropped:

<!-- prettier-ignore -->
| Deferred item | Logged where | Tracking |
| --- | --- | --- |
| `main` branch trigger | Out of Scope § line 172 ("`main` stays manual-only") | Architectural invariant; never in scope. |
| #397 cross-surface same-FID arbitration | Out of Scope § line 173; Related Issues line 48; Supersessment Inventory line 519 | Own issue #397 (open). |
| bkit-ship Step 10 / ship-verify / preflight / renumber | Out of Scope § line 174 ("DROPPED per issue comments") | Explicitly dropped in issue #363 pivot comment (plan-input lines 125-129). |
| #80 audit-logs-ship migration | Out of Scope § line 175; Related Issues line 49 | Own issue #80; relocated to triggered debug's `debug-fetch`, proceeds independently. |

None of these are plan-internal discoveries requiring a `docs/deferrals.jsonl` entry — they all pre-exist as their own tracker issues (#397, #80) or were explicitly excluded by the issue pivot comments (ship-verify, `main`). The plan's Out of Scope § is the explicit log; no silent drops.

### Note on `Suggested Scope Expansion`

Plan line 181-182: `None.` — confirmed accurate. No adjacent features bundled.
