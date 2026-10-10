// render/models.test.ts — Unit tests for the § Models lookup, consumer overrides and the effort map.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "./hosts";
import {
  parseEffortMap,
  lookupEffort,
  effortColumnForProgram,
  formatModelPin,
  parseModelLookup,
  buildOpencodeModelLookup,
  parseModelOverrides,
  applyModelOverrides,
  parseModelLookupForColumn,
  opencodeProviderId,
} from "./models";

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

  // The effort table is keyed on PROGRAM: every opencode gateway shares one ladder.
  it("effort columns are keyed on program, not gateway", () => {
    expect(effortColumnForProgram("claude")).toBe("Claude");
    expect(effortColumnForProgram("cursor")).toBe("Cursor");
    expect(effortColumnForProgram("opencode")).toBe("OpenCode");
    expect(lookupEffort(effortMap, "opencode", "xhigh")).toBe("max");
    expect(lookupEffort(effortMap, "opencode", "medium")).toBe("high");
  });

  // A gateway key reaching this function throws; no fallback ladder.
  it("a gateway key is rejected — the axes must not be mixed", () => {
    for (const gateway of ["openrouter", "ollama", "opencode-zen", "opencode-go"]) {
      expect(() => effortColumnForProgram(gateway)).toThrow(/no prompts.md effort column/);
      expect(() => lookupEffort(effortMap, gateway, "high")).toThrow();
    }
  });

  // Below-target providers ceiling out, never downshift: a provider that scores under the
  // Claude tier target spends MORE thinking, not less.
  it("opencode columns ceiling out above low (never below the Default rung)", () => {
    const RANK: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, xhigh: 4, max: 5 };
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
  // The four OpenAI-compatible providers ship curated columns.
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

  // Convergent is not a DeepSeek slug; haiku is not V4 Flash.
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
    // invisible to /zen/v1/models — sourced via models.dev.
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

  it("a bkit:end quoted in prose inside the managed block does not open the override region", () => {
    const tmp = path.join(os.tmpdir(), `ovq-${Math.random().toString(36).slice(2)}.md`);
    fs.writeFileSync(
      tmp,
      `<!-- bkit:start -->\nAdd overrides below \`<!-- bkit:end -->\`.\n\n## Model Overrides\n\n| Prompt | Provider | Model |\n| --- | --- | --- |\n| evil | openrouter | openrouter/inject |\n\n<!-- bkit:end -->\n`,
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
// parseModelLookupForColumn — header-addressed, not positional
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

// ---------------------------------------------------------------------------
// renderOpencodeJson — provider block must match opencode's custom-provider schema
// (a stray `"api": "openai"` field makes opencode reject the whole config; env keys use
// {env:VAR}, never shell ${VAR}.)
// ---------------------------------------------------------------------------
describe("opencodeProviderId — bkit key → opencode-side provider id", () => {
  it("passes through custom providers (key === opencode id)", () => {
    for (const key of [
      "ollama",
      "openrouter",
      "openrouter",
      "openrouter",
      "openrouter",
      "ollama",
      "openrouter",
      "openrouter",
    ]) {
      expect(opencodeProviderId(key)).toBe(key);
    }
  });

  it("opencode-zen CLI key maps to built-in gateway id 'opencode' (models.dev)", () => {
    expect(opencodeProviderId("opencode-zen")).toBe("opencode");
  });

  it("opencode-go CLI key maps to built-in gateway id 'opencode-go'", () => {
    expect(opencodeProviderId("opencode-go")).toBe("opencode-go");
  });

  it("passes through an unknown key unchanged (defensive)", () => {
    expect(opencodeProviderId("acme")).toBe("acme");
  });
});
