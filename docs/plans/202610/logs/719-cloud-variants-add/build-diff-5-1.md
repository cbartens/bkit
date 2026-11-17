diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 5c98bb5c6..e0ca95a3f 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -83,7 +83,7 @@ Placeholders: the copies keep them raw, so replace each one in your copy:
 | --- | --- | --- | --- |
 | `{{DEFAULT_BRANCH}}` | `bkit-ci.yml` (`on.push` / `on.pull_request` branches; stub comments), `bkit-trivy.yml` (`on.push` / `on.pull_request` branches), `bkit-health.yml` (`on.workflow_run` branches) | your production branch | `origin/HEAD` unless it is `dev`, else `main` |
 | `{{PRODUCTION_URL}}` | `bkit-health.yml` (`env.PRODUCTION_URL`) | the origin production serves | `https://example.com` |
-| `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
+| `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes), `bkit-cloud.yml` (`actions/setup-node` `node-version`, the context job's bkit install) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
 | `{{CLOUD_RUNNER}}` | `bkit-cloud.yml` (`runs-on`, all three jobs) | a runner label | `ubuntu-latest` |
 | `{{SCRIPT_PATH}}` | `bkit-launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
 | `{{ENV_FILE}}` | `bkit-launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index a6f2f2982..925832ea4 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -229,6 +229,13 @@ const ADOPTED: Record<string, Entry> = {
         with: "runs-on: ubuntu-latest",
         count: 3,
       },
+      {
+        kind: "placeholder",
+        what: "Node version from .nvmrc",
+        fill: "node-version: {{NODE_VERSION}}\n",
+        with: "node-version-file: .nvmrc\n",
+        count: 1,
+      },
     ],
   },
   ".github/workflows/bkit-health.yml": {
diff --git a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
index 800c2bf0f..e17bcd7ee 100644
--- a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
@@ -15,6 +15,8 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it } from "vitest";
 
+import { requireTsx } from "../../../../../vitest.tsx-bin";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const TEMPLATE_PATH = path.join(REPO_ROOT, ".bkit/templates/.github/workflows/bkit-cloud.yml");
 
@@ -75,6 +77,7 @@ const hasBash = spawnSync("bash", ["--version"]).status === 0;
 // so one binary serves every scenario below without per-test file churn.
 // ---------------------------------------------------------------------------
 const GH_STUB = `#!/usr/bin/env bash
+[ -n "\${STUB_GH_LOG:-}" ] && printf '%s\\n' "$*" >> "$STUB_GH_LOG"
 case "$*" in
   "run list "*"--workflow bkit-ci.yml"*)
     printf '%s' "\${STUB_LATEST_CI_SHA:-}"
@@ -91,6 +94,11 @@ case "$*" in
   "api repos/"*"/pulls"*)
     printf '%s' "\${STUB_API_PR_BODY:-}"
     ;;
+  "api --paginate "*"/comments"*)
+    ;;
+  "api repos/"*"/issues/"*)
+    printf '%s' "\${STUB_ISSUE_LABELS:-}" | jq -Rn '{title:"t",state:(env.STUB_ISSUE_STATE // "open"),html_url:"u",body:"",labels:[inputs | select(. != "") | {name: .}]}'
+    ;;
   *)
     echo "gh-stub: unhandled invocation: $*" >&2
     exit 1
@@ -124,7 +132,10 @@ function setupFixture(tmpRoot: string): Fixture {
 
   fs.mkdirSync(path.join(workspaceDir, "docs/plans"), { recursive: true });
   fs.writeFileSync(path.join(workspaceDir, "README.md"), "fixture\n");
-  fs.writeFileSync(path.join(workspaceDir, "package.json"), JSON.stringify({ name: "c" }));
+  fs.writeFileSync(
+    path.join(workspaceDir, "package.json"),
+    JSON.stringify({ name: "c", bkit: { tracker: { default: "github" } } }),
+  );
   git(workspaceDir, "add", "-A");
   git(workspaceDir, "commit", "-qm", "base");
   git(workspaceDir, "push", "-u", "-q", "origin", "dev");
@@ -133,6 +144,23 @@ function setupFixture(tmpRoot: string): Fixture {
   const ghPath = path.join(stubBinDir, "gh");
   fs.writeFileSync(ghPath, GH_STUB, { mode: 0o755 });
 
+  // The consumer's own bkit, as the runner's lockfile install leaves it. `issues fetch` answers
+  // with a recorded reply when STUB_FETCH_EXIT is set, else runs the real CLI (against the
+  // stub gh); every other verb is the real CLI.
+  const bkitPath = path.join(workspaceDir, "node_modules/.bin/bkit");
+  fs.mkdirSync(path.dirname(bkitPath), { recursive: true });
+  fs.writeFileSync(
+    bkitPath,
+    `#!/usr/bin/env bash
+if [ "$1" = "issues" ] && [ "$2" = "fetch" ] && [ -n "\${STUB_FETCH_EXIT+x}" ]; then
+  printf '%s' "\${STUB_FETCH_OUT-}"
+  exit "$STUB_FETCH_EXIT"
+fi
+exec "${requireTsx()}" "${path.join(REPO_ROOT, ".bkit/core/engine/cli.ts")}" "$@"
+`,
+    { mode: 0o755 },
+  );
+
   if (!nativeSedIsGnu && gsedPath) {
     fs.writeFileSync(
       path.join(stubBinDir, "sed"),
@@ -353,31 +381,175 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
   });
 
   // -------------------------------------------------------------------------
-  // Tracker gate — bkit-cloud.yml serves the GitHub tracker only
+  // Tracker-agnostic gate — the label is read through the consumer's own bkit
+  // (`issues fetch`); every outcome is a log line plus one summary row.
   // -------------------------------------------------------------------------
-  it.each(["linear", "jira"])(
-    "a %s tracker in package.json no-ops before FID recovery — no dispatch, no counter write",
-    (tracker) => {
-      fs.writeFileSync(
-        path.join(fixture.workspaceDir, "package.json"),
-        JSON.stringify({ name: "c", bkit: { tracker: { default: tracker } } }, null, 2),
-      );
-      const result = runCtxStep(fixture, {
+  describe("feat/** path — bkit_gate outcomes", () => {
+    const FEAT_FID = "363-widen-bkit-cloud-trigger";
+    const featRun = (
+      env: Record<string, string>,
+      marker: string = `<!-- bkit:issue=#363 bkit:fid=${FEAT_FID} -->`,
+      branch: string = `feat/${FEAT_FID}`,
+    ) =>
+      runCtxStep(fixture, {
         EVENT: "workflow_run",
         CONCLUSION: "failure",
-        BRANCH: "dev",
-        COMMIT_MSG: "feat(bar-123-auth): add OAuth flow (#9) bkit [auto route]",
-        HEAD_SHA: "sha-tracker",
-        STUB_LATEST_CI_SHA: "sha-tracker",
-        STUB_ISSUE_LABELS: "bkit:auto",
+        BRANCH: branch,
+        COMMIT_MSG: "chore: summary bkit [auto route]",
+        HEAD_SHA: "gate-sha",
+        STUB_PR_NUMBER: "77",
+        STUB_PR_BODY: marker,
+        ...env,
       });
-      expect(result.status).toBe(0);
+    const setTracker = (tracker: string) =>
+      fs.writeFileSync(
+        path.join(fixture.workspaceDir, "package.json"),
+        JSON.stringify({ name: "c", bkit: { tracker: { default: tracker } } }),
+      );
+    const verdictRow = (summary: string, verdict: string) =>
+      new RegExp(`^\\|.*\\|\\s*${verdict}\\s*\\|`, "m").test(summary);
+    const recorded = (labels: string[]) =>
+      JSON.stringify({ title: "t", url: "u", state: "Todo", labels, terminal: false, files: {} });
+
+    it("github feat run passes the gate through the real bkit and stub gh", () => {
+      const ghLog = path.join(tmpRoot, "gh.log");
+      const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto", STUB_GH_LOG: ghLog });
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("false");
+      expect(result.outputs.phase).toBe("debug");
+      expect(result.outputs.arg).toBe("77");
+      const calls = fs.readFileSync(ghLog, "utf8");
+      expect(calls).toMatch(/api repos\/[^ ]*\/issues\/363/);
+      expect(calls).not.toContain("issue view");
+      expect(verdictRow(result.summary, "pass")).toBe(true);
+    });
+
+    it("label removed gives label-absent, skip and a summary row", () => {
+      const result = featRun({ STUB_ISSUE_LABELS: "bkit:ship" });
+      expect(result.status, result.stderr).toBe(0);
       expect(result.outputs.skip).toBe("true");
       expect(result.outputs.phase).toBeUndefined();
-      expect(result.stdout).toContain(`bkit.tracker.default is '${tracker}'`);
-      expect(readStatusRows(fixture.workspaceDir, "bar-123-auth")).toEqual([]);
-    },
-  );
+      expect(result.stdout).toContain("::notice::");
+      expect(result.stdout).toContain("label-absent");
+      expect(verdictRow(result.summary, "label-absent")).toBe(true);
+    });
+
+    it("%s recorded fetch reply carrying bkit:auto passes the gate", () => {
+      const cases: Array<[string, string, string]> = [
+        ["linear", "<!-- bkit:issue=BAR-123 bkit:fid=bar-123-auth -->", "feat/bar-123-auth"],
+        [
+          "jira",
+          "<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-login-retry -->",
+          "feat/ab2-12-login-retry",
+        ],
+      ];
+      for (const [tracker, marker, branch] of cases) {
+        const ctx = `case ${tracker}`;
+        setTracker(tracker);
+        const result = featRun(
+          { STUB_FETCH_EXIT: "0", STUB_FETCH_OUT: recorded(["bkit:auto"]) },
+          marker,
+          branch,
+        );
+        expect(result.status, `${ctx}: ${result.stderr}`).toBe(0);
+        expect(result.outputs.skip, ctx).toBe("false");
+        expect(result.outputs.phase, ctx).toBe("debug");
+        expect(result.stdout, ctx).not.toContain("serves the GitHub tracker only");
+      }
+    });
+
+    it("jira marker AB2-12 dispatches", () => {
+      setTracker("jira");
+      const result = featRun(
+        { STUB_FETCH_EXIT: "0", STUB_FETCH_OUT: recorded(["bkit:auto", "other"]) },
+        "<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-login-retry -->",
+        "feat/ab2-12-login-retry",
+      );
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("false");
+      expect(result.outputs.phase).toBe("debug");
+      expect(result.outputs.arg).toBe("77");
+    });
+
+    it("exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green", () => {
+      setTracker("jira");
+      const result = featRun(
+        {
+          STUB_FETCH_EXIT: "80",
+          STUB_FETCH_OUT: JSON.stringify({ reason: "auth" }),
+          BKIT_JIRA_API_KEY: "",
+        },
+        "<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-login-retry -->",
+        "feat/ab2-12-login-retry",
+      );
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(result.stdout).toContain("::warning::");
+      expect(result.stdout).toContain("BKIT_JIRA_API_KEY");
+      expect(verdictRow(result.summary, "unreadable")).toBe(true);
+    });
+
+    it("exit 80 reason=%s is unreadable with that reason and exits green", () => {
+      for (const reason of ["network", "not-found"]) {
+        const ctx = `reason ${reason}`;
+        const result = featRun({
+          STUB_FETCH_EXIT: "80",
+          STUB_FETCH_OUT: JSON.stringify({ reason }),
+        });
+        expect(result.status, `${ctx}: ${result.stderr}`).toBe(0);
+        expect(result.outputs.skip, ctx).toBe("true");
+        expect(result.outputs.phase, ctx).toBeUndefined();
+        expect(result.stdout, ctx).toContain("unreadable");
+        expect(result.stdout, ctx).toContain(reason);
+        expect(result.stdout, ctx).not.toContain("label-absent");
+        expect(verdictRow(result.summary, "unreadable"), ctx).toBe(true);
+        expect(result.summary, ctx).toContain(reason);
+        expect(verdictRow(result.summary, "label-absent"), ctx).toBe(false);
+      }
+    });
+
+    it("%s fetch output is unreadable reason=output-unparseable", () => {
+      const cases: Array<[string, string]> = [
+        ["empty", ""],
+        ["non-array", JSON.stringify({ title: "t", labels: "bkit:auto" })],
+      ];
+      for (const [name, out] of cases) {
+        const ctx = `case ${name}`;
+        const result = featRun({ STUB_FETCH_EXIT: "0", STUB_FETCH_OUT: out });
+        expect(result.status, `${ctx}: ${result.stderr}`).toBe(0);
+        expect(result.outputs.skip, ctx).toBe("true");
+        expect(result.outputs.phase, ctx).toBeUndefined();
+        expect(result.stdout, ctx).toContain("output-unparseable");
+        expect(verdictRow(result.summary, "unreadable"), ctx).toBe(true);
+        expect(verdictRow(result.summary, "label-absent"), ctx).toBe(false);
+        expect(verdictRow(result.summary, "pass"), ctx).toBe(false);
+      }
+    });
+
+    it("absent node_modules/.bin/bkit warns bkit unavailable and exits green", () => {
+      fs.rmSync(path.join(fixture.workspaceDir, "node_modules"), { recursive: true, force: true });
+      const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto" });
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(result.stdout).toContain("::warning::");
+      expect(result.stdout).toMatch(/bkit[ -]unavailable/);
+    });
+
+    it("feat branch with no marker and no feature row gives no-issue", () => {
+      const ghLog = path.join(tmpRoot, "gh.log");
+      fs.writeFileSync(ghLog, "");
+      const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto", STUB_GH_LOG: ghLog }, "");
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(result.stdout).toContain("no-issue");
+      expect(verdictRow(result.summary, "no-issue")).toBe(true);
+      const calls = fs.readFileSync(ghLog, "utf8");
+      expect(calls).not.toMatch(/\/issues\/363/);
+    });
+  });
 
   it("a github tracker in package.json passes the tracker gate and dispatches", () => {
     fs.writeFileSync(
@@ -410,7 +582,17 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
         COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#501) bkit [auto route]",
         HEAD_SHA: headSha,
         STUB_LATEST_CI_SHA: headSha,
-        STUB_ISSUE_LABELS: "bkit:auto",
+        // The gate reads the label through bkit; a recorded reply keeps it independent of
+        // the package.json each cap test writes.
+        STUB_FETCH_EXIT: "0",
+        STUB_FETCH_OUT: JSON.stringify({
+          title: "t",
+          url: "u",
+          state: "Todo",
+          labels: ["bkit:auto"],
+          terminal: false,
+          files: {},
+        }),
       });
     const writePkg = (text: string) =>
       fs.writeFileSync(path.join(fixture.workspaceDir, "package.json"), text);
@@ -504,6 +686,12 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
   // -------------------------------------------------------------------------
   describe("feat/** path — FID recovery + cap exemption (T13, H1 regression)", () => {
     it("T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363')", () => {
+      // The branch's issue id counts only when a feature row for it is logged.
+      fs.mkdirSync(path.join(fixture.workspaceDir, ".bkit"), { recursive: true });
+      fs.writeFileSync(
+        path.join(fixture.workspaceDir, ".bkit/issues.jsonl"),
+        `${JSON.stringify({ kind: "feature", key: "363-widen-bkit-cloud-trigger" })}\n`,
+      );
       const result = runCtxStep(fixture, {
         EVENT: "workflow_run",
         CONCLUSION: "failure",
@@ -540,7 +728,7 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
         });
         expect(result.status, `step aborted: ${result.stderr}`).toBe(0);
         expect(result.outputs.skip).toBe("true");
-        expect(result.stdout).toContain("Cannot derive FID/ISSUE for branch");
+        expect(result.stdout).toContain("no-issue");
       },
     );
 
@@ -575,7 +763,7 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
         COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): widen trigger bkit [auto route]",
         HEAD_SHA: "feat-sha-1",
         STUB_PR_NUMBER: "79",
-        STUB_PR_BODY: "<!-- bkit:issue=#363 --><!-- bkit:fid=363-widen-bkit-cloud-trigger -->",
+        STUB_PR_BODY: "<!-- bkit:issue=#363 bkit:fid=363-widen-bkit-cloud-trigger -->",
         STUB_ISSUE_LABELS: "bkit:auto",
       });
       expect(result.outputs.skip).toBe("false");
@@ -608,7 +796,7 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
         path.join(dir, "status.jsonl"),
         rows.map((r) => JSON.stringify(r)).join("\n") + "\n",
       );
-      git(ws, "add", "-A");
+      git(ws, "add", "docs");
       git(ws, "commit", "-qm", "build rows");
       git(ws, "push", "-q", "origin", BRANCH);
       git(ws, "checkout", "-q", "dev");
@@ -623,7 +811,7 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
         COMMIT_MSG: `chore(${FID}): summary bkit [auto route]`,
         HEAD_SHA: "feat-sha-457",
         STUB_PR_NUMBER: "91",
-        STUB_PR_BODY: `<!-- bkit:issue=#457 --><!-- bkit:fid=${FID} -->`,
+        STUB_PR_BODY: `<!-- bkit:issue=#457 bkit:fid=${FID} -->`,
         STUB_ISSUE_LABELS: "bkit:auto",
       });
     }
@@ -806,6 +994,101 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
   });
 });
 
+describe.skipIf(!hasTools)(
+  "bkit-cloud.yml summary row — jobs field from the Select hand-off",
+  () => {
+    let tmpRoot: string;
+    let fixture: Fixture;
+
+    beforeEach(() => {
+      tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-jobs-"));
+      fixture = setupFixture(tmpRoot);
+    });
+
+    afterEach(() => {
+      fs.rmSync(tmpRoot, { recursive: true, force: true });
+    });
+
+    /** Runs `Select agent job` for the recorded agent and secrets; returns its step outputs. */
+    function runSelectStep(agent: string, secrets: Record<string, string>): Record<string, string> {
+      const cwd = fs.mkdtempSync(path.join(tmpRoot, "select-"));
+      fs.writeFileSync(
+        path.join(cwd, "package.json"),
+        JSON.stringify({ name: "c", bkit: { cloud: { agent } } }),
+      );
+      const outputFile = path.join(cwd, "github-output");
+      fs.writeFileSync(outputFile, "");
+      const res = spawnSync("bash", ["-c", SELECT_SCRIPT], {
+        cwd,
+        encoding: "utf8",
+        env: { ...process.env, ...secrets, GITHUB_OUTPUT: outputFile },
+      });
+      expect(res.status, res.stderr).toBe(0);
+      const outputs: Record<string, string> = {};
+      for (const line of fs.readFileSync(outputFile, "utf8").split("\n")) {
+        const eq = line.indexOf("=");
+        if (eq !== -1) outputs[line.slice(0, eq)] = line.slice(eq + 1);
+      }
+      return outputs;
+    }
+
+    /** The env the ctx step maps from `steps.select.outputs.*`, filled from the Select outputs. */
+    function handoffEnv(outputs: Record<string, string>): Record<string, string> {
+      const start = rawTemplate.indexOf("- name: Resolve phase + brief context");
+      const block = rawTemplate.slice(start, rawTemplate.indexOf("run: |", start));
+      const env: Record<string, string> = {};
+      for (const m of block.matchAll(
+        /^\s+(\w+):\s*\$\{\{\s*steps\.select\.outputs\.(\w+)\s*\}\}/gm,
+      )) {
+        env[m[1]!] = outputs[m[2]!] ?? "";
+      }
+      expect(Object.keys(env), "ctx step maps no steps.select.outputs.* into its env").not.toEqual(
+        [],
+      );
+      return env;
+    }
+
+    function runFeatCtx(selectOutputs: Record<string, string>): RunResult {
+      return runCtxStep(fixture, {
+        EVENT: "workflow_run",
+        CONCLUSION: "failure",
+        BRANCH: "feat/363-widen-bkit-cloud-trigger",
+        COMMIT_MSG: "chore: summary bkit [auto route]",
+        HEAD_SHA: "jobs-sha",
+        STUB_PR_NUMBER: "77",
+        STUB_PR_BODY: "<!-- bkit:issue=#363 bkit:fid=363-widen-bkit-cloud-trigger -->",
+        STUB_ISSUE_LABELS: "bkit:auto",
+        ...handoffEnv(selectOutputs),
+      });
+    }
+
+    it("pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason", () => {
+      const selected = runSelectStep("codex", {
+        BKIT_OPENAI_API_KEY: "k",
+        BKIT_ANTHROPIC_API_KEY: "k",
+      });
+      const result = runFeatCtx(selected);
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.summary).toMatch(/^\|.*\|\s*pass\s*\|/m);
+      expect(result.summary).toContain("codex:BKIT_OPENAI_API_KEY");
+      expect(result.summary).toContain("claude: not bkit.cloud.agent");
+      expect(result.summary).not.toContain("codex:OPENAI_API_KEY");
+      expect(result.summary).not.toMatch(/(?<!BKIT_)ANTHROPIC_API_KEY/);
+    });
+
+    it("no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets", () => {
+      const selected = runSelectStep("codex", { BKIT_ANTHROPIC_API_KEY: "k" });
+      expect(selected.dispatched).toBe("");
+      const result = runFeatCtx(selected);
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.summary).toMatch(/^\|.*\|\s*no-agent\s*\|/m);
+      expect(result.summary).not.toMatch(/^\|.*\|\s*pass\s*\|/m);
+      expect(result.summary).toContain("BKIT_OPENAI_API_KEY");
+      expect(result.summary).toContain("BKIT_ANTHROPIC_API_KEY");
+    });
+  },
+);
+
 describe.skipIf(!hasBash)("bkit-cloud.yml gate step — per-job credential detection", () => {
   const CREDENTIAL_VARS = [
     "ANTHROPIC_API_KEY",
diff --git a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
index 10b8798ff..04f6f083e 100644
--- a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
@@ -5,6 +5,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { describe, expect, it } from "vitest";
+import { parse as parseYaml } from "yaml";
 
 describe("bkit-cloud.yml template — GitHub-only content", () => {
   const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
@@ -14,12 +15,14 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
     "utf-8",
   );
 
-  it("carries id-token: write, GitHub MCP only and no tracker sentinels", () => {
+  it("carries id-token: write, GitHub MCP only and the tracker read keys in the context step", () => {
     expect(yml).toContain("id-token: write");
-    expect(yml).not.toContain("BKIT_LINEAR_API_KEY");
     expect(yml).not.toContain("mcp__linear__*");
-    expect(yml).not.toContain("BKIT_JIRA_API_KEY");
     expect(yml).not.toContain("mcp__jira__*");
+    const ctxStart = yml.indexOf("- name: Resolve phase + brief context");
+    for (const name of ["BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"]) {
+      expect(yml.indexOf(`${name}: \${{ secrets.${name} }}`)).toBeGreaterThan(ctxStart);
+    }
     expect(yml).toContain("mcp__github__*");
     expect(yml).not.toMatch(/@@CLOUD_TRACKER/);
     expect(yml).toMatch(/secrets\.BKIT_ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/);
@@ -44,6 +47,30 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
     expect(yml).not.toContain("OPENCODE_PROVIDER_KEY");
   });
 
+  it("context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch", () => {
+    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
+      jobs: { context: { steps: Array<{ uses?: string; with?: Record<string, unknown> }> } };
+    };
+    const checkout = doc.jobs.context.steps.find((st) => st.uses?.startsWith("actions/checkout@"));
+    expect(checkout, "context job has no actions/checkout step").toBeDefined();
+    const ref = String(checkout!.with!.ref);
+    const expr = /^\$\{\{([\s\S]*)\}\}$/.exec(ref.trim())?.[1];
+    expect(expr, `ref is not a single expression: ${ref}`).toBeDefined();
+    const evaluate = (eventName: string, headBranch: string | undefined): unknown => {
+      const github = {
+        event_name: eventName,
+        event: { workflow_run: { head_branch: headBranch } },
+      };
+      const startsWith = (a: unknown, b: unknown) => String(a).startsWith(String(b));
+      return new Function("github", "startsWith", `return (${expr});`)(github, startsWith);
+    };
+    expect(evaluate("workflow_run", "feat/363-widen-bkit-cloud-trigger")).toBe(
+      "feat/363-widen-bkit-cloud-trigger",
+    );
+    expect(evaluate("workflow_run", "dev")).toBe("dev");
+    expect(evaluate("workflow_dispatch", undefined)).toBe("dev");
+  });
+
   it("claude step passes the four workload identity federation inputs from repo variables", () => {
     const claudeStep = yml.slice(yml.indexOf("uses: anthropics/claude-code-action@"));
     for (const [input, variable] of [
@@ -197,27 +224,17 @@ describe("T2.7 — two-tier CI gate positive assertions (GAP-3)", () => {
     expect(out).toMatch(/workflow_dispatch[\s\S]{0,400}bkit \[auto route\]/);
   });
 
-  it("(c) kill-switch gh issue view uses $ISSUE from SHARED-DERIV step — single-sourced", () => {
+  it("(c) the label gate is bkit_gate, defined after SHARED-DERIV and called on both arms; no gh issue view remains", () => {
     const out = rawTemplate;
-    // The kill-switch gh issue view must use $ISSUE (not a re-derived value).
-    // $ISSUE must be set by the SHARED-DERIV step (primary: PR body; fallback: branch).
-    expect(out).toContain('gh issue view "$ISSUE"');
-    // SHARED-DERIV must set ISSUE from PR body primary source (portable grep -oE, not PCRE -oP).
-    expect(out).toContain('ISSUE=$(echo "$PR_BODY" | grep -oE');
-    // SHARED-DERIV fallback sets ISSUE from FID (branch-derived numeric id): FID stays
-    // the FULL slug (shared status.jsonl key with the dev path) and the short ISSUE
-    // prefix is derived FROM it.
-    // `|| true` is required — on the fix/** arm this runs before the slug allowlist, so
-    // a non-FID branch yields no grep match and pipefail would kill the step.
-    expect(out).toContain(
-      "ISSUE=$(printf '%s' \"$FID\" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)",
-    );
-    // The ISSUE variable used by gh issue view is the SAME one set by SHARED-DERIV.
-    // gh issue view must appear AFTER the SHARED-DERIV machinery (uses its output).
+    expect(out).not.toContain("gh issue view");
     const sharedDerivStart = out.indexOf("# SHARED-DERIV:");
     expect(sharedDerivStart).toBeGreaterThan(-1);
-    const ghIssueViewPos = out.indexOf('gh issue view "$ISSUE"');
-    expect(ghIssueViewPos).toBeGreaterThan(sharedDerivStart);
+    expect(out.indexOf("bkit_gate() {")).toBeGreaterThan(sharedDerivStart);
+    expect(out.match(/bkit_gate "\$ISSUE" \|\|/g)).toHaveLength(2);
+    // The feat arm recovers FID + issue through bkit, not a marker regex.
+    expect(out).toContain(
+      'node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json',
+    );
   });
 
   it("(c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need", () => {
@@ -295,114 +312,41 @@ describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety r
     expect(template).not.toContain("grep -oP");
   });
 
-  it("(1b) ISSUE assignment in canonical has || true failure guard (pipefail safety)", () => {
-    // Finding 1 (challenge-1): without || true, `set -euo pipefail` aborts the step
-    // when grep exits 1 on a no-match PR body, making fallback/fail-safe dead code.
-    // The ISSUE assignment must end with `|| true` so a no-match exits 0.
-    const canonical = readBkitCloudYml();
-    // The form: grep -oE ... | sed ... | head -1 || true
-    expect(canonical).toMatch(/ISSUE=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
-  });
-
-  it("(1b) FID assignment in canonical has || true failure guard (pipefail safety)", () => {
-    const canonical = readBkitCloudYml();
-    expect(canonical).toMatch(/FID=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
-  });
-
-  it("(1b) ISSUE assignment in template has || true failure guard (pipefail safety)", () => {
-    const template = readBkitCloudTemplate();
-    expect(template).toMatch(/ISSUE=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
-  });
-
-  it("(1b) FID assignment in template has || true failure guard (pipefail safety)", () => {
-    const template = readBkitCloudTemplate();
-    expect(template).toMatch(/FID=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
-  });
-
-  it("(1c) SHARED-DERIV extraction snippet exits 0 under set -euo pipefail when PR body is empty (real-tool validation)", () => {
-    // Finding 1 (challenge-1): the original code aborted on empty PR body.
-    // This test extracts the actual ISSUE/FID assignment commands from the canonical
-    // workflow and executes them under `set -euo pipefail` with an empty PR body to
-    // prove the || true guards make the step exit 0 (not exit 1).
-    const canonical = readBkitCloudYml();
-
-    // Extract the two assignment lines from the SHARED-DERIV machinery.
-    const sharedDerivStart = canonical.indexOf("# SHARED-DERIV:");
-    expect(sharedDerivStart).toBeGreaterThan(-1);
-    const sharedDerivBlock = canonical.slice(sharedDerivStart);
-
-    // Pull out the ISSUE= and FID= lines (they contain the grep commands).
-    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
-    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
-    expect(
-      issueLineMatch,
-      "ISSUE= assignment line must be found after SHARED-DERIV",
-    ).not.toBeNull();
-    expect(fidLineMatch, "FID= assignment line must be found after SHARED-DERIV").not.toBeNull();
-
-    const issueLine = issueLineMatch![0]!.trim();
-    const fidLine = fidLineMatch![0]!.trim();
-
-    // Build a minimal shell script that runs both assignments under strict mode
-    // with an empty PR_BODY and asserts the variables are empty (no-match, no abort).
-    const script = [
-      "set -euo pipefail",
-      'PR_BODY=""',
-      issueLine,
-      fidLine,
-      // Assert variables are empty (grep found nothing, || true kept us alive)
-      '[ -z "$ISSUE" ] || { echo "FAIL: ISSUE should be empty, got: $ISSUE"; exit 2; }',
-      '[ -z "$FID" ]   || { echo "FAIL: FID should be empty, got: $FID"; exit 2; }',
-      'echo "OK: both empty, script did not abort"',
-    ].join("\n");
-
-    const result = spawnSync("bash", ["-c", script], {
-      encoding: "utf-8",
-      timeout: 10_000,
-    });
-
-    expect(
-      result.status,
-      `SHARED-DERIV snippet aborted under set -euo pipefail with empty PR body.\n` +
-        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
-    ).toBe(0);
-    expect(result.stdout).toContain("OK: both empty, script did not abort");
+  it("(1b) feat-arm FID/ISSUE parse lines in canonical and template carry a || true failure guard (pipefail safety)", () => {
+    for (const text of [readBkitCloudYml(), readBkitCloudTemplate()]) {
+      expect(text).toMatch(/PARSED=\$\(node_modules\/\.bin\/bkit fids parse[^\n]*\|\| true\)/);
+      expect(text).toMatch(/FID=\$\(printf '%s' "\$PARSED" \| jq[^\n]*\|\| true\)/);
+      expect(text).toMatch(/ISSUE=\$\(printf '%s' "\$PARSED" \| jq[^\n]*\|\| true\)/);
+    }
   });
 
-  it("(1c) SHARED-DERIV extraction snippet correctly parses a well-formed PR body (positive case)", () => {
-    // Complementary positive case: a PR body WITH the markers must yield the correct values.
+  it("(1c) the FID/ISSUE extraction lines exit 0 under set -euo pipefail on an empty parse and read a recorded parse (real-tool validation)", () => {
     const canonical = readBkitCloudYml();
-
-    const sharedDerivBlock = canonical.slice(canonical.indexOf("# SHARED-DERIV:"));
-
-    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
-    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
-    expect(issueLineMatch).not.toBeNull();
-    expect(fidLineMatch).not.toBeNull();
-
-    const issueLine = issueLineMatch![0]!.trim();
-    const fidLine = fidLineMatch![0]!.trim();
-
-    const script = [
-      "set -euo pipefail",
-      'PR_BODY="<!-- bkit:issue=#141 bkit:fid=141-cloud-app -->"',
-      issueLine,
-      fidLine,
-      '[ "$ISSUE" = "141" ] || { echo "FAIL: expected ISSUE=141, got: $ISSUE"; exit 2; }',
-      '[ "$FID" = "141-cloud-app" ] || { echo "FAIL: expected FID=141-cloud-app, got: $FID"; exit 2; }',
-      'echo "OK: ISSUE=$ISSUE FID=$FID"',
-    ].join("\n");
-
-    const result = spawnSync("bash", ["-c", script], {
-      encoding: "utf-8",
-      timeout: 10_000,
-    });
-
-    expect(
-      result.status,
-      `SHARED-DERIV snippet failed to parse well-formed PR body.\n` +
-        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
-    ).toBe(0);
-    expect(result.stdout).toContain("OK: ISSUE=141 FID=141-cloud-app");
+    const block = canonical.slice(canonical.indexOf("# SHARED-DERIV:"));
+    const fidLine = block.match(/FID=\$\(printf '%s' "\$PARSED" \| jq[^\n]+\)/)![0].trim();
+    const issueLine = block.match(/ISSUE=\$\(printf '%s' "\$PARSED" \| jq[^\n]+\)/)![0].trim();
+    const run = (parsed: string) =>
+      spawnSync(
+        "bash",
+        [
+          "-c",
+          [
+            "set -euo pipefail",
+            `PARSED='${parsed}'`,
+            fidLine,
+            issueLine,
+            'echo "FID=$FID ISSUE=$ISSUE"',
+          ].join("\n"),
+        ],
+        { encoding: "utf-8", timeout: 10_000 },
+      );
+    const empty = run("");
+    expect(empty.status, empty.stderr).toBe(0);
+    expect(empty.stdout).toContain("FID= ISSUE=");
+    const parsed = run(
+      '{"fid":"141-cloud-app","issueId":"141","source":"marker","tracker":"github"}',
+    );
+    expect(parsed.status, parsed.stderr).toBe(0);
+    expect(parsed.stdout).toContain("FID=141-cloud-app ISSUE=141");
   });
 });
diff --git a/.bkit/templates.md b/.bkit/templates.md
index d3f0dee29..b32d9a0f4 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -83,7 +83,7 @@ Placeholders: the copies keep them raw, so replace each one in your copy:
 | --- | --- | --- | --- |
 | `{{DEFAULT_BRANCH}}` | `bkit-ci.yml` (`on.push` / `on.pull_request` branches; stub comments), `bkit-trivy.yml` (`on.push` / `on.pull_request` branches), `bkit-health.yml` (`on.workflow_run` branches) | your production branch | `origin/HEAD` unless it is `dev`, else `main` |
 | `{{PRODUCTION_URL}}` | `bkit-health.yml` (`env.PRODUCTION_URL`) | the origin production serves | `https://example.com` |
-| `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
+| `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes), `bkit-cloud.yml` (`actions/setup-node` `node-version`, the context job's bkit install) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
 | `{{CLOUD_RUNNER}}` | `bkit-cloud.yml` (`runs-on`, all three jobs) | a runner label | `ubuntu-latest` |
 | `{{SCRIPT_PATH}}` | `bkit-launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
 | `{{ENV_FILE}}` | `bkit-launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index 1d1c1fdf4..745a4cf99 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -164,14 +164,34 @@ jobs:
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         if: steps.gate.outputs.enabled == 'true'
         with:
-          # `dev` at the workspace root: the dev arm's dispatch-cap counter row is
-          # committed to dev's `status.jsonl`; the feat/** arm reads the branch's
-          # `status.jsonl` from origin.
-          ref: dev
+          # Per-arm checkout: a feat/** run checks out the PR head branch (its `status.jsonl`,
+          # `.bkit/issues.jsonl` feature rows and lockfile are the ones the router reads); a
+          # dev run and a workflow_dispatch check out `dev`, where the dev arm commits its
+          # dispatch-cap counter row.
+          ref: ${{ startsWith(github.event.workflow_run.head_branch, 'feat/') && github.event.workflow_run.head_branch || 'dev' }}
           fetch-depth: 0
           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
           token: ${{ github.token }}
 
+      # The consumer's own bkit, from its lockfile, so the label gate reads the tracker through
+      # `bkit issues fetch` and FIDs through `bkit fids parse`. A failed install leaves
+      # node_modules/.bin/bkit absent: the gate reports bkit-unavailable and starts nothing.
+      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
+        if: steps.gate.outputs.enabled == 'true'
+        with:
+          node-version: {{NODE_VERSION}}
+          cache: pnpm
+
+      # Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
+      # Do NOT add `with: version:` here — pnpm/action-setup errors when both are set.
+      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
+        if: steps.gate.outputs.enabled == 'true'
+
+      - name: Install bkit
+        if: steps.gate.outputs.enabled == 'true'
+        continue-on-error: true
+        run: pnpm install --frozen-lockfile --ignore-scripts
+
       # Exactly one router job starts: the agent recorded in package.json `bkit.cloud.agent`,
       # and only when that agent's BKIT_ secret is set. Another agent's secret never starts a
       # job; Cursor runs through its own triggers and starts none here.
@@ -257,15 +277,13 @@ jobs:
           BRANCH: ${{ github.event.workflow_run.head_branch }}
           COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}
           HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
+          SEL_AGENT: ${{ steps.select.outputs.agent }}
+          SEL_DISPATCHED: ${{ steps.select.outputs.dispatched }}
+          SEL_IGNORED: ${{ steps.select.outputs.ignored }}
         run: |
           set -euo pipefail
-          # Cloud runs serve the GitHub tracker only: Linear cloud runs start from Cursor's
-          # Linear integration, and Jira runs locally only. Unset tracker → continue.
-          TRACKER=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
-          if [ -n "$TRACKER" ] && [ "$TRACKER" != "github" ]; then
-            echo "::notice::bkit.tracker.default is '$TRACKER' — bkit-cloud.yml serves the GitHub tracker only; no-op exit."
-            echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
-          fi
           if [ "$EVENT" = "workflow_dispatch" ]; then
             # Dispatched: phase + issue come straight from inputs.
             PHASE="$IN_PHASE"
@@ -369,6 +387,97 @@ jobs:
               return 0
             }
 
+            # bkit_gate <issue> — the tracker-agnostic bkit:auto gate. Reads the issue's labels
+            # through the consumer's own bkit (`issues fetch`), logs one `[bkit-cloud] gate:`
+            # line and writes one $GITHUB_STEP_SUMMARY row `tracker | issue | verdict | reason
+            # | jobs`. Returns 0 on pass; returns 1 (caller must skip, exit green) for every
+            # other outcome: no-issue, unreadable (bkit-unavailable, an exit 80 reason,
+            # output-unparseable), label-absent, no-agent. Unreadable fails closed: nothing starts.
+            bkit_gate() {
+              local gate_issue="${1:-}" tracker verdict="" reason="" jobs="" rc=0 reply="" outbox secret_var
+              tracker=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
+              tracker="${tracker:-none}"
+              # jobs: the dispatched job + its BKIT_ secret, each ignored job with its reason.
+              bkit_gate_secret() {
+                case "$1" in
+                  claude) printf '%s' "BKIT_ANTHROPIC_API_KEY" ;;
+                  opencode) printf '%s' "one of BKIT_OPENCODE_API_KEY, BKIT_OPENROUTER_API_KEY, BKIT_OLLAMA_API_KEY" ;;
+                  codex) printf '%s' "BKIT_OPENAI_API_KEY" ;;
+                esac
+              }
+              local job
+              if [ -n "${SEL_DISPATCHED:-}" ]; then
+                jobs="${SEL_DISPATCHED}:$(bkit_gate_secret "$SEL_DISPATCHED")"
+                for job in ${SEL_IGNORED:-}; do jobs="$jobs; $job: not bkit.cloud.agent"; done
+              elif [ -n "${SEL_AGENT:-}" ]; then
+                case "$SEL_AGENT" in
+                  claude | opencode | codex) jobs="$SEL_AGENT: missing $(bkit_gate_secret "$SEL_AGENT")" ;;
+                  *) jobs="bkit.cloud.agent is '$SEL_AGENT': no router job" ;;
+                esac
+                for job in ${SEL_IGNORED:-}; do jobs="$jobs; $job: not bkit.cloud.agent ($(bkit_gate_secret "$job"))"; done
+              fi
+              bkit_gate_row() {
+                {
+                  echo "### bkit-cloud gate"
+                  echo ""
+                  echo "| tracker | issue | verdict | reason | jobs |"
+                  echo "| --- | --- | --- | --- | --- |"
+                  echo "| $tracker | ${gate_issue:--} | $1 | $2 | ${jobs:--} |"
+                } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
+              }
+              if [ ! -x node_modules/.bin/bkit ]; then
+                echo "::warning::[bkit-cloud] gate: unreadable (bkit-unavailable) — node_modules/.bin/bkit is absent (the lockfile install failed); no agent starts."
+                bkit_gate_row unreadable bkit-unavailable
+                return 1
+              fi
+              if [ -z "$gate_issue" ]; then
+                echo "::notice::[bkit-cloud] gate: no-issue — no tracker issue is recorded for this run; no agent starts."
+                bkit_gate_row no-issue "no issue recorded"
+                return 1
+              fi
+              outbox=$(mktemp -d)
+              reply=$(node_modules/.bin/bkit issues fetch --issue "$gate_issue" --outbox "$outbox" --json 2>/dev/null) || rc=$?
+              if [ "$rc" -eq 80 ]; then
+                reason=$(printf '%s' "$reply" | jq -r '.reason // "unknown"' 2>/dev/null || echo unknown)
+                case "$tracker:$reason" in
+                  linear:auth) secret_var=BKIT_LINEAR_API_KEY ;;
+                  jira:auth) secret_var=BKIT_JIRA_API_KEY ;;
+                  github:auth) secret_var=GH_TOKEN ;;
+                  *) secret_var="" ;;
+                esac
+                if [ -n "$secret_var" ]; then
+                  echo "::warning::[bkit-cloud] gate: unreadable (reason=auth) — the $tracker read was refused; check the $secret_var secret (${!secret_var:+set but rejected}${!secret_var:-empty or missing}). No agent starts."
+                else
+                  echo "::warning::[bkit-cloud] gate: unreadable (reason=$reason) — the $tracker issue could not be read; no agent starts."
+                fi
+                bkit_gate_row unreadable "reason=$reason${secret_var:+ ($secret_var)}"
+                return 1
+              fi
+              if [ "$rc" -ne 0 ]; then
+                echo "::warning::[bkit-cloud] gate: unreadable (reason=exit-$rc) — bkit issues fetch failed; no agent starts."
+                bkit_gate_row unreadable "reason=exit-$rc"
+                return 1
+              fi
+              if ! printf '%s' "$reply" | jq -e '.labels | type == "array"' > /dev/null 2>&1; then
+                echo "::warning::[bkit-cloud] gate: unreadable (reason=output-unparseable) — bkit issues fetch printed no label list; no agent starts."
+                bkit_gate_row unreadable "reason=output-unparseable"
+                return 1
+              fi
+              if ! printf '%s' "$reply" | jq -e '.labels | index("bkit:auto") != null' > /dev/null 2>&1; then
+                echo "::notice::[bkit-cloud] gate: label-absent — issue $gate_issue no longer carries bkit:auto; no agent starts (kill switch)."
+                bkit_gate_row label-absent "bkit:auto not on the issue"
+                return 1
+              fi
+              if [ -n "${SEL_AGENT:-}" ] && [ -z "${SEL_DISPATCHED:-}" ]; then
+                echo "::notice::[bkit-cloud] gate: no-agent — $jobs; no agent starts."
+                bkit_gate_row no-agent "bkit:auto present, no agent job selected"
+                return 1
+              fi
+              echo "::notice::[bkit-cloud] gate: pass — issue $gate_issue carries bkit:auto."
+              bkit_gate_row pass "bkit:auto present"
+              return 0
+            }
+
             if [ "$BRANCH" = "dev" ]; then
               # Post-merge dev CI — no open PR. Recover FID from squash-merge commit
               # scope. dev success = regression check passed = no-op (the merge
@@ -382,8 +491,7 @@ jobs:
               # Shape-tolerant: the regex accepts BOTH GitHub
               # (363-slug) and Linear (bar-123-slug) FID SHAPES, mirroring the
               # alternation the feat/** fallback below uses. The kill switch
-              # below (`gh issue view "$ISSUE"`) is GitHub-Issues-only, so a
-              # Linear FID no-ops there (empty labels -> bkit:auto absent).
+              # below (`bkit_gate`) reads any wired tracker through bkit.
               # `head -1` FIRST — head_commit.message is subject+body and
               # grep's `^` anchors per line, so without it a squash body line
               # (GitHub's default body is the list of source commit subjects)
@@ -409,13 +517,10 @@ jobs:
               # instead of reaching the designed no-op exit just below.
               ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
               ARG="$FID"
-              # Kill switch: re-check bkit:auto on the issue (live revocation).
-              # exact label match, not substring. MUST precede the stale-run
-              # guard and the dispatch-cap guard below; it needs nothing they set.
-              if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
-                echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
-                echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
-              fi
+              # Kill switch: re-check bkit:auto on the issue (live revocation), through
+              # bkit_gate. MUST precede the stale-run guard and the dispatch-cap guard
+              # below; it needs nothing they set.
+              bkit_gate "$ISSUE" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
               # Stale-run guard: HEAD_SHA is current iff it is the headSha of the
               # most recent COMPLETED CI run on dev ([skip ci] close commits never
               # appear in gh run list). --workflow bkit-ci.yml (filename), not `bkit-ci`
@@ -459,47 +564,30 @@ jobs:
               fi
               ARG="$PR_NUMBER"
 
-              # PRIMARY: parse the bkit:issue / bkit:fid markers shipped in every
-              # bkit-build PR body. Also assert the marker-derived FID
-              # against the slug allowlist here — bkit:fid=[^[:space:]>]+ admits
-              # '/', '.', '..' and glob metacharacters, so an unvalidated match
-              # falls through to path construction (find -path / mkdir -p / git
-              # commit) in bkit_dev_dispatch_guard below. A mismatch falls through
-              # to the branch fallback exactly like an empty/missing marker.
+              # `bkit fids parse` (the consumer's own bkit) recovers FID + issue id: the
+              # PR-body marker first (any wired tracker's shape, Jira keys with digits
+              # included), then the feat/{FID} branch, whose issue id counts only when
+              # `.bkit/issues.jsonl` has a feature row for it. The FID is asserted against
+              # the slug allowlist before it builds any path (find -path / mkdir -p / git
+              # commit) in the guards below. An absent bkit leaves both empty; bkit_gate
+              # then reports bkit-unavailable.
               PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
-              ISSUE=$(echo "$PR_BODY" | grep -oE 'bkit:issue=#[0-9]+' | sed 's/bkit:issue=#//' | head -1 || true)
-              FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
-              if [ -z "$ISSUE" ] || [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
-                # FALLBACK: extract FID from the branch name (feat/{FID}) when the
-                # PR body carries no usable bkit:fid= marker.
-                # keep the FULL slug (do NOT collapse to the leading
-                # numeric/alpha id, e.g. '363' instead of
-                # '363-widen-bkit-cloud-trigger'). ISSUE (short
-                # numeric/alpha prefix, used only for `gh issue view`) is derived
-                # FROM the full FID, not the other way round. NOTE the '#' sed
-                # delimiter: with '|' the alternation would need escaping and is
-                # ambiguous under -E.
-                FID=$(echo "$BRANCH" | sed -E 's#^feat/##')
-                # `|| true` is load-bearing under `set -euo pipefail` —
-              # this runs BEFORE the slug allowlist, so a non-FID branch
-              # (Renovate, a hand-named hotfix) yields no match,
-              # pipefail propagates grep's exit 1, and the step dies red
-              # instead of reaching the designed no-op exit just below.
-              ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+              PARSED=""
+              if [ -x node_modules/.bin/bkit ]; then
+                PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json 2>/dev/null || true)
               fi
-              if [ -z "$FID" ] || [ -z "$ISSUE" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
-                echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."
-                echo "skip=true" >> "$GITHUB_OUTPUT"
-                exit 0
+              FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
+              ISSUE=$(printf '%s' "$PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
+              if [ -n "$FID" ] && ! [[ "$FID" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
+                FID=""
+                ISSUE=""
+              fi
+              if [ -z "$FID" ] && [ -x node_modules/.bin/bkit ]; then
+                echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no usable bkit:fid marker or feat/{FID} branch."
               fi
 
               # Cheap-tier kill switch: re-check bkit:auto on the issue (live revocation).
-              # exact label match, not substring.
-              if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
-                echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
-                echo "skip=true" >> "$GITHUB_OUTPUT"
-                exit 0
-              fi
+              bkit_gate "$ISSUE" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
 
               # A build still writing this branch owns it: no-op exit. "Still
               # running" = the branch's status.jsonl has a build workflow-started
diff --git a/.bkit/version b/.bkit/version
index f74c33fe5..1967fb54a 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -14,13 +14,13 @@
     "docs/data-schema.md": "04a3b4453f53ee349c774c5bf28ef439d2488ed8ee17a0e0840f98911f530a2c",
     ".gitattributes": "33399602be95aaa41c6539ffea6dc408358af3b4358201a97938b434a945d35f",
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
-    "docs/observability.md": "a5e576a19e5a6d328e6c4d92318aaf3ac29e11734af8b4d6e30fb55773a06b34",
+    "docs/observability.md": "f016d99326719f3ded35b75d41be3893567e37016c1c98ff8fdce611f8f77c72",
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
     "docs/security.md": "dd5bce8596878f6dee828fc69d8d051aa042c4044153f1c7620cd122872b7259",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "5745b671179876494ef66dea0d16a8b171cf9c2818ef8fac84fbae72741b38d3",
+    "docs/architecture.md": "e9157fe0fd7f896c08d92e721981a19e4cf647d5493e9f69c0fa7069f5322f41",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
-    ".bkit/.env.example": "817fa9ffb183f34a004f824a5d58416cc7ed1f336218024262dd7ada68c44641",
+    ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
     ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "55509636caed7293659d97f6939af8bb4e36a35bd4c82b9f79e7613f887ffccc",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
-    ".bkit/templates.md": "81a7f59e9ae5781da5a912ecef424323169860c3d1201eb549cd6509fd507a26",
+    ".bkit/templates.md": "7b0e85efcf6b73a86e4c5d51dc9d67c775758e107784e27fdd0a40c24da404db",
     "docs/templates/bkit-audit-adoption.md": "a3f28a15f89cf733d5458d3d5710d4a1bd322fd6e1cea1a0aa4f47b44d525b96",
     ".bkit/cloud.md": "ee7de5713685d27a89276cbb5a437cbeca6b5d2829d513ef4b21df891f9da426",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
@@ -229,12 +229,12 @@
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
-    ".claude/hooks/bkit-preflight.sh": "7df0e67d13c58242de82a537e2fd199ad7b4a3945e1c0c70f7ef3187671ec5b7",
+    ".claude/hooks/bkit-preflight.sh": "44d8cb78d79837e376f5c68aa394d79faa026ee6d0fa861838534f5fc3bb0741",
     ".codex/hooks/bkit-gateguard.cjs": "157502c7370e7a00e0cb2727f9efaeb65581c36b001cd450393dad98d1f180ff",
     ".codex/hooks/bkit-guardrails.cjs": "d5823a109b64d44682a91ef88cc263d9ca4f82385e1b2cf3547711198c1eeb43",
     ".cursor/hooks/bkit-gateguard.cjs": "f48b778f3c8e5af5e55cc5d84a4a4b125b208b50f39ca409d23cb014924cfcf4",
     ".cursor/hooks/bkit-guardrails.cjs": "8d14809ab0b85cb8f00934cc325824e87df3c534916bc3f470844db603d2c8cc",
-    ".cursor/hooks/bkit-preflight.sh": "2afc29492bd25942789a3fc0b2e54ecf02285547369823e89da8b1b8be4f3174",
+    ".cursor/hooks/bkit-preflight.sh": "111b1d27138318fbd19b4d16d11f559af8be27c1aa324c7711b3efede0853a81",
     ".opencode/plugin/bkit-gateguard.js": "c7c0f7980b05abf6dbdfb26d53f6e33b8342f181d18d8f8494a4e81d2ba9c74c",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
     "GEMINI.md": "29a57ff0a56385c4d9b36032fb5be4e42e34ad6992d0b4a4ed105423211cda64",
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index 037be79b2..9d44a2a0b 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -164,14 +164,34 @@ jobs:
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         if: steps.gate.outputs.enabled == 'true'
         with:
-          # `dev` at the workspace root: the dev arm's dispatch-cap counter row is
-          # committed to dev's `status.jsonl`; the feat/** arm reads the branch's
-          # `status.jsonl` from origin.
-          ref: dev
+          # Per-arm checkout: a feat/** run checks out the PR head branch (its `status.jsonl`,
+          # `.bkit/issues.jsonl` feature rows and lockfile are the ones the router reads); a
+          # dev run and a workflow_dispatch check out `dev`, where the dev arm commits its
+          # dispatch-cap counter row.
+          ref: ${{ startsWith(github.event.workflow_run.head_branch, 'feat/') && github.event.workflow_run.head_branch || 'dev' }}
           fetch-depth: 0
           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
           token: ${{ github.token }}
 
+      # The consumer's own bkit, from its lockfile, so the label gate reads the tracker through
+      # `bkit issues fetch` and FIDs through `bkit fids parse`. A failed install leaves
+      # node_modules/.bin/bkit absent: the gate reports bkit-unavailable and starts nothing.
+      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
+        if: steps.gate.outputs.enabled == 'true'
+        with:
+          node-version-file: .nvmrc
+          cache: pnpm
+
+      # Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
+      # Do NOT add `with: version:` here — pnpm/action-setup errors when both are set.
+      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
+        if: steps.gate.outputs.enabled == 'true'
+
+      - name: Install bkit
+        if: steps.gate.outputs.enabled == 'true'
+        continue-on-error: true
+        run: pnpm install --frozen-lockfile --ignore-scripts
+
       # Exactly one router job starts: the agent recorded in package.json `bkit.cloud.agent`,
       # and only when that agent's BKIT_ secret is set. Another agent's secret never starts a
       # job; Cursor runs through its own triggers and starts none here.
@@ -257,15 +277,13 @@ jobs:
           BRANCH: ${{ github.event.workflow_run.head_branch }}
           COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}
           HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
+          SEL_AGENT: ${{ steps.select.outputs.agent }}
+          SEL_DISPATCHED: ${{ steps.select.outputs.dispatched }}
+          SEL_IGNORED: ${{ steps.select.outputs.ignored }}
         run: |
           set -euo pipefail
-          # Cloud runs serve the GitHub tracker only: Linear cloud runs start from Cursor's
-          # Linear integration, and Jira runs locally only. Unset tracker → continue.
-          TRACKER=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
-          if [ -n "$TRACKER" ] && [ "$TRACKER" != "github" ]; then
-            echo "::notice::bkit.tracker.default is '$TRACKER' — bkit-cloud.yml serves the GitHub tracker only; no-op exit."
-            echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
-          fi
           if [ "$EVENT" = "workflow_dispatch" ]; then
             # Dispatched: phase + issue come straight from inputs.
             PHASE="$IN_PHASE"
@@ -369,6 +387,97 @@ jobs:
               return 0
             }
 
+            # bkit_gate <issue> — the tracker-agnostic bkit:auto gate. Reads the issue's labels
+            # through the consumer's own bkit (`issues fetch`), logs one `[bkit-cloud] gate:`
+            # line and writes one $GITHUB_STEP_SUMMARY row `tracker | issue | verdict | reason
+            # | jobs`. Returns 0 on pass; returns 1 (caller must skip, exit green) for every
+            # other outcome: no-issue, unreadable (bkit-unavailable, an exit 80 reason,
+            # output-unparseable), label-absent, no-agent. Unreadable fails closed: nothing starts.
+            bkit_gate() {
+              local gate_issue="${1:-}" tracker verdict="" reason="" jobs="" rc=0 reply="" outbox secret_var
+              tracker=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
+              tracker="${tracker:-none}"
+              # jobs: the dispatched job + its BKIT_ secret, each ignored job with its reason.
+              bkit_gate_secret() {
+                case "$1" in
+                  claude) printf '%s' "BKIT_ANTHROPIC_API_KEY" ;;
+                  opencode) printf '%s' "one of BKIT_OPENCODE_API_KEY, BKIT_OPENROUTER_API_KEY, BKIT_OLLAMA_API_KEY" ;;
+                  codex) printf '%s' "BKIT_OPENAI_API_KEY" ;;
+                esac
+              }
+              local job
+              if [ -n "${SEL_DISPATCHED:-}" ]; then
+                jobs="${SEL_DISPATCHED}:$(bkit_gate_secret "$SEL_DISPATCHED")"
+                for job in ${SEL_IGNORED:-}; do jobs="$jobs; $job: not bkit.cloud.agent"; done
+              elif [ -n "${SEL_AGENT:-}" ]; then
+                case "$SEL_AGENT" in
+                  claude | opencode | codex) jobs="$SEL_AGENT: missing $(bkit_gate_secret "$SEL_AGENT")" ;;
+                  *) jobs="bkit.cloud.agent is '$SEL_AGENT': no router job" ;;
+                esac
+                for job in ${SEL_IGNORED:-}; do jobs="$jobs; $job: not bkit.cloud.agent ($(bkit_gate_secret "$job"))"; done
+              fi
+              bkit_gate_row() {
+                {
+                  echo "### bkit-cloud gate"
+                  echo ""
+                  echo "| tracker | issue | verdict | reason | jobs |"
+                  echo "| --- | --- | --- | --- | --- |"
+                  echo "| $tracker | ${gate_issue:--} | $1 | $2 | ${jobs:--} |"
+                } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
+              }
+              if [ ! -x node_modules/.bin/bkit ]; then
+                echo "::warning::[bkit-cloud] gate: unreadable (bkit-unavailable) — node_modules/.bin/bkit is absent (the lockfile install failed); no agent starts."
+                bkit_gate_row unreadable bkit-unavailable
+                return 1
+              fi
+              if [ -z "$gate_issue" ]; then
+                echo "::notice::[bkit-cloud] gate: no-issue — no tracker issue is recorded for this run; no agent starts."
+                bkit_gate_row no-issue "no issue recorded"
+                return 1
+              fi
+              outbox=$(mktemp -d)
+              reply=$(node_modules/.bin/bkit issues fetch --issue "$gate_issue" --outbox "$outbox" --json 2>/dev/null) || rc=$?
+              if [ "$rc" -eq 80 ]; then
+                reason=$(printf '%s' "$reply" | jq -r '.reason // "unknown"' 2>/dev/null || echo unknown)
+                case "$tracker:$reason" in
+                  linear:auth) secret_var=BKIT_LINEAR_API_KEY ;;
+                  jira:auth) secret_var=BKIT_JIRA_API_KEY ;;
+                  github:auth) secret_var=GH_TOKEN ;;
+                  *) secret_var="" ;;
+                esac
+                if [ -n "$secret_var" ]; then
+                  echo "::warning::[bkit-cloud] gate: unreadable (reason=auth) — the $tracker read was refused; check the $secret_var secret (${!secret_var:+set but rejected}${!secret_var:-empty or missing}). No agent starts."
+                else
+                  echo "::warning::[bkit-cloud] gate: unreadable (reason=$reason) — the $tracker issue could not be read; no agent starts."
+                fi
+                bkit_gate_row unreadable "reason=$reason${secret_var:+ ($secret_var)}"
+                return 1
+              fi
+              if [ "$rc" -ne 0 ]; then
+                echo "::warning::[bkit-cloud] gate: unreadable (reason=exit-$rc) — bkit issues fetch failed; no agent starts."
+                bkit_gate_row unreadable "reason=exit-$rc"
+                return 1
+              fi
+              if ! printf '%s' "$reply" | jq -e '.labels | type == "array"' > /dev/null 2>&1; then
+                echo "::warning::[bkit-cloud] gate: unreadable (reason=output-unparseable) — bkit issues fetch printed no label list; no agent starts."
+                bkit_gate_row unreadable "reason=output-unparseable"
+                return 1
+              fi
+              if ! printf '%s' "$reply" | jq -e '.labels | index("bkit:auto") != null' > /dev/null 2>&1; then
+                echo "::notice::[bkit-cloud] gate: label-absent — issue $gate_issue no longer carries bkit:auto; no agent starts (kill switch)."
+                bkit_gate_row label-absent "bkit:auto not on the issue"
+                return 1
+              fi
+              if [ -n "${SEL_AGENT:-}" ] && [ -z "${SEL_DISPATCHED:-}" ]; then
+                echo "::notice::[bkit-cloud] gate: no-agent — $jobs; no agent starts."
+                bkit_gate_row no-agent "bkit:auto present, no agent job selected"
+                return 1
+              fi
+              echo "::notice::[bkit-cloud] gate: pass — issue $gate_issue carries bkit:auto."
+              bkit_gate_row pass "bkit:auto present"
+              return 0
+            }
+
             if [ "$BRANCH" = "dev" ]; then
               # Post-merge dev CI — no open PR. Recover FID from squash-merge commit
               # scope. dev success = regression check passed = no-op (the merge
@@ -382,8 +491,7 @@ jobs:
               # Shape-tolerant: the regex accepts BOTH GitHub
               # (363-slug) and Linear (bar-123-slug) FID SHAPES, mirroring the
               # alternation the feat/** fallback below uses. The kill switch
-              # below (`gh issue view "$ISSUE"`) is GitHub-Issues-only, so a
-              # Linear FID no-ops there (empty labels -> bkit:auto absent).
+              # below (`bkit_gate`) reads any wired tracker through bkit.
               # `head -1` FIRST — head_commit.message is subject+body and
               # grep's `^` anchors per line, so without it a squash body line
               # (GitHub's default body is the list of source commit subjects)
@@ -409,13 +517,10 @@ jobs:
               # instead of reaching the designed no-op exit just below.
               ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
               ARG="$FID"
-              # Kill switch: re-check bkit:auto on the issue (live revocation).
-              # exact label match, not substring. MUST precede the stale-run
-              # guard and the dispatch-cap guard below; it needs nothing they set.
-              if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
-                echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
-                echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
-              fi
+              # Kill switch: re-check bkit:auto on the issue (live revocation), through
+              # bkit_gate. MUST precede the stale-run guard and the dispatch-cap guard
+              # below; it needs nothing they set.
+              bkit_gate "$ISSUE" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
               # Stale-run guard: HEAD_SHA is current iff it is the headSha of the
               # most recent COMPLETED CI run on dev ([skip ci] close commits never
               # appear in gh run list). --workflow bkit-ci.yml (filename), not `bkit-ci`
@@ -459,47 +564,30 @@ jobs:
               fi
               ARG="$PR_NUMBER"
 
-              # PRIMARY: parse the bkit:issue / bkit:fid markers shipped in every
-              # bkit-build PR body. Also assert the marker-derived FID
-              # against the slug allowlist here — bkit:fid=[^[:space:]>]+ admits
-              # '/', '.', '..' and glob metacharacters, so an unvalidated match
-              # falls through to path construction (find -path / mkdir -p / git
-              # commit) in bkit_dev_dispatch_guard below. A mismatch falls through
-              # to the branch fallback exactly like an empty/missing marker.
+              # `bkit fids parse` (the consumer's own bkit) recovers FID + issue id: the
+              # PR-body marker first (any wired tracker's shape, Jira keys with digits
+              # included), then the feat/{FID} branch, whose issue id counts only when
+              # `.bkit/issues.jsonl` has a feature row for it. The FID is asserted against
+              # the slug allowlist before it builds any path (find -path / mkdir -p / git
+              # commit) in the guards below. An absent bkit leaves both empty; bkit_gate
+              # then reports bkit-unavailable.
               PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
-              ISSUE=$(echo "$PR_BODY" | grep -oE 'bkit:issue=#[0-9]+' | sed 's/bkit:issue=#//' | head -1 || true)
-              FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
-              if [ -z "$ISSUE" ] || [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
-                # FALLBACK: extract FID from the branch name (feat/{FID}) when the
-                # PR body carries no usable bkit:fid= marker.
-                # keep the FULL slug (do NOT collapse to the leading
-                # numeric/alpha id, e.g. '363' instead of
-                # '363-widen-bkit-cloud-trigger'). ISSUE (short
-                # numeric/alpha prefix, used only for `gh issue view`) is derived
-                # FROM the full FID, not the other way round. NOTE the '#' sed
-                # delimiter: with '|' the alternation would need escaping and is
-                # ambiguous under -E.
-                FID=$(echo "$BRANCH" | sed -E 's#^feat/##')
-                # `|| true` is load-bearing under `set -euo pipefail` —
-              # this runs BEFORE the slug allowlist, so a non-FID branch
-              # (Renovate, a hand-named hotfix) yields no match,
-              # pipefail propagates grep's exit 1, and the step dies red
-              # instead of reaching the designed no-op exit just below.
-              ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+              PARSED=""
+              if [ -x node_modules/.bin/bkit ]; then
+                PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json 2>/dev/null || true)
               fi
-              if [ -z "$FID" ] || [ -z "$ISSUE" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
-                echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."
-                echo "skip=true" >> "$GITHUB_OUTPUT"
-                exit 0
+              FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
+              ISSUE=$(printf '%s' "$PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
+              if [ -n "$FID" ] && ! [[ "$FID" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
+                FID=""
+                ISSUE=""
+              fi
+              if [ -z "$FID" ] && [ -x node_modules/.bin/bkit ]; then
+                echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no usable bkit:fid marker or feat/{FID} branch."
               fi
 
               # Cheap-tier kill switch: re-check bkit:auto on the issue (live revocation).
-              # exact label match, not substring.
-              if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
-                echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
-                echo "skip=true" >> "$GITHUB_OUTPUT"
-                exit 0
-              fi
+              bkit_gate "$ISSUE" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
 
               # A build still writing this branch owns it: no-op exit. "Still
               # running" = the branch's status.jsonl has a build workflow-started
diff --git a/docs/observability.md b/docs/observability.md
index 9bcd73555..476d41d49 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -176,6 +176,21 @@ Release-PR capstone in mirror mode (`docs/deployments.md` § One CI run per dev
 - `[bkit-runs] dev push run at %s is in progress — waiting (up to %sm).` — logged once per state change, not per poll.
 - `[bkit-runs] no dev push run exists at %s after %sm.` — exit 3.
 
+### `[bkit-cloud] gate:` annotations — router label gate
+
+`bkit-cloud.yml`'s context job reads `bkit:auto` through the consumer's own bkit (`bkit issues fetch`) on every tracker. Each run logs one GitHub annotation and writes one `$GITHUB_STEP_SUMMARY` row `tracker | issue | verdict | reason | jobs`. Every outcome other than `pass` starts no agent and leaves the run green. Brackets load-bearing — log-drain grep key.
+
+<!-- prettier-ignore -->
+| Verdict | Annotation | Reason column |
+| --- | --- | --- |
+| `pass` | `::notice::[bkit-cloud] gate: pass` | `bkit:auto present` |
+| `label-absent` | `::notice::[bkit-cloud] gate: label-absent` | `bkit:auto not on the issue` |
+| `no-issue` | `::notice::[bkit-cloud] gate: no-issue` | no issue recorded in the marker or a feature row |
+| `no-agent` | `::notice::[bkit-cloud] gate: no-agent` | label present but `bkit.cloud.agent` selected no job |
+| `unreadable` | `::warning::[bkit-cloud] gate: unreadable (…)` | `bkit-unavailable` (lockfile install failed), `reason=auth` (names `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` / `GH_TOKEN`), `reason=network`, `reason=not-found`, `reason=exit-N`, `reason=output-unparseable` |
+
+The `jobs` column holds the `Select agent job` hand-off: the dispatched job with its `BKIT_` secret (`codex:BKIT_OPENAI_API_KEY`) and each ignored job with its reason (`claude: not bkit.cloud.agent`); a `no-agent` row names the recorded agent's missing `BKIT_` secret and the ignored secrets.
+
 ## Advisory Checklist Output
 
 Post-install findings via `formatChecklist(ctx.advisories)` (`.bkit/core/engine/checks/after/index.ts`). Each `PreflightFinding`: `{ id, severity, detect, action }`. Primary human-readable observability surface.
