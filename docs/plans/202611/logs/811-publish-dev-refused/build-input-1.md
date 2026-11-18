## Session Prompt — this run's, newer than everything below

#811 publish=false

## Issue description — oldest

### Narrative

When ship fails, its Failure Path runs `workflows handover --flush` (`.bkit/core/workflows/bkit-ship.md:94-97`). That calls `landFailedRecord` (`.bkit/core/engine/commands/workflow/workflows.ts:744`), which commits the ship FAILED record in a throwaway `origin/dev` checkout and pushes it to `dev`.

When `dev` refuses that push (branch protection, for example), `landFailedRecord` takes its `refused` branch (`workflows.ts:820-821`). It logs "ship FAILED record kept in {book}", keeps the record only in the local book, and exits 10. On a laptop the next ship run carries it. On a cloud runner the machine is thrown away, so the record is lost.

Ship's success close already handles the same refusal. `shipClose` passes a `refused` handler to `pushToDev` that publishes the commit through a `ship-close/{fid}` PR (`closePr`, `workflows.ts:1435-1470`). The FAILED flush should do the same.

The ledger row (`ship-cloud-failure-path-after-merge-has-no-publish-channel`) describes an older mechanism, a push of `git branch --show-current`, which is gone since `0df5dda6c`. The defect it names is still reachable.

### Success Criteria

- A `--flush` that `dev` refuses publishes the FAILED record through a PR to `dev` and reports `pushed: true` with that branch as `ref`.
- The PR's title says ship FAILED, not ship DONE.
- When the PR path also fails, the record stays in the book, the command still exits 10, and the log names both failures.
- `handover --push` from the other workflows behaves as before.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `dev` accepts the push | Lands on `dev` as today; no PR |
| `dev` refuses; PR opens and merges | `pushed: true`, `ref` = the PR branch, exit 0 |
| `dev` refuses; PR opens but merge fails | Exit 0 with the open PR named, the way `closePr` reports `close-pr-open` |
| `dev` refuses; branch push or `gh pr create` fails | Record kept in the book, exit 10, both reasons logged |
| No bookkeeping delta | `skipped: "nothing-to-commit"` as today |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| --flush refused by dev publishes the FAILED record through a PR | integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| --flush refused by dev with the PR path failing keeps the record and exits 10 | integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| closePr titles the PR by the record it carries | integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Give the FAILED flush the close's PR fallback
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Let `closePr` take the PR title, so the FAILED flush can reuse it
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: take the title instead of the hard-coded `docs({fid}): ship DONE`
  - **UPDATE:** `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`: pass the DONE title
  - **DONE WHEN:** the existing ship-close PR tests pass unchanged
  - **TEST FIRST:**
    - `workflows.test.ts` `closePr titles the PR by the record it carries` fails on a FAILED record PR titled ship DONE
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Publish a refused FAILED flush through the PR path
  - **UPDATE:** `landFailedRecord` in `.bkit/core/engine/commands/workflow/workflows.ts`: pass a `refused` handler to `pushToDev` that calls `closePr` with a ship FAILED title, and return its `ref`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the test "--flush refused by dev keeps the record in the book and exits 10" (`:1633`) becomes the PR-path-fails case
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Failure Path text for step 5, if it describes the refused outcome
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a refused flush against a test remote with a pre-receive hook lands the record through a PR branch
  - **TEST FIRST:**
    - `workflows.test.ts` `--flush refused by dev publishes the FAILED record through a PR` fails on exit 10 with `pushed: false`
    - `workflows.test.ts` `--flush refused by dev with the PR path failing keeps the record and exits 10` fails on a missing second reason in the log
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Branch name: reuse `ship-close/{fid}`, or use `ship-failed/{fid}` so a later DONE close never collides with an open FAILED PR? Recommended: `ship-failed/{fid}`.
- Assumption: `handover --push` with `shared` set, the other caller of `landFailedRecord` (`workflows.ts:882`), gets the same fallback. Confirm during plan.

### Breaking Changes & Naming

- `handover --flush` no longer exits 10 when `dev` refuses and the PR path works. Callers that read exit 10 as "kept" still see it when both paths fail.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-5)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- #452, closed, no longer covers this
- `docs/failures.jsonl` key `ship-cloud-failure-path-after-merge-has-no-publish-channel`
- `0df5dda6c`, feat(639): flush through a throwaway `origin/dev` checkout

## Issue comment — posted 2026-11-17T11:36:39.000Z

Owner decision for this issue, 2026-11-17 (v6.3 run): the exit code change is approved and goes into the 6.3.0 release notes. `handover --flush` exits 10 only when both the `dev` push and the PR path fail.
