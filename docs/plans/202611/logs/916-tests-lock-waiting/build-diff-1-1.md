diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index 7ff1b3843..31b6961b8 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
@@ -855,7 +855,7 @@ A full test gate runs for minutes, and a gate that waits for the machine-wide te
 | Cursor | No documented limit for the agent terminal; the CLI's Shell Mode stops a command after 30 seconds | Not documented | Not documented | unset → 60 s, then exit 81 and a re-run |
 | OpenCode | `bash` runs in the foreground until the call's timeout | Stopped; no background option | No | unset → 60 s, then exit 81 and a re-run |
 
-**Rule:** a bkit verb that may wait on another process bounds the wait by `BKIT_LOCK_WAIT_S` (default 60 s), prints who it is waiting for and how long that holder's last run took, and exits 81 naming the holder when the wait runs out; every workflow block that runs such a verb routes 81 → end turn, re-run the block. A host that keeps a command alive past its call and reports its exit gets a long budget, so one call outlasts the holder. Every other host loops in short calls, which costs a re-run per minute of waiting and nothing else.
+**Rule:** a bkit verb that may wait on another process bounds the wait by `BKIT_LOCK_WAIT_S` (default 60 s), prints who it is waiting for and how long that holder's last run took, and exits 81 naming the holder when the wait runs out; every workflow block that runs such a verb routes 81 → end turn, re-run the block. A host that keeps a command alive past its call and reports its exit gets a long budget, so one call outlasts the holder. Every other host loops in short calls, which costs a re-run per minute of waiting and nothing else: a re-run within 120 seconds keeps its place in line.
 
 **Sources:** Claude tools reference (<https://code.claude.com/docs/en/tools-reference>, § Bash tool: timeout and output limits, background commands, time limit for background commands, foreground commands that move to the background); Codex config reference (<https://learn.chatgpt.com/docs/config-file/config-reference>, `features.unified_exec`, `background_terminal_max_timeout`); Antigravity hooks reference (<https://antigravity.google/docs/hooks/>, `run_command`, `manage_task`, Stop `fullyIdle`); Cursor CLI Shell Mode docs. The Cursor agent tools and terminal pages and the OpenCode tools page state no timeout and no background contract.
 
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 2d2adcca9..c4158eefd 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -957,6 +957,12 @@ cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 - Lock paths use `$XDG_CACHE_HOME/bkit/` when set. A small Perl process holds the file lock and exits within a second of its caller, however the caller ends.
 - Wait: `LOCAL_STACK_LOCK_WAIT_S` when set, else 60 seconds without a TTY, else 3600 seconds. Waiting notes name the budget and holders once a minute; the give-up line names the holder again.
 - A named release records held seconds by checkout in `<name>.last`, with one tab-separated line per checkout. A waiting note and give-up line name the current holder's `last run took <N>m<N>s`, or `no earlier run`.
+- Waiters are served in the order they started waiting. Each wait-mode take keeps a flock-held ticket in `<name>.queue/` beside its lock file (the unnamed stack lock uses `<stack>.queue/`), named `<monotonic seconds>-<pid>`, and only the first live ticket tries the lock. Every lock shares this queue, including each `tests` slot.
+  - A ticket whose waiter died, or whose helper was killed, is skipped and removed; a waiter that gives up or is signalled drops its ticket.
+  - A waiter that gives up leaves its ticket as `<ticket>.held` for 120 seconds; the same run (same name and checkout) asking again within that time takes its place back. Older held places are deleted. Names that are neither tickets nor held places are left alone.
+  - The waiting note names the place in line (`2nd in line`). `try_local_stack_lock` never joins the line and reports busy (`N waiting in line`) while any live ticket exists, even when the lock is free.
+  - A waiter stopped (for example with `SIGSTOP`) while first in line holds the line: `ls` the queue folder to see who is first.
+  - A queue folder that cannot be created, or a ticket that cannot be written, refuses the take with the queue path (`run` exits 73).
 - `CI=true` / `CI=1` makes every lock a no-op.
 - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` and their run name to a wrapped gate; a tests-lock give-up of this run maps 75 → 81 with `lockHolder`, and a tests-lock refusal maps 73 → 4. A lock wait writes no `test-run` status row. Light runs (`red`, `green`, `bkit:test:file`) take no tests lock. Nested wraps reuse their live parent's tests lock. See `docs/testing.md` § Tests lock for host wait budgets.
 - Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
index deb8d464e..e7bb45041 100644
--- a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -13,6 +13,7 @@ import { afterEach, beforeEach, describe, expect, it } from "vitest";
 import { tierTimeouts } from "../../../../../vitest.timeout-budget";
 
 const OLD_SCRIPT = path.resolve("tests/fixtures/machine-lock/stack-lock-6.0.0.sh");
+const OLD_LOCK_SCRIPT = path.resolve("tests/fixtures/machine-lock/machine-lock-6.1.1.sh");
 const BUDGET = tierTimeouts(true);
 
 const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
@@ -645,6 +646,13 @@ describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
     );
     expect(r.stdout, r.stderr).toContain("nested-ok");
     expect(r.stderr).not.toContain("waiting");
+    // The parent's wait-mode take made the queue folder; the child reused the parent's lock and
+    // left no ticket in it.
+    const queue = run("local_stack_lock_file", envFor())
+      .stdout.trim()
+      .replace(/\.lock$/, ".queue");
+    expect(fs.existsSync(queue), "the stack lock's queue folder " + queue).toBe(true);
+    expect(fs.readdirSync(queue)).toEqual([]);
   });
 
   it("a stack named by BKIT_LOCAL_STACK never waits on the shared one", async () => {
@@ -1023,3 +1031,457 @@ describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
     expect(fromPackage.stdout).not.toContain("--lock");
   });
 });
+
+// ---- waiters are served in the order they started waiting ----
+
+const TICKET_NAME = /^\d+\.\d{6}-(\d+)$/;
+const STACK = "qstack";
+
+/** The queue folder beside a lock: a named lock, or the unnamed stack lock of STACK. */
+function queueOf(name?: string): string {
+  return name
+    ? path.join(cache, "bkit", "machine-lock", name + ".queue")
+    : path.join(cache, "bkit", "local-stack-lock", STACK + ".queue");
+}
+
+function ticketsIn(queue: string): string[] {
+  try {
+    return fs
+      .readdirSync(queue)
+      .filter((entry) => TICKET_NAME.test(entry))
+      .sort();
+  } catch {
+    return [];
+  }
+}
+
+/** The pid in the name of the live ticket whose first line starts with `who — `. */
+function ticketPid(queue: string, who: string): number {
+  for (const name of ticketsIn(queue)) {
+    let line = "";
+    try {
+      line = fs.readFileSync(path.join(queue, name), "utf-8");
+    } catch {
+      continue;
+    }
+    if (line.startsWith(who + " — ")) return Number(TICKET_NAME.exec(name)![1]);
+  }
+  throw new Error("no ticket for " + who + " in " + queue);
+}
+
+async function waitForTicket(queue: string, who: string): Promise<number> {
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    try {
+      return ticketPid(queue, who);
+    } catch {
+      await delay(20);
+    }
+  }
+  return ticketPid(queue, who);
+}
+
+/** The held place (`<ticket name>.held`) a waiter that gave up left behind. */
+function heldPlaceFor(queue: string, who: string): string {
+  let names: string[] = [];
+  try {
+    names = fs.readdirSync(queue).filter((entry) => entry.endsWith(".held"));
+  } catch {
+    names = [];
+  }
+  for (const name of names) {
+    const file = path.join(queue, name);
+    try {
+      if (fs.readFileSync(file, "utf-8").startsWith(who + " — ")) return file;
+    } catch {
+      continue;
+    }
+  }
+  throw new Error("no held place for " + who + " in " + queue);
+}
+
+async function waitForHeldPlace(queue: string, who: string): Promise<string> {
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    try {
+      return heldPlaceFor(queue, who);
+    } catch {
+      await delay(20);
+    }
+  }
+  return heldPlaceFor(queue, who);
+}
+
+function readLines(file: string): string[] {
+  return fs.existsSync(file)
+    ? fs
+        .readFileSync(file, "utf-8")
+        .split("\n")
+        .filter((line) => line !== "")
+    : [];
+}
+
+/** A run wrapper: `bash <script> run <who> [--lock name] -- <command>`, output captured. */
+function wrapped(
+  who: string,
+  env: NodeJS.ProcessEnv,
+  command: string,
+  opts: { lock?: string; script?: string } = {},
+) {
+  const started = Date.now();
+  const args = [opts.script ?? SCRIPT, "run", who, ...(opts.lock ? ["--lock", opts.lock] : [])];
+  const child = spawn("bash", [...args, "--", "bash", "-c", command], {
+    env,
+    cwd: process.cwd(),
+    stdio: ["ignore", "pipe", "pipe"],
+  });
+  children.push(child);
+  const output = { stdout: "", stderr: "" };
+  child.stdout.on("data", (data: Buffer) => (output.stdout += data.toString()));
+  child.stderr.on("data", (data: Buffer) => (output.stderr += data.toString()));
+  const done = new Promise<Result>((resolve) => {
+    child.on("close", (status) => resolve({ status, ...output, ms: Date.now() - started }));
+  });
+  return { child, output, done };
+}
+
+/** Holds a lock (named, or the unnamed stack lock) until `release()` is called. */
+async function queueHolder(env: NodeJS.ProcessEnv, name?: string, who = "holder") {
+  const releaseFile = path.join(tmp, "release-" + who);
+  const arg = name ? " " + name : "";
+  const proc = running(
+    `take_local_stack_lock ${who}${arg} || exit 1; echo acquired; while [ ! -f "${releaseFile}" ]; do sleep 0.05; done; release_local_stack_lock${arg}`,
+    env,
+  );
+  await waitForOutput(proc, "acquired");
+  return { proc, release: () => fs.writeFileSync(releaseFile, "release") };
+}
+
+/** Starts a waiter that appends its name to `order`, and returns once its ticket is in the queue. */
+async function queuedWaiter(
+  who: string,
+  env: NodeJS.ProcessEnv,
+  order: string,
+  name?: string,
+  command = `echo ${who} >> "${order}"`,
+) {
+  const waiter = wrapped(who, env, command, { lock: name });
+  await waitForTicket(queueOf(name), who);
+  return waiter;
+}
+
+async function expectAllExit(waiters: { done: Promise<Result> }[]): Promise<void> {
+  for (const result of await Promise.all(waiters.map((w) => w.done))) {
+    expect(result.status, result.stderr).toBe(0);
+  }
+}
+
+async function fiveInArrivalOrder(name: string | undefined, env: NodeJS.ProcessEnv) {
+  const order = path.join(tmp, "order");
+  const holder = await queueHolder(env, name);
+  const waiters = [];
+  for (const who of ["w1", "w2", "w3", "w4", "w5"]) {
+    waiters.push(await queuedWaiter(who, env, order, name));
+  }
+  holder.release();
+  await expectAllExit(waiters);
+  return readLines(order);
+}
+
+describe("machine lock waiting order", { timeout: BUDGET.testTimeout }, () => {
+  const waitEnv = (extra: Record<string, string> = {}) =>
+    envFor({ LOCAL_STACK_LOCK_WAIT_S: "60", BKIT_LOCAL_STACK: STACK, ...extra });
+
+  it("tests-lock waiters run their commands in arrival order", async () => {
+    expect(await fiveInArrivalOrder("tests", waitEnv())).toEqual(["w1", "w2", "w3", "w4", "w5"]);
+  });
+
+  it("stack-lock waiters run their commands in arrival order", async () => {
+    expect(await fiveInArrivalOrder(undefined, waitEnv())).toEqual(["w1", "w2", "w3", "w4", "w5"]);
+  });
+
+  it("a run that releases the lock and asks again queues behind runs already waiting", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const releaseFile = path.join(tmp, "release-again");
+    const again = running(
+      `take_local_stack_lock again tests || exit 1; echo acquired; echo again-1 >> "${order}"; while [ ! -f "${releaseFile}" ]; do sleep 0.05; done; release_local_stack_lock tests; take_local_stack_lock again tests || exit 1; echo again-2 >> "${order}"; release_local_stack_lock tests`,
+      env,
+    );
+    await waitForOutput(again, "acquired");
+    const waiters = [];
+    for (const who of ["w1", "w2", "w3", "w4", "w5"]) {
+      waiters.push(await queuedWaiter(who, env, order, "tests"));
+    }
+    fs.writeFileSync(releaseFile, "release");
+    await expectAllExit(waiters);
+    expect((await again.done).status).toBe(0);
+    expect(readLines(order)).toEqual(["again-1", "w1", "w2", "w3", "w4", "w5", "again-2"]);
+  });
+
+  it("with two slots, waiters take freed slots in arrival order", async () => {
+    const env = waitEnv({ BKIT_TEST_SLOTS: "2" });
+    const order = path.join(tmp, "order");
+    const slotA = await queueHolder(env, "tests", "slot-a");
+    const slotB = await queueHolder(env, "tests", "slot-b");
+    const gate = (who: string) =>
+      `echo ${who} >> "${order}"; while [ ! -f "${tmp}/done-${who}" ]; do sleep 0.05; done`;
+    const waiters = [];
+    for (const who of ["w1", "w2", "w3", "w4"]) {
+      waiters.push(await queuedWaiter(who, env, order, "tests", gate(who)));
+    }
+    slotA.release();
+    await expect.poll(() => readLines(order), { timeout: BUDGET.hookTimeout }).toEqual(["w1"]);
+    await delay(500);
+    expect(readLines(order)).toEqual(["w1"]);
+    slotB.release();
+    await expect
+      .poll(() => readLines(order), { timeout: BUDGET.hookTimeout })
+      .toEqual(["w1", "w2"]);
+    await delay(500);
+    expect(readLines(order)).toEqual(["w1", "w2"]);
+    fs.writeFileSync(path.join(tmp, "done-w1"), "");
+    await expect
+      .poll(() => readLines(order), { timeout: BUDGET.hookTimeout })
+      .toEqual(["w1", "w2", "w3"]);
+    fs.writeFileSync(path.join(tmp, "done-w2"), "");
+    fs.writeFileSync(path.join(tmp, "done-w3"), "");
+    fs.writeFileSync(path.join(tmp, "done-w4"), "");
+    await expectAllExit(waiters);
+    expect(readLines(order)).toEqual(["w1", "w2", "w3", "w4"]);
+  });
+
+  it("queued waiters keep their order while a copy without the queue also waits, and no two commands overlap", async () => {
+    const env = waitEnv();
+    const events = path.join(tmp, "events");
+    const span = (who: string) =>
+      `echo "start ${who}" >> "${events}"; sleep 0.2; echo "end ${who}" >> "${events}"`;
+    const holder = await queueHolder(env, "tests");
+    const waiters = [];
+    for (const who of ["w1", "w2"]) {
+      waiters.push(await queuedWaiter(who, env, events, "tests", span(who)));
+    }
+    const old = wrapped("old-copy", env, span("old-copy"), {
+      lock: "tests",
+      script: OLD_LOCK_SCRIPT,
+    });
+    await waitForOutput(old, "waiting");
+    for (const who of ["w3", "w4", "w5"]) {
+      waiters.push(await queuedWaiter(who, env, events, "tests", span(who)));
+    }
+    holder.release();
+    await expectAllExit([...waiters, old]);
+    const lines = readLines(events);
+    expect(lines).toHaveLength(12);
+    for (let i = 0; i < lines.length; i += 2) {
+      const who = lines[i]!.replace("start ", "");
+      expect(lines[i]).toBe("start " + who);
+      expect(lines[i + 1]).toBe("end " + who);
+    }
+    expect(lines.filter((line) => /^start w\d$/.test(line))).toEqual(
+      ["w1", "w2", "w3", "w4", "w5"].map((who) => "start " + who),
+    );
+    expect(lines).toContain("start old-copy");
+  });
+
+  it("a waiter that gives up leaves the line and the runs behind it keep their order", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const w2 = await queuedWaiter("w2", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
+    const w3 = await queuedWaiter("w3", env, order, "tests");
+    const w4 = await queuedWaiter("w4", env, order, "tests");
+    const gaveUp = await w2.done;
+    expect(gaveUp.status).toBe(75);
+    expect(() => ticketPid(queueOf("tests"), "w2")).toThrow(/no ticket for/);
+    holder.release();
+    await expectAllExit([w1, w3, w4]);
+    expect(readLines(order)).toEqual(["w1", "w3", "w4"]);
+  });
+
+  it("a waiter whose caller is killed leaves the line and the runs behind it keep their order", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const w2 = await queuedWaiter("w2", env, order, "tests");
+    const w3 = await queuedWaiter("w3", env, order, "tests");
+    w2.child.kill("SIGKILL");
+    await expect
+      .poll(() => ticketsIn(queueOf("tests")).length, { timeout: BUDGET.hookTimeout })
+      .toBe(2);
+    expect(() => ticketPid(queueOf("tests"), "w2")).toThrow(/no ticket for/);
+    holder.release();
+    await expectAllExit([w1, w3]);
+    expect(readLines(order)).toEqual(["w1", "w3"]);
+  });
+
+  it("a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const w2 = await queuedWaiter("w2", env, order, "tests");
+    const w3 = await queuedWaiter("w3", env, order, "tests");
+    process.kill(ticketPid(queueOf("tests"), "w2"), "SIGTERM");
+    await expect
+      .poll(() => ticketsIn(queueOf("tests")).length, { timeout: 1000, interval: 10 })
+      .toBe(2);
+    expect(() => ticketPid(queueOf("tests"), "w2")).toThrow(/no ticket for/);
+    holder.release();
+    await expectAllExit([w1, w3]);
+    await w2.done;
+    expect(readLines(order)).toEqual(["w1", "w3"]);
+  });
+
+  it("a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const w2 = await queuedWaiter("w2", env, order, "tests");
+    const w3 = await queuedWaiter("w3", env, order, "tests");
+    process.kill(ticketPid(queueOf("tests"), "w2"), "SIGKILL");
+    holder.release();
+    await expectAllExit([w1, w3]);
+    await w2.done;
+    expect(readLines(order)).toEqual(["w1", "w3"]);
+    await expect
+      .poll(() => ticketsIn(queueOf("tests")), { timeout: BUDGET.hookTimeout })
+      .toEqual([]);
+  });
+
+  it("run exits 73 naming the queue folder when it cannot be created", () => {
+    const queue = queueOf("tests");
+    fs.mkdirSync(path.dirname(queue), { recursive: true });
+    fs.writeFileSync(queue, "a file cannot hold a queue folder");
+    const result = commandRun(
+      ["queue blocked", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(73);
+    expect(result.stdout).not.toContain("should-not-run");
+    expect(result.stderr).toContain(queue);
+  });
+
+  it("run exits 73 naming the queue folder when no ticket can be written", () => {
+    const queue = queueOf("tests");
+    fs.mkdirSync(queue, { recursive: true });
+    fs.chmodSync(queue, 0o555);
+    try {
+      const result = commandRun(
+        ["queue read-only", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+        envFor(),
+      );
+      expect(result.status, result.stderr).toBe(73);
+      expect(result.stdout).not.toContain("should-not-run");
+      expect(result.stderr).toContain(queue);
+    } finally {
+      fs.chmodSync(queue, 0o755);
+    }
+  });
+
+  it("a try while a run waits first in line reports busy even when the lock is free", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const helper = ticketPid(queueOf("tests"), "w1");
+    process.kill(helper, "SIGSTOP");
+    try {
+      holder.release();
+      await holder.proc.done;
+      const holderFile = path.join(cache, "bkit", "machine-lock", "tests.lock.holder");
+      await expect
+        .poll(() => fs.existsSync(holderFile), { timeout: BUDGET.hookTimeout })
+        .toBe(false);
+      const tried = run("try_local_stack_lock prober tests", env);
+      expect(tried.status).toBe(1);
+      expect(tried.stderr).toContain("1 waiting in line");
+      expect(fs.existsSync(holderFile)).toBe(false);
+    } finally {
+      process.kill(helper, "SIGCONT");
+    }
+    await expectAllExit([w1]);
+    expect(readLines(order)).toEqual(["w1"]);
+  });
+
+  it("the waiting note says where the run is in line", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const w2 = await queuedWaiter("w2", env, order, "tests");
+    await waitForOutput(w1, "1st in line");
+    await waitForOutput(w2, "2nd in line");
+    holder.release();
+    await expectAllExit([w1, w2]);
+    expect(readLines(order)).toEqual(["w1", "w2"]);
+  });
+
+  it("a stray file in the queue folder neither blocks the line nor gets deleted", async () => {
+    const env = waitEnv();
+    const queue = queueOf("tests");
+    fs.mkdirSync(queue, { recursive: true });
+    fs.writeFileSync(path.join(queue, ".5.tmp"), "half-written ticket");
+    fs.writeFileSync(path.join(queue, "notes.txt"), "not a ticket");
+    expect(await fiveInArrivalOrder("tests", env)).toEqual(["w1", "w2", "w3", "w4", "w5"]);
+    expect(fs.existsSync(path.join(queue, ".5.tmp"))).toBe(true);
+    expect(fs.existsSync(path.join(queue, "notes.txt"))).toBe(true);
+  });
+
+  it("a stopped first-in-line waiter holds the line while the lock is free", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const holder = await queueHolder(env, "tests");
+    const w1 = await queuedWaiter("w1", env, order, "tests");
+    const w2 = await queuedWaiter("w2", env, order, "tests");
+    const helper = ticketPid(queueOf("tests"), "w1");
+    process.kill(helper, "SIGSTOP");
+    try {
+      holder.release();
+      await holder.proc.done;
+      await delay(800);
+      expect(readLines(order)).toEqual([]);
+    } finally {
+      process.kill(helper, "SIGCONT");
+    }
+    await expectAllExit([w1, w2]);
+    expect(readLines(order)).toEqual(["w1", "w2"]);
+  });
+
+  it("a waiter that gives up and asks again within 120 s keeps its place in line", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const queue = queueOf("tests");
+    const holder = await queueHolder(env, "tests");
+    const first = await queuedWaiter("x", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
+    const y = await queuedWaiter("y", env, order, "tests");
+    expect((await first.done).status).toBe(75);
+    await waitForHeldPlace(queue, "x");
+    const again = await queuedWaiter("x", env, order, "tests");
+    holder.release();
+    await expectAllExit([y, again]);
+    expect(readLines(order)).toEqual(["x", "y"]);
+  });
+
+  it("a held place older than 120 s is deleted and the re-ask joins the end of the line", async () => {
+    const env = waitEnv();
+    const order = path.join(tmp, "order");
+    const queue = queueOf("tests");
+    const holder = await queueHolder(env, "tests");
+    const first = await queuedWaiter("x", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
+    const y = await queuedWaiter("y", env, order, "tests");
+    expect((await first.done).status).toBe(75);
+    const held = await waitForHeldPlace(queue, "x");
+    const old = new Date(Date.now() - 300_000);
+    fs.utimesSync(held, old, old);
+    await expect.poll(() => fs.existsSync(held), { timeout: BUDGET.hookTimeout }).toBe(false);
+    expect(() => heldPlaceFor(queue, "x")).toThrow(/no held place for/);
+    const again = await queuedWaiter("x", env, order, "tests");
+    holder.release();
+    await expectAllExit([y, again]);
+    expect(readLines(order)).toEqual(["y", "x"]);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
index 038debf51..6f240d728 100644
--- a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
@@ -431,6 +431,18 @@ describe("tests lock through a consumer's wrapped gate", () => {
     expect(events()).toEqual([]);
   });
 
+  it("tests run exits 4 naming the queue folder when a regular file blocks it", () => {
+    const lockDir = path.join(cache, "bkit", "machine-lock");
+    fs.mkdirSync(lockDir, { recursive: true });
+    const queue = path.join(lockDir, "tests.queue");
+    fs.writeFileSync(queue, "a file cannot hold a queue folder");
+    const result = execute(runArgs());
+    expect(result.status, result.stderr).toBe(4);
+    expect(result.stderr).toContain(queue);
+    expect(output(result)).toMatchObject({ verdict: null });
+    expect(events()).toEqual([]);
+  });
+
   it("tests run with --lock-wait-s=0 exits 81 at once against a held lock", async () => {
     const holder = await hold();
     const result = execute([...runArgs(), "--lock-wait-s=0"]);
diff --git a/.bkit/providers.md b/.bkit/providers.md
index 9282ce6ab..e73c7e46a 100644
--- a/.bkit/providers.md
+++ b/.bkit/providers.md
@@ -855,7 +855,7 @@ A full test gate runs for minutes, and a gate that waits for the machine-wide te
 | Cursor | No documented limit for the agent terminal; the CLI's Shell Mode stops a command after 30 seconds | Not documented | Not documented | unset → 60 s, then exit 81 and a re-run |
 | OpenCode | `bash` runs in the foreground until the call's timeout | Stopped; no background option | No | unset → 60 s, then exit 81 and a re-run |
 
-**Rule:** a bkit verb that may wait on another process bounds the wait by `BKIT_LOCK_WAIT_S` (default 60 s), prints who it is waiting for and how long that holder's last run took, and exits 81 naming the holder when the wait runs out; every workflow block that runs such a verb routes 81 → end turn, re-run the block. A host that keeps a command alive past its call and reports its exit gets a long budget, so one call outlasts the holder. Every other host loops in short calls, which costs a re-run per minute of waiting and nothing else.
+**Rule:** a bkit verb that may wait on another process bounds the wait by `BKIT_LOCK_WAIT_S` (default 60 s), prints who it is waiting for and how long that holder's last run took, and exits 81 naming the holder when the wait runs out; every workflow block that runs such a verb routes 81 → end turn, re-run the block. A host that keeps a command alive past its call and reports its exit gets a long budget, so one call outlasts the holder. Every other host loops in short calls, which costs a re-run per minute of waiting and nothing else: a re-run within 120 seconds keeps its place in line.
 
 **Sources:** Claude tools reference (<https://code.claude.com/docs/en/tools-reference>, § Bash tool: timeout and output limits, background commands, time limit for background commands, foreground commands that move to the background); Codex config reference (<https://learn.chatgpt.com/docs/config-file/config-reference>, `features.unified_exec`, `background_terminal_max_timeout`); Antigravity hooks reference (<https://antigravity.google/docs/hooks/>, `run_command`, `manage_task`, Stop `fullyIdle`); Cursor CLI Shell Mode docs. The Cursor agent tools and terminal pages and the OpenCode tools page state no timeout and no background contract.
 
diff --git a/.bkit/shared/docs/testing.md b/.bkit/shared/docs/testing.md
index 16f723f94..71d557510 100644
--- a/.bkit/shared/docs/testing.md
+++ b/.bkit/shared/docs/testing.md
@@ -325,8 +325,8 @@ Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bki
 - A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
 - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
 - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
-- The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands).
-- The script defaults to 60 seconds without a TTY when no wait is set. Waiting notes name the holders and their checkouts' earlier run times.
+- The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands); a re-run within 120 seconds keeps its place in line.
+- The script defaults to 60 seconds without a TTY when no wait is set. Waiting runs take the lock in arrival order, and waiting notes name the holders, their checkouts' earlier run times and the run's place in line.
 
 ## JUnit reports for bkit
 
diff --git a/.bkit/templates.md b/.bkit/templates.md
index bbf96a5cb..38cbc1303 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -957,6 +957,12 @@ cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 - Lock paths use `$XDG_CACHE_HOME/bkit/` when set. A small Perl process holds the file lock and exits within a second of its caller, however the caller ends.
 - Wait: `LOCAL_STACK_LOCK_WAIT_S` when set, else 60 seconds without a TTY, else 3600 seconds. Waiting notes name the budget and holders once a minute; the give-up line names the holder again.
 - A named release records held seconds by checkout in `<name>.last`, with one tab-separated line per checkout. A waiting note and give-up line name the current holder's `last run took <N>m<N>s`, or `no earlier run`.
+- Waiters are served in the order they started waiting. Each wait-mode take keeps a flock-held ticket in `<name>.queue/` beside its lock file (the unnamed stack lock uses `<stack>.queue/`), named `<monotonic seconds>-<pid>`, and only the first live ticket tries the lock. Every lock shares this queue, including each `tests` slot.
+  - A ticket whose waiter died, or whose helper was killed, is skipped and removed; a waiter that gives up or is signalled drops its ticket.
+  - A waiter that gives up leaves its ticket as `<ticket>.held` for 120 seconds; the same run (same name and checkout) asking again within that time takes its place back. Older held places are deleted. Names that are neither tickets nor held places are left alone.
+  - The waiting note names the place in line (`2nd in line`). `try_local_stack_lock` never joins the line and reports busy (`N waiting in line`) while any live ticket exists, even when the lock is free.
+  - A waiter stopped (for example with `SIGSTOP`) while first in line holds the line: `ls` the queue folder to see who is first.
+  - A queue folder that cannot be created, or a ticket that cannot be written, refuses the take with the queue path (`run` exits 73).
 - `CI=true` / `CI=1` makes every lock a no-op.
 - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` and their run name to a wrapped gate; a tests-lock give-up of this run maps 75 → 81 with `lockHolder`, and a tests-lock refusal maps 73 → 4. A lock wait writes no `test-run` status row. Light runs (`red`, `green`, `bkit:test:file`) take no tests lock. Nested wraps reuse their live parent's tests lock. See `docs/testing.md` § Tests lock for host wait budgets.
 - Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
index a13d8f0f7..43647b1f7 100644
--- a/.bkit/templates/scripts/ci/bkit-machine-lock.sh
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -6,7 +6,7 @@
 #
 #   . scripts/ci/bkit-machine-lock.sh
 #   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
-#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy or runs wait in line
 #   release_local_stack_lock [name]        # optional; caller exit also frees the lock
 #   local_stack_lock_holder [name]
 #   local_stack_lock_file [name]
@@ -31,7 +31,12 @@
 # exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the runner to use.
 # LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
 # with a TTY. Named releases save each checkout's held seconds in <name>.last.
-# Waiting notes name every holder and that checkout's last run. CI=true / CI=1 is a no-op.
+# Waiting notes name every holder, that checkout's last run and the run's place in line.
+# CI=true / CI=1 is a no-op.
+# Waiters are served in the order they started waiting: each keeps a ticket in a <name>.queue/
+# folder beside its lock file, flock-held while it waits, and only the first live ticket tries
+# the lock. A ticket of a dead waiter is skipped and removed. A waiter that gives up leaves its
+# ticket as <ticket>.held for 120s, so the same run asking again keeps its place in line.
 # A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
 # Requires Bash 3.2+ and /usr/bin/perl.
 
@@ -193,6 +198,7 @@ _local_stack_lock() {
     use Fcntl qw(:flock);
     use File::Glob qw(bsd_glob);
     use POSIX qw(strftime);
+    use Time::HiRes qw(clock_gettime CLOCK_MONOTONIC);
     my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label, $slots, $name) = @ARGV;
     # The caller is the parent of this process. When it exits, this process goes to init (or a
     # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
@@ -228,28 +234,111 @@ _local_stack_lock() {
       }
       return @holders ? join("; ", @holders) : "another run";
     };
+    my $queue = "$stem.queue";
+    my ($ticket, $ticket_fh);
+    END { unlink $ticket if defined $ticket }
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { exit 0 };
+    my $ordinal = sub {
+      my $n = shift;
+      my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
+      return "$n$suffix";
+    };
+    # Live tickets sorted by arrival; dead tickets (flock can be taken) and held places older than
+    # 120s are removed; every other name is left alone. Returns (our place, live tickets).
+    my $scan = sub {
+      my @live;
+      opendir(my $dir, $queue) or return (0, 0);
+      for my $entry (readdir $dir) {
+        if ($entry =~ /^(\d+)\.(\d{6})-(\d+)$/) {
+          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$1, $2, $3, 1]; next }
+          if (open(my $t, "<", "$queue/$entry")) {
+            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else { push @live, [$1, $2, $3, 0] }
+            close $t;
+          }
+        } elsif ($entry =~ /^\d+\.\d{6}-\d+\.held$/) {
+          my $mtime = (stat "$queue/$entry")[9];
+          unlink "$queue/$entry" if defined $mtime && time - $mtime > 120;
+        }
+      }
+      closedir $dir;
+      @live = sort { $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2] } @live;
+      my $place = 0;
+      for my $i (0 .. $#live) { $place = $i + 1 if $live[$i][3] }
+      return ($place, scalar @live);
+    };
+    if ($mode ne "try") {
+      unless (-d $queue || mkdir($queue)) { print $out "error cannot create $queue: $!\n"; exit 1 }
+      my $line = "$who — $checkout";
+      # A held place of this run, left by an earlier give-up under 120s ago, keeps its time.
+      my ($time, $held_name);
+      if (opendir(my $dir, $queue)) {
+        for my $entry (sort readdir $dir) {
+          next unless $entry =~ /^(\d+\.\d{6})-\d+\.held$/;
+          my $mtime = (stat "$queue/$entry")[9];
+          next unless defined $mtime && time - $mtime <= 120;
+          open(my $h, "<", "$queue/$entry") or next;
+          my $first = <$h>; close $h;
+          next unless defined $first;
+          chomp $first;
+          next unless $first eq $line;
+          ($time, $held_name) = ($1, $entry);
+          last;
+        }
+        closedir $dir;
+      }
+      $time = sprintf("%.6f", clock_gettime(CLOCK_MONOTONIC)) unless defined $time;
+      my $temp = "$queue/.$$.tmp";
+      open($ticket_fh, ">", $temp) or do { print $out "error cannot write a ticket in $queue: $!\n"; exit 1 };
+      flock($ticket_fh, LOCK_EX);
+      $ticket_fh->autoflush(1);
+      print $ticket_fh "$line\n";
+      my $name_of_ticket = "$time-$$";
+      unless (rename($temp, "$queue/$name_of_ticket")) {
+        my $why = $!;
+        unlink $temp;
+        print $out "error cannot write a ticket in $queue: $why\n";
+        exit 1;
+      }
+      $ticket = "$queue/$name_of_ticket";
+      unlink "$queue/$held_name" if defined $held_name;
+    }
     my ($lock, $held_file);
     my $start = time;
     my $next_note = 0;
     while (1) {
-      for my $slot (1 .. $slots) {
-        my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
-        open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
-        if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
-        close $next;
+      my ($place, $waiting) = $scan->();
+      if ($mode eq "try") {
+        if ($waiting) { print $out "busy " . $holder->() . "; $waiting waiting in line\n"; exit 0 }
+      }
+      if ($mode eq "try" || $place <= 1) {
+        for my $slot (1 .. $slots) {
+          my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
+          open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
+          if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
+          close $next;
+        }
       }
       last if defined $lock;
       exit 0 unless $caller_alive->();
       if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
-      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) {
+        # Keep the place for 120s: the same run asking again takes it back.
+        my $kept = "$ticket.held";
+        utime(time, time, $ticket);
+        if (rename($ticket, $kept)) { $ticket = undef }
+        print $out "timeout " . $holder->() . "\n";
+        exit 0;
+      }
       if (time >= $next_note) {
         my $m = int((time - $start) / 60);
         my $so_far = $m ? " (still, $m min so far)" : "";
-        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s): in use by " . $holder->() . "\n";
+        my $in_line = $place ? ", " . $ordinal->($place) . " in line" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s)$in_line: in use by " . $holder->() . "\n";
         $next_note = time + 60;
       }
       select(undef, undef, undef, 0.1);
     }
+    if (defined $ticket) { unlink $ticket; $ticket = undef }
     my $stopping = 0;
     $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { $stopping = 1 };
     my $held_since = time;
diff --git a/.bkit/version b/.bkit/version
index b2fafe8b0..84b99e746 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "549e1e6975a340832fa8b0a6137c560ef14d6d0037f0f3da3446612a9f91e4b0",
-    "docs/testing.md": "31e3d9c947230d5587c8d94c43c706f163a0101cf5a998ee2cbe4addbd37187f",
+    "docs/testing.md": "51a47ac89a57d060832ed2a15b5408c47a1ea33fdd6c3bfedddb72c250415d25",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "857b24f8b0b95179be374a25b5886cef857068902ba901b95e4988ddbf50a93e",
@@ -215,13 +215,13 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "55509636caed7293659d97f6939af8bb4e36a35bd4c82b9f79e7613f887ffccc",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
-    ".bkit/templates.md": "fa6bbda7b4891220737865015114238d075ac53ed94e3d82af7b8e24c4db4757",
+    ".bkit/templates.md": "dfce696027fa87b1c1c8bda4b03df07242e90153351ddb9946810945234bf0a9",
     "docs/templates/bkit-audit-adoption.md": "c4ddbc8e486e117fdac63395cd93c3b9d418e8d12e637fb2e5afdba9532fc42f",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
     ".bkit/install.md": "e3b5b919f56548adec89507bf6d9ee28b1f45f2907d314bef57ded8b51ef51f3",
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
-    ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
+    ".bkit/providers.md": "19689cbafcde457d40ecbb061eef187d26ce156af941759651219cd2a558ba23",
     ".bkit/prompts.md": "ed949e0d43e51581067abf58e4daaebe3b27241e5630f5d12e233892c4a59977",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
     ".bkit/workflows.md": "c0346c6ba33c9087c1db6235e08aaaff48717d277d7895e9fbf38e536929fc39",
diff --git a/docs/testing.md b/docs/testing.md
index 0063dcf2b..f9a351cfd 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -325,8 +325,8 @@ Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bki
 - A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
 - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
 - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
-- The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands).
-- The script defaults to 60 seconds without a TTY when no wait is set. Waiting notes name the holders and their checkouts' earlier run times.
+- The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands); a re-run within 120 seconds keeps its place in line.
+- The script defaults to 60 seconds without a TTY when no wait is set. Waiting runs take the lock in arrival order, and waiting notes name the holders, their checkouts' earlier run times and the run's place in line.
 
 ## JUnit reports for bkit
 
@@ -708,7 +708,7 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 
 Workflow progress has focused Unit coverage for position math and command output, Integration coverage for real saved status/plan files and completion producers, and renderer coverage for each supported host. The external Claude app's 375px layout is an owner-run check: `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` records its procedure, screenshots and explicit outcome. A character-count assertion does not verify app typography.
 
-The machine-lock integration tests in `audits/templates/machine-lock.integration.test.ts` run real Bash and Perl holders against isolated cache folders. `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` freezes the older stack-lock script for compatibility checks.
+The machine-lock integration tests in `audits/templates/machine-lock.integration.test.ts` run real Bash and Perl holders against isolated cache folders. `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` freezes the older stack-lock script for compatibility checks, and `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` freezes the 6.1.1 script, which has no waiting queue, for the mixed-version order test.
 
 <!-- prettier-ignore -->
 | File | Tier | Scope |
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
index a13d8f0f7..43647b1f7 100644
--- a/scripts/ci/bkit-machine-lock.sh
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -6,7 +6,7 @@
 #
 #   . scripts/ci/bkit-machine-lock.sh
 #   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
-#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy or runs wait in line
 #   release_local_stack_lock [name]        # optional; caller exit also frees the lock
 #   local_stack_lock_holder [name]
 #   local_stack_lock_file [name]
@@ -31,7 +31,12 @@
 # exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the runner to use.
 # LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
 # with a TTY. Named releases save each checkout's held seconds in <name>.last.
-# Waiting notes name every holder and that checkout's last run. CI=true / CI=1 is a no-op.
+# Waiting notes name every holder, that checkout's last run and the run's place in line.
+# CI=true / CI=1 is a no-op.
+# Waiters are served in the order they started waiting: each keeps a ticket in a <name>.queue/
+# folder beside its lock file, flock-held while it waits, and only the first live ticket tries
+# the lock. A ticket of a dead waiter is skipped and removed. A waiter that gives up leaves its
+# ticket as <ticket>.held for 120s, so the same run asking again keeps its place in line.
 # A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
 # Requires Bash 3.2+ and /usr/bin/perl.
 
@@ -193,6 +198,7 @@ _local_stack_lock() {
     use Fcntl qw(:flock);
     use File::Glob qw(bsd_glob);
     use POSIX qw(strftime);
+    use Time::HiRes qw(clock_gettime CLOCK_MONOTONIC);
     my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label, $slots, $name) = @ARGV;
     # The caller is the parent of this process. When it exits, this process goes to init (or a
     # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
@@ -228,28 +234,111 @@ _local_stack_lock() {
       }
       return @holders ? join("; ", @holders) : "another run";
     };
+    my $queue = "$stem.queue";
+    my ($ticket, $ticket_fh);
+    END { unlink $ticket if defined $ticket }
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { exit 0 };
+    my $ordinal = sub {
+      my $n = shift;
+      my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
+      return "$n$suffix";
+    };
+    # Live tickets sorted by arrival; dead tickets (flock can be taken) and held places older than
+    # 120s are removed; every other name is left alone. Returns (our place, live tickets).
+    my $scan = sub {
+      my @live;
+      opendir(my $dir, $queue) or return (0, 0);
+      for my $entry (readdir $dir) {
+        if ($entry =~ /^(\d+)\.(\d{6})-(\d+)$/) {
+          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$1, $2, $3, 1]; next }
+          if (open(my $t, "<", "$queue/$entry")) {
+            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else { push @live, [$1, $2, $3, 0] }
+            close $t;
+          }
+        } elsif ($entry =~ /^\d+\.\d{6}-\d+\.held$/) {
+          my $mtime = (stat "$queue/$entry")[9];
+          unlink "$queue/$entry" if defined $mtime && time - $mtime > 120;
+        }
+      }
+      closedir $dir;
+      @live = sort { $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2] } @live;
+      my $place = 0;
+      for my $i (0 .. $#live) { $place = $i + 1 if $live[$i][3] }
+      return ($place, scalar @live);
+    };
+    if ($mode ne "try") {
+      unless (-d $queue || mkdir($queue)) { print $out "error cannot create $queue: $!\n"; exit 1 }
+      my $line = "$who — $checkout";
+      # A held place of this run, left by an earlier give-up under 120s ago, keeps its time.
+      my ($time, $held_name);
+      if (opendir(my $dir, $queue)) {
+        for my $entry (sort readdir $dir) {
+          next unless $entry =~ /^(\d+\.\d{6})-\d+\.held$/;
+          my $mtime = (stat "$queue/$entry")[9];
+          next unless defined $mtime && time - $mtime <= 120;
+          open(my $h, "<", "$queue/$entry") or next;
+          my $first = <$h>; close $h;
+          next unless defined $first;
+          chomp $first;
+          next unless $first eq $line;
+          ($time, $held_name) = ($1, $entry);
+          last;
+        }
+        closedir $dir;
+      }
+      $time = sprintf("%.6f", clock_gettime(CLOCK_MONOTONIC)) unless defined $time;
+      my $temp = "$queue/.$$.tmp";
+      open($ticket_fh, ">", $temp) or do { print $out "error cannot write a ticket in $queue: $!\n"; exit 1 };
+      flock($ticket_fh, LOCK_EX);
+      $ticket_fh->autoflush(1);
+      print $ticket_fh "$line\n";
+      my $name_of_ticket = "$time-$$";
+      unless (rename($temp, "$queue/$name_of_ticket")) {
+        my $why = $!;
+        unlink $temp;
+        print $out "error cannot write a ticket in $queue: $why\n";
+        exit 1;
+      }
+      $ticket = "$queue/$name_of_ticket";
+      unlink "$queue/$held_name" if defined $held_name;
+    }
     my ($lock, $held_file);
     my $start = time;
     my $next_note = 0;
     while (1) {
-      for my $slot (1 .. $slots) {
-        my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
-        open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
-        if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
-        close $next;
+      my ($place, $waiting) = $scan->();
+      if ($mode eq "try") {
+        if ($waiting) { print $out "busy " . $holder->() . "; $waiting waiting in line\n"; exit 0 }
+      }
+      if ($mode eq "try" || $place <= 1) {
+        for my $slot (1 .. $slots) {
+          my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
+          open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
+          if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
+          close $next;
+        }
       }
       last if defined $lock;
       exit 0 unless $caller_alive->();
       if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
-      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) {
+        # Keep the place for 120s: the same run asking again takes it back.
+        my $kept = "$ticket.held";
+        utime(time, time, $ticket);
+        if (rename($ticket, $kept)) { $ticket = undef }
+        print $out "timeout " . $holder->() . "\n";
+        exit 0;
+      }
       if (time >= $next_note) {
         my $m = int((time - $start) / 60);
         my $so_far = $m ? " (still, $m min so far)" : "";
-        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s): in use by " . $holder->() . "\n";
+        my $in_line = $place ? ", " . $ordinal->($place) . " in line" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s)$in_line: in use by " . $holder->() . "\n";
         $next_note = time + 60;
       }
       select(undef, undef, undef, 0.1);
     }
+    if (defined $ticket) { unlink $ticket; $ticket = undef }
     my $stopping = 0;
     $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { $stopping = 1 };
     my $held_since = time;
diff --git a/tests/fixtures/machine-lock/machine-lock-6.1.1.sh b/tests/fixtures/machine-lock/machine-lock-6.1.1.sh
new file mode 100644
index 000000000..d96e95ffb
--- /dev/null
+++ b/tests/fixtures/machine-lock/machine-lock-6.1.1.sh
@@ -0,0 +1,387 @@
+#!/bin/bash
+# Example. Copy into scripts/ci/ and own it.
+# bkit install does not write this file and does not overwrite a copy.
+#
+# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
+#
+#   . scripts/ci/bkit-machine-lock.sh
+#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
+#   local_stack_lock_holder [name]
+#   local_stack_lock_file [name]
+#
+# package.json: wrap test gates with
+#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
+# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
+# 2 usage, 73 the lock could not be taken, 75 the wait gave up.
+# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+# TERM, INT and HUP defer cancellation until the foreground command ends, keeping
+# its lock held throughout; the wrapper then returns the signal's exit status.
+#
+# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
+# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
+# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
+# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
+# Each holder records its checkout, process id and start time.
+#
+# Take locks in this order: tests, other named locks, then the unnamed stack lock.
+# A child reuses only the named or unnamed lock its live parent holds.
+# BKIT_TEST_SLOTS sets the tests slots (whole number >= 1, default 1). Taking tests
+# exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the runner to use.
+# LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
+# with a TTY. Named releases save each checkout's held seconds in <name>.last.
+# Waiting notes name every holder and that checkout's last run. CI=true / CI=1 is a no-op.
+# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
+# Requires Bash 3.2+ and /usr/bin/perl.
+
+_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
+LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
+_LOCAL_STACK_LOCK_EXIT=73
+
+# The stack's name: BKIT_LOCAL_STACK, else the main checkout's folder name, the same from every
+# worktree. Characters outside A-Z a-z 0-9 . _ - become _.
+local_stack_lock_name() {
+  _lsl_name="${BKIT_LOCAL_STACK:-}"
+  if [ -z "$_lsl_name" ]; then
+    _lsl_common="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
+    [ -n "$_lsl_common" ] || return 1
+    case "$(basename "$_lsl_common")" in
+      .git) _lsl_name="$(basename "$(dirname "$_lsl_common")")" ;;
+      *) _lsl_name="$(basename "$_lsl_common" .git)" ;;
+    esac
+  fi
+  printf '%s\n' "$_lsl_name" | LC_ALL=C tr -c 'A-Za-z0-9._\n-' '_'
+}
+
+# A named lock has one machine-wide path; the unnamed path remains stack-scoped.
+local_stack_lock_file() {
+  local _lsl_stack
+  if [ -n "${1:-}" ]; then
+    _lsl_stack="$(printf '%s' "$1" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/${_lsl_stack}.lock"
+  else
+    _lsl_stack="$(local_stack_lock_name)" || return 1
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
+  fi
+}
+
+# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock.
+local_stack_lock_holder() {
+  local _lsl_held _lsl_slot
+  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
+  if [ -f "${_lsl_held}.holder" ]; then
+    cat "${_lsl_held}.holder"
+  fi
+  if [ "${1:-}" = tests ]; then
+    for _lsl_slot in "${_lsl_held%.lock}".[0-9]*.lock.holder; do
+      [ -f "$_lsl_slot" ] && cat "$_lsl_slot"
+    done
+  fi
+  return 0
+}
+
+_local_stack_lock_slots() {
+  _lsl_slots="${BKIT_TEST_SLOTS-1}"
+  case "$_lsl_slots" in
+    *[!0-9]*|"") _lsl_slots=0 ;;
+    *) _lsl_slots=$((10#$_lsl_slots)) ;;
+  esac
+  if [ "$_lsl_slots" -lt 1 ]; then
+    if [ "${_LOCAL_STACK_LOCK_SLOTS_NOTED:-}" != 1 ]; then
+      echo "[machine-lock] invalid BKIT_TEST_SLOTS; using 1 slot" >&2
+      _LOCAL_STACK_LOCK_SLOTS_NOTED=1
+    fi
+    _lsl_slots=1
+  fi
+}
+
+_local_stack_lock_workers() {
+  local _lsl_cores="" _lsl_probe
+  for _lsl_probe in getconf nproc sysctl; do
+    case "$_lsl_probe" in
+      getconf) _lsl_cores="$(getconf _NPROCESSORS_ONLN 2>/dev/null)" || continue ;;
+      nproc) _lsl_cores="$(nproc 2>/dev/null)" || continue ;;
+      sysctl) _lsl_cores="$(sysctl -n hw.ncpu 2>/dev/null)" || continue ;;
+    esac
+    case "$_lsl_cores" in *[!0-9]*|""|0) continue ;; esac
+    break
+  done
+  case "$_lsl_cores" in *[!0-9]*|""|0) _lsl_cores=1 ;; esac
+  BKIT_TEST_WORKERS=$((_lsl_cores / _lsl_slots - 1))
+  [ "$BKIT_TEST_WORKERS" -ge 1 ] || BKIT_TEST_WORKERS=1
+  export BKIT_TEST_WORKERS
+}
+
+_local_stack_lock_vars() {
+  local _lsl_key
+  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+  _lsl_key="${_lsl_key//_/__}"
+  _lsl_key="${_lsl_key//-/_h}"
+  _lsl_key="${_lsl_key//./_d}"
+  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
+  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
+  _lsl_name_var="LOCAL_STACK_LOCK_NAME"
+  if [ -n "${1:-}" ]; then
+    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
+    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
+    _lsl_name_var="${_lsl_name_var}_${_lsl_key}"
+  fi
+}
+
+_local_stack_lock() {
+  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
+  local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_owner _lsl_existing
+  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
+  local _lsl_slots=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
+  _LOCAL_STACK_LOCK_EXIT=73
+  _local_stack_lock_vars "$_lsl_name"
+  _lsl_owner="${!_lsl_owner_var:-}"
+  _lsl_existing="${!_lsl_pid_var:-}"
+  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
+  if [ "$_lsl_name" = tests ]; then
+    _local_stack_lock_slots
+    _local_stack_lock_workers
+  fi
+  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
+  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi
+  if [ -n "$_lsl_name" ]; then
+    for _lsl_var in ${!LOCAL_STACK_LOCK_OWNER*}; do
+      _lsl_owner="${!_lsl_var:-}"
+      [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null || continue
+      if [ "$_lsl_var" = LOCAL_STACK_LOCK_OWNER ] || [ "$_lsl_name" = tests ]; then
+        _lsl_held_name_var="${_lsl_var/OWNER/NAME}"
+        _lsl_held_name="${!_lsl_held_name_var:-the unnamed stack lock}"
+        echo "[machine-lock] ❌ cannot take $_lsl_name while holding $_lsl_held_name: lock order is tests, other named locks, then the unnamed stack lock" >&2
+        return 1
+      fi
+    done
+  fi
+  if [ "${LOCAL_STACK_LOCK_WAIT_S+x}" = x ]; then
+    _lsl_wait="$LOCAL_STACK_LOCK_WAIT_S"
+  elif [ -t 0 ]; then
+    _lsl_wait=3600
+  else
+    _lsl_wait=60
+  fi
+
+  if ! _lsl_file="$(local_stack_lock_file "$_lsl_name")"; then
+    echo "[machine-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
+    return 1
+  fi
+  _lsl_label="the local stack $(basename "$_lsl_file" .lock)"
+  _lsl_checkout="$_LOCAL_STACK_LOCK_ROOT"
+  if [ -n "$_lsl_name" ]; then
+    _lsl_label="$_lsl_name"
+    _lsl_checkout="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")"
+  fi
+  if [ ! -x /usr/bin/perl ]; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: /usr/bin/perl not found" >&2
+    return 1
+  fi
+  if ! mkdir -p "$(dirname "$_lsl_file")"; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: cannot create $(dirname "$_lsl_file")" >&2
+    return 1
+  fi
+  _lsl_fifo="$(mktemp -u "${TMPDIR:-/tmp}/local-stack-lock.XXXXXX")"
+  mkfifo "$_lsl_fifo" || return 1
+
+  # The holder answers on the fifo once: ok, busy <holder>, timeout <holder> or error <why>.
+  /usr/bin/perl -e '
+    use strict;
+    use Fcntl qw(:flock);
+    use File::Glob qw(bsd_glob);
+    use POSIX qw(strftime);
+    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label, $slots, $name) = @ARGV;
+    # The caller is the parent of this process. When it exits, this process goes to init (or a
+    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
+    my $parent = getppid();
+    my $caller_alive = sub { getppid() == $parent };
+    open(my $out, ">", $fifo) or exit 1;
+    $out->autoflush(1);
+    my $stem = $file; $stem =~ s/\.lock$//;
+    my $history = "$stem.last";
+    my $holder = sub {
+      my @files = ("$file.holder");
+      push @files, grep { /^\Q$stem\E\.\d+\.lock\.holder$/ } bsd_glob("$stem.*.lock.holder") if $name eq "tests";
+      my @holders;
+      for my $held (@files) {
+        open(my $h, "<", $held) or next;
+        my $line = <$h>; close $h;
+        next unless defined $line;
+        chomp $line;
+        if (length $name) {
+          my ($held_checkout) = $line =~ / — (.*) \(pid /;
+          my $duration;
+          if (defined $held_checkout && open(my $last, "<", $history)) {
+            while (my $row = <$last>) {
+              chomp $row;
+              my ($path, $seconds) = split /\t/, $row, 2;
+              $duration = $seconds if $path eq $held_checkout && defined $seconds && $seconds =~ /^\d+$/;
+            }
+            close $last;
+          }
+          $line .= defined $duration ? ", last run took " . int($duration / 60) . "m" . ($duration % 60) . "s" : ", no earlier run";
+        }
+        push @holders, $line;
+      }
+      return @holders ? join("; ", @holders) : "another run";
+    };
+    my ($lock, $held_file);
+    my $start = time;
+    my $next_note = 0;
+    while (1) {
+      for my $slot (1 .. $slots) {
+        my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
+        open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
+        if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
+        close $next;
+      }
+      last if defined $lock;
+      exit 0 unless $caller_alive->();
+      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time >= $next_note) {
+        my $m = int((time - $start) / 60);
+        my $so_far = $m ? " (still, $m min so far)" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s): in use by " . $holder->() . "\n";
+        $next_note = time + 60;
+      }
+      select(undef, undef, undef, 0.1);
+    }
+    my $stopping = 0;
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { $stopping = 1 };
+    my $held_since = time;
+    if (open(my $h, ">", "$held_file.holder")) {
+      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
+      close $h;
+    }
+    print $out "ok\n";
+    close $out;
+    select(undef, undef, undef, 0.1) while !$stopping && $caller_alive->();
+    if (length $name) {
+      # Serialize history updates across slots; the portable shell replaces just this checkout row.
+      my $history_lock;
+      if (open($history_lock, ">>", "$history.lock") && flock($history_lock, LOCK_EX)) {
+        my $pattern = $checkout; $pattern =~ s/([.\[\]\\*^\$])/\\$1/g;
+        $pattern = "^$pattern\t";
+        my $status = system("bash", "-c", q{
+          history="$1"; pattern="$2"; checkout="$3"; held="$4"
+          tmp=$(mktemp "$history.XXXXXX") || exit 1
+          if [ -f "$history" ]; then
+            grep -v "$pattern" "$history" >"$tmp"
+            code=$?
+            if [ "$code" -gt 1 ]; then rm -f "$tmp"; exit 1; fi
+          fi
+          printf "%s\t%s\n" "$checkout" "$held" >>"$tmp" && mv "$tmp" "$history"
+        }, "machine-lock-history", $history, $pattern, $checkout, time - $held_since);
+        print STDERR "[machine-lock] could not record $name held time in $history\n" if $status;
+        close $history_lock;
+      } else { print STDERR "[machine-lock] could not lock $history for held-time history: $!\n" }
+    }
+    unlink "$held_file.holder";
+  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "$_lsl_wait" "$_lsl_mode" "$_lsl_label" "$_lsl_slots" "$_lsl_name" </dev/null >/dev/null &
+  _lsl_pid=$!
+  # The fifo is opened read-write, so the read never blocks on a holder that died before it
+  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
+  _lsl_reply="$(
+    exec 3<>"$_lsl_fifo"
+    while :; do
+      if IFS= read -r -t 1 _lsl_line <&3; then
+        printf '%s' "$_lsl_line"
+        break
+      fi
+      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
+        # The holder may have answered and exited between the read timing out and this check.
+        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
+        break
+      fi
+    done
+  )" || true
+  rm -f "$_lsl_fifo"
+
+  case "$_lsl_reply" in
+    ok)
+      printf -v "$_lsl_pid_var" '%s' "$_lsl_pid"
+      printf -v "$_lsl_owner_var" '%s' "$$"
+      export "$_lsl_owner_var"
+      printf -v "$_lsl_name_var" '%s' "${_lsl_name:-the unnamed stack lock}"
+      export "$_lsl_name_var"
+      return 0
+      ;;
+    busy\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
+      ;;
+    timeout\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] ❌ $_lsl_who gave up after ${_lsl_wait}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
+      echo "[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
+      ;;
+    "")
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: the perl process holding it stopped before it answered" >&2
+      ;;
+    *)
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: ${_lsl_reply#error }" >&2
+      ;;
+  esac
+  wait "$_lsl_pid" 2>/dev/null || true
+  return 1
+}
+
+take_local_stack_lock() { _local_stack_lock wait "$1" "${2:-}"; }
+try_local_stack_lock() { _local_stack_lock try "$1" "${2:-}"; }
+
+release_local_stack_lock() {
+  local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_release_pid
+  _local_stack_lock_vars "${1:-}"
+  _lsl_release_pid="${!_lsl_pid_var:-}"
+  [ -n "$_lsl_release_pid" ] || return 0
+  kill "$_lsl_release_pid" 2>/dev/null || true
+  wait "$_lsl_release_pid" 2>/dev/null || true
+  printf -v "$_lsl_pid_var" '%s' ""
+  unset "$_lsl_owner_var"
+  unset "$_lsl_name_var"
+  return 0
+}
+
+if [ "${BASH_SOURCE[0]}" = "$0" ]; then
+  _lsl_run_usage() {
+    echo 'usage: bash scripts/ci/bkit-machine-lock.sh run ["<who>"] [--lock <name>] -- <command> [args…]' >&2
+    exit 2
+  }
+  [ "${1:-}" = run ] || _lsl_run_usage
+  shift
+  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
+  _lsl_run_name=""
+  case "${1:-}" in
+    --lock|--) ;;
+    "") _lsl_run_usage ;;
+    *) _lsl_run_who="$1"; shift ;;
+  esac
+  if [ "${1:-}" = --lock ]; then
+    [ -n "${2:-}" ] && [ "$2" != -- ] || _lsl_run_usage
+    _lsl_run_name="$2"
+    shift 2
+  fi
+  [ "${1:-}" = -- ] || _lsl_run_usage
+  shift
+  [ "$#" -gt 0 ] || _lsl_run_usage
+  take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  _lsl_run_signal_status=0
+  _lsl_run_cancel() {
+    _lsl_run_signal_status="$1"
+    echo "[machine-lock] cancellation requested; waiting for $_lsl_run_who to finish before releasing its lock" >&2
+  }
+  # Bash runs these traps after its foreground command ends. Keeping this owner
+  # alive also keeps the Perl holder alive while that command finishes naturally.
+  trap '_lsl_run_cancel 143' TERM
+  trap '_lsl_run_cancel 130' INT
+  trap '_lsl_run_cancel 129' HUP
+  "$@"
+  _lsl_run_status=$?
+  release_local_stack_lock "$_lsl_run_name"
+  [ "$_lsl_run_signal_status" -eq 0 ] || _lsl_run_status="$_lsl_run_signal_status"
+  exit "$_lsl_run_status"
+fi
