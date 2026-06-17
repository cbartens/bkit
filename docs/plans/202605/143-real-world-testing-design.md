Verdict: PASS

<!-- verdict:end -->

# Design: Live (Non-Mock) Testing Gates for Plan / Build / Debug

## Acceptance Scenario

### Narrative

As a maintainer running bkit's plan/build/debug workflows, when my feature touches a real
integration boundary I want the workflow to insist a non-mock test exists, fail before my fix and
pass after it, so a runtime-only defect cannot ship green behind mocked tests. When my repo has no
runnable live stack, I want the gate to step aside loudly and on the record rather than block me or
pretend the green result proves the feature works.

### Success Criteria

- A plan whose tasks cross an external boundary (DB / API / model / network / migration) is flagged
  at plan-review time if it lacks a paired non-mock test task with a ground-truth `Done when`.
- When a `:live`/smoke script is declared, build will not raise a PR and debug will not close green
  unless the live test passes; in debug it must be observed to fail before the fix and pass after.
- When no `:live`/smoke script is declared (or `[live=off]`), all three gates degrade to CONCERNS,
  the workflow still completes, and the skip is recorded in status.json and stated in the close
  comment.
- Soak mode is selectable for unknown-cause non-functional bugs, running one accumulating-context
  agent that loops against the live test until green, bounded by the existing attempt cap.
- No new magic-number constant, no new config file type, and no Unicode comparison operators are
  introduced; all consumer-facing advisory text is free of internal refs.

### Key Edge Cases

- **Vacuous pass:** a live test that exits 0 without reaching the stack (creds absent) is caught
  because the reproduce-first gate records `repro: pass` (it never failed), so empirical-verify's
  required fail-then-pass transition is absent.
- **Live boundary reached but verification fails:** the one case that does NOT degrade — it is a
  hard FAIL routed into the existing retry loop, because it is exactly the defect class #143 targets.
- **Credentials missing in CI:** capability resolution only checks script EXISTENCE (it does not
  run the script), so a declared `:live`/smoke script with absent creds resolves `live`. The creds
  failure surfaces at reproduce/run time as a non-zero exit classified `reproKind: infra` ->
  CONCERNS with reason `live-stack-infra-failure`, NOT a hard FAIL and NOT a misleading functional
  `repro: fail`. The diagnose agent is told to treat `reproKind: infra` as an environment problem,
  never as the feature being broken. (Where no live script is declared at all, capability resolves
  `absent` -> CONCERNS.)
- **Soak requested without a live stack:** at Step 2 capability resolution the workflow
  **downgrades `OBSERVE_MODE` from `soak` to `off`** (persisting `soakDowngradeReason:
live-stack-unavailable`) and records CONCERNS, so the standard `OBSERVE_MODE = off`
  diagnose->remediate path runs correctly — never a mock-only soak. The downgrade is surfaced in the
  always-written summary artifact (§G), not only a tracker comment.
- **Mislabeled mock suite as a live test:** an inherent limit of consumer-agnostic enforcement —
  bkit cannot know which deps are external; stated as an accepted residual risk, not silently
  assumed away.
- **Resume mid-run:** `liveStack` is resolved once and persisted, so a resumed workflow reads the
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
diagnose->remediate->run-tests retry loop, the `debug-fetch`-grep-from-doc pattern, and
status.json per-step verdicts — adding the minimum new surface.

### The testing taxonomy this installs

Two orthogonal axes plus one curated suite, replacing the prior single ad-hoc live-test token:

- **Tier (scope):** `unit < integration < e2e` — mocked, fast, gate every PR. Scripts `test:unit`,
  `test:integration`, `test:e2e`.
- **Liveness:** a `LIVE_API` env flag (`LIVE_API=1` / `true` in code) flips mocking off globally
  ("use real APIs incl. external"). The flag is the PRIMITIVE; two authoring styles key on it and
  both are valid: a MODE test (`if (!process.env.LIVE_API) vi.mock(...)`) re-runs the SAME assertion
  mocked-or-live (the truest #143 fix — one source of assertions, no mock/live drift); a SUBSET test
  (`describe.skipIf(!process.env.LIVE_API)`) is live-only and skips without the flag — the pattern
  the `gether` consumer already uses across its integration suite (today via a fragmented
  `TEST_REAL_APIS` / `HAS_LOCAL_SUPABASE` / `HAS_LIVE_TARGET` / `RUN_INTEGRATION` set this convention
  unifies). Live scripts: `test:integration:live`, `test:e2e:live` (each sets `LIVE_API=1`, filters
  to `@live`).
- **Naming split:** the surface vocabulary is `live` (`:live` script suffix, `@live` / `@smoke`
  tags, CI job + env-file names like `.env.live`); the in-code env var is `LIVE_API`.
- **Smoke (curated live subset):** `test:smoke` — a curated `@smoke` subset of the live tests
  (`LIVE_API=1`), run on main/dev push + as the build gate + agent-invocable.
- **Tags:** `@live` (eligible under `LIVE_API=1`) is a SUPERSET of `@smoke` (curated). Strict
  nesting: `@smoke` within `@live` within all tests.

"The live test" in this doc means whichever of `test:integration:live` / `test:e2e:live` /
`test:smoke` applies in context; the generic phrase is used where the doc speaks generically and
the specific scripts where it lists commands.

### Script-naming standard

A single naming convention spans three script groups plus umbrella aggregates so workflows read
`lint check test` rather than enumerating tasks:

- **lint group:** `lint:slop`, `lint:prose`, `lint:no-tier-terms`.
- **check group:** `check:type` (was `typecheck`), `check:format` (was `format:check`),
  `check:dist` (bkit-repo only), `check:bkit` (was the `pnpm bkit check` CLI; bkit-repo only —
  consumers invoke the `bkit check` CLI directly). `format` (prettier `--write`) stays `format`: it
  is a mutating action, not a check.
- **test group:** the tiers above (`test:unit`, `test:integration`, `test:e2e`, the `:live`
  variants, `test:smoke`).
- **Umbrella aggregates:** `lint` -> all `lint:*`; `check` -> all `check:*`; `test` -> mocked tiers
  ONLY (`test:unit` + `test:integration` + `test:e2e`). The live tiers and `test:smoke` are NEVER
  folded into `test` — a bare `pnpm test` must never hit live APIs. Consequence: the run-tests turbo
  commands become `pnpm turbo lint check test ...` (typecheck folded into `check`), with
  `test:smoke` appended on build and the live tiers appended on debug.

### Resolving the consumer-agnostic crux

bkit ships to consumer repos that may have no runnable live stack, or where hitting real deps
(LLMs, DBs) costs money or needs CI-absent credentials. A gate that hard-requires a live stack
is unsatisfiable on those repos, gets ripped out, and takes the good parts with it. The design
resolves this with a **declared-capability + graceful-downgrade + loud-audit** model:

1. **The "live stack" is a declared, optional capability** — consumer-owned `:live`/smoke scripts
   (`test:integration:live`, `test:e2e:live`, `test:smoke`) discovered exactly the way **debug**
   Step 6 already discovers `test:integration` / `test:e2e` and the way **build** Step 13 already
   discovers `test` (`jq -e ".scripts[\"$s\"]"` for single-package, turbo task for monorepos). NOTE
   on tier ordering: debug Step 6 runs the full mocked `lint check test test:integration test:e2e`
   sequence and appends the live test, but build Step 13 runs `lint check test:unit` and appends
   `test:smoke` last (build is pre-PR "lint/check/unit only — NO mocked integration / E2E in its own
   step"; CI covers those on the resulting PR). The discovery mechanism is identical on both; the
   tier sequence the live test appends to differs (see Components/Flows §C). Documented in one
   canonical home: the tier table in `docs/testing.md` plus a short managed subsection inside the
   existing `<!-- bkit:start -->` block.
2. **The escape hatch is a single declared key, never a hard block.** `bkit:live` resolves
   to one of three capability states — `live` (a `:live`/smoke script exists and runs),
   `absent` (no live script declared), or `off` (explicitly opted out via a `[live=off]`
   input flag). `absent`/`off` make the gates **degrade to CONCERNS, never hard-FAIL**, so the
   workflow continues and is auditable rather than blocked. A hard FAIL only fires in the one
   case we are actually trying to catch: the live boundary was reached and the empirical
   verification failed.
3. **Every skip is loud and state-recorded.** The capability state and per-run verdicts are
   written to status.json, AND the always-written summary artifact / PR body states, in
   consumer-neutral language, "Live verification skipped — runtime-only defects not gated."
   The audit lands on an always-written surface (summary artifact), not only a tracker comment —
   no-tracker repos (including bkit itself) post no comment, so a comment-only audit would fail
   silently (§G). A silent skip would recreate the exact #143 failure, so silence is prohibited.

### Workflow usage model (own run-tests vs CI)

Two complementary execution contexts decide WHERE each tier runs — what a workflow's own narrow
in-loop run-tests step skips, CI covers on the resulting PR + push:

- **CI on PR:** `lint check test` (mocked unit/integration/e2e). **CI on push to dev/main:** the
  above + `test:smoke` (the only place CI hits live APIs; gated `if: github.event_name == 'push'`).
- **/bkit-build own run-tests (pre-PR, autonomous, in-loop, narrow):** `lint check test:unit` +
  `test:smoke` last when declared (the e2e-smoke gate). Build does NOT run the mocked
  integration/e2e tiers in its own step — CI covers those on the PR. Absent `test:smoke` -> CONCERNS,
  PR raised marked mock-only.
- **/bkit-debug own run-tests:** the full mocked set `lint check test test:integration test:e2e`
  PLUS the live test (`test:integration:live` / `test:e2e:live` / `test:smoke`) for
  reproduce-first / empirical-verify / soak.
- **/bkit-plan:** mandate only, no run. **/bkit-ship:** relies on CI; the main-push smoke job is its
  only live exposure.

### The two divergent options, resolved

**Option 1 — Live-stack definition: declared `:live`/smoke scripts (CHOSEN) vs new config file.**
Brainstorm 2 proposed a structured `bkit-real-stack.md` contract file (tiers, credentials, cost
signals); brainstorms 1 and 3 proposed reusing the existing script-discovery seam. We choose the
**declared `:live`/smoke scripts**, because they ride the exact mechanism build/debug already use
for `test:integration`/`test:e2e` — zero new file type, zero new parser, zero new drift surface, and
"anyone who understands the current `test:integration` discovery understands this." The structured
config file's only material advantage — distinguishing "verified against live stack" from "script
ran, stack absent, exited 0 vacuously" — is preserved without the file by layering on brainstorm
2's strongest mitigation: the **fail-then-pass transition is recorded in status.json**. A live test
that exits 0 vacuously cannot produce a recorded `repro: fail` before the fix, so the
empirical-verify gate detects the vacuous-pass case from state, not from a config declaration.
Credential/cost preconditions are handled by the script itself: capability resolution checks only
that a live script EXISTS (resolves `live`), and a creds-absent script then exits non-zero at
reproduce/run time where it is classified `reproKind: infra` -> CONCERNS with reason
`live-stack-infra-failure`, NOT a functional FAIL and NOT a misleading `repro: fail` the diagnose
agent could anchor on (§B / C6). Where no live script is declared at all, capability resolves
`absent` -> CONCERNS. Neither path hard-FAILs — only a live-boundary functional failure does.

**Option 2 — Soak: fourth OBSERVE_MODE value (CHOSEN) vs reuse the existing retry loop
unchanged.** Brainstorm 1 and 2 proposed `soak` as a fourth OBSERVE_MODE value; brainstorm 3
argued the existing diagnose->remediate->run-tests loop already provides fail->pass machinery and a
parallel mode adds a magic-number cap, a prompt, and dual-mode drift. We choose **`soak` as a
fourth OBSERVE_MODE value**, because the issue calls the iterative single-agent loop "decisively
yes" for unknown-cause/non-functional bugs and explicitly contrasts it with the structured
diagnose->remediate handoff ("instead of the diagnose->remediate handoff. Keep the structured
handoff for known-shape, localized fixes"). The structured loop and the soak loop are genuinely
different tools: the structured loop hands off discrete diagnose/remediate artifacts and escalates
STANDARD->PIVOT->FINAL->instrument; soak keeps one accumulating context that re-runs the live test
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
# LIVE_STACK in {live, absent, off}
# [live=off] read from debug-input / build-input session text
if [live=off] present:              LIVE_STACK=off
elif a :live/smoke script declared (turbo task or jq -e .scripts["test:integration:live" | "test:e2e:live" | "test:smoke"]):  LIVE_STACK=live
else:                               LIVE_STACK=absent
```

Persisted as `liveStack` on the `worktree-setup` step entry, alongside the existing `observeMode`
field.

### Component boundaries and integration points

- **`docs/testing.md`** (consumer-facing managed block + tier table) — the canonical definition
  of the tier/liveness/smoke taxonomy and the lint/check/test script groups. Single seam a consumer
  fills in to upgrade from "no stack" to "live stack."
- **`package.json` / `turbo.json`** — the script-naming standard: the `lint:*` / `check:*` /
  `test:*` scripts, the `lint` / `check` / `test` umbrella aggregates (mocked tiers only), and the
  `:live` / smoke scripts that set `LIVE_API=1` and filter the `@live` / `@smoke` tags.
- **`.github/workflows/ci.yml`** — the mocked `lint check test` job on every PR + a `test:smoke`
  job gated `if: github.event_name == 'push'` (dev/main push only).
- **`.agents/workflows/bkit-debug.md`** — capability resolution in Worktree Setup; reproduce-first
  gate (Step 4 area); empirical-verify in run-tests (Step 6); `soak` as a fourth OBSERVE_MODE value
  with its own step block; escape-hatch audit in Close Workflow.
- **`.agents/workflows/bkit-build.md`** — capability resolution in Worktree Setup; `test:smoke`
  added to the run-tests sequence (Step 13) run **last** (build's Step 13 own tier is `lint check
test:unit` — no mocked integration/e2e in its own step — so `test:smoke` appends as the live gate);
  e2e-smoke gate folded into run-tests verdict; escape-hatch audit in Close Workflow (Step 18).
- **`.agents/workflows.md`** (canonical catalog + § notes) — the run-tests commands are MIRRORED
  here and MUST be updated in lockstep with the step edits (see §H): the debug Step 6 catalog row
  (`lint check test test:integration test:e2e`, line ~646), the build Step 13 catalog row (`lint
check test:unit`, line ~621), and the § "Turbo command (verbatim)" / "Pre-PR vs debug" note (line
  ~975: "debug normal-mode adds `test:integration test:e2e` + the live test"). Also carries the
  OBSERVE-vs-SOAK boundary sentence and the Step-1 mode-detection / catalog mode text (line ~634,
  ~641-652). Omitting any of these drifts the canonical reference — the "two docs, same topic = bug"
  trap from `docs.md`.
- **`.agents/workflows/bkit-plan.md`** — non-mock mandate as a `@bkit-plan-generate` instruction +
  a new lens in `@bkit-plan-review-3`, scoped to boundary-crossing tasks only.
- **Prompts** — `bkit-debug-failure-diagnose.md` (reproduce-first pre-condition + the `Handoff:
soak` verdict), `bkit-debug-failure-remediate.md` (empirical-verify in its local-test gate), new
  `bkit-debug-soak.md`, `bkit-plan-generate.md` and `bkit-plan-review-3.md` (mandate + lens).
- **status.json** — `liveStack` capability field on worktree-setup; `repro` / `liveVerdict` /
  `failureSignatureMoved` fields on the relevant step entries; new `debug-reproduce` and
  `debug-soak` step kinds.

## Data Model

This is a markdown-workflow toolkit; the "schema" is the status.json shape and the consumer-facing
`docs/testing.md` convention. No application schema changes.

### status.json additions

All additions are optional fields layered onto existing step entries — no breaking change to the
existing reader. `liveStack` cross-field invariant: `liveVerdict` is only meaningful when
`liveStack == "live"`.

<!-- prettier-ignore -->
| Field | On step | Values | Meaning |
| --- | --- | --- | --- |
| `liveStack` | `debug-worktree-setup`, `build-worktree-setup` | `live` \ | `absent` \ | `off` | Capability resolved once per run, reused by all downstream gates |
| `repro` | `debug-reproduce` (new), and on `debug-run-tests` / `build-run-tests` | `fail` \ | `pass` \ | `skip` | The fail-then-pass transition; `skip` when `liveStack != live` |
| `reproKind` | `debug-reproduce` (new) | `functional` \ | `infra` \ | `none` | Distinguishes a confirmed functional repro from an infra/credential failure (C6); `none` when `repro != fail`. Set by the §B classifier so the diagnose agent never anchors on an infra failure as ground truth. |
| `liveVerdict` | `debug-run-tests`, `build-run-tests`, `debug-soak` | `PASS` \ | `FAIL` \ | `CONCERNS` \ | `skip` | Verdict of the live test execution specifically (distinct from the suite-wide `verdict`) |
| `failureSignatureMoved` | `debug-run-tests`, `debug-reproduce`, `debug-soak` | boolean | TRUE when a fix landed and the failure SIGNATURE moved to a NEW functional failure (the iterative-chain smell). Read by soak-routing criterion 3 (§D) across attempts to detect a bug chain mid-run. |
| `liveReason` | `debug-close-workflow`, `build-close-workflow` | string | Consumer-neutral reason logged when capability `absent`/`off`, OR a soak-to-off downgrade occurred (no internal refs) |
| `soakDowngradeReason` | `debug-worktree-setup` | string (`live-stack-unavailable`) | Set when `OBSERVE_MODE = soak` was requested but `LIVE_STACK != live`, forcing the soak->off downgrade (§D / C4) |
| `soakIterations` | `debug-soak` | integer | Count of soak loop iterations consumed against the shared `MAX_DEBUG_ATTEMPT` budget (lets an operator read progress / exhaustion from state without parsing the soak artifact; supports C2 exhaustion routing and O2) |

New step kinds (same envelope as existing steps — `step`, `status`, `verdict`, `attempt`,
`at`, `parentSha`, `artifacts`):

- `debug-reproduce` — the reproduce-first gate execution (records `repro`, `reproKind`, `liveStack`,
  `failureSignatureMoved`). Runs under `OBSERVE_MODE = off` AND under `OBSERVE_MODE = soak` (both
  require an initial `repro: fail` before proceeding; §B / §D).
- `debug-soak` — one soak-mode pass (records `verdict`, `attempt`, `liveVerdict`,
  `soakIterations`, `failureSignatureMoved`). The `attempt` field shares the single
  `MAX_DEBUG_ATTEMPT` budget with the normal path (§D). On exhaustion (the shared
  `MAX_DEBUG_ATTEMPT` reached, the live test still failing) records `liveVerdict: FAIL` and routes
  to the Failure Path / `@bkit-debug-abort-handover` (§D / C2).

### OBSERVE_MODE enum

Extended from `off | instrument | analyse` to `off | instrument | analyse | soak`. Every place
that branches on OBSERVE_MODE (resume logic, `Run only if OBSERVE_MODE = off` step guards, the
Failure Path max-retry branch, gate tables, the Step 1 `OBSERVE_MODE` decision) must learn the
fourth value — the EXHAUSTIVE per-site guard table is enumerated in Components/Flows §D and each
site is an explicit plan task (§I) to prevent a half-wired branch. Soak is entered EITHER by the
orchestrator scoring the decision criteria up front, by a `[soak]` debug-input operator override,
OR by a diagnose-subagent `Handoff: soak` crossover mid-run (§D); it is NOT auto-entered on attempt
exhaustion (that path stays `instrument`), preserving the existing escalation ladder. **Soak->off
downgrade:** if `soak` is requested but `LIVE_STACK != live`, Step 2 capability resolution rewrites
`OBSERVE_MODE` to `off` (persisting `soakDowngradeReason`) BEFORE any guard runs, so the standard
`OBSERVE_MODE = off` diagnose->remediate path executes correctly (§D / C4) — there is no live `soak`
value at a guard when no live stack exists.

### docs/testing.md consumer surface

Inside the existing `<!-- bkit:start -->` managed block, replace the single `Real` Tiers row with
the full taxonomy in consumer-neutral language: the tier table (Unit / Integration / E2E + the
`:live` variants + Smoke), the `lint` / `check` / `test` script groups, the `@live` / `@smoke`
tags, and the `LIVE_API` mode flag. The tier table:

```
| Tier        | Script                | Liveness | Tag     | What it exercises                                          | Where it runs                          |
| ----------- | --------------------- | -------- | ------- | ---------------------------------------------------------- | -------------------------------------- |
| Unit        | `test:unit`           | mocked   | —       | Pure units, fast.                                          | CI on every PR (folded into `test`).   |
| Integration | `test:integration`    | mocked   | —       | Component seams with deps mocked.                          | CI on every PR (folded into `test`).   |
| E2E         | `test:e2e`            | mocked   | —       | End-to-end paths with external deps mocked.                | CI on every PR (folded into `test`).   |
| Integration | `test:integration:live` | live (`LIVE_API=1`) | `@live`  | The integration assertions re-run against real APIs.   | debug live gate; not in bare `test`.   |
| E2E         | `test:e2e:live`       | live (`LIVE_API=1`) | `@live`  | The e2e assertions re-run against real APIs.            | debug live gate; not in bare `test`.   |
| Smoke       | `test:smoke`          | live (`LIVE_API=1`) | `@smoke` | A curated `@smoke` subset of the live tests.            | main/dev push + build gate; agent-invocable. |
```

Script groups (consumer-neutral): `lint` -> all `lint:*`; `check` -> all `check:*`; `test` -> the
MOCKED tiers only (`test:unit` + `test:integration` + `test:e2e`). The `:live` scripts and
`test:smoke` are NEVER folded into `test` so a bare `pnpm test` never hits live APIs. Tags: `@live`
is the superset eligible under `LIVE_API=1`; `@smoke` is the curated subset within `@live`.

The bkit repo declares ALL `:live`/smoke scripts ABSENT — its suite tests the install scripts and
has no live boundary — so its live gates degrade to CONCERNS by design. That bkit-repo-specific
choice sits **outside** the `bkit:start/end` markers per the bkit-repo-vs-consumer scoping rule.

## Components / Flows

Concrete, decision-complete edit points. All operators in workflow/prompt markdown use ASCII
(`!=`, `>=`, `<=`, `->`); no Unicode comparison glyphs. All consumer-facing advisory text omits
internal refs.

### A. Capability resolution (debug Step 2 + build Worktree Setup)

New sub-step appended to each workflow's Worktree Setup, after `pnpm install`, before the
status-update sub-step. Capability resolution probes EXISTENCE of any `:live`/smoke script
(`test:integration:live` / `test:e2e:live` / `test:smoke`); declaring any one resolves `live`:

```bash
# Resolve live-stack capability once; reuse downstream.
# Read the opt-out flag from the just-written input artifact, NOT an undefined shell var:
#   debug: docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md
#   build: the build-input artifact written in the same Worktree Setup step
INPUT_FILE="$LIVE_STACK_INPUT_FILE"   # set to the input artifact path written earlier this step
LIVE_STACK=absent
if grep -q '\[live=off\]' "$INPUT_FILE" 2>/dev/null; then LIVE_STACK=off; fi
if [ "$LIVE_STACK" != "off" ]; then
  for s in test:integration:live test:e2e:live test:smoke; do
    if [ -f turbo.json ] && pnpm turbo run "$s" --dry-run >/dev/null 2>&1; then LIVE_STACK=live; break; fi
    if jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1; then LIVE_STACK=live; break; fi
  done
fi
```

NOTE — the flag is read from the input ARTIFACT file (the session-prompt envelope written earlier
in this same Worktree Setup step), not from an undefined `DEBUG_INPUT_FLAGS` / `BUILD_INPUT_FLAGS`
shell variable; the prior draft referenced a variable that does not exist in the current step text.

NOTE — the `pnpm turbo run <task> --dry-run` existence probe is NOT an established in-repo
pattern (the existing code never probes task existence with `--dry-run`; it passes the task name
into a fixed `pnpm turbo ... --continue` list and lets turbo no-op on absent tasks). It is a
**verify-in-build risk**: the implementation MUST either (a) validate the `--dry-run` exit-status
behaviour against the repo's pinned turbo version before relying on it, or (b) fall back to the
established "include the task name and let turbo no-op" pattern (i.e. resolve `live`/`absent` from
the single-package `jq -e` path for non-monorepos and accept that a monorepo with no live script
will no-op rather than be detected absent). The single-package `jq -e` path is established and
safe; the monorepo `--dry-run` path is the only unproven piece.

Persist `liveStack: $LIVE_STACK` onto the existing `*-worktree-setup` step jq object (alongside
`observeMode` for debug). Gate checklist gains: `[ ] LIVE_STACK resolved (live | absent | off)`.

### B. Reproduce-first gate (debug)

Two-part change so the gate is auditable from state, not just prose:

1. **New workflow sub-step in `bkit-debug.md` Step 4 area** (a `debug-reproduce` mini-step that runs
   when `OBSERVE_MODE = off` AND `LIVE_STACK = live`, before the diagnose subagent is invoked). It
   ALSO runs for `OBSERVE_MODE = soak` AND `LIVE_STACK = live` (see §D — soak must record a
   `repro: fail` before its loop starts so the fail-then-pass transition exists). Run the live test
   (`test:integration:live` / `test:e2e:live` / `test:smoke`) once, capture the exit code, and
   classify the outcome:
   ```bash
   if [ "$LIVE_STACK" = "live" ]; then
     if [ -f turbo.json ]; then pnpm turbo run test:smoke --filter='...[origin/dev]' >repro.out 2>&1; else pnpm test:smoke >repro.out 2>&1; fi
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
   - **If** `REPRO = fail` AND `REPRO_KIND = functional` -> genuine live-boundary reproduction;
     proceed to diagnose with this ground truth.
   - **If** `REPRO = fail` AND `REPRO_KIND = infra` -> the live stack was NOT actually exercised
     (credentials/connection/Docker). Treat as capability-unavailable at run time: record CONCERNS
     with reason `live-stack-infra-failure`, degrade the gate (do NOT route this into diagnose as a
     functional ground truth — the diagnose agent would anchor on the wrong cause, FM-A3/FM-B1).
     Diagnosis, if it proceeds, is marked `empirical-unverified`.
   - **If** `REPRO = pass` (the live repro does NOT fail) -> the failure is not reproducible at the
     live boundary -> record the `debug-reproduce` step verdict as CONCERNS (carried on the
     `debug-reproduce` entry, NOT forced through Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL`
     assertion — see §I). Diagnosis proceeds marked `empirical-unverified`, since the bug may be
     environmental; this is a soft CONCERNS, not a hard abort.
   - **If** `REPRO = skip` -> capability absent/off, gate degrades, diagnosis proceeds with the
     diagnosis artifact marked `empirical-unverified`.
2. **`bkit-debug-failure-diagnose.md` prompt** gains a Process pre-condition (new step before the
   strategy step): "If a live repro was recorded as `fail` with `reproKind: functional`, anchor the
   diagnosis on that ground-truth observation; do NOT theorise past a green live repro. If
   `reproKind: infra`, treat the failure as an environment/credential problem — do NOT diagnose the
   feature as broken on the strength of an infra-failed live test." This is the "refuse-to-theorise"
   discipline the issue credits with cracking the bugs, plus the C6 guard against anchoring on an
   infra failure.

### C. Empirical-verify gate (debug Step 6 + build Step 13)

Reuse the existing run-tests steps; do NOT add a standalone verify step. Append the live test to the
script sequence **last** (cheap tiers short-circuit first, protecting cost). The exact pre-existing
tier sequence differs per workflow and the live test appends to each as-is. NOTE the umbrella
rename: `typecheck` is folded into the `check` aggregate, so the turbo prefix is now `lint check
...` rather than `lint typecheck ...`:

- **debug Step 6** turbo path is `pnpm turbo lint check test test:integration test:e2e --filter='...[origin/dev]' --continue`; append the live tiers `test:integration:live test:e2e:live`
  to the END of that task list, so they run after the full mocked integration/e2e tier.
- **build Step 13** turbo path is `pnpm turbo lint check test:unit --filter='...[origin/dev]'`;
  build's OWN step runs ONLY lint/check/unit — NO mocked integration/e2e (CI covers those on the
  resulting PR). Append `test:smoke` (the curated live smoke suite) to the END of that list as
  build's live gate, so it runs last after `test:unit`. The "run-last cost" claim still holds
  (cheapest tiers first), but the build tier set is smaller than debug's — do NOT assume build runs
  the mocked integration/e2e tiers in its own step.
- **Single-package fallback** (both workflows) appends the live test to the `for s in ...` loop
  list. The live test runs only when `LIVE_STACK = live`.
- **Canonical mirrors MUST be updated in lockstep** (see §H) — appending the live test to the step
  text without updating the `.agents/workflows.md` catalog rows and § note drifts the canonical
  reference, the "two docs, same topic = bug" trap.
- Capture a dedicated `liveVerdict`:
  - `LIVE_STACK = live` and the live test passed -> `liveVerdict = PASS`, `repro = pass`.
  - `LIVE_STACK = live` and the live test failed -> `liveVerdict = FAIL` -> this is the one
    **hard FAIL** that does NOT degrade; route into the existing FAIL retry branch (back to
    diagnose if `TEST_ATTEMPT <= MAX_TEST_ATTEMPT`).
  - `LIVE_STACK != live` -> `liveVerdict = skip`, `repro = skip`.
- The empirical-verify gate is satisfied only when the same live test recorded `repro: fail`
  earlier and `repro: pass` now (the fail-then-pass transition). A live test that was green
  before the fix cannot satisfy empirical-verify — it is recorded as `repro: pass` at reproduce
  time and flagged, defeating the vacuous-pass failure mode.
- Gate 6 / Gate 13 checklist gains: `[ ] liveVerdict recorded (PASS | FAIL | CONCERNS | skip)`
  and `[ ] empirical fail-then-pass transition recorded when LIVE_STACK = live`.

### D. Soak mode (debug — fourth OBSERVE_MODE value, orchestrator-driven)

Soak stays a fourth OBSERVE_MODE value (`off | instrument | analyse | soak`), debug-only, but entry
and the normal->soak crossover are orchestrator-driven under a SHARED attempt cap. The decision is
ONE criteria set, evaluated at TWO points (orchestrator at entry, diagnose subagent mid-run).

- **Decision criteria — one set, two evaluation points.**
  - **Hard gate (overrides all):** `liveStack == live`; else normal/off (soak is meaningless
    without a live boundary). The existing Step-2 capability veto / soak->off downgrade stays.
  - **Route to soak when ANY of:** (1) **no localizable cause** — "feature non-functional
    end-to-end," no stack trace / failing-test pinpoint, the cause is not reachable from code; (2)
    **live-boundary ground truth required** — the failure is only observable by running the real
    model / DB / stream; (3) **iterative-chain evidence** — a fix landed and the failure SIGNATURE
    MOVED to a new functional failure (visible only mid-run; read from `failureSignatureMoved`).
  - **Default -> normal** (localized, known-shape, confident root cause reachable from code).

- **Who decides.**
  - **Orchestrator at entry:** scores criteria 1-2 from the failure report + resolved capability;
    picks soak up front when indicated. Step 1 OBSERVE_MODE decision gains: "If the report scores
    criterion 1 or 2 (and `LIVE_STACK = live`) -> `OBSERVE_MODE = soak`", placed before the
    attempt-exhaustion branch so an early soak decision wins.
  - **`[soak]` human flag:** immediate operator override, HIGHEST precedence after the capability
    gate. `[soak]` in debug-input -> `OBSERVE_MODE = soak` unconditionally (still subject to the
    `LIVE_STACK != live` downgrade).
  - **diagnose subagent anytime:** scores ALL three criteria (especially #3, the chain smell);
    emits a machine-parseable `Handoff: soak` verdict + reason. The orchestrator switches the
    REMAINING budget to soak IF budget remains AND `liveStack == live`. This crossover is **ONE-WAY
    only** — soak never hands back to normal (that would discard the accumulating context).

- **`LIVE_STACK != live` downgrade happens at Step 2 capability resolution, BEFORE any guard is
  evaluated (resolves C4).** Soak is defined by looping against the live boundary, so it is
  meaningless without one. After `LIVE_STACK` is resolved in Worktree Setup, if
  `OBSERVE_MODE = soak` AND `LIVE_STACK != live` -> **explicitly downgrade `OBSERVE_MODE` from
  `soak` to `off`** and persist BOTH the downgraded `observeMode: off` and a
  `soakDowngradeReason: live-stack-unavailable` field onto the `debug-worktree-setup` step entry,
  and record CONCERNS. Because the downgrade sets `OBSERVE_MODE = off` before Steps 4-8 are
  reached, the standard diagnose->remediate path (guarded `OBSERVE_MODE = off`) runs normally — the
  prior design's broken "fall back to diagnose while OBSERVE_MODE is still soak" is replaced by an
  actual mode change. Do NOT silently run a mock-only soak. This downgrade also surfaces in the
  escape-hatch audit (§G) so the operator sees that a requested soak ran as a normal debug.

- **Shared budget — max 3 across BOTH paths.** ONE counter, cap 3, spanning the normal path AND the
  soak path. **Reuse `MAX_DEBUG_ATTEMPT` (value `3`, confirmed in `.agents/workflows/bkit-debug.md`)
  — mint no new constant.**
  - An "attempt" = a completed remediate-and-verify cycle (normal path) OR one soak fix->re-verify
    iteration. A pure diagnosis (INCLUDING a `Handoff: soak` with no fix applied) does NOT burn an
    attempt — it only redirects the MODE; the remaining budget carries into soak unchanged.
  - Both paths terminate at `@bkit-debug-abort-handover` when the shared counter hits 3 (or on a
    hard live-FAIL with no budget remaining). The handover carries the accumulated context +
    fixes-so-far so a fresh `/bkit-debug` (a NEW budget of 3) continues a deeper chain. The cap is
    PER-INVOCATION; deep chains span invocations via the handover.

- **New Step (Step 9-soak block), `Run only if OBSERVE_MODE = soak` (only reachable when
  `LIVE_STACK = live`, given the Step-2 downgrade above)** — invokes a new `@bkit-debug-soak`
  subagent with one accumulating context. **Reproduce-first runs first (resolves C1/FM-B3/FM-C3):**
  the §B `debug-reproduce` mini-step runs for `OBSERVE_MODE = soak` too (its guard is
  `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live`), recording an initial
  `repro: fail` (with `reproKind`) BEFORE the soak loop starts. If that initial reproduce records
  `repro: pass` (or `reproKind: infra`), the bug is not reproducible / the stack was not reached ->
  soak does NOT start its loop; route as the §B `REPRO = pass` / `infra` CONCERNS case. The soak
  loop's fail-then-pass transition is thus always anchored against a recorded prior `repro: fail`,
  closing the vacuous-pass hole for the soak path. The subagent then loops
  instrument->fix->re-verify, re-running the live test after each fix attempt (each iteration
  burning one unit of the SHARED `MAX_DEBUG_ATTEMPT` budget), until the live test goes green or the
  shared budget is exhausted. Each iteration appends a `repro: fail|pass` line and sets
  `failureSignatureMoved` when the signature shifts; the orchestrator records a `debug-soak` step
  entry with `liveVerdict` and a `soakIterations` count.

- **Soak exhaustion routing (resolves C2/FM-C1).** When the soak loop consumes the SHARED
  `MAX_DEBUG_ATTEMPT` budget with the live test still failing -> record `liveVerdict: FAIL`
  on the `debug-soak` entry and **route to the Failure Path exactly as the existing
  `MAX_DEBUG_ATTEMPT` exceeded handling does** — i.e. the Failure Path branch (`bkit-debug.md:73`)
  invokes `@bkit-debug-abort-handover` and writes `debug-handover.md` (carrying accumulated context
  - fixes-so-far for a fresh deeper-chain invocation). The soak step's terminal state is therefore a
    concrete FAIL verdict propagated to handover, never an undefined fall-through. When the loop exits
    green (the live test passes) -> `liveVerdict: PASS`, `repro: pass`, route to Step 12 Close Workflow
    (the soak-aware close path below).

- **OBSERVE_MODE guard audit — every existing guard, explicit per-step behaviour under `soak`
  (resolves C3/FM-D2).** Adding a fourth value silently breaks the workflow unless every guard is
  updated; the canonical boundary sentence alone does not enforce coverage. The full guard table
  the plan MUST encode (including the `Handoff: soak` crossover row and the shared-budget
  accounting):

<!-- prettier-ignore -->
  | Site (`bkit-debug.md`) | Step | Current guard | Behaviour under `soak` |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | line 73 | Failure Path branch | routes to handover on `MAX_*` exceeded **or** `OBSERVE_MODE = analyse` | EXTEND: soak exhaustion (shared `MAX_DEBUG_ATTEMPT`) already routes here; no new condition needed, but confirm the soak `debug-soak` FAIL path reaches it; handover carries accumulated context + fixes-so-far. |
  | line 143-145 | Step 1 OBSERVE_MODE decision | sets off / instrument / analyse | ADD the orchestrator entry branch (criteria 1-2 + `LIVE_STACK = live`) and the `[soak]` override (above), before the attempt-exhaustion branch. |
  | new (Step 4 area) | diagnose `Handoff: soak` crossover | — | ADD: a diagnose-subagent `Handoff: soak` verdict switches the REMAINING shared budget to soak IF budget remains AND `liveStack == live`; ONE-WAY; the handoff diagnosis does NOT burn an attempt. |
  | line 176 | Gate 1 enum text | `(off | instrument | analyse)` | WIDEN to `(off | instrument | analyse | soak)`. |
  | line 234 | debug-input echo | `Observe: {OBSERVE_MODE}` | no change (echoes whatever value). |
  | line 248-249 | worktree-setup persist | persists `observeMode` | ADD the soak->off downgrade + `liveStack` persist here (C4). |
  | line 390 | Step 4 Failure Diagnose | `OBSERVE_MODE = off` | KEEP `off` only — soak has its own Step 9-soak block; runs via downgrade-to-off when `LIVE_STACK != live`. Diagnose may still emit `Handoff: soak`. |
  | line 441 | Step 5 Failure Remediate | `OBSERVE_MODE = off` | KEEP `off` only (same rationale). |
  | line 487 | Step 6 Run Tests | `OBSERVE_MODE = off` | KEEP `off` only (same rationale). |
  | line 536 | Step 7 Push Remediation | `OBSERVE_MODE = off and Step 5 PASS` | KEEP `off` only. |
  | line 580 | Step 8 Summary | `OBSERVE_MODE = off and Step 5 PASS` | KEEP `off` only. |
  | line 626 | Step 9 Observe Instrument | `OBSERVE_MODE = instrument` | KEEP `instrument` only. |
  | line 694 | Step 10 Observe Analyse | `OBSERVE_MODE = analyse` | KEEP `analyse` only. |
  | line 734 | Step 11 Observe Revert | `OBSERVE_MODE = analyse` | KEEP `analyse` only. |
  | line 785 | Step 12 Close Workflow | `OBSERVE_MODE = off OR instrument` (skip if analyse) | EXTEND to `OBSERVE_MODE = off OR instrument OR soak` so a green soak run reaches close (soak that exhausts routes to Failure Path instead). |
  | new | Step 9-soak (new) | — | `OBSERVE_MODE = soak` (the only step gated on the new value); loops on the SHARED `MAX_DEBUG_ATTEMPT` budget. |

Each of these is an explicit plan task; the §B `debug-reproduce` guard is widened to
`(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` as the only OTHER step that
runs under both `off` and `soak`. Operators in all guard text use ASCII (`OR` spelled out as in
the existing file; comparisons use `=`).

- **New prompt `.agents/prompts/bkit-debug-soak.md`** (mirrors the failure-diagnose/remediate
  log). The `bkit-debug-failure-diagnose.md` prompt gains the machine-parseable `Handoff: soak`
  verdict + reason (criteria 1-3, especially the #3 chain smell) so the orchestrator can act on the
  crossover.

- **`.agents/workflows.md`** gets the one canonical OBSERVE-vs-SOAK boundary sentence: "OBSERVE
  (instrument/analyse) is the terminal one-shot observation pass when attempts are exhausted; SOAK
  is the iterative single-agent loop against the live stack for unknown-cause non-functional bugs —
  entered by the orchestrator (criteria), a `[soak]` override, or a one-way diagnose `Handoff: soak`
  crossover, bounded by the SHARED `MAX_DEBUG_ATTEMPT` budget." The `/bkit-debug` catalog rows and
  Step-1 mode-detection note (line ~634, ~641-652) MUST also learn the `soak` value (new Step
  9-soak row; Gate-1 enum widened) — these are mirrors, see §H.

### E. Build e2e-smoke gate

No separate step. The `test:smoke` execution folded into build Step 13 (run-tests, item C above)
IS the e2e-smoke gate — build's curated live gate is the smoke suite, run last: when
`LIVE_STACK = live`, `test:smoke` must pass before Step 16 Summary -> Step 17 Create PR. When
`LIVE_STACK = absent/off`, the gate degrades to CONCERNS and the skip is logged at Close Workflow
AND in the always-written summary artifact / PR body (see §G — the skip must not be visible only on
a tracker comment, since no-tracker repos post none) — a PR can still be raised, but the green is
explicitly marked mock-only.

### F. Plan non-mock mandate

- **`bkit-plan-generate.md` prompt** gains a Process instruction: "For each `Agent Execution
Runbook` task that crosses an external integration boundary (DB, API, model, network, migration),
  include a paired non-mock test task whose `Done when` names the boundary AND the ground-truth
  signal (e.g. `EXPLAIN ANALYZE shows index used`, `tool-call args logged`, `finishReason
observed`). Tasks touching only pure functions are exempt — do NOT force a live test where
  no boundary is crossed." Conditional-on-boundary scoping prevents plan bloat.
- **`bkit-plan-review-3.md` prompt** (regression-risk / design-coverage lens) gains a check: "For
  each task crossing an external integration boundary, assert a paired non-mock test task exists
  with a ground-truth `Done when`. A boundary-crossing task with mock-only or absent live coverage
  -> CRITICAL with reason `mock-only-coverage`." This is a static check on the plan task list — it
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
   `debug-summary.md` / `build-summary.md`. When `liveStack = absent` or `off` (or a soak-to-off
   downgrade occurred, §D), the summary MUST include the line below. The summary text is the body
   used in the PR / close comment, so this single edit propagates to both human-visible surfaces.
2. **PR body (always written when a PR is created).** Because the summary is embedded in the PR
   body, the line appears in the PR description even on no-tracker repos — a human reviewer sees it
   without reading status.json.
3. **Tracker comment (only when wired).** Where a tracker IS wired, the same line appears in the
   close comment as before; this is now the redundant surface, not the sole one.

The line (consumer-neutral, no internal refs):

```
Live verification skipped - runtime-only defects not gated (no live test declared, or opted out).
```

For a soak-to-off downgrade (§D), the variant line is:

```
Soak requested but no live stack available — ran standard debug instead; runtime-only defects not gated.
```

Record `liveReason` on the close-workflow step entry so the skip is also auditable from state.
The audit must appear on at least one always-written surface (summary artifact) REGARDLESS of
tracker wiring — that is the C5 acceptance condition, not "a tracker comment where present."

### H. Canonical-mirror edit points in `.agents/workflows.md` (anti-drift)

The run-tests commands and OBSERVE_MODE enum are MIRRORED in `.agents/workflows.md`; editing only
the workflow step files drifts the canonical reference — the "two docs cover the same topic = bug"
trap stated in `.agents/docs.md`. Every mirror below is an explicit plan edit point, in lockstep
with §C and §D:

- **Debug Step 6 catalog row** (line ~646): currently `lint typecheck test test:integration test:e2e --filter='...[origin/dev]' --continue`. Fold `typecheck` into the `check` aggregate (-> `lint check
test ...`) and append the live tiers `test:integration:live test:e2e:live` to the END of the task
  list to match the step edit.
- **Build Step 13 catalog row** (line ~621): currently `pnpm turbo lint typecheck test --filter='...[origin/dev]'` with the note "Pre-PR: lint/typecheck/unit only — NO integration / E2E".
  Update to `pnpm turbo lint check test:unit ...` (typecheck folded into `check`; mocked
  integration/e2e are CI's job on the PR) and append `test:smoke` as the live gate. Do NOT add
  mocked integration/e2e to build's own step (out of scope — see OS).
- **§ "Turbo command (verbatim)" + "Pre-PR vs debug" note** (line ~975): currently "Pre-PR is
  lint+typecheck+unit only; debug normal-mode adds `test:integration test:e2e`." Update to the
  `lint check` aggregate naming, state build's own step is `lint check test:unit` + `test:smoke`
  last while CI covers the mocked tiers on the PR, and that debug appends the live tiers when
  `LIVE_STACK = live`, keeping the build-vs-debug tier distinction accurate.
- **`/bkit-debug` mode-detection note + catalog** (line ~634, rows ~641-652): Step-1 OBSERVE*MODE
  text and the catalog rows must learn `soak`; ADD a Step 9-soak catalog row (`@bkit-debug-soak`
  *(only if `OBSERVE_MODE = soak`)\_); widen the Gate-1 enum mention.
- **OBSERVE-vs-SOAK boundary sentence** (§D) lands here as the single canonical home.

All edits use ASCII operators only; no consumer-facing text in these rows carries internal refs.

### I. Verdict-enum and guard-coverage tasks (anti-half-wiring)

- **Gate 4 verdict-enum interaction.** Gate 4 (`bkit-debug.md:432`) asserts `DIAGNOSE_VERDICT in
PASS|FAIL`, but `bkit-debug-failure-diagnose.md` emits `PASS | CONCERNS | FAIL`. The §B
  reproduce-first CONCERNS (the `REPRO = pass` and `reproKind: infra` cases) MUST be carried on the
  new `debug-reproduce` step entry's own verdict field, NOT routed through Gate 4's narrower
  `PASS|FAIL` assertion. The `debug-reproduce` mini-step is a distinct step kind with its own
  verdict (`PASS | CONCERNS | skip`); it does not feed `DIAGNOSE_VERDICT`. This design does NOT
  widen Gate 4 (out of scope — pre-existing narrowing); it only ensures the reproduce CONCERNS does
  not collide with it.
- **OBSERVE_MODE->soak guard coverage as explicit plan tasks.** The full ~14-site guard table is
  enumerated in §D. Each row is an individual plan task so the implementer cannot ship a half-wired
  branch (the design's own top risk). The canonical boundary sentence in `.agents/workflows.md`
  prevents documentation drift but does NOT enforce guard coverage — the per-site task list does.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Testing taxonomy = two axes (tier `unit<integration<e2e` x liveness via `LIVE_API=1`) + a curated `@smoke` subset; live scripts `test:integration:live` / `test:e2e:live` / `test:smoke`, tags `@smoke` within `@live` within all | Single ad-hoc live-test token (prior draft); a separate live test SET rather than a re-run MODE; structured `bkit-real-stack.md` config file (brainstorm 2) | Liveness is a MODE (same assertions re-run without mocks), not a parallel suite — one source of assertions, no drift between mock and live tests. The smoke subset bounds paid-boundary cost. Discovery rides the existing `jq -e .scripts[...]` / turbo task pattern; no new file type or parser. The config file's one real edge (vacuous-pass detection) is preserved via the status.json fail-then-pass record. |
| Script-naming standard: three groups (`lint:*`, `check:*`, `test:*`) + umbrella aggregates (`lint` -> all `lint:*`; `check` -> all `check:*`; `test` -> MOCKED tiers only). `typecheck` -> `check:type`, `format:check` -> `check:format`; live tiers + `test:smoke` NEVER folded into `test` | Keep flat per-task names and enumerate them in every workflow command; fold live into `test` | Workflows read `lint check test` instead of long enumerations; one convention covers all scripts; a bare `pnpm test` can NEVER hit live APIs because the live tiers are excluded from the `test` aggregate by construction. `format` (a mutating `--write`) stays `format`, not a check. |
| Escape hatch = capability state `absent`/`off` degrading gates to CONCERNS (never hard-FAIL), with `[live=off]` flag + loud close-comment + status.json record | Silent skip; mandatory hard-fail with no opt-out | A mandatory gate on a stackless / credential-less consumer is unsatisfiable, gets disabled, and the effort is wasted (the input's explicit warning). Silent skip recreates #143. Auditable CONCERNS is the only stable middle. |
| Hard FAIL fires ONLY when `LIVE_STACK = live` AND the live test fails after remediation | Hard FAIL on any unavailable stack; CONCERNS even on a live failure | Degrade where we cannot verify; refuse to degrade in the exact failure mode we are trying to catch. |
| Soak orchestration: fourth OBSERVE_MODE value; ONE criteria set evaluated at two points (orchestrator at entry on criteria 1-2 + `[soak]` override + diagnose `Handoff: soak` mid-run on criterion 3); ONE-WAY crossover; SHARED `MAX_DEBUG_ATTEMPT` cap of 3 across normal+soak; abort-handover terminal | Reuse existing retry loop unchanged (brainstorm 3); separate per-mode caps; two-way mode switching; make soak default for all unknown-cause bugs (brainstorm 2 Approach C) | The issue calls the accumulating-context iterative loop "decisively yes" and explicitly distinguishes it from the structured handoff. One shared cap reuses the existing constant (no magic number); a one-way crossover preserves accumulating context; orchestrator + diagnose scoring routes early and mid-run; a handoff that applies no fix does not burn an attempt. |
| Reproduce-first + empirical-verify as conditional gate items on existing steps (reproduce sub-step + run-tests), NOT standalone steps | Two new standalone workflow steps (brainstorm 2) | Gates are cheaper and harder to skip than steps; the diagnose->remediate->run-tests loop already provides fail->pass machinery. One new `debug-reproduce` mini-step is justified because the `repro` transition must be a status.json artifact, not prose. |
| Capability resolved once in Worktree Setup, persisted to status.json, reused by all gates | Re-probe per gate; full cross-workflow capability engine (brainstorm 1 Approach C) | Single source of truth without the heavy gate-engine blast radius; resume-safe; ~15 lines of shell, not a subsystem. |
| The live test runs LAST in the run-tests sequence on both workflows — after `... test:integration test:e2e` (then the `:live` tiers) in debug Step 6 and after `test:unit` (then `test:smoke`) in build Step 13 (build's own step has no mocked integration/e2e tier; see §C) | Run the live test first/always | Cheap tiers short-circuit before the expensive paid boundary runs — protects cost at 10x scale without new infra. In debug the cheap tiers are lint/check/unit/integration/e2e; in build's own step they are lint/check/unit only (`test:smoke` runs last; CI covers the mocked integration/e2e tiers on the PR). |
| Plan mandate = `@bkit-plan-generate` instruction + `@bkit-plan-review-3` lens, scoped to boundary-crossing tasks; verified downstream by build/debug | New dedicated plan step; new parallel review agent; hard plan gate; blanket mandate on all tasks | Reuses the existing reviewer + max-wins merge; static check needs no runnable stack; boundary-scoping prevents plan bloat; downstream verification prevents the "written but never run" relocation of the defect. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| B1-A: Capability-gated gates + soak as 4th OBSERVE_MODE + `docs/testing.md` snippet | MERGED (spine) | Strongest ship-speed-to-coverage; captures all three asks via existing patterns. Adopted as the backbone — refined to use `:live`/smoke script discovery (B3) rather than a bespoke snippet block for the runnable command. |
| B3-A: Reuse-everything live-script convention + status.json fail-then-pass record, no new modes | MERGED (live-stack definition + cost discipline) | Its live-script discovery, run-last cost ordering, and fail-then-pass status field are adopted wholesale; its "no soak mode" stance is rejected in favour of B1's soak (the issue is decisive on the iterative loop). |
| B2-A: Tiered repro contract via `bkit-real-stack.md` config file + graceful CONCERNS downgrade | MERGED (downgrade semantics) | Its graceful-CONCERNS-not-FAIL degradation model and credential-missing handling are adopted; its config-file mechanism is rejected (new file type / parser / drift surface) in favour of the script convention. |
| B2/B3 soak risk-mitigations (reuse existing cap, document the boundary) | KEPT (layered onto soak) | Folded onto the chosen soak mode to neutralise the dual-mode-drift and magic-number objections. |
| B3-C / B2 plan mandate scoped to boundary-crossing + named ground-truth signal | KEPT (layered onto plan change) | Boundary-scoping and the named ground-truth `Done when` are adopted to prevent plan bloat and vague mock-encoding tasks. |
| B1-B: Hard non-skippable build e2e gate, no soak | REJECTED | Hard gate becomes unsatisfiable on stackless consumers -> disabled (the trap the input names); drops soak (the issue's "decisively yes"). |
| B1-C / B2 single cross-workflow capability engine | REJECTED (as a subsystem) | Over-engineers for what one persisted field + conditional branches solve; largest blast radius, most resume/status invariants. Its single-source-of-truth idea is kept in lightweight form (one persisted `liveStack` field). |
| B2-B: `bkit:repro`/`bkit:verify` scripts with no contract | REJECTED | Silent-no-op vacuous-pass problem; no auditable record of what "live" means. Superseded by the `:live`/smoke scripts + the status.json fail-then-pass record. |
| B2-C / B3-B: soak as the primary/default structural change | REJECTED | Removes the STANDARD/PIVOT/FINAL escalation valuable for known-shape bugs; classification risk; black-box loop. Soak stays an operator-selected mode alongside the structured loop. |

## Trade-offs Accepted

**For the chosen design (B1-A spine + B3 definition + B2 downgrade + soak):**

- **Gain:** Closes the #143 invariant across all three workflows with ~85% reuse of existing
  machinery; consumer-agnostic by construction (absent capability = CONCERNS, never a brick);
  auditable from status.json state, not prose; no new config file, no new magic number.
- **Sacrifice vs the config-file approach (B2):** No structured, machine-declared tier/credential/
  cost metadata — the consumer encodes those in the live test script itself. We accept this
  because the fail-then-pass status record recovers the only load-bearing benefit (vacuous-pass
  detection), and a free-form script is more flexible than a fixed schema.
- **Sacrifice — the script-naming-standard churn.** The `lint:*` / `check:*` / `test:*` rename
  (`typecheck` -> `check:type`, `format:check` -> `check:format`) plus the umbrella aggregates is a
  SHIPPED convention rename with consumer-migration blast radius — every consumer's `package.json`,
  CI, and muscle memory shifts. Accepted because the one-time migration buys workflows that read
  `lint check test` instead of enumerations and a `test` aggregate that structurally cannot reach
  live APIs; the rename flows through the install/upgrade mirror.
- **Sacrifice vs the no-soak approach (B1-B / B3 no-mode):** One new OBSERVE_MODE value, one new
  prompt, and extra branch-coverage in resume/guard logic. Accepted because the issue is explicit
  that the iterative accumulating-context loop is the tool that actually cracked the bugs, and the
  cost is bounded by reusing the existing attempt cap.
- **Sacrifice — the tight shared soak budget.** A SHARED cap of 3 across normal+soak is tight for
  deep bug chains (the #143 case was a 3-bug chain). Accepted because early orchestrator routing
  does the heavy lifting and the per-invocation cap is extended across invocations via the
  abort-handover (a fresh `/bkit-debug` gets a new budget of 3 carrying accumulated context); a
  looser cap would risk unbounded paid-endpoint spend.
- **Sacrifice vs the hard-gate approach (B1-B):** A consumer can opt out (`absent`/`off`) and ship
  mock-only green. Accepted deliberately — a hard gate gets disabled wholesale; a loud auditable
  opt-out keeps the signal alive and lets a human catch it before merge.
- **Residual limit:** bkit cannot verify that a live test actually hits real deps (a consumer can
  mislabel a mock suite). This is an inherent ceiling of consumer-agnostic enforcement, surfaced as
  an open risk rather than papered over.

## Risks & Open Questions

- **Unsatisfiable-gate disablement.** Any "no mocks" gate a consumer cannot satisfy will be ripped
  out if it hard-blocks. Mitigated by per-repo declared capability + CONCERNS degradation + loud
  audit, but the ergonomics of the escape hatch must stay frictionless or consumers route around it.
- **Mock-vs-live boundary ambiguity.** The "live stack" is consumer-defined; a consumer mislabeling
  a mocked suite as a `:live`/smoke script recreates #143 with a green light. No bkit-side change
  fully prevents this — stated as an accepted limit.
- **Shared soak cap of 3 is tight for deep chains.** The #143 case was a 3-bug chain, so a SHARED
  `MAX_DEBUG_ATTEMPT` budget of 3 across normal+soak can be exhausted before a deep chain is fully
  cracked in one invocation. Mitigated by EARLY orchestrator routing doing the heavy lifting (so the
  budget is spent on soak iterations, not wasted on a misclassified normal path) and by the
  abort-handover carrying accumulated context into a fresh invocation with a new budget — but the
  per-invocation tightness is a real limit, surfaced not papered over.
- **Chain-smell discriminator is a heuristic.** Criterion 3 (failure signature MOVED -> route to
  soak) and the orchestrator's criteria-1/2 scoring are heuristics that can misfire. They degrade
  SAFELY: when unsure, the default is normal/OBSERVE rather than soak, so a misjudged signal costs a
  structured-path attempt, never a silent wrong-mode lock-in (the crossover is one-way INTO soak but
  is only taken on a positive signal + remaining budget + `liveStack == live`).
- **Cost/credential blast radius at 10x.** Gating both debug and build on a live script multiplies
  spend and can exhaust quotas under autonomous looping. Bounded by existing retry caps and
  run-live-test-last ordering. **Open question:** should the live test run on every debug attempt
  and every soak iteration, or only on the final empirical-verify? Current design runs it at
  reproduce time + each run-tests pass + each soak iteration; a plan-time decision may cap soak
  iterations more tightly for paid endpoints.
- **OBSERVE_MODE enum surface.** Adding `soak` touches resume logic, every `Run only if
OBSERVE_MODE = off` guard, the Failure Path max-retry branch, and all gate tables. Risk of a
  half-wired branch shipping; mitigated by the **exhaustive per-site guard table in §D** (each row
  an explicit plan task, §I) — NOT by the canonical boundary sentence alone, which prevents doc
  drift but does not enforce guard coverage.
- **bkit repo declares the live tier absent by design.** bkit's own suite tests the install
  scripts and has no live boundary, so it declares all `:live`/smoke scripts ABSENT and its live
  gates degrade to CONCERNS; that bkit-repo choice must sit outside consumer-facing `bkit:start/end`
  markers. Confirmed decision, recorded here so the implementer does not mint a bkit live test.
- **`pnpm turbo run <task> --dry-run` detection (verify-in-build risk).** The monorepo
  existence-detection incantation is NOT an established in-repo pattern and is unverified against
  the pinned turbo version. The build phase MUST validate the `--dry-run` exit-status behaviour
  before relying on it, or fall back to the established "include the task name and let turbo no-op"
  pattern (§A). The single-package `jq -e` path is established and safe; only the monorepo
  `--dry-run` path is unproven. Treat as a build-time spike, not a design blocker.
- **Consumer mirror upgrade.** The `docs/testing.md` managed-block edit and any new prompt
  (`bkit-debug-soak.md`) must flow through the install/upgrade mirror; mirror regen is batched at
  session end, not per-edit.

## Design Workstreams

### WS-1: Script-naming standard (lint/check/test groups + aggregates + ci.yml)

#### Scope

The script-naming convention that every other workstream's commands reference (Architecture
"Script-naming standard", §C consequence, §H mirror note):

- The `package.json` / `turbo.json` script renames: `lint:slop` / `lint:prose` /
  `lint:no-tier-terms`; `check:type` (was `typecheck`), `check:format` (was `format:check`),
  `check:dist` (bkit-repo only), `check:bkit` (was `pnpm bkit check`; bkit-repo only); `format`
  (prettier `--write`) stays `format`; the mocked tiers `test:unit` / `test:integration` /
  `test:e2e`, the live tiers `test:integration:live` / `test:e2e:live` (each setting `LIVE_API=1`,
  filtering `@live`), and `test:smoke` (curated `@smoke`).
- The umbrella aggregates: `lint` -> all `lint:*`; `check` -> all `check:*`; `test` -> MOCKED tiers
  only (`test:unit` + `test:integration` + `test:e2e`). The live tiers and `test:smoke` are NEVER
  folded into `test`.
- The `.github/workflows/ci.yml` edits: `lint check test` on every PR + a `test:smoke` job gated
  `if: github.event_name == 'push'` (dev/main push only).
- Updating the run-tests turbo commands consumed by the workflows from `lint typecheck test ...` to
  `lint check test ...` (typecheck folded into `check`).

#### Requires

[]

#### Rationale

This is the foundational naming convention the entire design speaks in — the tier table (WS-2), the
capability resolver (WS-3), and every run-tests command (WS-5/WS-6/WS-7/WS-8) reference these script
names and the `lint check test` aggregates. It has no upstream code dependency — it defines names
and aggregates — so it is a root workstream alongside the convention doc. Isolating the rename plus
the ci.yml smoke job keeps the convention-shaped churn (with its consumer-migration blast radius) in
one auditable place rather than smeared across the gate workstreams.

### WS-2: Consumer testing-taxonomy convention (docs/testing.md)

#### Scope

The canonical consumer-facing definition of the testing taxonomy in `docs/testing.md`:
inside the existing `<!-- bkit:start -->` managed block, replace the single `Real` Tiers row with
the full picture — the tier table (Unit / Integration / E2E + the `:live` variants + Smoke), the
`lint` / `check` / `test` script groups, the `@live` / `@smoke` tags, and the `LIVE_API` mode flag —
all in consumer-neutral language (Architecture "testing taxonomy", Data Model "docs/testing.md
consumer surface"). Also record that the bkit repo declares ALL `:live`/smoke scripts ABSENT (its
suite tests the install scripts; no live boundary) so its gates degrade — that bkit-repo choice
sitting OUTSIDE the `bkit:start/end` markers per the bkit-repo-vs-consumer scoping rule. No internal
refs in the managed block.

#### Requires

[WS-1]

#### Rationale

This is the single seam a consumer fills in to declare a live stack, and the semantic anchor every
other workstream references when it names the tiers/tags. It Requires WS-1 because the tier table
documents the exact `:live`/smoke script names and `lint`/`check`/`test` groups WS-1 mints. It has
no other upstream code dependency — it defines a convention rather than consuming machinery.
Isolating it keeps the consumer-facing documentation edit (and its mirror-regen concern) cohesive
and decoupled from the workflow-step shell edits.

### WS-3: Capability-resolution + status.json + OBSERVE_MODE foundation

#### Scope

The shared single-source-of-truth foundation every gate reads from:

- The `LIVE_STACK in {live, absent, off}` resolver appended to BOTH debug and build Worktree Setup
  (Components/Flows §A), including the `[live=off]` input-artifact read, the single-package
  `jq -e .scripts["test:integration:live" | "test:e2e:live" | "test:smoke"]` existence probe, and
  the monorepo `pnpm turbo run <task> --dry-run` probe WITH its documented verify-in-build fallback
  (Risks: `--dry-run` detection).
- Persisting `liveStack` onto the `debug-worktree-setup` / `build-worktree-setup` step entries and
  the `[ ] LIVE_STACK resolved` gate-checklist item.
- All status.json schema additions as the shared envelope (Data Model "status.json additions"):
  fields `liveStack`, `repro`, `reproKind`, `liveVerdict`, `failureSignatureMoved`, `liveReason`,
  `soakDowngradeReason`, `soakIterations`; new step kinds `debug-reproduce`, `debug-soak`; the
  `liveVerdict`-only-when-`liveStack==live` cross-field invariant; the `failureSignatureMoved`
  signal read by soak criterion 3; the SHARED `MAX_DEBUG_ATTEMPT` budget semantics across normal+soak.
- The OBSERVE_MODE enum extension `off | instrument | analyse | soak` as a schema fact (Data Model
  "OBSERVE_MODE enum"), the entry mechanisms (orchestrator criteria + `[soak]` flag + diagnose
  `Handoff: soak`), and the Step-2 soak->off downgrade with `soakDowngradeReason` persistence that
  must run BEFORE any guard (this downgrade lives in capability resolution, §D / C4).

#### Requires

[WS-1, WS-2]

#### Rationale

This is the conceptual root of the design — "one missing invariant, not a missing subsystem,"
resolved once per run and persisted. Every gate workstream reads `liveStack`, writes the shared
status.json fields, and branches on OBSERVE_MODE; co-locating the resolver, the schema envelope,
and the enum extension prevents a half-defined field or a downgrade that runs after a guard. It
Requires WS-1 for the `:live`/smoke script names it probes and WS-2 for the convention those names
anchor. The soak->off downgrade is placed here (not in the soak workstream) precisely because the
design mandates it execute at capability-resolution time before any OBSERVE_MODE guard is reached.

### WS-4: Plan-phase non-mock mandate

#### Scope

The plan-workflow enforcement (Components/Flows §F): the `@bkit-plan-generate` Process instruction
mandating a paired non-mock test task with a named ground-truth `Done when` for each
boundary-crossing task (pure-function tasks exempt); and the `@bkit-plan-review-3` lens asserting
the paired non-mock test task exists, raising CRITICAL with reason `mock-only-coverage` when
boundary-crossing coverage is mock-only or absent. Covers `.agents/workflows/bkit-plan.md` and the
`bkit-plan-generate.md` / `bkit-plan-review-3.md` prompts. Static plan-task check; no runnable
stack; absorbed by the existing three-reviewer + max-wins-merge architecture (no new step/agent).

#### Requires

[WS-2]

#### Rationale

The plan mandate is a static check on the plan task list that needs no capability-resolution
machinery or status.json runtime fields — it only references the testing-taxonomy convention WS-2
defines, so it depends on WS-2 but NOT on WS-3's runtime foundation. It is the plan-domain seam,
fully self-contained in the plan workflow + its two prompts, and can be built in parallel with the
build/debug runtime gates. It establishes the mandate that the build/debug gates later verify
downstream.

### WS-5: Build empirical-verify + e2e-smoke gate + escape-hatch audit

#### Scope

All build-workflow runtime gating (Components/Flows §C build path, §E, §G build path):

- Appending `test:smoke` LAST to build Step 13's run-tests sequence (`lint check test:unit` ->
  `... test:unit test:smoke`; build's own step has NO mocked integration/e2e tier — CI covers those
  on the PR) and the single-package fallback loop; running only when `LIVE_STACK = live`.
- Recording `liveVerdict` (PASS/FAIL/CONCERNS/skip) and the fail-then-pass `repro` transition
  on `build-run-tests`; the hard-FAIL-only-on-live-and-failed semantics routing into the existing
  FAIL branch; the e2e-smoke gate folded into the Step 13 verdict gating Step 16/17 PR creation.
- The Gate 13 checklist items (`liveVerdict recorded`, `empirical fail-then-pass transition`).
- The build escape-hatch audit (§G) on the always-written surfaces: the `@bkit-build-summary`
  artifact line + PR-body propagation + tracker comment when wired; recording `liveReason` on
  `build-close-workflow`; the consumer-neutral skip line (no internal refs).

Covers `.agents/workflows/bkit-build.md` and `bkit-build-summary.md`.

#### Requires

[WS-3]

#### Rationale

The build gates read `liveStack`, write the `liveVerdict` / `repro` / `liveReason`
fields, and depend on the persisted capability state — all owned by WS-3. They are scoped to a
single workflow (build) plus its summary prompt, with no soak coupling (build has no soak mode),
making this a cohesive build-domain unit. The empirical-verify gate, the e2e-smoke gate, and the
escape-hatch audit are grouped because §E explicitly states the e2e-smoke gate IS the §C run-tests
execution (no separate step), and the audit shares the same Close-Workflow edit and summary prompt.

### WS-6: Debug reproduce-first + empirical-verify gate + escape-hatch audit

#### Scope

The non-soak debug-workflow runtime gating (Components/Flows §B, §C debug path, §G debug path, §I
Gate-4 interaction):

- The `debug-reproduce` mini-step in the Step 4 area running when `OBSERVE_MODE = off AND
LIVE_STACK = live`: run the live test, classify `repro` (fail/pass/skip) and `reproKind`
  (functional/infra/none) per the §B classifier, and route the four outcomes (functional-fail ->
  diagnose; infra-fail -> CONCERNS `live-stack-infra-failure`; pass -> soft CONCERNS
  `empirical-unverified`; skip -> degrade).
- The reproduce-first pre-condition in `bkit-debug-failure-diagnose.md` (anchor on functional
  ground truth; treat `reproKind: infra` as environment problem, never as the feature being broken).
- The empirical-verify gate in debug Step 6: append the live tiers `test:integration:live
test:e2e:live` LAST to `lint check test test:integration test:e2e ... --continue` and the
  single-package fallback; record `liveVerdict` and require the fail-then-pass transition;
  hard-FAIL-on-live-and-failed routes into the diagnose retry branch; the §I rule that reproduce
  CONCERNS rides the `debug-reproduce` step's own verdict (`PASS | CONCERNS | skip`) and is NOT
  forced through Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion (Gate 4 is NOT widened — out of
  scope).
- The empirical-verify item in `bkit-debug-failure-remediate.md`'s local-test gate; Gate 6
  checklist items.
- The debug escape-hatch audit (§G): `@bkit-debug-summary` artifact line + PR/comment propagation;
  `liveReason` on `debug-close-workflow`; consumer-neutral skip line.

Covers `.agents/workflows/bkit-debug.md` (non-soak portions), `bkit-debug-failure-diagnose.md`,
`bkit-debug-failure-remediate.md`, and `bkit-debug-summary.md`.

#### Requires

[WS-3]

#### Rationale

These debug gates read `liveStack` and the new `debug-reproduce` step kind, write the shared
`repro` / `reproKind` / `liveVerdict` / `liveReason` fields, and depend on WS-3's
persisted capability and schema. They form the `OBSERVE_MODE = off` debug path — the structured
diagnose->remediate->run-tests loop — as a cohesive unit distinct from the soak loop (WS-7). The
reproduce-first gate, the empirical-verify gate, and the escape-hatch audit are grouped because the
empirical-verify fail-then-pass transition is defined against the reproduce step's recorded
`repro: fail`, and the audit shares the same Close-Workflow / summary surfaces.

### WS-7: Soak orchestration (fourth OBSERVE_MODE value) + guard coverage

#### Scope

The orchestrator-driven soak debug path and its anti-half-wiring guard coverage (Components/Flows
§D, §I guard-coverage):

- The orchestrator soak-entry decision in Step 1: score criteria 1-2 (no localizable cause;
  live-boundary ground truth required) from the failure report + capability and set
  `OBSERVE_MODE = soak` up front when indicated (and `LIVE_STACK = live`); the `[soak]` human flag
  as the immediate operator override (highest precedence after the capability gate); both placed
  before the attempt-exhaustion branch so an early/explicit soak decision wins.
- The diagnose-subagent `Handoff: soak` crossover: `bkit-debug-failure-diagnose.md` emits a
  machine-parseable `Handoff: soak` verdict + reason on criteria 1-3 (especially #3, the
  failure-signature-moved chain smell read from `failureSignatureMoved`); the orchestrator switches
  the REMAINING shared budget to soak IF budget remains AND `liveStack == live`. ONE-WAY only (soak
  never hands back); a `Handoff: soak` diagnosis with no fix applied does NOT burn an attempt.
- The new Step 9-soak block (`Run only if OBSERVE_MODE = soak`) invoking `@bkit-debug-soak` with one
  accumulating context, looping instrument->fix->re-verify against the live test bounded by the
  SHARED `MAX_DEBUG_ATTEMPT` budget (cap 3 across normal+soak; no new constant); widening the §B
  `debug-reproduce` guard to `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` so
  soak records an initial `repro: fail` before looping (vacuous-pass closure for soak); recording
  `debug-soak` with `liveVerdict`, `soakIterations`, and `failureSignatureMoved`.
- Shared-budget accounting: ONE counter (`MAX_DEBUG_ATTEMPT`, value 3) spanning normal+soak; an
  attempt = a completed remediate-and-verify cycle OR one soak fix->re-verify iteration; a pure
  diagnosis (including a `Handoff: soak`) does not burn an attempt.
- Soak exhaustion routing: the shared `MAX_DEBUG_ATTEMPT` exhausted with the live test still failing
  -> record `liveVerdict: FAIL` and route to the Failure Path / `@bkit-debug-abort-handover` (the
  handover carries accumulated context + fixes-so-far so a fresh `/bkit-debug` with a NEW budget of
  3 continues a deeper chain); green exit -> `liveVerdict: PASS` routes to the soak-aware Close
  Workflow.
- The EXHAUSTIVE OBSERVE_MODE guard-coverage table (§D), each row an explicit task: the Failure Path
  branch, Step 1 orchestrator decision + `[soak]` override, the `Handoff: soak` crossover row, Gate
  1 enum widening to `(off | instrument | analyse | soak)`, debug-input echo, Step 4/5/6/7/8
  KEEP-`off`, Step 9/10/11 KEEP-instrument/analyse, Step 12 Close Workflow EXTEND to `off OR
instrument OR soak`, and the new Step 9-soak gate.
- The new `.agents/prompts/bkit-debug-soak.md` prompt (machine-parseable verdict header,
  `<!-- verdict:end -->`, accumulating ReAct-style log).

Covers `.agents/workflows/bkit-debug.md` (soak portions + all guards), `bkit-debug-failure-diagnose.md`
(the `Handoff: soak` verdict), and the new `bkit-debug-soak.md` prompt.

#### Requires

[WS-3, WS-6]

#### Rationale

Soak is the fourth OBSERVE_MODE value: it Requires WS-3 for the enum extension, the soak entry
mechanisms, the `debug-soak` step kind, the `failureSignatureMoved` field, the shared
`MAX_DEBUG_ATTEMPT` budget semantics, and the Step-2 soak->off downgrade. It Requires WS-6 because
soak REUSES the §B `debug-reproduce` mini-step (widening its guard) AND the
`bkit-debug-failure-diagnose.md` prompt (adding the `Handoff: soak` verdict) — the reproduce step
and the diagnose prompt must exist before soak extends them. Grouping the soak step, the
orchestrator/`[soak]`/handoff entry points, the one-way crossover, the shared-budget accounting,
exhaustion routing, the new prompt, and the full guard table together keeps the design's own top
risk (a half-wired OBSERVE_MODE branch) contained in one workstream where the per-site guard tasks
are co-located and verifiable as a set.

### WS-8: Canonical-mirror lockstep edits (.agents/workflows.md)

#### Scope

The anti-drift mirror edits in `.agents/workflows.md` (Components/Flows §H, plus §D's canonical
sentence): fold `typecheck` into the `check` aggregate and append the live tiers to the Debug Step 6
catalog row; update the Build Step 13 catalog row to `lint check test:unit` + `test:smoke` (no
mocked integration/e2e added to build's own step — CI covers those on the PR); update the "Turbo
command (verbatim)" / "Pre-PR vs debug" note to the `lint check` naming and to state debug appends
the live tiers when `LIVE_STACK = live` while build appends `test:smoke`; teach the `/bkit-debug`
mode-detection note + catalog rows the `soak` value, add a Step 9-soak catalog row, and widen the
Gate-1 enum mention; land the single canonical OBSERVE-vs-SOAK boundary sentence (orchestrator +
`[soak]` + one-way `Handoff: soak` crossover, shared `MAX_DEBUG_ATTEMPT` budget). All ASCII
operators; no internal refs.

#### Requires

[WS-5, WS-6, WS-7]

#### Rationale

`.agents/workflows.md` MIRRORS the run-tests command rows and OBSERVE_MODE enum that the
build/debug/soak step edits change; the design states these mirrors must be updated "in lockstep"
with the step edits, or the canonical reference drifts (the "two docs, same topic = bug" trap).
Isolating the mirror edits into one workstream that Requires the build (WS-5), debug (WS-6), and
soak (WS-7) step changes guarantees the mirror reflects the final committed step text rather than a
moving target, and keeps all canonical-reference edits in a single auditable place. It carries no
runtime behaviour of its own — purely the documentation-mirror seam.
