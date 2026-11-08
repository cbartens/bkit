// bkit's own checkout only; never shipped. Run: node --test scripts/gate/bkit-gate-changed.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./bkit-gate-changed.mjs", import.meta.url));
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));

/**
 * A scratch dir next to this test, removed when the test ends. Not under tmp/: prettier skips
 * .gitignore'd paths, so a probe there would never reach the format check.
 */
function scratch(t) {
  const dir = mkdtempSync(join(root, "scripts", "gate", "probe-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

const gate = (...files) =>
  spawnSync(process.execPath, [script, ...files], { cwd: root, encoding: "utf-8" });

test("format skips a changed symlink instead of failing on it", (t) => {
  const dir = scratch(t);
  writeFileSync(join(dir, "gate-symlink-target-probe.md"), "# Probe\n");
  symlinkSync("gate-symlink-target-probe.md", join(dir, "gate-symlink-link-probe.md"));
  const res = gate(relative(root, join(dir, "gate-symlink-link-probe.md")));
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.doesNotMatch(res.stdout + res.stderr, /is a symbolic link/);
});

test("format still fails a changed regular file prettier would rewrite", (t) => {
  const dir = scratch(t);
  writeFileSync(join(dir, "gate-unformatted-probe.md"), "#   Probe\n\n\n\n*  item\n");
  const res = gate(relative(root, join(dir, "gate-unformatted-probe.md")));
  assert.equal(res.status, 1, res.stdout + res.stderr);
  assert.match(res.stderr, /failed: format/);
});
