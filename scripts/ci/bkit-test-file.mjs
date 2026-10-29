#!/usr/bin/env node
// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
/**
 * bkit-test-file.mjs — bkit's own `bkit:test:file`: runs the test files named as arguments with
 * the runner their kind needs, and writes one JUnit report to $BKIT_TEST_REPORT when it is set.
 *   .bats → bats (its junit report.xml is moved to $BKIT_TEST_REPORT)
 *   .mjs  → node --test (spec to stdout, junit to $BKIT_TEST_REPORT)
 *   other → vitest run (default + junit reporters)
 * Exit: the runner's exit code; 2 = no file named, or files that need more than one runner.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const bin = (name) => path.join(ROOT, "node_modules", ".bin", name);

const kindOf = (file) =>
  file.endsWith(".bats") ? "bats" : file.endsWith(".mjs") ? "node" : "vitest";

const files = process.argv.slice(2);
const kinds = [...new Set(files.map(kindOf))];
if (kinds.length !== 1) {
  console.error(
    files.length === 0
      ? "bkit:test:file: name the test file to run"
      : `bkit:test:file: ${files.join(" ")} need ${kinds.join(" + ")} — name files of one runner per run`,
  );
  process.exit(2);
}

const report = process.env.BKIT_TEST_REPORT || "";

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit" });
  if (res.error) {
    console.error(`bkit:test:file: ${cmd} could not run — ${res.error.message}`);
    return 127;
  }
  return res.status ?? 1;
}

function runBats() {
  if (!report) return run(bin("bats"), files);
  fs.mkdirSync(path.dirname(report), { recursive: true });
  const out = fs.mkdtempSync(path.join(path.dirname(report), "bats-"));
  const code = run(bin("bats"), ["--report-formatter", "junit", "--output", out, ...files]);
  const xml = path.join(out, "report.xml");
  if (fs.existsSync(xml)) fs.renameSync(xml, report);
  fs.rmSync(out, { recursive: true, force: true });
  return code;
}

const runNode = () =>
  run(process.execPath, [
    "--test",
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    ...(report ? ["--test-reporter=junit", `--test-reporter-destination=${report}`] : []),
    ...files,
  ]);

const runVitest = () =>
  run(bin("vitest"), [
    "run",
    ...(report ? ["--reporter=default", "--reporter=junit", `--outputFile.junit=${report}`] : []),
    ...files,
  ]);

process.exit({ bats: runBats, node: runNode, vitest: runVitest }[kinds[0]]());
