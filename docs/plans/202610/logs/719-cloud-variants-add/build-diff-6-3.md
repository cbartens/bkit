diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 925832ea4..91aa27e78 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -227,14 +227,14 @@ const ADOPTED: Record<string, Entry> = {
         what: "runner",
         fill: "runs-on: {{CLOUD_RUNNER}}",
         with: "runs-on: ubuntu-latest",
-        count: 3,
+        count: 4,
       },
       {
         kind: "placeholder",
         what: "Node version from .nvmrc",
         fill: "node-version: {{NODE_VERSION}}\n",
         with: "node-version-file: .nvmrc\n",
-        count: 1,
+        count: 3,
       },
     ],
   },
diff --git a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
index e17bcd7ee..71cf0cdc9 100644
--- a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
@@ -187,7 +187,27 @@ interface RunResult {
   summary: string;
 }
 
+/**
+ * The dev arm names the FID through `bkit fids parse --prompt-file` (a `logs/{FID}/` folder) and
+ * takes the issue from the FID's feature row in `.bkit/issues.jsonl`. A dev run whose subject
+ * scopes a slug-shaped FID gets both, unless the test seeded its own `.bkit/issues.jsonl`.
+ */
+function seedDevFeature(workspaceDir: string, subject: string): void {
+  const fid = /^\w+\(([a-z0-9][a-z0-9-]*)\):/.exec(subject.split("\n")[0] ?? "")?.[1];
+  if (!fid) return;
+  if (statusDirs(workspaceDir, fid).length === 0) {
+    fs.mkdirSync(path.join(workspaceDir, "docs/plans/202611/logs", fid), { recursive: true });
+  }
+  const rows = path.join(workspaceDir, ".bkit/issues.jsonl");
+  if (fs.existsSync(rows)) return;
+  fs.mkdirSync(path.dirname(rows), { recursive: true });
+  fs.writeFileSync(rows, JSON.stringify({ schema: 2, kind: "feature", key: fid }) + "\n");
+}
+
 function runCtxStep(fixture: Fixture, env: Record<string, string>): RunResult {
+  if (env.BRANCH === "dev" && env.COMMIT_MSG !== undefined) {
+    seedDevFeature(fixture.workspaceDir, env.COMMIT_MSG);
+  }
   const outputFile = path.join(fixture.workspaceDir, `.gh-output-${Math.random()}`);
   const summaryFile = path.join(fixture.workspaceDir, `.gh-summary-${Math.random()}`);
   fs.writeFileSync(outputFile, "");
@@ -347,7 +367,11 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
   // -------------------------------------------------------------------------
   // T16 — dev-path FID recovery is shape-tolerant (GitHub + Linear slugs)
   // -------------------------------------------------------------------------
-  it("T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", () => {
+  it("T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches", () => {
+    fs.writeFileSync(
+      path.join(fixture.workspaceDir, "package.json"),
+      JSON.stringify({ name: "c", bkit: { tracker: { default: "linear" } } }),
+    );
     const result = runCtxStep(fixture, {
       EVENT: "workflow_run",
       CONCLUSION: "failure",
@@ -355,15 +379,24 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
       COMMIT_MSG: "feat(bar-123-auth): add OAuth flow (#9) bkit [auto route]",
       HEAD_SHA: "sha-linear",
       STUB_LATEST_CI_SHA: "sha-linear",
-      STUB_ISSUE_LABELS: "bkit:auto",
+      STUB_FETCH_EXIT: "0",
+      STUB_FETCH_OUT: JSON.stringify({
+        title: "t",
+        url: "u",
+        state: "In Progress",
+        labels: ["bkit:auto"],
+        terminal: false,
+        files: {},
+      }),
     });
     expect(result.outputs.skip).toBe("false");
     expect(result.outputs.arg).toBe("bar-123-auth");
   });
 
-  // Jira is local-only: a Jira key holding a digit (ab1-123-slug) matches neither cloud
-  // shape, so the dev arm no-ops on shape before any label check or counter write.
-  it("T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", () => {
+  // The tracker comes from package.json, never from the FID's shape: under the github tracker a
+  // Jira-shaped key (ab1-123-slug) has no issue id, so the gate stops before any counter write.
+  // Under jira the same shape dispatches (see the ab2-12 test below).
+  it("T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch", () => {
     const result = runCtxStep(fixture, {
       EVENT: "workflow_run",
       CONCLUSION: "failure",
@@ -551,6 +584,176 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
     });
   });
 
+  // -------------------------------------------------------------------------
+  // Dev arm — FID through `bkit fids parse --prompt-file`, issue through the feature row.
+  // -------------------------------------------------------------------------
+  describe("dev path — engine parse of the squash subject and merged-PR body", () => {
+    const seedFeature = (fid: string) => {
+      fs.mkdirSync(path.join(fixture.workspaceDir, "docs/plans/202611/logs", fid), {
+        recursive: true,
+      });
+      fs.mkdirSync(path.join(fixture.workspaceDir, ".bkit"), { recursive: true });
+      fs.writeFileSync(
+        path.join(fixture.workspaceDir, ".bkit/issues.jsonl"),
+        JSON.stringify({ schema: 2, kind: "feature", key: fid }) + "\n",
+      );
+    };
+    const setTracker = (tracker: string) =>
+      fs.writeFileSync(
+        path.join(fixture.workspaceDir, "package.json"),
+        JSON.stringify({ name: "c", bkit: { tracker: { default: tracker } } }),
+      );
+    const spyBkit = (logFile: string) => {
+      const bin = path.join(fixture.workspaceDir, "node_modules/.bin/bkit");
+      fs.renameSync(bin, `${bin}-real`);
+      fs.writeFileSync(
+        bin,
+        `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> "${logFile}"\nexec "${bin}-real" "$@"\n`,
+        { mode: 0o755 },
+      );
+    };
+    const devRun = (commitMsg: string, env: Record<string, string> = {}) =>
+      runCtxStep(fixture, {
+        EVENT: "workflow_run",
+        CONCLUSION: "failure",
+        BRANCH: "dev",
+        COMMIT_MSG: commitMsg,
+        HEAD_SHA: "dev-sha",
+        STUB_LATEST_CI_SHA: "dev-sha",
+        STUB_ISSUE_LABELS: "bkit:auto",
+        ...env,
+      });
+    const recorded = (state: string, terminal: boolean) =>
+      JSON.stringify({
+        title: "t",
+        url: "u",
+        state,
+        labels: ["bkit:auto"],
+        terminal,
+        files: {},
+      });
+    const FID = "363-widen-bkit-cloud-trigger";
+    /** Every file and directory under the workspace, minus run scratch, .git and node_modules. */
+    const tree = (): string[] => {
+      const out: string[] = [];
+      const walk = (dir: string) => {
+        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
+          if (e.name === ".git" || e.name === "node_modules" || e.name.startsWith(".gh-")) continue;
+          const p = path.join(dir, e.name);
+          out.push(path.relative(fixture.workspaceDir, p));
+          if (e.isDirectory()) walk(p);
+        }
+      };
+      walk(fixture.workspaceDir);
+      return out.sort();
+    };
+
+    it("dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row", () => {
+      seedFeature(FID);
+      const bkitLog = path.join(tmpRoot, "bkit.log");
+      const ghLog = path.join(tmpRoot, "gh.log");
+      fs.writeFileSync(bkitLog, "");
+      spyBkit(bkitLog);
+      const result = devRun(`feat(${FID}): widen trigger (#500) bkit [auto route]`, {
+        STUB_GH_LOG: ghLog,
+      });
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("false");
+      expect(result.outputs.phase).toBe("debug");
+      expect(result.outputs.arg).toBe(FID);
+      const bkitCalls = fs.readFileSync(bkitLog, "utf8");
+      expect(bkitCalls).toMatch(/fids parse --prompt-file \S+ --json/);
+      expect(bkitCalls).toContain(`--branch feat/${FID}`);
+      const ghCalls = fs.readFileSync(ghLog, "utf8");
+      expect(ghCalls).toMatch(/issues\/363/);
+      expect(ghCalls).not.toMatch(/issues\/500/);
+    });
+
+    it("linear-shaped FID under the github tracker gives no-issue and no dispatch", () => {
+      seedFeature("bar-123-auth");
+      const ghLog = path.join(tmpRoot, "gh.log");
+      fs.writeFileSync(ghLog, "");
+      const result = devRun("feat(bar-123-auth): add OAuth flow (#9) bkit [auto route]", {
+        STUB_GH_LOG: ghLog,
+      });
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(result.stdout).toContain("no-issue");
+      expect(fs.readFileSync(ghLog, "utf8")).not.toMatch(/\/issues\//);
+      expect(readStatusRows(fixture.workspaceDir, "bar-123-auth")).toEqual([]);
+    });
+
+    it("dev subject naming several issues is a no-FID no-op", () => {
+      seedFeature(FID);
+      const result = devRun(
+        `feat(${FID}): handle issue #11 and issue #12 (#500) bkit [auto route]`,
+        { STUB_API_PR_BODY: "" },
+      );
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(readStatusRows(fixture.workspaceDir, FID)).toEqual([]);
+    });
+
+    it("dev arm passes the gate for a closed issue that still carries bkit:auto", () => {
+      seedFeature(FID);
+      const result = devRun(`feat(${FID}): widen trigger (#500) bkit [auto route]`, {
+        STUB_FETCH_EXIT: "0",
+        STUB_FETCH_OUT: recorded("Done", true),
+      });
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("false");
+      expect(result.outputs.phase).toBe("debug");
+      expect(result.outputs.arg).toBe(FID);
+      expect(new RegExp(`^\\|.*\\|\\s*pass\\s*\\|`, "m").test(result.summary)).toBe(true);
+      expect(readStatusRows(fixture.workspaceDir, FID)).toHaveLength(1);
+    });
+
+    it("dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches", () => {
+      const jiraFid = "ab2-12-login-retry";
+      setTracker("jira");
+      seedFeature(jiraFid);
+      const result = devRun(`feat(${jiraFid}): retry login (#9) bkit [auto route]`, {
+        STUB_FETCH_EXIT: "0",
+        STUB_FETCH_OUT: recorded("In Progress", false),
+      });
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("false");
+      expect(result.outputs.phase).toBe("debug");
+      expect(result.outputs.arg).toBe(jiraFid);
+      expect(result.stdout).not.toContain("Invalid FID");
+      expect(readStatusRows(fixture.workspaceDir, jiraFid)).toHaveLength(1);
+    });
+
+    it("traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/", () => {
+      seedFeature(FID);
+      const before = tree();
+      const cases: Array<[string, string, string]> = [
+        ["subject", "feat(../x): sneaky (#9) bkit [auto route]", ""],
+        [
+          "merged-PR body",
+          "Manual push straight to dev bkit [auto route]",
+          "<!-- bkit:issue=363 bkit:fid=../x -->",
+        ],
+        [
+          "merged-PR body slash path",
+          "Manual push straight to dev bkit [auto route]",
+          "<!-- bkit:issue=363 bkit:fid=a/../../x -->",
+        ],
+      ];
+      for (const [name, subject, body] of cases) {
+        const result = devRun(subject, { STUB_API_PR_BODY: body });
+        expect(result.status, `${name}: ${result.stderr}`).toBe(0);
+        expect(result.outputs.skip, name).toBe("true");
+        expect(result.outputs.phase, name).toBeUndefined();
+        expect(tree(), name).toEqual(before);
+        expect(readStatusRows(fixture.workspaceDir, "x"), name).toEqual([]);
+        expect(readStatusRows(fixture.workspaceDir, FID), name).toEqual([]);
+      }
+    });
+  });
+
   it("a github tracker in package.json passes the tracker gate and dispatches", () => {
     fs.writeFileSync(
       path.join(fixture.workspaceDir, "package.json"),
@@ -598,10 +801,13 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
       fs.writeFileSync(path.join(fixture.workspaceDir, "package.json"), text);
 
     it("refuses to dispatch uncounted when package.json cannot be read", () => {
+      // The engine cannot read the wired tracker from a broken package.json either, so the run
+      // stops before the cap read; either way nothing dispatches and no counter row is written.
       writePkg("{ broken");
       const result = devFailure("new-sha");
       expect(result.outputs.skip).toBe("true");
-      expect(`${result.stdout}${result.stderr}`).toContain("refusing to dispatch uncounted");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger")).toEqual([]);
     });
 
     it("4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped", () => {
@@ -636,7 +842,10 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
       writePkg(
         JSON.stringify({
           name: "c",
-          bkit: { workflows: { debug: { fix: { maxAttempts: 1 }, soak: { maxAttempts: 0 } } } },
+          bkit: {
+            tracker: { default: "github" },
+            workflows: { debug: { fix: { maxAttempts: 1 }, soak: { maxAttempts: 0 } } },
+          },
         }),
       );
       seedDevDispatchRows(fixture.workspaceDir, fid, ["sha-1", "sha-2"]);
diff --git a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
index 04f6f083e..13b7c324e 100644
--- a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
@@ -2,6 +2,7 @@
 // workflow templates.
 
 import * as fs from "node:fs";
+import * as os from "node:os";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { describe, expect, it } from "vitest";
@@ -85,12 +86,17 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
 
   it("every job's runs-on is the {{CLOUD_RUNNER}} placeholder the consumer fills in", () => {
     const runsOn = [...yml.matchAll(/^ {4}runs-on: (.+)$/gm)].map((m) => m[1]);
-    expect(runsOn).toEqual(["{{CLOUD_RUNNER}}", "{{CLOUD_RUNNER}}", "{{CLOUD_RUNNER}}"]);
+    expect(runsOn).toEqual([
+      "{{CLOUD_RUNNER}}",
+      "{{CLOUD_RUNNER}}",
+      "{{CLOUD_RUNNER}}",
+      "{{CLOUD_RUNNER}}",
+    ]);
   });
 
-  it("one context job resolves phase + arg; both runner jobs need it and read its outputs", () => {
+  it("one context job resolves phase + arg; every runner job needs it and read its outputs", () => {
     expect(yml.match(/- name: Resolve phase \+ brief context/g)).toHaveLength(1);
-    expect(yml.match(/^ {4}needs: context$/gm)).toHaveLength(2);
+    expect(yml.match(/^ {4}needs: context$/gm)).toHaveLength(3);
     expect(yml).toContain(
       "if: needs.context.outputs.claude == 'true' && needs.context.outputs.skip != 'true'",
     );
@@ -322,7 +328,9 @@ describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety r
 
   it("(1c) the FID/ISSUE extraction lines exit 0 under set -euo pipefail on an empty parse and read a recorded parse (real-tool validation)", () => {
     const canonical = readBkitCloudYml();
-    const block = canonical.slice(canonical.indexOf("# SHARED-DERIV:"));
+    // The feat/** arm reads the marker + branch parse (`.fid` / `.issueId`); the dev arm above
+    // it reads `.fidNamed` from the subject parse.
+    const block = canonical.slice(canonical.indexOf("# feat/** pre-merge path"));
     const fidLine = block.match(/FID=\$\(printf '%s' "\$PARSED" \| jq[^\n]+\)/)![0].trim();
     const issueLine = block.match(/ISSUE=\$\(printf '%s' "\$PARSED" \| jq[^\n]+\)/)![0].trim();
     const run = (parsed: string) =>
@@ -350,3 +358,241 @@ describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety r
     expect(parsed.stdout).toContain("FID=141-cloud-app ISSUE=141");
   });
 });
+
+// ---------------------------------------------------------------------------
+// Router dispatch jobs — tracker secrets at step scope, the codex job, the install blocks.
+// ---------------------------------------------------------------------------
+
+interface CloudStep {
+  name?: string;
+  id?: string;
+  if?: string;
+  uses?: string;
+  run?: string;
+  env?: Record<string, unknown>;
+  with?: Record<string, unknown>;
+}
+interface CloudJob {
+  needs?: string | string[];
+  if?: string;
+  env?: Record<string, unknown>;
+  permissions?: Record<string, string>;
+  steps: CloudStep[];
+}
+interface CloudDoc {
+  env?: Record<string, unknown>;
+  jobs: Record<string, CloudJob>;
+}
+
+const secretMapped = (env: Record<string, unknown> | undefined, name: string): boolean =>
+  env?.[name] === `\${{ secrets.${name} }}`;
+const isDispatchStep = (st: CloudStep): boolean =>
+  Boolean(
+    st.uses?.startsWith("anthropics/claude-code-action@") ||
+    st.uses?.startsWith("openai/codex-action@") ||
+    st.name?.startsWith("Dispatch /bkit-auto on opencode"),
+  );
+const dispatchSteps = (doc: CloudDoc): Array<[string, CloudStep]> =>
+  Object.entries(doc.jobs)
+    .filter(([id]) => id !== "context")
+    .flatMap(([id, job]) =>
+      job.steps.filter(isDispatchStep).map((st): [string, CloudStep] => [id, st]),
+    );
+const withOf = (st: CloudStep): Record<string, unknown> => st.with ?? {};
+const writesConfigToml = (st: CloudStep): boolean => /config\.toml/.test(st.run ?? "");
+const isAlwaysRun = (st: CloudStep): boolean => st.if?.trim() === "always()" && Boolean(st.run);
+const dummyEnv = (st: CloudStep): Record<string, string> =>
+  Object.fromEntries(Object.keys(st.env ?? {}).map((k) => [k, `value-${k}`]));
+
+describe("bkit-cloud.yml template — dispatch jobs", () => {
+  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
+  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
+  const raw = fs.readFileSync(
+    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
+    "utf-8",
+  );
+  const filled = raw
+    .replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")
+    .replaceAll("{{NODE_VERSION}}", "22");
+  const doc = parseYaml(filled) as CloudDoc;
+  const codexJob = (): CloudJob => {
+    const job = doc.jobs.codex;
+    expect(job, "no codex job").toBeDefined();
+    return job!;
+  };
+  const codexActionIndex = (job: CloudJob) =>
+    job.steps.findIndex((st) => st.uses?.startsWith("openai/codex-action@"));
+  const installIndex = (job: CloudJob) =>
+    job.steps.findIndex((st) => /pnpm install --frozen-lockfile/.test(st.run ?? ""));
+  const has = (cmd: string, args: string[]) =>
+    spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
+
+  it("tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env", () => {
+    const secrets = ["BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"];
+    const mapped = secretMapped;
+    const ctx = doc.jobs.context!.steps.find((st) => st.id === "ctx");
+    expect(ctx, "no ctx step").toBeDefined();
+    for (const name of secrets) expect(mapped(ctx!.env, name), `ctx ${name}`).toBe(true);
+
+    const dispatch = dispatchSteps(doc);
+    expect(dispatch.map(([id]) => id).sort()).toEqual(expect.arrayContaining(["opencode", "run"]));
+    for (const [id, st] of dispatch) {
+      for (const name of secrets) expect(mapped(st.env, name), `${id} ${name}`).toBe(true);
+    }
+    for (const [id, job] of Object.entries(doc.jobs)) {
+      for (const name of secrets) expect(job.env?.[name], `job ${id} env ${name}`).toBeUndefined();
+    }
+    for (const name of secrets) expect(doc.env?.[name], `workflow env ${name}`).toBeUndefined();
+  });
+
+  it("codex job runs only when the context job selects codex and skip is not true", () => {
+    const job = codexJob();
+    expect(job.if?.trim()).toBe(
+      "needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'",
+    );
+    expect(job.needs).toBe("context");
+    expect(job.permissions).toEqual(doc.jobs.opencode!.permissions);
+  });
+
+  it("codex job installs dependencies before openai/codex-action", () => {
+    const job = codexJob();
+    const action = codexActionIndex(job);
+    const install = installIndex(job);
+    expect(action, "no openai/codex-action step").toBeGreaterThan(-1);
+    expect(install, "no pnpm install --frozen-lockfile step").toBeGreaterThan(-1);
+    expect(install).toBeLessThan(action);
+    const before = job.steps.slice(0, install);
+    expect(before.some((st) => st.uses?.startsWith("actions/setup-node@"))).toBe(true);
+    expect(before.some((st) => st.uses?.startsWith("pnpm/action-setup@"))).toBe(true);
+    expect(before.some((st) => st.uses?.startsWith("actions/checkout@"))).toBe(true);
+  });
+
+  it("codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation", () => {
+    const action = codexJob().steps.find((st) => st.uses?.startsWith("openai/codex-action@"));
+    expect(action, "no openai/codex-action step").toBeDefined();
+    expect(action!.uses).toMatch(/^openai\/codex-action@[0-9a-f]{40}$/);
+    expect(raw).toMatch(/uses: openai\/codex-action@[0-9a-f]{40} # v1\s*$/m);
+    expect(String(action!.with?.["codex-version"])).toMatch(/^\d+\.\d+\.\d+$/);
+    expect(raw).toMatch(
+      /# renovate: datasource=npm depName=@openai\/codex\n\s*codex-version: "\d+\.\d+\.\d+"/,
+    );
+  });
+
+  it("codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt", () => {
+    const action = codexJob().steps.find((st) => st.uses?.startsWith("openai/codex-action@"));
+    expect(action, "no openai/codex-action step").toBeDefined();
+    const w = withOf(action!);
+    expect(w["sandbox"]).toBe("danger-full-access");
+    expect(String(w["allow-bots"])).toBe("true");
+    expect(w["openai-api-key"]).toBe("${{ secrets.BKIT_OPENAI_API_KEY }}");
+    expect(w["prompt"]).toBe(
+      "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}",
+    );
+    expect(String(w["codex-home"])).toContain("codex-home");
+    expect(raw).not.toMatch(/secrets\.OPENAI_API_KEY/);
+  });
+
+  it("trust step writes a codex-home config.toml trusting the workspace", () => {
+    const step = codexJob().steps.find(writesConfigToml);
+    expect(step, "no step writes config.toml").toBeDefined();
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-codex-trust-"));
+    try {
+      const runnerTemp = path.join(dir, "runner-temp");
+      const workspace = path.join(dir, "ws");
+      fs.mkdirSync(runnerTemp);
+      fs.mkdirSync(workspace);
+      const res = spawnSync("bash", ["-eo", "pipefail", "-c", step!.run!], {
+        cwd: workspace,
+        encoding: "utf8",
+        env: {
+          ...process.env,
+          RUNNER_TEMP: runnerTemp,
+          GITHUB_WORKSPACE: workspace,
+          GITHUB_ENV: path.join(dir, "env"),
+          GITHUB_OUTPUT: path.join(dir, "out"),
+        },
+      });
+      expect(res.status, res.stderr).toBe(0);
+      const config = path.join(runnerTemp, "codex-home", "config.toml");
+      expect(fs.existsSync(config), "no codex-home/config.toml").toBe(true);
+      const toml = fs.readFileSync(config, "utf8");
+      expect(toml).toContain(`[projects."${workspace}"]`);
+      expect(toml).toMatch(/trust_level\s*=\s*"trusted"/);
+    } finally {
+      fs.rmSync(dir, { recursive: true, force: true });
+    }
+  });
+
+  it.skipIf(!has("actionlint", ["-version"]))("filled bkit-cloud.yml passes actionlint", () => {
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-lint-"));
+    try {
+      const file = path.join(dir, "bkit-cloud.yml");
+      fs.writeFileSync(file, filled);
+      const r = spawnSync("actionlint", ["-no-color", file], { encoding: "utf-8" });
+      expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
+    } finally {
+      fs.rmSync(dir, { recursive: true, force: true });
+    }
+  });
+
+  it("codex summary step runs under if: always() and writes action, commits and comments", () => {
+    const job = codexJob();
+    const action = codexActionIndex(job);
+    expect(action, "no openai/codex-action step").toBeGreaterThan(-1);
+    const step = job.steps.slice(action + 1).find(isAlwaysRun);
+    expect(step, "no if: always() summary step after the action").toBeDefined();
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-codex-summary-"));
+    try {
+      const stubBin = path.join(dir, "bin");
+      fs.mkdirSync(stubBin);
+      fs.writeFileSync(path.join(stubBin, "gh"), "#!/usr/bin/env bash\necho 0\n", { mode: 0o755 });
+      const ws = path.join(dir, "ws");
+      fs.mkdirSync(ws);
+      for (const args of [
+        ["init", "-q", "-b", "dev"],
+        ["config", "user.email", "t@t.co"],
+        ["config", "user.name", "t"],
+        ["commit", "-q", "--allow-empty", "-m", "base"],
+      ]) {
+        spawnSync("git", args, { cwd: ws });
+      }
+      const summary = path.join(dir, "summary");
+      fs.writeFileSync(summary, "");
+      const stepEnv = dummyEnv(step!);
+      spawnSync("bash", ["-c", step!.run!], {
+        cwd: ws,
+        encoding: "utf8",
+        env: {
+          ...process.env,
+          PATH: `${stubBin}:${process.env.PATH}`,
+          GITHUB_STEP_SUMMARY: summary,
+          GITHUB_WORKSPACE: ws,
+          GITHUB_REPOSITORY: "owner/repo",
+          RUNNER_TEMP: dir,
+          GH_TOKEN: "dummy",
+          ...stepEnv,
+        },
+      });
+      const text = fs.readFileSync(summary, "utf8");
+      for (const field of ["action", "commits", "comments"]) {
+        expect(text.toLowerCase(), `summary lacks ${field}`).toContain(field);
+      }
+    } finally {
+      fs.rmSync(dir, { recursive: true, force: true });
+    }
+  });
+
+  it("opencode job installs dependencies before its dispatch step", () => {
+    const job = doc.jobs.opencode!;
+    const install = installIndex(job);
+    const dispatch = job.steps.findIndex((st) =>
+      st.name?.startsWith("Dispatch /bkit-auto on opencode"),
+    );
+    expect(dispatch, "no opencode dispatch step").toBeGreaterThan(-1);
+    expect(install, "no pnpm install --frozen-lockfile step").toBeGreaterThan(-1);
+    expect(install).toBeLessThan(dispatch);
+    const before = job.steps.slice(0, install);
+    expect(before.some((st) => st.uses?.startsWith("actions/setup-node@"))).toBe(true);
+    expect(before.some((st) => st.uses?.startsWith("pnpm/action-setup@"))).toBe(true);
+  });
+});
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index 3fd3f9c23..aedf0b645 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -314,12 +314,11 @@ jobs:
             # proceeding). Returns 0 to proceed to dispatch.
             bkit_dev_dispatch_guard() {
               local guard_fid="$1" guard_head_sha="$2"
-              # assert the FID against the same slug allowlist the dev arm
-              # already enforces BEFORE it's used to build any path (find -path /
-              # mkdir -p / git commit -m). Defence-in-depth re-check for the
-              # PR-body marker path (bkit:fid=<anything up to whitespace/'>'>
-              # admits '/', '.', '..').
-              if ! [[ "$guard_fid" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+              # assert the characters of the FID that `bkit fids parse` printed
+              # (the engine slug charset: lowercase letters, digits, '-'; no '/', no
+              # '.', non-empty) BEFORE it's used to build any path (find -path /
+              # mkdir -p / git commit -m). This checks characters, not FID shape.
+              if ! [[ "$guard_fid" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
                 echo "::notice::Invalid FID '$guard_fid' — refusing to write dev-dispatch counter (fail-closed)."
                 return 1
               fi
@@ -394,7 +393,7 @@ jobs:
             # other outcome: no-issue, unreadable (bkit-unavailable, an exit 80 reason,
             # output-unparseable), label-absent, no-agent. Unreadable fails closed: nothing starts.
             bkit_gate() {
-              local gate_issue="${1:-}" tracker verdict="" reason="" jobs="" rc=0 reply="" outbox secret_var
+              local gate_issue="${1:-}" tracker reason="" jobs="" rc=0 reply="" outbox secret_var
               tracker=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
               tracker="${tracker:-none}"
               # jobs: the dispatched job + its BKIT_ secret, each ignored job with its reason.
@@ -487,35 +486,39 @@ jobs:
                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
               fi
               # PHASE=debug below.
-              # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
-              # Shape-tolerant: the regex accepts BOTH GitHub
-              # (363-slug) and Linear (bar-123-slug) FID SHAPES, mirroring the
-              # alternation the feat/** fallback below uses. The kill switch
-              # below (`bkit_gate`) reads any wired tracker through bkit.
-              # `head -1` FIRST — head_commit.message is subject+body and
-              # grep's `^` anchors per line, so without it a squash body line
-              # (GitHub's default body is the list of source commit subjects)
-              # like "feat(999-other): ..." would win and key the cap counter,
-              # status path and /bkit-debug dispatch to an unrelated feature.
-              FID=$(printf '%s' "$COMMIT_MSG" | head -1 | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
-              if [ -z "$FID" ]; then
-                # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
-                # filter to same-repo MERGED PRs (the endpoint also returns OPEN
-                # fork PRs at this SHA).
-                PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
-                  --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
-                FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
+              # `bkit fids parse` (the consumer's own bkit) recovers the FID, for every
+              # wired tracker's shape (Jira keys with digits included): the squash subject
+              # (first line only — head_commit.message is subject+body, and a body line
+              # such as "feat(999-other): ..." must not key the cap counter, status path
+              # and /bkit-debug dispatch to an unrelated feature) through --prompt-file,
+              # else the merged PR's bkit:fid marker. The issue id comes from the
+              # feat/{FID} row in `.bkit/issues.jsonl` (`fids parse --branch`), never from
+              # the subject's "(#PR)". No bkit, a non-zero exit (no FID, or several issues
+              # named) or a null FID is the no-FID no-op below; `bkit_gate` reports an
+              # absent bkit.
+              FID=""
+              ISSUE=""
+              if [ -x node_modules/.bin/bkit ]; then
+                SUBJECT_FILE=$(mktemp "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/bkit-cloud-subject.XXXXXX")
+                printf '%s\n' "$COMMIT_MSG" | head -1 > "$SUBJECT_FILE"
+                PARSED=$(node_modules/.bin/bkit fids parse --prompt-file "$SUBJECT_FILE" --json 2>/dev/null) || PARSED=""
+                FID=$(printf '%s' "$PARSED" | jq -r '.fidNamed // empty' 2>/dev/null || true)
+                if [ -z "$FID" ]; then
+                  # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
+                  # filter to same-repo MERGED PRs (the endpoint also returns OPEN
+                  # fork PRs at this SHA).
+                  PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
+                    --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
+                  PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --json 2>/dev/null) || PARSED=""
+                  FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
+                fi
               fi
-              if [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+              if [ -z "$FID" ] || ! [[ "$FID" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
                 echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
               fi
-              # `|| true` is load-bearing under `set -euo pipefail` —
-              # this runs BEFORE the slug allowlist, so a non-FID branch
-              # (Renovate, a hand-named hotfix) yields no match,
-              # pipefail propagates grep's exit 1, and the step dies red
-              # instead of reaching the designed no-op exit just below.
-              ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+              BRANCH_PARSED=$(node_modules/.bin/bkit fids parse --branch "feat/$FID" --json 2>/dev/null) || BRANCH_PARSED=""
+              ISSUE=$(printf '%s' "$BRANCH_PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
               ARG="$FID"
               # Kill switch: re-check bkit:auto on the issue (live revocation), through
               # bkit_gate. MUST precede the stale-run guard and the dispatch-cap guard
@@ -684,7 +687,7 @@ jobs:
           prompt: "/bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"
           # Lock the runner-side session to the same tool surface bkit grants the local
           # orchestrator. GitHub MCP surface is always available; this workflow is
-          # GitHub-tracker only (cloud=claude requires tracker=github).
+          # GitHub MCP only; other trackers via bkit verbs.
           claude_args: "--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__github__*"
           # Workload identity federation: the action exchanges this job's GitHub OIDC token
           # for a short-lived Claude API token. Unset variables pass empty; a set
@@ -696,6 +699,8 @@ jobs:
         env:
           ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
           GH_TOKEN: ${{ github.token }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
 
   # ---------------------------------------------------------------------------
   # opencode job — dispatch via `opencode run` CLI (a provider BKIT_ secret required).
@@ -725,6 +730,18 @@ jobs:
           git config user.name 'bkit-auto[bot]'
           git config user.email 'bkit-auto@users.noreply.github.com'
 
+      # Repo dependencies for the dispatched phase (bkit:* scripts, the committed config).
+      # Pnpm version comes from the consumer's package.json#packageManager (no `with: version:`).
+      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
+
+      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
+        with:
+          node-version: {{NODE_VERSION}}
+          cache: pnpm
+
+      - name: Install dependencies
+        run: pnpm install --frozen-lockfile
+
       - name: Install opencode
         run: |
           # Version-pinned. Renovate bumps it through the `# renovate:` line below; without
@@ -745,8 +762,126 @@ jobs:
           BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
           BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
           BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
           # Pass phase/arg via env to avoid ${{ }} expansion in run: shell string (injection guard).
           BKIT_PHASE: ${{ needs.context.outputs.phase }}
           BKIT_ARG: ${{ needs.context.outputs.arg }}
         run: |
           opencode run "/bkit-auto $BKIT_PHASE $BKIT_ARG"
+
+  # ---------------------------------------------------------------------------
+  # codex job — dispatch via openai/codex-action (BKIT_OPENAI_API_KEY required).
+  # Runs only when `Select agent job` chose codex and the context job resolved a phase.
+  # The action runs `drop-sudo` on the runner, which is irreversible: a reused self-hosted
+  # `{{CLOUD_RUNNER}}` loses sudo for later jobs, so use an ephemeral runner. The action also
+  # puts its own Node 24 on PATH, which later steps in this job see.
+  # ---------------------------------------------------------------------------
+  codex:
+    name: bkit-cloud-codex (${{ github.event_name }})
+    needs: context
+    if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'
+    runs-on: {{CLOUD_RUNNER}}
+    permissions:
+      contents: write
+      pull-requests: write
+      issues: write
+      actions: read
+    # One run per FID; the `-codex` suffix keeps it apart from the workflow-level lane.
+    concurrency:
+      group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}-codex
+      cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
+    steps:
+      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+        with:
+          ref: dev
+          fetch-depth: 0
+          token: ${{ github.token }}
+
+      - name: Configure git user
+        run: |
+          git config user.name 'bkit-auto[bot]'
+          git config user.email 'bkit-auto@users.noreply.github.com'
+
+      - name: Install vale
+        env:
+          # renovate: datasource=github-releases depName=errata-ai/vale
+          VALE_VERSION: "3.24.0"
+          VALE_SHA256: "867534ddb678abca7f214bc4706ead0922bd5252ffe8035fc227013f66c8b214"
+        run: |
+          curl -fsSL --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -o "$RUNNER_TEMP/vale.tar.gz"
+          echo "${VALE_SHA256}  $RUNNER_TEMP/vale.tar.gz" | sha256sum -c -
+          tar -xzf "$RUNNER_TEMP/vale.tar.gz" -C "$RUNNER_TEMP" vale
+          echo "$RUNNER_TEMP" >> "$GITHUB_PATH"
+
+      # Repo dependencies BEFORE the action: the action sandbox cannot fetch them.
+      # Pnpm version comes from the consumer's package.json#packageManager (no `with: version:`).
+      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
+
+      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
+        with:
+          node-version: {{NODE_VERSION}}
+          cache: pnpm
+
+      - name: Install dependencies
+        run: pnpm install --frozen-lockfile
+
+      # Codex loads project config (.codex/, hooks, skills) only for a trusted project; the
+      # runner has no interactive trust prompt, so the config in codex-home trusts the workspace.
+      - name: Trust the workspace in codex-home
+        run: |
+          mkdir -p "$RUNNER_TEMP/codex-home"
+          {
+            echo "[projects.\"$GITHUB_WORKSPACE\"]"
+            echo 'trust_level = "trusted"'
+          } > "$RUNNER_TEMP/codex-home/config.toml"
+          echo "BKIT_CODEX_STARTED=$(date -u +%FT%TZ)" >> "$GITHUB_ENV"
+
+      - name: Dispatch $bkit-auto on Codex runner
+        id: codex
+        uses: openai/codex-action@bdf19a4a223ec2549a3e2274a0cf61556bc07675 # v1
+        with:
+          openai-api-key: ${{ secrets.BKIT_OPENAI_API_KEY }}
+          # The runner is the sandbox: the dispatched phase needs git, network and the repo's
+          # own tooling. Bot-authored triggers (workflow_run) must be allowed.
+          sandbox: danger-full-access
+          allow-bots: true
+          codex-home: ${{ runner.temp }}/codex-home
+          # renovate: datasource=npm depName=@openai/codex
+          codex-version: "0.165.0"
+          prompt: "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"
+        env:
+          GH_TOKEN: ${{ github.token }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
+
+      - name: Codex run summary
+        if: always()
+        env:
+          GH_TOKEN: ${{ github.token }}
+          ACTION_OUTCOME: ${{ steps.codex.outcome }}
+          STARTED: ${{ env.BKIT_CODEX_STARTED }}
+          ARG: ${{ needs.context.outputs.arg }}
+          EVENT: ${{ github.event_name }}
+        run: |
+          if [[ "$EVENT" == "workflow_dispatch" ]]; then
+            # dispatch arm: ARG is an issue number, not a PR number, so no commits are tied to it.
+            commits="-"
+            comments=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${ARG}/comments" --paginate --jq "[.[] | select(.created_at >= \"${STARTED}\")] | length" 2>/dev/null | paste -sd+ - | bc 2>/dev/null || true)
+          elif [[ "$ARG" =~ ^[0-9]+$ ]]; then
+            # feat arm: ARG is the PR number. Count PR commits and comments landed since start.
+            commits=$(gh api "repos/${GITHUB_REPOSITORY}/pulls/${ARG}/commits" --paginate --jq "[.[] | select(.commit.committer.date >= \"${STARTED}\")] | length" 2>/dev/null | paste -sd+ - | bc 2>/dev/null || true)
+            comments=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${ARG}/comments" --paginate --jq "[.[] | select(.created_at >= \"${STARTED}\")] | length" 2>/dev/null | paste -sd+ - | bc 2>/dev/null || true)
+          else
+            # dev arm: ARG is the FID, there is no PR or issue number to read comments from.
+            git fetch -q origin dev 2>/dev/null || true
+            commits=$(git log origin/dev --since="$STARTED" --author='bkit-auto' --oneline 2>/dev/null | wc -l | tr -d ' ' || true)
+            comments="-"
+          fi
+          {
+            echo "### bkit-cloud codex"
+            echo ""
+            echo "| action | commits | comments |"
+            echo "| --- | --- | --- |"
+            echo "| ${ACTION_OUTCOME:--} | ${commits:-0} | ${comments:-0} |"
+          } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index e92f6ce9b..6139d1079 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -314,12 +314,11 @@ jobs:
             # proceeding). Returns 0 to proceed to dispatch.
             bkit_dev_dispatch_guard() {
               local guard_fid="$1" guard_head_sha="$2"
-              # assert the FID against the same slug allowlist the dev arm
-              # already enforces BEFORE it's used to build any path (find -path /
-              # mkdir -p / git commit -m). Defence-in-depth re-check for the
-              # PR-body marker path (bkit:fid=<anything up to whitespace/'>'>
-              # admits '/', '.', '..').
-              if ! [[ "$guard_fid" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+              # assert the characters of the FID that `bkit fids parse` printed
+              # (the engine slug charset: lowercase letters, digits, '-'; no '/', no
+              # '.', non-empty) BEFORE it's used to build any path (find -path /
+              # mkdir -p / git commit -m). This checks characters, not FID shape.
+              if ! [[ "$guard_fid" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
                 echo "::notice::Invalid FID '$guard_fid' — refusing to write dev-dispatch counter (fail-closed)."
                 return 1
               fi
@@ -394,7 +393,7 @@ jobs:
             # other outcome: no-issue, unreadable (bkit-unavailable, an exit 80 reason,
             # output-unparseable), label-absent, no-agent. Unreadable fails closed: nothing starts.
             bkit_gate() {
-              local gate_issue="${1:-}" tracker verdict="" reason="" jobs="" rc=0 reply="" outbox secret_var
+              local gate_issue="${1:-}" tracker reason="" jobs="" rc=0 reply="" outbox secret_var
               tracker=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
               tracker="${tracker:-none}"
               # jobs: the dispatched job + its BKIT_ secret, each ignored job with its reason.
@@ -487,35 +486,39 @@ jobs:
                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
               fi
               # PHASE=debug below.
-              # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
-              # Shape-tolerant: the regex accepts BOTH GitHub
-              # (363-slug) and Linear (bar-123-slug) FID SHAPES, mirroring the
-              # alternation the feat/** fallback below uses. The kill switch
-              # below (`bkit_gate`) reads any wired tracker through bkit.
-              # `head -1` FIRST — head_commit.message is subject+body and
-              # grep's `^` anchors per line, so without it a squash body line
-              # (GitHub's default body is the list of source commit subjects)
-              # like "feat(999-other): ..." would win and key the cap counter,
-              # status path and /bkit-debug dispatch to an unrelated feature.
-              FID=$(printf '%s' "$COMMIT_MSG" | head -1 | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
-              if [ -z "$FID" ]; then
-                # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
-                # filter to same-repo MERGED PRs (the endpoint also returns OPEN
-                # fork PRs at this SHA).
-                PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
-                  --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
-                FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
+              # `bkit fids parse` (the consumer's own bkit) recovers the FID, for every
+              # wired tracker's shape (Jira keys with digits included): the squash subject
+              # (first line only — head_commit.message is subject+body, and a body line
+              # such as "feat(999-other): ..." must not key the cap counter, status path
+              # and /bkit-debug dispatch to an unrelated feature) through --prompt-file,
+              # else the merged PR's bkit:fid marker. The issue id comes from the
+              # feat/{FID} row in `.bkit/issues.jsonl` (`fids parse --branch`), never from
+              # the subject's "(#PR)". No bkit, a non-zero exit (no FID, or several issues
+              # named) or a null FID is the no-FID no-op below; `bkit_gate` reports an
+              # absent bkit.
+              FID=""
+              ISSUE=""
+              if [ -x node_modules/.bin/bkit ]; then
+                SUBJECT_FILE=$(mktemp "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/bkit-cloud-subject.XXXXXX")
+                printf '%s\n' "$COMMIT_MSG" | head -1 > "$SUBJECT_FILE"
+                PARSED=$(node_modules/.bin/bkit fids parse --prompt-file "$SUBJECT_FILE" --json 2>/dev/null) || PARSED=""
+                FID=$(printf '%s' "$PARSED" | jq -r '.fidNamed // empty' 2>/dev/null || true)
+                if [ -z "$FID" ]; then
+                  # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
+                  # filter to same-repo MERGED PRs (the endpoint also returns OPEN
+                  # fork PRs at this SHA).
+                  PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
+                    --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
+                  PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --json 2>/dev/null) || PARSED=""
+                  FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
+                fi
               fi
-              if [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+              if [ -z "$FID" ] || ! [[ "$FID" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
                 echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
               fi
-              # `|| true` is load-bearing under `set -euo pipefail` —
-              # this runs BEFORE the slug allowlist, so a non-FID branch
-              # (Renovate, a hand-named hotfix) yields no match,
-              # pipefail propagates grep's exit 1, and the step dies red
-              # instead of reaching the designed no-op exit just below.
-              ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+              BRANCH_PARSED=$(node_modules/.bin/bkit fids parse --branch "feat/$FID" --json 2>/dev/null) || BRANCH_PARSED=""
+              ISSUE=$(printf '%s' "$BRANCH_PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
               ARG="$FID"
               # Kill switch: re-check bkit:auto on the issue (live revocation), through
               # bkit_gate. MUST precede the stale-run guard and the dispatch-cap guard
@@ -684,7 +687,7 @@ jobs:
           prompt: "/bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"
           # Lock the runner-side session to the same tool surface bkit grants the local
           # orchestrator. GitHub MCP surface is always available; this workflow is
-          # GitHub-tracker only (cloud=claude requires tracker=github).
+          # GitHub MCP only; other trackers via bkit verbs.
           claude_args: "--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__github__*"
           # Workload identity federation: the action exchanges this job's GitHub OIDC token
           # for a short-lived Claude API token. Unset variables pass empty; a set
@@ -696,6 +699,8 @@ jobs:
         env:
           ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
           GH_TOKEN: ${{ github.token }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
 
   # ---------------------------------------------------------------------------
   # opencode job — dispatch via `opencode run` CLI (a provider BKIT_ secret required).
@@ -725,6 +730,18 @@ jobs:
           git config user.name 'bkit-auto[bot]'
           git config user.email 'bkit-auto@users.noreply.github.com'
 
+      # Repo dependencies for the dispatched phase (bkit:* scripts, the committed config).
+      # Pnpm version comes from the consumer's package.json#packageManager (no `with: version:`).
+      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
+
+      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
+        with:
+          node-version-file: .nvmrc
+          cache: pnpm
+
+      - name: Install dependencies
+        run: pnpm install --frozen-lockfile
+
       - name: Install opencode
         run: |
           # Version-pinned. Renovate bumps it through the `# renovate:` line below; without
@@ -745,8 +762,126 @@ jobs:
           BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
           BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
           BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
           # Pass phase/arg via env to avoid ${{ }} expansion in run: shell string (injection guard).
           BKIT_PHASE: ${{ needs.context.outputs.phase }}
           BKIT_ARG: ${{ needs.context.outputs.arg }}
         run: |
           opencode run "/bkit-auto $BKIT_PHASE $BKIT_ARG"
+
+  # ---------------------------------------------------------------------------
+  # codex job — dispatch via openai/codex-action (BKIT_OPENAI_API_KEY required).
+  # Runs only when `Select agent job` chose codex and the context job resolved a phase.
+  # The action runs `drop-sudo` on the runner, which is irreversible: a reused self-hosted
+  # `{{CLOUD_RUNNER}}` loses sudo for later jobs, so use an ephemeral runner. The action also
+  # puts its own Node 24 on PATH, which later steps in this job see.
+  # ---------------------------------------------------------------------------
+  codex:
+    name: bkit-cloud-codex (${{ github.event_name }})
+    needs: context
+    if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'
+    runs-on: ubuntu-latest
+    permissions:
+      contents: write
+      pull-requests: write
+      issues: write
+      actions: read
+    # One run per FID; the `-codex` suffix keeps it apart from the workflow-level lane.
+    concurrency:
+      group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}-codex
+      cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
+    steps:
+      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+        with:
+          ref: dev
+          fetch-depth: 0
+          token: ${{ github.token }}
+
+      - name: Configure git user
+        run: |
+          git config user.name 'bkit-auto[bot]'
+          git config user.email 'bkit-auto@users.noreply.github.com'
+
+      - name: Install vale
+        env:
+          # renovate: datasource=github-releases depName=errata-ai/vale
+          VALE_VERSION: "3.24.0"
+          VALE_SHA256: "867534ddb678abca7f214bc4706ead0922bd5252ffe8035fc227013f66c8b214"
+        run: |
+          curl -fsSL --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -o "$RUNNER_TEMP/vale.tar.gz"
+          echo "${VALE_SHA256}  $RUNNER_TEMP/vale.tar.gz" | sha256sum -c -
+          tar -xzf "$RUNNER_TEMP/vale.tar.gz" -C "$RUNNER_TEMP" vale
+          echo "$RUNNER_TEMP" >> "$GITHUB_PATH"
+
+      # Repo dependencies BEFORE the action: the action sandbox cannot fetch them.
+      # Pnpm version comes from the consumer's package.json#packageManager (no `with: version:`).
+      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
+
+      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
+        with:
+          node-version-file: .nvmrc
+          cache: pnpm
+
+      - name: Install dependencies
+        run: pnpm install --frozen-lockfile
+
+      # Codex loads project config (.codex/, hooks, skills) only for a trusted project; the
+      # runner has no interactive trust prompt, so the config in codex-home trusts the workspace.
+      - name: Trust the workspace in codex-home
+        run: |
+          mkdir -p "$RUNNER_TEMP/codex-home"
+          {
+            echo "[projects.\"$GITHUB_WORKSPACE\"]"
+            echo 'trust_level = "trusted"'
+          } > "$RUNNER_TEMP/codex-home/config.toml"
+          echo "BKIT_CODEX_STARTED=$(date -u +%FT%TZ)" >> "$GITHUB_ENV"
+
+      - name: Dispatch $bkit-auto on Codex runner
+        id: codex
+        uses: openai/codex-action@bdf19a4a223ec2549a3e2274a0cf61556bc07675 # v1
+        with:
+          openai-api-key: ${{ secrets.BKIT_OPENAI_API_KEY }}
+          # The runner is the sandbox: the dispatched phase needs git, network and the repo's
+          # own tooling. Bot-authored triggers (workflow_run) must be allowed.
+          sandbox: danger-full-access
+          allow-bots: true
+          codex-home: ${{ runner.temp }}/codex-home
+          # renovate: datasource=npm depName=@openai/codex
+          codex-version: "0.165.0"
+          prompt: "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"
+        env:
+          GH_TOKEN: ${{ github.token }}
+          BKIT_LINEAR_API_KEY: ${{ secrets.BKIT_LINEAR_API_KEY }}
+          BKIT_JIRA_API_KEY: ${{ secrets.BKIT_JIRA_API_KEY }}
+
+      - name: Codex run summary
+        if: always()
+        env:
+          GH_TOKEN: ${{ github.token }}
+          ACTION_OUTCOME: ${{ steps.codex.outcome }}
+          STARTED: ${{ env.BKIT_CODEX_STARTED }}
+          ARG: ${{ needs.context.outputs.arg }}
+          EVENT: ${{ github.event_name }}
+        run: |
+          if [[ "$EVENT" == "workflow_dispatch" ]]; then
+            # dispatch arm: ARG is an issue number, not a PR number, so no commits are tied to it.
+            commits="-"
+            comments=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${ARG}/comments" --paginate --jq "[.[] | select(.created_at >= \"${STARTED}\")] | length" 2>/dev/null | paste -sd+ - | bc 2>/dev/null || true)
+          elif [[ "$ARG" =~ ^[0-9]+$ ]]; then
+            # feat arm: ARG is the PR number. Count PR commits and comments landed since start.
+            commits=$(gh api "repos/${GITHUB_REPOSITORY}/pulls/${ARG}/commits" --paginate --jq "[.[] | select(.commit.committer.date >= \"${STARTED}\")] | length" 2>/dev/null | paste -sd+ - | bc 2>/dev/null || true)
+            comments=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${ARG}/comments" --paginate --jq "[.[] | select(.created_at >= \"${STARTED}\")] | length" 2>/dev/null | paste -sd+ - | bc 2>/dev/null || true)
+          else
+            # dev arm: ARG is the FID, there is no PR or issue number to read comments from.
+            git fetch -q origin dev 2>/dev/null || true
+            commits=$(git log origin/dev --since="$STARTED" --author='bkit-auto' --oneline 2>/dev/null | wc -l | tr -d ' ' || true)
+            comments="-"
+          fi
+          {
+            echo "### bkit-cloud codex"
+            echo ""
+            echo "| action | commits | comments |"
+            echo "| --- | --- | --- |"
+            echo "| ${ACTION_OUTCOME:--} | ${commits:-0} | ${comments:-0} |"
+          } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
