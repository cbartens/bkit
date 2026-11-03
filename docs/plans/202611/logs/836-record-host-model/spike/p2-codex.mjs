import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const id = process.env.CODEX_THREAD_ID;
console.log('thread-id-present=' + Boolean(id));
if (!id) process.exit(0);
const root = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'sessions');
let examined = 0;
const hits = [];
function visit(dir, depth) {
  if (depth > 4 || examined >= 10000 || !existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (++examined > 10000) break;
    const file = join(dir, entry.name);
    if (entry.isDirectory()) visit(file, depth + 1);
    else if (entry.name.endsWith(`-${id}.jsonl`)) hits.push(file);
  }
}
visit(root, 0);
console.log('matching-rollouts=' + hits.length);
for (const file of hits) {
  const rows = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
  const meta = rows.find(r => r.type === 'session_meta')?.payload;
  const models = [...new Set(rows.filter(r => r.type === 'turn_context').map(r => r.payload?.model).filter(Boolean))];
  const responses = rows.filter(r => r.type === 'response_item' && r.payload?.role === 'assistant');
  const childKeys = meta?.source && typeof meta.source === 'object' ? Object.keys(meta.source) : [];
  const subagent = meta?.source?.subagent;
  console.log('child-link-keys=' + JSON.stringify(subagent && typeof subagent === 'object' ? Object.fromEntries(Object.entries(subagent).map(([k,v]) => [k, v && typeof v === 'object' ? Object.keys(v) : typeof v])) : []));
  console.log('rollout-evidence=' + JSON.stringify({ nativeIdEqualsMetadata: meta?.id === id, turnContextModels: models, assistantResponseCount: responses.length, assistantResponsesWithModel: responses.filter(r => typeof r.payload?.model === 'string').length, sourceKind: typeof meta?.source === 'string' ? meta.source : 'object', sourceKeys: childKeys, timestampedResponses: responses.filter(r => typeof r.timestamp === 'string').length }));
}
