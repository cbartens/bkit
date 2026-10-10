import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  writeTier1,
  writeTier2,
  writeTier2JsonContained,
  deepContains,
  deepMergeJson,
  ensurePackageJsonScripts,
  type WriteSet,
  type JsonValue,
} from "./write";
import { stripManagedBlock, detectMarkerStyle } from "./managed-block";

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
  DEFAULT_BRANCH: "main",
  PROJECT_NAME: "test-project",
  REPO_SLUG: "acme/test-project",
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
    fs.writeFileSync(src, "branch: {{DEFAULT_BRANCH}}\n", "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.readFileSync(dst, "utf-8")).toBe("branch: main\n");
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

  it("does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "architecture.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nnew\n<!-- bkit:end -->\n", "utf-8");
    // Dogfood corruption shape: double end + trailing stamped block → extractManagedBlock null.
    const corrupted =
      "<!-- bkit:start -->\nold\n<!-- bkit:end -->\n<!-- bkit:end -->\n\n## Consumer\n\n" +
      "<!-- bkit:start -->\nstamped append\n<!-- bkit:end -->\n";
    fs.writeFileSync(dst, corrupted, "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toBe(corrupted); // untouched
    expect(result.match(/<!-- bkit:start -->/g)?.length).toBe(2); // did not grow
    expect(ws.writes).toHaveLength(0);
  });
});

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
// detectMarkerStyle — same marker shapes stripManagedBlock acts on
// ---------------------------------------------------------------------------

describe("detectMarkerStyle", () => {
  it.each([
    ["bare html marker", "a\n<!-- bkit:start -->\nx\n<!-- bkit:end -->\n", "html-comment"],
    [
      "hash-prefixed html marker",
      "# <!-- bkit:start -->\nx\n# <!-- bkit:end -->\n",
      "html-comment",
    ],
    [
      "slash-prefixed html marker",
      "// <!-- bkit:start -->\nx\n// <!-- bkit:end -->\n",
      "html-comment",
    ],
    ["slash marker", "// bkit:start\nx\n// bkit:end\n", "slash-comment"],
  ] as const)("%s → %s", (_label, content, style) => {
    expect(detectMarkerStyle(content)).toBe(style);
  });

  it.each([
    ["marker quoted in prose", "Wrap it in `<!-- bkit:start -->` markers.\n"],
    ["hash marker with a trailing label", "# bkit:start — managed block\nx\n# bkit:end\n"],
    ["indented hash marker", "jobs:\n    # bkit:start gate\n    # bkit:end\n"],
    ["marker embedded mid-line", "some text <!-- bkit:start --> more text\n"],
    ["no markers", "plain content\n"],
    ["empty content", ""],
  ])("%s → null", (_label, content) => {
    expect(detectMarkerStyle(content)).toBeNull();
  });

  it("every detected style is one stripManagedBlock can strip", () => {
    for (const content of [
      "a\n<!-- bkit:start -->\nx\n<!-- bkit:end -->\nb\n",
      "a\n# <!-- bkit:start -->\nx\n# <!-- bkit:end -->\nb\n",
      "a\n// <!-- bkit:start -->\nx\n// <!-- bkit:end -->\nb\n",
      "a\n// bkit:start\nx\n// bkit:end\nb\n",
    ]) {
      const style = detectMarkerStyle(content);
      expect(style).not.toBeNull();
      expect(stripManagedBlock(content, style!)).toBe("a\nb\n");
    }
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

describe("stripManagedBlock — slash-comment markers", () => {
  it("removes slash-comment managed block from JS/TS files", () => {
    const content =
      "// consumer preamble\n\n// bkit:start\nconst bkitStep = true;\n// bkit:end\n\n// consumer footer\n";
    const result = stripManagedBlock(content, "slash-comment");
    expect(result).not.toContain("// bkit:start");
    expect(result).not.toContain("const bkitStep = true;");
    expect(result).not.toContain("// bkit:end");
    expect(result).toContain("// consumer preamble");
    expect(result).toContain("// consumer footer");
  });

  it("returns content unchanged when slash markers are absent", () => {
    const content = "// consumer js\nconst step = true;\n";
    const result = stripManagedBlock(content, "slash-comment");
    expect(result).toBe(content);
  });

  it("does not strip html-comment block when style is slash-comment", () => {
    const content = "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    const result = stripManagedBlock(content, "slash-comment");
    expect(result).toBe(content);
  });

  it("does not strip slash-comment block when style is html-comment", () => {
    const content = "// bkit:start\nbkit content\n// bkit:end\n";
    const result = stripManagedBlock(content, "html-comment");
    expect(result).toBe(content);
  });
});

describe("stripManagedBlock — whitespace handling (BAR-138 lesson)", () => {
  it("does not use greedy whitespace regex — only removes the managed block region", () => {
    // Whitespace between markers is not greedy: consumer content survives
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

// ---------------------------------------------------------------------------
// deepMergeJson — JSON merge primitive (P3.T1)
// Six .claude/settings.json cases from the Derived Test Matrix
// ---------------------------------------------------------------------------

describe("deepMergeJson", () => {
  it("(1) primitives: override wins over base", () => {
    expect(deepMergeJson("old", "new")).toBe("new");
    expect(deepMergeJson(1, 2)).toBe(2);
    expect(deepMergeJson(true, false)).toBe(false);
    expect(deepMergeJson("x", null)).toBeNull();
  });

  it("(2) arrays: override replaces base entirely (no concat)", () => {
    const base: JsonValue = ["a", "b"];
    const override: JsonValue = ["c"];
    expect(deepMergeJson(base, override)).toEqual(["c"]);
  });

  it("(3) objects: merge recursively; override keys win; base keys retained", () => {
    const base: JsonValue = { a: 1, b: { x: 10, y: 20 } };
    const override: JsonValue = { b: { y: 99 }, c: 3 };
    const result = deepMergeJson(base, override) as Record<string, JsonValue>;
    expect(result.a).toBe(1);
    expect((result.b as Record<string, JsonValue>).x).toBe(10);
    expect((result.b as Record<string, JsonValue>).y).toBe(99);
    expect(result.c).toBe(3);
  });

  it("(4) array inside object: override array replaces base array (not concat)", () => {
    const base: JsonValue = { hooks: ["sessionStart", "sessionStop"], other: "keep" };
    const override: JsonValue = { hooks: ["sessionStart"] };
    const result = deepMergeJson(base, override) as Record<string, JsonValue>;
    expect(result.hooks).toEqual(["sessionStart"]);
    expect(result.other).toBe("keep");
  });

  it("(5) claude settings.json case: consumer Stop hook survives bkit SessionStart update", () => {
    const base: JsonValue = {
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "old-preflight.sh" }] }],
        Stop: [{ hooks: [{ type: "command", command: "postflight.sh" }] }],
      },
    };
    const override: JsonValue = {
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "new-preflight.sh" }] }],
      },
    };
    const result = deepMergeJson(base, override) as Record<string, JsonValue>;
    const hooksResult = result.hooks as Record<string, JsonValue>;
    expect(hooksResult["Stop"]).toBeDefined();
    const sessionStart = hooksResult["SessionStart"] as Array<Record<string, JsonValue>>;
    expect(JSON.stringify(sessionStart)).toContain("new-preflight.sh");
  });

  it("(6) null base with object override: override wins wholesale", () => {
    expect(deepMergeJson(null, { a: 1 })).toEqual({ a: 1 });
  });

  it("(7) template (override) key order wins for order-significant maps (#255 P2-10)", () => {
    // Consumer file with a STALE ordering: force-with-lease allow placed BEFORE the force deny.
    const base: JsonValue = {
      permission: {
        bash: {
          "git push --force-with-lease*": "allow",
          "*": "allow",
          "git push --force*": "deny",
        },
      },
    };
    // Template with the CORRECT last-match-wins order: force-with-lease allow placed LAST.
    const override: JsonValue = {
      permission: {
        bash: {
          "*": "allow",
          "git push --force*": "deny",
          "git push --force-with-lease*": "allow",
        },
      },
    };
    const result = deepMergeJson(base, override) as Record<string, JsonValue>;
    const bash = (result.permission as Record<string, JsonValue>).bash as Record<string, JsonValue>;
    const keys = Object.keys(bash);
    // Template order wins → force-with-lease allow lands AFTER the force deny (so under
    // opencode's last-match-wins it is NOT denied).
    expect(keys.indexOf("git push --force-with-lease*")).toBeGreaterThan(
      keys.indexOf("git push --force*"),
    );
  });

  it("(8) template keys first (template order), consumer-only keys appended", () => {
    const base: JsonValue = { a: 1, consumerOnly: 2, b: 3 };
    const override: JsonValue = { b: 30, a: 10 };
    const result = deepMergeJson(base, override) as Record<string, JsonValue>;
    expect(result).toEqual({ a: 10, b: 30, consumerOnly: 2 });
    expect(Object.keys(result)).toEqual(["b", "a", "consumerOnly"]);
  });
});

// ---------------------------------------------------------------------------
// deepContains — JSON containment primitive (BAR-167 Phase 1)
// Eight matrix rows from the Derived Test Matrix
// ---------------------------------------------------------------------------

describe("deepContains", () => {
  it("(1) ok=true when consumer is a superset of template (objects nested 4 levels)", () => {
    const template: JsonValue = { a: { b: { c: { d: 1 } } } };
    const consumer: JsonValue = { a: { b: { c: { d: 1, e: 2 } }, extra: true }, other: "x" };
    const result = deepContains(template, consumer);
    expect(result.ok).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.mismatched).toHaveLength(0);
  });

  it("(2) ok=false with missing paths when a template key is absent from consumer", () => {
    const template: JsonValue = { a: 1, b: { c: 2 } };
    const consumer: JsonValue = { a: 1 };
    const result = deepContains(template, consumer);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain("b");
  });

  it("(3) ok=false with mismatched paths when a leaf primitive differs", () => {
    const template: JsonValue = { a: 1, b: "hello" };
    const consumer: JsonValue = { a: 1, b: "world" };
    const result = deepContains(template, consumer);
    expect(result.ok).toBe(false);
    expect(result.mismatched).toContain("b");
  });

  it("(4) array-of-primitives uses subset semantics", () => {
    const template: JsonValue = { tags: ["a", "b"] };
    const consumer: JsonValue = { tags: ["a", "b", "c"] };
    expect(deepContains(template, consumer).ok).toBe(true);

    const template2: JsonValue = { tags: ["x"] };
    const consumer2: JsonValue = { tags: ["a", "b"] };
    expect(deepContains(template2, consumer2).ok).toBe(false);
  });

  it("(5) array-of-objects uses order-insensitive deep-equal element-wise containment", () => {
    const template: JsonValue = {
      hooks: [{ event: "sessionStart", command: "echo start" }],
    };
    const consumer: JsonValue = {
      hooks: [
        { event: "sessionStop", command: "echo stop" },
        { event: "sessionStart", command: "echo start" },
      ],
    };
    expect(deepContains(template, consumer).ok).toBe(true);
  });

  it("(6) array-of-objects asymmetric size: template 1 element, consumer 2 elements → ok=true", () => {
    const template: JsonValue = { items: [{ id: 1, name: "foo" }] };
    const consumer: JsonValue = {
      items: [
        { id: 2, name: "bar" },
        { id: 1, name: "foo" },
      ],
    };
    expect(deepContains(template, consumer).ok).toBe(true);
  });

  it("(7) mixed-array (primitives + objects) uses element-wise per-type semantics; missing reports element index path", () => {
    const template: JsonValue = ["alpha", { type: "command", command: "run" }];
    const consumer: JsonValue = ["alpha", "beta"];
    const result = deepContains(template, consumer);
    expect(result.ok).toBe(false);
    // Object element missing
    expect(result.missing.some((p) => p.includes("[1]"))).toBe(true);
  });

  it("(8) null-input boundary cases: (null,null)→ok; (null,obj)→ok; (obj,null)→missing", () => {
    expect(deepContains(null, null).ok).toBe(true);
    expect(deepContains(null, { a: 1 }).ok).toBe(true);
    const res = deepContains({ a: 1 }, null);
    expect(res.ok).toBe(false);
    expect(res.missing.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// writeTier2JsonContained — deep-containment JSON helper (BAR-167 Phase 1)
// ---------------------------------------------------------------------------

describe("writeTier2JsonContained", () => {
  it("writes template as-is when destination is missing", () => {
    const src = path.join(tmpDir, "settings.json");
    const dst = path.join(tmpDir, ".claude", "settings.json");
    const template = { hooks: { SessionStart: [{ type: "command" }] } };
    fs.writeFileSync(src, JSON.stringify(template, null, 2) + "\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2JsonContained(src, dst, false, ws);

    expect(fs.existsSync(dst)).toBe(true);
    const written = JSON.parse(fs.readFileSync(dst, "utf-8"));
    expect(written["__bkit__"]).toBeUndefined();
    expect(written.hooks.SessionStart).toBeDefined();
    expect(ws.writes).toHaveLength(1);
    expect(ws.writes[0]!.action).toBe("write");
  });

  it("deep-merges and idempotents on re-run with identical state", () => {
    const src = path.join(tmpDir, "settings.json");
    const dst = path.join(tmpDir, "settings-out.json");
    const template = { hooks: { SessionStart: [{ command: "bash preflight.sh" }] } };
    // Consumer already contains template
    const existing = {
      hooks: {
        SessionStart: [{ command: "bash preflight.sh" }],
        Stop: [{ command: "echo consumer" }],
      },
    };
    fs.writeFileSync(src, JSON.stringify(template, null, 2) + "\n", "utf-8");
    fs.writeFileSync(dst, JSON.stringify(existing, null, 2) + "\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2JsonContained(src, dst, false, ws);

    expect(ws.writes).toHaveLength(0); // already contained → no-op
    // Consumer Stop hook preserved
    const result = JSON.parse(fs.readFileSync(dst, "utf-8"));
    expect(result.hooks.Stop).toBeDefined();
  });

  it("schema-flip: type-mismatched same-path values → template wins on deep-merge", () => {
    const src = path.join(tmpDir, "hooks-template.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    // Template uses keyed-object hooks; consumer has array hooks
    const template = { version: 1, hooks: { sessionStart: [{ command: "echo start" }] } };
    const existing = { hooks: [{ event: "sessionStart", command: "echo old" }], failClosed: true };
    fs.writeFileSync(src, JSON.stringify(template, null, 2) + "\n", "utf-8");
    fs.writeFileSync(dst, JSON.stringify(existing, null, 2) + "\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2JsonContained(src, dst, false, ws);

    const result = JSON.parse(fs.readFileSync(dst, "utf-8"));
    // Template hooks (keyed-object) wins; consumer failClosed preserved
    expect(result.hooks).toEqual(template.hooks);
    expect(result.failClosed).toBe(true);
    expect(ws.writes).toHaveLength(1);
  });

  it("malformed destination → throws with actionable error message (does NOT overwrite)", () => {
    const src = path.join(tmpDir, "template.json");
    const dst = path.join(tmpDir, "malformed.json");
    const template = { a: 1 };
    const malformedContent = "{ not valid json";
    fs.writeFileSync(src, JSON.stringify(template, null, 2) + "\n", "utf-8");
    fs.writeFileSync(dst, malformedContent, "utf-8");
    const ws = makeWriteSet();

    expect(() => writeTier2JsonContained(src, dst, false, ws)).toThrow(
      /is malformed JSON — fix manually before running bkit install/,
    );
    // File must NOT be overwritten
    expect(fs.readFileSync(dst, "utf-8")).toBe(malformedContent);
    expect(ws.writes).toHaveLength(0);
  });

  it("dry-run: records write in WriteSet without touching disk", () => {
    const src = path.join(tmpDir, "settings.json");
    const dst = path.join(tmpDir, "dry-out.json");
    const template = { hooks: { SessionStart: [] } };
    fs.writeFileSync(src, JSON.stringify(template, null, 2) + "\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2JsonContained(src, dst, true, ws);

    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Phase 3 — install/write.ts doc-block terminology check (BAR-167 sub-plan C Task 26)
// ---------------------------------------------------------------------------

describe("Phase 3 — install/write.ts doc-block no Tier 1/2/3 strings", () => {
  it("install/write.ts contains no 'Tier 1', 'Tier 2', or 'Tier 3' strings (single-model semantics)", () => {
    const tiersPath = path.resolve(__dirname, "write.ts");
    expect(fs.existsSync(tiersPath)).toBe(true);
    const content = fs.readFileSync(tiersPath, "utf-8");
    // Reject any match of "Tier 1", "Tier 2", "Tier 3" (case-sensitive)
    const matches = content.match(/Tier [123]/g);
    expect(matches).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// cursor-v1-schema static sanity block (BAR-167 Phase 1)
// ---------------------------------------------------------------------------

describe("cursor-v1-schema", () => {
  it("parsed template has version===1, hooks.sessionStart/sessionStop arrays, no __bkit__, no flat-array hooks", () => {
    const templatePath = path.resolve(__dirname, "../../../shared/.cursor/hooks.json");
    expect(fs.existsSync(templatePath)).toBe(true);
    const doc = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    expect(doc.version).toBe(1);
    expect(typeof doc.hooks).toBe("object");
    expect(Array.isArray(doc.hooks)).toBe(false);
    expect(Array.isArray(doc.hooks.sessionStart)).toBe(true);
    expect(Array.isArray(doc.hooks.sessionStop)).toBe(true);
    expect(doc["__bkit__"]).toBeUndefined();
  });
});
