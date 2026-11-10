Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 4 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-v1-draft.md`, `docs/plans/202611/logs/902-show-every-choice/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/902-show-every-choice/related-deferrals.md`, `docs/plans/202611/logs/902-show-every-choice/related-failures.md`, `docs/plans/202611/logs/902-show-every-choice/related-issues.md` |
| plan-review | CONCERNS | 10 | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-review-1.md`, `docs/plans/202611/logs/902-show-every-choice/plan-review-2.md`, `docs/plans/202611/logs/902-show-every-choice/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-v2-reviewed.md`, `docs/plans/202611/logs/902-show-every-choice/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/902-show-every-choice/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-v1-draft.md`, `docs/plans/202611/logs/902-show-every-choice/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/902-show-every-choice/related-deferrals.md`, `docs/plans/202611/logs/902-show-every-choice/related-failures.md`, `docs/plans/202611/logs/902-show-every-choice/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-review-1.md`, `docs/plans/202611/logs/902-show-every-choice/plan-review-2.md`, `docs/plans/202611/logs/902-show-every-choice/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/902-show-every-choice/plan-v2-reviewed.md`, `docs/plans/202611/logs/902-show-every-choice/plan-update-check.md` |

## Acceptance Scenario

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

## Open Questions

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

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #902
```

Or, to address the reasons first: `/bkit-plan #902`
