/**
 * bkit-rebase-resolve.test.ts
 *
 * Covers the Tier-2 rebase auto-resolver (`.bkit/scripts/bkit-rebase-resolve.sh`),
 * which stops a losslessly-concatenable ledger conflict from taking a whole
 * workflow run to the Failure Path.
 *
 *   (a) the shipped script exists and defines the sourced contract;
 *   (b) every workflow that calls `bkit_rebase_resolve` also sources the
 *       script fail-closed, and no workflow still carries the superseded
 *       `CONFLICT_FILES = "pnpm-lock.yaml"` exact-match idiom;
 *   (c) the ledger list does not drift from the `merge=union` entries in
 *       `.bkit/templates/.gitattributes`;
 *   (d) behaviour, against real git: ledgers resolve, code refuses, a refusal
 *       mutates nothing, and the output is byte-identical to `merge=union`.
 *
 * (d) runs under `sh`, NOT the caller's shell. The zsh-specific traps the
 * script works around (no word-splitting on unquoted expansions; a variable
 * used as a `case` pattern matched literally rather than as a glob) are
 * covered by asserting the script never uses either construct — see (b).
 */

import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const SCRIPT = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts/bkit-rebase-resolve.sh");
const GITATTRIBUTES = path.join(REPO_ROOT, ".bkit/templates/.gitattributes");

// Step 2 of these four rebases the feature worktree against origin/dev.
// bkit-ship.md is deliberately absent: its Step 2 is read-only (Path A) and
// its Step 4 rebase runs inside @bkit-ship-conflict-resolve instead.
const REBASING_WORKFLOWS = [
  ".bkit/workflows/bkit-build.md",
  ".bkit/workflows/bkit-debug.md",
  ".bkit/workflows/bkit-design.md",
  ".bkit/workflows/bkit-plan.md",
];

// `.bkit/friction.jsonl` is Tier-2-only: it ships unlisted in .gitattributes
// (union can resurrect a row `bkit harvest` drained) but IS auto-resolved at
// rebase time, where a blocking conflict costs more than a resurrected row.
const TIER2_ONLY = [".bkit/friction.jsonl"];

const script = fs.readFileSync(SCRIPT, "utf-8");

// Comment lines are stripped for the construct assertions below: the script
// deliberately NAMES the constructs it avoids, and a doc comment must not read
// as a violation of the rule it documents.
const scriptCode = script
  .split("\n")
  .filter((l) => !l.trim().startsWith("#"))
  .join("\n");

const tmpDirs: string[] = [];
afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
});

function readWorkflow(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

/** The newline-separated glob list the script classifies against. */
function ledgerList(): string[] {
  const m = script.match(/BKIT_REBASE_LEDGERS='([^']*)'/);
  if (!m) throw new Error("BKIT_REBASE_LEDGERS not found in bkit-rebase-resolve.sh");
  return m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Paths carrying `merge=union` in the shipped .gitattributes template. */
function unionPaths(): string[] {
  return fs
    .readFileSync(GITATTRIBUTES, "utf-8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("#") && /\bmerge=union\b/.test(l))
    .map((l) => l.trim().split(/\s+/)[0]);
}

/** A throwaway git repo with a base commit. */
function makeRepo(name: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `bkit-rebase-${name}-`));
  tmpDirs.push(dir);
  const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, encoding: "utf-8" });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "test@bkit.local");
  git("config", "user.name", "bkit test");
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs/knowledge.jsonl"), '{"key":"A","ts":1}\n');
  fs.writeFileSync(path.join(dir, "src.txt"), "code v0\n");
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  return dir;
}

/** Diverge main and feat, then rebase feat onto main so it conflicts. */
function diverge(dir: string, feat: Record<string, string>, main: Record<string, string>): void {
  const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, encoding: "utf-8" });
  git("checkout", "-q", "-b", "feat");
  for (const [f, body] of Object.entries(feat)) fs.appendFileSync(path.join(dir, f), body);
  git("commit", "-q", "-am", "feat");
  git("checkout", "-q", "main");
  for (const [f, body] of Object.entries(main)) fs.appendFileSync(path.join(dir, f), body);
  git("commit", "-q", "-am", "main");
  git("checkout", "-q", "feat");
  spawnSync("git", ["rebase", "main"], { cwd: dir, encoding: "utf-8" });
}

/**
 * Source the shipped script under `sh` and call one of its functions.
 * `stdout` carries a classification, `stderr` the resolution log.
 */
function runScript(fnCall: string, cwd?: string): { ok: boolean; stdout: string; stderr: string } {
  const r = spawnSync("sh", ["-c", `. "${SCRIPT}" && ${fnCall}`], { cwd, encoding: "utf-8" });
  return { ok: r.status === 0, stdout: (r.stdout ?? "").trim(), stderr: r.stderr ?? "" };
}

describe("bkit-rebase-resolve.sh: shipped contract", () => {
  it("exists and defines the sourced entry points", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    for (const fn of [
      "bkit_rebase_resolve",
      "bkit_rebase_classify",
      "bkit_rebase_union",
      "bkit_rebase_lockfile",
    ]) {
      expect(script, `${fn} must be defined`).toContain(`${fn}()`);
    }
  });

  it("never uses the two constructs that silently misbehave under zsh", () => {
    // `for x in $VAR` — zsh does not word-split unquoted expansions, so the
    // loop would see the whole list as one item.
    expect(scriptCode).not.toMatch(/for\s+\w+\s+in\s+\$(?!\()/);
    // A variable as a `case` pattern — zsh matches it literally, so a glob
    // entry would never match. The script converts globs to EREs instead.
    expect(scriptCode).not.toMatch(/^\s*\$_?\w+\)\s*$/m);
  });
});

describe("bkit-rebase-resolve.sh: workflow wiring", () => {
  it.each(REBASING_WORKFLOWS)("%s sources the script fail-closed", (wf) => {
    const content = readWorkflow(wf);
    expect(content).toContain("bkit_rebase_resolve");
    const sourceLine = content
      .split("\n")
      .find((l) => l.includes("bkit-rebase-resolve.sh") && l.trim().startsWith("."));
    expect(sourceLine, `${wf} must source bkit-rebase-resolve.sh`).toBeDefined();
    // Fail-closed: a missing script must exit 2, never proceed silently.
    expect(sourceLine, `${wf} source site must be fail-closed`).toMatch(/\|\|\s*\{.*exit 2/);
  });

  it.each(REBASING_WORKFLOWS)("%s dropped the superseded pnpm-lock-only idiom", (wf) => {
    // The old Tier 2 matched one exact string, so a lockfile conflicting
    // ALONGSIDE a ledger fell straight through to the Failure Path.
    expect(readWorkflow(wf)).not.toContain('CONFLICT_FILES" = "pnpm-lock.yaml"');
  });

  it("@bkit-ship-conflict-resolve runs the resolver before hand-classifying", () => {
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/prompts/bkit-ship-conflict-resolve.md"),
      "utf-8",
    );
    expect(prompt).toContain("bkit-rebase-resolve.sh");
    expect(prompt).toContain("bkit_rebase_resolve");
  });
});

describe("bkit-rebase-resolve.sh: classification", () => {
  it("ledger list does not drift from .gitattributes merge=union", () => {
    const ledgers = ledgerList();
    for (const p of unionPaths()) {
      expect(ledgers, `${p} carries merge=union but is not auto-resolvable`).toContain(p);
    }
    // Everything extra must be a deliberate, documented Tier-2-only entry.
    for (const l of ledgers) {
      if (unionPaths().includes(l)) continue;
      expect(TIER2_ONLY, `${l} is in the ledger list but neither union nor Tier-2-only`).toContain(
        l,
      );
    }
  });

  it.each([
    "docs/knowledge.jsonl",
    "docs/decisions.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
    "docs/roadmap.jsonl",
    "docs/roadmap.md",
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    "docs/plans/202608/logs/234-x/status.jsonl",
  ])("classifies %s as an auto-resolvable ledger", (p) => {
    expect(runScript(`bkit_rebase_classify "${p}"`).stdout).toBe("ledger");
  });

  // Every manager bkit recognises, not just pnpm (#437 §B): a cargo or uv
  // consumer hitting a lockfile conflict must reach the same auto-resolution,
  // not the Failure Path. Each name has its own regenerate branch in
  // bkit_rebase_lockfile — a name classified here with no branch there would
  // `git checkout --theirs` and then fail, so the two lists must stay in step.
  it.each([
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "Cargo.lock",
    "go.sum",
    "uv.lock",
  ])("classifies %s as the lockfile shape", (p) => {
    expect(runScript(`bkit_rebase_classify "${p}"`).stdout).toBe("lockfile");
  });

  it("every classified lockfile has a regenerate branch", () => {
    const src = fs.readFileSync(SCRIPT, "utf-8");
    const classified = /case "\$1" in\s*\n\s*([^)]+)\)\s*\n\s*echo lockfile/.exec(src)?.[1] ?? "";
    const names = classified.split("|").map((n) => n.trim());
    expect(names.length).toBeGreaterThan(1);
    const body = src.slice(src.indexOf("bkit_rebase_lockfile() {"));
    for (const name of names) expect(body).toContain(`${name})`);
  });

  it.each([
    "src.txt",
    "package.json",
    ".bkit/config.json",
    "docs/testing.md",
    "docs/plans/202608/234-plan.md",
    // A consumer's own .jsonl is NOT append-only by assumption — unioning it
    // would corrupt their data. Only bkit's own ledgers are auto-resolvable.
    "apps/web/data.jsonl",
    "docs/plans/202608/logs/234-x/other.jsonl",
  ])("refuses %s", (p) => {
    expect(runScript(`bkit_rebase_classify "${p}"`).stdout).toBe("refuse");
  });
});

describe("bkit-rebase-resolve.sh: behaviour against real git", () => {
  it("resolves a ledger conflict and completes the rebase, with no .gitattributes", () => {
    const dir = makeRepo("ledger");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' },
      { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    const { ok } = runScript("bkit_rebase_resolve", dir);
    expect(ok).toBe(true);

    const rows = fs
      .readFileSync(path.join(dir, "docs/knowledge.jsonl"), "utf-8")
      .split("\n")
      .filter(Boolean);
    expect(rows).toHaveLength(3);
    for (const r of rows) expect(() => JSON.parse(r)).not.toThrow();

    // Rebase finished and the tree is clean — the workflow can continue.
    expect(
      execFileSync("git", ["status", "--porcelain"], { cwd: dir, encoding: "utf-8" }).trim(),
    ).toBe("");
  });

  it("refuses a code conflict and leaves the rebase in progress for the caller", () => {
    const dir = makeRepo("code");
    diverge(dir, { "src.txt": "feat\n" }, { "src.txt": "main\n" });
    const { ok, stderr } = runScript("bkit_rebase_resolve", dir);
    expect(ok).toBe(false);
    expect(stderr).toContain("REFUSE src.txt");
    // Left in progress deliberately: the caller's `git rebase --abort` is what
    // unwinds partial state and preserves the conflict for diagnosis.
    expect(
      execFileSync("git", ["status", "--porcelain"], { cwd: dir, encoding: "utf-8" }),
    ).toContain("src.txt");
  });

  it("refuses a mixed set without mutating the resolvable ledger in it", () => {
    const dir = makeRepo("mixed");
    diverge(
      dir,
      { "src.txt": "feat\n", "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' },
      { "src.txt": "main\n", "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    expect(runScript("bkit_rebase_resolve", dir).ok).toBe(false);
    // Classification is a whole-set pass BEFORE any resolution, so the ledger
    // still carries its conflict markers rather than a half-applied merge.
    expect(fs.readFileSync(path.join(dir, "docs/knowledge.jsonl"), "utf-8")).toContain("<<<<<<<");
  });

  it("produces byte-identical output to merge=union", () => {
    // Same divergence twice: once with the attribute (Tier 1 pre-empts the
    // conflict), once without it (Tier 2 resolves the conflict).
    const build = (withAttr: boolean): string => {
      const dir = makeRepo(withAttr ? "attr" : "script");
      if (withAttr) {
        fs.writeFileSync(path.join(dir, ".gitattributes"), "docs/knowledge.jsonl merge=union\n");
        execFileSync("git", ["add", "-A"], { cwd: dir });
        execFileSync("git", ["commit", "-q", "-m", "attr"], { cwd: dir });
      }
      diverge(
        dir,
        { "docs/knowledge.jsonl": '{"key":"B","ts":5}\n{"key":"B2","ts":6}\n' },
        { "docs/knowledge.jsonl": '{"key":"C","ts":7}\n' },
      );
      if (!withAttr) expect(runScript("bkit_rebase_resolve", dir).ok).toBe(true);
      return fs.readFileSync(path.join(dir, "docs/knowledge.jsonl"), "utf-8");
    };
    expect(build(false)).toBe(build(true));
  });

  it("restores a trailing newline so the next append starts on its own line", () => {
    const dir = makeRepo("noeol");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"B","ts":2}' }, // no trailing \n
      { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    expect(runScript("bkit_rebase_resolve", dir).ok).toBe(true);
    const body = fs.readFileSync(path.join(dir, "docs/knowledge.jsonl"), "utf-8");
    expect(body.endsWith("\n")).toBe(true);
    for (const r of body.split("\n").filter(Boolean)) expect(() => JSON.parse(r)).not.toThrow();
  });

  it("skips a commit the resolution emptied instead of stalling the rebase", () => {
    const dir = makeRepo("empty");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"SAME","ts":2}\n' },
      { "docs/knowledge.jsonl": '{"key":"SAME","ts":2}\n{"key":"D","ts":4}\n' },
    );
    const { ok, stderr } = runScript("bkit_rebase_resolve", dir);
    expect(ok).toBe(true);
    expect(stderr).toContain("SKIPPED");
    // The identical row is deduped, not carried twice.
    const body = fs.readFileSync(path.join(dir, "docs/knowledge.jsonl"), "utf-8");
    expect(body.split("\n").filter((l) => l.includes("SAME"))).toHaveLength(1);
  });
});
