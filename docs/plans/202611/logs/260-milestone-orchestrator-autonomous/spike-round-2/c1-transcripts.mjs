// C1 probe: scan local Claude Code session transcripts for runtime evidence of
// (a) the exact names of mcp__ccd_* tools the model actually called,
// (b) any tool name containing "permission_mode" that was called or offered,
// (c) PreToolUse hook records whose tool is an mcp__ccd_* tool.
// Reads only; prints counts and names, never message text.
// Usage: node c1-transcripts.mjs <dir>...
import { createReadStream, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

const called = new Map(); // name -> count
const offered = new Map(); // name -> files count (names seen in any non-tool_use text)
const hookRecords = new Map(); // `${event}|${tool}|${kind}` -> count
const hookKeysSeen = new Map();
let files = 0, lines = 0, bad = 0;

function walk(dir, out) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (e.endsWith(".jsonl")) out.push(p);
  }
  return out;
}

function visit(v, f) {
  if (Array.isArray(v)) { for (const x of v) visit(x, f); return; }
  if (v && typeof v === "object") { f(v); for (const x of Object.values(v)) visit(x, f); }
}

const all = process.argv.slice(2).flatMap((d) => walk(d, []));
for (const file of all) {
  files++;
  const seenHere = new Set();
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  for await (const line of rl) {
    lines++;
    for (const m of line.matchAll(/mcp__ccd_session_mgmt__[a-z_]+|mcp__ccd_[a-z_]+__[a-z_]*permission[a-z_]*/g)) seenHere.add(m[0]);
    let row;
    try { row = JSON.parse(line); } catch { bad++; continue; }
    visit(row, (o) => {
      if (o.type === "tool_use" && typeof o.name === "string" && o.name.startsWith("mcp__ccd_")) {
        called.set(o.name, (called.get(o.name) ?? 0) + 1);
      }
      const ev = o.hookEvent ?? o.hook_event_name ?? o.hookEventName;
      if (typeof ev === "string") {
        const tool = o.toolName ?? o.tool_name ?? o.hookName ?? "";
        const kind = o.type ?? "";
        hookKeysSeen.set(`${ev}|${kind}`, (hookKeysSeen.get(`${ev}|${kind}`) ?? 0) + 1);
        if (typeof tool === "string" && tool.includes("ccd_")) {
          const k = `${ev}|${tool}|${kind}`;
          hookRecords.set(k, (hookRecords.get(k) ?? 0) + 1);
        }
      }
    });
  }
  for (const n of seenHere) offered.set(n, (offered.get(n) ?? 0) + 1);
}

console.log(`files=${files} lines=${lines} unparsable=${bad}`);
console.log("tool_use calls to mcp__ccd_* (name -> calls):");
for (const [k, v] of [...called].sort()) console.log(`  ${k} ${v}`);
console.log("mcp__ccd_session_mgmt__* / *permission* names seen anywhere (name -> files):");
for (const [k, v] of [...offered].sort()) console.log(`  ${k} ${v}`);
console.log("hook records by event|type (all tools):");
for (const [k, v] of [...hookKeysSeen].sort()) console.log(`  ${k} ${v}`);
console.log("hook records naming an mcp__ccd_* tool (event|tool|type -> count):");
if (hookRecords.size === 0) console.log("  none");
for (const [k, v] of [...hookRecords].sort()) console.log(`  ${k} ${v}`);
