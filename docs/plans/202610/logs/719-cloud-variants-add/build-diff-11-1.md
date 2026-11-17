diff --git a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
index a4d5b45e3..3e0a59c41 100644
--- a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
@@ -1316,6 +1316,46 @@ describe.skipIf(!hasTools)(
   },
 );
 
+describe.skipIf(!hasBash)("bkit-cloud.yml Select agent job — routing config source", () => {
+  it("Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording", () => {
+    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-select-dev-"));
+    try {
+      const headDir = path.join(tmp, "pr-head");
+      fs.mkdirSync(headDir);
+      fs.writeFileSync(path.join(headDir, "package.json"), JSON.stringify({ name: "c" }));
+      fs.writeFileSync(
+        path.join(tmp, "package.json"),
+        JSON.stringify({ name: "c", bkit: { cloud: { agent: "codex" } } }),
+      );
+      const outputFile = path.join(tmp, "github-output");
+      fs.writeFileSync(outputFile, "");
+      const res = spawnSync("bash", ["-c", SELECT_SCRIPT], {
+        cwd: tmp,
+        encoding: "utf8",
+        env: {
+          ...process.env,
+          BKIT_ANTHROPIC_API_KEY: "",
+          ANTHROPIC_FEDERATION_RULE_ID: "",
+          ANTHROPIC_ORGANIZATION_ID: "",
+          BKIT_OPENCODE_API_KEY: "",
+          BKIT_OPENROUTER_API_KEY: "",
+          BKIT_OLLAMA_API_KEY: "",
+          BKIT_OPENAI_API_KEY: "k",
+          HEAD_DIR: "pr-head",
+          GITHUB_OUTPUT: outputFile,
+        },
+      });
+      expect(res.status, res.stderr).toBe(0);
+      const out = fs.readFileSync(outputFile, "utf8");
+      expect(out).toMatch(/^codex=true$/m);
+      expect(out).toMatch(/^dispatched=codex$/m);
+      expect(res.stdout).not.toContain("Run bkit install --auto=");
+    } finally {
+      fs.rmSync(tmp, { recursive: true, force: true });
+    }
+  });
+});
+
 describe.skipIf(!hasBash)("bkit-cloud.yml gate step — per-job credential detection", () => {
   const CREDENTIAL_VARS = [
     "ANTHROPIC_API_KEY",
diff --git a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
index bcf79e61b..768bb810a 100644
--- a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
@@ -132,6 +132,26 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
     expect(evalCheckoutRef(String(last.with?.ref), head)).not.toBe(head);
   });
 
+  it("context job tooling setup steps before Install bkit cannot fail the job", () => {
+    const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
+      jobs: {
+        context: {
+          steps: Array<{ name?: string; uses?: string; "continue-on-error"?: unknown }>;
+        };
+      };
+    };
+    const steps = doc.jobs.context.steps;
+    const installIdx = steps.findIndex((st) => st.name === "Install bkit");
+    expect(installIdx, "context job has no Install bkit step").toBeGreaterThan(-1);
+    const tooling = steps
+      .slice(0, installIdx)
+      .filter((st) => /^(pnpm\/action-setup|actions\/setup-node)@/.test(String(st.uses)));
+    expect(tooling.length, "no pnpm / setup-node step before Install bkit").toBe(2);
+    for (const st of tooling) {
+      expect(st["continue-on-error"], `${st.uses} can fail the context job`).toBe(true);
+    }
+  });
+
   it("context job runs the workspace-root checkout before every nested `path:` checkout", () => {
     const doc = parseYaml(yml.replaceAll("{{CLOUD_RUNNER}}", "ubuntu-latest")) as {
       jobs: { context: { steps: Array<{ uses?: string; with?: Record<string, unknown> }> } };
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index b63395489..c49d1f2d2 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -192,11 +192,15 @@ jobs:
       # node_modules/.bin/bkit absent: the gate reports bkit-unavailable and starts nothing.
       # Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
       # Do NOT add `with: version:` here — pnpm/action-setup errors when both are set.
+      # Both tooling steps are `continue-on-error`: a missing packageManager / lockfile or a failed
+      # download leaves bkit absent, and the gate then reports bkit-unavailable (green, nothing starts).
       - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
         if: steps.gate.outputs.enabled == 'true'
+        continue-on-error: true
 
       - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
         if: steps.gate.outputs.enabled == 'true'
+        continue-on-error: true
         with:
           node-version: {{NODE_VERSION}}
           cache: pnpm
@@ -222,7 +226,11 @@ jobs:
           BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
           HEAD_DIR: pr-head
         run: |
-          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' "${HEAD_DIR:-.}/package.json" 2>/dev/null || true)
+          # Routing config (`bkit.cloud.agent`) comes from the `dev` checkout (workspace root), never
+          # from the feat/** head: a branch cut before `bkit install --auto=` still dispatches,
+          # and the agent set on `dev` reaches in-flight branches. Only the five known values pass.
+          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' package.json 2>/dev/null || true)
+          case "$AGENT" in claude|opencode|codex|cursor|none) ;; *) AGENT="" ;; esac
           AGENT="${AGENT:-none}"
           claude=false
           opencode=false
@@ -303,6 +311,18 @@ jobs:
           # bkit runs from the dev checkout (workspace root) against the data in HEAD_DIR.
           HEAD_DIR="${HEAD_DIR:-.}"
           BKIT_BIN="$PWD/node_modules/.bin/bkit"
+          # Routing config (`bkit.cloud`, `bkit.tracker`) is read from `dev`: overlay it onto the
+          # throwaway head checkout so bkit run there reads the same copy.
+          if [ "$HEAD_DIR" != "." ] && [ -f package.json ] && [ -f "$HEAD_DIR/package.json" ]; then
+            if jq -s '.[1] as $r | .[0] | .bkit = ((.bkit // {}) | del(.cloud, .tracker)
+              + (if ($r.bkit.cloud // null) != null then {cloud: $r.bkit.cloud} else {} end)
+              + (if ($r.bkit.tracker // null) != null then {tracker: $r.bkit.tracker} else {} end))' \
+              "$HEAD_DIR/package.json" package.json > "$HEAD_DIR/package.json.route" 2>/dev/null; then
+              mv "$HEAD_DIR/package.json.route" "$HEAD_DIR/package.json"
+            else
+              rm -f "$HEAD_DIR/package.json.route"
+            fi
+          fi
           bkit_cli() { (cd "$HEAD_DIR" && "$BKIT_BIN" "$@"); }
           if [ "$EVENT" = "workflow_dispatch" ]; then
             # Dispatched: phase + issue come straight from inputs.
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index 804094bea..481c7a16f 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -192,11 +192,15 @@ jobs:
       # node_modules/.bin/bkit absent: the gate reports bkit-unavailable and starts nothing.
       # Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
       # Do NOT add `with: version:` here — pnpm/action-setup errors when both are set.
+      # Both tooling steps are `continue-on-error`: a missing packageManager / lockfile or a failed
+      # download leaves bkit absent, and the gate then reports bkit-unavailable (green, nothing starts).
       - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
         if: steps.gate.outputs.enabled == 'true'
+        continue-on-error: true
 
       - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
         if: steps.gate.outputs.enabled == 'true'
+        continue-on-error: true
         with:
           node-version-file: .nvmrc
           cache: pnpm
@@ -222,7 +226,11 @@ jobs:
           BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
           HEAD_DIR: pr-head
         run: |
-          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' "${HEAD_DIR:-.}/package.json" 2>/dev/null || true)
+          # Routing config (`bkit.cloud.agent`) comes from the `dev` checkout (workspace root), never
+          # from the feat/** head: a branch cut before `bkit install --auto=` still dispatches,
+          # and the agent set on `dev` reaches in-flight branches. Only the five known values pass.
+          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' package.json 2>/dev/null || true)
+          case "$AGENT" in claude|opencode|codex|cursor|none) ;; *) AGENT="" ;; esac
           AGENT="${AGENT:-none}"
           claude=false
           opencode=false
@@ -303,6 +311,18 @@ jobs:
           # bkit runs from the dev checkout (workspace root) against the data in HEAD_DIR.
           HEAD_DIR="${HEAD_DIR:-.}"
           BKIT_BIN="$PWD/node_modules/.bin/bkit"
+          # Routing config (`bkit.cloud`, `bkit.tracker`) is read from `dev`: overlay it onto the
+          # throwaway head checkout so bkit run there reads the same copy.
+          if [ "$HEAD_DIR" != "." ] && [ -f package.json ] && [ -f "$HEAD_DIR/package.json" ]; then
+            if jq -s '.[1] as $r | .[0] | .bkit = ((.bkit // {}) | del(.cloud, .tracker)
+              + (if ($r.bkit.cloud // null) != null then {cloud: $r.bkit.cloud} else {} end)
+              + (if ($r.bkit.tracker // null) != null then {tracker: $r.bkit.tracker} else {} end))' \
+              "$HEAD_DIR/package.json" package.json > "$HEAD_DIR/package.json.route" 2>/dev/null; then
+              mv "$HEAD_DIR/package.json.route" "$HEAD_DIR/package.json"
+            else
+              rm -f "$HEAD_DIR/package.json.route"
+            fi
+          fi
           bkit_cli() { (cd "$HEAD_DIR" && "$BKIT_BIN" "$@"); }
           if [ "$EVENT" = "workflow_dispatch" ]; then
             # Dispatched: phase + issue come straight from inputs.
