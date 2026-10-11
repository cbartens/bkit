// audits/repo/resolve-push-base.test.ts — unit tests for bkit's own push-run diff base
// (scripts/ci/lanes/resolve-push-base.mjs), the dogfood of the shipped template. The same
// four decisions ship to consumers with the template and its standalone test.
//
// The script is ESM `.mjs`; imported dynamically so this Vitest ts file can exercise it.

import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/ci/lanes/resolve-push-base.mjs");

interface PushBaseInput {
  lastGreenSha: string;
  beforeSha?: string;
  isAncestor: (sha: string) => boolean;
}
const { choosePushBase, newestRunSha } = (await import(pathToFileURL(SCRIPT).href)) as {
  choosePushBase: (input: PushBaseInput) => { base: string; source: string };
  newestRunSha: (runs: unknown) => string;
};

const GREEN = "a".repeat(40);
const BEFORE = "b".repeat(40);
const ancestors =
  (...shas: string[]) =>
  (sha: string): boolean =>
    shas.includes(sha);

describe("resolve-push-base", () => {
  it("uses the last green run's head, not event.before, so a cancelled push stays in scope", () => {
    const r = choosePushBase({
      lastGreenSha: GREEN,
      beforeSha: BEFORE,
      isAncestor: ancestors(GREEN, BEFORE),
    });
    expect(r).toEqual({ base: GREEN, source: "last-green-run" });
  });

  it("falls back to event.before when there is no green run on the branch", () => {
    const r = choosePushBase({ lastGreenSha: "", beforeSha: BEFORE, isAncestor: ancestors() });
    expect(r).toEqual({ base: BEFORE, source: "event-before" });
  });

  it("falls back to event.before when the last green head is not an ancestor (force-push)", () => {
    const r = choosePushBase({
      lastGreenSha: GREEN,
      beforeSha: BEFORE,
      isAncestor: ancestors(BEFORE),
    });
    expect(r.base).toBe(BEFORE);
    expect(r.source.startsWith("event-before")).toBe(true);
  });

  it("returns an empty base when there is nothing at all (planner run-to-be-safe path)", () => {
    const r = choosePushBase({ lastGreenSha: "", beforeSha: undefined, isAncestor: ancestors() });
    expect(r.base).toBe("");
  });

  it("picks the newest run by run number, whatever order the API lists them in", () => {
    const runs = [
      { run_number: 2317, head_sha: "older" },
      { run_number: 2679, head_sha: "today" },
      { run_number: 2675, head_sha: "yesterday" },
    ];
    expect(newestRunSha(runs)).toBe("today");
  });

  it("returns an empty sha for a missing or malformed run list", () => {
    expect(newestRunSha([])).toBe("");
    expect(newestRunSha(undefined)).toBe("");
    expect(newestRunSha([{ run_number: "x", head_sha: "a" }, { head_sha: 3 }])).toBe("");
  });
});
