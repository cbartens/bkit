Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: none
Loosened: none
Fingerprint: b3a05e02283b78706147bea2b86b71fc8a1b117d501c7d3b412ccfb93156349a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Task 16 judged against `build-diff-6-1.md` (commits 0a145b307 and 677dcf5a2), which changes only `.bkit/core/engine/install/project-docs.test.ts` in code.
- `pnpm vitest run .bkit/core/engine/install/project-docs.test.ts`: 36 of 36 passed, both Task 16 TEST FIRST tests included. The existing callers `adoptionArrows()` (lines 451, 697) and `docPaths` (lines 460, 534, 698) still pass against the shipped chart.
- Task 16 is met in part. `adoptionArrows` takes the chart text as a parameter (defaulting to `adoptionChart()`), reads `-->|x|` labels, chained edges and `&` groups, and throws on `A -- x --> B`, `A ==> B`, `A ---> B`, `A --- B` and a trailing `;`. It still returns no edge and no error for the dotted-label form `A -. x .-> B` and `A -..-> B`, so the DONE WHEN "no edge is dropped silently" is not met (one gap, below). `A --o B` and `A -.- B` are dropped the same way. They are arrow-less links, so they are named in the fix but do not on their own make the gap.
- `docPaths` uses `(?<![/\w])docs\/[a-z-]+\.md(?!\w|\.\w)`. It rejects `.bkit/templates/docs/x.md`, `./docs/x.md`, `mydocs/x.md`, `docs/x.mdx` and `docs/x.md.bak`, and accepts `docs/x.md.` at a sentence end. That reads the DONE WHEN's "not a word character or `.`" as "not a longer suffix". The literal reading would drop a path that ends a sentence, so it is noted here and not logged as a gap.
- The TEST FIRST test calls `adoptionArrows` through a function-type cast (`as (chart: string) => ...`), which was written before the parameter existed. It is not a type-system escape on the list in `.agents/rules.md`, and it is not a gap.
- Test-first audit `build-tests-green-6-1.md`: Enforced true, 0 gaps, 0 unproven. There are no Updated tests or Already landed sections.
- Decision record `build-decision-1-1.md` accepts two out-of-scope load failures from the holistic run (`land.test.ts`, `guardrails-cursor.integration.test.ts`). Neither touches Group 6.
- `build-plan-current.md`: 0 affected tasks. `docs/testing.md` and `docs/observability.md` are present. This change has no error-logging path, because it only touches test helpers.
- The `.bkit/friction.jsonl` and `docs/deferrals.jsonl` rows in the diff are workflow ledger rows. The three LOW challenge deferrals are outside Task 16.

## Identified Gaps Log

1 gap.

TASK 16: `.bkit/core/engine/install/project-docs.test.ts:299` adoptionArrows still drops a dotted edge silently: its arrow-line filter `/-->|-\.->|---|==>/` misses the Mermaid dotted-label form `A -. why .-> B` and the longer dotted arrow `A -..-> B`, so both return no edge and no error (probed against the shipped logic), against the DONE WHEN "throws on any arrow line it cannot parse, so no edge is dropped silently"; widen the filter to every Mermaid link token (any run of `-`, `.` or `=` ending in `>`, plus `---`, `-.-`, `--o`, `--x`) so these lines either parse or throw, and add a case to `adoptionArrows reads labelled, chained and grouped edges` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** adoptionArrows silently drops dotted-label and longer dotted Mermaid edges
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.test.ts:299` · **Round:** 1
  - **DONE WHEN:** adoptionArrows either reads or throws on every Mermaid arrow line, the dotted-label form `A -. x .-> B` and the longer dotted arrow `A -..-> B` included, and `adoptionArrows reads labelled, chained and grouped edges` covers both forms
  - **TEST FIRST:**
    - .bkit/core/engine/install/project-docs.test.ts
<!-- bkit:task 1 end -->
