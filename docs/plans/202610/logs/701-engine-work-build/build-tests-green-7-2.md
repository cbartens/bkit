Enforced: true
Gaps: 2
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 12 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage keeps an own-cycle deferral exempt" | recorded 2026-10-27T22:34:05Z | no | passed |
| 13 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff ignores a removed comment in a test file" | recorded 2026-10-27T22:37:12Z | yes | passed |
| 13 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff ignores an assertion moved within the file" | recorded 2026-10-27T22:37:54Z | yes | passed |
| 14 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff finds an added pytest mark skip" | missing | — | passed |

## Gaps

- Task 13 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "scan-diff ignores a removed comment in a test file" (diff below)
- Task 13 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "scan-diff ignores an assertion moved within the file" (diff below)

## Test exceptions

- Task 14 — honoured; cleared `no-red` for `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff finds an added pytest mark skip"

## Diff since red — Task 13 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-7-13-1.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 75b96c792..7ba8ca8e8 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-7-13-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1661,16 +1661,73 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     write(
       clone,
       "src/a.test.ts",
-      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join("\n"),
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join(
+        "\n",
+      ),
     );
     commit(clone, {}, "test");
-    write(clone, "src/a.test.ts", ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"));
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
+    );
     commit(clone, {}, "drop");
     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
     expect(r.code).toBe(1);
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
   });
 
+  it("scan-diff finds an added pytest mark skip", async () => {
+    const { clone } = featureBranch("scan-disabled-pytest");
+    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "tests/test_a.py",
+      ['@pytest.mark.skip(reason="flaky")', "def test_a():", "    assert 1 == 1", ""].join("\n"),
+    );
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 1, test: "test_a" }]);
+  });
+
+  it("scan-diff finds an added unittest skip", async () => {
+    const { clone } = featureBranch("scan-disabled-unittest");
+    const body = (decorator: string[]) =>
+      [
+        "import unittest",
+        "",
+        "class A(unittest.TestCase):",
+        ...decorator,
+        "    def test_a(self):",
+        "        self.assertEqual(1, 1)",
+        "",
+      ].join("\n");
+    write(clone, "tests/test_a.py", body([]));
+    commit(clone, {}, "test");
+    write(clone, "tests/test_a.py", body(['    @unittest.skip("flaky")']));
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 4, test: "test_a" }]);
+  });
+
+  it("scan-diff finds an added bare skip call", async () => {
+    const { clone } = featureBranch("scan-disabled-pyskip");
+    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "tests/test_a.py",
+      ["def test_a():", '    pytest.skip("flaky")', "    assert 1 == 1", ""].join("\n"),
+    );
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 2, test: "test_a" }]);
+  });
+
   it("needs exactly one of --paths, --marker, --code; an unknown base exits 23", async () => {
     const { clone } = featureBranch("scan-usage");
     expect((await run(clone, ["scan-diff", "--base=origin/dev"])).code).toBe(2);
```

## Diff since red — Task 13 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-7-13-2.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 75b96c792..7ba8ca8e8 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-7-13-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1661,16 +1661,73 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     write(
       clone,
       "src/a.test.ts",
-      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join("\n"),
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join(
+        "\n",
+      ),
     );
     commit(clone, {}, "test");
-    write(clone, "src/a.test.ts", ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"));
+    write(
+      clone,
+      "src/a.test.ts",
+      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
+    );
     commit(clone, {}, "drop");
     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
     expect(r.code).toBe(1);
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
   });
 
+  it("scan-diff finds an added pytest mark skip", async () => {
+    const { clone } = featureBranch("scan-disabled-pytest");
+    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "tests/test_a.py",
+      ['@pytest.mark.skip(reason="flaky")', "def test_a():", "    assert 1 == 1", ""].join("\n"),
+    );
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 1, test: "test_a" }]);
+  });
+
+  it("scan-diff finds an added unittest skip", async () => {
+    const { clone } = featureBranch("scan-disabled-unittest");
+    const body = (decorator: string[]) =>
+      [
+        "import unittest",
+        "",
+        "class A(unittest.TestCase):",
+        ...decorator,
+        "    def test_a(self):",
+        "        self.assertEqual(1, 1)",
+        "",
+      ].join("\n");
+    write(clone, "tests/test_a.py", body([]));
+    commit(clone, {}, "test");
+    write(clone, "tests/test_a.py", body(['    @unittest.skip("flaky")']));
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 4, test: "test_a" }]);
+  });
+
+  it("scan-diff finds an added bare skip call", async () => {
+    const { clone } = featureBranch("scan-disabled-pyskip");
+    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
+    commit(clone, {}, "test");
+    write(
+      clone,
+      "tests/test_a.py",
+      ["def test_a():", '    pytest.skip("flaky")', "    assert 1 == 1", ""].join("\n"),
+    );
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 2, test: "test_a" }]);
+  });
+
   it("needs exactly one of --paths, --marker, --code; an unknown base exits 23", async () => {
     const { clone } = featureBranch("scan-usage");
     expect((await run(clone, ["scan-diff", "--base=origin/dev"])).code).toBe(2);
```
