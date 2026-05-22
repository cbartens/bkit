// templates.test.ts — Snapshot/diff tests for seeded template files.
// (BAR-138: verifies consumer CI template has been updated for registry-based auth)

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const CONSUMER_CI_TEMPLATE = path.resolve(".agents/templates/.github/workflows/ci.yml");
const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".agents/templates/.prettierignore");
const CONSUMER_DEPENDABOT_TEMPLATE = path.resolve(".agents/templates/.github/dependabot.yml");
const CONSUMER_DEPENDABOT_SCRIPT = path.resolve(
  ".agents/templates/scripts/ci/bkit-set-dependabot.sh",
);

describe("consumer CI template (.agents/templates/.github/workflows/ci.yml)", () => {
  let content: string;
  content = fs.readFileSync(CONSUMER_CI_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_CI_TEMPLATE)).toBe(true);
  });

  it("does NOT contain Configure private-repo auth step", () => {
    expect(content).not.toContain("Configure private-repo auth");
  });

  it("does NOT contain insteadOf git auth-shim", () => {
    expect(content).not.toContain("insteadOf");
    expect(content).not.toContain("git config --global url.");
  });

  it("install step carries env: GH_BKIT_TOKEN block", () => {
    expect(content).toContain("GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}");
  });

  it("env: GH_BKIT_TOKEN appears under the install step (after pnpm install --frozen-lockfile)", () => {
    // Note: GH_BKIT_TOKEN is declared at BOTH job-level (so subsequent pnpm/npx
    // steps don't emit ".npmrc env substitution failed" warnings) AND at the
    // install step itself (explicit, plus required by the BAR-138 contract).
    // This assertion locates the step-level declaration adjacent to the install
    // command, ignoring any earlier job-level occurrence.
    const lines = content.split("\n");
    const installLineIdx = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    const envTokenIdx = lines.findIndex(
      (l, i) => i > installLineIdx && l.includes("GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}"),
    );
    expect(installLineIdx).toBeGreaterThan(-1);
    expect(envTokenIdx).toBeGreaterThan(installLineIdx);
    // Must be within the next 3 lines (env: block is directly under run:)
    expect(envTokenIdx - installLineIdx).toBeLessThanOrEqual(3);
  });

  it("still contains pnpm install --frozen-lockfile", () => {
    expect(content).toContain("pnpm install --frozen-lockfile");
  });

  it("still contains token placeholders {{DEFAULT_BRANCH}} and {{NODE_VERSION}}", () => {
    expect(content).toContain("{{DEFAULT_BRANCH}}");
    expect(content).toContain("{{NODE_VERSION}}");
  });

  it("snapshot matches expected template content (regression guard)", () => {
    expect(content).toMatchSnapshot();
  });
});

describe("consumer dependabot template (.agents/templates/.github/dependabot.yml)", () => {
  const content = fs.readFileSync(CONSUMER_DEPENDABOT_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_DEPENDABOT_TEMPLATE)).toBe(true);
  });

  it("declares version: 2", () => {
    expect(content).toMatch(/^version:\s*2\s*$/m);
  });

  it("declares an updates: array", () => {
    expect(content).toMatch(/^updates:\s*$/m);
  });

  it("includes the github-actions ecosystem", () => {
    expect(content).toMatch(/package-ecosystem:\s*github-actions/);
  });

  it("targets the dev branch (required for bkit branch-protection convention)", () => {
    expect(content).toMatch(/^\s*target-branch:\s*dev\s*$/m);
  });

  it("ships chore(deps) commit-message prefix to match conventional-commit history", () => {
    expect(content).toMatch(/prefix:\s*"chore\(deps\)"/);
  });

  it("contains no tab indentation (YAML requires spaces)", () => {
    expect(content).not.toMatch(/^\t/m);
  });

  it("documents that the file must reach the default branch to fire", () => {
    expect(content).toMatch(/default branch/i);
  });

  it("npm ecosystem is shipped commented out (opt-in)", () => {
    // Active entries use `- package-ecosystem:`; commented npm uses `# - package-ecosystem: npm`.
    expect(content).toMatch(/#\s*-\s*package-ecosystem:\s*npm/);
    // Sanity-check: no UNCOMMENTED npm entry by default.
    expect(content).not.toMatch(/^\s*-\s*package-ecosystem:\s*npm/m);
  });
});

describe("consumer bkit-set-dependabot.sh template (.agents/templates/scripts/ci/)", () => {
  const content = fs.readFileSync(CONSUMER_DEPENDABOT_SCRIPT, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_DEPENDABOT_SCRIPT)).toBe(true);
  });

  it("declares a bash shebang", () => {
    expect(content.startsWith("#!/usr/bin/env bash")).toBe(true);
  });

  it("enables vulnerability-alerts via gh api PUT", () => {
    expect(content).toMatch(/gh api -X PUT\s+"?repos\/\$OWNER_REPO\/vulnerability-alerts"?/);
  });

  it("DISABLES automated-security-fixes via gh api DELETE (bkit policy: never auto-PR to main)", () => {
    expect(content).toMatch(/gh api -X DELETE\s+"?repos\/\$OWNER_REPO\/automated-security-fixes"?/);
    // Sanity-check the reverse: must NOT enable automated-security-fixes
    expect(content).not.toMatch(
      /gh api -X PUT\s+"?repos\/\$OWNER_REPO\/automated-security-fixes"?/,
    );
  });

  it("documents the never-auto-on-main policy", () => {
    expect(content).toMatch(/never auto/i);
    expect(content).toMatch(/main/);
  });

  it("supports --dry-run flag", () => {
    expect(content).toMatch(/--dry-run/);
  });

  it("supports --print flag", () => {
    expect(content).toMatch(/--print/);
  });

  it("guards on gh CLI availability", () => {
    expect(content).toMatch(/command -v gh/);
    expect(content).toMatch(/gh auth status/);
  });

  it("documents that Dependency graph UI toggle is not API-reachable", () => {
    expect(content).toMatch(/Dependency graph/);
    expect(content).toMatch(/settings\/security_analysis/);
  });

  it("uses strict bash mode (set -euo pipefail)", () => {
    expect(content).toMatch(/^set -euo pipefail$/m);
  });
});

describe("consumer .prettierignore template (.agents/templates/.prettierignore)", () => {
  const content = fs.readFileSync(CONSUMER_PRETTIERIGNORE_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_PRETTIERIGNORE_TEMPLATE)).toBe(true);
  });

  it("contains the bkit-managed block markers", () => {
    expect(content).toContain("# bkit:start");
    expect(content).toContain("# bkit:end");
  });
});
