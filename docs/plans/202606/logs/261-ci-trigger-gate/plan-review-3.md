Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Per-task surface touches, verified against the live tree (anchors re-derived, not trusted from the plan).

**WS-1 / Task 1 — `bkit-build.md` Step 18 close-workflow push block** (verified `:1156`-`:1190`).

- Edits: appends the CI-Dispatch kernel inside the same shell block, after the `B=$(git branch --show-current); case … esac` push (`:1189`).
- Symbols added: `POLL_BUDGET_S`/`POLL_INTERVAL_S`/`PUSHED_HEAD`/`CI_OUTCOME`/`poll_decide()`, `[bkit-ci-gate]` prefix, `ciDispatch` key on the `build-close-workflow` `step-done` jq (`:1176`).
- Consumers of the touched record: the #209 FOLD reducer (`bkit-build.md:327`) — verified it does `($e|del(.type,.workflow))` and merges the remainder, so `ciDispatch` passes through. No other reader.
- CI-trigger invariant touched: the close-workflow commit IS the single loud HEAD (the create-pr `[skip ci]` commit at `:1128` is buried). Gate runs post-push only.

**WS-2 / Task 2 — `bkit-debug.md` Step 10 close-workflow (`:866`-`:902`) + create-pr (`:929`-`:950`)** (verified; the file numbers it **Step 10**, plan correctly flags the stale "Step 12" label).

- Edits: gate at the PR-mode trigger (close-workflow push `:901`) and the LOCAL-mode trigger (create-pr push `:949`).
- `ciDispatch` added to `debug-close-workflow` (`:885`) and `debug-create-pr` (`:933`) records.
- `BKIT_AUTO_ROUTE_FILE` lifecycle: written at close-workflow `:876`-`:877`; read+`rm`-ed at create-pr `:937`-`:939`. **The plan's ordering claim is partly inaccurate — see CRITICAL-1.**

**WS-3 / Task 3+4 — abort-guard.**

- `bkit-build.md` inline Failure Path push (`:95`-`:96`, `docs({FID}): build aborted bkit [skip build] bkit [skip ci]`).
- `.bkit/workflows.md` § Failure Path **step 5** (`:506`, conditional-handover push). Verified this push is _conditional_ — it runs only on max-retry exhaustion with a worktree present (`:503`). **See CRITICAL-2 / OPTIONAL.**

**WS-4 / Task 5 — `bkit-build.md` Step 17 entry** (verified `:1084`-`:1108`): blind `gh pr create --base dev` at `:1092`, retry-once at `:1108`. Pre-flight probe inserted before `:1092`.

**WS-5 / Task 6+7 — docs.** `.bkit/workflows.md` § HEAD-Subject Assertion (`:938`) rename; `bkit [auto route]` Marker Propagation (`:532`); `docs/deployments.md`, `docs/knowledge.md` KN-11 (`:231`), `docs/decisions.md`.

**WS-6 / Task 8 — `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`** (new). Reads `.bkit/workflows/*.md` + `bkit-ship.md`; FOLD round-trip via `execFileSync`.

**WS-7 / Task 9 — mirror re-render** `.claude/ .cursor/ .opencode/`.

**Ship — confirmed OUT and unchanged.** SQUASH_SHA gate (`bkit-ship.md:927`-`:938`) hard-fails on missing/cancelled/failure/`skipped` `bkit-tests` with no self-heal — this is the #81 Change C backstop. Post-merge `docs({FID}): ship DONE bkit [skip ci]` (`:951`) is silent by design (dev CI already fired on the squash merge). No CI-Dispatch gate added at ship. Plan and design are correct.

## CRITICAL

### CRITICAL-1 — Debug LOCAL-mode `BKIT_AUTO_ROUTE_FILE` ordering instruction is wrong against the live file; following it as written would re-introduce an empty-suffix marker-drop (D2 auto-route continuity risk)

The plan (WS-2 / Task 2, and Architecture §342-343) instructs:

> "source `RETRIGGER_SUFFIX` from `BKIT_AUTO_ROUTE_FILE` in the same shell block BEFORE the `rm -f "$BKIT_AUTO_ROUTE_FILE"` … Reorder sub-step 9 so the `rm` happens AFTER the gate's re-trigger path can read the suffix."

This misreads the live mechanism. In the actual file (`bkit-debug.md:936`-`:944`), the create-pr block does **not** persist the suffix in a shell variable that survives the gate — it reads `BKIT_AUTO_ROUTE_FILE` into `AUTO_ROUTE_SUFFIX`, _immediately_ `rm`s the file (`:939`), then builds `LOCAL_MODE_AUTO_SUFFIX` and commits. The gate is appended **after the push at `:949`**, by which point:

- `BKIT_AUTO_ROUTE_FILE` is already removed, AND
- `AUTO_ROUTE_SUFFIX` (the in-block shell var, `:936`) **is still in scope** for the remainder of the block.

So the correct instruction is _not_ "reorder the `rm` to after the gate" — the gate's re-trigger must source `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` (the live shell variable already set at `:936`), exactly as the build leg does. The file-based read is only needed because the suffix is _computed in a different sub-step (sub-step 3, `:874`) than where create-pr commits (sub-step 9)_ — but by the time the gate runs, the value has already been re-materialised into `AUTO_ROUTE_SUFFIX` at `:936`. The plan's "read the file before `rm`, reorder `rm` after the gate" is both unnecessary and risky: moving the `rm` after a re-trigger push widens the window where a stale temp file leaks, and if an implementer naively follows "reorder so `rm` follows the gate" they may instead delete the `:936`-`:944` re-materialisation block and leave the gate reading a removed file → silent empty suffix → dropped `bkit [auto route]` marker on the re-trigger HEAD → missed cloud auto-route on a `bkit:auto` consumer.

The design's own backstop (assert-equal-before-push, `unresolved(autoroute-mismatch)`) _does_ catch the empty-suffix case loudly — so this is a hardening backstop, not a silent hole — but the plan's authoring instruction contradicts the live code and will cause an implementer to make the wrong edit. **Fix:** rewrite WS-2's LOCAL-mode AUTO_ROUTE instruction to "reuse the in-block `AUTO_ROUTE_SUFFIX` already set at the create-pr block's suffix re-materialisation (the same value used to build the create-pr commit); set `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"`; assert-equal as a symmetry backstop" — and drop the "reorder the `rm`" instruction. The PR-mode leg (`:889` `PR_MODE_AUTO_SUFFIX`) has the same property and is correctly served by reusing the in-block var.

This is the single highest-value correction: it is the exact KN-30 D2 marker-continuity surface (`bkit [auto route]` drop → auto-router never fires on the final HEAD), and the plan's instruction as written points the implementer at the wrong edit.

### CRITICAL-2 — Shared Failure Path abort-guard (WS-3b) is wired onto the _conditional-handover_ push, which does not cover debug's PR-mode abort onto a live PR — the EC-2 coverage claim is overstated

The plan asserts (Success Criteria, Edge Cases, WS-3) that EC-2 covers "both required abort sites: build's inline Failure Path AND the shared Failure Path in `workflows.md`." Verified against `.bkit/workflows.md:497`-`:509`:

- The **Standard failure** block (`:497`-`:502`, always-run) does **not** push to the feat branch at all (only design/plan push a failed-status commit to `dev`, best-effort).
- The push the plan guards — step **5** (`:506`, `docs({FID}): {phase} aborted … push`) — lives in the **Conditional handover** block, which runs **only** when failure was triggered by max-retry exhaustion AND the worktree exists (`:503`).

That means a debug (or build) abort that hits Failure Path for a **non-retry-exhaustion reason** (e.g. a tool failure, a gate failure, EC-1's named failure, a `Wrong branch` assertion) does **not** reach step 5 and therefore is not the path that pushes a `[skip ci]` HEAD onto a live PR. Conversely, the EC-2 _symptom_ described in the issue (`build:95-96`, the build inline Failure Path) is build-specific and _is_ covered by WS-3a.

The concrete gap: **debug has no inline Failure-Path abort push of its own** — it relies entirely on the shared `workflows.md` conditional handover. So debug's EC-2 protection only exists on the max-retry-exhaustion path. A debug abort that pushes onto a live PR via any _other_ Failure-Path trigger is not covered, and the plan's "shared Failure Path inherits the guard" sentence implies blanket coverage it does not provide. The plan should either (a) confirm via trace that no non-handover debug Failure-Path branch pushes onto a live PR (and record that), or (b) widen the guard. As written, the EC-2 "both sites covered" claim is **not** substantiated for debug's non-exhaustion abort paths — this is a coverage gap masked by an over-broad claim, which is a CRITICAL design-coverage finding under this lens.

(Build's own inline Failure Path `:95`-`:96` runs unconditionally on abort and _is_ the dominant EC-1→EC-2 path the issue names; WS-3a covers it correctly. The gap is specifically debug + the non-exhaustion build Failure-Path branches.)

## OPTIONAL

- **WS-6 negative-assertion sharpening (ship).** The ship negative assertion ("ship carries NO `[bkit-ci-gate]`") is correct, but ship DOES legitimately contain `gh run list` / `statusCheckRollup` / `bkit-tests` strings (`bkit-ship.md:291`, `:927`-`:938`). The test should assert specifically on the `[bkit-ci-gate]` literal and the 4-outcome vocabulary, NOT on generic poll strings, or it will either falsely pass (if it greps a too-broad token) or be brittle. The Done-when already names `[bkit-ci-gate]`; make the assertion body match.

- **WS-6 should also assert the `unresolved → Failure Path` route exists at each gate site, not just symbol presence.** The grep-equality + symbol-presence assertions confirm the kernel is _present and aligned_, but nothing tests that `unresolved` actually routes to Failure Path (the `case "$CI_OUTCOME" in unresolved) ;; esac` line in the plan kernel at `:312` is a no-op stub — it does not itself route). A future "simplification" could leave `unresolved` recorded but not routed (a silent vacuous-pass regression — the exact KN-11 class one layer down). Add a grep assertion that each gate site contains an `unresolved`→Failure-Path instruction adjacent to the verdict echo.

- **Self-heal cap-1 / auto-router double-dispatch bound is documented but not test-pinned.** The design bounds the `bkit:auto` double-dispatch to exactly one extra run via cap-1 (Risks §280, Edge Cases row "Self-heal already attempted (cap=1)"). The plan inlines cap-1 as kernel structure (single re-trigger, no loop) but there is no static assertion that the self-heal branch is non-looping. Consider a WS-6 assertion that the re-trigger `git commit --allow-empty` appears at most once per gate site (guards against a future edit wrapping it in the poll loop → unbounded re-trigger fan-out, which IS a KN-30 D2 auto-router regression). Cheap; closes the one genuinely-unbounded failure mode if the cap is ever lost in an edit.

- **Debug-LOCAL `ci.yml on.push = [dev, main]` assumption: confirmed live, ensure the inline comment lands.** Verified `.github/workflows/ci.yml:5`-`:6` — `push.branches: [main, dev]` and `pull_request.branches: [main, dev]`. The design (§64-68) and plan (WS-2) require this be recorded as an explicit inline comment at the debug-LOCAL gate site so a future `on.push` widening cannot silently make the pre-PR feat-branch close-workflow push a second trigger. The plan's Done-when for Task 2 does **not** assert the presence of this comment — add `grep` for the comment to the Task 2 Done-when so the load-bearing assumption is not dropped during authoring.

## OUT OF SCOPE

- **EC-3 (make build's create-pr commit clean)** — correctly deferred by the plan/design (D2-coupled); the gate's self-heal recovers EC-3-induced states. No action.
- **#279 squash-body `[skip ci]` leak (ship side)** — same suppression class, correctly tracked separately. No action.
- **Reconciling the `bkit-decide` exact-literal probe vs ship's fuzzy `test("test";"i")` match** (design Assumptions §305) — the design flagged this as an OPTIONAL to either adopt fuzzy tolerance or document why decide is exact. The plan inlines an exact `test("decide";"i")` (kernel `:266`) without resolving the design's open OPTIONAL. Not blocking (a consumer renaming the decide job would surface as a loud `unresolved`/`no-ci`, not a silent green), but a future `bkit-decide` rename touches one grep per site + the doc — worth a one-line note in WS-5's deployments.md update. Flagged for plan-author awareness, not a required change.

---

**Verdict rationale:** No D2 mid-build-trigger regression (the gate is genuinely post-final-push only, verified at both `bkit-build.md:1189` and `bkit-debug.md:949`/`:901`), ship is correctly OUT with the #81 Change C backstop intact, and `ciDispatch` is verified backward-compatible through the live FOLD reducer. But two CRITICAL items block a clean PASS: (1) the debug LOCAL-mode AUTO_ROUTE ordering instruction contradicts the live file and points the implementer at a wrong, marker-drop-prone edit; (2) the "both abort sites covered" EC-2 claim is not substantiated for debug's non-retry-exhaustion Failure-Path branches. Both are correctable in-plan without redesign. **CONCERNS** — flag for orchestrator merge.
