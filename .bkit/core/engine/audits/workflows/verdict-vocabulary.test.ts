/**
 * audits/workflows/verdict-vocabulary.test.ts
 *
 * A verdict vocabulary is declared ONCE, in the producing agent's output template
 * (`.bkit/prompts/<agent>.md`):
 *
 *     Verdict: PASS | CONCERNS | FAIL
 *
 * `bkit steps finish --agent=<agent> --artifact=<file>` reads that line and refuses a
 * header outside it (commands/workflow/steps.test.ts). What the workflow can still get
 * wrong, and this audit checks from the files themselves (no hand-maintained list):
 *
 *   1. finish pairs each `--agent` with the `--artifact` in the same position — that
 *      artifact must be the one the agent's `Invoke `@agent`` block Creates / Updates,
 *      and the agent must declare a `Verdict:` line;
 *   2. a verdict held from finish (`Hold `verdict` as `VAR``) is only ever compared, in
 *      routes and gates, against values its agent can emit.
 *
 * Verdict variables computed by a command or an exit code rather than read from an
 * artifact (ship's `MERGE_VERDICT`, build/debug's `TEST_VERDICT`, …) have no producing
 * agent — EXEMPT_COMPUTED names them; any other gated variable with no agent fails.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const WORKFLOW_DIR = ".bkit/workflows";
const PROMPT_DIR = ".bkit/prompts";

/**
 * Verdict variables the workflow computes itself (exit codes, a command's
 * outcome, a fold over status.jsonl) rather than reading from a subagent artifact.
 * These have no prompt-side declaration.
 */
const EXEMPT_COMPUTED = new Set([
  "MERGE_VERDICT", // ship: `bkit prs merge` from the merge outcome
  "TEST_VERDICT", // build/debug derive it from the test-run exit code
  "BOUNDARY_VERDICT", // build derives it from the sub-plan boundary gate's exit code
  "FETCH_VERDICT", // debug: `bkit context finalise` from context-fetch block outcomes
  "DEBUG_MODE", // routing mode, not an artifact verdict
  "DIAGNOSE_MODE",
  "PUSH_MODE",
]);

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

function listMd(dir: string): string[] {
  const abs = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => `${dir}/${f}`);
}

/** Strip `-{PLACEHOLDER}` / `-<attempt>` segments and a trailing `-log` from an artifact stem. */
function normaliseArtifact(stem: string): string {
  return stem
    .replace(/-?\{[A-Z_]+\}/g, "")
    .replace(/-?<attempt>/g, "")
    .replace(/-log$/, "");
}

/** Levenshtein distance — two verdict names one edit apart are a typo hazard. */
function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur.push(
        Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Values an enum union string names, e.g. "PASS|CONCERNS|FAIL". */
function members(union: string): Set<string> {
  return new Set(union.split("|").filter(Boolean));
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

/** agent name -> the verdict values its output template declares. */
export function promptDeclarations(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const rel of listMd(PROMPT_DIR)) {
    const m = /^Verdict:\s*(.+)$/m.exec(read(rel));
    if (!m) continue;
    const vals = (m[1].match(/\b[A-Z][A-Z_]{2,}\b/g) ?? []).filter((v) => v !== "PENDING");
    if (vals.length) out.set(path.basename(rel, ".md"), new Set(vals));
  }
  return out;
}

/** artifact stem -> the agents whose dispatch blocks Create / Update it. */
export function artifactProducers(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const rel of listMd(WORKFLOW_DIR)) {
    let current: string | null = null;
    for (const line of read(rel).split("\n")) {
      const inv = /Invoke `@(bkit-[a-z0-9-]+)`/.exec(line);
      if (inv) current = inv[1];
      if (!current) continue;
      for (const m of line.matchAll(/(?:Create|Update):[^\n]*?([a-zA-Z0-9{}_-]+)\.md/g)) {
        const stem = normaliseArtifact(m[1]);
        if (!out.has(stem)) out.set(stem, new Set());
        out.get(stem)!.add(current);
      }
    }
  }
  return out;
}

export interface FinishPair {
  workflow: string;
  agent: string;
  artifact: string;
}

/** Every `steps finish` `--agent` with the `--artifact` in the same position. */
export function finishPairs(): FinishPair[] {
  const out: FinishPair[] = [];
  for (const rel of listMd(WORKFLOW_DIR)) {
    for (const line of read(rel).split("\n")) {
      if (!/"\{BKIT\}" steps finish\b/.test(line)) continue;
      const agents = [...line.matchAll(/--agent=([a-z0-9-]+)/g)].map((m) => m[1]!);
      const artifacts = [...line.matchAll(/--artifact="?([^"\s]+)"?/g)].map((m) => m[1]!);
      agents.forEach((agent, i) => {
        const file = artifacts[i] ?? "";
        const stem = /([a-zA-Z0-9{}<>_-]+)\.md$/.exec(file)?.[1] ?? file;
        out.push({ workflow: rel, agent, artifact: normaliseArtifact(stem) });
      });
    }
  }
  return out;
}

/** verdict variable -> the agent of the `steps finish` it is held from, per workflow. */
export function heldVerdicts(): Map<string, { workflow: string; agent: string | null }> {
  const out = new Map<string, { workflow: string; agent: string | null }>();
  for (const rel of listMd(WORKFLOW_DIR)) {
    let agent: string | null = null;
    for (const line of read(rel).split("\n")) {
      if (/"\{BKIT\}" steps finish\b/.test(line))
        agent = /--agent=([a-z0-9-]+)/.exec(line)?.[1] ?? null;
      for (const m of line.matchAll(/[Hh]old `verdict` as `\{?([A-Z][A-Z0-9_]*)\}?`/g)) {
        out.set(m[1]!, { workflow: rel, agent });
      }
    }
  }
  return out;
}

export interface GateDecl {
  workflow: string;
  variable: string;
  union: string;
}

/** Every `(`VAR` in `A|B|C`)` validity assertion in a gate checklist. */
export function gateDeclarations(): GateDecl[] {
  const out: GateDecl[] = [];
  for (const rel of listMd(WORKFLOW_DIR)) {
    for (const m of read(rel).matchAll(
      /`([A-Z][A-Z0-9_]*(?:_VERDICT|_MODE))`\s+in\s+`([A-Z][A-Z0-9_|]*)`/g,
    )) {
      out.push({ workflow: rel, variable: m[1], union: m[2] });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("verdict vocabulary: extraction reaches the real corpus", () => {
  it("finds prompt declarations, finish pairs, producers and held verdicts", () => {
    expect(promptDeclarations().size).toBeGreaterThan(25);
    expect(finishPairs().length).toBeGreaterThan(25);
    expect(artifactProducers().size).toBeGreaterThan(20);
    expect(heldVerdicts().size).toBeGreaterThan(5);
  });
});

describe("verdict vocabulary: steps finish reads the right agent's artifact", () => {
  const prompts = promptDeclarations();
  const producers = artifactProducers();
  for (const pair of finishPairs()) {
    it(`${pair.workflow} — --agent=${pair.agent} --artifact=…${pair.artifact}.md`, () => {
      expect(prompts.get(pair.agent), `${pair.agent}.md declares no "Verdict:" line`).toBeTruthy();
      const made = producers.get(pair.artifact);
      expect(made, `no agent Creates ${pair.artifact}.md`).toBeTruthy();
      expect([...made!], `${pair.artifact}.md is not ${pair.agent}'s artifact`).toContain(
        pair.agent,
      );
    });
  }
});

describe("verdict vocabulary: held verdicts are compared only against emittable values", () => {
  const prompts = promptDeclarations();
  const held = heldVerdicts();

  for (const [variable, { workflow, agent }] of held) {
    if (EXEMPT_COMPUTED.has(variable) || agent === null) continue;
    it(`${workflow} — \`${variable}\` (${agent})`, () => {
      const declared = prompts.get(agent)!;
      const text = read(workflow);
      const used = [
        ...text.matchAll(new RegExp(`\`${variable}\`\\s*!?=\\s*\`?([A-Z][A-Z_]+)\`?`, "g")),
      ].map((m) => m[1]!);
      const stray = used.filter((v) => !declared.has(v));
      expect(stray, `${agent} never emits ${stray.join(", ")}`).toEqual([]);
    });
  }

  for (const gate of gateDeclarations()) {
    it(`${gate.workflow} — gate \`${gate.variable}\` in \`${gate.union}\``, () => {
      if (EXEMPT_COMPUTED.has(gate.variable)) return;
      const source = held.get(gate.variable);
      expect(
        source?.agent,
        `${gate.variable} is gated but held from no agent's steps finish — add it to ` +
          `EXEMPT_COMPUTED if the workflow computes it.`,
      ).toBeTruthy();
      const declared = prompts.get(source!.agent!)!;
      const gated = members(gate.union);
      expect({
        missing: [...declared].filter((v) => !gated.has(v)),
        extra: [...gated].filter((v) => !declared.has(v)),
      }).toEqual({ missing: [], extra: [] });
    });
  }
});

describe("verdict vocabulary: enum unions are written one way", () => {
  it("gate unions use tight pipes, never spaced pipes or slashes", () => {
    const bad: string[] = [];
    for (const rel of listMd(WORKFLOW_DIR)) {
      read(rel)
        .split("\n")
        .forEach((line, i) => {
          if (!/`[A-Z][A-Z0-9_]*(?:_VERDICT|_MODE)`\s+in\s+/.test(line)) return;
          if (/`[A-Z][A-Z0-9_]*(?:\s+[|/]\s+[A-Z][A-Z0-9_]*)+`/.test(line)) {
            bad.push(`${rel}:${i + 1}: ${line.trim()}`);
          }
        });
    }
    expect(bad).toEqual([]);
  });

  it("canonical verdict order is PASS|CONCERNS|FAIL wherever all three appear", () => {
    const bad: string[] = [];
    for (const rel of [...listMd(WORKFLOW_DIR), ...listMd(PROMPT_DIR)]) {
      read(rel)
        .split("\n")
        .forEach((line, i) => {
          for (const m of line.matchAll(/`([A-Z][A-Z0-9_|]*)`/g)) {
            const set = members(m[1]);
            if (set.size === 3 && set.has("PASS") && set.has("CONCERNS") && set.has("FAIL")) {
              if (m[1] !== "PASS|CONCERNS|FAIL") bad.push(`${rel}:${i + 1}: \`${m[1]}\``);
            }
          }
        });
    }
    expect(bad).toEqual([]);
  });
});

describe("verdict vocabulary: variable names match their step", () => {
  /**
   * A verdict variable should name its step once. `REMEDIATE_CHALLENGE_VERDICT`
   * named the challenge-remediate step in reverse, against both the agent
   * (`bkit-build-challenge-remediate`) and the counter
   * (`CHALLENGE_REMEDIATE_ATTEMPT`) — three names for one step, one of them
   * inverted. Where a counter exists for the same step, the two must agree.
   */
  it("a *_VERDICT and its matching *_ATTEMPT counter use the same word order", () => {
    const text = listMd(WORKFLOW_DIR).map(read).join("\n");
    const verdicts = new Set(text.match(/\b[A-Z][A-Z0-9_]*_VERDICT\b/g) ?? []);
    const counters = new Set(
      (text.match(/\b[A-Z][A-Z0-9_]*_ATTEMPT\b/g) ?? []).map((c) => c.replace(/^MAX_/, "")),
    );
    const bad: string[] = [];
    for (const v of verdicts) {
      const stem = v.replace(/_VERDICT$/, "");
      if (stem.split("_").length < 2) continue;
      const reversed = stem.split("_").reverse().join("_");
      if (counters.has(`${reversed}_ATTEMPT`) && !counters.has(`${stem}_ATTEMPT`)) {
        bad.push(
          `${v} is inverted against counter ${reversed}_ATTEMPT — rename to ${reversed}_VERDICT`,
        );
      }
    }
    expect(bad).toEqual([]);
  });

  /**
   * No two verdict variables in one workflow are one edit apart (e.g.
   * `CHALLENGE_TESTS_VERDICT` is never renamed `TESTS_VERDICT`, one character from
   * `TEST_VERDICT` in `bkit-build.md`).
   */
  it("no two verdict variables are within one edit of each other", () => {
    const perFile = new Map<string, Set<string>>();
    for (const rel of listMd(WORKFLOW_DIR)) {
      perFile.set(rel, new Set(read(rel).match(/\b[A-Z][A-Z0-9_]*_VERDICT\b/g) ?? []));
    }
    const bad: string[] = [];
    for (const [rel, names] of perFile) {
      const list = [...names].sort();
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          if (editDistance(list[i], list[j]) <= 1) {
            bad.push(`${rel}: ${list[i]} and ${list[j]} differ by one edit`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  /**
   * Every multi-word name must EARN its extra word: dropping any one word has
   * to produce a name that already exists in the same workflow, is claimed by a
   * sibling, or lands within one edit of a live name.
   */
  it("every multi-word verdict name has no conflict-free shortening", () => {
    const all = new Set<string>();
    const files = new Map<string, Set<string>>();
    for (const rel of listMd(WORKFLOW_DIR)) {
      const found = new Set(read(rel).match(/\b[A-Z][A-Z0-9_]*_VERDICT\b/g) ?? []);
      files.set(rel, found);
      found.forEach((v) => all.add(v));
    }
    const shortenable: string[] = [];
    for (const v of all) {
      const parts = v.replace(/_VERDICT$/, "").split("_");
      if (parts.length < 2) continue;
      for (let i = 0; i < parts.length; i += 1) {
        const cand = `${parts.filter((_, k) => k !== i).join("_")}_VERDICT`;
        if (all.has(cand)) continue;
        // claimed by a sibling multi-word name that shares a file?
        const siblings = [...all].filter((o) => {
          const op = o.replace(/_VERDICT$/, "").split("_");
          if (o === v || op.length < 2) return false;
          return op.some((_, k) => `${op.filter((_, q) => q !== k).join("_")}_VERDICT` === cand);
        });
        const shares = siblings.some((s) =>
          [...files.values()].some((set) => set.has(s) && set.has(v)),
        );
        const near = [...all].some((o) => o !== v && editDistance(o, cand) <= 1);
        if (!shares && !near) shortenable.push(`${v} -> ${cand}`);
      }
    }
    expect(shortenable, `these names can now be shortened: ${shortenable.join(", ")}`).toEqual([]);
  });

  it("no verdict variable was left under its old name", () => {
    const text = listMd(WORKFLOW_DIR).concat(listMd(PROMPT_DIR)).map(read).join("\n");
    expect(text).not.toMatch(/\bUPDATE_DOCS_VERDICT\b/);
    expect(text).not.toMatch(/\bREMEDIATE_CHALLENGE_VERDICT\b/);
  });
});
