> @cbartens/bkit@5.5.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/ship-invariants.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests | 6 failed) 18ms
✓ bkit-ship.md — staging hygiene (banned patterns) (2)
✓ has no `git add -A` anywhere (full content) 1ms
✓ has no literal `git add` anywhere — every stage goes through bkit ledgers 0ms
✓ bkit-ship.md — push-timing invariant (feature-branch pushes before merge) (5)
✓ pushes the feature branch only to open a missing PR, in Integrate (B2), and in Commit + Push Bookkeeping 0ms
✓ force-pushes only in Integrate (B2), and never a bare --force 0ms
✓ the pre-merge bookkeeping push is a plain push — never forced 0ms
✓ the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row 0ms
✓ pushes the branch to open a missing PR only when ahead of dev, non-force, before bkit prs open 0ms
✓ bkit-ship.md — bookkeeping and status writes (4)
✓ Step 1 resolves the status log through bkit status path, inside the worktree 0ms
✓ Step 1 opens the run in the worktree straight after the lock, before any tracker write 0ms
✓ no fence reassigns STATUS — every status write takes the resolved {STATUS} 1ms
✓ every ship audit row is written through a command, into {STATUS} 1ms
✓ every workflow writes its own workflow-started row (#492) (5)
✓ bkit-design.md opens its run with bkit workflows start --workflow=design 0ms
✓ bkit-plan.md opens its run with bkit workflows start --workflow=plan 0ms
✓ bkit-build.md opens its run with bkit workflows start --workflow=build 0ms
✓ bkit-debug.md opens its run with bkit workflows start --workflow=debug 0ms
✓ bkit-ship.md opens its run with bkit workflows start --workflow=ship 0ms
✓ no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467) (6)
✓ bkit-design.md 0ms
✓ bkit-plan.md 0ms
✓ bkit-build.md 0ms
✓ bkit-debug.md 0ms
✓ bkit-ship.md 0ms
✓ RED-PROOF: the hand-append shapes are caught 0ms
✓ bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --strict (#380) (2)
✓ appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt 0ms
✓ a row that did not land stops the step — no re-grep of the ledger 0ms
✓ bkit-ship.md — canonical 14 ship-* step-key set (1)
✓ publishes the canonical 14 ship-* step-key set (no invented names) 0ms
✓ bkit-ship.md — the merge is pinned to the head the gate passed (3)
✓ never merges through raw gh pr merge 0ms
✓ the merge gate runs before bkit prs merge, which is pinned to the gate's head 0ms
✓ F4a: the merge gate is handed the run's status log, and snapshots before deciding 0ms
✓ bkit-ship.md — dev writes live in commands (1)
✓ no fence checks out, commits to or pushes dev by hand; sync-dev, close and flush do 0ms
✓ bkit-ship.md — build-challenge remediation regressions (4)
✓ F1: B2 conflict-resolve stages tracked source modifications before its commit and push 0ms
✓ F2: no single-quoted jq program carries a shell ${...} expansion 0ms
✓ F3: B1 integrates through `bkit prs update-branch`, never a raw gh call 0ms
✓ F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17 0ms
❯ bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge (2)
✓ no cross-Bash-tool-call handoff survives anywhere in the workflow 0ms
× Step 10 re-reads the labels through the tracker and passes them to the merge 4ms
✓ bkit-ship.md — Failure Path single-write contract (8)
✓ records the failure through bkit workflows fail, booked where the runtime books 0ms
✓ flushes through bkit workflows handover --flush, once 0ms
✓ runs no git push, commit or second write of its own 0ms
✓ does not route any step back into the Failure Path 0ms
✓ writes .deferred-blocked with touch under BOOK_ROOT 0ms
✓ gitignores routing sentinels in the rendered file and the template source 0ms
✓ wires bkit ledgers into exactly 2 bash regions 0ms
✓ every bkit ledgers stage / commit stops the step on a non-zero exit 0ms
❯ bkit-ship.md — issue-less runs and the main guard (5)
× Step 10 label re-read skips when ISSUE_ID is empty 1ms
× naming warning fires issue-less when the branch is not feat/FID 1ms
× Step 10 MCP merge asserts base dev 0ms
× Step 14.3 labels skip when ISSUE_ID is empty 1ms
× a ship on dev or main prints the engine refusal and stops 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge > Step 10 re-reads the labels through the tracker and passes them to the merge
AssertionError: expected '## 🤖 Step 10 — Merge Gate + Merge PR…' to contain '**Skip if** `ISSUE_ID` empty'

- Expected

* Received

- **Skip if** `ISSUE_ID` empty

* ## 🤖 Step 10 — Merge Gate + Merge PR
*
* 1. Assert the gate at the PR's current head, CI checked at `VALIDATED_HEAD` (the ONLY merge precondition) — the pre-merge snapshot goes to the outbox before the gate decides; a title carrying a skip token refuses (18); a refusal is recorded on `{STATUS}`:
* ```bash

  ```
* git fetch origin "{SHIP_BRANCH}" 2>/dev/null
* "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
* ```

  ```
* Route:
* - **If** exit 0 → hold `mergeHead` as `{GATE_HEAD}` → sub-step 2.
* - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run), or 17 (non-bookkeeping change past `VALIDATED_HEAD`) → run counter routing:
*      ```bash
*      REVALIDATE_ATTEMPT=$("{BKIT}" counters rows --file="{STATUS}" --workflow=ship --type=ship-revalidate-dispatch --position=next | jq -er .value) || exit 2
*      "{BKIT}" counters route --name=REVALIDATE_ATTEMPT --value="$REVALIDATE_ATTEMPT" --limit=MAX_REVALIDATE_ATTEMPT --continue=step-9 --exceeded=failure-path
*      ```
*      - **If** exit 0 (`next` = `step-9`) → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
*      - **Else** → **Failure Path** (exit 1: max-retry exhaustion).
* - **Else** (12/13/15/16/18/20) → **Failure Path**.
* 2. Merge with an empty body and `--match-head` (GitHub refuses when the head moved). Re-read labels from the tracker so ` bkit [auto route]` rides the squash subject on `bkit:auto` — never carried forward from Step 1's `{LABELS}`; `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired:
* <!-- bkit:tracker github start -->
* `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `labels` → `LABELS`.
* <!-- bkit:tracker github end -->
* <!-- bkit:tracker linear start -->
* `mcp__linear__get_issue({ id: "{ISSUE_ID}" })` → extract `labels[].name` → `LABELS`.
* <!-- bkit:tracker linear end -->
* <!-- bkit:tracker jira start -->
* `mcp__jira__getJiraIssue({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", view: "evidence" })` → extract `fields.labels` → `LABELS`.
* <!-- bkit:tracker jira end -->
* ```bash

  ```
* "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
* ```

  ```
* Route:
* - **If** exit 0 **or** 7 → hold `verdict` as `{MERGE_VERDICT}`, `failures` as `{MERGE_FAILURES}`, `state`.
* - **Else** → **Failure Path**.
* 3. Finish (bookkeeping to `$BOOK_ROOT`):
* ```bash

  ```
* "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --title="Merge Gate + Merge PR"
* ```

  ```
* Hold `attempt` as `{MERGE_ATTEMPT}`.
* 4. Route:
* - **If** `state` = MERGED → Step 13.
* - **If** `state` != MERGED → run counter routing:
*      ```bash
*      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:current --file="{STATUS}" --workflow=ship --limit=MAX_MERGE_ATTEMPT --continue=step-11 --exceeded=failure-path
*      ```
*      - **If** exit 0 (`next` = `step-11`) → Step 11.
*      - **Else** → **Failure Path** (exit 1: max-retry exhaustion).
* - **Else** → **Failure Path**.
*
* ### 🔒 Gate 10 — Merge Gate + Merge PR

❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:573:18
571| expect(step).toContain("never carried forward from Step 1's `{LABE…
    572|     // With no issue there is nothing to re-read: no tracker call, `{L…
573| expect(step).toContain("**Skip if** `ISSUE_ID` empty");
| ^
574| });
575| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

FAIL .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — issue-less runs and the main guard > Step 10 label re-read skips when ISSUE_ID is empty
AssertionError: github: expected '<!-- bkit:tracker github start -->\n …' to contain '**Skip if** `ISSUE_ID` empty'

- Expected

* Received

- **Skip if** `ISSUE_ID` empty

* <!-- bkit:tracker github start -->
* `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `labels` → `LABELS`.
* <!-- bkit:tracker github end -->

❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:668:51
666| const wired = blocks(step10()).filter((b) => b.kind !== "true");
667| expect(wired).toHaveLength(3);
668| for (const b of wired) expect(b.text, b.kind).toContain(SKIP);
| ^
669| expect(step10()).toContain("empty when no tracker is wired or `ISS…
670| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

FAIL .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — issue-less runs and the main guard > naming warning fires issue-less when the branch is not feat/FID
AssertionError: expected '2. **If** `BRANCH` does not contain `…' to contain '`ISSUE_ID` empty **or**'

Expected: "`ISSUE_ID` empty **or**"
Received: "2. **If** `BRANCH` does not contain `{FID}` **and** does not contain `{ISSUE_ID}` (case-insensitive) → emit `[bkit-ship] WARNING branch {BRANCH} not named for {FID} — shipping it as named` → continue."

❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:677:18
675| expect(line, "no naming-warning line").toBeDefined();
676| // An empty ISSUE_ID is contained in every branch name, so it cann…
677| expect(line).toContain("`ISSUE_ID` empty **or**");
| ^
678| expect(line).toContain("does not contain `{FID}`");
679| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

FAIL .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — issue-less runs and the main guard > Step 10 MCP merge asserts base dev
AssertionError: no exit 80 route on the merge: expected -1 to be greater than -1
❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:685:53
683| const exit80 = step.indexOf("**If** exit 80");
684| const merge = step.indexOf("merge_pull_request");
685| expect(exit80, "no exit 80 route on the merge").toBeGreaterThan(-1…
| ^
686| expect(merge).toBeGreaterThan(exit80);
687| const between = step.slice(exit80, merge);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

FAIL .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — issue-less runs and the main guard > Step 14.3 labels skip when ISSUE_ID is empty
AssertionError: true: expected '<!-- bkit:tracker true start -->\n …' to contain '**Skip if** `ISSUE_ID` empty'

- Expected

* Received

- **Skip if** `ISSUE_ID` empty

* <!-- bkit:tracker true start -->
* Compute the label transition and board move:
* ```bash

  ```
* "{BKIT}" issues labels --phase=merged --board=review --issue="{ISSUE_ID}" --owner-repo="{OWNER_REPO}" {LABEL_FLAGS}
* ```

  ```
* → hold `labels` as `{LABELS}`, `trackerState` as `{TRACKER_STATE}`, `board` as `{BOARD}`, `boardSkipped`.
* <!-- bkit:tracker true end -->

❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:700:49
698| const all = blocks(item);
699| expect(all.length, "no tracker blocks in sub-step 3").toBe(4);
700| for (const b of all) expect(b.text, b.kind).toContain(SKIP);
| ^
701| });
702|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

FAIL .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — issue-less runs and the main guard > a ship on dev or main prints the engine refusal and stops
AssertionError: expected '"{BKIT}" worktrees setup --workflow=s…' to contain '**If** exit 7'

- Expected

* Received

- **If** exit 7

* "{BKIT}" worktrees setup --workflow=ship --fid="{FID}" --month="{YYYYMM}" --detect --branch="{PROMPT_BRANCH}"
* ```

  ```
* → hold `worktreePath` as `{WORKTREE_PATH}`, `branch` as `{SHIP_BRANCH}`.
*

❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:708:19
706| expect(at).toBeGreaterThan(-1);
707| const route = ship.slice(at, ship.indexOf("8. Enter the worktree",…
708| expect(route).toContain("**If** exit 7");
| ^
709| expect(route).toContain("releases stay manual");
710| expect(route).toContain("**STOP**");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯

Test Files 1 failed (1)
Tests 6 failed | 42 passed (48)
Start at 17:25:19
Duration 113ms (transform 50%, tests 34%, setup 7%, import 5%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-K0VfC6/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
