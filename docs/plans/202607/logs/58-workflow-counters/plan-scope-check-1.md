Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## Claims verified against the tree (all measured, none inherited)

| Claim                                                                   | Result                                                                                                                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 36 tasks / 36 `Done when`, one-to-one                                   | **TRUE** — 36 task lines, 36 `Done when` lines                                                                                                        |
| 30 draft tasks preserved + 6 new (T2.0, T2.9, T2.10, T3.0, T3.4b, T5.3) | **TRUE** — draft's 30 IDs all present in v2                                                                                                           |
| 15 template H2 sections, in order                                       | **TRUE** — exact match to `docs/plans/template.md` H2 order                                                                                           |
| Gates 1–4 intact + Gate 2b at the T3.1–T3.7 → T3.8 seam                 | **TRUE** — Gate 2b sits between T3.7 and T3.8                                                                                                         |
| 18 `--argjson` sites (build 8 / debug 7 / ship 3, 19 refs)              | **TRUE** — every line number in the plan matches the tree exactly                                                                                     |
| `CI_ATTEMPTS` ×3 correctly excluded                                     | **TRUE** — `bkit-build.md:1258` assigns, `:1312` consumes, same fenced block (ends `:1318`); never crosses a process boundary                         |
| 62 placeholder lines (build 26 / debug 26 / ship 10)                    | **TRUE** — exact                                                                                                                                      |
| 48 `${X_ATTEMPT}` expansions needing lookbehind                         | **TRUE** — 12 + 31 + 5 = 48 occurrences                                                                                                               |
| 17 matrix rows → 17 distinct tasks                                      | **TRUE** — bidirectional for the 17 named                                                                                                             |
| `deferrals.jsonl` 6 rows, T8.2 asserts 6                                | **TRUE** — lines 31–36; `decisions.jsonl` 3 × `58-` keys (36–38), T8.2 asserts 3                                                                      |
| Prose audit is vacuous as described                                     | **TRUE** — `\bATTEMPT\b` at `:89-90`; `EXPECTED_CONSTANTS` `:144-151` lists 6 of 7, omitting exactly `MAX_CHALLENGE_REMEDIATE_ATTEMPT` (config `:14`) |

No `Done when` was removed. One was narrowed (T6.2, draft `:459` → v2) — justified, but see CRITICAL 1–2.

## CRITICAL

**1. T6.2's `Done when` is unreachable at T6.2 — the plan's own installed-mirror fix was not extended to the Vitest suite.**

The plan's WARNING (`plan-v2-reviewed.md:396-407`) correctly diagnoses that test paths resolving to `.bkit/scripts/` (the installed mirror) cannot pass before T8.3's single batched `bkit install`, and repoints **the three bats suites** template-relative. It does not repoint `.bkit/src/bkit-counter-prose-audit.test.ts`, which carries the same defect at two reads:

```ts
const configPath = path.join(REPO_ROOT, ".bkit/scripts/bkit-counter-bus-config.sh"); // :143
const busPath = path.join(REPO_ROOT, ".bkit/scripts/bkit-counter-bus.sh"); // :166
```

T2.1 adds `counter_count`/`counter_next`/`counter_current` to the **template** only. T6.2 rewrites `EXPECTED_FUNCTIONS` to "the new five" and adds "a rule asserting the four primitives are **absent**" — both asserted against `busPath`, i.e. the installed mirror, which still lacks the new five and still carries the four primitives until T8.3. T6.2 < T8.3 in the runbook, so **both halves red and `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` passes`cannot hold at T6.2**. This is the exact failure the plan calls unpassable-gate for bats, and the pressure it creates is the prohibited per-edit`bkit install`.

`configPath` (`:143`) is benign today (T5.2 changes the config's comments only, so template and mirror both hold all 7 constants) but should move with it for consistency. Fix: give T5.1/T5.2/T5.3/T6.2 a template-relative default with the same override shape as T2.0 (`BKIT_COUNTER_BUS` / `BKIT_COUNTER_CONFIG`), or state that `EXPECTED_FUNCTIONS` asserts over `.bkit/templates/.bkit/scripts/`. T5.3/T5.1/T2.6/T7.1 scan `.bkit/workflows/` and are unaffected — the defect is localised to `configPath`/`busPath`.

**2. Derived Test Matrix row 15 asserts the scope T6.2 explicitly rejects — and the matrix is the declared authority.**

Row 15 (`:127`): _"Deleted primitives are gone and unreferenced: … appear in **zero** files under `.bkit/` and `tests/`"_. T6.2's `Done when` (`:604`) narrows this and says why: _"the grep targets the **sources**. `.bkit/scripts/*.sh` is a generated mirror that still carries the primitives until T8.3 — asserting over `.bkit/` wholesale (as the draft did) cannot pass before T8.3 and would push an implementer toward a per-edit `bkit install`, which is prohibited."_ The matrix row is the draft's un-narrowed text, carried forward. Gate 2's coverage bullet states _"if it ever disagrees with § Derived Test Matrix, **the matrix is authoritative**"_, so an implementer resolving the conflict by the plan's own rule reinstates precisely the defect T6.2 fixed. Fix: narrow row 15 to the source trees (`.bkit/templates/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`).

**3. "7 of the 18 sites" is wrong — it is 11 — and at 2 of the 4 it omits, T3.3's `Done when` carries none of the mitigation the plan promises for them.**

Mapping every `--argjson` site to the `step-done` row it writes (verified line by line):

| Counter's step == row's step | 6 refs | `build:538`, `:818`, `:936`; `debug:400`, `:756`'s `sa`; `ship:562` |
| Counter's step **!=** row's step | **11 refs** | `build:612`, **`:716`**, **`:761`**, `:1006`, `:1056`; `debug:643`, `:697`, **`:756`'s `a`**, `:808`; `ship:625`, `:685` |
| N/A (`DEBUG_ATTEMPT`, invocation index, not step-keyed) | 2 refs | `debug:332`, `:570` |

The CAUTION (`:209`) and the per-site shape (`:531`) both say **"7 of the 18 sites"** while **listing 8** (`build:612`, `:1006`, `:1056`; `debug:643`, `:697`, `:808`; `ship:625`, `:685`) — an off-by-one in a load-bearing count, the same shape as the draft's "All 14 rows against a 13-row matrix" that this plan indicts. The three it omits entirely are real: `build:716` writes a `build-challenge` row carrying `CHALLENGE_REMEDIATE_ATTEMPT` (own step: `build-challenge-remediate`); `build:761` writes `build-challenge-reconcile` with the same; `debug:756`'s `a` writes a `debug-failure-soak` row carrying `NORMAL_ATTEMPT` (own step: `debug-run-tests`).

The consequence is the part that matters. The plan's stated mitigation is _"T3.0 records the mapping per site before conversion, **and each WS-3 task's Done-when names its counter's step explicitly**"_. That holds for T3.1 (`:612` → `build-plan-verify`), T3.2 (`build-run-tests`), T3.5 (`debug-run-tests`, incl. `:756`'s `a`) and T3.7 (`ship-merge-pr`). **It does not hold for T3.3**, which mentions `:716`/`:761` only as _"the Step 9/10 challenge-row writes, both reading a bare `$CHALLENGE_REMEDIATE_ATTEMPT`"_ and whose `Done when` asks only that _"all 3 … sites from `unconverted-sites.txt` derive in-block"_ — never naming `build-challenge-remediate` as the step they must derive on. So at `:716`/`:761`: T5.3 is green either way (they derive _something_), no fixture exists, and the procedural net has a hole exactly where the count is short. Two tasks' worth of sites with no real verification of the only property that matters there.

**Assessment of the plan's stated residual concern (requested):** the judgement to skip a fixture-per-site is right — that is a materially larger surface than #58 scopes, and the plan is honest to flag rather than absorb it. But the mitigation as written is _procedural in name only_ at T3.3, and it is sized against a number that is 7 when the truth is 11. The minimum fix is cheap and restores the mitigation to what it claims to be: correct the count to 11, add `:716`/`:761`/`:756`'s `a` to both lists, and give T3.3's `Done when` the same explicit step-naming its four sibling tasks already carry. With that, every one of the 11 mismatched sites has a literal string plan-verify can assert against T3.0's recorded mapping. Without it, T3.3 ships two sites whose only check is "derives something".

**4. T3.6 mandates a bats case with no Derived Test Matrix row — a bidirectional 1:1 break.**

T3.6's `Done when` (`:555`) requires _"a bats case asserts a resumed invocation-start SOAK gets a **fresh** budget (marker present) rather than inheriting the prior invocation's spent one"_. No matrix row covers it. Row 12 (T2.8) covers the marker mechanism generically (_"rows before `soakEntryAt` are excluded → a second SOAK entry gets a full fresh budget; absent marker counts all rows"_), but the plan itself argues at length (`:552`) that invocation-start SOAK is a **distinct** path the draft wrongly excluded on a false premise, and that it is where the DE-25 starvation actually lands. The plan's own convention confirms the gap: T3.4b's in-task bats case _was_ given a matrix row (row 9). Gate 2's "17 rows, 17 tasks" self-check cannot see this test, so it is invisible to the mechanism meant to catch uncovered behaviour. Fix: add a row (`Integration (bats)` · `tests/counter-derive.bats` · T3.6) and update the count to 18.

## OPTIONAL

- **Close the mapping risk mechanically for ~11 table rows, not a fixture matrix.** The plan considers only one alternative — _"a fixture per site asserting the derived number against a seeded log"_ — and rejects it correctly as too large. There is a much cheaper option it does not weigh: T5.3 already parses each fenced block and identifies the derive call, so extracting that call's step argument and asserting it against a checked-in `site → counter-step` map (11–19 rows) is marginal work on top, is the same static-corpus shape as T5.3/T2.6, and reds on drift. That converts "derives the right counter" from a procedural hope into a falsifiable rule. Worth reconsidering before accepting the deferral.
- **`CI_ATTEMPTS` site citations are wrong in two places.** § Out of Scope (`:255`) names `bkit-ship.md` — `bkit-ship.md` contains **zero** `CI_ATTEMPTS` references. The 3 `--argjson a "$CI_ATTEMPTS"` sites are `bkit-build.md:1312`, `bkit-debug.md:1035` and `bkit-debug.md:1153` (debug has two CI-gate blocks), so the "×3" total is right by accident. T5.3's `Done when` names only `bkit-build.md:1258+` / `bkit-debug.md:980+` as must-not-red and misses the `bkit-debug.md:1099+` block — harmless (the exemption is by-name) but the citation is short. The **exclusion itself is correct**: verified assign-and-consume inside one fenced block.
- **T3.0's `Done when` cannot fail on its headline number.** _"lists **18** sites … **If the count is not 18**, the rule is authoritative and this plan's prose is stale — follow the rule, and note the delta here"_ — every outcome satisfies it. Low impact (18 is verified correct, and the task's other criteria — every site mapped to exactly one of T3.1–T3.7, none unassigned, `CI_ATTEMPTS` absent — are falsifiable), but it is a `Done when` clause that cannot fail sitting in the plan's most load-bearing task.
- **Matrix row 13 is weaker than T5.1.** T5.1's `Done when` requires the `${TEST_ATTEMPT}`-is-caught and `SOAK_ATTEMPT reset to 0`-is-caught cases; row 13 names neither. Both are the plan's own review-time findings (the lookbehind, and the reversed-operand form `:434` that the draft's grep missed). Given the "matrix is authoritative" rule, promote them into the row.
- **T5.2's `Done when` says "all 7 constants" — verified correct** (config `:12-22`: VERIFY, TEST, CHALLENGE_REMEDIATE, DEBUG, NORMAL, SOAK, MERGE). No action; recorded because the plan's own hand-list defect is in this file.
- **Managed-block hygiene:** `.bkit/scripts/bkit-counter-bus-config.sh:9-24` wraps the `MAX_*` constants in `bkit:start`/`bkit:end`. The plan's config change is comment-only and lands in the template, whose marker reads _"update here then regenerate mirrors"_ — the sanctioned path, and the runbook's "Edit the SOURCE, never the mirror" rule covers it. No violation; noted so a reviewer does not re-raise it. T8.1's `Done when` already asserts zero diff inside `docs/testing.md`'s managed block — good.

## OUT OF SCOPE

- **The `attempt` field's own honesty.** The plan makes routing independent of `attempt` (telemetry-only by contract) and correctly declines to police it. But at the 11 mismatched sites, `attempt` is the _only_ place the mapping error becomes visible in the log — a wrong derive writes a wrong `attempt` and nothing ever reads it. A post-hoc `stats.jsonl`/`status.jsonl` consistency rule (does each `step-done`'s `attempt` equal its own ordinal within the run?) would catch the mapping class after the fact. Belongs with #234's schema work, not here.
- **`bkit check` does not drift-gate the render mirrors.** T8.3 leans on `pnpm bkit check` exiting 0 after the single install; `.claude`/`.cursor`/`.opencode` mirror drift does not red it. Not this plan's problem, and Manual Step 6's fresh-consumer install is the right coverage — but the plan's confidence in `bkit check` as the drift gate is slightly overstated.
- **Deleting the `2>/dev/null` idiom repo-wide.** T3.8 removes it from the 6 counter-bus call sites only. Whether the same suppression hides diagnostics elsewhere in the workflow corpus is unexamined and out of #58's scope.
