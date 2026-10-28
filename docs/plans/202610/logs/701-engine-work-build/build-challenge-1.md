Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage — the supplied diff shows 20 files whole; the rest (engine commands, prompts, workflows, mirrors, snapshots) were read from the tree and `git diff origin/dev...HEAD -- <path>`. Round 1's deferred LOW findings (tasks 8, and challenge-2's two) are not re-reported; tasks 12, 15, 16, 17, 18 check out, tasks 13 and 14 are partial.

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `scan-diff --disabled-tests` matches its disable markers on every added line of every file, so any prose that quotes `test.skip` / `describe.skip` / `@Disabled` / `t.Skip(` / `xfail` — a skill doc, `docs/knowledge.jsonl`, `docs/testing.md`, the marker's own regex literal in `branches.ts` — is reported as a disabled test, and the ship sweep turns that `disabled` list into Blocking Deferrals + `Verdict: FAIL`; this branch's own diff already exits 1 with 18 hits (`.agents/skills/vitest/references/core-describe.md:60`, `docs/knowledge.jsonl:321`, `.bkit/core/engine/commands/workflow/branches.ts:1080`, its `dist/` copy, …)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1090`
  - **DONE WHEN:** `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` on this branch exits 0 with `disabled: []` — its only marker-shaped added lines are quoted prose under `.agents/skills/**` and `docs/*`, the engine's own marker literals in `branches.ts` / `dist/`, and `branches.test.ts`'s `'@pytest.mark.skip(…)'` fixture strings; an added `test.skip(` / `@pytest.mark.skip` / `@Disabled` **call** in a `*.test.*` / `*.spec.*` / `test_*.py` file still exits 1 naming `file:line` and the test — `markersFor` scopes the marker set to test files and the added-line check skips a marker inside a comment or a quoted span, instead of handing `DISABLED_MARKERS` to every path
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a quoted skip in a documentation file` fails on today's code: a branch that adds `docs/guide.md` holding "never call \`test.skip\` in a spec; a \`describe.skip\` hides regressions" exits 1 with `disabled: [{file: "docs/guide.md", line: 3, test: "Never call \`test.skip\` …"}]`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a marker literal in a non-test source file` fails on today's code: adding the line `/@Disabled\b/,` to a `.ts` source file exits 1 with that line's text as the test name

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `scan-diff --disabled-tests` reports a test file whose assertion **changed** as a disabled test — the re-add check compares each removed line's exact trimmed text against the added lines, not the file's assertion count — so the round-1 comment/import/move fix still fires on any edited expectation or matcher, and the sweep records a Blocking Deferral for a test that is intact; this branch's own diff carries two such hits (`.bkit/core/engine/commands/workflow/tests.test.ts:1769` from `{ enforced: true, gaps: [] }` → `{ …, verdict: "PASS" }`, and `:2065` from `toEqual([])` → `toEqual([objectContaining(…)])`)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1194`
  - **DONE WHEN:** a diff that rewrites one assertion's expected value or matcher inside a test body exits 0 with `disabled: []`; a diff that drops one assertion and adds a different one to the same test still exits 0; a diff whose removed assertion count exceeds its added assertion count in that file exits 1 naming the file, line and test (a net drop, as `Task 13`'s `DONE WHEN` words it); the repo's own `tests.test.ts` diff yields no hit
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion whose expectation changed` fails on today's code: `expect(1).toBe(1)` → `expect(1).toBe(2)` exits 1 with `disabled: [{file: "src/a.test.ts", line: 2, test: "a"}]`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion replaced by another in the same test` fails on today's code: `expect(a).toEqual([])` → `expect(a).toEqual([expect.objectContaining({})])` exits 1

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `scan-diff --disabled-tests` cannot see a **deleted** test file — git writes `+++ /dev/null` for a deletion, the loop overwrites `file` with that path, `TEST_FILE` no longer matches and no removed assertion is recorded — so a diff that removes an entire `*.test.*` file (every test and assertion in it) exits 0 with `disabled: []` and the ship gate passes the strongest form of test removal
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1170`
  - **DONE WHEN:** the diff walk keeps the `--- a/{path}` token and uses it when `+++` is `/dev/null`, so a deleted test file reports its removed assertions (naming the file, its line and the nearest declaration) and exits 1, while an added file still resolves its `+++` path and an ordinary edit is unchanged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a deleted test file` fails on today's code: `git rm src/a.test.ts` (3 lines, one `it` with one `expect`) on a feature branch exits 0 with `disabled: []`, `found: false`

<!-- bkit:task 3 end -->

## Round 1 Fixes — Checked, Not Re-reported

- Tasks 12 (`own-cycle` → `bounded-remediation` fails), 15 (`--tasks=none`), 16 (`status: CLOSED` → `Exempt`), 17 (adjudicated `unjustified` → `Lazy`, no second write), 18 (`parsePlanBlocks` errors and `NO_MARKERS_REASON`) hold; `npx vitest run ledgers.test.ts tasks.test.ts` = 102 passed.
- Task 13 is partial: exact-text re-add only — see TASK 2. Task 14's widened Python set works (`@pytest.mark.skip` fixture passes) but the same widening matched its own fixture strings — see TASK 1.
- Real dogfood, not fixtures: `node dist/cli.js tests plan-check --plan=docs/plans/202610/701-engine-work-build-plan.md --log=/tmp/pc701.md` exits 0, 0 problems; `node dist/cli.js ledgers triage --fid=701-engine-work-build --plan=…` on a copy of the ledger buckets all 7 of this FID's rows `Exempt`, writes 0 (no wrong verdict for this run); `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` exits 1 with 18 hits — none of them a disabled test.
