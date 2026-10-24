import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { declaresJob, protectionPayload, setupCommand } from "./setup";

const dirs: string[] = [];
const ENV_KEYS = [
  "PATH",
  "FAKE_GH_LOG",
  "FAKE_GH_STDIN",
  "FAKE_GH_AUTH_FAIL",
  "FAKE_GH_REPO",
  "FAKE_GH_PROTECTION",
  "FAKE_GH_API_ERROR",
  "FAKE_GH_PUT_FAIL",
];
let savedEnv: Record<string, string | undefined> = {};

const mkdir = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
});

afterEach(() => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const CI_YML = [
  "name: CI",
  "on: [push]",
  "jobs:",
  "  bkit-tests:",
  "    runs-on: ubuntu-latest",
  "  bkit-tests-check:",
  "    needs: [bkit-tests]",
  "",
].join("\n");

const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};

/** A git repo with a CI workflow (`bkit-ci.yml` unless named) and optional `package.json` `bkit` settings. */
function repo(opts: { bkit?: Record<string, unknown>; ci?: string | null; ciName?: string } = {}) {
  const cwd = mkdir("bkit-setup-");
  spawnSync("git", ["init", "-q"], { cwd });
  if (opts.bkit) write(cwd, "package.json", JSON.stringify({ name: "x", bkit: opts.bkit }));
  if (opts.ci !== null)
    write(cwd, `.github/workflows/${opts.ciName ?? "bkit-ci.yml"}`, opts.ci ?? CI_YML);
  return cwd;
}

/**
 * A fake `gh` first on PATH. Logs each call's argv to `$FAKE_GH_LOG` and a PUT's
 * stdin to `$FAKE_GH_STDIN`; knobs: auth failure, the repo name, the current
 * protection (a file; absent = GitHub's 404), a 500 on every api call, a failing PUT.
 */
function fakeGh(knobs: Record<string, string> = {}) {
  const bin = mkdir("bkit-setup-bin-");
  fs.writeFileSync(
    path.join(bin, "gh"),
    [
      "#!/bin/sh",
      'echo "$*" >> "$FAKE_GH_LOG"',
      'case "$1 $2" in',
      '  "auth status") [ -n "$FAKE_GH_AUTH_FAIL" ] && exit 1; exit 0 ;;',
      '  "repo view") printf "%s\\n" "${FAKE_GH_REPO-o/r}"; exit 0 ;;',
      "esac",
      '[ "$1" = "api" ] || exit 1',
      'if [ -n "$FAKE_GH_API_ERROR" ]; then echo "gh: HTTP 500: server error" >&2; exit 1; fi',
      'if [ "$2" = "-X" ]; then',
      '  cat > "$FAKE_GH_STDIN"',
      '  if [ -n "$FAKE_GH_PUT_FAIL" ]; then echo "gh: HTTP 422: Validation Failed" >&2; exit 1; fi',
      '  echo "{}"; exit 0',
      "fi",
      'if [ -n "$FAKE_GH_PROTECTION" ]; then cat "$FAKE_GH_PROTECTION"; exit 0; fi',
      'echo "gh: Branch not protected (HTTP 404)" >&2; exit 1',
      "",
    ].join("\n"),
    { mode: 0o755 },
  );
  process.env.PATH = `${bin}${path.delimiter}${savedEnv.PATH ?? ""}`;
  process.env.FAKE_GH_LOG = path.join(bin, "calls.log");
  process.env.FAKE_GH_STDIN = path.join(bin, "stdin.json");
  for (const [k, v] of Object.entries(knobs)) process.env[k] = v;
  const read = (f: string) => (fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : "");
  return {
    calls: () => read(path.join(bin, "calls.log")),
    stdin: () => read(path.join(bin, "stdin.json")),
  };
}

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["setup", "protect-main", ...argv, "--json"], [setupCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const ENDPOINT = "repos/o/r/branches/main/protection";

describe("bkit setup protect-main — apply", () => {
  it("PUTs the policy requiring the default capstone check", async () => {
    const cwd = repo();
    const gh = fakeGh();
    const r = await run(cwd, []);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      repo: "o/r",
      branch: "main",
      requiredCheck: "bkit-tests-check",
      ciWorkflow: "bkit-ci.yml",
      dryRun: false,
      applied: true,
      payload: protectionPayload("bkit-tests-check"),
    });
    expect(gh.calls()).toContain(`api -X PUT ${ENDPOINT} --input -`);
    expect(JSON.parse(gh.stdin())).toEqual(protectionPayload("bkit-tests-check"));
    expect(r.err).toContain(`Done. Verify with: gh api ${ENDPOINT} | jq .`);
  });

  it("binds admins, requires a PR and linear history, forbids force-push and deletion", () => {
    expect(protectionPayload("cap")).toEqual({
      required_status_checks: { strict: true, contexts: ["cap"] },
      enforce_admins: true,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        required_approving_review_count: 0,
      },
      restrictions: null,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false,
    });
  });

  it("reads bkit.capstoneJob and bkit.ciWorkflow from package.json", async () => {
    const cwd = repo({
      bkit: { capstoneJob: "gate", ciWorkflow: "tests.yml" },
      ciName: "tests.yml",
      ci: "jobs:\n  gate:\n    runs-on: x\n",
    });
    const gh = fakeGh();
    const r = await run(cwd, []);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ requiredCheck: "gate", ciWorkflow: "tests.yml" });
    expect(JSON.parse(gh.stdin()).required_status_checks.contexts).toEqual(["gate"]);
  });

  it("resolves config from the repo root when run from a subdirectory", async () => {
    const cwd = repo({ bkit: { capstoneJob: "bkit-tests" } });
    fs.mkdirSync(path.join(cwd, "sub"));
    fakeGh();
    const r = await run(path.join(cwd, "sub"), ["--dry-run"]);
    expect(r.code).toBe(0);
    expect(r.json.requiredCheck).toBe("bkit-tests");
  });

  it("exits 6 when the PUT fails", async () => {
    const cwd = repo();
    fakeGh({ FAKE_GH_PUT_FAIL: "1" });
    const r = await run(cwd, []);
    expect(r.code).toBe(6);
    expect(r.json).toBeUndefined();
    expect(r.err).toContain("HTTP 422");
  });
});

describe("bkit setup protect-main — dry run", () => {
  it("checks everything and reports the payload without writing", async () => {
    const cwd = repo();
    const gh = fakeGh();
    const r = await run(cwd, ["--dry-run"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      dryRun: true,
      applied: false,
      payload: protectionPayload("bkit-tests-check"),
    });
    expect(r.err).toContain(`gh api -X PUT ${ENDPOINT} --input -`);
    expect(gh.calls()).not.toContain("-X PUT");
  });

  it("refuses --dry-run together with --print", async () => {
    const r = await run(repo(), ["--dry-run", "--print"]);
    expect(r.code).toBe(2);
  });
});

describe("bkit setup protect-main — pre-flight", () => {
  it("exits 4 when the CI workflow file is missing, before any write", async () => {
    const cwd = repo({ ci: null });
    const gh = fakeGh();
    const r = await run(cwd, []);
    expect(r.code).toBe(4);
    expect(r.err).toContain(`${path.join(".github", "workflows", "bkit-ci.yml")} not found`);
    expect(gh.calls()).not.toContain("-X PUT");
  });

  it("exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR", async () => {
    const cwd = repo({ ci: "jobs:\n  bkit-tests:\n    runs-on: x\n" });
    const gh = fakeGh();
    const r = await run(cwd, ["--dry-run"]);
    expect(r.code).toBe(5);
    expect(r.err).toContain("no job named 'bkit-tests-check'");
    expect(r.err).toContain("would wedge every PR");
    expect(gh.calls()).not.toContain("-X PUT");
  });

  it("matches the job name as an indented key, literally", () => {
    expect(declaresJob(CI_YML, "bkit-tests-check")).toBe(true);
    expect(declaresJob("bkit-tests-check:\n", "bkit-tests-check")).toBe(false);
    expect(declaresJob("  bkit-tests-checks:\n", "bkit-tests-check")).toBe(false);
    expect(declaresJob("  axb:\n", "a.b")).toBe(false);
    expect(declaresJob("\tgate:\n", "gate")).toBe(true);
  });

  it("asks a human to log in when gh is not authenticated", async () => {
    const cwd = repo();
    const gh = fakeGh({ FAKE_GH_AUTH_FAIL: "1" });
    const r = await run(cwd, []);
    expect(r.code).toBe(82);
    expect(r.err).toContain("run 'gh auth login'");
    expect(gh.calls()).not.toContain("-X PUT");
  });

  it("is a missing-dependency error when gh is not installed", async () => {
    const cwd = repo();
    // PATH holds git only, so the repo still resolves but gh does not.
    const bin = mkdir("bkit-setup-nogh-");
    const gitPath = spawnSync("/bin/sh", ["-c", "command -v git"], {
      encoding: "utf-8",
    }).stdout.trim();
    fs.symlinkSync(gitPath, path.join(bin, "git"));
    process.env.PATH = bin;
    const r = await run(cwd, []);
    expect(r.code).toBe(2);
    expect(r.err).toContain("gh CLI not installed");
  });

  it("exits 3 when gh repo view names no repository", async () => {
    const cwd = repo();
    fakeGh({ FAKE_GH_REPO: "" });
    const r = await run(cwd, []);
    expect(r.code).toBe(3);
    expect(r.err).toContain("could not resolve the repository");
  });
});

describe("bkit setup protect-main --print", () => {
  it("returns the current rule and skips the pre-flight", async () => {
    const cwd = repo({ ci: null });
    const rule = path.join(mkdir("bkit-setup-rule-"), "rule.json");
    fs.writeFileSync(rule, JSON.stringify({ enforce_admins: { enabled: true } }));
    const gh = fakeGh({ FAKE_GH_PROTECTION: rule });
    const r = await run(cwd, ["--print"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      repo: "o/r",
      branch: "main",
      protected: true,
      protection: { enforce_admins: { enabled: true } },
    });
    expect(gh.calls()).toContain(`api ${ENDPOINT}`);
    expect(gh.calls()).not.toContain("-X PUT");
  });

  it("reports an unprotected main (GitHub's 404) as protected: false", async () => {
    const cwd = repo();
    fakeGh();
    const r = await run(cwd, ["--print"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ protected: false, protection: null });
    expect(r.err).toContain("main has no protection rule");
  });

  it("exits 6 on any other api failure instead of calling main unprotected", async () => {
    const cwd = repo();
    fakeGh({ FAKE_GH_API_ERROR: "1" });
    const r = await run(cwd, ["--print"]);
    expect(r.code).toBe(6);
    expect(r.err).toContain("HTTP 500");
  });

  it("exits 6 when the api answer is not JSON", async () => {
    const cwd = repo();
    const rule = path.join(mkdir("bkit-setup-rule-"), "rule.json");
    fs.writeFileSync(rule, "<html>");
    fakeGh({ FAKE_GH_PROTECTION: rule });
    const r = await run(cwd, ["--print"]);
    expect(r.code).toBe(6);
    expect(r.err).toContain("did not return JSON");
  });
});
