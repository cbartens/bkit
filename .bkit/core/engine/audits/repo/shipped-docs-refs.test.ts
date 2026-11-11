/**
 * audits/repo/shipped-docs-refs.test.ts — shipped docs carry no internal identifiers.
 *
 * Every `.md` in the install manifest, plus the `docs/` payload templates and
 * the project-document starters, lands in a consumer repo. Those docs
 * describe the CURRENT setup and carry no tracker issue number, ledger key, or
 * review-finding id. Decisions belong in `docs/decisions.jsonl`, incidents in
 * `docs/knowledge.jsonl`.
 *
 * Legitimate `#` uses are NOT flagged: placeholders (`#{ISSUE_ID}`,
 * `(#{PR_NUMBER})`), markdown anchors (`](#section)`), `package.json#scripts`,
 * marker syntax (`bkit:issue=#N`), and single-digit ranks (`#1 overall`).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

/**
 * Manifest-listed `.md` files — the docs `bkit install` writes into a consumer repo.
 * A `.bkit/<doc>.md` consumer mirror is scanned at its package source,
 * `.bkit/core/.bkit/<doc>.md`.
 */
function manifestMarkdown(): string[] {
  const src = fs.readFileSync(
    path.join(REPO_ROOT, ".bkit/core/engine/install/manifest.ts"),
    "utf-8",
  );
  return Array.from(src.matchAll(/\{\s*path:\s*"([^"]+\.md)"/g)).map((m) =>
    m[1].startsWith(".bkit/")
      ? path.posix.join(".bkit/core/.bkit", m[1].slice(".bkit/".length))
      : m[1],
  );
}

/** Every `.md` under a directory, relative to the repo root. Nested templates ship too. */
function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkMarkdown(abs));
    else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(path.relative(REPO_ROOT, abs));
    }
  }
  return out;
}

/** The `docs/` payload: the project-document starters and the managed audit and plan templates. */
const PAYLOAD_DOCS = [
  ...walkMarkdown(path.join(REPO_ROOT, ".bkit/templates/docs")),
  ...walkMarkdown(path.join(REPO_ROOT, ".bkit/core/docs/templates")),
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
    expect(FILES).toContain(".bkit/core/.bkit/workflows.md");
    expect(FILES).toContain(".bkit/core/.bkit/cloud.md");
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
 * The execution surfaces — `.bkit/core/workflows/*.md` and `.bkit/core/prompts/*.md` — are
 * rendered into every consumer's host directories, so the same rule applies (neither is
 * manifest-listed).
 *
 * Scanned WITHOUT stripping fenced blocks: a shell comment inside one ships verbatim.
 * No exemptions.
 */
const EXECUTION_SURFACES = ["workflows", "prompts"].flatMap((dir) =>
  fs
    .readdirSync(path.join(REPO_ROOT, ".bkit", "core", dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `.bkit/core/${dir}/${f}`),
);

/**
 * A cross-reference to another step BY NUMBER. Name the step instead (`Close Workflow`,
 * `**Failure Path**`).
 *
 * Narrow: only the parenthetical cross-ref form. In-list flow routing (`→ step 5`) is
 * allowed.
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
    expect(EXECUTION_SURFACES).toContain(".bkit/core/workflows/bkit-ship.md");
    expect(EXECUTION_SURFACES).toContain(".bkit/core/prompts/bkit-plan-generate.md");
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
 * The seeded CONFIG templates — workflows, renovate, dependabot, Vale styles, slop-scan
 * (not markdown, so outside both corpora above).
 *
 * Scanned WITHOUT stripping fences: these files are configuration.
 */
const SEEDED_CONFIG = fs
  .readdirSync(path.join(REPO_ROOT, ".bkit/templates"), { recursive: true, encoding: "utf-8" })
  .filter((f) => /\.(ya?ml|json5?|toml)$/.test(f))
  .map((f) => `.bkit/templates/${f}`)
  .filter((f) => fs.statSync(path.join(REPO_ROOT, f)).isFile())
  .sort();

/**
 * Narrative about what the file USED to be. A shipped config describes the current setup.
 */
const HISTORY_PROSE =
  /\b(?:used to (?:say|be|commit|live|run)|the OLD wiring|CORRECTED|RETRACTED)\b/;

describe("seeded config templates carry no internal identifiers or history prose", () => {
  it("enumerates the seeded config corpus (not vacuous)", () => {
    expect(SEEDED_CONFIG).toContain(".bkit/templates/.github/workflows/bkit-ci.yml");
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

// ---------------------------------------------------------------------------
// Documentation responsibility coverage and warning contracts
// ---------------------------------------------------------------------------

const TOPICS = [
  "architecture",
  "technology",
  "security",
  "data-schema",
  "testing",
  "deployments",
  "observability",
  "design",
  "noise",
  "setup",
] as const;
const TOPIC_PATH = new RegExp(`docs/(?:${TOPICS.join("|")}|components)\\.md`);
const OUTCOMES = ["added", "retained", "corrected", "not-applicable"] as const;
const COVERAGE_HEADING = "## Documentation Consultation Coverage";
const WARNING_HEADING = "## Documentation Warnings";
const WARNING_FIELDS = ["topic", "gap", "recommendedPath", "alternativeEvidence", "action"];

const readRepo = (rel: string): string => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");

const mdIn = (dir: string, prefix: string): string[] =>
  fs
    .readdirSync(path.join(REPO_ROOT, dir))
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => `${prefix}${f}`);

/** The table rows (cells) under a `## ` heading of `text`, header and divider rows dropped. */
function tableRowsUnder(text: string, heading: string): string[][] {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) return [];
  const rows: string[][] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break;
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;
    rows.push(cells);
  }
  return rows.slice(1); // header row
}

/** Responsibility sources and the catalog that records their coverage. */
const WORKFLOW_SOURCES = [
  ".bkit/core/.agents/rules.md",
  ".bkit/core/docs/templates/bkit-plan.md",
  ...mdIn(".bkit/core/workflows", ".bkit/core/workflows/"),
];
const PROMPT_SOURCES = [
  ...mdIn(".bkit/core/prompts", ".bkit/core/prompts/"),
  ...mdIn(".bkit/core/docs/templates", ".bkit/core/docs/templates/").filter((f) =>
    path.posix.basename(f).startsWith("bkit-audit-"),
  ),
];

/** Problems with the coverage records of `sources` in `catalog`. */
function coverageProblems(catalog: string, sources: string[]): string[] {
  const rows = tableRowsUnder(readRepo(catalog), COVERAGE_HEADING);
  const problems: string[] = [];
  if (rows.length === 0) return [`${catalog}: no table under "${COVERAGE_HEADING}"`];
  for (const source of sources) {
    const mine = rows.filter((r) => (r[0] ?? "").includes(path.posix.basename(source)));
    if (mine.length === 0) {
      problems.push(`${catalog}: no coverage record for ${source}`);
      continue;
    }
    for (const r of mine) {
      const [, docs = "", outcome = "", reason = ""] = r;
      if (!(OUTCOMES as readonly string[]).includes(outcome.toLowerCase()))
        problems.push(
          `${catalog}: ${source}: outcome "${outcome}" is not one of ${OUTCOMES.join("|")}`,
        );
      if (reason.length < 10)
        problems.push(`${catalog}: ${source}: reason or applicability missing`);
      if (outcome.toLowerCase() !== "not-applicable" && !TOPIC_PATH.test(docs))
        problems.push(
          `${catalog}: ${source}: ${outcome} record names no recommended project doc path`,
        );
    }
  }
  return problems;
}

/** Sources that must cite these named docs in their own text. */
const REQUIRED_NAMED: Record<string, string[]> = {
  ".bkit/core/prompts/bkit-plan-generate.md": [
    "docs/architecture.md",
    "docs/technology.md",
    "docs/security.md",
    "docs/testing.md",
  ],
  ".bkit/core/prompts/bkit-build-plan-convert.md": [
    "docs/architecture.md",
    "docs/technology.md",
    "docs/security.md",
    "docs/testing.md",
  ],
  ".bkit/core/docs/templates/bkit-plan.md": [
    "docs/architecture.md",
    "docs/technology.md",
    "docs/security.md",
    "docs/testing.md",
    "docs/data-schema.md",
    "docs/design.md",
    "docs/observability.md",
    "docs/deployments.md",
  ],
  ".bkit/core/workflows/bkit-design.md": ["docs/architecture.md"],
  ".bkit/core/workflows/bkit-debug.md": ["docs/testing.md", "docs/noise.md"],
  ".bkit/core/prompts/bkit-audit-generate.md": ["docs/architecture.md"],
};

function missingNamedRefs(): string[] {
  return Object.entries(REQUIRED_NAMED).flatMap(([rel, refs]) => {
    const text = readRepo(rel);
    return refs.filter((r) => !text.includes(r)).map((r) => `${rel}: no reference to ${r}`);
  });
}

describe("documentation responsibility inventory", () => {
  it("covers the full documentation responsibility inventory", () => {
    // The inventory itself is not vacuous.
    expect(WORKFLOW_SOURCES).toContain(".bkit/core/workflows/bkit-debug.md");
    expect(PROMPT_SOURCES).toContain(".bkit/core/prompts/bkit-plan-generate.md");
    expect(PROMPT_SOURCES).toContain(".bkit/core/docs/templates/bkit-audit-adoption.md");
    expect(PROMPT_SOURCES.length).toBeGreaterThan(40);

    // Every starter the records point at ships from the relocated location.
    const starters = fs.readdirSync(path.join(REPO_ROOT, ".bkit/templates/docs"));
    expect(TOPICS.filter((t) => !starters.includes(`${t}.md`))).toEqual([]);

    expect(coverageProblems(".bkit/core/.bkit/workflows.md", WORKFLOW_SOURCES)).toEqual([]);
    expect(coverageProblems(".bkit/core/.bkit/prompts.md", PROMPT_SOURCES)).toEqual([]);
    expect(missingNamedRefs()).toEqual([]);
  });
});

/** Prompts and templates that produce a report with documentation gaps. */
const WARNING_PRODUCERS = [
  ".bkit/core/prompts/bkit-plan-generate.md",
  ".bkit/core/prompts/bkit-build-plan-convert.md",
  ".bkit/core/prompts/bkit-plan-update.md",
  ".bkit/core/prompts/bkit-audit-generate.md",
  ".bkit/core/prompts/bkit-utility-update-documentation.md",
  ".bkit/core/prompts/bkit-ship-update-docs.md",
  ".bkit/core/docs/templates/bkit-audit-documentation.md",
  ".bkit/core/docs/templates/bkit-audit-adoption.md",
];

/** Workflows that carry the producers' warnings through their summary or return. */
const WARNING_CARRIERS = [
  "bkit-design",
  "bkit-plan",
  "bkit-build",
  "bkit-debug",
  "bkit-ship",
  "bkit-auto",
].map((n) => `.bkit/core/workflows/${n}.md`);

/** Maintenance and audit sources that must check presence, the index and project content. */
const MAINTENANCE = [
  ".bkit/core/prompts/bkit-utility-update-documentation.md",
  ".bkit/core/prompts/bkit-ship-update-docs.md",
  ".bkit/core/docs/templates/bkit-audit-documentation.md",
  ".bkit/core/docs/templates/bkit-audit-adoption.md",
];

function contractProblems(): string[] {
  const problems: string[] = [];
  for (const rel of WARNING_PRODUCERS) {
    const text = readRepo(rel);
    if (!text.includes(WARNING_HEADING)) problems.push(`${rel}: no "${WARNING_HEADING}" section`);
    if (!text.includes("```jsonl")) problems.push(`${rel}: no jsonl warning record`);
    for (const f of WARNING_FIELDS)
      if (!text.includes(f)) problems.push(`${rel}: warning record lacks field ${f}`);
    if (!/continue/i.test(text) || !/warn/i.test(text))
      problems.push(`${rel}: no warn-and-continue behaviour`);
  }
  const plan = readRepo(".bkit/core/docs/templates/bkit-plan.md");
  for (const heading of ["## Documentation Consultation", WARNING_HEADING])
    if (!plan.includes(heading)) problems.push(`bkit-plan.md template: no "${heading}"`);
  for (const rel of WARNING_CARRIERS)
    if (!readRepo(rel).includes("Documentation Warnings"))
      problems.push(`${rel}: does not carry Documentation Warnings`);
  for (const rel of MAINTENANCE) {
    const text = readRepo(rel);
    if (/\.bkit\/shared\/docs/.test(text)) problems.push(`${rel}: probes the old shared docs`);
    for (const [label, re] of [
      ["presence (absent or missing documents)", /\b(absent|missing)\b/i],
      ["index accuracy", /\bindex\b/i],
      ["starter-only content", /starter/i],
      ["a topic that does not apply", /not[- ]applicable|irrelevant/i],
    ] as const)
      if (!re.test(text)) problems.push(`${rel}: does not check ${label}`);
  }
  return problems;
}

/** Project documents that bkit must not manage: any managed starter, row or manifest entry. */
function managedStarterProblems(): string[] {
  const problems: string[] = [];
  if (fs.existsSync(path.join(REPO_ROOT, ".bkit/shared/docs")))
    problems.push(".bkit/shared/docs still exists");
  const manifest = readRepo(".bkit/core/engine/install/manifest.ts");
  for (const t of TOPICS)
    if (manifest.includes(`"docs/${t}.md"`) || manifest.includes(`.bkit/shared/docs/${t}.md`))
      problems.push(`manifest.ts manages docs/${t}.md`);
  const index = readRepo(".bkit/core/.agents/docs.md");
  const managed = index.slice(0, index.indexOf("<!-- bkit:end -->"));
  for (const t of TOPICS)
    if (managed.includes(`| \`docs/${t}.md\``))
      problems.push(`.agents/docs.md managed block has a row for docs/${t}.md`);
  return problems;
}

describe("documentation warning contracts", () => {
  it("ships documentation warning contracts for plan and no-plan paths", () => {
    expect(contractProblems()).toEqual([]);
    expect(managedStarterProblems()).toEqual([]);
  });
});
