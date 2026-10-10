/**
 * bkit-ship-verdict.integration.test.ts
 *
 * Boundary: real bash + real jq + real fs + the built `bkit roadmap feature`
 * (dist/, no mocks for the happy path). Runs the EXACT Step 6 block shipped in
 * `.bkit/workflows/bkit-ship.md` — the SHIPPED row append and the
 * `DOCS_VERDICT` it derives from the command's output.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit", "workflows", "bkit-ship.md");
const BKIT_BIN = path.join(REPO_ROOT, "dist", "bkit-install.js");
const FID = "412-export-csv";

/** The Step 6 fenced block that calls `bkit roadmap feature`, minus its `BKIT=` line. */
function extractStep6Block(): string {
  const content = fs.readFileSync(SHIP_MD, "utf-8");
  const start = content.search(/^## .*Step 6 —/m);
  expect(start, "bkit-ship.md Step 6 heading not found").toBeGreaterThan(-1);
  const step6 = content.slice(start, content.indexOf("### ", start));
  const block = [...step6.matchAll(/^[ \t]*```bash\n([\s\S]*?)^[ \t]*```/gm)]
    .map((m) => m[1]!)
    .find((b) => /"\$BKIT" roadmap feature\b/.test(b));
  expect(block, "Step 6 bkit roadmap feature block not found").toBeDefined();
  return block!
    .split("\n")
    .filter((l) => !/^\s*BKIT=/.test(l))
    .join("\n");
}

let tmpDir: string;
let worktree: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-verdict-test-"));
  worktree = path.join(tmpDir, "wt");
  fs.mkdirSync(path.join(worktree, "docs"), { recursive: true });
  fs.mkdirSync(path.join(worktree, ".bkit"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** Run the shipped block with `$BKIT` = `bkit` (a path to an executable), from an unrelated cwd. */
function runStep6(bkit: string): string {
  const snippet = extractStep6Block()
    .replace(/\{WORKTREE_PATH\}/g, worktree)
    .replace(/\{FID\}/g, FID);
  const otherDir = fs.mkdtempSync(path.join(tmpDir, "cwd-"));
  const script = `cd "${otherDir}" && BKIT="${bkit}"\n${snippet}\necho "VERDICT=$DOCS_VERDICT"`;
  const out = execSync(script, { shell: "/bin/bash", encoding: "utf-8", stdio: "pipe" });
  return /VERDICT=(\w*)/.exec(out)?.[1] ?? "";
}

/** An executable `bkit` stand-in that prints `stdout` and exits `code`. */
function stub(stdout: string, code = 0): string {
  const file = path.join(tmpDir, `bkit-stub-${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(file, `#!/bin/bash\ncat <<'EOF'\n${stdout}\nEOF\nexit ${code}\n`, {
    mode: 0o755,
  });
  return file;
}

function realBkit(): string {
  const file = path.join(tmpDir, "bkit");
  fs.writeFileSync(file, `#!/bin/bash\nexec node "${BKIT_BIN}" "$@"\n`, { mode: 0o755 });
  return file;
}

describe("DOCS_VERDICT — Step 6 SHIPPED row via bkit roadmap feature (#380, matrix row 10)", () => {
  it("PASS, and the SHIPPED row lands in the worktree ledger (not the cwd)", () => {
    expect(fs.existsSync(BKIT_BIN), "dist/bkit-install.js missing — run the build").toBe(true);
    expect(runStep6(realBkit())).toBe("PASS");
    const rows = fs
      .readFileSync(path.join(worktree, ".bkit", "issues.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "feature",
      workflow: "ship",
      key: FID,
      step: "ship-update-docs",
      status: "SHIPPED",
    });
  });

  it("FAIL when the ledger could not be written (fail-open append, appended=false)", () => {
    fs.mkdirSync(path.join(worktree, ".bkit", "issues.jsonl"));
    expect(runStep6(realBkit())).toBe("FAIL");
  });

  it("FAIL when the appended row is not SHIPPED (green-with-omission guard)", () => {
    const out = JSON.stringify({
      row: { kind: "feature", key: FID, status: "BUILT" },
      appended: true,
    });
    expect(runStep6(stub(out))).toBe("FAIL");
  });

  it("FAIL when the command printed no JSON (crashed or usage error)", () => {
    expect(runStep6(stub("", 2))).toBe("FAIL");
    expect(runStep6(stub("not json"))).toBe("FAIL");
  });
});
