// GateGuard plugin for opencode — bkit subagent tool-execution guard.
// Body authored in plan-v4-3 (Task 3.1). This stub satisfies the writeset
// completeness requirement for plan-v4-2's render/round-trip tests.
//
// The full plugin implementation will:
//   - Hook tool.execute.before for all sessions
//   - Distinguish subagent sessions (sessionID → session.parent_id lookup)
//   - Skip advisory for subagent sessions (equivalent to Claude's agent_id exemption)
//   - Block or prompt on destructive operations for orchestrator sessions
//   - Return model-visible text on block (opencode's tool.execute.before can return output)
//
// See: docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md §(d)
// and: .bkit/src/bkit-modules.ts runOpencodeModule

// bkit:start
/** @param {import('@opencode-ai/plugin').PluginInput} input */
export default function plugin(input) {
  return {
    // tool.execute.before hook — placeholder; full implementation in plan-v4-3
  };
}
// bkit:end
