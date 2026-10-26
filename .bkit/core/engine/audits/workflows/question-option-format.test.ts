/**
 * audits/workflows/question-option-format.test.ts
 *
 * One option layout for every question bkit asks its owner. The letters live in
 * prose spread over the five phase workflows, the plan / design open-question
 * rules and the plan template, so a site that invents its own list
 * (`Options: A — …`, `Options: Accept / Fix now`) reads differently from run to
 * run. The canonical layout is the `**Question layout**` bullet of
 * `.bkit/core/.bkit/workflows.md`:
 *
 *     **Q{n} — {title}:** {question}
 *     Options: A) {option} / B) {option}
 *     Recommended: A) {option} — {reason}
 *
 * Distinct from `audits/workflows/prompt-notation.test.ts` (prompt-scoped
 * notation) and from `audits/workflows/counter-prose-audit.test.ts`
 * (counter-wiring): this one scans workflows, prompts, templates and the
 * authoring docs for one question-option rule.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

const WORKFLOWS = ".bkit/core/workflows";
const PROMPTS = ".bkit/core/prompts";
const TEMPLATES = ".bkit/core/docs/templates";
const AUTHORING = ".bkit/core/.bkit";
/** Every directory the option rule reaches. */
const SCAN_DIRS = [WORKFLOWS, PROMPTS, TEMPLATES, AUTHORING];

/** The canonical description of the layout, and the plan template's placeholder. */
const CANONICAL = ".bkit/core/.bkit/workflows.md";
const PLAN_TEMPLATE = ".bkit/core/docs/templates/bkit-plan.md";
/** The prompts index source, and the rendered mirror the dogfood install copies it into. */
const PROMPTS_INDEX = ".bkit/core/.bkit/prompts.md";
const PROMPTS_INDEX_MIRROR = ".bkit/prompts.md";

/**
 * The label opening an option list. Global, so every list a line carries is read,
 * not just the first. The lookbehind keeps headers that merely end in `Options`
 * (`X-Content-Type-Options: nosniff`) out of the scan.
 */
const OPTIONS_LABEL = /(?<![-\w])Options:/g;
const RECOMMENDED_LABEL = /(?<![-\w])Recommended:/;
/** Separators between the entries of one list: `A) … / B) …` and `A) … · B) …`. */
const ENTRY_SEPARATOR = /\s*(?:\/|·)\s*/;
/** A prompt line naming open questions and the options they carry. */
const OPEN_QUESTION = /open questions?/i;
const OPTIONS_WORD = /\boptions\b/i;
/** An option entry that carries its letter. */
const LETTER = /[A-Z]\)/;

interface OptionList {
  /** 1-based line. */
  no: number;
  /** The entry list as written, up to the closing code span. */
  raw: string;
  entries: string[];
}

interface Hit {
  no: number;
  tail: string;
}

/** A file's text, read from the repo root. */
const read = (file: string) => fs.readFileSync(path.join(REPO_ROOT, file), "utf-8");

/** Every `.md` file of one directory, repo-relative path and content. */
function mdFiles(dir: string): Array<{ file: string; text: string }> {
  const abs = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((n) => ({ file: `${dir}/${n}`, text: fs.readFileSync(path.join(abs, n), "utf-8") }));
}

/** Character ranges covered by the inline code spans of one line. */
function codeSpans(line: string): Array<[number, number]> {
  return [...line.matchAll(/`[^`]*`/g)].map((m) => [m.index!, m.index! + m[0].length]);
}

/**
 * A list sits either inside a code span or at the end of the line. A line that
 * only names the label carries a bare `Options:` and no entries, so it is not a
 * list and the rule has nothing to letter. Every label on the line is read: a
 * list whose label sits inside a span runs to that span's own closing backtick,
 * one whose label sits outside runs to the next label (or the line's end). The
 * span backticks are dropped, so an entry wrapped in its own code span still
 * reads as one entry.
 */
function optionLists(text: string): OptionList[] {
  const out: OptionList[] = [];
  text.split("\n").forEach((line, i) => {
    const matches = [...line.matchAll(OPTIONS_LABEL)];
    const spans = codeSpans(line);
    matches.forEach((m, at) => {
      const after = m.index + m[0].length;
      const span = spans.find(([start, end]) => after >= start && after < end);
      const end = span ? span[1] : (matches[at + 1]?.index ?? line.length);
      const raw = line.slice(after, end).replace(/`/g, "").trim();
      if (raw === "") return;
      out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
    });
  });
  // A `**Options:**` label closes its bold right after the colon, so the first
  // entry of that list carries the closing marker.
  out.forEach((list) => {
    list.raw = list.raw.replace(/^\*+\s*/, "");
    list.entries[0] = list.entries[0]!.replace(/^\*+\s*/, "");
  });
  return out;
}

/** The `Recommended:` tails, empty where the line only names the label. */
function recommendationTails(text: string): Hit[] {
  const out: Hit[] = [];
  text.split("\n").forEach((line, i) => {
    const m = RECOMMENDED_LABEL.exec(line);
    if (m === null) return;
    const tail = line
      .slice(m.index + m[0].length)
      .split("`")[0]!
      .trim();
    if (tail !== "") out.push({ no: i + 1, tail });
  });
  return out;
}

/** Why one file's `Options:` lines do not letter every entry, in line order. */
function optionViolations(file: string, text: string, offset = 0): string[] {
  return optionLists(text).flatMap(({ no, entries }) =>
    entries.flatMap((entry, i) => {
      const want = String.fromCharCode("A".charCodeAt(0) + i);
      return new RegExp(`^${want}\\)`).test(entry)
        ? []
        : [`${file}:${no + offset}: \`${entry}\` — write \`${want}) {option}\``];
    }),
  );
}

/** Why one file's `Recommended:` lines do not name the letter they recommend. */
function recommendationViolations(file: string, text: string): string[] {
  return recommendationTails(text)
    .filter(({ tail }) => !LETTER.test(tail))
    .map(({ no, tail }) => `${file}:${no}: \`Recommended: ${tail}\` — name the recommended letter`);
}

/** Every option-list violation of the given directories. */
function optionViolationsIn(dirs: string[]): string[] {
  return dirs.flatMap((dir) => mdFiles(dir).flatMap((f) => optionViolations(f.file, f.text)));
}

/** Every recommendation violation of the given directories. */
function recommendationViolationsIn(dirs: string[]): string[] {
  return dirs.flatMap((dir) =>
    mdFiles(dir).flatMap((f) => recommendationViolations(f.file, f.text)),
  );
}

/** Per scanned directory: the markdown it holds and the option lines they carry. */
function scanCounts(): Array<{ dir: string; files: number; optionLines: number }> {
  return SCAN_DIRS.map((dir) => {
    const files = mdFiles(dir);
    return {
      dir,
      files: files.length,
      optionLines: files.flatMap((f) => optionLists(f.text)).length,
    };
  });
}

/** A section of one file: its `## ` heading line through the line before the next. */
function section(text: string, heading: RegExp): string {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith("## ") && heading.test(l));
  if (start < 0) return "";
  const end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

/** The `**Question layout**` bullet of the canonical description. */
function layoutBullet(): string {
  return (
    read(CANONICAL)
      .split("\n")
      .find((l) => l.includes("**Question layout**")) ?? ""
  );
}

/** Every prompt line naming open questions and the options they carry. */
function openQuestionRules(): Array<{ file: string; no: number; text: string }> {
  return mdFiles(PROMPTS).flatMap((f) =>
    f.text
      .split("\n")
      .flatMap((text, i) =>
        OPEN_QUESTION.test(text) && OPTIONS_WORD.test(text)
          ? [{ file: f.file, no: i + 1, text }]
          : [],
      ),
  );
}

/** Every row of a prompts index that names open questions and the options they carry. */
function indexOpenQuestionRules(file: string): Array<{ no: number; text: string }> {
  return read(file)
    .split("\n")
    .flatMap((text, i) =>
      OPEN_QUESTION.test(text) && OPTIONS_WORD.test(text) ? [{ no: i + 1, text }] : [],
    );
}

/** The `Open Questions` placeholder of the plan template, and how many lines precede it. */
function planTemplateOpenQuestions(): { text: string; offset: number } {
  const doc = read(PLAN_TEMPLATE);
  const at = doc.split("\n").findIndex((l) => l.startsWith("## ") && /Open Questions/.test(l));
  return { text: section(doc, /Open Questions/), offset: at < 0 ? 0 : at };
}

describe("question option format: one layout across the corpus", () => {
  it("counts the option lines found per directory", () => {
    const counts = scanCounts();
    expect(counts.map((c) => c.dir)).toEqual(SCAN_DIRS);
    expect(counts.filter((c) => c.files === 0)).toEqual([]);
    expect(counts.filter((c) => c.optionLines === 0).length).toBeLessThanOrEqual(1);
    expect(counts.reduce((n, c) => n + c.optionLines, 0)).toBeGreaterThanOrEqual(5);
    expect(scanCounts().find((c) => c.dir === WORKFLOWS)!.optionLines).toBeGreaterThanOrEqual(3);
    expect(scanCounts().find((c) => c.dir === TEMPLATES)!.optionLines).toBeGreaterThanOrEqual(1);
    expect(scanCounts().find((c) => c.dir === AUTHORING)!.optionLines).toBeGreaterThanOrEqual(1);
  });

  it("the canonical layout letters every option and recommendation", () => {
    expect(layoutBullet(), `no \`Options: A) … / B) …\` in ${CANONICAL}`).toContain("Options: A)");
    expect(layoutBullet(), `no \`Recommended: A) X — {reason}\` in ${CANONICAL}`).toContain(
      "Recommended: A)",
    );
  });

  it("every option line in the workflows letters every entry", () => {
    expect(optionViolationsIn([WORKFLOWS])).toEqual([]);
  });

  it("every option line in the prompts, the templates and the authoring docs letters every entry", () => {
    expect(optionViolationsIn([PROMPTS, TEMPLATES, AUTHORING])).toEqual([]);
  });

  it("every recommendation line in the workflows names a letter", () => {
    expect(recommendationViolationsIn([WORKFLOWS])).toEqual([]);
  });

  it("every recommendation line in the templates and the prompts names a letter", () => {
    expect(recommendationViolationsIn([PROMPTS, TEMPLATES, AUTHORING])).toEqual([]);
  });

  it("every open-question rule in the prompts names the lettered option form", () => {
    expect(
      openQuestionRules().length,
      "the prompts state no open-question rule",
    ).toBeGreaterThanOrEqual(6);
    const bad = openQuestionRules()
      .filter((r) => !LETTER.test(r.text))
      .map((r) => `${r.file}:${r.no}: ${r.text.trim()}`);
    expect(bad).toEqual([]);
  });

  it("every open-question rule in the prompts index names the lettered option form", () => {
    const rules = indexOpenQuestionRules(PROMPTS_INDEX);
    expect(rules.length, "the prompts index states no open-question rule").toBeGreaterThanOrEqual(
      5,
    );
    const bad = rules
      .filter((rule) => !LETTER.test(rule.text))
      .map((rule) => `${PROMPTS_INDEX}:${rule.no}: ${rule.text.trim()}`);
    expect(bad).toEqual([]);
    expect(
      indexOpenQuestionRules(PROMPTS_INDEX_MIRROR).map((rule) => rule.text),
      `${PROMPTS_INDEX_MIRROR} is stale — run the dogfood install`,
    ).toEqual(rules.map((rule) => rule.text));
  });

  it("the plan template letters every option of its Open Questions placeholder", () => {
    const open = planTemplateOpenQuestions();
    expect(
      optionLists(open.text).length,
      `no \`Options:\` list in the ${PLAN_TEMPLATE} placeholder`,
    ).toBeGreaterThan(0);
    expect(optionViolations(PLAN_TEMPLATE, open.text, open.offset)).toEqual([]);
  });
});

describe("question option format: the rules fire on a synthetic list", () => {
  it("RED-PROOF: a synthetic `Options: A / B` line fires the option rule", () => {
    const line =
      "per question `**Q1 — Fix:** another attempt?`, `Options: A / B`, then `Recommended: A) Try again`.";
    expect(optionViolations("synthetic.md", line).length).toBeGreaterThan(0);
  });

  it("RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule", () => {
    const line =
      "`**Q1 — Fix:** accepted without you during build. Confirm it?`, `Options: Accept / Fix now`, then `No recommendation — only you can accept it`.";
    expect(optionViolations("synthetic.md", line).length).toBeGreaterThan(0);
  });

  it("RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule", () => {
    const line =
      "`Options: A) Try again / B) Stop`, then `Recommended: {Try again|Stop} — {reason}`.";
    expect(recommendationViolations("synthetic.md", line).length).toBeGreaterThan(0);
  });

  it("RED-PROOF: a second Options: list on one line still fires the option rule", () => {
    const line =
      "the lettered option list `Options: A) {option} / B) {option}`, a named option included (`Options: Accept / Fix now`).";
    expect(optionViolations("synthetic.md", line).length).toBeGreaterThan(0);
  });

  it("an option list whose entries span code spans letters every entry", () => {
    const line = "Options: `A) yes` / `no`";
    expect(optionLists(line).map((list) => list.entries)).toEqual([["A) yes", "no"]]);
    expect(optionViolations("synthetic.md", line)).toEqual([
      "synthetic.md:1: `no` — write `B) {option}`",
    ]);
  });

  it("a lettered list of named options passes both rules", () => {
    const line =
      "`Options: A) Accept / B) Fix now`, then `Recommended: A) Accept — {reason}` and `No recommendation — {why}`.";
    expect(optionViolations("synthetic.md", line)).toEqual([]);
    expect(recommendationViolations("synthetic.md", line)).toEqual([]);
  });
});
