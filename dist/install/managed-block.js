// install/managed-block.ts — the `bkit:start` / `bkit:end` managed-block parser.
//
// One implementation for every caller that finds, reads, replaces, or strips the
// part of a shared file bkit owns: install, upgrade, uninstall, preflight, and the
// wording sync. Pure string functions only — file IO and logging stay with the
// caller, so each caller keeps its own log context.
const START_MARKER = "<!-- bkit:start -->";
const END_MARKER = "<!-- bkit:end -->";
const SLASH_START_MARKER = "// bkit:start";
const SLASH_END_MARKER = "// bkit:end";
// Select marker pair based on markerStyle.
export function selectMarkers(markerStyle) {
    return markerStyle === "slash-comment"
        ? [SLASH_START_MARKER, SLASH_END_MARKER]
        : [START_MARKER, END_MARKER];
}
// Recognised line-comment prefixes — bare, shell (#), JS/TS (//).
const ALLOWED_PREFIXES = ["", "# ", "// "];
// Find line-anchored marker positions. A marker is line-anchored when:
//   - The line before the marker is empty, "# ", or "// " (comment prefixes).
//   - The character after the marker is end-of-line or end-of-file.
// Backtick-quoted prose mentions are ignored.
export function findLineAnchoredMarkers(content, marker) {
    const positions = [];
    const len = marker.length;
    let pos = 0;
    while (true) {
        const idx = content.indexOf(marker, pos);
        if (idx === -1)
            break;
        let lineStart = idx;
        while (lineStart > 0 && content[lineStart - 1] !== "\n")
            lineStart--;
        const beforeMarker = content.slice(lineStart, idx);
        const after = idx + len >= content.length ? "\n" : content[idx + len];
        const isLineEnd = after === "\n" || after === undefined;
        if (ALLOWED_PREFIXES.includes(beforeMarker) && isLineEnd)
            positions.push(idx);
        pos = idx + len;
    }
    return positions;
}
// Find the start of the line containing a position.
function lineStartOf(content, idx) {
    let i = idx;
    while (i > 0 && content[i - 1] !== "\n")
        i--;
    return i;
}
// Replace the content between the single marker pair. Markers may be bare (markdown) or
// comment-prefixed (`# ` shell, `// ` JS/TS) — prefixes are preserved. Refuses (with the
// reason) when markers are absent, duplicated, or inverted.
export function replaceManagedBlock(existing, newContent, markerStyle = "html-comment") {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findLineAnchoredMarkers(existing, startMarker);
    const ends = findLineAnchoredMarkers(existing, endMarker);
    if (starts.length === 0 || ends.length === 0)
        return { ok: false, problem: "absent" };
    if (starts.length > 1 || ends.length > 1)
        return { ok: false, problem: "multiple" };
    const startIdx = starts[0];
    const endIdx = ends[0];
    if (startIdx >= endIdx)
        return { ok: false, problem: "inverted" };
    // Slice on line boundaries so any comment prefix on the marker lines is preserved.
    const startLineEnd = existing.indexOf("\n", startIdx + startMarker.length);
    const beforeBlock = startLineEnd === -1
        ? existing.slice(0, startIdx + startMarker.length)
        : existing.slice(0, startLineEnd);
    const afterBlock = existing.slice(lineStartOf(existing, endIdx));
    const normalisedContent = newContent.replace(/^\n+/, "").replace(/\n+$/, "");
    return { ok: true, content: beforeBlock + "\n\n" + normalisedContent + "\n\n" + afterBlock };
}
// Extract the bkit-managed block content from a file, stripping surrounding newlines.
// markerStyle defaults to "html-comment".
// Markers may be bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractManagedBlock(content, markerStyle = "html-comment") {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findLineAnchoredMarkers(content, startMarker);
    const ends = findLineAnchoredMarkers(content, endMarker);
    if (starts.length !== 1 || ends.length !== 1)
        return null;
    if (starts[0] >= ends[0])
        return null;
    const startLineEnd = content.indexOf("\n", starts[0] + startMarker.length);
    const inner = startLineEnd === -1 ? "" : content.slice(startLineEnd + 1, lineStartOf(content, ends[0]));
    return inner.replace(/^\n+/, "").replace(/\n+$/, "");
}
// Extract the FULL bkit-managed block INCLUDING marker lines from a file.
// markerStyle defaults to "html-comment".
// Used to append a fresh block to a destination that has none. Markers may be
// bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractFullManagedBlock(content, markerStyle = "html-comment") {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findLineAnchoredMarkers(content, startMarker);
    const ends = findLineAnchoredMarkers(content, endMarker);
    if (starts.length !== 1 || ends.length !== 1)
        return null;
    if (starts[0] >= ends[0])
        return null;
    const startLineStart = lineStartOf(content, starts[0]);
    const endLineEnd = content.indexOf("\n", ends[0] + endMarker.length);
    return endLineEnd === -1
        ? content.slice(startLineStart)
        : content.slice(startLineStart, endLineEnd + 1);
}
// Detect which marker style a file's managed block uses, or null when it has none.
// Uses the same line-anchored finder as stripManagedBlock, so a detected style is
// always one stripManagedBlock acts on: a marker alone on its line, bare or behind
// a `# ` / `// ` prefix. Labelled, indented, or prose-quoted markers do not count.
export function detectMarkerStyle(content) {
    for (const style of ["html-comment", "slash-comment"]) {
        const [startMarker] = selectMarkers(style);
        if (findLineAnchoredMarkers(content, startMarker).length > 0)
            return style;
    }
    return null;
}
// Remove the bkit-managed block (including marker lines) from a string,
// preserving all consumer-owned content outside the block.
//
// Semantics:
//   - Markers absent  → returns content unchanged (idempotent, safe for re-run)
//   - Duplicated/inverted markers → returns content unchanged (error-safe)
//   - Marker lines and surrounding blank lines are removed along with the block
//
// Uses the line-anchored marker detection (KN-8 lesson: greedy whitespace
// regexes are unsafe — use the anchored parser instead).
export function stripManagedBlock(content, markerStyle = "html-comment") {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findLineAnchoredMarkers(content, startMarker);
    const ends = findLineAnchoredMarkers(content, endMarker);
    // Safety guards: absent, duplicated, or inverted → no-op
    if (starts.length === 0 || ends.length === 0)
        return content;
    if (starts.length > 1 || ends.length > 1)
        return content;
    const startIdx = starts[0];
    const endIdx = ends[0];
    if (startIdx >= endIdx)
        return content;
    // Find start-of-line for the start marker
    let startLineStart = startIdx;
    while (startLineStart > 0 && content[startLineStart - 1] !== "\n")
        startLineStart--;
    // Find end-of-line for the end marker (include trailing newline)
    const endMarkerEnd = endIdx + endMarker.length;
    let blockEnd = endMarkerEnd;
    if (blockEnd < content.length && content[blockEnd] === "\n")
        blockEnd++;
    const before = content.slice(0, startLineStart);
    const after = content.slice(blockEnd);
    // Trim one leading blank line from `after` to avoid double-blank after strip
    const afterTrimmed = after.replace(/^\n/, "");
    // Trim one trailing blank line from `before` to avoid double-blank before strip
    const beforeTrimmed = before.replace(/\n\n$/, "\n");
    return beforeTrimmed + afterTrimmed;
}
