// install/npmrc-migration.test.ts — the one-time GitHub Packages → npmjs `.npmrc` migration.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { migrateNpmrc, npmrcAuthTokenFinding } from "./npmrc-migration";

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-npmrc-migration-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const write = (content: string) => fs.writeFileSync(path.join(tmpDir, ".npmrc"), content, "utf-8");
const read = () => fs.readFileSync(path.join(tmpDir, ".npmrc"), "utf-8");

describe("migrateNpmrc", () => {
  it("is a no-op when .npmrc is absent", () => {
    const r = migrateNpmrc(tmpDir, false);
    expect(r).toEqual({ changed: false, removedRegistry: false, hasAuthToken: false });
    expect(fs.existsSync(path.join(tmpDir, ".npmrc"))).toBe(false);
  });

  it("removes the obsolete @cbartens registry mapping", () => {
    write("@cbartens:registry=https://npm.pkg.github.com\nsave-exact=true\n");
    const r = migrateNpmrc(tmpDir, false);
    expect(r.removedRegistry).toBe(true);
    expect(r.changed).toBe(true);
    expect(read()).toBe("save-exact=true\n");
  });

  it("removes an immediately-associated comment block above the mapping", () => {
    write(
      "# Private-registry read auth for @cbartens/bkit on npm.pkg.github.com.\n" +
        "# Renovate needs it to regenerate the lockfile.\n" +
        "@cbartens:registry=https://npm.pkg.github.com\n" +
        "save-exact=true\n",
    );
    migrateNpmrc(tmpDir, false);
    expect(read()).toBe("save-exact=true\n");
  });

  it("keeps a stale auth-token line and reports it (never edits a live secret)", () => {
    write("//npm.pkg.github.com/:_authToken=ghp_secret\n");
    const r = migrateNpmrc(tmpDir, false);
    expect(r.removedRegistry).toBe(false);
    expect(r.changed).toBe(false);
    expect(r.hasAuthToken).toBe(true);
    expect(read()).toBe("//npm.pkg.github.com/:_authToken=ghp_secret\n");
  });

  it("removes the registry mapping and leaves the auth-token line (flagged)", () => {
    write(
      "@cbartens:registry=https://npm.pkg.github.com\n" +
        "//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
    );
    const r = migrateNpmrc(tmpDir, false);
    expect(r.removedRegistry).toBe(true);
    expect(r.hasAuthToken).toBe(true);
    expect(read()).toBe("//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n");
  });

  it("dryRun computes the plan without writing", () => {
    const original = "@cbartens:registry=https://npm.pkg.github.com\nsave-exact=true\n";
    write(original);
    const r = migrateNpmrc(tmpDir, true);
    expect(r.changed).toBe(true);
    expect(read()).toBe(original);
  });

  it("leaves an unrelated .npmrc untouched", () => {
    const original = "registry=https://registry.npmjs.org/\nsave-exact=true\n";
    write(original);
    const r = migrateNpmrc(tmpDir, false);
    expect(r).toEqual({ changed: false, removedRegistry: false, hasAuthToken: false });
    expect(read()).toBe(original);
  });
});

describe("npmrcAuthTokenFinding", () => {
  it("is an advisory that names the line and tells the user to delete it", () => {
    const f = npmrcAuthTokenFinding();
    expect(f.id).toBe("npmrc-github-packages-authtoken");
    expect(f.severity).toBe("advisory");
    expect(f.detect).toContain("//npm.pkg.github.com/:_authToken=");
    expect(f.action).toContain("pnpm config delete");
  });
});
