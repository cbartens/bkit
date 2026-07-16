<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Derived from `status.jsonl` Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

Workflow orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) branch their retry loops on attempt counters the **model** tracks in prose — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:316`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:911`). The counter reaching the shell is a number the model remembered and typed in. `decide_next` does not make that deterministic: it launders a model-supplied number through shell and returns it wearing a uniform, then faithfully enforces the cap against the wrong number. bkit's own telemetry has recorded this since the schema landed — all 10 `counter` rows in `stats.jsonl` declare `counterSource: "model-self-report"`, zero `shell-bus`.

The fix (agreed, `docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) is **derivation, not storage**: `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START and **re-derived** in every fenced block that needs it. Shell state does not survive between orchestrator Bash calls, so a counter is never carried — only re-read. That makes the whole class of bug structurally impossible rather than merely fixed, and makes resume free (a fresh process reading the same log lands on the same attempt because there is nothing to restore).

`status.jsonl` only became an append-only event log with a fold at #209 — after #58 was filed against the old `status.json` array. The data was always in the log; only the read was missing.

**Success Criteria:**

- No counter value originates in orchestrator context — every branch point re-derives it from `status.jsonl` in the fenced block that uses it, and no `*_ATTEMPT` name is referenced in orchestrator prose outside a fenced block (a `{PLACEHOLDER}` substitution token and a bare `MAX_*` constant name are the only exemptions — see § Breaking Changes item 5).
- A workflow exceeding a `MAX_*` threshold **and** a workflow with an unusable counter both route to the Failure Path — `decide_next` / `check_max` fail closed, no `2>/dev/null` hiding the diagnostic.
- Cross-process integration tests (separate processes sharing only `status.jsonl`) cover over-cap, unset/empty, per-attempt row counting, active-run scoping, subPlan isolation, SOAK marker reset and fold dedup in both directions — and the fail-closed pair demonstrably fails against today's `dev`.

**Related Issues:**

- `#234 — telemetry JSONL master feature (open)` — absorbed #58's measurement slice, not its control-flow slice. Owns the `counterSource` enum question; this plan uses the existing `shell-bus` value and adds no enum member.
- `#209 — status.json → append-only status.jsonl + fold (closed)` — the event-log shape derivation depends on.
- `#232`, `#183`, `#233` — consolidated into #234 alongside #58 on 2026-06-06.
- `#341 — all-runtimes / gh fallback + trackers-stay-on-MCP (open)` — named as the fix path for the related-issues search failure below; no scope here.

> [!CAUTION]
> **The related-issues scan was NOT performed this run — treat as missing context, not as "nothing related exists".** `mcp__github__search_issues` returned `total_count: 0` for every probe **including the control** `repo:cbartens/bkit telemetry`, which must match (#234's body is dense with the word). The refs above are carried from the issue body and comments, not re-confirmed by search. Recurrence logged to `.bkit/friction.jsonl` (`design-step-3-related-issues-search-silently-empty-on-private-repo`, `recurrenceCount: 2`). See `related-issues.md`.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative _(no parent design — taken verbatim from issue #58 § Goal + § Design, per the design-missing fallback; NOT fabricated)_

An engineer runs `/bkit-build` on a feature whose tests keep failing. Every retry the workflow takes is bounded by a number the shell counted out of the run's own event log, so the loop stops at the cap it advertises — and if the number is ever unusable, the run stops loudly instead of retrying forever.

### Success Criteria _(inherited from issue #58 § Acceptance — verbatim intent, re-worded only where the source states an impossible absolute; see § Breaking Changes item 5)_

- No `*_ATTEMPT` variable is referenced in orchestrator markdown outside a fenced shell block — including assignment and increment, not only comparisons. (Exemptions, both enforced by the audit: a `{X_ATTEMPT}` brace placeholder the orchestrator substitutes from shell stdout, and a bare `MAX_*` constant **name**.)
- No counter value originates in orchestrator context — every one is read from `status.jsonl` at the point of use.
- All `MAX_*` thresholds come from `bkit-counter-bus-config.sh`, with no literal duplicated in prose and no constant left unreferenced.
- A workflow exceeding a `MAX_*` threshold cannot silently continue — and an unusable counter cannot silently continue. Both route to the Failure Path.
- Resume re-derives every counter: no restored state, no fresh budget.
- Every emitted `counter` row can honestly claim a non-`model-self-report` provenance.

### Concrete Example _(plan expands from the issue)_

**Setup:** An engineer runs `/bkit-build` on FID `58-workflow-counters`. `MAX_TEST_ATTEMPT=3`. `docs/plans/202607/logs/58-workflow-counters/status.jsonl` holds one `workflow-started` row for `build` and no `build-run-tests` rows.

**Steps:**

1. Orchestrator enters Step 13 → runs the derive block → shell prints `1` → orchestrator uses `1` for the tracker comment (`Attempt: 1`). Tests fail.
2. Orchestrator runs the status-write block → the block **re-derives** `1` itself, appends `{step:"build-run-tests", attempt:1, verdict:"FAIL", parentSha:"a1b2c3d"}`, commits `--allow-empty` (HEAD moves).
3. Orchestrator runs the routing block → re-derives → **`1`** (the row it just wrote **is** attempt 1) → `decide_next TEST_ATTEMPT 1 3 step-14 failure-path` → prints `step-14`, exit 0 → Step 14.
4. Loop repeats. On the 4th failure the routing block derives `4` → `decide_next` prints `failure-path`, exit 1, and `[bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)` reaches stderr → **Failure Path**.
5. The engineer kills the session at attempt 2 and re-runs `/bkit-build`. The resumed run re-derives `3` from the same log — no restored state, no fresh budget.

**Outcome:** The run stops at the advertised cap. Four `build-run-tests` rows exist, each with a distinct `parentSha`; the `attempt` field on each equals the row's own ordinal, and every routing decision was made from a number the shell counted, not one the model remembered.

### Edge Cases _(plan-level; the issue states no Key Edge Cases section)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Counter expands empty / non-integer at a routing block | `decide_next` / `check_max` print **nothing** on stdout, emit a diagnostic on stderr, `return 2` → block exits 2 → orchestrator routes to **Failure Path**. Never "continue". |
| `status.jsonl` missing or unreadable at a derive block | `counter_count` returns 2 → call site `|| exit 2` → **Failure Path**. Never a default of 0. |
| Second run of the same workflow over one log (resume / re-invoke) | Active-run scoping (`fold \| map(select(.workflow==$w)) \| last \| .steps`) counts only the newest run's rows — a fresh budget, never the previous run's spent one (the DE-25 starvation). |
| `PRIOR_STRATEGY` reads the same log with all-runs scoping | Left **unchanged and deliberately opposite**. Both sites carry a comment naming the asymmetry, so neither reads as a bug from the other's side. |
| Two real retries of the same step | Survive the fold: each attempt's `--allow-empty` commit advances `parentSha`, so the dedup key `"S {workflow} {step} {parentSha} {at}"` differs. |
| A byte-identical row replayed (double-append of the same block) | Collapses to 1 by the same dedup key — the intended behaviour, and the reason the counter is implicitly coupled to the per-attempt commit cadence. |
| Per-attempt `--allow-empty` commit dropped from a step | Attempts silently collapse into one. Guarded by a test that asserts the commit advances HEAD; documented as a load-bearing dependency. |
| `VERIFY_ATTEMPT` across sub-plans | `subPlan` filter isolates each sub-plan's count — the `Reset VERIFY_ATTEMPT = 0 at start of each SUB_PLAN` prose becomes structurally unnecessary. |
| SOAK re-entered after NORMAL exhaustion, mid-run | A `workflow-meta` marker carrying `soakEntryAt` is appended at each SOAK entry; SOAK counts only `debug-failure-soak` rows with `.at > soakEntryAt` → fresh budget without any stored counter. |
| Two SOAK entries within the same wall-clock second | Fold dedups `workflow-meta` on `"W {type} {workflow} {at}"` → collapse to one marker. Same-second re-entry counts as one entry; acceptable and asserted. |
| Log with no `soakEntryAt` marker (fresh SOAK run, or a log written by an older bkit) | `.at > ""` is true for every row → counts all soak rows in the active run. Correct fresh-budget behaviour; additive, no migration. |
| Orchestrator mis-transcribes a derived value into a filename / comment | Artifact name and the row's `attempt` field are wrong; **routing is unaffected** — it re-derives. `attempt` is telemetry-only by contract. |

### Derived Test Matrix

> Tiering per `docs/testing.md` § "Which tier does a behaviour need?". Every row below crosses a real boundary (the `status.jsonl` file, `jq`, `git`, process boundaries) and carries a non-mock test that asserts a ground-truth signal. bkit has no DB/deploy/UI, so no `@live`, `E2E`, `fresh-DB replay` or `Smoke` rows exist. `bats` suites run in CI's `bkit-tests-unit` lane via `npx --yes bats tests/*.bats` (`ci.yml:500-502`) — no CI wiring needed.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Fold blob is single-sourced: zero inline `FOLD='def lastIdx…'` assignments remain in any `.bkit/workflows/*.md`, and the shipped script's blob is byte-identical to the retired one (md5 `d04a2499ad1900d9757b00774dd87866`, 1079 bytes) | Unit (Vitest) | `.bkit/src/bkit-status-fold.test.ts` | T1.3 |
| Per-attempt row counting across **separate processes**: three sequential `bash -c` invocations sharing only `status.jsonl` derive 1, 2, 3; the post-write re-derive equals the start-derive for the same attempt | Integration (bats, boundary: `status.jsonl` + process boundary) | `tests/counter-derive.bats` | T2.2 |
| Active-run scoping: a completed run with 3 rows + a fresh `workflow-started` → derive returns 1, not 4 (and the same fixture proves `PRIOR_STRATEGY`'s all-runs read still returns the old value — the asymmetry is intentional) | Integration (bats) | `tests/counter-derive.bats` | T2.3 |
| subPlan isolation: `build-plan-verify` rows for `subPlan:1` do not count toward `subPlan:2` | Integration (bats) | `tests/counter-derive.bats` | T2.4 |
| Fold dedup, both directions: 2 rows differing only in `parentSha` → count 2 (retries survive); 2 byte-identical rows → count 1 (replays collapse) | Integration (bats) | `tests/counter-derive.bats` | T2.5 |
| `git commit --allow-empty` advances HEAD in a real temp repo → consecutive attempts cannot collide on the dedup key (the load-bearing commit-cadence dependency) | Integration (bats, boundary: real `git`) | `tests/counter-derive.bats` | T2.6 |
| Fail-closed: unset / empty / non-integer counter → `decide_next` and `check_max` print nothing on stdout, exit 2 (**refused**, not continue); over-cap → prints `failure-path`, exit 1. Both **fail against `dev`'s counter-bus** via the `BKIT_COUNTER_BUS` override | Integration (bats, boundary: exit codes across processes) | `tests/counter-failclosed.bats` | T2.7 |
| SOAK marker: rows before `soakEntryAt` are excluded → a second SOAK entry gets a full fresh budget; absent marker counts all rows | Integration (bats) | `tests/counter-derive.bats` | T2.8 |
| Prose audit fires: the widened pattern matches known-bad fixture lines (`Init counters: VERIFY_ATTEMPT = 0`, `Increment TEST_ATTEMPT + 1`, `CHALLENGE_REMEDIATE_ATTEMPT < 1`, `NORMAL_ATTEMPT > 1`) and does NOT match `{VERIFY_ATTEMPT}` or a bare `MAX_TEST_ATTEMPT` — a **negative control**, because the shipped pattern matches nothing (see § Breaking Changes item 6) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.1 |
| Every `MAX_*` defined in `bkit-counter-bus-config.sh` is referenced by >=1 fenced shell block across the workflow corpus (no dead constant — closes constraint 6's second half) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.2 |
| Deleted primitives are gone and unreferenced: `counter_init` / `counter_inc` / `counter_get` / `counter_reset` / `BKIT_COUNTER_` appear in **zero** files under `.bkit/` and `tests/` | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T6.2 |
| Every `counter` row emitter passes a fold-derived `counterValue` and `counterSource: "shell-bus"`; zero `model-self-report` literals remain in the workflow corpus | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T7.1 |
| Static gate on every changed file | Static | `pnpm typecheck && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm bkit check` | T8.3 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

**1. `decide_next` / `check_max` exit contract changes — BREAKING, and it is the point.**

`.bkit/scripts/bkit-counter-bus.sh` is a **shipped consumer file** (core template walk, `.bkit/version` canonicalHashes). Today an unset counter → `[ "" -gt 3 ]` → non-zero → indistinguishable from "condition false" → **continue**. After this change it → exit 2 → **Failure Path**. Any consumer calling `decide_next` with an unset variable flips from silently retrying forever to failing loudly. The only callers in the corpus are bkit's own workflows, which this plan converts in the same PR.

> [!WARNING]
> **This cannot ship alone (KN-26 shape).** Hardening the guard without the derivation converts "may silently overrun" into "**never retries**" — every retry route hard-fails. Task order is load-bearing: **T3.1–T3.7 (derivation) land before T3.8 (hardening)**, both in the same PR. Do not reorder, do not split the PR along that seam.

**2. Inert primitives deleted from a shipped script — BREAKING.** `counter_init` / `counter_inc` / `counter_get` / `counter_reset` and the `BKIT_COUNTER_*` convention are removed (WS-6, **last**). They are called from exactly one live site today (`bkit-debug.md:432`, itself inert — the helper writes `BKIT_COUNTER_SOAK_ATTEMPT` while `:440` reads `$SOAK_ATTEMPT`; the two never meet). Deletion is only safe once every site is converted.

**3. New shipped file: `.bkit/scripts/bkit-status-fold.sh`** exporting `BKIT_STATUS_FOLD`. Ships via the core template walk from `.bkit/templates/.bkit/scripts/` like its siblings — no manifest entry (counter-bus has none either); `bkit install` stamps its `canonicalHashes` entry. The variable is **renamed** from the workflows' current local `FOLD` to `BKIT_STATUS_FOLD` (a sourced script must not claim a name as generic as `FOLD`). 15 use sites across 5 workflows change.

**4. New `status.jsonl` field: `soakEntryAt`** on a `workflow-meta` event. Additive; the existing fold needs no change (it merges `workflow-meta` fields into the run object, last-wins). A log without the marker counts all soak rows = fresh budget, so old logs need no migration.

> [!IMPORTANT]
> The marker's timestamp MUST be carried in the named `soakEntryAt` field, **not** inferred from the event's `at`: the fold does `del(.type,.workflow,.at)` on `workflow-meta`, so `at` is discarded before it reaches the run object.

**5. The issue's "no `*_ATTEMPT` in prose" is not literally achievable — two exemptions are proposed.**

Artifact filenames embed the attempt (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`) and subagent Context lines carry it (`attempt {VERIFY_ATTEMPT}`). Roughly 40 such `{X_ATTEMPT}` placeholders sit in non-fenced prose and **must** stay — the orchestrator substitutes them from the derive block's stdout. The enforceable rule, which preserves the issue's actual intent (no counter value **originates** in context):

- **BANNED** outside a fenced block: any bare `X_ATTEMPT` token (this catches every assignment, increment, reset and comparison, since all of them name the counter bare).
- **ALLOWED:** `{X_ATTEMPT}` — a substitution token, never a computation; and `MAX_X_ATTEMPT` — a constant **name** pointing at the config, carrying no value.

A transcription error in a placeholder mis-names an artifact; it cannot corrupt routing, because routing re-derives. That is exactly why the decision makes `attempt` telemetry-only.

**6. The shipped prose audit is vacuous, not merely narrow — its green is evidence of nothing.**

`ATTEMPT_COMPARISON_PATTERN = /\bATTEMPT\b.*(?:<=|>=|<|>)\s*(?:`?)MAX_|MAX_\w+\s*(?:<=|>=|<|>)\s*\d/`. `\bATTEMPT\b`cannot match inside`VERIFY_ATTEMPT`— the preceding`_`is a word character, so there is no word boundary. **The pattern cannot match any real counter name in the corpus.** The same holds for`MAX_LITERAL_DEFINITION_PATTERN` (`MAX_X = N`appears in no workflow). Both`describe` blocks pass because they match nothing at all. Worse than #179/#195's class: the test does not merely assert the shape that was built, it asserts nothing. The widened audit therefore **must** ship with a negative control (T5.1) proving the pattern fires on known-bad lines.

**7. The issue's 7-site table is incomplete — 3 more prose counter comparisons exist.**

`bkit-debug.md:417` (`NORMAL_ATTEMPT > 1`), `:418` (`NORMAL_ATTEMPT = 1`) and `:802` (`NORMAL_ATTEMPT > 1`) compare a counter against a literal in prose. They are not `MAX_` caps — they distinguish "passed first try" from "we fixed something" — but they are model-authored counter comparisons and the widened audit flags them. Folded into T3.5. Verdict/mode semantics stay in the orchestrator; only the **number** moves to shell.

**8. `DEBUG_ATTEMPT` is already derived, and its scoping must stay CROSS-run — do not "fix" it to active-run.**

`bkit-debug.md:175-181` already folds `last.debugAttempt` (a `workflow-meta` field) across **all** `debug` runs and adds 1. That is correct: `DEBUG_ATTEMPT` counts **invocations**, not steps within a run. Applying this feature's active-run rule to it would reset it every invocation and permanently disable SOAK escalation. Its actual defect is narrower: the value is derived in the Step 7 block and read in the **Step 8** block (`:194`), across a process boundary where shell state does not survive. T3.4 re-derives inside the routing block; the cross-run scoping is preserved verbatim and commented.

**9. `counterSource` flips `model-self-report` → `shell-bus` on 5 emitters.** Consumers of `.bkit/stats.jsonl` (#234 harvest / #183 analysis) will see the distribution change. No enum member is added — `"derived"` vs `"shell-bus"` is #234's question and stays untouched.

> [!IMPORTANT]
> The 5 emitters currently pass `--argjson counterValue 1` — a **hardcoded literal**, not a remembered number. Flipping only the `counterSource` flag would swap one dishonest label for another. T7.1 derives the value from the fold first; the flag follows the fact.

**Proposed names** (all new): `.bkit/scripts/bkit-status-fold.sh`, `BKIT_STATUS_FOLD`, `counter_count`, `counter_next`, `counter_current`, `soakEntryAt`, `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`, env override `BKIT_COUNTER_BUS`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

- **Stored `counters` object in status (the original #58 sketch) — REJECTED.** It had to propose a policing invariant (_"`counters.verifyAttempt` must equal the count of `plan-verify` entries"_) precisely because a stored counter drifts from the rows. Counting the rows makes that invariant true by construction. Superseded by the ACTIVE decision record; written in May against the pre-#209 `status.json` array.
- **Persist `BKIT_COUNTER_*` across blocks — REJECTED, and now known impossible.** Each fenced block is a fresh process. Even with persistence the wiring is broken (helper writes `BKIT_COUNTER_{NAME}`, call sites read `${NAME}`).
- **Read back the `attempt` field instead of counting rows — REJECTED.** It reintroduces a dependence on every step faithfully writing `attempt`. Counting rows needs no such trust, which is what lets `attempt` become telemetry-only.
- **Copy `PRIOR_STRATEGY`'s fold-and-read shape — REJECTED.** Verified all-runs (`[.[] | .steps[] | …] | last`). Correct-ish for strategy (a resumed run arguably should not restart the STANDARD → PIVOT → FINAL ladder); wrong for attempts (a resumed run would inherit a spent budget — the DE-25 starvation). Two reads, one log, deliberately opposite scoping, commented at both sites.
- **Harden `decide_next` now, derive later — REJECTED.** Converts silent-overrun into never-retries. KN-26 shape.
- **Change `>` to `>=` while converting — REJECTED (out of scope).** Preserve today's comparison semantics exactly; the point is provenance, not threshold tuning. `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reuses the existing `THRESHOLD=$((MAX_X - 1))` idiom (precedent: `bkit-debug.md:192-193`) to reproduce the literal-`1` gate byte-for-byte.
- **Future recommendation (not this plan):** there is **no shellcheck gate over `.bkit/scripts/*.sh`** — actionlint only shellchecks `run:` blocks in `.github/workflows/*`. The `SC2016` directive this plan adds is therefore defensive for local runs, not CI-enforced. Deferred (see § Out of Scope).

## Out of Scope

- Verdict semantics, strategy selection, sub-plan iteration logic. `PASS`/`FAIL`/`CONCERNS` and `STANDARD`/`PIVOT`/`FINAL` need judgment and stay in the orchestrator.
- Renaming or restructuring step IDs; artifact file formats.
- The `counterSource` enum question (`"derived"` vs `"shell-bus"`, which names the transport rather than the provenance) — #234 owns that schema.
- `TEST_VERDICT` / `TEST_SCOPE` pass via `--arg` and accept empty silently, unlike the counters' `--argjson` hard-stop. Legitimately model judgments; noted on the findings comment, not fixed here. → deferral row.
- `PRIOR_STRATEGY`'s all-runs scoping — flagged and commented, not changed. Which behaviour strategy actually wants was never established. → deferral row.
- Adding a shellcheck CI gate over `.bkit/scripts/*.sh`. → deferral row.
- `CI_ATTEMPTS` (`bkit-build.md:1258`+, `bkit-debug.md:980`+, `bkit-ship.md`) — a loop-local poll counter incremented and consumed **inside one fenced block**. Never crosses a process boundary, never model-authored. Not a call site.

## Merge Method

**Merge method: always squash.** All workstreams land in **ONE PR** — non-negotiable per Breaking Changes item 1: WS-3's derivation and T3.8's fail-closed hardening are the two halves of the KN-26 pair and must not be separable at the merge boundary. `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| 15 × inline `FOLD='def lastIdx…'` assignments across `bkit-build.md` (`:146`, `:333`, `:592`, `:987`), `bkit-debug.md` (`:132`, `:179`, `:323`, `:624`), `bkit-ship.md` (`:135`, `:304`, `:665`), `bkit-plan.md` (`:104`, `:255`), `bkit-design.md` (`:103`, `:251`) | `.bkit/scripts/bkit-status-fold.sh` (`BKIT_STATUS_FOLD`) | DELETE | 15 hand-synced copies of a 1079-byte jq reducer across **5** workflows (the issue says 3 — plan/design carry it too). Sourcing once makes derivation and workflows agree by construction. |
| `counter_init` / `counter_inc` / `counter_get` / `counter_reset` + the `BKIT_COUNTER_*` convention (`bkit-counter-bus.sh:27-62`) | `counter_count` / `counter_next` / `counter_current` (re-derive per block) | DELETE | Inert: shell state does not survive across orchestrator Bash calls, and the helpers write `BKIT_COUNTER_{NAME}` while every call site reads `${NAME}`. Keeping dead helpers beside a different live convention is what let Defect 2 hide. |
| `tests/counter-bus.bats` §1-4 (`counter_init`/`inc`/`get`/`reset`), §8's `counter_init`/`counter_inc`/`counter_get` cases, §9 integration cases | `tests/counter-derive.bats` + `tests/counter-failclosed.bats` | DELETE | They exercise the deleted primitives **inside a single `bash -c`** — the one condition the real workflow never satisfies. §5-7 (`check_max` / `decide_next` / config constants) are RETAINED and extended. |
| `ATTEMPT_COMPARISON_PATTERN` + `MAX_LITERAL_DEFINITION_PATTERN` (`bkit-counter-prose-audit.test.ts:89-97`) | widened bare-name pattern + placeholder/`MAX_` exemptions + negative control | DELETE | `\bATTEMPT\b` cannot match `X_ATTEMPT`; both patterns match nothing in the corpus (§ Breaking Changes item 6). |
| `EXPECTED_FUNCTIONS` list (`bkit-counter-prose-audit.test.ts:167-174`) asserting the 4 inert primitives exist | list asserting `counter_count`/`counter_next`/`counter_current`/`check_max`/`decide_next` exist **and** the 4 primitives are absent | DELETE | Asserts the presence of code this plan deletes; would red the suite at T6.1. |
| Prose counter statements: `bkit-build.md:316`, `:470`, `:526`, `:806`, `:911`; `bkit-debug.md:306`, `:372`, `:744`; `bkit-ship.md:286`, `:519` | derive blocks at each site | DELETE | `Init counters:` / `Increment X + 1` / `Reset X = 0` / `Set X = 0` — the model-authored counter this issue exists to remove. |
| Hardcoded literal `1` gate: `bkit-build.md:780-783`, `:804` | `MAX_CHALLENGE_REMEDIATE_ATTEMPT` via `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` | DELETE | Closes constraint 6 in both directions: the literal is duplicated in prose **and** the constant is dead. |
| `--argjson counterValue 1` + `--arg counterSource "model-self-report"` × 5 (`bkit-build.md:1196-1197`, `bkit-debug.md:953-954`, `bkit-ship.md:1004-1005`, `bkit-plan.md:760-761`, `bkit-design.md:764-765`) | fold-derived `counterValue` + `counterSource "shell-bus"` | DELETE | A hardcoded `1` labelled `model-self-report` is dishonest in both fields. |
| `2>/dev/null` on all 6 `decide_next`/`check_max` call sites | stderr surfaced | DELETE | Suppresses the only diagnostic the guard produces. |

## Security & Privacy

- [x] **None — no new routes, DB writes, secrets, or user input.** No API route, no DB table/column, no role-gated mutation, no user input, no PII, no redirect, no webhook, no new env var.
- **New executable surface, assessed:** `.bkit/scripts/bkit-status-fold.sh` is sourced (`.`) by workflow bash blocks from `$REPO_ROOT` — identical trust boundary and idiom to the existing `bkit-counter-bus.sh` / `bkit-counter-bus-config.sh` sourcing. It defines one variable and no functions. No new `ask`/`deny` entry in `.claude/settings.json` is needed (no new destructive command; § Authoring Checklist item on destructive shell commands is satisfied vacuously).
- **Untrusted input:** counters are derived from `status.jsonl`, written only by the workflows themselves — not from issue/PR/comment bodies. The derivation adds no attacker-controlled path (#342 contract unaffected).

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new packages. `bats` is already used via `npx --yes bats` (`ci.yml:502`); `jq` is a runtime prerequisite of the existing workflows. Verify `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm --version` (hold pnpm at **10.34.1** — 10.34.3 breaks `bkit download`, #176/#268), `npx tsc --version`, `jq --version`, `npx bats --version`.
- [ ] **User Context:** Verify write access to `.bkit/templates/.bkit/scripts/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`.
- [ ] **Pending Blockers:** Query the tracker for open `blocker`-labelled issues touching the counter-bus or `status.jsonl`.
- [ ] **Project Context:** Read `docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored` (ACTIVE — the contract this plan implements) and `de-24-143-soak-mode-reuses-max-debug-attempt-as-the-single-sh` / `de-25-143-observe-mode-removed-observation-logging-folds-into` (SOAK budget history). Read `docs/knowledge.jsonl` KN-26 (two complementary defences land together).
- [ ] **Testing & Quality:** Strategy aligns with `docs/testing.md` — boundary tests reach the real boundary and assert a ground-truth signal, never "did not throw"; `passWithNoTests` is banned; no mocks at the `status.jsonl` / `git` boundary.
- [ ] **Prerequisite Plans:** None. #209 (status.jsonl + fold) already shipped and is the substrate.
- [ ] **Concurrency:** No second bkit workflow may run on this clone during execution (two workflows share `dev` + working tree + `.git/config`). Serialise.

### Conditional (verify only when applicable)

- [ ] **Architecture:** `.bkit/workflows/` is the **canonical source**; `.claude/commands/`, `.cursor/commands/`, `.opencode/` are regenerated by `bkit install` and must never be hand-edited (`.bkit/workflows.md:17`, `:1182`). `.bkit/templates/.bkit/scripts/*.sh` is the **source** for `.bkit/scripts/*.sh` (core template walk, `bkit-modules.ts:238-244`, `:349`) — edit the template, regenerate the installed copy.
- [ ] **Observability:** Every telemetry append stays best-effort (`|| echo "[bkit-telemetry] append failed: $FILE"`) and NEVER gates a workflow (`.bkit/workflows.md:1177`). All diagnostics keep the `[bkit-telemetry]` prefix (log-drain grep depends on it).

_Not applicable: Secrets & Env Vars, Schema State (no DB), UI/Design, Notifications._

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The "schema" here is the `status.jsonl` append-only event log (`.bkit/workflows.md` § Status; `docs/data-schema.md` is not applicable to bkit itself).

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `status.jsonl` folded run array → `.workflow`, `.status`, `.steps[].step`, `.steps[].status`, `.steps[].subPlan`, `.steps[].at`, `.steps[].parentSha`; run-level `.debugAttempt` (existing `workflow-meta` field, cross-run, `DEBUG_ATTEMPT` only).
- **Output (Write):** `step-done` rows (unchanged shape; `attempt` now shell-derived within the writing block instead of `--argjson`-ed from a model-supplied variable). `.bkit/stats.jsonl` `counter` rows → `counterValue` (now derived), `counterSource` (now `shell-bus`).

### Data Schema Changes

- **ADD:** `workflow-meta.soakEntryAt` (type: string, ISO-8601 UTC) — appended at every SOAK entry in `bkit-debug.md`. Folds onto the run object via the existing `workflow-meta` merge branch. Additive and optional; absent → all soak rows in the active run count (fresh budget). No migration.
- **UNCHANGED:** `step-done.attempt` stays on every row and keeps its type, but is **re-classified as telemetry-only** — routing counts rows, so a missing or wrong `attempt` cannot corrupt control flow. Documented in `.bkit/workflows.md`.
- **UNCHANGED:** the fold reducer itself (byte-identical, just relocated). `soakEntryAt` needs no fold change.

## Architecture & Component Changes

### Shell — shipped scripts (source: `.bkit/templates/.bkit/scripts/`)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`

- Defines exactly one variable, `BKIT_STATUS_FOLD`, holding the 1079-byte jq prelude (`def lastIdx($w): …; def fold: …;`) **byte-identical** to the blob currently inlined 15×.
- Header comment states: single source of truth for the `status.jsonl` fold; the dedup key is `"S {workflow} {step} {parentSha} {at}"`, so **row counting depends on `parentSha` advancing per attempt** — dropping a step's per-attempt `--allow-empty` commit silently collapses attempts into one.
- Carries `# shellcheck disable=SC2016` for the single-quoted blob (`$w` / `$e` / `$i` are jq variables, not shell). Note: no CI shellcheck gate covers `.bkit/scripts/*.sh` today — the directive is for local runs.
- Ships via the core template walk (`bkit-modules.ts:349` `processCoreTemplateDir` → `writeTier2`), like `bkit-counter-bus.sh`. No manifest entry. Installed copy `.bkit/scripts/bkit-status-fold.sh` + `.bkit/version` hash are produced by `bkit install`.

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`

- **Existence Check:** exists (`.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`); installed copy `.bkit/scripts/bkit-counter-bus.sh` is byte-identical and hashed at `.bkit/version:65`.
- **ADD** `counter_count STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]` → prints the count of `step-done` rows for `STEP` with `status=="DONE"` in the **ACTIVE run** (`fold | map(select(.workflow==$w)) | last | .steps`). `--sub-plan` adds `and .subPlan==$sp`; `--since FIELD` adds `and .at > (run[FIELD] // "")`. Returns **2** (printing nothing on stdout) when the file is missing/unreadable, jq fails, or the result is not a non-negative integer. Requires `BKIT_STATUS_FOLD` to be sourced.
- **ADD** `counter_next …` = `counter_count` + 1 — the value at step **START** (what the artifact filename embeds and the row records).
- **ADD** `counter_current …` = `counter_count`, refusing (return 2) when the count is 0 — the value **after** the step appended its row (the row it just wrote _is_ this attempt). This is the two-position contract that lets post-write routing re-derive the identical number with no field read and no carried state.
- **ADD** a header comment naming the deliberate asymmetry with `PRIOR_STRATEGY`'s all-runs read.
- **HARDEN** `check_max` / `decide_next`: `case $_val in ''|*[!0-9]*) … return 2;; esac` on both the value and the max; exit 2 prints **nothing** on stdout, diagnostic on stderr with the `[bkit-telemetry]` prefix. Preserve `>`-comparison semantics exactly.
- **[DELETE]** `counter_init`, `counter_inc`, `counter_get`, `counter_reset` and the `BKIT_COUNTER_*` convention — **WS-6, last**.

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh`

- **Existence Check:** exists; all 7 `MAX_*` already defined. No value changes. Comment only: note `MAX_CHALLENGE_REMEDIATE_ATTEMPT` is consumed via the `THRESHOLD=$((MAX_X - 1))` idiom.

### Orchestrator workflows (canonical source: `.bkit/workflows/`)

#### [MODIFY] `.bkit/workflows/bkit-build.md`

- **Existence Check:** exists. Verified sites: `:49` Limits, `:89` Failure Path trigger, `:146`/`:333`/`:592`/`:987` FOLD, `:316` Init counters, `:367` Gate 4, `:470` sub-plan reset, `:526` Increment VERIFY, `:538` verify row write, `:563` `decide_next VERIFY`, `:571` Gate 6, `:716`/`:761`/`:818` challenge rows, `:780-783`/`:804` literal-`1` gate, `:806` Increment CHALLENGE, `:841` Gate 11, `:911` Increment TEST, `:936` test row write, `:960` `decide_next TEST`, `:968` Gate 13, `:1196-1197` counter row.
- Steps: 4 FOLD sites → source; VERIFY / TEST / CHALLENGE_REMEDIATE derive + route; prose removed; gate checklists rewritten; telemetry row derived.

#### [MODIFY] `.bkit/workflows/bkit-debug.md`

- **Existence Check:** exists. Verified sites: `:49-50` Limits, `:90` Failure Path trigger, `:132`/`:179`/`:323`/`:624` FOLD, `:175-181` `PRIOR_DEBUG_ATTEMPT` fold (**cross-run — preserve**), `:187-194` `decide_next DEBUG`, `:243` Gate 1, `:306` Init counters, `:332` `workflow-meta debugAttempt` (the marker precedent), `:358` Gate 2, `:372` Increment NORMAL, `:400` run-tests row, `:417-418` prose `NORMAL_ATTEMPT` comparisons, `:424` `decide_next NORMAL`, `:427-434` SOAK escalation + `counter_reset`, `:440` `check_max SOAK`, `:448` Gate 3, `:661` diagnose-driven SOAK reset, `:744` Increment SOAK, `:756` soak row (`soakAttempt`), `:784` Gate 7, `:802` prose `NORMAL_ATTEMPT > 1`, `:953-954` counter row.
- Steps: 4 FOLD sites → source; DEBUG re-derived in-block (cross-run scoping preserved + commented); NORMAL derived (incl. the 3 non-cap prose comparisons); SOAK derived via `--since soakEntryAt` + marker appended at both mid-run entry points (`:427-434`, `:661`); prose removed; telemetry row derived.

#### [MODIFY] `.bkit/workflows/bkit-ship.md`

- **Existence Check:** exists. Verified sites: `:49` Limits, `:93` Failure Path guards, `:135`/`:304`/`:665` FOLD, `:286` `Set MERGE_ATTEMPT = 0`, `:338` Gate 2, `:519` Increment MERGE, `:562` merge row, `:586` `decide_next MERGE`, `:594` Gate 6, `:1004-1005` counter row.

#### [MODIFY] `.bkit/workflows/bkit-plan.md` · `.bkit/workflows/bkit-design.md`

- **Existence Check:** both exist. FOLD sites only (`bkit-plan.md:104`, `:255`; `bkit-design.md:103`, `:251`) + the counter row (`bkit-plan.md:760-761`, `bkit-design.md:764-765`). No `*_ATTEMPT` retry counters.

### Tests

#### [MODIFY] `.bkit/src/bkit-counter-prose-audit.test.ts`

- **Existence Check:** exists (187 lines).
- Replace both vacuous patterns; add the placeholder / `MAX_`-name exemptions; add the negative control; add the no-dead-constant rule; add the no-primitives rule; add the counter-row provenance rule. Update `EXPECTED_FUNCTIONS`.

#### [NEW] `.bkit/src/bkit-status-fold.test.ts` · [NEW] `tests/counter-derive.bats` · [NEW] `tests/counter-failclosed.bats`

- Colocation per `docs/testing.md` § Stack (test files under `.bkit/src/`); bats suites live in `tests/` beside `counter-bus.bats` / `telemetry-failopen.bats` and auto-run via `npx --yes bats tests/*.bats`.

#### [MODIFY] `tests/counter-bus.bats`

- Prune §1-4, §8's primitive cases and §9; retain and extend §5-7. Add the `BKIT_COUNTER_BUS` path override used for the RED-vs-`dev` proof.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.bkit/workflows.md` | § Authoring Checklist item _"Loops cap at `MAX_*_ATTEMPT` constants"_ (`:1194`) → rewrite: counters are **derived** from `status.jsonl` in the fenced block that uses them, never carried and never prose-authored; every `MAX_*` comes from `bkit-counter-bus-config.sh`. § Status → add: `attempt` is telemetry-only; `soakEntryAt` marker; the fold is sourced from `.bkit/scripts/bkit-status-fold.sh` and its dedup key makes row counting dependent on the per-attempt `--allow-empty` commit. |
| `docs/testing.md` | Repo-local section (below `bkit:end`) → new subsection "Counter derivation test coverage": the cross-process rule (no counter value may cross from one `bash -c` to the next except through `status.jsonl`), the `BKIT_COUNTER_BUS` override for the RED-vs-`dev` proof, and a file/tier/scope table row per new suite. Add `tests/counter-derive.bats` + `tests/counter-failclosed.bats` to § Key test files. Do NOT touch the managed block. |
| `docs/decisions.jsonl` | **Already written at plan time** — `58-status-fold-sourced-once-from-shared-script`, `58-prose-audit-bans-bare-attempt-names-allows-brace-placeholders`. T8.2 verifies, does not re-append. |
| `docs/deferrals.jsonl` | **Already written at plan time** — `58-test-verdict-scope-arg-accepts-empty-silently`, `58-prior-strategy-all-runs-scoping-unresolved`, `58-no-shellcheck-gate-over-bkit-scripts`. T8.2 verifies, does not re-append. |
| `.bkit/jsonl.md` | **No change** — `counterSource: "shell-bus"` is already the documented enum member (`:61`) and the shipped example already uses it (`:262`). Confirm during T7.1; do not add `"derived"` (#234 owns it). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | — |
| **Code** | `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. | Single squash commit; revert restores the prose counters and the fail-open guard together (the KN-26 pair inverts cleanly). |
| **Data** | None. `soakEntryAt` rows already in a `status.jsonl` are ignored by the reverted code; `counter` rows already emitted with `shell-bus` stay valid (documented enum member). Both are additive and forward-compatible. | No log migration either way. |
| **Risk window** | None — no deploy, no migration. A consumer only picks the change up on their next `bkit install` / version bump. | |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Append a `kind:"deferral"` (or `kind:"failure"`) row per `.bkit/jsonl.md` with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task.
> **Edit the SOURCE, never the mirror:** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`. Run `pnpm bkit install` ONCE at T8.3, never per edit.
> **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — `!=` `>=` `<=`, never `≠ ≥ ≤`.

### WS-1 — Single-source the fold (prerequisite; pure refactor, green standalone)

- [ ] **T1.1:** Create `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` defining `BKIT_STATUS_FOLD` with the blob copied **byte-for-byte** from `.bkit/workflows/bkit-build.md:146` (do not retype it), plus the header comment (parentSha/commit-cadence dependency; `PRIOR_STRATEGY` asymmetry) and `# shellcheck disable=SC2016`.
  - **Done when:** `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` exists; `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; printf "%s" "$BKIT_STATUS_FOLD"' | wc -c` prints `1079`; the same pipeline into `md5` prints `d04a2499ad1900d9757b00774dd87866`.
- [ ] **T1.2:** Replace all 15 inline `FOLD='…'` assignments with `. "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh"` (or the block's existing root variable — `$WT` at `bkit-build.md:333`, `bkit-debug.md:323`) and rename every use `"$FOLD"` → `"$BKIT_STATUS_FOLD"`, across `bkit-build.md` (`:146`, `:333`, `:592`, `:987`), `bkit-debug.md` (`:132`, `:179`, `:323`, `:624`), `bkit-ship.md` (`:135`, `:304`, `:665`), `bkit-plan.md` (`:104`, `:255`), `bkit-design.md` (`:103`, `:251`). Add the all-runs-scoping comment at each `PRIOR_STRATEGY` site (`bkit-build.md:592`, `:987`; `bkit-debug.md:624`; `bkit-ship.md:665`).
  - **Done when:** `grep -rc "FOLD='def lastIdx" .bkit/workflows/` reports 0 for all 5 files; `grep -rl 'BKIT_STATUS_FOLD' .bkit/workflows/ | wc -l` = 5; every `PRIOR_STRATEGY` block carries a comment containing `all runs`.
- [ ] **T1.3:** Add `.bkit/src/bkit-status-fold.test.ts` — asserts (a) zero `FOLD='def lastIdx` occurrences across `.bkit/workflows/*.md`, (b) the script's extracted blob length is 1079 and its md5 is `d04a2499ad1900d9757b00774dd87866`, (c) every workflow that uses `$BKIT_STATUS_FOLD` also sources `bkit-status-fold.sh`.
  - **Done when:** `pnpm vitest run .bkit/src/bkit-status-fold.test.ts` passes with >0 tests; deleting the source line from any one workflow reds it (verify by temporary edit, then restore).

### WS-2 — Derivation helpers + cross-process tests (additive; primitives untouched)

> Every suite here obeys one rule: **no counter value may cross from one `bash -c` to the next except through `status.jsonl` on disk.** Multiple sequential `bash -c` invocations are the point (they are the separate processes); a single `bash -c` carrying state is the banned shape `tests/counter-bus.bats` ships today.

- [ ] **T2.1:** Add `counter_count` / `counter_next` / `counter_current` to `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` per § Architecture. POSIX `sh` only (no bashisms, no process substitution). Do NOT touch `counter_init`/`inc`/`get`/`reset` yet; do NOT harden `decide_next` yet.
  - **Done when:** `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; . ./.bkit/templates/.bkit/scripts/bkit-counter-bus.sh; type counter_count counter_next counter_current'` exits 0 under `sh`, `bash`, `dash` and `zsh`; `counter_count /nonexistent build x; echo $?` prints `2` and no stdout.
- [ ] **T2.2:** `tests/counter-derive.bats` — per-attempt row counting across separate processes. Fixture: a tmp dir with `status.jsonl` seeded with one `workflow-started` row. Three sequential `bash -c` invocations, each derive→write→derive, distinct `parentSha` per attempt.
  - **Done when:** the suite asserts `counter_next` prints 1, 2, 3 on successive iterations **and** that the post-write `counter_current` equals the pre-write `counter_next` for the same iteration; `npx bats tests/counter-derive.bats` passes; no test carries a counter value between `bash -c` calls.
- [ ] **T2.3:** Same file — active-run scoping. Fixture: run A (`workflow-started` + 3 `build-run-tests` DONE rows + `workflow-done`) then run B (`workflow-started`, no step rows).
  - **Done when:** `counter_next` returns `1` (not `4`) for run B; a sibling assertion runs the **shipped** `PRIOR_STRATEGY` jq expression over the same fixture and shows it returns the run-A value — the asymmetry is asserted, not merely commented.
- [ ] **T2.4:** Same file — subPlan isolation. Fixture: 2 `build-plan-verify` rows with `subPlan:1`, 0 with `subPlan:2`.
  - **Done when:** `counter_next … --sub-plan 2` prints `1` while `--sub-plan 1` prints `3`.
- [ ] **T2.5:** Same file — fold dedup, both directions. Fixture A: two rows identical except `parentSha`. Fixture B: two byte-identical rows.
  - **Done when:** fixture A counts `2` (distinct retries survive) and fixture B counts `1` (byte-identical replays collapse); both assertions are in the suite and both pass.
- [ ] **T2.6:** Same file — the commit-cadence dependency. Create a real temp git repo (`git init`, one commit), capture HEAD, `git commit --allow-empty`, capture HEAD again.
  - **Done when:** the test asserts the two SHAs differ (real `git`, no mock) and its comment names the consequence: dropping a step's per-attempt `--allow-empty` commit silently collapses attempts into one.
- [ ] **T2.7:** `tests/counter-failclosed.bats` + the `BKIT_COUNTER_BUS` override in both bats suites (`COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh}"`). Cases: unset / empty / `abc` / `1.5` value → exit 2, **empty stdout**; unset/empty MAX → exit 2; over-cap → `failure-path` + exit 1; at-cap → continue + exit 0. Then capture the RED-vs-`dev` proof: `git show dev:.bkit/scripts/bkit-counter-bus.sh > "$TMP/dev-bus.sh"` → `BKIT_COUNTER_BUS="$TMP/dev-bus.sh" npx bats tests/counter-failclosed.bats`.
  - **Done when:** the RED run's output is saved to `docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt` showing the unset-counter case failing against `dev` (dev prints `step-14`, exit 0 — the fail-open); the suite still fails against the current tree (T3.8 has not run yet). Both facts recorded.
- [ ] **T2.8:** `tests/counter-derive.bats` — SOAK marker. Fixture: 2 `debug-failure-soak` rows, a `workflow-meta` row carrying `soakEntryAt`, then 1 more soak row.
  - **Done when:** `counter_next … --since soakEntryAt` prints `2` (only the post-marker row counts) while the same call without `--since` prints `4`; a marker-absent fixture prints the all-rows count; a same-second double-marker fixture folds to one marker.

### 🔒 Gate 2a: Derivation Available, Guard Not Yet Hardened

- [ ] **Gate 2a - Verified:** T1.1–T2.8 all `[x]`. `npx bats tests/*.bats` runs; `tests/counter-failclosed.bats` is RED (expected — T3.8 has not run) and `red-vs-dev.txt` proves it is also RED against `dev`. Every other suite is green. **Do NOT proceed to T3.8 before T3.1–T3.7.**

### WS-3 — Convert all call sites, THEN harden the guard (the KN-26 atomic pair)

> **Per-site shape** (repeat verbatim; match existing formatting per `.bkit/workflows.md` § Reuse wording and formatting):
>
> ```bash
> REPO_ROOT=$(git rev-parse --show-toplevel)
> . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh"
> . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
> . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
> STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
> # ACTIVE-RUN scoping — deliberately OPPOSITE to PRIOR_STRATEGY's all-runs read (Step N).
> TEST_ATTEMPT=$(counter_current "$STATUS" build build-run-tests) || exit 2
> decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path
> ```
>
> Three positions per site: **derive-at-START** (`counter_next`, prints the value the orchestrator substitutes into `{X_ATTEMPT}` placeholders), **status-write** (re-derives with `counter_next` inside the same block — the row is not yet appended — and uses it for `attempt`, the `artifacts` filename and the commit subject, replacing `--argjson a "$X_ATTEMPT"`), **route** (`counter_current` — the row it just wrote _is_ this attempt). Every routing block gains: `- **If** any other exit → **Failure Path**.` and loses its `2>/dev/null`.

- [ ] **T3.1:** `VERIFY_ATTEMPT` — `bkit-build.md` Step 6. Derive at `:526` (replacing `Increment VERIFY_ATTEMPT + 1`), re-derive in the `:538` write block, route at `:563` with `counter_current "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN"`. Preserve the `>` comparison against `MAX_VERIFY_ATTEMPT`.
  - **Done when:** `grep -n 'Increment .VERIFY_ATTEMPT' .bkit/workflows/bkit-build.md` returns nothing; the `:563` block contains `counter_current`, `--sub-plan`, no `2>/dev/null`, and the routing list has an `any other exit` → Failure Path line; `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` still passes.
- [ ] **T3.2:** `TEST_ATTEMPT` — `bkit-build.md` Step 13 (`:911` derive, `:936` write, `:960` route, step `build-run-tests`).
  - **Done when:** the `:960` block matches the per-site shape verbatim (no `2>/dev/null`, `counter_current`, `any other exit` line); `grep -n 'Increment .TEST_ATTEMPT' .bkit/workflows/bkit-build.md` returns nothing.
- [ ] **T3.3:** `CHALLENGE_REMEDIATE_ATTEMPT` — `bkit-build.md` Steps 10-11. Replace the literal-`1` prose gate (`:780-783`, `:804`) with two fenced `decide_next` blocks (one per verdict branch: CONCERNS → exceeded `step-13`; FAIL → exceeded `failure-path`), each deriving `counter_current "$STATUS" build build-challenge-remediate` and comparing against `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` (idiom precedent: `bkit-debug.md:192-193`). Derive at `:806`; re-derive in the `:818` write block. Keep the verdict branches themselves in prose.
  - **Done when:** `grep -nE 'CHALLENGE_REMEDIATE_ATTEMPT.*(<|>=) 1' .bkit/workflows/bkit-build.md` returns nothing; `grep -rn 'MAX_CHALLENGE_REMEDIATE_ATTEMPT' .bkit/workflows/` returns >=1 hit inside a fenced block (the constant is no longer dead); routing behaviour is unchanged (0 prior remediations → Step 11; 1 → Step 13 / Failure Path per verdict).
- [ ] **T3.4:** `DEBUG_ATTEMPT` — `bkit-debug.md` Step 8. Move the `:180-181` fold **into** the `:187-194` routing block so the value is derived and consumed in one process; **preserve the cross-run scoping verbatim** (`[.[] | select(.workflow=="debug")] | last.debugAttempt // 0`) and add a comment stating that this counter is an invocation index and must NOT be scoped to the active run (that would permanently disable SOAK escalation). Keep `THRESHOLD=$((MAX_DEBUG_ATTEMPT - 1))`. Drop `2>/dev/null`; add the `any other exit` line.
  - **Done when:** the `decide_next DEBUG_ATTEMPT` block itself contains the `debugAttempt` fold (no cross-block `$DEBUG_ATTEMPT` read); the comment contains `invocation` and `NOT active-run`; `grep -c 'select(.workflow=="debug")] | last.debugAttempt' .bkit/workflows/bkit-debug.md` >= 1.
- [ ] **T3.5:** `NORMAL_ATTEMPT` — `bkit-debug.md` Step 3 (`:372` derive, `:400` write, `:424` route, step `debug-run-tests`) **plus the 3 sites the issue's table omits**: `:417`, `:418` and `:802` compare `NORMAL_ATTEMPT` against a literal in prose. Convert each to a fenced derive + comparison; keep the PASS/FAIL verdict branch in prose.
  - **Done when:** `grep -nE 'NORMAL_ATTEMPT.*(>|=) 1' .bkit/workflows/bkit-debug.md` returns nothing outside a fenced block; Step 8's `Run only if` at `:802` reads from a fenced derive; `grep -n 'Increment .NORMAL_ATTEMPT' .bkit/workflows/bkit-debug.md` returns nothing.
- [ ] **T3.6:** `SOAK_ATTEMPT` — `bkit-debug.md`. Append a marker at **both** mid-run SOAK entries (`:427-434`, replacing `counter_reset SOAK_ATTEMPT`; and `:661`, the diagnose-driven `Mode: SOAK` switch): `jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-meta", workflow:"debug", at:$t, soakEntryAt:$t}' >> "$STATUS"` — modelled on the existing `debugAttempt` marker at `:332`. Derive at `:744`; re-derive in the `:756` write block (`soakAttempt`); route at `:440` with `counter_current "$STATUS" debug debug-failure-soak --since soakEntryAt`. Invocation-start SOAK (`:185-186`, `:194`) needs no marker — a fresh run has no soak rows.
  - **Done when:** `grep -c soakEntryAt .bkit/workflows/bkit-debug.md` = 3 (two writers + the `--since` reader); `grep -n counter_reset .bkit/workflows/bkit-debug.md` returns nothing; T2.8 passes against the real workflow's marker shape.
- [ ] **T3.7:** `MERGE_ATTEMPT` — `bkit-ship.md` (`:519` derive, `:562` write, `:586` route, step `ship-merge-pr`). Remove `Set MERGE_ATTEMPT = 0` at `:286`.
  - **Done when:** `grep -nE 'Increment .MERGE_ATTEMPT|Set .MERGE_ATTEMPT. = 0' .bkit/workflows/bkit-ship.md` returns nothing; the `:586` block matches the per-site shape.
- [ ] **T3.8:** **(LAST in WS-3 — do not start until T3.1–T3.7 are all `[x]`)** Harden `check_max` + `decide_next` in `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`: reject empty / non-integer value **and** max (`case … in ''|*[!0-9]*)`) → stderr diagnostic + `return 2`, printing nothing on stdout. Confirm zero `2>/dev/null` remain on any counter-bus call site.
  - **Done when:** `npx bats tests/counter-failclosed.bats` goes **green** (it was RED at Gate 2a); `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` = 0; every routing list in the 3 workflows has an `any other exit` → Failure Path line (`grep -rc 'any other exit' .bkit/workflows/bkit-{build,debug,ship}.md` >= 1 each).
- [ ] **T3.9:** Re-run the full bats corpus against the converted tree.
  - **Done when:** `npx --yes bats tests/*.bats` exits 0 with >0 tests; `red-vs-dev.txt` still shows the same suite failing against `dev` (the file is evidence, not a test — do not regenerate it).

### WS-4 — Prose stops assigning counters

- [ ] **T4.1:** Remove every prose counter statement: `bkit-build.md:316` (`Init counters:`), `:470` (`Reset VERIFY_ATTEMPT = 0 at start of each SUB_PLAN` — now structural, the `subPlan` filter does it), `:526`, `:806`, `:911`; `bkit-debug.md:306` (`Init counters:`), `:372`, `:744`; `bkit-ship.md:286`, `:519`.
  - **Done when:** `grep -rniE 'init counters|increment .(VERIFY|TEST|CHALLENGE_REMEDIATE|NORMAL|SOAK|MERGE)_ATTEMPT|reset .(VERIFY|SOAK)_ATTEMPT' .bkit/workflows/` returns nothing.
- [ ] **T4.2:** Rewrite the dependent prose: Gate checklists (`bkit-build.md:367`, `:571`, `:841`, `:968`; `bkit-debug.md:243`, `:358`, `:448`, `:784`; `bkit-ship.md:338`, `:594`) — `"Verify attempt incremented (VERIFY_ATTEMPT + 1)"` → `"Verify attempt derived from status.jsonl (active run, this sub-plan)"`; Limits notes (`bkit-build.md:49`, `bkit-debug.md:49-50`, `bkit-ship.md:49`) — drop the bare counter names and the `>=` comparisons, keep the `MAX_*` constant names + config path; Failure Path triggers (`bkit-build.md:89`, `bkit-debug.md:90`, `bkit-ship.md:93`) — keep the `MAX_*` names (allowed), remove any bare counter name.
  - **Done when:** every bare `X_ATTEMPT` outside a fenced block in the 5 workflows is either `{X_ATTEMPT}` or `MAX_X_ATTEMPT`; verified by T5.1's audit going green.

### WS-5 — Widen the prose audit (and prove it fires)

- [ ] **T5.1:** Rewrite `.bkit/src/bkit-counter-prose-audit.test.ts`'s patterns: ban any bare `\b[A-Z][A-Z0-9_]*_ATTEMPT\b` outside a fenced block, exempting (a) `{X_ATTEMPT}` brace placeholders and (b) `MAX_`-prefixed constant **names**. Add a **negative control** `describe` asserting the pattern matches the four known-bad literals (`Init counters: \`VERIFY_ATTEMPT\` = 0`, `Increment \`TEST_ATTEMPT\` + 1`, `\`CHALLENGE_REMEDIATE_ATTEMPT\` < 1`, `\`NORMAL_ATTEMPT\` > 1`) and does NOT match `{VERIFY_ATTEMPT}`or`MAX_TEST_ATTEMPT`. Delete `ATTEMPT_COMPARISON_PATTERN`and`MAX_LITERAL_DEFINITION_PATTERN`.
  - **Done when:** the negative-control tests pass (proving the pattern fires — the shipped one matched nothing); the corpus tests pass over all 5 workflows; re-introducing `Init counters: \`TEST_ATTEMPT\` = 0`into`bkit-build.md` reds the suite (verify by temporary edit, then restore).
- [ ] **T5.2:** Add the no-dead-constant rule: parse every `MAX_\w+=` from `bkit-counter-bus-config.sh` and assert each name appears >=1 time **inside a fenced block** across `.bkit/workflows/*.md`.
  - **Done when:** the test enumerates all 7 constants dynamically (no hardcoded list) and passes; deleting the `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference added in T3.3 reds it.

### WS-6 — Delete the inert primitives (LAST — constraint 5)

- [ ] **T6.1:** Delete `counter_init`, `counter_inc`, `counter_get`, `counter_reset` and every `BKIT_COUNTER_*` reference from `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`; update its header contract block to document only `counter_count` / `counter_next` / `counter_current` / `check_max` / `decide_next`.
  - **Done when:** `grep -rn 'counter_init\|counter_inc\|counter_get\|counter_reset\|BKIT_COUNTER_' .bkit/templates/ .bkit/workflows/` returns nothing.
- [ ] **T6.2:** Prune `tests/counter-bus.bats` §1-4, §8's primitive cases and §9 (retain and extend §5-7). Update `EXPECTED_FUNCTIONS` in the prose audit to the new five and add a rule asserting the four primitives are **absent** from `.bkit/` and `tests/`.
  - **Done when:** `npx --yes bats tests/*.bats` exits 0 with >0 tests; `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` passes; `grep -rn 'counter_init\|counter_inc\|counter_get\|counter_reset\|BKIT_COUNTER_' .bkit/ tests/ --include='*.sh' --include='*.bats' --include='*.md'` returns nothing.

### WS-7 — Honest provenance on emitted counter rows

- [ ] **T7.1:** At all 5 close-workflow emitters (`bkit-build.md:1191-1199`, `bkit-debug.md:948-956`, `bkit-ship.md` ~`:999-1007`, `bkit-plan.md` ~`:755-763`, `bkit-design.md` ~`:759-767`) replace `--argjson counterValue 1` with a fold-derived value — the count of `workflow-started` events for that workflow in `status.jsonl` (the invocation index; `bkit-debug.md` may reuse its existing `debugAttempt` fold) — and `--arg counterSource "model-self-report"` with `"shell-bus"`. Keep the append best-effort (`|| echo "[bkit-telemetry] append failed: $STATS"`).
  - **Done when:** `grep -rc 'model-self-report' .bkit/workflows/` = 0 across all files; each emitter's `counterValue` comes from a `$(jq …)` capture, not a literal; a prose-audit rule asserts both facts; one manual run appends a `counter` row with `counterSource:"shell-bus"` and a value matching the run count.

### WS-8 — Docs, ledgers, regeneration

- [ ] **T8.1:** Update `.bkit/workflows.md` (§ Authoring Checklist `:1194`, § Status) and `docs/testing.md` (repo-local section only — never the managed block) per § Documentation Updates. Rewrite prose; no lazy bullet appends.
  - **Done when:** `.bkit/workflows.md:1194` no longer says only _"Loops cap at `MAX_*_ATTEMPT` constants"_ but states counters are derived per-block from `status.jsonl`; `docs/testing.md` carries the cross-process rule + the 2 new bats rows; `git diff docs/testing.md` shows zero changes between `<!-- bkit:start -->` and `<!-- bkit:end -->`.
- [ ] **T8.2:** **Verify only — the 5 ledger rows were written at plan time; do NOT re-append** (a duplicate `key` with nothing changed is a dedup violation per `.bkit/jsonl.md` § Identity / Dedup). Confirm the 2 `decision` rows (`58-status-fold-sourced-once-from-shared-script`, `58-prose-audit-bans-bare-attempt-names-allows-brace-placeholders`) and the 3 `deferral` rows (`58-test-verdict-scope-arg-accepts-empty-silently`, `58-prior-strategy-all-runs-scoping-unresolved`, `58-no-shellcheck-gate-over-bkit-scripts`) survived any rebase. **If** implementation contradicted a recorded decision → append a same-`key` update row (never edit the original line).
  - **Done when:** `jq -sr '[.[] | select(.key | startswith("58-"))] | length' docs/decisions.jsonl` = 3 (2 new + the parent `58-workflow-attempt-counters-derived-…`) and `= 3` for `docs/deferrals.jsonl`; `jq -c . docs/decisions.jsonl docs/deferrals.jsonl >/dev/null` exits 0 (every row well-formed, one per line); no `key` appears twice with identical content.
- [ ] **T8.3:** **Batched regeneration — run ONCE, at the end.** `pnpm bkit install` (regenerates `.bkit/scripts/*.sh` from templates, re-stamps `.bkit/version` canonicalHashes incl. the new `bkit-status-fold.sh`, re-renders `.claude/` / `.cursor/` / `.opencode/` mirrors) → `git config core.bare false` (install flips it) → `pnpm bkit check`.
  - **Done when:** `pnpm bkit check` exits 0; `.bkit/version` contains a `.bkit/scripts/bkit-status-fold.sh` hash; `.bkit/scripts/bkit-counter-bus.sh` is byte-identical to its template (`diff .bkit/templates/.bkit/scripts/bkit-counter-bus.sh .bkit/scripts/bkit-counter-bus.sh` is empty); `git status --porcelain` shows the mirror trees updated.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every task T1.1–T8.3 independently verified and checked off against the plan.
- [ ] **KN-26 pair intact:** T3.8 (fail-closed) is committed **after** T3.1–T3.7 (derivation) and in the same PR. No commit exists where the guard fails closed without a derived value behind it.
- [ ] **Deletion ordering intact:** T6.1 ran only after every call site was converted (`grep` for `counter_reset` in `.bkit/workflows/` returned nothing before deletion).

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** All 14 rows have a corresponding task checked off (T1.3, T2.2–T2.8, T5.1, T5.2, T6.2, T7.1, T8.3). Add tasks if any row is uncovered.
- [ ] **Update existing tests:** `tests/counter-bus.bats` pruned to the retained sections (T6.2); `.bkit/src/bkit-counter-prose-audit.test.ts` rewritten (T5.1, T5.2, T6.2, T7.1).
- [ ] **Write new tests:** `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`. Every boundary suite reaches the real boundary (`status.jsonl` on disk, real `git`, real process boundaries) and asserts a ground-truth signal (a specific derived integer / exit code / empty stdout) — never "did not throw".
- [ ] **Verify observability:** Every new diagnostic carries the `[bkit-telemetry]` prefix (log-drain grep). Telemetry appends stay best-effort and never gate a workflow. `decide_next`'s exit-2 diagnostic reaches stderr at every call site (no `2>/dev/null`).
- [ ] **Update documentation:** `.bkit/workflows.md` + `docs/testing.md` rewritten (T8.1); `docs/decisions.jsonl` + `docs/deferrals.jsonl` appended (T8.2). Docs and code land in the same change — never as a follow-up.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in § Documentation Updates completed. `.agents/docs.md` still accurate (no new doc file → no new index row).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` + `pnpm format:check` + `pnpm lint:slop` + `pnpm lint:prose`.
- [ ] **Slop delta:** `pnpm slop:delta` — net-new findings only. The new shell helpers add no try/catch; if `defensive.error-obscuring` rises, use non-throwing forms rather than suppressing the rule.
- [ ] **Test Synchronization:** `tests/counter-bus.bats` (pruned, T6.2) and `.bkit/src/bkit-counter-prose-audit.test.ts` (rewritten) must be updated **in the same commit** as the code they assert, or the suite reds mid-sequence.
- [ ] **Build Configuration:** No new mock files or test configs; no `tsconfig.json` `exclude` change needed (bats files are not TS).
- [ ] **Shell suites (`tests/*.bats`):** `npx --yes bats tests/*.bats` — auto-gated in CI's `bkit-tests-unit` lane (`ci.yml:500-502`), no CI wiring needed.
- [ ] **Vitest (`.bkit/src/bkit-status-fold.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`):** `pnpm test`. Unit lane is branch-coverage-gated at 65 — confirm no regression.
- [ ] **Portability:** re-run `tests/counter-failclosed.bats` under `sh`, `bash`, `dash` and `zsh` (the shells the issue reproduced the fail-open on). All four must refuse the unset counter.
- [ ] **Drift:** `pnpm bkit check` exits 0 after the single batched `pnpm bkit install` (T8.3).
- [ ] **Run all tests:** `pnpm test` + `npx --yes bats tests/*.bats`. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades**: If you hit build/compiler/test errors during verification, NEVER resolve them via hot fixes or anti-patterns. In particular: do NOT re-add `2>/dev/null` to silence a stderr diagnostic, do NOT default a failed derivation to `0`, and do NOT weaken the prose audit to make a stubborn line pass. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results) gathered — including `red-vs-dev.txt`.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `npx bats`, `jq`) to verify pipelines instead of asking users to check dashboards.

- [ ] **Step 1 — The tests fail against `dev` (the acceptance's load-bearing claim):** `git show dev:.bkit/scripts/bkit-counter-bus.sh > /tmp/dev-bus.sh && BKIT_COUNTER_BUS=/tmp/dev-bus.sh npx bats tests/counter-failclosed.bats`. Confirm the unset-counter case FAILS: `dev` prints `step-14` and exits 0 (retry, cap ignored) where the suite demands empty stdout + exit 2. Compare against `red-vs-dev.txt`.
- [ ] **Step 2 — End-to-end derivation in a real log:** in a scratch dir, seed a `status.jsonl` with one `workflow-started` row, then run the Step 13 derive → write → route blocks as **three separate `bash -c` invocations** four times over, each with a distinct `parentSha`. Confirm the printed sequence is `1, 2, 3, failure-path` and that `[bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)` appears on stderr.
- [ ] **Step 3 — Resume:** kill the loop after attempt 2, start a fresh shell, run only the derive block. Confirm it prints `3` with no restored state.
- [ ] **Step 4 — Active-run scoping:** append a `workflow-done` + a fresh `workflow-started` to the same log. Confirm the derive block prints `1` (fresh budget) while the shipped `PRIOR_STRATEGY` expression over the same file still returns the prior run's `strategy` — the intended asymmetry, observed rather than assumed.
- [ ] **Step 5 — Provenance:** `jq -r 'select(.kind=="counter") | .counterSource' .bkit/stats.jsonl | sort | uniq -c` after one workflow close. Confirm the new row reads `shell-bus` and its `counterValue` matches the run count in `status.jsonl`. Historical `model-self-report` rows remain (append-only; they are the record of the defect).
- [ ] **Step 6 — Consumer surface:** `pnpm pack` → install the tarball into a fresh scratch consumer → `bkit install` → confirm `.bkit/scripts/bkit-status-fold.sh` lands, `bkit check` exits 0, and the installed `bkit-counter-bus.sh` carries no `counter_init`.
- [ ] **Step 7 — CI:** after push, `gh run watch` → `bkit-tests-check` green. Confirm the bats step reports the new suites (`gh run view --log | grep counter-derive`), not a silent zero.
