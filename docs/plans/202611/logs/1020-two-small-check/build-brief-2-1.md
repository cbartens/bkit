# Brief: group 2 — The shipped authoring doc names no bkit-only command

Plan: Ledger append defaults status to OPEN, and the shipped authoring doc names no bkit-only command Implementation Plan

## Why and what

### Context & Goals

Two small defects from #1012 (findings C6 and C7), built after #992 has landed:

1. `bkit ledgers append` writes a friction, deferral or failure row with no `status` as given. It should write `status: "OPEN"`, and `.bkit/core/.bkit/jsonl.md` should say so. The severity and status refusals in `validate` already exist; they are not rebuilt.
2. The `authoring.md` that ships to every project names `instructions.ts`, `pnpm instructions:sync` and `instructions.test.ts`, which exist only in the bkit repo. Those steps move to bkit's own Project Rules in `.agents/rules.md`, below `bkit:end`, and a test fails if the shipped file names them again.

Out of scope: correcting the old rows `docs/knowledge.jsonl:80` and `docs/failures.jsonl:5` (they are left as they are), and a `bkit ledgers query` diagnostic for bad rows. No prompt or workflow tells a writer to add `status` by hand (`grep` of `.bkit/core/prompts`, `.bkit/core/workflows` and `.bkit/core/.bkit` found none), so there is no such sentence to remove.

**Related Issues:**

- #1020 — Two small checks (this plan's issue)
- #1012 — Project Goals audit: where bkit falls short, and what to change (parent, findings C6 and C7)
- #992 — Ledger commands: six hardening gaps from the 860 review (landed first; same ledger files)

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit ledgers append` of a friction row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| `bkit ledgers append` of a deferral row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| `bkit ledgers append` of a failure row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| An append that gives a `status` keeps it, in the same batch as a row that gets the default | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| The shipped `.bkit/core/.bkit/authoring.md` names no `instructions.ts`, `instructions:sync`, `instructions:show` or `instructions.test.ts` | Static | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | 3 |

## Where it fits

- Group 1: `bkit ledgers append` writes status OPEN by default — done
  - TASK 1: Default a missing `status` to `OPEN` on friction, deferral and failure rows — done
  - TASK 2: State the `OPEN` default in the ledger row schema — done
- Group 2: The shipped authoring doc names no bkit-only command — this group
  - TASK 3: Move the bkit-only steps out of the shipped `authoring.md` and fail on their return — open
  - TASK 4: Rebuild `dist/` and refresh the rendered copies — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Move the bkit-only steps out of the shipped `authoring.md` and fail on their return
  - **READ:** `.bkit/core/.bkit/authoring.md`: § All Agent-Read Files `Shared wording` (lines 178-183), § Prompts and Workflows `Header blocks` (lines 289-298) and `Cross-file alignment` (lines 322-326), § Before You Save (lines 719-725)
  - **READ:** `.agents/rules.md`: Project Rules § Repo Authoring, where the moved text lands
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: delete the three sync-command bullets and the `Checked by:` line under `Shared wording` (lines 181-183); in `Header blocks` reword "let `pnpm instructions:sync` maintain the shared lines" to name no command and delete the `Checked by:` line that names `instructions.test.ts` and `instructions.ts` (line 298); in `Cross-file alignment` delete the sentence "Then run the check and the sync that § All Agent-Read Files, **Shared wording** names." and the `Checked by:` line naming `instructions.test.ts` (line 326); delete the two § Before You Save bullets at lines 721-722 (the `instructions.ts` run and "Run the tests named in the `Checked by:` lines")
  - **UPDATE:** `.agents/rules.md`: below `<!-- bkit:end -->`, in Project Rules § Repo Authoring, add one bullet for the shared-wording sync (after a clause edit, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first, which reports and writes nothing; run `pnpm instructions:sync` only when the report shows the change expected; and after editing a bkit rule, run the same check and sync; checked by `.bkit/core/engine/tools/instructions.test.ts`) and one bullet for the save checklist (run `instructions.ts` after changing a rule, a clause or `.bkit/authoring.md`, and run the tests named in the `Checked by:` lines of the rules touched)
  - **UPDATE:** `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`: a new `it` that reads `.bkit/core/.bkit/authoring.md` and fails on any of `instructions.ts`, `instructions:sync`, `instructions:show` or `instructions.test.ts`, naming each offending line
  - **UPDATE:** `docs/testing.md`: the `audits/repo/shipped-docs-refs.test.ts` line under Project documentation lifecycle coverage, adding that it also fails when the shipped `authoring.md` names a command that exists only in the bkit repo
  - **DONE WHEN:** `.bkit/core/.bkit/authoring.md` holds none of `instructions.ts`, `instructions:sync`, `instructions:show` or `instructions.test.ts`; `.agents/rules.md` below `bkit:end` holds the two new bullets with the removed commands; `pnpm exec vitest run .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` passes; `pnpm exec vitest run .bkit/core/engine/tools/instructions.test.ts` passes (assertions stop at `bkit:end`); the `docs/testing.md` line names the new check
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `the shipped authoring.md names no command that exists only in the bkit repo` fails on `.bkit/core/.bkit/authoring.md` still naming "instructions.ts" and "instructions:sync"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rebuild `dist/` and refresh the rendered copies
  - **READ:** `package.json`: the `build` script (`tsc && chmod +x dist/cli.js`)
  - **UPDATE:** `dist/commands/workflow/ledgers.js`: the compiled output of task 1 (`pnpm build`, then `git add dist/`)
  - **UPDATE:** `.bkit/authoring.md`: refreshed from `.bkit/core/.bkit/authoring.md` by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.bkit/jsonl.md`: refreshed from `.bkit/core/.bkit/jsonl.md` by the same upgrade
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** `pnpm build` exits 0 and `dist/commands/workflow/ledgers.js` holds the status default; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has run, and `.bkit/authoring.md` no longer names `instructions.ts` or `instructions:sync` and `.bkit/jsonl.md` holds the `OPEN` default sentence; `bkit check` reports no drift
  - **TEST FIRST:** n/a — a build and a mirror refresh; the behaviour is tested by tasks 1 and 3

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Default a missing `status` to `OPEN` on friction, deferral and failure rows — `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `docs/testing.md`
- TASK 2 (group 1, done): State the `OPEN` default in the ledger row schema — `.bkit/core/.bkit/jsonl.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Test that the shipped authoring doc names no bkit-repo-only command | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | `grep -rl 'authoring.md' .bkit/core/engine --include='*.test.ts'`; read `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | `shipped-docs-refs.test.ts` already scans the manifest-listed shipped docs (including `.bkit/core/.bkit/authoring.md`) for internal identifiers | EXTEND | Add one `it` over the same file list; no parallel scanner. |
| Home for the bkit-only save-checklist steps | `.agents/rules.md` | read `.agents/rules.md` below `bkit:end` (§ Repo Authoring) | `.agents/rules.md` Project Rules § Repo Authoring (`Authoring sections`, `Shared instructions`) | EXTEND | The two moved bullets and the shared-wording sync commands join the existing Repo Authoring bullets; Project Rules is consumer-owned, so install never overwrites it. |
