// templates.test.ts — Snapshot/diff tests for seeded template files.
// (BAR-138: verifies consumer CI template has been updated for registry-based auth)

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const CONSUMER_CI_TEMPLATE = path.resolve(".agents/templates/.github/workflows/ci.yml");
const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".agents/templates/.prettierignore");

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
    const lines = content.split("\n");
    const installLineIdx = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    const envTokenIdx = lines.findIndex((l) =>
      l.includes("GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}"),
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
