// install/modules/core.test.ts — Unit tests for the core module.

import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as os from "node:os";
import { guardTemplatesRoot, removeOrphans } from "./core";

// Every non-test source in `dir`, concatenated — read as text to inspect the constant bodies
// without executing the modules (avoids import side-effects and keeps tests fast).
function readSources(dir: string): string {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), "utf-8"))
    .join("\n");
}

const MODULES_SRC = readSources(path.resolve(".bkit/core/engine/install/modules"));

describe("runCoreModule first-install advisory (BAR-141: structured finding)", () => {
  // The first-install message is emitted as a structured PreflightFinding advisory.
  // Check the source uses advisories.push with the correct id.
  it("uses advisories.push (not printSink.push) for first-install message", () => {
    expect(MODULES_SRC).not.toContain("printSink.push");
    expect(MODULES_SRC).toContain("advisories.push");
  });

  it("first-install advisory id is first-install-postinstall-steps", () => {
    expect(MODULES_SRC).toContain("first-install-postinstall-steps");
  });

  it("first-install advisory action does NOT contain onlyBuiltDependencies", () => {
    // Extract the action string from the advisory block
    const match = MODULES_SRC.match(
      /id: "first-install-postinstall-steps"[\s\S]*?action:\s*"([\s\S]*?)",/,
    );
    const action = match ? match[1] : MODULES_SRC;
    expect(action).not.toContain("onlyBuiltDependencies");
  });

  it("first-install advisory action references read:packages scope", () => {
    const startIdx = MODULES_SRC.indexOf("first-install-postinstall-steps");
    const block = MODULES_SRC.slice(startIdx, startIdx + 1500);
    expect(block).toContain("read:packages");
  });
});

// ---------------------------------------------------------------------------
// WS1-T5 — fail-loud templates-root guard (path-agnostic)
//
// This test injects a completely arbitrary non-existent path so the assertion
// remains valid after any future templates-root changes. It does NOT
// hard-code ".bkit/templates" — the guard must fire for ANY missing resolved
// root, not just the current literal.
// ---------------------------------------------------------------------------

describe("guardTemplatesRoot — fail-loud on missing templates root", () => {
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

  it("calls process.exit(1) when the injected root does not exist", () => {
    // Use a clearly non-existent, path-agnostic path — no .agents/templates literal.
    const nonExistentRoot = path.join("/tmp", "bkit-guard-test-nonexistent-root-xyz123");
    expect(() => guardTemplatesRoot(nonExistentRoot)).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("emits the correct error message including the injected path", () => {
    const nonExistentRoot = path.join("/tmp", "bkit-guard-test-nonexistent-root-xyz123");
    try {
      guardTemplatesRoot(nonExistentRoot, "[bkit-modules]");
    } catch {
      // expected
    }
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Templates root not found at"));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(nonExistentRoot));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("package corrupt?"));
  });

  it("does NOT exit when the root exists", () => {
    // Use a real existing path — the repo root is guaranteed to exist.
    const existingRoot = path.resolve(".");
    expect(() => guardTemplatesRoot(existingRoot)).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});

describe("removeOrphans — prune stale bkit mirror files, allowlisted dirs only", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-orphans-"));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function seed(dir: string, files: string[]): void {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.writeFileSync(path.join(dir, f), "x");
  }

  it("removes prefixed .md files absent from the source set and keeps the rest", () => {
    seed(".claude/agents", ["bkit-keep.md", "bkit-stale.md", "custom.md", "bkit-notes.txt"]);
    const removed = removeOrphans(".claude/agents", new Set(["bkit-keep.md"]), false, "bkit-");
    expect(removed).toEqual(["bkit-stale.md"]);
    expect(fs.readdirSync(".claude/agents").sort()).toEqual([
      "bkit-keep.md",
      "bkit-notes.txt",
      "custom.md",
    ]);
  });

  it("dry-run reports orphans without deleting them", () => {
    seed(".cursor/commands", ["bkit-stale.md"]);
    expect(removeOrphans(".cursor/commands", new Set(), true, "bkit-")).toEqual(["bkit-stale.md"]);
    expect(fs.existsSync(".cursor/commands/bkit-stale.md")).toBe(true);
  });

  it("throws and deletes nothing for a dir outside the allowlist", () => {
    seed("docs", ["bkit-stale.md"]);
    expect(() => removeOrphans("docs", new Set(), false, "bkit-")).toThrow(/outside allowlist/);
    expect(fs.existsSync("docs/bkit-stale.md")).toBe(true);
  });
});
