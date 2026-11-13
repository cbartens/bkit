diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 5b30e8ef0..f3bd48c34 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -517,8 +517,14 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
+  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
 ];
 
+/** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
+const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
+const HOOK_FILE = typeof __filename === "string" ? __filename : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
   for (const line of commandLines(c)) {
@@ -620,6 +626,13 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
+  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+    return {
+      tier: "deny",
+      what,
+      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
+    };
+  }
   if (what) return { tier: "ask", what };
   const secret = shellSecretRead(c);
   if (secret) return { tier: "secret", path: secret };
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 1c5d5d2df..904c8e4a0 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -373,6 +373,7 @@ Run the deepest declared local gate, or one test file to record a red and audit

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
+| `jump` | by hand | **`--run`** `--checkout` | Move the waiting run named <run> to the front of the tests line; the holder keeps the lock. Every use needs the human's approval, so ask them to approve it; exit 0 moved, 1 no single run matched. |
 | `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 2b63bac31..214ac86cf 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -373,6 +373,7 @@ Run the deepest declared local gate, or one test file to record a red and audit

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
+| `jump` | by hand | **`--run`** `--checkout` | Move the waiting run named <run> to the front of the tests line; the holder keeps the lock. Every use needs the human's approval, so ask them to approve it; exit 0 moved, 1 no single run matched. |
 | `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index 31b6961b8..f42128a62 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
@@ -57,7 +57,7 @@ A host with a subscription has a pinned provider and a flag that takes no value
 
 > **GateGuard needs the `.codex/` layer trusted.** Codex loads project-local hooks only once that layer is trusted. Until then the hook is installed but never fires, so its presence proves nothing. The same holds for `bkit-guardrails.cjs`.
 >
-> **Codex cannot prompt.** It parses `permissionDecision: "ask"` but does not implement it: an ask is recorded as an error, and the call proceeds, so `bkit-guardrails.cjs` blocks the `deny` tier for real and emits the `ask` tier as advisory `additionalContext`. The gate fires and informs, but it cannot stop the command. Every ask-tier command is already prohibited in all five workflow headers, so no bkit workflow reaches one. `.bkit/core/engine/install/modules/index.integration.test.ts` asserts this.
+> **Codex cannot prompt.** It parses `permissionDecision: "ask"` but does not implement it: an ask is recorded as an error, and the call proceeds, so `bkit-guardrails.cjs` blocks the `deny` tier for real and emits the `ask` tier as advisory `additionalContext`. The gate fires and informs, but it cannot stop the command. Every ask-tier command is already prohibited in all five workflow headers, so no bkit workflow reaches one. The exception is `bkit tests jump`, which needs the human's approval: Codex denies it, and the agent asks the human to run it in their own terminal. `.bkit/core/engine/install/modules/index.integration.test.ts` asserts this.
 
 ### Antigravity — installs as a workspace plugin
 
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index c4158eefd..b74e1d22f 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -963,6 +963,8 @@ cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
   - The waiting note names the place in line (`2nd in line`). `try_local_stack_lock` never joins the line and reports busy (`N waiting in line`) while any live ticket exists, even when the lock is free.
   - A waiter stopped (for example with `SIGSTOP`) while first in line holds the line: `ls` the queue folder to see who is first.
   - A queue folder that cannot be created, or a ticket that cannot be written, refuses the take with the queue path (`run` exits 73).
+  - `bkit tests jump <run>` moves one waiting run to the front of the `tests` line by writing a `<ms>.jump` marker in `tests.queue/`; the holder keeps the lock, the newest jump goes first, and the marker goes when that run takes the lock or no waiting run matches it. `--checkout <path>` picks one when several runs share the name. Every use needs the human's approval (a host `ask`; denied on Codex, which cannot ask), so an agent cannot approve its own jump.
+  - `bkit upgrade` replaces an unedited copy of `scripts/ci/bkit-machine-lock.sh` from a shipped 6.1.x release with the queued template; an edited copy is left alone.
 - `CI=true` / `CI=1` makes every lock a no-op.
 - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` and their run name to a wrapped gate; a tests-lock give-up of this run maps 75 → 81 with `lockHolder`, and a tests-lock refusal maps 73 → 4. A lock wait writes no `test-run` status row. Light runs (`red`, `green`, `bkit:test:file`) take no tests lock. Nested wraps reuse their live parent's tests lock. See `docs/testing.md` § Tests lock for host wait budgets.
 - Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 057731abb..24d2ce8ca 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1431,7 +1431,7 @@ Without `acceptEdits` / a wildcard allow surface, every `Bash`, `Edit`, `Write`,

<!-- prettier-ignore -->
 | Bucket | Patterns | Purpose |
 | --- | --- | --- |
 | `allow` | `Bash(*)`, `Skill(*)`, `WebSearch`, `mcp__github__*`, `mcp__linear__*` (the `linear` server in `.mcp.json`), `mcp__jira__*` (the `jira` server), `Bash(git push --force-with-lease:*)`, `Read(./.env.example)`, `Read(./\*\*/.env.example)`, `WebFetch(domain:…)` per host in the network allowlist (apex + `*.` wildcard) | Blanket-allow shell, skills, tracker MCP, scoped web fetch. Claude evaluates `deny`, then `ask`, then `allow`: an `allow` row never overrides a matching `ask` or `deny`. `--force-with-lease` passes because no `deny` row matches it, not because of its `allow` row; the `.env.example` rows never fire, since `Read(./.env.*)` asks first. Session-conditional: bucket needs workspace trust; `Bash(*)` dropped in auto mode (§ Cloud sessions). |
-| `ask` | `sudo:*`, `brew install:*`, `(pnpm / npm / bun) publish:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`; git: `git reset --hard:*`, `git reset \*--hard\*`, `git -\* reset \*--hard\*`, `git clean -fd(x):*`, `git clean -\*f\*`, `git filter-branch:*`, `git checkout -- .:*`, `git checkout \*.`, `git checkout \* . \*`, `git restore .:*`, `git restore \*.`, `git restore \* . \*`, `git stash drop:*`, `git stash clear:*`, `git rebase -i:*`, `git rebase \* -i( \*)`, `git rebase \*--interactive\*`, `git \* --no-verify( \*)`, `git commit -n\*`, `git commit \* -n( \*)`; `Read(./.env)`, `Read(./.env.\*)`, `Read(./\*\*/.env)`, `Read(./\*\*/.env.\*)`, `Read(./.bkit/.env)` | Per-call human confirmation for destructive ops, hook-skipping commits / pushes and secret reads. The `\*` globs catch the same git commands with flags in another order (`git reset -q --hard`, `git clean -df`); a git global option before the subcommand (`git -C dir reset --hard`) is not matched. The `.env` rows are globs, not an enumeration of known filenames, because an enumeration silently drops `.env.ci` / `.env.preview` / anything a consumer invents into `defaultMode`. The recursive `./**/` forms cover monorepo `apps/*` and `packages/*`. Shell reads of secret files (`cat .env`) carry no `Bash(...)` row: a command-text glob cannot tell a read from a mention. |
+| `ask` | `sudo:*`, `brew install:*`, `(pnpm / npm / bun) publish:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`; git: `git reset --hard:*`, `git reset \*--hard\*`, `git -\* reset \*--hard\*`, `git clean -fd(x):*`, `git clean -\*f\*`, `git filter-branch:*`, `git checkout -- .:*`, `git checkout \*.`, `git checkout \* . \*`, `git restore .:*`, `git restore \*.`, `git restore \* . \*`, `git stash drop:*`, `git stash clear:*`, `git rebase -i:*`, `git rebase \* -i( \*)`, `git rebase \*--interactive\*`, `git \* --no-verify( \*)`, `git commit -n\*`, `git commit \* -n( \*)`, `\*bkit\*tests jump\*`, `\*cli.js tests jump\*`, `\*cli.ts tests jump\*`; `Read(./.env)`, `Read(./.env.\*)`, `Read(./\*\*/.env)`, `Read(./\*\*/.env.\*)`, `Read(./.bkit/.env)` | Per-call human confirmation for destructive ops, hook-skipping commits / pushes and secret reads. The `\*` globs catch the same git commands with flags in another order (`git reset -q --hard`, `git clean -df`); a git global option before the subcommand (`git -C dir reset --hard`) is not matched. The `.env` rows are globs, not an enumeration of known filenames, because an enumeration silently drops `.env.ci` / `.env.preview` / anything a consumer invents into `defaultMode`. The recursive `./**/` forms cover monorepo `apps/*` and `packages/*`. Shell reads of secret files (`cat .env`) carry no `Bash(...)` row: a command-text glob cannot tell a read from a mention. |
 | `deny` | `Bash(rm -rf /\*)`, `Bash(rm -rf ~/\*)`, `Bash(rm -rf $HOME/\*)`, `Bash(chmod -R 777 /:*)`, `Bash(git push --force)`, `Bash(git push --force \*)`, `Bash(git push -f)`, `Bash(git push -f \*)`, `Bash(git push -f\*)`, `Bash(git push \* --force)`, `Bash(git push \* --force \*)`, `Bash(git push \* -f\*)`, `Bash(git push \* +\*)`, `Read(./\*\*/\*.pem)`, `Read(./\*\*/\*.p12)`, `Read(./\*\*/id_rsa)` | Hard-block catastrophic deletes, force-push and private-key reads. Force-push is denied as `--force`, `-f` / an `-f…` cluster, or a `+refspec`, in any argument position. No row is a `--force` prefix: `--force:*` and `--force*` also match `--force-with-lease` and would deny the allowed form. |
 
 Shell `curl` / `wget` are not on the Claude `ask` list. They run under `Bash(*)`, with `deny`, the auto-mode classifier, and the advisory `.claude/hooks/bkit-guardrails.cjs` (PreToolUse, matcher `Bash`) as the backstops. Claude rules match a command prefix, not a URL host, so per-domain allows are inexpressible and the only options are blanket-ask or blanket-allow; blanket-ask forces a prompt on every shell fetch in every mode (a content-scoped `ask` is evaluated before the classifier and beats a matching `allow`), which a cloud session has nobody to answer. `WebFetch(domain:…)` governs the `WebFetch` tool only, never `curl` in `Bash`. Cursor gates by parsed URL host (`bkit-guardrails.cjs`), OpenCode via `curl https://{host}/*` allows layered after a `curl *` ask (command-string glob: trailing flags or extra URLs still match, so it narrows rather than blocks). All four run an allowlisted-host fetch unprompted; on an undeclared host Cursor and OpenCode ask, Claude and Codex emit an advisory instead (Claude to avoid re-adding the prompt, Codex because it cannot prompt).
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
index e3d8f8353..0fc57ef5d 100644
--- a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -1118,6 +1118,24 @@ function readLines(file: string): string[] {
     : [];
 }
 
+/** Plants `<ms>.jump` in the queue, carrying the first line of the live ticket (or held place) of `who`. */
+function plantJump(queue: string, who: string, at = Date.now()): string {
+  let source: string | undefined;
+  for (const name of ticketsIn(queue)) {
+    const file = path.join(queue, name);
+    try {
+      if (fs.readFileSync(file, "utf-8").startsWith(who + " — ")) source = file;
+    } catch {
+      continue;
+    }
+  }
+  source ??= heldPlaceFor(queue, who);
+  const line = fs.readFileSync(source, "utf-8").split("\n")[0]!;
+  const marker = path.join(queue, at + ".jump");
+  fs.writeFileSync(marker, line + "\n");
+  return marker;
+}
+
 /** A run wrapper: `bash <script> run <who> [--lock name] -- <command>`, output captured. */
 function wrapped(
   who: string,
@@ -1481,4 +1499,64 @@ describe("machine lock waiting order", { timeout: BUDGET.testTimeout }, () => {
     await expectAllExit([y, again]);
     expect(readLines(order)).toEqual(["y", "x"]);
   });
+
+  it("a jump marker moves its waiting run to the front of the line", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const waiters = [];
+    for (const who of ["w1", "w2", "w3", "w4"]) {
+      waiters.push(await queuedWaiter(who, env, order, "tests"));
+    }
+    plantJump(queueOf("tests"), "w4");
+    holder.release();
+    await expectAllExit(waiters);
+    expect(readLines(order)).toEqual(["w4", "w1", "w2", "w3"]);
+  });
+
+  it("the newest jump marker goes first", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const waiters = [];
+    for (const who of ["w1", "w2", "w3"]) {
+      waiters.push(await queuedWaiter(who, env, order, "tests"));
+    }
+    plantJump(queueOf("tests"), "w2", Date.now() - 5000);
+    plantJump(queueOf("tests"), "w3", Date.now());
+    holder.release();
+    await expectAllExit(waiters);
+    expect(readLines(order)).toEqual(["w3", "w2", "w1"]);
+  });
+
+  it("a jump marker that matches no waiting run is deleted", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const queue = queueOf("tests");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const marker = path.join(queue, Date.now() + ".jump");
+    fs.writeFileSync(marker, "ghost — /nowhere/ghost\n");
+    await expect.poll(() => fs.existsSync(marker), { timeout: BUDGET.hookTimeout }).toBe(false);
+    holder.release();
+    await expectAllExit([w1]);
+    expect(readLines(order)).toEqual(["w1"]);
+  });
+
+  it("a jumped run that gives up and asks again within 120 s keeps the front", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const queue = queueOf("tests");
+    const holder = await queueHolder(env, "tests");
+    const z = await queuedWaiter("z", env, order, "tests");
+    const first = await queuedWaiter("x", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
+    const y = await queuedWaiter("y", env, order, "tests");
+    plantJump(queue, "x");
+    expect((await first.done).status).toBe(75);
+    await waitForHeldPlace(queue, "x");
+    const again = await queuedWaiter("x", env, order, "tests");
+    holder.release();
+    await expectAllExit([z, y, again]);
+    expect(readLines(order)).toEqual(["x", "z", "y"]);
+  });
 });
diff --git a/.bkit/core/engine/commands/conventions.test.ts b/.bkit/core/engine/commands/conventions.test.ts
index ad6187293..37697e2d2 100644
--- a/.bkit/core/engine/commands/conventions.test.ts
+++ b/.bkit/core/engine/commands/conventions.test.ts
@@ -172,6 +172,8 @@ const HELPER_SOURCES = new Set([
   path.join("commands", "workflow", "test-blocks.ts"),
   // The `tests changed` verb, registered on `bkit tests` in tests.ts.
   path.join("commands", "workflow", "tests-changed.ts"),
+  // The `tests jump` verb, registered on `bkit tests` in tests.ts.
+  path.join("commands", "workflow", "tests-jump.ts"),
   // The pinned-checksum check behind `ci pins`.
   path.join("commands", "ci", "pins.ts"),
   // Committed-tree gate receipts used by `ci push-gate`.
diff --git a/.bkit/core/engine/commands/workflow/tests-jump.test.ts b/.bkit/core/engine/commands/workflow/tests-jump.test.ts
new file mode 100644
index 000000000..45401c68f
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tests-jump.test.ts
@@ -0,0 +1,65 @@
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { runCommand } from "../lib";
+import { testsCommand } from "./tests";
+
+let cache: string;
+let queue: string;
+const saved = process.env.XDG_CACHE_HOME;
+
+beforeEach(() => {
+  cache = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-jump-")));
+  queue = path.join(cache, "bkit", "machine-lock", "tests.queue");
+  process.env.XDG_CACHE_HOME = cache;
+});
+
+afterEach(() => {
+  if (saved === undefined) delete process.env.XDG_CACHE_HOME;
+  else process.env.XDG_CACHE_HOME = saved;
+  fs.rmSync(cache, { recursive: true, force: true });
+});
+
+async function jump(args: string[]): Promise<{ code: number; err: string }> {
+  const err: string[] = [];
+  const code = await runCommand(["tests", "jump", ...args], [testsCommand], {
+    io: { stdout: () => undefined, stderr: (t) => err.push(t) },
+  });
+  return { code, err: err.join("") };
+}
+
+const markers = () =>
+  fs.existsSync(queue) ? fs.readdirSync(queue).filter((n) => n.endsWith(".jump")) : [];
+
+describe("bkit tests jump", () => {
+  it("refuses without a queue folder, and creates none", async () => {
+    const res = await jump(["build-1"]);
+    expect(res.code).toBe(1);
+    expect(res.err).toContain("no run named build-1 waits for tests");
+    expect(fs.existsSync(queue)).toBe(false);
+  });
+
+  it("writes one marker holding the run's line, from a ticket or a held place", async () => {
+    fs.mkdirSync(queue, { recursive: true });
+    fs.writeFileSync(path.join(queue, "1.000001-11.held"), "build-1 — /co/a\n");
+    const res = await jump(["build-1"]);
+    expect(res.code).toBe(0);
+    const [marker] = markers();
+    expect(fs.readFileSync(path.join(queue, marker!), "utf-8")).toBe("build-1 — /co/a\n");
+  });
+
+  it("asks for --checkout when two checkouts share the name, then picks one", async () => {
+    fs.mkdirSync(queue, { recursive: true });
+    fs.writeFileSync(path.join(queue, "1.000001-11"), "build-1 — /co/a\n");
+    fs.writeFileSync(path.join(queue, "1.000002-12"), "build-1 — /co/b\n");
+    const refused = await jump(["build-1"]);
+    expect(refused.code).toBe(1);
+    expect(refused.err).toContain("pass --checkout");
+    expect(markers()).toEqual([]);
+    expect((await jump(["build-1", "--checkout", "/co/b"])).code).toBe(0);
+    expect(fs.readFileSync(path.join(queue, markers()[0]!), "utf-8")).toBe("build-1 — /co/b\n");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests-jump.ts b/.bkit/core/engine/commands/workflow/tests-jump.ts
new file mode 100644
index 000000000..782145274
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tests-jump.ts
@@ -0,0 +1,95 @@
+// commands/workflow/tests-jump.ts — `bkit tests jump <run>`: move one waiting run to the front
+// of the tests line.
+//
+// The verb writes a `<ms>.jump` marker into `tests.queue` beside the lock file, holding the
+// `<who> — <checkout>` line of the run. The lock's waiting helpers sort a ticket carrying that
+// line first and delete the marker once the run has the lock. The verb never touches the lock,
+// the holder file or a slot file, so the current holder keeps the lock.
+
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { CommandError, EXIT, type VerbSpec } from "../lib.js";
+
+/** The `tests` lock's queue folder: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/tests.queue`. */
+function testsQueueDir(): string {
+  const cache = process.env.XDG_CACHE_HOME || path.join(process.env.HOME || os.homedir(), ".cache");
+  return path.join(cache, "bkit", "machine-lock", "tests.queue");
+}
+
+/** First line of a file, or null when it cannot be read or is empty. */
+function firstLine(file: string): string | null {
+  try {
+    const line = fs.readFileSync(file, "utf-8").split("\n")[0]!;
+    return line === "" ? null : line;
+  } catch {
+    return null;
+  }
+}
+
+/** The distinct lines of tickets and held places in `queue` whose run name is `run`. */
+function linesFor(queue: string, run: string): string[] {
+  let names: string[];
+  try {
+    names = fs.readdirSync(queue);
+  } catch {
+    return [];
+  }
+  const lines = new Set<string>();
+  for (const name of names) {
+    if (!/^\d+\.\d{6}-\d+(\.held)?$/.test(name)) continue;
+    const line = firstLine(path.join(queue, name));
+    if (line?.startsWith(`${run} — `)) lines.add(line);
+  }
+  return [...lines].sort();
+}
+
+export const testsJumpVerb: VerbSpec = {
+  summary:
+    "Move the waiting run named <run> to the front of the tests line; the holder keeps the lock. Every use needs the human's approval, so ask them to approve it; exit 0 moved, 1 no single run matched.",
+  use: "by-hand",
+  flags: [
+    {
+      name: "run",
+      type: "string",
+      positional: true,
+      required: true,
+      help: "the waiting run's name, as the waiting note prints it",
+    },
+    {
+      name: "checkout",
+      type: "string",
+      help: "the waiting run's checkout path, to pick one when several runs share the name",
+    },
+  ],
+  output: {
+    run: "the run name moved to the front",
+    checkout: "the checkout path of the run moved",
+    marker: "the jump marker file written",
+  },
+  run: (ctx) => {
+    const run = String(ctx.flags.run);
+    const wanted = typeof ctx.flags.checkout === "string" ? ctx.flags.checkout : undefined;
+    const queue = testsQueueDir();
+    let matches = linesFor(queue, run);
+    if (wanted !== undefined) matches = matches.filter((line) => line === `${run} — ${wanted}`);
+    if (matches.length === 0) {
+      throw new CommandError(EXIT.NO, `no run named ${run} waits for tests`);
+    }
+    if (matches.length > 1) {
+      throw new CommandError(
+        EXIT.NO,
+        `several runs named ${run} wait for tests:\n${matches.map((line) => `  ${line}`).join("\n")}\npass --checkout <path> to pick one`,
+      );
+    }
+    const line = matches[0]!;
+    const marker = path.join(queue, `${Date.now()}.jump`);
+    const temp = path.join(queue, `.jump.${process.pid}.tmp`);
+    fs.writeFileSync(temp, `${line}\n`);
+    fs.renameSync(temp, marker);
+    ctx.log(`${run} moves to the front of the tests line`);
+    ctx.emit({ run, checkout: line.slice(`${run} — `.length), marker });
+    return EXIT.OK;
+  },
+};
diff --git a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
index 6f240d728..27127c519 100644
--- a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
@@ -480,3 +480,91 @@ describe("tests lock through a consumer's wrapped gate", () => {
     );
   });
 });
+
+const queueDir = () => path.join(cache, "bkit", "machine-lock", "tests.queue");
+const jumpMarkers = () =>
+  fs.existsSync(queueDir()) ? fs.readdirSync(queueDir()).filter((n) => n.endsWith(".jump")) : [];
+
+/** Waits until a ticket in the tests queue contains `text`. */
+async function waitForQueued(text: string): Promise<void> {
+  const queued = () =>
+    fs.existsSync(queueDir()) &&
+    fs.readdirSync(queueDir()).some((name) => {
+      try {
+        return fs.readFileSync(path.join(queueDir(), name), "utf-8").includes(text);
+      } catch {
+        return false;
+      }
+    });
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (!queued() && Date.now() < until) await delay(20);
+  expect(queued()).toBe(true);
+}
+
+describe("bkit tests jump", () => {
+  const whoOf = (fid: string) => `bkit tests run ${GATE} ${fid} gate`;
+  const waiterArgs = (fid: string) => [
+    ...runArgs(`logs/${fid}.md`),
+    "--lock-wait-s=30",
+    `--fid=${fid}`,
+    "--step=gate",
+  ];
+
+  it("tests jump moves a waiting run to the front of the tests line", async () => {
+    const holder = await hold();
+    const runs = [];
+    for (const fid of ["a", "b", "c"]) {
+      runs.push(start(waiterArgs(fid), { GATE_ID: fid }));
+      await waitForFile(path.join(cwd, `logs/${fid}.md`), "waiting for tests", runs.at(-1)!.child);
+      await waitForQueued(` ${fid} gate`);
+    }
+    const jump = execute(["jump", whoOf("c")]);
+    expect(jump.status, jump.stderr).toBe(0);
+    expect(jumpMarkers()).toHaveLength(1);
+    expect(events()).toEqual([]);
+    const releasedAt = Date.now();
+    holder.child.kill("SIGTERM");
+    await holder.done;
+    const results = await Promise.all(runs.map((run) => run.done));
+    expect(results.map((result) => result.status)).toEqual([0, 0, 0]);
+    const starts = events().filter((event) => event.event === "start");
+    expect(starts.map((event) => event.id)).toEqual(["c", "a", "b"]);
+    expect(starts[0]!.at).toBeGreaterThanOrEqual(releasedAt);
+  });
+
+  it("tests jump refuses a run name no waiting run carries", async () => {
+    const holder = await hold();
+    const run = start(waiterArgs("a"), { GATE_ID: "a" });
+    await waitForFile(path.join(cwd, "logs/a.md"), "waiting for tests", run.child);
+    const jump = execute(["jump", "nobody-by-that-name"]);
+    expect(jump.status, jump.stderr).toBe(1);
+    expect(jump.stdout + jump.stderr).toContain("no run named nobody-by-that-name waits for tests");
+    expect(jumpMarkers()).toEqual([]);
+    holder.child.kill("SIGTERM");
+    await holder.done;
+    expect((await run.done).status).toBe(0);
+  });
+
+  it("tests jump refuses a run name two waiting runs share", async () => {
+    const holder = await hold();
+    fs.mkdirSync(queueDir(), { recursive: true });
+    const shared = "shared gate run";
+    fs.writeFileSync(
+      path.join(queueDir(), `${Date.now()}.000001-${process.pid}`),
+      `${shared} — /checkouts/one\n`,
+    );
+    fs.writeFileSync(
+      path.join(queueDir(), `${Date.now()}.000002-${holder.child.pid}`),
+      `${shared} — /checkouts/two\n`,
+    );
+    const jump = execute(["jump", shared]);
+    expect(jump.status, jump.stderr).toBe(1);
+    const text = jump.stdout + jump.stderr;
+    expect(text).toContain("/checkouts/one");
+    expect(text).toContain("/checkouts/two");
+    expect(text).toContain("pass --checkout");
+    expect(jumpMarkers()).toEqual([]);
+    holder.child.kill("SIGTERM");
+    await holder.done;
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 58b208059..2dd0b82d0 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -70,6 +70,7 @@ import {
 import { writeStepRow } from "./steps.js";
 import { appendRecord, clampFile, type ClampRecord } from "./context.js";
 import { testsChangedVerb } from "./tests-changed.js";
+import { testsJumpVerb } from "./tests-jump.js";
 
 /** Exit code: no candidate gate is declared in package.json. */
 export const EXIT_NO_GATE = 3;
@@ -1625,6 +1626,7 @@ export const testsCommand: CommandSpec = {
     "Run the deepest declared local gate, or one test file to record a red and audit a green.",
   verbs: {
     changed: testsChangedVerb,
+    jump: testsJumpVerb,
     run: {
       summary:
         "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index e25577171..7150e5593 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -806,6 +806,41 @@ describe("permissions-parity", () => {
     }
   });
 
+  describe("bkit tests jump needs the human's approval", () => {
+    /** Every host's verdict for one command: ask where the host can ask, deny on Codex. */
+    function jumpVerdicts(cmd: string): Record<string, Verdict> {
+      return {
+        claude: claudeShellVerdict(cmd),
+        opencode: opencodeVerdict("bash", cmd),
+        cursor: cursorVerdict({ command: cmd }),
+        antigravity: antigravityShellVerdict(cmd),
+        codex: codexVerdict(cmd),
+      };
+    }
+    const EXPECTED: Record<string, Verdict> = {
+      claude: "ask",
+      opencode: "ask",
+      cursor: "ask",
+      antigravity: "ask",
+      codex: "deny",
+    };
+
+    it("bkit tests jump asks the human on claude, opencode, cursor and antigravity and is denied on codex", () => {
+      expect(jumpVerdicts("bkit tests jump build-1")).toEqual(EXPECTED);
+    });
+
+    it("path-prefixed bkit tests jump forms get the same verdicts on every host", () => {
+      for (const cmd of [
+        '"/repo/node_modules/.bin/bkit" tests jump build-1',
+        "pnpm bkit tests jump build-1",
+        "node dist/cli.js tests jump build-1",
+        "pnpm tsx .bkit/core/engine/cli.ts tests jump build-1",
+      ]) {
+        expect({ cmd, verdicts: jumpVerdicts(cmd) }).toEqual({ cmd, verdicts: EXPECTED });
+      }
+    });
+  });
+
   describe("shell reads of secret files — script hosts gate, permission tables do not", () => {
     for (const g of SHELL_SECRET_READS) {
       it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — cursor/codex/antigravity; claude/opencode Bash rows allow`, () => {
diff --git a/.bkit/core/hooks/guardrails-tiers.js b/.bkit/core/hooks/guardrails-tiers.js
index 1d13637d4..d770650f1 100644
--- a/.bkit/core/hooks/guardrails-tiers.js
+++ b/.bkit/core/hooks/guardrails-tiers.js
@@ -173,8 +173,14 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
+  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
 ];
 
+/** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
+const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
+const HOOK_FILE = typeof __filename === "string" ? __filename : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
   for (const line of commandLines(c)) {
@@ -276,6 +282,13 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
+  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+    return {
+      tier: "deny",
+      what,
+      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
+    };
+  }
   if (what) return { tier: "ask", what };
   const secret = shellSecretRead(c);
   if (secret) return { tier: "secret", path: secret };
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 3e60c923a..f4151723c 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -8895,6 +8895,17 @@ Ask the user to supply what you need without putting the key in this conversatio
 Blocked by bkit Codex guardrails: ${v.what}. ${v.fix}
 ```
 
+### guardrails-codex-tests-jump
+
+- hook: Guardrails
+- fires: `bkit tests jump` on Codex, as the fix text of a deny
+- hosts: Codex
+- source: `.bkit/core/hooks/guardrails-tiers.js` `classifyShell`
+
+```text
+Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.
+```
+
 ### guardrails-codex-ask
 
 - hook: Guardrails
@@ -9144,6 +9155,17 @@ Bash(npm publish:*)
 Bash(bun publish:*)
 ```
 
+### ask-tests-jump
+
+- tier: ask
+- count: 3
+
+```text
+Bash(*bkit*tests jump*)
+Bash(*cli.js tests jump*)
+Bash(*cli.ts tests jump*)
+```
+
 ### ask-gh-destructive
 
 - tier: ask
@@ -9313,7 +9335,10 @@ WebSearch
     "git push* -4f*": "deny",
     "git -* push* -4f*": "deny",
     "git push* -6f*": "deny",
-    "git -* push* -6f*": "deny"
+    "git -* push* -6f*": "deny",
+    "*bkit*tests jump*": "ask",
+    "*cli.js tests jump*": "ask",
+    "*cli.ts tests jump*": "ask"
   }
 }
 ```
diff --git a/.bkit/providers.md b/.bkit/providers.md
index e73c7e46a..858990ad6 100644
--- a/.bkit/providers.md
+++ b/.bkit/providers.md
@@ -57,7 +57,7 @@ A host with a subscription has a pinned provider and a flag that takes no value
 
 > **GateGuard needs the `.codex/` layer trusted.** Codex loads project-local hooks only once that layer is trusted. Until then the hook is installed but never fires, so its presence proves nothing. The same holds for `bkit-guardrails.cjs`.
 >
-> **Codex cannot prompt.** It parses `permissionDecision: "ask"` but does not implement it: an ask is recorded as an error, and the call proceeds, so `bkit-guardrails.cjs` blocks the `deny` tier for real and emits the `ask` tier as advisory `additionalContext`. The gate fires and informs, but it cannot stop the command. Every ask-tier command is already prohibited in all five workflow headers, so no bkit workflow reaches one. `.bkit/core/engine/install/modules/index.integration.test.ts` asserts this.
+> **Codex cannot prompt.** It parses `permissionDecision: "ask"` but does not implement it: an ask is recorded as an error, and the call proceeds, so `bkit-guardrails.cjs` blocks the `deny` tier for real and emits the `ask` tier as advisory `additionalContext`. The gate fires and informs, but it cannot stop the command. Every ask-tier command is already prohibited in all five workflow headers, so no bkit workflow reaches one. The exception is `bkit tests jump`, which needs the human's approval: Codex denies it, and the agent asks the human to run it in their own terminal. `.bkit/core/engine/install/modules/index.integration.test.ts` asserts this.
 
 ### Antigravity — installs as a workspace plugin
 
diff --git a/.bkit/shared/.claude/settings.json b/.bkit/shared/.claude/settings.json
index b3aaccbc4..f24cff5b0 100644
--- a/.bkit/shared/.claude/settings.json
+++ b/.bkit/shared/.claude/settings.json
@@ -95,6 +95,9 @@
       "Bash(git commit -n*)",
       "Bash(git commit * -n)",
       "Bash(git commit * -n *)",
+      "Bash(*bkit*tests jump*)",
+      "Bash(*cli.js tests jump*)",
+      "Bash(*cli.ts tests jump*)",
       "Read(./.env)",
       "Read(./.env.*)",
       "Read(./**/.env)",
diff --git a/.bkit/shared/.opencode/opencode.json b/.bkit/shared/.opencode/opencode.json
index a54b0bd80..e1d9af40d 100644
--- a/.bkit/shared/.opencode/opencode.json
+++ b/.bkit/shared/.opencode/opencode.json
@@ -95,7 +95,10 @@
       "git push* -4f*": "deny",
       "git -* push* -4f*": "deny",
       "git push* -6f*": "deny",
-      "git -* push* -6f*": "deny"
+      "git -* push* -6f*": "deny",
+      "*bkit*tests jump*": "ask",
+      "*cli.js tests jump*": "ask",
+      "*cli.ts tests jump*": "ask"
     }
   },
   "mcp": {
diff --git a/.bkit/shared/docs/testing.md b/.bkit/shared/docs/testing.md
index 71d557510..33b91ee16 100644
--- a/.bkit/shared/docs/testing.md
+++ b/.bkit/shared/docs/testing.md
@@ -326,6 +326,7 @@ Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bki
 - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
 - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
 - The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands); a re-run within 120 seconds keeps its place in line.
+- The human can move a waiting gate to the front of the line with `bkit tests jump <run>`; every use needs their approval.
 - The script defaults to 60 seconds without a TTY when no wait is set. Waiting runs take the lock in arrival order, and waiting notes name the holders, their checkouts' earlier run times and the run's place in line.
 
 ## JUnit reports for bkit
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 38cbc1303..cc49bb685 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -963,6 +963,8 @@ cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
   - The waiting note names the place in line (`2nd in line`). `try_local_stack_lock` never joins the line and reports busy (`N waiting in line`) while any live ticket exists, even when the lock is free.
   - A waiter stopped (for example with `SIGSTOP`) while first in line holds the line: `ls` the queue folder to see who is first.
   - A queue folder that cannot be created, or a ticket that cannot be written, refuses the take with the queue path (`run` exits 73).
+  - `bkit tests jump <run>` moves one waiting run to the front of the `tests` line by writing a `<ms>.jump` marker in `tests.queue/`; the holder keeps the lock, the newest jump goes first, and the marker goes when that run takes the lock or no waiting run matches it. `--checkout <path>` picks one when several runs share the name. Every use needs the human's approval (a host `ask`; denied on Codex, which cannot ask), so an agent cannot approve its own jump.
+  - `bkit upgrade` replaces an unedited copy of `scripts/ci/bkit-machine-lock.sh` from a shipped 6.1.x release with the queued template; an edited copy is left alone.
 - `CI=true` / `CI=1` makes every lock a no-op.
 - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` and their run name to a wrapped gate; a tests-lock give-up of this run maps 75 → 81 with `lockHolder`, and a tests-lock refusal maps 73 → 4. A lock wait writes no `test-run` status row. Light runs (`red`, `green`, `bkit:test:file`) take no tests lock. Nested wraps reuse their live parent's tests lock. See `docs/testing.md` § Tests lock for host wait budgets.
 - Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
index 43647b1f7..02f8add82 100644
--- a/.bkit/templates/scripts/ci/bkit-machine-lock.sh
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -37,6 +37,8 @@
 # folder beside its lock file, flock-held while it waits, and only the first live ticket tries
 # the lock. A ticket of a dead waiter is skipped and removed. A waiter that gives up leaves its
 # ticket as <ticket>.held for 120s, so the same run asking again keeps its place in line.
+# A <ms>.jump marker in the queue (written by bkit tests jump) moves the waiter whose line it names to
+# the front, newest marker first; the holder keeps the lock. The waiter's own markers go when it takes the lock.
 # A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
 # Requires Bash 3.2+ and /usr/bin/perl.
 
@@ -243,25 +245,54 @@ _local_stack_lock() {
       my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
       return "$n$suffix";
     };
-    # Live tickets sorted by arrival; dead tickets (flock can be taken) and held places older than
-    # 120s are removed; every other name is left alone. Returns (our place, live tickets).
+    # Live tickets sorted by arrival, except that a ticket whose line a <ms>.jump marker names goes
+    # first (newest marker first); dead tickets (flock can be taken), held places older than 120s and
+    # markers naming no live ticket or held place are removed; every other name is left alone.
+    # Returns (our place, live tickets).
+    my $first_line = sub {
+      my $path = shift;
+      open(my $fh, "<", $path) or return undef;
+      my $first = <$fh>; close $fh;
+      return undef unless defined $first;
+      chomp $first;
+      return $first;
+    };
     my $scan = sub {
-      my @live;
+      my (@live, @markers, %known);
       opendir(my $dir, $queue) or return (0, 0);
       for my $entry (readdir $dir) {
         if ($entry =~ /^(\d+)\.(\d{6})-(\d+)$/) {
-          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$1, $2, $3, 1]; next }
+          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$1, $2, $3, 1, $first_line->("$queue/$entry")]; next }
           if (open(my $t, "<", "$queue/$entry")) {
-            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else { push @live, [$1, $2, $3, 0] }
+            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else {
+              my $first = <$t>;
+              if (defined $first) { chomp $first }
+              push @live, [$1, $2, $3, 0, $first];
+            }
             close $t;
           }
         } elsif ($entry =~ /^\d+\.\d{6}-\d+\.held$/) {
           my $mtime = (stat "$queue/$entry")[9];
-          unlink "$queue/$entry" if defined $mtime && time - $mtime > 120;
+          if (defined $mtime && time - $mtime > 120) { unlink "$queue/$entry" }
+          else { my $first = $first_line->("$queue/$entry"); $known{$first} = 1 if defined $first }
+        } elsif ($entry =~ /^(\d+)\.jump$/) {
+          push @markers, [$1, $entry, $first_line->("$queue/$entry")];
         }
       }
       closedir $dir;
-      @live = sort { $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2] } @live;
+      $known{$_->[4]} = 1 for grep { defined $_->[4] } @live;
+      my %front;
+      for my $m (@markers) {
+        if (!defined $m->[2] || !$known{$m->[2]}) { unlink "$queue/$m->[1]"; next }
+        $front{$m->[2]} = $m->[0] if !defined $front{$m->[2]} || $m->[0] > $front{$m->[2]};
+      }
+      my $rank = sub { my $f = defined $_[0][4] ? $front{$_[0][4]} : undef; return $f };
+      @live = sort {
+        my ($fa, $fb) = ($rank->($a), $rank->($b));
+        (defined $fa ? 0 : 1) <=> (defined $fb ? 0 : 1)
+          || (defined $fa ? $fb <=> $fa : 0)
+          || $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2]
+      } @live;
       my $place = 0;
       for my $i (0 .. $#live) { $place = $i + 1 if $live[$i][3] }
       return ($place, scalar @live);
@@ -339,6 +370,15 @@ _local_stack_lock() {
       select(undef, undef, undef, 0.1);
     }
     if (defined $ticket) { unlink $ticket; $ticket = undef }
+    if ($mode ne "try" && opendir(my $mdir, $queue)) {
+      my $mine = "$who — $checkout";
+      for my $entry (readdir $mdir) {
+        next unless $entry =~ /^\d+\.jump$/;
+        my $first = $first_line->("$queue/$entry");
+        unlink "$queue/$entry" if defined $first && $first eq $mine;
+      }
+      closedir $mdir;
+    }
     my $stopping = 0;
     $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { $stopping = 1 };
     my $held_since = time;
diff --git a/.bkit/version b/.bkit/version
index 84b99e746..db82129b8 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,8 +3,8 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "549e1e6975a340832fa8b0a6137c560ef14d6d0037f0f3da3446612a9f91e4b0",
-    "docs/testing.md": "51a47ac89a57d060832ed2a15b5408c47a1ea33fdd6c3bfedddb72c250415d25",
-    ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
+    "docs/testing.md": "11a48171e2be04881b65460e049b4f85f8cd3056bfb3cddc0882a5062a5c97c3",
+    ".claude/settings.json": "aa0ce6387261bef2bdcc663c3f1553bf0dee001974056b07d5611a670ade6053",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "857b24f8b0b95179be374a25b5886cef857068902ba901b95e4988ddbf50a93e",
     ".agents/skills.md": "71dc53bcab370fbe1aacc3239edc3395e3cf9ff9f507c9cda49669846cf7f14b",
@@ -21,7 +21,7 @@
     "docs/architecture.md": "5d7aabba933c0df8ffc9621b8614707ede6ee5a162327ca76830018a1f567bce",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
-    ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
+    ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
     ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
     ".claude/commands/bkit-build.md": "1436b48b64650f41b2afb0aa6a4f2c8f1356cbd79b7ca22c4f8d40d5e7fc7f72",
@@ -215,25 +215,25 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "55509636caed7293659d97f6939af8bb4e36a35bd4c82b9f79e7613f887ffccc",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
-    ".bkit/templates.md": "dfce696027fa87b1c1c8bda4b03df07242e90153351ddb9946810945234bf0a9",
+    ".bkit/templates.md": "56c6e8a6d11893fffb6048db5cad2973dbf6c50c9c02270b3e4498cb877818f7",
     "docs/templates/bkit-audit-adoption.md": "c4ddbc8e486e117fdac63395cd93c3b9d418e8d12e637fb2e5afdba9532fc42f",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
     ".bkit/install.md": "e3b5b919f56548adec89507bf6d9ee28b1f45f2907d314bef57ded8b51ef51f3",
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
-    ".bkit/providers.md": "19689cbafcde457d40ecbb061eef187d26ce156af941759651219cd2a558ba23",
+    ".bkit/providers.md": "36c9f10311e41ac5f2e1483a3f62f77bc485608464dfc1d0cd6037e826bf045d",
     ".bkit/prompts.md": "ed949e0d43e51581067abf58e4daaebe3b27241e5630f5d12e233892c4a59977",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "c0346c6ba33c9087c1db6235e08aaaff48717d277d7895e9fbf38e536929fc39",
+    ".bkit/workflows.md": "8605a88c594e937c899e724db49f5214664d8c713b7cc01db8d089101189f664",
     ".bkit/README.md": "3eab3725aca61c812345c2867a375c71434e4f3482d9961587fb41dd2ede7ae6",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "3fcdb917652bb7231ff41b68e30c233e8e85627368856c11edf0453d514faeef",
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "7e2f1c1fdabd60afc060d82a7a9c99b70db83cba52811fcfc60995a8111d3ae1",
-    ".codex/hooks/bkit-guardrails.cjs": "d5823a109b64d44682a91ef88cc263d9ca4f82385e1b2cf3547711198c1eeb43",
+    ".codex/hooks/bkit-guardrails.cjs": "b2071f16cff177f76c2d07dd636d1409dbf32604df07ac5f336bf8009b28481a",
     ".cursor/hooks/bkit-gateguard.cjs": "36d72eb8b8ce4eba0bf12f3404e71a47cca5465a7d8af149f677f5dc5458e31f",
-    ".cursor/hooks/bkit-guardrails.cjs": "8d14809ab0b85cb8f00934cc325824e87df3c534916bc3f470844db603d2c8cc",
+    ".cursor/hooks/bkit-guardrails.cjs": "f0ffb34c8aaac060431daa25c833eb97e4503f521dfc36f9dec3ec5160befc79",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "07484d9552883b162bff74c0835d3ff5695f36ee124db3cd3c8ce0a0b4edbba1",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "5cf2e802fe4bddf4696af701ce1b09afad8a24cbb0698fc5754486b4279b1b3f",
+    ".bkit/cli.md": "0748e34c73f051e126bd6d9ccab154ce24a7bbef6773815bd811919660a76fec",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 4b35559dc..589efcc30 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1431,7 +1431,7 @@ Without `acceptEdits` / a wildcard allow surface, every `Bash`, `Edit`, `Write`,
 | Bucket | Patterns | Purpose |
 | --- | --- | --- |
 | `allow` | `Bash(*)`, `Skill(*)`, `WebSearch`, `mcp__github__*`, `mcp__linear__*` (the `linear` server in `.mcp.json`), `mcp__jira__*` (the `jira` server), `Bash(git push --force-with-lease:*)`, `Read(./.env.example)`, `Read(./\*\*/.env.example)`, `WebFetch(domain:…)` per host in the network allowlist (apex + `*.` wildcard) | Blanket-allow shell, skills, tracker MCP, scoped web fetch. Claude evaluates `deny`, then `ask`, then `allow`: an `allow` row never overrides a matching `ask` or `deny`. `--force-with-lease` passes because no `deny` row matches it, not because of its `allow` row; the `.env.example` rows never fire, since `Read(./.env.*)` asks first. Session-conditional: bucket needs workspace trust; `Bash(*)` dropped in auto mode (§ Cloud sessions). |
-| `ask` | `sudo:*`, `brew install:*`, `(pnpm / npm / bun) publish:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`; git: `git reset --hard:*`, `git reset \*--hard\*`, `git -\* reset \*--hard\*`, `git clean -fd(x):*`, `git clean -\*f\*`, `git filter-branch:*`, `git checkout -- .:*`, `git checkout \*.`, `git checkout \* . \*`, `git restore .:*`, `git restore \*.`, `git restore \* . \*`, `git stash drop:*`, `git stash clear:*`, `git rebase -i:*`, `git rebase \* -i( \*)`, `git rebase \*--interactive\*`, `git \* --no-verify( \*)`, `git commit -n\*`, `git commit \* -n( \*)`; `Read(./.env)`, `Read(./.env.\*)`, `Read(./\*\*/.env)`, `Read(./\*\*/.env.\*)`, `Read(./.bkit/.env)` | Per-call human confirmation for destructive ops, hook-skipping commits / pushes and secret reads. The `\*` globs catch the same git commands with flags in another order (`git reset -q --hard`, `git clean -df`); a git global option before the subcommand (`git -C dir reset --hard`) is not matched. The `.env` rows are globs, not an enumeration of known filenames, because an enumeration silently drops `.env.ci` / `.env.preview` / anything a consumer invents into `defaultMode`. The recursive `./**/` forms cover monorepo `apps/*` and `packages/*`. Shell reads of secret files (`cat .env`) carry no `Bash(...)` row: a command-text glob cannot tell a read from a mention. |
+| `ask` | `sudo:*`, `brew install:*`, `(pnpm / npm / bun) publish:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`; git: `git reset --hard:*`, `git reset \*--hard\*`, `git -\* reset \*--hard\*`, `git clean -fd(x):*`, `git clean -\*f\*`, `git filter-branch:*`, `git checkout -- .:*`, `git checkout \*.`, `git checkout \* . \*`, `git restore .:*`, `git restore \*.`, `git restore \* . \*`, `git stash drop:*`, `git stash clear:*`, `git rebase -i:*`, `git rebase \* -i( \*)`, `git rebase \*--interactive\*`, `git \* --no-verify( \*)`, `git commit -n\*`, `git commit \* -n( \*)`, `\*bkit\*tests jump\*`, `\*cli.js tests jump\*`, `\*cli.ts tests jump\*`; `Read(./.env)`, `Read(./.env.\*)`, `Read(./\*\*/.env)`, `Read(./\*\*/.env.\*)`, `Read(./.bkit/.env)` | Per-call human confirmation for destructive ops, hook-skipping commits / pushes and secret reads. The `\*` globs catch the same git commands with flags in another order (`git reset -q --hard`, `git clean -df`); a git global option before the subcommand (`git -C dir reset --hard`) is not matched. The `.env` rows are globs, not an enumeration of known filenames, because an enumeration silently drops `.env.ci` / `.env.preview` / anything a consumer invents into `defaultMode`. The recursive `./**/` forms cover monorepo `apps/*` and `packages/*`. Shell reads of secret files (`cat .env`) carry no `Bash(...)` row: a command-text glob cannot tell a read from a mention. |
 | `deny` | `Bash(rm -rf /\*)`, `Bash(rm -rf ~/\*)`, `Bash(rm -rf $HOME/\*)`, `Bash(chmod -R 777 /:*)`, `Bash(git push --force)`, `Bash(git push --force \*)`, `Bash(git push -f)`, `Bash(git push -f \*)`, `Bash(git push -f\*)`, `Bash(git push \* --force)`, `Bash(git push \* --force \*)`, `Bash(git push \* -f\*)`, `Bash(git push \* +\*)`, `Read(./\*\*/\*.pem)`, `Read(./\*\*/\*.p12)`, `Read(./\*\*/id_rsa)` | Hard-block catastrophic deletes, force-push and private-key reads. Force-push is denied as `--force`, `-f` / an `-f…` cluster, or a `+refspec`, in any argument position. No row is a `--force` prefix: `--force:*` and `--force*` also match `--force-with-lease` and would deny the allowed form. |
 
 Shell `curl` / `wget` are not on the Claude `ask` list. They run under `Bash(*)`, with `deny`, the auto-mode classifier, and the advisory `.claude/hooks/bkit-guardrails.cjs` (PreToolUse, matcher `Bash`) as the backstops. Claude rules match a command prefix, not a URL host, so per-domain allows are inexpressible and the only options are blanket-ask or blanket-allow; blanket-ask forces a prompt on every shell fetch in every mode (a content-scoped `ask` is evaluated before the classifier and beats a matching `allow`), which a cloud session has nobody to answer. `WebFetch(domain:…)` governs the `WebFetch` tool only, never `curl` in `Bash`. Cursor gates by parsed URL host (`bkit-guardrails.cjs`), OpenCode via `curl https://{host}/*` allows layered after a `curl *` ask (command-string glob: trailing flags or extra URLs still match, so it narrows rather than blocks). All four run an allowlisted-host fetch unprompted; on an undeclared host Cursor and OpenCode ask, Claude and Codex emit an advisory instead (Claude to avoid re-adding the prompt, Codex because it cannot prompt).
diff --git a/.claude/settings.json b/.claude/settings.json
index 408e0af06..b0a028211 100644
--- a/.claude/settings.json
+++ b/.claude/settings.json
@@ -260,6 +260,9 @@
       "Bash(git commit -n*)",
       "Bash(git commit * -n)",
       "Bash(git commit * -n *)",
+      "Bash(*bkit*tests jump*)",
+      "Bash(*cli.js tests jump*)",
+      "Bash(*cli.ts tests jump*)",
       "Read(./.env)",
       "Read(./.env.*)",
       "Read(./**/.env)",
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index 0816eb9ec..8e18d8e57 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -513,8 +513,14 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
+  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
 ];
 
+/** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
+const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
+const HOOK_FILE = typeof __filename === "string" ? __filename : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
   for (const line of commandLines(c)) {
@@ -616,6 +622,13 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
+  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+    return {
+      tier: "deny",
+      what,
+      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
+    };
+  }
   if (what) return { tier: "ask", what };
   const secret = shellSecretRead(c);
   if (secret) return { tier: "secret", path: secret };
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index 389f15309..c93ab2a1a 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -505,8 +505,14 @@ const ASK_PATTERNS = [
   { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
   { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
   { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
+  { re: /\b(?:bkit|cli\.[jt]s)["']?\s+tests\s+jump\b/, what: "bkit tests jump" },
 ];
 
+/** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
+const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
+const HOOK_FILE = typeof __filename === "string" ? __filename : "";
+const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE);
+
 /** What makes a command ask-tier, else null. */
 function askRule(c) {
   for (const line of commandLines(c)) {
@@ -608,6 +614,13 @@ function classifyShell(c, dirs) {
   const denied = denyRule(c);
   if (denied) return { tier: "deny", ...denied };
   const what = askRule(c);
+  if (what === "bkit tests jump" && IS_CODEX_HOOK) {
+    return {
+      tier: "deny",
+      what,
+      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
+    };
+  }
   if (what) return { tier: "ask", what };
   const secret = shellSecretRead(c);
   if (secret) return { tier: "secret", path: secret };
diff --git a/.opencode/opencode.json b/.opencode/opencode.json
index d65e42f99..4f7e77037 100644
--- a/.opencode/opencode.json
+++ b/.opencode/opencode.json
@@ -177,6 +177,9 @@
       "git -* push* -4f*": "deny",
       "git push* -6f*": "deny",
       "git -* push* -6f*": "deny",
+      "*bkit*tests jump*": "ask",
+      "*cli.js tests jump*": "ask",
+      "*cli.ts tests jump*": "ask",
       "curl *12factor.net*": "allow",
       "wget *12factor.net*": "allow",
       "curl *agents.md*": "allow",
diff --git a/dist/commands/workflow/tests-jump.js b/dist/commands/workflow/tests-jump.js
new file mode 100644
index 000000000..b792513c4
--- /dev/null
+++ b/dist/commands/workflow/tests-jump.js
@@ -0,0 +1,90 @@
+// commands/workflow/tests-jump.ts — `bkit tests jump <run>`: move one waiting run to the front
+// of the tests line.
+//
+// The verb writes a `<ms>.jump` marker into `tests.queue` beside the lock file, holding the
+// `<who> — <checkout>` line of the run. The lock's waiting helpers sort a ticket carrying that
+// line first and delete the marker once the run has the lock. The verb never touches the lock,
+// the holder file or a slot file, so the current holder keeps the lock.
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { CommandError, EXIT } from "../lib.js";
+/** The `tests` lock's queue folder: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/tests.queue`. */
+function testsQueueDir() {
+    const cache = process.env.XDG_CACHE_HOME || path.join(process.env.HOME || os.homedir(), ".cache");
+    return path.join(cache, "bkit", "machine-lock", "tests.queue");
+}
+/** First line of a file, or null when it cannot be read or is empty. */
+function firstLine(file) {
+    try {
+        const line = fs.readFileSync(file, "utf-8").split("\n")[0];
+        return line === "" ? null : line;
+    }
+    catch {
+        return null;
+    }
+}
+/** The distinct lines of tickets and held places in `queue` whose run name is `run`. */
+function linesFor(queue, run) {
+    let names;
+    try {
+        names = fs.readdirSync(queue);
+    }
+    catch {
+        return [];
+    }
+    const lines = new Set();
+    for (const name of names) {
+        if (!/^\d+\.\d{6}-\d+(\.held)?$/.test(name))
+            continue;
+        const line = firstLine(path.join(queue, name));
+        if (line?.startsWith(`${run} — `))
+            lines.add(line);
+    }
+    return [...lines].sort();
+}
+export const testsJumpVerb = {
+    summary: "Move the waiting run named <run> to the front of the tests line; the holder keeps the lock. Every use needs the human's approval, so ask them to approve it; exit 0 moved, 1 no single run matched.",
+    use: "by-hand",
+    flags: [
+        {
+            name: "run",
+            type: "string",
+            positional: true,
+            required: true,
+            help: "the waiting run's name, as the waiting note prints it",
+        },
+        {
+            name: "checkout",
+            type: "string",
+            help: "the waiting run's checkout path, to pick one when several runs share the name",
+        },
+    ],
+    output: {
+        run: "the run name moved to the front",
+        checkout: "the checkout path of the run moved",
+        marker: "the jump marker file written",
+    },
+    run: (ctx) => {
+        const run = String(ctx.flags.run);
+        const wanted = typeof ctx.flags.checkout === "string" ? ctx.flags.checkout : undefined;
+        const queue = testsQueueDir();
+        let matches = linesFor(queue, run);
+        if (wanted !== undefined)
+            matches = matches.filter((line) => line === `${run} — ${wanted}`);
+        if (matches.length === 0) {
+            throw new CommandError(EXIT.NO, `no run named ${run} waits for tests`);
+        }
+        if (matches.length > 1) {
+            throw new CommandError(EXIT.NO, `several runs named ${run} wait for tests:\n${matches.map((line) => `  ${line}`).join("\n")}\npass --checkout <path> to pick one`);
+        }
+        const line = matches[0];
+        const marker = path.join(queue, `${Date.now()}.jump`);
+        const temp = path.join(queue, `.jump.${process.pid}.tmp`);
+        fs.writeFileSync(temp, `${line}\n`);
+        fs.renameSync(temp, marker);
+        ctx.log(`${run} moves to the front of the tests line`);
+        ctx.emit({ run, checkout: line.slice(`${run} — `.length), marker });
+        return EXIT.OK;
+    },
+};
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index ccd38afff..62de2133b 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -33,6 +33,7 @@ import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks
 import { writeStepRow } from "./steps.js";
 import { appendRecord, clampFile } from "./context.js";
 import { testsChangedVerb } from "./tests-changed.js";
+import { testsJumpVerb } from "./tests-jump.js";
 /** Exit code: no candidate gate is declared in package.json. */
 export const EXIT_NO_GATE = 3;
 /** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
@@ -1192,6 +1193,7 @@ export const testsCommand = {
     summary: "Run the deepest declared local gate, or one test file to record a red and audit a green.",
     verbs: {
         changed: testsChangedVerb,
+        jump: testsJumpVerb,
         run: {
             summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
             use: "by-hand",
diff --git a/docs/testing.md b/docs/testing.md
index f9a351cfd..26ea36592 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -326,6 +326,7 @@ Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bki
 - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
 - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
 - The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands); a re-run within 120 seconds keeps its place in line.
+- The human can move a waiting gate to the front of the line with `bkit tests jump <run>`; every use needs their approval.
 - The script defaults to 60 seconds without a TTY when no wait is set. Waiting runs take the lock in arrival order, and waiting notes name the holders, their checkouts' earlier run times and the run's place in line.
 
 ## JUnit reports for bkit
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
index 43647b1f7..02f8add82 100644
--- a/scripts/ci/bkit-machine-lock.sh
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -37,6 +37,8 @@
 # folder beside its lock file, flock-held while it waits, and only the first live ticket tries
 # the lock. A ticket of a dead waiter is skipped and removed. A waiter that gives up leaves its
 # ticket as <ticket>.held for 120s, so the same run asking again keeps its place in line.
+# A <ms>.jump marker in the queue (written by bkit tests jump) moves the waiter whose line it names to
+# the front, newest marker first; the holder keeps the lock. The waiter's own markers go when it takes the lock.
 # A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
 # Requires Bash 3.2+ and /usr/bin/perl.
 
@@ -243,25 +245,54 @@ _local_stack_lock() {
       my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
       return "$n$suffix";
     };
-    # Live tickets sorted by arrival; dead tickets (flock can be taken) and held places older than
-    # 120s are removed; every other name is left alone. Returns (our place, live tickets).
+    # Live tickets sorted by arrival, except that a ticket whose line a <ms>.jump marker names goes
+    # first (newest marker first); dead tickets (flock can be taken), held places older than 120s and
+    # markers naming no live ticket or held place are removed; every other name is left alone.
+    # Returns (our place, live tickets).
+    my $first_line = sub {
+      my $path = shift;
+      open(my $fh, "<", $path) or return undef;
+      my $first = <$fh>; close $fh;
+      return undef unless defined $first;
+      chomp $first;
+      return $first;
+    };
     my $scan = sub {
-      my @live;
+      my (@live, @markers, %known);
       opendir(my $dir, $queue) or return (0, 0);
       for my $entry (readdir $dir) {
         if ($entry =~ /^(\d+)\.(\d{6})-(\d+)$/) {
-          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$1, $2, $3, 1]; next }
+          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$1, $2, $3, 1, $first_line->("$queue/$entry")]; next }
           if (open(my $t, "<", "$queue/$entry")) {
-            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else { push @live, [$1, $2, $3, 0] }
+            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else {
+              my $first = <$t>;
+              if (defined $first) { chomp $first }
+              push @live, [$1, $2, $3, 0, $first];
+            }
             close $t;
           }
         } elsif ($entry =~ /^\d+\.\d{6}-\d+\.held$/) {
           my $mtime = (stat "$queue/$entry")[9];
-          unlink "$queue/$entry" if defined $mtime && time - $mtime > 120;
+          if (defined $mtime && time - $mtime > 120) { unlink "$queue/$entry" }
+          else { my $first = $first_line->("$queue/$entry"); $known{$first} = 1 if defined $first }
+        } elsif ($entry =~ /^(\d+)\.jump$/) {
+          push @markers, [$1, $entry, $first_line->("$queue/$entry")];
         }
       }
       closedir $dir;
-      @live = sort { $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2] } @live;
+      $known{$_->[4]} = 1 for grep { defined $_->[4] } @live;
+      my %front;
+      for my $m (@markers) {
+        if (!defined $m->[2] || !$known{$m->[2]}) { unlink "$queue/$m->[1]"; next }
+        $front{$m->[2]} = $m->[0] if !defined $front{$m->[2]} || $m->[0] > $front{$m->[2]};
+      }
+      my $rank = sub { my $f = defined $_[0][4] ? $front{$_[0][4]} : undef; return $f };
+      @live = sort {
+        my ($fa, $fb) = ($rank->($a), $rank->($b));
+        (defined $fa ? 0 : 1) <=> (defined $fb ? 0 : 1)
+          || (defined $fa ? $fb <=> $fa : 0)
+          || $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2]
+      } @live;
       my $place = 0;
       for my $i (0 .. $#live) { $place = $i + 1 if $live[$i][3] }
       return ($place, scalar @live);
@@ -339,6 +370,15 @@ _local_stack_lock() {
       select(undef, undef, undef, 0.1);
     }
     if (defined $ticket) { unlink $ticket; $ticket = undef }
+    if ($mode ne "try" && opendir(my $mdir, $queue)) {
+      my $mine = "$who — $checkout";
+      for my $entry (readdir $mdir) {
+        next unless $entry =~ /^\d+\.jump$/;
+        my $first = $first_line->("$queue/$entry");
+        unlink "$queue/$entry" if defined $first && $first eq $mine;
+      }
+      closedir $mdir;
+    }
     my $stopping = 0;
     $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { $stopping = 1 };
     my $held_since = time;
