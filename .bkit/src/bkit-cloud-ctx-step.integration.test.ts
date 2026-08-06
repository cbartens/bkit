// bkit-cloud-ctx-step.integration.test.ts — #363 build-challenge test-gap closure.
//
// #363 widened bkit-cloud.yml's `workflow_run` trigger to post-merge dev/fix/**
// CI, adding FID recovery, a cross-session loop-bound cap, a stale-run guard,
// and marker-based gating in the "Resolve phase + brief context" (ctx) step.
// The plan's own Derived Test Matrix (T1-T17) called for bash-unit-style
// verification of this logic, but no test files were created during
// plan-execute — build-challenge caught the C1 (fix/** ship routing), H1 (FID
// slug validation / full-slug retention), and M1 (jq fail-open) defects via
// manual dry-run harnesses, not committed tests. This file spawns the REAL
// extracted ctx-step bash (dedented straight out of the rendered YAML, not a
// re-typed approximation) against a real git fixture + a stubbed `gh`, so a
// future edit that reintroduces any of those defects fails a test instead of
// requiring another challenge pass.
//
// Extraction is text-based (indentation-driven), not a YAML parse — this repo
// ships no YAML parser dependency and the ctx step is a single `run: |` block
// scalar, so slicing on indentation is exact and avoids adding a new dep.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const TEMPLATE_PATH = path.join(REPO_ROOT, ".bkit/templates/.github/workflows/bkit-cloud.yml");
const COUNTER_CONFIG_PATH = path.join(REPO_ROOT, ".bkit/scripts/bkit-counter-bus-config.sh");

// The ctx step's dev-arm FID extraction relies on `sed -E ... \w+ ...`, a GNU
// sed extension. GH Actions runners (ubuntu-latest) ship GNU sed, but macOS
// dev machines ship BSD sed (silently no-ops on `\w`, unrelated to the code
// under test). Prefer GNU sed transparently — via a PATH-shimmed `sed` that
// shells out to `gsed` — rather than skip the suite outright.
const nativeSedVersion = spawnSync("sed", ["--version"], { encoding: "utf8" });
const nativeSedIsGnu = nativeSedVersion.status === 0 && /GNU sed/.test(nativeSedVersion.stdout);
const gsedWhich = spawnSync("which", ["gsed"], { encoding: "utf8" });
const gsedPath = gsedWhich.status === 0 ? gsedWhich.stdout.trim() : "";
const hasGnuSed = nativeSedIsGnu || Boolean(gsedPath);

const hasTools =
  spawnSync("git", ["--version"]).status === 0 &&
  spawnSync("jq", ["--version"]).status === 0 &&
  spawnSync("bash", ["--version"]).status === 0 &&
  hasGnuSed;

// ---------------------------------------------------------------------------
// Extraction — pull the "Resolve phase + brief context" `run: |` block out of
// the raw template. occurrence 0 = claude job, 1 = opencode job (both bodies
// are byte-identical per the shared-deriv contract asserted elsewhere —
// bkit-modules.integration.test.ts T2.7 — so tests run against occurrence 0).
// ---------------------------------------------------------------------------
function extractCtxStepScript(yaml: string, occurrence: number): string {
  const marker = "- name: Resolve phase + brief context";
  let searchFrom = 0;
  let nameIdx = -1;
  for (let i = 0; i <= occurrence; i++) {
    nameIdx = yaml.indexOf(marker, searchFrom);
    if (nameIdx === -1) {
      throw new Error(`ctx step occurrence ${i} not found`);
    }
    searchFrom = nameIdx + marker.length;
  }
  const afterName = yaml.slice(nameIdx);
  const runToken = "run: |";
  const runIdx = afterName.indexOf(runToken);
  if (runIdx === -1) throw new Error("run: | not found after ctx step name");
  const runLineStart = afterName.lastIndexOf("\n", runIdx) + 1;
  const runIndent = runIdx - runLineStart;
  const afterRun = afterName.slice(runIdx + runToken.length);
  const lines = afterRun.split("\n").slice(1); // drop remainder of the "run: |" line
  const collected: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") {
      collected.push("");
      continue;
    }
    const indent = line.length - line.trimStart().length;
    if (indent <= runIndent) break; // next step / EOF
    collected.push(line);
  }
  const nonBlank = collected.filter((l) => l.trim() !== "");
  const minIndent = Math.min(...nonBlank.map((l) => l.length - l.trimStart().length));
  return collected.map((l) => (l.trim() === "" ? "" : l.slice(minIndent))).join("\n");
}

const rawTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const CTX_SCRIPT = hasTools ? extractCtxStepScript(rawTemplate, 0) : "";

// ---------------------------------------------------------------------------
// gh stub — a single script whose behaviour is driven entirely by env vars,
// so one binary serves every scenario below without per-test file churn.
// ---------------------------------------------------------------------------
const GH_STUB = `#!/usr/bin/env bash
case "$*" in
  "run list "*"--workflow ci.yml"*)
    printf '%s' "\${STUB_LATEST_CI_SHA:-}"
    ;;
  "issue view "*"--json labels"*)
    printf '%s\\n' "\${STUB_ISSUE_LABELS:-}"
    ;;
  "pr list "*"--base dev --state open"*)
    printf '%s' "\${STUB_PR_NUMBER:-}"
    ;;
  "pr view "*"--json body"*)
    printf '%s' "\${STUB_PR_BODY:-}"
    ;;
  "api repos/"*"/pulls"*)
    printf '%s' "\${STUB_API_PR_BODY:-}"
    ;;
  *)
    echo "gh-stub: unhandled invocation: $*" >&2
    exit 1
    ;;
esac
`;

function git(cwd: string, ...args: string[]): void {
  const res = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${res.stderr}`);
  }
}

/** Best-effort git call — some ops (e.g. push into a rejecting hook) are meant to fail. */
function gitAllowFail(cwd: string, ...args: string[]): void {
  spawnSync("git", args, { cwd, encoding: "utf8" });
}

interface Fixture {
  workspaceDir: string;
  originDir: string;
  stubBinDir: string;
}

function setupFixture(tmpRoot: string): Fixture {
  const workspaceDir = fs.mkdtempSync(path.join(tmpRoot, "ws-"));
  const originDir = fs.mkdtempSync(path.join(tmpRoot, "origin-"));

  git(originDir, "init", "-q", "--bare");

  git(workspaceDir, "init", "-q", "-b", "dev");
  git(workspaceDir, "config", "user.email", "t@t.co");
  git(workspaceDir, "config", "user.name", "t");
  git(workspaceDir, "remote", "add", "origin", originDir);

  fs.mkdirSync(path.join(workspaceDir, ".bkit/scripts"), { recursive: true });
  fs.copyFileSync(
    COUNTER_CONFIG_PATH,
    path.join(workspaceDir, ".bkit/scripts/bkit-counter-bus-config.sh"),
  );
  fs.mkdirSync(path.join(workspaceDir, "docs/plans"), { recursive: true });
  fs.writeFileSync(path.join(workspaceDir, "README.md"), "fixture\n");
  git(workspaceDir, "add", "-A");
  git(workspaceDir, "commit", "-qm", "base");
  git(workspaceDir, "push", "-u", "-q", "origin", "dev");

  const stubBinDir = fs.mkdtempSync(path.join(tmpRoot, "bin-"));
  const ghPath = path.join(stubBinDir, "gh");
  fs.writeFileSync(ghPath, GH_STUB, { mode: 0o755 });

  if (!nativeSedIsGnu && gsedPath) {
    fs.writeFileSync(
      path.join(stubBinDir, "sed"),
      `#!/usr/bin/env bash\nexec "${gsedPath}" "$@"\n`,
      { mode: 0o755 },
    );
  }

  return { workspaceDir, originDir, stubBinDir };
}

/** Installs a pre-receive hook on the bare origin that rejects every push. */
function rejectAllPushes(originDir: string): void {
  const hooksDir = path.join(originDir, "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(path.join(hooksDir, "pre-receive"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
}

interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
  outputs: Record<string, string>;
  summary: string;
}

function runCtxStep(fixture: Fixture, env: Record<string, string>): RunResult {
  const outputFile = path.join(fixture.workspaceDir, `.gh-output-${Math.random()}`);
  const summaryFile = path.join(fixture.workspaceDir, `.gh-summary-${Math.random()}`);
  fs.writeFileSync(outputFile, "");
  fs.writeFileSync(summaryFile, "");
  const res = spawnSync("bash", ["-c", CTX_SCRIPT], {
    cwd: fixture.workspaceDir,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${fixture.stubBinDir}:${process.env.PATH}`,
      GITHUB_OUTPUT: outputFile,
      GITHUB_STEP_SUMMARY: summaryFile,
      GITHUB_WORKSPACE: fixture.workspaceDir,
      GITHUB_REPOSITORY: "owner/repo",
      GH_TOKEN: "dummy",
      ...env,
    },
  });
  const summary = fs.existsSync(summaryFile) ? fs.readFileSync(summaryFile, "utf8") : "";
  const raw = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, "utf8") : "";
  const outputs: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    outputs[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return {
    status: res.status,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
    outputs,
    summary,
  };
}

function seedDevDispatchRows(workspaceDir: string, fid: string, headShas: string[]): void {
  const dir = path.join(workspaceDir, "docs/plans/202607/logs", fid);
  fs.mkdirSync(dir, { recursive: true });
  const rows = headShas
    .map((sha) =>
      JSON.stringify({
        type: "dev-dispatch",
        workflow: "auto",
        at: "2026-07-01T00:00:00Z",
        fid,
        headSha: sha,
        parentSha: "parent",
      }),
    )
    .join("\n");
  fs.writeFileSync(path.join(dir, "status.jsonl"), rows + "\n");
}

/**
 * Every `docs/plans/<YYYYMM>/logs/<fid>/` the ctx step could have used.
 *
 * NOT a hardcoded bucket: the step discovers an existing one and falls back to
 * `date -u +%Y%m` when the FID has no logs yet, so an unseeded fixture writes to
 * whatever month the suite runs in. Pinning `202607` made these assertions pass
 * only while that was the current month — they broke at the 2026-08-01 rollover
 * with no code change. Mirror the step's own discovery instead.
 */
function statusDirs(workspaceDir: string, fid: string): string[] {
  const plans = path.join(workspaceDir, "docs/plans");
  if (!fs.existsSync(plans)) return [];
  return fs
    .readdirSync(plans)
    .map((bucket) => path.join(plans, bucket, "logs", fid))
    .filter((dir) => fs.existsSync(dir));
}

function readStatusRows(workspaceDir: string, fid: string): unknown[] {
  return statusDirs(workspaceDir, fid).flatMap((dir) => {
    const file = path.join(dir, "status.jsonl");
    if (!fs.existsSync(file)) return [];
    return fs
      .readFileSync(file, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as unknown);
  });
}

describe.skipIf(!hasTools)("bkit-cloud.yml ctx step — extracted bash (#363)", () => {
  let tmpRoot: string;
  let fixture: Fixture;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-ctx-"));
    fixture = setupFixture(tmpRoot);
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // T3/T4 — dev-branch FID recovery + success/failure routing
  // -------------------------------------------------------------------------
  describe("dev path — FID recovery + success/failure routing (T3, T4)", () => {
    it("dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", () => {
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "dev",
        COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): widen trigger (#500) bkit [auto route]",
        HEAD_SHA: "abc1234",
        STUB_LATEST_CI_SHA: "abc1234", // not stale
        STUB_ISSUE_LABELS: "bkit:auto",
      });
      expect(result.outputs.skip).toBe("false");
      expect(result.outputs.phase).toBe("debug");
      expect(result.outputs.arg).toBe("363-widen-bkit-cloud-trigger");
    });

    it("dev CI success is a no-op — skip=true, no dispatch, no counter write", () => {
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "success",
        BRANCH: "dev",
        COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): widen trigger (#500) bkit [auto route]",
        HEAD_SHA: "abc1234",
      });
      expect(result.outputs.skip).toBe("true");
      expect(result.outputs.phase).toBeUndefined();
      expect(readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger")).toEqual([]);
    });

    it("a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", () => {
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "dev",
        COMMIT_MSG: "Manual push straight to dev, no conventional scope",
        HEAD_SHA: "def5678",
        STUB_API_PR_BODY: "", // linked-PR fallback also yields nothing
      });
      expect(result.status).toBe(0);
      expect(result.outputs.skip).toBe("true");
      expect(result.outputs.phase).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // T16 — dev-path FID recovery is shape-tolerant (GitHub + Linear slugs)
  // -------------------------------------------------------------------------
  it("T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", () => {
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      COMMIT_MSG: "feat(bar-123-auth): add OAuth flow (#9) bkit [auto route]",
      HEAD_SHA: "sha-linear",
      STUB_LATEST_CI_SHA: "sha-linear",
      STUB_ISSUE_LABELS: "bkit:auto",
    });
    expect(result.outputs.skip).toBe("false");
    expect(result.outputs.arg).toBe("bar-123-auth");
  });

  // -------------------------------------------------------------------------
  // T5 — MAX_DEV_DISPATCH_ATTEMPTS cap (distinct headSha count, not row count)
  // -------------------------------------------------------------------------
  describe("dev path — cross-session loop cap (T5)", () => {
    it("3 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped", () => {
      seedDevDispatchRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger", [
        "same-sha",
        "same-sha",
        "same-sha",
      ]);
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "dev",
        COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#501) bkit [auto route]",
        HEAD_SHA: "new-sha",
        STUB_LATEST_CI_SHA: "new-sha",
        STUB_ISSUE_LABELS: "bkit:auto",
      });
      expect(result.outputs.skip).toBe("false");
      expect(result.outputs.phase).toBe("debug");
    });

    it("3 DISTINCT failed headShas exhaust the cap — 4th dispatch no-ops with an operator-review notice", () => {
      seedDevDispatchRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger", [
        "sha-1",
        "sha-2",
        "sha-3",
      ]);
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "dev",
        COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#504) bkit [auto route]",
        HEAD_SHA: "sha-4",
        STUB_LATEST_CI_SHA: "sha-4",
        STUB_ISSUE_LABELS: "bkit:auto",
      });
      expect(result.outputs.skip).toBe("true");
      expect(result.stdout).toContain("exhausted");
      expect(result.stdout).toContain("operator review required");
      // No new row written past the cap.
      const rows = readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger");
      expect(rows).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Regression — build-challenge C1: fix/** CI success used to route into
  // /bkit-ship, which is structurally feat/{FID}-only and would fail the
  // issue on a green fix PR. Fixed with a no-op guard in the else arm.
  // -------------------------------------------------------------------------
  it("C1 regression: fix/** CI SUCCESS no-ops — never routes to ship (ship is not fix/**-aware)", () => {
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "success",
      BRANCH: "fix/363-widen-bkit-cloud-trigger",
      COMMIT_MSG: "fix(363-widen-bkit-cloud-trigger): repair regression bkit [auto route]",
      HEAD_SHA: "fix-sha-1",
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.outputs.phase).not.toBe("ship");
    expect(result.stdout).toContain("ship not wired for fix branches");
  });

  // -------------------------------------------------------------------------
  // T13 / Regression — build-challenge H1: the fix/** branch-fallback FID
  // derivation used to truncate to the leading numeric/alpha id (e.g. '363'),
  // which (a) orphaned a wrong status.jsonl directory and (b) broke the
  // "one shared dispatch budget per FID" invariant with the dev path. Fixed
  // by keeping the FULL slug.
  // -------------------------------------------------------------------------
  describe("fix/** path — FID recovery + shared budget (T13, T15, H1 regression)", () => {
    it("T13/H1: fix/** CI failure recovers the FULL FID slug from the branch (not truncated to '363')", () => {
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "fix/363-widen-bkit-cloud-trigger",
        COMMIT_MSG: "fix(363-widen-bkit-cloud-trigger): repair regression bkit [auto route]",
        HEAD_SHA: "fix-sha-2",
        STUB_PR_NUMBER: "77",
        STUB_PR_BODY: "", // bkit-debug fix-PR bodies carry no bkit:fid= marker
        STUB_ISSUE_LABELS: "bkit:auto",
      });
      // ship/debug dispatch takes the PR number as arg on this surface — the FID
      // is only observable via the dispatch-cap counter row it keys on.
      expect(result.outputs.skip).toBe("false");
      expect(result.outputs.phase).toBe("debug");
      expect(result.outputs.arg).toBe("77");
      const rows = readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger") as Array<{
        fid: string;
        headSha: string;
      }>;
      expect(rows).toHaveLength(1);
      expect(rows[0].fid).toBe("363-widen-bkit-cloud-trigger");
      expect(rows[0].headSha).toBe("fix-sha-2");
      // The truncated-id directory (the pre-H1 bug) must NOT have been created
      // in ANY month bucket.
      expect(statusDirs(fixture.workspaceDir, "363")).toEqual([]);
    });

    // #363 F3 — the fix/** arm derives ISSUE from FID BEFORE the slug
    // allowlist runs, so a branch with no numeric/alpha id yields no grep
    // match. Without `|| true`, pipefail propagates exit 1 under
    // `set -euo pipefail` and the step dies red instead of reaching the
    // fail-safe no-op three lines below — training operators to ignore red
    // bkit-cloud runs. Reachable on any Renovate/hotfix/hand-named branch.
    it.each([["feat/add-oauth"], ["fix/hotfix-login"], ["fix/renovate-bump"]])(
      "F3: a non-FID-shaped branch (%s) no-ops cleanly instead of aborting the step",
      (branch) => {
        const result = runCtxStep(fixture, {
          EVENT: "workflow_run",
          CONCLUSION: "failure",
          BRANCH: branch,
          COMMIT_MSG: "chore: something unconventional",
          HEAD_SHA: "no-fid-sha",
          STUB_PR_NUMBER: "88",
          STUB_PR_BODY: "", // no bkit:issue= / bkit:fid= markers
          STUB_ISSUE_LABELS: "bkit:auto",
        });
        expect(result.status, `step aborted: ${result.stderr}`).toBe(0);
        expect(result.outputs.skip).toBe("true");
        expect(result.stdout).toContain("Cannot derive FID/ISSUE for branch");
      },
    );

    it("T15: fix/** failure loop is capped, sharing ONE budget with the dev path for the same FID", () => {
      // Pre-existing rows written by the DEV surface for this FID.
      seedDevDispatchRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger", [
        "dev-sha-1",
        "dev-sha-2",
        "dev-sha-3",
      ]);
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "fix/363-widen-bkit-cloud-trigger",
        COMMIT_MSG: "fix(363-widen-bkit-cloud-trigger): repair regression bkit [auto route]",
        HEAD_SHA: "fix-sha-3",
        STUB_PR_NUMBER: "78",
        STUB_PR_BODY: "",
        STUB_ISSUE_LABELS: "bkit:auto",
      });
      expect(result.outputs.skip).toBe("true");
      expect(result.stdout).toContain("exhausted");
      const rows = readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger");
      expect(rows).toHaveLength(3); // no 4th row written — cap enforced before write
    });

    it("feat/** failure dispatches debug and is NOT subject to the dispatch cap", () => {
      seedDevDispatchRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger", ["s1", "s2", "s3"]); // would exhaust the cap if consulted
      const result = runCtxStep(fixture, {
        EVENT: "workflow_run",
        CONCLUSION: "failure",
        BRANCH: "feat/363-widen-bkit-cloud-trigger",
        COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): widen trigger bkit [auto route]",
        HEAD_SHA: "feat-sha-1",
        STUB_PR_NUMBER: "79",
        STUB_PR_BODY: "<!-- bkit:issue=#363 --><!-- bkit:fid=363-widen-bkit-cloud-trigger -->",
        STUB_ISSUE_LABELS: "bkit:auto",
      });
      expect(result.outputs.skip).toBe("false");
      expect(result.outputs.phase).toBe("debug");
      expect(result.outputs.arg).toBe("79");
      // feat/** never writes a dev-dispatch row — the pre-seeded 3 rows are untouched.
      const rows = readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger");
      expect(rows).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Regression — build-challenge M1: `dev_count=$(jq -s ... || echo 0)`
  // silently treated an UNPARSEABLE status.jsonl as zero rows, defeating the
  // cap forever. Fixed to fail-closed (refuse to dispatch) on a jq parse error.
  // -------------------------------------------------------------------------
  it("M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open", () => {
    const dir = path.join(
      fixture.workspaceDir,
      "docs/plans/202607/logs/363-widen-bkit-cloud-trigger",
    );
    fs.mkdirSync(dir, { recursive: true });
    // A truncated / corrupt line — not valid NDJSON.
    fs.writeFileSync(path.join(dir, "status.jsonl"), '{"type":"dev-dispatch", BROKEN\n');
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#502) bkit [auto route]",
      HEAD_SHA: "sha-x",
      STUB_LATEST_CI_SHA: "sha-x",
      STUB_ISSUE_LABELS: "bkit:auto",
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.stdout).toContain("unparseable");
    expect(result.stdout).toContain("fail-closed");
  });

  // -------------------------------------------------------------------------
  // T17 — the dev-dispatch counter write must fail CLOSED, not open, when it
  // cannot be durably landed on origin/dev.
  // -------------------------------------------------------------------------
  it("T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted", () => {
    rejectAllPushes(fixture.originDir);
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#503) bkit [auto route]",
      HEAD_SHA: "sha-reject",
      STUB_LATEST_CI_SHA: "sha-reject",
      STUB_ISSUE_LABELS: "bkit:auto",
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.outputs.phase).toBeUndefined();
    expect(result.outputs.arg).toBeUndefined();
    expect(result.stdout).toContain("refusing to dispatch uncounted");
  });

  // -------------------------------------------------------------------------
  // Kill switch — live bkit:auto revocation halts dispatch even under the cap.
  // -------------------------------------------------------------------------
  it("kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining", () => {
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#505) bkit [auto route]",
      HEAD_SHA: "sha-killed",
      STUB_LATEST_CI_SHA: "sha-killed",
      STUB_ISSUE_LABELS: "bkit:auto-paused", // L1: must NOT match via substring
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.stdout).toContain("no longer carries bkit:auto");
    expect(readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger")).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Stale-run guard (Option A) — a completed dev CI run for an older SHA than
  // the most recent one is stale and no-ops (superseded by a later push).
  // -------------------------------------------------------------------------
  it("stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops", () => {
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#506) bkit [auto route]",
      HEAD_SHA: "stale-sha",
      STUB_LATEST_CI_SHA: "newer-sha", // a later push already ran CI
      STUB_ISSUE_LABELS: "bkit:auto",
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.stdout).toContain("Stale dev CI");
    // #363 F6: the dev-dispatch-dropped row goes to the RUN SUMMARY, not a
    // committed status.jsonl. This branch is only reached because dev already
    // advanced, so the old `git push origin dev || true` was usually a
    // non-fast-forward and silently dropped the row in exactly the scenario it
    // records — while the warning told the operator to go read it.
    const dropped = JSON.parse(
      /^\{"type":"dev-dispatch-dropped".*$/m.exec(result.summary)?.[0] ?? "null",
    ) as { type: string; fid: string; headSha: string; latestSha: string } | null;
    expect(dropped, `no drop row in run summary:\n${result.summary}`).not.toBeNull();
    expect(dropped!.fid).toBe("363-widen-bkit-cloud-trigger");
    expect(dropped!.headSha).toBe("stale-sha");
    expect(dropped!.latestSha).toBe("newer-sha");
    // ...and nothing is written to the repo on this path.
    expect(readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger")).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // #363 F7 — the kill switch must precede the stale-run guard, so revoking
  // bkit:auto stops ALL side effects, not just the dispatch.
  // -------------------------------------------------------------------------
  it("kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry", () => {
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      COMMIT_MSG: "feat(363-widen-bkit-cloud-trigger): fix (#507) bkit [auto route]",
      HEAD_SHA: "stale-sha",
      STUB_LATEST_CI_SHA: "newer-sha", // would trip the stale-run guard...
      STUB_ISSUE_LABELS: "bkit:ship", // ...but bkit:auto is gone, so we never get there
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.stdout).toContain("no longer carries bkit:auto");
    expect(result.stdout).not.toContain("Stale dev CI");
    expect(result.summary).not.toContain("dev-dispatch-dropped");
    expect(readStatusRows(fixture.workspaceDir, "363-widen-bkit-cloud-trigger")).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // #363 F8 — head_commit.message is subject+body; grep's `^` anchors per
  // line, so a scoped line in the squash body must not win over the subject.
  // -------------------------------------------------------------------------
  it("FID recovery reads the commit SUBJECT, not a scoped line in the body", () => {
    const result = runCtxStep(fixture, {
      EVENT: "workflow_run",
      CONCLUSION: "failure",
      BRANCH: "dev",
      // Subject carries no conventional scope; the body does (GitHub's default
      // squash body is the list of source commit subjects).
      COMMIT_MSG:
        "Merge pull request #99 from someone/branch bkit [auto route]\n\nfeat(999-unrelated-feature): some commit\n",
      HEAD_SHA: "sha-body-scope",
      STUB_LATEST_CI_SHA: "sha-body-scope",
      STUB_ISSUE_LABELS: "bkit:auto",
    });
    expect(result.outputs.skip).toBe("true");
    expect(result.stdout).toContain("Cannot derive FID");
    expect(result.outputs.arg ?? "").not.toContain("999-unrelated-feature");
  });
});
