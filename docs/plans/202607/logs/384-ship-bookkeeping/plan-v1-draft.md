Verdict: PASS
<!-- verdict:end -->

# Ship Bookkeeping Off The Validated PR Head — Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the bkit meta-repo (TypeScript install engine + shell workflows + bats/vitest tests). No Vercel / Supabase / Inngest — those stack rows are N/A and dropped.

## Context & Goals

Ship is the only phase that gates merge on the local branch matching a CI-validated remote head, yet it inherits the same unconditional rebase-on-resume and unwritten push contract as the four non-head-match phases. The result is that the head being merged is never the head CI proved green, the workflow has no rule to point at, and each agent resolves it differently. Seven findings reduce to one defect class — a load-bearing rule that lives only in prose, that no gate checks.

This plan implements the approved design (`docs/plans/202607/384-ship-bookkeeping-design.md`): a tiered carrier — tested executable merge gate (Tier 1) + prose invariants enforced by vitest (Tier 2) + advisory status-hole detector (Tier 3) — wrapped around a structural rewrite of `.bkit/workflows/bkit-ship.md` into verify → base-check → integrate → re-validate → merge → close, with bookkeeping never pushed to `feat/{FID}` before merge. The carrier is the direct antidote to `01f8b8d9` (worktree model and head-match gate landed in one commit, neither reviewed against the other): the gate and its bats suite land first, are proven against captured fixtures, then the prose is rewritten underneath them.

**Related Issues:**

- #341 — Make workflows run in all runtimes local GH Actions claude.ai (CLOSED, merged `d64ef5be`) — sequencing dependency, now resolved. Its ship-touching workstreams (WS-8/9/10/12: delete `:556` `sleep 30`, branch model, close-guard kernel, ship close shape) have landed. 384 re-derives its diff against the post-#341 `bkit-ship.md`.
- #74 — Ship workflow cancels feature CI run mid-flight (CLOSED, recurring) — `cancel-in-progress` on `pull_request`; second justification for the frozen head.
- #68 — Stale workflow lock main repo vs worktree cwd mismatch (CLOSED) — same class as Finding 4 (two root resolvers, two trees).
- #209 — Workflow state model (CLOSED) — established `status.jsonl`; this finishes that sentence for ship.
- #71 — Workflow optimisation commit/push reduction (CLOSED) — the per-step `git add -A && git commit --allow-empty` idiom this design removes from the branch side.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here.

### Narrative _(inherited from design — do not rewrite)_

A developer runs `/bkit-ship {FID}` and the feature merges to `dev` only if the exact commit that is about to be squashed is the one CI proved green — regardless of whether `dev` moved underneath the branch in the meantime. When ship has to re-integrate first, the developer sees the branch rebased and re-tested rather than merged on a stale green. When the run finishes, succeeds or fails, the full record of what happened is on `dev` in one place, and nothing ship wrote for its own bookkeeping ever touched the branch being merged.

### Success Criteria _(inherited from design — do not rewrite)_

1. **The merge call itself refuses a head other than the validated one.** Every squash-merge is preceded by a passing assertion that the capstone job is **present** in a run whose `headSha` equals the current PR head and concluded `success`, _and_ the merge is issued with `--match-head-commit <that SHA>` so the server rejects the merge if the head moved between the assertion and the call. No merge path bypasses either half.
2. No ship run pushes a commit to `origin/feat/{FID}` that is not a code-integration change (rebase or conflict resolution), and every head move ship causes is followed by re-validation before the merge gate.
3. Every ship run — completed, failed, or aborted — leaves exactly one `status.jsonl` for the run, in one tree, containing a terminal row and no dangling `IN_PROGRESS`. Every gate refusal and every poll-timeout path emits a row before the run ends, so a refused or hung ship is diagnosable from the log dir alone without re-running `gh`.
4. A deferred-sweep FAIL produces a handover artifact and reaches the handover route, never a bare STOP.
5. Ship's staging never commits a path outside `docs/plans/{YYYYMM}/logs/{FID}/` plus a named ledger allow-list, verified mechanically rather than by review.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** ship starts **→ THEN** `BOOK_ROOT` and `BOOK_PATHS` resolved once and recorded; the bookkeeping target is fixed for the run; every later record lands there, never on `feat/{FID}`.
- **WHEN** `origin/dev` is an ancestor of the PR head (Path A) **→ THEN** no integration, no head move, straight to the merge gate.
- **WHEN** `origin/dev` has moved and the PR is mergeable (B1) **→ THEN** `gh pr update-branch` rebases server-side; **WHEN** it conflicts (B2) **→ THEN** worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`, or handover.
- **WHEN** the PR head SHA differs from the one observed at entry **→ THEN** dispatch CI unconditionally (`gh workflow run`) and bounded-poll for a run at the new head; write a status row before exiting on either cap.
- **WHEN** the capstone is present in the selected CI run at the current head AND concluded `success` AND no lane was skipped **→ THEN** merge with `gh pr merge --squash --match-head-commit <that head>`; **ELSE** refuse, printing the required head, the head actually tested, and the run URL.
- **WHEN** the deferred sweep FAILs **→ THEN** a `.deferred-blocked` sentinel is written under `BOOK_ROOT` and the run routes to handover, never to a bare STOP.
- **WHEN** the run ends by any route **→ THEN** one complete, path-scoped step record set exists in one tree (`BOOK_ROOT`), with a terminal row.

### Concrete Example _(plan expands from design)_

**Setup:** A developer has a green PR `feat/384-ship-bookkeeping` against `dev`. CI passed at head `abc123` three hours ago. Since then, two other PRs merged to `dev`, so `dev` no longer is an ancestor of `abc123`. The dev is on a laptop (mode 1, worktree model).

**Steps:**

1. Developer runs `/bkit-ship 384-ship-bookkeeping`. Step 1 resolves `BOOK_ROOT=$REPO_ROOT` (worktree present ⇒ `RUNTIME_DEVPUSHES=true` ⇒ `CAN_PUSH_DEV=true`), `BOOK_PATHS` to the literal allow-list, creates the outbox at `$GIT_COMMON_DIR/bkit-outbox/384-ship-bookkeeping/`, writes `ship-start-workflow` row to `BOOK_ROOT`, preflights `actions: write` once. No worktree mutation, no rebase.
2. Step 2 reads `ENTRY_HEAD=abc123`, `mergeable=MERGEABLE`. Step 3 runs `git merge-base --is-ancestor origin/dev origin/feat/384-ship-bookkeeping` → exit 1 (dev moved). Route: Path B → Step 4.
3. Step 4 sees `mergeable=MERGEABLE` → Path B1: `gh pr update-branch {PR}`. Server rebases; head moves to `def456`. No worktree, no local rebase, no subagent.
4. Step 5 observes `def456 != ENTRY_HEAD` → `gh workflow run ci.yml --ref feat/384-ship-bookkeeping` unconditionally. Poll under attempt cap and elapsed cap (both `timeout`-wrapped). Run `789` appears at `def456`, concludes `success`. Pre-merge snapshot written to outbox.
5. Step 6 writes the snapshot, calls `bkit-ship-gate.sh assert --head def456`. Gate queries `/repos/.../actions/workflows/ci.yml/runs?head_sha=def456`, selects the most recent `completed` run (789), reads `/actions/runs/789/jobs --paginate`, finds capstone `bkit-tests-check` present + `success` + no skipped lane. Exit 0. Step 6b: `gh pr merge --squash --match-head-commit def456`. Merged.
6. Steps 7+ re-acquire the dev lock, flush the outbox to `BOOK_ROOT` (path-scoped to `BOOK_PATHS`), one `docs({FID}): ship DONE bkit [skip ci]` commit + push, release the lock. The dev tree now carries: exactly one `status.jsonl` for this run with a terminal row, the pre-merge snapshot, and all step artifacts — none of which ever touched `feat/{FID}`.

**Outcome:** The squashed commit on `dev` was validated by run 789 at the exact head `def456` that was merged. `git log origin/feat/384-ship-bookkeeping` shows no bookkeeping commits — only the original build's `feat/` commits and (had B2 fired) a single conflict-resolution push. `status.jsonl` is in one tree and complete; a post-mortem needs the log dir, not a fresh round of `gh`.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| PR is `CONFLICTING` (Path B2 entry) | GitHub cannot compute `refs/pull/<n>/merge`; `pull_request` fires zero runs. B2 dispatch is **unconditional** `gh workflow run` after the head move, not a timeout fallback. (PR #720: two pushes, `total_count 0`.) |
| Stale green (superseded head was the most recent run) | Gate refuses (code 14), prints both SHAs + run URL. PR presents green but gate is self-refuting on screen. |
| Concurrent session on the shared `dev` checkout (concurrent `bkit-plan` staged another FID's files) | Ship stages only `BOOK_PATHS` (literal allow-list); never `git add -A`, never `git add -- docs/`. Tier-2 invariant test enforces. |
| Shared `.worktrees/{FID}` occupied by another phase | Step 12 records ownership at creation time (outbox + status row); absent-default = "not mine". `worktree remove --force` only fires when this run created the tree. |
| Mid-rebase failure | Failure Path orders `git rebase --abort` _before_ the status append (today it is reversed, which discards the append). Same block reads `BOOK_ROOT` like every other step. No `2>/dev/null \|\| true` silencing. |
| Cloud runtime cannot write the main checkout (mode 3) | `BOOK_ROOT` = current working branch (adopt tree); bookkeeping lands with the phase-close PR per #341 shape A. Push-timing invariant still holds. |
| Buried `[skip ci]` in branch history (build/debug wrote `worktree-setup … [skip ci]`) | Path B dispatch is unconditional — `gh workflow run` works regardless; push-triggered dispatch would be poisoned. |
| Capstone absent from the run | Refuse (code 13) — never a vacuous pass. |
| Several workflows produce runs at one head SHA (`ci.yml` from `pull_request`, second `ci.yml` from Path B dispatch, `bkit-cloud.yml` from `workflow_run`) | Gate queries `/actions/workflows/{ciWorkflow}/runs?head_sha=` (workflow-scoped), selects the most recent `completed` run of that workflow. Repo-wide query is wrong in both directions. |
| Run at the head was `cancelled` (`cancel-in-progress` on `pull_request`) | Refuse (code 15) — "dispatch, do not push". Distinct from code 12 (concluded failure). |
| Green capstone, but a lane was `skipped` (vacuous green) | Refuse (code 16). Cache-skipped green (`cache_skip` sentinel) is sound and must pass; `--explain` says which. |
| Capstone job list paginates (`/actions/runs/{id}/jobs` pages at 30; matrix-heavy consumer) | Gate reads `--paginate`; never reports false "capstone absent" on a genuinely green PR. |
| Operator PAT lacks `actions: write` | Step 1 preflight catches it once, recorded as a start-time verdict. Surfaces as code 20 (API error) only if it slips past preflight. |
| `gh` API secondary rate-limit (per-user PAT, shared across consumer repos) | Gate samples `gh api rate_limit` before the poll loop; remaining quota in narration + code-20 message. Code 20 strictly distinct from code 10 (no run at head). |
| `BKIT_SHIP_GATE_OVERRIDE=<sha>` exported | Gate honours only when value equals the head it just refused; gate itself (not the prose) appends the override `status.jsonl` row. `gh pr merge --admin` remains the server-logged alternative. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Tier names from `docs/testing.md`. Boundary rows reach the boundary and assert a ground-truth signal; no transport-status assertions, no mocked-away boundary under test.

**Tier key** — bats = the repo's shell-test tier (pre-push via `pnpm test:bats`, CI via `ci.yml:502` glob); Unit (Vitest) = `.bkit/src/*.test.ts`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Gate maps seven captured `gh` fixtures (green capstone at head, capstone absent, failed, in-progress, superseded green, PR #720 `total_count 0`, cache-skipped green) to the correct exit codes (0, 13, 12, 11, 14, 10, 0-with-`cache_skip`), and code 20 is distinguishable from code 10 — boundary is the stubbed `gh` shim against real JSON payloads | Integration (bats) | `tests/ship-gate.bats` |
| Prose invariants hold against `bkit-ship.md`: no `git add -A` and no blanket `git add -- docs/`; every `status.jsonl` write resolves via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present and unchanged; no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows — reuses `stripFencedBlocks` | Unit (Vitest) | `.bkit/src/bkit-ship-invariants.test.ts` |
| `.deferred-blocked` writer fires on `@bkit-ship-deferred-sweep` FAIL, producing `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` so Failure Path step 4's condition can become true | Unit (Vitest) | `.bkit/src/bkit-ship-invariants.test.ts` |
| Failure Path writes `workflow-failed` to `BOOK_ROOT` (not `--git-common-dir`), and the append is ordered after `git rebase --abort` — the ordering bug that hid the tree bug is gone | Integration (bats) | `tests/ship-failure-path.bats` |
| Step 12 removes `.worktrees/{FID}` only when this run created it (ownership bit read from outbox/status row, absent-default = "not mine") | Integration (bats) | `tests/ship-worktree-ownership.bats` |
| `bkit.capstoneJob` and `bkit.ciWorkflow` read from `package.json` with defaults `bkit-tests-check` and `ci.yml`; `stripManagedKeys` leaves them intact across install/upgrade/uninstall; `bkit-protect-main.sh` consumes `bkit.capstoneJob` instead of the third hardcoded literal | Unit (Vitest) | `.bkit/src/bkit-config-keys.test.ts` |
| `bkit-ship-gate.sh` is byte-identical across `.bkit/scripts/` and `.bkit/templates/.bkit/scripts/`; `bkit install`/`upgrade` places both; executable bit survives templating; `bkit check` reports a partially-applied upgrade | Integration (Vitest) | `.bkit/src/bkit-dogfood-noop.integration.test.ts` |
| Tier-3 detector derives the expected `ship-*` step set from `bkit-ship.md` (parses `## … Step N — Name` headings + `step:"ship-…"` literals in fenced blocks — never a parallel table); path-conditional sets; reports a delta against a pinned watermark via the fail-open advisory channel | Unit (Vitest) | `.bkit/src/bkit-status-hole-detector.test.ts` |
| First real Path A + first real Path B2 ship in a consumer repo satisfy all 5 Success Criteria against artifacts left behind (`--match-head-commit` on the merge call, no non-integration push to `feat/{FID}`, one `status.jsonl` per run in one tree with a terminal row, deferred-sweep FAIL reaches handover when triggered, staging confined to `BOOK_PATHS`) — boundary is a live GitHub PR + real Actions run; consumer repos are outside this repo's CI | E2E (manual, consumer repo) | `docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md` (written by Task 11) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

**New named conventions (introduced by design, asserted by Tier-2 test):**

- `BOOK_ROOT` — single tree every status/artifact write in a run targets; resolved once in Step 1. Replaces the implicit split between `--git-common-dir` (Failure Path) and `--show-toplevel` (Steps 1–8) that produced Finding 4.
- `BOOK_PATHS` — literal staging allow-list (`docs/plans/{YYYYMM}/logs/{FID}/` + named ledgers). Replaces six inline `git add` pathspecs and the blanket `git add -A` / `git add -- docs/` patterns.
- Outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/` — new directory outside every worktree, gitignored.

**New config keys (package.json, consumer-tunable, survive `stripManagedKeys`):**

- `bkit.capstoneJob` (default `bkit-tests-check`) — read by gate and `bkit-protect-main.sh`.
- `bkit.ciWorkflow` (default `ci.yml`) — read by gate's run-selection query.

**New script + new prefix:**

- `.bkit/scripts/bkit-ship-gate.sh` (new) — Tier-1 force-overwritten on `bkit upgrade`. Mirrored to `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical).
- `[bkit-ship-gate]` stderr prefix — new module, registered in `docs/observability.md`. Brackets load-bearing for consumer log-drain grep.
- `BKIT_SHIP_GATE_OVERRIDE=<sha>` escape — honoured only when value equals the head the gate just refused; gate writes its own override row.

**New managed config script** (bkit-owned defaults, units in identifier per `bkit-counter-bus-config.sh` precedent): CI-wait timeout, poll interval, dev-lock staleness, acquire deadline, `MAX_MERGE_ATTEMPT`. Two files (root + template), byte-identical.

**Canonical 14 `ship-*` step keys** — published as a stable schema; step **numbers** may move, **keys** may not. Renaming resets attempt counters across three repos.

**Workflow shape change** — `bkit-ship.md` rewritten from 13-step skeleton to verify → base-check → integrate → re-validate → merge gate → merge → close. Three deletions ride along: ship's unconditional rebase-on-resume, Step 3's prior-run diffing, Step 8's `Update: Source files.` retry loop (code-level failures now route back to build).

**Breaking for consumers:** consumers receive `.bkit/scripts/bkit-ship-gate.sh` on next `bkit upgrade`. Rollback path (pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows) is published in `docs/deployments.md`.

**No DB changes. No new API routes. No user input. No secrets.**

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

- **Assumption:** #341's ship-touching workstreams have fully landed (WS-8/9/10/12). → Verified pre-flight: #341 is CLOSED, merged `d64ef5be`; current `bkit-ship.md` is post-#341. If this is wrong, Task 0 (WS-1) gates and re-bases the plan.
- **Assumption:** The `gh` stub harness can be settled in roughly half a day (Risk 12). → If Task 2 (WS-2) cannot settle it, the Tier-1 carrier is more expensive than assumed and the tiering is revisited explicitly rather than absorbed. This is the plan's single cost hinge.
- **Assumption:** Consumer repos (app-gether-life, visitfrasercoast-com) remain available for the Task 11 E2E validation. → If not, only Path A in this repo's own telemetry is observable, and Path B2 validation defers.
- **Assumption:** bkit's own repo cannot dogfood the fix from its own telemetry (Risk 11 — 0 sweeps across 21 log dirs; 2 ship rows are fixtures). → Verification depends on consumer-repo runs; this is a deliberate manual step.
- **Open question:** Does `bkit.ciWorkflow` need a default for repos whose workflow file lives at `.github/workflows/foo.yml` rather than `ci.yml`? → Default `ci.yml` covers bkit + known consumers; consumers with a different name set `bkit.ciWorkflow` in `package.json`. No install plumbing needed.
- **Open question:** Should the Tier-3 detector's path-conditional expected sets (Path A skips integration + re-validation; MERGED-on-entry resume skips the middle; aborted run stops at the Failure Path) be encoded in `bkit-ship.md` itself, or derived from a separate small spec file? → Design says derive from the workflow; Task 10 implements and Task 11 calibrates the watermark.
- **Open question:** Promotion criteria for Tier-3 advisory → gate. → Recorded in `docs/decisions.jsonl` by Task 9; default is "one release of fail-open signal without muting".

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

All approaches below were evaluated by the design and are documented in its `Approaches Considered` and `Decisions` tables. The plan inherits the decisions verbatim; nothing is re-derived.

- **KEPT (spine):** Structural rewrite of `bkit-ship.md` to the A/B shape with tiered carriers (Tier 1 = tested gate, Tier 2 = vitest invariants, Tier 3 = advisory detector).
- **KEPT:** `BOOK_ROOT` / `BOOK_PATHS` as named variables; push-timing invariant (no ship bookkeeping commit reaches `origin/feat/{FID}` before the merge) rather than tree location; outbox outside every worktree.
- **MERGED (scoped):** Merge contract extracted into a tested executable — scoped to the gate only, not the whole workflow (avoids HIGH complexity on rules whose failure is cheap).
- **MERGED (as Tier 3):** Prose rewrite + hole detector as the primary durability → demoted to advisory; "derive expected set from `bkit-ship.md`, never a parallel table" is the decisive idea.
- **REJECTED:** Surgical patch keeping the 13-step skeleton; head-move observer with no explicit Path A (observation kept as re-validation trigger); remove ship's branch write access entirely; GitHub merge queue (unavailable on private non-Enterprise repos); Step-1 push-capability probe (`git push --dry-run` fails dangerous per #341).
- **DEFERRED (recorded in `docs/decisions.jsonl`):** Executable ship kernel + thin workflow (intended end state); required status checks on `dev` via `bkit-protect-main.sh` (separable cross-consumer policy).

**Selection rule:** The design picks quality-of-end-state. The plan honours it: the gate lands and is proven against fixtures before the prose is rewritten (direct antidote to `01f8b8d9`); the Tier-2 invariant test is red before the rewrite and green after it.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| GitHub merge queue (rebase onto base, CI on `merge_group`, merge if green, all server-side) | Unavailable — bkit's consumer repos are private + non-Enterprise; would require `merge_group` trigger in every consumer `ci.yml` | Recorded in `docs/decisions.jsonl`; revisit only if plan tier changes |
| Required status checks on `dev` via `bkit-protect-main.sh` (closes UI hand-merge) | Separable additive cross-consumer policy with own plan-tier question (protection on private repos is plan-gated) | Recorded in `docs/decisions.jsonl`; future issue |
| Executable ship kernel, thin workflow | Intended two-year end state, but designs function boundaries against semantics being decided in the same change | Recorded in `docs/decisions.jsonl`; future issue after this contract is extracted mechanically |
| Head-move observer as primary classifier | Premise rejected (mis-reads failed `update-branch` as "unchanged" → stale-base merge); observation half kept as re-validation trigger | Design `Approaches Considered`; no follow-up |
| Step-1 push-capability probe (`git push --dry-run`) | Rejected with mechanism — sends no ref-update, branch protection never evaluated, false-positive strands cloud session on `dev` checkout | Design `Decisions`; no follow-up |
| Surgical patch keeping 13-step skeleton | Preserves the under-specified structure; correctness property stays distributed across steps | Design `Approaches Considered`; no follow-up |
| design / plan / build / debug worktree conventions (unconditional rebase) | None of those phases gate on head match; their unconditional rebase is harmless | Revisit only if head-match gating spreads |
| `paths-ignore` / narrowed matrix in consumer CI (Risk 3 residual: present-but-degraded run) | Outside what ship can see from outside the run; published as a contract in `docs/deployments.md`, not enforced | Named as residual in `docs/decisions.jsonl` |

> [!CAUTION]
> **Default = in-scope.** Each row above is genuinely-additive (not required by Success Criteria) and traces to a recorded design decision. They will be mirrored into `docs/deferrals.jsonl` by Task 9.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `visitfrasercoast-com` produces no friction signal (0 rows across 57 log dirs) | Issue body § Comment 1 § Coverage gap | Tier-3 detector validation corpus | Keep advisory — name in `docs/failures.jsonl`; do not expand scope |
| `ship-resume-human-override`, `ship-post-failure-migration-fix` (invented step names in consumer status files) | Issue body § Finding 7 | Tier-3 detector + canonical step-key publication | Fold in — Task 9 publishes the canonical set; Task 10 detector surfaces invented names as delta |
| `bkit-ship.md:556` `sleep 30` (D5 from #341) | #341 (CLOSED) | Step 5 re-validation poll | Already removed by #341 landing — verify in Task 0, no expansion |
| docs-only push cancelled in-flight PR CI (`cancel-in-progress`, #74 recurring) | Issue body § Comment 1 § docs-only push | Push-timing invariant | Fold in — already a Success Criterion (SC 2); Task 7 enforces |

> [!CAUTION]
> **Candidates, not scope.** Entries above are surfaced for human review; the two "fold in" rows trace to design scope (Success Criteria 2; canonical step-key publication) and become tasks (Task 7, Task 9, Task 10). The "keep advisory" row does not expand scope.

## Security & Privacy

> Reference: `docs/security.md`. No new routes, no DB writes, no user input, no secrets in the gate's own logic. The `gh` API calls the gate makes use the operator's existing PAT (already in `bkit-protect-main.sh`'s scope). Applicable rows:

- [x] **Operator PAT scope** — Path B's unconditional `gh workflow run` requires `actions: write`. Preflight at Step 1 (one `gh api` call) surfaces a missing scope as a start-time verdict, not a permanent code 20 three steps later. No new secret; existing PAT.
- [x] **Prompt-injection — untrusted tracker/PR/comment content** (per #341 §5a) — the gate reads only machine-generated `gh` JSON (run lists, job conclusions); it does not parse issue/PR/comment bodies. The workflow prose continues to treat tracker content as untrusted per existing convention.
- [ ] New API route — N/A.
- [ ] New DB table/column — N/A.
- [ ] Role-gated mutation — N/A.
- [ ] User input — N/A.
- [ ] PII — N/A (capstone job name + workflow filename are not PII).
- [ ] Redirect URL — N/A.
- [ ] Webhook — N/A.
- [ ] New secret/env var — N/A. `bkit.capstoneJob` / `bkit.ciWorkflow` are `package.json` keys, not secrets.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` already declares `bats` runner (`pnpm test:bats` → `bats tests/*.bats`); no new runtime deps. `pnpm-lock.yaml` will sync after Task 1 (no new dep) and Task 2 (no new dep — bats stub is plain bash).
- [ ] **Dependency Versions:** `bats --version` available locally; `pnpm` current. CI runs bats via `ci.yml:502` glob — no CI edit needed.
- [ ] **Existing-solution search (reuse over duplicate):** `.bkit/scripts/` ships 9 helper scripts (`bkit-counter-bus.sh`, `bkit-status-fold.sh`, `bkit-status-route.sh`, `bkit-runtime.sh`, …). `bkit-protect-main.sh` is the only one that calls `gh` today and is the closest existing pattern for the gate. The bats harness (`tests/*.bats`) covers counter-bus / counter-derive / counter-failclosed / route-state / telemetry-failopen / bkit-runtime / cloud-bootstrap-preflight — **no bats file stubs an external command** (Risk 12 correction); the PATH-shimmed `gh` stub is genuinely new infrastructure, not an evolution. The vitest prose-invariant harness exists (`bkit-counter-prose-audit.test.ts`, `bkit-telemetry-workflow-writers.test.ts`, `bkit-ci-dispatch-gate-alignment.test.ts`, `bkit-comply-gate-wiring.test.ts`) and `stripFencedBlocks` is directly reusable.
- [ ] **User Context:** Read/write access verified in `.worktrees/384-ship-bookkeeping/`.
- [ ] **Pending Blockers:** #341 CLOSED — no blocker.
- [ ] **Project Context:** `docs/decisions.jsonl` to receive CI-config reasoning chain (Task 9). `docs/knowledge.jsonl` carries KN-CORE-1, KN-11, KN-30 referenced by design.
- [ ] **Testing & Quality:** Testing strategy aligns with `docs/testing.md` — bats for shell/fixture boundary (Integration), vitest for prose invariants (Unit), E2E manual in consumer repos.
- [ ] **Prerequisite Plans:** `docs/plans/202607/341-three-runtimes-design.md` + its six sub-plans — all PASS-verdict; #341 merged. This plan lands after.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** — N/A (no new secret; existing PAT).
- [ ] **Schema State** — N/A (no DB).
- [x] **Architecture & UI** — New shell script in `.bkit/scripts/` (justified: same class as the 9 existing helper scripts sourced by workflow prose; ship's merge gate is the last uncovered one). New vitest file in `.bkit/src/` (justified: prose-invariant harness already lives there). New bats file in `tests/` (justified: bats harness already lives there).
- [x] **Observability** — New `[bkit-ship-gate]` prefix → registered in `docs/observability.md` (Task 9). Brackets load-bearing.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (PAT scope + prompt-injection rows checked; others N/A).
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The "schema" here is the `status.jsonl` event vocabulary (append-only NDJSON, folded by `.bkit/src/bkit-status.ts`).

**Invariant conformance:** every step writes via `BOOK_ROOT` (single variable → single tree → Finding 4 dissolves). Outbox is the crash-window buffer; flush must complete within the run on every route including Failure Path. Pre-merge snapshot written before the merge fires.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `status.jsonl` (fold for resume, attempt counters via `counter_next`/`counter_current`); `docs/plans/{YYYYMM}/{FID}-plan.md` + `design.md`; `package.json` `bkit.capstoneJob` / `bkit.ciWorkflow`; `gh` API JSON (run lists, jobs).
- **Output (Write):** `status.jsonl` step rows (canonical 14 `ship-*` keys); outbox artifacts + pre-merge snapshot; `BOOK_PATHS`-scoped ledger updates.

### Data Schema Changes

- **ADD:** `runtime-resolved` row already exists (post-#341). No new event types. Pre-merge snapshot fields (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run id + URL, `mergeable`, gate exit code) are recorded as a new `step-done` artifact shape under `ship-merge-pr`, not a new event type.
- **MODIFY:** None to the event vocabulary. The 14 `ship-*` step **keys** are frozen (canonical set); step **numbers** may move.

## Architecture & Component Changes

Grouped: shell scripts → tests → workflow prose → docs. Per `docs/architecture.md` topology (bkit is single-package; `.bkit/scripts/` = Tier-1 force-overwritten; `.bkit/src/` = install engine + tests; `.bkit/workflows/` = canonical workflow source; `tests/` = bats + fixtures).

**CRITICAL:** Every `[NEW]` below justifies why an existing artifact cannot be evolved. **CRITICAL:** `bkit-ship-gate.sh` is two files (root + template) that must stay byte-identical. **CRITICAL:** No `as any` / `@ts-ignore` / `.skip` / empty `catch` to make a gate pass — the gate is the gate.

### Shell scripts

#### [NEW] `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical pair)

- **Existence Check:** Does not exist. Closest existing `gh`-calling script is `.bkit/scripts/bkit-protect-main.sh` (uncovered by bats, calls `gh api` for branch-protection setup). That is a different responsibility (one-shot branch-protection setup) and cannot be evolved into a per-merge gate without rewriting its contract.
- **Why new:** Ship's merge gate is the last load-bearing rule of its class (failure is unrecoverable) that lives only in prose. The repo has already solved this class for routing (`bkit-status-route.sh`) and counting (`bkit-counter-bus.sh`); the gate is the same shape and the last piece uncovered.
- **Contract:** `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>]`. Queries `gh api /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>` (workflow-scoped, NOT repo-wide); selects most recent `completed` run; reads `/actions/runs/{id}/jobs --paginate`; one exit code per condition (0/10/11/12/13/14/15/16/20 per design). All diagnostics on stderr behind `[bkit-ship-gate]`. `--explain` for read-only interrogation. `BKIT_SHIP_GATE_OVERRIDE=<sha>` honoured only when equals refused head; gate appends its own override `status.jsonl` row. Samples `gh api rate_limit` for code-20 message.

#### [NEW] `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical pair)

- **Existence Check:** Does not exist. `bkit-counter-bus-config.sh` is the precedent for bkit-owned-defaults config.
- **Why new:** Config-home rule — `.bkit/scripts/*` is Tier-1 force-overwritten, so bkit-owned defaults (timeouts, limits) live there; consumer-tunable keys (`bkit.capstoneJob`, `bkit.ciWorkflow`) live in `package.json`. One managed config script following the `bkit-counter-bus-config.sh` precedent with units in the identifier: `SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `SHIP_DEV_LOCK_STALE_S`, `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S`, `MAX_MERGE_ATTEMPT`.

#### [MODIFY] `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh`

- **Existence Check:** Exists; `REQUIRED_JOB="bkit-tests-check"` hard-coded at line 38.
- **Change:** Read `bkit.capstoneJob` from `package.json` (default `bkit-tests-check`) instead of the hard-coded literal. Retires the third copy after `docs/deployments.md` and the new gate.

### Tests

#### [NEW] `tests/fixtures/gh/` corpus + PATH-shimmed `gh` stub

- **Existence Check:** `tests/fixtures/` holds consumer scaffold dirs (`heavy-customised-consumer/`), not API JSON. No bats file in the repo stubs an external command (Risk 12 correction).
- **Why new:** First-of-its-kind harness in this repo. The stub dispatches on argv to a fixture file. Reusable by any future shell-tier gate.
- **Corpus (7 shapes per design):** green capstone at head; capstone absent; failed run; in-progress run; superseded green; PR #720 `total_count 0` (CONFLICTING — no merge ref); cache-skipped green with `cache_skip` sentinel. Plus an API-error fixture for code-20 distinction.

#### [NEW] `tests/ship-gate.bats`

- **Existence Check:** Does not exist.
- Cases named for the property: `rejects-stale-green-at-superseded-head` (14), `rejects-run-missing-capstone` (13), `rejects-cancelled-run-at-head` (15), `rejects-run-with-skipped-lanes` (16), `accepts-cache-skipped-green` (0), `distinguishes-api-error-from-no-run` (20 vs 10), plus `accepts-green-capstone-at-head` (0), `rejects-failed-run` (12), `rejects-no-run-at-head` (10), `rejects-none-completed` (11). Override honoured only on refused head.

#### [NEW] `tests/ship-failure-path.bats`

- **Existence Check:** Does not exist.
- Cases: append ordered after `git rebase --abort` (today reversed); `BOOK_ROOT` honoured (not `--git-common-dir`); no `2>/dev/null || true` silencing on the six git calls.

#### [NEW] `tests/ship-worktree-ownership.bats`

- **Existence Check:** Does not exist.
- Cases: ownership bit absent → no removal (default "not mine"); ownership bit present → `worktree remove --force` fires; bit read from outbox + status row survives a simulated crash (fresh shell).

#### [NEW] `.bkit/src/bkit-ship-invariants.test.ts`

- **Existence Check:** Does not exist. `bkit-counter-prose-audit.test.ts` is the pattern; `stripFencedBlocks` is directly reusable.
- Cases (Tier 2): no `git add -A` in `bkit-ship.md`; no blanket `git add -- docs/`; every `status.jsonl` write resolves via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present and unchanged; no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows (release row + re-acquire row present); `.deferred-blocked` writer referenced under `BOOK_ROOT`.

#### [NEW] `.bkit/src/bkit-config-keys.test.ts`

- **Existence Check:** Does not exist. `bkit-package-json.test.ts` covers `stripManagedKeys`; this is the read-side companion.
- Cases: `bkit.capstoneJob` default `bkit-tests-check`; `bkit.ciWorkflow` default `ci.yml`; `stripManagedKeys` leaves both intact (it touches only `scripts` + `devDependencies`); `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal.

#### [NEW] `.bkit/src/bkit-status-hole-detector.test.ts`

- **Existence Check:** Does not exist.
- Cases: expected set derived from `bkit-ship.md` (parses `## … Step N — Name` headings + `step:"ship-…"` literals); path-conditional sets (Path A skips integrate + re-validate; MERGED-on-entry skips middle; aborted stops at Failure Path); invented names (`ship-resume-human-override`) flagged as delta against pinned watermark; fail-open channel emits, does not gate.

### Workflow prose

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (structural rewrite)

- **Existence Check:** Exists; 1244 lines, post-#341.
- **Change:** Rewrite to verify → base-check → integrate → re-validate → merge gate → merge → close shape. Step 1 resolves `BOOK_ROOT`/`BOOK_PATHS`, creates outbox, preflights `actions: write`. Steps 2–3 read `ENTRY_HEAD`/`mergeable`, classify via `git merge-base --is-ancestor`. Step 4 Path B only (B1 `gh pr update-branch`; B2 worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`; non-mechanical → handover). Step 5 re-validates on observed head movement (unconditional `gh workflow run`, bounded poll under both caps, `timeout`-wrapped, `gh api rate_limit` sample). Step 6 writes pre-merge snapshot, calls gate, branches on exit code; Step 6b `gh pr merge --squash --match-head-commit`. Steps 7+ re-acquire dev lock, flush outbox, one path-scoped `[skip ci]` commit + push.
- **Three deletions ride along:** ship's unconditional rebase-on-resume; Step 3's prior-run diffing; Step 8's `Update: Source files.` retry loop (code-level failures route back to build).
- **Tier-2 invariant test is RED before this task starts and GREEN after it.**

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Failure Path block

- **Existence Check:** Exists; lines 56–139.
- **Change (Task 5):** Add `.deferred-blocked` writer on `@bkit-ship-deferred-sweep` FAIL. Read `BOOK_ROOT` (not `--git-common-dir`). Order `git rebase --abort` before status append. Remove six `2>/dev/null || true` silencings; sweep close/failure routes that depended on a non-fatal silenced call.

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Step 12 block

- **Existence Check:** Exists.
- **Change (Task 5):** Scope `worktree remove --force` to worktrees this run created; ownership bit in outbox + status row; absent-default = "not mine".

#### [MODIFY] `.bkit/workflows.md`

- **Existence Check:** Exists; 1288 lines.
- **Change:** Step table for ship re-sectioned. `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at. Add Tier-1/Tier-2/Tier-3 carrier explanation + `BOOK_ROOT`/`BOOK_PATHS`/outbox to the ship subsection.

### Rendered mirrors (Task 8 — regeneration only)

- `.claude/commands/bkit-ship.md` (byte-identical)
- `.cursor/commands/bkit-ship.md` (T1/T2/T3 transformed)
- `.opencode/commands/bkit-ship.md`
- Templates-content snapshot (enforces byte-identical dogfood mirror).

### Docs

- `docs/observability.md` — register `[bkit-ship-gate]` prefix (Task 9).
- `docs/deployments.md` — consumer CI contract: `pull_request ⇒ run_level=full`; consumer that narrows it has opted out; residual = present-but-degraded run. Plus consumer rollback path (Task 9).
- `docs/decisions.jsonl` — CI-config reasoning chain (Task 9).
- `docs/knowledge.jsonl` — gotchas surfaced during implementation (Task per "Write new tests" + close).
- `docs/deferrals.jsonl` — mirror Out-of-Scope table (Task 9).
- `docs/failures.jsonl` — any bugs surfaced (per-task).

### Database Migrations

N/A — bkit has no DB.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `bkit-ship.md:396-410` Step 3 prior-run diffing (REGRESSION_VERDICT) | `bkit-ship-gate.sh` capstone assertion (strictly stronger per `ci.yml:602` `bkit-tests-check` capstone + `ci.yml:111-112` `run_level=full`) | DELETE | Replaced by single assertion that subsumes it; design `Decisions` row |
| `bkit-ship.md:595-602` Step 6.4 PRE_HEAD check (collapses 6 conditions into 2 messages, bakes `403 = PAT scope` misdiagnosis) | `bkit-ship-gate.sh` exit-code table (0/10/11/12/13/14/15/16/20) | DELETE | One exit code per condition; design `Decisions` row |
| `bkit-ship.md:618-620` `git push` + `gh pr update-branch` immediately before merge (moves head between validate and merge) | `gh pr merge --squash --match-head-commit` (no update-branch at Step 6b; integration is Step 4 Path B only) | DELETE | Success Criterion 1; design `Decisions` row |
| `bkit-ship.md:790` Step 8 `Update: Source files.` retry loop (cannot reach merge under frozen head) | Code-level failures route back to build (fresh full CI run) | DELETE | Design `Decisions` row |
| `bkit-protect-main.sh:38` `REQUIRED_JOB="bkit-tests-check"` literal | `jq` read of `bkit.capstoneJob` (default `bkit-tests-check`) | RETAIN-WITH-REASON (literal → config read; same call site) | Third-copy literal retired; behaviour unchanged for default-config consumers |
| Per-step `git add -A && git commit --allow-empty` bookkeeping idiom on the branch (Finding 6) | `BOOK_PATHS`-scoped staging in single close commit | DELETE | #71; design `Decisions` row |

> [!CAUTION]
> Default = `DELETE`. `bkit-protect-main.sh`'s literal-to-config swap is `RETAIN-WITH-REASON` (same call site, behaviour-preserving for default config) — every other row is a true DELETE and is mirrored above as `[DELETE]`/`[MODIFY]` in Architecture and as a removal step in the Runbook.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/observability.md` | Register `[bkit-ship-gate]` in prefix list (brackets load-bearing); note `BKIT_SHIP_GATE_OVERRIDE` audit row in `status.jsonl` |
| `docs/deployments.md` | Add consumer CI contract: `pull_request ⇒ run_level=full`; narrowing via `paths-ignore`/docs short-circuit = opt-out of merge-gate guarantee; residual = present-but-degraded run the gate cannot see. Add consumer rollback path (pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit `BKIT_SHIP_GATE_OVERRIDE` rows) |
| `docs/decisions.jsonl` | CI-config reasoning chain (`ci.yml:111`/`:602`/`:130`/`:19-21` → "one assertion strictly stronger than all of Step 3") with discarded alternatives named (merge queue unavailability; required status checks deferral; Step-1 probe rejection); Tier-3 advisory→gate promotion criteria |
| `docs/knowledge.jsonl` | Implementation gotchas (path-scoped staging race with concurrent sessions; mid-rebase abort ordering; outbox durability boundary = one clone one machine) |
| `docs/deferrals.jsonl` | Mirror Out-of-Scope table (merge queue; required status checks; executable kernel; observer-as-primary; Step-1 probe; surgical patch; cross-phase worktree conventions) |
| `.agents/docs.md` | No change — universal-doc matrix unaffected (`docs/observability.md` + `docs/deployments.md` already listed) |
| `docs/architecture.md` | No change — `.bkit/scripts/` Tier-1 topology already documented |
| `docs/testing.md` | Note new bats external-command stub harness (`tests/fixtures/gh/` + PATH shim) as a reusable pattern for future shell-tier gates; Tier-3 fail-open advisory channel |
| `.bkit/workflows.md` | Step table re-sectioned for ship; `.deferred-blocked` writer contract; carrier tiering + `BOOK_ROOT`/`BOOK_PATHS`/outbox explanation |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code (gate script + mirrors)** | `git revert {COMMIT}` of the release that introduced `bkit-ship-gate.sh` + its bats + the rewrite | Two files (`.bkit/scripts/` + `.bkit/templates/.bkit/scripts/`) revert together; `bkit check` flags partially-applied upgrade |
| **Code (workflow prose)** | `git revert {COMMIT}` of the `bkit-ship.md` rewrite | Single file in source; `bkit install` regenerates the four mirrors |
| **Consumer rollback (3 repos)** | Pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows written in the interim | Manual procedure, recorded in `docs/deployments.md` by Task 9; no per-workflow revert mechanism exists today |
| **Config keys** | Remove `bkit.capstoneJob` / `bkit.ciWorkflow` from consumer `package.json` — defaults (`bkit-tests-check` / `ci.yml`) are the pre-change behaviour | Additive keys; removal is safe |
| **Risk window** | ~one release between Task 11 release and consumer `bkit upgrade` uptake | Version skew within a release is not the hazard (`.bkit/scripts/*` force-overwritten + commands re-rendered by same `bkit upgrade`); only partially-applied upgrade skews, and `bkit check` reports that |

_Code-only — `git revert` sufficient for repo-side rollback; consumer-side rollback is documented manual procedure._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl`.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next.
> **Progress Updates:** After each major task, post structured summary as issue comment.

Tasks are chronological, ordered by build dependency (serialisation gate → foundations in parallel → gate → hardening → distribution → prose rewrite → mirrors → docs → detector → E2E). Workstream IDs (`WS-N`) map to design `Suggested Workstreams`; dependencies are explicit. The gate (Task 4) and the Tier-2 invariant test (Task 3) MUST land and be RED→GREEN before the prose rewrite (Task 7).

- [ ] **Task 0 — WS-1: #341 Serialisation Carve-Out (GO/NO-GO gate).** Verify #341's ship-touching workstreams have landed and the post-#341 `bkit-ship.md` is the diff base for this plan's rewrite. Confirm no other open PR/branch is rewriting `bkit-ship.md` (repo doctrine: no concurrent bkit workflows on one clone). Fold the three comment corrections into issue body context if not already done by design: (a) non-firing `pull_request` on a CONFLICTING PR is general GitHub behaviour, not a bkit token quirk; (b) `cancel-in-progress` is a second independent justification for the frozen head; (c) Path B2 is the common case, not the escape hatch. Record the serialisation decision in `docs/decisions.jsonl` (key `384-341-serialisation`): which side landed first (#341), and that 384 re-derives against post-#341 state. **Dependencies:** none. **Done when:** `git log --oneline d64ef5be..HEAD -- .bkit/workflows/bkit-ship.md` is empty or carries only this FID's commits; `docs/decisions.jsonl` row `384-341-serialisation` exists with `outcome: "341-first-landed"`; current `bkit-ship.md` Step 9 contains `bkit_close_guard_checkout` (post-#341 marker) — confirms diff base.

- [ ] **Task 1 — WS-3: Configuration Surface (`bkit.capstoneJob`, `bkit.ciWorkflow`, managed config script).** Add `bkit.capstoneJob` (default `bkit-tests-check`) and `bkit.ciWorkflow` (default `ci.yml`) to bkit's own `package.json` as worked example (consumer-tunable; `stripManagedKeys` leaves them intact — verify by reading `bkit-package-json.ts` `stripManagedKeys` source). Create `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical) with `SHIP_CI_WAIT_TIMEOUT_S` (e.g. 1800), `SHIP_POLL_INTERVAL_S` (e.g. 30), `SHIP_DEV_LOCK_STALE_S` (900), `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S` (600), `MAX_MERGE_ATTEMPT` (3) — units in identifiers per `bkit-counter-bus-config.sh` precedent. Modify `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` to read `bkit.capstoneJob` from `package.json` (via `jq -r '.bkit.capstoneJob // "bkit-tests-check"'`) instead of the literal at line 38. Add unit test `.bkit/src/bkit-config-keys.test.ts`. **Dependencies:** Task 0. **Done when:** `.bkit/src/bkit-config-keys.test.ts` passes (`pnpm test bkit-config-keys`); `bkit-protect-main.sh` grep shows no `REQUIRED_JOB="bkit-tests-check"` literal and instead a `jq` read of `bkit.capstoneJob`; `pnpm test bkit-package-json` still passes (stripManagedKeys leaves new keys intact); both byte-identical pairs verified by `bkit-dogfood-noop.integration.test.ts`.

- [ ] **Task 2 — WS-2: gh Stub Harness + Fixture Corpus (GO/NO-GO cost hinge, ~half day).** Build the first-of-its-kind bats external-command stub: a PATH-shimmed `gh` script under `tests/fixtures/gh/bin/gh` that dispatches on argv to a fixture JSON file under `tests/fixtures/gh/`. Capture the seven design-mandated fixtures from real `gh` output across bkit + (where available) the two consumer repos: (1) green capstone at head; (2) capstone absent from run; (3) failed run; (4) in-progress run; (5) superseded green; (6) PR #720 `total_count 0` (CONFLICTING — no `refs/pull/<n>/merge`); (7) cache-skipped green with `cache_skip` sentinel. Add an API-error fixture for code-20 distinction. Wire `pnpm test:bats` into `.husky/pre-push` after the existing `pnpm bkit check` line. **GO/NO-GO:** if this task cannot be settled in roughly half a day (8 agent turns), the Tier-1 carrier is more expensive than assumed — STOP, append `docs/deferrals.jsonl` row (`key: 384-gh-stub-cost-hinge`), and surface to orchestrator for explicit tiering revisit. **Dependencies:** Task 0. **Done when:** `tests/fixtures/gh/bin/gh` exists and is executable; seven fixture JSON files exist under `tests/fixtures/gh/`; a smoke bats case (`tests/fixtures/gh/smoke.bats` or appended to `tests/ship-gate.bats` setup) verifies the stub dispatches each fixture; `.husky/pre-push` contains `pnpm test:bats` line; `pnpm test:bats` exits 0 on `tests/fixtures/gh/smoke.bats`.

- [ ] **Task 3 — WS-6: Bookkeeping Contract + Tier-2 Invariant Test (RED test, lands BEFORE prose rewrite).** Write `.bkit/src/bkit-ship-invariants.test.ts` asserting against the _current_ `bkit-ship.md` (which still has the head-mutating model). Reuse `stripFencedBlocks` from `bkit-counter-prose-audit.test.ts`. Cases must FAIL on current prose and PASS on rewritten prose: no `git add -A`; no blanket `git add -- docs/`; every `status.jsonl` write resolves via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present and unchanged (publish the set in the test as the source of truth the rewrite must match); no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows (release row + re-acquire row present); `.deferred-blocked` writer referenced under `BOOK_ROOT`. **Dependencies:** Task 0. **Done when:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS on current `bkit-ship.md` (verifying the test is genuinely RED — proves it would catch a half-applied rewrite); the canonical 14 step-key set is published in the test file as a frozen list.

- [ ] **Task 4 — WS-4: `bkit-ship-gate.sh` + `tests/ship-gate.bats` (Tier-1 carrier, MUST land before prose rewrite).** Create `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical). Contract: `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`. Run selection per design: query `gh api /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>` (workflow-scoped), select most recent `completed` run; if runs exist but none completed → exit 11 (in progress, not absent). Read capstone presence + conclusion from `/actions/runs/{id}/jobs --paginate`. Implement one exit code per condition (0/10/11/12/13/14/15/16/20). Distinguish `skipped` lane (code 16) from `cache_skip` sentinel green (code 0 + `--explain` note). Every diagnostic on stderr behind `[bkit-ship-gate]`; every refusal prints required head + head actually tested + run URL. Sample `gh api rate_limit` for code-20 message. Honour `BKIT_SHIP_GATE_OVERRIDE=<sha>` only when equals refused head; gate itself appends override `status.jsonl` row. Create `tests/ship-gate.bats` with the 10 named cases. **Dependencies:** Task 1 (config keys), Task 2 (stub harness). **Done when:** `pnpm test:bats tests/ship-gate.bats` passes all 10 cases against the captured fixtures (proves fixtures map to exit codes BEFORE any prose is touched); `bkit-ship-gate.sh --explain` is invocable and exits 0/10/11/12/13/14/15/16/20 deterministically per fixture; byte-identical pair verified by `bkit-dogfood-noop.integration.test.ts`.

- [ ] **Task 5 — WS-8: Failure Path + Worktree Hardening (lands before prose rewrite).** Three fixes in the current `bkit-ship.md` Failure Path block: (a) add `.deferred-blocked` writer — `@bkit-ship-deferred-sweep` returning FAIL touches `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` (reader at `:114` and `rm -f` at `:67` already exist); (b) make Failure Path read `BOOK_ROOT` like every other step rather than resolving `--git-common-dir`; (c) order the status append AFTER `git rebase --abort`, not before. Remove the silencing idiom — the silenced `rebase --abort` plus six `2>/dev/null || true` git calls at `:79-82`. Sweep every close and failure route that may have depended on one of those calls being non-fatal. Scope Step 12's `worktree remove --force` to worktrees this run created — ownership bit written at creation time to outbox AND `status.jsonl` row, absent-default = "not mine". Explicitly leave design/plan/build/debug worktree conventions untouched. Add `tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats`. **Dependencies:** Task 4 (gate, per design ordering), Task 6 contract (BOOK_ROOT — refer to Task 3's published name even though the prose rewrite is Task 7). **Done when:** `pnpm test:bats tests/ship-failure-path.bats` passes (append ordered after abort; BOOK_ROOT honoured; no silencing); `pnpm test:bats tests/ship-worktree-ownership.bats` passes (ownership bit absent → no removal; present → removal fires; bit survives simulated crash); `grep -c '2>/dev/null || true' .bkit/workflows/bkit-ship.md` is reduced from baseline by at least 6 (the six identified silencings removed); `.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep` prompt description in `.bkit/workflows.md`.

- [ ] **Task 6 — WS-5: Gate Distribution / Dogfood Mirroring.** Confirm `bkit install` / `bkit upgrade` place `bkit-ship-gate.sh` and `bkit-ship-timeouts.sh` in both homes (`.bkit/scripts/` root copy + `.bkit/templates/.bkit/scripts/` template copy), that the executable bit survives templating, and that `bkit check` reports a partially-applied upgrade (delete one of the pair, run `bkit check`, expect drift). Enforce byte-identity via the templates-content snapshot and `bkit-dogfood-noop.integration.test.ts`. **Dependencies:** Task 1, Task 4. **Done when:** `pnpm test bkit-dogfood-noop` passes for both new scripts; manual `bkit check` after deleting `.bkit/scripts/bkit-ship-gate.sh` reports drift; `ls -l .bkit/scripts/bkit-ship-gate.sh .bkit/templates/.bkit/scripts/bkit-ship-gate.sh` shows both executable; `diff` between the pair is empty.

- [ ] **Task 7 — WS-7: `bkit-ship.md` Structural Rewrite (Tier-2 invariant test turns GREEN).** Rewrite `.bkit/workflows/bkit-ship.md` to the design's shape: Step 1 resolves `BOOK_ROOT` + `BOOK_PATHS`, creates outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/`, writes `ship-start-workflow` row to `BOOK_ROOT`, preflights `actions: write` once. Steps 2–3 read `ENTRY_HEAD` + `mergeable`, classify via `git merge-base --is-ancestor origin/dev origin/feat/{FID}` — Path A → Step 6; Path B → Step 4. Step 4 Path B only: B1 `gh pr update-branch`; B2 worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`; non-mechanical → handover. Step 5 re-validates on observed head movement (current head != `ENTRY_HEAD`, not path label): unconditional `gh workflow run ci.yml --ref feat/{FID}`, bounded poll under attempt cap AND elapsed cap, `timeout`-wrapped, jittered backoff, sample `gh api rate_limit` before loop, write status row before exiting on either cap. Step 6 writes pre-merge snapshot (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run id + URL, `mergeable`, gate exit code) to outbox BEFORE merge fires, calls `bkit-ship-gate.sh assert --head <current>`, branches on exit code with a `status.jsonl` row per refusal carrying that code. Step 6b `gh pr merge --squash --match-head-commit <gate head>` and nothing else — no `update-branch` here; a rejected `--match-head-commit` routes back to re-validation. Steps 7+ re-acquire dev lock, flush outbox, one path-scoped `[skip ci]` commit + push to dev, release lock. Implement dev-lock windowing with status rows on release + re-acquire; handover on failed re-acquire (never silent unlocked flush). Carry the three deletions (rebase-on-resume, Step 3 prior-run diffing, Step 8 `Update: Source files.` with code-level failures routing back to build). **Dependencies:** Task 4 (gate proven), Task 5 (Failure Path hardened underneath), Task 3 (Tier-2 invariant test RED, turns GREEN). **Done when:** `pnpm test bkit-ship-invariants` PASSES (RED test turns GREEN — proves rewrite satisfies the contract); `grep -c 'git add -A' .bkit/workflows/bkit-ship.md` outside fenced code blocks is 0; every `gh pr merge` in the file carries `--match-head-commit`; `BOOK_ROOT` referenced at every status write site; canonical 14 `ship-*` step keys present (set published in Task 3's test); `pnpm slop:delta` stays green (no net-new prose findings); `pnpm lint:prose` stays green.

- [ ] **Task 8 — WS-9: Rendered Mirrors + Workflow Index Regeneration.** Regenerate all derived surfaces in one pass via `bkit install`: `.claude/commands/bkit-ship.md` (byte-identical), `.cursor/commands/bkit-ship.md` (transformed), `.opencode/commands/bkit-ship.md`, templates-content snapshot. Re-section `.bkit/workflows.md`'s ship step table; ensure the `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at. Confirm `<!-- bkit:managed vX.Y.Z -->` markers are restamped. **Dependencies:** Task 7, Task 5. **Done when:** `bkit install` exits 0; `bkit check` reports no `bkit-rendered-prompts-stale` drift; `diff .bkit/workflows/bkit-ship.md .claude/commands/bkit-ship.md` is empty (byte-identical); `.bkit/workflows.md` ship section reflects new step numbers and references `.deferred-blocked` writer.

- [ ] **Task 9 — WS-10: Documentation + Contract Publication.** Register `[bkit-ship-gate]` in `docs/observability.md`'s prefix list (brackets load-bearing; new script = new module = doc's bar met). Add consumer CI contract to `docs/deployments.md` alongside existing `[skip ci]`, dispatch-gate and `run_level` contracts: `pull_request` resolves to `run_level=full`; a consumer that narrows via `paths-ignore` or docs short-circuit has opted out of the merge-gate guarantee; name present-but-degraded run as residual. Add consumer rollback path (pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows). Record CI-config reasoning chain in `docs/decisions.jsonl` (key `384-ci-capstone-chain`): chain from `ci.yml:111`/`:602`/`:130`/`:19-21` → "one assertion strictly stronger than all of Step 3", with discarded alternatives named (merge queue unavailability mechanism; required status checks deferral; Step-1 probe rejection mechanism). Mirror Out-of-Scope table into `docs/deferrals.jsonl`. Record Tier-3 advisory→gate promotion criteria (key `384-tier3-promotion`): "one release of fail-open signal without muting". **Dependencies:** Task 4 (final prefix + exit codes), Task 7 (final workflow shape), Task 8 (final workflows.md). **Done when:** `docs/observability.md` contains literal `[bkit-ship-gate]`; `docs/deployments.md` contains literal `run_level=full` consumer contract + `BKIT_SHIP_GATE_OVERRIDE` rollback audit; `docs/decisions.jsonl` rows `384-ci-capstone-chain` and `384-tier3-promotion` exist; `docs/deferrals.jsonl` contains the seven out-of-scope rows; `pnpm test` (which includes prose audit) passes.

- [ ] **Task 10 — WS-11: Tier-3 Status-Hole Detector (Advisory, fail-open).** Create `.bkit/src/bkit-status-hole-detector.test.ts` and the detector itself (likely `.bkit/src/bkit-status-hole-detector.ts` + a `bkit` CLI subcommand `bkit ship:audit` or wired into existing `bkit slop:delta` channel). Derive expected `ship-*` step set from `bkit-ship.md` by parsing `## … Step N — Name` headings + `step:"ship-…"` literals in fenced blocks — NEVER a hand-maintained table. Make expectations path-conditional: Path A skips integration + re-validation; B1 and B2 differ; MERGED-on-entry resume skips the middle; aborted run stops at Failure Path. Report delta against a pinned watermark (as `bkit slop:delta` already does). Emit through the fail-open advisory channel for one release before any promotion to gate. Validate against the existing corpus (acknowledging 25–65% holey; one consumer repo produces no signal; bkit's own two ship rows are fixtures). Add unit test. **Dependencies:** Task 3 (canonical step-key set), Task 7 (final workflow to parse). **Done when:** `pnpm test bkit-status-hole-detector` passes; detector CLI exits 0 with advisory output (not non-zero) on a known-holey fixture; path-conditional sets asserted; invented names (`ship-resume-human-override`) surface as delta; promotion criteria referenced from `docs/decisions.jsonl` row `384-tier3-promotion`.

- [ ] **Task 11 — WS-12: E2E Validation + Rollout.** Manual terminal workstream — produce the evidence no green pipeline can. Run `bkit-ship-gate.sh --explain` read-only against one live PR in each of bkit + (where available) the two consumer repos; diff each verdict against `gh pr checks`; record any disagreement as a fixture gap (append `docs/failures.jsonl`). Watch one Path A ship and one Path B2 ship in a consumer repo end to end, confirming Success Criteria 1–5 against artifacts left behind: `--match-head-commit` on merge call; no non-integration push to `feat/{FID}`; exactly one `status.jsonl` per run in one tree with terminal row; deferred-sweep FAIL reaching handover when triggered; staging confined to `BOOK_PATHS`. Take first real `gh` rate-limit sample under the poll loop; record against Risk 4's unmeasured assumption. Calibrate Tier-3 watermark from those runs. Release gate script + managed config + rewritten prose together in one `bkit upgrade` so no consumer sees prose calling a gate it does not have; confirm `bkit check` catches a partially-applied upgrade. Write validation report to `docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md`. **Dependencies:** Task 4, Task 5 (gate), Task 6 (distribution), Task 7 (prose), Task 8 (mirrors), Task 9 (docs), Task 10 (detector). **Done when:** `ship-e2e-validation.md` exists and is non-empty; it records at least one Path A + one Path B2 ship attempt with explicit PASS/FAIL against each of the 5 Success Criteria; `gh api rate_limit` sample recorded; Tier-3 watermark calibration note present; any disagreement between `--explain` and `gh pr checks` recorded as `docs/failures.jsonl` row.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** `bkit-ship-gate.sh` is a new artifact justified against the existing 9 helper scripts (it is the same class — load-bearing rule extracted from prose — and the last uncovered). `bkit-ship-timeouts.sh` is justified against the `bkit-counter-bus-config.sh` precedent. The PATH-shimmed `gh` stub is justified as the first of its kind (Risk 12 correction). No `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make any gate pass.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Shell / fixture boundary** — bats against real JSON fixtures through the PATH-shimmed stub; no mocking of the boundary under test (the stub dispatches on argv to a real JSON file the gate parses).
> - **Prose invariants** — vitest Unit tier; `stripFencedBlocks` reused from `bkit-counter-prose-audit.test.ts`.
> - **E2E** — manual in consumer repos; bkit's own repo cannot dogfood (Risk 11).

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` has a corresponding task checked off above (Gate → Task 4; Prose invariants → Task 3 + Task 7; `.deferred-blocked` writer → Task 3 + Task 5; Failure Path → Task 5; Step 12 ownership → Task 5; Config keys → Task 1; Dogfood mirror → Task 6; Tier-3 detector → Task 10; E2E → Task 11).
- [ ] **Update existing tests:** `bkit-counter-prose-audit.test.ts` may need its step-key allowlist updated if it cross-checks ship step names (verify; extend if so). `bkit-dogfood-noop.integration.test.ts` extended for two new scripts (Task 6).
- [ ] **Write new tests:** `tests/ship-gate.bats`, `tests/ship-failure-path.bats`, `tests/ship-worktree-ownership.bats`, `.bkit/src/bkit-ship-invariants.test.ts`, `.bkit/src/bkit-config-keys.test.ts`, `.bkit/src/bkit-status-hole-detector.test.ts` — all per the matrix.
- [ ] **Verify observability:** `[bkit-ship-gate]` registered in `docs/observability.md` (Task 9); every gate refusal + poll-cap exhaustion + lock failure writes a `status.jsonl` row (asserted in prose, enforced by Task 7 rewrite).
- [ ] **Update documentation:** `docs/observability.md`, `docs/deployments.md`, `docs/decisions.jsonl`, `docs/knowledge.jsonl`, `docs/deferrals.jsonl`, `.bkit/workflows.md`, `docs/testing.md` — all per `Documentation Updates` table (Task 9 + per-task gotchas).

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate (no change needed).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test:bats && pnpm bkit check` all green. Do NOT weaken any gate to pass.
- [ ] **Test Synchronization:** `bkit-counter-prose-audit.test.ts` updated for any new ship step-key references (verify cross-check still passes); `bkit-dogfood-noop.integration.test.ts` extended for two new scripts; `bkit-ci-dispatch-gate-alignment.test.ts` unaffected (CI-Dispatch gate is build/debug; ship uses the new gate).
- [ ] **Build Configuration:** No `tsconfig.json` exclusion needed — all new files are `.test.ts` (already picked up by vitest config) or `.bats`/`.sh` (not type-checked).
- [ ] ** bats suite (`tests/ship-gate.bats`, `tests/ship-failure-path.bats`, `tests/ship-worktree-ownership.bats`):** Runs via `pnpm test:bats`; uses PATH-shimmed `gh` stub against real JSON fixtures. Data hygiene: fixtures committed read-only; no real PAT in fixtures.
- [ ] **Unit suite (`.bkit/src/bkit-ship-invariants.test.ts`, `bkit-config-keys.test.ts`, `bkit-status-hole-detector.test.ts`):** Runs via `pnpm test`; uses real filesystem reads against `bkit-ship.md` and `package.json` (no mocks).
- [ ] **Apply local migrations:** N/A — no DB.
- [ ] **Run all tests:** `pnpm test && pnpm test:bats` — fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface during verification, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use `gh` CLI to verify CI pipelines. The Task 11 E2E validation IS the manual verification — it is not optional, because bkit's own CI cannot dogfood this fix (Risk 11) and no green pipeline proves a run honoured the contract (Risk 13).

- [ ] **Step 1 (Task 11):** In a consumer repo (app-gether-life preferred — has friction corpus; visitfrasercoast-com produces no signal), run one Path A `/bkit-ship` end-to-end on a PR whose `dev` is an ancestor of the head. Confirm via `gh pr view --json statusCheckRollup` and the resulting `status.jsonl`: gate asserted capstone at current head; `gh pr merge --squash --match-head-commit <sha>` issued; no push to `feat/{FID}`; one `status.jsonl` in `BOOK_ROOT` with terminal row.
- [ ] **Step 2 (Task 11):** In a consumer repo, run one Path B2 `/bkit-ship` end-to-end on a CONFLICTING PR (or one whose `dev` moved). Confirm: `gh pr update-branch` failed → `@bkit-ship-conflict-resolve` ran → `git push --force-with-lease` fired → `gh workflow run` dispatched unconditionally → poll loop bounded by both caps → `bkit-ship-gate.sh` asserted at new head → `gh pr merge --squash --match-head-commit` issued.
- [ ] **Step 3 (Task 11):** Trigger a deferred-sweep FAIL (e.g. introduce an unplanned `TODO` mid-build, run ship) and confirm `.deferred-blocked` sentinel written under `BOOK_ROOT`, route to `@bkit-debug-abort-handover`, handover artifact non-empty.
- [ ] **Step 4 (Task 11):** `bkit-ship-gate.sh --explain --head <sha> --repo <o/r>` against one live PR in each of bkit + consumer repos; diff verdict against `gh pr checks --required`; record disagreements as `docs/failures.jsonl`.

## Merge Method

**Merge method: always squash.** This plan lands as a single squash-merged PR to `dev` per the workflow's hard rule. No rebase, no merge-commit. If commit-boundary preservation is needed for the gate-vs-prose ordering, decompose into separate PRs (gate first; prose second) rather than requesting a non-squash merge.
