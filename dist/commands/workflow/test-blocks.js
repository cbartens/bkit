// Where one named test sits in its file, and which of the file's other lines it runs —
// read from indentation alone, with no parser for any language, so `tests green` can
// tell an edit to a planned test from an edit elsewhere in the same file.
//
// A block is a line plus every following line indented deeper, plus a closing line at
// its own indent (`}`, `)`, `]`, `end`), and the deeper lines after that line when it
// opens again (`} else {`, `): T {`). A test's block starts at the line declaring it
// (`declaredName`). What a test runs: its own block, the lines of the blocks around it,
// and each item in those scopes that is not a test — a hook or bare statement always, a
// declaration only when the test, or code it runs, names it. Pure text in, no fs.
/** A test declaration's name on `line`, or null when the line declares no test. */
export function declaredName(line) {
    const call = /\b(?:it|test|suite|describe|context|bench)(?:\.[a-z]+)*\s*\(\s*(["'`])(.+?)\1/.exec(line);
    if (call !== null)
        return call[2];
    const go = /\bfunc\s+(Test\w+)\s*\(/.exec(line);
    if (go !== null)
        return go[1];
    const py = /\bdef\s+(test_\w+)\s*\(/.exec(line);
    if (py !== null)
        return py[1];
    if (/@Test\b/.test(line)) {
        const java = /\b(?:void|fun)\s+(\w+)\s*\(/.exec(line);
        return java?.[1] ?? line.trim();
    }
    return null;
}
/** A test call whose name is on the next line: `it(` alone, as a formatter wraps a long name. */
const WRAPPED_CALL = /\b(?:it|test|suite|describe|context|bench)(?:\.[a-z]+)*\s*\(\s*$/;
const CLOSER = /^\s*(?:[}\])]|end\b)/;
const REOPENS = /(?:[{([]|\bdo)\s*$/;
const QUOTED = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
const WORD = /[A-Za-z_$][\w$]*/g;
const IMPORT = /^\s*(?:import|from|use|using|require|include)\b|\brequire\s*\(/;
const IMPORT_WORDS = new Set([
    "import",
    "from",
    "as",
    "type",
    "use",
    "using",
    "require",
    "include",
]);
const DECLARED = /\b(?:function\*?|def|fn|func|class|interface|type|enum|struct|trait|module|const|let|var|val)\s+(?:\([^)]*\)\s*)?([A-Za-z_$][\w$]*)/;
const ASSIGNED = /^\s*(?:export\s+)?([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=(?![=>])/;
const blank = (line) => line.trim() === "";
const indent = (line) => /^\s*/.exec(line)[0].length;
/** The test name the block starting at `i` declares, its wrapped name included. */
function openerName(lines, i) {
    const own = declaredName(lines[i]);
    if (own !== null || !WRAPPED_CALL.test(lines[i]))
        return own;
    const next = lines.slice(i + 1).find((l) => !blank(l));
    return next === undefined ? null : declaredName(`${lines[i].trimEnd()}${next.trim()}`);
}
/** 0-based last line of the block starting at `start`. */
function blockEnd(lines, start) {
    const own = indent(lines[start]);
    let end = start;
    let i = start + 1;
    for (;;) {
        while (i < lines.length && (blank(lines[i]) || indent(lines[i]) > own)) {
            if (!blank(lines[i]))
                end = i;
            i++;
        }
        if (i >= lines.length || indent(lines[i]) !== own || !CLOSER.test(lines[i]))
            return end;
        end = i++;
        if (!REOPENS.test(lines[end]))
            return end;
    }
}
/** The blocks enclosing line `t`, innermost first, as their start lines. */
function ancestors(lines, t) {
    const out = [];
    let cur = t;
    for (let i = t - 1; i >= 0; i--) {
        if (blank(lines[i]) || indent(lines[i]) >= indent(lines[cur]))
            continue;
        if (blockEnd(lines, i) < t)
            continue;
        out.push(i);
        cur = i;
    }
    return out;
}
/** The start lines of the items directly inside the block at `scope` (-1: the whole file). */
function items(lines, scope) {
    const own = scope === -1 ? -1 : indent(lines[scope]);
    const last = scope === -1 ? lines.length - 1 : blockEnd(lines, scope);
    const out = [];
    for (let i = scope + 1; i <= last; i++) {
        if (blank(lines[i]) || indent(lines[i]) <= own)
            continue;
        out.push(i);
        i = blockEnd(lines, i);
    }
    return out;
}
/** The names a declaration or import line binds; empty for a hook, call or bare statement. */
function declaredNames(line) {
    if (IMPORT.test(line))
        return (line.replace(QUOTED, "").match(WORD) ?? []).filter((w) => !IMPORT_WORDS.has(w));
    const name = DECLARED.exec(line)?.[1] ?? ASSIGNED.exec(line)?.[1];
    return name === undefined ? [] : [name];
}
/** The 0-based start of the one block declaring `want`, or null when none or several do. */
function findTest(lines, want) {
    const hits = [];
    for (let i = 0; i < lines.length; i++) {
        const name = openerName(lines, i);
        if (name !== null && (name === want || want.endsWith(` ${name}`)))
            hits.push({ at: i, name });
    }
    const exact = hits.filter((h) => h.name === want);
    let pick = exact.length > 0 ? exact : hits;
    if (pick.length > 1)
        pick = pick.filter((h) => ancestors(lines, h.at).every((a) => {
            const outer = openerName(lines, a);
            return outer === null || want.includes(outer);
        }));
    return pick.length === 1 ? pick[0].at : null;
}
function sideOf(text, want) {
    const lines = text.split(/\r?\n/);
    const start = findTest(lines, want);
    if (start === null)
        return null;
    const end = blockEnd(lines, start);
    const scopes = ancestors(lines, start);
    const words = (from, to) => lines
        .slice(from, to + 1)
        .join("\n")
        .match(WORD) ?? [];
    const reachable = new Set(words(start, end));
    const around = new Map([...scopes, -1]
        .flatMap((s) => items(lines, s))
        .filter((i) => i !== start && !scopes.includes(i))
        .map((i) => [
        i,
        {
            end: blockEnd(lines, i),
            runs: false,
            test: openerName(lines, i) !== null,
            names: declaredNames(lines[i]),
        },
    ]));
    // A hook or bare statement runs; a declaration runs once the test or code it runs names it.
    for (let grew = true; grew;) {
        grew = false;
        for (const [i, item] of around) {
            if (item.runs || item.test)
                continue;
            if (item.names.length > 0 && !item.names.some((n) => reachable.has(n)))
                continue;
            item.runs = true;
            grew = true;
            for (const w of words(i, item.end))
                reachable.add(w);
        }
    }
    return { lines, start, end, scopes, around };
}
/** The 1-based lines a `git diff -U0` removes from its old file and adds to its new one. */
export function diffLines(diff) {
    const removed = [];
    const added = [];
    for (const m of diff.matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)) {
        const span = (at, n) => Array.from({ length: n === undefined ? 1 : Number(n) }, (_, k) => Number(at) + k);
        removed.push(...span(m[1], m[2]));
        added.push(...span(m[3], m[4]));
    }
    return { removed, added };
}
/**
 * How the test `want` changed from `before` to `after`, given the 1-based lines a diff
 * removes from `before` and adds to `after`. Null when either copy does not declare the
 * test in exactly one block: the caller then judges the whole file.
 */
export function testChange(before, after, want, changed) {
    const old = sideOf(before, want);
    const now = sideOf(after, want);
    if (old === null || now === null)
        return null;
    const body = (s) => {
        const base = indent(s.lines[s.start]);
        return s.lines
            .slice(s.start, s.end + 1)
            .filter((l) => !blank(l))
            .map((l) => l.slice(Math.min(base, indent(l))).trimEnd())
            .join("\n");
    };
    const runs = new Set();
    const judge = (s, line) => {
        const at = line - 1;
        if (at < 0 || at >= s.lines.length || blank(s.lines[at]))
            return;
        if (at >= s.start && at <= s.end)
            return;
        for (const [i, item] of s.around)
            if (at >= i && at <= item.end) {
                if (item.runs)
                    runs.add(s.lines[i].trim());
                return;
            }
        // In no item: a line of a block around the test itself (its opener, a closer).
        const scope = s.scopes.find((a) => a <= at && at <= blockEnd(s.lines, a));
        if (scope !== undefined)
            runs.add(s.lines[scope].trim());
    };
    for (const line of changed.removed)
        judge(old, line);
    for (const line of changed.added)
        judge(now, line);
    return { body: body(old) !== body(now), runs: [...runs] };
}
