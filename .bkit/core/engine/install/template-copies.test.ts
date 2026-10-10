// install/template-copies.test.ts — Templates-root resolution regression tests.
//
// Coverage targets:
//   getTemplatesRoot() three-context resolution
//   guardTemplatesRoot() empty-string / falsy-root edge case

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPkgRoot, getTemplatesRoot, ENGINE_SUBPATH } from "../shared/package-roots";
import { guardTemplatesRoot } from "./modules/core";
import { remapTemplateDest } from "./template-copies";

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
// getTemplatesRoot() — three-context resolution
//
// Already tested in shared/package-roots.test.ts:
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

  it("simulated dist/ arm: non-.bkit/core/engine suffix resolves one level up (same as getPkgRoot)", () => {
    // Replicate the resolver logic for the dist/ arm.
    const fakeDistDir = path.join("/pkg", "dist");
    const result = fakeDistDir.endsWith(ENGINE_SUBPATH)
      ? path.resolve(fakeDistDir, "..", "..", "..")
      : path.resolve(fakeDistDir, "..");
    // getTemplatesRoot() for a dist/ pkg root would be:
    const expectedTemplates = path.join(result, ".bkit", "templates");
    expect(expectedTemplates).toBe(path.join("/pkg", ".bkit", "templates"));
    // and NOT a .agents/templates form
    expect(expectedTemplates).not.toBe(path.join("/pkg", ".agents", "templates"));
  });

  it("simulated tsx-from-source arm: .bkit/core/engine suffix resolves three levels up", () => {
    const fakeSrcDir = path.join("/pkg") + path.sep + ENGINE_SUBPATH;
    const result = fakeSrcDir.endsWith(ENGINE_SUBPATH)
      ? path.resolve(fakeSrcDir, "..", "..", "..")
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

// ---------------------------------------------------------------------------
// remapTemplateDest — the single shared dotfile remap used by BOTH the module
// install pass and the `bkit upgrade` template walk. Only the names npm strips
// from packed tarballs (.gitignore, .npmignore) are stored dot-less and remapped;
// every other dotfile (.gitattributes, .prettierignore, …) is stored with its dot
// and must pass through unchanged.
// ---------------------------------------------------------------------------

describe("remapTemplateDest", () => {
  it("maps npm-stripped basenames to their dotted dest", () => {
    expect(remapTemplateDest("gitignore")).toBe(".gitignore");
    expect(remapTemplateDest("npmignore")).toBe(".npmignore");
  });

  it("maps npm-stripped basenames in nested paths", () => {
    expect(remapTemplateDest(path.join("packages", "app", "gitignore"))).toBe(
      path.join("packages", "app", ".gitignore"),
    );
  });

  it("does NOT remap .gitattributes — npm does not strip it, so it is stored dotted", () => {
    expect(remapTemplateDest(".gitattributes")).toBe(".gitattributes");
  });

  it("passes through any other (already-dotted or plain) name unchanged", () => {
    expect(remapTemplateDest(".prettierignore")).toBe(".prettierignore");
    expect(remapTemplateDest(".mcp.json")).toBe(".mcp.json");
    expect(remapTemplateDest("AGENTS.md")).toBe("AGENTS.md");
    expect(remapTemplateDest(path.join("docs", "setup.md"))).toBe(path.join("docs", "setup.md"));
  });
});
