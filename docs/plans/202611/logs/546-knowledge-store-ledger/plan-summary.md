Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/plan-input-2.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/plan-v1-draft.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/related-deferrals.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/related-failures.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/related-issues.md` |
| plan-review | CONCERNS | 1 | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/plan-review-1.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/plan-review-2.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/plan-v2-reviewed.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/plan-update-check.md` |

## Acceptance Scenario

### Narrative

Before I change some files, my agent runs one command and gets back the brain rows that name those files or a folder above them, plus a short capped summary, instead of reading a whole ledger. When I replace, close or falsify a row, the append prints every current row that rested on it, and `bkit brain check` lists all of them whenever I ask. On demand or on an opt-in schedule, brain update tidies the brain, re-tests rows against the code, proposes links, summaries, contradiction fixes, pattern rows and fades, and, depending on `bkit.brain.update.ask`, either offers them to me for approval or applies them and lists what it applied.
### Success Criteria

1. The pre-code ledger read costs measurably fewer tokens: characters / 4 of what the agent is told to read, before (every current `docs/knowledge.jsonl` row) and after (`bkit brain context` output), on the same three recorded tasks. No shipped prompt, rule or doc index tells an agent to read a whole ledger file.
2. `bkit upgrade` turns the four ledgers into `docs/brain.jsonl` envelope rows with no distinct source line lost. Migration and cleanup deduplicate only equivalent normalized content; divergent rows with equal identity and timestamp remain recoverable and visible as conflicts after repeated cleanup and compaction. Source deletion follows durable destination verification, with recovery after interruption at every publication boundary. Running migration twice, or on two branches from the same base, gives byte-identical output. Fold winners (under the new identity), the whole `.bkit/stats.md` render (each reader filtered to the kinds it read before) and the `docs/roadmap.md` render are unchanged.
3. Every link is followed by a tool: a `SUPERSEDED` row's successor is found through the reverse of `links.supersedes`. Superseding, closing or falsifying a row prints every current row whose `links.dependsOn` names it, at write time and in `bkit brain check`. A `SUPERSEDED` row with no successor link is listed as a check finding.
4. Keyword search runs on Node alone (`ledgerScan` over the current fold winners, no index, no dependency), and filters by kind. Every reader that folded one per-kind file has a kind-filtered read path that returns the same rows after the merge. Search by meaning is the opt-in qmd template, off by default.
5. With `ask: true`, brain update changes nothing beyond mechanical cleanup without owner approval, and a rejected suggestion is not offered again until one of its target versions changes. With `ask: false`, it applies the same changes directly and lists each one in its run report. All local brain writes share a short write lock; two concurrent runs never apply one change twice, no cleanup loses an append, and a chain of brain-update rows never gains priority over unseen newer content. Every applied change has a validated undo that preserves history and refuses a changed target.
### Process Sketch
- WHEN a maintainer upgrades the example repository → THEN every old line reaches the brain before old files are truncated or deleted, and a second upgrade changes no brain byte.
- WHEN their agent starts the recorded file task → THEN it receives the capped pathless summary first and the current rows that match its files, with a token estimate.
- WHEN they close a premise → THEN append lists its current dependents and check reports the same dead premises, with a bounded printout.
- WHEN they search for the example’s terms → THEN search ranks current, kind-filtered winners using Node alone and records only returned keys as recalls.
- WHEN they run brain update with approval enabled → THEN cleanup lands, suggestions remain in a report, and only their approved rows are appended.
- WHEN another branch brings back an old ledger file → THEN readers include its new rows and the next update moves them safely into the brain.
- WHEN the same suggestion runs concurrently → THEN its deterministic id prevents a second application and newer unseen content remains the winner.
### Concrete Example
**Setup:** A maintainer has the four old ledgers, an unmerged feature branch that appends a knowledge row, and a task touching `.bkit/core/engine/ledgers/telemetry.ts`. Their brain-update setting is `ask: true`.

**Steps:**

1. The maintainer runs `bkit upgrade` → all old lines appear durably in `docs/brain.jsonl`. After complete-content verification and proven incompatible-writer quiescence, the branch touching an old path causes zero-byte union stubs to remain; unproven quiescence retains full source files. A second upgrade produces identical brain bytes.
2. Their agent runs `bkit brain context --files=.bkit/core/engine/ledgers/telemetry.ts` → the capped pathless bundle precedes matching current rows and `tokensEst` records the read cost.
3. The maintainer appends a terminal premise through `bkit brain append` → the current dependents are printed; `bkit brain check` lists them and the missing-successor cases.
4. The agent uses `bkit brain search "ledger fold" --kind=knowledge,decision` → results contain only current winners of those kinds, and returned keys enter the recall log.
5. The feature branch lands its old-path append; the maintainer runs brain update following `.bkit/brain.md` → the new row is visible before cleanup, then moves to the brain. Suggested link repairs and summaries await approval in the report.
6. The maintainer approves one suggestion and rejects another → the approved row is appended once; the rejected id remains suppressed until a target changes. A later feature-branch content update defeats a proposal based on older content.

**Outcome:** The maintainer can retrieve the relevant rows with fewer tokens, follow invalidated premises, retain branch contributions, and review an auditable update without losing unseen content.
### Edge Cases

- **Pre-upgrade branch:** a branch opened before the upgrade appends old-shape rows to `docs/knowledge.jsonl` after `dev` merged. The zero-byte stub union-merges the branch's lines in, together with the base's old lines: the spike's real-`git` fixture (C1) showed the emptied side does not win under `git merge`, `git merge --squash -X ours` or the reverse merge, with no conflict. Readers fold `[docs/brain.jsonl, the four stubs]` and deduplicate only equivalent normalized full content. The next brain update moves every distinct line durably into the brain, verifies it there and empties the stub under the shared write lock. Destructive cleanup waits until incompatible old writers have been upgraded or quiesced. When the migration found no unmerged branch or worktree touching the old files, it deleted them instead; a branch that appears later and still appends to one hits a modify/delete conflict, which bkit's ledger conflict resolution settles by keeping the branch's file. Readers fold it, `bkit brain check` reports it, and the next brain update moves its lines into the brain before deleting it again. A pre-upgrade worktree whose prompts still call `bkit ledgers append --ledger=knowledge` through the upgraded engine is refused with exit 8 and a message naming `bkit brain append`; nothing is written.
- **Migration run twice or on two branches:** the migration is a pure line-by-line function of its input, so both sides produce identical lines and union keeps one copy.
- **Same key in two old files** (none in this repo today): the row with the earlier first `ts` keeps the key, and the other becomes `{key}-{oldkind}` with a `relatedTo` link to it. The same rule maps later stragglers of that old kind.
- **Kind change off the allowed list** (e.g. `decision` → `deferral`): refused with exit 8, nothing written.
- **Bad links:** a link names a key that does not exist, or `dependsOn` links form a loop. `bkit brain check` reports both and never crashes or recurses without bound.
- **Concurrent brain updates:** AI analysis runs outside the shared write lock. Each apply acquires it, rechecks exact target fingerprints and prior suggestion ids, then appends before releasing it. A second identical apply skips as already applied. Cleanup and all other writers use that same lock through publication. Locks serialize writes to the same physical store; separate Git branches reconcile through proposal provenance and conflict preservation.
- **Chained proposals:** base content at `ts=10`, proposal P1 at `ts=100` and P2 based on P1 at `ts=200` all retain content-generation rank 10. Unseen branch content C at `ts=50` wins after every merge order, before and after compaction; P2's expected-version fingerprint still names P1 exactly.
- **Undo:** undoing an applied kind change restores the previous kind through the dedicated validated restore operation, without opening normal append to reverse transitions. Undoing a created row appends `WITHDRAWN`. A changed current fingerprint or missing verified restore evidence refuses the undo with no write.
- **Divergent duplicate version:** equal `(repo, key, ts)` with different normalized content preserves both rows and emits a conflict finding. Neither migration nor compaction silently picks one for deletion; ordinary mutation of that unresolved entry is refused until an explicit resolution names all variants.
- **Recall across branches and people:** two branches write different `lastRecalled` dates for one entry. The fold takes the newest date across all of the entry's rows, so a merge never loses a recent recall.
- **Subagent with no shell:** the orchestrator runs `bkit brain context` and passes the rows in, the way subagents hand rows back for `append` today.
- **Large selection under the clamp:** a task touching many files selects more rows than the `ledger` clamp keeps (97 rows on one recorded task). The always-loaded part is written first, inside its own reserved budget, so the clamp cuts only path-selected rows.
- **Older bkit after the migration:** an older bkit, or a pre-upgrade worktree's engine, reads the emptied stubs, or finds the old files gone, and sees zero rows with no error. Recovery is `bkit upgrade` forward or `git revert` of the migration commit; `docs/migrations.md` records the step as one-way.

## Open Questions

**Open questions:** None. The design records the owner’s answers, including capped pathless context, relatedTo backfill, flat fields, old-name refusal, conditional stubs, direct scheduled cleanup commits, the procedure document, `.qmd/` ignores, and the 180/90-day fade/recall windows.

- **Assumption:** Node >=24 and the current Node-only term-overlap search remain sufficient → an external index in core would break the zero-dependency runtime and the agreed search contract.
- **Assumption:** The branch enumeration can see only local refs, fetched remote refs and local worktrees → another person’s unpushed branch may later cause a modify/delete conflict; preserving its file is necessary to retain its rows.
- **Assumption:** Recall writers open append descriptors only after acquiring the common write lock, and roll-up renames under that same lock → bypassing the protocol could lose recalls and cause an earlier fade proposal. Bounded acquisition or filesystem failure remains best-effort with the documented warning.
- **Assumption:** The qmd CLI can be installed in a scratch consumer at the documented exact version → a blocked binary/model smoke test leaves optional-template verification incomplete and must be reported, never counted as a passing core check.
- **Assumption:** Existing CI permissions for the cloud template remain available → without them the optional scheduled job fails visibly and cleanup must run from chat.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #546
```

Or, to address the reasons first: `/bkit-plan #546`
