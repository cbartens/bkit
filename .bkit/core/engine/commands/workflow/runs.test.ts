import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import {
  checkNamespace,
  ciDispatchGate,
  mirrorPushRun,
  pollOnce,
  runsCommand,
  scanBody,
  waitLoop,
  type GateResult,
  type Gh,
} from "./runs";
import type { GhResult } from "../lib";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const FIXTURES = path.join(REPO_ROOT, "tests", "fixtures", "gh");
const FIXTURE_GH = path.join(FIXTURES, "bin", "gh");

const dirs: string[] = [];
const restoreEnv: Array<() => void> = [];
afterEach(() => {
  for (const r of restoreEnv.splice(0).reverse()) r();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** Set env vars for this test only (undefined unsets). */
function env(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    const prior = process.env[k];
    restoreEnv.push(() => {
      if (prior === undefined) delete process.env[k];
      else process.env[k] = prior;
    });
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

const tmp = (prefix = "bkit-runs-") => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

const gitIn = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

async function cli(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["runs", ...argv], [runsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return {
    code,
    json: out.length ? JSON.parse(out.join("")) : undefined,
    out: out.join(""),
    err: err.join(""),
  };
}

// ---------------------------------------------------------------------------
// The fixture gh stub (tests/gh-stub-smoke.bats) — the gate tests rest on it
// ---------------------------------------------------------------------------

const stub = (args: string[], vars: Record<string, string> = {}) => {
  const res = spawnSync(FIXTURE_GH, args, { encoding: "utf-8", env: { ...process.env, ...vars } });
  return { status: res.status, stdout: res.stdout, output: res.stdout + res.stderr };
};
const RUNS_URL = (sha: string) =>
  `/repos/example/example/actions/workflows/ci.yml/runs?head_sha=${sha}`;

describe("fixture gh stub", () => {
  it("runs?head_sha=green-capstone returns the captured workflow_runs list", () => {
    const r = stub(["api", RUNS_URL("green-capstone")]);
    expect(r.status).toBe(0);
    const runs = JSON.parse(r.stdout).workflow_runs;
    expect(runs[0]).toMatchObject({ id: 1001, conclusion: "success" });
  });

  it("runs/<id>/jobs returns the captured jobs list, --paginate is accepted", () => {
    const r = stub(["api", "/repos/example/example/actions/runs/1001/jobs", "--paginate"]);
    expect(r.status).toBe(0);
    const jobs = JSON.parse(r.stdout).jobs as Array<{ name: string }>;
    expect(jobs.filter((j) => j.name === "bkit-tests-check")).toHaveLength(1);
  });

  it("runs?head_sha=<unknown> returns total_count 0 (no-run shape)", () => {
    const r = stub(["api", RUNS_URL("totally-unknown-sha")]);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout)).toEqual({ total_count: 0, workflow_runs: [] });
  });

  it("BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr", () => {
    const r = stub(["api", RUNS_URL("green-capstone")], { BKIT_FAKE_GH_API_ERROR: "1" });
    expect(r.status).toBe(1);
    expect(r.output).toContain("fake API error");
  });

  it("rate_limit returns the requested fixture state", () => {
    const r = stub(["api", "rate_limit"], { BKIT_FAKE_RATELIMIT_STATE: "exhausted" });
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout).rate.remaining).toBe(0);
  });

  it("non-api argv exits non-zero (loud on an unmocked boundary)", () => {
    expect(stub(["auth", "status"]).status).not.toBe(0);
  });

  it("BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers", () => {
    const r = stub(["api", RUNS_URL("green-capstone")], { BKIT_FAKE_RATELIMITED: "1" });
    expect(r.status).toBe(1);
    expect(r.output).toContain("HTTP 403 rate limit exceeded");
    const rl = stub(["api", "rate_limit"], {
      BKIT_FAKE_RATELIMITED: "1",
      BKIT_FAKE_RATELIMIT_STATE: "exhausted",
    });
    expect(rl.status).toBe(0);
    expect(JSON.parse(rl.stdout).rate.remaining).toBe(0);
  });

  it("--paginate emits one document per page; --slurp collapses them into an array", () => {
    const url = "/repos/example/example/actions/runs/1009/jobs";
    const pages = stub(["api", url, "--paginate"]).stdout.trim().split("\n");
    expect(pages).toHaveLength(2);
    const slurped = JSON.parse(stub(["api", url, "--paginate", "--slurp"]).stdout);
    expect(Array.isArray(slurped) && slurped.length).toBe(2);
    expect(slurped.flatMap((p: { jobs: unknown[] }) => p.jobs)).toHaveLength(3);
  });

  it("rejects a '../'-laden SHA (no path traversal out of the runs dir)", () => {
    const r = stub(["api", "/repos/o/r/actions/workflows/ci.yml/runs?head_sha=../../etc/passwd"]);
    expect(r.status).toBe(1);
    expect(r.output).toContain("unsanitized SHA");
    expect(r.output).toContain("rejected");
  });
});

// ---------------------------------------------------------------------------
// bkit runs gate (tests/ship-gate.bats)
// ---------------------------------------------------------------------------

const fixtureGh = () => env({ PATH: `${path.dirname(FIXTURE_GH)}:${process.env.PATH}` });
const gate = (cwd: string, ...args: string[]) =>
  cli(cwd, ["gate", "--repo=example/example", ...args]);

describe("bkit runs gate", () => {
  it("accepts a green capstone at the head (exit 0) and says so", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=green-capstone");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      passed: true,
      code: 0,
      runId: 1001,
      capstone: "bkit-tests-check",
    });
    expect(r.err).toContain("capstone bkit-tests-check=success at head green-capstone");
  });

  it("rejects a failed run (12)", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=failed");
    expect(r.code).toBe(12);
    expect(r.err).toContain("selected run concluded FAILURE");
    expect(r.err).toContain("required head:  failed");
    expect(r.json.passed).toBe(false);
  });

  it("rejects no run at the head (10)", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=conflicting-no-run");
    expect(r.code).toBe(10);
    expect(r.err).toContain("no run of ci.yml exists at head conflicting-no-run (total_count=0)");
  });

  it("rejects runs that have not completed (11)", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=in-progress");
    expect(r.code).toBe(11);
    expect(r.err).toContain("runs exist at head in-progress but none completed");
  });

  it("rejects a green run at a superseded head (14), given --branch", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=superseded-green-target", "--branch=feat/superseded");
    expect(r.code).toBe(14);
    expect(r.err).toContain(
      "latest green on feat/superseded is at a SUPERSEDED head (older-sha-stale-green)",
    );
    expect(r.err).toContain("required head:  superseded-green-target");
    expect(r.err).toContain("SUPERSEDED");
    expect(r.json.testedHead).toBe("older-sha-stale-green");
  });

  it("without --branch a superseded head is 10, not 14 (no invented attribution)", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=superseded-green-target");
    expect(r.code).toBe(10);
    expect(r.err).toContain("no run of ci.yml exists at head superseded-green-target");
  });

  it("rejects a run without the capstone job (13)", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=no-capstone");
    expect(r.code).toBe(13);
    expect(r.err).toContain("capstone job 'bkit-tests-check' ABSENT");
  });

  it("rejects a cancelled run (15)", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=cancelled");
    expect(r.code).toBe(15);
    expect(r.err).toContain("selected run was CANCELLED at head cancelled");
  });

  describe("skipped lanes (16 is opt-in)", () => {
    /** A checkout whose package.json declares `bkit.shipGateRequiredLanes`. */
    const requiring = (lanes: string[]) => {
      const d = tmp();
      fs.writeFileSync(
        path.join(d, "package.json"),
        JSON.stringify({ name: "x", bkit: { shipGateRequiredLanes: lanes } }),
      );
      return d;
    };

    it("a skipped lane alone does not refuse — the capstone's green settles it — but is reported", async () => {
      fixtureGh();
      const r = await gate(tmp(), "--head=skipped-lane");
      expect(r.code).toBe(0);
      expect(r.json.skippedLanes).toEqual(["test"]);
      expect(r.err).toContain("note: 1 lane(s) concluded 'skipped'");
      expect(r.err).toContain("owns the planned-vs-vacuous judgement");
    });

    it("refuses a skipped lane named in bkit.shipGateRequiredLanes (16)", async () => {
      fixtureGh();
      const r = await gate(requiring(["test"]), "--head=skipped-lane");
      expect(r.code).toBe(16);
      expect(r.err).toContain("required lane(s) concluded 'skipped'");
      expect(r.err).toContain("vacuous green: test");
    });

    it("a required lane naming a different lane does not refuse", async () => {
      fixtureGh();
      expect((await gate(requiring(["some-other-lane"]), "--head=skipped-lane")).code).toBe(0);
    });

    it("refuses when any of several required lanes was skipped", async () => {
      fixtureGh();
      const r = await gate(requiring(["some-other-lane", "test"]), "--head=skipped-lane");
      expect(r.code).toBe(16);
      expect(r.err).toContain("vacuous green: test");
    });

    it("sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1", async () => {
      fixtureGh();
      const r = await gate(requiring(["test"]), "--head=paginated-skipped-lane");
      expect(r.code).toBe(16);
      expect(r.err).toContain("vacuous green: test");
      expect(r.err).not.toContain("ABSENT from run");
    });
  });

  it("a newer in-flight re-dispatch does not mask a completed green at the head", async () => {
    fixtureGh();
    const r = await gate(tmp(), "--head=green-then-redispatch");
    expect(r.code).toBe(0);
    expect(r.json.runId).toBe(1001);
  });

  it("tells an API error (20) from no run (10)", async () => {
    fixtureGh();
    const cwd = tmp();
    env({ BKIT_FAKE_GH_API_ERROR: "1" });
    let r = await gate(cwd, "--head=green-capstone");
    expect(r.code).toBe(20);
    expect(r.err).toContain("workflow runs query failed");
    expect(r.err).toContain("API error");
    expect((await gate(cwd, "--head=totally-unknown")).code).toBe(20);
    env({ BKIT_FAKE_GH_API_ERROR: undefined });
    r = await gate(cwd, "--head=totally-unknown");
    expect(r.code).toBe(10);
  });

  it("shapes a rate-limit refusal from rate_limit (20)", async () => {
    fixtureGh();
    env({ BKIT_FAKE_RATELIMITED: "1", BKIT_FAKE_RATELIMIT_STATE: "exhausted" });
    const r = await gate(tmp(), "--head=green-capstone");
    expect(r.code).toBe(20);
    expect(r.err).toContain("rate limit exhausted (remaining=0");
  });

  it("stderr noise on a successful gh call does not corrupt the JSON read", async () => {
    fixtureGh();
    env({ BKIT_FAKE_GH_STDERR_NOISE: "1" });
    expect((await gate(tmp(), "--head=green-capstone")).code).toBe(0);
  });

  it("an unparseable jobs response is an API error (20), not a missing capstone (13)", async () => {
    fixtureGh();
    const root = tmp();
    fs.cpSync(FIXTURES, root, { recursive: true });
    fs.writeFileSync(path.join(root, "jobs", "1001.json"), "not json");
    env({ BKIT_FAKE_GH_FIXTURE_ROOT: root });
    const r = await gate(tmp(), "--head=green-capstone");
    expect(r.code).toBe(20);
    expect(r.err).toContain("not valid JSON");
  });

  it("gh missing from PATH exits 80 (use the MCP fallback), not an API error", async () => {
    env({ PATH: tmp() });
    const r = await cli(tmp(), ["gate", "--head=green-capstone", "--repo=example/example"]);
    expect(r.code).toBe(80);
  });

  describe("BKIT_SHIP_GATE_OVERRIDE", () => {
    it("pinned to the refused head turns the refusal into 0 and appends the audit row", async () => {
      fixtureGh();
      const cwd = tmp();
      const status = path.join(cwd, "status.jsonl");
      fs.writeFileSync(status, "");
      env({ BKIT_SHIP_GATE_OVERRIDE: "failed" });
      const r = await gate(cwd, "--head=failed", `--file=${status}`);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ passed: true, overridden: true });
      expect(r.err).toContain("override honoured for head failed");
      const row = JSON.parse(fs.readFileSync(status, "utf-8").trim());
      expect(row).toMatchObject({ type: "ship-gate-override", head: "failed" });
    });

    it("a different SHA is ignored — the refusal stands", async () => {
      fixtureGh();
      env({ BKIT_SHIP_GATE_OVERRIDE: "some-other-sha" });
      expect((await gate(tmp(), "--head=failed")).code).toBe(12);
    });

    it("honoured with no status file (no crash), the row goes to stderr", async () => {
      fixtureGh();
      env({ BKIT_SHIP_GATE_OVERRIDE: "failed" });
      const r = await gate(tmp(), "--head=failed");
      expect(r.code).toBe(0);
      expect(r.err).toContain("override honoured for head failed");
      expect(r.err).toContain("ship-gate-override");
    });

    it("an unwritable status file still exits 0 and emits the row to stderr (never invisible)", async () => {
      fixtureGh();
      env({ BKIT_SHIP_GATE_OVERRIDE: "failed" });
      const r = await gate(tmp(), "--head=failed", "--file=/nonexistent-bkit-dir-384/status.jsonl");
      expect(r.code).toBe(0);
      expect(r.err).toContain("ship-gate-override");
      expect(r.err).toContain("emitting to stderr");
    });
  });

  describe("config", () => {
    const pkg = (bkit: unknown) => {
      const d = tmp();
      fs.writeFileSync(path.join(d, "package.json"), JSON.stringify({ name: "x", bkit }));
      return d;
    };

    it("capstone and CI workflow resolve from package.json when not passed", async () => {
      fixtureGh();
      const r = await gate(
        pkg({ capstoneJob: "app-check", ciWorkflow: "build.yml" }),
        "--head=green-capstone",
      );
      expect(r.json).toMatchObject({ capstone: "app-check", ciWorkflow: "build.yml" });
      // `app-check` is not a job in run 1001's fixture, so the configured name is the one checked.
      expect(r.code).toBe(13);
      expect((await gate(tmp(), "--head=green-capstone")).code).toBe(0);
    });

    it("bkit.shipGateRequiredLanes resolves from package.json", async () => {
      fixtureGh();
      const r = await gate(pkg({ shipGateRequiredLanes: ["test"] }), "--head=skipped-lane");
      expect(r.code).toBe(16);
      expect(r.err).toContain("vacuous green: test");
    });

    it("absent shipGateRequiredLanes means no refusal", async () => {
      fixtureGh();
      expect((await gate(pkg({}), "--head=skipped-lane")).code).toBe(0);
    });

    it("a malformed shipGateRequiredLanes falls back to none, never crashes", async () => {
      fixtureGh();
      expect((await gate(pkg({ shipGateRequiredLanes: "test" }), "--head=skipped-lane")).code).toBe(
        0,
      );
    });

    it("a configured capstone that is a job in the run passes; one that is not is absent (13)", async () => {
      fixtureGh();
      const r = await gate(
        pkg({ capstoneJob: "lint", ciWorkflow: "other.yml" }),
        "--head=green-capstone",
      );
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ capstone: "lint", ciWorkflow: "other.yml" });
      expect(r.err).toContain("capstone lint=success");
      const absent = await gate(pkg({ capstoneJob: "nope" }), "--head=green-capstone");
      expect(absent.code).toBe(13);
      expect(absent.err).toContain("capstone job 'nope' ABSENT");
    });
  });

  it("missing --head is a usage error (2)", async () => {
    const r = await cli(tmp(), ["gate", "--repo=example/example"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("--head");
  });

  it("an empty --head= is a usage error (2), not a gate refusal", async () => {
    const r = await cli(tmp(), ["gate", "--head=", "--repo=example/example"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("--head needs a non-empty value");
  });

  describe("--event", () => {
    it("--event push ignores a pull_request run: no push run is 10, not 11", async () => {
      fixtureGh();
      const r = await gate(tmp(), "--head=release-pr-only", "--event=push");
      expect(r.code).toBe(10);
      expect(r.err).toContain("no run of ci.yml (event=push) exists at head release-pr-only");
    });

    it("without --event the in-flight pull_request run reads as in progress (11)", async () => {
      fixtureGh();
      expect((await gate(tmp(), "--head=release-pr-only")).code).toBe(11);
    });

    it("--event push selects the green push run beside an in-flight pull_request run", async () => {
      fixtureGh();
      const r = await gate(tmp(), "--head=release-push-green", "--event=push");
      expect(r.code).toBe(0);
      expect(r.err).toContain("run 1021");
    });

    it("--event push reds on a failed push run even when a newer pull_request run is green", async () => {
      fixtureGh();
      const r = await gate(tmp(), "--head=release-push-red-pr-green", "--event=push");
      expect(r.code).toBe(12);
      expect(r.err).toContain("selected run concluded FAILURE");
    });

    it("without --event the newer green pull_request run masks the failed push run", async () => {
      fixtureGh();
      expect((await gate(tmp(), "--head=release-push-red-pr-green")).code).toBe(0);
    });
  });

  describe("--capstone-only (ship post-merge)", () => {
    type Job = { name: string; status: string; conclusion: string | null };
    /** A fixture root holding one run at `sha` with the given status / conclusion and jobs. */
    function fixtureRun(
      sha: string,
      run: { status: string; conclusion: string | null },
      jobs: Job[],
    ): void {
      const root = tmp();
      fs.cpSync(FIXTURES, root, { recursive: true });
      const id = 1900;
      fs.writeFileSync(
        path.join(root, "runs", `${sha}.json`),
        JSON.stringify({
          total_count: 1,
          workflow_runs: [
            {
              id,
              head_sha: sha,
              ...run,
              event: "push",
              html_url: `https://github.com/example/example/actions/runs/${id}`,
              updated_at: "2026-10-10T10:00:00Z",
            },
          ],
        }),
      );
      fs.writeFileSync(
        path.join(root, "jobs", `${id}.json`),
        JSON.stringify({ total_count: jobs.length, jobs }),
      );
      env({ BKIT_FAKE_GH_FIXTURE_ROOT: root });
    }
    const capstone = (status: string, conclusion: string | null): Job => ({
      name: "bkit-tests-check",
      status,
      conclusion,
    });
    const deployFailed: Job = { name: "deploy", status: "completed", conclusion: "failure" };

    it("a failed run whose capstone passed passes: other jobs do not count", async () => {
      fixtureGh();
      fixtureRun("deploy-red", { status: "completed", conclusion: "failure" }, [
        capstone("completed", "success"),
        deployFailed,
      ]);
      const r = await gate(tmp(), "--head=deploy-red", "--capstone-only");
      expect(r.code).toBe(0);
      expect(r.json.passed).toBe(true);
      expect(r.err).toContain("capstone bkit-tests-check=success at head deploy-red");
      // Without the flag the same run refuses on its conclusion.
      expect((await gate(tmp(), "--head=deploy-red")).code).toBe(12);
    });

    it("a run still in progress whose capstone already passed passes", async () => {
      fixtureGh();
      fixtureRun("deploy-running", { status: "in_progress", conclusion: null }, [
        capstone("completed", "success"),
        { name: "deploy", status: "in_progress", conclusion: null },
      ]);
      expect((await gate(tmp(), "--head=deploy-running", "--capstone-only")).code).toBe(0);
      expect((await gate(tmp(), "--head=deploy-running")).code).toBe(11);
    });

    it("a capstone still running is in progress (11)", async () => {
      fixtureGh();
      fixtureRun("cap-running", { status: "in_progress", conclusion: null }, [
        capstone("in_progress", null),
      ]);
      const r = await gate(tmp(), "--head=cap-running", "--capstone-only");
      expect(r.code).toBe(11);
      expect(r.err).toContain("capstone 'bkit-tests-check' is in_progress");
    });

    it("a failed capstone fails (12) even when every other job passed", async () => {
      fixtureGh();
      fixtureRun("cap-red", { status: "completed", conclusion: "failure" }, [
        capstone("completed", "failure"),
        { name: "deploy", status: "completed", conclusion: "success" },
      ]);
      const r = await gate(tmp(), "--head=cap-red", "--capstone-only");
      expect(r.code).toBe(12);
      expect(r.err).toContain("concluded 'failure' (not success)");
    });

    it("a cancelled capstone is 15; a completed run without the capstone is 13", async () => {
      fixtureGh();
      fixtureRun("cap-cancel", { status: "completed", conclusion: "cancelled" }, [
        capstone("completed", "cancelled"),
      ]);
      expect((await gate(tmp(), "--head=cap-cancel", "--capstone-only")).code).toBe(15);
      fixtureRun("cap-absent", { status: "completed", conclusion: "success" }, [deployFailed]);
      expect((await gate(tmp(), "--head=cap-absent", "--capstone-only")).code).toBe(13);
    });

    it("a required lane that was skipped does not refuse: the capstone alone decides", async () => {
      fixtureGh();
      const d = tmp();
      fs.writeFileSync(
        path.join(d, "package.json"),
        JSON.stringify({ name: "x", bkit: { shipGateRequiredLanes: ["test"] } }),
      );
      expect((await gate(d, "--head=skipped-lane", "--capstone-only")).code).toBe(0);
      expect((await gate(d, "--head=skipped-lane")).code).toBe(16);
    });
  });

  describe("--validated carry-forward (17)", { timeout: 20_000 }, () => {
    /** Tags double as fixture SHAs: green-capstone / failed are the validated commit. */
    function carryRepo() {
      const repo = tmp();
      gitIn(repo, "init", "-q");
      fs.mkdirSync(path.join(repo, "src"));
      fs.mkdirSync(path.join(repo, "docs/plans/202610/logs/452g"), { recursive: true });
      fs.writeFileSync(path.join(repo, "src/a.ts"), "a\n");
      fs.writeFileSync(path.join(repo, "docs/architecture.md"), "a\n");
      gitIn(repo, "add", "-A");
      gitIn(repo, "commit", "-q", "-m", "code");
      gitIn(repo, "tag", "green-capstone");
      gitIn(repo, "tag", "failed");
      fs.appendFileSync(path.join(repo, "docs/architecture.md"), "b\n");
      fs.writeFileSync(path.join(repo, "docs/plans/202610/logs/452g/ship-summary.md"), "s\n");
      gitIn(repo, "add", "-A");
      gitIn(repo, "commit", "-q", "-m", "docs [skip ci]");
      gitIn(repo, "tag", "book-head");
      fs.appendFileSync(path.join(repo, "src/a.ts"), "b\n");
      gitIn(repo, "add", "-A");
      gitIn(repo, "commit", "-q", "-m", "code2");
      gitIn(repo, "tag", "code-head");
      return repo;
    }
    const FID = ["--month=202610", "--fid=452g"];

    it("bookkeeping-only commits on a green head pass without CI at the head", async () => {
      fixtureGh();
      const r = await gate(carryRepo(), "--head=book-head", "--validated=green-capstone", ...FID);
      expect(r.code).toBe(0);
      expect(r.err).toContain("bookkeeping only");
      expect(r.json).toMatchObject({ head: "green-capstone", mergeHead: "book-head" });
    });

    it("a source change past the validated head refuses (17) and names the path", async () => {
      fixtureGh();
      const r = await gate(carryRepo(), "--head=code-head", "--validated=green-capstone", ...FID);
      expect(r.code).toBe(17);
      expect(r.err).toContain("src/a.ts");
      expect(r.err).toContain("required head:  code-head");
      expect(r.json.nonBookkeepingPaths).toEqual(["src/a.ts"]);
    });

    it("the validated sha's own CI still has to be green (failed -> 12)", async () => {
      fixtureGh();
      const r = await gate(carryRepo(), "--head=book-head", "--validated=failed", ...FID);
      expect(r.code).toBe(12);
      expect(r.err).toContain("required head:  failed");
    });

    it("--validated equal to --head is the plain head check", async () => {
      fixtureGh();
      expect((await gate(tmp(), "--head=green-capstone", "--validated=green-capstone")).code).toBe(
        0,
      );
    });

    it("--validated without --month / --fid is a usage error (2)", async () => {
      fixtureGh();
      expect((await gate(carryRepo(), "--head=book-head", "--validated=green-capstone")).code).toBe(
        2,
      );
    });

    it("a validated sha that is not an ancestor refuses (17)", async () => {
      fixtureGh();
      const repo = carryRepo();
      const r = await gate(repo, "--head=green-capstone", "--validated=book-head", ...FID);
      expect(r.code).toBe(17);
      expect(r.err).toContain("not an ancestor");
    });
  });
});

// ---------------------------------------------------------------------------
// bkit runs mirror
// ---------------------------------------------------------------------------

describe("bkit runs mirror", () => {
  const gateResult = (code: number): GateResult => ({
    code,
    passed: code === 0,
    overridden: false,
    head: "abc123",
    mergeHead: "abc123",
    testedHead: null,
    runId: null,
    runUrl: null,
    conclusion: null,
    capstone: "bkit-tests-check",
    ciWorkflow: "ci.yml",
    repo: "example/example",
    skippedLanes: [],
    nonBookkeepingPaths: [],
    reason: `fake gate exit ${code}`,
  });

  /** Replays one gate code per poll; the clock advances one minute per poll. */
  async function mirror(
    codes: number[],
    opts: { absentMinutes?: number; maxMinutes?: number } = {},
  ) {
    const logs: string[] = [];
    let calls = 0;
    let minute = 0;
    const r = await mirrorPushRun(
      {
        head: "abc123",
        branch: "dev",
        absentMinutes: opts.absentMinutes ?? 10,
        maxMinutes: opts.maxMinutes ?? 170,
        intervalS: 0,
      },
      {
        gate: () => gateResult(codes[Math.min(calls++, codes.length - 1)]!),
        sleep: async () => {
          minute++;
          return 0;
        },
        now: () => minute * 60000,
        log: (m) => logs.push(m),
      },
    );
    return { ...r, calls, log: logs.join("\n") };
  }

  it("green push run capstone -> 0", async () => {
    const r = await mirror([0]);
    expect(r.code).toBe(0);
    expect(r.log).toContain("passed its capstone");
  });

  it("waits through in-progress polls, then mirrors green", async () => {
    const r = await mirror([11, 11, 11, 0]);
    expect(r.code).toBe(0);
    expect(r.calls).toBe(4);
  });

  it("waits through in-progress polls, then mirrors red (1)", async () => {
    const r = await mirror([11, 11, 12]);
    expect(r.code).toBe(1);
    expect(r.log).toContain("not green (gate exit 12)");
  });

  it.each([
    [12, "red"],
    [15, "cancelled"],
    [13, "capstone absent"],
    [16, "required lane skipped"],
    [7, "unknown gate exit (never a pass)"],
  ])("gate %i (%s) -> 1 with the gate's reason", async (code) => {
    const r = await mirror([code]);
    expect(r.code).toBe(1);
    expect(r.log).toContain(`fake gate exit ${code}`);
  });

  it("no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent", async () => {
    const r = await mirror([10], { absentMinutes: 0 });
    expect(r.code).toBe(3);
    expect(r.log).toContain("[skip ci]");
    expect((await mirror([14], { absentMinutes: 0 })).code).toBe(3);
  });

  it("no push run yet inside the absent window keeps waiting", async () => {
    const r = await mirror([10, 10, 0], { absentMinutes: 10 });
    expect(r.code).toBe(0);
    expect(r.calls).toBe(3);
  });

  it("still in progress at --max-minutes -> 4", async () => {
    const r = await mirror([11], { maxMinutes: 0 });
    expect(r.code).toBe(4);
    expect(r.log).toContain("still not finished");
  });

  it("two API errors are retried; the third in a row -> 20", async () => {
    expect((await mirror([20, 20, 0])).code).toBe(0);
    expect((await mirror([20, 20, 20])).code).toBe(20);
  });

  /** A gh that records its argv, then answers from the fixture stub. */
  function recordingGh() {
    const bin = tmp();
    const calls = path.join(bin, "calls");
    fs.writeFileSync(
      path.join(bin, "gh"),
      `#!/bin/sh\nprintf '%s\\n' "$*" >> "${calls}"\nexec "${FIXTURE_GH}" "$@"\n`,
      { mode: 0o755 },
    );
    env({ PATH: `${bin}:${process.env.PATH}` });
    return () => (fs.existsSync(calls) ? fs.readFileSync(calls, "utf-8") : "");
  }

  it("asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate", async () => {
    const calls = recordingGh();
    env({ BKIT_SHIP_GATE_OVERRIDE: "release-push-red-pr-green" });
    const r = await cli(tmp(), [
      "mirror",
      "--head=release-push-red-pr-green",
      "--repo=example/example",
      "--interval-s=0",
    ]);
    expect(r.code).toBe(1);
    expect(r.json.passed).toBe(false);
    expect(calls()).toContain("runs?head_sha=release-push-red-pr-green&event=push");
  });

  it("asks the gate for the push run on dev at the PR head, in the named repo", async () => {
    const calls = recordingGh();
    const r = await cli(tmp(), [
      "mirror",
      "--head=release-pr-only",
      "--repo=example/example",
      "--interval-s=0",
      "--absent-minutes=0",
    ]);
    expect(r.code).toBe(3);
    const log = calls();
    // Head, event and repo reach the run query; no run at the head sends the
    // superseded-head probe to the default branch, dev.
    expect(log).toContain(
      "api /repos/example/example/actions/workflows/ci.yml/runs?head_sha=release-pr-only&event=push",
    );
    expect(log).toContain(
      "api /repos/example/example/actions/workflows/ci.yml/runs?branch=dev&status=success&per_page=1&event=push",
    );
    expect(log).not.toContain("repo view");
  });

  it("e2e: green push run beside the PR's own in-flight run -> 0", async () => {
    fixtureGh();
    const r = await cli(tmp(), [
      "mirror",
      "--head=release-push-green",
      "--repo=example/example",
      "--interval-s=0",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ passed: true, gateCode: 0, polls: 1 });
  });

  it("e2e: a red push run is not masked by a newer green PR run -> 1", async () => {
    fixtureGh();
    const r = await cli(tmp(), [
      "mirror",
      "--head=release-push-red-pr-green",
      "--repo=example/example",
      "--interval-s=0",
    ]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("FAILURE");
  });

  it("e2e: only the PR's own run exists -> absent, not in progress (3)", async () => {
    fixtureGh();
    const r = await cli(tmp(), [
      "mirror",
      "--head=release-pr-only",
      "--repo=example/example",
      "--interval-s=0",
      "--absent-minutes=0",
    ]);
    expect(r.code).toBe(3);
  });

  it("usage: missing --head or a non-numeric minute value exits 2", async () => {
    expect((await cli(tmp(), ["mirror"])).code).toBe(2);
    expect((await cli(tmp(), ["mirror", "--head="])).code).toBe(2);
    expect((await cli(tmp(), ["mirror", "--head=abc123", "--max-minutes=soon"])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Polling: bkit runs wait
// ---------------------------------------------------------------------------

const ok = (stdout: string): GhResult => ({ ok: true, stdout, stderr: "", missing: false });
const fail: GhResult = { ok: false, stdout: "", stderr: "HTTP 500", missing: false };
const rollup = (...checks: Array<string | Record<string, unknown>>) =>
  ok(
    JSON.stringify({
      statusCheckRollup: checks.map((c) =>
        typeof c === "string" ? { name: c, status: "QUEUED" } : c,
      ),
    }),
  );

/** A gh whose `pr view` answers come from `replies` in order (the last repeats). */
function sequenceGh(replies: GhResult[], others: Record<string, GhResult> = {}) {
  const calls: string[][] = [];
  let i = 0;
  const gh: Gh = (args) => {
    calls.push(args);
    const key = `${args[0]} ${args[1]}`;
    if (key === "pr view") return replies[Math.min(i++, replies.length - 1)]!;
    return others[key] ?? fail;
  };
  return { gh, calls };
}

/** A fake gh executable: per `<cmd> <sub>` key, replies `<key>.1`, `<key>.2`, ... then `<key>`; `EXIT:n` exits n. */
function fakeGhBin(replies: Record<string, string>) {
  const dir = tmp("bkit-fake-gh-");
  for (const [name, body] of Object.entries(replies)) fs.writeFileSync(path.join(dir, name), body);
  fs.writeFileSync(
    path.join(dir, "gh"),
    [
      "#!/bin/sh",
      `d="${dir}"; key="$1-$2"`,
      `printf '%s\\n' "$*" >> "$d/calls"`,
      `n=$(( $(cat "$d/$key.n" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$d/$key.n"`,
      `f="$d/$key.$n"; [ -f "$f" ] || f="$d/$key"`,
      `[ -f "$f" ] || exit 1`,
      `case "$(head -n 1 "$f")" in EXIT:*) exit "$(head -n 1 "$f" | cut -d: -f2)" ;; esac`,
      `cat "$f"`,
    ].join("\n"),
    { mode: 0o755 },
  );
  env({ PATH: `${dir}:${process.env.PATH}` });
  return { calls: () => fs.readFileSync(path.join(dir, "calls"), "utf-8") };
}

const instant = async (ms: number) => ms;
const noLog = () => undefined;

describe("bkit runs wait", () => {
  const prTarget = {
    kind: "pr-present" as const,
    pr: "7",
    ciWorkflow: "ci.yml",
    namespace: "bkit-tests",
  };

  it("the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context", () => {
    expect(checkNamespace("bkit-tests-check")).toBe("bkit-tests");
    expect(checkNamespace("gate")).toBe("gate");
    const { gh } = sequenceGh([rollup("Vercel", "renovate")]);
    expect(pollOnce(prTarget, gh).state).toBe("none");
    expect(pollOnce(prTarget, sequenceGh([rollup("BKIT-TESTS-unit")]).gh).state).toBe("found");
    expect(pollOnce(prTarget, sequenceGh([rollup({ context: "bkit-tests-check" })]).gh).state).toBe(
      "found",
    );
    // A custom capstone moves the namespace: bkit's own lanes no longer count.
    const custom = { ...prTarget, namespace: checkNamespace("app-tests-check") };
    expect(pollOnce(custom, sequenceGh([rollup("bkit-tests-unit")]).gh).state).toBe("none");
    expect(pollOnce(custom, sequenceGh([rollup("app-tests-unit")]).gh).state).toBe("found");
  });

  it("is bounded: ceil(budget / interval) attempts, no sleep after the last", async () => {
    const { gh, calls } = sequenceGh([rollup()]);
    const slept: number[] = [];
    const w = await waitLoop(
      { budgetS: 60, intervalS: 10, once: false },
      () => pollOnce(prTarget, gh),
      async (ms) => (slept.push(ms), ms),
      noLog,
    );
    expect(w).toMatchObject({ result: "none", attempts: 6, elapsedS: 50, allErrored: false });
    expect(calls).toHaveLength(6);
    expect(slept).toHaveLength(5);
  });

  it("found stops polling; every poll erroring is err with allErrored", async () => {
    const second = sequenceGh([rollup(), rollup("bkit-tests-unit")]).gh;
    const found = await waitLoop(
      { budgetS: 60, intervalS: 10, once: false },
      () => pollOnce(prTarget, second),
      instant,
      noLog,
    );
    expect(found.result).toBe("found");
    const errs = await waitLoop(
      { budgetS: 30, intervalS: 10, once: false },
      () => pollOnce(prTarget, sequenceGh([fail]).gh),
      instant,
      noLog,
    );
    expect(errs).toMatchObject({ result: "err", attempts: 3, allErrored: true });
  });

  it("a sleep that overruns its window is blocked: hand the poll to the agent", async () => {
    const w = await waitLoop(
      { budgetS: 60, intervalS: 10, once: false },
      () => pollOnce(prTarget, sequenceGh([rollup()]).gh),
      async (ms) => ms + 6000,
      noLog,
    );
    expect(w).toMatchObject({ result: "err", blocked: true, attempts: 1 });
  });

  it("PR completed = no open checks; run targets are head-anchored", () => {
    const done = { ...prTarget, kind: "pr-completed" as const };
    expect(
      pollOnce(done, sequenceGh([rollup({ name: "a", status: "IN_PROGRESS" })]).gh).state,
    ).toBe("none");
    expect(pollOnce(done, sequenceGh([rollup({ context: "x", state: "PENDING" })]).gh).state).toBe(
      "none",
    );
    expect(
      pollOnce(
        done,
        sequenceGh([rollup({ name: "a", status: "COMPLETED" }, { state: "SUCCESS" })]).gh,
      ),
    ).toEqual({ state: "found", checks: 2 });
    const runs = ok(
      JSON.stringify([
        { headSha: "new", status: "in_progress", conclusion: "" },
        { headSha: "old", status: "completed", conclusion: "success" },
      ]),
    );
    const runGh: Gh = () => runs;
    const run = {
      kind: "run-completed" as const,
      head: "new",
      branch: "feat/x",
      ciWorkflow: "ci.yml",
      namespace: "",
    };
    // A completed run at a superseded head must not pass the completion poll.
    expect(pollOnce(run, runGh).state).toBe("none");
    expect(pollOnce({ ...run, head: "old" }, runGh)).toEqual({
      state: "found",
      conclusion: "success",
    });
    expect(pollOnce({ ...run, kind: "run-present" }, runGh).state).toBe("found");
  });

  const ROLLUP = (...names: string[]) =>
    JSON.stringify({ statusCheckRollup: names.map((name) => ({ name, status: "QUEUED" })) });

  it("CLI: found exits 0; --once not found exits 81 (end the turn, call again)", async () => {
    fakeGhBin({ "pr-view": ROLLUP("bkit-tests-static") });
    const r = await cli(tmp(), ["wait", "--pr=7"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ result: "found", target: "pr-present", attempts: 1 });
    fakeGhBin({ "pr-view": ROLLUP("vercel") });
    const once = await cli(tmp(), ["wait", "--pr=7", "--once"]);
    expect(once.code).toBe(81);
    expect(once.json).toMatchObject({ result: "none", attempts: 1 });
  });

  it("CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it", async () => {
    const gh = fakeGhBin({ "run-list": "[]", "workflow-run": "" });
    const cwd = tmp();
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { ciWorkflow: "build.yml" } }),
    );
    const r = await cli(cwd, [
      "wait",
      "--head=abc",
      "--branch=feat/x",
      "--budget-s=1",
      "--interval-s=1",
      "--dispatch-if-absent",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ result: "none", dispatched: true });
    expect(gh.calls()).toContain("run list --branch feat/x --workflow build.yml");
    expect(gh.calls()).toContain("workflow run build.yml --ref feat/x");
    expect(gh.calls()).not.toContain("ci.yml");
  });

  it("CLI: a failed gh workflow run exits 5", async () => {
    fakeGhBin({ "run-list": "[]", "workflow-run": "EXIT:1" });
    const r = await cli(tmp(), [
      "wait",
      "--head=abc",
      "--branch=feat/x",
      "--budget-s=1",
      "--interval-s=1",
      "--dispatch-if-absent",
    ]);
    expect(r.code).toBe(5);
  });

  it("CLI: gh not on PATH exits 80; budget exhausted exits 1", async () => {
    const original = process.env.PATH;
    env({ PATH: tmp() });
    expect((await cli(tmp(), ["wait", "--pr=7"])).code).toBe(80);
    env({ PATH: original });
    fakeGhBin({ "pr-view": ROLLUP() });
    const r = await cli(tmp(), ["wait", "--pr=7", "--budget-s=2", "--interval-s=1"]);
    expect(r.code).toBe(1);
    // Two polls, one real sleep between them: the last poll is not followed by a wasted sleep.
    expect(r.json).toMatchObject({ result: "none", attempts: 2, elapsedS: 1, allErrored: false });
  });

  it("CLI: usage errors exit 2", async () => {
    const cwd = tmp();
    expect((await cli(cwd, ["wait"])).code).toBe(2);
    // An empty PR number fails closed before any poll.
    expect((await cli(cwd, ["wait", "--pr="])).code).toBe(2);
    expect((await cli(cwd, ["wait", "--pr=1", "--head=a"])).code).toBe(2);
    expect((await cli(cwd, ["wait", "--head=a"])).code).toBe(2);
    expect((await cli(cwd, ["wait", "--pr=1", "--until=soon"])).code).toBe(2);
    expect((await cli(cwd, ["wait", "--pr=1", "--interval-s=0"])).code).toBe(2);
    expect((await cli(cwd, ["wait", "--pr=1", "--dispatch-if-absent"])).code).toBe(2);
    const probeOnce = ["wait", "--head=a", "--branch=b", "--once", "--dispatch-if-absent"];
    expect((await cli(cwd, probeOnce)).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// CI-Dispatch Gate: bkit runs dispatch
// ---------------------------------------------------------------------------

describe("bkit runs dispatch", { timeout: 20_000 }, () => {
  /** A feature branch pushed to a bare remote, its head the close-workflow commit. */
  function closeRepo(opts: { headMessage?: string; ciFile?: boolean; capstone?: string } = {}) {
    const root = tmp();
    const remote = path.join(root, "remote.git");
    const cwd = path.join(root, "work");
    gitIn(root, "init", "-q", "--bare", remote);
    gitIn(root, "init", "-q", "-b", "feat/1-x", cwd);
    gitIn(cwd, "config", "user.email", "t@t");
    gitIn(cwd, "config", "user.name", "t");
    if (opts.ciFile) {
      fs.mkdirSync(path.join(cwd, ".github/workflows"), { recursive: true });
      fs.writeFileSync(path.join(cwd, ".github/workflows/ci.yml"), "name: CI\n");
    }
    if (opts.capstone) {
      fs.writeFileSync(
        path.join(cwd, "package.json"),
        JSON.stringify({ bkit: { capstoneJob: opts.capstone } }),
      );
    }
    gitIn(cwd, "add", "-A");
    gitIn(
      cwd,
      "commit",
      "-q",
      "--allow-empty",
      "-m",
      opts.headMessage ?? "chore(1-x): close-workflow",
    );
    gitIn(cwd, "remote", "add", "origin", remote);
    gitIn(cwd, "push", "-q", "-u", "origin", "feat/1-x");
    const remoteHead = () => gitIn(remote, "rev-parse", "feat/1-x");
    return { cwd, remoteHead };
  }

  const base = (cwd: string) => ({
    cwd,
    pr: "7",
    fid: "1-x",
    autoRouteSuffix: "",
    budgetS: 60,
    intervalS: 10,
    retriggered: false,
  });
  const quiet = { sleep: instant, log: noLog };
  const NONE = rollup("vercel");
  const FOUND = rollup("bkit-tests-unit");

  it("dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger", async () => {
    const { cwd } = closeRepo();
    const head = gitIn(cwd, "rev-parse", "HEAD");
    const r = await ciDispatchGate(base(cwd), { gh: sequenceGh([NONE, FOUND]).gh, ...quiet });
    expect(r.ciDispatch).toEqual({ outcome: "dispatched", head, attempts: 2, retrigger: false });
    expect(gitIn(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("self-healed: one clean re-trigger commit is pushed, the re-poll finds the run", async () => {
    const { cwd, remoteHead } = closeRepo();
    const before = gitIn(cwd, "rev-parse", "HEAD");
    const { gh } = sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]);
    const r = await ciDispatchGate(
      {
        ...base(cwd),
        autoRouteSuffix: " bkit [auto route]",
      },
      { gh, ...quiet },
    );
    const head = gitIn(cwd, "rev-parse", "HEAD");
    expect(head).not.toBe(before);
    expect(gitIn(cwd, "log", "-1", "--format=%s")).toBe("chore(1-x): re-trigger bkit [auto route]");
    expect(remoteHead()).toBe(head);
    expect(r.ciDispatch).toEqual({ outcome: "self-healed", head, attempts: 7, retrigger: true });
  });

  it("no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run", async () => {
    const bare = closeRepo();
    const r = await ciDispatchGate(base(bare.cwd), { gh: sequenceGh([NONE]).gh, ...quiet });
    expect(r.ciDispatch).toMatchObject({ outcome: "no-ci", retrigger: true, attempts: 12 });
    expect(r.ciDispatch?.reason).toBeUndefined();

    const declared = closeRepo({ ciFile: true });
    const d = await ciDispatchGate(base(declared.cwd), { gh: sequenceGh([NONE]).gh, ...quiet });
    expect(d.ciDispatch).toMatchObject({ outcome: "unresolved", reason: "ci-declared-no-run" });
  });

  it("self-heal is capped at one re-trigger, and nothing is pushed after the verdict", async () => {
    const { cwd, remoteHead } = closeRepo({ ciFile: true });
    const start = gitIn(cwd, "rev-list", "--count", "HEAD");
    const r = await ciDispatchGate(base(cwd), { gh: sequenceGh([NONE]).gh, ...quiet });
    expect(r.ciDispatch?.outcome).toBe("unresolved");
    expect(Number(gitIn(cwd, "rev-list", "--count", "HEAD"))).toBe(Number(start) + 1);
    expect(remoteHead()).toBe(r.head);
  });

  it("timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head", async () => {
    const { cwd } = closeRepo({ headMessage: "chore(1-x): close-workflow bkit [skip ci]" });
    const before = gitIn(cwd, "rev-parse", "HEAD");
    const r = await ciDispatchGate(base(cwd), { gh: sequenceGh([NONE]).gh, ...quiet });
    expect(r.ciDispatch).toMatchObject({
      outcome: "unresolved",
      reason: "timeout-dirty",
      retrigger: false,
    });
    expect(gitIn(cwd, "rev-parse", "HEAD")).toBe(before);
  });

  it("gh-error: every poll errored", async () => {
    const { cwd } = closeRepo();
    const r = await ciDispatchGate(base(cwd), { gh: sequenceGh([fail]).gh, ...quiet });
    expect(r.ciDispatch).toMatchObject({ outcome: "unresolved", reason: "gh-error", attempts: 6 });
  });

  it("retrigger-suppressed maps to unresolved only, never no-ci", async () => {
    const { cwd } = closeRepo();
    const r = await ciDispatchGate(
      { ...base(cwd), autoRouteSuffix: " [skip ci]" },
      { gh: sequenceGh([NONE]).gh, ...quiet },
    );
    expect(r.ciDispatch).toMatchObject({ outcome: "unresolved", reason: "retrigger-suppressed" });
  });

  it("a re-poll that only errored is gh-error, not a no-ci pass", async () => {
    const { cwd } = closeRepo();
    const replies = [NONE, NONE, NONE, NONE, NONE, NONE, fail];
    const r = await ciDispatchGate(base(cwd), { gh: sequenceGh(replies).gh, ...quiet });
    expect(r.ciDispatch).toMatchObject({
      outcome: "unresolved",
      reason: "gh-error",
      retrigger: true,
    });
  });

  it("a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes", async () => {
    const { cwd } = closeRepo();
    const blocked = await ciDispatchGate(base(cwd), {
      gh: sequenceGh([NONE]).gh,
      sleep: async (ms) => ms + 6000,
      log: noLog,
    });
    expect(blocked).toMatchObject({ phase: "poll", handoff: 81, ciDispatch: null, attempts: 1 });

    const found = await ciDispatchGate(
      { ...base(cwd), supplied: { pollResult: "found", attempts: 4, allErrored: false } },
      { gh: sequenceGh([fail]).gh, ...quiet },
    );
    expect(found.ciDispatch).toMatchObject({ outcome: "dispatched", attempts: 4 });

    // A turn loop that saw no run goes on to the same self-heal, not straight to unresolved.
    const none = await ciDispatchGate(
      { ...base(cwd), supplied: { pollResult: "none", attempts: 6, allErrored: false } },
      { gh: sequenceGh([FOUND]).gh, ...quiet },
    );
    expect(none.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
  });

  it("a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit", async () => {
    const { cwd } = closeRepo();
    let sleeps = 0;
    const r = await ciDispatchGate(base(cwd), {
      gh: sequenceGh([NONE]).gh,
      // The first poll's five sleeps return on time; the re-poll's first sleep is blocked.
      sleep: async (ms) => (++sleeps > 5 ? ms + 6000 : ms),
      log: noLog,
    });
    expect(r).toMatchObject({ phase: "repoll", handoff: 81, retrigger: true, attempts: 7 });
    const count = gitIn(cwd, "rev-list", "--count", "HEAD");
    const again = await ciDispatchGate(
      {
        ...base(cwd),
        retriggered: true,
        supplied: { pollResult: "found", attempts: 9, allErrored: false },
      },
      { gh: sequenceGh([fail]).gh, ...quiet },
    );
    expect(again.ciDispatch).toMatchObject({
      outcome: "self-healed",
      attempts: 9,
      retrigger: true,
    });
    expect(gitIn(cwd, "rev-list", "--count", "HEAD")).toBe(count);
  });

  it("the probe namespace follows bkit.capstoneJob", async () => {
    const { cwd } = closeRepo({ capstone: "app-tests-check" });
    const r = await ciDispatchGate(base(cwd), {
      gh: sequenceGh([rollup("app-tests-unit")]).gh,
      ...quiet,
    });
    expect(r.ciDispatch?.outcome).toBe("dispatched");
  });

  it("CLI: verdict JSON, body scan, exit codes", async () => {
    const { cwd } = closeRepo();
    fakeGhBin({ "pr-view": ROLLUP_FOUND, "pr-list": '[{"number":7}]' });
    const r = await cli(cwd, ["dispatch", "--fid=1-x"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      ciDispatch: { outcome: "dispatched", attempts: 1, retrigger: false },
      phase: "done",
      pr: "7",
      scanResult: "clean",
    });

    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "squash subject\n\n* wip bkit [skip ci]");
    const dirty = await cli(cwd, ["dispatch", "--fid=1-x", "--pr=7"]);
    expect(dirty.code).toBe(4);
    expect(dirty.json.scanResult).toBe("skip-token-found");
  });

  it("CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80", async () => {
    const { cwd } = closeRepo();
    fakeGhBin({ "pr-view": "EXIT:1" });
    const r = await cli(cwd, ["dispatch", "--fid=1-x", "--pr=7", "--budget-s=1", "--interval-s=1"]);
    expect(r.code).toBe(1);
    expect(r.json.ciDispatch).toMatchObject({ outcome: "unresolved", reason: "gh-error" });
    expect(r.json.scanResult).toBeNull();
    // git stays reachable; only gh is gone.
    const bin = tmp();
    const realGit = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(realGit, path.join(bin, "git"));
    env({ PATH: bin });
    expect((await cli(cwd, ["dispatch", "--fid=1-x"])).code).toBe(80);
  });

  it("CLI: --poll-result is validated, --attempts needs it", async () => {
    const { cwd } = closeRepo();
    expect((await cli(cwd, ["dispatch", "--fid=1-x", "--pr=7", "--poll-result=maybe"])).code).toBe(
      2,
    );
    expect((await cli(cwd, ["dispatch", "--fid=1-x", "--pr=7", "--attempts=3"])).code).toBe(2);
  });
});

const ROLLUP_FOUND = JSON.stringify({
  statusCheckRollup: [{ name: "bkit-tests-unit", status: "QUEUED" }],
});

// ---------------------------------------------------------------------------
// declared + body scan
// ---------------------------------------------------------------------------

describe("bkit runs declared", () => {
  it("exit 0 when .github/workflows/<bkit.ciWorkflow> exists, 1 when not", async () => {
    const cwd = tmp();
    let r = await cli(cwd, ["declared"]);
    expect(r.code).toBe(1);
    expect(r.json).toEqual({
      declared: false,
      ciWorkflow: "ci.yml",
      path: ".github/workflows/ci.yml",
    });
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { ciWorkflow: "build.yml" } }),
    );
    fs.mkdirSync(path.join(cwd, ".github/workflows"), { recursive: true });
    // The default file does not count once another name is configured.
    fs.writeFileSync(path.join(cwd, ".github/workflows/ci.yml"), "");
    r = await cli(cwd, ["declared"]);
    expect(r.code).toBe(1);
    expect(r.json.ciWorkflow).toBe("build.yml");
    fs.writeFileSync(path.join(cwd, ".github/workflows/build.yml"), "");
    r = await cli(cwd, ["declared"]);
    expect(r.code).toBe(0);
  });

  it("the default ci.yml counts when no bkit.ciWorkflow is configured", async () => {
    const cwd = tmp();
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "x" }));
    fs.mkdirSync(path.join(cwd, ".github/workflows"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".github/workflows/ci.yml"), "");
    const r = await cli(cwd, ["declared"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      declared: true,
      ciWorkflow: "ci.yml",
      path: ".github/workflows/ci.yml",
    });
  });
});

describe("scanBody", () => {
  const landed = (...messages: string[]) => {
    const cwd = tmp();
    gitIn(cwd, "init", "-q");
    gitIn(cwd, "commit", "-q", "--allow-empty", ...messages.flatMap((m) => ["-m", m]));
    return cwd;
  };

  it.each(["[skip ci]", "[ci skip]", "[no ci]", "[skip actions]", "[actions skip]", "[SKIP CI]"])(
    "flags %s inherited into the landed commit body",
    (token) => {
      const cwd = landed("docs(x): close", `* chore(y): worktree-setup bkit ${token}`);
      expect(scanBody(cwd, "HEAD")).toBe("skip-token-found");
    },
  );

  it("passes a clean body, and a deliberate token in the SUBJECT (docs-only close)", () => {
    expect(scanBody(landed("docs(x): close DONE"), "HEAD")).toBe("clean");
    expect(scanBody(landed("docs(x): design DONE bkit [skip ci]"), "HEAD")).toBe("clean");
  });

  it("an empty or unreadable sha is an error, not a clean result", () => {
    const cwd = landed("docs(x): close");
    expect(scanBody(cwd, "")).toBe("error");
    expect(scanBody(cwd, "no-such-ref")).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// bkit runs gate --pr / --squash-of / --snapshot / --record
// ---------------------------------------------------------------------------

/** `gh pr view` answers `pr` (or fails when null); every other call goes to the fixture stub. */
function prThenFixtureGh(pr: Record<string, unknown> | null) {
  const dir = tmp("bkit-pr-gh-");
  if (pr) fs.writeFileSync(path.join(dir, "pr.json"), JSON.stringify(pr));
  fs.writeFileSync(
    path.join(dir, "gh"),
    [
      "#!/bin/sh",
      'if [ "$1 $2" = "pr view" ]; then',
      `  [ -f "${dir}/pr.json" ] || exit 1`,
      `  cat "${dir}/pr.json"; exit 0`,
      "fi",
      `exec "${FIXTURE_GH}" "$@"`,
    ].join("\n"),
    { mode: 0o755 },
  );
  env({ PATH: `${dir}:${process.env.PATH}` });
}

const openPr = (extra: Record<string, unknown> = {}) => ({
  number: 7,
  url: "https://github.com/example/example/pull/7",
  state: "OPEN",
  baseRefName: "dev",
  headRefName: "feat/7-x",
  headRefOid: "green-capstone",
  title: "feat(7-x): thing",
  mergeCommit: null,
  mergeable: "MERGEABLE",
  ...extra,
});

describe("bkit runs gate — PR heads, snapshot and audit rows", () => {
  const statusFile = () => {
    const file = path.join(tmp(), "status.jsonl");
    fs.writeFileSync(file, "");
    return file;
  };
  const rowsOf = (file: string) =>
    fs
      .readFileSync(file, "utf-8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  it("--pr gates the PR's current head", async () => {
    prThenFixtureGh(openPr());
    const r = await gate(tmp(), "--pr=7");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ passed: true, head: "green-capstone" });
  });

  it("--pr refuses a title carrying a skip token (18) and --record writes the refusal row", async () => {
    prThenFixtureGh(openPr({ title: "feat(7-x): thing [skip ci]" }));
    const file = statusFile();
    const r = await gate(tmp(), "--pr=7", `--record=${file}`);
    expect(r.code).toBe(18);
    expect(r.json.reason).toContain("CI-suppressing token");
    expect(rowsOf(file)).toEqual([
      expect.objectContaining({
        type: "ship-gate-refusal",
        workflow: "ship",
        exitCode: 18,
        head: "green-capstone",
      }),
    ]);
  });

  it("--snapshot appends the pre-merge snapshot before the gate decides", async () => {
    prThenFixtureGh(openPr({ headRefOid: "failed" }));
    const snap = path.join(tmp(), "outbox", "pre-merge-snapshot.jsonl");
    const r = await gate(tmp(), "--pr=7", `--snapshot=${snap}`);
    expect(r.code).toBe(12);
    expect(rowsOf(snap)).toEqual([
      expect.objectContaining({
        type: "ship-pre-merge-snapshot",
        gateHead: "failed",
        validatedHead: "",
        mergeable: "MERGEABLE",
      }),
    ]);
  });

  it("--squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci", async () => {
    prThenFixtureGh(openPr({ state: "MERGED", mergeCommit: { oid: "green-capstone" } }));
    const file = statusFile();
    const r = await gate(tmp(), "--squash-of=7", "--capstone-only", `--record=${file}`);
    expect(r.code).toBe(0);
    expect(r.json.head).toBe("green-capstone");
    expect(rowsOf(file)).toEqual([
      expect.objectContaining({
        type: "ship-merge-ci",
        sha: "green-capstone",
        run: "1001",
        verdict: "PASS",
        reason: "",
      }),
    ]);
  });

  it("a refused capstone records FAIL with its reason", async () => {
    prThenFixtureGh(openPr({ state: "MERGED", mergeCommit: { oid: "no-capstone" } }));
    const file = statusFile();
    const r = await gate(tmp(), "--squash-of=7", "--capstone-only", `--record=${file}`);
    expect(r.code).not.toBe(0);
    const row = rowsOf(file)[0]!;
    expect(row).toMatchObject({ type: "ship-merge-ci", verdict: "FAIL" });
    expect(String(row.reason)).not.toBe("");
  });

  it("an unreadable PR is an API error (20) with no head", async () => {
    prThenFixtureGh(null);
    const r = await gate(tmp(), "--pr=7");
    expect(r.code).toBe(20);
    expect(r.json).toMatchObject({ passed: false, head: null });
  });

  it("takes exactly one of --head, --pr, --squash-of", async () => {
    expect((await gate(tmp())).code).toBe(2);
    expect((await gate(tmp(), "--head=x", "--pr=7")).code).toBe(2);
    expect((await gate(tmp(), "--pr=x")).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// bkit runs revalidate
// ---------------------------------------------------------------------------

describe("bkit runs revalidate", () => {
  function shipRepo() {
    const cwd = tmp();
    gitIn(cwd, "init", "-q", "-b", "feat/7-x");
    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "code");
    const code = gitIn(cwd, "rev-parse", "HEAD");
    const file = path.join(cwd, "status.jsonl");
    fs.writeFileSync(file, "");
    return { cwd, code, file };
  }
  const revalidate = (cwd: string, ...extra: string[]) =>
    cli(cwd, [
      "revalidate",
      "--pr=7",
      "--branch=feat/7-x",
      "--month=202610",
      "--fid=7-x",
      "--repo=example/example",
      ...extra,
    ]);

  it("an unmoved head needs no CI wait: validated at the code head, nothing dispatched", async () => {
    const { cwd, code, file } = shipRepo();
    prThenFixtureGh(openPr({ headRefOid: code }));
    const r = await revalidate(
      cwd,
      `--entry-head=${code}`,
      `--code-head=${code}`,
      `--file=${file}`,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      validatedHead: code,
      currentHead: code,
      revalidated: false,
      dispatched: false,
      probe: null,
    });
    expect(fs.readFileSync(file, "utf-8")).toBe("");
  });

  it("exits 1 when the PR head cannot be read, 80 when gh needs auth", async () => {
    const { cwd, code, file } = shipRepo();
    prThenFixtureGh(null);
    expect(
      (await revalidate(cwd, `--entry-head=${code}`, `--code-head=${code}`, `--file=${file}`)).code,
    ).toBe(1);
    fakeGhBin({ "pr-view": "EXIT:4" });
    expect(
      (await revalidate(cwd, `--entry-head=${code}`, `--code-head=${code}`, `--file=${file}`)).code,
    ).toBe(80);
  });

  it("refuses an unknown --reason", async () => {
    const { cwd, code, file } = shipRepo();
    expect(
      (
        await revalidate(
          cwd,
          `--entry-head=${code}`,
          `--code-head=${code}`,
          `--file=${file}`,
          "--reason=because",
        )
      ).code,
    ).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// bkit runs context (/bkit-auto Step 1)
// ---------------------------------------------------------------------------

describe("bkit runs context", () => {
  function autoRepo() {
    const cwd = tmp();
    gitIn(cwd, "init", "-q", "-b", "dev");
    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "base");
    gitIn(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    gitIn(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { issueTracker: "github" } }),
    );
    // No real gh: owner/repo comes from the origin remote, never the network.
    fakeGhBin({});
    return cwd;
  }
  const context = (cwd: string, phase: string, arg: string) =>
    cli(cwd, ["context", `--phase=${phase}`, `--arg=${arg}`]);
  const prJson = (extra: Record<string, unknown> = {}) =>
    JSON.stringify({
      headRefName: "feat/12-x",
      headRefOid: "sha12",
      state: "OPEN",
      url: "https://github.com/o/r/pull/42",
      body: "<!-- bkit:issue=#12 bkit:fid=12-x -->\n",
      ...extra,
    });

  it("BRIEF phases take the argument as the issue", async () => {
    const r = await context(autoRepo(), "Design", "12");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      phase: "design",
      mode: "BRIEF",
      issueId: "12",
      ownerRepo: "o/r",
      owner: "o",
      repo: "r",
    });
  });

  it("CI_DEV: a slug argument is the FID, on dev at origin/dev", async () => {
    const cwd = autoRepo();
    const r = await context(cwd, "failure", "12-export-csv");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      phase: "debug",
      mode: "CI_DEV",
      fid: "12-export-csv",
      issueId: "12",
      branch: "dev",
      headSha: gitIn(cwd, "rev-parse", "HEAD"),
    });
  });

  it.each([["../../etc"], ["12;rm -rf"], ["a/b"]])(
    "CI_DEV refuses the slug %j (exit 9)",
    async (arg) => {
      expect((await context(autoRepo(), "ship", arg)).code).toBe(9);
    },
  );

  it("CI: the open PR, the CI run at its head, and the FID from the PR-body marker", async () => {
    const cwd = autoRepo();
    fakeGhBin({
      "pr-view": prJson(),
      "run-list": JSON.stringify([{ databaseId: 99, headSha: "sha12" }]),
    });
    const r = await context(cwd, "success", "42");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      phase: "ship",
      mode: "CI",
      prNumber: "42",
      branch: "feat/12-x",
      headSha: "sha12",
      prUrl: "https://github.com/o/r/pull/42",
      runId: "99",
      fid: "12-x",
      issueId: "12",
    });
  });

  it("CI falls back to the feat/{FID} branch when the body has no marker", async () => {
    const cwd = autoRepo();
    fakeGhBin({
      "pr-view": prJson({ body: "" }),
      "run-list": JSON.stringify([{ databaseId: 1, headSha: "sha12" }]),
    });
    expect((await context(cwd, "ship", "42")).json.fid).toBe("12-x");
  });

  it("CI refuses a PR that is not open (7) and a head with no CI run (8)", async () => {
    const cwd = autoRepo();
    fakeGhBin({ "pr-view": prJson({ state: "MERGED" }) });
    expect((await context(cwd, "ship", "42")).code).toBe(7);
    fakeGhBin({
      "pr-view": prJson(),
      "run-list": JSON.stringify([{ databaseId: 1, headSha: "other" }]),
    });
    expect((await context(cwd, "ship", "42")).code).toBe(8);
  });

  it("an unknown phase exits 3; gh needing auth exits 80", async () => {
    const cwd = autoRepo();
    expect((await context(cwd, "deploy", "1")).code).toBe(3);
    fakeGhBin({ "pr-view": "EXIT:4" });
    expect((await context(cwd, "ship", "42")).code).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// bkit runs dispatch --file / --step / --label
// ---------------------------------------------------------------------------

describe(
  "bkit runs dispatch — the verdict row and the close transport",
  { timeout: 20_000 },
  () => {
    function pushedRepo() {
      const root = tmp();
      const remote = path.join(root, "remote.git");
      const cwd = path.join(root, "work");
      gitIn(root, "init", "-q", "--bare", remote);
      gitIn(root, "init", "-q", "-b", "feat/1-x", cwd);
      gitIn(cwd, "config", "user.email", "t@t");
      gitIn(cwd, "config", "user.name", "t");
      gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "chore(1-x): close-workflow");
      gitIn(cwd, "remote", "add", "origin", remote);
      gitIn(cwd, "push", "-q", "-u", "origin", "feat/1-x");
      const file = path.join(cwd, "status.jsonl");
      fs.writeFileSync(file, "");
      return { cwd, file };
    }
    const rowsOf = (file: string) =>
      fs
        .readFileSync(file, "utf-8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Record<string, unknown>);

    it("writes the step's row with its ciDispatch verdict, then the close-transport row", async () => {
      const { cwd, file } = pushedRepo();
      fakeGhBin({ "pr-view": ROLLUP_FOUND, "pr-list": '[{"number":7}]' });
      const r = await cli(cwd, [
        "dispatch",
        "--fid=1-x",
        "--pr=7",
        `--file=${file}`,
        "--workflow=build",
        "--step=build-close-workflow",
        "--label=bkit:auto",
      ]);
      expect(r.code).toBe(0);
      const rows = rowsOf(file);
      expect(rows[0]).toMatchObject({
        type: "step-done",
        workflow: "build",
        step: "build-close-workflow",
        ciDispatch: { outcome: "dispatched" },
      });
      expect(rows[1]).toMatchObject({
        type: "close-transport",
        shape: "push",
        scanResult: "clean",
      });
      expect(r.json.row).toEqual(rows[0]);
    });

    it("--file and --step go together", async () => {
      const { cwd, file } = pushedRepo();
      fakeGhBin({ "pr-view": ROLLUP_FOUND });
      expect((await cli(cwd, ["dispatch", "--fid=1-x", "--pr=7", `--file=${file}`])).code).toBe(2);
    });
  },
);
