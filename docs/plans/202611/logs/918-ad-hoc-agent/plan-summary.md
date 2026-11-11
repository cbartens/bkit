Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- 1 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-v1-draft.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/related-deferrals.md`, `docs/plans/202611/logs/918-ad-hoc-agent/related-failures.md`, `docs/plans/202611/logs/918-ad-hoc-agent/related-issues.md` |
| plan-review | CONCERNS | 9 | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-review-1.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-review-2.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-v2-reviewed.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/918-ad-hoc-agent/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-v1-draft.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/related-deferrals.md`, `docs/plans/202611/logs/918-ad-hoc-agent/related-failures.md`, `docs/plans/202611/logs/918-ad-hoc-agent/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-review-1.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-review-2.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/plan-v2-reviewed.md`, `docs/plans/202611/logs/918-ad-hoc-agent/plan-update-check.md` |

## Acceptance Scenario

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

## Open Questions

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

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #918
```

Or, to address the reasons first: `/bkit-plan #918`
