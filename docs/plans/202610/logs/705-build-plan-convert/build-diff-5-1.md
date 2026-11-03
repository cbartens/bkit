diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 4966f91bc..e2a71e2dc 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -347,7 +347,7 @@ description: "Build Feature — Autonomous implementation"
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index c02a42905..2d18ec464 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -347,7 +347,7 @@ description: "Build Feature — Autonomous implementation"
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 076025bd7..2c687ee66 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -632,6 +632,24 @@ describe("build", () => {
     expect(section(build, /Step 3 — Branch Sync/)).not.toContain("--step=build-plan-convert");
   });
 
+  it("Plan Convert's finish carries the plan-check log as an optional artifact", () => {
+    // A plan-less run routes to the convert before the check writes its log, so the log
+    // can be absent when the finish runs; a required artifact would exit 7 there and the
+    // Plan Convert comment would never post. Optional records it whenever it exists.
+    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
+      (l) => l.includes("--step=build-plan-convert"),
+    );
+    expect(finish).toHaveLength(1);
+    expect(finish[0]).toContain(
+      "--optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md",
+    );
+    expect(finish[0]).not.toContain(
+      "--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md",
+    );
+    // The plan itself stays a required artifact: the finish only runs once it exists.
+    expect(finish[0]).toContain("--artifact=docs/plans/{YYYYMM}/{FID}-plan.md");
+  });
+
   it("Plan Current posts a comment whether it runs or skips", () => {
     const finish = stepFinishLines(section(build, /Step 5 — Plan Current/), "build-plan-current");
     expect(finish).toHaveLength(2);
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 25df79390..7844a7626 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -305,7 +305,7 @@ _No tracker connected, skip step._
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index ca75523a6..8ebf286f8 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -388,7 +388,7 @@ description: "Build Feature — Autonomous implementation"
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
diff --git a/.bkit/version b/.bkit/version
index 1dc793c4a..0cb3be266 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "8188271e9949a4fe71808bae5d70b33c192abf7cd5645b5051803ab531c2f2ac",
     "docs/design.md": "ca5146835a83d6e22e28e990b11e2df619096482b02c6d6e2567592cff2bea41",
     ".claude/commands/bkit-auto.md": "0f0a4f496d1a5f4ba274c5f47e7b53df02c8bd399d18db2bdf2e1dcc0579f85b",
-    ".claude/commands/bkit-build.md": "6e1015c1870e4f5f5c58d45b3f12d0acacb3f0c238753f8cc72b6d40842635e2",
+    ".claude/commands/bkit-build.md": "d77f5181eb6b67817baed3a77b2107ceb70cee888d5ef25a73285333f16241db",
     ".claude/commands/bkit-debug.md": "8b2daf5c76a8af4a0cea22db8eb0532e83aa59467d1850294908883fe3bd5c99",
     ".claude/commands/bkit-design.md": "d33ed5f1f0f39dbe4a69b660d0ae232334fc65389b0353533801a4d39d23bfab",
     ".claude/commands/bkit-plan.md": "824c1d35ec9fd12b1dd0c0b4ffd44dbe23a3c6682a8cb8df2f03e56cbab4e2fa",
@@ -57,7 +57,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1fec2147e04b0948b07f2d2a036c03c3e20f5e7b01e5c9fda6ff3f170bb20429",
     ".claude/agents/bkit-utility-update-documentation.md": "c3ab27e9c74f234c6dee971ad1423dca38fbf495e90397ff27957236dd5f1030",
     ".cursor/commands/bkit-auto.md": "c7529c630eab40cb88df138a386f7418e3edf02275344d430697c56a1d511a2e",
-    ".cursor/commands/bkit-build.md": "4b282e53f19424e0ad0f9595bafae22d63bb2fae9db67114c2b7575256fe4a47",
+    ".cursor/commands/bkit-build.md": "c0517218b63defec8fa0d871c8846be129647a97366f6ade6394458d361ee217",
     ".cursor/commands/bkit-debug.md": "164f525693dc1ea720e205736e2cf459e8c7eeb25dcf792a342dfd31f8b12520",
     ".cursor/commands/bkit-design.md": "08df3f3d95ad9ba3967e467d723e40273738b73db53d76bc2e1babf4c51c6d2b",
     ".cursor/commands/bkit-plan.md": "8ab05a876f3a440721d440d606134b1657e5ce46fb42a7875495fd6189aa542a",
@@ -117,7 +117,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "3ce9c929a3b0c575596f22849dd22a855576e12211fc8a3652a28b432fb5513b",
     ".opencode/agents/bkit-utility-update-documentation.md": "6f5e202db7d30382594467acf9386ef64172e9f449785d229667101ce9f7dd8f",
     ".opencode/commands/bkit-auto.md": "5e8e9b3a2092de9fca48e787c3b60c33a4d86845a063a269fc6ee7a4dea13501",
-    ".opencode/commands/bkit-build.md": "f546e8e70739ac106a646eb90bae71c0b74f97abcbaa37ca637d9e0d934701ab",
+    ".opencode/commands/bkit-build.md": "0e92e13b6d7b530a3140489ff8ab6101eb8eccf797c49792c85d726027118eb2",
     ".opencode/commands/bkit-debug.md": "e4b4752d3c4bf307469feeff18396bdaf7264591068668496bcdcc86fbd08876",
     ".opencode/commands/bkit-design.md": "06313cc3752ce43f6140c1fa54f4dbd6463cac643f271e6aa7464ddec15e1a40",
     ".opencode/commands/bkit-plan.md": "c2f39fc96e592d855c7ccf038176838709ad0c6aa27aae7faba708c3fdc73aff",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index ce6f0ca82..49623c2d1 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -346,7 +346,7 @@ description: "Build Feature — Autonomous implementation"
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 386c9c253..8b20f8b2d 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -345,7 +345,7 @@ Build Feature — Autonomous implementation
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index f737c0e9e..027d78b81 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -349,7 +349,7 @@ $ARGUMENTS
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
 ### 🔒 Gate 4 — Plan Convert
