diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 536d571e4..1474f0aa0 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1371,7 +1371,7 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `locks` | `acquire`, `release` | per-feature `.lock` |
 | `workflows` | `start`, `fail`, `handover`, `close`, `promote`, `links`, `input` | `workflow-started` (resume facts: `lastDoneStep`, `openDecision`; `--branch` refuses another checked-out branch, exit 15; ship clears stale sentinels); the Failure Path (`fail`: row, rebase abort, lock, sentinels, labels, failure comment; `handover --list-stray` lists paths outside the run's logs; `handover --push` / ship's `--flush`); `close` (compliance grade, `workflow-done`, telemetry, report, artifact links, `--outbox`, `--message` commit; ship's `--flush` lands on dev; `--final-return` prints the run's last message: summary (`--summary-file`, or `--summary` + `--summary-missing` when it may be absent), issue link, suggested replies, tips; `--session-dir` deletes the session folder, `fail` too); design / plan canonical promotion (`promote`), close links (`links`), the run's input file (`input`: session prompt, issue text, design / plan / audit reports) |
 | `worktrees` | `setup`, `remove` | Step 2 worktree create / resume / adopt (`--detect` asks the runtime), copy, install, ship's `branchWarning`; teardown |
-| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line disables a test or a test file loses an assertion, 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
+| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line of a test file disables a test (a marker inside a comment or a quoted span is not one) or a test file's removed assertions outweigh the ones the diff adds back (a deleted test file included), 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
 | `prs` | `open`, `probe`, `merge`, `update-branch`, `checks`, `verbose-ci`, `scan-body`, `cross-check`, `transport-row` | PR create (`open --file --workflow`: an `engine-action` row reuses the PR on a re-run) / lookup, squash merge (empty body, `--match-head`, auto-route suffix from `--label`), server-side base refresh, check-rollup classification (green when present and none failed/pending), debug's verbose-CI title, close-transport audit (`transport-row --scan --cross-check`) |
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 7ba8ca8e8..2035fc33e 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1728,6 +1728,92 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 2, test: "test_a" }]);
   });
 
+  it("scan-diff ignores a quoted skip in a documentation file", async () => {
+    const { clone } = featureBranch("scan-disabled-doc");
+    // Spelled in pieces, as the slop plugin spells its own patterns: this file then carries
+    // no skip marker of its own for either scanner to find.
+    const quoted = `${"test"}.${"skip"}`;
+    const nested = `${"describe"}.${"skip"}`;
+    write(
+      clone,
+      "docs/guide.md",
+      [
+        "# Testing",
+        "",
+        `Never call \`${quoted}\` in a spec; a \`${nested}\` hides regressions`,
+        "",
+      ].join("\n"),
+    );
+    commit(clone, {}, "docs");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
+  it("scan-diff ignores a marker literal in a non-test source file", async () => {
+    const { clone } = featureBranch("scan-disabled-literal");
+    write(clone, "src/markers.ts", "const MARKERS = [/@Disabled\\b/];\n");
+    commit(clone, {}, "markers");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
+  it("scan-diff ignores an assertion whose expectation changed", async () => {
+    const { clone } = featureBranch("scan-disabled-expect");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
+    );
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('a', () => {", "  expect(1).toBe(2);", "});", ""].join("\n"),
+    );
+    commit(clone, {}, "tighten");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
+  it("scan-diff ignores an assertion replaced by another in the same test", async () => {
+    const { clone } = featureBranch("scan-disabled-replace");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('a', () => {", "  expect(a).toEqual([]);", "});", ""].join("\n"),
+    );
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('a', () => {", "  expect(a).toEqual([expect.objectContaining({})]);", "});", ""].join(
+        "\n",
+      ),
+    );
+    commit(clone, {}, "replace");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
+  it("scan-diff reports a deleted test file", async () => {
+    const { clone } = featureBranch("scan-disabled-deleted");
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
+    );
+    commit(clone, {}, "test");
+    git(clone, "rm", "-q", "src/a.test.ts");
+    commit(clone, {}, "rm");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 2, test: "keeps a" }]);
+  });
+
   it("needs exactly one of --paths, --marker, --code; an unknown base exits 23", async () => {
     const { clone } = featureBranch("scan-usage");
     expect((await run(clone, ["scan-diff", "--base=origin/dev"])).code).toBe(2);
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index b9b75d3c5..ae4834013 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -1061,7 +1061,7 @@ const NOT_CODE = [":(exclude)docs/plans", ":(exclude)docs/*.jsonl", ":(exclude).
 /** One added line that disables a test, or removes one of its assertions. */
 export interface DisabledTest {
   file: string;
-  /** 1-based line in the new file. */
+  /** 1-based line in the new file, or in the old one when the diff deletes the file. */
   line: number;
   /** The test it sits in, else the marker line's own text. */
   test: string;
@@ -1071,23 +1071,37 @@ export interface DisabledTest {
 const TEST_FILE = /\.(?:test|spec)\.|_test\.|(^|\/)test_[^/]*\.py$/;
 
 /** Added-line markers that disable a test: `bkit-slop-type-suppression.mjs`'s set, widened. */
-const DISABLED_MARKERS = [
+const MARKERS = [
   /\b(?:describe|context|it|test|suite|bench)\.(?:skip|todo|fixme)\b/,
   /(?<!\.)\bx(?:it|describe|test|context)\s*\(/,
   /\bxfail\b/,
   /\bt\.Skip\(/,
   /#\[ignore\b/,
   /@Disabled\b/,
+  /@pytest\.mark\.skip\b/,
+  /@unittest\.skip\b/,
+  /\.skip\s*\(/,
 ];
 
-/** Added-line markers only a test file carries: Python's decorators and a bare `skip` call. */
-const TEST_FILE_MARKERS = [/@pytest\.mark\.skip\b/, /@unittest\.skip\b/, /\.skip\s*\(/];
+/** The markers that apply to an added line of `file`: only a test file carries them. */
+const markersFor = (file: string) => (TEST_FILE.test(file) ? MARKERS : []);
 
-/** Every added-line marker, test file or not. */
-const ALL_MARKERS = [...DISABLED_MARKERS, ...TEST_FILE_MARKERS];
+/** A quoted span: a marker inside it is prose or a fixture string, not a call. */
+const QUOTED = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
 
-/** The markers that apply to an added line of `file`. */
-const markersFor = (file: string) => (TEST_FILE.test(file) ? ALL_MARKERS : DISABLED_MARKERS);
+/** A line's trailing comment (`#` is one unless it opens a Rust or C attribute). */
+const COMMENT_TAIL = /(?:^|\s)(?:\/\/|#(?!\[))/;
+
+/** A line that opens or continues a block comment. */
+const BLOCK_COMMENT = /^\s*(?:\/\*|\*)/;
+
+/** `line` with its quoted spans and comment removed — the part a marker can be a call in. */
+function stripProse(line: string): string {
+  if (BLOCK_COMMENT.test(line)) return "";
+  const code = line.replace(QUOTED, '""');
+  const cut = code.search(COMMENT_TAIL);
+  return cut === -1 ? code : code.slice(0, cut);
+}
 
 /** An assertion call a change deletes from a test file: `expect(…)`, `assert.equal(…)`, `should(…)`. */
 const ASSERTION = /(?<![\w$])(?:expect|assert\w*|should_\w+|should)\s*[(.]/;
@@ -1139,12 +1153,23 @@ function testAt(body: string | null, line: string, at: number): string {
   return line.trim();
 }
 
-const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
+/** The test a removed line sits in when its file is gone: the nearest removed declaration above it. */
+function goneTestAt(lines: Array<{ at: number; text: string }>, at: number, line: string): string {
+  for (let i = lines.length - 1; i >= 0; i--) {
+    if (lines[i]!.at > at) continue;
+    const name = declaredName(lines[i]!.text);
+    if (name !== null) return name;
+  }
+  return line.trim();
+}
+
+const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
 
 /**
  * The added lines of a `--no-renames` unified diff that disable a test, and the removed
- * assertion lines of a test file the same diff does not add back: each with its new-file
- * line and the test it sits in.
+ * assertion lines of a test file whose added assertion lines no longer outnumber them: each
+ * with its line and the test it sits in. A deleted test file reports its removed assertions
+ * by their old line, since it has no new file left.
  */
 export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
   const out: DisabledTest[] = [];
@@ -1161,42 +1186,74 @@ export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
     }
     return bodies.get(rel)!;
   };
-  /** Trimmed texts of the added lines, so a removed assertion re-added elsewhere is not a drop. */
-  const readded = new Map<string, number>();
+  /** Added assertion lines per test file, so a rewritten or moved assertion is not a drop. */
+  const added = new Map<string, number>();
   const removed: Array<{ file: string; line: number; text: string }> = [];
+  /** Removed lines per file, by their old line — the only body a deleted file has left. */
+  const erased = new Map<string, Array<{ at: number; text: string }>>();
+  /** Files the diff deletes: their `+++` is `/dev/null`, so the `---` path names them. */
+  const deleted = new Set<string>();
   let file = "";
+  let from = "";
   let next = 0;
+  let old = 0;
   for (const raw of diff.split("\n")) {
+    if (raw.startsWith("--- ")) {
+      from = raw.replace(/^--- (a\/)?/, "");
+      continue;
+    }
     if (raw.startsWith("+++ ")) {
-      file = raw.replace(/^\+\+\+ (b\/)?/, "");
+      const plus = raw.replace(/^\+\+\+ (b\/)?/, "");
+      file = plus === "/dev/null" ? from : plus;
+      if (plus === "/dev/null") deleted.add(file);
       continue;
     }
-    if (raw.startsWith("--- ")) continue;
     const hunk = HUNK.exec(raw);
     if (hunk !== null) {
-      next = Number(hunk[1]);
+      old = Number(hunk[1]);
+      next = Number(hunk[2]);
       continue;
     }
     if (raw.startsWith("+")) {
       const text = raw.slice(1);
-      if (markersFor(file).some((m) => m.test(text)))
-        out.push({ file, line: next, test: testAt(body(file), text, next) });
-      const key = text.trim();
-      readded.set(key, (readded.get(key) ?? 0) + 1);
+      if (TEST_FILE.test(file)) {
+        if (markersFor(file).some((m) => m.test(stripProse(text))))
+          out.push({ file, line: next, test: testAt(body(file), text, next) });
+        if (isAssertion(text)) added.set(file, (added.get(file) ?? 0) + 1);
+      }
       next++;
     } else if (raw.startsWith("-")) {
       const text = raw.slice(1);
-      if (TEST_FILE.test(file) && isAssertion(text)) removed.push({ file, line: next, text });
-    } else if (raw.startsWith(" ")) next++;
+      if (TEST_FILE.test(file)) {
+        const lines = erased.get(file) ?? [];
+        lines.push({ at: old, text });
+        erased.set(file, lines);
+        if (isAssertion(text)) removed.push({ file, line: deleted.has(file) ? old : next, text });
+      }
+      old++;
+    } else if (raw.startsWith(" ")) {
+      next++;
+      old++;
+    }
   }
+  /** Removed assertions per file, in diff order: a file reports only its net drop. */
+  const drops = new Map<string, Array<{ file: string; line: number; text: string }>>();
   for (const r of removed) {
-    const key = r.text.trim();
-    const left = readded.get(key) ?? 0;
-    if (left > 0) {
-      readded.set(key, left - 1);
-      continue;
-    }
-    out.push({ file: r.file, line: r.line, test: testAt(body(r.file), r.text, r.line) });
+    const list = drops.get(r.file) ?? [];
+    list.push(r);
+    drops.set(r.file, list);
+  }
+  for (const [rel, list] of drops) {
+    const excess = list.length - (added.get(rel) ?? 0);
+    if (excess <= 0) continue;
+    for (const r of list.slice(list.length - excess))
+      out.push({
+        file: r.file,
+        line: r.line,
+        test: deleted.has(rel)
+          ? goneTestAt(erased.get(rel) ?? [], r.line, r.text)
+          : testAt(body(rel), r.text, r.line),
+      });
   }
   return out;
 }
@@ -2314,7 +2371,7 @@ export const branchesCommand: CommandSpec = {
         {
           name: "disabled-tests",
           type: "boolean",
-          help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, a test file's `@pytest.mark.skip` / `@unittest.skip`) or a test file drops an assertion no line adds back; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+          help: "an added line of a test file disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside a comment or a quoted span, or a test file's removed assertions outweigh the ones the diff adds back — a deleted test file included; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
         },
         {
           name: "expect-none",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 355c43390..f0998f3f8 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1371,7 +1371,7 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `locks` | `acquire`, `release` | per-feature `.lock` |
 | `workflows` | `start`, `fail`, `handover`, `close`, `promote`, `links`, `input` | `workflow-started` (resume facts: `lastDoneStep`, `openDecision`; `--branch` refuses another checked-out branch, exit 15; ship clears stale sentinels); the Failure Path (`fail`: row, rebase abort, lock, sentinels, labels, failure comment; `handover --list-stray` lists paths outside the run's logs; `handover --push` / ship's `--flush`); `close` (compliance grade, `workflow-done`, telemetry, report, artifact links, `--outbox`, `--message` commit; ship's `--flush` lands on dev; `--final-return` prints the run's last message: summary (`--summary-file`, or `--summary` + `--summary-missing` when it may be absent), issue link, suggested replies, tips; `--session-dir` deletes the session folder, `fail` too); design / plan canonical promotion (`promote`), close links (`links`), the run's input file (`input`: session prompt, issue text, design / plan / audit reports) |
 | `worktrees` | `setup`, `remove` | Step 2 worktree create / resume / adopt (`--detect` asks the runtime), copy, install, ship's `branchWarning`; teardown |
-| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line disables a test or a test file loses an assertion, 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
+| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line of a test file disables a test (a marker inside a comment or a quoted span is not one) or a test file's removed assertions outweigh the ones the diff adds back (a deleted test file included), 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
 | `prs` | `open`, `probe`, `merge`, `update-branch`, `checks`, `verbose-ci`, `scan-body`, `cross-check`, `transport-row` | PR create (`open --file --workflow`: an `engine-action` row reuses the PR on a re-run) / lookup, squash merge (empty body, `--match-head`, auto-route suffix from `--label`), server-side base refresh, check-rollup classification (green when present and none failed/pending), debug's verbose-CI title, close-transport audit (`transport-row --scan --cross-check`) |
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 3ebfcae6f..63e43432d 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -860,20 +860,33 @@ const NOT_CODE = [":(exclude)docs/plans", ":(exclude)docs/*.jsonl", ":(exclude).
 /** A test file's name at any tier: unit, integration, E2E. */
 const TEST_FILE = /\.(?:test|spec)\.|_test\.|(^|\/)test_[^/]*\.py$/;
 /** Added-line markers that disable a test: `bkit-slop-type-suppression.mjs`'s set, widened. */
-const DISABLED_MARKERS = [
+const MARKERS = [
     /\b(?:describe|context|it|test|suite|bench)\.(?:skip|todo|fixme)\b/,
     /(?<!\.)\bx(?:it|describe|test|context)\s*\(/,
     /\bxfail\b/,
     /\bt\.Skip\(/,
     /#\[ignore\b/,
     /@Disabled\b/,
+    /@pytest\.mark\.skip\b/,
+    /@unittest\.skip\b/,
+    /\.skip\s*\(/,
 ];
-/** Added-line markers only a test file carries: Python's decorators and a bare `skip` call. */
-const TEST_FILE_MARKERS = [/@pytest\.mark\.skip\b/, /@unittest\.skip\b/, /\.skip\s*\(/];
-/** Every added-line marker, test file or not. */
-const ALL_MARKERS = [...DISABLED_MARKERS, ...TEST_FILE_MARKERS];
-/** The markers that apply to an added line of `file`. */
-const markersFor = (file) => (TEST_FILE.test(file) ? ALL_MARKERS : DISABLED_MARKERS);
+/** The markers that apply to an added line of `file`: only a test file carries them. */
+const markersFor = (file) => (TEST_FILE.test(file) ? MARKERS : []);
+/** A quoted span: a marker inside it is prose or a fixture string, not a call. */
+const QUOTED = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
+/** A line's trailing comment (`#` is one unless it opens a Rust or C attribute). */
+const COMMENT_TAIL = /(?:^|\s)(?:\/\/|#(?!\[))/;
+/** A line that opens or continues a block comment. */
+const BLOCK_COMMENT = /^\s*(?:\/\*|\*)/;
+/** `line` with its quoted spans and comment removed — the part a marker can be a call in. */
+function stripProse(line) {
+    if (BLOCK_COMMENT.test(line))
+        return "";
+    const code = line.replace(QUOTED, '""');
+    const cut = code.search(COMMENT_TAIL);
+    return cut === -1 ? code : code.slice(0, cut);
+}
 /** An assertion call a change deletes from a test file: `expect(…)`, `assert.equal(…)`, `should(…)`. */
 const ASSERTION = /(?<![\w$])(?:expect|assert\w*|should_\w+|should)\s*[(.]/;
 /** Python's bare `assert x` statement, which calls nothing but asserts. */
@@ -920,11 +933,23 @@ function testAt(body, line, at) {
     }
     return line.trim();
 }
-const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
+/** The test a removed line sits in when its file is gone: the nearest removed declaration above it. */
+function goneTestAt(lines, at, line) {
+    for (let i = lines.length - 1; i >= 0; i--) {
+        if (lines[i].at > at)
+            continue;
+        const name = declaredName(lines[i].text);
+        if (name !== null)
+            return name;
+    }
+    return line.trim();
+}
+const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
 /**
  * The added lines of a `--no-renames` unified diff that disable a test, and the removed
- * assertion lines of a test file the same diff does not add back: each with its new-file
- * line and the test it sits in.
+ * assertion lines of a test file whose added assertion lines no longer outnumber them: each
+ * with its line and the test it sits in. A deleted test file reports its removed assertions
+ * by their old line, since it has no new file left.
  */
 export function disabledTestsIn(diff, root) {
     const out = [];
@@ -938,47 +963,80 @@ export function disabledTestsIn(diff, root) {
         }
         return bodies.get(rel);
     };
-    /** Trimmed texts of the added lines, so a removed assertion re-added elsewhere is not a drop. */
-    const readded = new Map();
+    /** Added assertion lines per test file, so a rewritten or moved assertion is not a drop. */
+    const added = new Map();
     const removed = [];
+    /** Removed lines per file, by their old line — the only body a deleted file has left. */
+    const erased = new Map();
+    /** Files the diff deletes: their `+++` is `/dev/null`, so the `---` path names them. */
+    const deleted = new Set();
     let file = "";
+    let from = "";
     let next = 0;
+    let old = 0;
     for (const raw of diff.split("\n")) {
-        if (raw.startsWith("+++ ")) {
-            file = raw.replace(/^\+\+\+ (b\/)?/, "");
+        if (raw.startsWith("--- ")) {
+            from = raw.replace(/^--- (a\/)?/, "");
             continue;
         }
-        if (raw.startsWith("--- "))
+        if (raw.startsWith("+++ ")) {
+            const plus = raw.replace(/^\+\+\+ (b\/)?/, "");
+            file = plus === "/dev/null" ? from : plus;
+            if (plus === "/dev/null")
+                deleted.add(file);
             continue;
+        }
         const hunk = HUNK.exec(raw);
         if (hunk !== null) {
-            next = Number(hunk[1]);
+            old = Number(hunk[1]);
+            next = Number(hunk[2]);
             continue;
         }
         if (raw.startsWith("+")) {
             const text = raw.slice(1);
-            if (markersFor(file).some((m) => m.test(text)))
-                out.push({ file, line: next, test: testAt(body(file), text, next) });
-            const key = text.trim();
-            readded.set(key, (readded.get(key) ?? 0) + 1);
+            if (TEST_FILE.test(file)) {
+                if (markersFor(file).some((m) => m.test(stripProse(text))))
+                    out.push({ file, line: next, test: testAt(body(file), text, next) });
+                if (isAssertion(text))
+                    added.set(file, (added.get(file) ?? 0) + 1);
+            }
             next++;
         }
         else if (raw.startsWith("-")) {
             const text = raw.slice(1);
-            if (TEST_FILE.test(file) && isAssertion(text))
-                removed.push({ file, line: next, text });
+            if (TEST_FILE.test(file)) {
+                const lines = erased.get(file) ?? [];
+                lines.push({ at: old, text });
+                erased.set(file, lines);
+                if (isAssertion(text))
+                    removed.push({ file, line: deleted.has(file) ? old : next, text });
+            }
+            old++;
         }
-        else if (raw.startsWith(" "))
+        else if (raw.startsWith(" ")) {
             next++;
+            old++;
+        }
     }
+    /** Removed assertions per file, in diff order: a file reports only its net drop. */
+    const drops = new Map();
     for (const r of removed) {
-        const key = r.text.trim();
-        const left = readded.get(key) ?? 0;
-        if (left > 0) {
-            readded.set(key, left - 1);
+        const list = drops.get(r.file) ?? [];
+        list.push(r);
+        drops.set(r.file, list);
+    }
+    for (const [rel, list] of drops) {
+        const excess = list.length - (added.get(rel) ?? 0);
+        if (excess <= 0)
             continue;
-        }
-        out.push({ file: r.file, line: r.line, test: testAt(body(r.file), r.text, r.line) });
+        for (const r of list.slice(list.length - excess))
+            out.push({
+                file: r.file,
+                line: r.line,
+                test: deleted.has(rel)
+                    ? goneTestAt(erased.get(rel) ?? [], r.line, r.text)
+                    : testAt(body(rel), r.text, r.line),
+            });
     }
     return out;
 }
@@ -1922,7 +1980,7 @@ export const branchesCommand = {
                 {
                     name: "disabled-tests",
                     type: "boolean",
-                    help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, a test file's `@pytest.mark.skip` / `@unittest.skip`) or a test file drops an assertion no line adds back; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+                    help: "an added line of a test file disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside a comment or a quoted span, or a test file's removed assertions outweigh the ones the diff adds back — a deleted test file included; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
                 },
                 {
                     name: "expect-none",
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 4d30fa7fd..969e22a91 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -322,3 +322,4 @@
 {"schema":3,"ts":1793110852612,"kind":"knowledge","key":"plan-derived-test-matrix-needs-a-task-column","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/challenge.ts",".bkit/core/docs/templates/bkit-plan.md"],"summary":"`bkit tests plan-check` refuses a `Derived Test Matrix` header with no `Task` column, so every matrix the build writes (converted, challenge-merged, Fix now) carries one cell naming exactly one runbook task","description":"- **Category:** process\n- **Symptom:** `bkit tests plan-check` exits 1 with `the Derived Test Matrix header has no `Task` column`, then `Derived Test Matrix row maps to no task`, `maps to TASK {n}, which the plan does not define`, or `TASK {n} names TEST FIRST tests but no Derived Test Matrix row maps to it`.\n- **Root cause:** the matrix-to-runbook mapping is a plan contract with one right answer, so `plan-check` derives it from the table; a plan converted from an issue body carries the issue's three-column matrix (`Test description | Type | Target file`) with no mapping, and a task appended later (challenge merge, Decision Pause Fix now) adds its test to `TEST FIRST` without a row.\n- **Fix or rule:** write the matrix as `Test description | Type | Target file | Task`, one task number per row, and append one row per test every later task adds; `bkit challenge merge` and the Fix-now task writer add both together.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The issue's change shape carries a three-column matrix while the plan's table is the runbook's coverage map; converting one to the other adds the column only if the writer knows the mapping is checked.","remediation":"Give the table a `Task` column, name one defined task per row, and add a row beside every test a later task appends; run `bkit tests plan-check` after any plan write."}
 {"schema":3,"ts":1793140927438,"kind":"knowledge","key":"scan-diff-removal-case-diffs-a-commit-not-the-branch","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"summary":"A removal-only case for `bkit branches scan-diff --disabled-tests` must diff a commit whose parent already holds the test file: against `origin/dev` a file the branch itself creates nets to a pure addition, so the deleted line never appears and the test false-greens","description":"- **Category:** tooling\n- **Symptom:** a `branches.test.ts` case asserting that a removed test-file line is (or is not) reported passes while the scanner still over-reports, and the same case fails for the wrong reason after a `--base` change.\n- **Root cause:** `--base=origin/dev` diffs the whole branch, so a test file added inside the branch shows as one `+` block with its final content; a line added in an earlier commit and deleted in a later one is net-absent from the diff and its removal branch never runs.\n- **Fix or rule:** give the fixture a commit holding the file first, then diff `--base=HEAD~1` (or a base that already carries the file) so the deletion appears as a `-` line; keep `origin/dev` for added-marker cases.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Git's diff is per range, not per commit: a line that exists only between two commits of the range cancels out, so a removal-only assertion has nothing to read.","remediation":"Seed the file in an earlier commit and diff `--base=HEAD~1`, or land the file on `dev` before branching."}
 {"schema":3,"ts":1793148317642,"kind":"knowledge","key":"workflow-ledgers-importing-tests-closes-a-steps-cycle","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash-1017"},"references":[".bkit/core/engine/commands/workflow/ledgers.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/engine/commands/workflow/tests.ts"],"summary":"A new `ledgers.ts` -> `tests.ts` import crashes every `bkit` invocation at startup with `ReferenceError: Cannot access 'EXIT_FOREIGN_PATH' before initialization`; `tsc` and the file's own tests stay green, so only a built CLI exposes it","description":"- **Category:** tooling\n- **Symptom:** after adding an import edge between two workflow command modules, `node dist/cli.js help` (and every other verb, `--version` included) dies while loading `dist/commands/workflow/steps.js` with `ReferenceError: Cannot access 'EXIT_FOREIGN_PATH' before initialization`; `pnpm build` passes and the touched test file passes.\n- **Root cause:** `steps.ts` imports `EXIT_FOREIGN_PATH` from `ledgers.ts` and `tests.ts` imports `writeStepRow` from `steps.ts`. An edge `ledgers.ts` -> `tests.ts` closes the cycle `ledgers -> tests -> steps -> ledgers`, so ESM evaluates `steps.js` first and its module-level `exitCodes` object reads the `const` before `ledgers.js` initialises it.\n- **Fix or rule:** never import `tests.js`, `steps.js` or `context.js` from `ledgers.ts`; a value two of them need (e.g. `NO_MARKERS_REASON`) lives in the leaf reader `plan-blocks.ts`, which imports nothing from the command layer. Verify with `pnpm build && node dist/cli.js help` — a cycle that type-checks is only visible on the built CLI.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The workflow command modules are one import graph with a cycle already (steps -> ledgers, tests -> steps); any new edge into that graph reorders ESM evaluation and a module-level read of another module's `const` becomes a TDZ error at startup.","remediation":"Put shared constants and pure readers in a leaf module (`plan-blocks.ts`) and import the command modules only from the layer above them; after any new cross-module import, run the built CLI, not only `pnpm build` and vitest."}
+{"schema":3,"ts":1793151909872,"kind":"knowledge","key":"matrix-row-count-prose-drifts-on-append","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek-v4.1-flash-1017"},"references":["docs/plans/202610/701-engine-work-build-plan.md"],"summary":"A plan's `Derived Test Matrix` row-count prose — the intro sentence's `rows N-M` range and the Verification Plan's \"the N `Derived Test Matrix` rows\" — is hand-written: `tests plan-check` proves every test-bearing task has a row but never checks the stated total, so appended rows leave both sentences stale","description":"- **Category:** docs\n- **Symptom:** after appending `Derived Test Matrix` rows to a plan, `node dist/cli.js tests plan-check --plan=...` exits 0 with `problems: []`, yet the table's intro sentence still ends its row range at the old last row and the Verification Plan still reads `the {old count} Derived Test Matrix rows`.\n- **Root cause:** the engine computes each row's `Task` mapping but not the prose count; both count sentences are authored text in the plan.\n- **Fix or rule:** when adding matrix rows, update the intro sentence's row range and the Verification Plan's row count in the same edit. Verify the total by counting table body rows between the `### Derived Test Matrix` heading and the next heading, minus the header and separator lines.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The plan format carries the row-to-task mapping in the `Task` column (engine-checked) but its row-count prose in two hand-written sentences (not checked), so the two drift independently.","remediation":"Edit both count sentences whenever the matrix gains or loses rows; `tests plan-check` proves mapping only, not the stated total."}
diff --git a/docs/testing.md b/docs/testing.md
index a5a7f9a43..649821bf7 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -616,7 +616,7 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed, `--lock-held`, `lastDoneStep` and the run's own `OPEN` decision as `openDecision` on a resume; failed row, own-lock release, rebase abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused push keeping the record in the book with exit 10); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs). |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `update-branch` then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: an added `.skip` / `@Disabled` / `t.Skip()`, and a test file's `@pytest.mark.skip` / `@unittest.skip` / bare `.skip(`, exits 1 with each hit's `file:line` and the test it sits in, a diff adding none exits 0 with an empty `disabled`; a removed comment, a removed non-assertion statement and an assertion re-added in the same diff are not reported, a removed assertion no line re-adds is. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `update-branch` then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: an added test-file line with `.skip` / `@Disabled` / `t.Skip()` / `@pytest.mark.skip` / `@unittest.skip` / bare `.skip(` exits 1 with each hit's `file:line` and the test it sits in, a diff adding none exits 0 with an empty `disabled`; a quoted marker in a docs or source file, a commented-out one, a removed comment, a removed non-assertion statement, a moved assertion, a rewritten expectation, and a replaced assertion are not reported; a test file whose removed assertions outweigh its added ones is, and one the diff deletes outright reports its removed assertions by old line. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
