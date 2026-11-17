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
index 67e02d01c..9153ecdff 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -197,6 +197,36 @@ const LOOPS: Record<
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
+  for (const k of ["failing", "baseRed"])
+    if (typeof o[k] !== "number" || !Number.isFinite(o[k])) throw bad(k, "must be a number");
+  if (typeof o.adopt !== "boolean") throw bad("adopt", "must be true or false");
+  for (const k of ["base", "source", "reason"])
+    if (o[k] !== null && typeof o[k] !== "string") throw bad(k, "must be a string or null");
+  return o as unknown as BaseCheck;
+}
+
 function composeItems(raw: unknown): ComposeItem[] {
   if (!Array.isArray(raw)) throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
   return raw.map((r, i) => {
@@ -353,6 +383,11 @@ export const decisionsCommand: CommandSpec = {
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
@@ -372,6 +407,9 @@ export const decisionsCommand: CommandSpec = {
           if (!read.ok) throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
           items = composeItems(read.value);
         }
+        const baseFlag = str(ctx.flags.baseCheck);
+        const baseCheck =
+          baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
         const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
         let loopRecommended: string | null = null;
         const loopName = str(ctx.flags.loop);
@@ -401,6 +439,31 @@ export const decisionsCommand: CommandSpec = {
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
@@ -414,6 +477,7 @@ export const decisionsCommand: CommandSpec = {
             `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`,
             `Minutes per round: ${p.minutesPerRound ?? "unknown"}`,
             `Trend: ${p.trend}`,
+            ...baseLine,
             "",
             ...itemLines(1, {
               title: loop.title,
@@ -424,10 +488,7 @@ export const decisionsCommand: CommandSpec = {
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
@@ -455,7 +516,7 @@ export const decisionsCommand: CommandSpec = {
       use: "workflow",
       flags: [
         { name: "file", type: "string", required: true, help: "the decision file" },
-        { name: "by", type: "string", required: true, help: "headless | owner" },
+        { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
         { name: "q", type: "string", help: "--by=owner: the question number" },
         { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
         { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
@@ -502,7 +563,25 @@ export const decisionsCommand: CommandSpec = {
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
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 09be98a9b..3d817dd64 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -150,6 +150,28 @@ const LOOPS = {
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
+    for (const k of ["failing", "baseRed"])
+        if (typeof o[k] !== "number" || !Number.isFinite(o[k]))
+            throw bad(k, "must be a number");
+    if (typeof o.adopt !== "boolean")
+        throw bad("adopt", "must be true or false");
+    for (const k of ["base", "source", "reason"])
+        if (o[k] !== null && typeof o[k] !== "string")
+            throw bad(k, "must be a string or null");
+    return o;
+}
 function composeItems(raw) {
     if (!Array.isArray(raw))
         throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
@@ -288,6 +310,11 @@ export const decisionsCommand = {
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
@@ -309,6 +336,8 @@ export const decisionsCommand = {
                         throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
                     items = composeItems(read.value);
                 }
+                const baseFlag = str(ctx.flags.baseCheck);
+                const baseCheck = baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
                 const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
                 let loopRecommended = null;
                 const loopName = str(ctx.flags.loop);
@@ -329,18 +358,43 @@ export const decisionsCommand = {
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
@@ -363,7 +417,7 @@ export const decisionsCommand = {
             use: "workflow",
             flags: [
                 { name: "file", type: "string", required: true, help: "the decision file" },
-                { name: "by", type: "string", required: true, help: "headless | owner" },
+                { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
                 { name: "q", type: "string", help: "--by=owner: the question number" },
                 { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
                 { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
@@ -405,8 +459,22 @@ export const decisionsCommand = {
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
