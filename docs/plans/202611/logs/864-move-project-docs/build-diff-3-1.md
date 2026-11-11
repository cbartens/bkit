diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index 0a51c5b2d..4b4b4ccab 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -28,6 +28,19 @@ const { execSync, execFileSync, spawnSync } = vi.hoisted(() => ({
 
 vi.mock("node:child_process", () => ({ execSync, execFileSync, spawnSync }));
 
+// Pass-through wrapper over node:fs that records every readFileSync path. The module
+// namespace cannot be spied on, so the recording lives in the mock factory instead.
+const { fsReads } = vi.hoisted(() => ({ fsReads: [] as string[] }));
+
+vi.mock("node:fs", async (importOriginal) => {
+  const actual = await importOriginal<typeof import("node:fs")>();
+  const readFileSync = ((...args: Parameters<typeof actual.readFileSync>) => {
+    fsReads.push(String(args[0]));
+    return actual.readFileSync(...args);
+  }) as typeof actual.readFileSync;
+  return { ...actual, readFileSync, default: { ...actual, readFileSync } };
+});
+
 // ---------------------------------------------------------------------------
 // Helpers
 // ---------------------------------------------------------------------------
@@ -573,9 +586,9 @@ describe("detectProjectDocs", () => {
         { doc: "docs/design.md" },
         { doc: "../escape/noise.md", scope: "Equivalent to docs/noise.md" },
       ]);
-      const readSpy = vi.spyOn(fs, "readFileSync");
+      fsReads.length = 0;
       const again = detectProjectDocs(tmpDir);
-      const reads = readSpy.mock.calls.map((c) => String(c[0]));
+      const reads = [...fsReads];
       expect(reads.some((r) => r.startsWith(outside))).toBe(false);
       expect(allText(again)).not.toContain("OUTSIDE-SECRET-CONTENT");
       const ambiguous = again.find((f) => f.id === "project-docs-ambiguous");
@@ -586,4 +599,32 @@ describe("detectProjectDocs", () => {
       fs.rmSync(outside, { recursive: true, force: true });
     }
   });
+
+  it("keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace", () => {
+    writeDoc("handbook/security.md", POPULATED);
+    writeDoc("handbook/ops-testing.md", POPULATED);
+    writeIndex([
+      { doc: "handbook/security.md" },
+      { doc: "handbook/ops-testing.md", scope: "Equivalent to docs/testing.md" },
+    ]);
+    fsReads.length = 0;
+    const findings = detectProjectDocs(tmpDir);
+    const missing = findings.find((f) => f.id === "project-docs-missing");
+    expect(missing).toBeDefined();
+    expect(missing!.detect).not.toContain("docs/security.md");
+    expect(missing!.detect).not.toContain("docs/testing.md");
+    expect(missing!.detect).toContain("docs/architecture.md");
+
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
+    try {
+      fs.writeFileSync(path.join(outside, "noise.md"), "OUTSIDE-SECRET-CONTENT\n".repeat(20));
+      writeIndex([{ doc: "../escape/noise.md", scope: "Equivalent to docs/noise.md" }]);
+      fsReads.length = 0;
+      const again = detectProjectDocs(tmpDir);
+      expect(fsReads.some((r) => r.startsWith(outside))).toBe(false);
+      expect(allText(again)).not.toContain("OUTSIDE-SECRET-CONTENT");
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
 });
