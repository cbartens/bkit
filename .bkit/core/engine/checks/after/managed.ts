// checks/after/managed.ts — bkit-managed files: stale managed-version markers and missing
// owned hook files.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import type { PreflightFinding } from "../before/index.js";
import type { ModuleFlag } from "../../cli.js";
import { getModuleManifest } from "../../install/manifest.js";
import { readManagedVersion } from "../../install/version-file.js";
import { getPkgRoot } from "../../shared/package-roots.js";
import {
  detectMarkerStyle,
  findLineAnchoredMarkers,
  selectMarkers,
} from "../../install/managed-block.js";
import { listStampedFiles } from "../../install/modules/index.js";

// ---------------------------------------------------------------------------
// detectManagedStale — managed-version marker gate over every stamped file
// ---------------------------------------------------------------------------

/**
 * Best-effort read of the installing bkit version from the package root.
 * Mirrors getInstallingVersion (commands/install/install.ts) / readInstallingVersion
 * (install/modules/index.ts); kept local to avoid a postinstall → install/modules import.
 */
function readPkgVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(getPkgRoot(), "package.json"), "utf-8")) as {
      version?: string;
    };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

// ---------------------------------------------------------------------------
// Branch-scoped severity for the stale gates
//
// The gate is a hard BLOCKER on the integration + release branches (`main`/`dev`)
// and a non-blocking ADVISORY everywhere else (still shown in the checklist). A PR
// INTO main/dev re-asserts the blocker (via GITHUB_BASE_REF).
// ---------------------------------------------------------------------------

/** Branches where a stale managed-version marker is a hard blocker, not a warning. */
const PROTECTED_BRANCHES = new Set(["main", "dev"]);

/**
 * Resolve the branch the check is effectively gating, preferring the CI signal:
 *   1. `GITHUB_BASE_REF` — set on `pull_request` events to the MERGE TARGET. A PR
 *      into main/dev must hard-block, so the target wins over the source branch.
 *   2. `GITHUB_REF_NAME` — set on `push` events to the pushed branch.
 *   3. Local `git rev-parse --abbrev-ref HEAD` — the checked-out branch.
 * Returns null when undeterminable (detached HEAD, no git, no CI env).
 */
function currentBranch(cwd: string): string | null {
  const base = process.env.GITHUB_BASE_REF?.trim();
  if (base) return base;
  const refName = process.env.GITHUB_REF_NAME?.trim();
  if (refName) return refName;
  // spawnSync (not execFileSync) so a missing git / non-repo is a non-zero status,
  // not a thrown error needing a swallowing catch — null then means "undeterminable".
  const r = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const b = r.status === 0 && r.stdout ? r.stdout.trim() : "";
  return b && b !== "HEAD" ? b : null;
}

/**
 * True when the stale gates should hard-block here (on `main`/`dev`, or a PR
 * targeting them). Fail-safe: an undeterminable branch is treated as protected.
 * Exported for deterministic unit testing.
 */
export function isOnProtectedBranch(cwd: string = process.cwd()): boolean {
  const b = currentBranch(cwd);
  if (b === null) return true; // undeterminable → fail safe to blocker
  return PROTECTED_BRANCHES.has(b);
}

/**
 * Version of the managed-version marker inside a file's first `bkit:start`…`bkit:end`
 * block, in whichever marker style the file uses (`<!-- -->`, `# <!-- -->`, `//`).
 * Markers count only on their own line, so prose quoting them is skipped; only a
 * full-line marker counts, so an inline example (`vX.Y.Z` in architecture.md) is never
 * read as the stamp. `undefined` when the file has no block, null when the block has no
 * marker.
 */
export function readManagedBlockVersion(content: string): string | null | undefined {
  const style = detectMarkerStyle(content);
  if (style === null) return undefined;
  const [startMarker, endMarker] = selectMarkers(style);
  const startIdx = findLineAnchoredMarkers(content, startMarker)[0]!;
  const endIdx = findLineAnchoredMarkers(content, endMarker).find((i) => i > startIdx);
  const region =
    endIdx === undefined
      ? content.slice(startIdx)
      : content.slice(startIdx, endIdx + endMarker.length);
  return readManagedVersion(region);
}

/**
 * Stale managed-version marker on any file bkit writes (listStampedFiles): the rendered
 * agents / commands / skills, the managed blocks (AGENTS.md, CLAUDE.md, `.agents/*.md`,
 * `docs/*.md`, `.gitignore`, the hooks, …) and the whole files bkit owns (`.bkit/*.md`,
 * `.bkit/.env.example`). A marker that differs from the installing
 * bkit version means the consumer bumped the package without re-rendering, or hand-edited
 * a managed region and dropped the marker.
 *
 * Runs in Phase 3:
 *   - `bkit check` (dry-run) writes nothing, so on-disk markers keep their stale value →
 *     this fires → check exits 1 on main/dev.
 *   - real `install` / `upgrade` re-stamp in Phase 2, before this runs → no finding.
 *   - `bkit doctor` replays Phase 3 read-only → surfaces it without exiting.
 *
 * A block-scoped file without a bkit block is the consumer's (they dropped the block, or
 * never had bkit's) and is skipped; a whole file without a marker is stale. Files absent
 * on disk are skipped. A dev tree without a readable package version (`0.0.0` / empty)
 * yields null, as does a repo with nothing stamped.
 *
 * Severity is branch-scoped (see PROTECTED_BRANCHES): a `blocker` on main/dev (or a PR
 * into them), an `advisory` on feature branches. `installingVersion` and
 * `onProtectedBranch` are injected for testability.
 */
export function detectManagedStale(
  cwd: string,
  installingVersion: string = readPkgVersion(),
  onProtectedBranch: boolean = isOnProtectedBranch(cwd),
): PreflightFinding | null {
  if (!installingVersion || installingVersion === "0.0.0") return null;

  const stale: string[] = [];
  let scanned = 0;
  for (const { path: rel, scope } of listStampedFiles(cwd)) {
    const abs = path.join(cwd, rel);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, "utf-8");
    const found =
      scope === "block" ? readManagedBlockVersion(content) : readManagedVersion(content);
    if (found === undefined) continue;
    scanned++;
    if (found !== installingVersion) stale.push(`${rel}${found ? ` (v${found})` : " (no marker)"}`);
  }

  if (scanned === 0 || stale.length === 0) return null;

  const examples = stale.slice(0, 5).join(", ");
  const more = stale.length > 5 ? ` (+${stale.length - 5} more)` : "";
  const branchNote = onProtectedBranch
    ? ""
    : " (non-blocking on this feature branch — it WILL hard-fail `bkit check` on main/dev, so re-render before merging.)";
  return {
    id: "bkit-managed-stale",
    severity: onProtectedBranch ? "blocker" : "advisory",
    detect: `${stale.length} of ${scanned} bkit-managed file(s) carry a bkit version marker that differs from the installed bkit version (${installingVersion}): ${examples}${more}.${branchNote}`,
    action:
      "Re-render every bkit-managed file at the installed version, then commit the result: run `pnpm bkit upgrade` (resyncs every host, doc and hook) or re-run `pnpm bkit install` with your host flags. To MOVE to a newer bkit, use `pnpm bkit upgrade --latest` (or `--to=<version>`) — it bumps @cbartens/bkit AND re-renders in one step; `pnpm add @cbartens/bkit` alone does NOT re-render. Never hand-edit a rendered agent/command or the content between `bkit:start` and `bkit:end`: put your own content outside the block, where install and upgrade never write.",
  };
}

// ---------------------------------------------------------------------------
// Owned hook files — `bkit check` fails when one is missing
// ---------------------------------------------------------------------------

/** A bkit-owned hook file the consumer's install needs but is absent on disk. */
export interface MissingOwnedHook {
  path: string;
  /** The `bkit install` flag that writes it back. */
  restoreFlag: string;
}

/** Host modules whose manifest hook files a host config runs, and the flag that installs each. */
const HOOK_HOST_FLAGS: ReadonlyArray<
  ["claude" | "cursor" | "codex" | "opencode" | "antigravity", string]
> = [
  ["claude", "--claude"],
  ["cursor", "--cursor"],
  ["codex", "--codex"],
  ["opencode", "--opencode=<provider>"],
  ["antigravity", "--antigravity"],
];

/** Manifest paths a host runs as a hook: `.<host>/hooks/<file>` and `.opencode/plugin/<file>`. */
const HOOK_FILE_RE = /\/(hooks|plugin)\/[^/]+$/;

/**
 * Owned hook files that are missing for what this repo has installed: the hook files in the
 * manifest of each installed host module. The claude and codex hook commands skip a missing
 * file (`test -f <file> && … || true`); `bkit check` fails on it.
 */
export function findMissingOwnedHooks(cwd: string, modules: Set<ModuleFlag>): MissingOwnedHook[] {
  const required: MissingOwnedHook[] = [];
  for (const [host, restoreFlag] of HOOK_HOST_FLAGS) {
    if (!modules.has(host)) continue;
    for (const entry of getModuleManifest(host)) {
      if (HOOK_FILE_RE.test(entry.path)) required.push({ path: entry.path, restoreFlag });
    }
  }
  return required.filter((hook) => !fs.existsSync(path.join(cwd, hook.path)));
}

/** One-line description of a missing hook file, shared by the checklist and the check exit. */
export function describeMissingOwnedHook(hook: MissingOwnedHook): string {
  return `${hook.path} is missing, so the hook that runs it is off — restore it with \`pnpm bkit install ${hook.restoreFlag}\`.`;
}

/** The checklist blocker for `findMissingOwnedHooks` output, or null when nothing is missing. */
export function detectOwnedHookMissing(missing: MissingOwnedHook[]): PreflightFinding | null {
  if (missing.length === 0) return null;
  return {
    id: "owned-hook-missing",
    severity: "blocker",
    detect: `${missing.length} bkit-owned hook file(s) missing: ${missing.map((h) => h.path).join(", ")}. The host still has each hook wired, but the file it runs is gone, so the guard or setup step it holds does not run.`,
    action: missing.map(describeMissingOwnedHook).join("\n"),
  };
}
