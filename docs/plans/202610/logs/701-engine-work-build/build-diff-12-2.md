diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 1474f0aa0..1b0dfe521 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1371,7 +1371,7 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `locks` | `acquire`, `release` | per-feature `.lock` |
 | `workflows` | `start`, `fail`, `handover`, `close`, `promote`, `links`, `input` | `workflow-started` (resume facts: `lastDoneStep`, `openDecision`; `--branch` refuses another checked-out branch, exit 15; ship clears stale sentinels); the Failure Path (`fail`: row, rebase abort, lock, sentinels, labels, failure comment; `handover --list-stray` lists paths outside the run's logs; `handover --push` / ship's `--flush`); `close` (compliance grade, `workflow-done`, telemetry, report, artifact links, `--outbox`, `--message` commit; ship's `--flush` lands on dev; `--final-return` prints the run's last message: summary (`--summary-file`, or `--summary` + `--summary-missing` when it may be absent), issue link, suggested replies, tips; `--session-dir` deletes the session folder, `fail` too); design / plan canonical promotion (`promote`), close links (`links`), the run's input file (`input`: session prompt, issue text, design / plan / audit reports) |
 | `worktrees` | `setup`, `remove` | Step 2 worktree create / resume / adopt (`--detect` asks the runtime), copy, install, ship's `branchWarning`; teardown |
-| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line of a test file disables a test (a marker inside a comment or a quoted span is not one) or a test file's removed assertions outweigh the ones the diff adds back (a deleted test file included), 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
+| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line of a test file disables a test (a marker inside a comment or a quoted span is not one) or a test file's removed assertions outweigh the ones that same file adds (a deleted test file included), 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
 | `prs` | `open`, `probe`, `merge`, `update-branch`, `checks`, `verbose-ci`, `scan-body`, `cross-check`, `transport-row` | PR create (`open --file --workflow`: an `engine-action` row reuses the PR on a re-run) / lookup, squash merge (empty body, `--match-head`, auto-route suffix from `--label`), server-side base refresh, check-rollup classification (green when present and none failed/pending), debug's verbose-CI title, close-transport audit (`transport-row --scan --cross-check`) |
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 2035fc33e..45b39fde6 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1677,6 +1677,28 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
   });
 
+  it("scan-diff reports an assertion re-added only outside the test file", async () => {
+    const { clone } = featureBranch("scan-disabled-cross-file");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join(
+        "\n",
+      ),
+    );
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
+    );
+    write(clone, "src/notes.md", ["# Notes", "", "  expect(2).toBe(2);", ""].join("\n"));
+    commit(clone, {}, "drop");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
+  });
+
   it("scan-diff finds an added pytest mark skip", async () => {
     const { clone } = featureBranch("scan-disabled-pytest");
     write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index ae4834013..596f07f07 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -2371,7 +2371,7 @@ export const branchesCommand: CommandSpec = {
         {
           name: "disabled-tests",
           type: "boolean",
-          help: "an added line of a test file disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside a comment or a quoted span, or a test file's removed assertions outweigh the ones the diff adds back — a deleted test file included; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+          help: "an added line of a test file disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside a comment or a quoted span, or a test file's removed assertions outweigh the ones that same file adds — a deleted test file included; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
         },
         {
           name: "expect-none",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index f0998f3f8..a98a347d6 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1371,7 +1371,7 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `locks` | `acquire`, `release` | per-feature `.lock` |
 | `workflows` | `start`, `fail`, `handover`, `close`, `promote`, `links`, `input` | `workflow-started` (resume facts: `lastDoneStep`, `openDecision`; `--branch` refuses another checked-out branch, exit 15; ship clears stale sentinels); the Failure Path (`fail`: row, rebase abort, lock, sentinels, labels, failure comment; `handover --list-stray` lists paths outside the run's logs; `handover --push` / ship's `--flush`); `close` (compliance grade, `workflow-done`, telemetry, report, artifact links, `--outbox`, `--message` commit; ship's `--flush` lands on dev; `--final-return` prints the run's last message: summary (`--summary-file`, or `--summary` + `--summary-missing` when it may be absent), issue link, suggested replies, tips; `--session-dir` deletes the session folder, `fail` too); design / plan canonical promotion (`promote`), close links (`links`), the run's input file (`input`: session prompt, issue text, design / plan / audit reports) |
 | `worktrees` | `setup`, `remove` | Step 2 worktree create / resume / adopt (`--detect` asks the runtime), copy, install, ship's `branchWarning`; teardown |
-| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line of a test file disables a test (a marker inside a comment or a quoted span is not one) or a test file's removed assertions outweigh the ones the diff adds back (a deleted test file included), 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
+| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line of a test file disables a test (a marker inside a comment or a quoted span is not one) or a test file's removed assertions outweigh the ones that same file adds (a deleted test file included), 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
 | `prs` | `open`, `probe`, `merge`, `update-branch`, `checks`, `verbose-ci`, `scan-body`, `cross-check`, `transport-row` | PR create (`open --file --workflow`: an `engine-action` row reuses the PR on a re-run) / lookup, squash merge (empty body, `--match-head`, auto-route suffix from `--label`), server-side base refresh, check-rollup classification (green when present and none failed/pending), debug's verbose-CI title, close-transport audit (`transport-row --scan --cross-check`) |
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 63e43432d..26adc7b14 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -1980,7 +1980,7 @@ export const branchesCommand = {
                 {
                     name: "disabled-tests",
                     type: "boolean",
-                    help: "an added line of a test file disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside a comment or a quoted span, or a test file's removed assertions outweigh the ones the diff adds back — a deleted test file included; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+                    help: "an added line of a test file disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside a comment or a quoted span, or a test file's removed assertions outweigh the ones that same file adds — a deleted test file included; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
                 },
                 {
                     name: "expect-none",
