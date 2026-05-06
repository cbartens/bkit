import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PreflightFinding } from "./bkit-preflight";
import {
  writeTier1,
  writeTier2,
  writeTier3,
  ensurePackageJsonScripts,
  ensurePackageJsonDevDeps,
  stripManagedBlock,
  type WriteSet,
} from "./bkit-tiers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tiers-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const TOKENS = {
  NODE_VERSION: "22",
  DEFAULT_BRANCH: "main",
  PROJECT_NAME: "test-project",
};

// ---------------------------------------------------------------------------
// Tier 1 — fully managed (idempotent rewrite)
// ---------------------------------------------------------------------------

describe("writeTier1", () => {
  it("writes file when dest missing", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, ".cursor", "hooks.json");
    fs.writeFileSync(src, '{"hooks":[]}\n', "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.existsSync(dst)).toBe(true);
    expect(fs.readFileSync(dst, "utf-8")).toBe('{"hooks":[]}\n');
    expect(ws.writes).toHaveLength(1);
    expect(ws.writes[0]!.path).toBe(dst);
  });

  it("rewrites file when dest exists with different content (idempotent rewrite)", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    fs.writeFileSync(src, '{"hooks":["new"]}\n', "utf-8");
    fs.writeFileSync(dst, '{"hooks":["old"]}\n', "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.readFileSync(dst, "utf-8")).toBe('{"hooks":["new"]}\n');
    expect(ws.writes).toHaveLength(1);
  });

  it("no-op when dest matches src (idempotent — no double-count)", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    const content = '{"hooks":[]}\n';
    fs.writeFileSync(src, content, "utf-8");
    fs.writeFileSync(dst, content, "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(ws.writes).toHaveLength(0);
  });

  it("substitutes tokens in dest content", () => {
    const src = path.join(tmpDir, "tpl.yml");
    const dst = path.join(tmpDir, "out.yml");
    fs.writeFileSync(src, "node: {{NODE_VERSION}}\n", "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.readFileSync(dst, "utf-8")).toBe("node: 22\n");
  });

  it("dry-run does not write to disk but records write in WriteSet", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    fs.writeFileSync(src, '{"hooks":[]}\n', "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, true, ws);

    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Tier 2 — managed-block (append if no markers, update if markers present)
// ---------------------------------------------------------------------------

describe("writeTier2 — html-comment markers", () => {
  it("appends block at EOF when dest exists with no markers (consumer content preserved)", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "CLAUDE.md");
    const templateBlock = "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    fs.writeFileSync(src, templateBlock, "utf-8");
    fs.writeFileSync(dst, "# Consumer heading\n\nConsumer content.\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("# Consumer heading");
    expect(result).toContain("Consumer content.");
    expect(result).toContain("<!-- bkit:start -->");
    expect(result).toContain("bkit content");
    expect(result).toContain("<!-- bkit:end -->");
    expect(ws.writes).toHaveLength(1);
  });

  it("updates only bkit block when dest already has markers", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "CLAUDE.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nnew block content\n<!-- bkit:end -->\n", "utf-8");
    fs.writeFileSync(
      dst,
      "# Consumer\n\n<!-- bkit:start -->\nold block\n<!-- bkit:end -->\n\nConsumer extras.\n",
      "utf-8",
    );
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("# Consumer");
    expect(result).toContain("Consumer extras.");
    expect(result).toContain("new block content");
    expect(result).not.toContain("old block");
    expect(ws.writes).toHaveLength(1);
  });

  it("writes whole file when dest is missing", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "new-file.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    expect(fs.existsSync(dst)).toBe(true);
    expect(fs.readFileSync(dst, "utf-8")).toContain("bkit block");
    expect(ws.writes).toHaveLength(1);
  });

  it("dry-run records write without touching disk", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "new-file.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", true, ws);

    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});

describe("writeTier2 — hash-comment markers", () => {
  it("appends block at EOF of existing YAML file with no markers (consumer jobs preserved)", () => {
    const src = path.join(tmpDir, "ci.yml");
    const dst = path.join(tmpDir, "ci-out.yml");
    const templateBlock = "# bkit:start\nbkit-gates:\n  steps: []\n# bkit:end\n";
    fs.writeFileSync(src, templateBlock, "utf-8");
    fs.writeFileSync(
      dst,
      "on: push\njobs:\n  consumer-job:\n    runs-on: ubuntu-latest\n    steps: []\n",
      "utf-8",
    );
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "hash-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("consumer-job:");
    expect(result).toContain("# bkit:start");
    expect(result).toContain("bkit-gates:");
    expect(result).toContain("# bkit:end");
    expect(ws.writes).toHaveLength(1);
  });

  it("updates bkit block when dest YAML already has hash-comment markers", () => {
    const src = path.join(tmpDir, "ci.yml");
    const dst = path.join(tmpDir, "ci-out.yml");
    fs.writeFileSync(src, "# bkit:start\nnew-step: true\n# bkit:end\n", "utf-8");
    fs.writeFileSync(dst, "# bkit:start\nold-step: true\n# bkit:end\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "hash-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("new-step: true");
    expect(result).not.toContain("old-step: true");
    expect(ws.writes).toHaveLength(1);
  });

  it("substitutes tokens inside the appended block", () => {
    const src = path.join(tmpDir, "ci.yml");
    const dst = path.join(tmpDir, "ci-out.yml");
    fs.writeFileSync(src, "# bkit:start\nnode-version: {{NODE_VERSION}}\n# bkit:end\n", "utf-8");
    fs.writeFileSync(dst, "# existing yaml\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "hash-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("node-version: 22");
    expect(result).not.toContain("{{NODE_VERSION}}");
  });
});

// ---------------------------------------------------------------------------
// Tier 3 — seed-or-print
// ---------------------------------------------------------------------------

describe("writeTier3", () => {
  it("writes file when dest is absent", () => {
    const src = path.join(tmpDir, "slop-scan.config.json");
    const dst = path.join(tmpDir, "slop-scan-out.json");
    fs.writeFileSync(src, '{"patterns":[]}\n', "utf-8");
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();

    const result = writeTier3(src, dst, false, advisories, ws);

    expect(result.wrote).toBe(true);
    expect(result.suggested).toBe(false);
    expect(fs.existsSync(dst)).toBe(true);
    expect(ws.writes).toHaveLength(1);
  });

  it("does NOT write when dest exists; pushes suggested diff to advisories", () => {
    const src = path.join(tmpDir, "slop-scan.config.json");
    const dst = path.join(tmpDir, "slop-scan-out.json");
    fs.writeFileSync(src, '{"patterns":["new"]}\n', "utf-8");
    fs.writeFileSync(dst, '{"patterns":["existing"]}\n', "utf-8");
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();

    const result = writeTier3(src, dst, false, advisories, ws);

    expect(result.wrote).toBe(false);
    expect(result.suggested).toBe(true);
    expect(fs.readFileSync(dst, "utf-8")).toBe('{"patterns":["existing"]}\n');
    expect(advisories.length).toBeGreaterThan(0);
    expect(ws.writes).toHaveLength(0);
  });

  it("dry-run: absent file → records would-be write in WriteSet without touching disk", () => {
    const src = path.join(tmpDir, "cfg.json");
    const dst = path.join(tmpDir, "cfg-out.json");
    fs.writeFileSync(src, '{"a":1}\n', "utf-8");
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();

    const result = writeTier3(src, dst, true, advisories, ws);

    expect(result.wrote).toBe(false); // dry-run: didn't actually write
    expect(result.suggested).toBe(false);
    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ensurePackageJsonScripts — managed package.json scripts
// ---------------------------------------------------------------------------

describe("ensurePackageJsonScripts", () => {
  function writePkg(content: object | string): void {
    const body = typeof content === "string" ? content : JSON.stringify(content, null, 2) + "\n";
    fs.writeFileSync("package.json", body, "utf-8");
  }

  function readPkg(): { scripts?: Record<string, string>; [k: string]: unknown } {
    return JSON.parse(fs.readFileSync("package.json", "utf-8"));
  }

  it("returns missingPkg=true when package.json does not exist", () => {
    const ws = makeWriteSet();
    const result = ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws);
    expect(result.missingPkg).toBe(true);
    expect(result.added).toEqual([]);
    expect(ws.writes).toHaveLength(0);
  });

  it("returns malformed=true when package.json is invalid JSON", () => {
    fs.writeFileSync("package.json", "{ not valid json", "utf-8");
    const ws = makeWriteSet();
    const result = ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws);
    expect(result.malformed).toBe(true);
    expect(result.missingPkg).toBe(false);
    expect(ws.writes).toHaveLength(0);
  });

  it("seeds scripts block when absent", () => {
    writePkg({ name: "x", version: "1.0.0" });
    const ws = makeWriteSet();
    const result = ensurePackageJsonScripts(
      { typecheck: "tsc --noEmit", "format:check": "prettier --check ." },
      false,
      ws,
    );
    expect(result.added).toEqual(["typecheck", "format:check"]);
    expect(result.preserved).toEqual([]);
    expect(ws.writes).toHaveLength(1);
    expect(ws.writes[0]).toEqual({ path: "package.json", action: "update" });
    const pkg = readPkg();
    expect(pkg.scripts).toEqual({
      typecheck: "tsc --noEmit",
      "format:check": "prettier --check .",
    });
  });

  it("adds only missing scripts; preserves existing values verbatim", () => {
    writePkg({
      name: "x",
      version: "1.0.0",
      scripts: { typecheck: "custom-tsc-runner" },
    });
    const ws = makeWriteSet();
    const result = ensurePackageJsonScripts(
      { typecheck: "tsc --noEmit", "lint:slop": "slop-scan scan ." },
      false,
      ws,
    );
    expect(result.added).toEqual(["lint:slop"]);
    expect(result.preserved).toEqual(["typecheck"]);
    const pkg = readPkg();
    expect(pkg.scripts?.typecheck).toBe("custom-tsc-runner");
    expect(pkg.scripts?.["lint:slop"]).toBe("slop-scan scan .");
  });

  it("is a no-op (no write) when all scripts already present", () => {
    writePkg({
      name: "x",
      version: "1.0.0",
      scripts: { typecheck: "tsc --noEmit" },
    });
    const ws = makeWriteSet();
    const result = ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws);
    expect(result.added).toEqual([]);
    expect(result.preserved).toEqual(["typecheck"]);
    expect(ws.writes).toHaveLength(0);
  });

  it("dryRun=true records drift in WriteSet but does not write to disk", () => {
    writePkg({ name: "x", version: "1.0.0" });
    const ws = makeWriteSet();
    const result = ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, true, ws);
    expect(result.added).toEqual(["typecheck"]);
    expect(ws.writes).toHaveLength(1);
    const pkg = readPkg();
    expect(pkg.scripts).toBeUndefined(); // dryRun did NOT write
  });

  it("preserves 4-space indent style of original package.json", () => {
    fs.writeFileSync(
      "package.json",
      JSON.stringify({ name: "x", version: "1.0.0" }, null, 4) + "\n",
      "utf-8",
    );
    const ws = makeWriteSet();
    ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws);
    const raw = fs.readFileSync("package.json", "utf-8");
    // Top-level key indented with 4 spaces (typecheck is nested → 8 spaces).
    expect(raw).toContain('\n    "name"');
    expect(raw).toContain('\n        "typecheck"');
  });

  it("preserves trailing newline of original package.json", () => {
    writePkg({ name: "x", version: "1.0.0" }); // helper writes with trailing \n
    const ws = makeWriteSet();
    ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws);
    const raw = fs.readFileSync("package.json", "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
  });

  it("is idempotent across two consecutive runs", () => {
    writePkg({ name: "x", version: "1.0.0" });
    const ws1 = makeWriteSet();
    ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws1);
    const ws2 = makeWriteSet();
    const result = ensurePackageJsonScripts({ typecheck: "tsc --noEmit" }, false, ws2);
    expect(result.added).toEqual([]);
    expect(ws2.writes).toHaveLength(0); // no second write
  });
});

// ---------------------------------------------------------------------------
// ensurePackageJsonDevDeps — managed devDependencies (BAR-138 Finding 5)
// ---------------------------------------------------------------------------

describe("ensurePackageJsonDevDeps", () => {
  function writePkg(content: object | string): void {
    const body = typeof content === "string" ? content : JSON.stringify(content, null, 2) + "\n";
    fs.writeFileSync("package.json", body, "utf-8");
  }

  function readPkg(): {
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
    [k: string]: unknown;
  } {
    return JSON.parse(fs.readFileSync("package.json", "utf-8"));
  }

  it("returns missingPkg=true when package.json absent", () => {
    const ws = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9" }, false, ws);
    expect(result.missingPkg).toBe(true);
    expect(ws.writes).toHaveLength(0);
  });

  it("returns malformed=true when package.json is invalid JSON", () => {
    fs.writeFileSync("package.json", "{ broken", "utf-8");
    const ws = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9" }, false, ws);
    expect(result.malformed).toBe(true);
    expect(ws.writes).toHaveLength(0);
  });

  it("seeds devDependencies block when absent", () => {
    writePkg({ name: "x", version: "1.0.0" });
    const ws = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9.1.7", prettier: "^3.5.3" }, false, ws);
    expect(result.added).toEqual(["husky", "prettier"]);
    expect(ws.writes).toEqual([{ path: "package.json", action: "update" }]);
    expect(readPkg().devDependencies).toEqual({ husky: "^9.1.7", prettier: "^3.5.3" });
  });

  it("preserves consumer's pinned version (consumer wins)", () => {
    writePkg({ name: "x", version: "1.0.0", devDependencies: { husky: "8.0.0" } });
    const ws = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9.1.7" }, false, ws);
    expect(result.added).toEqual([]);
    expect(result.preserved).toEqual(["husky"]);
    expect(readPkg().devDependencies?.husky).toBe("8.0.0");
  });

  it("skips devDeps add when package already has it under `dependencies` (consumer chose runtime)", () => {
    writePkg({ name: "x", version: "1.0.0", dependencies: { husky: "9.1.0" } });
    const ws = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9.1.7" }, false, ws);
    expect(result.added).toEqual([]);
    expect(result.preserved).toEqual(["husky"]);
    expect(readPkg().devDependencies).toBeUndefined();
  });

  it("dryRun=true records drift but does not write", () => {
    writePkg({ name: "x", version: "1.0.0" });
    const ws = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9.1.7" }, true, ws);
    expect(result.added).toEqual(["husky"]);
    expect(ws.writes).toHaveLength(1);
    expect(readPkg().devDependencies).toBeUndefined();
  });

  it("is idempotent across two consecutive runs", () => {
    writePkg({ name: "x", version: "1.0.0" });
    ensurePackageJsonDevDeps({ husky: "^9.1.7" }, false, makeWriteSet());
    const ws2 = makeWriteSet();
    const result = ensurePackageJsonDevDeps({ husky: "^9.1.7" }, false, ws2);
    expect(result.added).toEqual([]);
    expect(ws2.writes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// stripManagedBlock — pure-string transform (P2.T2)
// ---------------------------------------------------------------------------

describe("stripManagedBlock — html-comment markers", () => {
  it("removes the managed block and marker lines from content", () => {
    const content =
      "# Consumer heading\n\n<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n\nConsumer footer.\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).not.toContain("<!-- bkit:start -->");
    expect(result).not.toContain("bkit content");
    expect(result).not.toContain("<!-- bkit:end -->");
    expect(result).toContain("Consumer heading");
    expect(result).toContain("Consumer footer.");
  });

  it("returns content unchanged when markers are absent", () => {
    const content = "# Consumer heading\n\nConsumer content.\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toBe(content);
  });

  it("returns content unchanged when markers are duplicated (safety guard)", () => {
    const content =
      "<!-- bkit:start -->\na\n<!-- bkit:end -->\n<!-- bkit:start -->\nb\n<!-- bkit:end -->\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toBe(content);
  });

  it("returns content unchanged when markers are inverted (safety guard)", () => {
    const content = "<!-- bkit:end -->\ncontent\n<!-- bkit:start -->\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toBe(content);
  });

  it("is idempotent — calling twice produces same result", () => {
    const content =
      "Consumer content.\n\n<!-- bkit:start -->\nbkit managed\n<!-- bkit:end -->\n\nMore consumer.\n";
    const first = stripManagedBlock(content, "html-comment");
    const second = stripManagedBlock(first, "html-comment");
    expect(second).toBe(first);
  });

  it("strips block when content only contains the managed block", () => {
    const content = "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).not.toContain("bkit content");
    expect(result.trim()).toBe("");
  });

  it("preserves consumer content above AND below the block", () => {
    const content =
      "above content\n\n<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n\nbelow content\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toContain("above content");
    expect(result).toContain("below content");
    expect(result).not.toContain("bkit block");
  });
});

describe("stripManagedBlock — hash-comment markers", () => {
  it("removes hash-comment managed block from YAML/shell files", () => {
    const content =
      "# consumer preamble\n\n# bkit:start\nbkit-step: true\n# bkit:end\n\n# consumer footer\n";
    const result = stripManagedBlock(content, "hash-comment");
    expect(result).not.toContain("# bkit:start");
    expect(result).not.toContain("bkit-step: true");
    expect(result).not.toContain("# bkit:end");
    expect(result).toContain("# consumer preamble");
    expect(result).toContain("# consumer footer");
  });

  it("returns content unchanged when hash markers are absent", () => {
    const content = "# consumer yaml\nstep: true\n";
    const result = stripManagedBlock(content, "hash-comment");
    expect(result).toBe(content);
  });

  it("does not strip html-comment block when style is hash-comment", () => {
    const content = "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    const result = stripManagedBlock(content, "hash-comment");
    expect(result).toBe(content);
  });

  it("does not strip hash-comment block when style is html-comment", () => {
    const content = "# bkit:start\nbkit content\n# bkit:end\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toBe(content);
  });
});

describe("stripManagedBlock — whitespace handling (BAR-138 lesson)", () => {
  it("does not use greedy whitespace regex — only removes the managed block region", () => {
    // Regression guard: greedy whitespace between markers would eat consumer content
    const content =
      "line1\nline2\n\n<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n\nline3\nline4\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toContain("line1");
    expect(result).toContain("line2");
    expect(result).toContain("line3");
    expect(result).toContain("line4");
    expect(result).not.toContain("bkit block");
  });

  it("handles marker with no blank lines around it", () => {
    const content = "above\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\nbelow\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toContain("above");
    expect(result).toContain("below");
    expect(result).not.toContain("bkit");
  });
});
