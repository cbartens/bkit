// C1 probe: in transcripts, find deferred_tools_delta attachments (the tool
// list the host offers the model) that add mcp__ccd_session_mgmt__* names, and
// report the exact names offered, how many sessions, first/last timestamp and
// the CLI versions on those rows. Also reports removals of the permission tool.
// Usage: node c1-names.mjs <dir>...
import { createReadStream, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

const TARGET = "mcp__ccd_session_mgmt__set_session_permission_mode";
const walk = (d, out) => { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) walk(p, out); else if (e.endsWith(".jsonl")) out.push(p); } return out; };
let sessionsOffered = 0, rowsAdded = 0, rowsRemoved = 0, first = null, last = null;
const versions = new Map();
const mgmtNames = new Set();
for (const file of process.argv.slice(2).flatMap((d) => walk(d, []))) {
  let hit = false;
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.includes("deferred_tools_delta")) continue;
    let o; try { o = JSON.parse(line); } catch { continue; }
    const a = o.attachment;
    if (!a || a.type !== "deferred_tools_delta") continue;
    for (const n of a.addedNames ?? []) if (n.startsWith("mcp__ccd_session_mgmt__")) mgmtNames.add(n);
    if ((a.addedNames ?? []).includes(TARGET) || (a.readdedNames ?? []).includes(TARGET)) {
      rowsAdded++; hit = true;
      const t = o.timestamp; if (t) { if (!first || t < first) first = t; if (!last || t > last) last = t; }
      versions.set(o.version, (versions.get(o.version) ?? 0) + 1);
    }
    if ((a.removedNames ?? []).includes(TARGET)) rowsRemoved++;
  }
  if (hit) sessionsOffered++;
}
console.log(`target=${TARGET}`);
console.log(`transcriptFilesOfferingIt=${sessionsOffered} deltaRowsAddingIt=${rowsAdded} deltaRowsRemovingIt=${rowsRemoved}`);
console.log(`firstSeen=${first} lastSeen=${last}`);
console.log(`cliVersionsOnThoseRows=${[...versions].map(([v, c]) => `${v}:${c}`).join(" ")}`);
console.log(`allSessionMgmtNamesOffered=${[...mgmtNames].sort().join(" ")}`);
