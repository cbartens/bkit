diff --git a/.agents/plugins/bkit/agents/bkit-design-review-2.md b/.agents/plugins/bkit/agents/bkit-design-review-2.md
index 1715231df..4860cdd23 100644
--- a/.agents/plugins/bkit/agents/bkit-design-review-2.md
+++ b/.agents/plugins/bkit/agents/bkit-design-review-2.md
@@ -71,7 +71,7 @@ tools:
    - Runbook obviousness from alert payload (vs context-chasing).
    - Recovery action — automatic, idempotent, or human judgement?
    - Alert noise — threshold tuned, or pages on transient blips?
-8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 9. Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 10. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = operable as designed; failure modes have observability and recovery paths; proceed.
diff --git a/.bkit/core/engine/audits/workflows/question-option-format.test.ts b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index ef97ef18f..edbf6e7f6 100644
--- a/.bkit/core/engine/audits/workflows/question-option-format.test.ts
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -39,6 +39,24 @@ const PLAN_TEMPLATE = ".bkit/core/docs/templates/bkit-plan.md";
 const PROMPTS_INDEX = ".bkit/core/.bkit/prompts.md";
 const PROMPTS_INDEX_MIRROR = ".bkit/prompts.md";
 
+/** The two design prompts stating the open-question rule, and the review that checks it. */
+const DESIGN_GENERATE = `${PROMPTS}/bkit-design-generate.md`;
+const DESIGN_UPDATE = `${PROMPTS}/bkit-design-update.md`;
+const DESIGN_REVIEW_2 = `${PROMPTS}/bkit-design-review-2.md`;
+/** The rendered design review, one file per installed provider. */
+const DESIGN_REVIEW_2_MIRRORS = [
+  ".claude/agents/bkit-design-review-2.md",
+  ".cursor/agents/bkit-design-review-2.md",
+  ".opencode/agents/bkit-design-review-2.md",
+  ".agents/plugins/bkit/agents/bkit-design-review-2.md",
+  ".codex/agents/bkit-design-review-2.toml",
+];
+/**
+ * The parts every open question must carry, as the design prompts name them:
+ * lettered options, a lettered `Recommended`, and `Default if unanswered`.
+ */
+const OPEN_QUESTION_PARTS = ["A)", "Recommended", "Default if unanswered"];
+
 /**
  * The label opening an option list. Global, so every list a line carries is read,
  * not just the first. The lookbehind keeps headers that merely end in `Options`
@@ -207,6 +225,14 @@ function openQuestionRules(): Array<{ file: string; no: number; text: string }>
   );
 }
 
+/** The open-question rule lines of one file, joined in line order. */
+function openQuestionRuleLines(file: string): string {
+  return read(file)
+    .split("\n")
+    .filter((line) => OPEN_QUESTION.test(line) && OPTIONS_WORD.test(line))
+    .join("\n");
+}
+
 /** Every row of a prompts index that names open questions and the options they carry. */
 function indexOpenQuestionRules(file: string): Array<{ no: number; text: string }> {
   return read(file)
@@ -284,6 +310,33 @@ describe("question option format: one layout across the corpus", () => {
     ).toEqual(rules.map((rule) => rule.text));
   });
 
+  it("the design review names every part the design prompts require", () => {
+    // The two design prompts demand the same parts of an open question, so the
+    // review that flags a malformed one cannot check a shorter list.
+    for (const file of [DESIGN_GENERATE, DESIGN_UPDATE]) {
+      const rule = openQuestionRuleLines(file);
+      expect(rule, `${file} states no open-question rule`).not.toBe("");
+      for (const part of OPEN_QUESTION_PARTS) {
+        expect(rule, `${file} does not require \`${part}\``).toContain(part);
+      }
+    }
+    // The review, its rendered mirrors and the index row describing it.
+    for (const file of [DESIGN_REVIEW_2, ...DESIGN_REVIEW_2_MIRRORS]) {
+      const rule = openQuestionRuleLines(file);
+      expect(rule, `${file} states no open-question rule`).not.toBe("");
+      for (const part of OPEN_QUESTION_PARTS) {
+        expect(rule, `${file} does not name \`${part}\``).toContain(part);
+      }
+    }
+    const row = indexOpenQuestionRules(PROMPTS_INDEX).find((r) =>
+      r.text.includes("bkit-design-review-2"),
+    );
+    expect(row, `${PROMPTS_INDEX} has no bkit-design-review-2 row`).toBeDefined();
+    for (const part of OPEN_QUESTION_PARTS) {
+      expect(row!.text, `${PROMPTS_INDEX}:${row!.no} does not name \`${part}\``).toContain(part);
+    }
+  });
+
   it("the plan template letters every option of its Open Questions placeholder", () => {
     const open = planTemplateOpenQuestions();
     expect(
diff --git a/.bkit/core/prompts/bkit-design-review-2.md b/.bkit/core/prompts/bkit-design-review-2.md
index 7e483daa6..da970a581 100644
--- a/.bkit/core/prompts/bkit-design-review-2.md
+++ b/.bkit/core/prompts/bkit-design-review-2.md
@@ -73,7 +73,7 @@ autoCompactWindow: 300000
    - Runbook obviousness from alert payload (vs context-chasing).
    - Recovery action — automatic, idempotent, or human judgement?
    - Alert noise — threshold tuned, or pages on transient blips?
-8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 9. Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 10. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = operable as designed; failure modes have observability and recovery paths; proceed.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 3c5380150..b7a73c724 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -7916,7 +7916,7 @@ On-call ergonomics — per anticipated alert:
 Runbook obviousness from alert payload (vs context-chasing).
 Recovery action — automatic, idempotent, or human judgement?
 Alert noise — threshold tuned, or pages on transient blips?
-[R10] Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+[R10] Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 `CONCERNS` = operable with caveats — observability or runbook gaps addressable.
 `FAIL` = not operable in current monitoring / oncall stack — design does not proceed.
diff --git a/.bkit/version b/.bkit/version
index 98efd3f6e..c6deb297b 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -45,7 +45,7 @@
     ".claude/agents/bkit-design-generate.md": "19e9e7b6f940b16467991969f64cfb40e1e23c9eb623208937ac54138765bc5b",
     ".claude/agents/bkit-design-organise.md": "e98f1534136c3ca762520c06becaee12484d8dc64450eee04b90c0d0e308e351",
     ".claude/agents/bkit-design-review-1.md": "1b8e8009431eecafcf248736d36ac6724e6b24cd459bda455161e764780dfacd",
-    ".claude/agents/bkit-design-review-2.md": "ea6949cf7ddfe18b2d29871944ba6c043c907424a973a097d5dd38a3d5f76863",
+    ".claude/agents/bkit-design-review-2.md": "fe6a2b1c78128ac2b267470ceedfe1334bb996d26af6177250b6c9326f8d44c7",
     ".claude/agents/bkit-design-update.md": "4bc40a15349cf93d36d1d42080a8660cbde1455eadcffa529cbec5e99991a094",
     ".claude/agents/bkit-plan-generate.md": "2eba32d4fad68f7617921a6305d271ca76c6997ad8a02e16e133ba118236567e",
     ".claude/agents/bkit-plan-review-1.md": "f3742203484ee1af9ad80fd20ccf23b445304d45243fa8f7625070de45c9b477",
@@ -78,7 +78,7 @@
     ".cursor/agents/bkit-design-generate.md": "caf1cecd94606c876752e0c287c7ef459a5c5ff01a882d65c3b01408bb90471c",
     ".cursor/agents/bkit-design-organise.md": "bf660050d005b1665ea25fe3d16dd3d455808a4b53e4aa079c100355d79e53e7",
     ".cursor/agents/bkit-design-review-1.md": "5bb1c9a9441e3875f984957eff077877c9ba8527b78127dcd1a8618b4dcd095d",
-    ".cursor/agents/bkit-design-review-2.md": "f2b42e7b773d8b499c5f62b2be20ee746020def54c4693e496a78dacb96b0b5d",
+    ".cursor/agents/bkit-design-review-2.md": "ccc1f05b874ce49e5ddb9c7c77cb4e086d93cff0b7c8c859aa867564ccb80be4",
     ".cursor/agents/bkit-design-update.md": "15e5f8cdd46bc231ab2488ef753ce66d8f74ec5121ed2cacbb3bd935a3f3aa06",
     ".cursor/agents/bkit-plan-generate.md": "805ad4d0093658e43fe2427249fca88d4c51c4fbff54ca1319cf0e7356f18056",
     ".cursor/agents/bkit-plan-review-1.md": "2a96ff295479b9647b97f187e2a1be711c95578d06c896ba01af752d66511362",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-design-generate.md": "7a8fbcb899d1ddb9d11ec63b1595081adfd65909d92b5b5321ffe0e7c22f6921",
     ".opencode/agents/bkit-design-organise.md": "92c8ef8a557eaaa1b536850a92b6aae0f8b03fea8c2f0fb07bbd289aa2e79205",
     ".opencode/agents/bkit-design-review-1.md": "1b90f7476ce68b48176f4d67a4311465cc5ec2e31f0cd7a7354483fee64f93c6",
-    ".opencode/agents/bkit-design-review-2.md": "d3c2c7218aa2ddd355620b54337c71ef5e0c24c3867d4171a03d4a8f3cf4c2fa",
+    ".opencode/agents/bkit-design-review-2.md": "796c8d09beb93fc0b3a4a884c69c65b49fbb3931c957057acd2ce593bb1218ef",
     ".opencode/agents/bkit-design-update.md": "71bbe21633e57815ea5d86c0951a75d7b5bddb251db167b4fb7733f26a62c965",
     ".opencode/agents/bkit-plan-generate.md": "b0c2bfcbbe32b7b145f6e95845d139fad162db6d8d25f0096c2b53674d03ad29",
     ".opencode/agents/bkit-plan-review-1.md": "be9abf55f350164f081a1b169914367b0ce88ff1c8fcf2fa4bd48f58635efa80",
@@ -147,7 +147,7 @@
     ".codex/agents/bkit-design-generate.toml": "c542003193a475fa5409b466ddf46e5944f0c19f56ce56cbcacfcc27444b05e0",
     ".codex/agents/bkit-design-organise.toml": "7c4dc05ccc67d2acaa522b48ad27dd9511f59d85804082fd0839e447468110a4",
     ".codex/agents/bkit-design-review-1.toml": "e02dde87e61e22eac04dfb7d80e0edda28712b159831c4c70de9361109e12242",
-    ".codex/agents/bkit-design-review-2.toml": "c496c35f47c34e47e852ce7a08b159665300784ddfcb9e9de7e5d31d56a96e6c",
+    ".codex/agents/bkit-design-review-2.toml": "7db22e246f98a2244aa76965e7968c82167394c17e38391e40bd7e51da801ba0",
     ".codex/agents/bkit-design-spike.toml": "1968c8c894a91dc4a6ecba0c794e127bc7886fdff7ea1dcef8ca605020eac473",
     ".codex/agents/bkit-design-update.toml": "c66ad4af8eff67f05066fce987e99f9e71ba996a92b73cb9d945c89c647ba310",
     ".codex/agents/bkit-plan-generate.toml": "a5204efa79df9b49a9b2b6e56cc559c5e6a11e4ef9f007bf02ae038cc6599bcf",
diff --git a/.claude/agents/bkit-design-review-2.md b/.claude/agents/bkit-design-review-2.md
index 77e4718db..eed073966 100644
--- a/.claude/agents/bkit-design-review-2.md
+++ b/.claude/agents/bkit-design-review-2.md
@@ -74,7 +74,7 @@ autoCompactWindow: 300000
    - Runbook obviousness from alert payload (vs context-chasing).
    - Recovery action — automatic, idempotent, or human judgement?
    - Alert noise — threshold tuned, or pages on transient blips?
-8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 9. Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 10. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = operable as designed; failure modes have observability and recovery paths; proceed.
diff --git a/.codex/agents/bkit-design-review-2.toml b/.codex/agents/bkit-design-review-2.toml
index 0315e3389..cd652484c 100644
--- a/.codex/agents/bkit-design-review-2.toml
+++ b/.codex/agents/bkit-design-review-2.toml
@@ -59,7 +59,7 @@ developer_instructions = """
    - Runbook obviousness from alert payload (vs context-chasing).
    - Recovery action — automatic, idempotent, or human judgement?
    - Alert noise — threshold tuned, or pages on transient blips?
-8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 9. Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 10. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = operable as designed; failure modes have observability and recovery paths; proceed.
diff --git a/.cursor/agents/bkit-design-review-2.md b/.cursor/agents/bkit-design-review-2.md
index 20f57d969..bc0cca298 100644
--- a/.cursor/agents/bkit-design-review-2.md
+++ b/.cursor/agents/bkit-design-review-2.md
@@ -71,7 +71,7 @@ tools:
    - Runbook obviousness from alert payload (vs context-chasing).
    - Recovery action — automatic, idempotent, or human judgement?
    - Alert noise — threshold tuned, or pages on transient blips?
-8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 9. Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 10. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = operable as designed; failure modes have observability and recovery paths; proceed.
diff --git a/.opencode/agents/bkit-design-review-2.md b/.opencode/agents/bkit-design-review-2.md
index f07d3d549..118750e27 100644
--- a/.opencode/agents/bkit-design-review-2.md
+++ b/.opencode/agents/bkit-design-review-2.md
@@ -72,7 +72,7 @@ tools:
    - Runbook obviousness from alert payload (vs context-chasing).
    - Recovery action — automatic, idempotent, or human judgement?
    - Alert noise — threshold tuned, or pages on transient blips?
-8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts.
+8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`), a lettered `Recommended` or a `Default if unanswered` → `OPTIONAL` findings naming missing parts.
 9. Operational dependencies: new on-call burden (dashboard / alert / runbook)? Surface explicitly; not blocker but must be acknowledged.
 10. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = operable as designed; failure modes have observability and recovery paths; proceed.
