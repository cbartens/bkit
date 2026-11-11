import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";

const FID = "864-doc-warnings";
const MONTH = "202611";
const LOG = `docs/plans/${MONTH}/logs/${FID}`;
const STATUS = `${LOG}/status.jsonl`;
const SUMMARY = `${LOG}/plan-summary.md`;
const dirs: string[] = [];
let tick = 0;
const at = () => new Date(Date.UTC(2026, 10, 1, 0, 0, tick++)).toISOString();
const jsonl = (rows: object[]) => rows.map((row) => `${JSON.stringify(row)}\n`).join("");

const write = (cwd: string, file: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
  fs.writeFileSync(path.join(cwd, file), body);
};
const read = (cwd: string, file: string) => fs.readFileSync(path.join(cwd, file), "utf8");

const warning = (r: Record<string, string>) => JSON.stringify(r);
const report = (...records: string[]) =>
  ["Verdict: PASS", "", "## Documentation Warnings", "", "```jsonl", ...records, "```", ""].join(
    "\n",
  );

const SECURITY = {
  topic: "security",
  gap: "starter-only",
  recommendedPath: "docs/security.md",
  action: "Populate the security document with credential boundaries.",
};
const TESTING = {
  topic: "testing",
  gap: "missing",
  recommendedPath: "docs/testing.md",
  alternativeEvidence: "None available",
  action: "Copy the testing starter and fill in the CI lanes.",
};

const stepDone = (step: string, artifacts: string[]) => ({
  type: "step-done",
  workflow: "plan",
  step,
  status: "DONE",
  verdict: "PASS",
  at: at(),
  artifacts,
});
const started = () => ({ type: "workflow-started", workflow: "plan", at: at(), limits: {} });

function repo() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-docwarn-")));
  dirs.push(cwd);
  write(
    cwd,
    "package.json",
    JSON.stringify({
      name: "docwarn-fixture",
      private: true,
      bkit: { tracker: { default: "none" } },
    }),
  );
  return cwd;
}

async function summarize(cwd: string) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(
    ["workflows", "summary", "--workflow=plan", `--file=${STATUS}`, "--json"],
    COMMANDS,
    {
      cwd,
      classicVerbs: new Set(),
      io: { stdout: (text) => out.push(text), stderr: (text) => err.push(text) },
    },
  );
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const count = (text: string, needle: string) => text.split(needle).length - 1;

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("workflows summary documentation warnings", () => {
  it("reports only attributed documentation warnings for the active run", async () => {
    const cwd = repo();
    // Run 1: an earlier run left a gap that this run does not repeat.
    write(
      cwd,
      `${LOG}/plan-generate-1.md`,
      report(
        warning({
          ...SECURITY,
          topic: "observability",
          gap: "OLD-RUN-GAP",
          alternativeEvidence: "o",
        }),
      ),
    );
    // Run 2 (active): two agents report the same gap, one reports a distinct gap.
    write(
      cwd,
      `${LOG}/plan-review-2.md`,
      report(warning({ ...SECURITY, alternativeEvidence: "EVIDENCE-FROM-REVIEW" })),
    );
    write(
      cwd,
      `${LOG}/plan-verify-2.md`,
      report(
        warning({ ...SECURITY, alternativeEvidence: "EVIDENCE-FROM-VERIFY" }),
        warning(TESTING),
      ),
    );
    // Raw input: warning-shaped, but not an attributed artifact of the run.
    write(
      cwd,
      `${LOG}/plan-input-2.md`,
      report(
        warning({
          ...SECURITY,
          topic: "deployments",
          gap: "RAW-INPUT-GAP",
          alternativeEvidence: "r",
        }),
      ),
    );
    write(
      cwd,
      STATUS,
      jsonl([
        started(),
        stepDone("plan-generate", [`${LOG}/plan-generate-1.md`]),
        { type: "workflow-done", workflow: "plan", at: at() },
        started(),
        stepDone("plan-review", [`${LOG}/plan-review-2.md`, `${LOG}/never-written-optional.md`]),
        stepDone("plan-verify", [`${LOG}/plan-verify-2.md`]),
      ]),
    );

    const first = await summarize(cwd);
    expect(first.err).toBe("");
    expect(first.code).toBe(0);
    const markdown = read(cwd, SUMMARY);

    // The verdict is the one the steps decide: warnings change nothing.
    expect(markdown.split("\n").slice(0, 3)).toEqual([
      "Verdict: PASS",
      "Failures: 0",
      "<!-- verdict:end -->",
    ]);
    expect(first.json.verdict).toBe("PASS");
    expect(first.json.failures).toBe(0);

    expect(markdown).toContain("## Documentation Warnings");
    expect(count(markdown, "Populate the security document")).toBe(1);
    expect(markdown).toContain("EVIDENCE-FROM-REVIEW");
    expect(markdown).toContain("EVIDENCE-FROM-VERIFY");
    expect(count(markdown, "Copy the testing starter and fill in the CI lanes.")).toBe(1);
    expect(markdown).not.toContain("OLD-RUN-GAP");
    expect(markdown).not.toContain("RAW-INPUT-GAP");

    // A later run that still has the unresolved gap reports it again, and only it.
    write(
      cwd,
      `${LOG}/plan-verify-3.md`,
      report(warning({ ...SECURITY, alternativeEvidence: "LATER-RUN-EVIDENCE" })),
    );
    fs.appendFileSync(
      path.join(cwd, STATUS),
      jsonl([
        { type: "workflow-done", workflow: "plan", at: at() },
        started(),
        stepDone("plan-verify", [`${LOG}/plan-verify-3.md`]),
      ]),
    );
    const later = await summarize(cwd);
    expect(later.code).toBe(0);
    const laterMarkdown = read(cwd, SUMMARY);
    expect(laterMarkdown).toContain("## Documentation Warnings");
    expect(count(laterMarkdown, "Populate the security document")).toBe(1);
    expect(laterMarkdown).toContain("LATER-RUN-EVIDENCE");
    expect(laterMarkdown).not.toContain("EVIDENCE-FROM-REVIEW");
    expect(laterMarkdown).not.toContain("Copy the testing starter");
    expect(laterMarkdown.split("\n")[0]).toBe("Verdict: PASS");
  });
});
