diff --git a/.bkit/cli.md b/.bkit/cli.md
index 19271eb35..8715cef3f 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -169,7 +169,7 @@ Build decision files: write questions, apply recommendations, list assumed items
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` | Write a decision file in the one question layout, with loop progress when asked. |
+| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write a decision file in the one question layout, with loop progress when asked. |
 | `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--reason` `--root` | Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
@@ -372,6 +372,7 @@ Run the deepest declared local gate, or one test file to record a red and audit
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
+| `base` | workflow | `--log` `--file` `--workflow` `--out` | Check whether the failing tests of a red gate also fail on the commit the branch started from; exit 0 for every verdict. |
 | `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 91b227235..d1399eebc 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -169,7 +169,7 @@ Build decision files: write questions, apply recommendations, list assumed items
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` | Write a decision file in the one question layout, with loop progress when asked. |
+| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write a decision file in the one question layout, with loop progress when asked. |
 | `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--reason` `--root` | Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 33a253835..b85646920 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -304,12 +304,225 @@ describe("bkit decisions compose", () => {
     expect(text).toContain("Problems after each round: 3 → 3");
   });
 
+  /** A verify loop stuck at 4 → 4, so the trend alone recommends `Decide` (`Stop` with no items). */
+  function stuckStatus(logs: string) {
+    const status = path.join(logs, "status.jsonl");
+    const verify = (at: string) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      failures: 4,
+    });
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verify("2026-10-01T00:10:00Z"),
+        verify("2026-10-01T00:20:00Z"),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    return status;
+  }
+
+  const baseCheck = (over: Record<string, unknown>) => ({
+    verdict: "all",
+    reason: null,
+    base: "abc1234",
+    source: "local",
+    failing: 3,
+    baseRed: 3,
+    branch: 0,
+    undetermined: 0,
+    cases: [],
+    adopt: false,
+    ...over,
+  });
+
+  async function composeWithBase(
+    over: Record<string, unknown>,
+    items: unknown[],
+    opts: { raw?: string } = {},
+  ) {
+    const { root, logs } = checkout();
+    const status = stuckStatus(logs);
+    const baseFile = path.join(root, "base-check.json");
+    fs.writeFileSync(baseFile, opts.raw ?? JSON.stringify(baseCheck(over)));
+    const { r, out } = await compose(
+      root,
+      logs,
+      items,
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+      "--attempt=2",
+      "--max=2",
+      `--base-check=${baseFile}`,
+    );
+    return { r, text: fs.existsSync(out) ? fs.readFileSync(out, "utf-8") : "" };
+  }
+
+  it("base check all with no items recommends Stop", async () => {
+    const { r, text } = await composeWithBase({}, []);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ loopRecommended: "Stop" });
+    expect(text).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
+    expect(text).toContain("Fix `dev`, then resume.");
+  });
+
+  it("base check all with items recommends Decide", async () => {
+    const { r, text } = await composeWithBase({}, ITEMS);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
+    expect(text).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
+  });
+
+  it("base check all in adopt mode adds the merge sentence", async () => {
+    const adopt = await composeWithBase({ adopt: true }, []);
+    expect(adopt.text).toContain("merge `dev` into the branch before resuming");
+    const plain = await composeWithBase({ adopt: false }, []);
+    expect(plain.text).not.toContain("merge `dev` into the branch before resuming");
+  });
+
+  it("base check some names the split", async () => {
+    const { r, text } = await composeWithBase(
+      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
+      ITEMS,
+    );
+    expect(r.code).toBe(0);
+    expect(text).toContain("a round can fix 2 of 5");
+    expect(text).toContain("the build will still stop on the 3 from `dev`");
+    expect(text).toMatch(/Recommended: B\) Decide — a round can fix 2 of 5/);
+  });
+
+  it("base check none keeps the trend and names the branch", async () => {
+    const { r, text } = await composeWithBase(
+      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
+      ITEMS,
+    );
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
+    expect(text).toMatch(/Recommended: B\) Decide — the failures come from this branch/);
+  });
+
+  it("base check unknown keeps the trend and says why", async () => {
+    const { r, text } = await composeWithBase(
+      {
+        verdict: "unknown",
+        reason: "no JUnit report",
+        base: null,
+        source: null,
+        baseRed: 0,
+      },
+      ITEMS,
+    );
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
+    expect(text).toMatch(/Recommended: B\) Decide — cause unknown: no JUnit report/);
+  });
+
+  it("Try again is offered for every base verdict", async () => {
+    const variants: Record<string, unknown>[] = [
+      { verdict: "all" },
+      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
+      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
+      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
+    ];
+    for (const over of variants) {
+      for (const items of [[], ITEMS]) {
+        const { text } = await composeWithBase(over, items);
+        expect(text, `${String(over.verdict)} with ${items.length} items`).toMatch(
+          /\*\*Q1 — Verify:\*\*[^\n]*\nOptions: A\) Try again \/ B\) (Decide|Stop)/,
+        );
+      }
+    }
+  });
+
+  it("base check prints how many failing tests are also red on base", async () => {
+    const all = await composeWithBase({}, []);
+    expect(all.text).toContain("Also red on base abc1234: 3 of 3 (local run)");
+    const unknown = await composeWithBase(
+      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
+      [],
+    );
+    expect(unknown.text).toContain("Also red on base unknown: can't tell (no JUnit report)");
+  });
+
+  it("a missing or malformed base check is a usage error that names the problem", async () => {
+    const { root, logs } = checkout();
+    const status = stuckStatus(logs);
+    const missing = await compose(
+      root,
+      logs,
+      ITEMS,
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+      `--base-check=${path.join(root, "no-such-base.json")}`,
+    );
+    expect(missing.r.code).toBe(2);
+    expect(missing.r.err).toContain("no-such-base.json");
+    expect(missing.r.err).not.toContain("unknown flag");
+
+    const noVerdict = { ...baseCheck({}) } as Record<string, unknown>;
+    delete noVerdict.verdict;
+    const bad = await composeWithBase({}, ITEMS, { raw: JSON.stringify(noVerdict) });
+    expect(bad.r.code).toBe(2);
+    expect(bad.r.err).toContain("verdict");
+    expect(bad.r.err).not.toContain("unknown flag");
+  });
+
   it("--loop needs --file", async () => {
     const { root, logs } = checkout();
     expect((await compose(root, logs, ITEMS, "--loop=verify")).r.code).toBe(2);
   });
 });
 
+describe("bkit decisions apply --by=rerun", () => {
+  const rerun = (root: string, out: string) =>
+    run(["decisions", "apply", "--by=rerun", `--file=${out}`], root);
+
+  it("records the re-run under Q1 and closes the file", async () => {
+    const { root, logs } = checkout();
+    const { out } = await compose(root, logs, [ITEMS[1]], "--header=Gate=FAIL");
+    expect(fs.readFileSync(out, "utf-8")).toContain("Gate: FAIL");
+    const r = await rerun(root, out);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ status: "DECIDED" });
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toMatch(/^Status: DECIDED$/m);
+    expect(text).toMatch(
+      /Decision: Re-run gate — the owner resumed the run, so the gate runs again first \(\d{4}-\d{2}-\d{2}\)/,
+    );
+    const q1 = text.indexOf("**Q1");
+    expect(text.indexOf("Decision: Re-run gate")).toBeGreaterThan(q1);
+  });
+
+  it("refuses a file without Gate: FAIL or not OPEN", async () => {
+    const { root, logs } = checkout();
+    const plain = await compose(root, logs, [ITEMS[1]]);
+    const before = fs.readFileSync(plain.out, "utf-8");
+    const noGate = await rerun(root, plain.out);
+    expect(noGate.code).toBe(2);
+    expect(noGate.err).toContain("Gate: FAIL");
+    expect(noGate.err).not.toContain("--by must be headless or owner");
+    expect(fs.readFileSync(plain.out, "utf-8")).toBe(before);
+
+    const gated = await compose(root, logs, [ITEMS[1]], "--header=Gate=FAIL");
+    const closed = fs.readFileSync(gated.out, "utf-8").replace("Status: OPEN", "Status: DECIDED");
+    fs.writeFileSync(gated.out, closed);
+    const notOpen = await rerun(root, gated.out);
+    expect(notOpen.code).toBe(2);
+    expect(notOpen.err).toContain("DECIDED");
+    expect(notOpen.err).not.toContain("--by must be headless or owner");
+    expect(fs.readFileSync(gated.out, "utf-8")).toBe(closed);
+  });
+});
+
 describe("bkit decisions apply --by=headless", () => {
   it("takes each recommendation: an Accept is assumed, Fix now is written as such", async () => {
     const { root, logs } = checkout();
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 67e02d01c..f4bbf08ab 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -197,6 +197,51 @@ const LOOPS: Record<
   },
 };
 
+interface BaseCheck {
+  verdict: "all" | "some" | "none" | "unknown";
+  reason: string | null;
+  base: string | null;
+  source: string | null;
+  failing: number;
+  baseRed: number;
+  adopt: boolean;
+}
+
+/** The `bkit tests base` output, checked field by field; a bad file is a usage error naming it. */
+function readBaseCheck(file: string): BaseCheck {
+  const read = readJsonFile(file);
+  if (!read.ok) throw new CommandError(EXIT.USAGE, `--base-check ${file} is missing or not JSON`);
+  const o = read.value as Record<string, unknown> | null;
+  const bad = (field: string, want: string) =>
+    new CommandError(EXIT.USAGE, `--base-check ${file}: field "${field}" ${want}`);
+  if (typeof o !== "object" || o === null || Array.isArray(o))
+    throw new CommandError(EXIT.USAGE, `--base-check ${file} must hold a JSON object`);
+  const verdict = o.verdict;
+  if (verdict !== "all" && verdict !== "some" && verdict !== "none" && verdict !== "unknown")
+    throw bad("verdict", "must be all, some, none or unknown");
+  const { failing, baseRed, adopt } = o;
+  if (typeof failing !== "number" || !Number.isFinite(failing))
+    throw bad("failing", "must be a number");
+  if (typeof baseRed !== "number" || !Number.isFinite(baseRed))
+    throw bad("baseRed", "must be a number");
+  if (typeof adopt !== "boolean") throw bad("adopt", "must be true or false");
+  const text = (k: string): string | null => {
+    const v = o[k];
+    if (v === null) return null;
+    if (typeof v !== "string") throw bad(k, "must be a string or null");
+    return v;
+  };
+  return {
+    verdict,
+    reason: text("reason"),
+    base: text("base"),
+    source: text("source"),
+    failing,
+    baseRed,
+    adopt,
+  };
+}
+
 function composeItems(raw: unknown): ComposeItem[] {
   if (!Array.isArray(raw)) throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
   return raw.map((r, i) => {
@@ -353,6 +398,11 @@ export const decisionsCommand: CommandSpec = {
         { name: "group", type: "string", help: "with --loop=verify: the task group" },
         { name: "attempt", type: "string", help: "with --loop: the attempt just failed" },
         { name: "max", type: "string", help: "with --loop: the point's maxAttempts" },
+        {
+          name: "base-check",
+          type: "string",
+          help: "with --loop: the `bkit tests base` output JSON; adds the base-commit line and steers the recommendation",
+        },
       ],
       output: {
         file: "the decision file written",
@@ -372,6 +422,9 @@ export const decisionsCommand: CommandSpec = {
           if (!read.ok) throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
           items = composeItems(read.value);
         }
+        const baseFlag = str(ctx.flags.baseCheck);
+        const baseCheck =
+          baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
         const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
         let loopRecommended: string | null = null;
         const loopName = str(ctx.flags.loop);
@@ -401,6 +454,31 @@ export const decisionsCommand: CommandSpec = {
             worse: "More problems than the first round.",
           }[p.trend];
           loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
+          const trendReason =
+            loopRecommended === "Try again"
+              ? "the last round made progress"
+              : "another round is unlikely to close the remaining items";
+          let reason = trendReason;
+          let baseLine: string[] = [];
+          if (baseCheck !== undefined) {
+            const b = baseCheck;
+            const at = b.base ?? "unknown";
+            baseLine = [
+              b.verdict === "unknown"
+                ? `Also red on base ${at}: can't tell (${b.reason ?? "no reason given"})`
+                : `Also red on base ${at}: ${b.baseRed} of ${b.failing} (${b.source ?? "unknown"} run)`,
+            ];
+            if (b.verdict === "all") {
+              loopRecommended = items.length > 0 ? "Decide" : "Stop";
+              reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
+            } else if (b.verdict === "some") {
+              reason = `a round can fix ${b.failing - b.baseRed} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`. ${trendReason}`;
+            } else if (b.verdict === "none") {
+              reason = `the failures come from this branch, so a round can fix them. ${trendReason}`;
+            } else {
+              reason = `cause unknown: ${b.reason ?? "no reason given"}. ${trendReason}`;
+            }
+          }
           lines.push(
             `build ${loop.point}: attempt ${attempt} of ${max}`,
             "",
@@ -414,6 +492,7 @@ export const decisionsCommand: CommandSpec = {
             `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`,
             `Minutes per round: ${p.minutesPerRound ?? "unknown"}`,
             `Trend: ${p.trend}`,
+            ...baseLine,
             "",
             ...itemLines(1, {
               title: loop.title,
@@ -424,10 +503,7 @@ export const decisionsCommand: CommandSpec = {
               options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
               recommended:
                 items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
-              reason:
-                loopRecommended === "Try again"
-                  ? "the last round made progress"
-                  : "another round is unlikely to close the remaining items",
+              reason,
             }),
             "",
           );
@@ -455,7 +531,7 @@ export const decisionsCommand: CommandSpec = {
       use: "workflow",
       flags: [
         { name: "file", type: "string", required: true, help: "the decision file" },
-        { name: "by", type: "string", required: true, help: "headless | owner" },
+        { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
         { name: "q", type: "string", help: "--by=owner: the question number" },
         { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
         { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
@@ -502,7 +578,25 @@ export const decisionsCommand: CommandSpec = {
             ctx.log(`hard blockers need the owner: Q${r.hardBlockers.join(", Q")}`);
           return r.hardBlockers.length > 0 ? EXIT_HARD_BLOCKERS : EXIT.OK;
         }
-        if (by !== "owner") throw new CommandError(EXIT.USAGE, "--by must be headless or owner");
+        if (by === "rerun") {
+          const name = path.basename(file);
+          if (!/^Gate:[ \t]*FAIL\b/m.test(text))
+            throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
+          const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
+          if (status !== "OPEN")
+            throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
+          const out = withStatus(
+            addUnder(text, 1, [
+              `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
+            ]),
+            "DECIDED",
+          );
+          fs.writeFileSync(file, out, "utf-8");
+          ctx.emit({ status: "DECIDED" });
+          return EXIT.OK;
+        }
+        if (by !== "owner")
+          throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
         const n = positiveInt(ctx.flags.q, "q");
         const reason = str(ctx.flags.reason);
         if (
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 239b06e60..4adbaf107 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -559,10 +559,45 @@ describe("bkit workflows start — resume facts", () => {
       group: 2,
       verifyAttempt: 3,
       testAttempt: null,
+      gate: null,
       plan: `docs/plans/${M}/${FID}-plan.md`,
     });
   });
 
+  it("openDecision carries the Gate header", async () => {
+    const cwd = repo();
+    write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
+    writeDecision(cwd, 1, 1, [
+      "Status: OPEN",
+      "Question: VERIFY_LOOP",
+      "From: verify",
+      "Pause step: 7",
+      "Group: 1",
+      "Gate: FAIL",
+      `Plan: docs/plans/${M}/${FID}-plan.md`,
+    ]);
+    const r = await run(cwd, wf("start", "build"));
+    expect(r.code).toBe(0);
+    expect(r.json.openDecision).toMatchObject({ decision: 1, gate: "FAIL" });
+  });
+
+  it("openDecision gate is null without the header", async () => {
+    const cwd = repo();
+    write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
+    writeDecision(cwd, 1, 1, [
+      "Status: OPEN",
+      "Question: VERIFY_LOOP",
+      "From: verify",
+      "Pause step: 7",
+      "Group: 1",
+      `Plan: docs/plans/${M}/${FID}-plan.md`,
+    ]);
+    const r = await run(cwd, wf("start", "build"));
+    expect(r.code).toBe(0);
+    expect(r.json.openDecision).not.toBeNull();
+    expect(r.json.openDecision.gate).toBeNull();
+  });
+
   it("reads Test attempt from a tests pause", async () => {
     const cwd = repo();
     write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index eb54f83bb..4c5f7e017 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -252,6 +252,7 @@ export interface OpenDecision {
   verifyAttempt: number | null;
   testAttempt: number | null;
   plan: string | null;
+  gate: string | null;
 }
 
 /**
@@ -292,6 +293,7 @@ export function openDecision(
       verifyAttempt: num("Verify attempt"),
       testAttempt: num("Test attempt"),
       plan: field("Plan"),
+      gate: field("Gate"),
     };
   }
   return null;
@@ -2082,7 +2084,7 @@ export const workflowsCommand: CommandSpec = {
         run: "which run of the workflow this is (1-based)",
         lastDoneStep: "the current run's last DONE step: resume after it (null on a new run)",
         openDecision:
-          "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
+          "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan, gate} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
       },
       textOmit: ["row"],
       exitCodes: {
diff --git a/.bkit/version b/.bkit/version
index a06afb4e3..ea27a760d 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "00be8c3d28b5323276abc3d86b1de3a39f1475a71d04f54e062218ebc129e051",
+    ".bkit/cli.md": "60348a1d954fe0fff96c44990f2d0a4d3de7a63f7e3b4f45f5442e8c3f8df474",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/DETAILS.md b/DETAILS.md
index 5f815305c..22b3138db 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,16 +347,16 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1719 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1739 symbols · 53 files"]
     n_bkit_core_engine_install["install<br/>310 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|388| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|398| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|384| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|204| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|208| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|172| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|138| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 09be98a9b..100d8b61f 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -150,6 +150,43 @@ const LOOPS = {
         point: "tests",
     },
 };
+/** The `bkit tests base` output, checked field by field; a bad file is a usage error naming it. */
+function readBaseCheck(file) {
+    const read = readJsonFile(file);
+    if (!read.ok)
+        throw new CommandError(EXIT.USAGE, `--base-check ${file} is missing or not JSON`);
+    const o = read.value;
+    const bad = (field, want) => new CommandError(EXIT.USAGE, `--base-check ${file}: field "${field}" ${want}`);
+    if (typeof o !== "object" || o === null || Array.isArray(o))
+        throw new CommandError(EXIT.USAGE, `--base-check ${file} must hold a JSON object`);
+    const verdict = o.verdict;
+    if (verdict !== "all" && verdict !== "some" && verdict !== "none" && verdict !== "unknown")
+        throw bad("verdict", "must be all, some, none or unknown");
+    const { failing, baseRed, adopt } = o;
+    if (typeof failing !== "number" || !Number.isFinite(failing))
+        throw bad("failing", "must be a number");
+    if (typeof baseRed !== "number" || !Number.isFinite(baseRed))
+        throw bad("baseRed", "must be a number");
+    if (typeof adopt !== "boolean")
+        throw bad("adopt", "must be true or false");
+    const text = (k) => {
+        const v = o[k];
+        if (v === null)
+            return null;
+        if (typeof v !== "string")
+            throw bad(k, "must be a string or null");
+        return v;
+    };
+    return {
+        verdict,
+        reason: text("reason"),
+        base: text("base"),
+        source: text("source"),
+        failing,
+        baseRed,
+        adopt,
+    };
+}
 function composeItems(raw) {
     if (!Array.isArray(raw))
         throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
@@ -288,6 +325,11 @@ export const decisionsCommand = {
                 { name: "group", type: "string", help: "with --loop=verify: the task group" },
                 { name: "attempt", type: "string", help: "with --loop: the attempt just failed" },
                 { name: "max", type: "string", help: "with --loop: the point's maxAttempts" },
+                {
+                    name: "base-check",
+                    type: "string",
+                    help: "with --loop: the `bkit tests base` output JSON; adds the base-commit line and steers the recommendation",
+                },
             ],
             output: {
                 file: "the decision file written",
@@ -309,6 +351,8 @@ export const decisionsCommand = {
                         throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
                     items = composeItems(read.value);
                 }
+                const baseFlag = str(ctx.flags.baseCheck);
+                const baseCheck = baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
                 const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
                 let loopRecommended = null;
                 const loopName = str(ctx.flags.loop);
@@ -329,18 +373,43 @@ export const decisionsCommand = {
                         worse: "More problems than the first round.",
                     }[p.trend];
                     loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
+                    const trendReason = loopRecommended === "Try again"
+                        ? "the last round made progress"
+                        : "another round is unlikely to close the remaining items";
+                    let reason = trendReason;
+                    let baseLine = [];
+                    if (baseCheck !== undefined) {
+                        const b = baseCheck;
+                        const at = b.base ?? "unknown";
+                        baseLine = [
+                            b.verdict === "unknown"
+                                ? `Also red on base ${at}: can't tell (${b.reason ?? "no reason given"})`
+                                : `Also red on base ${at}: ${b.baseRed} of ${b.failing} (${b.source ?? "unknown"} run)`,
+                        ];
+                        if (b.verdict === "all") {
+                            loopRecommended = items.length > 0 ? "Decide" : "Stop";
+                            reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
+                        }
+                        else if (b.verdict === "some") {
+                            reason = `a round can fix ${b.failing - b.baseRed} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`. ${trendReason}`;
+                        }
+                        else if (b.verdict === "none") {
+                            reason = `the failures come from this branch, so a round can fix them. ${trendReason}`;
+                        }
+                        else {
+                            reason = `cause unknown: ${b.reason ?? "no reason given"}. ${trendReason}`;
+                        }
+                    }
                     lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, ...(p.gateCounts === undefined
                         ? []
-                        : [`Group gate failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, "", ...itemLines(1, {
+                        : [`Group gate failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, ...baseLine, "", ...itemLines(1, {
                         title: loop.title,
                         question: loopRecommended === "Try again"
                             ? `another fix round? ${trendLine}`
                             : `decide the items below instead of another round? ${trendLine}`,
                         options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
                         recommended: items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
-                        reason: loopRecommended === "Try again"
-                            ? "the last round made progress"
-                            : "another round is unlikely to close the remaining items",
+                        reason,
                     }), "");
                     if (items.length === 0 && loopRecommended === "Decide")
                         loopRecommended = "Stop";
@@ -363,7 +432,7 @@ export const decisionsCommand = {
             use: "workflow",
             flags: [
                 { name: "file", type: "string", required: true, help: "the decision file" },
-                { name: "by", type: "string", required: true, help: "headless | owner" },
+                { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
                 { name: "q", type: "string", help: "--by=owner: the question number" },
                 { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
                 { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
@@ -405,8 +474,22 @@ export const decisionsCommand = {
                         ctx.log(`hard blockers need the owner: Q${r.hardBlockers.join(", Q")}`);
                     return r.hardBlockers.length > 0 ? EXIT_HARD_BLOCKERS : EXIT.OK;
                 }
+                if (by === "rerun") {
+                    const name = path.basename(file);
+                    if (!/^Gate:[ \t]*FAIL\b/m.test(text))
+                        throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
+                    const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
+                    if (status !== "OPEN")
+                        throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
+                    const out = withStatus(addUnder(text, 1, [
+                        `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
+                    ]), "DECIDED");
+                    fs.writeFileSync(file, out, "utf-8");
+                    ctx.emit({ status: "DECIDED" });
+                    return EXIT.OK;
+                }
                 if (by !== "owner")
-                    throw new CommandError(EXIT.USAGE, "--by must be headless or owner");
+                    throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
                 const n = positiveInt(ctx.flags.q, "q");
                 const reason = str(ctx.flags.reason);
                 if (n === undefined ||
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index d3a9455d9..4a79c3521 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -140,6 +140,7 @@ export function openDecision(logDir, tree, workflow, run) {
             verifyAttempt: num("Verify attempt"),
             testAttempt: num("Test attempt"),
             plan: field("Plan"),
+            gate: field("Gate"),
         };
     }
     return null;
@@ -1690,7 +1691,7 @@ export const workflowsCommand = {
                 row: "the appended workflow-started row, with `limits` (the workflow's ask points from bkit.workflows, frozen for the run), or null when resuming",
                 run: "which run of the workflow this is (1-based)",
                 lastDoneStep: "the current run's last DONE step: resume after it (null on a new run)",
-                openDecision: "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
+                openDecision: "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan, gate} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
             },
             textOmit: ["row"],
             exitCodes: {
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 277e6b70c..c1f4409c8 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -79,16 +79,16 @@ Not scanned; run the rollup with `--reachability`.
 
 ## Import-time side effects
 
-15 module-scope side effects in 6 of 119 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
+15 module-scope side effects in 6 of 121 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
 
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 199 | 119 |
-| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 187 | 112 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 187 | 112 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 187 | 112 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 187 | 112 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 204 | 122 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 192 | 115 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 192 | 115 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 192 | 115 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 192 | 115 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -164,16 +164,16 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1719 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1739 symbols · 53 files"]
     n_bkit_core_engine_install["install<br/>310 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|388| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|398| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|384| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|204| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|208| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|172| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|138| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
@@ -311,11 +311,12 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_challenge["challenge<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>91 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_counters["counters<br/>25 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_decisions["decisions<br/>27 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_counters["counters<br/>26 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_decisions["decisions<br/>29 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_disk["disk<br/>55 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_fids["fids<br/>57 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_issues["issues<br/>45 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_junit["junit<br/>15 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>102 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_locks["locks<br/>36 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_plan_blocks["plan-blocks<br/>32 symbols · 1 files"]
@@ -325,14 +326,15 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_roadmap["roadmap<br/>39 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_run_facts["run-facts<br/>28 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_runs["runs<br/>79 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_runtime["runtime<br/>19 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_runtime["runtime<br/>20 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_status["status<br/>39 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>14 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_steps["steps<br/>65 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>21 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>6 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests["tests<br/>96 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests_base["tests-base<br/>13 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>88 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
@@ -389,8 +391,8 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_status -->|27| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_steps -->|25| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_context -->|24| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_counters -->|23| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_status -->|23| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_counters -->|22| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_ledgers -->|22| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|21| n_bkit_core_engine_checks_after_ci_yml
   n_bkit_core_engine_commands_workflow_tracker -->|21| n_bkit_core_engine_ledgers_status
@@ -465,6 +467,7 @@ flowchart LR
   n_bkit_core_engine_commands_ci_ci -->|10| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_install_upgrade -->|10| n_bkit_core_engine_install_manifest
   n_bkit_core_engine_commands_workflow_context -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
+  n_bkit_core_engine_commands_workflow_decisions -->|10| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|10| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_summary_findings -->|10| n_bkit_core_engine_commands_workflow_challenge
@@ -484,7 +487,6 @@ flowchart LR
   n_bkit_core_engine_checks_before_index -->|9| n_bkit_core_engine_checks_before_files
   n_bkit_core_engine_commands_install_install -->|9| n_bkit_core_engine_checks_after_index
   n_bkit_core_engine_commands_workflow_branches -->|9| n_bkit_core_engine_shared_branches
-  n_bkit_core_engine_commands_workflow_decisions -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_locks -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_run_facts -->|9| n_bkit_core_engine_shared_json
@@ -493,6 +495,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_tests -->|9| n_bkit_core_engine_ledgers_status
+  n_bkit_core_engine_commands_workflow_tests_base -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|9| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_worktrees -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_install_modules_antigravity -->|9| n_bkit_core_engine_shared_package_roots
@@ -542,7 +545,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
-  n_bkit_core_engine_commands_workflow_tests -->|7| n_bkit_core_engine_shared_package_manager
   n_bkit_core_engine_commands_workflow_workflows -->|7| n_bkit_core_engine_commands_workflow_summary
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_render_hosts
@@ -576,7 +578,9 @@ flowchart LR
   n_bkit_core_engine_install_cloud_env -->|6| n_bkit_core_engine_install_placeholders
   n_bkit_core_engine_install_modules_antigravity -->|6| n_bkit_core_engine_render_hosts
   n_bkit_core_engine_install_modules_opencode -->|6| n_bkit_core_engine_shared_json
+  n_bkit_core_engine_commands_workflow_tests_base -->|6| n_bkit_core_engine_commands_workflow_junit
   n_bkit_core_engine_checks_tips_catalogue -->|6| n_bkit_core_engine_checks_before_env
+  n_bkit_core_engine_commands_workflow_tests -->|6| n_bkit_core_engine_commands_workflow_junit
   style gncustom_health_checks fill:#8250df0a,stroke:#8250df,stroke-width:2px
   style gncustom_install_engine fill:#0a7b830a,stroke:#0a7b83,stroke-width:2px
   style gncustom_telemetry fill:#0969da0a,stroke:#0969da,stroke-width:2px
@@ -641,6 +645,7 @@ flowchart LR
   style n_bkit_core_engine_commands_workflow_disk stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_fids stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_issues stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
+  style n_bkit_core_engine_commands_workflow_junit stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_ledgers stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_locks stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_plan_blocks stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
@@ -658,6 +663,7 @@ flowchart LR
   style n_bkit_core_engine_commands_workflow_summary_findings stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_tasks stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_tests stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
+  style n_bkit_core_engine_commands_workflow_tests_base stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_tests_changed stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_tracker stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_workflows stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
@@ -820,7 +826,7 @@ flowchart LR
   linkStyle 134 stroke:#59636eb3,stroke-width:3px
   linkStyle 135 stroke:#59636eb3,stroke-width:3px
   linkStyle 136 stroke:#59636eb3,stroke-width:3px
-  linkStyle 137 stroke:#59636e80,stroke-width:2px
+  linkStyle 137 stroke:#59636eb3,stroke-width:3px
   linkStyle 138 stroke:#59636e80,stroke-width:2px
   linkStyle 139 stroke:#59636e80,stroke-width:2px
   linkStyle 140 stroke:#59636e80,stroke-width:2px
@@ -887,4 +893,6 @@ flowchart LR
   linkStyle 201 stroke:#59636e80,stroke-width:2px
   linkStyle 202 stroke:#59636e80,stroke-width:2px
   linkStyle 203 stroke:#59636e80,stroke-width:2px
+  linkStyle 204 stroke:#59636e80,stroke-width:2px
+  linkStyle 205 stroke:#59636e80,stroke-width:2px
 ```
