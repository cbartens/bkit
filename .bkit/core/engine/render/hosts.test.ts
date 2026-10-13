// render/hosts.test.ts — the Codex host's two renderers.
//
// Codex's agent format is TOML, not markdown-with-frontmatter: the TOML parses as intended,
// and each workflow skill carries the frontmatter Codex reads.

import { describe, expect, it, vi } from "vitest";
import {
  applyCodexAgent,
  escapeTomlMultiline,
  applyT1,
  applyT2,
  applyT3,
  applyOpencodeAgent,
  applyOpencodeCommand,
  applyOpencodeToolRewrites,
  applyAntigravityPrompt,
  applyAntigravitySkill,
  applyAntigravityToolRewrites,
  antigravityToolsBlock,
  OPENCODE_SESSION_PROMPT_ANCHOR,
  parseFrontmatter,
} from "./hosts";
import { formatModelPin, parseEffortMap } from "./models";
import { applyCodexSkill } from "../install/modules/codex";
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_ISSUE_TRACKER } from "../install/manifest";
import { substituteWorkflow } from "./trackers";
import { stampManagedVersion } from "../install/version-file";
import { getBkitDocsRoot } from "../shared/package-roots";

const effortMap = parseEffortMap(path.join(getBkitDocsRoot(), "prompts.md"));
const lookup = new Map([["a", "gpt-6-astra"]]);
const md = (fm: string, body = "Body.") => `---\n${fm}\n---\n${body}\n`;

/** Minimal TOML reader for the flat key/value + one multi-line string this renderer emits. */
function readToml(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  const ml = src.match(/^developer_instructions = """\n([\s\S]*)\n"""$/m);
  if (ml) out.developer_instructions = ml[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  for (const line of src.split("\n")) {
    const m = /^([a-z_]+) = "((?:[^"\\]|\\.)*)"$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return out;
}

describe("applyCodexAgent", () => {
  it("emits every field Codex requires", () => {
    const t = readToml(
      applyCodexAgent(md("name: a\ndescription: d\neffort: high"), lookup, effortMap),
    );
    expect(t.name).toBe("a");
    expect(t.description).toBe("d");
    expect(t.model).toBe("gpt-6-astra");
    expect(t.developer_instructions).toBe("Body.");
  });

  it("maps effort through the Codex column — max ceilings out at xhigh", () => {
    const eff = (e: string) =>
      readToml(applyCodexAgent(md(`name: a\ndescription: d\neffort: ${e}`), lookup, effortMap))
        .model_reasoning_effort;
    expect(eff("low")).toBe("low");
    expect(eff("high")).toBe("high");
    // Codex accepts low|medium|high|xhigh only — bkit's `max` has no rung above xhigh.
    expect(eff("max")).toBe("xhigh");
  });

  it("does NOT emit tools — Codex has no per-agent allowlist (openai/codex#6049)", () => {
    // No tools key (Codex ignores it).
    const out = applyCodexAgent(md("name: a\ndescription: d\ntools:\n  - Read\n  - Bash"), lookup);
    expect(out).not.toMatch(/^tools/m);
    expect(out).not.toContain("sandbox_mode");
  });

  it("model pin is bare — Codex names its gateway in [model_providers], not the pin", () => {
    expect(formatModelPin("codex", "openai", "gpt-6-astra")).toBe("gpt-6-astra");
  });

  it("survives a body containing a triple-quote run without truncating", () => {
    // The failure this guards: an unescaped `"""` closes the value early, and the rest of
    // the prompt is reparsed as TOML keys — a file that still parses, meaning something else.
    const body = 'before """ after';
    const out = applyCodexAgent(md("name: a\ndescription: d", body), lookup);
    expect(out).not.toContain('""" after');
    expect(readToml(out).developer_instructions).toBe(body);
  });

  it("escapes backslashes before quote runs, not after", () => {
    // Backslashes are escaped before quotes.
    expect(escapeTomlMultiline("a\\b")).toBe("a\\\\b");
    expect(escapeTomlMultiline('"""')).toBe('\\"\\"\\"');
  });

  it("escapes quotes and backslashes in single-line values", () => {
    const t = readToml(
      applyCodexAgent(md('name: a\ndescription: has "quotes" and \\ slash'), lookup),
    );
    expect(t.description).toBe('has "quotes" and \\ slash');
  });
});

describe("applyCodexSkill", () => {
  const wf =
    '---\ndescription: "Design Feature — Autonomous design phase"\n---\n\n# Design\n\nSteps.\n';

  it("adds the name Codex requires and keeps the description", () => {
    const out = applyCodexSkill(wf, "bkit-design", "github");
    expect(out).toMatch(/^---\nname: bkit-design\n/);
    expect(out).toContain('description: "Design Feature — Autonomous design phase"');
  });

  it("keeps the workflow body verbatim — the steps ARE the skill", () => {
    expect(applyCodexSkill(wf, "bkit-design", "github")).toContain("# Design\n\nSteps.");
  });

  it("supplies frontmatter when the workflow has none", () => {
    const out = applyCodexSkill("# Bare\n", "bkit-x", "github");
    expect(out).toMatch(/^---\nname: bkit-x\ndescription: .+\n---\n/);
  });
});

const REPO_ROOT = path.resolve(__dirname, "../../../..");

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
  const effortMap = parseEffortMap(path.join(getBkitDocsRoot(), "prompts.md"));

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
// applyOpencodeToolRewrites — OpenCode 2.0 splits subagent / skill
// ---------------------------------------------------------------------------

describe("applyOpencodeToolRewrites", () => {
  it("maps `Agent` → `subagent` and `Skill` → `skill` (not Cursor's single `Task`)", () => {
    const input = "Use the `Agent` tool, then the `Skill` tool.\n";
    const result = applyOpencodeToolRewrites(input);
    expect(result).toBe("Use the `subagent` tool, then the `skill` tool.\n");
    expect(result).not.toContain("`Task`");
  });

  it("maps the 'using `Agent` tool' / 'using `Skill` tool' spelled forms", () => {
    const input = "using `Agent` tool and using `Skill` tool\n";
    expect(applyOpencodeToolRewrites(input)).toBe("using `subagent` tool and using `skill` tool\n");
  });

  it("still respells @name → /name on **Subagent:** lines", () => {
    const input = "**Subagent:** @bkit-build-plan-execute\n";
    expect(applyOpencodeToolRewrites(input)).toBe("**Subagent:** /bkit-build-plan-execute\n");
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

  it("rewrites `Agent` tool → `subagent` tool (OpenCode 2.0 name)", () => {
    const input = `---\ndescription: x\n---\nUse the \`Agent\` tool here.\n`;
    expect(applyOpencodeCommand(input)).toContain("`subagent` tool");
    expect(applyOpencodeCommand(input)).not.toContain("`Agent` tool");
    expect(applyOpencodeCommand(input)).not.toContain("`Task` tool");
  });

  it("rewrites `Skill` tool → `skill` tool (OpenCode 2.0 splits the surfaces)", () => {
    const input = `---\ndescription: x\n---\nUse the \`Skill\` tool here.\n`;
    expect(applyOpencodeCommand(input)).toContain("`skill` tool");
    expect(applyOpencodeCommand(input)).not.toContain("`Skill` tool");
    expect(applyOpencodeCommand(input)).not.toContain("`Task` tool");
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
    expect(result).toContain(
      "**Subagent:** Invoke `/bkit-build-plan-execute` using `subagent` tool:",
    );
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
    expect(result).toContain("Invoke using `/name` with `subagent` tool.");
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
    expect(applyOpencodeCommand(input)).toContain("using `subagent` tool");
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
  const effortMap = parseEffortMap(path.join(getBkitDocsRoot(), "prompts.md"));

  it("emits mode: subagent, name, description, model", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: medium\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Edit\npermissionMode: acceptEdits\nmaxTurns: 100\n---\nBody here.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "openrouter");
    expect(result).toContain("mode: subagent");
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    // effort: medium → a separate `variant:` field (never a `#`-suffix on the model).
    expect(result).toContain("model: openrouter/qwen2.5:7b\n");
    expect(result).toContain("variant: high\n");
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

  it("respells MCP tools as opencode's <server>_<tool> ids, wildcard included", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - mcp__serena__*\n  - mcp__github__issue_read\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("  serena_*: true\n");
    expect(result).toContain("  github_issue_read: true\n");
    expect(result).not.toContain("mcp__");
  });

  it("maps effort: medium → variant: high (OpenCode column ceilings out)", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-4-6\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "openrouter");
    expect(result).toContain("model: openrouter/qwen2.5:7b\n");
    expect(result).toContain("variant: high\n");
    expect(result).not.toContain("qwen2.5:7b#");
    expect(result).not.toContain("effort:");
    expect(result).not.toContain("reasoningEffort:");
  });

  it("maps effort: high → variant: max", () => {
    const input = `---\nname: design-synthesize\ndescription: desc\neffort: high\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "openrouter");
    expect(result).toContain("model: openrouter/qwen2.5:14b\n");
    expect(result).toContain("variant: max\n");
  });

  it("maps effort: xhigh → variant: max", () => {
    const input = `---\nname: design-synthesize\ndescription: desc\neffort: xhigh\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "openrouter");
    expect(result).toContain("variant: max\n");
  });

  it("maps effort: low → variant: none", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-haiku-4-5-20251001\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "openrouter");
    expect(result).toContain("variant: none\n");
  });

  it("maps effort: max → variant: max", () => {
    const input = `---\nname: build-plan\ndescription: desc\neffort: max\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "openrouter");
    expect(result).toContain("variant: max\n");
  });

  it("omits the variant on the ollama gateway — its provider exposes no model variants", () => {
    // ollama builds its catalog with no `variants` at all, so any `variant:` is a hard
    // 2.0 error. The model runs at opencode's own default instead.
    const input = `---\nname: build-plan\ndescription: desc\neffort: high\nmodel: claude-opus-4-8\n---\nBody.\n`;
    const result = applyOpencodeAgent(input, opencodeModelLookup, effortMap, "ollama");
    expect(result).toContain("model: ollama/qwen2.5:7b\n");
    expect(result).not.toContain("variant:");
  });

  it("opencode provider column: medium → variant high, high/xhigh → max, low → none", () => {
    const zaiLookup = new Map([
      ["build-plan", "glm-5.1"],
      ["design-synthesize", "glm-5.2"],
    ]);
    expect(
      applyOpencodeAgent(
        `---\nname: build-plan\ndescription: desc\neffort: medium\nmodel: claude-sonnet-5\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("model: openrouter/glm-5.1\nvariant: high\n");
    expect(
      applyOpencodeAgent(
        `---\nname: design-synthesize\ndescription: desc\neffort: high\nmodel: claude-opus-5\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("model: openrouter/glm-5.2\nvariant: max\n");
    expect(
      applyOpencodeAgent(
        `---\nname: design-synthesize\ndescription: desc\neffort: xhigh\nmodel: claude-opus-5\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("model: openrouter/glm-5.2\nvariant: max\n");
    expect(
      applyOpencodeAgent(
        `---\nname: build-plan\ndescription: desc\neffort: low\nmodel: claude-haiku-4-5-20251001\n---\nBody.\n`,
        zaiLookup,
        effortMap,
        "openrouter",
      ),
    ).toContain("model: openrouter/glm-5.1\nvariant: none\n");
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
// Line 1 of a rendered command is a description, never the marker
// ---------------------------------------------------------------------------

describe("#386: line 1 of a rendered command is a description, never the marker", () => {
  const src = path.join(REPO_ROOT, ".bkit/core/workflows");
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

// ---------------------------------------------------------------------------
// Antigravity — tool map, prompt frontmatter, skill, invocation rewrite
// ---------------------------------------------------------------------------

describe("antigravityToolsBlock", () => {
  it("maps Claude tool names to Antigravity's vocabulary, keeping list shape", () => {
    const out = antigravityToolsBlock("tools:\n  - Read\n  - Write\n  - Edit\n  - Bash");
    expect(out).toBe(
      "tools:\n  - view_file\n  - write_to_file\n  - replace_file_content\n  - run_command\n",
    );
  });

  it("maps Grep/Glob and the web tools", () => {
    expect(antigravityToolsBlock("tools:\n  - Grep\n  - Glob\n  - WebSearch\n  - WebFetch")).toBe(
      "tools:\n  - grep_search\n  - list_dir\n  - search_web\n  - read_url\n",
    );
  });

  it("keeps MCP tool spelling unchanged", () => {
    expect(antigravityToolsBlock("tools:\n  - mcp__serena__*\n  - Read")).toBe(
      "tools:\n  - mcp__serena__*\n  - view_file\n",
    );
  });

  it("supports the inline array form and returns '' for no tools", () => {
    expect(antigravityToolsBlock("tools: [Read, Grep]")).toBe(
      "tools:\n  - view_file\n  - grep_search\n",
    );
    expect(antigravityToolsBlock(null)).toBe("");
    expect(antigravityToolsBlock("tools:\n")).toBe("");
  });
});

describe("applyAntigravityPrompt", () => {
  const lookup = new Map([["build-plan", "gemini-3.8-pro"]]);
  const effortMap = parseEffortMap(path.join(getBkitDocsRoot(), "prompts.md"));

  it("emits name, description, bare Google model and mapped tools", () => {
    const input = `---\nname: build-plan\ndescription: Execute plan tasks\neffort: high\ntools:\n  - Read\n  - Edit\npermissionMode: acceptEdits\nmaxTurns: 150\n---\nBody.\n`;
    const result = applyAntigravityPrompt(input, lookup, effortMap);
    expect(result).toContain("name: build-plan");
    expect(result).toContain("description: Execute plan tasks");
    expect(result).toContain("model: gemini-3.8-pro\n");
    expect(result).toContain("  - view_file\n");
    expect(result).toContain("  - replace_file_content\n");
    expect(result).not.toContain("permissionMode:");
    expect(result).not.toContain("maxTurns:");
  });

  it("maps effort through the Antigravity column — xhigh and max ceiling at max", () => {
    const eff = (e: string) =>
      applyAntigravityPrompt(
        `---\nname: build-plan\ndescription: d\neffort: ${e}\n---\nBody.\n`,
        lookup,
        effortMap,
      ).match(/^effort: (.+)$/m)?.[1];
    expect(eff("low")).toBe("low");
    expect(eff("medium")).toBe("medium");
    expect(eff("high")).toBe("high");
    expect(eff("xhigh")).toBe("max");
    expect(eff("max")).toBe("max");
  });

  it("exits non-zero when the Google model lookup is missing", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
    expect(() =>
      applyAntigravityPrompt(`---\nname: nope\ndescription: d\n---\nBody.\n`, lookup),
    ).toThrow("process.exit(1)");
    exitSpy.mockRestore();
  });

  it("returns content unchanged when there is no frontmatter", () => {
    const input = "# No frontmatter\nBody.\n";
    expect(applyAntigravityPrompt(input, lookup)).toBe(input);
  });
});

describe("applyAntigravityToolRewrites", () => {
  it("respells `Agent` / `Skill` tools to `view_file`", () => {
    const out = applyAntigravityToolRewrites("Use the `Agent` tool, then the `Skill` tool.\n");
    expect(out).toBe("Use the `view_file` tool, then the `view_file` tool.\n");
  });

  it("resolves **Subagent:** @name to the prompt file loaded with view_file", () => {
    const out = applyAntigravityToolRewrites(
      "1. **Subagent:** Invoke `@bkit-build-plan-execute` using `Agent` tool:\n",
    );
    expect(out).toContain(
      "**Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-execute.md` using `view_file` tool:",
    );
    expect(out).not.toContain("`@bkit-build-plan-execute`");
  });

  it("leaves @name in body prose untouched", () => {
    const input = "See @build-plan for details.\n";
    expect(applyAntigravityToolRewrites(input)).toBe(input);
  });
});

describe("applyAntigravitySkill", () => {
  const wf =
    '---\ndescription: "Build Feature — Autonomous implementation"\n---\n\n# Build\n\n**Subagent:** @bkit-build-challenge-1\n';

  it("adds name, keeps the description and rewrites invocations in the body", () => {
    const out = applyAntigravitySkill(wf, "bkit-build");
    expect(out).toMatch(/^---\nname: bkit-build\n/);
    expect(out).toContain('description: "Build Feature — Autonomous implementation"');
    expect(out).toContain(
      "**Subagent:** `view_file` `.agents/plugins/bkit/agents/bkit-build-challenge-1.md`",
    );
  });

  it("supplies frontmatter when the workflow has none", () => {
    const out = applyAntigravitySkill("# Bare\n", "bkit-x");
    expect(out).toMatch(/^---\nname: bkit-x\ndescription: .+\n---\n/);
  });
});
