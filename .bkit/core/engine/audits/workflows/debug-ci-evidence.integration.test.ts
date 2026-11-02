// Real built CLI, workflow command lines, package gates, Git history and context
// scripts. Only GitHub reads and agent-produced diagnosis/fix reports are fixtures.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getPkgRoot, getTemplatesRoot, getWorkflowsRoot } from "../../shared/package-roots";

const ROOT = getPkgRoot();
const WORKFLOW = fs.readFileSync(path.join(getWorkflowsRoot(), "bkit-debug.md"), "utf8");
const FID = "1-ci-evidence";
const MONTH = "202611";
const LOG = `docs/plans/${MONTH}/logs/${FID}`;
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function stepText(number: number): string {
  const headings = [...WORKFLOW.matchAll(/^## .*Step (\d+) —[^\n]*$/gm)];
  const index = headings.findIndex((match) => Number(match[1]) === number);
  const start = headings[index]?.index;
  if (start === undefined) throw new Error(`Missing Debug step ${number}`);
  return WORKFLOW.slice(start, headings[index + 1]?.index ?? WORKFLOW.length);
}

function command(number: number, prefix: string): string {
  const lines = [...stepText(number).matchAll(/```bash\n([\s\S]*?)```/g)]
    .flatMap((match) => match[1]!.replace(/\\\n\s*/g, " ").split("\n"))
    .map((line) => line.trim());
  const line = lines.find((candidate) => candidate.startsWith(`"{BKIT}" ${prefix}`));
  if (!line) throw new Error(`Missing actual Step ${number} command ${prefix}`);
  return line.replace(/\s*>\/dev\/null.*$|\s+\|\| exit.*$/, "");
}

function git(cwd: string, ...args: string[]): string {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
  return result.stdout.trim();
}

function consumer() {
  const parent = path.join(ROOT, "tmp");
  fs.mkdirSync(parent, { recursive: true });
  const cwd = fs.mkdtempSync(path.join(parent, "debug-ci-evidence-"));
  roots.push(cwd);
  const write = (name: string, value: string) => {
    const file = path.join(cwd, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value);
    return file;
  };
  git(cwd, "init", "-q", "-b", "fix/ci");
  git(cwd, "config", "user.name", "fixture");
  git(cwd, "config", "user.email", "fixture@example.test");
  git(cwd, "config", "commit.gpgsign", "false");
  git(cwd, "config", "core.hooksPath", "/dev/null");
  git(cwd, "remote", "add", "origin", "https://github.com/example/example.git");
  write(".gitignore", "bin/\ncontrol.json\nevents.jsonl\n.git/\n");
  write("source.txt", "unfixed\n");
  write(".github/workflows/consumer-ci.yml", "name: configured CI\n");
  write(".github/workflows/special-ci.yml", "name: selected CI\n");
  write(
    "package.json",
    JSON.stringify({
      name: "ci-evidence-fixture",
      private: true,
      scripts: {
        "bkit:gate:static-unit": "node gate.cjs shallow",
        "bkit:gate:static-unit-integration": "node gate.cjs integration",
        "bkit:gate:static-unit-integration-e2e-live": "node gate.cjs live",
      },
      bkit: { tracker: { default: "none" }, testing: { ciWorkflow: "consumer-ci.yml" } },
    }),
  );
  write(
    "gate.cjs",
    `const fs = require("node:fs");
fs.appendFileSync("events.jsonl", JSON.stringify({kind:"local-gate", gate:process.argv[2]}) + "\\n");
const control = JSON.parse(fs.readFileSync("control.json", "utf8"));
if (!control.local && fs.readFileSync("source.txt", "utf8").trim() !== "fixed") process.exit(1);
console.log("consumer checks passed");
`,
  );
  const template = fs.readFileSync(path.join(getTemplatesRoot(), "context/bkit-github.md"), "utf8");
  const ci = /<!-- context-fetch:start github context=ci -->[\s\S]*?```bash\n([\s\S]*?)```/.exec(
    template,
  )?.[1];
  if (!ci) throw new Error("Missing shipped GitHub CI context script");
  write(
    ".agents/context.md",
    `# Context\n<!-- bkit:end -->\n<!-- context-fetch:start github context=ci -->\n\n\`\`\`bash\n${ci}\`\`\`\n<!-- context-fetch:end -->\n`,
  );
  const script = write("bin/context.sh", ci);
  const status = write(
    `${LOG}/status.jsonl`,
    JSON.stringify({ type: "workflow-started", workflow: "debug", at: "2026-11-01T00:00:00Z" }) +
      "\n",
  );
  write(
    "bin/prompt.md",
    "/bkit-debug #1 https://github.com/example/example/actions/runs/123/attempts/2 [live=off]\n",
  );
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "fixture initial state");
  const head = git(cwd, "rev-parse", "HEAD");
  const control = {
    head,
    branch: "fix/ci",
    logs: true,
    final: "success",
    finalHead: head,
    verifyingId: 301,
    local: false,
  };
  const save = () => write("control.json", JSON.stringify(control));
  save();
  write("events.jsonl", "");
  const bin = path.join(cwd, "bin");
  const wrapper = write(
    "bin/bkit",
    `#!${process.execPath}
const fs=require("node:fs"), cp=require("node:child_process");
const argv=process.argv.slice(2);
fs.appendFileSync("events.jsonl",JSON.stringify({kind:"cli",argv})+"\\n");
const result=cp.spawnSync(process.execPath,[${JSON.stringify(path.join(ROOT, "dist/cli.js"))},...argv,"--json"],{stdio:"inherit"});
process.exit(result.status ?? 1);
`,
  );
  fs.chmodSync(wrapper, 0o755);
  const gh = write(
    "bin/gh",
    `#!${process.execPath}
const fs=require("node:fs");
const args=process.argv.slice(2), state=JSON.parse(fs.readFileSync("control.json","utf8"));
fs.appendFileSync("events.jsonl",JSON.stringify({kind:"gh",argv:args})+"\\n");
const emit=value=>process.stdout.write(JSON.stringify(value));
const flag=name=>{const at=args.indexOf(name);return at<0?undefined:args[at+1]};
const endpoint=args.find(value=>value.startsWith("/repos/")) || "";
const reject=message=>{process.stderr.write(message);process.exit(3)};
const run=id=>({id,run_attempt:2,workflow_id:777,path:".github/workflows/special-ci.yml",head_branch:state.branch,head_sha:state.head,
  head_repository:{full_name:"example/example"},repository:{full_name:"example/example"},status:"completed",conclusion:"failure",event:"push",
  html_url:"https://github.com/example/example/actions/runs/"+id,created_at:"2026-11-01T01:00:00Z",updated_at:"2026-11-01T01:01:00Z"});
if(args[0]==="auth") process.exit(0);
if(args[0]==="run" && args[1]==="view"){
  if(!args.includes("--log-failed") || flag("--repo")!=="example/example" || flag("--attempt")!=="2" || flag("--job")!=="501") reject("unpinned context log request");
  if(!state.logs) reject("selected logs unavailable");
  process.stdout.write("integration fixture failure in run "+args[2]+" attempt 2\\n");process.exit(0);
}
if(args[0]!=="api" || !endpoint.startsWith("/repos/example/example/")) reject("unexpected remote request "+args.join(" "));
if(endpoint.includes("/actions/workflows/")){
  if(!endpoint.includes("head_sha=")) reject("verification must request exact pushed head");
  const selected=endpoint.includes("/777/"), id=selected?state.verifyingId:201;
  const value={...run(id),workflow_id:selected?777:456,head_branch:"fix/ci",head_sha:selected?state.finalHead:state.finalHead,conclusion:selected?state.final:"success",run_attempt:1};
  emit({total_count:1,workflow_runs:[value]});process.exit(0);
}
if(endpoint.includes("/jobs")){
  if(endpoint.includes("/201/")){emit({total_count:1,jobs:[{id:1,name:"bkit-tests-check",status:"completed",conclusion:"success"}]});process.exit(0)}
  if(!endpoint.includes("/attempts/2/jobs")) reject("jobs require the selected attempt");
  const value={total_count:1,jobs:[{id:501,name:"bkit-tests-integration",status:"completed",conclusion:"failure"}]};
  emit(args.includes("--slurp")?[value]:value);process.exit(0);
}
const match=endpoint.match(new RegExp("/actions/runs/([0-9]+)(?:/attempts/([0-9]+))?"));
if(match){if(match[2] && match[2]!=="2")reject("wrong attempt");emit(run(Number(match[1])));process.exit(0)}
reject("unsupported fixture endpoint "+endpoint);
`,
  );
  fs.chmodSync(gh, 0o755);
  const vars: Record<string, string> = {
    BKIT: wrapper,
    STATUS: status,
    SESSION_DIR: bin,
    OUTBOX: bin,
    FID,
    YYYYMM: MONTH,
    BRANCH: "fix/ci",
    OWNER_REPO: "example/example",
    CI_SELECTION_FILE: path.join(bin, "ci-selection.json"),
    ISSUE_TEXT_FLAG: "",
    IDX: "1",
    CI_GENERATION: "1",
    DEBUG_ATTEMPT: "1",
    ROUND: "1",
    SCRIPT: script,
    STRATEGY: "STANDARD",
    CI_TEST_FLAGS: "",
    GATE_FLAGS: "",
    TEST_SOURCE: "ci",
    FAILURES_FLAG: "",
    CLAMP_FLAG: "",
    TEST_VERDICT: "FAIL",
    TEST_SCOPE: "ci:123",
    VERIFY_HEAD: head,
    DEBUG_MODE: "NORMAL",
    PUSH_MODE: "LOCAL",
  };
  const childEnv = {
    ...process.env,
    PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    CI: "true",
    GIT_TERMINAL_PROMPT: "0",
  };
  const runLine = (line: string) => {
    let rendered = line.replaceAll('"$SCRIPT"', '"{SCRIPT}"').replaceAll("<attempt>", vars.ROUND!);
    for (const [name, value] of Object.entries(vars))
      rendered = rendered.replaceAll(`{${name}}`, value);
    if (/\{[A-Z_]+\}/.test(rendered)) throw new Error(`Unresolved workflow command ${rendered}`);
    const result = spawnSync("bash", ["-c", rendered], {
      cwd,
      env: childEnv,
      encoding: "utf8",
      timeout: 30_000,
    });
    if (result.error) throw result.error;
    return {
      code: result.status,
      json: result.stdout.trim() ? JSON.parse(result.stdout) : null,
      err: result.stderr,
    };
  };
  const execute = (step: number, prefix: string) => runLine(command(step, prefix));
  const prompt = (text: string) => write("bin/prompt.md", text);
  const events = () =>
    fs
      .readFileSync(path.join(cwd, "events.jsonl"), "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  const route = () => execute(2, "status route");
  const select = () => {
    const found = execute(2, "runs locate");
    if (found.code !== 0 && found.code !== 1) return { found, state: null };
    const persisted = execute(2, "status meta --file=");
    if (persisted.code !== 0) throw new Error(`Persist selection: ${persisted.err}`);
    const modes = execute(2, 'status meta --file="{STATUS}" --workflow=debug --debug-attempt=run');
    if (modes.code !== 0) throw new Error(`Persist debug modes: ${modes.err}`);
    const state = route();
    vars.CI_GENERATION = String(state.json.ciGeneration);
    vars.GATE_FLAGS = state.json.gates.map((gate: string) => `--gate=${gate}`).join(" ");
    vars.CI_TEST_FLAGS = "";
    if (state.json.ciRun) {
      const selection = JSON.parse(fs.readFileSync(vars.CI_SELECTION_FILE!, "utf8"));
      vars.CI_TEST_FLAGS = `--ci-run=${state.json.ciRun} --ci-url="${selection.runUrl}"`;
    }
    return { found, state: state.json };
  };
  const round = () => {
    const result = execute(3, "tests run");
    if (!result.json) throw new Error(`Run tests exited ${result.code}: ${result.err}`);
    vars.TEST_SOURCE = result.json.source ?? "local";
    vars.TEST_SCOPE = result.json.scope;
    vars.TEST_VERDICT = result.json.verdict;
    vars.FAILURES_FLAG = "";
    if (result.json.failures !== null) vars.FAILURES_FLAG = `--failures=${result.json.failures}`;
    vars.CLAMP_FLAG = "";
    if (result.json.source === "local")
      vars.CLAMP_FLAG = `--clamp-log=debug-run-tests:${vars.DEBUG_ATTEMPT}`;
    return result;
  };
  const finishRound = () => execute(3, "steps finish");
  const context = () => execute(4, "context fetch");
  const agent = (kind: "diagnose" | "remediate" | "reproduce", reproduced = "YES") => {
    const number = { diagnose: 6, remediate: 7, reproduce: 5 }[kind];
    const suffix = { diagnose: "", remediate: "-log", reproduce: "" }[kind];
    let header = "Verdict: PASS\n";
    if (kind === "diagnose") header += "Mode: NORMAL\n";
    if (kind === "remediate") header += "Strategy: STANDARD\n";
    if (kind === "reproduce") {
      let tests = "none";
      if (reproduced === "YES") {
        tests = "regression.test.cjs :: reproduces the selected failure";
        const regression = write(
          "regression.test.cjs",
          'const fs=require("node:fs");\nrequire("node:assert/strict").equal(fs.readFileSync("source.txt","utf8").trim(),"fixed");\n',
        );
        const result = spawnSync(process.execPath, [regression], { cwd, encoding: "utf8" });
        if (result.status !== 1)
          throw new Error(`Regression fixture did not fail: ${result.stderr}`);
        fs.appendFileSync(
          path.join(cwd, "events.jsonl"),
          JSON.stringify({ kind: "regression", exitCode: result.status }) + "\n",
        );
      }
      header = `Verdict: ${reproduced === "YES" ? "PASS" : "FAIL"}\nReproduced: ${reproduced}\nTests: ${tests}\n`;
    }
    write(
      `${LOG}/debug-failure-${kind}-${vars.ROUND}${suffix}.md`,
      `${header}\n<!-- verdict:end -->\n\n# Agent fixture\n\n${kind} selected run evidence.\n`,
    );
    if (kind === "remediate") write("source.txt", "fixed\n");
    fs.appendFileSync(
      path.join(cwd, "events.jsonl"),
      JSON.stringify({ kind: "agent", agent: kind }) + "\n",
    );
    return execute(number, `steps finish --file=`);
  };
  const gate = () => {
    control.finalHead = git(cwd, "rev-parse", "HEAD");
    vars.VERIFY_HEAD = control.finalHead;
    save();
    return execute(11, 'runs gate --head="{VERIFY_HEAD}"');
  };
  return {
    cwd,
    head,
    control,
    save,
    write,
    vars,
    prompt,
    events,
    select,
    route,
    round,
    finishRound,
    context,
    agent,
    gate,
    execute,
  };
}

describe("Debug CI evidence sequence", () => {
  it("checks the complete selected CI fix sequence against green and red final runs", () => {
    const f = consumer();
    expect(f.select().state).toMatchObject({
      ciRun: "123",
      ciGeneration: 1,
      ciFixDone: false,
    });
    expect(f.route().json.gates[0]).toBe("bkit:gate:static-unit-integration");
    expect(f.route().json.gates).not.toContain("bkit:gate:static-unit-integration-e2e-live");
    expect(f.round()).toMatchObject({
      code: 1,
      json: { source: "ci", verdict: "FAIL", runAttempt: 2 },
    });
    expect(f.finishRound().code).toBe(0);
    expect(f.events().filter((event) => event.kind === "local-gate")).toEqual([]);
    const fetched = f.context();
    expect(fetched).toMatchObject({ code: 0, json: { outcome: "checked" } });
    const artifact = fs.readFileSync(path.join(f.cwd, fetched.json.artifact), "utf8");
    expect(artifact).toContain('"runId":"123"');
    expect(artifact).toContain('"runAttempt":2');
    expect(artifact).toContain(f.head);
    expect(artifact).toContain("integration fixture failure in run 123 attempt 2");
    expect(f.agent("diagnose").code).toBe(0);
    expect(f.agent("remediate").code).toBe(0);
    expect(f.route().json).toMatchObject({ ciFixDone: true, ciGeneration: 1 });
    f.vars.DEBUG_ATTEMPT = "2";
    expect(f.round()).toMatchObject({ code: 0, json: { source: "local", verdict: "PASS" } });
    expect(f.finishRound().code).toBe(0);
    const events = f.events();
    const diagnosis = events.findIndex((event) => event.agent === "diagnose");
    expect(events.findIndex((event) => event.kind === "local-gate")).toBeGreaterThan(diagnosis);
    expect(events.filter((event) => event.kind === "local-gate")).toEqual([
      { kind: "local-gate", gate: "integration" },
    ]);
    const green = f.gate();
    expect(green).toMatchObject({
      code: 0,
      json: { passed: true, originalRunId: "123", verifyingRunId: 301 },
    });
    expect(green.json.originalRunUrl).toContain("/123/attempts/2");
    expect(green.json.verifyingRunUrl).toContain("/301");
    f.control.final = "failure";
    f.control.verifyingId = 302;
    const red = f.gate();
    expect(red.code).not.toBe(0);
    expect(red.json).toMatchObject({
      passed: false,
      originalRunId: "123",
      verifyingRunId: 302,
      conclusion: "success",
    });
    expect(fs.readFileSync(path.join(f.cwd, `${LOG}/status.jsonl`), "utf8")).not.toContain(
      '"type":"workflow-done"',
    );
  });

  it("reloads saved fixes and recollects explicitly replaced evidence generations", () => {
    const f = consumer();
    expect(f.select().state).toMatchObject({ ciRun: "123", ciGeneration: 1 });
    expect(f.round().json.source).toBe("ci");
    expect(f.finishRound().code).toBe(0);
    expect(f.context().json.outcome).toBe("checked");
    expect(f.agent("diagnose").code).toBe(0);
    expect(f.agent("remediate").code).toBe(0);
    f.prompt("/bkit-debug #1 [live=off]\n");
    expect(f.select().state).toMatchObject({ ciRun: "123", ciGeneration: 1, ciFixDone: true });
    f.vars.DEBUG_ATTEMPT = "2";
    expect(f.round().json.source).toBe("local");
    const before = f.events().filter((event) => event.kind === "local-gate").length;
    f.prompt(
      "/bkit-debug #1 https://github.com/example/example/actions/runs/124/attempts/2 [live=off]\n",
    );
    expect(f.select().state).toMatchObject({
      ciRun: "124",
      ciGeneration: 2,
      ciFixDone: false,
      ciReproduced: false,
    });
    f.vars.DEBUG_ATTEMPT = "3";
    expect(f.round()).toMatchObject({ code: 1, json: { source: "ci", ciGeneration: 2 } });
    expect(f.events().filter((event) => event.kind === "local-gate")).toHaveLength(before);
    const replacement = f.context();
    expect(replacement.json.outcome).toBe("checked");
    expect(fs.readFileSync(path.join(f.cwd, replacement.json.artifact), "utf8")).toContain(
      "integration fixture failure in run 124 attempt 2",
    );
  });

  it("preserves local and repro overrides across actual workflow command sequences", () => {
    const local = consumer();
    expect(local.select().state.ciRun).toBe("123");
    local.prompt("/bkit-debug #1 [local] [live=off]\n");
    expect(local.select()).toMatchObject({
      found: { code: 1 },
      state: { ciRun: null, ciGeneration: 2, redTiers: [] },
    });
    local.control.local = true;
    local.save();
    expect(local.round()).toMatchObject({ code: 0, json: { exitCode: 0, verdict: "PASS" } });
    expect(local.events().filter((event) => event.kind === "local-gate")).toHaveLength(1);
    expect(JSON.parse(fs.readFileSync(local.vars.CI_SELECTION_FILE!, "utf8"))).toEqual({
      mode: "local",
      reason: "explicit-local",
    });
    const repro = consumer();
    repro.prompt(
      "/bkit-debug #1 https://github.com/example/example/actions/runs/123/attempts/2 [repro] [live=off]\n",
    );
    expect(repro.select().state).toMatchObject({ repro: true, ciReproduced: false });
    expect(repro.round().json.source).toBe("ci");
    expect(repro.finishRound().code).toBe(0);
    expect(repro.context().json.outcome).toBe("checked");
    expect(repro.agent("reproduce").code).toBe(0);
    expect
      .soft(repro.route().json)
      .toMatchObject({ repro: true, ciReproduced: true, ciFixDone: false });
    expect(repro.agent("diagnose").code).toBe(0);
    expect(repro.events().filter((event) => event.kind === "local-gate")).toEqual([]);
    expect(repro.events().filter((event) => event.agent === "reproduce")).toHaveLength(1);
    expect(repro.events().filter((event) => event.kind === "regression")).toEqual([
      { kind: "regression", exitCode: 1 },
    ]);
    const no = consumer();
    no.prompt(
      "/bkit-debug #1 https://github.com/example/example/actions/runs/123/attempts/2 [repro]\n",
    );
    expect(no.select().state.repro).toBe(true);
    expect(no.round().json.source).toBe("ci");
    expect(no.finishRound().code).toBe(0);
    expect(no.context().json.outcome).toBe("checked");
    expect(no.agent("reproduce", "NO").code).toBe(0);
    expect(no.route().json).toMatchObject({ ciReproduced: false, ciFixDone: false });
    expect(stepText(5)).toMatch(/REPRODUCED` = NO and CI is selected → \*\*Failure Path\*\*/);
    expect(no.events().filter((event) => event.agent === "remediate")).toEqual([]);
    expect(fs.readFileSync(path.join(no.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
  });

  it("blocks missing logs and wrong-branch evidence before source edits", () => {
    const missing = consumer();
    expect(missing.select().state.ciRun).toBe("123");
    expect(missing.round().json.source).toBe("ci");
    missing.control.logs = false;
    missing.save();
    expect(missing.context().json.outcome).not.toBe("checked");
    expect(missing.route().json.ciFixDone).toBe(false);
    expect(missing.events().filter((event) => event.kind === "agent")).toEqual([]);
    expect(missing.events().filter((event) => event.kind === "local-gate")).toEqual([]);
    expect(fs.readFileSync(path.join(missing.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
    const wrong = consumer();
    wrong.control.branch = "fix/other";
    wrong.save();
    const refused = wrong.select().found;
    expect(refused.code).toBe(82);
    expect(refused.err).toContain("run branch fix/other differs from adopted branch fix/ci");
    expect(fs.existsSync(wrong.vars.CI_SELECTION_FILE!)).toBe(false);
    expect(wrong.events().filter((event) => event.kind === "agent")).toEqual([]);
    expect(wrong.events().filter((event) => event.kind === "local-gate")).toEqual([]);
    expect(fs.readFileSync(path.join(wrong.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
  });
});
