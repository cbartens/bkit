// tools/instructions-sources.ts — the sections of `.bkit/instructions.md` that copy a
// master elsewhere, read from that master and compared with the store.
//
// Masters: `## Rules` ← the `bkit:start` / `bkit:end` block of `.bkit/core/.agents/rules.md`;
// `## Project Rules` ← `## Project Rules` of `.agents/rules.md`; `## Hook Text` ← the
// messages built in `HOOK_SOURCES`; `## Permissions` ← the shipped Claude settings and
// opencode config; `## Special Behaviors` and `## Authoring Rules` ← `CATALOG_SOURCES`.
// Check mode runs in `tools/instructions-sources.test.ts`; `pnpm instructions:sync`
// rewrites the rule text and catalog copies. Hook text and permissions are fixed by hand.

import * as fs from "node:fs";
import * as path from "node:path";

/** One `## {heading}` section of a markdown file, heading line excluded, up to the next `## `. */
export function sectionOf(md: string, heading: string): string | undefined {
  const m = new RegExp(`(?:^|\\n)## ${escapeRe(heading)}\\n`).exec(md);
  if (!m) return undefined;
  const rest = md.slice(m.index + m[0].length);
  const end = rest.search(/^## /m);
  return end === -1 ? rest : rest.slice(0, end);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface RuleRef {
  path: string;
  section?: string;
}

export interface Carrier {
  /** `workflow`, `prompt`, `repo-agent`, `audit`, `plan-template`, `entry`, `hook` or `permission`. */
  surface: string;
  /** `verbatim`, `condensed`, `partial`, `specialised`, `applies` or `cites`. */
  relation: string;
  /** As written: `all`, `all except …`, or backticked names and `prefix-*` families. */
  names: string;
}

export interface DriftItem {
  /** The item line as written, `  - ` dropped. */
  raw: string;
  cites: { name: string; line: number }[];
  /** The quoted excerpt the cited lines hold. */
  excerpt?: string;
  /** Why the drift stays, from a `- kept:` line under the item. */
  kept?: string;
}

export interface RuleEntry {
  /** The `### {name}` heading: the rule's ID, unique across `## Rules` and `## Project Rules`. */
  name: string;
  text: string;
  retired: string[];
  refs: RuleRef[];
  /** `## Clauses` entry carrying the rule's text. */
  clause?: string;
  carriers: Carrier[];
  drift: DriftItem[];
  /** Entries reviewed as distinct despite reading alike. */
  distinctFrom: string[];
  /** Prompts that copy the whole rule bullet, as written (`all`, `all except …`, names). */
  carry?: string;
}

export const CARRIER_SURFACES = [
  "workflow",
  "prompt",
  "repo-agent",
  "audit",
  "plan-template",
  "entry",
  "hook",
  "permission",
];

/** A rule's `### {name}`, which tags, clause `- rule:` / `- tags:` lines and prose cite it by. */
export const RULE_NAME = /^[a-z0-9][a-z0-9-]*/;

const CITES = /^((?:`[^`:]+:\d+`(?:, )?)+): ?(.*)$/;

/** One drift item line (`  - ` dropped) with its `kept` reason. */
export function parseDriftItem(raw: string, kept?: string): DriftItem {
  const m = CITES.exec(raw);
  const cites = m
    ? [...m[1]!.matchAll(/`([^`:]+):(\d+)`/g)].map((c) => ({ name: c[1]!, line: Number(c[2]) }))
    : [];
  const excerpt = m ? /"([^"]+)"/.exec(m[2]!)?.[1] : undefined;
  return {
    raw,
    cites,
    ...(excerpt === undefined ? {} : { excerpt }),
    ...(kept === undefined ? {} : { kept }),
  };
}

/** `- {key}:` lines of an entry, each with the lines indented under it. */
export function entryKeys(section: string): { key: string; value: string; children: string[] }[] {
  const out: { key: string; value: string; children: string[] }[] = [];
  let inBlock = false;
  for (const line of section.split("\n")) {
    if (/^`{3,}/.test(line)) inBlock = !inBlock;
    if (inBlock) continue;
    const top = /^- ([a-z-]+):(?: (.*))?$/.exec(line);
    if (top) out.push({ key: top[1]!, value: top[2] ?? "", children: [] });
    else if (/^ {2,}- /.test(line) && out.length > 0) out[out.length - 1]!.children.push(line);
    else if (line.trim() === "") continue;
    else if (!/^ {2,}/.test(line)) out.push({ key: "", value: line, children: [] });
  }
  return out;
}

/** The two rule masters: the bkit-block template and the repo's own rules file. */
export interface RuleMasters {
  bkit: string;
  project: string;
}

const RULE_SECTIONS = [
  { heading: "Rules", region: "bkit" },
  { heading: "Project Rules", region: "project" },
] as const;

/** Top-level `- ` bullets of the bkit block, or of `## Project Rules` below `bkit:end`, in file order. */
export function ruleBullets(rulesMd: string, region: "bkit" | "project"): string[] {
  const start = rulesMd.indexOf("<!-- bkit:start -->");
  const end = rulesMd.indexOf("<!-- bkit:end -->");
  let body: string;
  if (region === "bkit") {
    body = start === -1 || end === -1 ? "" : rulesMd.slice(start, end);
  } else {
    body = sectionOf(end === -1 ? rulesMd : rulesMd.slice(end), "Project Rules") ?? "";
  }
  return body
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));
}

/** One entry per `### {name}` of `## {heading}` in the store. */
export function parseRuleEntries(md: string, heading: "Rules" | "Project Rules"): RuleEntry[] {
  const body = sectionOf(md, heading);
  if (body === undefined) throw new Error(`[bkit-instructions] no \`## ${heading}\` section`);
  return body
    .split(/^### /m)
    .slice(1)
    .map((section) => {
      const name = section.slice(0, section.indexOf("\n")).trim();
      const block = (kind: string) =>
        [...section.matchAll(new RegExp(`^\`\`\`${kind}\\n([\\s\\S]*?)^\`\`\`$`, "gm"))].flatMap(
          (m) => m[1]!.split("\n").filter((l) => l.trim() !== ""),
        );
      const refs: RuleRef[] = [];
      const refsAt = section.search(/^- refs:$/m);
      if (refsAt !== -1) {
        for (const line of section.slice(refsAt).split("\n").slice(1)) {
          const m = /^ {2}- `([^`]+)`(?: § (.+))?$/.exec(line);
          if (!m) break;
          refs.push(m[2] === undefined ? { path: m[1]! } : { path: m[1]!, section: m[2] });
        }
      }
      const carriers: Carrier[] = [];
      const drift: DriftItem[] = [];
      let clause: string | undefined;
      let carry: string | undefined;
      const distinctFrom: string[] = [];
      for (const k of entryKeys(section)) {
        if (CARRIER_SURFACES.includes(k.key)) {
          for (const c of k.children) {
            const m = /^ {2}- ([a-z]+): (.+)$/.exec(c);
            if (m) carriers.push({ surface: k.key, relation: m[1]!, names: m[2]! });
          }
        } else if (k.key === "drift") {
          for (let i = 0; i < k.children.length; i++) {
            const item = /^ {2}- (.+)$/.exec(k.children[i]!);
            if (!item) continue;
            const kept = /^ {4}- kept: (.+)$/.exec(k.children[i + 1] ?? "")?.[1];
            drift.push(parseDriftItem(item[1]!, kept));
          }
        } else if (k.key === "clause") {
          clause = /`([^`]+)`/.exec(k.value)?.[1];
        } else if (k.key === "carry") {
          carry = k.value;
        } else if (k.key === "distinct-from") {
          distinctFrom.push(...[...k.value.matchAll(/`([^`]+)`/g)].map((m) => m[1]!));
        }
      }
      return {
        name,
        text: block("text").join("\n"),
        retired: block("retired"),
        refs,
        ...(clause === undefined ? {} : { clause }),
        carriers,
        drift,
        distinctFrom,
        ...(carry === undefined ? {} : { carry }),
      };
    });
}

const globRe = (base: string) =>
  new RegExp(`^${base.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

/** Repo files a ref path names; a `*` in the basename matches any characters. */
function refFiles(root: string, ref: string): string[] {
  const abs = path.join(root, ref);
  if (!ref.includes("*")) return fs.existsSync(abs) ? [abs] : [];
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) return [];
  const re = globRe(path.basename(abs));
  return fs
    .readdirSync(dir)
    .filter((f) => re.test(f))
    .map((f) => path.join(dir, f));
}

/** True when `ref` names a repo file (or glob) and, with `section`, one of its files has that heading. */
export function refExists(root: string, ref: string, section?: string): boolean {
  const files = refFiles(root, ref);
  if (files.length === 0) return false;
  if (section === undefined) return true;
  const heading = new RegExp(`^#{1,6} ${escapeRe(section)}$`, "m");
  return files.some((f) => fs.statSync(f).isFile() && heading.test(fs.readFileSync(f, "utf-8")));
}

/** Findings for `## Rules` and `## Project Rules` against their masters. */
export function checkRules(
  store: string,
  masters: RuleMasters,
  exists: (ref: string, section?: string) => boolean,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of RULE_SECTIONS) {
    const entries = parseRuleEntries(store, s.heading);
    const bullets = ruleBullets(masters[s.region], s.region);
    const n = Math.max(entries.length, bullets.length);
    for (let i = 0; i < n; i++) {
      const e = entries[i];
      const bullet = bullets[i];
      if (!e) {
        out.push(`${s.heading} bullet ${i + 1} of rules.md has no entry — ${bullet}`);
        continue;
      }
      const tag = `\`${e.name}\``;
      if (RULE_NAME.exec(e.name)?.[0] !== e.name) out.push(`${tag}: name must be kebab-case`);
      if (seen.has(e.name)) out.push(`${tag}: name used by another rule; names are rule IDs`);
      seen.add(e.name);
      if (bullet === undefined) {
        out.push(`${tag}: no rules.md bullet at position ${i + 1}`);
        continue;
      }
      if (e.text !== bullet)
        out.push(`${tag}: text differs from rules.md — run pnpm instructions:sync`);
      for (const r of e.refs) {
        if (!exists(r.path, r.section)) {
          out.push(`${tag}: ref \`${r.path}\`${r.section ? ` § ${r.section}` : ""} does not exist`);
        }
      }
    }
  }
  return out;
}

/**
 * Copy each changed rules.md bullet into its entry's `text` block and move the old text
 * to the front of its `retired` block. Entries are matched by position; a deleted or
 * added bullet is fixed by hand.
 */
export function syncRules(store: string, masters: RuleMasters): string {
  const lines = store.split("\n");
  for (const s of RULE_SECTIONS) {
    const bullets = ruleBullets(masters[s.region], s.region);
    const head = lines.indexOf(`## ${s.heading}`);
    if (head === -1) continue;
    let entry = -1;
    for (let i = head + 1; i < lines.length && !lines[i]!.startsWith("## "); i++) {
      if (lines[i]!.startsWith("### ")) entry++;
      if (lines[i] !== "```text" || entry < 0) continue;
      const close = lines.indexOf("```", i + 1);
      const old = lines.slice(i + 1, close).join("\n");
      const bullet = bullets[entry];
      if (bullet === undefined || bullet === old) {
        i = close;
        continue;
      }
      lines.splice(i + 1, close - i - 1, bullet);
      const after = i + 2;
      let j = after + 1;
      while (j < lines.length && lines[j] === "") j++;
      if (lines[j] === "```retired") lines.splice(j + 1, 0, old);
      else lines.splice(after + 1, 0, "", "```retired", old, "```");
      i = after;
    }
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Hook Text ← `.bkit/core/hooks/*.js` and the per-host guardrails hooks
// ---------------------------------------------------------------------------

/** Hook files whose messages `## Hook Text` copies. */
export const HOOK_SOURCES = [
  ".bkit/core/hooks/gateguard-engine.js",
  ".bkit/core/hooks/guardrails-read.js",
  ".bkit/core/hooks/guardrails-shell.js",
  ".bkit/core/hooks/guardrails-tiers.js",
  ".bkit/core/hooks/readguard-engine.js",
  ".bkit/core/.claude/hooks/bkit-guardrails.cjs",
  ".bkit/core/.codex/hooks/bkit-guardrails.cjs",
  ".bkit/core/.cursor/hooks/bkit-guardrails.cjs",
  ".bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs",
];

export interface HookMessage {
  file: string;
  /** The enclosing `function {name}`. */
  fn: string;
  /** Cooked text; each interpolation kept as `${expr}`, its source spelling. */
  text: string;
  /** Literal parts, an interpolation between each pair. */
  parts: string[];
}

interface Literal {
  start: number;
  end: number;
  parts: string[];
  holes: string[];
}

const COOK: Record<string, string> = { n: "\n", t: "\t" };
const cook = (ch: string) => COOK[ch] ?? ch;

/** Index after the `${…}` expression opened at `i` (just past `${`), skipping nested strings. */
function skipExpr(src: string, i: number): number {
  let depth = 1;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "'" || c === '"' || c === "`") {
      i = readLiteral(src, i).end;
      continue;
    }
    if (c === "{") depth++;
    if (c === "}" && --depth === 0) return i + 1;
    i++;
  }
  return i;
}

function readLiteral(src: string, start: number): Literal {
  const q = src[start]!;
  const parts = [""];
  const holes: string[] = [];
  let i = start + 1;
  while (i < src.length && src[i] !== q) {
    const c = src[i]!;
    if (c === "\\") {
      parts[parts.length - 1] += cook(src[i + 1]!);
      i += 2;
    } else if (q === "`" && c === "$" && src[i + 1] === "{") {
      const end = skipExpr(src, i + 2);
      holes.push(src.slice(i + 2, end - 1));
      parts.push("");
      i = end;
    } else {
      parts[parts.length - 1] += c;
      i++;
    }
  }
  return { start, end: i + 1, parts, holes };
}

/** Every string literal of a JS source, comments and regex literals skipped. */
function literals(src: string): Literal[] {
  const out: Literal[] = [];
  let prev = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i === -1) break;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2) + 2;
      continue;
    }
    if (c === "/" && (prev === "" || "(,=:[!&|?{};+".includes(prev))) {
      i++;
      let inClass = false;
      while (i < src.length && (src[i] !== "/" || inClass)) {
        if (src[i] === "\\") i++;
        else if (src[i] === "[") inClass = true;
        else if (src[i] === "]") inClass = false;
        i++;
      }
      i++;
      prev = "/";
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      const lit = readLiteral(src, i);
      out.push(lit);
      i = lit.end;
      prev = c;
      continue;
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}

const MESSAGE_START = /^(?:\[bkit [A-Za-z]+\]|bkit (?:[A-Za-z]+ )?guardrails:|Blocked)/;

/**
 * Agent-facing messages of a hook file: literals joined by `+` into one string, kept when
 * the string opens with a bkit hook prefix (`[bkit GateGuard]`, `bkit … guardrails:`,
 * `Blocked`), is a `fix:` value, or is the argument right after a kept message (Cursor's
 * `agent_message`).
 */
export function hookMessages(src: string, file: string): HookMessage[] {
  const lits = literals(src);
  const fns = [...src.matchAll(/\bfunction\s+(\w+)\s*\(/g)].map((m) => ({
    at: m.index!,
    name: m[1]!,
  }));
  const out: HookMessage[] = [];
  let lastEnd = -1;
  for (let k = 0; k < lits.length; k++) {
    const group = [lits[k]!];
    while (k + 1 < lits.length && /^\s*\+\s*$/.test(src.slice(lits[k]!.end, lits[k + 1]!.start))) {
      group.push(lits[++k]!);
    }
    const parts = [""];
    const holes: string[] = [];
    for (const lit of group) {
      parts[parts.length - 1] += lit.parts[0];
      for (let h = 0; h < lit.holes.length; h++) {
        holes.push(lit.holes[h]!);
        parts.push(lit.parts[h + 1]!);
      }
    }
    const start = group[0]!.start;
    const isFix = /\bfix:\s*$/.test(src.slice(Math.max(0, start - 20), start));
    const isNextArg = lastEnd !== -1 && /^\s*,\s*$/.test(src.slice(lastEnd, start));
    if (!isFix && !isNextArg && !MESSAGE_START.test(parts[0]!)) continue;
    lastEnd = group[group.length - 1]!.end;
    const text = parts.map((p, h) => (h === 0 ? p : `\${${holes[h - 1]}}${p}`)).join("");
    const fn = fns.filter((f) => f.at < group[0]!.start).pop()?.name ?? "";
    out.push({ file, fn, text, parts });
  }
  return out;
}

const escapeLiteral = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** One `### ` entry of `## Hook Text`; `texts` = its text block split at blank lines. */
interface HookEntry {
  name: string;
  file: string;
  fn: string;
  texts: string[];
}

function parseHookEntries(md: string): HookEntry[] {
  const body = sectionOf(md, "Hook Text") ?? "";
  return body
    .split(/^### /m)
    .slice(1)
    .map((section) => {
      const name = section.slice(0, section.indexOf("\n")).trim();
      const src = /^- source: `([^`]+)` `([^`]+)`$/m.exec(section);
      const text = /^```text\n([\s\S]*?)\n```$/m.exec(section)?.[1] ?? "";
      return { name, file: src?.[1] ?? "", fn: src?.[2] ?? "", texts: text.split("\n\n") };
    });
}

/**
 * Findings for `## Hook Text` against the hook files (`file` → content), both ways: each
 * message matches one text of an entry with its file and function (`${…}` on either side
 * matches anything), and each entry text matches a message.
 */
export function checkHooks(store: string, sources: Map<string, string>): string[] {
  const out: string[] = [];
  const entries = parseHookEntries(store);
  for (const e of entries) {
    if (!e.file || !e.fn) out.push(`\`${e.name}\`: source must be \`{file}\` \`{function}\``);
  }
  const used = new Set<string>();
  for (const [file, src] of sources) {
    for (const m of hookMessages(src, file)) {
      const re = new RegExp(`^${m.parts.map(escapeLiteral).join("[\\s\\S]*")}$`);
      const hits = new Set<string>();
      for (const e of entries) {
        if (e.file !== file || e.fn !== m.fn) continue;
        e.texts.forEach((t, i) => {
          if (re.test(t)) {
            hits.add(t);
            used.add(`${e.name}\0${i}`);
          }
        });
      }
      if (hits.size === 0) {
        out.push(`${file} \`${m.fn}\`: no \`## Hook Text\` entry for ${JSON.stringify(m.text)}`);
      } else if (hits.size > 1) {
        out.push(
          `${file} \`${m.fn}\`: ${hits.size} different entry texts match ${JSON.stringify(m.text)}`,
        );
      }
    }
  }
  for (const e of entries) {
    if (!e.file || !e.fn) continue;
    e.texts.forEach((t, i) => {
      if (!used.has(`${e.name}\0${i}`)) {
        out.push(
          `\`${e.name}\`: no longer emitted by \`${e.file}\` \`${e.fn}\` — ${JSON.stringify(t)}`,
        );
      }
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Permissions ← `.bkit/shared/.claude/settings.json` and `.bkit/shared/.opencode/opencode.json`
// ---------------------------------------------------------------------------

const TIERS = ["deny", "ask", "allow"] as const;

/** Findings for `## Permissions` against the shipped Claude settings and opencode config. */
export function checkPermissions(
  store: string,
  settings: { permissions?: Partial<Record<(typeof TIERS)[number], string[]>> },
  opencode: { permission?: unknown },
): string[] {
  const out: string[] = [];
  const body = sectionOf(store, "Permissions") ?? "";
  const groupsOf = new Map<string, string[]>();
  const stored: Record<string, Map<string, string>> = {
    deny: new Map(),
    ask: new Map(),
    allow: new Map(),
  };
  let opencodeSeen = false;
  for (const section of body.split(/^### /m).slice(1)) {
    const name = section.slice(0, section.indexOf("\n")).trim();
    const tier = /^- tier: (.+)$/m.exec(section)?.[1] ?? "";
    if (tier === "opencode `permission`") {
      opencodeSeen = true;
      const json = /^```json\n([\s\S]*?)\n```$/m.exec(section)?.[1] ?? "null";
      if (JSON.stringify(JSON.parse(json)) !== JSON.stringify(opencode.permission ?? null)) {
        out.push(
          `\`${name}\`: differs from \`.bkit/shared/.opencode/opencode.json\` \`permission\``,
        );
      }
      continue;
    }
    if (!(TIERS as readonly string[]).includes(tier)) {
      out.push(`\`${name}\`: tier must be deny, ask, allow or opencode \`permission\``);
      continue;
    }
    const patterns = (/^```text\n([\s\S]*?)\n```$/m.exec(section)?.[1] ?? "")
      .split("\n")
      .filter((l) => l !== "");
    const count = Number(/^- count: (\d+)$/m.exec(section)?.[1] ?? NaN);
    if (count !== patterns.length)
      out.push(`\`${name}\`: count ${count}, holds ${patterns.length}`);
    for (const p of patterns) {
      groupsOf.set(p, [...(groupsOf.get(p) ?? []), name]);
      stored[tier]!.set(p, name);
    }
  }
  for (const [p, groups] of groupsOf) {
    if (groups.length > 1) out.push(`\`${p}\` is in ${groups.length} groups: ${groups.join(", ")}`);
  }
  for (const tier of TIERS) {
    const shipped = new Set(settings.permissions?.[tier] ?? []);
    for (const p of shipped) {
      if (!stored[tier]!.has(p)) out.push(`${tier}: \`${p}\` is shipped but in no group`);
    }
    for (const [p, group] of stored[tier]!) {
      if (!shipped.has(p)) out.push(`${tier}: \`${p}\` is in \`${group}\` but not shipped`);
    }
  }
  if (!opencodeSeen) out.push("no `opencode-permission` group");
  return out;
}

// ---------------------------------------------------------------------------
// Special Behaviors ← `.bkit/core/.bkit/prompts.md`; Authoring Rules ← `authoring.md`, `workflows.md`
// ---------------------------------------------------------------------------

/** Catalog files the two sections copy. */
export const CATALOG_SOURCES = [
  ".bkit/core/.bkit/prompts.md",
  ".bkit/core/.bkit/workflows.md",
  ".bkit/core/.bkit/authoring.md",
];

const FENCE_OPEN = /^(`{3,})/;

/** Per line: true when the line is a fence marker or inside a fenced block. */
function fencedLines(lines: string[]): boolean[] {
  let fence = "";
  return lines.map((l) => {
    if (fence) {
      if (l === fence) fence = "";
      return true;
    }
    const m = FENCE_OPEN.exec(l);
    if (m) fence = m[1]!;
    return Boolean(m);
  });
}

/**
 * Body of the heading named `heading` (any level), up to the next heading of the same or
 * a higher level outside a fenced block; blank lines at both ends dropped.
 */
export function catalogSection(md: string, heading: string): string | undefined {
  const lines = md.split("\n");
  const fenced = fencedLines(lines);
  const level = (l: string) => /^(#{1,6}) /.exec(l)?.[1]!.length ?? 0;
  const at = lines.findIndex(
    (l, i) => !fenced[i] && level(l) > 0 && l.replace(/^#+ /, "") === heading,
  );
  if (at === -1) return undefined;
  const own = level(lines[at]!);
  let end = at + 1;
  while (
    end < lines.length &&
    !(level(lines[end]!) > 0 && !fenced[end] && level(lines[end]!) <= own)
  )
    end++;
  const body = lines.slice(at + 1, end);
  while (body.length > 0 && body[0]!.trim() === "") body.shift();
  while (body.length > 0 && body[body.length - 1]!.trim() === "") body.pop();
  return body.join("\n");
}

/** Cells of each `| … |` row of a section's table, header and separator dropped. */
function tableRows(body: string): string[][] {
  return body
    .split("\n")
    .filter((l) => l.startsWith("| ") && l.endsWith(" |"))
    .map((l) => l.slice(2, -2).split(" | "))
    .slice(2);
}

/** One `### ` entry of a store section, with the line indexes sync rewrites. */
interface CatalogEntry {
  name: string;
  keys: Map<string, { value: string; line: number }>;
  file: string;
  heading: string;
  text: string;
  /** Indexes of the text block's opening and closing fence lines. */
  open: number;
  close: number;
}

function catalogEntries(lines: string[], section: string): CatalogEntry[] {
  const fenced = fencedLines(lines);
  const head = lines.findIndex((l, i) => !fenced[i] && l === `## ${section}`);
  if (head === -1) return [];
  const out: CatalogEntry[] = [];
  let cur: CatalogEntry | undefined;
  for (let i = head + 1; i < lines.length; i++) {
    const l = lines[i]!;
    if (!fenced[i] && l.startsWith("## ")) break;
    if (!fenced[i] && l.startsWith("### ")) {
      cur = {
        name: l.slice(4).trim(),
        keys: new Map(),
        file: "",
        heading: "",
        text: "",
        open: -1,
        close: -1,
      };
      out.push(cur);
      continue;
    }
    if (!cur) continue;
    const key = /^- ([a-z]+): (.+)$/.exec(l);
    if (key && !fenced[i]) {
      cur.keys.set(key[1]!, { value: key[2]!, line: i });
      const src = /^`([^`]+)` § (.+)$/.exec(key[2]!);
      if (key[1] === "source" && src) [cur.file, cur.heading] = [src[1]!, src[2]!];
    }
    const open = /^(`{3,})text$/.exec(l);
    if (open && cur.open === -1) {
      cur.open = i;
      cur.close = lines.indexOf(open[1]!, i + 1);
      cur.text = lines.slice(i + 1, cur.close).join("\n");
    }
  }
  return out;
}

const BEHAVIORS = "Special Behaviors";
const AUTHORING = "Authoring Rules";

interface Want {
  entry: CatalogEntry;
  text?: string;
  keys: Record<string, string>;
}

/** What each entry should hold, and findings for rows and sections without one. */
function catalogWants(
  lines: string[],
  catalogs: Map<string, string>,
): { wants: Want[]; out: string[] } {
  const out: string[] = [];
  const wants: Want[] = [];
  const behaviors = catalogEntries(lines, BEHAVIORS);
  const byTable = new Map<string, CatalogEntry[]>();
  for (const e of behaviors) {
    const k = `${e.file}\0${e.heading}`;
    byTable.set(k, [...(byTable.get(k) ?? []), e]);
  }
  for (const [k, entries] of byTable) {
    const [file, heading] = k.split("\0") as [string, string];
    const body = catalogs.has(file) ? catalogSection(catalogs.get(file)!, heading) : undefined;
    if (body === undefined) {
      out.push(`\`${file}\` § ${heading}: not found`);
      continue;
    }
    const rows = tableRows(body);
    rows.forEach((row, i) => {
      const e = entries[i];
      if (!e) out.push(`${row[0]}: no \`## ${BEHAVIORS}\` entry`);
      else
        wants.push({
          entry: e,
          text: row[2] ?? "",
          keys: { behavior: row[0] ?? "", agents: row[1] ?? "" },
        });
    });
    for (const e of entries.slice(rows.length))
      out.push(`\`${e.name}\`: no row in \`${file}\` § ${heading}`);
  }
  for (const e of catalogEntries(lines, AUTHORING)) {
    const body = catalogs.has(e.file)
      ? catalogSection(catalogs.get(e.file)!, e.heading)
      : undefined;
    if (body === undefined) out.push(`\`${e.name}\`: \`${e.file}\` § ${e.heading} not found`);
    else wants.push({ entry: e, text: body, keys: {} });
  }
  for (const e of behaviors) {
    if (!e.file) out.push(`\`${e.name}\`: source must be \`{file}\` § {heading}`);
  }
  return { wants, out };
}

/** Findings for `## Special Behaviors` and `## Authoring Rules` against the catalogs (`file` → content). */
export function checkCatalogs(store: string, catalogs: Map<string, string>): string[] {
  const { wants, out } = catalogWants(store.split("\n"), catalogs);
  for (const w of wants) {
    for (const [k, v] of Object.entries(w.keys)) {
      if (w.entry.keys.get(k)?.value !== v) out.push(`\`${w.entry.name}\`: ${k} differs`);
    }
    if (w.entry.text !== w.text) {
      out.push(
        `\`${w.entry.name}\`: ${Object.keys(w.keys).length > 0 ? "notes" : "text"} differ${Object.keys(w.keys).length > 0 ? "" : "s"} — run pnpm instructions:sync`,
      );
    }
  }
  return out;
}

/** The store with each Special Behaviors and Authoring Rules copy refreshed from its catalog. */
export function syncCatalogs(store: string, catalogs: Map<string, string>): string {
  const lines = store.split("\n");
  const { wants } = catalogWants(lines, catalogs);
  // Bottom-up, so earlier indexes stay valid.
  wants.sort((a, b) => b.entry.open - a.entry.open);
  for (const w of wants) {
    const text = w.text ?? "";
    if (w.entry.open !== -1 && w.entry.text !== text) {
      const fence = text.includes("```") ? "````" : "```";
      lines.splice(
        w.entry.open,
        w.entry.close - w.entry.open + 1,
        `${fence}text`,
        ...text.split("\n"),
        fence,
      );
    }
    for (const [k, v] of Object.entries(w.keys)) {
      const at = w.entry.keys.get(k);
      if (at && at.value !== v) lines[at.line] = `- ${k}: ${v}`;
    }
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Every copied section, read from `root`
// ---------------------------------------------------------------------------

const readAt = (root: string, rel: string) => fs.readFileSync(path.join(root, rel), "utf-8");

export function ruleMasters(root: string): RuleMasters {
  return {
    bkit: readAt(root, ".bkit/core/.agents/rules.md"),
    project: readAt(root, ".agents/rules.md"),
  };
}

const catalogsAt = (root: string) => new Map(CATALOG_SOURCES.map((f) => [f, readAt(root, f)]));

/** Findings for every store section that copies a master, read from `root`. */
export function checkSources(root: string, store: string): string[] {
  return [
    ...checkRules(store, ruleMasters(root), (ref, section) => refExists(root, ref, section)),
    ...checkHooks(store, new Map(HOOK_SOURCES.map((f) => [f, readAt(root, f)]))),
    ...checkPermissions(
      store,
      JSON.parse(readAt(root, ".bkit/shared/.claude/settings.json")),
      JSON.parse(readAt(root, ".bkit/shared/.opencode/opencode.json")),
    ),
    ...checkCatalogs(store, catalogsAt(root)),
  ];
}

/** The store with every generated copy refreshed from its master. */
export function syncSources(root: string, store: string): string {
  return syncCatalogs(syncRules(store, ruleMasters(root)), catalogsAt(root));
}
