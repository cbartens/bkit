// tools/wording.ts — check and sync the shared sentences in `.bkit/wording.md`.
//
// Check mode runs in the test suite (`tools/wording.test.ts`); write mode is
// `pnpm wording:sync`. Same model as prettier: CI checks, the author writes.
//
// The unit is the sentence. A clause is matched as a substring of a line, so a
// list marker, step number, or trailing local text around it never matters.
// Clause instances carry no markers in the prompts: sync finds them by
// near-copy similarity and by the clause's `retired` wordings, which is how a
// wording change reaches every file — edit the clause, move the old text to
// `retired`, run the sync.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { findLineAnchoredMarkers, selectMarkers } from "../install/managed-block.js";

export type Surface = "prompt" | "workflow" | "rules" | "audit";
export type Mode =
  "required" | "where-used" | "repeatable" | "forbidden" | "if-verdict" | "if-bash";
export type Position = "first" | "header" | "last";

export interface Clause {
  name: string;
  /** Canonical wordings; more than one = exactly one of them is used. */
  texts: string[];
  /** Earlier wordings: never valid, and sync rewrites them to `texts[0]`. */
  retired: string[];
  modes: Partial<Record<Surface, Mode>>;
  /** File basenames (no `.md`) that word this clause differently. */
  except: Set<string>;
  /** Header line for prompts and workflows, in wording-file order among positioned clauses; first / last also open / close the labelled lines. */
  position?: Position;
  /** Slotted clause only: a line holding the fixed text before the first slot must match one of the templates. */
  anchored: boolean;
}

export interface WordingFile {
  surface: Surface;
  /** Repo-relative path. */
  id: string;
  /** Basename without `.md`, matched against `except`. */
  name: string;
  content: string;
}

export interface Finding {
  file: string;
  line?: number;
  clause: string;
  problem: string;
}

/** Near-copy threshold: a sentence this similar to a clause but not equal to it is drift. */
export const NEAR_COPY = 0.8;
/** Cut-off per surface: a sentence shared by this many files of one surface belongs in the wording file. */
export const SHARED_MIN: Partial<Record<Surface, number>> = { prompt: 5, workflow: 3, audit: 5 };

const SURFACES: readonly Surface[] = ["prompt", "workflow", "rules", "audit"];
/** Surfaces whose files open with the CAUTION header that positioned clauses order. */
const HEADED: readonly Surface[] = ["prompt", "workflow"];
/** Surfaces checked inside the `bkit:start` / `bkit:end` block only. */
const MANAGED: readonly Surface[] = ["rules", "audit"];
const NOUN: Partial<Record<Surface, string>> = {
  prompt: "prompts",
  workflow: "workflows",
  audit: "audit templates",
};
const MODES: readonly Mode[] = [
  "required",
  "where-used",
  "repeatable",
  "forbidden",
  "if-verdict",
  "if-bash",
];
const POSITIONS: readonly Position[] = ["first", "header", "last"];
const VERDICT_END = "<!-- verdict:end -->";
const SLOT = /\{\{([A-Za-z][\w-]*)(\?)?\}\}/g;
const LABEL = /^\*\*[^*]+:\*\* /;
/** Structure, not sentences: headings, HTML comments, table rows. Never counted toward the cut-off. */
const STRUCTURE = /^(?:#{1,6} |<!--|\|)/;

// ---------------------------------------------------------------------------
// Wording file
// ---------------------------------------------------------------------------

/** Parse `.bkit/wording.md`: one `### name` section per clause under `## Clauses`. */
export function parseWording(md: string): Clause[] {
  const start = md.indexOf("\n## Clauses\n");
  if (start === -1) throw new Error("[bkit-wording] wording file has no `## Clauses` section");
  const clauses: Clause[] = [];
  for (const section of md.slice(start).split(/^### /m).slice(1)) {
    const name = section.slice(0, section.indexOf("\n")).trim();
    const clause: Clause = {
      name,
      texts: [],
      retired: [],
      modes: {},
      except: new Set(),
      anchored: false,
    };
    for (const m of section.matchAll(/^- ([a-z]+): (.+)$/gm)) {
      const [key, value] = [m[1]!, m[2]!.trim()];
      if ((SURFACES as readonly string[]).includes(key)) {
        if (!(MODES as readonly string[]).includes(value)) {
          throw new Error(`[bkit-wording] ${name}: unknown mode "${value}" for ${key}`);
        }
        clause.modes[key as Surface] = value as Mode;
      } else if (key === "except") {
        for (const f of value.split(",")) clause.except.add(f.trim());
      } else if (key === "position") {
        if (!(POSITIONS as readonly string[]).includes(value)) {
          throw new Error(`[bkit-wording] ${name}: position must be first, header, or last`);
        }
        clause.position = value as Position;
      } else if (key === "anchored") {
        clause.anchored = value === "yes";
      } else {
        throw new Error(`[bkit-wording] ${name}: unknown key "${key}"`);
      }
    }
    for (const m of section.matchAll(/^```(text|retired)\n([\s\S]*?)^```$/gm)) {
      const lines = m[2]!.split("\n").filter((l) => l.trim() !== "");
      if (m[1] === "text") clause.texts.push(...lines);
      else clause.retired.push(...lines);
    }
    if (clause.texts.length === 0) throw new Error(`[bkit-wording] ${name}: no text block`);
    if (Object.keys(clause.modes).length === 0) {
      throw new Error(`[bkit-wording] ${name}: applies to no surface`);
    }
    clauses.push(clause);
  }
  return clauses;
}

// ---------------------------------------------------------------------------
// Corpus
// ---------------------------------------------------------------------------

const RULES_FILES = [".bkit/templates/.agents/rules.md", ".agents/rules.md"];
/** Audit templates, then the repo's adopted copies (same basenames, same managed block). */
const AUDIT_DIRS = [".bkit/templates/docs/templates", "docs/templates"];
const AUDIT_FILE = /^bkit-audit-.+\.md$/;

/** Every file the wording file governs, read from `root`. */
export function loadCorpus(root: string): WordingFile[] {
  const files: WordingFile[] = [];
  for (const [surface, dir] of [
    ["prompt", ".bkit/prompts"],
    ["workflow", ".bkit/workflows"],
  ] as const) {
    for (const f of fs
      .readdirSync(path.join(root, dir))
      .filter((n) => n.endsWith(".md"))
      .sort()) {
      const id = path.join(dir, f);
      files.push({
        surface,
        id,
        name: f.slice(0, -3),
        content: fs.readFileSync(path.join(root, id), "utf-8"),
      });
    }
  }
  for (const dir of AUDIT_DIRS) {
    if (!fs.existsSync(path.join(root, dir))) continue;
    for (const f of fs
      .readdirSync(path.join(root, dir))
      .filter((n) => AUDIT_FILE.test(n))
      .sort()) {
      const id = path.join(dir, f);
      files.push({
        surface: "audit",
        id,
        name: f.slice(0, -3),
        content: fs.readFileSync(path.join(root, id), "utf-8"),
      });
    }
  }
  for (const id of RULES_FILES) {
    if (!fs.existsSync(path.join(root, id))) continue;
    files.push({
      surface: "rules",
      id,
      name: "rules",
      content: fs.readFileSync(path.join(root, id), "utf-8"),
    });
  }
  return files;
}

/**
 * Indexes of the lines that are prose the clauses govern. Prompts and workflows:
 * everything but front matter and fenced blocks (a fenced example is
 * documentation, not instruction). Rules and audit templates: only the
 * bkit-managed block — the consumer-owned part below `bkit:end` is never bkit's
 * to check or rewrite.
 */
export function proseLineIndexes(file: WordingFile): number[] {
  const lines = file.content.split("\n");
  let from = 0;
  let to = lines.length;
  if (MANAGED.includes(file.surface)) {
    const [startMarker, endMarker] = selectMarkers("html-comment");
    const starts = findLineAnchoredMarkers(file.content, startMarker);
    const ends = findLineAnchoredMarkers(file.content, endMarker);
    if (starts.length !== 1 || ends.length !== 1) return [];
    from = file.content.slice(0, starts[0]).split("\n").length;
    to = file.content.slice(0, ends[0]).split("\n").length - 1;
  } else if (lines[0] === "---") {
    const close = lines.indexOf("---", 1);
    if (close !== -1) from = close + 1;
  }
  const out: number[] = [];
  let fence: string | null = null;
  for (let i = from; i < to; i++) {
    const line = lines[i]!;
    if (fence !== null) {
      if (new RegExp(`^[ \\t]*${fence}[ \\t]*$`).test(line)) fence = null;
      continue;
    }
    const open = /^[ \t]*(`{3,})[\w-]*[ \t]*$/.exec(line);
    if (open) {
      fence = open[1]!;
      continue;
    }
    out.push(i);
  }
  return out;
}

/** Tool names in the front matter `tools:` list, inline (`[a, b]`) or block (`- a`) form. */
export function toolsOf(content: string): string[] {
  const lines = content.split("\n");
  if (lines[0] !== "---") return [];
  const close = lines.indexOf("---", 1);
  const front = lines.slice(1, close === -1 ? 1 : close);
  const at = front.findIndex((l) => /^tools:/.test(l));
  if (at === -1) return [];
  const inline = /^tools:[ \t]*\[(.*)\][ \t]*$/.exec(front[at]!);
  if (inline) {
    return inline[1]!
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  const tools: string[] = [];
  for (const line of front.slice(at + 1)) {
    if (/^\S/.test(line)) break;
    const item = /^[ \t]+-[ \t]+(\S+)/.exec(line);
    if (item) tools.push(item[1]!);
  }
  return tools;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface Compiled {
  re: RegExp;
  slots: string[];
  /** Fixed text before the first slot; the whole text when unslotted. */
  prefix: string;
  slotted: boolean;
}

const compiledCache = new Map<string, Compiled>();

export function compileText(text: string): Compiled {
  const hit = compiledCache.get(text);
  if (hit) return hit;
  const slots: string[] = [];
  let source = "";
  let last = 0;
  for (const m of text.matchAll(SLOT)) {
    source += escapeRe(text.slice(last, m.index));
    source += m[2] ? "(.*?)" : "(.+?)";
    slots.push(m[1]!);
    last = m.index! + m[0].length;
  }
  const tail = text.slice(last);
  // A closing `.` also matches `;`: the line continues the sentence with local text.
  source += tail.endsWith(".") ? `${escapeRe(tail.slice(0, -1))}[.;]` : escapeRe(tail);
  const first = text.search(SLOT);
  const compiled = {
    re: new RegExp(source, "g"),
    slots,
    prefix: first === -1 ? text : text.slice(0, first),
    slotted: slots.length > 0,
  };
  compiledCache.set(text, compiled);
  return compiled;
}

const countIn = (line: string, c: Compiled) => [...line.matchAll(c.re)].length;

/** Drop the blockquote, list marker, step number, or checkbox in front of a line's text. */
export const stripLinePrefix = (line: string) =>
  line.replace(/^[ \t]*(?:>[ \t]?)?(?:[ \t]*(?:[-*]|\d+\.)[ \t]+)?(?:\[[ xX]\][ \t]+)?/, "");

/** Split after `.` or `;` (bold close allowed between), never after `e.g.`; the punctuation stays on the sentence. */
export const splitSentences = (s: string) =>
  s
    .split(/(?<!\be\.g\.)(?<=[.;]\**)\s+(?=\S)/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Word-level Levenshtein similarity in [0, 1]. */
export function similarity(a: string, b: string): number {
  const x = a.split(/\s+/);
  const y = b.split(/\s+/);
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) {
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (x[i - 1] === y[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return 1 - prev[y.length]! / Math.max(x.length, y.length);
}

function modeFor(clause: Clause, file: WordingFile): Mode | undefined {
  if (clause.except.has(file.name)) return undefined;
  const mode = clause.modes[file.surface];
  if (mode === "if-verdict") return file.content.includes(VERDICT_END) ? "required" : "forbidden";
  if (mode === "if-bash") return toolsOf(file.content).includes("Bash") ? "required" : "forbidden";
  return mode;
}

interface NearCopy {
  line: number;
  found: string;
  canonical: string;
}

const siblingCache = new WeakMap<Set<string>, Map<string, string[]>>();
const lineCache = new Map<string, { sentences: string[]; words: Map<string, number> }>();

const wordCounts = (words: string[]) => {
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return counts;
};

const canonicalCache = new Map<
  string,
  { sentences: number; words: string[]; counts: Map<string, number> }
>();

/** A clause wording's sentence count, words, and word counts; memoised like `lineParts`. */
function canonicalParts(canonical: string) {
  let hit = canonicalCache.get(canonical);
  if (!hit) {
    const words = canonical.split(/\s+/);
    hit = { sentences: splitSentences(canonical).length, words, counts: wordCounts(words) };
    canonicalCache.set(canonical, hit);
  }
  return hit;
}

/** A line's sentences and word counts, prefix dropped; memoised, since every clause scans every line. */
function lineParts(line: string) {
  let hit = lineCache.get(line);
  if (!hit) {
    if (lineCache.size > 50_000) lineCache.clear();
    const rest = stripLinePrefix(line);
    hit = { sentences: splitSentences(rest), words: wordCounts(rest.split(/\s+/)) };
    lineCache.set(line, hit);
  }
  return hit;
}

/** Other unslotted clause wordings near enough to `canonical` to read as its near-copy. */
function siblingsOf(canonical: string, allTexts: Set<string>): string[] {
  let byText = siblingCache.get(allTexts);
  if (!byText) {
    byText = new Map();
    siblingCache.set(allTexts, byText);
  }
  let hit = byText.get(canonical);
  if (!hit) {
    hit = [...allTexts].filter(
      (t) => t !== canonical && !compileText(t).slotted && similarity(t, canonical) >= NEAR_COPY,
    );
    byText.set(canonical, hit);
  }
  return hit;
}

/** Sentence windows in a line that are near, but not equal to, an unslotted clause wording. */
function nearCopies(
  clause: Clause,
  lineIdx: number,
  line: string,
  allTexts: Set<string>,
): NearCopy[] {
  if (clause.texts.some((t) => countIn(line, compileText(t)) > 0)) return [];
  const { sentences, words: lineWords } = lineParts(line);
  const out: NearCopy[] = [];
  for (const canonical of clause.texts) {
    if (compileText(canonical).slotted) continue;
    // A line carrying a sibling clause verbatim (`Gate 2` beside `Gate 3`) is that clause, not drift of this one.
    if (siblingsOf(canonical, allTexts).some((t) => countIn(line, compileText(t)) > 0)) continue;
    const { sentences: k, words: canonicalWords, counts } = canonicalParts(canonical);
    const cw = canonicalWords.length;
    // Every window is drawn from the line's words: too few of the clause's words anywhere → no near-copy.
    let shared = 0;
    for (const [w, n] of counts) shared += Math.min(n, lineWords.get(w) ?? 0);
    if (shared < Math.ceil(NEAR_COPY * cw)) continue;
    // A drift can add or drop a sentence break (`;` turned into `,`): try one sentence fewer and more.
    for (let i = 0; i < sentences.length;) {
      let best: { found: string; size: number; score: number } | undefined;
      for (let size = Math.max(1, k - 1); size <= k + 1 && i + size <= sentences.length; size++) {
        let window = sentences.slice(i, i + size).join(" ");
        // An unlabelled clause can sit behind any surface's own label
        // (`**Tools:**` in a prompt, `**Verify tools:**` in rules): compare the text only.
        if (!canonical.startsWith("**")) window = window.replace(LABEL, "");
        // A clause can close a sentence that opens with local text (`**If** {cond} → {clause}`): also compare the tail.
        const words = window.split(/\s+/);
        const candidates = [window];
        for (const n of [cw - 1, cw, cw + 1]) {
          if (n > 0 && n < words.length) candidates.push(words.slice(-n).join(" "));
        }
        for (const found of candidates) {
          if (allTexts.has(found) || !nearCandidate(found.split(/\s+/), canonicalWords)) continue;
          const score = similarity(found, canonical);
          if (score >= NEAR_COPY && (!best || score > best.score)) best = { found, size, score };
        }
      }
      if (!best) {
        i++;
        continue;
      }
      out.push({ line: lineIdx, found: best.found, canonical });
      i += best.size;
    }
  }
  return out;
}

/** Header line indexes in file order: the CAUTION block through to the body. */
export function headerLines(content: string): number[] {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.startsWith("> [!CAUTION]"));
  if (start === -1) return [];
  const out: number[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    if (line === "---" || /^\*\*/.test(line)) break;
    out.push(i);
  }
  return out;
}

/** Labelled header lines in file order, EXECUTION PROTOCOL excluded. */
export function headerLabels(content: string): string[] {
  const lines = content.split("\n");
  return headerLines(content)
    .map((i) => lines[i]!.match(/^> (?:- )?\*\*([^*]+):\*\*/)?.[1])
    .filter((l): l is string => l !== undefined && l !== "EXECUTION PROTOCOL");
}

// ---------------------------------------------------------------------------
// Check
// ---------------------------------------------------------------------------

export function checkWording(clauses: Clause[], files: WordingFile[]): Finding[] {
  const findings: Finding[] = [];
  const allTexts = new Set(clauses.flatMap((c) => c.texts));
  const compiled = new Map(clauses.map((c) => [c, c.texts.map(compileText)]));

  for (const file of files) {
    const lines = file.content.split("\n");
    const prose = proseLineIndexes(file);
    const headed = HEADED.includes(file.surface);
    const labels = headed ? headerLabels(file.content) : [];
    const header = new Set(headed ? headerLines(file.content) : []);
    const positioned: { clause: Clause; line: number }[] = [];
    const at = (i: number | undefined) => (i === undefined ? undefined : i + 1);
    for (const clause of clauses) {
      const mode = modeFor(clause, file);
      if (mode === undefined) continue;
      const forms = compiled.get(clause)!;
      // Forms can overlap (a slotted form may also fit another's line): a line counts once per instance.
      const perLine = (i: number) => Math.max(...forms.map((c) => countIn(lines[i]!, c)));
      const hits = prose.filter((i) => perLine(i) > 0);
      const count = hits.reduce((n, i) => n + perLine(i), 0);
      if (mode === "forbidden" && count > 0) {
        findings.push({
          file: file.id,
          line: at(hits[0]),
          clause: clause.name,
          problem: "present where it must not be",
        });
      }
      if (mode === "required" && count === 0) {
        findings.push({
          file: file.id,
          clause: clause.name,
          problem: `missing; add: ${clause.texts[0]}`,
        });
      }
      if ((mode === "required" || mode === "where-used") && count > 1) {
        findings.push({
          file: file.id,
          line: at(hits[1]),
          clause: clause.name,
          problem: `appears ${count} times; expected once`,
        });
      }
      if (mode === "forbidden") continue;

      for (const i of prose) {
        const line = lines[i]!;
        for (const near of nearCopies(clause, i, line, allTexts)) {
          findings.push({
            file: file.id,
            line: near.line + 1,
            clause: clause.name,
            problem: `near-copy (run pnpm wording:sync): "${near.found}"`,
          });
        }
        for (const old of clause.retired) {
          if (countIn(line, compileText(old)) > 0) {
            findings.push({
              file: file.id,
              line: i + 1,
              clause: clause.name,
              problem: "retired wording (run pnpm wording:sync)",
            });
          }
        }
        if (
          clause.anchored &&
          forms.some((c) => c.slotted && line.includes(c.prefix)) &&
          perLine(i) === 0
        ) {
          const templates = clause.texts.filter((t) => compileText(t).slotted);
          findings.push({
            file: file.id,
            line: i + 1,
            clause: clause.name,
            problem: `does not match the template${templates.length > 1 ? "s" : ""}: ${templates.join(" | ")}`,
          });
        }
      }

      if (clause.position && count > 0 && headed) {
        positioned.push({ clause, line: hits[0]! });
        const label = clause.texts[0]!.match(/^\*\*([^*]+):\*\*/)?.[1];
        const edge = clause.position === "first" ? labels[0] : labels[labels.length - 1];
        if (clause.position !== "header" && label && edge !== label) {
          findings.push({
            file: file.id,
            clause: clause.name,
            problem: `must be the ${clause.position} labelled header line; found "${edge ?? "none"}"`,
          });
        }
      }
    }

    // Positioned clauses keep wording-file order inside the header.
    let prev: { clause: Clause; line: number } | undefined;
    for (const p of positioned) {
      if (!header.has(p.line)) {
        findings.push({
          file: file.id,
          line: at(p.line),
          clause: p.clause.name,
          problem: "must be a header line",
        });
        continue;
      }
      if (prev && p.line < prev.line) {
        findings.push({
          file: file.id,
          line: at(p.line),
          clause: p.clause.name,
          problem: `header order: must come after ${prev.clause.name}`,
        });
      }
      prev = p;
    }
  }
  return findings.concat(unlistedShared(clauses, files));
}

/** Could two sentences be NEAR_COPY-similar? Cheap word-count and shared-word bounds before `similarity`. */
function nearCandidate(a: string[], b: string[]): boolean {
  const longer = Math.max(a.length, b.length);
  const need = Math.ceil(NEAR_COPY * longer);
  if (Math.min(a.length, b.length) < need) return false;
  const pool = new Map<string, number>();
  for (const w of b) pool.set(w, (pool.get(w) ?? 0) + 1);
  let shared = 0;
  for (const w of a) {
    const n = pool.get(w) ?? 0;
    if (n > 0) {
      shared++;
      pool.set(w, n - 1);
    }
  }
  return shared >= need;
}

/**
 * Sentences shared by a surface's SHARED_MIN or more files that no clause covers.
 * The cut-off is the rule for what belongs in the wording file. Files count by
 * basename, so an adopted copy never counts twice. Headings, HTML comments, and
 * table rows are structure and never count. A sentence ending its line and
 * the same sentence continued with `;` count as one. Near-copies count toward the
 * cut-off, so one drifted copy cannot hide a sentence the other files share.
 */
export function unlistedShared(clauses: Clause[], files: WordingFile[]): Finding[] {
  const forms = clauses.flatMap((c) => c.texts.map(compileText));
  const findings: Finding[] = [];
  for (const surface of SURFACES) {
    const min = SHARED_MIN[surface];
    if (min === undefined) continue;
    const seen = new Map<string, Map<string, string>>();
    for (const file of files.filter((f) => f.surface === surface)) {
      const lines = file.content.split("\n");
      for (const i of proseLineIndexes(file)) {
        let rest = stripLinePrefix(lines[i]!);
        if (STRUCTURE.test(rest)) continue;
        for (const c of forms) rest = rest.replace(c.re, "\u0000");
        for (const sentence of splitSentences(rest)) {
          const s = sentence.replace(/[.;]$/, "");
          if (s.includes("\u0000") || s.split(/\s+/).length < 3) continue;
          if (!seen.has(s)) seen.set(s, new Map());
          if (!seen.get(s)!.has(file.name)) seen.get(s)!.set(file.name, file.id);
        }
      }
    }
    findings.push(...sharedGroups(seen, min, NOUN[surface]!));
  }
  return findings;
}

/** Group each sentence with its near-copies; report every group reaching `min` files. */
function sharedGroups(
  seen: Map<string, Map<string, string>>,
  min: number,
  noun: string,
): Finding[] {
  const words = new Map([...seen.keys()].map((s) => [s, s.split(/\s+/)]));
  const reported = new Set<string>();
  const findings: Finding[] = [];
  // Seeds: sentences in 2+ files, widest first, so a group is reported once under its most-copied wording.
  const seeds = [...seen].filter(([, ids]) => ids.size >= 2).sort((a, b) => b[1].size - a[1].size);
  for (const [seed, ids] of seeds) {
    if (reported.has(seed)) continue;
    const near = [...seen.keys()].filter(
      (s) =>
        s !== seed &&
        !reported.has(s) &&
        nearCandidate(words.get(seed)!, words.get(s)!) &&
        similarity(seed, s) >= NEAR_COPY,
    );
    const group = new Set([...ids.keys(), ...near.flatMap((s) => [...seen.get(s)!.keys()])]);
    if (group.size < min) continue;
    for (const s of [seed, ...near]) reported.add(s);
    const drifted = near.length > 0 ? `, ${group.size - ids.size} as near-copies` : "";
    findings.push({
      file: [...ids.values()][0]!,
      clause: "(none)",
      problem: `shared by ${group.size} ${noun}${drifted} but not in .bkit/wording.md: "${seed}"`,
    });
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

/** Rewrite near-copies and retired wordings in place. Returns only the files that changed. */
export function syncWording(clauses: Clause[], files: WordingFile[]): Map<string, string> {
  const changed = new Map<string, string>();
  const allTexts = new Set(clauses.flatMap((c) => c.texts));
  for (const file of files) {
    const lines = file.content.split("\n");
    for (const i of proseLineIndexes(file)) {
      for (const clause of clauses) {
        if (modeFor(clause, file) === undefined || modeFor(clause, file) === "forbidden") continue;
        const target = compileText(clause.texts[0]!);
        for (const old of clause.retired) {
          const from = compileText(old);
          lines[i] = lines[i]!.replace(from.re, (...groups) => {
            const bySlot = new Map(from.slots.map((s, n) => [s, String(groups[n + 1])]));
            const out = clause.texts[0]!.replace(SLOT, (_, slot: string) => bySlot.get(slot) ?? "");
            return String(groups[0]).endsWith(";") && out.endsWith(".")
              ? `${out.slice(0, -1)};`
              : out;
          });
        }
        if (target.slotted) continue;
        for (const near of nearCopies(clause, i, lines[i]!, allTexts)) {
          lines[i] = lines[i]!.replace(near.found, near.canonical);
        }
      }
    }
    const content = lines.join("\n");
    if (content !== file.content) changed.set(file.id, content);
  }
  return changed;
}

// ---------------------------------------------------------------------------
// CLI: `pnpm wording:sync` (write) / `tsx .bkit/core/engine/tools/wording.ts` (check)
// ---------------------------------------------------------------------------

function main(argv: string[]): number {
  const root = process.cwd();
  const clauses = parseWording(fs.readFileSync(path.join(root, ".bkit/wording.md"), "utf-8"));
  let files = loadCorpus(root);
  if (argv.includes("--write")) {
    const changed = syncWording(clauses, files);
    for (const [id, content] of changed) {
      fs.writeFileSync(path.join(root, id), content, "utf-8");
      console.error(`[bkit-wording] rewrote ${id}`);
    }
    files = loadCorpus(root);
  }
  const findings = checkWording(clauses, files);
  for (const f of findings) {
    console.error(
      `[bkit-wording] ${f.file}${f.line ? `:${f.line}` : ""} ${f.clause}: ${f.problem}`,
    );
  }
  return findings.length === 0 ? 0 : 1;
}

if (process.argv[1] && fs.existsSync(process.argv[1])) {
  if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
    process.exitCode = main(process.argv.slice(2));
  }
}
