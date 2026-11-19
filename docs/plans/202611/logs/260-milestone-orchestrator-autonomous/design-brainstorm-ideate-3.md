# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Inputs: `design-input-1.md` (session prompt, the 2026-11-19 issue comment, the grill decisions; the grill section is the newest text and wins). Docs loaded: `.agents/rules.md` (Project Rules, Project Goals), `.agents/docs.md`, `docs/architecture.md`, `docs/security.md`, `docs/capabilities.md` (register only), `.bkit/core/.bkit/workflows.md` § `status.jsonl`, § Attempt counters, § Concurrency lock, § Comment Lifecycle, § Progress Lines, § `/bkit-build` (Decision Pause, Ask points), § Tests lock, `.bkit/core/.bkit/prompts.md:46,286`, `.bkit/core/engine/commands/land.ts` (symbol headers). `docs/technology.md` and `docs/decisions.jsonl` were not read in full: the decisions ledger was searched only.

Every approach below already takes the settled grill answers as fixed: Claude desktop app (Code tab) only, `LOCAL` runtime only, no model or effort check beyond a preflight warning, `bkit manage <verb>` for every piece with one right answer, one owner yes per run for filing sub-issues, report comments at push batches, question batches, parks and run end, closing tasks once at run end, and hard limits enforced by permissions and engine checks. The approaches differ in **where the run's memory lives and what happens when it is wrong, lost or written twice**, because the inputs name context resets (about 14 in 24 hours) as the main way the v6.3 run lost work.

## Approach A — Crash-only manager: an append-only private journal, views derived on read, limits held by hooks ⭐ Recommended

**Summary.** Assume the manager loses its context at any moment: every fact it acts on is either derived on read from sources that already exist (git, each issue's `status.jsonl` through the existing fold, the machine tests lock, the tracker), or is an append-only row in one private journal (`<git-common>/bkit-outbox/manage/{PARENT_FID}/journal.jsonl`, mode `0600`), and `bkit manage resume` prints a bounded briefing built from both; the hard limits live in a PreToolUse hook and a Stop hook that switch on while a run-active marker exists.

Shape, at the level a premortem needs:

- **Journal rows (non-derivable facts only):** `run-started` (parent, landing model, rules version), `owner-answer` (question id, verbatim answer, the owner turn it came from), `assumption` (by `manager`, item, reason, the step it leads to), `permission` (the one "may I file sub-issues" yes), `worker-bound` (neutral worker name to issue, `/bkit-*` command or free-form, brief path, rules version it was briefed on), `worker-released`, `heard` (one parsed worker line), `brief-sent`, `landed` (fid, squash sha), `pushed` (sha range), `parked` (fid, reason, what the owner must decide), `rules-version` (number, what changed), `deviation` (what, why, the issue comment URL). Folded the same way `status.jsonl` is: de-duplicate on identity, order by `at`, reduce.
- **Derived on every read, never stored:** each issue's phase and step (from its `status.jsonl` via `bkit status resume`), open pauses (`openDecision`), branch and changed files (git), slots in use (the machine `tests` lock holders), the queue (blocked-by links, priority, size and file overlap), the progress line and estimate.
- **Verbs** (indicative, not a contract): `manage preflight`, `manage kickoff`, `manage resume`, `manage next`, `manage brief`, `manage hear --line=`, `manage answer --by=manager|owner`, `manage watch`, `manage review`, `manage land`, `manage push`, `manage report`, `manage close`.
- **Enforcement:** the run-active marker (`<git-common>/bkit-outbox/manage/active`, holding the manager's session fingerprint and a heartbeat) makes the shared hook refuse, in every session on the clone (manager and workers), the exact commands named in the limits: any push or ref update naming `main` or a release tag, `--force` / `--force-with-lease` / `+refspec`, `--no-verify`, `git worktree remove --force`, `git branch -D`, a write to a ledger path that is not `bkit ledgers append`, and reads of the credential files listed in `docs/security.md` § Secrets. A Stop hook in the manager session refuses to end a turn while work is in flight and no live `manage watch` process exists.

**Premortem — 10x scale (30 sub-issues, a milestone of 150).**

- *What breaks:* `manage resume` output grows with the journal and the manager re-reads it after every reset, so a long run spends its context on the briefing; `manage next` computes file overlap pairwise between candidates and running builds, which is cheap, but each derive reads every issue's `status.jsonl` and runs `git diff --name-only` per branch, and with ~150 issues that is seconds per call on every wake-up; tracker reads for blocked-by links and titles fan out per issue and hit the GitHub rate limit when re-fetched on every turn. Blast radius of one bad landing grows too: a squash that breaks `dev` sits under every later landing in the batch.
- *Observability:* `manage resume` prints its own byte count and the journal row count; `manage next` prints how many issues it read and how long it took; tracker calls go through the existing adapter, which already classifies `rate-limit` (`.bkit/core/.bkit/workflows.md` § Comment Lifecycle).
- *Recovery:* the briefing is a fixed-size view (current wave, live workers, open questions, last N landings, counts for the rest), never the whole journal; tracker facts that do not change during a run (titles, URLs, sizes, blocked-by) are fetched once at kickoff into a `tracker-snapshot` row and refreshed only by `manage next --refresh` or when a landing closes an issue; `manage land` runs the gate on the post-squash tree before the next landing, so a broken `dev` stops the batch at the first red one.

**Premortem — 6 months later.**

- *What breaks:* the hook's list of refused commands drifts from the limits text in the workflow; a new `git` spelling (`git push origin HEAD:refs/heads/main`, an alias) slips past a string match; the estimate's hours per size (S about two hours, about two builds an hour at three slots) become stale as models and the machine change; the measured desktop-app facts (start a session only on an owner-typed turn, archive unreliable, the app wakes the manager only when no session is working) change in an app release and nothing notices; the journal's row kinds grow and the fold silently ignores a new kind, the way `status.jsonl` ignores unknown types.
- *Observability:* a test that runs each limit in the input's list against the hook (one fixture per command, including refspec and alias spellings) fails when either side drifts; `manage preflight` records the app version it saw in `run-started`; the estimate prints where its numbers came from (`from stats: n=12 S runs` or `fallback table`).
- *Recovery:* parse git argv in the hook (refspec destination resolved, not substring matched), with `main` and release tags read from config, not literals; take hours per size from `.bkit/stats.jsonl` outcome rows with a named fallback table in one engine file; make the journal fold fail closed (exit non-zero, name the row) on an unknown row kind instead of skipping it; record every measured app behaviour as a dated row in `DETAILS.md` (Q9 already puts the limits there) with the run that measured it.

**Premortem — on-call at 3am (the owner opens the phone to a run that has gone quiet).**

- *What breaks:* the watcher died (killed by the app, the laptop slept, the process hit a timeout) and the manager is idle with work in flight; or a worker is waiting on a question the manager never saw because the worker's one-line message was malformed and `manage hear` rejected it; or the run-active marker survived a crashed manager and the hook keeps refusing commands in an unrelated session the next morning.
- *Observability:* the Stop hook makes "idle with no watcher" impossible to reach silently, because the turn cannot end without one; `manage watch` writes a heartbeat line into the journal on every wake and exits with a reason code (`worker-line`, `slot-free`, `status-change`, `timeout`); a rejected worker line is journaled as `heard-rejected` with the raw text, and `manage resume` lists it first; the marker carries a heartbeat, and the hook names the run, its age and the `manage stop` command in every refusal.
- *Recovery:* the page shape is the report comment: when a question waits for the owner, the comment lists it with its options, the step each option leads to, and the recommendation, and the owner answers in the manager chat; a marker whose heartbeat is older than a fixed limit is treated as stale and the hook falls back to the normal settings with a warning instead of refusing; `manage resume` after any reset re-derives every worker's step, so a worker that finished while nobody watched is seen on the next wake.

**Premortem — the author leaves.**

- *What breaks:* the load-bearing knowledge is the desktop-app behaviour (which actions are allowed on which turn), the reason the journal is private and outside the tracked tree (the push hook's tests running in the main checkout, and private notes about weaknesses), and the reason the hook keys on a marker rather than on settings (settings deny applies globally; the limits apply only to managed runs). None of that is visible in the code.
- *Observability:* a reviewer who does not know these facts will "simplify" the journal into `docs/plans/**` and break the push window, or move the limits into `.claude/settings.json` and block normal work.
- *Recovery:* one `docs/decisions.jsonl` row per such choice, written by the design; `DETAILS.md` § limits for the app facts; a header comment in the hook source pointing at the decision rows; the hook fixture test is the executable record of the limits.

**Risk-mitigation guidance (layer onto A).**

- Make `manage hear` the only way a worker line enters the journal, and make the fixed one-line form engine-printed (`manage say --kind=question|stop|failure|group-done --fid=` in the worker) so the worker never composes the line by hand.
- Give `manage answer --by=manager` a refusal, not a sentence: exit non-zero for any HIGH item and any MEDIUM item marked not fixable, unless the same run holds an open task that names the finding and `manage close` refuses to close green while that task is open (the one exception the input allows).
- Have `bkit decisions compose` print, per option, the step it leads to (from `DECISION_ROUTES` in `.bkit/core/engine/commands/workflow/step-table.ts`), so `manage answer` can show and journal the target; refuse an answer whose option is not one the pause offers.
- Let the machine `tests` lock be the only authority on slots; `manage next` reads its holders and `manage brief` sends the go message only when a slot is free. The manager's count is a view, never a second scheduler.
- Before `manage land` and `manage push`, compare `git status` and the commits on local `dev` since the last journaled landing with the run's own known shas and worker branches; anything else stops the landing with the foreign paths and commits listed, and nothing is stashed, restored or reverted.
- Compare each landing's engine diff (`.bkit/core/engine/**`, `dist/**`) with the step each running build is in, and hold that build's next go message until the manager has judged it; journal the judgement as a `deviation` row when it lets the build go on.
- Queue ledger rows meant for `docs/` while a push is running, as journal rows, and append them with `bkit ledgers append` after the push returns.
- Stamp the rules version into every brief and every `worker-bound` row; `manage resume` lists live workers briefed on an older version, and the manager messages each one.

## Approach B — Single snapshot state file, rewritten by each engine verb

**Summary.** One mutable `run-state.json` (in the same private Git-common folder) holds the whole current picture (slots, workers, queue, open questions, assumptions, items owed), and every `bkit manage <verb>` reads it, changes it and writes it back with a lock and an atomic rename; the manager reads one file after a reset.

**Premortem — 10x scale.**

- *What breaks:* every writer (the manager's verbs, the watcher, workers calling `manage say`) contends for one lock, so a slow verb (a landing that runs the gate for minutes) holds the state lock and blocks a worker's question line; or the lock is released during the gate and the landing writes back a stale copy over the worker's update (lost update). The file grows with history kept "for the report", and a snapshot cannot say when or why a field changed.
- *Observability:* a generation counter in the file lets a verb detect that it lost a race (written generation is not the one it read); without that, a lost update is silent.
- *Recovery:* read-modify-write with compare-and-swap on the generation, retry on mismatch; split history out into an append-only side file anyway, which turns B into A with an extra cache.

**Premortem — 6 months later.**

- *What breaks:* the schema changes and old files no longer parse; a field one verb maintains (the queue) drifts from what can be derived (an issue closed on the tracker by hand is still queued); the wave report, built from the snapshot, can no longer list every assumption once a later write dropped a resolved one.
- *Observability:* a schema version field and a validator in `manage resume`; a cross-check verb that compares stored fields with derived ones.
- *Recovery:* a migration per schema change (bkit registers migrations in `docs/migrations.md`, and the rules allow one only on the owner's yes); derive the drift-prone fields instead of storing them, which again converges on A.

**Premortem — on-call at 3am.**

- *What breaks:* a torn or corrupted `run-state.json` (disk full, a crash mid-write without the rename) stops every verb at once; the owner sees a run that answers nothing.
- *Observability:* every verb exits with the parse error and the file path; the last report comment shows the last good state.
- *Recovery:* keep the previous generation as `run-state.prev.json` and fall back to it; rebuild what can be derived; the facts only the snapshot held (owner answers, assumptions) are lost unless they were also posted on the issue.

**Premortem — the author leaves.**

- *What breaks:* simple to read, so the bus factor for the file itself is low; the risk is that the rules about which fields are stored and which are derived, and the locking discipline, live in one person's head.
- *Observability:* tests per verb on the read-modify-write path.
- *Recovery:* document the field ownership table in the engine source next to the type.

**Risk-mitigation guidance (layer onto B).**

- Write with compare-and-swap on a generation counter; never hold the state lock across a gate run or a tracker call.
- Mirror every owner answer, assumption and deviation onto the issue as it is recorded, so the tracker is the backup for the facts the snapshot cannot rebuild.
- Every mitigation listed under A for hooks, the third answerer, slots, foreign edits and engine diffs applies unchanged; B changes only the memory store.

## Approach C — Derive everything: the tracker and git are the run state

**Summary.** No run-state store beyond a tiny private file for what no other source holds (worker names to issues, the permission yes); everything else is read live from sub-issue labels and states, machine-marked issue comments (questions, assumptions, deviations, parks), each issue's `status.jsonl` and git, so nothing the manager holds can go stale.

**Premortem — 10x scale.**

- *What breaks:* every wake-up re-reads every sub-issue and its comments, so at 150 issues the run spends minutes and thousands of API calls per turn and hits GitHub's rate limit; the tracker reporting limits in `docs/security.md` § Rate limiting (10 history pages, 3 writes, 60 seconds per delivery) were sized for one workflow's comments, not for a manager reading 150 threads; a tracker outage stops the run cold, because state cannot be read at all.
- *Observability:* the adapter's classified `rate-limit` and `network` errors.
- *Recovery:* a local cache of tracker reads, which is a run-state store under another name; or a smaller wave size.

**Premortem — 6 months later.**

- *What breaks:* comment markers are parsed from free text that a human or a markdown rewrite can change; the tracker abstraction differs across GitHub, Linear and Jira, so the derivations need three sets of parsing; a sub-issue relation that one tracker lacks (Jira's parent links, Linear's sub-issues) changes what "the run" means.
- *Observability:* parse failures per marker.
- *Recovery:* a hash-in-marker scheme like the existing `bkit:generated` dedupe; per-tracker fixtures.

**Premortem — on-call at 3am.**

- *What breaks:* the owner sees everything on the issue, which is the best page shape of the three; but private items cannot live there: a possible code weakness must go to the owner privately (`docs/security.md` § Public repo content), and an owner answer that names one would be public. Offline (laptop on a train), the run stops.
- *Observability:* excellent for the owner, poor for the engine (state is spread over many threads).
- *Recovery:* the private file grows to hold the private items, and the "derive everything" premise weakens.

**Premortem — the author leaves.**

- *What breaks:* lowest new knowledge: no new store, everything visible on the issues; the knowledge concentrates instead in the comment-marker grammar and the per-tracker parsing.
- *Observability:* the issues themselves.
- *Recovery:* fixtures per tracker and per marker.

**Risk-mitigation guidance (layer onto C).**

- Cache static tracker facts once per run (titles, URLs, sizes, blocked-by); re-read only issues whose `status.jsonl` or label changed.
- Keep private items (weakness notes, owner answers that quote them) out of comments entirely, in the private file.
- Every hook, third-answerer, slot, foreign-edit and engine-diff mitigation under A applies unchanged.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Run memory = append-only journal of non-derivable facts plus views derived on read (Approach A) | B: one mutable snapshot file; C: tracker and git only | Context resets (about 14 per 24 hours) are the dominant failure; an append-only log cannot lose an earlier fact to a later write, a crash mid-write can damage only the last line (which the fold reports by line number while every earlier fact stays intact), and the wave report gets every assumption by construction. B loses updates under concurrent writers and needs migrations; C cannot hold private items and fans out tracker calls on every wake. Same pattern as `status.jsonl` (§ `status.jsonl` — workflow state SoT), so no new idea for a maintainer to learn. |
| Journal lives in Git-common `bkit-outbox/manage/{PARENT_FID}/`, mode `0600`, never committed | `docs/plans/{YYYYMM}/logs/{PARENT_FID}/`; the tracker | The input forbids changing files under `docs/` in the main checkout while the push hook's tests run there, and other sessions commit in that checkout; the outbox already holds private run state shared across linked worktrees (`docs/architecture.md` § Tracker reporting boundary). Private placement also keeps owner answers about weaknesses out of the public repo. The public record is the report comments (settled Q7). |
| Only facts no other source holds go in the journal; step, pauses, slots, branches, queue, progress and estimate are derived on every read | Store them for speed | A stored copy of a derivable fact is the drift that leaves an issue queued after it closed, or a slot counted after its gate ended (`One home per fact`). |
| The machine `tests` lock is the single slot authority; the manager's go message is a view of it | A manager-side slot counter | Two schedulers disagree under load; the lock already enforces slots across repositories and exports its holders (§ Tests lock). |
| Hard limits enforced by a PreToolUse hook (argv-parsed, not substring) and a Stop hook, both active only while a run-active marker with a fresh heartbeat exists | `.claude/settings.json` deny entries; brief text | The input says brief text did not hold in the v6.3 run; settings deny is global and would block normal work outside a managed run, and `--no-verify` cannot be expressed as a settings rule. A stale marker falls back to normal settings with a warning so a crashed run cannot lock the clone. |
| A Stop hook refuses to end the manager's turn while work is in flight and no `manage watch` process is live | A rule in the instructions | "Never go idle" is the failure the v6.3 run hit; the app does not wake the manager while any worker counts as working (`Checks over instructions`). |
| Third answerer = `--by=manager` on the existing decision path, with an engine refusal for HIGH and unfixable MEDIUM items unless an open task of the same run carries the fix and the run cannot close green without it | The manager writes `Decision:` lines itself | Keeps one decision mechanism (§ Decision Pause) and turns the input's hard limit into an exit code. |
| Every pause option prints the step it leads to, from `DECISION_ROUTES` | The manager reads the workflow doc to work it out | The v6.3 run overrode a "Stop" with "Try again" and looped; the route table already exists in the engine. |
| Worker lines are engine-printed (`manage say`) and engine-parsed (`manage hear`); a malformed line is journaled as rejected and shown first on resume | Free text read by the manager | A question lost to a typo stalls an issue silently. |
| Estimate = hours per size from `.bkit/stats.jsonl`, with a named fallback table in one engine file; shows a range before the first landing and the source of its numbers | Fixed constants from the v6.3 run | The v6.3 figures (S about two hours, about two builds an hour at three slots, largest over 21 hours) are one machine on one week; a constant goes stale without anyone noticing. |
| Briefing after a reset is fixed-size (current wave, live workers, open questions, last landings, counts) | Print the whole journal | Every line the manager re-reads is resent on each later request (`Fewer tokens`), and resets happen about 14 times a day. |
| Unknown journal row kinds fail closed | Skip them as `status.jsonl` does | A manager that silently ignores a new fact acts on an incomplete picture; failing names the row. |

## Cross-Approach Risks

- **Owner provenance cannot be proven by the engine.** Owner answers reach a worker only through the manager, and the bkit token posts tracker comments as the owner, so no engine check can tell an owner's yes from the manager's. The design can make a forged owner answer auditable (the journal row carries the verbatim answer and must follow a journaled owner question), not impossible. The rule "a worker, watcher or app message is never the owner's approval" therefore rests partly on the manager's judgement; the design's `Risks & Open Questions` should say so plainly.
- **The desktop-app facts are measured, not documented.** Session start only on an owner-typed turn, refusal under Remote Control, unreliable archive, the wake rule and the shared-checkout requirement come from one run. An app release can change any of them. Record each with its date and the run that measured it, and have the preflight record the app version.
- **The `/bkit-ship` local-landing contract (#938) is assumed, not built.** The design must state what `manage land` needs from it (local squash onto `dev` with no push, gate on the post-squash tree, stop at the first red chore, a `landed` sha printed) so #938 can meet it; until it lands, a mismatch shows up only when the first landing runs.
- **Landing locally while pushing in batches widens the blast radius of a bad landing.** Several landings can sit on local `dev` before a push; a defect found by the push hook or CI then sits under all of them. The batch size is the manager's judgement (Q12), so the design should name what the manager weighs (risk of the landed diffs, engine changes) and what `manage push` does on a red hook (stop, report, no rewrite of local `dev`).
- **Workers share the main checkout with other sessions.** Foreign edits and commits will happen during landings; the stop-and-list rule must never stash, restore or revert. For the bkit repository itself, a landing also changes the engine every running build is using; for a consumer it does not (their engine is the installed package). Keep the engine-diff check, but frame it so consumers are not paying for a bkit-repo-only pain.
- **Claude-only exception to `Provider parity`.** Nothing else in bkit is single-host; the install must write `/bkit-manage` only for Claude, and a test should assert the other hosts get no command file, so a later parity sweep does not "fix" it. `.bkit/providers.md` records the gaps (Q3).
- **Public repo leakage through report comments.** Report comments, assumption reasons and deviation comments are public. An assumption about a review finding can describe a weakness. `manage report` needs a rule (and ideally a check) that weakness-class findings appear only as "told to the owner privately".
- **Agent-read text growth.** A new workflow plus new verbs adds words; the owner's rule exempts new features he asked for from shrinking, but the word ceiling (`pnpm bkit:text:ceiling raise` stays the owner's alone) will still fire at the landing. Plan the raise as an owner question in the opening round of the build, not a surprise at the end.
- **Step 14 (closing a wave) has no evidence behind it.** No wave ended in the v6.3 run; the closing tasks (deferred items, all-mock test check, roadmap update) are untested in practice. Treat the first real run's end as the test, and keep the closing tasks restartable from the journal.
- **Machine load.** About three builds at once is the measured limit; gates fail on load, not code (#1052). The flaky re-run-once rule needs the `docs/failures.jsonl` flaky set as its only input, or the re-run becomes a way to retry real failures.
