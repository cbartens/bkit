Verdict: PASS

<!-- verdict:end -->

# Design: Real-World (Non-Mock) Testing Gates for Plan / Build / Debug

## Acceptance Scenario

### Narrative

As a maintainer running bkit's plan/build/debug workflows, when my feature touches a real
integration boundary I want the workflow to insist a non-mock test exists, fail before my fix and
pass after it, so a runtime-only defect cannot ship green behind mocked tests. When my repo has no
runnable real stack, I want the gate to step aside loudly and on the record rather than block me or
pretend the green result proves the feature works.

### Success Criteria

- A plan whose tasks cross an external boundary (DB / API / model / network / migration) is flagged
  at plan-review time if it lacks a paired non-mock test task with a ground-truth `Done when`.
- When a `test:real` script is declared, build will not raise a PR and debug will not close green
  unless `test:real` passes; in debug it must be observed to fail before the fix and pass after.
- When no `test:real` is declared (or `[real-stack=off]`), all three gates degrade to CONCERNS, the
  workflow still completes, and the skip is recorded in status.json and stated in the close comment.
- Soak mode is selectable for unknown-cause non-functional bugs, running one accumulating-context
  agent that loops against `test:real` until green, bounded by the existing attempt cap.
- No new magic-number constant, no new config file type, and no Unicode comparison operators are
  introduced; all consumer-facing advisory text is free of internal KN-/BAR- refs.

### Key Edge Cases

- **Vacuous pass:** a `test:real` that exits 0 without reaching the stack (creds absent) is caught
  because the reproduce-first gate records `repro: pass` (it never failed), so empirical-verify's
  required fail-then-pass transition is absent.
- **Real stack reached but verification fails:** the one case that does NOT degrade — it is a hard
  FAIL routed into the existing retry loop, because it is exactly the defect class #143 targets.
- **Credentials missing in CI:** capability resolution only checks script EXISTENCE (it does not
  run the script), so a declared `test:real` with absent creds resolves `live`. The creds failure
  surfaces at reproduce/run time as a non-zero exit classified `reproKind: infra` → CONCERNS with
  reason `real-stack-infra-failure`, NOT a hard FAIL and NOT a misleading functional `repro: fail`.
  The diagnose agent is told to treat `reproKind: infra` as an environment problem, never as the
  feature being broken. (Where the script is absent entirely, capability resolves `absent` → CONCERNS.)
- **Soak requested without a real stack:** at Step 2 capability resolution the workflow
  **downgrades `OBSERVE_MODE` from `soak` to `off`** (persisting `soakDowngradeReason:
real-stack-unavailable`) and records CONCERNS, so the standard `OBSERVE_MODE = off`
  diagnose→remediate path runs correctly — never a mock-only soak. The downgrade is surfaced in the
  always-written summary artifact (§G), not only a tracker comment.
- **Mislabeled mock suite as `test:real`:** an inherent limit of consumer-agnostic enforcement —
  bkit cannot know which deps are external; stated as an accepted residual risk, not silently
  assumed away.
- **Resume mid-run:** `realStack` is resolved once and persisted, so a resumed workflow reads the
  same capability state and OBSERVE_MODE (now including `soak`) it had at interruption.

## Architecture

### The single invariant being installed

All three #143 bugs were runtime-only and shipped green because every test was mocked. The
root cause is one missing invariant, not a missing subsystem:

> **A test that exercises the real integration boundary must exist, must FAIL before a fix,
> and must PASS after it — and when that test cannot be run, the green result must be loud,
> auditable, and never silently equated with "works."**

The design installs this invariant across plan (mandate the test exists), build (the test
exists and passes before a PR is raised), and debug (the test fails-then-passes around a fix,
with a soak loop for iterative bug chains). It does so by **reusing existing bkit machinery**
— the `jq -e .scripts[...]` script-discovery pattern, the OBSERVE_MODE axis, the
diagnose→remediate→run-tests retry loop, the `debug-fetch`-grep-from-doc pattern, and
status.json per-step verdicts — adding the minimum new surface.

### Resolving the consumer-agnostic crux

bkit ships to consumer repos that may have no runnable real stack, or where hitting real deps
(LLMs, DBs) costs money or needs CI-absent credentials. A gate that hard-requires a real stack
is unsatisfiable on those repos, gets ripped out, and takes the good parts with it. The design
resolves this with a **declared-capability + graceful-downgrade + loud-audit** model:

1. **"Real stack" is a declared, optional capability** — a consumer-owned `test:real` script
   discovered exactly the way **debug** Step 6 already discovers `test:integration` / `test:e2e`
   and the way **build** Step 13 already discovers `test` (`jq -e ".scripts[\"$s\"]"` for
   single-package, turbo task for monorepos). NOTE on tier ordering: debug Step 6 runs the full
   `lint typecheck test test:integration test:e2e` sequence, but build Step 13 currently runs only
   `lint typecheck test` (integration/e2e are debug-only; build is pre-PR "lint/typecheck/unit
   only — NO integration / E2E"). The discovery mechanism is identical on both; the tier sequence
   `test:real` appends to differs (see Components/Flows §C). Documented in one
   canonical home: a new `Real` row in the `docs/testing.md` Tiers table plus a short managed
   subsection inside the existing `<!-- bkit:start -->` block.
2. **The escape hatch is a single declared key, never a hard block.** `bkit:real-stack` resolves
   to one of three capability states — `live` (a `test:real` script exists and runs),
   `absent` (no script declared), or `off` (explicitly opted out via a `[real-stack=off]`
   input flag). `absent`/`off` make the gates **degrade to CONCERNS, never hard-FAIL**, so the
   workflow continues and is auditable rather than blocked. A hard FAIL only fires in the one
   case we are actually trying to catch: the real stack was reached and the empirical
   verification failed.
3. **Every skip is loud and state-recorded.** The capability state and per-run verdicts are
   written to status.json, AND the always-written summary artifact / PR body states, in
   consumer-neutral language, "real-stack verification skipped — runtime-only defects not gated."
   The audit lands on an always-written surface (summary artifact), not only a tracker comment —
   no-tracker repos (including bkit itself) post no comment, so a comment-only audit would fail
   silently (§G). A silent skip would recreate the exact #143 failure, so silence is prohibited.

### The two divergent options, resolved

**Option 1 — Real-stack definition: declared `test:real` script (CHOSEN) vs new config file.**
Brainstorm 2 proposed a structured `bkit-real-stack.md` contract file (tiers, credentials, cost
signals); brainstorms 1 and 3 proposed reusing the existing script-discovery seam. We choose the
**declared `test:real` script**, because it rides the exact mechanism build/debug already use for
`test:integration`/`test:e2e` — zero new file type, zero new parser, zero new drift surface, and
"anyone who understands the current `test:integration` discovery understands this." The structured
config file's only material advantage — distinguishing "verified against real stack" from "script
ran, stack absent, exited 0 vacuously" — is preserved without the file by layering on brainstorm
2's strongest mitigation: the **fail-then-pass transition is recorded in status.json**. A
`test:real` that exits 0 vacuously cannot produce a recorded `repro: fail` before the fix, so the
empirical-verify gate detects the vacuous-pass case from state, not from a config declaration.
Credential/cost preconditions are handled by the script itself: capability resolution checks only
that the script EXISTS (resolves `live`), and a creds-absent script then exits non-zero at
reproduce/run time where it is classified `reproKind: infra` → CONCERNS with reason
`real-stack-infra-failure`, NOT a functional FAIL and NOT a misleading `repro: fail` the diagnose
agent could anchor on (§B / C6). Where the script is absent entirely, capability resolves `absent`
→ CONCERNS. Neither path hard-FAILs — only a real-boundary functional failure does.

**Option 2 — Soak: fourth OBSERVE_MODE value (CHOSEN) vs reuse the existing retry loop
unchanged.** Brainstorm 1 and 2 proposed `soak` as a fourth OBSERVE_MODE value; brainstorm 3
argued the existing diagnose→remediate→run-tests loop already provides fail→pass machinery and a
parallel mode adds a magic-number cap, a prompt, and dual-mode drift. We choose **`soak` as a
fourth OBSERVE_MODE value**, because the issue calls the iterative single-agent loop "decisively
yes" for unknown-cause/non-functional bugs and explicitly contrasts it with the structured
diagnose→remediate handoff ("instead of the diagnose→remediate handoff. Keep the structured
handoff for known-shape, localized fixes"). The structured loop and the soak loop are genuinely
different tools: the structured loop hands off discrete diagnose/remediate artifacts and escalates
STANDARD→PIVOT→FINAL→instrument; soak keeps one accumulating context that re-runs `test:real`
after each fix. Collapsing soak into "just re-run the loop" (brainstorm 3's fallback) would lose
the accumulating-context property that the issue identifies as the thing that actually cracked the
bugs. We adopt brainstorm 3's risk mitigation in full to neutralise its objections: **soak reuses
the existing `MAX_DEBUG_ATTEMPT` / `MAX_TEST_ATTEMPT` constants — no new magic number is minted**,
and the OBSERVE-vs-SOAK decision boundary is documented in one canonical sentence in
`.agents/workflows.md` so it cannot silently drift.

### Capability resolution (where it lives)

Capability is resolved **once per debug/build run** in Worktree Setup and persisted to
status.json, so every downstream gate reads the same value rather than re-probing. This adopts the
clean conceptual core of brainstorm 1's Approach C (single source of truth) **without** its heavy
cross-workflow gate engine — the resolver is ~15 lines of shell, not a new subsystem. Resolution
order:

```
# REAL_STACK in {live, absent, off}
# [real-stack=off] read from debug-input / build-input session text
if [real-stack=off] present:        REAL_STACK=off
elif test:real declared (turbo task or jq -e .scripts["test:real"]):  REAL_STACK=live
else:                               REAL_STACK=absent
```

Persisted as `realStack` on the `worktree-setup` step entry, alongside the existing `observeMode`
field.

### Component boundaries and integration points

- **`docs/testing.md`** (consumer-facing managed block + Tiers table) — the canonical definition
  of the `test:real` convention. Single seam a consumer fills in to upgrade from "no stack" to
  "real stack."
- **`.agents/workflows/bkit-debug.md`** — capability resolution in Worktree Setup; reproduce-first
  gate (Step 4 area); empirical-verify in run-tests (Step 6); `soak` as a fourth OBSERVE_MODE value
  with its own step block; escape-hatch audit in Close Workflow.
- **`.agents/workflows/bkit-build.md`** — capability resolution in Worktree Setup; `test:real`
  added to the run-tests sequence (Step 13) run **last** (build's Step 13 tier is `lint typecheck
test` only — no integration/e2e — so `test:real` appends right after `test`); e2e-smoke gate
  folded into run-tests verdict; escape-hatch audit in Close Workflow (Step 18).
- **`.agents/workflows.md`** (canonical catalog + § notes) — the run-tests commands are MIRRORED
  here and MUST be updated in lockstep with the step edits (see §H): the debug Step 6 catalog row
  (`test test:integration test:e2e`, line ~646), the build Step 13 catalog row (`lint typecheck
test`, line ~621), and the § "Turbo command (verbatim)" / "Pre-PR vs debug" note (line ~975:
  "debug normal-mode adds `test:integration test:e2e`"). Also carries the OBSERVE-vs-SOAK boundary
  sentence and the Step-1 mode-detection / catalog mode text (line ~634, ~641-652). Omitting any of
  these drifts the canonical reference — the "two docs, same topic = bug" trap from `docs.md`.
- **`.agents/workflows/bkit-plan.md`** — non-mock mandate as a `@bkit-plan-generate` instruction +
  a new lens in `@bkit-plan-review-3`, scoped to boundary-crossing tasks only.
- **Prompts** — `bkit-debug-failure-diagnose.md` (reproduce-first pre-condition),
  `bkit-debug-failure-remediate.md` (empirical-verify in its local-test gate), new
  `bkit-debug-soak.md`, `bkit-plan-generate.md` and `bkit-plan-review-3.md` (mandate + lens).
- **status.json** — `realStack` capability field on worktree-setup; `repro` / `realStackVerdict`
  fields on the relevant step entries; new `debug-reproduce` and `debug-soak` step kinds.

## Data Model

This is a markdown-workflow toolkit; the "schema" is the status.json shape and the consumer-facing
`docs/testing.md` convention. No application schema changes.

### status.json additions

All additions are optional fields layered onto existing step entries — no breaking change to the
existing reader. `realStack` cross-field invariant: `realStackVerdict` is only meaningful when
`realStack == "live"`.

<!-- prettier-ignore -->
| Field | On step | Values | Meaning |
| --- | --- | --- | --- |
| `realStack` | `debug-worktree-setup`, `build-worktree-setup` | `live` \ | `absent` \ | `off` | Capability resolved once per run, reused by all downstream gates |
| `repro` | `debug-reproduce` (new), and on `debug-run-tests` / `build-run-tests` | `fail` \ | `pass` \ | `skip` | The fail-then-pass transition; `skip` when `realStack != live` |
| `reproKind` | `debug-reproduce` (new) | `functional` \ | `infra` \ | `none` | Distinguishes a confirmed functional repro from an infra/credential failure (C6); `none` when `repro != fail`. Set by the §B classifier so the diagnose agent never anchors on an infra failure as ground truth. |
| `realStackVerdict` | `debug-run-tests`, `build-run-tests`, `debug-soak` | `PASS` \ | `FAIL` \ | `CONCERNS` \ | `skip` | Verdict of the `test:real` execution specifically (distinct from the suite-wide `verdict`) |
| `realStackReason` | `debug-close-workflow`, `build-close-workflow` | string | Consumer-neutral reason logged when capability `absent`/`off`, OR a soak-to-off downgrade occurred (no KN-/BAR- refs) |
| `soakDowngradeReason` | `debug-worktree-setup` | string (`real-stack-unavailable`) | Set when `OBSERVE_MODE = soak` was requested but `REAL_STACK != live`, forcing the soak→off downgrade (§D / C4) |
| `soakIterations` | `debug-soak` | integer | Count of soak loop iterations consumed (lets an operator read progress / exhaustion from state without parsing the soak artifact; supports C2 exhaustion routing and O2) |

New step kinds (same envelope as existing steps — `step`, `status`, `verdict`, `attempt`,
`at`, `parentSha`, `artifacts`):

- `debug-reproduce` — the reproduce-first gate execution (records `repro`, `reproKind`, `realStack`).
  Runs under `OBSERVE_MODE = off` AND under `OBSERVE_MODE = soak` (both require an initial
  `repro: fail` before proceeding; §B / §D).
- `debug-soak` — one soak-mode pass (records `verdict`, `attempt`, `realStackVerdict`,
  `soakIterations`). On exhaustion (`MAX_DEBUG_ATTEMPT` reached, `test:real` still failing) records
  `realStackVerdict: FAIL` and routes to the Failure Path / `@bkit-debug-abort-handover` (§D / C2).

### OBSERVE_MODE enum

Extended from `off | instrument | analyse` to `off | instrument | analyse | soak`. Every place
that branches on OBSERVE_MODE (resume logic, `Run only if OBSERVE_MODE = off` step guards, the
Failure Path max-retry branch, gate tables, the Step 1 `OBSERVE_MODE` decision) must learn the
fourth value — the EXHAUSTIVE per-site guard table is enumerated in Components/Flows §D and each
site is an explicit plan task (§I) to prevent a half-wired branch. Soak is entered via an
`OBSERVE_MODE_OVERRIDE=soak` / `[soak]` debug-input flag (operator-selected for "feature
non-functional, cause unknown"); it is NOT auto-entered on attempt exhaustion (that path stays
`instrument`), preserving the existing escalation ladder. **Soak→off downgrade:** if `soak` is
requested but `REAL_STACK != live`, Step 2 capability resolution rewrites `OBSERVE_MODE` to `off`
(persisting `soakDowngradeReason`) BEFORE any guard runs, so the standard `OBSERVE_MODE = off`
diagnose→remediate path executes correctly (§D / C4) — there is no live `soak` value at a guard
when no real stack exists.

### docs/testing.md consumer surface

Inside the existing `<!-- bkit:start -->` managed block, add a short `## Real-stack verification`
subsection documenting the `test:real` convention in consumer-neutral language. In the Tiers
table, add a `Real` row and flip the E2E row's "Out of scope for bkit" framing:

```
| Real | `test:real` (script/turbo task) | Exercises real integration boundaries — live DB / API / model, no mocks. Optional; declares the repo HAS a real stack. | CI + debug/build real-stack gate (skipped when absent) |
```

The bkit repo's own `test:real` choice (its E2E tier is currently "out of scope for bkit") is a
bkit-repo-specific decision that, if it differs from the consumer-facing default, must sit
**outside** the `bkit:start/end` markers per the bkit-repo-vs-consumer scoping rule.

## Components / Flows

Concrete, decision-complete edit points. All operators in workflow/prompt markdown use ASCII
(`!=`, `>=`, `<=`); no Unicode comparison glyphs. All consumer-facing advisory text omits KN-/BAR-
refs.

### A. Capability resolution (debug Step 2 + build Worktree Setup)

New sub-step appended to each workflow's Worktree Setup, after `pnpm install`, before the
status-update sub-step:

```bash
# Resolve real-stack capability once; reuse downstream.
# Read the opt-out flag from the just-written input artifact, NOT an undefined shell var:
#   debug: docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md
#   build: the build-input artifact written in the same Worktree Setup step
INPUT_FILE="$REAL_STACK_INPUT_FILE"   # set to the input artifact path written earlier this step
REAL_STACK=absent
if grep -q '\[real-stack=off\]' "$INPUT_FILE" 2>/dev/null; then REAL_STACK=off; fi
if [ "$REAL_STACK" != "off" ]; then
  if [ -f turbo.json ] && pnpm turbo run test:real --dry-run >/dev/null 2>&1; then
    REAL_STACK=live
  elif jq -e '.scripts["test:real"]' package.json >/dev/null 2>&1; then
    REAL_STACK=live
  fi
fi
```

NOTE — the flag is read from the input ARTIFACT file (the session-prompt envelope written earlier
in this same Worktree Setup step), not from an undefined `DEBUG_INPUT_FLAGS` / `BUILD_INPUT_FLAGS`
shell variable; the prior draft referenced a variable that does not exist in the current step text.

NOTE — the `pnpm turbo run test:real --dry-run` existence probe is NOT an established in-repo
pattern (the existing code never probes task existence with `--dry-run`; it passes the task name
into a fixed `pnpm turbo ... --continue` list and lets turbo no-op on absent tasks). It is a
**verify-in-build risk**: the implementation MUST either (a) validate the `--dry-run` exit-status
behaviour against the repo's pinned turbo version before relying on it, or (b) fall back to the
established "include the task name and let turbo no-op" pattern (i.e. resolve `live`/`absent` from
the single-package `jq -e` path for non-monorepos and accept that a monorepo with no `test:real`
task will no-op rather than be detected absent). The single-package `jq -e` path is established and
safe; the monorepo `--dry-run` path is the only unproven piece.

Persist `realStack: $REAL_STACK` onto the existing `*-worktree-setup` step jq object (alongside
`observeMode` for debug). Gate checklist gains: `[ ] REAL_STACK resolved (live | absent | off)`.

### B. Reproduce-first gate (debug)

Two-part change so the gate is auditable from state, not just prose:

1. **New workflow sub-step in `bkit-debug.md` Step 4 area** (a `debug-reproduce` mini-step that runs
   when `OBSERVE_MODE = off` AND `REAL_STACK = live`, before the diagnose subagent is invoked). It
   ALSO runs for `OBSERVE_MODE = soak` AND `REAL_STACK = live` (see §D — soak must record a
   `repro: fail` before its loop starts so the fail-then-pass transition exists). Run `test:real`
   once, capture the exit code, and classify the outcome:
   ```bash
   if [ "$REAL_STACK" = "live" ]; then
     if [ -f turbo.json ]; then pnpm turbo run test:real --filter='...[origin/dev]' >repro.out 2>&1; else pnpm test:real >repro.out 2>&1; fi
     RC=$?
     if [ "$RC" -ne 0 ]; then
       REPRO=fail
       # Distinguish infra/setup failure from a confirmed functional assertion failure (C6).
       # Heuristic: setup/credential/connection failures (the test never reached an assertion)
       # vs a test-assertion failure (the boundary was reached and the bug manifested).
       if grep -qiE 'ECONNREFUSED|ENOTFOUND|credential|unauthor|401|403|missing env|cannot connect|no such (host|container)|docker' repro.out; then
         REPRO_KIND=infra
       else
         REPRO_KIND=functional
       fi
     else
       REPRO=pass
       REPRO_KIND=none
     fi
   else
     REPRO=skip
     REPRO_KIND=none
   fi
   ```
   Record `repro: $REPRO` AND `reproKind: $REPRO_KIND` on the `debug-reproduce` step entry.
   - **If** `REPRO = fail` AND `REPRO_KIND = functional` → genuine real-boundary reproduction;
     proceed to diagnose with this ground truth.
   - **If** `REPRO = fail` AND `REPRO_KIND = infra` → the real stack was NOT actually exercised
     (credentials/connection/Docker). Treat as capability-unavailable at run time: record CONCERNS
     with reason `real-stack-infra-failure`, degrade the gate (do NOT route this into diagnose as a
     functional ground truth — the diagnose agent would anchor on the wrong cause, FM-A3/FM-B1).
     Diagnosis, if it proceeds, is marked `empirical-unverified`.
   - **If** `REPRO = pass` (the real repro does NOT fail) → the failure is not reproducible at the
     real boundary → record the `debug-reproduce` step verdict as CONCERNS (carried on the
     `debug-reproduce` entry, NOT forced through Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL`
     assertion — see §I). Diagnosis proceeds marked `empirical-unverified`, since the bug may be
     environmental; this is a soft CONCERNS, not a hard abort.
   - **If** `REPRO = skip` → capability absent/off, gate degrades, diagnosis proceeds with the
     diagnosis artifact marked `empirical-unverified`.
2. **`bkit-debug-failure-diagnose.md` prompt** gains a Process pre-condition (new step before the
   strategy step): "If a real-stack repro was recorded as `fail` with `reproKind: functional`,
   anchor the diagnosis on that ground-truth observation; do NOT theorise past a green real repro.
   If `reproKind: infra`, treat the failure as an environment/credential problem — do NOT diagnose
   the feature as broken on the strength of an infra-failed `test:real`." This is the
   "refuse-to-theorise" discipline the issue credits with cracking the bugs, plus the C6
   guard against anchoring on an infra failure.

### C. Empirical-verify gate (debug Step 6 + build Step 13)

Reuse the existing run-tests steps; do NOT add a standalone verify step. Append `test:real` to the
script sequence **last** (cheap tiers short-circuit first, protecting cost). The exact pre-existing
tier sequence differs per workflow and `test:real` appends to each as-is:

- **debug Step 6** turbo path is `pnpm turbo lint typecheck test test:integration test:e2e --filter='...[origin/dev]' --continue`; append `test:real` to the END of that task list, so it runs
  after the full integration/e2e tier.
- **build Step 13** turbo path is `pnpm turbo lint typecheck test --filter='...[origin/dev]'`; build
  has NO `test:integration`/`test:e2e` tier (pre-PR is "lint/typecheck/unit only — NO integration /
  E2E"). Append `test:real` to the END of that list, so on build it runs immediately after `test`,
  NOT after an integration/e2e tier. The "run-last cost" claim still holds (cheapest tiers first),
  but the build tier set is smaller than debug's — do NOT assume build has an integration/e2e tier.
- **Single-package fallback** (both workflows) appends `test:real` to the `for s in ...` loop list.
  `test:real` runs only when `REAL_STACK = live`.
- **Canonical mirrors MUST be updated in lockstep** (see §H) — appending `test:real` to the step
  text without updating the `.agents/workflows.md` catalog rows and § note drifts the canonical
  reference, the "two docs, same topic = bug" trap.
- Capture a dedicated `realStackVerdict`:
  - `REAL_STACK = live` and `test:real` passed → `realStackVerdict = PASS`, `repro = pass`.
  - `REAL_STACK = live` and `test:real` failed → `realStackVerdict = FAIL` → this is the one
    **hard FAIL** that does NOT degrade; route into the existing FAIL retry branch (back to
    diagnose if `TEST_ATTEMPT <= MAX_TEST_ATTEMPT`).
  - `REAL_STACK != live` → `realStackVerdict = skip`, `repro = skip`.
- The empirical-verify gate is satisfied only when the same `test:real` recorded `repro: fail`
  earlier and `repro: pass` now (the fail-then-pass transition). A `test:real` that was green
  before the fix cannot satisfy empirical-verify — it is recorded as `repro: pass` at reproduce
  time and flagged, defeating the vacuous-pass failure mode.
- Gate 6 / Gate 13 checklist gains: `[ ] realStackVerdict recorded (PASS | FAIL | CONCERNS | skip)`
  and `[ ] empirical fail-then-pass transition recorded when REAL_STACK = live`.

### D. Soak mode (debug — fourth OBSERVE_MODE value)

- **Step 1 OBSERVE_MODE decision** gains: "If `OBSERVE_MODE_OVERRIDE = soak` (or `[soak]` in
  debug-input) → `OBSERVE_MODE = soak`." Placed before the attempt-exhaustion branch so an explicit
  soak request wins.

- **`REAL_STACK != live` downgrade happens at Step 2 capability resolution, BEFORE any guard is
  evaluated (resolves C4).** Soak is defined by looping against the real boundary, so it is
  meaningless without one. After `REAL_STACK` is resolved in Worktree Setup, if
  `OBSERVE_MODE = soak` AND `REAL_STACK != live` → **explicitly downgrade `OBSERVE_MODE` from
  `soak` to `off`** and persist BOTH the downgraded `observeMode: off` and a
  `soakDowngradeReason: real-stack-unavailable` field onto the `debug-worktree-setup` step entry,
  and record CONCERNS. Because the downgrade sets `OBSERVE_MODE = off` before Steps 4–8 are
  reached, the standard diagnose→remediate path (guarded `OBSERVE_MODE = off`) runs normally — the
  prior design's broken "fall back to diagnose while OBSERVE_MODE is still soak" is replaced by an
  actual mode change. Do NOT silently run a mock-only soak. This downgrade also surfaces in the
  escape-hatch audit (§G) so the operator sees that a requested soak ran as a normal debug.

- **New Step (Step 9-soak block), `Run only if OBSERVE_MODE = soak` (only reachable when
  `REAL_STACK = live`, given the Step-2 downgrade above)** — invokes a new `@bkit-debug-soak`
  subagent with one accumulating context. **Reproduce-first runs first (resolves C1/FM-B3/FM-C3):**
  the §B `debug-reproduce` mini-step runs for `OBSERVE_MODE = soak` too (its guard is
  `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND REAL_STACK = live`), recording an initial
  `repro: fail` (with `reproKind`) BEFORE the soak loop starts. If that initial reproduce records
  `repro: pass` (or `reproKind: infra`), the bug is not reproducible / the stack was not reached →
  soak does NOT start its loop; route as the §B `REPRO = pass` / `infra` CONCERNS case. The soak
  loop's fail-then-pass transition is thus always anchored against a recorded prior `repro: fail`,
  closing the vacuous-pass hole for the soak path. The subagent then loops
  instrument→fix→re-verify, re-running `test:real` after each fix attempt, until `test:real` goes
  green or the loop bound is hit. **Loop bound reuses `MAX_DEBUG_ATTEMPT` — no new constant.** Each
  iteration appends a `repro: fail|pass` line to the soak artifact; the orchestrator records a
  `debug-soak` step entry with `realStackVerdict` and a `soakIterations` count.

- **Soak exhaustion routing (resolves C2/FM-C1).** When the soak loop consumes all
  `MAX_DEBUG_ATTEMPT` iterations with `test:real` still failing → record `realStackVerdict: FAIL`
  on the `debug-soak` entry and **route to the Failure Path exactly as the existing
  `MAX_DEBUG_ATTEMPT` exceeded handling does** — i.e. the Failure Path branch (`bkit-debug.md:73`)
  invokes `@bkit-debug-abort-handover` and writes `debug-handover.md`. The soak step's terminal
  state is therefore a concrete FAIL verdict propagated to handover, never an undefined fall-through.
  When the loop exits green (`test:real` passes) → `realStackVerdict: PASS`, `repro: pass`, route to
  Step 12 Close Workflow (the soak-aware close path below).

- **OBSERVE_MODE guard audit — every existing guard, explicit per-step behaviour under `soak`
  (resolves C3/FM-D2).** Adding a fourth value silently breaks the workflow unless every guard is
  updated; the canonical boundary sentence alone does not enforce coverage. The full guard table
  the plan MUST encode:

<!-- prettier-ignore -->
| Site (`bkit-debug.md`) | Step | Current guard | Behaviour under `soak` |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | line 73 | Failure Path branch | routes to handover on `MAX_*` exceeded **or** `OBSERVE_MODE = analyse` | EXTEND: soak exhaustion (`MAX_DEBUG_ATTEMPT`) already routes here; no new condition needed, but confirm the soak `debug-soak` FAIL path reaches it. |
  | line 143-145 | Step 1 OBSERVE_MODE decision | sets off / instrument / analyse | ADD the `OBSERVE_MODE_OVERRIDE = soak` branch (above). |
  | line 176 | Gate 1 enum text | `(off | instrument | analyse)` | WIDEN to `(off | instrument | analyse | soak)`. |
  | line 234 | debug-input echo | `Observe: {OBSERVE_MODE}` | no change (echoes whatever value). |
  | line 248-249 | worktree-setup persist | persists `observeMode` | ADD the soak→off downgrade + `realStack` persist here (C4). |
  | line 390 | Step 4 Failure Diagnose | `OBSERVE_MODE = off` | KEEP `off` only — soak has its own Step 9-soak block; runs via downgrade-to-off when `REAL_STACK != live`. |
  | line 441 | Step 5 Failure Remediate | `OBSERVE_MODE = off` | KEEP `off` only (same rationale). |
  | line 487 | Step 6 Run Tests | `OBSERVE_MODE = off` | KEEP `off` only (same rationale). |
  | line 536 | Step 7 Push Remediation | `OBSERVE_MODE = off and Step 5 PASS` | KEEP `off` only. |
  | line 580 | Step 8 Summary | `OBSERVE_MODE = off and Step 5 PASS` | KEEP `off` only. |
  | line 626 | Step 9 Observe Instrument | `OBSERVE_MODE = instrument` | KEEP `instrument` only. |
  | line 694 | Step 10 Observe Analyse | `OBSERVE_MODE = analyse` | KEEP `analyse` only. |
  | line 734 | Step 11 Observe Revert | `OBSERVE_MODE = analyse` | KEEP `analyse` only. |
  | line 785 | Step 12 Close Workflow | `OBSERVE_MODE = off OR instrument` (skip if analyse) | EXTEND to `OBSERVE_MODE = off OR instrument OR soak` so a green soak run reaches close (soak that exhausts routes to Failure Path instead). |
  | new | Step 9-soak (new) | — | `OBSERVE_MODE = soak` (the only step gated on the new value). |

Each of these is an explicit plan task; the §B `debug-reproduce` guard is widened to
`(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND REAL_STACK = live` as the only OTHER step that
runs under both `off` and `soak`. Operators in all guard text use ASCII (`OR` spelled out as in
the existing file; comparisons use `=`).

- **New prompt `.agents/prompts/bkit-debug-soak.md`** (mirrors the failure-diagnose/remediate
  log).

- **`.agents/workflows.md`** gets the one canonical OBSERVE-vs-SOAK boundary sentence: "OBSERVE
  (instrument/analyse) is the terminal one-shot observation pass when attempts are exhausted; SOAK
  is the operator-selected iterative single-agent loop against the real stack for unknown-cause
  non-functional bugs." The `/bkit-debug` catalog rows and Step-1 mode-detection note (line ~634,
  ~641-652) MUST also learn the `soak` value (new Step 9-soak row; Gate-1 enum widened) — these are
  mirrors, see §H.

### E. Build e2e-smoke gate

No separate step. The `test:real` execution folded into build Step 13 (run-tests, item C above)
IS the e2e-smoke gate: when `REAL_STACK = live`, `test:real` must pass before Step 16 Summary →
Step 17 Create PR. When `REAL_STACK = absent/off`, the gate degrades to CONCERNS and the skip is
logged at Close Workflow AND in the always-written summary artifact / PR body (see §G — the skip
must not be visible only on a tracker comment, since no-tracker repos post none) — a PR can still be
raised, but the green is explicitly marked mock-only.

### F. Plan non-mock mandate

- **`bkit-plan-generate.md` prompt** gains a Process instruction: "For each `Agent Execution
Runbook` task that crosses an external integration boundary (DB, API, model, network, migration),
  include a paired non-mock test task whose `Done when` names the boundary AND the ground-truth
  signal (e.g. `EXPLAIN ANALYZE shows index used`, `tool-call args logged`, `finishReason
observed`). Tasks touching only pure functions are exempt — do NOT force a real-stack test where
  no boundary is crossed." Conditional-on-boundary scoping prevents plan bloat.
- **`bkit-plan-review-3.md` prompt** (regression-risk / design-coverage lens) gains a check: "For
  each task crossing an external integration boundary, assert a paired non-mock test task exists
  with a ground-truth `Done when`. A boundary-crossing task with mock-only or absent real coverage
  → CRITICAL with reason `mock-only-coverage`." This is a static check on the plan task list — it
  needs no runnable stack, so it works on every consumer repo. The existing three-reviewer +
  max-wins-merge architecture absorbs the lens; no new parallel agent, no new plan step.
- Plan-time is a mandate verified downstream by C/E (build/debug check the test actually exists and
  fails-first), closing the "written but never executed" gap.

### G. Escape-hatch audit (debug + build — always-written surface, not tracker-only)

The audit line must surface on a surface that is ALWAYS written, because no-tracker repos (the
current bkit repo default, and many consumers) skip the comment-post step entirely — every
`comment-post-step` is `_Tracker not wired — skip comment post._`, so a tracker-comment-only audit
fails silently (resolves C5/FM-G1/FM-E1). Three surfaces carry the line, in consumer-neutral
language with no internal refs:

1. **Summary artifact (always written) — the primary surface.** The summary subagents
   (`@bkit-debug-summary`, `@bkit-build-summary`) already read status.json and always write
   `debug-summary.md` / `build-summary.md`. When `realStack = absent` or `off` (or a soak-to-off
   downgrade occurred, §D), the summary MUST include the line below. The summary text is the body
   used in the PR / close comment, so this single edit propagates to both human-visible surfaces.
2. **PR body (always written when a PR is created).** Because the summary is embedded in the PR
   body, the line appears in the PR description even on no-tracker repos — a human reviewer sees it
   without reading status.json.
3. **Tracker comment (only when wired).** Where a tracker IS wired, the same line appears in the
   close comment as before; this is now the redundant surface, not the sole one.

The line (consumer-neutral, no KN-/BAR- refs):

```
Real-stack verification skipped — runtime-only defects not gated (no test:real declared, or opted out).
```

For a soak-to-off downgrade (§D), the variant line is:

```
Soak requested but no real stack available — ran standard debug instead; runtime-only defects not gated.
```

Record `realStackReason` on the close-workflow step entry so the skip is also auditable from state.
The audit must appear on at least one always-written surface (summary artifact) REGARDLESS of
tracker wiring — that is the C5 acceptance condition, not "a tracker comment where present."

### H. Canonical-mirror edit points in `.agents/workflows.md` (anti-drift)

The run-tests commands and OBSERVE_MODE enum are MIRRORED in `.agents/workflows.md`; editing only
the workflow step files drifts the canonical reference — the "two docs cover the same topic = bug"
trap stated in `.agents/docs.md`. Every mirror below is an explicit plan edit point, in lockstep
with §C and §D:

- **Debug Step 6 catalog row** (line ~646): currently `... test test:integration test:e2e --filter='...[origin/dev]' --continue`. Append `test:real` to the END of the task list to match the
  step edit.
- **Build Step 13 catalog row** (line ~621): currently `pnpm turbo lint typecheck test --filter='...[origin/dev]'` with the note "Pre-PR: lint/typecheck/unit only — NO integration / E2E".
  Append `test:real` after `test`. Do NOT add integration/e2e here (out of scope; build has no such
  tier — see OS).
- **§ "Turbo command (verbatim)" + "Pre-PR vs debug" note** (line ~975): currently "Pre-PR is
  lint+typecheck+unit only; debug normal-mode adds `test:integration test:e2e`." Update to also
  state that both append `test:real` last when `REAL_STACK = live`, keeping the build-vs-debug tier
  distinction accurate.
- **`/bkit-debug` mode-detection note + catalog** (line ~634, rows ~641-652): Step-1 OBSERVE*MODE
  text and the catalog rows must learn `soak`; ADD a Step 9-soak catalog row (`@bkit-debug-soak`
  *(only if `OBSERVE_MODE = soak`)\_); widen the Gate-1 enum mention.
- **OBSERVE-vs-SOAK boundary sentence** (§D) lands here as the single canonical home.

All edits use ASCII operators only; no consumer-facing text in these rows carries KN-/BAR- refs.

### I. Verdict-enum and guard-coverage tasks (anti-half-wiring)

- **Gate 4 verdict-enum interaction.** Gate 4 (`bkit-debug.md:432`) asserts `DIAGNOSE_VERDICT in
PASS|FAIL`, but `bkit-debug-failure-diagnose.md` emits `PASS | CONCERNS | FAIL`. The §B
  reproduce-first CONCERNS (the `REPRO = pass` and `reproKind: infra` cases) MUST be carried on the
  new `debug-reproduce` step entry's own verdict field, NOT routed through Gate 4's narrower
  `PASS|FAIL` assertion. The `debug-reproduce` mini-step is a distinct step kind with its own
  verdict (`PASS | CONCERNS | skip`); it does not feed `DIAGNOSE_VERDICT`. This design does NOT
  widen Gate 4 (out of scope — pre-existing narrowing); it only ensures the reproduce CONCERNS does
  not collide with it.
- **OBSERVE_MODE→soak guard coverage as explicit plan tasks.** The full ~14-site guard table is
  enumerated in §D. Each row is an individual plan task so the implementer cannot ship a half-wired
  branch (the design's own top risk). The canonical boundary sentence in `.agents/workflows.md`
  prevents documentation drift but does NOT enforce guard coverage — the per-site task list does.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| "Real stack" = optional consumer-declared `test:real` script, discovered via the existing `jq -e .scripts[...]` / turbo task pattern | New `bkit-real-stack.md` config file (brainstorm 2); per-tracker config; hardcoded e2e command | Smallest surface that closes the gap; rides the mechanism build/debug already use for `test:integration`/`test:e2e`; no new file type or parser to drift. The config file's one real edge (vacuous-pass detection) is preserved via the status.json fail-then-pass record instead. |
| Escape hatch = capability state `absent`/`off` degrading gates to CONCERNS (never hard-FAIL), with `[real-stack=off]` flag + loud close-comment + status.json record | Silent skip; mandatory hard-fail with no opt-out | A mandatory gate on a stackless / credential-less consumer is unsatisfiable, gets disabled, and the effort is wasted (the input's explicit warning). Silent skip recreates #143. Auditable CONCERNS is the only stable middle. |
| Hard FAIL fires ONLY when `REAL_STACK = live` AND `test:real` fails after remediation | Hard FAIL on any unavailable stack; CONCERNS even on real failure | Degrade where we cannot verify; refuse to degrade in the exact failure mode we are trying to catch. |
| Soak = fourth OBSERVE_MODE value, operator-selected, bounded by existing `MAX_DEBUG_ATTEMPT` | Reuse existing retry loop unchanged (brainstorm 3); new top-level mode; make soak default for all unknown-cause bugs (brainstorm 2 Approach C) | The issue calls the accumulating-context iterative loop "decisively yes" and explicitly distinguishes it from the structured handoff. Reusing the existing constant and documenting the OBSERVE-vs-SOAK boundary in one place neutralises the dual-mode-drift and magic-number objections. |
| Reproduce-first + empirical-verify as conditional gate items on existing steps (reproduce sub-step + run-tests), NOT standalone steps | Two new standalone workflow steps (brainstorm 2) | Gates are cheaper and harder to skip than steps; the diagnose→remediate→run-tests loop already provides fail→pass machinery. One new `debug-reproduce` mini-step is justified because the `repro` transition must be a status.json artifact, not prose. |
| Capability resolved once in Worktree Setup, persisted to status.json, reused by all gates | Re-probe per gate; full cross-workflow capability engine (brainstorm 1 Approach C) | Single source of truth without the heavy gate-engine blast radius; resume-safe; ~15 lines of shell, not a subsystem. |
| `test:real` runs LAST in the run-tests sequence on both workflows — after `... test:integration test:e2e` in debug Step 6 and after `... test` in build Step 13 (build has no integration/e2e tier; see §C) | Run real-stack first/always | Cheap tiers short-circuit before the expensive paid boundary runs — protects cost at 10x scale without new infra. In debug the cheap tiers are lint/typecheck/unit/integration/e2e; in build they are lint/typecheck/unit only (`test:real` runs immediately after `test`, NOT after an integration/e2e tier build does not have). |
| Plan mandate = `@bkit-plan-generate` instruction + `@bkit-plan-review-3` lens, scoped to boundary-crossing tasks; verified downstream by build/debug | New dedicated plan step; new parallel review agent; hard plan gate; blanket mandate on all tasks | Reuses the existing reviewer + max-wins merge; static check needs no runnable stack; boundary-scoping prevents plan bloat; downstream verification prevents the "written but never run" relocation of the defect. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| B1-A: Capability-gated gates + soak as 4th OBSERVE_MODE + `docs/testing.md` snippet | MERGED (spine) | Strongest ship-speed-to-coverage; captures all three asks via existing patterns. Adopted as the backbone — refined to use `test:real` script discovery (B3) rather than a bespoke snippet block for the runnable command. |
| B3-A: Reuse-everything `test:real` script convention + status.json fail-then-pass record, no new modes | MERGED (real-stack definition + cost discipline) | Its `test:real` discovery, run-last cost ordering, and fail-then-pass status field are adopted wholesale; its "no soak mode" stance is rejected in favour of B1's soak (the issue is decisive on the iterative loop). |
| B2-A: Tiered repro contract via `bkit-real-stack.md` config file + graceful CONCERNS downgrade | MERGED (downgrade semantics) | Its graceful-CONCERNS-not-FAIL degradation model and credential-missing handling are adopted; its config-file mechanism is rejected (new file type / parser / drift surface) in favour of the script convention. |
| B2/B3 soak risk-mitigations (reuse existing cap, document the boundary) | KEPT (layered onto soak) | Folded onto the chosen soak mode to neutralise the dual-mode-drift and magic-number objections. |
| B3-C / B2 plan mandate scoped to boundary-crossing + named ground-truth signal | KEPT (layered onto plan change) | Boundary-scoping and the named ground-truth `Done when` are adopted to prevent plan bloat and vague mock-encoding tasks. |
| B1-B: Hard non-skippable build e2e gate, no soak | REJECTED | Hard gate becomes unsatisfiable on stackless consumers → disabled (the trap the input names); drops soak (the issue's "decisively yes"). |
| B1-C / B2 single cross-workflow capability engine | REJECTED (as a subsystem) | Over-engineers for what one persisted field + conditional branches solve; largest blast radius, most resume/status invariants. Its single-source-of-truth idea is kept in lightweight form (one persisted `realStack` field). |
| B2-B: `bkit:repro`/`bkit:verify` scripts with no contract | REJECTED | Silent-no-op vacuous-pass problem; no auditable record of what "real" means. Superseded by `test:real` + the status.json fail-then-pass record. |
| B2-C / B3-B: soak as the primary/default structural change | REJECTED | Removes the STANDARD/PIVOT/FINAL escalation valuable for known-shape bugs; classification risk; black-box loop. Soak stays an operator-selected mode alongside the structured loop. |

## Trade-offs Accepted

**For the chosen design (B1-A spine + B3 definition + B2 downgrade + soak):**

- **Gain:** Closes the #143 invariant across all three workflows with ~85% reuse of existing
  machinery; consumer-agnostic by construction (absent capability = CONCERNS, never a brick);
  auditable from status.json state, not prose; no new config file, no new magic number.
- **Sacrifice vs the config-file approach (B2):** No structured, machine-declared tier/credential/
  cost metadata — the consumer encodes those in the `test:real` script itself. We accept this
  because the fail-then-pass status record recovers the only load-bearing benefit (vacuous-pass
  detection), and a free-form script is more flexible than a fixed schema.
- **Sacrifice vs the no-soak approach (B1-B / B3 no-mode):** One new OBSERVE_MODE value, one new
  prompt, and extra branch-coverage in resume/guard logic. Accepted because the issue is explicit
  that the iterative accumulating-context loop is the tool that actually cracked the bugs, and the
  cost is bounded by reusing the existing attempt cap.
- **Sacrifice vs the hard-gate approach (B1-B):** A consumer can opt out (`absent`/`off`) and ship
  mock-only green. Accepted deliberately — a hard gate gets disabled wholesale; a loud auditable
  opt-out keeps the signal alive and lets a human catch it before merge.
- **Residual limit:** bkit cannot verify that a `test:real` actually hits real deps (a consumer can
  mislabel a mock suite). This is an inherent ceiling of consumer-agnostic enforcement, surfaced as
  an open risk rather than papered over.

## Risks & Open Questions

- **Unsatisfiable-gate disablement.** Any "no mocks" gate a consumer cannot satisfy will be ripped
  out if it hard-blocks. Mitigated by per-repo declared capability + CONCERNS degradation + loud
  audit, but the ergonomics of the escape hatch must stay frictionless or consumers route around it.
- **Mock-vs-real boundary ambiguity.** "Real stack" is consumer-defined; a consumer mislabeling a
  mocked suite as `test:real` recreates #143 with a green light. No bkit-side change fully prevents
  this — stated as an accepted limit.
- **Cost/credential blast radius at 10x.** Gating both debug and build on a live-stack script
  multiplies spend and can exhaust quotas under autonomous looping. Bounded by existing retry caps
  and run-`test:real`-last ordering. **Open question:** should `test:real` run on every debug
  attempt and every soak iteration, or only on the final empirical-verify? Current design runs it at
  reproduce time + each run-tests pass + each soak iteration; a plan-time decision may cap soak
  iterations more tightly for paid endpoints.
- **OBSERVE_MODE enum surface.** Adding `soak` touches resume logic, every `Run only if
OBSERVE_MODE = off` guard, the Failure Path max-retry branch, and all gate tables. Risk of a
  half-wired branch shipping; mitigated by the **exhaustive per-site guard table in §D** (each row
  an explicit plan task, §I) — NOT by the canonical boundary sentence alone, which prevents doc
  drift but does not enforce guard coverage.
- **bkit repo's own E2E tier is "out of scope" today.** Dogfooding `test:real` in the bkit repo
  requires deciding whether bkit grows its own real-stack test or declares `none`; that bkit-repo
  choice must sit outside consumer-facing `bkit:start/end` markers. **Open question for plan.**
- **`pnpm turbo run test:real --dry-run` detection (verify-in-build risk).** The monorepo
  existence-detection incantation is NOT an established in-repo pattern and is unverified against
  the pinned turbo version. The build phase MUST validate the `--dry-run` exit-status behaviour
  before relying on it, or fall back to the established "include the task name and let turbo no-op"
  pattern (§A). The single-package `jq -e` path is established and safe; only the monorepo
  `--dry-run` path is unproven. Treat as a build-time spike, not a design blocker.
- **Consumer mirror upgrade.** The `docs/testing.md` managed-block edit and any new prompt
  (`bkit-debug-soak.md`) must flow through the install/upgrade mirror; mirror regen is batched at
  session end, not per-edit.

## Design Workstreams

### WS-1: Consumer `test:real` convention (docs/testing.md)

#### Scope

The canonical consumer-facing definition of the `test:real` convention in `docs/testing.md`:
inside the existing `<!-- bkit:start -->` managed block add the `## Real-stack verification`
subsection in consumer-neutral language; add the `Real` row to the Tiers table and flip the E2E
row's "Out of scope for bkit" framing (Architecture §1, Data Model "docs/testing.md consumer
surface"). Also resolve and document the bkit-repo's own `test:real` choice (grows its own
real-stack test or declares `none`) sitting OUTSIDE the `bkit:start/end` markers per the
bkit-repo-vs-consumer scoping rule (Risks open question). No KN-/BAR- refs in the managed block.

#### Requires

[]

#### Rationale

This is the single seam a consumer fills in to declare a real stack, and the semantic anchor every
other workstream references when it says "`test:real`." It has no upstream code dependency — it
defines a convention rather than consuming machinery — so it is a root workstream. Isolating it
keeps the consumer-facing documentation edit (and its mirror-regen concern) cohesive and decoupled
from the workflow-step shell edits.

### WS-2: Capability-resolution + status.json + OBSERVE_MODE foundation

#### Scope

The shared single-source-of-truth foundation every gate reads from:

- The `REAL_STACK in {live, absent, off}` resolver appended to BOTH debug and build Worktree Setup
  (Components/Flows §A), including the `[real-stack=off]` input-artifact read, the single-package
  `jq -e .scripts["test:real"]` path, and the monorepo `pnpm turbo run test:real --dry-run` probe
  WITH its documented verify-in-build fallback (Risks: `--dry-run` detection).
- Persisting `realStack` onto the `debug-worktree-setup` / `build-worktree-setup` step entries and
  the `[ ] REAL_STACK resolved` gate-checklist item.
- All status.json schema additions as the shared envelope (Data Model "status.json additions"):
  fields `realStack`, `repro`, `reproKind`, `realStackVerdict`, `realStackReason`,
  `soakDowngradeReason`, `soakIterations`; new step kinds `debug-reproduce`, `debug-soak`; the
  `realStackVerdict`-only-when-`realStack==live` cross-field invariant.
- The OBSERVE_MODE enum extension `off | instrument | analyse | soak` as a schema fact (Data Model
  "OBSERVE_MODE enum"), the entry mechanism (`OBSERVE_MODE_OVERRIDE=soak` / `[soak]` flag), and the
  Step-2 soak→off downgrade with `soakDowngradeReason` persistence that must run BEFORE any guard
  (this downgrade lives in capability resolution, §D / C4).

#### Requires

[WS-1]

#### Rationale

This is the conceptual root of the design — "one missing invariant, not a missing subsystem,"
resolved once per run and persisted. Every gate workstream reads `realStack`, writes the shared
status.json fields, and branches on OBSERVE_MODE; co-locating the resolver, the schema envelope,
and the enum extension prevents a half-defined field or a downgrade that runs after a guard. It
Requires WS-1 because the resolver probes for the `test:real` script the convention defines. The
soak→off downgrade is placed here (not in the soak workstream) precisely because the design
mandates it execute at capability-resolution time before any OBSERVE_MODE guard is reached.

### WS-3: Plan-phase non-mock mandate

#### Scope

The plan-workflow enforcement (Components/Flows §F): the `@bkit-plan-generate` Process instruction
mandating a paired non-mock test task with a named ground-truth `Done when` for each
boundary-crossing task (pure-function tasks exempt); and the `@bkit-plan-review-3` lens asserting
the paired non-mock test task exists, raising CRITICAL with reason `mock-only-coverage` when
boundary-crossing coverage is mock-only or absent. Covers `.agents/workflows/bkit-plan.md` and the
`bkit-plan-generate.md` / `bkit-plan-review-3.md` prompts. Static plan-task check; no runnable
stack; absorbed by the existing three-reviewer + max-wins-merge architecture (no new step/agent).

#### Requires

[WS-1]

#### Rationale

The plan mandate is a static check on the plan task list that needs no capability-resolution
machinery or status.json runtime fields — it only references the `test:real` convention WS-1
defines, so it depends on WS-1 but NOT on WS-2's runtime foundation. It is the plan-domain seam,
fully self-contained in the plan workflow + its two prompts, and can be built in parallel with the
build/debug runtime gates. It establishes the mandate that the build/debug gates later verify
downstream.

### WS-4: Build empirical-verify + e2e-smoke gate + escape-hatch audit

#### Scope

All build-workflow runtime gating (Components/Flows §C build path, §E, §G build path):

- Appending `test:real` LAST to build Step 13's run-tests sequence (`lint typecheck test` →
  `... test test:real`; build has NO integration/e2e tier) and the single-package fallback loop;
  running only when `REAL_STACK = live`.
- Recording `realStackVerdict` (PASS/FAIL/CONCERNS/skip) and the fail-then-pass `repro` transition
  on `build-run-tests`; the hard-FAIL-only-on-live-and-failed semantics routing into the existing
  FAIL branch; the e2e-smoke gate folded into the Step 13 verdict gating Step 16/17 PR creation.
- The Gate 13 checklist items (`realStackVerdict recorded`, `empirical fail-then-pass transition`).
- The build escape-hatch audit (§G) on the always-written surfaces: the `@bkit-build-summary`
  artifact line + PR-body propagation + tracker comment when wired; recording `realStackReason` on
  `build-close-workflow`; the consumer-neutral skip line (no KN-/BAR- refs).

Covers `.agents/workflows/bkit-build.md` and `bkit-build-summary.md`.

#### Requires

[WS-2]

#### Rationale

The build gates read `realStack`, write the `realStackVerdict` / `repro` / `realStackReason`
fields, and depend on the persisted capability state — all owned by WS-2. They are scoped to a
single workflow (build) plus its summary prompt, with no soak coupling (build has no soak mode),
making this a cohesive build-domain unit. The empirical-verify gate, the e2e-smoke gate, and the
escape-hatch audit are grouped because §E explicitly states the e2e-smoke gate IS the §C run-tests
execution (no separate step), and the audit shares the same Close-Workflow edit and summary prompt.

### WS-5: Debug reproduce-first + empirical-verify gate + escape-hatch audit

#### Scope

The non-soak debug-workflow runtime gating (Components/Flows §B, §C debug path, §G debug path, §I
Gate-4 interaction):

- The `debug-reproduce` mini-step in the Step 4 area running when `OBSERVE_MODE = off AND
REAL_STACK = live`: run `test:real`, classify `repro` (fail/pass/skip) and `reproKind`
  (functional/infra/none) per the §B classifier, and route the four outcomes (functional-fail →
  diagnose; infra-fail → CONCERNS `real-stack-infra-failure`; pass → soft CONCERNS
  `empirical-unverified`; skip → degrade).
- The reproduce-first pre-condition in `bkit-debug-failure-diagnose.md` (anchor on functional
  ground truth; treat `reproKind: infra` as environment problem, never as the feature being broken).
- The empirical-verify gate in debug Step 6: append `test:real` LAST to
  `lint typecheck test test:integration test:e2e ... --continue` and the single-package fallback;
  record `realStackVerdict` and require the fail-then-pass transition; hard-FAIL-on-live-and-failed
  routes into the diagnose retry branch; the §I rule that reproduce CONCERNS rides the
  `debug-reproduce` step's own verdict (`PASS | CONCERNS | skip`) and is NOT forced through Gate
  4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion (Gate 4 is NOT widened — out of scope).
- The empirical-verify item in `bkit-debug-failure-remediate.md`'s local-test gate; Gate 6
  checklist items.
- The debug escape-hatch audit (§G): `@bkit-debug-summary` artifact line + PR/comment propagation;
  `realStackReason` on `debug-close-workflow`; consumer-neutral skip line.

Covers `.agents/workflows/bkit-debug.md` (non-soak portions), `bkit-debug-failure-diagnose.md`,
`bkit-debug-failure-remediate.md`, and `bkit-debug-summary.md`.

#### Requires

[WS-2]

#### Rationale

These debug gates read `realStack` and the new `debug-reproduce` step kind, write the shared
`repro` / `reproKind` / `realStackVerdict` / `realStackReason` fields, and depend on WS-2's
persisted capability and schema. They form the `OBSERVE_MODE = off` debug path — the structured
diagnose→remediate→run-tests loop — as a cohesive unit distinct from the soak loop (WS-6). The
reproduce-first gate, the empirical-verify gate, and the escape-hatch audit are grouped because the
empirical-verify fail-then-pass transition is defined against the reproduce step's recorded
`repro: fail`, and the audit shares the same Close-Workflow / summary surfaces.

### WS-6: Soak mode (fourth OBSERVE_MODE value) + guard coverage

#### Scope

The soak debug path and its anti-half-wiring guard coverage (Components/Flows §D, §I guard-coverage):

- Step 1 OBSERVE_MODE decision branch setting `OBSERVE_MODE = soak` on
  `OBSERVE_MODE_OVERRIDE = soak` / `[soak]`, placed before the attempt-exhaustion branch.
- The new Step 9-soak block (`Run only if OBSERVE_MODE = soak`) invoking `@bkit-debug-soak` with one
  accumulating context, looping instrument→fix→re-verify against `test:real` bounded by the existing
  `MAX_DEBUG_ATTEMPT` (no new constant); widening the §B `debug-reproduce` guard to
  `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND REAL_STACK = live` so soak records an initial
  `repro: fail` before looping (vacuous-pass closure for soak); recording `debug-soak` with
  `realStackVerdict` and `soakIterations`.
- Soak exhaustion routing: `MAX_DEBUG_ATTEMPT` exhausted with `test:real` still failing → record
  `realStackVerdict: FAIL` and route to the Failure Path / `@bkit-debug-abort-handover`; green exit
  → `realStackVerdict: PASS` routes to the soak-aware Close Workflow.
- The EXHAUSTIVE ~14-site OBSERVE_MODE guard-coverage table (§D), each row an explicit task: the
  Failure Path branch, Step 1 decision, Gate 1 enum widening to `(off | instrument | analyse |
soak)`, debug-input echo, Step 4/5/6/7/8 KEEP-`off`, Step 9/10/11 KEEP-instrument/analyse, Step
  12 Close Workflow EXTEND to `off OR instrument OR soak`, and the new Step 9-soak gate.
- The new `.agents/prompts/bkit-debug-soak.md` prompt (machine-parseable verdict header,
  `<!-- verdict:end -->`, accumulating ReAct-style log).

Covers `.agents/workflows/bkit-debug.md` (soak portions + all guards) and the new
`bkit-debug-soak.md` prompt.

#### Requires

[WS-2, WS-5]

#### Rationale

Soak is the fourth OBSERVE_MODE value: it Requires WS-2 for the enum extension, the
`OBSERVE_MODE_OVERRIDE=soak` entry, the `debug-soak` step kind, and the Step-2 soak→off downgrade.
It Requires WS-5 because soak REUSES the §B `debug-reproduce` mini-step (widening its guard) to
anchor the fail-then-pass transition — the reproduce step must exist before its guard can be
widened. Grouping the soak step, exhaustion routing, the new prompt, and the full guard table
together keeps the design's own top risk (a half-wired OBSERVE_MODE branch) contained in one
workstream where the per-site guard tasks are co-located and verifiable as a set.

### WS-7: Canonical-mirror lockstep edits (.agents/workflows.md)

#### Scope

The anti-drift mirror edits in `.agents/workflows.md` (Components/Flows §H, plus §D's canonical
sentence): append `test:real` to the Debug Step 6 catalog row and the Build Step 13 catalog row
(no integration/e2e added to build); update the "Turbo command (verbatim)" / "Pre-PR vs debug"
note to state both append `test:real` last when `REAL_STACK = live`; teach the `/bkit-debug`
mode-detection note + catalog rows the `soak` value, add a Step 9-soak catalog row, and widen the
Gate-1 enum mention; land the single canonical OBSERVE-vs-SOAK boundary sentence. All ASCII
operators; no KN-/BAR- refs.

#### Requires

[WS-4, WS-5, WS-6]

#### Rationale

`.agents/workflows.md` MIRRORS the run-tests command rows and OBSERVE_MODE enum that the
build/debug/soak step edits change; the design states these mirrors must be updated "in lockstep"
with the step edits, or the canonical reference drifts (the "two docs, same topic = bug" trap).
Isolating the mirror edits into one workstream that Requires the build (WS-4), debug (WS-5), and
soak (WS-6) step changes guarantees the mirror reflects the final committed step text rather than a
moving target, and keeps all canonical-reference edits in a single auditable place. It carries no
runtime behaviour of its own — purely the documentation-mirror seam.
