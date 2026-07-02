// bkit-templates.content.test.ts — Snapshot/diff tests for seeded template files.
// (BAR-138: verifies consumer CI template has been updated for registry-based auth)
// Sibling of bkit-templates.test.ts which enforces marker PRESENCE; this file
// enforces template CONTENT (GH_BKIT_TOKEN, renovate baseBranches, etc.).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const CONSUMER_CI_TEMPLATE = path.resolve(".bkit/templates/.github/workflows/ci.yml");
const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".bkit/templates/.prettierignore");
const CONSUMER_RENOVATE_TEMPLATE = path.resolve(".bkit/templates/.github/renovate.json5");

describe("consumer CI template (.bkit/templates/.github/workflows/ci.yml)", () => {
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

  describe("Check Main Lags Dev step (promotion-lag warning)", () => {
    it("ships the Check Main Lags Dev step", () => {
      expect(content).toContain("- name: Check Main Lags Dev");
    });

    it("fires only on dev pushes (not PRs, not other branches)", () => {
      // The step's if: gates on a push to dev — that's the moment main starts
      // to lag. Matching the exact guard keeps it from firing on PRs / feature pushes.
      expect(content).toMatch(
        /Check Main Lags Dev[\s\S]*?if:[^\n]*github\.event_name == 'push'[^\n]*github\.ref == 'refs\/heads\/dev'/,
      );
    });

    it("keys ONLY on consumed-from-default-branch surfaces (renovate config + workflows)", () => {
      // The trigger is the stale-consumed-surface set, not any dev-ahead-of-main —
      // so ordinary app-code dev pushes stay quiet.
      const step =
        content.match(/- name: Check Main Lags Dev[\s\S]*?(?=\n      - name:|\n      #)/)?.[0] ??
        "";
      expect(step).toContain(".github/renovate.json5");
      expect(step).toContain(".github/workflows");
      expect(step).toMatch(/git diff --name-only "origin\/\$DEFAULT_BRANCH" HEAD/);
    });

    it("is token-free (default branch read at runtime, so the block is identical per repo)", () => {
      // No bkit {{TOKEN}} inside the block — otherwise install would render it and the
      // managed-block drift check would false-positive on every consumer. The default
      // branch comes from the Actions context at runtime instead.
      const block =
        content.match(/# bkit:start main-lag-warning\n[\s\S]*?# bkit:end main-lag-warning/)?.[0] ??
        "";
      expect(block).toContain("- name: Check Main Lags Dev");
      expect(block).toContain("DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}");
      expect(block).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });

    it("is non-blocking — warns via ::warning:: and never exits non-zero", () => {
      const step =
        content.match(/- name: Check Main Lags Dev[\s\S]*?(?=\n      - name:|\n      #)/)?.[0] ??
        "";
      expect(step).toContain("::warning::");
      // No `exit 1` (or any non-zero exit) — the step is a nudge, not a gate.
      expect(step).not.toMatch(/exit [1-9]/);
    });
  });

  it("snapshot matches expected template content (regression guard)", () => {
    expect(content).toMatchSnapshot();
  });
});

describe("consumer renovate template (.bkit/templates/.github/renovate.json5)", () => {
  const content = fs.readFileSync(CONSUMER_RENOVATE_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_RENOVATE_TEMPLATE)).toBe(true);
  });

  it("targets the dev branch (required for bkit branch-protection convention)", () => {
    // Match either `baseBranches: ["dev"]` (one-line) or multiline; allow trailing comma.
    expect(content).toMatch(/baseBranches:\s*\[\s*"dev"\s*,?\s*\]/);
  });

  it("merges base-branch config so dev-side renovate.json5 edits take effect", () => {
    // Without useBaseBranchConfig, Renovate reads config ONLY from the default
    // branch (main) — config edits on `dev` are silently ignored.
    expect(content).toMatch(/useBaseBranchConfig:\s*"merge"/);
  });

  it("ships chore(deps): commit-message prefix to match conventional-commit history", () => {
    expect(content).toMatch(/commitMessagePrefix:\s*"chore\(deps\):"/);
  });

  it("extends Renovate's config:recommended baseline", () => {
    expect(content).toMatch(/"config:recommended"/);
  });

  it("extends a consumer-owned local preset (renovate-local) so repo-specific rules survive bkit install", () => {
    // renovate.json5 is Tier-1 canonical-overwrite; consumer customisations live in
    // the unmanaged renovate-local.json5, pulled in via a {{REPO_SLUG}}-tokenised
    // local preset. Listed LAST in `extends` so it wins over the baseline presets.
    // The explicit `.json5` extension is load-bearing (issue #179): an
    // extensionless local preset resolves to `.json`, 404s, and disables the
    // whole config. The reference must match the seeded `renovate-local.json5`.
    expect(content).toMatch(/"local>\{\{REPO_SLUG\}\}\/\/\.github\/renovate-local\.json5"/);
    expect(content).not.toMatch(/renovate-local"/);
    const extendsBlock = content.match(/extends:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    expect(extendsBlock.indexOf("renovate-local")).toBeGreaterThan(
      extendsBlock.indexOf("config:recommended"),
    );
  });

  it("enables osvVulnerabilityAlerts (CVE-driven PRs bypass schedule)", () => {
    expect(content).toMatch(/osvVulnerabilityAlerts:\s*true/);
  });

  it("enables lockFileMaintenance with weekly schedule", () => {
    expect(content).toMatch(/lockFileMaintenance:/);
    expect(content).toMatch(/enabled:\s*true/);
  });

  it("ships the pnpm-11 OOM mitigation: worker-cap env + Renovate minimumReleaseAge (#308)", () => {
    // Large pnpm-11 monorepos OOM Mend's microvm on `pnpm update --lockfile-only`
    // when the per-install release-age gate verifies timestamps for every entry.
    // (A) Cap pnpm's worker pool — PNPM_WORKERS/PNPM_MAX_WORKERS are allow-listed
    // by Mend's global:safeEnv preset, so no admin `allowedEnv` change is needed.
    expect(content).toMatch(
      /env:\s*\{[\s\S]*?PNPM_WORKERS:\s*"1"[\s\S]*?PNPM_MAX_WORKERS:\s*"1"[\s\S]*?\}/,
    );
    // (B) Enforce release-age freshness in Renovate (no per-install verification).
    // Security / osvVulnerabilityAlerts PRs bypass this by design → no CVE delay.
    expect(content).toMatch(/minimumReleaseAge:\s*"1 day"/);
  });

  it("ships a packageRule that suppresses consumer-side bumps on bkit-managed workflow files", () => {
    // Bkit owns bkit-cloud.yml — consumer Renovate must not touch it.
    expect(content).toMatch(/matchFileNames:[\s\S]*bkit-cloud\.yml[\s\S]*enabled:\s*false/);
  });

  it("ignores bkit-cloud.yml so the tag->SHA Pin-deps PR can't recreate forever", () => {
    // `enabled: false` only suppresses version updates; the github-actions manager
    // still scans the file and applies pinDigests, recreating a "Pin dependencies"
    // PR on every scan. ignorePaths stops the scan outright (primary fence).
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.github\/workflows\/bkit-cloud\.yml"/);
  });

  it("ignores the bkit-owned mirror trees so Renovate doesn't scan them (#132)", () => {
    // `.bkit/templates/**` and `.agents/skills/**` are bkit-owned files NOT managed
    // by consumer Renovate; scanning them only produces onboarding noise.
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.bkit\/templates\/\*\*"/);
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.agents\/skills\/\*\*"/);
  });

  it("disables Renovate for the @cbartens/bkit package itself (#132)", () => {
    // bkit upgrades via `bkit upgrade`, not a bare version bump; the package is also
    // restricted on GitHub Packages (unauthable from Mend → "no-result").
    expect(content).toMatch(
      /matchPackageNames:\s*\[\s*"@cbartens\/bkit"\s*\][\s\S]*enabled:\s*false/,
    );
  });

  it("ignores the bkit-owned mirror trees so Renovate doesn't scan them (#132)", () => {
    // `.bkit/templates/**` and `.agents/skills/**` are bkit-owned files NOT managed
    // by consumer Renovate; scanning them only produces onboarding noise.
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.bkit\/templates\/\*\*"/);
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.agents\/skills\/\*\*"/);
  });

  it("disables Renovate for the @cbartens/bkit package itself (#132)", () => {
    // bkit upgrades via `bkit upgrade`, not a bare version bump; the package is also
    // restricted on GitHub Packages (unauthable from Mend → "no-result").
    expect(content).toMatch(
      /matchPackageNames:\s*\[\s*"@cbartens\/bkit"\s*\][\s\S]*enabled:\s*false/,
    );
  });

  it("uses pinDigests for the github-actions manager (KN-3 SHA-pinning)", () => {
    expect(content).toMatch(/matchManagers:\s*\[\s*"github-actions"\s*\][\s\S]*pinDigests:\s*true/);
  });

  it("collapses auto-mergeable non-major bumps into one shared group with automerge", () => {
    // devDeps non-major + prod patch + @types + eslint share a single
    // groupName so they land in ONE PR — every Renovate PR rewrites
    // pnpm-lock.yaml, so several auto-merge PRs in the same window force a
    // serial rebase cascade. One group = one lockfile mutation = no cascade.
    expect(content).toMatch(
      /matchDepTypes:\s*\[\s*"devDependencies"\s*\][\s\S]*?groupName:\s*"non-major dependencies"[\s\S]*?automerge:\s*true/,
    );
    // Old per-type group names are gone — proof the four collapsed into one.
    expect(content).not.toMatch(/groupName:\s*"devDependencies \(non-major\)"/);
    expect(content).not.toMatch(/groupName:\s*"type definitions"/);
    expect(content).not.toMatch(/groupName:\s*"linters \(eslint\)"/);
  });

  it("scopes multi-package ecosystem groups to majors only (non-majors fold into the unified group)", () => {
    // vitest/playwright/tanstack non-major bumps ride the unified auto-merge PR;
    // only a coordinated MAJOR bump gets a dedicated lockstep PR (reviewed,
    // never auto-merged). Guards against regressing to separate-named ecosystem
    // groups that auto-merge non-majors and re-enter the lockfile cascade.
    expect(content).toMatch(
      /matchPackagePatterns:\s*\[\s*"\^vitest"[\s\S]*?matchUpdateTypes:\s*\[\s*"major"\s*\][\s\S]*?automerge:\s*false/,
    );
    // The bare auto-merging ecosystem group names must not reappear.
    expect(content).not.toMatch(/groupName:\s*"vitest"\s*,/);
    expect(content).not.toMatch(/groupName:\s*"playwright"\s*,/);
  });

  it("declares weekly schedule (before 6am on Monday)", () => {
    expect(content).toMatch(/schedule:\s*\[\s*"before 6am on Monday"\s*\]/);
  });

  it("references the JSON schema for editor validation", () => {
    expect(content).toMatch(
      /\$schema:\s*"https:\/\/docs\.renovatebot\.com\/renovate-schema\.json"/,
    );
  });

  it("carries NO hostRules token anchor — private-registry auth lives in renovate-local.json5 (#199)", () => {
    // The npm.pkg.github.com read-auth token must NOT live in this canonical-
    // overwrite file: it would re-clobber a consumer's activation on every
    // `bkit upgrade`. It is seeded into the consumer-owned renovate-local.json5
    // instead (RENOVATE_LOCAL_STUB), which bkit never overwrites. Guard the
    // config KEY + the secret ref (prose may still reference `hostRules`).
    expect(content).not.toMatch(/^\s*hostRules:/m);
    expect(content).not.toMatch(/secrets\.GH_BKIT_TOKEN/);
  });
});

describe("consumer .prettierignore template (.bkit/templates/.prettierignore)", () => {
  const content = fs.readFileSync(CONSUMER_PRETTIERIGNORE_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_PRETTIERIGNORE_TEMPLATE)).toBe(true);
  });

  it("contains the bkit-managed block markers", () => {
    expect(content).toContain("# bkit:start");
    expect(content).toContain("# bkit:end");
  });
});
