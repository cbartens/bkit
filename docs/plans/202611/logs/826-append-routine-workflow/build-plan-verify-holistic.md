Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 1,2,3,4,5,8,9,10,11,12
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic: tasks 1–12 across every runbook group.

## Groups Verified

4 of 4 groups reviewed.

## Integration Gaps

2. Lost-acknowledgment recognition can adopt an intervening human revision as future edit authority; a routine auto startup carrying PR-link metadata is classified as terminal. Details and local reproductions follow.

## Previously Attempted

Group 1 attempts 1–2; group 3 attempts 1–5; group 4 attempt 1. Reviewed the supplied implementation and remediation logs, including group 2's DONE entries for tasks 4–6. Earlier missing tests, creation-order/header-budget gaps, published-completion/source-friction gaps and fixture failures have later corrective evidence. The owner's `build-decision-3-1.md` authorizes the frozen fixture repair while retaining its assertions and budgets; it does not accept either new gap below. This is the first holistic verification.

## Notes

Partial diff coverage: `tmp/bkit-diff-826-append-routine-workflow.md` explicitly truncates the 31325-line feature diff. Its bulk includes installed third-party skills and generated mirrors. This review does not claim full coverage from that artifact. Inspected omitted engine source directly, including the complete changed transport, splitter, evidence, progress binding/cache, publisher, diagnostic and session-association implementations; bounded Git diffs cover shared subprocess deadlines, publication locks, command callers and workflow changes. Generated parity is supported by the supplied build, upgrade, drift and render evidence, not by treating omitted mirrors as inspected source.

Every named TEST FIRST case exists. Group task/test counts are 3/17, 3/22, 4/16 and 2/0; individual tasks stay within the supplied test/file caps. Derived Test Matrix rows map to the named tests and live probes in the task gates. Tasks 4 and 5 satisfy their lock and central-policy deliverables despite remaining unticked in the supplied plan. Task 6 is withheld for recovered-revision adoption, and task 7 for the actual auto caller's PR-link classification. Other task deliverables retain the prior code, targeted-test, live-provider and fresh-built-CLI evidence. No plan checkbox was edited.

Reviewed all three live provider rows and the fresh-consumer evidence. Conservative UTF-16 budgets remain 65536/100000/32767; Jira conversion-dependent limits and unmeasured notification settings are disclosed. Provider identities, versioned source, receipt compatibility, purpose classification and final completion integrate except for the two demonstrated cases. Documentation Updates rows are present, including ownership, source retention, bounded nonfatal diagnostics and create-only fallback. No application database or UI boundary applies.

Test-first evidence has no unresolved audit gap or unproven test. Already-landed group-1 cases are `uses accepted final preflight eligibility without provider atomicity` (existing adapter evidence), `budgets the entire encoded body at limit and overflow` (existing header counting), and `uses legacy receipts and contains receipt failures` (existing receipt handling). Group-2 accepted cases are `starts only new source after overflow or missing source` (existing standalone degradation), `keeps multipart loss and duplicate handling bounded and nonfatal` (existing split/receipt failures), `keeps positive acknowledgment after receipt cache or postflight failure` (guarded local writes), and `contains preparation state lock and reconciliation exceptions` (existing containment). Task 12's accepted existing test passes with the owner-authorized stable fixture; all 11 original assertions and both 200 ms budgets remain. No test-loosened entry is warranted.

Required validation: `BKIT_LOCK_WAIT_S=900 /Users/christian/Documents/GitHub/bkit/node_modules/.bin/bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` completed with exit 1. It acquired the shared lock and executed; no lock failure occurred. Its related selection passed 3844 tests with 2 existing skips but timed out the task-7 boundary-fault integration test at 37200 ms. Its subsequent named selection passed 149 files / 7766 tests with 2 existing skips, including the same integration file. Named Node tests, all 16 Bats cases, lint, formatting and both type checks passed. The final gate status remains FAIL (`failed: related`), not waived by the later passing selection. This validation gap is separate from the two reproduced integration defects. See `tmp/bkit-826-holistic-changed.log`; no broad rerun or test/source change was made by this verifier.

Both additional reproductions below were executed against committed built exports in temporary repositories, with synthetic fetch transports and no live provider calls. Temporary repositories were removed afterward. They expose missing combinations of already-planned behavior, rather than changing an implementation or test. Run these commands from `/Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow` with normal local process access.

### Lost acknowledgment followed by a marker-preserving human edit

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { postCommentOnce, stampMarker } from './dist/commands/workflow/tracker.js';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'bkit-holistic-recognition-'));
try {
 const git=spawnSync('git',['init','-q'],{cwd:root,encoding:'utf8'});
 if(git.status!==0)throw new Error(git.stderr);
 process.env.BKIT_LINEAR_API_KEY='synthetic-local-fixture';
 const comments=[],calls=[];let lose=true;
 globalThis.fetch=async(_url,init)=>{
  const {query,variables}=JSON.parse(init.body);
  if(query.includes('commentCreate')){
   calls.push('create');const comment={id:String(comments.length+1),url:'https://example.invalid/comment/'+(comments.length+1),body:variables.input.body,user:{id:'engine'},createdAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-01T00:00:00Z'};comments.push(comment);
   return Response.json({data:{commentCreate:{success:true,comment}}});
  }
  if(query.includes('commentUpdate')){
   calls.push('edit');const comment=comments.find(c=>c.id===variables.id);comment.body=variables.input.body;comment.updatedAt='2026-11-01T00:01:00Z';
   if(lose){lose=false;comment.body+='\nHuman correction retained after acknowledgment was lost';comment.updatedAt='2026-11-01T00:02:00Z';throw new Error('acknowledgment lost');}
   return Response.json({data:{commentUpdate:{success:true,comment}}});
  }
  calls.push('read');return Response.json({data:{issue:{comments:{nodes:comments,pageInfo:{hasNextPage:false}}}}});
 };
 const target={tracker:'linear',issue:'ENG-12',cwd:root,ownerRepo:'',linearTeam:'ENG',jiraSite:null,config:{}};
 const publish=n=>postCommentOnce(target,stampMarker('###### bkit:generated\nReport '+n),{publication:{invocation:'local-exact-run',workflow:'build'},key:'build/1/step/'+n+'/comment',purpose:'routine',log:()=>{}});
 const first=await publish(1),second=await publish(2);
 const correctionAfterRecognition=comments[0].body.includes('Human correction');
 const third=await publish(3);
 console.log(JSON.stringify({first:first.done,second:second.done,third:third.done,comments:comments.length,correctionAfterRecognition,correctionAfterNextReport:comments[0].body.includes('Human correction'),calls}));
} finally {fs.rmSync(root,{recursive:true,force:true});}
JS
```

Observed: all three outcomes are true, comment count is 1, `correctionAfterRecognition` is true and `correctionAfterNextReport` is false. Calls: `create, read, edit, read, read, read, edit, read`.

### Auto startup with an existing PR

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';import {issuesCommand} from './dist/commands/workflow/issues.js';
const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'bkit-holistic-auto-'));
try{
 const g=spawnSync('git',['init','-q'],{cwd,encoding:'utf8'});if(g.status!==0)throw new Error(g.stderr);
 fs.writeFileSync(path.join(cwd,'package.json'),JSON.stringify({name:'scratch',version:'1.0.0',bkit:{tracker:{default:'linear',linear:{team:'ENG'}}}}));
 const sessionDir=path.join(cwd,'.git/bkit-outbox/sessions/local');fs.mkdirSync(sessionDir,{recursive:true});process.env.BKIT_LINEAR_API_KEY='synthetic-local-fixture';const comments=[],calls=[];
 globalThis.fetch=async(_url,init)=>{const {query,variables}=JSON.parse(init.body);if(query.includes('commentCreate')){calls.push('create');const comment={id:String(comments.length+1),url:'https://example.invalid/'+(comments.length+1),body:variables.input.body,user:{id:'engine'},createdAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-01T00:00:00Z'};comments.push(comment);return Response.json({data:{commentCreate:{success:true,comment}}});}if(query.includes('commentUpdate')){calls.push('edit');const comment=comments.find(c=>c.id===variables.id);comment.body=variables.input.body;return Response.json({data:{commentUpdate:{success:true,comment}}});}calls.push('read');return Response.json({data:{issue:{comments:{nodes:comments,pageInfo:{hasNextPage:false}}}}});};
 const outputs=[];const run=flags=>issuesCommand.verbs.comment.run({cwd,flags:{post:true,issue:'ENG-12',workflow:'auto',sessionDir,...flags},json:true,log:()=>{},emit:value=>outputs.push(value)});
 await run({workflowHeading:true,stepNumber:'1',stepTitle:'Start Workflow',prNumber:'99',prUrl:'https://example.invalid/pull/99',ownerRepo:'o/r'});
 await run({stepNumber:'2',stepTitle:'Dispatch'});
 console.log(JSON.stringify({outcomes:outputs.map(o=>o.tracker.done),comments:comments.length,firstHasProgressMarker:comments[0].body.includes('bkit:progress'),calls}));
}finally{fs.rmSync(cwd,{recursive:true,force:true});}
JS
```

Observed: outcomes `[true,true]`, comment count 2, `firstHasProgressMarker:false`, calls `["create","create"]`.

## Identified Gaps Log

3 unresolved fixable gaps: two demonstrated behavior gaps and one required-gate validation failure.

TASK 6: `.bkit/core/engine/commands/workflow/tracker.ts:1810` `postCommentOnce` — recovered-revision-adoption: After an append response is lost, recognition accepts matching comment/author IDs plus the new section marker, then saves the locally intended aggregate with the recognized remote fingerprint. If a human edited that same comment before recognition while retaining the marker, the human revision becomes the saved authorization baseline even though its text is absent from cached source. The next routine report passes preflight and overwrites the correction. An isolated local reproduction using the built exports returned success for all three reports, one comment throughout, `correctionAfterRecognition:true` and `correctionAfterNextReport:false`; transport sequence was create/read/edit/read/read/read/edit/read. This is not the accepted final-preflight race: a later independent report authorizes its edit against an adopted human revision. Preserve recognized delivery success but invalidate future append eligibility unless the recovered representation is proven to match the exact intended aggregate; add a regression combining lost acknowledgment with a marker-preserving intervening edit and a subsequent routine report — Fixable: true
TASK 7: `.bkit/core/engine/commands/workflow/issues.ts:1084` and `.bkit/core/workflows/bkit-auto.md:126` — pr-link-misclassified-as-completion: The issues-comment caller treats any supplied `prNumber` as terminal purpose and selects an ended-run key. Auto's ordinary Start Workflow command already supplies PR metadata, so an auto invocation for an existing PR publishes startup as a terminal comment instead of retaining its routine progress source. Dispatch then creates another comment despite the same valid session and available state. An isolated invocation of the built issues command using the actual startup/dispatch flag shapes returned two successes, two create calls, no edit, and no progress marker in startup. Distinguish explicit completion purpose from ordinary PR-link metadata, preserve terminal Create PR behavior, and cover auto startup plus Dispatch with an existing PR — Fixable: true
TASK 7: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts:539` `preserves substantive step results under every comment boundary fault` — required-changed-gate-failed: The required `BKIT_LOCK_WAIT_S=900 /Users/christian/Documents/GitHub/bkit/node_modules/.bin/bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 because its related selection exceeded this integration test's 37200 ms timeout (41911 ms reported). The subsequent named selection in the same invocation passed all 149 files / 7766 tests, including this integration file, so no product behavior defect is established by this timing result. The overall required gate nevertheless remains failed; retain the assertions and investigate the execution cost or justified fixture scheduling before obtaining a passing gate. Full evidence: `tmp/bkit-826-holistic-changed.log` lines 8–32, 56–59 and 135 — Fixable: true
