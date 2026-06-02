Verdict: PASS

<!-- verdict:end -->

# 203 — CI Green != Validated: Backport gether #403 scaffold (`bkit-decide` -> `bkit-tests` / `bkit-tests-live` -> `bkit-tests-check`) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

bkit's ship/debug gates and consumer-template CI conflate "the CI run concluded `success`" with "the change was validated by CI". A partial CI run is green-by-construction (E2E and live-deploy tiers are intentionally skipped), so `statusCheckRollup == success` carries zero validation signal. Gether #403 has now proven the structural fix in production: an always-on plan-producing job (`bkit-decide`) feeds a single capstone (`bkit-tests-check`) that asserts every tier the plan said should run actually ran+passed. This plan backports that 4-job scaffold into bkit (Layer 1), simplifies the ship/debug gates to read the capstone (Layer 2), and adds one rules norm covering the no-workflow path (Layer 3). The capstone becomes the sole branch-protection required check.

**Success Criteria:**

- `.bkit/templates/.github/workflows/ci.yml` ships the full 4-job scaffold (`bkit-decide` / `bkit-tests` / `bkit-tests-live` / `bkit-tests-check`); turbo affected-graph, Vercel-await, E2E, and `:live` deploy tiers remain `bkit-stub:` blocks; the canonical core of `bkit-decide` (commit-message + PR-title MARKERS, `run_level` two-layer precedence, merged-PR auto-escalate via the commits/{sha}/pulls lookup) is live; the existing `# bkit:start verbose-ci-env` named block is preserved verbatim so `bkit-preflight` still validates.
- bkit's own `.github/workflows/ci.yml` carries the scaffold in degenerate form: `bkit-decide` (markers + `run_level` + merged-PR escalation, NO turbo affected-graph since bkit is single-package), `bkit-tests` (today's static+unit checks folded under), NO `bkit-tests-live`, `bkit-tests-check` capstone — preserving the existing SHA-cache skip, `[skip ci]` semantics, and verbose-CI knobs.
- `scripts/ci/bkit-set-protection.sh` is renamed to `scripts/ci/bkit-protect-main.sh` (both the engine copy and the `.bkit/templates/scripts/ci/` mirror); `REQUIRED_JOB` flips from `bkit-tests` to `bkit-tests-check`; the pre-flight that greps `ci.yml` now greps for `bkit-tests-check`; postinstall advisory + dist mirrors carry the new name.
- `.bkit/workflows/bkit-ship.md` Gates 2/3 and Step 12 plus `.bkit/workflows/bkit-debug.md` Step 3 assert `bkit-tests-check == success` on the PR's full run and treat `skipped`/`neutral`/`cancelled`/missing as non-green; no consumer-specific job names leak; ASCII operators only.
- `.agents/rules.md` and `.bkit/templates/.agents/rules.md` Git/CI/Merges section gains the one-bullet norm "Green != ran != validated …".
- `pnpm test` + `pnpm build` + `pnpm bkit check` + `actionlint` all green; `bash scripts/ci/bkit-protect-main.sh --dry-run` succeeds.

---

## Required Workstream Dependencies

This plan covers all three layers of #203 as one consolidated effort. No prerequisite #209 work is consumed (status.jsonl conflicts + `[skip ci]` tip guard are explicit out-of-scope). The 4-job scaffold is foundational — Layer 2 (which references `bkit-tests-check` by name) and the protection script (which pre-flights the job exists) must land AFTER both ci.yml files carry the new job and BEFORE branch-protection is flipped operator-side.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV.
- **Success Criteria:** <=5 bullets, each measurable.
- **Key Edge Cases _(design phase)_:** Design-shaping only.
- **Edge Cases _(plan phase)_:** Inherited + plan-added cases.
- **Concrete Example _(plan phase)_:** Specific role + state + steps + outcome.
- **Derived Test Matrix _(plan phase)_:** One row per testable behaviour.

**Design-missing fallback:** #203 has no `{FID}-design.md` (design phase skipped — the canonical reference is the proven gether #403 design at `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`). The Narrative + Success Criteria below are derived from the issue body and the #403 addendum's `bkit-tests-check` block, NOT fabricated.

### Narrative _(inherited from #203 body + #403 design addendum)_

As a bkit consumer or bkit maintainer, when CI reports a run green I can trust that the change was actually validated by CI: the capstone job `bkit-tests-check` asserts every tier the plan said should run did run and passed. When a partial run skips expensive tiers by design, the capstone reflects that — and the ship/debug agents refuse to call it "validated" until they see `bkit-tests-check == success` on the PR's full run.

### Success Criteria _(inherited from issue #203 + addendum)_

1. `bkit-tests-check` exists in both bkit's own `ci.yml` and the `.bkit/templates/` consumer template, `needs:` every other CI job, runs `if: !cancelled()`, reads `fromJSON(needs.bkit-decide.outputs.plan)` plus each `needs.*.result` plus tier outcomes, asserts every expected tier ran+passed, and `exit 1`s on mismatch.
2. `bkit-tests-check` is the SOLE required status check named in `bkit-protect-main.sh` (renamed from `bkit-set-protection.sh`); the script's pre-flight greps `.github/workflows/ci.yml` for `bkit-tests-check`.
3. `bkit-ship.md` Gate 2/3 + Step 12 and `bkit-debug.md` Step 3 assert `bkit-tests-check == success` (and treat skipped/neutral/cancelled/missing as non-green) instead of inspecting `statusCheckRollup` for "any failures" or trusting `RUN_CONCLUSION == success`.
4. `.agents/rules.md` Git/CI/Merges section carries the bullet "Green != ran != validated — classify the CI run type before reporting any verdict; NEVER report validated/done off a partial CI run."
5. `pnpm test` + `pnpm build` + `pnpm bkit check` + `actionlint` all green; existing test fixtures (`tests/fixtures/heavy-customised-ci`) updated to the 4-job shape; new test asserts the protection script pre-flight names `bkit-tests-check`; `docs/pending.md` quick-path entry updated to the new script name + required job.

### Concrete Example _(plan-derived)_

**Setup:** A consumer has run `pnpm bkit install` after upgrading to this release. Their `.github/workflows/ci.yml` carries the seeded 4-job scaffold (Tier-3 seed-or-print — bkit never rewrites after first seed). The consumer has run `bash scripts/ci/bkit-protect-main.sh --dry-run` and seen the policy preview, then flipped branch protection on `main` to require `bkit-tests-check` once the new job has reported green at least once.

**Steps:**

1. Consumer pushes a docs-only commit `feat: tweak README` to a feature branch and opens a PR → CI runs.
2. `bkit-decide` reads markers (none), computes `run_level=light` (PR event, no force-build marker), emits plan JSON to `$GITHUB_OUTPUT` + plan table to `$GITHUB_STEP_SUMMARY`.
3. `bkit-tests` runs (the canonical static+unit gates remain); `bkit-tests-live` is skipped (consumer hasn't enabled the live-deploy `bkit-stub:` block, and `live_should_run=false` for docs-only).
4. `bkit-tests-check` runs (`if: !cancelled()`, `needs:` all): reads the plan, confirms `bkit-tests` succeeded as expected and `bkit-tests-live` was correctly skipped (plan said `live_should_run=false`), exits 0 — green.
5. Consumer's `/bkit-ship` Gate 2 reads `bkit-tests-check` on the PR; it is `success` on a full run; ship proceeds.
6. Consumer's `/bkit-ship` Step 12 (post-merge) asserts `bkit-tests-check == success` on the squash-merge run; merge is validated; issue closes.

**Outcome:** Every "validated" verdict the agent emits is backed by a capstone that read the plan and asserted reality matched. A partial run can no longer be misread as validation — the capstone's `exit 1` would have fired if any expected tier was skipped.

### Edge Cases _(plan-expanded)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer pushes `[skip ci]` on commit message | Workflow does not run; `bkit-tests-check` does not report; ship gates see "missing" and treat as non-green (refuse to declare validated). |
| Concurrency cancel (push + PR collapse) | `bkit-tests-check` reports `cancelled`; ship gates treat cancelled as non-green. |
| `bkit-decide` itself fails | `bkit-tests` / `bkit-tests-live` skipped; `bkit-tests-check` runs (`if: !cancelled()`), reads `needs.bkit-decide.result == 'failure'`, exits 1 — red. |
| Direct push to `dev` with no merged PR behind SHA (bkit's own repo) | `bkit-decide` auto-escalates via commits/{sha}/pulls → `run_level=full`; full tests run; capstone asserts; agent that reads the capstone treats `dev` push as validation. |
| `commits/{sha}/pulls` API errors (403/429/5xx) | Run-to-be-safe: `bkit-decide` defaults to `run_level=full`; plan JSON carries `depth_source=fallback-on-api-error` for visibility; capstone behaves as for any full run. |
| Renamed protection script invoked with old name (`bkit-set-protection.sh`) | File does not exist (renamed via `git mv`); shell returns non-zero ENOENT; postinstall advisory points at the new name. Existing consumer installs that have a copy of the old name keep it (Tier-3 seed-or-print: bkit never overwrites scripts/ci/); the postinstall advisory tells them to rename + flip `REQUIRED_JOB`. |
| Heavy-customised-ci fixture install (Tier-2 markers) | bkit's install logic keeps the consumer-customised job blocks intact; only the `bkit-stub:` regions and the canonical core of `bkit-decide` carry through. The fixture's `bkit-tests` job stays; the test asserts the 4-job shape appears after re-render of the template. |
| Mirror drift after edits to `.bkit/workflows/*.md` | Mirrors regenerated as final task; CI's `bkit check` step fails-loud if drift remains; `pnpm bkit check` runs locally as part of pre-push. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `.bkit/templates/.github/workflows/ci.yml` contains exactly one job each named `bkit-decide`, `bkit-tests`, `bkit-tests-live`, `bkit-tests-check`; preserves `# bkit:start verbose-ci-env` named block at 4-space indent | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests-check` has `if: ${{ !cancelled() }}`, `needs:` lists the other 3 jobs, asserts each expected tier ran+passed | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| bkit's own `.github/workflows/ci.yml` has the degenerate 4-job shape (no `bkit-tests-live`); SHA-cache + `[skip ci]` semantics preserved; actionlint clean | Static (actionlint via `pnpm lint:workflows`) | `.github/workflows/ci.yml` |
| `scripts/ci/bkit-protect-main.sh` exists, the old name does not, `REQUIRED_JOB="bkit-tests-check"`, pre-flight greps `ci.yml` for `bkit-tests-check` | Unit (Vitest) | new `.bkit/src/bkit-protect-main.test.ts` OR extend `bkit-postinstall.test.ts` |
| `bkit-postinstall.ts` Quick-path advisory mentions `bkit-protect-main.sh` + `bkit-tests-check`; "Require status checks" list says `bkit-tests-check` | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` |
| `.bkit/workflows/bkit-ship.md` Gate 2 + Step 12 + Gate 3 read `bkit-tests-check == success` on PR's full run; treat skipped/neutral/cancelled/missing as non-green; ASCII operators only | Static (grep/snapshot) | new `.bkit/src/bkit-ship-workflow.test.ts` OR extend `bkit-release-workflow.test.ts` |
| `.bkit/workflows/bkit-debug.md` Step 3 inspects `bkit-tests-check` conclusion (not blind `RUN_CONCLUSION`) | Static (grep) | extend same test as above |
| `.agents/rules.md` + `.bkit/templates/.agents/rules.md` Git/CI/Merges contain the "Green != ran != validated" bullet | Static (grep) | extend `bkit-rules-sync.test.ts` |
| `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` upgraded to the 4-job shape; rendering/install tests still pass | Integration (Vitest) | `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` + `.bkit/src/bkit-modules.upgrade.integration.test.ts` |
| `docs/pending.md` Quick path entry says `bkit-protect-main.sh` + `bkit-tests-check` | Static (grep) | `docs/pending.md` (existing entry "Enable `main` branch protection ruleset on `cbartens/bkit`") |
| `dist/` regenerated after `bkit-postinstall.ts` edit (`pnpm check:dist` green) | Build | `pnpm check:dist` |
| `.claude/commands/*` + `.cursor/commands/*` mirrors match `.bkit/workflows/*.md` after edits | Integration (Vitest) | `pnpm bkit check` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

| Change                                                                                                                                                           | Type            | Notes                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New job names in shipped `ci.yml`: `bkit-decide`, `bkit-tests-live`, `bkit-tests-check` (alongside existing `bkit-tests`)                                        | New             | Capstone is `bkit-tests-check` (NOT `bkit-gate` — the original #203 body proposed `bkit-gate`, but gether #403 renamed to live in the `bkit-tests*` family; the decision is settled).                                                                                                |
| `scripts/ci/bkit-set-protection.sh` -> `scripts/ci/bkit-protect-main.sh` (`git mv` rename of both engine + template copy)                                        | Breaking        | Consumer-owned: existing consumers who copied the script keep their copy intact (Tier-3 seed-or-print); the postinstall advisory + CHANGELOG flag the rename + the required-job flip.                                                                                                |
| `REQUIRED_JOB` constant: `"bkit-tests"` -> `"bkit-tests-check"` inside `bkit-protect-main.sh`                                                                    | Breaking        | Branch-protection consumers MUST re-apply the script (or hand-flip the required check). Consumer ci.yml MUST already carry `bkit-tests-check` for the pre-flight to pass.                                                                                                            |
| Postinstall advisory "Quick path" text + the "Require status checks: bkit-tests" line                                                                            | Behavioural     | Both updated to reference `bkit-protect-main.sh` and `bkit-tests-check`.                                                                                                                                                                                                             |
| Branch protection on bkit's own `main` (operator step — out-of-tree)                                                                                             | Operator action | Not executed by this build; quick-path entry in `docs/pending.md` already deferred under "Enable main branch protection ruleset" (403 on non-Pro). Plan updates the quick-path entry's referenced script + required job; the actual flip is operator-side when the repo is upgraded. |
| `.bkit/workflows/bkit-ship.md` Step 12 squash-merge guard: now keys off `bkit-tests-check` capstone conclusion instead of "any job whose name matches `/test/i`" | Behavioural     | A consumer whose ci.yml does not yet ship the capstone will see ship Step 12 refuse to declare validated — that is correct (they have not adopted the scaffold; ship's notion of "validated" requires the capstone).                                                                 |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

- **Rejected:** original #203 body's "`bkit-gate`" capstone name. Settled in favour of `bkit-tests-check` (per comment 2 — the capstone sits in the `bkit-tests*` family).
- **Rejected:** copy gether #403's live ci.yml verbatim into the template. The live ci.yml is gether-specific (turbo monorepo, Vercel, Supabase, Playwright). Generalize the SHAPE; ship app-specific tiers as `bkit-stub:` blocks.
- **Rejected:** "demote `bkit-decide` to plan producer only and keep `bkit-tests` as the required check". Misses the structural fix — `bkit-tests` legitimately skips on docs-only paths; required-check-on-`bkit-tests` would wedge those PRs. The capstone is `if: !cancelled()` AND structurally enforcing, which `bkit-tests` cannot be.
- **Rejected:** "ship the protection-script rename + ci.yml shape together as one task". Sequencing matters — the script's pre-flight greps the ci.yml for `bkit-tests-check`; the ci.yml change MUST land first. Tasks are ordered accordingly.
- **Deferred:** the run-level matrix table in `docs/deployments.md` § "Run-level tiers" already documents `none`/`partial`/`full`. A `plan-table-v1`-keyed refresh of that section is in scope; the executable parity-matrix from gether #403 §C6 is OUT of scope (bkit has no turbo affected-graph in its own repo).
- **Future phase recommendation:** once Renovate/consumer migration lag is acceptable, drop the `bkit-tests` job name from the engine's protection-script-name back-compat (no back-compat shim is shipped here — `git mv` is clean rename). Tracked as a docs/pending.md entry only if a consumer flags pain.

## Out of Scope

- The two plumbing defects from #209 (status.jsonl conflicts and `[skip ci]` HEAD-tip guard) — explicitly excluded by the design-input.
- Live execution of `bash scripts/ci/bkit-protect-main.sh` against `cbartens/bkit` (deferred per docs/pending.md — 403 on non-Pro).
- Turbo affected-graph integration in bkit's own ci.yml (bkit is single-package; no turbo monorepo).
- An executable parity-matrix script (gether #403 §C6) — appropriate only for repos with a turbo affected-graph.
- Renovate / external-caller alias drops (gether D14 / WS-4).
- E2E / Vercel-await / Playwright tier — bkit has no deploy; consumer template ships these as `bkit-stub:` blocks already and the new scaffold keeps them stubbed.
- `[force live]` marker plumbing in the template's `bkit-decide` (live tier itself is a stub; emit the JSON field but no consumer-side wiring beyond the existing stub).

## Merge Method

**Merge method: always squash.** Plan MUST land via `gh pr merge --squash --delete-branch --body ""` (bkit-ship.md Step 5 hardcoded).

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `scripts/ci/bkit-set-protection.sh` | `scripts/ci/bkit-protect-main.sh` | DELETE (via `git mv`) | Rename clarifies the script's job (it protects `main`, not "sets" a generic protection); same content, different filename + `REQUIRED_JOB` constant. |
| `.bkit/templates/scripts/ci/bkit-set-protection.sh` | `.bkit/templates/scripts/ci/bkit-protect-main.sh` | DELETE (via `git mv`) | Engine + template mirrors stay in lockstep. |
| `bkit-postinstall.ts` Quick-path advisory text (`"Quick path: bkit ships scripts/ci/bkit-set-protection.sh …"`) | New Quick-path text referencing `bkit-protect-main.sh` and `bkit-tests-check` | DELETE | Single-string replacement; old string never reused. |
| `bkit-postinstall.ts` "Require status checks: bkit-tests" line | "Require status checks: bkit-tests-check" | DELETE | Same. |
| `bkit-ship.md` Step 12 squash-merge "any job whose name matches /test/i" block | Read `bkit-tests-check` conclusion explicitly | DELETE | The new block names the capstone; no back-compat needed (workflow file is bkit-managed). |
| `bkit-ship.md` Gate 2 "any failures" rollup interpretation | "assert `bkit-tests-check == success`" interpretation | DELETE | Closes the L2 hole described in #203 body comment 3. |
| `bkit-debug.md` Step 3 `RUN_CONCLUSION == success` blind read | Read `bkit-tests-check` conclusion explicitly | DELETE | Same root cause as above. |
| `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` single-job shape | 4-job shape matching the new template | DELETE | Test fixture must reflect the new template shape or upgrade tests false-pass. |

> [!CAUTION]
> Each DELETE row is mirrored as `[DELETE]` in `Architecture & Component Changes` and as a removal/replace task in `Agent Execution Runbook` below.

## Security & Privacy

- [x] **CI workflow edits** — human-gated per `.agents/rules.md` L65 ("CI edits: ANY changes to `.github/workflows/*`, ALWAYS require human confirmation"). The two ci.yml changes (bkit's own + the template) are listed as a Build-phase gated step with explicit human-sign-off before commit.

_No new API routes, no DB writes, no secrets, no user input. The only secret implicitly referenced is `GH_BKIT_TOKEN` (already in env)._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` unchanged; `pnpm-lock.yaml` clean.
- [ ] **Dependency Versions:** No new deps; existing `picomatch` retained.
- [ ] **User Context:** Worktree at `.worktrees/203-ci-green-validated`; CLAUDE.md and `.agents/rules.md` read.
- [ ] **Pending Blockers:** No open Linear blockers tagged for #203; #209 is sibling and out of scope.
- [ ] **Project Context:** `docs/knowledge.md` and `docs/decisions.md` checked for prior CI-shape decisions (none conflicting). #199/#195 fix lessons (validate shipped config with real tool) apply — template ci.yml must lint clean via `actionlint`.
- [ ] **Testing & Quality:** `docs/testing.md` reviewed; bkit tests are pure Vitest, no Playwright.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Architecture & UI** — N/A (no UI; CI scaffold + scripts only).
- [ ] **Observability** — workflow `$GITHUB_STEP_SUMMARY` plan-table emits are observable artefacts; no new log channels.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checkbox `[x]`.
- [ ] **Breaking Changes confirmed:** Human checkbox `[x]`.
- [ ] **Gate 1 - Verified:** All Core items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — no DB.

### Data Schema Changes

None.

## Architecture & Component Changes

### Layer 1 — CI scaffold (foundational; lands first)

#### [MODIFY] `.bkit/templates/.github/workflows/ci.yml`

- **Existence Check:** present (read above).
- Rewrite from single `bkit-tests` job to 4-job shape:
  - **`bkit-decide`** — always runs (no `if:`); checkout depth 0; reads `[force build]` / `[force e2e]` / `[force cache]` / `[verbose ci]` / `[force live]` / `[skip ci]` markers from `github.event.head_commit.message` (push) OR `github.event.pull_request.title` (pull_request), passed via `env:` to avoid script-injection (NEVER inline `${{ github.event.* }}` inside `run:` blocks); computes `run_level` per the two-layer precedence (Layer 1 whether: `[skip ci]` -> `none`, else `candidate`; Layer 2 how-much: `[force build]` -> `full`, `pull_request` -> `full`, `workflow_dispatch` -> `full`, push to `{{DEFAULT_BRANCH}}` -> `full` main-carveout, push to `dev` -> `gh api repos/{owner}/{repo}/commits/{sha}/pulls` -> `light` if merged-PR found, else escalate to `full`); computes `live_should_run` and `should_run_e2e`; emits `plan` JSON single-line via `jq -c` to `$GITHUB_OUTPUT`; validates required fields present (`schema`, `run_level`, `web_affected`, `should_run_e2e`, `live_should_run`, `depth_source`, `whether_reason`) and fails loudly on missing; writes `plan-table-v1` markdown to `$GITHUB_STEP_SUMMARY`. `web_affected` is set to a `bkit-stub:` block (turbo affected-graph) — the stub returns `true` (run-to-be-safe) until the consumer wires up the affected-graph; the live stub copy from gether #403 §C3 is included verbatim inside the `bkit-stub:` fence so consumers can paste-and-trim. `live_should_run` is computed but the consumer side of it is a stub.
  - **`bkit-tests`** — `if: fromJSON(needs.bkit-decide.outputs.plan).run_level != 'none'`; `needs: [bkit-decide]`; exports `integration_outcome` and `e2e_outcome` job outputs (steps named `integration` and `e2e`); preserves the existing `# bkit:start verbose-ci-env` named block VERBATIM at the same 4-space indent (`bkit-preflight` regex match is exact). Consumer-customisable static + unit + integration steps remain unchanged; integration step keyed `if: fromJSON(needs.bkit-decide.outputs.plan).web_affected` (initially `true` from stub). The existing `Detect Direct Push` step (lines 88-107 of today's template) folds INTO `bkit-decide` (markers + commits/{sha}/pulls escalation) — delete from `bkit-tests`. The existing SHA-cache step (`Check SHA Cache`, lines 67-86) is consumer-relevant; KEEP it in `bkit-tests` (cache-skip is independent of the plan).
  - **`bkit-tests-live`** — `if: fromJSON(needs.bkit-decide.outputs.plan).live_should_run && needs.bkit-tests.result == 'success'`; `needs: [bkit-decide, bkit-tests]`; body is a `bkit-stub:` block (Vercel-await + curl health-check + `test:live` runner) commented out by default. Consumer enables by uncommenting + filling in secrets.
  - **`bkit-tests-check`** — `if: ${{ !cancelled() }}`; `needs: [bkit-decide, bkit-tests, bkit-tests-live]`; no checkout, no install (target: <10s); reads `fromJSON(needs.bkit-decide.outputs.plan)`, `needs.bkit-decide.result`, `needs.bkit-tests.result`, `needs.bkit-tests.outputs.integration_outcome`, `needs.bkit-tests.outputs.e2e_outcome`, `needs.bkit-tests-live.result`; asserts:
    1. `needs.bkit-decide.result == 'success'`; else `exit 1`.
    2. If `plan.run_level != 'none'` → `needs.bkit-tests.result == 'success'`; else `exit 1`.
    3. If `plan.web_affected == true` AND `plan.run_level != 'none'` → `integration_outcome == 'success'` (never `skipped`); else `exit 1`.
    4. If `plan.should_run_e2e == true` AND `plan.web_affected == true` → `e2e_outcome == 'success'` (never `skipped`); else `exit 1`.
    5. If `plan.live_should_run == true` → `needs.bkit-tests-live.result == 'success'`; else `exit 1`.
    6. Writes a one-line summary to `$GITHUB_STEP_SUMMARY` ("All expected tiers ran and passed" or "MISMATCH: <field> = <actual>, expected <expected>"). Exit code carries the verdict.
- Preserve all existing `bkit-stub:` blocks (`auto-force-e2e`, `migrations-immutable`, `supabase-migrate`, `test-presence`, `vercel-await`, `e2e`, `e2e-artifacts`, `smoke`) — move the `vercel-await` + `e2e` stubs INTO the `bkit-tests-live` job body (under the relevant `bkit-stub:` headers); leave the rest in `bkit-tests`.
- Preserve workflow-level `concurrency` block, `permissions`, and `on:` triggers verbatim.
- Honour the file's Tier-3 "yours to own" header semantics (the header comment block stays intact; bkit never rewrites this file after first seed — the change reaches new installs only).

#### [MODIFY] `.github/workflows/ci.yml` (bkit's OWN — dogfood)

- **Existence Check:** present (read above).
- Degenerate 4-job shape: `bkit-decide` (markers + run_level + merged-PR escalation, NO turbo affected-graph since bkit is single-package — `web_affected` hardcoded `true`, `should_run_e2e` hardcoded `false`, `live_should_run` hardcoded `false`); `bkit-tests` (today's static+unit+integration steps); NO `bkit-tests-live` job at all; `bkit-tests-check` capstone (`needs: [bkit-decide, bkit-tests]`, `if: !cancelled()`, asserts both succeeded).
- Fold existing `Check SHA Cache` step into `bkit-decide` as a step BEFORE the marker read (`bkit-tests` becomes `needs: [bkit-decide]` and `if: fromJSON(needs.bkit-decide.outputs.plan).run_level != 'none' && needs.bkit-decide.outputs.cache_hit != 'true'`, with the cache_hit field added to the plan JSON).
- Preserve workflow-level `permissions` + `concurrency` block + `on:` triggers verbatim.
- `actions: read` permission stays (used by SHA-cache `gh run list`).

### Layer 1 — Protection script rename (follows Layer-1 ci.yml changes)

#### [DELETE] `scripts/ci/bkit-set-protection.sh`

- Reason: renamed to `bkit-protect-main.sh` via `git mv` to preserve file history.

#### [NEW] `scripts/ci/bkit-protect-main.sh`

- Same content as `bkit-set-protection.sh` with these changes:
  - Header comment block: `bkit-set-protection.sh` -> `bkit-protect-main.sh` (all 3 occurrences).
  - `REQUIRED_JOB="bkit-tests"` -> `REQUIRED_JOB="bkit-tests-check"`.
  - All log prefix strings `[bkit-set-protection]` -> `[bkit-protect-main]` (lines 65, 70, 71, 79, 113).
  - Usage block (`bash scripts/ci/bkit-set-protection.sh …`) -> `bash scripts/ci/bkit-protect-main.sh …` (lines 21-23).
  - Pre-flight grep regex `^[[:space:]]+${REQUIRED_JOB}:` unchanged in shape — but the value flips to `bkit-tests-check` so it now greps for `^  bkit-tests-check:` (and the indent tolerance still applies).

#### [DELETE] `.bkit/templates/scripts/ci/bkit-set-protection.sh`

- Reason: same rename, template-side.

#### [NEW] `.bkit/templates/scripts/ci/bkit-protect-main.sh`

- Identical content to the engine copy.

### Layer 1 — Postinstall advisory (follows protection-script rename)

#### [MODIFY] `.bkit/src/bkit-postinstall.ts`

- **Existence Check:** present (read above, lines 1622-1641 already grep'd).
- Line 1622: `const protectionScript = path.join(cwd, "scripts", "ci", "bkit-set-protection.sh")` -> `…/bkit-protect-main.sh`.
- Line 1625: Quick-path string `"…bkit ships scripts/ci/bkit-set-protection.sh — run bash scripts/ci/bkit-set-protection.sh --dry-run …a bkit-tests job exists in .github/workflows/ci.yml before requiring it as a status check."` -> `"…bkit ships scripts/ci/bkit-protect-main.sh — run bash scripts/ci/bkit-protect-main.sh --dry-run to preview the policy, then drop --dry-run to apply. The script pre-flights that a bkit-tests-check job exists in .github/workflows/ci.yml before requiring it as a status check."`.
- Line 1636: `"    - Require status checks: bkit-tests\n"` -> `"    - Require status checks: bkit-tests-check\n"`.

### Layer 2 — Ship + debug gates (follows Layer-1)

#### [MODIFY] `.bkit/workflows/bkit-ship.md`

- **Existence Check:** present (read above).
- Step 6 of Step 2 (line 290): Replace `gh pr view {PR_NUMBER} --json statusCheckRollup → assert call succeeds. If query errors or any check failed or rollup empty → Failure Path.` with:
  - `gh pr view {PR_NUMBER} --json statusCheckRollup` → extract entry where `context == "bkit-tests-check"` AND assert `conclusion == "SUCCESS"`. If query errors OR rollup is empty OR `bkit-tests-check` entry is missing OR `conclusion != "SUCCESS"` (covers `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE`) → **Failure Path**.
  - Plus a `Done when:` line for testability and a note that PR-side `bkit-tests-check` MUST be on the FULL run (`workflow_run` head SHA matches PR `headRefOid`) — partial runs are explicitly non-validating.
- Step 12 squash-merge block (lines 885-897): Replace the `select(.name | test("test"; "i"))` heuristic with explicit `select(.name == "bkit-tests-check")`. Treat `skipped` / `neutral` / `cancelled` / missing the same as `failure`. Update the gate-12 checkbox label (line 952) to `Squash-merge CI run completed bkit-tests-check (not cancelled, not failed, not skipped)`.
- Anywhere else in the file that references `bkit-tests` as the validation gate (none observed in my grep — the bkit-stub:start/end block is unrelated) → leave untouched.
- ASCII operators only — verify `!=` `>=` `<=` (no Unicode).
- MCP-only for GitHub ops in the file — leave the existing `gh pr view` lines? **Re-check:** `.agents/workflows/bkit-ship.md` does NOT exist in this repo; the workflow lives at `.bkit/workflows/bkit-ship.md`. The constraint "Workflows are MCP-only for GitHub" applies to `.agents/workflows/*.md` per the memory note — but the workflow file under `.bkit/workflows/` still mixes `gh` CLI and `mcp__github__*` calls today (see Step 6 lines 290 onwards, Step 12 lines 887-896). This plan does NOT migrate the existing `gh` calls to MCP (out of scope for #203; that is a separate refactor). The MCP-only constraint in the design-input refers to `.agents/workflows/*.md` which does not exist; the existing mixed-mode in `.bkit/workflows/bkit-ship.md` is preserved. **If** a reviewer wants the existing `gh pr view` migrated to `mcp__github__pulls_get` or similar, that is a separate plan.

#### [MODIFY] `.bkit/workflows/bkit-debug.md`

- **Existence Check:** present (read above).
- Step 3 lines 362-365 (the `RUN_CONCLUSION` blind read): Add a step that, after computing `RUN_CONCLUSION`, also fetches the `bkit-tests-check` job conclusion explicitly:
  - `TESTS_CHECK=$(gh run view "$RUN_ID" --json jobs --jq '[.jobs[] | select(.name == "bkit-tests-check")][0].conclusion // "missing"')`
  - The condition that follows (line 366) becomes: `If RUN_ID non-empty AND (RUN_CONCLUSION != success OR TESTS_CHECK != success) → fetch CI logs …`.
  - Treats `skipped` / `cancelled` / `neutral` / `"missing"` as non-success.
- ASCII operators only.

#### [MODIFY] `.claude/commands/bkit-ship.md` + `.cursor/commands/bkit-ship.md` + `.claude/agents/bkit-ship-*.md` + `.cursor/agents/bkit-ship-*.md` mirrors

- Regenerated by `pnpm bkit install` at end-of-session (final mirror+dist task). No hand-edit.

### Layer 3 — Rules norm (follows Layer-2)

#### [MODIFY] `.agents/rules.md`

- **Existence Check:** present (line 52 onwards read).
- Under `### Git, CI & Merges`, AFTER line 64 (the existing `**CI:**` bullet), INSERT a new bullet:
  - `- **Validation != green:** Green != ran != validated. Classify the CI run type (partial / full) before reporting any verdict. NEVER report validated/done off a partial run; the validating run is always the PR's full CI. The required check is `bkit-tests-check`— it MUST be`success` on the full run, never skipped/neutral/cancelled/missing.`

#### [MODIFY] `.bkit/templates/.agents/rules.md`

- Same bullet inserted at the same position.

### Tests, fixtures, docs

#### [MODIFY] `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`

- Upgrade the single-job fixture to the 4-job shape so install/upgrade integration tests reflect the new template. Preserve the existing `consumer-job:` block (lines 54-59 — the test asserts non-bkit jobs survive install). Preserve the `# bkit:start` / `# bkit:end` markers that fence the `Install Dependencies` block (line 23-52 boundary).

#### [MODIFY] `.bkit/src/bkit-templates.content.test.ts`

- Extend the existing `verbose-ci-env` block tests (lines 135-160 range) with new assertions:
  - `bkit-decide:` job exists at column 0 of the `jobs:` block (1 occurrence).
  - `bkit-tests-check:` job exists (1 occurrence).
  - `bkit-tests-live:` job exists (1 occurrence; commented `bkit-stub:` or live — assert both forms by regex).
  - `bkit-tests-check` job has `if: ${{ !cancelled() }}` (or `if: !cancelled()` literal form) AND `needs:` listing `bkit-decide`, `bkit-tests`, `bkit-tests-live`.
  - The existing `bkit:start verbose-ci-env` block remains exactly one occurrence at 4-space indent.

#### [MODIFY] `.bkit/src/bkit-postinstall.test.ts`

- Add tests asserting:
  - Quick-path string mentions `bkit-protect-main.sh` (not `bkit-set-protection.sh`).
  - Quick-path string mentions `bkit-tests-check` (not bare `bkit-tests`).
  - "Require status checks" advisory line mentions `bkit-tests-check`.

#### [NEW] `.bkit/src/bkit-protect-main.test.ts` (OR extend an existing test file)

- File existence: `scripts/ci/bkit-protect-main.sh` present; old `bkit-set-protection.sh` absent (in engine root and in `.bkit/templates/scripts/ci/`).
- Static content: `REQUIRED_JOB="bkit-tests-check"` present; no `REQUIRED_JOB="bkit-tests"` remains.
- Pre-flight regex check: the script's grep pattern targets `bkit-tests-check` literal.

#### [MODIFY] `.bkit/src/bkit-rules-sync.test.ts`

- Add assertions that both `.agents/rules.md` and `.bkit/templates/.agents/rules.md` Git/CI/Merges section contain the literal substring `Green != ran != validated` (case-sensitive) and `bkit-tests-check` (ASCII operators implicit via the substring).

#### [MODIFY] `.bkit/src/bkit-modules.upgrade.integration.test.ts`

- Add an integration test step asserting that after `bkit install` against `heavy-customised-ci`, the rendered `ci.yml` contains `bkit-tests-check:` and the four expected job names. The existing `consumer-job:` block remains intact.

#### [MODIFY] `docs/pending.md`

- The entry "Enable `main` branch protection ruleset on `cbartens/bkit` (2026-05-12)" lines 173-182: replace `bash scripts/ci/bkit-set-protection.sh` -> `bash scripts/ci/bkit-protect-main.sh`; `required check bkit-tests` -> `required check bkit-tests-check`; context `bkit-tests` -> `bkit-tests-check` (3 occurrences in the description body); `bkit-tests` job exists -> `bkit-tests-check` job exists. Do NOT alter the deferred status — the operator step is still gated on GitHub Pro / public-repo upgrade.

#### [MODIFY] `CHANGELOG.md`

- New entry at top, format `## [{NEXT}] — YYYY-MM-DD`:
  - `### Added` — `bkit-decide`, `bkit-tests-live`, `bkit-tests-check` jobs in the seeded `ci.yml` (Tier-3 seed-or-print). Capstone is the sole required check.
  - `### Changed` — `scripts/ci/bkit-set-protection.sh` -> `scripts/ci/bkit-protect-main.sh`; `REQUIRED_JOB` -> `bkit-tests-check`. Postinstall advisory updated. Ship + debug agent gates simplified to `bkit-tests-check == success`.
  - `### Migration notes` — existing consumers with the old script copy: rename + flip `REQUIRED_JOB` + ensure ci.yml carries `bkit-tests-check` before re-applying. Bkit's own `main` protection unchanged (still deferred — GitHub Pro upgrade).

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/deployments.md` | Refresh "Run-level tiers" table heading to reference the new 4-job vocabulary (`bkit-decide` plan + `bkit-tests-check` capstone); add one line under "Branch protection" pointing at `bkit-protect-main.sh`. |
| `.bkit/templates/docs/deployments.md` | Same edits (consumer mirror). |
| `docs/knowledge.md` | Append one KN-N entry: "Capstone-gated CI — `bkit-tests-check` is the only required check; partial runs legitimately skip tiers without breaking required-check". |
| `docs/decisions.md` | Append one DE-N entry: "Capstone CI job `bkit-tests-check` adopted (gether #403 backport); decided over original #203 `bkit-gate` name and over making `bkit-tests` the required check". |
| `docs/pending.md` | Update quick-path entry (already inventoried). |
| `CHANGELOG.md` | New version entry (already inventoried). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No migrations. |
| **Code** | `git revert {squash-merge-SHA}` | All edits are in one squash. CI template rolls back to single-job shape; protection script reverts via `git mv` in the revert commit. |
| **Risk window** | None for consumers who have not re-applied protection. | Consumers who flipped branch protection to require `bkit-tests-check` between merge and revert would need to re-apply old `REQUIRED_JOB="bkit-tests"` — they can run `bash scripts/ci/bkit-set-protection.sh` from the revert; engine handles both names cleanly via the rename. |

## Agent Execution Runbook

> Every task carries a terse, codebase-verifiable `Done when:` line. Tasks are ordered chronologically with explicit dependencies. The 3 layers are grouped but sequenced so Layer-1 ci.yml changes land BEFORE the protection-script flip (which pre-flights the capstone job name) and BEFORE Layer 2 (which references the capstone by name).

### Phase A — Layer 1 ci.yml (foundational; everything else depends on the capstone existing)

- [ ] **Task A1:** Backup-read both ci.yml files (template + bkit's own) and the gether reference ci.yml; sketch the 4-job skeleton inline as a comment header in the template file (no executable change yet — a single multi-line YAML comment block at top with the job-by-job synopsis from `Architecture & Component Changes`).
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml` (header comment only).
  - **Done when:** the comment block "scaffold: bkit-decide -> bkit-tests / bkit-tests-live -> bkit-tests-check" is present at top; `pnpm lint:workflows` (actionlint) still green; no job-level changes yet.

- [ ] **Task A2:** Rewrite `.bkit/templates/.github/workflows/ci.yml` to the 4-job shape per Architecture § Layer 1. Preserve `# bkit:start verbose-ci-env` named block VERBATIM at 4-space indent. Migrate the `Detect Direct Push` step into `bkit-decide`. Migrate `vercel-await` + `e2e` + `e2e-artifacts` stubs INTO `bkit-tests-live`. Add `bkit-tests-check` capstone (`if: !cancelled()`, `needs:` all, no checkout, asserts every expected tier ran+passed per the 5 rules in Architecture).
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml`.
  - **Done when:** file contains exactly 4 top-level `jobs:` entries (`bkit-decide:`, `bkit-tests:`, `bkit-tests-live:`, `bkit-tests-check:`); `# bkit:start verbose-ci-env` appears exactly once at 4-space indent; `actionlint` exits 0; `.bkit/src/bkit-templates.content.test.ts` § verbose-ci-env tests still pass (re-run them after Task A6).

- [ ] **Task A3:** Rewrite `.github/workflows/ci.yml` (bkit's OWN) to the degenerate 3-job shape (`bkit-decide` + `bkit-tests` + `bkit-tests-check`; NO `bkit-tests-live`). Fold the existing `Check SHA Cache` step into `bkit-decide` and surface `cache_hit` on the plan JSON. Preserve `permissions`, `concurrency`, and `on:` blocks verbatim.
  - **Scope:** `.github/workflows/ci.yml`.
  - **Done when:** file contains exactly 3 top-level `jobs:` entries; `actionlint` exits 0; bkit's own CI runs green on the next push (verified Phase E).

- [ ] **Task A4:** Local sanity (no commit yet): `pnpm lint:workflows` (actionlint) on both files; render-test the template via `pnpm test -- bkit-templates.content` to confirm `verbose-ci-env` block tests still pass.
  - **Scope:** verification only.
  - **Done when:** both commands exit 0.

### Phase B — Layer 1 protection script + postinstall (depends on Phase A landing `bkit-tests-check` in both ci.yml files)

- [ ] **Task B1:** `git mv scripts/ci/bkit-set-protection.sh scripts/ci/bkit-protect-main.sh` (engine).
  - **Scope:** `scripts/ci/`.
  - **Done when:** `git status` shows the rename (R); old path does not exist (`test ! -f scripts/ci/bkit-set-protection.sh`); new path exists (`test -f scripts/ci/bkit-protect-main.sh`).

- [ ] **Task B2:** `git mv .bkit/templates/scripts/ci/bkit-set-protection.sh .bkit/templates/scripts/ci/bkit-protect-main.sh` (template mirror).
  - **Scope:** `.bkit/templates/scripts/ci/`.
  - **Done when:** same as B1, template path.

- [ ] **Task B3:** Edit `scripts/ci/bkit-protect-main.sh`: `REQUIRED_JOB="bkit-tests"` -> `"bkit-tests-check"`; update header comment block (3 occurrences of `bkit-set-protection`), usage block, all `[bkit-set-protection]` log prefixes (5 occurrences) to `[bkit-protect-main]`. Mirror identical edits to `.bkit/templates/scripts/ci/bkit-protect-main.sh`.
  - **Scope:** both renamed scripts.
  - **Done when:** `grep -n "bkit-set-protection" scripts/ci/bkit-protect-main.sh .bkit/templates/scripts/ci/bkit-protect-main.sh` returns no matches; `grep -n 'REQUIRED_JOB="bkit-tests-check"' scripts/ci/bkit-protect-main.sh` returns one match.

- [ ] **Task B4:** `bash scripts/ci/bkit-protect-main.sh --dry-run` from repo root.
  - **Scope:** verification.
  - **Done when:** exit 0; output contains `"contexts": ["bkit-tests-check"]`; pre-flight grep against `.github/workflows/ci.yml` passes (the bkit-own ci.yml from Phase A now carries the `bkit-tests-check:` job).

- [ ] **Task B5:** Edit `.bkit/src/bkit-postinstall.ts` per Architecture § Layer 1 Postinstall (line 1622 path; line 1625 Quick-path string; line 1636 status-checks line). Do NOT regenerate `dist/` yet — batched in Phase F.
  - **Scope:** `.bkit/src/bkit-postinstall.ts`.
  - **Done when:** `grep -n "bkit-set-protection" .bkit/src/bkit-postinstall.ts` returns no matches; `grep -n "bkit-protect-main" .bkit/src/bkit-postinstall.ts` returns three matches (path constant + Quick-path string + log/example reference if any); `grep -n "Require status checks: bkit-tests-check" .bkit/src/bkit-postinstall.ts` returns one match.

### Phase C — Layer 2 ship + debug gates (depends on Phase A landing the capstone)

- [ ] **Task C1:** Edit `.bkit/workflows/bkit-ship.md` Step 2 step 6 (line 290): replace the `statusCheckRollup` "any failures" pattern with explicit extract of the `bkit-tests-check` entry and assertion `conclusion == "SUCCESS"`. Treat skipped/neutral/cancelled/missing as non-green.
  - **Scope:** `.bkit/workflows/bkit-ship.md` Step 2.
  - **Done when:** the file contains a `bkit-tests-check` literal at line ~290 (or nearby) with `--jq '.statusCheckRollup[] | select(.context == "bkit-tests-check") | .conclusion'` and an explicit `if [ "$VAL" != "SUCCESS" ]` assertion that handles missing context as non-green.

- [ ] **Task C2:** Edit `.bkit/workflows/bkit-ship.md` Step 12 (lines 885-897): replace the `select(.name | test("test"; "i"))` heuristic with `select(.name == "bkit-tests-check")`. Update gate-12 checkbox (line 952) wording. Verify ASCII operators (no Unicode `≠ ≥ ≤`).
  - **Scope:** same file.
  - **Done when:** `grep -n 'test("test"; "i")' .bkit/workflows/bkit-ship.md` returns no matches; `grep -n 'bkit-tests-check' .bkit/workflows/bkit-ship.md` returns at least 3 matches (Step 6, Step 12 block, Gate 12 checkbox); `python3 -c "import sys; sys.exit(0 if all(c not in open('.bkit/workflows/bkit-ship.md').read() for c in '≠≥≤') else 1)"` exits 0.

- [ ] **Task C3:** Edit `.bkit/workflows/bkit-debug.md` Step 3 (line 362): after `RUN_CONCLUSION` computation, add a `TESTS_CHECK=$(gh run view "$RUN_ID" --json jobs --jq '[.jobs[] | select(.name == "bkit-tests-check")][0].conclusion // "missing"')`; tighten the conditional that follows so any non-`success` for either `RUN_CONCLUSION` OR `TESTS_CHECK` triggers context fetch. Verify ASCII operators.
  - **Scope:** `.bkit/workflows/bkit-debug.md`.
  - **Done when:** `grep -n "bkit-tests-check" .bkit/workflows/bkit-debug.md` returns at least 1 match in Step 3 lines 360-400; ASCII-only sweep clean.

### Phase D — Layer 3 rules norm (depends on Phase A so the rules wording can reference the right capstone)

- [ ] **Task D1:** Edit `.agents/rules.md` § "Git, CI & Merges": insert the new bullet AFTER line 64 (`**CI:**`).
  - **Scope:** `.agents/rules.md`.
  - **Done when:** `grep -n "Green != ran != validated" .agents/rules.md` returns one match between lines ~64-70; ASCII-only sweep clean.

- [ ] **Task D2:** Mirror the same bullet into `.bkit/templates/.agents/rules.md` § "Git, CI & Merges" at the same position.
  - **Scope:** `.bkit/templates/.agents/rules.md`.
  - **Done when:** same grep on template; `.bkit/src/bkit-rules-sync.test.ts` (after Phase E extension) green.

### Phase E — Tests + fixtures + docs (depends on Phases A-D)

- [ ] **Task E1:** Extend `.bkit/src/bkit-templates.content.test.ts` with 4-job-shape assertions per Tests § content-test (count `bkit-decide:`/`bkit-tests:`/`bkit-tests-live:`/`bkit-tests-check:` occurrences; `if: !cancelled()` + `needs:` listing).
  - **Scope:** `.bkit/src/bkit-templates.content.test.ts`.
  - **Done when:** `pnpm test -- bkit-templates.content` exits 0 with the 4 new tests reported.

- [ ] **Task E2:** Extend `.bkit/src/bkit-postinstall.test.ts` with Quick-path + status-checks assertions per Tests § postinstall.
  - **Scope:** `.bkit/src/bkit-postinstall.test.ts`.
  - **Done when:** `pnpm test -- bkit-postinstall` exits 0 with new assertions reported.

- [ ] **Task E3:** Create `.bkit/src/bkit-protect-main.test.ts` (OR extend `bkit-postinstall.test.ts`) per Tests § protect-main: assert file existence, absence of old name, `REQUIRED_JOB` literal, pre-flight grep target.
  - **Scope:** new (or extended) test file.
  - **Done when:** `pnpm test -- bkit-protect-main` (or the host file) exits 0; assertions pass against the on-disk rename from Phase B.

- [ ] **Task E4:** Extend `.bkit/src/bkit-rules-sync.test.ts` with the "Green != ran != validated" substring assertion against both `.agents/rules.md` and `.bkit/templates/.agents/rules.md`.
  - **Scope:** `.bkit/src/bkit-rules-sync.test.ts`.
  - **Done when:** `pnpm test -- bkit-rules-sync` exits 0; both rules.md files match.

- [ ] **Task E5:** Upgrade `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` to the 4-job shape (matching the template structure) while preserving the `consumer-job:` block and the `bkit:start`/`bkit:end` markers on the Install Dependencies step.
  - **Scope:** `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`.
  - **Done when:** `actionlint tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` exits 0; `consumer-job:` block byte-identical to before; `bkit-tests-check:` present.

- [ ] **Task E6:** Extend `.bkit/src/bkit-modules.upgrade.integration.test.ts` with a step asserting that after `bkit install` against `heavy-customised-ci`, the rendered ci.yml contains all four job names and `consumer-job:` is preserved.
  - **Scope:** `.bkit/src/bkit-modules.upgrade.integration.test.ts`.
  - **Done when:** `pnpm test -- bkit-modules.upgrade.integration` exits 0 with the new assertion passing.

- [ ] **Task E7:** Edit `docs/pending.md` entry "Enable `main` branch protection ruleset on `cbartens/bkit`" (lines 173-182): replace `bkit-set-protection.sh` -> `bkit-protect-main.sh` (1 occurrence); replace required-check `bkit-tests` -> `bkit-tests-check` (3 occurrences in the body); replace context `bkit-tests` -> `bkit-tests-check` (in the ruleset JSON line).
  - **Scope:** `docs/pending.md`.
  - **Done when:** `grep -n "bkit-set-protection" docs/pending.md` returns no matches; `grep -n "bkit-protect-main" docs/pending.md` returns at least 1 match; `grep -nE '`bkit-tests`' docs/pending.md` returns at most the historical resolved entries (line 190-193 of the BAR-167 Phase 2 entry uses `ci.yml` as a literal — preserve).

- [ ] **Task E8:** Edit `docs/deployments.md` + `.bkit/templates/docs/deployments.md`: refresh "Run-level tiers" / "Branch protection" sections with one-line pointers to the 4-job vocabulary + `bkit-protect-main.sh`. No structural rewrite — minimal patches only.
  - **Scope:** both deployments docs.
  - **Done when:** `grep -n "bkit-tests-check" docs/deployments.md .bkit/templates/docs/deployments.md` returns at least 1 match per file; prose lint (`pnpm lint:prose`) green.

- [ ] **Task E9:** Append new entries to `docs/knowledge.md` (KN-N) and `docs/decisions.md` (DE-N) per Documentation Updates table.
  - **Scope:** both docs.
  - **Done when:** `tail -n 5 docs/knowledge.md` shows the new KN entry with capstone-gated-CI; `tail -n 5 docs/decisions.md` shows the new DE entry on the `bkit-tests-check` adoption.

- [ ] **Task E10:** Append new version entry to `CHANGELOG.md` per Documentation Updates.
  - **Scope:** `CHANGELOG.md`.
  - **Done when:** new `## [{NEXT}] — YYYY-MM-DD` block at top with Added/Changed/Migration-notes sections; `pnpm lint:prose` green.

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Phases A-E checkboxes ticked; the protection-script and ci.yml changes are reflected in the repo (`git status` shows expected file paths modified/renamed/added).

### Phase F — Mirror + dist regeneration (FINAL — batched; depends on ALL of A-E)

> Per memory note "bkit install — batch at end, not after every edit" — do NOT regenerate mirrors per-edit. Run once at the end.

- [ ] **Task F1:** `pnpm build` to regenerate `dist/` after `.bkit/src/bkit-postinstall.ts` edit (Task B5).
  - **Scope:** `dist/`.
  - **Done when:** `pnpm check:dist` exits 0 (no diff between built and committed dist/).

- [ ] **Task F2:** `pnpm bkit install --apply` (or whatever the established command is — verify via `pnpm bkit --help`) inside the worktree to regenerate `.claude/commands/*` and `.cursor/commands/*` mirrors from `.bkit/workflows/*.md` edits (Phase C).
  - **Scope:** `.claude/commands/`, `.cursor/commands/`, `.claude/agents/`, `.cursor/agents/`.
  - **Done when:** `pnpm bkit check` exits 0 (no drift between source and mirrors).

- [ ] **Task F3:** Final verification: `pnpm test` AND `pnpm typecheck` AND `pnpm lint:workflows` (actionlint) AND `pnpm bkit check` AND `bash scripts/ci/bkit-protect-main.sh --dry-run`.
  - **Scope:** verification only.
  - **Done when:** all five commands exit 0.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit's tests are pure Vitest. No Playwright. Backend pipeline logic mocked at HTTP boundary where applicable. The CI scaffold itself is validated via `actionlint` (static) + the `.bkit/src/bkit-templates.content.test.ts` content assertions (snapshot-style); behavioural validation of the capstone happens via the next CI run on the PR.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` has a corresponding task (E1-E6, A4, B4, F3).
- [ ] **Update existing tests:** Done via E1, E2, E4, E6.
- [ ] **Write new tests:** Done via E3 (new `bkit-protect-main.test.ts` or extension).
- [ ] **Verify observability:** N/A — no new log channels.
- [ ] **Update documentation:** Done via E7, E8, E9, E10.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** `docs/pending.md`, `docs/deployments.md` (+ template), `docs/knowledge.md`, `docs/decisions.md`, `CHANGELOG.md` — every row in Documentation Updates ticked.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck`; `pnpm lint:workflows` (actionlint); `pnpm lint:prose`; `pnpm lint:slop`.
- [ ] **Test Synchronization:** No external test suites; all in-repo.
- [ ] **Build Configuration:** N/A (no new mock files).
- [ ] **Unit tests:** `pnpm test -- bkit-templates.content` + `pnpm test -- bkit-postinstall` + `pnpm test -- bkit-protect-main` (or host file) + `pnpm test -- bkit-rules-sync`.
- [ ] **Integration tests:** `pnpm test -- bkit-modules.upgrade.integration` (asserts heavy-customised-ci install → 4-job shape).
- [ ] **Dist freshness:** `pnpm check:dist`.
- [ ] **Mirror parity:** `pnpm bkit check`.
- [ ] **Protection script live:** `bash scripts/ci/bkit-protect-main.sh --dry-run` exits 0 and prints `"contexts": ["bkit-tests-check"]`.
- [ ] **Workflow validity:** `actionlint` over `.github/workflows/ci.yml`, `.bkit/templates/.github/workflows/ci.yml`, `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`.
- [ ] **Run all tests:** `pnpm test` (the full Vitest suite — 1100+ tests, ~30s). Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Any actionlint or test failure surfacing a real defect in the new ci.yml must be fixed in the ci.yml, not silenced via lint comments or test exclusions.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox ticked with explicit output captured (test names, actionlint result, dry-run output).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs.

- [ ] **Step 1:** Push the branch and open a PR; observe the next CI run renders the new 4-job graph. `gh pr view --json statusCheckRollup --jq '.statusCheckRollup[] | select(.context == "bkit-tests-check")'` returns a `conclusion: SUCCESS` entry. The new capstone job summary in `$GITHUB_STEP_SUMMARY` shows the plan table.
- [ ] **Step 2:** From the PR's `bkit-decide` step summary, verify `plan-table-v1` JSON is emitted and `markers_present` is `[]` for the clean PR push.
- [ ] **Step 3:** Operator note: branch-protection flip on `main` to require `bkit-tests-check` is deferred per `docs/pending.md` (403 on non-Pro). Do NOT execute. Update the quick-path entry only.
- [ ] **Step 4:** Run `/bkit-ship` end-to-end against this very PR; confirm Gate 2 reads the capstone (not "any failures" on rollup) and Step 12 squash-merge guard reads the capstone's conclusion on the merge SHA's CI run.

<!-- bkit:start -->

# 203 — CI Green != Validated: Backport gether #403 scaffold Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

(Same as top-of-file Context & Goals; preserved here for the bkit:start template-block consumers expect.)

**Success Criteria:**

- 4-job CI scaffold seeded into both bkit's own ci.yml and the consumer template; `bkit-tests-check` is the sole required check.
- Protection script renamed to `bkit-protect-main.sh`; `REQUIRED_JOB="bkit-tests-check"`.
- bkit-ship / bkit-debug gates simplified to read the capstone.
- `.agents/rules.md` carries the one-bullet norm.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

(See full Acceptance Scenario in top-of-file section. Same Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix.)

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed.**

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

(See top-of-file Breaking Changes table.)

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed.**

---

## Alternative Approaches & Recommendations

See top-of-file section.

## Out of Scope

See top-of-file section.

## Merge Method

**Merge method: always squash.**

## Supersession Inventory

See top-of-file table.

## Security & Privacy

`.github/workflows/*` edits human-gated per `.agents/rules.md` L65.

## 🚨 Pre-Flight / Dependencies 🚨

See top-of-file section.

### 🔒 Gate 1: Prerequisites Check

- [ ] Gate 1 verified.

## Data Schema Integration

None.

## Architecture & Component Changes

See top-of-file section (Layer 1 / Layer 2 / Layer 3 / Tests).

## Documentation Updates

See top-of-file table.

## Rollback Strategy

See top-of-file table.

## Agent Execution Runbook

See top-of-file Phases A-F.

### 🔒 Gate 2: Code Implementation Check

- [ ] Gate 2 verified.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] Gate 3 verified.

## Verification Plan

See top-of-file section.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] Gate 4 verified.

### Manual Verification

See top-of-file Step 1-4.

<!-- bkit:end -->
