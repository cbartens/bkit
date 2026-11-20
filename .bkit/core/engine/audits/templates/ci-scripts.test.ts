// audits/templates/ci-scripts.test.ts — coverage for the CI helper scripts bkit ships as
// copy-and-own templates. Unit-tests the dependency-audit gate,
// runs every shipped .test.mjs under .bkit/templates/scripts/ as its own process, and
// runs the workflow steps that call the capstone gate, so a consumer's copy is exercised by
// bkit's own suite before it is adopted.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { parse as parseYamlText } from "yaml";
import { localLimit } from "../../../../../vitest.timeout-budget";

const tmpDirs: string[] = [];
afterEach(() => {
  for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

const AUDIT = path.resolve(".bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs");

interface Finding {
  advisory: string;
  severity: string;
}
const { blockingFindings, checkAcceptances } = (await import(pathToFileURL(AUDIT).href)) as {
  blockingFindings: (report: unknown, blocking?: Record<string, number>) => Finding[];
  checkAcceptances: (
    findings: Finding[],
    registry: unknown,
    today: string,
  ) => Record<"missing" | "invalid" | "expired" | "tooLong" | "stale", unknown[]>;
};

const AUDIT_REPORT = {
  advisories: {
    1: {
      id: 1,
      github_advisory_id: "GHSA-crit",
      severity: "critical",
      module_name: "a",
      findings: [{ version: "1.0.0" }],
    },
    2: {
      id: 2,
      github_advisory_id: "GHSA-mod",
      severity: "moderate",
      module_name: "b",
      findings: [{ version: "1.0.0" }],
    },
  },
};

function runAuditGuard(report: unknown, registry: unknown): number | null {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-guard-"));
  tmpDirs.push(dir);
  fs.writeFileSync(path.join(dir, "report.json"), JSON.stringify(report));
  fs.writeFileSync(path.join(dir, "registry.json"), JSON.stringify(registry));
  return spawnSync(
    process.execPath,
    [
      AUDIT,
      `--report=${path.join(dir, "report.json")}`,
      `--registry=${path.join(dir, "registry.json")}`,
    ],
    { encoding: "utf-8" },
  ).status;
}

describe("bkit-check-dependency-audit", () => {
  it("blocks high and critical by default, not moderate", () => {
    expect(blockingFindings(AUDIT_REPORT).map((f) => f.advisory)).toEqual(["GHSA-crit"]);
  });

  it("reports an unaccepted advisory as missing and an accepted one as clean", () => {
    const findings = blockingFindings(AUDIT_REPORT);
    expect(checkAcceptances(findings, { accepted: [] }, "2026-10-17").missing).toHaveLength(1);
    const row = { advisory: "GHSA-crit", reason: "why", expires: "2026-10-24" };
    const r = checkAcceptances(findings, { accepted: [row] }, "2026-10-17");
    expect(Object.values(r).flat()).toHaveLength(0);
  });

  it("flags an expired, over-long or stale acceptance", () => {
    const findings = blockingFindings(AUDIT_REPORT);
    const row = (advisory: string, expires: string) => ({ advisory, reason: "why", expires });
    expect(
      checkAcceptances(findings, { accepted: [row("GHSA-crit", "2026-10-16")] }, "2026-10-17")
        .expired,
    ).toHaveLength(1);
    expect(
      checkAcceptances(findings, { accepted: [row("GHSA-crit", "2026-10-25")] }, "2026-10-17")
        .tooLong,
    ).toHaveLength(1);
    expect(
      checkAcceptances(
        findings,
        { accepted: [row("GHSA-crit", "2026-10-20"), row("GHSA-gone", "2026-10-20")] },
        "2026-10-17",
      ).stale,
    ).toHaveLength(1);
  });

  it("exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories", () => {
    expect(runAuditGuard(AUDIT_REPORT, { accepted: [] })).toBe(1);
    expect(runAuditGuard({ advisories: {} }, { accepted: [] })).toBe(0);
    expect(
      runAuditGuard({ error: { code: "ERR_PNPM_AUDIT_BAD_RESPONSE" } }, { accepted: [] }),
    ).toBe(1);
  });

  it("rejects an --unreachable value that is neither fail nor warn", () => {
    const res = spawnSync(process.execPath, [AUDIT, "--unreachable=sometimes"], {
      encoding: "utf-8",
    });
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("--unreachable");
  });
});

const SHIPPED_SCRIPTS_DIR = path.resolve(".bkit/templates/scripts");
const SHIPPED_TEST_FILES = (fs.readdirSync(SHIPPED_SCRIPTS_DIR, { recursive: true }) as string[])
  .filter((file) => file.endsWith(".test.mjs"))
  .sort();

describe("shipped copy-and-own test files", () => {
  it("finds the shipped .test.mjs files", () => {
    expect(SHIPPED_TEST_FILES.length).toBeGreaterThan(0);
  });

  it.each(SHIPPED_TEST_FILES)(
    "%s passes when run on its own",
    { timeout: localLimit(30_000) },
    (file) => {
      const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS_DIR, file)], {
        encoding: "utf-8",
      });
      expect(res.status, res.stdout + res.stderr).toBe(0);
    },
  );
});

const CAPSTONE_SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-check-capstone.mjs");
const WORKFLOWS = {
  template: path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml"),
  repo: path.resolve(".github/workflows/bkit-ci.yml"),
};

interface Step {
  name?: string;
  uses?: string;
  if?: string;
  run?: string;
  env?: Record<string, string>;
  "continue-on-error"?: unknown;
}
interface CapstoneJob {
  needs: string[];
  steps: Step[];
}

function capstoneOf(workflow: string): CapstoneJob {
  const doc = parseYamlText(fs.readFileSync(workflow, "utf-8")) as {
    jobs: Record<string, { needs?: string | string[]; steps: Step[] }>;
  };
  const job = doc.jobs["bkit-tests-check"];
  expect(job, `${workflow}: no bkit-tests-check job`).toBeDefined();
  return { needs: ([] as string[]).concat(job!.needs ?? []), steps: job!.steps };
}

const callsScript = (step: Step) =>
  /\bnode scripts\/ci\/bkit-check-capstone\.mjs\b/.test(step.run ?? "");

const envOf = (step: Step): Record<string, string> => step.env ?? {};

/** The `LANES` list a capstone step declares, sorted. */
function declaredLanes(env: Record<string, string>): string[] {
  return (env.LANES ?? "").split(",").sort();
}

/**
 * Per-lane `<LANE>_RESULT` wiring (required) plus the optional `<LANE>_RAN` wiring (checked
 * only when the step sets it), as `key: expected, got` lines.
 */
function laneEnvMismatches(lanes: string[], env: Record<string, string>): string[] {
  const out: string[] = [];
  for (const lane of lanes) {
    const prefix = lane.toUpperCase().replace(/-/g, "_");
    const wanted: Array<[string, string]> = [
      [`${prefix}_RESULT`, `\${{ needs.bkit-tests-${lane}.result }}`],
      [`${prefix}_RAN`, `\${{ needs.bkit-tests-${lane}.outputs.tests_ran }}`],
    ];
    for (const [key, expected] of wanted) {
      const required = key.endsWith("_RESULT");
      const mismatched = env[key] !== expected && (required || env[key] !== undefined);
      if (mismatched) out.push(`${key}: expected ${expected}, got ${env[key]}`);
    }
  }
  return out;
}

/** `PLAN` / `SCOPE_RESULT` wiring, required only when the capstone needs the scope job. */
function scopeEnvMismatches(needs: string[], env: Record<string, string>): string[] {
  if (!needs.includes("bkit-tests-scope")) return [];
  const wanted: Array<[string, string]> = [
    ["PLAN", "\${{ needs.bkit-tests-scope.outputs.plan }}"],
    ["SCOPE_RESULT", "\${{ needs.bkit-tests-scope.result }}"],
  ];
  return wanted
    .filter(([key, expected]) => env[key] !== expected)
    .map(([key, expected]) => `${key}: expected ${expected}, got ${env[key]}`);
}

describe("capstone env wiring checks", () => {
  it("flag a lane whose result is not wired to its job", () => {
    expect(laneEnvMismatches(["unit"], {})).toHaveLength(1);
    expect(
      laneEnvMismatches(["unit"], { UNIT_RESULT: "\${{ needs.bkit-tests-unit.result }}" }),
    ).toEqual([]);
  });

  it("flag a wrongly wired optional lane variable but accept an absent one", () => {
    const result = "\${{ needs.bkit-tests-unit.result }}";
    expect(laneEnvMismatches(["unit"], { UNIT_RESULT: result, UNIT_RAN: "7" })).toHaveLength(1);
    expect(laneEnvMismatches(["unit"], { UNIT_RESULT: result })).toEqual([]);
  });

  it("require PLAN and SCOPE_RESULT only when the capstone needs the scope job", () => {
    expect(scopeEnvMismatches(["bkit-tests-scope"], {})).toHaveLength(2);
    expect(scopeEnvMismatches(["bkit-tests-static"], {})).toEqual([]);
  });
});

describe("bkit-check-capstone", () => {
  it("passes its own copy-and-own test file (bkit's own copy)", () => {
    const res = spawnSync(
      process.execPath,
      [path.resolve("scripts/ci/bkit-check-capstone.test.mjs")],
      {
        encoding: "utf-8",
      },
    );
    expect(res.status, res.stdout + res.stderr).toBe(0);
  });

  it.each(Object.entries(WORKFLOWS))(
    "the %s capstone calls the script, with every lane it needs wired in",
    (_label, workflow) => {
      const { needs, steps } = capstoneOf(workflow);
      const assertStep = steps.find(callsScript);
      expect(
        assertStep,
        `${workflow}: no capstone step runs scripts/ci/bkit-check-capstone.mjs`,
      ).toBeDefined();
      const env = envOf(assertStep!);
      const lanes = needs
        .filter((job) => job !== "bkit-tests-scope")
        .map((j) => j.replace(/^bkit-tests-/, ""));
      expect(declaredLanes(env)).toEqual([...lanes].sort());
      expect(laneEnvMismatches(lanes, env)).toEqual([]);
      expect(scopeEnvMismatches(needs, env)).toEqual([]);
    },
  );

  it.each(Object.entries(WORKFLOWS))(
    "the %s capstone fetches the script with an ungated checkout before it runs",
    (_label, workflow) => {
      const { steps } = capstoneOf(workflow);
      const checkout = steps.findIndex((s) => s.uses?.startsWith("actions/checkout@"));
      expect(checkout, `${workflow}: no checkout in the capstone`).toBeGreaterThanOrEqual(0);
      expect(
        steps[checkout]!.if,
        "a gated checkout leaves some runs with no script",
      ).toBeUndefined();
      expect(steps[checkout]!["continue-on-error"]).toBeUndefined();
      expect(checkout).toBeLessThan(steps.findIndex(callsScript));
    },
  );

  describe("the template's step", () => {
    const step = () => capstoneOf(WORKFLOWS.template).steps.find(callsScript)!;
    const lanesEnv = {
      LANES: "static,unit",
      EMPTY_COUNT: "warn",
      STATIC_RESULT: "success",
      UNIT_RESULT: "success",
      UNIT_RAN: "7",
    };

    function run(withScript: boolean, env: Record<string, string>) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capstone-step-"));
      tmpDirs.push(dir);
      if (withScript) {
        fs.mkdirSync(path.join(dir, "scripts", "ci"), { recursive: true });
        fs.copyFileSync(
          CAPSTONE_SCRIPT,
          path.join(dir, "scripts", "ci", "bkit-check-capstone.mjs"),
        );
      }
      const res = spawnSync("sh", ["-c", step().run!], {
        cwd: dir,
        env: {
          PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH}`,
          ...env,
        },
        encoding: "utf-8",
      });
      return { status: res.status, out: res.stdout + res.stderr };
    }

    it("sets exactly the variables this test supplies", () => {
      expect(Object.keys(envOf(step())).sort()).toEqual(Object.keys(lanesEnv).sort());
    });

    it("reds with a copy-the-script message when scripts/ci/bkit-check-capstone.mjs is missing", () => {
      const r = run(false, lanesEnv);
      expect(r.status).toBe(1);
      expect(r.out).toContain("::error::scripts/ci/bkit-check-capstone.mjs is missing");
      expect(r.out).toContain(".bkit/templates/scripts/ci/");
    });

    it("never skips itself: a missing script reds even when every lane is green", () => {
      expect(run(false, lanesEnv).status).not.toBe(0);
    });

    it("passes with the script present and the lanes green", () => {
      const r = run(true, lanesEnv);
      expect(r.status, r.out).toBe(0);
    });

    it("reds with the script present when the unit lane ran 0 tests", () => {
      const r = run(true, { ...lanesEnv, UNIT_RAN: "0" });
      expect(r.status).toBe(1);
      expect(r.out).toContain("executed 0 tests");
    });
  });
});

describe("template verbose marker step (manual run)", () => {
  const STEP_NAME = "Read Verbose Marker (Manual Run)";
  const JOBS = ["bkit-tests-static", "bkit-tests-unit"];

  /** The `run:` script of the manual-run marker step in one job of the template. */
  function markerScript(job: string): string {
    const doc = parseYamlText(fs.readFileSync(WORKFLOWS.template, "utf-8")) as {
      jobs: Record<string, { steps: Step[] }>;
    };
    const step = doc.jobs[job]?.steps.find((s) => s.name === STEP_NAME);
    expect(step, `${job}: no "${STEP_NAME}" step`).toBeDefined();
    return step!.run!;
  }

  /** Run the step against a fixture repo whose head commit has `message`; return the GITHUB_ENV text. */
  function runStep(
    script: string,
    message: string,
    globalGitConfig?: string,
  ): { status: number | null; env: string } {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verbose-marker-"));
    tmpDirs.push(dir);
    const repo = path.join(dir, "repo");
    fs.mkdirSync(repo);
    const git = (...args: string[]) => {
      const res = spawnSync("git", args, {
        cwd: repo,
        encoding: "utf-8",
        env: {
          ...process.env,
          ...(globalGitConfig ? { GIT_CONFIG_GLOBAL: globalGitConfig, HOME: dir } : {}),
          GIT_AUTHOR_NAME: "t",
          GIT_AUTHOR_EMAIL: "t@example.com",
          GIT_COMMITTER_NAME: "t",
          GIT_COMMITTER_EMAIL: "t@example.com",
        },
      });
      expect(res.status, `git ${args.join(" ")}: ${res.stderr}`).toBe(0);
      return res;
    };
    git("init", "-q");
    git("-c", "commit.gpgsign=false", "commit", "-q", "--allow-empty", "-m", message);
    const sha = git("rev-parse", "HEAD").stdout.trim();
    const envFile = path.join(dir, "github_env");
    fs.writeFileSync(envFile, "");
    const res = spawnSync("bash", ["-e", "-c", script], {
      cwd: repo,
      env: { PATH: process.env.PATH ?? "", GITHUB_SHA: sha, GITHUB_ENV: envFile },
      encoding: "utf-8",
    });
    return { status: res.status, env: fs.readFileSync(envFile, "utf-8") };
  }

  /** The `&& '<value>' ||` on-value of TURBO_LOG_LEVEL in a job's `env:` expression. */
  function jobEnvTurboOnValue(job: string): string | undefined {
    const doc = parseYamlText(fs.readFileSync(WORKFLOWS.template, "utf-8")) as {
      jobs: Record<string, { env?: Record<string, string> }>;
    };
    const expr = String(doc.jobs[job]?.env?.TURBO_LOG_LEVEL ?? "");
    return expr.match(/&&\s*'([^']*)'\s*\|\|/)?.[1];
  }

  it("verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit", () => {
    for (const job of JOBS) {
      const r = runStep(markerScript(job), "fix: something [verbose ci]\n\nbody");
      expect(r.status, job).toBe(0);
      const lines = r.env.split("\n").filter(Boolean);
      expect(lines, job).toContain("VERBOSE_CI=1");
      expect(lines, job).toContain("TURBO_LOG_LEVEL=full");
      expect(lines, job).toContain("DEBUG=vercel:*,supabase:*");
      expect(
        lines.some((l) => l.startsWith("NODE_OPTIONS")),
        job,
      ).toBe(false);
    }
  });

  it("verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker", () => {
    for (const job of JOBS) {
      const r = runStep(markerScript(job), "fix: something verbose ci without brackets");
      expect(r.status, job).toBe(0);
      expect(r.env, job).toBe("");
    }
  });

  it("verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push", () => {
    for (const job of JOBS) {
      const onValue = jobEnvTurboOnValue(job);
      expect(onValue, `${job}: no on-value in job env TURBO_LOG_LEVEL`).toBeDefined();
      const r = runStep(markerScript(job), "fix: something [verbose ci]");
      expect(r.status, job).toBe(0);
      expect(r.env.split("\n"), job).toContain(`TURBO_LOG_LEVEL=${onValue}`);
    }
  });

  it("verbose marker step fixture commits under a global git config that signs commits", () => {
    const cfgDir = fs.mkdtempSync(path.join(os.tmpdir(), "verbose-marker-cfg-"));
    tmpDirs.push(cfgDir);
    const cfg = path.join(cfgDir, "gitconfig");
    fs.writeFileSync(cfg, "[commit]\n\tgpgsign = true\n[gpg]\n\tprogram = false\n");
    for (const job of JOBS) {
      const r = runStep(markerScript(job), "fix: something [verbose ci]", cfg);
      expect(r.status, job).toBe(0);
      expect(r.env.split("\n"), job).toContain("VERBOSE_CI=1");
    }
  });
});
