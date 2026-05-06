// bkit-modules.test.ts — Tests for package.json manifest invariants and
// installer advisory constants (BAR-138: GH Packages distribution, BAR-141: structured findings).

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

  // Tarball exclusions — `files` is the only mechanism that actually filters
  // test sources out of the published tarball when an allowlist is set
  // (npm ignores .npmignore for paths included by `files`). Each negation
  // pattern below is the load-bearing exclusion rule.
  it("files array contains a NEGATION (!) for *.test.ts (not a re-inclusion)", () => {
    const filesArray: string[] = pkg.files ?? [];
    const positivePatterns = filesArray.filter(
      (f: string) => f.includes(".test.ts") && !f.startsWith("!"),
    );
    expect(positivePatterns).toHaveLength(0);
    expect(filesArray.some((f: string) => f.startsWith("!") && f.includes(".test.ts"))).toBe(true);
  });

  it("files array contains a NEGATION (!) for __snapshots__ (not a re-inclusion)", () => {
    const filesArray: string[] = pkg.files ?? [];
    const positivePatterns = filesArray.filter(
      (f: string) => f.includes("__snapshots__") && !f.startsWith("!"),
    );
    expect(positivePatterns).toHaveLength(0);
    expect(filesArray.some((f: string) => f.startsWith("!") && f.includes("__snapshots__"))).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// Task C1 — Installer advisory action constants (BAR-138, migrated to bkit-postinstall.ts)
// ---------------------------------------------------------------------------

// Read the source file as a string to inspect the constant bodies without
// executing the module (avoids import side-effects and keeps tests fast).
// Note: the constants are now in bkit-postinstall.ts (Phase 3 owner), not bkit-modules.ts.
const POSTINSTALL_SRC = fs.readFileSync(
  path.resolve(".agents/scripts/bkit-postinstall.ts"),
  "utf-8",
);
const MODULES_SRC = fs.readFileSync(path.resolve(".agents/scripts/bkit-modules.ts"), "utf-8");

describe("GH_BKIT_TOKEN_MISSING action strings (now in bkit-postinstall.ts)", () => {
  // The action string is now embedded in the const GH_BKIT_TOKEN_MISSING_ACTION
  const match = POSTINSTALL_SRC.match(
    /const GH_BKIT_TOKEN_MISSING_ACTION\s*=\s*([\s\S]*?)(?=\nconst |\nexport )/,
  );
  const body = match ? match[1] : POSTINSTALL_SRC;

  it("postinstall source contains .npmrc registry line", () => {
    expect(POSTINSTALL_SRC).toContain("@cbartens:registry=https://npm.pkg.github.com");
  });

  it("postinstall source contains _authToken= line with GH_BKIT_TOKEN env-var interpolation", () => {
    expect(POSTINSTALL_SRC).toContain("_authToken=");
    expect(POSTINSTALL_SRC).toContain("GH_BKIT_TOKEN");
  });

  it("postinstall source contains read:packages scope reference", () => {
    expect(POSTINSTALL_SRC).toContain("read:packages");
  });

  it("postinstall source contains pnpm silent-ignore warning", () => {
    expect(POSTINSTALL_SRC).toContain("silently ignores");
  });

  it("postinstall source does NOT contain git insteadOf shim language", () => {
    expect(POSTINSTALL_SRC).not.toContain("git config --global url.");
  });

  it("GH_BKIT_TOKEN_MISSING_INSTRUCTIONS no longer exists in bkit-modules.ts", () => {
    expect(MODULES_SRC).not.toContain("GH_BKIT_TOKEN_MISSING_INSTRUCTIONS");
  });

  it("GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS no longer exists in bkit-modules.ts", () => {
    expect(MODULES_SRC).not.toContain("GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS");
  });

  it("VERCEL_AUTH_INSTRUCTIONS no longer exists in bkit-modules.ts", () => {
    expect(MODULES_SRC).not.toContain("VERCEL_AUTH_INSTRUCTIONS");
  });
});

describe("VERCEL action strings (now in bkit-postinstall.ts)", () => {
  it("postinstall source contains vercel env add GH_BKIT_TOKEN", () => {
    expect(POSTINSTALL_SRC).toContain("vercel env add GH_BKIT_TOKEN");
  });

  it("postinstall source contains .npmrc reference", () => {
    expect(POSTINSTALL_SRC).toContain(".npmrc");
  });

  it("postinstall source contains Remove directive for legacy installCommand", () => {
    expect(POSTINSTALL_SRC).toContain("Remove");
  });

  it("postinstall source does NOT contain git config --global url. shim", () => {
    expect(POSTINSTALL_SRC).not.toContain("git config --global url.");
  });
});

describe("CI_YML_MERGE_INSTRUCTIONS (in bkit-modules.ts — used for Tier 3 merge advisory)", () => {
  const match = MODULES_SRC.match(/const CI_YML_MERGE_INSTRUCTIONS = `([\s\S]*?)`;/);
  const body = match ? match[1] : "";

  it("constant body is non-empty", () => {
    expect(body.length).toBeGreaterThan(0);
  });

  it("contains .npmrc reference", () => {
    expect(body).toContain(".npmrc");
  });

  it("contains GH_BKIT_TOKEN env block for install step", () => {
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

describe("runCoreModule first-install advisory (BAR-141: structured finding)", () => {
  // The first-install message is now emitted as a structured PreflightFinding advisory.
  // Check the source uses advisories.push with the correct id.
  it("uses advisories.push (not printSink.push) for first-install message", () => {
    expect(MODULES_SRC).not.toContain("printSink.push");
    expect(MODULES_SRC).toContain("advisories.push");
  });

  it("first-install advisory id is first-install-postinstall-steps", () => {
    expect(MODULES_SRC).toContain("first-install-postinstall-steps");
  });

  it("first-install advisory action does NOT contain onlyBuiltDependencies", () => {
    // Extract the action string from the advisory block
    const match = MODULES_SRC.match(
      /id: "first-install-postinstall-steps"[\s\S]*?action:\s*"([\s\S]*?)",/,
    );
    const action = match ? match[1] : MODULES_SRC;
    expect(action).not.toContain("onlyBuiltDependencies");
  });

  it("first-install advisory action references read:packages scope", () => {
    const startIdx = MODULES_SRC.indexOf("first-install-postinstall-steps");
    const block = MODULES_SRC.slice(startIdx, startIdx + 1500);
    expect(block).toContain("read:packages");
  });
});
