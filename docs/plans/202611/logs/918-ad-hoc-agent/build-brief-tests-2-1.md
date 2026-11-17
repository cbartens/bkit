# Brief: group 2 — Workflow, rule and contract sources (tests)

Plan: Refuse Ad-hoc `bkit issues comment` Calls Implementation Plan

## Why and what

### Context & Goals

Agents working outside a `/bkit-*` workflow post their progress and research comments through `bkit issues comment`. The verb stamps `###### bkit:generated {hash}` on the first line of every body (`buildComment` and `stampMarker`), and `bkit issues text` drops every comment that carries that line (`.bkit/workflows.md` § Tracker context filtering). The real content then disappears from the next design, plan or build run on the issue, and nothing warns anyone. The reported case ran the verb without `--post` and posted the printed body through a GitHub connector, so a guard on the post path alone would not have stopped it.

Three things invite the misuse: `.agents/rules.md` § Tracker work comments says to post a comment outside workflows but not how; `bkit issues comment` is the only comment tool an agent sees in the repo; and the verb has no check of its own.

**How the step-comment call resolves its run today** (the issue's open question): it does not resolve a run at all. `postForVerb` (`.bkit/core/engine/commands/workflow/tracker.ts`) only picks a dedupe key and a progress owner: `--file` gives the `status.jsonl` run (`commentKey` → `readRunsLenient`); else `--session-dir` plus `--workflow` gives a session owner (`sessionPublication`, a folder directly under `<git-common-dir>/bkit-outbox/sessions/`); else the verb dedupes on the marker hash of the issue's last 5 comments. It never reads the workflow lock. The guard reuses those two lookups as its proof that a workflow run is calling.

Goals:

- `bkit issues comment` refuses, with and without `--post`, any call that carries no workflow-run proof, and tells the agent to post plain markdown through the tracker MCP.
- Every workflow and prompt call that posts through the verb today carries a proof the engine accepts, so no workflow comment is lost.
- The rule, the CLI doc and the comment contract say the same thing before the refusal does.

**Related Issues:**

- #918 — Ad-hoc agent comments carry the bkit:generated marker, so workflows silently drop them (open)
- #860 — Move deterministic bookkeeping and safe recovery into the engine (open)
- A consumer's issues #283, #666, #706, #707, #708, #709, #710 and #713, named in #918 as evidence (repo and titles withheld per `.agents/rules.md` § Consumer names; state not checked)

---

### Narrative

An agent working outside a `/bkit-*` workflow posts its work comments as plain markdown, so the next design, plan or build run on that issue still reads them.

### Success Criteria

1. `bkit issues comment` refuses with a usage error that points at plain markdown through the tracker MCP when the call carries no proof that a workflow or audit run is making it.
2. Every workflow and audit call that posts today still posts.
3. `.agents/rules.md` § Tracker work comments says work comments go as plain markdown through the tracker MCP, never through `bkit issues comment`, and never start with a `bkit:generated` line.
4. The `comment` row of `.bkit/cli.md` says workflow steps only, never for ad-hoc comments.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Repairing the comments already posted with the marker on a consumer's issues (by hand, or through a new `bkit issues` check that lists marked comments whose step heading matches no step of the workflow they name) | No scenario step, edge case, test row or architecture item needs it: the guard stops new marked comments without touching old ones. #918 marks it "Decision needed". | `docs/deferrals.jsonl` key `918-repair-already-marked-consumer-comments` (`needs-decision`); the owner picks an option in `Open Questions & Assumptions`, and a shipped check gets its own issue. |

## Where it fits

- Group 1: Workflow-run proof in `bkit issues comment` — done
  - TASK 1: Refuse a `bkit issues comment` call that carries no workflow-run proof, with and without `--post` — done
  - TASK 2: Say in the `comment` verb's summary that it is for workflow steps only, and regenerate the CLI doc — done
- Group 2: Workflow, rule and contract sources — this group
  - TASK 3: `bkit-auto` holds its `repo info` session, and an audit test pins a run proof on every workflow and prompt comment call — open
  - TASK 4: The Tracker work comments rule says how to post a work comment — open
  - TASK 5: The shared Comments clause tells an agent to recover its run proof instead of omitting `--session-dir` — open
  - TASK 6: State the guard in the comment contract, then rebuild, mirror and refresh the register — done

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `bkit-auto` holds its `repo info` session, and an audit test pins a run proof on every workflow and prompt comment call
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: Step 1 sub-step 2 holds `sessionDir` as `SESSION_DIR` alongside `bkit` and `outboxRoot`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `/bkit-auto` Step 1 row says `repo info --allow-detached` holds `{BKIT}`, `{OUTBOX_ROOT}` and `{SESSION_DIR}`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`: new `it` cases in the "rendered workflow comment contracts" `describe`: every wired rendered `issues comment` call, failure calls included, carries `--session-dir="{SESSION_DIR}"` or `--file=`, and a workflow that passes `{SESSION_DIR}` holds `sessionDir` as `SESSION_DIR`; the audit prompt's call carries `--body-file="{OUTBOX_ROOT}/audit-{slug}/…"`
  - **READ:** `.bkit/core/prompts/bkit-audit-generate.md`: the audit summary call and its `{OUTBOX_ROOT}/audit-{slug}/comment.md` body file
  - **READ:** `.bkit/instructions.md`: the entries for `bkit-auto.md` (`pnpm instructions:show --file bkit-auto.md`) before editing its sentences
  - **DEPENDS ON:** 1
  - **DONE WHEN:** every new `it` passes across the rendered matrix; `bkit-auto.md` Step 1 holds `SESSION_DIR`; the `/bkit-auto` row in `.bkit/core/.bkit/workflows.md` names `{SESSION_DIR}`; the no-flag `pnpm tsx .bkit/core/engine/tools/instructions.ts` reports no coverage finding for `bkit-auto.md` or `.bkit/core/.bkit/workflows.md`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `every rendered issues comment call carries a workflow-run proof its workflow holds` fails on the rendered `bkit-auto` passing `--session-dir="{SESSION_DIR}"` while never holding `sessionDir` as `SESSION_DIR`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** The Tracker work comments rule says how to post a work comment
  - **UPDATE:** `.bkit/core/.agents/rules.md`: the `Tracker work comments` bullet (the master the sync copies from) gains, after its first sentence, "Post it as plain markdown with the tracker MCP's comment tool, never through `bkit issues comment`, which is for workflow steps only, and never start it with a `###### bkit:generated` line, because workflows drop every comment that starts with one."
  - **UPDATE:** `.bkit/instructions.md`: § `tracker-work-comments`, rewritten by `pnpm instructions:sync` (new wording in `text`, the current wording moved to `retired`)
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-tracker.md`: its rule copy, rewritten by `pnpm instructions:sync`, never by hand
  - **UPDATE:** `.bkit/core/engine/audits/repo/rules-sync.test.ts`: new case asserting the `Tracker work comments` bullet's posting sentence
  - **READ:** `.bkit/core/engine/tools/instructions.ts`: run with no flag before `pnpm instructions:sync`; it must report only `tracker-work-comments` as differing from `rules.md`
  - **READ:** `.bkit/core/engine/audits/repo/rules-sync.test.ts`: if its managed-block byte-equality case goes red after the master edit, Task 6's `upgrade` re-renders `.agents/rules.md`; never hand-edit the managed block
  - **DONE WHEN:** the test below passes; `.bkit/core/engine/tools/instructions-sources.test.ts` and `.bkit/core/engine/tools/instructions.test.ts` pass, where a timeout in `instructions.test.ts` (the TRIAGED store timeout Pre-Flight § Project Context names) is accepted as unrelated only when the file passes run alone, and no budget or assertion is weakened; the three files hold the same new sentence
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/rules-sync.test.ts` `the Tracker work comments rule posts through the tracker MCP, never bkit issues comment` fails on the `Tracker work comments` bullet in `.bkit/core/.agents/rules.md` lacking the tracker MCP's comment tool or "never through `bkit issues comment`"

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** The shared Comments clause tells an agent to recover its run proof instead of omitting `--session-dir`
  - **UPDATE:** `.bkit/instructions.md`: in the `workflow-comments-github`, `workflow-comments-linear` and `workflow-comments-jira` entries, "Omit `--session-dir` when `SESSION_DIR` is not held." becomes "**If** `SESSION_DIR` is not held → re-run the workflow's Step 1 `repo info` call and hold `sessionDir` as `SESSION_DIR` before the call; NEVER drop `--session-dir`, because `bkit issues comment` refuses a call with no workflow-run proof."; the old text moves to each entry's `retired` block
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: the Comments clause, rewritten by `pnpm instructions:sync`, never by hand
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the Comments clause, rewritten by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the Comments clause, rewritten by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the Comments clause, rewritten by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Comments clause, rewritten by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Comments clause, rewritten by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: re-baselined only if its tracker-`none` render changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: re-baselined only if its tracker-`none` render changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: re-baselined only if its tracker-`none` render changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: re-baselined only if its tracker-`none` render changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: re-baselined only if its tracker-`none` render changes
  - **UPDATE:** `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`: new `it` over `commentsClause` of every rendered workflow
  - **READ:** `.bkit/instructions.md`: `pnpm instructions:show --file bkit-build.md` (and each other workflow) before editing the clause; then the no-flag `pnpm tsx .bkit/core/engine/tools/instructions.ts`, which must report only the three `workflow-comments-*` entries as differing
  - **DEPENDS ON:** 1, 3, 4
  - **DONE WHEN:** the test below passes; ``grep -n 'Omit `--session-dir`' .bkit/core/workflows/*.md`` finds nothing; `.bkit/core/engine/tools/instructions-sources.test.ts`, `.bkit/core/engine/tools/instructions.test.ts` and the snapshot test `.bkit/core/engine/render/trackers.test.ts` pass, with the same rule for the TRIAGED `instructions.test.ts` timeout as Task 4
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `no rendered Comments clause tells an agent to omit its run proof` fails on a rendered workflow's Comments clause still reading "Omit `--session-dir` when `SESSION_DIR` is not held"

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Refuse a `bkit issues comment` call that carries no workflow-run proof, with and without `--post` — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/issues.test.ts`, `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit-auto` holds `sessionDir` as `SESSION_DIR`, every rendered `issues comment` call (failure calls included) carries a workflow-run proof its workflow holds, and the audit prompt's call carries its outbox `--body-file` | Unit | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | 3 |
| The `Tracker work comments` bullet in `.bkit/core/.agents/rules.md` names the tracker MCP and "never through `bkit issues comment`" | Unit | `.bkit/core/engine/audits/repo/rules-sync.test.ts` | 4 |
| No rendered workflow's Comments clause tells an agent to omit `--session-dir` | Unit | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | 5 |
