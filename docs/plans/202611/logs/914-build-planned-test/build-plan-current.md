Verdict: CONCERNS
Affected: 2

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

1. **TASK 5: Offer the working `BLOCKED` line, and ask about changed tests once at Step 15** — class `Reword`.
   - **Landed change:** `.bkit/core/workflows/bkit-ship.md:336-353` gained 3 lines in Step 2 sub-step 5 (the CI wait and the `cancelled` checks), commit `66dd8fab2 fix(911-ship-failed-merge): close the #911 leftovers on next-step text, cancelled checks and the CI wait`. `## 🤖 Confirm Assumed Items` now starts at `bkit-ship.md:373` (was `:370`), and the section's text is unchanged.
   - **Re-run must resolve:** the task's `READ` cites `bkit-ship.md` § Confirm Assumed Items as `:370-412`; update it to `:373-415`. The plan's Open Question Q3 cite `bkit-ship.md:374` and the Reuse Inventory row "Ship confirms an assumed accept" (`bkit-ship.md:370-412`) shift by the same 3 lines. The approach (no ship edit, `decisions pending` covers a `CHANGED_TESTS` assumed accept) holds. The other anchors Task 5 names hold on `origin/dev`: `.bkit/core/.bkit/workflows.md` changed only with one-for-one line edits (`:802`, `:1794`, `:1799`, `:1801`), so `:971`, `:991` and `:995` are unchanged, and `bkit-build.md`, `bkit-build.none.txt` and the `trackers.test.ts` test `bkit-build: the none render matches its baseline byte for byte` are unchanged.
2. **TASK 7: Document the lock's contract, rebuild `dist/` and re-render the mirrors** — class `Reword`.
   - **Landed change:** `docs/testing.md` gained a `Node case names` sub-bullet in § Test first (`docs/testing.md:303`, commit `959a7a6e9 docs(917-docs-node-test): show how a Node test file reports test names to bkit:test:file`) and a `Time limits` bullet (`docs/testing.md:559`, commit `3415f750b fix(929-hung-test-never): give every test runner a time limit so a hung test fails instead of holding the tests lock`). `The red test stays` is now at `docs/testing.md:314` (was `:313`), and `## Key test files` is now at `docs/testing.md:724` (was `:722`). Both texts are unchanged.
   - **Re-run must resolve:** update the task's two `docs/testing.md` `UPDATE` cites to `:314` and `:724`, and the matching Existence Check in Architecture § `[MODIFY] docs/testing.md` (`:313`, `:722`). The approach holds: the `The red test stays` bullet keeps its wording, and § Key test files still takes a new row. The `.bkit/core/.bkit/workflows.md` § Test-first anchors (`:1786`, `:1795`, `:1796`, `:1797`, `:1800`) are unchanged, because the Red row, `The report, never the exit code` and `Literal names` edits replace one line each; `.bkit/core/docs/templates/bkit-plan.md` is unchanged.
