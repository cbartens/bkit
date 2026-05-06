// bkit-modules.test.ts — Tests for package.json manifest invariants and
// installer print constants (BAR-138: GH Packages distribution).

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

  it("private is false (package must be publishable)", () => {
    expect(pkg.private).toBe(false);
  });

  it("publishConfig.registry equals https://npm.pkg.github.com", () => {
    expect(pkg.publishConfig?.registry).toBe("https://npm.pkg.github.com");
  });

  it("publishConfig.access equals restricted", () => {
    expect(pkg.publishConfig?.access).toBe("restricted");
  });

  it("repository.url is bare HTTPS (no git+ prefix)", () => {
    expect(pkg.repository?.url).toBe("https://github.com/cbartens/bkit.git");
    expect(pkg.repository?.url).not.toMatch(/^git\+/);
  });

  it("description does not contain the old git-dependency lie", () => {
    expect(pkg.description).toBeTruthy();
    expect(pkg.description).not.toContain("git dependency from a private GitHub repo");
  });

  // Defense-in-depth: files array should not explicitly include *.test.ts patterns
  // (BAR-138 challenge remediation — Finding 3, defense-in-depth layer).
  // .npmignore is the primary guard; this ensures the files array doesn't
  // re-include test patterns that would override .npmignore via explicit allowlisting.
  it("files array does not include a *.test.ts glob pattern", () => {
    const filesArray: string[] = pkg.files ?? [];
    const testPatterns = filesArray.filter((f: string) => f.includes(".test.ts"));
    expect(testPatterns).toHaveLength(0);
  });

  it("files array does not include a __snapshots__ pattern", () => {
    const filesArray: string[] = pkg.files ?? [];
    const snapshotPatterns = filesArray.filter((f: string) => f.includes("__snapshots__"));
    expect(snapshotPatterns).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Task C1 — Installer print constants (BAR-138)
// ---------------------------------------------------------------------------

// Read the source file as a string to inspect the constant bodies without
// executing the module (avoids import side-effects and keeps tests fast).
// Note: template literals in bkit-modules.ts use \${...} to escape interpolation,
// so the extracted body text contains the backslash-escaped form. Tests check
// for the escaped form when looking for env-var interpolation syntax.
const SRC = fs.readFileSync(path.resolve(".agents/scripts/bkit-modules.ts"), "utf-8");

describe("GH_BKIT_TOKEN_MISSING_INSTRUCTIONS", () => {
  // Extract the constant body between the declaration and the next const.
  const match = SRC.match(/const GH_BKIT_TOKEN_MISSING_INSTRUCTIONS = `([\s\S]*?)`;/);
  const body = match ? match[1] : "";

  it("constant body is non-empty", () => {
    expect(body.length).toBeGreaterThan(0);
  });

  it("contains .npmrc registry line", () => {
    expect(body).toContain("@cbartens:registry=https://npm.pkg.github.com");
  });

  it("contains _authToken= line with GH_BKIT_TOKEN env-var interpolation", () => {
    // In source, the template literal uses \${GH_BKIT_TOKEN} (escaped) so the
    // extracted body string contains the backslash: _authToken=\${GH_BKIT_TOKEN}
    expect(body).toContain("_authToken=");
    expect(body).toContain("GH_BKIT_TOKEN");
  });

  it("contains read:packages scope reference", () => {
    expect(body).toContain("read:packages");
  });

  it("contains pnpm silent-ignore warning", () => {
    expect(body).toContain("silently ignores");
  });

  it("does NOT contain git insteadOf shim language", () => {
    expect(body).not.toContain("insteadOf");
    expect(body).not.toContain("git config --global url.");
  });
});

describe("GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS", () => {
  const match = SRC.match(/const GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS = `([\s\S]*?)`;/);
  const body = match ? match[1] : "";

  it("constant body is non-empty", () => {
    expect(body.length).toBeGreaterThan(0);
  });

  it("contains .npmrc registry line", () => {
    expect(body).toContain("@cbartens:registry=https://npm.pkg.github.com");
  });

  it("contains _authToken= line with GH_BKIT_TOKEN env-var interpolation", () => {
    // In source, the template literal uses \${GH_BKIT_TOKEN} (escaped) so the
    // extracted body string contains the backslash: _authToken=\${GH_BKIT_TOKEN}
    expect(body).toContain("_authToken=");
    expect(body).toContain("GH_BKIT_TOKEN");
  });

  it("contains read:packages scope reference", () => {
    expect(body).toContain("read:packages");
  });

  it("contains pnpm silent-ignore warning", () => {
    expect(body).toContain("silently ignores");
  });

  it("does NOT contain git insteadOf shim language", () => {
    expect(body).not.toContain("insteadOf");
    expect(body).not.toContain("git config --global url.");
  });
});

describe("VERCEL_AUTH_INSTRUCTIONS", () => {
  const match = SRC.match(/const VERCEL_AUTH_INSTRUCTIONS = `([\s\S]*?)`;/);
  const body = match ? match[1] : "";

  it("constant body is non-empty", () => {
    expect(body.length).toBeGreaterThan(0);
  });

  it("contains vercel env add GH_BKIT_TOKEN", () => {
    expect(body).toContain("vercel env add GH_BKIT_TOKEN");
  });

  it("contains .npmrc reference", () => {
    expect(body).toContain(".npmrc");
  });

  it("contains Remove directive for legacy installCommand", () => {
    expect(body).toContain("Remove");
  });

  it("does NOT contain git config --global url. shim", () => {
    expect(body).not.toContain("git config --global url.");
  });
});

describe("CI_YML_MERGE_INSTRUCTIONS", () => {
  const match = SRC.match(/const CI_YML_MERGE_INSTRUCTIONS = `([\s\S]*?)`;/);
  const body = match ? match[1] : "";

  it("constant body is non-empty", () => {
    expect(body.length).toBeGreaterThan(0);
  });

  it("contains .npmrc reference", () => {
    expect(body).toContain(".npmrc");
  });

  it("contains GH_BKIT_TOKEN env block for install step", () => {
    // The install step env block in the template literal uses YAML indentation
    // and escaped template syntax, so match the key presence
    expect(body).toContain("GH_BKIT_TOKEN:");
    expect(body).toContain("secrets.GH_BKIT_TOKEN");
  });

  it("contains read:packages scope reference", () => {
    expect(body).toContain("read:packages");
  });

  it("tells AI to remove Configure private-repo auth step", () => {
    expect(body).toContain("Remove");
    expect(body).toContain("Configure private-repo auth");
  });
});

describe("runCoreModule first-install banner", () => {
  // Extract the printSink.push block inside runCoreModule (the first-install banner).
  // Match from the push call containing "First install detected" to the closing );
  const match = SRC.match(/printSink\.push\(\s*`([\s\S]*?First install detected[\s\S]*?)`\s*\)/);
  const banner = match ? match[1] : "";

  it("banner is non-empty", () => {
    expect(banner.length).toBeGreaterThan(0);
  });

  it("does NOT contain onlyBuiltDependencies", () => {
    expect(banner).not.toContain("onlyBuiltDependencies");
  });

  it("step 1 references read:packages scope", () => {
    expect(banner).toContain("read:packages");
  });
});
