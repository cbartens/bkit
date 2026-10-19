// audits/templates/templates-content.test.ts — Snapshot/diff tests for seeded template files.
// (BAR-138: verifies consumer CI template uses registry-based auth)
// Sibling of audits/templates/templates.test.ts which enforces marker PRESENCE; this file
// enforces template CONTENT (renovate baseBranchPatterns, etc.).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { listFilesRecursive } from "../../install/template-copies";
import { BKIT_GATE_SCRIPTS } from "../../install/manifest";
import { getBkitDocsRoot } from "../../shared/package-roots";

const CONSUMER_CI_TEMPLATE = path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml");
const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".bkit/templates/.prettierignore");
const CONSUMER_RENOVATE_TEMPLATE = path.resolve(".bkit/templates/.github/renovate.json5");

describe("consumer CI template (.bkit/templates/.github/workflows/bkit-ci.yml)", () => {
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

  it("install step no longer carries a BKIT_GH_TOKEN_INSTALL env block (public npm)", () => {
    expect(content).not.toContain("BKIT_GH_TOKEN_INSTALL");
  });

  it("install step runs a plain pnpm install --frozen-lockfile (no registry auth)", () => {
    const lines = content.split("\n");
    const installLineIdx = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    expect(installLineIdx).toBeGreaterThan(-1);
    expect(content).not.toMatch(/pnpm config set/);
    expect(content).not.toMatch(/npm\.pkg\.github\.com/);
  });

  it("still contains pnpm install --frozen-lockfile", () => {
    expect(content).toContain("pnpm install --frozen-lockfile");
  });

  it("still contains token placeholders {{DEFAULT_BRANCH}} and {{NODE_VERSION}}", () => {
    expect(content).toContain("{{DEFAULT_BRANCH}}");
    expect(content).toContain("{{NODE_VERSION}}");
  });

  describe("[verbose ci] NODE_OPTIONS knob", () => {
    // The runner blocklists NODE_OPTIONS for the $GITHUB_ENV workflow command and REJECTS
    // the write with an ::error:: while still concluding the step `success`; only static
    // YAML works. The two assertions are a pair: no $GITHUB_ENV write, and the static key
    // present.
    it("never writes NODE_OPTIONS to $GITHUB_ENV", () => {
      const offenders = content
        .split("\n")
        .filter((l) => /NODE_OPTIONS\s*=/.test(l) && l.includes("GITHUB_ENV"));
      expect(offenders).toEqual([]);
    });

    it("every job declaring VERBOSE_CI also declares a marker-gated job-level NODE_OPTIONS", () => {
      // Derived, not hand-listed: the lane set comes from the VERBOSE_CI declarations
      // themselves, so a lane added later is covered without editing this test.
      const verboseLanes = content
        .split("\n")
        .filter((l) => /^\s+VERBOSE_CI:\s*\$\{\{/.test(l)).length;
      const nodeOptionKeys = content
        .split("\n")
        .filter(
          (l) =>
            /^\s+NODE_OPTIONS:\s*\$\{\{/.test(l) &&
            l.includes("[verbose ci]") &&
            l.includes("--trace-warnings"),
        ).length;
      expect(verboseLanes).toBeGreaterThan(0);
      expect(nodeOptionKeys).toBe(verboseLanes);
    });

    it("gates NODE_OPTIONS on the spelled-out contains() test, not env.VERBOSE_CI", () => {
      // The `env` context is not available to a job-level `env:` value, so
      // `env.VERBOSE_CI` there resolves empty on every run — no flags, no error, no signal.
      const nodeOptionLines = content
        .split("\n")
        .filter((l) => /^\s+NODE_OPTIONS:\s*\$\{\{/.test(l));
      expect(nodeOptionLines.length).toBeGreaterThan(0);
      for (const line of nodeOptionLines) {
        expect(line).not.toMatch(/env\.VERBOSE_CI/);
        expect(line).toContain("contains(github.event.head_commit.message, '[verbose ci]')");
      }
    });
  });

  describe("Check Default Branch Lags Dev step (promotion-lag warning)", () => {
    it("ships the Check Default Branch Lags Dev step", () => {
      expect(content).toContain("- name: Check Default Branch Lags Dev");
    });

    it("fires only on dev pushes (not PRs, not other branches)", () => {
      // The step's if: gates on a push to dev (exact guard; not PRs / feature pushes).
      expect(content).toMatch(
        /Check Default Branch Lags Dev[\s\S]*?if:[^\n]*github\.event_name == 'push'[^\n]*github\.ref == 'refs\/heads\/dev'/,
      );
    });

    it("keys ONLY on consumed-from-default-branch surfaces (renovate config + workflows)", () => {
      // The trigger is the stale-consumed-surface set, not any dev-ahead-of-main —
      // so ordinary app-code dev pushes stay quiet.
      const step =
        content.match(
          /- name: Check Default Branch Lags Dev[\s\S]*?(?=\n      - name:|\n      #)/,
        )?.[0] ?? "";
      expect(step).toContain(".github/renovate.json5");
      expect(step).toContain(".github/workflows");
      expect(step).toMatch(/git diff --name-only "origin\/\$DEFAULT_BRANCH" HEAD/);
    });

    it("is token-free (default branch read at runtime, so the step is identical per repo)", () => {
      // No bkit {{TOKEN}} inside the step; the default branch comes from the Actions
      // context at runtime.
      const block =
        content.match(
          /- name: Check Default Branch Lags Dev[\s\S]*?(?=\n      - name:|\n      #)/,
        )?.[0] ?? "";
      expect(block).toContain("- name: Check Default Branch Lags Dev");
      expect(block).toContain("DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}");
      expect(block).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });

    it("is non-blocking — warns via ::warning:: and never exits non-zero", () => {
      const step =
        content.match(
          /- name: Check Default Branch Lags Dev[\s\S]*?(?=\n      - name:|\n      #)/,
        )?.[0] ?? "";
      expect(step).toContain("::warning::");
      // No `exit 1` (or any non-zero exit) — the step is a nudge, not a gate.
      expect(step).not.toMatch(/exit [1-9]/);
    });
  });

  it("ships the bkit-stub:coverage block commented, per-tier (unit + integration reports)", () => {
    // The sentinel must exist for the BKIT_STUBS advisory to fire, and BOTH per-tier report
    // steps must ship COMMENTED (opt-in) so installing the scaffold can never red an existing repo.
    expect(content).toContain("# bkit-stub:coverage");
    expect(content).toContain("davelosert/vitest-coverage-report-action");
    expect(content).toContain("# - name: Report Unit Coverage on PR");
    expect(content).toContain("# - name: Report Integration Coverage on PR");
    // Neither is an ACTIVE (uncommented) step: coverage is opt-in.
    expect(content).not.toMatch(/^\s*- name: Report (Unit|Integration) Coverage on PR/m);
  });

  it("ships the bkit-stub:e2e-coverage block commented (Playwright E2E coverage report)", () => {
    // Sentinel must exist for the bkit-stub-e2e-coverage advisory to fire, and the report step
    // must ship COMMENTED (opt-in) — Playwright needs a collect+report pipeline the consumer wires.
    expect(content).toContain("# bkit-stub:e2e-coverage");
    expect(content).toContain("# - name: Report E2E Coverage on PR");
    // Reuses the same commenter as bkit-stub:coverage, keyed to a distinct e2e sticky comment.
    expect(content).toContain("davelosert/vitest-coverage-report-action");
    // Not an ACTIVE (uncommented) step — it must never run before the consumer opts in.
    expect(content).not.toMatch(/^\s*- name: Report E2E Coverage on PR/m);
  });

  it("ships the gether lane-name stubs (web, device, reset, deploy, health)", () => {
    for (const sentinel of [
      "# bkit-stub:bkit-tests-integration —",
      "# bkit-stub:bkit-tests-e2e-web —",
      "# bkit-stub:bkit-tests-build-web —",
      "# bkit-stub:bkit-tests-live-web —",
      "# bkit-stub:bkit-tests-build-ios —",
      "# bkit-stub:bkit-tests-e2e-ios —",
      "# bkit-stub:bkit-tests-build-android —",
      "# bkit-stub:bkit-tests-e2e-android —",
      "# bkit-stub:bkit-tests-reset —",
      "# bkit-stub:bkit-tests-cleanup —",
      "# bkit-stub:logging-probe —",
      "# bkit-stub:bkit-tests-deploy —",
      "# bkit-stub:health —",
    ]) {
      expect(content).toContain(sentinel);
    }
  });

  it("never inlines a PR title into a run: body (GitHub Actions script injection)", () => {
    // User-controlled text (`${{ github.event.pull_request.title }}`) arrives via env:
    // (runtime expansion), never expanded into shell text.
    expect(content).not.toMatch(/MSG="\$\{\{\s*github\.event\.pull_request\.title\s*\}\}"/);
    expect(content).toContain("PR_TITLE: ${{ github.event.pull_request.title }}");
    expect(content).toMatch(/MSG="\$PR_TITLE"/);
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
    // Match either `baseBranchPatterns: ["dev"]` (one-line) or multiline; allow trailing comma.
    expect(content).toMatch(/baseBranchPatterns:\s*\[\s*"dev"\s*,?\s*\]/);
  });

  it("merges base-branch config so dev-side renovate.json5 edits take effect", () => {
    // useBaseBranchConfig: Renovate otherwise reads config ONLY from the default branch.
    expect(content).toMatch(/useBaseBranchConfig:\s*"merge"/);
  });

  it("ships chore(deps): commit-message prefix to match conventional-commit history", () => {
    expect(content).toMatch(/commitMessagePrefix:\s*"chore\(deps\):"/);
  });

  it("extends Renovate's config:best-practices baseline (digest pinning, abandonment flags, config migration)", () => {
    expect(content).toMatch(/extends:\s*\[\s*"config:best-practices"/);
    expect(content).not.toMatch(/"config:recommended"/);
  });

  it("restores the 7-day npm release-age gate that config:best-practices lowers to 3 days", () => {
    expect(content).toMatch(
      /matchDatasources:\s*\[\s*"npm"\s*\][\s\S]*?minimumReleaseAge:\s*"7 days"/,
    );
  });

  it("rebases a Renovate PR only when it conflicts (no CI re-run on every base move)", () => {
    expect(content).toMatch(/rebaseWhen:\s*"conflicted"/);
  });

  it("does not extend a renovate-local preset (the copy is the whole config)", () => {
    expect(content).not.toMatch(/renovate-local/);
    expect(content).not.toMatch(/\{\{REPO_SLUG\}\}/);
  });

  it("enables osvVulnerabilityAlerts (CVE-driven PRs bypass schedule)", () => {
    expect(content).toMatch(/osvVulnerabilityAlerts:\s*true/);
  });

  it("enables lockFileMaintenance on a monthly schedule", () => {
    expect(content).toMatch(/lockFileMaintenance:/);
    expect(content).toMatch(/enabled:\s*true/);
    expect(content).toMatch(
      /lockFileMaintenance:\s*\{[\s\S]*?schedule:\s*\["before 6am on the first day of the month"\]/,
    );
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
    expect(content).toMatch(/minimumReleaseAge:\s*"7 days"/);
  });

  it("does not fence bkit-renovate.yml (the consumer owns that runner)", () => {
    expect(content).not.toMatch(/"\.github\/workflows\/renovate\.yml"/);
  });

  it("does not fence bkit-cloud.yml (a template the consumer owns, so its pins refresh)", () => {
    expect(content).not.toMatch(/"\.github\/workflows\/bkit-cloud\.yml"/);
  });

  it("ignores the bkit-owned mirror trees so Renovate doesn't scan them (#132)", () => {
    // `.bkit/templates/**` and `.agents/skills/**` are bkit-owned and stay out of the scan.
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.bkit\/templates\/\*\*"/);
    expect(content).toMatch(/ignorePaths:[\s\S]*"\.agents\/skills\/\*\*"/);
  });

  it("keeps archived plans, test directories and fixtures out of the scan, and repeats the preset's defaults", () => {
    // A repo-level ignorePaths replaces :ignoreModulesAndTests, so its entries are repeated.
    for (const glob of [
      "docs/plans/**",
      "**/tests/**",
      "**/__fixtures__/**",
      "**/node_modules/**",
      "**/bower_components/**",
      "**/test/**",
    ]) {
      expect(content).toContain(`"${glob}"`);
    }
  });

  it("holds major bumps on the dependency dashboard until approved", () => {
    expect(content).toMatch(
      /matchUpdateTypes:\s*\["major"\],\s*automerge:\s*false,\s*dependencyDashboardApproval:\s*true/,
    );
  });

  it("tracks off-manifest pins through one regex custom manager (Dockerfile, bkit-cloud.md, workflows)", () => {
    expect(content).toMatch(/customManagers:\s*\[\s*\{\s*customType:\s*"regex"/);
    expect(content).toContain("# renovate: datasource=(?<datasource>");
    expect(content).toContain("(^|/)Dockerfile$");
    expect(content).toContain("bkit-cloud\\\\.md$");
    expect(content).toContain("workflows/[^/]+\\\\.ya?ml$");
  });

  it("disables Renovate for the @cbartens/bkit package itself (#132)", () => {
    // bkit upgrades via `bkit upgrade`.
    expect(content).toMatch(
      /matchPackageNames:\s*\[\s*"@cbartens\/bkit"\s*\][\s\S]*enabled:\s*false/,
    );
  });

  it("uses pinDigests for the github-actions manager (KN-3 SHA-pinning)", () => {
    expect(content).toMatch(/matchManagers:\s*\[\s*"github-actions"\s*\][\s\S]*pinDigests:\s*true/);
  });

  it("collapses auto-mergeable non-major bumps into one shared group with automerge", () => {
    // devDeps non-major + prod patch + @types + eslint share a single
    // groupName so they land in ONE PR.
    expect(content).toMatch(
      /matchDepTypes:\s*\[\s*"devDependencies",\s*"packageManager"\s*\][\s\S]*?groupName:\s*"non-major dependencies"[\s\S]*?automerge:\s*true/,
    );
    // No per-type group names — the four dependency types share one group.
    expect(content).not.toMatch(/groupName:\s*"devDependencies \(non-major\)"/);
    expect(content).not.toMatch(/groupName:\s*"type definitions"/);
    expect(content).not.toMatch(/groupName:\s*"linters \(eslint\)"/);
  });

  it("scopes multi-package ecosystem groups to majors only (non-majors fold into the unified group)", () => {
    // vitest/playwright/tanstack non-major bumps ride the unified auto-merge PR;
    // only a coordinated MAJOR bump gets a dedicated lockstep PR (reviewed,
    // never auto-merged).
    expect(content).toMatch(
      /matchPackageNames:\s*\[\s*"vitest\*"[\s\S]*?matchUpdateTypes:\s*\[\s*"major"\s*\][\s\S]*?automerge:\s*false/,
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

  it("no longer carries a GitHub Packages read-auth hostRules anchor", () => {
    expect(content).not.toMatch(/hostRules:/);
    expect(content).not.toMatch(/npm\.pkg\.github\.com/);
  });
});

describe("self-hosted renovate workflow template (.bkit/templates/.github/workflows/bkit-renovate.yml) (#325)", () => {
  const WORKFLOW = path.resolve(".bkit/templates/.github/workflows/bkit-renovate.yml");
  const content = fs.readFileSync(WORKFLOW, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(WORKFLOW)).toBe(true);
  });

  it("runs renovatebot/github-action SHA-pinned (KN-CORE-5) on the configurable runner (#362)", () => {
    expect(content).toMatch(/uses:\s*renovatebot\/github-action@[0-9a-f]{40}\s*#/);
    expect(content).toMatch(/runs-on:\s*ubuntu-latest/);
    expect(content).not.toMatch(/\{\{RENOVATE_RUNNER\}\}/);
  });

  it("pins an exact Renovate release with a dated-lookup annotation the custom manager reads", () => {
    expect(content).toMatch(/\n\s*renovate-version:\s*"\d+\.\d+\.\d+"/);
    expect(content).toMatch(
      /# renovate: datasource=github-releases depName=renovatebot\/renovate\n\s*renovate-version:/,
    );
  });

  it("wires RENOVATE_GIT_AUTHOR from a repo variable (portable commit author for org repos)", () => {
    // Org-owned fine-grained PATs have no Email-addresses permission, so Renovate can't
    // read the token owner's email; the repo variable supplies the git author instead.
    expect(content).toMatch(/RENOVATE_GIT_AUTHOR:\s*\$\{\{\s*vars\.RENOVATE_GIT_AUTHOR\s*\}\}/);
  });

  it("wakes on a schedule cron + workflow_dispatch (logLevel / dryRun inputs)", () => {
    expect(content).toMatch(/schedule:/);
    expect(content).toMatch(/cron:/);
    expect(content).toMatch(/workflow_dispatch:/);
    expect(content).toMatch(/logLevel:/);
    expect(content).toMatch(/dryRun:/);
  });

  it("serialises runs (concurrency group, no cancel-in-progress)", () => {
    expect(content).toMatch(/concurrency:/);
    expect(content).toMatch(/cancel-in-progress:\s*false/);
  });

  it("authenticates with BKIT_GH_TOKEN, never the default GITHUB_TOKEN", () => {
    // GITHUB_TOKEN-opened PRs don't trigger CI, so platformAutomerge never fires.
    expect(content).toMatch(/token:\s*\$\{\{\s*secrets\.BKIT_GH_TOKEN\s*\}\}/);
    expect(content).not.toMatch(/token:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/);
    expect(content).not.toMatch(/token:\s*\$\{\{\s*github\.token\s*\}\}/);
  });

  it("no longer injects private-registry auth (bkit is on the public npm registry)", () => {
    expect(content).not.toMatch(/RENOVATE_HOST_RULES:/);
    expect(content).not.toMatch(/npm\.pkg\.github\.com/);
    expect(content).not.toMatch(/secrets\.BKIT_GH_TOKEN_INSTALL/);
  });

  it("scopes to this repo only (no org-wide autodiscover)", () => {
    expect(content).toMatch(/RENOVATE_REPOSITORIES:\s*\$\{\{\s*github\.repository\s*\}\}/);
    expect(content).toMatch(/RENOVATE_AUTODISCOVER:\s*"false"/);
  });

  it("allow-lists the PNPM_* env so renovate.json5's env block is not rejected (allowedEnv)", () => {
    // renovate.json5 sets env: { PNPM_WORKERS, PNPM_MAX_WORKERS }; allowedEnv is a
    // global-only option, so without this the self-hosted bot rejects the whole config.
    expect(content).toMatch(/RENOVATE_ALLOWED_ENV:\s*"PNPM_\*"/);
  });

  it("never INJECTS model/tracker secrets into the runner (security.md § token isolation)", () => {
    // The names may appear in a "do NOT add these" comment, but are never referenced
    // as `secrets.*`.
    expect(content).not.toMatch(/secrets\.ANTHROPIC_API_KEY/);
    expect(content).not.toMatch(/secrets\.BKIT_ANTHROPIC_API_KEY/);
    expect(content).not.toMatch(/secrets\.LINEAR_API_KEY/);
    expect(content).not.toMatch(/secrets\.BKIT_LINEAR_API_KEY/);
  });

  it("uses least-privilege job permissions (contents: read)", () => {
    expect(content).toMatch(/permissions:\s+contents:\s*read/);
  });
});

describe("trivy scan workflow template (.bkit/templates/.github/workflows/bkit-trivy.yml) (#547)", () => {
  const content = fs.readFileSync(
    path.resolve(".bkit/templates/.github/workflows/bkit-trivy.yml"),
    "utf-8",
  );

  it("runs the trivy image pinned by tag and digest, never the hijackable actions", () => {
    expect(content).toMatch(
      /uses:\s*docker:\/\/ghcr\.io\/aquasecurity\/trivy:\d+\.\d+\.\d+@sha256:[0-9a-f]{64}\n/,
    );
    expect(content).not.toMatch(/uses:\s*aquasecurity\/(trivy-action|setup-trivy)/);
  });

  it("never pins a release published by the March 2026 compromise (0.69.4 - 0.69.6)", () => {
    expect(content).not.toMatch(/trivy:0\.69\.[4-6]@/);
  });

  it("scans dev dependencies, or a dev-tooling lockfile reads as zero packages", () => {
    expect(content).toMatch(/--include-dev-deps/);
  });

  it("fails on HIGH and CRITICAL across lockfiles, config and secrets", () => {
    expect(content).toMatch(/--scanners vuln,misconfig,secret/);
    expect(content).toMatch(/--severity HIGH,CRITICAL/);
    expect(content).toMatch(/--exit-code 1/);
  });

  it("skips the bkit-owned templates tree", () => {
    expect(content).toMatch(/--skip-dirs \.bkit\/templates/);
  });

  it("leaves pnpm-lock.yaml to the dependency-audit gate once that gate is adopted", () => {
    expect(content).toMatch(
      /if \[ -f scripts\/ci\/check-dependency-audit\.mjs \]; then\n\s+args="\$args --skip-files pnpm-lock\.yaml"/,
    );
  });

  it("reads .trivyignore.yaml only when the repo has one", () => {
    expect(content).toMatch(
      /if \[ -f \.trivyignore\.yaml \]; then\n\s+args="\$args --ignorefile \.trivyignore\.yaml"/,
    );
  });

  it("runs daily as well as on change, since advisories land without a code change", () => {
    expect(content).toMatch(/schedule:\s*\n(\s*#.*\n)*\s*- cron:/);
  });

  it("uses a read-only token and reads no secret", () => {
    expect(content).toMatch(/permissions:\s+contents:\s*read/);
    expect(content).toMatch(/persist-credentials:\s*false/);
    expect(content).not.toMatch(/secrets\./);
  });
});

describe("example dependabot template (.bkit/templates/.github/dependabot.yml)", () => {
  const content = fs.readFileSync(path.resolve(".bkit/templates/.github/dependabot.yml"), "utf-8");

  it("does not exclude bkit-cloud.yml (a template the consumer owns, so its pins refresh)", () => {
    expect(content).not.toMatch(/exclude-paths:[\s\S]*bkit-cloud\.yml/);
  });

  it("holds new releases behind a 7-day cooldown", () => {
    expect(content).toMatch(/cooldown:\s*\n\s+default-days:\s*7/);
  });
});

describe(".bkit/.env.example keys are BKIT_-prefixed (direnv isolation)", () => {
  const ENV_EXAMPLE = path.resolve(".bkit/shared/.bkit/.env.example");
  const content = fs.readFileSync(ENV_EXAMPLE, "utf-8");
  const assigned = [...content.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]);

  it("assigns BKIT_GH_TOKEN (and no retired install token), not GH_BKIT_*", () => {
    expect(assigned).toContain("BKIT_GH_TOKEN");
    expect(assigned).not.toContain("BKIT_GH_TOKEN_INSTALL");
    expect(assigned).not.toContain("GH_BKIT_TOKEN");
    expect(assigned).not.toContain("GH_BKIT_TOKEN_INSTALL");
  });

  it("every assigned key starts with BKIT_", () => {
    expect(assigned.length).toBeGreaterThan(0);
    expect(assigned.filter((k) => !k.startsWith("BKIT_"))).toEqual([]);
  });

  it("vendor API keys are BKIT_-prefixed", () => {
    for (const key of [
      "BKIT_LINEAR_API_KEY",
      "BKIT_ANTHROPIC_API_KEY",
      "BKIT_CURSOR_API_KEY",
      "BKIT_OPENCODE_API_KEY",
      "BKIT_OPENROUTER_API_KEY",
      "BKIT_OLLAMA_API_KEY",
      "BKIT_TAVILY_API_KEY",
    ]) {
      expect(assigned).toContain(key);
    }
    expect(assigned).not.toContain("LINEAR_API_KEY");
    expect(assigned).not.toContain("ANTHROPIC_API_KEY");
    expect(assigned).not.toContain("OPENCODE_API_KEY");
  });
});

describe("consumer .prettierignore template (.bkit/templates/.prettierignore)", () => {
  const content = fs.readFileSync(CONSUMER_PRETTIERIGNORE_TEMPLATE, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(CONSUMER_PRETTIERIGNORE_TEMPLATE)).toBe(true);
  });

  it("carries no bkit:start / bkit:end block (bkit never writes a template)", () => {
    expect(content).not.toMatch(/^# bkit:(start|end)\b/m);
  });
});

describe("templates", () => {
  const root = path.resolve(".bkit/templates");

  // JSON has no comment syntax; `.bkit/templates.md` covers those.
  it("every template that can carry a comment says it is an example bkit install does not write", () => {
    const templates = listFilesRecursive(root)
      .map((abs) => path.relative(root, abs))
      .filter((rel) => !rel.endsWith(".json"));
    expect(templates).toContain(path.join(".github", "workflows", "bkit-ci.yml"));
    for (const rel of templates) {
      const text = fs.readFileSync(path.join(root, rel), "utf-8");
      expect(text, rel).toMatch(/Example/);
      expect(text, rel).toMatch(/does not write this file|does not write it/);
    }
  });

  it("no template carries a bkit:start / bkit:end block (bkit never writes a template)", () => {
    const templates = listFilesRecursive(root).map((abs) => path.relative(root, abs));
    expect(templates).toContain(path.join(".github", "workflows", "bkit-ci.yml"));
    for (const rel of templates) {
      expect(fs.readFileSync(path.join(root, rel), "utf-8"), rel).not.toMatch(
        /^[ \t]*(?:#|\/\/)?[ \t]*(?:<!--[ \t]*)?bkit:(?:start|end)\b/m,
      );
    }
  });

  it("keeps capability rules as a starter, not a product register", () => {
    const rules = fs.readFileSync(
      path.join(root, "scripts/graphify/bkit-graph-drift-rules.json"),
      "utf-8",
    );
    expect(rules).toContain("new ExampleClient(");
    expect(rules).not.toContain("family_members");
    expect(rules).not.toContain("app-gether-life");
  });

  it("generates capabilities.md and Mermaid from the wrapper", () => {
    const sh = fs.readFileSync(path.join(root, "scripts/graphify/bkit-graphify.sh"), "utf-8");
    expect(sh).toContain('CAPABILITIES_DOC="docs/capabilities.md"');
    expect(sh).toContain("R_PACKAGES_MMD");
    expect(sh).toContain("R_MODULES_MMD");
    expect(sh).toContain("--code-only");
  });
});

describe("launchd GUI-env templates (.bkit/templates/scripts/launchd/)", () => {
  const SCRIPT = path.resolve(".bkit/templates/scripts/launchd/bkit-launchd-env.sh");
  const PLIST = path.resolve(".bkit/templates/scripts/launchd/ai.bkit.launchd.plist");
  const ENV_EXAMPLE = path.resolve(".bkit/templates/scripts/launchd/launchd.env.example");

  it("ships the loader, the LaunchAgent plist and the env example", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect(fs.existsSync(PLIST)).toBe(true);
    expect(fs.existsSync(ENV_EXAMPLE)).toBe(true);
  });

  describe("bkit-launchd-env.sh", () => {
    const content = fs.readFileSync(SCRIPT, "utf-8");

    it("is POSIX shell that fails on unset variables but not on one failing key", () => {
      expect(content.startsWith("#!/usr/bin/env sh\n")).toBe(true);
      expect(content).toMatch(/^set -u$/m);
      expect(content).not.toMatch(/^set -e/m);
    });

    it("reads the env file from the positional arg or BKIT_LAUNCHD_ENV", () => {
      expect(content).toContain("${1:-${BKIT_LAUNCHD_ENV:-");
    });

    it("checks key identifiers against [A-Za-z0-9_]", () => {
      expect(content).toContain("*[!A-Za-z0-9_]*");
    });

    it("skips without launchctl on PATH (Linux CI)", () => {
      expect(content).toContain("command -v launchctl");
      expect(content).toContain("launchctl not found");
    });

    it("hands the value to launchctl, but logs key names only", () => {
      expect(content).toContain('launchctl setenv "$key" "$val"');
      const logLines = content.split("\n").filter((l) => /^\s*log "/.test(l));
      expect(logLines.some((l) => l.includes("setenv $key"))).toBe(true);
      for (const l of logLines) expect(l).not.toContain("$val");
    });
  });

  describe("ai.bkit.launchd.plist", () => {
    const content = fs.readFileSync(PLIST, "utf-8");

    it("is a LaunchAgent that loads at login and re-runs on env-file writes", () => {
      expect(content).toContain("<key>Label</key>");
      expect(content).toContain("<string>ai.bkit.launchd</string>");
      expect(content).toContain("<key>ProgramArguments</key>");
      expect(content).toContain("<key>RunAtLoad</key>");
      expect(content).toContain("<key>WatchPaths</key>");
    });

    it("keeps {{SCRIPT_PATH}} / {{ENV_FILE}} raw for the consumer to fill", () => {
      expect(content).toContain("{{SCRIPT_PATH}}");
      expect(content).toContain("{{ENV_FILE}}");
    });
  });

  describe("launchd.env.example", () => {
    const content = fs.readFileSync(ENV_EXAMPLE, "utf-8");

    it("ships example BKIT_ token keys with empty values", () => {
      expect(content).toMatch(/^BKIT_OPENROUTER_API_KEY=""/m);
      expect(content).toMatch(/^BKIT_GH_TOKEN=""/m);
      expect(content).toMatch(/^# BKIT_ANTHROPIC_API_KEY=""/m);
    });
  });
});

describe(".bkit/templates.md gate tool scripts (consumers copy and run them)", () => {
  const doc = fs.readFileSync(path.join(getBkitDocsRoot(), "templates.md"), "utf-8");
  const section = doc.slice(doc.indexOf("## Gate tool scripts"));
  const block = /```json\n([\s\S]*?)\n```/.exec(section);
  const scripts = JSON.parse(block?.[1] ?? "{}") as Record<string, string>;

  it("lists slop:delta as the bkit ci slop verb", () => {
    expect(scripts["slop:delta"]).toBe("bkit ci slop");
  });

  it("lists the lint value this repo runs", () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    };
    expect(scripts["lint"]).toBe(pkg.scripts["lint"]);
  });

  it("lists every script the default gates chain, except test and build", () => {
    const chained = new Set<string>();
    for (const [gate, value] of Object.entries(BKIT_GATE_SCRIPTS)) {
      if (!gate.startsWith("bkit:gate:")) continue;
      for (const m of value.matchAll(/pnpm ([\w:-]+)/g)) chained.add(m[1]);
    }
    const external = new Set(["install", "test", "build", "lint-staged"]);
    const missing = [...chained].filter(
      (name) => !name.startsWith("bkit:gate:") && !external.has(name) && !(name in scripts),
    );
    expect(missing).toEqual([]);
  });
});
