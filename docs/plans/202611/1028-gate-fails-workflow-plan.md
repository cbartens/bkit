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
| Take over raise at a terminal shows the old and new ceilings and writes only after the typed confirmation from TASK 8 | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 9 |
| a changed workflow or prompt file runs the text ceiling test | Unit | `scripts/gate/bkit-gate-changed.test.mjs` | 10 |
| raise from a non-interactive caller refuses and leaves the record unchanged | Unit | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | 11 |

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

- [x] **TASK 8:** An agent told to turn a red unit gate green runs the `raise` command that the failure text prints, or edits the record by hand, and the owner-only ceiling rises with no owner involved
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

- [x] **TASK 9:** Take over `raise without a reason refuses and leaves the record unchanged` from TASK 2
  - **DONE WHEN:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` fails until the change that contradicts it exists: callRaise no longer swallows errors, so the refusal call must be wrapped in expect(...).rejects.toThrow(/reason/); the old form would throw out of the test
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise at a terminal shows the old and new ceilings and writes only after the typed confirmation` fails until the change that contradicts it exists: callRaise no longer swallows errors, so the declining call must be wrapped in expect(...).rejects.toThrow(/cancelled|confirmation/) and the record must still be byte-identical afterwards; the old form would throw out of the test

<!-- bkit:task 9 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 1 findings

<!-- bkit:task 10 start -->

- [x] **TASK 10:** A build or debug run that edits only workflow or prompt text never runs the ceiling test in its own gates, because `bkit:gate:changed` picks only test files that name a changed path or its basename and `agent-text-ceiling.test.ts` names none, so the group and holistic gates pass and the ceiling first fails at the ship push or in CI
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `scripts/gate/bkit-gate-changed.mjs:43` · **Round:** 1
  - **DONE WHEN:** The existing `named` stage of `scripts/gate/bkit-gate-changed.mjs` also runs `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` (with Vitest, like every other named test) when a changed path starts with `.bkit/core/workflows/` or `.bkit/core/prompts/`, or is `scripts/gate/bkit-text-ceiling.json`. No new stage, no new script and no other change to that gate. The script's header comment says so on its `named` line, the `Changed files` bullet of `docs/testing.md` says so where it lists the `named` stage, and the `Text ceiling` bullet of `docs/testing.md` names the changed-file gate among the gates that run the ceiling test. Removes: nothing; it adds one rule to an existing stage.
  - **TEST FIRST:**
    - `scripts/gate/bkit-gate-changed.test.mjs` `a changed workflow or prompt file runs the text ceiling test` fails on `bkit-gate-changed.mjs` given a changed file under `.bkit/core/workflows/` or `.bkit/core/prompts/`, whose `named` stage runs no `agent-text-ceiling.test.ts`, because `git grep` over the test files finds neither the path nor its basename in that test

<!-- bkit:task 10 end -->
<!-- bkit:task 11 start -->

- [x] **TASK 11:** The non-interactive `raise` test pipes `yes\n`, a word the prompt never accepts, so it stays green with the terminal check deleted, and `printf 'RAISE\n' | pnpm bkit:text:ceiling raise --reason x` from an agent's shell would then rewrite the record with no test failing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:185` · **Round:** 1
  - **DONE WHEN:** Every variant in `raise from a non-interactive caller refuses and leaves the record unchanged` pipes `RAISE\n`, the word `typedConfirm` accepts, and asserts the `runs only at a terminal` refusal line, so the test fails against a copy of `scripts/gate/bkit-text-ceiling.mjs` whose `isTTY` refusal at line 225 is removed.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise from a non-interactive caller refuses and leaves the record unchanged` fails on a script copy with the `isTTY` refusal removed, where piped `RAISE\n` exits 0 and rewrites the record; today the test passes on that copy because `yes\n` ends in `raise cancelled` and exit 1

<!-- bkit:task 11 end -->
<!-- bkit:group 4 end -->
