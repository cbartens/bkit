/**
 * bkit-verdict-vocabulary.test.ts
 *
 * Every verdict vocabulary is declared TWICE, in two files that must agree:
 *
 *   1. the producing agent's output template, in `.bkit/prompts/<agent>.md`:
 *          Verdict: PASS | CONCERNS | FAIL
 *   2. the consuming workflow's gate checklist, in `.bkit/workflows/<wf>.md`:
 *          - [ ] `Verdict` extracted and valid (`DIAGNOSE_VERDICT` in `PASS|CONCERNS|FAIL`)
 *
 * Nothing kept those two in step, and they drifted: `bkit-ship.md` gated
 * `DIAGNOSE_VERDICT` in `PASS|FAIL` while dispatching `@bkit-debug-failure-diagnose`,
 * the very same agent `bkit-build.md` and `bkit-debug.md` gate as
 * `PASS|CONCERNS|FAIL`. A CONCERNS diagnosis during a ship failure would fail
 * the gate on a legitimate verdict.
 *
 * The linkage is recovered from the files themselves, so there is no
 * hand-maintained vocabulary list to fall out of date:
 *
 *   variable --(workflow "extract `Verdict` ... as `VAR`")--> artifact
 *   artifact --(workflow "Invoke `@agent`" + "Create:")-------> agent
 *   agent    --(prompt "Verdict:" line)----------------------> declared set
 *
 * Verdict variables computed in bash rather than read from an artifact (ship's
 * `DOCS_VERDICT`, `MERGE_VERDICT`, debug's `TEST_VERDICT`) have no producing
 * agent and are skipped — EXEMPT_COMPUTED names them so a genuinely unlinked
 * variable cannot hide among them.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKFLOW_DIR = ".bkit/workflows";
const PROMPT_DIR = ".bkit/prompts";

/**
 * Verdict variables the workflow computes itself (bash, exit codes, or a
 * fold over status.jsonl) rather than extracting from a subagent artifact.
 * These have no prompt-side declaration by design.
 */
const EXEMPT_COMPUTED = new Set([
  "DOCS_VERDICT", // ship derives it from a `jq` SHIPPED-row assertion on .bkit/issues.jsonl
  "MERGE_VERDICT", // ship derives it from the merge outcome
  "TEST_VERDICT", // build/debug derive it from the test-run exit code
  "BOUNDARY_VERDICT", // build derives it from the sub-plan boundary gate's exit code
  "FETCH_VERDICT", // debug derives it from context-fetch block outcomes
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

/** Strip `-{PLACEHOLDER}` segments and a trailing `-log` from an artifact stem. */
function normaliseArtifact(stem: string): string {
  return stem.replace(/-?\{[A-Z_]+\}/g, "").replace(/-log$/, "");
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

/** artifact stem -> the agent whose dispatch block Creates/Updates it. */
export function artifactProducers(): Map<string, string> {
  const out = new Map<string, string>();
  for (const rel of listMd(WORKFLOW_DIR)) {
    let current: string | null = null;
    for (const line of read(rel).split("\n")) {
      const inv = /Invoke `@(bkit-[a-z0-9-]+)`/.exec(line);
      if (inv) current = inv[1];
      if (!current) continue;
      for (const m of line.matchAll(/(?:Create|Update):[^\n]*?([a-zA-Z0-9{}_-]+)\.md/g)) {
        const stem = normaliseArtifact(m[1]);
        if (!out.has(stem)) out.set(stem, current);
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

/** verdict variable -> artifact stem it is extracted from. */
export function variableSources(): Map<string, string> {
  const out = new Map<string, string>();
  for (const rel of listMd(WORKFLOW_DIR)) {
    for (const m of read(rel).matchAll(
      // `[^`\n]*?` admits a directory prefix inside the backticks
      // (`.bkit/.roadmap-refresh-on-demand.md`) while still capturing the bare
      // stem, matching how artifactProducers' lazy prefix already behaves —
      // otherwise a path-qualified artifact silently produces no linkage.
      /`[^`\n]*?([a-zA-Z0-9{}_-]+)\.md`[^\n]{0,400}?extract `Verdict`[^\n]{0,220}?(?:as|compute) `([A-Z][A-Z0-9_]*)`/g,
    )) {
      out.set(m[2], normaliseArtifact(m[1]));
    }
  }
  return out;
}

/**
 * Variables read straight off a subagent's RETURNED MESSAGE rather than an
 * artifact file. Maps variable -> agent directly, skipping the artifact hop,
 * so the prompt-side vocabulary is still checked. Used where the subagent
 * writes no report of its own (`/bkit-roadmap`, whose only durable outputs are
 * docs/roadmap.md, .bkit/issues.jsonl and docs/tracker.jsonl).
 */
function messageVariableAgents(): Map<string, string> {
  const out = new Map<string, string>();
  for (const rel of listMd(WORKFLOW_DIR)) {
    const text = read(rel);
    for (const m of text.matchAll(
      /Invoke `@([a-z0-9-]+)`[\s\S]{0,2000}?Extract `Verdict` from the subagent's returned message as `([A-Z][A-Z0-9_]*)`/g,
    )) {
      out.set(m[2], m[1]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("verdict vocabulary: extraction reaches the real corpus", () => {
  it("finds prompt declarations, gate declarations, and producers", () => {
    expect(promptDeclarations().size).toBeGreaterThan(25);
    expect(gateDeclarations().length).toBeGreaterThan(25);
    expect(artifactProducers().size).toBeGreaterThan(20);
    expect(variableSources().size).toBeGreaterThan(10);
  });
});

describe("verdict vocabulary: workflow gate agrees with the producing agent", () => {
  const prompts = promptDeclarations();
  const producers = artifactProducers();
  const sources = variableSources();
  const messageAgents = messageVariableAgents();

  for (const gate of gateDeclarations()) {
    const label = `${gate.workflow} — \`${gate.variable}\` in \`${gate.union}\``;
    it(label, () => {
      if (EXEMPT_COMPUTED.has(gate.variable)) return;

      const artifact = sources.get(gate.variable);
      const messageAgent = messageAgents.get(gate.variable);
      expect(
        artifact ?? messageAgent,
        `${gate.variable} is gated but never extracted from an artifact or a ` +
          `subagent's returned message. Either add the "extract \`Verdict\` ... as ` +
          `\`${gate.variable}\`" line, or add it to EXEMPT_COMPUTED if the workflow computes it.`,
      ).toBeTruthy();

      const agent = artifact ? producers.get(artifact) : messageAgent;
      expect(
        agent,
        artifact
          ? `no agent Creates ${artifact}.md — cannot check its vocabulary`
          : `no agent resolved for ${gate.variable} — cannot check its vocabulary`,
      ).toBeTruthy();

      const declared = prompts.get(agent!);
      expect(
        declared,
        `${agent}.md declares no "Verdict:" line, but ${gate.workflow} gates it`,
      ).toBeTruthy();

      const gated = members(gate.union);
      const missing = [...declared!].filter((v) => !gated.has(v));
      const extra = [...gated].filter((v) => !declared!.has(v));
      expect(
        { missing, extra },
        `${agent} can emit {${[...declared!].join("|")}} but ${gate.workflow} gates {${gate.union}}. ` +
          (missing.length ? `Emittable but rejected: ${missing.join(", ")}. ` : "") +
          (extra.length ? `Gated but never emittable: ${extra.join(", ")}.` : ""),
      ).toEqual({ missing: [], extra: [] });
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
   * Two verdict variables one edit apart are a latent bug: a single typo in a
   * gate line or a jq `--arg` silently references the wrong step's verdict, and
   * nothing downstream can tell. This is the constraint that blocks the
   * otherwise-tempting `CHALLENGE_TESTS_VERDICT` -> `TESTS_VERDICT`, which
   * would sit one character from `TEST_VERDICT` in the very same file
   * (`bkit-build.md`), where `TEST_VERDICT` carries the test-run exit code and
   * `CHALLENGE_TESTS_VERDICT` carries a subagent's review of test coverage.
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
   * sibling, or lands within one edit of a live name. Audited as of this test:
   *
   *   APPLY_REVIEW_VERDICT / APPLY_SCOPE_VERDICT  both shorten to APPLY_VERDICT
   *                                               and co-occur in bkit-plan.md
   *   CHALLENGE_REMEDIATE_VERDICT                 -> REMEDIATE_VERDICT and
   *                                               CHALLENGE_VERDICT both live
   *                                               in bkit-build.md
   *   CHALLENGE_TESTS_VERDICT                     -> TESTS_VERDICT is one edit
   *                                               from TEST_VERDICT, same file
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
