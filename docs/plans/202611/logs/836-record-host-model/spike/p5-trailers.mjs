import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const baseArgs = ['-c','trailer.separators=:', '-c','trailer.where=end', 'interpret-trailers','--no-divider'];
function git(args,input) {
  const result = spawnSync('git',[...baseArgs,...args],{input,encoding:'utf8',timeout:1000});
  assert.equal(result.status,0,result.stderr);
  return result.stdout;
}
function normalize(input,host) {
  let out = input;
  for(let i=0;i<16;i++) {
    const keys = git(['--parse'],out).split('\n').filter(l=>/^bkit-host\s*:/i.test(l));
    if(keys.length===0) return git(['--if-exists=add','--if-missing=add','--trailer',`bkit-host: ${host}`],out).replace(/\n+$/, '\n');
    out=git(['--trim-empty','--if-exists=replace','--if-missing=doNothing','--trailer','bkit-host:'],out);
  }
  throw new Error('normalization bound exhausted');
}
const fixtures=[
  {name:'subject-only',input:'chore(example): record bkit [skip ci]\n',expected:'chore(example): record bkit [skip ci]\n\nbkit-host: codex\n'},
  {name:'mixed-case-duplicates',input:'feat(example): change\n\nKeep body.\n\nBkit-Host: claude-code\nCo-Authored-By: Example <example@example.invalid>\nbkit-host: cursor\nReviewed-by: Example Reviewer\n',expected:'feat(example): change\n\nKeep body.\n\nCo-Authored-By: Example <example@example.invalid>\nReviewed-by: Example Reviewer\nbkit-host: codex\n'},
  {name:'explicit-squash-body',input:'feat(example): squash\n\nIntentional body.\n\nSigned-off-by: Example <example@example.invalid>\n',expected:'feat(example): squash\n\nIntentional body.\n\nSigned-off-by: Example <example@example.invalid>\nbkit-host: codex\n'},
  {name:'unknown',host:'unknown',input:'docs(example): close\n',expected:'docs(example): close\n\nbkit-host: unknown\n'},
];
for(const fixture of fixtures) {
  const output=normalize(fixture.input,fixture.host??'codex');
  assert.equal(output,fixture.expected);
  assert.equal(normalize(output,fixture.host??'codex'),output);
  assert.equal(git(['--parse'],output).split('\n').filter(l=>/^bkit-host\s*:/i.test(l)).length,1);
  console.log(fixture.name+'=PASS');
}
console.log('remote-api-delivery=not-exercised');
