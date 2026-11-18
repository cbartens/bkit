# Brief: group 4 — Challenge round 1 findings

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
- Group 3: Planned tests the build took over — done
  - TASK 9: Take over `raise without a reason refuses and leaves the record unchanged` from TASK 2 — done
- Group 4: Challenge round 1 findings — this group
  - TASK 10: A build or debug run that edits only workflow or prompt text never runs the ceiling test in its own gates, because `bkit:gate:changed` picks only test files that name a changed path or its basename and `agent-text-ceiling.test.ts` names none, so the group and holistic gates pass and the ceiling first fails at the ship push or in CI — open
  - TASK 11: The non-interactive `raise` test pipes `yes\n`, a word the prompt never accepts, so it stays green with the terminal check deleted, and `printf 'RAISE\n' | pnpm bkit:text:ceiling raise --reason x` from an agent's shell would then rewrite the record with no test failing — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A build or debug run that edits only workflow or prompt text never runs the ceiling test in its own gates, because `bkit:gate:changed` picks only test files that name a changed path or its basename and `agent-text-ceiling.test.ts` names none, so the group and holistic gates pass and the ceiling first fails at the ship push or in CI
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `scripts/gate/bkit-gate-changed.mjs:43` · **Round:** 1
  - **DONE WHEN:** The existing `named` stage of `scripts/gate/bkit-gate-changed.mjs` also runs `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` (with Vitest, like every other named test) when a changed path starts with `.bkit/core/workflows/` or `.bkit/core/prompts/`, or is `scripts/gate/bkit-text-ceiling.json`. No new stage, no new script and no other change to that gate. The script's header comment says so on its `named` line, the `Changed files` bullet of `docs/testing.md` says so where it lists the `named` stage, and the `Text ceiling` bullet of `docs/testing.md` names the changed-file gate among the gates that run the ceiling test. Removes: nothing; it adds one rule to an existing stage.
  - **TEST FIRST:**
    - `scripts/gate/bkit-gate-changed.test.mjs` `a changed workflow or prompt file runs the text ceiling test` fails on `bkit-gate-changed.mjs` given a changed file under `.bkit/core/workflows/` or `.bkit/core/prompts/`, whose `named` stage runs no `agent-text-ceiling.test.ts`, because `git grep` over the test files finds neither the path nor its basename in that test

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** The non-interactive `raise` test pipes `yes\n`, a word the prompt never accepts, so it stays green with the terminal check deleted, and `printf 'RAISE\n' | pnpm bkit:text:ceiling raise --reason x` from an agent's shell would then rewrite the record with no test failing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:185` · **Round:** 1
  - **DONE WHEN:** Every variant in `raise from a non-interactive caller refuses and leaves the record unchanged` pipes `RAISE\n`, the word `typedConfirm` accepts, and asserts the `runs only at a terminal` refusal line, so the test fails against a copy of `scripts/gate/bkit-text-ceiling.mjs` whose `isTTY` refusal at line 225 is removed.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise from a non-interactive caller refuses and leaves the record unchanged` fails on a script copy with the `isTTY` refusal removed, where piped `RAISE\n` exits 0 and rewrites the record; today the test passes on that copy because `yes\n` ends in `raise cancelled` and exit 1

<!-- bkit:task 11 end -->
