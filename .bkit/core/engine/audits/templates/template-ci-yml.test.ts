/**
 * audits/templates/template-ci-yml.test.ts — the template `bkit-ci.yml`, filled in the way
 * `.bkit/templates.md` tells a consumer to, is a valid workflow, and the ship gate finds
 * its capstone by the job names it actually declares.
 *
 * YAML is read with the `yaml` devDependency. The actionlint half is skipped where
 * actionlint is not installed.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { parse as parseYamlText } from "yaml";
import { runCommand } from "../../commands/lib";
import { BKIT_GATE_SCRIPTS } from "../../install/manifest";
import { runsCommand } from "../../commands/workflow/runs";
import { readBkitConfig } from "../../shared/settings";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const TEMPLATE = path.join(REPO_ROOT, ".bkit", "templates", ".github", "workflows", "bkit-ci.yml");
const GH_FIXTURES = path.join(REPO_ROOT, "tests", "fixtures", "gh");

const dirs: string[] = [];
const tmp = () => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-template-ci-")));
  dirs.push(d);
  return d;
};
afterAll(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** The template with its placeholders filled as `.bkit/templates.md` documents. */
function filledTemplate(): string {
  const text = fs
    .readFileSync(TEMPLATE, "utf-8")
    .replaceAll("{{DEFAULT_BRANCH}}", "main")
    .replaceAll("{{NODE_VERSION}}", "22");
  expect(text).not.toMatch(/\{\{[A-Z_]+\}\}/);
  const file = path.join(tmp(), "bkit-ci.yml");
  fs.writeFileSync(file, text);
  return file;
}

const has = (cmd: string, args: string[]) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;

/** Parse a YAML file to plain data. */
function parseYaml(file: string): Record<string, unknown> {
  return parseYamlText(fs.readFileSync(file, "utf-8")) as Record<string, unknown>;
}

interface Job {
  name?: string;
  needs?: string | string[];
}

describe("template bkit-ci.yml, filled in", () => {
  it("parses as YAML, with the capstone needing every other job", () => {
    const doc = parseYaml(filledTemplate());
    const jobs = doc.jobs as Record<string, Job>;
    expect(Object.keys(jobs).length).toBeGreaterThan(1);
    const capstoneId = readBkitConfig(tmp()).capstoneJob;
    const capstone = jobs[capstoneId];
    expect(capstone, `no ${capstoneId} job`).toBeDefined();
    const needs = ([] as string[]).concat(capstone!.needs ?? []);
    expect(needs.sort()).toEqual(
      Object.keys(jobs)
        .filter((id) => id !== capstoneId)
        .sort(),
    );
  });

  it.skipIf(!has("actionlint", ["-version"]))("passes actionlint", () => {
    const file = filledTemplate();
    const r = spawnSync("actionlint", ["-no-color", file], { encoding: "utf-8" });
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
  });
});

/** Gate parts the CI static job is allowed to omit, each with the reason. Empty: none are. */
const GATE_PARTS_ABSENT_FROM_CI: Readonly<Record<string, string>> = {};

describe("template bkit-tests-static job matches the bkit:gate:static local gate", () => {
  const gateParts = (BKIT_GATE_SCRIPTS["bkit:gate:static"] ?? "")
    .split("&&")
    .map((part) => /^pnpm ([\w:-]+)(?:\s|$)/.exec(part.trim())?.[1] ?? part.trim());

  /** The `run:` text of every step in the template's static job. */
  function staticJobRuns(): string[] {
    const doc = parseYaml(filledTemplate());
    const job = (doc.jobs as Record<string, { steps?: { run?: string }[] }>)["bkit-tests-static"];
    expect(job, "no bkit-tests-static job").toBeDefined();
    return (job!.steps ?? []).flatMap((step) => (typeof step.run === "string" ? [step.run] : []));
  }

  /** Whether any run line invokes `pnpm <script>` (arguments after the name are allowed). */
  const runsScript = (runs: string[], script: string): boolean =>
    runs.some((run) =>
      run.split("\n").some((line) => {
        const m = /^\s*pnpm ([\w:-]+)(?:\s|$)/.exec(line);
        return m?.[1] === script;
      }),
    );

  it("reads the gate as a chain of pnpm scripts", () => {
    expect(gateParts).toEqual(["typecheck", "lint", "format:check", "lint:prose", "slop:delta"]);
  });

  it("runs every part of the local static gate as a step, bar the named exceptions", () => {
    const runs = staticJobRuns();
    const missing = gateParts.filter(
      (part) => !(part in GATE_PARTS_ABSENT_FROM_CI) && !runsScript(runs, part),
    );
    expect(
      missing,
      `bkit-tests-static has no 'run: pnpm <script>' step for: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("lists only exceptions that are still parts of the gate", () => {
    const stale = Object.keys(GATE_PARTS_ABSENT_FROM_CI).filter(
      (part) => !gateParts.includes(part),
    );
    expect(stale).toEqual([]);
  });
});

describe("ship gate against the template's job names", () => {
  const saved = { PATH: process.env.PATH, root: process.env.BKIT_FAKE_GH_FIXTURE_ROOT };
  afterEach(() => {
    process.env.PATH = saved.PATH;
    if (saved.root === undefined) delete process.env.BKIT_FAKE_GH_FIXTURE_ROOT;
    else process.env.BKIT_FAKE_GH_FIXTURE_ROOT = saved.root;
  });

  /** A gh fixture: one completed run at `head` whose jobs are the template's, each concluding `conclusion(name)`. */
  function fixture(head: string, conclusion: (job: string) => string): void {
    const jobs = parseYaml(filledTemplate()).jobs as Record<string, Job>;
    const root = tmp();
    fs.cpSync(GH_FIXTURES, root, { recursive: true });
    const id = 1950;
    fs.writeFileSync(
      path.join(root, "runs", `${head}.json`),
      JSON.stringify({
        total_count: 1,
        workflow_runs: [
          {
            id,
            head_sha: head,
            status: "completed",
            conclusion: "success",
            event: "pull_request",
            html_url: `https://github.com/example/example/actions/runs/${id}`,
            updated_at: "2026-10-10T10:00:00Z",
          },
        ],
      }),
    );
    // GitHub reports a job by its `name:`, else by its id.
    const names = Object.entries(jobs).map(([jobId, job]) => job.name ?? jobId);
    fs.writeFileSync(
      path.join(root, "jobs", `${id}.json`),
      JSON.stringify({
        total_count: names.length,
        jobs: names.map((name) => ({ name, status: "completed", conclusion: conclusion(name) })),
      }),
    );
    process.env.BKIT_FAKE_GH_FIXTURE_ROOT = root;
    process.env.PATH = `${path.join(GH_FIXTURES, "bin")}${path.delimiter}${saved.PATH}`;
  }

  async function gate(head: string) {
    const out: string[] = [];
    const err: string[] = [];
    const code = await runCommand(
      ["runs", "gate", "--repo=example/example", `--head=${head}`],
      [runsCommand],
      {
        classicVerbs: new Set(),
        cwd: tmp(),
        io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
      },
    );
    return { code, json: JSON.parse(out.join("")) as Record<string, unknown>, err: err.join("") };
  }

  it("finds the capstone among the template's jobs and passes when it is green", async () => {
    fixture("template-ci-green", () => "success");
    const r = await gate("template-ci-green");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ passed: true, capstone: "bkit-tests-check" });
  });

  it("refuses when the template's capstone job fails", async () => {
    fixture("template-ci-red", (name) => (name === "bkit-tests-check" ? "failure" : "success"));
    const r = await gate("template-ci-red");
    expect(r.code).toBe(12);
    expect(r.err).toContain("capstone 'bkit-tests-check' concluded 'failure'");
  });
});

// Every `uses: cbartens/bkit/...@<ref>` line in a workflow.
function scanForeignBkitUses(content: string): string[] {
  const matches: string[] = [];
  const re = /^\s*-?\s*uses:\s*(cbartens\/bkit\/[^\s@]+@\S+)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    matches.push(m[1]!);
  }
  return matches;
}

describe("BAR-164 — canonical CI template has no cross-org private `uses:` references", () => {
  it("scanForeignBkitUses flags `uses: cbartens/bkit/...@<ref>` lines", () => {
    const sample = `
jobs:
  job:
    steps:
      - uses: actions/checkout@v4
      - uses: cbartens/bkit/.github/actions/setup-auth@v1
        with:
          token: \${{ secrets.EXAMPLE_TOKEN }}
      - uses: cbartens/bkit/.github/actions/setup-auth@v1.0.2
`;
    expect(scanForeignBkitUses(sample)).toEqual([
      "cbartens/bkit/.github/actions/setup-auth@v1",
      "cbartens/bkit/.github/actions/setup-auth@v1.0.2",
    ]);
  });

  it("scanForeignBkitUses returns empty for the env-var pattern (no foreign uses)", () => {
    const sample = `
jobs:
  job:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - name: Install Dependencies
        run: pnpm install --frozen-lockfile
        env:
          EXAMPLE_TOKEN: \${{ secrets.EXAMPLE_TOKEN }}
`;
    expect(scanForeignBkitUses(sample)).toEqual([]);
  });

  it("canonical CI template has zero foreign `cbartens/bkit/...` uses", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    expect(scanForeignBkitUses(content)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Task 6.1 — bkit-ci.yml template carries NO GitHub Packages registry auth
// ---------------------------------------------------------------------------

describe("bkit-ci.yml template registry-auth assertion (Task 6.1 — BAR-138)", () => {
  // bkit resolves from npmjs; the consumer CI template must carry no
  // registry-auth ceremony and no git auth-shim (git config --global
  // url.insteadOf).

  it("bkit-ci.yml template exists", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml");
    expect(fs.existsSync(templatePath), `template must exist at ${templatePath}`).toBe(true);
  });

  it("bkit-ci.yml template does NOT contain a git auth-shim (BAR-138)", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    // Auth-shim strings must be absent
    expect(content).not.toContain("git config --global url.");
    expect(content).not.toContain("insteadOf");
    expect(content).not.toContain("Configure private-repo auth");
  });

  it("bkit-ci.yml template no longer carries the GitHub Packages auth ceremony", () => {
    const templatePath = path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    expect(content).not.toContain("BKIT_GH_TOKEN_INSTALL");
    expect(content).not.toContain("pnpm config set");
    expect(content).not.toContain("npm.pkg.github.com");
  });
});
