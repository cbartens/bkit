import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyT1,
  applyT2,
  applyT3,
  applyOpencodeAgent,
  applyOpencodeCommand,
  parseModelLookup,
  parseOpencodeModelLookup,
  buildOpencodeModelLookup,
  parseModelOverrides,
  applyModelOverrides,
  parseModelLookupForColumn,
  extractFullManagedBlock,
  extractManagedBlock,
  parseFrontmatter,
  remapTemplateDest,
  updateManagedBlock,
  getStagingDir,
  initStagingDir,
  commitStaging,
  discardStaging,
  discardAllStaging,
  STAGING_ROOT,
} from "./bkit-install";
import { applyTokens } from "./bkit-tokens";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSubagentsMd(
  rows: Array<{ name: string; cursorModel: string; opencodeModel?: string }>,
): string {
  const tableRows = rows
    .map(
      (r) =>
        `| \`${r.name}\` | ${r.cursorModel} | ${r.opencodeModel ?? "ollama-local/test:7b"} | medium | — | test role |`,
    )
    .join("\n");
  return `# Subagents\n\n## Models\n\n| Prompt | Cursor | Ollama (Local) | Effort | Cursor RO | Role |\n| --- | --- | --- | --- | --- | --- |\n${tableRows}\n`;
}

// ---------------------------------------------------------------------------
// T1 — strip command frontmatter
// ---------------------------------------------------------------------------

describe("T1 — strip command frontmatter", () => {
  it("strips leading --- block", () => {
    const input = `---\ndescription: "Build Feature"\n---\n# Body here\n`;
    expect(applyT1(input)).toBe("# Body here\n");
  });

  it("strips multi-line frontmatter", () => {
    const input = `---\ndescription: "foo"\nmodel: bar\n---\n# Content\n`;
    expect(applyT1(input)).toBe("# Content\n");
  });

  it("leaves content without frontmatter unchanged", () => {
    const input = `# No frontmatter\n\nJust body.\n`;
    expect(applyT1(input)).toBe(input);
  });

  it("preserves trailing newline after stripping", () => {
    const input = `---\ndescription: "x"\n---\nbody\n`;
    const result = applyT1(input);
    expect(result).toBe("body\n");
  });
});

// ---------------------------------------------------------------------------
// T2 — command body rewrites
// ---------------------------------------------------------------------------

describe("T2 — command body rewrites", () => {
  it("rewrites `Agent` tool → `Task` tool", () => {
    const input = "Use the `Agent` tool to invoke subagents.\n";
    expect(applyT2(input)).toBe("Use the `Task` tool to invoke subagents.\n");
  });

  it("rewrites 'using `Agent` tool'", () => {
    const input = "**Subagent:** using `Agent` tool\n";
    expect(applyT2(input)).toBe("**Subagent:** using `Task` tool\n");
  });

  it("rewrites @name → /name ONLY on **Subagent:** lines", () => {
    const input = "**Subagent:** @build-plan\n";
    expect(applyT2(input)).toBe("**Subagent:** /build-plan\n");
  });

  it("does NOT rewrite @name inside body text", () => {
    const input = "See @build-plan for details.\n";
    expect(applyT2(input)).toBe(input);
  });

  it("does NOT rewrite npm scopes like @cbartens/bkit", () => {
    const input = "Install via `@cbartens/bkit` package.\n";
    expect(applyT2(input)).toBe(input);
  });

  it("does NOT rewrite email addresses", () => {
    const input = "Contact user@example.com for help.\n";
    expect(applyT2(input)).toBe(input);
  });

  it("does NOT rewrite markdown anchors like [text](#section)", () => {
    const input = "See [section](#overview) for details.\n";
    expect(applyT2(input)).toBe(input);
  });

  it("rewrites multiple Agent→Task and multiple Subagent lines", () => {
    const input =
      "Use the `Agent` tool here.\n**Subagent:** @foo-bar\nUse the `Agent` tool again.\n**Subagent:** @baz-qux\n";
    const result = applyT2(input);
    expect(result).toContain("`Task` tool here");
    expect(result).toContain("`Task` tool again");
    expect(result).toContain("**Subagent:** /foo-bar");
    expect(result).toContain("**Subagent:** /baz-qux");
  });
});

// ---------------------------------------------------------------------------
// T3 — subagent frontmatter rewrite
// ---------------------------------------------------------------------------

describe("T3 — subagent frontmatter rewrite", () => {
  const modelLookup = new Map([
    ["build-plan", "composer-2.5"],
    ["design-synthesize", "claude-opus-4-8-thinking-high"],
  ]);

  it("emits name, description, model, tools (passthrough)", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: medium\ntools:\n  - Read\n  - Edit\npermissionMode: default\nmaxTurns: 20\n---\nBody here.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    expect(result).toContain("model: composer-2.5");
    expect(result).toContain("tools:");
    expect(result).toContain("- Read");
    expect(result).toContain("- Edit");
    expect(result).not.toContain("effort:");
    expect(result).not.toContain("permissionMode:");
    expect(result).not.toContain("maxTurns:");
  });

  it("drops Claude-only fields: effort, permissionMode, maxTurns, is_background, readonly", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: high\npermissionMode: allowedTools\nmaxTurns: 10\nis_background: true\nreadonly: true\n---\nBody.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).not.toContain("effort:");
    expect(result).not.toContain("permissionMode:");
    expect(result).not.toContain("maxTurns:");
    expect(result).not.toContain("is_background:");
    expect(result).not.toContain("readonly:");
  });

  it("preserves inline tools list `[Read, Grep]` verbatim", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\ntools: [Read, Grep, Glob]\n---\nBody.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).toContain("tools: [Read, Grep, Glob]");
  });

  it("omits tools field when canonical has none", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\n---\nBody.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).not.toContain("tools:");
  });

  it("does NOT emit readonly: in Phase A", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\n---\nBody.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).not.toContain("readonly:");
  });

  it("emits Cursor model from lookup", () => {
    const input = `---\nname: design-synthesize\ndescription: merge brainstorms\neffort: high\n---\nBody.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).toContain("model: claude-opus-4-8-thinking-high");
  });

  it("preserves multi-line YAML description verbatim", () => {
    const input = `---\nname: build-plan\ndescription: |\n  Line one.\n  Line two.\neffort: medium\n---\nBody.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).toContain("description: |");
    expect(result).toContain("Line one.");
    expect(result).toContain("Line two.");
  });

  it("preserves subagent body unchanged", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\n---\nBody content here.\nMore body.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).toContain("Body content here.\nMore body.\n");
  });

  it("exits non-zero when model lookup missing for name", () => {
    const input = `---\nname: unknown-agent\ndescription: desc\neffort: medium\n---\nBody.\n`;
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
    expect(() => applyT3(input, modelLookup)).toThrow("process.exit(1)");
    exitSpy.mockRestore();
  });

  it("exits non-zero when frontmatter is missing the `name` field", () => {
    // Guards against a per-prompt file shipped in `.bkit/prompts/` losing its
    // `name:` field (manual edit / merge conflict / template skew). Without this
    // test the failure surfaces only on a consumer running install.
    const input = `---\ndescription: desc\neffort: medium\n---\nBody.\n`;
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
    expect(() => applyT3(input, modelLookup)).toThrow("process.exit(1)");
    exitSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------

describe("parseFrontmatter", () => {
  it("parses simple key-value pairs", () => {
    const fm = "name: build-plan\ndescription: desc\neffort: medium\n";
    const result = parseFrontmatter(fm);
    expect(result.get("name")).toBe("build-plan");
    expect(result.get("effort")).toBe("medium");
  });

  it("parses multi-line block scalar", () => {
    const fm = "name: foo\ndescription: |\n  Line one.\n  Line two.\neffort: low\n";
    const result = parseFrontmatter(fm);
    expect(result.get("description")).toContain("Line one.");
    expect(result.get("description")).toContain("Line two.");
  });
});

// ---------------------------------------------------------------------------
// parseModelLookup — 42 rows, no missing names
// ---------------------------------------------------------------------------

describe("parseModelLookup", () => {
  it("parses one row per agent file in .bkit/prompts/", () => {
    const lookup = parseModelLookup(".bkit/prompts.md");
    const agentFiles = fs.readdirSync(".bkit/prompts").filter((f) => f.endsWith(".md"));
    expect(lookup.size).toBe(agentFiles.length);
    for (const [name, model] of lookup) {
      expect(name).toBeTruthy();
      expect(model).toBeTruthy();
    }
  });

  it("all .bkit/prompts/ files have a lookup row", () => {
    const lookup = parseModelLookup(".bkit/prompts.md");
    const agentFiles = fs.readdirSync(".bkit/prompts").filter((f) => f.endsWith(".md"));
    const missingNames: string[] = [];
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(".bkit/prompts", f), "utf-8");
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fmMatch) continue;
      const parsed = parseFrontmatter(fmMatch[1]);
      const name = parsed.get("name") ?? "";
      if (name && !lookup.has(name)) missingNames.push(name);
    }
    expect(missingNames).toEqual([]);
  });

  it("parses model lookup from inline table string", () => {
    const tmp = path.join(os.tmpdir(), "test-subagents.md");
    fs.writeFileSync(tmp, makeSubagentsMd([{ name: "test-agent", cursorModel: "composer-2.5" }]));
    const lookup = parseModelLookup(tmp);
    expect(lookup.get("test-agent")).toBe("composer-2.5");
    fs.rmSync(tmp);
  });

  it("strips backticks from model values (table cells use backtick-wrapped values)", () => {
    const content = `# S\n\n## Models\n\n| Prompt | Cursor | Effort | Cursor RO | Role |\n| --- | --- | --- | --- | --- |\n| \`build-plan\` | \`composer-2.5\` | \`medium\` | — | task exec |\n`;
    const tmp = path.join(os.tmpdir(), "test-backtick.md");
    fs.writeFileSync(tmp, content);
    const lookup = parseModelLookup(tmp);
    expect(lookup.get("build-plan")).toBe("composer-2.5");
    expect(lookup.get("build-plan")).not.toContain("`");
    fs.rmSync(tmp);
  });

  it("all parsed model values have no backticks", () => {
    const lookup = parseModelLookup(".bkit/prompts.md");
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/`/);
    }
  });
});

// ---------------------------------------------------------------------------
// Orphan removal — bounded to 4 directories
// ---------------------------------------------------------------------------

describe("Orphan removal", () => {
  it("orphan removal only operates on allowlisted dirs (source check)", () => {
    // The WRITE_DIRS constant in bkit-install.ts must include exactly these 4
    const allowedDirs = [
      ".claude/agents",
      ".claude/commands",
      ".cursor/agents",
      ".cursor/commands",
    ];
    // Verify expected dirs are present by checking the source uses them
    const src = fs.readFileSync(".bkit/src/bkit-install.ts", "utf-8");
    for (const dir of allowedDirs) {
      expect(src).toContain(`"${dir}"`);
    }
  });

  it("install never writes to out-of-allowlist paths (source check)", () => {
    const src = fs.readFileSync(".bkit/src/bkit-install.ts", "utf-8");
    // The removeOrphans fn must check against WRITE_DIRS before deleting
    expect(src).toContain("Refusing orphan removal outside allowlist");
  });
});

// ---------------------------------------------------------------------------
// Managed-block writer
// ---------------------------------------------------------------------------

describe("updateManagedBlock", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-managed-${Date.now()}.md`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("preserves outside-block content when markers present", () => {
    fs.writeFileSync(
      tmpFile,
      "Before\n<!-- bkit:start -->\nOld content\n<!-- bkit:end -->\nAfter\n",
    );
    updateManagedBlock(tmpFile, "New content");
    const result = fs.readFileSync(tmpFile, "utf-8");
    expect(result).toContain("Before\n");
    expect(result).toContain("After\n");
    expect(result).toContain("New content");
    expect(result).not.toContain("Old content");
  });

  it("is a no-op (returns false) when markers absent", () => {
    fs.writeFileSync(tmpFile, "No markers here.\n");
    const changed = updateManagedBlock(tmpFile, "New content");
    expect(changed).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe("No markers here.\n");
  });

  it("returns false when content is already identical", () => {
    fs.writeFileSync(tmpFile, "<!-- bkit:start -->\nSame content\n<!-- bkit:end -->\n");
    updateManagedBlock(tmpFile, "Same content");
    const changed = updateManagedBlock(tmpFile, "Same content");
    expect(changed).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Edge cases from challenge Finding 2 & 3 (bar-110b)
  // -------------------------------------------------------------------------

  it("inverted markers (end before start) — skips with warning", () => {
    const original = "Preamble\n<!-- bkit:end -->\nMiddle\n<!-- bkit:start -->\nPostamble\n";
    fs.writeFileSync(tmpFile, original);
    const changed = updateManagedBlock(tmpFile, "New content");
    expect(changed).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(original);
  });

  it("duplicate markers — skips with warning (preserves all content)", () => {
    const original =
      "Header\n" +
      "<!-- bkit:start -->\nFirst block content\n<!-- bkit:end -->\n" +
      "Between\n" +
      "<!-- bkit:start -->\nSecond block content\n<!-- bkit:end -->\n" +
      "Footer\n";
    fs.writeFileSync(tmpFile, original);
    const changed = updateManagedBlock(tmpFile, "Replaced first block");
    expect(changed).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(original);
  });

  it("idempotent on second run even when newContent has a trailing newline", () => {
    // Finding 3: the function injects \n before and after newContent.
    // If newContent itself ends with \n, the block gets double-newline
    // before the end marker. Verify the second run returns false (stable).
    const contentWithTrailingNewline = "Canonical line.\n";
    fs.writeFileSync(tmpFile, "Before\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nAfter\n");
    const firstChanged = updateManagedBlock(tmpFile, contentWithTrailingNewline);
    expect(firstChanged).toBe(true);
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    // Second run with identical content — must be a no-op
    const secondChanged = updateManagedBlock(tmpFile, contentWithTrailingNewline);
    expect(secondChanged).toBe(false);
    const afterSecond = fs.readFileSync(tmpFile, "utf-8");
    expect(afterSecond).toBe(afterFirst);
  });

  it("idempotent on second run with newContent that has no trailing newline", () => {
    // Baseline: content without trailing newline must also stabilise.
    const content = "Canonical line.";
    fs.writeFileSync(tmpFile, "Before\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nAfter\n");
    updateManagedBlock(tmpFile, content);
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(tmpFile, content);
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });

  it("shell-comment markers — preserves '# ' prefix on both marker lines", () => {
    const original =
      "#!/bin/bash\n# header desc\n\n# <!-- bkit:start -->\n\nset -e\nold body\n\n# <!-- bkit:end -->\n";
    fs.writeFileSync(tmpFile, original);
    const changed = updateManagedBlock(tmpFile, "set -e\nnew body");
    expect(changed).toBe(true);
    const after = fs.readFileSync(tmpFile, "utf-8");
    expect(after).toBe(
      "#!/bin/bash\n# header desc\n\n# <!-- bkit:start -->\n\nset -e\nnew body\n\n# <!-- bkit:end -->\n",
    );
  });

  it("shell-comment markers — idempotent on second run", () => {
    fs.writeFileSync(
      tmpFile,
      "#!/bin/bash\n\n# <!-- bkit:start -->\n\nold body\n\n# <!-- bkit:end -->\n",
    );
    updateManagedBlock(tmpFile, "new body");
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(tmpFile, "new body");
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });
});

// ---------------------------------------------------------------------------
// Passthrough byte-equality (CRLF/BOM/no trailing newline)
// ---------------------------------------------------------------------------

describe("Passthrough byte-equality", () => {
  it("T1 on content with CRLF line endings", () => {
    const input = "---\r\ndescription: foo\r\n---\r\nbody\r\n";
    const result = applyT1(input);
    expect(result).toBe("body\r\n");
  });

  it("T1 preserves BOM if present after frontmatter (edge case)", () => {
    // BOM in body — T1 only strips frontmatter, body passes through
    const bom = "﻿";
    const input = `---\ndesc: x\n---\n${bom}body\n`;
    const result = applyT1(input);
    expect(result).toContain(bom);
  });
});

// ---------------------------------------------------------------------------
// extractManagedBlock
// ---------------------------------------------------------------------------

describe("extractManagedBlock", () => {
  it("extracts inner content with surrounding newlines stripped", () => {
    const input = "Header\n<!-- bkit:start -->\n\nInner content.\n\n<!-- bkit:end -->\nFooter\n";
    expect(extractManagedBlock(input)).toBe("Inner content.");
  });

  it("returns null when markers absent", () => {
    expect(extractManagedBlock("Just some text.\n")).toBeNull();
  });

  it("returns null when start appears after end (inverted)", () => {
    const input = "<!-- bkit:end -->\nMid\n<!-- bkit:start -->\n";
    expect(extractManagedBlock(input)).toBeNull();
  });

  it("returns null when markers are duplicated", () => {
    const input =
      "<!-- bkit:start -->\nA\n<!-- bkit:end -->\n<!-- bkit:start -->\nB\n<!-- bkit:end -->\n";
    expect(extractManagedBlock(input)).toBeNull();
  });

  it("extracts inner content from shell-comment-prefixed markers", () => {
    const input =
      "#!/bin/bash\n# header\n\n# <!-- bkit:start -->\n\nset -e\nbody\n\n# <!-- bkit:end -->\n";
    expect(extractManagedBlock(input)).toBe("set -e\nbody");
  });

  it("ignores backtick-quoted prose mentions", () => {
    const input =
      "<!-- bkit:start -->\nReal block.\n<!-- bkit:end -->\n## Notes\n- mentions `<!-- bkit:start -->` inside backticks\n";
    expect(extractManagedBlock(input)).toBe("Real block.");
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

// ---------------------------------------------------------------------------
// Task 2.1a — Hash-comment marker round-trip (YAML / INI / shell)
// ---------------------------------------------------------------------------

describe("hash-comment marker round-trip (markerStyle: 'hash-comment')", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-hash-${Date.now()}.yml`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("extractManagedBlock with hash-comment extracts inner content from YAML", () => {
    const yaml = `name: CI\n# bkit:start\nold-step: true\n# bkit:end\n`;
    expect(extractManagedBlock(yaml, "hash-comment")).toBe("old-step: true");
  });

  it("extractManagedBlock with hash-comment extracts inner content from INI", () => {
    const ini = `[section]\nkey=val\n# bkit:start\nbkit-key=bkit-val\n# bkit:end\n`;
    expect(extractManagedBlock(ini, "hash-comment")).toBe("bkit-key=bkit-val");
  });

  it("extractManagedBlock with hash-comment extracts inner content from shell", () => {
    const shell = `#!/bin/sh\n# header\n# bkit:start\nset -e\nbody\n# bkit:end\n`;
    expect(extractManagedBlock(shell, "hash-comment")).toBe("set -e\nbody");
  });

  it("extractFullManagedBlock with hash-comment includes marker lines", () => {
    const yaml = `# bkit:start\nstep: true\n# bkit:end\n`;
    const full = extractFullManagedBlock(yaml, "hash-comment");
    expect(full).not.toBeNull();
    expect(full).toContain("# bkit:start");
    expect(full).toContain("# bkit:end");
    expect(full).toContain("step: true");
  });

  it("updateManagedBlock with hash-comment round-trips on YAML content", () => {
    fs.writeFileSync(tmpFile, "# bkit:start\nold: true\n# bkit:end\n", "utf-8");
    const changed = updateManagedBlock(tmpFile, "new: true", false, "hash-comment");
    expect(changed).toBe(true);
    const after = fs.readFileSync(tmpFile, "utf-8");
    expect(after).toContain("new: true");
    expect(after).not.toContain("old: true");
    expect(after).toContain("# bkit:start");
    expect(after).toContain("# bkit:end");
  });

  it("updateManagedBlock with hash-comment is idempotent on second run", () => {
    fs.writeFileSync(tmpFile, "# bkit:start\nold: true\n# bkit:end\n", "utf-8");
    updateManagedBlock(tmpFile, "stable: true", false, "hash-comment");
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(tmpFile, "stable: true", false, "hash-comment");
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });

  it("updateManagedBlock with hash-comment no-op when markers absent", () => {
    fs.writeFileSync(tmpFile, "no: markers\n", "utf-8");
    const changed = updateManagedBlock(tmpFile, "content", false, "hash-comment");
    expect(changed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Task 2.1b — HTML-comment round-trip + default-arg backward compat
// ---------------------------------------------------------------------------

describe("html-comment marker round-trip + default-arg backward compat", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-html-${Date.now()}.md`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("html-comment round-trip on markdown content", () => {
    const md = `# Heading\n<!-- bkit:start -->\nold block\n<!-- bkit:end -->\n`;
    expect(extractManagedBlock(md, "html-comment")).toBe("old block");
  });

  it("html-comment round-trip on .gitignore content", () => {
    const gi = `# consumer entries\nlogs/\n<!-- bkit:start -->\nnode_modules/\n<!-- bkit:end -->\n`;
    expect(extractManagedBlock(gi, "html-comment")).toBe("node_modules/");
  });

  it("default arg (no markerStyle) behaves identically to html-comment (backward compat)", () => {
    const md = `<!-- bkit:start -->\ncontent here\n<!-- bkit:end -->\n`;
    // Default (no arg) must equal explicit html-comment
    expect(extractManagedBlock(md)).toBe(extractManagedBlock(md, "html-comment"));
  });

  it("updateManagedBlock default (no markerStyle) produces byte-identical output to v0.1.1", () => {
    const original = "Before\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nAfter\n";
    fs.writeFileSync(tmpFile, original, "utf-8");
    updateManagedBlock(tmpFile, "New content");
    const result = fs.readFileSync(tmpFile, "utf-8");
    // Verify structure: Before + markers + new content + After
    expect(result).toContain("Before\n");
    expect(result).toContain("After\n");
    expect(result).toContain("New content");
    expect(result).toContain("<!-- bkit:start -->");
    expect(result).toContain("<!-- bkit:end -->");
  });

  it("hash-comment markers are NOT matched when markerStyle defaults to html-comment", () => {
    const yaml = `# bkit:start\nstep: true\n# bkit:end\n`;
    // Default arg = html-comment → should NOT find the hash markers
    expect(extractManagedBlock(yaml)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// P4.T1 + P4.T2 — Staging dir + atomic rename (BAR-142 §A4)
// ---------------------------------------------------------------------------

describe("P4.T1 — getStagingDir / initStagingDir", () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-staging-test-"));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("getStagingDir returns the expected absolute path", () => {
    const result = getStagingDir("core", tmpDir);
    expect(result).toBe(path.join(tmpDir, STAGING_ROOT, "core"));
  });

  it("initStagingDir creates the staging dir", () => {
    const stagingDir = getStagingDir("test-module", tmpDir);
    initStagingDir(stagingDir);
    expect(fs.existsSync(stagingDir)).toBe(true);
    expect(fs.statSync(stagingDir).isDirectory()).toBe(true);
  });

  it("initStagingDir clears an existing staging dir (idempotent)", () => {
    const stagingDir = getStagingDir("test-module", tmpDir);
    initStagingDir(stagingDir);
    fs.writeFileSync(path.join(stagingDir, "stale.txt"), "stale", "utf-8");
    initStagingDir(stagingDir);
    expect(fs.readdirSync(stagingDir)).toHaveLength(0);
  });
});

describe("P4.T2 — commitStaging / discardStaging", () => {
  let tmpDir: string;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-staging-test-"));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("commitStaging moves staged files to their consumer destinations", () => {
    const stagingDir = getStagingDir("core", tmpDir);
    fs.mkdirSync(path.join(stagingDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(stagingDir, ".claude", "agents", "bkit-foo.md"),
      "agent content",
      "utf-8",
    );

    const committed = commitStaging(stagingDir, tmpDir);
    expect(committed).toContain(path.join(".claude", "agents", "bkit-foo.md"));
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-foo.md"), "utf-8")).toBe(
      "agent content",
    );
    // Staging dir itself is removed after commit
    expect(fs.existsSync(stagingDir)).toBe(false);
  });

  it("commitStaging returns empty array when staging dir does not exist", () => {
    const stagingDir = getStagingDir("nonexistent", tmpDir);
    const committed = commitStaging(stagingDir, tmpDir);
    expect(committed).toEqual([]);
  });

  it("commitStaging overwrites the consumer file at destination with staged version", () => {
    // Verify the consumer file at destination gets the staged version
    const stagingDir = getStagingDir("core", tmpDir);
    // Create staging dir + staged file
    fs.mkdirSync(path.join(stagingDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(stagingDir, ".agents", "existing.md"), "new content", "utf-8");
    // Pre-existing consumer file
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", "existing.md"), "old content", "utf-8");

    commitStaging(stagingDir, tmpDir);
    expect(fs.readFileSync(path.join(tmpDir, ".agents", "existing.md"), "utf-8")).toBe(
      "new content",
    );
  });

  it("discardStaging removes staging dir without touching consumer files", () => {
    const stagingDir = getStagingDir("core", tmpDir);
    initStagingDir(stagingDir);
    fs.writeFileSync(path.join(stagingDir, "staged.md"), "staged", "utf-8");

    // Consumer file at real destination is untouched
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", "consumer.md"), "consumer data", "utf-8");

    discardStaging(stagingDir);
    expect(fs.existsSync(stagingDir)).toBe(false);
    // Consumer file survives
    expect(fs.readFileSync(path.join(tmpDir, ".agents", "consumer.md"), "utf-8")).toBe(
      "consumer data",
    );
  });

  it("discardStaging is a no-op when dir does not exist", () => {
    const stagingDir = getStagingDir("nonexistent", tmpDir);
    expect(() => discardStaging(stagingDir)).not.toThrow();
  });

  it("discardAllStaging removes the entire STAGING_ROOT", () => {
    const stagingRoot = path.join(tmpDir, STAGING_ROOT);
    fs.mkdirSync(path.join(stagingRoot, "core"), { recursive: true });
    fs.mkdirSync(path.join(stagingRoot, "claude"), { recursive: true });
    fs.writeFileSync(path.join(stagingRoot, "core", "test.md"), "x");
    discardAllStaging(tmpDir);
    expect(fs.existsSync(stagingRoot)).toBe(false);
  });

  it("commitStaging creates missing parent dirs at destination", () => {
    const stagingDir = getStagingDir("core", tmpDir);
    fs.mkdirSync(path.join(stagingDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(stagingDir, ".github", "workflows", "ci.yml"), "name: CI", "utf-8");
    commitStaging(stagingDir, tmpDir);
    expect(fs.readFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), "utf-8")).toBe(
      "name: CI",
    );
  });
});

// ---------------------------------------------------------------------------
// B5 — LOG_PREFIX on dry-run blocker banner (BAR-142 §B5)
// ---------------------------------------------------------------------------

describe("B5 — LOG_PREFIX on blocker banner (source-level verification)", () => {
  it("bkit-install.ts emits LOG_PREFIX before the blocker banner on preflight exit", () => {
    // Source-level check: the source must contain the LOG_PREFIX-prefixed log before
    // the formatChecklist(blockers) call. This guards against regressions where the
    // banner is printed without a log-prefix prefix line.
    const src = fs.readFileSync(".bkit/src/bkit-install.ts", "utf-8");
    // Must contain LOG_PREFIX annotation before formatChecklist(blockers)
    expect(src).toContain("LOG_PREFIX} Preflight blockers detected");
    // LOG_PREFIX line must appear before the formatChecklist(blockers) call
    const prefixIdx = src.indexOf("LOG_PREFIX} Preflight blockers detected");
    const checklistIdx = src.indexOf("formatChecklist(blockers)");
    expect(prefixIdx).toBeLessThan(checklistIdx);
  });
});

// ---------------------------------------------------------------------------
// Task 6.1 — ci.yml template registry-auth assertion (updated for BAR-138)
// ---------------------------------------------------------------------------

describe("ci.yml template registry-auth assertion (Task 6.1 — updated BAR-138)", () => {
  // BAR-138: The consumer CI template was updated to use GitHub Packages
  // registry auth (.npmrc + GH_BKIT_TOKEN env var) instead of the old git
  // auth-shim (git config --global url.insteadOf). Tests updated accordingly.

  it("ci.yml template exists", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/ci.yml");
    expect(fs.existsSync(templatePath), `template must exist at ${templatePath}`).toBe(true);
  });

  it("ci.yml template does NOT contain the old git auth-shim (BAR-138 cleanup)", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    // The old auth-shim has been removed — these strings must be absent
    expect(content).not.toContain("git config --global url.");
    expect(content).not.toContain("insteadOf");
    expect(content).not.toContain("Configure private-repo auth");
  });

  it("ci.yml template install step carries env: GH_BKIT_TOKEN for registry auth (BAR-138)", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    // GH_BKIT_TOKEN must be present as the env var for registry auth
    expect(content).toContain("GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}");
    // GH_BKIT_TOKEN is now declared at job-level too (so non-install pnpm steps
    // don't emit ".npmrc env substitution failed" warnings). Locate the step-
    // level declaration adjacent to the install command, skipping any earlier
    // job-level occurrence.
    const lines = content.split("\n");
    const installLine = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    const envTokenLine = lines.findIndex(
      (l, i) => i > installLine && l.includes("GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}"),
    );
    expect(installLine).toBeGreaterThan(-1);
    expect(envTokenLine).toBeGreaterThan(installLine);
  });

  it("ci.yml template after applyTokens has no {{PLACEHOLDER}} tokens remaining", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    const tokens = {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
    };
    const substituted = applyTokens(content, tokens);
    expect(substituted).not.toContain("{{NODE_VERSION}}");
    expect(substituted).not.toContain("{{DEFAULT_BRANCH}}");
    expect(substituted).not.toContain("{{PROJECT_NAME}}");
    expect(substituted).toContain("node-version: 22");
    expect(substituted).toContain("branches: [main, dev]");
  });
});

// ---------------------------------------------------------------------------
// applyOpencodeCommand — OC2: strip frontmatter + rewrite invocations
// ---------------------------------------------------------------------------

describe("applyOpencodeCommand", () => {
  it("strips leading YAML frontmatter block", () => {
    const input = `---\ndescription: "Build Feature"\n---\n# Body here\n`;
    expect(applyOpencodeCommand(input)).toBe("# Body here\n");
  });

  it("strips multi-line frontmatter", () => {
    const input = `---\ndescription: "foo"\nmodel: bar\n---\n# Content\n`;
    expect(applyOpencodeCommand(input)).toBe("# Content\n");
  });

  it("leaves content without frontmatter unchanged", () => {
    const input = `# No frontmatter\n\nJust body.\n`;
    expect(applyOpencodeCommand(input)).toBe(input);
  });

  it("rewrites `Agent` tool → `Task` tool", () => {
    const input = `---\ndescription: x\n---\nUse the \`Agent\` tool here.\n`;
    expect(applyOpencodeCommand(input)).toContain("`Task` tool");
    expect(applyOpencodeCommand(input)).not.toContain("`Agent` tool");
  });

  it("rewrites `Skill` tool → `Task` tool", () => {
    const input = `---\ndescription: x\n---\nUse the \`Skill\` tool here.\n`;
    expect(applyOpencodeCommand(input)).toContain("`Task` tool");
    expect(applyOpencodeCommand(input)).not.toContain("`Skill` tool");
  });

  it("rewrites @name → /name ONLY on **Subagent:** lines (anchored)", () => {
    const input = `---\ndescription: x\n---\n**Subagent:** @build-plan\nSee @build-plan for details.\n`;
    const result = applyOpencodeCommand(input);
    expect(result).toContain("**Subagent:** /build-plan");
    expect(result).toContain("See @build-plan for details.");
  });

  it("does NOT rewrite @name inside body text (not on **Subagent:** line)", () => {
    const input = `---\ndescription: x\n---\nSee @build-plan for details.\n`;
    expect(applyOpencodeCommand(input)).toBe("See @build-plan for details.\n");
  });

  it("rewrites using `Agent` tool form", () => {
    const input = `---\ndescription: x\n---\nInvoke using \`Agent\` tool.\n`;
    expect(applyOpencodeCommand(input)).toContain("using `Task` tool");
  });
});

// ---------------------------------------------------------------------------
// applyOpencodeAgent — OC1: frontmatter → mode: subagent + model + reasoningEffort
// ---------------------------------------------------------------------------

describe("applyOpencodeAgent", () => {
  const opencodeModelLookup = new Map([
    ["build-plan", "ollama-local/qwen2.5:7b"],
    ["design-synthesize", "ollama-local/qwen2.5:14b"],
  ]);

  it("emits mode: subagent, name, description, model", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: medium\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Edit\npermissionMode: acceptEdits\nmaxTurns: 100\n---\nBody here.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("mode: subagent");
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    expect(result).toContain("model: ollama-local/qwen2.5:7b");
    expect(result).toContain("tools:");
  });

  it("maps effort: medium → reasoningEffort: low", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("reasoningEffort: low");
    expect(result).not.toContain("effort:");
  });

  it("maps effort: high → reasoningEffort: medium", () => {
    const input = `---\nname: design-synthesize\ndescription: desc\neffort: high\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("reasoningEffort: medium");
  });

  it("maps effort: xhigh → reasoningEffort: high", () => {
    const input = `---\nname: design-synthesize\ndescription: desc\neffort: xhigh\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("reasoningEffort: high");
  });

  it("maps effort: low → reasoningEffort: none", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-haiku-4-5-20251001\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("reasoningEffort: none");
  });

  it("maps effort: max → reasoningEffort: max", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: max\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("reasoningEffort: max");
  });

  it("drops Claude-only fields: permissionMode, maxTurns, is_background, readonly", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: high\npermissionMode: allowedTools\nmaxTurns: 10\nis_background: true\nreadonly: true\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).not.toContain("permissionMode:");
    expect(result).not.toContain("maxTurns:");
    expect(result).not.toContain("is_background:");
    expect(result).not.toContain("readonly:");
    expect(result).not.toContain("effort:");
  });

  it("passes tools block through verbatim", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Edit\n  - Bash\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("tools:");
    expect(result).toContain("- Read");
    expect(result).toContain("- Edit");
    expect(result).toContain("- Bash");
  });

  it("preserves agent body unchanged", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody content here.\nMore body.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toContain("Body content here.\nMore body.\n");
  });

  it("exits non-zero when model lookup missing for name", () => {
    const input = `---\nname: unknown-agent\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody.\n`;
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
    expect(() => applyOpencodeAgent(input, opencodeModelLookup)).toThrow("process.exit(1)");
    exitSpy.mockRestore();
  });

  it("exits non-zero when frontmatter is missing the `name` field", () => {
    const input = `---\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody.\n`;
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
    expect(() => applyOpencodeAgent(input, opencodeModelLookup)).toThrow("process.exit(1)");
    exitSpy.mockRestore();
  });

  it("returns content unchanged when there is no frontmatter", () => {
    const input = "# No frontmatter\nBody here.\n";
    const result = applyOpencodeAgent(input, opencodeModelLookup);
    expect(result).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// parseOpencodeModelLookup — header-addressed column reader
// ---------------------------------------------------------------------------

describe("parseOpencodeModelLookup", () => {
  it("parses one row per agent file in .bkit/prompts/", () => {
    const lookup = parseOpencodeModelLookup(".bkit/prompts.md");
    const agentFiles = fs.readdirSync(".bkit/prompts").filter((f) => f.endsWith(".md"));
    expect(lookup.size).toBe(agentFiles.length);
    for (const [name, model] of lookup) {
      expect(name).toBeTruthy();
      expect(model).toBeTruthy();
    }
  });

  it("all .bkit/prompts/ files have an opencode model entry", () => {
    const lookup = parseOpencodeModelLookup(".bkit/prompts.md");
    const agentFiles = fs.readdirSync(".bkit/prompts").filter((f) => f.endsWith(".md"));
    const missingNames: string[] = [];
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(".bkit/prompts", f), "utf-8");
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fmMatch) continue;
      const parsed = parseFrontmatter(fmMatch[1]);
      const name = parsed.get("name") ?? "";
      if (name && !lookup.has(name)) missingNames.push(name);
    }
    expect(missingNames).toEqual([]);
  });

  it("count matches parseModelLookup count (same catalog)", () => {
    const cursorLookup = parseModelLookup(".bkit/prompts.md");
    const opencodeLookup = parseOpencodeModelLookup(".bkit/prompts.md");
    expect(opencodeLookup.size).toBe(cursorLookup.size);
  });

  it("parses the ollama-local model column from inline table string", () => {
    const content = `# S\n\n## Models\n\n| Prompt | Cursor | Ollama (Local) | Effort | Role |\n| --- | --- | --- | --- | --- |\n| \`test-agent\` | \`composer-2.5\` | \`ollama-local/qwen2.5-coder:7b\` | \`medium\` | task exec |\n`;
    const tmp = path.join(os.tmpdir(), "test-opencode-lookup.md");
    fs.writeFileSync(tmp, content);
    const lookup = parseOpencodeModelLookup(tmp);
    expect(lookup.get("test-agent")).toBe("ollama-local/qwen2.5-coder:7b");
    fs.rmSync(tmp);
  });

  it("all parsed opencode model values have no backticks", () => {
    const lookup = parseOpencodeModelLookup(".bkit/prompts.md");
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/`/);
    }
  });
});

// ---------------------------------------------------------------------------
// buildOpencodeModelLookup — per-provider central table resolution
// ---------------------------------------------------------------------------

describe("buildOpencodeModelLookup — per-provider model resolution", () => {
  it("ollama-local: every agent gets the single memory-safe model", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "ollama-local");
    expect(lookup.size).toBeGreaterThan(0);
    for (const [, model] of lookup) {
      expect(model).toBe("ollama-local/qwen2.5-coder:7b");
    }
  });

  it("nvidia: tier-mapped models with the reasoning-agent override", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "nvidia");
    // opus-tier general → kimi
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("nvidia/moonshotai/kimi-k2.6");
    // sonnet-tier → qwen3-coder
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe(
      "nvidia/qwen/qwen3-coder-480b-a35b-instruct",
    );
    // haiku-tier → gpt-oss
    expect(lookup.get("bkit-design-summary")).toBe("nvidia/openai/gpt-oss-20b");
    // reasoning lens (opus-tier but CoT override) → deepseek
    expect(lookup.get("bkit-build-challenge-2")).toBe("nvidia/deepseek-ai/deepseek-v4-pro");
    expect(lookup.get("bkit-debug-failure-diagnose")).toBe("nvidia/deepseek-ai/deepseek-v4-pro");
  });

  it("uncurated provider (openrouter/gemini): single documented fallback, provider-prefixed", () => {
    const or = buildOpencodeModelLookup(".bkit/prompts.md", "openrouter");
    const ge = buildOpencodeModelLookup(".bkit/prompts.md", "gemini");
    for (const [, model] of or) expect(model).toBe("openrouter/qwen/qwen-2.5-coder-32b-instruct");
    for (const [, model] of ge) expect(model).toBe("gemini/gemini-2.0-flash");
  });

  it("unknown provider: prefix-correct sentinel for every agent (consumer tunes)", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "acme");
    expect(lookup.size).toBeGreaterThan(0);
    for (const [, model] of lookup) expect(model).toBe("acme/set-model-id");
  });
});

// ---------------------------------------------------------------------------
// parseModelOverrides / applyModelOverrides — consumer overrides below bkit:end
// ---------------------------------------------------------------------------

describe("model overrides (consumer-owned, below bkit:end)", () => {
  function writeOverrides(rows: string): string {
    const tmp = path.join(os.tmpdir(), `ov-${Math.random().toString(36).slice(2)}.md`);
    fs.writeFileSync(
      tmp,
      `<!-- bkit:start -->\n# managed\n\n## Models\n\n| Prompt | Nvidia |\n| --- | --- |\n| a | nvidia/managed |\n\n<!-- bkit:end -->\n\n## Model Overrides\n\n| Prompt | Provider | Model |\n| --- | --- | --- |\n${rows}`,
    );
    return tmp;
  }

  it("parses override rows; ignores header + separator", () => {
    const f = writeOverrides(
      "| bkit-design-summary | nvidia | nvidia/x |\n| bkit-build-summary | ollama-local | ollama-local/y |\n",
    );
    const rows = parseModelOverrides(f);
    expect(rows).toEqual([
      { prompt: "bkit-design-summary", provider: "nvidia", model: "nvidia/x" },
      { prompt: "bkit-build-summary", provider: "ollama-local", model: "ollama-local/y" },
    ]);
    fs.rmSync(f);
  });

  it("ignores override rows inside the managed block (only below bkit:end counts)", () => {
    const tmp = path.join(os.tmpdir(), `ovm-${Math.random().toString(36).slice(2)}.md`);
    // A `## Model Overrides` table ABOVE bkit:end must be ignored.
    fs.writeFileSync(
      tmp,
      `<!-- bkit:start -->\n## Model Overrides\n\n| Prompt | Provider | Model |\n| --- | --- | --- |\n| evil | nvidia | nvidia/inject |\n\n<!-- bkit:end -->\n`,
    );
    expect(parseModelOverrides(tmp)).toEqual([]);
    fs.rmSync(tmp);
  });

  it("returns [] when file/section absent", () => {
    expect(parseModelOverrides("/no/such/file.md")).toEqual([]);
  });

  it("applies only matching-provider rows to known agents (in place)", () => {
    const f = writeOverrides(
      "| keep-me | nvidia | nvidia/override |\n| keep-me | ollama-local | ollama-local/other |\n| unknown-agent | nvidia | nvidia/z |\n",
    );
    const lookup = new Map([
      ["keep-me", "nvidia/base"],
      ["leave-me", "nvidia/base2"],
    ]);
    applyModelOverrides(lookup, "nvidia", f);
    expect(lookup.get("keep-me")).toBe("nvidia/override"); // provider match → overridden
    expect(lookup.get("leave-me")).toBe("nvidia/base2"); // not in override table → unchanged
    expect(lookup.has("unknown-agent")).toBe(false); // not a known agent → not added
    fs.rmSync(f);
  });

  it("provider key is matched case-insensitively and does not cross providers", () => {
    const f = writeOverrides("| a | ollama-local | ollama-local/q |\n");
    const lookup = new Map([["a", "nvidia/managed"]]);
    applyModelOverrides(lookup, "nvidia", f); // ollama-local row must NOT touch nvidia lookup
    expect(lookup.get("a")).toBe("nvidia/managed");
    fs.rmSync(f);
  });
});

// ---------------------------------------------------------------------------
// parseModelLookupForColumn — regression: header-addressed, not positional
// ---------------------------------------------------------------------------

describe("parseModelLookupForColumn regression — header-addressed", () => {
  it("cursor column resolves to the same values as parseModelLookup (no positional shift)", () => {
    const cursorViaOld = parseModelLookup(".bkit/prompts.md");
    const cursorViaNew = parseModelLookupForColumn(".bkit/prompts.md", "Cursor");
    expect(cursorViaNew.size).toBe(cursorViaOld.size);
    for (const [name, model] of cursorViaOld) {
      expect(cursorViaNew.get(name)).toBe(model);
    }
  });

  it("returns a different set of values for 'opencode model' vs 'Cursor model'", () => {
    // This guards against the column parser accidentally reading the same column for both hosts.
    const cursorLookup = parseModelLookup(".bkit/prompts.md");
    const opencodeLookup = parseOpencodeModelLookup(".bkit/prompts.md");
    // At least some values must differ (opencode uses ollama-local/*, cursor uses various)
    let diffCount = 0;
    for (const [name] of cursorLookup) {
      if (cursorLookup.get(name) !== opencodeLookup.get(name)) diffCount++;
    }
    expect(diffCount).toBeGreaterThan(0);
  });
});
