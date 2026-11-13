# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md`:
  - Sync content: the `tests-lock.integration.test.ts` inventory row now names the blocked-queue-folder case (exit 4 naming the folder) and the `bkit tests jump` cases (moving a real waiting run, refusing an unknown name, refusing a name two waiting runs share). The new Unit file `tests-jump.test.ts` has its own row (no queue folder refuses and creates none; one marker from a ticket or a held place; `--checkout` when two checkouts share a name).
  - Reorganize: none needed. § Tests lock already describes arrival order, the 120-second held place and `bkit tests jump`, and the machine-lock prose already names the `machine-lock-6.1.1.sh` fixture; both were written during the build.
  - Compress: the two edited rows were re-read once; nothing to cut.
  - Cross-references: § Tests lock already points at `.bkit/templates.md` § Machine lock and `.bkit/providers.md` § Long-running shell commands; no new links needed.
- Checked and already in sync from the build, so not edited: `docs/migrations.md` (the `Machine-lock copies without the queue` row), `.bkit/templates.md` § Machine lock (queue, held places, jump markers, upgrade replacement), `.bkit/cli.md` (`tests jump` row), `.bkit/workflows.md` (`ask` permission row carries the three `tests jump` globs).
- History read: `git rev-parse --is-shallow-repository` printed `false`. The shipped history was read as `git log --stat dev..feat/916-tests-lock-waiting`, because local `dev` is deliberately ahead of `origin/dev` and `origin/dev..HEAD` would list other features' commits.
- Agent memories: `MEMORY.md` holds no copy of tests-lock behaviour, so nothing changed there.

## Unresolved Coverage

None. Topic check for the shipped files: `testing` (updated above), `security` (the new `ask` permission rows live in `.bkit/workflows.md`'s permission table, which `docs/security.md` does not duplicate), `architecture` (the new `commands/workflow/tests-jump.ts` sits in an existing folder). `technology`, `data-schema`, `deployments`, `observability`, `design`, `noise` and `setup` are not applicable: the change touches no stack choice, schema, CI or deploy lane, logging, UI, noise rule or setup step.

## Pending Items

- `916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344` — a waiter with `BKIT_TEST_SLOTS=2` waits behind a first-in-line waiter that only uses slot 1, while slot 2 is free (owner decision needed).
- `916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-266` — a FIFO named like a ticket, held place or jump marker in a queue folder hangs every waiter.
- `916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-267` — the same FIFO finding, raised again in round 2 at the shifted line.
- `916-tests-lock-waiting-challenge-low-skills-lock-json-35` — the skill install step blanked `find-skills`' `computedHash` in `skills-lock.json`.
- `916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-34` — `bkit tests jump` accepts a held place older than 120 seconds.
- `916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-30` — `bkit tests jump` crashes with `ENOTDIR` when a regular file sits at `tests.queue`.
- `916-lock-wait-estimate-from-last` — the waiting note could estimate the wait from `<name>.last` held times (scope-declared).

## Blockers

None.
