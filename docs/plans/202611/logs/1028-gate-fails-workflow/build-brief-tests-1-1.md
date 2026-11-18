# Brief: group 1 — The ceiling check, the two commands and the record (tests)

Plan: Gate fails when workflow or prompt text grows Implementation Plan

## Why and what

### Context & Goals

Nothing fails today when the text agents read gets longer. This plan adds a repo-only guard for #1028 (from #1012): a committed record holds one word ceiling for `.bkit/core/workflows/*.md` and one for `.bkit/core/prompts/*.md`, and a test fails when either total is above its ceiling (the change grew the text) or below it (the change shortened the text and must lower the ceiling in the same change). Two commands rewrite the record: `lower` (no reason, refuses when a total is above its ceiling) and `raise` (needs a reason, owner only, no workflow, prompt or agent step calls it). The guard ships nothing to a consumer and adds no text an agent reads.

Owner decisions that bind this plan (issue comments of 2026-11-17): unit is words; one ceiling per folder, none per file; the record holds each ceiling with the reason of its last raise; the raise command is run by the owner only.

**Related Issues:**

- #1028 — Gate fails when workflow or prompt text grows (this plan)
- #1012 — Project Goals audit: where bkit falls short, and what to change (source)
- #1023 — Docs index: stop marking workflows.md and prompts.md always-read (separate size limit, not this plan)

## Where it fits

- Group 1: The ceiling check, the two commands and the record — this group
  - TASK 1: Write the script's `check` command and the test file for it — open
  - TASK 2: Add the `lower` and `raise` commands — open
  - TASK 3: Record bkit's own ceilings, wire the script line and check the real folders — open
  - TASK 4: Document the guard in the testing and architecture docs — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Write the script's `check` command and the test file for it
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

- [ ] **TASK 2:** Add the `lower` and `raise` commands
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

- [ ] **TASK 3:** Record bkit's own ceilings, wire the script line and check the real folders
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

### Derived Test Matrix rows

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
