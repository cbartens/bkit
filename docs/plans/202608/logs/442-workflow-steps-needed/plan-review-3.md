Verdict: CONCERNS
Failures: 6

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

No `{FID}-design.md` exists — this is a standalone plan, so design-coverage is traced against the issue's agreed-approach comment in `plan-input.md`, which the plan itself names as the statement of intent.

<!-- prettier-ignore -->
| Task | Surface edited | Symbols / schemas / keys changed | Consumers found by grep |
| --- | --- | --- | --- |
| 1 | `.bkit/templates/.bkit/scripts/bkit-status-route.sh` | new exported shell fn `route_append_step_skipped` | Every workflow skip arm (28 sites, Task 4). Ships via the core template walk — no `bkit-manifest.ts` row needed (verified: `.bkit/scripts/*` rows exist only for the `dependabot` / `lint` module files at `bkit-manifest.ts:723,741,745`, which are `CORE_TEMPLATE_PATH_EXCLUDE`d; assumption 4 in the plan holds) |
| 1, 3 | `status.jsonl` schema | new row `type: step-skipped`; new closed `decidedBy` enum | Readers: `.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34` (`BKIT_STATUS_FOLD`, the reducer workflows execute), `.bkit/src/bkit-status.ts` (`fold` / `parseStatus` / `StatusEvent`), `.bkit/scripts/bkit-counter-bus.sh:95` (`counter_count`, filters `type=="step-done"` — safe), `.bkit/src/bkit-status-hole-detector.ts`, `.bkit/src/bkit-telemetry*.ts`, `.bkit/workflows.md` §237 Event types |
| 3 | `.bkit/src/bkit-status.ts` | header comment only; `StatusEvent` union deliberately unchanged | `parseStatus` casts each parsed line to `StatusEvent`, so runtime is tolerant; only test fixtures feel the closed union |
| 4 | All five `.bkit/workflows/bkit-*.md` | 28 skip arms + 28 gate items | Rendered mirrors `.claude/commands/`, `.cursor/commands/`, `.opencode/commands/` (regenerated, Task 22); `.bkit/src/bkit-runtime-prose-audit.test.ts`, `bkit-counter-prose-audit.test.ts`, `bkit-block-locality-audit.test.ts`, `bkit-untrusted-input-coverage.test.ts`, `bkit-telemetry-workflow-writers.test.ts` all read this corpus. Conditional-step count independently verified: 28 (`plan` 2, `design` 3, `build` 9, `debug` 7, `ship` 7) |
| 6, 7 | `bkit-design.md` S7/S8 read lists; `bkit-plan.md` S6/S7/S8/S9/S10 read lists | `(if present)` qualifier; `DESIGN_CURRENT` / `PLAN_CURRENT` latest-present resolution | Also-affected read sites the plan does **not** list: `bkit-design.md:453` (S5 reads both reviews to compute `REVIEW_VERDICT` + `SPIKE`), `:505` (S6 spike reads `design-review-1.md`), `bkit-plan.md:499` (S5 reads all three reviews for `REVIEW_VERDICT` / `REVIEW_FAILURES`), `:602` (S7 reads both scope checks) |
| 8 | `.bkit/prompts/bkit-design-review-1.md`, `-2.md` | new `Failures:` header line | `.bkit/src/bkit-verdict-vocabulary.test.ts` (exists — verified), `bkit-design.md` S5 gate + `step-done.failures`, `validateInvariants` in `bkit-status.ts:49` (PASS ⇒ failures = 0 is asserted there) |
| 9 | `SPIKE`, `COMPLEXITY_VERDICT` continuity | hard-set on skip | `SPIKE` is an orchestrator **prose** variable substituted as `{SPIKE}` (`bkit-design.md:453,455,486,501,559`); `COMPLEXITY_VERDICT` gates `bkit-plan.md:743` |
| 11, 12 | `.bkit/prompts/bkit-design-generate.md` + `bkit-design.md` S5/S7/S8 | two new `##` sections; four `**Run only if**` predicates | Every downstream reader of `design-v*.md`; the canonical `{FID}-design.md` inherits both sections and every `/bkit-plan` run consuming a design |
| 13 | `bkit-plan.md` S5/S6/S8; consumer `package.json` `bkit.sensitivePaths` | new consumer config key | `bkit.*` keys are outside the managed surface (`bkit-config-keys.test.ts` asserts uninstall never strips them) — safe; but the key has no documented home (`bkit.githubProject` is documented in `README.md`) |
| 14 | `[DELETE] .bkit/prompts/bkit-plan-scope-check-2.md` | prompt file + Step 7 collapse | Live references found: `bkit-plan.md:597,600,602,610,630,631,633,648`; `.bkit/prompts.md`; **`.bkit/workflows.md:511,540,654,829`**; **`.bkit/comparison.md:173`**; `.bkit/version` `canonicalHashes` ×3 (`.claude`/`.cursor`/`.opencode` mirror entries); mirrors `.{claude,cursor,opencode}/agents/bkit-plan-scope-check-2.md`. Mirror orphan pruning **is** implemented (`bkit-install.ts:808-832` for `.claude`/`.cursor` under the `WRITE_DIRS` allowlist; `bkit-modules.ts:147-165` and `:674-683` for `.opencode/agents`, bkit-prefix only) — consumers do lose the stale agent file on upgrade |
| 16, 17 | `.bkit/prompts/bkit-plan-generate.md`; `bkit-plan.md` new Step 3.5 | new artifact `plan-escalation.md`; `PLAN_ESCALATE`; step keys `plan-escalate` / `design-escalated` | No step-number regex parser exists in `.bkit/src` (only one literal, `bkit-telemetry-workflow-writers.test.ts:139`, and it targets `bkit-build.md` Step 13) — so `3.5` is mechanically safe. `.bkit/workflows.md:827` carries a per-step `/bkit-plan` table that gains no row in the plan's doc list |
| 18 | `bkit-debug.md` Step 3 sub-step 7 | new outcome label `NO-REPRO` | `bkit-auto.md` CI mode (unchanged by design); `debug-run-tests` `step-done` row consumers; the soak ladder (`route_last_strategy`) is untouched |

High-risk surfaces flagged explicitly: the shared shell primitive (`bkit-status-route.sh`, sourced by every workflow), the `status.jsonl` event schema (a shipped persistent-state contract with two independent reducers), the shipped-prompt deletion (a public artifact removed from consumer repos), and the design-doc output format (`bkit-design-generate.md`, whose sections ride into every canonical design).

## CRITICAL

**R1 — Per-lens skipping has no mechanism; every construct the plan builds is step-level.**
The predicates in wave 3 skip an individual **subagent inside** a step: `bkit-plan.md` Step 5 invokes `plan-review-1/-2/-3` as three bullets in one step (`:486-:497`), and `bkit-design.md` Step 5 invokes both reviewers in one step (`:444-:451`). But everything wave 1 builds is keyed to a whole step — the `**Run only if**` line sits at the top of a step, the `step-skipped` row's `step` field is defined in `Data Schema Changes` as "the same kebab slug the step's `step-done` row would carry (`plan-review`, …)", and the gate gains "one item" per step. Three concrete consequences:

- The `Concrete Example` writes rows for `plan-review-2` and `plan-review-3`, which are **not** `step-done` slugs — it contradicts the schema the same plan defines four sections earlier. Nothing says which is right.
- One step now emits both a `step-done` (`plan-review`, for the lens that ran) and one or two `step-skipped` rows. That combination is undefined in `.bkit/workflows.md` § Event types and untested by any matrix row.
- Task 5's audit derives its subject set from `grep -nE '^\*\*(Skip if|Run only if)'` — a **line-start** match. A per-lens condition written inside a step body cannot match that regex, so the wave-3 predicates are invisible to the guard that is supposed to prove they record their skips. The guard passes while the new skips go unrecorded, which is precisely the failure this plan exists to prevent.

Resolve by naming the sub-step construct explicitly (its prose shape, its `step` value, its gate item) and by extending Task 5's derivation to find it.

**R2 — Skipping a Step-5 lens breaks the step that skipped it, and the sites are not in the runbook.**
Task 6 changes seven read entries (design S7 ×2, plan S6 ×3, plan S8 ×2). The sites that actually fail first are not among them:

- `bkit-plan.md:499` — "Read `plan-review-1.md`, `plan-review-2.md`, and `plan-review-3.md` … compute `REVIEW_VERDICT` = worst of the three and `REVIEW_FAILURES` = sum of failures from each". With two lenses skipped this reads two files that do not exist; nothing says the derivation collapses to whichever ran.
- `bkit-plan.md:507` — the `step-done` row hardcodes all three artifact paths in `artifacts[]`; likewise `bkit-design.md:463` for both reviews.
- `bkit-plan.md:527-:533` — Gate 5 asserts "Subagents invoked (`@bkit-plan-review-1`, `-2`, `-3`, no inline work)", "Artifacts written (… non-empty)" and "No PENDING placeholders remain (…)". A skipped lens fails all three. The plan's rule "a skipped step's gate is recorded as skipped" does not help: this step **ran**.
- `bkit-design.md:453`, `:463`, `:483-:487` — same shape, plus `SPIKE` extraction from a file that may not exist, whose invalid-value arm at `:455` re-invokes the very subagent the predicate just skipped.
- `bkit-design.md:505` — Step 6's read list names `design-review-1.md`, a skippable step's output, so the matrix row "Every subagent `Read:` entry naming an artifact a skippable step produces carries `(if present)`" demands it too. Task 6 does not include it, so Task 10's guard either reds on a site no task edits, or it is quietly narrower than the row it claims to cover.

Task 6's `Done when` ("at least seven higher") therefore under-specifies its own invariant.

**R3 — Task 9 and Task 13 contradict each other, and the continuity hard-set can be written in a form that is inert at runtime.**
Task 9 requires "plan Step 9's skip arm contains `COMPLEXITY_VERDICT` = `SINGLE`"; Task 13 requires "Step 9 has no `**Run only if**`" (Open Question 6, default A). A step with no condition has no skip arm, so the matrix row "Each sole-emitter variable (`SPIKE`, `COMPLEXITY_VERDICT`) is assigned … on its emitter's skip arm" is unsatisfiable as written and Task 15's guard cannot go green. One of the two tasks has to move.

Separately, the runtime shape of the hard-set is unpinned. In the corpus these are orchestrator **prose** variables substituted into fences as `{SPIKE}` / `{COMPLEXITY_VERDICT}` (see `bkit-design.md:453,486,501,511` and `bkit-plan.md:743,753`). The plan renders the skip arm as a fenced bash block, and Task 9's `Done when` ("the skip arm contains `SPIKE` = FALSE") is satisfied by a shell assignment inside that fence — which `docs/knowledge.jsonl:71` (`363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`, and the still-OPEN `363-auto-route-suffix-github-env-handoff-inert-across-cloud-tool-calls` row in `related-failures.md`) records as silently inert at the next tool call. That is a re-entry into a known-broken pattern, and Task 15's guard ("assigned value is a member of the enum") would pass on the broken form. State that the assignment is a prose variable outside the fence, and have the guard assert placement.

**R4 — The acceptance contract the human is asked to confirm cannot be met by the plan's own predicates.**
`Success Criteria` and the `Concrete Example` promise four subagent invocations; `Manual Verification` Step 1 asks the owner to confirm "exactly four 🧠 steps invoked a subagent". Under the plan's own wave-3 tables:

- `plan-review-3` runs when `Architecture & Component Changes` carries `>= 1` `[MODIFY]` or `[DELETE]` row. The `Concrete Example`'s own scenario says the draft carries "one `[MODIFY]` row" — so the predicate is TRUE and the lens runs. Step 3 of that example nonetheless records a skip for it, on a rationale ("touches no exported symbol") that is not the predicate the plan implements.
- `complexity-check` is unconditional under Open Question 6 default A, which the wave-3 note concedes ("four … **plus** the unconditional `complexity-check`").

The narrow path is six invocations, not four. Three sections of the plan give three different numbers, and no `Derived Test Matrix` row asserts an invocation count at all, so nothing catches the drift. Fix the number in one place and add a row that observes it.

**R5 — The `bkit-plan-scope-check-2` deletion misses two shipped docs, and Task 14's own `Done when` proves it.**
`grep` finds live references at `.bkit/workflows.md:511` (artifact-shape table), `:540` (artifact inventory), `:654` (subagent table) and `:829` (the per-step `/bkit-plan` table), plus `.bkit/comparison.md:173` (a shipped comparison row describing the agent). Neither file appears in Task 14's edit list, and `Documentation Updates` scopes `.bkit/workflows.md` to § Event types, § Common Workflow Anatomy and § Rationale only. Task 14's `Done when` — "`grep -rc 'scope-check-2' .bkit/ docs/` returns zero matches outside `docs/plans/`" — is therefore unachievable by the tasks as written, and `.bkit/version` `canonicalHashes` carries three further entries that no task or gate addresses.

The good news, which the plan should record rather than leave unstated: mirror orphan pruning already exists for all three hosts, so a consumer's `.claude`/`.cursor`/`.opencode` agent file is removed on upgrade. Add the corresponding assertion to Task 22's scratch-consumer `Done when` so the deletion's consumer-side effect is actually observed, not assumed.

**R6 — Fold-neutrality is asserted only against the reference reducer, not the one workflows execute.**
`.bkit/src/bkit-status.ts:10-12` states plainly that it is the _reference_ reducer and that "the bkit workflows execute an inline jq filter that mirrors `fold`". That filter is `BKIT_STATUS_FOLD` in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34`. The matrix's fold row targets `.bkit/src/bkit-status.test.ts` only; nothing exercises the shell reducer with a `step-skipped` row, which is the copy that decides whether a real run's attempt counters stay honest. `tests/counter-derive.bats` covers `counter_count` (which filters `type=="step-done"`, so it is safe) but not the fold's run array. Add a shell-tier row over `BKIT_STATUS_FOLD`.

While there: both reducers key non-`step-done` events on `W {type} {workflow} {at}` with **no** `step` field (`bkit-status-fold.sh:34`, `bkit-status.ts:62-65`). Two lenses skipping in the same wall-clock second inside one workflow — exactly the plan Step 5 fan-out case — collapse to one event in the deduped stream. Harmless today because the reducer discards them, but it bounds what the future skip-reading consumer named in `Future-phase recommendations` can ever see, and the `Edge Cases` row that reasons about duplicate skip rows does not cover it.

## OPTIONAL

- Write the fold-neutrality case through `parseStatus(raw)` rather than constructing a `StatusEvent`. `StatusEvent` (`bkit-status.ts:42-47`) is a closed union with no member for `runtime-resolved` / `transport-fallback` / `close-transport`, so a hand-built `step-skipped` fixture needs a cast — and Gate 2 forbids `as any`. `parseStatus` casts internally (`:139`), so a raw NDJSON string fixture keeps the test honest and cast-free.
- Have `route_append_step_skipped` validate `WORKFLOW` against `design|plan|build|debug|ship` in the same `case` as `DECIDED_BY`. The schema declares it an enum; Task 1 only asserts non-empty, so a typo'd workflow writes a row no reader will ever match.
- Add a Task-22 `Done when` clause asserting the scratch consumer carries no `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` or `.opencode/agents/` after upgrade — that is the observable proof the prune path fired.
- Document `bkit.sensitivePaths` where `bkit.githubProject` is documented (`README.md`). A consumer-facing config key with no documented home is invisible to the people expected to set it.
- The `Edge Cases` row "escalation close is idempotent — it never creates a second design" has no runbook task and no matrix row. Either make Task 17 state the idempotency mechanism or drop the claim.
- Consider asserting in Task 5's guard that each `reason` string names an absent input rather than a size judgement. The schema states the rule ("never a size judgement") and nothing enforces it; a `reason` of `"small change"` would pass every check the plan defines.

## OUT OF SCOPE

- Extending the status-hole detector to read `step-skipped` rows instead of inferring absence — correctly parked against the existing deferral `384-promote-status-hole-detector-from-advisory-to-gate` and the new `442-status-hole-detector-beyond-ship` row.
- A per-workflow rollback primitive for shipped `.bkit/workflows/*` changes (deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`); the plan's whole-commit revert plus mirror regen is the right current answer.
- Adding `.bkit/prompts` to the install prune allowlist, or widening `WRITE_DIRS` beyond the four mirror dirs. Out of this plan's remit; worth its own issue if a consumer is ever found carrying an orphaned prompt source.
- Adding `step` to the fold's non-`step-done` dedup key. Touching a load-bearing dedup identity is a change to `#58`'s counter contract and belongs with `58-status-jsonl-run-boundary-keys-on-last-run-overall`, not here — R6 asks only that the collapse be recorded.
