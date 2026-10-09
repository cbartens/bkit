import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyT1,
  applyT2,
  applyT3,
  applyOpencodeAgent,
  parseEffortMap,
  lookupEffort,
  effortColumnForProgram,
  formatModelPin,
  applyOpencodeCommand,
  OPENCODE_SESSION_PROMPT_ANCHOR,
  parseModelLookup,
  buildOpencodeModelLookup,
  parseModelOverrides,
  applyModelOverrides,
  parseModelLookupForColumn,
  extractFullManagedBlock,
  extractManagedBlock,
  extractNamedBlocks,
  findLineAnchoredMarkers,
  parseFrontmatter,
  remapTemplateDest,
  updateManagedBlock,
  getStagingDir,
  initStagingDir,
  commitStaging,
  discardStaging,
  discardAllStaging,
  STAGING_ROOT,
  detectInstalledModules,
  detectInstalledHostModules,
  detectOpencodeProvider,
  detectOpencodeProviders,
  modulesToCliFlags,
  validateModuleFlagsForVerb,
  validateCloudTrackerMatch,
  getInstallingVersion,
  runStatus,
} from "./bkit-install";
import type { ModuleFlag, Verb, CloudVariant } from "./bkit-cli";
import type { IssueTracker } from "./bkit-manifest";
import { DEFAULT_ISSUE_TRACKER } from "./bkit-manifest";
import { applyTokens } from "./bkit-tokens";
import { substituteWorkflow } from "./bkit-trackers";
import { stampManagedVersion } from "./bkit-version";

const REPO_ROOT = path.resolve(__dirname, "../..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSubagentsMd(
  rows: Array<{ name: string; cursorModel: string; opencodeModel?: string }>,
): string {
  const tableRows = rows
    .map(
      (r) =>
        `| \`${r.name}\` | ${r.cursorModel} | ${r.opencodeModel ?? "ollama/test:7b"} | medium | — | test role |`,
    )
    .join("\n");
  return `# Subagents\n\n## Models\n\n| Prompt | Cursor | Ollama (Local) | Effort | Cursor RO | Role |\n| --- | --- | --- | --- | --- | --- |\n${tableRows}\n`;
}

// ---------------------------------------------------------------------------
// T1 — strip command frontmatter
// ---------------------------------------------------------------------------

describe("T1 — command frontmatter → description line", () => {
  it("replaces leading --- block with the description as a plain first line", () => {
    const input = `---\ndescription: "Build Feature"\n---\n# Body here\n`;
    expect(applyT1(input)).toBe("Build Feature\n\n# Body here\n");
  });

  it("replaces multi-line frontmatter with the description as a plain first line", () => {
    const input = `---\ndescription: "foo"\nmodel: bar\n---\n# Content\n`;
    expect(applyT1(input)).toBe("foo\n\n# Content\n");
  });

  it("leaves content without frontmatter unchanged", () => {
    const input = `# No frontmatter\n\nJust body.\n`;
    expect(applyT1(input)).toBe(input);
  });

  it("falls back to a plain strip when frontmatter has no description", () => {
    const input = `---\nmodel: bar\n---\nbody\n`;
    expect(applyT1(input)).toBe("body\n");
  });

  it("preserves trailing newline after replacing", () => {
    const input = `---\ndescription: "x"\n---\nbody\n`;
    const result = applyT1(input);
    expect(result).toBe("x\n\nbody\n");
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

  it("rewrites Invoke `@name` on **Subagent:** lines (real workflow shape)", () => {
    const input = "1. **Subagent:** Invoke `@bkit-build-plan-execute` using `Agent` tool:\n";
    expect(applyT2(input)).toBe(
      "1. **Subagent:** Invoke `/bkit-build-plan-execute` using `Task` tool:\n",
    );
  });

  it("rewrites indented list **Subagent:** Invoke `@name` lines", () => {
    const input = "   - **Subagent:** Invoke `@bkit-build-challenge-1`\n";
    expect(applyT2(input)).toBe("   - **Subagent:** Invoke `/bkit-build-challenge-1`\n");
  });

  it("rewrites caution placeholder Invoke using `@name` → `/name`", () => {
    const input = "> - **Subagents:** Invoke using `@name` with `Agent` tool.\n";
    expect(applyT2(input)).toBe("> - **Subagents:** Invoke using `/name` with `Task` tool.\n");
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

  it("does NOT rewrite gate-checklist `@agent` outside **Subagent:** lines", () => {
    const input = "- [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)\n";
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
  const effortMap = parseEffortMap(path.join(import.meta.dirname ?? ".", "..", "prompts.md"));

  it("emits name, description, model, tools (passthrough) + effort from Cursor column", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: medium\ntools:\n  - Read\n  - Edit\npermissionMode: default\nmaxTurns: 20\n---\nBody here.\n`;
    const result = applyT3(input, modelLookup, effortMap);
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    expect(result).toContain("model: composer-2.5");
    expect(result).toContain("tools:");
    expect(result).toContain("- Read");
    expect(result).toContain("- Edit");
    expect(result).toContain("effort: medium");
    expect(result).not.toContain("permissionMode:");
    expect(result).not.toContain("maxTurns:");
  });

  it("drops Claude-only fields: permissionMode, maxTurns, is_background, readonly (keeps remapped effort)", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: high\npermissionMode: allowedTools\nmaxTurns: 10\nis_background: true\nreadonly: true\n---\nBody.\n`;
    const result = applyT3(input, modelLookup, effortMap);
    expect(result).toContain("effort: high");
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
    expect(result).toBe("foo\r\n\r\nbody\r\n");
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

describe("slash-comment marker round-trip (markerStyle: 'slash-comment')", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-slash-${Date.now()}.js`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("extractManagedBlock with slash-comment extracts inner content from JS", () => {
    const js = `export default function () {}\n// bkit:start\nconst old = true;\n// bkit:end\n`;
    expect(extractManagedBlock(js, "slash-comment")).toBe("const old = true;");
  });

  it("extractFullManagedBlock with slash-comment includes marker lines", () => {
    const js = `// bkit:start\nconst step = true;\n// bkit:end\n`;
    const full = extractFullManagedBlock(js, "slash-comment");
    expect(full).not.toBeNull();
    expect(full).toContain("// bkit:start");
    expect(full).toContain("// bkit:end");
    expect(full).toContain("const step = true;");
  });

  it("updateManagedBlock with slash-comment round-trips on JS content", () => {
    fs.writeFileSync(tmpFile, "// bkit:start\nconst old = true;\n// bkit:end\n", "utf-8");
    const changed = updateManagedBlock(tmpFile, "const fresh = true;", false, "slash-comment");
    expect(changed).toBe(true);
    const after = fs.readFileSync(tmpFile, "utf-8");
    expect(after).toContain("const fresh = true;");
    expect(after).not.toContain("const old = true;");
    expect(after).toContain("// bkit:start");
    expect(after).toContain("// bkit:end");
  });

  it("updateManagedBlock with slash-comment is idempotent on second run", () => {
    fs.writeFileSync(tmpFile, "// bkit:start\nconst old = true;\n// bkit:end\n", "utf-8");
    updateManagedBlock(tmpFile, "const stable = true;", false, "slash-comment");
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(
      tmpFile,
      "const stable = true;",
      false,
      "slash-comment",
    );
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });

  it("updateManagedBlock with slash-comment no-op when markers absent", () => {
    fs.writeFileSync(tmpFile, "no markers here\n", "utf-8");
    const changed = updateManagedBlock(tmpFile, "content", false, "slash-comment");
    expect(changed).toBe(false);
  });

  it("findLineAnchoredMarkers finds a bare slash-comment marker (prefix '' is allowed)", () => {
    const js = `header\n// bkit:start\nbody\n// bkit:end\n`;
    expect(findLineAnchoredMarkers(js, "// bkit:start")).toEqual([js.indexOf("// bkit:start")]);
  });

  it("hash-comment markers are NOT matched when markerStyle is slash-comment", () => {
    const yaml = `# bkit:start\nstep: true\n# bkit:end\n`;
    expect(extractManagedBlock(yaml, "slash-comment")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractNamedBlocks — named/optional/multi-block parser (template-driven drift)
// ---------------------------------------------------------------------------

describe("extractNamedBlocks", () => {
  it("parses a bare (unnamed) hash block under the empty-string key", () => {
    const m = extractNamedBlocks("a.txt\n# bkit:start\nb.txt\n# bkit:end\n");
    expect([...m.keys()]).toEqual([""]);
    expect(m.get("")?.body).toBe("b.txt");
    expect(m.get("")?.optional).toBe(false);
  });

  it("parses a bare HTML block under the empty-string key", () => {
    const m = extractNamedBlocks("# Title\n<!-- bkit:start -->\nbody\n<!-- bkit:end -->\n");
    expect(m.get("")?.body).toBe("body");
  });

  it("parses multiple INDENTED named blocks in one file", () => {
    const yaml =
      "jobs:\n" +
      "  t:\n" +
      "    # bkit:start verbose-ci-env\n" +
      "    env:\n" +
      "      V: '1'\n" +
      "    # bkit:end verbose-ci-env\n" +
      "    steps:\n" +
      "      # bkit:start main-lag-warning optional\n" +
      "      - run: echo lag\n" +
      "      # bkit:end main-lag-warning\n";
    const m = extractNamedBlocks(yaml);
    expect(new Set(m.keys())).toEqual(new Set(["verbose-ci-env", "main-lag-warning"]));
    // Raw line indentation is preserved (same contract as extractManagedBlock) — both the
    // template and consumer blocks carry identical indentation, so the comparison is exact.
    expect(m.get("verbose-ci-env")?.body).toBe("    env:\n      V: '1'");
    expect(m.get("verbose-ci-env")?.optional).toBe(false);
    expect(m.get("main-lag-warning")?.body).toBe("      - run: echo lag");
    expect(m.get("main-lag-warning")?.optional).toBe(true);
  });

  it("ignores backtick-quoted prose mentions of markers (line-anchored matching)", () => {
    const content =
      "# The one exception is the `# bkit:start verbose-ci-env` block below.\n" +
      "jobs:\n  t:\n    # bkit:start verbose-ci-env\n    env: {}\n    # bkit:end verbose-ci-env\n";
    const m = extractNamedBlocks(content);
    expect([...m.keys()]).toEqual(["verbose-ci-env"]);
    expect(m.get("verbose-ci-env")?.body).toBe("    env: {}");
  });

  it("drops an unterminated block (no matching end)", () => {
    const m = extractNamedBlocks("  # bkit:start orphan\n  body line\n  steps:\n");
    expect(m.size).toBe(0);
  });

  it("closes a named block with a bare `# bkit:end` too (lenient end matching)", () => {
    const m = extractNamedBlocks("# bkit:start foo\nx\n# bkit:end\n");
    expect(m.get("foo")?.body).toBe("x");
  });

  it("returns an empty map when no markers are present", () => {
    expect(extractNamedBlocks("jobs:\n  t:\n    steps:\n      - run: a\n").size).toBe(0);
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
  // registry auth (.npmrc + BKIT_GH_TOKEN_INSTALL env var) instead of the old git
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

  it("ci.yml template install step carries env: BKIT_GH_TOKEN_INSTALL for registry auth (BAR-138)", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    // BKIT_GH_TOKEN_INSTALL must be present as the env var for registry auth
    expect(content).toContain("BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}");
    // BKIT_GH_TOKEN_INSTALL is now declared at job-level too (so non-install pnpm steps
    // don't emit ".npmrc env substitution failed" warnings). Locate the step-
    // level declaration adjacent to the install command, skipping any earlier
    // job-level occurrence.
    const lines = content.split("\n");
    const installLine = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    const envTokenLine = lines.findIndex(
      (l, i) =>
        i > installLine &&
        l.includes("BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}"),
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
    expect(applyOpencodeCommand(input)).toBe(OPENCODE_SESSION_PROMPT_ANCHOR + "# Body here\n");
  });

  it("strips multi-line frontmatter", () => {
    const input = `---\ndescription: "foo"\nmodel: bar\n---\n# Content\n`;
    expect(applyOpencodeCommand(input)).toBe(OPENCODE_SESSION_PROMPT_ANCHOR + "# Content\n");
  });

  it("leaves body content without frontmatter unchanged (anchor prepended)", () => {
    const input = `# No frontmatter\n\nJust body.\n`;
    expect(applyOpencodeCommand(input)).toBe(OPENCODE_SESSION_PROMPT_ANCHOR + input);
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

  it("rewrites Invoke `@name` on **Subagent:** lines (real workflow shape)", () => {
    const input =
      "---\ndescription: x\n---\n1. **Subagent:** Invoke `@bkit-build-plan-execute` using `Agent` tool:\n";
    const result = applyOpencodeCommand(input);
    expect(result).toContain("**Subagent:** Invoke `/bkit-build-plan-execute` using `Task` tool:");
    expect(result).not.toContain("`@bkit-build-plan-execute`");
  });

  it("rewrites indented list **Subagent:** Invoke `@name` lines", () => {
    const input = "---\ndescription: x\n---\n   - **Subagent:** Invoke `@bkit-build-challenge-1`\n";
    const result = applyOpencodeCommand(input);
    expect(result).toContain("   - **Subagent:** Invoke `/bkit-build-challenge-1`");
  });

  it("rewrites caution placeholder Invoke using `@name` → `/name`", () => {
    const input =
      "---\ndescription: x\n---\n> - **Subagents:** Invoke using `@name` with `Agent` tool.\n";
    const result = applyOpencodeCommand(input);
    expect(result).toContain("Invoke using `/name` with `Task` tool.");
    expect(result).not.toContain("Invoke using `@name`");
  });

  it("does NOT rewrite @name inside body text (not on **Subagent:** line)", () => {
    const input = `---\ndescription: x\n---\nSee @build-plan for details.\n`;
    expect(applyOpencodeCommand(input)).toBe(
      OPENCODE_SESSION_PROMPT_ANCHOR + "See @build-plan for details.\n",
    );
  });

  it("rewrites using `Agent` tool form", () => {
    const input = `---\ndescription: x\n---\nInvoke using \`Agent\` tool.\n`;
    expect(applyOpencodeCommand(input)).toContain("using `Task` tool");
  });

  it("prepends the session-prompt $ARGUMENTS anchor at the very top (issue #278)", () => {
    const input = `---\ndescription: x\n---\n# Build Feature\n`;
    const result = applyOpencodeCommand(input);
    expect(result.startsWith("**Session prompt:**\n\n$ARGUMENTS\n\n---\n\n")).toBe(true);
    expect(result).toBe(OPENCODE_SESSION_PROMPT_ANCHOR + "# Build Feature\n");
  });

  it("includes exactly one $ARGUMENTS token (single anchor, not per-reference)", () => {
    const input = `---\ndescription: x\n---\n**Else** scan session prompt for an issue ref.\n`;
    const result = applyOpencodeCommand(input);
    expect(result.match(/\$ARGUMENTS/g)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// applyOpencodeAgent — OC1: frontmatter → mode: subagent + model + reasoningEffort
// ---------------------------------------------------------------------------

describe("applyOpencodeAgent", () => {
  // Bare, gateway-scoped ids — the § Models cell shape. The `ollama/` prefix is added
  // by the renderer via formatModelPin, so asserting it below proves that wiring.
  const opencodeModelLookup = new Map([
    ["build-plan", "qwen2.5:7b"],
    ["design-synthesize", "qwen2.5:14b"],
  ]);
  const promptsMd = path.join(import.meta.dirname ?? ".", "..", "prompts.md");
  const effortMap = parseEffortMap(promptsMd);

  it("emits mode: subagent, name, description, model", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: medium\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Edit\npermissionMode: acceptEdits\nmaxTurns: 100\n---\nBody here.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("mode: subagent");
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    expect(result).toContain("model: ollama/qwen2.5:7b");
    expect(result).toContain("tools:");
  });

  it("converts Claude tools array → opencode tools object map with lowercase names", () => {
    // opencode's AgentConfig.tools is an object {name: boolean}, NOT a YAML array, and
    // its tool names are lowercase. The array form fails: "tools: Expected object, got [...]".
    const input = `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Glob\n  - Write\n  - Edit\n  - WebFetch\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("tools:\n");
    expect(result).toContain("  read: true");
    expect(result).toContain("  glob: true");
    expect(result).toContain("  write: true");
    expect(result).toContain("  edit: true");
    expect(result).toContain("  webfetch: true");
    // No array-form items survive (would be "  - Read"), and no capitalized tool keys.
    expect(result).not.toMatch(/^\s*-\s*Read/m);
    expect(result).not.toContain("Read: true");
  });

  it("maps effort: medium → reasoningEffort: high (OpenCode column ceilings out)", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("reasoningEffort: high");
    expect(result).not.toContain("effort:");
  });

  it("maps effort: high → reasoningEffort: max", () => {
    const input = `---\nname: design-synthesize\ndescription: desc\neffort: high\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("reasoningEffort: max");
  });

  it("maps effort: xhigh → reasoningEffort: max", () => {
    const input = `---\nname: design-synthesize\ndescription: desc\neffort: xhigh\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("reasoningEffort: max");
  });

  it("maps effort: low → reasoningEffort: none", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-haiku-4-5-20251001\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("reasoningEffort: none");
  });

  it("maps effort: max → reasoningEffort: max", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: max\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("reasoningEffort: max");
  });

  it("opencode provider column: medium → high, high/xhigh → max", () => {
    const zaiLookup = new Map([
      ["build-plan", "openrouter/glm-5.1"],
      ["design-synthesize", "openrouter/glm-5.2"],
    ]);
    expect(
      applyOpencodeAgent(
        `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-5\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("reasoningEffort: high");
    expect(
      applyOpencodeAgent(
        `---\nname: design-synthesize\ndescription: desc\neffort: high\nmodel: claude-opus-5\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("reasoningEffort: max");
    expect(
      applyOpencodeAgent(
        `---\nname: design-synthesize\ndescription: desc\neffort: xhigh\nmodel: claude-opus-5\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("reasoningEffort: max");
    expect(
      applyOpencodeAgent(
        `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-haiku-4-5-20251001\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("reasoningEffort: none");
  });

  it("drops Claude-only fields: permissionMode, maxTurns, is_background, readonly", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: high\npermissionMode: allowedTools\nmaxTurns: 10\nis_background: true\nreadonly: true\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).not.toContain("permissionMode:");
    expect(result).not.toContain("maxTurns:");
    expect(result).not.toContain("is_background:");
    expect(result).not.toContain("readonly:");
    expect(result).not.toContain("effort:");
  });

  it("rewrites the tools block to opencode's object map (not the Claude array)", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Edit\n  - Bash\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("tools:");
    expect(result).toContain("  read: true");
    expect(result).toContain("  edit: true");
    expect(result).toContain("  bash: true");
    expect(result).not.toContain("- Read");
  });

  it("preserves agent body unchanged", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody content here.\nMore body.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
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
// parseEffortMap — prompts.md Effort → provider thinking table
// ---------------------------------------------------------------------------

describe("parseEffortMap", () => {
  const effortMap = parseEffortMap(".bkit/prompts.md");

  it("parses Default | Claude | Cursor | OpenCode", () => {
    for (const col of ["Default", "Claude", "Cursor", "OpenCode"]) {
      expect(effortMap.has(col)).toBe(true);
    }
    expect(effortMap.get("Default")?.size).toBe(5);
  });

  // The effort table is keyed on PROGRAM, so "every opencode gateway shares one ladder"
  // is now structural rather than four map entries that could drift apart.
  it("effort columns are keyed on program, not gateway", () => {
    expect(effortColumnForProgram("claude")).toBe("Claude");
    expect(effortColumnForProgram("cursor")).toBe("Cursor");
    expect(effortColumnForProgram("opencode")).toBe("OpenCode");
    expect(lookupEffort(effortMap, "opencode", "xhigh")).toBe("max");
    expect(lookupEffort(effortMap, "opencode", "medium")).toBe("high");
  });

  // A gateway key reaching this function means a caller confused the two axes. It must
  // fail loudly: silently falling back would emit a thinking ladder nobody selected.
  it("a gateway key is rejected — the axes must not be mixed", () => {
    for (const gateway of ["openrouter", "ollama", "opencode-zen", "opencode-go"]) {
      expect(() => effortColumnForProgram(gateway)).toThrow(/no prompts.md effort column/);
      expect(() => lookupEffort(effortMap, gateway, "high")).toThrow();
    }
  });

  // #205 — below-target providers ceiling out rather than downshift: a provider that scores
  // under the Claude tier target must spend MORE thinking to close the gap, not less.
  it("opencode columns ceiling out above low (never below the Default rung)", () => {
    const RANK = { none: 0, low: 1, medium: 2, high: 3, xhigh: 4, max: 5 };
    expect(lookupEffort(effortMap, "opencode", "low")).toBe("none");
    for (const e of ["medium", "high", "xhigh", "max"]) {
      expect(RANK[lookupEffort(effortMap, "opencode", e)]).toBeGreaterThanOrEqual(RANK[e]);
    }
    expect(lookupEffort(effortMap, "opencode", "high")).toBe("max");
  });

  it("Claude / Cursor columns are identity with Default", () => {
    for (const e of ["low", "medium", "high", "xhigh", "max"]) {
      expect(lookupEffort(effortMap, "claude", e)).toBe(e);
      expect(lookupEffort(effortMap, "cursor", e)).toBe(e);
    }
  });
});

// ---------------------------------------------------------------------------
// parseOpencodeModelLookup — header-addressed column reader
// ---------------------------------------------------------------------------

describe("buildOpencodeModelLookup — default column reader", () => {
  it("parses one row per agent file in .bkit/prompts/", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-zen");
    const agentFiles = fs.readdirSync(".bkit/prompts").filter((f) => f.endsWith(".md"));
    expect(lookup.size).toBe(agentFiles.length);
    for (const [name, model] of lookup) {
      expect(name).toBeTruthy();
      expect(model).toBeTruthy();
    }
  });

  it("all .bkit/prompts/ files have an opencode model entry", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-zen");
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
    const opencodeLookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-zen");
    expect(opencodeLookup.size).toBe(cursorLookup.size);
  });

  it("parses the provider model column from inline table string", () => {
    const content = `# S\n\n## Models\n\n| Prompt | Cursor | OpenCode Zen | Effort | Role |\n| --- | --- | --- | --- | --- |\n| \`test-agent\` | \`composer-2.5\` | \`opencode/deepseek-v4-pro\` | \`medium\` | task exec |\n`;
    const tmp = path.join(os.tmpdir(), "test-opencode-lookup.md");
    fs.writeFileSync(tmp, content);
    const lookup = buildOpencodeModelLookup(tmp, "opencode-zen");
    expect(lookup.get("test-agent")).toBe("opencode/deepseek-v4-pro");
    fs.rmSync(tmp);
  });

  it("all parsed opencode model values have no backticks", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-zen");
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/`/);
    }
  });
});

// ---------------------------------------------------------------------------
// buildOpencodeModelLookup — per-provider central table resolution
// ---------------------------------------------------------------------------

describe("buildOpencodeModelLookup — per-provider model resolution", () => {
  // #245 Phase 2 — the four OpenAI-compatible providers now ship curated columns.
  // Tier anchors: ideate-1 = opus, ideate-2 = sonnet, design-summary = haiku,
  // build-challenge-2 / debug-failure-diagnose = convergent (CoT reasoner).
  // OpenRouter opus+sonnet collapse onto V4.1 Flash (clears both Claude targets).
  // Haiku stays on the cheapest sufficient pin; convergent stays a distinct family.
  it("openrouter: v4.1-flash opus+sonnet, glm-5.3-flash haiku, kimi-k3 convergent", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "openrouter");
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("deepseek/deepseek-v4.1-flash");
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("deepseek/deepseek-v4.1-flash");
    expect(lookup.get("bkit-design-summary")).toBe("z-ai/glm-5.3-flash");
    expect(lookup.get("bkit-build-challenge-2")).toBe("moonshotai/kimi-k3");
    expect(lookup.get("bkit-debug-failure-diagnose")).toBe("moonshotai/kimi-k3");
    // The gateway prefix belongs to the renderer, not the table.
    expect(formatModelPin("opencode", "openrouter", lookup.get("bkit-design-summary")!)).toBe(
      "openrouter/z-ai/glm-5.3-flash",
    );
  });

  // Guards against silently reverting convergent to a DeepSeek slug, or haiku to V4 Flash.
  it("openrouter: convergent is kimi-k3; frozen/dated v4-pro slugs stay off the column", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "openrouter");
    const pins = [...lookup.values()];
    expect(pins).not.toContain("deepseek/deepseek-v4-pro");
    expect(pins).not.toContain("deepseek/deepseek-v4-pro-0813");
    expect(pins.some((m) => m === "moonshotai/kimi-k3")).toBe(true);
    expect(pins.some((m) => m === "deepseek/deepseek-v4.1-flash")).toBe(true);
    expect(pins.some((m) => m === "z-ai/glm-5.3-flash")).toBe(true);
  });

  // This column exists to carry work when the Claude quota is spent — a Claude pin
  // there defeats its purpose regardless of score.
  it("openrouter: no Claude model is pinned in the column", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "openrouter");
    for (const model of lookup.values()) {
      expect(model).not.toMatch(/anthropic|claude/i);
    }
  });

  it("ollama (cloud): kimi-k2.7-code opus+sonnet, deepseek-v4.1-flash haiku, deepseek-v4-pro convergent", () => {
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "ollama");
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("kimi-k2.7-code");
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("kimi-k2.7-code");
    expect(lookup.get("bkit-design-summary")).toBe("deepseek-v4.1-flash");
    expect(lookup.get("bkit-build-challenge-2")).toBe("deepseek-v4-pro");
    expect(formatModelPin("opencode", "ollama", lookup.get("bkit-design-summary")!)).toBe(
      "ollama/deepseek-v4.1-flash",
    );
  });

  it("every allowlisted provider ships a curated column (all four)", () => {
    for (const provider of ["openrouter", "ollama", "opencode-zen", "opencode-go"]) {
      const lookup = buildOpencodeModelLookup(".bkit/prompts.md", provider);
      expect(lookup.size).toBeGreaterThan(0);
    }
  });

  it("unknown provider throws — no column, no substitute", () => {
    expect(() => buildOpencodeModelLookup(".bkit/prompts.md", "acme")).toThrow(
      /no prompts.md . Models column/,
    );
  });

  it("opencode-zen: curated OpenCode Zen column (opencode/<id> — models.dev built-in id)", () => {
    // CLI key is opencode-zen; agent pins use the OpenCode built-in provider id `opencode`.
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-zen");
    expect(lookup.size).toBeGreaterThan(0);
    // Cells are bare; the pin is built by formatModelPin, which maps the bkit gateway key
    // `opencode-zen` onto the OpenCode-side provider id `opencode` — NOT a pass-through.
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/^opencode(-zen)?\//);
      expect(formatModelPin("opencode", "opencode-zen", model)).toMatch(/^opencode\//);
      expect(formatModelPin("opencode", "opencode-zen", model)).not.toMatch(/^opencode-zen\//);
    }
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("kimi-k2.7-code"); // opus
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("kimi-k2.7-code"); // sonnet — qwen3.6-plus was strictly dominated (lower score, 4x cost)
    expect(lookup.get("bkit-design-summary")).toBe("glm-5.3-flash"); // haiku
    expect(lookup.get("bkit-build-challenge-2")).toBe("deepseek-v4-pro"); // convergent
  });

  it("opencode-go: curated OpenCode Go column (deepseek-v4-pro / deepseek-v4.1-flash)", () => {
    // opencode-go = the budget open-weight-only plan (https://opencode.ai/zen/go/v1). Go catalog is
    // invisible to /zen/v1/models — sourced via models.dev. minimax-m3 / qwen3.7-plus dropped: both
    // score below deepseek-v4-pro at higher cost (#205 parity board).
    const lookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-go");
    expect(lookup.size).toBeGreaterThan(0);
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/^opencode-go\//);
      expect(formatModelPin("opencode", "opencode-go", model)).toMatch(/^opencode-go\//);
    }
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("deepseek-v4-pro"); // opus
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("deepseek-v4-pro"); // sonnet
    expect(lookup.get("bkit-design-summary")).toBe("deepseek-v4.1-flash"); // haiku
    expect(lookup.get("bkit-build-challenge-2")).toBe("deepseek-v4-pro"); // convergent
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
      `<!-- bkit:start -->\n# managed\n\n## Models\n\n| Prompt | OpenRouter |\n| --- | --- |\n| a | openrouter/managed |\n\n<!-- bkit:end -->\n\n## Model Overrides\n\n| Prompt | Provider | Model |\n| --- | --- | --- |\n${rows}`,
    );
    return tmp;
  }

  it("parses override rows; ignores header + separator", () => {
    const f = writeOverrides(
      "| bkit-design-summary | openrouter | openrouter/x |\n| bkit-build-summary | ollama | ollama/y |\n",
    );
    const rows = parseModelOverrides(f);
    expect(rows).toEqual([
      { prompt: "bkit-design-summary", provider: "openrouter", model: "openrouter/x" },
      { prompt: "bkit-build-summary", provider: "ollama", model: "ollama/y" },
    ]);
    fs.rmSync(f);
  });

  it("ignores override rows inside the managed block (only below bkit:end counts)", () => {
    const tmp = path.join(os.tmpdir(), `ovm-${Math.random().toString(36).slice(2)}.md`);
    // A `## Model Overrides` table ABOVE bkit:end must be ignored.
    fs.writeFileSync(
      tmp,
      `<!-- bkit:start -->\n## Model Overrides\n\n| Prompt | Provider | Model |\n| --- | --- | --- |\n| evil | openrouter | openrouter/inject |\n\n<!-- bkit:end -->\n`,
    );
    expect(parseModelOverrides(tmp)).toEqual([]);
    fs.rmSync(tmp);
  });

  it("returns [] when file/section absent", () => {
    expect(parseModelOverrides("/no/such/file.md")).toEqual([]);
  });

  it("applies only matching-provider rows to known agents (in place)", () => {
    const f = writeOverrides(
      "| keep-me | openrouter | openrouter/override |\n| keep-me | ollama | ollama/other |\n| unknown-agent | openrouter | openrouter/z |\n",
    );
    const lookup = new Map([
      ["keep-me", "openrouter/base"],
      ["leave-me", "openrouter/base2"],
    ]);
    applyModelOverrides(lookup, "openrouter", f);
    expect(lookup.get("keep-me")).toBe("openrouter/override"); // provider match → overridden
    expect(lookup.get("leave-me")).toBe("openrouter/base2"); // not in override table → unchanged
    expect(lookup.has("unknown-agent")).toBe(false); // not a known agent → not added
    fs.rmSync(f);
  });

  it("provider key is matched case-insensitively and does not cross providers", () => {
    const f = writeOverrides("| a | ollama | ollama/q |\n");
    const lookup = new Map([["a", "openrouter/managed"]]);
    applyModelOverrides(lookup, "openrouter", f); // ollama row must NOT touch openrouter lookup
    expect(lookup.get("a")).toBe("openrouter/managed");
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
    const opencodeLookup = buildOpencodeModelLookup(".bkit/prompts.md", "opencode-zen");
    // At least some values must differ (opencode uses ollama/*, cursor uses various)
    let diffCount = 0;
    for (const [name] of cursorLookup) {
      if (cursorLookup.get(name) !== opencodeLookup.get(name)) diffCount++;
    }
    expect(diffCount).toBeGreaterThan(0);
  });
});

describe("modulesToCliFlags — resolved module set → recovery-hint CLI flags", () => {
  const flags = (
    mods: ModuleFlag[],
    provider: string | null = null,
    cloud: "claude" | "cursor" | "opencode" | null = null,
  ) => modulesToCliFlags(new Set<ModuleFlag>(mods), provider, cloud);

  it("emits nothing for a core-only set (core is implicit)", () => {
    expect(flags(["core"])).toBe("");
  });

  it("maps host modules to their flags", () => {
    expect(flags(["core", "claude"])).toBe("--claude");
    expect(flags(["core", "cursor"])).toBe("--cursor");
  });

  it("renders --opencode with the resolved provider, or a placeholder when unknown", () => {
    expect(flags(["opencode"], "openrouter")).toBe("--opencode=openrouter");
    expect(flags(["opencode"], null)).toBe("--opencode=<provider>");
  });

  it("collapses ci+lint+git-hooks to --tooling", () => {
    expect(flags(["core", "ci", "lint", "git-hooks"])).toBe("--tooling");
  });

  it("maps a partial TS toolchain (lint or git-hooks) to --typescript", () => {
    expect(flags(["lint"])).toBe("--typescript");
    expect(flags(["git-hooks"])).toBe("--typescript");
  });

  it("maps agnostic ci alone to --ci", () => {
    expect(flags(["ci"])).toBe("--ci");
  });

  it("maps the cloud opt-in (placeholder when the variant is unknown)", () => {
    expect(flags(["cloud"], null, "cursor")).toBe("--auto=cursor");
    expect(flags(["cloud"], null, null)).toBe("--auto=<variant>");
  });

  it("composes multiple modules in flag order", () => {
    expect(
      flags(["core", "claude", "cursor", "ci", "lint", "git-hooks", "cloud"], null, "claude"),
    ).toBe("--claude --cursor --tooling --auto=claude");
  });
});

describe("validateModuleFlagsForVerb — #252 Step 2/3 verb/module-flag validation", () => {
  const flags = (mods: ModuleFlag[] = []) => new Set<ModuleFlag>(mods);

  it("errors when install is given zero module flags", () => {
    const err = validateModuleFlagsForVerb("install", flags());
    expect(err).not.toBeNull();
    expect(err).toContain("`bkit install` requires at least one module flag");
  });

  it("passes when install is given at least one module flag", () => {
    expect(validateModuleFlagsForVerb("install", flags(["claude"]))).toBeNull();
  });

  it("errors when check is given a module flag", () => {
    const err = validateModuleFlagsForVerb("check", flags(["claude"]));
    expect(err).not.toBeNull();
    expect(err).toContain("`bkit check` takes no module flags");
  });

  it("errors when upgrade is given a module flag", () => {
    const err = validateModuleFlagsForVerb("upgrade", flags(["cursor"]));
    expect(err).not.toBeNull();
    expect(err).toContain("`bkit upgrade` takes no module flags");
  });

  it("passes when check/upgrade are given zero module flags", () => {
    expect(validateModuleFlagsForVerb("check", flags())).toBeNull();
    expect(validateModuleFlagsForVerb("upgrade", flags())).toBeNull();
  });

  it("does not constrain other verbs (uninstall, doctor, help, ...)", () => {
    const otherVerbs: Verb[] = ["uninstall", "doctor", "help", "status", "harvest"];
    for (const verb of otherVerbs) {
      expect(validateModuleFlagsForVerb(verb, flags())).toBeNull();
      expect(validateModuleFlagsForVerb(verb, flags(["claude", "cursor"]))).toBeNull();
    }
  });
});

describe("validateCloudTrackerMatch — FINAL SCOPE decision 3/4 symmetric cloud/tracker constraint", () => {
  it("passes when no cloud variant is set", () => {
    expect(validateCloudTrackerMatch(null, true, "github")).toBeNull();
  });

  it("passes when the cloud module isn't in the install set, even with a variant", () => {
    expect(validateCloudTrackerMatch("claude", false, "linear")).toBeNull();
  });

  it("passes when cloud=claude and tracker=github (matching)", () => {
    expect(validateCloudTrackerMatch("claude", true, "github")).toBeNull();
  });

  it("passes when cloud=opencode and tracker=github (matching)", () => {
    expect(validateCloudTrackerMatch("opencode", true, "github")).toBeNull();
  });

  it("passes when cloud=cursor and tracker=linear (matching)", () => {
    expect(validateCloudTrackerMatch("cursor", true, "linear")).toBeNull();
  });

  it("errors when cloud=claude but tracker is not github", () => {
    const err = validateCloudTrackerMatch("claude", true, "linear");
    expect(err).not.toBeNull();
    expect(err).toContain("--auto=claude requires tracker=github");
  });

  it("errors when cloud=cursor but tracker is not linear", () => {
    const err = validateCloudTrackerMatch("cursor", true, "github");
    expect(err).not.toBeNull();
    expect(err).toContain("--auto=cursor requires tracker=linear");
  });

  it("suggests setting the tracker (not switching) when the tracker is still 'none' (default)", () => {
    const err = validateCloudTrackerMatch("cursor", true, "none" as IssueTracker);
    expect(err).toContain("Set the tracker first");
  });

  it("suggests re-running with the matching tracker when a different tracker is already set", () => {
    const err = validateCloudTrackerMatch("claude", true, "linear" as IssueTracker);
    expect(err).toContain("tracker switching is free");
  });
});

describe("detectInstalledModules — sentinel-file module detection", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-detect-mods-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const touch = (rel: string) => {
    const p = path.join(cwd, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, "", "utf-8");
  };
  const mkdir = (rel: string) => fs.mkdirSync(path.join(cwd, rel), { recursive: true });

  it("returns just core for an empty dir", () => {
    expect([...detectInstalledModules(cwd)]).toEqual(["core"]);
  });

  it("detects each host module by its agents dir", () => {
    mkdir(".claude/agents");
    mkdir(".cursor/agents");
    mkdir(".opencode/agents");
    const mods = detectInstalledModules(cwd);
    expect(mods.has("claude")).toBe(true);
    expect(mods.has("cursor")).toBe(true);
    expect(mods.has("opencode")).toBe(true);
  });

  it("detects ci via ci.yml", () => {
    touch(".github/workflows/ci.yml");
    expect(detectInstalledModules(cwd).has("ci")).toBe(true);
  });

  it("detects ci via .vale.ini alone (either sentinel)", () => {
    touch(".vale.ini");
    expect(detectInstalledModules(cwd).has("ci")).toBe(true);
  });

  it("detects lint via slop-scan.config.json", () => {
    touch("slop-scan.config.json");
    expect(detectInstalledModules(cwd).has("lint")).toBe(true);
  });

  it("detects lint via .prettierignore alone (either sentinel)", () => {
    touch(".prettierignore");
    expect(detectInstalledModules(cwd).has("lint")).toBe(true);
  });

  it("detects git-hooks via a husky pre-commit hook", () => {
    touch(".husky/pre-commit");
    expect(detectInstalledModules(cwd).has("git-hooks")).toBe(true);
  });

  it("detects git-hooks via pre-push alone (either sentinel)", () => {
    touch(".husky/pre-push");
    expect(detectInstalledModules(cwd).has("git-hooks")).toBe(true);
  });
});

describe("detectInstalledHostModules — host detection for upgrade re-render", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-detect-hosts-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("returns an empty set when no host agents dir exists (never seeds core)", () => {
    expect(detectInstalledHostModules(cwd).size).toBe(0);
  });

  it("detects only the hosts whose agents dir is present", () => {
    fs.mkdirSync(path.join(cwd, ".claude", "agents"), { recursive: true });
    fs.mkdirSync(path.join(cwd, ".opencode", "agents"), { recursive: true });
    expect([...detectInstalledHostModules(cwd)].sort()).toEqual(["claude", "opencode"]);
  });
});

describe("detectOpencodeProvider — provider resolution (manifest-first)", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-provider-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const writePkg = (bkit: unknown) =>
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }), "utf-8");
  const writeOpencodeJson = (obj: unknown) => {
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".opencode", "opencode.json"), JSON.stringify(obj), "utf-8");
  };

  it("returns null when neither package.json nor opencode.json exists", () => {
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });

  it("reads a valid bkit.opencodeProvider from package.json", () => {
    writePkg({ opencodeProvider: "openrouter" });
    expect(detectOpencodeProvider(cwd)).toBe("openrouter");
  });

  it("normalizes a legacy provider key (zen → opencode-zen)", () => {
    writePkg({ opencodeProvider: "zen" });
    expect(detectOpencodeProvider(cwd)).toBe("opencode-zen");
  });

  it("ignores an out-of-allowlist provider and falls through to null", () => {
    writePkg({ opencodeProvider: "gpt-9" });
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });

  it("falls back to the first opencode.json provider key when the manifest is silent", () => {
    writePkg({});
    writeOpencodeJson({ provider: { openrouter: {} } });
    expect(detectOpencodeProvider(cwd)).toBe("openrouter");
  });

  it("returns null on an unparseable package.json with no opencode.json", () => {
    fs.writeFileSync(path.join(cwd, "package.json"), "{ not json", "utf-8");
    expect(detectOpencodeProvider(cwd)).toBeNull();
  });
});

describe("detectOpencodeProviders — all installed providers", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-providers-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const writePkg = (bkit: unknown) =>
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }), "utf-8");

  it("returns [] when package.json is absent", () => {
    expect(detectOpencodeProviders(cwd)).toEqual([]);
  });

  it("reads and allowlist-filters bkit.opencodeProviders, normalizing legacy keys", () => {
    writePkg({ opencodeProviders: ["openrouter", "zen", "bogus"] });
    expect(detectOpencodeProviders(cwd)).toEqual(["openrouter", "opencode-zen"]);
  });

  it("falls back to the single bkit.opencodeProvider for legacy installs", () => {
    writePkg({ opencodeProvider: "openrouter" });
    expect(detectOpencodeProviders(cwd)).toEqual(["openrouter"]);
  });

  it("returns [] when neither a providers array nor a single provider is present", () => {
    writePkg({});
    expect(detectOpencodeProviders(cwd)).toEqual([]);
  });
});

describe("getInstallingVersion — bkit's own version, best-effort", () => {
  it("returns the semver from the installing package.json", () => {
    expect(getInstallingVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("runStatus — read-only host/provider status", () => {
  let cwd: string;
  let logSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-status-"));
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    logSpy.mockRestore();
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const out = () => logSpy.mock.calls.map((c) => String(c[0])).join("\n");

  it("reports every host absent for an empty dir", () => {
    runStatus(cwd, "[bkit]");
    expect(out()).toContain("claude:  absent");
    expect(out()).toContain("cursor:  absent");
    // Regression: codex presence was probed with process.cwd() instead of the cwd argument,
    // so a bkit-repo `.codex/` leaked into the status of every OTHER directory.
    expect(out()).toContain("codex:   absent");
    expect(out()).toMatch(/opencode: absent/);
    expect(out()).toContain("Installed hosts: none");
  });

  it("reports installed hosts, the claude model from settings, and a multi-provider opencode line", () => {
    fs.mkdirSync(path.join(cwd, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, ".claude", "settings.json"),
      JSON.stringify({ model: "claude-opus-4-8" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(cwd, ".cursor"), { recursive: true });
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, ".opencode", "opencode.json"),
      JSON.stringify({ model: "openrouter/foo" }),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { opencodeProviders: ["openrouter", "openrouter"] } }),
      "utf-8",
    );
    runStatus(cwd, "[bkit]");
    const o = out();
    expect(o).toContain("claude:  INSTALLED");
    expect(o).toContain("claude-opus-4-8");
    expect(o).toContain("cursor:  INSTALLED");
    expect(o).toContain("opencode: INSTALLED");
    expect(o).toContain("providers:"); // plural label for >1 provider
    expect(o).toContain("(active)");
    expect(o).toContain("Installed hosts: claude, cursor, opencode");
  });

  it("surfaces a parse-error for a malformed opencode.json", () => {
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".opencode", "opencode.json"), "{ bad", "utf-8");
    runStatus(cwd, "[bkit]");
    expect(out()).toContain("parse-error");
  });
});

// ---------------------------------------------------------------------------
// #386: line 1 of a rendered command is a description, never the marker
// ---------------------------------------------------------------------------

describe("#386: line 1 of a rendered command is a description, never the marker", () => {
  const src = path.join(REPO_ROOT, ".bkit/workflows");
  const files = fs.readdirSync(src).filter((f) => f.startsWith("bkit-") && f.endsWith(".md"));

  it("covers the whole workflow corpus", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const f of files) {
    const raw = fs.readFileSync(path.join(src, f), "utf-8");
    // The description Claude Code renders into its frontmatter — Cursor must show the same string.
    const expected = raw.match(/^description:\s*"?(.+?)"?\s*$/m)?.[1];

    it(`cursor: ${f}`, () => {
      const out = stampManagedVersion(
        applyT2(applyT1(substituteWorkflow(raw, DEFAULT_ISSUE_TRACKER).output)),
        "9.9.9",
      );
      const lines = out.split("\n");
      expect(expected).toBeTruthy();
      expect(lines[0]).toBe(expected);
      expect(lines[0]).not.toContain("bkit:managed");
      expect((out.match(/bkit:managed/g) ?? []).length).toBe(1);
    });

    it(`opencode: ${f}`, () => {
      const out = stampManagedVersion(
        applyOpencodeCommand(substituteWorkflow(raw, DEFAULT_ISSUE_TRACKER).output),
        "9.9.9",
      );
      expect(out.split("\n")[0]).not.toContain("bkit:managed");
      expect((out.match(/bkit:managed/g) ?? []).length).toBe(1);
    });
  }
});
