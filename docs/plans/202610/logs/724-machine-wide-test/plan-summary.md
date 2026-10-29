Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- plan-apply-review CONCERNS
- 4 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/plan-v1-draft.md`, `docs/plans/202610/logs/724-machine-wide-test/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/related-deferrals.md`, `docs/plans/202610/logs/724-machine-wide-test/related-failures.md`, `docs/plans/202610/logs/724-machine-wide-test/related-issues.md` |
| plan-review | CONCERNS | 18 | 1 | `docs/plans/202610/logs/724-machine-wide-test/plan-review-1.md`, `docs/plans/202610/logs/724-machine-wide-test/plan-review-2.md`, `docs/plans/202610/logs/724-machine-wide-test/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/plan-v2-reviewed.md`, `docs/plans/202610/logs/724-machine-wide-test/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

When several agents run test suites at the same time on one laptop, the machine grinds to a halt. This change adds a machine-wide **tests lock**: a full test gate takes it before it starts; a second gate waits its turn and says who it is waiting for (that waiting line is the "another agent is already running tests" warning).

### Success Criteria

- Two full test gates started at once on one machine (same repo, two worktrees, or two different repos) never run at the same time; the second waits and prints the first one's holder line.
- `bkit tests run` that cannot get the lock within `--lock-wait-s` exits 81 with the holder printed, never a hang past the agent's tool timeout.
- `bkit tests red` / `green`, `bkit:test:file` and the gate's own child processes never wait on the tests lock.
- `CI=true` / `CI=1`: no lock is taken anywhere.
- A consumer's existing copy of the stack lock and the new template still exclude each other on the unnamed stack lock (same lock file path, same function and env names).

### Process Sketch

- **WHEN** an agent's `bkit tests run` starts while no gate holds the `tests` lock **→ THEN** it takes the lock, exports `BKIT_TEST_WORKERS`, runs the gate, frees the lock on exit.
- **WHEN** a second full gate (any repo, any worktree) starts while the first holds it **→ THEN** it waits and prints the first one's holder line; it starts once the holder ends.
- **IF** the lock stays held past `--lock-wait-s` **→ THEN** `bkit tests run` exits 81 naming the holder; the workflow ends its turn and re-runs the block.
- **IF** the run is light (`tests red` / `green`, one existing test file), nested under a holder, in watch mode, or `CI` is set **→ THEN** no lock is taken and nothing waits.
- **IF** the holder is killed **→ THEN** the lock frees within a second and the waiter starts.
- **IF** the lock dir cannot be written **→ THEN** the gate refuses with the path and reason, exit 4, no test verdict.
- **WHEN** a push or a shipped subagent prompt runs the full gate **→ THEN** it goes through `bkit tests run` and queues on the `tests` lock the same way.

### Concrete Example

**Setup:** Agent A runs `/bkit-build` for FID `724-x` in worktree `bkit/.worktrees/724-x`; agent B runs `/bkit-debug` in a consumer checkout on the same 10-core laptop. Default `BKIT_TEST_SLOTS` (1).

**Steps:**

1. Agent B's Step 3 block runs `bkit tests run --gate=bkit:gate:static-unit-integration …` → engine takes the `tests` lock (`~/.cache/bkit/machine-lock/tests.lock`), exports `BKIT_TEST_WORKERS=10`, runs the gate.
2. Agent A's group-gate block runs `bkit tests run …` 20 s later → engine waits; the log gets `[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 724-x build-group-gate-1 is waiting for the tests lock: in use by bkit tests run … — /path/to/consumer (pid 4242, since 10:31:07)`.
3. 60 s pass with B's gate still running → A's call exits 81, printing B's holder line and `lockHolder` → A ends its turn and re-runs the block.
4. B's gate finishes → lock frees → A's re-run takes the lock and runs its gate.
5. Meanwhile A's TASK runner runs `bkit tests red --file=…` → runs at once; no lock line in its output.

**Outcome:** the two gates never overlap; A's log and its 81 hand-back both name B's run; A's single-file red never waited.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Holder process killed mid-gate | Lock frees within a second (perl holder sees its parent change); the waiter starts |
| `BKIT_TEST_SLOTS=2`, three gates start | Two run, each with `BKIT_TEST_WORKERS` = cores / 2; the third waits naming both holders |
| `BKIT_TEST_SLOTS` not a whole number >= 1 | Falls back to 1 and says so once on stderr |
| Gate run inside `bkit tests run` reaches vitest's global setup | Sees `LOCAL_STACK_LOCK_OWNER_tests` alive, does not wait on its own parent |
| `vitest run integration.test` (a filter, not a file path) | Heavy run: takes the tests lock |
| `vitest run path/to/one.test.ts` (every filter is an existing file) | Light run: no lock |
| Run needs tests lock and the stack lock | Takes tests first, then stack; never the reverse |
| Consumer still on the old copy, bkit upgraded | Old copy keeps working; its unnamed stack lock and the new script's share one lock file |
| Lock dir `~/.cache/bkit/machine-lock/` not writable | Gate refuses with the path and the reason; exit 4 (could not run), not a test failure |
| Plan-added: a process already holding the stack lock or another named lock asks for the `tests` lock | Refused at once, naming the lock order; `run` exits 73; nothing waits |
| Plan-added: `--lock-wait-s` not a whole number >= 0 | Usage error, exit 2; no gate runs |
| Plan-added: `--lock-wait-s=0` | One try: held → exit 81 naming the holder at once |
| Plan-added: the gate itself exits 75 (no lock give-up line in the log) | Read as the gate's exit: verdict FAIL, exit 1, never 81 |
| Plan-added: `vitest` in watch mode (no `run`) | No lock: a watch session would hold it for hours |
| Plan-added: `/usr/bin/perl` missing | Refused like an unwritable lock dir: exit 4 naming the reason (Open Question 2) |
| Plan-added: `bkit tests run` with `CI` set | Gate runs directly; the lock script is not spawned |
| Plan-added: a gate's own nested lock gives up (exit 75, give-up line for a lock other than this run's `tests` lock) | Read as the gate's exit: verdict FAIL, exit 1, never 81 |
| Plan-added: a child of a `tests` holder needs the unnamed stack lock | Waits on the stack lock as usual, under this script and under an older copy |
| Plan-added: a push (pre-push hook) or a shipped subagent prompt starts the full gate while another gate holds the lock | Its `bkit tests run` waits `--lock-wait-s`, then exits 81 naming the holder: the push stops, the subagent re-runs (Open Question 6) |
| Plan-added: a heavy raw vitest run in bkit's repo with no TTY (agent tool call) finds the lock held | Waits at most 60 s, then fails naming the holder (Open Question 7) |
| Plan-added: a host sandbox denies writes to `~/.cache/bkit/` | Same as an unwritable lock dir: exit 4 naming the path (Open Question 8) |

## Open Questions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question 1:** which copy of the lock script `bkit tests run` executes (issue assumption: "no other engine verb executes a copy-and-own template") → human confirms.
  - **Options:** A) the packaged copy at `getTemplatesRoot()/scripts/ci/bkit-machine-lock.sh` — ships in `package.json` `files` (`.bkit/templates`), resolves under `dist/`, tsx and `node_modules` layouts, versioned with the engine, never the consumer's edited copy · B) the consumer's synced `.bkit/templates/` copy — same bytes, but absent until first install and a consumer may delete it · C) an engine-owned second copy under `.bkit/core/` — two files to keep byte-identical
  - **Recommended:** A) packaged copy — one source; `template-path-refs.test.ts` forbids only workflows / prompts naming template paths, not the engine.
  - **Default if unanswered:** A.
- **Open Question 2:** `/usr/bin/perl` missing when a gate needs the lock.
  - **Options:** A) refuse like an unwritable lock dir: `run` exits 73, `bkit tests run` exits 4 naming the reason — the stack lock already refuses without perl; perl ships with macOS, Debian / Ubuntu (`perl-base`) and git-bash · B) run the gate unlocked with one stderr line — Alpine-style hosts keep testing, but the machine-wide promise silently lapses there
  - **Recommended:** A) refuse — one rule for every "could not take the lock" case; `CI` already skips the lock.
  - **Default if unanswered:** A.
- **Open Question 3:** lock order (issue: "never the reverse") — enforced or documented.
  - **Options:** A) enforced: asking for `tests` while this shell or a live parent holds any other lock, or for a named lock while holding the stack lock, is refused at once naming the order (`run` exits 73) · B) script header + docs only — a reversed caller waits its full timeout against a peer holding the other lock, then 81-loops
  - **Recommended:** A) enforced — the order becomes an invariant a test pins (TASK 2).
  - **Default if unanswered:** A.
- **Open Question 4:** raw `pnpm test` in bkit's repo with `BKIT_TEST_SLOTS` > 1 — vitest reads `maxWorkers` when the config loads, before the global setup takes the lock.
  - **Options:** A) `maxWorkers` from `BKIT_TEST_WORKERS` only when present (issue row) — runs under `bkit tests run` get their share; raw runs with slots > 1 keep vitest's default width · B) also derive cores / slots in `vitest.test-lock.ts` when absent — second copy of the shell formula · C) take the lock at config load (top-level await) — every config load (IDE extension, `vitest list`, `vitest.unit.config.ts`) can queue
  - **Recommended:** A) — slots > 1 is opt-in and raw runs are bkit-repo only.
  - **Default if unanswered:** A.
- **Open Question 5:** `vitest` watch mode (plan-added; the issue does not mention it).
  - **Options:** A) watch / dev mode takes no lock — an open session would block every gate for hours · B) watch takes the lock like a heavy run — a watch session's re-runs never overlap a gate, but every gate on the machine waits (then exits 81) for as long as the session stays open
  - **Recommended:** A).
  - **Default if unanswered:** A.
- **Open Question 6:** full gates bkit ships outside a workflow block skip the lock in consumer repos — `.bkit/templates/.husky/pre-push` runs `pnpm bkit:gate:static-unit-integration` / `bkit:gate:static-unit` raw (fired by every `bkit branches push`), and `bkit-build-plan-gaps-remediate.md:92`, `bkit-debug-failure-remediate.md:72`, `bkit-build-plan-verify.md:66`, `bkit-debug-failure-soak.md:68`, `bkit-ship-conflict-resolve.md` run `pnpm bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` raw. SC 1 ("Two full test gates … never run at the same time") then fails for pushes and subagent gates — the load in `.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`.
  - **Options:** A) hook and prompts run their gate through `bkit tests run` (TASKS 7, 8) — SC 1 holds for every shipped gate; a push on a busy machine stops after `--lock-wait-s` with exit 81 and must be re-pushed; a consumer's copied hook changes only when re-copied · B) hook through `bkit tests run`, prompts stay raw — smaller prompt change; subagent gates in consumer repos keep overlapping; needs SC 1 narrowed by the human + a `Blocking` deferral · C) neither; the human narrows SC 1 to `bkit tests run` gates + a `Blocking` deferral for both — pushes keep overlapping gates (the friction row stays open)
  - **Recommended:** A) — the only option that meets SC 1 as written.
  - **Default if unanswered:** A.
- **Open Question 7:** a heavy raw vitest run in bkit's repo started by an agent with no TTY (ad-hoc `pnpm test`, any raw gate left after Open Question 6) waits the script's default 3600 s while another gate holds the lock — past the agent's ~10-minute tool timeout, so the agent sees a killed call, not a holder line.
  - **Options:** A) the global setup passes `LOCAL_STACK_LOCK_WAIT_S` = 60 to its holder when stdin is not a TTY and the variable is unset, then throws naming the holder — the agent sees the holder within a minute and re-runs; a terminal run keeps the 3600 s wait · B) always 60 s — a human's terminal run fails after a minute too · C) keep 3600 s, documented — agent calls time out silently
  - **Recommended:** A) — reuses the script's existing wait variable; no new env name.
  - **Default if unanswered:** A.
- **Open Question 8:** host sandboxes and the lock dir (`.agents/rules.md` § Provider parity). Every local `bkit tests run` writes `~/.cache/bkit/machine-lock/`; a host that limits writes to the workspace denies it. Hosts: Claude Code (sandbox off by default; when on, writes outside the workspace need its write allow-list), Codex (bkit agents run `workspace-write`, `.bkit/providers.md`; outside paths need `sandbox_workspace_write.writable_roots`), OpenCode, Cursor (agent terminal sandbox when enabled), Antigravity, cloud agents (fresh VM; no other gate on the machine) — write scope per host checked by Manual Verification Step 6.
  - **Options:** A) refuse with exit 4 naming the path and the host setting that grants it — matches the issue Edge Case "Lock dir … not writable → exit 4"; a sandboxed host gates nothing until its owner grants `~/.cache/bkit/` · B) run the gate unlocked with one stderr line when the lock dir is unwritable — sandboxed hosts keep gating; the machine-wide promise lapses there and the issue Edge Case changes · C) put the lock under a path every host can write (`$TMPDIR`, the checkout's git dir) — `$TMPDIR` differs per sandboxed session and the git dir is per repo, so locks stop meeting machine-wide
  - **Recommended:** A).
  - **Default if unanswered:** A.
- **Open Question 9:** exit-81 re-run ceiling. A holder that runs 30 minutes means ~30 end-turn / re-run cycles at the 60 s default; a hung holder never frees the lock.
  - **Options:** A) no ceiling, as the CI-dispatch poll (`.bkit/core/.bkit/workflows.md`); the holder line carries pid and start time, so the agent can report a stale holder — a hung holder loops until a human acts · B) cap re-runs (e.g. 10), then the Failure Path naming the holder — bounded, but needs a re-run counter kept across turns and fails real long gates
  - **Recommended:** A) — `.bkit/core/.bkit/workflows.md` states it (TASK 6).
  - **Default if unanswered:** A.
- **Open Question 10:** `BKIT_TEST_WORKERS` at 1 slot. The issue formula floor(cores / slots) gives 10 on the 10-core machine; vitest's own default is cores - 1, so a gate under `bkit tests run` gains one worker.
  - **Options:** A) issue formula floor(cores / slots) — one extra worker while only one gate runs · B) max(1, floor(cores / slots) - 1) — matches vitest's default at 1 slot; departs from the issue formula and the `Derived Test Matrix` row "cores divided by slots" · C) export only when slots > 1 — no change at the default; one more branch
  - **Recommended:** A) — issue text; one worker is noise once only one gate runs.
  - **Default if unanswered:** A.
- **Assumption:** vitest 5.0.3 exposes the CLI filters to a global setup as `project.vitest.config.filters` (`ResolvedConfig.filters?: string[]` confirmed in `node_modules/vitest/dist/chunks/plugin.d.*.d.ts`; runtime read confirmed at TASK 10's red) → wrong: the light rule falls back to `bkit:test:file` exporting a skip variable (issue's fallback); TASK 10 changes `package.json` `bkit:test:file`.
- **Assumption:** vitest 5.0.3 exposes watch mode to a global setup as `project.vitest.config.watch` (runtime read confirmed at TASK 10's red) → wrong: every watch session reads as heavy, takes the lock and blocks gates for hours; TASK 10 then reads watch from `process.argv` (no `run` subcommand).
- **Assumption:** a gate exiting 75 by itself is rare; the engine reads 75 as a lock give-up only when the log's give-up line names the `tests` lock and this run's `<who>` (TASK 4 tests pin it, nested-lock case included) → wrong: none, the check is the guard.
- **Assumption:** consumers re-copy `.bkit/templates/.husky/pre-push` after upgrading (`CHANGELOG.md` upgrade note, TASK 7) → wrong: their pushes keep running the gate raw and overlap other gates until they do.
- **Assumption:** `bash` is on `PATH` wherever `bkit tests run` runs locally (bkit hooks already need it), and the script stays bash 3.2-compatible (stock macOS `/bin/bash`: no associative arrays, `mapfile`, `${var,,}`) → wrong: gates exit 4 "could not run" on that host.
- **Assumption:** `getconf _NPROCESSORS_ONLN` reports cores on macOS and Linux (fallback `nproc`, then `sysctl -n hw.ncpu`, then 1) → wrong: `BKIT_TEST_WORKERS` = 1 and gates run narrow but correct.
- **Assumption:** `vitest.setup.ts` points `XDG_CACHE_HOME` at a per-worker temp dir, so existing in-process `tests run` tests (`tests.test.ts`) only ever take a temp-dir lock → wrong: they queue behind real gates on a busy machine.
- **Assumption:** `--lock-wait-s` default 60 matches `bkit runs dispatch`'s poll budget and stays under the agent's 10-minute tool-timeout ceiling → wrong: lower the default.
- **Assumption:** a consumer copy whose lock dir was customised (the copy the named-lock API comes from writes `~/.cache/local-stack-lock/`) shares no lock with the template; SC 5 covers copies that kept the template's path → wrong: that consumer re-adopts the template to share locks.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #724
```

Or, to address the reasons first: `/bkit-plan #724`
