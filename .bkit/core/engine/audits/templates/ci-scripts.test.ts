// audits/templates/ci-scripts.test.ts — coverage for the CI helper scripts bkit ships as
// copy-and-own templates. Unit-tests the accepted-divergence guard and the dependency-audit
// gate, runs every shipped .test.mjs under .bkit/templates/scripts/ as its own process, and
// runs the workflow steps that call the capstone gate, so a consumer's copy is exercised by
// bkit's own suite before it is adopted.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { parse as parseYamlText } from "yaml";

const GUARD = path.resolve(".bkit/templates/scripts/ci/check-accepted-divergences.mjs");

interface Site {
  file: string;
  job: string;
  step: string;
  field: string;
  line: number;
}
interface Registry {
  decisions: string[];
  sites: Array<Omit<Site, "line"> & { decision: string; reason: string }>;
}
const { collectSites, checkRegistry } = (await import(pathToFileURL(GUARD).href)) as {
  collectSites: (dir: string) => Site[];
  checkRegistry: (
    sites: Site[],
    registry: Registry,
  ) => { missing: unknown[]; stale: unknown[]; badDecision: unknown[] };
};

const tmpDirs: string[] = [];
afterEach(() => {
  for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function workflowDir(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "div-guard-"));
  tmpDirs.push(dir);
  fs.writeFileSync(path.join(dir, "bkit-ci.yml"), content);
  return dir;
}

const WORKFLOW = [
  "name: CI",
  "jobs:",
  "  bkit-tests-static:",
  "    steps:",
  "      - name: Check Default Branch Lags Dev",
  "        if: github.event_name == 'push' && github.ref == 'refs/heads/dev'",
  "        run: echo hi",
  "",
].join("\n");

describe("check-accepted-divergences", () => {
  it("collects event-keyed sites with their job and step", () => {
    const dir = workflowDir(WORKFLOW);
    const keys = collectSites(dir).map((s) => `${s.job}#${s.step}#${s.field}`);
    expect(keys).toContain("bkit-tests-static#Check Default Branch Lags Dev#github.event_name");
    expect(keys).toContain("bkit-tests-static#Check Default Branch Lags Dev#github.ref");
    expect(collectSites(dir)).toHaveLength(2);
  });

  it("collects the workflow-level concurrency block and steps whose first key is not name/uses", () => {
    const dir = workflowDir(
      [
        "name: CI",
        "concurrency:",
        "  group: ci-${{ github.event_name }}",
        "  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}",
        "jobs:",
        "  j:",
        "    steps:",
        "      - id: first",
        "        name: Named After Id",
        "        if: github.ref_name == 'dev'",
        "      - run: echo ${{ github.base_ref }}",
        "      - if: github.head_ref",
        "        uses: actions/checkout@v4",
        "        with:",
        "          name: not-a-step-name",
        "",
      ].join("\n"),
    );
    const keys = collectSites(dir).map((s) => `${s.job}#${s.step}#${s.field}`);
    expect(keys).toContain("(workflow)#concurrency#github.event_name");
    expect(keys).toContain("(workflow)#concurrency#github.ref");
    expect(keys).toContain("j#Named After Id#github.ref_name");
    expect(keys).toContain("j#step-2#github.base_ref");
    expect(keys).toContain("j#actions/checkout@v4#github.head_ref");
    expect(keys).toHaveLength(5);
  });

  it("reports an unregistered site as missing", () => {
    const sites = [{ file: "f", job: "j", step: "s", field: "github.ref", line: 1 }];
    const r = checkRegistry(sites, { decisions: ["one-run-per-branch"], sites: [] });
    expect(r.missing).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
  });

  it("reports a registry row that no longer exists as stale", () => {
    const r = checkRegistry([], {
      decisions: ["one-run-per-branch"],
      sites: [
        {
          file: "f",
          job: "gone",
          step: "gone",
          field: "github.ref",
          decision: "one-run-per-branch",
          reason: "x",
        },
      ],
    });
    expect(r.stale).toHaveLength(1);
  });

  it("flags an unknown decision or a missing reason", () => {
    const site = { file: "f", job: "j", step: "s", field: "github.ref", line: 1 };
    const r = checkRegistry([site], {
      decisions: ["one-run-per-branch"],
      sites: [{ ...site, decision: "not-a-decision", reason: "x" }],
    });
    expect(r.badDecision).toHaveLength(1);
  });

  it("is clean when a live site is registered with a known decision and a reason", () => {
    const site = { file: "f", job: "j", step: "s", field: "github.ref", line: 1 };
    const r = checkRegistry([site], {
      decisions: ["one-run-per-branch"],
      sites: [
        {
          file: "f",
          job: "j",
          step: "s",
          field: "github.ref",
          decision: "one-run-per-branch",
          reason: "why",
        },
      ],
    });
    expect(r).toEqual({ missing: [], stale: [], badDecision: [] });
  });
});

const AUDIT = path.resolve(".bkit/templates/scripts/ci/check-dependency-audit.mjs");

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

describe("check-dependency-audit", () => {
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
});

const SHIPPED_SCRIPTS_DIR = path.resolve(".bkit/templates/scripts");
const SHIPPED_TEST_FILES = (fs.readdirSync(SHIPPED_SCRIPTS_DIR, { recursive: true }) as string[])
  .filter((file) => file.endsWith(".test.mjs"))
  .sort();

describe("shipped copy-and-own test files", () => {
  it("finds the shipped .test.mjs files", () => {
    expect(SHIPPED_TEST_FILES.length).toBeGreaterThan(0);
  });

  it.each(SHIPPED_TEST_FILES)("%s passes when run on its own", (file) => {
    const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS_DIR, file)], {
      encoding: "utf-8",
    });
    expect(res.status, res.stdout + res.stderr).toBe(0);
  });
});

const CAPSTONE_SCRIPT = path.resolve(".bkit/templates/scripts/ci/check-capstone.mjs");
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
  /\bnode scripts\/ci\/check-capstone\.mjs\b/.test(step.run ?? "");

describe("check-capstone", () => {
  it("passes its own copy-and-own test file (bkit's own copy)", () => {
    const res = spawnSync(process.execPath, [path.resolve("scripts/ci/check-capstone.test.mjs")], {
      encoding: "utf-8",
    });
    expect(res.status, res.stdout + res.stderr).toBe(0);
  });

  it.each(Object.entries(WORKFLOWS))(
    "the %s capstone calls the script, with every lane it needs wired in",
    (_label, workflow) => {
      const { needs, steps } = capstoneOf(workflow);
      const assertStep = steps.find(callsScript);
      expect(
        assertStep,
        `${workflow}: no capstone step runs scripts/ci/check-capstone.mjs`,
      ).toBeDefined();
      const env = assertStep!.env ?? {};
      const lanes = needs
        .filter((job) => job !== "bkit-tests-scope")
        .map((j) => j.replace(/^bkit-tests-/, ""));
      expect((env.LANES ?? "").split(",").sort()).toEqual([...lanes].sort());
      for (const lane of lanes) {
        const prefix = lane.toUpperCase().replace(/-/g, "_");
        expect(env[`${prefix}_RESULT`], `${prefix}_RESULT`).toBe(
          `\${{ needs.bkit-tests-${lane}.result }}`,
        );
        for (const [suffix, output] of [
          ["RAN", "tests_ran"],
          ["CACHE_SKIP", "cache_skip"],
        ] as const) {
          const value = env[`${prefix}_${suffix}`];
          if (value !== undefined) {
            expect(value, `${prefix}_${suffix}`).toBe(
              `\${{ needs.bkit-tests-${lane}.outputs.${output} }}`,
            );
          }
        }
      }
      if (needs.includes("bkit-tests-scope")) {
        expect(env.PLAN).toBe("\${{ needs.bkit-tests-scope.outputs.plan }}");
        expect(env.SCOPE_RESULT).toBe("\${{ needs.bkit-tests-scope.result }}");
      }
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
      UNIT_CACHE_SKIP: "",
    };

    function run(withScript: boolean, env: Record<string, string>) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capstone-step-"));
      tmpDirs.push(dir);
      if (withScript) {
        fs.mkdirSync(path.join(dir, "scripts", "ci"), { recursive: true });
        fs.copyFileSync(CAPSTONE_SCRIPT, path.join(dir, "scripts", "ci", "check-capstone.mjs"));
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
      expect(Object.keys(step().env ?? {}).sort()).toEqual(Object.keys(lanesEnv).sort());
    });

    it("reds with a copy-the-script message when scripts/ci/check-capstone.mjs is missing", () => {
      const r = run(false, lanesEnv);
      expect(r.status).toBe(1);
      expect(r.out).toContain("::error::scripts/ci/check-capstone.mjs is missing");
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
