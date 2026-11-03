Enforced: true
Red: 10
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "pins selected evidence variables and clears inherited pins without selection" | red | failure: Unexpected end of JSON input |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "accepts only matching complete CI receipts with nonempty logs" | red | failure: Unexpected end of JSON input |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "validates adapted legacy and fallback context through the same receipt path" | red | failure: Unexpected end of JSON input |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "fetches pinned attempts without branch discovery and filters unpinned discovery" | red | failure: expected [] to deeply equal [ ObjectContaining{…} ] |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "emits complete receipts only after all selected job logs succeed" | red | failure: expected [] to have a length of 1 but got +0 |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "ends pinned diffs at selected commits with ancestral same-workflow baselines" | red | failure: expected '' to contain 'failed-only.txt' |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "keeps adopted GitHub context blocks equal to shipped blocks" | passed-accepted | passes; accepted by the tests step: existing CI and diff fenced bodies in .agents/context.md equal .bkit/templates/context/bkit-github.md |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "routes selected evidence through context diagnosis and generation-scoped fixes" | red | failure: expected '## 🤖 Step 1 — Start Workflow\n\n1. R…' to match /branches parse[^\n]*--workflow=debug/ |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "honors CI reproduction before remediation and blocks unreproduced failures" | red | failure: expected '## 🤖 Step 4 — Fetch Context\n\n**Run…' to match /ciReproduced\|CI_REPRODUCED/ |
| 8 | `.bkit/core/engine/commands/workflow/runs.test.ts` "requires selected other-workflow success at the exact pushed head" | red | failure: expected 2 to be +0 // Object.is equality |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "retains original and verifying run identities through close and auto handoff" | red | failure: expected ' - `PHASE` = `debug` → `/bkit-debug…' to match /\{RUN_URL\}\|actions\/runs\/\{RUN…/runs\ |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/context-fetch.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/context-fetch.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/context-fetch.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/context-fetch.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests | 3 failed) 266ms
   ❯ selected CI context evidence (3)
     × pins selected evidence variables and clears inherited pins without selection 13ms
     × accepts only matching complete CI receipts with nonempty logs 8ms
     × validates adapted legacy and fallback context through the same receipt path 7ms
   ✓ bkit context fetch (9)
     ✓ renders a JSON array of flat objects as a table and keeps the raw output in the outbox 34ms
     ✓ keeps the raw copy byte-identical, outside logs/ 27ms
     ✓ round-trips a value holding a pipe 28ms
     ✓ leaves nested JSON raw and says why 23ms
     ✓ leaves plain text raw and says why 25ms
     ✓ leaves a JSON object raw and says why 23ms
     ✓ falls back to raw when the table does not read back as the input 23ms
     ✓ --render=raw writes the output as it came 22ms
     ✓ rejects an unknown --render 7ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/context-fetch.test.ts > selected CI context evidence > pins selected evidence variables and clears inherited pins without selection
SyntaxError: Unexpected end of JSON input
 ❯ fetch .bkit/core/engine/commands/workflow/context-fetch.test.ts:69:29
     67|     },
     68|   );
     69|   return { code, json: JSON.parse(out.join("")), err: err.join("") };
       |                             ^
     70| }
     71|
 ❯ .bkit/core/engine/commands/workflow/context-fetch.test.ts:128:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/context-fetch.test.ts > selected CI context evidence > accepts only matching complete CI receipts with nonempty logs
SyntaxError: Unexpected end of JSON input
 ❯ fetch .bkit/core/engine/commands/workflow/context-fetch.test.ts:69:29
     67|     },
     68|   );
     69|   return { code, json: JSON.parse(out.join("")), err: err.join("") };
       |                             ^
     70| }
     71|
 ❯ .bkit/core/engine/commands/workflow/context-fetch.test.ts:140:13

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/context-fetch.test.ts > selected CI context evidence > validates adapted legacy and fallback context through the same receipt path
SyntaxError: Unexpected end of JSON input
 ❯ fetch .bkit/core/engine/commands/workflow/context-fetch.test.ts:69:29
     67|     },
     68|   );
     69|   return { code, json: JSON.parse(out.join("")), err: err.join("") };
       |                             ^
     70| }
     71|
 ❯ .bkit/core/engine/commands/workflow/context-fetch.test.ts:183:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 9 passed (12)
   Start at  23:29:12
   Duration  391ms (tests 78%, import 10%, transform 9%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sQNb1h/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/context-github-ci-block.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/context-github-ci-block.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests | 3 failed) 1155ms
   ❯ GitHub selected-evidence context blocks (4)
     × fetches pinned attempts without branch discovery and filters unpinned discovery 484ms
     × emits complete receipts only after all selected job logs succeed 386ms
     × ends pinned diffs at selected commits with ancestral same-workflow baselines 284ms
     ✓ keeps adopted GitHub context blocks equal to shipped blocks 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/context-github-ci-block.test.ts > GitHub selected-evidence context blocks > fetches pinned attempts without branch discovery and filters unpinned discovery
AssertionError: expected [] to deeply equal [ ObjectContaining{…} ]

- Expected
+ Received

- [
-   ObjectContaining {
-     "headSha": "12ff60c4bd4ea35eed9b06e1cae2db1696f2415b",
-     "provider": "github",
-     "repo": "example/example",
-     "runAttempt": 2,
-     "runId": "123",
-     "workflowId": "777",
-   },
- ]
+ []

 ❯ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts:232:44
    230|     const selected = f.invoke("ci");
    231|     expect(selected.code).toBe(0);
    232|     expect(completeReceipts(selected.out)).toEqual([
       |                                            ^
    233|       expect.objectContaining({
    234|         provider: "github",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/templates/context-github-ci-block.test.ts > GitHub selected-evidence context blocks > emits complete receipts only after all selected job logs succeed
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts:267:44
    265|     const f = githubBlockFixture();
    266|     const complete = f.invoke("ci");
    267|     expect(completeReceipts(complete.out)).toHaveLength(1);
       |                                            ^
    268|     expect(complete.out).toContain("fixture failure log for job 501");
    269|     expect(complete.out).toContain("fixture failure log for job 502");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/templates/context-github-ci-block.test.ts > GitHub selected-evidence context blocks > ends pinned diffs at selected commits with ancestral same-workflow baselines
AssertionError: expected '' to contain 'failed-only.txt'

- Expected
+ Received

- failed-only.txt

 ❯ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts:286:22
    284|     const diff = f.invoke("diff");
    285|     expect(diff.code).toBe(0);
    286|     expect(diff.out).toContain("failed-only.txt");
       |                      ^
    287|     expect(diff.out).not.toContain("after-failure.txt");
    288|     expect(diff.out).toContain(f.baseline);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 1 passed (4)
   Start at  23:29:14
   Duration  1.23s (tests 98%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-W0Chjs/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

````

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (35 tests | 3 failed) 8ms
   ❯ selected CI evidence routing (3)
     × routes selected evidence through context diagnosis and generation-scoped fixes 2ms
     × honors CI reproduction before remediation and blocks unreproduced failures 0ms
     × retains original and verifying run identities through close and auto handoff 0ms
   ✓ bkit-build.md — CI-Dispatch gate wiring (6)
     ✓ runs bkit runs dispatch in exactly one PR-mode block 0ms
     ✓ passes the re-read labels, so the re-trigger subject carries the auto-route suffix 0ms
     ✓ passes the held PR number, so a runtime without gh never needs it to find the PR 0ms
     ✓ names the status file and the step whose row records the ciDispatch verdict 0ms
     ✓ never commits or pushes after the gate — the verdict stays local (KN-11) 0ms
     ✓ the push the gate polls refuses a skip-CI HEAD (--require-ci) 0ms
   ✓ bkit-debug.md — CI-Dispatch gate wiring (6)
     ✓ runs bkit runs dispatch in exactly one PR-mode block 0ms
     ✓ passes the re-read labels, so the re-trigger subject carries the auto-route suffix 0ms
     ✓ passes the held PR number, so a runtime without gh never needs it to find the PR 0ms
     ✓ names the status file and the step whose row records the ciDispatch verdict 0ms
     ✓ never commits or pushes after the gate — the verdict stays local (KN-11) 0ms
     ✓ the push the gate polls refuses a skip-CI HEAD (--require-ci) 0ms
   ✓ bkit-ship.md — no CI-Dispatch gate (1)
     ✓ never calls bkit runs dispatch 0ms
   ✓ bkit-ship.md — Step 9 re-validates through runs revalidate (4)
     ✓ runs it once, with the entry head, the code head, the branch and the status file 0ms
     ✓ dispatches only through the command — no hand-rolled gh workflow run anywhere 0ms
     ✓ never names a hard-coded ci.yml (the CI file comes from bkit.testing.ciWorkflow) 0ms
     ✓ keeps ship free of the gate's outcome vocabulary (probe is never a pass condition) 0ms
   ✓ bkit-ship.md — Step 10 gate-refusal re-entry is a bounded poll (4)
     ✓ a refusal re-enters Step 9 as gate-refusal 0ms
     ✓ re-validate sits after the deferred sweep and the bookkeeping commit, before the merge gate 0ms
     ✓ bounds the re-entry by bkit.workflows.ship.merge through bkit counters route, never a local value 0ms
     ✓ one count covers refusals and failed merges: each merge route reads both row types 0ms
   ✓ bkit-debug.md — close decides from live PR state (4)
     ✓ probes the live PR for the close branch on any base, before the close commit 0ms
     ✓ adopts a PR opened mid-run instead of blind-creating 0ms
     ✓ sets TRIGGER_PR from {PR_OPEN}, never from the Step-1 PUSH_MODE 0ms
     ✓ runs the CI-Dispatch gate on every feature-branch close 0ms
   ✓ bkit-debug.md — Step 11 on dev (7)
     ✓ debug Step 11 on dev waits for and gates the dev CI run 0ms
     ✓ debug Step 11 on dev dispatches by pushed sha 0ms
     ✓ debug Step 11 on dev pushes its own record and re-holds the dispatched head 0ms
     ✓ debug Step 11 on dev releases the lock after the CI wait 0ms
     ✓ debug Step 11 on dev records the close against the pushed sha 0ms
     ✓ debug Step 11 on dev routes a red run to the Failure Path naming the run 0ms
     ✓ debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > selected CI evidence routing > routes selected evidence through context diagnosis and generation-scoped fixes
AssertionError: expected '## 🤖 Step 1 — Start Workflow\n\n1. R…' to match /branches parse[^\n]*--workflow=debug/

- Expected:
/branches parse[^\n]*--workflow=debug/

+ Received:
"## 🤖 Step 1 — Start Workflow

1. Read repo facts (fetches `origin/dev` first):
   ```bash
   \"$(dirname \"$(git rev-parse --path-format=absolute --git-common-dir)\")/node_modules/.bin/bkit\" repo info --fetch
   ```
   Hold `bkit` as `BKIT`, `ownerRepo` as `OWNER_REPO`, `owner` as `OWNER`, `repo` as `REPO`, `branch` as `BRANCH`, `repoRoot` as `REPO_ROOT`, `outboxRoot` as `OUTBOX_ROOT`, `sessionDir` as `SESSION_DIR`, `bkitAdvisory` as `BKIT_ADVISORY`. **If** `BKIT_ADVISORY` != null → emit advisory `[bkit-debug] {BKIT_ADVISORY}`.
   <!-- bkit:tracker true start -->
   Hold `trackerTeam` as `TRACKER_TEAM`, `trackerProject` as `TRACKER_PROJECT`, `trackerSite` as `TRACKER_SITE`.
   <!-- bkit:tracker true end -->
2. Write the session prompt verbatim to `{SESSION_DIR}/prompt.md` → read the issue and the `FID` it names:
   ```bash
   \"{BKIT}\" fids parse --prompt-file=\"{SESSION_DIR}/prompt.md\"
   ```
   <!-- bkit:tracker true start -->
   **If** exit 8 → **STOP**; tell the user the prompt names more than one issue (`ambiguous`) and to name the issue as `#N`, its key or its URL; never the **Failure Path**.
   <!-- bkit:tracker true end -->
   Hold `fidNamed` as `FID_NAMED`. Hold `issue` as `ISSUE_ID`, `ref` as `REF`.
   <!-- bkit:tracker false start -->
   Log `Tracker not wired — proceeding without issue ID.`
   <!-- bkit:tracker false end -->
   <!-- bkit:tracker true start -->
   **If** `ISSUE_ID` empty → recover `ISSUE_ID` from the branch, `{FID}` = `FID_NAMED`, else the `BRANCH` suffix; `FID_NAMED` null and `BRANCH` != `feat/{FID}` → as exit 0 with `issueId` null:
   ```bash
   \"{BKIT}\" fids parse --branch=\"feat/{FID}\"
   ```
   Route:
   - **If** exit 0 and `issueId` non-null → hold `issueId` as `ISSUE_ID`.
   - **If** exit 0 and `issueId` null → set `ISSUE_ID=\"\"` → emit the no-issue warning once `FID` is held → continue; NEVER create a tracker issue.
   - **If** exit 3 → **STOP**; tell the user to rename `BRANCH` to `feat/{lowercase-slug}` or name an issue; never the **Failure Path**.
   - **Else** → **Failure Path**.
   <!-- bkit:tracker true end -->
3. <!-- bkit:tracker true start -->
   **Skip if** `ISSUE_ID` empty (`STATE`, `LABELS` empty; input artifact built from session prompt alone). Read the issue into `{SESSION_DIR}`:
   ```bash
   \"{BKIT}\" issues fetch --issue=\"{ISSUE_ID}\" --session-dir=\"{SESSION_DIR}\"
   ```
   Hold `state` as `STATE`, `labels` as `LABELS`, `title` as `TITLE`, `url` as `URL`. **If** exit 80 → read the issue via the tracker MCP (**Tracker**) → write the description raw to `{SESSION_DIR}/issue-description.md`, the comments oldest first as JSON to `{SESSION_DIR}/issue-comments.json` and `{ title, url, state, labels }` as JSON to `{SESSION_DIR}/issue-facts.json`.
   <!-- bkit:tracker true end -->
   <!-- bkit:tracker false start -->
   No tracker wired → `STATE`, `LABELS`, `DESCRIPTION`, `COMMENTS` all empty; input artifact built from session prompt alone.
   <!-- bkit:tracker false end -->
4. Resolve `FID` — never borrow another feature's `FID` from a leftover lock or the newest bucket.
   <!-- bkit:tracker true start -->
   **If** `ISSUE_ID` empty → drop `--title-file`.
   <!-- bkit:tracker true end -->
   ```bash
   \"{BKIT}\" fids resolve --prompt-file=\"{SESSION_DIR}/prompt.md\"<!-- bkit:tracker true start --> --issue=\"{ISSUE_ID}\" --title-file=\"{SESSION_DIR}/issue-facts.json\"<!-- bkit:tracker true end --> --workflow=debug
   ```
   Route:
   - **If** exit 0 → hold `fid` as `FID`; one `FID` for all artifacts.
   - **If** exit 4 → **Failure Path** listing `fids` (name the `FID` in the session prompt to pick one).
   - **If** exit 9 → **STOP**; tell the user the prompt holds only a bare number and to name the issue as `#N`, its key or its URL; never the **Failure Path**.
   - **Else** → **Failure Path**.
5. Acquire concurrency lock:
   ```bash
   \"{BKIT}\" locks acquire --kind=workflow --workflow=debug --fid={FID}
   ```
   Hold `token` as `LOCK_TOKEN`, `month` as `YYYYMM`.
6. **If** `BRANCH` = `dev` **or** `main` → `PUSH_MODE` = LOCAL → step 7. **Else** → find the open PR from `{BRANCH}` into any base:
   ```bash
   \"{BKIT}\" prs probe
   ```
   Decide `PUSH_MODE`:
   - **If** exit 0 → hold `number` as `PR_NUMBER` → `PUSH_MODE` = PR.
   - **If** exit 1 → `PUSH_MODE` = LOCAL.
   - **If** exit 80 → `list_pull_requests` (head `{BRANCH}`, state open):
     - **If** it finds a PR → hold its number as `PR_NUMBER` → `PUSH_MODE` = PR.
     - **Else** → `PUSH_MODE` = LOCAL.
   - **Else** → **Failure Path**.
7. Decide this run's attempt, mode, repro and gates from the session prompt and the current run (a resume keeps its attempt; a finished run's soak never carries over):
   ```bash
   \"{BKIT}\" status route --workflow=debug --fid={FID} --month={YYYYMM} --prompt-file=\"{SESSION_DIR}/prompt.md\"
   ```
   Route:
   - **If** exit 0 → hold `debugAttempt` as `DEBUG_ATTEMPT`, `debugMode` as `DEBUG_MODE`, `repro` as `REPRO`, `gates` as `GATES`.
   - **Else** → **Failure Path**.
8. <!-- bkit:tracker true start -->
   **Skip if** `ISSUE_ID` empty. Set the phase label `bkit:debug`, and drop the prior phase label, `next:*` and `bkit:failed`. `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry:
   ```bash
   \"{BKIT}\" issues labels --write --phase=debug --board=progress --issue={ISSUE_ID} --owner-repo={OWNER_REPO} {LABEL_FLAGS}
   ```
   Hold `labels` as `LABELS`, `trackerState` as `TRACKER_STATE`, `board` as `BOARD`.
   **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
   <!-- bkit:tracker true end -->
9. <!-- bkit:tracker true start -->
   **Skip if** `ISSUE_ID` empty. Comment:
   ```bash
   \"{BKIT}\" issues comment --post --issue=\"{ISSUE_ID}\" --workflow=debug --workflow-heading --step-number=1 --step-title=\"Start Workflow\" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 1 — Start Workflow

```bash
\"{BKIT}\" steps gate --workflow=debug --step=debug-start-workflow --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}<!-- bkit:tracker true start --> --issue=\"{ISSUE_ID}\"<!-- bkit:tracker true end --> --placeholder=OWNER_REPO={OWNER_REPO} --placeholder=BRANCH={BRANCH} --placeholder=REPO_ROOT={REPO_ROOT}
```

- [ ] Mechanical checks passed (`steps gate`)
- [ ] Issue resolved
- [ ] Push mode decided
- [ ] Debug attempt derived
- [ ] Debug mode decided
- [ ] Repro decided

<!-- bkit:tracker true start -->

- [ ] Issue update attempted

<!-- bkit:tracker true end -->

---

## 🤖 Step 2 — Worktree Setup

1. Resume the worktree, adopt the existing `feat/{FID}` branch, or adopt the current session branch in place. This never creates a new branch:
   ```bash
   \"{BKIT}\" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect
   ```
   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
   Route:
   - **If** exit 0 → `cd \"{WORKTREE_PATH}\"` → verify with `pwd` → sub-step 2.
   - **If** exit 3 → resolve the rebase:
     ```bash
     cd \"{WORKTREE_PATH}\" && \"{BKIT}\" branches rebase --sentinel=\"{SENTINEL}\" --log-file=\"{LOG_DIR}/rebase-resolve-log.md\" --file=\"{LOG_DIR}/status.jsonl\"
     ```
     - **If** exit 0 → re-run this sub-step.
     - **Else** → **Failure Path**.
   - **Else** → **Failure Path**.
2. Open the run inside the worktree:
   ```bash
   mkdir -p \"{OUTBOX}\" || exit 1
   \"{BKIT}\" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
   ```
   Hold `file` as `STATUS`.
3. Write the input file — session prompt, issue text, plan (when present):
   <!-- bkit:tracker true start -->
   **If** `ISSUE_ID` empty → drop `--description-file` and `--comments-file`.
   <!-- bkit:tracker true end -->
   ```bash
   \"{BKIT}\" workflows input --workflow=debug --fid={FID} --run={DEBUG_ATTEMPT} --file=\"{STATUS}\" --prompt-file=\"{SESSION_DIR}/prompt.md\"<!-- bkit:tracker true start --> --description-file=\"{SESSION_DIR}/issue-description.md\" --comments-file=\"{SESSION_DIR}/issue-comments.json\"<!-- bkit:tracker true end --> --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" || exit 1
   ```
4. Record the runtime and the run's modes, then finish:
   ```bash
   \"{BKIT}\" runtime row --workflow=debug --file=\"{STATUS}\" >/dev/null || exit 1
   \"{BKIT}\" runtime assert --file=\"{STATUS}\" --workflow=debug >/dev/null || exit 1
   \"{BKIT}\" steps done --file=\"{STATUS}\" --workflow=debug --step=debug-start-workflow --commit=none >/dev/null || exit 1
   \"{BKIT}\" status meta --file=\"{STATUS}\" --workflow=debug --debug-attempt=run --debug-mode={DEBUG_MODE} --push-mode={PUSH_MODE} >/dev/null || exit 1
   \"{BKIT}\" steps finish --file=\"{STATUS}\" --workflow=debug --step=debug-worktree-setup --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md --field=debugMode={DEBUG_MODE} --field=pushMode={PUSH_MODE} --message=\"chore({FID}): worktree-setup\" --number=2 --post --title=\"Worktree Setup\" --tree={BRANCH}
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree ready
- [ ] Runtime row written and asserted
- [ ] Mechanical checks passed (`steps finish`)

---

"

 ❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:57:19
     55|   it("routes selected evidence through context diagnosis and generatio…
     56|     const setup = debugStep(1) + debugStep(2);
     57|     expect(setup).toMatch(/branches parse[^\n]*--workflow=debug/);
       |                   ^
     58|     expect(setup).toMatch(/runs locate\b/);
     59|     expect(setup).toMatch(/status meta[^\n]*--ci-selection-file=/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > selected CI evidence routing > honors CI reproduction before remediation and blocks unreproduced failures
AssertionError: expected '## 🤖 Step 4 — Fetch Context\n\n**Run…' to match /ciReproduced|CI_REPRODUCED/

- Expected:
/ciReproduced|CI_REPRODUCED/

+ Received:
"## 🤖 Step 4 — Fetch Context

**Run only if** `TEST_VERDICT` = FAIL **or** `REPRO` = true.

1. Reset the clamp log, then enumerate every `context-fetch` block after `<!-- bkit:end -->` in `.agents/context.md` and narrate coverage per context before fetching:
   ```bash
   \"{BKIT}\" context clamp-log --reset --fid={FID} --step=context-fetch --attempt={DEBUG_ATTEMPT} >/dev/null || exit 2
   \"{BKIT}\" context list-blocks
   ```
   Hold `blocks` as `FETCH_BLOCKS` and `coverage` as `COVERAGE`.
2. **For each** entry in `FETCH_BLOCKS` (`{IDX}` = its `idx`):
   - Take its `body` as the starting template, and customise it for the failure (severity, freshness, limit, query, filters).
   - **If** `{DEBUG_ATTEMPT}` > 1 → vary the customisations from prior attempts.
   - Run it through the block below. The block writes stdout fenced as the context artifact (a JSON list of flat rows as a table), or else the `[context-fetch:<name>]` skip breadcrumb:
     ```bash
     SCRIPT=\"{OUTBOX}/context-fetch-{IDX}.sh\"
     cat > \"$SCRIPT\" <<'BKIT_CONTEXT_FETCH_BLOCK'
     {customised BLOCK}
     BKIT_CONTEXT_FETCH_BLOCK
     \"{BKIT}\" context fetch --idx={IDX} --script=\"$SCRIPT\" --fid={FID} --month={YYYYMM} --file=\"{STATUS}\"
     ```
   Narrate each block's outcome (`outcome`) separately, and always note the blocks with fetch issues.
3. Confirm the local-test artifact Step 3 captured. Do not re-run the tests here:
   - **If** `docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md` is non-empty → narrate `[bkit-debug] local test output CHECKED — captured by Step 3`.
   - **Else** → narrate `[bkit-debug] local test output MISSING — Step 3 captured nothing; treat local-test evidence as unavailable, never as clean`.
4. <!-- bkit:tracker github start -->
   `{QUERY_NL}` = one natural-language sentence describing failure (error class, failing-test name, exception terms in sentence); never a keyword list → `mcp__github__search_issues({ owner: \"{OWNER}\", repo: \"{REPO}\", query: \"{QUERY_NL}\", perPage: 15, fields: [\"number\", \"title\", \"state\"] })`; pass no sort parameter, never re-sort, drop any whose `number` == `{ISSUE_ID}`, keep first 10 in rank order → write the kept hits' `number` values in rank order as a JSON list to `{OUTBOX}/related-hits.json`; on call error / timeout → write `Search unavailable.` to `docs/plans/{YYYYMM}/logs/{FID}/context-related-{DEBUG_ATTEMPT}.md` → skip the fetch below.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `{QUERY_NL}` = one natural-language sentence describing failure (error class, failing-test name, exception terms in sentence); never a keyword list → `mcp__linear__list_issues({ query: \"{QUERY_NL}\", team: \"{TRACKER_TEAM}\", project: \"{TRACKER_PROJECT}\", limit: 15 })` (omit null `team` / `project`); pass no `orderBy`, never re-sort, drop any whose `identifier` == `{ISSUE_ID}`, keep first 10 in rank order → write the kept hits' `identifier` values in rank order as a JSON list to `{OUTBOX}/related-hits.json`; on call error / timeout → write `Search unavailable.` to `docs/plans/{YYYYMM}/logs/{FID}/context-related-{DEBUG_ATTEMPT}.md` → skip the fetch below.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker jira start -->
   `{QUERY_KW}` = 2-4 distinctive terms describing the failure (error class, failing-test name, exception terms); one `text ~` clause per term → `mcp__jira__searchJiraIssuesUsingJql({ cloudId: \"{TRACKER_SITE}\", jql: \"project = {TRACKER_PROJECT} AND (text ~ '<term 1>' OR text ~ '<term 2>' …) AND key != {ISSUE_ID} ORDER BY updated DESC\", maxResults: 10, fields: [\"summary\", \"status\"] })` (drop `project = {TRACKER_PROJECT} AND` when `{TRACKER_PROJECT}` null; drop `AND key != {ISSUE_ID}` when `ISSUE_ID` empty) → write the kept hits' `key` values in rank order as a JSON list to `{OUTBOX}/related-hits.json`; on call error / timeout → write `Search unavailable.` to `docs/plans/{YYYYMM}/logs/{FID}/context-related-{DEBUG_ATTEMPT}.md` → skip the fetch below.
   <!-- bkit:tracker jira end -->
   <!-- bkit:tracker true start -->
   Fetch each hit and write the file (`None.` when there are none):
   ```bash
   \"{BKIT}\" issues related --hits-file=\"{OUTBOX}/related-hits.json\" --out=\"docs/plans/{YYYYMM}/logs/{FID}/context-related-{DEBUG_ATTEMPT}.md\" --issue=\"{ISSUE_ID}\"
   ```
   **If** exit 80 → per hit read the issue via the tracker MCP (**Tracker**) → append `## {ref} — {title} ({state})` plus its description and human comments to `docs/plans/{YYYYMM}/logs/{FID}/context-related-{DEBUG_ATTEMPT}.md`.
   <!-- bkit:tracker true end -->
5. Record the step — verdict, the non-empty `context-*-{DEBUG_ATTEMPT}.md` artifacts, the contexts configured, the clamp records — commit, and print the comment:
   ```bash
   \"{BKIT}\" context finalise --fid={FID} --month={YYYYMM} --file=\"{STATUS}\" --record --message=\"chore({FID}): fetch-context attempt {DEBUG_ATTEMPT}\" --number=4 --title=\"Fetch Context\" --link-ref={BRANCH}
   ```
   Hold `verdict` as `FETCH_VERDICT`.
6. Route:
   - **If** `TEST_VERDICT` = PASS → Step 5.
   - **If** `DEBUG_MODE` = SOAK → Step 8.
   - **Else** → Step 6.

### 🔒 Gate 4 — Fetch Context

```bash
\"{BKIT}\" steps gate --file=\"{STATUS}\" --workflow=debug --step=context-fetch
```

- [ ] Mechanical checks passed (`steps gate`)
- [ ] Context-fetch blocks enumerated and coverage narrated
- [ ] Context-fetch blocks run and outcomes narrated

<!-- bkit:tracker true start -->

- [ ] Related-issues search attempted

<!-- bkit:tracker true end -->

---

"

 ❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:74:26
     72|
     73|   it("honors CI reproduction before remediation and blocks unreproduce…
     74|     expect(debugStep(4)).toMatch(/ciReproduced|CI_REPRODUCED/);
       |                          ^
     75|     expect(debugStep(4)).toMatch(/REPRO[\s\S]*Step 5/);
     76|     expect(debugStep(5)).toMatch(/steps finish[^\n]*--field=ciGenerati…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > selected CI evidence routing > retains original and verifying run identities through close and auto handoff
AssertionError: expected '   - `PHASE` = `debug` → `/bkit-debug…' to match /\{RUN_URL\}|actions\/runs\/\{RUN…/runs\

- Expected:
/\{RUN_URL\}|actions\/runs\/\{RUN_ID\}/

+ Received:
"   - `PHASE` = `debug` → `/bkit-debug {FID} {REF}`"

 ❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:86:24
     84|     const auto = readWorkflow("bkit-auto.md");
     85|     const invocation = auto.split("\n").find((line) => /\/bkit-debug\s…
     86|     expect(invocation).toMatch(/\{RUN_URL\}|actions\/runs\/\{RUN_ID\}/…
       |                        ^
     87|     const close = debugStep(11);
     88|     expect(close).toContain("VERIFY_RUN_ID");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 32 passed (35)
   Start at  23:29:15
   Duration  84ms (setup 39%, tests 26%, transform 18%, import 14%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-YT1mqk/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/runs.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/runs.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (183 tests | 1 failed) 29558ms
   × requires selected other-workflow success at the exact pushed head 50ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 603ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 52ms
     ✓ filters branch and PR discovery by configured workflow and exact head 313ms
     ✓ freezes explicit workflow run attempt and all failed job pages 251ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 449ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 669ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 191ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 195ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 187ms
     ✓ rejects a workflow result count smaller than its returned records 204ms
     ✓ validates normalized fallback evidence against the requested identity 74ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 9ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 10ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 7ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 6ms
     ✓ rate_limit returns the requested fixture state 8ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 7ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 14ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 22ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 6ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 20ms
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 24ms
     ✓ rejects a failed run (12) 24ms
     ✓ rejects no run at the head (10) 12ms
     ✓ rejects runs that have not completed (11) 12ms
     ✓ rejects a green run at a superseded head (14), given --branch 18ms
     ✓ --fetch refreshes origin/<branch> before gating 133ms
     ✓ --fetch needs --branch (2) 0ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 10ms
     ✓ rejects a run without the capstone job (13) 23ms
     ✓ rejects a cancelled run (15) 13ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 24ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 25ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 25ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 24ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 24ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 25ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 25ms
       ✓ both floor steps failing is regenerable 25ms
       ✓ any failed step off the list makes the whole result unregenerable 24ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 25ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 24ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 25ms
       ✓ a timed-out step counts as failed 24ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 44ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 24ms
       ✓ refusals other than a failed run carry no failed steps 12ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 33ms
       ✓ logs the disagreement when the resolved repo differs from --repo 20ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 22ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 23ms
       ✓ a required lane naming a different lane does not refuse 23ms
       ✓ refuses when any of several required lanes was skipped 23ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 23ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 23ms
     ✓ tells an API error (20) from no run (10) 43ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 18ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 23ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 24ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 2ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 24ms
       ✓ a different SHA is ignored — the refusal stands 23ms
       ✓ honoured with no status file (no crash), the row goes to stderr 23ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 23ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 45ms
       ✓ bkit.testing.ciRequired resolves from package.json 23ms
       ✓ absent ciRequired means no refusal 23ms
       ✓ a malformed ciRequired falls back to none, never crashes 23ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 51ms
     ✓ missing --head is a usage error (2) 0ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 4ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 12ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 12ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 23ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 20ms
       ✓ without --event the newer green pull_request run masks the failed push run 22ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 43ms
       ✓ a run still in progress whose capstone already passed passes 34ms
       ✓ a capstone still running is in progress (11) 24ms
       ✓ a failed capstone fails (12) even when every other job passed 24ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 48ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 45ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 126ms
       ✓ a source change past the validated head refuses (17) and names the path 101ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 116ms
       ✓ --validated equal to --head is the plain head check 23ms
       ✓ --validated without --month / --fid is a usage error (2) 76ms
       ✓ a validated sha that is not an ancestor refuses (17) 91ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 0ms
     ✓ waits through in-progress polls, then mirrors green 0ms
     ✓ waits through in-progress polls, then mirrors red (1) 0ms
     ✓ gate 12 (red) -> 1 with the gate's reason 0ms
     ✓ gate 15 (cancelled) -> 1 with the gate's reason 0ms
     ✓ gate 13 (capstone absent) -> 1 with the gate's reason 0ms
     ✓ gate 16 (required lane skipped) -> 1 with the gate's reason 0ms
     ✓ gate 7 (unknown gate exit (never a pass)) -> 1 with the gate's reason 0ms
     ✓ no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent 0ms
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 462ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 410ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 29ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 22ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 18ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 1ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1171ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 485ms
     ✓ CLI: a failed gh workflow run exits 5 398ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1432ms
     ✓ CLI: usage errors exit 2 7ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 107ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 160ms
     ✓ a failed re-trigger push names the cause in the log 275ms
     ✓ a failed re-trigger push leaves no orphan commit behind 272ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 300ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 161ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 95ms
     ✓ gh-error: every poll errored 85ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 147ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 144ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 163ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 173ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 86ms
     ✓ CLI: verdict JSON, body scan, exit codes 555ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 462ms
     ✓ CLI: --poll-result is validated, --attempts needs it 88ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 626ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 365ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 367ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 354ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 125ms
     ✓ re-trigger on dev only uses the record of its own FID 157ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 226ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 158ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 11ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 4ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 23ms
     ✓ flags [ci skip] inherited into the landed commit body 23ms
     ✓ flags [no ci] inherited into the landed commit body 22ms
     ✓ flags [skip actions] inherited into the landed commit body 22ms
     ✓ flags [actions skip] inherited into the landed commit body 23ms
     ✓ flags [SKIP CI] inherited into the landed commit body 23ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 45ms
     ✓ an empty or unreadable sha is an error, not a clean result 24ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 414ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 366ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 488ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 411ms
     ✓ --snapshot without --repo leaves its run list unscoped 401ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 475ms
     ✓ a refused capstone records FAIL with its reason 395ms
     ✓ an unreadable PR is an API error (20) with no head 367ms
     ✓ takes exactly one of --head, --pr, --squash-of 11ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 442ms
       ✓ without --repo no call gains a --repo flag 472ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 426ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 842ms
     ✓ refuses an unknown --reason 68ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 421ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 859ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 444ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 439ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 429ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 510ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 548ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 439ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 872ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 505ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 837ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 469ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 499ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 475ms
     ✓ --file and --step go together 482ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > requires selected other-workflow success at the exact pushed head
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:146:31
    144|     ]);
    145|   };
    146|   expect((await gate()).code).toBe(0);
       |                               ^
    147|   const calls: string[][] = fs
    148|     .readFileSync(callsFile, "utf8")

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 182 passed (183)
   Start at  23:29:16
   Duration  29.69s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-CvrneN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
