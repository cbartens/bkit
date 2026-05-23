// bkit-templates.content.test.ts — Snapshot/diff tests for seeded template files.
// (BAR-138: verifies consumer CI template has been updated for registry-based auth)
// Sibling of bkit-templates.test.ts which enforces marker PRESENCE; this file
// enforces template CONTENT (GH_BKIT_TOKEN, renovate baseBranches, etc.).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const CONSUMER_CI_TEMPLATE = path.resolve(".agents/templates/.github/workflows/ci.yml");
const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".agents/templates/.prettierignore");
const CONSUMER_RENOVATE_TEMPLATE = path.resolve(".agents/templates/.github/renovate.json5");

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

describe("consumer renovate template (.agents/templates/.github/renovate.json5)", () => {
  const content = fs.readFileSync(CONSUMER_RENOVATE_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_RENOVATE_TEMPLATE)).toBe(true);
  });

  it("targets the dev branch (required for bkit branch-protection convention)", () => {
    // Match either `baseBranches: ["dev"]` (one-line) or multiline; allow trailing comma.
    expect(content).toMatch(/baseBranches:\s*\[\s*"dev"\s*,?\s*\]/);
  });

  it("ships chore(deps): commit-message prefix to match conventional-commit history", () => {
    expect(content).toMatch(/commitMessagePrefix:\s*"chore\(deps\):"/);
  });

  it("extends Renovate's config:recommended baseline", () => {
    expect(content).toMatch(/"config:recommended"/);
  });

  it("enables osvVulnerabilityAlerts (CVE-driven PRs bypass schedule)", () => {
    expect(content).toMatch(/osvVulnerabilityAlerts:\s*true/);
  });

  it("enables lockFileMaintenance with weekly schedule", () => {
    expect(content).toMatch(/lockFileMaintenance:/);
    expect(content).toMatch(/enabled:\s*true/);
  });

  it("ships a packageRule that suppresses consumer-side bumps on bkit-managed workflow files", () => {
    // Bkit owns bkit-ci-router.yml — consumer Renovate must not touch it.
    expect(content).toMatch(/matchFileNames:[\s\S]*bkit-ci-router\.yml[\s\S]*enabled:\s*false/);
  });

  it("uses pinDigests for the github-actions manager (KN-3 SHA-pinning)", () => {
    expect(content).toMatch(/matchManagers:\s*\[\s*"github-actions"\s*\][\s\S]*pinDigests:\s*true/);
  });

  it("groups non-major devDependencies bumps with automerge", () => {
    expect(content).toMatch(/groupName:\s*"devDependencies \(non-major\)"/);
    expect(content).toMatch(/automerge:\s*true/);
  });

  it("declares weekly schedule (before 6am on Monday)", () => {
    expect(content).toMatch(/schedule:\s*\[\s*"before 6am on Monday"\s*\]/);
  });

  it("references the JSON schema for editor validation", () => {
    expect(content).toMatch(
      /\$schema:\s*"https:\/\/docs\.renovatebot\.com\/renovate-schema\.json"/,
    );
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
