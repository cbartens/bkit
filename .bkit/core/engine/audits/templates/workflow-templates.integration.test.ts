// audits/templates/workflow-templates.integration.test.ts — the shipped `bkit-cloud.yml` and `bkit-ci.yml`
// workflow templates.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("bkit-cloud.yml template — GitHub-only content", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const yml = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("carries id-token: write, GitHub MCP only and no tracker sentinels", () => {
    expect(yml).toContain("id-token: write");
    expect(yml).not.toContain("BKIT_LINEAR_API_KEY");
    expect(yml).not.toContain("mcp__linear__*");
    expect(yml).toContain("mcp__github__*");
    expect(yml).not.toMatch(/@@CLOUD_TRACKER/);
    expect(yml).toMatch(
      /ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/,
    );
  });

  it("claude step passes the four workload identity federation inputs from repo variables", () => {
    const claudeStep = yml.slice(yml.indexOf("uses: anthropics/claude-code-action@"));
    for (const [input, variable] of [
      ["anthropic_federation_rule_id", "ANTHROPIC_FEDERATION_RULE_ID"],
      ["anthropic_organization_id", "ANTHROPIC_ORGANIZATION_ID"],
      ["anthropic_service_account_id", "ANTHROPIC_SERVICE_ACCOUNT_ID"],
      ["anthropic_workspace_id", "ANTHROPIC_WORKSPACE_ID"],
    ]) {
      expect(claudeStep).toContain(`${input}: \${{ vars.${variable} }}`);
    }
  });

  it("every job's runs-on is the {{CLOUD_RUNNER}} placeholder the consumer fills in", () => {
    const runsOn = [...yml.matchAll(/^ {4}runs-on: (.+)$/gm)].map((m) => m[1]);
    expect(runsOn).toEqual(["{{CLOUD_RUNNER}}", "{{CLOUD_RUNNER}}", "{{CLOUD_RUNNER}}"]);
  });

  it("one context job resolves phase + arg; both runner jobs need it and read its outputs", () => {
    expect(yml.match(/- name: Resolve phase \+ brief context/g)).toHaveLength(1);
    expect(yml.match(/^ {4}needs: context$/gm)).toHaveLength(2);
    expect(yml).toContain(
      "if: needs.context.outputs.claude == 'true' && needs.context.outputs.skip != 'true'",
    );
    expect(yml).toContain(
      "if: needs.context.outputs.opencode == 'true' && needs.context.outputs.skip != 'true'",
    );
    expect(yml).toContain("BKIT_PHASE: ${{ needs.context.outputs.phase }}");
    expect(yml).toContain("BKIT_ARG: ${{ needs.context.outputs.arg }}");
  });

  it("header states App required and the bkit:auto label (no bare Auto)", () => {
    expect(yml).toMatch(/bkit:auto/);
    expect(yml).not.toMatch(/Required tracker label on the issue: `Auto`/);
  });
});

// ---------------------------------------------------------------------------
// T3.1 — D3 concurrency-key intra-surface serialisation (PIVOT from STANDARD attempt)
//
// GHA evaluates concurrency.group from trigger-payload context ONLY, before any step
// runs. The dispatch payload exposes only inputs.issue (bare numeric id, e.g. "141");
// the workflow_run payload exposes only head_branch (= feat/{FID-with-slug}, e.g.
// "feat/141-cloud-app"). GHA expression functions (contains/startsWith/endsWith/
// format/join/toJSON/fromJSON/hashFiles) include NO regex, NO split, and NO replace()
// capable of stripping a slug — replace('feat/141-cloud-app','feat/','') yields
// '141-cloud-app', not '141'. Therefore cross-surface token equality is structurally
// impossible via expressions alone for slugged FIDs (bkit-build.md:146 convention).
//
// Chosen design (Option iii): serialise WITHIN each surface separately:
//   - dispatch path  keys on inputs.issue          (bkit-auto-141)
//   - CI-completion  keys on head_branch            (bkit-auto-feat/141-cloud-app)
// Cross-boundary dispatch-vs-auto-ship race is handled by the orchestrator stale-run
// guard + the per-feature workflow lock, not the concurrency key.
// ---------------------------------------------------------------------------

describe("T3.1 — concurrency.group intra-surface serialisation (D3 race prevention)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const rawTemplate = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("concurrency.group dispatch path keys on inputs.issue (bare issue number)", () => {
    const out = rawTemplate;
    // Dispatch surface: group expression must use inputs.issue so concurrent dispatched
    // runs for the same issue cancel each other.
    expect(out).toMatch(/group:.*inputs\.issue/);
    const groupLine = out.split("\n").find((l) => l.includes("group: bkit-auto-"));
    expect(groupLine).toBeDefined();
    expect(groupLine).toContain("inputs.issue");
    // No invalid replace() call — remove() is not a GHA expression function.
    expect(groupLine).not.toContain("replace(");
  });

  it("concurrency.group CI-completion path keys on head_branch (full slugged branch name)", () => {
    const out = rawTemplate;
    // CI-completion surface: group expression must use head_branch directly, so concurrent
    // CI runs for the same branch (e.g. feat/141-cloud-app) cancel each other.
    // A real slugged FID like feat/141-cloud-app keys on the full branch — not a
    // stripped token (replace() cannot reduce '141-cloud-app' to '141').
    expect(out).toMatch(/group:.*github\.event\.workflow_run\.head_branch/);
    const groupLine = out.split("\n").find((l) => l.includes("group: bkit-auto-"));
    expect(groupLine).toBeDefined();
    expect(groupLine).toContain("github.event.workflow_run.head_branch");
    // No replace() — the prior STANDARD attempt's replace() was invalid for slugged FIDs.
    expect(groupLine).not.toContain("replace(");
  });

  it("realistic slugged branch (feat/141-cloud-app) does NOT equal dispatch issue number (141) — cross-surface asymmetry is expected and documented", () => {
    // replace('feat/141-cloud-app', 'feat/', '') = '141-cloud-app' != '141'
    // The two tokens differ across surfaces; each surface uses its own payload identity.
    // Cross-boundary serialisation is the orchestrator's concern.
    const dispatchGroup = `bkit-auto-141`;
    const ciBranch = "feat/141-cloud-app";
    const ciGroup = `bkit-auto-${ciBranch}`; // full branch, no replace()
    expect(dispatchGroup).not.toBe(ciGroup); // different by design
    // Neither path uses a replace() that would produce an incorrect result.
    const stripped = ciBranch.replace("feat/", "");
    expect(stripped).toBe("141-cloud-app"); // NOT '141'
    expect(stripped).not.toBe("141");
  });
});

// ---------------------------------------------------------------------------
// T2.7 — two-tier CI gate positive assertions (GAP-3)
//
// (b) marker->HEAD->fires-to-dispatch render assertion: when 'bkit [auto route]'
//     IS in workflow_run.head_commit.message AND bkit:auto is present, the gate
//     evaluates true and reaches the dispatch step.
// (c) ISSUE single-sourcing assertion: the kill-switch gh issue view $ISSUE is
//     produced by the SHARED-DERIV step (primary: PR body marker; fallback: branch
//     slug extraction). Note: with intra-surface concurrency (T3.1 PIVOT design), the
//     CI-completion concurrency key uses head_branch directly — ISSUE from SHARED-DERIV
//     is the issue number for the kill switch, not the concurrency token. The
//     single-sourcing here means ISSUE is set once in SHARED-DERIV and consumed by the
//     kill switch — not re-derived elsewhere.
// ---------------------------------------------------------------------------

describe("T2.7 — two-tier CI gate positive assertions (GAP-3)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const rawTemplate = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("(b) free-tier if: contains 'bkit [auto route]' — gate fires when marker is HEAD commit", () => {
    const out = rawTemplate;
    // The job-level if: must reference 'bkit [auto route]' in head_commit.message.
    // This closes the marker->HEAD->job-fires chain (positive, not just negative).
    expect(out).toContain(
      "contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')",
    );
    // The runner jobs run only when the context job's skip != 'true' (compound condition
    // includes the secret check).
    expect(out).toContain("needs.context.outputs.skip != 'true'");
    // The dispatch step must invoke the /bkit-auto orchestrator.
    expect(out).toContain(
      'prompt: "/bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"',
    );
  });

  it("(b) dispatch path always proceeds (workflow_dispatch bypasses marker check)", () => {
    const out = rawTemplate;
    // workflow_dispatch runs must always pass the free-tier gate regardless of marker.
    expect(out).toContain("github.event_name == 'workflow_dispatch'");
    // The if: uses || so dispatch path short-circuits the marker check. The
    // free-tier if: carries a same-repo (fork-origin guard) predicate and a
    // dev-success early-exit clause between 'workflow_dispatch' and the marker literal.
    expect(out).toMatch(/workflow_dispatch[\s\S]{0,400}bkit \[auto route\]/);
  });

  it("(c) kill-switch gh issue view uses $ISSUE from SHARED-DERIV step — single-sourced", () => {
    const out = rawTemplate;
    // The kill-switch gh issue view must use $ISSUE (not a re-derived value).
    // $ISSUE must be set by the SHARED-DERIV step (primary: PR body; fallback: branch).
    expect(out).toContain('gh issue view "$ISSUE"');
    // SHARED-DERIV must set ISSUE from PR body primary source (portable grep -oE, not PCRE -oP).
    expect(out).toContain('ISSUE=$(echo "$PR_BODY" | grep -oE');
    // SHARED-DERIV fallback sets ISSUE from FID (branch-derived numeric id): FID stays
    // the FULL slug (shared status.jsonl key with the dev path) and the short ISSUE
    // prefix is derived FROM it.
    // `|| true` is required — on the fix/** arm this runs before the slug allowlist, so
    // a non-FID branch yields no grep match and pipefail would kill the step.
    expect(out).toContain(
      "ISSUE=$(printf '%s' \"$FID\" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)",
    );
    // The ISSUE variable used by gh issue view is the SAME one set by SHARED-DERIV.
    // gh issue view must appear AFTER the SHARED-DERIV machinery (uses its output).
    const sharedDerivStart = out.indexOf("# SHARED-DERIV:");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    const ghIssueViewPos = out.indexOf('gh issue view "$ISSUE"');
    expect(ghIssueViewPos).toBeGreaterThan(sharedDerivStart);
  });

  it("(c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need", () => {
    const containsExpr =
      "contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')";
    const gates = [...rawTemplate.matchAll(/^ {4}if: >-\n([\s\S]*?)^ {4}runs-on:/gm)].map(
      (m) => m[1],
    );
    expect(gates).toHaveLength(1);
    expect(gates[0]).toContain(containsExpr);
    expect(rawTemplate).toMatch(/^ {2}context:\n {4}name: context[^\n]*\n {4}if: >-\n/m);
  });
});

// ---------------------------------------------------------------------------
// pnpm/action-setup@v4 single-SoT enforcement (KN-3)
// ---------------------------------------------------------------------------

describe("KN-3 regression: bkit-ci.yml files must NOT set `with.version:` for pnpm action", () => {
  const SCRIPTS_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  // this file is at <PKG_ROOT>/.bkit/core/engine/install/modules — five levels up to PKG_ROOT
  const PKG_ROOT = path.resolve(SCRIPTS_DIR, "..", "..", "..", "..", "..");

  it("bkit-ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3)", () => {
    const tplPath = path.join(PKG_ROOT, ".bkit/templates/.github/workflows/bkit-ci.yml");
    const tpl = fs.readFileSync(tplPath, "utf-8");
    // pnpm/action-setup@v4 errors if `with.version:` is set when consumer
    // also has package.json#packageManager. Template MUST NOT set `version:`
    // in a `with:` block directly under the pnpm/action-setup step.
    // The regex stops at the next YAML step boundary (`      - `) to avoid
    // false-positive matches from adjacent steps (e.g. setup-node's with.node-version).
    expect(tpl).not.toMatch(/pnpm\/action-setup@v4[^-]*?with:[^-]*?version:/s);
  });

  it("bkit's own .github/workflows/bkit-ci.yml does NOT set `with.version:` for pnpm action (KN-3)", () => {
    const ciPath = path.join(PKG_ROOT, ".github/workflows/bkit-ci.yml");
    const ci = fs.readFileSync(ciPath, "utf-8");
    // Same guard — stops at next step boundary so setup-node's `with: node-version:`
    // does not produce a false positive.
    expect(ci).not.toMatch(/pnpm\/action-setup@v4[^-]*?with:[^-]*?version:/s);
  });
});

// ---------------------------------------------------------------------------
// SHARED-DERIV portability + pipefail safety
//
// The SHARED-DERIV grep region of bkit-cloud.yml uses portable `grep -oE` + `sed`
// (no `grep -oP` PCRE lookbehind), with `|| true` guards on the ISSUE/FID assignments
// so a no-match exits 0 under `set -euo pipefail` and reaches the skip=true path.
// ---------------------------------------------------------------------------

describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");

  function readBkitCloudYml(): string {
    return fs.readFileSync(path.join(pkgRoot, ".github", "workflows", "bkit-cloud.yml"), "utf-8");
  }

  function readBkitCloudTemplate(): string {
    return fs.readFileSync(
      path.join(pkgRoot, ".bkit", "templates", ".github", "workflows", "bkit-cloud.yml"),
      "utf-8",
    );
  }

  it("(1a) canonical bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard", () => {
    // grep -oP relies on PCRE, unavailable on BSD/macOS grep.
    const canonical = readBkitCloudYml();
    expect(canonical).not.toContain("grep -oP");
  });

  it("(1a) template bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard", () => {
    const template = readBkitCloudTemplate();
    expect(template).not.toContain("grep -oP");
  });

  it("(1b) ISSUE assignment in canonical has || true failure guard (pipefail safety)", () => {
    // Finding 1 (challenge-1): without || true, `set -euo pipefail` aborts the step
    // when grep exits 1 on a no-match PR body, making fallback/fail-safe dead code.
    // The ISSUE assignment must end with `|| true` so a no-match exits 0.
    const canonical = readBkitCloudYml();
    // The form: grep -oE ... | sed ... | head -1 || true
    expect(canonical).toMatch(/ISSUE=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1b) FID assignment in canonical has || true failure guard (pipefail safety)", () => {
    const canonical = readBkitCloudYml();
    expect(canonical).toMatch(/FID=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1b) ISSUE assignment in template has || true failure guard (pipefail safety)", () => {
    const template = readBkitCloudTemplate();
    expect(template).toMatch(/ISSUE=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1b) FID assignment in template has || true failure guard (pipefail safety)", () => {
    const template = readBkitCloudTemplate();
    expect(template).toMatch(/FID=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1c) SHARED-DERIV extraction snippet exits 0 under set -euo pipefail when PR body is empty (real-tool validation)", () => {
    // Finding 1 (challenge-1): the original code aborted on empty PR body.
    // This test extracts the actual ISSUE/FID assignment commands from the canonical
    // workflow and executes them under `set -euo pipefail` with an empty PR body to
    // prove the || true guards make the step exit 0 (not exit 1).
    const canonical = readBkitCloudYml();

    // Extract the two assignment lines from the SHARED-DERIV machinery.
    const sharedDerivStart = canonical.indexOf("# SHARED-DERIV:");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    const sharedDerivBlock = canonical.slice(sharedDerivStart);

    // Pull out the ISSUE= and FID= lines (they contain the grep commands).
    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
    expect(
      issueLineMatch,
      "ISSUE= assignment line must be found after SHARED-DERIV",
    ).not.toBeNull();
    expect(fidLineMatch, "FID= assignment line must be found after SHARED-DERIV").not.toBeNull();

    const issueLine = issueLineMatch![0]!.trim();
    const fidLine = fidLineMatch![0]!.trim();

    // Build a minimal shell script that runs both assignments under strict mode
    // with an empty PR_BODY and asserts the variables are empty (no-match, no abort).
    const script = [
      "set -euo pipefail",
      'PR_BODY=""',
      issueLine,
      fidLine,
      // Assert variables are empty (grep found nothing, || true kept us alive)
      '[ -z "$ISSUE" ] || { echo "FAIL: ISSUE should be empty, got: $ISSUE"; exit 2; }',
      '[ -z "$FID" ]   || { echo "FAIL: FID should be empty, got: $FID"; exit 2; }',
      'echo "OK: both empty, script did not abort"',
    ].join("\n");

    const result = spawnSync("bash", ["-c", script], {
      encoding: "utf-8",
      timeout: 10_000,
    });

    expect(
      result.status,
      `SHARED-DERIV snippet aborted under set -euo pipefail with empty PR body.\n` +
        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).toBe(0);
    expect(result.stdout).toContain("OK: both empty, script did not abort");
  });

  it("(1c) SHARED-DERIV extraction snippet correctly parses a well-formed PR body (positive case)", () => {
    // Complementary positive case: a PR body WITH the markers must yield the correct values.
    const canonical = readBkitCloudYml();

    const sharedDerivBlock = canonical.slice(canonical.indexOf("# SHARED-DERIV:"));

    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
    expect(issueLineMatch).not.toBeNull();
    expect(fidLineMatch).not.toBeNull();

    const issueLine = issueLineMatch![0]!.trim();
    const fidLine = fidLineMatch![0]!.trim();

    const script = [
      "set -euo pipefail",
      'PR_BODY="<!-- bkit:issue=#141 bkit:fid=141-cloud-app -->"',
      issueLine,
      fidLine,
      '[ "$ISSUE" = "141" ] || { echo "FAIL: expected ISSUE=141, got: $ISSUE"; exit 2; }',
      '[ "$FID" = "141-cloud-app" ] || { echo "FAIL: expected FID=141-cloud-app, got: $FID"; exit 2; }',
      'echo "OK: ISSUE=$ISSUE FID=$FID"',
    ].join("\n");

    const result = spawnSync("bash", ["-c", script], {
      encoding: "utf-8",
      timeout: 10_000,
    });

    expect(
      result.status,
      `SHARED-DERIV snippet failed to parse well-formed PR body.\n` +
        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).toBe(0);
    expect(result.stdout).toContain("OK: ISSUE=141 FID=141-cloud-app");
  });
});
