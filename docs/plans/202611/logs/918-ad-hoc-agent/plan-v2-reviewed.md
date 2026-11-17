<!-- bkit:anchor
baseSha: 1afb96fd32aa6bb0b20b5c349d7eb77c30cd48c5
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->
Verdict: PASS
<!-- verdict:end -->

# Refuse Ad-hoc `bkit issues comment` Calls Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** an agent outside any workflow runs `bkit issues comment` with no session path, no run `status.jsonl` and no audit outbox file **→ THEN** the verb exits 2 with "bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP", prints no body and posts nothing.
- **WHEN** the agent then posts its comment as plain markdown through the tracker MCP **→ THEN** the next workflow run on the issue reads that comment in its input.
- **WHEN** a workflow step posts through the verb with its `repo info` session path or its run's `status.jsonl` **→ THEN** the comment is built and posted exactly as today.
- **IF** the call names a session path outside `<git-common-dir>/bkit-outbox/sessions/`, or a `status.jsonl` that is missing or holds no run of `--workflow` **→ THEN** it is refused like a call with no proof.
- **IF** a post-close step passes a session path whose folder `workflows close` already deleted **→ THEN** the call is accepted, because losing session state only starts a fresh comment.
- **IF** an audit run posts its summary **→ THEN** a `--body-file` inside `<git-common-dir>/bkit-outbox/audit-{slug}/` is its proof, and a body file anywhere else is refused.
- **IF** the proof cannot be resolved (the verb runs outside a Git repository, or `--file` cannot be read) **→ THEN** the call is refused like a call with no proof.

### Concrete Example

**Setup:** A cloud coding agent works on a consumer's issue #42 outside any `/bkit-*` workflow. It has written a discussion agenda to `agenda.md` in the checkout. No workflow has run on the checkout in this session.

**Steps:**

1. The agent runs `bkit issues comment --issue=42 --step-number=1 --step-title="Suggested discussion agenda" --body-file=agenda.md` → System exits 2, prints `bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP` on stderr, and prints no comment body.
2. The agent posts the agenda as a plain markdown comment through the tracker MCP's comment tool → The tracker shows the comment with no `###### bkit:generated` first line.
3. The owner runs `/bkit-plan #42` → Step 1 joins the issue text, and `plan-input-1.md` holds the agenda comment.

**Outcome:** The agenda reaches the plan's input, and the issue carries no marked comment with an invented "Step 1" heading.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A workflow's Step 1 comment passes its live `--session-dir` from `repo info` | Accepted; built and posted as today |
| `bkit-auto` Step 1 / Step 2 / Failure Path comment | Accepted once `bkit-auto` holds `sessionDir` as `SESSION_DIR` from its `repo info` call (today it never holds it, so the agent drops the flag). A failure in Step 1 sub-step 1 or 2 comes before `ISSUE_ID` is held (sub-step 3), so its Failure Path comment is skipped as today and no comment is lost to the guard; the Task 3 audit pins that the `repo info` sub-step holds `sessionDir` as `SESSION_DIR` |
| Post-close comment (`/bkit-design` Step 12 and `/bkit-plan` Step 8 Owner Answers, `/bkit-debug` Step 11 Close Workflow) whose session folder `workflows close` deleted | Accepted: the path still sits directly under `<git-common-dir>/bkit-outbox/sessions/`; posted as a new comment as today |
| `--session-dir` outside `<git-common-dir>/bkit-outbox/sessions/` (for example `/tmp/s`, or a nested path below a session) and no other proof | Refused, exit 2 |
| `--file` names a `status.jsonl` that holds a run of `--workflow` (any state; `/bkit-build` Step 16 posts after its close) | Accepted |
| `--file` names a missing file, or a `status.jsonl` with no run of `--workflow` | Refused, exit 2 |
| `--kind=audit` with `--body-file` inside `<git-common-dir>/bkit-outbox/audit-{slug}/` for the same `--audit-slug` | Accepted |
| `--kind=audit` with a body file outside that folder, or under another slug's folder | Refused, exit 2 |
| No proof and no `--post` (print mode, the reported case) | Refused, exit 2; no body and no `commentFile` printed |
| No proof with `--post` | Refused, exit 2, before any tracker request; the nonfatal exit-0 `preparation` path does not apply |
| Session minted from the main checkout, comment run from a linked worktree | Accepted: both resolve the same Git-common directory |
| Tracker `none`, or an issue-less FID | The proof check runs first; with a proof the verb skips the post as today |
| The verb runs outside a Git repository, or `--file` names a path that cannot be read as a file (for example a directory) | Refused, exit 2: a proof that cannot be resolved is no proof |
| The whole `<git-common-dir>/bkit-outbox/` folder is gone and `--session-dir` is given in a non-canonical form (macOS `/var/…` against a `/private/var/…` Git-common directory) | Accepted: both sides are compared through the realpath of their nearest existing ancestor |
| A workflow call whose agent no longer holds `SESSION_DIR` (for example after a context reset) | The Comments clause tells the agent to re-run its Step 1 `repo info` call and pass the new session; the comment posts as a fresh progress comment instead of being refused |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

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
| The generated `.bkit/cli.md` region is current after the summary change | Static | `.bkit/core/engine/tools/cli-doc.test.ts` (existing region check) | 2 |
| `bkit-auto` holds `sessionDir` as `SESSION_DIR`, every rendered `issues comment` call (failure calls included) carries a workflow-run proof its workflow holds, and the audit prompt's call carries its outbox `--body-file` | Unit | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | 3 |
| The `Tracker work comments` bullet in `.bkit/core/.agents/rules.md` names the tracker MCP and "never through `bkit issues comment`" | Unit | `.bkit/core/engine/audits/repo/rules-sync.test.ts` | 4 |
| The new Tracker work comments wording matches across `.agents/rules.md`, `.bkit/instructions.md` and `bkit-utility-update-tracker.md` | Static | `.bkit/core/engine/tools/instructions-sources.test.ts` (existing) | 4 |
| No rendered workflow's Comments clause tells an agent to omit `--session-dir` | Unit | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | 5 |
| Mirrors re-rendered with no drift, `dist/` rebuilt, capability register fresh | Static | `pnpm bkit check`, `pnpm bkit:check:dist`, `pnpm bkit:graph:check` | 6 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Change | Kind | Who notices | Handling |
| --- | --- | --- | --- |
| `bkit issues comment` exits 2 for a call with no workflow-run proof, with and without `--post` | Breaking (CLI contract) | Any agent or script calling the verb ad hoc; the verb's `Use` is already `workflow` | Intended. The message names the tracker MCP; `.bkit/cli.md` and the rule say it first. |
| Refusal message: `bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP` | New user-visible text | Agents reading stderr | Wording from #918, prefixed with the verb name so it reads on its own. |
| `commentRunProof` and `sessionsRoot` exported from `.bkit/core/engine/commands/workflow/tracker.ts` | New internal names | Engine code and tests | `sessionsRoot` is extracted from `sessionPublication`, whose contract is unchanged. |
| `bkit-auto` Step 1 holds `SESSION_DIR`, and every workflow call carries a run proof | Workflow change | A consumer who updates the package without `bkit upgrade` keeps the released 6.1.1 mirrors, which pass no run proof on any fileless workflow comment, because the explicit `--session-dir` on those calls arrived after 6.1.1 (`docs/plans/202611/logs/826-append-routine-workflow/build-diff-3-1.md`). Refused until the upgrade: `bkit-auto` Step 1, Step 2 and Failure Path; the Step 1 comments of `/bkit-design`, `/bkit-plan`, `/bkit-build` and `/bkit-debug`; `/bkit-build` Step 16; the `/bkit-design` Step 12 and `/bkit-plan` Step 8 Owner Answers; `/bkit-debug` Step 11. The 6.1.1 forms of `/bkit-ship` Step 1 (which passes `--file` today) and of the audit prompt's body-file location were not checked. | No migration is the recommendation (Open Questions); `bkit check` reports the stale mirrors, and the release entry's Upgrade Notes names the refusal, these calls and `bkit upgrade` (decision `918-comment-guard-no-migration-upgrade-note`). |
| The shared Comments clause tells an agent without `SESSION_DIR` to re-run its Step 1 `repo info` call instead of omitting `--session-dir` | Shared workflow instruction (all six workflows) | Agents running any workflow after `bkit upgrade` | Delivered through `pnpm instructions:sync` and the rendered mirrors (decision `918-comments-clause-recovers-run-proof`). |
| `Tracker work comments` rule gains the posting sentence | Managed rule text in `.agents/rules.md` | Every host's agents after `bkit upgrade` | Delivered through the managed block and the rendered mirrors. |

No database, route, page or layout change.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question:** The Acceptance Scenario has no Narrative or Success Criteria: there is no design, #918 is bug-shaped with no change-shape fields, and the plan may not invent them → the owner writes them.
  - **Options:** A) Write both into this plan's `Acceptance Scenario` before ticking Gate 1 — fastest, and the plan stays the one source · B) Add `### Narrative` and `### Success Criteria` to #918 and re-run `/bkit-plan #918` — keeps the issue complete, and costs a second plan run
  - **Recommended:** A) — the rest of the scenario, the edge cases and the test matrix already pin the behaviour.
  - **Default if unanswered:** Gate 1 stays unticked and the build does not start.
- **Open Question:** What proves a workflow run is calling? #918 suggests "a held lock or an `IN_PROGRESS` `status.jsonl` for the FID". Tracing every caller shows five legitimate calls that hold neither: `/bkit-auto` Step 1, Step 2 and Failure Path (no lock, no `status.jsonl`), the post-close Owner Answers comments of `/bkit-design` Step 12 and `/bkit-plan` Step 8 and the `/bkit-debug` Step 11 close comment (lock released, run closed), and `bkit-audit-generate` (no lock).
  - **Options:** A) Outbox or run proof: a `--session-dir` path directly under `<git-common-dir>/bkit-outbox/sessions/`, a `--file` `status.jsonl` holding a run of `--workflow`, or an audit `--body-file` under `<git-common-dir>/bkit-outbox/audit-{slug}/` — reuses `postForVerb`'s own lookups, and needs only `bkit-auto` to hold its session · B) Lock or `IN_PROGRESS` run for the issue's FID, as #918 suggests — needs an issue-to-FID lookup the verb does not have today and refuses the five calls above · C) B plus named exemptions for those five — each exemption is a hole an ad-hoc call can copy
  - **Recommended:** A) — every current caller already passes one of these, the lookup is the one the verb already runs, and an ad-hoc agent has none of them.
  - **Default if unanswered:** A).
- **Open Question:** Must the session folder still exist?
  - **Options:** A) The path only has to sit directly under `<git-common-dir>/bkit-outbox/sessions/` — keeps `.bkit/trackers.md` § Workflow comment delivery ("Losing this state starts fresh") and the post-close comments working unchanged · B) The folder must exist — stronger, but refuses the post-close comments, whose folder `workflows close --session-dir` deletes, and breaks two `tracker.integration.test.ts` cases that post after deleting the session
  - **Recommended:** A) — an ad-hoc agent has no such path unless it ran `bkit repo info`, and existence adds nothing a workflow can rely on.
  - **Default if unanswered:** A).
- **Open Question:** What proves an audit summary? #918 suggests requiring the report file named by `--audit-slug`.
  - **Options:** A) `--body-file` inside `<git-common-dir>/bkit-outbox/audit-{slug}/` (the prompt already writes `{OUTBOX_ROOT}/audit-{slug}/comment.md` there) — present on every run, bound to the slug, and no prompt edit · B) The report `docs/audits/{YYYYMM}/{slug}.md` exists — the issue's example, but an audit with no **Create** path has no report, and its summary would be refused
  - **Recommended:** A) — it covers every audit run the prompt allows.
  - **Default if unanswered:** A).
- **Open Question:** `.agents/rules.md` § Tracker MCPs says "Do tracker reads / writes via `bkit` verbs". A work comment has no verb that may post it after this change.
  - **Options:** A) State the exception in § Tracker work comments only: post it as plain markdown with the tracker MCP's comment tool, never through `bkit issues comment` — one rule edit, and the specific rule names the exception · B) Also reword § Tracker MCPs to "where a `bkit` verb covers the write" — no rule reads as a contradiction, but the shared-clause sync rewrites that rule in every carrier
  - **Recommended:** A) — the narrower edit, and the work-comments rule is the one an agent reads when it posts.
  - **Default if unanswered:** A).
- **Open Question:** The comments already posted with the marker on a consumer's issues (about 20, listed in #918) stay hidden from workflow input until their first line is removed.
  - **Options:** A) The owner removes the first line by hand once — no bkit change; the guard stops new ones · B) Ship a `bkit issues` check that lists marked comments whose step heading matches no step of the workflow it names — helps every consumer find their own, and is a new verb with tracker reads and step-table matching · C) Both
  - **Recommended:** A) — a one-off repair; B) is recorded as a deferral for its own cycle.
  - **Default if unanswered:** A); the deferral row stays open.
- **Open Question:** A consumer who updates the package but has not run `bkit upgrade` keeps the released 6.1.1 mirrors, which pass no run proof on any fileless workflow comment. Until the upgrade the guard refuses `bkit-auto` Step 1, Step 2 and Failure Path, the Step 1 comments of design, plan, build and debug, build Step 16, the design and plan Owner Answers and debug Step 11 (`Breaking Changes & Naming Review`). Each refusal is silent: exit 2 writes no `commentFile` for the MCP fallback and no friction row.
  - **Options:** A) No migration — `bkit upgrade` re-renders the managed mirrors, `bkit check` already reports them stale, and the release entry's Upgrade Notes names the refusal, the affected calls and `bkit upgrade`; every fileless workflow comment is lost until the consumer upgrades · B) Accept a `--workflow` call without a proof — keeps old mirrors posting, and opens a hole any ad-hoc call can copy · C) A) plus a stale-mirror hint: a refused call that carries `--post` or `--workflow` adds "a workflow call needs `bkit upgrade`" to the message and logs one `[bkit-tracker]` diagnostic with no paths or body — the loss becomes visible, but ad-hoc agents that pass `--post` are told to upgrade too
  - **Recommended:** A) — a migration could only do what `bkit upgrade` already does, and the comments return as soon as the consumer upgrades (decision `918-comment-guard-no-migration-upgrade-note`).
  - **Default if unanswered:** A).
- **Assumption:** An ad-hoc agent does not pass a path under `<git-common-dir>/bkit-outbox/sessions/`, a run `status.jsonl` or an audit outbox body file → if wrong, that agent passes the guard. Two copies are easy: `bkit repo info` mints a valid session path for any caller, and every consumer repo commits `docs/plans/**/status.jsonl` files that hold past runs; both patterns appear in the workflow files an agent reads. The guard is a speed bump, and the rule and CLI doc still tell the agent not to.
- **Assumption:** The thirteen `issues comment` calls in `.bkit/core/workflows/*.md` and `.bkit/core/prompts/bkit-audit-generate.md` are every caller of the verb; engine verbs (`steps finish`, `workflows fail` / `handover` / `close` / `links`, `plans comment`) build comments through `buildComment` directly → if a caller is missed, its comment is refused (exit 2, no `commentFile` for the MCP fallback); the Task 3 audit test pins every workflow and prompt call.
- **Assumption:** A refused workflow call is nonfatal to the workflow, because every comment block runs without `|| exit` and the **Comments** rule treats a comment failure as nonfatal → if wrong, a wrongly refused call fails a gate; the Task 3 audit test keeps that from shipping.
- **Assumption:** #860's planned `issues comment --result-file` mode lands after this plan, or carries the same guard → if #860 lands first, Task 1 applies the guard to that mode too.
- **Assumption:** Codex, OpenCode, Cursor and Antigravity call the same CLI, so the engine guard covers them all, and the rule reaches each host through the rendered mirrors → if a host posts without the CLI, only the rule stops it.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Why not chosen |
| --- | --- |
| Rule and doc wording only | Agents that never read the repo's docs (the reported cloud agent) keep using the verb; #918 asks for the engine guard first. |
| Guard on a held workflow lock or an `IN_PROGRESS` `status.jsonl` for the issue's FID (#918's example) | Refuses five legitimate callers (`bkit-auto` Steps 1 and 2 and Failure Path, the post-close Owner Answers and debug close comments, the audit summary), and the verb has no issue-to-FID lookup to reuse. |
| Guard only the `--post` path | The reported case printed the body without `--post` and posted it through a tracker connector. |
| Guard `buildComment` itself | Engine verbs (`steps finish`, `workflows fail` / `handover` / `close` / `links`, `plans comment`) build comments through it with their own run context; guarding there needs proof plumbing through each of them for no added protection. |
| Strip the marker from ad-hoc bodies instead of refusing | The comment would still carry an invented `### Step N — …` heading and teach agents that a workflow tool is the comment tool. |
| A new `bkit issues post` verb for plain comments | Adds a second comment path; the tracker MCP already posts plain markdown, and the rule can name it. |

**Recommendations for a future phase:**

- A `bkit issues` check that lists marked comments whose step heading matches no step of the workflow they name (deferred; see `Out of Scope`).
- The same guard for `bkit plans comment`, which also prints a marked body with no run proof, if an ad-hoc use of it is ever seen.
- A proof an agent cannot copy: a token minted by `repo info` or `workflows start` and checked by the verb, so a hand-run `repo info` or a committed `status.jsonl` no longer passes. It is a new contract and needs its own issue and design.
- Bind the run proof to the issue: accept a `--file` `status.jsonl` only when its run's issue matches `--issue`, and a session path only when its progress binding names the same issue. It changes the proof the owner confirms in `Open Questions & Assumptions`.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Repairing the comments already posted with the marker on a consumer's issues (by hand, or through a new `bkit issues` check that lists marked comments whose step heading matches no step of the workflow they name) | No scenario step, edge case, test row or architecture item needs it: the guard stops new marked comments without touching old ones. #918 marks it "Decision needed". | `docs/deferrals.jsonl` key `918-repair-already-marked-consumer-comments` (`needs-decision`); the owner picks an option in `Open Questions & Assumptions`, and a shipped check gets its own issue. |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Structured `issues comment --result-file` mode and the standalone audit comment contract | #860 — Move deterministic bookkeeping and safe recovery into the engine (open); `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md` Tasks updating `issues.ts` and `bkit-audit-generate.md` | Task 1's guard in `comment.run`; the audit proof | Keep separate; whichever lands second applies the guard to the new mode and keeps the audit body file inside `<outbox>/audit-{slug}/`. |
| `/bkit-design` Step 12 and `/bkit-plan` Step 8 Owner Answers pass `--workflow` with a session folder that `workflows close` already deleted, so each round logs `[bkit-tracker] invocation association unavailable` and a `comment-association` friction row | This plan's investigation (no ledger row) | The post-close callers this plan keeps accepting by session path | Needs a design decision: dropping `--session-dir` there would also drop their proof, so the fix must name another one (for example the `{OUTBOX}` body file). |
| `/bkit-debug` Step 11 close comment passes no `--workflow` and no `--purpose`, unlike `/bkit-build` Step 16's terminal close comment | This plan's investigation (no ledger row) | A post-close caller of the guarded verb | Keep deferred; the guard accepts it unchanged. |
| `bkit plans comment` prints a marked body with no run proof | This plan's investigation (no ledger row) | The same misuse on a second verb | Keep deferred until an ad-hoc use of it is seen. |
| Repair the comments already posted with the marker | `docs/deferrals.jsonl` `918-repair-already-marked-consumer-comments` (OPEN, `needs-decision`) | The marked comments the guard leaves behind | Keep as this plan's `Out of Scope` row; the owner picks A, B or C. |
| Tracker boundary fault matrix times out under concurrent machine load | `docs/failures.jsonl` `tracker-boundary-fault-matrix-concurrency-timeout` (OPEN) | `tracker.integration.test.ts`, which Task 1 edits and runs | Keep separate; record a recurrence during Task 1. |
| Tracker 200ms delivery test expires before its shell stub is observed | `docs/failures.jsonl` `tracker-new-comment-budget-shell-observation-flake` (OPEN) | The `tracker.test.ts` run inside Task 1's `pnpm test` | Keep separate. |
| `tracker.test.ts` "preserves generated first line" timeout | `docs/failures.jsonl` `test-timeout-222573a81f37d000` (OPEN) | The marker surface of `tracker.test.ts`, run inside Task 1's `pnpm test` | Keep separate. |
| Instruction-corpus store timeout under the full gate | `docs/failures.jsonl` `instructions-corpus-store-timeout-under-full-gate` (TRIAGED) | `instructions.test.ts`, which Tasks 4 and 5 run | Keep separate. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable: no roles.
- [x] **User Input** — the `--session-dir`, `--file` and `--body-file` paths are untrusted CLI input, validated in the verb's handler (`commentRunProof`) before any file is read for the body or any tracker request is made: each resolves to an absolute path, and the session and audit paths must sit inside this repository's Git-common outbox (`docs/security.md` § Workflow comment ownership). A path that cannot be resolved counts as no proof (Edge Cases, the fail-closed test in Task 1).
- [x] **PII** — the refusal prints a fixed message and never echoes the given paths or the comment body (`docs/security.md` § PII, `docs/observability.md` § Tracker reporting diagnostics); Task 1's first test asserts it.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable: no new secret; tracker tokens are untouched.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` and `pnpm-lock.yaml` stay as they are.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (run 2026-11-11) lists only dev-dependency bumps (`vitest` 5.0.5 → 5.1.0, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.91.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5); none blocks this change. Toolchain: Node v24.16.0 (`engines.node` `>=24`), pnpm 10.34.7 (`packageManager` pin), gh 2.102.0; `node_modules/.bin/tsx` and `vitest` present.
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo text and symbol searches are recorded per row in `Reuse Inventory`, and the framework built-in and current-practice searches below its table.
- [ ] **User Context:** every file the runbook names was opened during planning or review; the owner supplies the Narrative and Success Criteria (Open Questions).
- [ ] **Project Context:** `docs/decisions.jsonl` (`465-tracker-markers-are-h6-headings-not-html-comments`, `675-engine-owns-tracker-io-mcp-fallback`, `860-existing-artifact-serialization`), `docs/knowledge.jsonl`, `docs/deferrals.jsonl` and `docs/failures.jsonl` were searched for the marker, `issues comment`, work comments and session folders; no decision row conflicts. Four failure rows are open on test files this plan runs, and none is caused by it:
  - `tracker-boundary-fault-matrix-concurrency-timeout` (OPEN): "preserves substantive step results under every comment boundary fault" in `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` (Task 1).
  - `tracker-new-comment-budget-shell-observation-flake` (OPEN): "reserves new comment opportunity within total delivery budget" in `.bkit/core/engine/commands/workflow/tracker.test.ts` (Task 1's `pnpm test`).
  - `test-timeout-222573a81f37d000` (OPEN): "preserves generated first line and extracts versioned h6 section markers" in `.bkit/core/engine/commands/workflow/tracker.test.ts` (Task 1's `pnpm test`).
  - `instructions-corpus-store-timeout-under-full-gate` (TRIAGED): `.bkit/core/engine/tools/instructions.test.ts` (Tasks 4 and 5).
  - **If** one of these cases times out → run it alone (`pnpm vitest run {file} -t "{case}"`), as the rows do for evidence, and record the recurrence; NEVER weaken its budget or assertions.
- [ ] **Testing & Quality:** unit tests in `*.test.ts` over a real temp git repo, one integration test in `*.integration.test.ts` across real CLI processes against the stub tracker, Static checks for the generated docs and mirrors (`docs/testing.md` § Tiers).
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no new credential; the tests keep the existing `BKIT_LINEAR_API_KEY` stub handling.
- [ ] **Schema State:** not applicable — bkit has no database (`docs/data-schema.md`).
- [ ] **Architecture & UI:** the guard sits behind the tracker reporting boundary (`docs/architecture.md` § Tracker reporting boundary); no UI.
- [ ] **Observability:** the refusal is a usage error on stderr; no new log prefix, and the `[bkit-tracker]` diagnostics (`docs/observability.md` § Tracker reporting diagnostics) are unchanged.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database (`docs/data-schema.md`). The guard reads two file-based records and writes none.

### Data Schema Usage

- **Input (Read):** a run `status.jsonl` named by `--file`: its `workflow-started` runs, folded by `readRunsLenient` (`.bkit/core/engine/commands/workflow/locks.ts`), filtered to `--workflow`.
- **Input (Read):** the Git-common outbox paths `<git-common-dir>/bkit-outbox/sessions/` and `<git-common-dir>/bkit-outbox/audit-{slug}/`, resolved with `git rev-parse --path-format=absolute --git-common-dir`; only the location of the given path is checked.
- **Output (Write):** None — a refused call writes no `engine-action` row, no `commentFile` and no friction row.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Resolve this repository's outbox `sessions/` folder for a proof check | `.bkit/core/engine/commands/workflow/tracker.ts` | Serena `get_symbols_overview` on `issues.ts`; `grep -n 'sessionDir\|session-dir' .bkit/core/engine/commands/workflow/*.ts`; `grep -rln 'bkit-outbox' .bkit/core/engine`; read `sessionPublication`, `bindRunPublication`, `newSessionDir` (`repo.ts`), `outboxRoot` (`lib.ts`) | `sessionPublication` in `tracker.ts` — resolves `<common>/bkit-outbox/sessions` and checks a session sits directly in it, but requires the folder to exist and returns `undefined` without `--workflow` | EXTEND | Extract its sessions-folder resolution into one exported helper that `sessionPublication` and the new proof check both call; `sessionPublication`'s contract and callers stay unchanged. |
| Decide whether a `bkit issues comment` call carries a workflow-run proof | `.bkit/core/engine/commands/workflow/tracker.ts` | `grep -n 'export function postForVerb\|function runActionKey\|function commentKey' tracker.ts`; read `postForVerb`, `commentKey`, `runActionKey`, `endedRunActionKey`, `progressBinding`; read `runNumber` (`.bkit/core/engine/ledgers/status.ts`); `grep -n 'export function readRunsLenient' locks.ts`; `docs/capabilities.md` tracker rows; `grep -rn 'issues comment' .bkit/core/workflows .bkit/core/prompts` (13 calls) | `postForVerb` already looks up `--file` runs (`commentKey` → `readRunsLenient`) and `--session-dir` ownership (`sessionPublication`); `endedRunActionKey` returns `undefined` for a missing file or no run of the workflow; no function answers "is a workflow calling" | EXTEND | Add `commentRunProof` beside `postForVerb`: the run proof is `endedRunActionKey(file, workflow)` not being `undefined` (the lookup #918 asks the guard to reuse), with its `workflow` parameter widened to `string \| undefined` so an omitted `--workflow` uses the latest run's workflow as `commentKey` already does. `runActionKey` is not the proof: `runNumber` returns 1 for a workflow with no run, so it keys a file that holds no such run. The session and audit checks reuse `sessionsRoot` and `outboxRoot`; `tracker.ts` already imports `locks.js` and `lib.js`, so no new module edge. |
| Refuse an unproven call before the body is built | `.bkit/core/engine/commands/workflow/issues.ts` | read `issuesCommand.verbs.comment.run`, `commentBody`, `buildComment`; `grep -n 'CommandError(EXIT.USAGE' issues.ts` | The `comment` verb's `run` already throws `CommandError(EXIT.USAGE, …)` for a bad `--purpose` before `commentBody` | EXTEND | Call `commentRunProof` right after the `--purpose` check and throw the usage error on `null`, so print mode and `--post` both stop before `commentBody`. |
| Say "workflow steps only" in the CLI doc | `.bkit/core/engine/commands/workflow/issues.ts` | `grep -n 'comment' .bkit/core/.bkit/cli.md`; read the `cli:start` / `cli:end` rule in `.bkit/core/.bkit/cli.md`; `grep -n '"cli:sync"' package.json` | The `comment` verb's `summary` string, rendered into `.bkit/core/.bkit/cli.md` by `pnpm cli:sync` (`.bkit/core/engine/tools/cli-doc.ts`) | EXTEND | Append "workflow steps only; never for ad-hoc comments" to the summary and regenerate the region; the region is never edited by hand. |
| `bkit-auto` holds a session to pass as proof | `.bkit/core/workflows/bkit-auto.md` | `grep -n 'SESSION_DIR\|repo info' .bkit/core/workflows/bkit-auto.md`; read `repo.ts` `info` output (`sessionDir` printed with `--allow-detached` too); read the auto lifecycle case in `tracker.integration.test.ts` (it already passes a session for `--workflow=auto`) | Step 1 sub-step 2 runs `repo info --allow-detached` and holds `bkit` and `outboxRoot`, but not `sessionDir`, while three later calls pass `--session-dir="{SESSION_DIR}"` | EXTEND | Hold `sessionDir` as `SESSION_DIR` in that sub-step; update the matching `.bkit/core/.bkit/workflows.md` `/bkit-auto` row. |
| Pin that every workflow and prompt comment call carries a proof it holds | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | `grep -rln 'issues comment' .bkit/core/engine --include` (audit tests: `generated-marker`, `catalog-parity`, `comply-gate-wiring`, `local-gate-audit`); read `generated-marker.test.ts`; read `catalog-parity.test.ts` `reportingCommands`, `commentsClause` and "renders explicit invocation association at fileless and lifecycle posting sites" | `catalog-parity.test.ts` already asserts `--(?:session-dir\|file)=` on every rendered non-failure `--post` call across 6 workflows x 4 trackers x 5 hosts; `generated-marker.test.ts` pins only that bodies come from `bkit issues comment` | EXTEND | Add `it` cases to the "rendered workflow comment contracts" `describe` in `catalog-parity.test.ts`: every rendered `issues comment` call, failure calls included, carries a proof its workflow holds, and the audit prompt's call carries its outbox `--body-file`. This covers the rendered mirrors as well as the sources, instead of a second source-only check in `generated-marker.test.ts`. |
| Stop the shared Comments clause telling agents to drop their run proof | `.bkit/instructions.md` | ``grep -n 'Omit `--session-dir`' .bkit/instructions.md`` (the `workflow-comments-github`, `-linear` and `-jira` entries, carried by all six workflows); read the `workflow-comments-github` entry and its `retired` block; read `commentsClause` in `catalog-parity.test.ts` | The three store entries hold the clause text that `pnpm instructions:sync` writes into every workflow | EXTEND | Rewrite the sentence in the three entries, move the old text to `retired`, and run `pnpm instructions:sync`. |
| Tell agents how to post a work comment | `.bkit/core/.agents/rules.md` | `grep -n -i 'work comment' .agents/rules.md`; `grep -rln -i 'Tracker work comments' .bkit/core .bkit/instructions.md`; read `.bkit/instructions.md` § `tracker-work-comments` | The `Tracker work comments` rule (master text in `.bkit/instructions.md`, carried by `bkit-utility-update-tracker.md`) | EXTEND | Add the posting sentence to the rule, the old text to `retired`, then `pnpm instructions:sync`. |
| State the guard in the comment contract | `.bkit/core/.bkit/workflows.md` | `grep -n 'Tracker context filtering\|issues comment' .bkit/core/.bkit/workflows.md`; read § Comment Lifecycle; read `docs/security.md` § Workflow comment ownership | § Comment Lifecycle describes what `bkit issues comment` builds and how a post is deduped | EXTEND | One sentence on the proofs and the refusal there; `docs/security.md` § Workflow comment ownership links to it instead of repeating it. |

**Framework built-ins and current practice:** `package.json` has one runtime dependency (`cross-spawn`) and no CLI framework, so there is no third-party guard or middleware primitive to reuse. bkit's own command framework (`.bkit/core/engine/commands/`) offers `CommandError(EXIT.USAGE, …)` for a refused call, which the guard uses. No current-practice search was run beyond the repo: the guard is a check over bkit's own outbox and status files.

## Architecture & Component Changes

No new file. The guard sits in the engine behind the tracker reporting boundary (`docs/architecture.md` § Tracker reporting boundary); the workflow, rule and doc edits are sources that `pnpm tsx .bkit/core/engine/cli.ts upgrade` mirrors.

**Ledger rows:** `918-comment-guard-workflow-run-proof`, `918-comment-guard-print-and-post`, `918-work-comments-plain-markdown-via-tracker-mcp`, `918-repair-already-marked-consumer-comments`, `918-comments-clause-recovers-run-proof`, `918-comment-guard-no-migration-upgrade-note`

### Database Migrations

None — bkit has no database.

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/tracker.ts`

- **Existence Check:** the file exists; `sessionPublication` (line 1974) and `postForVerb` (line 2070) read in this session.
- Extract the sessions-folder resolution out of `sessionPublication` into an exported `sessionsRoot(cwd: string): string` (`<git-common-dir>/bkit-outbox/sessions`, throwing when there is no Git-common directory, as now). `sessionPublication` calls it; its checks and result are unchanged. It keeps its own `fs.realpathSync(sessions)` and its throw for a missing or foreign session (`tracker.ts:1983-1985`), because `bindRunPublication` and `postForVerb` turn that throw into the `comment-association` diagnostic (pinned by `tracker.integration.test.ts:553-557`).
- Widen `endedRunActionKey`'s `workflow` parameter from `string` to `string | undefined`; `commentKey` already takes the latest run's workflow when it is `undefined`. Its existing callers pass a string and are unchanged.
- Add `export function commentRunProof(cwd: string, o: { sessionDir?: string; file?: string; workflow?: string; kind?: string; auditSlug?: string; bodyFile?: string }): "session" | "run" | "audit" | null`:
  - `"session"`: `path.resolve(cwd, o.sessionDir)` has a basename other than empty, `.` or `..`, and its parent equals `sessionsRoot(cwd)`. Both sides are compared through the realpath of their nearest existing ancestor with the remaining segments appended, so a deleted session folder, or a deleted outbox, still compares canonically (macOS `/var` against `/private/var`). The session folder itself is never passed to `fs.realpathSync`, because that throws for a folder `workflows close` deleted.
  - `"run"`: `endedRunActionKey(o.file, o.workflow)` is not `undefined`, that is the file exists and holds a run of `o.workflow` (of the latest run's workflow when `o.workflow` is omitted). `runActionKey` is not used: `runNumber` returns 1 for a workflow with no run, so it would accept a `status.jsonl` that holds no such run.
  - `"audit"`: `o.kind` is `audit`, `o.auditSlug` matches `^[a-z0-9-]+$`, and `o.bodyFile` resolves inside `<outboxRoot(cwd)>/audit-{auditSlug}/`.
  - `null` otherwise, and on any lookup error (no Git-common directory, unreadable file): a call that cannot prove a run is refused, never waved through.
- `postForVerb` and `sessionPublication` keep their behaviour; no dedupe key, progress binding or friction row changes.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** the file exists; `issuesCommand.verbs.comment` (line 972), `commentBody` (line 675) and `buildComment` (line 587) read in this session.
- In `comment.run`, after the `--purpose` check and before `commentBody`, call `commentRunProof(ctx.cwd, { sessionDir, file, workflow, kind, auditSlug, bodyFile })` from the flags. On `null`, throw `new CommandError(EXIT.USAGE, "bkit issues comment is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP")`. The throw sits outside the `try` around `commentBody`, so the exit-0 `preparation` fallback never swallows it.
- `comment.summary` becomes "The exact body of a ###### bkit:generated step, failure, handover, or audit comment; workflow steps only, never for ad-hoc comments."
- `buildComment` and `commentBody` are unchanged; engine verbs keep building comments through them.

#### [MODIFY] `dist/`

- **Existence Check:** `pnpm build` output; `pnpm bkit:check:dist` fails when it drifts.
- Rebuilt with `pnpm build` and committed with the engine change (`.agents/rules.md` § Engine builds).

### Tests

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.test.ts`

- **Existence Check:** the file exists; `describe("bkit issues comment")` (line 439) and `describe("bkit issues comment --post")` (line 803) read in this session.
- The `comment` helper, the `--post` describe's calls and the direct `run(cwd, ["issues", "comment", "--kind=failure", …, "--error-file=none.md"])` call (lines 696-704, which expects exit 3) carry a session path under `<cwd>/.git/bkit-outbox/sessions/` (the folder need not exist), so every existing body and post test keeps its meaning; the `--file` test already carries its proof.
- Each row of the `refuses %j (exit 2)` table (lines 767-783) also asserts that stderr lacks "workflow steps only", so the table still tells its own usage errors apart from the guard.
- A new `describe("bkit issues comment workflow-run proof")` holds the seven unit cases of Task 1 in the `Derived Test Matrix`, and the summary case lands in Task 2.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

- **Existence Check:** the file exists; `report` (line 172), the legacy-receipts case (line 720) and the session-association cases (lines 532 and 561) read in this session.
- The two calls that carry no proof today (the `Legacy` draft at line 723 and the `Issue less` report at line 739) pass the case's session path.
- A new case runs an ad-hoc call across a real CLI process and asserts exit 2, the stderr message and no new stub-tracker request.
- A new case mints a session with `repo info` in the main checkout, adds a linked checkout with `git worktree add` (the harness pattern of "keeps auto and phase progress separate across worktrees", lines 592-607, which mints its session inside the worktree instead), and posts from the linked checkout with that session.

#### [MODIFY] `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`

- **Existence Check:** the file exists; `reportingCommands`, `commentsClause` and "renders explicit invocation association at fileless and lifecycle posting sites" (lines 105-150) read during review.
- New `it` cases in the "rendered workflow comment contracts" `describe`, over the rendered matrix (6 workflows x 4 trackers x 5 hosts):
  - Every wired rendered `issues comment` call, failure calls included, carries `--session-dir="{SESSION_DIR}"` or `--file=`, and a workflow that passes `{SESSION_DIR}` holds `sessionDir` as `SESSION_DIR`.
  - `.bkit/core/prompts/bkit-audit-generate.md`'s `issues comment` call carries `--body-file="{OUTBOX_ROOT}/audit-{slug}/…"`.
  - No rendered Comments clause (`commentsClause`) tells an agent to omit `--session-dir`.

#### [MODIFY] `.bkit/core/engine/audits/repo/rules-sync.test.ts`

- **Existence Check:** the file exists; its content-invariant cases (for example "the external-content invariant is present in the managed block") read during review.
- A new `it`: the `Tracker work comments` bullet in `.bkit/core/.agents/rules.md` names the tracker MCP's comment tool and "never through `bkit issues comment`".

### Workflows, Rules and Docs (sources)

#### [MODIFY] `.bkit/core/workflows/bkit-auto.md`

- **Existence Check:** the file exists; Step 1 sub-step 2 (line 104) read in this session.
- Step 1 sub-step 2 holds `sessionDir` as `SESSION_DIR` alongside `bkit` and `outboxRoot`. The three `issues comment` calls already pass `--session-dir="{SESSION_DIR}"`.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Comment Lifecycle (line 471) and the `/bkit-auto` Step 1 row (line 1162) read in this session.
- The `/bkit-auto` Step 1 row says `repo info --allow-detached` holds `{BKIT}`, `{OUTBOX_ROOT}` and `{SESSION_DIR}`.
- § Comment Lifecycle gains one paragraph: `bkit issues comment` builds or posts a body only for a call carrying a workflow-run proof (the three proofs), and otherwise exits 2 telling the agent to post plain markdown through the tracker MCP.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists; § `tracker-work-comments` (line 1074) read in this session.
- `pnpm instructions:sync` copies the changed bullet into the entry's `text` block and moves the current wording to `retired` (`syncSources`, `.bkit/core/engine/tools/instructions-sources.ts`); the entry already exists, so no entry is added first.
- **Existence Check:** the `workflow-comments-github` (line 5321), `workflow-comments-linear` (line 5340) and `workflow-comments-jira` (line 5360) entries read during review; each `text` block ends "Omit `--session-dir` when `SESSION_DIR` is not held."
- In each of the three entries, that sentence becomes "**If** `SESSION_DIR` is not held → re-run the workflow's Step 1 `repo info` call and hold `sessionDir` as `SESSION_DIR` before the call; NEVER drop `--session-dir`, because `bkit issues comment` refuses a call with no workflow-run proof." The old text moves to `retired`, and `pnpm instructions:sync` writes the new clause into every carrier.

#### [MODIFY] `.bkit/core/workflows/bkit-{auto,design,plan,build,debug,ship}.md`

- **Existence Check:** each file carries the Comments clause (``grep -n 'Omit `--session-dir`' .bkit/core/workflows/*.md``).
- `pnpm instructions:sync` rewrites each file's Comments clause from the store; no hand edit.

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/*.none.txt`

- **Existence Check:** five phase snapshots exist (`bkit-build`, `bkit-debug`, `bkit-design`, `bkit-plan`, `bkit-ship`); none for `bkit-auto`.
- Re-baselined only if the tracker-`none` render of a workflow changes; the Comments clause comes from the GitHub, Linear and Jira entries, so the build checks the none render rather than assuming it.

#### [MODIFY] `.bkit/core/.agents/rules.md`

- **Existence Check:** the file exists; the `Tracker work comments` bullet (line 83) read in this session. It is the master of `## Rules` in `.bkit/instructions.md`.
- The bullet gains, after its first sentence: "Post it as plain markdown with the tracker MCP's comment tool, never through `bkit issues comment`, which is for workflow steps only, and never start it with a `###### bkit:generated` line, because workflows drop every comment that starts with one."

#### [MODIFY] `.bkit/core/prompts/bkit-utility-update-tracker.md`

- **Existence Check:** the file exists; its copy of the rule (line 77) read in this session.
- `pnpm instructions:sync` rewrites its copy of the rule; no hand edit.

#### [MODIFY] `.bkit/core/.bkit/cli.md`

- **Existence Check:** the file exists; the generated `issues` table (line 211) read in this session.
- `pnpm cli:sync` regenerates the `comment` row from the new summary; no hand edit inside `cli:start` / `cli:end`.

#### [MODIFY] `docs/security.md`

- **Existence Check:** the file exists; § Workflow comment ownership (line 64) read in this session.
- One sentence: a `bkit issues comment` call with no workflow-run proof is refused, see `.bkit/workflows.md` § Comment Lifecycle.

#### [MODIFY] `docs/capabilities.md`

- **Existence Check:** the file exists; its `issues` → `tracker` edge (line 381) read in this session.
- `pnpm bkit:graph:refresh` rewrites the register for the new `issues.ts` → `tracker.ts` call; no hand edit.

### Mirrors

`pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders, once at the end (`.agents/rules.md` § Install to mirror):

- `.agents/rules.md`, `.bkit/workflows.md` and `.bkit/cli.md`.
- The copies of all six workflows (the Comments clause) and of `bkit-utility-update-tracker` under `.claude/`, `.cursor/`, `.opencode/` and `.codex/` (`.codex/agents/*.toml` included).
- `.agents/skills/bkit-auto/SKILL.md`, `.agents/plugins/bkit/skills/bkit-auto/SKILL.md`, `.agents/plugins/bkit/agents/bkit-audit-generate.md` and the `bkit-utility-update-tracker` copy in `.agents/plugins/bkit/agents/`, which carry the same `issues comment` calls and rule text.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None — the guard adds a check in front of the existing comment path and replaces no artifact.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`) | § Comment Lifecycle: the workflow-run proofs and the refusal. `/bkit-auto` Step 1 row: holds `{SESSION_DIR}`. |
| `.bkit/core/.agents/rules.md` (mirrored to `.agents/rules.md`) | `Tracker work comments`: post as plain markdown through the tracker MCP, never through `bkit issues comment`, never with a `###### bkit:generated` first line. |
| `.bkit/instructions.md` | § `tracker-work-comments`: the new text, the current text under `retired`. § `workflow-comments-github`, `-linear` and `-jira`: the proof-recovery sentence, the current text under `retired`. |
| `.bkit/core/workflows/*.md` | The Comments clause in all six workflows, rewritten by `pnpm instructions:sync`. |
| `.bkit/core/prompts/bkit-utility-update-tracker.md` | Its rule copy, rewritten by `pnpm instructions:sync`. |
| `.bkit/core/.bkit/cli.md` (mirrored to `.bkit/cli.md`) | `issues comment` row regenerated by `pnpm cli:sync`: "workflow steps only, never for ad-hoc comments". |
| `docs/security.md` | § Workflow comment ownership: one sentence linking the refusal to `.bkit/workflows.md` § Comment Lifecycle. |
| `docs/capabilities.md` | Register refreshed by `pnpm bkit:graph:refresh` for the new `issues.ts` → `tracker.ts` call. |
| `docs/decisions.jsonl` | Five rows written by this plan (see `Ledger rows`). |
| `docs/deferrals.jsonl` | One row written by this plan (see `Out of Scope`). |
| `docs/knowledge.jsonl` | None. |
| `docs/architecture.md` | None — the tracker reporting boundary is unchanged. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None — no database. |
| `docs/design.md` | None — no UI. |
| `docs/testing.md` | None — no new test file or pattern. |
| `docs/observability.md` | None — the refusal is a usage error, not a new log line. |
| `CHANGELOG.md` | None in this change: `CHANGELOG.md` has no unreleased section, and each entry is written when its version is cut. Decision `918-comment-guard-no-migration-upgrade-note` records the Upgrade Notes line the release entry carries: the refusal, the stale-mirror calls it refuses and `bkit upgrade`. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert {COMMIT}` of the change, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` | The revert restores the unguarded verb, the old rule text and the old mirrors together; nothing persistent was written. |
| **Risk window** | Between a consumer's package update and their `bkit upgrade` | Every fileless workflow comment of the released 6.1.1 mirrors is refused in that window: `bkit-auto` Step 1, Step 2 and Failure Path, the Step 1 comments of design, plan, build and debug, build Step 16, the Owner Answers comments and debug Step 11 (`Breaking Changes & Naming Review`). |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the engine guard first, then the workflow, rule and doc sources, then the mirrors. One PR for all six tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Workflow-run proof in `bkit issues comment`

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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Workflow, rule and contract sources

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

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** State the guard in the comment contract, then rebuild, mirror and refresh the register
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Comment Lifecycle gains one paragraph naming the three workflow-run proofs and the exit-2 refusal that points at the tracker MCP
  - **UPDATE:** `.bkit/instructions.md`: a `## Local Instructions` entry for the new § Comment Lifecycle paragraph, only when the no-flag `pnpm tsx .bkit/core/engine/tools/instructions.ts` reports a coverage finding for it
  - **UPDATE:** `docs/security.md`: § Workflow comment ownership gains one sentence linking the refusal to `.bkit/workflows.md` § Comment Lifecycle
  - **UPDATE:** `docs/capabilities.md`: refreshed by `pnpm bkit:graph:refresh` on the staged engine change, never edited by hand
  - **DEPENDS ON:** 1, 2, 3, 4, 5
  - **DONE WHEN:** `pnpm build` then `pnpm bkit:check:dist` passes; the no-flag `pnpm tsx .bkit/core/engine/tools/instructions.ts` reports no coverage finding; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered the mirrors (Architecture § Mirrors) and `pnpm bkit check` reports no drift; `pnpm bkit:graph:check` passes; `pnpm bkit:gate:static-unit-integration` passes; in a fresh scratch consumer, `node dist/cli.js issues comment --issue=1 --step-number=1 --step-title=x` exits 2 with the refusal message
  - **TEST FIRST:** n/a — docs, generated mirrors and the regenerated capability register

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest gate this change needs: static, unit with coverage, bats and integration) and `pnpm bkit check` pass.
- [ ] **Test Synchronization:** no E2E tests exist for `bkit issues comment`; the existing unit and integration callers that post a step comment (the `issues.test.ts` helper and its `STEP` args, the direct `--kind=failure` `run` call at lines 696-704 of `issues.test.ts`, and the two `issues comment` calls near lines 723 and 739 of `tracker.integration.test.ts`) gain a workflow-run proof in Task 1, and the `refuses %j (exit 2)` table gains its "workflow steps only" absence check.
- [ ] **Known open failures:** a timeout in a case Pre-Flight § Project Context names is re-run alone and recorded; no budget or assertion is weakened to make it pass.
- [ ] **Build Configuration:** test files stay out of `dist/` through the existing `"**/*.test.ts"` entry in the `tsconfig.json` `exclude` list; this plan adds no test-only file outside that pattern.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/issues.test.ts`):** the refusal and its no-echo check, the no-post-on-refusal case, the session, status and audit proofs, the fail-closed case, the issue-less ordering case and the `comment` summary; each test builds its own temp git repo and outbox, so no state leaks between tests.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/tracker.integration.test.ts`):** an ad-hoc call through the spawned CLI exits 2 and the stub tracker records no comment request; a session minted in the main checkout posts from a linked worktree.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/catalog-parity.test.ts`):** every rendered `issues comment` call, failure calls included, carries `--session-dir` or `--file` its workflow holds, the audit prompt carries its outbox `--body-file`, `bkit-auto` holds `SESSION_DIR`, and no rendered Comments clause tells an agent to omit `--session-dir`.
- [ ] **Unit (`.bkit/core/engine/audits/repo/rules-sync.test.ts`):** the `Tracker work comments` bullet names the tracker MCP and "never through `bkit issues comment`".
- [ ] **Static (`.bkit/core/engine/tools/cli-doc.test.ts`, `.bkit/core/engine/tools/instructions-sources.test.ts`, `.bkit/core/engine/tools/instructions.test.ts`, `.bkit/core/engine/render/trackers.test.ts`):** the generated `.bkit/cli.md` row, the synced rule and clause copies and the render snapshots match their sources.
- [ ] **Apply local migrations:** not applicable; the plan has no database and no migration.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** run `pnpm build`, then, in a scratch git repo with bkit installed from the packed tarball, run `node {bkit}/dist/cli.js issues comment --issue=1 --kind=step --step-number=1 --step-title="Notes" --body-file=notes.md` with no proof flag; it exits 2, prints the "workflow steps only" message naming the tracker MCP, and prints no `###### bkit:generated` body.
- [ ] **Step 2:** in the same repo, take `sessionDir` from `bkit repo info` and rerun the call with `--session-dir={sessionDir} --workflow=plan`; it exits 0 and prints the marked step body as before.
- [ ] **Step 3:** run `/bkit-auto` on a test issue in a dogfood consumer and confirm its Step 1 comment posts, so the auto workflow's new `SESSION_DIR` reaches the call.
