// Edit / Write / MultiEdit / NotebookEdit / Delete payload adapter, shared by the Claude Code
// and Cursor hooks: `{ tool_name, tool_input: { file_path | path | notebook_path }, session_id,
// cwd }`. `NotebookEdit` (Claude) names its target `notebook_path`; `Delete` (Cursor) uses
// `file_path`.
const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit", "Delete"]);

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
// Subagents are NOT exempt: dedup is per (session, agent, file). A Claude Code subagent
// shares its parent's session_id and carries its own agent_id, so it gets the checklist
// once for a file the orchestrator already touched.
function bkitGateguard(payload) {
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path || input.notebook_path;
  // A Write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile =
    payload.tool_name === "Write" && typeof filePath === "string" && !fs.existsSync(filePath);
  const cwd = typeof payload.cwd === "string" ? payload.cwd : undefined;
  return firstTouchAdvice(filePath, dedupKey(payload.session_id, payload.agent_id), isNewFile, cwd);
}
