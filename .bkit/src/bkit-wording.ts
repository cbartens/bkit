// bkit-wording.ts — check and sync the shared sentences in `.bkit/wording.md`.
//
// Check mode runs in the test suite (`bkit-wording.test.ts`); write mode is
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

import { findLineAnchoredMarkers, selectMarkers } from "./bkit-markers.js";

export type Surface = "prompt" | "workflow" | "rules";
export type Mode = "required" | "where-used" | "forbidden" | "if-verdict";

export interface Clause {
  name: string;
  /** Canonical wordings; more than one = exactly one of them is used. */
  texts: string[];
  /** Earlier wordings: never valid, and sync rewrites them to `texts[0]`. */
  retired: string[];
  modes: Partial<Record<Surface, Mode>>;
  /** File basenames (no `.md`) that word this clause differently. */
  except: Set<string>;
  /** Header-line position contract for prompts and workflows. */
  position?: "first" | "last";
  /** Slotted clause only: a line holding the fixed text before the first slot must match the whole template. */
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
/** Cut-off: a sentence shared by this many prompts belongs in the wording file. */
export const SHARED_MIN = 5;

const SURFACES: readonly Surface[] = ["prompt", "workflow", "rules"];
const MODES: readonly Mode[] = ["required", "where-used", "forbidden", "if-verdict"];
const VERDICT_END = "<!-- verdict:end -->";
const SLOT = /\{\{([A-Za-z][\w-]*)(\?)?\}\}/g;
const LABEL = /^\*\*[^*]+:\*\* /;

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
        if (value !== "first" && value !== "last") {
          throw new Error(`[bkit-wording] ${name}: position must be first or last`);
        }
        clause.position = value;
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
 * documentation, not instruction). Rules: only the bkit-managed block — the
 * consumer-owned part below `bkit:end` is never bkit's to check or rewrite.
 */
export function proseLineIndexes(file: WordingFile): number[] {
  const lines = file.content.split("\n");
  let from = 0;
  let to = lines.length;
  if (file.surface === "rules") {
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
  source += escapeRe(text.slice(last));
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

/** Drop the blockquote, list marker, or step number in front of a line's text. */
export const stripLinePrefix = (line: string) =>
  line.replace(/^[ \t]*(?:>[ \t]?)?(?:[ \t]*(?:[-*]|\d+\.)[ \t]+)?/, "");

export const splitSentences = (s: string) =>
  s
    .split(/(?<!\be\.g\.)(?<=\.\**)\s+(?=\S)/)
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
  if (mode !== "if-verdict") return mode;
  return file.content.includes(VERDICT_END) ? "required" : "forbidden";
}

interface NearCopy {
  line: number;
  found: string;
  canonical: string;
}

/** Sentence windows in a line that are near, but not equal to, an unslotted clause wording. */
function nearCopies(
  clause: Clause,
  lineIdx: number,
  line: string,
  allTexts: Set<string>,
): NearCopy[] {
  if (clause.texts.some((t) => line.includes(t))) return [];
  const sentences = splitSentences(stripLinePrefix(line));
  const out: NearCopy[] = [];
  for (const canonical of clause.texts) {
    if (compileText(canonical).slotted) continue;
    const k = splitSentences(canonical).length;
    for (let i = 0; i + k <= sentences.length; i++) {
      let found = sentences.slice(i, i + k).join(" ");
      // An unlabelled clause can sit behind any surface's own label
      // (`**Tools:**` in a prompt, `**Verify tools:**` in rules): compare the text only.
      if (!canonical.startsWith("**")) found = found.replace(LABEL, "");
      if (allTexts.has(found)) continue;
      if (similarity(found, canonical) >= NEAR_COPY) out.push({ line: lineIdx, found, canonical });
    }
  }
  return out;
}

/** Labelled header lines in file order: the CAUTION block through to the body. */
export function headerLabels(content: string): string[] {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.startsWith("> [!CAUTION]"));
  if (start === -1) return [];
  const labels: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    if (line === "---" || /^\*\*/.test(line)) break;
    const label = line.match(/^> (?:- )?\*\*([^*]+):\*\*/)?.[1];
    if (label && label !== "EXECUTION PROTOCOL") labels.push(label);
  }
  return labels;
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
    const labels = file.surface === "rules" ? [] : headerLabels(file.content);
    for (const clause of clauses) {
      const mode = modeFor(clause, file);
      if (mode === undefined) continue;
      const forms = compiled.get(clause)!;
      const hits = prose.filter((i) => forms.some((c) => countIn(lines[i]!, c) > 0));
      const count = prose.reduce(
        (n, i) => n + forms.reduce((m, c) => m + countIn(lines[i]!, c), 0),
        0,
      );
      const at = (i: number | undefined) => (i === undefined ? undefined : i + 1);
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
      if (mode !== "forbidden" && count > 1) {
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
        if (clause.anchored) {
          for (const c of forms) {
            if (c.slotted && line.includes(c.prefix) && countIn(line, c) === 0) {
              findings.push({
                file: file.id,
                line: i + 1,
                clause: clause.name,
                problem: `does not match the template: ${clause.texts[0]}`,
              });
            }
          }
        }
      }

      if (clause.position && count > 0 && file.surface !== "rules") {
        const label = clause.texts[0]!.match(/^\*\*([^*]+):\*\*/)?.[1];
        const want = clause.position === "first" ? labels[0] : labels[labels.length - 1];
        if (label && want !== label) {
          findings.push({
            file: file.id,
            clause: clause.name,
            problem: `must be the ${clause.position} labelled header line; found "${want ?? "none"}"`,
          });
        }
      }
    }
  }
  return findings.concat(unlistedShared(clauses, files));
}

/**
 * Sentences shared by SHARED_MIN or more prompts that no clause covers. The cut-off
 * is the rule for what belongs in the wording file.
 */
export function unlistedShared(clauses: Clause[], files: WordingFile[]): Finding[] {
  const forms = clauses.flatMap((c) => c.texts.map(compileText));
  const seen = new Map<string, Set<string>>();
  for (const file of files.filter((f) => f.surface === "prompt")) {
    const lines = file.content.split("\n");
    for (const i of proseLineIndexes(file)) {
      let rest = stripLinePrefix(lines[i]!);
      for (const c of forms) rest = rest.replace(c.re, "\u0000");
      for (const s of splitSentences(rest)) {
        if (s.includes("\u0000") || s.split(/\s+/).length < 3) continue;
        if (!seen.has(s)) seen.set(s, new Set());
        seen.get(s)!.add(file.id);
      }
    }
  }
  return [...seen]
    .filter(([, ids]) => ids.size >= SHARED_MIN)
    .map(([s, ids]) => ({
      file: [...ids][0]!,
      clause: "(none)",
      problem: `shared by ${ids.size} prompts but not in .bkit/wording.md: "${s}"`,
    }));
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
            return clause.texts[0]!.replace(SLOT, (_, slot: string) => bySlot.get(slot) ?? "");
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
// CLI: `pnpm wording:sync` (write) / `tsx .bkit/src/bkit-wording.ts` (check)
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
