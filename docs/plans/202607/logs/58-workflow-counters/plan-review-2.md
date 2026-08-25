Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

The KN-26 seam itself holds (see § Seam verdict). What does **not** hold is the task graph around it: WS-3 converts roughly a quarter of the blocks that consume a counter, and WS-4 then deletes the only thing that supplies the other three quarters. Two further edges are inverted (tests depend on an artifact produced by the last task) and two SOAK/DEBUG conversions are positioned where they invert the very failure mode the plan exists to prevent.

## Seam verdict (the load-bearing constraint)

**T3.1–T3.7 → T3.8 holds, but not because of Gate 2a.** Gate 2a sits between WS-2 and WS-3; a gate can only block at its own position, so its trailing sentence ("Do NOT proceed to T3.8 before T3.1–T3.7") is aspirational at that location. The seam is actually held by two things that _are_ in position: T3.8's own inline `(LAST in WS-3 — do not start until T3.1–T3.7 are all [x])`, and Gate 2's retrospective `KN-26 pair intact` checkbox. Merge Method (ONE PR, squash) closes the PR/commit-boundary risk — a squash cannot ship half the pair. **The seam cannot become a PR boundary.** Caveat: Gate 2a's pass criteria are unachievable as written (C2), so the gate will be waived in practice, taking its (redundant) seam sentence with it.

## CRITICAL

### C1 — WS-4 deletes the producer while ~14 consuming fenced blocks are unconverted (missing prereq, plan-breaking)

WS-3 converts **three positions per counter** (derive / write / route). The corpus has far more. Every one of these is a **fenced** block reading a bare `$X_ATTEMPT`, and **no task in the runbook converts any of them**:

<!-- prettier-ignore -->
| Counter | Unconverted fenced consumers (verified) | Task list covers |
| --- | --- | --- |
| `VERIFY_ATTEMPT` | `bkit-build.md:612`, `:613`, `:615` (`build-plan-gaps-remediate`) | `:526`/`:538`/`:563` only |
| `CHALLENGE_REMEDIATE_ATTEMPT` | `bkit-build.md:716`, `:719`, `:761`, `:764` | T3.3 says "derive at `:806`; re-derive in the `:818` write block" |
| `TEST_ATTEMPT` | `bkit-build.md:1006`, `:1007`, `:1009`, `:1056`, `:1057`, `:1059` | `:911`/`:936`/`:960` only |
| `NORMAL_ATTEMPT` | `bkit-debug.md:643`, `:646`, `:697`, `:698`, `:700`, `:705`, `:756`, `:757`, `:759`, `:764`, `:808` | `:372`/`:400`/`:424` (+`:417`/`:418`/`:802`) |
| `DEBUG_ATTEMPT` | `bkit-debug.md:332`, `:334`, `:376`, `:473`, `:482`, `:486`, `:489`, `:498`, `:502`, `:505`, `:511`, `:515`, `:518`, `:541`, `:551`, `:565`, `:570`, `:573` | T3.4 touches `:187-194` only |
| `MERGE_ATTEMPT` | `bkit-ship.md:625`, `:626`, `:628`, `:685`, `:686`, `:688` | `:519`/`:562`/`:586` only |

Today these work only because the model substitutes a literal (that is the issue's founding defect). **T4.1 removes the prose that instructs the substitution** (`Init counters:`, `Increment X + 1`) while leaving the blocks intact. The result is worse than the status quo: no derive, and no prose telling the model to substitute → `--argjson a "$TEST_ATTEMPT"` on an empty expansion → `jq: invalid JSON text` → Failure Path on `build-failure-diagnose`, `debug-failure-soak`, `ship-failure-remediate`, and every `debug-context-*` fetch.

Nothing detects this. T5.1's audit bans bare names **outside** fenced blocks by construction, so it is blind to all 40+ lines above. Gate 2's checkboxes assert task completion, not consumer coverage.

The source already carries the count the plan needed: issue #58 Comment 3 enumerates **20 `--argjson` call sites** (`VERIFY ×2, CHALLENGE ×3, TEST ×3, CI_ATTEMPTS ×3, NORMAL ×5, DEBUG, MERGE ×3`). The plan cites that comment (Breaking Changes item 9, § Out of Scope's `CI_ATTEMPTS` exclusion) but never reconciles 20 against its 7-site conversion.

**Fix:** either add a task per unconverted block (each becomes a re-derive), or make the `{X_ATTEMPT}` placeholder contract explicit and add an audit rule banning bare `$X_ATTEMPT` **inside** fenced blocks that do not themselves derive it. T4.1 must be `Requires:` that rule going green, not merely T3.1–T3.7.

### C2 — T2.2–T2.8, T3.8 and T6.2 depend on `.bkit/scripts/*` artifacts that only T8.3 produces (inverted edge)

`tests/counter-bus.bats:15` resolves the bus from the **installed** copy:

```sh
COUNTER_BUS="$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
```

and T2.7 deliberately preserves that default: `COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh}"`. But every code task edits the **template** (`.bkit/templates/.bkit/scripts/…`), and the runbook states `pnpm bkit install` runs **ONCE at T8.3, never per edit**. Therefore, until T8.3:

- `.bkit/scripts/bkit-status-fold.sh` **does not exist** — yet `counter_count` "Requires `BKIT_STATUS_FOLD` to be sourced" (§ Architecture). T2.2–T2.6, T2.8 cannot run.
- `.bkit/scripts/bkit-counter-bus.sh` has no `counter_count`/`counter_next`/`counter_current` (verified: the installed and template copies are byte-identical today and define only `counter_init`/`inc`/`get`/`reset`/`check_max`/`decide_next`). T2.2's Done-when — "`npx bats tests/counter-derive.bats` passes" — is unreachable.
- T3.8's Done-when — "`npx bats tests/counter-failclosed.bats` goes **green**" — is unreachable: the hardening is in the template, the suite reads the stale installed copy.
- T6.2's Done-when greps `.bkit/` (not `.bkit/templates/`) for `counter_init` and requires nothing — but `.bkit/scripts/bkit-counter-bus.sh` still contains all four primitives until T8.3. T6.1's grep is scoped to `.bkit/templates/`/`.bkit/workflows/` and passes; T6.2's cannot.
- **Gate 2a is therefore unpassable as written**: "`tests/counter-failclosed.bats` is RED (expected)" would be RED for the wrong reason (missing functions, not a fail-open guard), and "Every other suite is green" is false.

Also latent: T1.2 rewrites 15 workflow blocks to source `$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh`, a path that does not exist until T8.3.

**Fix:** point the new suites at the template by default (`BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`, same for the fold), and state that the installed-copy path is only exercised at T8.3 / Manual Step 6. Do **not** resolve this by adding a per-edit `bkit install` — that contradicts the runbook's own batching rule.

### C3 — T3.4 starves `bkit-debug.md:332`, the very marker T7.1 depends on

`DEBUG_ATTEMPT` is assigned **once**, at `bkit-debug.md:180-181` (Step 7 of the pre-flight section). T3.4 says: "Move the `:180-181` fold **into** the `:187-194` routing block", Done-when "no cross-block `$DEBUG_ATTEMPT` read".

But `$DEBUG_ATTEMPT` is read cross-block in ~18 further places, including:

- `:332` — `jq -nc … --argjson da "$DEBUG_ATTEMPT" '{type:"workflow-meta", …, debugAttempt:$da}'` — **the marker itself**.
- `:334` — `debug-input-'"${DEBUG_ATTEMPT}"'.md` in the same block.
- `:376`, `:473-573` — the whole `debug-context-*` fetch phase.

Moving the fold into `:187-194` removes the only assignment → `:332`'s `--argjson` hard-fails → every debug run dies at `debug-worktree-setup`. Conversely, keeping `:180-181` makes T3.4's Done-when literally false. The Done-when is unsatisfiable either way.

The circularity is worse: T7.1 proposes that `bkit-debug.md` "may reuse its existing `debugAttempt` fold" for the honest `counterValue` — but that fold reads a `workflow-meta` row written at `:332` from a model-supplied `$DEBUG_ATTEMPT`. The plan's only cross-run counter is grounded in a value the plan never de-modelises. The plan lists `:332` in bkit-debug.md's "Verified sites" as "the marker precedent" — it is also an unconverted **consumer**, and no task says so.

### C4 — T3.6 puts `counter_current` at `:440`, which is a pre-write position → SOAK-mode runs hard-fail on first test failure

T3.6: "route at `:440` with `counter_current "$STATUS" debug debug-failure-soak --since soakEntryAt`".

Verified positions:

- `:440` (`check_max SOAK_ATTEMPT`) is inside **Step 3 — Run Tests** § Route (`:416-444`; Gate 3 at `:446`).
- The `debug-failure-soak` row is written at `:756`, inside **Step 7 — Failure Remediate Soak** (`:740`).

So `:440` is reached _before_ any soak row exists for the current entry. Per the plan's own spec, `counter_current` "refus[es] (return 2) when the count is 0", and the per-site shape appends `|| exit 2`. Combined with T3.8's hardening, an invocation that enters SOAK at start (`[soak]` in the prompt, `:185`; or `decide_next DEBUG_ATTEMPT` → SOAK, `:194`) and then fails its first test run routes to **Failure Path** instead of Step 4.

Today `check_max SOAK_ATTEMPT "" …` fails **open** (continue). The plan converts that specific site from fail-open to _never-runs-SOAK_ — the exact KN-26 inversion ("silent overrun → never retries") the plan is built to avoid, reintroduced at a site the KN-26 discussion never covers. `:440` is a route-before-write position and needs `counter_next` semantics (or a 0-tolerant variant), not `counter_current`.

### C5 — "Invocation-start SOAK needs no marker" contradicts the plan's own invocation-vs-run distinction

T3.6: "Invocation-start SOAK (`:185-186`, `:194`) needs no marker — **a fresh run has no soak rows**."

But `bkit-debug.md:325-327` only appends a new `workflow-started` when the latest folded run is **not** (`debug` AND `IN_PROGRESS`):

```sh
if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "debug" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
  jq -nc … '{type:"workflow-started", workflow:"debug", at:$t}' >> "$STATUS"
fi
```

A fresh **invocation** is therefore not a fresh **run**: a prior debug invocation that was killed or is still `IN_PROGRESS` is _resumed_, and its `debug-failure-soak` rows stay in the active run. Invocation-start SOAK is reached precisely via `decide_next DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` (`:194`) — i.e. **only after prior invocations**, exactly the population most likely to carry soak rows. With no marker, `--since soakEntryAt` degrades to `.at > ""` (the plan's documented absent-marker behaviour: "counts all soak rows in the active run") → the resumed SOAK inherits a spent budget → the DE-25 starvation the plan's own Edge Cases table claims to prevent.

Breaking Changes item 8 argues at length that `DEBUG_ATTEMPT` is an **invocation** index and must not be scoped to the active run — the same invocation ≠ run distinction that this task's justification silently drops. Marker introduction must precede its consumer on **all three** SOAK entry paths, not two.

## OPTIONAL

- **Gate 2a placement.** Move the "do not proceed to T3.8" sentence into a gate positioned immediately before T3.8 (e.g. `🔒 Gate 2b: Derivation Complete`), asserting `T3.1–T3.7 all [x]` + `grep -rn 'Increment .*_ATTEMPT' .bkit/workflows/` empty. As placed, Gate 2a can only block entry to T3.1. The seam survives on T3.8's inline note; make the gate carry it.
- **T2.7's RED proof is ambiguous under C2.** Its Done-when requires the suite to be "RED against the current tree (T3.8 has not run yet)" _and_ RED against `dev`. Once C2 is fixed (suites read the template), the current-tree RED is a genuine fail-open; before the fix, both REDs are `command not found`. Make the Done-when assert the _reason_ (stdout `step-14`, exit 0), not merely non-zero.
- **T7.1's `counterValue` derivation is under-specified.** "the count of `workflow-started` events for that workflow" needs the all-runs vs active-run scoping stated explicitly — it is a cross-run invocation index like `DEBUG_ATTEMPT`, and a reader will otherwise apply the plan's headline active-run rule and reset it to 1 every run.
- **T3.3's THRESHOLD idiom cites `bkit-debug.md:192-193`** — verified correct (`THRESHOLD=$((MAX_DEBUG_ATTEMPT - 1))`). Worth noting in the task that this idiom means `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` maps to `THRESHOLD=0`, and `counter_current`'s refuse-at-0 (C4's mechanism) interacts with it at the first remediation.
- **Template structure:** § Architecture omits the template's `### Database Migrations` subsection. Justified (no DB, stated under § Data Schema Integration) — flagging only for completeness. All tasks carry `Done when`; all four gates present; § Manual Verification is the terminal section per `docs/plans/template.md:376`. Structure otherwise intact.

## OUT OF SCOPE

- **A `CI_ATTEMPTS` audit exemption.** § Out of Scope correctly excludes it (loop-local, single-block), but C1's proposed "no bare `$X_ATTEMPT` inside a non-deriving fenced block" rule would flag `bkit-build.md:1258+` / `bkit-debug.md:980+`. That exemption is a consequence of the C1 fix, not a plan expansion — noting so the follow-up is not mistaken for scope creep.
- **`status.jsonl` run-boundary semantics** (`bkit-debug.md:325-327` reusing an `IN_PROGRESS` run across invocations) is the root cause behind C5. Fixing the boundary itself belongs to #209's substrate, not here; C5 is fixable inside this plan by writing the marker on all three SOAK entry paths.
- **A shellcheck gate over `.bkit/scripts/*.sh`** — already correctly deferred (`58-no-shellcheck-gate-over-bkit-scripts`).
