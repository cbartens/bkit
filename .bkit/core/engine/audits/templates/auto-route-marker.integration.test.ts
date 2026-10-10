// audits/templates/auto-route-marker.integration.test.ts
//
// The `bkit [auto route]` marker is the single mechanism that admits a
// post-merge `dev` CI run through bkit-cloud.yml's free-tier gate
// (`contains(head_commit.message, 'bkit [auto route]')`). Every workflow that
// can produce a marker-bearing commit derives it in a fenced bash block:
// bkit-ship.md threads it onto the squash `--subject`, bkit-build.md and
// bkit-debug.md onto their close-workflow commits.
//
// The labels come from the workflow's tracker MCP read and reach the fence as
// `{LABEL_FLAGS}` (one `--label=<name>` per label); `bkit issues labels` turns
// them into `autoRouteSuffix`. No `gh` call is involved. This file EXECUTES the
// real derivation line — sliced out of the shipped `.bkit/workflows/*.md` —
// against the built `bkit`, and asserts on the subject the workflow would write.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const BKIT_BIN = path.join(REPO_ROOT, "dist", "cli.js");
const MARKER = " bkit [auto route]";
const DERIVE = 'AUTO_ROUTE_SUFFIX=$("$BKIT" issues labels {LABEL_FLAGS}';

const hasTools =
  spawnSync("bash", ["--version"]).status === 0 && spawnSync("jq", ["--version"]).status === 0;

/**
 * Slice every ```bash fence out of a workflow markdown file, dedented by the
 * fence's own opening indentation (workflow fences are nested under numbered
 * list items, so they carry 3 leading spaces).
 */
function bashFences(md: string): string[] {
  const out: string[] = [];
  const lines = md.split("\n");
  let indent = 0;
  let buf: string[] | undefined;
  for (const line of lines) {
    const open = /^(\s*)```bash\s*$/.exec(line);
    if (open && !buf) {
      indent = open[1].length;
      buf = [];
      continue;
    }
    if (buf && /^\s*```\s*$/.test(line)) {
      out.push(buf.join("\n"));
      buf = undefined;
      continue;
    }
    if (buf) buf.push(line.slice(indent));
  }
  return out;
}

const readWorkflow = (file: string) =>
  fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows", file), "utf8");

/** The derivation line of every fence that derives AUTO_ROUTE_SUFFIX. */
function derivationLines(file: string): string[] {
  const lines = bashFences(readWorkflow(file))
    .filter((f) => f.includes("AUTO_ROUTE_SUFFIX"))
    .map((f) => f.split("\n").find((l) => l.includes(DERIVE)));
  if (lines.length === 0) throw new Error(`no AUTO_ROUTE_SUFFIX fence in ${file}`);
  for (const l of lines) {
    if (l === undefined)
      throw new Error(`${file}: a fence uses AUTO_ROUTE_SUFFIX without deriving it`);
  }
  return lines as string[];
}

let tmp = "";

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-autoroute-"));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

/** Run one derivation line with `{LABEL_FLAGS}` filled from `labels`, then print the subject. */
function runDerivation(line: string, labels: string[]) {
  const bkit = path.join(tmp, "bkit");
  fs.writeFileSync(bkit, `#!/bin/bash\nexec node "${BKIT_BIN}" "$@"\n`, { mode: 0o755 });
  const flags = labels.map((l) => `--label='${l}'`).join(" ");
  const script = [
    `BKIT="${bkit}"`,
    line.replace("{LABEL_FLAGS}", flags),
    'printf "SUBJECT[%s]" "Some PR title (#42)${AUTO_ROUTE_SUFFIX}"',
  ].join("\n");
  return spawnSync("bash", ["-c", script], { encoding: "utf8", cwd: tmp });
}

describe.skipIf(!hasTools)("bkit [auto route] marker is derived from the held labels", () => {
  const WORKFLOWS = ["bkit-ship.md", "bkit-build.md", "bkit-debug.md"];

  it("the built CLI is present", () => {
    expect(fs.existsSync(BKIT_BIN), "dist/cli.js missing — run the build").toBe(true);
  });

  for (const file of WORKFLOWS) {
    describe(file, () => {
      it("threads the marker onto the subject when the issue carries bkit:auto", () => {
        for (const line of derivationLines(file)) {
          const r = runDerivation(line, ["bkit:ship", "bkit:auto"]);
          expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
          expect(r.stdout).toBe(`SUBJECT[Some PR title (#42)${MARKER}]`);
        }
      });

      it("leaves the subject unchanged when bkit:auto is absent", () => {
        for (const line of derivationLines(file)) {
          const r = runDerivation(line, ["bkit:ship"]);
          expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
          expect(r.stdout).toBe("SUBJECT[Some PR title (#42)]");
        }
      });

      // The kill switch in bkit-cloud.yml is an exact label match; so is this derivation.
      it.each([["bkit:auto-paused"], ["no-bkit:auto"]])(
        "does not arm the route on the near-miss label %s",
        (label) => {
          for (const line of derivationLines(file)) {
            const r = runDerivation(line, [label]);
            expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
            expect(r.stdout).toBe("SUBJECT[Some PR title (#42)]");
          }
        },
      );

      // No tracker wired: `{LABEL_FLAGS}` is empty.
      it("leaves the subject unchanged when no labels are passed", () => {
        for (const line of derivationLines(file)) {
          const r = runDerivation(line, []);
          expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
          expect(r.stdout).toBe("SUBJECT[Some PR title (#42)]");
        }
      });

      it("reads no labels through gh", () => {
        expect(readWorkflow(file)).not.toContain("gh issue view");
      });
    });
  }

  it("no workflow carries a cross-tool-call handoff for the marker", () => {
    // $GITHUB_ENV only propagates BETWEEN Action steps; agent Bash tool calls
    // all live inside one.
    for (const file of WORKFLOWS) {
      expect(
        readWorkflow(file),
        `${file} carries a mktemp/GITHUB_ENV marker handoff`,
      ).not.toContain("BKIT_AUTO_ROUTE_FILE");
    }
  });
});
