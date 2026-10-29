// audits/repo/package-json.test.ts — bkit's own package.json manifest invariants (BAR-138; npmjs
// distribution since #408).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Task C0 — package.json manifest field invariants
// ---------------------------------------------------------------------------

describe("package.json manifest invariants (BAR-138)", () => {
  const pkgPath = path.resolve("package.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pkg: Record<string, any>;

  pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  /** The manifest's `files` array ([] when absent). */
  const manifestFiles = (): string[] => pkg.files ?? [];

  it("private is false (package must be publishable)", () => {
    expect(pkg.private).toBe(false);
  });

  it("publishConfig.registry equals https://registry.npmjs.org/", () => {
    expect(pkg.publishConfig?.registry).toBe("https://registry.npmjs.org/");
  });

  it("publishConfig.access equals public", () => {
    expect(pkg.publishConfig?.access).toBe("public");
  });

  it("repository.url is bare HTTPS (no git+ prefix)", () => {
    expect(pkg.repository?.url).toBe("https://github.com/cbartens/bkit.git");
    expect(pkg.repository?.url).not.toMatch(/^git\+/);
  });

  it("description does not claim a private git dependency", () => {
    expect(pkg.description).toBeTruthy();
    expect(pkg.description).not.toContain("git dependency from a private GitHub repo");
  });

  // Tarball exclusions live in `.bkit/core/engine/.npmignore`; the real-packer
  // check is release-workflow.integration.test.ts.
  it("files array carries no `!` negations (pnpm pack ignores them)", () => {
    const filesArray = manifestFiles();
    expect(filesArray.filter((f: string) => f.startsWith("!"))).toEqual([]);
  });

  // An override wins over the direct pin, so a Renovate bump of the pin would
  // change the manifest but not what installs. `$name` makes the override follow it.
  it("pnpm.overrides never shadows a direct pin", () => {
    const direct = { ...pkg.dependencies, ...pkg.devDependencies };
    const overrides: Record<string, string> = pkg.pnpm?.overrides ?? {};
    const shadowing = Object.entries(overrides)
      .filter(([name, spec]) => name in direct && spec !== `$${name}`)
      .map(([name, spec]) => `${name}: ${spec}`);
    expect(shadowing).toEqual([]);
  });
});
