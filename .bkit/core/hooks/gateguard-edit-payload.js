// Edit / Write / MultiEdit payload adapter, shared by the Claude Code and Cursor hooks:
// `{ tool_name, tool_input: { file_path | path }, session_id }`.
const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
// Subagents are NOT exempt: dedup is per (session, file) and a subagent carries its
// own session id, so it gets the checklist once for a file the orchestrator already
// touched.
function bkitGateguard(payload) {
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path;
  // A Write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile =
    payload.tool_name === "Write" && typeof filePath === "string" && !fs.existsSync(filePath);
  return firstTouchAdvice(filePath, payload.session_id, isNewFile);
}
