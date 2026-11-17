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
      process.on(signal, () => {
        fs.writeFileSync(file("cancelled.tmp"), signal);
        fs.renameSync(file("cancelled.tmp"), file("cancelled"));
      });
    fs.writeFileSync(file("ready.tmp"), JSON.stringify({
      pid: process.pid,
      owner: Number(process.env.LOCAL_STACK_LOCK_OWNER_awake || 0),
    }));
    fs.renameSync(file("ready.tmp"), file("ready"));
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
  "shell cancellation reads complete readiness JSON when publication is interrupted",
  { skip: process.platform === "win32", timeout: 12000 },
  (t) => {
    const base = resolve("tmp");
    mkdirSync(base, { recursive: true });
    const dir = mkdtempSync(join(base, "awake-publish-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const preload = join(dir, "pause-publication.cjs");
    const receipt = join(dir, "publication-observed");
    writeFileSync(
      preload,
      `
      if (process.argv[1]?.endsWith("worker.cjs")) {
        const fs = require("node:fs");
        const writeFileSync = fs.writeFileSync;
        fs.writeFileSync = function (file, data, ...options) {
          if (typeof data !== "string" || !data.startsWith('{"pid":'))
            return writeFileSync.call(this, file, data, ...options);
          const fd = fs.openSync(file, "w");
          try {
            writeFileSync(${JSON.stringify(receipt)}, "paused");
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
            writeFileSync(fd, data, ...options);
          } finally {
            fs.closeSync(fd);
          }
        };
      }
    `,
    );
    const result = spawnSync(
      process.execPath,
      [
        "--test",
        "--test-name-pattern=^shell cancellation waits for SIGTERM cleanup$",
        fileURLToPath(import.meta.url),
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          NODE_TEST_CONTEXT: undefined,
          NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --require=${JSON.stringify(preload)}`,
        },
      },
    );
    assert.equal(
      existsSync(receipt),
      true,
      `the worker must pause after opening its JSON file\n${result.stdout}${result.stderr}`,
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
  },
);

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

test(
  "--hold-s stops a command that outlives the limit, with the processes under it, and exits 124",
  { skip: process.platform === "win32", timeout: 15000 },
  (t) => {
    const base = resolve("tmp");
    mkdirSync(base, { recursive: true });
    const dir = mkdtempSync(join(base, "awake-hold-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const root = join(dir, "root.pid");
    const grandchild = join(dir, "grandchild.pid");
    const started = Date.now();
    const result = spawnSync(
      process.execPath,
      [
        script,
        "--hold-s",
        "1",
        "--grace-s",
        "1",
        "--",
        "/bin/sh",
        "-c",
        `echo $$ > ${quote(root)}; sleep 300 & echo $! > ${quote(grandchild)}; wait`,
      ],
      { encoding: "utf8", timeout: 12000 },
    );
    assert.equal(result.status, 124, result.stderr);
    assert.ok(Date.now() - started >= 1000, "the command must run until the limit");
    assert.equal(isRunning(Number(readFileSync(root, "utf8"))), false);
    assert.equal(isRunning(Number(readFileSync(grandchild, "utf8"))), false);
  },
);

test("--hold-s passes on the exit status and output of a command that finishes first", () => {
  const failing = spawnSync(
    process.execPath,
    [script, "--hold-s", "30", "--", "/bin/sh", "-c", "exit 7"],
    { encoding: "utf8", timeout: 12000 },
  );
  assert.equal(failing.status, 7, failing.stderr);
  const passing = spawnSync(process.execPath, [script, "--hold-s", "30", "--", "echo", "fine"], {
    encoding: "utf8",
    timeout: 12000,
  });
  assert.equal(passing.status, 0, passing.stderr);
  assert.equal(passing.stdout, "fine\n");
  assert.equal(passing.stderr, "");
});

test(
  "--pass-fds hands the command the listed descriptors beyond stdio",
  { skip: process.platform === "win32" },
  () => {
    const result = spawnSync(
      process.execPath,
      [script, "--hold-s", "30", "--pass-fds", "3", "--", "/bin/sh", "-c", "echo through-3 >&3"],
      { stdio: ["ignore", "pipe", "pipe", "pipe"], encoding: "utf8", timeout: 12000 },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.output[3], "through-3\n");
  },
);

test(
  "--stopped-file is created when the hold limit stops the command, and not when the command finishes first",
  { skip: process.platform === "win32", timeout: 15000 },
  (t) => {
    const base = resolve("tmp");
    mkdirSync(base, { recursive: true });
    const dir = mkdtempSync(join(base, "awake-stopped-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const stopped = join(dir, "stopped");
    const held = spawnSync(
      process.execPath,
      [script, "--hold-s", "1", "--grace-s", "1", "--stopped-file", stopped, "--", "sleep", "300"],
      { encoding: "utf8", timeout: 12000 },
    );
    assert.equal(held.status, 124, held.stderr);
    assert.equal(existsSync(stopped), true, "the stop must create the file");
    rmSync(stopped);
    const own = spawnSync(
      process.execPath,
      [script, "--hold-s", "30", "--stopped-file", stopped, "--", "/bin/sh", "-c", "exit 124"],
      { encoding: "utf8", timeout: 12000 },
    );
    assert.equal(own.status, 124, own.stderr);
    assert.equal(existsSync(stopped), false, "a command's own 124 must not create the file");
  },
);

test(
  "--stopped-file that cannot be written still stops the command at the hold limit",
  { skip: process.platform === "win32", timeout: 15000 },
  () => {
    const stopped = join(resolve("tmp"), "awake-no-such-folder", "stopped");
    const held = spawnSync(
      process.execPath,
      [script, "--hold-s", "1", "--grace-s", "1", "--stopped-file", stopped, "--", "sleep", "300"],
      { encoding: "utf8", timeout: 12000 },
    );
    assert.equal(held.status, 124, held.stderr);
    assert.match(held.stderr, /could not write .*stopped/);
    assert.doesNotMatch(held.stderr, /\n\s+at /);
  },
);

test(
  "--pass-fds naming a descriptor that is not open fails with the usage error",
  { skip: process.platform === "win32" },
  () => {
    const result = spawnSync(
      process.execPath,
      [script, "--hold-s", "30", "--pass-fds", "250", "--", "echo", "should-not-run"],
      { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: 12000 },
    );
    assert.equal(result.status, 2, result.stderr);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /--pass-fds/);
    assert.doesNotMatch(result.stderr, /EBADF|\n\s+at /);
  },
);

test(
  "a Ctrl-C from the terminal is not sent again, but a --shell chain still waits for its descendants",
  { skip: process.platform === "win32", timeout: 12000 },
  async (t) => {
    const { runAwake } = await import("./bkit-test-awake.mjs");
    const base = resolve("tmp");
    mkdirSync(base, { recursive: true });
    const dir = mkdtempSync(join(base, "awake-foreground-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const file = (name) => join(dir, name);
    const worker = file("worker.cjs");
    writeFileSync(
      worker,
      `
      const fs = require("node:fs");
      let interrupts = 0;
      process.on("SIGINT", () => {
        interrupts++;
        fs.writeFileSync(${JSON.stringify(file("cancelled"))}, String(interrupts));
      });
      fs.writeFileSync(${JSON.stringify(file("ready"))}, String(process.pid));
      setInterval(() => {
        if (fs.existsSync(${JSON.stringify(file("release"))})) {
          fs.writeFileSync(${JSON.stringify(file("finished"))}, String(interrupts));
          process.exit(0);
        }
      }, 20);
    `,
    );
    // The runner exits 300 ms after its Ctrl-C and leaves its worker cleaning up.
    const runner = file("runner.cjs");
    writeFileSync(
      runner,
      `
      const { spawn } = require("node:child_process");
      spawn(process.execPath, [${JSON.stringify(worker)}], { stdio: "inherit" });
      process.on("SIGINT", () => setTimeout(() => process.exit(130), 300));
      setInterval(() => {}, 1000);
    `,
    );
    const done = runAwake(
      "--shell",
      [`${quote(process.execPath)} ${quote(runner)}`],
      "linux",
      null,
      () => true,
    );
    let settled = false;
    done.then(() => (settled = true));
    await until(() => existsSync(file("ready")), "worker readiness");
    const pid = Number(readFileSync(file("ready"), "utf8"));
    t.after(() => {
      if (isRunning(pid)) process.kill(pid, "SIGKILL");
    });
    const group = spawnSync("ps", ["-o", "pid=", "-o", "ppid=", "-A"], { encoding: "utf8" })
      .stdout.split("\n")
      .map((row) => row.trim().split(/\s+/).map(Number));
    const parentOf = (child) => group.find(([p]) => p === child)?.[1];
    const runnerPid = parentOf(pid);
    const shellPid = parentOf(runnerPid);
    // The terminal delivers Ctrl-C to the whole foreground group, then the wrapper sees it too.
    for (const target of [shellPid, runnerPid, pid]) process.kill(target, "SIGINT");
    process.emit("SIGINT", "SIGINT");
    await until(() => existsSync(file("cancelled")), "worker cancellation");
    await until(() => !isRunning(runnerPid), "runner exit");
    await delay(300);
    assert.equal(settled, false, "the wrapper must wait for the worker's cleanup");
    writeFileSync(file("release"), "finish cleanup");
    assert.equal(await done, 130);
    assert.equal(readFileSync(file("finished"), "utf8"), "1", "INT must reach the worker once");
  },
);

test("--hold-s and --grace-s need whole numbers", () => {
  for (const args of [
    ["--hold-s", "abc", "--", "true"],
    ["--hold-s", "0", "--", "true"],
    ["--hold-s", "5", "--grace-s", "-1", "--", "true"],
    ["--hold-s", "5", "--pass-fds", "1", "--", "true"],
  ]) {
    const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stderr, /--hold-s/);
  }
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
