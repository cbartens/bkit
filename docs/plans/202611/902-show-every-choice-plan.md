<!-- bkit:anchor
baseSha: 1afb96fd32aa6bb0b20b5c349d7eb77c30cd48c5
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Show Every Choice Taken Without the Owner Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

When an ask point (`package.json` `bkit.workflows.<workflow>.<point>`) has `"ask": false`, or the run is headless (GitHub Actions, where nobody can answer), the workflow takes a choice on the owner's behalf and carries on. Today the same event ends four different ways:

<!-- prettier-ignore -->
| Where | Choice taken without asking | Written down today | In `{workflow}-summary.md` today |
| --- | --- | --- | --- |
| `/bkit-design` Step 3 Grill (`design.grill`) | Every interview answer: the recommendation | `design-grill-{RUN}.md` `### Assumed, not confirmed` | No |
| `/bkit-build` Decision Pause (`build.verify`, `build.challenge`, `build.tests`) | `Accept`, `Fix now`, the loop's `Try again` / `Decide` / `Stop` | `build-decision-{RUN}-{K}.md` `Decision:` lines (`applyRecommendations`, `.bkit/core/engine/commands/workflow/decisions.ts`) | Only `Accept (assumed)`, under `## Risks and Action Items` |
| `/bkit-debug` Loop Question (`debug.fix`, `debug.soak`) | Another fix or soak attempt when progress is stuck or worse | Chat only (`bkit-debug.md` § Loop Question sub-step 1) | No |
| `/bkit-ship` Confirm Assumed Items (headless) | Merge with build's assumed accepts unconfirmed | One `needs-decision` row each in `docs/deferrals.jsonl` | Yes, `## Ship Completed with Assumed Items` |

The summary file is the run's last message (`workflows close --final-return`) and is posted verbatim as the summary comment (`steps finish --comment-body`, `buildComment` in `.bkit/core/engine/commands/workflow/issues.ts`), so a choice the summary leaves out never reaches the owner.

**Goals:**

- One record per choice: an `auto-decision` row in the run's `status.jsonl`, written only by the engine (`bkit decisions record`, and `bkit decisions apply --by=headless` for build). The build decision file stays the detailed record, and the row points at it.
- One summary section, `## Decisions Taken Without You`, right after `## Verdict` in all five workflow summaries. Build's `- Assumed, not confirmed:` lines and ship's `## Ship Completed with Assumed Items` heading move into it, so nothing is listed twice.
- At ship, the section also lists the auto-decisions of the feature's earlier design, build and debug runs.
- The verdict follows the owner's decision 1: only items that need confirmation (assumed accepts, assumed grill answers) hold a verdict at CONCERNS.
- Each line uses #895's `Default if unanswered:` wording (`taken as A`, `the design assumes A`, `written as a needs-decision deferral`), so the question and the summary line match.
- How each point routes does not change; only what is recorded and shown changes.

**Order with the two related plans:**

- #895 is a declared blocker. It rewrites the decision-file item layout and `parseDecisionItems`, which this plan's summary reads through the same function. Build waits until #895 lands.
- #911 removes ship Steps 11 and 12. On `dev` at this plan's base (`1afb96fd3`), #911 is planned but not built, so `bkit-ship.md:861` still narrates `fix round taken without asking`. This plan builds after #911 and records no ship Step 11 row (Open Question Q1). The order is a precondition of Task 7, not a red test: Task 7's `ship.merge` guard fails in the suite while that narration exists, so the order is also enforced in the codebase.
- Line numbers in this plan are against `1afb96fd3`. #895 and #911 move them, so the build re-points each anchor by symbol, never by renumbering.

**Related Issues:**

- #895 — One question format for every owner question in the workflows (OPEN)
- #860 — Move deterministic bookkeeping and safe recovery into the engine (OPEN)
- #911 — Ship: a failed merge never reaches the diagnose and fix steps (OPEN)
- #836 — Record which host and model ran each workflow (OPEN): it changes `session` rows and host classification in the same `status.jsonl` and `run-facts.ts`; this plan's `why` and `runtime` come from `classifyAt`, which #836 leaves unchanged.

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Every choice a workflow takes on the owner's behalf, because `ask` is false or the run is headless, is written down once in the same place and listed in one section of that workflow's end summary. The owner can read the final message, or the summary comment on the issue, and see every such choice: what was decided, why it was recommended, and whether it still needs their confirmation.

### Success Criteria

- With every ask point set to `"ask": false`, a run of each of design, build, debug and ship that hits an ask point ends with a `## Decisions Taken Without You` section listing every choice taken at that point.
- No ask point routes past a question without writing a record; a test fails if a new ask point skips it.
- A headless run's issue comment shows the same section as the session's final message.
- The ship summary lists the auto-decisions from all of the feature's earlier runs.
- Runs started before the change (status files with no `auto-decision` rows) still produce a summary.

### Process Sketch

- **WHEN** a headless build Decision Pause takes the recommendations **→ THEN** each settled item gets one `auto-decision` row, and the build summary lists it under `## Decisions Taken Without You`, marking an `Accept (assumed)` as needing confirmation.
- **WHEN** a debug Loop Question with `ask` false would have asked (progress `stuck` or `worse`) **→ THEN** the attempt runs as today, one row records `taken as B) Try again`, and the debug summary lists it; an improving attempt writes no row.
- **WHEN** a design grill asks nobody **→ THEN** each `Assumed, not confirmed` answer gets one row, the design summary lists it as `the design assumes …`, and the design verdict reads CONCERNS.
- **WHEN** ship writes its summary **→ THEN** the section lists the rows of the feature's earlier design, build and debug runs, each assumed accept with its state at ship (confirmed, rejected, or written as a needs-decision deferral).
- **IF** a status file holds no `auto-decision` rows (a run from before the change) **→ THEN** the summary is still written, and the section lists the assumed accepts read from the decision files, or `None`.
- **IF** the record cannot be written (no status file, a bad point, an empty or multi-line field) **→ THEN** the command exits non-zero, writes nothing, and the workflow takes its Failure Path instead of reporting success.

### Concrete Example

**Setup:** The owner files issue #412 for a CSV export and leaves the `bkit:auto` chain to `bkit-cloud.yml`, so design, build and ship run headless on GitHub Actions (`runtime` `GITHUB_ACTION`). The one-plan design and the build share FID `412-export-csv`.

**Steps:**

1. Design Step 3 asks nobody. The grill file lists `- Q2 Storage: keep one JSONL file per export` under `### Assumed, not confirmed` → `bkit decisions record --from-grill` writes one row → the design summary reads CONCERNS and shows:
   ```text
   ## Decisions Taken Without You

   - design.grill Q2 Storage: the design assumes keep one JSONL file per export (headless, GITHUB_ACTION). Needs your confirmation at the plan's Acceptance Scenario box. (`docs/plans/202611/logs/412-export-csv/design-grill-1.md`)
   ```
2. Build Step 11 pauses on two challenge findings: Q1 (MEDIUM, recommended `Accept`) and Q2 (HIGH, recommended `Fix now`) → `bkit decisions apply --by=headless --point=build.challenge` writes `Accept (assumed)` and `Fix now` into `build-decision-1-1.md` and two rows into `status.jsonl` → the build summary shows:
   ```text
   - build.challenge Q1 — Task 3 [src/a.ts:10]: taken as A) Accept — the caller already caps it (headless, GITHUB_ACTION). Needs your confirmation: ship asks. (`docs/plans/202611/logs/412-export-csv/build-decision-1-1.md`)
   - build.challenge Q2 — Task 4 [src/b.ts:2]: taken as B) Fix now — a secret reaches the log (headless, GITHUB_ACTION). (`docs/plans/202611/logs/412-export-csv/build-decision-1-1.md`)
   ```
3. Ship runs headless, so Confirm Assumed Items asks nobody and `decisions pending --defer` writes a `needs-decision` deferral for build Q1 → the ship summary's `## Decisions Taken Without You` lists the design Q2 line, the build Q2 line, and the build Q1 line ending `Not confirmed (Recommended: none — only you can accept it); written as a needs-decision deferral.`

**Outcome:** The ship summary comment on #412 and the run's final message both list all three choices, each with what was chosen, why, whether nobody was asked or `ask` was off, and the file to open.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A status file written before the change (no `auto-decision` rows) | `workflows summary` exits 0; the section lists the assumed accepts read from the run's decision files, else `None` |
| A union merge (`merge=union` on `status.jsonl`) duplicates a row | The section lists it once (dedupe on workflow, point, artifact, question and choice) |
| `decisions apply --by=headless` exits 4 (hard blockers left) | Rows are written for the items it settled, none for a hard blocker |
| The build loop question is taken as `Try again` | One row for the loop answer; the items wait undecided and get no row |
| A local run with `ask` false, and a GitHub Actions run | `why` reads `ask:false` locally and `headless` on GitHub Actions, from the same runtime classification the decision file uses |
| `decisions record` gets a point of another workflow, an unknown point, an empty `--chose` or a field with a line break | Exit 2, nothing written |
| The run's status file does not exist | `decisions record` and `decisions apply --by=headless` exit 3 and write nothing; `apply` leaves the decision file unchanged |
| `decisions apply --by=headless` without `--point`, or with a point outside build | Exit 2, nothing written |
| A debug attempt with `ask` false while progress is improving | No row: a routine continue, which never asks even with `ask` on |
| A debug Loop Question with `ask` false whose progress cannot be read | The attempt runs as today; the row's reason says the progress could not be read |
| A grill with nobody asked whose `### Assumed, not confirmed` section reads `None.` | No row, exit 0 |
| A grill file with no `### Assumed, not confirmed` heading, or an assumed line not shaped `- Q{n} {title}: {answer}` | `decisions record --from-grill` exits 2 and writes nothing |
| The owner stopped a grill they were answering | The assumed answers stay in the grill file and the design doc; no row (Open Question Q3) |
| An assumed accept the owner confirmed or rejected at ship | Its rolled-up line says `Confirmed by you at ship.`, or `Rejected by you at ship; written as a needs-decision deferral.` |
| A design whose plan runs under another FID (more than one suggested plan) | Its rows stay in the design's summary and are not rolled up into the child feature's ship summary (Open Question Q4) |
| Rolled-up grill assumptions at ship | Listed, not asked; the ship verdict keeps today's rule (Open Question Q5) |
| `decisions record` gets an absolute `--artifact`, or one that leaves the repo | Exit 2 naming the artifact path, nothing written |
| `decisions record --from-grill` gets a point other than `design.grill`, or `--question`, `--chose` or `--reason` beside it | Exit 2 naming the refused flag, nothing written |
| An assumed grill answer holds `: ` (for example `- Q3 Format: CSV: one file per day`) | The line splits at the first `: `, so the title is `Format` and the answer keeps its colon |
| A rolled-up build row whose decision file is gone at ship | The line ends `state unknown ({artifact} not found)`, and the summary is still written |
| A design run whose grill asked the owner | No record, and the run's `completeness` row has no evidence hole for the record call |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `decisions record` writes one `auto-decision` row whose `why` and `runtime` come from the runtime classification | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `decisions record` refuses a point of another workflow, an unknown point, an empty choice and a multi-line field | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `decisions record` never starts a status file (exit 3) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `decisions record` refuses an absolute or out-of-repo `--artifact` and writes nothing | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `status row` refuses `--type=auto-decision` and names `bkit decisions record` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 1 |
| Step minutes skip `auto-decision` rows | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 1 |
| `decisions record --from-grill` writes one row per assumed grill answer, each needing confirmation | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `decisions record --from-grill` writes nothing for `None.` and refuses a malformed grill file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `decisions record --from-grill` refuses a point other than `design.grill`, and `--question`, `--chose` or `--reason` beside it | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `decisions record --from-grill` splits each assumed line at the first `: `, so an answer keeps its own colon | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `decisions apply --by=headless` writes one row per item it settles, none for a hard blocker, and the loop answer alone on `Try again` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 3 |
| `decisions apply --by=headless` needs a build `--point` and a status file, and writes nothing without them | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 3 |
| Every workflow summary has `## Decisions Taken Without You` right after `## Verdict` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| Each row's line names the point, the choice, the reason, `ask:false` or `headless`, and the file; confirmation items say so | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| An automatic `Fix now` or `Try again` leaves the verdict alone; assumed grill answers make a design CONCERNS | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| Build's assumed accepts leave `## Risks and Action Items` and are listed once | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| A status file with no `auto-decision` rows still gets a summary, with legacy assumed accepts or `None` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| The ship summary lists the earlier design, build and debug runs' rows with each assumed accept's state at ship | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| Ship's unconfirmed assumed items sit in the section, with no `## Ship Completed with Assumed Items` heading, and rolled-up rows leave the ship verdict alone | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| A rolled-up build row whose decision file is gone renders `state unknown ({artifact} not found)` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| `bkit workflows summary --workflow=ship` reads the `auto-decision` rows of earlier runs in the status file | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 5 |
| The headless build Decision Pause passes its ask point to `decisions apply` | Unit | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | 6 |
| The debug Loop Question records an ask-off choice before it narrates, and a routine continue records nothing | Unit | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | 6 |
| The debug Loop Question with `ask` false records `progress could not be read` when the progress read fails | Unit | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | 6 |
| The design grill records its assumed answers only when nobody was asked | Unit | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | 7 |
| The completeness contract derived from `bkit-design.md` puts the `decisions record` call on a branch arm, so a design run that asked the owner is not holey | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 7 |
| Every ask point has a record, or goes only to the Failure Path; a new ask point with neither fails | Unit | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | 7 |
| The exact workflow lines, run through the built CLI under `GITHUB_ACTION`, end in a summary listing every choice | Integration | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | 8 |
| The issue comment body and the final message carry the same section | Integration | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | 8 |
| Ship rolls up a design grill assumption and a build assumed accept from earlier runs | Integration | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | 8 |
| A status file written before the change still produces a summary through the CLI | Integration | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | 8 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

**Names:**

<!-- prettier-ignore -->
| Name | Kind | Alternative considered |
| --- | --- | --- |
| `auto-decision` | `status.jsonl` event type (the issue's own name) | — |
| `bkit decisions record` | CLI verb on the existing `decisions` noun | `bkit decisions auto` (the issue's example); `record` says what the verb does and reads with `--from-grill` |
| `--from-grill` | Flag of `decisions record` | A separate `decisions grill` verb |
| `--point` | New flag of `decisions apply --by=headless` | Reading the `From:` header (refused: `From: summary` names no point) |
| `## Decisions Taken Without You` | Summary heading (the issue's own name) | — |
| `featureRows` | Optional `SummaryInput` field (ship's rolled-up rows) | `earlierRows` |
| `recorded` | Output key of `decisions apply --by=headless` | — |

**Breaking changes:**

<!-- prettier-ignore -->
| Change | Who it breaks | Handling |
| --- | --- | --- |
| `decisions apply --by=headless` now requires `--point` and exits 3 without the status file beside the decision file | A consumer's workflow copy that still runs the old line | `bkit upgrade` re-renders `bkit-build.md` with the new line in the same release; the engine and the workflow ship together. A consumer who bumps the package without re-rendering still runs the old line, so every headless Decision Pause takes the Failure Path; the existing `bkit-version-pin-stale` preflight advisory (`.bkit/core/engine/checks/before/version.ts:41`) tells them to run `pnpm bkit upgrade` |
| `status row --type=auto-decision` is refused (exit 2) | Nothing calls it today | The message names `bkit decisions record` |
| Build summary: `- Assumed, not confirmed:` lines leave `## Risks and Action Items` | Readers who look for them there | They are listed in the new section; the build verdict is unchanged |
| Ship summary: the `## Ship Completed with Assumed Items` heading is removed | Readers of the old heading; no engine or workflow reads it | Its items are listed in the new section (Open Question Q2) |
| Design verdict: a run whose grill asked nobody reads CONCERNS, not PASS | Owners who read PASS as "nothing to look at"; `bkit-auto.md` reads no summary verdict (text search for `verdict` and `summary` finds none) | Design's CONCERNS next step still names `/bkit-plan`, with `/bkit-design` as the alternative (`NEXT_STEP` in `summary.ts`); the concern line says where to confirm |
| Every summary gains one section after the Verdict block | Tools that parse summary sections by position | None in the repo; `summary.test.ts` and the render snapshots are updated in the same change |

No `package.json` setting, no database and no public API change.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

The owner already settled the issue's five open questions (issue comment, 2026-11-10T06:57:50Z): retries and automatic `Fix now` leave the verdict alone; grill assumptions are listed at ship, not asked; routine continues are not listed; the single record is one `auto-decision` status row; wording follows #895, and #895 is a blocker. The questions below are the ones the plan had to decide on top of those.

- **Open Question Q1 — Order with #911 (ship Step 11):** #911 is planned, not built, so `bkit-ship.md` Step 11 still takes a fix round without asking when `ship.merge.ask` is false. → The owner resolves it by answering here.
  - **Options:** A) Build #902 after #911 lands, and record no ship row: `ship.merge` then only ever asks or goes to the Failure Path — #902 waits for two plans instead of one · B) Build #902 first and record ship Step 11's fix round with a row — the row write is built only for #911 to delete with the step
  - **Recommended:** A) Build after #911 — #902 already waits for #895, and nothing gets built only to be removed; Task 7's audit test enforces the order.
  - **Default if unanswered:** A; Task 7 waits until #911 has landed.
- **Open Question Q2 — Ship's `## Ship Completed with Assumed Items` heading:** the new section lists the same unconfirmed items. → The owner resolves it by answering here.
  - **Options:** A) Fold it into `## Decisions Taken Without You`, each item worded as #895's question is (`Recommended: none — only you can accept it`, `written as a needs-decision deferral`) — one place to read; nothing in the engine reads the old heading · B) Keep both headings — every unconfirmed item is listed twice
  - **Recommended:** A) Fold it in — the issue asks for one section and nothing listed twice.
  - **Default if unanswered:** A.
- **Open Question Q3 — Grill answers assumed because the owner stopped the interview:** these land under `Assumed, not confirmed` too, but nobody skipped asking. → The owner resolves it by answering here.
  - **Options:** A) Not listed: rows only when nobody was asked (`ask` false or headless), as the issue's Outcome scopes it — those assumptions stay only in the grill file and the design doc · B) Listed, with a third `why` value `stopped` — the section then also holds choices the owner chose to leave open
  - **Recommended:** A) Not listed — it keeps the section to choices taken because nobody was asked.
  - **Default if unanswered:** A.
- **Open Question Q4 — A design whose plans run under other FIDs:** with more than one suggested plan, each plan gets its own issue and FID, so its status file holds no design rows. → The owner resolves it by answering here.
  - **Options:** A) The ship roll-up reads the feature's own status file only — a child feature's ship summary does not repeat the parent design's grill assumptions, which the design summary and each plan's Acceptance Scenario box already showed · B) Also follow the plan's `bkit:anchor` `designPath` to the parent design's status file — every child ship repeats the parent's assumptions, and the summary reads a second log folder
  - **Recommended:** A) Own status file only — the parent design's choices belong to the parent design's summary.
  - **Default if unanswered:** A.
- **Open Question Q5 — Do rolled-up rows change the ship verdict:** → The owner resolves it by answering here.
  - **Options:** A) No: ship keeps today's rule (unconfirmed assumed accepts make it CONCERNS); rolled-up rows are listed only — a grill assumption never moves the ship verdict · B) Any rolled-up row that needs confirmation makes ship CONCERNS — every headless feature with a grill reads CONCERNS at ship, with the same next step as PASS
  - **Recommended:** A) No — the plan's Acceptance Scenario box already put the design in front of the owner (owner decision 2), and build's assumed accepts already count.
  - **Default if unanswered:** A.
- **Open Question Q6 — Wording of the debug ask-off line:** #895 gives the debug Loop Question `Default if unanswered: the run waits for you`, with no `taken as …` clause for when nobody can be asked. With `ask` false the run continues with `B) Try again`, so the row's `taken as B) Try again` has no #895 wording to follow (owner decision 5). → The owner resolves it by answering here.
  - **Options:** A) Write `taken as B) Try again`, the option the run takes, lettered as the question letters it — it matches the build lines, but no #895 `Default if unanswered:` phrase backs it · B) Ask #895 to add a `Default if unanswered:` clause for when nobody can be asked, and copy it — the question and the line then match exactly, but #902 waits on a change to #895's plan · C) Write the routing in plain words (`the run tried again without asking`) — no lettered option, so it reads unlike the other lines
  - **Recommended:** A) `taken as B) Try again` — it names the option the run actually took, in the same shape as every other line, and needs no change to #895.
  - **Default if unanswered:** A.
- **Assumption:** #895 lands before this build and keeps `DecisionItem` (`n`, `title`, `options`, `recommended`, `reason`, `decision`, `assumed`, `rejected`, `deferred`) as its plan says. → If #895 changes those fields, Tasks 3 and 5 re-point to the new fields before their tests are written.
- **Assumption:** a build decision file lives in the run's log folder, beside its `status.jsonl` (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{K}.md`, `fileRef` in `decisions.ts`). → If not, `decisions apply --by=headless` writes its rows to the wrong log or exits 3; Task 3's test pins the path.
- **Assumption:** a one-plan design, its build, its debug runs and its ship share the FID's `status.jsonl` (design reaches `dev` through its close squash-merge before the build branch is cut). → If not, the ship roll-up misses the design rows. Task 8 runs one fabricated status file, so it cannot show this; the backing fact is `docs/knowledge.jsonl` `kn-21-workflow-status-json-on-dev-for-all-five-workflows-single-t`.
- **Assumption:** with `ask` false, the debug Loop Question continues (`B) Try again`) even though its question recommends `A) Stop`; this plan records that choice and does not change it. → If the owner wants ask-off to stop instead, that is a routing change outside this issue's constraints (Suggested Scope Expansion row 1).
- **Assumption:** `why` is `headless` exactly when `classifyAt` returns `GITHUB_ACTION`, the rule `headlessRun` and `decisions apply` already use (`.bkit/core/engine/commands/workflow/runtime.ts:125`). → If another runtime becomes headless, every `why` label changes with that one function.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Why not |
| --- | --- |
| The summary reads each source in place: the grill file's `### Assumed, not confirmed` heading, the decision files' `Decision:` lines, and nothing for debug | Debug has no file to read, the ship roll-up would need one parser per workflow, and the owner chose one `auto-decision` status row as the single record (decision 4) |
| The workflow writes the row with the generic `bkit status row --type=auto-decision --field=…` | Nothing checks the fields, so an orchestrator could leave out `why` or `runtime`, or write a line break that splits the summary; the engine verb derives `why` and `runtime` itself and validates the rest, and `status row` refuses the type |
| `decisions apply --by=headless` reads the ask point from the decision file's `From:` header | `From: summary` (Step 15 `UNPROVEN`) names no ask point, so the engine would copy the workflow's own `From` → point mapping; an explicit `--point` is checked by `askPoint` against `ASK_POINTS` |
| `decisions record` works out the debug trend itself | It would duplicate `counters progress` inside a recording verb; the Loop Question already reads progress for its asked branch, so the ask-off branch moves after that one read |
| One summary heading per earlier workflow at ship | The issue asks for one section; each line already starts with its point (`design.grill`, `build.verify`, …), which names the workflow |

**Recommendation for a later phase:** the latent `From: summary` resume mapping and the `§ Ask points` sentence about loop questions (Suggested Scope Expansion rows 1 and 2) are worth their own small fixes; neither is needed for this plan's Success Criteria.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Listing routine continues (a debug attempt while progress improves, a ship fix round after a `PASS` diagnosis) | They never ask even with `ask` on, so no Success Criterion counts them; the owner declared them not listed (decision 3, issue comment 2026-11-10T06:57:50Z). Deferral `902-routine-continues-not-listed` | Issue § Constraints and non-goals |
| Listing grill answers assumed because the owner stopped the interview | The issue's Outcome covers only choices taken because `ask` is false or the run is headless; the owner was asked. Deferral `902-grill-stop-assumptions-not-listed` | Open Question Q3 |
| How questions are worded when they are asked | Declared not in scope by the issue; #902 only reuses #895's phrases. Deferral `902-question-wording-in-895` | #895 |
| A record for ship Step 11's fix round | The owner's scope change from #911 removes the step, so no Success Criterion needs a ship row once #911 lands (Open Question Q1). The row is `Exempt` only under Q1's answer A: if the owner answers B, Success Criterion 2 needs the record, and it moves into the runbook as a task. Deferral `902-ship-step-11-fix-round-record` | #911 |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `.bkit/core/.bkit/workflows.md` § Ask points says "`ask: false`: loop questions take the recommendation", but the debug Loop Question with `ask` false continues (`B) Try again`) while its question recommends `A) Stop` | Found while planning (`.bkit/core/workflows/bkit-debug.md:123`, § Ask points) | Task 6 (debug record) and Task 9 (the § Ask points bullet) | Needs a design decision: fix the sentence to match the routing, or change the routing (outside this issue's constraint that routing stays the same). This plan records the routing as it is |
| The build resume line sets `PAUSE_POINT` = `build.{from}`, which gives `build.summary` for `From: summary`; a fresh Step 15 `UNPROVEN` pause uses `build.verify` (`bkit-build.md:1118`). `build.summary` is not an ask point, so a resumed `UNPROVEN` pause already exits 2 at `counters max --point={PAUSE_POINT}` today, and would also exit 2 at `decisions apply --point` | Found while planning (`.bkit/core/workflows/bkit-build.md:43`) | Task 6 (`--point={PAUSE_POINT}`) | Needs a human decision to fold in: map `From: summary` to `build.verify` in the resume line. The defect predates this plan and is unproven by a run. Until it is fixed, Success Criterion 1 does not hold on the resumed `From: summary` path: the run takes the Failure Path before any choice is taken, so no choice goes unrecorded |
| Apply the base-commit check to `/bkit-debug`'s Loop Question | `docs/deferrals.jsonl` `891-debug-base-red-label` | `bkit-debug.md` § Loop Question (Task 6) | Keep deferred; it changes when the question asks, not what is recorded |
| When the workflows pause, the limits, and what an answered decision does stay as they are | `docs/deferrals.jsonl` `895-pause-timing-limits-and-answer-effects-unchanged` | Decision Pause and Loop Question routing | Keep deferred; #902 keeps routing unchanged too |
| #860 — Move deterministic bookkeeping and safe recovery into the engine | Related issue | Recording in the engine instead of chat narration | Keep separate; #902's verb is one instance of that direction |
| #836 — Record which host and model ran each workflow | `related-issues.md` | `status.jsonl` `session` rows, `run-facts.ts`, and the runtime and host classification that `why` and `runtime` come from | Keep separate; listed under Related Issues |
| The #836 / #860 shared lock-and-confirm append in `.bkit/core/engine/ledgers/status.ts` | `related-issues.md` (#836 § Build the shared pieces once with #860) | `decisions record` and `apply --by=headless`, which append through `appendLine` | Keep separate; if that helper lands first, the build routes both writers through it and adds no second append path |
| `715-retire-lite-workflows-challenge-low-bkit-core-engine-audits-workflows-ship-verdict-integration-test-ts-302` (OPEN, LOW) | `docs/deferrals.jsonl` (`related-deferrals.md`) | Task 8's file `ship-verdict.integration.test.ts` (the `openPr` helper) | Keep deferred; Task 8 adds its own `describe` and does not touch `openPr` |
| `699-completeness-verdict-no-success-axis` (OPEN, LOW) | `docs/deferrals.jsonl` (`related-deferrals.md`) | The completeness contract that the new workflow record calls feed (Task 7) | Keep deferred |
| `701-design-workflow-reviewer-audit` (OPEN, LOW) | `docs/deferrals.jsonl` (`related-deferrals.md`) | `bkit-design.md`, which Task 7 edits | Keep deferred; it audits prompts, not the grill record |
| `ship-failure-diagnose-invoked-without-strategy` (OPEN, MEDIUM, #904) | `docs/failures.jsonl` (`related-failures.md`) | Ship Step 11, which #911 removes before this plan builds (Open Question Q1) | Leave it to #911 / #904 |
| `audit-deterministic-bookkeeping-agent-artifact-envelope-arithmetic` (OPEN, MEDIUM) | `docs/failures.jsonl` (`related-failures.md`) | Moving recording into the engine (#860) | Keep separate |

## Security & Privacy

- [ ] **New API Route** — not applicable; bkit has no HTTP routes.
- [ ] **New DB Table/Column** — not applicable; no database.
- [ ] **Role-Gated Mutation** — not applicable; no roles.
- [ ] **User Input** — applies. `decisions record` validates every field in its own handler, never only in the workflow text. It checks:
  - the point against `ASK_POINTS` and the workflow prefix;
  - that each text field is non-empty with no line break, so a field cannot add a heading or line to the summary and its issue comment;
  - that the artifact path is repo-relative inside the repo;
  - that the grill lines have the `- Q{n} {title}: {answer}` shape.

  `apply --by=headless` checks `--point` the same way. Tests: Tasks 1-3; the artifact path check is Task 1's `refuses an absolute or out-of-repo --artifact and writes nothing`.

- [ ] **PII** — applies in a narrow form: a row's `reason` is copied from an owner-visible question or a grill answer and is posted to the issue as today's decision file and grill comment already are. No new data leaves the repo, and nothing new is logged.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable; `classifyAt` reads the existing `BKIT_RUNTIME` / `GITHUB_ACTIONS` variables.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added; `package.json` and `pnpm-lock.yaml` stay in sync.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-11) lists dev tools only, none blocking: `oxlint` 1.89.0 → 1.91.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `vitest` and `@vitest/coverage-v8` 5.0.5 → 5.1.0, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. Toolchain: Node v24.16.0, pnpm 10.34.7. No stack CLI or backend is involved.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`: language-server references to `buildSummary`, `parseDecisionItems` and `applyRecommendations`; text search for `taken without asking`, `Assumed, not confirmed`, `Ship Completed with Assumed Items`, `owner-pause`, `FOLDED_TYPES`, `MARK_ROWS` and `ASK_POINTS` across `.bkit/core/`, `.bkit/instructions.md` and `docs/`.
- [ ] **User Context:** every file the plan edits was opened at `1afb96fd3`; no information is needed from the owner beyond the Open Questions.
- [ ] **Project Context:** read `docs/decisions.jsonl` `671-ask-points-hard-limits-assumed-accepts` (ask false or headless takes the recommendation; assumed accepts are confirmed at ship) and `design-grill-step` (assumed grill answers are recorded so designers can tell a human decision from an agent guess); `docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits` (each edited standing workflow line needs its `.bkit/instructions.md` local entry edited by hand), `plan-line-anchors-are-basesha-relative-so-a-stale-plan-is-re-pointed-by-symbol-never-renumbered`, `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e` and `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (Tasks 3-5 edit existing cases in planned test files, so those edits belong in the group's tests step, before the red, never in the code step).
- [ ] **Testing & Quality:** engine logic is tested at the Unit tier against real temp folders and git repos (no mocking framework, `docs/testing.md` § Stack); workflow text at the Unit tier in `.bkit/core/engine/audits/workflows/`; the wired path at the Integration tier, running the exact workflow lines through the built `dist/cli.js`. bkit has no database and no UI, so no DB integration or E2E row applies.
- [ ] **Prerequisite Plans:** `docs/plans/202611/895-one-question-format-plan.md` (#895, the declared blocker) and `docs/plans/202611/911-ship-failed-merge-plan.md` (#911, Open Question Q1), each built, verified and on `dev`.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable; no credential is added.
- [ ] **Schema State:** not applicable; bkit has no database (`docs/data-schema.md` holds no table). The `status.jsonl` event table in `.bkit/core/.bkit/workflows.md` is the contract this plan extends.
- [ ] **Architecture & UI:** the new integration test sits in `.bkit/core/engine/audits/workflows/`, where `docs/testing.md` § Stack places tests that read shipped workflow text; no UI.
- [ ] **Observability:** the new verb logs through `ctx.log` under the `[bkit-decisions]` noun prefix (`docs/observability.md` § Log Format); its stdout stays one output object.
- [ ] **Notifications:** not applicable; no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database (`docs/data-schema.md` holds no table). The data this plan touches is the per-feature workflow log `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, whose event table lives in `.bkit/core/.bkit/workflows.md` § `status.jsonl` — workflow state SoT. The new row type is not folded: `fold` ignores unknown types, and `status row` refuses it so only its verb writes it.

### Data Schema Usage

- **Input (Read):** `status.jsonl` `workflow-started` (run boundary, `runStatusRows`), `step-done` (`build-decision` artifacts), and the new `auto-decision` rows; `build-decision-{RUN}-{K}.md` items through `parseDecisionItems`; `design-grill-{RUN}.md` `### Assumed, not confirmed` lines.
- **Output (Write):** `status.jsonl` `auto-decision` rows, appended by `bkit decisions record` and `bkit decisions apply --by=headless`; `{workflow}-summary.md` gains `## Decisions Taken Without You`.

### Data Schema Changes

- **ADD:** `status.jsonl` event `auto-decision` — `{type, workflow, at, point, question, chose, reason, why, runtime, needsConfirm, artifact?, q?}`:
  - `point`: an `ASK_POINTS` entry whose prefix is `workflow`.
  - `question`: `Q{n} — {title}` for a build item, `Q{n} {title}` for a grill answer, the Loop Question's `Q1 — Fix` or `Q1 — Soak` for debug.
  - `chose`: the option as the question letters it (`A) Accept`, `B) Fix now`, `B) Try again`), or the assumed grill answer.
  - `reason`: the recommendation's reason, or why the run went on.
  - `why`: `headless` when `classifyAt` returns `GITHUB_ACTION`, else `ask:false`.
  - `runtime`: the `classifyAt` value.
  - `needsConfirm`: true for `Accept (assumed)` and grill assumptions.
  - `artifact`: the repo-relative file to open (decision file, grill file, newest debug diagnosis or soak log).
  - `q`: the decision file's question number, so ship can read the item's state.
  - Step minutes skip it (`MARK_ROWS`). Every single-line text field is non-empty, holds no line break, and is refused otherwise.
- **MODIFY:** `{workflow}-summary.md`: `## Decisions Taken Without You` after the `## Verdict` block in all five workflows; build's `- Assumed, not confirmed:` lines leave `## Risks and Action Items`; ship's `## Ship Completed with Assumed Items` heading is removed and its items join the new section.
- No upgrade migration: old status files hold no `auto-decision` rows and still summarise (Success Criterion 5); old decision files stay readable through `parseDecisionItems`.

## Reuse Inventory

Shared searches for every row: `grep -rln 'auto-decision\|Decisions Taken Without You\|decisions record' .bkit/core docs/*.md` (two matches, both unrelated prose: `.bkit/core/docs/templates/bkit-audit-app-performance.md:142` and a comment in `.bkit/core/engine/install/modules/cloud.ts:24`); `docs/capabilities.md` (the `decisions` and `summary` modules, no recorder); language-server references to `buildSummary`, `parseDecisionItems` and `applyRecommendations`; text search for `taken without asking`, `Assumed, not confirmed`, `Ship Completed with Assumed Items`, `FOLDED_TYPES` and `MARK_ROWS`. Node and the repo's own CLI framework (`CommandSpec` in `.bkit/core/engine/commands/lib.ts`) have no built-in for a validated status row; `appendLine` and `statusTimestamp` in `.bkit/core/engine/ledgers/status.ts` already append one.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Write one validated `auto-decision` row (`bkit decisions record`) | `.bkit/core/engine/commands/workflow/decisions.ts` | Shared searches; `decisionsCommand` verbs (`compose`, `apply`, `pending`); `status row` in `status.ts` | `decisionsCommand` — owns the build decision files and already derives `why` from `classifyAt`, missing a verb that writes a status row; `status row` — appends any type, missing field checks | EXTEND | Add a `record` verb to `decisionsCommand` that checks the point against `ASK_POINTS`, derives `why` and `runtime`, refuses empty or multi-line fields, and appends through `appendLine` |
| Record the grill's assumed answers (`--from-grill`) | `.bkit/core/engine/commands/workflow/decisions.ts` | Shared searches; `grep -rn 'Assumed, not confirmed' .bkit/core/engine` (no parser; the heading is written by the orchestrator only) | None in the engine — the grill file is read only by agents | EXTEND | A `--from-grill={file}` mode of the same `record` verb parses `### Assumed, not confirmed` lines; one verb owns the row shape |
| Write a row for each item `apply --by=headless` settles | `.bkit/core/engine/commands/workflow/decisions.ts` | References to `applyRecommendations`; the `apply` verb's `run` | `applyRecommendations` — settles items and returns `applied` and `loop`, missing a record of them | EXTEND | `apply --by=headless` gains a required `--point`, checks the status file beside the decision file, and appends one row per applied item from `applied`, `loop` and `parseDecisionItems` |
| Only the engine writes `auto-decision` | `.bkit/core/engine/commands/workflow/status.ts` | `grep -n 'FOLDED_TYPES' status.ts` (line 363, used at 699) | `FOLDED_TYPES` — refuses folded types, whose message names `status meta`/`steps` | EXTEND | Add a type → verb map next to `FOLDED_TYPES`, so `status row --type=auto-decision` exits 2 naming `bkit decisions record` |
| Step minutes skip the new row | `.bkit/core/engine/commands/workflow/run-facts.ts`, `scripts/harvest/bkit-harvest.mjs` | `grep -n 'MARK_ROWS' run-facts.ts` (lines 115-117, 338); `grep -rln 'MARK_ROWS' scripts/` (`bkit-harvest.mjs:1479` and its parity test) | `MARK_ROWS` — the set step minutes skip, and its harvest copy | EXTEND | Add `auto-decision` to both copies of `MARK_ROWS` |
| Render `## Decisions Taken Without You` and its verdict effect | `.bkit/core/engine/commands/workflow/summary.ts` | References to `buildSummary`; `acceptItems`, `unconfirmed` and the Risks items in `buildSummary` | `buildSummary` — already renders every workflow's sections and build's assumed accepts, missing one section for every choice | EXTEND | Render the section from the `auto-decision` rows already in `input.rows`, after the Verdict block; move build's assumed accepts into it; add the design concern |
| Roll up earlier runs' rows at ship | `.bkit/core/engine/commands/workflow/summary.ts` | `unconfirmed` and the `## Ship Completed with Assumed Items` block (`summary.ts:313-323`, `:493-501`) | The ship block — lists unconfirmed accepts only | EXTEND | Add `featureRows` to `SummaryInput`; render each earlier row with its state at ship; the old heading is a `Supersession Inventory` `DELETE` |
| Pass the feature's earlier rows to the ship summary | `.bkit/core/engine/commands/workflow/workflows.ts` | `summaryVerb` (`workflows.ts:1697-1772`); `runStatusRows` (`run-facts.ts:109`) | `summaryVerb` — already reads every event and passes this run's rows (which carry its `auto-decision` rows) | EXTEND | For ship, filter the design, build and debug `auto-decision` events into `featureRows` |
| Call the record at each ask point | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-design.md` | `grep -n 'taken without asking\|decisions apply --by=headless\|No human interviewed'` in the workflow sources | Decision Pause step 3, Loop Question sub-step 1, Grill step 1 and step 5 | EXTEND | Edit the existing branches; no new step |
| Fail when an ask point skips the record | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | `grep -rln 'ASK_POINTS' .bkit/core/engine/audits` | `owner-wait-rows.test.ts` — already audits that every owner wait writes its row | EXTEND | Add the per-point classification and the record assertions |
| Run the wired path through the built CLI | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | `find .bkit/core/engine -name '*.integration.test.ts'`; its `realBkit`, `extractStepLine` and `runStep6` helpers | `ship-verdict.integration.test.ts` — already runs ship Step 6's exact lines (which run `workflows summary`) through `dist/cli.js` | EXTEND | Add a `describe` block that runs the build, debug and design record lines and ship Step 6 |
| Document the row and the section | `.bkit/core/.bkit/workflows.md` | `grep -n 'owner-pause\|Ask points\|Confirm Assumed Items'` | The `status.jsonl` event table and § Ask points | EXTEND | Add the event row and a "Recorded and shown" bullet; edit the Grill and Confirm Assumed Items rows |

## Architecture & Component Changes

Every row in `Reuse Inventory` is `EXTEND`, so the plan adds no source file. Edit the `.bkit/core/` sources; `bkit upgrade` re-renders the mirrors (`.bkit/workflows.md`, the host agent and command copies).

**Ledger rows:** `902-auto-decision-status-row`, `902-decisions-taken-without-you-section`, `902-verdict-only-confirm-items`, `902-ship-rollup-own-status-file`, `902-wording-follows-895-default-line`, `902-order-after-895-and-911`, `902-debug-ask-off-reads-progress`, `902-apply-headless-point-flag`, `902-routine-continues-not-listed`, `902-grill-stop-assumptions-not-listed`, `902-question-wording-in-895`, `902-ship-step-11-fix-round-record`

### Database Migrations

None — bkit has no database. The new `status.jsonl` row type needs no upgrade migration (`Data Schema Integration`).

### Engine — recording

`bkit decisions record` and `apply --by=headless` are the only writers of `auto-decision`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists; `decisionsCommand` (line 326) has the verbs `compose`, `apply` and `pending`.
- **New verb `record`** (`use: "workflow"`). Flags:
  - `--file`: the status file.
  - `--workflow`: `design`, `build`, `debug` or `ship`.
  - `--point`: an `ASK_POINTS` entry.
  - `--question`, `--chose`, `--reason`.
  - `--artifact` (optional).
  - `--from-grill` (string): the grill file.
- **No `--needs-confirm` flag:** no workflow line needs it. A `record` row without `--from-grill` (the debug row) has `needsConfirm` false; `--from-grill` and `apply --by=headless` set the field themselves.
- **`record` behaviour:**
  - It derives `runtime` from `classifyAt(ctx.cwd)` and sets `why` = `headless` when `runtime` is `GITHUB_ACTION`, else `ask:false` (the rule the `apply` verb uses at line 481).
  - It appends one row through `appendLine` with `at` = `statusTimestamp()` (`.bkit/core/engine/ledgers/status.ts`). If the #836 / #860 shared locked append in `ledgers/status.ts` has landed first, both writers use it instead, and the build adds no second append path.
  - It emits `{ written, rows }`.
- **`record` validation:** it writes nothing and exits 2 (`EXIT.USAGE`) with a message that names the refused value (never the CLI's generic `unknown flag` refusal at `lib.ts:238`) when:
  - the point is unknown, or its prefix is not `--workflow`;
  - `--question`, `--chose` or `--reason` is empty;
  - any text field holds a line break;
  - `--artifact` is absolute or leaves the repo.

  It exits 3 (`EXIT_NO_STATUS`) when `--file` does not exist.

- **`--from-grill={file}`:**
  - It reads the `### Assumed, not confirmed` section of the grill file and writes one row per `- Q{n} {title}: {answer}` line, all-or-nothing:
    - `question` = `Q{n} {title}`
    - `chose` = `{answer}`
    - `reason` = `recommended answer; nobody was asked`
    - `needsConfirm` = true
    - `artifact` = the grill file
  - **Split rule:** each line splits at the first `: ` after `- Q{n} `. The grill writes `{title}` as a short topic name, so a later `: ` belongs to the answer (`- Q3 Format: CSV: one file per day` → title `Format`, answer `CSV: one file per day`).
  - `None.` writes zero rows and exits 0.
  - A missing heading, or a line of another shape, exits 2 and writes nothing; the message names the `Assumed, not confirmed` heading or quotes the malformed line.
  - `--point` must be `design.grill`, and `--question` / `--chose` / `--reason` are refused alongside it; each refusal exits 2 with a message naming the refused point or flag.
- **`apply --by=headless`:**
  - **New flag:** a required `--point` (a `build.*` entry of `ASK_POINTS`, else exit 2 with a message saying the point must be a `build.*` point, never the generic `unknown flag` refusal).
  - **Order of checks and writes:**
    1. It resolves `status.jsonl` beside the decision file (`path.join(path.dirname(file), "status.jsonl")`) and exits 3 when that file is missing, before it writes anything.
    2. It computes the applied items, and appends their rows first.
    3. It then writes the decision file as today.

    Rows go first because a resumed run finds every item of a written decision file decided: `applied` would be empty, and the rows would never be written. If the decision-file write fails after the rows land, the resumed run appends the same rows again, and the summary's dedupe (workflow, point, artifact, question and choice) lists each once.

  - **Rows it appends:**
    - one per `applied` item: `question` = `Q{n} — {title}`, `chose` = the option with its letter (`optionAnswer` order), `reason` = the item's `reason`, `needsConfirm` = `assumed`, `artifact` = the repo-relative decision file, `q` = `n`.
    - On `loop` = `Try again`, the loop item alone gets a row.
    - Hard blockers get no row.
  - **Output and exits:** the output keys gain `recorded` (the row count). Exit 4 is unchanged.
- Uses `askPoint` (`.bkit/core/engine/commands/workflow/counters.ts:57`, an unknown point exits 2) over `ASK_POINTS` (`.bkit/core/engine/shared/settings.ts:88`). `decisions.ts` already imports `loopProgress` from `counters.ts`, so no new module dependency is added.

#### [MODIFY] `.bkit/core/engine/commands/workflow/status.ts`

- **Existence Check:** `FOLDED_TYPES` exists (line 363); the `row` verb refuses its types at line 699.
- Add `OWN_VERB_TYPES = new Map([["auto-decision", "bkit decisions record"]])`. `status row --type=auto-decision` exits 2 naming that verb and writes nothing.

#### [MODIFY] `.bkit/core/engine/commands/workflow/run-facts.ts` and `scripts/harvest/bkit-harvest.mjs`

- **Existence Check:** `MARK_ROWS` exists in `run-facts.ts` (line 338) and in `bkit-harvest.mjs` (line 1479).
- Add `auto-decision`, so step minutes skip it like `owner-pause`.
- `MARK_ROWS` has a second copy in bkit's harvest script, `scripts/harvest/bkit-harvest.mjs:1479` (`docs/knowledge.jsonl` `mark-rows-copies-must-stay-in-parity`). `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` (line 3021) asserts the two sets are equal, so Task 1 adds `auto-decision` to both.

### Engine — summary

`buildSummary` stays pure; `summaryVerb` does all file reads.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** `buildSummary` (line 194), `SummaryInput` (line 80), the `acceptItems` / `unconfirmed` blocks and the ship heading (lines 493-501) exist.
- **Inputs:** this run's section lines come from the `auto-decision` rows in `input.rows`. `SummaryInput` gains one optional field, `featureRows` (ship only: the design, build and debug rows of the feature's status file); absent reads as an empty list, so existing callers keep working.
- **Section placement:** `## Decisions Taken Without You` renders after the Verdict block (after build's plan-task lines and ship's publish lines), before `## Steps`, in all five workflows. With no line, it reads `None`.
- **Line shape:**
  ```text
  - {point} {question}: {verb} {chose} — {reason} ({why}, {runtime}). {confirm}({artifact})
  ```
  - `{verb}` is `taken as`, or `the design assumes` for `design.grill`.
  - A `design.grill` line has no ` — {reason}` part: it reads `- {point} {question}: the design assumes {chose} ({why}, {runtime}). {confirm}({artifact})`, as the Concrete Example step 1 shows. The row still carries its `reason` (`recommended answer; nobody was asked`); the line leaves it out because `the design assumes` and `({why}, …)` already say it.
  - `{confirm}` is `Needs your confirmation: ship asks. ` for a build row with `needsConfirm`, and `Needs your confirmation at the plan's Acceptance Scenario box. ` for a grill row.
- **Dedupe:** lines are deduplicated on workflow, point, artifact, question and choice, which covers a `merge=union` duplicate.
- **Legacy decision files:**
  - A build or ship run's `Accept (assumed)` items read from decision files (today's `acceptItems`) and covered by no row are rendered as legacy lines with the point `build`.
  - This covers status files written before the change (Success Criterion 5).
- **Verdict:**
  - Build's existing assumed-accept concern is unchanged.
  - A design run with any grill row adds the concern `{n} grill answer(s) assumed without the owner (confirm at the plan's Acceptance Scenario box)`.
  - `Fix now` and `Try again` rows add no concern.
- **Removed:**
  - The `- Assumed, not confirmed:` items under `## Risks and Action Items` are removed; `- Accepted:` items stay.
  - The `## Ship Completed with Assumed Items` block is removed (`[DELETE]` below).
- **Ship rows:**
  - Each `featureRows` line renders before ship's own rows.
  - A build row with `needsConfirm` gets its state at ship from the matching `unconfirmed` / decision-file item, using #895's Confirm Assumed Items wording:
    - `Confirmed by you at ship.`
    - `Rejected by you at ship; written as a needs-decision deferral.`
    - `Not confirmed (Recommended: none — only you can accept it); written as a needs-decision deferral.`
  - An unconfirmed item with no row (a legacy build) renders the same way.
  - Ship's verdict rule is unchanged (Open Question Q5).

#### [DELETE] the `## Ship Completed with Assumed Items` block in `buildSummary`, `.bkit/core/engine/commands/workflow/summary.ts:493-501`

- Its items move into `## Decisions Taken Without You` (Open Question Q2). The engine and the workflows never read the heading, and no test asserts it today (the heading appears only at `summary.ts:496`); Task 5's new test is the first to cover the block.

#### [DELETE] the `- Assumed, not confirmed:` Risks items in `buildSummary`, `.bkit/core/engine/commands/workflow/summary.ts:519`

- Build's assumed accepts are listed once, in the new section; `- Accepted:` items and the verdict concern stay. Removed in Task 4.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** `summaryVerb` (line 1697) reads `events` and `runStatusRows` (line 1716).
- **Rows passed in:** this run's `auto-decision` rows already reach `buildSummary` through `rows` (`runStatusRows` keeps every type of the run's workflow from its start on). For `--workflow=ship`, add `featureRows` = every `auto-decision` event in `events` whose `workflow` is `design`, `build` or `debug`, in file order.
- **States at ship:** `buildSummary` reads each rolled-up build artifact through the existing `read` callback and `parseDecisionItems`; a missing artifact renders `state unknown ({artifact} not found)` and never throws.

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** Decision Pause step 3 runs `decisions apply --by=headless` at line 170.
- Add `--point={PAUSE_POINT}`, and the route `**If** exit 2 **or** exit 3 → **Failure Path**`. The existing `**Else** → **Failure Path**` already covers them; spell them out only if #895 changed that line.
- **Gate checklist:** the Decision Pause gate's `Questions asked in the session, or recommendations taken (decisions apply --by=headless)` line (line 303) adds `, each one recorded`.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** Loop Question sub-step 1 (line 123) narrates `taken without asking` with no progress read; sub-step 2 reads `counters progress` once. `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:1905-1916` asserts that the Loop Question holds exactly one `"{BKIT}" counters progress` line (`toEqual` over `commandLines`) and the routine-continue `**If** `LOOP_LIMIT` is not held …` line.
- **One progress read:** the `LOOP_ASK` = false branch moves after the progress read, so the Loop Question keeps exactly one `counters progress` line and `workflow-shape.test.ts` stays green unchanged. The sub-steps become:
  1. Read the loop's progress with today's sub-step 2 command, unchanged. Route, first match wins:
     - **If** exit non-zero **and** `LOOP_ASK` = false → write the record (sub-step 3's command, with `--reason="progress could not be read"`) → narrate today's `taken without asking` line → return to the calling step.
     - **If** exit non-zero → **Failure Path**, as today.
     - **Else** → hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
  2. **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate today's routine-continue line → return to the calling step. This line is unchanged and writes no row, with `ask` on or off.
  3. **If** `LOOP_ASK` = false → write the record, then narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking` → return to the calling step:
     ```bash
     "{BKIT}" decisions record --file="{STATUS}" --workflow=debug --point=debug.{LOOP_POINT} --question="Q1 — {Fix|Soak}" --chose="B) Try again" --reason="progress {LOOP_TREND}, failures {LOOP_COUNTS}" --artifact="{LOOP_ARTIFACT}" >/dev/null || exit 1
     ```
  4. Ask the owner: today's sub-step 3, unchanged.
- **`LOOP_ARTIFACT`:** the newest `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-*.md` when `LOOP_POINT` = `fix`, or the newest `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-soak-*-log.md` when `LOOP_POINT` = `soak`: the same file sub-step 4's message names. **If** no such file exists → leave `--artifact` out, so a missing log never trips the artifact check and sends a working run down the Failure Path.
- **What is recorded:** with `ask` false, every attempt the question would have asked writes one row: `LOOP_LIMIT` held, or a `stuck` or `worse` trend, or an unread progress. An improving attempt with `ask` false now narrates the routine-continue line, with its failure counts. Routing is unchanged.
- **Gate — Loop Question:** add `Each ask-off attempt the question would have asked recorded (decisions record)`.

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`

- **Existence Check:** Grill step 1 routes `GRILL_ASK` = false to "nobody is asked" (line 256); step 5 adds the `No human interviewed this run` line (line 312).
- **Step 5:** after the grill file is written, and only when nobody was asked. The fence MUST sit nested under the existing `- **If** nobody was asked →` bullet (line 312), on that `**If**` arm:
  ```bash
  "{BKIT}" decisions record --from-grill="docs/plans/{YYYYMM}/logs/{FID}/design-grill-{RUN}.md" --file="{STATUS}" --workflow=design --point=design.grill >/dev/null || exit 1
  ```
  - **Why the arm matters:** the completeness contract (`deriveContract`, `.bkit/core/engine/checks/status-holes.ts:367`) makes every `"{BKIT}"` call in a `Step N` section a required call unless `branchLines` puts it on a `- **If**` / `**Else**` arm. Every grill path reaches sub-step 5 (`bkit-design.md:259`, `:285`, `:301` route with `→ step 5`), so a fence outside the arm would give every design run that asked the owner an evidence hole in its `completeness` row, and the next workflow start would print `previous run ... was incomplete` (`previousRunWarning`, `workflows.ts:1126-1142`).
  - A human-stopped grill writes no row (Open Question Q3).
- The grill gate gains `Assumed answers recorded when nobody was asked (decisions record --from-grill)`.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** Confirm Assumed Items (line 360) and Step 11 (line 861) exist at base.
- No line changes for #902 after #911 lands. Task 7's `ship.merge` guard asserts that every `MERGE_ASK` = false branch ends in **Failure Path** and that the file has no `taken without asking` narration left, so a ship ask point never moves past a question without a record.
- **No new checklist line:** ship's Step 6 checklist already holds `workflows summary` printed a verdict, and the engine renders `## Decisions Taken Without You` with the earlier runs' rows inside that same call. Ship's orchestrator runs no new command, so a checklist line would check nothing the agent can skip. Build, debug and design gain lines because each runs a new record call.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** local entries hold the edited lines (the debug Loop Question at lines 10086 and 10088, the design grill at 10251-10253, the build gate at 9883).
- Hand-edit each local entry to match its edited workflow line (`docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits`).

### Tests

#### [MODIFY] `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`

- **Existence Check:** the file exists and audits the owner-wait rows in the workflow sources.
- **Classification table:** add a per-point table that covers every `ASK_POINTS` entry, each with the record line its workflow must contain or `failure-path-only`:
  - `build.verify`, `build.challenge`, `build.tests` → `decisions apply --by=headless --point={PAUSE_POINT}` in `bkit-build.md`.
  - `debug.fix`, `debug.soak` → `decisions record --file="{STATUS}" --workflow=debug --point=debug.{LOOP_POINT}` in `bkit-debug.md`.
  - `design.grill` → `decisions record --from-grill=` in `bkit-design.md`.
  - `ship.merge` → `failure-path-only`: every `MERGE_ASK` = false branch in `bkit-ship.md` ends in **Failure Path**, and the file holds no `taken without asking` narration (true once #911 lands).

  An `ASK_POINTS` entry missing from the table fails the test.

- **Guards, not `TEST FIRST` tests:** the classification check and the `ship.merge` check pass as soon as they are written (the table sits in the test file; `bkit-ship.md` is unchanged by this plan), so they cannot go red first. Each is a guard that runs in the suite:
  - The classification guard carries a `RED-PROOF:` case, in the style of `question-option-format.test.ts:433-501`, that runs the same check over a synthetic point list holding one unclassified point and asserts the `has no record classification` message.
  - The `ship.merge` guard asserts on the routing lines, so a branch that continues past `ship.merge` without the narration phrase still fails it.

#### [MODIFY] `.bkit/core/engine/checks/status-holes.test.ts`

- **Existence Check:** the file exists, and its `describe("source derivation")` (line 154) already calls `deriveContract` on the shipped workflows (line 157); each call carries `branch: boolean` (`status-holes.ts:134`).
- Add a case to that `describe`: `deriveContract` on the shipped `bkit-design.md` gives the `decisions record` call `branch: true`, so a design run that asked the owner and wrote no record is not holey.

#### [READ] `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

- Lines 1905-1916 pin the debug Loop Question's single `counters progress` line and its routine-continue line. The one-progress-read layout above keeps both, so the test passes unchanged; Task 6's `DONE WHEN` runs it.

#### [MODIFY] `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`

- **Existence Check:** the file exists, with `realBkit`, `extractStepLine` and `runStep6`.
- **New `describe` block:**
  1. It runs the exact build apply line, the debug record line, the design `--from-grill` line and ship Step 6 through `dist/cli.js` with `BKIT_RUNTIME=GITHUB_ACTION`.
  2. It asserts the summary section and the comment body.

### Docs

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the `status.jsonl` event table (lines 289-301), § Ask points (line 999), the Decision Pause `Accept (assumed)` bullet (line 991), the Grill row (line 913) and the Confirm Assumed Items row (line 1124) exist.
- **Changes:**
  - Add the `auto-decision` event row.
  - Add the "Recorded and shown" bullet to § Ask points.
  - Change the Accept (assumed) bullet's "lists each one" to name the new section.
  - Change the Grill row's "ship does not ask about them" to "listed in the design and ship summaries, never asked".
  - Change the Confirm Assumed Items row's heading to the new section.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the key-test rows for `commands/workflow/summary.test.ts` (line 645) and `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` (line 814) exist; `owner-wait-rows.test.ts` has no row.
- Extend those two rows with what they now prove, and add an `owner-wait-rows.test.ts` row (Unit (markdown-invariant)) for the per-point record audit.

### Cron Jobs & Scheduled Tasks

None — no scheduled task is added or changed.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The `## Ship Completed with Assumed Items` block in `buildSummary`, `.bkit/core/engine/commands/workflow/summary.ts:493-501` | Ship's unconfirmed items in `## Decisions Taken Without You` | DELETE | Same items, one section (Open Question Q2); nothing in the engine or the workflows reads the heading |
| The `- Assumed, not confirmed:` items under `## Risks and Action Items` in `buildSummary` (`summary.ts:519`) | Build's `needsConfirm` lines in `## Decisions Taken Without You` | DELETE | The issue moves them so nothing is listed twice; the verdict concern stays |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | Add the `auto-decision` event row (fields, writers, "Step minutes skip it"); add § Ask points "Recorded and shown" bullet (every choice taken with `ask` false or headless writes one row, listed in `## Decisions Taken Without You`; routine continues are not listed); the Decision Pause `Accept (assumed)` bullet names the section; the Grill row says grill assumptions are listed in the design and ship summaries, never asked; the Confirm Assumed Items row names the section instead of the removed heading. `bkit upgrade` re-renders `.bkit/workflows.md` |
| `.bkit/core/workflows/bkit-build.md`, `bkit-debug.md`, `bkit-design.md` | The record lines and the gate checklist lines (`Architecture & Component Changes` § Workflows) |
| `.bkit/instructions.md` | Hand-edit the local entries of every edited standing workflow line (`docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits`) |
| `.bkit/core/.bkit/cli.md` | `pnpm cli:sync` regenerates the `decisions` verb table (`record`, `apply --point`) |
| `docs/testing.md` | Extend the `commands/workflow/summary.test.ts` row (line 645) and the `ship-verdict.integration.test.ts` row (line 814); add an `owner-wait-rows.test.ts` row |
| `docs/capabilities.md` | `pnpm bkit:graph:refresh` regenerates the register for the new verb and fields |
| `docs/decisions.jsonl` | Rows written by this plan (`**Ledger rows:**`) |
| `docs/knowledge.jsonl` | None |
| `docs/architecture.md` | None — no new file kind, module or topology change |
| `docs/technology.md` | None — no framework or library change |
| `docs/data-schema.md` | None — bkit has no database; the `status.jsonl` contract lives in `.bkit/core/.bkit/workflows.md` |
| `docs/design.md` | None — no UI |
| `docs/observability.md` | None — the verb logs through `ctx.log` with the existing `[bkit-decisions]` prefix |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit has no database; `auto-decision` rows left in status files are ignored by `fold` and by an older `workflows summary` |
| **Code** | `git revert {COMMIT}` of the build's squash commit, then `bkit upgrade` to re-render the mirrors | Reverting the engine and the workflow lines together keeps `decisions apply --by=headless` and its caller in step |
| **Risk window** | None | Engine and workflow text ship in one package release |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the engine's record (Group 1), then the summary that reads it (Group 2), then the workflow lines that call it (Group 3), then the wired path, docs and generated files (Group 4). Start only after #895 and #911 are on `dev` (`Pre-Flight` § Prerequisite Plans); re-point each line anchor by symbol. Integration shape, advice only: one PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Record each choice in the engine

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `bkit decisions record`; refuse the type in `status row`; skip it in step minutes
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: a `record` verb with `--file`, `--workflow`, `--point`, `--question`, `--chose`, `--reason` and `--artifact` (no `--needs-confirm` flag; `needsConfirm` is false on a plain `record` row); `why` and `runtime` from `classifyAt`; validation per `Architecture & Component Changes`, each refusal naming the refused value; one row through `appendLine`
  - **READ:** `askPoint` in `.bkit/core/engine/commands/workflow/counters.ts`: unknown point → exit 2
  - **READ:** `ASK_POINTS` in `.bkit/core/engine/shared/settings.ts`: the seven points
  - **READ:** `classifyAt` in `.bkit/core/engine/commands/workflow/runtime.ts`: the runtime classification
  - **READ:** `appendLine` in `.bkit/core/engine/ledgers/status.ts`: the row append
  - **READ:** `statusTimestamp` in `.bkit/core/engine/ledgers/status.ts`: the row's `at`
  - **UPDATE:** `statusCommand` in `.bkit/core/engine/commands/workflow/status.ts`: a type → verb map beside `FOLDED_TYPES`; `row --type=auto-decision` exits 2 naming `bkit decisions record`
  - **UPDATE:** `MARK_ROWS` in `.bkit/core/engine/commands/workflow/run-facts.ts`: add `auto-decision`
  - **UPDATE:** `MARK_ROWS` in `scripts/harvest/bkit-harvest.mjs`: add `auto-decision`, so its parity test `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` stays green
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `pnpm cli:sync` regenerates the `decisions` table, so `.bkit/core/engine/tools/cli-doc.test.ts` stays green
  - **DONE WHEN:** `bkit decisions record` exists with the flags above and has no `--needs-confirm` flag, and the eight tests below pass; `pnpm typecheck`, `.bkit/core/engine/tools/cli-doc.test.ts` and `pnpm test:harvest` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record > writes one auto-decision row with why and runtime from the runtime classification` fails on no row being appended, or a row without why "ask:false" with `BKIT_RUNTIME=LOCAL` set (so the CI lane's `CI` / `GITHUB_ACTIONS` cannot make it read `headless`)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record > sets why to headless under GITHUB_ACTION` fails on the row's why not reading "headless" with `BKIT_RUNTIME=GITHUB_ACTION`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record > refuses a point of another workflow or an unknown point` fails on the verb accepting `--workflow=debug --point=build.verify` and writing a row, instead of exit 2 with "unknown point" or a workflow mismatch on stderr, never the CLI's `unknown flag` or unknown-verb refusal
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record > refuses an empty or multi-line field and writes nothing` fails on a `--reason` with a line break reaching the status file instead of exit 2 naming the "line break"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record > exits 3 and writes nothing when the status file is missing` fails on the verb creating `status.jsonl` instead of exit 3
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record > refuses an absolute or out-of-repo --artifact and writes nothing` fails on an `--artifact=/tmp/x.md` or `--artifact=../outside.md` row reaching the status file, instead of exit 2 with stderr naming the "--artifact" path
    - `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status row > refuses --type=auto-decision and names bkit decisions record` fails on the generic writer appending the row instead of exit 2 naming "bkit decisions record"
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `runStatusRows / stepsBlock / ciList > stepsBlock skips auto-decision rows in step minutes` fails on an `auto-decision` row splitting a step's minutes

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add `decisions record --from-grill`
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `--from-grill={file}` parses `### Assumed, not confirmed` `- Q{n} {title}: {answer}` lines into one row each, split at the first `: ` (`needsConfirm` true, `artifact` the grill file); `None.` → zero rows; only `--point=design.grill`, and no `--question` / `--chose` / `--reason` beside it; all-or-nothing; each refusal names the heading, the line, the point or the flag it refuses
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `pnpm cli:sync` adds the flag
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the six tests below pass, and `cli-doc.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record --from-grill > writes one row per assumed grill answer, each needing confirmation` fails on two assumed lines giving fewer than two rows, or rows with `needsConfirm` false
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record --from-grill > writes nothing and exits 0 for None.` fails on a row written for the `None.` line, or on a non-zero exit
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record --from-grill > refuses a grill file with no Assumed, not confirmed heading` fails on exit 0, or on an exit 2 whose stderr does not name "Assumed, not confirmed" (the CLI's `unknown flag --from-grill` refusal does not count)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record --from-grill > refuses a malformed assumed line and writes no row at all` fails on the good lines before the bad one being written, or on stderr not quoting the malformed line "- Q3 no colon here" (the CLI's `unknown flag --from-grill` refusal does not count)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record --from-grill > refuses a point other than design.grill, or --question/--chose/--reason beside it` fails on `--point=build.verify` or a `--chose` beside `--from-grill` writing rows, instead of exit 2 with stderr naming the refused "design.grill" point or the refused flag
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions record --from-grill > splits each assumed line at the first colon, so the answer keeps its own` fails on `- Q3 Format: CSV: one file per day` giving a row whose chose is not "CSV: one file per day"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `decisions apply --by=headless` takes `--point` and writes one row per settled item
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `apply` verb's `--by=headless` branch gains a required `--point` (a `build.*` point, refused with a message saying so); checks `status.jsonl` beside the decision file before writing anything (exit 3); appends one row per `applied` item (`needsConfirm` = `assumed`, `q` = `n`, `chose` with its letter) before it writes the decision file, the loop item alone on `Try again`, none for hard blockers; output key `recorded`
  - **READ:** `applyRecommendations` in `.bkit/core/engine/commands/workflow/decisions.ts`: `applied` and `loop`
  - **READ:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: the items after applying
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the existing `bkit decisions apply --by=headless` tests, and the `assumed()` helper of `describe("bkit decisions apply --by=owner and pending")` (line 460, which runs `apply --by=headless` with no `--point` and no status file), pass `--point` and create the status file; these edits land in the group's tests step, before the red
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `pnpm cli:sync` adds the flag and output key
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the six tests below, the updated existing apply tests and every `pending` / `--by=owner` case built on `assumed()` pass, and `cli-doc.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes one auto-decision row per item it settles` fails on an `Accept (assumed)` and a `Fix now` item giving no rows, or the Accept row without `needsConfirm` true and its `q`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes the loop answer alone on Try again` fails on the status file not holding exactly one row, the "Try again" loop row, or on the waiting items getting rows next to it
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes no row for a hard blocker` fails on exit 4 leaving a row for the question with no recommendation, or on the settled items of the same file getting no rows (a handler that returns before appending on exit 4)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > refuses a missing --point and writes nothing` fails on the decision file being rewritten without `--point`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > refuses a point outside build` fails on `--point=debug.fix` being accepted, or on an exit 2 whose stderr does not say the point must be a "build." point (the CLI's `unknown flag --point` refusal does not count)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > exits 3 and leaves the decision file unchanged without a status file` fails on `Decision:` lines being written before the missing status file is noticed

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: One summary section

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Render `## Decisions Taken Without You` from the run's own rows
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: the section after the Verdict block in all five workflows, `None` when empty; the line shape, dedupe and legacy decision-file lines per `Architecture & Component Changes`; the design grill concern; remove the `- Assumed, not confirmed:` Risks items (`[DELETE]`)
  - **READ:** `SummaryInput` in `.bkit/core/engine/commands/workflow/summary.ts`: `rows` carries the run's `auto-decision` rows
  - **READ:** `NEXT_STEP` in `.bkit/core/engine/commands/workflow/summary.ts`: design CONCERNS still names `/bkit-plan`
  - **READ:** `.bkit/core/engine/commands/workflow/summary.test.ts`: no existing case asserts `- Assumed, not confirmed:` under Risks; `counts a lettered Accept decision as accepted at the Decision Pause` (line 831) keeps passing unchanged
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** the ten tests below and every existing `summary.test.ts` case pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > puts Decisions Taken Without You right after the Verdict block in every workflow` fails on "## Decisions Taken Without You" missing, or sitting after `## Steps`, in any of the five workflows
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > reads None when the run took no choice without the owner` fails on the section being left out instead of reading `None`
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > renders a build row with its point, choice, reason, why, runtime and file` fails on a line without "taken as A) Accept" and its decision file
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > marks a build row that needs confirmation` fails on an assumed accept's line lacking "Needs your confirmation: ship asks."
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > renders a grill row as the design assumes` fails on a grill line lacking "the design assumes" and the Acceptance Scenario box, or carrying the row's ` — recommended answer; nobody was asked` reason, so it differs from the Concrete Example step 1 line
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > lists automatic Fix now and Try again rows and keeps the verdict PASS` fails on a build with only those rows missing its "taken as B) Fix now" or "taken as B) Try again" line, or reading CONCERNS instead of PASS
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > makes a design CONCERNS for assumed grill answers` fails on the design verdict staying PASS without "grill answer(s) assumed without the owner"
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > lists build's assumed accepts once, not under Risks and Action Items` fails on "Assumed, not confirmed:" still listed under `## Risks and Action Items`
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > lists legacy assumed accepts when no row covers them` fails on a run with no `auto-decision` rows reading `None` while its decision file holds an `Accept (assumed)`
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > lists a union-merged duplicate row once` fails on two identical rows giving two lines

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Roll up the feature's earlier rows at ship; remove the old ship heading
  - **UPDATE:** `SummaryInput` in `.bkit/core/engine/commands/workflow/summary.ts`: optional `featureRows`
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: each earlier row rendered before ship's own, a build `needsConfirm` row with its state at ship (`read` + `parseDecisionItems`), unconfirmed legacy items in the section; ship verdict rule unchanged
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: remove the `## Ship Completed with Assumed Items` block (`[DELETE]` in `Architecture & Component Changes`); its items move into the section
  - **UPDATE:** `summaryVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: for `--workflow=ship`, pass `featureRows` = the design, build and debug `auto-decision` events
  - **READ:** `.bkit/core/engine/commands/workflow/summary.test.ts`: no existing case asserts `## Ship Completed with Assumed Items` (the heading appears only at `summary.ts:496`), so the new tests below are the first to cover the block
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: the decision-file lines the engine writes for a confirmed, rejected and deferred item (lines 527, 531 and 583); the state-at-ship fixtures are built from these lines, or by running `decisions apply --by=owner` / `decisions pending --defer`, in #895's layout, never hand-typed
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the six tests below and every existing `summary.test.ts` and `workflows.test.ts` case pass; `rg -n 'Ship Completed with Assumed Items' .bkit/core/engine` finds no match outside tests that assert its absence
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > ship lists the feature's earlier design, build and debug rows` fails on a ship summary without the earlier "design.grill" and `debug.fix` lines
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > ship gives each rolled-up assumed accept its state at ship` fails on a confirmed item lacking "Confirmed by you at ship." or a deferred one lacking its needs-decision wording
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > ship lists unconfirmed items in the section with no separate heading` fails on "## Ship Completed with Assumed Items" still rendered
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > lists a rolled-up grill row and keeps a PASS ship at PASS` fails on the ship summary missing the rolled-up "the design assumes" line, or on that row turning a PASS ship into CONCERNS
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary > ship renders state unknown for a rolled-up build row whose decision file is gone` fails on `buildSummary` throwing, or on the line lacking "state unknown (" and the missing artifact path
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows summary > ship reads the auto-decision rows of earlier runs in the status file` fails on the ship summary file listing only ship's own rows

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Every ask point writes the record

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Build and debug write the record
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 3's apply line gains `--point={PAUSE_POINT}`; the Decision Pause gate line names the record
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Loop Question reads `counters progress` once, before the `LOOP_ASK` = false branch (`Architecture & Component Changes` § `bkit-debug.md`); with `ask` false it runs `decisions record` before its narration when the question would have asked (`LOOP_LIMIT` held, a stuck or worse trend, or a failed read); a routine continue writes nothing; `--artifact` is `LOOP_ARTIFACT`; the gate gains its line
  - **READ:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: lines 1905-1916 pin the single `counters progress` line and the routine-continue line, which the one-read layout keeps
  - **UPDATE:** `.bkit/instructions.md`: hand-edit the local entries of the edited lines (the debug Loop Question entries near lines 10086 and 10088, the build gate entry near line 9883)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`: a `describe` for ask-point records
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated by the same run
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** the four tests below pass; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` passes unchanged; `pnpm tsx .bkit/core/engine/tools/instructions.ts` (the no-flag check) reports no drift; `.bkit/core/engine/render/trackers.test.ts` and `.bkit/core/engine/tools/instructions.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `every ask point records the choice it takes without asking > bkit-build.md passes its ask point to decisions apply --by=headless` fails on the apply line lacking "--point={PAUSE_POINT}"
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `every ask point records the choice it takes without asking > bkit-debug.md records an ask-off Loop Question choice before it narrates` fails on the `LOOP_ASK` = false branch narrating "taken without asking" with no `decisions record --point=debug.{LOOP_POINT}` line before it
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `every ask point records the choice it takes without asking > bkit-debug.md records on the would-have-asked branch and never on a routine continue` fails on the record line missing from the `LOOP_ASK` = false branch after the routine-continue line, or on a record line sitting in the routine-continue branch where the trend is neither stuck nor worse
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `every ask point records the choice it takes without asking > bkit-debug.md records the choice when the progress read fails` fails on the exit-non-zero, `LOOP_ASK` = false arm going to the Failure Path or narrating with no `decisions record` line whose reason is "progress could not be read"

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Design records its assumed grill answers; every ask point is classified
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: Grill step 5 runs `decisions record --from-grill` after the grill file is written, in a fence nested under the existing `- **If** nobody was asked →` bullet (line 312), so the completeness contract reads it as a branch call; the grill gate gains its line
  - **UPDATE:** `.bkit/instructions.md`: hand-edit the local entries of the edited grill lines (near lines 10251-10253)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`: the per-point classification table over `ASK_POINTS`, with `ship.merge` as failure-path-only
  - **UPDATE:** `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`: two guards, outside `TEST FIRST` because each passes as soon as it is written: `classifies every ASK_POINTS entry` (with a `RED-PROOF:` case that runs the check over a synthetic point list holding one unclassified point and asserts `has no record classification`, as `question-option-format.test.ts:433-501` does), and `ship.merge goes only to the Failure Path` (every `MERGE_ASK` = false branch of `bkit-ship.md` ends in **Failure Path**, and no `taken without asking` narration is left)
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: a case over the shipped `bkit-design.md`
  - **READ:** `.bkit/core/workflows/bkit-ship.md`: no `taken without asking` narration is left once #911 has landed
  - **READ:** `deriveContract` in `.bkit/core/engine/checks/status-holes.ts`: a `"{BKIT}"` call in a `Step N` section is a required call unless it sits on a branch arm
  - **READ:** `branchLines` in `.bkit/core/engine/checks/status-holes.ts`: a line under a `- **If**` / `**Else**` bullet is a branch line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`
  - **DEPENDS ON:** 2, 6
  - **DONE WHEN:** Precondition: `dev` holds #911 (`Pre-Flight` § Prerequisite Plans) before this task starts. The three tests below and both guards pass; the instructions no-flag check reports no drift; `trackers.test.ts` and `instructions.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `every ask point records the choice it takes without asking > bkit-design.md records its assumed grill answers only when nobody was asked` fails on Grill step 5 lacking "--from-grill", or on the fence not sitting under the `- **If** nobody was asked →` bullet
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `every ask point records the choice it takes without asking > finds the record line of every classified point (not vacuous)` fails on a classified point whose workflow holds no matching record line (today `design.grill`, whose `decisions record --from-grill=` line is missing)
    - `.bkit/core/engine/checks/status-holes.test.ts` `source derivation > puts the design grill record call on a branch arm` fails on `deriveContract` over the shipped `bkit-design.md` finding no `decisions record` call, or giving it "branch: false", so a design run that asked the owner would read holey

<!-- bkit:task 7 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Wired path, docs and generated files

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Run the exact workflow lines through the built CLI under `GITHUB_ACTION`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`: a `describe` that takes the build apply line, the debug record line, the design `--from-grill` line, the Summary steps' `workflows summary` and `steps finish --comment-body` lines and ship Step 6 verbatim with `extractStepLine`, and runs them through `dist/cli.js` (`realBkit`) with `BKIT_RUNTIME=GITHUB_ACTION` in a real temp git repo
  - **UPDATE:** `dist/cli.js`: `pnpm build` rebuilds `dist/` from the Groups 1-2 engine edits before these tests run, since `realBkit` runs `dist/cli.js`; `dist/` lands in the same commit as the engine change (`.agents/rules.md` § Engine builds)
  - **DEPENDS ON:** 5, 6, 7
  - **DONE WHEN:** `pnpm build` succeeds and `dist/` is rebuilt; the four tests below pass under `pnpm bkit:test:file .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `choices taken without the owner reach the summary (headless, built CLI) > the build, debug and design lines end in summaries listing every choice` fails on a written summary lacking "## Decisions Taken Without You" or one of the recorded lines
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `choices taken without the owner reach the summary (headless, built CLI) > the comment body and the final message carry the same section` fails on the body the fake `gh` receives differing from the `workflows close --final-return` output in that section
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `choices taken without the owner reach the summary (headless, built CLI) > ship rolls up a design grill assumption and a build assumed accept` fails on the ship summary lacking "the design assumes" or the build item's needs-decision wording
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `choices taken without the owner reach the summary (headless, built CLI) > a status file written before the change still produces a summary` fails on `workflows summary` exiting non-zero, or its section missing, on a status file with no `auto-decision` rows

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Update the workflow contract and the testing doc
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `auto-decision` event row; the § Ask points "Recorded and shown" bullet; the Decision Pause `Accept (assumed)` bullet; the `/bkit-design` Grill row; the `/bkit-ship` Confirm Assumed Items row (`Documentation Updates`)
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/summary.test.ts` row (line 645) and the `ship-verdict.integration.test.ts` row (line 814); a new `owner-wait-rows.test.ts` row
  - **DEPENDS ON:** 5, 7, 8
  - **DONE WHEN:** `.bkit/core/.bkit/workflows.md` holds an `auto-decision` event row and a "Recorded and shown" bullet; `rg -n 'Ship Completed with Assumed Items' .bkit/core/.bkit/workflows.md` finds nothing; `docs/testing.md` names `owner-wait-rows.test.ts`; `pnpm bkit:lint:prose` and `pnpm format:tables:check` pass
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Regenerate the mirrors, the built CLI and the capability register
  - **UPDATE:** `.bkit/workflows.md`: `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders it and the host mirrors
  - **UPDATE:** `dist/cli.js`: `pnpm build` rebuilds `dist/`
  - **UPDATE:** `docs/capabilities.md`: `pnpm bkit:graph:refresh` after the engine edits are staged
  - **DEPENDS ON:** 8, 9
  - **DONE WHEN:** `bkit check` reports no mirror drift; `pnpm bkit:graph:check` passes; `pnpm bkit:gate:static-unit-integration` passes; a dogfood run on a fresh scratch consumer (`pnpm build`, then `node dist/cli.js decisions record …` into a scratch `status.jsonl` and `node dist/cli.js workflows summary --workflow=build …`) writes the `auto-decision` row and a summary whose `## Decisions Taken Without You` lists it (`.agents/rules.md` § Verify before complete)
  - **TEST FIRST:** n/a — generated files only (mirrors, `dist/`, the capability register); regenerating them makes them pass

<!-- bkit:task 10 end -->

<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (this plan has none).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed (the `decisions apply --by=headless` cases and the `assumed()` helper in `decisions.test.ts`, the harvest `MARK_ROWS is the engine's` parity test, the render snapshots), and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** `decisions record` refusals go to stderr through `ctx.log` / `CommandError` with the `[bkit-decisions]` prefix (`docs/observability.md` § Log Format).
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared gate this change needs) and `bkit check` pass.
- [ ] **Test Synchronization:** the existing `decisions apply --by=headless` cases and the `assumed()` helper in `decisions.test.ts` (Task 3), the harvest `MARK_ROWS` copy (Task 1), and the render snapshots `.bkit/core/engine/render/__snapshots__/bkit-{build,debug,design}.none.txt` (Tasks 6-7) are updated with the tasks that break them; `summary.test.ts` has no existing case on the ship heading or the Risks lines, and `workflow-shape.test.ts` stays unchanged. bkit has no E2E tier.
- [ ] **Build Configuration:** test files stay out of `dist/` through the existing `tsconfig.json` exclude; no test-only file is added.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/decisions.test.ts`, `status.test.ts`, `run-facts.test.ts`):** the record tests, against real temp folders and status files; the `GITHUB_ACTION` case and the `LOCAL` case each set `BKIT_RUNTIME` and restore it, because `classify` returns `GITHUB_ACTION` whenever `CI` or `GITHUB_ACTIONS` is true (`runtime.ts:111`).
- [ ] **Unit (`.bkit/core/engine/commands/workflow/summary.test.ts`, `workflows.test.ts`):** the summary tests; `workflows.test.ts` uses its real temp git repo helpers.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`, `.bkit/core/engine/checks/status-holes.test.ts`):** the ask-point audit and its two guards, over the shipped workflow sources; the completeness contract over the shipped `bkit-design.md`.
- [ ] **Integration (`.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`):** the wired-path tests: the exact workflow lines through `dist/cli.js` with `BKIT_RUNTIME=GITHUB_ACTION` and the fake `gh` fixture; each case builds its own temp repo.
- [ ] **Apply local migrations:** not applicable; no database.
- [ ] **Run all tests:** `pnpm test:coverage:unit` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch consumer, set every `bkit.workflows.*.ask` to false, run `/bkit-build` on a plan whose challenge round recommends one `Accept` and one `Fix now`, and read the final message: `## Decisions Taken Without You` lists both, the Accept marked as needing confirmation.
- [ ] **Step 2:** Run `/bkit-ship` on that feature, and check that the ship summary comment on the issue lists the build items with their state at ship, plus any design grill assumptions.
- [ ] **Step 3:** Run `node dist/cli.js workflows summary --workflow=build --file={an old status.jsonl}` on a log folder from before the change, and check that the summary is written with the section reading `None` or listing the legacy assumed accepts.
