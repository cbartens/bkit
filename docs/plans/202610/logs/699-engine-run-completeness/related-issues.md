## #676 — Orchestrator work the engine could do as bkit commands (closed)

### Problem

The bash blocks in `.bkit/core/workflows/bkit-{design,plan,build,debug,ship,auto}.md` are already engine-first. What still costs tokens is the prose around them: steps where the orchestrator parses a file by hand, composes an artifact by re-emitting text it already holds, counts things from a log, or runs a raw git sequence. Each of these is a fact with one right answer, so under #663 it belongs in a `bkit <noun> <verb>` command, not in the model.

This audit read all six workflows in full and checked the engine source for every candidate. Three things the prose describes are already engine-side and are not listed below: lock reclaim after 30 minutes idle (`.bkit/core/engine/commands/workflow/locks.ts:38`), the worst-of verdict across several `--agent` flags (`steps.ts:239`), and resume detection in `workflows start` (`workflows.ts:1435`).

Savings are stated as what stops passing through the orchestrator's context. No per-item token count was measured.

### Outcome

**Group A: whole documents stop passing through the orchestrator's context**

<!-- prettier-ignore -->
| # | Where | What the orchestrator does today | Proposed |
| --- | --- | --- | --- |
| 1 | Step 2 of design, plan, build, debug; ship Step 2 | Runs `issues text`, holds the full issue text, then writes `{workflow}-input-{RUN}.md` by re-emitting prompt plus issue text. Plan also appends the parent design and audit reports by hand. | `workflows input` takes the prompt file, description file, comments file and optional design and audit paths, writes the file, prints path and size only. Overlaps #675 (engine writes `*-input-{RUN}.md`). |
| 2 | design Step 4, plan Step 4, debug Step 4 | Per related hit: writes two outbox files, runs `issues text`, holds the text, writes the heading, appends. Up to ten hits of full text. | `issues related` takes one JSON file of hits dumped straight from the MCP result and writes `related-issues.md`. The search itself stays on MCP. Overlaps the #675 open question on the related-issue scan. |
| 3 | build briefs for verify, holistic, challenge-1, challenge-2, handover; Large Diff Guard | Each subagent runs `git diff origin/dev...HEAD` itself; the guard is prose the orchestrator applies. | `context diff` writes one clamped diff artifact per run; briefs read the file. Saves the first turn of five subagents. Touches the briefs #668 rewrites. |
| 4 | build Decision Pause steps 2 and 5 | Greps four artifact families for `BLOCKED` and `CRITICAL\|HIGH` rows, composes the decision file, then hand-appends rows to `docs/decisions.jsonl`, `Test-order exception` lines and `Fix now` tasks. | A collect verb writes the decision file skeleton; `ledgers append` writes the rows. Belongs inside #671 / #672. |
| 5 | build Step 7, Step 14; debug Step 3 | `tests run` prints `failures: null` on FAIL and `tests.ts:563` tells the model to count failing suites from the log. The copy log, `context clamp-log --reset`, `context clamp`, `steps finish` sequence is repeated three times. | `tests run` counts failures from the runner summary line and takes `--artifact` to copy and clamp its own log. |

**Group B: hand parsing on every run**

<!-- prettier-ignore -->
| # | Where | What the orchestrator does today | Proposed |
| --- | --- | --- | --- |
| 6 | Step 1 sub-step 2 of design, plan, build, debug | Applies five regex forms per tracker to the session prompt to find `ISSUE_ID`. | `fids parse --prompt-file`. The prompt is already written to a file for item 1. #675 leaves this with the orchestrator today. |
| 7 | Step 1 sub-step 4 of design, plan, build | Mints the FID: kebab case, stopwords out, at most three tokens, all-digit words dropped, re-mint once on reject. | `fids mint` that also runs `check` and `free`. Deterministic slugs also stop invented names. |
| 8 | build Step 1 sub-step 4 | Reads the `###### bkit:blocked-by` block into a `- #N` list. | `issues blocked-by --description-file`. Already listed in #675. |
| 9 | plan Step 1 sub-step 6 | Finds the `**Parent design:**` link and `**Audit reports:**` paths, checks the files exist. | Extend `fids design` to take description and prompt files and parse them before its fallback. |
| 10 | build Step 2 sub-steps 4 and 6; ship Step 5 sub-step 2 | `find … -plan-*.md \| wc -l` for `SUB_COUNT`, a second `find` for `status meta --plan-source=brief`. | One `fids plans` verb printing count, single-plan flag and source. |
| 11 | debug Step 1 sub-steps 7 and 8; Step 3 gate choice | Four jq-chained calls feed `counters route`; a prose table maps `[soak]` and `[repro]` to `DEBUG_MODE`; Step 3 greps `[live=off]`. | One `status route --workflow=debug --prompt-file` printing `DEBUG_MODE`, `SOAK_ENTRY`, `REPRO`, `DEBUG_ATTEMPT` and the gate. #670 changes the numbers, not the mechanism. |
| 12 | every header Resume line; build decision-file scan | Folds `status.jsonl` by hand; build also scans `build-decision-*.md` for `Status: OPEN` to recover `DECISION`, `PAUSE_STEP`, `SUB_PLAN`, `VERIFY_ATTEMPT`. | `workflows start` already prints `resumed`; add the last done step and the open decision's file, pause step, sub-plan and verify attempt. |

**Group C: raw git and shell sequences**

<!-- prettier-ignore -->
| # | Where | What the orchestrator does today | Proposed |
| --- | --- | --- | --- |
| 13 | build Step 18 sub-steps 1 and 2 | Raw fetch, `grep` over changed paths for `migrations/`, then amend or `git commit --allow-empty` with `[force build]`. The engine has no mention of force build. | `branches force-build`, or a flag on `prs open`. |
| 14 | debug Step 11 sub-steps 2 and 6 | Greps the diff for `[DEBUG-OBSERVE]`; pipes `issues labels` through jq into a raw `create-pr bkit [verbose ci]` empty commit. | `prs scan-diff --marker` beside `prs scan-body`; `--create-pr-commit` on `prs open`. |
| 15 | ship Steps 1, 2, 4, 5, 8, 10, 14 | Branch assert and sentinel `rm -f`; open-PR block (branch `case`, fetch, `rev-list`, push, `prs open`, `status meta`); B2 stage plus raw commit plus push; fetch plus `merge --ff-only`; push after `ledgers commit`; fetch plus `counters rows \| jq`; summary `rm` and `cp`. | `branches ff`, `prs open --ensure`, `--push` on `ledgers commit`, `counters route --rows`. |
| 16 | Close step of all five workflows | Assembles the final return from prose rules: tips, issue link, `## Suggested Replies`, `## bkit Tips`. | `workflows close --final-return` prints the assembled text. The issue link part is in #675. |
| 17 | ship Step 2 sub-steps 2 and 6 | Case-insensitive contains check on the branch name; asserts `prs checks` output by eye. | `prs checks --assert`; a name-check flag on `branches`. |
| 18 | design and plan Failure Path step 3 | Parses `git status --short` porcelain to pick stray files. | Keep the judgement; `workflows handover --list-stray` prints the list. |
| 19 | every header Friction line | Appends `.bkit/friction.jsonl` rows by hand in the `.bkit/jsonl.md` shape. No append verb exists. | `ledgers append --ledger=friction` stamps timestamp, FID and run and validates the shape. Adjacent to #673. |

`bkit-auto.md` has nothing to extract beyond the `{REF}` prefixing rule in Step 2, which `runs context` could print as `ref`.

### Success criteria

- Each item above is either done, folded into a named sibling issue, or declined with the reason recorded here.
- For every item done, the workflow prose that described the hand work is gone and a `bkit <noun> <verb>` block stands in its place, with `.bkit/workflows.md` updated in the same change.

### Constraints and non-goals

- Tracker reads and the related-issue search stay on MCP unless #675 decides otherwise.
- This issue holds the findings. Work is filed as separate issues per the grouping agreed in the comments.

### Decisions already made

- None yet.

### Open questions

- Which items fold into #675, #668, #670, #671 / #672 and #673 rather than new issues. See the grouping comment.

### References

- #663 — Workflow prompt process optimisation
- #675 — Engine does tracker reads and writes; agent MCP calls become the fallback
- #668, #670, #671, #672, #673 (sub-issues of #663 named above)
- `.bkit/core/.bkit/workflows.md` § Workflow Authoring Rules
- `.bkit/core/engine/commands/workflow/tests.ts` (`failures` help text)
- `.bkit/core/engine/commands/workflow/workflows.ts` (`workflows start` resume detection)
- `.bkit/core/engine/commands/workflow/locks.ts` (idle reclaim)
- `.bkit/core/engine/commands/workflow/steps.ts` (`worstVerdict`)

### Suggested grouping and order

Five issues, done in this order. The order follows where the tokens go: the biggest documents first, then the work every run pays at Step 1, then the long build and debug loops, then cleanup that buys safety more than tokens.

**1. Tracker traffic goes engine-side: #675, extended.** Fold items 1, 2, 8 and 16 into #675, and the `bkit-auto` `ref` note with them. #675 already says the engine writes `*-input-{RUN}.md`, reads the blocked-by block and prints the issue link, so items 1, 8 and 16 are the same work. Item 2 is the open question #675 already carries on the related-issue scan. One decision belongs here that the later issues depend on: the orchestrator writes the session prompt to one outbox file at Step 1, and every verb that needs it reads that file. Items 1, 6, 7 and 11 all need that file.

**2. Step 1 and resume resolved by the engine.** New issue holding items 6, 7, 9, 10 and 12. Every workflow pays these on every run, and they are pure parsing: issue id from the prompt, FID minting, parent design and audit paths, plan file count, and the resume point. One verb each, or one `workflows resolve` that prints them all. Depends on the prompt-file decision from #675, so it starts after that decision is made, not after #675 ships.

**3. Build and debug loop.** New issue holding items 3, 5 and 11. Build and debug are the longest runs, so a saving per iteration counts most. `tests run` counting its own failures and owning its log is the cheapest change and removes three copies of the same sequence. The single diff artifact should be done together with the brief rewrite in #668 so the briefs are touched once. Item 11 should wait for #670 to settle the attempt numbers.

**4. Decision Pause and ledger rows.** Items 4 and 19 fold into #671 and #672. The decision-file collect verb is part of that redesign, and a `ledgers append` verb is needed by both the decision rows and the friction rows. #673 writes telemetry at close, so it should use the same append verb rather than a second writer.

**5. Raw git into verbs.** New issue holding items 13, 14, 15, 17 and 18. These are small in tokens but each one is a place the model can run the wrong git command. Do them last as mechanical cleanup, one workflow at a time, ship first since it has the most.

So the full list of issues, in order:

1. #675 (plus items 1, 2, 8, 16)
2. new: Step 1 and resume resolved by the engine (items 6, 7, 9, 10, 12)
3. new: build and debug loop verbs (items 3, 5, 11), coordinated with #668 and #670
4. #671 / #672 (plus items 4, 19), shared `ledgers append` with #673
5. new: raw git sequences into verbs (items 13, 14, 15, 17, 18)

The three new issues would be filed as sub-issues of #663 once this grouping is confirmed.

### Order of work (2026-10-23)

This replaces the grouping comment above. The 19 findings are now four sub-issues of this one: #675 moved here, and #677, #678, #679 filed. Items 4 and 19 are not a sub-issue here; they belong to #671 / #672 and share one `ledgers append` verb with #673.

The consolidated order across every #663 child is on the parent: #663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663. This comment keeps only the order among the four children here.

Two lanes can run at the same time, because they edit different files. Lane A is tracker and Step 1 work, which touches every workflow header and Step 1 / Step 2. Lane B is the build and debug loop, which touches Steps 7, 14 and 18 of build and Steps 1, 3 and 11 of debug.

<!-- prettier-ignore -->
| # | Issue | Lane | Why it goes here | Blocked by |
| --- | --- | --- | --- | --- |
| 1 | #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675 **with** items 1, 2, 8, 16 of this issue | A | Biggest text removal: issue body, comments, related issues and the input artifact stop passing through the orchestrator, and 141 tracker blocks go. It also makes the one decision the rest depend on: the orchestrator writes the session prompt to one outbox file at Step 1, and every verb reads that file. | — |
| 2 | #677 — Engine resolves Step 1: issue id, FID, plan inputs, resume point — https://github.com/cbartens/bkit/issues/677 | A | Every run pays these on every start. Pure parsing, so it can start as soon as #675 has fixed the prompt-file handoff, before #675 ships. | #675 prompt-file decision |
| 2 | #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678 | B | The longest runs, so a saving per iteration counts most. `tests run` first, since it is the cheapest change and removes three copies of the same sequence. The diff artifact lands with #668's brief rewrite so the briefs are edited once. The debug-mode verb waits for #670's attempt numbers. | #670 for the debug verb; #668 for the diff artifact |
| 3 | #671 — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671 and #672 — Decision Pause: keep building work that doesn't need the answer — https://github.com/cbartens/bkit/issues/672 **with** items 4 and 19 | B | The decision-file collect verb and `ledgers append` are part of that redesign. #673 — Telemetry: workflows close writes run facts, not a chat-stats script — https://github.com/cbartens/bkit/issues/673 should write through the same `ledgers append`, not a second writer. | #678 (`tests run` output feeds the decision items) |
| 4 | #679 — Raw git in ship, debug and build becomes bkit verbs — https://github.com/cbartens/bkit/issues/679 | A or B, whichever is free | Buys safety and consistency more than tokens. Behaviour-preserving, one workflow per change, ship first. Last so it does not collide with the Step 1 and loop edits above. | #677, #678 |

**Can slot in whenever a lane is free:**

- The `bkit-auto` `ref` note (print `ref` from `runs context`). Trivial, and tracker-specific, so it rides with #675.

**Measuring:** rerun #664's script after steps 1, 2 and 3, on a comparable design, plan or build. Compare with the #650 baseline, so each change shows what it saved.

**First action:** settle the prompt-file handoff in #675, since #677 and both halves of #678 read that file.

**Two items of this audit now have homes, and one is built.**

- **Item 19 (friction rows, "No append verb exists")** and the `ledgers append` half of item 4 are #680 "ledgers append: engine writes ledger rows with a minted ts" (https://github.com/cbartens/bkit/issues/680). One verb, rows from a file, `ts` minted at append time, `validate()` before any write, writer checked against the kind's set, no commit. It lands before #659, #671, #672 and #673, which all assumed it.
- **Item 3 (the diff artifact)** is built at engine level: `bkit context diff` is staged in the working tree today (lands with the #656 / #660 commit) in `.bkit/core/engine/commands/workflow/context.ts`. Range `{base}...HEAD`, `docs/plans/**` excluded, change counts printed, Large Diff Guard applied in code past 10000 lines. The workflow wiring stays on #678 "Build and debug loop verbs: failure count, diff artifact, debug mode" (https://github.com/cbartens/bkit/issues/678).
- **A new child this audit implies but did not list:** #681 "Engine output as text: terse verb replies, tabulated context fetches" (https://github.com/cbartens/bkit/issues/681). Once #679 removes the 8 `jq` pipes, nothing parses verb output, so the engine can print `key: value` text instead of JSON across the 317 `"{BKIT}"` call sites; and a `context fetch` verb can render log arrays as tables before the clamp. Idea shape, `next:design`, blocked by #679 and #675.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 2.5, 2.6, 3 and 4.

### Plans posted (2026-10-24)

Each sub-issue now has a detailed implementation plan. All open questions were settled with the owner first.

<!-- prettier-ignore -->
| Sub-issue | Plan |
| --- | --- |
| #675 — Engine does tracker reads and writes; MCP becomes the fallback | https://github.com/cbartens/bkit/issues/675#issuecomment-6367558250 |
| #677 — Engine resolves Step 1: issue id, FID, plan inputs, resume point | https://github.com/cbartens/bkit/issues/677#issuecomment-6367672272 |
| #678 — Build and debug loop verbs: failure count, diff artifact, debug mode | https://github.com/cbartens/bkit/issues/678#issuecomment-6367683686 |
| #679 — Raw git in ship, debug and build becomes bkit verbs | https://github.com/cbartens/bkit/issues/679#issuecomment-6367693479 |
| #681 — Engine output as text: terse verb replies, tabulated context fetches | https://github.com/cbartens/bkit/issues/681#issuecomment-6367702055 |

Decisions that cut across several sub-issues:

- **Session prompt file.** The orchestrator writes the prompt to `{OUTBOX_ROOT}/sessions/<utc-time>-<random>/prompt.md`, a per-run folder in the uncommitted outbox that `repo info` prints. #675, #677 and #678 all read it. The committed copy stays `logs/{FID}/{workflow}-input-{RUN}.md`.
- **Repeat-safety.** Every engine action that is unsafe to repeat (tracker comments, marker commits, CI re-triggers, PR opens) records an `engine-action` row in `status.jsonl` and checks for one before acting. Defined in #675; reused by #678 and #679.
- **Jira through its MCP endpoint over plain HTTP**, with one token renamed `BKIT_JIRA_API_KEY` (with a migration).
- **Related-issue scan:** the orchestrator searches via MCP; the engine fetches the full text.
- **Board moves are skipped on cloud runs.**
- **Shortened files keep their original in the outbox only**, and the committed record names the request that produced it, so it can be downloaded again.

Order: #675 and #677 first (either order); then #678; then #679, whose guard test waits for #678; then #681's default switch, which waits for #679 and #675. #681's renderer slice can land any time.

**All five sub-issues are implemented and closed.** The work is on branch `feat/676-engine-io` (branched from `dev` at `992747a6`) and is not pushed yet:

<!-- prettier-ignore -->
| Commit | Sub-issue |
| --- | --- |
| `ac2d73c4` | #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675 |
| `ac2d73c4` | #677 — Engine resolves Step 1: issue id, FID, plan inputs, resume point — https://github.com/cbartens/bkit/issues/677 |
| `ac2d73c4` | #681 slice A (the table renderer) |
| `85f863ad` | #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678 |
| `e3cb1a3f` | #679 — Raw git in ship, debug and build becomes bkit verbs — https://github.com/cbartens/bkit/issues/679 |
| `e6f30c26` | #681 — Engine output as text: terse verb replies, tabulated context fetches — https://github.com/cbartens/bkit/issues/681, slices B to E |

**Still to do:**

- **Rebase onto the current `dev`.** `dev` has moved on since the branch started.
- **Merge and release.** The engine replying in plain text by default is a breaking change, so it needs a CHANGELOG Breaking Changes entry (already written) and a version bump.
- **Live runs on a throwaway issue**: GitHub; the Jira test site from #60 — Jira test-site setup — https://github.com/cbartens/bkit/issues/60; and the `[force build]` marker on a real PR.
- **Close the friction row `design-summary-comment-not-posted`.**
- **Two failures that already exist on `dev` block a fully green gate.** Gate-checklist lines added in `bd5f6988` are missing from `.bkit/wording.md`, which fails 2 wording tests. `slop:delta` is at net +5 from unpushed `dev` commits.

## Review of `feat/676-engine-io` (worktree, read-only)

**Bottom line.** The move is essentially complete: tracker reads and writes, git, gh, jq and the status.jsonl folds are all behind `bkit <noun> <verb>` now, and the remaining MCP mentions in the six workflows are either the declared fallback (`tracker.done: false` / exit 80) or the related-issue search that stays on MCP by decision. Four bugs need fixing before this merges, two of them in paths every run hits. Details below, ranked.

### Gates (run in the worktree at `e6f30c26`)

- `pnpm typecheck` clean, `pnpm lint` clean.
- `vitest run`: 7345 passed, 2 failed. Both failures are `.bkit/core/engine/tools/wording.test.ts` and come from dev commit `bd5f6988` (gate checklist lines such as "Issue update attempted" missing from `.bkit/wording.md`). Not caused by this branch, but it has to be green before `/bkit-ship`.
- Dry-run merge of the moved dev (`ce802b48`): two conflicts, both docs, `.bkit/core/.bkit/workflows.md` and its mirror `.bkit/workflows.md`. The engine files auto-merge.

### Engine bugs, most serious first

1. **HIGH: the debug leak scan dies on any diff over 1 MiB.** `quietGit` at `.bkit/core/engine/commands/workflow/branches.ts:109` spawns git with no `maxBuffer`, so Node's 1 MiB default applies. `scan-diff --marker` at `branches.ts:1096` sends the whole patch through it. A diff over 1 MiB (a `pnpm-lock.yaml` change is enough) kills git with `ENOBUFS`, the verb exits 23, and debug Step 11 (`bkit-debug.md:563`) routes the run to the Failure Path. The `git diff | grep` it replaced had no cap, so this is a regression. Fix: give `quietGit` the 64 MiB `OUTPUT_LIMIT` that `runGit` already uses (`commands/lib.ts:377`).

2. **HIGH: issue detection takes the first number-shaped thing it sees.** `issueRefs` at `.bkit/core/engine/commands/workflow/fids.ts:266-300` merges every hit type and sorts by position, so a bare `#N` outranks nothing. Reproduced with the branch's `dist/cli.js fids parse --prompt-file`:
   - "this is priority #1, then fix #677" → issue `1`
   - "set color: #123456 for the header, see #677" → issue `123456`
   - Linear/Jira: "Migrate hashing to SHA-256 for ABC-12" → issue `SHA-256`; "fix #677 (UTF-8 output)" → issue `UTF-8`
     The "names more than one issue" warning only goes to stderr. Downstream, `issues fetch` fails or the wrong issue gets labelled and commented. Fix: explicit forms (`<id>`, tracker URL, `GitHub issue:`) win over bare mentions, and a bare Linear/Jira key only counts when its prefix matches the configured team/project.

3. **HIGH: the fallback instruction and the text output disagree on line breaks.** `escapeLine` at `.bkit/core/engine/shared/text.ts:29` prints a multi-line `comment` or PR `body` as one line with literal `\n` and doubled backslashes. The workflow headers (`bkit-build.md:33` and the Linear/Jira variants) tell the orchestrator to post the printed `comment` "byte-for-byte, never edit" when `tracker.done` is false, and `prs open` exit 80 says to pass the printed `body` to `create_pull_request`. Either literal `\n` lands in the issue, or the model un-escapes and breaks the instruction. The Commands note at line 20 explains quoting but not escapes. Fix: have the fallback read the body from a file the verb already writes (the `--post` path has `bodyFile`, `steps.ts:883`), or print multi-line strings as an indented block.

4. **MEDIUM: a re-run double-posts start, close, fail and handover comments on Jira.** `postCommentOnce` at `.bkit/core/engine/commands/workflow/tracker.ts:949-951` dedups by comparing the stored comment text with the new body byte for byte. On Jira that can never match: Jira rewrites markdown on the way back (`.bkit/core/.bkit/trackers.md:194`) and the engine itself inserts a `_(part i/n)_` line into every Jira comment (`tracker.ts:377-379`). Linear round-trips markdown too. Callers without a `file`/`key` row: `issues comment --post`, `workflows fail --post`, `workflows handover --post`, `postClose`. `steps finish --post` is safe because it keys on a status.jsonl row. Fix: record an engine-action row for these too, or compare only the marker line.

5. **MEDIUM: Jira HTML comment pages defeat the `###### bkit:generated` check.** `trackers.md:194` says one comment Jira cannot render as markdown turns the whole page HTML and the reader must re-fetch one comment per call. The engine now does the reading (`tracker.ts:561-573`) and does not, so `isGenerated` at `issues.ts:67` sees `<h6>bkit:generated</h6>` and every bkit comment on that page flows into `issue-comments.json` as human text. `commentOf` at `tracker.ts:488` also stringifies a non-string body into a JSON blob.

6. **MEDIUM: `/bkit-build 123` silently becomes an issue-less run called `dev-build`.** `fids parse` emits `source: none` with no hint (`fids.ts:612-625`); `fids resolve` drops the all-digit word, has nothing left, and mints from the workflow name. The next phase mints `dev-plan`, so the chain only connects if the prompt names the FID. Suggest a stderr hint ("123 reads as a bare number; write #123") and refusing to mint from the workflow name alone when the prompt holds a bare number.

7. **LOW, several:**
   - Linear failures always classify as `http-400`: `post` at `tracker.ts:207` throws on any non-2xx before `linearGql` can read the GraphQL `extensions.code`, and Linear returns 400 for rate limits and auth. `LINEAR_CODES` is dead against real responses. The fallback still fires, the recorded reason is wrong.
   - Linear `fetchIssue` reads `comments(first: 250)` with no paging (`tracker.ts:530`). GitHub and Jira page.
   - `recordAction` runs inside the try at `tracker.ts:953`; if the status.jsonl write fails after a successful post, the verb reports `done: false` and the orchestrator posts a duplicate via MCP.
   - `issues labels --write` validates the board payload after the labels are written, so a malformed `ownerRepo` exits with a usage error and no `tracker` outcome printed.
   - `ledgers commit --path` (`ledgers.ts:822-860`) never calls `appendRecordCommit`, unlike every other commit mode. On an in-place build on dev, the test-order-exception commit from `bkit-build.md:140` is left out of the Step 18 push replay. Same gap as the raw line it replaced, but the engine now owns it.
   - `markerKey` at `branches.ts:765` keys `force-build` and `push-commit` rows on `runNumber`, and both callers run after `workflows close` wrote `workflow-done`, so the rows carry the next run's number.
   - `branches force-build` leaves ` bkit [force build]` in the PR title for good; `prs merge` strips only skip tokens, so the marker rides onto dev and triggers a full-level dev build. Probably fine, but undocumented.
   - `fids check --issue="#677"` is rejected while `fids find` and `fids resolve` strip the `#`.
   - Unverified: Linear `commentCreate` is passed the human key (`ENG-4`) not the UUID (`tracker.ts:411`), while `writeLabels` deliberately resolves the UUID first. One live call settles it.

### What is still orchestrator hand work

Most of this is by design and fine. Listing it so the boundary is explicit.

- **Decision Pause composition** (`bkit-build.md:102-137`). The orchestrator assembles `build-decision-{RUN}-{DECISION}.md` by reading gap lines from `build-plan-verify-*.md`, the last `BLOCKED` reason in `build-plan-gaps-remediate-*-log.md`, open `CRITICAL|HIGH` findings in `build-challenge.md`, and failing tests from `run-tests-*.md`. "Fix now" appends the plan task by hand. This is the largest remaining block of file-reading prose and a natural `bkit decisions compose` verb. #671 reshapes this step anyway, so build it there rather than twice.
- **Related-issue search** stays on the tracker MCP in design Step 7, plan Step 4 and debug Step 4, because the natural-language query is the orchestrator's job. Agreed, and the hits go through `issues related --hits-file`, so only the query is hand work.
- **Shell wrappers in fences.** Three places still carry shell logic the verb could own: the `case $?` around `scan-diff --marker` in `bkit-debug.md:563-566` (a `--expect-none` flag would replace it), the `OPEN_EXIT`/`case` around `prs open` in ship Step 2, and the `case "{SHIP_BRANCH}" in dev|main|"")` refuse guard before `ledgers commit --scope=pr` in ship Step 8. The engine already refuses dev/main inside `branches push --mode=plain`, so the ship guard is the only one left outside.
- **Header prose.** `bkit-build.md:23` still says "fold to derive the run array" while line 22 says "never fold status.jsonl by hand". Line 23 should describe the row shape only. Same block in the other five.
- **Step 17** (`bkit-build.md:782-784`): "Hold `verdict` as `SUMMARY_VERDICT`" sits after the `prs probe --base=dev` fence, so it reads as the probe's verdict. It is the summary agent's. Move the line above the fence.
- **Step 1 sub-step 3** in every workflow: when `LABELS`/`DESCRIPTION`/`COMMENTS` came from `.bkit/core/AGENTS.md:32,46`, the orchestrator writes `issue-description.md` and `issue-comments.json` by hand. Small, and only on that path. Not stale: AGENTS.md does set them.
- **`context diff` per reader** is in, but both challengers still read the same `tmp/bkit-diff-{FID}.md` (`bkit-build.md:572-582`). If a per-reader file filter was intended for challenge-2, it is not on this branch.

### Before merge

1. Fix 1, 2 and 3 above; 4 and 5 are worth doing in the same PR since they are small.
2. Rebase onto dev and resolve the two `workflows.md` conflicts.
3. Fix the two wording test failures (dev-side, `.bkit/wording.md`).
4. Version bump to go with the `--json` Breaking entry already in CHANGELOG.
5. The live checks from the previous comment still stand: a throwaway GitHub issue end to end, the Jira test site (#60), and `[force build]` on a real PR.

### Review follow-up: why both build challengers read the same diff file

**This is intended, not a bug.** It answers the point in the review — https://github.com/cbartens/bkit/issues/676#issuecomment-6378471951 — that both challengers read the same `tmp/bkit-diff-{FID}.md` (`.bkit/core/workflows/bkit-build.md:572-582`).

- **Decision 10 in #678** (Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678) was "write the diff fresh right before each _step_ that reads it". It was never one diff per agent. `@bkit-build-challenge-1` (bugs) and `@bkit-build-challenge-2` (security) run in parallel inside the same step, Step 10, so one fresh diff written at the start of that step is what was agreed.
- **The security-specific rule is decision 10b, and it is on the branch** at `.bkit/core/prompts/bkit-build-challenge-2.md:46`. When the diff is too large and its first line says `partial diff coverage`, challenge-2 runs its own `git diff <range> -- <file>` on every omitted file whose path touches auth, sessions, permissions, data-access policies, secrets or input handling. A large diff cannot hide an auth change from the security reviewer.
- **Why there is no security-filtered diff for challenge-2:** a filter based on file paths would hide security bugs in files whose names don't look security-related. The full diff, plus targeted diffs when it is cut, keeps that case covered.

The other parts of the review are being fixed on `feat/676-engine-io`, apart from the Decision Pause verb, which moved to #671 — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671 (see https://github.com/cbartens/bkit/issues/671).

### Review follow-up: fixes applied (2026-10-24)

**Every finding in the review — https://github.com/cbartens/bkit/issues/676#issuecomment-6378471951 — is fixed or answered.** The branch `feat/676-engine-io` is rebased onto `dev` (`004dd4c1`) and is **not pushed yet**. The commit hashes below changed in the rebase; the earlier comments on the sub-issues name the commits from before it.

<!-- prettier-ignore -->
| Commit | What |
| --- | --- |
| `46d0c1c3` | #675, #677, #681 slice A |
| `64ac7efd` | #678 |
| `73791d54` | #679 |
| `3eeaa65f` | #681 slices B to E |
| `99ecb3b8` | review fixes (below) |
| `a1dc1fdc` | wording-file fix for the gate lines from `bd5f6988` |

#### Findings

<!-- prettier-ignore -->
| # | Finding | Result |
| --- | --- | --- |
| 1 | `scan-diff` dies on diffs over 1 MiB | **Fixed.** Every git and gh call in the engine commands that reads output now has the 64 MiB limit (`OUTPUT_LIMIT`), not just `quietGit`. Tested with a diff over 1 MiB. |
| 2 | Issue detection takes the first number-shaped match | **Fixed.** Explicit forms win over bare mentions: an `issue #N` label, a tracker URL or `<id>`. CSS colours are ignored. A bare Linear/Jira key counts only with the configured prefix. If two different issues remain, `fids parse` exits 8 and all five workflows stop and ask. Every example from the review is a test. |
| 3 | Fallback must post a body that text output escapes onto one line | **Fixed.** Every verb that prints a `comment` also writes it to `tmp/bkit-comment-{hash}.md` and prints `commentFile`. `prs open` prints `bodyFile` on exit 80. The fallback lines in all six headers, for each tracker, post the file's content verbatim. |
| 4 | Re-runs double-post on Jira/Linear | **Fixed.** Generated comments start with `###### bkit:generated {12-hex hash}`, and dedupe compares the hash, so it survives Jira's markdown rewrite and `_(part i/n)_` splits. `issues comment --file=` and `workflows fail --post` also write an `engine-action` row. Handover, close and links post after their commit or push, so they rely on the hash alone. |
| 5 | Jira HTML pages and non-string bodies | **Fixed.** HTML markers are recognised, HTML pages are re-read one comment per call, and Atlassian Document Format bodies become text. |
| 6 | `/bkit-build 123` becomes an issue-less run named after the workflow | **Fixed.** `fids parse` prints a "write #123" hint, and `fids resolve` exits 9 instead of minting from the workflow name; the workflows stop on it. |
| 7 | Linear errors always `http-400` | **Fixed.** Classified from the GraphQL error body. |
| 7 | Linear comments not paged past 250 | **Fixed.** |
| 7 | `recordAction` failure reports `done: false` after a successful post | **Fixed.** Now reports done, with a warning. |
| 7 | `issues labels --write` checks the board payload after writing labels | **Fixed.** Checked first. |
| 7 | `ledgers commit --path` skips the record commit | **Fixed.** |
| 7 | `markerKey` uses the next run's number | **Fixed.** Uses the closing run. |
| 7 | `[force build]` stays in the squash subject | **Fixed.** `prs merge` strips it. |
| 7 | `fids check --issue="#677"` rejected | **Fixed.** |
| 7 | Linear `commentCreate` gets the human key | **Not a bug.** Linear's schema says `CommentCreateInput.issueId` "Can be a UUID or issue identifier (e.g., 'LIN-123')". |

#### Hand-work items

<!-- prettier-ignore -->
| Item | Result |
| --- | --- |
| `case $?` around `scan-diff --marker` (debug Step 11) | **Replaced** by `branches scan-diff --expect-none`. |
| dev/main guard before `ledgers commit --scope=pr` (ship Step 8) | **Moved into the engine** (exit 12). Side effects: on `dev`/`main` the step's done row is written before the refusal, and the Step 8 line has no `\|\| exit 1`, so the refusal isn't routed to the Failure Path. A ship from `dev` already fails at Step 2, so this is left as is. |
| `OPEN_EXIT` wrapper around `prs open` (ship Step 2) | **Left.** Removing it changes what the verb records in `status.jsonl`. |
| Header line "fold to derive the run array" | **Rewritten** to describe the row shape only, in all six workflows. |
| Step 17 `SUMMARY_VERDICT` line | **Moved** above the probe fence, in build, design, plan and debug. |
| Decision Pause composition | **Moved to #671** — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671 (https://github.com/cbartens/bkit/issues/671#issuecomment-6378620781). |
| Both challengers read one diff file | **Intended**, see https://github.com/cbartens/bkit/issues/676#issuecomment-6378621602. |
| `AGENTS.md`-sourced issue files written by hand | **Left.** Small, and only on that path, as the review says. |

#### Before merge

<!-- prettier-ignore -->
| Item | State |
| --- | --- |
| Rebase onto `dev` | **Done.** The two `workflows.md` conflicts are resolved, keeping both the `--list-stray` step and `dev`'s rule that copied-in `.env` files are never committed. |
| Wording test failures | **Fixed** in `a1dc1fdc`. The seven gate clauses carry the shortened gate lines, three new shared gate lines have clauses, and the unused `workflow-gate-skip-no-issue` is removed. |
| Gates at `a1dc1fdc` | typecheck, lint, format, prose and `bkit check` pass. Unit tests: 5842 passed. Integration tests: 1553 of 1553 pass. bats pass. **`slop:delta` still fails at net +5**, which comes from `dev`'s own unpushed commits since `694f2c86`; it needs fixing on `dev` before `/bkit-ship`. |
| Version bump for the `--json` breaking change | Open. |
| Live checks | Open: a throwaway GitHub issue end to end, the Jira test site from #60 — Jira test-site setup — https://github.com/cbartens/bkit/issues/60, and `[force build]` on a real PR. |
| Friction row `design-summary-comment-not-posted` | Not closed yet. |

## Re-check of `feat/676-engine-io` at `a1dc1fdc` (worktree, read-only)

**Bottom line.** Every fix in https://github.com/cbartens/bkit/issues/676#issuecomment-6379009229 checks out against the source and, where it could be probed, against the rebuilt `dist/cli.js`. Gates are green. Two gaps remain from the issue-detection rework, neither a blocker, plus one housekeeping note about `dev`.

### Gates at `a1dc1fdc`

<!-- prettier-ignore -->
| Gate | Result |
| --- | --- |
| `pnpm typecheck` | clean |
| `pnpm lint` | clean |
| `vitest run` | 189 files, 7395 passed, 1 skipped, 0 failed (the two wording failures are gone) |
| `bkit check` | exit 0 |
| `pnpm slop:delta` | fails at net +5, confirmed to be dev's, see below |

**slop:delta, verified.** I ran `slop-scan delta` three ways with detached worktrees: base `694f2c86` to dev `004dd4c1` is +5 (`context.ts:897`, `ledgers.ts:1119,1155`, `tests.ts:1109`, `run-facts.ts:337`, `telemetry.test.ts:2350`). Dev to this branch is exactly 0: the same findings move line numbers, nothing is added. So the fix comment is right that this is dev's debt, not the branch's.

**Housekeeping.** `origin/dev` is still at `694f2c86`. Local `dev` is 27 commits ahead of it, which is why the slop base is so old. Worth pushing dev before `/bkit-ship` so the branch's PR diffs against what CI will actually see.

### Fixes verified

<!-- prettier-ignore -->
| # | Finding | Checked |
| --- | --- | --- |
| 1 | 1 MiB output cap | `quietGit` passes `maxBuffer: OUTPUT_LIMIT` (`branches.ts:108`), as do the union merge (`branches.ts:221`) and the remaining reader at `branches.ts:477`. Every other `spawnSync` in `commands/` either discards output (`stdio: "ignore"`, `--is-ancestor`), writes to a file descriptor (`tests.ts:93`), or reads a few bytes (`git --version`, `ls-remote`). `context.ts:1347` has its own 512 MiB cap. |
| 2 | First number wins | Probed: "priority #1, then fix #677" exits 8 with both listed; "color: #123456 ... see #677" picks 677; "fix #677 (UTF-8 output)" picks 677; `/bkit-build 123` prints the "write #123" hint. Linear with `linear.team: ABC`: "SHA-256 for ABC-12" picks ABC-12 and "ABC-12 (UTF-8) ISO-8601" picks ABC-12. Workflows route exit 8 to STOP at `bkit-build.md:187` and exit 9 at line 229. |
| 3 | Fallback body escapes | `commentFileOf` writes the file and every `comment` emitter prints `commentFile` (`issues.ts:1010`, `workflows.ts:422,876`, `context.ts:1298`); `prs open` prints `bodyFile` (`prs.ts:290`). Header line 33 in each workflow now says "post the content of the printed `commentFile` byte-for-byte". |
| 4 | Jira double-post | `stampMarker` writes `###### bkit:generated {12-hex}` (`tracker.ts:386`); `samePosted` compares `markerHashOf` on both sides and accepts the `<h6>` form (`tracker.ts:393,1048`). `isGenerated` accepts bare, hashed and HTML markers (`issues.ts:70`). |
| 5 | Jira HTML pages | `appliedContentFormat === "html"` triggers a one-comment re-read per entry (`tracker.ts:666-679`); `adfText` flattens document bodies (`tracker.ts:555`). |
| 6 | Bare number mints `dev-build` | Probed on a throwaway `main` checkout: `fids resolve` exits 9 with "refusing to mint a FID from the workflow name alone". |
| 7 | Linear `http-400` | `post` keeps the error body for Linear (`keepErrors`), `linearGql` maps `extensions.code` first (`tracker.ts:240-266`). |
| 7 | Linear paging | `pageInfo { hasNextPage endCursor }` loop at `tracker.ts:613-633`. |
| 7 | `recordAction` in try | Moved out; failure returns `done: true` with a `warning` (`tracker.ts:1083-1092`). |
| 7 | `labels --write` order | `boardPayload` runs before `readLabels`/`writeLabels` (`issues.ts:376-383`). |
| 7 | `ledgers commit --path` record | `appendRecordCommit` when a record is active (`ledgers.ts:867`). |
| 7 | `markerKey` run number | counts this workflow's runs, no `+1` (`branches.ts:759-762`). |
| 7 | `[force build]` in squash subject | `FORCE_BUILD_TAG` stripped at `prs.ts:1053`. |
| 7 | `fids check --issue="#677"` | accepted. |
| Hand work | `--expect-none` in debug Step 11 (`bkit-debug.md:567`), no `case $?` left in any workflow, header line 23 describes the row shape only, `SUMMARY_VERDICT` sits above the probe fence in build, design, plan and debug. |

### Remaining gaps

1. **MEDIUM: a URL to another repository's issue is taken as this repository's issue.** The explicit URL form at `fids.ts:309` captures only the number. Probed: "see https://github.com/other/repo/issues/9 and fix #677" picks issue 9 and prints "taking #9, named explicitly; not the bare mention #677". The prompt was pointing at someone else's issue as context, and the run now labels and comments on our #9. `repo info` already derives `ownerRepo` from `origin`; the URL hit should count as explicit only when its owner/repo matches, and otherwise be ignored. Same for Linear (`linear.app/<workspace>/issue/`) and Jira (`<site>/browse/`), where the host or workspace can be compared with `bkit.jira.site` / the configured workspace.

2. **LOW: with no `linear.team` / `jira.project` configured, any `WORD-123` is still a bare key.** `issueKeyPrefix` returns null when the setting is empty (`fids.ts:463-467`), and bkit's own `package.json` ships `linear.team: ""`. Probed on Linear with no team: "SHA-256 for ABC-12" exits 8 as ambiguous, which is safe, but a prompt that only mentions `SHA-256` picks it as the issue. Either treat an empty team as "bare keys never count", or have `bkit install --tracker=linear` require the team.

3. **Note, not a change request.** Ship Step 8's engine-side dev/main refusal (exit 12) writes the step's done row first and is not routed to the Failure Path. The fix comment already says this and relies on Step 2 refusing a ship from dev. Agreed.

Nothing else outstanding from my side. Still open from the fix comment: version bump, the three live checks, and the `design-summary-comment-not-posted` friction row.

### Re-check follow-up: the remaining issue-detection gaps are fixed (2026-10-24)

This answers https://github.com/cbartens/bkit/issues/676#issuecomment-6379080687. The fixes are in commit `18cba37d` on `feat/676-engine-io`, which is **not pushed yet**.

<!-- prettier-ignore -->
| # | Gap | Result |
| --- | --- | --- |
| 1 | A URL to another repo's issue is taken as ours | **Fixed.** A GitHub issue URL counts only when its owner/repo matches `origin` (case-insensitive, read from `origin` directly, with no network call). The same check now covers `owner/repo#N` short references, which had the same bug. A link that doesn't match is ignored entirely, and the number inside it is not read as a bare mention. A Linear URL must match `bkit.linear.team`; bkit has no workspace setting, so the team key is the only check. A Jira URL must match `bkit.jira.site` and `bkit.jira.project`. When `origin` or a setting is unset, that check is skipped. |
| 2 | With no team or project set, any `WORD-123` is a bare key | **Fixed.** With no `bkit.linear.team` / `bkit.jira.project`, a bare key never counts. Labelled forms (`issue ABC-12`, `Linear issue:`), `<id>` tags and matching URLs still do, and stderr names the setting to configure. |
| 3 | Ship Step 8 refusal | No change, as agreed. |

Probes against the built CLI, in a scratch repo with origin `Me/Proj`:

- "see https://github.com/other/repo/issues/9 and fix #677" → 677
- "see other/repo#9 and fix #677" → 677
- "see other/repo#9" → no issue
- "see me/proj#9 and fix #677" → 9

Gates:

- typecheck, lint, format, tables and prose pass.
- `bkit check`: exit 0.
- Unit tests: 5862 passed. Integration tests: 1553 passed.
- `slop:delta`: still net +5, all from `dev`.

Still open:

- push `dev` (27 commits ahead of `origin/dev`), then this branch
- the version bump for the `--json` breaking change
- the three live checks
- the `design-summary-comment-not-posted` friction row

## #577 — Warn when a workflow or audit runs on an outdated bkit version (closed)

## Problem

A consumer repo can sit on an old bkit for weeks. Nothing tells the person running `/bkit-build` or an audit that the workflow and audit prompts they're running have since been fixed or improved in a newer release. They only find out by checking npm themselves.

## Approach

Put the check inside the two bkit commands that already run at the start of every workflow and every audit. It is **not** a new prose step in each workflow or template, and **not** a rule in `.agents/rules.md`.

Why not those two:

- **A rule in `rules.md`**: a rule is an instruction the agent may skip. The check is mechanical (ask npm for the newest version, compare, print a line), and agents get version comparisons wrong (`5.10.0` vs `5.9.0` compared as text). A rule also loads in every session, including ones that never run a workflow.
- **A step in every workflow and audit template**: 5 phase workflows plus every `docs/templates/bkit-audit-*.md`, all repeating the same steps and drifting apart. Each consumer would carry those copies too.

Where it goes instead:

1. **Workflows.** Every phase workflow's Step 1 already runs `bkit repo info --fetch`. That command gains `bkitVersion`, `bkitLatest`, `bkitOutdated` and a ready-made `bkitAdvisory` line. Step 1 tells the agent to show that line to the user when it isn't null. The build workflow already does the same thing with its "N commits behind dev" warning.
2. **Audits.** Every audit's step 2 already runs `bkit branches anchor-stamp` to record the audited commit at the top of the report. With a new `--bkit-version` flag it also records `bkitVersion` and `bkitLatest` in that block. The report then shows which bkit produced it, and the audit prompt adds a visible warning line to the report when the version was outdated. Someone reading the report later can see it was made with old templates.

How the check behaves:

- **Warns only, never stops a run.** If you're offline, the registry doesn't answer, or `pnpm` is missing, the latest version is reported as unknown and the workflow carries on with no warning.
- **Asks the registry at most once a day.** The answer is saved in the git directory (`<git common dir>/bkit-latest-version.json`). It's shared across worktrees and never committed, so parallel workflows don't each call npm and Step 1 doesn't get slower.
- **Compares versions as numbers.** Pre-releases count as older than the release they lead up to. It stays quiet when the installed version is the same or newer, which covers the bkit repo itself (dev is often ahead of what's published).
- **"Installed version"** means the version the repo's bkit files were rendered from (`.bkit/version` `pinnedVersion`). That's what decides which workflow and audit text the agent is reading.
- **Opt-out:** `BKIT_NO_UPDATE_CHECK=1` skips the registry call (air-gapped machines, CI).
- **Network access:** `registry.npmjs.org` is already in the cloud-environment allow-list built from `.bkit/core/engine/shared/egress.ts` (`pkg-npm`), so cloud sessions can reach it.

Work done is recorded in the comments below.

## Work done

**Scope widened from the plan in the description.** The version is now recorded in **every** generated doc, not only audit reports: design docs, plan docs and sub-plans as well. They all get their top-of-file anchor block from the same code (`stampAnchor`), so the record goes there and is always on. The opt-in `--bkit-version` flag from the original plan was dropped.

### What changed

- **The check itself:** `.bkit/core/engine/shared/bkit-latest.ts`. It reads `.bkit/version` `pinnedVersion`, asks npm for the newest `@cbartens/bkit` via `pnpm view` (5 s timeout) and compares the two as numbers. `5.10.0` counts as newer than `5.9.0`, and `5.3.0-rc.1` as older than `5.3.0`. The answer is cached in `<git common dir>/bkit-latest-version.json` for a day; a failed lookup is cached for an hour, so an offline machine doesn't pay the timeout on every call. Setting `BKIT_NO_UPDATE_CHECK` to anything other than `0` turns the lookup off.
- **Workflows:** `bkit repo info` now also returns `bkitVersion`, `bkitLatest`, `bkitOutdated` and `bkitAdvisory`, and prints the advisory itself. Step 1 of `bkit-design`, `bkit-plan`, `bkit-build`, `bkit-debug` and `bkit-ship` holds `bkitAdvisory` and, when it isn't null, shows it as `[bkit-<workflow>] running bkit X; Y is out. Upgrade: pnpm bkit upgrade --latest`. It's not a gate item and never stops the run. That sentence is shared by 5 workflows, so it's registered in `.bkit/wording.md` as `workflow-bkit-advisory`. `bkit-auto` is untouched, because the phase workflow it hands off to runs its own Step 1.
- **Generated docs:** `bkit branches anchor-stamp` (audits) and `bkit workflows promote` (design and plan close) write `bkitVersion` / `bkitLatest` into the `bkit:anchor` block. When the version is outdated, they also write a visible line under the block: `> **Outdated bkit:** generated with bkit X while Y was out …`. That line is owned by the tool like the block itself, so the next stamp drops it once you've upgraded. `bkit branches anchor-read` reads both new fields. The header parser that reads verdicts only matches `Key:` lines starting with a capital letter, so neither the new fields nor the warning line can be mistaken for header fields.
- **Docs:** `.bkit/workflows.md` § Invocation and § Anchor Block, the `repo` row of the command table, the `.bkit/README.md` version section, the audit row in `.bkit/prompts.md`, `docs/testing.md`, and a `docs/decisions.jsonl` row (`outdated-bkit-check-in-commands`) recording why this lives in commands rather than a rule or per-template steps. Changelog entry added to `[5.2.4]`.

### Verified

- Full suite: 170 files, 5622 tests passing. Typecheck, format, prose lint, slop delta and `bkit check` are clean.
- Live run of the built CLI in a scratch repo pinned at `5.0.0`, against the real registry. `repo info` printed `running bkit 5.0.0; 5.2.3 is out` in about 1.4 s and wrote the cache. `anchor-stamp` wrote the block with `bkitLatest: 5.2.3` plus the visible warning line.
- The cloud allow-list built from `.bkit/core/engine/shared/egress.ts` already includes `registry.npmjs.org` (`pkg-npm`), so cloud sessions can reach the registry.

Pre-release check follow-up (34119d38). The pre-release review said SHIP with 2 medium and 6 low findings. All of them are fixed:

- **A stamped doc failed `prettier --check`.** Prettier wants a blank line between the end of the anchor block (`-->`) and the warning. The stamp now writes a blank line on both sides of the warning. A new test in `branches.test.ts` runs prettier on the stamped output, checks that stamping again gives the same bytes, and checks that dropping the warning after an upgrade still passes prettier.
- **Wrong secret name in the docs.** `.bkit/core/.bkit/README.md` and `install.md` said the cloud workflow's Claude job needs `BKIT_ANTHROPIC_API_KEY`. `bkit-cloud.yml` actually reads the `ANTHROPIC_API_KEY` repo secret, so the docs now say that.
- **Two registry lookups.** `bkit upgrade --latest` now calls the same `lookupLatestPublished` in `shared/bkit-latest.ts`. Upgrade passes no time limit, since the user asked for the upgrade, and it still exits with the same guidance when the lookup fails.
- **Tests asked the real npm registry.** The temp repos in the promote tests are pinned to an old release, so each stamp went to the network. `vitest.setup.ts` now sets `BKIT_NO_UPDATE_CHECK=1`, and the tests of the lookup itself clear it. Promote has new assertions for the bkit fields and the warning.
- Smaller doc fixes: `install.md` lists `--auto=claude|cursor|opencode` and notes that a full uninstall leaves `.git/bkit-latest-version.json`. The timeouts table in `workflows.md` lists `BKIT_LATEST_LOOKUP_TIMEOUT_S` / `BKIT_LATEST_CACHE_S` / `BKIT_LATEST_RETRY_S`. The header comment in `bkit-latest.ts` no longer mentions an `anchor-stamp --bkit-version` flag that doesn't exist.

Gates: full `pnpm vitest run` passes (170 files, 5624 tests). Typecheck, format, table format, prose lint, slop delta, dist check and `bkit check` all pass.

Shipped in 5.2.4. Release PR #578 was squash-merged to main as dbc96f7a. Tag `v5.2.4` is pushed and the Release workflow (run 39024234454) succeeded. npm `latest` is now 5.2.4. GitHub Release: https://github.com/cbartens/bkit/releases/tag/v5.2.4

## #701 — Engine work in build verify and ship: emit the facts, keep the judgement (open)

### Problem

#676 — Orchestrator work the engine could do as bkit commands — https://github.com/cbartens/bkit/issues/676 audited the six workflow files for prose the orchestrator parses by hand. It did not audit the **subagent prompts**. Those hold the same class of work: lookup tables, set comparisons, arithmetic and file writes where the engine already holds the data. The rule is the one #663 settled — a fact with one right answer is the engine's; judgement is the agent's.

Two agents carry most of it:

<!-- prettier-ignore -->
| Agent | Turns | Mechanical work inside it |
| --- | --- | --- |
| `bkit-build-plan-verify` | 100, once per group + once holistic | test-first gap → `Fixable` mapping, verdict arithmetic, task tick, task ↔ `DONE` log cross-reference, matrix ↔ runbook coverage |
| `bkit-ship-deferred-sweep` | 200, once per ship | disabled-test diff scan, deferral reason tests, bucket verdict |

`bkit-build-plan-current` (50 turns) also spends its steps 5-7 on search the engine can do.

This is measured from the prompts, not estimated. `bkit-build-plan-verify.md:67-82` is an 11-row kind→`Fixable` table plus a three-line verdict mapping, run on every group. `bkit-ship-deferred-sweep.md:69` is a disabled-test diff scan that decides the ship gate.

### Narrative

A bkit maintainer wants the build and ship subagents to stop re-deriving facts the engine already holds. After this, the verifier and the deferred sweep decide only what needs judgement, and the engine computes the verdicts, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests and writes the deferral rows.

### Success Criteria

- `bkit tests green` prints `verdict` and a `fixable` per gap; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping and no verdict mapping.
- No subagent edits the plan to tick a task; `bkit tasks tick` does it.
- `bkit tests plan-check` exits 1 on a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row.
- `bkit branches scan-diff --disabled-tests` exits 1 on an added `.skip` / `@Disabled` / `t.Skip()` and is the only place the disabled-test list lives.
- `bkit ledgers triage` prints each deferral's bucket and writes the `unjustified` / `TRIAGED` rows; `bkit-ship-deferred-sweep.md` names no reason test.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| a gap kind needs a diff read (`test-changed`) | `tests green` prints `fixable: null` and `verdict: null`; the verifier classifies it |
| a plan has no task blocks | `tasks tick` / `open` / `currency` refuse, naming the plan-check reason |
| a task number named to `tick` sits in another group | `tick` exits 2 and names the task and its group |
| a `Derived Test Matrix` row maps to two tasks | `plan-check` exits 1, naming the row and both tasks |
| a `DELETE` has no `Supersession Inventory` row | `plan-check` exits 1, naming the missing row |
| the diff adds a `.skip` inside a planned test | `scan-diff --disabled-tests` exits 1 with `file:line` and the test name |
| a `.skip` predates `--base` | `scan-diff` ignores it |
| a deferral's `reason` is `low-severity` with `severity: LOW` | `ledgers triage` keeps it `Exempt` and writes no row |
| a deferral's `reason` does not hold at ship time | `ledgers triage` marks it `Lazy` and writes an `unjustified` / `TRIAGED` row with a minted `ts` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `green` prints a verdict and a `fixable` per gap | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `green` verdict is `FAIL` when a gap is unfixable | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `green` leaves a diff-reading kind `fixable: null` | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `tick` marks only the named tasks | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `tick` refuses a task in another group | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| a new command source is registered | unit | `.bkit/core/engine/commands/conventions.test.ts` |
| `open` lists tasks with no done line | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `open` sets `handover` only when a task is open | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `currency` matches a task on a moved symbol | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `currency` emits no hunk outside the matched set | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `plan-check` refuses an unmapped matrix row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `plan-check` refuses a delete with no supersession row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `scan-diff` finds an added skip | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `scan-diff` ignores a skip predating the base | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `scan-diff` reports a disabled test with its line | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `ledgers triage` keeps a low-severity deferral exempt | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| `ledgers triage` marks an unjustified deferral lazy | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| `ledgers triage` writes an unjustified row with a minted ts | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |

### Tasks

<!-- bkit:group 1 start -->

### GROUP 1: The test-first verdict comes from the engine

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `tests green` emits the verdict, a `fixable` per gap, and the gap-log lines
  - **UPDATE:** `green` in `.bkit/core/engine/commands/workflow/tests.ts`: emit `verdict` (`PASS` no gaps, `FAIL` any gap unfixable, `CONCERNS` otherwise, `null` when a gap needs a diff read) and `fixable` / `logLine` on each gap; `fixable: null` for `delete-still-referenced`, `test-changed`, `red-mismatch` and `Changed since red = added lines only`.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: drop the kind→`Fixable` table and the verdict mapping from Process 8 and 10; keep the four diff reads.
  - **DONE WHEN:** `bkit tests green` on a fixture with one `not-green`, one `no-red` and one `test-changed` gap prints `verdict: null` and `fixable` false, false, null; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green emits a verdict and a fixable per gap` fails on `verdict` or `fixable` missing
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green verdict is FAIL when a gap is unfixable` fails on `verdict` not `FAIL`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a diff-reading kind fixable null` fails on `fixable` not `null`

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: The `tasks` noun — the engine ticks, opens and matches plan tasks

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Create the `tasks` noun with `tick`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: the `tasks` command over a plan's task blocks — verbs `tick`, `open`, `currency`; this task lands the noun and `tick`.
  - **UPDATE:** `COMMANDS` in `.bkit/core/engine/commands/registry.ts`: register `tasksCommand`.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the verifier no longer edits the plan; it passes the satisfied task numbers.
  - **DONE WHEN:** `bkit tasks --help` lists `tick`; `bkit tasks tick --plan= --group= --tasks=` ticks exactly the named tasks and prints their numbers; the verify prompt names no plan tick edit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick marks only the named tasks` fails on an unnamed task being ticked
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a task in another group` fails on exit 0
    - `.bkit/core/engine/commands/conventions.test.ts` `every command source is registered` fails on `tasks.ts` missing from `COMMANDS`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line
  - **UPDATE:** `open` in `.bkit/core/engine/commands/workflow/tasks.ts`: print the group's tasks with neither line and `handover: true` when any exist.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 6 sub-step 5 reads the verb instead of the prose set difference.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process 6-7 drop the `DONE` log cross-reference.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `bkit tasks open --plan= --group= --log=` prints the tasks with neither line and `handover: true` only when one is open; the build workflow's handover set difference is gone.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open lists tasks with no done line` fails on a task with a `BLOCKED` line being listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open sets handover only when a task is open` fails on `handover: true` with none

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `tasks currency` — plan-current's path and symbol match
  - **UPDATE:** `currency` in `.bkit/core/engine/commands/workflow/tasks.ts`: per task print the matched paths and needles and the diff hunks for its `CREATE` / `READ` / `UPDATE` / `DELETE` fields against `--base`.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-current.md`: drop Process 5-7's search; keep the `Executable` / `Reword` / `Broken` call.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `bkit tasks currency --plan= --base=` prints each matched task with its matched paths and needles and the diff hunks; the plan-current prompt names no `git diff` search of its own.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency matches a task on a moved symbol` fails on the task not being listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency emits no hunk outside the matched set` fails on an unmatched path appearing

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: The plan's matrix and the ship diff become engine checks

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add problem kinds `matrix` (a row with no task, a task with no row, a row mapped to more than one task) and `supersession` (a `DELETE` with no `Supersession Inventory` row).
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: drop the two checks now engine-side.
  - **DONE WHEN:** `bkit tests plan-check` exits 1 on a plan with a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row, naming the line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses an unmapped matrix row` fails on exit 0
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a delete with no supersession row` fails on exit 0

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `branches scan-diff --disabled-tests`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: `scan-diff` gains `--disabled-tests` — added lines only from `{base}...HEAD`, `docs/plans/**` excluded, matching `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` and deleted assertions; exit 1 on any hit, printing `file:line` and the test name.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 8 reads the verb instead of scanning the diff.
  - **DONE WHEN:** `bkit branches scan-diff --disabled-tests --base=origin/dev` exits 1 on an added `.skip` and prints `file:line`; a `.skip` predating the base is ignored.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added skip` fails on exit 0
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a skip predating the base` fails on exit 1
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a disabled test with its line` fails on the line missing

<!-- bkit:task 6 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: The sweep's deferral rules move to the engine

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `ledgers triage`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: add the `triage` verb — read the FID's `docs/deferrals.jsonl` rows, apply the closed-enum reason tests from `.bkit/jsonl.md`, print each row's bucket (`Exempt` / `Lazy`) and result, and write the `unjustified` / `TRIAGED` rows with a minted `ts`.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 9-11 read the verb; Process 7 (deliverable verification) stays.
  - **DONE WHEN:** `bkit ledgers triage --fid= --plan=` prints each row's bucket and reason-test result and writes the `unjustified` / `TRIAGED` rows; the sweep prompt names no reason test.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage keeps a low-severity deferral exempt` fails on the row being lazy
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage marks an unjustified deferral lazy` fails on the row staying exempt
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes an unjustified row with a minted ts` fails on the row missing

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `ship-update-docs` `Pending Items` from the engine
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-update-docs.md`: drop Process 7 (the `docs/deferrals.jsonl` grep).
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 6 runs `context ledger-scan --source=docs/deferrals.jsonl --terms={FID}` and passes the result.
  - **DONE WHEN:** the `ship-update-docs` prompt names no `docs/deferrals.jsonl` grep and the ship workflow passes the scan result.
  - **TEST FIRST:** n/a — prompt and workflow text only, no behaviour

<!-- bkit:task 8 end -->

<!-- bkit:group 4 end -->

### Open Questions & Assumptions

1. **Where do the plan-block verbs live?** Options: (a) a new `tasks` noun; (b) fold into `context` (`brief`, `diff`) and `tests`. **Recommended:** (a) — the plan-block verbs sit together and `context` keeps artifact work. **Default if unanswered:** (a). Assumption: a new noun is acceptable; if not, task 2 changes to a `context` verb and the rest follow.
2. **Does `tests green` always print `verdict`?** Options: (a) always; (b) behind `--verdict`. **Recommended:** (a) — the audit log is already machine-read. **Default if unanswered:** (a).
3. **Does `tick` tick the whole group or only `--tasks=`?** Options: (a) only the named tasks; (b) every task in the group with no gap, narrowed by `--tasks=`. **Recommended:** (b) as the default. **Default if unanswered:** (b).

### Breaking Changes & Naming

- New command noun `tasks`; no existing command changes name.
- `tests green` output gains `verdict`, `fixable` and `logLine` keys — additive, existing keys unchanged.
- `branches scan-diff` gains `--disabled-tests`; `ledgers` gains `triage` — additive.
- No agent, step or prompt is removed. The prompts lose steps but keep their names, so `## Model Overrides` rows and the `§ Models` table are unaffected.

### Out of Scope

- The deferred sweep's deliverable verification (Process 7) — judgement, and the agent reads the plan for it anyway.
- `plan-current`'s `Executable` / `Reword` / `Broken` classification.
- The four diff-reading test-order classifications in `bkit-build-plan-verify.md`.
- Design-workflow reviewers; no design-run measurements exist.

### Constraints and non-goals

- The judgement stays with the agents: does the codebase satisfy a `DONE WHEN` / deliverable; the diff-reading test-order exceptions; the plan-current classification; doc content edits.
- No new task store. `tasks` reads and writes the plan file's task blocks (#685).
- Works on every host bkit supports; no new config.
- Tasks 1, 2, 5 and 6 are independent; tasks 3 and 4 depend on the noun from task 2.

### Decisions already made

- None yet.

### References

- #663 — Workflow prompt process token optimisation (parent)
- #676 — Orchestrator work the engine could do as bkit commands (the workflow-prose half of the same audit)
- #685 — How plans are shaped, reviewed and built
- #665 — Fewer plan reviewers and rounds
- #668 — Build in task slices: symbol refs per task, 160k cap per agent
- #680 — ledgers append: engine writes ledger rows with a minted ts
- `.bkit/core/prompts/bkit-build-plan-verify.md`, `bkit-build-plan-current.md`, `bkit-ship-deferred-sweep.md`, `bkit-ship-update-docs.md`
- `.bkit/core/engine/commands/workflow/tests.ts`, `branches.ts`, `ledgers.ts`, `context.ts`
- `.bkit/core/workflows/bkit-build.md` § Steps 6-9; `bkit-ship.md` § Step 5

## #556 — Review and adopt Compound Engineering patterns (open)

https://github.com/EveryInc/compound-engineering-plugin

## What it is

Compound Engineering is a plugin of 36 skills built around one loop: brainstorm, plan, build, simplify, review, then "compound", which means writing down what was learned so the next change can read it. `/lfg` runs the loop hands-off as far as an open PR. MIT licence, published by Every, actively maintained (plugin `3.30.5`, last commit 2026-10-14).

## How it compares with bkit

- **Overlap:** design, plan, build, review, debug and PR phases; parallel reviewers that never see each other's output, including a second-model reviewer; a learnings store in the repo that later runs read; git worktrees; GitHub Issues and Linear.
- **Where bkit goes further:** human sign-offs are fixed points of the process (Compound Engineering asks at each step when run interactively, but `/lfg` "never pauses for approval"); a CI template and a merge gate that waits for the CI capstone; resume from a state file in the repo (its run state for PR babysitting and cross-model runs lives in `/tmp`); blocking guardrail hooks (it ships none, only prompt rules); audit templates.
- **Where it goes further:** learnings are the centre of the loop and are checked against the code and pruned; learnings shared across repos ("Compound Packs", experimental); reviewers chosen by what the diff touches; resolving PR review comments and babysitting stacked PRs; a sweep that turns Slack and GitHub feedback into plans; Jira; browser and Xcode test skills; 14 hosts.
- **Already in bkit:** its `ce-compound-refresh` checks learnings against the current code; bkit's `@bkit-utility-update-knowledge` does the same for `docs/knowledge.jsonl`. Filing deferred findings is covered by `docs/deferrals.jsonl` and `@bkit-ship-deferred-sweep`.
- Full table: `.bkit/comparison.md` § "Compared with other AI development frameworks".

## Ideas worth reviewing

### 1. Deal with PR review comments before merging

- **What it does there:** `ce-resolve-pr-feedback` reads the review comments already left on a PR (by people or bots), judges each one, fixes the valid ones, pushes the fixes, then replies and resolves the thread. Anything that needs a human decision stays open with the options written out. Comment text is treated as untrusted. https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-resolve-pr-feedback/SKILL.md
- **What bkit does today:** ship never reads PR review threads. Its only merge precondition is `bkit runs gate` (CI capstone, head, mergeable state), so a PR with an open review comment merges if CI is green, unless the repo's branch protection requires conversations to be resolved.
- **Where it would fit:** `/bkit-ship`, before Step 10's merge gate: at minimum refuse to merge while threads are unresolved; at most a remediate step that handles them.
- **Recommendation:** Worth a closer look. Teams using bot reviewers (or a person reviewing between build and ship) would otherwise see their comments merged past; the "refuse" half is small, the "fix and reply" half is a new agent. Kiro, Cline and oh-my-openagent all have a version of this; this issue is the home for it.

### 2. Record what didn't work, not only what did

- **What it does there:** `ce-compound` writes each learning to `docs/solutions/` with set headings: symptoms, root cause, what did not work, the working fix, and prevention. Planning and review read that folder. https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/guides/ce-compound.md
- **What bkit does today:** a `knowledge` row has `key`, `summary`, `description`, `rootCause`, `remediation` and `status` (`.bkit/core/.bkit/jsonl.md`). The failed attempts are in the per-attempt logs under `docs/plans/{YYYYMM}/logs/{FID}/`, but no ledger row carries them, so the next run can try the same dead end.
- **Where it would fit:** two optional fields on `knowledge` rows (the symptom as seen, and approaches that failed), written by the three remediators that already append knowledge after a verified fix.
- **Recommendation:** Worth a closer look. It fits the planned ledger upgrade, and the debug remediator already has the failed strategies in its prior logs.
- Related issue: #546

### 3. A reviewer that checks the diff against past lessons for the files it touches

- **What it does there:** `ce-code-review` adds a `learnings` reviewer only when a quick search finds a past learning matching the changed modules; that reviewer checks the diff against those learnings. gstack does something similar by handing each reviewer the past pitfalls for its area. https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-code-review/references/persona-catalog.md
- **What bkit does today:** `.agents/docs.md` marks `docs/knowledge.jsonl` as required reading for build, so the challenge reviewers can load the whole ledger, but nothing selects the rows that match the diff, and `docs/failures.jsonl` is optional. Plan Step 4 already picks matching rows with `bkit context ledger-scan` for the plan reviewers (`.bkit/core/workflows/bkit-plan.md`); build Step 10 doesn't.
- **Where it would fit:** a `ledger-scan` call keyed on the changed paths before build Step 10, with its output added to both challenge reviewers' `Read:` list (no new agent needed).
- **Recommendation:** Worth a closer look. It reuses a command bkit already has; its value grows with the size of the ledger, where reading every row is what gets skipped.

## Not worth adopting

- **`/lfg`, the never-pausing pipeline:** it drops the sign-offs after design and plan that bkit's process depends on.
- **Learnings shared across repos (Compound Packs):** marked experimental there, and bkit keeps lessons per repo so they're reviewed in that repo's PRs.
- **Filing deferred findings as new tracker issues:** bkit workflows never create issues by design; deferrals go to `docs/deferrals.jsonl` and are resurfaced by the ship sweep.
- **Handing the build to another vendor's agent (cross-model `ce-work`):** #230 ruled out orchestrating external agent CLIs.
- **Jira:** tracked separately in #60.

## Sources

- https://github.com/EveryInc/compound-engineering-plugin/blob/main/README.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-resolve-pr-feedback/SKILL.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/guides/ce-compound.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-compound-refresh/SKILL.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-code-review/references/persona-catalog.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-code-review/references/dispatch-reviewers.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-work/references/tracker-defer.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-babysit-pr/SKILL.md
- https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/guides/lfg.md

## #100 — Agentic preflight and runtime infra hardening (open)

<!-- linear-import: BAR-232 -->

**Linear:** [BAR-232](https://linear.app/bartens/issue/BAR-232) · **Created:** 2026-05-19 · **Linear assignee:** christian@bartens.biz

---

## Context

Two operational gaps in the autonomous bkit workflow that allow silent failure modes when the pipeline runs unattended.

Both surfaced as deferred items in `docs/pending.md` during [BAR-101](https://linear.app/bartens/issue/BAR-101/linear-depot-claude-intergration) / [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) design work. Grouped together here because they share the same surface (preflight hooks + scheduled checks) and the same failure shape ("agent thinks it's making progress, in fact it's stalled").

## Scope

### 1\. Branch protection rule verification in pre-flight

Ship phase merges PRs autonomously. If `dev` branch requires human approvals, ship will silently fail at merge step with no useful diagnostic.

Currently `.agents/templates/scripts/ci/bkit-set-protection.sh` exists as a one-time **applier** but there is no pre-flight **verifier** gate before ship.

**Fix:** Add a preflight check (in `.claude/hooks/preflight.sh` / `.cursor/hooks/preflight.sh` or as a `bkit-preflight.ts` subverb) that runs `gh api repos/{owner}/{repo}/branches/dev/protection` and confirms one of:

- `required_approving_review_count` is 0, OR
- Cursor Cloud Agent / GitHub Actions bot is in the bypass-actors list

Fail fast with a clear message if neither condition holds.

### 2\. Stuck-pipeline detection

When an agent launched via API fails silently, the parent Linear issue is left `In Progress` with no further activity. No alerting; the only signal is "I haven't seen movement in a while."

**Fix:** Cursor scheduled automation (or GHA cron job) that queries Linear for issues:

- Status `In Progress`
- Has `Build` / `Debug` / `Ship` label
- No recent agent comment for > N hours (N tunable, suggest 4h initial)

Action: post a warning comment on the issue. If stale for > 2N hours, add `Blocked` label.

## Acceptance

- Pre-flight check rejects a Ship run against a `dev` branch with `required_approving_review_count > 0` and no bypass actor, with a clear error.
- Scheduled automation posts a `[bkit-stuck]` warning comment on any issue idle past the threshold.
- Both gates documented in `.agents/workflows/` or equivalent.

## Out of scope

- Refactoring the workflow to use a different orchestration backend.
- Per-step heartbeat tracking (much larger lift).

## Related

- [BAR-101](https://linear.app/bartens/issue/BAR-101/linear-depot-claude-intergration) (Linear → Depot → Claude pipeline that introduced these surfaces)
- [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) (in-repo bkit migration where the gaps surfaced)
- `docs/pending.md` (entries removed at issue-creation time)

<!-- linear-links-start -->

**Links:**

- **Related:** [BAR-101](https://linear.app/bartens/issue/BAR-101) _(not imported)_, [BAR-110](https://linear.app/bartens/issue/BAR-110) _(not imported)_

<!-- linear-links-end -->

## #101 — Agentic workflow: review routing, dry-runs, commit hygiene (open)

<!-- linear-import: BAR-233 -->

**Linear:** [BAR-233](https://linear.app/bartens/issue/BAR-233) · **Created:** 2026-05-19 · **Linear assignee:** christian@bartens.biz

---

## Context

Three workflow-quality improvements that have accumulated as deferred follow-ups across [BAR-108](https://linear.app/bartens/issue/BAR-108/review-adopt-gstack-patterns) / [BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture). Grouped because they all target the bkit orchestrator workflow files (`.agents/workflows/bkit-*.md`) and improve cost-efficiency or correctness of the autonomous loop without changing core behavior.

None are correctness-critical today, hence Low priority. Each is small in isolation but they share the same review/edit surface so bundling avoids three separate context switches.

## Scope

### 1\. Conditional 1× vs 2× plan review routing

`bkit-plan.md` currently invokes all 3 reviewers (`plan-review-1`, `plan-review-2`, `plan-review-3`) unconditionally on every plan. For trivial plans this is wasteful; for risky plans it's correct.

(Note: `plan-complexity-check` / `plan-complexity-split` already exist for plan-partitioning — that's a separate concern from review-skipping.)

**Fix:**

- **Triage:** planner emits a `complexity_score` (1–10) or tier from tasks, deps, ambiguity, risk. Threshold Low → 1×, High → 2× (tunable).
- **Conditional:** review 1 returns `major_gaps_found` or a scope-confidence verdict. Clean → stop; heavy gaps → run review 2 on the revised plan.
- **Heuristics (optional):** task count, plan length, high-risk keywords (integration, custom DB, compliance) force 2×.
- **MVP:** ship triage + conditional second pass only when single review flags severe flaw. Implement via prompt/JSON schema + orchestration routing. Tune on real plans.

### 2\. Dry-run coverage for `/debug` and `/ship` commands

Current test matrix covers `/design`, `/plan`, `/build` only. `/debug` requires a real failing CI run; `/ship` requires a mergeable PR — neither can be simulated with a throwaway Linear issue.

Existing shell assertions (Matrix row 5) confirm the workflow files parse, but semantic validation is absent.

**Fix:** dedicated fixtures

- Seeded branch with a deliberate lint failure → exercise `/debug` end-to-end against it.
- Passing PR fixture → exercise `/ship` end-to-end against it.

Wire both into the existing test matrix as new rows.

### 3\. `chore({FID}):` orchestrator commit-subject audit

[BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture) narrowly renamed 2 cited `chore({FID}):` orchestrator-emitted subjects that carry verdict context (`bkit-debug.md` Step 8 `observe instrument`, `bkit-build.md` Step 4 `assess skills`) to verb-prefixed subjects so the `commit-msg` hook validates their bkit trailer.

A broader sweep was deferred. The bkit-managed orchestrator files (`bkit-build.md`, `bkit-design.md`, `bkit-debug.md`, `bkit-ship.md`) still emit dozens of `chore({FID}):` subjects (e.g. `chore({FID}): worktree-setup`, `chore({FID}): summary`, `chore({FID}): close-workflow`).

**Fix:** audit all 5 `bkit-*.md` orchestrators for any remaining agent-step commits whose subject does not match the verb pattern. Decide per-case whether to:

- Rename to verb-prefixed subject (`docs({FID}):` / `feat({FID}):` / etc.), OR
- Accept hook bypass (and document why)

## Acceptance

- Triage subagent emits `complexity_score`; orchestrator skips review-2/3 below the threshold on a real test plan. Cost reduction measurable on a `/plan` run.
- `/debug` and `/ship` test matrix rows green against the new fixtures.
- Every `chore({FID}):` subject in `bkit-*.md` either matches the verb pattern or has a documented bypass reason.

## Out of scope

- Refactoring the reviewer subagents themselves (just routing changes).
- Replacing the test matrix shell harness with a different test framework.
- Changing the commit-msg hook contract ([BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture)'s territory).

## Related

- [BAR-108](https://linear.app/bartens/issue/BAR-108/review-adopt-gstack-patterns) (gstack patterns — original 1×/2× routing discussion)
- [BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture) (commit-subject narrow rename; this is the broader sweep)
- `.agents/workflows/bkit-*.md`
- `docs/pending.md` (entries removed at issue-creation time)

<!-- linear-links-start -->

**Links:**

- **Related:** [BAR-108](https://linear.app/bartens/issue/BAR-108) _(not imported)_, [BAR-124](https://linear.app/bartens/issue/BAR-124) _(not imported)_

<!-- linear-links-end -->

## #687 — Explainer page: step through a bkit run, phase by phase (closed)

### Problem

A new bkit user reads that bkit takes a feature through design, plan, build, debug and ship, that review sends work back, that failures go to debug, and that the owner is asked when bkit can't settle something itself. Nothing shows them how those parts fit together. The workflow files are far too detailed for that, and a static diagram can't show work going back round a loop, steps running at the same time, or what a run looked like at a given moment.

### Outcome

One page, `docs/explainer/index.html`, opened by double-clicking it, that plays a fixed example run of bkit. The user moves forwards and backwards through the run and, at every point, sees which steps are lit, which arrow was just taken, and what each counter reads.

**What the page shows.** Exactly these phases and steps, and nothing else:

<!-- prettier-ignore -->
| Phase | Steps, in order |
| --- | --- |
| Design | Interview the owner · Explore approaches (at the same time) · Write the design · Review (at the same time) · Revise |
| Plan | Write the plan · Review (at the same time) · Revise |
| Build | Write the code, tests first · Verify · Fix · Review the code (at the same time) · Open a PR |
| Debug | Run the tests · Diagnose · Fix |
| Ship | Check CI · Confirm with the owner · Update docs · Merge |
| (outside the phases) | Ask the owner · Hand over to the owner |

A step marked "(at the same time)" is drawn as two side-by-side boxes, standing for several agents working at once.

**Between phases.** Each phase ends and stops. The next one starts only when the owner starts it, or, for ship and debug, when bkit's cloud runner starts it after CI finishes. The page shows this as the arrow between the phases, labelled with who starts the next one:

<!-- prettier-ignore -->
| From | To | When |
| --- | --- | --- |
| Revise (Design) | Write the plan | The owner starts plan |
| Revise (Plan) | Write the code, tests first | The owner starts build |
| Open a PR | Check CI | The owner, or the cloud runner, starts ship |
| Check CI | Run the tests (Debug) | CI is red; the owner, or the cloud runner, starts debug |
| Run the tests (Debug) | Check CI | The tests pass; the fix is pushed and ship runs again |

**Inside a phase.** Each step leads to the next one in its row, except where a loop below says otherwise. The loops:

<!-- prettier-ignore -->
| From | To | When |
| --- | --- | --- |
| Verify | Fix (Build) | Verify finds gaps that can be fixed |
| Fix (Build) | Verify | After every fix |
| Verify | Ask the owner | A gap can't be fixed, or the fix rounds are used up |
| Ask the owner | Fix (Build) | The owner picks "fix now" |
| Ask the owner | Review the code | The owner accepts the gap |
| Review the code | Write the code, tests first | Review finds problems; they go back as new work |
| Run the tests (Debug) | Diagnose | The tests fail |
| Fix (Debug) | Run the tests (Debug) | After every debug fix |
| Run the tests (Debug) | Ask the owner | The tests still fail after a fix |
| Ask the owner | Diagnose | The owner says "try again" |
| Run the tests (Debug) | Hand over to the owner | Debug has used up its attempts |
| Check CI | Confirm with the owner | CI is green and build accepted something without asking the owner |
| Check CI | Update docs | CI is green and there is nothing to confirm |
| Ask the owner | Hand over to the owner | The owner says "stop" |

**Counters.** Three, shown at all times: questions to the owner (each time the run stops at "Ask the owner"; the design interview is not counted), build fix rounds, debug rounds.

**The example runs.** The page offers two, and the user picks one:

1. **A normal run.** Design: interview, explore, write, review, revise. The owner starts plan. Plan: write, review, revise. The owner starts build. Build: write the code, verify finds a gap, fix, verify passes, review the code sends work back, write the code, verify passes, review passes, open a PR. Ship: CI is red. Debug: the tests fail, diagnose, fix, the tests pass. Ship: CI is green, nothing to confirm, update docs, merge. Counters at the end: 0, 1, 1.
2. **A run that needs the owner.** Design and plan as in run 1. Build: write the code, verify finds a gap, fix, verify finds a gap again and the fix rounds are used up, ask the owner, the owner says stop, hand over to the owner. Counters at the end: 1, 1, 0.

**How it works.** One function takes a run and a position in it and returns everything the page shows at that point: which steps are lit, which arrow is active and what each counter reads. The drawing code only paints what that function returns and keeps no state of its own. Unit tests check the function, so checking the page's behaviour needs no browser.

**Moving through a run:**

- Forwards and backwards one step at a time, jump to the start or the end, and a slider for any point in between.
- Moving backwards to a point shows exactly what moving forwards to that point from the start would show, counters included.
- Steps that run at the same time light up together, in one move, not one after the other.
- When the user's system is set to reduce motion, the page shows the same steps without animation, and nothing is hidden or skipped.
- Everything works from the keyboard alone, including switching between the two runs, and the focused control is always visible.

### Success criteria

- Double-clicking `docs/explainer/index.html` opens a working page: no server, no errors in the browser console.
- The explainer's unit tests cover the page's state at every position of both runs, including positions reached by moving backwards. They run as part of bkit's existing unit tests, and `pnpm bkit:gate:static-unit` passes.
- Both runs can be played from start to end and back with the mouse and with the keyboard alone.
- With reduced motion turned on, every step of both runs is still shown.
- The counters at the end of each run match the values above.

### Constraints and non-goals

- Everything lives in `docs/explainer/`: `index.html` (the page), `data.js` (the phases, steps, arrows and both runs above, under one global), `logic.js` (the state function), and the tests for `logic.js`.
- `data.js` and `logic.js` load with plain `<script src>` tags, not `type="module"`. Browsers refuse to load modules from a file opened off disk. The tests load the same `logic.js`.
- bkit's unit tests only pick up files under `.bkit/core/engine/**` and `scripts/harvest/**` (the `include` list in `vitest.config.ts`). The explainer's tests are added to that list so the unit run finds them.
- No new packages, no build step, no server, no secrets.
- CI already runs bkit's unit tests. Nothing in `.github/workflows/` changes.
- The page belongs to bkit's own repo. It is not added to the npm package or to anything `bkit install` writes into other repos.
- Not in scope: hosting or publishing the page, screenshots, agent names or counts, real data from bkit runs, and any phase, step or loop not listed above.

### Decisions already made

- The page's content is fixed as listed above. Agents build the page and its logic; they don't add to or change how it describes bkit, even where bkit's workflow files go into more detail.
- The content is a simplified version of what bkit's workflow files do. These parts of the real workflows are left out on purpose, to keep the page small: build's own test run and its fix loop before the PR, debug switching to a slower step-by-step investigation once its normal fix attempts are used up, ship's fix loop when a merge fails, a review in design or plan failing outright, and the setup and bookkeeping steps every phase runs.
- All behaviour lives in the one state function; the drawing layer stays thin.
- The folder, the file names and the plain script tags are fixed.

### Open questions

- The diagram's layout: one row per phase, a single flowing line, or something else.
- Whether the page also plays a run on its own, and at what speed.

Test not complex enough for good comparison

## #679 — Raw git in ship, debug and build becomes bkit verbs (closed)

### Problem

A handful of workflow steps still run raw git and shell inside their bash blocks, or ask the orchestrator to read shell output by eye. They cost few tokens, but each is a place the model can run the wrong git command or misread the result, and the same sequence is written out more than once.

<!-- prettier-ignore -->
| Item (#676) | Where | What the block does today |
| --- | --- | --- |
| 13 | build Step 18 sub-steps 1 and 2 | `git fetch origin dev`; `git diff origin/dev --name-only \| grep -qiE '(^\|/)(migrations\|migrate)/'`; `git show -s --format=%B HEAD \| grep -qF '[force build]'`; then amend or `git commit --allow-empty` with `bkit [force build]`. The engine has no notion of force build. |
| 14 | debug Step 11 sub-steps 2 and 6 | `git diff {DIFF_BASE}...HEAD -- . ':(exclude)docs/plans' \| grep -qE '^\+.*\[DEBUG-OBSERVE\]'` as the no-leak assertion; `"{BKIT}" issues labels {LABEL_FLAGS} \| jq -er .autoRouteSuffix` then `git add -A && git commit --allow-empty -m "chore({FID}): create-pr bkit [verbose ci]${AUTO_ROUTE_SUFFIX}"`. |
| 15 | ship Steps 1, 2, 4, 5, 8, 10, 14 | Step 1: `[ "$(git branch --show-current)" = "{SHIP_BRANCH}" ] \|\| …` and `rm -f` of the `.deferred-blocked` and `.rebase-failed` sentinels. Step 2 sub-step 3: branch `case`, `git fetch origin dev`, `git rev-list --count origin/dev..HEAD`, `git push -u origin "$B"`, `prs open`, `status meta --opened-pr`. Step 4 B2: `ledgers commit --mode=stage` then raw `git commit -m "chore({FID}): conflict-resolve bkit [skip ci]"` then `branches push`. Step 5: `git fetch origin "{SHIP_BRANCH}"` and `git merge --ff-only`. Step 8: `git push origin "{SHIP_BRANCH}"` after `ledgers commit`. Step 10: `git fetch` plus `counters rows … \| jq -er .value` into `counters route`. Step 14: `rm -f` and `cp` of `ship-summary.md` into the outbox. |
| 17 | ship Step 2 sub-steps 2 and 6 | A case-insensitive contains check on the branch name, by the model; `runs wait` twice then the model asserts `prs checks` output. |
| 18 | design and plan Failure Path step 3 | The model reads `git status --short` porcelain to decide which stray files to remove. |

### Outcome

Each sequence becomes a verb or a flag on an existing verb, with a `Route:` on exit codes:

- `branches force-build --base=origin/dev` detects migration paths and amends or empty-commits the `[force build]` marker. Or a `--force-build-on=migrations` flag on `prs open`.
- `prs scan-diff --marker='[DEBUG-OBSERVE]' --base={DIFF_BASE}` beside the existing `prs scan-body`; `prs open --create-pr-commit` writes the `create-pr bkit [verbose ci]` commit with the auto-route suffix itself.
- Ship: `branches ff --ref=origin/{SHIP_BRANCH}` for fetch plus fast-forward; `prs open --ensure` folds the branch guard, fetch, ahead count, push and `status meta`; `ledgers commit --push` for the stage-commit-push triples; `counters route --rows=…` so no jq; `workflows close --summary=ship-summary.md` does the outbox copy. Step 1's branch assert and sentinel removal move into `workflows start` for ship.
- `prs checks --assert` exits non-zero when any check is not green; `branches name-check --branch --expect` for the warning.
- `workflows handover --list-stray` prints the untracked and modified paths as JSON; the orchestrator still decides what to remove.

### Success criteria

- No bash block in `.bkit/core/workflows/` contains a bare `git fetch`, `git merge`, `git push`, `git commit`, `git diff … | grep`, `rm -f` or `cp` outside a `"{BKIT}"` call, except `cd` and `mkdir -p`.
- No `| jq` pipe remains in a workflow bash block.
- Ship, debug and build keep their current behaviour on the same inputs; the existing render snapshots and `commands/workflow/*.test.ts` cover each new verb.

### Constraints and non-goals

- Behaviour-preserving. No change to what gets committed, pushed or asserted; only who runs it.
- One workflow per change, ship first since it holds the most.
- Done last in the #676 order; it buys safety and consistency more than tokens.

### Decisions already made

- None yet.

### Open questions

- Whether the force-build marker belongs on `prs open` or on a `branches` verb, given ship also opens PRs.

### References

- #676 — Audit: orchestrator work the engine could do as bkit commands (items 13, 14, 15, 17, 18)
- #663 — Workflow prompt process optimisation
- `.bkit/core/.bkit/workflows.md` § Workflow Authoring Rules ("Bash decides, prose routes")
- `.bkit/core/engine/commands/workflow/branches.ts`
- `.bkit/core/engine/commands/workflow/prs.ts`
- `.bkit/core/engine/commands/workflow/ledgers.ts`
- `.bkit/core/workflows/bkit-ship.md`
- `.bkit/core/workflows/bkit-debug.md` (Step 11)
- `.bkit/core/workflows/bkit-build.md` (Step 18)

**A follow-on now depends on this issue: #681 "Engine output as text: terse verb replies, tabulated context fetches" (https://github.com/cbartens/bkit/issues/681).**

Today 8 call sites pipe `"{BKIT}"` output through `jq` (7 in `.bkit/core/workflows/bkit-debug.md`, 1 in `bkit-ship.md`), which is the only reason verb replies are JSON. Once this issue removes every `| jq`, nothing parses the output, and #681 can switch the default to `key: value` text (with `--json` kept for scripts and tests) across the 317 `"{BKIT}"` calls in the six workflows. #681 lists this issue in its `bkit:blocked-by` block.

One request for the design here: when a raw git call becomes a verb, print only the fields the workflow reads next, not the whole git object. That is the same saving #681 is after, and it costs nothing to do here first.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 3 and 4.

### Implementation plan (2026-10-24)

**In short:** every raw `git` and `gh` line left in ship, debug and build becomes a `bkit branches|prs|ledgers|workflows` verb, or a flag on one that already exists. A guard test then fails if a raw call comes back. It ships in six slices: ship first (the most lines), then debug, then build, then the Failure Paths, then the guard. One behaviour fix rides along: `[force build]` currently does nothing on pull requests.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 11 | `[force build]` on pull requests | **Fixed here.** CI reads the marker from the PR title on `pull_request` events and from the commit message only on pushes (`bkit-ci.yml:57-71`). So the empty `[force build]` commit the workflows push today is ignored on a PR. `branches force-build` does both: (1) it adds `[force build]` to the PR title when a PR is open, then (2) it pushes the empty marker commit. CI's `pull_request` trigger uses the default event types (`opened`, `synchronize`, `reopened`; `bkit-ci.yml:11`), so renaming the title alone starts nothing. The push in (2) is the `synchronize` event that starts the run, and that run reads the new title. It never amends a commit. |
| 5 | Repeat-safety (shared with #675) | Marker commits, CI dispatch re-triggers and PR opens record an `engine-action` row in `status.jsonl` before they report done, and check for one first. A re-run after a crash doesn't push a second marker commit or open a second PR. The row type and helper come from #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675. |

Decided by me (say if you disagree):

- **Ship Step 8 push stays conditional.** The draft for this plan suggested pushing unconditionally. I'm keeping today's behaviour: push only when `outcome` says there is something new. It becomes a route on the verb's output instead of prose. An unconditional push would start a CI run on every ship even when nothing changed. If you want the simpler unconditional form, it's a one-line change.
- **Branch-name check.** When the branch name doesn't match the FID, `worktrees setup` prints a stderr warning rather than failing, so a hand-made branch still works.

#### What is already true in the code

- Item 17 in the body is out of date: `prs checks` already exits 1 on a failing check. #662 — workflows start after a failed ship — https://github.com/cbartens/bkit/issues/662 is closed.
- The body's site list misses these: build:146, debug:310, Failure Path build:90 and debug:92, ship:486, and ship sub-steps 2.2 and 2.6. All are in the slices below.
- Ship's last jq pipe (`bkit-ship.md:535`) goes here. Debug's go in #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678.

#### New verbs and flags

<!-- prettier-ignore -->
| Verb or flag | Replaces |
| --- | --- |
| `branches push --mode=plain --set-upstream --ahead-of=<ref>` | `git push -u` plus the prose ahead-of check |
| `branches fast-forward --onto=<ref>` | `git fetch` + `git merge --ff-only` |
| `branches scan-diff --base` | `git diff --name-only` pipes used for routing |
| `branches force-build` | the empty-commit block; also sets the PR title (decision 11) |
| `branches push --commit --label` | `git commit --allow-empty -m …` + push for the debug `create-pr bkit [verbose ci]` marker |
| `counters route --rows=` | prose counter arithmetic in ship |
| `workflows start --branch` | ship's sentinel clearing in prose |
| `workflows close --summary` | `git log` summary assembly at close |
| `ledgers commit --path` and `--mode=commit --stage-tracked-updates` | `git add`/`git commit` of ledgers |
| `status meta --debug-attempt=run` | debug's hand-written meta row |
| `runs gate --branch` (with fetch) | `git fetch` before the gate check |
| `workflows handover --list-stray` | Failure Path `git status --porcelain` reading |

Every verb that pushes or opens a PR records an `engine-action` row (decision 5).

#### Slices

Each slice: tests first and red, engine code to green, prose, `pnpm wording:sync`, `bkit install` once at the end.

1. **Ship open and verify** (Steps 1-8): `workflows start --branch`, `branches fast-forward`, `branches scan-diff`, `branches push --mode=plain`, the conditional Step 8 route, ship 2.2 and 2.6, ship:486.
2. **Ship integrate to close**: `counters route`, `ledgers commit`, `workflows close --summary`, the jq pipe at `:535`.
3. **Debug**: `branches push --commit --label`, `status meta --debug-attempt=run`, debug:310, `branches force-build`.
4. **Build**: build:146, the build `[force build]` site, `runs gate --branch`.
5. **Failure Paths**: `workflows handover --list-stray` at build:90 and debug:92, and the ship equivalent.
6. **Guard test**: `workflow-fence-syntax.test.ts` fails on any `git ` or `gh ` call inside a workflow bash fence, except a short named allow-list with a reason for each entry. This waits for #678, which removes debug's jq and `git diff` lines.

Tests per verb: plain and set-upstream push against a temp bare remote; fast-forward refusing a diverged branch; `force-build` with and without an open PR (stubbed `gh`), plus a re-run that is deduped; `--list-stray` on a dirty tree; the Step 8 route on each `outcome`.

#### Verification

- `pnpm vitest run`, `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Live: `/bkit-ship` of a small change on a throwaway issue. On its PR, run `branches force-build` and check that CI starts with the force-build path (the job log shows the marker was read from the title).
- Consumer CI files copied from bkit's template read the title the same way. Check the template copy and note in `CHANGELOG.md` if it differs.

#### Risks

- **Push and PR semantics in the engine.** A wrong flag here pushes the wrong branch. Each push verb prints what it pushed and where; integration tests use a real bare remote, not a stub.
- **Uncommitted work by other agents** in `worktrees.ts` and `workflows.md`: rebase onto it before slices 1 and 5.

No open questions remain for this issue.

**Implemented: all six slices** of the plan above, in commit `e3cb1a3f` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed.

Checks run:

- typecheck, lint, format and prose checks pass.
- Unit tests: 5734 passed. The 2 that fail also fail on `dev` without this change.
- bats tests: 31 of 31 pass. Integration tests: 1553 of 1553 pass.
- `slop:delta`: unchanged from `dev`.
- `bkit check`: clean.

The guard test in `workflow-fence-syntax.test.ts` allows one raw git call: the bootstrap line that locates the `bkit` binary, since no verb can run before it.

Changes from the plan:

- **Ship Step 5.1 stops on a failed fetch.** Exit 10 now goes to the Failure Path.
- **Build's no-progress check and migrations scan look at committed diffs.** They compare commits (three-dot) instead of the working tree, which makes the migrations scan stricter.
- **Build's force-build runs after `prs open`.** That way the PR exists when its title is set.
- **Ship's Failure Path has no `--list-stray` step.** It saves only the run's record.
- **Two audit tests were narrowed, as a direct effect of removing raw calls.** `counter-prose-audit.test.ts` now checks `REVALIDATE_ATTEMPT` in place of `DEBUG_ATTEMPT`, whose jq line is gone. The shell-variable minimum in `block-locality-audit.test.ts` dropped from 10 to 5.
- **Corrected `.bkit/workflows.md`.** It said ship pushes before merge in two places; the code and its test have three: opening a missing PR, B2 and bookkeeping.

Live runs (a throwaway `/bkit-ship` and `branches force-build` on its PR) were not done.

## #678 — Build and debug loop verbs: failure count, diff artifact, debug mode (closed)

### Problem

Build and debug are the longest runs, so anything the orchestrator repeats per iteration costs the most. Three such things are hand work today:

<!-- prettier-ignore -->
| Item (#676) | Where | What the orchestrator does today |
| --- | --- | --- |
| 5 | build Step 7 sub-step 11, Step 14 sub-step 2; debug Step 3 | `tests run` prints `failures: null` on FAIL, and its help text (`.bkit/core/engine/commands/workflow/tests.ts:563`) says "count failing suites from the log". The orchestrator reads the log to count. Then the same four-line sequence is repeated three times: copy the log to the artifact path, `context clamp-log --reset`, `context clamp`, `steps finish`. |
| 3 | build briefs for verify, holistic, challenge-1, challenge-2 and handover; the Large Diff Guard | Each brief tells the subagent to run `git diff origin/dev...HEAD` itself, so five subagents each spend their first turn producing the same diff. The Large Diff Guard is prose the orchestrator applies by judgement. |
| 11 | debug Step 1 sub-steps 7 and 8; Step 3 | Four jq-chained calls (`status path`, `counters run`, `counters derive`, `counters max`) feed `counters route`; then a prose table maps `[soak]` and `[repro]` in the prompt to `DEBUG_MODE`, `SOAK_ENTRY`, `REPRO`; Step 3 greps the input file for `[live=off]` to pick the gate. |

### Outcome

- `tests run` counts failures from the runner's summary line for the gate kind it ran, and prints a number on FAIL. It takes `--artifact=<path>` and does the copy, clamp-log reset and clamp itself, so the workflow block is `tests run` then `steps finish`.
- `context diff --base=origin/dev --artifact=docs/plans/{YYYYMM}/logs/{FID}/diff-{RUN}.md` writes one clamped diff per run, with the Large Diff Guard applied by the engine and reported in its output. Build briefs read the file instead of running git. This is done together with the brief rewrite in #668 so the briefs are edited once.
- `status route --workflow=debug --prompt-file --file={STATUS}` prints `DEBUG_ATTEMPT`, `DEBUG_MODE`, `SOAK_ENTRY`, `REPRO` and the gate to run, replacing the jq block, the mode table and the Step 3 grep. The attempt limits come from #670.

### Success criteria

- The orchestrator never opens a test log to count failures; `failures` is always a number when `verdict` is FAIL.
- The copy, clamp-log reset, clamp sequence appears in no workflow file.
- Build subagents read `diff-{RUN}.md`; no brief tells a subagent to run `git diff`.
- Debug Step 1 and Step 3 each hold one `bkit` block for mode and gate selection.
- Measured with #664's script on a comparable build: fewer orchestrator turns per verify iteration, and shorter first turns for the five diff-reading subagents.

### Constraints and non-goals

- Failure counting is per gate kind the engine already knows from `package.json`; a runner with no recognisable summary line prints `failures: null` and says so, which is today's behaviour.
- The diff artifact is read-only input; subagents keep running their own targeted `git diff` on single files when they need to.
- Item 11 waits for #670 to settle the attempt numbers.

### Decisions already made

- None yet.

### Open questions

- Whether the diff artifact replaces the per-subagent diff for challenge-2 (security), which may want the unclamped diff.
- Whether `context diff` applies the size profile from `context clamp` or a diff-specific one.

### References

- #676 — Audit: orchestrator work the engine could do as bkit commands (items 3, 5, 11)
- #668 — Build in task slices: symbol refs per task, 120k cap per agent (brief rewrite)
- #670 — max attempt 1 (attempt limits)
- #664 — chat and run stats script (measurement)
- #663 — Workflow prompt process optimisation
- `.bkit/core/engine/commands/workflow/tests.ts`
- `.bkit/core/engine/commands/workflow/context.ts`
- `.bkit/core/engine/commands/workflow/counters.ts`
- `.bkit/core/workflows/bkit-build.md` (Steps 7, 14; subagent briefs)
- `.bkit/core/workflows/bkit-debug.md` (Steps 1, 3)

**Item 3 (the diff artifact) is built at engine level and pulled forward.** `bkit context diff` is staged in the working tree today (lands with the #656 / #660 commit), in `.bkit/core/engine/commands/workflow/context.ts`, with six tests in `context.test.ts` and a row in `docs/testing.md`.

```text
bkit context diff --artifact=<file> [--base=origin/dev] [--fid= --step= --attempt=]
```

- Range `{base}...HEAD`, `docs/plans/**` excluded, one file. Prints `filesChanged`, `linesAdded`, `linesDeleted`, `linesChanged`, `diffLines`, `partial` and a clamp record (`clamped` = `partial`), appended to the step's clamp log when `--fid --step` are given.
- Over 10000 diff lines it writes the Large Diff Guard shape in code: first line `# partial diff coverage: …`, then `--stat`, then the 20 largest files cut to 500 lines each, 50000 lines in all, and it logs the fallback.
- Exit 5 when `--base` is not a commit; an empty range writes a one-line note.

**What is left of item 3 for this issue:** the workflow wiring, which sits in files another agent holds today. `.bkit/core/workflows/bkit-build.md` Step 2 runs the verb once per run (`--artifact="docs/plans/{YYYYMM}/logs/{FID}/build-diff-{RUN}.md" --fid={FID} --step=build-diff`), the Read lines for verify, holistic, challenge-1, challenge-2 and handover read the artifact instead of `git diff origin/dev...HEAD` (lines around 88, 605, 609), and the Large Diff Guard prose at line 58 goes because the verb applies it. `.bkit/core/.bkit/workflows.md` § clamp table gains a `build-diff` row. #665's size gate reads the printed numbers; #668's per-group verify passes `--base=<group start sha>`.

Items 5 (`tests run` failure count and `--artifact`) and 11 (`status route` for debug mode) are untouched.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), section 2.5.

### Implementation plan (2026-10-24)

**In short:** three slices.

- **A.** `tests run` counts failures itself from JUnit reports (the XML test results most runners can write) and writes the shortened log artifact in the same call.
- **B.** A debug `status route` prints the attempt number, debug mode, repro state and gates, so debug's Step 1 stops reconstructing them in prose and jq.
- **C.** Every agent that reads the diff gets a fresh diff file written just before its step.

Underneath all three, every shortened file keeps its untouched original in the outbox (the uncommitted scratch folder inside `.git`), and the committed record says how to fetch it again.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 9 | How `tests run` counts failures | **From a JUnit report folder.** `tests run` empties `{log}.reports/` and passes its path to every gate as `BKIT_TEST_REPORT_DIR`. `failures` = failing plus erroring test cases summed across all XML files there. No reports → `failures: null` and a hint naming the runner flag, never a guessed 0. "Failures" means failing test *cases*, also for unit tests (today some places count suites). |
| 9b | Where the reports live | Next to the log, in the outbox: e.g. `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log.reports/`. Never committed: the count goes into `status.jsonl` and the readable log copy into `logs/{FID}/`. |
| 10 | How the diff reaches its readers | **Per reader, written to `tmp/`, now, in all 3 workflows.** Right before each step that reads the diff, `context diff --reset-log` writes `tmp/bkit-diff-{FID}.md`. Sites: build Steps 7, 9, 10 and the Failure Path; debug Step 10 and the Failure Path; ship's deferred sweep and Failure Path. The `workflow-large-diff` wording retires in all three workflows now, without waiting for #668. **This replaces the owner's 2026-10-23 comment above** that proposed one shared diff file. |
| 10b | Diff too big for one file | When `context diff` reports `partial diff coverage`, challenge-2 (the security reviewer) runs a targeted `git diff` on each omitted file that touches security-relevant paths, so a large diff can't hide an auth change from it. |
| R | Untouched originals of shortened files (shared with #681) | **Outbox only, never committed.** Anything the engine shortens (the trim by `context clamp`, the table rendering in #681) keeps its original as `{name}.raw.{ext}` in `{OUTBOX}`. The committed clamp record in `logs/` gains `source`: the exact command and inputs that produced the file, plus `fetchedAt`, so anyone can download it again. A re-download returns the source's data *now*, not at `fetchedAt`; the timestamp is there so a time-windowed source can be re-queried for the same window. |

#### What is already true in the code

- `tests run` prints `failures: verdict === "PASS" ? 0 : null` (`tests.ts:667`). Its summary tells the orchestrator to "count failing suites from the log" (`:623`), which is the counting this issue moves into the engine.
- The JUnit parser already exists: `parseJunit` (`tests.ts:141`), used by the single-file path through `BKIT_TEST_REPORT` (`:101`). Slice A reuses it across a folder.
- `status.ts:189` turns a missing FAIL count into `0`, so a FAIL with no count reads as "0 failures". It must read `null`.
- Debug writes its test log straight into `logs/` (`bkit-debug.md:327`) and trims it in place (`:335`), so the original is lost. Build writes the log to the outbox (`bkit-build.md:737`) and trims a copy (`:742`). Slice A makes debug work like build.
- `context run-block` writes context-fetch output into `logs/` and trims it in place (`context.ts:1166-1168`), so the original of a large fetch is lost too. Item R fixes this for every trim site.
- #670 — fix loops run one round, then ask the owner — https://github.com/cbartens/bkit/issues/670 shipped without changing the debug caps (`MAX_DEBUG_ATTEMPT` 3), so the debug-mode work here is unblocked.
- There are 8 jq pipes in the workflows (`bkit-ship.md:535`; `bkit-debug.md:210,215,216,218,310,706,715`). Slice B removes debug's six Step-1 pipes; #679 removes the rest.

#### Slices

Each slice: tests first and red, engine code to green, prose, `pnpm wording:sync`, `bkit install` once at the end.

**Slice A: `tests run` counts and writes the artifact** (#676 items 9, 10)

- Engine:
  - The report folder and `BKIT_TEST_REPORT_DIR` as above; `failures` from the XML.
  - `tests run --artifact=<logs path> --fid --step --attempt` copies the log to the artifact path, resets the clamp log for that step and attempt, trims with the `debug-evidence` profile, and appends the clamp record. One call replaces the separate `context clamp` lines at `bkit-build.md:523,742` and `bkit-debug.md:335`. Exit 5 when the artifact step fails (an existing code, so the workflows' existing branch handles it).
  - The untouched log stays in the outbox (item R). The clamp record gains `source` (the gate commands) and `fetchedAt`.
  - Fix `status.ts:189` (missing → `null`).
- Dogfood wiring in this repo: the vitest JUnit reporter in each vitest config that a gate runs, and `--report-formatter junit` for bats, both writing into `$BKIT_TEST_REPORT_DIR`. Consumers wire their own runners; `docs/testing.md` gets a short "write JUnit to `$BKIT_TEST_REPORT_DIR`" section with no stack named.
- Tests first: counts across several XML files; `<error>` counted; skipped not counted; no folder → `null` plus hint; stale reports from a previous attempt are cleared; artifact written and trimmed; exit 5 on an unwritable artifact path; `status.ts` reads a missing count as `null`.
- Prose: build and debug test steps route on `failures` and drop their count-from-log instructions; the clamp lines go.

**Slice B: debug's Step 1 as one verb** (#676 item 11)

- Engine: `status route --workflow=debug --prompt-file={SESSION_DIR}/prompt.md` prints `debugAttempt`, `debugMode` (`standard|soak`), `soakEntry`, `repro` and `gates`.
  - It reads the prompt file from #675 and #677. Only the prompt counts for markers such as `[live=off]`; the issue body no longer does.
  - Soak rows and escalations are read from the **current run only**.
- Two existing debug faults, each logged in `docs/failures.jsonl` through `bkit ledgers append` and covered by a test:
  - a finished run's soak rows force SOAK mode on the next run of the same FID
  - an escalation recorded in `workflow-meta` without a soak row is lost when the run resumes
- Prose: debug Step 1's six jq pipes and the mode reasoning become one routing block.
- Tests: fresh run; resumed attempt 2; soak entered this run; soak rows from an old run (ignored); escalation in meta only; `[live=off]` in the prompt vs in the issue body.

**Slice C: diff per reader**

- Engine: no new verb. Check that `context diff --reset-log` prints `partial: true` and the omitted file list when it reports partial coverage; add them if missing.
- Prose: the sites listed under decision 10 call `context diff` into `tmp/bkit-diff-{FID}.md` right before the agent step. The challenge-2 prompt gains the targeted-diff rule from 10b. Retire `workflow-large-diff`.
- Later: #668 adds `--base` and retunes `DIFF_GUARD`. Nothing here blocks on it.
- Tests: `workflow-shape.test.ts` asserts that each listed agent step is preceded by its `context diff` line; the wording tests see `workflow-large-diff` removed.

#### Item R across the engine

One helper in `context.ts`: `keepRaw(file, outboxPath)` copies the original before any trim or render, and the clamp record gains `raw` (the outbox path), `source` and `fetchedAt`. Call sites: `clampFile` callers (`context clamp`, `run-block`, `tests run --artifact`) and #681's renderer. Tests: the raw copy is byte-identical to the input; the record carries `source`; nothing under `logs/` contains the raw file.

#### Verification

- `pnpm vitest run`, `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Dogfood: in a scratch consumer from `pnpm build`, make one unit test fail. Check that `tests run` prints `failures: 1`, writes the trimmed artifact, and leaves the full log plus reports in the outbox.
- Live: one `/bkit-debug` run on a throwaway issue with a planted failing test, then a resume. Check `debugAttempt` and `debugMode` against the rows.

#### Risks

- **Runners that can't write JUnit** give `failures: null`. The routes treat `null` on FAIL as "count unknown", which is safe, and the hint says how to fix it.
- **Uncommitted work by other agents** in `tests.ts` and `status.ts`: rebase onto it before slice A.

No open questions remain for this issue.

**Implemented: slices A, B and C, plus item R** of the plan above, in commit `85f863ad` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed.

Checks run:

- typecheck, lint, format and prose checks pass.
- Integration tests: 1553 of 1553 pass.
- Unit tests: 5671 passed. The 2 that fail also fail on `dev` without this change.
- `slop:delta`: unchanged from `dev`.
- `bkit check`: clean.

Changes from the plan:

- **Debug mode values stay `NORMAL` and `SOAK`.** The plan said `standard`/`soak`.
- **A CONCERNS verdict with no count still reads 0.** Only a FAIL verdict with no count reads `null`.
- **Debug Step 2 keeps one jq pipe**, because the counter-prose audit requires it.
- **The `MAX_*` limits table moved to `.bkit/core/engine/shared/thresholds.ts`.**
- **One test limit was lowered:** the minimum shell-variable count in `block-locality-audit.test.ts` went from 20 to 10. Fewer shell lines remain, which is the point of this work.
- **The two debug faults are logged as CLOSED rows** in `docs/failures.jsonl`, each with a test.

Live runs (the dogfood consumer and a throwaway `/bkit-debug` run) were not done.

## #675 — Engine does tracker reads and writes; MCP becomes the fallback (closed)

### Problem

Every tracker action in a bkit workflow is an MCP call the orchestrating agent makes by hand. That causes three problems:

1. **Exact text goes through an agent that can change it.** bkit builds every `###### bkit:generated` comment exactly (`bkit steps finish --comment-body`, `bkit workflows fail`, `bkit issues comment`), then hands it to the agent to copy into an MCP call. Nothing checks the copy.
   - On app-gether-life #1502 — Trace link from web request into Inngest jobs — https://github.com/gether-life/app-gether-life/issues/1502, `/bkit-ship` Step 6 printed a comment carrying all of `ship-summary.md`. The agent posted a header and one paragraph instead, and did the same to the Failure Path comment. The owner caught it by reading the issue. The full versions were then posted as two more comments, so the thread carries both.
   - `.bkit/friction.jsonl` key `design-summary-comment-not-posted` (OPEN, v5.0.2) is the same failure in design Step 9: the comment was printed and never posted.
2. **The orchestrator carries data it only passes on.** Step 1 of every workflow reads the issue body and every comment into the orchestrator's context, only to write them to `issue-description.md` / `issue-comments.json` for `bkit issues text`. Label sets, board payloads and the final issue link go the same way. That's context paid for every turn of the run (see #663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663 on re-read cost), for data the orchestrator never reasons about.
3. **The workflow files are mostly tracker plumbing.** `.bkit/core/workflows/` carries 47 `<!-- bkit:tracker {github|linear|jira} start -->` blocks per tracker (141 in all), plus 113 `true` and 17 `false` blocks for "tracker wired or not". The 47 GitHub blocks:

<!-- prettier-ignore -->
| What they do | Count |
   | --- | --- |
   | Read the issue and its comments (`issue_read`) | 11 |
   | Write labels (`issue_write`), some with a board move | 11 |
   | Move the board item (`projects_write`) | 7 |
   | Format `{REF}` as `#N` | 9 |
   | Workflow header (Tracker and Comments lines) | 6 |
   | Related-issue scan (`search_issues`) | 3 |

Each one is an instruction a model has to follow correctly, on every host and every model tier.

The only safeguards today are instructions to the agent:

- the workflow wording ("Post the printed `comment` byte-for-byte; never shorten, reword, or rebuild it", `.bkit/wording.md` § `workflow-comments-*`)
- each gate's self-ticked `Issue comment attempted (Step N section)`

No hook matches the tracker tools (`.claude/settings.json` `PreToolUse` covers `Edit|Write|MultiEdit`, `Bash`, `Read|Bash` only).

### Outcome

**The engine does every tracker action. The orchestrator only touches tracker data it needs in its own context to make a decision, and then reads it from a file the engine wrote, not through MCP. Agent MCP calls are the fallback when the engine reports it couldn't do the action.**

<!-- prettier-ignore -->
| Action | Today | After |
| --- | --- | --- |
| Read issue body, comments, title, URL, labels, state | Orchestrator, MCP | Engine fetches and writes files: `issue-description.md`, `issue-comments.json`, the joined issue text, and the issue facts. Orchestrator reads a file only where it decides something from it (design's acceptance scenario, `bkit-design.md:295`; plan's inputs, `bkit-plan.md:177`). |
| Build `*-input-{RUN}.md` for subagents | Orchestrator writes it from what it read | Engine writes it |
| Blocked-by check (`bkit-build.md:207`) | Orchestrator parses `DESCRIPTION` | Engine reads the block and checks each listed issue's state |
| Post `###### bkit:generated` comments | Orchestrator copies `comment` into MCP | Engine posts what it built |
| Labels and state transitions | Engine computes (`bkit issues labels`), orchestrator writes | Engine computes and writes |
| Board moves (Projects v2) | Engine computes payload, orchestrator writes | Engine writes |
| Issue link in the final message | Orchestrator holds `TITLE` / `URL` | Engine prints it |
| `bkit-auto` phase routing reads | Orchestrator, MCP | Engine |
| Related-issue scan | Orchestrator, MCP semantic search | **Open question** (below) |

**Contract for every engine tracker action:**

- The engine reports the result in its output: e.g. `tracker: {done: true, url}` or `tracker: {done: false, reason}`, along with everything it prints today (`comment`, `labels`, `board`), so the fallback has what it needs.
- `done: true`: the orchestrator does nothing more.
- `done: false`: the orchestrator does that one action via the tracker MCP, as today.
- Tracker actions stay best-effort: a failure never stops the workflow.
- Issue-less runs and `tracker: none`: the engine skips and says so. The orchestrator needs no `ISSUE_ID` branching of its own.

**Where the engine gets what it needs:**

- **Tracker:** `readIssueTracker`, `.bkit/core/engine/commands/workflow/fids.ts`.
- **Issue ID:** read out of the FID by `issueIdOf(fid, tracker)` (`fids.ts:193`). Step 1's `fidProblem` (`fids.ts:72`) already guarantees the FID carries the run's issue, and issue-less FIDs give `null`.
- **FID:** commands that already take the status file get it from the path (`fidOfStatusFile`, `steps.ts:360`). `bkit issues comment` and the others need a `--fid`.
- **Shared function:** one function, "where does this run's tracker traffic go" (tracker, issue ID, owner/repo or Jira site). Every engine tracker action calls it. This is a function, not a separate script.
- **Session prompt:** the orchestrator still picks the issue number out of the prompt at Step 1 (`bkit-ship.md:110`), because the engine never sees the prompt.

**Credentials per tracker:**

<!-- prettier-ignore -->
| Tracker | Engine uses | Agent fallback uses |
| --- | --- | --- |
| github | `gh` / REST / GraphQL with `BKIT_GH_TOKEN` (same token the MCP server uses; the engine already calls `gh`, e.g. `.bkit/core/engine/commands/lib.ts`, `repo.ts`, `runtime.ts`) | `mcp__github__*` |
| linear | Linear GraphQL API with `BKIT_LINEAR_API_KEY` (a personal API key; `api.linear.app` already in `.bkit/core/engine/shared/egress.ts`) | `mcp__linear__*` |
| jira | Jira REST with new `BKIT_JIRA_API_KEY` (ordinary Atlassian API token) | `mcp__jira__*` with `BKIT_JIRA_API_MCP_KEY` |
| none | nothing | nothing |

**Jira secrets split.** Today Jira has one secret, `BKIT_JIRA_API_TOKEN`. It's the scoped "Atlassian MCP V2" token, and `.bkit/trackers.md` § jira step 2 records "Token works on MCP only; Jira REST API answers 401". It becomes two:

- `BKIT_JIRA_API_KEY`: REST token, used by the engine.
- `BKIT_JIRA_API_MCP_KEY`: the current MCP token, renamed and wired into the `jira` MCP server for the fallback.

The rename breaks existing Jira setups, so it ships with a migration in `docs/migrations.md`. It touches `.bkit/.env.example`, `.mcp.json` / `.cursor/mcp.json` rendering, `.bkit/trackers.md` § jira, the preflight and `bkit check` env checks, and the egress list.

**What's left in the workflow files:**

- Per-step tracker blocks go. A step runs its `bkit` command and acts only on `done: false`.
- The per-tracker text shrinks to one fallback section per workflow header: which MCP tool does which action. Today's **Tracker:** and **Comments:** lines become that section.
- Most `true` / `false` blocks go too, because skipping when there's no tracker or no issue moves into the engine.

### Success criteria

- No per-step `<!-- bkit:tracker {github|linear|jira} start -->` block is left in `.bkit/core/workflows/`; per-tracker text lives only in each workflow's fallback section.
- On a wired tracker with credentials set, a full run makes no tracker MCP call. The orchestrator reads issue text only from engine-written files, and only in steps that decide something from it.
- Every `###### bkit:generated` comment matches the engine's printed `comment` byte-for-byte. Re-running a block (the exit 5 / 6 re-ask path) never posts the same comment twice.
- When the engine can't do an action (no credential, network blocked, API error), its output says which action and why, and the workflow does that action via MCP.
- A Jira consumer who upgrades keeps working: the migration moves `BKIT_JIRA_API_TOKEN` to `BKIT_JIRA_API_MCP_KEY`, and `bkit check` names a missing `BKIT_JIRA_API_KEY` as an advisory, not an error.
- `.bkit/friction.jsonl` key `design-summary-comment-not-posted` closes against this change.

### Constraints and non-goals

- Same behaviour on every host (Claude, Cursor, Codex, OpenCode), since it's engine code.
- `.agents/rules.md` § Tracker MCPs reads "Issue reads / updates via configured MCP ONLY; use CLI / HTTP shell-outs as backup / fallback ONLY". This change inverts it: engine first, MCP fallback. That needs a `docs/decisions.jsonl` row and a rules update. The original reason for MCP-only isn't written down in `docs/`. The only stated reason found is keeping GitHub and Linear tool calls the same shape in the workflow files, which no longer applies once the workflows carry no per-step tracker calls.
- Engine reads of GitHub issue text get the raw markdown. The GitHub MCP strips HTML comments (`docs/decisions.jsonl` key `465-tracker-markers-are-h6-headings-not-html-comments`), so marker detection must keep working on both forms of the text, since the MCP fallback still returns the stripped one.
- Not in scope: PR creation and merge (`create_pull_request`, `bkit prs …`). That's repo plumbing, not tracker, and already partly engine.
- Can roll out in slices (comments first, since that's the incident; then reads; then labels, state and board), as long as each slice removes its blocks from the workflows.

### Decisions already made

- Engine does the action, reports back, and the orchestrator uses MCP only when it reports failure (owner, 2026-10-23).
- The orchestrator only holds tracker data it reasons over itself; data it would only pass to a file or a subagent goes engine to file directly (owner, 2026-10-23).
- Jira gets two secrets, `BKIT_JIRA_API_KEY` (engine) and `BKIT_JIRA_API_MCP_KEY` (agent fallback) (owner, 2026-10-23).
- Workflow wording already says to post the printed `comment` byte-for-byte (done 2026-10-23, uncommitted at time of writing).

### Open questions

- **Related-issue scan.** Design, plan and debug ask for "one natural-language sentence … never a keyword list" and send it to `mcp__github__search_issues`, which matches by meaning. The engine's `gh search issues` matches keywords. Options:
  - keep this one action on MCP, since the orchestrator writes the query anyway
  - accept keyword search
  - have the orchestrator write the sentence and the engine run a different search
- **Jira REST auth needs an email as well as the token** (HTTP Basic `email:token`). New `BKIT_JIRA_EMAIL`, a `package.json` `bkit.jira` field, or something else?
- **Double posts on re-run:** where is "already done for this step / attempt" recorded? The status row, the book dir, or a check on the tracker first?
- **Sandboxed shells:** some hosts block network from shell commands while allowing MCP calls (Codex in particular). Confirm per host; there the fallback becomes the normal path.
- **Cloud runs** (`bkit-cloud` via the Claude GitHub App): does `gh` on the runner have a token allowed to comment, label and move board items?
- **Jira's 32,767-character limit** (`.bkit/wording.md` § `workflow-comments-split-jira`): the engine should split at line breaks itself.
- **Projects v2 scope:** `BKIT_GH_TOKEN` must carry project write for the board moves. The MCP path uses the same token today, so confirm rather than assume.

### References

- #663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663 (parent; context re-read cost)
- app-gether-life #1502 — Trace link from web request into Inngest jobs — https://github.com/gether-life/app-gether-life/issues/1502 (incident: truncated Step 6 and Failure Path comments)
- `.bkit/friction.jsonl` key `design-summary-comment-not-posted`
- `docs/decisions.jsonl` key `465-tracker-markers-are-h6-headings-not-html-comments`
- `.agents/rules.md` § Tracker MCPs
- `.bkit/trackers.md` § jira, § Tracker Blocks call sites
- `.bkit/core/.bkit/workflows.md` § Tracker Integration
- `.bkit/wording.md` § `workflow-comments-github`, § `workflow-comments-linear`, § `workflow-comments-jira`, § `workflow-comments-split-jira`
- `.bkit/core/engine/commands/workflow/fids.ts` (`issueIdOf`, `fidProblem`, `readIssueTracker`)
- `.bkit/core/engine/commands/workflow/steps.ts` (`--comment-body`, `fidOfStatusFile`)
- `.bkit/core/engine/commands/workflow/workflows.ts` (failure and handover comments)
- `.bkit/core/engine/commands/workflow/issues.ts` (`bkit issues comment`, `text`, `labels`)
- `.bkit/core/engine/shared/egress.ts`
- `docs/migrations.md`

**Wording fix done ahead of this issue (uncommitted on `dev`).**

The workflow rule now says plainly that the printed comment goes out unchanged. Before, "never … paraphrase, summarise, truncate" only covered comments already on the issue.

- `.bkit/wording.md` clauses `workflow-comments-github`, `workflow-comments-linear`, `workflow-comments-jira`: added "Post the printed `comment` byte-for-byte; never shorten, reword, or rebuild it." The old text moved to each clause's `retired` block.
- `pnpm wording:sync` rewrote the 6 workflows in `.bkit/core/workflows/` (18 lines).
- Same rule added to the comment-posting paragraph of `.bkit/core/.bkit/workflows.md` § Tracker Integration and its copy `.bkit/workflows.md`.
- The 30 host copies (`.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`, `.agents/skills/`, `.agents/plugins/bkit/skills/`) were updated with the same line.

Checks: `bkit check` exit 0 with no drift; `.bkit/core/engine/tools/wording.test.ts` 59/59 pass; prettier clean on every touched file.

This is still only an instruction to the agent. The engine-side fix is this issue.

**Two pointers from the #663 review.**

- **No JSON-to-text converter is needed for trackers; this issue already does the job.** Once the engine fetches the issue and writes `issue-description.md` and the comments file itself, only a path and a size enter the orchestrator. Measured on #663's 23 comments: 128,860 characters as the MCP's JSON, 121,132 as plain text, about 6% envelope. The content is the cost, and only "do not load it" fixes that. The MCP fallback result cannot be intercepted by any engine tool. The wider question (engine verb replies, context-fetch log rows) is #681 "Engine output as text: terse verb replies, tabulated context fetches" (https://github.com/cbartens/bkit/issues/681), which lists this issue as a blocker because the output shape is shared.
- **Two gotchas for the open questions here.** First, on this machine the `gh` CLI's env token lacked project scope and board writes had to fall back to the keyring token; the engine path hits the same wall unless `BKIT_GH_TOKEN` carries `project` write, so "confirm rather than assume" should be a `bkit check` test, not a note. Second, the body says the orchestrator still picks the issue number out of the prompt, while #677 "Engine resolves Step 1: issue id, FID, plan inputs, resume point" (https://github.com/cbartens/bkit/issues/677) moves that into `fids parse --prompt-file`. Both hold given the prompt-file decision, but say so here, or a design agent reading this issue alone keeps the regex in the workflow.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 2.10 and 4.

### Implementation plan (2026-10-24)

**In short:** a new shared module, `.bkit/core/engine/commands/workflow/tracker.ts`, works out where a run's tracker traffic goes and holds one client per tracker. The verbs that already _build_ tracker payloads (`steps finish`, `issues comment|labels`, `workflows fail|handover|close`) gain `--post` and send the payload themselves. They print one extra field, `tracker`, which tells the orchestrator whether it still has anything to do. New read verbs (`issues fetch`, `workflows input`, `issues related`, `issues blocked-by`) write issue text straight to files, so the text never passes through the orchestrator. Per-step tracker blocks shrink to one fallback section per workflow header. The work ships in six slices, comments first because that is where the #1502-style incident happened.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 1 | Where the session prompt goes at Step 1 (shared with #677, #678) | A per-run **session folder** in the outbox (the uncommitted scratch folder inside `.git`): `{OUTBOX_ROOT}/sessions/<utc-time>-<random>/prompt.md`. `repo info` prints the path; the orchestrator writes the prompt there with its Write tool. The committed record stays `logs/{FID}/{workflow}-input-{RUN}.md`, now written by the engine at Step 2. Not `docs/plans/…/logs/`: the FID isn't known yet at Step 1, and in worktree mode that folder only exists inside the feature worktree, which is created after the FID. Not `tmp/`: each worktree has its own, and ship deletes its worktree at Step 14. |
| 5 | How a re-run avoids posting the same comment twice | New `engine-action` rows in `status.jsonl` (see below). They are committed and pushed with the branch, so a cloud run resuming in a fresh container still sees them. |
| 5b | Scope of that record | **Not tracker-only.** Every engine action that is unsafe to repeat records itself there and checks it first: tracker comments here; marker commits, CI dispatch re-triggers and PR opens in #679 and #678. Actions that are safe to repeat (setting a label that is already set) record nothing. |
| 6 | Related-issue scan | **The orchestrator searches, the engine fetches.** One flow for all three trackers: the orchestrator runs its tracker's search via MCP, asking only for number, title and state (the GitHub `search_issues` `fields` option keeps this to about ten short rows). It writes the hit ids to a file. `issues related --hits-file=` fetches each hit's body and comments and writes `related-issues.md`. Writing and running the search sentence is judgement, so it stays with the orchestrator; the expensive part (up to ten issues' full text) goes engine to file. |
| 7 | How the engine talks to Jira | **MCP over plain HTTP**, not the Jira REST API. The engine sends JSON-RPC to `https://mcp.atlassian.com/v2/mcp` (`initialize`, then `Mcp-Session-Id`, as #60's scripted test did, `.bkit/trackers.md:205`) with the scoped token as `Bearer`. One token, no email: REST would have needed a second token plus `BKIT_JIRA_EMAIL` for Basic auth through the `api.atlassian.com/ex/jira/<cloudId>` gateway. This **replaces the two-secret decision** in the body above. Comments go in as markdown (`.bkit/trackers.md:194`), so no conversion to Atlassian Document Format is needed. |
| 7b | Jira token name | **Rename `BKIT_JIRA_API_TOKEN` → `BKIT_JIRA_API_KEY`**, used by both the engine and the agent MCP fallback, matching `BKIT_LINEAR_API_KEY`. Ships with an idempotent migration that renames the key in `.bkit/.env`, plus a `docs/migrations.md` row. |
| 8 | Board moves on cloud runs | **Skipped on cloud.** `bkit-cloud.yml` runs the agent with `GH_TOKEN: ${{ github.token }}` (lines 183, 534, 580), which can comment and label but can never reach a Projects v2 board. The engine prints `board: skipped:cloud`, and the next local run catches the board up. No CI file change. |

Decided by me (say if you disagree):

- **How the fallback is signalled.** A verb whose main job succeeded (row written, comment built) keeps its exit code and prints `tracker: {done:false, action, reason}` with `reason` one of `network|auth|scope|rate-limit|not-found|http-<n>`. Exit 8 and `EXIT.NO` already mean something in `steps finish`, so overloading them would break its retry logic. Pure tracker verbs (`issues fetch`, `issues related`, `issues blocked-by`) exit 80 (`EXIT.USE_MCP`, `lib.ts:29`), since they have nothing else to report.
- **Codex.** Some hosts block network from shell commands while allowing MCP. The engine does not try to change sandbox settings: a failed connect maps to `reason: network` and the workflow falls back to MCP. Letting the Codex render allow network for tracker hosts changes the security posture, so I'd suggest it as a separate issue.
- **#676 item 16** (the final message) is done here in full, as the #676 grouping says: `workflows close --final-return` prints the issue link, `## Suggested Replies` and `## bkit Tips`.

#### What is already true in the code

- **Comments are built by the engine and posted by MCP.** `buildComment` (`issues.ts:473`) builds step, failure, handover and audit bodies. `steps finish` builds the comment after `writeStepRow` (`steps.ts:865-913`) and prints it (`:917-927`). `workflows fail` prints `add, labels, trackerState, comment` (`workflows.ts:1519-1524`), `handover` prints `comment` (`:1568`), `close` prints `report, comment` (`:1655-1660`). The engine posts nothing.
- **Labels and board moves are computed and never written.** `transitionLabels` (`issues.ts:186`), `trackerState` (`:218`) and `boardPayload` (`:249-292`) build MCP payloads; `labelsVerb` (`:294`) prints them.
- **Parsing exists, fetching does not.** `parseComments` (`:75`) and `issueText` / `textVerb` (`:121`, `:131`) render text from files the orchestrator wrote by hand.
- **Target resolution is half there.** `readIssueTracker` (`fids.ts:167`) and `issueIdOf(fid, tracker)` (`fids.ts:193`) exist. `repo info` already prints `outboxRoot` (`repo.ts:184`) and `trackerScope` (`:188`).
- **The plumbing supports it.** Verbs may be async (`lib.ts:97`, awaited at `:281-327`). `ghUnavailable` (`lib.ts:450`) already classifies a missing `gh`, exit 4 and HTTP 403. The engine runs on Node 24 with built-in `fetch`; there is no HTTP dependency and none is needed.
- **Re-run risk is real.** In `steps finish`, a malformed verdict header exits 4, 5 or 6 _before_ the row is written, so re-asks are safe today. But exit 8 (commit failed, `:928`) and the `EXIT.NO` gate failure both come _after_ the comment is printed, and the orchestrator re-runs the step after either. So an engine-side post must check the `engine-action` record first.
- **Block counts check out** (47 groups each for github, linear and jira). One row in the body is wrong: "Format `{REF}` as `#N`: 9" is really 1 `{REF}` group (`bkit-auto.md:110`), 5 prompt issue-id extraction groups (build:189, debug:114, design:104, plan:104, ship:109), 1 FID-format group (debug:164) and 2 close-review state groups (build:925, plan:562). The issue-id groups go away in #677.
- **The friction row moved.** `design-summary-comment-not-posted` is no longer in `.bkit/friction.jsonl`; commit a290911a (#683) moved it to the gitignored `harvest/friction.jsonl`. Closing it takes a new same-key `CLOSED` row.
- **Text that states the old rule** and must change with this work: the `issues.ts` header (`:1-7`) and summary (`:594`); `.bkit/core/.bkit/workflows.md:431` ("the command never touches the tracker") and `:167`; `.bkit/core/.agents/rules.md:84` (Tracker MCPs) and `.bkit/instructions.md`; wording clauses `workflow-gh-fallback`, `workflow-labels-transition`, `workflow-issue-read-*`; decision `465-tracker-markers-are-h6-headings-not-html-comments` (`docs/decisions.jsonl:417`), whose MCP-read sentence goes while its marker rule stays.

#### The `engine-action` record

- Row: `{type: "engine-action", action, key, hash, ref, at}`. `key` = workflow, run, step, sub-plan, attempt and kind. `hash` = sha256 of the body or payload. `ref` = the comment URL, commit SHA or run id.
- Before acting, the engine looks for the same key and hash: found → skip and print `deduped: true`. Same key with a changed body → act again (a deliberate edit).
- In `steps finish` the order is: post, append the row, commit. A failed commit leaves the row on disk, so the re-run skips the post.
- **Two gaps, accepted:**
  - A failure before `status.jsonl` exists (before Step 2) has nowhere to record. Those comments are one-shot.
  - The final close comment is built after the run's `status.jsonl` has landed on `dev`, so recording it would cost an extra `dev` commit. For that one comment, the engine instead checks the issue's last 5 comments for an identical body; all three trackers can list comments.
- Every `status.jsonl` reader (compliance grading, run facts, counters, `ledgers/status.ts` fold) must ignore the new type. Tests cover each. `.bkit/jsonl.md` documents the row.
- One shared helper (`recordAction` / `alreadyDone` in `tracker.ts` or `ledgers/status.ts`), so #678 and #679 reuse it rather than writing their own.

#### Slices

Each slice is one change on `dev`: tests first and red, then engine code to green, then prose, then `pnpm wording:sync`, then `bkit install` once at the end to refresh the mirrors.

**Slice 1: tracker module, comment posting, Jira key rename, rule inversion**

- Engine:
  - New `tracker.ts`:
    - `trackerTarget(cwd, {fid?, issue?})` combines tracker, issue id, owner/repo, `bkit.jira.site` and `bkit.linear.team`.
    - Clients: GitHub through the existing `runGh` (`lib.ts:434`); Linear GraphQL through `fetch` with `BKIT_LINEAR_API_KEY`; Jira MCP-over-HTTP through `fetch` with `BKIT_JIRA_API_KEY`, using the tool names `.bkit/trackers.md` § jira already lists.
    - `postComment`, `splitAt(body, 32767)` (Jira splits at line breaks and labels the parts "part i/n"; this replaces the prose clause `workflow-comments-split-jira`), and `classifyFailure`.
    - The `engine-action` helper.
  - `--post` on `steps finish`, `issues comment`, `workflows fail`, `workflows handover` and `workflows close`. Each prints `tracker` next to `comment`. Issue-less runs and `tracker: none` print `tracker: {skipped: "no-issue" | "tracker-none"}`.
  - The engine never prints a token. Error classification never echoes request headers, and a redaction test asserts it.
- Tests first:
  - `tracker.test.ts`: `gh` stubbed on PATH (the `issues.test.ts` pattern); `vi.stubGlobal("fetch")` for Linear and Jira; Jira `initialize` → session id → `tools/call`; split boundaries at 32,767; classification of 401/403/404/429/ENOTFOUND.
  - `steps.test.ts`: exit 8 after a post, then a re-run, prints `deduped: true` and calls the client once. A changed body posts again.
  - `workflows.test.ts`: the `tracker` field on `fail`/`handover`/`close`, plus the two skip cases.
  - Status readers ignore `engine-action` rows.
- Jira rename: `BKIT_JIRA_API_TOKEN` → `BKIT_JIRA_API_KEY` in `checks/before/env.ts:15-26` (`TRACKER_TOKENS`), the `.mcp.json` and `.cursor/mcp.json` renders, `install/modules/opencode.ts`, both `.env.example` copies, `.bkit/trackers.md` § jira step 2 (also drop "Jira REST API answers 401", which no longer matters) and the tests that name it. Migration: idempotent rename in `.bkit/.env` on install and upgrade, tested on the old shape (precedent: `migrateLinearTeamKey` in `core.integration.test.ts`), plus a `docs/migrations.md` row.
- Prose: every "post `comment` via MCP" step in the six workflows and `bkit-audit-generate.md:133-139` becomes `--post` plus one shared wording clause: "**If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section." Per-tracker comment blocks whose bodies are now identical collapse to one block.
- Docs: `.bkit/core/.bkit/workflows.md` § Comment Lifecycle (`:429-507`), § Tracker Writes Are Best-Effort (`:509-519`) and the noun table (`:1382-1404`), with the copy `.bkit/workflows.md`; `.bkit/trackers.md` interaction catalog; `.bkit/jsonl.md` (the new row); `CHANGELOG.md`.
- Ledger rows, each via `bkit ledgers append`:
  - decision `675-engine-owns-tracker-io-mcp-fallback`, with the reason the old MCP-only rule existed (keeping GitHub and Linear tool calls the same shape in the workflows), which no longer applies
  - a same-key row superseding `465-…` that keeps the marker rule and drops the MCP-read sentence
  - decision `675-jira-engine-via-mcp-http`, which records why the REST/two-token plan was dropped
  - the friction row `design-summary-comment-not-posted` as `CLOSED`
- Rules: invert Tracker MCPs in `.bkit/core/.agents/rules.md:84` and `.bkit/instructions.md` to "Tracker reads and writes via `bkit` verbs; MCP only when a verb prints `tracker.done: false` or exits 80." Turn the MCP-fallback rule (at most one transition per run, recorded as `transport-fallback`) around the same way.
- Done when: a live `/bkit-design` on a throwaway cbartens/bkit issue posts its step comments with no MCP call, and a forced exit-8 re-run posts nothing new.

**Slice 2: prompt file and reads**

- Engine:
  - `repo info` prints `sessionDir` (unique per call; the engine never writes the prompt into it). `workflows close` and `workflows fail` delete it when passed `--session-dir`; `repo info` prunes session folders older than 7 days.
  - `issues fetch --fid|--issue --session-dir|--outbox` writes `issue-description.md` (raw markdown, so marker detection must accept both raw and MCP-stripped text), `issue-comments.json` (oldest first, through `sortOldestFirst`) and `issue-facts.json` (`title, url, state, labels`). It prints `{title, url, state, labels, files}`, never the body. #677's `fids resolve --title-file` reads `issue-facts.json`.
  - `workflows input --workflow --run --prompt-file --description-file --comments-file [--design=] [--audit=…]` writes `logs/{FID}/{workflow}-input-{RUN}.md` and prints only `{path, bytes}`. For plan it appends the parent design and audit reports (#676 item 1).
  - `issues related --hits-file= [--top=10]` fetches each hit's body and comments, writes `{OUTBOX}/related-issues.md` with the existing `## #{number} — {title} ({state})` headings, and prints `{path, bytes, hits}` (#676 item 2).
- Tests first: fetch output per tracker; exit 80 on network failure; input assembly order and byte count; the plan append; `sessionDir` uniqueness and pruning; related-issue file layout.
- Prose:
  - Step 1 gains "write the session prompt verbatim to `{SESSION_DIR}/prompt.md`".
  - The 5 issue-read groups become one block (`issues fetch`, MCP `issue_read` under fallback).
  - The input-file sites (build:360, design:258, plan:271, ship:270) become `workflows input`; design's grill-decisions append (`:311`) stays.
  - The 3 related-scan groups become one block: MCP search with minimal fields, write the hits file, then `issues related`.
- Done when: design, plan and build make no `issue_read` call on a wired GitHub repo, and the input file matches the old layout.

**Slice 3: labels, state and board**

- Engine: `issues labels --write`.
  - GitHub: `gh api` label POST/DELETE, plus GraphQL `addProjectV2ItemById` / `updateProjectV2ItemFieldValue` built from the existing `boardPayload`.
  - Linear: `issueUpdate` (label ids, state by name).
  - Jira: through MCP, read then edit the full label set (`editJiraIssue` replaces the whole set) and fire the transition whose `to.name` matches.
  - On cloud runtimes the board prints `skipped:cloud`.
  - `workflows fail --post` writes its labels too; the merged and review states use the same writer.
- Tests first: request shapes per tracker; a board 403 is classified as `scope`; Jira keeps labels that aren't bkit's; cloud skips the board.
- Prose: the 5 Failure Path, 5 Step 1 phase, 7 board, 2 close-review and 1 merged groups collapse; the `workflow-labels*` and `workflow-board-*` clauses become "engine writes; MCP when `done: false`".

**Slice 4: `ref`, label re-reads, blocked-by, final return**

- Engine:
  - `runs context` prints `ref` (GitHub `#N`; Linear and Jira keys uppercased) and `labels`.
  - `issues blocked-by --fid|--issue` reads the `###### bkit:blocked-by` block on GitHub, or native relations on Linear and Jira (`Blocks` links), and prints `{blockers: [{id, state}], open: n}` (#676 item 8).
  - `workflows close --final-return` prints `finalReturn` (#676 item 16).
- Prose: `bkit-auto.md:110` and the 5 close-time label re-read groups go; build's blocked-by parse (`:222`) goes; the `{REF}` derivation clause retires.

**Slice 5: checks and egress**

- `mcp.atlassian.com` and `api.github.com` checked or added in `shared/egress.ts`.
- After-check `github-project-token-scope` in `checks/after/github.ts`, next to `buildGithubProjectAdvisory` (`:181-223`), only when `bkit.github.project` is set and not on cloud. Classic token: `X-OAuth-Scopes` from `gh api -i user` must include `project`. Fine-grained token: a GraphQL `projectV2(number:)` query on the configured owner must return the board. The advisory text names the fix inline. This turns "confirm rather than assume" into a test, as the #663 review asked.
- Tests: `github.test.ts` (scope header present or absent; GraphQL null), the egress table test.

**Slice 6: sweep**

- Remove the remaining per-tracker groups. After #677 removes the issue-id groups, per tracker only the header fallback section is left.
- Rewrite the § Tracker Blocks rationale (`:120-178`), § Tracker Integration (`:1112-1159`), the **Tracker** / **Labels** / **Comments** header rows (`:245`), the commands contract (`:1352-1366`) and best-effort runs (`:1429-1434`).
- `docs/security.md` (the engine now holds tracker tokens in-process), `docs/setup.md`, `CHANGELOG.md`.
- Re-run `block-locality-audit.test.ts`, `render/trackers.test.ts`, `workflow-shape.test.ts` and `wording.test.ts` with the new counts.

#### How this fits with #677 and #678

- #677 — Engine resolves Step 1: issue id, FID, plan inputs, resume point — https://github.com/cbartens/bkit/issues/677 reads `{SESSION_DIR}/prompt.md` (`fids parse --prompt-file`) and `issue-facts.json` (`fids resolve --title-file`).
- The body above says "the orchestrator still picks the issue number out of the prompt at Step 1". That holds only until #677 lands; afterwards `fids parse` does it from the same file. The file and path don't change between the two, so the slices of both issues can land in either order.
- #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678 reads the same prompt file in `status route --workflow=debug --prompt-file`.
- Whichever lands first adds `sessionDir` to `repo info`.

#### Verification

- Every slice: full `pnpm vitest run` (unit and integration), `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Dogfood: `pnpm build`, then in a scratch consumer under `tmp/` wired to GitHub, run `node dist/cli.js repo info`, write the prompt, then `issues fetch`, `workflows input`, `steps finish --post`, `issues labels --write`, `workflows close --post --final-return`. Repeat with the token unset to check that `tracker.done: false` and exit 80 appear.
- Live:
  - GitHub: a throwaway cbartens/bkit issue through `/bkit-design`, then check comments, label and board move exactly once, including after a forced exit-8 re-run.
  - Jira: the test site from #60 — Jira test-site setup — https://github.com/cbartens/bkit/issues/60.
  - Linear: unit tests with stubbed `fetch`, plus a live run if a Linear sandbox is available.

#### Risks

- **Rovo tool names can change.** The engine and the fallback depend on the same names, so a change breaks both at once and the engine reports `done: false` with `http-<n>` or `not-found`. A contract test pins the names `.bkit/trackers.md` lists.
- **Latency for consumers without credentials.** Each write makes one failed engine attempt, then the MCP fallback. It works, and the scope and env advisories name the cause.
- **Uncommitted work by other agents** in `checks/after/github.ts`, `worktrees.ts` and `workflows.md`. Rebase onto it before slices 1, 5 and 6.
- **Ordering with #681** (text output): land slices 1 and 2 before #681 changes the print format.

No open questions remain for this issue.

**Implemented: all six slices** of the plan above, in commit `ac2d73c4` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed.

Checks run:

- typecheck, lint, format and prose checks pass.
- Integration tests: 1553 of 1553 pass.
- Unit tests: 5624 passed. The 2 that fail also fail on `dev` without this change; they are wording-file gaps from bd5f6988.
- `bkit check`: clean.

Left open:

- **Live tracker runs were not done.** The plan's checks on a throwaway issue (GitHub, Jira test site) are still to do.
- **The friction row `design-summary-comment-not-posted` is not closed yet.**

Changes from the plan:

- `issues related` takes `--out`.
- `issues labels --write` reads the current labels itself.
- Close-time label re-reads use `issues fetch --outbox`.
- Debug also uses `workflows input`.
- The `AGENTS.md` cloud-run label read (Step 4) still goes through the MCP.
