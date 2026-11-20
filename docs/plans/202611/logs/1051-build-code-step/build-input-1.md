## Session Prompt — this run's, newer than everything below

#1051 publish=false

## Issue description — oldest

### What happened

In a build, the code subagent (`@bkit-build-plan-tasks`) edits engine sources under `.bkit/core/engine/` and hands back without running `pnpm build`. The orchestrator's `bkit steps finish` then exits 8, because the pre-commit hook's `bkit:check:dist` prints `[bkit] dist/ is stale — run pnpm build and commit the result`. The orchestrator runs `pnpm build`, stages `dist/` and re-runs the block, which commits.

Seen in five friction rows in `.bkit/friction.jsonl`:

<!-- prettier-ignore -->
| Run | Key | Group |
| --- | --- | --- |
| `960` | `code-agent-skips-dist-build` | plan-tasks |
| `1011-rules-ship-project` | `code-step-stale-dist/build-plan-tasks` | 3 |
| `992-ledger-commands-six` | `code-step-stale-dist/build-plan-tasks` | 1 |
| `992-ledger-commands-six` | `code-step-stale-dist/build-plan-tasks` | 4 |
| `1018-subagent-commits-makes` | `code-step-stale-dist/build-plan-tasks` | 4 |

In the `1018-subagent-commits-makes` row, re-running the same block passed with no build in between, so that one may be a timing case and not a missing build.

A sentence in the session brief ("run `pnpm build` before a code step's finish block") did not stop it: the `1018-subagent-commits-makes` run carried that sentence.

### What should happen

A code step that changed a file `dist/` is built from commits on the first `steps finish`, with no hand recovery.

### How bad

Low per event: one refused commit and one re-run, nothing lost. It recurs in most builds that touch the engine, and each one costs an orchestrator turn and a friction row.

### Possible fix

Pick one home, in the engine:

- `bkit steps finish` for a code step runs the repo's build when the step's diff holds a source the build output depends on, then stages the output with the step's commit. The build command and the output folder come from the repo's own settings, so nothing names a stack.
- Or `bkit tests changed`, which the code agent already runs, builds first and leaves the output staged.

Reproduce first: confirm from a fresh build whether the agent ran no build, or ran one before its last edit.

### Removes

The orchestrator's hand recovery (run the build, stage `dist/`, re-run the block), and the need for any sentence that tells the code agent to build.
