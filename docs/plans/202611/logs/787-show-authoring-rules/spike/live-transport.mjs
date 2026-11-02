import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ownFile = fileURLToPath(import.meta.url);
const probeRoot = path.dirname(ownFile);
const host = process.argv[2];
const channel = process.argv[3] || "edit";

if (host === "--hook") {
  const input = JSON.parse(fs.readFileSync(0, "utf8"));
  const directory = input.cwd || input.workspace_roots?.[0] || process.cwd();
  const toolInput = input.tool_input || {};
  const relevant = JSON.stringify(toolInput).includes("sentinel.txt");
  if (relevant) {
    fs.appendFileSync(
      path.join(directory, "hook-events.jsonl"),
      JSON.stringify({
        event: "hook-before-sentinel",
        tool: input.tool_name || input.hook_event_name,
        sentinel: fs.readFileSync(path.join(directory, "sentinel.txt"), "utf8"),
        markerExists: fs.existsSync(path.join(directory, "received-marker.txt")),
      }) + "\n",
    );
  }
  const context = relevant
    ? "Probe marker TRANSPORT_787_VISIBLE. Before the pending sentinel.txt edit executes, create received-marker.txt containing TRANSPORT_787_VISIBLE. This is the sole task of this temporary timing probe."
    : "";
  const selected = process.argv[3];
  const output = selected === "codex"
    ? { hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: context } }
    : selected === "cursor-shell"
      ? { permission: "allow", agent_message: context }
      : { permission: "allow", additional_context: context };
  process.stdout.write(JSON.stringify(output));
  process.exit(0);
}

if (!["codex", "cursor"].includes(host)) throw new Error("Host must be codex or cursor");
const directory = path.join(probeRoot, `${host}-${channel}-workspace`);
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, "sentinel.txt"), "BEFORE\n");
const hookCommand = `node '${ownFile.replaceAll("'", "'\\''")}' --hook ${host === "codex" ? "codex" : `cursor-${channel}`}`;
if (host === "codex") {
  fs.mkdirSync(path.join(directory, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(directory, ".codex", "hooks.json"), JSON.stringify({
    hooks: { PreToolUse: [{ matcher: "apply_patch|Bash", hooks: [{ type: "command", command: hookCommand }] }] },
  }, null, 2));
} else {
  fs.mkdirSync(path.join(directory, ".cursor"), { recursive: true });
  fs.writeFileSync(path.join(directory, ".cursor", "hooks.json"), JSON.stringify({
    version: 1,
    hooks: channel === "shell"
      ? { beforeShellExecution: [{ command: hookCommand }] }
      : { preToolUse: [{ command: hookCommand, matcher: "Write" }] },
  }, null, 2));
}
const prompt = channel === "shell"
  ? "This is a confined hook timing experiment. Set sentinel.txt to AFTER followed by newline using one shell command. If a hook gives you an extra instruction, obey it when you receive it. Do not inspect the hook files. Change only sentinel.txt and received-marker.txt, and finish by reporting what happened."
  : "This is a confined hook timing experiment. Set sentinel.txt to AFTER followed by newline using your native edit tool, not a shell command. If a hook gives you an extra instruction, obey it when you receive it. Do not inspect the hook files. Change only sentinel.txt and received-marker.txt, and finish by reporting what happened.";
const args = host === "codex"
  ? ["exec", "--ephemeral", "--skip-git-repo-check", "--sandbox", "workspace-write", "--json", "-C", directory, prompt]
  : ["--print", "--output-format", "stream-json", "--workspace", directory, "--auto-review", prompt];
const result = spawnSync(host === "codex" ? "codex" : "cursor-agent", args, {
  cwd: directory,
  env: host === "cursor"
    ? { ...process.env, CURSOR_API_KEY: process.env.CURSOR_API_KEY || process.env.BKIT_CURSOR_API_KEY }
    : process.env,
  encoding: "utf8",
  timeout: 45000,
  maxBuffer: 1024 * 1024,
});
fs.writeFileSync(path.join(directory, "host-output.txt"), result.stdout || "");
fs.writeFileSync(path.join(directory, "host-stderr.txt"), result.stderr || "");
console.log(JSON.stringify({
  host,
  channel,
  exitCode: result.status,
  signal: result.signal,
  error: result.error ? { code: result.error.code, message: result.error.message } : null,
  hookEventCount: fs.existsSync(path.join(directory, "hook-events.jsonl"))
    ? fs.readFileSync(path.join(directory, "hook-events.jsonl"), "utf8").trim().split("\n").length : 0,
  sentinel: fs.readFileSync(path.join(directory, "sentinel.txt"), "utf8"),
  receivedMarker: fs.existsSync(path.join(directory, "received-marker.txt"))
    ? fs.readFileSync(path.join(directory, "received-marker.txt"), "utf8") : null,
  stderr: (result.stderr || "").slice(0, 3000),
  stdout: (result.stdout || "").slice(0, 3000),
}, null, 2));
