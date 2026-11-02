diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index a144f2b5b..d200ecff6 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -105,6 +105,8 @@ Placeholders: the copies keep them raw, so replace each one in your copy:
 
 The block rules (markers, contexts, self-skip, output bounds) are in the managed block of `.agents/context.md`. Each fetch block bounds its own output at the source, with a window, a severity / level filter, a row / line cap, a page cap or a per-lane tail, because everything it prints is written into an artifact that an agent then reads. A block that bounds nothing downloads a whole-run dump, and only the post-hoc clamp catches it (`bkit check` advises, `context-fetch-unbounded`).
 
+For selected CI, `context fetch --ci-selection-file` supplies the four `BKIT_CI_*` identity inputs listed below and validates the `bkit-ci-evidence` receipt defined in `.agents/context.md`. The receipt follows complete metadata, job and log reads; empty, partial or mismatched evidence stays unchecked. An unpinned block discovers its own source. Consumer-owned blocks remain unchanged on upgrade; Debug adapts a temporary script for the selected identity.
+
 <!-- prettier-ignore -->
 | File | Fits | `context=` | Fetches | Secret / non-secret env | Domains | CLI (provision) |
 | --- | --- | --- | --- | --- | --- | --- |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 1250dac4f..524224a1f 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -992,6 +992,8 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
 
+**Evidence round contract:** `tests run` writes a CI artifact with `Verdict: FAIL`, `Source: ci`, repository, workflow, run, attempt, commit, URL and generation. Its row has `source: ci`, `scope: ci:<runId>`, and null gate, exit code and failure count; it explicitly says the local gate did not run. `steps finish` checks this artifact against the active selection instead of demanding a local clamp record. `status route` returns `ciRun`, `ciGeneration`, `ciFixDone` and `ciReproduced`; only DONE rows for the current generation count. The reproduction row persists the report's `Reproduced` value as `reproduced`. After a matching fix, ordered declared gates cover known failed tiers first, retain the normal fallback order, and honor `[live=off]`. The configured workflow selector remains `package.json` `bkit.testing.ciWorkflow`; selecting another workflow adds its final proof rather than replacing the configured gate.
+
 **Mode detection (Step 1):** `bkit prs probe` (any base): open PR → `PUSH_MODE` = PR, else LOCAL (exit 80 → `list_pull_requests`); Step 11 re-probes and re-records it, so labels and the ` bkit [verbose ci]` suffix on the close follow a PR opened or closed mid-run; one `bkit status route --workflow=debug --fid= --month= --prompt-file={SESSION_DIR}/prompt.md` prints `debugAttempt` (which debug run this is; a resume keeps its number), `debugMode`, `repro` and `gates`. `debugMode` (NORMAL | SOAK), first match wins: `[soak]` in session prompt → SOAK; the newest run still `IN_PROGRESS` (a resume) is already in SOAK — `debug-failure-soak` rows, or `debugMode` SOAK in its `workflow-meta` (a Step 3 escalation) → SOAK; `debug-failure-remediate` rows across every debug run of the feature >= `debug.fix.maxAttempts` → SOAK; else NORMAL. A finished run's mode never carries into the next run; its fix and soak rows count against the limits. `repro` = `[repro]` in session prompt; `gates` = debug's candidates, the live one dropped on `[live=off]` in session prompt. The issue body is not read for markers. A cause that cannot be localised → SOAK is judged by the Step-6 diagnose `Mode: SOAK`, not here.
 
 **Ladder + cutover:** `NORMAL` (diagnose + remediate) and `SOAK` (accumulating-context instrument-or-fix). There is no observe mode; `[DEBUG-OBSERVE]` appears only in the soak agent loop. SOAK entry: invocation start (fix attempts used up across the feature's runs, or `[soak]`); mid-run Step-6 `Mode: SOAK` (`Verdict` != PASS); `FIX_ATTEMPT` over `debug.fix.maxAttempts` (STANDARD → PIVOT → FINAL) — final SOAK escalation before handover. `bkit status meta --debug-mode=SOAK` records the switch; `SOAK_ATTEMPT` counts soak rows across every debug run of the feature against `debug.soak.maxAttempts` — nothing resets it (default worst case without asking: 2 fix + 2 soak attempts per feature, over 1 to 4 runs). With `debug.fix.ask` / `debug.soak.ask` true and not headless, the Loop Question asks before each further attempt (`Try again` / `Stop`; Stop → handover, run stays `IN_PROGRESS`). Used-up soak attempts with `debug.soak.ask` true in a session → the Loop Question too; `Try again` grants one more allowance of soak attempts (§ Ask points). SOAK is terminal: the switch is one-way. Soak loops on whatever Run Tests fails on (live or mocked). Diagnose recommends; the orchestrator decides.
diff --git a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
new file mode 100644
index 000000000..65243238e
--- /dev/null
+++ b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
@@ -0,0 +1,485 @@
+// Real built CLI, workflow command lines, package gates, Git history and context
+// scripts. Only GitHub reads and agent-produced diagnosis/fix reports are fixtures.
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as path from "node:path";
+import { afterEach, describe, expect, it } from "vitest";
+import { getPkgRoot, getTemplatesRoot, getWorkflowsRoot } from "../../shared/package-roots";
+
+const ROOT = getPkgRoot();
+const WORKFLOW = fs.readFileSync(path.join(getWorkflowsRoot(), "bkit-debug.md"), "utf8");
+const FID = "1-ci-evidence";
+const MONTH = "202611";
+const LOG = `docs/plans/${MONTH}/logs/${FID}`;
+const roots: string[] = [];
+
+afterEach(() => {
+  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
+});
+
+function stepText(number: number): string {
+  const headings = [...WORKFLOW.matchAll(/^## .*Step (\d+) —[^\n]*$/gm)];
+  const index = headings.findIndex((match) => Number(match[1]) === number);
+  const start = headings[index]?.index;
+  if (start === undefined) throw new Error(`Missing Debug step ${number}`);
+  return WORKFLOW.slice(start, headings[index + 1]?.index ?? WORKFLOW.length);
+}
+
+function command(number: number, prefix: string): string {
+  const lines = [...stepText(number).matchAll(/```bash\n([\s\S]*?)```/g)]
+    .flatMap((match) => match[1]!.replace(/\\\n\s*/g, " ").split("\n"))
+    .map((line) => line.trim());
+  const line = lines.find((candidate) => candidate.startsWith(`"{BKIT}" ${prefix}`));
+  if (!line) throw new Error(`Missing actual Step ${number} command ${prefix}`);
+  return line.replace(/\s*>\/dev\/null.*$|\s+\|\| exit.*$/, "");
+}
+
+function git(cwd: string, ...args: string[]): string {
+  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
+  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
+  return result.stdout.trim();
+}
+
+function consumer() {
+  const parent = path.join(ROOT, "tmp");
+  fs.mkdirSync(parent, { recursive: true });
+  const cwd = fs.mkdtempSync(path.join(parent, "debug-ci-evidence-"));
+  roots.push(cwd);
+  const write = (name: string, value: string) => {
+    const file = path.join(cwd, name);
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, value);
+    return file;
+  };
+  git(cwd, "init", "-q", "-b", "fix/ci");
+  git(cwd, "config", "user.name", "fixture");
+  git(cwd, "config", "user.email", "fixture@example.test");
+  git(cwd, "config", "commit.gpgsign", "false");
+  git(cwd, "config", "core.hooksPath", "/dev/null");
+  git(cwd, "remote", "add", "origin", "https://github.com/example/example.git");
+  write(".gitignore", "bin/\ncontrol.json\nevents.jsonl\n.git/\n");
+  write("source.txt", "unfixed\n");
+  write(".github/workflows/consumer-ci.yml", "name: configured CI\n");
+  write(".github/workflows/special-ci.yml", "name: selected CI\n");
+  write(
+    "package.json",
+    JSON.stringify({
+      name: "ci-evidence-fixture",
+      private: true,
+      scripts: {
+        "bkit:gate:static-unit": "node gate.cjs shallow",
+        "bkit:gate:static-unit-integration": "node gate.cjs integration",
+        "bkit:gate:static-unit-integration-e2e-live": "node gate.cjs live",
+      },
+      bkit: { tracker: { default: "none" }, testing: { ciWorkflow: "consumer-ci.yml" } },
+    }),
+  );
+  write(
+    "gate.cjs",
+    `const fs = require("node:fs");
+fs.appendFileSync("events.jsonl", JSON.stringify({kind:"local-gate", gate:process.argv[2]}) + "\\n");
+const control = JSON.parse(fs.readFileSync("control.json", "utf8"));
+if (!control.local && fs.readFileSync("source.txt", "utf8").trim() !== "fixed") process.exit(1);
+console.log("consumer checks passed");
+`,
+  );
+  const template = fs.readFileSync(path.join(getTemplatesRoot(), "context/bkit-github.md"), "utf8");
+  const ci = /<!-- context-fetch:start github context=ci -->[\s\S]*?```bash\n([\s\S]*?)```/.exec(
+    template,
+  )?.[1];
+  if (!ci) throw new Error("Missing shipped GitHub CI context script");
+  write(
+    ".agents/context.md",
+    `# Context\n<!-- bkit:end -->\n<!-- context-fetch:start github context=ci -->\n\n\`\`\`bash\n${ci}\`\`\`\n<!-- context-fetch:end -->\n`,
+  );
+  const script = write("bin/context.sh", ci);
+  const status = write(
+    `${LOG}/status.jsonl`,
+    JSON.stringify({ type: "workflow-started", workflow: "debug", at: "2026-11-01T00:00:00Z" }) +
+      "\n",
+  );
+  write(
+    "bin/prompt.md",
+    "/bkit-debug #1 https://github.com/example/example/actions/runs/123/attempts/2 [live=off]\n",
+  );
+  git(cwd, "add", ".");
+  git(cwd, "commit", "-qm", "fixture initial state");
+  const head = git(cwd, "rev-parse", "HEAD");
+  const control = {
+    head,
+    branch: "fix/ci",
+    logs: true,
+    final: "success",
+    finalHead: head,
+    verifyingId: 301,
+    local: false,
+  };
+  const save = () => write("control.json", JSON.stringify(control));
+  save();
+  write("events.jsonl", "");
+  const bin = path.join(cwd, "bin");
+  const wrapper = write(
+    "bin/bkit",
+    `#!${process.execPath}
+const fs=require("node:fs"), cp=require("node:child_process");
+const argv=process.argv.slice(2);
+fs.appendFileSync("events.jsonl",JSON.stringify({kind:"cli",argv})+"\\n");
+const result=cp.spawnSync(process.execPath,[${JSON.stringify(path.join(ROOT, "dist/cli.js"))},...argv,"--json"],{stdio:"inherit"});
+process.exit(result.status ?? 1);
+`,
+  );
+  fs.chmodSync(wrapper, 0o755);
+  const gh = write(
+    "bin/gh",
+    `#!${process.execPath}
+const fs=require("node:fs");
+const args=process.argv.slice(2), state=JSON.parse(fs.readFileSync("control.json","utf8"));
+fs.appendFileSync("events.jsonl",JSON.stringify({kind:"gh",argv:args})+"\\n");
+const emit=value=>process.stdout.write(JSON.stringify(value));
+const flag=name=>{const at=args.indexOf(name);return at<0?undefined:args[at+1]};
+const endpoint=args.find(value=>value.startsWith("/repos/")) || "";
+const reject=message=>{process.stderr.write(message);process.exit(3)};
+const run=id=>({id,run_attempt:2,workflow_id:777,path:".github/workflows/special-ci.yml",head_branch:state.branch,head_sha:state.head,
+  head_repository:{full_name:"example/example"},repository:{full_name:"example/example"},status:"completed",conclusion:"failure",event:"push",
+  html_url:"https://github.com/example/example/actions/runs/"+id,created_at:"2026-11-01T01:00:00Z",updated_at:"2026-11-01T01:01:00Z"});
+if(args[0]==="auth") process.exit(0);
+if(args[0]==="run" && args[1]==="view"){
+  if(!args.includes("--log-failed") || flag("--repo")!=="example/example" || flag("--attempt")!=="2" || flag("--job")!=="501") reject("unpinned context log request");
+  if(!state.logs) reject("selected logs unavailable");
+  process.stdout.write("integration fixture failure in run "+args[2]+" attempt 2\\n");process.exit(0);
+}
+if(args[0]!=="api" || !endpoint.startsWith("/repos/example/example/")) reject("unexpected remote request "+args.join(" "));
+if(endpoint.includes("/actions/workflows/")){
+  if(!endpoint.includes("head_sha=")) reject("verification must request exact pushed head");
+  const selected=endpoint.includes("/777/"), id=selected?state.verifyingId:201;
+  const value={...run(id),workflow_id:selected?777:456,head_branch:"fix/ci",head_sha:selected?state.finalHead:state.finalHead,conclusion:selected?state.final:"success",run_attempt:1};
+  emit({total_count:1,workflow_runs:[value]});process.exit(0);
+}
+if(endpoint.includes("/jobs")){
+  if(endpoint.includes("/201/")){emit({total_count:1,jobs:[{id:1,name:"bkit-tests-check",status:"completed",conclusion:"success"}]});process.exit(0)}
+  if(!endpoint.includes("/attempts/2/jobs")) reject("jobs require the selected attempt");
+  const value={total_count:1,jobs:[{id:501,name:"bkit-tests-integration",status:"completed",conclusion:"failure"}]};
+  emit(args.includes("--slurp")?[value]:value);process.exit(0);
+}
+const match=endpoint.match(new RegExp("/actions/runs/([0-9]+)(?:/attempts/([0-9]+))?"));
+if(match){if(match[2] && match[2]!=="2")reject("wrong attempt");emit(run(Number(match[1])));process.exit(0)}
+reject("unsupported fixture endpoint "+endpoint);
+`,
+  );
+  fs.chmodSync(gh, 0o755);
+  const vars: Record<string, string> = {
+    BKIT: wrapper,
+    STATUS: status,
+    SESSION_DIR: bin,
+    OUTBOX: bin,
+    FID,
+    YYYYMM: MONTH,
+    BRANCH: "fix/ci",
+    OWNER_REPO: "example/example",
+    CI_SELECTION_FILE: path.join(bin, "ci-selection.json"),
+    ISSUE_TEXT_FLAG: "",
+    IDX: "1",
+    CI_GENERATION: "1",
+    DEBUG_ATTEMPT: "1",
+    ROUND: "1",
+    SCRIPT: script,
+    STRATEGY: "STANDARD",
+    CI_TEST_FLAGS: "",
+    GATE_FLAGS: "",
+    TEST_SOURCE: "ci",
+    FAILURES_FLAG: "",
+    CLAMP_FLAG: "",
+    TEST_VERDICT: "FAIL",
+    TEST_SCOPE: "ci:123",
+    VERIFY_HEAD: head,
+    DEBUG_MODE: "NORMAL",
+    PUSH_MODE: "LOCAL",
+  };
+  const childEnv = {
+    ...process.env,
+    PATH: `${bin}${path.delimiter}${process.env.PATH}`,
+    CI: "true",
+    GIT_TERMINAL_PROMPT: "0",
+  };
+  const runLine = (line: string) => {
+    let rendered = line.replaceAll('"$SCRIPT"', '"{SCRIPT}"').replaceAll("<attempt>", vars.ROUND!);
+    for (const [name, value] of Object.entries(vars))
+      rendered = rendered.replaceAll(`{${name}}`, value);
+    if (/\{[A-Z_]+\}/.test(rendered)) throw new Error(`Unresolved workflow command ${rendered}`);
+    const result = spawnSync("bash", ["-c", rendered], {
+      cwd,
+      env: childEnv,
+      encoding: "utf8",
+      timeout: 30_000,
+    });
+    if (result.error) throw result.error;
+    return {
+      code: result.status,
+      json: result.stdout.trim() ? JSON.parse(result.stdout) : null,
+      err: result.stderr,
+    };
+  };
+  const execute = (step: number, prefix: string) => runLine(command(step, prefix));
+  const prompt = (text: string) => write("bin/prompt.md", text);
+  const events = () =>
+    fs
+      .readFileSync(path.join(cwd, "events.jsonl"), "utf8")
+      .trim()
+      .split("\n")
+      .filter(Boolean)
+      .map((line) => JSON.parse(line));
+  const route = () => execute(2, "status route");
+  const select = () => {
+    const found = execute(2, "runs locate");
+    if (found.code !== 0 && found.code !== 1) return { found, state: null };
+    const persisted = execute(2, "status meta --file=");
+    if (persisted.code !== 0) throw new Error(`Persist selection: ${persisted.err}`);
+    const modes = execute(2, 'status meta --file="{STATUS}" --workflow=debug --debug-attempt=run');
+    if (modes.code !== 0) throw new Error(`Persist debug modes: ${modes.err}`);
+    const state = route();
+    vars.CI_GENERATION = String(state.json.ciGeneration);
+    vars.GATE_FLAGS = state.json.gates.map((gate: string) => `--gate=${gate}`).join(" ");
+    vars.CI_TEST_FLAGS = "";
+    if (state.json.ciRun) {
+      const selection = JSON.parse(fs.readFileSync(vars.CI_SELECTION_FILE!, "utf8"));
+      vars.CI_TEST_FLAGS = `--ci-run=${state.json.ciRun} --ci-url="${selection.runUrl}"`;
+    }
+    return { found, state: state.json };
+  };
+  const round = () => {
+    const result = execute(3, "tests run");
+    if (!result.json) throw new Error(`Run tests exited ${result.code}: ${result.err}`);
+    vars.TEST_SOURCE = result.json.source ?? "local";
+    vars.TEST_SCOPE = result.json.scope;
+    vars.TEST_VERDICT = result.json.verdict;
+    vars.FAILURES_FLAG = "";
+    if (result.json.failures !== null) vars.FAILURES_FLAG = `--failures=${result.json.failures}`;
+    vars.CLAMP_FLAG = "";
+    if (result.json.source === "local")
+      vars.CLAMP_FLAG = `--clamp-log=debug-run-tests:${vars.DEBUG_ATTEMPT}`;
+    return result;
+  };
+  const finishRound = () => execute(3, "steps finish");
+  const context = () => execute(4, "context fetch");
+  const agent = (kind: "diagnose" | "remediate" | "reproduce", reproduced = "YES") => {
+    const number = { diagnose: 6, remediate: 7, reproduce: 5 }[kind];
+    const suffix = { diagnose: "", remediate: "-log", reproduce: "" }[kind];
+    let header = "Verdict: PASS\n";
+    if (kind === "diagnose") header += "Mode: NORMAL\n";
+    if (kind === "remediate") header += "Strategy: STANDARD\n";
+    if (kind === "reproduce") {
+      let tests = "none";
+      if (reproduced === "YES") {
+        tests = "regression.test.cjs :: reproduces the selected failure";
+        const regression = write(
+          "regression.test.cjs",
+          'const fs=require("node:fs");\nrequire("node:assert/strict").equal(fs.readFileSync("source.txt","utf8").trim(),"fixed");\n',
+        );
+        const result = spawnSync(process.execPath, [regression], { cwd, encoding: "utf8" });
+        if (result.status !== 1)
+          throw new Error(`Regression fixture did not fail: ${result.stderr}`);
+        fs.appendFileSync(
+          path.join(cwd, "events.jsonl"),
+          JSON.stringify({ kind: "regression", exitCode: result.status }) + "\n",
+        );
+      }
+      header = `Verdict: ${reproduced === "YES" ? "PASS" : "FAIL"}\nReproduced: ${reproduced}\nTests: ${tests}\n`;
+    }
+    write(
+      `${LOG}/debug-failure-${kind}-${vars.ROUND}${suffix}.md`,
+      `${header}\n<!-- verdict:end -->\n\n# Agent fixture\n\n${kind} selected run evidence.\n`,
+    );
+    if (kind === "remediate") write("source.txt", "fixed\n");
+    fs.appendFileSync(
+      path.join(cwd, "events.jsonl"),
+      JSON.stringify({ kind: "agent", agent: kind }) + "\n",
+    );
+    return execute(number, `steps finish --file=`);
+  };
+  const gate = () => {
+    control.finalHead = git(cwd, "rev-parse", "HEAD");
+    vars.VERIFY_HEAD = control.finalHead;
+    save();
+    return execute(11, 'runs gate --head="{VERIFY_HEAD}"');
+  };
+  return {
+    cwd,
+    head,
+    control,
+    save,
+    write,
+    vars,
+    prompt,
+    events,
+    select,
+    route,
+    round,
+    finishRound,
+    context,
+    agent,
+    gate,
+    execute,
+  };
+}
+
+describe("Debug CI evidence sequence", () => {
+  it("checks the complete selected CI fix sequence against green and red final runs", () => {
+    const f = consumer();
+    expect(f.select().state).toMatchObject({
+      ciRun: "123",
+      ciGeneration: 1,
+      ciFixDone: false,
+    });
+    expect(f.route().json.gates[0]).toBe("bkit:gate:static-unit-integration");
+    expect(f.route().json.gates).not.toContain("bkit:gate:static-unit-integration-e2e-live");
+    expect(f.round()).toMatchObject({
+      code: 1,
+      json: { source: "ci", verdict: "FAIL", runAttempt: 2 },
+    });
+    expect(f.finishRound().code).toBe(0);
+    expect(f.events().filter((event) => event.kind === "local-gate")).toEqual([]);
+    const fetched = f.context();
+    expect(fetched).toMatchObject({ code: 0, json: { outcome: "checked" } });
+    const artifact = fs.readFileSync(path.join(f.cwd, fetched.json.artifact), "utf8");
+    expect(artifact).toContain('"runId":"123"');
+    expect(artifact).toContain('"runAttempt":2');
+    expect(artifact).toContain(f.head);
+    expect(artifact).toContain("integration fixture failure in run 123 attempt 2");
+    expect(f.agent("diagnose").code).toBe(0);
+    expect(f.agent("remediate").code).toBe(0);
+    expect(f.route().json).toMatchObject({ ciFixDone: true, ciGeneration: 1 });
+    f.vars.DEBUG_ATTEMPT = "2";
+    expect(f.round()).toMatchObject({ code: 0, json: { source: "local", verdict: "PASS" } });
+    expect(f.finishRound().code).toBe(0);
+    const events = f.events();
+    const diagnosis = events.findIndex((event) => event.agent === "diagnose");
+    expect(events.findIndex((event) => event.kind === "local-gate")).toBeGreaterThan(diagnosis);
+    expect(events.filter((event) => event.kind === "local-gate")).toEqual([
+      { kind: "local-gate", gate: "integration" },
+    ]);
+    const green = f.gate();
+    expect(green).toMatchObject({
+      code: 0,
+      json: { passed: true, originalRunId: "123", verifyingRunId: 301 },
+    });
+    expect(green.json.originalRunUrl).toContain("/123/attempts/2");
+    expect(green.json.verifyingRunUrl).toContain("/301");
+    f.control.final = "failure";
+    f.control.verifyingId = 302;
+    const red = f.gate();
+    expect(red.code).not.toBe(0);
+    expect(red.json).toMatchObject({
+      passed: false,
+      originalRunId: "123",
+      verifyingRunId: 302,
+      conclusion: "success",
+    });
+    expect(fs.readFileSync(path.join(f.cwd, `${LOG}/status.jsonl`), "utf8")).not.toContain(
+      '"type":"workflow-done"',
+    );
+  });
+
+  it("reloads saved fixes and recollects explicitly replaced evidence generations", () => {
+    const f = consumer();
+    expect(f.select().state).toMatchObject({ ciRun: "123", ciGeneration: 1 });
+    expect(f.round().json.source).toBe("ci");
+    expect(f.finishRound().code).toBe(0);
+    expect(f.context().json.outcome).toBe("checked");
+    expect(f.agent("diagnose").code).toBe(0);
+    expect(f.agent("remediate").code).toBe(0);
+    f.prompt("/bkit-debug #1 [live=off]\n");
+    expect(f.select().state).toMatchObject({ ciRun: "123", ciGeneration: 1, ciFixDone: true });
+    f.vars.DEBUG_ATTEMPT = "2";
+    expect(f.round().json.source).toBe("local");
+    const before = f.events().filter((event) => event.kind === "local-gate").length;
+    f.prompt(
+      "/bkit-debug #1 https://github.com/example/example/actions/runs/124/attempts/2 [live=off]\n",
+    );
+    expect(f.select().state).toMatchObject({
+      ciRun: "124",
+      ciGeneration: 2,
+      ciFixDone: false,
+      ciReproduced: false,
+    });
+    f.vars.DEBUG_ATTEMPT = "3";
+    expect(f.round()).toMatchObject({ code: 1, json: { source: "ci", ciGeneration: 2 } });
+    expect(f.events().filter((event) => event.kind === "local-gate")).toHaveLength(before);
+    const replacement = f.context();
+    expect(replacement.json.outcome).toBe("checked");
+    expect(fs.readFileSync(path.join(f.cwd, replacement.json.artifact), "utf8")).toContain(
+      "integration fixture failure in run 124 attempt 2",
+    );
+  });
+
+  it("preserves local and repro overrides across actual workflow command sequences", () => {
+    const local = consumer();
+    expect(local.select().state.ciRun).toBe("123");
+    local.prompt("/bkit-debug #1 [local] [live=off]\n");
+    expect(local.select()).toMatchObject({
+      found: { code: 1 },
+      state: { ciRun: null, ciGeneration: 2, redTiers: [] },
+    });
+    local.control.local = true;
+    local.save();
+    expect(local.round()).toMatchObject({ code: 0, json: { exitCode: 0, verdict: "PASS" } });
+    expect(local.events().filter((event) => event.kind === "local-gate")).toHaveLength(1);
+    expect(JSON.parse(fs.readFileSync(local.vars.CI_SELECTION_FILE!, "utf8"))).toEqual({
+      mode: "local",
+      reason: "explicit-local",
+    });
+    const repro = consumer();
+    repro.prompt(
+      "/bkit-debug #1 https://github.com/example/example/actions/runs/123/attempts/2 [repro] [live=off]\n",
+    );
+    expect(repro.select().state).toMatchObject({ repro: true, ciReproduced: false });
+    expect(repro.round().json.source).toBe("ci");
+    expect(repro.finishRound().code).toBe(0);
+    expect(repro.context().json.outcome).toBe("checked");
+    expect(repro.agent("reproduce").code).toBe(0);
+    expect
+      .soft(repro.route().json)
+      .toMatchObject({ repro: true, ciReproduced: true, ciFixDone: false });
+    expect(repro.agent("diagnose").code).toBe(0);
+    expect(repro.events().filter((event) => event.kind === "local-gate")).toEqual([]);
+    expect(repro.events().filter((event) => event.agent === "reproduce")).toHaveLength(1);
+    expect(repro.events().filter((event) => event.kind === "regression")).toEqual([
+      { kind: "regression", exitCode: 1 },
+    ]);
+    const no = consumer();
+    no.prompt(
+      "/bkit-debug #1 https://github.com/example/example/actions/runs/123/attempts/2 [repro]\n",
+    );
+    expect(no.select().state.repro).toBe(true);
+    expect(no.round().json.source).toBe("ci");
+    expect(no.finishRound().code).toBe(0);
+    expect(no.context().json.outcome).toBe("checked");
+    expect(no.agent("reproduce", "NO").code).toBe(0);
+    expect(no.route().json).toMatchObject({ ciReproduced: false, ciFixDone: false });
+    expect(stepText(5)).toMatch(/REPRODUCED` = NO and CI is selected → \*\*Failure Path\*\*/);
+    expect(no.events().filter((event) => event.agent === "remediate")).toEqual([]);
+    expect(fs.readFileSync(path.join(no.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
+  });
+
+  it("blocks missing logs and wrong-branch evidence before source edits", () => {
+    const missing = consumer();
+    expect(missing.select().state.ciRun).toBe("123");
+    expect(missing.round().json.source).toBe("ci");
+    missing.control.logs = false;
+    missing.save();
+    expect(missing.context().json.outcome).not.toBe("checked");
+    expect(missing.route().json.ciFixDone).toBe(false);
+    expect(missing.events().filter((event) => event.kind === "agent")).toEqual([]);
+    expect(missing.events().filter((event) => event.kind === "local-gate")).toEqual([]);
+    expect(fs.readFileSync(path.join(missing.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
+    const wrong = consumer();
+    wrong.control.branch = "fix/other";
+    wrong.save();
+    const refused = wrong.select().found;
+    expect(refused.code).toBe(82);
+    expect(refused.err).toContain("run branch fix/other differs from adopted branch fix/ci");
+    expect(fs.existsSync(wrong.vars.CI_SELECTION_FILE!)).toBe(false);
+    expect(wrong.events().filter((event) => event.kind === "agent")).toEqual([]);
+    expect(wrong.events().filter((event) => event.kind === "local-gate")).toEqual([]);
+    expect(fs.readFileSync(path.join(wrong.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 0b0f36414..c1afd6edb 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -1018,6 +1018,8 @@ async function finish(ctx: RunContext): Promise<number> {
   if (strategy !== undefined && !STRATEGIES.includes(strategy))
     throw new CommandError(EXIT.USAGE, "--strategy must be STANDARD|PIVOT|FINAL");
   delete fields.Strategy;
+  if (workflow === "debug" && step === "debug-failure-reproduce" && fields.Reproduced !== undefined)
+    extras.reproduced = fields.Reproduced;
 
   const clampLog = str(f.clampLog);
   if (clampLog !== undefined) {
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 8c7487b98..ffffbd204 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -105,6 +105,8 @@ Placeholders: the copies keep them raw, so replace each one in your copy:
 
 The block rules (markers, contexts, self-skip, output bounds) are in the managed block of `.agents/context.md`. Each fetch block bounds its own output at the source, with a window, a severity / level filter, a row / line cap, a page cap or a per-lane tail, because everything it prints is written into an artifact that an agent then reads. A block that bounds nothing downloads a whole-run dump, and only the post-hoc clamp catches it (`bkit check` advises, `context-fetch-unbounded`).
 
+For selected CI, `context fetch --ci-selection-file` supplies the four `BKIT_CI_*` identity inputs listed below and validates the `bkit-ci-evidence` receipt defined in `.agents/context.md`. The receipt follows complete metadata, job and log reads; empty, partial or mismatched evidence stays unchecked. An unpinned block discovers its own source. Consumer-owned blocks remain unchanged on upgrade; Debug adapts a temporary script for the selected identity.
+
 <!-- prettier-ignore -->
 | File | Fits | `context=` | Fetches | Secret / non-secret env | Domains | CLI (provision) |
 | --- | --- | --- | --- | --- | --- | --- |
diff --git a/.bkit/version b/.bkit/version
index 599dc18aa..aabb7eb5e 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "04d591fb6ab9f66ad269a58d457d03a38a15b6c5c6d7e3a8af51d31feb697320",
+    "docs/testing.md": "209d624c2743ac354ea2aaba1ecbc064f7127fca89115a6476de1a5300f06333",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "3323a98811ad65da0fc30d5e52f2a48cd09872dc490fcac0008adba097c37e0a",
-    ".bkit/templates.md": "67c70f0d414303480df7d71bf4a3c3ff79f67d57823bcabc2464198dd7306318",
+    ".bkit/templates.md": "35ede392db4436c95a20f02b58e6af04f613108c0bdd6839b60dde5fd7db90e9",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "62fb19175ac1c24ca3f0b281533065b9e5e51998a2122fecb1964e7e8d9a23d8",
+    ".bkit/workflows.md": "48dfb4d8aeb07fbb1caaf32d5c9b4f5c6a8e8429ebaacff3c327e741d61dc1ba",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index df3f27f31..83889b73c 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -992,6 +992,8 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
 
+**Evidence round contract:** `tests run` writes a CI artifact with `Verdict: FAIL`, `Source: ci`, repository, workflow, run, attempt, commit, URL and generation. Its row has `source: ci`, `scope: ci:<runId>`, and null gate, exit code and failure count; it explicitly says the local gate did not run. `steps finish` checks this artifact against the active selection instead of demanding a local clamp record. `status route` returns `ciRun`, `ciGeneration`, `ciFixDone` and `ciReproduced`; only DONE rows for the current generation count. The reproduction row persists the report's `Reproduced` value as `reproduced`. After a matching fix, ordered declared gates cover known failed tiers first, retain the normal fallback order, and honor `[live=off]`. The configured workflow selector remains `package.json` `bkit.testing.ciWorkflow`; selecting another workflow adds its final proof rather than replacing the configured gate.
+
 **Mode detection (Step 1):** `bkit prs probe` (any base): open PR → `PUSH_MODE` = PR, else LOCAL (exit 80 → `list_pull_requests`); Step 11 re-probes and re-records it, so labels and the ` bkit [verbose ci]` suffix on the close follow a PR opened or closed mid-run; one `bkit status route --workflow=debug --fid= --month= --prompt-file={SESSION_DIR}/prompt.md` prints `debugAttempt` (which debug run this is; a resume keeps its number), `debugMode`, `repro` and `gates`. `debugMode` (NORMAL | SOAK), first match wins: `[soak]` in session prompt → SOAK; the newest run still `IN_PROGRESS` (a resume) is already in SOAK — `debug-failure-soak` rows, or `debugMode` SOAK in its `workflow-meta` (a Step 3 escalation) → SOAK; `debug-failure-remediate` rows across every debug run of the feature >= `debug.fix.maxAttempts` → SOAK; else NORMAL. A finished run's mode never carries into the next run; its fix and soak rows count against the limits. `repro` = `[repro]` in session prompt; `gates` = debug's candidates, the live one dropped on `[live=off]` in session prompt. The issue body is not read for markers. A cause that cannot be localised → SOAK is judged by the Step-6 diagnose `Mode: SOAK`, not here.
 
 **Ladder + cutover:** `NORMAL` (diagnose + remediate) and `SOAK` (accumulating-context instrument-or-fix). There is no observe mode; `[DEBUG-OBSERVE]` appears only in the soak agent loop. SOAK entry: invocation start (fix attempts used up across the feature's runs, or `[soak]`); mid-run Step-6 `Mode: SOAK` (`Verdict` != PASS); `FIX_ATTEMPT` over `debug.fix.maxAttempts` (STANDARD → PIVOT → FINAL) — final SOAK escalation before handover. `bkit status meta --debug-mode=SOAK` records the switch; `SOAK_ATTEMPT` counts soak rows across every debug run of the feature against `debug.soak.maxAttempts` — nothing resets it (default worst case without asking: 2 fix + 2 soak attempts per feature, over 1 to 4 runs). With `debug.fix.ask` / `debug.soak.ask` true and not headless, the Loop Question asks before each further attempt (`Try again` / `Stop`; Stop → handover, run stays `IN_PROGRESS`). Used-up soak attempts with `debug.soak.ask` true in a session → the Loop Question too; `Try again` grants one more allowance of soak attempts (§ Ask points). SOAK is terminal: the switch is one-way. Soak loops on whatever Run Tests fails on (live or mocked). Diagnose recommends; the orchestrator decides.
diff --git a/README.md b/README.md
index a35a43979..1435b1f2b 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 904f900e026931020d728afe2414a01e513c93e0 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 30e71585ea04fb206ff3661d0d6ef35c418c93f2 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -366,7 +366,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|351| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|348| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|351| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|198| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|157| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|131| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index a08081b4a..b173561b6 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -818,6 +818,8 @@ async function finish(ctx) {
     if (strategy !== undefined && !STRATEGIES.includes(strategy))
         throw new CommandError(EXIT.USAGE, "--strategy must be STANDARD|PIVOT|FINAL");
     delete fields.Strategy;
+    if (workflow === "debug" && step === "debug-failure-reproduce" && fields.Reproduced !== undefined)
+        extras.reproduced = fields.Reproduced;
     const clampLog = str(f.clampLog);
     if (clampLog !== undefined) {
         const [clampStep, clampAttempt] = fill(clampLog, attempt).split(":");
diff --git a/docs/capabilities.md b/docs/capabilities.md
index d1f1b1a24..3788a1a0d 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `904f900e0`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `30e71585e`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 904f900e026931020d728afe2414a01e513c93e0 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 30e71585ea04fb206ff3661d0d6ef35c418c93f2 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -171,7 +171,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|351| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|348| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|351| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|198| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|157| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|131| n_bkit_core_engine_shared
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 904f900e026931020d728afe2414a01e513c93e0 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 30e71585ea04fb206ff3661d0d6ef35c418c93f2 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index 9542f7494..b2ca09c91 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -522,3 +522,4 @@
 {"schema":3,"ts":1793617174652,"firstTs":1793617174652,"updates":1,"kind":"decision","key":"826-progress-returned-fingerprint","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"gpt-6.1-sol"},"references":["826","docs/plans/202611/826-append-routine-workflow-design.md"],"summary":"Compare exact stable returned-body fingerprints separately from immutable outgoing source.","rationale":"Human edits can preserve markers, while normalization makes outgoing/returned byte equality unreliable.","status":"ACTIVE"}
 {"schema":3,"ts":1793617174653,"firstTs":1793617174653,"updates":1,"kind":"decision","key":"826-progress-invocation-lifecycle","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"gpt-6.1-sol"},"references":["826","docs/plans/202611/826-append-routine-workflow-design.md"],"summary":"Bind bootstrap, auto and terminal operations explicitly, with committed preparation and cleanup-safe acknowledgment caches.","rationale":"Startup and post-close posting lack an ordinary open-run action boundary; deterministic binding enables conservative recovery after cleanup and on a fresh clone.","status":"ACTIVE"}
 {"schema":3,"ts":1793617174654,"firstTs":1793617174654,"updates":1,"kind":"decision","key":"826-progress-bounded-delivery","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"gpt-6.1-sol"},"references":["826","docs/plans/202611/826-append-routine-workflow-design.md"],"summary":"Bound lock/network work, preserve acknowledged success, and retain pending evidence with redacted outcome counts.","rationale":"Unbounded retries, postflight-induced fallback and pruning pending snapshots make recovery unsafe or unobservable. The implementation uses the design's explicit time/page/attempt limits.","status":"ACTIVE"}
+{"schema":3,"ts":1793631209323,"firstTs":1793631209323,"updates":1,"kind":"decision","key":"830-red-ci-run-is-the-first-test-round","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["#830 — Debug: diagnose a named red CI run before rerunning local tests — https://github.com/cbartens/bkit/issues/830","#748 — Brand every consumer-facing script, check and style name bkit-* — https://github.com/cbartens/bkit/issues/748","docs/plans/202611/830-debug-diagnose-named-plan.md"],"summary":"A selected red CI run is Debug's first evidence round","description":"Resolve and validate selected CI evidence before local discovery, filter automatic lookup by bkit.testing.ciWorkflow, and validate repository, branch and commit ancestry. Persist selection atomically with a stable generation; [local] overrides saved CI and [repro] requires a generation-scoped reproduction before remediation. Unavailable or partial evidence blocks diagnosis. Run declared local gates after a current-generation fix, then require the configured gate and the selected workflow to pass at the exact pushed head; report original and verifying identities separately.","rationale":"An existing red CI result is failure evidence even when local gates pass; local success cannot establish that a CI-only defect was fixed.","alternatives":"Run local discovery before diagnosis; use an unrelated workflow's latest result; rediscover a newer run during resume; treat unavailable CI as no failure; close after local success alone.","status":"ACTIVE"}
diff --git a/docs/testing.md b/docs/testing.md
index 1c268740d..6d64fc1f8 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -554,11 +554,24 @@ See `deployments.md` § Commit-message force tags for the marker mechanics. That
 `/bkit-debug` gates on declared live tier (`test:live` / `test:integration:live` / `test:e2e:live`) when consumer declares one — appended to Run-Tests (`[live=off]` opt-out); recorded in `TEST_SCOPE`. **`/bkit-build` does not run live tier**, because @live needs deployed URL; validated post-merge by push-only `bkit-tests-live` + reproduced via `/bkit-debug` (never purely local).
 
 - **Build** — local tiers only (`test`); never `test:live`; @live = push-only canary.
-- **Debug** — live boundary iteration 1 (reproduce); diagnose live-tier failure; require fail→pass before close.
+- **Debug** — selected CI evidence is the first round when available; otherwise discover failures through declared local gates. Run local gates after a current-generation fix and require the pushed-head CI proof before closing a CI-only failure.
 - **Soak** (`DEBUG_MODE = SOAK` at start when fix attempts across the feature's debug runs reach `debug.fix.maxAttempts` or `[soak]`, mid-run `Mode: SOAK`, or fix attempts used up) — one instrument-or-fix step / iteration on live boundary, bounded by `debug.soak.maxAttempts` across the feature's debug runs.
 
 No live tier (or `[live=off]`) → Debug degrades to CONCERNS + `testsLiveSkipped` in status.jsonl / close comment — green != "works." bkit has no deploy → CONCERNS by design. Build records no `testsLiveSkipped` — @live out of scope, not skipped.
 
+## Debug CI evidence verification
+
+CI evidence, reproduction and local verification have separate purposes:
+
+1. A validated selected red run supplies the first failure round. Its artifact identifies the exact repository, workflow, run, attempt, commit and generation, and records that no local gate ran. Unavailable reads, missing logs and wrong-branch evidence block diagnosis; they do not establish a clean result.
+2. `[repro]` asks for a failing regression test before remediation, even when CI is already red. The successful reproduction is stored for its generation. A CI reproduction result of NO blocks resolution; an explicit `[local]` clears saved CI selection and restores local discovery.
+3. A DONE remediation or soak result for the active generation enables declared local gates. Known failed tiers guide their order, while `[live=off]` retains its live opt-out. The existing live-skipped warning and CONCERNS behavior still apply.
+4. After the final push, the configured gate and the selected workflow must both pass at the exact pushed head. Original failure and verifying run links remain distinct. Local success alone does not resolve a CI-only failure.
+
+`.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` runs real built CLI commands taken from the Debug workflow against fresh temporary consumers. It exercises selection, durable metadata and resume, exact-attempt context scripts, explicit local and reproduction overrides, generation-specific fixes, conditional local-gate execution, and green or red pushed-head verification. The fixture replaces remote CI reads and agent-produced reports; it uses the actual selection, context validation, status fold and gate evaluation.
+
+Run the focused integration file with `pnpm bkit:test:file .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`, then the complete `pnpm bkit:gate:static-unit-integration` and `pnpm bkit check`. Release dogfood also installs the built package into a scratch consumer under `tmp/` and inspects its metadata, artifacts and host files. Historical run replay is reported separately as available or unavailable; missing history or expired logs are never a passing smoke result.
+
 ## Consumer-runtime parity rule
 
 CI must catch every consumer `pnpm bkit install` hard-fail. Same `.bkit/core/engine/**` code in repo + consumers, so release must not ship untested install paths.
