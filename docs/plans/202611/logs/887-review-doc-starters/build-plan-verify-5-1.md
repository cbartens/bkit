Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 6c6b1550c458e07eb9b6ba5ee90f9cd0a7fc60aa2a88cd1d0e80700fbb29f963
<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Task 15 meets every part of its `DONE WHEN`. `shipped-docs-refs.test.ts` `every shipped docs/{topic}.md § citation resolves to a starter heading` passes, with no skip list and no allowed-failure list. The whole `shipped-docs-refs.test.ts` file and `dogfood-templates.test.ts` pass (2 files, 361 tests). `node dist/cli.js check` exits 0 and reports no drift. The task is still left off `Tasks`, because `pnpm bkit:slop:delta` is red on that task's own helper (see the gap below). The task can be ticked once that is fixed.
- Test-first audit (`build-tests-green-5-1.md`): `Enforced: true`, 0 gaps, 0 unproven. It lists no updated tests and nothing already landed.
- The new case matches the task's three `UPDATE` lines:
  - It walks `.bkit/core` and `.bkit/templates`, and skips `*.test.ts`, `__fixtures__`, `dist` and `node_modules`.
  - It covers the twelve topics (`TOPICS` plus `components` and `capabilities`) and matches `##` to `####` headings outside code blocks.
  - The citation pattern accepts an optional `docs/` prefix and an optional backtick or `]` before `§`, and skips headings that start with `{`.
  - A citation resolves when a heading starts the cited text, or when the cited text up to its first `]`, `)`, `,`, `;`, `:` or `.` starts a heading.
  - Each failure is reported as `file:line`.
- Heading matcher, caller item (3): `starterHeadings` also stores each heading with its trailing parenthetical or bracket removed, so two existing citations resolve. The plan does not forbid this. It loosens the match only for a heading that carries a parenthetical, so it is a note, not a gap.
- The four citation fixes, judged against the plan:
  - `.bkit/core/.bkit/workflows.md:1298` now cites `bkit runs gate --help`. `.bkit/core/.bkit/cli.md` has no `runs gate` entry at all. `node dist/cli.js runs gate --help` prints an `Exit codes:` block that includes 19 and 20. The task's `UPDATE` line allows this fallback explicitly. It overrides the Edge Case row "repointed at the `.bkit/*.md` section a consumer has", because the task wins where the two disagree. Pass.
  - `.bkit/templates/.husky/pre-push:58` now cites `.bkit/templates.md` § Git hooks — Husky. That section (around `.bkit/core/.bkit/templates.md:295`) lists the fixed set of `BKIT_*` tooling keys the gate unsets, which is exactly the fact the comment points to. Pass.
  - `.bkit/templates/scripts/graphify/bkit-graphify-graphml.py:14` now cites `.bkit/templates.md` § graphify — map. That section says graphify "is not an installed skill", which is the fact the citation backs ("which this repo does not install"). It does not say that the CLI lacks `--graphml`, but the docstring states that fact itself rather than citing it. The plan names this exact section. Pass. The code agent's "partly holds" caveat does not amount to a gap.
  - `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml:55` now reads `docs/architecture.md § Containers`. `.bkit/templates/docs/architecture.md:64` has `## Containers`. Pass.
- bkit's own copies carry the same edits: `.bkit/workflows.md`, `.husky/pre-push`, `scripts/graphify/bkit-graphify-graphml.py`, `.github/ISSUE_TEMPLATE/bkit-idea.yml` and the `.bkit/version` hash. A search outside `docs/plans/**` finds none of the old citation strings left. `prefix — ship merge gate` still appears only in bkit's own `docs/observability.md` and `docs/deployments.md`, which do not ship.
- Mandatory checks:
  - The Derived Test Matrix row for this test (plan line 170) is in Task 15's `DONE WHEN`.
  - The Documentation Updates row for `.bkit/core/.bkit/workflows.md` (plan line 602) is done.
  - `docs/observability.md` does not apply, because the change is a test file plus comment and doc edits with no runtime error path.
- Out of scope (not a gap): `workflows.md:1298` says "missing or mismatched base evidence exits 20", while `bkit runs gate --help` describes 20 as "API error / rate limit / auth, or the PR head / squash commit unreadable". The wording was there before this task, which did not change it. Propose it separately if wanted.
- No decision records (`build-decision-*.md`), earlier verify reports or remediation logs exist for group 5.

## Identified Gaps Log

1 gap.

TASK 15: `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:464` helper `normaliseCitation` (not a planned test case) — `pnpm bkit:slop:delta` exits 1 with net-new `structure.pass-through-wrappers` "Found 1 pass-through wrapper"; reshape the helper body (a code step may edit a helper, never the planned test body) until slop:delta adds 0 findings, then re-run the test file — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 15: normaliseCitation helper flagged as structure.pass-through-wrappers by slop:delta
  **Severity:** MEDIUM · **Class:** gate · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:464` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:slop:delta reports 0 net-new findings, and shipped-docs-refs.test.ts still passes
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
<!-- bkit:task 1 end -->
