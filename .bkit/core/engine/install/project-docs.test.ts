// install/project-docs.test.ts — Unit tests for project-doc ownership migration and indexing.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPkgRoot } from "../shared/package-roots";
import { stripManagedWrapper } from "./managed-block";
import {
  LEGACY_STARTER_DIGESTS,
  LEGACY_STARTER_SOURCE_REVISION,
  PROJECT_DOC_TOPICS,
  adoptedProjectDocPath,
  legacyDigest,
  legacyStarterTopic,
  projectDocRow,
  syncProjectDocs,
  type ProjectDocTopic,
} from "./project-docs";

const WRAPPED = [
  "<!-- bkit:start -->",
  "",
  "<!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->",
  "",
  "# Noise",
  "",
  "Project text.",
  "",
  "<!-- bkit:end -->",
  "",
].join("\n");

describe("stripManagedWrapper", () => {
  it("removes the wrapper and keeps every other byte", () => {
    const r = stripManagedWrapper(WRAPPED);
    expect(r).toMatchObject({ status: "removed" });
    expect(r.content).toBe("# Noise\n\nProject text.\n");
  });

  it("keeps CRLF line endings", () => {
    const r = stripManagedWrapper(WRAPPED.replace(/\n/g, "\r\n"));
    expect(r.content).toBe("# Noise\r\n\r\nProject text.\r\n");
  });

  it("returns unmarked content as it is", () => {
    expect(stripManagedWrapper("# Noise\n")).toEqual({ status: "none", content: "# Noise\n" });
  });

  it("reports one lone marker, reversed markers and fenced markers as ambiguous", () => {
    expect(stripManagedWrapper("<!-- bkit:start -->\n# X\n")).toMatchObject({
      status: "ambiguous",
      problem: "missing-partner",
    });
    expect(stripManagedWrapper("<!-- bkit:end -->\n# X\n<!-- bkit:start -->\n")).toMatchObject({
      status: "ambiguous",
      problem: "inverted",
    });
    expect(stripManagedWrapper("```\n<!-- bkit:start -->\n```\n")).toMatchObject({
      status: "ambiguous",
      problem: "inside-fence",
    });
  });
});

describe("legacy starter digests", () => {
  it("has a digest for every topic", () => {
    for (const t of PROJECT_DOC_TOPICS) expect(LEGACY_STARTER_DIGESTS[t]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("recognises the real legacy text of a topic at the recorded revision", () => {
    for (const t of ["noise", "architecture", "technology", "observability"] as const) {
      const text = fs.readFileSync(
        path.join(
          getPkgRoot(),
          "tests/fixtures/shipped-text",
          LEGACY_STARTER_SOURCE_REVISION,
          `docs/${t}.md`,
        ),
        "utf8",
      );
      expect(legacyDigest(text)).toBe(LEGACY_STARTER_DIGESTS[t]);
      expect(legacyStarterTopic(text)).toBe(t);
    }
  });
});

describe("syncProjectDocs", () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "project-docs-"));
    fs.mkdirSync(path.join(root, "docs"));
    fs.mkdirSync(path.join(root, ".agents"));
    fs.writeFileSync(
      path.join(root, ".agents/docs.md"),
      "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n| Document | Scope |\n| --- | --- |\n",
    );
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it("migrates the wrapper and registers a row, then repeats as a no-op", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), WRAPPED);
    const first = syncProjectDocs(root, { dryRun: false });
    expect(first.migrated).toEqual(["docs/noise.md"]);
    expect(fs.readFileSync(path.join(root, "docs/noise.md"), "utf8")).toBe(
      "# Noise\n\nProject text.\n",
    );
    const index = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    expect(index).toContain("docs/noise.md");
    const second = syncProjectDocs(root, { dryRun: false });
    expect(second.migrated).toEqual([]);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(index);
  });

  it("writes nothing on a dry run", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), WRAPPED);
    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    const r = syncProjectDocs(root, { dryRun: true });
    expect(r.migrated).toEqual(["docs/noise.md"]);
    expect(fs.readFileSync(path.join(root, "docs/noise.md"), "utf8")).toBe(WRAPPED);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
  });

  it("keeps an ambiguous wrapper and reports it", () => {
    const text = "<!-- bkit:start -->\n# Noise\n";
    fs.writeFileSync(path.join(root, "docs/noise.md"), text);
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.ambiguous).toEqual([{ path: "docs/noise.md", problem: "missing-partner" }]);
    expect(fs.readFileSync(path.join(root, "docs/noise.md"), "utf8")).toBe(text);
  });

  it("adds no row when an indexed equivalent covers the topic", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), "# Noise\n");
    fs.mkdirSync(path.join(root, "docs/other"));
    fs.writeFileSync(path.join(root, "docs/other/noise.md"), "# Our noise\n");
    fs.appendFileSync(
      path.join(root, ".agents/docs.md"),
      "| `docs/other/noise.md` | Equivalent to docs/noise.md |\n",
    );
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual([]);
    expect(r.equivalent).toHaveLength(1);
  });
  it("reports instead of throwing when docs is a regular file", () => {
    fs.rmSync(path.join(root, "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "docs"), "not a directory\n");
    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    let report: ReturnType<typeof syncProjectDocs> | undefined;
    expect(() => {
      report = syncProjectDocs(root, { dryRun: false });
    }).not.toThrow();
    expect(report!.migrated).toEqual([]);
    expect(report!.registered).toEqual([]);
    expect(report!.unsafe.length).toBeGreaterThan(0);
    for (const u of report!.unsafe) expect(u.path).toMatch(/^docs\/.+\.md$/);
    for (const u of report!.unsafe) expect(u.reason.length).toBeGreaterThan(0);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
  });

  it("registers a present default doc when its only equivalent row points at a missing file", () => {
    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n\nReal content.\n");
    fs.appendFileSync(
      path.join(root, ".agents/docs.md"),
      "| `engineering/security.md` | Equivalent to docs/security.md |\n",
    );
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual(["docs/security.md"]);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toContain(
      "`docs/security.md`",
    );
  });

  it("does not add a second row for a default doc indexed through a markdown link", () => {
    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n\nReal content.\n");
    fs.appendFileSync(
      path.join(root, ".agents/docs.md"),
      "| [docs/security.md](docs/security.md) | Security rules |\n",
    );
    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual([]);
    const after = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    expect(after).toBe(before);
    expect(after).not.toContain("`docs/security.md`");
  });

  it("syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row", () => {
    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n\nReal content.\n");
    fs.mkdirSync(path.join(root, "engineering"));
    fs.writeFileSync(path.join(root, "engineering/security-notes.md"), "# Notes\n\nOther.\n");
    fs.appendFileSync(
      path.join(root, ".agents/docs.md"),
      "| `engineering/security-notes.md` | Not equivalent to `docs/security.md` |\n",
    );
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual(["docs/security.md"]);
    expect(r.equivalent).toEqual([]);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toContain(
      "`docs/security.md`",
    );
  });

  it("adds no row and reports a problem when the index has a row it cannot read", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), "# Noise\n");
    fs.appendFileSync(path.join(root, ".agents/docs.md"), "| **docs/noise.md** | Noise |\n");
    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual([]);
    expect(r.indexProblem).toContain("cannot read");
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
  });
});

describe("adoptedProjectDocPath", () => {
  let root: string;
  const writeIndexRows = (rows: string): void =>
    fs.writeFileSync(
      path.join(root, ".agents/docs.md"),
      "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n| Document | Scope |\n| --- | --- |\n" +
        rows,
    );
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "adopted-doc-"));
    fs.mkdirSync(path.join(root, "docs"));
    fs.mkdirSync(path.join(root, "handbook"));
    fs.mkdirSync(path.join(root, ".agents"));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it("adoptedProjectDocPath returns the recommended path, an indexed equivalent or null", () => {
    // No index at all: only the recommended path counts.
    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n");
    expect(adoptedProjectDocPath(root, "security")).toBe("docs/security.md");
    expect(adoptedProjectDocPath(root, "testing")).toBeNull();

    // An indexed equivalent at another path counts; a negated or longer-suffix row does not.
    fs.writeFileSync(path.join(root, "handbook/ops-testing.md"), "# Testing\n");
    fs.writeFileSync(path.join(root, "handbook/ops-design.md"), "# Design\n");
    fs.writeFileSync(path.join(root, "handbook/ops-noise.md"), "# Noise\n");
    writeIndexRows(
      "| `handbook/ops-testing.md` | Equivalent to `docs/testing.md` |\n" +
        "| `handbook/ops-design.md` | Not equivalent to `docs/design.md` |\n" +
        "| `handbook/ops-noise.md` | Equivalent to `docs/noise.mdx` |\n",
    );
    expect(adoptedProjectDocPath(root, "testing")).toBe("handbook/ops-testing.md");
    expect(adoptedProjectDocPath(root, "design")).toBeNull();
    expect(adoptedProjectDocPath(root, "noise")).toBeNull();

    // The recommended path wins over an indexed equivalent.
    fs.writeFileSync(path.join(root, "docs/testing.md"), "# Testing\n");
    expect(adoptedProjectDocPath(root, "testing")).toBe("docs/testing.md");

    // A symlink or directory at the recommended path is not an adopted copy.
    fs.symlinkSync(path.join(root, "handbook/ops-design.md"), path.join(root, "docs/design.md"));
    fs.mkdirSync(path.join(root, "docs/setup.md"));
    expect(adoptedProjectDocPath(root, "design")).toBeNull();
    expect(adoptedProjectDocPath(root, "setup")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Starter shape: every project-doc starter carries the same fill-in introduction,
// rules box and skeleton.
// ---------------------------------------------------------------------------

const ADOPTION_HEADING = "## Project docs — adoption order";

/** The adoption-order chart text in `.bkit/templates.md`. */
function adoptionChart(): string {
  const text = fs.readFileSync(path.join(getPkgRoot(), ".bkit/core/.bkit/templates.md"), "utf8");
  const section = text.slice(text.indexOf(ADOPTION_HEADING));
  return /```mermaid\n([\s\S]*?)```/.exec(section)?.[1] ?? "";
}

/**
 * Arrow sources into each doc's node, read from the adoption-order chart.
 * Reads edge labels (`-->|x|`), chained edges (`A --> B --> C`) and `&` groups; throws on
 * an arrow line it cannot parse, so no edge is dropped silently.
 */
function adoptionArrows(chart: string = adoptionChart()): {
  solid: Map<string, string[]>;
  dotted: Map<string, string[]>;
} {
  const labels = new Map<string, string>();
  for (const m of chart.matchAll(/(\w+)\["([^"]*)"\]/g)) labels.set(m[1] ?? "", m[2] ?? "");
  const docOf = (id: string): string => {
    const label = labels.get(id) ?? id;
    return label.endsWith(".md") ? `docs/${label}` : `docs/${label}.md`;
  };
  const solid = new Map<string, string[]>();
  const dotted = new Map<string, string[]>();
  const nodeIds = (group: string, line: string): string[] =>
    group.split("&").map((part) => {
      const m = /^\s*(\w+)(?:\["[^"]*"\])?\s*$/.exec(part);
      if (!m) throw new Error(`Unparsable adoption chart edge: ${line.trim()}`);
      return m[1] ?? "";
    });
  for (const line of chart.split("\n")) {
    if (!/[-=.]{2,}[>ox]|---|-\.-|-\.\s/.test(line)) continue;
    const pieces = line.split(/(-->|-\.+->|-\.\s[^.]*?\s\.+->)(?:\|[^|]*\|)?/);
    if (pieces.length < 3 || pieces.length % 2 === 0) {
      throw new Error(`Unparsable adoption chart edge: ${line.trim()}`);
    }
    for (let i = 1; i < pieces.length; i += 2) {
      const into = pieces[i] === "-->" ? solid : dotted;
      const from = nodeIds(pieces[i - 1] ?? "", line);
      const to = nodeIds(pieces[i + 1] ?? "", line);
      for (const t of to) {
        for (const f of from) into.set(docOf(t), [...(into.get(docOf(t)) ?? []), docOf(f)]);
      }
    }
  }
  return { solid, dotted };
}

/** A starter's lines with the blockquote marker removed. */
function starterLines(topic: string): string[] {
  const file = path.join(getPkgRoot(), ".bkit/templates/docs", `${topic}.md`);
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.replace(/^\s*>\s?/, ""));
}

function docPaths(line: string): string[] {
  const found: string[] = [];
  for (const m of line.matchAll(/(?<![/\w])docs\/[a-z-]+\.md(?!\w|\.\w)/g)) found.push(m[0]);
  return found.sort();
}

function labelLine(lines: string[], label: string): string {
  return lines.find((l) => l.trimStart().startsWith(`**${label}:**`)) ?? "";
}

/** The starter's index row (the last pipe-delimited cell is its Scope), or "". */
function givenRow(lines: string[], topic: string): string {
  const line = lines.find((l) => l.includes(`| \`docs/${topic}.md\` |`)) ?? "";
  const from = line.indexOf(`| \`docs/${topic}.md\` |`);
  return from === -1 ? "" : line.slice(from, line.lastIndexOf("|") + 1).trim();
}

function rowScope(row: string): string {
  const cells = row.replace(/^\||\|$/g, "").split(" | ");
  return (cells[cells.length - 1] ?? "").trim();
}

function purposeText(lines: string[]): string {
  const line = lines.find((l) => l.startsWith("**Purpose:**")) ?? "";
  return line.replace("**Purpose:**", "").trim();
}

/** Lines of each `## ` section below the title, keyed by heading. */
function sections(lines: string[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let current = "";
  for (const l of lines.slice(titleIndex(lines) + 1)) {
    if (l.startsWith("## ")) {
      current = l.trim();
      out.set(current, []);
    } else if (current !== "") out.get(current)?.push(l);
  }
  return out;
}

function titleIndex(lines: string[]): number {
  return lines.findIndex((l) => l.startsWith("# "));
}

/** Tables in a section as arrays of their body-row lines (header and separator excluded). */
function tableBodies(section: string[]): string[][] {
  const tables: string[][] = [];
  let run: string[] = [];
  for (const l of [...section, ""]) {
    if (l.trimStart().startsWith("|")) run.push(l);
    else if (run.length > 0) {
      tables.push(run.slice(2));
      run = [];
    }
  }
  return tables;
}

function starterProblems(topic: string, headings: string[]): string[] {
  const lines = starterLines(topic);
  const title = titleIndex(lines);
  const intro = lines.slice(0, title);
  const rulesBox = lines.slice(
    title + 1,
    lines.findIndex((l, i) => i > title && l.startsWith("## ")),
  );
  const body = sections(lines);
  const problems: string[] = [];
  const need = (ok: boolean, what: string): number => (ok ? 0 : problems.push(what));

  need(
    intro.some((l) => l.startsWith("Starter document.")),
    "opener line 'Starter document.'",
  );
  for (const label of [
    "Fill these first",
    "Finish against",
    "Where the facts come from",
    "If it does not apply",
    "Completion checks",
  ])
    need(
      intro.some((l) => l.trimStart().startsWith(`**${label}:**`)),
      `intro label ${label}`,
    );
  need(
    intro.some((l) => /^\d+\.\s/.test(l)),
    "numbered fill steps",
  );
  need(!intro.some((l) => l.startsWith("#")), "no heading in the introduction");
  for (const label of ["Purpose", "Not here", "Update when"])
    need(
      rulesBox.some((l) => l.startsWith(`**${label}:**`)),
      `rules box ${label}`,
    );
  const purpose = purposeText(lines);
  need(purpose !== "", "Purpose line has text");
  need(!/Read before|Read when/.test(purpose), "Purpose line holds no Read before / Read when");
  const hasPractice = lines.some((l) => l.startsWith("**bkit practice:**"));
  const boxPractice = rulesBox.some((l) => l.startsWith("**bkit practice:**"));
  need(
    hasPractice === boxPractice,
    "bkit practice marker in the rules box iff the starter holds one",
  );
  need(body.has("## Open questions"), "## Open questions");
  for (const h of headings) need(body.has(h), `heading ${h}`);
  need(!body.has("## Project facts to record"), "no ## Project facts to record");
  const skeleton = [...body.values()].flat().join("\n");
  need(/\[[^\]]+\](?!\()/.test(skeleton), "bracketed fields in the skeleton");
  for (const [heading, sectionLines] of body) {
    if (sectionLines.some((l) => l.startsWith("**bkit practice:**"))) continue;
    for (const rows of tableBodies(sectionLines)) {
      if (topic === "noise") need(rows.length === 0, `${heading}: header-only table`);
      else
        need(
          rows.some((r) => r.includes("[e.g.,")),
          `${heading}: a [e.g., row in every table`,
        );
    }
  }
  return problems;
}

/** Problems with the Fill these first / Finish against lines against the adoption chart. */
function adoptionProblems(topic: string): string[] {
  const lines = starterLines(topic);
  const { solid, dotted } = adoptionArrows();
  const target = `docs/${topic}.md`;
  const problems: string[] = [];
  const pairs: [string, string[]][] = [
    ["Fill these first", [...(solid.get(target) ?? [])].sort()],
    ["Finish against", [...(dotted.get(target) ?? [])].sort()],
  ];
  for (const [label, want] of pairs) {
    const line = labelLine(lines, label);
    const got = docPaths(line);
    if (JSON.stringify(got) !== JSON.stringify(want))
      problems.push(`${label}: got ${got.join(", ")}, want ${want.join(", ")}`);
    if (want.length === 0 && !/none/i.test(line)) problems.push(`${label}: says none`);
  }
  return problems;
}

/** Every mismatch of a starter against the shared shape; empty when it conforms. */
function starterShape(topic: string, headings: string[]): Record<string, string[]> {
  const lines = starterLines(topic);
  const row = givenRow(lines, topic);
  const rowProblems: string[] = [];
  if (topic !== "components" && row !== projectDocRow(topic as ProjectDocTopic))
    rowProblems.push(`register row is not projectDocRow(${topic}): ${row}`);
  if (rowScope(row) !== purposeText(lines))
    rowProblems.push("register row Scope differs from the Purpose line");
  return {
    shape: starterProblems(topic, headings),
    adoption: adoptionProblems(topic),
    row: rowProblems,
  };
}

const CONFORMS = { shape: [], adoption: [], row: [] };

/** How each `## ` section of a starter is marked: a project slot, bkit practice or neither. */
function sectionMarks(text: string): Map<string, "slot" | "practice" | "none"> {
  const marks = new Map<string, "slot" | "practice" | "none">();
  for (const [heading, lines] of sections(text.split("\n").map((l) => l.replace(/^\s*>\s?/, "")))) {
    if (lines.some((l) => l.startsWith("**bkit practice:**"))) marks.set(heading, "practice");
    else if (lines.some((l) => l.startsWith("**Project slot:**"))) marks.set(heading, "slot");
    else marks.set(heading, "none");
  }
  return marks;
}

/** Fenced-code lines that hold a box-drawing character (the same set Task 14 checks). */
function boxDrawingLines(text: string): string[] {
  const hits: string[] = [];
  let fenced = false;
  for (const l of text.split("\n")) {
    if (l.trimStart().startsWith("```")) fenced = !fenced;
    else if (fenced && /[▼▲┌┐]/.test(l)) hits.push(l);
  }
  return hits;
}

function starterText(topic: string): string {
  return fs.readFileSync(path.join(getPkgRoot(), ".bkit/templates/docs", `${topic}.md`), "utf8");
}

function unmarkedSections(topic: string): string[] {
  return [...sectionMarks(starterText(topic))]
    .filter(([heading, mark]) => mark === "none" && heading !== "## Open questions")
    .map(([heading]) => heading);
}

describe("starter docs", () => {
  it("starter shape: components", () => {
    expect(
      starterShape("components", ["## Repository purpose", "## Constraints", "## Open questions"]),
    ).toEqual(CONFORMS);
  });

  it("components register row Scope equals its Purpose line", () => {
    const lines = starterLines("components");
    const row = givenRow(lines, "components");
    expect(row).not.toBe("");
    expect(rowScope(row)).toBe(purposeText(lines));
    expect(purposeText(lines)).not.toBe("");
  });

  it("components Fill these first matches the adoption order", () => {
    expect(docPaths(labelLine(starterLines("components"), "Fill these first"))).toEqual([
      "docs/idea.md",
    ]);
    expect(adoptionProblems("components")).toEqual([]);
  });

  it("starter shape: technology", () => {
    expect(
      starterShape("technology", [
        "## Stack",
        "## Conventions",
        "## Not used",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("starter shape: design", () => {
    expect(
      starterShape("design", [
        "## Tokens",
        "## Typography",
        "## Spacing and layout",
        "## Components",
        "## Accessibility",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("starter shape: architecture", () => {
    expect(
      starterShape("architecture", [
        "## System context",
        "## Containers",
        "## Package boundaries",
        "## File placement",
        "## Environments",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("starter shape: setup", () => {
    expect(
      starterShape("setup", [
        "## Prerequisites",
        "## First-time setup",
        "## Environment variables",
        "## Local services",
        "## Everyday commands",
        "## Troubleshooting",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("setup index row marks Build and Debug as read when relevant", () => {
    const row = projectDocRow("setup");
    expect(row).toContain("| — | — | ○ | ○ | — |");
    expect(row).not.toContain("Humans only");
  });

  it("starter shape: security", () => {
    expect(
      starterShape("security", [
        "## Trust boundaries",
        "## Authentication",
        "## Authorization",
        "## Input validation",
        "## Rate limiting",
        "## Secrets",
        "## PII",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("starter shape: observability", () => {
    expect(
      starterShape("observability", [
        "## Signal pipeline",
        "## Log format",
        "## Signals",
        "## Correlation",
        "## Error tracking",
        "## Alerts",
        "## Where to look",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("starter shape: testing", () => {
    expect(
      starterShape("testing", [
        "## Stack",
        "## Tiers this project has",
        "## Where tests live",
        "## Test data",
        "## CI lanes",
        "## Test reports",
        "## Running locally",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("testing marks every section slot or practice and has no box-drawing diagram", () => {
    expect(unmarkedSections("testing")).toEqual([]);
    expect(boxDrawingLines(starterText("testing"))).toEqual([]);
    expect([...sectionMarks(starterText("testing")).values()]).toContain("practice");
    expect(sectionMarks(starterText("testing")).get("## Test first")).toBe("practice");
  });

  it("starter shape: data-schema", () => {
    expect(
      starterShape("data-schema", ["## Overview", "## Functions", "## Open questions"]),
    ).toEqual(CONFORMS);
  });

  it("starter shape: deployments", () => {
    expect(
      starterShape("deployments", [
        "## Environments",
        "## Release path",
        "## Secrets and env config",
        "## Branch protection",
        "## Open questions",
      ]),
    ).toEqual(CONFORMS);
  });

  it("deployments marks every section slot or practice", () => {
    expect(unmarkedSections("deployments")).toEqual([]);
    expect(sectionMarks(starterText("deployments")).get("## Production rollback runbook")).toBe(
      "slot",
    );
    expect(sectionMarks(starterText("deployments")).get("## Dev rollback runbook")).toBe("slot");
  });

  it("starter shape: noise", () => {
    expect(starterShape("noise", ["## Open questions"])).toEqual(CONFORMS);
    expect(starterText("noise")).toContain(
      "| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |",
    );
  });

  it("capabilities names rollup and refresh and when to run each", () => {
    const intro = starterLines("capabilities").slice(0, titleIndex(starterLines("capabilities")));
    const rollup = intro.filter((l) => l.includes("pnpm bkit:graph:rollup")).join(" ");
    const refresh = intro.filter((l) => l.includes("pnpm bkit:graph:refresh")).join(" ");
    expect(rollup).toMatch(/working tree/);
    expect(refresh).toMatch(/staged/);
    expect(refresh).toMatch(/throwaway checkout/);
    expect(intro.join("\n")).toMatch(/\bwhen\b/i);
  });

  it("capabilities starter has the Generated document opener, Fill these first, register row and completion checks", () => {
    const lines = starterLines("capabilities");
    const intro = lines.slice(0, titleIndex(lines));
    expect(intro.some((l) => l.startsWith("Generated document."))).toBe(true);
    expect(intro.some((l) => l.startsWith("Example output."))).toBe(false);
    expect(adoptionArrows().solid.get("docs/capabilities.md")).toEqual(["docs/deployments.md"]);
    expect(docPaths(labelLine(intro, "Fill these first"))).toEqual(["docs/deployments.md"]);
    const row = givenRow(lines, "capabilities");
    expect(row).not.toBe("");
    expect(rowScope(row)).toBe(purposeText(lines));
    expect(purposeText(lines)).not.toBe("");
    expect(labelLine(intro, "Completion checks")).toContain("docs/components.md");
    expect(intro.join("\n")).toContain("bkit-graph-drift-rules.json");
  });
});

describe("adoption chart helpers", () => {
  it("adoptionArrows reads labelled, chained and grouped edges", () => {
    const chart = [
      "flowchart TD",
      '  DATA["data-schema"] -->|schema| DEP["deployments"]',
      '  A["architecture"] --> B["security"] --> C["testing"]',
      '  X["technology"] & Y["design"] --> Z["setup"]',
    ].join("\n");
    // Pass the chart text as an argument; the helper must read every edge form.
    const { solid } = (adoptionArrows as (chart: string) => ReturnType<typeof adoptionArrows>)(
      chart,
    );
    expect(solid.get("docs/deployments.md")).toEqual(["docs/data-schema.md"]);
    expect(solid.get("docs/security.md")).toEqual(["docs/architecture.md"]);
    expect(solid.get("docs/testing.md")).toEqual(["docs/security.md"]);
    expect([...solid.get("docs/setup.md")!].sort()).toEqual([
      "docs/design.md",
      "docs/technology.md",
    ]);
  });

  it("adoptionArrows reads dotted-label and longer dotted edges", () => {
    const chart = [
      "flowchart TD",
      '  P["product"] -. why .-> Q["roadmap"]',
      '  R["rules"] -..-> S["skills"]',
    ].join("\n");
    const { dotted } = adoptionArrows(chart);
    expect(dotted.get("docs/roadmap.md")).toEqual(["docs/product.md"]);
    expect(dotted.get("docs/skills.md")).toEqual(["docs/rules.md"]);
  });

  it("docPaths ignores template paths and longer suffixes", () => {
    expect(docPaths("see .bkit/templates/docs/technology.md and docs/noise.mdx")).toEqual([]);
    expect(docPaths("read docs/technology.md, then (docs/noise.md).")).toEqual([
      "docs/noise.md",
      "docs/technology.md",
    ]);
  });
});
