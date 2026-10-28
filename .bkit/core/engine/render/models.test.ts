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
  unknownModelOverrides,
  parseModelLookupForColumn,
  opencodeProviderId,
} from "./models";
import { OPENCODE_PROVIDERS } from "../shared/egress";
import { getBkitDocsRoot, getPromptsRoot } from "../shared/package-roots";

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

/** The frontmatter `name` of every non-empty-named prompt file in .bkit/prompts/. */
function promptAgentNames(): string[] {
  return fs
    .readdirSync(getPromptsRoot())
    .filter((f) => f.endsWith(".md"))
    .map((f) =>
      fs.readFileSync(path.join(getPromptsRoot(), f), "utf-8").match(/^---\r?\n([\s\S]*?)\r?\n---/),
    )
    .flatMap((fmMatch) => (fmMatch ? [parseFrontmatter(fmMatch[1]).get("name") ?? ""] : []))
    .filter((name) => name !== "");
}

/** A test-only prompt on the haiku tier: no shipped prompt pins `claude-haiku-5-5`. */
const HAIKU_FIXTURE = "bkit-fixture-haiku";

/**
 * The shipped prompts.md with one haiku-tier row added under the § Models header, so the
 * tier's per-provider pins stay pinned while no shipped agent uses them.
 */
const HAIKU_PROMPTS = (() => {
  const real = fs.readFileSync(path.join(getBkitDocsRoot(), "prompts.md"), "utf-8");
  const header = real.indexOf("| Prompt | Anthropic |");
  const afterSeparator = real.indexOf("\n", real.indexOf("\n", header) + 1) + 1;
  const row = `| \`${HAIKU_FIXTURE}\` | \`claude-haiku-5-5\` | \`gpt-6-luna\` | \`gemini-3.8-flash\` | \`composer-2.5\` | \`z-ai/glm-5.3-flash\` | \`deepseek-v4.1-flash:1017\` | \`glm-5.3-flash\` | \`deepseek-v4.1-flash\` | \`high\` | 50 | test fixture |\n`;
  const file = path.join(os.tmpdir(), `haiku-prompts-${process.pid}.md`);
  fs.writeFileSync(file, real.slice(0, afterSeparator) + row + real.slice(afterSeparator));
  return file;
})();

// ---------------------------------------------------------------------------
// parseModelLookup — 42 rows, no missing names
// ---------------------------------------------------------------------------

describe("parseModelLookup", () => {
  it("parses one row per agent file in .bkit/prompts/", () => {
    const lookup = parseModelLookup(path.join(getBkitDocsRoot(), "prompts.md"));
    const agentFiles = fs.readdirSync(getPromptsRoot()).filter((f) => f.endsWith(".md"));
    expect(lookup.size).toBe(agentFiles.length);
    for (const [name, model] of lookup) {
      expect(name).toBeTruthy();
      expect(model).toBeTruthy();
    }
  });

  it("all .bkit/prompts/ files have a lookup row", () => {
    const lookup = parseModelLookup(path.join(getBkitDocsRoot(), "prompts.md"));
    const names = promptAgentNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !lookup.has(name))).toEqual([]);
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
    const lookup = parseModelLookup(path.join(getBkitDocsRoot(), "prompts.md"));
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/`/);
    }
  });
});

// ---------------------------------------------------------------------------
// parseEffortMap — prompts.md Effort → provider thinking table
// ---------------------------------------------------------------------------

describe("parseEffortMap", () => {
  const effortMap = parseEffortMap(path.join(getBkitDocsRoot(), "prompts.md"));

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
    expect(lookupEffort(effortMap, "opencode", "medium")).toBe("max");
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
    const lookup = buildOpencodeModelLookup(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "opencode-zen",
    );
    const agentFiles = fs.readdirSync(getPromptsRoot()).filter((f) => f.endsWith(".md"));
    expect(lookup.size).toBe(agentFiles.length);
    for (const [name, model] of lookup) {
      expect(name).toBeTruthy();
      expect(model).toBeTruthy();
    }
  });

  it("all .bkit/prompts/ files have an opencode model entry", () => {
    const lookup = buildOpencodeModelLookup(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "opencode-zen",
    );
    const names = promptAgentNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !lookup.has(name))).toEqual([]);
  });

  it("count matches parseModelLookup count (same catalog)", () => {
    const cursorLookup = parseModelLookup(path.join(getBkitDocsRoot(), "prompts.md"));
    const opencodeLookup = buildOpencodeModelLookup(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "opencode-zen",
    );
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
    const lookup = buildOpencodeModelLookup(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "opencode-zen",
    );
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
  // Tier anchors: ideate-1 = opus, ideate-2 = sonnet, HAIKU_FIXTURE = haiku,
  // build-challenge-2 / debug-failure-diagnose = key gates (the strongest model the cap carries).
  // OpenRouter opus+sonnet collapse onto V4.1 Flash; haiku stays on the cheapest sufficient pin.
  it("openrouter: v4.1-flash-1017 opus+sonnet, glm-5.3-flash haiku, gpt-6.1-sol key gates", () => {
    const lookup = buildOpencodeModelLookup(HAIKU_PROMPTS, "openrouter");
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("deepseek/deepseek-v4.1-flash-1017");
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("deepseek/deepseek-v4.1-flash-1017");
    expect(lookup.get(HAIKU_FIXTURE)).toBe("z-ai/glm-5.3-flash");
    expect(lookup.get("bkit-build-challenge-2")).toBe("openai/gpt-6.1-sol");
    expect(lookup.get("bkit-debug-failure-diagnose")).toBe("openai/gpt-6.1-sol");
    // The gateway prefix belongs to the renderer, not the table.
    expect(formatModelPin("opencode", "openrouter", lookup.get(HAIKU_FIXTURE)!)).toBe(
      "openrouter/z-ai/glm-5.3-flash",
    );
  });

  // Key gates run gpt-6.1-sol; kimi-k3 and the frozen slugs stay off the column.
  it("openrouter: key gates are gpt-6.1-sol; kimi-k3 and frozen v4-pro slugs stay off the column", () => {
    const lookup = buildOpencodeModelLookup(HAIKU_PROMPTS, "openrouter");
    const pins = [...lookup.values()];
    expect(pins).not.toContain("deepseek/deepseek-v4-pro");
    expect(pins).not.toContain("deepseek/deepseek-v4-pro-0813");
    expect(pins).not.toContain("moonshotai/kimi-k3");
    expect(pins.filter((m) => m === "openai/gpt-6.1-sol")).toHaveLength(4);
    expect(pins.some((m) => m === "deepseek/deepseek-v4.1-flash-1017")).toBe(true);
    expect(pins.some((m) => m === "z-ai/glm-5.3-flash")).toBe(true);
  });

  // Every Claude model bills past the column's weekly cap (providers.md § Budget band).
  it("openrouter: no Claude model is pinned in the column", () => {
    const lookup = buildOpencodeModelLookup(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "openrouter",
    );
    for (const model of lookup.values()) {
      expect(model).not.toMatch(/anthropic|claude/i);
    }
  });

  it("ollama (cloud): deepseek-v4.1-flash:1017 on every tier and the key gates", () => {
    const lookup = buildOpencodeModelLookup(HAIKU_PROMPTS, "ollama");
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("deepseek-v4.1-flash:1017");
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("deepseek-v4.1-flash:1017");
    expect(lookup.get(HAIKU_FIXTURE)).toBe("deepseek-v4.1-flash:1017");
    expect(lookup.get("bkit-build-challenge-2")).toBe("deepseek-v4.1-flash:1017");
    expect(lookup.get("bkit-debug-failure-diagnose")).toBe("deepseek-v4.1-flash:1017");
    expect(formatModelPin("opencode", "ollama", lookup.get(HAIKU_FIXTURE)!)).toBe(
      "ollama/deepseek-v4.1-flash:1017",
    );
  });

  it("every allowlisted provider ships a curated column", () => {
    for (const provider of OPENCODE_PROVIDERS) {
      const lookup = buildOpencodeModelLookup(path.join(getBkitDocsRoot(), "prompts.md"), provider);
      expect(lookup.size).toBeGreaterThan(0);
    }
  });

  it("openai (the Codex gateway) ships a column even though it is not an opencode provider", () => {
    const lookup = buildOpencodeModelLookup(path.join(getBkitDocsRoot(), "prompts.md"), "openai");
    expect(lookup.size).toBeGreaterThan(0);
  });

  it("unknown provider throws — no column, no substitute", () => {
    expect(() =>
      buildOpencodeModelLookup(path.join(getBkitDocsRoot(), "prompts.md"), "acme"),
    ).toThrow(/no prompts.md . Models column/);
  });

  it("opencode-zen: curated OpenCode Zen column (opencode/<id> — models.dev built-in id)", () => {
    // CLI key is opencode-zen; agent pins use the OpenCode built-in provider id `opencode`.
    const lookup = buildOpencodeModelLookup(HAIKU_PROMPTS, "opencode-zen");
    expect(lookup.size).toBeGreaterThan(0);
    // Cells are bare; the pin is built by formatModelPin, which maps the bkit gateway key
    // `opencode-zen` onto the OpenCode-side provider id `opencode` — NOT a pass-through.
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/^opencode(-zen)?\//);
      expect(formatModelPin("opencode", "opencode-zen", model)).toMatch(/^opencode\//);
      expect(formatModelPin("opencode", "opencode-zen", model)).not.toMatch(/^opencode-zen\//);
    }
    // opus + sonnet pin deepseek-v4.1-flash — kimi-k2.7-code exposes no model variants, so a
    // `variant:` pin there hard-errors on OpenCode 2.0 (V4.1 Flash exposes them).
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("deepseek-v4.1-flash"); // opus
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("deepseek-v4.1-flash"); // sonnet
    expect(lookup.get(HAIKU_FIXTURE)).toBe("glm-5.3-flash"); // haiku
    expect(lookup.get("bkit-build-challenge-2")).toBe("gpt-6.1-sol"); // key gates
  });

  it("opencode-go: curated OpenCode Go column (deepseek-v4.1-flash / gemini-4-argon)", () => {
    // opencode-go = the budget open-weight-only plan (https://opencode.ai/zen/go/v1). Go catalog is
    // invisible to /zen/v1/models — sourced via models.dev.
    const lookup = buildOpencodeModelLookup(HAIKU_PROMPTS, "opencode-go");
    expect(lookup.size).toBeGreaterThan(0);
    for (const [, model] of lookup) {
      expect(model).not.toMatch(/^opencode-go\//);
      expect(formatModelPin("opencode", "opencode-go", model)).toMatch(/^opencode-go\//);
    }
    expect(lookup.get("bkit-design-brainstorm-ideate-1")).toBe("deepseek-v4.1-flash"); // opus
    expect(lookup.get("bkit-design-brainstorm-ideate-2")).toBe("deepseek-v4.1-flash"); // sonnet
    expect(lookup.get(HAIKU_FIXTURE)).toBe("deepseek-v4.1-flash"); // haiku
    expect(lookup.get("bkit-build-challenge-2")).toBe("gemini-4-argon"); // key gates — Go serves no gpt-6.1-sol
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
      "| bkit-design-generate | openrouter | openrouter/x |\n| bkit-build-plan-verify | ollama | ollama/y |\n",
    );
    const rows = parseModelOverrides(f);
    expect(rows).toEqual([
      { prompt: "bkit-design-generate", provider: "openrouter", model: "openrouter/x" },
      { prompt: "bkit-build-plan-verify", provider: "ollama", model: "ollama/y" },
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

  it("unknown agent override reported", () => {
    const f = writeOverrides(
      "| gone-agent | openrouter | openrouter/z |\n| keep-me | openrouter | openrouter/x |\n| gone-agent | ollama | ollama/y |\n",
    );
    expect(unknownModelOverrides(f, new Set(["keep-me"]))).toEqual(["gone-agent"]);
    expect(unknownModelOverrides(f, new Set(["keep-me", "gone-agent"]))).toEqual([]);
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
    const cursorViaOld = parseModelLookup(path.join(getBkitDocsRoot(), "prompts.md"));
    const cursorViaNew = parseModelLookupForColumn(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "Cursor",
    );
    expect(cursorViaNew.size).toBe(cursorViaOld.size);
    for (const [name, model] of cursorViaOld) {
      expect(cursorViaNew.get(name)).toBe(model);
    }
  });

  it("returns a different set of values for 'opencode model' vs 'Cursor model'", () => {
    // This guards against the column parser accidentally reading the same column for both hosts.
    const cursorLookup = parseModelLookup(path.join(getBkitDocsRoot(), "prompts.md"));
    const opencodeLookup = buildOpencodeModelLookup(
      path.join(getBkitDocsRoot(), "prompts.md"),
      "opencode-zen",
    );
    // At least some values must differ (opencode uses ollama/*, cursor uses various)
    const differing = [...cursorLookup.keys()].filter(
      (name) => cursorLookup.get(name) !== opencodeLookup.get(name),
    );
    expect(differing.length).toBeGreaterThan(0);
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
