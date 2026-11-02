import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ownFile = fileURLToPath(import.meta.url);
const hosts = ["codex", "cursor", "claude", "antigravity", "opencode"];
const sizes = [1200, 8000, 12000, 32000];
const quote = (text) => `'${text.replaceAll("'", "'\\''")}'`;
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
const manifest = (root) => read(path.join(root, "manifest.json"));
const statePath = (root, id) => path.join(root, ".evidence", `${id}.json`);
const targetPath = (root, id) => path.join(root, "targets", `${id}.txt`);
const targetValue = (root, id) => fs.readFileSync(targetPath(root, id), "utf8").trim();

function caseFor(root, id) {
  const found = manifest(root).cases.find((entry) => entry.id === id);
  if (!found) throw new Error("Unknown case id");
  return found;
}

function log(root, event) {
  fs.appendFileSync(path.join(root, ".evidence/events.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...event }) + "\n");
}

function message(id, size, tokens) {
  const opening = `Synthetic authoring-advisory experiment, case ${id}. Acknowledge immediately when you receive this message, even if the pending edit already ran. Use one separate shell call: node probe.mjs ack ${id} BEGIN MIDDLE END, replacing those arguments with the marker values below. Use missing for any marker you cannot see. Do not read files or spilled output to recover missing markers. Do not undo or delay an edit to improve the result.\nPROBE_BEGIN=${tokens[0]}\n`;
  const middle = `\nPROBE_MIDDLE=${tokens[1]}\n`;
  const end = `\nPROBE_END=${tokens[2]}\nEnd of synthetic advisory. Acknowledge now, then continue the case list.\n`;
  const filler = "Synthetic test padding, no additional instructions. ";
  const remaining = size - opening.length - middle.length - end.length;
  if (remaining < 0) throw new Error("Advisory size too small");
  const padding = (length) => filler.repeat(Math.ceil(length / filler.length)).slice(0, length);
  const left = Math.floor(remaining / 2);
  return opening + padding(left) + middle + padding(remaining - left) + end;
}

function response(host, variant, context, deny = false) {
  if (host === "cursor") {
    return variant === "edit-legacy"
      ? { permission: "allow", additional_context: context }
      : { permission: "allow", agent_message: context };
  }
  if (host === "antigravity") return { decision: deny ? "deny" : "allow", reason: context };
  return { hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: context } };
}

// The hook records selected metadata, never a raw command, tool payload or environment.
export function observe(root, stage, payload) {
  const config = manifest(root);
  const tool = String(payload.tool_name || payload.toolCall?.name || payload.tool || (payload.command ? "Shell" : "unknown"));
  const safeTool = /^[\w.:-]{1,100}$/.test(tool) ? tool : "unrecognized-tool-name";
  log(root, { event: "hook-invoked", stage, tool: safeTool });
  const activePath = path.join(root, ".evidence/active.json");
  if (!fs.existsSync(activePath)) return null;
  const current = caseFor(root, read(activePath).id);
  const input = payload.tool_input ?? payload.toolCall?.args ?? payload.input ?? payload;
  const shell = /^(Bash|Shell|shell|bash|exec_command|run_command)$/.test(tool);
  const edit = /^(Edit|Write|MultiEdit|NotebookEdit|Delete|apply_patch|edit|write|patch|write_to_file|replace_file_content|multi_replace_file_content)$/.test(tool);
  if (current.channel === "shell" ? !shell : !edit) return null;
  if (!JSON.stringify(input).includes(`${current.id}.txt`)) return null;
  if (shell && !/(?:>|writeFile|write_text)/.test(JSON.stringify(input))) return null;
  const file = statePath(root, current.id);
  let state = fs.existsSync(file) ? read(file) : { id: current.id, emissions: [], acknowledgements: [] };
  if (stage === "pre") {
    state.preHookObserved = true;
    state.tool = safeTool;
    state.targetAtHook = targetValue(root, current.id);
    write(file, state);
    if (config.host === "opencode") return null;
  }
  if (config.host !== "opencode" && stage !== "pre") return null;
  if (state.emissions.length) return null;
  const tokens = Array.from({ length: 3 }, () => crypto.randomBytes(12).toString("hex"));
  const context = message(current.id, current.chars, tokens);
  const deny = config.host === "antigravity" && !current.variant.endsWith("allow");
  state.tokens = tokens;
  state.emissions.push({ stage, chars: context.length, bytes: Buffer.byteLength(context), target: targetValue(root, current.id), denyOnce: deny });
  write(file, state);
  log(root, { event: "advisory-emitted", id: current.id, stage, chars: context.length, denyOnce: deny });
  return { context, output: response(config.host, current.variant, context, deny) };
}

function acknowledge(root, id, values) {
  caseFor(root, id);
  if (values.length !== 3) throw new Error("ack requires BEGIN MIDDLE END; use missing for unavailable markers");
  const file = statePath(root, id);
  if (!fs.existsSync(file) || !read(file).tokens) throw new Error("No emitted challenge for this case");
  const state = read(file);
  const matches = state.tokens.map((token, i) => token === values[i]);
  state.acknowledgements.push({ at: new Date().toISOString(), matches, target: targetValue(root, id) });
  write(file, state);
  log(root, { event: "acknowledgement", id, matches, target: targetValue(root, id) });
  console.log("Acknowledgement recorded. Continue without inspecting the evidence.");
}

function report(root) {
  const config = manifest(root);
  const eventsFile = path.join(root, ".evidence/events.jsonl");
  const events = fs.existsSync(eventsFile) ? fs.readFileSync(eventsFile, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse) : [];
  const result = {
    schema: 1,
    host: config.host,
    generatedAt: new Date().toISOString(),
    metadata: fs.existsSync(path.join(root, "metadata.json")) ? read(path.join(root, "metadata.json")) : { version: "unrecorded", model: "unrecorded", client: "unrecorded" },
    hookInvocations: events.filter((event) => event.event === "hook-invoked").length,
    toolsObserved: [...new Set(events.filter((event) => event.tool).map((event) => event.tool))],
    limits: "Synthetic transport probe only. Missing acknowledgement is inconclusive. Correct markers evidence sampled visibility, not every byte. No transcript-based timing proof or production detector/upgrade verification. One host/client/model/version per run.",
    cases: config.cases.map((entry) => {
      const file = statePath(root, entry.id);
      const state = fs.existsSync(file) ? read(file) : {};
      const ack = state.acknowledgements?.find((item) => item.matches.some(Boolean));
      const complete = state.acknowledgements?.some((item) => item.matches.every(Boolean));
      const emitted = state.emissions?.[0];
      return {
        ...entry,
        edited: targetValue(root, entry.id) === "AFTER",
        preHookObserved: state.preHookObserved === true,
        deliveryStage: emitted?.stage ?? "none",
        emittedChars: emitted?.chars ?? 0,
        emittedBytes: emitted?.bytes ?? 0,
        denyOnce: emitted?.denyOnce ?? false,
        timing: !state.preHookObserved && !emitted ? "NO_HOOK_OBSERVED" : !ack ? "UNVERIFIED_NO_VALID_ACK" : ack.target === "BEFORE" ? (emitted.stage === "after" ? "ACK_AFTER_TOOL_NO_EDIT" : "ACK_BEFORE_EDIT") : ack.target === "AFTER" ? "ACK_AFTER_EDIT" : "UNVERIFIED_TARGET_STATE",
        visibility: complete ? "ALL_THREE_MARKERS_ACKNOWLEDGED" : ack ? "PARTIAL_MARKERS_ACKNOWLEDGED" : "UNVERIFIED_NO_VALID_ACK",
        firstAcknowledgementMatches: ack?.matches ?? null,
      };
    }),
  };
  write(path.join(root, "results.json"), result);
  console.log(JSON.stringify(result, null, 2));
}

function setup(host, destination) {
  if (!hosts.includes(host)) throw new Error(`Host must be one of: ${hosts.join(", ")}`);
  if (!destination) throw new Error("Provide a new empty destination path");
  const root = path.resolve(destination);
  if (fs.existsSync(root)) throw new Error("Destination already exists; use a fresh directory for each run");
  fs.mkdirSync(root, { recursive: true });
  const init = spawnSync("git", ["-c", "init.templateDir=", "init", "--quiet", root], { encoding: "utf8" });
  if (init.status !== 0) throw new Error("Could not initialize the isolated scratch Git root; use a new destination after checking local permissions");
  const put = (name, value) => {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n");
  };
  fs.mkdirSync(path.join(root, ".evidence"));
  fs.copyFileSync(ownFile, path.join(root, "probe.mjs"));
  const variants = host === "cursor" ? ["edit", "edit-legacy", "shell"] : host === "antigravity" ? ["edit", "edit-allow", "shell", "shell-allow"] : ["edit", "shell"];
  const cases = variants.flatMap(variant => sizes.map(chars => ({ id: `${variant}-${chars}`, variant, channel: variant.startsWith("edit") ? "edit" : "shell", chars })));
  put("manifest.json", { host, cases });
  put("package.json", { private: true, type: "module" });
  for (const entry of cases) put(`targets/${entry.id}.txt`, "BEFORE\n");
  const cmd = `${quote(process.execPath)} ${quote(path.join(root, "probe.mjs"))} hook pre`;
  const matcher = host === "codex" ? "apply_patch|Bash" : "Edit|Write|MultiEdit|NotebookEdit|Bash";
  const handlers = [{ matcher, hooks: [{ type: "command", command: cmd, timeout: 10 }] }];
  if (host === "codex") { put(".codex/config.toml", "# Project-local layer for the synthetic hook test.\n"); put(".codex/hooks.json", { hooks: { PreToolUse: handlers } }); }
  if (host === "claude") put(".claude/settings.json", { hooks: { PreToolUse: handlers } });
  if (host === "cursor") put(".cursor/hooks.json", { version: 1, hooks: { preToolUse: [{ matcher: "Write|Delete", command: cmd }], beforeShellExecution: [{ command: cmd }] } });
  if (host === "antigravity") put(".agents/hooks.json", { "authoring-probe": { PreToolUse: [{ matcher: "write_to_file|replace_file_content|multi_replace_file_content|run_command", hooks: [{ type: "command", command: cmd, timeout: 10 }] }] } });
  if (host === "opencode") {
    put(".opencode/plugins/authoring-probe/index.mjs", `import { observe } from "../../../probe.mjs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../../", import.meta.url));
export default {
  id: "authoring-probe",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (e) => { observe(root, "pre", e); });
    await ctx.tool.hook("execute.after", (e) => {
      if (e.status !== "completed" || !e.result) return;
      const advice = observe(root, "after", e);
      if (advice) e.result.content = [...(Array.isArray(e.result.content) ? e.result.content : []), { type: "text", text: advice.context }];
    });
  },
  async server() {
    return {
      "tool.execute.before": async (input, output) => { observe(root, "pre", { tool: input.tool, input: output.args }); },
      "tool.execute.after": async (input, output) => {
        const advice = observe(root, "after", { tool: input.tool, input: input.args ?? output.args });
        if (advice) output.output = (output.output || "") + "\\n" + advice.context;
      }
    };
  }
};\n`);
    // V2 plugin directory; V1 loads the same export through an explicit local path.
    put("opencode.json", { plugin: ["./.opencode/plugins/authoring-probe/index.mjs"] });
  }
  put("RUN.md", runInstructions(host, cases));
  put("AGENTS.md", "# Synthetic hook test workspace\n\nFollow RUN.md for the owner-authorized experiment. Change only generated target files through the requested tools. Run the probe CLI only as RUN.md directs. Do not inspect .evidence, hook configuration, probe source or spilled hook output while the test runs. Do not repair hooks or bypass host trust. No dependencies, credentials, external services or production files are needed.\n");
  console.log(`Created ${root}\nOpen this folder as a fresh trusted workspace in ${host}. Review/enable its project hooks normally, then start a new chat and ask: Read RUN.md and carry out this synthetic hook experiment. Return results.json.\nDo not launch the test agent in the parent repository.`);
}

function runInstructions(host, cases) {
  return `# Synthetic authoring-hook experiment\n\nThis is a user-requested transport test in a disposable workspace for ${host}. It does not implement or validate production GateGuard detection.\n\n## Setup\n\nUse the host's normal project/hook trust review. Start a fresh session after hooks are enabled. Codex requires the project layer AND the exact hook definition to be trusted; inspect /hooks. Cursor requires a trusted workspace. Claude can inspect /hooks. Antigravity uses .agents/hooks.json and its Hooks settings or /hooks. OpenCode uses a local plugin; if it fails to load, report that rather than installing or changing it. Never bypass trust or add credentials.\n\nRecord the actual client (desktop/IDE/CLI), version and model with: node probe.mjs metadata VERSION MODEL CLIENT. Use unknown for a value you cannot establish; do not invent it. You may run a host --version command if available.\n\n## Procedure\n\nRun every case below sequentially. Use separate tool calls, never parallel or a single batch. Before a case, run node probe.mjs arm CASE. Then change only targets/CASE.txt from BEFORE to AFTER followed by a newline. An edit case must use a native file edit tool, not a terminal script. A shell case must use a direct shell command such as printf 'AFTER\\n' > targets/CASE.txt. Do not rename, reset, pre-edit or recreate targets. If a requested tool is unavailable, leave that target unchanged and continue.\n\nIf a hook delivers a synthetic advisory, follow its acknowledgement instruction immediately, even if the edit already happened. Supply only marker values visible in the message. Use missing for unavailable markers. Do not read .evidence, probe.mjs, hook configuration, a transcript, results.json or any spilled hook-output file to obtain markers. Do not guess them. Missing acknowledgement is an inconclusive observation, not a pass.\n\nAntigravity's default cases exercise its existing deny-once delivery: acknowledge the reason, then retry the same edit once. Its -allow cases test allow/reason without denial. Cursor edit cases test agent_message on allow; edit-legacy tests the existing additional_context envelope. Both are experiments, not promises of support. OpenCode is an explicit after-execution control; it must never count as before-edit delivery. Other hosts remain advisory-only. If another policy blocks a call, do not bypass it.\n\n${cases.map(entry => `- ${entry.id}: ${entry.channel === "edit" ? "native edit tool" : "direct shell redirection"}; ${entry.chars} characters.`).join("\n")}\n\nAfter all cases, run node probe.mjs report. Return the generated results.json and briefly name any unavailable tool, hook loading error or external interference. No code fixes, retries of the whole experiment, commits or pushes. Reported marker positions sample visibility; they do not prove every byte arrived or establish an exact token threshold. For precise timeline interpretation, retain the chat locally; do not export unrelated history.\n`;
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const root = path.dirname(ownFile);
  if (command === "setup") return setup(args[0], args[1]);
  if (command === "hook") {
    const payload = JSON.parse(fs.readFileSync(0, "utf8"));
    const advice = observe(root, args[0], payload);
    process.stdout.write(JSON.stringify(advice?.output ?? response(manifest(root).host, "", "")));
    return;
  }
  if (command === "arm") {
    caseFor(root, args[0]);
    if (targetValue(root, args[0]) !== "BEFORE" || fs.existsSync(statePath(root, args[0]))) throw new Error("Case already attempted; create a fresh workspace to repeat it");
    write(path.join(root, ".evidence/active.json"), { id: args[0] });
    console.log(`Armed ${args[0]}. Make the requested single edit now.`);
    return;
  }
  if (command === "ack") return acknowledge(root, args[0], args.slice(1));
  if (command === "metadata") {
    if (args.length !== 3 || args.some(value => value.length > 200)) throw new Error("metadata requires version, model and client (at most 200 characters each)");
    write(path.join(root, "metadata.json"), { version: args[0], model: args[1], client: args[2] });
    return;
  }
  if (command === "report") return report(root);
  throw new Error("Usage: node host-kit.mjs setup HOST NEW_DIRECTORY; inside generated workspace: node probe.mjs arm|ack|metadata|report");
}

if (process.argv[1] && path.resolve(process.argv[1]) === ownFile) {
  try { main(); } catch (error) {
    console.error(`[authoring-probe] ${error.message}`);
    process.exitCode = 1;
  }
}
