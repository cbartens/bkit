## Session Prompt — this run's, newer than everything below

#1020 publish=false

## Issue description — oldest

From [#1012 — Project Goals audit: where bkit falls short, and what to change](https://github.com/cbartens/bkit/issues/1012), findings C6 and C7. Second wave of its order of work: turn rule sentences into checks. Two unrelated small defects, filed together because each is a few hours.

### Failing test or CI run

none yet

### What happened

1. **Ledger rows break the documented schema and no shipped check notices.** **[read by the auditor, not re-checked]**
   - `docs/knowledge.jsonl:80` carries a `severity`, which the schema in `.bkit/jsonl.md` does not allow on a knowledge row.
   - `docs/failures.jsonl:5` has `"severity":"medium"` in lower case, so it falls out of every count by severity.
   - Rows are still being written with no `status`. 86 deferral rows have none.
   - `bkit ledgers query` reports 0 diagnostics for all of these.
2. **The save checklist that ships to every project names a command that exists only in the bkit repo.** `.bkit/core/.bkit/authoring.md:721` tells the reader to run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts`. **[line re-read; not confirmed by an install]**

### What should happen

1. `bkit ledgers append` defaults a missing `status` to `OPEN` and rejects a `severity` that is unknown or not allowed for that ledger. The rejection is a no-write error the agent can correct.
2. A project never sees a checklist step it cannot run. The bullet at `authoring.md:721` and the one after it move to bkit's own Project Rules in `.agents/rules.md`.

### Steps to reproduce

1. Append a failure row with `"severity":"medium"` through `bkit ledgers append`. It is accepted.
2. Install bkit into a scratch project and read `.bkit/authoring.md` § Before You Save.

### How often

Every append; every install.

### Affected area

`.bkit/core/engine/commands/ledgers.ts`, `.bkit/core/.bkit/authoring.md`, `.bkit/core/.bkit/jsonl.md`.

### References

- Existing rows that already break the schema: say in the fix whether they are corrected by a same-`key` append or left.
- [#992 — Ledger commands: six hardening gaps from the 860 review](https://github.com/cbartens/bkit/issues/992)

## Issue comment — posted 2026-11-17T20:27:43.000Z

Build notes (v6.3 run, 2026-11-18). Where they differ from the issue body, these win. Built with `/bkit-build`, not `/bkit-debug`, and only after [#992 — Ledger commands: six hardening gaps from the 860 review](https://github.com/cbartens/bkit/issues/992) has landed, because both change the same ledger files.

- **Files (the issue's path for part 1 is wrong):**
  - `.bkit/core/engine/commands/workflow/ledgers.ts` — `bkit ledgers append`. There is no `commands/ledgers.ts`.
  - `.bkit/core/engine/ledgers/telemetry.ts` — `validate`, with the severity check and the status check after it.
  - `.bkit/core/.bkit/authoring.md` — the bullet at about line 721.
  - `.bkit/core/.bkit/jsonl.md` — the row schema.
  - `.agents/rules.md` — Project Rules, below the `bkit:end` marker.
- **Already true on `dev`, do not rebuild:** `validate` refuses a `severity` outside `CRITICAL|HIGH|MEDIUM|LOW` on friction, deferral and failure rows, and refuses any `severity` on knowledge and decision rows. The issue's first reproduce step no longer reproduces.
- **Part 1, still to do:** a deferral, failure or friction row appended with no `status` is written with `status: "OPEN"`. `.bkit/core/.bkit/jsonl.md` says so.
- **Part 2, still to do:** the shipped `.bkit/core/.bkit/authoring.md` names no command that exists only in the bkit repo. The bullet at about line 721 moves to Project Rules in `.agents/rules.md`, below `bkit:end`. The same file names `instructions.ts`, `pnpm instructions:sync` and `instructions.test.ts` in other places (about lines 181-182, 290 and 298); those move or are reworded too.
- **Existing rows that break the schema:** left as they are. `docs/knowledge.jsonl:80` and `docs/failures.jsonl:5` are not corrected in this build, and no read-side check is added.
- **Tests:** an append with no `status` writes `OPEN` for each of the three kinds; an append that gives a `status` keeps it; a test that fails when the shipped `authoring.md` names `instructions.ts` or `instructions:sync`.
- **Done when:** both parts above hold, `pnpm build` output is committed, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has refreshed the rendered copy of `authoring.md`.
- **Out of scope:** correcting old rows; a `bkit ledgers query` diagnostic for bad rows.
- **Removes:** the bkit-only bullets from the doc every project reads, and any prompt sentence that tells the writer to add `status` by hand, if one exists.
