<!-- bkit:anchor
baseSha: 71951f2f2372e3fe4d752e33f0947391eff7609b
baseRef: origin/dev
designPath: docs/plans/202611/546-knowledge-store-ledger-design.md
designBaseSha: deb8b25b5a2b79bc47d28fadec46f8f80ab964ce
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Brain knowledge ledger Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

Implement the whole parent design, WS-1 through WS-14. The JSONL files are the project’s record of truth; the brain is one append-only file whose entries can be found by file, text, kind and typed links. The design’s five delivery stages remain the build order: merge/envelope/links → file context → keyword search → brain update → optional qmd template. No prerequisite plan outside this run is required; later groups depend on earlier groups rather than on separate tracker issues.

**Execution:** Run one `bkit-build #546` against this plan, following all eight task groups in order. Implementation, verification and shipping belong to the parent issue. The six child issues are closed as not planned separately; their scope remains in the tasks below. Do not dispatch separate child plan/build runs or treat their closed state as evidence that their behavior is implemented.

**Related Issues:**

- [#546 — Knowledge store ledger upgrade](https://github.com/cbartens/bkit/issues/546) (open; owns Tasks 1–28).
- [#795 — Merge the four docs/ ledgers into docs/brain.jsonl with a migration](https://github.com/cbartens/bkit/issues/795) (closed, not planned separately; Tasks 1–12).
- [#792 — Typed supersedes and dependsOn links plus a dead-premise check](https://github.com/cbartens/bkit/issues/792) (closed, not planned separately; included in the envelope, graph and migration work in Tasks 3–10).
- [#791 — bkit brain context: load only the rows that touch the task's files](https://github.com/cbartens/bkit/issues/791) (closed, not planned separately; Tasks 13–16).
- [#793 — bkit brain search: keyword search over the current brain rows](https://github.com/cbartens/bkit/issues/793) (closed, not planned separately; Tasks 17–18).
- [#794 — qmd template: opt-in search by meaning over the brain rows](https://github.com/cbartens/bkit/issues/794) (closed, not planned separately; Task 26).
- [#797 — bkit brain update: update, cleanup, compaction, and fading](https://github.com/cbartens/bkit/issues/797) (closed, not planned separately; Tasks 19–25).
- [#710 — Ledger compaction: drop superseded rows, preserve age](https://github.com/cbartens/bkit/issues/710) (closed).

These references locate related work; their bodies add no scope beyond the parent design.

## 👤 ⚠️ Acceptance Scenario

### Narrative

Before I change some files, my agent receives capped summaries of entries associated with those files and general pathless entries. It selects relevant keys, fetches their complete current entries and reads them before editing. Search also matches full entries but returns summaries first. When I replace, close or falsify a row, the append prints every current row that rested on it, and `bkit brain check` lists all of them whenever I ask. On demand or on an opt-in schedule, brain update tidies the brain, re-tests rows against the code, proposes links, summaries, contradiction fixes, pattern rows and fades, and, depending on `bkit.brain.update.ask`, either offers them to me for approval or applies them and lists what it applied.

### Success Criteria

1. On the same three recorded tasks, the total pre-code read costs fewer characters / 4 than reading every current knowledge row. Count all context previews, selection handoffs and fetched details, including retries; also compare with the planned full-row context baseline. Every relevant entry in the fixture is read completely before the first edit. No shipped rule, prompt or doc index substitutes summaries for applicable facts or directs a whole-ledger read.
2. `bkit upgrade` turns the four ledgers into `docs/brain.jsonl` envelope rows with no distinct source line lost. Migration and cleanup deduplicate only equivalent normalized content; divergent rows with equal identity and timestamp remain recoverable and visible as conflicts after repeated cleanup and compaction. Source deletion follows durable destination verification, with recovery after interruption at every publication boundary. Running migration twice, or on two branches from the same base, gives byte-identical output. Fold winners (under the new identity), the whole `.bkit/stats.md` render (each reader filtered to the kinds it read before) and the `docs/roadmap.md` render are unchanged.
3. Every link is followed by a tool: a `SUPERSEDED` row's successor is found through the reverse of `links.supersedes`. Superseding, closing or falsifying a row prints every current row whose `links.dependsOn` names it, at write time and in `bkit brain check`. A `SUPERSEDED` row with no successor link is listed as a check finding.
4. Keyword search ranks complete current entries through Node-only `ledgerScan`, then returns summary previews with kind filters. Description-only matches remain discoverable. Context and agent-facing list output use the same preview fields; `get` retrieves complete selected entries by key. Previews record no recalls. Machine readers retain full kind-filtered data, and qmd remains opt-in. Writers check summary accuracy against the entry on creation/update; maintenance reviews and repairs weak summaries through the existing approval procedure.
5. With `ask: true`, brain update changes nothing beyond mechanical cleanup without owner approval, and a rejected suggestion is not offered again until one of its target versions changes. With `ask: false`, it applies the same changes directly and lists each one in its run report. All local brain writes share a short write lock; two concurrent runs never apply one change twice, no cleanup loses an append, and a chain of brain-update rows never gains priority over unseen newer content. Every applied change has a validated undo that preserves history and refuses a changed target.

### Process Sketch

- WHEN a maintainer upgrades the example repository → THEN every old line reaches the brain before old files are truncated or deleted, and a second upgrade changes no brain byte.
- WHEN their agent starts the recorded file task → THEN it receives pathless and file-matching previews, selects relevant keys and reads their complete current entries before editing. Every preview and detail response contributes to the total token estimate.
- WHEN they close a premise → THEN append lists its current dependents and check reports the same dead premises, with a bounded printout.
- WHEN they search → THEN complete current entries are ranked with Node alone but only summary previews are returned. Selected complete `get` results, not previews, enter the recall log.
- WHEN they run brain update with approval enabled → THEN cleanup lands, suggestions remain in a report, and only their approved rows are appended.
- WHEN another branch brings back an old ledger file → THEN readers include its new rows and the next update moves them safely into the brain.
- WHEN the same suggestion runs concurrently → THEN its deterministic id prevents a second application and newer unseen content remains the winner.

### Concrete Example

**Setup:** A maintainer has the four old ledgers, an unmerged feature branch that appends a knowledge row, and a task touching `.bkit/core/engine/ledgers/telemetry.ts`. Their brain-update setting is `ask: true`.

**Steps:**

1. The maintainer runs `bkit upgrade` → all old lines appear durably in `docs/brain.jsonl`. After complete-content verification and proven incompatible-writer quiescence, the branch touching an old path causes zero-byte union stubs to remain; unproven quiescence retains full source files. A second upgrade produces identical brain bytes.
2. Their agent runs `bkit brain context --files=.bkit/core/engine/ledgers/telemetry.ts` → capped pathless previews precede file-matching previews. It selects relevant keys, calls `bkit brain get --keys=<selected-keys>`, reads the full entries and records fetched versions before its first edit. Count both stages and any handoff in read cost.
3. The maintainer appends a terminal premise through `bkit brain append` → the current dependents are printed; `bkit brain check` lists them and the missing-successor cases.
4. The agent uses `bkit brain search "ledger fold" --kind=knowledge,decision` → full-text ranking returns only previews. A term found only in a description still matches. The agent fetches selected keys, checks current versions and reads full details before relying on them.
5. The feature branch lands its old-path append; the maintainer runs brain update following `.bkit/brain.md` → the new row is visible before cleanup, then moves to the brain. Suggested link repairs and summaries await approval in the report.
6. The maintainer approves one suggestion and rejects another → the approved row is appended once; the rejected id remains suppressed until a target changes. A later feature-branch content update defeats a proposal based on older content.

**Outcome:** The maintainer can retrieve the relevant rows with fewer tokens, follow invalidated premises, retain branch contributions, and review an auditable update without losing unseen content.

### Edge Cases

- **Weak summary or changed entry:** if a preview cannot establish irrelevance, fetch the details. Compare the preview version with the fetched version and reassess changed content. Missing, terminal or conflicting entries are explicit unresolved results, not empty success.
- **Summary creation and maintenance:** an author checks the summary against the complete entry before append, including its conditions and exceptions. A deterministic first-sentence fallback preserves legacy compatibility but does not certify semantic accuracy. Maintenance proposes corrections through normal same-key writes.

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
- **Subagent with no shell:** the orchestrator passes context previews to the subagent, receives selected keys, fetches them with `bkit brain get`, then resumes or redispatches it with the complete entries. The subagent reads those entries before editing or completing its review. Summary selection is a read-only handoff; an unresolved detail request prevents dependent edits.
- **Large selection under the clamp:** the reserved pathless previews precede path-selected previews. Both budgets apply to serialized preview bytes. Dropped keys are explicitly not read; agents retrieve potentially relevant dropped entries by key or narrow the query before editing. Detail responses contain complete rows; callers split large selections into batches and resolve host truncation before claiming a read.
- **Older bkit after the migration:** an older bkit, or a pre-upgrade worktree's engine, reads the emptied stubs, or finds the old files gone, and sees zero rows with no error. Recovery is `bkit upgrade` forward or `git revert` of the migration commit; `docs/migrations.md` records the step as one-way.

### Derived Test Matrix

Each row names the task that lands its test. `Unit` includes a single module against a real temporary Git repository; `Integration` drives the wired CLI or install flow against a real temporary consumer. There is no database migration, UI or deployed API in this feature, so fresh-DB replay, E2E and core @live do not apply. The opt-in external qmd smoke check is explicitly separate from core verification.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Three real Git merge shapes preserve emptied-stub and appended-branch rows | Unit | `.bkit/core/engine/ledgers/migrate.test.ts` | 1 |
| Pin full stats and roadmap output from the old layout and capture three task read baselines | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 2 |
| Brain identity, defaults, summary fill, statuses and unchanged non-brain identities | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 3 |
| Allowed transitions drop old fields; invalid transitions, malformed links, assumptions and summaries refuse atomically | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 4 |
| Brain-plus-stub reads normalize, deduplicate and filter kind/current; previews and exact-key details preserve versions and diagnose missing/conflicting keys | Unit | `.bkit/core/engine/ledgers/brain.test.ts` | 5 |
| Reverse links, dead premises, dangling keys, cycles, expiry, missing successor and duplicate timestamps are reported | Unit | `.bkit/core/engine/ledgers/brain.test.ts` | 6 |
| Path registries exclude data from canonical hashes and keep modify/delete branch additions | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 7 |
| Merge mapping is line-preserving and deterministic, including collision stragglers and crash recovery | Unit | `.bkit/core/engine/ledgers/migrate.test.ts` | 8 |
| Shared write-lock primitives enforce bounded refusal without writes, live/unknown-owner protection, nested ownership and stale-token publication/release refusal against real files/processes | Unit | `.bkit/core/engine/ledgers/brain.test.ts` | 8 |
| Upgrade/check dry run, stub-or-delete, one-way migration and partial-state diagnostics exercise the actual install path | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 9 |
| Source cleanup requires fresh explicit maintenance confirmation; absent confirmation, generic auto-apply and active Git operations preserve source bytes | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 9 |
| Brain append/list/get/check/compact, summary projection, exact-key detail/error handling and full machine exports reach the real CLI | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 10 |
| Stats/roadmap full output and reader-kind parity survive the merge and kind transitions | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 11 |
| No live engine, workflow bash or template reader retains a forbidden old-path read | Unit | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | 12 |
| Path normalization/ranking and capped pathless selection are deterministic | Unit | `.bkit/core/engine/ledgers/brain.test.ts` | 13 |
| Context reserves pathless preview budget; only complete get results share best-effort recalls across worktrees | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 14 |
| Five host renders enforce summary selection and full-detail handoffs before edits, including resume/remediation | Unit | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | 15 |
| Three tasks count previews, handoffs and details with required-key coverage and both baselines | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 16 |
| Search matches full text then returns bounded previews, keeps ranking/top-40, records no recalls and measures total retrieval cost | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 17 |
| Plan/ship preserve candidate artifacts and selected full-entry evidence through resume | Unit | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | 18 |
| Proposal rank, maximum recall date, deterministic ids and stale/applied skip converge under permutations | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 19 |
| Settings, 180-day fade and 90-day recall boundaries, get-only recall, recall rename and rejection pruning | Unit | `.bkit/core/engine/ledgers/brain.test.ts`, `.bkit/core/engine/shared/settings.test.ts` | 20 |
| Update cleanup and locked publication retain data and produce clustered preview indexes with full-entry artifacts, without usage recalls | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 21 |
| Apply/approve/reject, report freshness/undo and headless restrictions protect the real brain | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 22 |
| Counters, stale-report checks, report provenance and stdout/stderr separation follow the contract | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 23 |
| Unified updater/procedure renders cover inference and per-entry summary quality checks; retirement removes four obsolete agents | Unit | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | 24 |
| Scheduled template is opt-in, issue-less, headless, uses existing secrets, retries pushes once and fails with run id | Unit | `.bkit/core/engine/audits/templates/brain-schedule.test.ts` | 25 |
| Disposable-repository scheduled/issue-less execution boots a configured provider and produces an actual run URL plus cleanup/report-only commit | @live | `.github/workflows/bkit-cloud.yml` | 25 |
| qmd export uses shipped current reads, preserves row identity/metadata, prunes old exports and ignores generated files | Integration | `.bkit/core/engine/audits/templates/qmd-export.integration.test.ts` | 26 |
| Optional pinned qmd/model returns the seeded row key from its real semantic index and leaves generated data ignored | @live | `.bkit/templates/scripts/qmd/bkit-qmd-smoke.mjs` | 26 |
| Fresh consumer install/upgrade across five hosts retains data, generates expected mirrors and passes check | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 27 |
| Writer/update summary accuracy and full-detail-before-edit behavior have recorded host traces | Smoke | Existing task/context artifacts and host action traces | 27 |
| Build, test inventories, source mirrors, command docs and compiled dist agree | Static | `docs/testing.md`, `dist/` | 28 |
| retains divergent equal-version content until exact-set resolution | Unit | `.bkit/core/engine/ledgers/brain.test.ts` | 5 |
| preserves divergent same-version rows through repeated full-content drains | Unit | `.bkit/core/engine/ledgers/migrate.test.ts` | 8 |
| recovers every publication boundary and retains sources with incompatible writers | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 9 |
| serializes append compact and migration with safe bounded lock ownership | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 10 |
| starts built brain help and verbs without initialization cycles | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 10 |
| keeps base10 P1at100 P2at200 below unseen C50 in every merge order and compaction | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 19 |
| retains exact version content generation and conflict evidence across compaction | Unit | `.bkit/core/engine/ledgers/brain.test.ts` | 19 |
| applies one identical proposal once at a coordinated subprocess barrier | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 21 |
| undoes all three kind transitions and ordinary edits after compaction | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 22 |
| withdraws creations and refuses stale forged or ambiguous undo evidence | Integration | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | 22 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what “done” looks like.

## 👤 ⚠️ Breaking Changes & Naming Review

<!-- prettier-ignore -->
| Change / name | Contract and impact |
| --- | --- |
| `docs/brain.jsonl` | Replaces four per-kind files; schema stays 3, identity becomes `(repo, key)` for six brain kinds only. Older engines see no rows after migration and must upgrade forward or revert the complete migration commit. |
| `bkit brain append\|check\|compact\|context\|get\|list\|search\|undo\|update` | Owns brain-row operations. After migration old brain-kind `bkit ledgers append --ledger=…` calls exit 8 with the replacement command; bookkeeping, friction and stats stay under `ledgers`. |
| `links.supersedes`, `links.dependsOn`, `links.relatedTo` | Typed key arrays live beside flat per-kind fields. Exact-key references remain and backfill only `relatedTo`. |
| `assumption`, `summary`, `FADED`, `proposal`, `lastRecalled` | Adds required falsifiers for assumptions, capped summary bodies, terminal fade, proposal provenance/rank and cross-row maximum recall. Normal append accepts only the three settled kind transitions; dedicated validated undo has the narrow historical restore exception. |
| `.bkit/brain-rejections.jsonl`, `.bkit/brain.md` | Rejections are a separate union-merged process ledger. The procedure is a shared chat/scheduled entry point, not another phase workflow. |
| `bkit-utility-update-brain` | Replaces four updater agents; callers, host pins and generated agents are replaced together. |
| `tmp/bkit-brain/`, `.qmd/` | Derived local recall/packets/export/index files are gitignored; resolve shared temporary state through the common Git directory. |
| Opt-in `bkit-brain-update` job | Weekly Monday 03:00 UTC schedule and issue-less dispatch use the existing cloud credentials. It commits cleanup and reports to `dev`, holds inferred changes, and retries a rejected push once after merging `origin/dev`. |

The owner approved summary-first discovery for search, browsing and pre-code context, with relevant full entries read before editing. The design defines the new `get --keys` detail contract and machine-only `list --full` projection. Other names and the one-way migration retain their existing decisions; confirmation boxes are not checked on the owner's behalf.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

## 👤 ⚠️ Open Questions & Assumptions

**Open questions:** None. The design records the owner’s answers, including capped pathless context, relatedTo backfill, flat fields, old-name refusal, conditional stubs, direct scheduled cleanup commits, the procedure document, `.qmd/` ignores, and the 180/90-day fade/recall windows.

- **Assumption:** summaries expose the conditions needed to judge relevance → vague or uncertain matches must be fetched, and behavioral scenarios verify full-entry reads before edits. Preview size alone cannot establish correctness or savings.
- **Assumption:** Node >=24 and the current Node-only term-overlap search remain sufficient → an external index in core would break the zero-dependency runtime and the agreed search contract.
- **Assumption:** The branch enumeration can see only local refs, fetched remote refs and local worktrees → another person’s unpushed branch may later cause a modify/delete conflict; preserving its file is necessary to retain its rows.
- **Assumption:** Recall writers open append descriptors only after acquiring the common write lock, and roll-up renames under that same lock → bypassing the protocol could lose recalls and cause an earlier fade proposal. Bounded acquisition or filesystem failure remains best-effort with the documented warning.
- **Assumption:** The qmd CLI can be installed in a scratch consumer at the documented exact version → a blocked binary/model smoke test leaves optional-template verification incomplete and must be reported, never counted as a passing core check.
- **Assumption:** Existing CI permissions for the cloud template remain available → without them the optional scheduled job fails visibly and cleanup must run from chat.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Recommendation |
| --- | --- |
| Extend the existing codec and compactor, with a pure brain library and thin commands in a sibling brain command file | Chosen. Keeps one validation, lineage, writer and fold definition. Export the brain command specification from `.bkit/core/engine/commands/workflow/brain.ts` and register it alongside bookkeeping; keep `ledgers.ts` free of the known context/tests/steps initialization back-edge. |
| Separate codec, permanent four-file virtual brain or strict delete-only cutover | Reject. Duplicates contracts, leaves two layouts, or loses pre-upgrade branch rows. |
| FTS5, Orama or MiniSearch in core | Reject for this scope. The design’s measured term-overlap retrieval meets the recorded lookups and adds no index/cache/runtime dependency. |
| Graphiti, mempalace or another memory system as truth | Reject. Their store or runtime contracts do not replace Git-mergeable, intentionally written current facts. |
| Sixth workflow or brain-update auto phase | Reject. Reuse a procedure document and the engine’s dispatch plan; brain update has no FID, phase or workflow close. |
| Optional qmd export/index | Chosen for meaning-based search only. Follow the [official qmd project](https://github.com/tobi/qmd), pin the tested exact version and keep all generated data ignored. The current source was consulted; verify the pinned release’s commands in a scratch consumer during implementation. |

Node provides the file append/rename primitives already used by the repository; no filesystem package is needed. The official [Node filesystem documentation](https://nodejs.org/api/fs.html) confirms these built-ins. Use the approved shared lock from authoritative read through publication. A final read is diagnostic only; require writer quiescence and retain sources whenever it cannot be established.

## Out of Scope

Every row is Exempt because the parent design explicitly excludes it and no acceptance criterion needs it. Matching deferrals were appended during planning.

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Feature rows joining the brain | The feature ledger remains the roadmap’s source; brain retrieval does not require moving it | Design Architecture non-goal; `546-issues-jsonl-feature-rows-join-brain`. |
| Friction/stats joining the brain | Drained queues and machine telemetry are outside project knowledge | Design Architecture non-goal; `546-friction-stats-stay-separate`. |
| Retiring zero-byte stubs retained for visible branches | Current migration must retain them until the supported-release boundary permits removal | Future release-range migration tracked by `546-retire-brain-stubs-and-legacy-ledger-alias`; old command aliases are refused in this plan already. |
| Transcript/personal chat-history recall | The brain records intentional project facts, not conversations | Design Architecture non-goal; `546-transcript-recall-outside-brain`. |
| Core FTS5 index | Current Node-only ledgerScan meets the measured retrieval need | A measured ranking gap can reopen `546-fts5-until-measured-ranking-gap`; design C7/C8 retain the Node support/probe notes. |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Feature-ledger convergence | Existing `546-issues-jsonl-feature-rows-join-brain` deferral | Codec identity and roadmap | Keep deferred per the design; moving it adds a separate lifecycle. |
| Long-term stub retirement | Existing `546-retire-brain-stubs-and-legacy-ledger-alias` deferral | Migration and conflict registries | Keep deferred until a supported-release range is known. |
| Future FTS5 ranking | Design non-goal and measured seven-query comparison | Search | Revisit only with a recorded failed lookup; no speculative index. |
| Correct existing knowledge rows naming old scripts and styles | `748-brand-every-consumer-knowledge-rows-name-old-script-and-style-names` in related deferrals | Migrated content and documentation sweep | Seek separate approval for content correction; migration preserves the existing facts. |
| Friction identity and destructive-prune repair | `699-friction-key-truncation-class-fix` in related deferrals | Telemetry and harvest owners touched by Task 11 | Keep the separate fix and its existing-data migration; friction remains outside the brain. |
| Friction/stats convergence | `546-friction-stats-stay-separate` in related deferrals | Codec and count-only readers | Keep these process ledgers separate under the design's non-goal. |
| Transcript recall | `546-transcript-recall-outside-brain` in related deferrals | Retrieval concepts | Keep personal transcript recall outside intentional project knowledge. |

The related subissues are covered by the parent design’s workstreams, so they add no separate backlog. The retained failure-context evidence contains a closed finding that adds no scope; the artifact explicitly omits four of five matching lines, which were not read and establish no absence claim.

## Security & Privacy

- [x] **User Input:** validate every appended row, kind, link array, transition, proposal, approval/rejection index and report machine row at its handler. An invalid batch writes nothing; report text is data, never executable shell.
- [x] **Role-Gated Mutation:** enforce KIND_WRITERS for all six brain kinds and the separate rejection kind; the unified updater gains only its intended kinds and shell capability.
- [x] **PII:** logs/counters carry counts, keys, paths and reasons rather than secret values or full row prose. Harvest remains count-only for deferrals/failures and does not copy brain content.
- [x] **Secrets/CI:** no new credential. Reuse the existing secret-gated provider jobs, preserve token isolation, pin existing actions and keep scheduled inference unapplied even with ask false.
- [x] **Filesystem:** preserve source bytes until the brain is durably written; validate output paths under the intended common-checkout temporary directory; constrain exporter document names so keys cannot traverse out of its export folder.

No API route, database access policy, redirect or webhook applies. All fetched row/report content remains untrusted input under `docs/security.md`.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** `package.json` declares Node `>=24`, pnpm `10.34.7`, TypeScript/Vitest and no runtime dependencies; core adds none. The qmd tool is optional and pinned in template instructions, outside package runtime dependencies.
- [x] **Dependency Versions:** measured Node `v24.16.0`, pnpm `10.34.7`; `pnpm bkit:deps:outdated` completed with the expected availability exit 1: oxlint-tsgolint `7.0.2004 → 7.0.2005`, oxlint `1.89.0 → 1.90.0`, @types/node `24.19.2 → 26.6.5`, vite `6.4.5 → 8.3.5`. These are available updates, not required upgrades; do not bundle them.
- [x] **Existing-Solution Search:** semantic `identity` and `foldFrom` reads, worktree-local source reads, the capability register, path searches and the design’s measured prior-art comparisons inform the Reuse Inventory.
- [x] **User Context:** the input, full parent design and all implementation surfaces are accessible. No missing owner decision prevents drafting.
- [x] **Project Context:** current decision/knowledge/deferral/failure rows relevant to brain, writer permissions, migration and union merges were folded by key and read; existing owner decisions are reused.
- [x] **Testing & Quality:** Vitest Unit for pure logic/single-module real temp Git tests, Integration for CLI/install wiring, no filesystem/database mocks. New tests follow `*.test.ts` / `*.integration.test.ts`.
- [x] **Prerequisite Plans:** None outside this plan. WS-1→2→3/4→5/6 precede context; search follows context; update follows migration/context/proposal ranking; qmd follows the read CLI. One PR for all tasks is acceptable.

Serena semantic reads used the active main-project language server; worktree-local source reads verify the changed target contracts. Worktree source reads verified the actual target files. Large catalog reads were bounded; the relevant testing rubric, test-spawn rules, architecture, schema, security, observability, authoring and ledger write sections were inspected directly.

### Conditional

- [x] **Secrets & Env Vars:** no new secret. Scheduled jobs reuse cloud credential-presence selection and least-privilege existing push access; qmd remains local and optional. Do not expose secret values in reports or logs.
- [x] **Schema State:** `docs/data-schema.md` has no production tables. This is a local JSONL format/upgrade migration, verified by real consumer filesystem tests, not a SQL or fresh-DB migration.
- [x] **Architecture & UI:** engine libraries belong in `ledgers/`, brain command wrappers in the sibling `commands/workflow/brain.ts` module, source procedure docs in `.bkit/core/.bkit/`, copy-and-own tools in `.bkit/templates/`; no UI.
- [x] **Observability:** use `[bkit-brain]` stderr, `[bkit-upgrade]` for migration, and seven stats counters. Add their exact degraded-state lines to `docs/observability.md`.
- [x] **Notifications:** no toast, notification service or new alert channel. The operator sees CLI diagnostics, reports and scheduled-job failures.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the owner checks the Acceptance Scenario confirmation.
- [ ] **Breaking Changes confirmed:** the owner checks the naming/migration confirmation.
- [ ] **Open Questions confirmed:** the owner accepts the assumptions.
- [x] **Security & Privacy checked:** applicable local input and credential controls are recorded.
- [x] **Reuse Inventory complete:** each capability and created file has a searched candidate and decision.
- [x] **Reuse reasons:** new files have reason (a), (b) or (c).
- [ ] **Gate 1 — Verified:** the human confirmations and applicable prerequisites are checked.

## Data Schema Integration

No service database is involved. The canonical row schema lives in `.bkit/core/.bkit/jsonl.md`; `docs/data-schema.md` remains a production database catalog and receives only ledger-reference wording where applicable.

### Summary-first retrieval contract

Implement the design's § Summary-first read contract. `context`, `search` and default `list` return only `key`, `summary`, `kind`, `status`, `references`, `version` and `detailTokensEst`, plus bounded-output accounting and fetch guidance. Search ranks full canonical text before projecting results. `get --keys=<comma-list|-> [--all] [--json]` returns complete selected current entries and their versions, naming unresolved keys with exit 1. Stdin is a JSON key array. Default get excludes terminal entries; explicit `--all` permits historical investigation. Conflicts are unresolved, never silently chosen.

The reserved 2,000-token pathless context contains previews too. Every agent selects relevant keys and reads complete details before editing. Fetch uncertain matches; resolve omitted, missing, changed or host-truncated relevant content before dependent work. There is no pre-code full-body exception. Machine consumers may use `readBrain` or `list --full` without exposing full discovery bodies to an agent.

Only fully delivered `get` rows write usage recalls. Preview, machine export and maintenance reads do not. The agent records selected/fetched versions and pending keys in existing context artifacts; delivery is a measurable proxy, not proof of comprehension. No-shell agents use preview dispatch → selected-key handoff → orchestrator get → resumed/redispatched read → edit. Cover resume, no-plan conversion, per-group execution and remediation, not only the initial dispatch.

Authors compare summaries with full content before writing, preserving conditions, consequences and exceptions. Example: `Retry API calls only when idempotency prevents duplicate effects`. Mechanical validation covers nonblank one-line shape, while author/reviewer checks establish accuracy. Maintenance reviews each entry's summary and proposes fixes through existing approvals, separately from the `kind: summary` cluster records. Migration keeps deterministic fallback and existing source content.

### Data Schema Usage

- **Input:** schema-3 and historical rows in the four old ledgers, the brain, rejection rows, `.bkit/issues.jsonl` feature data, and temporary recall lines. Old source lines remain read-tolerant.
- **Output:** `docs/brain.jsonl` brain winners/history; `.bkit/brain-rejections.jsonl` process records; existing stats counters; temporary recall/packet/export files; committed audit reports.

### Data Schema Changes

- **Brain kinds:** `knowledge`, `decision`, `deferral`, `failure`, `assumption`, `summary`; identity `(repo, key)`. Other kinds retain their existing identity and writer rules.
- **Envelope:** schema remains 3; default per-kind `status`; mandatory nonblank one-line `summary`, intentionally authored and checked against the full entry on creation/update. The missing-value fallback stays the first description sentence capped at 200 characters for compatibility; it is not a semantic quality check. Read projections add computed `version` and `detailTokensEst` without persisting them; optional typed `links`, day-grain `lastRecalled`, and `proposal: {id, expectedVersion, contentBase, targets}, engine-only undo, exact-set resolves and terminal WITHDRAWN`. Per-kind fields remain flat.
- **Terminals:** `SUPERSEDED`, `CLOSED`, `FALSIFIED`, `FADED`, undo-only `WITHDRAWN`. `TRIAGED` and unknown free-string failure statuses remain current. Preserve each kind’s vocabulary from the design.
- **Assumptions/summaries:** assumptions require a concrete `falsifiedBy`, accept `validUntil`; summaries require `links.relatedTo` and description no longer than 2,000 characters.
- **Transitions:** failure → knowledge drops severity/category; needs-decision deferral → decision drops reason/type/severity/category; active assumption → knowledge drops falsifiedBy/validUntil. Each produces ACTIVE. All other normal cross-kind transitions refuse atomically; dedicated validated undo alone may restore a verified prior kind.
- **Migration:** fixed decisions/deferrals/failures/knowledge input order, no minted timestamps, exact-key references → relatedTo without removing references, malformed/blank/non-object lines retained byte-for-byte. Earliest first timestamp keeps a colliding key; other kinds use `{key}-{oldkind}`, with the same mapping for stragglers.
- **Update rank:** proposals rank at inherited contentBase.ts; recall is the maximum across all rows of an entry. Compaction preserves these facts with lineage. Suggestion id is the first 12 hex of SHA-256 over canonical action, sorted input/target key/exact-fingerprint pairs and payload.

## Reuse Inventory

Search evidence: semantic `identity`/`foldFrom` reads; source reads of codec, compactor, migration, command registry, ledger/context wrappers, settings, install/version handling, branch tooling and updater sources; `rg --hidden -l 'docs/(knowledge|decisions|deferrals|failures)\.jsonl' .bkit/core/engine -g '*.ts' -g '!*.test.ts'`; `rg --hidden -l 'brain|qmd|selectForFiles|suggestionId' .bkit/core/engine .bkit/templates -g '*.ts' -g '*.mjs'`; capability-register presence search; and the design’s prior-art/spike evidence. The second search found only rendering tests, and the path inventory independently confirms that no brain implementation exists. NEW reasons: (a) no candidate exists, (b) extending the candidate would break its named contract/callers, (c) replaces a deleted artifact.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Envelope, kinds, validation, identity, proposal rank and writer rules | `.bkit/core/engine/ledgers/telemetry.ts` | Semantic identity/foldFrom reads and source codec inspection | Existing codec | EXTEND | One codec owns all kinds; do not duplicate validation or fold. Tasks 3, 4, 19. |
| Compaction with lineage/recall and proposal rank | `.bkit/core/engine/ledgers/compact.ts` | Source and tests opened | Existing compactor | EXTEND | Preserve data using the same winner rule. Tasks 10, 19. |
| Brain paths, reads, links, selection and update pure helpers | `.bkit/core/engine/ledgers/brain.ts` | Brain-symbol text search, capability register and existing fold/context reads | Fold and clamp are reusable but neither owns brain paths/graph semantics | NEW | (a) No brain choke point or link resolver exists. Reuse the codec rather than create another one. Task 5, extended thereafter. |
| Brain helper tests | `.bkit/core/engine/ledgers/brain.test.ts` | Neighboring telemetry/migrate/compact tests opened | Existing tests cover their own modules | NEW | (a) No test module covers the new brain library; colocate by the testing convention. Task 5. |
| Wired CLI/upgrade/parity/context/update verification | `.bkit/core/engine/commands/workflow/brain.integration.test.ts` | Existing ledgers/context tests and test inventory searched | Unit tests do not exercise a wired install/CLI | NEW | (a) No integrated brain consumer fixture exists. Task 2 seeds one shared fixture, extended by later tasks. |
| Deterministic merge and branch-aware stubs | `.bkit/core/engine/ledgers/migrate.ts` | Source and real Git spike opened | Existing migrateLedgers and branch primitives | EXTEND | Same upgrade path and temp-write contract. Tasks 1, 8, 9. |
| Reusable ledger handlers and old-name refusal | `.bkit/core/engine/commands/workflow/ledgers.ts` | Existing append/check/spec read | Existing command helpers | EXTEND | Reuse the handlers from the sibling brain command module and retain bookkeeping here; register the sibling specification in `commands/registry.ts` without a context/tests/steps back-edge. Tasks 10, 14, 17, 21–23. |
| Keyword ranking and artifact clamp | `.bkit/core/engine/commands/workflow/context.ts` | ledgerScan body and clamp contract read | Existing ledgerScan/clampFile | EXTEND | Feed folded JSON lines to unchanged ranking and reuse clamp accounting. Tasks 12, 14, 17. |
| Settings | `.bkit/core/engine/shared/settings.ts` | Source/default reader read | BkitConfig/readBkitConfig | EXTEND | Add brain.update.ask outside ASK_POINTS; it has no max. Task 20. |
| Readers, registries and migration check | `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/commands/stats.ts` | Old-path inventory and source ranges opened | Current registry, install, reader and conflict paths | EXTEND | Preserve kind filters and import constants; inventory also found steps.ts and step-table.ts beyond the design’s original list. Tasks 7, 9, 11. |
| Shipped instructions and historical-layout harvest | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`, `scripts/harvest/ledgers.ts` | Path inventory and sources opened | Existing audit and harvest count-only paths | EXTEND | Reuse existing guard; harvest supports both layouts without copying brain prose. Tasks 11, 12, 15, 18, 24. |
| Unified inference prompt | `.bkit/core/prompts/bkit-utility-update-brain.md` | Four updater sources and model lookup opened | Four old updater prompts | NEW | (c) Replaces the four DELETE entries in Supersession Inventory; one per-kind pass uses clustered packets. Task 24. |
| Brain update procedure | `.bkit/core/.bkit/brain.md` | Procedure catalog and workflow routing reviewed | Five phase workflows require FID/phase/close | NEW | (b) Extending the phase router would break WORKFLOWS/auto phase and issue contracts; no procedure owns this issue-less loop. Task 24. |
| Opt-in scheduled cleanup | `.bkit/templates/.github/workflows/bkit-cloud.yml` | Template and adopted copy opened | Existing cloud jobs/credential selection | EXTEND | Separate optional job with its own issue-less prompt and existing provider choice. Task 25. |
| Schedule contract tests | `.bkit/core/engine/audits/templates/brain-schedule.test.ts` | Template test inventory and cloud template reviewed | Existing unrelated cloud tests | NEW | (a) No schedule/headless/push-retry brain contract test exists. Task 25. |
| Optional row export | `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs` | qmd/brain search, graphify template and official qmd README | Copy-and-own template pattern; no exporter | NEW | (a) No one-row-per-document brain exporter exists. Task 26. |
| qmd collection configuration | `.bkit/templates/.qmd/index.yml` | Template inventory and official qmd configuration shape | No qmd template | NEW | (a) No collection points at the derived row export. Task 26. |
| Optional actual-model smoke entry point | `.bkit/templates/scripts/qmd/bkit-qmd-smoke.mjs` | qmd README and template test inventory | No brain semantic-search smoke | NEW | (a) Core tests must not download models; the optional template verifies a real model returns the seeded row key. Task 26. |
| Exporter boundary test | `.bkit/core/engine/audits/templates/qmd-export.integration.test.ts` | Testing rubric and exporter candidates | No wired qmd-export fixture | NEW | (a) The real exporter plus real brain CLI requires a dedicated Integration test. Task 26. |
| Canonical brain/rejection data files | `docs/brain.jsonl`, `.bkit/brain-rejections.jsonl` | Codec append registry and migration inspected | Four old data files and existing append codec | NEW | (c) Brain replaces old per-kind storage; (a) no rejection store exists. Generated by migration/append, not seeded with fabricated timestamps. Tasks 9, 22. |
| Brain dispatch without the known initialization cycle | `.bkit/core/engine/commands/workflow/brain.ts` | Existing ledgers/context/steps imports and known-cycle evidence inspected | ledgers.ts cannot safely import context | NEW | Reason (b): the existing wrapper closes a steps initialization cycle; a sibling reuses unchanged helpers with no back-edge. Task 10. |

## Architecture & Component Changes

**Ledger rows:** `546-brain-sibling-command-dispatch`, `546-brain-unique-registry-staging`, `546-brain-shared-write-lock`, `546-brain-validated-undo`, `546-brain-content-equivalent-dedup`, `546-brain-design-01`, `546-brain-design-06`, `546-brain-design-07`, `546-brain-design-08`, `546-brain-design-10`, `546-brain-design-11`, `546-brain-design-13`, `546-brain-design-14`, `546-brain-design-15`, `546-brain-design-16`, `546-brain-design-17`, `546-brain-design-19`, `546-brain-design-20`, `546-brain-design-21`, `546-brain-design-22`, `546-brain-design-23`, `546-brain-design-24`, `546-brain-design-25`, `546-brain-design-26`, `546-brain-design-27`, `546-brain-design-28`, `546-brain-design-29`, `546-brain-design-31`, `546-brain-design-33`, `546-brain-design-34`, `546-brain-design-35`, `546-brain-design-37`, `546-brain-design-38`, `546-brain-design-39`, `546-brain-design-40`, `546-brain-design-41`, `546-brain-design-42`, `546-issues-jsonl-feature-rows-join-brain`, `546-retire-brain-stubs-and-legacy-ledger-alias`, `546-friction-stats-stay-separate`, `546-transcript-recall-outside-brain`, `546-fts5-until-measured-ranking-gap`.

Design decisions reuse the existing keys, including the owner's revised lock, restore, rank and content-preservation decisions. The line above includes this feature's existing decision/deferral records and the approved amendment keys; reused rows remain canonical. This rerun adds only genuinely new architecture choices. No implementation task writes or checks decision/deferral rows.

### Approved mutation and version contracts

- Every supported brain/stub/rejection/recall writer uses one repository-local lock under the common Git directory, from authoritative read through durable publication, including preceding migrateLedgers and mergeIntoBrain. Nested calls reuse ownership; AI and network work stay outside. Bounded contention writes nothing; live/unknown owners cannot be displaced by age.
- Durably copy complete normalized content and exact malformed bytes, flush/publish/re-read and verify membership before any source deletion. Require incompatible writers and Git mutations to be quiescent; otherwise retain full sources with a diagnostic. Branch inventory does not establish writer liveness.
- Exact fingerprints exclude only computed aggregates; proposal expectedVersion/targets check all observed inputs, while contentBase preserves underlying content generation through proposal chains. Compaction retains applied/input/prior/undo evidence, applied ids and divergent variants; recall cannot raise content priority.
- Matching identity/timestamp never proves content equivalence. Owner-approved resolutions use resolves full-content fingerprints with exact current variant-set validation under lock. Read representatives never authorize deleting alternatives.
- Dedicated bkit brain undo --applied=<fingerprint> validates owner authority and retained immutable evidence, refuses changed/ambiguous targets, sanitizes metadata, mints fresh provenance, permits only verified inverse kind restoration and withdraws creations via WITHDRAWN.
- Brain noun dispatch lives in a sibling command module. Keep ledgers.ts free of direct/indirect context.ts/tests.ts/steps.ts imports. The sibling reuses existing context helpers only after checking there is no back-edge to itself; built CLI startup is tested in the introducing group.

### Evidence required before old-source cleanup

Quiescence means that incompatible ledger writers and Git operations that can change the affected files have stopped for the entire destructive transaction.

- Default to copying and verifying the brain while retaining every old source file byte-for-byte. Normalize old rows in memory when source rewriting is not authorized.
- Add a per-invocation `--confirm-writers-stopped` acknowledgement to `bkit install`, `bkit upgrade` and `bkit brain update`. The operator supplies it only after stopping old engines, direct-file writers, background agents and Git mutations affecting the checkout, and keeping them stopped until the command exits. The acknowledgement is an operator assertion, not automatic proof about arbitrary external processes.
- Acquire the common write lock and reject destructive cleanup when Git reports an in-progress merge, rebase or cherry-pick, or an existing index lock. A clear scan, branch inventory, stale lock age, prior successful run, `--yes` or `--auto-apply` does not replace the current invocation's explicit acknowledgement.
- Keep the acknowledgement in memory for that invocation only. Do not persist it in configuration or infer it from another process's lock ownership. The scheduled headless job does not supply it and retains old sources.
- Without both the acknowledgement and the local checks, retain full sources and print the reason plus the command to rerun after the operator has stopped writers. With both, hold the write lock through fresh reads, durable destination verification and the branch-based stub/delete decision. An interruption requires a fresh acknowledgement on restart.

### Database Migrations

None — local JSONL upgrade only. Extend the existing install migration, register it in `docs/migrations.md`, and preserve the data-first, attributes-second, stub-cleanup-last order.

### Engine, CLI, readers and agent instructions

#### [MODIFY] `.bkit/core/engine/ledgers/telemetry.ts`

- **Existence Check:** source, writer registry and semantic identity/foldFrom definitions inspected.
- Add the six-kind envelope, constrained transitions, writer tables, rank and recall logic. Preserve non-brain identities and atomic validation.

#### [NEW] `.bkit/core/engine/ledgers/brain.ts`

- **Reuse Check:** Reuse Inventory reason (a); import the codec’s fold/normalizer and existing clamp/ranking rather than duplicate them.
- Own path constants, read/diagnostic functions, iterative link graph, context selection, suggestion identity, fade and clustered update helpers. Avoid module-initialization calls across the codec/path-constant import cycle.

#### [MODIFY] `.bkit/core/engine/ledgers/migrate.ts`

- **Existence Check:** migration and schema registry inspected.
- Merge every line deterministically, retain collision mappings for stragglers, detect local/remote/worktree old-path changes, and re-enter safely after a partial write.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** current append/check/bookkeeping wrapper inspected.
- Keep bookkeeping separate; the sibling brain command module owns the new noun and imports reusable handlers without introducing command cycles. Plain check is advisory exit 0; plan-named missing-row check preserves its current nonzero exit. List sorts newest first and filters kinds/current, returning previews unless a deterministic caller requests `--full`. Context and search return previews only. Key-selective `get` returns full rows and alone records delivery recalls. Update owns deterministic cleanup, reports, approval/rejection validation and counters.

#### [NEW] `.bkit/core/engine/commands/workflow/brain.ts`

- **Reuse Check:** reason (b), the existing ledgers wrapper cannot import context safely because context reaches steps/tests and steps reads ledgers constants during initialization.
- Own all nine brain verb specifications and handlers; reuse existing pure behavior without a back-edge and verify built distribution startup as soon as imports are introduced.

#### [MODIFY] `.bkit/core/engine/commands/registry.ts`

- **Existence Check:** COMMANDS registration inspected.
- Register the brain specification and expose generated help/docs for all verbs.

#### [MODIFY] `.bkit/core/engine/ledgers/compact.ts`

- **Existence Check:** compaction implementation/tests opened.
- Compact the brain with the same proposal rank and lineage/max recall semantics; keep `.bkit/issues.jsonl` separate.

#### [MODIFY] `.bkit/core/engine/shared/settings.ts`

- **Existence Check:** settings source and tests opened.
- Add `bkit.brain.update.ask` default true with validation, outside workflow ASK_POINTS.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** conflict registry/source and tests opened.
- Import the three brain path constants, union all data files, retain branch files in modify/delete conflicts and keep the existing close-squash no-row-loss test.

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** install module and migration call site inspected.
- Run merge immediately after legacy migration, include dry-run writes/deletes, and classify pending merge versus populated-stub advisory without hashing data as canonical payload.

#### [MODIFY] `.bkit/core/engine/commands/stats.ts`

- **Existence Check:** stats reader opened.
- Pass only the former deferral view to analysis; winner-kind counts and last-deferral reason history remain correct after transitions. The full stats/roadmap before-and-after fixture guards all reader changes, including workflow, decision, challenge, context, step and CLI surfaces.

#### [MODIFY] `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`

- **Existence Check:** audit source inspected.
- Widen old-path/read-instruction checks, validate typed-row/writer tables and assert that every host receives context through a callable boundary.

#### [NEW] `.bkit/core/engine/commands/workflow/brain.integration.test.ts`

- **Reuse Check:** reason (a), a wired real-filesystem consumer fixture. Use `requireTsx`, explicit module flags, bounded subprocess timeouts, per-test scratch roots and ground-truth bytes. Tasks 2–27 extend this one fixture.

#### [NEW] `.bkit/core/engine/ledgers/brain.test.ts`

- **Reuse Check:** reason (a), colocated pure-helper tests. Parameterized cases test graph cycles, ranking, invalid inputs and boundaries without duplicating implementation.

#### [NEW] `.bkit/core/prompts/bkit-utility-update-brain.md`

- **Reuse Check:** reason (c), replaces four removed updaters. One dispatch per engine packet; output typed proposals for corrections/close/triage, links, contradictions, repeats/assumptions, summaries and fades. Include Bash for the named writer and retain the untrusted-input contract.

#### [NEW] `.bkit/core/.bkit/brain.md`

- **Reuse Check:** reason (b), issue-less procedure instead of changing the phase workflow contract. Document the engine dispatch plan, attended/headless modes, approval, own-path commits, undo and packet resizing over 120,000 tokens.

#### [DELETE] `.bkit/core/prompts/bkit-utility-update-knowledge.md`

#### [DELETE] `.bkit/core/prompts/bkit-utility-update-decisions.md`

#### [DELETE] `.bkit/core/prompts/bkit-utility-update-deferrals.md`

#### [DELETE] `.bkit/core/prompts/bkit-utility-update-failures.md`

- Their inferred per-kind responsibilities move to the unified prompt; generated agents/model rows/callers are removed by the source install/render process.

#### [DELETE] `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`

- Migration retains full sources while incompatible-writer quiescence is unproven. After durable full-content verification and proven quiescence, it deletes old paths when no visible unmerged branch/worktree touches them, or retains zero-byte union stubs under the staged rollout in Supersession Inventory. Readers include resurrected old files until the future retirement release.

Other source edits are the path sweep and read-door switch specified by Tasks 11–18 and Documentation Updates. At each affected group boundary refresh generated fixtures/mirrors needed by group checks; perform the full source upgrade at the final boundary, then build and include `dist/`; do not directly patch generated mirrors.

### Cron Jobs & Scheduled Tasks

Extend the copy-and-own cloud template with optional `bkit-brain-update`: Monday 03:00 UTC, off until the consumer enables the trigger; issue-less dispatch; existing provider credentials; headless procedure; only cleanup/report commits to `dev`; fetch/merge/retry once on rejected push; failure includes CI run id. Task 25 updates the adopted copy after the already-approved design’s CI change is carried into build and records it in `docs/deployments.md` and the template catalog.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/core/prompts/bkit-utility-update-knowledge.md` | `bkit-utility-update-brain.md` | DELETE | Task 24 transfers its per-kind checks and removes generated agents/callers/model entries. |
| `.bkit/core/prompts/bkit-utility-update-decisions.md` | `bkit-utility-update-brain.md` | DELETE | Same unified pass; assumption re-testing remains explicit. |
| `.bkit/core/prompts/bkit-utility-update-deferrals.md` | `bkit-utility-update-brain.md` | DELETE | Close/triage reasoning remains in the unified pass. |
| `.bkit/core/prompts/bkit-utility-update-failures.md` | `bkit-utility-update-brain.md` | DELETE | Failure verification/correction remains in the unified pass. |
| `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl` | `docs/brain.jsonl` | RETAIN full sources until verified durable copy and incompatible-writer quiescence; then DELETE when branch check has no hit, otherwise RETAIN-WITH-REASON as zero-byte stubs | Staged rollout preserves pre-upgrade external branches. The kill condition is the first supported-release range in which no supported install predates this merge; follow-up is `546-retire-brain-stubs-and-legacy-ledger-alias`. No calendar date is invented before a release boundary exists. Full retained sources and repopulated stubs remain readable. |

No deprecated write alias remains after the brain exists. Typed links and read helpers supersede raw single-kind paths, and the audit guards their removal.

## Documentation Updates

Edit canonical payload sources and regenerate their managed mirrors. The final documentation task verifies every row, while feature tasks update the contract beside their code.

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/jsonl.md` → `.bkit/jsonl.md` | Envelope, six kinds, transition/writer tables, proposal/recall fold, rejection rows, brain write idiom and local-state contract. |
| `.bkit/core/.bkit/cli.md` → `.bkit/cli.md` | Regenerate all nine brain verb specs, including get and undo, exits, preview/detail output and old-name refusal. |
| `.bkit/core/.bkit/install.md` → `.bkit/install.md` | Explain the per-invocation maintenance acknowledgement, source-retaining default and safe cleanup retry for install/upgrade. |
| `.bkit/core/.bkit/workflows.md` → `.bkit/workflows.md` | Kind-filtered reads, context dispatch and search calls; no sixth phase. |
| `.bkit/core/.bkit/prompts.md` → `.bkit/prompts.md` | Unified updater description/tools/model columns and retirement of four rows. |
| `.bkit/instructions.md` | Shared writer/read clauses and current brain command; inspect with instructions:show before edits and sync shared text. |
| `.bkit/core/.bkit/templates.md` → `.bkit/templates.md` | Optional scheduled job and qmd install/copy/ignore/model/SQLite requirements. |
| `.bkit/core/.bkit/brain.md` → `.bkit/brain.md` | Chat and headless update procedure, dispatch packets, modes, approval, commits, undo and batch resizing. |
| `.bkit/core/.agents/docs.md` → `.agents/docs.md` | One brain entry through commands and a procedure-doc row with phase applicability. |
| `.bkit/core/.agents/rules.md` → `.agents/rules.md` | File-scoped context and current brain-row writing clauses through shared sync. |
| `.bkit/core/docs/templates/*.md` | Ledger names and read instructions only; preserve template responsibilities. |
| `.bkit/shared/docs/technology.md`, `.bkit/shared/docs/data-schema.md`, `.bkit/shared/docs/deployments.md` | Replace ledger references; keep production schema separate. |
| `docs/architecture.md` | Brain library/data topology, temporary files, rejection ledger and qmd template locations. |
| `docs/technology.md` | Node-only keyword search, optional pinned qmd, no core dependencies. |
| `docs/testing.md` | New brain, CLI integration, schedule and qmd test files; tier distinctions and optional real-model smoke. |
| `docs/observability.md` | `[bkit-brain]` stderr lines, `[bkit-upgrade]` partial merge, counters and scheduled run failures. |
| `docs/migrations.md` | One-way merge, supported old release range, brain-first order, branch-aware stubs and recovery. |
| `docs/deployments.md` | Optional Monday 03:00 UTC job, headless restriction, existing credentials, dev commit/push and retry ownership. |
| `scripts/readme/readme-art.mjs`, `.github/assets/*.svg` | Update ledger-name copy and regenerate affected art from source. |

Decisions and deferrals are recorded by this planning step; build tasks do not append governance records as deliverables. No new knowledge row is required to repeat this plan.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| Code/payload | Revert the implementation commit(s) and rebuild/regenerate the matching payload | Preserve any new brain data before selecting an older engine; old engines cannot see the brain. |
| Local data migration | Prefer upgrade forward; a complete Git revert of the migration commit restores the old layout | Copy the brain and post-migration rows to a safe review artifact first and reconcile them explicitly. Do not discard newer brain-only facts or truncate stubs first. |
| Approved inference | Run the report’s `bkit brain undo --applied=<fingerprint>` command | Verify retained immutable evidence and an unchanged target under lock; append fresh restore provenance or WITHDRAWN for creation. Stale or ambiguous targets require a new reviewed action. |
| Optional schedule | Disable the opt-in trigger/job | Existing workflow phases remain available; held suggestions remain in committed reports. |
| Optional qmd | Remove the adopted optional tool configuration and derived index/export | JSONL truth remains intact; no database rollback. |

No service database migration or deploy gap applies. A mixed-version worktree can silently read zero old rows, so migration documentation must say upgrade forward or revert the entire migration commit.

## Agent Execution Runbook

Each task owns its logic and any existing tests it breaks. Runbook DONE WHEN fields are the implementation gates; later advisory checks do not add merge gates. Suggested delivery stages follow the design, and one PR containing all tasks is fine. The fixture seeded in Task 2 records the three file sets before any shipped prompt changes; preserve its baseline values throughout later groups.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Preserve baseline behavior and define the envelope

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Pin the real Git stub-merge behavior before changing the migration.
  - **UPDATE:** `.bkit/core/engine/ledgers/migrate.test.ts`: turn the design spike’s three merge shapes and no-union control into bounded real-Git regression cases.
  - **READ:** `docs/plans/202611/logs/546-knowledge-store-ledger/spike/c1-stub-union.sh`: reuse the measured base/ours/theirs setup rather than invent a merge scenario.
  - **DONE WHEN:** ordinary merge, squash -X ours and reverse merge retain old plus appended lines without conflict under union; the no-union control conflicts; fixtures touch only scratch repositories.
  - **TEST FIRST:** n/a — characterization of current real-Git behavior; no production behavior changes in this task.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Record full render and token-read baselines in a reusable consumer fixture.
  - **CREATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: seed all four old ledgers, mixed terminal/current rows, stats/feature rows and malformed lines; capture complete stats/roadmap output and three task file sets before the merge.
  - **READ:** `.bkit/core/engine/commands/stats.ts`: capture the full report, not selected counts.
  - **READ:** `.bkit/core/engine/commands/workflow/roadmap.ts`: preserve the complete render including consumer notes.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the fixture has stable expected full outputs and all three before estimates from current knowledge-row characters/4, and its baseline characterization passes through the actual CLI with explicit module flags and requireTsx. Record fixture relevance keys before implementation, complete full-row path-context baseline as well as whole-knowledge baseline, and broad/pathless/description-only search queries with expected matches. Include a vague summary, a crucial condition only in details, changed/terminal/missing/conflicting keys, a large entry and an over-budget selection.
  - **TEST FIRST:** n/a — characterization fixture and measurement only; no behavior changes.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Extend the shared codec with brain identity, defaults and new kinds.
  - **CREATE:** `.bkit/core/engine/ledgers/brain.ts`: constants first without codec imports at initialization; later read helpers use deferred codec access.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: interim APPEND_LEDGERS brain entry for assumption/summary only, rejections separate and matching KIND_WRITERS/doc-table entries in this task, existing kinds in their unique old entries until Task 10; six brain kinds, `(repo,key)` identity, unchanged non-brain identity, default statuses, summary fill, current/terminal semantics and lineage across kind changes.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: new codec cases and existing expectations affected by the envelope.
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: document the envelope and status defaults beside the codec change.
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: distinguish summary authoring/accuracy from deterministic missing-value fill; preserve historical supplied summaries and keep preview metadata out of persisted rows.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** typecheck and existing exactly-one-ledger-per-kind and writer parity tests pass at this boundary; brain entries fold across kinds while feature/friction/chat/run remain separate; absent defaults normalize consistently; unknown failure statuses and TRIAGED remain current; new kinds validate and all affected codec tests pass; interim writer-table entries required by AppendKind land with the registry, with Task 4 tightening transition validation.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `folds brain kinds by repo and key without folding feature rows` fails on one entry splitting by kind or a feature row being hidden.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `fills brain status and summary defaults without minting migration time` fails on absent envelope fields or changed source timestamps.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `keeps TRIAGED and unknown failure statuses current` fails on current rows being filtered as terminal.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Validate typed links, new-kind writers and the closed transition list atomically.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: link/proposal shapes, required assumption falsifier, summary limits, transition preconditions/dropped fields and writer rules.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: table-driven refusal and allowed-transition cases, preserving no-write-on-any-invalid-row.
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: writer and transition tables with parity tests.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** only the three design transitions succeed with the correct ACTIVE status and removed fields; invalid batch rows return exit 8 with unchanged file bytes; writer-table parity covers assumption/summary/rejection and existing roles. Verify that new writes have nonblank one-line summaries after normalization; author prompts compare meaning with full content. A shape check cannot certify accuracy. Keep migration read tolerance and the separate 2,000-character description limit for `kind: summary`.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `allows only the three documented brain kind transitions` fails on unsupported transitions succeeding or required old fields remaining.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `refuses malformed links assumptions and oversized summaries atomically` fails on an invalid row being appended or a valid sibling being partially written.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `enforces brain kind writers against the documented table` fails on an unauthorized writer or missing authorized role.

<!-- bkit:task 4 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Build the read door, graph and deterministic migration

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Introduce the brain path constants and tolerant kind-filtered read helper.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: canonical path constants and readBrain using the existing normalizer/fold over brain plus stubs, source counts and once-per-process warnings.
  - **CREATE:** `.bkit/core/engine/ledgers/brain.test.ts`: old-shape, duplicate, missing-file, kind-filter and malformed-source cases.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: a shared preview projection from complete canonical rows, exact-key selection preserving request order, computed version/detail cost, and named missing/terminal/conflict outcomes. Projection never mutates source rows or leaks description/rationale/remediation fields.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.test.ts`: test projection fields, source immutability, ordered key selection, versions and unresolved outcomes.
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** an absent stub is harmless, only equivalent full-content copies are deduplicated; divergent variants are retained and diagnosed, a new stub row stays visible, kinds/current select only the intended winners, and stderr counts each degraded source once without altering source files.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/brain.test.ts` `reads normalized brain and stub winners without duplicate copies` fails on resurrected old rows being doubled or new stragglers being omitted.
    - `.bkit/core/engine/ledgers/brain.test.ts` `filters the winner kind and terminal state` fails on mixed-kind rows leaking into a per-kind view.
    - `.bkit/core/engine/ledgers/brain.test.ts` `reports malformed and waiting source lines once without writes` fails on missing diagnostics, repeated warnings or changed source bytes.
    - `.bkit/core/engine/ledgers/brain.test.ts` `retains divergent equal-version content until exact-set resolution` fails on a distinct variant disappearing or incomplete/forged resolution succeeding.
    - `.bkit/core/engine/ledgers/brain.test.ts` `projects summaries and selects ordered complete details without mutating rows` fails on leaked full fields, incorrect versions/cost estimates, changed source content or unresolved keys being silently omitted.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Add reverse links and advisory graph findings.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: forward/reverse maps, dependents and iterative bounded check findings with the design’s fix lines.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.test.ts`: dead-premise, successor, dangling, cycle, expiry and timestamp-conflict tables.
  - **DEPENDS ON:** 3, 5
  - **DONE WHEN:** every current dependent of SUPERSEDED/CLOSED/FALSIFIED/FADED/WITHDRAWN premises is found; relatedTo is not a premise; successor lookup reverses supersedes; cycles terminate; all design day-one findings retain distinct fixes.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/brain.test.ts` `finds terminal-premise dependents and superseded successors` fails on an affected current row or reverse successor being absent.
    - `.bkit/core/engine/ledgers/brain.test.ts` `reports dangling links cycles expiry and missing successors without recursion` fails on a loop hanging or a graph finding disappearing.
    - `.bkit/core/engine/ledgers/brain.test.ts` `reports equal timestamp divergent content separately from related citations` fails on an ambiguous duplicate being silent or a citation triggering a dead-premise alarm.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Centralize data paths and preserve branch conflict handling.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: keep each kind in exactly one ledger: interim brain entry contains only assumption/summary, rejections separate, four existing kinds stay in their original entries until Tasks 10 and 11 cut over together.
  - **UPDATE:** `.bkit/core/engine/ledgers/migrate.ts`: schema-data registry includes brain/rejections/stubs through constants.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: union registry imports constants and modify/delete handling keeps a branch’s old-path file.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: real-temp-repo conflict and schema-data identity assertions.
  - **READ:** `.bkit/core/engine/install/version-file.ts`: retain schema-ledger exclusion from canonical hashes.
  - **DEPENDS ON:** 5, 6
  - **DONE WHEN:** all literal path registries share brain constants, one-ledger-per-kind/writer parity and typecheck pass at this boundary; old callers stay valid until the same-group Tasks 10 and 11 cutover, data files never gain canonical payload hashes, UNION_PATHSPECS/CLOSE_DOCS still match the new paths, and late branch additions survive conflict resolution and close squash without a lost-row exit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `keeps late old-ledger files in modify delete conflicts` fails on a branch’s added row being deleted by conflict resolution.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `treats brain rejections and stubs as union data rather than managed payload` fails on a data path being omitted from union handling or recorded as a canonical hash.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Implement deterministic merge, collision mapping and shared write-lock primitives.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: common write lock, fingerprints, retained evidence/conflicts and recoverable durable-copy protocol.
  - **UPDATE:** `.bkit/core/engine/ledgers/migrate.ts`: fixed input order, no new timestamps, byte-preserved bad lines, envelope/backfill, complete normalized-content deduplication retaining divergent versions and stable oldkind collision mapping.
  - **UPDATE:** `.bkit/core/engine/ledgers/migrate.test.ts`: deterministic and interrupted-state regression fixtures.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.test.ts`: non-mock filesystem/process lock ownership and bounded-refusal fixtures.
  - **DEPENDS ON:** 3, 5, 7
  - **DONE WHEN:** every input line is accounted for; repeated runs/two branches produce byte-identical brain output; refs remain intact with relatedTo backfill; collisions and later stragglers map consistently; a copied-but-untruncated source rerun changes no existing brain bytes; real filesystem/process fixtures prove bounded contention writes nothing, live/unknown owners are not displaced, nested calls reuse ownership, and stale/lost tokens cannot publish or release a replacement owner's lock.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/migrate.test.ts` `merges every old line deterministically without minting timestamps` fails on lost malformed/blank lines, reordered inputs or branch-specific timestamp copies.
    - `.bkit/core/engine/ledgers/migrate.test.ts` `backfills only exact-key relatedTo links and preserves references` fails on citations becoming premises or original references disappearing.
    - `.bkit/core/engine/ledgers/migrate.test.ts` `maps collision stragglers to the earlier-firstTs winner consistently` fails on a late oldkind row merging into the wrong entry.
    - `.bkit/core/engine/ledgers/migrate.test.ts` `recovers a brain-written source-untruncated partial merge byte identically` fails on duplicated rows after a crash boundary.
    - `.bkit/core/engine/ledgers/migrate.test.ts` `preserves divergent same-version rows through repeated full-content drains` fails on different content/links being dropped by identity membership.
    - `.bkit/core/engine/ledgers/brain.test.ts` `refuses bounded lock contention without writes or displacing live and unknown owners` fails on changed store bytes after failed acquisition or an existing owner being evicted by age.
    - `.bkit/core/engine/ledgers/brain.test.ts` `reuses nested lock ownership and rejects stale token publication and release` fails on nested acquisition blocking itself or a lost token publishing data or removing a replacement owner's lock.

<!-- bkit:task 8 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Wire upgrade, basic verbs and all existing readers

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Wire branch-aware migration into install, upgrade and check.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: acquire/reuse the lock before migrateLedgers through mergeIntoBrain and apply Evidence required before old-source cleanup before either destructive rewrite; merge after migrateLedgers, writeset-aware dry run and data-first write order.
  - **UPDATE:** `.bkit/core/engine/cli.ts`: accept and pass the per-invocation --confirm-writers-stopped acknowledgement for install/upgrade, without treating generic approval flags as that acknowledgement.
  - **UPDATE:** `.bkit/core/engine/ledgers/migrate.ts`: branch/remote/worktree enumeration, current-invocation maintenance checks, stub-or-delete and partial-state lines.
  - **UPDATE:** `.bkit/core/engine/checks/after/index.ts`: inline-fix advisory for populated old files beside the brain where the existing post-check path owns advisories.
  - **UPDATE:** `.bkit/shared/.gitattributes`: brain/rejection union entries, retaining the four old paths.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: actual install/upgrade/check scenarios.
  - **UPDATE:** `.bkit/core/.bkit/install.md`: document --confirm-writers-stopped, the required maintenance window and the default that preserves old sources.
  - **UPDATE:** `docs/migrations.md`: supported prior-release range, one-way note, operator maintenance acknowledgement, default source retention and recovery.
  - **DEPENDS ON:** 2, 8
  - **DONE WHEN:** fresh locked reads and destination flush/publication/full-content verification precede source removal; absent acknowledgement or active Git operations preserve full source bytes with an inline rerun command; restart requires fresh acknowledgement and recovers every publication boundary; brain rename precedes attributes and authorized stub cleanup; after the maintenance checks pass, unmerged local/remote/worktree touches retain stubs and no touches delete them; dry run predicts the same paths for the same acknowledgement without writes; old nonempty/no-brain layout is drift exit 1 while filled stub/brain is advisory exit 0 with inline recovery.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `upgrades old consumers twice with identical brain bytes` fails on lost lines or different second-run bytes.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `keeps stubs for local remote and worktree changes but deletes unused old paths` fails on an in-flight branch losing its absorption path or unused files remaining.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `predicts the migration writeset without changing files in dry run` fails on dry-run writes or omitted actual write/delete paths.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `distinguishes pending merge drift from readable straggler advisory` fails on a silent unmerged layout or a filled stub wrongly blocking check.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `recovers every publication boundary and retains sources with incompatible writers` fails on source loss or cleanup without proven writer quiescence.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `requires fresh maintenance acknowledgement before destructive old-source cleanup` fails on source rewriting without explicit acknowledgement, generic approval authorizing cleanup, persisted acknowledgement surviving restart, or an active Git operation permitting deletion; exercise confirmed and unconfirmed invocations through the real install/upgrade CLI.

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Ship the basic brain CLI and refuse old brain-kind write names.
  - **CREATE:** `.bkit/core/engine/commands/workflow/brain.ts`: brain append/check/list/compact specifications and shared handlers, existing plan-check missing-row exit and legacy-name refusal.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: reusable append/bookkeeping primitives and migrated old-name refusal, with no context/tests/steps imports.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: consolidate four old kinds into brain and remove old write names in the same group as Task 11 callers/tests and compactor updates; friction/stats remain.
  - **UPDATE:** `.bkit/core/engine/commands/registry.ts`: register the brain noun exported from `.bkit/core/engine/commands/workflow/brain.ts`.
  - **UPDATE:** `.bkit/core/engine/ledgers/compact.ts`: brain compaction without changing issues/bookkeeping operations.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: command and actual file effects.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: basic verb generated specifications.
  - **UPDATE:** `docs/observability.md`: basic brain diagnostic/append/check lines.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: implement get with keys/all/json flags per the retrieval contract; default list emits previews and list --full preserves deterministic complete JSON-line exports. Get deduplicates keys, returns whole rows/current versions, reports each unresolved key and exits 1 if any are unresolved. No row-body truncation; callers batch keys. Usage-recall wiring lands in Task 14.
  - **DEPENDS ON:** 2, 9
  - **DONE WHEN:** valid rows append atomically; terminal writes print at most 20 dependents plus the remainder/check hint; advisory check exits 0 with grouped fixes/source counts; plan check preserves EXIT_ROWS_MISSING; list filters/sorts and compact dry run is read-only; migrated old-name appends exit 8 with unchanged files and exact replacement guidance.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `appends brain rows and caps terminal dependents without rejecting the write` fails on lost dependents, uncapped output or a terminal write failing for a finding.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `checks graph findings advisory while preserving plan missing-row refusal` fails on wrong exits or missing fix/source output.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `lists current kinds and compacts brain without touching bookkeeping` fails on cross-kind leakage or unrelated data changes.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `refuses migrated old ledger names with the brain replacement command` fails on an old-path row being written or missing exit 8 guidance.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `serializes append compact and migration with safe bounded lock ownership` fails on a live owner eviction or concurrent append loss.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `starts built brain help and verbs without initialization cycles` fails on a built CLI crash before dispatch.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `lists previews and fetches complete canonical entries by selected keys` fails on preview body leakage, wrong request ordering, silent missing/terminal/conflict keys, or truncated detail bodies.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `keeps full machine exports independent of preview output` fails on summary projection entering a deterministic export or exported reads mutating recall state.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Move every engine/script consumer to the correct kind-filtered view.
  - **UPDATE:** `.bkit/core/engine/commands/stats.ts`: preserve its former deferral-only input.
  - **UPDATE:** `.bkit/core/engine/commands/analysis.ts`: retain last-deferral reason history across a deferral-to-decision transition while winner-kind counts change.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: use brain reads/writes without changing workflow lifecycle or ledger-key checks.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/challenge.ts`: write deferrals through the brain.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: pending/approved/deferred operations retain their views and ownership rules.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: interim existing scan readers take serialized kind-filtered brain rows.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: remove old-path reads/contract references from step completion.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.ts`: keep context artifact contracts while updating old read descriptions.
  - **UPDATE:** `.bkit/core/engine/cli.ts`: update old-path user/help references and affected direct consumers.
  - **UPDATE:** `scripts/harvest/ledgers.ts`: count-only reads handle old and brain layouts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: parity and transition-history cases.
  - **UPDATE:** `scripts/harvest/ledgers.test.ts`: affected mixed-layout count cases.
  - **DEPENDS ON:** 2, 10
  - **DONE WHEN:** before/after whole stats/roadmap outputs and fold winners match on the baseline fixture; every per-kind consumer sees the same former kinds; transitions update kind counts without erasing reason verdicts; harvest preserves source bytes and copies no brain prose; affected existing tests pass. Verify that deterministic engine/statistics/roadmap readers keep full `readBrain` data. Any CLI-based machine consumer explicitly uses `list --full`; preview defaults cannot alter its fields or counts.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `preserves complete stats roadmap and per-kind reader outputs after the merge` fails on any full-output change or a formerly visible row disappearing.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `counts winner kinds without erasing the last deferral reason` fails on a converted entry losing its adjudication history.
    - `scripts/harvest/ledgers.test.ts` `counts both old and brain layouts without copying brain prose` fails on count drift, source mutation or prose entering harvest.

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Sweep shipped paths and enforce one read/write door.
  - **UPDATE:** `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`: old-path guard over engine source except brain.ts, workflow bash and doc templates; audit actual read instructions as well as strings.
  - **UPDATE:** `.bkit/instructions.md`: shared ledger append/read clauses through instructions:show and sync.
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: complete brain/rejection envelope, write idiom and transition/writer tables.
  - **UPDATE:** `.bkit/core/.agents/docs.md`: one command-read brain entry instead of four raw-ledger entries.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: interim kind-filtered related ledger reads and brain-row writes.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: interim filtered reads and brain-row writes.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-roadmap.md`: filtered current deferral/failure list.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-deferrals.md`: current deferral list through the command.
  - **UPDATE:** `scripts/readme/readme-art.mjs`: ledger-name copy, with generated SVG refresh.
  - **UPDATE:** `docs/architecture.md`: local brain module/data locations.
  - **UPDATE:** `.bkit/instructions.md`: shared ledger-writing clauses require an informative summary on creation, comparison with the full entry before append and revision on substantive updates. Inventory and synchronize all carrying writer prompts and examples.
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: document summary quality checks on creation and substantive updates, separately from the missing-value fallback.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: check full relevant-entry reads before edits and preserve pending-read evidence. Audit interim agent kind-based reads for list previews followed by selected-key get, and machine readers for explicit full output.
  - **DEPENDS ON:** 11
  - **DONE WHEN:** bulk inventory covers all old-path/name mentions under core/shared/templates and named external scripts/assets; every reading instruction is reviewed for kind filters; source indexes change beside their payload; four old updaters temporarily use brain views until Task 24; the widened audit passes with no old-path exception outside brain.ts.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `routes every live brain reader and writer through the brain door` fails on any inventoried raw old-path reader, workflow bash path or template path surviving the sweep.

<!-- bkit:task 12 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: File-scoped context and host dispatch

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Select and rank current brain rows by normalized file references.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: normalization, exact/ancestor ranking, kind order, timestamp order and capped pathless bundle.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.test.ts`: table-driven normalization and path boundary cases.
  - **DEPENDS ON:** 3, 5, 12
  - **DONE WHEN:** ./, trailing slash, :line and section qualifiers normalize; folder ancestry respects path segments; exact file outranks near/far folder, then failure/knowledge/assumption/decision/deferral/summary and newest; only previews of pathless current summary/knowledge/assumption rows enter the 2,000-token bundle; serialize the shared projection before budget accounting.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/brain.test.ts` `normalizes references and matches only files or ancestor folders` fails on valid qualified paths being missed or sibling prefixes matching.
    - `.bkit/core/engine/ledgers/brain.test.ts` `ranks exact nearer kind and newest matches deterministically` fails on an older broad match outranking the relevant file row.
    - `.bkit/core/engine/ledgers/brain.test.ts` `caps only eligible current pathless rows at two thousand tokens` fails on an oversized or ineligible always-loaded bundle.

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Wire summary context, clamp reservation and get-only best-effort recalls.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: context files/list/stdin and JSON modes.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: reuse ledger clamp/accounting with an explicit reserved prefix budget.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: resolve shared tmp via common Git directory and append recalls for fully delivered get keys only.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: real output/recall file checks.
  - **DEPENDS ON:** 2, 3, 5, 10, 13
  - **DONE WHEN:** no ledgers-to-context/tests/steps import cycle exists; build then execute node dist/cli.js help and the introduced brain verb in this group; recall opens append descriptors only after obtaining the common lock; reserved pathless previews survive the 97-row selection before path previews; dropped pathless/path keys and fetch hints are explicit; tokensEst uses serialized characters/4; context/list never append recalls; get from two worktrees appends complete returned keys to one shared log; failed recall writes warn without failing otherwise resolved detail reads.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `preserves the reserved always-loaded prefix under a large context clamp` fails on the cap cutting any eligible reserved row or omitting dropped-key notice.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `records only complete get results in a shared worktree recall log` fails on context/list previews refreshing recalls, unresolved get keys being recalled, or separate disposable worktree logs.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `prints tokens and succeeds with a warning when get recall is unwritable` fails on missing preview/detail cost accounting or recall failure rejecting resolved detail reads.

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** Switch all pre-code reads to previews, selected details and read-before-edit handoffs.
  - **UPDATE:** `.bkit/instructions.md`: canonical Check gotchas first clause with file-scoped context.
  - **UPDATE:** `.bkit/core/.agents/rules.md`: synchronized context instruction.
  - **UPDATE:** `.bkit/core/.agents/docs.md`: context as the brain entry point.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: orchestrator context before reviewer dispatch.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: orchestrator context before execute/verification dispatch as required by host tools.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: context before diagnostic dispatch.
  - **UPDATE:** `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`: no-whole-ledger and five-host no-shell checks.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: inspect pending-read manifests and full-entry evidence before accepting edits. All three workflow updates above and their dispatched prompts require full relevant reads, fetch vague/uncertain previews, and refresh on changed task files or unavailable resume evidence. Apply the same ordering to no-plan conversion, per-group execution and remediation.
  - **DEPENDS ON:** 14
  - **DONE WHEN:** shared sync covers every old gotcha clause, affected prompt sources receive context or command access, five host renders deliver the same previews then selected full entries, no no-shell agent is told to execute an unavailable command, no edit precedes resolution of relevant detail requests, and no rule/prompt/index permits a whole-ledger or summary-only substitute for the required read. Verify that no-shell dispatch first requests selection only; selected keys return to the orchestrator, get runs, and the worker resumes or is redispatched with full entries and versions before edits. Existing context artifacts carry selected/fetched/pending keys and detail paths. Unit audits check five-host prompt wiring; actual agent behavior is exercised in Task 27.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `delivers summary selection and full detail handoffs before edits on every host` fails on a raw whole-ledger directive, a full-body discovery bypass, missing selected-key response handling or a no-shell edit before detail delivery.

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** Measure complete summary-to-detail pre-code cost on the three baseline tasks.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: run context then get for the fixture's predeclared relevant keys; count preview, selection/handoff and detail outputs, retries and repeated reads against both Task 2 baselines.
  - **DEPENDS ON:** 2, 15
  - **DONE WHEN:** each recorded task costs fewer characters/4 across its complete retrieval than the original whole-knowledge read, with every required key fully read; separately report the incremental change against full-row path context and any extra calls/latency; task logs carry file sets, expected/fetched keys, all costs, cap and dropped counts; the log re-evaluates the agreed cap against source figures and surfaces any unsupported trade-off to the owner without silently changing the cap or writing governance rows.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `counts previews handoffs and complete details on the three file tasks` fails on omitted detail cost, a missing required key, or a total meeting/exceeding the whole-knowledge baseline. Report any regression against the tighter full-row context baseline rather than claiming an incremental saving.

<!-- bkit:task 16 end -->
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Keyword search and proposal-safe updates

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** Add keyword search over current kind-filtered fold winners.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: search text/kind/all/json handler: rank full rows, project results to previews, apply output budget and emit fetch guidance without recall writes.
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: reuse ledgerScan unchanged for rank/top-40/notice.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: actual CLI search tests.
  - **DEPENDS ON:** 2, 10, 16
  - **DONE WHEN:** no ledgers-to-context/tests/steps import cycle exists; build then execute node dist/cli.js help and the introduced brain verb in this group; recall opens append descriptors only after obtaining the common lock; search uses serialized winners rather than raw history; kind/current/all behavior and empty results match the contract, top-40 ranking and truncation notice survive, description-only matches appear as summaries, and search writes no recalls; no index or dependency is introduced. After search exists, run the Task 2 broad/pathless and description-only queries through preview → get. Count total tokens, calls, latency and required-key coverage against the same full-row search results; report regressions. This search benchmark follows Task 16 and does not create a backward task dependency.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `searches current winners with kind and all filters` fails on stale history appearing or a requested terminal row being absent under all.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `preserves ledgerScan ranking and the forty-hit truncation notice` fails on changed rank semantics or an unmarked dropped result.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `searches complete text but emits only previews without recalls` fails on a description-only match being missed, a description leaking into output, a preview updating recall, or a fabricated empty-result match.

<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** Move plan/ship related-context readers onto search without losing artifacts.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: per-kind brain search for related deferrals/failures, preserving reset/log/clamp artifacts.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: filtered related-ledger search with the existing step output contract.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: caller and artifact contract beside workflow changes.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: context/search specs.
  - **UPDATE:** `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`: assert actual command/kind/artifact wiring rather than a magic sentence.
  - **DEPENDS ON:** 17
  - **DONE WHEN:** both workflows preserve the prior candidate key/rank set and required related-artifact paths with clamp metadata; artifacts contain previews plus selected/fetched/pending versions and linked full-detail artifacts. Reviewers read full relevant entries before findings or edits. Resume reuses valid full evidence or performs the selection/fetch handoff again; no gate treats a preview as a full read.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `preserves candidate artifacts and selected full-entry evidence through search and resume` fails on wrong kinds/ranking, missing preview/detail paths, discarded clamp records or a reviewer proceeding with pending details.

<!-- bkit:task 18 end -->

<!-- bkit:task 19 start -->

- [ ] **TASK 19:** Make proposals and recall metadata converge across append, merge and compaction.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: inherited proposal.contentBase winner rank and maximum recall across an entry.
  - **UPDATE:** `.bkit/core/engine/ledgers/compact.ts`: same rank and recall preservation.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: canonical deterministic suggestion id.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: stale/applied proposal skips before mutation.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: permutation/property-style tests and append skips.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.test.ts`: retained fingerprint/content-generation and conflict-evidence cases.
  - **DEPENDS ON:** 3, 5, 10, 18
  - **DONE WHEN:** all observed versions and applied ids are checked under the lock; exact expectedVersion is separate from inherited contentBase; chains never advance content priority, and conflicting generations/evidence survive compaction; unseen newer normal content wins, with equal-rank divergent generations retained as explicit conflicts; repeated/chained proposals and compaction agree under merge-order permutations; recall takes max; identical target/content proposals hash equally and changed exact input versions change the id, including different content at an equal timestamp; stale/applied skips are nonerrors with no duplicate write.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `keeps unseen newer content above proposals across permutations and compaction` fails on a later-minted proposal hiding newer branch content.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `preserves maximum recall across branches and chained proposals` fails on compaction or merge losing a newer recall.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `deduplicates deterministic suggestions and skips stale bases` fails on duplicate application or a stale proposal being written.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `keeps base10 P1at100 P2at200 below unseen C50 in every merge order and compaction` fails on a chained proposal outranking unseen content.
    - `.bkit/core/engine/ledgers/brain.test.ts` `retains exact version content generation and conflict evidence across compaction` fails on timestamp-only stale checks or disappearing provenance.

<!-- bkit:task 19 end -->

<!-- bkit:task 20 start -->

- [ ] **TASK 20:** Add settings, fade candidates and recall/rejection cleanup helpers.
  - **UPDATE:** `.bkit/core/engine/shared/settings.ts`: brain.update.ask default true and boolean validation outside ASK_POINTS.
  - **UPDATE:** `.bkit/core/engine/shared/settings.test.ts`: default/false/invalid cases.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: UTC-day recall rollup, strict-over-90-day write boundary, 180-day fade/no-current-inbound-link selection and void rejection pruning.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.test.ts`: exact boundary and concurrent recall-rename cases.
  - **DEPENDS ON:** 3, 5, 19
  - **DONE WHEN:** settings obey the default and validate type; recently recalled/currently referenced rows never fade; recall metadata rewrites only past half-window; rename rollup leaves new appends in a fresh log; rejected ids persist until inputs change and void rows can be pruned without changing brain rows. Verify that preview-only discovery leaves an old row eligible for fading, a successful selected get refreshes it, and maintenance/export reads do not keep every row alive. Existing 180/90-day arithmetic and max recall fold remain unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/settings.test.ts` `defaults brain update approval to true and validates explicit booleans` fails on unapproved inference becoming the default or invalid config being accepted.
    - `.bkit/core/engine/ledgers/brain.test.ts` `uses exact recall fade and inbound-link boundaries` fails on early fades or unnecessary recall rewrites.
    - `.bkit/core/engine/ledgers/brain.test.ts` `rolls renamed recalls without truncating new appends and prunes only void rejections` fails on a new recall or still-current rejection being lost.

<!-- bkit:task 20 end -->
<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### TASK GROUP 6: Deterministic update, approval reports and telemetry

<!-- bkit:task 21 start -->

- [ ] **TASK 21:** Wire deterministic cleanup and bounded clustered dispatch packets.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: update handler coordinating stragglers, stub check, compact, recall rollup, rejections and packet writes; pass its per-invocation --confirm-writers-stopped acknowledgement through the same maintenance checks as install/upgrade.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: shared-root update paths, unseen archived assumption sections, path clusters and report destination.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: real files and coordinated subprocess/race fixtures.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: update packets expose preview indexes and locally generated full-entry artifacts with version fingerprints. The maintenance agent opens the complete entries it reviews before proposing changes. Generating/reading maintenance packets does not record usage recalls. Preserve conflicts, terminal review targets and bounded cluster dispatch.
  - **DEPENDS ON:** 2, 3, 5, 10, 20
  - **DONE WHEN:** cleanup runs under either ask mode; stdout prints run/batches(cluster,packet)/report; each packet has findings, fades, relevant rows and unseen plan assumptions; all shared state survives worktree deletion; all writes hold the common lock from authoritative read through durable publication; bounded contention writes nothing; incompatible writers leave full sources intact.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `moves stragglers compacts recalls and emits the actual cluster dispatch plan` fails on missing rows or dispatch paths not pointing at written packets.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `serializes cleanup publication and a concurrent append preserving both changes` fails on a lost append, publication outside ownership, unbounded contention or old-source deletion without the same fresh maintenance acknowledgement and Git checks enforced by install/upgrade.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `keeps concurrent cleanup idempotent across shared worktree state` fails on duplicate rows or scratch deletion losing the common update state.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `includes unseen archived assumptions without rereading completed plan sections` fails on missing claims or repeated already-seen input sections.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `applies one identical proposal once at a coordinated subprocess barrier` fails on two processes recording the same logical application.

<!-- bkit:task 21 end -->

<!-- bkit:task 22 start -->

- [ ] **TASK 22:** Apply owner choices through validated reports and preserve an undo trail.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: apply report, approve/reject selection, ask false attended mode and unconditional headless hold.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: report machine rows/status transitions, target freshness and rejection append data.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: actual approved/rejected rows and restore commands against files.
  - **DEPENDS ON:** 2, 3, 5, 10, 21
  - **DONE WHEN:** dedicated brain undo verifies owner authorization, retained prior/apply evidence and unchanged exact current fingerprint; it sanitizes/mints metadata, narrowly reverses verified kind transitions and appends WITHDRAWN for creations; reports have unique audit paths, Suggested Changes columns and machine rows; ask true applies only approved selections, false applies all attended selections, headless applies no inference; changed target ids mark STALE and skip; each applied row records exact applied/prior fingerprints and dedicated validated undo backed by retained evidence; rejection suppression persists across people/branches until target content changes; commits include only owned cleanup/report/approved-data paths.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `applies only owner-approved report rows and remembers rejected target versions` fails on an unapproved mutation or unchanged rejection returning.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `applies attended ask-false suggestions but holds all headless inference` fails on scheduled inference landing or attended false omitting a suggestion type.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `rejects tampered selections and marks changed-target reports stale without writes` fails on invalid report data mutating the brain.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `restores verified unchanged applied versions and commits only owned paths` fails on an undo not restoring the winner or unrelated files entering the commit.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `undoes all three kind transitions and ordinary edits after compaction` fails on valid inverse restoration failing or normal append gaining reverse authority.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `withdraws creations and refuses stale forged or ambiguous undo evidence` fails on history deletion or an intervening change being overwritten.

<!-- bkit:task 22 end -->

<!-- bkit:task 23 start -->

- [ ] **TASK 23:** Complete update observability and stale-run findings.
  - **UPDATE:** `.bkit/core/engine/ledgers/brain.ts`: stale proposal and no-report/older-than-30-days findings over committed audit reports.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.ts`: seven brain-update counters after apply/headless completion with post-commit parentSha and best-effort error reporting.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: exact diagnostics, committed-report age and counter attribution.
  - **UPDATE:** `docs/observability.md`: all stderr patterns, seven counters, exits and scheduled provenance.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: update/apply/approval/rejection modes and the per-invocation maintenance acknowledgement for old-source cleanup.
  - **DEPENDS ON:** 2, 3, 5, 10, 22
  - **DONE WHEN:** malformed/oldshape/stub/recall/concurrency/counter diagnostics stay on stderr; stdout retains one structured result; seven counters use utility, shell-bus and post-commit HEAD; counter failures warn without rejecting success; check finds missing/30-day-old committed reports and stale proposals; scheduled report header includes run URL.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `emits seven attributed update counters after the owned commit` fails on missing names, incorrect parentSha/source or duplicate application counters.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `reports stale committed updates and stale proposals with fixes` fails on an uncommitted file hiding schedule staleness or missing recovery guidance.
    - `.bkit/core/engine/commands/workflow/brain.integration.test.ts` `keeps degraded diagnostics off stdout and counter failures best effort` fails on unparsable stdout or telemetry failure rejecting successful cleanup.

<!-- bkit:task 23 end -->
<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### TASK GROUP 7: Unified inference, optional schedule and qmd

<!-- bkit:task 24 start -->

- [ ] **TASK 24:** Replace four updater agents with one packet-driven procedure.
  - **CREATE:** `.bkit/core/prompts/bkit-utility-update-brain.md`: per-kind checks plus link upgrades, successor repairs, contradictions, repeats/assumptions, summaries/fades; rejected-id filtering and typed proposal output.
  - **CREATE:** `.bkit/core/.bkit/brain.md`: procedure following engine packet paths, attended/headless modes, owner choices, undo and owned-path commits.
  - **DELETE:** `.bkit/core/prompts/bkit-utility-update-knowledge.md`: replace its responsibilities with the unified pass.
  - **DELETE:** `.bkit/core/prompts/bkit-utility-update-decisions.md`: retain its checks in the unified pass.
  - **DELETE:** `.bkit/core/prompts/bkit-utility-update-deferrals.md`: retain close/triage checks in the unified pass.
  - **DELETE:** `.bkit/core/prompts/bkit-utility-update-failures.md`: retain correction/closure checks in the unified pass.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: tool/model/effort rows and callers for the replacement agent.
  - **UPDATE:** `.bkit/core/.agents/docs.md`: phase-indexed procedure row.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: remove obsolete writer names and authorize the unified updater for the intended kinds.
  - **UPDATE:** `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`: inference coverage, procedure/dispatch and retired-agent contracts.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-brain.md`: review each entry's own summary against its full content on every maintenance pass. Fetch full targeted/supporting entries from indexed packet artifacts before judging them. Propose vague/inaccurate/stale-summary corrections through existing approvals, separately from rebuilding cluster kind: summary rows; never claim that presence or first-sentence fill proves quality.
  - **UPDATE:** `.bkit/core/.bkit/brain.md`: document per-entry summary review and approval-controlled repair alongside the updater's cluster-summary work.
  - **DEPENDS ON:** 23
  - **DONE WHEN:** every old per-kind responsibility and design inference type is assigned; one packet is dispatched per batch; >120,000-token dispatch halves that cluster’s next batch; the unified writer has Bash and all required host pins; old agents/callers disappear after regeneration; reports/approvals/undo use the engine’s exact data contracts; no inference runs inside a phase workflow. Use authored scenarios for a creation, a changed condition and a legacy vague summary; assert the resulting summary retains the governing condition and matches the full entry. Unit audits verify guidance coverage; Task 27 records actual writer/updater behavior rather than treating string assertions as semantic proof.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `renders the unified brain updater with every inferred action and no retired agent` fails on a missing inference type, model/tool row or surviving obsolete caller.
    - `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `follows printed brain batches with headless approval safety and adaptive sizing` fails on reconstructed batches, headless apply permission or missing oversized-cluster feedback.

<!-- bkit:task 24 end -->

<!-- bkit:task 25 start -->

- [ ] **TASK 25:** Add the opt-in scheduled brain-update job and its run contract.
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: optional Monday 03:00 UTC trigger and issue-less dispatch/job following the procedure headless with existing credential choice.
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: keep the adopted template synchronized under the owner-settled design change.
  - **CREATE:** `.bkit/core/engine/audits/templates/brain-schedule.test.ts`: parse the actual YAML and run bounded local push-retry/failure script fixtures against scratch Git remotes.
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: enable/copy/credential steps and headless restriction.
  - **UPDATE:** `docs/deployments.md`: schedule registry, commit/push ownership, one merge/retry and failure signals.
  - **DEPENDS ON:** 24
  - **DONE WHEN:** disabled-by-default schedule can be enabled without an issue; the job never routes through auto, commits cleanup/report only to dev, merges origin/dev then retries one rejected push, fails after a second rejection and prints the failed step/reason/run id; existing phase jobs and credential isolation still pass their audits; a bounded owner-authorized disposable-repository execution records actual CI run identity, provider boot and cleanup/report-only commit, with no inference mutation. Exercise each supported credential-selection route or report it explicitly unverified; YAML/local fixtures cannot establish that runtime claim.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/brain-schedule.test.ts` `keeps the weekly brain job opt in issue less and headless` fails on automatic enablement, mandatory issue input, inferred apply permission or a scheduled command supplying the operator's maintenance acknowledgement.
    - `.bkit/core/engine/audits/templates/brain-schedule.test.ts` `merges dev and retries a rejected push exactly once` fails on lost cleanup/report data, a second retry or force push.
    - `.bkit/core/engine/audits/templates/brain-schedule.test.ts` `fails a broken scheduled step with its CI run identity` fails on a swallowed command failure or missing run id.

<!-- bkit:task 25 end -->

<!-- bkit:task 26 start -->

- [ ] **TASK 26:** Ship the optional qmd row exporter, configuration and real-model smoke recipe.
  - **CREATE:** `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs`: call the shipped current brain list with --full for deterministic export, emit one safe markdown document per row with key/kind/status/links and prune stale derived exports.
  - **CREATE:** `.bkit/templates/.qmd/index.yml`: collection pointing at tmp/bkit-brain/qmd.
  - **CREATE:** `.bkit/templates/scripts/qmd/bkit-qmd-smoke.mjs`: standalone opt-in fixture/real-qmd query proving semantic retrieval returns a seeded brain row key.
  - **CREATE:** `.bkit/core/engine/audits/templates/qmd-export.integration.test.ts`: actual exporter against the actual local brain CLI in an isolated consumer.
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: exact tested @tobilu/qmd version, copy/install/query steps, model-download cost, Homebrew SQLite note, unconditional .qmd/ ignore and tmp export ignore.
  - **DEPENDS ON:** 24
  - **DONE WHEN:** current rows alone export with preserved metadata and traversal-safe stable document names; deleted/faded rows leave no stale document; derived files and qmd state are ignored even under git add -A; a scratch run of the pinned qmd/model smoke returns the seeded row key and leaves no binary tracked; installation remains off by default and adds no core dependency. Report a blocked optional binary/model run as incomplete, never as a core pass. Verify that qmd indexes complete canonical entries, not preview-only exports. Agent instructions use a result key to obtain the canonical preview and then selected get details before relying on the hit; model chunks never replace full relevant-entry reads. Exports record no usage recalls.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/qmd-export.integration.test.ts` `exports current brain rows through the real CLI with intact metadata` fails on missing identity/links or terminal rows entering the collection.
    - `.bkit/core/engine/audits/templates/qmd-export.integration.test.ts` `prunes stale export documents and contains unsafe row keys` fails on stale search documents or writes outside the export root.
    - `.bkit/core/engine/audits/templates/qmd-export.integration.test.ts` `keeps optional qmd state ignored without adding a core runtime dependency` fails on tracked generated artifacts or an unrequested runtime package.

<!-- bkit:task 26 end -->
<!-- bkit:group 7 end -->

<!-- bkit:group 8 start -->

### TASK GROUP 8: Fresh-consumer verification and final source artifacts

<!-- bkit:task 27 start -->

- [ ] **TASK 27:** Verify the integrated brain on fresh and pre-upgrade consumers for all five hosts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/brain.integration.test.ts`: parameterize explicit Claude/Cursor/Codex/Antigravity/opencode install/upgrade module selections with populated old data and all nine brain verbs.
  - **READ:** `.bkit/core/engine/render/hosts.test.ts`: preserve provider model/tool transform behavior.
  - **DEPENDS ON:** 2, 25, 26
  - **DONE WHEN:** real CLI scratch consumers retain source facts, pass repeated upgrade/check, generate callable host context/procedure/unified-updater payload and remove obsolete agents; graph, context, search and attended/headless update produce their observable ground-truth file changes and diagnostics; no command can succeed because its binary never started. Run bounded agent acceptance scenarios on each supported host: direct coding, no-shell reviewer/worker handoff, resume, no-plan conversion, later task-group execution and remediation. Save tool/action traces and existing context manifests proving summary selection precedes full relevant-entry reading and the first edit; include a hidden detail condition, vague summary, changed version and pending/missing key. Report unavailable host runs as unverified; rendered text alone is not behavior evidence. Run writer and updater scenarios from Task 24 with full-entry ground truth. Check summary accuracy on creation and changed content, preservation of qualifications, and approval-controlled repair of an existing weak summary. Do not substitute a keyword/string lint for semantic review.
  - **TEST FIRST:** n/a — final characterization/verification of behavior already implemented in earlier groups; retain the actual composed five-host test as verification without forcing a new red.

<!-- bkit:task 27 end -->

<!-- bkit:task 28 start -->

- [ ] **TASK 28:** Finish documentation, generated mirrors, compiled output and dogfood evidence.
  - **UPDATE:** `docs/architecture.md`: verify final topology and all new artifact locations.
  - **UPDATE:** `docs/technology.md`: Node-only core and optional pinned qmd details.
  - **UPDATE:** `docs/testing.md`: test-file inventory and optional model smoke instructions.
  - **UPDATE:** `docs/observability.md`: verify every diagnostic/counter against final code.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: all workflow caller edits indexed.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: all unified/retired prompt rows consistent.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerate command specs from the actual registry.
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: optional schedule/qmd installation current.
  - **UPDATE:** `.bkit/core/.agents/docs.md`: final one-home doc index.
  - **DEPENDS ON:** 27
  - **DONE WHEN:** every Documentation Updates row is reflected in canonical sources and regenerated mirrors; pnpm build produces matching committed dist; instructions/CLI sync and source upgrade regenerate five-host payload without hand edits; affected Static/Unit/Integration checks pass; a built node dist/cli.js run on a fresh scratch consumer verifies the actual on-disk migration/brain footprint and leaves no generated binary tracked; task logs record tiers run and any optional smoke limitation.
  - **TEST FIRST:** n/a — documentation, generated mirrors/compiled artifacts and verification of the behavior tests already owned by Tasks 1–27; no new behavior.

<!-- bkit:task 28 end -->
<!-- bkit:group 8 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every created file has a NEW Reuse Inventory row and its named reason.
- [ ] **Extensions landed:** reusable codec, compactor, context scan, command, install and reader paths were extended as planned.
- [ ] **No gate weakened:** behavior failures were fixed in implementation rather than by relaxing a guard.
- [ ] **Red before code:** every behavioral TEST FIRST case has a proven red or updated-test record before its task logic changed.
- [ ] **Tests unchanged:** proven tests still assert the expected observable outcome.
- [ ] **Unproven tests:** only an owner-approved TEST EXCEPTION can clear an unproven behavior test.
- [ ] **Gate 2 — Verified:** all implementation conditions above are checked.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Coverage matches:** each Derived Test Matrix behavior has its owning task’s tests and DONE WHEN evidence.
- [ ] **Existing/new tests:** affected existing tests are fixed and every named new case passes.
- [ ] **Observability:** degraded-state outputs and report provenance match the documentation.
- [ ] **Docs updated:** every Documentation Updates row is done.
- [ ] **Docs index accurate:** canonical and generated indexes name the current doc homes.
- [ ] **Gate 3 — Verified:** all conditions above are checked.

## Verification Plan

### Automated Tests

- [ ] **Static:** affected type/lint/format/prose/table checks, generated instruction/CLI parity, old-path audit and `bkit check` pass. TypeScript test files remain excluded from production compilation as the existing tsconfig requires.
- [ ] **Unit:** run affected telemetry, brain, migrate, compact, settings, branches, stats/analysis and source/template audits. Real-Git fixtures use isolated repositories and clean all GIT_* environment leaks through the shared setup.
- [ ] **Integration:** run the new wired brain and qmd-export files, affected install/upgrade/harvest suites and `pnpm test:integration`; source rows, full render outputs and actual filesystem effects are ground truth.
- [ ] **Full Local Gate Suite:** the declared `bkit:gate:static-unit-integration` and `bkit check` pass through the workflow’s normal gate/hook path after the focused checks; do not add a second ad-hoc pre-push suite.
- [ ] **Build/dogfood:** `pnpm build`, then `node dist/cli.js` with explicit install modules and brain verbs on a fresh scratch consumer; inspect brain/stub/attribute/mirror/report bytes and rerun upgrade for idempotence.
- [ ] **Optional @live model smoke:** after explicitly installing the pinned qmd template in a scratch consumer, run its smoke recipe against the real local model and assert the seeded row key, not merely process success. A missing tool/download is reported as not run or blocked.
- [ ] **Synchronization:** refresh affected render snapshots and README SVGs from sources; generated baseline updates are not used as TEST FIRST reds. No UI E2E or fresh-DB migration tier applies.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Automated Tests items have actual tier/command output or a concrete recorded limitation; an unavailable optional model smoke is not called a pass.

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** Unticked boxes add no merge gate.

- [ ] Upgrade an old consumer with an in-flight branch, read context for a real file, append a terminal premise and compare append/check dependents.
- [ ] Compare complete preview/handoff/detail costs against both recorded baselines, inspect dropped-key notices, and confirm full relevant entries are read before edits on the recorded host traces.
- [ ] Review an OPEN update report, approve one row and reject one, then verify repeat suppression and the recorded undo command.
- [ ] Inspect Task 25's authorized disposable-repository schedule evidence: actual provider boot, CI run URL and cleanup/report-only commit; untested credential routes remain explicitly unverified.
- [ ] Install qmd only if wanted, run the semantic smoke, and inspect Git status to confirm all exported/index/model files are ignored.
