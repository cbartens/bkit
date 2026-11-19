#!/usr/bin/env node
// Checks `dist/` against a compile of the same tree, never the working tree. With no argument the
// tree is the index (the staged tree). With `--ref=<commit>` the tree is that commit's. Exports the
// engine sources into `tmp/check-dist-*`, compiles them there and compares each output's mode and
// blob hash with `git ls-files -s dist/` of the same tree. A compile that writes no file under
// `dist/` fails. Leaves the working tree's `dist/` alone.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const STALE = "[bkit] dist/ is stale — run pnpm build and commit the result";
const EMPTY =
  "[bkit] the staged tree compiles to no file under dist/ — check tsconfig.json outDir and noEmit";

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    encoding: "utf-8",
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
  }
  return result.stdout;
}

function walk(root, rel = "") {
  const files = [];
  for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    const next = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walk(root, next));
    else files.push(next);
  }
  return files;
}

const REF_ERROR = "[bkit] --ref value is not a commit";

/** Returns the full commit hash of `--ref=<value>`, null with no `--ref`; throws on a bad value. */
function parseRef(argv) {
  let ref = null;
  for (const arg of argv) {
    if (!arg.startsWith("--ref=")) throw new Error(`[bkit] unknown argument: ${arg}`);
    ref = arg.slice("--ref=".length);
  }
  if (ref === null) return null;
  if (ref === "" || ref.startsWith("-")) throw new Error(REF_ERROR);
  const resolved = spawnSync(
    "git",
    ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`],
    { encoding: "utf-8" },
  );
  const hash = resolved.stdout.trim();
  if (resolved.status !== 0 || !/^[0-9a-f]{40,64}$/.test(hash)) throw new Error(REF_ERROR);
  return hash;
}

function run(ref) {
  const repo = git(["rev-parse", "--show-toplevel"]).trim();
  const tmpRoot = path.join(repo, "tmp");
  fs.mkdirSync(tmpRoot, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(tmpRoot, "check-dist-"));
  const indexFile = `${scratch}.index`;
  try {
    // With a ref, a temporary index holds that commit's tree; every index read below uses it.
    let env = process.env;
    if (ref) {
      env = { ...process.env, GIT_INDEX_FILE: indexFile };
      git(["read-tree", ref], { cwd: repo, env });
    }
    const staged = git(
      ["ls-files", "-z", "--", ".bkit/core/engine", "tsconfig.json", "package.json"],
      { cwd: repo, env },
    )
      .split("\0")
      .filter(Boolean);
    const exported = spawnSync("git", ["checkout-index", "-z", "--stdin", `--prefix=${scratch}/`], {
      cwd: repo,
      env,
      input: staged.join("\0") + "\0",
      encoding: "utf-8",
    });
    if (exported.status !== 0) {
      console.error(exported.stderr);
      return 1;
    }
    fs.symlinkSync(path.join(repo, "node_modules"), path.join(scratch, "node_modules"));

    const tsc = spawnSync(path.join(scratch, "node_modules/.bin/tsc"), [], {
      cwd: scratch,
      encoding: "utf-8",
    });
    if (tsc.status !== 0) {
      process.stderr.write(`${tsc.stdout}${tsc.stderr}`);
      return 1;
    }
    const cli = path.join(scratch, "dist/cli.js");
    if (fs.existsSync(cli)) fs.chmodSync(cli, 0o755);

    const expected = new Map();
    for (const line of git(["ls-files", "-s", "-z", "--", "dist/"], { cwd: repo, env })
      .split("\0")
      .filter(Boolean)) {
      const tab = line.indexOf("\t");
      const file = line.slice(tab + 1);
      const [mode, hash] = line.slice(0, tab).split(" ");
      if (expected.has(file)) {
        console.error(STALE);
        return 1;
      }
      expected.set(file, `${mode} ${hash}`);
    }

    const actual = new Map();
    const distRoot = path.join(scratch, "dist");
    for (const rel of fs.existsSync(distRoot) ? walk(distRoot) : []) {
      const abs = path.join(distRoot, rel);
      const mode = fs.statSync(abs).mode & 0o111 ? "100755" : "100644";
      actual.set(`dist/${rel}`, `${mode} ${git(["hash-object", "--no-filters", abs]).trim()}`);
    }
    if (actual.size === 0) {
      console.error(EMPTY);
      return 1;
    }

    let stale = expected.size !== actual.size;
    for (const [file, value] of actual) {
      if (expected.get(file) !== value) stale = true;
    }
    for (const file of expected.keys()) {
      if (!actual.has(file)) stale = true;
    }
    if (stale) {
      console.error(STALE);
      return 1;
    }
    return 0;
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
    fs.rmSync(indexFile, { force: true });
  }
}

try {
  process.exitCode = run(parseRef(process.argv.slice(2)));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
