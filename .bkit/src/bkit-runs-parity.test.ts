/**
 * bkit-runs-parity.test.ts — `bkit runs` answers exactly as the shell it replaces,
 * while both exist.
 *
 * `bkit-ship-gate.sh`, `bkit-mirror-push-run.sh`, `bkit_ci_declared` and
 * `bkit_close_guard_scan_body` stay in use until the workflows move onto
 * `bkit runs`. Both sides read the same `tests/fixtures/gh` stub and the same
 * temp repos; any disagreement fails. `bkit_wait_ci` and the inline CI-Dispatch
 * kernel are not compared here: they sleep and push, so `runs.test.ts` covers
 * every outcome against a scripted gh instead. Retire this file with the scripts.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { runsCommand, scanBody } from "./commands/workflow/runs";

const REPO_ROOT = path.resolve(__dirname, "../..");
const SCRIPTS = path.join(REPO_ROOT, ".bkit", "templates", ".bkit", "scripts");
const GH_BIN = path.join(REPO_ROOT, "tests", "fixtures", "gh", "bin");
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-runs-parity-")));
const originalPath = process.env.PATH;

beforeAll(() => {
  process.env.PATH = `${GH_BIN}:${originalPath}`;
});
afterAll(() => {
  process.env.PATH = originalPath;
  fs.rmSync(dir, { recursive: true, force: true });
});

/** Run every shell case in ONE bash process; each prints `<id>\t<exit>`. */
function shellCodes(cwd: string, cases: Record<string, string>): Record<string, number> {
  const body = Object.entries(cases)
    .map(([id, cmd]) => `( ${cmd} ) >/dev/null 2>&1; printf '%s\\t%s\\n' "${id}" "$?"`)
    .join("\n");
  const res = spawnSync("bash", ["-c", body], { cwd, encoding: "utf-8", env: process.env });
  const out: Record<string, number> = {};
  for (const line of res.stdout.split("\n").filter(Boolean)) {
    const [id, code] = line.split("\t");
    out[id!] = Number(code);
  }
  return out;
}

async function command(cwd: string, argv: string[]) {
  const out: string[] = [];
  const code = (await runCommand(["runs", ...argv], [runsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  }))!;
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
}

describe("bkit runs gate == bkit-ship-gate.sh", () => {
  // Shell flags; the command takes --ci-workflow where the shell took --workflow.
  const CASES: Record<string, string[]> = {
    green: ["--head", "green-capstone"],
    failed: ["--head", "failed"],
    noRun: ["--head", "conflicting-no-run"],
    inProgress: ["--head", "in-progress"],
    superseded: ["--head", "superseded-green-target", "--branch", "feat/superseded"],
    supersededNoBranch: ["--head", "superseded-green-target"],
    noCapstone: ["--head", "no-capstone"],
    cancelled: ["--head", "cancelled"],
    skipped: ["--head", "skipped-lane"],
    skippedRequired: ["--head", "skipped-lane", "--required-lanes", "test"],
    skippedOther: ["--head", "skipped-lane", "--required-lanes", "some-other-lane"],
    skippedList: ["--head", "skipped-lane", "--required-lanes", "some-other-lane,test"],
    paginated: ["--head", "paginated-skipped-lane", "--required-lanes", "test"],
    redispatch: ["--head", "green-then-redispatch"],
    prOnlyPush: ["--head", "release-pr-only", "--event", "push"],
    prOnly: ["--head", "release-pr-only"],
    pushGreen: ["--head", "release-push-green", "--event", "push"],
    pushRed: ["--head", "release-push-red-pr-green", "--event", "push"],
    pushRedNoEvent: ["--head", "release-push-red-pr-green"],
    unknown: ["--head", "totally-unknown"],
    capstoneFlag: ["--head", "green-capstone", "--capstone", "lint"],
    workflowFlag: ["--head", "green-capstone", "--workflow", "build.yml"],
  };
  const toCommand = (args: string[]) => {
    const out: string[] = [];
    for (let i = 0; i < args.length; i += 2) {
      const flag = args[i] === "--workflow" ? "--ci-workflow" : args[i];
      out.push(`${flag}=${args[i + 1]}`);
    }
    return out;
  };
  const quote = (a: string) => `'${a}'`;

  it("every fixture case exits the same", async () => {
    const gate = path.join(SCRIPTS, "bkit-ship-gate.sh");
    const shell = shellCodes(
      dir,
      Object.fromEntries(
        Object.entries(CASES).map(([id, args]) => [
          id,
          `bash '${gate}' assert --repo example/example ${args.map(quote).join(" ")}`,
        ]),
      ),
    );
    expect(Object.keys(shell)).toHaveLength(Object.keys(CASES).length);
    for (const [id, args] of Object.entries(CASES)) {
      const cmd = await command(dir, ["gate", "--repo=example/example", ...toCommand(args)]);
      expect({ id, code: cmd.code }).toEqual({ id, code: shell[id] });
    }
  }, 60_000);

  it("API errors and rate limits exit the same (20)", async () => {
    const gate = path.join(SCRIPTS, "bkit-ship-gate.sh");
    const shell = shellCodes(dir, {
      apiError: `BKIT_FAKE_GH_API_ERROR=1 bash '${gate}' assert --repo example/example --head green-capstone`,
      rateLimited: `BKIT_FAKE_RATELIMITED=1 BKIT_FAKE_RATELIMIT_STATE=exhausted bash '${gate}' assert --repo example/example --head green-capstone`,
    });
    process.env.BKIT_FAKE_GH_API_ERROR = "1";
    const apiError = await command(dir, [
      "gate",
      "--repo=example/example",
      "--head=green-capstone",
    ]);
    delete process.env.BKIT_FAKE_GH_API_ERROR;
    process.env.BKIT_FAKE_RATELIMITED = "1";
    process.env.BKIT_FAKE_RATELIMIT_STATE = "exhausted";
    const rateLimited = await command(dir, [
      "gate",
      "--repo=example/example",
      "--head=green-capstone",
    ]);
    delete process.env.BKIT_FAKE_RATELIMITED;
    delete process.env.BKIT_FAKE_RATELIMIT_STATE;
    expect({ apiError: apiError.code, rateLimited: rateLimited.code }).toEqual(shell);
  }, 60_000);

  it("validated-head carry-forward exits the same (0 / 17 / 12 / 2)", async () => {
    const repo = path.join(dir, "carry");
    const g = (...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], { cwd: repo });
    fs.mkdirSync(path.join(repo, "src"), { recursive: true });
    fs.mkdirSync(path.join(repo, "docs/plans/202610/logs/452g"), { recursive: true });
    g("init", "-q");
    fs.writeFileSync(path.join(repo, "src/a.ts"), "a\n");
    g("add", "-A");
    g("commit", "-q", "-m", "code");
    g("tag", "green-capstone");
    g("tag", "failed");
    fs.writeFileSync(path.join(repo, "docs/plans/202610/logs/452g/ship-summary.md"), "s\n");
    fs.writeFileSync(path.join(repo, "docs/architecture.md"), "b\n");
    g("add", "-A");
    g("commit", "-q", "-m", "docs [skip ci]");
    g("tag", "book-head");
    fs.appendFileSync(path.join(repo, "src/a.ts"), "b\n");
    g("add", "-A");
    g("commit", "-q", "-m", "code2");
    g("tag", "code-head");

    const CARRY: Record<string, string[]> = {
      book: [
        "--head",
        "book-head",
        "--validated",
        "green-capstone",
        "--month",
        "202610",
        "--fid",
        "452g",
      ],
      code: [
        "--head",
        "code-head",
        "--validated",
        "green-capstone",
        "--month",
        "202610",
        "--fid",
        "452g",
      ],
      red: ["--head", "book-head", "--validated", "failed", "--month", "202610", "--fid", "452g"],
      usage: ["--head", "book-head", "--validated", "green-capstone"],
    };
    const gate = path.join(SCRIPTS, "bkit-ship-gate.sh");
    const shell = shellCodes(
      repo,
      Object.fromEntries(
        Object.entries(CARRY).map(([id, args]) => [
          id,
          `bash '${gate}' assert --repo example/example ${args.map(quote).join(" ")}`,
        ]),
      ),
    );
    for (const [id, args] of Object.entries(CARRY)) {
      const cmd = await command(repo, ["gate", "--repo=example/example", ...toCommand(args)]);
      expect({ id, code: cmd.code }).toEqual({ id, code: shell[id] });
    }
  }, 60_000);
});

describe("bkit runs mirror == bkit-mirror-push-run.sh (end to end)", () => {
  it("green, red and absent push runs exit the same", async () => {
    const mirror = path.join(SCRIPTS, "bkit-mirror-push-run.sh");
    const heads = {
      green: "release-push-green",
      red: "release-push-red-pr-green",
      absent: "release-pr-only",
    };
    const shell = shellCodes(
      dir,
      Object.fromEntries(
        Object.entries(heads).map(([id, head]) => [
          id,
          `bash '${mirror}' --head ${head} --repo example/example --interval 0 --absent-minutes 0`,
        ]),
      ),
    );
    for (const [id, head] of Object.entries(heads)) {
      const cmd = await command(dir, [
        "mirror",
        `--head=${head}`,
        "--repo=example/example",
        "--interval-s=0",
        "--absent-minutes=0",
      ]);
      expect({ id, code: cmd.code }).toEqual({ id, code: shell[id] });
    }
  }, 60_000);
});

describe("scanBody == bkit_close_guard_scan_body", () => {
  it("agrees on a subject-only token, a body token, a clean body and an unreadable sha", () => {
    const repo = path.join(dir, "scan");
    fs.mkdirSync(repo);
    const g = (...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
        cwd: repo,
        encoding: "utf-8",
      }).stdout.trim();
    g("init", "-q");
    const commit = (msg: string) => {
      g("commit", "-q", "--allow-empty", "-m", msg);
      return g("rev-parse", "HEAD");
    };
    const shas: Record<string, string> = {
      subjectToken: commit("docs(1): x bkit [skip ci]"),
      bodyToken: commit("feat: y (#3)\n\n* chore: z [no ci]"),
      clean: commit("feat: w\n\nplain body"),
      unreadable: "0000000000000000000000000000000000000000",
    };
    const runtime = path.join(SCRIPTS, "bkit-runtime.sh");
    const shell = shellCodes(
      repo,
      Object.fromEntries(
        Object.entries(shas).map(([id, sha]) => [
          id,
          `. '${runtime}' && bkit_close_guard_scan_body ${sha}`,
        ]),
      ),
    );
    const SHELL_CODE = { clean: 0, "skip-token-found": 1, error: 2 } as const;
    for (const [id, sha] of Object.entries(shas)) {
      expect({ id, code: SHELL_CODE[scanBody(repo, sha)] }).toEqual({ id, code: shell[id] });
    }
  });
});

describe("bkit runs declared == bkit_ci_declared", () => {
  it("agrees with and without the workflow file, default and configured name", async () => {
    const runtime = path.join(SCRIPTS, "bkit-runtime.sh");
    const cases: Record<string, (d: string) => void> = {
      none: () => undefined,
      defaultFile: (d) => {
        fs.mkdirSync(path.join(d, ".github/workflows"), { recursive: true });
        fs.writeFileSync(path.join(d, ".github/workflows/ci.yml"), "");
      },
      configuredMissing: (d) => {
        fs.writeFileSync(
          path.join(d, "package.json"),
          JSON.stringify({ bkit: { ciWorkflow: "b.yml" } }),
        );
        fs.mkdirSync(path.join(d, ".github/workflows"), { recursive: true });
        fs.writeFileSync(path.join(d, ".github/workflows/ci.yml"), "");
      },
      configuredPresent: (d) => {
        fs.writeFileSync(
          path.join(d, "package.json"),
          JSON.stringify({ bkit: { ciWorkflow: "b.yml" } }),
        );
        fs.mkdirSync(path.join(d, ".github/workflows"), { recursive: true });
        fs.writeFileSync(path.join(d, ".github/workflows/b.yml"), "");
      },
    };
    for (const [id, setup] of Object.entries(cases)) {
      const d = path.join(dir, `declared-${id}`);
      fs.mkdirSync(d);
      setup(d);
      const shell = shellCodes(d, { [id]: `. '${runtime}' && bkit_ci_declared` });
      const cmd = await command(d, ["declared"]);
      expect({ id, code: cmd.code }).toEqual({ id, code: shell[id] });
    }
  }, 60_000);
});
