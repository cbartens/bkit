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

- `.bkit/templates/.github/workflows/ci.yml` ships the full 4-job scaffold (`bkit-decide` / `bkit-tests` / `bkit-tests-live` / `bkit-tests-check`) by **copying gether's `ci.yml` near-verbatim and parameterizing values, NOT by stubbing whole tiers**. Per PRIMARY STEER (2026-06-02): `bkit-decide` (turbo affected-graph + base-ref resolution + marker reading + two-layer precedence + liveness/E2E gates + auto-escalate via `commits/{sha}/pulls` + `plan-table-v1` JSON assembly + jq schema-validation + `$GITHUB_STEP_SUMMARY` table + cancellation-notice step), `bkit-tests` (incl. Vercel-await + Resolve Vercel URL + integration with `integration_outcome` job output + Playwright E2E with `e2e_outcome` job output + artifact upload), `bkit-tests-live` (Vercel-await + `test:live` runner), and `bkit-tests-check` (`if: !cancelled()`, the 5-rule capstone) are all COPIED as CANONICAL. Consumer-specific VALUES are parameterized: `{{DEFAULT_BRANCH}}`, action SHAs + Node version (existing placeholder convention), project/preview URLs + secret names (placeholders or single-line stubs). Reserve commented `bkit-stub:` framing only for genuinely-not-universal tiers (Supabase-migrate class). The existing `# bkit:start verbose-ci-env` named block is preserved verbatim so `bkit-preflight` still validates.
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
| Heavy-customised-ci fixture install (Tier-2 markers) | The fixture retains its bare `# bkit:start` / `# bkit:end` markers around the consumer-customised `Install Dependencies` block (required by `bkit-modules.upgrade.integration.test.ts` lines 294-319 for both marker-survival AND text-drift detection). Because the fixture diverges from the template-shape on bare markers, the template's no-bare-marker guard (`bkit-templates.test.ts` L146-150) MUST stay scoped to `.bkit/templates/**` and NOT include `tests/fixtures/**`. Task E5 explicitly preserves the fixture's bare markers. NOTE: bkit's install logic ships Tier-3 seed-or-print — bkit does NOT auto-migrate consumer ci.yml files; the "carry-through" edge case applies only to FRESH installs (existing consumers must hand-migrate to the 4-job shape per the CHANGELOG migration-notes block). |
| Ship/debug gate sees `bkit-tests-check` with conclusion `cancelled` / `skipped` / `neutral` / missing | All four MUST be treated as non-green (refuse to declare validated). Layer-2 task C1/C3 wiring tested explicitly per Task E2 (new Vitest scenarios per outcome value) so a future refactor that loosens the gate to `conclusion != "FAILURE"` is caught. |
| `bkit-decide` job rename collides with `detectRunLevelsNotComposed` (`.bkit/src/bkit-postinstall.ts` L713) | Detector keys off literal step name `"Detect Direct Push"`. Either the new `bkit-decide` job retains a step `name: Detect Direct Push` (chosen path — cheapest), OR the detector + its tests refactor to key off the new `bkit-decide` job. Task A2b enforces the chosen path. |
| Mirror drift after edits to `.bkit/workflows/*.md` | Mirrors regenerated as final task via `pnpm bkit install` (no `--apply` flag — `install` is the apply verb, `check` is the dry-run); CI's `bkit check` step fails-loud if drift remains; `pnpm bkit check` runs locally as part of pre-push. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `.bkit/templates/.github/workflows/ci.yml` contains exactly one job each named `bkit-decide`, `bkit-tests`, `bkit-tests-live`, `bkit-tests-check`; preserves `# bkit:start verbose-ci-env` named block at 4-space indent | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests-check` has `if: ${{ !cancelled() }}`, `needs:` lists the other 3 jobs, asserts each expected tier ran+passed (greps the 5-rule capstone literals) | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-decide` carries the `Assemble and emit plan JSON` jq-schema-validation loop (asserts `schema|run_level|web_affected|should_run_e2e|live_should_run|depth_source|whether_reason` literals all present in the validation step) | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-decide` writes `plan-table-v1` summary AND a `cancellation notice` step (`if: cancelled()`) | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests` declares `outputs: integration_outcome:` and `outputs: e2e_outcome:` job outputs; integration step has `id: integration` and E2E step has `id: e2e` | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests-live` is a CANONICAL job body (not commented `bkit-stub:`) with `Run Live Tests` step calling `test:live` | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) |
| `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` regenerated to match new 4-job template; diff human-reviewed for intentional shape change | Snapshot regen + manual diff | `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` |
| `bkit-decide` (in TEMPLATE) carries a step `name: Detect Direct Push` so `detectRunLevelsNotComposed` preflight (`bkit-postinstall.ts` L713) still fires its advisory; existing 11 tests in `bkit-postinstall.test.ts` for that detector remain green when run against the template shape | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` (no edit needed if compat step retained) — covered by Task A2b |
| `bkit-decide` (in BKIT's OWN ci.yml) carries a step `name: Detect Direct Push` so `detectRunLevelsNotComposed` preflight still passes against the post-A3 bkit-own shape; the same ~11 detector tests remain green when the detector is exercised against bkit-self's degenerate 3-job shape (NEW row — covers the matrix gap flagged in scope-check-2 C4) | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` — covered by Task A3b |
| bkit's own `.github/workflows/ci.yml` has the degenerate 3-job shape (no `bkit-tests-live`); SHA-cache + `[skip ci]` semantics preserved; actionlint clean | Static (actionlint via `pnpm lint:workflows`) | `.github/workflows/ci.yml` |
| `scripts/ci/bkit-protect-main.sh` exists, the old name does not, `REQUIRED_JOB="bkit-tests-check"`, pre-flight greps `ci.yml` for `bkit-tests-check` | Unit (Vitest) | new `.bkit/src/bkit-protect-main.test.ts` OR extend `bkit-postinstall.test.ts` |
| `bkit-postinstall.ts` Quick-path advisory mentions `bkit-protect-main.sh` + `bkit-tests-check`; "Require status checks" list says `bkit-tests-check` (use word-boundary regex `/\bbkit-tests\b(?!-)/` to isolate old name vs prefix-collision with `bkit-tests-check`) | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` |
| `.bkit/workflows/bkit-ship.md` Gate 2 + Step 12 + Gate 3 read `bkit-tests-check == SUCCESS` on PR's full run via MCP (`mcp__github__pull_request_read` for `statusCheckRollup`); treat `skipped` / `neutral` / `cancelled` / missing as non-green; ASCII operators only | Static (grep/snapshot) | NEW `.bkit/src/bkit-ship-workflow.test.ts` (file does NOT currently exist — must be created) |
| Bug-class regression test: ship/debug Layer-2 gate explicitly rejects each of `cancelled` / `skipped` / `neutral` / `missing` for `bkit-tests-check` conclusion (four separate Vitest cases parsing the gate logic — closes the #203 root-cause class) | Unit (Vitest) | NEW `.bkit/src/bkit-ship-workflow.test.ts` (same file as above) — exactly 4 PASSED cases required |
| `.bkit/workflows/bkit-debug.md` Step 3 inspects `bkit-tests-check` conclusion via MCP equivalent (no new `gh` CLI invocations introduced by this plan) | Static (grep — assert zero NEW `gh run view` / `gh api` calls in Step 3 diff vs HEAD~) | extend same test as above |
| `.agents/rules.md` + `.bkit/templates/.agents/rules.md` Git/CI/Merges contain the "Green != ran != validated" bullet | Static (grep) | extend `bkit-rules-sync.test.ts` |
| `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` upgraded to the 4-job shape PRESERVING bare `# bkit:start` / `# bkit:end` markers (required by `bkit-modules.upgrade.integration.test.ts` L294-319 marker-survival AND text-drift assertions); `consumer-job:` block byte-identical | Integration (Vitest) | `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` + `.bkit/src/bkit-modules.upgrade.integration.test.ts` |
| Template's no-bare-marker guard (`bkit-templates.test.ts` L146-150) remains scoped to `.bkit/templates/**` — does NOT regress against the fixture's bare markers | Unit (Vitest) | `.bkit/src/bkit-templates.test.ts` (assert scope unchanged) |
| `docs/pending.md` Quick path entry says `bkit-protect-main.sh` + `bkit-tests-check` | Static (grep) | `docs/pending.md` (existing entry "Enable `main` branch protection ruleset on `cbartens/bkit`") |
| `dist/` regenerated after `bkit-postinstall.ts` edit (`pnpm check:dist` green) AND `dist/bkit-postinstall.js` contains the new `bkit-protect-main.sh` literal (no stale dist drift) | Build + grep | `pnpm check:dist`; `grep -c "bkit-protect-main" dist/bkit-postinstall.js` |
| `.claude/commands/*` + `.cursor/commands/*` mirrors match `.bkit/workflows/*.md` after edits | Integration (Vitest) | `pnpm bkit check` |
| bkit's OWN `.github/workflows/ci.yml` shell-logic preview: extract `bkit-decide` + `bkit-tests-check` `run:` bodies, run `bash -n` (syntax-check) on each; actionlint validates the YAML envelope, this validates the embedded bash before self-CI dogfood-wedge risk | Static (shell-preview) | helper script invoked by `pnpm lint:workflows` OR a one-shot bash snippet documented in Task A3a |

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
- **Accepted (per 2026-06-02 PRIMARY STEER):** high-fidelity copy of gether #403's live ci.yml into `.bkit/templates/.github/workflows/ci.yml` — fidelity over abstraction. The bkit template already targets the Next.js/Vercel/Supabase/turbo archetype (its current stubs prove it), so copying gether's proven structure + logic verbatim and parameterizing values is the correct pattern. Whole-tier `bkit-stub:` blocks are reserved for genuinely-not-universal tiers (e.g. Supabase-migrate). Supersedes the prior "Rejected: copy gether verbatim — generalize the SHAPE" framing, which contradicted the steer.
- **Rejected:** "demote `bkit-decide` to plan producer only and keep `bkit-tests` as the required check". Misses the structural fix — `bkit-tests` legitimately skips on docs-only paths; required-check-on-`bkit-tests` would wedge those PRs. The capstone is `if: !cancelled()` AND structurally enforcing, which `bkit-tests` cannot be.
- **Rejected:** "ship the protection-script rename + ci.yml shape together as one task". Sequencing matters — the script's pre-flight greps the ci.yml for `bkit-tests-check`; the ci.yml change MUST land first. Tasks are ordered accordingly.
- **Deferred:** the run-level matrix table in `docs/deployments.md` § "Run-level tiers" already documents `none`/`partial`/`full`. A `plan-table-v1`-keyed refresh of that section is in scope; the executable parity-matrix from gether #403 §C6 is OUT of scope (bkit has no turbo affected-graph in its own repo).
- **Future phase recommendation:** once Renovate/consumer migration lag is acceptable, drop the `bkit-tests` job name from the engine's protection-script-name back-compat (no back-compat shim is shipped here — `git mv` is clean rename). Tracked as a docs/pending.md entry only if a consumer flags pain.

## Out of Scope

- The two plumbing defects from #209 (status.jsonl conflicts and `[skip ci]` HEAD-tip guard) — explicitly excluded by the design-input.
- Live execution of `bash scripts/ci/bkit-protect-main.sh` against `cbartens/bkit` (deferred per docs/pending.md — 403 on non-Pro).
- Turbo affected-graph integration in **bkit's OWN** ci.yml (bkit is single-package; no turbo monorepo). The TEMPLATE still ships the canonical turbo affected-graph copied near-verbatim from gether per the PRIMARY STEER.
- An executable parity-matrix script (gether #403 §C6) for **bkit's own** ci.yml — appropriate only for repos with a turbo affected-graph; the template's `plan-table-v1` summary covers the consumer-side audit need.
- Renovate / external-caller alias drops (gether D14 / WS-4).
- E2E / Vercel-await / Playwright tier in **bkit's OWN** ci.yml — bkit has no deploy. The TEMPLATE now ships these CANONICAL (copied from gether per PRIMARY STEER) with parameterized URLs + secrets, not as commented `bkit-stub:` blocks.
- Migrating PRE-EXISTING `gh` CLI calls in `.bkit/workflows/bkit-ship.md` / `bkit-debug.md` to MCP (the MCP-only constraint is honoured for NEW edits in this plan — no new `gh` calls are introduced — but legacy lines untouched by #203 are not refactored here).

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
- **Strategy (per PRIMARY STEER 2026-06-02):** **Copy gether's `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` near-verbatim** and parameterize only the consumer-specific VALUES. The template's target archetype IS the gether stack (Next.js / Vercel / Supabase / turbo monorepo) — fidelity beats abstraction. Reserve commented `bkit-stub:` blocks ONLY for genuinely-not-universal tiers (Supabase-migrate class), kept minimal.
- Rewrite from single `bkit-tests` job to 4-job shape:
  - **`bkit-decide`** — COPIED CANONICAL from gether `ci.yml` lines ~49-547. Includes: checkout depth 0; bare `turbo` install + `Resolve base ref` step (PR -> `origin/{base_ref}`, push -> `BEFORE_SHA`, dispatch -> `origin/HEAD~1` fallback); **`Detect affected packages` step (turbo query affected --packages) copied verbatim** including zero-SHA / turbo-error / stderr-merge fallbacks — emits `affected_packages` / `web_affected` / `global_dep_changed` / `global_dep_triggers`; `Read markers` step copied verbatim (all 6 markers via `env:` to avoid script-injection — NEVER inline `${{ github.event.* }}` inside `run:`); `Layer 1 — whether to run` + `Layer 2 — how much to run` + `Compute liveness and E2E gate` steps copied verbatim (two-layer precedence; main-carveout; push-to-dev `gh api repos/{owner}/{repo}/commits/{sha}/pulls` auto-escalate with API-error fallback `depth_source=fallback-on-api-error`); `Assemble and emit plan JSON` step copied verbatim with the same jq schema-validation loop (`for field in schema run_level web_affected should_run_e2e live_should_run depth_source whether_reason; do has($f) and .[$f] != null; done` — `exit 1` on missing); `Write plan-table-v1 to step summary` step (`if: "!cancelled()"`) copied verbatim; `Write cancellation notice` step (`if: cancelled()`) copied verbatim. Parameterize: branch literal `main` / `dev` -> `{{DEFAULT_BRANCH}}` and `dev` where applicable; action SHAs left at gether's pinned versions (consumer can bump); `web` literal in `WEB_AFFECTED=$(echo "$PACKAGES" | jq 'any(.[]; . == "web")')` may stay as `web` since that's the gether/template archetype's web-app workspace name (document via inline comment).
  - **`bkit-tests`** — COPIED CANONICAL from gether `ci.yml` lines ~548-974. `if: fromJSON(needs.bkit-decide.outputs.plan).run_level != 'none'`; `needs: [bkit-decide]`; **declares `outputs: { integration_outcome: ${{ steps.integration.outcome }}, e2e_outcome: ${{ steps.e2e.outcome }} }` verbatim**; preserves the existing `# bkit:start verbose-ci-env` named block VERBATIM at the same 4-space indent (`bkit-preflight` regex match is exact). Steps copied near-verbatim: Checkout (fetch-depth 0), Fetch Base Branch, Guard Migration Immutability, Materialise Base Worktree (slop-scan delta), Setup pnpm/Node, Configure Verbose CI, Install Dependencies, Install Vale, Run Lint / Typecheck / Format / Vale / Slop-Scan (full + delta), Tear Down Base Worktree, Run Bkit Check, Pull Vercel Env Vars (with fail-fast on missing `NEXT_PUBLIC_SUPABASE_URL` and CRITICAL*KEYS loop), Validate Environment, **Resolve Vercel URL** (gated `if: fromJSON(needs.bkit-decide.outputs.plan).web_affected`, queries Vercel API by `meta-githubCommitSha` with `state=READY,BUILDING,QUEUED,INITIALIZING` filter and 60s retry — copied canonical), Apply Supabase Migrations (gated to push events on `{{DEFAULT_BRANCH}}` / `dev` — note this gether-side runs migrations; for the template, leave canonical since it's gated cleanly), Run Vitest Unit Tests, Build All Packages, **Run Vitest Integration Tests with `id: integration`** (gated `if: fromJSON(needs.bkit-decide.outputs.plan).web_affected`), **Await Vercel Deployment** (gated `run_level == 'full' && web_affected`), Check Stale Test Data, **Run Playwright E2E Tests with `id: e2e`** (gated `(run_level == 'full' || should_run_e2e) && web_affected`), Upload Playwright Report, Report Skipped Tests. Parameterize: all `secrets.VERCEL*\_`/`secrets.SUPABASE\_\_`/`secrets.VERCEL_AUTOMATION_BYPASS_SECRET`/`secrets.GH_BKIT_TOKEN`left as`${{ secrets.X }}` references (consumer-provided); production preview URLs (`https://app-gether-life.vercel.app` / `https://app-gether-life-git-dev-gether-life.vercel.app`) -> `https://{{PROJECT_SLUG}}.vercel.app` / `https://{{PROJECT_SLUG}}-git-dev-{{TEAM_SLUG}}.vercel.app` placeholders with one-line stub-comment; `apps/web` workspace path left as-is (template archetype). The existing `Detect Direct Push` step in today's template (lines 88-107) is replaced by `bkit-decide`'s marker + escalation steps — but see Task A2b below: a `name: Detect Direct Push` step is RETAINED inside `bkit-decide` as a thin compat alias so `detectRunLevelsNotComposed` (`.bkit/src/bkit-postinstall.ts` L713) still fires its advisory. The existing `Check SHA Cache` step (today's lines 67-86) is gether-specific via SHA-cache-skip — NOT in gether's ci.yml — KEEP in `bkit-tests` as the first step (cache-skip is independent of the plan; preserves consumer behaviour).
  - **`bkit-tests-live`** — COPIED CANONICAL from gether `ci.yml` lines ~975-1043. `needs: [bkit-decide, bkit-tests]`; `if: fromJSON(needs.bkit-decide.outputs.plan).live_should_run && needs.bkit-tests.result == 'success'` (re-add the bkit-tests success gate that gether's TEMP DEBUG note removes); `env:` block with `TURBO_TOKEN` / `TURBO_TEAM` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` / `GH_BKIT_TOKEN` / `TURBO_LOG_LEVEL` / `VERBOSE_CI` copied verbatim; Steps: Checkout, Setup pnpm/Node, Configure Verbose CI, Install Dependencies, Pull Vercel Env Vars, **Run Live Tests** (`env: LIVE_API: "1"`; resolves `DEPLOY_URL` from branch; runs `npx turbo run test:live --continue`). Parameterize: same secret + URL placeholders as `bkit-tests`. **This is a CANONICAL job body, NOT a commented `bkit-stub:` block** (per STEER: "present + parameterized" not "commented-out stub").
  - **`bkit-tests-check`** — COPIED CANONICAL from gether `ci.yml` lines ~1044-1101 (the 5-rule capstone): `name: bkit-tests-check`; `needs: [bkit-decide, bkit-tests, bkit-tests-live]`; `if: ${{ !cancelled() }}`; `timeout-minutes: 2`; one step `Check Test Plan Followed` with `env:` block exposing `PLAN`, `DECIDE_RESULT`, `TESTS_RESULT`, `LIVE_RESULT`, `INTEGRATION_OUTCOME`, `E2E_OUTCOME`; `run:` script copied verbatim asserting:
    1. `DECIDE_RESULT == "success"`; else `FAIL=1`.
    2. If `plan.run_level != 'none'` AND `TESTS_RESULT != 'success'` -> `FAIL=1`.
    3. If `plan.run_level != 'none'` AND `plan.web_affected == 'true'` AND `INTEGRATION_OUTCOME != 'success'` -> `FAIL=1`.
    4. If `plan.run_level != 'none'` AND `plan.should_run_e2e == 'true'` AND `plan.web_affected == 'true'` AND `E2E_OUTCOME != 'success'` -> `FAIL=1`.
    5. If `plan.live_should_run == 'true'` AND `LIVE_RESULT != 'success'` -> `FAIL=1`.
    6. Final `if [ "$FAIL" = "1" ]; then ::error::bkit-tests-check FAILED…; exit 1; fi` plus success line. No checkout, no install (target: <10s).
- **Reserve commented `bkit-stub:` blocks ONLY for genuinely-not-universal tiers:** keep `bkit-stub:supabase-migrate` (some consumers run Supabase via different tooling), `bkit-stub:test-presence`, `bkit-stub:smoke` (separate workflow file), `bkit-stub:auto-force-e2e`, `bkit-stub:migrations-immutable` (already canonical inside `bkit-tests`'s Guard Migration Immutability step; the legacy stub variant can be removed since the canonical step now ships present). Remove the `bkit-stub:vercel-await` / `bkit-stub:e2e` / `bkit-stub:e2e-artifacts` stubs — those tiers are now CANONICAL inside `bkit-tests` / `bkit-tests-live`.
- Preserve workflow-level `concurrency` block, `permissions`, and `on:` triggers — adopt gether's shape (`permissions: contents: read, statuses: read, pull-requests: read`; `concurrency` group `${{ github.workflow }}-${{ github.head_ref || github.ref_name }}` cancel-in-progress true) since the template's current `concurrency` is gether-derived already. `on:` triggers parameterized: `branches: [{{DEFAULT_BRANCH}}, dev]`.
- Workflow-level `env:` block: copy `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` + `TURBO_FORCE` (force-cache marker) from gether verbatim.
- Honour the file's Tier-3 "yours to own" header semantics (the header comment block stays intact; bkit never rewrites this file after first seed — the change reaches new installs only).

#### [MODIFY] `.github/workflows/ci.yml` (bkit's OWN — dogfood)

- **Existence Check:** present (read above).
- Degenerate 3-job shape: `bkit-decide` (markers + run_level + merged-PR escalation, NO turbo affected-graph since bkit is single-package — `web_affected` hardcoded `true`, `should_run_e2e` hardcoded `false`, `live_should_run` hardcoded `false`); `bkit-tests` (today's static+unit+integration steps); NO `bkit-tests-live` job at all; `bkit-tests-check` capstone (`needs: [bkit-decide, bkit-tests]`, `if: !cancelled()`, asserts both succeeded).
- **`bkit-decide` MUST contain a step `name: Detect Direct Push`** (the same literal name today's template uses at lines 88-107). Rationale: `.bkit/src/bkit-postinstall.ts` L713 (`detectRunLevelsNotComposed`) keys its advisory off this literal step name in the CONSUMER ci.yml; the detector itself runs against consumer repos but the bkit-own ci.yml is the dogfood reference. Retaining the name avoids breaking the detector contract (CRITICAL #4 from plan-review-3). Alternative — refactor the detector to key off `bkit-decide` job presence + `plan.run_level` output (rejected as out-of-scope expansion vs the cheap step-name compat).
- Fold existing `Check SHA Cache` step into `bkit-decide` as a step BEFORE the marker read (`bkit-tests` becomes `needs: [bkit-decide]` and `if: fromJSON(needs.bkit-decide.outputs.plan).run_level != 'none' && needs.bkit-decide.outputs.cache_hit != 'true'`, with the `cache_hit` field added to the plan JSON).
- Preserve workflow-level `permissions` + `concurrency` block + `on:` triggers verbatim.
- `actions: read` permission stays (used by SHA-cache `gh run list`).
- **Self-CI sequencing safety (CRITICAL #8):** before commit, validate the bkit-decide + bkit-tests-check `run:` bodies with `bash -n` (syntax preview), not actionlint alone. actionlint validates the YAML envelope + GHA expression syntax + invokes shellcheck on `run:` bodies, but a logic typo (e.g. broken `case` arm) can still pass and wedge self-CI for the entire feat branch. The shell-preview is part of Task A4 below.

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
- **MCP-only constraint (per plan-input L84 + user-memory `feedback_workflows_mcp_only`):** This plan introduces NO new `gh` CLI / `gh api` / raw-HTTP calls anywhere in `.bkit/workflows/*.md`. Pre-existing legacy `gh pr view` / `gh run view` lines untouched by #203 are out-of-scope to migrate (a separate refactor); but every NEW gate added by Layer 2 below uses the MCP GitHub tooling already configured in this workflow (e.g. `mcp__github__pull_request_read` with `methods: ['statusCheckRollup']` for status checks, `mcp__github__list_workflow_runs` + `mcp__github__list_workflow_jobs` for job-level conclusion fetches).
- Step 6 of Step 2 (line 290): Replace the current `statusCheckRollup` "any failures" gate with an MCP-based capstone gate:
  - Call `mcp__github__pull_request_read` with `method: 'statusCheckRollup'` (or the project's already-used MCP getter for status checks) against the PR; extract the entry where `context == "bkit-tests-check"` and assert `conclusion == "SUCCESS"`.
  - If the call errors OR the rollup is empty OR the `bkit-tests-check` entry is missing OR `conclusion` is any of `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE` (the four non-green outcomes that fed the #203 bug) -> **Failure Path**.
  - Add a note that PR-side `bkit-tests-check` MUST be on the FULL run for the PR's `headRefOid` — partial runs are explicitly non-validating.
- Step 12 squash-merge block (lines 885-897): Replace the `select(.name | test("test"; "i"))` heuristic with an MCP-based `bkit-tests-check` extractor: read the workflow run for the squash-merge SHA via MCP (`mcp__github__list_workflow_runs` filtered by `head_sha`, then `mcp__github__list_workflow_jobs`), find the job with `name == "bkit-tests-check"`, and assert `conclusion == "success"`. Treat `skipped` / `neutral` / `cancelled` / missing the same as `failure`. Update the gate-12 checkbox label (line 952) to `Squash-merge CI run completed bkit-tests-check (not cancelled, not failed, not skipped)`. **Do not introduce a fresh `gh run view --json jobs --jq …` call here** — the existing legacy block uses jq-on-`gh-json`; the replacement is MCP-only since this is a NEW gate, not a touch-up of legacy plumbing.
- Anywhere else in the file that references `bkit-tests` as the validation gate (none observed in my grep — the bkit-stub:start/end block is unrelated) -> leave untouched.
- ASCII operators only — verify `!=` `>=` `<=` (no Unicode).

#### [MODIFY] `.bkit/workflows/bkit-debug.md`

- **Existence Check:** present (read above).
- **MCP-only constraint applies:** the new `TESTS_CHECK` fetch is MCP, not `gh run view`.
- Step 3 lines 362-365 (the `RUN_CONCLUSION` blind read): after computing `RUN_CONCLUSION`, add an MCP-based fetch of the `bkit-tests-check` job conclusion:
  - Use `mcp__github__list_workflow_jobs` (or the project's equivalent MCP job-list getter) against the resolved `RUN_ID`; locate the job with `name == "bkit-tests-check"`; bind its `conclusion` to `TESTS_CHECK` (fallback `"missing"` if absent).
  - The condition that follows (line 366) becomes: `If RUN_ID non-empty AND (RUN_CONCLUSION != "success" OR TESTS_CHECK != "success") -> fetch CI logs …`.
  - Treats `skipped` / `cancelled` / `neutral` / `"missing"` as non-success.
- ASCII operators only.

#### [MODIFY] `.claude/commands/bkit-ship.md` + `.cursor/commands/bkit-ship.md` + `.claude/agents/bkit-ship-*.md` + `.cursor/agents/bkit-ship-*.md` mirrors

- Regenerated by `pnpm bkit install` at end-of-session (final mirror+dist task). No hand-edit.

### Layer 3 — Rules norm (follows Layer-2)

#### [MODIFY] `.agents/rules.md`

- **Existence Check:** present (line 52 onwards read).
- Under `### Git, CI & Merges`, AFTER line 64 (the existing `**CI:**` bullet), INSERT a new bullet:
  - `- **Validation != green:** Green != ran != validated. Classify the CI run type (partial / full) before reporting any verdict. NEVER report validated/done off a partial run; the validating run is always the PR's full CI. The required check is `bkit-tests-check`— it MUST be`success` on the full run, never skipped/neutral/cancelled/missing.`
  - Note the explicit space between the closing backtick of `` `bkit-tests-check` `` and the em-dash (avoids the no-space-before-em-dash prose-lint smell flagged in plan-review-1 OP1).

#### [MODIFY] `.bkit/templates/.agents/rules.md`

- Same bullet inserted at the same position.

### Tests, fixtures, docs

#### [MODIFY] `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`

- Upgrade the single-job fixture to the 4-job shape so install/upgrade integration tests reflect the new template. Preserve the existing `consumer-job:` block (lines 54-59 — the test asserts non-bkit jobs survive install).
- **CRITICAL contract collision resolution (per plan-review-3 #3):** the fixture MUST preserve its bare `# bkit:start` / `# bkit:end` markers around the `Install Dependencies` block (today's lines 23-52). `.bkit/src/bkit-modules.upgrade.integration.test.ts` L294-319 depends on these bare markers for (i) marker-survival and (ii) `detectTier2TextDrift` text-drift detection on the consumer-added `NODE_AUTH_TOKEN` env line inside the marker block. The TEMPLATE's no-bare-marker guard (`.bkit/src/bkit-templates.test.ts` L146-150) only scans `.bkit/templates/.github/workflows/ci.yml` — it does NOT scan `tests/fixtures/**`, so the fixture's bare markers do NOT violate the template guard. Task E5 must (a) keep the bare markers in the fixture; (b) verify the template-guard's scope remains scoped to `.bkit/templates/**` (assertion added in Task E1's matrix row "Template's no-bare-marker guard remains scoped").

#### [MODIFY] `.bkit/src/bkit-templates.content.test.ts`

- Extend the existing `verbose-ci-env` block tests (lines 135-160 range) with new assertions:
  - `bkit-decide:` job exists at column 0 of the `jobs:` block (1 occurrence).
  - `bkit-tests-check:` job exists (1 occurrence).
  - `bkit-tests-live:` job exists as a CANONICAL job body (NOT commented — assert the `Run Live Tests` step is present un-commented).
  - `bkit-tests-check` job has `if: ${{ !cancelled() }}` (or `if: !cancelled()` literal form) AND `needs:` listing `bkit-decide`, `bkit-tests`, `bkit-tests-live`.
  - `bkit-tests` job declares `outputs:` with `integration_outcome:` and `e2e_outcome:`; integration step has `id: integration` and E2E step has `id: e2e`.
  - `bkit-decide` has the `Assemble and emit plan JSON` step containing the literal schema-validation loop tokens (all six required fields `schema|run_level|web_affected|should_run_e2e|live_should_run|depth_source|whether_reason` present).
  - `bkit-decide` has the `Write plan-table-v1 to step summary` step (`if: "!cancelled()"`) AND the `Write cancellation notice` step (`if: cancelled()`).
  - `bkit-decide` retains a step `name: Detect Direct Push` (compat alias for `detectRunLevelsNotComposed`).
  - The existing `bkit:start verbose-ci-env` block remains exactly one occurrence at 4-space indent.
  - Template's no-bare-marker guard (`.bkit/src/bkit-templates.test.ts` L146-150) remains scoped to `.bkit/templates/**` — does NOT regress to scan `tests/fixtures/**` (the heavy-customised-ci fixture's bare markers are an intentional contract for the integration test).

#### [REGEN] `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap`

- **CRITICAL (per plan-review-3 #1):** the single full-file template snapshot in `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` (one `exports[...] = `...``block ~303 lines today) WILL break when Task A2 rewrites the template ci.yml. Regenerate via`pnpm test -- bkit-templates.content -u`(Vitest update-snapshot flag) AFTER Task A2 lands, THEN eyeball-review the snapshot diff to confirm the new 4-job shape is INTENTIONAL — never rubber-stamp the regeneration. Without this step`pnpm test` (Gate 4) cannot pass. See Task A5 below.

#### [MODIFY] `.bkit/src/bkit-postinstall.test.ts`

- Add tests asserting:
  - Quick-path string mentions `bkit-protect-main.sh` (not `bkit-set-protection.sh`).
  - Quick-path string mentions `bkit-tests-check` and does NOT include the bare prefix `bkit-tests` without the `-check` suffix (assertion uses word-boundary regex `/\bbkit-tests\b(?!-)/` to defeat the prefix-collision).
  - "Require status checks" advisory line mentions `bkit-tests-check`.

#### [NEW] `.bkit/src/bkit-ship-workflow.test.ts` (NEW FILE — does NOT currently exist; must be created)

- Bug-class regression coverage (CRITICAL #6 from review batch — closes the #203 root cause):
  - `bkit-ship.md` Step 2 step 6 gate parses `bkit-tests-check` via MCP-style call (no NEW `gh pr view`/`gh api`/raw-HTTP added by this plan); the gate text explicitly treats each of `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE` / missing as non-green (one Vitest case per outcome, asserting the gate's logic branches reject it).
  - `bkit-ship.md` Step 12 squash-merge guard names `bkit-tests-check` explicitly (no `test("test"; "i")` regex heuristic remains).
  - `bkit-debug.md` Step 3 adds an MCP fetch of `TESTS_CHECK` (no NEW `gh run view` call) and treats `skipped`/`cancelled`/`neutral`/`missing` as non-success.
  - **Plan-introduced new-`gh`-call counter:** grep both `.bkit/workflows/bkit-ship.md` and `.bkit/workflows/bkit-debug.md` between HEAD and the plan diff; assert ZERO new `gh ` / `gh api ` / `curl -s.*api.github` invocations were added by this plan's diff. Legacy lines are exempt; the assertion is about additions only.

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

- [ ] **Task A1:** Backup-read both ci.yml files (template + bkit's own) and the gether reference ci.yml (`/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml`); inline-document the COPY mapping (which gether line ranges become which template sections) as a short multi-line YAML comment header in the template — single comment block, no executable change. This is the bridge note for Task A2's copy-fidelity pass.
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml` (header comment only).
  - **Done when:** the file's first 30 lines contain a comment block matching the literal substring `scaffold: bkit-decide -> bkit-tests / bkit-tests-live -> bkit-tests-check (copied from gether #403; see plan-v2-reviewed §Architecture Layer 1)`; `pnpm lint:workflows` (actionlint) exit 0; no job-level changes yet.

- [ ] **Task A2:** Rewrite `.bkit/templates/.github/workflows/ci.yml` to the 4-job shape per Architecture § Layer 1 — **copy gether's `ci.yml` near-verbatim per PRIMARY STEER**, parameterizing only values: `{{DEFAULT_BRANCH}}` / Vercel preview URL placeholders / secret references. Preserve `# bkit:start verbose-ci-env` named block VERBATIM at 4-space indent. Retain a step `name: Detect Direct Push` inside `bkit-decide` (compat alias for `detectRunLevelsNotComposed`). Add `bkit-tests-check` capstone copied verbatim from gether L1044-1101. `bkit-tests-live` ships as a CANONICAL job body (NOT a commented `bkit-stub:` block).
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml`.
  - **Done when:** `grep -cE '^[[:space:]]*bkit-(decide|tests|tests-live|tests-check):[[:space:]]*$' .bkit/templates/.github/workflows/ci.yml` returns exactly `4`; `grep -c '^    # bkit:start verbose-ci-env$' …ci.yml` returns exactly `1`; `grep -c 'name: Detect Direct Push' …ci.yml` returns at least `1`; `grep -c 'Run Live Tests' …ci.yml` returns exactly `1` (un-commented — verify with `grep -cE '^      - name: Run Live Tests$' …ci.yml`); `grep -c 'integration_outcome:' …ci.yml` returns at least `1` AND `grep -c 'e2e_outcome:' …ci.yml` returns at least `1`; `grep -c 'plan-table-v1' …ci.yml` returns exactly `4` (matches gether reference: jq schema-tag occurrence + assemble-step `schema=plan-table-v1` literal + summary-table header occurrence + cancellation-notice schema-tag echo — verified `grep -c "plan-table-v1" /Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` returns `4`); `grep -c 'Write cancellation notice' …ci.yml` returns exactly `1`; `actionlint .bkit/templates/.github/workflows/ci.yml` exits 0.

- [ ] **Task A2b (compat retain):** Verify `detectRunLevelsNotComposed` detector contract preserved.
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml` (verification — A2 already retained the step name).
  - **Done when:** `grep -c 'Detect Direct Push' .bkit/templates/.github/workflows/ci.yml` returns at least `1`; the 11 existing tests in `.bkit/src/bkit-postinstall.test.ts` covering `detectRunLevelsNotComposed` continue to pass (`pnpm test -- bkit-postinstall` exits 0 and none of those 11 tests skip).

- [ ] **Task A3:** Rewrite `.github/workflows/ci.yml` (bkit's OWN) to the degenerate 3-job shape (`bkit-decide` + `bkit-tests` + `bkit-tests-check`; NO `bkit-tests-live`). Fold the existing `Check SHA Cache` step into `bkit-decide` and surface `cache_hit` on the plan JSON. Retain a step `name: Detect Direct Push` inside `bkit-decide` (detector compat). Preserve `permissions`, `concurrency`, and `on:` blocks verbatim. `actions: read` stays (SHA-cache `gh run list`).
  - **Scope:** `.github/workflows/ci.yml`.
  - **Done when:** `grep -cE '^[[:space:]]*bkit-(decide|tests|tests-check):[[:space:]]*$' .github/workflows/ci.yml` returns exactly `3`; `grep -c 'bkit-tests-live:' .github/workflows/ci.yml` returns exactly `0`; `grep -c 'Detect Direct Push' .github/workflows/ci.yml` returns at least `1`; `actionlint .github/workflows/ci.yml` exits 0; bkit's own CI green on next push (verified Phase F).

- [ ] **Task A3b (bkit-self detectRunLevelsNotComposed contract, MUST-FIX #4):** Verify bkit's OWN post-rewrite `.github/workflows/ci.yml` (Task A3 output) STILL satisfies the `detectRunLevelsNotComposed` detector contract (`.bkit/src/bkit-postinstall.ts` L713) — not just the template. The detector keys off the literal step name `Detect Direct Push`; after A3 folds the SHA-cache step into `bkit-decide` and retains the `Detect Direct Push` step name, the detector's ~11 tests in `.bkit/src/bkit-postinstall.test.ts` MUST still all pass when the detector is run against the bkit-own ci.yml shape (which they implicitly do, since the test suite runs the detector against constructed shapes that mirror real consumer/bkit-own configurations).
  - **Scope:** verification only (no file edits — A3 already retained the step name).
  - **Depends on:** Task A3 (bkit's own ci.yml is at the post-rewrite shape).
  - **Done when:** `pnpm test -- bkit-postinstall.test.ts` exits 0 AND the test summary shows **all 11 `detectRunLevelsNotComposed`-keyed tests PASSED** (verify by running with `--reporter=verbose` and grepping the output for `detectRunLevelsNotComposed` — count of PASS lines must be at least `11`, count of FAIL lines must be exactly `0`); AND `grep -c '^[[:space:]]*- name: Detect Direct Push$' .github/workflows/ci.yml` returns at least `1` (the literal step name the detector matches on is present in bkit's own post-A3 ci.yml). A vacuous pass (zero matched tests) is NOT acceptable for this gate.

- [ ] **Task A3a (self-CI sequencing safeguard, CRITICAL #8):** Shell-logic preview of the bkit-decide + bkit-tests-check `run:` bodies in `.github/workflows/ci.yml`. This catches logic-shape regressions actionlint's default pass might miss (broken `case` arms, unterminated heredocs). Use **`actionlint -shellcheck=shellcheck`** (actionlint already extracts each `run:` body and invokes shellcheck on it — this IS the deterministic verification that every embedded shell body was syntax-checked + lint-checked). The method is pinned: actionlint with `-shellcheck` flag. No yq extraction, no tmp-file scripting, no "equivalent the implementer authors" escape hatch.
  - **Scope:** verification only.
  - **Precondition:** Task A3 complete (bkit's own `ci.yml` carries the `bkit-tests-check:` job and the `bkit-decide:` job) — otherwise the actionlint pass has nothing to validate.
  - **Done when:** `actionlint -shellcheck=shellcheck .github/workflows/ci.yml` exits 0 — this is a single deterministic command, no extraction logic, no version-dependent `yq` invocation. If `shellcheck` is not on PATH, install it (`brew install shellcheck` on macOS) before running this task; the gate does NOT silently degrade.

- [ ] **Task A4:** Local sanity (no commit yet): `pnpm lint:workflows` (actionlint) on both ci.yml files PLUS `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`; render-test the template via `pnpm test -- bkit-templates.content` to confirm `verbose-ci-env` block tests still pass against the PRE-extension test set (sanity that the rewrite did not break the existing verbose-ci-env structural tests; the EXTENDED test set covering the new 4-job shape runs after Task E1).
  - **Scope:** verification only.
  - **Done when:** `pnpm lint:workflows` exits 0 (all three workflow files clean); `pnpm test -- bkit-templates.content` exits 0 against the pre-extension test set (Task E1 extends it later).

- [ ] **Task A5 (snapshot regen, CRITICAL #3):** After Task A2 lands, the full-file template snapshot `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` (single `toMatchSnapshot()` at `bkit-templates.content.test.ts` line 61-63) is stale. Regenerate via `pnpm test -- bkit-templates.content -u` (Vitest's update-snapshot flag), THEN eyeball-review `git diff -- .bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` to confirm the new 4-job shape is INTENTIONAL — never rubber-stamp the regeneration. If the diff contains anything unexpected (orphan stubs not removed, missing `Detect Direct Push` compat alias, missing capstone), fix the template and re-run, do NOT accept the snapshot blindly.
  - **Scope:** `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap`.
  - **Done when:** `pnpm test -- bkit-templates.content` exits 0 (after `-u` regen and manual diff acceptance); `git diff --stat .bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` shows a non-zero diff (snapshot WAS regenerated, not skipped); a one-line human-acceptance note added to the commit message ("snapshot regenerated and reviewed: $TIMESTAMP").

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

- [ ] **Task B4:** `bash scripts/ci/bkit-protect-main.sh --dry-run` from repo root (the worktree root — `cd "$WORKTREE_PATH"` first; the script reads `.github/workflows/ci.yml` relative to PWD).
  - **Scope:** verification.
  - **Depends on:** **Task A3** (bkit's own `.github/workflows/ci.yml` carries the `bkit-tests-check:` job), **Task A1** + **Task A2** (template carries the scaffold — irrelevant to this dry-run since the script reads the engine ci.yml, but listed for sequencing clarity), and **Task B3** (`REQUIRED_JOB="bkit-tests-check"`). Out-of-order execution is detected by the explicit precondition below.
  - **Precondition (LOUD-fail guard against out-of-order execution):** Before running the dry-run, run `grep -c '^[[:space:]]*bkit-tests-check:[[:space:]]*$' .github/workflows/ci.yml` from the worktree root and assert it returns at least `1`. If it returns `0`, ABORT this task with the explicit message `BLOCKED: capstone job missing — Task A3 (bkit's own ci.yml carries bkit-tests-check) must complete before Task B4. Do NOT run bkit-protect-main.sh --dry-run; the pre-flight will fail confusingly. Re-run Task A3 first.` Do NOT proceed; this is the loud-failure path for the latent ordering trap flagged in scope-check-2.
  - **Done when:** the precondition grep returned `>= 1`; `bash scripts/ci/bkit-protect-main.sh --dry-run` exits 0; output contains `"contexts": ["bkit-tests-check"]`; the script's internal pre-flight grep against `.github/workflows/ci.yml` passes (echoes a success line, not the missing-job error).

- [ ] **Task B5:** Edit `.bkit/src/bkit-postinstall.ts` per Architecture § Layer 1 Postinstall (line 1622 path; line 1625 Quick-path string; line 1636 status-checks line). Do NOT regenerate `dist/` yet — batched in Phase F. Pin the exact replacement count by reading the file before editing: the three sites are (1) the `protectionScript` path constant at L1622, (2) the Quick-path string at L1625, (3) the status-checks list at L1636 — exactly three replacements, no fourth.
  - **Scope:** `.bkit/src/bkit-postinstall.ts`.
  - **Done when:** `grep -c "bkit-set-protection" .bkit/src/bkit-postinstall.ts` returns exactly `0`; `grep -c "bkit-protect-main" .bkit/src/bkit-postinstall.ts` returns exactly `3` (path constant L1622 + Quick-path string L1625 + dry-run example in Quick-path string L1625 — the Quick-path string contains the file name TWICE: `bkit ships scripts/ci/bkit-protect-main.sh — run bash scripts/ci/bkit-protect-main.sh --dry-run`); `grep -c "Require status checks: bkit-tests-check" .bkit/src/bkit-postinstall.ts` returns exactly `1`; word-boundary check `grep -cE '\bbkit-tests\b(?!-)' .bkit/src/bkit-postinstall.ts` (use `grep -P` if available) returns `0` (no bare `bkit-tests` remains without the `-check` suffix in the advisory strings).

### Phase C — Layer 2 ship + debug gates (depends on Phase A landing the capstone)

- [ ] **Task C1 (MCP-only, CRITICAL #2):** Edit `.bkit/workflows/bkit-ship.md` Step 2 step 6: replace the legacy `statusCheckRollup` "any failures" pattern (today's literal line: `gh pr view {PR_NUMBER} --json statusCheckRollup` followed by the "any check failed or rollup empty" Failure Path) with an MCP-based gate that extracts the `bkit-tests-check` entry and asserts `conclusion == "SUCCESS"`. Use `mcp__github__pull_request_read` (or the project's existing MCP getter for status checks) — DO NOT introduce a new `gh pr view --json statusCheckRollup --jq …` invocation. Treat `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE` / missing all as non-green (Failure Path).
  - **Scope:** `.bkit/workflows/bkit-ship.md` Step 2 step 6.
  - **Done when:** grep-anchored verification (line numbers are unstable, the grep is stable): `grep -c 'gh pr view {PR_NUMBER} --json statusCheckRollup' .bkit/workflows/bkit-ship.md` returns exactly `0` (the legacy invocation is REMOVED from this gate); AND `grep -c 'bkit-tests-check' .bkit/workflows/bkit-ship.md` returns at least `1` in Step 2 step 6 (verify by extracting the block between `## Step 2` and `## Step 3` headers and grepping inside); AND the replacement text contains a `mcp__github__pull_request_read` (or equivalent project MCP getter) literal in Step 2 step 6; AND explicit text rejects each of `SKIPPED` / `NEUTRAL` / `CANCELLED` / missing as non-green; AND `git diff .bkit/workflows/bkit-ship.md` shows ZERO new `gh ` / `gh api ` / `curl ` invocations in Step 2 step 6 (pre-existing legacy lines elsewhere in the file untouched are fine).

- [ ] **Task C2:** Edit `.bkit/workflows/bkit-ship.md` Step 12 (lines 885-897): replace the `select(.name | test("test"; "i"))` heuristic with MCP-based `bkit-tests-check` extraction (read workflow run for the squash-merge SHA via `mcp__github__list_workflow_runs` + `mcp__github__list_workflow_jobs`; find the job named `bkit-tests-check`; assert `conclusion == "success"`). Update gate-12 checkbox (line 952) wording to `Squash-merge CI run completed bkit-tests-check (not cancelled, not failed, not skipped)`. Verify ASCII operators (no Unicode `!=` `>=` `<=` — ASCII only).
  - **Scope:** same file.
  - **Done when:** `grep -c 'test("test"; "i")' .bkit/workflows/bkit-ship.md` returns exactly `0`; `grep -c 'bkit-tests-check' .bkit/workflows/bkit-ship.md` returns at least `3` (Step 6, Step 12 block, Gate 12 checkbox); ASCII-only sweep clean — `python3 -c "import sys; sys.exit(0 if all(c not in open('.bkit/workflows/bkit-ship.md').read() for c in chr(8800)+chr(8805)+chr(8804)) else 1)"` exits 0; `git diff .bkit/workflows/bkit-ship.md` Step 12 block shows ZERO new `gh ` / `gh api ` / `curl ` invocations introduced.

- [ ] **Task C3 (MCP-only, CRITICAL #2):** Edit `.bkit/workflows/bkit-debug.md` Step 3 (line 362): after `RUN_CONCLUSION` computation, add an MCP-based `TESTS_CHECK` fetch via `mcp__github__list_workflow_jobs` (or the project's equivalent MCP job-list getter) against the resolved `RUN_ID`; bind the `bkit-tests-check` job's `conclusion` to `TESTS_CHECK` (fallback `"missing"` if absent). DO NOT introduce `gh run view "$RUN_ID" --json jobs --jq …` (or any other new `gh` invocation). Tighten the conditional so any non-`"success"` for either `RUN_CONCLUSION` OR `TESTS_CHECK` triggers the context fetch. Verify ASCII operators.
  - **Scope:** `.bkit/workflows/bkit-debug.md`.
  - **Done when:** `grep -c "bkit-tests-check" .bkit/workflows/bkit-debug.md` returns at least `1` (in Step 3 lines 360-400); ASCII-only sweep clean; `git diff .bkit/workflows/bkit-debug.md` Step 3 block shows ZERO new `gh ` / `gh api ` / `curl ` invocations.

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

- [ ] **Task E2:** Extend `.bkit/src/bkit-postinstall.test.ts` with Quick-path + status-checks assertions per Tests § postinstall. **Create the NEW test file `.bkit/src/bkit-ship-workflow.test.ts`** (this file does NOT currently exist — verified: only `bkit-release-workflow.test.ts` is present; do NOT extend the release-workflow file as that would mismatch the filter and risk a false-green) covering the bug-class regression (CRITICAL #6): four explicit Vitest cases asserting `bkit-ship.md` + `bkit-debug.md` gate text rejects each of `SKIPPED` / `NEUTRAL` / `CANCELLED` / `"missing"` for `bkit-tests-check` conclusion.
  - **Scope:** `.bkit/src/bkit-postinstall.test.ts` (extend) + NEW `.bkit/src/bkit-ship-workflow.test.ts` (create).
  - **Done when:** `pnpm test -- bkit-postinstall` exits 0 with the three new assertions present BY NAME — `postinstall quick-path mentions bkit-protect-main.sh`, `postinstall quick-path mentions bkit-tests-check (word-boundary, not bkit-tests bare)`, `postinstall status-checks line mentions bkit-tests-check`; AND the file `.bkit/src/bkit-ship-workflow.test.ts` exists (`test -f .bkit/src/bkit-ship-workflow.test.ts` exits 0); AND `pnpm test -- bkit-ship-workflow.test.ts` exits 0 reporting **exactly 4 PASSED test cases** present BY NAME — `bkit-ship gate rejects SKIPPED`, `bkit-ship gate rejects NEUTRAL`, `bkit-ship gate rejects CANCELLED`, `bkit-ship gate rejects missing`. A run that reports zero tests matched (a vacuous-pass) MUST NOT satisfy this gate; verify by inspecting the Vitest summary line for `4 passed` (and that the file path is the resolved file — Vitest's `--reporter=verbose` may be used to confirm the case names).

- [ ] **Task E3:** Create `.bkit/src/bkit-protect-main.test.ts` (OR extend `bkit-postinstall.test.ts`) per Tests § protect-main: assert file existence, absence of old name, `REQUIRED_JOB` literal, pre-flight grep target.
  - **Scope:** new (or extended) test file.
  - **Done when:** `pnpm test -- bkit-protect-main` (or the host file) exits 0; assertions pass against the on-disk rename from Phase B.

- [ ] **Task E4:** Extend `.bkit/src/bkit-rules-sync.test.ts` with the "Green != ran != validated" substring assertion against both `.agents/rules.md` and `.bkit/templates/.agents/rules.md`.
  - **Scope:** `.bkit/src/bkit-rules-sync.test.ts`.
  - **Done when:** `pnpm test -- bkit-rules-sync` exits 0; both rules.md files match.

- [ ] **Task E5 (CRITICAL #5 — fixture marker-contract collision resolution):** Upgrade `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` to the 4-job shape (matching the template structure) while explicitly preserving (i) the `consumer-job:` block byte-identical to before, (ii) the bare `# bkit:start` / `# bkit:end` markers around the consumer-customised `Install Dependencies` block (REQUIRED by `bkit-modules.upgrade.integration.test.ts` L294-319 — both the marker-survival assertion AND the `detectTier2TextDrift` text-drift trigger on the `NODE_AUTH_TOKEN` env line). The fixture intentionally DIVERGES from the template's no-bare-marker shape — this is a documented contract, NOT a regression. Verify `.bkit/src/bkit-templates.test.ts` L146-150's no-bare-marker guard remains scoped to `.bkit/templates/**` (does NOT widen to scan `tests/fixtures/**`).
  - **Scope:** `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` + verification of `.bkit/src/bkit-templates.test.ts` guard scope.
  - **Done when:** `actionlint tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` exits 0; `grep -c '^      # bkit:start$' tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` returns exactly `1`; `grep -c '^      # bkit:end$' …ci.yml` returns exactly `1`; `consumer-job:` block byte-identical (verified via `git diff` showing only additions, no deletions of the consumer-job lines); `bkit-tests-check:` present; `grep -n 'tests/fixtures' .bkit/src/bkit-templates.test.ts` returns no matches in the no-bare-marker guard (lines 146-150 still scan only `readTemplate(...)`).

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

- [ ] **Task F1:** `pnpm build` (== `tsc`) to regenerate `dist/` after `.bkit/src/bkit-postinstall.ts` edit (Task B5).
  - **Scope:** `dist/`.
  - **Done when:** `pnpm check:dist` exits 0 (no diff between built and committed `dist/`); `grep -c "bkit-protect-main" dist/bkit-postinstall.js` returns exactly `3` (matches the source `.bkit/src/bkit-postinstall.ts` count from Task B5 — guarantees dist freshness wrt the rename).

- [ ] **Task F2 (CRITICAL #7 — resolved command name):** `pnpm bkit install` inside the worktree to regenerate `.claude/commands/*` and `.cursor/commands/*` mirrors from `.bkit/workflows/*.md` edits (Phase C). The repo's `package.json` defines `"bkit": "node dist/bkit-install.js"` (L41); `.bkit/src/bkit-install.ts` L973 distinguishes verbs by `verb === "check"` (dry-run) vs `install` (apply). No `--apply` flag exists — `install` is the apply verb. The dry-run / drift-detection counterpart is `pnpm bkit check`.
  - **Scope:** `.claude/commands/`, `.cursor/commands/`, `.claude/agents/`, `.cursor/agents/`.
  - **Done when:** `pnpm bkit install` exits 0 (writes any drifted mirrors); `pnpm bkit check` exits 0 immediately afterwards (zero drift remains between `.bkit/workflows/*.md` source and `.claude/commands/*` + `.cursor/commands/*` mirrors).

- [ ] **Task F3:** Final verification: `pnpm test` AND `pnpm typecheck` AND `pnpm lint:workflows` (actionlint) AND `pnpm bkit check` AND `bash scripts/ci/bkit-protect-main.sh --dry-run`.
  - **Scope:** verification only.
  - **Done when:** all five commands exit 0.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit's tests are pure Vitest. No Playwright. Backend pipeline logic mocked at HTTP boundary where applicable. The CI scaffold itself is validated via `actionlint` (static) + the `.bkit/src/bkit-templates.content.test.ts` content assertions (snapshot-style); behavioural validation of the capstone happens via the next CI run on the PR.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` has a corresponding task (E1-E6, A2b, A3a, A3b, A4, A5, B4, F1, F3).
- [ ] **Update existing tests:** Done via E1 (extended content tests, incl. plan-table-v1 schema + tier-outcome outputs + bare-marker guard scope assertion), E2 (postinstall Quick-path + bug-class bug-class regression cases), E4, E6.
- [ ] **Write new tests:** Done via E3 (new `bkit-protect-main.test.ts` or extension) AND new `bkit-ship-workflow.test.ts` for the four bug-class outcome cases.
- [ ] **Regenerate full-template snapshot:** Done via A5 (`pnpm test -- bkit-templates.content -u` + manual diff review).
- [ ] **Verify observability:** N/A — no new log channels (the `$GITHUB_STEP_SUMMARY` plan-table is observable but inherited from gether).
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
- [ ] **Step 4 (post-Phase F):** Run `/bkit-ship` end-to-end against this very PR ONCE the new capstone has reported at least once on the PR's full run (depends on Phase F push triggering CI). Confirm Gate 2 reads the capstone via MCP (not the legacy "any failures" rollup heuristic) and Step 12 squash-merge guard reads the capstone's conclusion on the merge SHA's CI run via MCP. If running the ship workflow before the capstone has reported, the gate correctly refuses to declare validated — this is expected behaviour, not a failure.

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

- 4-job CI scaffold seeded into the consumer template via near-verbatim COPY of gether's `.github/workflows/ci.yml` (per PRIMARY STEER 2026-06-02 — fidelity over abstraction); bkit's own ci.yml in degenerate 3-job form; `bkit-tests-check` is the sole required check.
- Template's `bkit-decide` ships canonical turbo affected-graph + jq schema validation + cancellation notice; `bkit-tests` declares `integration_outcome` + `e2e_outcome` job outputs; `bkit-tests-live` ships canonical (NOT a commented `bkit-stub:` block).
- Protection script renamed to `bkit-protect-main.sh`; `REQUIRED_JOB="bkit-tests-check"`.
- bkit-ship / bkit-debug gates simplified to read the capstone via MCP — no NEW `gh` CLI / raw-HTTP calls introduced anywhere in `.bkit/workflows/*.md`.
- Bug-class regression coverage: explicit Vitest cases reject `SKIPPED` / `NEUTRAL` / `CANCELLED` / missing for `bkit-tests-check` conclusion.
- `.agents/rules.md` carries the one-bullet norm.
- Full-file template snapshot regenerated and human-reviewed (`bkit-templates.content.test.ts.snap`).

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
