// Read / shell payload adapter, shared by the Claude Code, Cursor, Codex and Antigravity
// hooks: `{ tool_name, tool_input, session_id | conversation_id, agent_id?, cwd }`.
// Antigravity's own envelope is converted first (`antigravity-hook.js`).
const READ_TOOLS = new Set(["Read", "view_file"]);
const SHELL_TOOLS = new Set([
  "Bash",
  "bash",
  "Shell",
  "shell",
  "local_shell",
  "exec",
  "exec_command",
  "run_command",
  "RunCommand",
]);
const COMPACT_EVENTS = new Set(["PreCompact", "preCompact"]);
const SHELL_WRAPPERS = new Set(["bash", "sh", "zsh"]);

/** A shell command as one string; unwraps an argv `["bash", "-lc", "<cmd>"]`. */
function shellCommand(input) {
  const cmd = input.command ?? input.cmd ?? input.CommandLine;
  if (!Array.isArray(cmd)) return typeof cmd === "string" ? cmd : "";
  const isWrapped =
    cmd.length === 3 &&
    SHELL_WRAPPERS.has(String(cmd[0]).replace(/^.*\//, "")) &&
    /^-l?c$/.test(cmd[1]);
  return isWrapped ? String(cmd[2]) : cmd.join(" ");
}

function intOrUndefined(value) {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isInteger(n) ? n : undefined;
}

// Pure: takes the already-parsed hook payload, returns the advisory text or null. A
// compaction event clears the session's read log and returns null. Never touches
// process.stdin / process.stdout — the driver below owns both.
function bkitReadguard(payload) {
  const sessionId = payload.session_id ?? payload.conversation_id;
  if (COMPACT_EVENTS.has(payload.hook_event_name)) {
    resetReadLog(sessionId);
    return null;
  }
  const tool = payload.tool_name;
  const input = payload.tool_input ?? {};
  const roots = payload.workspace_roots;
  const cwd =
    payload.cwd ??
    input.working_directory ??
    (Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : process.cwd());

  let targets = [];
  if (READ_TOOLS.has(tool)) {
    const file =
      input.file_path ?? input.path ?? input.filePath ?? input.target_file ?? input.AbsolutePath;
    targets = toolReadTarget(
      file,
      cwd,
      intOrUndefined(input.offset ?? input.StartLine),
      intOrUndefined(input.limit),
      intOrUndefined(input.EndLine),
    );
  } else if (SHELL_TOOLS.has(tool)) {
    targets = shellReadTargets(shellCommand(input), cwd);
  }
  return repeatReadAdvice(targets, sessionId, payload.agent_id, cwd);
}
