# Brief: group 2 — Challenge round 1 findings (tests)

Plan: Pre-push: load the repo environment Implementation Plan

## Why and what

### Context & Goals

The pre-push hook's inner, logged run goes through `direnv exec .`, so the gate always runs with the repo's `.envrc` variables, and an untrusted folder blocks in seconds with `direnv allow .`. A `bkit tips` entry tells repos with an older hook copy to paste the new block.

## Where it fits

- Group 1: The pre-push hook loads the repo environment itself — done
  - TASK 1: Run the hook's inner, logged run through `direnv exec .`, and block an untrusted folder before it — done
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the direnv block — done
  - TASK 3: Document the hook's direnv behaviour — done
- Group 2: Challenge round 1 findings — this group
  - TASK 4: An unattended workflow whose worktree `.envrc` differs from the main checkout's (the branch edits it, or a dev merge mid-run changes it) does all its build work, then dies at its first push with exit 1, because worktree setup still treats an un-allowed `.envrc` as "never fatal" — open
  - TASK 5: An agent whose shell was kept free of `.bkit/.env` pushes, and the hook hands the write PAT `BKIT_GH_TOKEN` and every other tooling key to all code the gate runs (agent-authored tests, lint plugins, devDependency code), whose output lands in the agent-readable `tmp/pre-push.log` — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** An unattended workflow whose worktree `.envrc` differs from the main checkout's (the branch edits it, or a dev merge mid-run changes it) does all its build work, then dies at its first push with exit 1, because worktree setup still treats an un-allowed `.envrc` as "never fatal"
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.husky/pre-push:39` · **Round:** 1
  - **DONE WHEN:** The owner decides where an un-allowed worktree `.envrc` fails: either `bkit worktrees setup` (`.bkit/core/engine/commands/workflow/worktrees.ts` `allowDirenv`) turns a differing / failed `direnv allow` into a fail-early exit or an explicit "push will block" narration, and `.bkit/workflows.md` § Worktree Setup (line 1184, "never fatal") is reworded to match; or the hook downgrades an untrusted `.envrc` inside `.worktrees/*` to a warning. No agent can settle it: the plan mandates the hard block, while the worktree-setup contract in `.bkit/workflows.md` promises the opposite, and only the owner can say which contract wins.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `setup with an .envrc differing from the main checkout's reports that the push will block` fails on setup narrating only "not allowed; read it, then run direnv allow" and exiting 0

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** An agent whose shell was kept free of `.bkit/.env` pushes, and the hook hands the write PAT `BKIT_GH_TOKEN` and every other tooling key to all code the gate runs (agent-authored tests, lint plugins, devDependency code), whose output lands in the agent-readable `tmp/pre-push.log`
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.husky/pre-push:40` · **Round:** 1
  - **DONE WHEN:** The owner decides, and records in `docs/decisions.jsonl`, which variables the pre-push gate may receive. No agent can settle this, because the plan's goal ("the gate always runs with the repo's `.envrc` variables") conflicts with `docs/security.md` § `.bkit/.env` scope (tooling secrets only, not stack credentials) and § Untrusted Content (give each job the narrowest-scoped token), and with the `Read(./.bkit/.env)` deny in `.claude/settings.json:267`. The options are: (a) accept that the full `.envrc` reaches the gate, and document it in `docs/security.md` as an accepted risk; (b) load only the app env files and `unset` the `BKIT_*` tooling keys in the inner run; or (c) load a dedicated gate env file. The hook copies (`.bkit/templates/.husky/pre-push:40`, `.husky/pre-push:40`) and `.bkit/core/.bkit/templates.md` § Git hooks then match that decision.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → .bkit/.env tooling keys do not reach the gate` fails on the stub `pnpm` recording `BKIT_GH_TOKEN` as set. The test stubs `direnv` to source an `.envrc` that runs `dotenv_if_exists .bkit/.env` over a `.bkit/.env` holding a dummy `BKIT_GH_TOKEN`, as real direnv does; today the hook passes the whole loaded env to `sh "$0"`.

<!-- bkit:task 5 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| trusted `.envrc`, variable missing from the shell → the gate sees the variable | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| untrusted `.envrc` → exit 1, stderr names `direnv allow .`, no `bkit check` or gate call | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| no `.envrc` → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `direnv` not on `PATH` → gates run, no warning | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `CI` set → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| delete-only push through `direnv exec` → exit 0, no gate | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| setup with an .envrc differing from the main checkout's reports that the push will block | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 4 |
| trusted .envrc → .bkit/.env tooling keys do not reach the gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 5 |
