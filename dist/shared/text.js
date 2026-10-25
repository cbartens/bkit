// shared/text.ts — engine output as plain text, and markdown tables that provably keep their data.
//
// `renderText` prints a command's output object as `key: value` lines: arrays of flat
// objects as markdown tables, nested values as indented `key:` blocks. `parseText` reads
// that text back to the value `--json` prints for the same object. Scalars keep their
// type: a string that would read as `null`, a boolean, a number, `[]`, `{}` or a quoted
// string prints inside one pair of double quotes. `markdownTable` escapes `|`,
// backslashes and line breaks, and prints a missing cell as `MISSING`; a literal
// `MISSING` value is escaped, so the two stay distinct. `checkedTable` renders an array
// of flat objects and parses the table back, refusing anything that would not read back
// as the same typed rows.
import { parseJson } from "./json.js";
/** A missing cell. A value equal to it prints escaped as `\—`. */
export const MISSING = "—";
const isScalar = (v) => v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean";
const isRecord = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
/** Escape backslashes and line breaks so a value stays on one line. */
const escapeLine = (s) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
const scalarText = (v) => (v === null ? "null" : String(v));
const NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const LITERALS = new Set(["null", "true", "false", "[]", "{}"]);
const quoted = (s) => s.length >= 2 && s.startsWith('"') && s.endsWith('"');
/** A scalar as typed text: JSON's spelling for non-strings, a string quoted when it would read as one. */
function scalarCode(v) {
    if (typeof v === "number")
        return Number.isFinite(v) ? String(v) : "null";
    if (typeof v !== "string")
        return scalarText(v);
    return v === "" || LITERALS.has(v) || NUMBER.test(v) || quoted(v) ? `"${v}"` : v;
}
/** Typed text back to its scalar. */
function readScalar(text) {
    if (quoted(text))
        return text.slice(1, -1);
    if (text === "null")
        return null;
    if (text === "true" || text === "false")
        return text === "true";
    return NUMBER.test(text) ? Number(text) : text;
}
function escapeCell(cell) {
    if (cell === undefined)
        return MISSING;
    const text = escapeLine(scalarText(cell)).replace(/\|/g, "\\|");
    return text === MISSING ? `\\${MISSING}` : text;
}
const tableLine = (cells) => `| ${cells.join(" | ")} |`;
/** A markdown table as lines, or nothing when there are no rows. Unpadded. */
export function markdownTable(head, rows) {
    if (rows.length === 0)
        return [];
    return [
        tableLine(head.map(escapeCell)),
        tableLine(head.map(() => "---")),
        ...rows.map((r) => tableLine(head.map((_, i) => escapeCell(r[i])))),
    ];
}
/** Split one table line into its raw cells; null when it is not `| … |`. */
function splitLine(line) {
    if (!line.startsWith("| ") || !line.endsWith(" |"))
        return null;
    const body = line.slice(2, -2);
    const cells = [];
    let cell = "";
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (ch === "\\" && i + 1 < body.length) {
            cell += ch + body[i + 1];
            i++;
        }
        else if (ch === "|" && body[i - 1] === " " && body[i + 1] === " ") {
            cells.push(cell.slice(0, -1));
            cell = "";
            i++;
        }
        else {
            cell += ch;
        }
    }
    cells.push(cell);
    return cells;
}
const UNESCAPE = {
    n: "\n",
    r: "\r",
    "\\": "\\",
    "|": "|",
    [MISSING]: MISSING,
};
/** Undo `escapeLine` (plus `\|` and `\—` in a cell); null for a bad escape. */
function unescape(raw, escapes) {
    let out = "";
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch !== "\\") {
            out += ch;
            continue;
        }
        const next = escapes[raw[i + 1] ?? ""];
        if (next === undefined)
            return null;
        out += next;
        i++;
    }
    return out;
}
/** One raw cell back to its value; undefined for a missing cell, null for a bad escape. */
const unescapeCell = (raw) => raw === MISSING ? undefined : unescape(raw, UNESCAPE);
const LINE_ESCAPES = { n: "\n", r: "\r", "\\": "\\" };
/** Parse a table `markdownTable` printed; null when the text is not such a table. */
export function parseMarkdownTable(text) {
    const lines = text.split("\n");
    if (lines.length < 3)
        return null;
    const headCells = splitLine(lines[0]);
    if (!headCells || lines[1] !== tableLine(headCells.map(() => "---")))
        return null;
    const head = [];
    for (const raw of headCells) {
        const name = unescapeCell(raw);
        if (typeof name !== "string")
            return null;
        head.push(name);
    }
    const rows = [];
    for (const line of lines.slice(2)) {
        const cells = splitLine(line);
        if (!cells || cells.length !== head.length)
            return null;
        const row = {};
        for (const [i, raw] of cells.entries()) {
            const value = unescapeCell(raw);
            if (value === null)
                return null;
            if (value !== undefined)
                row[head[i]] = value;
        }
        rows.push(row);
    }
    return { head, rows };
}
/** A `checkedTable` table back to its typed rows; null when it is not such a table. */
function readTable(text) {
    const parsed = parseMarkdownTable(text);
    if (!parsed)
        return null;
    return parsed.rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, readScalar(v)])));
}
/** Why `value` cannot be a table, or the flat rows it holds. */
function flatRows(value) {
    if (!Array.isArray(value))
        return { reason: "not an array" };
    if (value.length === 0)
        return { reason: "empty array" };
    for (const [i, item] of value.entries()) {
        if (!isRecord(item))
            return { reason: `item ${i} is not an object` };
        if (Object.keys(item).length === 0)
            return { reason: `item ${i} has no keys` };
        for (const [key, v] of Object.entries(item)) {
            if (!isScalar(v))
                return { reason: `item ${i} key ${key} is nested` };
        }
    }
    return { rows: value };
}
/**
 * An array of flat objects as a markdown table whose typed parse equals the input rows.
 * Columns are the union of keys in first-seen order. Anything nested, mixed or empty,
 * or a table that would not read back as the same values of the same types, is refused.
 */
export function checkedTable(value) {
    const flat = flatRows(value);
    if ("reason" in flat)
        return { ok: false, reason: flat.reason };
    const head = [...new Set(flat.rows.flatMap((r) => Object.keys(r)))];
    const text = markdownTable(head, flat.rows.map((r) => head.map((k) => (Object.hasOwn(r, k) ? scalarCode(r[k]) : undefined)))).join("\n");
    const parsed = parseMarkdownTable(text);
    const rows = readTable(text);
    if (!parsed || !rows)
        return { ok: false, reason: "table does not parse back" };
    const same = parsed.head.length === head.length &&
        parsed.head.every((h, i) => h === head[i]) &&
        rows.length === flat.rows.length &&
        rows.every((row, i) => {
            const want = flat.rows[i];
            const keys = Object.keys(row);
            return keys.length === Object.keys(want).length && keys.every((k) => row[k] === want[k]);
        });
    return same ? { ok: true, text } : { ok: false, reason: "table parses back to different rows" };
}
// ---------------------------------------------------------------------------
// renderText
// ---------------------------------------------------------------------------
/** A key as printed: JSON-quoted when it would not read back as a plain key. */
const keyText = (key) => key === "" || /[:\n\r\\]/.test(key) || /^[-|"\s]/.test(key) || /\s$/.test(key)
    ? JSON.stringify(key)
    : key;
const scalarLine = (v) => escapeLine(scalarCode(v));
function valueLines(key, value, pad) {
    const head = `${pad}${keyText(key)}:`;
    if (isScalar(value))
        return [`${head} ${scalarLine(value)}`];
    if (Array.isArray(value)) {
        if (value.length === 0)
            return [`${head} []`];
        const table = checkedTable(value);
        if (table.ok)
            return [head, ...table.text.split("\n").map((l) => pad + l)];
        return [head, ...itemLines(value, `${pad}  `)];
    }
    if (isRecord(value)) {
        const inner = objectLines(value, `${pad}  `);
        return inner.length === 0 ? [`${head} {}`] : [head, ...inner];
    }
    return [`${head} ${String(value)}`];
}
function itemLines(items, pad) {
    return items.flatMap((item) => {
        if (item === undefined)
            return [`${pad}- null`];
        if (isScalar(item))
            return [`${pad}- ${scalarLine(item)}`];
        if (Array.isArray(item))
            return item.length === 0 ? [`${pad}- []`] : [`${pad}-`, ...itemLines(item, `${pad}  `)];
        if (isRecord(item)) {
            const inner = objectLines(item, `${pad}  `);
            return inner.length === 0 ? [`${pad}- {}`] : [`${pad}-`, ...inner];
        }
        return [`${pad}- ${String(item)}`];
    });
}
function objectLines(obj, pad) {
    return Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .flatMap(([k, v]) => valueLines(k, v, pad));
}
/** A command's output object as text: one `key: value` line per scalar, blocks for the rest. */
export function renderText(payload) {
    const lines = objectLines(payload, "");
    return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}
/** No value: the text is not something `renderText` printed. */
const BAD = Symbol("bad");
/** The value after `key: `: an empty container or a typed scalar. */
function inlineValue(raw) {
    if (raw === "[]")
        return [];
    if (raw === "{}")
        return {};
    const text = unescape(raw, LINE_ESCAPES);
    return text === null ? BAD : readScalar(text);
}
/** `key:` / `key: value` split into the key and what follows the colon. */
function keyLine(line) {
    if (line.startsWith('"')) {
        const m = /^"(?:[^"\\]|\\.)*"/.exec(line);
        const key = m ? parseJson(m[0]) : { ok: false };
        if (!m || !key.ok || typeof key.value !== "string")
            return null;
        return { key: key.value, rest: line.slice(m[0].length) };
    }
    const colon = line.indexOf(":");
    return colon <= 0 ? null : { key: line.slice(0, colon), rest: line.slice(colon) };
}
const at = (line, pad) => line !== undefined && line.startsWith(pad) && line[pad.length] !== " ";
/** The block under a `key:` line whose key sits at `pad`. */
function readBlock(cur, pad) {
    const next = cur.lines[cur.i];
    if (at(next, pad) && next.startsWith(`${pad}| `)) {
        const table = [];
        while (at(cur.lines[cur.i], pad) && cur.lines[cur.i].startsWith(`${pad}| `))
            table.push(cur.lines[cur.i++].slice(pad.length));
        return readTable(table.join("\n")) ?? BAD;
    }
    const inner = `${pad}  `;
    if (!at(next, inner))
        return BAD;
    return next.slice(inner.length).startsWith("-") ? readList(cur, inner) : readObject(cur, inner);
}
function readObject(cur, pad) {
    const obj = {};
    while (at(cur.lines[cur.i], pad) && !/^[-|]/.test(cur.lines[cur.i].slice(pad.length))) {
        const parsed = keyLine(cur.lines[cur.i++].slice(pad.length));
        if (!parsed)
            return BAD;
        let value;
        if (parsed.rest === ":")
            value = readBlock(cur, pad);
        else if (parsed.rest.startsWith(": "))
            value = inlineValue(parsed.rest.slice(2));
        else
            return BAD;
        if (value === BAD)
            return BAD;
        obj[parsed.key] = value;
    }
    return obj;
}
function readList(cur, pad) {
    const items = [];
    while (at(cur.lines[cur.i], pad) && cur.lines[cur.i].slice(pad.length).startsWith("-")) {
        const rest = cur.lines[cur.i++].slice(pad.length + 1);
        let item;
        if (rest.startsWith(" "))
            item = inlineValue(rest.slice(1));
        else if (rest !== "")
            return BAD;
        else {
            const inner = `${pad}  `;
            const next = cur.lines[cur.i];
            if (!at(next, inner))
                return BAD;
            item = next.slice(inner.length).startsWith("-")
                ? readList(cur, inner)
                : readObject(cur, inner);
        }
        if (item === BAD)
            return BAD;
        items.push(item);
    }
    return items;
}
/**
 * Text `renderText` printed, read back to the value `--json` prints for the same
 * object; null when the text is not such output.
 */
export function parseText(text) {
    const body = text.endsWith("\n") ? text.slice(0, -1) : text;
    const cur = { lines: body === "" ? [] : body.split("\n"), i: 0 };
    const obj = readObject(cur, "");
    return obj === BAD || cur.i !== cur.lines.length ? null : obj;
}
