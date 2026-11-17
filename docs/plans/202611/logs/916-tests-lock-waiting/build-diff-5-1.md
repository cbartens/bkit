diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index ee3deab38..4d1f59538 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -510,6 +510,9 @@ function denyRule(c) {
 }
 
 /** Ask tier, non-git — destructive or privileged shell. */
+/** A `bkit tests jump` command, wherever it sits in a chained command. */
+const TESTS_JUMP_RE = /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/;
+
 const ASK_PATTERNS = [
   { re: /\bsudo\b/, what: "sudo" },
   { re: /\bbrew\s+install\b/, what: "brew install" },
@@ -517,7 +520,7 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
-  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
+  { re: TESTS_JUMP_RE, what: "bkit tests jump" },
 ];
 
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
@@ -632,10 +635,10 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
-  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+  if (IS_CODEX_HOOK && (what === "bkit tests jump" || TESTS_JUMP_RE.test(c))) {
     return {
       tier: "deny",
-      what,
+      what: "bkit tests jump",
       fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
     };
   }
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index 44cddfb6e..6986a26c5 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -839,6 +839,21 @@ describe("permissions-parity", () => {
         expect({ cmd, verdicts: jumpVerdicts(cmd) }).toEqual({ cmd, verdicts: EXPECTED });
       }
     });
+
+    it("the codex hook denies bkit tests jump chained after another ask-tier command", () => {
+      for (const cmd of [
+        "gh pr close 999999; bkit tests jump build-1",
+        "sudo -n true; bkit tests jump build-1",
+      ]) {
+        expect({ cmd, codex: codexVerdict(cmd) }).toEqual({ cmd, codex: "deny" });
+        // Hosts that can ask keep asking for the compound command.
+        expect({ cmd, cursor: cursorVerdict({ command: cmd }) }).toEqual({ cmd, cursor: "ask" });
+        expect({ cmd, antigravity: antigravityShellVerdict(cmd) }).toEqual({
+          cmd,
+          antigravity: "ask",
+        });
+      }
+    });
   });
 
   describe("bkit tests jump through a symlinked .codex folder", () => {
diff --git a/.bkit/core/hooks/guardrails-tiers.js b/.bkit/core/hooks/guardrails-tiers.js
index 172d1634a..d6eca32b7 100644
--- a/.bkit/core/hooks/guardrails-tiers.js
+++ b/.bkit/core/hooks/guardrails-tiers.js
@@ -166,6 +166,9 @@ function denyRule(c) {
 }
 
 /** Ask tier, non-git — destructive or privileged shell. */
+/** A `bkit tests jump` command, wherever it sits in a chained command. */
+const TESTS_JUMP_RE = /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/;
+
 const ASK_PATTERNS = [
   { re: /\bsudo\b/, what: "sudo" },
   { re: /\bbrew\s+install\b/, what: "brew install" },
@@ -173,7 +176,7 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
-  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
+  { re: TESTS_JUMP_RE, what: "bkit tests jump" },
 ];
 
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
@@ -288,10 +291,10 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
-  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+  if (IS_CODEX_HOOK && (what === "bkit tests jump" || TESTS_JUMP_RE.test(c))) {
     return {
       tier: "deny",
-      what,
+      what: "bkit tests jump",
       fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
     };
   }
diff --git a/.bkit/version b/.bkit/version
index a94810957..0a53101d6 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -231,9 +231,9 @@
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "7e2f1c1fdabd60afc060d82a7a9c99b70db83cba52811fcfc60995a8111d3ae1",
-    ".codex/hooks/bkit-guardrails.cjs": "95d96c7c54a359c2eb57820a646b0661b993568537752997b0662993e63c7faf",
+    ".codex/hooks/bkit-guardrails.cjs": "9b8a3031c75141e8a8e0a846f29930caabfa83eafd715250497fb96be9e6a686",
     ".cursor/hooks/bkit-gateguard.cjs": "36d72eb8b8ce4eba0bf12f3404e71a47cca5465a7d8af149f677f5dc5458e31f",
-    ".cursor/hooks/bkit-guardrails.cjs": "555eb1622ac25b1a2900d74a9a6f04b87da5512d8956b2dd0c56ad67bed929fe",
+    ".cursor/hooks/bkit-guardrails.cjs": "20efe5a9db7ad69caefad13294966f50a4af3ff2f1c69319f934cb6e057840fd",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "07484d9552883b162bff74c0835d3ff5695f36ee124db3cd3c8ce0a0b4edbba1",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index 80b8b8b59..7645a0a36 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -506,6 +506,9 @@ function denyRule(c) {
 }
 
 /** Ask tier, non-git — destructive or privileged shell. */
+/** A `bkit tests jump` command, wherever it sits in a chained command. */
+const TESTS_JUMP_RE = /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/;
+
 const ASK_PATTERNS = [
   { re: /\bsudo\b/, what: "sudo" },
   { re: /\bbrew\s+install\b/, what: "brew install" },
@@ -513,7 +516,7 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
-  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
+  { re: TESTS_JUMP_RE, what: "bkit tests jump" },
 ];
 
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
@@ -628,10 +631,10 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
-  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+  if (IS_CODEX_HOOK && (what === "bkit tests jump" || TESTS_JUMP_RE.test(c))) {
     return {
       tier: "deny",
-      what,
+      what: "bkit tests jump",
       fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
     };
   }
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index 41953313f..e2bc299a8 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -498,6 +498,9 @@ function denyRule(c) {
 }
 
 /** Ask tier, non-git — destructive or privileged shell. */
+/** A `bkit tests jump` command, wherever it sits in a chained command. */
+const TESTS_JUMP_RE = /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/;
+
 const ASK_PATTERNS = [
   { re: /\bsudo\b/, what: "sudo" },
   { re: /\bbrew\s+install\b/, what: "brew install" },
@@ -505,7 +508,7 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
-  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
+  { re: TESTS_JUMP_RE, what: "bkit tests jump" },
 ];
 
 /** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
@@ -620,10 +623,10 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
-  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+  if (IS_CODEX_HOOK && (what === "bkit tests jump" || TESTS_JUMP_RE.test(c))) {
     return {
       tier: "deny",
-      what,
+      what: "bkit tests jump",
       fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
     };
   }
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 5c5e5cf78..a3bdb09cd 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -282,3 +282,6 @@
 {"schema":3,"ts":1794392819267,"firstTs":1794392819267,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A waiter with `BKIT_TEST_SLOTS=2` sits idle behind a first-in-line waiter that only uses slot 1, while slot 2 is free, and can give up at its limit","description":"LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:344: A waiter with `BKIT_TEST_SLOTS=2` sits idle behind a first-in-line waiter that only uses slot 1, while slot 2 is free, and can give up at its limit. Done when: the owner decides what \"first in line\" means when waiters on one `tests` queue carry different `BKIT_TEST_SLOTS` values (it is a per-process environment variable, so two hosts or shells can differ): either a later waiter may take a slot beyond the head's slot count, or the mismatch is documented as accepted head-of-line blocking in `.bkit/templates.md` § Machine lock. No agent can settle it, because decision `916-queue-first-in-line-only-tries` says only the head tries, and an exception reopens that decision. Reproduced on this diff: holder (slots 1) holds `tests`, waiter A (slots 1) waits, waiter B (`BKIT_TEST_SLOTS=2`) waits 4 s for the holder to finish although `tests.2.lock` is free; the 6.1.1 copy runs B at once.","source":".bkit/templates/scripts/ci/bkit-machine-lock.sh:344"}
 {"schema":3,"ts":1794392819268,"firstTs":1794392819268,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-266","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death","description":"LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:266: A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death. Done when: The Perl helper's scan (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:254` `$first_line`, `:266` ticket open, `:310` held-place lookup) and `.bkit/core/engine/commands/workflow/tests-jump.ts:24` `firstLine` read only regular, non-symlink files (an `lstat` / `-f` check before the open, or a non-blocking open), so a FIFO or other special file whose name matches `^\\d+\\.\\d{6}-\\d+$`, `.held` or `.jump` is ignored and never unlinked; a waiter with such an entry in `tests.queue/` still runs its command when the lock is free and still exits 75 at its limit; `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template.","source":".bkit/templates/scripts/ci/bkit-machine-lock.sh:266"}
 {"schema":3,"ts":1794392819269,"firstTs":1794392819269,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-skills-lock-json-35","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The skill install step blanked the integrity hash of the permanent `find-skills` skill, so a later change to that agent-instruction content can no longer be told apart from what was reviewed","description":"LOW build challenge finding at skills-lock.json:35: The skill install step blanked the integrity hash of the permanent `find-skills` skill, so a later change to that agent-instruction content can no longer be told apart from what was reviewed. Done when: `skills-lock.json` `skills[\"find-skills\"].computedHash` holds the nonempty hash the skills CLI records for the installed `.agents/skills/find-skills/SKILL.md` (reinstalled with `npx skills add vercel-labs/skills@find-skills -y`, or the base entry restored), so every entry meets `.agents/skills.md` § Install / Update step 2 (\"a nonempty `computedHash`\").","source":"skills-lock.json:35"}
+{"schema":3,"ts":1794467242991,"firstTs":1794467242991,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-34","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The human approves `bkit tests jump build-1` for a run that gave up more than 120 s ago, and the verb exits 0 saying the run moves to the front, although its held place has expired and nothing is waiting","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-jump.ts:34: The human approves `bkit tests jump build-1` for a run that gave up more than 120 s ago, and the verb exits 0 saying the run moves to the front, although its held place has expired and nothing is waiting. Done when: `linesFor` skips a `.held` entry whose mtime is more than 120 s old, the same cut-off the helper's scan uses (`time - $mtime > 120` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`), so a jump naming only an expired held place exits 1 with \"no run named <run> waits for tests\" and writes no marker, as the plan's edge case \"names a run that no waiting ticket or held place carries\" requires; a held place under 120 s old still matches. The marker the verb writes today lingers until some other take scans the queue; when the next contended take is that same run, it jumps the line on a stale approval.","source":".bkit/core/engine/commands/workflow/tests-jump.ts:34"}
+{"schema":3,"ts":1794467242994,"firstTs":1794467242994,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-30","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A regular file sits at `tests.queue` (the same blocked path that makes `run` exit 73), and `bkit tests jump build-1` crashes with \"Unhandled error: ENOTDIR: not a directory, scandir …\" instead of refusing with \"no run named build-1 waits for tests\"","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-jump.ts:30: A regular file sits at `tests.queue` (the same blocked path that makes `run` exit 73), and `bkit tests jump build-1` crashes with \"Unhandled error: ENOTDIR: not a directory, scandir …\" instead of refusing with \"no run named build-1 waits for tests\". Done when: `linesFor` treats a queue path that exists but is not a readable folder as an empty line (for example `fs.statSync(queue, { throwIfNoEntry: false })?.isDirectory()` before `readdirSync`, and a ticket that vanishes or cannot be read between the listing and the read is skipped, not thrown), so the verb exits 1 through `CommandError(EXIT.NO, \"no run named <run> waits for tests\")` and writes nothing; today `fs.existsSync(queue)` is true for the file, `readdirSync` throws, `runCommand` rethrows the non-`CommandError` (`.bkit/core/engine/commands/lib.ts:639`), and `cli.ts` prints `Unhandled error` with no friction row.","source":".bkit/core/engine/commands/workflow/tests-jump.ts:30"}
+{"schema":3,"ts":1794467242995,"firstTs":1794467242995,"updates":1,"kind":"deferral","key":"916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-267","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["916-tests-lock-waiting"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death","description":"LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:267: A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death. Done when: The Perl helper's scan (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:255` `$first_line`, `:267` ticket open, `:311` held-place lookup) and `.bkit/core/engine/commands/workflow/tests-jump.ts:24` `firstLine` read only regular, non-symlink files (an `lstat` / `-f` check before the open, or a non-blocking open), so a FIFO or other special file whose name matches `^\\d+\\.\\d{6}-\\d+$`, `.held` or `.jump` is ignored and never unlinked; a waiter with such an entry in `tests.queue/` still runs its command when the lock is free and still exits 75 at its limit; `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template.","source":".bkit/templates/scripts/ci/bkit-machine-lock.sh:267"}
