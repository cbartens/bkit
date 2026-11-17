diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
index f59bb23ed..bf87943b3 100644
--- a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -74,9 +74,30 @@ function envFor(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
   }
   delete env.BKIT_TEST_SLOTS;
   delete env.BKIT_LOCAL_STACK;
+  if (extra.PATH === undefined) env.PATH = coreProbeBin(4) + path.delimiter + env.PATH;
   return { ...env, ...extra };
 }
 
+/** A folder holding a fake `getconf` that reports `cores`; with null, every core probe fails. */
+function coreProbeBin(cores: number | null): string {
+  const bin = path.join(tmp, "core-probe-" + String(cores));
+  if (fs.existsSync(bin)) return bin;
+  fs.mkdirSync(bin);
+  const body =
+    cores === null
+      ? "#!/bin/sh\nexit 1\n"
+      : `#!/bin/sh\n[ "$1" = _NPROCESSORS_ONLN ] || exit 1\nprintf "${cores}\\n"\n`;
+  for (const name of cores === null ? ["getconf", "nproc", "sysctl"] : ["getconf"]) {
+    fs.writeFileSync(path.join(bin, name), body, { mode: 0o755 });
+  }
+  return bin;
+}
+
+/** The test's env with the machine reporting `cores`; `BKIT_TEST_SLOTS` stays unset unless passed. */
+function coresEnv(cores: number | null, extra: Record<string, string> = {}): NodeJS.ProcessEnv {
+  return envFor({ PATH: coreProbeBin(cores) + path.delimiter + process.env.PATH, ...extra });
+}
+
 /** Runs a bash snippet with `script` sourced. */
 function run(
   snippet: string,
@@ -308,6 +329,88 @@ describe("machine lock slots, order and wait budgets", () => {
     expect(results.map((result) => result.stdout)).toEqual(["9", "4", "1"]);
   });
 
+  it("with slots unset on 10 cores, two runs hold tests at once and a third waits naming both", async () => {
+    const env = coresEnv(10, { LOCAL_STACK_LOCK_WAIT_S: "2" });
+    const first = slotHolder("first core slot", env);
+    await waitForOutput(first, "acquired");
+    const second = slotHolder("second core slot", env);
+    await waitForOutput(second, "acquired");
+    const third = commandRun(["third core slot", "--lock", "tests", "--", "echo", "entered"], env);
+    expect(third.status).toBe(75);
+    expect(third.stdout).not.toContain("entered");
+    expect(third.stderr).toContain("first core slot");
+    expect(third.stderr).toContain("second core slot");
+  });
+
+  it("with slots unset on 7 cores, a second run waits behind the first", async () => {
+    const env = coresEnv(7, { LOCAL_STACK_LOCK_WAIT_S: "1" });
+    const first = slotHolder("only core slot", env);
+    await waitForOutput(first, "acquired");
+    const second = commandRun(["second", "--lock", "tests", "--", "echo", "entered"], env);
+    expect(second.status).toBe(75);
+    expect(second.stdout).not.toContain("entered");
+    expect(second.stderr).toContain("only core slot");
+  });
+
+  it("with slots unset, BKIT_TEST_WORKERS follows the core-count slots", () => {
+    const workers = (cores: number) =>
+      commandRun(
+        ["workers", "--lock", "tests", "--", "bash", "-c", 'printf "%s" "$BKIT_TEST_WORKERS"'],
+        coresEnv(cores),
+      );
+    const results = [10, 8, 7].map(workers);
+    expect(results.map((result) => result.status)).toEqual([0, 0, 0]);
+    expect(results.map((result) => result.stdout)).toEqual(["4", "3", "6"]);
+  });
+
+  it("a set BKIT_TEST_SLOTS overrides the core-count default both ways", async () => {
+    const one = coresEnv(10, { BKIT_TEST_SLOTS: "1", LOCAL_STACK_LOCK_WAIT_S: "1" });
+    const holder = slotHolder("override one", one);
+    await waitForOutput(holder, "acquired");
+    const blocked = commandRun(["next", "--lock", "tests", "--", "echo", "entered"], one);
+    expect(blocked.status).toBe(75);
+    expect(blocked.stdout).not.toContain("entered");
+    const three = coresEnv(4, { BKIT_TEST_SLOTS: "3", LOCAL_STACK_LOCK_WAIT_S: "1" });
+    const extra = [slotHolder("three a", three), slotHolder("three b", three)];
+    for (const h of extra) await waitForOutput(h, "acquired");
+    const third = slotHolder("three c", three);
+    await waitForOutput(third, "acquired");
+    const fourth = commandRun(["fourth", "--lock", "tests", "--", "echo", "entered"], three);
+    expect(fourth.status).toBe(75);
+    expect(fourth.stderr).toContain("three c");
+  });
+
+  it("an invalid slots value falls back to the core-count default and names it", async () => {
+    const twice =
+      "take_local_stack_lock invalid tests || exit 1; release_local_stack_lock tests; take_local_stack_lock again tests || exit 1; release_local_stack_lock tests";
+    const ten = run(twice, coresEnv(10, { BKIT_TEST_SLOTS: "garbage" }));
+    expect(ten.status).toBe(0);
+    expect(ten.stderr.match(/BKIT_TEST_SLOTS/g)?.length).toBe(1);
+    expect(ten.stderr).toContain("[machine-lock] invalid BKIT_TEST_SLOTS; using 2 slot(s)");
+    const four = run(twice, coresEnv(4, { BKIT_TEST_SLOTS: "0" }));
+    expect(four.status).toBe(0);
+    expect(four.stderr.match(/BKIT_TEST_SLOTS/g)?.length).toBe(1);
+    expect(four.stderr).toContain("[machine-lock] invalid BKIT_TEST_SLOTS; using 1 slot(s)");
+    const env = coresEnv(10, { BKIT_TEST_SLOTS: "-1", LOCAL_STACK_LOCK_WAIT_S: "2" });
+    const first = slotHolder("fallback first", env);
+    await waitForOutput(first, "acquired");
+    const second = slotHolder("fallback second", env);
+    await waitForOutput(second, "acquired");
+    const third = commandRun(["third", "--lock", "tests", "--", "echo", "entered"], env);
+    expect(third.status).toBe(75);
+    expect(third.stdout).not.toContain("entered");
+  });
+
+  it("with no working core probe, slots unset gives one slot", async () => {
+    const env = coresEnv(null, { LOCAL_STACK_LOCK_WAIT_S: "1" });
+    const first = slotHolder("no probe holder", env);
+    await waitForOutput(first, "acquired");
+    const second = commandRun(["second", "--lock", "tests", "--", "echo", "entered"], env);
+    expect(second.status).toBe(75);
+    expect(second.stdout).not.toContain("entered");
+    expect(second.stderr).toContain("no probe holder");
+  });
+
   it("a killed tests-lock holder frees its slot within a second and the waiter starts", async () => {
     const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "5" });
     const holder = slotHolder("doomed holder", env);
diff --git a/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts
index cb95aa6e4..02ab3363b 100644
--- a/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts
@@ -130,7 +130,11 @@ function push(extra: Record<string, string>) {
 describe("branches push through a real pre-push lock", () => {
   it("branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock", async () => {
     const holder = await hold();
-    const result = push({ BKIT_LOCK_WAIT_S: "0", LOCAL_STACK_LOCK_WAIT_S: "0" });
+    const result = push({
+      BKIT_LOCK_WAIT_S: "0",
+      LOCAL_STACK_LOCK_WAIT_S: "0",
+      BKIT_TEST_SLOTS: "1",
+    });
     expect(result.status, result.stderr).toBe(81);
     expect(result.json).toMatchObject({
       pushed: false,
diff --git a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
index 99653724e..b5f0b353e 100644
--- a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
@@ -79,6 +79,7 @@ beforeEach(() => {
     )
       delete env[key];
   }
+  env.BKIT_TEST_SLOTS = "1";
   fs.mkdirSync(path.join(cwd, "scripts", "ci"), { recursive: true });
   fs.mkdirSync(path.join(cwd, "src"));
   fs.copyFileSync(TEMPLATE, path.join(cwd, "scripts", "ci", "bkit-machine-lock.sh"));
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
index 16444eac0..926223fad 100644
--- a/.bkit/templates/scripts/ci/bkit-machine-lock.sh
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -27,7 +27,7 @@
 #
 # Take locks in this order: tests, other named locks, then the unnamed stack lock.
 # A child reuses only the named or unnamed lock its live parent holds.
-# BKIT_TEST_SLOTS sets the tests slots (whole number >= 1, default 1). Taking tests
+# The tests slots default to 2 with 8 or more cores, else 1; BKIT_TEST_SLOTS (whole number >= 1) overrides. Taking tests
 # exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the runner to use.
 # LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
 # with a TTY. Named releases save each checkout's held seconds in <name>.last.
@@ -89,33 +89,43 @@ local_stack_lock_holder() {
   return 0
 }
 
+_local_stack_lock_cores() {
+  local _lsl_probe
+  _lsl_cores=""
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
+}
+
 _local_stack_lock_slots() {
-  _lsl_slots="${BKIT_TEST_SLOTS-1}"
+  local _lsl_default=1
+  [ "$_lsl_cores" -ge 8 ] && _lsl_default=2
+  if [ "${BKIT_TEST_SLOTS+x}" != x ]; then
+    _lsl_slots="$_lsl_default"
+    return 0
+  fi
+  _lsl_slots="$BKIT_TEST_SLOTS"
   case "$_lsl_slots" in
     *[!0-9]*|"") _lsl_slots=0 ;;
     *) _lsl_slots=$((10#$_lsl_slots)) ;;
   esac
   if [ "$_lsl_slots" -lt 1 ]; then
     if [ "${_LOCAL_STACK_LOCK_SLOTS_NOTED:-}" != 1 ]; then
-      echo "[machine-lock] invalid BKIT_TEST_SLOTS; using 1 slot" >&2
+      echo "[machine-lock] invalid BKIT_TEST_SLOTS; using $_lsl_default slot(s)" >&2
       _LOCAL_STACK_LOCK_SLOTS_NOTED=1
     fi
-    _lsl_slots=1
+    _lsl_slots="$_lsl_default"
   fi
 }
 
 _local_stack_lock_workers() {
-  local _lsl_cores="" _lsl_probe
-  for _lsl_probe in getconf nproc sysctl; do
-    case "$_lsl_probe" in
-      getconf) _lsl_cores="$(getconf _NPROCESSORS_ONLN 2>/dev/null)" || continue ;;
-      nproc) _lsl_cores="$(nproc 2>/dev/null)" || continue ;;
-      sysctl) _lsl_cores="$(sysctl -n hw.ncpu 2>/dev/null)" || continue ;;
-    esac
-    case "$_lsl_cores" in *[!0-9]*|""|0) continue ;; esac
-    break
-  done
-  case "$_lsl_cores" in *[!0-9]*|""|0) _lsl_cores=1 ;; esac
   BKIT_TEST_WORKERS=$((_lsl_cores / _lsl_slots - 1))
   [ "$BKIT_TEST_WORKERS" -ge 1 ] || BKIT_TEST_WORKERS=1
   export BKIT_TEST_WORKERS
@@ -141,13 +151,14 @@ _local_stack_lock() {
   local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
   local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_owner _lsl_existing
   local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
-  local _lsl_slots=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
+  local _lsl_slots=1 _lsl_cores=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
   _LOCAL_STACK_LOCK_EXIT=73
   _local_stack_lock_vars "$_lsl_name"
   _lsl_owner="${!_lsl_owner_var:-}"
   _lsl_existing="${!_lsl_pid_var:-}"
   if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
   if [ "$_lsl_name" = tests ]; then
+    _local_stack_lock_cores
     _local_stack_lock_slots
     _local_stack_lock_workers
   fi
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
index 16444eac0..926223fad 100644
--- a/scripts/ci/bkit-machine-lock.sh
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -27,7 +27,7 @@
 #
 # Take locks in this order: tests, other named locks, then the unnamed stack lock.
 # A child reuses only the named or unnamed lock its live parent holds.
-# BKIT_TEST_SLOTS sets the tests slots (whole number >= 1, default 1). Taking tests
+# The tests slots default to 2 with 8 or more cores, else 1; BKIT_TEST_SLOTS (whole number >= 1) overrides. Taking tests
 # exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the runner to use.
 # LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
 # with a TTY. Named releases save each checkout's held seconds in <name>.last.
@@ -89,33 +89,43 @@ local_stack_lock_holder() {
   return 0
 }
 
+_local_stack_lock_cores() {
+  local _lsl_probe
+  _lsl_cores=""
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
+}
+
 _local_stack_lock_slots() {
-  _lsl_slots="${BKIT_TEST_SLOTS-1}"
+  local _lsl_default=1
+  [ "$_lsl_cores" -ge 8 ] && _lsl_default=2
+  if [ "${BKIT_TEST_SLOTS+x}" != x ]; then
+    _lsl_slots="$_lsl_default"
+    return 0
+  fi
+  _lsl_slots="$BKIT_TEST_SLOTS"
   case "$_lsl_slots" in
     *[!0-9]*|"") _lsl_slots=0 ;;
     *) _lsl_slots=$((10#$_lsl_slots)) ;;
   esac
   if [ "$_lsl_slots" -lt 1 ]; then
     if [ "${_LOCAL_STACK_LOCK_SLOTS_NOTED:-}" != 1 ]; then
-      echo "[machine-lock] invalid BKIT_TEST_SLOTS; using 1 slot" >&2
+      echo "[machine-lock] invalid BKIT_TEST_SLOTS; using $_lsl_default slot(s)" >&2
       _LOCAL_STACK_LOCK_SLOTS_NOTED=1
     fi
-    _lsl_slots=1
+    _lsl_slots="$_lsl_default"
   fi
 }
 
 _local_stack_lock_workers() {
-  local _lsl_cores="" _lsl_probe
-  for _lsl_probe in getconf nproc sysctl; do
-    case "$_lsl_probe" in
-      getconf) _lsl_cores="$(getconf _NPROCESSORS_ONLN 2>/dev/null)" || continue ;;
-      nproc) _lsl_cores="$(nproc 2>/dev/null)" || continue ;;
-      sysctl) _lsl_cores="$(sysctl -n hw.ncpu 2>/dev/null)" || continue ;;
-    esac
-    case "$_lsl_cores" in *[!0-9]*|""|0) continue ;; esac
-    break
-  done
-  case "$_lsl_cores" in *[!0-9]*|""|0) _lsl_cores=1 ;; esac
   BKIT_TEST_WORKERS=$((_lsl_cores / _lsl_slots - 1))
   [ "$BKIT_TEST_WORKERS" -ge 1 ] || BKIT_TEST_WORKERS=1
   export BKIT_TEST_WORKERS
@@ -141,13 +151,14 @@ _local_stack_lock() {
   local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
   local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_owner _lsl_existing
   local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
-  local _lsl_slots=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
+  local _lsl_slots=1 _lsl_cores=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
   _LOCAL_STACK_LOCK_EXIT=73
   _local_stack_lock_vars "$_lsl_name"
   _lsl_owner="${!_lsl_owner_var:-}"
   _lsl_existing="${!_lsl_pid_var:-}"
   if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
   if [ "$_lsl_name" = tests ]; then
+    _local_stack_lock_cores
     _local_stack_lock_slots
     _local_stack_lock_workers
   fi
