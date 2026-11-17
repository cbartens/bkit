Verdict: CONCERNS
Failures: 4
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists for 918 (`docs/plans/*/918-*` has no match; the plan says so), so the design-coverage step does not apply.

**Task 1: the guard in `bkit issues comment`**

- Files: `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/issues.ts`, `issues.test.ts`, `tracker.integration.test.ts`, `dist/`.
- `sessionPublication` (`tracker.ts:1974-1987`), refactored onto `sessionsRoot`. It has two callers, both in `tracker.ts`: `bindRunPublication` (`:2006`) and `postForVerb` (`:2086`). Both rely on it throwing for a missing or foreign session, which they turn into the `comment-association` diagnostic. HIGH-RISK: a shared utility.
- New exported `commentRunProof` and `sessionsRoot`. It reads `readRunsLenient` (`locks.ts`) and `outboxRoot` (`lib.ts:815-818`), and resolves the Git-common dir the same way `repo info` mints `sessionDir` (`repo.ts:113-130`, `:224`, `:236`).
- `issuesCommand.verbs.comment.run` (`issues.ts:1060-1120`). The new throw sits before `commentBody` and before the `--post` preparation fallback (`:1072-1092`), so a refused call prints no `comment`, no `commentFile` and no `tracker`. It is a public CLI contract change.
- Exit 2 is excluded from friction (`lib.ts:50-57`, `journal.ts:110-115`). The call is still journaled (`lib.ts:631-633`), so completeness evidence holds.
- Callers of the verb: 13 calls in `.bkit/core/workflows/*.md` and the audit prompt.
  - Session proof: `bkit-plan.md:187`, `:534`; `bkit-build.md:391`; `bkit-design.md:176`, `:621`; `bkit-debug.md:271`, `:871`; `bkit-auto.md:78`, `:126`, `:149`.
  - Status proof: `bkit-build.md:1302`, `bkit-ship.md:230` (the run is opened at `:207`, before the comment).
  - Audit proof: `bkit-audit-generate.md:234`.
  - These are rendered into 5 hosts x 4 trackers (`catalog-parity.test.ts:70-96`). No `.yml`, `.sh` or `scripts/` caller exists.
- Test callers that break without a proof:
  - `issues.test.ts`: the `comment` helper (`:442-448`), the direct `run` at `:696-704`, and the `--post` describe (`:803-889`).
  - `tracker.integration.test.ts`: `:723-730` and `:739`. Every other call in that file passes a session path or a `--file`.

**Task 2: the summary text and `.bkit/core/.bkit/cli.md`**

- `comment.summary` (`issues.ts:973-974`) is read by `pnpm cli:sync` into `.bkit/core/.bkit/cli.md`, which `bkit upgrade` mirrors to `.bkit/cli.md`.
- The test is `cli-doc.test.ts:13` (a regenerate-and-compare check). No other test pins the old summary string.

**Task 3: `bkit-auto` holds `SESSION_DIR`, plus an audit test**

- Edits `.bkit/core/workflows/bkit-auto.md:108` (Step 1 sub-step 2), `.bkit/core/.bkit/workflows.md:1162` and `generated-marker.test.ts`.
- `bkit-auto` is stateless (no `status.jsonl`; `workflows.md:1162`), so the session is its only proof.
- The new line has no standing word, so it needs no `## Local Instructions` entry (`instructions.ts:464-481`; the `bkit-auto` entry is at `.bkit/instructions.md:9741-9769`).
- There is no render snapshot for `bkit-auto` (`render/__snapshots__/` has five phase files only).

**Task 4: the Tracker work comments rule**

- Edits `.bkit/core/.agents/rules.md` (the master), `.bkit/instructions.md` § `tracker-work-comments` and `.bkit/core/prompts/bkit-utility-update-tracker.md:77`.
- `syncRules` copies the bullet and retires the old text (`instructions-sources.ts:265-297`), so the plan's claim holds.
- Mirrors: `.agents/rules.md`, the `.claude/`, `.cursor/` and `.opencode/` copies of `bkit-utility-update-tracker`, `.codex/agents/*.toml` and `.agents/plugins/bkit/agents/`.

**Task 5: contract docs, rebuild, mirrors and the register**

- Edits `.bkit/core/.bkit/workflows.md` § Comment Lifecycle (`:471-475`), `docs/security.md` § Workflow comment ownership and `docs/capabilities.md` (written by `graph:refresh`, which reads the staged files).
- `doc` is not a covered surface for instruction coverage (`instructions.ts:1138-1145`).

## CRITICAL

1. **(plan edit)** The workflows' shared Comments clause tells agents to take the refused path, and no task changes it.
   - The clause says "Omit `--session-dir` when `SESSION_DIR` is not held". It is the `workflow-comments-github` / `-linear` / `-jira` clause at `.bkit/instructions.md:5327`, `:5347`, `:5367`, carried by all six workflows (for example `bkit-auto.md:55`, `:62`).
   - After Task 1, a session-only call that follows the clause has no proof. It exits 2 at the new throw, which sits before `commentBody` and the `commentFile` write (`issues.ts:1072-1093`). It writes no friction row, because exit 2 is excluded (`lib.ts:53`, `journal.ts:113-114`). The clause itself counts "a missing file" as an attempted report.
   - Result: the workflow comment is lost and nobody is warned. That is the failure #918 sets out to fix, and it contradicts Goal 2 ("no workflow comment is lost").
   - Affected calls: every session-only call listed in the Surface-Area Map, including the post-close Owner Answers and debug Step 11 comments.
   - Neither Task 3 nor Task 4 touches the clause, and no `Derived Test Matrix` row covers it.
   - Fix: add the clause rewrite to Task 4 or a new task. Edit the three store entries, retire the old text, run `pnpm instructions:sync`, and replace the omit instruction with one that recovers a proof (re-run `repo info`, or pass `--file="{STATUS}"` when it is held). Extend the Task 3 audit so no carrier tells an agent to drop its proof.

2. **(plan edit)** The breaking change is wider than the plan says, and the "no migration" default rests on the smaller count.
   - The plan says only `bkit-auto` Step 1 and Step 2 are refused between a package update and `bkit upgrade` (Breaking Changes row, plan line 118; Open Question, lines 159-162: "the loss is two progress comments"; Rollback risk window, line 417).
   - But the explicit `--session-dir` on the fileless step comments was added by 826. `docs/plans/202611/logs/826-append-routine-workflow/build-diff-3-1.md:24-137` shows `--session-dir="{SESSION_DIR}"` added to auto, build Step 1, build Step 16 and debug Step 1. Before 826, build Step 16 had neither `--file` nor `--workflow` (`:114`).
   - 826 was built and shipped at bkit 6.1.1 (`.bkit/issues.jsonl:92-96`), after the last release (`CHANGELOG.md:9`, 6.1.1).
   - So a consumer on the released mirrors who updates the package without running `bkit upgrade` loses every fileless workflow comment: the Step 1 comments of design, plan, build and debug, build Step 16, the Owner Answers comments and debug Step 11. Inferred from the 826 diff. The 6.1.1 audit prompt's body-file location was not checked.
   - No engine check refuses a stale mirror at runtime; only `bkit check` reports drift.
   - Fix: correct the three rows, list every affected call, and put the no-migration question back to the owner with the true scope.

3. **(plan edit)** Task 1 and Task 4 touch surfaces with open known failures that the plan does not acknowledge. Pre-Flight Project Context says `docs/failures.jsonl` holds "no row conflicts".
   - `tracker-boundary-fault-matrix-concurrency-timeout` (OPEN, `docs/failures.jsonl:298`) is in `tracker.integration.test.ts`. Task 1 adds a case to that file and needs `pnpm test:integration` green.
   - `tracker-new-comment-budget-shell-observation-flake` (OPEN at its newest row, ts 1794273058724) and `test-timeout-222573a81f37d000` (OPEN) are in `tracker.test.ts`, which covers `tracker.ts`. Task 1 edits `tracker.ts` and needs `pnpm test` green.
   - `instructions-corpus-store-timeout-under-full-gate` (TRIAGED, `docs/failures.jsonl:307`) is in `instructions.test.ts`, which Task 4's DONE WHEN runs.
   - Fix: name these rows in Task 1 and Task 4 as pre-existing. Say that a timeout there is not caused by this change and that no budget or assertion may be weakened. Add the isolation run the rows use as evidence.

4. **(plan edit)** Two `Derived Test Matrix` rows cite tests that cannot detect the wording they claim to verify. Both TEST FIRST waivers rest on that claim.
   - Row 7 says the `comment` summary and the `.bkit/cli.md` row "say 'workflow steps only; never for ad-hoc comments'". It cites `cli-doc.test.ts:13`, which only checks that the region matches a fresh `cli:sync`. It passes whatever the summary says.
   - Row 9 says the new rule wording matches across three files. It cites `instructions-sources.test.ts:111`, `:144` and `:169`, which check that the copies equal the master. They pass if the sentence is never added, or is dropped later.
   - Task 2's waiver says the text is "pinned by the existing `cli-doc.test.ts` region check". Task 4's waiver says the copies are "pinned by the existing `instructions-sources.test.ts`". Both are untrue for the wording.
   - These texts are the shipped behaviour for Goal 3, and `docs/testing.md:242` says to assert prose when the prose is the deliverable.
   - Fix: give Task 2 a TEST FIRST that asserts `issuesCommand.verbs.comment.summary` contains "workflow steps only, never for ad-hoc comments". Give Task 4 one that asserts the `Tracker work comments` bullet in `.bkit/core/.agents/rules.md` names the tracker MCP and "never through `bkit issues comment`". Both fail today.

## OPTIONAL

- **High-risk flag, shared utility:** keep `sessionPublication`'s `realpathSync(sessions)` and its throw (`tracker.ts:1983-1985`) unchanged when extracting `sessionsRoot`. `bindRunPublication` and `postForVerb` depend on the throw to log `comment-association` (pinned by `tracker.integration.test.ts:553-557`).
- **High-risk flag, public CLI contract:** `bkit issues comment` gains exit 2 with no output. Already listed under Breaking Changes. See CRITICAL 2 for its scope.
- **Unlisted test break:** `issues.test.ts:696-704` calls `run(cwd, ["issues","comment",...,"--error-file=none.md"])` directly, not through the helper, and expects exit 3. With no proof it will exit 2. Name it in Task 1's `UPDATE` for `issues.test.ts`.
- **A table that could stop testing anything:** the `refuses %j (exit 2)` table (`issues.test.ts:767-783`) cannot tell its own usage errors from the new guard, because both exit 2. If the helper's proof ever stops matching, every row still passes. Add one helper-path case asserting exit 0, or assert that stderr does not contain "workflow steps only".
- **Path comparison:** pin "realpath where the folder exists" to "realpath the sessions folder (the nearest existing ancestor) when the session folder is gone". Otherwise a non-canonical path refuses a deleted session, for example macOS `/var` versus `/private/var`. The unit fixture calls `realpathSync` on its temp directory (`issues.test.ts:26`), so it will not catch this.
- **Edge cases with no named test:** the nested session path, another slug's audit folder, and a session from the main checkout used in a linked worktree (Edge Cases, plan lines 73, 77 and 80). Name the first two inside tests 3 and 5. Cite `tracker.integration.test.ts:592-607` for the worktree case.
- **Reuse for Task 3:** `catalog-parity.test.ts:136-148` already asserts `--(?:session-dir|file)=` on every rendered non-failure `--post` call across 5 hosts x 4 trackers. Extending it (drop the `--kind=failure` exclusion at `:109`, add the "holds `SESSION_DIR`" check and the audit prompt) would cover the rendered mirrors as well as the sources.
- **Observability:** a refused call inside a workflow leaves no friction row (exit 2 is excluded), so stale-mirror refusals during the upgrade window cannot be seen. Consider one `[bkit-tracker]` diagnostic, without paths or body, when the refused call carries `--post` or `--workflow`.
- **Manual Verification Step 2:** it passes `--workflow=bkit-plan`, but the flag takes `design | plan | build | debug | ship | auto` (`issues.ts:986`). Use `--workflow=plan`.

## OUT OF SCOPE

- The guard is easy to pass. `repo info` is a `by-hand` verb (`repo.ts:139`) that mints a valid folder under `<git-common-dir>/bkit-outbox/sessions/` for any caller (`repo.ts:236`). Consumer repos also commit `docs/plans/**/logs/**/status.jsonl` files, which pass the `--file` proof. This is about how well the guard works, not about regressions, and the plan's Assumption accepts it. A stronger proof would need its own design.
- Applying the same guard to `bkit plans comment` (the plan already records this in Suggested Scope Expansion).
