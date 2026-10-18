// audits/repo/release-workflow.integration.test.ts — real `npm pack` and `pnpm pack`
// tarball-manifest inspection (BAR-138 challenge remediation — Finding 3).
//
// Tarball exclusions — `.bkit/core/engine/.npmignore` drops test sources and snapshots.
// A subdirectory .npmignore filters inside package.json `files` for both packers; `!`
// negations in `files` work only under npm, so both packers are held to one manifest.

import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
  "..",
  "..",
);

/** File paths a dry-run pack would ship (nothing is written; lifecycle scripts skipped). */
function packedFiles(packer: "npm" | "pnpm"): string[] {
  const out = execFileSync(packer, ["pack", "--dry-run", "--json"], {
    cwd: repoRoot,
    encoding: "utf-8",
    env: { ...process.env, npm_config_ignore_scripts: "true" },
    stdio: ["ignore", "pipe", "ignore"],
  });
  const parsed = JSON.parse(out) as
    Array<{ files: Array<{ path: string }> }> | { files: Array<{ path: string }> };
  const manifest = Array.isArray(parsed) ? parsed[0] : parsed;
  return (manifest?.files ?? []).map((f) => f.path);
}

describe.each(["npm", "pnpm"] as const)(
  "published tarball excludes test sources (BAR-138, real `%s pack` inspection)",
  (packer) => {
    let manifestFiles: string[];

    beforeAll(() => {
      manifestFiles = packedFiles(packer);
    });

    it("tarball ships zero *.test.ts files", () => {
      const offenders = manifestFiles.filter((p) => p.endsWith(".test.ts"));
      expect(offenders).toEqual([]);
    });

    it("tarball ships zero *.integration.test.ts files", () => {
      const offenders = manifestFiles.filter((p) => p.endsWith(".integration.test.ts"));
      expect(offenders).toEqual([]);
    });

    it("tarball ships zero files under __snapshots__/", () => {
      const offenders = manifestFiles.filter((p) => p.includes("__snapshots__/"));
      expect(offenders).toEqual([]);
    });

    it("tarball does not ship the harvest store or the maintainer consumer list", () => {
      const offenders = manifestFiles.filter(
        (p) => p.startsWith("harvest/") || p === "docs/consumers.md" || p === ".bkit/consumers.md",
      );
      expect(offenders).toEqual([]);
    });

    it("tarball still contains the load-bearing payload (dist/, README.md, .bkit/templates/)", () => {
      expect(manifestFiles.some((p) => p === "dist/cli.js")).toBe(true);
      expect(manifestFiles.some((p) => p === "README.md")).toBe(true);
      expect(manifestFiles.some((p) => p === ".bkit/templates/.github/workflows/bkit-ci.yml")).toBe(
        true,
      );
      expect(manifestFiles.some((p) => p === ".bkit/templates/.github/renovate.json5")).toBe(true);
    });

    it("tarball ships exactly the two licence files: the package's and the consumer notice", () => {
      const licences = manifestFiles.filter((p) => p.endsWith("LICENSE.md")).sort();
      expect(licences).toEqual([".bkit/core/.bkit/LICENSE.md", "LICENSE.md"]);
    });

    it("tarball does not ship the repo-only .bkit working files", () => {
      for (const p of [
        ".bkit/issues.jsonl",
        ".bkit/friction.jsonl",
        ".bkit/stats.jsonl",
        ".bkit/version",
        ".bkit/.env",
        ".bkit/advisories.md",
      ]) {
        expect(manifestFiles, p).not.toContain(p);
      }
    });
  },
);
