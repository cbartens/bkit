// bkit-auto-route-marker.integration.test.ts
//
// The `bkit [auto route]` marker is the single mechanism that admits a
// post-merge `dev` CI run through bkit-cloud.yml's free-tier gate
// (`contains(head_commit.message, 'bkit [auto route]')`). Every workflow that
// can produce a marker-bearing commit derives it in a fenced bash block:
// bkit-ship.md threads it onto the squash `--subject`, bkit-build.md and
// bkit-debug.md onto their close-workflow commits.
//
// `{LABELS}` is an MCP-derived TEMPLATE value, never a shell variable, and
// `$GITHUB_ENV` applies only BETWEEN workflow steps. This file EXECUTES the real fenced
// blocks — sliced out of the shipped `.bkit/workflows/*.md` — against a stubbed `gh`,
// and asserts on the command the workflow runs.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const MARKER = " bkit [auto route]";

const hasTools =
  spawnSync("bash", ["--version"]).status === 0 && spawnSync("grep", ["--version"]).status === 0;

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

/** The fence that both derives AUTO_ROUTE_SUFFIX and consumes it. */
function deriveFences(file: string): string[] {
  const md = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows", file), "utf8");
  const fences = bashFences(md).filter((f) => f.includes('AUTO_ROUTE_SUFFIX=""'));
  if (fences.length === 0) throw new Error(`no AUTO_ROUTE_SUFFIX derivation fence in ${file}`);
  return fences;
}

/**
 * Reduce a fence to just its derivation: from `AUTO_ROUTE_SUFFIX=""` through
 * the line that sets it from the tracker. Everything around it in these fences
 * does real git/jq/status-ledger work (and reads vars like PUSH_MODE that only
 * exist mid-workflow) which is not under test here — the derivation must stand
 * on its own, since that is exactly the property F1 violated.
 */
function derivationPrologue(fence: string): string {
  const lines = fence.split("\n");
  const first = lines.findIndex((l) => l.includes('AUTO_ROUTE_SUFFIX=""'));
  const last = lines.findIndex((l) => l.includes("grep -qxF 'bkit:auto'"));
  if (first === -1 || last < first) {
    throw new Error("no self-contained bkit:auto derivation found in fence");
  }
  return lines.slice(first, last + 1).join("\n");
}

let tmp = "";

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-autoroute-"));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

/**
 * Run a derivation prologue with `gh issue view` stubbed to emit `labels`
 * (one per line, as `--jq '.labels[].name'` does), or to fail outright when
 * `labels` is null — the no-GitHub-issue case (Linear tracker, tracker=false).
 */
function runDerivation(prologue: string, labels: string[] | null) {
  const bin = path.join(tmp, "bin");
  fs.mkdirSync(bin, { recursive: true });
  const gh =
    labels === null
      ? '#!/usr/bin/env bash\necho "no such issue" >&2\nexit 1\n'
      : `#!/usr/bin/env bash\nprintf '%s\\n' ${labels.map((l) => `'${l}'`).join(" ")}\n`;
  fs.writeFileSync(path.join(bin, "gh"), gh, { mode: 0o755 });

  // {ISSUE_ID} is agent-substituted at run time; 363 stands in here.
  const script = [
    "set -euo pipefail",
    prologue.replace(/\{ISSUE_ID\}/g, "363"),
    // Emit exactly what the workflow would splice into its commit subject.
    'printf "SUBJECT[%s]" "Some PR title (#42)${AUTO_ROUTE_SUFFIX}"',
  ].join("\n");

  return spawnSync("bash", ["-c", script], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH ?? ""}` },
  });
}

describe.skipIf(!hasTools)("#363 F1 — bkit [auto route] marker is actually emitted", () => {
  const WORKFLOWS = ["bkit-ship.md", "bkit-build.md", "bkit-debug.md"];

  for (const file of WORKFLOWS) {
    describe(file, () => {
      it("threads the marker onto the subject when the issue carries bkit:auto", () => {
        for (const fence of deriveFences(file)) {
          const r = runDerivation(derivationPrologue(fence), ["bkit:ship", "bkit:auto"]);
          expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
          expect(r.stdout).toContain(`SUBJECT[Some PR title (#42)${MARKER}]`);
        }
      });

      it("leaves the subject unchanged when bkit:auto is absent", () => {
        for (const fence of deriveFences(file)) {
          const r = runDerivation(derivationPrologue(fence), ["bkit:ship"]);
          expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
          expect(r.stdout).toBe("SUBJECT[Some PR title (#42)]");
        }
      });

      // The kill switch is exact-match (`grep -qxF`) in bkit-cloud.yml; so is this
      // derivation.
      it.each([["bkit:auto-paused"], ["no-bkit:auto"]])(
        "does not arm the route on the near-miss label %s",
        (label) => {
          for (const fence of deriveFences(file)) {
            const r = runDerivation(derivationPrologue(fence), [label]);
            expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
            expect(r.stdout).toBe("SUBJECT[Some PR title (#42)]");
          }
        },
      );

      // Non-GitHub trackers and `bkit:tracker false` have no issue to read; the lookup is
      // guarded under `set -euo pipefail`.
      it("fails closed, not fatally, when the issue cannot be read", () => {
        for (const fence of deriveFences(file)) {
          const r = runDerivation(derivationPrologue(fence), null);
          expect(r.status, `derivation aborted the fence: ${r.stderr}`).toBe(0);
          expect(r.stdout).toBe("SUBJECT[Some PR title (#42)]");
        }
      });
    });
  }

  it("no workflow carries a cross-tool-call handoff for the marker", () => {
    // $GITHUB_ENV only propagates BETWEEN Action steps; agent Bash tool calls
    // all live inside one. Any reappearance of this idiom is the F1 defect.
    for (const file of WORKFLOWS) {
      const md = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows", file), "utf8");
      expect(md, `${file} re-introduced a mktemp/GITHUB_ENV marker handoff`).not.toContain(
        "BKIT_AUTO_ROUTE_FILE",
      );
    }
  });
});
