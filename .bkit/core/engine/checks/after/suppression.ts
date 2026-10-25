// checks/after/suppression.ts — per-package advisory opt-out (`package.json`
// `bkit.advisories.ignore`).
//
// A detector can be right in general and still fire on a package where the condition is
// deliberately not applicable (a rule-linter whose test titles mention `@live`, an
// integration lane mocked by design). package.json is comment-free, so the opt-out is a
// JSON key, not a comment.
//
// Each detector reads the OWNING package's list and drops only that package — never the
// whole advisory, which would hide a real finding in a sibling package (detector findings
// aggregate every affected package into one entry). Advisory-only: a blocker is never
// suppressible whatever the manifest says.

import { readPackageJson } from "../../shared/package-json.js";

/** One advisory a package opted out of. */
export interface SuppressionNote {
  /** Advisory id the package opted out of. */
  id: string;
  /** Repo-relative package directory the opt-out was read from (`"."` = repo root). */
  scope: string;
}

/** Sink a detector calls once per suppressed finding. */
export type SuppressionReporter = (note: SuppressionNote) => void;

/**
 * Advisory ids `dir/package.json` opts out of. A missing manifest, a `bkit` or
 * `bkit.advisories` key that is absent or not an object, and an `advisories.ignore` that is
 * absent or not an array all yield no ids — never a throw.
 */
export function ignoredAdvisoryIds(dir: string): Set<string> {
  const read = readPackageJson(dir);
  if (!read.ok) return new Set();
  const bkit = read.pkg.bkit;
  if (typeof bkit !== "object" || bkit === null || Array.isArray(bkit)) return new Set();
  const advisories = (bkit as { advisories?: unknown }).advisories;
  if (typeof advisories !== "object" || advisories === null || Array.isArray(advisories))
    return new Set();
  const list = (advisories as { ignore?: unknown }).ignore;
  if (!Array.isArray(list)) return new Set();
  return new Set(list.filter((id): id is string => typeof id === "string"));
}

/**
 * True when `dir/package.json` opts out of `id` AND the finding resolved to advisory
 * severity. `blocker` returns false unconditionally — a blocker is not suppressible.
 */
export function isAdvisorySuppressed(
  dir: string,
  id: string,
  severity: "blocker" | "advisory",
): boolean {
  if (severity !== "advisory") return false;
  return ignoredAdvisoryIds(dir).has(id);
}
