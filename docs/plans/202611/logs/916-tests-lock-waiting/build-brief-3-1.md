# Brief: group 3 — A human-approved jump to the front of the tests line

Plan: Machine Lock Waiters Served in Arrival Order Implementation Plan

## Why and what

### Context & Goals

The machine lock (`.bkit/templates/scripts/ci/bkit-machine-lock.sh`, adopted byte-identical as `scripts/ci/bkit-machine-lock.sh`) has no wait list. Each waiting run's Perl helper retries a non-blocking `flock` every 0.1 s (`scripts/ci/bkit-machine-lock.sh:234-252`), so whichever helper retries first after a release wins. How long a run has waited counts for nothing, and a session that just released the lock and asks again is as likely to win as a run that has waited 50 minutes. One `bkit tests run` gate waited 51 minutes while three later arrivals took the lock ahead of it, and would have given up (exit 75) at its 3600 s limit without running.

Goals:

- Add a ticket queue beside each lock file, so the Perl helper's acquire loop admits waiters in the order they started waiting. The queue lives in the one acquire loop every lock shares, so the `tests` lock, other named locks and the unnamed stack lock all gain it.
- Make a ticket disappear, or be skipped, when its waiter gives up, its caller dies or its helper is killed, so a dead ticket never blocks the line.
- Keep a run's place in line when it gives up and the same run asks again within 120 s, so the exit-81 short-call loop of `bkit tests run`, `bkit tests changed` and `bkit branches push` (`.bkit/providers.md` § Long-running shell commands) does not send a 60 s host to the end of the line on every re-run (decision `916-queue-keeps-place-across-give-up`).
- Make the `⏳ waiting` note say where the run is in line.
- Replace consumers' adopted copies of `scripts/ci/bkit-machine-lock.sh` that are byte-identical to a shipped release without the queue with the new template, through an upgrade migration (decision `916-stale-lock-copy-upgrade-report-note`).
- Add `bkit tests jump <run>`, which moves one waiting run to the front of the `tests` line. It never takes the lock from the current holder, and every use needs the human's approval through the host's ask permission, so an agent cannot approve its own jump (decision `916-priority-jump-human-approved`).
- Keep every existing contract: exit codes 2 / 73 / 75, the give-up line `bkit tests run` parses (`testsLockHolder` in `.bkit/core/engine/commands/lib.ts`), lock file paths, owner variables, the `BKIT_TEST_SLOTS` slots, nested reuse, the `CI` no-op and mutual exclusion with copies that predate the queue.

This plan covers issue #916, plus the priority jump the owner folded into it while answering the plan's questions (no workstreams, no parent design, no audit). It reads no superseded plan, because none exists at `docs/plans/202611/916-tests-lock-waiting-plan.md`.

**Related Issues:**

- #916 — Tests lock: waiting runs win at random, so one can wait out its limit (OPEN)
- #724 — Machine-wide test lock: one test run at a time across agents (CLOSED)
- #822 — Route raw test-runner commands through the tests lock per host (OPEN)

---

### Narrative

Runs get the lock in the order they started waiting.

### Success Criteria

- A run waiting with a long enough limit always gets its turn once the runs ahead of it finish.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Wait estimate in the waiting note, summed from `<name>.last` | The issue says the note "can" estimate the wait; no `Derived Test Matrix` row needs it, and the owner's answer to the waiting-note question (decision `916-waiting-note-place-only-no-estimate`) declares it out, because `.last` keeps one held time per checkout, not per gate. | `docs/deferrals.jsonl` key `916-lock-wait-estimate-from-last`; a later issue once `.last` records held time per gate. |

## Where it fits

- Group 1: Arrival-ordered queue in the lock template — done
  - TASK 1: Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it — done
  - TASK 2: Clean up dead tickets and refuse with the queue path when the queue cannot be used — done
  - TASK 3: Keep `try` behind the line, ignore stray files, and name the place in line in the waiting note — done
  - TASK 4: Keep a run's place in line across a give-up and re-ask — done
  - TASK 5: Document the queue in the lock docs and re-render the mirrors — done
- Group 2: Upgrade migration replaces unedited adopted lock copies — done
  - TASK 6: Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade — done
- Group 3: A human-approved jump to the front of the tests line — this group
  - TASK 7: Sort a jumped run first in the Perl helper's scan — open
  - TASK 8: Add `bkit tests jump <run>`, which writes the jump marker for one waiting run — open
  - TASK 9: Make every `bkit tests jump` wait for the human's approval on all five hosts — open
  - TASK 10: Document the jump and its approval, and re-render the mirrors — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Sort a jumped run first in the Perl helper's scan
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the scan lists `^\d+\.jump$` markers and reads their lines; a live ticket whose line equals a marker's line sorts before every unmarked ticket, newest marker first; the scan deletes a marker whose line matches no live ticket and no held place; the helper deletes the markers matching its own line when it takes the lock
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: header comment (lines 22-36) names jump markers
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: copied from the template byte for byte
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the four tests below in the `machine lock waiting order` block, and the marker-planting helper
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** the four tests below pass; the whole of `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `scripts/ci/bkit-test-awake.test.mjs`, `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jump marker moves its waiting run to the front of the line` fails on the marked fourth waiter running after the three waiters ahead of it
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the newest jump marker goes first` fails on the run with the older marker running before the run with the newer one
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jump marker that matches no waiting run is deleted` fails on the marker file still existing after the waiters' next scan
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jumped run that gives up and asks again within 120 s keeps the front` fails on the re-asking jumped run running after an unmarked waiter

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Add `bkit tests jump <run>`, which writes the jump marker for one waiting run
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: a `jump` verb (`use: "by-hand"`, positional `run`, optional `--checkout`) that reads the `tests` queue folder without creating it, finds the distinct `<who> — <checkout>` lines of tickets and held places carrying the run name, and on exactly one match writes `<Date.now()>.jump` with that line through a temp file plus rename and exits 0; on no match or no folder it prints "no run named <run> waits for tests" and exits 1; on several matches it lists them, prints "pass --checkout <path> to pick one" and exits 1; it never touches the lock, `.holder` or slot files
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the three tests below
  - **UPDATE:** `.bkit/cli.md`: regenerated by `pnpm cli:sync`
  - **READ:** `VerbSpec` in `.bkit/core/engine/commands/lib.ts`: the verb shape, `use` and output keys
  - **READ:** `FlagSpec` in `.bkit/core/engine/commands/lib.ts`: the `positional` flag that takes the bare `run` argument
  - **READ:** `EXIT` in `.bkit/core/engine/commands/lib.ts`: exit 0 moved, 1 refused, 2 usage
  - **READ:** `testsChangedVerb` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: a sibling `bkit tests` verb
  - **DEPENDS ON:** 7
  - **DONE WHEN:** the three tests below pass; the whole of `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests.test.ts` and `.bkit/core/engine/tools/cli-doc.test.ts` pass; `.bkit/cli.md` lists `bkit tests jump`; `pnpm build` has refreshed `dist/` and `dist/` is staged with the change; `node dist/cli.js tests jump --help` prints a summary that says each use needs the human's approval
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump moves a waiting run to the front of the tests line` fails on the jumped waiter running after the waiters ahead of it, or before the holder's command finished
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name no waiting run carries` fails on the verb not printing "no run named" and exiting 1 with no marker in `tests.queue`
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name two waiting runs share` fails on the verb not listing both checkouts with "pass --checkout" and exiting 1 with no marker in `tests.queue`

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Make every `bkit tests jump` wait for the human's approval on all five hosts
  - **UPDATE:** `.bkit/shared/.claude/settings.json`: `permissions.ask` gains `Bash(*bkit tests jump*)`, `Bash(*cli.js tests jump*)` and `Bash(*cli.ts tests jump*)`
  - **UPDATE:** `.bkit/shared/.opencode/opencode.json`: `permission.bash` gains the same three globs as `ask`, after every broader `allow` glob
  - **UPDATE:** `ASK_PATTERNS` in `.bkit/core/hooks/guardrails-tiers.js`: `{ re: /\b(?:bkit|cli\.[jt]s)\s+tests\s+jump\b/, what: "bkit tests jump" }`, so Cursor and Antigravity ask
  - **UPDATE:** `classifyShell` in `.bkit/core/hooks/guardrails-tiers.js`: under the Codex hook, the jump returns `{ tier: "deny", what, fix }` with a fix that tells the agent to ask the human to run it in their own terminal (Open Question 11, option A); the host check stays inside the managed block, and the drivers stay unchanged
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: the two tests below in `permissions-parity`, and the header comment's list of Codex's structural exceptions
  - **READ:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: how the Codex driver maps `deny` and `ask`
  - **READ:** `.bkit/core/.bkit/providers.md`: § Codex CLI, why Codex cannot ask
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the two tests below pass; the whole of `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/install/modules/opencode.integration.test.ts`, `.bkit/core/engine/install/modules/antigravity.test.ts` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; every existing `SHELL_GATES` row keeps its verdict on all five hosts
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `bkit tests jump asks the human on claude, opencode, cursor and antigravity and is denied on codex` fails on a host returning allow for `bkit tests jump build-1`
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `path-prefixed bkit tests jump forms get the same verdicts on every host` fails on a host returning allow for `"/repo/node_modules/.bin/bkit" tests jump build-1`, `pnpm bkit tests jump build-1`, `node dist/cli.js tests jump build-1` or `pnpm tsx .bkit/core/engine/cli.ts tests jump build-1`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Document the jump and its approval, and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock names `bkit tests jump <run>`, that the holder keeps the lock, that the newest jump goes first, that each use needs the human's approval (denied on Codex), and that the upgrade migration replaces an unedited 6.1.x copy
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Permissions' `ask` row lists the three `tests jump` patterns
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Codex CLI's "Codex cannot prompt" note says `bkit tests jump` is denied on Codex instead of advised
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Tests lock gains one bullet saying the human can move a waiting gate to the front with `bkit tests jump <run>`, and every use needs their approval
  - **DEPENDS ON:** 5, 6, 9
  - **DONE WHEN:** `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/templates.md`, `.bkit/workflows.md`, `.bkit/providers.md`, the managed block of `docs/testing.md`, `.claude/settings.json`, `.opencode/opencode.json`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`; `diff <(sed -n '/^## Machine lock/,/^## /p' .bkit/core/.bkit/templates.md) <(sed -n '/^## Machine lock/,/^## /p' .bkit/templates.md)` prints nothing, and the same holds for § Permissions in `.bkit/core/.bkit/workflows.md` against `.bkit/workflows.md`, § Codex CLI in `.bkit/core/.bkit/providers.md` against `.bkit/providers.md` and § Tests lock in `.bkit/shared/docs/testing.md` against `docs/testing.md`; `grep -c "tests jump" .claude/settings.json` prints 3; after `pnpm build`, `node dist/cli.js check` reports no drift
  - **TEST FIRST:** n/a — docs and re-rendered mirrors only, no behaviour change

<!-- bkit:task 10 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it — `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`, `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`
- TASK 2 (group 1, done): Clean up dead tickets and refuse with the queue path when the queue cannot be used — `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`
- TASK 3 (group 1, done): Keep `try` behind the line, ignore stray files, and name the place in line in the waiting note — `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`
- TASK 4 (group 1, done): Keep a run's place in line across a give-up and re-ask — `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`
- TASK 5 (group 1, done): Document the queue in the lock docs and re-render the mirrors — `.bkit/core/.bkit/templates.md`, `.bkit/shared/docs/testing.md`, `.bkit/core/.bkit/providers.md`, `docs/testing.md`
- TASK 6 (group 2, done): Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade — `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `docs/migrations.md`

Reuse Inventory rows left out: 11; Architecture entries left out: 14 — read them in docs/plans/202611/916-tests-lock-waiting-plan.md § Reuse Inventory and § Architecture & Component Changes.
