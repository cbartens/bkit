// checks/after/tools.ts — local tooling: the Vale package, workflow lint tools, gate stubs, and
// the dependency-updater choice.
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
/**
 * Detect whether vale is installed but write-good styles are not synced.
 * Returns null if vale is not on PATH (silent skip — not an error).
 */
export function detectValePackageNotSynced(cwd) {
    try {
        execSync("vale --version", {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 5000,
        });
    }
    catch {
        return null; // vale not on PATH — silent skip
    }
    if (fs.existsSync(path.join(cwd, ".vale", "styles", "write-good")))
        return null;
    // `vale sync` reads `Packages` from .vale.ini; without one it has nothing to download.
    if (!fs.existsSync(path.join(cwd, ".vale.ini"))) {
        return {
            id: "vale-package-not-synced",
            severity: "advisory",
            detect: "vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.",
            action: "Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/House/*.yml to .vale/styles/House/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.",
        };
    }
    return {
        id: "vale-package-not-synced",
        severity: "advisory",
        detect: "vale is on PATH but .vale/styles/write-good/ is absent — vale packages not synced.",
        action: "Run `vale sync` (one-time per repo) to download the write-good package. lint:prose tries to self-heal this (copy from the main worktree, then `vale sync`) and warns loudly on stderr if it cannot — but until the package is present, prose linting does not run.",
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
export function detectWorkflowLintToolsMissing(cwd) {
    const wfDir = path.join(cwd, ".github", "workflows");
    if (!fs.existsSync(wfDir))
        return null;
    const hasWorkflow = fs.readdirSync(wfDir).some((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    if (!hasWorkflow)
        return null;
    const onPath = (cmd) => {
        try {
            execSync(`${cmd} --version`, { stdio: ["ignore", "pipe", "ignore"], timeout: 5000 });
            return true;
        }
        catch {
            return false;
        }
    };
    const missing = ["actionlint", "shellcheck"].filter((t) => !onPath(t));
    if (missing.length === 0)
        return null;
    return {
        id: "workflow-lint-tools-missing",
        severity: "advisory",
        detect: `Local workflow-lint tooling incomplete (missing: ${missing.join(", ")}). \`pnpm bkit:lint:workflows\` soft-skips without actionlint, and actionlint skips shellcheck on \`run:\` blocks without shellcheck — so GHA-expression and shell issues in .github/workflows/* are caught only in CI.`,
        action: "Install both for pre-push parity (actionlint runs shellcheck automatically when it is on PATH):\n\n    brew install actionlint shellcheck    # macOS\n\nThen `pnpm bkit:lint:workflows` lints `.github/workflows/*` locally before you push.",
    };
}
const BKIT_STUBS = [
    {
        id: "auto-force-e2e",
        file: ".github/workflows/ci.yml",
        description: "Auto-trigger E2E on PRs whose diff touches sensitive paths (auth, migrations, payment, api, server).",
    },
    {
        id: "migrations-immutable",
        file: ".github/workflows/ci.yml",
        description: "Fail PRs that modify supabase/migrations/* files already present on the base branch — enforces migration immutability after merge.",
    },
    {
        id: "test-presence",
        file: ".github/workflows/ci.yml",
        description: "Warn when a workspace package declares a `test` script but contains zero `*.test.ts(x)` / `*.spec.ts(x)` files (guards against accidental deletion).",
    },
    {
        id: "supabase-migrate",
        file: ".github/workflows/ci.yml",
        description: "REMOTE `db push` belongs in `bkit-tests-migration`, not in the monolithic tests job and not in `bkit-tests-e2e-web`. Prefer the migration-lane stub (always-on; replay plan-/path-gated; push on every push to dev/main; e2e/live `needs:` it). Legacy single-job shape still documented under this stub for repos without a migration lane yet — migrate into bkit-tests-migration ASAP. Requires the host access token + project ref (e.g. SUPABASE_ACCESS_TOKEN, or the host's env pull).",
    },
    {
        id: "test-db",
        file: ".github/workflows/ci.yml",
        description: "Assert schema-invariant DB checks (e.g. 'every public table has RLS enabled', no hardcoded table list) so they aren't app-defined. Two co-equal routes — pick by deploy topology, not by whether you can run pgTAP locally: (1) pgTAP (`supabase db test` over `supabase/tests/*.sql`) against a CI-local fixture built from `supabase/migrations` — fast, hermetic, offline, but the fixture can differ from prod, so it can stay green while prod RLS is broken; best when there is no deploy/`@live` tier, or for pure-logic DB unit tests. (2) a `@live` catalog-RPC (SECURITY DEFINER, service_role-only, called over REST; direct port-5432 from CI runners is IPv4-flaky) that validates the real deployed schema in `bkit-tests-live-web` — the recommended default once you have a deploy + `@live` tier (RLS/tenancy especially: a passing local-fixture check is not evidence that prod is locked down). See docs/testing.md § Schema-invariant DB checks.",
    },
    {
        id: "vercel-await",
        file: ".github/workflows/ci.yml",
        description: "Poll the Vercel API for the PR's preview deployment by commit SHA and export `target_url` for E2E. Requires VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID secrets.",
    },
    {
        id: "e2e",
        file: ".github/workflows/ci.yml",
        description: "Run `pnpm test:e2e` gated on `should_run_full` (the `[force full]` commit/PR tag) or `needs_e2e` (auto-force-e2e). Pairs with vercel-await for PR-time runs against the preview deployment.",
    },
    {
        id: "smoke",
        file: ".github/workflows/ci.yml",
        description: "Post-CI smoke test triggered by `workflow_run` after main-CI succeeds. Cannot share a file with push/pull_request triggers — copy the commented YAML to a new `.github/workflows/smoke.yml` file.",
    },
    {
        id: "coverage",
        file: ".github/workflows/ci.yml",
        description: "Report vitest coverage on PRs via davelosert/vitest-coverage-report-action (free, runs inside Actions with GITHUB_TOKEN — no third-party service, safe for private repos). PER-TIER: unit and integration are measured and commented SEPARATELY (a single merged number lets integration mask a hollow unit suite — coverage is a union). Report-only by default: nothing fails the build until a threshold is set. Enabling (documented in the stub header): (1) add `@vitest/coverage-v8` (pinned to your vitest major) plus a vitest.config coverage block with `reporter: ['text','json-summary','json']` and `reportOnFailure: true` — json-summary + json are load-bearing (the action reads coverage-summary.json and coverage-final.json); (2) run coverage TWICE into separate dirs — unit → coverage/unit (exclude integration files), integration → coverage/integration — so each tier gets its own honest number (avoids the last-writer-wins clobber a second same-dir run would cause); (3) add a JOB-LEVEL permissions block to bkit-tests-unit with `actions: read` + `contents: read` + `pull-requests: write` — job-level REPLACES the workflow-level block (not additive) and the Check SHA Cache step needs `actions: read`, so omitting it breaks the cache step; (4) two report steps with distinct `name:` (unit / integration) pointing at each dir's coverage-summary.json + coverage-final.json. SEPARATE LANES (one job per tier): put the integration run + report + its OWN pull-requests: write block in bkit-tests-integration, not bkit-tests-unit — each lane posts its own comment. Thresholds are opt-in and PER TIER: UNIT is the gate — pass `--coverage.thresholds.branches` as a CLI flag on the unit run ONLY (vitest coverage is per-RUN/root config, NOT per-project — `projects` does not scope it and a config `thresholds` block reds BOTH runs; a per-run flag cannot leak to integration; branches is the meaningful floor, set to current and ratchet up). INTEGRATION is REPORT-ONLY — gate it on EXECUTION (the capstone's integration_ran > 0), not a %: a whole-repo integration % is denominator-noise (it covers boundaries/flows, not pure logic). For a real integration %, add `--coverage.include=src/server/**` on the integration run (same CLI-flag idiom as --exclude) then set a floor, or ratchet from current — never a picked number. Fork PRs: GITHUB_TOKEN is read-only, so keep the `head.repo == repo` guard on the steps (or use the action's workflow_run two-workflow pattern). Guard the integration report on `hashFiles('coverage/integration/coverage-summary.json') != ''` so a repo with no integration tier skips it cleanly.",
    },
    {
        id: "e2e-coverage",
        file: ".github/workflows/ci.yml",
        description: "Report Playwright E2E code-coverage on PRs — the third coverage tier, sibling of `coverage` (unit/integration). Free, entirely inside Actions with GITHUB_TOKEN (no third-party service, private-repo safe). Report-only by default. Unlike vitest there is NO --coverage flag: Playwright is black-box and does not instrument your source, so enabling is a 3-part pipeline documented in the stub header: (1) COLLECT during the E2E run — either an Istanbul instrumented build (`vite-plugin-istanbul` → window.__coverage__, cross-browser, scraped in a Playwright fixture) or the V8 API (`page.coverage`, Chromium-only, needs source maps); (2) REPORT with Monocart (`monocart-coverage-reports`, via the `monocart-reporter` Playwright reporter) which ingests EITHER V8 or Istanbul input and emits Istanbul-format coverage/e2e/coverage-summary.json + coverage-final.json — the SAME two files davelosert reads, so no new commenter is needed; (3) COMMENT by reusing davelosert/vitest-coverage-report-action@v2 pointed at coverage/e2e with a DISTINCT `name: e2e` so its sticky comment does not collide with the unit/integration ones. This step posts from the bkit-tests-e2e-web lane (or, with the combined starter, the bkit-tests-unit job as `coverage`), and needs that lane's job-level permissions block (pull-requests: write + actions: read + contents: read) or the comment cannot post. Ship NO threshold: a whole-app E2E % is denominator-noise (E2E exercises flows, not every branch) — gate the tier on the E2E step succeeding, not a %; for a real E2E % scope Monocart's entryFilter/sourceFilter then ratchet from current. The head.repo == repo guard skips fork PRs (read-only GITHUB_TOKEN); the hashFiles('coverage/e2e/coverage-summary.json') guard skips repos with no E2E coverage. See docs/testing.md § E2E coverage on PRs.",
    },
    // --- The 4-job "green == validated" scaffold. ---
    // These ship commented in the FULL CI SCAFFOLD REFERENCE block at the end of the
    // template ci.yml. Order matters when adopting — see that block.
    {
        id: "bkit-tests-scope",
        file: ".github/workflows/ci.yml",
        description: "Promote run-level detection into a standalone always-on `bkit-tests-scope` job that emits ONE bkit-test-plan JSON (run_level / web_affected / run_e2e / run_live / run_migration), consumed by every tier via `fromJSON(needs.bkit-tests-scope.outputs.plan).<field>`. `run_migration` (#385) gates migration-lane HEAVY replay steps only — the migration job itself stays always-on so e2e/live can `needs:` it. This is the foundation of the scaffold that makes 'CI green' mean 'the planned tests actually ran'. The FULL CI SCAFFOLD REFERENCE (JOB 1) in `.bkit/templates/.github/workflows/ci.yml` lays the job out step by step (a single-package repo drops the [M] steps; the plan then comes from the commit markers and the event alone); `.bkit/templates.md` § CI workflow covers the `bkit-tests-check` capstone it feeds. Add the planner to the capstone's `needs:` and gate each lane on `run_level != 'none'`. NAME: keep it inside the bkit-tests-* namespace so bkit's CI-Dispatch Gate (which polls for any bkit-tests-* check on the pushed HEAD) can see it. NAMESPACE TRAP: it is the PLANNER, not a test lane — any capstone/guard that treats every bkit-tests-* job as a lane must exempt it BY NAME and assert its result explicitly, or a scope failure goes unasserted and the capstone stays green.",
    },
    {
        id: "affected-graph",
        file: ".github/workflows/ci.yml",
        description: "Inside bkit-tests-scope, replace any frozen path-allowlist with `turbo query affected --packages` so run_level / web_affected track the real dependency blast radius. Monorepo-only — drop for single-package repos. Capture turbo stdout/stderr SEPARATELY: `2>&1` merges turbo's banner into the JSON and jq silently falls back to [] (a ghost-green run).",
    },
    {
        id: "bkit-tests-live-web",
        file: ".github/workflows/ci.yml",
        description: "Add push-only `bkit-tests-live-web` running the @live tier against the deployed URL. Omit the job if you have no deploy. needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-web], each with result != 'failure' except scope (success) and the lane's own run_live gate. Do NOT also needs: static/unit/integration/e2e. A planned failure reds the capstone. /bkit-ship still filters a job named bkit-tests-live; this name does not match.",
    },
    {
        id: "bkit-tests-migration",
        file: ".github/workflows/ci.yml",
        description: "Add always-on `bkit-tests-migration` (#385): (1) prove every migration replays from an EMPTY database (+ seed) on a fresh ephemeral instance; (2) on every push to `dev`/`main`, `db push --linked --include-all` to the shared remote (NOT inside e2e — that races @live). NO job-level `if:` — e2e/live `needs:` this lane; a skip cascades. Gate HEAVY replay steps via `plan.run_migration` (preferred) or an in-job Detect step. Remote push is un-gated by `run_migration` (self-heal) and runs AFTER replay so from-empty failure never reaches remote. Capstone asserts `result == success` whenever scope succeeded. Supply stack reset+seed (Supabase: `db reset --local`; Prisma: `migrate reset`; Drizzle/raw: replay + seed). Fold into bkit-tests-check `needs:` — NOT in series before static/unit (they share no state).",
    },
    {
        id: "bkit-tests-integration",
        file: ".github/workflows/ci.yml",
        description: "Add the integration tier as its OWN parallel lane (job) — `bkit-tests-integration`, NOT a step in bkit-tests-unit. WHEN: you have *.integration.test.ts (multi-module wiring / real infra boundaries). Separate lanes give each tier its own honest coverage number, executed-count, and permissions. Wiring: needs:[bkit-tests-scope]; if run_level != 'none'; self-contained (own checkout/setup/install); gate the heavy steps on web_affected; emit `integration_ran` (vitest --reporter=json) so bkit-tests-check can assert it ran > 0. The bkit-stub:coverage integration report (davelosert, name: integration, report-only) posts from THIS lane with its own job-level `pull-requests: write`. Fold the lane into bkit-tests-check's `needs:`.",
    },
    {
        id: "bkit-tests-e2e-web",
        file: ".github/workflows/ci.yml",
        description: "Add browser E2E as its own lane — `bkit-tests-e2e-web` (e.g. Playwright). WHEN: you have a browser suite and a deploy or a local stack to hit. needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-web], migration/reset/build result != 'failure'. A feature→dev PR hits a local stack with this PR's migrations; every other event hits the deployment. Same outcome rules everywhere; a pass on retry is a failure; target from TEST_URL alone. Emit e2e_ran. Fold into bkit-tests-check's needs:. DROP if you have no browser E2E.",
    },
    {
        id: "bkit-tests-build-web",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-build-web`. WHEN: a later lane tests this commit's deployment, or a compile break should report on its own. Either compile the workspace, or create the host deployment and publish deployment_url + deployment_id un-promoted (e.g. Vercel). needs:[bkit-tests-scope]. Emits no *_ran count. Fold into bkit-tests-check's needs:.",
    },
    {
        id: "bkit-tests-reset",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-reset`. WHEN: two or more lanes use ONE long-lived resource (demo tenant, seeded account). Runs after scope + migration, takes a lease, and puts the resource in its known state BEFORE those lanes start. needs: [bkit-tests-scope, bkit-tests-migration]; if tenant_target != ''. Pair with bkit-tests-cleanup. DROP both when the resource is provisioned fresh per run.",
    },
    {
        id: "bkit-tests-cleanup",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-cleanup`, the other half of bkit-tests-reset. Runs last, if: always(), after every lane that used the shared resource. Puts it back and releases the lease, including when a lane failed or the run was cancelled. Capstone reds if a planned reset skipped or cleanup failed.",
    },
    {
        id: "bkit-tests-build-ios",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-build-ios`. WHEN: you ship an iOS app. Same rule on a PR, a push, and a dispatch — not a post-merge canary. needs:[bkit-tests-scope]; if: plan.run_native_ios. Pair with bkit-tests-e2e-ios. DROP if you have no iOS app. e.g. a hosted device-build service.",
    },
    {
        id: "bkit-tests-e2e-ios",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-e2e-ios`. needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-ios, bkit-tests-build-web]. The if: must name each needs.result because !cancelled() disables GitHub's skip-on-failed-needs. Emit native_e2e_ran. Fold into bkit-tests-check. DROP if you have no iOS app.",
    },
    {
        id: "bkit-tests-build-android",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-build-android`. Same contract as bkit-tests-build-ios, android tokens. DROP if you have no Android app.",
    },
    {
        id: "bkit-tests-e2e-android",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-e2e-android`. Same contract as bkit-tests-e2e-ios, android tokens. DROP if you have no Android app.",
    },
    {
        id: "logging-probe",
        file: ".github/workflows/ci.yml",
        description: "Inside each runtime lane (bkit-tests-e2e-web, bkit-tests-live-web, bkit-tests-e2e-ios, bkit-tests-e2e-android), emit one marked event and ask the error tracker whether it arrived. e.g. Sentry. Skip when that lane did not run the probe. A missing marker reds the lane. DROP if you have no error tracker. This is a step, not a job.",
    },
    {
        id: "bkit-tests-deploy",
        file: ".github/workflows/ci.yml",
        description: "Add `bkit-tests-deploy`. needs: [bkit-tests-check, bkit-tests-build-web]. Push to the default branch only. Not a required check. Promotes the exact deployment_id the build lane published. A red job means the previous deployment stays live. The host must not auto-build the default branch, and any hold-promotion-until-check setting stays empty.",
    },
    {
        id: "health",
        file: ".github/workflows/ci.yml",
        description: "Copy the commented workflow to .github/workflows/health.yml. workflow_run after CI succeeds on the default branch; smoke the deployment this SHA promoted. Not a required check. DROP if you have no deployed health URL.",
    },
];
export function detectBkitStubs(cwd) {
    const findings = [];
    // Cache file reads so repeated scans of the same file are O(1).
    const fileCache = new Map();
    const readOnce = (file) => {
        if (fileCache.has(file))
            return fileCache.get(file) ?? null;
        const abs = path.join(cwd, file);
        try {
            const content = fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
            fileCache.set(file, content);
            return content;
        }
        catch {
            fileCache.set(file, null);
            return null;
        }
    };
    // Track which stubs are still commented (sentinel present) so the pair-conflict
    // pass below can compare against per-stub "enabled" markers (the named YAML step
    // appearing uncommented).
    const stubSentinelPresent = new Set();
    for (const stub of BKIT_STUBS) {
        const content = readOnce(stub.file);
        if (content === null)
            continue;
        // Sentinel is the full HEADER form — `# bkit-stub:<id> — <description>` — the line the
        // advisory tells you to delete. Prose back-references ("the bkit-stub:coverage integration
        // report posts from HERE") do not match, and `# bkit-stub:e2e —` cannot match stub
        // `e2e-coverage` (a `-` follows, not a space).
        const sentinel = `# bkit-stub:${stub.id}`;
        const re = new RegExp(`(^|\\n)\\s*${sentinel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+—`);
        if (!re.test(content))
            continue;
        stubSentinelPresent.add(stub.id);
        findings.push({
            id: `bkit-stub-${stub.id}`,
            severity: "advisory",
            detect: `${stub.file} contains the bkit-stub:${stub.id} sentinel — a commented-in block shipped disabled by default.`,
            action: `${stub.description}\n\n` +
                `Before enabling a CI lane, read docs/testing.md § CI test tiers and docs/deployments.md (one run per branch, push base, promote after the capstone). The FULL CI SCAFFOLD REFERENCE in ci.yml is the job graph: needs, if, step names. Write the job from that graph and from those docs. Uncomment only a block that is already commented YAML or shell.\n\n` +
                `Decide with the user: (a) enable — uncomment the YAML/shell block AND delete the \`# bkit-stub:${stub.id} — ...\` header line; (b) customise — adjust paths/secrets/conditions before uncommenting; (c) dismiss — delete the entire stub block (header + commented body).\n\n` +
                `Until the sentinel is removed, this advisory fires every install / check.`,
        });
    }
    // Pair-conflict detection: enabling one half of a paired stub without the other
    // produces a silent fallback. Detection signal: the named uncommented YAML step
    // appears (sentinel removed → likely enabled), and the paired stub's sentinel
    // is still present (still disabled).
    const ciContent = readOnce(".github/workflows/ci.yml");
    if (ciContent) {
        // Match a YAML step name uncommented (leading `- name:` not preceded by `#`).
        const isStepEnabled = (stepName) => {
            const re = new RegExp(`(^|\\n)\\s*- name:\\s*${stepName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
            return re.test(ciContent);
        };
        const e2eEnabled = isStepEnabled("Run E2E Tests");
        const vercelEnabled = isStepEnabled("Await Vercel Preview");
        if (vercelEnabled && stubSentinelPresent.has("e2e")) {
            findings.push({
                id: "bkit-stub-pair-vercel-without-e2e",
                severity: "advisory",
                detect: ".github/workflows/ci.yml has `Await Vercel Preview` enabled but `Run E2E Tests` is still commented (bkit-stub:e2e sentinel present).",
                action: "Either enable the `bkit-stub:e2e` block so the E2E step consumes `steps.vercel.outputs.target_url`, or remove the Vercel-await step — exporting `target_url` with no consumer wastes ~10 minutes of CI per PR.",
            });
        }
        if (e2eEnabled && stubSentinelPresent.has("vercel-await")) {
            findings.push({
                id: "bkit-stub-pair-e2e-without-vercel",
                severity: "advisory",
                detect: ".github/workflows/ci.yml has `Run E2E Tests` enabled but `Await Vercel Preview` is still commented (bkit-stub:vercel-await sentinel present).",
                action: "Enable the `bkit-stub:vercel-await` block so the E2E step's `TARGET_URL` resolves to the PR's Vercel preview deployment. Without it, `TARGET_URL` falls back to `http://localhost:3000` and the E2E run hits an empty origin.",
            });
        }
        if (e2eEnabled && stubSentinelPresent.has("auto-force-e2e")) {
            findings.push({
                id: "bkit-stub-pair-e2e-without-auto-force",
                severity: "advisory",
                detect: ".github/workflows/ci.yml has `Run E2E Tests` enabled but `bkit-stub:auto-force-e2e` is still commented.",
                action: "E2E now requires `[force full]` in the commit/PR title on every run. Enable `bkit-stub:auto-force-e2e` to auto-trigger for PRs touching sensitive paths (auth, migrations, payment, api, server) without the manual tag.",
            });
        }
    }
    return findings;
}
const UPDATER_EXAMPLE_PATHS = [
    ".bkit/templates/.github/renovate.json5",
    ".bkit/templates/.github/workflows/renovate.yml",
    ".bkit/templates/.github/dependabot.yml",
].join("\n  ");
function updaterConfigPaths(cwd) {
    const renovateJson5 = path.join(cwd, ".github", "renovate.json5");
    const renovateJson = path.join(cwd, ".github", "renovate.json");
    const dependabotYml = path.join(cwd, ".github", "dependabot.yml");
    const dependabotYaml = path.join(cwd, ".github", "dependabot.yaml");
    const renovate = fs.existsSync(renovateJson5)
        ? renovateJson5
        : fs.existsSync(renovateJson)
            ? renovateJson
            : null;
    const dependabot = fs.existsSync(dependabotYml)
        ? dependabotYml
        : fs.existsSync(dependabotYaml)
            ? dependabotYaml
            : null;
    return { renovate, dependabot };
}
/** `bkit.depUpdater: "none"` silences the missing-updater suggestion. Other values are ignored. */
function depUpdaterOptOut(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return false;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        return bkitField?.depUpdater === "none";
    }
    catch {
        return false;
    }
}
/**
 * Read-only dependency-updater check.
 *
 * - Both Renovate and Dependabot configs → they open competing PRs.
 * - No updater config, workflows exist, and the opt-out is unset → point
 *   at the example templates.
 */
export function buildDepUpdaterSetupAdvisory(cwd) {
    const { renovate, dependabot } = updaterConfigPaths(cwd);
    if (renovate && dependabot) {
        return {
            id: "dep-updater-both",
            severity: "advisory",
            detect: "Both Renovate and Dependabot configs are present. Each opens update PRs for the same packages.",
            action: "Keep one. Delete the config you are not using, and turn off that bot in the host UI.",
        };
    }
    if (renovate || dependabot)
        return null;
    if (depUpdaterOptOut(cwd))
        return null;
    if (!fs.existsSync(path.join(cwd, ".github", "workflows")))
        return null;
    return {
        id: "dep-updater-absent",
        severity: "advisory",
        detect: "No dependency updater config. SHA-pinned actions and package bumps will not refresh on their own.",
        action: "Copy one example and own it:\n\n" +
            `  ${UPDATER_EXAMPLE_PATHS}\n\n` +
            'Use one updater, not both. To silence this advisory, set `bkit.depUpdater` to `"none"` in package.json. See .bkit/templates.md.',
    };
}
