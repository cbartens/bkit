// checks/after/tools.ts — local tooling: the Vale package, workflow lint tools, gate stubs, and
// the dependency-updater choice.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import type { PreflightFinding } from "../before/index.js";
import { readPackageJson } from "../../shared/package-json.js";
import { readTextFile } from "../../shared/json.js";
import { getPkgRoot } from "../../shared/package-roots.js";
import {
  PROJECT_DOC_TOPICS,
  PROJECT_INDEX_PATH,
  type ProjectDocTopic,
  findIndexedEquivalent,
  inspectRepoFile,
  isInTreePath,
  legacyStarterTopic,
  normalizeLegacyText,
  projectDocPath,
  readProjectIndex,
  starterPath,
} from "../../install/project-docs.js";
import { stripManagedWrapper } from "../../install/managed-block.js";
import { isAdvisorySuppressed, type SuppressionReporter } from "./suppression.js";
import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
import {
  DEP_UPDATER_NAMES,
  type DepUpdater,
  findDepUpdaterConfigs,
} from "../../shared/dep-updater.js";

/** True when `cmd --version` runs (binary on PATH, exits 0). */
function toolVersionRuns(cmd: string): boolean {
  const res = spawnSync(cmd, ["--version"], {
    stdio: ["ignore", "ignore", "ignore"],
    timeout: 5000,
  });
  return res.status === 0;
}

/**
 * Detect a prose gate that cannot run here: package.json `bkit:lint:prose` calls `bkit ci prose`,
 * which fails without vale, and vale is not on PATH. Null when the gate is not adopted.
 */
export function detectValeMissing(cwd: string): PreflightFinding | null {
  const read = readPackageJson(cwd);
  if (!read.ok) return null;
  const scripts = read.pkg["scripts"];
  const lintProse =
    typeof scripts === "object" && scripts !== null
      ? (scripts as Record<string, unknown>)["bkit:lint:prose"]
      : undefined;
  if (typeof lintProse !== "string" || !lintProse.includes("bkit ci prose")) return null;
  if (toolVersionRuns("vale")) return null;

  return {
    id: "vale-not-installed",
    severity: "advisory",
    detect:
      "package.json `bkit:lint:prose` runs `bkit ci prose`, but vale is not on PATH — the prose gate fails, so every pre-push gate that runs `bkit:lint:prose` fails on this machine.",
    action:
      "Install vale, then download its styles:\n\n    brew install vale    # macOS; other platforms: https://vale.sh/docs/install\n    vale sync\n\nCI and the cloud templates install vale already; this is for local machines.",
  };
}

/**
 * Detect whether vale is installed but write-good styles are not synced.
 * Returns null if vale is not on PATH (`detectValeMissing` covers that case).
 */
export function detectValePackageNotSynced(cwd: string): PreflightFinding | null {
  if (!toolVersionRuns("vale")) return null; // vale not on PATH — detectValeMissing

  if (fs.existsSync(path.join(cwd, ".vale", "styles", "write-good"))) return null;

  // `vale sync` reads `Packages` from .vale.ini; without one it has nothing to download.
  if (!fs.existsSync(path.join(cwd, ".vale.ini"))) {
    return {
      id: "vale-package-not-synced",
      severity: "advisory",
      detect:
        "vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.",
      action:
        "Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.",
    };
  }

  return {
    id: "vale-package-not-synced",
    severity: "advisory",
    detect: "vale is on PATH but .vale/styles/write-good/ is absent — vale packages not synced.",
    action:
      "Run `vale sync` (one-time per repo) to download the write-good package. bkit:lint:prose tries to self-heal this (copy from the main worktree, then `vale sync`) and fails if it cannot.",
  };
}

/**
 * Detect incomplete local workflow-lint tooling: `actionlint` and/or `shellcheck`
 * not on PATH. `pnpm bkit:lint:workflows` soft-skips without actionlint, and actionlint
 * skips shellcheck on `run:` blocks without shellcheck — so invalid GHA expressions
 * and shell issues in `.github/workflows/*` surface only in CI (the runner preinstalls
 * both). Recommends installing both for pre-push parity. Only fires when the repo has
 * workflow files to lint. bkit does NOT install these binaries (same as vale).
 */
export function detectWorkflowLintToolsMissing(cwd: string): PreflightFinding | null {
  const wfDir = path.join(cwd, ".github", "workflows");
  if (!fs.existsSync(wfDir)) return null;
  const hasWorkflow = fs.readdirSync(wfDir).some((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
  if (!hasWorkflow) return null;

  const missing = ["actionlint", "shellcheck"].filter((t) => !toolVersionRuns(t));
  if (missing.length === 0) return null;

  return {
    id: "workflow-lint-tools-missing",
    severity: "advisory",
    detect: `Local workflow-lint tooling incomplete (missing: ${missing.join(", ")}). \`pnpm bkit:lint:workflows\` soft-skips without actionlint, and actionlint skips shellcheck on \`run:\` blocks without shellcheck — so GHA-expression and shell issues in .github/workflows/* are caught only in CI.`,
    action:
      "Install both for pre-push parity (actionlint runs shellcheck automatically when it is on PATH):\n\n    brew install actionlint shellcheck    # macOS\n\nThen `pnpm bkit:lint:workflows` lints `.github/workflows/*` locally before you push.",
  };
}

/**
 * Detect bkit-stub:<id> sentinel comments in the CI workflow (`bkit.testing.ciWorkflow`,
 * default `bkit-ci.yml`), the file every stub lives in. Each sentinel
 * marks a commented-in YAML / shell block that bkit ships disabled by default;
 * the corresponding advisory points the installing AI/user at the block so they
 * can decide whether to enable, customise, or delete it.
 *
 * Each stub is keyed on its id. To dismiss an advisory: remove the sentinel
 * header line. Uncommenting the block alone does NOT silence the advisory —
 * delete the `# bkit-stub:<id> — ...` header line at the same time.
 *
 * Detection matches the HEADER form only (sentinel + em-dash). Prose that merely
 * cites a stub id — cross-references between blocks, provenance notes on an already
 * enabled lane — is not a header and must not raise an advisory.
 */
interface BkitStub {
  /** Stub identifier; matches the `# bkit-stub:<id> — ...` header line in the file. */
  id: string;
  /** Short description of what enabling the block does — surfaced to the installing AI. */
  description: string;
}

const BKIT_STUBS: BkitStub[] = [
  {
    id: "auto-force-e2e",
    description:
      "Auto-trigger E2E on PRs whose diff touches sensitive paths (auth, migrations, payment, api, server).",
  },
  {
    id: "migrations-immutable",
    description:
      "Fail PRs that modify supabase/migrations/* files already present on the base branch — enforces migration immutability after merge.",
  },
  {
    id: "test-presence",
    description:
      "Warn when a workspace package declares a `test` script but contains zero `*.test.ts(x)` / `*.spec.ts(x)` files (guards against accidental deletion).",
  },
  {
    id: "supabase-migrate",
    description:
      "REMOTE `db push` belongs in `bkit-tests-migration`, not in the monolithic tests job and not in `bkit-tests-e2e-web`. Prefer the migration-lane stub (always-on; replay plan-/path-gated; push on every push to dev/main; e2e/live `needs:` it). Legacy single-job shape still documented under this stub for repos without a migration lane yet — migrate into bkit-tests-migration ASAP. Requires the host access token + project ref (e.g. SUPABASE_ACCESS_TOKEN, or the host's env pull).",
  },
  {
    id: "test-db",
    description:
      "Assert schema-invariant DB checks (e.g. 'every public table has RLS enabled', no hardcoded table list) so they aren't app-defined. Two co-equal routes — pick by deploy topology, not by whether you can run pgTAP locally: (1) pgTAP (`supabase db test` over `supabase/tests/*.sql`) against a CI-local fixture built from `supabase/migrations` — fast, hermetic, offline, but the fixture can differ from prod, so it can stay green while prod RLS is broken; best when there is no deploy/`@live` tier, or for pure-logic DB unit tests. (2) a `@live` catalog-RPC (SECURITY DEFINER, service_role-only, called over REST; direct port-5432 from CI runners is IPv4-flaky) that validates the real deployed schema in `bkit-tests-live-web` — the recommended default once you have a deploy + `@live` tier (RLS/tenancy especially: a passing local-fixture check is not evidence that prod is locked down). See docs/testing.md § Schema-invariant DB checks.",
  },
  {
    id: "vercel-await",
    description:
      "Poll the Vercel API for the PR's preview deployment by commit SHA and export `target_url` for E2E. Requires VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID secrets.",
  },
  {
    id: "e2e",
    description:
      "Run `pnpm test:e2e` gated on `should_run_full` (the `[force full]` commit/PR tag) or `needs_e2e` (auto-force-e2e). Pairs with vercel-await for PR-time runs against the preview deployment.",
  },
  {
    id: "coverage",
    description:
      "Report vitest coverage on PRs and in every run's job summary via davelosert/vitest-coverage-report-action (free, runs inside Actions with GITHUB_TOKEN — no third-party service, safe for private repos). PER-TIER: unit and integration are measured and commented SEPARATELY (a single merged number lets integration mask a hollow unit suite — coverage is a union). Report-only by default: nothing fails the build until a threshold is set. Enabling (documented in the stub header): (1) add `@vitest/coverage-v8` (pinned to your vitest major) plus a vitest.config coverage block with `reporter: ['text','json-summary','json']` and `reportOnFailure: true` — json-summary + json are load-bearing (the action reads coverage-summary.json and coverage-final.json); (2) run coverage TWICE into separate dirs — unit → coverage/unit (exclude integration files), integration → coverage/integration — so each tier gets its own honest number (avoids the last-writer-wins clobber a second same-dir run would cause); (3) add a JOB-LEVEL permissions block to bkit-tests-unit with `contents: read` + `pull-requests: write` — job-level REPLACES the workflow-level block (not additive), so omitting `contents: read` breaks the checkout; (4) two report steps with distinct `name:` (unit / integration) pointing at each dir's coverage-summary.json + coverage-final.json; the unit step runs on every event (`if: !cancelled()` plus a `hashFiles` guard on its summary), sets `vite-config-path: vitest.unit.config.ts` so the job summary and PR comment show the floor as the target, and comments only on same-repo PRs (`comment-on: pr`, else `none`). SEPARATE LANES (one job per tier): put the integration run + report + its OWN pull-requests: write block in bkit-tests-integration, not bkit-tests-unit — each lane posts its own comment. Thresholds are opt-in and PER TIER: UNIT is the gate — put `coverage.thresholds.branches` in a `vitest.unit.config.ts` (`mergeConfig` over vitest.config) that ONLY the unit run loads via `-c` (vitest coverage is per-RUN/root config, NOT per-project — `projects` does not scope it and a `thresholds` block in vitest.config reds BOTH runs; the report action reads the same file as raw text, so keep the floor on one unquoted `branches: <n>` line and no other metric name + colon + number in it; branches is the meaningful floor, set to current and ratchet up). INTEGRATION is REPORT-ONLY — gate it on EXECUTION (the capstone's integration_ran > 0), not a %: a whole-repo integration % is denominator-noise (it covers boundaries/flows, not pure logic). For a real integration %, add `--coverage.include=src/server/**` on the integration run (same CLI-flag idiom as --exclude) then set a floor, or ratchet from current — never a picked number. Fork PRs: GITHUB_TOKEN is read-only, so the unit step sets `comment-on: none` there (its job summary still lands) and the integration step keeps the `head.repo == repo` guard (or use the action's workflow_run two-workflow pattern). Guard the integration report on `hashFiles('coverage/integration/coverage-summary.json') != ''` so a repo with no integration tier skips it cleanly.",
  },
  {
    id: "e2e-coverage",
    description:
      "Report Playwright E2E code-coverage on PRs — the third coverage tier, sibling of `coverage` (unit/integration). Free, entirely inside Actions with GITHUB_TOKEN (no third-party service, private-repo safe). Report-only by default. Unlike vitest there is NO --coverage flag: Playwright is black-box and does not instrument your source, so enabling is a 3-part pipeline documented in the stub header: (1) COLLECT during the E2E run — either an Istanbul instrumented build (`vite-plugin-istanbul` → window.__coverage__, cross-browser, scraped in a Playwright fixture) or the V8 API (`page.coverage`, Chromium-only, needs source maps); (2) REPORT with Monocart (`monocart-coverage-reports`, via the `monocart-reporter` Playwright reporter) which ingests EITHER V8 or Istanbul input and emits Istanbul-format coverage/e2e/coverage-summary.json + coverage-final.json — the SAME two files davelosert reads, so no new commenter is needed; (3) COMMENT by reusing davelosert/vitest-coverage-report-action@v2 pointed at coverage/e2e with a DISTINCT `name: e2e` so its sticky comment does not collide with the unit/integration ones. This step posts from the bkit-tests-e2e-web lane (or, with the combined starter, the bkit-tests-unit job as `coverage`), and needs that lane's job-level permissions block (pull-requests: write + actions: read + contents: read) or the comment cannot post. Ship NO threshold: a whole-app E2E % is denominator-noise (E2E exercises flows, not every branch) — gate the tier on the E2E step succeeding, not a %; for a real E2E % scope Monocart's entryFilter/sourceFilter then ratchet from current. The head.repo == repo guard skips fork PRs (read-only GITHUB_TOKEN); the hashFiles('coverage/e2e/coverage-summary.json') guard skips repos with no E2E coverage. See docs/testing.md § E2E coverage on PRs.",
  },
  // --- The 4-job "green == validated" scaffold. ---
  // These ship commented in the FULL CI SCAFFOLD REFERENCE block at the end of the
  // template bkit-ci.yml. Order matters when adopting — see that block.
  {
    id: "bkit-tests-scope",
    description:
      "Promote run-level detection into a standalone always-on `bkit-tests-scope` job that emits ONE bkit-test-plan JSON (run_level / web_affected / run_e2e / run_live / run_migration), consumed by every tier via `fromJSON(needs.bkit-tests-scope.outputs.plan).<field>`. `run_migration` (#385) gates migration-lane HEAVY replay steps only — the migration job itself stays always-on so e2e/live can `needs:` it. This is the foundation of the scaffold that makes 'CI green' mean 'the planned tests actually ran'. The FULL CI SCAFFOLD REFERENCE (JOB 1) in `.bkit/templates/.github/workflows/bkit-ci.yml` lays the job out step by step (a single-package repo drops the [M] steps; the plan then comes from the commit markers and the event alone); `.bkit/templates.md` § CI workflow covers the `bkit-tests-check` capstone it feeds. Add the planner to the capstone's `needs:` and gate each lane on `run_level != 'none'`. NAME: keep it inside the bkit-tests-* namespace so bkit's CI-Dispatch Gate (which polls for any bkit-tests-* check on the pushed HEAD) can see it. NAMESPACE TRAP: it is the PLANNER, not a test lane — any capstone/guard that treats every bkit-tests-* job as a lane must exempt it BY NAME and assert its result explicitly, or a scope failure goes unasserted and the capstone stays green.",
  },
  {
    id: "affected-graph",
    description:
      "Inside bkit-tests-scope, replace any frozen path-allowlist with `turbo query affected --packages` so run_level / web_affected track the real dependency blast radius. Monorepo-only — drop for single-package repos. Capture turbo stdout/stderr SEPARATELY: `2>&1` merges turbo's banner into the JSON and jq silently falls back to [] (a ghost-green run).",
  },
  {
    id: "bkit-tests-live-web",
    description:
      "Add push-only `bkit-tests-live-web` running the @live tier against the deployed URL. Omit the job if you have no deploy. needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-web], each with result != 'failure' except scope (success) and the lane's own run_live gate. Do NOT also needs: static/unit/integration/e2e. A planned failure reds the capstone. /bkit-ship still filters a job named bkit-tests-live; this name does not match.",
  },
  {
    id: "bkit-tests-migration",
    description:
      "Add always-on `bkit-tests-migration` (#385): (1) prove every migration replays from an EMPTY database (+ seed) on a fresh ephemeral instance; (2) on every push to `dev`/`main`, `db push --linked --include-all` to the shared remote (NOT inside e2e — that races @live). NO job-level `if:` — e2e/live `needs:` this lane; a skip cascades. Gate HEAVY replay steps via `plan.run_migration` (preferred) or an in-job Detect step. Remote push is un-gated by `run_migration` (self-heal) and runs AFTER replay so from-empty failure never reaches remote. Capstone asserts `result == success` whenever scope succeeded. Supply stack reset+seed (Supabase: `db reset --local`; Prisma: `migrate reset`; Drizzle/raw: replay + seed). Fold into bkit-tests-check `needs:` — NOT in series before static/unit (they share no state).",
  },
  {
    id: "bkit-tests-integration",
    description:
      "Add the integration tier as its OWN parallel lane (job) — `bkit-tests-integration`, NOT a step in bkit-tests-unit. WHEN: you have *.integration.test.ts (multi-module wiring / real infra boundaries). Separate lanes give each tier its own honest coverage number, executed-count, and permissions. Wiring: needs:[bkit-tests-scope]; if run_level != 'none'; self-contained (own checkout/setup/install); gate the heavy steps on web_affected; emit `integration_ran` (vitest --reporter=json) so bkit-tests-check can assert it ran > 0. The bkit-stub:coverage integration report (davelosert, name: integration, report-only) posts from THIS lane with its own job-level `pull-requests: write`. Fold the lane into bkit-tests-check's `needs:`.",
  },
  {
    id: "bkit-tests-e2e-web",
    description:
      "Add browser E2E as its own lane — `bkit-tests-e2e-web` (e.g. Playwright). WHEN: you have a browser suite and a deploy or a local stack to hit. needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-web], migration/reset/build result != 'failure'. A feature→dev PR hits a local stack with this PR's migrations; every other event hits the deployment. Same outcome rules everywhere; a pass on retry is a failure; target from TEST_URL alone. Emit e2e_ran. Fold into bkit-tests-check's needs:. DROP if you have no browser E2E.",
  },
  {
    id: "bkit-tests-build-web",
    description:
      "Add `bkit-tests-build-web`. WHEN: a later lane tests this commit's deployment, or a compile break should report on its own. Either compile the workspace, or create the host deployment and publish deployment_url + deployment_id un-promoted (e.g. Vercel). needs:[bkit-tests-scope]. Emits no *_ran count. Fold into bkit-tests-check's needs:.",
  },
  {
    id: "bkit-tests-reset",
    description:
      "Add `bkit-tests-reset`. WHEN: two or more lanes use ONE long-lived resource (demo tenant, seeded account). Runs after scope + migration, takes a lease, and puts the resource in its known state BEFORE those lanes start. needs: [bkit-tests-scope, bkit-tests-migration]; if tenant_target != ''. Pair with bkit-tests-cleanup. DROP both when the resource is provisioned fresh per run.",
  },
  {
    id: "bkit-tests-cleanup",
    description:
      "Add `bkit-tests-cleanup`, the other half of bkit-tests-reset. Runs last, if: always(), after every lane that used the shared resource. Puts it back and releases the lease, including when a lane failed or the run was cancelled. Capstone reds if a planned reset skipped or cleanup failed.",
  },
  {
    id: "bkit-tests-build-ios",
    description:
      "Add `bkit-tests-build-ios`. WHEN: you ship an iOS app. Same rule on a PR, a push, and a dispatch — not a post-merge canary. needs:[bkit-tests-scope]; if: plan.run_native_ios. Pair with bkit-tests-e2e-ios. DROP if you have no iOS app. e.g. a hosted device-build service.",
  },
  {
    id: "bkit-tests-e2e-ios",
    description:
      "Add `bkit-tests-e2e-ios`. needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-ios, bkit-tests-build-web]. The if: must name each needs.result because !cancelled() disables GitHub's skip-on-failed-needs. Emit native_e2e_ran. Fold into bkit-tests-check. DROP if you have no iOS app.",
  },
  {
    id: "bkit-tests-build-android",
    description:
      "Add `bkit-tests-build-android`. Same contract as bkit-tests-build-ios, android tokens. DROP if you have no Android app.",
  },
  {
    id: "bkit-tests-e2e-android",
    description:
      "Add `bkit-tests-e2e-android`. Same contract as bkit-tests-e2e-ios, android tokens. DROP if you have no Android app.",
  },
  {
    id: "logging-probe",
    description:
      "Inside each runtime lane (bkit-tests-e2e-web, bkit-tests-live-web, bkit-tests-e2e-ios, bkit-tests-e2e-android), emit one marked event and ask the error tracker whether it arrived. e.g. Sentry. Skip when that lane did not run the probe. A missing marker reds the lane. DROP if you have no error tracker. This is a step, not a job.",
  },
  {
    id: "bkit-tests-deploy",
    description:
      "Add `bkit-tests-deploy`. needs: [bkit-tests-check, bkit-tests-build-web]. Push to the default branch only. Not a required check. Promotes the exact deployment_id the build lane published. A red job means the previous deployment stays live. The host must not auto-build the default branch, and any hold-promotion-until-check setting stays empty.",
  },
  {
    id: "health",
    description:
      "Copy .bkit/templates/.github/workflows/bkit-health.yml to .github/workflows/bkit-health.yml, then replace {{DEFAULT_BRANCH}} and {{PRODUCTION_URL}} and swap the Vercel lookup for your host's API. It runs after every finished CI run on the default branch, green or red, probes production only when production serves that run's commit, and fails when it cannot tell. Not a required check. DROP if you have no deployed health URL.",
  },
];

export function detectBkitStubs(cwd: string): PreflightFinding[] {
  const findings: PreflightFinding[] = [];
  const ciRel = ciWorkflowPath(cwd);
  const ciPath = path.join(cwd, ciRel);
  if (!fs.existsSync(ciPath)) return findings;
  const content = fs.readFileSync(ciPath, "utf-8");

  // Track which stubs are still commented (sentinel present) so the pair-conflict
  // pass below can compare against per-stub "enabled" markers (the named YAML step
  // appearing uncommented).
  const stubSentinelPresent = new Set<string>();

  for (const stub of BKIT_STUBS) {
    // Sentinel is the full HEADER form — `# bkit-stub:<id> — <description>` — the line the
    // advisory tells you to delete. Prose back-references ("the bkit-stub:coverage integration
    // report posts from HERE") do not match, and `# bkit-stub:e2e —` cannot match stub
    // `e2e-coverage` (a `-` follows, not a space).
    const sentinel = `# bkit-stub:${stub.id}`;
    const re = new RegExp(`(^|\\n)\\s*${sentinel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+—`);
    if (!re.test(content)) continue;
    stubSentinelPresent.add(stub.id);
    findings.push({
      id: `bkit-stub-${stub.id}`,
      severity: "advisory",
      detect: `${ciRel} contains the bkit-stub:${stub.id} sentinel — a commented-in block shipped disabled by default.`,
      action:
        `${stub.description}\n\n` +
        `Before enabling a CI lane, read docs/testing.md § CI test tiers and docs/deployments.md (one run per branch, push base, promote after the capstone). The FULL CI SCAFFOLD REFERENCE in ${ciRel} is the job graph: needs, if, step names. Write the job from that graph and from those docs. Uncomment only a block that is already commented YAML or shell.\n\n` +
        `Decide with the user: (a) enable — uncomment the YAML/shell block AND delete the \`# bkit-stub:${stub.id} — ...\` header line; (b) customise — adjust paths/secrets/conditions before uncommenting; (c) dismiss — delete the entire stub block (header + commented body).\n\n` +
        `Until the sentinel is removed, this advisory fires every install / check.`,
    });
  }

  // Pair-conflict detection: enabling one half of a paired stub without the other
  // produces a silent fallback. Detection signal: the named uncommented YAML step
  // appears (sentinel removed → likely enabled), and the paired stub's sentinel
  // is still present (still disabled).
  // Match a YAML step name uncommented (leading `- name:` not preceded by `#`).
  const isStepEnabled = (stepName: string): boolean => {
    const re = new RegExp(
      `(^|\\n)\\s*- name:\\s*${stepName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    );
    return re.test(content);
  };
  const e2eEnabled = isStepEnabled("Run E2E Tests");
  const vercelEnabled = isStepEnabled("Await Vercel Preview");

  if (vercelEnabled && stubSentinelPresent.has("e2e")) {
    findings.push({
      id: "bkit-stub-pair-vercel-without-e2e",
      severity: "advisory",
      detect: `${ciRel} has \`Await Vercel Preview\` enabled but \`Run E2E Tests\` is still commented (bkit-stub:e2e sentinel present).`,
      action:
        "Either enable the `bkit-stub:e2e` block so the E2E step consumes `steps.vercel.outputs.target_url`, or remove the Vercel-await step — exporting `target_url` with no consumer wastes ~10 minutes of CI per PR.",
    });
  }
  if (e2eEnabled && stubSentinelPresent.has("vercel-await")) {
    findings.push({
      id: "bkit-stub-pair-e2e-without-vercel",
      severity: "advisory",
      detect: `${ciRel} has \`Run E2E Tests\` enabled but \`Await Vercel Preview\` is still commented (bkit-stub:vercel-await sentinel present).`,
      action:
        "Enable the `bkit-stub:vercel-await` block so the E2E step's `TARGET_URL` resolves to the PR's Vercel preview deployment. Without it, `TARGET_URL` falls back to `http://localhost:3000` and the E2E run hits an empty origin.",
    });
  }
  if (e2eEnabled && stubSentinelPresent.has("auto-force-e2e")) {
    findings.push({
      id: "bkit-stub-pair-e2e-without-auto-force",
      severity: "advisory",
      detect: `${ciRel} has \`Run E2E Tests\` enabled but \`bkit-stub:auto-force-e2e\` is still commented.`,
      action:
        "E2E now requires `[force full]` in the commit/PR title on every run. Enable `bkit-stub:auto-force-e2e` to auto-trigger for PRs touching sensitive paths (auth, migrations, payment, api, server) without the manual tag.",
    });
  }

  return findings;
}

const UPDATER_EXAMPLE_PATHS = [
  ".bkit/templates/.github/renovate.json5",
  ".bkit/templates/.github/workflows/bkit-renovate.yml",
  ".bkit/templates/.github/dependabot.yml",
].join("\n  ");

const UPDATER_EXAMPLE: Readonly<Record<DepUpdater, string>> = {
  renovate: ".bkit/templates/.github/renovate.json5",
  dependabot: ".bkit/templates/.github/dependabot.yml",
};

/**
 * Read-only dependency-updater check: `bkit.dependencies.updater` against the configs present.
 *
 * - Both Renovate and Dependabot configs → they open competing PRs.
 * - One config, and the setting does not name it → blocker.
 * - The setting names an updater whose config is absent → blocker.
 * - No updater config, workflows exist, and the setting is unset → point
 *   at the example templates.
 */
export function buildDepUpdaterSetupAdvisory(cwd: string): PreflightFinding | null {
  const configs = findDepUpdaterConfigs(cwd);
  const { renovate, dependabot } = configs;
  const setting = readBkitConfig(cwd).depUpdater;

  if (renovate && dependabot) {
    return {
      id: "dep-updater-both",
      severity: "advisory",
      detect:
        "Both Renovate and Dependabot configs are present. Each opens update PRs for the same packages.",
      action:
        "Keep one. Delete the config you are not using, and turn off that bot in the host UI.",
    };
  }

  const found: DepUpdater | null = renovate ? "renovate" : dependabot ? "dependabot" : null;
  if (found) {
    if (setting === found) return null;
    const name = DEP_UPDATER_NAMES[found];
    const file = configs[found];
    if (setting === null) {
      return {
        id: "dep-updater-unset",
        severity: "blocker",
        detect: `${name} config found (\`${file}\`), but \`bkit.dependencies.updater\` is not \`"${found}"\`.`,
        action: `Set \`bkit.dependencies.updater\` to \`"${found}"\` in package.json. \`bkit upgrade\` sets it when the field is empty.`,
      };
    }
    return {
      id: "dep-updater-mismatch",
      severity: "blocker",
      detect: `\`bkit.dependencies.updater\` is \`"${setting}"\`, but the repo has a ${name} config (\`${file}\`).`,
      action: `Set \`bkit.dependencies.updater\` to \`"${found}"\` in package.json, or delete \`${file}\` and turn ${name} off in the host UI.`,
    };
  }

  if (setting === "renovate" || setting === "dependabot") {
    const name = DEP_UPDATER_NAMES[setting];
    return {
      id: "dep-updater-mismatch",
      severity: "blocker",
      detect: `\`bkit.dependencies.updater\` is \`"${setting}"\`, but no ${name} config was found, so nothing bumps dependencies.`,
      action: `Copy \`${UPDATER_EXAMPLE[setting]}\` into place and own it, or set \`bkit.dependencies.updater\` to the updater you run, or \`"none"\`. See .bkit/templates.md.`,
    };
  }

  if (setting === "none") return null;
  if (!fs.existsSync(path.join(cwd, ".github", "workflows"))) return null;

  return {
    id: "dep-updater-absent",
    severity: "advisory",
    detect:
      "No dependency updater config. SHA-pinned actions and package bumps will not refresh on their own.",
    action:
      "Copy one example and own it:\n\n" +
      `  ${UPDATER_EXAMPLE_PATHS}\n\n` +
      'Use one updater, not both, and set `bkit.dependencies.updater` to its name (`"renovate"` or `"dependabot"`) in package.json. To silence this advisory, set it to `"none"`. See .bkit/templates.md.',
  };
}

// ---------------------------------------------------------------------------
// Project documentation adoption and population
// ---------------------------------------------------------------------------

/** Text of a topic's current starter: the package copy first, then the consumer's own copy. */
function readStarterText(cwd: string, topic: ProjectDocTopic): string | null {
  for (const base of [getPkgRoot(), cwd]) {
    const read = readTextFile(path.join(base, starterPath(topic)));
    if (read.ok) return read.text;
  }
  return null;
}

type DocAssessment = "empty" | "unpopulated" | "candidate";

/** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
function assessDocText(cwd: string, topic: ProjectDocTopic, text: string): DocAssessment {
  if (text.trim() === "") return "empty";
  const normalized = normalizeLegacyText(text);
  const legacy = legacyStarterTopic(text);
  if (legacy === topic) return "unpopulated";
  const starter = readStarterText(cwd, topic);
  if (starter !== null && normalizeLegacyText(starter) === normalized) return "unpopulated";
  // Headings, comments and rules only: nothing a project wrote.
  const meaningful = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) => l !== "" && !l.startsWith("#") && !/^<!--.*-->$/.test(l) && !/^[-*_|: ]+$/.test(l),
    );
  return meaningful.length === 0 ? "unpopulated" : "candidate";
}

/**
 * Report the state of the ten project documents (`docs/architecture.md` ... `docs/setup.md`):
 * the index missing, a document absent, empty, an untouched starter, present but unindexed, or
 * unreadable. A document the index lists at another path (same basename, or a Scope cell
 * `Equivalent to docs/<topic>.md`) counts for its topic. Findings are advisories only and read no
 * file outside the repository. A document that differs from every starter is a candidate for
 * the agent to assess; the mechanical read makes no claim about what it covers.
 */
export function detectProjectDocs(
  cwd: string,
  onSuppressed?: SuppressionReporter,
): PreflightFinding[] {
  const index = readProjectIndex(cwd);
  const rows = index.status === "ok" ? index.rows : [];
  const indexedPaths = new Set(rows.map((r) => r.path));
  const missing: string[] = [];
  const empty: string[] = [];
  const unpopulated: string[] = [];
  const unindexed: string[] = [];
  const unindexedWrapped: string[] = [];
  const duplicates: string[] = [];
  const ambiguous: string[] = [];
  const cleanup: string[] = [];

  for (const topic of PROJECT_DOC_TOPICS) {
    const recommended = projectDocPath(topic);
    const isUsableRow = (row: string) =>
      isInTreePath(row) && inspectRepoFile(cwd, row) === "regular";
    // The first valid same-topic row wins; when none is valid the first row is named in the advisory.
    const equivalent =
      findIndexedEquivalent(rows, topic, isUsableRow) ?? findIndexedEquivalent(rows, topic);
    const defaultState = inspectRepoFile(cwd, recommended);
    let target = recommended;
    if (defaultState === "absent") {
      if (equivalent === null) {
        missing.push(recommended);
        continue;
      }
      target = equivalent;
    }
    if (!isInTreePath(target)) {
      ambiguous.push(`${target} (${recommended}: it resolves outside the repository)`);
      continue;
    }
    const state = target === recommended ? defaultState : inspectRepoFile(cwd, target);
    if (state === "absent") {
      missing.push(recommended);
      continue;
    }
    if (state !== "regular") {
      ambiguous.push(`${target} (${state.unsafe})`);
      continue;
    }
    const read = readTextFile(path.join(cwd, target));
    if (!read.ok) {
      ambiguous.push(`${target} (it could not be read)`);
      continue;
    }
    const wrapper = stripManagedWrapper(read.text);
    if (wrapper.status === "ambiguous") cleanup.push(`${target} (${wrapper.problem})`);
    const assessed = assessDocText(cwd, topic, read.text);
    if (assessed === "empty") empty.push(target);
    else if (assessed === "unpopulated") unpopulated.push(target);
    else if (index.status === "ok" && !indexedPaths.has(target)) {
      const covering = findIndexedEquivalent(
        rows,
        topic,
        (row) => isInTreePath(row) && inspectRepoFile(cwd, row) === "regular",
      );
      if (covering !== null && target === recommended)
        duplicates.push(`${target} (beside ${covering})`);
      else if (wrapper.status === "ambiguous") unindexedWrapped.push(target);
      else unindexed.push(target);
    }
  }

  const findings: PreflightFinding[] = [];
  if (index.status === "missing") {
    findings.push({
      id: "project-docs-index-missing",
      severity: "advisory",
      detect: `${PROJECT_INDEX_PATH} is absent, so agents have no list of the project's own documents to consult.`,
      action: `Run \`bkit install\` to write ${PROJECT_INDEX_PATH}, then add a row under \`## Project Documents\` for each project document you keep. Until then agents warn and fall back to repository evidence.`,
    });
  } else if (index.status === "unreadable") {
    ambiguous.push(`${PROJECT_INDEX_PATH} (${index.reason})`);
  } else {
    for (const row of index.unparsed ?? []) {
      ambiguous.push(`${PROJECT_INDEX_PATH} (unreadable table row: ${row.slice(0, 80)})`);
    }
  }
  if (missing.length > 0) {
    findings.push({
      id: "project-docs-missing",
      severity: "advisory",
      detect: `No project document covers: ${missing.join(", ")}.`,
      action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
    });
  }
  if (empty.length > 0) {
    findings.push({
      id: "project-docs-empty",
      severity: "advisory",
      detect: `These project documents are empty: ${empty.join(", ")}.`,
      action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
    });
  }
  if (unpopulated.length > 0) {
    findings.push({
      id: "project-docs-unpopulated",
      severity: "advisory",
      detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
      action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
    });
  }
  if (unindexed.length > 0) {
    findings.push({
      id: "project-docs-unindexed",
      severity: "advisory",
      detect: `These project documents exist but ${PROJECT_INDEX_PATH} does not list them: ${unindexed.join(", ")}.`,
      action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
    });
  }
  if (unindexedWrapped.length > 0) {
    findings.push({
      id: "project-docs-unindexed",
      severity: "advisory",
      detect: `These project documents exist but ${PROJECT_INDEX_PATH} does not list them, and bkit will not register them while their ownership wrapper stays: ${unindexedWrapped.join(", ")}.`,
      action: `Remove the wrapper as the cleanup advisory describes, then add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH} (or run \`bkit upgrade\` once the wrapper is gone).`,
    });
  }
  if (duplicates.length > 0) {
    findings.push({
      id: "project-docs-unindexed",
      severity: "advisory",
      detect: `These project documents exist but ${PROJECT_INDEX_PATH} lists another document for the same topic: ${duplicates.join(", ")}.`,
      action: `bkit does not register them while the other document is indexed. Keep one: delete the unused file, or add a row for the second one by hand under \`## Project Documents\` in ${PROJECT_INDEX_PATH}.`,
    });
  }
  if (cleanup.length > 0) {
    findings.push({
      id: "project-docs-cleanup",
      severity: "advisory",
      detect: `These project documents still carry a bkit ownership wrapper (\`<!-- bkit:start -->\` / \`<!-- bkit:end -->\` lines or the \`bkit:managed\` notice) that bkit could not remove safely: ${cleanup.join("; ")}.`,
      action: `Edit each file by hand: delete the \`<!-- bkit:start -->\` and \`<!-- bkit:end -->\` lines and the \`bkit:managed\` notice line, keeping the text between them. These documents belong to the project now; bkit changes none of them itself.`,
    });
  }
  if (ambiguous.length > 0) {
    findings.push({
      id: "project-docs-ambiguous",
      severity: "advisory",
      detect: `bkit did not read these project documents or the index: ${ambiguous.join("; ")}.`,
      action: `Replace each with a regular file inside the repository (no symbolic link, no \`..\` path), or repair the \`## Project Documents\` table in ${PROJECT_INDEX_PATH}. bkit changes none of them itself.`,
    });
  }

  return findings.filter((f) => {
    if (!isAdvisorySuppressed(cwd, f.id, f.severity)) return true;
    onSuppressed?.({ id: f.id, scope: "." });
    return false;
  });
}
