# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

Fixed by the grill (not re-opened here): every one-right-answer piece is a `bkit manage <verb>` (Q1); Claude desktop app, `LOCAL` runtime only, preflight refuses elsewhere and only warns on model/effort (Q3, Q8, Q9, Q11); landing goes through `/bkit-ship` in local mode as #938 will deliver it (Q10); one owner yes per run for filing sub-issues (Q5); reports are new parent-issue comments at push batches, question batches, parks and run end (Q7); closing tasks run once at run end (Q6, Q17); hard limits are enforced by permissions and engine checks (Q19). The three approaches differ only in where the run state lives and how the `manage` verbs read it.

Existing pieces every approach reuses:

- `bkit decisions apply --by=headless|owner|rerun` and `bkit decisions pending` (`.bkit/core/engine/commands/workflow/decisions.ts:521-700`): the third answerer is one more `--by` value, and the "please confirm" list is `pending` run over each child FID.
- `bkit locks acquire --kind=workflow` (`.bkit/workflows.md` § Concurrency lock): the manager holds the parent FID's lock, so a second `/bkit-manage #N` is refused (exit 8) while the first is live.
- The machine `tests` lock with `BKIT_TEST_SLOTS` (`.bkit/workflows.md` § Tests lock): already counts test slots across repos; `bkit branches push` already takes a slot through the pre-push hook. `bkit ci min-push` (`.bkit/core/engine/commands/ci/ci.ts:924`) is the cheap pre-check before the long hook.
- `bkit status row` / `bkit status resume` (`.bkit/core/engine/commands/workflow/status.ts`): arbitrary kebab-case row types, and the fold that tells which step each child run is in.
- `bkit runtime` `classify` (`.bkit/core/engine/commands/workflow/runtime.ts:89`) for the `LOCAL` refusal; `bkit issues fetch|text|blocked-by|comment` (`.bkit/core/engine/commands/workflow/issues.ts`) for sub-issue reads, mention strings and the report comment.
- The progress-line renderer behind `progressLine` (`.bkit/workflows.md` § Progress Lines) for the bar format.

## Approach A — Parent `status.jsonl` plus a fold over the child runs ⭐ Recommended

One new noun, `bkit manage` in `.bkit/core/engine/commands/workflow/manage.ts` (registered in `commands/registry.ts`), plus one Claude-only workflow source `.bkit/core/workflows/bkit-manage.md`; the manager-only facts (workers and their issue, the queue order and lane, open questions with their blocking count, manager assumptions, the owner's sub-issue yes, rules version, parked reasons, items owed before a landing, queued ledger rows) are rows in the parent FID's own `status.jsonl`, written only by `bkit manage` verbs, while everything that already has a home (each child's step, verdict, decision-file status, lock holder, tests-lock holders, what landed on `dev`) is read live from that home; `bkit manage state` folds both into one short text block that the manager re-reads after every context reset.

- `Complexity`: `MEDIUM`. About ten verbs (`preflight`, `kickoff`, `state`, `next`, `workers`, `answer`, `review`, `land-check`, `push-check`, `progress`, `report`), each a thin composition over existing commands; the only new fold is the manager row types.
- Extensibility: a new fact is a new row type plus one fold branch; a new child phase needs nothing, because child state comes from the child's own `status.jsonl`. The `/bkit-ship` local contract (#938) plugs in behind `land-check` without changing the state shape.
- Risk: a fold that reads many child logs can disagree with the tracker (for example an issue closed by hand). Mitigation inside the approach: `state` reads tracker issue state as authoritative (`.bkit/workflows.md` § Tracker Writes Are Best-Effort: reads stay authoritative) and prints any disagreement as a line for the manager to judge, never auto-fixing it. Second risk: the parent's `status.jsonl` lives in the main checkout's `docs/` tree, which must not change while the push hook runs; the manager rows are written by the engine, so `manage` can hold them in the outbox and flush after the push, exactly as the issue asks for ledger rows.
- Maintenance: low to medium. One writer, one format, one fold; the row types sit beside the existing ones and are covered by the same status tests. No second state file to keep in sync.
- Reuse vs new: reuses status rows and fold, locks, the tests lock as the slot counter, `decisions apply`/`pending` (new `--by=manager`, recorded `Accept (assumed, by the manager)`), `ci min-push`, `branches push`, `issues` reads and comment posting, the progress renderer. Net-new: the `manage` noun and its row types, the estimate (sizes from sub-issue labels x measured hours per size, a range that narrows as landings record real durations), the file-overlap check (`git diff --name-only` of each running build against each candidate plan's file list), the `bkit-manage.md` workflow, a Claude-only render filter in install, the `/bkit-build` pause change that prints each option's target step, a `.bkit/providers.md` exception row and a `DETAILS.md` limits section. Follows decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only` directly.

## Approach B — One mutable run-state JSON document

Same `bkit manage` noun and workflow, but the whole run state (including copies of each child's current step and verdict) is one file, `docs/plans/{YYYYMM}/logs/{FID}/manage-state.json`, rewritten read-modify-write by each verb, with a rendered `manage-state.md` the manager re-reads after a reset.

- `Complexity`: `LOW` to `MEDIUM`. A plain JSON schema is the quickest thing to write and to read; no fold logic.
- Extensibility: adding a field is easy, but every child-state field is a copy that must be refreshed, so each new child phase or status needs a refresh path.
- Risk: the copy goes stale. A worker finishes, the manager's context resets before it calls the refresh verb, and the document still says "building", so an issue is started twice or never landed, which breaks success criterion 2. A crash mid-write also loses the whole state, where an append-only file loses one row.
- Maintenance: medium to high. Two homes for each child fact (the child's `status.jsonl` and the copy), against the `One home per fact` goal, and a structured engine-fact file outside `status.jsonl` that decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only` turned down for the same reason (a second place for structured facts needs a merge reader). The rendered `.md` is engine-written structured text, the shape that decision rejected.
- Reuse vs new: reuses the same commands as A for reads, locks, slots, decisions and push. Net-new: the schema, the writer with atomic replace, the renderer, and a refresh verb per child source.

## Approach C — Tracker as the run state

Same `bkit manage` noun and workflow, but the run state lives on the tracker: the queue and lane as sub-issue labels and order, workers, assumptions and questions as fields in the latest parent report comment, which `bkit manage state` re-reads and parses after a reset; nothing new is kept in the checkout.

- `Complexity`: `MEDIUM`. Parsing a structured block back out of a comment, plus label writes per state change.
- Extensibility: poor. Each new fact is a new label or a new comment field, and Linear and Jira need their own mapping through the tracker blocks (`.bkit/trackers.md`).
- Risk: tracker writes are best-effort by rule (`.bkit/workflows.md` § Tracker Writes Are Best-Effort), so a failed comment post silently loses state; rate limits or an expired token (this session's GitHub MCP is returning 401) stop the manager from knowing what it was doing. It also turns the report comment, which the owner reads on a phone, into a machine format.
- Maintenance: high. Three tracker shapes, label sprawl on every child issue, and parsing that breaks when the report wording changes.
- Reuse vs new: reuses `issues fetch`, `issues comment`, `issues labels`. Net-new: the comment state block and its parser, the label scheme, and fallback handling when the tracker is down. Fastest to prototype, slowest to make reliable.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Run state = manager-only rows in the parent FID's `status.jsonl`, child state read live from each child's own records, folded by `bkit manage state` (A). | B: one mutable `manage-state.json`; C: tracker labels and comment fields. | One writer and one format per fact; the child's own log is the only source of its step, so a reset cannot lose or double-start an issue. Matches decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only`. B copies child facts and goes stale; C rests on best-effort tracker writes. |
| One `bkit manage` noun with thin verbs composing existing commands; no new subsystem. | A separate `manage` engine module with its own scheduler loop. | Owner rejected an engine that owns the loop; verbs only answer one-right-answer questions (`next`, `progress`, `land-check`), and the manager calls them. |
| Third answerer = `bkit decisions apply --by=manager`, writing `Accept (assumed, by the manager)` and a status row; HIGH or unfixable MEDIUM items exit non-zero like `--by=headless` hard blockers do. | A new manager-only decision file format. | Extends the existing `headless`/`owner`/`rerun` switch; `pending` and ship's Confirm Assumed Items then list the manager's answers with no new reader. The refusal makes the HIGH-finding limit an engine check, not a sentence. |
| Pause options print their target step from the engine output of `/bkit-build`'s decision step. | Manager infers the target from the workflow text. | The v6.3 run looped when "Stop" was overridden with "Try again"; the target step is a one-right-answer fact. |
| Test slots = the existing machine `tests` lock and `BKIT_TEST_SLOTS`; `bkit manage workers` reads its holders to issue go messages. | A new manager-owned slot counter. | The lock already covers builds, resumes and the push hook across repos; a second counter would disagree with it. |
| Push = `bkit ci min-push` check, then `bkit branches push` from the manager only, with manager rows and queued ledger rows flushed after the hook finishes. | Workers push; or rows written straight into `docs/` during the hook. | One landing model per run, and no `docs/` edits under the running push hook (both v6.3 lessons). |
| Landing = `/bkit-ship` (local mode, #938 contract) run in a worker, preceded by `bkit manage land-check` (foreign edits or commits in the main checkout, engine diff against each running build's current step, review checklist done). | A manager-own `bkit manage land` that squashes onto `dev` itself. | Q10 settled building against `/bkit-ship` local mode; `land-check` carries only the checks ship does not do. |
| Estimate = range from sub-issue sizes x measured hours per size (S about 2h; about two builds an hour at three slots), narrowed by actual durations from landed children's status rows; before any landing it shows the size-only range. | A fixed point estimate; or none until the first landing. | Uses data already in status rows; the owner asked for an estimate that firms up. |
| Claude-only: install renders `bkit-manage.md` for Claude only; `.bkit/providers.md` records the exception and each host's gap; `DETAILS.md` documents the limits. | Render for every host with a refusal stub. | Q3 and Q9 settled; a stub on hosts that cannot run it adds agent-read text for nothing. |
