// C1 probe: read the live session host process's own argv (via ps) and report
// which mcp__ccd_* tool names it is launched with, whether the permission-mode
// tool name appears anywhere, and which hook events its --settings JSON wires.
// Usage: node c1-session-args.mjs <pid>
import { execFileSync } from "node:child_process";

const pid = process.argv[2];
const cmd = execFileSync("ps", ["-ww", "-o", "command=", "-p", pid], { encoding: "utf8" });
const names = [...new Set(cmd.match(/mcp__ccd_[a-z_]+__[a-z_]+/g) ?? [])].sort();
console.log(`pid=${pid} argvBytes=${cmd.length}`);
console.log(`ccdToolNamesInArgv=${names.length}`);
for (const n of names) console.log(`  ${n}`);
console.log(`contains 'set_session_permission_mode': ${cmd.includes("set_session_permission_mode")}`);
console.log(`contains 'permission_mode': ${cmd.includes("permission_mode")}`);
const at = cmd.indexOf("--settings ");
if (at < 0) {
  console.log("no --settings argument");
} else {
  const rest = cmd.slice(at + "--settings ".length);
  // The JSON object runs to its matching brace.
  let depth = 0, end = -1, inStr = false, esc = false;
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const settings = JSON.parse(rest.slice(0, end));
  console.log(`settingsKeys=${Object.keys(settings).join(",")}`);
  const hooks = settings.hooks ?? {};
  for (const [event, entries] of Object.entries(hooks)) {
    for (const e of entries) {
      const kinds = (e.hooks ?? []).map((h) => h.type).join("+");
      console.log(`  hook event=${event} matcher=${JSON.stringify(e.matcher ?? null)} types=${kinds}`);
    }
  }
  const perms = settings.permissions ?? {};
  for (const k of Object.keys(perms)) {
    const v = perms[k];
    const hits = Array.isArray(v) ? v.filter((x) => /ccd|permission/i.test(x)) : [];
    console.log(`  permissions.${k}: ${Array.isArray(v) ? v.length + " entries, ccd/permission hits=" + JSON.stringify(hits) : JSON.stringify(v)}`);
  }
}
