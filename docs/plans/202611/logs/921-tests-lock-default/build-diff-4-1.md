diff --git a/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts b/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts
index 7ecc6c2e8..f3ae12596 100644
--- a/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts
@@ -69,11 +69,13 @@ function independentEnv(): NodeJS.ProcessEnv {
   return env;
 }
 
-async function holder() {
+async function holder(pathPrefix = "") {
+  const env = independentEnv();
+  env.PATH = pathPrefix + path.delimiter + (env.PATH ?? "");
   const child = spawn(
     "bash",
     [SCRIPT, "run", "wrapped gate holder", "--lock", "tests", "--", "sleep", "30"],
-    { env: independentEnv(), stdio: "ignore", detached: true },
+    { env, stdio: "ignore", detached: true },
   );
   children.push(child);
   const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
@@ -136,6 +138,38 @@ describe("raw Vitest global setup against wrapped gates", () => {
     expect(probe().status).toBe(75);
   });
 
+  it("with slots unset on 10 cores, the global setup waits for a held tests lock", async () => {
+    const bin = path.join(tmp, "core-probe-10");
+    fs.mkdirSync(bin);
+    fs.writeFileSync(
+      path.join(bin, "getconf"),
+      '#!/bin/sh\n[ "$1" = _NPROCESSORS_ONLN ] || exit 1\nprintf "10\\n"\n',
+      { mode: 0o755 },
+    );
+    vi.stubEnv("PATH", prependPath(bin));
+    delete process.env.BKIT_TEST_SLOTS;
+    const held = await holder(bin);
+    let settled = false;
+    const pending = Promise.resolve(setup(PROJECT)).then(
+      (value) => {
+        settled = true;
+        return { value, error: null };
+      },
+      (error: unknown) => {
+        settled = true;
+        return { value: undefined, error };
+      },
+    );
+    await delay(200);
+    const settledWhileHeld = settled;
+    stopHolder(held.child);
+    await held.done;
+    const acquired = await pending;
+    teardown = acquired.value;
+    expect(settledWhileHeld).toBe(false);
+    expect(acquired.error).toBeNull();
+  });
+
   it("the global setup throws naming the holder when the wait gives up", async () => {
     const held = await holder();
     const line = fs.readFileSync(holderFile, "utf-8").trim();
@@ -177,3 +211,7 @@ describe("raw Vitest global setup against wrapped gates", () => {
     expect(config).toMatch(/\.\.\.testWorkers\(\)/);
   });
 });
+
+function prependPath(dir: string): string {
+  return dir + path.delimiter + (process.env.PATH ?? "");
+}
diff --git a/vitest.test-lock.ts b/vitest.test-lock.ts
index fee077d1b..58dd0cfeb 100644
--- a/vitest.test-lock.ts
+++ b/vitest.test-lock.ts
@@ -81,7 +81,12 @@ export default async function setup(
       "-c",
       'printf "locked %s\\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat <&3 >/dev/null',
     ],
-    { stdio: ["inherit", "pipe", "pipe", "pipe"] },
+    {
+      stdio: ["inherit", "pipe", "pipe", "pipe"],
+      // Vitest fixed its worker count before this lock was taken, so a second slot would
+      // run cores - 1 workers beside another holder; queue behind it unless the owner chose.
+      env: { ...process.env, BKIT_TEST_SLOTS: process.env.BKIT_TEST_SLOTS ?? "1" },
+    },
   );
   let stderr = "";
   const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null; error?: Error }>(
