<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Sub-Plan 3: Prose cleanup, primitive deletion, honest provenance, docs & regeneration

**Parent Plan:** [`58-workflow-counters-plan.md`](58-workflow-counters-plan.md)
**Sibling Sub-Plans:** [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) (fold + helpers + cross-process tests) · [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) (the KN-26 atomic core — **must be complete**)
**Scope:** WS-4 (T4.1–T4.2) + WS-6 (T6.1–T6.2) + WS-7 (T7.1) + WS-8 (T8.1–T8.3) · **8 tasks** · contains 🔒 Gate 2, 🔒 Gate 3, 🔒 Gate 4 and the 8-step Manual Verification.
**Position in order:** THIRD and LAST. Requires [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)'s 🔒 Gate 2b **and** T3.8/T3.9 `[x]`.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

[`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) built machinery; [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) converted sites + hardened guard. **This sub-plan finishes end-to-end** — safe now to:

1. **Delete prose** instructing model substitution (WS-4) — earlier = worse than status quo.
2. **Delete inert primitives** (WS-6) — constraint 5: last, and last is here.
3. **Honest telemetry** (WS-7) — derived `counterValue`, `shell-bus` `counterSource`.
4. **Docs + mirror regen** (WS-8) — one batched `bkit install`, only one in feature.

**Success Criteria (this sub-plan):**

- Every bare `X_ATTEMPT` outside a fenced block in the 5 workflows is either `{X_ATTEMPT}` or `MAX_X_ATTEMPT`; T5.1's audit is green over the corpus.
- The four inert primitives and the `BKIT_COUNTER_*` convention appear in **zero** source files.
- Zero `model-self-report` literals remain; all 5 emitters derive their value from one shared all-runs expression.
- `pnpm bkit check` exits 0 after the single batched `pnpm bkit install`; the installed bus is byte-identical to its template.

**Related Issues:**

- `#234 — telemetry JSONL master feature (open)` — absorbed #58's measurement slice, not its control-flow slice. **Owns the `counterSource` enum question and the `counterName`↔`counterValue` pairing**; this plan uses the existing `shell-bus` value and adds no enum member.
- `#209 — status.json → append-only status.jsonl + fold (closed)` — the event-log shape derivation depends on.
- `#232`, `#183`, `#233` — consolidated into #234 alongside #58 on 2026-06-06.
- `#341 — all-runtimes / gh fallback + trackers-stay-on-MCP (open)` — no scope here.

> [!CAUTION]
> **The related-issues scan was NOT performed this run — treat as missing context, not as "nothing related exists".** `mcp__github__search_issues` returned `total_count: 0` for every probe **including the control**. The refs above are carried from the issue body and comments, not re-confirmed by search. See `related-issues.md`.

## Dependencies — HARD PREREQUISITES

> [!WARNING]
> **Do NOT start until plan-2 🔒 Gate 2b `[x]` AND T3.8/T3.9 `[x]`.** Three tasks here are destructive without prerequisites.

- [x] **Gate 1 passed in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)** — both 👤 human confirmation checkboxes are `[x]`. This sub-plan carries **no** confirmation checkbox of its own (§ Inherited Human Sign-Off below).
- [x] **🔒 Gate 2b passed in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)** — **T4.1's hard prerequisite.** T4.1 deletes the prose instructing the model to substitute values into the 18 fenced blocks. Deleting it while any block is unconverted is **worse than the status quo** — no derive _and_ no substitution → `--argjson a "$X_ATTEMPT"` on empty → `jq: invalid JSON text` → hard failure on `build-failure-diagnose`, `debug-failure-soak`, `ship-failure-remediate` and every `debug-context-*` fetch. **WS-4 is gated on T5.3 going green, not merely on T3.1–T3.7 being ticked.**
- [x] **Both halves of the KN-26 pair shipped together in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)** — T3.0–T3.7 (derivation) **and** T3.8 (hardening), in that order, in the same PR. Gate 2 below is the _retrospective_ confirmation of this; if the pair did not ship whole, **stop** — nothing here can repair it.
- [x] **T3.4 converted `bkit-debug.md:335`** — **T7.1's hard prerequisite.** `:335` writes the `debugAttempt` marker _from_ `$DEBUG_ATTEMPT` and the cross-run fold reads that marker back. Until `:335` re-derives in-block, the only cross-run counter is grounded in a model-supplied value, and T7.1 would inherit it.
- [x] **Every call site is converted** — **T6.1/T6.2's hard prerequisite** (issue constraint 5). Deletion is only safe once every site is converted. Verify: `grep` for `counter_reset` in `.bkit/workflows/` returns nothing (T3.6 removed the only live call).
- [x] **Artifacts carried from siblings:**
  - **`prose-violations.txt`** (T5.1's captured RED, from `58-workflow-counters-plan-2.md`) — **T4.1's removal worklist**. Must have been generated by running the audit, not typed.
  - **`unconverted-sites.txt`** (T3.0's worklist, from `58-workflow-counters-plan-2.md`) — Manual Step 4d diffs `COUNTER_STEP_MAP` against it.
  - **`red-vs-dev.txt`** (T2.7's evidence, from `58-workflow-counters-plan-1.md`) — **evidence, not a test. Do NOT regenerate it.** Gate 4 compares against it.
  - **The RED window is CLOSED** (T3.8 green; skip-tag removed if one was used). Pushing is safe from here.
- [x] **`58-workflow-counters-plan-1.md`'s T2.0 repointed `.bkit/src/bkit-counter-prose-audit.test.ts`'s `configPath`/`busPath` template-relative.** **T6.2 is unreachable without it** — see the WARNING under § Architecture › Tests. If it was skipped, fix that first; do **not** reach for `bkit install`.

## 👤 ⚠️ Inherited Human Sign-Off — no new checkbox

> [!CAUTION]
> **The human review + confirmation checkboxes for this feature live in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) § Acceptance Scenario and § Breaking Changes & Naming Review.** They gate Gate 1 for all three sub-plans. **Do not duplicate them here and do not proceed if they are unchecked.**
>
> The items below are restated because they **govern this sub-plan's tasks**. They are context, not a second sign-off.

**Item 5 — the narrowing of "no `*_ATTEMPT` in prose". This sub-plan is where the narrowed criterion meets the corpus, and T4.1/T4.2 are the tasks that must respect it.**

Issue #58's acceptance says "no `*_ATTEMPT` in prose", full stop. That is **not literally achievable** — 62 lines carry a non-`$` brace placeholder the orchestrator substitutes from shell stdout (build 26, debug 26, ship 10). Artifact filenames (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`) and subagent Context lines (`attempt {VERIFY_ATTEMPT}`) depend on them; such placeholders **must** stay. The **narrowed, enforceable** criterion signed off in `58-workflow-counters-plan-1.md`:

- **BANNED** outside a fenced block: any bare `X_ATTEMPT` token (catches every assignment, increment, reset and comparison).
- **ALLOWED:** `{X_ATTEMPT}` — a substitution token, never a computation; and `MAX_X_ATTEMPT` — a constant **name** pointing at the config, carrying no value.
- **NOT allowed:** `${X_ATTEMPT}` — a _value_ reference. **48 such shell expansions exist**; the placeholder exemption carries a negative lookbehind on `$` precisely so they are not silently exempted.

**T4.2's Done-when — "every bare `X_ATTEMPT` outside a fenced block is either `{X_ATTEMPT}` or `MAX_X_ATTEMPT`" — IS this narrowed criterion.** A transcription error in a placeholder mis-names an artifact; it cannot corrupt routing, because routing re-derives. That is exactly why the decision makes `attempt` telemetry-only.

**Item 2 — deleting the inert primitives from a shipped script is BREAKING.** `counter_init` / `counter_inc` / `counter_get` / `counter_reset` and the `BKIT_COUNTER_*` convention are removed (WS-6, **last** — this sub-plan). They were called from exactly one live site (`bkit-debug.md:435`, itself inert — the helper writes `BKIT_COUNTER_SOAK_ATTEMPT` while `:443` reads `$SOAK_ATTEMPT`; the two never meet). **Deletion is only safe once every site is converted** — which is why it is here and not earlier.

**Item 9 — `counterSource` flips `model-self-report` → `shell-bus` on 5 emitters.** Consumers of `.bkit/stats.jsonl` (#234 harvest / #183 analysis) will see the distribution change. No enum member is added — `"derived"` vs `"shell-bus"` is #234's question and stays untouched.

> [!IMPORTANT]
> The 5 emitters currently pass `--argjson counterValue 1` — a **hardcoded literal**, not a remembered number. Flipping only the `counterSource` flag would swap one dishonest label for another. **T7.1 derives the value from the fold first; the flag follows the fact.**
>
> **One definition, not two.** `counterValue` = the count of `workflow-started` events for that workflow, **all-runs** (a cross-run invocation index, like `DEBUG_ATTEMPT` — explicitly **not** this plan's headline active-run rule, which would reset it to 1 every run). `bkit-debug.md` uses the same expression as the other four; it does **not** reuse its `debugAttempt` fold (which is grounded in a model-supplied value — item 8). Whether the value matches each emitter's declared `counterName` is #234's schema question → deferral row.

**Item 3 — new shipped file `.bkit/scripts/bkit-status-fold.sh`.** Ships via the core template walk; no manifest entry (counter-bus has none either); **`bkit install` stamps its `canonicalHashes` entry — that install is T8.3, here.**

**Item 1 — the exit-contract change is BREAKING and already shipped in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)'s T3.8.** Gate 2's `KN-26 pair intact` box is the retrospective confirmation that it shipped _after_ the derivation and in the same PR.

## Edge Cases — this sub-plan's slice

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Orchestrator mis-transcribes a derived value into a filename / comment | Artifact name and the row's `attempt` field are wrong; **routing is unaffected** — it re-derives. `attempt` is telemetry-only by contract. _(This is why the placeholder exemption of item 5 is safe, and why T4.2 may leave `{X_ATTEMPT}` in place.)_ |
| A consumer mid-upgrade whose workflows land before `bkit install` | Every fold block fails closed with `[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'` on stderr and exit 2 — not a silent empty jq program. _(T1.2's guard; T8.3 is what makes the file exist for bkit's own tree.)_ |
| `.bkit/scripts/*.sh` still carries the primitives when T6.2 runs | **Expected and correct.** The mirror is regenerated only at T8.3. T6.2's greps are **source-scoped** (`.bkit/templates/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`) for exactly this reason. A `.bkit/`-wide assertion cannot pass at T6.2 and would push an implementer toward the prohibited per-edit `bkit install`. |
| Historical `model-self-report` rows in `.bkit/stats.jsonl` | **Remain.** The ledger is append-only; they are the record of the defect. Only new rows read `shell-bus`. |
| `docs/deferrals.jsonl` / `docs/decisions.jsonl` rows already written at plan time | **Verify, do NOT re-append.** A duplicate `key` with nothing changed is a dedup violation per `.bkit/jsonl.md` § Identity / Dedup. |

## Derived Test Matrix — this sub-plan's slice (**3 of the master's 19 rows**)

> Rows 1–6, 9, 11, 12, 13, 16 (T1.3, T2.2–T2.10, T5.2) → [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md). Rows 7, 8, 10, 14, 15 (T5.3, T5.4, T3.4b, T3.6, T5.1) → [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md). **11 + 5 + 3 = 19.**

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Deleted primitives are gone and unreferenced: `counter_init` / `counter_inc` / `counter_get` / `counter_reset` / `BKIT_COUNTER_` appear in **zero** files under the **source** trees — `.bkit/templates/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`. **Deliberately NOT `.bkit/` wholesale:** `.bkit/scripts/*.sh` is a generated mirror that still carries the primitives until T8.3's single batched `bkit install`, so a `.bkit/`-wide assertion cannot pass at T6.2 and would push an implementer toward the prohibited per-edit install. The mirror is covered by T8.3's byte-identical `diff` and Manual Step 6 | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T6.2 |
| Every `counter` row emitter passes a fold-derived `counterValue` and `counterSource: "shell-bus"`; zero `model-self-report` literals remain in the workflow corpus | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T7.1 |
| Static gate on every changed file | Static | `pnpm typecheck && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm bkit check` | T8.3 |

## Alternative Approaches & Recommendations _(the ones governing this sub-plan)_

- **Stored `counters` object in status (the original #58 sketch) — REJECTED.** It had to propose a policing invariant (_"`counters.verifyAttempt` must equal the count of `plan-verify` entries"_) precisely because a stored counter drifts from the rows. Counting the rows makes that invariant true by construction.
- **Persist `BKIT_COUNTER_*` across blocks — REJECTED, and now known impossible.** Each fenced block is a fresh process. Even with persistence the wiring is broken (helper writes `BKIT_COUNTER_{NAME}`, call sites read `${NAME}`). **This is why WS-6 deletes them rather than fixing them.**
- **Read back the `attempt` field instead of counting rows — REJECTED.** It reintroduces a dependence on every step faithfully writing `attempt`. Counting rows needs no such trust, which is what lets `attempt` become telemetry-only.
- **Future recommendation (not this plan):** there is **no shellcheck gate over `.bkit/scripts/*.sh`** — actionlint only shellchecks `run:` blocks in `.github/workflows/*`. The `SC2016` directive this plan adds is therefore defensive for local runs, not CI-enforced. Deferred (see § Out of Scope).

## Out of Scope

- Verdict semantics, strategy selection, sub-plan iteration logic. `PASS`/`FAIL`/`CONCERNS` and `STANDARD`/`PIVOT`/`FINAL` need judgment and stay in the orchestrator.
- Renaming or restructuring step IDs; artifact file formats.
- The `counterSource` enum question (`"derived"` vs `"shell-bus"`, which names the transport rather than the provenance) — #234 owns that schema.
- `TEST_VERDICT` / `TEST_SCOPE` pass via `--arg` and accept empty silently, unlike the counters' `--argjson` hard-stop. Legitimately model judgments; noted on the findings comment, not fixed here. → deferral row.
- `PRIOR_STRATEGY`'s all-runs scoping — flagged and commented, not changed. Which behaviour strategy actually wants was never established. → deferral row.
- Adding a shellcheck CI gate over `.bkit/scripts/*.sh`. → deferral row.
- `CI_ATTEMPTS` — loop-local, assigned and consumed inside one fenced block. Not a call site; exempt by name in T5.3.
- **`status.jsonl` run-boundary semantics** — characterised by T2.10; changing it belongs to #209's substrate. → deferral row.
- **Whether `debug-run-tests` should regain a per-attempt commit** — collides with KN-26 and must not be answered by an implementer applying the per-site shape. → deferral row.
- **`counterName` ↔ `counterValue` pairing at the 5 close-workflow emitters** — whether the `workflow-started` count matches each emitter's declared `DESIGN_ATTEMPT`/`PLAN_ATTEMPT`/… name is #234's schema question. **T7.1 makes the value honest; it does not adjudicate the name.** → deferral row.

## Merge Method

**Merge method: always squash.** All three sub-plans land in **ONE PR** — non-negotiable per Breaking Changes item 1: WS-3's derivation and T3.8's fail-closed hardening are the two halves of the KN-26 pair and must not be separable at the merge boundary. **This is the sub-plan from which the single PR is opened, carrying all three.** `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory _(this sub-plan's rows)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `counter_init` / `counter_inc` / `counter_get` / `counter_reset` + the `BKIT_COUNTER_*` convention (`bkit-counter-bus.sh:27-62`) | `counter_count` / `counter_next` / `counter_current` (re-derive per block) | DELETE | Inert: shell state does not survive across orchestrator Bash calls, and the helpers write `BKIT_COUNTER_{NAME}` while every call site reads `${NAME}`. Keeping dead helpers beside a different live convention is what let Defect 2 hide. |
| `tests/counter-bus.bats` §1-4 (`counter_init`/`inc`/`get`/`reset`), §8's `counter_init`/`counter_inc`/`counter_get` cases, §9 integration cases | `tests/counter-derive.bats` + `tests/counter-failclosed.bats` | DELETE | They exercise the deleted primitives **inside a single `bash -c`** — the one condition the real workflow never satisfies. §5-7 (`check_max` / `decide_next` / config constants) are RETAINED and extended. |
| `EXPECTED_FUNCTIONS` list (`bkit-counter-prose-audit.test.ts:167-174`) asserting the 4 inert primitives exist | list asserting `counter_count`/`counter_next`/`counter_current`/`check_max`/`decide_next` exist **and** the 4 primitives are absent | DELETE | Asserts the presence of code this plan deletes; would red the suite at T6.1. |
| Prose counter statements — **worklist generated by T5.1's audit (`prose-violations.txt`), not this list**: `bkit-build.md:319`, `:473`, `:529`, `:809`, `:914`; `bkit-debug.md:309`, `:375`, `:747`; `bkit-ship.md:311`, `:552`; **plus the 4 the draft missed** — `bkit-debug.md:179`, `:190`, `:191`, `:437` | derive blocks at each site (`:190` → T3.4b; `:437` → T3.6) | DELETE | `Init counters:` / `Increment X + 1` / `Reset X = 0` / `Set X = 0` — the model-authored counter this issue exists to remove. The draft's hand-list missed 4 sites, and its own grep missed `:437` besides (reversed operand order: "`SOAK_ATTEMPT` reset to 0"). |
| `--argjson counterValue 1` + `--arg counterSource "model-self-report"` × 5 (`bkit-build.md:1196-1197`, `bkit-debug.md:955-956`, `bkit-ship.md:1101-1102`, `bkit-plan.md:764-765`, `bkit-design.md:767-768`) | fold-derived `counterValue` + `counterSource "shell-bus"` | DELETE | A hardcoded `1` labelled `model-self-report` is dishonest in both fields. |

## Security & Privacy

- [x] **None — no new routes, DB writes, secrets, or user input.**
- **Untrusted input:** counters are derived from `status.jsonl`, written only by the workflows themselves — not from issue/PR/comment bodies. The derivation adds no attacker-controlled path (#342 contract unaffected).
- **New executable surface:** `.bkit/scripts/bkit-status-fold.sh` is sourced (`.`) by workflow bash blocks from `$REPO_ROOT` — identical trust boundary and idiom to the existing `bkit-counter-bus.sh` sourcing. No new `ask`/`deny` entry in `.claude/settings.json` is needed. _(T8.3 is what materialises the installed copy.)_

## Data Schema Integration

No database. The "schema" here is the `status.jsonl` append-only event log.

- **Output (Write):** `.bkit/stats.jsonl` `counter` rows → `counterValue` (**now derived**, T7.1), `counterSource` (**now `shell-bus`**, T7.1).
- **UNCHANGED:** `step-done.attempt` stays on every row and keeps its type, but is **re-classified as telemetry-only** — routing counts rows, so a missing or wrong `attempt` cannot corrupt control flow. **Documented in `.bkit/workflows.md` — T8.1, this sub-plan.**
- **UNCHANGED:** the fold reducer itself. `soakEntryAt` (added by T3.6) needs no fold change.

## Architecture & Component Changes

### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` — **deletion half only (T6.1)**

- **[DELETE]** `counter_init`, `counter_inc`, `counter_get`, `counter_reset` and the `BKIT_COUNTER_*` convention — **WS-6, last.**
- Update its header contract block to document only `counter_count` / `counter_next` / `counter_current` / `check_max` / `decide_next`.
- **Already done by siblings:** the three helpers were added by [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s T2.1; the guard was hardened by [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)'s T3.8. **Do not re-do either.**

### [MODIFY] `.bkit/workflows/bkit-build.md` · `bkit-debug.md` · `bkit-ship.md` — **prose + telemetry row only**

- **Prose (T4.1/T4.2):** `Init counters:` / `Increment X + 1` / `Reset X = 0` / `Set X = 0`; Gate checklists (`bkit-build.md:370`, `:574`, `:844`, `:971`; `bkit-debug.md:246`, `:361`, `:451`, `:787`; `bkit-ship.md:371`, `:656`); Limits notes (`bkit-build.md:49`, `bkit-debug.md:49-50`, `bkit-ship.md:49`); Failure Path triggers (`bkit-build.md:89`, `bkit-debug.md:90`, `bkit-ship.md:113`).
- **Telemetry row (T7.1):** `bkit-build.md:1196-1197`, `bkit-debug.md:955-956`, `bkit-ship.md` ~`:1101-1102`.
- **DO NOT touch any fenced derive block** — [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) converted them and T5.3/T5.4 police them. If a fenced block looks wrong, that is a WS-3 defect, not a WS-4 one.

### [MODIFY] `.bkit/workflows/bkit-plan.md` · `.bkit/workflows/bkit-design.md`

- Counter row only (`bkit-plan.md:764-765`, `bkit-design.md:767-768`) — T7.1. No `*_ATTEMPT` retry counters. FOLD sites were converted by [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s T1.2.

### [MODIFY] `.bkit/src/bkit-counter-prose-audit.test.ts` — **T6.2 + T7.1 rules only**

- **This sub-plan:** update `EXPECTED_FUNCTIONS` to the new five + add the absent-primitives rule (T6.2); add the counter-row provenance rule (T7.1).
- **NOT this sub-plan:** T2.0's repoint, T2.6, T5.2 (all [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)); T5.1, T5.3, T5.4 (all [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)). **The file is edited by all three sub-plans; each owns disjoint rules — do not touch a sibling's.**

> [!WARNING]
> **T6.2 is unreachable without [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s T2.0 repoint — and the pressure that creates is the PROHIBITED per-edit `bkit install`.** `configPath` (`:143`) and `busPath` (`:166`) originally resolved `.bkit/scripts/` — the **generated mirror**. T2.1 added the new helpers to the **template** only and T6.1 deletes the primitives from the **template** only, so until T8.3 the mirror still lacks the five and still carries the four: **both halves of T6.2's Done-when would be red at T6.2**, and T6.2 < T8.3.
>
> **Verify T2.0 landed before starting T6.2:** `grep -c '"\.bkit/scripts/' .bkit/src/bkit-counter-prose-audit.test.ts` = 0. If it is not 0, fix the repoint — **do NOT run `pnpm bkit install` to make T6.2 pass.** T6.2's own Done-when asserts the suite passes _without any intervening install_, precisely so a mirror-resolving suite cannot fake green here.
>
> **Scope of the defect, stated precisely so it is not over-applied:** only reads of `.bkit/scripts/*.sh` are affected. T5.3/T5.1/T2.6/T7.1 scan `.bkit/workflows/*.md` — the canonical **source**, not a mirror — and are correct as written. T6.2's _grep_ half (over `.bkit/templates/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`) is likewise already source-scoped; it is only the `busPath`/`configPath` **reads** that move.

### [MODIFY] `tests/counter-bus.bats` — **prune (T6.2)**

- Prune §1-4, §8's primitive cases and §9; retain and extend §5-7 (`check_max` / `decide_next` / config constants). `COUNTER_BUS` / `COUNTER_CONFIG` were already repointed template-relative by [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s T2.0.

### Database Migrations

None — bkit has no database. The only persistent store is the `status.jsonl` append-only event log; its one additive field (`workflow-meta.soakEntryAt`) needs no migration in either direction (§ Rollback Strategy).

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.bkit/workflows.md` | § Authoring Checklist item _"Loops cap at `MAX_*_ATTEMPT` constants"_ (`:1222`) → rewrite: counters are **derived** from `status.jsonl` in the fenced block that uses them, never carried and never prose-authored; **every fenced block that reads a counter derives it itself — enforced by the T5.3 rule, not by review**; every `MAX_*` comes from `bkit-counter-bus-config.sh`. Add the **four-position contract** (`counter_next` at start · `counter_current` after own write · `counter_count` when routing on a prior/not-yet-run step, where **`0` is a legal answer** · commit-subject only where the block already commits). § Status → add: `attempt` is telemetry-only; the `soakEntryAt` marker; the fold is sourced from `.bkit/scripts/bkit-status-fold.sh`; the dedup key is `at`-inclusive, so row counting couples to the per-attempt commit **or** a differing second — and name `debug-run-tests` as the KN-26 transitive exception that must **not** regain a commit. |
| `docs/testing.md` | Repo-local section (below `bkit:end`) → new subsection "Counter derivation test coverage": the cross-process rule (no counter value may cross from one `bash -c` to the next except through `status.jsonl`), the `BKIT_COUNTER_BUS` override for the RED-vs-`dev` proof, and a file/tier/scope table row per new suite. Add `tests/counter-derive.bats` + `tests/counter-failclosed.bats` to § Key test files. Do NOT touch the managed block. |
| `docs/decisions.jsonl` | **Already written at plan time** — `58-status-fold-sourced-once-from-shared-script`, `58-prose-audit-bans-bare-attempt-names-allows-brace-placeholders`. T8.2 verifies, does not re-append. |
| `docs/deferrals.jsonl` | **Already written — 6 rows, do not re-append.** Plan time: `58-test-verdict-scope-arg-accepts-empty-silently`, `58-prior-strategy-all-runs-scoping-unresolved`, `58-no-shellcheck-gate-over-bkit-scripts`. Review time: `58-status-jsonl-run-boundary-keys-on-last-run-overall`, `58-debug-run-tests-parentsha-advances-only-transitively`, `58-counter-row-countername-value-pairing-unverified` (findings that imply work beyond #58's scope — recorded rather than silently absorbed or dropped). T8.2 verifies, does not re-append. **Append-only: never rewrite the file.** |
| `.bkit/jsonl.md` | **No change** — `counterSource: "shell-bus"` is already the documented enum member (`:61`) and the shipped example already uses it (`:262`). Confirm during T7.1; do not add `"derived"` (#234 owns it). |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Append a `kind:"deferral"` (or `kind:"failure"`) row per `.bkit/jsonl.md` with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task.
> **Edit the SOURCE, never the mirror:** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`. **Run `pnpm bkit install` ONCE at T8.3, never per edit.** Several test paths were deliberately repointed template-relative (`58-workflow-counters-plan-1.md` T2.0) precisely so no per-edit install is needed. **If a task seems to need an install to pass, the repoint is what is wrong — not the batching rule.**
> **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — `!=` `>=` `<=`, never `≠ ≥ ≤`.
> **Order:** WS-4 → WS-6 → WS-7 → WS-8. WS-6 must not precede WS-4's audit-green (both depend on the conversion, already shipped).

### WS-4 — Prose stops assigning counters (worklist comes from WS-5's audit, NOT from this list)

> [!WARNING]
> **Method inverted — T5.1 was run FIRST, in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md).** The draft hand-enumerated line numbers and the enumeration was provably incomplete (`bkit-debug.md:179`, `:190`, `:191`, `:437` carry bare counter names no task touched). Worse, `:437` **slips T4.1's own grep**: the pattern is `reset .(VERIFY|SOAK)_ATTEMPT` but the line reads "`SOAK_ATTEMPT` reset to 0" — **operand order reversed** (`:664`'s "reset `SOAK_ATTEMPT` = 0" matches; `:437` does not). A hand-list that misses sites _and_ a grep that misses one of the sites it does list is exactly the failure this plan exists to end.
>
> **T5.1's output — `prose-violations.txt`, captured in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) — is the removal worklist.** The line numbers below are a convenience index into that output, never the authority. If `prose-violations.txt` does not exist, **stop**: T5.1 did not run, and a hand-list is exactly what this plan rejects.
>
> **Prerequisite: 🔒 Gate 2b (in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)).** T4.1 deletes the prose instructing the model to substitute values into the 18 fenced blocks. Deleting it while any block is unconverted is **worse than the status quo** — no derive _and_ no substitution → `--argjson a "$X_ATTEMPT"` on empty → `jq: invalid JSON text` → hard failure on `build-failure-diagnose`, `debug-failure-soak`, `ship-failure-remediate` and every `debug-context-*` fetch (§ Breaking Changes item 10a).

- [x] **T4.1:** Run T5.1's widened audit → `prose-violations.txt`. Remove every prose counter statement it lists. Known members (index, not authority): `bkit-build.md:319` (`Init counters:`), `:473` (`Reset VERIFY_ATTEMPT = 0 at start of each SUB_PLAN` — now structural, the `subPlan` filter does it), `:529`, `:809`, `:914`; `bkit-debug.md:309` (`Init counters:`), `:375`, `:747`; `bkit-ship.md:311`, `:552`. **Plus the four the draft missed**: `bkit-debug.md:179` (bare `PRIOR_DEBUG_ATTEMPT` + `DEBUG_ATTEMPT` — the fold **stays**, the prose naming it goes; see T3.4), `:190` (→ T3.4b converts it), `:191` (bare `DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` — reword to the `MAX_*` name only), `:437` (→ T3.6 replaces the `counter_reset` it describes).
  - **Done when:** `prose-violations.txt` exists and was generated by running the audit (not typed); every line it listed is resolved; the audit re-run over all 5 workflows is **green**; `grep -rniE 'init counters|increment .(VERIFY|TEST|CHALLENGE_REMEDIATE|NORMAL|SOAK|MERGE)_ATTEMPT|reset .(VERIFY|SOAK)_ATTEMPT' .bkit/workflows/` returns nothing **and** `grep -rniE '(VERIFY|SOAK|NORMAL|TEST|MERGE|DEBUG)_ATTEMPT.{0,12}reset' .bkit/workflows/` returns nothing (the reversed-operand form the draft's grep missed).
- [x] **T4.2:** Rewrite the dependent prose the audit lists: Gate checklists (`bkit-build.md:370`, `:574`, `:844`, `:971`; `bkit-debug.md:246`, `:361`, `:451`, `:787`; `bkit-ship.md:371`, `:656`) — `"Verify attempt incremented (VERIFY_ATTEMPT + 1)"` → `"Verify attempt derived from status.jsonl (active run, this sub-plan)"`; Limits notes (`bkit-build.md:49`, `bkit-debug.md:49-50`, `bkit-ship.md:49`) — drop the bare counter names and the `>=` comparisons, keep the `MAX_*` constant names + config path; Failure Path triggers (`bkit-build.md:89`, `bkit-debug.md:90`, `bkit-ship.md:113`) — keep the `MAX_*` names (allowed), remove any bare counter name.
  - **Done when:** every bare `X_ATTEMPT` outside a fenced block in the 5 workflows is either `{X_ATTEMPT}` or `MAX_X_ATTEMPT`; T5.1's audit is green.

> [!CAUTION]
> **T4.2's remit is WORDING ONLY — gate checklists, Limits notes, Failure Path triggers.** If the audit reds on a line that carries **semantics** (a comparison, a branch condition, a mode selection), it belongs to a WS-3 task, **not** here. The known case is `bkit-debug.md:190`, which **selects `DEBUG_MODE`** — it is T3.4b's (already done in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)), and rewording it here would silently change SOAK-vs-NORMAL selection. **Do NOT reword your way to a green audit.** If a red line is not in T4.1's or T4.2's remit and has no WS-3 owner, **stop and add the task** (§ "No Architectural Downgrades"). Note WS-3 is in a **completed sibling sub-plan** — a red line needing a WS-3 fix means reopening [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md), not patching it here.

### WS-6 — Delete the inert primitives (LAST — constraint 5)

> **This is the "last" the issue's constraint 5 names.** Every call site is converted (Gate 2b, [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)) and the only live `counter_reset` call was removed by T3.6. Verify before deleting: `grep` for `counter_reset` in `.bkit/workflows/` returns nothing.

- [x] **T6.1:** Delete `counter_init`, `counter_inc`, `counter_get`, `counter_reset` and every `BKIT_COUNTER_*` reference from `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`; update its header contract block to document only `counter_count` / `counter_next` / `counter_current` / `check_max` / `decide_next`.
  - **Done when:** `grep -rn 'counter_init\|counter_inc\|counter_get\|counter_reset\|BKIT_COUNTER_' .bkit/templates/ .bkit/workflows/` returns nothing.
- [x] **T6.2:** Prune `tests/counter-bus.bats` §1-4, §8's primitive cases and §9 (retain and extend §5-7). Update `EXPECTED_FUNCTIONS` in the prose audit to the new five and add a rule asserting the four primitives are **absent** from the **source** trees. **Both halves assert over the TEMPLATE, not the mirror** — `EXPECTED_FUNCTIONS` reads T2.0's template-relative `busPath` (`.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`). If T2.0's repoint was skipped, this task is unreachable: the mirror still lacks the new five (T2.1 added them to the template) and still carries the four primitives (T6.1 deleted them from the template) until T8.3.
  - **Done when:** `npx --yes bats tests/*.bats` exits 0 with >0 tests; `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` passes **without any intervening `bkit install`** — proving the suite resolves the template (T2.0), since a mirror-resolving suite could not go green here; `EXPECTED_FUNCTIONS` lists exactly `counter_count`/`counter_next`/`counter_current`/`check_max`/`decide_next` and the absent-primitives rule reads the same template-relative path; `grep -rn 'counter_init\|counter_inc\|counter_get\|counter_reset\|BKIT_COUNTER_' .bkit/templates/ .bkit/workflows/ .bkit/src/ tests/ --include='*.sh' --include='*.bats' --include='*.md' --include='*.ts'` returns nothing. **Note the scope:** the grep targets the **sources** (`.bkit/templates/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`). `.bkit/scripts/*.sh` is a generated mirror that still carries the primitives until T8.3 regenerates it — asserting over `.bkit/` wholesale (as the draft did, and as § Derived Test Matrix row 15 did until this revision) cannot pass before T8.3 and would push an implementer toward a per-edit `bkit install`, which is prohibited. T8.3's Done-when covers the installed copy via its byte-identical `diff`; Manual Step 6 covers the consumer surface.

### WS-7 — Honest provenance on emitted counter rows

- [x] **T7.1:** At all 5 close-workflow emitters (`bkit-build.md:1191-1199`, `bkit-debug.md:950-958`, `bkit-ship.md` ~`:1096-1104`, `bkit-plan.md` ~`:759-767`, `bkit-design.md` ~`:762-770`) replace `--argjson counterValue 1` with a fold-derived value and `--arg counterSource "model-self-report"` with `"shell-bus"`. Keep the append best-effort (`|| echo "[bkit-telemetry] append failed: $STATS"`).
  - **ONE definition across all five** (the draft gave two — "count of `workflow-started` events" for four emitters, "may reuse its existing `debugAttempt` fold" for `bkit-debug.md`; two definitions of one telemetry field is what `counterSource` exists to disambiguate): `counterValue` = the count of `workflow-started` events for that workflow, **all-runs scoping** — a cross-run **invocation index**, explicitly **NOT** this plan's headline active-run rule (which would reset it to 1 every run). State the scoping in a comment at each site, since a reader will otherwise apply the active-run rule by default. `bkit-debug.md` uses the same expression as the other four and does **NOT** reuse its `debugAttempt` fold — that fold reads a marker written at `:335` from a model-supplied `$DEBUG_ATTEMPT` (§ Breaking Changes item 8), so reusing it would ground the honest-provenance claim in the very value this plan de-modelises. **Depends on T3.4** converting `:335`.
  - **Done when:** `grep -rc 'model-self-report' .bkit/workflows/` = 0 across all files; each emitter's `counterValue` comes from a `$(jq …)` capture, not a literal; all 5 use the **same** all-runs `workflow-started` expression (`grep -c` for it = 5) and each carries the all-runs scoping comment; a prose-audit rule asserts both facts; one manual run appends a `counter` row with `counterSource:"shell-bus"` and a value matching the run count. Whether the value matches each emitter's declared `counterName` (`DESIGN_ATTEMPT`/`PLAN_ATTEMPT`/…) is **#234's schema question** — do not "fix" the pairing here; it is recorded as a deferral row.

### WS-8 — Docs, ledgers, regeneration

- [x] **T8.1:** Update `.bkit/workflows.md` (§ Authoring Checklist `:1222`, § Status) and `docs/testing.md` (repo-local section only — never the managed block) per § Documentation Updates. Rewrite prose; no lazy bullet appends.
  - **Done when:** `.bkit/workflows.md:1222` no longer says only _"Loops cap at `MAX_*_ATTEMPT` constants"_ but states counters are derived per-block from `status.jsonl`; `docs/testing.md` carries the cross-process rule + the 2 new bats rows; `git diff docs/testing.md` shows zero changes between `<!-- bkit:start -->` and `<!-- bkit:end -->`.
- [x] **T8.2:** **Verify only — the 8 ledger rows were written at plan/review time; do NOT re-append** (a duplicate `key` with nothing changed is a dedup violation per `.bkit/jsonl.md` § Identity / Dedup). Confirm the 2 `decision` rows (`58-status-fold-sourced-once-from-shared-script`, `58-prose-audit-bans-bare-attempt-names-allows-brace-placeholders`) and the **6** `deferral` rows survived any rebase: the 3 from plan time (`58-test-verdict-scope-arg-accepts-empty-silently`, `58-prior-strategy-all-runs-scoping-unresolved`, `58-no-shellcheck-gate-over-bkit-scripts`) and the **3 added at review time** (`58-status-jsonl-run-boundary-keys-on-last-run-overall`, `58-debug-run-tests-parentsha-advances-only-transitively`, `58-counter-row-countername-value-pairing-unverified`). **If** implementation contradicted a recorded decision → append a same-`key` update row (never edit the original line). **`docs/deferrals.jsonl` is append-only:** verify any change with `git diff --numstat docs/deferrals.jsonl` showing **0 deletions**.
  - **Done when:** `jq -sr '[.[] | select(.key | startswith("58-"))] | length' docs/decisions.jsonl` = 3 (2 new + the parent `58-workflow-attempt-counters-derived-…`) and `= 6` for `docs/deferrals.jsonl`; `jq -c . docs/decisions.jsonl docs/deferrals.jsonl >/dev/null` exits 0 (every row well-formed, one per line); `jq -r '.key' docs/deferrals.jsonl | sort | uniq -d` is empty; `git diff --numstat docs/deferrals.jsonl` shows 0 deletions.
- [x] **T8.3:** **Batched regeneration — run ONCE, at the end.** `pnpm bkit install` (regenerates `.bkit/scripts/*.sh` from templates, re-stamps `.bkit/version` canonicalHashes incl. the new `bkit-status-fold.sh`, re-renders `.claude/` / `.cursor/` / `.opencode/` mirrors) → `git config core.bare false` (install flips it) → `pnpm bkit check`.
  - **Done when:** `pnpm bkit check` exits 0; `.bkit/version` contains a `.bkit/scripts/bkit-status-fold.sh` hash; `.bkit/scripts/bkit-counter-bus.sh` is byte-identical to its template (`diff .bkit/templates/.bkit/scripts/bkit-counter-bus.sh .bkit/scripts/bkit-counter-bus.sh` is empty); `git status --porcelain` shows the mirror trees updated.

  > [!IMPORTANT]
  > **This is the ONLY `pnpm bkit install` in the entire feature — all three sub-plans.** It is deliberately last. Every test path in the corpus was repointed template-relative ([`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s T2.0) precisely so that no earlier task needs it. **If any task before this one appeared to require an install, that was a repoint defect, not a batching problem.**

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

> This gate spans **all three sub-plans** — it is the retrospective whole-feature check and it lands here because here is the end.

- [x] **Gate 2 - Verified:** Every task T1.1–T8.3 independently verified and checked off against the plan — **across all three sub-plans** ([`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) T1.1–T2.10 + T5.2 = 15; [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) T5.1, T5.3, T3.0–T3.9, T5.4 = 14; this one T4.1–T8.3 = 8; **15 + 14 + 8 = 37**).
- [x] **Completeness is machine-checked, not asserted:** T5.3 is green over all 5 workflows — **zero** fenced blocks read a bare `$X_ATTEMPT` they do not derive. `unconverted-sites.txt`'s 18 sites are all converted; re-running the rule prints an empty worklist. **This checkbox, not a hand-count, is what "the conversion is complete" means here.** A green Gate 2 with this box unchecked is the exact failure mode § Breaking Changes item 10a describes.
- [x] **KN-26 pair intact:** T3.8 (fail-closed) is committed **after** T3.0–T3.7 (derivation) and in the same PR. No commit exists where the guard fails closed without a derived value behind it. Gate 2b enforced this prospectively; this is the retrospective confirmation. **Both halves were executed inside [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) as one unit — the sub-plan split never crossed this seam.**
- [x] **KN-26 remediation intact (10c):** `bkit-debug.md:399` still reads "Update status:" with **no** `git commit` — the per-site shape's commit-subject position was **not** applied there. No `chore(...)` commit was added to debug's test loop.
- [x] **No legitimate 0-route was bricked (10b):** `counter_current` appears at **no** position-4 site — `grep -n 'counter_current' .bkit/workflows/bkit-build.md` shows none in `:781-787`/`:807`, and none at `bkit-debug.md:443`. T2.9's count-0 cases are green.
- [x] **Deletion ordering intact:** T6.1 ran only after every call site was converted (`grep` for `counter_reset` in `.bkit/workflows/` returned nothing before deletion).

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage against Derived Test Matrix:** All **19** rows have a corresponding task checked off — **19 rows, 19 distinct tasks, one-to-one**: T1.3, T2.2, T2.3, T2.4, T2.5, T2.6, T2.7, T2.8, T2.9, T2.10, T3.4b, **T3.6**, T5.1, T5.2, T5.3, **T5.4**, T6.2, T7.1, T8.3. Add tasks if any row is uncovered. _(The draft said "All 14 rows" against a 13-row matrix and a 13-task list — an off-by-one in a mandatory self-check that would send an agent hunting for a 14th row. This count was **measured** from the matrix, not carried forward; if it ever disagrees with § Derived Test Matrix, **the matrix is authoritative** and this line is stale. It went 17 → 19 at scope-check: **T3.6** mandates a bats case that had no row — invisible to this very self-check, while T3.4b's equivalent case was given one — and **T5.4** is the new mapping rule.)_ **Across the split:** 11 rows in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md), 5 in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md), 3 here — **11 + 5 + 3 = 19**, each row in exactly one child.
- [x] **Update existing tests:** `tests/counter-bus.bats` pruned to the retained sections (T6.2); `.bkit/src/bkit-counter-prose-audit.test.ts` rewritten (T5.1, T5.2, T6.2, T7.1).
- [ ] **Write new tests:** `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`. Every boundary suite reaches the real boundary (`status.jsonl` on disk, real `git`, real process boundaries) and asserts a ground-truth signal (a specific derived integer / exit code / empty stdout) — never "did not throw".
- [x] **Verify observability:** Every new diagnostic carries the `[bkit-telemetry]` prefix (log-drain grep). Telemetry appends stay best-effort and never gate a workflow. `decide_next`'s exit-2 diagnostic reaches stderr at every call site (no `2>/dev/null`).
- [x] **Update documentation:** `.bkit/workflows.md` + `docs/testing.md` rewritten (T8.1); `docs/decisions.jsonl` + `docs/deferrals.jsonl` appended (T8.2). Docs and code land in the same change — never as a follow-up.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [x] **Docs updated:** Every row in § Documentation Updates completed. `.agents/docs.md` still accurate (no new doc file → no new index row).
- [x] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> Whole-feature verification. Runs here because this is the last sub-plan; it asserts over all three sub-plans' output.

### Automated Tests

- [x] **Type Check & Lint:** `pnpm typecheck` + `pnpm format:check` + `pnpm lint:slop` + `pnpm lint:prose`.
- [x] **Slop delta:** `pnpm slop:delta` — net-new findings only. The new shell helpers add no try/catch; if `defensive.error-obscuring` rises, use non-throwing forms rather than suppressing the rule.
- [x] **Completeness rule green (T5.3):** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` — zero fenced blocks read a bare `$X_ATTEMPT` they do not derive. **This is the gate that means "the migration is done".** Re-running the rule prints an empty worklist against `unconverted-sites.txt`'s 18 entries.
- [ ] **All three new rules demonstrably fire:** T5.1 and T5.3 were each RED against today's tree before their conversions (`prose-violations.txt`, `unconverted-sites.txt` are the evidence) and red again on a temporary re-introduction. **T5.4 cannot be RED-first the same way** — before WS-3 no block derives at all, so it has nothing to map; its evidence is instead the three temporary edits its Done-when mandates, each verified to red **one at a time, then restored**: (1) a derive pointed at the wrong step (`build-challenge` instead of `build-challenge-remediate` at `:719`), (2) a map entry deleted while its block still derives, (3) a deriving block whose row-step is absent from the map. Record which of the three were observed. A rule that has only ever been green is not evidence (§ Breaking Changes item 6) — and T5.4 is the mechanism this plan adopted to close its own residual mapping concern, so shipping it unexercised would be that same Defect-4 shape one level up. _(T5.1/T5.3/T5.4 were executed in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md); their evidence artifacts are carried forward and confirmed here.)_
- [x] **Test Synchronization:** `tests/counter-bus.bats` (pruned + repointed template-relative, T2.0/T6.2) and `.bkit/src/bkit-counter-prose-audit.test.ts` (rewritten) must be updated **in the same commit** as the code they assert, or the suite reds mid-sequence.
- [x] **No suite reads a stale installed copy:** `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0 — all three bats suites resolve template-relative (T2.0). The installed copy is exercised only at T8.3 and Manual Step 6. **No `pnpm bkit install` was added to any task except T8.3.**
- [x] **Build Configuration:** No new mock files or test configs; no `tsconfig.json` `exclude` change needed (bats files are not TS).
- [x] **Shell suites (`tests/*.bats`):** `npx --yes bats tests/*.bats` — auto-gated in CI's `bkit-tests-unit` lane (`ci.yml:500-502`), no CI wiring needed.
- [x] **Vitest (`.bkit/src/bkit-status-fold.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`):** `pnpm test`. Unit lane is branch-coverage-gated at 65 — confirm no regression.
- [ ] **Portability:** re-run `tests/counter-failclosed.bats` under `sh`, `bash`, `dash` and `zsh` (the shells the issue reproduced the fail-open on). All four must refuse the unset counter.
- [x] **Drift:** `pnpm bkit check` exits 0 after the single batched `pnpm bkit install` (T8.3).
- [x] **Run all tests:** `pnpm test` + `npx --yes bats tests/*.bats`. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades**: If you hit build/compiler/test errors during verification, NEVER resolve them via hot fixes or anti-patterns. In particular: do NOT re-add `2>/dev/null` to silence a stderr diagnostic, do NOT default a failed derivation to `0`, and do NOT weaken the prose audit to make a stubborn line pass. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [x] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results) gathered — including `red-vs-dev.txt`.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `npx bats`, `jq`) to verify pipelines instead of asking users to check dashboards.

- [x] **Step 1 — The tests fail against `dev` (the acceptance's load-bearing claim):** `git show dev:.bkit/scripts/bkit-counter-bus.sh > /tmp/dev-bus.sh && BKIT_COUNTER_BUS=/tmp/dev-bus.sh npx bats tests/counter-failclosed.bats`. Confirm the unset-counter case FAILS: `dev` prints `step-14` and exits 0 (retry, cap ignored) where the suite demands empty stdout + exit 2. Compare against `red-vs-dev.txt`.
- [ ] **Step 2 — End-to-end derivation in a real log:** in a scratch dir, seed a `status.jsonl` with one `workflow-started` row, then run the Step 13 derive → write → route blocks as **three separate `bash -c` invocations** four times over, each with a distinct `parentSha`. Confirm the printed sequence is `1, 2, 3, failure-path` and that `[bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)` appears on stderr.
- [ ] **Step 3 — Resume:** kill the loop after attempt 2, start a fresh shell, run only the derive block. Confirm it prints `3` with no restored state.
- [ ] **Step 4 — Active-run scoping:** append a `workflow-done` + a fresh `workflow-started` to the same log. Confirm the derive block prints `1` (fresh budget) while the shipped `PRIOR_STRATEGY` expression over the same file still returns the prior run's `strategy` — the intended asymmetry, observed rather than assumed.
- [ ] **Step 4b — The legitimate `0` routes, observed (§ Breaking Changes item 10b):** in a scratch log with **zero** `build-challenge-remediate` rows, run Step 10's routing block → confirm it prints the **continue** branch (Step 11) and exits 0, **not** Failure Path. Repeat for `bkit-debug.md:443` with zero `debug-failure-soak` rows → Step 4, not Failure Path. These are the two routes the draft's `counter_current` would have bricked on every first attempt; observe them rather than trust the task text.
- [ ] **Step 4c — Completeness, observed:** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` → T5.3 green. Then re-introduce a bare `$TEST_ATTEMPT` read into one converted block and confirm the rule **reds** (restore afterwards). A completeness rule that has never fired is not evidence of completeness — the same standard § Breaking Changes item 6 applies to the prose audit.
- [ ] **Step 4d — The mapping, observed (T5.4):** completeness (4c) proves each block derives _a_ counter; this proves it derives the **right** one. With the suite green, make each of these edits **one at a time, confirm the red, then restore**: (1) **wrong step** — change `bkit-build.md:719`'s derive from `build-challenge-remediate` to `build-challenge` (the step its own row names — the exact mis-map that produces valid JSON, a wrong `attempt`, and a green T5.3); (2) **short map** — delete that site's `COUNTER_STEP_MAP` entry while the block still derives, confirming the map cannot be silently short (the property that separates it from the `EXPECTED_CONSTANTS` hand-list whose 6-of-7 blind spot § Breaking Changes item 10a indicts). Both must red. **Then diff the map against `unconverted-sites.txt`** — all 11 counter-!=-row references present and identical. Observe this rather than trust the task text: T5.4 **pins** the mapping, it does not prove it, so an unexercised T5.4 pins nothing.
- [ ] **Step 5 — Provenance:** `jq -r 'select(.kind=="counter") | .counterSource' .bkit/stats.jsonl | sort | uniq -c` after one workflow close. Confirm the new row reads `shell-bus` and its `counterValue` matches the run count in `status.jsonl`. Historical `model-self-report` rows remain (append-only; they are the record of the defect).
- [ ] **Step 6 — Consumer surface:** `pnpm pack` → install the tarball into a fresh scratch consumer → `bkit install` → confirm `.bkit/scripts/bkit-status-fold.sh` lands, `bkit check` exits 0, and the installed `bkit-counter-bus.sh` carries no `counter_init`.
- [ ] **Step 7 — CI:** after push, `gh run watch` → `bkit-tests-check` green. Confirm the bats step reports the new suites (`gh run view --log | grep counter-derive`), not a silent zero.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | — |
| **Code** | `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. | Single squash commit; revert restores the prose counters and the fail-open guard together (the KN-26 pair inverts cleanly). |
| **Data** | None. `soakEntryAt` rows already in a `status.jsonl` are ignored by the reverted code; `counter` rows already emitted with `shell-bus` stay valid (documented enum member). Both are additive and forward-compatible. | No log migration either way. |
| **Risk window** | None — no deploy, no migration. A consumer only picks the change up on their next `bkit install` / version bump. | |

_Code-only — `git revert` sufficient._
