// bkit-trackers.ts — parse `.agents/trackers.md` + substitute snippets into
// workflow source files at install time. Consumed by bkit-install.ts when the
// host-pass mirrors `.agents/workflows/bkit-*.md` to `.claude/commands/` and
// `.cursor/commands/`.
//
// See `.agents/trackers.md` for the substitution contract (marker pair format,
// snippet ID inventory).

import * as fs from "node:fs";
import * as path from "node:path";
import { ISSUE_TRACKERS, type IssueTracker } from "./bkit-manifest.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Snippet ID → body (markdown lines, trimmed of leading/trailing blanks). */
export type SnippetMap = Map<string, string>;

/** Tracker name → snippet map. */
export type TrackersMap = Map<IssueTracker, SnippetMap>;

export interface SubstituteResult {
  /** Workflow content with marker pairs replaced by snippet bodies. */
  output: string;
  /** Number of marker pairs successfully substituted. */
  substitutions: number;
  /** Snippet IDs referenced in the workflow but missing from the tracker. */
  missing: string[];
  /** Orphan markers (start without matching end, or end without start). */
  orphans: string[];
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

const H2_RE = /^## (.+?)\s*$/;
const H3_RE = /^### (.+?)\s*$/;
const SNIPPET_ID_RE = /^[a-z0-9-]+$/;

/**
 * Parse `.agents/trackers.md` content into Tracker → SnippetID → body.
 *
 * Recognises:
 *   - H2 (`## github`, `## linear`, `## none`) — tracker section start. Other
 *     H2 names (e.g. `## Substitution contract`) are ignored as preamble.
 *   - H3 (`### rule-block`, `### issue-id-extraction`, ...) — snippet boundaries
 *     within the current tracker section.
 *   - Horizontal rule (`---`) and trailing blank lines are stripped from
 *     snippet bodies during flush.
 *
 * Tracker names must be members of `ISSUE_TRACKERS`. Snippet IDs must be
 * kebab-case-lowercase (matches `^[a-z0-9-]+$`).
 */
export function parseTrackersMd(content: string): TrackersMap {
  const trackers: TrackersMap = new Map();
  const lines = content.split("\n");

  let currentTracker: IssueTracker | null = null;
  let currentSnippet: string | null = null;
  let buffer: string[] = [];

  const flush = (): void => {
    if (currentTracker !== null && currentSnippet !== null) {
      const trimmed = trimSnippetBody(buffer);
      let map = trackers.get(currentTracker);
      if (!map) {
        map = new Map();
        trackers.set(currentTracker, map);
      }
      map.set(currentSnippet, trimmed);
    }
    buffer = [];
  };

  for (const line of lines) {
    const h2 = H2_RE.exec(line);
    if (h2) {
      flush();
      currentSnippet = null;
      const name = h2[1].trim();
      currentTracker = (ISSUE_TRACKERS as readonly string[]).includes(name)
        ? (name as IssueTracker)
        : null;
      continue;
    }

    const h3 = H3_RE.exec(line);
    if (h3 && currentTracker !== null) {
      flush();
      const id = h3[1].trim();
      currentSnippet = SNIPPET_ID_RE.test(id) ? id : null;
      continue;
    }

    if (currentSnippet !== null) buffer.push(line);
  }
  flush();

  return trackers;
}

function trimSnippetBody(buffer: readonly string[]): string {
  const lines = [...buffer];
  // Strip leading blank lines
  while (lines.length > 0 && lines[0].trim() === "") lines.shift();
  // Strip trailing blank + horizontal-rule lines (section separators)
  while (
    lines.length > 0 &&
    (lines[lines.length - 1].trim() === "" || lines[lines.length - 1].trim() === "---")
  ) {
    lines.pop();
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Substitution
// ---------------------------------------------------------------------------

/**
 * Matches `<!-- bkit:tracker {snippet-id} start -->` … `<!-- bkit:tracker {snippet-id} end -->`
 * pairs across multiple lines. Lazy match between start and end. Backreference
 * ensures the end marker's snippet ID matches the start marker's.
 */
const MARKER_PAIR_RE =
  /<!--\s*bkit:tracker\s+([a-z0-9-]+)\s+start\s*-->([\s\S]*?)<!--\s*bkit:tracker\s+\1\s+end\s*-->/g;

const ORPHAN_START_RE = /<!--\s*bkit:tracker\s+([a-z0-9-]+)\s+start\s*-->/g;
const ORPHAN_END_RE = /<!--\s*bkit:tracker\s+([a-z0-9-]+)\s+end\s*-->/g;

/**
 * Substitute marker pairs in a workflow source file with snippet bodies from
 * the chosen tracker.
 *
 * Replaces both the markers AND the content between them with the snippet
 * body. Mirror output (`.claude/commands/bkit-*.md`) is clean — no markers
 * remain after substitution.
 *
 * Re-substitution: always operates on workflow SOURCE (which has markers).
 * Mirror output is regenerated from source each install.
 */
export function substituteWorkflow(
  workflowContent: string,
  tracker: IssueTracker,
  trackers: TrackersMap,
): SubstituteResult {
  const snippets = trackers.get(tracker);
  if (!snippets) {
    throw new Error(
      `Tracker '${tracker}' not found in .agents/trackers.md — expected one of: ${ISSUE_TRACKERS.join(", ")}`,
    );
  }

  const missing: string[] = [];
  let substitutions = 0;

  const output = workflowContent.replace(MARKER_PAIR_RE, (_match, snippetId: string) => {
    const body = snippets.get(snippetId);
    if (body === undefined) {
      missing.push(snippetId);
      return `<!-- bkit:tracker ${snippetId} MISSING in tracker '${tracker}' -->`;
    }
    substitutions++;
    return body;
  });

  const orphans = findOrphanMarkers(output);

  return { output, substitutions, missing, orphans };
}

/**
 * Find marker tokens that didn't participate in a successful pair substitution.
 * Operates on the OUTPUT (post-substitution) — any remaining `start` or `end`
 * marker is an orphan since paired markers were already consumed.
 */
function findOrphanMarkers(content: string): string[] {
  const orphans: string[] = [];
  ORPHAN_START_RE.lastIndex = 0;
  ORPHAN_END_RE.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = ORPHAN_START_RE.exec(content)) !== null) {
    orphans.push(`start:${m[1]}`);
  }
  while ((m = ORPHAN_END_RE.exec(content)) !== null) {
    orphans.push(`end:${m[1]}`);
  }
  return orphans;
}

// ---------------------------------------------------------------------------
// Loader (convenience)
// ---------------------------------------------------------------------------

/**
 * Load + parse `.agents/trackers.md` from a package root.
 * `pkgRoot` is the bkit package root (in dogfood, the bkit repo root; in
 * consumers, the resolved `node_modules/bkit/` location).
 */
export function loadTrackers(pkgRoot: string): TrackersMap {
  const trackersPath = path.join(pkgRoot, ".agents", "trackers.md");
  if (!fs.existsSync(trackersPath)) {
    throw new Error(`.agents/trackers.md not found at ${trackersPath}`);
  }
  return parseTrackersMd(fs.readFileSync(trackersPath, "utf-8"));
}
