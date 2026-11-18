# Brief: group 3 — Planned tests the build took over (tests)

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

- Group 1: The ceiling check, the two commands and the record — done
  - TASK 1: Write the script's `check` command and the test file for it — done
  - TASK 2: Add the `lower` and `raise` commands — done
  - TASK 3: Record bkit's own ceilings, wire the script line and check the real folders — done
  - TASK 4: Document the guard in the testing and architecture docs — done
- Group 2: Challenge round 1 findings — done
  - TASK 5: Two branches that each change a folder's word total conflict on the record's `ceiling` line, and `check`, `lower` and `raise` all crash on the conflict markers, so a resumed build or debug rebase fails to a handover and ship needs a hand-picked ceiling (a second owner raise when both sides were raised) — accepted by owner — done
  - TASK 6: A moved, renamed or emptied text folder counts as 0 words; `check` tells the agent to run `lower`, and `lower` (no reason needed) writes a `0` ceiling, so the guard passes from then on and never counts the folder's new home — done
  - TASK 7: An agent runs `lower` while another agent's prompt edit sits uncommitted in the same working tree; the record bakes that edit in, the agent commits only its own files, and the committed tree then fails `check` as above the ceiling with an empty growth list and an owner-only raise as the only named fix — accepted by owner — done
  - TASK 8: An agent told to turn a red unit gate green runs the `raise` command that the failure text prints, or edits the record by hand, and the owner-only ceiling rises with no owner involved — done
- Group 3: Planned tests the build took over — this group
  - TASK 9: Take over `raise without a reason refuses and leaves the record unchanged` from TASK 2 — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Take over `raise without a reason refuses and leaves the record unchanged` from TASK 2
  - **DONE WHEN:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` fails until the change that contradicts it exists: callRaise no longer swallows errors, so the refusal call must be wrapped in expect(...).rejects.toThrow(/reason/); the old form would throw out of the test

<!-- bkit:task 9 end -->

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

### Planned tests that already exist

- TASK 9 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged` — exists at `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:143`; update that test in place: add expectations, never remove or loosen one
