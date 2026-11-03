import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const here = dirname(fileURLToPath(import.meta.url));
const scratch = join(here, '.p3-scratch');
if (process.argv[2] === 'writer') {
  const db = new DatabaseSync(process.argv[3]);
  for (let i = 1; i <= 100; i++) {
    db.exec(`BEGIN; UPDATE evidence SET generation=${i}; COMMIT;`);
    db.exec('PRAGMA wal_checkpoint(PASSIVE)');
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  db.close();
  process.exit(0);
}
mkdirSync(scratch, { recursive: true });
const sourceDir = join(scratch, 'source');
const absentDir = join(scratch, 'absent');
mkdirSync(sourceDir);
mkdirSync(absentDir);
const source = join(sourceDir, 'host.db');
const writer = new DatabaseSync(source);
writer.exec('PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; CREATE TABLE evidence(id INTEGER PRIMARY KEY, generation INTEGER); INSERT INTO evidence VALUES (1,7),(2,7);');
function footprint(dir) {
  return Object.fromEntries(readdirSync(dir).sort().map(name => [name, createHash('sha256').update(readFileSync(join(dir,name))).digest('hex')]));
}
function changed(a,b) { return [...new Set([...Object.keys(a),...Object.keys(b)])].filter(k => a[k] !== b[k]); }
async function readSnapshot(file, label) {
  const target = join(scratch, label + '.db');
  const db = new DatabaseSync(file, { readOnly: true });
  await backup(db, target, { rate: 1 });
  db.close();
  const result = new DatabaseSync(target, { readOnly: true });
  const row = result.prepare('SELECT count(*) AS n,min(generation) AS lo,max(generation) AS hi FROM evidence').get();
  const integrity = result.prepare('PRAGMA integrity_check').get().integrity_check;
  result.close();
  return { ...row, integrity };
}
try {
  const before = footprint(sourceDir);
  const snapshot = await readSnapshot(source, 'existing-shm');
  const after = footprint(sourceDir);
  console.log('existing-sidecars=' + JSON.stringify({ snapshot, changedSourceFiles: changed(before,after) }));
  copyFileSync(source, join(absentDir, 'host.db'));
  copyFileSync(source + '-wal', join(absentDir, 'host.db-wal'));
  const absentBefore = footprint(absentDir);
  const absentSnapshot = await readSnapshot(join(absentDir, 'host.db'), 'absent-shm');
  const absentAfter = footprint(absentDir);
  console.log('absent-shm=' + JSON.stringify({ snapshot: absentSnapshot, changedSourceFiles: changed(absentBefore,absentAfter), createdShm: existsSync(join(absentDir,'host.db-shm')) }));
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'writer', source], { stdio: ['ignore','pipe','pipe'] });
  let childErr = '';
  child.stderr.on('data', bytes => { childErr += bytes; });
  const childDone = once(child, 'close');
  const samples = [];
  for (let i = 0; i < 10; i++) samples.push(await readSnapshot(source, 'concurrent-' + i));
  const [exit] = await childDone;
  console.log('concurrent-backups=' + JSON.stringify({ samples: samples.length, coherent: samples.every(r => r.n === 2 && r.lo === r.hi && r.integrity === 'ok'), writerExit: exit, writerStderrEmpty: childErr.length === 0 }));
} finally {
  writer.close();
  rmSync(scratch, { recursive: true, force: true });
}
