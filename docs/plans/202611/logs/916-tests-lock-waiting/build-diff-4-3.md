diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index f3bd48c34..ee3deab38 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -523,7 +523,13 @@ const ASK_PATTERNS = [
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
 const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
 const HOOK_FILE = typeof __filename === "string" ? __filename : "";
-const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+// `__filename` is the real path; `process.argv[1]` is the path the hook was invoked by, which
+// keeps a symlinked `.codex` folder visible.
+const HOOK_INVOKED =
+  typeof process !== "undefined" && process.argv && typeof process.argv[1] === "string"
+    ? process.argv[1]
+    : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE) || CODEX_HOOK_RE.test(HOOK_INVOKED);
 
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
index 0fc57ef5d..4a777c4b2 100644
--- a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -1559,4 +1559,65 @@ describe("machine lock waiting order", { timeout: BUDGET.testTimeout }, () => {
     await expectAllExit([z, y, again]);
     expect(readLines(order)).toEqual(["x", "z", "y"]);
   });
+
+  it("concurrent first takes on a fresh cache exit 0 with no cannot-create refusal", async () => {
+    const rounds = 50;
+    const takes = 16;
+    const results: { round: number; i: number; status: string; err: string }[] = [];
+    for (let round = 0; round < rounds; round++) {
+      const env = envFor({
+        LOCAL_STACK_LOCK_WAIT_S: "60",
+        XDG_CACHE_HOME: path.join(tmp, "race-cache-" + round),
+      });
+      // One shell forks every taker back to back, so they reach the queue folder together.
+      const burst = spawnSync(
+        "bash",
+        [
+          "-c",
+          `for i in $(seq ${takes}); do ( bash "${SCRIPT}" run race$i --lock tests -- true 2>"$XDG_CACHE_HOME.err$i"; echo $? >"$XDG_CACHE_HOME.st$i" ) & done; wait`,
+        ],
+        { env, cwd: process.cwd(), encoding: "utf8" },
+      );
+      expect(burst.error).toBeUndefined();
+      for (let i = 1; i <= takes; i++) {
+        const base = path.join(tmp, "race-cache-" + round);
+        const status = fs.readFileSync(`${base}.st${i}`, "utf8").trim();
+        const err = fs.readFileSync(`${base}.err${i}`, "utf8").trim();
+        // The "in line" waiting note is normal; only a non-zero exit or a queue-folder refusal counts.
+        results.push({ round, i, status, err });
+      }
+    }
+    const refused = results
+      .filter((r) => /^exit=(?!0\n)|cannot create|File exists/.test(`exit=${r.status}\n${r.err}`))
+      .map((r) => `round ${r.round} take ${r.i} exit ${r.status}: ${r.err}`);
+    expect(refused).toEqual([]);
+  }, 600_000);
+
+  it("a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const child = spawn(
+      "bash",
+      [
+        "-c",
+        `trap '' HUP; exec bash "${SCRIPT}" run w1 --lock tests -- bash -c 'echo w1 >> "${order}"'`,
+      ],
+      { env, cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
+    );
+    children.push(child);
+    let stderr = "";
+    child.stderr.on("data", (data: Buffer) => (stderr += data.toString()));
+    const done = new Promise<number | null>((resolve) =>
+      child.on("close", (status) => resolve(status)),
+    );
+    await waitForTicket(queueOf("tests"), "w1");
+    process.kill(ticketPid(queueOf("tests"), "w1"), "SIGHUP");
+    await delay(500);
+    expect(ticketsIn(queueOf("tests")).length).toBe(1);
+    holder.release();
+    expect(await done, stderr).toBe(0);
+    expect(stderr).not.toContain("stopped before it answered");
+    expect(readLines(order)).toEqual(["w1"]);
+  });
 });
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index 7150e5593..44cddfb6e 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -841,6 +841,36 @@ describe("permissions-parity", () => {
     });
   });
 
+  describe("bkit tests jump through a symlinked .codex folder", () => {
+    it("the codex hook denies bkit tests jump when .codex is a symlinked folder", () => {
+      const base = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-codex-symlink-"));
+      try {
+        const repo = path.join(base, "repo");
+        const realHooks = path.join(base, "dotfiles", "codex-config", "hooks");
+        fs.mkdirSync(path.join(repo, ".git"), { recursive: true });
+        fs.mkdirSync(realHooks, { recursive: true });
+        fs.cpSync(path.join(GENERATED, ".bkit"), path.join(repo, ".bkit"), { recursive: true });
+        fs.copyFileSync(CODEX_GUARDRAILS, path.join(realHooks, "bkit-guardrails.cjs"));
+        fs.symlinkSync(path.join(base, "dotfiles", "codex-config"), path.join(repo, ".codex"));
+        const res = spawnSync("node", [".codex/hooks/bkit-guardrails.cjs"], {
+          cwd: repo,
+          input: JSON.stringify({
+            tool_name: "Bash",
+            tool_input: { command: "bkit tests jump build-1" },
+          }),
+          encoding: "utf-8",
+        });
+        const out = res.stdout.trim();
+        expect(out, res.stderr).not.toBe("");
+        const hso = (JSON.parse(out) as { hookSpecificOutput: Record<string, string> })
+          .hookSpecificOutput;
+        expect(hso.permissionDecision).toBe("deny");
+      } finally {
+        fs.rmSync(base, { recursive: true, force: true });
+      }
+    });
+  });
+
   describe("shell reads of secret files — script hosts gate, permission tables do not", () => {
     for (const g of SHELL_SECRET_READS) {
       it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — cursor/codex/antigravity; claude/opencode Bash rows allow`, () => {
diff --git a/.bkit/core/hooks/guardrails-tiers.js b/.bkit/core/hooks/guardrails-tiers.js
index d770650f1..172d1634a 100644
--- a/.bkit/core/hooks/guardrails-tiers.js
+++ b/.bkit/core/hooks/guardrails-tiers.js
@@ -179,7 +179,13 @@ const ASK_PATTERNS = [
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
 const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
 const HOOK_FILE = typeof __filename === "string" ? __filename : "";
-const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+// `__filename` is the real path; `process.argv[1]` is the path the hook was invoked by, which
+// keeps a symlinked `.codex` folder visible.
+const HOOK_INVOKED =
+  typeof process !== "undefined" && process.argv && typeof process.argv[1] === "string"
+    ? process.argv[1]
+    : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE) || CODEX_HOOK_RE.test(HOOK_INVOKED);
 
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 15cdcbd48..3e7027b40 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -130,3 +130,5 @@
 {"schema":3,"ts":1794364613770,"kind":"friction","key":"tracker-comment/comment-association","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"comment-association"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment association unavailable","description":"plan comment reporting encountered an exhausted association problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":14,"lastConfirmed":1794364613770}
 {"schema":3,"ts":1794364613919,"kind":"friction","key":"tracker-comment/comment-association","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"comment-association"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment association unavailable","description":"plan comment reporting encountered an exhausted association problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":15,"lastConfirmed":1794364613919}
 {"schema":3,"ts":1794365578751,"kind":"friction","key":"tracker-comment/comment-association","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"comment-association"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment association unavailable","description":"plan comment reporting encountered an exhausted association problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":16,"lastConfirmed":1794365578751}
+{"schema":3,"ts":1794394374782,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":9,"lastConfirmed":1794394374782}
+{"schema":3,"ts":1794438599032,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":10,"lastConfirmed":1794438599032}
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
index 02f8add82..16444eac0 100644
--- a/.bkit/templates/scripts/ci/bkit-machine-lock.sh
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -239,7 +239,8 @@ _local_stack_lock() {
     my $queue = "$stem.queue";
     my ($ticket, $ticket_fh);
     END { unlink $ticket if defined $ticket }
-    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { exit 0 };
+    $SIG{TERM} = sub { exit 0 };
+    for my $sig (qw(INT HUP)) { $SIG{$sig} = sub { exit 0 } unless defined $SIG{$sig} && $SIG{$sig} eq "IGNORE" }
     my $ordinal = sub {
       my $n = shift;
       my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
@@ -298,7 +299,7 @@ _local_stack_lock() {
       return ($place, scalar @live);
     };
     if ($mode ne "try") {
-      unless (-d $queue || mkdir($queue)) { print $out "error cannot create $queue: $!\n"; exit 1 }
+      unless (mkdir($queue) || -d $queue) { print $out "error cannot create $queue: $!\n"; exit 1 }
       my $line = "$who — $checkout";
       # A held place of this run, left by an earlier give-up under 120s ago, keeps its time.
       my ($time, $held_name);
diff --git a/.bkit/version b/.bkit/version
index db82129b8..a94810957 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -231,9 +231,9 @@
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "7e2f1c1fdabd60afc060d82a7a9c99b70db83cba52811fcfc60995a8111d3ae1",
-    ".codex/hooks/bkit-guardrails.cjs": "b2071f16cff177f76c2d07dd636d1409dbf32604df07ac5f336bf8009b28481a",
+    ".codex/hooks/bkit-guardrails.cjs": "95d96c7c54a359c2eb57820a646b0661b993568537752997b0662993e63c7faf",
     ".cursor/hooks/bkit-gateguard.cjs": "36d72eb8b8ce4eba0bf12f3404e71a47cca5465a7d8af149f677f5dc5458e31f",
-    ".cursor/hooks/bkit-guardrails.cjs": "f0ffb34c8aaac060431daa25c833eb97e4503f521dfc36f9dec3ec5160befc79",
+    ".cursor/hooks/bkit-guardrails.cjs": "555eb1622ac25b1a2900d74a9a6f04b87da5512d8956b2dd0c56ad67bed929fe",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "07484d9552883b162bff74c0835d3ff5695f36ee124db3cd3c8ce0a0b4edbba1",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index 8e18d8e57..80b8b8b59 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -519,7 +519,13 @@ const ASK_PATTERNS = [
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
 const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
 const HOOK_FILE = typeof __filename === "string" ? __filename : "";
-const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+// `__filename` is the real path; `process.argv[1]` is the path the hook was invoked by, which
+// keeps a symlinked `.codex` folder visible.
+const HOOK_INVOKED =
+  typeof process !== "undefined" && process.argv && typeof process.argv[1] === "string"
+    ? process.argv[1]
+    : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE) || CODEX_HOOK_RE.test(HOOK_INVOKED);
 
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index c93ab2a1a..41953313f 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -511,7 +511,13 @@ const ASK_PATTERNS = [
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
 const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
 const HOOK_FILE = typeof __filename === "string" ? __filename : "";
-const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+// `__filename` is the real path; `process.argv[1]` is the path the hook was invoked by, which
+// keeps a symlinked `.codex` folder visible.
+const HOOK_INVOKED =
+  typeof process !== "undefined" && process.argv && typeof process.argv[1] === "string"
+    ? process.argv[1]
+    : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE) || CODEX_HOOK_RE.test(HOOK_INVOKED);
 
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index 1ec43a4ac..1af7f3882 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -798,3 +798,5 @@
 {"schema":3,"ts":1794363410348,"firstTs":1794363410348,"updates":1,"kind":"decision","key":"915-min-push-audit-template-project-section","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["915","https://github.com/cbartens/bkit/issues/915",".bkit/core/engine/commands/ci/ci.ts (minPushOutside)",".bkit/core/engine/commands/ci/push-gate.ts (hasVerifiedIncrement)",".bkit/core/engine/commands/land.ts (checkLanding)",".bkit/core/engine/install/managed-block.ts (managedHead)","min-push-floor-is-ship-allow-list","docs/plans/202611/915-min-push-ignores-plan.md"],"summary":"bkit ci min-push accepts a docs/templates/bkit-audit-*.md change when its text through the single <!-- bkit:end --> line is byte-identical at the base and the pushed commit; one classifier, minPushOutside in ci.ts, serves --ref, --update, the receipt path and the landing routine","description":"minPushOutside(root, from, to, paths) wraps changedOutside and drops from outside each top-level docs/templates/bkit-audit-*.md whose blob exists at both commits and whose managedHead (install/managed-block.ts: the text from the first byte through the end of the bkit:end line, null unless the file has exactly one line-anchored bkit:start and one bkit:end in that order) is non-null and equal at both. A new, deleted or renamed template, an unreadable blob, an extra marker line, or any change at or above bkit:end leaves the file outside, so the decision fails closed to the full gate. Blobs are read with gitRaw (untrimmed). hasVerifiedIncrement in push-gate.ts takes the classifier as a callback instead of a pathspec list, so the receipt path agrees with the whole-range path without push-gate.ts importing ci.ts. checkLanding in land.ts uses the same classifier. Each accepted template is logged by name. Other templates (bkit-plan.md, which plan-check reads) keep blocking.","rationale":"Every audit run edits the consumer-owned Project Instructions section below bkit:end, which bkit install never overwrites. The only code that reads that section is the advisory detectManagedDuplicate, which never changes bkit check's exit code and runs on every push anyway; the minimum gate's own prettier, Vale and slop steps read it on the min push itself.","alternatives":"Parse git diff -U0 hunk ranges against the marker's line number: breaks on hunks that straddle the marker and on marker lines added below. Exempt the whole audit template: lets a change to the bkit-managed block skip the full gate. Put the exception into changedOutside: widens ship's bookkeeping check and only-bookkeeping, which the owner did not ask for. Have push-gate.ts import the classifier from ci.ts: an import cycle, since ci.ts imports push-gate.ts."}
 {"schema":3,"ts":1794364660560,"firstTs":1794363410348,"updates":2,"kind":"decision","key":"915-min-push-audit-template-project-section","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["915","https://github.com/cbartens/bkit/issues/915",".bkit/core/engine/commands/ci/ci.ts (minPushOutside)",".bkit/core/engine/commands/ci/push-gate.ts (hasVerifiedIncrement)",".bkit/core/engine/commands/land.ts (checkLanding)",".bkit/core/engine/install/managed-block.ts (managedHead)","min-push-floor-is-ship-allow-list","docs/plans/202611/915-min-push-ignores-plan.md","package.json (bkit:gate:min)",".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/engine/audits/templates/template-no-userpath.test.ts"],"summary":"bkit ci min-push accepts a docs/templates/bkit-audit-*.md change when its text through the single <!-- bkit:end --> line is byte-identical at the base and the pushed commit; one classifier, minPushOutside in ci.ts, serves --ref, --update, the receipt path and the landing routine","description":"minPushOutside(root, from, to, paths) wraps changedOutside and drops from outside each top-level docs/templates/bkit-audit-*.md whose blob exists at both commits and whose managedHead (install/managed-block.ts: the text from the first byte through the end of the bkit:end line, null unless the file has exactly one line-anchored bkit:start and one bkit:end in that order) is non-null and equal at both. A new, deleted or renamed template, an unreadable blob, an extra marker line, or any change at or above bkit:end leaves the file outside, so the decision fails closed to the full gate. Blobs are read with gitRaw (untrimmed). hasVerifiedIncrement in push-gate.ts takes the classifier as a callback instead of a pathspec list, so the receipt path agrees with the whole-range path without push-gate.ts importing ci.ts. checkLanding in land.ts uses the same classifier. Each accepted template is logged by name. Other templates (bkit-plan.md, which plan-check reads) keep blocking. In the bkit repo, bkit's own bkit:gate:min also runs templates.test.ts and template-no-userpath.test.ts, the two unit tests that read the installed audit templates below bkit:end (pending the owner's answer on #915).","alternatives":"Parse git diff -U0 hunk ranges against the marker's line number: breaks on hunks that straddle the marker and on marker lines added below. Exempt the whole audit template: lets a change to the bkit-managed block skip the full gate. Put the exception into changedOutside: widens ship's bookkeeping check and only-bookkeeping, which the owner did not ask for. Have push-gate.ts import the classifier from ci.ts: an import cycle, since ci.ts imports push-gate.ts. Narrow the two bkit-repo tests to the managed block: drops the leaked-home-path check on the project section, which is the failure that test exists to catch.","rationale":"Every audit run edits the consumer-owned Project Instructions section below bkit:end, which bkit install never overwrites. Four readers read that section: the advisory detectManagedDuplicate, which never changes bkit check's exit code and runs on every push anyway; the minimum gate's own prettier, Vale and slop steps, which run on the min push itself; and, in the bkit repo only, templates.test.ts (asserts the text after bkit:end starts with ## Project Instructions) and template-no-userpath.test.ts (fails on an absolute home path anywhere in an installed audit template). bkit's own bkit:gate:min ran neither test, so a [skip ci] push to dev could leave either one red with nothing run; adding both to bkit's own bkit:gate:min applies the existing guidance that a test reading a min-push file goes into bkit:gate:min. The seeded consumer bkit:gate:min does not change."}
 {"schema":3,"ts":1794365411132,"firstTs":1794363410348,"updates":3,"kind":"decision","key":"915-min-push-audit-template-project-section","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-close-workflow"},"references":["915","https://github.com/cbartens/bkit/issues/915",".bkit/core/engine/commands/ci/ci.ts (minPushOutside)",".bkit/core/engine/commands/ci/push-gate.ts (hasVerifiedIncrement)",".bkit/core/engine/commands/land.ts (checkLanding)",".bkit/core/engine/install/managed-block.ts (managedHead)","min-push-floor-is-ship-allow-list","docs/plans/202611/915-min-push-ignores-plan.md","package.json (bkit:gate:min)",".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/engine/audits/templates/template-no-userpath.test.ts"],"summary":"bkit ci min-push accepts a docs/templates/bkit-audit-*.md change when its text through the single <!-- bkit:end --> line is byte-identical at the base and the pushed commit; one classifier, minPushOutside in ci.ts, serves --ref, --update, the receipt path and the landing routine","alternatives":"Parse git diff -U0 hunk ranges against the marker's line number: breaks on hunks that straddle the marker and on marker lines added below. Exempt the whole audit template: lets a change to the bkit-managed block skip the full gate. Put the exception into changedOutside: widens ship's bookkeeping check and only-bookkeeping, which the owner did not ask for. Have push-gate.ts import the classifier from ci.ts: an import cycle, since ci.ts imports push-gate.ts. Narrow the two bkit-repo tests to the managed block: drops the leaked-home-path check on the project section, which is the failure that test exists to catch.","description":"minPushOutside(root, from, to, paths) wraps changedOutside and drops from outside each top-level docs/templates/bkit-audit-*.md whose blob exists at both commits and whose managedHead (install/managed-block.ts: the text from the first byte through the end of the bkit:end line, null unless the file has exactly one line-anchored bkit:start and one bkit:end in that order) is non-null and equal at both. A new, deleted or renamed template, an unreadable blob, an extra marker line, or any change at or above bkit:end leaves the file outside, so the decision fails closed to the full gate. Blobs are read with gitRaw (untrimmed). hasVerifiedIncrement in push-gate.ts takes the classifier as a callback instead of a pathspec list, so the receipt path agrees with the whole-range path without push-gate.ts importing ci.ts. checkLanding in land.ts uses the same classifier. Each accepted template is logged by name. Other templates (bkit-plan.md, which plan-check reads) keep blocking. In the bkit repo, bkit's own bkit:gate:min also runs templates.test.ts and template-no-userpath.test.ts, the two unit tests that read the installed audit templates below bkit:end.","rationale":"answered by owner: A) Add both to gate:min (Recommended) — proceed with the audit-template project-section exception, and add templates.test.ts and template-no-userpath.test.ts to bkit's own bkit:gate:min in package.json beside ledger-integrity.test.ts, so the two bkit-repo tests that read below bkit:end run on every min push. The seeded consumer bkit:gate:min does not change."}
+{"schema":3,"ts":1794451724682,"firstTs":1794451724682,"updates":1,"kind":"decision","key":"916-task11-test-first-points-at-task14-test","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["916","docs/plans/202611/916-tests-lock-waiting-plan.md","docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-2.md"],"summary":"916-tests-lock-waiting step 9: gap TASK 11 not-green closed by pointing TASK 11's TEST FIRST and Derived Test Matrix row at the TASK 14 test 'concurrent first takes on a fresh cache exit 0 with no cannot-create refusal', which replaced the deleted race test","rationale":"accepted by owner: get this unstuck and moving"}
+{"schema":3,"ts":1794451724683,"firstTs":1794451724683,"updates":1,"kind":"decision","key":"916-queue-race-test-intermittent-guard","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["916","docs/plans/202611/916-tests-lock-waiting-plan.md","docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-2.md",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts",".bkit/templates/scripts/ci/bkit-machine-lock.sh"],"summary":"916-tests-lock-waiting step 9: gap TASK 14 accepted: the race test 'concurrent first takes on a fresh cache exit 0 with no cannot-create refusal' (16 takes x 50 fresh caches) caught the mkdir race on start commit e929f8d63 in 1 of 3 runs, so it stays an intermittent guard, with no raised counts and no test-only hook in the lock script","rationale":"accepted by owner: get this unstuck and moving"}
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index f37641fb5..5c5e5cf78 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -279,3 +279,6 @@
 {"schema":3,"ts":1794355279599,"firstTs":1794355279599,"updates":1,"kind":"deferral","key":"803-opencode-webfetch-exact-origin-never-revoked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["#803","docs/plans/202611/803-close-codex-opencode-plan.md § Out of Scope","#803 § Constraints and non-goals (owner scope revision, 2026-11-03): no permission recovery journal, durable transaction/locking subsystem","381-opencode-bash-grants-never-revoked",".bkit/core/engine/install/modules/opencode.ts reconcileOpencodeJson",".bkit/core/engine/commands/install/uninstall.ts stripOpencodeJsonScope"],"type":"issue","category":"security","severity":"LOW","reason":"scope-declared","summary":"Exact-origin OpenCode webfetch allows are never revoked, and uninstall cannot tell a consumer-authored equal key from a derived one","description":"#803 replaces the derived *{base}* webfetch allows with https://{name} and https://{name}/* keys. Upgrade deep-merges existing keys, so both keys stay after the domain leaves allowed-domains, and the substring detector does not report exact-origin keys. Uninstall removes OpenCode keys by recomputing the derived set through stripOpencodeJsonScope, so a consumer-authored key equal to a derived one is deleted. Closing either gap needs a per-key ownership record for OpenCode permission keys, which the 2026-11-03 revision declares a non-goal. The shell part of 381-opencode-bash-grants-never-revoked closes in #803; this residual is the webfetch part.","remediation":"In a future issue: record the OpenCode permission keys bkit writes (for example in .bkit/version beside claudeAllowDerived), drop recorded keys that leave the derived set on upgrade, and strip only recorded keys on uninstall.","status":"OPEN"}
 {"schema":3,"ts":1794355244439,"firstTs":1794355244439,"updates":1,"kind":"deferral","key":"918-repair-already-marked-consumer-comments","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["#918","https://github.com/cbartens/bkit/issues/918 § Already-posted comments (Decision needed)","docs/plans/202611/918-ad-hoc-agent-plan.md § Out of Scope","docs/plans/202611/918-ad-hoc-agent-plan.md § Open Questions & Assumptions"],"type":"feature","category":"agentic","severity":"LOW","reason":"needs-decision","summary":"Repair the comments already posted with the bkit:generated marker","description":"About 20 ad-hoc comments on a consumer's issues carry the ###### bkit:generated first line, so workflow input drops them until the line is removed. Decision needed: A) the owner removes the first line by hand once; B) ship a bkit issues check that lists marked comments whose step heading matches no step of the workflow they name, so each consumer finds its own; C) both. The guard in #918 stops new ones and needs neither.","remediation":"Owner picks A, B or C; B is a new verb with tracker reads and step-table matching, planned in its own issue.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794364265383,"firstTs":1794355279599,"updates":2,"kind":"deferral","key":"803-opencode-webfetch-exact-origin-never-revoked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["#803","docs/plans/202611/logs/803-close-codex-opencode/plan-answers-1.md (Open Question 4, answer C)","551-opencode-unanchored-host-allows-accepted-risk","803-opencode-webfetch-exact-origin"],"type":"issue","category":"security","severity":"LOW","reason":"scope-declared","summary":"Exact-origin OpenCode webfetch allows are never revoked, and uninstall cannot tell a consumer-authored equal key from a derived one","description":"Closed: the owner kept the *{base}* OpenCode webfetch allows under decision 551-opencode-unanchored-host-allows-accepted-risk (plan Open Question 4, answer C), and decision 803-opencode-webfetch-exact-origin is SUPERSEDED. #803 writes no exact-origin webfetch keys, so the residual this row carried does not arise.","status":"CLOSED"}
+{"schema":3,"ts":1794392819267,"firstTs":1794392819267,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A waiter with `BKIT_TEST_SLOTS=2` sits idle behind a first-in-line waiter that only uses slot 1, while slot 2 is free, and can give up at its limit","description":"LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:344: A waiter with `BKIT_TEST_SLOTS=2` sits idle behind a first-in-line waiter that only uses slot 1, while slot 2 is free, and can give up at its limit. Done when: the owner decides what \"first in line\" means when waiters on one `tests` queue carry different `BKIT_TEST_SLOTS` values (it is a per-process environment variable, so two hosts or shells can differ): either a later waiter may take a slot beyond the head's slot count, or the mismatch is documented as accepted head-of-line blocking in `.bkit/templates.md` § Machine lock. No agent can settle it, because decision `916-queue-first-in-line-only-tries` says only the head tries, and an exception reopens that decision. Reproduced on this diff: holder (slots 1) holds `tests`, waiter A (slots 1) waits, waiter B (`BKIT_TEST_SLOTS=2`) waits 4 s for the holder to finish although `tests.2.lock` is free; the 6.1.1 copy runs B at once.","source":".bkit/templates/scripts/ci/bkit-machine-lock.sh:344"}
+{"schema":3,"ts":1794392819268,"firstTs":1794392819268,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-266","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death","description":"LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:266: A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death. Done when: The Perl helper's scan (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:254` `$first_line`, `:266` ticket open, `:310` held-place lookup) and `.bkit/core/engine/commands/workflow/tests-jump.ts:24` `firstLine` read only regular, non-symlink files (an `lstat` / `-f` check before the open, or a non-blocking open), so a FIFO or other special file whose name matches `^\\d+\\.\\d{6}-\\d+$`, `.held` or `.jump` is ignored and never unlinked; a waiter with such an entry in `tests.queue/` still runs its command when the lock is free and still exits 75 at its limit; `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template.","source":".bkit/templates/scripts/ci/bkit-machine-lock.sh:266"}
+{"schema":3,"ts":1794392819269,"firstTs":1794392819269,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-skills-lock-json-35","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The skill install step blanked the integrity hash of the permanent `find-skills` skill, so a later change to that agent-instruction content can no longer be told apart from what was reviewed","description":"LOW build challenge finding at skills-lock.json:35: The skill install step blanked the integrity hash of the permanent `find-skills` skill, so a later change to that agent-instruction content can no longer be told apart from what was reviewed. Done when: `skills-lock.json` `skills[\"find-skills\"].computedHash` holds the nonempty hash the skills CLI records for the installed `.agents/skills/find-skills/SKILL.md` (reinstalled with `npx skills add vercel-labs/skills@find-skills -y`, or the base entry restored), so every entry meets `.agents/skills.md` § Install / Update step 2 (\"a nonempty `computedHash`\").","source":"skills-lock.json:35"}
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
index 02f8add82..16444eac0 100644
--- a/scripts/ci/bkit-machine-lock.sh
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -239,7 +239,8 @@ _local_stack_lock() {
     my $queue = "$stem.queue";
     my ($ticket, $ticket_fh);
     END { unlink $ticket if defined $ticket }
-    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { exit 0 };
+    $SIG{TERM} = sub { exit 0 };
+    for my $sig (qw(INT HUP)) { $SIG{$sig} = sub { exit 0 } unless defined $SIG{$sig} && $SIG{$sig} eq "IGNORE" }
     my $ordinal = sub {
       my $n = shift;
       my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
@@ -298,7 +299,7 @@ _local_stack_lock() {
       return ($place, scalar @live);
     };
     if ($mode ne "try") {
-      unless (-d $queue || mkdir($queue)) { print $out "error cannot create $queue: $!\n"; exit 1 }
+      unless (mkdir($queue) || -d $queue) { print $out "error cannot create $queue: $!\n"; exit 1 }
       my $line = "$who — $checkout";
       # A held place of this run, left by an earlier give-up under 120s ago, keeps its time.
       my ($time, $held_name);
