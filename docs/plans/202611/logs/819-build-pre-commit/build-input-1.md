## Session Prompt — this run's, newer than everything below

/bkit-build #819 publish=false

## Issue description — oldest

### Narrative

When a commit stages a non-test engine `.ts` file, `.husky/pre-commit:18-22` runs `pnpm bkit:check:dist`. That script is `rm -rf dist && tsc && chmod +x dist/cli.js && git diff --exit-code dist/` (`package.json:87`). It compiles the whole working tree, not what is staged, and compares the output with the index.

Several agents often share one checkout. When another agent has an unstaged edit to an engine file, the compiled `dist/` includes that edit, the diff is not empty, and the commit is refused, even though the committer staged only their own files and a correct `dist/`. The check also rewrites `dist/` in the shared tree as a side effect.

`docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents` records it. No open issue carries it.

### Success Criteria

- The dist check compiles the staged tree, not the working tree.
- An unstaged edit to an engine file beside a staged one does not refuse the commit when the staged `dist/` matches the staged sources.
- A staged engine edit with a stale staged `dist/` is still refused, with the same message.
- The check leaves the working tree's `dist/` untouched.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Staged source and staged `dist/` match; unstaged engine edit present | Commit allowed |
| Staged source changed, staged `dist/` stale | Commit refused with `[bkit] dist/ is stale — run pnpm build and commit the result` |
| Partially staged file (some hunks staged) | Only the staged hunks are compiled |
| Staged file deleted | Its output is expected to be gone from staged `dist/` |
| `tsc` fails on the staged tree | Commit refused with the compiler error |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Dist check passes for the staged tree with an unstaged engine edit beside it | integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` |
| Dist check refuses a stale staged dist | integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` |
| Dist check leaves the working tree's dist untouched | integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Check dist against the staged tree
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Compile the index into a scratch directory and compare with the staged `dist/`
  - **CREATE:** a script for the check, placed where `docs/architecture.md` puts repo scripts: export the index (`git checkout-index`) into a scratch dir under `tmp/`, link `node_modules`, run `tsc` there, and compare the output with `git ls-files -s dist/`
  - **UPDATE:** `package.json`: `bkit:check:dist` calls the script
  - **CREATE:** `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`: tests in a scratch git repo
  - **READ:** `.husky/pre-commit`: `:18-22`, the caller
  - **DONE WHEN:** the three tests pass, and a real commit with another agent's unstaged engine edit present is allowed
  - **TEST FIRST:**
    - `check-dist.integration.test.ts` `passes for the staged tree with an unstaged engine edit beside it` fails on the current script refusing the commit
    - `check-dist.integration.test.ts` `refuses a stale staged dist` fails on a stale `dist/` being accepted
    - `check-dist.integration.test.ts` `leaves the working tree's dist untouched` fails on `dist/` being rewritten
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: `tsc` output is the same whether it runs in the checkout or in a scratch copy with linked `node_modules`. The plan should confirm this on one real build.
- The check is bkit-repo only. Confirm it stays outside any shipped template.

### Out of Scope

- The pre-push gates.
- #707, closed, which fixed the build workflow's per-step commit against this check.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-10)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- `docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents`
