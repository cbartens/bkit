// install/modules/core.test.ts — Unit tests for the core module.

import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as os from "node:os";
import { guardCoreRoot, listMdFiles, removeOrphans } from "./core";
import { CODEX_SKILLS_DIR } from "./codex";
import { ANTIGRAVITY_AGENTS_DIR, ANTIGRAVITY_SKILLS_DIR } from "./antigravity";

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
    expect(match).not.toBeNull();
    const action = match![1];
    expect(action).not.toContain("onlyBuiltDependencies");
  });

  it("first-install advisory action no longer references GitHub Packages install auth", () => {
    const startIdx = MODULES_SRC.indexOf("first-install-postinstall-steps");
    const block = MODULES_SRC.slice(startIdx, startIdx + 1500);
    expect(block).not.toContain("BKIT_GH_TOKEN_INSTALL");
    expect(block).not.toContain("read:packages");
  });
});

// ---------------------------------------------------------------------------
// WS1-T5 — fail-loud core-root guard (path-agnostic)
//
// This test injects a completely arbitrary non-existent path so the assertion
// remains valid after any future core-root changes. It does NOT
// hard-code ".bkit/core" — the guard must fire for ANY missing resolved
// root, not just the current literal.
// ---------------------------------------------------------------------------

describe("guardCoreRoot — fail-loud on missing core root", () => {
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
    expect(() => guardCoreRoot(nonExistentRoot)).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("emits the correct error message including the injected path", () => {
    const nonExistentRoot = path.join("/tmp", "bkit-guard-test-nonexistent-root-xyz123");
    try {
      guardCoreRoot(nonExistentRoot, "[bkit-modules]");
    } catch {
      // expected
    }
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Core root not found at"));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(nonExistentRoot));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("package corrupt?"));
  });

  it("does NOT exit when the root exists", () => {
    // Use a real existing path — the repo root is guaranteed to exist.
    const existingRoot = path.resolve(".");
    expect(() => guardCoreRoot(existingRoot)).not.toThrow();
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

  it("upgrade removes the complexity-split agent mirror", () => {
    // Built from parts: catalog-parity.test.ts refuses the retired name in shipped files.
    const retired = `bkit-plan-complexity-${"split"}.md`;
    const prompts = path.resolve(__dirname, "../../../prompts");
    const sources = new Set(listMdFiles(prompts, "bkit-"));
    seed(".claude/agents", [...sources, retired]);
    expect(removeOrphans(".claude/agents", sources, false, "bkit-")).toEqual([retired]);
    expect(fs.existsSync(`.claude/agents/${retired}`)).toBe(false);
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

  it.each([".opencode/agents", ".opencode/commands", ".agents/plugins/bkit/agents"])(
    "%s: removes a stale bkit-* .md file and keeps the current one",
    (dir) => {
      seed(dir, ["bkit-keep.md", "bkit-stale.md", "custom.md"]);
      expect(removeOrphans(dir, new Set(["bkit-keep.md"]), false, "bkit-")).toEqual([
        "bkit-stale.md",
      ]);
      expect(fs.readdirSync(dir).sort()).toEqual(["bkit-keep.md", "custom.md"]);
    },
  );

  it(".codex/agents: with extension .toml removes a stale bkit-* .toml and keeps the rest", () => {
    seed(".codex/agents", ["bkit-keep.toml", "bkit-stale.toml", "bkit-stale.md", "custom.toml"]);
    const removed = removeOrphans(".codex/agents", new Set(["bkit-keep.toml"]), false, "bkit-", {
      extension: ".toml",
    });
    expect(removed).toEqual(["bkit-stale.toml"]);
    expect(fs.readdirSync(".codex/agents").sort()).toEqual([
      "bkit-keep.toml",
      "bkit-stale.md",
      "custom.toml",
    ]);
  });

  it("an empty extension matches every bkit-* entry whatever its suffix", () => {
    seed(".agents/plugins/bkit/agents", [
      "bkit-keep.md",
      "bkit-stale.md",
      "bkit-stale.txt",
      "x.md",
    ]);
    const removed = removeOrphans(
      ".agents/plugins/bkit/agents",
      new Set(["bkit-keep.md"]),
      false,
      "bkit-",
      { extension: "" },
    );
    expect(removed.sort()).toEqual(["bkit-stale.md", "bkit-stale.txt"]);
    expect(fs.readdirSync(".agents/plugins/bkit/agents").sort()).toEqual(["bkit-keep.md", "x.md"]);
  });

  describe("wholeFolders mode — skill folders removed recursively", () => {
    function seedSkills(dir: string): void {
      for (const d of ["bkit-keep", "bkit-stale", "third-party"]) {
        fs.mkdirSync(path.join(dir, d), { recursive: true });
        fs.writeFileSync(path.join(dir, d, "SKILL.md"), "x");
      }
    }

    it.each([".agents/skills", ".agents/plugins/bkit/skills"])(
      "%s: removes a stale bkit-* folder with its contents and keeps current and foreign ones",
      (dir) => {
        seedSkills(dir);
        const removed = removeOrphans(dir, new Set(["bkit-keep"]), false, "bkit-", {
          wholeFolders: true,
        });
        expect(removed).toEqual(["bkit-stale"]);
        expect(fs.readdirSync(dir).sort()).toEqual(["bkit-keep", "third-party"]);
      },
    );

    it("dry-run reports the stale folder without deleting it", () => {
      seedSkills(".agents/skills");
      const removed = removeOrphans(".agents/skills", new Set(["bkit-keep"]), true, "bkit-", {
        wholeFolders: true,
      });
      expect(removed).toEqual(["bkit-stale"]);
      expect(fs.existsSync(".agents/skills/bkit-stale/SKILL.md")).toBe(true);
    });

    it("returns nothing when the folder does not exist", () => {
      expect(
        removeOrphans(".agents/skills", new Set(), false, "bkit-", { wholeFolders: true }),
      ).toEqual([]);
    });

    it("throws and deletes nothing for a folder outside the allowlist", () => {
      seedSkills("skills");
      expect(() =>
        removeOrphans("skills", new Set(), false, "bkit-", { wholeFolders: true }),
      ).toThrow(/outside allowlist/);
      expect(fs.existsSync("skills/bkit-stale/SKILL.md")).toBe(true);
    });
  });

  it("accepts the folder constants the host modules sweep", () => {
    for (const dir of [CODEX_SKILLS_DIR, ANTIGRAVITY_AGENTS_DIR, ANTIGRAVITY_SKILLS_DIR]) {
      expect(removeOrphans(dir, new Set(), true, "bkit-", { wholeFolders: true })).toEqual([]);
    }
  });

  it("dry-run with the extension option reports without deleting", () => {
    seed(".codex/agents", ["bkit-stale.toml"]);
    expect(
      removeOrphans(".codex/agents", new Set(), true, "bkit-", { extension: ".toml" }),
    ).toEqual(["bkit-stale.toml"]);
    expect(fs.existsSync(".codex/agents/bkit-stale.toml")).toBe(true);
  });
});
