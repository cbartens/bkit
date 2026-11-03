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

/** The two design prompts stating the open-question rule, and the review that checks it. */
const DESIGN_GENERATE = `${PROMPTS}/bkit-design-generate.md`;
const DESIGN_UPDATE = `${PROMPTS}/bkit-design-update.md`;
const DESIGN_REVIEW_2 = `${PROMPTS}/bkit-design-review-2.md`;
/** The rendered design review, one file per installed provider. */
const DESIGN_REVIEW_2_MIRRORS = [
  ".claude/agents/bkit-design-review-2.md",
  ".cursor/agents/bkit-design-review-2.md",
  ".opencode/agents/bkit-design-review-2.md",
  ".agents/plugins/bkit/agents/bkit-design-review-2.md",
  ".codex/agents/bkit-design-review-2.toml",
];
/**
 * The parts every open question must carry, as the design prompts name them:
 * lettered options, a lettered `Recommended`, and `Default if unanswered`.
 */
const OPEN_QUESTION_PARTS = ["A)", "Recommended", "Default if unanswered"];

/**
 * The label opening an option list. Global, so every list a line carries is read,
 * not just the first. The lookbehind keeps headers that merely end in `Options`
 * (`X-Content-Type-Options: nosniff`) out of the scan.
 */
const OPTIONS_LABEL = /(?<![-\w])Options:/g;
/** The label opening a recommendation. Global, like `OPTIONS_LABEL`. */
const RECOMMENDED_LABEL = /(?<![-\w])Recommended:/g;
/** Separators between the entries of one list: `A) … / B) …` and `A) … · B) …`. */
const ENTRY_SEPARATOR = /\s*(?:\/|·)\s*/;
/** A prompt line naming open questions and the options they carry. */
const OPEN_QUESTION = /open questions?/i;
const OPTIONS_WORD = /\boptions\b/i;
/** An option entry that carries its letter. */
const LETTER = /[A-Z]\)/;
/** A recommendation tail that opens on its letter, after an optional `{` or bold marker. */
const RECOMMENDED_LETTER = /^[*{\s]*[A-Z]\)/;
/**
 * The sentence every step routing on the owner's answer carries, so a reply by
 * letter reaches the option it labels instead of the `**Else**` branch.
 */
const LETTER_REPLY_CLAUSE =
  "A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.";
/** A branch routing on the owner's answer by option name. */
const ANSWER_BRANCH = /\*\*If\*\*[^→]*?(?:the answer is|answers|loop question =) `[^`]+`/;
/** The first line of a numbered step. */
const STEP_START = /^\s*\d+\. /;
/** The command writing the owner's confirm or reject of an assumed Accept. */
const OWNER_APPLY = "decisions apply --by=owner";

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

/**
 * The `Recommended:` tails, empty where the line only names the label. Every
 * label on the line is read; a tail runs to the next backtick or the next label.
 */
function recommendationTails(text: string): Hit[] {
  const out: Hit[] = [];
  text.split("\n").forEach((line, i) => {
    const matches = [...line.matchAll(RECOMMENDED_LABEL)];
    matches.forEach((m, at) => {
      const tail = line
        .slice(m.index + m[0].length, matches[at + 1]?.index ?? line.length)
        .split("`")[0]!
        .trim();
      if (tail !== "") out.push({ no: i + 1, tail });
    });
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
    .filter(({ tail }) => !RECOMMENDED_LETTER.test(tail))
    .map(({ no, tail }) => `${file}:${no}: \`Recommended: ${tail}\` — name the recommended letter`);
}

/** Each numbered step of one text, up to the next step or heading: first line and lines. */
function steps(text: string): Array<{ no: number; lines: string[] }> {
  const out: Array<{ no: number; lines: string[] }> = [];
  let open = false;
  text.split("\n").forEach((line, i) => {
    if (/^#{2,6} /.test(line)) open = false;
    if (STEP_START.test(line)) {
      out.push({ no: i + 1, lines: [] });
      open = true;
    }
    if (open) out.at(-1)!.lines.push(line);
  });
  return out;
}

/** Why one file's answer branches can miss a reply given by letter, in line order. */
function answerRoutingViolations(file: string, text: string): string[] {
  return steps(text).flatMap(({ no, lines }) =>
    lines.flatMap((line, i) =>
      ANSWER_BRANCH.test(line) && !lines.slice(0, i).join("\n").includes(LETTER_REPLY_CLAUSE)
        ? [`${file}:${no + i}: routes on an option name; state \`${LETTER_REPLY_CLAUSE}\` first`]
        : [],
    ),
  );
}

/**
 * Why one file's owner-confirm steps can write an answer the owner did not give:
 * each runs `--confirm` only on `Confirm`, `--reject` only on `Reject`, and asks
 * again on any other reply.
 */
function ownerConfirmViolations(file: string, text: string): string[] {
  const want = [
    LETTER_REPLY_CLAUSE,
    "**If** the answer is `Confirm`",
    "**If** the answer is `Reject`",
    "**Else** → ask again",
  ];
  return steps(text)
    .filter(({ lines }) => lines.some((l) => l.includes(OWNER_APPLY)))
    .flatMap(({ no, lines }) =>
      want
        .filter((part) => !lines.join("\n").includes(part))
        .map((part) => `${file}:${no}: the owner-confirm step lacks \`${part}\``),
    );
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

/** The open-question rule lines of one file, joined in line order. */
function openQuestionRuleLines(file: string): string {
  return read(file)
    .split("\n")
    .filter((line) => OPEN_QUESTION.test(line) && OPTIONS_WORD.test(line))
    .join("\n");
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

  it("every answer branch after a lettered question accepts the option letter", () => {
    const files = mdFiles(WORKFLOWS);
    const branches = files.flatMap((f) => f.text.split("\n").filter((l) => ANSWER_BRANCH.test(l)));
    expect(branches.length, "the workflows route on no answer").toBeGreaterThanOrEqual(6);
    expect(files.flatMap((f) => answerRoutingViolations(f.file, f.text))).toEqual([]);
  });

  it("every answer-routing step maps a lettered reply to its option name", () => {
    const files = mdFiles(WORKFLOWS);
    expect(
      files.filter((f) => f.text.includes(OWNER_APPLY)).length,
      `no workflow runs \`${OWNER_APPLY}\``,
    ).toBeGreaterThan(0);
    expect(files.flatMap((f) => ownerConfirmViolations(f.file, f.text))).toEqual([]);
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

  it("the design review names every part the design prompts require", () => {
    // The two design prompts demand the same parts of an open question, so the
    // review that flags a malformed one cannot check a shorter list.
    for (const file of [DESIGN_GENERATE, DESIGN_UPDATE]) {
      const rule = openQuestionRuleLines(file);
      expect(rule, `${file} states no open-question rule`).not.toBe("");
      for (const part of OPEN_QUESTION_PARTS) {
        expect(rule, `${file} does not require \`${part}\``).toContain(part);
      }
    }
    // The review, its rendered mirrors and the index row describing it.
    for (const file of [DESIGN_REVIEW_2, ...DESIGN_REVIEW_2_MIRRORS]) {
      const rule = openQuestionRuleLines(file);
      expect(rule, `${file} states no open-question rule`).not.toBe("");
      for (const part of OPEN_QUESTION_PARTS) {
        expect(rule, `${file} does not name \`${part}\``).toContain(part);
      }
    }
    const row = indexOpenQuestionRules(PROMPTS_INDEX).find((r) =>
      r.text.includes("bkit-design-review-2"),
    );
    expect(row, `${PROMPTS_INDEX} has no bkit-design-review-2 row`).toBeDefined();
    for (const part of OPEN_QUESTION_PARTS) {
      expect(row!.text, `${PROMPTS_INDEX}:${row!.no} does not name \`${part}\``).toContain(part);
    }
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

  it("RED-PROOF: a letter only inside a trailing parenthesis does not satisfy the recommendation rule", () => {
    expect(
      recommendationViolations("synthetic.md", "`Recommended: Fix now (see TASK B)`").length,
    ).toBeGreaterThan(0);
  });

  it("RED-PROOF: a second letterless Recommended: on one line fires", () => {
    const line = "`Recommended: A) Accept — {reason}` or `Recommended: Fix now — {reason}`.";
    expect(recommendationViolations("synthetic.md", line)).toEqual([
      "synthetic.md:1: `Recommended: Fix now — {reason}` — name the recommended letter",
    ]);
  });

  it("RED-PROOF: an answer branch with no lettered-reply clause in its step fires", () => {
    const step = [
      "3. Record the reply before anything else.",
      "   - **If** the answer is `Try again` → return to the calling step.",
      "   - **If** the answer is `Stop` → step 4.",
      "   - **Else** → discuss → record the wait (step 2) → end turn.",
    ].join("\n");
    expect(answerRoutingViolations("synthetic.md", step).length).toBe(2);
    const fixed = step.replace("anything else.", `anything else. ${LETTER_REPLY_CLAUSE}`);
    expect(answerRoutingViolations("synthetic.md", fixed)).toEqual([]);
  });

  it("RED-PROOF: an owner-confirm step defaulting to --confirm fires", () => {
    const step = [
      "3. Record each reply before anything else, then write each answer:",
      "   ```bash",
      `   "{BKIT}" ${OWNER_APPLY} --file="{FILE}" --q={Q} --confirm --reason="{human's words}"`,
      "   ```",
      "   `--reject` in place of `--confirm` for a `Reject`. **If** an entry has no answer → ask again.",
    ].join("\n");
    expect(ownerConfirmViolations("synthetic.md", step).length).toBeGreaterThan(0);
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
