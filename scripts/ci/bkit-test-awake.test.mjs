import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./bkit-test-awake.mjs", import.meta.url));

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    if (process.platform === "linux") {
      const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
      return stat.slice(stat.lastIndexOf(")") + 2, stat.lastIndexOf(")") + 3) !== "Z";
    }
    return true;
  } catch (error) {
    if (error.code === "ESRCH" || error.code === "ENOENT") return false;
    throw error;
  }
}

test("ships a command-scoped sleep prevention wrapper", () => {
  assert.ok(existsSync(script));
});

test("preserves arguments, output and nonzero exit status", () => {
  const result = spawnSync(
    process.execPath,
    [
      script,
      process.execPath,
      "-e",
      'console.log(JSON.stringify(process.argv.slice(1))); console.error("failure detail"); process.exit(23)',
      "a b",
      "$(echo unsafe)",
      "",
      "--flag",
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 23);
  assert.deepEqual(JSON.parse(result.stdout), ["a b", "$(echo unsafe)", "", "--flag"]);
  assert.equal(result.stderr, "failure detail\n");
});

test("runs an entire shell chain and retains its failure", () => {
  const result = spawnSync(
    process.execPath,
    [script, "--shell", "echo first && echo second && exit 19"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 19);
  assert.match(result.stdout, /first\r?\nsecond\r?\n/);
});

test("reports a missing command as 127", () => {
  const result = spawnSync(process.execPath, [script, "bkit-command-that-does-not-exist"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 127);
  assert.match(result.stderr, /bkit-command-that-does-not-exist/);
});

test("requires a command", () => {
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /command/);
});

test("non-macOS platform selection runs commands without sleep prevention", async () => {
  const { runAwake } = await import("./bkit-test-awake.mjs");
  for (const platform of ["linux", "win32"]) {
    assert.equal(await runAwake(process.execPath, ["-e", "process.exit(17)"], platform), 17);
  }
});

test(
  "hard timeout escalation reaches a command that ignores TERM",
  { skip: process.platform === "win32" },
  async () => {
    const child = spawn(
      process.execPath,
      [
        script,
        process.execPath,
        "-e",
        'process.on("SIGTERM", () => {}); console.log(process.pid); setInterval(() => {}, 1000)',
      ],
      { detached: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    const exited = once(child, "exit");
    const [data] = await once(child.stdout, "data");
    const pid = Number(data.toString().trim());
    assert.ok(pid > 0);
    process.kill(-child.pid, "SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 100));
    process.kill(-child.pid, "SIGKILL");
    await exited;
    for (let attempt = 0; attempt < 40 && isRunning(pid); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    const alive = isRunning(pid);
    if (alive) process.kill(pid, "SIGKILL");
    child.stdout.destroy();
    child.stderr.destroy();
    assert.equal(alive, false, "a hard timeout must kill the test command too");
  },
);

test(
  "forwards POSIX cancellation to the command and releases the assertion",
  { skip: process.platform === "win32" },
  async () => {
    const child = spawn(
      process.execPath,
      [script, process.execPath, "-e", "console.log(process.pid); setInterval(() => {}, 1000)"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    const closed = once(child, "close");
    const [data] = await once(child.stdout, "data");
    const pid = Number(data.toString().trim());
    assert.ok(pid > 0);
    child.kill("SIGTERM");
    const [code] = await closed;
    assert.equal(code, 143);
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  },
);

test(
  "holds a real macOS assertion only while the command runs",
  { skip: process.platform !== "darwin" },
  () => {
    const probe = `
    const { execFileSync } = require("node:child_process");
    const pid = Number(execFileSync("pgrep", ["-P", String(process.ppid), "caffeinate"], {encoding:"utf8"}).trim());
    const command = execFileSync("ps", ["-p", String(pid), "-o", "command="], {encoding:"utf8"});
    console.log(JSON.stringify({pid, command, owner:process.ppid}));
  `;
    const result = spawnSync(process.execPath, [script, process.execPath, "-e", probe], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const { pid, command, owner } = JSON.parse(result.stdout);
    assert.match(command, new RegExp("caffeinate -is -w " + owner));
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  },
);
