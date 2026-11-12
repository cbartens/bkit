# Brief: group 1 — Workflow-run proof in `bkit issues comment` (tests)

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

- Group 1: Workflow-run proof in `bkit issues comment` — this group
  - TASK 1: Refuse a `bkit issues comment` call that carries no workflow-run proof, with and without `--post` — open
  - TASK 2: Say in the `comment` verb's summary that it is for workflow steps only, and regenerate the CLI doc — open
- Group 2: Workflow, rule and contract sources — next
  - TASK 3: `bkit-auto` holds its `repo info` session, and an audit test pins a run proof on every workflow and prompt comment call — open
  - TASK 4: The Tracker work comments rule says how to post a work comment — open
  - TASK 5: The shared Comments clause tells an agent to recover its run proof instead of omitting `--session-dir` — open
  - TASK 6: State the guard in the comment contract, then rebuild, mirror and refresh the register — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Refuse a `bkit issues comment` call that carries no workflow-run proof, with and without `--post`
  - **UPDATE:** `sessionPublication` in `.bkit/core/engine/commands/workflow/tracker.ts`: resolve the sessions folder through the extracted `sessionsRoot`; checks, result, its `fs.realpathSync(sessions)` and its throw for a missing or foreign session unchanged
  - **UPDATE:** `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts`: `workflow` parameter widened to `string | undefined`; existing callers unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: add the exported `sessionsRoot` and `commentRunProof` (session path compared through the realpath of the nearest existing ancestor, run proof through `endedRunActionKey`, audit outbox body file; `null` on any lookup error)
  - **UPDATE:** `issuesCommand` in `.bkit/core/engine/commands/workflow/issues.ts`: `comment.run` calls `commentRunProof` after the `--purpose` check and throws `CommandError(EXIT.USAGE, "bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP")` on `null`, outside the `commentBody` try
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: the `comment` helper, the `--post` describe's calls and the direct `--kind=failure` `run` call at lines 696-704 carry a session path under `<cwd>/.git/bkit-outbox/sessions/`; each row of the `refuses %j (exit 2)` table also asserts stderr lacks "workflow steps only"; new `describe("bkit issues comment workflow-run proof")`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: the `Legacy` draft and `Issue less` report calls in the legacy-receipts case pass the case's session path; new ad-hoc refusal case; new main-checkout-session-from-worktree case
  - **READ:** `postForVerb` in `.bkit/core/engine/commands/workflow/tracker.ts`: the `--file` and `--session-dir` lookups the proof reuses
  - **READ:** `runNumber` in `.bkit/core/engine/ledgers/status.ts`: why `runActionKey` keys a file with no run, so the proof uses `endedRunActionKey`
  - **READ:** `readRunsLenient` in `.bkit/core/engine/commands/workflow/locks.ts`: the run fold for the status proof
  - **READ:** `outboxRoot` in `.bkit/core/engine/commands/lib.ts`: the Git-common outbox root for the audit proof
  - **READ:** `buildComment` in `.bkit/core/engine/commands/workflow/issues.ts`: stays unguarded for engine verbs
  - **DONE WHEN:** the nine tests below pass; `pnpm test` and `pnpm test:integration` pass with every existing `bkit issues comment` case green; a timeout in one of the pre-existing open failures (`tracker.test.ts` "reserves new comment opportunity within total delivery budget" and "preserves generated first line and extracts versioned h6 section markers", `tracker.integration.test.ts` "preserves substantive step results under every comment boundary fault"; Pre-Flight § Project Context) is accepted as unrelated only when the case passes run alone, and no budget or assertion is weakened; `pnpm typecheck` passes; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `refuses a call with no workflow-run proof and prints no body` fails on the call exiting 0 with the marked body printed, stderr lacking "workflow steps only", or stderr echoing the passed `--session-dir`, `--file` or `--body-file` value
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `refuses an unproven post before any tracker request` fails on the stubbed `fetch` being called, or a `commentFile` being written, for a `--post` call with no proof
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it` fails on a `--session-dir` outside the outbox `sessions/` folder, or nested below a session, being accepted, or on a deleted session folder, or a non-canonical session path once the whole outbox is gone, being refused
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run` fails on a `--file` naming a missing file, or a `status.jsonl` with no run of `--workflow`, being accepted
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere` fails on an audit `--body-file` outside `<outbox>/audit-{slug}/`, or under another slug's folder, being accepted
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `refuses a call whose proof cannot be resolved` fails on a call run outside any Git repository with a `--session-dir`, or with a `--file` naming a directory, being accepted
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `checks the run proof before skipping an issue-less call` fails on an issue-less call with no proof exiting 0 with `skipped: "no-issue"`, or on the same call with a session proof no longer skipping
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `an ad-hoc comment with no run proof exits 2 and reaches no tracker` fails on the real CLI exiting 0 and the stub tracker receiving a new comment
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `accepts a session minted in the main checkout from a linked worktree` fails on the call from the `git worktree add` checkout exiting 2 with "workflow steps only"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Say in the `comment` verb's summary that it is for workflow steps only, and regenerate the CLI doc
  - **UPDATE:** `issuesCommand` in `.bkit/core/engine/commands/workflow/issues.ts`: `comment.summary` ends "; workflow steps only, never for ad-hoc comments."
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the `issues` table's `comment` row, regenerated by `pnpm cli:sync`, never edited by hand
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: new case asserting the `comment` verb's summary
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the test below passes; `.bkit/core/.bkit/cli.md`'s `comment` row contains "workflow steps only, never for ad-hoc comments"; a second `pnpm cli:sync` changes nothing; `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` has rebuilt `dist/` after `pnpm cli:sync` and `pnpm bkit:check:dist` passes, so Group 1's commit stages `dist/` with the engine edit and passes the `.husky/pre-commit` dist check (`.agents/rules.md` § Engine builds)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `the comment verb's summary says it is for workflow steps only` fails on `issuesCommand.verbs.comment.summary` lacking "workflow steps only, never for ad-hoc comments"

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A call with no workflow-run proof exits 2 with "workflow steps only", prints no comment body, and echoes none of the given paths | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| A refused call with `--post` makes no tracker request and writes no `commentFile` | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Session proof: a path directly under the outbox `sessions/` folder is accepted, also once deleted and also in non-canonical form once the whole outbox is gone; a path outside it, or nested below a session, is refused | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Status proof: `--file` with a run of `--workflow` is accepted; a missing file, or one with no such run, is refused | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Audit proof: a `--body-file` under its own `audit-{slug}` outbox folder is accepted; one elsewhere, or under another slug's folder, is refused | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Fail closed: a call run outside any Git repository, or with a `--file` that cannot be read as a file, is refused | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Ordering: an issue-less (or tracker-`none`) call with no proof exits 2; the same call with a session proof still skips the post with `skipped: "no-issue"` | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Across real CLI processes, an ad-hoc call exits 2 and the stub tracker receives no comment | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 1 |
| A session minted with `repo info` in the main checkout is accepted from a `git worktree add` checkout | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 1 |
| The `comment` verb's summary says "workflow steps only, never for ad-hoc comments" | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 2 |
