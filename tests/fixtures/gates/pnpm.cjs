#!/usr/bin/env node
// Offline package-runner boundary; consumer scripts and local dependencies run normally.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

process.env.BKIT_TEST_GATE_RUNNER = "1";
if (process.env.BKIT_TEST_GATE_MARKER) {
  fs.writeFileSync(process.env.BKIT_TEST_GATE_MARKER, "yes");
}
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (process.argv[2] === "install") {
  if (!process.argv.includes("--frozen-lockfile")) process.exit(3);
  const common = spawnSync("git", ["rev-parse", "--git-common-dir"], { encoding: "utf8" });
  if (common.status !== 0) process.exit(5);
  fs.appendFileSync(
    path.resolve(common.stdout.trim(), "fixture-install-runs"),
    process.cwd() + "\n",
  );
  fs.appendFileSync(
    path.resolve(common.stdout.trim(), "fixture-install-args"),
    JSON.stringify(process.argv.slice(2)) + "\n",
  );
  for (const [name, spec] of Object.entries(pkg.dependencies || {})) {
    if (!spec.startsWith("file:./")) process.exit(4);
    const target = path.join("node_modules", name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(spec.slice(5), target, { recursive: true });
  }
} else {
  const script = pkg.scripts?.[process.argv[2]];
  if (typeof script !== "string" || !script.trim()) process.exit(2);
  const result = spawnSync("/bin/sh", ["-c", script], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
