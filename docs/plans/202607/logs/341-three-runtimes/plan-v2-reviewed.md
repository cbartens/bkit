Verdict: PASS
<!-- verdict:end -->

# Three-Runtime Workflow Execution (#341) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no app stack (no DB, no deployed URL, no browser). Test tiers reduce to **Static · Unit (vitest) · Integration (vitest, real subprocess/git) · Shell (bats)**; E2E/@live/migration/smoke are N/A (`docs/testing.md` § Stack / Tiers). "@live" here means a **real claude.ai (mode-3) session** — the only boundary that exercises the mode-3 code path, and it has no CI harness (WS-16, manual).

## Context & Goals

bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) + `bkit-auto` were authored for a laptop (mode 1) but now run in **three materially different runtimes**: laptop (mode 1), GitHub-Actions runner (mode 2), and a **claude.ai cloud session** (mode 3, `CLAUDE_CODE_REMOTE=true`). Several steps assume laptop-only capabilities. Running phases on the claude.ai runner surfaced a cluster of deviations culminating in a **silent CI-suppression bug (D1)**: `[skip ci]` leaked into a squash-merge _body_ on `dev` because an unauthed `gh` was replaced by an ad-hoc, unguarded MCP `merge_pull_request` that defaulted the body.

This plan implements the **settled design** (`docs/plans/202607/341-three-runtimes-design.md`, verdict CONCERNS) whose guiding principle is **minimal, additive changes gated on one capability table — not a rewrite of every call site**. The mechanism: a sourced runtime shim (`bkit-runtime.sh`) emits a 4-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on `CAN_*`; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). Three pre-build spikes (A/B/C) have **run and closed** (`spike-findings.md`, `design-addendum-spikes.md`) — their findings are folded here and they are NOT re-planned as open spikes; the only residuals are live-mode-3 observations owned by the terminal verification task.

> Success criteria live ONCE in `Acceptance Scenario → Success Criteria`; each runbook task carries its own `Done when`.

**Related Issues:**

- `#341` — Make workflows run in all runtimes local GH Actions claude.ai (open) — this plan
- `#134` — design→ship artifact-trail model (closed, not-planned) — superseded by the shipped per-phase ephemeral-branch model; removes §6h optionality
- `#209` — state model / design-plan feat-locate (closed, shipped) — the reason worktrees + `feat/{FID}` span all five phases; drives D3 scope
- `#234` — NDJSON `status.jsonl` (closed, shipped) — the per-step status ledger the three new row types ride
- `#342` — Prompt-injection hardening (open, `bkit:design`) — owns the §5a lethal-trifecta / §6f mitigation; adjacent, do NOT duplicate
- `#99` — bkit workflow friction optimisation (open, `bug`) — general workflow-friction tracker

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract. Everything downstream is derived from what you confirm here.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles the rest.

### Narrative _(inherited from design — do not rewrite)_

A developer runs any bkit phase — from their laptop, from a GitHub-Actions runner, or from a claude.ai cloud session — and the phase behaves the same way in all three: it starts without aborting on step 1, never yanks the session onto another branch, and reliably lands its work on `dev`. When `gh` is unavailable in the cloud session, the phase still completes through a sanctioned, bounded fallback rather than an improvised one. Afterwards the developer can read the run's status trail and see which runtime was detected, what it was judged capable of, and which transport actually carried the close.

### Success Criteria _(inherited from design — do not rewrite)_

1. All five phases + `bkit-auto` complete end-to-end in each of the three runtimes; the mode-1 laptop path is verified non-regressed by a real end-to-end run (not a rule-text-presence test). This run is also the only guarantee that prose rules _honour_ the capability flags — no static engine can assert that.
2. No run ever mutates the session's checked-out branch in a runtime that cannot restore it — zero `git checkout dev` when dev-push capability is absent (D6). Held by a double-guard plus a reversible checkout (D23), so it survives a mis-detected flag — not by probe accuracy.
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens — asserted post-hoc against the landed commit on whichever transport ran (D24) — and the resulting CI-dispatch outcome on `dev` is asserted rather than assumed (D1 closed on both transports).
4. Any gh→MCP transition is bounded (max 1 per run), recorded in `status.jsonl`, confirmed by an independent re-read that asserts the intended effect actually happened, and its recording is itself cross-checked mechanically (D25).
5. An MCP read returning empty/zero is never recorded as authoritative absence — it is corroborated or reported as unavailable, with the corroboration attempt logged as its own distinguishable state (D12).
6. A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime (Flow 1).
7. No wait can hang. Every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep` (D22).

### Process Sketch _(inherited from design — plan refined)_

- **WHEN** any phase starts **→ THEN** `bkit-runtime.sh` sources, `bkit_runtime_detect` resolves `RUNTIME` + 4 `CAN_*`, narrates one line, and appends a `runtime-resolved` row to `status.jsonl`.
- **WHEN** `CAN_WORKTREE=true` (mode 1/2) **→ THEN** mint `feat/{FID}` + `git worktree add` (today's path, untouched).
- **WHEN** `CAN_WORKTREE=false` (mode 3) **→ THEN** adopt the current branch in place (`WORKTREE_PATH=$REPO_ROOT`), asserting `branch != dev`.
- **WHEN** a phase closes with `CAN_WORKTREE=true AND CAN_PUSH_DEV=true` **→ THEN** local `checkout dev` (reversible, trap-restored) + `merge --squash -X ours` + `push origin dev`; else land on `dev` via the mode-3 transport (recommended: PR-close) with a skip-token-free body.
- **WHEN** any close lands **→ THEN** the landed commit body is re-scanned for `[skip ci]` (D24) and, if `GH_OK=false` + a mapped tool was used, a `transport-fallback` row MUST exist (D25) — else Failure Path.
- **IF** the shim fails to source / a `CAN_*` is unset **→ THEN** loud Failure Path, message distinguishing "shim unavailable" from "least-capable runtime" (never a plausible-looking `unknown` row).
- **IF** a bounded CI wait's `sleep` is blocked by the harness **→ THEN** the `timeout`-wrapped cap fires loud instead of hanging.

### Concrete Example _(plan expands from design)_

**Setup:** A developer opens a claude.ai cloud session (mode 3, `CLAUDE_CODE_REMOTE=true`) on branch `claude/issue-616-abc`. `GH_BKIT_TOKEN` is present this session (so gh + MCP both authenticate). They run `/bkit-design 616`.

**Steps:**

1. User runs `/bkit-design 616` → Step 1 sources `bkit-runtime.sh`; `bkit_runtime_detect` sets `RUNTIME=3 CAN_WORKTREE=false CAN_PUSH_DEV=false CAN_SLEEP=false GH_OK=true`, narrates that line, appends a `runtime-resolved` row.
2. Step 2 sees `CAN_WORKTREE=false` → **adopts** `claude/issue-616-abc` in place (no `git worktree add`, `WORKTREE_PATH=$REPO_ROOT`), asserts the branch is not `dev`; FID `616` comes from the tracker marker, not the branch name.
3. Each subsequent step commits `status.jsonl` + docs to the adopted branch (the proxy permits pushing the current branch); the `pwd != WORKTREE_PATH` gate passes because `WORKTREE_PATH` is the repo root in adopt mode.
4. Close Workflow: `CAN_PUSH_DEV=false` → no local `checkout dev`; the docs-only set lands on `dev` via the mode-3 transport with an explicit skip-token-free body; the landed commit is re-scanned for `[skip ci]` (D24) and passes.
5. `GH_OK=true`, no mapped-tool fallback occurred → D25 cross-check finds no required `transport-fallback` row and accepts the close; a `close-transport` row records the shape, the landed SHA, and the clean D24 scan.

**Outcome:** The design phase completes on the claude.ai runner exactly as on a laptop, `dev` runs CI (no suppression), and `status.jsonl` shows `RUNTIME=3`, the capability judgment, and the transport that carried the close.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Unknown runtime (Cursor bg agent — no bash-visible primitive) | Resolve `RUNTIME=unknown` → least-capable + loud; NEVER silent fallthrough to the mode-1 branch |
| Identity says capable, reality says not (mode-2 read-only `GITHUB_TOKEN`; rotated `GH_TOKEN` 401) | `CAN_PUSH_DEV` selects a transport, not a permission; the **real push** certifies loudly (`push origin dev \|\| exit 1`); no `--dry-run` probe (D23) |
| Fallback dies with the thing it rescues (`.mcp.json` + `cloud-bootstrap.sh` both read `GH_BKIT_TOKEN`) | Loud dual-lane preflight; the SessionStart hook **signals** loudly (cannot hard-stop), the workflow **Step-1 preflight enforces the ABORT** if neither gh nor MCP authable → never silent degradation (C2) |
| MCP up but silently wrong (`search_issues` clean `0` on a private repo) | Empty/zero read is INCONCLUSIVE; corroborate via a second MCP signal or report unavailable; log the attempt as its own state (D12) |
| Adopt mode collapses worktree isolation (`WORKTREE_PATH == REPO_ROOT`) | Accepted; the existing `.lock` is the only concurrency guard (repo doctrine forbids concurrent workflows on one clone) |
| Repo settings invisible to git (branch protection on `dev`; auto-delete-head-branches) | Committed pre-close assertion on the real push (already fails loud; anchor `:806` STALE — re-locate at build); dependency written into `docs/deployments.md`; NO Step-1 `gh api` probe (token lacks admin scope) |
| `pwd` outside worktree fires on every step in adopt mode | The `pwd != WORKTREE_PATH => Failure Path` rewrite MUST ship in the SAME commit as adopt-or-mint (D7) — else the workflow cannot take one step |
| Shim missing/stale on a resumed session → every `CAN_*` unset | Unset `CAN_*` is bash-indistinguishable from explicit `false`; Flow 1 uses explicit emptiness checks (`[ -z "${CAN_PUSH_DEV:-}" ]`) → distinct loud abort + distinct `status.jsonl` reason (SC6) |
| Foreground `sleep` blocked by the mode-3 harness | `timeout`-wrapped cap fires loud; never an indeterminate hang that emits zero observability (SC7, D22) |
| `push_files`/PR-close conflict when `dev` head moved under a mode-3 close | Dev-head-unmoved precondition guards it (Risk 9); reject-vs-clobber on a moved head is a residual settled by the live run (WS-16) |

### Derived Test Matrix

> Each row → exactly one Agent Execution Runbook task. bkit has **no DB/browser/deploy**, so the boundary tiers are **Shell (bats)** over the real scripts and **Unit/Integration (vitest)** over real files/git. The end-to-end runtime behaviour is reachable only by a real mode-3 session (no CI harness) — carried as one `@live`-manual row (WS-16). Per the design's honest limit (D3), the shim buys testable **detection**, not testable **consumption**; consumption rests on row 14's real run.
>
> **Discrimination:** each row observes the affected surface (real shell fn / real git repo / real `status.jsonl` / real workflow files / live session) and FAILS if the behaviour breaks — no transport-status proxies, no mocking-away the boundary.

**Tier key** (copy the tier name verbatim into `Type`):

<!-- prettier-ignore -->
| Tier | Use for |
| --- | --- |
| **Static** | type / lint / format / prose / drift (global gate) |
| **Unit (vitest)** | pure function / single module / prose-presence audit over files, no I/O |
| **Integration (bats)** | crosses a real shell/git/`status.jsonl` boundary in a real subprocess, no mocks — bkit's boundary tier for shipped shell (`tests/*.bats`) |
| **Integration (vitest)** | multi-module wiring / real git repo in-process (`*.integration.test.ts`) |
| **@live (manual, WS-16)** | crosses the real mode-3 runtime boundary — a live claude.ai session; no CI harness |

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 1 | `bkit_runtime_detect` maps env inputs → `RUNTIME` + 4 `CAN_*` per the 4-row table; `unknown` (no primitive) → least-capable, never mode-1 | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 2 | Sourced shim state does NOT survive a Bash-call boundary; env-only flags re-derive per block; `GH_OK` round-trips through the `runtime-resolved` row (D21) | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 3 | Shim-source failure / an unset `CAN_*` is loud + distinguishable from an explicit `false` (Flow 1 emptiness checks; distinct reason) | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 4 | `WORKTREE_PATH` resolves mint (`CAN_WORKTREE=true` → `$REPO_ROOT/.worktrees/{FID}`) vs adopt (`false` → `$REPO_ROOT`) | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 5 | `bkit_wait_ci` `timeout`-wrapped cap fires on a blocked/never-returning `sleep` (never hangs); attempt + elapsed bounds enforced (D22) | Integration (bats) | `tests/bkit-runtime.bats` | T7 |
| 6 | CI-Dispatch kernel alignment test still asserts byte-identity after extraction into `bkit_wait_ci` (rewritten, not deleted) | Unit (vitest) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` | T7 |
| 7 | D24 post-close scan flags `[skip ci]` in the LANDED commit body (`git log -1 --format=%B <SHA>`) on any transport → Failure Path | Integration (bats) | `tests/bkit-runtime.bats` | T9 |
| 8 | D25 cross-check: `runtime-resolved.GH_OK=false` + a mapped-tool close with NO `transport-fallback` row → Failure Path (reads real `status.jsonl`) | Integration (bats) | `tests/bkit-runtime.bats` | T9 |
| 9 | D23 double-guard: the local-checkout branch requires `CAN_WORKTREE=true` AND `CAN_PUSH_DEV=true`; trap restores the original branch on exit | Integration (bats) | `tests/bkit-runtime.bats` | T9 |
| 10 | `.mcp.json` `X-MCP-Toolsets` includes `actions`; the `.bkit/templates/.mcp.json` mirror is byte-identical to the live copy (C1) | Unit (vitest) | `.bkit/src/bkit-mcp-toolsets.test.ts` | T4 |
| 11 | No `/Users/<name>` absolute host path leaks in `.bkit/templates/docs/plans/template.md` + the two repo copies (D20) | Unit (vitest) | `.bkit/src/bkit-template-no-userpath.test.ts` | T1 |
| 12 | §6d: no phase-close subject NOR intermediate status-commit subject in `.bkit/workflows/*.md` carries `[skip ci]`; NO workflow prose still claims a docs-close is "pushed with 'bkit [skip ci]'"; the `bkit-ship.md` HEAD-skip-ci gate + `AHEAD_NON_SKIP` promotion-lag counter re-audited coherent under the new subject convention (D5(a) prerequisite) | Unit (vitest) | `.bkit/src/bkit-skip-ci-subject-audit.test.ts` | T12 |
| 13 | `cloud-bootstrap` gh-preflight prefers `GH_TOKEN`, records `GH_OK` loudly, and emits a loud NON-BLOCKING signal when neither gh nor MCP can authenticate (the SessionStart hook cannot hard-stop; enforcing abort is at Step 1, row 3) (C2) | Integration (bats) | `tests/cloud-bootstrap-preflight.bats` | T5 |
| 14 | End-to-end: all 5 phases + `bkit-auto` complete in each of the 3 runtimes; mode-1 non-regression by a real run; status trail shows `RUNTIME`/`CAN_*`/transport (SC1–7) | @live (manual, WS-16) | live claude.ai session + `docs/plans/.../status.jsonl` asserts | T16 |
| 15 | Vitest prose audit: every `CAN_*` has ≥1 reader in `.bkit/workflows/`; every foreground **CI-wait** `sleep` sits under the CI-wait rule (retry/backoff sleeps explicitly exempted, NOT flagged) (presence, NOT behaviour) | Unit (vitest) | `.bkit/src/bkit-runtime-prose-audit.test.ts` | T16 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

**None break existing consumers on modes 1–2; every mode-3-specific path is additive.** Prose/naming and behaviour changes:

> [!IMPORTANT]
> **Flag naming is non-negotiable (D1): `RUNTIME`, never `MODE`.** `bkit-auto.md:70-80` already binds `MODE=CI|BRIEF`; a collision lands in the one workflow that most needs the flag. Applies to the **filename** too — the shim MUST be `bkit-runtime.sh`, never `bkit-mode.sh` (retired in #245; an advisory still tells consumers to delete that orphan).

- **New capability flags:** `RUNTIME` + `CAN_WORKTREE` / `CAN_PUSH_DEV` / `CAN_SLEEP` / `GH_OK` in workflow contexts (additive; identity feeds one 4-row table, rules read `CAN_*`).
- **New shipped file:** `.bkit/scripts/bkit-runtime.sh` (+ `.bkit/templates/.bkit/scripts/bkit-runtime.sh`), rides `bkit install` like the counter-bus pair; `.bkit/version` must track it.
- **New `status.jsonl` row types (additive, existing NDJSON artifact #234):** `runtime-resolved`, `transport-fallback`, `close-transport`. No new artifact type.
- **FID resolution reorder (D9):** marker-primary → branch-derive fallback; the `feat/`-prefix hard-reject at `bkit-auto.md:86-87` is **deleted** (a reorder, not an invention).

> [!WARNING]
> **Prose/doctrine changes:** `rules.md:71` branch-naming rule reframed (D17) — once FID comes from the tracker marker, an adopted `claude/…` branch no longer violates the "branch must contain FID" rule. Adopt-mode workflow headers **drop** the `Worktree created/resumed` and `Worktree removed` gate items and rewrite the `pwd`-outside-worktree rule to `pwd != WORKTREE_PATH` (5 header files; `bkit-auto.md` has none).

> [!CAUTION]
> **Behaviour changes on `dev` (all modes):**
>
> - **`.mcp.json` toolset gains `actions`** (C1) — enables the CI/Actions + artifact-download MCP fallback map.
> - **`cloud-bootstrap.sh` gh-auth hardening** (C2) — prefer the sanctioned `GH_TOKEN` env over `--with-token`; add a loud dual-lane preflight; keep a single shared token (NO second secret).
> - **The blind CI-wait `sleep` in `bkit-ship.md` removed** (re-locate at build — the `:556`/`sleep 30` anchor is STALE) — a knowing **reversal** of a prior decision (the CI-dispatch alignment test records "Ship is OUT of scope"); replaced by a bounded `RUN_ID` poll. Legitimate retry/backoff sleeps are NOT removed.
> - **§6d (under the recommended D5(a) transport):** `[skip ci]` dropped from phase-close subjects AND intermediate status-commit subjects, because a PR-close surfaces the subject as the PR title/merge subject. This changes commit subjects on `dev`. **Second-order CI-cost reversal (human-gated, OQ-D):** the `[skip ci]` on docs-only close subjects is load-bearing — `bkit-tests-scope` classifies it as `run_level=none`, so dropping it makes EVERY design/plan docs-only close fire full CI on `dev` (a knowing cost, same class as the D11 sleep reversal; it is the counterpart mechanism KN-11's fix relied on). It also recalibrates the `bkit-ship.md` HEAD-skip-ci gate (`~:682`) + `AHEAD_NON_SKIP` promotion-lag counter (`~:833`) and contradicts the design/plan checklist prose (`~:853`/`~:913`) unless reconciled. T12 must reconcile every coupled site, not just remove the token.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

**Open questions (need a decision):**

- **OQ-A — Shape-A (design/plan docs-only) mode-3 transport: PR-close (D5(a)) vs `push_files` (D5)?** → **Plan recommendation: D5(a) PR-close.** Spike B (closed) confirmed `push_files` is append-only, single-parent, full-content, and **cannot express `merge --squash -X ours`**; the payload defect is real and **non-repairable** (~40–48k tokens inlined per call, straight into §5b token-bloat), and its conflict semantics **invert** `-X ours` (branch-wins vs dev-wins → silent-divergence, Risk 9). Spike C (C2) further shows the `.mcp.json` `push_files` lane may share `GH_BKIT_TOKEN` and die exactly when needed. D5(a) is uniform with ship's server-side merge, credential-decoupled, and free of both defects — at the cost of pulling **§6d into scope as a prerequisite** (drop `[skip ci]` from close + intermediate status subjects). The runbook is written for D5(a) (T12 + T13). **If the human selects D5**, drop T12 and swap T13's tail for the `push_files` prologue (STRAY-over-unfiltered-diff, `get_file_contents({ref:"dev"})` assert, dev-head-unmoved precondition). → resolve here.
- **OQ-B — Playwright artifact seam (§8.2 / OQ1).** C1 (verified) says `actions_get`'s `download_workflow_run_artifact` method covers the seam, so the earlier "no MCP artifact-download tool" limitation is dropped — **but the method's output shape must be verified at build (T15) against a real run.** If it does not carry the rich report, fall back to `get_job_logs` (job-logs-only; failure signal is not lost). → confirm the job-logs-only fallback is acceptable.
- **OQ-C — `dev` branch-protection config.** Confirm branch protection permits the autonomous close (status-checks-only, no required human review) and enable "Automatically delete head branches" (there is no MCP `delete_branch`). Recorded as a committed pre-close assertion + a `docs/deployments.md` dependency (Risk 4); NOT a Step-1 `gh api` probe (token lacks admin scope). → human/admin action.
- **OQ-D — Docs-only closes now fire full CI (knowing cost reversal; only live under OQ-A=D5(a)).** Dropping `[skip ci]` from design/plan docs-only close subjects (T12) reclassifies them from `bkit-tests-scope` `run_level=none` to a full-CI `dev` push — it is the counterpart mechanism KN-11's fix relied on. **Confirm this CI-cost is accepted** (same class as the D11 sleep reversal), OR require the D5(a) transport to carry the skip signal without surfacing the token in the merge subject. Either way the coupled ship-side gates — `bkit-ship.md` HEAD-skip-ci (`~:682`) + `AHEAD_NON_SKIP` counter (`~:833`) — and the design/plan checklist prose (`~:853`/`~:913`) must be reconciled in T12. → resolve here (moot if the human selects D5 in OQ-A).

**Assumptions the plan relies on (→ what breaks if wrong):**

- **Spikes A and B are CLOSED; only live-mode-3 residuals remain** (`design-addendum-spikes.md`). → If a residual (sleep block-vs-error; which MCP server mode 3 loads + `GH_BKIT_TOKEN` in-sandbox; `push_files` reject-vs-clobber) contradicts the fold, T14/T16 re-open — all three are named-and-mitigated (`timeout` cap; dual-lane abort; dev-head-unmoved precondition), so behaviour is safe either way.
- **The five phases' Step-2 branch logic is uniform enough for one adopt-or-mint rule** (design/plan verified; build/debug/ship spot-checked). → If not, WS-9 (T8) grows per-phase variants.
- **The `CAN_SLEEP=false` yield branch can carry an attempt counter across turns via the existing counter-bus** (proven for `DEBUG_ATTEMPT`, same shape). → If not, the CI-wait yield branch degenerates; `CAN_SLEEP` fails OQ4 and the poll needs a different bound.
- **`RUNTIME` is a clean token** (census: 2 hits, an unrelated `# RUNTIME GATING` comment). → If a collision exists, rename before any rule is authored (T3).
- **Mode-3's proxy restricts `git push` to the current branch** (from §1, not re-verified). → If false, adopt-mode mid-phase commits behave as mode 1 and the shape-A transport is unnecessary — safe (the local path still guards via D23).

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Selection rule applied:** best quality-of-end-state, not smallest diff.

- **CHOSEN — Capability table from one detection + a sourced shim (D2/D3).** Identity is an input to one 4-row table; rules read `CAN_*`. Reuses the counter-bus sourcing idiom (`bkit-ship.md:49` precedent) including its stateless re-source-per-block register (D21). Buys **testable detection** (bats); consumption stays prose (honest limit, discharged by SC1's real run).
- **CHOSEN — Shape-A mode-3 transport = D5(a) PR-close** (see OQ-A). Uniform with ship, credential-decoupled, no token-bloat, no conflict-inversion; §6d becomes a prerequisite.
- **REJECTED — `push_files` as shape-A primary (D5).** Withdrawn central claim ("same write, different transport"): non-repairable payload bloat + conflict inversion + credential coupling. Kept as the fallback shape only if the human overrides OQ-A.
- **REJECTED — `git push --dry-run origin dev` probe for `CAN_PUSH_DEV` (D23).** Fails dangerous: sends no ref-update, so branch protection is never evaluated → false-positive `CAN_PUSH_DEV=true` → `git checkout dev` on the live session. Replaced by a double-guard + reversible checkout + the real push certifying permission.
- **REJECTED — uniform PR-close in all runtimes (delete the local squash).** Regresses mode 1 (offline + instant today), collides with F1 at 5 PRs/feature, hard-depends on invisible branch-protection. Deferred (`docs/deferrals.jsonl` `uniform-pr-based-phase-close-all-runtimes`).
- **REJECTED — render-time mode gating via `<!-- bkit:mode 3 -->` markers (D14).** Impossible: `bkit-trackers.ts:1` resolves at install time; runtime is unknown then. Recorded so build does not re-propose it.
- **REJECTED — one `bkit_wait_ci` function for both CI-wait branches (D22).** `CAN_SLEEP=false` is agent control flow (bash cannot yield a turn); only the `CAN_SLEEP=true` branch is bash.
- **REJECTED / DEFERRED — shell-native MCP CLI shim** (best long-term shape; real exit codes) — new-tooling investment the guiding principle rules out. Deferred (`docs/deferrals.jsonl` `shell-native-mcp-cli-bridge-real-exit-codes`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Shell-native MCP CLI shim (real exit codes; testable outside a live agent) | Bespoke new tooling; guiding principle rules it out (design "Approaches Considered") | `docs/deferrals.jsonl` `shell-native-mcp-cli-bridge-real-exit-codes` (already recorded) |
| Uniform PR-close in all runtimes (delete local squash) | Regresses mode 1; design non-goal (rejected as uniform) | `docs/deferrals.jsonl` `uniform-pr-based-phase-close-all-runtimes` (already recorded) |
| Runtime-#4 (Cursor bg agent) first-class detection primitive | No bash-visible primitive; handled by `unknown` → least-capable + loud | `docs/deferrals.jsonl` `runtime-4-cursor-background-agent-first-class-detection` (already recorded) |
| Narrow gh read-path corroboration outside MCP for trackers on private repos (OQ2) | Doctrine forbids gh for tracker ops; D12 corroborates within MCP | `docs/deferrals.jsonl` `tracker-read-path-corroboration-outside-mcp-private-repo` (already recorded) |
| Root-cause of MCP `search_issues` zero-on-private-repo (OQ3) | A diagnosis task, not an operability property of this design | `docs/failures.jsonl` `github-mcp-search-issues-silently-returns-zero-private-repo` (already recorded) |
| Periodic `bkit-analysis` transport-fallback frequency summariser (OQ5) | New analysis feature; D25 already gives the rows a mechanical reader | `docs/deferrals.jsonl` `341-periodic-transport-fallback-frequency-analysis` (recorded this plan) |
| Mode-tuned subagent-fan-out concurrency pacing vs shared-account rate budget (§6g / N2) | Deferred in the issue as "revisit only if hit" | `docs/deferrals.jsonl` `341-mode-tuned-subagent-fanout-concurrency-pacing` (recorded this plan) |
| `.agents/skills/using-git-worktrees/SKILL.md:191` + siblings macOS-path "fix" (D20 correction) | `/Users/jesse` vendored upstream transcript; editing creates skill-sync drift, ships no consumer defect | Design non-goal (explicitly dropped from D20 scope) |

> [!CAUTION]
> **Default = in-scope.** Every row above is genuinely-additive and NOT required by any Success Criterion / Derived Test Matrix row / design section. Each `Exempt` row is mirrored in `docs/deferrals.jsonl` (or `docs/failures.jsonl` for OQ3).

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Prompt-injection / lethal-trifecta hardening (narrowest-scoped token; treat tracker/PR/comment as untrusted) | `#342` (open) | §6f security constraint; every extra MCP call (T14) widens the surface | **Keep separate** — #342 owns it; T14's bounded-fallback cap (D13) is a real mitigation, do NOT duplicate #342's scope |
| No shellcheck gate over `.bkit/scripts/*.sh` | `docs/deferrals.jsonl` `58-no-shellcheck-gate-over-bkit-scripts` | The new `bkit-runtime.sh` ships un-shellchecked like its siblings | **Needs a decision** — folding a `shellcheck -s sh` static step would also cover the new shim; otherwise it lands green and surfaces only in a consumer shell |
| `status.jsonl` run-boundary keys on last-run-overall (interleave hazard) | `docs/deferrals.jsonl` `58-status-jsonl-run-boundary-keys-on-last-run-overall` | New row types ride the same ledger the counters read | **Keep deferred** — owned by #209's status substrate, not this runtime change |

> [!CAUTION]
> **Candidates, not scope.** These do NOT become runbook tasks and MUST NOT expand scope unless the human folds one in.

## Security & Privacy

> Reference: `docs/security.md`. bkit ships agent tooling, not an app — most rows are N/A.

- [x] **New secret/env var** — **NONE ADDED (C2 decision):** no second MCP token. The plan uses the existing `GH_TOKEN` / `GH_BKIT_TOKEN`; a token-withholding sandbox withholds a second secret too, so it is pure management overhead. gh-hardening prefers the sanctioned `GH_TOKEN` env; the loud dual-lane preflight makes "no credential" a hard-fail, not a silent degrade.
- [x] **Untrusted input (§6f, first-class constraint):** tracker/PR/comment bodies are untrusted; every extra MCP call (T14) widens the lethal-trifecta surface (§5a). Mitigation here = D13's bounded (max-1) fallback + narrowest-scoped token; the injection **hardening** itself is `#342`'s scope — do NOT duplicate.
- Not applicable: New API route · New DB table/column · Role-gated mutation · Zod user-input schema · PII in logs · Redirect URL allow-list · Webhook signature — **None; bkit has no app runtime, DB, routes, or user input.**

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** No new npm deps expected (bats + vitest already present; `pnpm-lock.yaml` unchanged). Verify no dep is needed for the new vitest audits.
- [ ] **Dependency Versions:** Spot-check `npx tsc --version`, `pnpm --version`, `npx --yes bats --version` — bats is invoked in CI (`ci.yml` `npx --yes bats tests/*.bats`) and pre-push (`pnpm test:bats`).
- [ ] **Existing-solution search (reuse over duplicate):** shim reuses the counter-bus sourcing idiom (`.bkit/scripts/bkit-counter-bus.sh`, sourced at `bkit-build.md:573-574`, `bkit-ship.md:591-592`); bats tests model on `tests/counter-bus.bats`; the prose audit models on `.bkit/src/bkit-counter-prose-audit.test.ts`; the kernel-alignment test already exists (`.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`). Every `[NEW]` justified below.
- [ ] **User Context:** Read/write access to `.bkit/workflows/*.md`, `.bkit/scripts/`, `.bkit/templates/`, `.agents/rules.md`, `.mcp.json`, `.claude/hooks/cloud-bootstrap.sh`, `tests/`, `.bkit/src/` — all in-repo.
- [ ] **Pending Blockers:** Query the tracker for open `blocker`-labelled issues touching workflows/runtime. `#342` is adjacent (not a blocker).
- [ ] **Project Context:** Read `docs/knowledge.jsonl` (KN-CORE-1 gh/MCP 401-after-rotation; KN-11/DE-32 skip-ci-not-HEAD) and `docs/decisions.jsonl` (`#342` untrusted-input; cloud tracker auth). Load `spike-findings.md` + `design-addendum-spikes.md` (spike closure).
- [ ] **Testing & Quality:** Align with `docs/testing.md` — bats for shipped shell (`tests/*.bats`), vitest for prose/config audits; no E2E/@live/migration tier exists for bkit.
- [ ] **Prerequisite Plans:** None. `#209` + `#234` already shipped (the substrate this rides). Serialise landing against any concurrent workflow (repo doctrine: no concurrent bkit workflows on one clone).

### Conditional (verify only when applicable)

- [ ] **Architecture & UI:** Validate against `docs/architecture.md` register split — invariants→`rules.md`, procedure→headers, mechanism→shim (D15). No UI.
- [ ] **Observability:** New `status.jsonl` row types (`runtime-resolved`/`transport-fallback`/`close-transport`) + `ghProbeExit`/`ghProbeErr` fields follow `.bkit/jsonl.md`; narrated Step-1 line is the human-visible signal. Confirm `.agents/config.md` debug-fetch loudness (T15) per `docs/observability.md`.
- Not applicable: Secrets/Env (C2 = no new secret) · Schema State (no DB) · Notifications.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed** (`👤` checkbox `[x]`). _(Unchecked → Summary `REVISE`.)_
- [ ] **Breaking Changes confirmed** (`👤` checkbox `[x]`). _(Unchecked → Summary `REVISE`.)_
- [ ] **Open Questions confirmed** (`👤` checkbox `[x]`) — notably OQ-A (transport) and OQ-D (docs-close CI-cost), both **resolved explicitly here before build starts**, not lazily during T12/T13 (OQ-A picks whether T12 exists at all; a mid-build swap mutates the Derived Test Matrix). _(Unchecked → Summary `REVISE`.)_
- [ ] **Security & Privacy checked:** untrusted-input constraint acknowledged; no new secret confirmed.
- [ ] **Gate 1 - Verified:** All Core checked; applicable Conditional checked.

## Data Schema Integration

**No database.** The only stateful surface is the existing NDJSON ledger `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (#234), which already rides the phase branch.

**Invariant conformance:** the shim is a **stateless pure function re-sourced per block** (D21, Spike-A-confirmed: state dies across Bash calls, only cwd survives). Env-only flags (`RUNTIME`, `CAN_WORKTREE`, `CAN_SLEEP`, `WORKTREE_PATH`) re-derive free per block (~0.5 ms/call ×34); the one probed flag (`GH_OK`) is probed once at Step 1 and **read back from the `runtime-resolved` row** — no cache file (a new artifact D13 forbids). Every mapped-tool close is success-asserted by an independent re-read (D13) and mechanically cross-checked (D25); a failure surfaces as a Failure Path, never a silent 200.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `status.jsonl` `runtime-resolved.GH_OK` (read back per block, D21); both `runtime-resolved` + `transport-fallback` rows (D25 cross-check); the landed commit body via `git log -1 --format=%B` (D24).
- **Output (Write):** three additive `status.jsonl` row types — `runtime-resolved` (Step 1: `RUNTIME`, 4×`CAN_*`, `WORKTREE_PATH`, `GH_OK`, `ghProbeExit`, truncated `ghProbeErr`), `transport-fallback` (on any gh→MCP transition: `from`, `to`, `reason`, `assertedBy`), `close-transport` (phase close: shape, landed SHA, D24 scan result).

### Data Schema Changes

- **ADD (NDJSON row types, not DB):** `runtime-resolved`, `transport-fallback`, `close-transport`. Documented in `docs/testing.md` / `.bkit/workflows.md` § Status. **No new artifact type** — the `status.jsonl` ledger already exists.

## Architecture & Component Changes

Grouped by the design's register split (D15): **Mechanism** (shim), **Invariants** (`rules.md`), **Procedure** (workflow headers), **Config/hook**, **Tests/docs**. Mirrors `.claude/`/`.cursor/`/`.opencode/` are force-rendered from `.bkit/` and NOT drift-gated (D19) — true edit cost is the `.bkit/` sources (+ two `.bkit/templates/` mirror exceptions), batch-regenerated at the end.

### Mechanism — the runtime shim (Layer 0/1)

#### [NEW] `.bkit/scripts/bkit-runtime.sh` (+ `.bkit/templates/.bkit/scripts/bkit-runtime.sh`)

- **Why NEW, not evolve:** no existing script owns runtime detection; the retired `bkit-mode.sh` (#245) must NOT be resurrected by name (D1). Reuses the counter-bus's stateless re-source-per-block register 1:1 — not new infra.
- `bkit_runtime_detect` → `RUNTIME` + 4-row capability table (`CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`) + `WORKTREE_PATH` (mint/adopt). `GH_OK` is the only probe (`gh auth status`, once, loud). `CAN_PUSH_DEV` is NOT probed (D23). `unknown` → least-capable + loud. Ship the "table is a default, not a truth" comment.
- `bkit_wait_ci` — `CAN_SLEEP=true` branch only (bash): bounded poll, `timeout`-wrapped so a blocked primitive fails loud (D22). The `CAN_SLEEP=false` branch stays agent prose in headers (D4/D22 boundary).
- Close-guard helpers (D23 double-guard + reversible checkout; D24 landed-commit skip-token scan; D25 `transport-fallback` cross-check) — all bash-expressible, transport-agnostic.
- Install wiring: rides `bkit install` like the counter-bus pair; `.bkit/version` tracks it (`bkit-modules.ts` ships `.bkit/scripts/` templates by default).

### Invariants — `.agents/rules.md` (Layer 3)

#### [MODIFY] `.agents/rules.md` (bkit:start/end block) (+ its single template mirror)

- **Existence Check:** file exists; managed block exists; 2 files reach all 6 workflows.
- Add invariants: merge/commit body MUST be skip-token-free (D10, named+shared so both transports inherit); never foreground-sleep (D22); fallback bounded+recorded+success-asserted (D13); empty MCP read is inconclusive (D12). Reframe `rules.md:71` branch-naming (D17). Adopt-or-mint **procedure** does NOT go here (D15 — wider blast radius; stays in headers).

### Procedure — workflow headers (Layer 2)

#### [MODIFY] `.bkit/workflows/bkit-auto.md`

- **Existence Check:** exists. FID reorder (D9): hoist the PR-body marker read (`:93-112`) above the `feat/` check; **delete** the `feat/` hard-reject (`:86-87`); order = marker → branch-derive → Failure Path. Fixes the `fix/{FID}` asymmetry (D18) for free.

#### [MODIFY] `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md`

- **Existence Check:** all exist. Step 1: source shim + Flow-1 loud assertion + `runtime-resolved` row. Step 2: adopt-or-mint (Flow 2) + the **13 coupled sites in one commit** (D7): `pwd != WORKTREE_PATH` rule rewrite (5 files), Placeholders redefinition (5 files), 5 `Worktree created/resumed` gate items, 3 `Worktree removed` gate items; `WORKTREE_PATH` 6 assignment sites (D8). CI-wait: re-census sleeps at build (the "7 sleeps / 4 constructs" count is stale — ~12 across 5 files); migrate only CI-wait polls to `bkit_wait_ci` + the prose yield branch, leave retry/backoff sleeps in place; delete the blind CI-wait `sleep` in `bkit-ship.md` (D11 reversal — re-locate, `:556`/`sleep 30` anchor stale). Close shapes: B (build/debug — already works, wire D24/D25), C (ship — skip the post-merge dev-sync block incl. its push, D16; keep `core.bare` flip unconditional, Risk 8), A (design/plan — D5(a) PR-close, §6d prerequisite). Fallback lane (Flow 6, D4/D12/D13, §6c map under C1 names).

#### [MODIFY] `.bkit/workflows/bkit-worktree-{prune,sync}.md`

- **Existence Check:** verify exist. Loud self-skip when `CAN_WORKTREE=false` (Flow 7) — silent omission = obscure mode-3 failures.

### Config / hook

#### [MODIFY] `.mcp.json` + `.bkit/templates/.mcp.json`

- **Existence Check:** both exist (toolsets = `context,issues,pull_requests,repos,users,projects`). Add `actions` to `X-MCP-Toolsets` (C1). Keep the two mirrors byte-identical.

#### [MODIFY] `.claude/hooks/cloud-bootstrap.sh` + `.bkit/templates/.claude/hooks/cloud-bootstrap.sh`

- **Existence Check:** both exist (`:61` `gh auth login --with-token`, silent `|| log`). gh hardening (C2): prefer `GH_TOKEN` env; loud preflight recording `GH_OK`; dual-lane abort when neither gh nor MCP authable; single shared token (no second secret). **Two-file mirror edit** (this hook is tracked, `.bkit/version:42` — D19's "mirrors aren't edit sites" does NOT apply here).

### [DELETE] (see Supersession Inventory)

- The two inline `# --- CI-Dispatch Gate shared kernel ---` blocks in `bkit-build.md`/`bkit-debug.md` (extracted into `bkit_wait_ci`); the blind CI-wait `sleep` in `bkit-ship.md` (`:556`/`sleep 30` anchor stale — re-locate); the `feat/`-prefix hard-reject at `bkit-auto.md:86-87`.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Inline `# --- CI-Dispatch Gate shared kernel ---` blocks (`bkit-build.md`, `bkit-debug.md`) | `bkit_wait_ci` in `.bkit/scripts/bkit-runtime.sh` | DELETE | One shared kernel replaces the byte-identical duplicates; the alignment test (`bkit-ci-dispatch-gate-alignment.test.ts`) is **rewritten**, not dropped (T7) |
| The blind CI-wait `sleep` in `bkit-ship.md` (`:556`/`sleep 30` anchor STALE — re-locate at build) | `bkit_wait_ci` bounded `RUN_ID` poll | DELETE | A blind fixed-duration guess is both unsound (false "CI did not trigger") and wasteful; a knowing reversal (D11). Only the CI-wait sleep is deleted — retry/backoff sleeps stay |
| `feat/`-prefix hard-reject `bkit-auto.md:86-87` | Marker-primary FID resolution (`:93-112` hoisted) | DELETE | Adopt mode has no `feat/` branch; the reject aborts before marker read (D9) |
| Hard-coded `/Users/christian/...create-t3-turbo` path (`.bkit/templates/docs/plans/template.md:195`, repo copies `:191`/`:575`) | A stack/host-agnostic placeholder | DELETE | Ships a user-path coupling bug to every consumer in all modes (D20) |

> [!CAUTION]
> Each `DELETE` is mirrored as a `[DELETE]`/`[MODIFY]` in Architecture AND a removal step inside its runbook task (T7, T2, T1). No `@deprecated`-and-still-exported resolutions.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | At build/ship, record the confirmed shape-A transport decision (D5(a) vs D5 per OQ-A) + the C1/C2 runtime-fallback posture — human-gated, so NOT appended pre-Gate-1 |
| `docs/knowledge.jsonl` | Capture the shim state-model gotcha (sourced state dies across Bash calls; re-source per block) + the D1 aetiology (skip-token in merge *body*, not title) as durable traps |
| `docs/deployments.md` | Add the `dev` branch-protection + auto-delete-head-branches dependency for the autonomous close (Risk 4) |
| `docs/testing.md` | Add `tests/bkit-runtime.bats` + `tests/cloud-bootstrap-preflight.bats` + the new vitest audits (`bkit-runtime-prose-audit`, `bkit-mcp-toolsets`, `bkit-skip-ci-subject-audit`, `bkit-template-no-userpath`); note the new `status.jsonl` row types |
| `docs/observability.md` | Note the Step-1 narrated capability line + the three `status.jsonl` row types and their named readers (Close Workflow) |
| `.bkit/workflows.md` § Status | Document `runtime-resolved`/`transport-fallback`/`close-transport` row shapes |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database; `status.jsonl` rows are additive and forward-compatible (readers ingest all well-formed rows) |
| **Code** | `git revert {COMMIT}` per landed workstream + `pnpm bkit install` to re-render mirrors | Mode-3 paths are additive and gated on `CAN_*`; reverting restores mode-1/2 behaviour with no residue |
| **Risk window** | Mirror regen (`.claude`/`.cursor`/`.opencode`) must follow any `.bkit/` source revert | Batch `bkit install` at the end; after install run `git config core.bare false` (known install side effect) |

_Code-only — `git revert` sufficient; no migration, no deploy._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** work autonomously; no pause at any Gate. Check `[x]` as you go.
> **Serialise landing:** ALL workflow-file edits land serially — T7, T8, T10, T11, T12, T13 each touch `.bkit/workflows/*.md` (T7/T10/T11 share `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md`; T8 across all five phase files; T12 across all workflows; T13 in `bkit-design.md`/`bkit-plan.md`). Repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order, never in parallel.
> **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor cited below (and in Supersession/Architecture/Edge Cases) may be stale — source moved since planning (verified drift: `git push origin dev` now near `bkit-ship.md:840`, `core.bare` flip near `:816`; there is NO `sleep 30` at `:556`; the sleep census below is stale). Re-grep and re-locate every anchor before editing; NEVER edit by line number blind.
> **Spikes A/B/C are CLOSED** — fold their findings; do NOT re-plan them as open spikes. Residual live-mode-3 items are owned by T16.
> **Blockers → tracker issue (`blocker`), then stop.** Never fail silently. Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing first).
> **Batch mirror regen (`bkit install`) at the END** (T16), not after each edit.

**Ordering (build-dependency DAG):** independent roots T1 (macOS path), T2 (FID reorder), T3 (shim), T4 (C1, `.mcp.json`), T5 (C2, cloud-bootstrap) — T4 and T5 consume NOTHING from T3 (and T5 nothing from T4), so the "run early" grouping is sequencing convenience, NOT an artifact edge; they may land in any order relative to T3. Then T6 (rules), T7 (CI-wait), T8 (branch model — requires T2's marker-primary FID), T9 (close-guard kernel) → T10/T11 (shapes B/C), T12 (§6d), T13 (shape A), T14 (fallback lane — reads T4's `actions` toolset), T15 (peripherals — Playwright seam reads T4's `actions` toolset) → T16 (verification + live runs, terminal).

- [ ] **T1 — WS-5: Fix the shipped macOS user-path coupling (D20).** Remove `/Users/christian/...create-t3-turbo` from `.bkit/templates/docs/plans/template.md:195` and repo copies `docs/plans/template.md:191`/`:575`; use a host-agnostic placeholder. Do NOT touch the vendored `/Users/jesse` skill content. **Done when:** no `/Users/<name>` absolute path remains in those three files; **Unit (vitest)** `.bkit/src/bkit-template-no-userpath.test.ts` (matrix row 11) asserts zero host-path leaks and passes.
- [ ] **T2 — WS-4: FID decoupling in `bkit-auto.md` (D9/D18).** Hoist the marker read (`:93-112`) above the `feat/` check; **delete** the `feat/` hard-reject (`:86-87`); order = marker → branch-derive → Failure Path. Record that `bkit-cloud.yml:190-198` already does marker-primary (no change). This is one of the two highest-blast-radius edits to the EXISTING mode-1/2 path — **if** the FID resolution can be factored into a shim helper WITHOUT a workflow call-site rewrite (respecting the guiding principle), add a `tests/bkit-runtime.bats` assertion for non-`feat/` vs `feat/` resolution to convert row-14's manual guard into an automated one for this backwards-compat boundary; otherwise it rests on prose-audit + live. **Done when:** `bkit-auto.md` has no `feat/`-prefix hard-reject; a non-`feat/` branch resolves FID from the marker; prose-audit (T16 row 15) sees no orphaned `${BRANCH#feat/}`-only path; consumption verified live in T16.
- [ ] **T3 — WS-6: Layer 0 runtime shim + capability table + Flow 1 (D1/D2/D21/D23).** Create `.bkit/scripts/bkit-runtime.sh` (+ template): `bkit_runtime_detect` (`RUNTIME`, 4×`CAN_*`, `WORKTREE_PATH` mint/adopt, `GH_OK` probe-once, `unknown`→least-capable+loud, "default not truth" comment); Flow-1 loud source-failure + explicit-emptiness assertions; `runtime-resolved` row (+`ghProbeExit`/`ghProbeErr`). Wire into `.bkit/version` + `bkit install`. Record D14-rejected. **Done when:** shim exists + rides install; **Integration (bats)** `tests/bkit-runtime.bats` (matrix rows 1–4) passes: table mapping incl. `unknown`; state dies across Bash calls (`GH_OK` round-trips via the row); unset-vs-`false` distinguishable + loud; `WORKTREE_PATH` mint-vs-adopt.
- [ ] **T4 — C1: Enable the `actions` MCP toolset.** Add `actions` to `X-MCP-Toolsets` in `.mcp.json` and `.bkit/templates/.mcp.json` (byte-identical). Re-map §6c to the verified names (`actions_list`, `actions_get`, `get_job_logs`, `download_workflow_run_artifact`). **Done when:** both files carry `actions`; **Unit (vitest)** `.bkit/src/bkit-mcp-toolsets.test.ts` (matrix row 10) asserts the toolset includes `actions` AND template==live, and passes.
- [ ] **T5 — C2: gh hardening + loud dual-lane preflight (two layers — signal in the hook, enforce in Step 1).** In `.claude/hooks/cloud-bootstrap.sh` + its template: prefer the sanctioned `GH_TOKEN` env over `--with-token`; add a loud preflight that records `GH_OK` and emits a **loud non-blocking signal** when neither gh nor MCP can authenticate — the SessionStart hook **cannot hard-stop the session** (`cloud-bootstrap.sh:13-15`), so it signals, it does not abort. The **enforcing dual-lane ABORT lives in the workflow Step-1 preflight** (Flow 1 / the shim reading `GH_OK`), NOT the hook. Keep a single shared token (NO second secret). Prefer the proxy-brokered built-in in mode 3 when present (confirmed live in T16). **Done when:** both mirror copies updated; **Integration (bats)** `tests/cloud-bootstrap-preflight.bats` (matrix row 13) asserts `GH_TOKEN` preference, loud `GH_OK` recording, and a **loud non-blocking dual-lane signal** (not a hook hard-stop), and passes; the enforcing abort is covered by the Flow-1 assertion in T3 (`tests/bkit-runtime.bats`).
- [ ] **T6 — WS-7: Invariants into `.agents/rules.md` (D10/D12/D13/D15/D17/D22).** Add skip-token-free-body, never-foreground-sleep, bounded+recorded+asserted-fallback, empty-MCP-inconclusive invariants; reframe `rules.md:71`; keep adopt-or-mint procedure OUT (D15). Update the single template mirror. **Verify the empty-MCP-inconclusive invariant (D12) actually governs the design Step-3.1 `0 hits -> None.` call site** — the one that produced the logged `search_issues` silent-zero failure (this run's own `related-issues.md` shows it still fires) — so the corroboration guarantee is wired into that call site, not merely prose-adjacent in `rules.md`. **Done when:** the four invariants + the `rules.md:71` reframe are present in the managed block (both mirrors); the rules-sync test passes; the design Step-3.1 zero-hit path reads the D12 corroboration invariant (not a bare `0 hits -> None`); consumption verified live in T16.
- [ ] **T7 — WS-8: `bkit_wait_ci` + kernel extraction + the D11 reversal.** Add the `CAN_SLEEP=true` bash branch (`timeout`-wrapped) to the shim + the `CAN_SLEEP=false` prose yield branch to headers. **Re-census the sleeps at build first — the "7 sleeps / 4 constructs" and `bkit-ship.md:556 sleep 30` anchors are STALE** (live source has ~12 `sleep` occurrences across 5 workflow files; `bkit-ship.md` alone has 4 at `~:75/573/823/1102`, and there is NO `sleep 30` at `:556`). Only the **CI-wait polls** migrate to `bkit_wait_ci`; **legitimate retry/backoff sleeps stay** and MUST be distinguishable from CI-wait polls (else row 15 either false-fails valid backoff or is weakened to a hollow gate). **Delete** the blind CI-wait `sleep` in `bkit-ship.md` (D11 reversal — re-locate at build; record the reversal). Extract the two kernel blocks and **rewrite** `bkit-ci-dispatch-gate-alignment.test.ts` to assert alignment post-extraction. Verify the counter-bus carries the cross-turn attempt counter. **Done when:** no foreground **CI-wait** `sleep` sits outside the CI-wait rule (retry/backoff sleeps explicitly exempted and marked); **Integration (bats)** row 5 asserts the `timeout` cap fires on a blocked/never-returning sleep (never hangs); **Unit (vitest)** row 6 (`bkit-ci-dispatch-gate-alignment.test.ts`) still asserts byte-identity and passes.
- [ ] **T8 — WS-9: Adopt-or-mint branch model + the 13 coupled sites, ONE commit (D7/D8/Flow 2). Requires T2's marker-primary FID resolution** — adopt mode is only reachable via `bkit-auto` once the `feat/`-prefix hard-reject is deleted (T2), so land T2 first. Step 2 of all five phases: `CAN_WORKTREE=true`→mint (untouched); `false`→adopt in place, `WORKTREE_PATH=$REPO_ROOT`, assert `branch != dev`. Ship together: `pwd != WORKTREE_PATH` rewrite (5 files), Placeholders redefinition (5 files), 5 `Worktree created/resumed` + 3 `Worktree removed` gate items removed/gated, 6 `WORKTREE_PATH` assignment sites. Verify build/debug/ship Step-2 uniformity (assumption). **Done when:** adopt mode takes every step without a `pwd`-outside-worktree Failure Path; all 13 coupled sites land in one commit; `WORKTREE_PATH` resolution covered by T3 row 4; prose-audit (T16 row 15) sees a `CAN_WORKTREE` reader at each site; consumption verified live in T16.
- [ ] **T9 — WS-10: Close-guard + close-audit kernel, transport-agnostic (D23/D24/D25/Risk 4).** Shim helpers: D23 double-guard (`CAN_WORKTREE=true AND CAN_PUSH_DEV=true`) + reversible trap-restored checkout; D24 post-close `git log -1 --format=%B <SHA>` skip-token scan (fetch first for server-side); D25 cross-check (`GH_OK=false` + mapped-tool ⇒ `transport-fallback` row MUST exist). Emit `transport-fallback` + `close-transport` rows. Commit the Risk-4 pre-close assertion (on the real push) + write the `docs/deployments.md` dependency; record OQ5 not-adopted. **Done when:** **Integration (bats)** rows 7–9 pass over real git + real `status.jsonl`: D24 flags `[skip ci]` in a landed body → Failure Path; D25 flags a missing `transport-fallback` row → Failure Path; D23 double-guard + trap-restore keeps the original branch.
- [ ] **T10 — WS-11: Close shape B (build, debug).** Verify shape B already works in mode 3 (current branch pushable); wire the `close-transport` row + D24 scan + D25 cross-check; skip branch cleanup in adopt mode. **Done when:** build/debug close emits a `close-transport` row and passes the D24/D9-kernel obligations (T9 rows 7–8); adopt-mode cleanup skipped; live-verified in T16. _(Serialise landing vs T7 — shared files.)_
- [ ] **T11 — WS-12: Close shape C (ship), skip the local sync block (D16/Risk 8).** Skip the post-merge dev-sync block (`bkit-ship.md:733-751`, incl. `:746` `git push origin dev`) when `CAN_PUSH_DEV=false`; consume T9's reversible-checkout guard for the mode-1/2 path (`:736-738`); keep the `core.bare` flip unconditional; register the auto-delete-head-branches dependency under T9's Risk-4 commitment. **Anchors `:733-751`/`:746`/`:736-738` are STALE — re-locate at build** (verified drift: `git push origin dev` now near `:840`, `core.bare` flip near `:816`). **Done when:** ship's server-side merge is unchanged; the dev-sync block is `CAN_PUSH_DEV`-gated; the mode-1/2 checkout uses the D23 trap-restore (T9 row 9); live-verified in T16. _(Serialise landing vs T7 — shared file.)_
- [ ] **T12 — §6d prerequisite (under D5(a), OQ-A): drop `[skip ci]` from close + intermediate status-commit subjects, AND reconcile every site the docs-close skip-ci convention is load-bearing for.** Remove `[skip ci]` from phase-close subjects (`docs({FID}): … DONE bkit [skip ci]`) and intermediate status-commit subjects across `.bkit/workflows/*.md`, so a PR-close does not surface the token as the PR title/merge subject. **This is a knowing CI-cost reversal (human-gated, OQ-D; same class as the D11 sleep reversal):** the `[skip ci]` on docs-only close subjects is load-bearing — `bkit-tests-scope` classifies it as `run_level=none`, so removing it makes EVERY design/plan docs-only close fire full CI on `dev`; it is the counterpart mechanism KN-11's fix relied on. Before removal, **re-locate and enumerate at build** (line anchors below are indicative/stale — re-census) EVERY site that references the convention and update each coherently, not silently: (a) the `bkit-ship.md` HEAD-skip-ci gate (`~:682` — degenerates to a trivial always-pass once no close subject carries the token); (b) the `AHEAD_NON_SKIP` promotion-lag counter (`~:833` — docs closes now count as non-skip, shifting the lag warning); (c) the checklist prose in `bkit-design.md` (`~:853`) / `bkit-plan.md` (`~:913`) that still claims "merged to 'dev' and pushed with 'bkit [skip ci]'" (now contradicts the code); (d) the intermediate `chore(...) [skip ci]` status-commit subjects (`bkit-plan.md ~:740`, `bkit-design.md ~:567`, `bkit-build.md ~:349`, `bkit-ship.md ~:261/579/1178`); (e) the `bkit-tests-scope` planner's `[skip ci]` → `run_level=none` classification. Resolve OQ-D first: if the human declines the docs-close CI-cost, the D5(a) transport must carry the skip signal WITHOUT surfacing the token in the merge subject (Failure Path back to OQ-A) rather than dropping it. **Done when:** **Unit (vitest)** `.bkit/src/bkit-skip-ci-subject-audit.test.ts` (matrix row 12) asserts (i) no phase-close or intermediate status-commit subject in `.bkit/workflows/*.md` carries `[skip ci]`, (ii) no `.bkit/workflows/*.md` prose still claims a docs-close is "pushed with 'bkit [skip ci]'", and (iii) the `bkit-ship.md` HEAD-skip-ci gate + `AHEAD_NON_SKIP` promotion-lag counter are re-audited to hold their intended meaning under the new subject convention (every coupled site enumerated in this task body reconciled, not invalidated), and passes. _(Dropped entirely if the human selects D5 in OQ-A.)_
- [ ] **T13 — WS-13: Close shape A (design/plan docs-only) — D5(a) PR-close (Flow 4, OQ-A).** Transport-independent prologue: STRAY guard FIRST over the UNFILTERED diff (`git diff --name-only dev...feat/{FID} | grep -vE '^docs/plans/|^\.bkit/friction\.md$'`) → Failure Path, then compute the set; skip branch cleanup in adopt mode; give plan's close the canonical assert it lacks today (`:786-792`). D5(a) tail: open a `feat/{FID}→dev` PR at close and merge via the gh-primary / `merge_pull_request`-fallback path with a skip-token-free body; inherit T9's D24 scan + D25 cross-check + D23 guard. **Done when:** the STRAY guard runs over the unfiltered diff; shape-A close lands docs on `dev` via PR-merge with a skip-token-free body (T9 row 7 + T12 row 12 hold); design AND plan closes assert the landed doc; consumption verified live in T16. _(If human selects D5: swap the tail for `push_files` + `get_file_contents({ref:"dev"})` assert + dev-head-unmoved precondition; do NOT split to `create_or_update_file`.)_
- [ ] **T14 — WS-14: gh→MCP fallback lane (Flow 6, D4/D12/D13, §6c under C1 names). Requires T4's `actions` toolset** (the §6c `actions_*`/`get_job_logs` names resolve only once T4 adds `actions`). Prose (D4 — bash detects `GH_OK=false`, cannot invoke the tool): the §6c map under the C1-verified names; bounded (max-1 gh→MCP/run) + recorded (`transport-fallback`) + success-asserted (independent re-read); empty MCP read INCONCLUSIVE → corroborate via a `list_*` call or report unavailable, logging the attempt as its own state (D12). Adopt the explicit budget reading: `push_files`/shape-A transport is a fallback for _git_, not _gh_ — does NOT consume the max-1 budget. Record OQ2/OQ3/shell-CLI deferrals. **Done when:** the fallback map + D13 bound + D12 corroboration prose are present; the `transport-fallback` row is written and cross-checked by T9's D25 (row 8); tool-name resolution + the credential-coupling posture (C2) verified in the live run (T16). _(Gated conceptually on WS-2/D26 — CLOSED as C1/C2; provisional tool names finalised live in T16. Residual tracked, NOT assumed closed: if T16 finds the built-in mode-3 server exposes different tool names, the §6c map is re-pointed there — a bounded post-T16 rework, not a silent surprise.)_
- [ ] **T15 — WS-15: Peripheral gating + localized fixes (Flow 7).** `bkit-worktree-{prune,sync}.md`: loud self-skip when `CAN_WORKTREE=false`. Debug egress blindness: Custom allowlist + loudness so a self-skip `exit 0` never reads as "no runtime errors" (`.agents/config.md`, `bkit-debug.md:551-565`). Playwright seam (OQ-B, **requires T4's `actions` toolset**): `get_job_logs` is the **standing default** (job-logs-only failure signal, never lost); verify `download_workflow_run_artifact` output shape against a real run — reachable only in T16 — and adopt it ONLY if it carries the rich report, else stay on the `get_job_logs` default. **Done when:** the two worktree helpers self-skip loudly on `CAN_WORKTREE=false` — asserted by a **behaviour** test in `tests/bkit-runtime.bats` (the `CAN_WORKTREE=false` self-skip is bash-expressible and cheap to discriminate), NOT presence-only; debug egress emits a loud signal instead of a silent `exit 0`; the artifact seam is resolved per OQ-B with `get_job_logs` as the default until T16 confirms; consumption verified live in T16.
- [ ] **T16 — WS-16: Verification, prose audit, mirror regen, live runs (SC1–7, D3/D19).** Add the **Unit (vitest)** prose audit `.bkit/src/bkit-runtime-prose-audit.test.ts` (every `CAN_*` has ≥1 reader; every CI-wait `sleep` under the CI-wait rule, retry/backoff sleeps exempted — presence, NOT behaviour). Batch mirror regen via `bkit install` (then `git config core.bare false`); confirm `.bkit/version` tracks the shim. Run all five phases + `bkit-auto` end-to-end in each runtime; verify mode-1 non-regression by a real run; settle the three live residuals (sleep block-vs-error; which MCP server + `GH_BKIT_TOKEN` in-sandbox; `push_files`/PR-close reject-vs-clobber). Assert SC1–7 against the landed system. **Done when:** **Unit (vitest)** row 15 passes; **@live (manual)** row 14 — a real mode-3 session + real mode-1 run — completes all phases with a status trail showing `RUNTIME`/`CAN_*`/transport, mode-1 non-regressed, `dev` CI dispatched (SC3), and no hang (SC7).

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` (shim + 4 test files) justified against extending an existing artifact; no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to pass a gate.
- [ ] **Gate 2 - Verified:** Every task checkbox independently verified against the plan.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all 15 rows map to a checked task (rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12, 13→T5, 14–15→T16). No uncovered row.
- [ ] **Update existing tests:** rewrite `bkit-ci-dispatch-gate-alignment.test.ts` for the kernel extraction (T7).
- [ ] **Write new tests:** `tests/bkit-runtime.bats`, `tests/cloud-bootstrap-preflight.bats`, `.bkit/src/bkit-runtime-prose-audit.test.ts`, `.bkit/src/bkit-mcp-toolsets.test.ts`, `.bkit/src/bkit-skip-ci-subject-audit.test.ts`, `.bkit/src/bkit-template-no-userpath.test.ts`.
- [ ] **Verify observability:** Step-1 narrated line + three `status.jsonl` row types documented in `docs/observability.md` / `.bkit/workflows.md`; debug egress loudness (T15) per `docs/observability.md`.
- [ ] **Update documentation:** every row in `Documentation Updates` completed (`docs/deployments.md` branch-protection dependency; `docs/testing.md` new tests + row types; `docs/knowledge.jsonl` traps; `docs/decisions.jsonl` transport + C1/C2 at build once OQ-A confirmed).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** every checkbox independently verified.

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** `pnpm typecheck` · lint · `format:check` · prose (vale) · `pnpm lint:slop` + `slop:delta` · `pnpm bkit check` (drift) · `pnpm test` (vitest unit + in-process integration) · `pnpm test:bats` (`npx --yes bats tests/*.bats`). Do NOT weaken any gate to pass.
- [ ] **New bats:** `tests/bkit-runtime.bats` (rows 1–9), `tests/cloud-bootstrap-preflight.bats` (row 13) execute the real scripts in fresh subprocesses (counter-bus bats pattern) and pass.
- [ ] **New/updated vitest:** `bkit-runtime-prose-audit` (row 15), `bkit-mcp-toolsets` (row 10), `bkit-skip-ci-subject-audit` (row 12), `bkit-template-no-userpath` (row 11), and the rewritten `bkit-ci-dispatch-gate-alignment` (row 6) pass.
- [ ] **Drift + mirror parity:** `pnpm bkit check` green after `bkit install` regen; `.mcp.json` ↔ template and `cloud-bootstrap.sh` ↔ template byte-identical; `.bkit/version` tracks the shim.
- [ ] **No migration / no @live CI tier for bkit** — the runtime-behaviour guarantee is the manual live run below, not an automated tier.

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/test errors via `docs/architecture.md` + `docs/knowledge.jsonl`, never hot fixes. The design's honest limit stands — bats/vitest prove **detection + presence**, NOT that prose rules _honour_ the flags. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof (test output / CLI results).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** verify CI via `gh` (`gh run list`), never a dashboard.

- [ ] **Step 1 — mode-1 non-regression (laptop):** run all five phases + `bkit-auto` on the laptop; confirm mint-path + local close unchanged, `dev` CI dispatched, no `[skip ci]` in landed bodies (D24).
- [ ] **Step 2 — mode-3 live run (claude.ai session, WS-16 row 14):** run each phase on the claude.ai runner; confirm adopt-or-mint (no worktree), no `git checkout dev`, shape-A/B/C closes land on `dev` via the confirmed transport, `dev` CI dispatched (SC3), no hang (SC7), and `status.jsonl` shows `runtime-resolved`/`close-transport` (+ `transport-fallback` if gh fell back). Settle the three live residuals (sleep block-vs-error; MCP server + `GH_BKIT_TOKEN` in-sandbox; reject-vs-clobber).
- [ ] **Step 3 — mode-2 runner:** trigger a phase via the CI event/label path; confirm `RUNTIME=2`, `GH_BKIT_TOKEN`/App write path, CI dispatched.
- [ ] **Step 4 — `dev` config (OQ-C):** confirm branch protection permits the autonomous close and "Automatically delete head branches" is enabled.

## Merge Method

**Merge method: always squash.** Default `gh pr merge --squash --delete-branch --body ""`. This plan's landings serialise (shared files across T7/T10/T11); decompose into separate PRs per landing group rather than requesting a non-squash merge. Never `rebase`/`merge-commit` into `dev`.
