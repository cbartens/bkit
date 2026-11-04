// Example. Copy into scripts/ci/ and own it. bkit install does not write this file.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./bkit-test-awake.mjs", import.meta.url));
const lockScript = fileURLToPath(new URL("./bkit-machine-lock.sh", import.meta.url));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

async function until(check, description) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (check()) return;
    await delay(20);
  }
  assert.fail(`timed out waiting for ${description}`);
}

function cancellationFixture(t, command) {
  const base = resolve("tmp");
  mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(join(base, "awake-cancel-"));
  const worker = join(dir, "worker.cjs");
  writeFileSync(
    worker,
    `
    const fs = require("node:fs");
    const path = require("node:path");
    const file = (name) => path.join(__dirname, name);
    for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"])
      process.on(signal, () => fs.writeFileSync(file("cancelled"), signal));
    fs.writeFileSync(file("ready"), JSON.stringify({
      pid: process.pid,
      owner: Number(process.env.LOCAL_STACK_LOCK_OWNER_awake || 0),
    }));
    setInterval(() => {
      if (fs.existsSync(file("release"))) {
        fs.writeFileSync(file("finished"), "done");
        process.exit(0);
      }
    }, 20);
  `,
  );
  const env = { ...process.env, CI: "", XDG_CACHE_HOME: dir, TMPDIR: dir, FORCE_COLOR: "1" };
  for (const key of Object.keys(env)) {
    if (/^LOCAL_STACK_LOCK_(OWNER|PID|NAME)/.test(key)) delete env[key];
  }
  const child = spawn(process.execPath, [script, ...command(worker, dir)], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env,
  });
  child.stdout.resume();
  child.stderr.resume();
  const closed = once(child, "close");
  let groupKilled = false;
  const killGroup = (signal) => {
    if (groupKilled) return;
    try {
      process.kill(-child.pid, signal);
      if (signal === "SIGKILL") groupKilled = true;
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  };
  const deadline = setTimeout(() => killGroup("SIGKILL"), 8000);
  t.after(async () => {
    killGroup("SIGKILL");
    await closed;
    clearTimeout(deadline);
    rmSync(dir, { recursive: true, force: true });
  });
  return { child, closed, dir, env, killGroup, file: (name) => join(dir, name) };
}

function assertionPid(owner) {
  if (process.platform !== "darwin") return null;
  const result = spawnSync("pgrep", ["-P", String(owner), "caffeinate"], { encoding: "utf8" });
  assert.equal(result.status, 0, "the wrapper must own a sleep assertion");
  return Number(result.stdout.trim());
}

for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) {
  for (const shell of [false, true]) {
    test(
      `${shell ? "shell" : "direct"} cancellation waits for ${signal} cleanup`,
      {
        skip: process.platform === "win32",
        timeout: 12000,
      },
      async (t) => {
        const fixture = cancellationFixture(t, (worker, dir) =>
          shell
            ? [
                "--shell",
                `${quote(process.execPath)} ${quote(worker)}; echo later > ${quote(join(dir, "later"))}`,
              ]
            : [process.execPath, worker],
        );
        await until(() => existsSync(fixture.file("ready")), "worker readiness");
        const { pid } = JSON.parse(readFileSync(fixture.file("ready"), "utf8"));
        const assertion = assertionPid(fixture.child.pid);
        fixture.child.kill(signal);
        await until(() => existsSync(fixture.file("cancelled")), "worker cancellation");
        assert.equal(readFileSync(fixture.file("cancelled"), "utf8"), signal);
        assert.equal(isRunning(fixture.child.pid), true, "wrapper must wait for cleanup");
        if (assertion) assert.equal(isRunning(assertion), true, "assertion must survive cleanup");
        writeFileSync(fixture.file("release"), "finish cleanup");
        const [code] = await fixture.closed;
        assert.equal(code, shell ? { SIGTERM: 143, SIGINT: 130, SIGHUP: 129 }[signal] : 0);
        assert.equal(existsSync(fixture.file("finished")), true);
        assert.equal(existsSync(fixture.file("later")), false);
        assert.equal(isRunning(pid), false);
        if (assertion) assert.equal(isRunning(assertion), false);
      },
    );
  }
}

test(
  "shell cancellation follows a worker orphaned by a nested shell",
  {
    skip: process.platform === "win32",
    timeout: 12000,
  },
  async (t) => {
    const fixture = cancellationFixture(t, (worker, dir) => {
      const nested = `${quote(process.execPath)} ${quote(worker)}; :`;
      return ["--shell", `/bin/sh -c ${quote(nested)}; echo later > ${quote(join(dir, "later"))}`];
    });
    await until(() => existsSync(fixture.file("ready")), "nested worker readiness");
    const { pid } = JSON.parse(readFileSync(fixture.file("ready"), "utf8"));
    const assertion = assertionPid(fixture.child.pid);
    fixture.child.kill("SIGTERM");
    await until(() => existsSync(fixture.file("cancelled")), "orphaned worker cancellation");
    assert.equal(isRunning(fixture.child.pid), true, "wrapper must await orphaned worker cleanup");
    if (assertion) assert.equal(isRunning(assertion), true);
    writeFileSync(fixture.file("release"), "finish cleanup");
    const [code] = await fixture.closed;
    assert.equal(code, 143);
    assert.equal(existsSync(fixture.file("finished")), true);
    assert.equal(existsSync(fixture.file("later")), false);
    assert.equal(isRunning(pid), false);
    if (assertion) assert.equal(isRunning(assertion), false);
  },
);

for (const mode of ["direct", "shell", "nested shell"]) {
  test(
    `${mode} cancellation preserves a nested machine-lock owner`,
    {
      skip: process.platform === "win32",
      timeout: 12000,
    },
    async (t) => {
      const fixture = cancellationFixture(t, (worker, dir) => {
        const args = [
          "bash",
          lockScript,
          "run",
          "awake cleanup",
          "--lock",
          "awake",
          "--",
          process.execPath,
          worker,
        ];
        if (mode === "direct") return args;
        const command = args.map(quote).join(" ");
        const wrapped = mode === "nested shell" ? `/bin/sh -c ${quote(`${command}; :`)}` : command;
        return ["--shell", `${wrapped}; echo later > ${quote(join(dir, "later"))}`];
      });
      await until(() => existsSync(fixture.file("ready")), "locked worker readiness");
      const { pid, owner } = JSON.parse(readFileSync(fixture.file("ready"), "utf8"));
      assert.ok(owner > 0);
      const assertion = assertionPid(fixture.child.pid);
      fixture.child.kill("SIGTERM");
      await delay(150);
      assert.equal(isRunning(fixture.child.pid), true);
      assert.equal(isRunning(owner), true);
      assert.equal(isRunning(pid), true);
      assert.equal(
        existsSync(fixture.file("cancelled")),
        false,
        "lock command completes naturally",
      );
      if (assertion) assert.equal(isRunning(assertion), true);
      const contender = () =>
        spawnSync(
          "bash",
          [
            "-c",
            'source "$1"; try_local_stack_lock contender awake; result=$?; release_local_stack_lock awake; exit "$result"',
            "bash",
            lockScript,
          ],
          {
            env: fixture.env,
            encoding: "utf8",
            timeout: 3000,
          },
        );
      assert.equal(contender().status, 1, "the lock must remain held while its command runs");
      writeFileSync(fixture.file("release"), "finish command");
      const [code] = await fixture.closed;
      assert.equal(code, 143);
      assert.equal(existsSync(fixture.file("finished")), true);
      assert.equal(existsSync(fixture.file("later")), false);
      assert.equal(isRunning(pid), false);
      assert.equal(isRunning(owner), false);
      if (assertion) assert.equal(isRunning(assertion), false);
      assert.equal(contender().status, 0, "the completed command must release its lock");
    },
  );
}

test(
  "a hard process-group timeout reaches a shell command during cleanup",
  {
    skip: process.platform === "win32",
    timeout: 12000,
  },
  async (t) => {
    const fixture = cancellationFixture(t, (worker) => [
      "--shell",
      `${quote(process.execPath)} ${quote(worker)}; echo later`,
    ]);
    await until(() => existsSync(fixture.file("ready")), "worker readiness");
    const { pid } = JSON.parse(readFileSync(fixture.file("ready"), "utf8"));
    fixture.killGroup("SIGTERM");
    await until(() => existsSync(fixture.file("cancelled")), "worker cancellation");
    fixture.killGroup("SIGKILL");
    await fixture.closed;
    await until(() => !isRunning(pid), "hard timeout cleanup");
  },
);

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
        'process.on("SIGTERM", () => {}); console.log(String(process.pid)); setInterval(() => {}, 1000)',
      ],
      {
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "1" },
      },
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
      [
        script,
        process.execPath,
        "-e",
        "console.log(String(process.pid)); setInterval(() => {}, 1000)",
      ],
      { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, FORCE_COLOR: "1" } },
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
