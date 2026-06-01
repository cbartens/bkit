Verdict: PASS

<!-- verdict:end -->

# 203 — CI Green != Validated: Backport gether #403 scaffold — PARENT INDEX (split into 2 sub-plans)

**Source plan (full pre-split):** [`./plan-v3-checked.md`](./plan-v3-checked.md)
**Split rationale:** [`./plan-complexity-check.md`](./plan-complexity-check.md)

> [!CAUTION]
> **CRITICAL:** This is the PARENT index. Sub-agents execute the child sub-plans, NOT this file.
>
> 1. Each sub-plan is self-contained — child agents can execute it without reading the sibling.
> 2. Sub-Plan 2 has a HARD DEPENDENCY on Sub-Plan 1 being committed first.
> 3. This index holds shared context (PRIMARY STEER, capstone shape, canonical reference paths, constraints) and the human-confirmation Acceptance Scenario + Breaking Changes tables that BOTH sub-plans link to.

---

## Sub-Plan Index

| Sub-plan       | Scope                                                                                                                            | Tasks                                                                              | Path                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Sub-Plan 1** | Phase A (CI scaffold) + Phase B (protection script + postinstall source)                                                         | A1, A2, A2b, A3, A3a, A3b, A4, A5, B1, B2, B3, B4, B5 (13 tasks)                   | [`./203-ci-green-validated-plan-1.md`](./203-ci-green-validated-plan-1.md) |
| **Sub-Plan 2** | Phase C (Layer-2 gates) + Phase D (Layer-3 rules) + Phase E (tests + fixture + docs) + Phase F (final batched mirror+dist regen) | C1, C2, C3, D1, D2, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, F1, F2, F3 (18 tasks) | [`./203-ci-green-validated-plan-2.md`](./203-ci-green-validated-plan-2.md) |

**Total tasks across children:** 13 + 18 = **31** (matches the count in [`plan-complexity-check.md`](./plan-complexity-check.md) line 9 — losslessness preserved).

---

## Cross-Child Dependency Order

```
┌──────────────────────────────────────────────────┐
│ Sub-Plan 1 (203-ci-green-validated-plan-1.md)                        │
│   Phase A → Phase B                              │
│   Output: ci.yml (×2) carry bkit-tests-check;    │
│           bkit-protect-main.sh exists;           │
│           bkit-postinstall.ts source patched     │
│           (dist NOT rebuilt yet)                 │
└──────────────────────────────────────────────────┘
                       │
                       │  Sub-Plan 1 MUST be committed (or
                       │  at minimum: ci.yml + protection-script
                       │  rename present + verifiable via the
                       │  precondition grep block in 203-ci-green-validated-plan-2.md)
                       │  BEFORE Sub-Plan 2 begins.
                       ▼
┌──────────────────────────────────────────────────┐
│ Sub-Plan 2 (203-ci-green-validated-plan-2.md)                        │
│   Phase C → Phase D → Phase E → Phase F          │
│   Phase F (mirror + dist regen) is STRICT FINAL  │
└──────────────────────────────────────────────────┘
```

**Why the dependency is hard, not soft:**

1. Sub-Plan 2 Task C1/C2/C3 text references `bkit-tests-check` by name. Without Sub-Plan 1 having put that job in both ci.yml files, the Layer-2 gate text dangles.
2. Sub-Plan 2 Task E2 creates `bkit-ship-workflow.test.ts` whose Vitest cases assert the gate text introduced in C1/C2/C3 — they can't be authored before the gates exist.
3. Sub-Plan 2 Task E3 asserts `scripts/ci/bkit-protect-main.sh` exists on disk (Sub-Plan 1 B1/B2 do the `git mv`).
4. Sub-Plan 2 Task F1 (`pnpm build` → `dist/`) requires Sub-Plan 1 B5 (`.bkit/src/bkit-postinstall.ts` edit) — otherwise dist freshness check would mask the rename.
5. Sub-Plan 2 Task F3 (`bkit-protect-main.sh --dry-run`) requires Sub-Plan 1 A3 (bkit-own ci.yml carries `bkit-tests-check`) — same loud-fail guard as Sub-Plan 1 Task B4.

---

## Shared Context (load-bearing — BOTH sub-plans honour these invariants)

> [!IMPORTANT]
> This block is the canonical SHARED CONTEXT. Each child sub-plan ALSO carries a copy under its own PRIMARY STEER heading so executors don't need to read this index — but if the two ever diverge, this index is authoritative.

### PRIMARY STEER (2026-06-02)

**Copy gether's `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` near-verbatim** into `.bkit/templates/.github/workflows/ci.yml`. Parameterize only consumer-specific VALUES:

- `{{DEFAULT_BRANCH}}` (replaces branch literal `main` where appropriate)
- Action SHAs left at gether's pinned versions (consumer can bump)
- Vercel preview URL placeholders (`https://{{PROJECT_SLUG}}.vercel.app`, etc.)
- Secret names left as `${{ secrets.X }}` references

Do **NOT** stub whole tiers. Reserve commented `bkit-stub:` blocks ONLY for genuinely-not-universal tiers (Supabase-migrate class). The bkit template's target archetype IS the gether stack (Next.js / Vercel / Supabase / turbo monorepo); fidelity beats abstraction.

### Canonical Reference Paths

- **Source ci.yml to copy:** `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml`
- **gether #403 design doc (rationale + 5-rule capstone derivation):** `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`
- **bkit template (target of the copy):** `.bkit/templates/.github/workflows/ci.yml`
- **bkit's own (degenerate dogfood target):** `.github/workflows/ci.yml`

### Capstone Shape (canonical — appears in BOTH ci.yml files post-Sub-Plan-1)

- **Job name:** `bkit-tests-check`.
- **`needs:`** `[bkit-decide, bkit-tests, bkit-tests-live]` in the template; `[bkit-decide, bkit-tests]` in bkit's own (no `bkit-tests-live`).
- **`if: ${{ !cancelled() }}`** (or `if: !cancelled()` literal form).
- **`timeout-minutes: 2`**; one step `Check Test Plan Followed` with `env:` block exposing `PLAN`, `DECIDE_RESULT`, `TESTS_RESULT`, `LIVE_RESULT`, `INTEGRATION_OUTCOME`, `E2E_OUTCOME`.
- **Tier outputs from `bkit-tests` (template only):** `outputs: { integration_outcome: ${{ steps.integration.outcome }}, e2e_outcome: ${{ steps.e2e.outcome }} }`. Step `id: integration` on Vitest Integration; step `id: e2e` on Playwright E2E.
- **5-rule script copied verbatim from gether ci.yml L1044-1101:**
  1. `DECIDE_RESULT == "success"`; else `FAIL=1`.
  2. If `plan.run_level != 'none'` AND `TESTS_RESULT != 'success'` → `FAIL=1`.
  3. If `plan.run_level != 'none'` AND `plan.web_affected == 'true'` AND `INTEGRATION_OUTCOME != 'success'` → `FAIL=1`.
  4. If `plan.run_level != 'none'` AND `plan.should_run_e2e == 'true'` AND `plan.web_affected == 'true'` AND `E2E_OUTCOME != 'success'` → `FAIL=1`.
  5. If `plan.live_should_run == 'true'` AND `LIVE_RESULT != 'success'` → `FAIL=1`.
  6. Final `if [ "$FAIL" = "1" ]; then ::error::bkit-tests-check FAILED…; exit 1; fi` + success line. No checkout, no install (target: <10s).

### Constraints (every task in every sub-plan)

- **ASCII operators only:** `!=` `>=` `<=`; never Unicode `≠ ≥ ≤`. Applies to `.bkit/workflows/*.md`, `.bkit/prompts/*.md`, `.agents/rules.md`, and any human-readable text.
- **Workflows are MCP-only for GitHub:** no NEW `gh api`, no NEW `gh` CLI, no NEW raw HTTP added in `.bkit/workflows/*.md` by this plan. Pre-existing legacy `gh` lines untouched by #203 are out-of-scope to migrate.
- **CI edits human-gated:** per `.agents/rules.md` L65 — every `.github/workflows/*` edit ALWAYS requires explicit human confirmation before commit. Sub-Plan 1 carries the CI edits; Sub-Plan 2 does not edit CI workflow files.
- **Batched regen:** `pnpm bkit install` runs ONCE at the very end (Sub-Plan 2 Task F2). Do NOT regenerate mirrors after every edit. Per user-memory note `feedback_bkit_install_batching`.
- **`dist/` regen is also batched:** Sub-Plan 1 patches `.bkit/src/bkit-postinstall.ts` source only; Sub-Plan 2 Task F1 runs `pnpm build`. `pnpm check:dist` will be RED at the end of Sub-Plan 1 — that is expected.

---

## Context & Goals

bkit's ship/debug gates and consumer-template CI conflate "the CI run concluded `success`" with "the change was validated by CI". A partial CI run is green-by-construction (E2E and live-deploy tiers are intentionally skipped), so `statusCheckRollup == success` carries zero validation signal. Gether #403 has now proven the structural fix in production: an always-on plan-producing job (`bkit-decide`) feeds a single capstone (`bkit-tests-check`) that asserts every tier the plan said should run actually ran+passed. This plan backports that 4-job scaffold into bkit (Layer 1), simplifies the ship/debug gates to read the capstone (Layer 2), and adds one rules norm covering the no-workflow path (Layer 3). The capstone becomes the sole branch-protection required check.

**Overall Success Criteria (aggregate; each sub-plan owns its slice — see each child for its sub-criteria):**

- `.bkit/templates/.github/workflows/ci.yml` ships the full 4-job scaffold (`bkit-decide` / `bkit-tests` / `bkit-tests-live` / `bkit-tests-check`) by copying gether's `ci.yml` near-verbatim and parameterizing values, NOT by stubbing whole tiers. [Sub-Plan 1]
- bkit's own `.github/workflows/ci.yml` carries the scaffold in degenerate form: `bkit-decide` + `bkit-tests` + `bkit-tests-check` (no `bkit-tests-live`). [Sub-Plan 1]
- `scripts/ci/bkit-set-protection.sh` is renamed to `scripts/ci/bkit-protect-main.sh`; `REQUIRED_JOB` flips to `bkit-tests-check`. [Sub-Plan 1]
- `.bkit/workflows/bkit-ship.md` Gates 2/3 and Step 12 plus `.bkit/workflows/bkit-debug.md` Step 3 assert `bkit-tests-check == success` on the PR's full run via MCP. [Sub-Plan 2]
- `.agents/rules.md` and `.bkit/templates/.agents/rules.md` Git/CI/Merges section gains the one-bullet norm "Green != ran != validated …". [Sub-Plan 2]
- `pnpm test` + `pnpm build` + `pnpm bkit check` + `actionlint` all green; `bash scripts/ci/bkit-protect-main.sh --dry-run` succeeds. [Sub-Plan 2]

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the WHOLE #203 feature. Both sub-plans link back to this section as their canonical Acceptance Scenario.

### Spec — what good looks like

- **Narrative:** 1–2 sentences, user POV.
- **Success Criteria:** ≤5 bullets, each measurable.
- **Edge Cases:** Plan-expanded.
- **Concrete Example:** Specific role + state + steps + outcome.
- **Derived Test Matrix:** One row per testable behaviour, mapped to its owning sub-plan.

**Design-missing fallback:** #203 has no `{FID}-design.md` (design phase skipped — the canonical reference is the proven gether #403 design at `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`). The Narrative + Success Criteria below are derived from the issue body and the #403 addendum's `bkit-tests-check` block, NOT fabricated.

### Narrative

As a bkit consumer or bkit maintainer, when CI reports a run green I can trust that the change was actually validated by CI: the capstone job `bkit-tests-check` asserts every tier the plan said should run did run and passed. When a partial run skips expensive tiers by design, the capstone reflects that — and the ship/debug agents refuse to call it "validated" until they see `bkit-tests-check == success` on the PR's full run.

### Success Criteria

1. `bkit-tests-check` exists in both bkit's own `ci.yml` and the `.bkit/templates/` consumer template, `needs:` every other CI job, runs `if: !cancelled()`, reads `fromJSON(needs.bkit-decide.outputs.plan)` plus each `needs.*.result` plus tier outcomes, asserts every expected tier ran+passed, and `exit 1`s on mismatch.
2. `bkit-tests-check` is the SOLE required status check named in `bkit-protect-main.sh` (renamed from `bkit-set-protection.sh`); the script's pre-flight greps `.github/workflows/ci.yml` for `bkit-tests-check`.
3. `bkit-ship.md` Gate 2/3 + Step 12 and `bkit-debug.md` Step 3 assert `bkit-tests-check == success` (and treat skipped/neutral/cancelled/missing as non-green) instead of inspecting `statusCheckRollup` for "any failures" or trusting `RUN_CONCLUSION == success`.
4. `.agents/rules.md` Git/CI/Merges section carries the bullet "Green != ran != validated — classify the CI run type before reporting any verdict; NEVER report validated/done off a partial CI run."
5. `pnpm test` + `pnpm build` + `pnpm bkit check` + `actionlint` all green; existing test fixtures (`tests/fixtures/heavy-customised-ci`) updated to the 4-job shape; new test asserts the protection script pre-flight names `bkit-tests-check`; `docs/pending.md` quick-path entry updated to the new script name + required job.

### Concrete Example

**Setup:** A consumer has run `pnpm bkit install` after upgrading to this release. Their `.github/workflows/ci.yml` carries the seeded 4-job scaffold (Tier-3 seed-or-print — bkit never rewrites after first seed). The consumer has run `bash scripts/ci/bkit-protect-main.sh --dry-run` and seen the policy preview, then flipped branch protection on `main` to require `bkit-tests-check` once the new job has reported green at least once.

**Steps:**

1. Consumer pushes a docs-only commit `feat: tweak README` to a feature branch and opens a PR → CI runs.
2. `bkit-decide` reads markers (none), computes `run_level=light` (PR event, no force-build marker), emits plan JSON to `$GITHUB_OUTPUT` + plan table to `$GITHUB_STEP_SUMMARY`.
3. `bkit-tests` runs (the canonical static+unit gates remain); `bkit-tests-live` is skipped (consumer hasn't enabled the live-deploy `bkit-stub:` block, and `live_should_run=false` for docs-only).
4. `bkit-tests-check` runs (`if: !cancelled()`, `needs:` all): reads the plan, confirms `bkit-tests` succeeded as expected and `bkit-tests-live` was correctly skipped (plan said `live_should_run=false`), exits 0 — green.
5. Consumer's `/bkit-ship` Gate 2 reads `bkit-tests-check` on the PR; it is `success` on a full run; ship proceeds.
6. Consumer's `/bkit-ship` Step 12 (post-merge) asserts `bkit-tests-check == success` on the squash-merge run; merge is validated; issue closes.

**Outcome:** Every "validated" verdict the agent emits is backed by a capstone that read the plan and asserted reality matched. A partial run can no longer be misread as validation — the capstone's `exit 1` would have fired if any expected tier was skipped.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer pushes `[skip ci]` on commit message | Workflow does not run; `bkit-tests-check` does not report; ship gates see "missing" and treat as non-green (refuse to declare validated). |
| Concurrency cancel (push + PR collapse) | `bkit-tests-check` reports `cancelled`; ship gates treat cancelled as non-green. |
| `bkit-decide` itself fails | `bkit-tests` / `bkit-tests-live` skipped; `bkit-tests-check` runs (`if: !cancelled()`), reads `needs.bkit-decide.result == 'failure'`, exits 1 — red. |
| Direct push to `dev` with no merged PR behind SHA (bkit's own repo) | `bkit-decide` auto-escalates via commits/{sha}/pulls → `run_level=full`; full tests run; capstone asserts; agent that reads the capstone treats `dev` push as validation. |
| `commits/{sha}/pulls` API errors (403/429/5xx) | Run-to-be-safe: `bkit-decide` defaults to `run_level=full`; plan JSON carries `depth_source=fallback-on-api-error` for visibility; capstone behaves as for any full run. |
| Renamed protection script invoked with old name (`bkit-set-protection.sh`) | File does not exist (renamed via `git mv`); shell returns non-zero ENOENT; postinstall advisory points at the new name. Existing consumer installs keep their copy (Tier-3 seed-or-print). |
| Heavy-customised-ci fixture install (Tier-2 markers) | The fixture retains its bare `# bkit:start` / `# bkit:end` markers around the consumer-customised `Install Dependencies` block (required by `bkit-modules.upgrade.integration.test.ts` L294-319). The template's no-bare-marker guard stays scoped to `.bkit/templates/**`. Task E5 explicitly preserves the fixture's bare markers. |
| Ship/debug gate sees `bkit-tests-check` with conclusion `cancelled` / `skipped` / `neutral` / missing | All four MUST be treated as non-green (refuse to declare validated). Layer-2 task C1/C3 wiring tested explicitly per Task E2 (4 Vitest scenarios per outcome value). |
| `bkit-decide` job rename collides with `detectRunLevelsNotComposed` (`.bkit/src/bkit-postinstall.ts` L713) | Detector keys off literal step name `"Detect Direct Push"`. The new `bkit-decide` job retains a step `name: Detect Direct Push`. Task A2b + A3b enforce this. |
| Mirror drift after edits to `.bkit/workflows/*.md` | Mirrors regenerated as final task via `pnpm bkit install` (Sub-Plan 2 F2); CI's `bkit check` step fails-loud if drift remains. |

### Derived Test Matrix (with sub-plan ownership)

> Each row → one task in one sub-plan.

<!-- prettier-ignore -->
| Test description | Type | Target file | Owning sub-plan / task |
| --- | --- | --- | --- |
| `.bkit/templates/.github/workflows/ci.yml` contains exactly one job each named `bkit-decide`, `bkit-tests`, `bkit-tests-live`, `bkit-tests-check`; preserves `# bkit:start verbose-ci-env` named block at 4-space indent | Unit (Vitest) | `.bkit/src/bkit-templates.content.test.ts` (extend) | SP2 / E1 |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests-check` has `if: ${{ !cancelled() }}`, `needs:` lists the other 3 jobs, asserts each expected tier ran+passed (greps the 5-rule capstone literals) | Unit (Vitest) | same | SP2 / E1 |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-decide` carries the `Assemble and emit plan JSON` jq-schema-validation loop (asserts all 7 literal field names present) | Unit (Vitest) | same | SP2 / E1 |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-decide` writes `plan-table-v1` summary AND a `cancellation notice` step (`if: cancelled()`) | Unit (Vitest) | same | SP2 / E1 |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests` declares `outputs: integration_outcome:` and `outputs: e2e_outcome:`; step IDs `id: integration` + `id: e2e` | Unit (Vitest) | same | SP2 / E1 |
| `.bkit/templates/.github/workflows/ci.yml` `bkit-tests-live` is a CANONICAL job body with `Run Live Tests` step calling `test:live` | Unit (Vitest) | same | SP2 / E1 |
| `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` regenerated to match new 4-job template; diff human-reviewed | Snapshot regen + manual diff | snapshot file | SP1 / A5 |
| `bkit-decide` (TEMPLATE) carries `name: Detect Direct Push` so `detectRunLevelsNotComposed` preflight still fires its advisory | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` | SP1 / A2b |
| `bkit-decide` (BKIT-OWN) carries `name: Detect Direct Push` so detector still passes against bkit-self | Unit (Vitest) | same | SP1 / A3b |
| bkit's own `.github/workflows/ci.yml` has degenerate 3-job shape (no `bkit-tests-live`); SHA-cache + `[skip ci]` preserved; actionlint clean | Static (actionlint) | `.github/workflows/ci.yml` | SP1 / A3 + A3a + A4 |
| `scripts/ci/bkit-protect-main.sh` exists, the old name does not, `REQUIRED_JOB="bkit-tests-check"`, pre-flight greps `ci.yml` for `bkit-tests-check` | Unit (Vitest) | new `.bkit/src/bkit-protect-main.test.ts` OR extend `bkit-postinstall.test.ts` | SP2 / E3 (file edits in SP1 / B1–B3) |
| `bkit-postinstall.ts` Quick-path advisory mentions `bkit-protect-main.sh` + `bkit-tests-check`; "Require status checks" line says `bkit-tests-check` (word-boundary regex isolates from prefix-collision) | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` | SP2 / E2 (source edit in SP1 / B5) |
| `.bkit/workflows/bkit-ship.md` Gate 2 + Step 12 + Gate 3 read `bkit-tests-check == SUCCESS` on PR's full run via MCP; treats SKIPPED/NEUTRAL/CANCELLED/missing as non-green; ASCII operators only | Static (grep/snapshot) | NEW `.bkit/src/bkit-ship-workflow.test.ts` | SP2 / E2 |
| Bug-class regression: ship/debug Layer-2 gate explicitly rejects each of `cancelled` / `skipped` / `neutral` / `missing` (4 separate Vitest cases — closes the #203 root-cause class) | Unit (Vitest) | NEW `.bkit/src/bkit-ship-workflow.test.ts` | SP2 / E2 |
| `.bkit/workflows/bkit-debug.md` Step 3 inspects `bkit-tests-check` conclusion via MCP equivalent (no new `gh run view` / `gh api` calls in Step 3 diff) | Static (grep) | extend same test file | SP2 / E2 |
| `.agents/rules.md` + `.bkit/templates/.agents/rules.md` Git/CI/Merges contain the "Green != ran != validated" bullet | Static (grep) | extend `bkit-rules-sync.test.ts` | SP2 / E4 (text edits in D1 + D2) |
| `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` upgraded to 4-job shape PRESERVING bare markers; `consumer-job:` block byte-identical | Integration (Vitest) | fixture + `bkit-modules.upgrade.integration.test.ts` | SP2 / E5 + E6 |
| Template's no-bare-marker guard remains scoped to `.bkit/templates/**` (does NOT regress against fixture's bare markers) | Unit (Vitest) | `.bkit/src/bkit-templates.test.ts` (assert scope unchanged) | SP2 / E1 (assertion) + E5 (verification) |
| `docs/pending.md` Quick path entry says `bkit-protect-main.sh` + `bkit-tests-check` | Static (grep) | `docs/pending.md` | SP2 / E7 |
| `dist/` regenerated after `bkit-postinstall.ts` edit (`pnpm check:dist` green); `dist/bkit-postinstall.js` contains the new `bkit-protect-main.sh` literal | Build + grep | `pnpm check:dist`; `grep -c "bkit-protect-main" dist/bkit-postinstall.js` | SP2 / F1 |
| `.claude/commands/*` + `.cursor/commands/*` mirrors match `.bkit/workflows/*.md` after edits | Integration (Vitest) | `pnpm bkit check` | SP2 / F2 |
| bkit's OWN `.github/workflows/ci.yml` shell-logic preview: `actionlint -shellcheck=shellcheck` exits 0 (catches `case`-arm / heredoc regressions actionlint default misses) | Static (shell-preview) | `actionlint -shellcheck=shellcheck` | SP1 / A3a |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 (in either sub-plan) until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

| Change                                                                                                                                                           | Type            | Notes                                                                                                                                           | Owning sub-plan                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| New job names in shipped `ci.yml`: `bkit-decide`, `bkit-tests-live`, `bkit-tests-check` (alongside existing `bkit-tests`)                                        | New             | Capstone is `bkit-tests-check` (NOT `bkit-gate` — settled per #203 comment 2).                                                                  | Sub-Plan 1                                                |
| `scripts/ci/bkit-set-protection.sh` -> `scripts/ci/bkit-protect-main.sh` (`git mv` rename of both engine + template copy)                                        | Breaking        | Tier-3 seed-or-print: existing consumers keep their copy; postinstall advisory + CHANGELOG flag the rename.                                     | Sub-Plan 1 (rename) + Sub-Plan 2 (CHANGELOG / docs)       |
| `REQUIRED_JOB` constant: `"bkit-tests"` -> `"bkit-tests-check"` inside `bkit-protect-main.sh`                                                                    | Breaking        | Branch-protection consumers MUST re-apply the script (or hand-flip the required check).                                                         | Sub-Plan 1                                                |
| Postinstall advisory "Quick path" text + the "Require status checks: bkit-tests" line                                                                            | Behavioural     | Both updated to reference `bkit-protect-main.sh` and `bkit-tests-check`.                                                                        | Sub-Plan 1 (source edit) + Sub-Plan 2 (dist regen + test) |
| Branch protection on bkit's own `main` (operator step — out-of-tree)                                                                                             | Operator action | Not executed by this build; quick-path entry in `docs/pending.md` deferred. Sub-Plan 2 E7 updates the entry's referenced script + required job. | Sub-Plan 2 / E7                                           |
| `.bkit/workflows/bkit-ship.md` Step 12 squash-merge guard: now keys off `bkit-tests-check` capstone conclusion instead of "any job whose name matches `/test/i`" | Behavioural     | A consumer whose ci.yml does not yet ship the capstone will see ship Step 12 refuse to declare validated — that is correct.                     | Sub-Plan 2 / C2                                           |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 (in either sub-plan) until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

- **Rejected:** original #203 body's "`bkit-gate`" capstone name. Settled in favour of `bkit-tests-check` (per comment 2 — the capstone sits in the `bkit-tests*` family).
- **Accepted (per 2026-06-02 PRIMARY STEER):** high-fidelity copy of gether #403's live ci.yml into `.bkit/templates/.github/workflows/ci.yml` — fidelity over abstraction. Supersedes the prior "Rejected: copy gether verbatim — generalize the SHAPE" framing.
- **Rejected:** "demote `bkit-decide` to plan producer only and keep `bkit-tests` as the required check". Misses the structural fix.
- **Rejected:** "ship the protection-script rename + ci.yml shape together as one task". Sequencing matters — script's pre-flight greps the ci.yml for `bkit-tests-check`; ci.yml change MUST land first. The cross-sub-plan dependency above enforces this.
- **Deferred:** an executable parity-matrix from gether #403 §C6 (no turbo affected-graph in bkit's own repo).
- **Future:** drop the `bkit-tests` job name from the engine's protection-script-name back-compat once Renovate/consumer migration lag is acceptable.

## Out of Scope

- The two plumbing defects from #209 (status.jsonl conflicts and `[skip ci]` HEAD-tip guard) — explicitly excluded.
- Live execution of `bash scripts/ci/bkit-protect-main.sh` against `cbartens/bkit` (deferred per docs/pending.md — 403 on non-Pro).
- Turbo affected-graph integration in **bkit's OWN** ci.yml (single-package).
- An executable parity-matrix script for **bkit's own** ci.yml.
- Renovate / external-caller alias drops (gether D14 / WS-4).
- E2E / Vercel-await / Playwright tier in **bkit's OWN** ci.yml (no deploy).
- Migrating PRE-EXISTING `gh` CLI calls in `.bkit/workflows/bkit-ship.md` / `bkit-debug.md` to MCP (MCP-only constraint is honoured for NEW edits only).

## Merge Method

**Merge method: always squash.** Both sub-plans land via `gh pr merge --squash --delete-branch --body ""` (bkit-ship.md Step 5 hardcoded). Likely as two separate commits on one PR (Sub-Plan 1 commit → Sub-Plan 2 commit), but the squash-merge collapses them.

## Supersession Inventory (aggregate; each sub-plan owns its rows)

| Existing artifact                                                              | Replaced by                                                                   | Decision              | Owning sub-plan                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------- | -------------------------------------------- |
| `scripts/ci/bkit-set-protection.sh`                                            | `scripts/ci/bkit-protect-main.sh`                                             | DELETE (via `git mv`) | Sub-Plan 1                                   |
| `.bkit/templates/scripts/ci/bkit-set-protection.sh`                            | `.bkit/templates/scripts/ci/bkit-protect-main.sh`                             | DELETE (via `git mv`) | Sub-Plan 1                                   |
| `bkit-postinstall.ts` Quick-path advisory text                                 | New Quick-path text referencing `bkit-protect-main.sh` and `bkit-tests-check` | DELETE                | Sub-Plan 1 (source); Sub-Plan 2 (dist regen) |
| `bkit-postinstall.ts` "Require status checks: bkit-tests" line                 | "Require status checks: bkit-tests-check"                                     | DELETE                | Sub-Plan 1 (source); Sub-Plan 2 (dist regen) |
| `bkit-ship.md` Step 12 squash-merge "any job whose name matches /test/i" block | Read `bkit-tests-check` conclusion explicitly                                 | DELETE                | Sub-Plan 2 / C2                              |
| `bkit-ship.md` Gate 2 "any failures" rollup interpretation                     | "assert `bkit-tests-check == success`" interpretation                         | DELETE                | Sub-Plan 2 / C1                              |
| `bkit-debug.md` Step 3 `RUN_CONCLUSION == success` blind read                  | Read `bkit-tests-check` conclusion explicitly                                 | DELETE                | Sub-Plan 2 / C3                              |
| `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` single-job shape | 4-job shape matching the new template                                         | DELETE                | Sub-Plan 2 / E5                              |

## Security & Privacy

- [x] **CI workflow edits** — human-gated per `.agents/rules.md` L65. The two ci.yml changes (bkit's own + the template) are Sub-Plan 1 Phase A tasks and require explicit human sign-off before commit.

_No new API routes, no DB writes, no secrets, no user input._

---

## Agent Execution Runbook

> See child sub-plans:
>
> - [`./203-ci-green-validated-plan-1.md`](./203-ci-green-validated-plan-1.md) — Phases A + B (Sub-Plan 1)
> - [`./203-ci-green-validated-plan-2.md`](./203-ci-green-validated-plan-2.md) — Phases C + D + E + F (Sub-Plan 2)

The runbook has been split lossless across the two sub-plans. Each task (A1–A5, A2b, A3a, A3b, B1–B5, C1–C3, D1–D2, E1–E10, F1–F3 — 31 in total) appears in exactly one sub-plan with its `Scope` and `Done when` lines verbatim from `plan-v3-checked.md`.

### Gates (cross-sub-plan)

| Gate                                                     | Location                                                                                                                                                                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gate 1 — Prerequisites Check** (×2 — one per sub-plan) | [Sub-Plan 1](./203-ci-green-validated-plan-1.md#-gate-1-prerequisites-check) + [Sub-Plan 2](./203-ci-green-validated-plan-2.md#-gate-1-prerequisites-check)                                                      |
| **Gate 2 — Code Implementation Check**                   | Owned per sub-plan ([SP1](./203-ci-green-validated-plan-1.md#-gate-2-code-implementation-check-sub-plan-1-scope) + [SP2](./203-ci-green-validated-plan-2.md#-gate-2-code-implementation-check-sub-plan-2-scope)) |
| **Gate 3 — Testing & Documentation Check**               | [Sub-Plan 2](./203-ci-green-validated-plan-2.md#-gate-3-testing--documentation-check-sub-plan-2-scope)                                                                                                           |
| **Gate 4 — Automated Verification Confirmed**            | [Sub-Plan 2](./203-ci-green-validated-plan-2.md#-gate-4-automated-verification-confirmed)                                                                                                                        |
