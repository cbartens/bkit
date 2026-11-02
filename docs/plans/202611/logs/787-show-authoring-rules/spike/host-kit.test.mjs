import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const source = path.join(path.dirname(fileURLToPath(import.meta.url)), "host-kit.mjs");
const scratch = fs.mkdtempSync(path.resolve("tmp/host-kit-test-"));
test.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
function run(file, args, cwd, input) {
  return spawnSync(process.execPath, [file, ...args], { cwd, input, encoding: "utf8" });
}
function setup(host, name) {
  const root = path.join(scratch, name);
  const result = run(source, ["setup", host, root], process.cwd());
  assert.equal(result.status, 0, result.stderr);
  return { root, file: path.join(root, "probe.mjs") };
}
function invoke(p, args, input) {
  const result = run(p.file, args, p.root, input && JSON.stringify(input));
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
function emitted(p, id, event = "pre") {
  return invoke(p, ["hook", event], { tool_name: "apply_patch", tool_input: { patch: `*** Update File: targets/${id}.txt` } });
}
function report(p) { return JSON.parse(invoke(p, ["report"])); }

test("generates isolated workspaces for five hosts and refuses an existing destination", () => {
  for (const host of ["codex", "cursor", "claude", "antigravity", "opencode"]) {
    const p = setup(host, host);
    assert.ok(fs.existsSync(path.join(p.root, "RUN.md")));
    const gitRoot = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd: p.root, encoding: "utf8" });
    assert.equal(gitRoot.status, 0, gitRoot.stderr);
    assert.equal(gitRoot.stdout.trim(), p.root);
    assert.equal(report(p).cases.length >= 8, true);
    const retry = run(source, ["setup", host, p.root], process.cwd());
    assert.notEqual(retry.status, 0);
  }
});

test("reports an edited sentinel with no hook as unverified, never as before-edit delivery", () => {
  const p = setup("codex", "no-hook");
  fs.writeFileSync(path.join(p.root, "targets/edit-1200.txt"), "AFTER\n");
  const row = report(p).cases.find(x => x.id === "edit-1200");
  assert.equal(row.timing, "NO_HOOK_OBSERVED");
  assert.equal(row.edited, true);
});

test("distinguishes acknowledgements before and after editing using fresh challenge tokens", () => {
  for (const before of [true, false]) {
    const p = setup("codex", `timing-${before}`);
    invoke(p, ["arm", "edit-1200"]);
    const response = JSON.parse(emitted(p, "edit-1200"));
    const text = response.hookSpecificOutput.additionalContext;
    const tokens = [...text.matchAll(/PROBE_(?:BEGIN|MIDDLE|END)=([a-f0-9]+)/g)].map(x => x[1]);
    assert.equal(tokens.length, 3);
    if (!before) fs.writeFileSync(path.join(p.root, "targets/edit-1200.txt"), "AFTER\n");
    invoke(p, ["ack", "edit-1200", ...tokens]);
    fs.writeFileSync(path.join(p.root, "targets/edit-1200.txt"), "AFTER\n");
    const row = report(p).cases.find(x => x.id === "edit-1200");
    assert.equal(row.timing, before ? "ACK_BEFORE_EDIT" : "ACK_AFTER_EDIT");
    assert.equal(row.visibility, "ALL_THREE_MARKERS_ACKNOWLEDGED");
  }
});

test("missing and incorrect tokens cannot prove full visibility; report does not disclose tokens", () => {
  const p = setup("codex", "partial");
  invoke(p, ["arm", "edit-32000"]);
  const text = JSON.parse(emitted(p, "edit-32000")).hookSpecificOutput.additionalContext;
  assert.equal(text.length, 32000);
  const token = text.match(/PROBE_BEGIN=([a-f0-9]+)/)[1];
  invoke(p, ["ack", "edit-32000", token, "missing", "wrong"]);
  const output = invoke(p, ["report"]);
  const row = JSON.parse(output).cases.find(x => x.id === "edit-32000");
  assert.equal(row.visibility, "PARTIAL_MARKERS_ACKNOWLEDGED");
  assert.equal(output.includes(token), false);
});

test("read tools and unrelated writes cannot trigger the armed edit challenge", () => {
  const p = setup("codex", "filter");
  invoke(p, ["arm", "edit-1200"]);
  invoke(p, ["hook", "pre"], { tool_name: "Read", tool_input: { file_path: "targets/edit-1200.txt" } });
  invoke(p, ["hook", "pre"], { tool_name: "apply_patch", tool_input: { patch: "*** Update File: other.txt" } });
  assert.equal(report(p).cases.find(x => x.id === "edit-1200").timing, "NO_HOOK_OBSERVED");
});

test("post-execution control stays after-execution even if acknowledgement is observed", async () => {
  const p = setup("opencode", "post");
  const plugin = (await import(path.join(p.root, ".opencode/plugins/authoring-probe/index.mjs"))).default;
  const hooks = {};
  await plugin.setup({ app: { version: "test-fixture" }, tool: { hook: async (name, fn) => { hooks[name] = fn; } } });
  invoke(p, ["arm", "edit-1200"]);
  const event = { tool: "edit", input: { filePath: path.join(p.root, "targets/edit-1200.txt") } };
  await hooks["execute.before"](event);
  fs.writeFileSync(path.join(p.root, "targets/edit-1200.txt"), "AFTER\n");
  event.status = "completed";
  event.result = { content: [] };
  await hooks["execute.after"](event);
  const text = event.result.content[0].text;
  const tokens = [...text.matchAll(/PROBE_(?:BEGIN|MIDDLE|END)=([a-f0-9]+)/g)].map(x => x[1]);
  invoke(p, ["ack", "edit-1200", ...tokens]);
  const row = report(p).cases.find(x => x.id === "edit-1200");
  assert.equal(row.deliveryStage, "after");
  assert.equal(row.timing, "ACK_AFTER_EDIT");
});

test("Antigravity accepts its camelCase payload and denies only the first default invocation", () => {
  const p = setup("antigravity", "antigravity-envelope");
  invoke(p, ["arm", "edit-1200"]);
  const input = { toolCall: { name: "replace_file_content", args: { TargetFile: path.join(p.root, "targets/edit-1200.txt") } } };
  const first = JSON.parse(invoke(p, ["hook", "pre"], input));
  assert.equal(first.decision, "deny");
  assert.match(first.reason, /PROBE_END=/);
  assert.equal(JSON.parse(invoke(p, ["hook", "pre"], input)).decision, "allow");
  invoke(p, ["arm", "edit-allow-1200"]);
  input.toolCall.args.TargetFile = path.join(p.root, "targets/edit-allow-1200.txt");
  const allow = JSON.parse(invoke(p, ["hook", "pre"], input));
  assert.equal(allow.decision, "allow");
  assert.match(allow.reason, /PROBE_END=/);
});

test("Cursor tests the legacy edit envelope separately from its shell envelope", () => {
  const p = setup("cursor", "cursor-envelope");
  invoke(p, ["arm", "edit-legacy-1200"]);
  const edit = JSON.parse(invoke(p, ["hook", "pre"], { tool_name: "Write", tool_input: { file_path: "targets/edit-legacy-1200.txt" } }));
  assert.match(edit.additional_context, /PROBE_END=/);
  assert.equal(edit.permission, "allow");
  invoke(p, ["arm", "shell-1200"]);
  const shell = JSON.parse(invoke(p, ["hook", "pre"], { command: "printf 'AFTER\\n' > targets/shell-1200.txt" }));
  assert.match(shell.agent_message, /PROBE_END=/);
  assert.equal(shell.permission, "allow");
});

test("an after-execution acknowledgement with an unchanged sentinel never proves before-edit delivery", () => {
  const p = setup("opencode", "post-noop");
  invoke(p, ["arm", "edit-1200"]);
  const response = JSON.parse(emitted(p, "edit-1200", "after"));
  const text = response.hookSpecificOutput.additionalContext;
  const tokens = [...text.matchAll(/PROBE_(?:BEGIN|MIDDLE|END)=([a-f0-9]+)/g)].map(x => x[1]);
  invoke(p, ["ack", "edit-1200", ...tokens]);
  const row = report(p).cases.find(x => x.id === "edit-1200");
  assert.equal(row.edited, false);
  assert.equal(row.timing, "ACK_AFTER_TOOL_NO_EDIT");
});
