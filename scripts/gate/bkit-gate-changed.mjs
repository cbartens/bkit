#!/usr/bin/env node
// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
/**
 * bkit-gate-changed.mjs — bkit's own `bkit:gate:changed`: checks only the files named as
 * arguments (repo-relative, from `bkit tests changed`). Every stage runs, failing or not:
 *   related  → vitest related --run: the Vitest tests that import a changed file
 *   named    → each test file that names a changed path, by runner (vitest / node --test / bats)
 *   lint     → oxlint on the changed engine .ts files (the `lint` script's scope)
 *   format   → prettier --check on every changed file it knows, symlinks excluded
 *   types    → pnpm typecheck when a .ts file changed (tsc checks whole projects only)
 * Exit: 0 when every stage passed or no file was named; 1 when any stage failed.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const bin = (name) => path.join(ROOT, "node_modules", ".bin", name);

const files = process.argv.slice(2).filter((f) => fs.existsSync(path.join(ROOT, f)));
if (files.length === 0) process.exit(0);

const TEST_GLOBS = ["*.test.ts", "*.test.mjs", "*.bats"];
const GENERIC_NAMES = new Set(["index.ts", "index.mjs", "package.json", "README.md"]);

const kindOf = (file) =>
  file.endsWith(".bats") ? "bats" : file.endsWith(".mjs") ? "node" : "vitest";

function run(stage, cmd, args) {
  console.log(`\n[bkit:gate:changed] ${stage}: ${[path.basename(cmd), ...args].join(" ")}`);
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (res.error) {
    console.error(`[bkit:gate:changed] ${stage}: ${cmd} could not run — ${res.error.message}`);
    return 1;
  }
  return res.status ?? 1;
}

/** Test files (tracked or untracked, never ignored) whose text holds a changed path or a distinctive basename. */
function testsNaming(paths) {
  const needles = [
    ...new Set(paths.flatMap((p) => [p, path.basename(p)]).filter((n) => !GENERIC_NAMES.has(n))),
  ];
  const res = spawnSync(
    "git",
    ["grep", "-l", "-F", "--untracked", ...needles.flatMap((n) => ["-e", n]), "--", ...TEST_GLOBS],
    { cwd: ROOT, encoding: "utf-8" },
  );
  // git grep exits 1 when nothing matches; any other non-zero is a real error.
  if (res.status !== 0 && res.status !== 1) {
    console.error(`[bkit:gate:changed] named: git grep failed — ${res.stderr.trim()}`);
    return null;
  }
  return res.stdout.split("\n").filter((f) => f !== "" && fs.existsSync(path.join(ROOT, f)));
}

const failed = [];
const stage = (name, code) => {
  if (code !== 0) failed.push(name);
};

stage(
  "related",
  run("related", bin("vitest"), ["related", "--run", "--passWithNoTests", ...files]),
);

const isTest = (f) => TEST_GLOBS.some((g) => f.endsWith(g.slice(1)));
const named = testsNaming(files);
if (named === null) stage("named", 1);
else {
  const tests = [...new Set([...named, ...files.filter(isTest)])].sort();
  const byKind = (k) => tests.filter((f) => kindOf(f) === k);
  if (byKind("vitest").length > 0)
    stage("named", run("named", bin("vitest"), ["run", "--passWithNoTests", ...byKind("vitest")]));
  if (byKind("node").length > 0)
    stage("named", run("named", process.execPath, ["--test", ...byKind("node")]));
  if (byKind("bats").length > 0) stage("named", run("named", bin("bats"), byKind("bats")));
}

const engineTs = files.filter((f) => f.startsWith(".bkit/core/engine/") && f.endsWith(".ts"));
if (engineTs.length > 0)
  stage(
    "lint",
    run("lint", bin("oxlint"), [
      "-c",
      ".oxlintrc.json",
      "--type-aware",
      "--tsconfig",
      "tsconfig.test.json",
      "--deny-warnings",
      ...engineTs,
    ]),
  );

// prettier refuses an explicitly named symlink, so pass only real files.
const formattable = files.filter((f) => !fs.lstatSync(path.join(ROOT, f)).isSymbolicLink());
if (formattable.length > 0)
  stage("format", run("format", bin("prettier"), ["--check", "--ignore-unknown", ...formattable]));

if (files.some((f) => f.endsWith(".ts"))) stage("types", run("types", "pnpm", ["typecheck"]));

if (failed.length > 0) {
  console.error(`\n[bkit:gate:changed] failed: ${[...new Set(failed)].join(", ")}`);
  process.exit(1);
}
console.log("\n[bkit:gate:changed] every stage passed");
