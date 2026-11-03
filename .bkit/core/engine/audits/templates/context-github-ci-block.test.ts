import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getCoreRoot, getTemplatesRoot } from "../../shared/package-roots";

const TEMPLATE = path.join(getTemplatesRoot(), "context/bkit-github.md");
const ADOPTED = path.resolve(getCoreRoot(), "../../.agents/context.md");
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function block(file: string, kind: "ci" | "diff"): string {
  const text = fs.readFileSync(file, "utf-8");
  const found = new RegExp(
    `<!-- context-fetch:start github context=${kind} -->\\s*\x60\x60\x60bash\\n([\\s\\S]*?)\\n\x60\x60\x60`,
  ).exec(text);
  if (!found) throw new Error(`Missing GitHub ${kind} block in ${file}`);
  return found[1]!;
}

function githubBlockFixture() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-pinned-github-")));
  dirs.push(cwd);
  const git = (...args: string[]) => {
    const result = spawnSync(
      "git",
      [
        "-c",
        "user.name=fixture",
        "-c",
        "user.email=fixture@example.test",
        "-c",
        "commit.gpgsign=false",
        ...args,
      ],
      { cwd, encoding: "utf-8" },
    );
    if (result.status !== 0) throw new Error(result.stderr);
    return result.stdout.trim();
  };
  git("init", "-q", "-b", "dev");
  fs.writeFileSync(path.join(cwd, "base.txt"), "baseline\n");
  git("add", "base.txt");
  git("commit", "-qm", "baseline");
  const baseline = git("rev-parse", "HEAD");
  git("switch", "-qc", "fix/ci");
  fs.writeFileSync(path.join(cwd, "failed-only.txt"), "failing revision\n");
  git("add", "failed-only.txt");
  git("commit", "-qm", "failure");
  const failed = git("rev-parse", "HEAD");
  fs.writeFileSync(path.join(cwd, "after-failure.txt"), "later unrelated changes\n");
  git("add", "after-failure.txt");
  git("commit", "-qm", "later");
  const head = git("rev-parse", "HEAD");
  git("switch", "-qc", "baseline-divergent", baseline);
  git("commit", "-q", "--allow-empty", "-m", "divergent baseline");
  const divergent = git("rev-parse", "HEAD");
  git("switch", "-q", "fix/ci");
  fs.writeFileSync(
    path.join(cwd, "package.json"),
    JSON.stringify({ bkit: { testing: { ciWorkflow: "consumer-ci.yml" } } }),
  );
  const run = {
    id: 123,
    run_attempt: 2,
    workflow_id: 777,
    path: ".github/workflows/special-ci.yml",
    head_branch: "fix/ci",
    head_sha: failed,
    status: "completed",
    conclusion: "failure",
    html_url: "https://github.com/example/example/actions/runs/123",
    repository: { full_name: "example/example" },
    head_repository: { full_name: "example/example" },
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:01:00Z",
  };
  const baselineRun = {
    ...run,
    id: 122,
    head_branch: "dev",
    head_sha: baseline,
    conclusion: "success",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:01:00Z",
  };
  const data = {
    run,
    baselines: [
      {
        ...baselineRun,
        id: 124,
        head_sha: head,
        created_at: "2026-11-01T00:00:00Z",
        updated_at: "2026-11-01T00:01:00Z",
      },
      baselineRun,
    ],
    failJob: "",
    wrongAttempt: false,
    jobsUnavailable: false,
  };
  const bin = path.join(cwd, "bin");
  fs.mkdirSync(bin);
  const calls = path.join(bin, "calls.jsonl");
  fs.writeFileSync(calls, "");
  const dataFile = path.join(bin, "data.json");
  fs.writeFileSync(
    path.join(bin, "gh"),
    `#!${process.execPath}
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const args = process.argv.slice(2);
fs.appendFileSync(path.join(__dirname, "calls.jsonl"), JSON.stringify(args) + "\\n");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));
const flag = name => { const at = args.indexOf(name); return at === -1 ? undefined : args[at + 1]; };
const out = value => {
  const filter = flag("--jq") || flag("-q");
  if (filter) { const r = cp.spawnSync("jq", ["-r", filter], {input: JSON.stringify(value), encoding: "utf8"}); process.stdout.write(r.stdout); process.exit(r.status || 0); }
  process.stdout.write(JSON.stringify(value));
};
const metadata = {...data.run, run_attempt: data.wrongAttempt ? 3 : 2};
const jobs = [
  {id: 501, databaseId: 501, name: "bkit-tests-unit", status: "completed", conclusion: "failure", steps: [{name: "unit", conclusion: "failure"}]},
  {id: 502, databaseId: 502, name: "bkit-tests-integration", status: "completed", conclusion: "timed_out", steps: [{name: "integration", conclusion: "timed_out"}]}
];
const camel = run => ({...run, databaseId: run.id, attempt: run.run_attempt, headSha: run.head_sha,
  headBranch: run.head_branch, workflowDatabaseId: run.workflow_id, workflowName: "CI", url: run.html_url,
  createdAt: run.created_at, updatedAt: run.updated_at, jobs});
const log = job => {
  if (data.failJob === String(job)) { process.stderr.write("fixture job log unavailable"); process.exit(1); }
  process.stdout.write("fixture failure log for job " + job + "\\n");
};
if (args[0] === "auth") process.exit(0);
if (args[0] === "run" && args[1] === "list") {
  if (flag("--status") === "success") out(data.baselines.map(camel));
  else out([camel({...metadata, id: 101, workflow_id: 456, path: ".github/workflows/consumer-ci.yml"})]);
  process.exit(0);
}
if (args[0] === "run" && args[1] === "view") {
  if (args.includes("--log-failed") || args.includes("--log")) log(flag("--job") || "whole-run");
  else out(camel(metadata));
  process.exit(0);
}
const endpoint = args.find(value => value.startsWith("/repos/")) || "";
if (args[0] !== "api") { process.stderr.write("unhandled gh fixture call"); process.exit(1); }
if (/\\/jobs\\/\\d+\\/logs/.test(endpoint)) { log(endpoint.match(/\\/jobs\\/(\\d+)/)[1]); process.exit(0); }
if (/\\/jobs(?:\\?|$)/.test(endpoint)) {
  if (data.jobsUnavailable) { process.stderr.write("fixture jobs unavailable"); process.exit(1); }
  const page = {total_count: jobs.length, jobs}; out(args.includes("--slurp") ? [page] : page); process.exit(0);
}
if (/\\/actions\\/workflows\\/[^/]+\\/runs/.test(endpoint)) {
  const url = new URL("https://fixture.invalid" + endpoint);
  const success = url.searchParams.get("status") === "success";
  out({total_count: success ? data.baselines.length : 1, workflow_runs: success ? data.baselines : [{...metadata, id: 101, workflow_id: 456, path: ".github/workflows/consumer-ci.yml"}]}); process.exit(0);
}
if (/\\/actions\\/runs\\/\\d+/.test(endpoint)) { out(metadata); process.exit(0); }
process.stderr.write("unhandled gh fixture endpoint " + endpoint); process.exit(1);
`,
    { mode: 0o755 },
  );
  const invoke = (kind: "ci" | "diff", pinned = true) => {
    fs.writeFileSync(dataFile, JSON.stringify(data));
    const script = path.join(cwd, `${kind}.sh`);
    fs.writeFileSync(script, block(TEMPLATE, kind));
    const childEnv: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
      REPO_ROOT: cwd,
      BASELINE_BRANCH: "dev",
    };
    for (const key of [
      "BKIT_CI_RUN_ID",
      "BKIT_CI_RUN_ATTEMPT",
      "BKIT_CI_REPO",
      "BKIT_CI_HEAD_SHA",
      "BASELINE_WORKFLOW",
    ])
      delete childEnv[key];
    if (pinned)
      Object.assign(childEnv, {
        BKIT_CI_RUN_ID: "123",
        BKIT_CI_RUN_ATTEMPT: "2",
        BKIT_CI_REPO: "example/example",
        BKIT_CI_HEAD_SHA: failed,
      });
    const result = spawnSync("bash", [script], {
      cwd,
      env: childEnv,
      encoding: "utf-8",
      timeout: 20_000,
    });
    return { code: result.status, out: result.stdout, err: result.stderr };
  };
  return {
    cwd,
    failed,
    head,
    baseline,
    divergent,
    data,
    invoke,
    calls: () =>
      fs
        .readFileSync(calls, "utf-8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as string[]),
    clearCalls: () => fs.writeFileSync(calls, ""),
  };
}

const completeReceipts = (text: string) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("bkit-ci-evidence: "))
    .map((line) => JSON.parse(line.slice("bkit-ci-evidence: ".length)))
    .filter((value) => value.complete === true);

describe("GitHub selected-evidence context blocks", () => {
  it("fetches pinned attempts without branch discovery and filters unpinned discovery", () => {
    const f = githubBlockFixture();
    const selected = f.invoke("ci");
    expect(selected.code).toBe(0);
    expect(completeReceipts(selected.out)).toEqual([
      expect.objectContaining({
        provider: "github",
        repo: "example/example",
        runId: "123",
        runAttempt: 2,
        headSha: f.failed,
        workflowId: "777",
      }),
    ]);
    expect(
      f
        .calls()
        .filter((args) => args[0] === "run")
        .filter((args) => args[1] === "list"),
    ).toEqual([]);
    const reads = f
      .calls()
      .map((args) => args.join(" "))
      .join("\n");
    expect(reads).toMatch(/attempts\/2|--attempt 2/);
    expect(reads).toMatch(/example\/example/);
    f.clearCalls();
    expect(f.invoke("ci", false).code).toBe(0);
    expect(
      f
        .calls()
        .map((args) => args.join(" "))
        .join("\n"),
    ).toMatch(/--workflow consumer-ci\.yml|actions\/workflows\/consumer-ci\.yml\/runs/);
  });

  it("emits complete receipts only after all selected job logs succeed", () => {
    const f = githubBlockFixture();
    const complete = f.invoke("ci");
    expect(completeReceipts(complete.out)).toHaveLength(1);
    expect(complete.out).toContain("fixture failure log for job 501");
    expect(complete.out).toContain("fixture failure log for job 502");
    f.data.failJob = "502";
    const partial = f.invoke("ci");
    expect(completeReceipts(partial.out)).toEqual([]);
    expect(`${partial.out} ${partial.err}`).toMatch(/unavailable|incomplete|skipped|partial/i);
    f.data.failJob = "";
    f.data.wrongAttempt = true;
    expect(completeReceipts(f.invoke("ci").out)).toEqual([]);
    f.data.wrongAttempt = false;
    f.data.jobsUnavailable = true;
    expect(completeReceipts(f.invoke("ci").out)).toEqual([]);
  });

  it("ends pinned diffs at selected commits with ancestral same-workflow baselines", () => {
    const f = githubBlockFixture();
    const diff = f.invoke("diff");
    expect(diff.code).toBe(0);
    expect(diff.out).toContain("failed-only.txt");
    expect(diff.out).not.toContain("after-failure.txt");
    expect(diff.out).toContain(f.baseline);
    expect(diff.out).toContain(f.failed);
    expect(
      f
        .calls()
        .map((args) => args.join(" "))
        .join("\n"),
    ).toMatch(
      /--workflow (?:777|special-ci\.yml|\.github\/workflows\/special-ci\.yml)|actions\/workflows\/(?:777|special-ci\.yml)\/runs/,
    );
    f.data.baselines = [{ ...f.data.baselines[1]!, head_sha: f.divergent }];
    const divergent = f.invoke("diff");
    expect(divergent.out).not.toContain("failed-only.txt");
    expect(`${divergent.out} ${divergent.err}`).toMatch(/baseline|ancestor|unavailable|skipped/i);
  });

  it("keeps adopted GitHub context blocks equal to shipped blocks", () => {
    expect(block(ADOPTED, "ci")).toBe(block(TEMPLATE, "ci"));
    expect(block(ADOPTED, "diff")).toBe(block(TEMPLATE, "diff"));
  });
});
