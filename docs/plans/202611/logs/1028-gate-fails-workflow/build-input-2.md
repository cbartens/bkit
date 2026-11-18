## Session Prompt — this run's, newer than everything below

#1028 publish=false

## Issue description — oldest

From [#1012 — Project Goals audit: where bkit falls short, and what to change](https://github.com/cbartens/bkit/issues/1012). Small, and independent of that audit's order of work. It is most useful when it lands before the v6.3 work that moves workflow text into engine commands.

### Problem

Nothing fails when the text agents read gets longer.

- v6.3 exists to simplify: sentences in workflows and prompts are replaced by `bkit <noun> <verb>` commands and by checks.
- The usual way that goes wrong: a change adds the command and leaves the old sentences in place, or adds a new mechanism beside the old ones. The engine grows and the text does not shrink.
- Today only a person reading the diff would notice. The `Fewer tokens` goal in `.agents/rules.md` § Project Goals is a sentence, and `Checks over instructions` says a requirement that matters needs a gate that fails.

Size on `dev` at `a6c2a8efe`, measured 2026-11-17 with `cat <files> | wc -lw`:

<!-- prettier-ignore -->
| What | Files | Lines | Words |
| --- | --- | --- | --- |
| `.bkit/core/workflows/*.md` | 6 | 4,832 | 58,307 |
| `.bkit/core/prompts/*.md` | 40 | 5,445 | 86,494 |

### Outcome

A change that makes the workflows or the prompts longer than the recorded size fails the local gate and CI. When the growth is genuinely needed, one deliberate step accepts it, and the new size becomes the record that later changes are measured against.

### Success criteria

- A committed record holds one ceiling for the workflow sources and one for the prompt sources.
- A test fails when either total is above its ceiling, and its message names the total, the ceiling, the files that grew the most and the command that accepts the growth.
- The test passes when a total is below its ceiling, so two builds that both shorten text never collide on the record.
- One command accepts genuine growth: it rewrites the record to the current totals and stores a reason with it. The command refuses to run without a reason.
- After that command, the new totals are the ceilings. The record change sits in the same commit as the text that needed it, so a reviewer sees the growth and the reason together.
- The check runs in `pnpm bkit:gate:static-unit-integration`.

### Constraints and non-goals

- This guards bkit's own sources. It lives with the repo-only tests in `.bkit/core/engine/audits/repo/` (beside `rules-sync.test.ts`) and ships nothing to a consumer.
- Engine code size is not gated. Engine code may grow where it replaces text or an older mechanism.
- The ceiling is a limit, not an exact value. An exact value would force an edit to the record on every prompt change and make parallel builds conflict in one file.
- The override is never automatic. No workflow step, hook or agent runs it to get a gate green; an agent that needs it stops and asks the owner.
- Shortening the workflows or prompts is not this issue.
- The size limit for always-read docs is [#1023 — Docs index: stop marking workflows.md and prompts.md always-read](https://github.com/cbartens/bkit/issues/1023), not this issue.

### Decisions already made

- The owner asked on 2026-11-17 that v6.3 ends with less workflow and prompt text than it started with, and confirmed this issue.
- The owner asked on 2026-11-17 for an override: when text genuinely has to grow, the growth can be accepted and the new count becomes the baseline.

### Open questions

- Count words, bytes or lines? Words track tokens more closely than lines; bytes are the simplest to compute.
- One ceiling per directory, or also one per file, so a single workflow cannot double while the others shrink?
- Which other agent-read text counts: the `bkit:start` / `bkit:end` block of `.bkit/core/.agents/rules.md`, and the installed `.bkit/workflows.md` and `.bkit/prompts.md`?
- Who lowers a ceiling after text shrinks, and when: the change that shrinks it, or one step at the end of a release?
- Where does the override reason live: in the record file next to the ceiling, or as a row in `docs/decisions.jsonl`?

### References

- [#1021 — Prompts: hand out rule bullets by job, shorten the checked ones](https://github.com/cbartens/bkit/issues/1021)
- [#750 — Workflow optimisation](https://github.com/cbartens/bkit/issues/750)
- `.agents/rules.md` § Project Goals

## Issue comment — posted 2026-11-17T11:36:38.000Z

Owner decisions for this issue, 2026-11-17 (v6.3 run):

- The gate holds one word ceiling per folder: one for `.bkit/core/workflows/` and one for `.bkit/core/prompts/`. There is no ceiling per file.
- A change that makes the text shorter lowers the ceiling in the same change, so the saving cannot be spent by the next change. The record file is regenerated when a change lands, never merged by hand.
- The override is run by the owner only. A build that needs it stops and reports the numbers and the reason.

Settled without asking: the gate counts workflow and prompt words only, the two word counts tracked on [#1012 — Project Goals audit: where bkit falls short, and what to change](https://github.com/cbartens/bkit/issues/1012).

## Issue comment — posted 2026-11-17T11:40:33.000Z

Build notes (v6.3 run, 2026-11-17). These follow from the owner decisions in the comment above; where they differ from the issue body, these win.

- **Unit:** words, as in the issue's own table.
- **Record:** two ceilings only, one for `.bkit/core/workflows/*.md` and one for `.bkit/core/prompts/*.md`, each with the reason of its last raise.
- **Too high:** a total above its ceiling fails the test. The message names the total, the ceiling, the files that grew most and the accept command.
- **Too low:** a total below its ceiling also fails the test, and the message names a lower command. This replaces the issue's "passes when below" criterion, because the owner decided that the change which shortens the text lowers the ceiling; a check enforces that, a sentence would not.
- **Two commands, one script:** lowering the record to the current totals needs no reason and refuses when a total is above its ceiling. Raising it (the accept command) refuses without a reason and is run by the owner only; no workflow, prompt or agent step calls it.
- **Tests:** one case each for above, equal, below, accept without a reason, lower when above.
- **Done when:** the six success criteria hold with the "too low" change above, and `pnpm bkit:gate:static-unit` runs the new test.
- **Removes:** nothing. It adds a repo-only guard (a test, a record, a script, one `package.json` line) and no text an agent reads.

## Issue comment — posted 2026-11-17T20:26:53.000Z

Answers to the build review's four findings (v6.3 run, 2026-11-18). The two "accepted" answers are assumptions made by the run's orchestrator while the owner was away, not owner answers. The owner can overturn them before the 6.3.0 release.

- **Fixed in this build:** a missing or empty text folder no longer counts as 0 words that `lower` can write as the ceiling; a record that is not valid JSON gives an error that names the record file and says what to do.
- **Accepted, moved to a follow-up issue:** two branches that both change a folder's word total conflict on the `ceiling` line of `scripts/gate/bkit-text-ceiling.json`. Until there is a merge rule, the conflict is settled by hand: take either side, then run `pnpm bkit:text:ceiling lower`.
- **Accepted, same follow-up issue:** `lower` counts the working tree, so another agent's uncommitted edit in a shared checkout can make the committed tree fail `check`. Builds run in their own worktrees, so this shows up only in the main checkout.

Decision row: `1028-word-ceiling-record-conflicts-are-settled-by-hand` in `docs/decisions.jsonl`.

## Issue comment — posted 2026-11-17T20:33:51.000Z

One more answer for this build (v6.3 run, 2026-11-18). It is an assumption made by the run's orchestrator, not an owner answer. The owner can overturn it before the 6.3.0 release.

The second review found that nothing stopped an agent from running the owner-only `pnpm bkit:text:ceiling raise`: the failing check printed the exact command, and it ran from a non-interactive shell.

- **Fixed in this build:** `raise` writes only at a real terminal, after a typed confirmation. No flag or environment variable skips that. The failing check no longer prints a ready-to-paste `raise` command.
- **Also fixed in this build:** a record that is not valid JSON gives one line that names `scripts/gate/bkit-text-ceiling.json` and says what to do.
- **Not built here, goes to a follow-up issue:** deny rules for the command on the four hosts, a check for owner-signed commits, and a guard against hand-editing the record.

Decision row: `1028-word-ceiling-raise-runs-only-at-a-terminal` in `docs/decisions.jsonl`.

## Plan — docs/plans/202611/1028-gate-fails-workflow-plan.md — last committed 2026-11-17T21:00:38.000Z

# Gate fails when workflow or prompt text grows Implementation Plan

## Context & Goals

Nothing fails today when the text agents read gets longer. This plan adds a repo-only guard for #1028 (from #1012): a committed record holds one word ceiling for `.bkit/core/workflows/*.md` and one for `.bkit/core/prompts/*.md`, and a test fails when either total is above its ceiling (the change grew the text) or below it (the change shortened the text and must lower the ceiling in the same change). Two commands rewrite the record: `lower` (no reason, refuses when a total is above its ceiling) and `raise` (needs a reason, owner only, no workflow, prompt or agent step calls it). The guard ships nothing to a consumer and adds no text an agent reads.

Owner decisions that bind this plan (issue comments of 2026-11-17): unit is words; one ceiling per folder, none per file; the record holds each ceiling with the reason of its last raise; the raise command is run by the owner only.

**Related Issues:**

- #1028 — Gate fails when workflow or prompt text grows (this plan)
- #1012 — Project Goals audit: where bkit falls short, and what to change (source)
- #1023 — Docs index: stop marking workflows.md and prompts.md always-read (separate size limit, not this plan)

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — the repo tree lists `scripts/gate/` | `docs/architecture.md` line 90 (repo tree, `scripts/gate/`) | covered | None. Task 4 adds the new script to that line. |
| technology | `docs/technology.md` | no — no framework, library or convention change; plain Node and Vitest as in the existing repo-only scripts | none | none | None. |
| security | `docs/security.md` | no — no route, secret, user input or PII; the script reads repo files and writes one JSON record | none | none | None. |
| testing | `docs/testing.md` | yes — a new repo-only test file and a gate behaviour | `docs/testing.md` § Key test files, and the `bkit:gate:*` notes near line 572 | covered | None. Task 4 adds the test row and the gate note. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| observability | `docs/observability.md` | no — no logging or telemetry | none | none | None. |
| deployments | `docs/deployments.md` | no — no CI or release change; CI already runs the unit tier through `pnpm bkit:gate:static-unit` | `.agents/docs.md` index, `package.json` `bkit:gate:*` scripts | covered | None. |
| noise, setup | `docs/noise.md`, `docs/setup.md` | no — untouched | none | none | None. |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Count words in the two text folders, compare to ceilings, name growth, rewrite the record | `scripts/gate/bkit-text-ceiling.mjs` | `rg -l -i` for ceiling, word count, wordcount and `wc -w` over `*.{ts,mjs,json,sh}`; `rg -n` for token budget, size budget and baseline under `scripts/` and `.bkit/core/engine/`; read `scripts/gate/bkit-gate-changed.mjs` and `scripts/ci/` | `.bkit/core/engine/commands/workflow/context.ts` — a line and byte cap on log reads, not a total over source folders; `scripts/gate/bkit-gate-changed.mjs` — runs checks on changed files, holds no size record | NEW | (a) the searches find no candidate that counts words in a folder or keeps a ceiling record. Lives in `scripts/gate/` beside `bkit-gate-changed.mjs`, repo-only, never in dist, `.bkit/core`, `.bkit/shared` or `.bkit/templates`. |
| The ceiling record: two ceilings, each with its last raise reason | `scripts/gate/bkit-text-ceiling.json` | same searches as above; `scripts/ci/bkit-accepted-advisories.json` read as the closest record-with-a-reason pattern | `scripts/ci/bkit-accepted-advisories.json` — a list of accepted advisories with expiry, a different shape and a different reader | NEW | (a) no existing record holds a size ceiling. Kept beside the script so the repo-only guard sits in one folder. |
| The gate test: above, equal, below, accept without a reason, lower when above, git growth naming, real-repo check | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | `ls .bkit/core/engine/audits/repo/`; read `rules-sync.test.ts` and `package-json.test.ts` for the repo-only test shape; `rg -n 'audits/repo' vitest.config.ts docs/testing.md` | `.bkit/core/engine/audits/repo/rules-sync.test.ts` — asserts managed-block equality, a different subject; `package-json.test.ts` — manifest fields only | NEW | (a) no repo test counts the text folders. Lives with the repo-only tests as the issue requires; `vitest.config.ts` already includes `.bkit/core/engine/**/*.test.ts`, so `pnpm test:coverage:unit` in `pnpm bkit:gate:static-unit` runs it. |
| The `package.json` script that runs it | `package.json` | read the `bkit:gate:*` and `bkit:test:*` scripts; branding rule in `.agents/rules.md` § Naming Conventions | `package.json` `bkit:gate:changed` — a script line for another repo-only script | EXTEND | One new `bkit:text:ceiling` line: `node scripts/gate/bkit-text-ceiling.mjs`, with `lower` / `raise` as arguments. Named `bkit:` per the Branding rule. |
| Manifest pin for the new script line | `.bkit/core/engine/audits/repo/package-json.test.ts` | read the file | `package-json.test.ts` — already pins the `bkit:gate:changed` line | EXTEND | Add one case that pins `bkit:text:ceiling`. |
| Testing docs row and gate note | `docs/testing.md` | `rg -n` for bkit-gate-changed and test-file-script in `docs/testing.md` | `docs/testing.md` § Key test files — holds a row per repo-only test | EXTEND | Add one row and one gate note. |
| Repo tree line | `docs/architecture.md` | `rg -n 'bkit-gate-changed' docs/architecture.md` | `docs/architecture.md` line 90 — lists `scripts/gate/` | EXTEND | Name the new script and record on that line. |

## Supersession Inventory

None

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| check fails when the workflow or prompt total is above its ceiling, and the message names the total, the ceiling, the files that grew most and the raise command | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 1 |
| check passes when a total equals its ceiling | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 1 |
| check fails when a total is below its ceiling, and the message names the lower command | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 1 |
| the growth list names the files that grew since the record's last commit and leaves out unchanged files | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 1 |
| raise without a reason refuses and leaves the record unchanged | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 2 |
| raise with a reason rewrites both ceilings to the current totals and stores the reason on the folder that grew | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 2 |
| lower rewrites both ceilings to the current totals and keeps each folder's reason | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 2 |
| lower refuses when a total is above its ceiling and leaves the record unchanged | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 2 |
| bkit's own workflow and prompt folders sit exactly at the ceilings in the committed record | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 3 |
| the `bkit:text:ceiling` script runs `scripts/gate/bkit-text-ceiling.mjs` | Unit | `.bkit/core/engine/audits/repo/package-json.test.ts` | 3 |
| merging two branches that each lowered the prompts ceiling leaves a record that check passes | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 5 |
| check fails and lower refuses when a text folder is missing or empty | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 6 |
| check, lower and raise each fail with one line naming the record when it is not valid JSON | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 6 |
| lower with an unstaged edit in another prompt file never leaves a record the committed tree fails | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 7 |
| raise from a non-interactive caller refuses and leaves the record unchanged | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 8 |
| raise at a terminal shows the old and new ceilings and writes only after the typed confirmation | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 8 |
| raise with a reason rewrites both ceilings and stores the reason on the folder that grew, through the raise function with a confirming stub | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 8 |
| raise without a reason refuses and leaves the record unchanged, through the raise function with a confirming stub | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 8 |
| check's above-ceiling message names the words over, the grown files and that only the owner raises it at a terminal, with no ready-to-paste raise line | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 8 |
| Take over raise without a reason refuses and leaves the record unchanged from TASK 2 | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 9 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: The ceiling check, the two commands and the record

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Write the script's `check` command and the test file for it
  - **CREATE:** `scripts/gate/bkit-text-ceiling.mjs`: counts words (whitespace-split, the same total as `wc -w`) in `*.md` directly under `.bkit/core/workflows/` and `.bkit/core/prompts/` of `--root` (default: the repo root), reads the record at `--record` (default `scripts/gate/bkit-text-ceiling.json` under the root), and `check` exits 1 when either total is above or below its ceiling and 0 when equal; the above message names the total, the ceiling, the five files that grew most and `pnpm bkit:text:ceiling raise --reason "<why>"` marked owner-only; the below message names `pnpm bkit:text:ceiling lower`; growth is measured against each file at the last commit that touched the record (`git log -1 -- {record}` then `git show {sha}:{file}`), falling back to the five largest files when the record has no commit
  - **CREATE:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`: runs the script with `spawnSync("node", ...)` against fixture folders under `os.tmpdir()` (a real process, no mocks), with a fixture git repo for the growth case
  - **READ:** `.bkit/core/engine/audits/repo/rules-sync.test.ts`: the repo-only test shape and import style
  - **READ:** `scripts/gate/bkit-gate-changed.mjs`: the repo-only script header and `ROOT` convention
  - **DONE WHEN:** `node scripts/gate/bkit-text-ceiling.mjs check --root {fixture} --record {fixture record}` exits 1 above and below the ceiling, exits 0 at the ceiling, and its messages hold the total, the ceiling, the grown files and the command; the four tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `fails above the ceiling and names total, ceiling, grown files and the raise command` fails on a total above its ceiling exiting 0 with no message
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `passes when a total equals its ceiling` fails on an equal total exiting non-zero because the script is missing
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `fails below the ceiling and names the lower command` fails on a total below its ceiling exiting 0 with no message
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `names only the files that grew since the record's last commit` fails on the growth list holding every file or none

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Add the `lower` and `raise` commands
  - **UPDATE:** `scripts/gate/bkit-text-ceiling.mjs`: `lower` rewrites both ceilings to the current totals and keeps each reason, and refuses (exit 1, record untouched) when a total is above its ceiling; `raise --reason "<text>"` refuses (exit 1, record untouched) without a non-empty reason, otherwise rewrites both ceilings to the current totals and stores the reason on every folder whose ceiling changed; the record is written as stable, sorted JSON so a regenerated file is a small diff
  - **UPDATE:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`: the four tests below
  - **DEPENDS ON:** 1
  - **DONE WHEN:** after `raise --reason` on a grown fixture, `check` exits 0; after `lower` on a shrunk fixture, `check` exits 0; `raise` without a reason and `lower` on a grown fixture each exit 1 and leave the record byte-identical; the four tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` fails on `raise` exiting 0 or rewriting the record
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise with a reason rewrites both ceilings and stores the reason on the folder that grew` fails on a ceiling staying at its old value or the reason missing
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower rewrites both ceilings and keeps each reason` fails on a ceiling staying above the current total or a reason being dropped
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower refuses when a total is above its ceiling` fails on `lower` accepting growth without a reason

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Record bkit's own ceilings, wire the script line and check the real folders
  - **CREATE:** `scripts/gate/bkit-text-ceiling.json`: written by `node scripts/gate/bkit-text-ceiling.mjs raise --reason "initial baseline for #1028"` run once against the real repo, never by hand
  - **UPDATE:** `package.json`: one new script `bkit:text:ceiling` = `node scripts/gate/bkit-text-ceiling.mjs`, so `pnpm bkit:text:ceiling lower` and `pnpm bkit:text:ceiling raise --reason "..."` work
  - **UPDATE:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`: one case that runs `check` with the defaults against the real repo
  - **UPDATE:** `.bkit/core/engine/audits/repo/package-json.test.ts`: one case that pins the `bkit:text:ceiling` line
  - **READ:** `.agents/rules.md`: § Naming Conventions `Branding`, the `bkit:` script prefix
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `scripts/gate/bkit-text-ceiling.json` holds a `workflows` and a `prompts` ceiling with a reason each; `pnpm bkit:text:ceiling check` exits 0; the `package.json` line exists; `pnpm bkit:gate:static-unit` runs `agent-text-ceiling.test.ts` through `test:coverage:unit` and both new cases pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `bkit's own workflow and prompt folders sit exactly at the committed ceilings` fails on the record file being missing so `check` exits 1
    - `.bkit/core/engine/audits/repo/package-json.test.ts` `bkit:text:ceiling runs scripts/gate/bkit-text-ceiling.mjs` fails on the script being absent from `package.json`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Document the guard in the testing and architecture docs
  - **UPDATE:** `docs/testing.md`: a § Key test files row for `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` (tier Unit: above, equal, below, `raise` without a reason, `lower` when above, growth naming, the real folders), and a note beside the `bkit:gate:*` notes (near line 572) that the unit tier fails when workflow or prompt words differ from the record, that `lower` has no reason, and that `raise --reason` is run by the owner only and is never called by a workflow, hook or agent
  - **UPDATE:** `docs/architecture.md`: line 90 (`scripts/gate/`) names `bkit-text-ceiling.mjs` and its record
  - **READ:** `docs/testing.md`: the existing row format and the gate-note wording
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `docs/testing.md` holds the row and the note, `docs/architecture.md` line 90 names the script, and `pnpm format:check` passes on both files
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Two branches that each change a folder's word total conflict on the record's `ceiling` line, and `check`, `lower` and `raise` all crash on the conflict markers, so a resumed build or debug rebase fails to a handover and ship needs a hand-picked ceiling (a second owner raise when both sides were raised) — accepted by owner
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `scripts/gate/bkit-text-ceiling.json:3` · **Round:** 1
  - **DONE WHEN:** The owner decides how a ceiling conflict resolves (for example a merge driver or a `REGISTERS` entry in `.bkit/core/engine/commands/workflow/branches.ts` that sets each ceiling to base plus both sides' changes and keeps both reasons, or a rule that every conflict is a fresh owner raise); no agent can settle it because the choice decides whether a merge may carry an owner-approved raise forward without a second approval. Once decided, merging two branches that each changed a folder total settles the record without the `.rebase-failed` sentinel or `@bkit-ship-conflict-resolve`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `merging two branches that each lowered the prompts ceiling leaves a record that check passes` fails on `git merge` stopping with a conflict in `scripts/gate/bkit-text-ceiling.json` and `check` dying with `SyntaxError` on the conflict markers

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** A moved, renamed or emptied text folder counts as 0 words; `check` tells the agent to run `lower`, and `lower` (no reason needed) writes a `0` ceiling, so the guard passes from then on and never counts the folder's new home
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-text-ceiling.mjs:34` · **Round:** 1
  - **DONE WHEN:** `check` exits 1 naming the folder when `.bkit/core/workflows/` or `.bkit/core/prompts/` is missing or holds no `*.md` file, and `lower` and `raise` refuse in that case and leave the record byte-identical; when the record is not valid JSON (for example a merge conflict's markers), `check`, `lower` and `raise` each exit non-zero with one line, and no stack trace, that names `scripts/gate/bkit-text-ceiling.json`, says it is not valid JSON, and says to take either side of the conflict and run `pnpm bkit:text:ceiling lower`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `check fails and lower refuses when a text folder is missing or empty` fails on `lower` exiting 0 and writing `"ceiling": 0` for the missing folder
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `check, lower and raise each fail with one line naming the record when it is not valid JSON` fails on a raw `SyntaxError` stack trace that names no record file and no next step

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** An agent runs `lower` while another agent's prompt edit sits uncommitted in the same working tree; the record bakes that edit in, the agent commits only its own files, and the committed tree then fails `check` as above the ceiling with an empty growth list and an owner-only raise as the only named fix — accepted by owner
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `scripts/gate/bkit-text-ceiling.mjs:83` · **Round:** 1
  - **DONE WHEN:** The owner decides which text `lower` and `raise` count (working tree, staged index or `HEAD`) and whether they refuse while a counted file holds unstaged changes; no agent can settle it because it changes the plan's working-tree contract, which `check` shares in the pre-push unit tier. Once decided, a record `lower` writes never fails `check` on the tree that commits it.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower with an unstaged edit in another prompt file never leaves a record the committed tree fails` fails on `lower` exiting 0 and `check` on the committed tree exiting 1 with "above the ceiling"

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [ ] **TASK 8:** An agent told to turn a red unit gate green runs the `raise` command that the failure text prints, or edits the record by hand, and the owner-only ceiling rises with no owner involved
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `scripts/gate/bkit-text-ceiling.mjs:153` · **Round:** 1
  - **DONE WHEN:** In `scripts/gate/bkit-text-ceiling.mjs`, `raise` refuses, writes nothing and exits non-zero unless both stdin and stdout are a TTY; at a terminal it shows each folder's old and new ceiling and writes the record only after the person types the confirmation it asks for; no flag and no environment variable skips the terminal check. The write path is an exported function that takes the confirmation as a callback, and the CLI runs only when the file is the entry script, so tests call the function with a stub confirmation instead of any bypass switch. The record and folder checks of Task 6 still run before the terminal check, so their messages are unchanged. `check`'s above-ceiling message no longer prints a ready-to-paste `raise --reason "<why>"` line: it says the ceiling was passed, by how many words, which files grew, and that only the owner raises it, at a terminal, with `pnpm bkit:text:ceiling raise --reason`. The `docs/testing.md` § Text ceiling bullet and the `agent-text-ceiling.test.ts` row of its key test files table describe the terminal confirmation. Out of scope: deny rules on the hosts, signed-commit checks and any guard against hand edits of `scripts/gate/bkit-text-ceiling.json`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise from a non-interactive caller refuses and leaves the record unchanged` fails on `raise --reason "x"`, spawned through `spawnSync` with piped stdio as an agent's shell tool runs it, plain and again with `--yes`, `--force` and `CI=1` added, exiting 0 or rewriting the record
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise at a terminal shows the old and new ceilings and writes only after the typed confirmation` fails on the script exporting no raise function, or the function writing the record when the stub confirmation declines
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise with a reason rewrites both ceilings and stores the reason on the folder that grew` fails on the script exporting no raise function to call with a confirming stub
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` fails on the script exporting no raise function to call with a confirming stub and an empty reason
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `fails above the ceiling and names total, ceiling, grown files and the raise command` fails on the message still holding the ready-to-paste `raise --reason "<why>"` line, or missing the words over the ceiling and that only the owner raises it at a terminal

<!-- bkit:task 8 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Planned tests the build took over

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Take over `raise without a reason refuses and leaves the record unchanged` from TASK 2
  - **DONE WHEN:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` fails until the change that contradicts it exists: callRaise no longer swallows errors, so the refusal call must be wrapped in expect(...).rejects.toThrow(/reason/); the old form would throw out of the test

<!-- bkit:task 9 end -->

<!-- bkit:group 3 end -->
