Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### TASK 5: Document the queue in the lock docs and re-render the mirrors

- **Class:** `Reword`
- **Landed change:** `.bkit/shared/docs/testing.md:20` and `:307` (two inserted lines: the gate tier-order bullet and the jest `--runTestsByPath` sub-bullet), rendered into `docs/testing.md:20` and `:307`, from commits `1afb96fd3` "docs(testing): gates run tiers one at a time; the E2E gate never stops at the first red" and `2928bdfea` "docs(testing): warn that jest reads the bkit:test:file path as a regex". The TASK 5 `UPDATE` bullet for `docs/testing.md` names "the machine-lock paragraph below `bkit:end` (line 709)"; on `origin/dev` that paragraph sits at `docs/testing.md:711`, and `.bkit/shared/docs/testing.md` § Tests lock moved from line 317 to line 319. The sections, their text and the task's approach are unchanged, and the branch already contains both commits.
- **Re-run must resolve:** change the TASK 5 `UPDATE` line reference from 709 to 711 (or anchor it by section name), and the same stale references outside the task block: `#### [MODIFY] .bkit/shared/docs/testing.md` "§ Tests lock (line 317)" to 319, and `#### [MODIFY] docs/testing.md` plus the `Documentation Updates` row "line 709" to 711.
