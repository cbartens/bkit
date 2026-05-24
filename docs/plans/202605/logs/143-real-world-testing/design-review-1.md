Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

This is the bkit repo itself; "buildable" = the specified edit points exist, the markdown/gate/shell
changes are internally consistent and orchestrator-executable, and they honour project conventions
(ASCII operators, no consumer-facing KN-/BAR- refs, bkit-repo logic outside `bkit:start/end`). All
claims below were verified against the live `.agents/workflows/bkit-{debug,build,plan}.md`,
`.agents/prompts/bkit-debug-*.md`, `bkit-plan-{generate,review-3}.md`, `.agents/workflows.md`,
`docs/observability.md`, and `docs/testing.md`.

## Ecosystem Search

Not a library/framework selection task — no external dependency is introduced. "Ecosystem" here is
the existing bkit machinery the design proposes to reuse. Per reused capability:

- **Script discovery (`jq -e ".scripts[\"$s\"]"` + turbo task).** EXISTS and is used verbatim in
  debug Step 6 (`bkit-debug.md:496-498`), build Step 13 (`bkit-build.md:713-715`), debug Steps
  9/11, and `bkit-debug-failure-remediate.md:52`. Fit: the `test:real` single-package discovery rides
  this exactly. Recommendation: USE-AS-IS for the `jq` single-package path. The monorepo detection
  the design proposes (`pnpm turbo run test:real --dry-run >/dev/null 2>&1`) is NOT the established
  pattern — the existing code never probes task existence with `--dry-run`; it passes the task name
  into a fixed `pnpm turbo ... --continue` list and lets turbo no-op on absent tasks. Recommendation:
  ADAPT (validate the `--dry-run` incantation against the pinned turbo version, or fall back to the
  established "just include the task name" approach). The design's own Risk section already flags this.
- **OBSERVE_MODE axis.** EXISTS as `off | instrument | analyse` with guards at `bkit-debug.md`
  lines 142-145, 176, 390, 441, 487, 536, 580, 626, 694, 734, 785, plus the Failure Path branch (73)
  and the `.agents/workflows.md` catalog (lines 634-652). Recommendation: ADAPT — extending to a
  fourth value is feasible but touches ~14 sites; see Integration Risk.
- **diagnose→remediate→run-tests retry loop.** EXISTS in both debug (Steps 4-6, cap
  `MAX_TEST_ATTEMPT`) and build (Steps 13-15, cap `MAX_TEST_ATTEMPT`, `bkit-build.md:736-739`).
  Recommendation: USE-AS-IS — the "hard FAIL routes back to diagnose" path the design relies on is
  real in both workflows.
- **`debug-fetch` grep-from-doc pattern.** EXISTS (`docs/observability.md:28-35`, markers after
  `<!-- bkit:end -->`); the debug Step 3 sed/awk extractor (`bkit-debug.md:337`) matches. The design
  cites this only as a precedent for "consumer fills one seam," not as an edit target — accurate.
- **status.json per-step verdicts.** EXISTS; additive optional fields are the established extension
  pattern. Recommendation: USE-AS-IS.
- **Three-reviewer + max-wins-merge plan review.** EXISTS (`bkit-plan.md:261-296`, worst-of-three
  verdict, summed failures). `@bkit-plan-review-3`'s lens IS "regression risk, design-coverage"
  (`bkit-plan-review-3.md:3,16,70`) and already emits `Test-coverage gaps … → CRITICAL` (Process
  step 6). Recommendation: USE-AS-IS — the `mock-only-coverage` lens slots into an existing category.

## Stack Feasibility

Buildable. Every named anchor is real:

- Debug Worktree Setup is **Step 2** (not "Step 2 + status sub-step 7"); the design's "after
  `pnpm install`, before the status sub-step" insertion point is sub-step 7 (`bkit-debug.md:235`),
  and `observeMode` is persisted onto the `debug-worktree-setup` entry (line 249) — the design's
  `realStack` sibling field is consistent.
- Build Worktree Setup is **Step 2** (`bkit-build.md:180`); `build-worktree-setup` step exists
  (line 257). Build has **no OBSERVE_MODE** (0 occurrences) — the design correctly scopes soak to
  debug only.
- Reproduce-first "Step 4 area" = debug **Step 4 Failure Diagnose**, guarded `OBSERVE_MODE = off`
  (`bkit-debug.md:390`). A `debug-reproduce` mini-step gated `off AND REAL_STACK = live` before the
  diagnose subagent is consistent with the existing guard.
- Empirical-verify = debug **Step 6 Run Tests** (`bkit-debug.md:485`) and build **Step 13 Run Tests**
  (`bkit-build.md:704`). Both exist; both have the FAIL→diagnose retry the design routes into.
- Soak as a new step: debug Steps 9/10/11 are the OBSERVE branches; a Step "9-soak" gated
  `OBSERVE_MODE = soak` is structurally feasible. Step 12 Close Workflow guard
  (`OBSERVE_MODE = off OR instrument`, `bkit-debug.md:785`) must learn `soak` — the design says so.
- Build Summary = **Step 16**, Create PR = **Step 17**, Close Workflow = **Step 18**
  (`bkit-build.md:842/887/935`). The design's "Step 16 Summary → Step 17 Create PR" gating is correct;
  its "escape-hatch audit in build Close Workflow" maps to Step 18 (design uses the name, not the
  number — fine).
- plan-generate Process step 6 already mandates a testable `Done when` (`bkit-plan-generate.md`);
  the boundary-crossing test mandate is an additive Process instruction. Feasible.

Conventions: the design introduces **no** Unicode comparison operators in conditional logic (the
`⇒/≥/<` glyphs found in all three workflows are pre-existing prose in the Status/Locks rule blocks,
not added by this design, and are not operator-in-conditional usage). Consumer-facing close-comment
text and the `docs/testing.md` row are KN-/BAR-free. The bkit-repo's own `test:real` choice is
correctly placed outside `bkit:start/end`. All compliant.

## Library / API Evaluation

No third-party library, bundle, type, or license surface — markdown-workflow toolkit only. The only
"API" is the `pnpm turbo` / `jq` / `package.json#scripts` contract already in use. Maturity: the
single-package `jq -e` path is battle-tested in-repo; the `turbo run … --dry-run` existence probe is
**unproven in this codebase** (see Unknowns).

## Integration Risk

Monorepo fit and blast radius:

- **CRITICAL drift surface — run-tests command mirrors.** The debug Step 6 command is duplicated
  verbatim in the `.agents/workflows.md` subagent catalog (`test test:integration test:e2e`, line 646) and in the § "Pre-PR vs debug" note (line 975: "debug normal-mode adds
  `test:integration test:e2e`"). The build Step 13 command is duplicated in the build catalog. The
  design's Components/Flows §C edits the workflow steps but does NOT enumerate updating these
  `workflows.md` mirrors. If `test:real` is appended to the steps but not the mirrors, the canonical
  reference drifts — exactly the "two docs cover the same topic = bug" trap in `docs.md`. Must be
  added to the edit-point list.
- **Premise inaccuracy (addressable).** The design's crux narrative and Decisions table assert
  build "already discover[s] `test:integration` / `test:e2e`." It does not: build Step 13 and its
  catalog run only `lint typecheck test` — `test:integration`/`test:e2e` are **debug-only** (0
  occurrences in `bkit-build.md`). The _mechanism_ (append `test:real` to the task list / `for s in`
  loop) is still implementable, but the justifying premise is wrong and may mislead the implementer
  into assuming a tier-ordering that build does not have. The "run `test:real` last" claim is sound
  for debug (where integration/e2e precede it) but for build `test:real` would run right after
  `test`, not after a full integration/e2e tier.
- **OBSERVE_MODE enum blast radius (the design's own top risk).** Adding `soak` touches ~14 sites:
  the Step 1 decision ladder (143-145), Gate 1 enum text (176), the `debug-input` echo (234), every
  `Run only if OBSERVE_MODE = off` guard (390/441/487/536/580), the Close Workflow guard (785), the
  Failure Path branch (73 — currently `analyse` is the only mode that routes to handover), and the
  `workflows.md` mode-detection note (634) + catalog rows (641-652). A half-wired branch is the
  realistic failure mode. Feasible but high-touch; the single canonical boundary sentence in
  `workflows.md` mitigates documentation drift but not the guard enumeration.
- **Verdict-enum widening.** Gate 4 asserts `DIAGNOSE_VERDICT in PASS|FAIL`, but
  `bkit-debug-failure-diagnose.md` emits `PASS|CONCERNS|FAIL`. The design's reproduce-first
  CONCERNS routing ("REPRO = pass → record verdict and route per existing diagnose-can't-proceed
  handling, CONCERNS not abort") interacts with this pre-existing narrowing. The design should
  confirm the reproduce mini-step's CONCERNS is carried on the new `debug-reproduce` entry, not
  forced through Gate 4's `PASS|FAIL` assertion.
- **Mirror/install propagation.** New prompt `bkit-debug-soak.md` and the `docs/testing.md`
  managed-block edit must flow through install/upgrade mirror regen (batched at session end). The
  design flags this. Low risk if the plan keeps regen at session end (per project memory).

## PoC Approach

(Description only — do not build.) Smallest proof that the consumer-agnostic mechanism works:
in a scratch repo, declare `"test:real": "exit 1"` in `package.json`, run the resolver shell
(`REAL_STACK=live` via `jq -e`), then `"test:real"` absent (`REAL_STACK=absent`), then with
`[real-stack=off]` in input text (`REAL_STACK=off`) — assert the three states resolve correctly and
that the absent/off paths produce CONCERNS not a non-zero exit. Separately, in a turbo fixture,
verify `pnpm turbo run test:real --dry-run` exit status distinguishes "task defined" from "task
absent" on the repo's pinned turbo version. This is ~15 lines of shell against fixtures bkit already
has (`tests/fixtures/heavy-customised-consumer/`), describable well under 200 words → not a
CONCERNS trigger by itself.

## Unknowns & Blockers

- **`pnpm turbo run test:real --dry-run` existence detection** is unverified against the pinned
  turbo version and is not an established in-repo pattern (the design admits this). Needs a one-line
  experiment before the monorepo path is trusted; the `jq` single-package path is safe.
- **Open cost question** (design's own): run `test:real` at reproduce + every run-tests pass + every
  soak iteration vs only at final verify. Unresolved; affects paid-endpoint blast radius. A plan-time
  decision, not a buildability blocker.
- **bkit repo's own E2E tier is "out of scope"** (`docs/testing.md:47`, confirmed). Whether bkit
  dogfoods a `test:real` or declares none is an open bkit-repo decision deferred to plan.

## Verdict Reasoning

CONCERNS, not PASS: the design is feasible and rides real, verified machinery — every step number,
gate, enum value, discovery pattern, and `debug-fetch`/`bkit:start/end`/testing.md anchor it cites
exists as described, and conventions are honoured. But two addressable buildability gaps remain: (1)
the run-tests command is mirrored in `.agents/workflows.md` (and a prose note) that the edit-point
list omits — a real drift risk the project explicitly treats as a bug; and (2) the design's premise
that build already runs `test:integration`/`test:e2e` is factually wrong (those are debug-only),
which undermines the "run last after cheap tiers" cost argument for build specifically. Neither is
fatal — the mechanism still works and both are fixable by enumerating the extra edit points and
correcting the premise. Not FAIL: nothing here is unbuildable in the current stack/scope.

## CRITICAL

- Add the `.agents/workflows.md` run-tests command mirrors to the edit-point list: the debug catalog
  row (line 646, `test test:integration test:e2e`), the build catalog row, and the § note (line 975).
  Appending `test:real` to the workflow steps without updating these mirrors drifts the canonical
  reference — the exact "two docs, same topic = bug" trap.
- Correct the design premise that build "already discovers `test:integration`/`test:e2e`." Build
  Step 13 runs only `lint typecheck test`; integration/e2e are debug-only. Restate the build path as
  appending `test:real` after `test` (not after an integration/e2e tier) and re-justify the
  "run-last cost" claim for build accordingly.

## OPTIONAL

- Confirm the `turbo run test:real --dry-run` detection against the pinned turbo version (or adopt
  the established "include the task name and let turbo no-op" pattern) before committing to the
  monorepo probe.
- Note the Gate 4 `DIAGNOSE_VERDICT in PASS|FAIL` narrowing relative to the diagnose prompt's
  `PASS|CONCERNS|FAIL`; ensure the reproduce mini-step's CONCERNS is recorded on `debug-reproduce`,
  not routed through Gate 4.
- Enumerate the full OBSERVE_MODE→`soak` guard list (the ~14 sites above) as explicit plan tasks to
  avoid a half-wired branch; the canonical boundary sentence alone does not enforce guard coverage.

## OUT OF SCOPE

- Whether the bkit repo grows its own `test:real` or declares none — bkit-repo dogfooding decision,
  defer to plan (must sit outside `bkit:start/end`).
- The per-attempt vs final-only cost-cap policy for paid endpoints — plan/operational decision, not
  a buildability concern.
- Mislabeled-mock-suite residual risk — inherent ceiling of consumer-agnostic enforcement, correctly
  accepted by the design; no buildability change can close it.
