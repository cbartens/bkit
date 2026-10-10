/**
 * audits/workflows/prompt-notation.test.ts
 *
 * Notation rules for `.bkit/prompts/**` prose. Distinct from
 * `audits/workflows/verdict-vocabulary.test.ts` (which checks that the vocabularies AGREE
 * across files) and from `audits/workflows/block-locality-audit.test.ts` (shell scoping):
 * this one checks how a token is WRITTEN.
 *
 * The rule: a token from a closed vocabulary is backticked — names and values
 * alike. One question, answerable by lookup rather than judgment: "is this
 * string in the vocabulary?"
 *
 * THE IMPORTANT ONE is the third test. Fenced output templates are NOT prose:
 * they are the literal bytes the agent writes into its artifact, and the
 * orchestrator greps them —
 *
 *     Read `build-summary.md` until `<!-- verdict:end -->` → extract `Verdict`
 *
 * so a backtick added to `Verdict: PASS | CONCERNS | FAIL` inside a fence
 * changes what lands on disk and can break extraction. Fences are left alone by
 * every rule here, and the third test enforces that they stay that way.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const PROMPT_DIR = ".bkit/prompts";

/**
 * Closed vocabulary: values that name a state, verdict, severity or mode.
 *
 * Emphasis words (NEVER, ALWAYS, MUST, ONLY) are absent — they are prose, written bare.
 */
const VOCABULARY = new Set([
  "PASS",
  "CONCERNS",
  "FAIL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "DONE",
  "BLOCKED",
  "SETTLED",
  "DISPROVEN",
  "TRUE",
  "FALSE",
  "SOAK",
  "NORMAL",
  "SINGLE",
  "SPLIT",
  "PENDING",
  "TRIAGED",
  "DEGRADED",
  "HEALTHY",
  "BROKEN",
  "MERGED",
  "STANDARD",
  "PIVOT",
  "FINAL",
]);

interface Line {
  file: string;
  no: number;
  text: string;
  fenced: boolean;
}

/** Every line of every prompt, tagged with whether it sits inside a fence. */
function promptLines(): Line[] {
  const out: Line[] = [];
  const abs = path.join(REPO_ROOT, PROMPT_DIR);
  if (!fs.existsSync(abs)) return out;
  for (const name of fs.readdirSync(abs).sort()) {
    if (!name.endsWith(".md")) continue;
    const file = `${PROMPT_DIR}/${name}`;
    let fenced = false;
    let ticks = 0;
    fs.readFileSync(path.join(abs, name), "utf-8")
      .split("\n")
      .forEach((text, i) => {
        const m = /^\s*(`{3,})/.exec(text);
        if (m) {
          if (!fenced) {
            fenced = true;
            ticks = m[1].length;
          } else if (m[1].length >= ticks) {
            fenced = false;
          }
          return; // the fence marker itself is neither prose nor body
        }
        out.push({ file, no: i + 1, text, fenced });
      });
  }
  return out;
}

/** Character ranges covered by inline code spans. */
function codeSpans(text: string): Array<[number, number]> {
  return [...text.matchAll(/`[^`]*`/g)].map((m) => [m.index!, m.index! + m[0].length]);
}

function outsideCode(text: string, at: number): boolean {
  return !codeSpans(text).some(([a, b]) => at >= a && at < b);
}

describe("prompt notation: the scan reaches real prose", () => {
  it("finds prompt files with both prose and fenced lines", () => {
    const lines = promptLines();
    expect(lines.filter((l) => !l.fenced).length).toBeGreaterThan(1000);
    expect(lines.filter((l) => l.fenced).length).toBeGreaterThan(200);
    expect(new Set(lines.map((l) => l.file)).size).toBeGreaterThan(40);
  });
});

/** A contract line is grepped by the orchestrator and stays 100% literal. */
function isContractLine(text: string): boolean {
  return /^(Verdict|Failures|Spike):/.test(text.trim());
}

describe("prompt notation: bracketed instructions inside a template are prose", () => {
  /**
   * A fenced output template holds two different kinds of content:
   *
   *   Verdict: PASS | CONCERNS | FAIL        <- literal bytes the agent writes
   *   ## Findings Log                        <- literal
   *   [**If** `Verdict` = `FAIL` → …]        <- an INSTRUCTION to the agent
   *
   * The bracketed spans are prose that happens to live inside a fence — they
   * already carry bold and backticks — so the prose notation rules apply to
   * them.
   *
   * Contract lines are excluded: `Verdict:` / `Failures:` / `Spike:` are what
   * the orchestrator greps, and their trailing `[Initially set to PENDING.]`
   * is a note rather than markup the agent must reproduce. Backtick-free is
   * the safer invariant there, enforced by the template test below.
   */
  it("no bare vocabulary literal inside a bracketed instruction span", () => {
    const bad: string[] = [];
    for (const line of promptLines()) {
      if (!line.fenced || isContractLine(line.text)) continue;
      for (const span of line.text.matchAll(/\[[^\]]*\]/g)) {
        for (const m of span[0].matchAll(/\b([A-Z][A-Z0-9_]{1,})\b/g)) {
          if (!VOCABULARY.has(m[1])) continue;
          if (!outsideCode(span[0], m.index!)) continue;
          bad.push(`${line.file}:${line.no}: bare ${m[1]} in template instruction`);
        }
      }
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });

  it("enum sets inside a bracketed instruction use the tight union form", () => {
    const bad: string[] = [];
    for (const line of promptLines()) {
      if (!line.fenced || isContractLine(line.text)) continue;
      for (const span of line.text.matchAll(/\[[^\]]*\]/g)) {
        for (const m of span[0].matchAll(
          /\b[A-Z][A-Z0-9_]{1,}(?:\s*[/|]\s*[A-Z][A-Z0-9_]{1,})+\b/g,
        )) {
          const parts = m[0].split(/[/|]/).map((p) => p.trim());
          if (!parts.every((p) => VOCABULARY.has(p))) continue;
          if (!outsideCode(span[0], m.index!)) continue;
          bad.push(`${line.file}:${line.no}: ${m[0]} — write \`${parts.join("|")}\``);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("prompt notation: closed-vocabulary tokens are backticked in prose", () => {
  it("no bare vocabulary literal outside a fence", () => {
    const bad: string[] = [];
    for (const line of promptLines()) {
      if (line.fenced) continue;
      for (const m of line.text.matchAll(/\b([A-Z][A-Z0-9_]{1,})\b/g)) {
        if (!VOCABULARY.has(m[1])) continue;
        if (!outsideCode(line.text, m.index!)) continue;
        bad.push(`${line.file}:${line.no}: bare ${m[1]} — write \`${m[1]}\``);
      }
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });

  it("enum sets use one tight backticked union, not spaced slashes or pipes", () => {
    const bad: string[] = [];
    for (const line of promptLines()) {
      if (line.fenced) continue;
      for (const m of line.text.matchAll(
        /\b[A-Z][A-Z0-9_]{1,}(?:\s*[/|]\s*[A-Z][A-Z0-9_]{1,})+\b/g,
      )) {
        const parts = m[0].split(/[/|]/).map((p) => p.trim());
        if (!parts.every((p) => VOCABULARY.has(p))) continue;
        if (!outsideCode(line.text, m.index!)) continue;
        bad.push(`${line.file}:${line.no}: ${m[0]} — write \`${parts.join("|")}\``);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("prompt notation: fenced output templates stay literal", () => {
  /**
   * The template is what the agent writes to disk. `Verdict:`, `Failures:` and
   * `Spike:` are grepped by the orchestrator, so a backtick here would change
   * the artifact's bytes, not just its appearance.
   */
  it("no backtick in a template's Verdict / Failures / Spike line", () => {
    const bad: string[] = [];
    for (const line of promptLines()) {
      if (!line.fenced) continue;
      if (!/^(Verdict|Failures|Spike):/.test(line.text.trim())) continue;
      if (line.text.includes("`")) bad.push(`${line.file}:${line.no}: ${line.text.trim()}`);
    }
    expect(bad).toEqual([]);
  });

  it("every template Verdict line still parses to a vocabulary set", () => {
    const seen: string[] = [];
    for (const line of promptLines()) {
      if (!line.fenced) continue;
      const m = /^Verdict:\s*(.+)$/.exec(line.text.trim());
      if (!m) continue;
      const vals = (m[1].match(/\b[A-Z][A-Z_]{2,}\b/g) ?? []).filter((v) => v !== "PENDING");
      expect(vals.length, `${line.file}:${line.no} declares no verdict values`).toBeGreaterThan(1);
      expect(
        vals.filter((v) => !VOCABULARY.has(v)),
        `${line.file}:${line.no} uses values outside the vocabulary`,
      ).toEqual([]);
      seen.push(line.file);
    }
    expect(seen.length).toBeGreaterThan(25);
  });
});

// ---------------------------------------------------------------------------
// Managed-version marker — never in a SOURCE prompt.
//
// `bkit install` / `upgrade` stamps `<!-- bkit:managed vX.Y.Z … -->` into the
// RENDERED agent under `.claude/agents/` etc. A source prompt that carries one
// ships a stale version string into every render and makes `bkit check` report
// drift that no edit can fix. The corpus actively misleads here: every rendered
// agent has the line, so copying a render back into a source reintroduces it.
// ---------------------------------------------------------------------------

describe("managed-version marker: sources carry none", () => {
  const sources = () => {
    const abs = path.join(REPO_ROOT, PROMPT_DIR);
    return fs
      .readdirSync(abs)
      .filter((n) => n.endsWith(".md"))
      .sort()
      .map((n) => ({
        file: `${PROMPT_DIR}/${n}`,
        text: fs.readFileSync(path.join(abs, n), "utf-8"),
      }));
  };

  it("enumerates prompt sources (not vacuous)", () => {
    expect(sources().length).toBeGreaterThan(10);
  });

  it("no .bkit/prompts/*.md source contains a bkit:managed marker", () => {
    const offenders = sources().filter(({ text }) => text.includes("bkit:managed"));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });
});
