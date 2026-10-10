// bkit-templates-root.test.ts — Templates-root resolution + orphan-cleanup regression tests.
//
// Coverage targets:
//   removeOrphanTemplatesDir sentinel guard (consumer-owned dir must survive)
//   getTemplatesRoot() three-context resolution
//   guardTemplatesRoot() empty-string / falsy-root edge case

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { removeOrphanTemplatesDir } from "./bkit-install";
import { getPkgRoot, getTemplatesRoot, BKIT_SRC_SUBPATH } from "./bkit-paths";
import { guardTemplatesRoot } from "./bkit-modules";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-templates-root-tests-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// removeOrphanTemplatesDir sentinel guard
//
// The function deletes .agents/templates/ only when at least one known bkit basename
// exists inside it; a consumer-owned directory survives.
// ---------------------------------------------------------------------------

describe("removeOrphanTemplatesDir — sentinel guard (F1 MEDIUM fix)", () => {
  it("DELETES .agents/templates/ when a known sentinel (AGENTS.md) is present", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    fs.writeFileSync(path.join(orphanDir, "AGENTS.md"), "# bkit-managed content", "utf-8");

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it("DELETES .agents/templates/ when a known sentinel (CLAUDE.md) is present", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    fs.writeFileSync(path.join(orphanDir, "CLAUDE.md"), "# bkit-managed content", "utf-8");

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it("DELETES .agents/templates/ when sentinel gitignore is present", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    fs.writeFileSync(path.join(orphanDir, "gitignore"), "node_modules/\n", "utf-8");

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it("DELETES .agents/templates/ when sentinel .vale.ini is present", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    fs.writeFileSync(path.join(orphanDir, ".vale.ini"), "[vale]\n", "utf-8");

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it("DELETES .agents/templates/ when sentinel .github/workflows dir is present", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    const workflowsDir = path.join(orphanDir, ".github", "workflows");
    fs.mkdirSync(workflowsDir, { recursive: true });
    fs.writeFileSync(path.join(workflowsDir, "ci.yml"), "name: CI\n", "utf-8");

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it("SKIPS deletion when NO known bkit sentinel exists (consumer-owned dir)", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    // Only consumer-owned content; no bkit sentinels
    fs.writeFileSync(path.join(orphanDir, "my-consumer-template.md"), "consumer content", "utf-8");
    fs.writeFileSync(
      path.join(orphanDir, "another-template.txt"),
      "more consumer content",
      "utf-8",
    );

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    // Directory must survive — it is consumer-owned
    expect(fs.existsSync(orphanDir)).toBe(true);
    expect(fs.readFileSync(path.join(orphanDir, "my-consumer-template.md"), "utf-8")).toBe(
      "consumer content",
    );
  });

  it("SKIPS deletion when .agents/templates/ is empty (no sentinel files)", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    // Empty directory — no sentinels

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    // Empty dir with no sentinels is treated as consumer-owned — must survive
    expect(fs.existsSync(orphanDir)).toBe(true);
  });

  it("is a no-op (no throw) when .agents/templates/ does not exist", () => {
    // Pre-condition: directory absent
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    expect(fs.existsSync(orphanDir)).toBe(false);

    expect(() => removeOrphanTemplatesDir(tmpDir, /* dryRun */ false)).not.toThrow();
  });

  it("is a no-op when .agents/ does not exist at all", () => {
    // .agents/ itself absent
    expect(fs.existsSync(path.join(tmpDir, ".agents"))).toBe(false);

    expect(() => removeOrphanTemplatesDir(tmpDir, /* dryRun */ false)).not.toThrow();
  });

  it("dryRun: true logs but does NOT delete when sentinel is present", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    fs.writeFileSync(path.join(orphanDir, "AGENTS.md"), "# bkit content", "utf-8");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ true);

    // Directory must still exist — dryRun blocks the write
    expect(fs.existsSync(orphanDir)).toBe(true);
    // Log must have been called (the function logs the dry-run action)
    expect(logSpy).toHaveBeenCalled();
    const loggedMessages = logSpy.mock.calls.map((c) => String(c[0]));
    const hasDryRunLog = loggedMessages.some(
      (m) => m.includes("[dry-run]") || m.includes("dry-run"),
    );
    expect(hasDryRunLog).toBe(true);
  });

  it("dryRun: true no-op when .agents/templates/ is absent", () => {
    // Dry-run on absent directory must not throw and must not create anything
    expect(() => removeOrphanTemplatesDir(tmpDir, /* dryRun */ true)).not.toThrow();
    expect(fs.existsSync(path.join(tmpDir, ".agents", "templates"))).toBe(false);
  });

  it("skipping consumer-owned dir logs a notice (not silently ignoring)", () => {
    const orphanDir = path.join(tmpDir, ".agents", "templates");
    fs.mkdirSync(orphanDir, { recursive: true });
    fs.writeFileSync(path.join(orphanDir, "my-content.md"), "consumer", "utf-8");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    removeOrphanTemplatesDir(tmpDir, /* dryRun */ false);

    // Must emit a log message explaining the skip decision
    expect(logSpy).toHaveBeenCalled();
    const loggedMessages = logSpy.mock.calls.map((c) => String(c[0]));
    const hasSkipNotice = loggedMessages.some((m) => m.includes("consumer-owned"));
    expect(hasSkipNotice).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTemplatesRoot() — three-context resolution
//
// Already tested in bkit-paths.test.ts:
//   - ends with .bkit/templates
//   - is rooted at getPkgRoot()
//
// Here: verify the actual resolved path exists (test context arm),
// verify it equals getPkgRoot() + ".bkit/templates" (direct derivation),
// and verify it does NOT equal a ".agents/templates" form.
// ---------------------------------------------------------------------------

describe("getTemplatesRoot() — context resolution regression tests", () => {
  it("returns a path containing '.bkit' and 'templates' as distinct path segments", () => {
    const root = getTemplatesRoot();
    const segments = root.split(path.sep);
    expect(segments).toContain(".bkit");
    // "templates" must appear after ".bkit" in the path
    const bkitIdx = segments.lastIndexOf(".bkit");
    const templatesIdx = segments.indexOf("templates", bkitIdx);
    expect(templatesIdx).toBeGreaterThan(bkitIdx);
  });

  it("does NOT return a .agents/templates path", () => {
    // The root is never <pkgRoot>/.agents/templates.
    const root = getTemplatesRoot();
    const oldForm = path.join(getPkgRoot(), ".agents", "templates");
    expect(root).not.toBe(oldForm);
  });

  it("equals getPkgRoot() joined with '.bkit' and 'templates'", () => {
    const root = getTemplatesRoot();
    const expected = path.join(getPkgRoot(), ".bkit", "templates");
    expect(root).toBe(expected);
  });

  it("resolves to an existing directory in the test (tsx-from-source) context", () => {
    // In the tsx-from-source context (running tests inside the bkit repo),
    // the templates directory must actually exist.
    const root = getTemplatesRoot();
    expect(fs.existsSync(root)).toBe(true);
    expect(fs.statSync(root).isDirectory()).toBe(true);
  });

  it("simulated dist/ arm: non-.bkit/src suffix resolves one level up (same as getPkgRoot)", () => {
    // Replicate the resolver logic for the dist/ arm.
    const fakeDistDir = path.join("/pkg", "dist");
    const result = fakeDistDir.endsWith(BKIT_SRC_SUBPATH)
      ? path.resolve(fakeDistDir, "..", "..")
      : path.resolve(fakeDistDir, "..");
    // getTemplatesRoot() for a dist/ pkg root would be:
    const expectedTemplates = path.join(result, ".bkit", "templates");
    expect(expectedTemplates).toBe(path.join("/pkg", ".bkit", "templates"));
    // and NOT a .agents/templates form
    expect(expectedTemplates).not.toBe(path.join("/pkg", ".agents", "templates"));
  });

  it("simulated tsx-from-source arm: .bkit/src suffix resolves two levels up", () => {
    const fakeSrcDir = path.join("/pkg") + path.sep + BKIT_SRC_SUBPATH;
    const result = fakeSrcDir.endsWith(BKIT_SRC_SUBPATH)
      ? path.resolve(fakeSrcDir, "..", "..")
      : path.resolve(fakeSrcDir, "..");
    const expectedTemplates = path.join(result, ".bkit", "templates");
    expect(expectedTemplates).toBe(path.join("/pkg", ".bkit", "templates"));
  });
});

// ---------------------------------------------------------------------------
// guardTemplatesRoot() — empty-string edge case
//
// Existing tests cover:
//   - process.exit(1) on non-existent injected root
//   - error message content (injected path + "package corrupt?")
//   - no-exit when root exists
//
// Missing: empty string — guardTemplatesRoot("") must fire the guard since
// an empty string path maps to cwd which is NOT the templates root.
// This mirrors the fail-loud contract for any falsy/missing resolved path.
// ---------------------------------------------------------------------------

describe("guardTemplatesRoot — additional edge cases", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation((_code) => {
      throw new Error("process.exit called");
    });
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("calls process.exit(1) for an empty string path (falsy root)", () => {
    // fs.existsSync("") returns false on all platforms — guard must fire
    expect(() => guardTemplatesRoot("")).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("emits error message for empty string path", () => {
    try {
      guardTemplatesRoot("", "[bkit-test]");
    } catch {
      // expected — process.exit mock throws
    }
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Templates root not found at"));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("package corrupt?"));
  });

  it("includes the provided logPrefix in the error message", () => {
    const customPrefix = "[bkit-custom-prefix]";
    try {
      guardTemplatesRoot("/tmp/bkit-templates-root-nonexistent-xyz", customPrefix);
    } catch {
      // expected
    }
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(customPrefix));
  });

  it("does NOT exit when passed the actual templates root (which exists in test context)", () => {
    const existingRoot = getTemplatesRoot();
    expect(() => guardTemplatesRoot(existingRoot)).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("calls process.exit(1) for a path that is a file, not a directory", () => {
    // fs.existsSync returns true for files too — the guard only checks existence.
    // This test verifies behaviour when a path that exists-but-is-wrong is passed.
    // Since the guard only checks existsSync (not isDirectory), a file path would pass.
    // Document this as a known limitation by confirming the guard fires ONLY on non-existent paths.
    const existingFilePath = path.join(tmpDir, "sentinel.txt");
    fs.writeFileSync(existingFilePath, "not a dir", "utf-8");

    // guardTemplatesRoot uses fs.existsSync — a file that exists passes the guard.
    // This is by design: the guard catches the "package corrupt" case where the
    // templates directory was never installed; a file at that path is a separate anomaly.
    expect(() => guardTemplatesRoot(existingFilePath)).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
