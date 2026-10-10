// bkit-codex-render.test.ts — the Codex host's two renderers.
//
// Codex's agent format is TOML, not markdown-with-frontmatter: the TOML parses as intended,
// and each workflow skill carries the frontmatter Codex reads.
import { describe, expect, it } from "vitest";
import {
  applyCodexAgent,
  escapeTomlMultiline,
  formatModelPin,
  parseEffortMap,
} from "./bkit-install";
import { applyCodexSkill } from "./bkit-modules";

const effortMap = parseEffortMap(".bkit/prompts.md");
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
