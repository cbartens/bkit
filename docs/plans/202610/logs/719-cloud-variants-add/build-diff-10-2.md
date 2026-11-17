diff --git a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
index 8c456c14e..a4d5b45e3 100644
--- a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
@@ -504,6 +504,26 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
       expect(verdictRow(result.summary, "unreadable")).toBe(true);
     });
 
+    it("exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value", () => {
+      setTracker("jira");
+      const result = featRun(
+        {
+          STUB_FETCH_EXIT: "80",
+          STUB_FETCH_OUT: JSON.stringify({ reason: "auth" }),
+          BKIT_JIRA_API_KEY: "jira-secret-value",
+        },
+        "<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-login-retry -->",
+        "feat/ab2-12-login-retry",
+      );
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.stdout).toContain("BKIT_JIRA_API_KEY");
+      expect(result.stdout).toContain("set but rejected");
+      expect(result.stdout).not.toContain("jira-secret-value");
+      expect(result.stderr).not.toContain("jira-secret-value");
+      expect(result.summary).not.toContain("jira-secret-value");
+    });
+
     it("exit 80 reason=%s is unreadable with that reason and exits green", () => {
       for (const reason of ["network", "not-found"]) {
         const ctx = `reason ${reason}`;
@@ -677,6 +697,23 @@ describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)",
       expect(readStatusRows(fixture.workspaceDir, FID)).toEqual([]);
     });
 
+    it("dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green", () => {
+      seedFeature(FID);
+      fs.rmSync(path.join(fixture.workspaceDir, "node_modules"), { recursive: true, force: true });
+      const result = devRun(`feat(${FID}): x bkit [auto route]`);
+      expect(result.status, result.stderr).toBe(0);
+      expect(result.outputs.skip).toBe("true");
+      expect(result.outputs.phase).toBeUndefined();
+      expect(result.stdout).toContain(
+        "::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)",
+      );
+      expect(result.stdout).not.toContain("Cannot derive FID");
+      expect(result.summary).toMatch(/^\|.*\|\s*unreadable\s*\|\s*bkit-unavailable\s*\|/m);
+      expect(JSON.stringify(readStatusRows(fixture.workspaceDir, FID))).not.toContain(
+        "dev-dispatch",
+      );
+    });
+
     it("dev arm passes the gate for a closed issue that still carries bkit:auto", () => {
       seedFeature(FID);
       const result = devRun(`feat(${FID}): widen trigger (#500) bkit [auto route]`, {
diff --git a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
index b7149993d..bcf79e61b 100644
--- a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
@@ -8,6 +8,29 @@ import { spawnSync } from "node:child_process";
 import { describe, expect, it } from "vitest";
 import { parse as parseYaml } from "yaml";
 
+/** A step's directory with the workspace prefix and slashes stripped; "." when unset. */
+function normStepDir(v: unknown): string {
+  const dir = (typeof v === "string" ? v : ".")
+    .replace(/^\$\{\{\s*github\.workspace\s*\}\}\/?/, "")
+    .replace(/^\.\//, "")
+    .replace(/\/+$/, "");
+  return dir.length > 0 ? dir : ".";
+}
+
+/** Evaluates a checkout `ref` expression for a workflow_run event on the given head branch. */
+function evalCheckoutRef(ref: string, headBranch: string): unknown {
+  const expr = /^\$\{\{([\s\S]*)\}\}$/.exec(ref.trim())?.[1];
+  const github = {
+    event_name: "workflow_run",
+    event: { workflow_run: { head_branch: headBranch } },
+  };
+  const startsWith = (a: unknown, b: unknown) => String(a).startsWith(String(b));
+  return new Function("github", "startsWith", `return (${expr ?? JSON.stringify(ref)});`)(
+    github,
+    startsWith,
+  );
+}
+
 describe("bkit-cloud.yml template — GitHub-only content", () => {
   const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
   const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
@@ -52,8 +75,10 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
     const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
       jobs: { context: { steps: Array<{ uses?: string; with?: Record<string, unknown> }> } };
     };
-    const checkout = doc.jobs.context.steps.find((st) => st.uses?.startsWith("actions/checkout@"));
-    expect(checkout, "context job has no actions/checkout step").toBeDefined();
+    const checkout = doc.jobs.context.steps
+      .filter((st) => st.uses?.startsWith("actions/checkout@"))
+      .find((st) => st.with?.path === "pr-head");
+    expect(checkout, "context job has no pr-head actions/checkout step").toBeDefined();
     const ref = String(checkout!.with!.ref);
     const expr = /^\$\{\{([\s\S]*)\}\}$/.exec(ref.trim())?.[1];
     expect(expr, `ref is not a single expression: ${ref}`).toBeDefined();
@@ -72,6 +97,55 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
     expect(evaluate("workflow_dispatch", undefined)).toBe("dev");
   });
 
+  it("context job installs and runs bkit from dev, never from the feat/** PR head", () => {
+    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
+      jobs: {
+        context: {
+          steps: Array<{
+            name?: string;
+            uses?: string;
+            "working-directory"?: string;
+            with?: Record<string, unknown>;
+          }>;
+        };
+      };
+    };
+    const steps = doc.jobs.context.steps;
+    const installIdx = steps.findIndex((st) => st.name === "Install bkit");
+    expect(installIdx, "context job has no Install bkit step").toBeGreaterThan(-1);
+    const installDir = normStepDir(steps[installIdx]!["working-directory"]);
+    const checkoutsBeforeInstall = steps
+      .slice(0, installIdx)
+      .filter((st) => st.uses?.startsWith("actions/checkout@"));
+    const intoInstallDir = checkoutsBeforeInstall.filter(
+      (st) => normStepDir(st.with?.path) === installDir,
+    );
+    expect(intoInstallDir.length, "no checkout feeds the Install bkit directory").toBeGreaterThan(
+      0,
+    );
+    const head = "feat/363-widen-bkit-cloud-trigger";
+    for (const co of intoInstallDir) {
+      expect(evalCheckoutRef(String(co.with?.ref), head)).toBe("dev");
+    }
+    // The checkout that populates the install directory last decides what runs; it resolves to dev.
+    const last = intoInstallDir[intoInstallDir.length - 1]!;
+    expect(evalCheckoutRef(String(last.with?.ref), head)).not.toBe(head);
+  });
+
+  it("context job runs the workspace-root checkout before every nested `path:` checkout", () => {
+    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
+      jobs: { context: { steps: Array<{ uses?: string; with?: Record<string, unknown> }> } };
+    };
+    const checkouts = doc.jobs.context.steps.filter((st) =>
+      st.uses?.startsWith("actions/checkout@"),
+    );
+    const rootIdx = checkouts.findIndex((st) => normStepDir(st.with?.path) === ".");
+    const nestedIdx = checkouts.findIndex((st) => normStepDir(st.with?.path) !== ".");
+    expect(rootIdx, "no root checkout").toBeGreaterThan(-1);
+    expect(nestedIdx, "no nested checkout").toBeGreaterThan(-1);
+    expect(rootIdx).toBeLessThan(nestedIdx);
+  });
+
   it("claude step passes the four workload identity federation inputs from repo variables", () => {
     const claudeStep = yml.slice(yml.indexOf("uses: anthropics/claude-code-action@"));
     for (const [input, variable] of [
@@ -238,9 +312,7 @@ describe("T2.7 — two-tier CI gate positive assertions (GAP-3)", () => {
     expect(out.indexOf("bkit_gate() {")).toBeGreaterThan(sharedDerivStart);
     expect(out.match(/bkit_gate "\$ISSUE" \|\|/g)).toHaveLength(2);
     // The feat arm recovers FID + issue through bkit, not a marker regex.
-    expect(out).toContain(
-      'node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json',
-    );
+    expect(out).toContain('bkit_cli fids parse --marker "$PR_BODY" --branch "$BRANCH" --json');
   });
 
   it("(c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need", () => {
@@ -321,7 +393,7 @@ describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety r
 
   it("(1b) feat-arm FID/ISSUE parse lines in canonical and template carry a || true failure guard (pipefail safety)", () => {
     for (const text of [readBkitCloudYml(), readBkitCloudTemplate()]) {
-      expect(text).toMatch(/PARSED=\$\(node_modules\/\.bin\/bkit fids parse[^\n]*\|\| true\)/);
+      expect(text).toMatch(/PARSED=\$\(bkit_cli fids parse[^\n]*\|\| true\)/);
       expect(text).toMatch(/FID=\$\(printf '%s' "\$PARSED" \| jq[^\n]*\|\| true\)/);
       expect(text).toMatch(/ISSUE=\$\(printf '%s' "\$PARSED" \| jq[^\n]*\|\| true\)/);
     }
diff --git a/.bkit/core/engine/install/cloud-env.test.ts b/.bkit/core/engine/install/cloud-env.test.ts
index 877bc7b2e..e595a7f6e 100644
--- a/.bkit/core/engine/install/cloud-env.test.ts
+++ b/.bkit/core/engine/install/cloud-env.test.ts
@@ -188,6 +188,22 @@ describe("resolveCloudEnvVars", () => {
     expect(block).toContain("BKIT_GH_TOKEN=real");
   });
 
+  it("never lets BKIT_OPENAI_API_KEY into the paste block", () => {
+    write(".envrc", "dotenv_if_exists .bkit/.env");
+    write(
+      ".bkit/.env",
+      ["BKIT_GH_TOKEN=real", "BKIT_OPENAI_API_KEY=sk-openai-must-not-leak"].join("\n"),
+    );
+
+    const res = resolveCloudEnvVars(tmpDir);
+    const block = renderCloudEnvBlock(res);
+
+    expect(res.included.map(([k]) => k)).not.toContain("BKIT_OPENAI_API_KEY");
+    expect(block).not.toContain("BKIT_OPENAI_API_KEY");
+    expect(block).not.toContain("sk-openai-must-not-leak");
+    expect(block).toContain("BKIT_GH_TOKEN=real");
+  });
+
   it("returns an empty resolution (the sole baseline placeholder) when no .envrc exists", () => {
     write("package.json", JSON.stringify({ name: "x" }));
     const res = resolveCloudEnvVars(tmpDir);
diff --git a/.bkit/core/engine/install/cloud-env.ts b/.bkit/core/engine/install/cloud-env.ts
index 83af0dc17..d6ccf3c2d 100644
--- a/.bkit/core/engine/install/cloud-env.ts
+++ b/.bkit/core/engine/install/cloud-env.ts
@@ -38,6 +38,11 @@ export const SESSION_HIJACK_KEYS = [
   "ANTHROPIC_AUTH_TOKEN",
 ] as const;
 
+// Router-only keys: used by a router job as a repo Actions secret, never by a cloud agent
+// session. Pasting them would hand a paid key to every session that reads untrusted issue /
+// PR text. Always dropped from the paste block.
+export const ROUTER_ONLY_KEYS = ["BKIT_OPENAI_API_KEY"] as const;
+
 // bkit baseline env-var NAMES every cloud environment needs, whatever the tracker:
 // `gh` and the GitHub MCP server read BKIT_GH_TOKEN on every host. Emitted as a
 // placeholder ONLY when absent from the resolved `.envrc` set — a present value keeps
@@ -59,6 +64,8 @@ export interface CloudEnvResolution {
   unset: string[];
   /** Session-hijack keys that were present and were dropped. */
   hijackDropped: string[];
+  /** Router-only keys that were present and were dropped. */
+  routerOnlyDropped: string[];
   /** Keys whose resolved value was empty (skipped from the paste block). */
   emptySkipped: string[];
   /** Baseline token names absent from sources — emitted as placeholders. */
@@ -135,6 +142,7 @@ export function resolveCloudEnvVars(cwd: string): CloudEnvResolution {
     included: [],
     unset: [],
     hijackDropped: [],
+    routerOnlyDropped: [],
     emptySkipped: [],
     placeholders: [],
     sources: [],
@@ -177,6 +185,14 @@ export function resolveCloudEnvVars(cwd: string): CloudEnvResolution {
     }
   }
 
+  // Drop router-only keys.
+  for (const k of ROUTER_ONLY_KEYS) {
+    if (map.has(k)) {
+      res.routerOnlyDropped.push(k);
+      map.delete(k);
+    }
+  }
+
   // Partition non-empty (included) vs empty (skipped).
   for (const [k, v] of map) {
     if (v === "") res.emptySkipped.push(k);
@@ -234,6 +250,11 @@ export function renderCloudEnvNotes(res: CloudEnvResolution): string {
       `- **Dropped — session-billing hijack:** ${fmtList(res.hijackDropped)} — would redirect the agent's own model calls onto API-key billing instead of your subscription.`,
     );
   }
+  if (res.routerOnlyDropped.length) {
+    bullets.push(
+      `- **Dropped — router-only secret:** ${fmtList(res.routerOnlyDropped)} — set it as a repo Actions secret; no cloud agent session needs it.`,
+    );
+  }
   if (res.emptySkipped.length) {
     bullets.push(`- **Empty in source (skipped):** ${fmtList(res.emptySkipped)}`);
   }
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 8febb6e84..4384418fb 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -90,3 +90,4 @@
 {"schema":3,"ts":1793873433042,"kind":"friction","key":"build-719-group3-capacity-recovery","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["719","docs/plans/202610/logs/719-cloud-variants-add/build-plan-tasks-3-log.md"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","status":"CLOSED","source":"orchestrator","summary":"Group 3 required resumed turns after model capacity interruptions","description":"The orchestrator reported two transient model-capacity interruptions while group 3 awaited its changed gate. The same agent recovered the existing session and buffered logs. No implementation or broad check was restarted.","remediation":"Continued from existing artifacts and session55370; captured the stalled-check evidence, cancelled only that own gate, and completed targeted CLI-doc verification."}
 {"schema":3,"ts":1793874387453,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":3,"lastConfirmed":1793874387453}
 {"schema":3,"ts":1794121653234,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":4,"lastConfirmed":1794121653234}
+{"schema":3,"ts":1794123248318,"kind":"friction","key":"build-challenge-fix-brief-lacks-owner-decision","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tests"},"references":["719-cloud-variants-add",".bkit/core/workflows/bkit-build.md"],"category":"workflow","scope":"universal","severity":"MEDIUM","summary":"Challenge Fix-now tasks reach Step 7 without the owner's chosen option","description":"A Fixable: false challenge task answered Fix now at the Decision Pause stays open and runs as written, so its DONE WHEN still reads 'the owner chooses (a) or (b)'. Step 7's brief and the Read lists of @bkit-build-plan-tests and @bkit-build-plan-tasks do not name build-decision-{RUN}-*.md, so the agents cannot learn which option the owner chose (Step 9 does list the decision file). Hit in 719 run 4, group 10, tasks 23 and 24.","remediation":"Add glob build-decision-{RUN}-*.md (highest number) to Step 7 sub-steps 4 and 7 Read lists, or have context brief carry the decision lines for challenge tasks.","source":"orchestrator","status":"OPEN"}
diff --git a/.bkit/shared/docs/deployments.md b/.bkit/shared/docs/deployments.md
index 2e9c6a31e..40638098a 100644
--- a/.bkit/shared/docs/deployments.md
+++ b/.bkit/shared/docs/deployments.md
@@ -525,7 +525,7 @@ Fine-grained permissions for this repo:
 
 When Renovate is the updater, leave alerts on and turn security updates and version updates off so Dependabot does not open competing PRs.
 
-**Runner labels for bkit workflows.** `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml` and `bkit-trivy.yml` are templates you copy and own; edit `runs-on` in your copy. The `bkit-cloud.yml` template ships the `{{CLOUD_RUNNER}}` placeholder in both jobs: replace it with a label (e.g. `ubuntu-latest`).
+**Runner labels for bkit workflows.** `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml` and `bkit-trivy.yml` are templates you copy and own; edit `runs-on` in your copy. The `bkit-cloud.yml` template ships the `{{CLOUD_RUNNER}}` placeholder in all four jobs (`context`, `claude`, `opencode`, `codex`): replace it with a label (e.g. `ubuntu-latest`).
 
 ### Manual CVE handling (when an alert fires)
 
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index da809da7f..b63395489 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -162,19 +162,32 @@ jobs:
 
       # SHA pins in this file — your updater refreshes them in your copy (keep this file out
       # of renovate.json5 `ignorePaths`); `bkit upgrade` lists this template when bkit's pins move.
+      # Two checkouts. `pr-head` is DATA only: a feat/** run checks out the PR head branch
+      # (its `package.json` config, `status.jsonl` and `.bkit/issues.jsonl` feature rows are
+      # what the router reads); a dev run and a workflow_dispatch check out `dev` there. The
+      # workspace root is always `dev`: bkit is installed and run from it, so a branch
+      # pushed by an agent session cannot change the code that decides the `bkit:auto` kill
+      # switch, and the dev arm commits its dispatch-cap counter row there.
+      # Order matters: the root `dev` checkout runs first because actions/checkout empties a
+      # workspace that has no .git, which would delete `pr-head/` if it ran second.
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         if: steps.gate.outputs.enabled == 'true'
         with:
-          # Per-arm checkout: a feat/** run checks out the PR head branch (its `status.jsonl`,
-          # `.bkit/issues.jsonl` feature rows and lockfile are the ones the router reads); a
-          # dev run and a workflow_dispatch check out `dev`, where the dev arm commits its
-          # dispatch-cap counter row.
-          ref: ${{ startsWith(github.event.workflow_run.head_branch, 'feat/') && github.event.workflow_run.head_branch || 'dev' }}
+          ref: dev
           fetch-depth: 0
           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
           token: ${{ github.token }}
 
-      # The consumer's own bkit, from its lockfile, so the label gate reads the tracker through
+      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+        if: steps.gate.outputs.enabled == 'true'
+        with:
+          ref: ${{ startsWith(github.event.workflow_run.head_branch, 'feat/') && github.event.workflow_run.head_branch || 'dev' }}
+          path: pr-head
+          fetch-depth: 0
+          # Untrusted branch content: no credential is left in its git config.
+          persist-credentials: false
+
+      # The consumer's own bkit, from the `dev` lockfile, so the label gate reads the tracker through
       # `bkit issues fetch` and FIDs through `bkit fids parse`. A failed install leaves
       # node_modules/.bin/bkit absent: the gate reports bkit-unavailable and starts nothing.
       # Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
@@ -207,8 +220,9 @@ jobs:
           BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
           BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
           BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
+          HEAD_DIR: pr-head
         run: |
-          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' package.json 2>/dev/null || true)
+          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' "${HEAD_DIR:-.}/package.json" 2>/dev/null || true)
           AGENT="${AGENT:-none}"
           claude=false
           opencode=false
@@ -283,8 +297,13 @@ jobs:
           SEL_AGENT: ${{ steps.select.outputs.agent }}
           SEL_DISPATCHED: ${{ steps.select.outputs.dispatched }}
           SEL_IGNORED: ${{ steps.select.outputs.ignored }}
+          HEAD_DIR: pr-head
         run: |
           set -euo pipefail
+          # bkit runs from the dev checkout (workspace root) against the data in HEAD_DIR.
+          HEAD_DIR="${HEAD_DIR:-.}"
+          BKIT_BIN="$PWD/node_modules/.bin/bkit"
+          bkit_cli() { (cd "$HEAD_DIR" && "$BKIT_BIN" "$@"); }
           if [ "$EVENT" = "workflow_dispatch" ]; then
             # Dispatched: phase + issue come straight from inputs.
             PHASE="$IN_PHASE"
@@ -394,8 +413,8 @@ jobs:
             # other outcome: no-issue, unreadable (bkit-unavailable, an exit 80 reason,
             # output-unparseable), label-absent, no-agent. Unreadable fails closed: nothing starts.
             bkit_gate() {
-              local gate_issue="${1:-}" tracker reason="" jobs="" rc=0 reply="" outbox secret_var
-              tracker=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
+              local gate_issue="${1:-}" tracker reason="" jobs="" rc=0 reply="" outbox secret_var secret_state
+              tracker=$(jq -r '.bkit.tracker.default // empty | strings' "$HEAD_DIR/package.json" 2>/dev/null || true)
               tracker="${tracker:-none}"
               # jobs: the dispatched job + its BKIT_ secret, each ignored job with its reason.
               bkit_gate_secret() {
@@ -436,7 +455,7 @@ jobs:
                 return 1
               fi
               outbox=$(mktemp -d)
-              reply=$(node_modules/.bin/bkit issues fetch --issue "$gate_issue" --outbox "$outbox" --json 2>/dev/null) || rc=$?
+              reply=$(bkit_cli issues fetch --issue "$gate_issue" --outbox "$outbox" --json 2>/dev/null) || rc=$?
               if [ "$rc" -eq 80 ]; then
                 reason=$(printf '%s' "$reply" | jq -r '.reason // "unknown"' 2>/dev/null || echo unknown)
                 case "$tracker:$reason" in
@@ -446,7 +465,9 @@ jobs:
                   *) secret_var="" ;;
                 esac
                 if [ -n "$secret_var" ]; then
-                  echo "::warning::[bkit-cloud] gate: unreadable (reason=auth) — the $tracker read was refused; check the $secret_var secret (${!secret_var:+set but rejected}${!secret_var:-empty or missing}). No agent starts."
+                  # Wording only: the secret's value is tested, never expanded.
+                  if [ -n "${!secret_var:-}" ]; then secret_state="set but rejected"; else secret_state="empty or missing"; fi
+                  echo "::warning::[bkit-cloud] gate: unreadable (reason=auth) — the $tracker read was refused; check the $secret_var secret ($secret_state). No agent starts."
                 else
                   echo "::warning::[bkit-cloud] gate: unreadable (reason=$reason) — the $tracker issue could not be read; no agent starts."
                 fi
@@ -499,10 +520,16 @@ jobs:
               # absent bkit.
               FID=""
               ISSUE=""
+              if [ ! -x node_modules/.bin/bkit ]; then
+                # Absent bkit (failed install): bkit_gate reports bkit-unavailable and writes the
+                # summary row; nothing starts.
+                bkit_gate "" || true
+                echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+              fi
               if [ -x node_modules/.bin/bkit ]; then
                 SUBJECT_FILE=$(mktemp "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/bkit-cloud-subject.XXXXXX")
                 printf '%s\n' "$COMMIT_MSG" | head -1 > "$SUBJECT_FILE"
-                PARSED=$(node_modules/.bin/bkit fids parse --prompt-file "$SUBJECT_FILE" --json 2>/dev/null) || PARSED=""
+                PARSED=$(bkit_cli fids parse --prompt-file "$SUBJECT_FILE" --json 2>/dev/null) || PARSED=""
                 FID=$(printf '%s' "$PARSED" | jq -r '.fidNamed // empty' 2>/dev/null || true)
                 if [ -z "$FID" ]; then
                   # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
@@ -510,7 +537,7 @@ jobs:
                   # fork PRs at this SHA).
                   PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
                     --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
-                  PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --json 2>/dev/null) || PARSED=""
+                  PARSED=$(bkit_cli fids parse --marker "$PR_BODY" --json 2>/dev/null) || PARSED=""
                   FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
                 fi
               fi
@@ -518,7 +545,7 @@ jobs:
                 echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
               fi
-              BRANCH_PARSED=$(node_modules/.bin/bkit fids parse --branch "feat/$FID" --json 2>/dev/null) || BRANCH_PARSED=""
+              BRANCH_PARSED=$(bkit_cli fids parse --branch "feat/$FID" --json 2>/dev/null) || BRANCH_PARSED=""
               ISSUE=$(printf '%s' "$BRANCH_PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
               ARG="$FID"
               # Kill switch: re-check bkit:auto on the issue (live revocation), through
@@ -578,7 +605,7 @@ jobs:
               PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
               PARSED=""
               if [ -x node_modules/.bin/bkit ]; then
-                PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json 2>/dev/null || true)
+                PARSED=$(bkit_cli fids parse --marker "$PR_BODY" --branch "$BRANCH" --json 2>/dev/null || true)
               fi
               FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
               ISSUE=$(printf '%s' "$PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
diff --git a/.bkit/version b/.bkit/version
index 39b012dda..eba30ecb6 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -2,7 +2,7 @@
   "pinnedVersion": "6.1.1",
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
-    "docs/deployments.md": "7281e0d4fdaf1ce4426b2d1f7996f8214d1711e2c2739c2889654931312b66b2",
+    "docs/deployments.md": "2a258513442a0f722444c030883b28ae673451821a7c8e50d77fef068365969b",
     "docs/testing.md": "fc810c5ee5d615be149d68f0b6f619d149cc43e919d5fc7630319758399fc37f",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
@@ -16,7 +16,7 @@
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
     "docs/observability.md": "cf772ef17a5d5d64e66fe15ce2656af958ee128f5fcd909a47e7c6a6556006e8",
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
-    "docs/security.md": "1d05c89c400c9cd365794484bb8b8673997976e5102637ec1b795a8792b97b99",
+    "docs/security.md": "175cd34b8d4d06b0d91d3c0e43840dae1de7e0f463cf5e14af9dc138f65c2215",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
     "docs/architecture.md": "e9157fe0fd7f896c08d92e721981a19e4cf647d5493e9f69c0fa7069f5322f41",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
@@ -229,12 +229,12 @@
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
-    ".claude/hooks/bkit-preflight.sh": "44d8cb78d79837e376f5c68aa394d79faa026ee6d0fa861838534f5fc3bb0741",
+    ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "157502c7370e7a00e0cb2727f9efaeb65581c36b001cd450393dad98d1f180ff",
     ".codex/hooks/bkit-guardrails.cjs": "d5823a109b64d44682a91ef88cc263d9ca4f82385e1b2cf3547711198c1eeb43",
     ".cursor/hooks/bkit-gateguard.cjs": "f48b778f3c8e5af5e55cc5d84a4a4b125b208b50f39ca409d23cb014924cfcf4",
     ".cursor/hooks/bkit-guardrails.cjs": "8d14809ab0b85cb8f00934cc325824e87df3c534916bc3f470844db603d2c8cc",
-    ".cursor/hooks/bkit-preflight.sh": "111b1d27138318fbd19b4d16d11f559af8be27c1aa324c7711b3efede0853a81",
+    ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "c7c0f7980b05abf6dbdfb26d53f6e33b8342f181d18d8f8494a4e81d2ba9c74c",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
     "GEMINI.md": "29a57ff0a56385c4d9b36032fb5be4e42e34ad6992d0b4a4ed105423211cda64",
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index 851660050..804094bea 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -162,19 +162,32 @@ jobs:
 
       # SHA pins in this file — your updater refreshes them in your copy (keep this file out
       # of renovate.json5 `ignorePaths`); `bkit upgrade` lists this template when bkit's pins move.
+      # Two checkouts. `pr-head` is DATA only: a feat/** run checks out the PR head branch
+      # (its `package.json` config, `status.jsonl` and `.bkit/issues.jsonl` feature rows are
+      # what the router reads); a dev run and a workflow_dispatch check out `dev` there. The
+      # workspace root is always `dev`: bkit is installed and run from it, so a branch
+      # pushed by an agent session cannot change the code that decides the `bkit:auto` kill
+      # switch, and the dev arm commits its dispatch-cap counter row there.
+      # Order matters: the root `dev` checkout runs first because actions/checkout empties a
+      # workspace that has no .git, which would delete `pr-head/` if it ran second.
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         if: steps.gate.outputs.enabled == 'true'
         with:
-          # Per-arm checkout: a feat/** run checks out the PR head branch (its `status.jsonl`,
-          # `.bkit/issues.jsonl` feature rows and lockfile are the ones the router reads); a
-          # dev run and a workflow_dispatch check out `dev`, where the dev arm commits its
-          # dispatch-cap counter row.
-          ref: ${{ startsWith(github.event.workflow_run.head_branch, 'feat/') && github.event.workflow_run.head_branch || 'dev' }}
+          ref: dev
           fetch-depth: 0
           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
           token: ${{ github.token }}
 
-      # The consumer's own bkit, from its lockfile, so the label gate reads the tracker through
+      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+        if: steps.gate.outputs.enabled == 'true'
+        with:
+          ref: ${{ startsWith(github.event.workflow_run.head_branch, 'feat/') && github.event.workflow_run.head_branch || 'dev' }}
+          path: pr-head
+          fetch-depth: 0
+          # Untrusted branch content: no credential is left in its git config.
+          persist-credentials: false
+
+      # The consumer's own bkit, from the `dev` lockfile, so the label gate reads the tracker through
       # `bkit issues fetch` and FIDs through `bkit fids parse`. A failed install leaves
       # node_modules/.bin/bkit absent: the gate reports bkit-unavailable and starts nothing.
       # Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
@@ -207,8 +220,9 @@ jobs:
           BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
           BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
           BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
+          HEAD_DIR: pr-head
         run: |
-          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' package.json 2>/dev/null || true)
+          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' "${HEAD_DIR:-.}/package.json" 2>/dev/null || true)
           AGENT="${AGENT:-none}"
           claude=false
           opencode=false
@@ -283,8 +297,13 @@ jobs:
           SEL_AGENT: ${{ steps.select.outputs.agent }}
           SEL_DISPATCHED: ${{ steps.select.outputs.dispatched }}
           SEL_IGNORED: ${{ steps.select.outputs.ignored }}
+          HEAD_DIR: pr-head
         run: |
           set -euo pipefail
+          # bkit runs from the dev checkout (workspace root) against the data in HEAD_DIR.
+          HEAD_DIR="${HEAD_DIR:-.}"
+          BKIT_BIN="$PWD/node_modules/.bin/bkit"
+          bkit_cli() { (cd "$HEAD_DIR" && "$BKIT_BIN" "$@"); }
           if [ "$EVENT" = "workflow_dispatch" ]; then
             # Dispatched: phase + issue come straight from inputs.
             PHASE="$IN_PHASE"
@@ -394,8 +413,8 @@ jobs:
             # other outcome: no-issue, unreadable (bkit-unavailable, an exit 80 reason,
             # output-unparseable), label-absent, no-agent. Unreadable fails closed: nothing starts.
             bkit_gate() {
-              local gate_issue="${1:-}" tracker reason="" jobs="" rc=0 reply="" outbox secret_var
-              tracker=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
+              local gate_issue="${1:-}" tracker reason="" jobs="" rc=0 reply="" outbox secret_var secret_state
+              tracker=$(jq -r '.bkit.tracker.default // empty | strings' "$HEAD_DIR/package.json" 2>/dev/null || true)
               tracker="${tracker:-none}"
               # jobs: the dispatched job + its BKIT_ secret, each ignored job with its reason.
               bkit_gate_secret() {
@@ -436,7 +455,7 @@ jobs:
                 return 1
               fi
               outbox=$(mktemp -d)
-              reply=$(node_modules/.bin/bkit issues fetch --issue "$gate_issue" --outbox "$outbox" --json 2>/dev/null) || rc=$?
+              reply=$(bkit_cli issues fetch --issue "$gate_issue" --outbox "$outbox" --json 2>/dev/null) || rc=$?
               if [ "$rc" -eq 80 ]; then
                 reason=$(printf '%s' "$reply" | jq -r '.reason // "unknown"' 2>/dev/null || echo unknown)
                 case "$tracker:$reason" in
@@ -446,7 +465,9 @@ jobs:
                   *) secret_var="" ;;
                 esac
                 if [ -n "$secret_var" ]; then
-                  echo "::warning::[bkit-cloud] gate: unreadable (reason=auth) — the $tracker read was refused; check the $secret_var secret (${!secret_var:+set but rejected}${!secret_var:-empty or missing}). No agent starts."
+                  # Wording only: the secret's value is tested, never expanded.
+                  if [ -n "${!secret_var:-}" ]; then secret_state="set but rejected"; else secret_state="empty or missing"; fi
+                  echo "::warning::[bkit-cloud] gate: unreadable (reason=auth) — the $tracker read was refused; check the $secret_var secret ($secret_state). No agent starts."
                 else
                   echo "::warning::[bkit-cloud] gate: unreadable (reason=$reason) — the $tracker issue could not be read; no agent starts."
                 fi
@@ -499,10 +520,16 @@ jobs:
               # absent bkit.
               FID=""
               ISSUE=""
+              if [ ! -x node_modules/.bin/bkit ]; then
+                # Absent bkit (failed install): bkit_gate reports bkit-unavailable and writes the
+                # summary row; nothing starts.
+                bkit_gate "" || true
+                echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+              fi
               if [ -x node_modules/.bin/bkit ]; then
                 SUBJECT_FILE=$(mktemp "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/bkit-cloud-subject.XXXXXX")
                 printf '%s\n' "$COMMIT_MSG" | head -1 > "$SUBJECT_FILE"
-                PARSED=$(node_modules/.bin/bkit fids parse --prompt-file "$SUBJECT_FILE" --json 2>/dev/null) || PARSED=""
+                PARSED=$(bkit_cli fids parse --prompt-file "$SUBJECT_FILE" --json 2>/dev/null) || PARSED=""
                 FID=$(printf '%s' "$PARSED" | jq -r '.fidNamed // empty' 2>/dev/null || true)
                 if [ -z "$FID" ]; then
                   # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
@@ -510,7 +537,7 @@ jobs:
                   # fork PRs at this SHA).
                   PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
                     --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
-                  PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --json 2>/dev/null) || PARSED=""
+                  PARSED=$(bkit_cli fids parse --marker "$PR_BODY" --json 2>/dev/null) || PARSED=""
                   FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
                 fi
               fi
@@ -518,7 +545,7 @@ jobs:
                 echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
               fi
-              BRANCH_PARSED=$(node_modules/.bin/bkit fids parse --branch "feat/$FID" --json 2>/dev/null) || BRANCH_PARSED=""
+              BRANCH_PARSED=$(bkit_cli fids parse --branch "feat/$FID" --json 2>/dev/null) || BRANCH_PARSED=""
               ISSUE=$(printf '%s' "$BRANCH_PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
               ARG="$FID"
               # Kill switch: re-check bkit:auto on the issue (live revocation), through
@@ -578,7 +605,7 @@ jobs:
               PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
               PARSED=""
               if [ -x node_modules/.bin/bkit ]; then
-                PARSED=$(node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json 2>/dev/null || true)
+                PARSED=$(bkit_cli fids parse --marker "$PR_BODY" --branch "$BRANCH" --json 2>/dev/null || true)
               fi
               FID=$(printf '%s' "$PARSED" | jq -r '.fid // empty' 2>/dev/null || true)
               ISSUE=$(printf '%s' "$PARSED" | jq -r '.issueId // empty' 2>/dev/null || true)
diff --git a/DETAILS.md b/DETAILS.md
index 4522c2dc8..8f0e53f37 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -348,7 +348,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1715 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>309 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>310 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
diff --git a/dist/install/cloud-env.js b/dist/install/cloud-env.js
index 9df4d2765..953096a92 100644
--- a/dist/install/cloud-env.js
+++ b/dist/install/cloud-env.js
@@ -34,6 +34,10 @@ export const SESSION_HIJACK_KEYS = [
     "BKIT_ANTHROPIC_API_KEY",
     "ANTHROPIC_AUTH_TOKEN",
 ];
+// Router-only keys: used by a router job as a repo Actions secret, never by a cloud agent
+// session. Pasting them would hand a paid key to every session that reads untrusted issue /
+// PR text. Always dropped from the paste block.
+export const ROUTER_ONLY_KEYS = ["BKIT_OPENAI_API_KEY"];
 // bkit baseline env-var NAMES every cloud environment needs, whatever the tracker:
 // `gh` and the GitHub MCP server read BKIT_GH_TOKEN on every host. Emitted as a
 // placeholder ONLY when absent from the resolved `.envrc` set — a present value keeps
@@ -111,6 +115,7 @@ export function resolveCloudEnvVars(cwd) {
         included: [],
         unset: [],
         hijackDropped: [],
+        routerOnlyDropped: [],
         emptySkipped: [],
         placeholders: [],
         sources: [],
@@ -151,6 +156,13 @@ export function resolveCloudEnvVars(cwd) {
             map.delete(k);
         }
     }
+    // Drop router-only keys.
+    for (const k of ROUTER_ONLY_KEYS) {
+        if (map.has(k)) {
+            res.routerOnlyDropped.push(k);
+            map.delete(k);
+        }
+    }
     // Partition non-empty (included) vs empty (skipped).
     for (const [k, v] of map) {
         if (v === "")
@@ -200,6 +212,9 @@ export function renderCloudEnvNotes(res) {
     if (res.hijackDropped.length) {
         bullets.push(`- **Dropped — session-billing hijack:** ${fmtList(res.hijackDropped)} — would redirect the agent's own model calls onto API-key billing instead of your subscription.`);
     }
+    if (res.routerOnlyDropped.length) {
+        bullets.push(`- **Dropped — router-only secret:** ${fmtList(res.routerOnlyDropped)} — set it as a repo Actions secret; no cloud agent session needs it.`);
+    }
     if (res.emptySkipped.length) {
         bullets.push(`- **Empty in source (skipped):** ${fmtList(res.emptySkipped)}`);
     }
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 41dca2041..e9a8f660a 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -165,7 +165,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1715 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>309 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>310 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -259,7 +259,7 @@ flowchart LR
     n_bkit_core_engine_commands_install_install[".bkit/core/engine/commands/install/install<br/>12 symbols · 1 files"]
     n_bkit_core_engine_commands_install_uninstall[".bkit/core/engine/commands/install/uninstall<br/>31 symbols · 1 files"]
     n_bkit_core_engine_commands_install_upgrade[".bkit/core/engine/commands/install/upgrade<br/>17 symbols · 1 files"]
-    n_bkit_core_engine_install_cloud_env[".bkit/core/engine/install/cloud-env<br/>51 symbols · 1 files"]
+    n_bkit_core_engine_install_cloud_env[".bkit/core/engine/install/cloud-env<br/>52 symbols · 1 files"]
     n_bkit_core_engine_install_manifest[".bkit/core/engine/install/manifest<br/>34 symbols · 1 files"]
     n_bkit_core_engine_install_modules_index[".bkit/core/engine/install/modules/index<br/>10 symbols · 1 files"]
     n_bkit_core_engine_install_version_file[".bkit/core/engine/install/version-file<br/>17 symbols · 1 files"]
diff --git a/docs/deployments.md b/docs/deployments.md
index ad15ff351..317f85e0e 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -525,7 +525,7 @@ Fine-grained permissions for this repo:
 
 When Renovate is the updater, leave alerts on and turn security updates and version updates off so Dependabot does not open competing PRs.
 
-**Runner labels for bkit workflows.** `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml` and `bkit-trivy.yml` are templates you copy and own; edit `runs-on` in your copy. The `bkit-cloud.yml` template ships the `{{CLOUD_RUNNER}}` placeholder in each of its four jobs (`context`, `claude`, `opencode`, `codex`): replace it with a label (e.g. `ubuntu-latest`).
+**Runner labels for bkit workflows.** `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml` and `bkit-trivy.yml` are templates you copy and own; edit `runs-on` in your copy. The `bkit-cloud.yml` template ships the `{{CLOUD_RUNNER}}` placeholder in all four jobs (`context`, `claude`, `opencode`, `codex`): replace it with a label (e.g. `ubuntu-latest`).
 
 ### Manual CVE handling (when an alert fires)
 
diff --git a/docs/security.md b/docs/security.md
index 784ba1005..ae8dde47e 100644
--- a/docs/security.md
+++ b/docs/security.md
@@ -75,7 +75,7 @@ No database, server, or user-auth surface. Security concerns: secrets management
 
 ### `.bkit/.env` scope
 
-`.bkit/.env` (gitignored, auto-loaded via `.envrc` / direnv) holds **bkit and agent-tooling secrets only**: tracker / cloud-agent tokens (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`) and OpenCode provider keys (`BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`).
+`.bkit/.env` (gitignored, auto-loaded via `.envrc` / direnv) holds **bkit and agent-tooling secrets only**: tracker / cloud-agent tokens (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`), OpenCode provider keys (`BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`) and the Codex router key (`BKIT_OPENAI_API_KEY`, never pasted into a cloud env block).
 
 App / stack credentials do not belong here — runtime keys and `/bkit-debug` observability tokens (deploy-host, DB log-read, etc.) live in app env files (e.g. `apps/web/.env.local`, sourced by `.envrc`). Never re-add stack creds to `.bkit/.env`. Runtime-log source config → `.agents/context.md` (see `docs/observability.md`).
 
@@ -98,6 +98,7 @@ App / stack credentials do not belong here — runtime keys and `/bkit-debug` ob
 - **Gitignored + `chmod 600`. NEVER commit.** Deliberately untracked — absent from WriteSet / manifest / `canonicalHashes` — so no `bkit check` drift or upgrade template walk (machine-local values expected to differ). `bkit uninstall` deletes them when the respective host is removed.
 - **Resolution follows consumer `.envrc`** — bkit reads sourced dotenv files, honours `unset` lines. No hardcoded stack-specific key list; knowledge stays in consumer `.envrc` (stack-agnostic shipped surface).
 - **Session-hijack keys always dropped** from the block: `ANTHROPIC_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, because exporting them redirects the agent's own model calls to API-key billing vs subscription.
+- **Router-only keys always dropped** from the block: `BKIT_OPENAI_API_KEY`. Only the `codex` router job reads it, as a repo Actions secret; no cloud agent session needs it, and every session reads untrusted issue / PR text.
 - Empty-valued keys skipped; absent baseline tokens (`BKIT_GH_TOKEN`) → placeholder, never fabricated.
 - **Codex secret type:** the `.codex/bkit-cloud.md` doc directs every token to **Environment variables**; **Network secrets** (placeholder in-process, real value substituted by the proxy for allowed domains) are optional hardening for HTTP-only tokens and break any token a program reads directly (`gh auth login --with-token`).
 - **Cursor secret type:** the `.cursor/bkit-cloud.md` doc directs you to add each as a **Runtime Secret** (loaded as an env var but redacted from the agent's transcript) in the Cloud Agents dashboard → Secrets tab, so tools read the value while the agent transcript never sees it.
@@ -172,11 +173,11 @@ GHA-injection: user-controlled text (commit message, PR title, dispatch inputs)
 
 ## CI Auto-Route Trust (bkit-cloud)
 
-**Engine-owned FID parse:** the router never matches a FID with its own regex. `bkit fids parse` (the consumer's own bkit, installed from its lockfile) returns the FID and issue id, and `bkit_dev_dispatch_guard` asserts the FID charset again before the counter write. The `dev` subject goes through `fids parse --prompt-file`, never an argument.
+**Engine-owned FID parse:** the router never matches a FID with its own regex. `bkit fids parse` (the consumer's own bkit, installed from its `dev` lockfile) returns the FID and issue id, and `bkit_dev_dispatch_guard` asserts the FID charset again before the counter write. The `dev` subject goes through `fids parse --prompt-file`, never an argument.
 
 **Kill switch on every tracker:** the `bkit:auto` label is read through `bkit issues fetch` on GitHub, Linear and Jira alike. An unreadable label (missing key, service down, issue not found, bkit not installable, unparseable output) starts no agent and exits green, with the reason in the log and job summary. Tracker keys (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`) are set at step scope, never job-wide.
 
-**Same-repo PR steering its own routing:** a same-repo PR's head `package.json` (`bkit.cloud.agent`, `bkit.tracker.default`) steers the routing run for that PR. The author is collaborator-trusted (write access), so this widens nothing: the same collaborator can edit the workflow file.
+**Same-repo PR steering its own routing:** a same-repo PR's head `package.json` (`bkit.cloud.agent`, `bkit.tracker.default`), `status.jsonl` and `.bkit/issues.jsonl` are DATA the routing run reads from a `pr-head` checkout. The code that decides the kill switch never comes from that branch: bkit is installed from the `dev` checkout (workspace root) and run against `pr-head`, because an agent session writing the branch with `GITHUB_TOKEN` cannot edit `.github/workflows/*` but can edit `package.json` and the lockfile. The `pr-head` checkout keeps no credential in its git config. The author of the data is collaborator-trusted (write access).
 
 **Same-repo trigger gate:** every CI-driven dispatch job additionally requires `workflow_run.head_repository.full_name == github.repository`, so a fork PR's CI completion never boots one. `workflow_run` runs in the base repo with the workflow's own `permissions:`, and the `dev` arm performs a privileged `git push origin dev` (the dispatch-counter row) before any agent boots — without the guard, a fork-triggered run reaches that write with `contents: write`. The guard gates the trigger only; outbound lookups made inside the job filter their own results (see the `dev` arm exception below).
 
