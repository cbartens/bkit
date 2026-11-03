Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

Reviewed: `design-v1-draft.md` against `design-input-1.md` (session prompt `#699` newest; grill answers = newest text) and the engine source at HEAD `27abf0829`. Every claim below is verified against source, not assumed.

## Prior Art Search

Capabilities the design requires, in-repo first. Verdict column is mine; `design` column is the draft's own claim.

<!-- prettier-ignore -->
| Capability | What exists (path, maturity, adoption) | Fit | Rec. | Design |
| --- | --- | --- | --- | --- |
| md-derived expected set + advisory report | `checks/status-holes.ts` (`deriveExpectedStepSetFromSource`, `checkSourceCanonicalDrift`, `classifyRun`, `computeMandatoryForPath`, `detectHoles`, `formatAdvisoryReport`, exit-0 `main`); unit-tested `status-holes.test.ts`; CI-wired | Hard-coded to `ship-`: literal regex `(?:step:"\|--step=)(ship-[a-z-]+)` (L145, L170) and a frozen `SHIP_STEP_ORDER` (L40-55) + three ship-only skip sets. Generalising means parameterising the prefix and swapping the canonical set for `WORKFLOW_STEPS[workflow]`. `classifyRun`/`computeMandatoryForPath` are ship path-model, not reusable as-is. | `EXTEND-EXISTING` | EXTEND |
| md section + `"{BKIT}"` call parser | `audits/workflows/workflow-shape.test.ts`: `stepSections` (L632), `callWords` (L65, quote- and operator-aware), `unknownCalls` (L87) | `stepSections`/`callWords` are pure text helpers — clean to promote. `unknownCalls` is not: it imports `COMMANDS` from `commands/registry`. Keep it in the test, or `checks/` gains a `checks → commands/registry` edge that pulls all 24 command modules into the check. | `ADAPT` | EXTEND |
| Step universe (numbers, titles, `--step=` keys) | `commands/workflow/step-table.ts` `WORKFLOW_STEPS` (`design/plan/build/debug/ship`), held to the md headings + `--step=` calls by `workflow-shape.test.ts` "the step table matches the step headings" | Genuinely drift-gated, so it is not a second source of truth. Note `resumeAt`/`resumeOnVerdict` encode *resume* semantics, not *skip* semantics — see CRITICAL 1. | `EXTEND-EXISTING` | EXTEND |
| `status.jsonl` read / write | `commands/workflow/status.ts` (`readStatusRows`, `readStatusEvents`, `readRuns`, `FILE_FLAG`, `WORKFLOW_FLAG`), `ledgers/status.ts` (`appendLine`, `fold`, `statusTimestamp`, `ENGINE_ACTION`) | `readStatusRows` accepts any `type`; `fold` ignores unknown types (L98-121). Both new row types are additive with no reader change. | `USE-AS-IS` | EXTEND |
| Dedup-by-key idiom for the friction row | `ledgers/status.ts` `actionKey`/`actionHash`/`alreadyDone`/`recordAction` is the `engine-action` dedup, in `status.jsonl`. Friction dedup is `ledgers/telemetry.ts` `identity()` (`kind + repo + key`) + same-key append. `recurrenceCount` is declared (`telemetry.ts` L658) and **computed by nothing** (grep: 2 hits, both declaration/test fixture) | The design cites the `engine-action` idiom and says recurrence "raises `recurrenceCount` (the existing dedup idiom)". There is no such existing idiom for friction; the writer must read prior rows and compute `recurrenceCount + 1`, or the field stays absent. `appendLedgerRows` never reads back (L1171). | `ADAPT` | EXTEND |
| Friction ledger write | `commands/workflow/ledgers.ts` `appendLedgerRows` (L1174) + `ledgers/telemetry.ts` `validate`/`writerProblem`/`mintTs`/`APPEND_LEDGERS` | `KIND_WRITERS.friction.orchestrators = {design,plan,build,debug,ship}` (L413-416) — no `KIND_WRITERS` change needed when `by.workflow` is the active run's workflow. `appendLedgerRows` **throws** on refusal and requires `by.step` (see CRITICAL 4), `severity`, `kind`, and no caller `ts`. | `EXTEND-EXISTING` | EXTEND |
| Command dispatch seam | `commands/lib.ts` `runCommand` (L317) — the single dispatch for all 24 registered nouns; returns the exit code (`main()` sets `process.exitCode`, `cli.ts` L818-823); `spec.exitCodes` in scope at L344 | Verified, not assumed: all 358 `"{BKIT}" <noun> <verb>` call sites across the six workflow mds use registered nouns, and no classic verb is called that way (`comply\|check\|doctor\|install\|uninstall\|upgrade\|telemetry\|tips\|cursor\|opencode\|help`: zero hits). `runCommand` is the right and only seam. | `EXTEND-EXISTING` | EXTEND |
| Command registration + conventions | `commands/registry.ts`, `commands/conventions.test.ts` (test file beside each source; reachable; exit codes listed in `--help`; writes only via `ctx.log`/`ctx.emit`) | A new `commands/workflow/completeness.ts` must ship `completeness.test.ts` beside it, be added to `COMMANDS`, and list every exit code its source can return. | `EXTEND-EXISTING` | EXTEND |
| Run attribution from cwd, no new state | `lib.ts` `statusLocation`/`statusRelPath`; `locks.ts` `monthBuckets`/`resolveMonth`/`workflowLockPath`/`readRunsLenient`; `fids.ts` `logged`/`freeFid` (a `docs/plans/*/logs/*` walk + `fold`) | No helper answers "the active run from this cwd". The pattern exists (`fids.ts` L124-161) but is FID-scoped. A cwd-scoped scan must walk months × FIDs and `fold` each log — 119/358 call sites carry `--file=`; the rest need it. Bounded to the cwd's toplevel (usually the run's worktree), so small — but it must be pinned (see OPTIONAL 3). | `ADAPT` | EXTEND |
| Current-step resolution for the friction key | `step-table.ts` `resumePoint` (used by `status resume`) | Exists and works. The design deliberately degrades to noun+verb instead (Option A). | `ADAPT` | EXTEND |
| `status.jsonl` row-type table | `.bkit/workflows.md` § `status.jsonl` (row-type table ~L260-279; write/read pattern table L288-298) | Additive doc edit. | `EXTEND-EXISTING` | EXTEND |
| Step-timing + harvest run windows | `commands/workflow/run-facts.ts` `MARK_ROWS` (L354) **and a second copy in `scripts/harvest/bkit-harvest.mjs` (L1478)**, pinned equal by `bkit-harvest.test.mjs` "MARK_ROWS is the engine's" (L2937) | Both copies plus the parity test must change together, or the harvest test fails. The design names only `run-facts.ts`. Also `splitRuns` sets `run.last` on every row (L1199) and `runRows` derives `lastActivity` from it (L1683), and `stepMs` filters on `MARK_ROWS` (L1621). | `EXTEND-EXISTING` | EXTEND (incomplete list) |
| Advisory CI wiring | `.github/workflows/bkit-ci.yml` "Check Status Holes" (L510) → `pnpm bkit:audit:status \|\| true` → `tsx .bkit/core/engine/checks/status-holes.ts docs/plans/*/logs/*/status.jsonl`; `docs/testing.md` § Tier-3 fail-open advisory channel (L557-566) | Repointing the script is a one-line change; `docs/testing.md` L559 and L566 name `bkit-ship.md` and must be generalised in the same change. | `EXTEND-EXISTING` | EXTEND |
| `completeness` noun + `check` verb | None. Searched `registry.ts` (24 nouns), `cli.ts` `CLASSIC_VERBS`, and the `status-holes.ts` CLI (a `tsx` script, not a verb) | No command reports step/command completeness. `bkit status holes` would reuse the existing `status` noun; Q13 settled a new noun, so the surface itself is a settled choice, and the *logic* must be the extended `status-holes` module, never a reimplementation. | `NEW` (verb only) | NEW |
| `engine-call` + `completeness` row types | Nearest is `engine-action` (`{type, action, key, hash, ref, at}`), a dedup guard written only by the acting verb, requiring key+hash+ref | Different semantics (guard vs journal). No fit. | `NEW` | NEW |

No capability is served by a parallel implementation. The two `NEW` rows are a verb and two additive row types, both forced by settled Q6/Q8/Q13.

**Prior-art claims I could not substantiate.** The draft's Decisions row says "all 22 distinct `"{BKIT}"` calls in the workflow prose are registered `bkit <noun> <verb>` commands". The count is wrong: there are **21 distinct nouns** and **79 distinct noun+verb pairs** across 358 call sites. 22 is the count of registered _noun commands_. The substance holds (every noun used is registered; no classic verb is called) — the number should be corrected so the verification reads honestly.

## Stack Feasibility

Buildable. TypeScript on Node ≥24, Vitest, pnpm — all inside `.bkit/core/engine/`. No new dependency, no new runtime, no schema migration (both rows are additive; `fold` and `readStatusRows` already ignore unknown types).

Constraints the design must carry into the plan:

- **`dist/` is committed and gated.** `pnpm bkit:check:dist` (`rm -rf dist && tsc && git diff --exit-code dist/`) fails CI on drift. Engine changes require `pnpm build` and a committed `dist/`.
- **`docs/capabilities.md` is generated and gated.** CI rebuilds the module map with graphify and fails on drift. A new `checks/completeness.ts` + `commands/workflow/completeness.ts` changes it; `pnpm graph:rollup` must run in the same change. Not named in the design.
- **`conventions.test.ts`**: a test file beside the new command, reachable from `COMMANDS`, every exit code listed in `--help`, no direct `process.stdout`/`process.exit`.
- **Prose gates**: `.bkit/workflows.md` and `docs/testing.md` edits run `pnpm format:check`, `format:tables:check`, `lint:prose`; `.bkit/authoring.md` gains the conditionality rule (CRITICAL 1).
- **Verification**: `pnpm vitest run` (full, never scoped) **and** a real dogfood run (`pnpm build` → `node dist/cli.js …` on a scratch consumer) per `.agents/rules.md` § Verify before complete.
- Not a monorepo in the workspace sense (`pnpm-workspace.yaml` holds policy only). Engine code is not mirrored, so no `.claude/`/`.cursor/`/`.opencode/` regeneration for this change.

No blocker: every piece of the mechanism has a verified in-repo idiom to copy.

## Library / API Evaluation

No new libraries; the evaluation is of the internal APIs the seam and checker consume.

<!-- prettier-ignore -->
| API | Maturity | Footprint / cost | Types | License |
| --- | --- | --- | --- | --- |
| `commands/lib.ts` `runCommand` | single dispatch for 24 nouns, covered by `lib.test.ts` + `conventions.test.ts` | hot path of every command in every consumer repo; the seam adds a git spawn (`repoRoot`) + a resolve + two `appendFileSync` calls per command | `Io`, `RunContext`, `VerbSpec.exitCodes` already exported | MIT (repo) |
| `ledgers/status.ts` `appendLine` / `fold` / `statusTimestamp` | canonical reducer, unit-tested | pure; `appendLine` is serialisation only — the caller appends | `StatusEvent` / `StatusRow` exported | MIT |
| `ledgers/telemetry.ts` `validate` / `writerProblem` / `mintTs` / `APPEND_LEDGERS` | canonical telemetry codec, heavily tested | pure + `fs`; **no `lib.ts` import**, so a friction writer built on these avoids a cycle | `FrictionPayload`, `TelemetrySeverity`, `KindWriters` exported | MIT |
| `commands/workflow/ledgers.ts` `appendLedgerRows` | tested, used by `bkit ledgers append` | **imports `../lib.js`** — importing it from `lib.ts` creates a cycle (OPTIONAL 1); throws `CommandError` on any refusal | `AppendResult` exported | MIT |
| `run-facts.ts` `MARK_ROWS` | 3-entry set, mirrored in the harvest script and pinned by test | one-line change in two places + the parity test | `ReadonlySet<string>` | MIT |

Bundle/binary footprint is not a concern (Node CLI; `dist/` grows by two small modules). No types gap.

## Integration Risk

**Blast radius — highest available.** The seam sits on `runCommand`, which every one of the 24 nouns in every consumer repo passes through. A bug that escapes the swallow is a CLI-wide outage, not a workflow-only one. The design's fail-safe contract (nested try/finally, total swallow, one stderr line per swallow, exit-code-passthrough test) is the whole design's load-bearing guarantee and must be the first thing built and tested.

**Systems touched.**

<!-- prettier-ignore -->
| System | Effect | Risk |
| --- | --- | --- |
| `runCommand` dispatch | journal on entry, friction on unexpected exit/throw | CLI-wide; every consumer repo |
| `status.jsonl` | ~50-100 extra rows per run (build names 104 `{BKIT}` literals; not all execute) | grows the SoT file; `merge=union` interleave surface grows |
| `fold` / `readStatusRows` | none (unknown types ignored) | low |
| `run-facts.ts` `stepsBlock` / `ciList` / `runStatusRows` | `engine-call` rows between `step-done` rows chop step minutes unless `MARK_ROWS` is fixed | silent telemetry corruption if missed |
| `scripts/harvest/bkit-harvest.mjs` | its own `MARK_ROWS` copy is asserted equal to the engine's; `splitRuns`/`runRows`/`lastActivity`/`afterEnd` read the same rows | the harvest test fails loudly — but the design does not name the file |
| `workflows.ts` `closeWorkflow` | inserts the `completeness` row before `workflow-done` (L1145) — feasible; `runRowsOf` at L1154 is computed after, so the row must be in `MARK_ROWS` | medium |
| `workflows.ts` `start` | one warning line; must go to stderr (`ctx.log`) — stdout is the single output object the workflow parses | low |
| `commands/conventions.test.ts` | new command must satisfy source/test/reachability/exit-code rules | low |
| `docs/testing.md` § Tier-3 | names `bkit-ship.md`; must generalise with the code | low |
| `docs/capabilities.md` | regenerated (graphify gate) | low, but a CI failure if forgotten |
| `dist/` | rebuilt + committed | low, but a CI failure if forgotten |

**Monorepo fit.** Not a monorepo in the workspace sense; the engine lives under `.bkit/core/engine/` and is not mirrored. `commands/workflow/` is the correct home for the new verb; `checks/` is the correct home for the evolved detector (matching `checks/status-holes.ts`).

**Ordering.** The `completeness` row must land before `workflow-done` (so it is part of the run, not an after-end row) and `MARK_ROWS` must gain both types in the same change as the rows first appear, or the first closed run is already mis-timed.

## PoC Approach

Throwaway probe on a scratch consumer repo; no product code.

1. Hand-write a minimal `status.jsonl`: `workflow-started` (`build`), two `step-done` rows, no `workflow-done`.
2. Add the seam behind a flag. From the run's worktree run three `bkit` commands — two with `--file=`, one without — and assert exactly three `engine-call` rows land in that run's log with `{noun, verb, flags}` (flag **names** only), attributed to that run.
3. Force one command to exit 1; assert one `friction` row in the run's own `.bkit/friction.jsonl` (survives `validate` + `writerProblem`), and none on exits 81 / 82 / 2.
4. Make the journal write throw; assert the exit code is unchanged and one stderr line is emitted.
5. Run `bkit completeness check --workflow=build --file=…`; assert exit 0 and a `completeness` row carrying per-hole evidence.
6. Time the resolve-or-skip path against the repo's own `docs/plans/*/logs/*/status.jsonl` corpus.
7. Run `stepsBlock` with and without the two types in `MARK_ROWS`; assert identical per-step minutes.

Roughly 150 lines of probe code; deleted afterwards.

## Unknowns & Blockers

Each is settleable only by running code.

1. **Step-hole false-positive rate.** Can conditionality be derived from the md with zero false step holes across all five workflows? 23 `**Run only if**` sites plus one `(Path B only)` heading must all be classified. Needs the checker run against real corpus runs (and fixtures) to count false holes.
2. **Positional attribution correctness.** Does "calls between two `step-done` rows belong to the step in progress" bucket correctly under a `merge=union` interleave, a group loop, or a step whose row was never written? Needs the corpus.
3. **Hot-path cost.** The synchronous resolve + append on every command, with ~2/3 of call sites lacking `--file=`. Needs measurement on a realistic corpus.
4. **Reader stability.** Does adding both types to `MARK_ROWS` leave `stepsBlock`, `ciList` and the harvest's `afterEnd`/`lastActivity`/`stepMs` byte-identical on the existing corpus? Needs a before/after run.
5. **Friction write correctness end-to-end.** Does a friction row written by the engine survive `ledgers commit` into the run's commit (correct root) and reach `pnpm harvest`'s `.bkit/friction.jsonl` read?

## Verdict Reasoning

`CONCERNS`, not `FAIL`. The architecture is sound and buildable: every part has a verified in-repo idiom to extend, the seam sits at the one dispatch point that provably covers all 358 `{BKIT}` call sites, the row types are additive to a reader that already ignores unknown types, and no new dependency, schema or migration is introduced. The three-lens convergence on Approach A is corroborated by the source.

It is not `PASS` because four load-bearing details are under-specified or self-contradictory and would produce a feature that fails its own success criteria if built literally:

- the step-hole conditionality rule names markers that are not the ones the workflows use (CRITICAL 1);
- the chosen friction exclusion set contradicts the rationale for choosing it, and would write a row on every routine usage error (CRITICAL 2);
- the friction write root is unspecified, and the natural reading lands rows outside the run's tree (CRITICAL 3);
- the friction row's `by.step` is mandatory but left undefined on exactly the calls the design expects to degrade (CRITICAL 4).

All four are addressable inside the chosen approach, with no scope change and no new artifact. Two further items are correctness-of-citation rather than design-shape: the friction dedup/recurrence mechanism is mis-cited (the `engine-action` idiom does not apply, and nothing computes `recurrenceCount`), and the harvest `MARK_ROWS` copy plus its parity test are missing from the reader-surgery list.

`Spike: true` — the five unknowns above are measurable only by executing the checker, the seam and the readers against real corpus runs.

## CRITICAL

1. **Step-hole conditionality must key on `**Run only if**` (the step section's first body line) and heading markers like `(Path B only)` — not the markers the design names.** The draft lists "`Failure Path` / `Route:` / 'Path X only' sections" plus `resumeAt`/`resumeOnVerdict` on `WORKFLOW_STEPS`. Verified: the workflows use `**Run only if**` at the top of every conditional step section — 3 in design (e.g. L387 `Step 7 — Spike`: "**Run only if** Step 6 `REVIEW_SPIKE` = true"), 1 in plan, 5 in build (e.g. L565 `Step 8 — Plan Gaps Remediate`), 10 in debug, 4 in ship (e.g. L352 `Step 4 — Integrate (Path B only)`) — 23 sites. `**Skip if**` appears 54 times but is overwhelmingly _sub-step_ and tracker guards, so it is **not** a step-level signal and must not be read as one. `resumeAt`/`resumeOnVerdict` encode resume semantics, not skip semantics, and cover none of these sites. Without this rule the checker reports a step hole for every un-run conditional step (`design-spike` when `REVIEW_SPIKE` = false, `build-plan-gaps-remediate`, `debug-failure-reproduce`, `ship-conflict-resolve`, …), so the `holey` warning fires on nearly every run — the exact fatigue failure the design's own Decision row invokes to justify the hole-class split, and a direct contradiction of Acceptance Scenario criterion 2. Name the marker, make it an explicit authoring rule in `.bkit/authoring.md` § Workflows Only, and pin it with a per-workflow fixture.

2. **The friction exclusion set as specified contradicts its own rationale, and writes a `tool-failure` row on every routine usage error.** The Decision row says the literal set is wrong because "exits 1 (NO), 2 (USAGE) and 82 (NEEDS_HUMAN) are routine … the noise that gets a detector muted". Option A — the stated default — then excludes only `{0, 1, 80, 81, 82}`, so exit 2 is _not_ excluded and "everything else (exit 2, undeclared codes, signal deaths, throws) writes a row". Exit 2 is thrown by `parseFlags` for an unknown flag, a duplicate flag, a missing required flag, and by `refuseUnsubstituted` for any flag still holding a `{UPPER}` placeholder — routine authoring mistakes in workflow prose. The design must either exclude 2 (derive the set from `SHARED_EXIT_CODES`, which is `{0,1,2,80,81,82}` — the reading its own rationale implies) or state why 2 is signal. As written, the two statements cannot both be implemented.

3. **The friction write root is unspecified, and the obvious choice (`repoRoot`) puts rows outside the run's tree.** `appendLedgerRows(root, …)` needs a root, and `repoRoot(cwd)` resolves `--git-common-dir`'s parent — the **main checkout** even when called from `.worktrees/{fid}`. A design/plan/build/debug run commits `status.jsonl` and `.bkit/friction.jsonl` from its worktree; rows written to the main checkout's `.bkit/friction.jsonl` never ride the run's commits, leave the main checkout dirty mid-run, and can be swept by another `ledgers commit`. The workflow prose's own `bkit ledgers append` defaults `--root` to cwd (the worktree), so the engine must match. Pin the root to the active run's own book root — the same root `statusLocation` resolves for the run — and say so in the design.

4. **`by.step` is mandatory on every telemetry row, but the design leaves it undefined on exactly the calls it expects to degrade.** `validate` requires `by.step` to be a non-empty string (`telemetry.ts` L1534-1536). The friction dedup key deliberately degrades to `<noun>-<verb>` when no `--step=` is present, and the design lists the calls that have none (`ledgers append`, `branches land`, `repo …`, `status row`). Nothing says what `by.step` holds there. A row without it is refused by `validate`, thrown by `appendLedgerRows`, and swallowed by the seam — so the feature silently writes no friction row, defeating success criterion 3 on the calls most likely to fail. Specify the `by.step` value for the unknown-step case (the noun+verb, or a fixed sentinel) and pin it with a test.

## OPTIONAL

1. **Avoid a `commands/lib.ts` ↔ `commands/workflow/ledgers.ts` import cycle.** The design writes friction "via `appendLedgerRows`", but that module imports `../lib.js` (L28-36). Importing it from `lib.ts` creates a cycle in the single most-imported module of the engine, in a repo with no cycle detection (`grep` for madge/dependency-cruiser: none). Runtime tolerates it, but the cleaner build is to compose the row from `ledgers/telemetry.ts` primitives (`validate`, `writerProblem`, `mintTs`, `APPEND_LEDGERS` — none of which import `lib.ts`) and append it there, or to have the seam return the row for a caller to write.

2. **The harvest `MARK_ROWS` copy and its parity test are missing from the reader-surgery list.** `scripts/harvest/bkit-harvest.mjs` L1478 holds its own `new Set(["session","owner-pause","owner-answer"])`, asserted equal to the engine's by `bkit-harvest.test.mjs` L2937-2943. Both copies plus the test change together. Also audit `splitRuns` L1199 (`run.last` is set on every non-start row) and `runRows` L1683 (`lastActivity` derives from it) — post-close rows would shift `lastActivity`.

3. **Pin the attribution scan's scope and cost.** "The single `IN_PROGRESS` run discoverable from the cwd's git toplevel" is new code with no existing helper. 119 of 358 call sites carry `--file=`; the rest fall through to the scan. Scope the walk to the cwd's `--show-toplevel` (the run's worktree, a handful of logs) rather than the main checkout, cap it, and measure it (Unknown 3).

4. **`docs/capabilities.md` and `dist/` must be regenerated in the same change.** Both are CI-gated (`graphify` rollup; `pnpm bkit:check:dist`). Neither is named in the Components table.

5. **`docs/testing.md` § Tier-3 names `bkit-ship.md` (L559) and the ship-only test file (L566).** Generalising the detector requires editing both sentences in the same change; the design lists the CI step but not the doc.

6. **State that the `workflows start` warning goes to stderr.** A verb's stdout is its single output object, parsed by the workflow prose (`hold run as {RUN}`); the warning must use `ctx.log` (stderr, `[bkit-workflows]`-tagged), or the start output breaks.

7. **Fix the "22 distinct `"{BKIT}"` calls" figure.** It is 21 distinct nouns / 79 distinct noun+verb pairs across 358 call sites; 22 is the count of registered noun commands. The verification conclusion is unaffected; the number should read honestly.

8. **Reconcile the draft's `friction` example with the payload contract.** `FrictionPayload` and `.bkit/jsonl.md` L106 require `scope` (`bkit-repo|consumer|universal`); the example row omits it. `validate` is "minimal — structural", so it may not reject, but the documented shape must carry it.

## OUT OF SCOPE

- **Success axis on the verdict.** A required command that ran and failed still counts as present (the entry/exit split makes "journaled" mean _attempted_). The design names this deliberately; adding a success axis is future work.
- **Closing deferral `442-status-hole-detector-beyond-ship`.** The design claims to dissolve its premise. Verified: the premise ("each phase needs its own routing-branch model") is genuinely weakened — evidence holes need no path model, and step holes reduce to one marker rule (CRITICAL 1). Closing the deferral (same-`key` append, referencing this design) is a ship-time action, not a buildability item.
- **The pinned watermark in decision `384-tier3-promotion`.** Q15 settles no watermark; the departure is recorded. Not a buildability question.
- **Moving the journal to a sidecar.** Rejected Approach B; only revisited if the reader surgery proves invasive.
- **Rewriting `status-holes.ts`'s ship path model into a generic path model.** The design correctly avoids it; `classifyRun`/`computeMandatoryForPath` stay ship-shaped until evidence holes + the marker rule prove insufficient.
