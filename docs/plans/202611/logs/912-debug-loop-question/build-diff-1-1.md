diff --git a/.bkit/core/engine/commands/workflow/counters.test.ts b/.bkit/core/engine/commands/workflow/counters.test.ts
index 50a7ef73b..92a36956d 100644
--- a/.bkit/core/engine/commands/workflow/counters.test.ts
+++ b/.bkit/core/engine/commands/workflow/counters.test.ts
@@ -919,6 +919,190 @@ describe("bkit counters progress", () => {
     expect((await progress(file)).json).toMatchObject({ codeChanged: true, trend: "closing" });
   });
 
+  it("a round with no count reports unknown and no recommendation", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 5, "a"),
+      fix("2026-10-01T00:20:00Z", "STANDARD"),
+      done("build", "build-plan-verify", "2026-10-01T00:30:00Z", { parentSha: "b", group: 1 }),
+    ]);
+    const r = await progress(file);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ counts: "5 → ?", trend: "unknown", recommend: null });
+  });
+
+  const scoped = (at: string, scope: string, failures: number | null, sha: string) =>
+    done("build", "build-plan-verify", at, {
+      scope,
+      parentSha: sha,
+      group: 1,
+      ...(failures === null ? {} : { failures }),
+    });
+  const GATE = "pnpm bkit:gate:static-unit";
+
+  it("does not compare a CI round with a local gate round", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      scoped("2026-10-01T00:10:00Z", "ci:123", 3, "a"),
+      scoped("2026-10-01T00:30:00Z", GATE, 3, "b"),
+    ]);
+    const r = await progress(file);
+    expect(r.json).toMatchObject({ trend: "unknown", recommend: null });
+  });
+
+  it("compares the last round with the earliest round of the same scope", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
+      scoped("2026-10-01T00:20:00Z", GATE, 5, "b"),
+      scoped("2026-10-01T00:30:00Z", GATE, 2, "c"),
+    ]);
+    const r = await progress(file);
+    expect(r.json).toMatchObject({ trend: "closing", recommend: "try-again" });
+  });
+
+  it("reports each round's scope", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
+      verify("2026-10-01T00:30:00Z", 2, "b"),
+    ]);
+    const r = await progress(file);
+    expect(r.json.rounds.map((x: { scope: string | null }) => x.scope)).toEqual(["ci:123", null]);
+  });
+
+  it("judges codeChanged between the compared same-scope rounds", async () => {
+    const repo = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-git-"));
+    dirs.push(repo);
+    const sh = (...a: string[]) =>
+      spawnSync("git", a, { cwd: repo, encoding: "utf-8" }).stdout.trim();
+    const commit = (m: string) =>
+      sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", m);
+    sh("init", "-q");
+    commit("a");
+    const a = sh("rev-parse", "HEAD");
+    fs.writeFileSync(path.join(repo, "src.ts"), "x\n");
+    sh("add", "-A");
+    commit("src");
+    const b = sh("rev-parse", "HEAD");
+    const logs = path.join(repo, "docs", "plans", "202610", "logs", "1-x");
+    fs.mkdirSync(logs, { recursive: true });
+    fs.writeFileSync(path.join(logs, "note.md"), "log only\n");
+    sh("add", "-A");
+    commit("logs");
+    const c = sh("rev-parse", "HEAD");
+    const file = path.join(logs, "status.jsonl");
+    fs.writeFileSync(
+      file,
+      [
+        started("build", "2026-10-01T00:00:00Z"),
+        scoped("2026-10-01T00:10:00Z", "ci:123", 9, a),
+        scoped("2026-10-01T00:20:00Z", GATE, 5, b),
+        scoped("2026-10-01T00:30:00Z", GATE, 2, c),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const r = await progress(file);
+    expect(r.json).toMatchObject({ codeChanged: false, trend: "stuck" });
+  });
+
+  it("trendLine names an unknown count instead of claiming no fewer failures", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 5, "a"),
+      done("build", "build-plan-verify", "2026-10-01T00:30:00Z", { parentSha: "b", group: 1 }),
+    ]);
+    const r = await progress(file);
+    expect(r.json.trendLine).toContain("recorded no count");
+    expect(r.json.trendLine).not.toContain("no fewer");
+  });
+
+  it("trendLine says the rounds ran different tests", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      scoped("2026-10-01T00:10:00Z", "ci:123", 3, "a"),
+      scoped("2026-10-01T00:30:00Z", GATE, 3, "b"),
+    ]);
+    const r = await progress(file);
+    expect(r.json.trendLine).toContain("ran different tests");
+  });
+
+  it("trendLine for a fall without a code change says no source code changed", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 5, "nope1"),
+      verify("2026-10-01T00:30:00Z", 2, "nope2"),
+    ]);
+    const base = (await progress(file)).json;
+    expect(base.codeChanged).toBeNull();
+    const repo = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-git-"));
+    dirs.push(repo);
+    const sh = (...a: string[]) =>
+      spawnSync("git", a, { cwd: repo, encoding: "utf-8" }).stdout.trim();
+    sh("init", "-q");
+    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "a");
+    const a = sh("rev-parse", "HEAD");
+    const logs = path.join(repo, "docs", "plans", "202610", "logs", "1-x");
+    fs.mkdirSync(logs, { recursive: true });
+    fs.writeFileSync(path.join(logs, "note.md"), "log only\n");
+    sh("add", "-A");
+    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "logs");
+    const b = sh("rev-parse", "HEAD");
+    const gitFile = path.join(logs, "status.jsonl");
+    fs.writeFileSync(
+      gitFile,
+      [
+        started("build", "2026-10-01T00:00:00Z"),
+        verify("2026-10-01T00:10:00Z", 5, a),
+        verify("2026-10-01T00:30:00Z", 2, b),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const r = await progress(gitFile);
+    expect(r.json.trend).toBe("stuck");
+    expect(r.json.trendLine).toContain("no source code changed");
+  });
+
+  it("trendLine for the same count states both counts", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 21, "a"),
+      fix("2026-10-01T00:20:00Z", "PIVOT"),
+      verify("2026-10-01T00:30:00Z", 21, "b"),
+    ]);
+    const r = await progress(file);
+    expect(r.json.trendLine).toContain("(21 → 21)");
+  });
+
+  it("trendLine prefers different scopes over a missing count", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
+      scoped("2026-10-01T00:30:00Z", GATE, null, "b"),
+    ]);
+    const r = await progress(file);
+    expect(r.json.trendLine).toContain("ran different tests");
+    expect(r.json.trendLine).not.toContain("recorded no count");
+  });
+
+  it("--since-clean over unscoped holistic rounds still compares them", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      done("build", "build-holistic-check", "2026-10-01T00:05:00Z", {
+        failures: 0,
+        parentSha: "z",
+      }),
+      verify("2026-10-01T00:10:00Z", 5, "a"),
+      verify("2026-10-01T00:30:00Z", 2, "b"),
+    ]);
+    const r = await progress(file, "--since-clean");
+    expect(r.code).toBe(0);
+    expect(r.json.counts).toBe("5 → 2");
+    expect(r.json.trend).not.toBe("unknown");
+  });
+
   it("exits 3 on a missing file", async () => {
     expect((await progress("/nonexistent/status.jsonl")).code).toBe(3);
   });
@@ -992,7 +1176,8 @@ describe("loopProgress with a gate", () => {
     const r = progress(file);
     expect(r.json.counts).toBe("2 → ?");
     expect(r.json.rounds[1].failures).toBeNull();
-    expect(r.json.trend).toBe("stuck");
+    expect(r.json.trend).toBe("unknown");
+    expect(r.json.recommend).toBeNull();
   });
 
   it("a red gate row with 0 counted failures makes the round unknown", async () => {
@@ -1004,7 +1189,8 @@ describe("loopProgress with a gate", () => {
     ]);
     const r = progress(file);
     expect(r.json.counts).toBe("2 → ?");
-    expect(r.json.trend).toBe("stuck");
+    expect(r.json.trend).toBe("unknown");
+    expect(r.json.recommend).toBeNull();
   });
 
   it("a verify round whose gate did not run adds no gate failures", async () => {
@@ -1025,9 +1211,14 @@ describe("loopTrend", () => {
   it("a fall without a code change is stuck, not closing", () => {
     expect(loopTrend([r(5), r(2)], false)).toBe("stuck");
     expect(loopTrend([r(5), r(2)], true)).toBe("closing");
-    expect(loopTrend([r(5), r()], true)).toBe("stuck");
     expect(loopTrend([r(5)], true)).toBe("first-round");
   });
+
+  it("a missing count is unknown, not stuck", () => {
+    expect(loopTrend([r(5), r()], true)).toBe("unknown");
+    expect(loopTrend([r(), r(5)], true)).toBe("unknown");
+    expect(loopTrend([r(), r()], false)).toBe("unknown");
+  });
 });
 
 describe("bkit counters max", () => {
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index 5bc7be7ad..92e5f10d8 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -322,17 +322,18 @@ function checkoutOf(file: string, cwd: string): string {
   return at < 0 ? cwd : abs.slice(0, at);
 }
 
-export type LoopTrend = "first-round" | "closing" | "stuck" | "worse";
+export type LoopTrend = "first-round" | "closing" | "stuck" | "worse" | "unknown";
 
 /**
  * The loop's direction from its check rounds: `worse` when the problem count rose,
- * `closing` when it fell and the rounds changed code, `stuck` otherwise.
+ * `closing` when it fell and the rounds changed code, `stuck` otherwise, and `unknown` when
+ * the first or last round recorded no count.
  */
 export function loopTrend(rounds: Step[], codeChanged: boolean | null): LoopTrend {
   if (rounds.length < 2) return "first-round";
   const first = rounds[0]?.failures;
   const last = rounds.at(-1)?.failures;
-  if (first === undefined || last === undefined) return "stuck";
+  if (first === undefined || last === undefined) return "unknown";
   if (last > first) return "worse";
   if (last < first && codeChanged !== false) return "closing";
   return "stuck";
@@ -376,6 +377,8 @@ export interface LoopProgress {
     failures: number | null;
     /** The group gate's failing tests for this round; null when unknown. Absent with no gate. */
     gateFailures?: number | null;
+    /** What the round ran, e.g. `ci:123`; null when the row has no scope. */
+    scope: string | null;
     at: string;
   }[];
   counts: string;
@@ -387,6 +390,8 @@ export interface LoopProgress {
   finalSpent: boolean;
   minutesPerRound: number | null;
   trend: LoopTrend;
+  /** One plain sentence on what the counts show; names no unit. */
+  trendLine: string;
   recommend: "try-again" | "stop" | null;
 }
 
@@ -425,8 +430,9 @@ export function loopProgress(
     return { ...r, failures };
   });
   const fixes = done(fix);
-  const first = rounds[0];
   const last = rounds.at(-1);
+  // Only rounds that ran the same tests are compared: the earliest round with the last round's scope.
+  const first = last === undefined ? undefined : rounds.find((r) => r.scope === last.scope);
   let codeChanged: boolean | null = null;
   if (first && last && first !== last && first.parentSha && last.parentSha) {
     const diff = runGit(checkoutOf(file, cwd), [
@@ -442,7 +448,35 @@ export function loopProgress(
     else if (diff.stderr === "") codeChanged = true;
   }
   const ladder = lastDoneStepAllRuns(runs, workflow, { step: fix, group })?.strategy;
-  const trend = loopTrend(rounds, codeChanged);
+  const sameScope = first !== undefined && last !== undefined && first !== last;
+  const differentScopes = rounds.length >= 2 && !sameScope;
+  const trend: LoopTrend =
+    rounds.length < 2
+      ? "first-round"
+      : differentScopes
+        ? "unknown"
+        : loopTrend([first as Step, last as Step], codeChanged);
+  const countOf = (r: Step | undefined) => (r?.failures === undefined ? "?" : String(r.failures));
+  const pairCounts = `${countOf(first)} → ${countOf(last)}`;
+  const firstFailures = first?.failures;
+  const lastFailures = last?.failures;
+  let trendLine: string;
+  if (trend === "first-round") trendLine = "This was the first round, so there is no trend yet.";
+  else if (differentScopes)
+    trendLine = `The rounds ran different tests (${rounds[0]?.scope ?? "unscoped"}, then ${last?.scope ?? "unscoped"}), so their counts cannot be compared.`;
+  else if (trend === "unknown")
+    trendLine = `A round recorded no count (${rounds.map(countOf).join(" → ")}), so progress cannot be judged.`;
+  else if (trend === "closing")
+    trendLine = `The count fell between the first and the last round (${pairCounts}), and the code changed.`;
+  else if (trend === "worse")
+    trendLine = `The count rose between the first and the last round (${pairCounts}).`;
+  else if (
+    firstFailures !== undefined &&
+    lastFailures !== undefined &&
+    lastFailures < firstFailures
+  )
+    trendLine = `The count fell (${pairCounts}), but no source code changed between the rounds.`;
+  else trendLine = `The count did not fall between the first and the last round (${pairCounts}).`;
   const span =
     first && last && rounds.length > 1
       ? (Date.parse(last.at) - Date.parse(first.at)) / 60000 / (rounds.length - 1)
@@ -452,6 +486,7 @@ export function loopProgress(
       attempt: r.attempt ?? null,
       failures: r.failures ?? null,
       ...(gateFailures[i] === undefined ? {} : { gateFailures: gateFailures[i] }),
+      scope: r.scope ?? null,
       at: r.at,
     })),
     counts: rounds.map((r) => (r.failures === undefined ? "?" : String(r.failures))).join(" → "),
@@ -468,7 +503,13 @@ export function loopProgress(
     finalSpent: fixes.some((r) => r.strategy === "FINAL") || ladder === "FINAL",
     minutesPerRound: span === null || Number.isNaN(span) ? null : Math.round(span),
     trend,
-    recommend: trend === "first-round" ? null : trend === "closing" ? "try-again" : "stop",
+    trendLine,
+    recommend:
+      trend === "first-round" || trend === "unknown"
+        ? null
+        : trend === "closing"
+          ? "try-again"
+          : "stop",
   };
 }
 
@@ -839,19 +880,23 @@ export const countersCommand: CommandSpec = {
         },
       ],
       output: {
-        rounds: "the check rounds counted: attempt, failures, gateFailures, at",
+        rounds:
+          "the check rounds counted: attempt, failures, gateFailures, scope (what the round ran), at",
         counts:
           "problem count after each round, e.g. 5 → 2 (with a gate, the gate's failing tests are added)",
         gateCounts:
           "the group gate's failing tests after each round, e.g. 3 → 3 (absent without a gate)",
         codeChanged:
-          "source changed between the first and last check round (null when git cannot tell)",
+          "source changed between the compared rounds, the earliest and the last that ran the same tests (same scope) (null when git cannot tell)",
         lastStrategy: "strategy of the last fix round (null when none ran)",
         nextStrategy: "strategy the next fix round would use",
         finalSpent: "true when a fix round already ran FINAL",
         minutesPerRound: "average minutes between check rounds (null under two rounds)",
-        trend: "first-round | closing | stuck | worse",
-        recommend: "try-again when closing, else stop (null on the first round)",
+        trend:
+          "first-round | closing | stuck | worse | unknown (a missing count, or rounds of different scopes)",
+        trendLine: "one plain sentence on what the counts show, with the counts and the reason",
+        recommend:
+          "try-again when closing, stop when stuck or worse (null on the first round or an unknown trend)",
       },
       exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
       run: (ctx) => {
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 58fbe3233..b4308709b 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -304,6 +304,61 @@ describe("bkit decisions compose", () => {
     expect(text).toContain("Problems after each round: 3 → 3");
   });
 
+  it("--loop=verify with an uncounted group gate reads unknown", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    const verifyRow = (at: string, attempt: number, failures: number) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      attempt,
+      failures,
+    });
+    const gateRow = {
+      type: "test-run",
+      workflow: "build",
+      at: "2026-10-01T00:29:00Z",
+      step: "build-group-gate-1",
+      attempt: 2,
+      run: 1,
+      verdict: "FAIL",
+      exitCode: 1,
+      failures: null,
+      scope: "gate",
+      log: "x.log",
+    };
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verifyRow("2026-10-01T00:10:00Z", 1, 2),
+        gateRow,
+        verifyRow("2026-10-01T00:30:00Z", 2, 0),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { r, out } = await compose(
+      root,
+      logs,
+      [],
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+      "--attempt=2",
+      "--max=2",
+    );
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("Trend: unknown");
+    expect(text).not.toContain("Trend: stuck");
+    expect(r.json.loopRecommended).not.toBe("Decide");
+    expect(r.json.loopRecommended).not.toBe("Stop");
+  });
+
   /** A verify loop stuck at 4 → 4, so the trend alone recommends `Decide` (`Stop` with no items). */
   function stuckStatus(logs: string) {
     const status = path.join(logs, "status.jsonl");
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 98624c58f..25927b6c0 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -463,6 +463,7 @@ export const decisionsCommand: CommandSpec = {
             closing: "Fewer problems after each round, and the code changed.",
             stuck: "No fewer problems, or the code did not change.",
             worse: "More problems than the first round.",
+            unknown: "The counts cannot show whether the rounds helped.",
           }[p.trend];
           loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
           const trendReason =
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index 7b3ca06c9..764b1a466 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -218,7 +218,8 @@ function checkoutOf(file, cwd) {
 }
 /**
  * The loop's direction from its check rounds: `worse` when the problem count rose,
- * `closing` when it fell and the rounds changed code, `stuck` otherwise.
+ * `closing` when it fell and the rounds changed code, `stuck` otherwise, and `unknown` when
+ * the first or last round recorded no count.
  */
 export function loopTrend(rounds, codeChanged) {
     if (rounds.length < 2)
@@ -226,7 +227,7 @@ export function loopTrend(rounds, codeChanged) {
     const first = rounds[0]?.failures;
     const last = rounds.at(-1)?.failures;
     if (first === undefined || last === undefined)
-        return "stuck";
+        return "unknown";
     if (last > first)
         return "worse";
     if (last < first && codeChanged !== false)
@@ -284,8 +285,9 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
         return { ...r, failures };
     });
     const fixes = done(fix);
-    const first = rounds[0];
     const last = rounds.at(-1);
+    // Only rounds that ran the same tests are compared: the earliest round with the last round's scope.
+    const first = last === undefined ? undefined : rounds.find((r) => r.scope === last.scope);
     let codeChanged = null;
     if (first && last && first !== last && first.parentSha && last.parentSha) {
         const diff = runGit(checkoutOf(file, cwd), [
@@ -303,7 +305,34 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
             codeChanged = true;
     }
     const ladder = lastDoneStepAllRuns(runs, workflow, { step: fix, group })?.strategy;
-    const trend = loopTrend(rounds, codeChanged);
+    const sameScope = first !== undefined && last !== undefined && first !== last;
+    const differentScopes = rounds.length >= 2 && !sameScope;
+    const trend = rounds.length < 2
+        ? "first-round"
+        : differentScopes
+            ? "unknown"
+            : loopTrend([first, last], codeChanged);
+    const countOf = (r) => (r?.failures === undefined ? "?" : String(r.failures));
+    const pairCounts = `${countOf(first)} → ${countOf(last)}`;
+    const firstFailures = first?.failures;
+    const lastFailures = last?.failures;
+    let trendLine;
+    if (trend === "first-round")
+        trendLine = "This was the first round, so there is no trend yet.";
+    else if (differentScopes)
+        trendLine = `The rounds ran different tests (${rounds[0]?.scope ?? "unscoped"}, then ${last?.scope ?? "unscoped"}), so their counts cannot be compared.`;
+    else if (trend === "unknown")
+        trendLine = `A round recorded no count (${rounds.map(countOf).join(" → ")}), so progress cannot be judged.`;
+    else if (trend === "closing")
+        trendLine = `The count fell between the first and the last round (${pairCounts}), and the code changed.`;
+    else if (trend === "worse")
+        trendLine = `The count rose between the first and the last round (${pairCounts}).`;
+    else if (firstFailures !== undefined &&
+        lastFailures !== undefined &&
+        lastFailures < firstFailures)
+        trendLine = `The count fell (${pairCounts}), but no source code changed between the rounds.`;
+    else
+        trendLine = `The count did not fall between the first and the last round (${pairCounts}).`;
     const span = first && last && rounds.length > 1
         ? (Date.parse(last.at) - Date.parse(first.at)) / 60000 / (rounds.length - 1)
         : null;
@@ -312,6 +341,7 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
             attempt: r.attempt ?? null,
             failures: r.failures ?? null,
             ...(gateFailures[i] === undefined ? {} : { gateFailures: gateFailures[i] }),
+            scope: r.scope ?? null,
             at: r.at,
         })),
         counts: rounds.map((r) => (r.failures === undefined ? "?" : String(r.failures))).join(" → "),
@@ -328,7 +358,12 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
         finalSpent: fixes.some((r) => r.strategy === "FINAL") || ladder === "FINAL",
         minutesPerRound: span === null || Number.isNaN(span) ? null : Math.round(span),
         trend,
-        recommend: trend === "first-round" ? null : trend === "closing" ? "try-again" : "stop",
+        trendLine,
+        recommend: trend === "first-round" || trend === "unknown"
+            ? null
+            : trend === "closing"
+                ? "try-again"
+                : "stop",
     };
 }
 /** `--since-clean`'s step: the single `--of` step, whose clean rounds close a loop. */
@@ -665,16 +700,17 @@ export const countersCommand = {
                 },
             ],
             output: {
-                rounds: "the check rounds counted: attempt, failures, gateFailures, at",
+                rounds: "the check rounds counted: attempt, failures, gateFailures, scope (what the round ran), at",
                 counts: "problem count after each round, e.g. 5 → 2 (with a gate, the gate's failing tests are added)",
                 gateCounts: "the group gate's failing tests after each round, e.g. 3 → 3 (absent without a gate)",
-                codeChanged: "source changed between the first and last check round (null when git cannot tell)",
+                codeChanged: "source changed between the compared rounds, the earliest and the last that ran the same tests (same scope) (null when git cannot tell)",
                 lastStrategy: "strategy of the last fix round (null when none ran)",
                 nextStrategy: "strategy the next fix round would use",
                 finalSpent: "true when a fix round already ran FINAL",
                 minutesPerRound: "average minutes between check rounds (null under two rounds)",
-                trend: "first-round | closing | stuck | worse",
-                recommend: "try-again when closing, else stop (null on the first round)",
+                trend: "first-round | closing | stuck | worse | unknown (a missing count, or rounds of different scopes)",
+                trendLine: "one plain sentence on what the counts show, with the counts and the reason",
+                recommend: "try-again when closing, stop when stuck or worse (null on the first round or an unknown trend)",
             },
             exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
             run: (ctx) => {
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 5f1d90e71..a6b820725 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -381,6 +381,7 @@ export const decisionsCommand = {
                         closing: "Fewer problems after each round, and the code changed.",
                         stuck: "No fewer problems, or the code did not change.",
                         worse: "More problems than the first round.",
+                        unknown: "The counts cannot show whether the rounds helped.",
                     }[p.trend];
                     loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
                     const trendReason = loopRecommended === "Try again"
