// install/payload-links.ts — the consumer's `.bkit/core` and `.bkit/shared` view
// links: relative symlinks into the installed package payload (#525), so the
// workflow / prompt / hook sources are browsable from the consumer repo without
// copying. Views, not copies — always the installed version, never hashed.

import * as fs from "node:fs";
import * as path from "node:path";
import { getCoreRoot, getPkgRoot, getSharedRoot } from "../shared/package-roots.js";

// The two view links: a symlink at the consumer-relative `relPath` pointing at the
// package payload dir `target()` resolves to. Relative targets, so the link keeps
// working when the repo moves; both dangle on a fresh clone or in CI (no
// node_modules), which is why the managed `.gitignore` block carries both paths
// and checks/before/files.ts BKIT_GITIGNORE_LINES lists them.
export const PAYLOAD_LINKS: ReadonlyArray<{ relPath: string; target: () => string }> = [
  { relPath: path.join(".bkit", "core"), target: getCoreRoot },
  { relPath: path.join(".bkit", "shared"), target: getSharedRoot },
];

/** The consumer-relative paths above, as a lookup set (version-hash exclusion). */
export const PAYLOAD_LINK_RELPATHS: ReadonlySet<string> = new Set(
  PAYLOAD_LINKS.map((l) => l.relPath),
);

/** What a sync did, per link path. */
export interface PayloadLinkChanges {
  created: string[];
  repaired: string[];
  kept: string[];
  /** Real directory or file at the link path — never clobbered; advisory-worthy. */
  skippedRealDir: string[];
  /** Platform refused the symlink (e.g. Windows without Developer Mode). Advisory, never fatal. */
  failed: string[];
}

/**
 * Create the view link at `linkAbs` pointing at `targetAbs`: a relative `dir`
 * symlink first; where the platform refuses it (Windows without Developer Mode or
 * elevation) fall back to an absolute `junction`, which needs no privilege.
 * `symlinkFn` is injectable so the platform branch is testable off-Windows.
 */
export function createPayloadLink(
  targetAbs: string,
  linkAbs: string,
  symlinkFn: (target: string, link: string, type?: "dir" | "junction") => void = fs.symlinkSync,
): "relative" | "junction" {
  const relTarget = path.relative(path.dirname(linkAbs), targetAbs);
  try {
    symlinkFn(relTarget, linkAbs, "dir");
    return "relative";
  } catch {
    symlinkFn(targetAbs, linkAbs, "junction");
    return "junction";
  }
}

// Create or refresh the consumer's `.bkit/core` + `.bkit/shared` view links into
// the package payload. Idempotent: a correct link is kept, a dangling or
// mis-pointed symlink is re-pointed, a real directory or file is NEVER clobbered
// (skippedRealDir) and a platform refusal is only recorded (failed). Links are
// convenience views, not managed content: they never join the install WriteSet, so
// a missing or broken link is never `bkit check` drift (a fresh clone or worktree
// has none). Dry-run reports what a live run would do and touches nothing. No-op
// in dogfood: there `.bkit/core` IS the package source, never a view onto it.
export function syncPayloadLinks(cwd: string, opts: { dryRun: boolean }): PayloadLinkChanges {
  const changes: PayloadLinkChanges = {
    created: [],
    repaired: [],
    kept: [],
    skippedRealDir: [],
    failed: [],
  };
  if (path.resolve(cwd) === getPkgRoot()) return changes;

  for (const { relPath, target } of PAYLOAD_LINKS) {
    const linkAbs = path.join(cwd, relPath);
    const targetAbs = target();
    if (!fs.existsSync(targetAbs)) {
      changes.failed.push(relPath); // package payload missing — package corrupt?
      continue;
    }

    // lstat, not stat: the symlink itself is what matters, never its target.
    let st: fs.Stats | null = null;
    try {
      st = fs.lstatSync(linkAbs);
    } catch {
      st = null; // absent
    }

    if (st !== null && !st.isSymbolicLink()) {
      changes.skippedRealDir.push(relPath); // consumer content — never clobber
      continue;
    }

    if (st !== null) {
      // A symlink: keep when it already resolves to the payload, re-point otherwise
      // (dangling — realpathSync throws — or pointing somewhere else).
      let resolves = false;
      try {
        resolves = fs.realpathSync(linkAbs) === fs.realpathSync(targetAbs);
      } catch {
        resolves = false;
      }
      if (resolves) {
        changes.kept.push(relPath);
        continue;
      }
      if (!opts.dryRun) fs.rmSync(linkAbs);
    }

    if (!opts.dryRun) {
      fs.mkdirSync(path.dirname(linkAbs), { recursive: true });
      try {
        createPayloadLink(targetAbs, linkAbs);
      } catch {
        changes.failed.push(relPath);
        continue;
      }
    }
    (st !== null ? changes.repaired : changes.created).push(relPath);
  }
  return changes;
}

// The upgrade report for a link sync: one line per created, repaired, skipped or
// failed link. Empty when every link was already correct.
export function formatPayloadLinkChanges(changes: PayloadLinkChanges): string {
  const lines = [
    ...changes.created.map((p) => `  linked:   ${p}`),
    ...changes.repaired.map((p) => `  repaired: ${p}`),
    ...changes.skippedRealDir.map(
      (p) =>
        `  skipped:  ${p} — a real directory or file, never overwritten; remove it yourself to get the view link`,
    ),
    ...changes.failed.map(
      (p) =>
        `  failed:   ${p} — platform refused the symlink (browse-only; bkit reads its payload from the package regardless)`,
    ),
  ];
  if (lines.length === 0) return "";
  return [
    "Payload view links — `.bkit/core` + `.bkit/shared` point into the installed package (gitignored, browse-only):",
    ...lines,
  ].join("\n");
}
