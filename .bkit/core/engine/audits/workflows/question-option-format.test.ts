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
const RECOMMENDED_LETTER = /^[*{\s]*(?:[A-Z]\)|none — )/;
/** One option on its own line: `A) {option} — {effect}`, optionally bulleted. */
const OPTION_LINE = /^\s*(?:[-*]\s+)?([A-Z])\) (.*)$/;
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
 * The per-line option blocks of one text: each run of consecutive lines opening
 * on a letter and `)`, as the shared question shape writes them.
 */
function optionLineBlocks(text: string): Array<{ no: number; lines: string[] }> {
  const out: Array<{ no: number; lines: string[] }> = [];
  let open = false;
  text.split("\n").forEach((line, i) => {
    if (OPTION_LINE.test(line)) {
      if (!open) out.push({ no: i + 1, lines: [] });
      out.at(-1)!.lines.push(line.trim().replace(/^[-*]\s+/, ""));
      open = true;
    } else open = false;
  });
  return out;
}

/** Why a per-line option block misses its letter or its effect. */
function optionLineViolations(file: string, text: string, offset = 0): string[] {
  return optionLineBlocks(text).flatMap(({ no, lines }) =>
    lines.flatMap((entry, i) => {
      const want = String.fromCharCode("A".charCodeAt(0) + i);
      const at = no + i + offset;
      if (!entry.startsWith(`${want}) `))
        return [`${file}:${at}: \`${entry}\` — write \`${want}) {option} — {effect}\``];
      return /\S\s+—\s+\S/.test(entry)
        ? []
        : [`${file}:${at}: \`${entry}\` — say what happens if it is picked, after a \`—\``];
    }),
  );
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
  return [
    ...optionLists(text).flatMap(({ no, entries }) =>
      entries.flatMap((entry, i) => {
        const want = String.fromCharCode("A".charCodeAt(0) + i);
        return new RegExp(`^${want}\\)`).test(entry)
          ? []
          : [`${file}:${no + offset}: \`${entry}\` — write \`${want}) {option}\``];
      }),
    ),
    ...optionLineViolations(file, text, offset),
  ];
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
      optionLines: files.reduce(
        (n, f) => n + optionLists(f.text).length + optionLineBlocks(f.text).length,
        0,
      ),
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
    expect(humanQuestions(), `no lettered option line in ${AUTHORING_DOC}`).toMatch(/^\s*A\) /m);
    expect(humanQuestions(), `no \`Recommended: A) X — {reason}\` in ${AUTHORING_DOC}`).toContain(
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
      optionLineBlocks(open.text).length,
      `no per-line option block in the ${PLAN_TEMPLATE} placeholder`,
    ).toBeGreaterThan(0);
    expect(optionViolations(PLAN_TEMPLATE, open.text, open.offset)).toEqual([]);
    expect(optionLineViolations(PLAN_TEMPLATE, open.text, open.offset)).toEqual([]);
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

const AUTHORING_DOC = ".bkit/core/.bkit/authoring.md";
const PHASE_WORKFLOWS = ["bkit-design", "bkit-plan", "bkit-build", "bkit-debug", "bkit-ship"];
const DEFAULT_SET = [
  "the run waits for you",
  "taken as A when nobody can be asked",
  "the run stops when nobody can be asked",
  "the plan assumes A",
  "the plan stops at Gate 1 until you answer",
  "the design assumes A",
  "written as a needs-decision deferral",
];

/** The `Human questions` bullet of the authoring doc, with its sub-bullets and code block. */
function humanQuestions(): string {
  const lines = read(AUTHORING_DOC).split("\n");
  const start = lines.findIndex((l) => l.startsWith("- **Human questions:**"));
  if (start < 0) return "";
  const end = lines.findIndex((l, i) => i > start && /^- \*\*/.test(l));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

describe("question option format: the shared shape in § Human questions", () => {
  it("the canonical shape puts each option on its own line with its effect", () => {
    const doc = humanQuestions();
    expect(doc, "§ Human questions still shows the inline Options line").not.toMatch(
      /^\s*Options: A\)/m,
    );
    expect(doc).toMatch(/^\s*A\) \{option\} — \{what happens if you pick it\}$/m);
    expect(doc).toMatch(/^\s*B\) \{option\} — \{what happens if you pick it\}$/m);
  });

  it("the canonical shape carries a Default if unanswered line from the fixed set", () => {
    const doc = humanQuestions();
    expect(doc).toContain("Default if unanswered:");
    expect(DEFAULT_SET.filter((phrase) => !doc.includes(phrase))).toEqual([]);
  });

  it("the canonical shape gives a hard blocker Recommended: none", () => {
    const doc = humanQuestions();
    expect(doc).toContain("Recommended: none — ");
    expect(doc).not.toContain("No recommendation");
  });

  it("the canonical shape ends a message with the reply line and the one-by-one offer", () => {
    const doc = humanQuestions();
    expect(doc).toContain(
      'Reply with a letter per question, or "yes" to take every recommendation.',
    );
    expect(doc).toContain('Or say "one by one" and I\'ll ask them one at a time.');
  });

  it("the canonical shape keeps the plain-English rule for the question, each option and the recommendation's reason", () => {
    const doc = humanQuestions();
    expect(doc).toContain("the reason for the recommendation");
    expect(doc).toContain("in plain English");
  });

  it("the Question layout bullet points to § Human questions", () => {
    const bullet = layoutBullet();
    expect(bullet).toContain("Human questions");
    expect(bullet).not.toContain("Options: A)");
    expect(bullet).not.toContain("Reply per question.");
  });

  it("RED-PROOF: an option line with no effect fires the option-line rule", () => {
    expect(
      optionViolations("synthetic.md", "A) Accept\nB) Fix now — the fix runs again").length,
    ).toBeGreaterThan(0);
    expect(
      optionViolations(
        "synthetic.md",
        "A) Accept — the item stays\nB) Fix now — the fix runs again",
      ),
    ).toEqual([]);
  });
});

describe("question option format: the reply-line clauses reach the workflows", () => {
  it("no workflow carries the retired reply wording", () => {
    const hits = mdFiles(WORKFLOWS).flatMap((f) =>
      ['"stop" writes a handover', 'Reply per question. "yes" takes every recommendation.']
        .filter((wording) => f.text.includes(wording))
        .map((wording) => `${f.file}: ${wording}`),
    );
    expect(hits).toEqual([]);
  });

  it("bkit-build: the Decision Pause yes line uses the shared reply wording", () => {
    const text = read(`${WORKFLOWS}/bkit-build.md`);
    expect(text).toContain(
      'Reply with a letter per question, or "yes" to take every recommendation.',
    );
    expect(text).not.toContain('"yes" takes every recommendation; it never answers');
  });

  it("every workflow that asks the owner states the question, each option and the recommendation's reason in plain English", () => {
    const sentence =
      "State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.";
    const missing = PHASE_WORKFLOWS.filter(
      (name) => read(`${WORKFLOWS}/${name}.md`).split(sentence).length - 1 < 1,
    );
    expect(missing).toEqual([]);
  });
});

/** A workflow's text, read from the workflows directory. */
const workflow = (name: string) => read(`${WORKFLOWS}/${name}.md`);

/** One numbered step of a section: its first line to the line before the next top-level number. */
function numberedStep(sectionText: string, n: number): string {
  const lines = sectionText.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${n}. `));
  if (start < 0) return "";
  const end = lines.findIndex((l, i) => i > start && /^\d+\. /.test(l));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

/** A bullet at one indent: from its first line to the line before the next sibling bullet. */
function bulletFrom(text: string, start: RegExp, indent: number): string {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => start.test(l));
  if (at < 0) return "";
  const sibling = new RegExp(`^ {${indent}}- `);
  const end = lines.findIndex((l, i) => i > at && sibling.test(l));
  return lines.slice(at, end === -1 ? undefined : end).join("\n");
}

const countOf = (text: string, needle: string) => text.split(needle).length - 1;
const STOP_EFFECT = "Stop — the run ends here with a handover; the next run resumes here";

describe("question option format: the build Decision Pause in the shared shape", () => {
  const pause = () => section(workflow("bkit-build"), /Decision Pause/);

  it("bkit-build: every decision item option carries an effect", () => {
    const step = numberedStep(pause(), 2);
    expect(step).toContain('{"name", "effect"}');
    expect(step).toContain(STOP_EFFECT);
    expect(step, "a bare-string option list is still named").not.toMatch(/\["Accept", "Fix now"/);
  });

  it("bkit-build: the pause message shows the default line and Recommended: none", () => {
    const step = numberedStep(pause(), 4);
    expect(step).toContain("Default if unanswered:");
    expect(step).toContain("Recommended:");
    expect(step).toContain("Recommended: none");
    expect(step).not.toContain("No recommendation");
  });

  it("bkit-build: a one-by-one reply asks the questions one at a time", () => {
    const step = numberedStep(pause(), 4);
    expect(step).toContain("one by one");
    expect(step).toMatch(/one by one[^\n]*(?:its own message|one at a time)/);
  });

  it("bkit-build: the one-by-one offer follows the asked count", () => {
    const step = numberedStep(pause(), 4);
    expect(step).toMatch(/one by one[^\n]*3 or more questions|3 or more questions[^\n]*one by one/);
  });
});

describe("question option format: the debug questions in the shared shape", () => {
  const loop = () => numberedStep(section(workflow("bkit-debug"), /Loop Question/), 3);
  const step1 = () => section(workflow("bkit-debug"), /Step 1 — Start Workflow/);
  const step2 = () => section(workflow("bkit-debug"), /Step 2 — Worktree Setup/);
  const branchQuestion = () => bulletFrom(step1(), /Q1 — Branch/, 0) || step1();

  it("bkit-debug: the loop question gives each option its effect and the recommendation a reason", () => {
    const step = loop();
    expect(step).not.toContain("Options: A) Stop / B) Try again");
    expect(step).toContain(`A) ${STOP_EFFECT}`);
    expect(step).toMatch(/B\) Try again — \S/);
    expect(step).toMatch(/Recommended: A\) Stop — \S/);
  });

  it("bkit-debug: the loop question's recommendation reason matches its trigger", () => {
    const step = loop();
    expect(step).toMatch(
      /`LOOP_LIMIT` = true[\s\S]{0,300}?Recommended: A\) Stop — the attempts set aside for this are used up/,
    );
    expect(step).toContain(
      "Recommended: A) Stop — the attempts so far have not brought the failures down through a code change",
    );
    expect(step).not.toContain("left no fewer failures");
  });

  it("bkit-debug: every question shows a Default if unanswered line", () => {
    expect(loop()).toContain("Default if unanswered: the run waits for you");
  });

  it("bkit-debug: the branch check asks a formatted question", () => {
    const text = step1();
    expect(text).toContain("**Q1 — Branch:**");
    expect(text).toContain("Name another branch");
    expect(text).toContain("Stop — nothing changes; the run can be started again");
    expect(text, "the branch route is still a bare STOP").not.toMatch(
      /Exit 3 or 8 → \*\*STOP\*\* with the missing or ambiguous branch/,
    );
  });

  it("bkit-debug: the CI-run stop asks a formatted question", () => {
    const text = step2();
    expect(text).toContain("**Q1 — CI run:**");
    expect(text).toContain(
      "Use local discovery — debug runs the tests itself instead of reading CI",
    );
    expect(text).toContain(STOP_EFFECT);
    expect(text).toContain("owner-pause --field=reason=decision");
  });

  it("bkit-debug: the branch check and CI-run question show Recommended: none and a Default if unanswered line", () => {
    expect(step1()).toContain("Recommended: none — only you know which branch you meant");
    expect(step2()).toContain("Recommended: none — only you know which run you meant");
    const fallback =
      "Default if unanswered: the run waits for you; the run stops when nobody can be asked";
    expect(step1()).toContain(fallback);
    expect(step2()).toContain(fallback);
  });

  it("bkit-debug: the CI-run question releases the lock only on Stop", () => {
    const route = bulletFrom(step2(), /\*\*If\*\* exit 8 or 82/, 3);
    expect(route, "no exit 8 or 82 route found").not.toBe("");
    const [beforeStop, afterStop] = route.split(/answer is `Stop`/);
    expect(afterStop, "the route has no Stop answer").toBeDefined();
    expect(beforeStop).not.toMatch(/release the workflow lock|locks release/);
    expect(afterStop).toMatch(/locks release/);
  });

  it("bkit-debug: the foreign-path stop shows the Action needed line", () => {
    expect(workflow("bkit-debug")).toContain(
      '**Action needed — Foreign path:** commit or revert {file}. Then say "continue".',
    );
  });

  it("bkit-debug: every question message ends with the reply line its point uses", () => {
    const step1Text = step1();
    expect(step1Text).toContain(
      'Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.',
    );
    expect(step2()).toContain(
      'Reply with a letter per question. "stop" ends here with a handover; the next run resumes here.',
    );
    expect(branchQuestion()).not.toContain('or "yes" to take every recommendation');
    expect(step2()).not.toContain('or "yes" to take every recommendation');
    expect(loop()).toContain(
      'Reply with a letter per question, or "yes" to take every recommendation.',
    );
  });
});

describe("question option format: the ship questions in the shared shape", () => {
  const assumed = () => section(workflow("bkit-ship"), /Confirm Assumed Items/);
  const merge = () => section(workflow("bkit-ship"), /Merge Question/);

  it("bkit-ship: the assumed-item question gives each option its effect", () => {
    const text = assumed();
    expect(text).not.toContain("Options: A) Confirm / B) Reject");
    expect(text).toMatch(/A\) Confirm — \S/);
    expect(text).toMatch(/B\) Reject — \S/);
  });

  it("bkit-ship: an assumed item is a hard blocker with Recommended: none", () => {
    const text = assumed();
    expect(text).toContain("Recommended: none — only you can accept it");
    expect(text).not.toContain("No recommendation");
  });

  it("bkit-ship: every question shows a Default if unanswered line", () => {
    expect(assumed()).toContain("Default if unanswered: written as a needs-decision deferral");
    expect(merge()).toContain("Default if unanswered: the run waits for you");
  });

  it("bkit-ship: the merge question gives each option its effect", () => {
    const text = merge();
    expect(text).not.toContain("Options: A) Stop / B) Try again");
    expect(text).toContain(`A) ${STOP_EFFECT}`);
    expect(text).toMatch(/B\) Try again — \S/);
  });

  it("bkit-ship: every question message ends with the reply line its point uses", () => {
    expect(assumed()).not.toContain("Reply per question. Ship merges either way");
    expect(assumed()).toContain("Reply with a letter per question");
    expect(merge()).toContain(
      'Reply with a letter per question, or "yes" to take every recommendation.',
    );
  });
});

describe("question option format: the design questions in the shared shape", () => {
  const grill = () => section(workflow("bkit-design"), /Step 3 — Grill/);
  const oneByOneLine = (name: string) =>
    workflow(name)
      .split("\n")
      .find((l) => /^7\. \*\*If\*\* user requests the open questions one by one/.test(l)) ?? "";

  it("bkit-design: the grill question gives each option its effect and the recommendation a reason", () => {
    const text = grill();
    expect(text).toMatch(/A\) \{[^}]*\} — \{[^}]*\}/);
    expect(text).toContain("Recommended: A) {answer} — {why}");
  });

  it("bkit-design: the draft-scenario question gives each option its effect", () => {
    const text = grill();
    expect(text).not.toContain("Options: A) yes / B) no");
    expect(text).toContain("A) Yes — the draft becomes the design's starting point");
    expect(text).toContain("B) No — the draft is revised from your reply before the design starts");
    expect(text).toMatch(/Recommended: A\) Yes — \S/);
  });

  it("bkit-design: every question shows a Default if unanswered line", () => {
    expect(countOf(grill(), "Default if unanswered: the design assumes A")).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("bkit-design: the grill message ends with the reply line and the one-by-one offer", () => {
    const text = grill();
    expect(text).toMatch(/Reply with a letter per question[^\n]*"stop"/);
    expect(text).toContain("one by one");
  });

  it("bkit-design: a one-by-one grill round counts as one grill turn", () => {
    expect(grill()).toMatch(/one by one[^\n]*GRILL_TURNS|GRILL_TURNS[^\n]*one by one/);
  });

  it("the one-by-one open-questions pass forbids the host question tool in design and plan", () => {
    for (const name of ["bkit-design", "bkit-plan"]) {
      const line = oneByOneLine(name);
      expect(line, `${name}: no one-by-one step found`).not.toBe("");
      expect(line, `${name} does not forbid the host question tool`).toContain(
        "not through a host question tool",
      );
      expect(line, `${name} still asks the item verbatim`).not.toContain("verbatim");
      expect(line).toContain(
        "keeping its options, `Recommended` and `Default if unanswered` as written",
      );
    }
  });
});

describe("question option format: the Step 1 issue-and-branch stops in the shared shape", () => {
  const step1 = (name: string) => section(workflow(name), /Step 1/);
  const SLUG_WORKFLOWS = ["bkit-design", "bkit-plan", "bkit-build", "bkit-ship"];
  const BARE_NUMBER_WORKFLOWS = ["bkit-build", "bkit-ship"];

  it("every workflow's Step 1 ambiguous-issue stop asks a formatted question", () => {
    for (const name of PHASE_WORKFLOWS) {
      const text = step1(name);
      expect(text, `${name}: no Q1 — Issue question`).toContain("**Q1 — Issue:**");
      expect(text, `${name}: no Use {issue} option`).toContain(
        "Use {issue} — the run works on {issue}",
      );
      expect(text, `${name}: no Stop option`).toContain(
        "Stop — nothing changes; the run can be started again",
      );
      expect(text, `${name}: the exit 8 route is still a bare STOP`).not.toMatch(
        /exit 8 → \*\*STOP\*\*; tell the user the prompt names more than one issue/,
      );
    }
  });

  it("every workflow's Step 1 issue question shows Recommended: none and a Default if unanswered line", () => {
    for (const name of PHASE_WORKFLOWS) {
      const text = step1(name);
      expect(text, `${name}: no Recommended: none`).toContain(
        "Recommended: none — only you know which issue you meant",
      );
      expect(text, `${name}: no Default if unanswered line`).toContain(
        "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
      );
    }
  });

  it("every workflow's Step 1 slug and bare-number stops show the Action needed line", () => {
    for (const name of SLUG_WORKFLOWS) {
      const text = step1(name);
      expect(text, `${name}: no slug Action needed line`).toContain(
        '**Action needed — Branch name:** rename `BRANCH` to `feat/{lowercase-slug}`, or name an issue. Then say "continue".',
      );
      expect(text, `${name}: the exit 3 route is still a bare STOP`).not.toContain(
        "tell the user to rename `BRANCH`",
      );
    }
    for (const name of BARE_NUMBER_WORKFLOWS) {
      const text = step1(name);
      expect(text, `${name}: no bare-number Action needed line`).toContain(
        '**Action needed — Issue reference:** name the issue as `#N`, its key or its URL. Then say "continue".',
      );
      expect(text, `${name}: the exit 9 route is still a bare STOP`).not.toContain(
        "the prompt holds only a bare number and to name the issue",
      );
    }
  });

  it("the Step 1 issue question re-runs fids parse on the owner's answer file", () => {
    for (const name of PHASE_WORKFLOWS) {
      const text = step1(name);
      expect(text, `${name}: no owner-answer.md write`).toContain("{SESSION_DIR}/owner-answer.md");
      expect(text, `${name}: no fids parse re-run on the answer file`).toContain(
        'fids parse --prompt-file="{SESSION_DIR}/owner-answer.md"',
      );
    }
  });
});

describe("question option format: open questions one option per line, in plain English", () => {
  const INLINE_OPTIONS = "`Options: A) {option} — {trade-off} · B) …`";
  const INDEX_INLINE = "the lettered `Options: A) …`";

  it("the plan template puts each open-question option on its own line", () => {
    const open = planTemplateOpenQuestions().text;
    expect(open, "the placeholder still shows the inline · B) list").not.toMatch(/· B\)/);
    expect(open).toMatch(/^\s*(?:[-*]\s+)?A\) \[option\] — \[trade-off\]$/m);
    expect(open).toMatch(/^\s*(?:[-*]\s+)?B\) /m);
    expect(open).toContain("the plan assumes A");
    expect(open).toContain("the plan stops at Gate 1 until you answer");
  });

  it("every open-question rule in the prompts asks for one option per line", () => {
    const rules = openQuestionRules();
    expect(rules.length, "the prompts state no open-question rule").toBeGreaterThanOrEqual(6);
    const inline = rules.filter((r) => r.text.includes(INLINE_OPTIONS));
    const notPerLine = rules.filter((r) => !/one (?:lettered )?option per line/.test(r.text));
    const bad = [...inline, ...notPerLine].map((r) => `${r.file}:${r.no}: ${r.text.trim()}`);
    expect(bad).toEqual([]);
  });

  it("the design review flags an open question whose options share one line", () => {
    const rule = read(DESIGN_REVIEW_2);
    expect(rule, `${DESIGN_REVIEW_2} names no one-per-line check`).toMatch(
      /options? (?:that )?share (?:one|a) line|one option per line/,
    );
  });

  it("the prompts index describes one option per line", () => {
    const rows = indexOpenQuestionRules(PROMPTS_INDEX);
    expect(rows.length, "the prompts index states no open-question rule").toBeGreaterThanOrEqual(5);
    const bad = rows
      .filter((row) => row.text.includes(INDEX_INLINE))
      .map((row) => `${PROMPTS_INDEX}:${row.no}: ${row.text.trim()}`);
    expect(bad).toEqual([]);
    expect(rows.filter((row) => !/one (?:lettered )?option per line/.test(row.text))).toEqual([]);
  });

  it("no workflow, prompt, template or authoring doc carries an inline Options: list", () => {
    const files = SCAN_DIRS.flatMap(mdFiles);
    expect(files.length).toBeGreaterThan(0);
    const bad = files.flatMap((f) =>
      f.text
        .split("\n")
        .map((line, i) => ({ line, at: `${f.file}:${i + 1}` }))
        .filter(({ line }) => /(?<![-\w])Options: A\)/.test(line))
        .map(({ line, at }) => `${at}: ${line.trim().slice(0, 120)}`),
    );
    expect(bad).toEqual([]);
  });

  it("every open-question writer asks for plain English", () => {
    for (const name of [
      "bkit-plan-generate",
      "bkit-plan-update",
      "bkit-design-generate",
      "bkit-design-update",
    ]) {
      const text = read(`${PROMPTS}/${name}.md`);
      expect(text, `${name} names no plain-English rule for open questions`).toMatch(
        /open question[^\n]*in plain English|in plain English[^\n]*open question/i,
      );
    }
  });
});
