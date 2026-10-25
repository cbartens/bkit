// tools/instructions.ts — check and sync `.bkit/instructions.md`, the store of every
// instruction bkit gives an agent.
//
// Check mode runs in the test suite (`tools/instructions.test.ts`); write mode is
// `pnpm instructions:sync`, lookup is `pnpm instructions:show`. Same model as prettier:
// CI checks, the author writes.
//
// `## Clauses` holds the shared sentences.
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
import { checkSources, parseDriftItem, parseRuleEntries, sectionOf, syncSources, } from "./instructions-sources.js";
export { sectionOf };
/** Near-copy threshold: a sentence this similar to a clause but not equal to it is drift. */
export const NEAR_COPY = 0.8;
/** Cut-off per surface: a sentence shared by this many files of one surface belongs in the wording file. */
export const SHARED_MIN = {
    prompt: 2,
    workflow: 2,
    audit: 5,
    doc: 2,
};
/** Surfaces a clause can set a mode for. */
const SURFACES = ["prompt", "workflow", "rules", "audit", "doc"];
/** Surfaces a clause can set a mode for: the shared-sentence surfaces plus the hand-authored repo agents. */
const MODE_SURFACES = [...SURFACES, "repo-agent"];
/** Surfaces whose files open with the Protocol / Contract / Rules header blocks. */
const HEADED = ["prompt", "workflow", "repo-agent"];
/** Surfaces checked inside the `bkit:start` / `bkit:end` block only. */
const MANAGED = ["rules", "audit", "plan-template", "doc"];
/** Files a surface's mode and cut-off reach: `doc` also takes the plan template and AGENTS.md. */
export const POOL = {
    doc: ["doc", "plan-template", "entry"],
};
/** The surface whose mode and cut-off apply to a file of `surface`. */
export const poolOf = (surface) => Object.keys(POOL).find((p) => POOL[p].includes(surface)) ?? surface;
const NOUN = {
    prompt: "prompts",
    workflow: "workflows",
    audit: "audit templates",
    doc: "docs",
};
const MODES = [
    "required",
    "where-used",
    "repeatable",
    "forbidden",
    "if-verdict",
    "if-bash",
    "if-search",
    "if-no-search",
];
const POSITIONS = ["first"];
export const BLOCKS = ["protocol", "contract", "rules"];
/** Label line opening each header block, lead-in after it. */
export const BLOCK_LABEL = {
    protocol: "**Protocol:**",
    contract: "**Contract:**",
    rules: "**Rules:**",
};
const VERDICT_END = "<!-- verdict:end -->";
const SLOT = /\{\{([A-Za-z][\w-]*)(\?)?\}\}/g;
const LABEL = /^\*\*[^*]+:\*\* /;
/** Structure, not sentences: headings, HTML comments, table rows. Never counted toward the cut-off. */
const STRUCTURE = /^(?:#{1,6} |<!--|\|)/;
/** Parse the store: each `## ` section by its own parser. */
export function parseInstructions(md) {
    return { clauses: parseClauses(md) };
}
/** Parse the `## Clauses` section: one `### name` section per clause. */
export function parseClauses(md) {
    const body = sectionOf(md, "Clauses");
    if (body === undefined)
        throw new Error("[bkit-instructions] no `## Clauses` section");
    const clauses = [];
    for (const section of body.split(/^### /m).slice(1)) {
        const name = section.slice(0, section.indexOf("\n")).trim();
        const clause = {
            name,
            texts: [],
            retired: [],
            modes: {},
            except: new Set(),
            anchored: false,
        };
        for (const m of section.matchAll(/^- ([a-z-]+): (.+)$/gm)) {
            const [key, value] = [m[1], m[2].trim()];
            if (MODE_SURFACES.includes(key)) {
                if (!MODES.includes(value)) {
                    throw new Error(`[bkit-instructions] ${name}: unknown mode "${value}" for ${key}`);
                }
                clause.modes[key] = value;
            }
            else if (key === "except") {
                for (const f of value.split(","))
                    clause.except.add(f.trim());
            }
            else if (key === "position") {
                if (!POSITIONS.includes(value)) {
                    throw new Error(`[bkit-instructions] ${name}: position must be first`);
                }
                clause.position = value;
            }
            else if (key === "block") {
                if (!BLOCKS.includes(value)) {
                    throw new Error(`[bkit-instructions] ${name}: block must be protocol, contract, or rules`);
                }
                clause.block = value;
            }
            else if (key === "anchored") {
                clause.anchored = value === "yes";
            }
            else if (key === "retired") {
                clause.fullyRetired = value === "yes";
            }
            else if (key === "rule") {
                clause.rule = /^[RP]\d+/.exec(value)?.[0];
            }
            else if (key === "tags") {
                clause.tags = value.split(",").map((t) => t.trim());
            }
            else if (key === "carriers" || key === "distinct-from") {
                continue;
            }
            else {
                throw new Error(`[bkit-instructions] ${name}: unknown key "${key}"`);
            }
        }
        for (const m of section.matchAll(/^```(text|retired)\n([\s\S]*?)^```$/gm)) {
            const lines = m[2].split("\n").filter((l) => l.trim() !== "");
            if (m[1] === "text")
                clause.texts.push(...lines);
            else
                clause.retired.push(...lines);
        }
        if (clause.fullyRetired) {
            if (clause.texts.length > 0) {
                throw new Error(`[bkit-instructions] ${name}: a fully retired clause has no text block`);
            }
            if (Object.keys(clause.modes).length > 0) {
                throw new Error(`[bkit-instructions] ${name}: a fully retired clause applies to no surface`);
            }
            clauses.push(clause);
            continue;
        }
        if (clause.texts.length === 0)
            throw new Error(`[bkit-instructions] ${name}: no text block`);
        if (clause.position && !clause.block) {
            throw new Error(`[bkit-instructions] ${name}: position needs a block`);
        }
        if (Object.keys(clause.modes).length === 0) {
            throw new Error(`[bkit-instructions] ${name}: applies to no surface`);
        }
        clauses.push(clause);
    }
    return clauses;
}
// ---------------------------------------------------------------------------
// Corpus
// ---------------------------------------------------------------------------
const RULES_FILES = [".bkit/core/.agents/rules.md", ".agents/rules.md"];
/** Audit templates, then the repo's adopted copies (same basenames, same managed block). */
const AUDIT_DIRS = [".bkit/core/docs/templates", "docs/templates"];
const AUDIT_FILE = /^bkit-audit-.+\.md$/;
/** Hand-authored repo-only agents. */
const REPO_AGENT_DIR = ".claude/agents";
const REPO_AGENT_FILE = /^utility-.+\.md$/;
const PLAN_TEMPLATE = ".bkit/core/docs/templates/bkit-plan.md";
const ENTRY_FILE = ".bkit/core/AGENTS.md";
/**
 * Shipped docs with a `bkit:start` / `bkit:end` block, masters only: the installed
 * copies at the repo root are rewritten from these by `bkit upgrade`.
 */
const DOC_DIRS = [
    ".bkit/core/.agents",
    ".bkit/core/.bkit",
    ".bkit/shared",
    ".bkit/shared/docs",
    ".bkit/shared/.cursor/rules",
];
const DOC_FILE = /\.mdc?$/;
const BLOCK_START = /^<!-- bkit:start -->$/m;
/** Every file the wording file governs, read from `root`. */
export function loadCorpus(root) {
    const files = [];
    for (const [surface, dir] of [
        ["prompt", path.join(".bkit", "core", "prompts")],
        ["workflow", path.join(".bkit", "core", "workflows")],
    ]) {
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
        if (!fs.existsSync(path.join(root, dir)))
            continue;
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
        if (!fs.existsSync(path.join(root, id)))
            continue;
        files.push({
            surface: "rules",
            id,
            name: "rules",
            content: fs.readFileSync(path.join(root, id), "utf-8"),
        });
    }
    const taken = new Set([...RULES_FILES, PLAN_TEMPLATE, ENTRY_FILE]);
    for (const dir of DOC_DIRS) {
        if (!fs.existsSync(path.join(root, dir)))
            continue;
        for (const f of fs
            .readdirSync(path.join(root, dir))
            .filter((n) => DOC_FILE.test(n))
            .sort()) {
            const id = path.join(dir, f);
            if (taken.has(id))
                continue;
            const content = fs.readFileSync(path.join(root, id), "utf-8");
            if (BLOCK_START.test(content))
                files.push({ surface: "doc", id, name: f.replace(DOC_FILE, ""), content });
        }
    }
    const agentDir = path.join(root, REPO_AGENT_DIR);
    const agents = fs.existsSync(agentDir)
        ? fs
            .readdirSync(agentDir)
            .filter((n) => REPO_AGENT_FILE.test(n))
            .sort()
        : [];
    const singles = [
        ...agents.map((f) => ["repo-agent", path.join(REPO_AGENT_DIR, f)]),
        ["plan-template", PLAN_TEMPLATE],
        ["entry", ENTRY_FILE],
    ];
    for (const [surface, id] of singles) {
        if (!fs.existsSync(path.join(root, id)))
            continue;
        files.push({
            surface,
            id,
            name: path.basename(id, ".md"),
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
export function proseLineIndexes(file) {
    const lines = file.content.split("\n");
    let from = 0;
    let to = lines.length;
    if (MANAGED.includes(file.surface)) {
        const [startMarker, endMarker] = selectMarkers("html-comment");
        const starts = findLineAnchoredMarkers(file.content, startMarker);
        const ends = findLineAnchoredMarkers(file.content, endMarker);
        if (starts.length !== 1 || ends.length !== 1)
            return [];
        from = file.content.slice(0, starts[0]).split("\n").length;
        to = file.content.slice(0, ends[0]).split("\n").length - 1;
    }
    else if (lines[0] === "---") {
        const close = lines.indexOf("---", 1);
        if (close !== -1)
            from = close + 1;
    }
    const out = [];
    let fence = null;
    for (let i = from; i < to; i++) {
        const line = lines[i];
        if (fence !== null) {
            if (new RegExp(`^[ \\t]*${fence}[ \\t]*$`).test(line))
                fence = null;
            continue;
        }
        const open = /^[ \t]*(`{3,})[\w-]*[ \t]*$/.exec(line);
        if (open) {
            fence = open[1];
            continue;
        }
        out.push(i);
    }
    return out;
}
/**
 * Prose lines a clause can match: in a prompt, every prose line outside the
 * `**Rules:**` block, whose lines are rules.md copies the `- carry:` check owns.
 */
export function clauseLineIndexes(file) {
    const prose = proseLineIndexes(file);
    const block = file.surface === "prompt" ? ruleBlock(file.content.split("\n")) : undefined;
    return block ? prose.filter((i) => i < block.from || i >= block.to) : prose;
}
/** Lines a clause is matched against: a `block: rules` clause also sees the prompt's `**Rules:**` block it sits in. */
function linesFor(clause, file) {
    return clause.block === "rules" ? proseLineIndexes(file) : clauseLineIndexes(file);
}
/** A column-0 `**Label:**` line, alone or with text after it. */
const LABEL_LINE = /^\*\*[^*]+:\*\*(?: |$)/;
/**
 * Line range of each header block: its label line up to the next column-0
 * `**Label:**` line, `## ` heading or `---`. A block whose label is missing, or
 * appears more than once, has no range.
 */
export function blockRanges(content) {
    const lines = content.split("\n");
    const out = {};
    for (const b of BLOCKS) {
        const at = lines.flatMap((l, i) => (l.startsWith(BLOCK_LABEL[b]) ? [i] : []));
        if (at.length !== 1)
            continue;
        const from = at[0];
        const end = lines.findIndex((l, i) => i > from && (LABEL_LINE.test(l) || l.startsWith("## ") || l === "---"));
        out[b] = { from, to: end === -1 ? lines.length : end };
    }
    return out;
}
/** Line range of a prompt's `**Rules:**` block. */
function ruleBlock(lines) {
    return blockRanges(lines.join("\n")).rules;
}
/** Words that make a paragraph line an instruction. */
const STANDING_WORD = /\b(?:NEVER|ALWAYS|MUST|ONLY|NOT|STOP|CRITICAL|Do not)\b|→|⛔/;
const LIST_ITEM = /^[ \t]*(?:[-*+]|\d+\.)[ \t]+(?:\[[ xX]\][ \t]+)?/;
const QUOTE_BULLET = /^[ \t]*>[ \t]*[-*+][ \t]+/;
/**
 * The standing instructions of a file, 1-based line and text: list items and blockquote
 * bullets (marker, step number and checkbox dropped), and paragraph lines carrying
 * `NEVER` / `ALWAYS` / `MUST` / `ONLY` / `NOT` / `STOP` / `CRITICAL` / `Do not` / `→` /
 * `⛔` or opening with a `**Label:**`. Headings, table rows, HTML comments, fenced
 * blocks and front matter are dropped; managed surfaces: the `bkit:start` / `bkit:end`
 * block only.
 */
export function standingLines(file) {
    const lines = file.content.split("\n");
    const out = [];
    for (const i of proseLineIndexes(file)) {
        const raw = lines[i];
        if (raw.trim() === "" || /^[ \t]*(?:#{1,6} |\||<!--)/.test(raw))
            continue;
        const item = LIST_ITEM.exec(raw) ?? QUOTE_BULLET.exec(raw);
        if (item) {
            const text = raw.slice(item[0].length).trim();
            if (text !== "" && !text.startsWith("<!--"))
                out.push({ line: i + 1, text });
            continue;
        }
        const text = raw.replace(/^[ \t]*>[ \t]?/, "").trim();
        if (text === "" || text.startsWith("[!"))
            continue;
        if (STANDING_WORD.test(text) || LABEL.test(text))
            out.push({ line: i + 1, text });
    }
    return out;
}
/** Tool names in the front matter `tools:` list, inline (`[a, b]`) or block (`- a`) form. */
export function toolsOf(content) {
    const lines = content.split("\n");
    if (lines[0] !== "---")
        return [];
    const close = lines.indexOf("---", 1);
    const front = lines.slice(1, close === -1 ? 1 : close);
    const at = front.findIndex((l) => /^tools:/.test(l));
    if (at === -1)
        return [];
    const inline = /^tools:[ \t]*\[(.*)\][ \t]*$/.exec(front[at]);
    if (inline) {
        return inline[1]
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }
    const tools = [];
    for (const line of front.slice(at + 1)) {
        if (/^\S/.test(line))
            break;
        const item = /^[ \t]+-[ \t]+(\S+)/.exec(line);
        if (item)
            tools.push(item[1]);
    }
    return tools;
}
// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const compiledCache = new Map();
export function compileText(text) {
    const hit = compiledCache.get(text);
    if (hit)
        return hit;
    const slots = [];
    let source = "";
    let last = 0;
    for (const m of text.matchAll(SLOT)) {
        source += escapeRe(text.slice(last, m.index));
        source += m[2] ? "(.*?)" : "(.+?)";
        slots.push(m[1]);
        last = m.index + m[0].length;
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
const countIn = (line, c) => [...line.matchAll(c.re)].length;
/** Drop the blockquote, list marker, step number, or checkbox in front of a line's text. */
export const stripLinePrefix = (line) => line.replace(/^[ \t]*(?:>[ \t]?)?(?:[ \t]*(?:[-*]|\d+\.)[ \t]+)?(?:\[[ xX]\][ \t]+)?/, "");
/** Split after `.` or `;` (bold close allowed between), never after `e.g.`; the punctuation stays on the sentence. */
export const splitSentences = (s) => s
    .split(/(?<!\be\.g\.)(?<=[.;]\**)\s+(?=\S)/)
    .map((x) => x.trim())
    .filter(Boolean);
/** Word-level Levenshtein similarity in [0, 1]. */
export function similarity(a, b) {
    const x = a.split(/\s+/);
    const y = b.split(/\s+/);
    let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
    for (let i = 1; i <= x.length; i++) {
        const cur = [i];
        for (let j = 1; j <= y.length; j++) {
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
        }
        prev = cur;
    }
    return 1 - prev[y.length] / Math.max(x.length, y.length);
}
function modeFor(clause, file) {
    if (clause.except.has(file.name))
        return undefined;
    const mode = clause.modes[poolOf(file.surface)];
    if (mode === "if-verdict")
        return file.content.includes(VERDICT_END) ? "required" : "forbidden";
    if (mode === "if-bash")
        return toolsOf(file.content).includes("Bash") ? "required" : "forbidden";
    if (mode === "if-search" || mode === "if-no-search") {
        const tools = toolsOf(file.content);
        const searches = tools.includes("Grep") || tools.includes("Bash");
        return searches === (mode === "if-search") ? "required" : "forbidden";
    }
    return mode;
}
const siblingCache = new WeakMap();
const lineCache = new Map();
const wordCounts = (words) => {
    const counts = new Map();
    for (const w of words)
        counts.set(w, (counts.get(w) ?? 0) + 1);
    return counts;
};
const canonicalCache = new Map();
/** A clause wording's sentence count, words, and word counts; memoised like `lineParts`. */
function canonicalParts(canonical) {
    let hit = canonicalCache.get(canonical);
    if (!hit) {
        const words = canonical.split(/\s+/);
        hit = { sentences: splitSentences(canonical).length, words, counts: wordCounts(words) };
        canonicalCache.set(canonical, hit);
    }
    return hit;
}
/** A line's sentences and word counts, prefix dropped; memoised, since every clause scans every line. */
function lineParts(line) {
    let hit = lineCache.get(line);
    if (!hit) {
        if (lineCache.size > 50_000)
            lineCache.clear();
        const rest = stripLinePrefix(line);
        hit = { sentences: splitSentences(rest), words: wordCounts(rest.split(/\s+/)) };
        lineCache.set(line, hit);
    }
    return hit;
}
/** Other unslotted clause wordings near enough to `canonical` to read as its near-copy. */
function siblingsOf(canonical, allTexts) {
    let byText = siblingCache.get(allTexts);
    if (!byText) {
        byText = new Map();
        siblingCache.set(allTexts, byText);
    }
    let hit = byText.get(canonical);
    if (!hit) {
        hit = [...allTexts].filter((t) => t !== canonical && !compileText(t).slotted && similarity(t, canonical) >= NEAR_COPY);
        byText.set(canonical, hit);
    }
    return hit;
}
/** Sentence windows in a line that are near, but not equal to, an unslotted clause wording. */
function nearCopies(clause, lineIdx, line, allTexts) {
    if (clause.texts.some((t) => countIn(line, compileText(t)) > 0))
        return [];
    const { sentences, words: lineWords } = lineParts(line);
    const out = [];
    for (const canonical of clause.texts) {
        if (compileText(canonical).slotted)
            continue;
        // A line carrying a sibling clause verbatim (`Gate 2` beside `Gate 3`) is that clause, not drift of this one.
        if (siblingsOf(canonical, allTexts).some((t) => countIn(line, compileText(t)) > 0))
            continue;
        const { sentences: k, words: canonicalWords, counts } = canonicalParts(canonical);
        const cw = canonicalWords.length;
        // Every window is drawn from the line's words: too few of the clause's words anywhere → no near-copy.
        let shared = 0;
        for (const [w, n] of counts)
            shared += Math.min(n, lineWords.get(w) ?? 0);
        if (shared < Math.ceil(NEAR_COPY * cw))
            continue;
        // A drift can add or drop a sentence break (`;` turned into `,`): try one sentence fewer and more.
        for (let i = 0; i < sentences.length;) {
            let best;
            for (let size = Math.max(1, k - 1); size <= k + 1 && i + size <= sentences.length; size++) {
                let window = sentences.slice(i, i + size).join(" ");
                // An unlabelled clause can sit behind any file's own label: compare the text only.
                if (!canonical.startsWith("**"))
                    window = window.replace(LABEL, "");
                // A clause can close a sentence that opens with local text (`**If** {cond} → {clause}`): also compare the tail.
                const words = window.split(/\s+/);
                const candidates = [window];
                for (const n of [cw - 1, cw, cw + 1]) {
                    if (n > 0 && n < words.length)
                        candidates.push(words.slice(-n).join(" "));
                }
                for (const found of candidates) {
                    if (allTexts.has(found) || !nearCandidate(found.split(/\s+/), canonicalWords))
                        continue;
                    const score = similarity(found, canonical);
                    if (score >= NEAR_COPY && (!best || score > best.score))
                        best = { found, size, score };
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
/**
 * Header shape of a prompt, workflow or repo agent: no `> [!CAUTION]` box, and the
 * `**Protocol:**`, `**Contract:**` and `**Rules:**` blocks each exactly once, in that order.
 */
export function checkBlocks(files) {
    const findings = [];
    for (const file of files) {
        if (!HEADED.includes(file.surface))
            continue;
        const lines = file.content.split("\n");
        const caution = proseLineIndexes(file).find((i) => lines[i].startsWith("> [!CAUTION]"));
        if (caution !== undefined) {
            findings.push({
                file: file.id,
                line: caution + 1,
                clause: "header-blocks",
                problem: "CAUTION box: header lines go in the Protocol / Contract / Rules blocks",
            });
        }
        const ranges = blockRanges(file.content);
        let prev;
        for (const b of BLOCKS) {
            const count = lines.filter((l) => l.startsWith(BLOCK_LABEL[b])).length;
            if (count !== 1) {
                findings.push({
                    file: file.id,
                    clause: "header-blocks",
                    problem: `${BLOCK_LABEL[b]} block appears ${count} times; expected once`,
                });
                continue;
            }
            if (prev && ranges[b].from < ranges[prev].from) {
                findings.push({
                    file: file.id,
                    line: ranges[b].from + 1,
                    clause: "header-blocks",
                    problem: `${BLOCK_LABEL[b]} block must come after ${BLOCK_LABEL[prev]}`,
                });
            }
            prev = b;
        }
    }
    return findings;
}
// ---------------------------------------------------------------------------
// Check
// ---------------------------------------------------------------------------
export function checkClauses(clauses, files) {
    const findings = [];
    const allTexts = new Set(clauses.flatMap((c) => c.texts));
    const compiled = new Map(clauses.map((c) => [c, c.texts.map(compileText)]));
    for (const file of files) {
        const lines = file.content.split("\n");
        const headed = HEADED.includes(file.surface);
        const ranges = headed ? blockRanges(file.content) : {};
        const placed = [];
        const at = (i) => (i === undefined ? undefined : i + 1);
        for (const clause of clauses) {
            const mode = modeFor(clause, file);
            if (mode === undefined)
                continue;
            const forms = compiled.get(clause);
            // Forms can overlap (a slotted form may also fit another's line): a line counts once per instance.
            const perLine = (i) => Math.max(...forms.map((c) => countIn(lines[i], c)));
            const prose = linesFor(clause, file);
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
            if (mode === "forbidden")
                continue;
            for (const i of prose) {
                const line = lines[i];
                for (const near of nearCopies(clause, i, line, allTexts)) {
                    findings.push({
                        file: file.id,
                        line: near.line + 1,
                        clause: clause.name,
                        problem: `near-copy (run pnpm instructions:sync): "${near.found}"`,
                    });
                }
                for (const old of clause.retired) {
                    if (countIn(line, compileText(old)) > 0) {
                        findings.push({
                            file: file.id,
                            line: i + 1,
                            clause: clause.name,
                            problem: "retired wording (run pnpm instructions:sync)",
                        });
                    }
                }
                if (clause.anchored &&
                    forms.some((c) => c.slotted && line.includes(c.prefix)) &&
                    perLine(i) === 0) {
                    const templates = clause.texts.filter((t) => compileText(t).slotted);
                    findings.push({
                        file: file.id,
                        line: i + 1,
                        clause: clause.name,
                        problem: `does not match the template${templates.length > 1 ? "s" : ""}: ${templates.join(" | ")}`,
                    });
                }
            }
            if (clause.block && count > 0 && headed)
                placed.push({ clause, line: hits[0] });
        }
        // Placed clauses sit in their block, in wording-file order; `first` opens the block's bullets.
        let prev;
        for (const p of placed) {
            const block = p.clause.block;
            const range = ranges[block];
            if (!range || p.line < range.from || p.line >= range.to) {
                findings.push({
                    file: file.id,
                    line: at(p.line),
                    clause: p.clause.name,
                    problem: `must be in the ${BLOCK_LABEL[block]} block`,
                });
                continue;
            }
            const first = lines.findIndex((l, i) => i > range.from && i < range.to && l.startsWith("- "));
            if (p.clause.position === "first" && p.line !== first) {
                findings.push({
                    file: file.id,
                    line: at(p.line),
                    clause: p.clause.name,
                    problem: `must be the first bullet of the ${BLOCK_LABEL[block]} block`,
                });
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
function nearCandidate(a, b) {
    const longer = Math.max(a.length, b.length);
    const need = Math.ceil(NEAR_COPY * longer);
    if (Math.min(a.length, b.length) < need)
        return false;
    const pool = new Map();
    for (const w of b)
        pool.set(w, (pool.get(w) ?? 0) + 1);
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
export function unlistedShared(clauses, files) {
    const forms = clauses.flatMap((c) => c.texts.map(compileText));
    const findings = [];
    for (const surface of SURFACES) {
        const min = SHARED_MIN[surface];
        if (min === undefined)
            continue;
        const seen = new Map();
        for (const file of files.filter((f) => poolOf(f.surface) === surface)) {
            const lines = file.content.split("\n");
            for (const i of clauseLineIndexes(file)) {
                let rest = stripLinePrefix(lines[i]);
                if (STRUCTURE.test(rest))
                    continue;
                for (const c of forms)
                    rest = rest.replace(c.re, "\u0000");
                for (const sentence of splitSentences(rest)) {
                    const s = sentence.replace(/[.;]$/, "");
                    if (s.includes("\u0000") || s.split(/\s+/).length < 3)
                        continue;
                    if (!seen.has(s))
                        seen.set(s, new Map());
                    if (!seen.get(s).has(file.name))
                        seen.get(s).set(file.name, file.id);
                }
            }
        }
        findings.push(...sharedGroups(seen, min, NOUN[surface]));
    }
    return findings;
}
/** Group each sentence with its near-copies; report every group reaching `min` files. */
function sharedGroups(seen, min, noun) {
    const words = new Map([...seen.keys()].map((s) => [s, s.split(/\s+/)]));
    const reported = new Set();
    const findings = [];
    // Seeds: every sentence, widest first, so a group is reported once under its most-copied wording.
    // A sentence in one file still seeds: with a cut-off of 2, its one near-copy elsewhere makes the pair.
    const seeds = [...seen].sort((a, b) => b[1].size - a[1].size);
    for (const [seed, ids] of seeds) {
        if (reported.has(seed))
            continue;
        const near = [...seen.keys()].filter((s) => s !== seed &&
            !reported.has(s) &&
            nearCandidate(words.get(seed), words.get(s)) &&
            similarity(seed, s) >= NEAR_COPY);
        const group = new Set([...ids.keys(), ...near.flatMap((s) => [...seen.get(s).keys()])]);
        if (group.size < min)
            continue;
        for (const s of [seed, ...near])
            reported.add(s);
        const drifted = near.length > 0 ? `, ${group.size - ids.size} as near-copies` : "";
        findings.push({
            file: [...ids.values()][0],
            clause: "(none)",
            problem: `shared by ${group.size} ${noun}${drifted} but not in .bkit/instructions.md: "${seed}"`,
        });
    }
    return findings;
}
// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------
/** Rewrite near-copies and retired wordings in place. Returns only the files that changed. */
export function syncClauses(clauses, files) {
    const changed = new Map();
    const allTexts = new Set(clauses.flatMap((c) => c.texts));
    for (const file of files) {
        const lines = file.content.split("\n");
        for (const i of clauseLineIndexes(file)) {
            for (const clause of clauses) {
                if (modeFor(clause, file) === undefined || modeFor(clause, file) === "forbidden")
                    continue;
                const target = compileText(clause.texts[0]);
                for (const old of clause.retired) {
                    const from = compileText(old);
                    lines[i] = lines[i].replace(from.re, (...groups) => {
                        const bySlot = new Map(from.slots.map((s, n) => [s, String(groups[n + 1])]));
                        const out = clause.texts[0].replace(SLOT, (_, slot) => bySlot.get(slot) ?? "");
                        return String(groups[0]).endsWith(";") && out.endsWith(".")
                            ? `${out.slice(0, -1)};`
                            : out;
                    });
                }
                if (target.slotted)
                    continue;
                for (const near of nearCopies(clause, i, lines[i], allTexts)) {
                    const out = near.found.endsWith(";") && near.canonical.endsWith(".")
                        ? `${near.canonical.slice(0, -1)};`
                        : near.canonical;
                    lines[i] = lines[i].replace(near.found, out);
                }
            }
        }
        const content = lines.join("\n");
        if (content !== file.content)
            changed.set(file.id, content);
    }
    return changed;
}
// ---------------------------------------------------------------------------
// Store carriers
// ---------------------------------------------------------------------------
/** Surfaces in the order a `- carriers:` line lists them. */
const CARRIER_ORDER = [
    "workflow",
    "prompt",
    "repo-agent",
    "audit",
    "plan-template",
    "entry",
    "doc",
    "rules",
];
/**
 * Basenames as the store writes them: `prefix-*` for a family whose every member is
 * listed (two or more files share `prefix-`), then single names, each sorted.
 */
export function formatNames(listed, all) {
    const left = new Set(listed);
    const families = [];
    for (const name of [...listed].sort()) {
        if (!left.has(name))
            continue;
        const parts = name.split("-");
        for (let n = 2; n < parts.length; n++) {
            const prefix = `${parts.slice(0, n).join("-")}-`;
            const members = all.filter((a) => a.startsWith(prefix));
            if (members.length >= 2 && members.every((m) => left.has(m))) {
                families.push(`${prefix}*`);
                for (const m of members)
                    left.delete(m);
                break;
            }
        }
    }
    return [...families.sort(), ...[...left].sort()].map((n) => `\`${n}\``).join(", ");
}
/** The `- carriers:` value for a clause: per surface, the files whose prose carries a text line today. */
export function carriersLine(clause, files) {
    const forms = clause.texts.map(compileText);
    const parts = [];
    for (const surface of CARRIER_ORDER) {
        const ofSurface = files.filter((f) => f.surface === surface);
        const all = [...new Set(ofSurface.map((f) => f.name))];
        const carrying = new Set();
        for (const file of ofSurface) {
            const lines = file.content.split("\n");
            if (linesFor(clause, file).some((i) => forms.some((c) => countIn(lines[i], c) > 0))) {
                carrying.add(file.name);
            }
        }
        if (carrying.size === 0)
            continue;
        parts.push(surface === "rules" ? "rules" : `${surface} ${namesSpec(carrying, all)}`);
    }
    return parts.join("; ");
}
/** `all`, `all except …` (3 or fewer missing, fewer than carrying), or the names. */
export function namesSpec(carrying, all) {
    const missing = all.filter((n) => !carrying.has(n));
    if (missing.length === 0)
        return "all";
    if (missing.length <= 3 && missing.length < carrying.size) {
        return `all except ${formatNames(missing, all)}`;
    }
    return formatNames([...carrying], all);
}
/** The names a spec written by `namesSpec` (or by hand: `prefix-*` families) covers. */
export function expandNames(spec, all) {
    const listed = (s) => {
        const out = new Set();
        for (const m of s.matchAll(/`([^`]+)`/g)) {
            const name = m[1];
            if (!name.endsWith("*")) {
                out.add(name);
                continue;
            }
            for (const a of all)
                if (a.startsWith(name.slice(0, -1)))
                    out.add(a);
        }
        return out;
    };
    if (spec.trim() === "all")
        return [...all];
    if (spec.startsWith("all except ")) {
        const gone = listed(spec.slice("all except ".length));
        return all.filter((a) => !gone.has(a));
    }
    return [...listed(spec)];
}
/** The store with every clause's generated `- carriers:` line recomputed from the corpus. */
export function syncStore(md, files) {
    const m = /(?:^|\n)## Clauses\n/.exec(md);
    if (!m)
        return md;
    const start = m.index + m[0].length;
    const rest = md.slice(start);
    const endRel = rest.search(/^## /m);
    const end = endRel === -1 ? md.length : start + endRel;
    const sections = md.slice(start, end).split(/^(?=### )/m);
    const out = sections.map((section) => {
        if (!section.startsWith("### "))
            return section;
        const [clause] = parseClauses(`## Clauses\n${section}`);
        const carriers = carriersLine(clause, files);
        const lines = section.split("\n").filter((l) => !l.startsWith("- carriers: "));
        let lastKey = -1;
        for (let i = 1; i < lines.length && !lines[i].startsWith("```"); i++) {
            if (/^- [a-z]+: /.test(lines[i]))
                lastKey = i;
        }
        if (carriers !== "" && lastKey !== -1)
            lines.splice(lastKey + 1, 0, `- carriers: ${carriers}`);
        return lines.join("\n");
    });
    return md.slice(0, start) + out.join("") + md.slice(end);
}
// ---------------------------------------------------------------------------
// Coverage: every standing line has an entry, every entry is still carried
// ---------------------------------------------------------------------------
/** Surfaces whose standing lines the store covers; the rules files are `## Rules` itself. */
const COVERED = [
    "workflow",
    "prompt",
    "repo-agent",
    "audit",
    "plan-template",
    "entry",
];
/** `## Local Instructions` sub-section per surface. */
export const LOCAL_SECTION = {
    workflow: "Workflows",
    prompt: "Prompts",
    "repo-agent": "Repo agents",
    audit: "Audit templates",
    "plan-template": "Plan template",
    entry: "Entry file",
};
const LOCAL_TAG = /^(?:[RP]\d+|fit `[^`]+` [\d.]+)$/;
/** `[R01; fit `x` 0.8; keep: {reason}] {text}`; a bracket holding anything but tags stays text. */
export function parseLocalLine(line) {
    const m = /^\[([^\]]+)\] (.+)$/.exec(line);
    if (m) {
        const parts = m[1].split("; ");
        const tags = [];
        let fit;
        let keep;
        let ok = true;
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (p.startsWith("keep: ")) {
                keep = parts.slice(i).join("; ").slice("keep: ".length);
                break;
            }
            if (!LOCAL_TAG.test(p)) {
                ok = false;
                break;
            }
            if (p.startsWith("fit "))
                fit = p;
            else
                tags.push(p);
        }
        if (ok) {
            return {
                tags,
                ...(fit === undefined ? {} : { fit }),
                ...(keep === undefined ? {} : { keep }),
                text: m[2],
            };
        }
    }
    return { tags: [], text: line };
}
/** Every entry of `## Local Instructions`: shared lines, then per-file lines. */
export function parseLocal(md) {
    const lines = md.split("\n");
    const head = lines.indexOf("## Local Instructions");
    if (head === -1)
        return [];
    const out = [];
    let sub = "";
    let file;
    let shared;
    for (let i = head + 1; i < lines.length; i++) {
        const l = lines[i];
        if (l.startsWith("## "))
            break;
        if (l.startsWith("### ")) {
            sub = l.slice(4).trim();
            file = undefined;
            continue;
        }
        if (sub === "Shared lines") {
            const c = /^- carriers: (.+)$/.exec(l);
            if (c) {
                shared = { carriers: c[1], tags: [], text: "", at: i };
                out.push(shared);
                continue;
            }
            if (!shared)
                continue;
            const k = /^ {2}- ([a-z-]+): (.+)$/.exec(l);
            if (k?.[1] === "tags") {
                for (const t of k[2].split(", ")) {
                    if (t.startsWith("fit "))
                        shared.fit = t;
                    else
                        shared.tags.push(t);
                }
            }
            else if (k?.[1] === "keep") {
                shared.keep = k[2];
            }
            else if (l === "  ```text") {
                const close = lines.indexOf("  ```", i + 1);
                shared.text = lines
                    .slice(i + 1, close)
                    .map((x) => x.replace(/^ {2}/, ""))
                    .join("\n");
                shared.at = i + 1;
                i = close;
            }
            continue;
        }
        const src = /^- source: `([^`]+)`$/.exec(l);
        if (src) {
            file = src[1];
            continue;
        }
        const open = /^(`{3,})text$/.exec(l);
        if (file && open) {
            const close = lines.indexOf(open[1], i + 1);
            for (let j = i + 1; j < close; j++) {
                if (lines[j].trim() === "")
                    continue;
                out.push({ file, ...parseLocalLine(lines[j]), at: j });
            }
            i = close;
        }
    }
    return out;
}
/** Surface → names of a shared line's `- carriers:` value. */
function sharedCarriers(spec, namesOf) {
    const out = new Map();
    for (const part of spec.split("; ")) {
        const at = part.indexOf(" ");
        const surface = part.slice(0, at);
        out.set(surface, expandNames(part.slice(at + 1), namesOf(surface)));
    }
    return out;
}
const plain = (re) => new RegExp(re.source, re.flags.replace("g", ""));
function coverageIndex(store, corpus) {
    const files = corpus.filter((f) => COVERED.includes(f.surface) && !f.id.startsWith("docs/templates/"));
    const names = new Map();
    for (const f of files)
        names.set(f.surface, [...(names.get(f.surface) ?? []), f.name]);
    const clauses = parseClauses(store);
    return {
        files,
        namesOf: (s) => names.get(s) ?? [],
        byName: (s, name) => files.find((f) => f.surface === s && f.name === name),
        standing: new Map(files.map((f) => [f.id, standingLines(f)])),
        prose: new Map(files.map((f) => {
            const lines = f.content.split("\n");
            return [f.id, proseLineIndexes(f).map((i) => lines[i])];
        })),
        rules: [...parseRuleEntries(store, "Rules"), ...parseRuleEntries(store, "Project Rules")],
        clauses,
        clauseForms: clauses.flatMap((c) => c.texts.map((t) => ({ clause: c, re: plain(compileText(t).re) }))),
        local: parseLocal(store),
    };
}
/** Files of a rule's carriers with one of `relations`, on the covered surfaces. */
function ruleCarriers(ix, r, relations, out) {
    const found = [];
    for (const c of r.carriers) {
        if (!relations.includes(c.relation) || !COVERED.includes(c.surface))
            continue;
        const surface = c.surface;
        for (const n of expandNames(c.names, ix.namesOf(surface))) {
            const file = ix.byName(surface, n);
            if (file)
                found.push({ relation: c.relation, file });
            else
                out?.push(`${r.id} \`${r.name}\`: ${c.relation} carrier \`${n}\` is no ${surface} file`);
        }
    }
    return found;
}
/** Files a drift cite can name, by basename, in surface order. */
function citeFiles(ix, name) {
    return COVERED.map((s) => ix.byName(s, name)).filter((f) => f !== undefined);
}
const lineHolds = (file, line, excerpt) => (file.content.split("\n")[line - 1] ?? "").includes(excerpt);
/** Findings for the both-ways check of the store against the corpus. */
export function checkCoverage(store, corpus) {
    const out = [];
    const ix = coverageIndex(store, corpus);
    const partialOf = new Map();
    for (const r of ix.rules) {
        for (const { file } of ruleCarriers(ix, r, ["partial"])) {
            partialOf.set(file.id, [...(partialOf.get(file.id) ?? []), ...splitSentences(r.text)]);
        }
    }
    const localOf = new Map();
    for (const e of ix.local) {
        if (e.file !== undefined)
            localOf.set(e.file, [...(localOf.get(e.file) ?? []), e]);
        else {
            for (const [surface, names] of sharedCarriers(e.carriers ?? "", ix.namesOf)) {
                for (const n of names) {
                    const f = ix.byName(surface, n);
                    if (!f) {
                        out.push(`shared line: carrier \`${n}\` is no ${surface} file: ${e.text}`);
                        continue;
                    }
                    localOf.set(f.id, [...(localOf.get(f.id) ?? []), e]);
                }
            }
        }
    }
    // Nothing missing.
    for (const f of ix.files) {
        const own = new Set((localOf.get(f.id) ?? []).map((e) => e.text));
        const partial = partialOf.get(f.id) ?? [];
        for (const { line, text } of ix.standing.get(f.id)) {
            if (own.has(text))
                continue;
            if (ix.clauseForms.some((c) => c.re.test(text)))
                continue;
            if (ix.rules.some((r) => text.includes(r.text)))
                continue;
            if (partial.some((s) => text.includes(s)))
                continue;
            out.push(`${f.id}:${line}: no entry — add under #### ${f.name}: ${text}`);
        }
    }
    // Nothing extra: local entries.
    for (const e of ix.local) {
        if (e.file === undefined) {
            for (const [surface, names] of sharedCarriers(e.carriers ?? "", ix.namesOf)) {
                for (const n of names) {
                    const f = ix.byName(surface, n);
                    if (f && !ix.standing.get(f.id).some((s) => s.text === e.text)) {
                        out.push(`${n}: shared line no longer in the file: ${e.text}`);
                    }
                }
            }
            continue;
        }
        const f = ix.files.find((x) => x.id === e.file);
        if (!f)
            out.push(`${e.file}: local entry for a file outside the corpus: ${e.text}`);
        else if (!ix.standing.get(f.id).some((s) => s.text === e.text)) {
            out.push(`${f.name}: local entry no longer in the file: ${e.text}`);
        }
    }
    // Nothing extra: rule carriers.
    for (const r of ix.rules) {
        const sentences = splitSentences(r.text);
        for (const { relation, file } of ruleCarriers(ix, r, ["verbatim", "partial", "condensed", "specialised", "applies", "cites"], out)) {
            const prose = ix.prose.get(file.id);
            const tag = `${r.id} \`${r.name}\``;
            const linked = ix.clauses.filter((c) => c.rule === r.id || c.name === r.clause);
            const viaClause = linked.some((c) => c.texts.some((t) => prose.some((l) => plain(compileText(t).re).test(l))));
            if (relation === "verbatim") {
                if (viaClause)
                    continue;
                if (!prose.some((l) => l.includes(r.text)))
                    out.push(`${tag}: verbatim carrier \`${file.name}\` lacks the text`);
                continue;
            }
            if (relation === "partial") {
                if (!viaClause && !prose.some((l) => sentences.some((s) => l.includes(s)))) {
                    out.push(`${tag}: partial carrier \`${file.name}\` holds no sentence of the text`);
                }
                continue;
            }
            const tagged = (localOf.get(file.id) ?? []).some((e) => e.tags.includes(r.id));
            const viaTaggedClause = ix.clauses.some((c) => c.tags?.includes(r.id) &&
                c.texts.some((t) => prose.some((l) => plain(compileText(t).re).test(l))));
            if (!tagged && !viaClause && !viaTaggedClause) {
                out.push(`${tag}: ${relation} carrier \`${file.name}\` has no local line or clause tagged ${r.id}`);
            }
        }
        // Drift: each cite holds its excerpt.
        for (const d of r.drift) {
            const entry = /^(hook|permission) `([^`]+)`: /.exec(d.raw);
            if (entry) {
                const heading = entry[1] === "hook" ? "Hook Text" : "Permissions";
                if (!new RegExp(`^### ${escapeRe(entry[2])}$`, "m").test(sectionOf(store, heading) ?? "")) {
                    out.push(`${r.id} \`${r.name}\`: drift names no \`## ${heading}\` entry \`${entry[2]}\``);
                }
                continue;
            }
            if (d.cites.length === 0 || d.excerpt === undefined) {
                out.push(`${r.id} \`${r.name}\`: drift item needs \`{file}:{line}\` cites and a "quoted excerpt": ${d.raw}`);
                continue;
            }
            for (const c of d.cites) {
                const candidates = citeFiles(ix, c.name);
                if (candidates.length === 0)
                    out.push(`${r.id} \`${r.name}\`: drift \`${c.name}:${c.line}\` names no file`);
                else if (!candidates.some((f) => lineHolds(f, c.line, d.excerpt))) {
                    out.push(`${r.id} \`${r.name}\`: drift \`${c.name}:${c.line}\` does not hold "${d.excerpt}"`);
                }
            }
        }
    }
    return out;
}
/** Local lines with a `fit` tag and no `keep` reason. */
export function openFits(store) {
    return parseLocal(store)
        .filter((e) => e.fit !== undefined && e.keep === undefined)
        .map((e) => `${e.file ?? `shared (${e.carriers})`}: ${e.fit}: ${e.text}`);
}
/** Drift items with no `kept` reason. */
export function openDrift(store) {
    return [...parseRuleEntries(store, "Rules"), ...parseRuleEntries(store, "Project Rules")].flatMap((r) => r.drift.filter((d) => d.kept === undefined).map((d) => `${r.id} \`${r.name}\`: ${d.raw}`));
}
/** Label line opening a prompt's block of rule copies. */
export const RULES_BLOCK = BLOCK_LABEL.rules;
/**
 * Rule copies outside the `**Rules:**` block: a `**Protocol:**` or `**Contract:**`
 * bullet opening with a bkit rule's first sentence, or `NEAR_COPY`-alike its text. A rule's copy
 * belongs in the Rules block, word for word.
 */
export function checkRuleCopies(store, corpus) {
    const rules = parseRuleEntries(store, "Rules");
    const label = (t) => /^\*\*([^*]+):\*\*/.exec(t)?.[1];
    const byLabel = new Map(rules.map((r) => [label(r.text), r]));
    const out = [];
    for (const f of corpus) {
        if (!HEADED.includes(f.surface))
            continue;
        const lines = f.content.split("\n");
        const ranges = blockRanges(f.content);
        for (const b of ["protocol", "contract"]) {
            const range = ranges[b];
            if (!range)
                continue;
            for (let i = range.from + 1; i < range.to; i++) {
                const text = /^- (.+)$/.exec(lines[i])?.[1];
                if (text === undefined)
                    continue;
                const own = label(text);
                const same = own !== undefined ? byLabel.get(own) : undefined;
                const rule = (same && splitSentences(same.text)[0] === splitSentences(text)[0] ? same : undefined) ??
                    rules.find((r) => nearCandidate(text.split(/\s+/), r.text.split(/\s+/)) &&
                        similarity(text, r.text) >= NEAR_COPY);
                if (rule) {
                    out.push(`${rule.id} \`${rule.name}\`: \`${f.id}:${i + 1}\` copies the rule in its ${BLOCK_LABEL[b]} block; it belongs in the ${RULES_BLOCK} block`);
                }
            }
        }
    }
    return out;
}
/**
 * Rule copies in prompts against each rule's `- carry:` line: `missing` = a named prompt
 * without the whole bullet, or with its copies out of rules.md order; `undeclared` = a
 * prompt holding a bkit rule no carry line names; `empty` = a prompt that carries no rule.
 * Order is checked inside the `**Rules:**` block only.
 */
export function checkCarry(store, corpus) {
    const prompts = corpus.filter((f) => f.surface === "prompt");
    const names = prompts.map((f) => f.name);
    const bkit = parseRuleEntries(store, "Rules");
    const rules = [...bkit, ...parseRuleEntries(store, "Project Rules")];
    const standing = new Map(prompts.map((f) => [f.name, standingLines(f)]));
    const missing = [];
    const undeclared = [];
    const carried = new Set();
    for (const r of rules) {
        const named = new Set(r.carry === undefined ? [] : expandNames(r.carry, names));
        for (const n of named) {
            carried.add(n);
            if (!standing.get(n)?.some((l) => l.text === r.text)) {
                missing.push(`${r.id} \`${r.name}\`: carry \`${n}\` lacks the whole rule bullet`);
            }
        }
        if (!bkit.includes(r))
            continue;
        for (const f of prompts) {
            if (!named.has(f.name) && standing.get(f.name).some((l) => l.text.includes(r.text))) {
                undeclared.push(`${r.id} \`${r.name}\`: \`${f.name}\` holds the rule but no carry line names it`);
            }
        }
    }
    for (const f of prompts) {
        const block = ruleBlock(f.content.split("\n"));
        const order = standing
            .get(f.name)
            .filter((l) => block !== undefined && l.line > block.from && l.line <= block.to)
            .map((l) => rules.findIndex((r) => r.text === l.text))
            .filter((i) => i !== -1);
        if (order.some((v, i) => i > 0 && v < order[i - 1])) {
            missing.push(`\`${f.name}\`: rule copies are out of rules.md order`);
        }
    }
    return { missing, undeclared, empty: names.filter((n) => !carried.has(n)) };
}
/** Rewrite rule copies still in a retired wording, inside each carrying prompt's block. Returns only the files that changed. */
export function syncCarry(store, corpus) {
    const prompts = corpus.filter((f) => f.surface === "prompt");
    const names = prompts.map((f) => f.name);
    const rules = [...parseRuleEntries(store, "Rules"), ...parseRuleEntries(store, "Project Rules")];
    const out = new Map();
    for (const f of prompts) {
        const lines = f.content.split("\n");
        const block = ruleBlock(lines);
        if (!block)
            continue;
        for (const r of rules) {
            if (r.carry === undefined || !expandNames(r.carry, names).includes(f.name))
                continue;
            for (let i = block.from + 1; i < block.to; i++) {
                if (r.retired.some((old) => lines[i] === `- ${old}`))
                    lines[i] = `- ${r.text}`;
            }
        }
        const content = lines.join("\n");
        if (content !== f.content)
            out.set(f.id, content);
    }
    return out;
}
/** Rules and clause texts at least `NEAR_COPY` alike, unless a `- distinct-from:` records the pair. */
export function similarEntries(store) {
    const entries = [];
    for (const heading of ["Rules", "Project Rules"]) {
        for (const r of parseRuleEntries(store, heading)) {
            entries.push({ name: r.name, text: r.text, distinct: new Set(r.distinctFrom) });
        }
    }
    const body = sectionOf(store, "Clauses") ?? "";
    for (const section of body.split(/^### /m).slice(1)) {
        const name = section.slice(0, section.indexOf("\n")).trim();
        const distinct = new Set([...section.matchAll(/^- distinct-from: (.+)$/gm)].flatMap((m) => [...m[1].matchAll(/`([^`]+)`/g)].map((x) => x[1])));
        for (const c of parseClauses(`## Clauses\n### ${section}`)) {
            for (const t of c.texts)
                entries.push({ name, text: t, distinct });
        }
    }
    const out = [];
    const words = entries.map((e) => e.text.split(/\s+/));
    for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
            const [a, b] = [entries[i], entries[j]];
            if (a.name === b.name || a.distinct.has(b.name) || b.distinct.has(a.name))
                continue;
            if (!nearCandidate(words[i], words[j]))
                continue;
            const score = similarity(a.text, b.text);
            if (score >= NEAR_COPY) {
                out.push(`\`${a.name}\` and \`${b.name}\` are ${score.toFixed(2)} alike — reword one, or add \`- distinct-from: \`${a.name}\`\` to \`${b.name}\``);
            }
        }
    }
    return out;
}
/** The store with shared-line carriers and drift line numbers recomputed from the corpus. */
export function syncCoverage(store, corpus) {
    const ix = coverageIndex(store, corpus);
    const lines = store.split("\n");
    for (const e of ix.local) {
        if (e.file !== undefined)
            continue;
        const parts = [];
        for (const surface of COVERED) {
            const holding = new Set(ix.files
                .filter((f) => f.surface === surface && ix.standing.get(f.id).some((s) => s.text === e.text))
                .map((f) => f.name));
            if (holding.size > 0)
                parts.push(`${surface} ${namesSpec(holding, ix.namesOf(surface))}`);
        }
        const at = lines.lastIndexOf(`- carriers: ${e.carriers}`, e.at);
        if (at !== -1 && parts.length > 0)
            lines[at] = `- carriers: ${parts.join("; ")}`;
    }
    const rulesAt = lines.findIndex((l) => l === "## Rules");
    const clausesAt = lines.findIndex((l) => l === "## Clauses");
    for (let i = rulesAt; i !== -1 && i < clausesAt; i++) {
        const item = /^ {2}- (.+)$/.exec(lines[i]);
        if (!item)
            continue;
        const d = parseDriftItem(item[1]);
        if (d.excerpt === undefined)
            continue;
        let line = lines[i];
        for (const c of d.cites) {
            const candidates = citeFiles(ix, c.name);
            if (candidates.some((f) => lineHolds(f, c.line, d.excerpt)))
                continue;
            const hits = candidates.flatMap((f) => f.content
                .split("\n")
                .map((l, n) => (l.includes(d.excerpt) ? n + 1 : 0))
                .filter((n) => n > 0));
            if (hits.length === 1)
                line = line.replace(`\`${c.name}:${c.line}\``, `\`${c.name}:${hits[0]}\``);
        }
        lines[i] = line;
    }
    return lines.join("\n");
}
// ---------------------------------------------------------------------------
// CLI: `pnpm instructions:sync` (write), `pnpm instructions:show {name}` /
// `--file {basename}` (look up), `tsx .bkit/core/engine/tools/instructions.ts` (check)
// ---------------------------------------------------------------------------
export const STORE_PATH = ".bkit/instructions.md";
/** Every `### ` entry of the store named `name`, or whose text names `` `basename` `` / whose clause the file carries. */
export function showEntries(md, files, query) {
    const entries = md.split(/^(?=## |### )/m).filter((e) => e.startsWith("### "));
    const carried = new Set();
    if (query.file !== undefined) {
        const own = files.filter((f) => f.name === query.file);
        for (const c of parseClauses(md)) {
            if (carriersLine(c, own) !== "")
                carried.add(c.name);
        }
    }
    return entries
        .filter((e) => {
        const name = e.slice(4, e.indexOf("\n")).trim();
        if (query.name !== undefined)
            return name === query.name;
        return carried.has(name) || e.includes(`\`${query.file}\``);
    })
        .map((e) => e.trimEnd());
}
function main(argv) {
    const root = process.cwd();
    const storeFile = path.join(root, STORE_PATH);
    let store = fs.readFileSync(storeFile, "utf-8");
    const clauses = parseInstructions(store).clauses;
    let files = loadCorpus(root);
    if (argv.includes("--show")) {
        const at = argv.indexOf("--file");
        const query = at !== -1 ? { file: argv[at + 1] } : { name: argv.find((a) => !a.startsWith("--")) };
        if (query.file === undefined && query.name === undefined) {
            console.error("[bkit-instructions] --show takes {name} or --file {basename}");
            return 2;
        }
        const found = showEntries(store, files, query);
        console.log(found.join("\n\n"));
        return found.length === 0 ? 1 : 0;
    }
    if (argv.includes("--write")) {
        const copied = syncSources(root, store);
        if (copied !== store) {
            fs.writeFileSync(storeFile, copied, "utf-8");
            console.error(`[bkit-instructions] rewrote ${STORE_PATH} copies of their masters`);
            store = copied;
        }
        for (const [id, content] of syncCarry(store, files)) {
            fs.writeFileSync(path.join(root, id), content, "utf-8");
            console.error(`[bkit-instructions] rewrote ${id} rule copies`);
        }
        files = loadCorpus(root);
        const changed = syncClauses(clauses, files);
        for (const [id, content] of changed) {
            fs.writeFileSync(path.join(root, id), content, "utf-8");
            console.error(`[bkit-instructions] rewrote ${id}`);
        }
        files = loadCorpus(root);
        const synced = syncCoverage(syncStore(store, files), files);
        if (synced !== store) {
            fs.writeFileSync(storeFile, synced, "utf-8");
            console.error(`[bkit-instructions] rewrote ${STORE_PATH}`);
            store = synced;
        }
    }
    const findings = [...checkClauses(clauses, files), ...checkBlocks(files)];
    for (const f of findings) {
        console.error(`[bkit-instructions] ${f.file}${f.line ? `:${f.line}` : ""} ${f.clause}: ${f.problem}`);
    }
    const carry = checkCarry(store, files);
    const sourceFindings = [
        ...checkSources(root, store),
        ...checkCoverage(store, files),
        ...similarEntries(store),
        ...carry.missing,
        ...carry.undeclared,
        ...carry.empty.map((n) => `\`${n}\`: carries no rule`),
        ...checkRuleCopies(store, files),
    ];
    for (const f of sourceFindings)
        console.error(`[bkit-instructions] ${STORE_PATH} ${f}`);
    if (sourceFindings.length > 0)
        return 1;
    if (syncStore(store, files) !== store) {
        console.error(`[bkit-instructions] ${STORE_PATH}: carriers stale (run pnpm instructions:sync)`);
        return 1;
    }
    return findings.length === 0 ? 0 : 1;
}
if (process.argv[1] && fs.existsSync(process.argv[1])) {
    if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
        process.exitCode = main(process.argv.slice(2));
    }
}
