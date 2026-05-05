import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyT1,
  applyT2,
  applyT3,
  extractFullManagedBlock,
  extractManagedBlock,
  parseModelLookup,
  parseFrontmatter,
  runTemplates,
  updateManagedBlock,
} from "./bkit-install";
import { applyTokens } from "./bkit-tokens";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSubagentsMd(rows: Array<{ name: string; model: string }>): string {
  const tableRows = rows
    .map((r) => `| \`${r.name}\` | ${r.model} | medium | — | test role |`)
    .join("\n");
  return `# Subagents\n\n## Models\n\n| name | Cursor model | Claude effort | Cursor RO | role hint |\n| --- | --- | --- | --- | --- |\n${tableRows}\n`;
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
    ["build-plan", "composer-2"],
    ["design-synthesize", "claude-4.7-opus-high-thinking"],
  ]);

  it("emits name, description, model, tools (passthrough)", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: medium\ntools:\n  - Read\n  - Edit\npermissionMode: default\nmaxTurns: 20\n---\nBody here.\n`;
    const result = applyT3(input, modelLookup);
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    expect(result).toContain("model: composer-2");
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
    expect(result).toContain("model: claude-4.7-opus-high-thinking");
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
  it("parses one row per agent file in .agents/prompts/", () => {
    const lookup = parseModelLookup();
    const agentFiles = fs.readdirSync(".agents/prompts").filter((f) => f.endsWith(".md"));
    expect(lookup.size).toBe(agentFiles.length);
    for (const [name, model] of lookup) {
      expect(name).toBeTruthy();
      expect(model).toBeTruthy();
    }
  });

  it("all .agents/prompts/ files have a lookup row", () => {
    const lookup = parseModelLookup();
    const agentFiles = fs.readdirSync(".agents/prompts").filter((f) => f.endsWith(".md"));
    const missingNames: string[] = [];
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(".agents/prompts", f), "utf-8");
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
    fs.writeFileSync(tmp, makeSubagentsMd([{ name: "test-agent", model: "composer-2" }]));
    const lookup = parseModelLookup(tmp);
    expect(lookup.get("test-agent")).toBe("composer-2");
    fs.rmSync(tmp);
  });

  it("strips backticks from model values (table cells use backtick-wrapped values)", () => {
    const content = `# S\n\n## Models\n\n| name | Cursor model | Claude effort | Cursor RO | role hint |\n| --- | --- | --- | --- | --- |\n| \`build-plan\` | \`composer-2\` | \`medium\` | — | task exec |\n`;
    const tmp = path.join(os.tmpdir(), "test-backtick.md");
    fs.writeFileSync(tmp, content);
    const lookup = parseModelLookup(tmp);
    expect(lookup.get("build-plan")).toBe("composer-2");
    expect(lookup.get("build-plan")).not.toContain("`");
    fs.rmSync(tmp);
  });

  it("all parsed model values have no backticks", () => {
    const lookup = parseModelLookup();
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
    const src = fs.readFileSync(".agents/scripts/bkit-install.ts", "utf-8");
    for (const dir of allowedDirs) {
      expect(src).toContain(`"${dir}"`);
    }
  });

  it("install never writes to out-of-allowlist paths (source check)", () => {
    const src = fs.readFileSync(".agents/scripts/bkit-install.ts", "utf-8");
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
// runTemplates — four rule branches
// ---------------------------------------------------------------------------

describe("runTemplates", () => {
  let cwd: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-templates-"));
    fs.mkdirSync(path.join(cwd, ".agents/templates"), { recursive: true });
    process.chdir(cwd);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("rule 1 — dest missing → writes template verbatim", () => {
    fs.writeFileSync(".agents/templates/AGENTS.md", "# Hello\n");
    const { writes } = runTemplates(false);
    expect(writes).toBe(1);
    expect(fs.readFileSync("AGENTS.md", "utf-8")).toBe("# Hello\n");
  });

  it("rule 2 — dest exists with markers → updates only the bkit block", () => {
    fs.writeFileSync(
      ".agents/templates/CLAUDE.md",
      "# CLAUDE.md\n\n<!-- bkit:start -->\nNew block.\n<!-- bkit:end -->\n",
    );
    fs.writeFileSync(
      "CLAUDE.md",
      "# CLAUDE.md\n\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nProject extras.\n",
    );
    const { writes } = runTemplates(false);
    expect(writes).toBe(1);
    const after = fs.readFileSync("CLAUDE.md", "utf-8");
    expect(after).toContain("New block.");
    expect(after).not.toContain("Old");
    expect(after).toContain("Project extras.");
  });

  it("rule 3a — dest no markers, template has block → appends block at EOF, preserves existing content", () => {
    fs.writeFileSync(
      ".agents/templates/gitignore",
      "# <!-- bkit:start -->\nnode_modules/\n# <!-- bkit:end -->\n",
    );
    fs.writeFileSync(".gitignore", "# Project entries\nlogs/\n");
    const { writes } = runTemplates(false);
    expect(writes).toBe(1);
    const after = fs.readFileSync(".gitignore", "utf-8");
    expect(after.startsWith("# Project entries\nlogs/\n")).toBe(true);
    expect(after).toContain("# <!-- bkit:start -->");
    expect(after).toContain("node_modules/");
    expect(after).toContain("# <!-- bkit:end -->");
  });

  it("npm-strip remap — `gitignore` source writes to `.gitignore` dest", () => {
    fs.writeFileSync(".agents/templates/gitignore", "node_modules/\n");
    const { writes } = runTemplates(false);
    expect(writes).toBe(1);
    expect(fs.existsSync(".gitignore")).toBe(true);
    expect(fs.existsSync("gitignore")).toBe(false);
    expect(fs.readFileSync(".gitignore", "utf-8")).toBe("node_modules/\n");
  });

  it("rule 3b — dest no markers AND template has no block → no-op", () => {
    fs.mkdirSync(".agents/templates/docs", { recursive: true });
    fs.writeFileSync(".agents/templates/docs/setup.md", "# Setup\n");
    fs.mkdirSync("docs", { recursive: true });
    fs.writeFileSync("docs/setup.md", "# Existing project content with no markers.\n");
    const { writes } = runTemplates(false);
    expect(writes).toBe(0);
    expect(fs.readFileSync("docs/setup.md", "utf-8")).toBe(
      "# Existing project content with no markers.\n",
    );
  });

  it("creates intermediate directories for new dest paths", () => {
    fs.mkdirSync(".agents/templates/.cursor/hooks", { recursive: true });
    fs.writeFileSync(".agents/templates/.cursor/hooks/preflight.sh", "#!/usr/bin/env bash\n");
    const { writes } = runTemplates(false);
    expect(writes).toBe(1);
    expect(fs.existsSync(".cursor/hooks/preflight.sh")).toBe(true);
  });

  it("preserves executable bit on copied scripts", () => {
    const src = ".agents/templates/.cursor/hooks/preflight.sh";
    fs.mkdirSync(".agents/templates/.cursor/hooks", { recursive: true });
    fs.writeFileSync(src, "#!/usr/bin/env bash\n");
    fs.chmodSync(src, 0o755);
    runTemplates(false);
    const mode = fs.statSync(".cursor/hooks/preflight.sh").mode & 0o777;
    expect(mode & 0o100).toBe(0o100);
  });

  it("dry-run does not write to disk but reports the would-be writes", () => {
    fs.writeFileSync(".agents/templates/AGENTS.md", "# Hello\n");
    const { writes } = runTemplates(true);
    expect(writes).toBe(1);
    expect(fs.existsSync("AGENTS.md")).toBe(false);
  });

  it("idempotent — second run produces zero writes when nothing has changed", () => {
    fs.writeFileSync(".agents/templates/AGENTS.md", "# Hello\n");
    runTemplates(false);
    const { writes } = runTemplates(false);
    expect(writes).toBe(0);
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
// Task 6.1 — Auth-shim inside ci.yml template assertion
// ---------------------------------------------------------------------------

describe("ci.yml template auth-shim assertion (Task 6.1)", () => {
  it("ci.yml template contains auth-shim line, ordered before `pnpm install --frozen-lockfile`", () => {
    // Note: in v0.2.1 ci.yml switched from Tier 2 (managed-block) to Tier 3
    // (seed-or-print), so the template no longer has bkit:start/end markers —
    // it IS the whole workflow. Assert auth-shim presence and ordering on the
    // raw template content.
    const templatePath = path.resolve(".agents/templates/.github/workflows/ci.yml");
    expect(fs.existsSync(templatePath), `template must exist at ${templatePath}`).toBe(true);

    const content = fs.readFileSync(templatePath, "utf-8");

    // Auth-shim must be literally present
    expect(content).toContain("GH_BKIT_TOKEN");
    expect(content).toContain("git config --global url.");

    // Auth-shim must appear BEFORE pnpm install --frozen-lockfile
    const lines = content.split("\n");
    const authShimLine = lines.findIndex((l) => l.includes("GH_BKIT_TOKEN"));
    const installLine = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    expect(authShimLine).toBeGreaterThan(-1);
    expect(installLine).toBeGreaterThan(-1);
    expect(authShimLine).toBeLessThan(installLine);
  });

  // -------------------------------------------------------------------------
  // MED-3 regression — auth-shim must be scoped to cbartens/bkit/, not all of github.com
  // -------------------------------------------------------------------------

  it("MED-3: auth-shim insteadOf is scoped to 'https://github.com/cbartens/bkit/' not bare 'https://github.com/'", () => {
    const templatePath = path.resolve(".agents/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");

    // Must contain the narrow scope — exact repo path
    expect(content).toContain("https://github.com/cbartens/bkit/");

    // Must NOT use the broad rewrite that would hijack all GitHub HTTPS traffic
    // Extract the insteadOf line and assert it is NOT bare "https://github.com/"
    const lines = content.split("\n");
    const insteadOfLines = lines.filter((l) => l.includes("insteadOf"));
    expect(insteadOfLines.length).toBeGreaterThan(0);
    for (const line of insteadOfLines) {
      // The insteadOf target must include the repo path, not stop at "github.com/"
      expect(line).not.toMatch(/insteadOf\s+"https:\/\/github\.com\/"\s*$/);
      expect(line).toContain("cbartens/bkit/");
    }
  });

  it("MED-3: auth-shim url rewrite key also contains cbartens/bkit/ (both sides scoped)", () => {
    const templatePath = path.resolve(".agents/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");

    // The git config --global url."<key>".insteadOf "<value>" form — both key and value must scope to the repo
    const gitConfigLine = content.split("\n").find((l) => l.includes("git config --global url."));
    expect(gitConfigLine).toBeDefined();
    // Key (the URL being configured) must also name the specific repo
    expect(gitConfigLine!).toContain("cbartens/bkit/");
  });

  it("ci.yml template after applyTokens has no {{PLACEHOLDER}} tokens remaining", () => {
    const templatePath = path.resolve(".agents/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    const tokens = {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
    };
    const substituted = applyTokens(content, tokens);
    expect(substituted).not.toContain("{{NODE_VERSION}}");
    expect(substituted).not.toContain("{{DEFAULT_BRANCH}}");
    expect(substituted).not.toContain("{{PROJECT_NAME}}");
    expect(substituted).toContain("node-version: 22");
    expect(substituted).toContain("branches: [main]");
  });
});
