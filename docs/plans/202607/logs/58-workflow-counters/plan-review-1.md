Verdict: FAIL
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

## Verification of the draft's four claimed corrections

All five checked against the tree, not taken on trust. **Four verify cleanly; one is right but under-stated.**

<!-- prettier-ignore -->
| # | Draft's claim | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Shipped prose audit is VACUOUS, not narrow | **CONFIRMED** | `bkit-counter-prose-audit.test.ts:89-90`. Alternation splits top-level into `\bATTEMPT\b.*(<=\|>=\|<\|>)\s*`?MAX_`and`MAX_\w+\s*(<=\|>=\|<\|>)\s*\d`. Alt-1: `\bATTEMPT\b`cannot match inside`VERIFY_ATTEMPT` (`_`is a word char → no boundary). The only corpus line where`\bATTEMPT\b`*does* match is`bkit-build.md:472` (`{step}-{SUB_PLAN}-{ATTEMPT}.md`) — no comparison, so alt-1 still cannot fire. Alt-2: grep for `MAX_\w+\s*(<=\|>=\|<\|>)\s*\d`returns **zero** matches corpus-wide. Both`describe` blocks pass by matching nothing. Claim holds. |
| 3 | `DEBUG_ATTEMPT` already derived, must stay CROSS-run | **CONFIRMED** | `bkit-debug.md:180-181` — `[.[] \| select(.workflow=="debug")] \| last.debugAttempt // 0` then `+1`. `.[]` = all runs. Consumed at `:194` in a _different_ fenced block. The plan's read of the actual defect (cross-block, not cross-run) is correct. |
| 4 | Issue's 7-site table misses 3 sites | **CONFIRMED** | `bkit-debug.md:417` (`NORMAL_ATTEMPT` > 1), `:418` (`= 1`), `:802` (`> 1`) — prose comparisons against literals. Real, and the widened audit would flag them. |
| 5 | FOLD blob is 5 workflows / 15 sites, not 3 | **CONFIRMED** | `FOLD='def lastIdx` count: build 4, debug 4, ship 3, plan 2, design 2 = **15 / 5 files**. Matches the Supersession Inventory exactly. |
| 2 | "No `*_ATTEMPT` in prose" literally unachievable (~40 placeholders) | **DIRECTIONALLY RIGHT, COUNT SOFT** | 106 lines match `\{[A-Z][A-Z0-9_]*_ATTEMPT\}`, of which 44 are `${X_ATTEMPT}` shell expansions → ~62 lines carry a non-`$` brace placeholder (some fenced). "Roughly 40" is a plausible prose-only estimate but was not established. See OPTIONAL-1 for the exemption-regex consequence. |

Other spot-checks, all accurate: `bkit-build.md:316` / `:367` / `:470` / `:526` / `:780,782` / `:804` / `:806` / `:911`; the literal-`1` challenge gate; `bkit-counter-bus.sh:27-62` primitives; 7 `MAX_*` in config (the shipped audit's `EXPECTED_CONSTANTS` lists only 6 — omits `MAX_CHALLENGE_REMEDIATE_ATTEMPT`, consistent with constraint 6); the 5 `counterValue 1` / `model-self-report` emitters at the exact cited lines; `ci.yml:500-502` `npx --yes bats tests/*.bats`; all 5 ledger keys present (`decisions.jsonl:36,37,38`, `deferrals.jsonl:31,32,33`), so T8.2's `= 3`/`= 3` assertions are correct. The plan also correctly silently repaired the issue's stale `bkit-build.md:909` → `:911`.

**Scope discipline: clean.** Nothing the issue fenced off has leaked in. Verdict semantics stay prose (T3.3/T3.5 explicitly keep the verdict branch); no step-ID/artifact-format renames (`FOLD` → `BKIT_STATUS_FOLD` is a shell variable); no `counterSource` enum member added (#234 preserved); `TEST_VERDICT`/`TEST_SCOPE` `--arg` gap deferred with a ledger row. `CI_ATTEMPTS` is correctly excluded with a stated reason (block-local, never crosses a process boundary) — verified. WS-1's extension to `bkit-plan.md`/`bkit-design.md` beyond the issue's stated 3 workflows is an expansion, but justified and declared in the Supersession Inventory; leaving 4 copies would defeat the single-source premise the issue itself endorses.

## CRITICAL

### C1 — 12 of 18 `--argjson` counter sites are neither converted nor enumerated; acceptance bullet 2 is uncovered and no test can detect it

The plan's central acceptance criterion — _"No counter value originates in orchestrator context — every one is read from `status.jsonl` at the point of use"_ (issue § Acceptance; restated as the plan's own Success Criterion #2) — is covered for **6 of 18** sites.

Full corpus of `--argjson {a,sa} "$*_ATTEMPT"` (verified):

<!-- prettier-ignore -->
| File:line | Counter | Task? |
| --- | --- | --- |
| `bkit-build.md:538` | `VERIFY_ATTEMPT` | T3.1 ✅ |
| `bkit-build.md:612` | `VERIFY_ATTEMPT` | ❌ **not in any task, and absent from the plan's own "Verified sites" list** |
| `bkit-build.md:716` | `CHALLENGE_REMEDIATE_ATTEMPT` | ❌ listed as a "challenge row" in the existence-check, no task converts it |
| `bkit-build.md:761` | `CHALLENGE_REMEDIATE_ATTEMPT` | ❌ same |
| `bkit-build.md:818` | `CHALLENGE_REMEDIATE_ATTEMPT` | T3.3 ✅ |
| `bkit-build.md:936` | `TEST_ATTEMPT` | T3.2 ✅ |
| `bkit-build.md:1006` | `TEST_ATTEMPT` | ❌ not listed anywhere |
| `bkit-build.md:1056` | `TEST_ATTEMPT` | ❌ not listed anywhere |
| `bkit-debug.md:400` | `NORMAL_ATTEMPT` | T3.5 ✅ |
| `bkit-debug.md:570` | `DEBUG_ATTEMPT` | ❌ not listed |
| `bkit-debug.md:643` | `NORMAL_ATTEMPT` | ❌ not listed |
| `bkit-debug.md:697` | `NORMAL_ATTEMPT` | ❌ not listed |
| `bkit-debug.md:756` | `NORMAL_ATTEMPT` (`a`) + `SOAK_ATTEMPT` (`sa`) | ⚠️ T3.6 covers `sa` only; `a` uncovered |
| `bkit-debug.md:808` | `NORMAL_ATTEMPT` | ❌ T3.5 converts the `:802` _prose_, not `:808`'s write |
| `bkit-ship.md:562` | `MERGE_ATTEMPT` | T3.7 ✅ |
| `bkit-ship.md:625` | `MERGE_ATTEMPT` | ❌ not listed |
| `bkit-ship.md:685` | `MERGE_ATTEMPT` | ❌ not listed |

Confirmed by reading two of them: `bkit-build.md:608-615` (Step 6 sub-step 22) and `:1002-1009` (Step 14 sub-step 6) are each a **separate fenced block** that reads `$VERIFY_ATTEMPT` / `$TEST_ATTEMPT` with no derive in-block, and uses the value three times (`--argjson a`, the `artifacts` path, the commit subject). Shell state does not survive between orchestrator Bash calls — so every one of these is precisely the model-remembered-and-typed number the issue was filed to delete.

This is not my inference against the plan's design; the plan's own governing artifact says so. `docs/decisions.jsonl:36` (ACTIVE, the contract the plan states it implements) reads: _"Every fenced block needing the value RE-DERIVES it"_ and _"the `--argjson` guard at the **20 status-write sites** cannot catch a miscount either."_ The decision record names 20 sites; the runbook converts 6. **Design-coverage failure: a load-bearing clause of the ACTIVE decision maps to no task.**

Worst property: **nothing in the plan can catch this.** The prose audit strips fenced blocks (`stripFencedBlocks`, `:36-40`), so these sites are invisible to T5.1/T5.2. T7.1's provenance rule only inspects the 5 `counter` telemetry rows. T3.8's hardening doesn't help — `--argjson` already hard-fails on empty, so an unsubstituted value aborts loudly rather than routing wrong; the surviving defect is the _miscount_, which is valid JSON. So the plan can reach Gate 4 fully green with 12 of 18 counter values still model-authored, and the widened audit will certify the migration complete on that basis. **That is the exact failure class the plan itself indicts in Breaking Changes item 6** ("the test does not merely assert the shape that was built, it asserts nothing") — reproduced one level up.

**Patch:**

1. Enumerate all 18 sites in WS-3 (add tasks or fold into the existing per-counter tasks), each with the three-position shape. Note `:612`, `:1006`, `:1056`, `:643`, `:697`, `:625`, `:685` write a row for a _different_ step than the counter they record (e.g. `:612` writes a `build-plan-gaps-remediate` row carrying `attempt: $VERIFY_ATTEMPT`) — so the derive is `counter_current "$STATUS" build build-plan-verify --sub-plan N`, not the row's own step. The per-site shape in WS-3 currently assumes `step == counter's step`; state the mapping explicitly per site.
2. Add the enforcing test that makes the criterion self-policing (Derived Test Matrix row + task): **no fenced block may reference `$X_ATTEMPT` unless the same block also derives it** (`counter_next`/`counter_current`/an inline fold). A block-scoped scan over the 5 workflows. Without this row the criterion has no automated proof at all.
3. `bkit-debug.md:570` (`--argjson a "$DEBUG_ATTEMPT"`) needs the cross-run fold re-derived in-block, matching T3.4's treatment of `:194`.

### C2 — T4.1/T4.2's prose list is hand-enumerated, not derived from the audit rule; T5.1 and T3.4 cannot both go green as written

The plan bans "any bare `X_ATTEMPT` token outside a fenced block" (Breaking Changes item 5; enforced by T5.1). But the removal tasks enumerate line numbers by hand, and the enumeration is provably incomplete. Verified prose sites carrying a bare counter name that **no task touches**:

- `bkit-debug.md:175` — "Extract `PRIOR_DEBUG_ATTEMPT` … and set this invocation's `DEBUG_ATTEMPT`:" (two bare names)
- `bkit-debug.md:186` — "any `debug-failure-soak` step recorded for the current `DEBUG_ATTEMPT`"
- `bkit-debug.md:187` — "run counter-bus routing for `DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` check"
- `bkit-debug.md:434` — "→ set `DEBUG_MODE` = SOAK, `SOAK_ATTEMPT` reset to 0 → Step 4."

`:434` also slips T4.1's own grep: the pattern is `reset .(VERIFY|SOAK)_ATTEMPT`, but the line reads "`SOAK_ATTEMPT` reset to 0" (operand first). `:661` ("reset `SOAK_ATTEMPT` = 0") matches; `:434` does not.

**Direct contradiction:** T3.4's Done-when preserves the `DEBUG_ATTEMPT` fold and its surrounding step, saying nothing about `:175`/`:186`/`:187`'s prose; T5.1's Done-when requires "the corpus tests pass over all 5 workflows". Both cannot hold. Whichever runs second reds, and the standing temptation at that point is to weaken the audit — which the plan's own "No Architectural Downgrades" note explicitly forbids.

`:186` is not cosmetic: "any `debug-failure-soak` step recorded for the current `DEBUG_ATTEMPT`" is a real semantic dependency (SOAK detection at invocation start) that must be expressed as a derive, and the plan never says what it becomes.

**Patch:** invert the method. Make T4.x's Done-when _"T5.1's audit is green over all 5 workflows"_ and generate the removal list by running the widened audit, rather than hand-listing line numbers. Add explicit sub-tasks for `bkit-debug.md:175`, `:186`, `:187`, `:434`. Sequence T5.1 (pattern) before T4.x (removal) so the audit produces the worklist — the plan currently has WS-4 before WS-5.

### C3 — Template violation: the design-missing fallback is mandatory and was not applied; the Narrative is agent-authored but labelled "verbatim … NOT fabricated"

There is no parent design (plan-input: _"Parent design: None (standalone)"_). `docs/plans/template.md:46` is unambiguous:

> **Design-missing fallback:** If `{FID}-design.md` is absent or has no `## Acceptance Scenario` section, replace the inherited Narrative and Success Criteria fields with `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`. Do NOT fabricate either field; gate-1 stays blocked until human fills both.

The draft instead writes a synthesised narrative and labels it _"taken verbatim from issue #58 § Goal + § Design, per the design-missing fallback; NOT fabricated"_. Three problems:

1. It is **not** "per the design-missing fallback" — the fallback mandates a specific blocking string. The plan does the opposite of what it cites.
2. It is **not verbatim**: "An engineer runs `/bkit-build` on a feature whose tests keep failing…" appears nowhere in issue #58. It is a good synthesis, but agent-authored — i.e. "fabricated" in the template's sense (not human-provided). The Success Criteria _are_ near-verbatim from § Acceptance; that half is fair.
3. The false label lands in a **human-sign-off section**, where its whole function is to tell the reviewer what they are being asked to warrant. A reviewer reading "verbatim … NOT fabricated" will under-scrutinise the one field they are the sole check on.

This compounds with Breaking Changes item 5, where the plan (correctly, and to its credit) narrows a stated acceptance criterion and asks for sign-off. Narrowing an acceptance criterion is exactly what the fallback's "gate-1 stays blocked until human fills both" exists to force through a human.

**Patch (cheap):** either (a) apply the fallback literally and let the human supply the Narrative, or (b) keep the synthesised text but relabel honestly — `⚠️ No design doc; Narrative is agent-synthesised from issue #58 § Goal, NOT human-provided — confirm or replace` — and state the template deviation in Breaking Changes so it is signed off, not asserted. Do not leave a "per the fallback / NOT fabricated" claim that the template contradicts.

## OPTIONAL

1. **Exemption regex must exclude `${X_ATTEMPT}` (T5.1).** 44 of the 106 brace-placeholder lines are `${X_ATTEMPT}` shell expansions. An exemption written as "`{X_ATTEMPT}` is allowed" would also exempt `${TEST_ATTEMPT}` — a model-substituted _value_ reference — if one ever reaches prose. Require the placeholder exemption to be negative-lookbehind on `$` and add a negative-control case asserting `${TEST_ATTEMPT}` in prose is **caught**, not exempt. Also fix the item-5 count: ~62 lines carry a non-`$` brace placeholder, not "roughly 40" — the estimate was inherited, not measured.

2. **T1.1/T1.3 hardcode `1079` bytes / md5 `d04a2499…` inherited from the issue without establishing what was measured.** The Done-when measures the _value_ (`printf "%s" "$BKIT_STATUS_FOLD" | wc -c`), but the issue's figure may have measured the whole `FOLD='…'` assignment line (the wrapper `FOLD='` + closing `'` is 7 bytes). If so, both Done-whens are unsatisfiable as written and T1.1 stalls on a false constant. Have T1.1 _measure_ the extracted value first and record the invariant, then have T1.3 assert the measured figure. Given the plan's own lens on inherited-and-unverified constants, this one should not be inherited.

3. **Edge-case row conflates resume with re-invoke — they behave oppositely.** `bkit-build.md:334-337` appends `workflow-started` **only if** the latest run is not an `IN_PROGRESS` build. So: resume of a killed run → no new `workflow-started` → active-run scoping continues the count (Concrete Example step 5's "derives 3" is **correct**, and issue acceptance bullet 5's "no fresh budget" holds); re-invoke after DONE/FAILED → new run → fresh budget (also correct). The Edge Cases row labels a single row "(resume / re-invoke)" and states "a fresh budget", which contradicts the Concrete Example and reads as a violation of acceptance bullet 5. Split into two rows with the `:334-337` mechanism named. T2.2 already covers resume structurally (sequential `bash -c` over one IN_PROGRESS run), so this is wording, not coverage.

4. **Unaddressed risk to active-run scoping: the `workflow-started` condition keys on the last run _overall_, not the last _build_ run.** `bkit-build.md:335` tests `(.[-1] // {})` — if a `debug` run interleaves in the same `status.jsonl` (it writes to the same `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`) and finishes, a resuming build sees `.[-1].workflow == "debug"` → appends a fresh `workflow-started` → **new run → attempt budget silently resets**. That is Defect 3 by a side door, reachable through the very build→debug→build path this feature governs. I have not proven the interleave occurs (a lock exists at `:143`), so I am flagging rather than asserting — but the derivation now makes `:335` load-bearing, and the plan neither tests nor rules it out. Add an edge case + a fixture (`build IN_PROGRESS`, `debug` run appended, resume build → must derive N+1, not 1), or state explicitly why the interleave is impossible.

5. **Derived Test Matrix row count is 13, not 14.** Gate 2's "All 14 rows have a corresponding task checked off (T1.3, T2.2–T2.8, T5.1, T5.2, T6.2, T7.1, T8.3)" lists 1 + 7 + 5 = 13 tasks against 13 rows. Off-by-one in a mandatory self-check — an agent verifying literally will hunt for a 14th row.

6. **Template: `### Database Migrations` (template `:232`) is dropped entirely.** The substance is handled (Data Schema Integration says "No database"; Rollback says "DB | N/A"), but strict conformance wants the heading with an explicit "None — no database". The template's `### Spec — what good looks like` block is likewise absent; it is subagent guidance and arguably drops on render, but call it out rather than leave it ambiguous.

7. **T3.3's `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` yields `THRESHOLD=0`** (`MAX_CHALLENGE_REMEDIATE_ATTEMPT=1`, config `:14`). Then `decide_next` compares `count > 0`. That reproduces the `< 1` gate correctly, but `0` is a degenerate threshold and interacts with T3.8's `case … in ''|*[!0-9]*)` guard — confirm `0` is accepted as a valid max (it is a non-negative integer, so the stated `case` passes it) and add an explicit T2.7 case for `MAX=0`, since it is the only live zero-threshold in the corpus and a plausible place for a "reject falsy max" reflex to creep in.

## OUT OF SCOPE

Not applied to the plan; recorded for the orchestrator.

1. **`PRIOR_STRATEGY`'s all-runs read (`bkit-build.md:593`, `:988`; `bkit-debug.md:624`; `bkit-ship.md:665`)** — correctly deferred with a ledger row (`58-prior-strategy-all-runs-scoping-unresolved`). Verified as genuinely all-runs (`[.[] | .steps[] | …] | last`). Note `:593` additionally filters on `--argjson sp "$SUB_PLAN"` — so the build sub-plan strategy read is all-runs but sub-plan-scoped, a third scoping variant the plan's "two reads, deliberately opposite" framing doesn't name. Worth one clause in the T1.2 comment; not worth a task.

2. **No shellcheck gate over `.bkit/scripts/*.sh`** — correctly deferred (`58-no-shellcheck-gate-over-bkit-scripts`). The plan is right that actionlint only covers `run:` blocks. Adding the gate would newly lint the counter-bus and likely surface pre-existing findings — properly a separate change.

3. **`counterName` semantics at the 5 close-workflow emitters (T7.1).** T7.1 derives `counterValue` from the `workflow-started` count (the invocation index). Whether that matches each emitter's declared `counterName` (`DESIGN_ATTEMPT`/`PLAN_ATTEMPT`/`BUILD_ATTEMPT`/…) is #234's schema question, not this plan's. Flagging only so the value/name pairing isn't quietly assumed correct at implementation time.

4. **`tests/counter-bus.bats` single-`bash -c` shape.** The plan prunes §1-4/§8/§9 and retains §5-7. The retained sections still run `check_max`/`decide_next` inside one `bash -c`. That is legitimate for pure-function helpers (no state crosses), so no change needed — but if a future change gives those helpers file state, the retained sections inherit the same "green is not evidence" defect the plan diagnoses. Not this plan's problem.

---

## Assessment

The strongest plan-phase artifact I have reviewed against this codebase. Every one of the draft's five challenges to the issue's premises is correct — including the vacuous-regex finding, which is subtle (the alternation split matters) and which I confirmed independently, and the FOLD 15/5 count, which matches the tree exactly. Line references are accurate throughout, ledger rows genuinely exist, the KN-26 sequencing is respected with a hard gate, the RED-vs-`dev` proof is a real falsification step, and scope discipline against the issue's out-of-scope list is clean.

The failure is one of _reach_, not judgment: the plan diagnosed "every fenced block re-derives" and then enumerated call sites by hand, hitting 6 of 18 — and because the audit strips fenced blocks, nothing in the plan would have told anyone. C1 and C2 are the same root cause (hand-enumeration where a rule-derived list was needed) and the same fix shape: make the criterion self-policing, then let the tool produce the worklist. C3 is cheap but sits on the human-sign-off surface, where an inaccurate provenance label is the one thing a reviewer cannot catch for themselves.

FAIL per the mapping (source omission + template violation), not a re-think — three patches to a sound design.
