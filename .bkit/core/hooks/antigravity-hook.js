// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
// args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
// Args: `view_file` AbsolutePath / StartLine / EndLine; `run_command` CommandLine / Cwd;
// `write_to_file` / `replace_file_content` TargetFile. Stdout is `{ decision, reason }`,
// and only a `deny`'s reason reaches the model.

/**
 * Antigravity's envelope in the Claude-family shape bkit's shared engines read. A payload
 * already in that shape (a consumer's own matcher, a test) passes through unchanged.
 */
function fromAntigravityPayload(payload) {
  if (!payload || typeof payload !== "object" || !payload.toolCall) return payload;
  const args =
    payload.toolCall.args && typeof payload.toolCall.args === "object" ? payload.toolCall.args : {};
  const roots = payload.workspacePaths;
  const root = Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : undefined;
  return {
    tool_name: payload.toolCall.name,
    tool_input: args,
    session_id: payload.conversationId,
    cwd: typeof args.Cwd === "string" ? args.Cwd : root,
    workspace_roots: Array.isArray(roots) ? roots : [],
  };
}

// Model-written labels that differ between two otherwise identical calls.
const AG_LABEL_ARGS = new Set(["toolAction", "toolSummary", "Description", "Instruction"]);

/** The call's identity: tool name plus its arguments, labels dropped, keys sorted. */
function agCallSignature(toolName, input) {
  const args = input && typeof input === "object" ? input : {};
  const kept = Object.keys(args)
    .filter((k) => !AG_LABEL_ARGS.has(k))
    .sort()
    .map((k) => [k, args[k]]);
  return JSON.stringify([toolName, kept]);
}

// One record per (hook, conversation): two hooks on the same call each let its retry through.
// Per user: on a temp dir users share (Linux `/tmp`) another user's copy cannot be written.
function agRetryFile(hook, sessionId) {
  const safe =
    typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
  const user = typeof process.getuid === "function" ? `-${process.getuid()}` : "";
  return path.join(
    os.tmpdir(),
    `bkit-antigravity-retry${user}`,
    `${hook}.${safe || "no-session"}.json`,
  );
}

/**
 * Delivers an advisory the only way Antigravity shows one to the model: deny the call
 * with the advisory as the reason, once. The identical call right after is the agent's
 * retry and is allowed. Fail-open: a retry-store error allows the call — each call is
 * its own process, so a deny it cannot record would block every retry.
 */
function adviseOnce(hook, sessionId, signature, advisory) {
  const file = agRetryFile(hook, sessionId);
  // One-way digest of the call signature: the retry store is world-readable and has no
  // TTL, so no tool argument (a shell command line with an inline secret, a file path)
  // may rest on disk in cleartext.
  const digest = crypto.createHash("sha256").update(signature).digest("hex");
  try {
    const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
    if (last === digest) {
      fs.rmSync(file, { force: true });
      return { decision: "allow" };
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, digest, "utf-8");
  } catch {
    return { decision: "allow" };
  }
  return {
    decision: "deny",
    reason: `${advisory}\nThis call was held once so you see this advisory. Repeat the same call to proceed.`,
  };
}
