/**
 * audits/templates/template-ci-yml.test.ts — the template `ci.yml`, filled in the way
 * `.bkit/templates.md` tells a consumer to, is a valid workflow, and the ship gate finds
 * its capstone by the job names it actually declares.
 *
 * YAML is read with whichever of python3 + PyYAML or ruby + psych the machine has (one
 * of them must exist). The actionlint half is skipped where actionlint is not installed.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../../commands/lib";
import { runsCommand } from "../../commands/workflow/runs";
import { readBkitConfig } from "../../shared/settings";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const TEMPLATE = path.join(REPO_ROOT, ".bkit", "templates", ".github", "workflows", "ci.yml");
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
  const file = path.join(tmp(), "ci.yml");
  fs.writeFileSync(file, text);
  return file;
}

const has = (cmd: string, args: string[]) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;

/** Parse a YAML file to plain data with the first parser the machine has. */
function parseYaml(file: string): Record<string, unknown> {
  const parsers: Array<[string, string[]]> = [
    [
      "python3",
      ["-c", "import json,sys,yaml; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))", file],
    ],
    [
      "ruby",
      ["-ryaml", "-rjson", "-e", "puts JSON.generate(YAML.safe_load(File.read(ARGV[0])))", file],
    ],
  ];
  const available = parsers.filter(([cmd]) =>
    cmd === "python3" ? has("python3", ["-c", "import yaml"]) : has("ruby", ["-ryaml", "-e", "0"]),
  );
  expect(available.length, "no YAML parser: install PyYAML for python3, or ruby").toBeGreaterThan(
    0,
  );
  const [cmd, args] = available[0]!;
  const r = spawnSync(cmd, args, { encoding: "utf-8" });
  expect(r.status, r.stderr).toBe(0);
  return JSON.parse(r.stdout) as Record<string, unknown>;
}

interface Job {
  name?: string;
  needs?: string | string[];
}

describe("template ci.yml, filled in", () => {
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
