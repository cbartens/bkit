// render/trackers.ts — resolve tracker-specific blocks in workflow and prompt source
// files at install time. Consumed by install/modules/index.ts when the host-pass mirrors
// `.bkit/workflows/bkit-*.md` to host commands and `.bkit/prompts/bkit-*.md` to
// host agents.
//
// Inline model (no trackers.md substitution): every tracker call site carries one
// variant per tracker inline as a consecutive group, in the fixed order `github`,
// `linear`, `jira`. The installer keeps the block matching the chosen tracker and
// drops the others. Two boolean
// conditional dialects gate tracker-agnostic content:
//
//   <!-- bkit:tracker true  start/end -->  kept when a tracker IS connected; removed under none
//   <!-- bkit:tracker false start/end -->  kept ONLY under none; removed when wired
//
// Under `none` a group collapses to its trailing `false` block if present (the
// substantive no-tracker behaviour — e.g. `issue-id-extraction`, `fid-format`,
// `pr-body-marker`), otherwise to one generic skip message. There is no separate
// `none` marker — no-tracker content is always `false`.
//
// See `.bkit/trackers.md` for the marker contract.
// ---------------------------------------------------------------------------
// Markers
// ---------------------------------------------------------------------------
/** Generic message rendered in place of a tracker group when no tracker is wired. */
const NONE_STUB = "_No tracker connected, skip step._";
/**
 * Marker regex source. An optional `# ` prefix belongs to the marker: inside YAML
 * frontmatter a marker line is written as a YAML comment
 * (`  # <!-- bkit:tracker github start -->`) so the raw source stays valid YAML
 * for tools that parse it unresolved (vale). The prefix is consumed with the marker.
 */
function marker(name, edge) {
    return `(?:#[ \\t]*)?<!--\\s*bkit:tracker\\s+${name}\\s+${edge}\\s*-->`;
}
/** `start` marker, captured body, `end` marker. */
function block(name) {
    return `${marker(name, "start")}([\\s\\S]*?)${marker(name, "end")}`;
}
/**
 * Per-tracker group: consecutive `github` → `linear` → `jira` blocks, each
 * `<!-- bkit:tracker {name} start -->` … `<!-- bkit:tracker {name} end -->`,
 * with an OPTIONAL trailing `false` block. The `jira` block is optional to the
 * match: a group without one resolves for github, linear and none, and is left
 * whole under jira so its markers surface as orphans. The whitespace BEFORE each
 * optional block lives INSIDE its optional group (`(?:\s*<false>)?`), so when no
 * block follows, the trailing newline + indent are left untouched — otherwise
 * content immediately after the group would jam onto the kept body. A
 * list-number prefix (`3. `) precedes the first marker and is left untouched, so
 * the kept body / none stub attaches to it cleanly.
 *
 * `none` resolution: if a trailing `false` block is present (substantive
 * no-tracker behaviour — e.g. `issue-id-extraction`, `fid-format`,
 * `pr-body-marker`), use its body; otherwise emit the generic skip message.
 * (Standalone `false` blocks not attached to a pair are handled in pass 2.)
 */
const GROUP_RE = new RegExp(block("github") +
    "\\s*" +
    block("linear") +
    "(?:\\s*" +
    block("jira") +
    ")?(?:\\s*" +
    block("false") +
    ")?", "g");
/** Conditional-keep block, KEEP form (markers stripped, content trimmed in place). */
function condKeepRe(name) {
    return new RegExp(block(name), "g");
}
/** Conditional-keep block, REMOVE form (consumes the leading newline + indent). */
function condDropRe(name) {
    return new RegExp(`\\n?[ \\t]*${block(name)}`, "g");
}
// Any tracker marker surviving resolution is an orphan (an incomplete group, or
// unbalanced true/false).
const ORPHAN_RE = new RegExp(marker("(github|linear|jira|true|false)", "(?:start|end)"), "g");
/**
 * When keeping in-place content, drop the newline (and its indentation)
 * immediately after `start -->` and immediately before the `end` marker, so the
 * kept content attaches to the pre-marker indentation cleanly instead of gaining
 * a blank line / double indent. Author markers at the same indent as their
 * content for aligned output.
 */
function trimKeptContent(s) {
    return s.replace(/^\r?\n[ \t]*/, "").replace(/\r?\n[ \t]*$/, "");
}
// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------
/**
 * Resolve tracker blocks in a workflow source file for the chosen tracker.
 *
 * Pass 1 collapses each tracker group to the chosen tracker's body, or — for
 * `none` — to the generic skip message. Pass 2 resolves the `true`/`false`
 * conditional blocks (kept when their condition matches the chosen tracker,
 * removed otherwise) — run AFTER pass 1 so groups nested inside a kept conditional
 * are resolved first. Mirror output is clean — no markers remain.
 *
 * Always operates on workflow SOURCE (which has markers). Mirror output is
 * regenerated from source each install.
 */
export function substituteWorkflow(workflowContent, tracker) {
    const wired = tracker !== "none";
    // Pass 1: tracker groups → chosen tracker's body; none → the group's trailing
    // `false` block if present, else the generic skip message.
    let pairs = 0;
    let output = workflowContent.replace(GROUP_RE, (match, gh, ln, jira, falseBody) => {
        if (tracker === "jira" && jira === undefined)
            return match;
        pairs++;
        if (tracker === "github")
            return trimKeptContent(gh);
        if (tracker === "linear")
            return trimKeptContent(ln);
        if (tracker === "jira")
            return trimKeptContent(jira);
        return falseBody !== undefined ? trimKeptContent(falseBody) : NONE_STUB;
    });
    // Pass 2: standalone conditional `true`/`false` blocks (any `false` attached to
    // a group was already consumed in pass 1).
    let conditionals = 0;
    for (const name of ["true", "false"]) {
        const active = name === "true" ? wired : !wired;
        if (active) {
            output = output.replace(condKeepRe(name), (_m, content) => {
                conditionals++;
                return trimKeptContent(content);
            });
        }
        else {
            output = output.replace(condDropRe(name), () => {
                conditionals++;
                return "";
            });
        }
    }
    return { output, pairs, conditionals, orphans: findOrphanMarkers(output) };
}
/**
 * Find tracker markers that didn't participate in a successful resolution — a
 * block outside a complete group, a group lacking the chosen tracker, or an unbalanced
 * true/false pair.
 */
function findOrphanMarkers(content) {
    const orphans = [];
    ORPHAN_RE.lastIndex = 0;
    let m;
    while ((m = ORPHAN_RE.exec(content)) !== null)
        orphans.push(m[1]);
    return orphans;
}
