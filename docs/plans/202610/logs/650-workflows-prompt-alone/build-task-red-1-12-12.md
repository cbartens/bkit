> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/branches.test.ts (141 tests | 9 failed) 72912ms
✓ branches rebase: classification (27)
✓ ledger list does not drift from .gitattributes merge=union 5ms
✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 0ms
✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 0ms
✓ classifies docs/failures.jsonl as an auto-resolvable ledger 0ms
✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 0ms
✓ classifies docs/roadmap.md as an auto-resolvable ledger 0ms
✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 0ms
✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 0ms
✓ classifies every lockfile with a regenerate command as the lockfile shape 0ms
✓ refuses src.txt 0ms
✓ refuses package.json 0ms
✓ refuses .bkit/config.json 0ms
✓ refuses docs/testing.md 0ms
✓ refuses docs/plans/202608/234-plan.md 0ms
✓ refuses apps/web/data.jsonl 0ms
✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
✓ refuses packages/a/Cargo.lock 0ms
✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 0ms
✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
✓ branches rebase: behaviour (17)
✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 693ms
✓ refuses a code conflict and aborts the rebase on the spot 476ms
✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 510ms
✓ refuses a mixed set without mutating the resolvable ledger in it 260ms
✓ produces byte-identical output to merge=union 752ms
✓ restores a trailing newline so the next append starts on its own line 399ms
✓ skips a commit the resolution emptied instead of stalling the rebase 371ms
✓ keeps going when the skip lands on a next commit that conflicts again 446ms
✓ refuses a union that leaves a line which is not JSON 254ms
✓ unions docs/roadmap.md without de-duplicating its repeated lines 325ms
✓ resolves a lockfile from the rebase target's copy, then regenerates it 528ms
✓ refuses a lockfile whose regenerate command fails 497ms
✓ --sentinel and --log-file record a refusal and survive the abort 287ms
✓ removes a stale sentinel when the rebase succeeds 415ms
✓ exits 4 when no rebase is in progress 107ms
✓ resolves two ledgers conflicting in the same commit in one pass 522ms
✓ resolves a conflict in each of two replayed commits across rounds 471ms
✓ branches anchor-stamp (19)
✓ prepends a well-formed block to an unstamped file 18ms
✓ records the bkit release, and warns visibly under the block when it is outdated 54ms
✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 42ms
✓ stamps an empty bkitLatest and no warning when the newest release is unknown 22ms
✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 18ms
✓ is idempotent: stamping twice with the same args is byte-identical 33ms
✓ re-stamping with a different base replaces the block instead of adding a second 32ms
✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 30ms
✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 30ms
✓ fails closed on an empty --base-sha and writes nothing 1ms
✓ fails closed on a missing file 1ms
✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 38ms
✓ strips an unterminated block to the end of the file, as sed's range does 0ms
✓ stampAnchor: empty file 0ms
✓ stampAnchor: no trailing newline (kept as-is) 0ms
✓ stampAnchor: two blocks (both removed) 0ms
✓ stampAnchor: close on the line after open (body line kept) 0ms
✓ stampAnchor: inline lookalike marker is not a block 0ms
✓ stampAnchor: empty field block 0ms
✓ branches anchor-read (15)
✓ round-trips every field 35ms
✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
✓ matches only inside the block, and the first occurrence wins 0ms
✓ exits 13 on a missing file and 2 on an unknown field 1ms
✓ --against (build's Plan Current trigger) (6)
✓ skips (12) with no plan file 269ms
✓ skips (12) with no anchor 301ms
✓ skips (12) when the base is unreachable in this clone 287ms
✓ skips (12) when nothing landed since the base 268ms
✓ runs (0) with the landed path count once dev moved 547ms
✓ errors (2) when the --against ref does not exist, instead of skipping 268ms
✓ readAnchor: two blocks: the first block's value wins 0ms
✓ readAnchor: an unterminated block runs to the end of the file 0ms
✓ readAnchor: a field after the close line is outside the block 0ms
✓ readAnchor: an empty field reads as the empty string 0ms
✓ readAnchor: an empty file has no fields 0ms
✓ branches push (16)
✓ pushes a feature branch with --force-with-lease and reports the ref pushed 605ms
✓ pushes dev plainly, so a non-fast-forward is refused rather than forced 597ms
✓ pushes when the pre-push hook prints more than Node's 1MB default 903ms
✓ runs exactly one git push 942ms
✓ --set-upstream records the upstream 500ms
✓ refuses with no branch checked out 396ms
✓ --mode=dev refuses a feature checkout 484ms
✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 987ms
✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 523ms
✓ --mode=abort never pushes into an open PR, and says what was not pushed 792ms
✓ --mode=abort pushes when the branch has no open PR 761ms
✓ --mode=abort hands the probe to MCP (80) when gh fails 657ms
✓ --mode=abort hands the probe to MCP (80) when gh is not installed 460ms
✓ --open-pr carries the MCP answer and skips gh 743ms
✓ --mode=abort on dev pushes plainly without probing 657ms
✓ rejects an unknown mode 448ms
❯ branches push — in place on dev with a shared-checkout record (10)
× push after a replay reports the pushToDev sha not HEAD 1077ms
× replay build callback cherry-picks exactly the recorded SHAs 1300ms
× replay conflict exits non-zero naming the paths and removes the throwaway checkout 1051ms
✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1476ms
× skip-ci HEAD on the replay is refused 950ms
× a skip-ci foreign HEAD does not block a replay whose last run commit is clean 913ms
× abort mode on dev with a record pushes only recorded SHAs 1587ms
× a level local dev is a plain push, recording nothing extra 985ms
× a record with no commits pushes nothing 763ms
× without a record the dev push is unchanged and replayed is false 670ms
✓ branches sync (10)
✓ Path A when origin/dev is an ancestor of HEAD 670ms
✓ Path B once dev moved; --head checks a given commit 1057ms
✓ --merge-docs merges dev when docs/ is behind 1095ms
✓ --merge-docs leaves the branch alone when only code moved on dev 940ms
✓ --merge-docs never merges on dev itself 994ms
✓ --merge-docs takes dev's side for a conflicted docs/ file 1254ms
✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1183ms
✓ --merge-docs aborts (11) on a conflict outside docs/ 1147ms
✓ exits 10 when the fetch fails 428ms
✓ refuses --merge-docs with --head, and an unknown --head 442ms
✓ branches sync-dev (6)
✓ fast-forwards local dev without checking it out 949ms
✓ on dev: moves the checkout too, and installs only because dev moved 920ms
✓ a failed install stops ship (16) 818ms
✓ lists local-only dev commits with the command to publish them, and pushes nothing 973ms
✓ exits 10 when the fetch fails 531ms
✓ puts core.bare back to false on the main checkout 665ms
✓ branches land (21)
✓ refuses a workflow other than design or plan 266ms
✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 583ms
✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1269ms
✓ local: lands with files staged in the main checkout and leaves them staged 1212ms
✓ local: dev with commits of its own is left alone; only the close is pushed 1290ms
✓ local: the main checkout on another branch stays there; only the dev pointer moves 1227ms
✓ dev moved during the push: rebuilds on the new dev and pushes again 2305ms
✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3611ms
✓ local: stops (17) when the squash would bring non-doc files to dev 756ms
✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1630ms
✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1682ms
✓ PR merge refused: updates the PR branch from dev and merges on the next try 1000ms
✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1003ms
✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1354ms
✓ PR state unread (one gh view failed): retried like an open PR, then merges 1505ms
✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 903ms
✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2184ms
✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1641ms
✓ landPr refuses a main-based PR without retrying 837ms
✓ landPr refuses when the PR base is unknown 748ms
✓ PR not open (closed): stops (17) at once, no retry 988ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > push after a replay reports the pushToDev sha not HEAD
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: true, ref: 'dev', …(2) }
(3 matching properties omitted from actual)

- Expected

* Received

  {
  "forced": false,
  "pushed": true,
  "ref": "dev",

- "replayed": true,
  }

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1147:22
1145| const r = await run(clone, ["push", "--mode=dev"]);
1146| expect(r.code).toBe(0);
1147| expect(r.json).toMatchObject({ pushed: true, ref: "dev", forced:…
| ^
1148| expect(r.json?.sha).toBe(sha(origin, "dev"));
1149| expect(r.json?.sha).not.toBe(sha(clone));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > replay build callback cherry-picks exactly the recorded SHAs
Error: replayBuild is not implemented
❯ .bkit/core/engine/commands/workflow/branches.ts:650:11
648| export function replayBuild(_shas: string[]): (dir: string) => void {
649| return () => {
650| throw new Error("replayBuild is not implemented");
| ^
651| };
652| }
❯ .bkit/core/engine/commands/workflow/branches.test.ts:1163:34

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > replay conflict exits non-zero naming the paths and removes the throwaway checkout
AssertionError: expected +0 to be 11 // Object.is equality

- Expected

* Received

- 11

* 0

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1181:22
1179| const before = sha(origin, "dev");
1180| const r = await run(clone, ["push", "--mode=dev"]);
1181| expect(r.code).toBe(11);
| ^
1182| expect(r.err).toContain("src.txt");
1183| expect(sha(origin, "dev")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > skip-ci HEAD on the replay is refused
AssertionError: expected +0 to be 6 // Object.is equality

- Expected

* Received

- 6

* 0

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1208:28
1206| commit(clone, { "foreign-top.txt": "t\n" }, "foreign: top commit…
1207| const refused = await run(clone, ["push", "--mode=dev", "--requi…
1208| expect(refused.code).toBe(6);
| ^
1209| expect(refused.json).toMatchObject({ pushed: false, skipped: "sk…
1210| expect(remoteLog(origin)).not.toContain("chore(650): close bkit …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > a skip-ci foreign HEAD does not block a replay whose last run commit is clean
AssertionError: expected 6 to be +0 // Object.is equality

- Expected

* Received

- 0

* 6

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1218:22
1216| commit(clone, { "foreign-top.txt": "t\n" }, "foreign: wip [skip …
1217| const r = await run(clone, ["push", "--mode=dev", "--require-ci"…
1218| expect(r.code).toBe(0);
| ^
1219| expect(remoteLog(origin)).toContain("fix: the run's last commit"…
1220| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > abort mode on dev with a record pushes only recorded SHAs
AssertionError: expected [ 'foreign: mid-run', …(3) ] to not include 'foreign: mid-run'
❯ .bkit/core/engine/commands/workflow/branches.test.ts:1233:37
1231| expect(r.code).toBe(0);
1232| expect(remoteLog(origin)).toContain("fix: recorded");
1233| expect(remoteLog(origin)).not.toContain("foreign: mid-run");
| ^
1234| expect(fs.readFileSync(calls, "utf-8")).not.toContain("push orig…
1235| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > a level local dev is a plain push, recording nothing extra
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: true, replayed: false, …(1) }
(4 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,

- "replayed": false,
  "sha": "8d47a878262bac9b7b592618015af3b7a3ef5561",
  }

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1243:22
1241| const r = await run(clone, ["push", "--mode=dev"]);
1242| expect(r.code).toBe(0);
1243| expect(r.json).toMatchObject({ pushed: true, replayed: false, sh…
| ^
1244| expect(sha(origin, "dev")).toBe(sha(clone));
1245| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > a record with no commits pushes nothing
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: false, …(1) }
(4 matching properties omitted from actual)

- Expected

* Received

  {

- "pushed": false,
- "skipped": "no-run-commits",

* "pushed": true,
* "skipped": null,
  }

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1252:22
1250| const r = await run(clone, ["push", "--mode=dev"]);
1251| expect(r.code).toBe(0);
1252| expect(r.json).toMatchObject({ pushed: false, skipped: "no-run-c…
| ^
1253| expect(sha(origin, "dev")).toBe(before);
1254| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/9]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches push — in place on dev with a shared-checkout record > without a record the dev push is unchanged and replayed is false
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: true, replayed: false, …(1) }
(4 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,

- "replayed": false,
  "sha": "f8a97f9ec3230338b19bce09eacad9e20d33a1d7",
  }

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1260:22
1258| commit(clone, { "a.txt": "a\n" }, "docs: x");
1259| const r = await run(clone, ["push", "--mode=dev"]);
1260| expect(r.json).toMatchObject({ pushed: true, replayed: false, sh…
| ^
1261| expect(sha(origin, "dev")).toBe(sha(clone));
1262| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/9]⎯

Test Files 1 failed (1)
Tests 9 failed | 132 passed (141)
Start at 13:23:01
Duration 73.61s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ZFbogN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
