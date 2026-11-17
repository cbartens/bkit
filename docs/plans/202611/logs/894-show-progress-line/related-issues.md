## #825 — Show a progress bar line after every workflow step (closed)

### Narrative

While a `/bkit-*` workflow runs, the owner can't easily tell how far along it is or how much is left. After every step, the workflow should show one progress line, with a bar first:

```text
Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3
Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3
```

The engine works out the line and the agent shows it word for word, so the agent never makes up a number.

**How the % is worked out:**

- Each step in the workflow's step list (`WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`) is one unit. Steps that share a number (e.g. build's `build-plan-tests` and `build-plan-tasks`, both Step 7) count as one unit.
- In build, Steps 7-9 run once per task group, so they count 3 units per group. With G groups, build's total is 6 + 3G + 7. G is read fresh from the plan every time (`parsePlanBlocks`), because a run adds groups partway through: challenge findings become new groups (Step 11), and so do test and challenge fixes taken at a Decision Pause, and verify fixes that push a group over its size cap.
- % = units up to and including the step that just finished ÷ total units.
- **When a loop goes back, the % goes back too.** A retry really does run those steps again, so the work left really has grown. Examples: debug going back to Run Tests, ship going back to Merge PR after a CI failure, build going back to Step 7 for new fix groups. The `Attempt` part of the line shows why the bar dropped.

**Line format:**

- `Progress: ` comes first, then a 10-cell bar (`█` filled, `░` empty, no spaces inside it), a space, then the %. That start is at most 25 characters (`Progress: ██████████ 100%`), so it fits on one line on any phone.
- Then, joined with ` · `, comes `Step {n}/{steps} {title}`. In build's group loop, `Group {g} of {G}` follows. When the attempt is above 1, `Attempt {a} of {max}` follows; it's just `Attempt {a}` when the step has no budget.
- Words are capitalised exactly as shown: `Progress`, `Step`, `Group`, `Attempt`.
- The text after the bar may wrap onto a second line on a narrow screen. The bar itself must never break across lines.
- It's shown as plain text, not in a code block, because a code block scrolls sideways on a phone instead of wrapping.

### Success Criteria

- After every step that writes a `step-done` row, in all five step-listed workflows (design, plan, build, debug, ship), the agent shows exactly the line the engine printed.
- The % is worked out by the engine from `status.jsonl` and the plan alone, so a run that resumes after a stop shows the same line it would have shown without the stop.
- In build, adding task groups partway through increases the total straight away, and `Group {g} of {G}` shows the new count.
- A loop going back makes the % go back, and the line shows `Attempt {a}`.
- On a 375px-wide phone screen, the `Progress: {bar} {pct}%` part never wraps, and only the text after it may go onto a second line (checked by screenshot in the Claude app).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Build before Step 4, so no plan yet | G counts as 1; the total corrects itself once the plan exists |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form) | Counts as done; the line still prints |
| Step that ends in `steps done` or `steps gate` rather than `steps finish` (Step 1, closes, ship Steps 3 and 9) | Prints the same line |
| Decision Pause and owner-pause rows | No line; they aren't steps |
| Run resumed after a stop | Line worked out again from `status.jsonl`; same values |
| `/bkit-auto` | No line of its own; shows the lines of the workflow it hands off to |
| Headless / cloud run | Line still printed; nothing waits on it |
| Last step of the workflow | 100%, and only there |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Units and % for a flat workflow (ship Step 10 of 14 → 71%, 7 filled cells) | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Build with 3 groups: Step 8 of group 2 → 50%, `Group 2 of 3` | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Build total grows when the plan gains groups after Step 11 | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| A loop back lowers the % and adds `Attempt {a} of {max}` | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Line starts `Progress: `, has a 10-cell bar with no spaces, and the bar part is <= 25 characters | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| `steps finish` and `steps done` print `progressLine` | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Engine works out and prints the line
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Work out a run's progress line from its status rows, its group count and its attempt budget
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.ts`: add `runProgress` next to `WORKFLOW_STEPS`, returning the % and the finished line
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: `parsePlanBlocks` for the group count
  - **DONE WHEN:** the five step-table tests in the matrix pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress flat workflow` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress build groups` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress groups added` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress loop back` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress bar width` fails on a missing `runProgress`
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Print the line from every call that writes a `step-done` row
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: emit `progressLine`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: `steps done` emits `progressLine` too
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: the attempt budget behind `counters max --point`
  - **UPDATE:** `.bkit/cli.md`: § `steps` output keys
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both calls print `progressLine`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finish prints progressLine` fails on a missing `progressLine` key
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `done prints progressLine` fails on a missing `progressLine` key
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->
### TASK GROUP 2: Workflows show the line
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Tell every workflow to show the printed line word for word after each step, as plain text and not in a code block
  - **UPDATE:** `.bkit/instructions.md`: § `workflow-narrate` clause, adding wording without removing any
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-auto.md`: the synced `**Narrate:**` bullet
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the instructions sync check reports no drift
  - **TEST FIRST:** n/a — prompt wording, covered by the instructions sync check
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Update the docs that describe narration and step endings
  - **UPDATE:** `.bkit/workflows.md`: **Narrate** row in the Protocol table
  - **UPDATE:** `CHANGELOG.md`: entry
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the docs name the progress line and where it comes from
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: the line prints when a step **finishes**, so `Step 8/16 Plan Verify` means Step 8 is done.
- Open: whether to add a short reason when the total grows, e.g. `· 2 groups added`. That needs the previous group count, which no status row records today.
- Assumed: 10 bar cells, so each cell is 10%.
- Assumed: the % is rounded to the nearest whole number, and filled cells = the % rounded to the nearest 10.

### Breaking Changes & Naming

- New output key `progressLine` on `steps finish` and `steps done`. It isn't called `progress`, to avoid confusion with the existing `counters progress` verb and `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`, which check whether a retry loop made headway.
- No existing key or row changes.

### Out of Scope

- Weighting steps by how long they take. Steps differ a lot (Step 7 is most of a build), but weighting would need measured timings.
- A live bar in a status line or app UI. This is a chat line only.

### References

- `.bkit/core/engine/commands/workflow/step-table.ts` § `WORKFLOW_STEPS`
- `.bkit/instructions.md` § `workflow-narrate`
- `.bkit/core/workflows/bkit-build.md` § Group Loop — Steps 7-9
- `.bkit/cli.md` § Step endings

## #641 — Label issues by workflow stage and next best workflow (closed)

### Narrative

An issue's labels should tell you two things at a glance: which workflow it is in, and what to run next.

- `bkit:design` / `bkit:plan` / `bkit:build` / `bkit:debug` / `bkit:ship` go on only when that workflow starts (full or lite). Starting the next workflow swaps the label, and ship's close swaps `bkit:ship` for `bkit:merged`. The label also names the next step: design leads to plan, plan to build, build and debug to ship.
- `bkit:failed` goes on next to the workflow label when a workflow fails, which means debug is next. Any workflow starting takes it off again.
- An issue that no workflow has started carries exactly one `next:<phase>` or `next:<phase>:lite` label naming the workflow to run. The first workflow to start removes it.

Before this change `bkit:debug` was an extra label that nothing ever removed, so shipped issues kept it. Linear also moved the issue to In Review the moment debug started. And `bkit:failed` stayed on through a re-run of the failed workflow. The lite workflows are renamed from `lite:design` to `design:lite` (and so on) to match the `next:<phase>:lite` labels.

### Success Criteria

- `bkit issues labels --phase=<any>` drops the other workflow labels, every `next:*` label and `bkit:failed`, and keeps `bkit:auto` and labels it doesn't recognise.
- `/bkit-debug` Step 1 sets `bkit:debug` as a workflow label (Linear In Progress), and `/bkit-ship` replaces it.
- `.agents/rules.md` § Tracker states the workflow, failure and next label rules, and no workflow doc contradicts them.
- Lite workflows are named `<phase>:lite` everywhere they ship, and they set the same workflow labels.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Failure Path with a `next:*` label present | `bkit:failed` added; `next:*` untouched (no workflow started) |
| `--phase=X --failed=on` | usage error (exit 2) |
| A label that only starts with "next", e.g. `nextjs` | kept |
| Ship's Failure Path after the PR already merged | `bkit:merged` plus `bkit:failed` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| A new phase drops the old phase, `next:*` and `bkit:failed`, and keeps `bkit:auto` and foreign labels | unit | `.bkit/core/engine/commands/workflow/issues.test.ts` |
| Debug is a phase: it replaces the phase it debugs and clears `bkit:failed` | unit | `.bkit/core/engine/commands/workflow/issues.test.ts` |
| A Failure Path keeps the phase label and leaves `next:*` alone | unit | `.bkit/core/engine/commands/workflow/issues.test.ts` |
| Shared label sentence matches the wording registry | unit | `.bkit/core/engine/tools/wording.test.ts` |

### Tasks

- [x] **Task 1:** `transitionLabels` treats `bkit:debug` as a phase, and a phase drops `next:*` and `bkit:failed`; `--debug` flag removed. **Done when:** issues tests pass. **Test first:** `.bkit/core/engine/commands/workflow/issues.test.ts` `debug is a phase: it replaces the phase it debugs and clears bkit:failed` fails on `remove`.
- [x] **Task 2:** Workflow label header in all six workflows, `/bkit-debug` Step 1 (`--phase=debug`), `.bkit/workflows.md` § Tracker Integration, `.bkit/trackers.md`, `.bkit/wording.md`. **Done when:** wording test passes and `bkit check` reports no drift. **Test first:** n/a — docs.
- [x] **Task 3:** Label rules in `.agents/rules.md` § Tracker; lite contract sets labels; `lite:<phase>` renamed to `<phase>:lite` in shipped docs, prompts and the issue template. **Done when:** prose lint passes. **Test first:** n/a — docs.
- [x] **Task 4:** Create the ten `next:*` labels on this repo. **Done when:** `gh label list` shows them. **Test first:** n/a — config.

### Breaking Changes & Naming

- `bkit issues labels --debug=on|off` is removed; use `--phase=debug`.
- Lite workflow names change from `lite:<phase>` to `<phase>:lite`.
- Issues that already carry a stale `bkit:debug` keep it until their next workflow starts. No migration.

### References

- `docs/decisions.jsonl` key `` `tracker-labels-debug-phase-next-labels` ``
- `.agents/rules.md` § Tracker workflow labels

Landed on `dev` in commit 7e02c52a (not pushed yet).

**What changed**

- `bkit:debug` is now a workflow label like the others: debug replaces `bkit:build` / `bkit:ship`, and ship replaces it. Shipped issues no longer keep a stale `bkit:debug`, and Linear stays In Progress while debug runs.
- Every workflow start clears `bkit:failed` and removes any `next:*` label. The label code (`bkit issues labels`) does this, so it holds no matter which workflow writes the labels.
- New rules in `.agents/rules.md` under Tracker: workflow labels, failure label, next labels. An issue no workflow has started carries exactly one `next:<phase>`, or `next:<phase>:lite` when a lite workflow is enough per `.bkit/lite.md` § When to use.
- Lite workflows are renamed `design:lite` … `ship:lite` (were `lite:design` … `lite:ship`) and set the same workflow labels as the full ones.
- The ten `next:*` labels now exist on this repo.

**Breaking:** `bkit issues labels --debug=on|off` is gone; use `--phase=debug`. Noted in the CHANGELOG.

**Checks:** typecheck, lint, formatting, prose lint and `bkit check` pass. The full test suite was run before the final wording fix; the label, wording and workflow tests (165) pass on the committed files.

**Why:** `docs/decisions.jsonl` key `tracker-labels-debug-phase-next-labels`.

## #55 — Design organise workflow step prompts (closed)

<!-- linear-import: BAR-143 -->
**Linear:** [BAR-143](https://linear.app/bartens/issue/BAR-143) · **Created:** 2026-05-06 · **Linear assignee:** christian@bartens.biz

---

## Problem

The design docs the current `bkit-design` workflow produces don't comment on how to best organise the work. There's no guidance on how the design should be broken down for execution, so the leap from a single design doc to multiple plans is unstructured.

## Proposal

Add a new step to the design workflow — **Design Organise** (`design-organise`) — that runs as a **separate new step after design review**. It:

* Reviews the produced design doc (input: `{FID}/design-v2-reviewed.md`).
* Suggests grouping of the work into sub-steps, decided on logical grounds (domain boundaries, organisational structure, chronological dependencies) rather than token/context-window sizing. **Granularity follows the logical seams wherever they fall** — no target sub-step count.
* **Annotates dependencies between sub-steps** as a required part of the decomposition (not an optional extra). Without dependency annotations, sub-steps cannot be safely turned into plans — `bkit-plan` needs to know what each sub-step assumes already exists, what it blocks, and the order in which sub-plans should be executed.
* If the only honest decomposition has circular dependencies, **flag for human review** rather than auto-merging or silently producing a non-DAG.
* Outputs a new doc (versioning per current process): `{FID}/design-v3-organised.md`.

## Downstream usage

Each suggested sub-step becomes a candidate individual plan, which is then run through the existing `bkit-plan` process. The dependency annotations drive the order plans are produced and executed, and feed `blockedBy` / `blocks` relations between the resulting plans/issues. This gives a clean handoff from design → multiple plans, instead of one monolithic plan or ad-hoc splitting.

## Decisions

* **Name:** `design-organise` ("Design Organise").
* **Position in workflow:** Step 7 — separate new step after Apply Review (Step 6), before Summary (Step 8). Close Workflow renumbered to Step 9.
* **Input:** `{FID}/design-v2-reviewed.md`.
* **Output:** `{FID}/design-v3-organised.md`.
* **Granularity:** follow logical seams, no target count.
* **Cycles:** flag for human review.
* **Dependency annotation:** required part of the decomposition.
* **Agent:** single agent (`bkit-design-organise`) — no parallel pair. Decomposition is constrained by the design doc content; diversity of exploration adds no value here (unlike brainstorm). Depth of reasoning about DAG structure is what matters.
* **Effort:** `high` (Opus 4.7) — downstream stakes are real; bad decomposition or missed dependency edges corrupt plan ordering for everything that follows.
* **Output schema:** both inline `dependsOn` per sub-step block AND a separate `## Dependency Graph` summary table at the end. Inline keeps each block self-contained; graph section lets the orchestrator/human see the full DAG at a glance and detect cycles without reading every block.

## Open questions (resolved)

* **Schema:** inline `dependsOn` per sub-step + separate `## Dependency Graph` table. ✅
* **Single vs parallel agents:** single agent, `high` effort (Opus 4.7). ✅

<!-- linear-links-start -->
**Links:**

- **Related:** [BAR-102](https://linear.app/bartens/issue/BAR-102) _(not imported)_, #53 ([BAR-141](https://linear.app/bartens/issue/BAR-141))
<!-- linear-links-end -->

<!-- linear-comment: 964f647c-294c-4032-af41-23ab0ee91d02 -->
**@christian (Linear, 2026-05-08):**

[https://github.com/cbartens/bkit/commit/3bb2a5cfea3b59ce05d0641f38147ab46dda26c3](<https://github.com/cbartens/bkit/commit/3bb2a5cfea3b59ce05d0641f38147ab46dda26c3>)

<!-- linear-comment: 90a07881-ec1f-46f9-ae41-fe68fceb732f -->
**@christian (Linear, 2026-05-08):**

## Workstream sub-issue spec — locked design

Follow-up from session 2026-05-08. Captures the contract for translating `bkit-design-organise` workstreams into Linear sub-issues consumed by `/bkit-plan` and gated in `/bkit-build`.

### 1. Spawn step in `/bkit-design` (new Step 9)

Inserted between Summary (current Step 8) and Close Workflow (renumbered to Step 10). Runs only when `SUMMARY_VERDICT` ∈ {PASS, CONCERNS}.

For each `### WS-{N}: {NAME}` block in `design-v3-organised.md`:

- Title: `WS-{N}: {NAME}`
- `parentId`: design issue id
- Body template:

```
**Parent design:** docs/plans/drafts/{PARENT_FID}-design.md ({PARENT_ISSUE_ID})
**Workstream:** WS-{N} — {NAME}
**Requires:** WS-X, WS-Y   (or None)

## Scope
{scope}

## Rationale
{rationale}
```

After all sub-issues resolved, second pass sets `blockedBy` Linear edges from each child's `Requires` list (translating `WS-X` to the actual sub-issue ID). `save_issue.blockedBy` is append-only per Linear MCP spec — idempotent on re-run.

### 2. Idempotency / stale handling

- List children via `list_issues({ parentId: PARENT_ISSUE_ID })`.
- New workstream (no matching child) → create sub-issue with body template above.
- Existing workstream still in design v{N} → leave body as-is, post a comment with latest scope/rationale/requires from this version.
- Orphaned workstream (was in past design, removed in current) → leave body as-is, post a comment noting it is no longer in design v{N}.
- Human can unlink a sub-issue from parent. Once unlinked, AI no longer considers it.

### 3. `/bkit-plan` changes

- Step 1: parse `**Parent design:**` from issue description → set `PARENT_FID`. Absent → `PARENT_FID = FID` (preserves single-issue legacy flow).
- Step 2 step 4: read `docs/plans/drafts/{PARENT_FID}-design.md` (was `{FID}`). Fail loud if missing in worktree after rebase.

### 4. `bkit-plan-generate.md` contract

Add to Contract block:

> If input includes `**Workstream:**` directive, plan covers ONLY that workstream's scope unless stated otherwise. Treat parent design as context, not backlog. Surface `**Requires:**` at top of plan.

### 5. `/bkit-build` Requires gate

Already present at Step 1.6 (`relations.blocked_by` non-Done → Failure Path). Fix: pass `includeRelations: true` on the `get_issue` call so the field is actually populated.

### Notes

- No new prompt file — orchestrator-only step using Linear MCP tools (same shape as close-workflow's existing `save_issue` writes).
- No `WS_ID` parameter, no Linear labels, no parent-shape detection. The sub-issue body's two markdown markers (`Parent design:`, `Workstream:`) carry everything.
- Even single-workstream designs spawn one sub-issue — design and plan never share an FID.
- `save_issue.blockedBy` MCP support confirmed via tool schema — append-only semantics make the second pass safe to re-run.
- Title format: `WS-{N}: {Name}` (no parent FID prefix; Linear UI shows the parent link).

<!-- linear-comment: f2c1a956-981c-451f-ad28-7b186985fb09 -->
**@christian (Linear, 2026-05-07):**

## Real-world output assessment — design-organise on BAR-102

Compared the original single plan `docs/plans/drafts/bar-102-digital-agent-mvp-plan-1.md` (44 KB, comprehensive scope) against the four workstream plans produced via the design-organise workflow:

- `bar-102-1-ext-provision-plan.md` (61 KB)
- `bar-102-2-bootstrap-plan.md` (73 KB)
- `bar-102-3-db-schema-plan.md` (74 KB)
- `bar-102-4-vercel-ci-plan.md` (58 KB)

### Verdict

The four plans collectively cover **~70–75%** of plan-1's scope. They are **deeper per task** but **narrower in coverage** — ~270 KB across four plans vs 44 KB in plan-1, yet plan-1 still owns items the four don't.

### Coverage map

<!-- prettier-ignore -->
| Plan | Owns from plan-1 |
| --- | --- |
| WS-1 ext-provision | Operator inputs (Vercel/Supabase×2/Upstash/Resend/Tavily/Places/Firecrawl/OpenRouter), **Spike S6**, root `.env.example`, `docs/setup.md` |
| WS-2 bootstrap | **Spike S1**, Tasks 1.9–1.18 (skeleton + 7 packages + apps/web), 1.19, 1.21, 1.22, 1.28–1.29, 1.31 |
| WS-3 db-schema | **Spikes S3, S7**, Tasks 1.22 (dup), 1.23, 1.24, 1.27, 1.30 |
| WS-4 vercel-ci | **Spike S8**, Tasks 1.19 (dup), 1.20 (as runbook only), 1.21 (DELETE+REWRITE), 1.25, 1.26 |

### Gaps (no owner in any of the four plans)

- **Spike S2** — useChat + streamText + OpenRouter round-trip on Next.js 16 webpack. WS-2 defers to non-existent "WS-5".
- **Spike S4** — Firecrawl whole-site dry run + robots.txt. WS-2 defers to non-existent "WS-8".
- **Spike S5 (partial)** — WS-1 verifies keys with single curl each; the plan-1 end-to-end probe (Tavily AU ≥5 results, Places searchNearby Hervey Bay 25km lodging ≥10, Place Details with field mask, saved JSON) deferred to non-existent "WS-10".
- **`scripts/ci/secrets-sync.sh`** as a written artifact — WS-4 implements env sync as inline `vercel env add` runbook only.
- **`packages/validators/{chat,partner}.ts`** skeletons — WS-2 defers to non-existent "WS-5"/"WS-9".
- **`apps/web` runtime deps** (`@next/mdx`, `gray-matter`, `unified`, `remark-parse`, `@ai-sdk/react`, `ai`, `@openrouter/ai-sdk-provider`, `@react-email/components`, `resend`, `@firecrawl/firecrawl-js`) — deferred to phantom WS-5/6/7/8/11.
- **Pre-seeded "authoritative correction" demo chunk** — WS-3 ships as test fixture, not as remote-DB demo seed.
- **Some plan-1 DE entries** — `web_search` server tool, blocking SDK over webhook, MDX over Payload, deferral list (Inngest/apps-run/packages-api/next-intl) — no explicit owner.

### Duplication (double-writes)

- **`supabase/config.toml`** — WS-2 T13 + WS-3 Task 2 both author with same adaptations.
- **`scripts/ci/check-name-leakage.sh`** + test — WS-2 T14 + WS-4 Tasks 1/2.
- **`.github/workflows/{ci,smoke,bkit}.yml`** — WS-2 T14b authors; WS-4 then DELETE+REWRITEs ci.yml and re-authors smoke/bkit.
- **DE numbering** — all four plans append DE-{N+1..} starting from `max(grep)+1` independently → numbers will collide on merge.
- **Stale dependency mapping** — WS-2 line 166 says "S6 → WS-11", but WS-1 is the actual owner.

### Workflow-level lessons for design-organise

1. **Phantom downstream references.** WS-2's mapping table cites WS-5/6/7/8/9/10/11 as deferral targets, but design-organise emitted only four workstreams. The agent deferred items to plans that don't exist. **Fix:** require the organise step to validate that every `dependsOn` / "deferred to WS-N" reference resolves to an actual sub-step block in the same output document. Cycles already trigger human review per the spec — dangling forward references should too.
2. **No coverage check against the source design.** The agent decomposed the design into four logical workstreams without checking that the union of sub-step scopes equals the design scope. **Fix:** after decomposition, the organise agent should produce an explicit "what's NOT covered" section, or run a coverage-completeness pass (every requirement in the design appears in exactly one sub-step).
3. **No deduplication pass.** Three artifacts (`config.toml`, `check-name-leakage.sh`, GitHub workflows) are authored by two plans each. **Fix:** the organise step should produce a single "artifact ownership table" — one file → one owning sub-step. Currently the workflow specs both inline `dependsOn` and a `## Dependency Graph` table, but no artifact-ownership table.
4. **Cross-cutting numbering collisions.** Each sub-step plan independently numbers its DE entries from `max(grep)+1`, so on merge they collide. **Fix:** organise step should reserve DE-number ranges per sub-step (WS-1: DE-1..9, WS-2: DE-10..19, etc.) and write that into each sub-step block.
5. **Per-task depth ≠ per-feature completeness.** The four plans are 1.4–1.7× larger per slice than plan-1's coverage of the same slice — but together they're narrower. **Fix:** the organise step's success criterion should be "decomposition preserves total scope," not "each sub-step is well-scoped."

### Recommendation

For BAR-102 specifically: either expand WS-2 to absorb the deferred items (S2/S4/S5 spikes, `secrets-sync.sh` script, validator skeletons, full apps/web deps list) or add a fifth workstream plan that owns them. Resolve the three double-writes by picking single owners. Reserve DE-number ranges across the four plans before they go to bkit-plan.

For design-organise itself: items 1–5 above are direct, testable additions to the agent's output contract.

<!-- linear-comment: 8154fdfe-5518-4b63-9e78-7f11e54095f8 -->
**@christian (Linear, 2026-05-06):**

## First-use feedback — `bkit-design-organise` against BAR-102

Reviewed `docs/plans/drafts/bar-102-digital-agent-mvp-design.md` against the new `.claude/agents/bkit-design-organise.md` prompt. Notes for posterity / future iterations.

### What the new prompt fixes

BAR-102 was planned with the old pipeline:

1. `bkit-plan-generate` → one chronological plan (74 tasks).
2. `bkit-plan-complexity-split` → 5 sub-plans, partition driven by a ≤100K-token budget (its step 4: `Target sub-plan count = ceil(total / 100K)`).

That's *size-driven* splitting. The new `bkit-design-organise` is *logic-driven* — its step 5 explicitly forbids token/context-window size as a factor and partitions on logical seams (domain, organisational, chronological). Different shape, different boundaries.

### Concrete evidence from BAR-102 sub-plan 1

Sub-plan 1 ("Bootstrap") timed out repeatedly during execution. Re-reading it through the workstream lens, it bundles what `bkit-design-organise` would have surfaced as **at least 4–6 separate workstreams**:

- WS-A: Repo scaffold + selective copy + `@visitfrasercoast/*` sed-rename (7 packages + tooling)
- WS-B: Supabase project + `public` schema migration + `match_chunks` RPC + RLS
- WS-C: Vercel project + CI workflows + `check-name-leakage.sh`
- WS-D: External-service provisioning gate (Vercel/Supabase ×2/Upstash/Resend/Tavily/Google Places/Firecrawl) — including 24–48h Resend DNS wait
- WS-E: Spike S1–S8 execution and reporting
- WS-F: Nine doc-stub population

31 tasks across 6 logical units, plus a hard inter-human DNS gate inside the same sub-plan. The complexity-check log even flagged "7 distinct domain axes" but split on tokens anyway, because that's the tool's mandate. Sub-plans 3 and 5 show similar (smaller) over-bundling; SP2 and SP4 happen to map cleanly to single workstreams.

### Identified gap in the new flow

The prompt stops at decomposition (line 78: `STOP after decomposing design and producing output`). It does not orchestrate `bkit-plan-generate` per workstream, so a future operator could read the workstream graph and still hand the whole design to `bkit-plan-generate` once — landing back in the same single-big-plan trap.

Suggested follow-up (separate issue?): a thin orchestrator skill or doc note that ties `bkit-design-organise` → loop over `WS-{N}` → `bkit-plan-generate` so the workstream-per-plan flow is the default rather than a manual discipline.

### Decision applied to BAR-102 going forward

- SP1 is sunk cost — not re-doing it.
- SP2–SP5 (pending) will be re-organised against workstreams via `bkit-design-organise` before further plan generation. Likely outcome: SP2/SP4 stay; SP3 splits ~2 (ingest vs content+toggle); SP5 splits ~2 (summary email vs deploy/release). Per-workstream plans should be small enough to skip `bkit-plan-complexity-split` entirely.

<!-- linear-comment: de0c9658-f214-4f6b-8942-180ea2811235 -->
**@christian (Linear, 2026-05-06):**

## Implemented — [42e93b3](https://github.com/cbartens/bkit/commit/42e93b3)

### What shipped

New **Step 7 — Design Organise** in `/bkit-design` (Summary → Step 8, Close Workflow → Step 9):

- `bkit-design-organise` subagent (`high` effort, Opus 4.7) reads `design-v2-reviewed.md`, strips its existing verdict header, appends `## Design Workstreams` (WS-N ids with `Requires` dependencies), self-verifies coverage + DAG integrity, writes `design-v3-organised.md`
- Summary and Close Workflow pick up v3 automatically via `sort -V | tail -1`

### Refinements during implementation

- **Single agent, not parallel pair** — decomposition is constrained by the design doc; depth not breadth is what matters here
- **`Requires` not `dependsOn`** — cleaner field name
- **Workstreams (WS-N) not sub-steps/sections** — better reflects the concept
- **Verdict stripping** — copies v2 body only (strips existing verdict header via `awk`) before prepending fresh verdict, avoiding double verdict blocks
- **Self-verify** — modelled on `bkit-plan-complexity-split`: extracts all major design elements, confirms every element lands in at least one workstream, validates all `Requires` IDs exist, checks for cycles; max 2 fix iterations before `FAIL`
- **No dependency graph table** — removed; `Requires` inline per workstream is sufficient

### Cross-cutting fixes (same commit)

- `Produce **Create** outputs` → singular across 7 prompts
- `replace Verdict \`PENDING\` via \`Edit\`; mapping:` → `set Verdict via \`Edit\`; mapping:` across all 22 prompts — removes PENDING assumption, handles mid-process verdict sets (e.g. cycle detection in step 9)

<!-- linear-comment: 53dc5bc9-b669-405f-beac-af73d194f43b -->
**@christian (Linear, 2026-05-06):**

Schema for the sub-steps section in `design-v3-organised.md` — must include sub-step id, scope, and explicit `dependsOn` references to other sub-step ids. Decide inline-per-sub-step vs. separate graph section vs. both.

\>>> yes needs step IDs, high level scope, depends on but otherwise keep open same as design brainstorm just provide guidance on how to approach, also needs parallel subagents followed by design update step similar to plan scope check followed by split step

Confirm this stays purely logical — explicitly *not* driven by context/token budgeting (that's `bkit-plan-complexity-check`'s job downstream).

\>>> confirmed
