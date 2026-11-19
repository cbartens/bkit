// audits/repo/check-dist.integration.test.ts — `scripts/gate/bkit-check-dist.mjs` checks the
// staged `dist/` against a compile of the staged tree, never the working tree.
//
// Each probe builds a scratch git repo with two engine sources and a committed `dist/`, then runs
// the real script with that repo as its working directory.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { localLimit } from "../../../../../vitest.timeout-budget";

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "scripts/gate/bkit-check-dist.mjs");
const TSC = path.join(ROOT, "node_modules/.bin/tsc");
const STALE_MESSAGE = "[bkit] dist/ is stale — run pnpm build and commit the result";
const REF_MESSAGE = "[bkit] --ref value is not a commit";
const EMPTY_MESSAGE =
  "[bkit] the staged tree compiles to no file under dist/ — check tsconfig.json outDir and noEmit";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function git(cwd: string, ...args: string[]) {
  const result = spawnSync("git", args, { cwd, encoding: "utf-8" });
  expect(result.status, `git ${args.join(" ")}: ${result.stderr}`).toBe(0);
  return result.stdout;
}

function build(cwd: string) {
  fs.rmSync(path.join(cwd, "dist"), { recursive: true, force: true });
  const result = spawnSync(TSC, [], { cwd, encoding: "utf-8" });
  expect(result.status, `tsc: ${result.stdout}`).toBe(0);
}

function write(cwd: string, file: string, text: string) {
  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
  fs.writeFileSync(path.join(cwd, file), text);
}

const A = ".bkit/core/engine/a.ts";
const B = ".bkit/core/engine/b.ts";

/** A scratch repo with a.ts and b.ts committed together with the dist built from them. */
function scratchRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-check-dist-"));
  temps.push(dir);
  git(dir, "init", "-q");
  git(dir, "config", "user.email", "test@example.com");
  git(dir, "config", "user.name", "Test");
  fs.copyFileSync(path.join(ROOT, "tsconfig.json"), path.join(dir, "tsconfig.json"));
  fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(dir, "node_modules"));
  write(dir, ".gitignore", "node_modules\ntmp\n");
  write(dir, A, "export const a: number = 1;\n");
  write(dir, B, "export const b: number = 1;\n");
  build(dir);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "init");
  return dir;
}

function check(cwd: string, ...args: string[]) {
  return spawnSync("node", [SCRIPT, ...args], { cwd, encoding: "utf-8" });
}

function readDist(cwd: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (rel: string) => {
    for (const entry of fs.readdirSync(path.join(cwd, rel), { withFileTypes: true })) {
      const next = path.join(rel, entry.name);
      if (entry.isDirectory()) walk(next);
      else out[next] = fs.readFileSync(path.join(cwd, next), "utf-8");
    }
  };
  walk("dist");
  return out;
}

function scratchLeftovers(cwd: string): string[] {
  const tmp = path.join(cwd, "tmp");
  const names = fs.existsSync(tmp) ? fs.readdirSync(tmp) : [];
  return names.filter((n) => n.startsWith("check-dist-"));
}

/** Stage an a.ts edit with its matching rebuilt dist, then leave a b.ts edit unstaged. */
function stageAWithUnstagedB(dir: string) {
  write(dir, A, "export const a: number = 2;\n");
  build(dir);
  git(dir, "add", A, "dist");
  write(dir, B, "export const b: number = 2;\n");
}

describe("bkit-check-dist", () => {
  it(
    "passes for the staged tree with an unstaged engine edit beside it",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      stageAWithUnstagedB(dir);
      const result = check(dir);
      expect(result.stderr + result.stdout).not.toContain("dist/ is stale");
      expect(result.status).toBe(0);
    },
  );

  it("refuses a stale staged dist", { timeout: localLimit(120_000) }, () => {
    const dir = scratchRepo();
    write(dir, A, "export const a: number = 3;\n");
    git(dir, "add", A);
    const result = check(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
  });

  it("leaves the working tree's dist untouched", { timeout: localLimit(120_000) }, () => {
    const dir = scratchRepo();
    stageAWithUnstagedB(dir);
    // A working-tree dist that differs from both the staged dist and any fresh build.
    write(dir, "dist/b.js", "// hand-edited working tree output\n");
    write(dir, "dist/extra.js", "// untracked working tree output\n");
    const before = readDist(dir);
    const result = check(dir);
    expect(result.status, result.stderr).toBe(0);
    expect(readDist(dir)).toEqual(before);
    expect(scratchLeftovers(dir)).toEqual([]);
  });
  it(
    "refuses a staged dist file shadowed by a tab-named twin",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      const built = fs.readFileSync(path.join(dir, "dist/a.js"), "utf-8");
      write(dir, "dist/a.js", "console.log('PWNED');\n");
      write(dir, "dist/a.js\tx", built);
      git(dir, "add", "dist");
      const result = check(dir);
      expect(result.status).toBe(1);
      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    },
  );

  it(
    "refuses a staged dist that matches the build only through a gitattributes filter",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      write(dir, ".gitattributes", "tmp/**/dist/a.js working-tree-encoding=UTF-7\n");
      write(dir, A, "// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-\nexport const a: number = 1;\n");
      build(dir);
      const distA = path.join(dir, "dist/a.js");
      const encoded = "// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-";
      const decoded = '// \nconsole.log("PWNED");';
      const text = fs.readFileSync(distA, "utf-8");
      expect(text).toContain(encoded);
      fs.writeFileSync(distA, text.replace(encoded, decoded));
      git(dir, "add", ".gitattributes", A, "dist");
      const result = check(dir);
      expect(result.status).toBe(1);
      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    },
  );

  it(
    "refuses a staged tsconfig whose compile writes nothing under dist/",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      const tsconfig = JSON.parse(fs.readFileSync(path.join(dir, "tsconfig.json"), "utf-8"));
      tsconfig.compilerOptions.noEmit = true;
      write(dir, "tsconfig.json", `${JSON.stringify(tsconfig, null, 2)}\n`);
      git(dir, "add", "tsconfig.json");
      git(dir, "rm", "-r", "-q", "--cached", "dist");
      const result = check(dir);
      expect(result.status).toBe(1);
      expect(result.stderr + result.stdout).toContain(EMPTY_MESSAGE);
    },
  );

  it(
    "--ref of a commit with a stale dist fails as stale while the fix is only staged",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      write(dir, A, "export const a: number = 2;\n");
      git(dir, "add", A);
      git(dir, "commit", "-q", "-m", "a changed, dist not rebuilt");
      const head = git(dir, "rev-parse", "HEAD").trim();
      build(dir);
      git(dir, "add", "dist");
      const result = check(dir, `--ref=${head}`);
      expect(result.status).toBe(1);
      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    },
  );

  it(
    "--ref of a correct commit passes while an unrelated engine edit is staged",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      const head = git(dir, "rev-parse", "HEAD").trim();
      write(dir, B, "export const b: number = 2;\n");
      git(dir, "add", B);
      const result = check(dir, `--ref=${head}`);
      expect(result.stderr + result.stdout).not.toContain("dist/ is stale");
      expect(result.status).toBe(0);
    },
  );

  it(
    "--ref values starting with a dash, empty or not a commit are refused with no scratch folder left",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      for (const value of ["-x", "--output=x", "", "no-such-commit"]) {
        const result = check(dir, `--ref=${value}`);
        expect(result.status, `--ref=${value}`).toBe(1);
        expect(result.stderr + result.stdout, `--ref=${value}`).toContain(REF_MESSAGE);
        expect(scratchLeftovers(dir)).toEqual([]);
      }
    },
  );

  it(
    "without --ref the check still reads the index and not the commit",
    { timeout: localLimit(120_000) },
    () => {
      const dir = scratchRepo();
      write(dir, A, "export const a: number = 3;\n");
      git(dir, "add", A);
      const result = check(dir);
      expect(result.status).toBe(1);
      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    },
  );
});
