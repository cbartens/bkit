/**
 * bkit-shipped-docs-refs.test.ts — shipped docs carry no internal identifiers.
 *
 * Every `.md` in the install manifest, plus the `docs/` payload templates and
 * the canonical copies that seed them, lands in a consumer repo. Those docs
 * describe the CURRENT setup: a tracker issue number, a ledger key, or a
 * review-finding id means nothing to a consumer, and it ages into a wrong
 * claim as soon as the referenced work moves. Decisions belong in
 * `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl` — both of which
 * are ledgers whose rows carry those references as data.
 *
 * Legitimate `#` uses are NOT flagged: placeholders (`#{ISSUE_ID}`,
 * `(#{PR_NUMBER})`), markdown anchors (`](#section)`), `package.json#scripts`,
 * marker syntax (`bkit:issue=#N`), and single-digit ranks (`#1 overall`).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Manifest-listed `.md` files — the docs `bkit install` writes into a consumer repo. */
function manifestMarkdown(): string[] {
  const src = fs.readFileSync(path.join(REPO_ROOT, ".bkit/src/bkit-manifest.ts"), "utf-8");
  return Array.from(src.matchAll(/\{\s*path:\s*"([^"]+\.md)"/g)).map((m) => m[1]);
}

/** The `docs/` payload templates + the canonical copies that seed them. */
const PAYLOAD_DOCS = [
  ...fs
    .readdirSync(path.join(REPO_ROOT, ".bkit/templates/docs"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `.bkit/templates/docs/${f}`),
  "docs/deployments.md",
  "docs/testing.md",
  "docs/security.md",
];

/**
 * A tracker issue reference: `#` + 2 or more digits, not preceded by a
 * backtick, `{`, or word character (which would make it a placeholder, an
 * anchor, or a `package.json#key` fragment).
 */
const ISSUE_REF = /(^|[^A-Za-z0-9`{])#[0-9]{2,}/;

/** Retired ledger-key and review-finding label schemes. */
const INTERNAL_LABEL = /\b(?:KN|DE|EC|SP)-[0-9]+\b/;

const FILES = [...new Set([...manifestMarkdown(), ...PAYLOAD_DOCS])]
  .filter((f) => fs.existsSync(path.join(REPO_ROOT, f)))
  .sort();

/** Offending lines, with the fenced-code blocks stripped out first. */
function offenders(rel: string, re: RegExp): string[] {
  const raw = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
  const out: string[] = [];
  let inFence = false;
  raw.split("\n").forEach((line, i) => {
    if (/^\s*(`{3,})/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (re.test(line)) out.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
  });
  return out;
}

describe("shipped docs carry no internal identifiers", () => {
  it("enumerates the shipped markdown corpus (not vacuous)", () => {
    expect(FILES.length).toBeGreaterThan(8);
    expect(FILES).toContain(".bkit/workflows.md");
    expect(FILES).toContain(".bkit/cloud.md");
  });

  for (const rel of FILES) {
    it(`${rel} cites no tracker issue number`, () => {
      expect(offenders(rel, ISSUE_REF)).toEqual([]);
    });

    it(`${rel} cites no ledger key or review-finding label`, () => {
      expect(offenders(rel, INTERNAL_LABEL)).toEqual([]);
    });
  }
});

/**
 * The execution surfaces — `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — are
 * rendered into every consumer's host directories, so the same rule applies. They
 * were outside the corpus above because neither is manifest-listed, which is how a
 * tracker number and four step cross-references survived in `bkit-ship.md`.
 *
 * Scanned WITHOUT stripping fenced blocks: these files are mostly `bash` fences, and
 * a shell comment inside one ships verbatim. Both patterns currently have zero hits
 * fence-inclusive, so nothing legitimate needs an exemption.
 */
const EXECUTION_SURFACES = ["workflows", "prompts"].flatMap((dir) =>
  fs
    .readdirSync(path.join(REPO_ROOT, ".bkit", dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `.bkit/${dir}/${f}`),
);

/**
 * A cross-reference to another step BY NUMBER. Steps get renumbered whenever one is
 * inserted, so the reference silently starts pointing at the wrong step — and the
 * orchestrator reads every step anyway, so it buys nothing. Name the step instead
 * (`Close Workflow`, `**Failure Path**`).
 *
 * Deliberately narrow: only the parenthetical cross-ref form. In-list flow routing
 * (`→ step 5`) is the established convention and stays.
 */
const STEP_CROSSREF = /\(Step [0-9]+\)/;

/** Every line, fences included. */
function allLines(rel: string, re: RegExp): string[] {
  return fs
    .readFileSync(path.join(REPO_ROOT, rel), "utf-8")
    .split("\n")
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => re.test(line))
    .map(({ line, n }) => `${rel}:${n}: ${line.trim().slice(0, 120)}`);
}

describe("execution surfaces carry no internal identifiers or step cross-refs", () => {
  it("enumerates workflows and prompts (not vacuous)", () => {
    expect(EXECUTION_SURFACES).toContain(".bkit/workflows/bkit-ship.md");
    expect(EXECUTION_SURFACES).toContain(".bkit/prompts/bkit-plan-generate.md");
    expect(EXECUTION_SURFACES.length).toBeGreaterThan(20);
  });

  for (const rel of EXECUTION_SURFACES) {
    it(`${rel} cites no tracker issue number, ledger key or finding label`, () => {
      expect([...allLines(rel, ISSUE_REF), ...allLines(rel, INTERNAL_LABEL)]).toEqual([]);
    });

    it(`${rel} references no step by number`, () => {
      expect(allLines(rel, STEP_CROSSREF)).toEqual([]);
    });
  }
});

/**
 * The seeded CONFIG templates — workflows, renovate, dependabot, Vale styles, slop-scan.
 * These were outside both corpora above because neither is markdown, which is how forty
 * tracker references survived in `ci.yml`, `bkit-cloud.yml` and `renovate.json5`.
 *
 * A `#N` in a consumer's own `ci.yml` is worse than useless: it points at an issue in
 * bkit's tracker they cannot read, or — far more confusingly — at whatever issue happens
 * to carry that number in THEIR tracker. The reason a rule exists belongs next to the rule.
 *
 * Scanned WITHOUT stripping fences: these files are configuration, and a comment is the
 * whole point of the surface being scanned.
 */
const SEEDED_CONFIG = fs
  .readdirSync(path.join(REPO_ROOT, ".bkit/templates"), { recursive: true, encoding: "utf-8" })
  .filter((f) => /\.(ya?ml|json5?|toml)$/.test(f))
  .map((f) => `.bkit/templates/${f}`)
  .filter((f) => fs.statSync(path.join(REPO_ROOT, f)).isFile())
  .sort();

/**
 * Narrative about what the file USED to be. A shipped config describes the current setup;
 * a consumer reading "this used to…" is being told about a repo that is not theirs, and the
 * paragraph ages into a wrong claim the moment the surrounding code moves again. State the
 * rule that holds now — the reason survives, the history does not.
 */
const HISTORY_PROSE =
  /\b(?:used to (?:say|be|commit|live|run)|the OLD wiring|CORRECTED|RETRACTED)\b/;

describe("seeded config templates carry no internal identifiers or history prose", () => {
  it("enumerates the seeded config corpus (not vacuous)", () => {
    expect(SEEDED_CONFIG).toContain(".bkit/templates/.github/workflows/ci.yml");
    expect(SEEDED_CONFIG).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
    expect(SEEDED_CONFIG).toContain(".bkit/templates/.github/renovate.json5");
    expect(SEEDED_CONFIG.length).toBeGreaterThan(5);
  });

  for (const rel of SEEDED_CONFIG) {
    it(`${rel} cites no tracker issue number, ledger key or finding label`, () => {
      expect([...allLines(rel, ISSUE_REF), ...allLines(rel, INTERNAL_LABEL)]).toEqual([]);
    });

    it(`${rel} carries no narrative about what it used to be`, () => {
      expect(allLines(rel, HISTORY_PROSE)).toEqual([]);
    });
  }
});
