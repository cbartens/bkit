## Session Prompt — this run's, newer than everything below

#1018 publish=false

## Issue description — oldest

From [#1012 — Project Goals audit: where bkit falls short, and what to change](https://github.com/cbartens/bkit/issues/1012), finding C2. Second wave of its order of work: turn rule sentences into checks.

### Failing test or CI run

none yet

### What happened

"Subagents do not commit" exists only as a sentence, and two engine checks assume it is always obeyed.

- **The sentence is easy to miss.** 33 of 40 prompts are told not to commit, and 32 of 40 carry the `Commits` rule bullet, which opens "Commit early and often". **[re-counted]**
- **`bkit tests changed` then finds nothing.** It defaults `--base` to `HEAD` (`tests-changed.ts:203`), on the reasoning that agent steps never commit. A subagent that commits gets an empty changed set, so lint and typecheck never run on its files, and it reports them clean. **[default re-read; the route read by the auditor]**
- **The gaps fix then looks missing.** After a gaps fix, `bkit-build.md:906` runs `bkit branches scan-diff --base=HEAD~1 --code`. When the subagent committed the fix itself, that range is the wrong one, and the run stops at a Decision Pause for a fix that exists. **[read by the auditor]**

### What should happen

Both checks give the same answer whether or not a subagent committed: they measure from the commit of the step's last `step-done` row, not from `HEAD` or `HEAD~1`.

### Steps to reproduce

1. In a scratch repo with bkit installed, edit a source file and commit it.
2. Run `bkit tests changed` with no `--base`. The changed set is empty.

### How often

Not counted. No run log records whether a subagent committed.

### Affected area

`.bkit/core/engine/commands/tests-changed.ts`, `bkit steps finish`, `.bkit/core/workflows/bkit-build.md:906`.

### References

- Not part of this issue: refusing a subagent commit outright. That is a new gate and belongs with the later hardening.
- Related wording: the audit's finding T7 proposes that a leaf prompt gets "Do not commit; the workflow commits for you" in place of the full `Commits` bullet.

## Issue comment — posted 2026-11-17T12:51:56.000Z

Build notes (v6.3 run, 2026-11-17). Where they differ from the issue body, these win. Built with `/bkit-build`, not `/bkit-debug`.

- **Files (the issue's paths have moved):**
  - `.bkit/core/engine/commands/workflow/tests-changed.ts` — the default `--base` is `HEAD` (about line 203).
  - `.bkit/core/engine/commands/workflow/branches.ts` — `scan-diff`.
  - `.bkit/core/engine/commands/workflow/steps.ts` — writes the `step-done` row and its `parentSha`.
  - `.bkit/core/workflows/bkit-build.md` — `branches scan-diff --base=HEAD~1 --code` is at about line 906 and again at about line 1016 (the holistic copy). The issue names only the first; both change.
  - `.bkit/core/engine/commands/lib.ts` already has a resolver for the active run; use it, do not add a second one.
- **Which commit to measure from:** `bkit tests changed` runs inside the subagent, before the step's own `step-done` row exists. So "the last `step-done` row" is the previous step's row, and the base is the commit that row's work sits on top of. The changed set must not pick up files from that earlier step's own commit.
- **Tests:** one scratch git repo, two cases for each of the two checks: the subagent committed its work, and the subagent left it uncommitted. Both cases give the same answer.
- **Done when:** both checks answer the same whether or not a subagent committed; no `--base=HEAD~1` literal is left in `.bkit/core/workflows/bkit-build.md`; the four prompts that call `bkit tests changed` without `--base` need no edit.
- **Out of scope:** refusing a subagent commit outright; the `Commits` bullet in `.bkit/instructions.md`.
- **Removes:** the two `--base=HEAD~1` literals in `.bkit/core/workflows/bkit-build.md`, and the code comment and help text that rest on "agent steps never commit".
