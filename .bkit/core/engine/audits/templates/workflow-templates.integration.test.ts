// audits/templates/workflow-templates.integration.test.ts — the shipped `bkit-cloud.yml` and `bkit-ci.yml`
// workflow templates.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

/** A step's directory with the workspace prefix and slashes stripped; "." when unset. */
function normStepDir(v: unknown): string {
  const dir = (typeof v === "string" ? v : ".")
    .replace(/^\$\{\{\s*github\.workspace\s*\}\}\/?/, "")
    .replace(/^\.\//, "")
    .replace(/\/+$/, "");
  return dir.length > 0 ? dir : ".";
}

/** Evaluates a checkout `ref` expression for a workflow_run event on the given head branch. */
function evalCheckoutRef(ref: string, headBranch: string): unknown {
  const expr = /^\$\{\{([\s\S]*)\}\}$/.exec(ref.trim())?.[1];
  const github = {
    event_name: "workflow_run",
    event: { workflow_run: { head_branch: headBranch } },
  };
  const startsWith = (a: unknown, b: unknown) => String(a).startsWith(String(b));
  return new Function("github", "startsWith", `return (${expr ?? JSON.stringify(ref)});`)(
    github,
    startsWith,
  );
}

describe("bkit-cloud.yml template — GitHub-only content", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const yml = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("carries id-token: write, GitHub MCP only and the tracker read keys in the context step", () => {
    expect(yml).toContain("id-token: write");
    expect(yml).not.toContain("mcp__linear__*");
    expect(yml).not.toContain("mcp__jira__*");
    const ctxStart = yml.indexOf("- name: Resolve phase + brief context");
    for (const name of ["BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"]) {
      expect(yml.indexOf(`${name}: \${{ secrets.${name} }}`)).toBeGreaterThan(ctxStart);
    }
    expect(yml).toContain("mcp__github__*");
    expect(yml).not.toMatch(/@@CLOUD_TRACKER/);
    expect(yml).toMatch(/secrets\.BKIT_ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/);
  });

  it("claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY", () => {
    expect(yml).toContain("secrets.BKIT_ANTHROPIC_API_KEY");
    expect(yml).not.toMatch(/secrets\.ANTHROPIC_API_KEY/);
  });

  it("opencode dispatch maps each provider BKIT_ secret to its own env name", () => {
    const start = yml.indexOf("- name: Dispatch /bkit-auto on opencode runner");
    expect(start).toBeGreaterThan(-1);
    const step = yml.slice(start);
    for (const name of [
      "BKIT_OPENCODE_API_KEY",
      "BKIT_OPENROUTER_API_KEY",
      "BKIT_OLLAMA_API_KEY",
    ]) {
      expect(step).toContain(`${name}: \${{ secrets.${name} }}`);
    }
    expect(yml).not.toContain("OPENCODE_PROVIDER_KEY");
  });

  it("context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch", () => {
    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
      jobs: { context: { steps: Array<{ uses?: string; with?: Record<string, unknown> }> } };
    };
    const checkout = doc.jobs.context.steps
      .filter((st) => st.uses?.startsWith("actions/checkout@"))
      .find((st) => st.with?.path === "pr-head");
    expect(checkout, "context job has no pr-head actions/checkout step").toBeDefined();
    const ref = String(checkout!.with!.ref);
    const expr = /^\$\{\{([\s\S]*)\}\}$/.exec(ref.trim())?.[1];
    expect(expr, `ref is not a single expression: ${ref}`).toBeDefined();
    const evaluate = (eventName: string, headBranch: string | undefined): unknown => {
      const github = {
        event_name: eventName,
        event: { workflow_run: { head_branch: headBranch } },
      };
      const startsWith = (a: unknown, b: unknown) => String(a).startsWith(String(b));
      return new Function("github", "startsWith", `return (${expr});`)(github, startsWith);
    };
    expect(evaluate("workflow_run", "feat/363-widen-bkit-cloud-trigger")).toBe(
      "feat/363-widen-bkit-cloud-trigger",
    );
    expect(evaluate("workflow_run", "dev")).toBe("dev");
    expect(evaluate("workflow_dispatch", undefined)).toBe("dev");
  });

  it("context job installs and runs bkit from dev, never from the feat/** PR head", () => {
    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
      jobs: {
        context: {
          steps: Array<{
            name?: string;
            uses?: string;
            "working-directory"?: string;
            with?: Record<string, unknown>;
          }>;
        };
      };
    };
    const steps = doc.jobs.context.steps;
    const installIdx = steps.findIndex((st) => st.name === "Install bkit");
    expect(installIdx, "context job has no Install bkit step").toBeGreaterThan(-1);
    const installDir = normStepDir(steps[installIdx]!["working-directory"]);
    const checkoutsBeforeInstall = steps
      .slice(0, installIdx)
      .filter((st) => st.uses?.startsWith("actions/checkout@"));
    const intoInstallDir = checkoutsBeforeInstall.filter(
      (st) => normStepDir(st.with?.path) === installDir,
    );
    expect(intoInstallDir.length, "no checkout feeds the Install bkit directory").toBeGreaterThan(
      0,
    );
    const head = "feat/363-widen-bkit-cloud-trigger";
    for (const co of intoInstallDir) {
      expect(evalCheckoutRef(String(co.with?.ref), head)).toBe("dev");
    }
    // The checkout that populates the install directory last decides what runs; it resolves to dev.
    const last = intoInstallDir[intoInstallDir.length - 1]!;
    expect(evalCheckoutRef(String(last.with?.ref), head)).not.toBe(head);
  });

  it("context job tooling setup steps before Install bkit cannot fail the job", () => {
    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
      jobs: {
        context: {
          steps: Array<{ name?: string; uses?: string; "continue-on-error"?: unknown }>;
        };
      };
    };
    const steps = doc.jobs.context.steps;
    const installIdx = steps.findIndex((st) => st.name === "Install bkit");
    expect(installIdx, "context job has no Install bkit step").toBeGreaterThan(-1);
    const tooling = steps
      .slice(0, installIdx)
      .filter((st) => /^(pnpm\/action-setup|actions\/setup-node)@/.test(String(st.uses)));
    expect(tooling.length, "no pnpm / setup-node step before Install bkit").toBe(2);
    for (const st of tooling) {
      expect(st["continue-on-error"], `${st.uses} can fail the context job`).toBe(true);
    }
  });

  it("context job runs the workspace-root checkout before every nested `path:` checkout", () => {
    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
      jobs: { context: { steps: Array<{ uses?: string; with?: Record<string, unknown> }> } };
    };
    const checkouts = doc.jobs.context.steps.filter((st) =>
      st.uses?.startsWith("actions/checkout@"),
    );
    const rootIdx = checkouts.findIndex((st) => normStepDir(st.with?.path) === ".");
    const nestedIdx = checkouts.findIndex((st) => normStepDir(st.with?.path) !== ".");
    expect(rootIdx, "no root checkout").toBeGreaterThan(-1);
    expect(nestedIdx, "no nested checkout").toBeGreaterThan(-1);
    expect(rootIdx).toBeLessThan(nestedIdx);
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
    expect(runsOn).toEqual([
      "{{CLOUD_RUNNER}}",
      "{{CLOUD_RUNNER}}",
      "{{CLOUD_RUNNER}}",
      "{{CLOUD_RUNNER}}",
    ]);
  });

  it("one context job resolves phase + arg; every runner job needs it and read its outputs", () => {
    expect(yml.match(/- name: Resolve phase \+ brief context/g)).toHaveLength(1);
    expect(yml.match(/^ {4}needs: context$/gm)).toHaveLength(3);
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

  it("(c) the label gate is bkit_gate, defined after SHARED-DERIV and called on both arms; no gh issue view remains", () => {
    const out = rawTemplate;
    expect(out).not.toContain("gh issue view");
    const sharedDerivStart = out.indexOf("# SHARED-DERIV:");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    expect(out.indexOf("bkit_gate() {")).toBeGreaterThan(sharedDerivStart);
    expect(out.match(/bkit_gate "\$ISSUE" \|\|/g)).toHaveLength(2);
    // The feat arm recovers FID + issue through bkit, not a marker regex.
    expect(out).toContain('bkit_cli fids parse --marker "$PR_BODY" --branch "$BRANCH" --json');
  });

  it("(c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need", () => {
    const containsExpr =
      "contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')";
    const gates = [...rawTemplate.matchAll(/^ {4}if: >-\n([\s\S]*?)^ {4}runs-on:/gm)].map(
      (m) => m[1],
    );
    expect(gates).toHaveLength(1);
    expect(gates[0]).toContain(containsExpr);
    expect(rawTemplate).toMatch(/^ {2}context:\n {4}name: bkit-cloud-context[^\n]*\n {4}if: >-\n/m);
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
// The SHARED-DERIV region of bkit-cloud.yml reads the FID and issue id from
// `bkit fids parse` + `jq` (no `grep -oP` PCRE lookbehind), with `|| true` guards on the
// ISSUE/FID assignments so a no-match exits 0 under `set -euo pipefail` and reaches the
// skip=true path.
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

  it("(1b) feat-arm FID/ISSUE parse lines in canonical and template carry a || true failure guard (pipefail safety)", () => {
    for (const text of [readBkitCloudYml(), readBkitCloudTemplate()]) {
      expect(text).toMatch(/PARSED=\$\(bkit_cli fids parse[^\n]*\|\| true\)/);
      expect(text).toMatch(/FID=\$\(printf '%s' "\$PARSED" \| jq[^\n]*\|\| true\)/);
      expect(text).toMatch(/ISSUE=\$\(printf '%s' "\$PARSED" \| jq[^\n]*\|\| true\)/);
    }
  });

  it("(1c) the FID/ISSUE extraction lines exit 0 under set -euo pipefail on an empty parse and read a recorded parse (real-tool validation)", () => {
    const canonical = readBkitCloudYml();
    // The feat/** arm reads the marker + branch parse (`.fid` / `.issueId`); the dev arm above
    // it reads `.fidNamed` from the subject parse.
    const block = canonical.slice(canonical.indexOf("# feat/** pre-merge path"));
    const fidLine = block.match(/FID=\$\(printf '%s' "\$PARSED" \| jq[^\n]+\)/)![0].trim();
    const issueLine = block.match(/ISSUE=\$\(printf '%s' "\$PARSED" \| jq[^\n]+\)/)![0].trim();
    const run = (parsed: string) =>
      spawnSync(
        "bash",
        [
          "-c",
          [
            "set -euo pipefail",
            `PARSED='${parsed}'`,
            fidLine,
            issueLine,
            'echo "FID=$FID ISSUE=$ISSUE"',
          ].join("\n"),
        ],
        { encoding: "utf-8", timeout: 10_000 },
      );
    const empty = run("");
    expect(empty.status, empty.stderr).toBe(0);
    expect(empty.stdout).toContain("FID= ISSUE=");
    const parsed = run(
      '{"fid":"141-cloud-app","issueId":"141","source":"marker","tracker":"github"}',
    );
    expect(parsed.status, parsed.stderr).toBe(0);
    expect(parsed.stdout).toContain("FID=141-cloud-app ISSUE=141");
  });
});

// ---------------------------------------------------------------------------
// Router dispatch jobs — tracker secrets at step scope, the codex job, the install blocks.
// ---------------------------------------------------------------------------

interface CloudStep {
  name?: string;
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  env?: Record<string, unknown>;
  with?: Record<string, unknown>;
}
interface CloudJob {
  needs?: string | string[];
  if?: string;
  env?: Record<string, unknown>;
  permissions?: Record<string, string>;
  steps: CloudStep[];
}
interface CloudDoc {
  env?: Record<string, unknown>;
  jobs: Record<string, CloudJob>;
}

const secretMapped = (env: Record<string, unknown> | undefined, name: string): boolean =>
  env?.[name] === `\${{ secrets.${name} }}`;
const isDispatchStep = (st: CloudStep): boolean =>
  Boolean(
    st.uses?.startsWith("anthropics/claude-code-action@") ||
    st.uses?.startsWith("openai/codex-action@") ||
    st.name?.startsWith("Dispatch /bkit-auto on opencode"),
  );
const dispatchSteps = (doc: CloudDoc): Array<[string, CloudStep]> =>
  Object.entries(doc.jobs)
    .filter(([id]) => id !== "context")
    .flatMap(([id, job]) =>
      job.steps.filter(isDispatchStep).map((st): [string, CloudStep] => [id, st]),
    );
const withOf = (st: CloudStep): Record<string, unknown> => st.with ?? {};
const writesConfigToml = (st: CloudStep): boolean => /config\.toml/.test(st.run ?? "");
const isAlwaysRun = (st: CloudStep): boolean => st.if?.trim() === "always()" && Boolean(st.run);
const dummyEnv = (st: CloudStep): Record<string, string> =>
  Object.fromEntries(Object.keys(st.env ?? {}).map((k) => [k, `value-${k}`]));

describe("bkit-cloud.yml template — dispatch jobs", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const raw = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );
  const filled = raw
    .replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")
    .replaceAll("{{NODE_VERSION}}", "22");
  const doc = parseYaml(filled) as CloudDoc;
  const codexJob = (): CloudJob => {
    const job = doc.jobs.codex;
    expect(job, "no codex job").toBeDefined();
    return job!;
  };
  const codexActionIndex = (job: CloudJob) =>
    job.steps.findIndex((st) => st.uses?.startsWith("openai/codex-action@"));
  const installIndex = (job: CloudJob) =>
    job.steps.findIndex((st) => /pnpm install --frozen-lockfile/.test(st.run ?? ""));
  const has = (cmd: string, args: string[]) =>
    spawnSync(cmd, args, { stdio: "ignore" }).status === 0;

  it("tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env", () => {
    const secrets = ["BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"];
    const mapped = secretMapped;
    const ctx = doc.jobs.context!.steps.find((st) => st.id === "ctx");
    expect(ctx, "no ctx step").toBeDefined();
    for (const name of secrets) expect(mapped(ctx!.env, name), `ctx ${name}`).toBe(true);

    const dispatch = dispatchSteps(doc);
    expect(dispatch.map(([id]) => id).sort()).toEqual(expect.arrayContaining(["opencode", "run"]));
    for (const [id, st] of dispatch) {
      for (const name of secrets) expect(mapped(st.env, name), `${id} ${name}`).toBe(true);
    }
    for (const [id, job] of Object.entries(doc.jobs)) {
      for (const name of secrets) expect(job.env?.[name], `job ${id} env ${name}`).toBeUndefined();
    }
    for (const name of secrets) expect(doc.env?.[name], `workflow env ${name}`).toBeUndefined();
  });

  it("codex job runs only when the context job selects codex and skip is not true", () => {
    const job = codexJob();
    expect(job.if?.trim()).toBe(
      "needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'",
    );
    expect(job.needs).toBe("context");
    expect(job.permissions).toEqual(doc.jobs.opencode!.permissions);
  });

  it("codex job installs dependencies before openai/codex-action", () => {
    const job = codexJob();
    const action = codexActionIndex(job);
    const install = installIndex(job);
    expect(action, "no openai/codex-action step").toBeGreaterThan(-1);
    expect(install, "no pnpm install --frozen-lockfile step").toBeGreaterThan(-1);
    expect(install).toBeLessThan(action);
    const before = job.steps.slice(0, install);
    expect(before.some((st) => st.uses?.startsWith("actions/setup-node@"))).toBe(true);
    expect(before.some((st) => st.uses?.startsWith("pnpm/action-setup@"))).toBe(true);
    expect(before.some((st) => st.uses?.startsWith("actions/checkout@"))).toBe(true);
  });

  it("codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation", () => {
    const action = codexJob().steps.find((st) => st.uses?.startsWith("openai/codex-action@"));
    expect(action, "no openai/codex-action step").toBeDefined();
    expect(action!.uses).toMatch(/^openai\/codex-action@[0-9a-f]{40}$/);
    expect(raw).toMatch(/uses: openai\/codex-action@[0-9a-f]{40} # v1\s*$/m);
    expect(String(action!.with?.["codex-version"])).toMatch(/^\d+\.\d+\.\d+$/);
    expect(raw).toMatch(
      /# renovate: datasource=npm depName=@openai\/codex\n\s*codex-version: "\d+\.\d+\.\d+"/,
    );
  });

  it("codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt", () => {
    const action = codexJob().steps.find((st) => st.uses?.startsWith("openai/codex-action@"));
    expect(action, "no openai/codex-action step").toBeDefined();
    const w = withOf(action!);
    expect(w["sandbox"]).toBe("danger-full-access");
    expect(String(w["allow-bots"])).toBe("true");
    expect(w["openai-api-key"]).toBe("${{ secrets.BKIT_OPENAI_API_KEY }}");
    expect(w["prompt"]).toBe(
      "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}",
    );
    expect(String(w["codex-home"])).toContain("codex-home");
    expect(raw).not.toMatch(/secrets\.OPENAI_API_KEY/);
  });

  it("trust step writes a codex-home config.toml trusting the workspace", () => {
    const step = codexJob().steps.find(writesConfigToml);
    expect(step, "no step writes config.toml").toBeDefined();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-codex-trust-"));
    try {
      const runnerTemp = path.join(dir, "runner-temp");
      const workspace = path.join(dir, "ws");
      fs.mkdirSync(runnerTemp);
      fs.mkdirSync(workspace);
      const res = spawnSync("bash", ["-eo", "pipefail", "-c", step!.run!], {
        cwd: workspace,
        encoding: "utf8",
        env: {
          ...process.env,
          RUNNER_TEMP: runnerTemp,
          GITHUB_WORKSPACE: workspace,
          GITHUB_ENV: path.join(dir, "env"),
          GITHUB_OUTPUT: path.join(dir, "out"),
        },
      });
      expect(res.status, res.stderr).toBe(0);
      const config = path.join(runnerTemp, "codex-home", "config.toml");
      expect(fs.existsSync(config), "no codex-home/config.toml").toBe(true);
      const toml = fs.readFileSync(config, "utf8");
      expect(toml).toContain(`[projects."${workspace}"]`);
      expect(toml).toMatch(/trust_level\s*=\s*"trusted"/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it.skipIf(!has("actionlint", ["-version"]))("filled bkit-cloud.yml passes actionlint", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-lint-"));
    try {
      const file = path.join(dir, "bkit-cloud.yml");
      fs.writeFileSync(file, filled);
      const r = spawnSync("actionlint", ["-no-color", file], { encoding: "utf-8" });
      expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("codex summary step runs under if: always() and writes action, commits and comments", () => {
    const job = codexJob();
    const action = codexActionIndex(job);
    expect(action, "no openai/codex-action step").toBeGreaterThan(-1);
    const step = job.steps.slice(action + 1).find(isAlwaysRun);
    expect(step, "no if: always() summary step after the action").toBeDefined();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-codex-summary-"));
    try {
      const stubBin = path.join(dir, "bin");
      fs.mkdirSync(stubBin);
      fs.writeFileSync(path.join(stubBin, "gh"), "#!/usr/bin/env bash\necho 0\n", { mode: 0o755 });
      const ws = path.join(dir, "ws");
      fs.mkdirSync(ws);
      for (const args of [
        ["init", "-q", "-b", "dev"],
        ["config", "user.email", "t@t.co"],
        ["config", "user.name", "t"],
        ["commit", "-q", "--allow-empty", "-m", "base"],
      ]) {
        spawnSync("git", args, { cwd: ws });
      }
      const summary = path.join(dir, "summary");
      fs.writeFileSync(summary, "");
      const stepEnv = dummyEnv(step!);
      spawnSync("bash", ["-c", step!.run!], {
        cwd: ws,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${stubBin}:${process.env.PATH}`,
          GITHUB_STEP_SUMMARY: summary,
          GITHUB_WORKSPACE: ws,
          GITHUB_REPOSITORY: "owner/repo",
          RUNNER_TEMP: dir,
          GH_TOKEN: "dummy",
          ...stepEnv,
        },
      });
      const text = fs.readFileSync(summary, "utf8");
      for (const field of ["action", "commits", "comments"]) {
        expect(text.toLowerCase(), `summary lacks ${field}`).toContain(field);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("opencode job installs dependencies before its dispatch step", () => {
    const job = doc.jobs.opencode!;
    const install = installIndex(job);
    const dispatch = job.steps.findIndex((st) =>
      st.name?.startsWith("Dispatch /bkit-auto on opencode"),
    );
    expect(dispatch, "no opencode dispatch step").toBeGreaterThan(-1);
    expect(install, "no pnpm install --frozen-lockfile step").toBeGreaterThan(-1);
    expect(install).toBeLessThan(dispatch);
    const before = job.steps.slice(0, install);
    expect(before.some((st) => st.uses?.startsWith("actions/setup-node@"))).toBe(true);
    expect(before.some((st) => st.uses?.startsWith("pnpm/action-setup@"))).toBe(true);
  });
});
