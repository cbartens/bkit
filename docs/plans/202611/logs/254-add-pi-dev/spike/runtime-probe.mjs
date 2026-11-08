import { spawn, execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";

const pi = resolve("runtime/node_modules/.bin/pi");
const extension = resolve("lifecycle.mjs");
const agentDir = resolve("runtime/isolated-agent");
const env = { PATH: process.env.PATH, PI_CODING_AGENT_DIR: agentDir, PI_TELEMETRY: "0" };
mkdirSync(agentDir, { recursive: true });
writeFileSync(
  resolve(agentDir, "settings.json"),
  JSON.stringify({ defaultProjectTrust: "always" }),
);
const args = ["--no-session", "--no-extensions", "--no-mcp", "--tools", "read"];

function rpc(cwd, extra = []) {
  const child = spawn(pi, ["--mode", "rpc", ...args, ...extra], { cwd, env, detached: true });
  const records = [];
  const ready = [];
  createInterface({ input: child.stdout }).on("line", (line) => records.push(JSON.parse(line)));
  createInterface({ input: child.stderr }).on("line", (line) => {
    if (line.startsWith('{"probe":')) ready.push(JSON.parse(line));
  });
  let id = 0;
  return {
    child,
    records,
    ready,
    send(payload) {
      child.stdin.write(JSON.stringify({ ...payload, id: ++id }) + "\n");
      return id;
    },
    async waitFor(predicate) {
      for (let index = 0; index < 100; index++) {
        const result = records.find(predicate);
        if (result) return result;
        await delay(20);
      }
      throw new Error("RPC response timeout");
    },
  };
}

function file(root, path, content) {
  const destination = resolve(root, path);
  mkdirSync(resolve(destination, ".."), { recursive: true });
  writeFileSync(destination, content);
}

async function resources() {
  const fixture = mkdtempSync(resolve("runtime/resources-"));
  const repo = resolve(fixture, "checkout");
  const linked = resolve(fixture, "worktree");
  mkdirSync(repo, { recursive: true });
  execFileSync("git", ["init", "-q", repo]);
  execFileSync("git", ["-C", repo, "worktree", "add", "-q", "--orphan", "-b", "probe", linked]);
  for (const [label, cwd] of [
    ["checkout", repo],
    ["worktree", linked],
  ]) {
    for (const [base, name] of [
      [".agents/skills", "bkit-design"],
      [".agents/skills", "user-skill"],
      [".pi/skills", "bkit-pi-design"],
    ]) {
      const body = name === "bkit-pi-design" ? "Pi-specific probe skill" : "Probe";
      file(
        cwd,
        base + "/" + name + "/SKILL.md",
        "---\nname: " + name + "\ndescription: Probe skill\n---\n" + body + "\n",
      );
    }
    file(cwd, ".pi/settings.json", "{}");
    const run = rpc(cwd, ["--extension", extension]);
    const list = async () => {
      const id = run.send({ type: "get_commands" });
      const response = await run.waitFor((record) => record.id === id);
      return response.data.commands
        .filter((command) => command.source === "skill")
        .map((command) => command.name)
        .sort();
    };
    try {
      const before = await list();
      file(cwd, ".pi/settings.json", JSON.stringify({ skills: ["-skills/bkit-design/SKILL.md"] }));
      const reloadId = run.send({ type: "prompt", message: "/probe-reload" });
      const reload = await run.waitFor((record) => record.id === reloadId);
      const after = await list();
      console.log(JSON.stringify({ label, before, reloadSuccess: reload.success, after }));
      if (process.env.BKIT_OPENROUTER_API_KEY) {
        const explicit = spawnSync(
          pi,
          [
            "--mode",
            "json",
            ...args,
            "--extension",
            extension,
            "--provider",
            "openrouter",
            "--model",
            "openai/gpt-6.1-sol",
            "--",
            "/skill:bkit-pi-design probe-argument",
          ],
          {
            cwd,
            env: {
              ...env,
              OPENROUTER_API_KEY: process.env.BKIT_OPENROUTER_API_KEY,
              BKIT_PI_PROBE_SKILL: "1",
            },
            encoding: "utf8",
            timeout: 2000,
          },
        );
        const marker = explicit.stderr
          .split("\n")
          .find((line) => line.startsWith('{"probe":"explicit_skill"'));
        console.log(
          JSON.stringify({
            label,
            explicit: marker ? JSON.parse(marker) : null,
            exit: explicit.status,
          }),
        );
      }
    } finally {
      run.child.kill("SIGTERM");
    }
  }
}

async function cancellation() {
  const cwd = mkdtempSync(resolve("runtime/cancel-"));
  const run = rpc(cwd, ["--extension", extension]);
  let shellPid;
  try {
    const id = run.send({ type: "get_state" });
    await run.waitFor((record) => record.id === id);
    run.send({ type: "bash", command: "echo $$ > shell.pid; exec sleep 8" });
    const pidFile = resolve(cwd, "shell.pid");
    for (let i = 0; i < 100 && !existsSync(pidFile); i++) await delay(20);
    shellPid = Number(readFileSync(pidFile, "utf8").trim());
    const pgid = Number(
      execFileSync("ps", ["-o", "pgid=", "-p", String(shellPid)], { encoding: "utf8" }).trim(),
    );
    const exited = new Promise((done) =>
      run.child.once("exit", (code, signal) => done({ code, signal })),
    );
    process.kill(-run.child.pid, "SIGKILL");
    const result = await exited;
    const descendant = spawnSync("ps", ["-o", "stat=", "-p", String(shellPid)], {
      encoding: "utf8",
    });
    console.log(
      JSON.stringify({
        platform: process.platform,
        childGroup: run.child.pid,
        descendantGroup: pgid,
        result,
        descendantState: descendant.stdout.trim(),
      }),
    );
  } finally {
    if (run.child.exitCode === null && run.child.signalCode === null) run.child.kill("SIGTERM");
    if (shellPid) {
      const result = spawnSync("ps", ["-o", "comm=", "-p", String(shellPid)], { encoding: "utf8" });
      if (result.stdout?.trim().endsWith("sleep")) process.kill(shellPid, "SIGKILL");
    }
  }
}

if (process.argv[2] === "resources") await resources();
else if (process.argv[2] === "cancel") await cancellation();
else throw new Error("Expected resources or cancel");
