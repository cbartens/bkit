// bkit-trackers.ts — resolve tracker-specific blocks in workflow and prompt source
// files at install time. Consumed by bkit-modules.ts when the host-pass mirrors
// `.bkit/workflows/bkit-*.md` to host commands and `.bkit/prompts/bkit-*.md` to
// host agents.
//
// Inline model (no trackers.md substitution): every tracker call site carries the
// `github` and `linear` variants inline as a consecutive pair. The installer keeps
// the block matching the chosen tracker and drops the other. Two boolean
// conditional dialects gate tracker-agnostic content:
//
//   <!-- bkit:tracker true  start/end -->  kept when a tracker IS connected; removed under none
//   <!-- bkit:tracker false start/end -->  kept ONLY under none; removed when wired
//
// Under `none` a pair collapses to its trailing `false` block if present (the
// substantive no-tracker behaviour — e.g. `issue-id-extraction`, `fid-format`,
// `pr-body-marker`), otherwise to one generic skip message. There is no separate
// `none` marker — no-tracker content is always `false`.
//
// See `.bkit/trackers.md` for the marker contract.

import type { IssueTracker } from "./bkit-manifest.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubstituteResult {
  /** Workflow content with tracker blocks resolved for the chosen tracker. */
  output: string;
  /** Number of github/linear pairs resolved (to a body or the none stub). */
  pairs: number;
  /** Number of `true`/`false` conditional blocks resolved (kept or removed). */
  conditionals: number;
  /** Orphan markers left after resolution (malformed/incomplete blocks). */
  orphans: string[];
}

// ---------------------------------------------------------------------------
// Markers
// ---------------------------------------------------------------------------

/** Generic message rendered in place of a github/linear pair when no tracker is wired. */
const NONE_STUB = "_No tracker connected, skip step._";

/**
 * Per-tracker group: a consecutive `github` → `linear` pair, each
 * `<!-- bkit:tracker {name} start -->` … `<!-- bkit:tracker {name} end -->`,
 * with an OPTIONAL trailing `false` block. The whitespace BEFORE the optional
 * `false` block lives INSIDE the optional group (`(?:\s*<false>)?`), so when no
 * `false` follows the pair, the trailing newline + indent are left untouched —
 * otherwise content immediately after the pair would jam onto the kept body. A
 * list-number prefix (`3. `) precedes the first marker and is left untouched, so
 * the kept body / none stub attaches to it cleanly.
 *
 * `none` resolution: if a trailing `false` block is present (substantive
 * no-tracker behaviour — e.g. `issue-id-extraction`, `fid-format`,
 * `pr-body-marker`), use its body; otherwise emit the generic skip message.
 * (Standalone `false` blocks not attached to a pair are handled in pass 2.)
 */
const PAIR_RE = new RegExp(
  /<!--\s*bkit:tracker\s+github\s+start\s*-->([\s\S]*?)<!--\s*bkit:tracker\s+github\s+end\s*-->/
    .source +
    "\\s*" +
    /<!--\s*bkit:tracker\s+linear\s+start\s*-->([\s\S]*?)<!--\s*bkit:tracker\s+linear\s+end\s*-->/
      .source +
    "(?:\\s*" +
    /<!--\s*bkit:tracker\s+false\s+start\s*-->([\s\S]*?)<!--\s*bkit:tracker\s+false\s+end\s*-->/
      .source +
    ")?",
  "g",
);

/** Conditional-keep block, KEEP form (markers stripped, content trimmed in place). */
function condKeepRe(name: "true" | "false"): RegExp {
  return new RegExp(
    `<!--\\s*bkit:tracker\\s+${name}\\s+start\\s*-->([\\s\\S]*?)<!--\\s*bkit:tracker\\s+${name}\\s+end\\s*-->`,
    "g",
  );
}
/** Conditional-keep block, REMOVE form (consumes the leading newline + indent). */
function condDropRe(name: "true" | "false"): RegExp {
  return new RegExp(
    `\\n?[ \\t]*<!--\\s*bkit:tracker\\s+${name}\\s+start\\s*-->[\\s\\S]*?<!--\\s*bkit:tracker\\s+${name}\\s+end\\s*-->`,
    "g",
  );
}

// Any tracker marker surviving resolution is an orphan (lone github/linear, or
// unbalanced true/false).
const ORPHAN_RE = /<!--\s*bkit:tracker\s+(github|linear|true|false)\s+(?:start|end)\s*-->/g;

/**
 * When keeping in-place content, drop the newline (and its indentation)
 * immediately after `start -->` and immediately before the `end` marker, so the
 * kept content attaches to the pre-marker indentation cleanly instead of gaining
 * a blank line / double indent. Author markers at the same indent as their
 * content for aligned output.
 */
function trimKeptContent(s: string): string {
  return s.replace(/^\r?\n[ \t]*/, "").replace(/\r?\n[ \t]*$/, "");
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Resolve tracker blocks in a workflow source file for the chosen tracker.
 *
 * Pass 1 collapses each github/linear pair to the chosen tracker's body, or — for
 * `none` — to the generic skip message. Pass 2 resolves the `true`/`false`
 * conditional blocks (kept when their condition matches the chosen tracker,
 * removed otherwise) — run AFTER pass 1 so pairs nested inside a kept conditional
 * are resolved first. Mirror output is clean — no markers remain.
 *
 * Always operates on workflow SOURCE (which has markers). Mirror output is
 * regenerated from source each install.
 */
export function substituteWorkflow(
  workflowContent: string,
  tracker: IssueTracker,
): SubstituteResult {
  const wired = tracker !== "none";

  // Pass 1: github/linear pairs → chosen tracker's body; none → the pair's
  // trailing `false` block if present, else the generic skip message.
  let pairs = 0;
  let output = workflowContent.replace(
    PAIR_RE,
    (_match, gh: string, ln: string, falseBody: string | undefined) => {
      pairs++;
      if (tracker === "github") return trimKeptContent(gh);
      if (tracker === "linear") return trimKeptContent(ln);
      return falseBody !== undefined ? trimKeptContent(falseBody) : NONE_STUB;
    },
  );

  // Pass 2: standalone conditional `true`/`false` blocks (any `false` attached to
  // a pair was already consumed in pass 1).
  let conditionals = 0;
  for (const name of ["true", "false"] as const) {
    const active = name === "true" ? wired : !wired;
    if (active) {
      output = output.replace(condKeepRe(name), (_m, content: string) => {
        conditionals++;
        return trimKeptContent(content);
      });
    } else {
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
 * lone github/linear block (not part of a complete pair) or an unbalanced
 * true/false pair.
 */
function findOrphanMarkers(content: string): string[] {
  const orphans: string[] = [];
  ORPHAN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ORPHAN_RE.exec(content)) !== null) orphans.push(m[1]);
  return orphans;
}
