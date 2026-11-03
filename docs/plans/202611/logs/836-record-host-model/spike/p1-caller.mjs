import { spawnSync } from 'node:child_process';
import { basename } from 'node:path';

const names = ['CLAUDE_CODE_SESSION_ID', 'CODEX_THREAD_ID', 'CODEX_SESSION_ID', 'OPENCODE_SESSION_ID', 'CURSOR_CONVERSATION_ID', 'CURSOR_AGENT_CHAT_ID', 'ANTIGRAVITY_CONVERSATION_ID'];
console.log('environment-presence=' + JSON.stringify(Object.fromEntries(names.map(k => [k, Boolean(process.env[k])]))));
const start = performance.now();
let pid = process.pid;
const chain = [];
for (let hop = 0; hop < 16 && pid > 1; hop++) {
  const remaining = Math.max(1, Math.floor(250 - (performance.now() - start)));
  const result = spawnSync('ps', ['-p', String(pid), '-o', 'ppid=', '-o', 'comm='], { encoding: 'utf8', timeout: remaining });
  if (result.status !== 0 || result.error) {
    console.log('process-probe=' + JSON.stringify({ status: result.status, code: result.error?.code ?? null, stderr: result.stderr?.trim() ?? '' }));
    break;
  }
  const match = result.stdout.trim().match(/^(\d+)\s+(.+)$/);
  if (!match) break;
  chain.push(basename(match[2]));
  pid = Number(match[1]);
  if (performance.now() - start >= 250) break;
}
console.log('executable-chain=' + JSON.stringify(chain));
console.log('receipt-to-command-binding=not-implemented');
