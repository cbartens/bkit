Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

## Ecosystem Search

This is an authoring-only change to bkit's own workflow instruction files
(`.bkit/workflows/*.md`) plus rationale docs and rendered mirrors. There is no
new runtime, library, service, or schema. The "capabilities" the design needs
are all already present in the stack as established idioms — I verified each
against the live tree:

- **Poll a PR for a dispatched check** — `gh pr view {PR_NUMBER} --json statusCheckRollup`.
  Already used at `bkit-ship.md:291` (the existing pre-merge fail-fast gate) and is
  the exact form the design reuses. USE-AS-IS.
- **Poll a branch/commit for a dispatched run** — `gh run list --branch dev --commit "$SHA"`.
  Already used at `bkit-ship.md:930` and `:543`. USE-AS-IS.
- **PR-existence probe** — `gh pr list --head "$B" --base dev --json number --jq '.[0].number'`.
  Already used at `bkit-debug.md:172` (PUSH_MODE decision) and `:910`. USE-AS-IS for both
  EC-1 pre-flight and EC-2 abort-guard.
- **Clean empty re-trigger commit + branch-aware push** — `git commit --allow-empty` +
  `case "$B" in dev|main) … esac` push idiom is present verbatim at every push site
  (`bkit-build.md:1189`, `bkit-debug.md:901/949`). USE-AS-IS.
- **Additive NDJSON verdict field** — the #209 `step-done` record + `FOLD` reducer
  (`bkit-build.md:131`) is `merge=union`-safe and key-tolerant. `ciDispatch` is a pure
  additive key. USE-AS-IS.

No BUILD-CUSTOM is required; the design is ~100% reuse of existing idioms, which is the
correct call given the hard authoring constraint (self-contained, no new infra, no
templated fragment). The one place the design proposes something _new_ — the ship gate —
is where the largest correctness problem lives (see Stack Feasibility).

## Stack Feasibility

Buildable in principle with the approved stack (markdown instruction files + inline bash

- `gh`/`jq`/`git`). The kernel (poll → self-heal → re-poll → 4 typed outcomes) is
  implementable at the build and debug sites with the idioms above. However, three
  feasibility problems materially affect correctness:

1. **Ship gate is mis-modeled — the proposed probe is wrong and the gate largely already
   exists.** The design (Architecture table + Components §1 "Ship variant") places a new
   poll-only gate at `bkit-ship.md:941-955` (Step 13) using
   `gh run list --branch dev --commit "$PARENT_SHA"`, "reuse the exact form at `:929-930`."
   The live tree contradicts this:
   - `:929-930` polls `$SQUASH_SHA` (the PR merge commit), **not** `$PARENT_SHA`.
   - `$PARENT_SHA` at `:945` is the dev HEAD computed _after_ the
     `docs({FID}): ship DONE bkit [skip ci]` commit (`:951`). That commit is `[skip ci]`
     by design and fires no run, so `gh run list --commit "$PARENT_SHA"` would be
     **empty by construction on every run** → the proposed ship gate would route every
     ship to Failure Path, or (if it tolerates empty) be a vacuous no-op.
   - Ship's actual outcome-based CI verification **already exists** at `:927-940`
     (Step 13 sub-2): it resolves `SQUASH_SHA`, polls `gh run list --branch dev --commit`,
     and hard-fails on `bkit-decide`/`bkit-tests` missing/cancelled/failed/skipped. This
     IS the "#81 Change C poll-only hard-fail" the design says it wants to add. The design
     should reconcile with / point at this block, not add a second gate on the wrong SHA.
     The ship integration as written is not buildable as specified without correction.

2. **Debug has TWO loud pushes in LOCAL mode, and the design's site table is ambiguous /
   partially wrong.** Reading `bkit-debug.md:858-950`:
   - The close-workflow commit + push at sub-step 3 (`:893-901`) runs in **both** modes
     and is itself a loud push (clean HEAD, force-with-lease to feat). In PR mode this is
     the trigger. In LOCAL mode it pushes a clean HEAD to the feat branch _before any PR
     exists_, then sub-step 9 (`:944-949`) commits create-pr and pushes again.
   - The design's table says "debug fires CI at create-pr (LOCAL) or close-workflow (PR);
     the gate goes at whichever sub-step is the actual trigger push" and cites
     `:929-949` for LOCAL and `:888-901` for PR. But it does not address that in LOCAL
     mode the `:901` close-workflow push _also_ lands a clean HEAD that can dispatch a
     run (and carries `VERBOSE_SUFFIX` but, correctly, no auto-route since
     `PR_MODE_AUTO_SUFFIX` is empty in LOCAL). The "fire CI exactly once" reasoning for
     debug-LOCAL therefore depends on subtleties (does the pre-PR `:901` push to a
     branch with no PR dispatch a `push`-event run? ci.yml `on.push` is only
     `branches: [main, dev]`, so a feat-branch push fires **nothing** — good, but the
     design never states this and it is load-bearing for placing the LOCAL gate at
     create-pr and not at `:901`). This must be made explicit in the design or the gate
     could be placed at the wrong site.

3. **Line-anchor drift throughout.** Almost every cited anchor is off by the current file
   length (files are 1267/1044/1026/1130 lines; design cites e.g. build `:1166-1189`
   actual `:1159-1189`, `:1168-1169` actual `:1167-1169`; `workflows.md:506` shared
   Failure Path does not exist — build's shared/inline Failure Path is `:52-111`;
   `deployments.md:351` actual `:352`). The conceptual anchors resolve, but the plan phase
   MUST re-derive every line number against the live tree or byte-exact inlining will
   land in the wrong place.

## Library / API Evaluation

No third-party library or new API. The only external surface is the `gh` CLI JSON fields
the design polls:

- `gh pr view --json statusCheckRollup` — returns check runs + status contexts for the PR
  HEAD. A GitHub Actions **job** surfaces as a check run named after the job, so a
  `bkit-decide` check is observable here. Confirmed `bkit-decide` is a real job
  (`ci.yml:29-30`, `name: bkit-decide`) and `bkit-tests` (`:234-235`). The "probe for a
  `bkit-decide` check specifically" assumption is sound against the current ci.yml.
- **Asymmetry risk worth flagging:** the existing ship gate (`:936`) already had to match
  the tests job _fuzzily_ — `select(.name | test("test"; "i"))` — rather than an exact
  `bkit-tests` string, because consumer ci.yml job names vary. The new gate hard-codes a
  `bkit-decide` literal grep. On a consumer whose decide job is renamed (the template
  ci.yml ships the full multi-tier decide), this silently never matches → permanent
  self-heal → `no-ci`/`unresolved`. The design's Assumptions section acknowledges "if
  renamed, one grep per site changes," but does not reconcile with the ship gate's
  existing fuzzy-match precedent. Recommend the same fuzzy/anchored matching discipline,
  or document why decide must be exact while tests is fuzzy.

License/bundle/types: N/A (no code).

## Integration Risk

- **Blast radius is the 3 most safety-critical push sites** in bkit's own dogfood
  workflows. A bug here (e.g. the wrong-SHA ship probe above) breaks every build/debug/ship
  run on the bkit repo and every consumer. Medium-high blast radius, mitigated by the fact
  that the build/debug gates _observe_ and at most add one capped empty commit.
- **D2 invariant (fire CI exactly once):** the build gate is D2-safe — it observes after
  the single final loud push and the self-heal commit lands at the same graph position the
  close-workflow commit occupies. The re-trigger reuses the in-scope `AUTO_ROUTE_SUFFIX`
  (`bkit-build.md:1167-1169`) so it inherits exactly the close-workflow marker treatment.
  This is correct and verified.
- **Debug re-trigger AUTO_ROUTE sourcing is the riskiest D2 surface.** The design routes
  debug's re-trigger suffix through `BKIT_AUTO_ROUTE_FILE` (`:876-878` write, `:937-942`
  read-and-`rm`). But that file is **consumed and removed** at create-pr sub-step 9
  (`:939 rm -f`). If the gate's self-heal runs _after_ sub-step 9 has already deleted the
  file, the re-derive falls through to the `else` branch (`:941`, re-grep `LABELS`), which
  is fine **only if `LABELS` is still in scope in the gate's shell**. Across separate Bash
  tool invocations, shell variables do NOT persist (per the harness contract). So unless
  the gate is inlined in the _same_ bash block as the trigger push (it must be, to see
  `PR_NUMBER`/`LABELS`/`AUTO_ROUTE_SUFFIX`), the sourcing breaks. The design assumes
  same-block scope for build ("already in scope — reuse directly") but for debug only says
  "sourced via BKIT_AUTO_ROUTE_FILE" without resolving the same-block vs. file-removed
  ordering. This is a concrete buildability gap the plan must pin down.
- **EC-2 inverted-default is correct but fragile.** Treating a failed `gh pr list` as
  "PR exists → do not push" is the right cost-asymmetry call and the design flags it as
  intentionally opposite to EC-1's default. Buildable; just ensure the two opposite
  fallbacks are inlined with explicit comments so a future maintainer does not "normalize"
  them (design already calls this out).
- **Lockstep / grep-equality:** 3 byte-aligned gate copies + 2 abort-guard copies. The
  grep-equality acceptance check is feasible (the repo already does render-sweep checks),
  but note the gate copies are NOT actually byte-identical across sites — build sources
  AUTO_ROUTE in-block, debug via file, ship uses a different probe and no self-heal. So a
  naive `grep -F` byte-equality check across all 3 will fail by construction. The
  "byte-aligned shared lines" must be scoped to the genuinely shared sub-lines (poll loop,
  symbols), not the whole gate. The design overstates "byte-identical across the 3 sites."

## PoC Approach

Minimal proof (do not build): on a throwaway feat branch in this repo, push a clean empty
commit, then run `gh pr view <n> --json statusCheckRollup --jq '.statusCheckRollup[].name'`
in a bounded loop and confirm a `bkit-decide` entry appears within the budget; separately
push a `[skip ci]` HEAD and confirm the rollup stays empty, then push the `--allow-empty`
re-trigger and confirm `bkit-decide` then appears. This validates the entire dispatched-run
signal end to end with zero workflow edits. It is describable in <200 words, so this axis
does not by itself force CONCERNS.

## Unknowns & Blockers

- **Dispatch-surfacing p99 vs. 60s budget is unmeasured.** The design itself notes
  `gh`/REST 404 on the consumer orgs under the available token, so `POLL_BUDGET_S` cannot
  yet be tuned against real latency. The named-symbol + KN-11-home mitigation is the right
  containment, but the budget ships as an educated guess. Not a blocker (additive, capped),
  but an open experiment.
- **Does the LOCAL-mode pre-PR `:901` push dispatch anything?** Needs explicit
  confirmation in the design (ci.yml `on.push` is dev/main only → feat-branch push fires
  nothing; this is load-bearing for gate placement and currently implicit).
- **bkit-cloud.yml stale-run tolerance under one extra self-heal run** — design correctly
  defers this as a separate hardening, not a blocker.

## Verdict Reasoning

CONCERNS, not PASS: the design is the right shape, uses only existing idioms, and the
build/debug kernel is buildable and D2-safe. But the **ship integration is specified
against the wrong SHA and largely duplicates an already-existing gate** (`bkit-ship.md:927-940`),
which is a correctness defect that would route every ship to Failure Path or be vacuous as
written; the **debug re-trigger AUTO_ROUTE sourcing has an unresolved same-block /
file-already-removed ordering**; and the **"byte-identical across 3 sites" claim is not
achievable** as stated. These are addressable in the plan phase without changing the
approved kernel, so the design proceeds — not FAIL. Line-anchor drift is pervasive but
mechanical.

CONCERNS, not FAIL: nothing here is infeasible in the stack or scope; every problem is a
correction to _where_ and _how_ the inlining lands, not _whether_ it can be done.

## CRITICAL

These MUST be addressed before the design can proceed to a buildable plan:

1. **Fix the ship gate model.** It must either (a) reference/strengthen the existing
   Step-13 sub-2 gate at `bkit-ship.md:927-940` (which already polls the squash run and
   hard-fails on missing/skipped `bkit-decide`/`bkit-tests`), or (b) if a new gate is
   genuinely needed, probe `$SQUASH_SHA` (not `$PARENT_SHA`, which is a `[skip ci]` dev
   HEAD and empty by construction). The current spec (`gh run list --branch dev --commit
"$PARENT_SHA"` "reusing `:929-930`") is wrong on both the SHA and the claim that
   `:929-930` uses that form. Ship has no post-merge _loud_ push to gate.
2. **Resolve the debug re-trigger `AUTO_ROUTE_SUFFIX` sourcing ordering.** Pin down that
   the gate runs in the same bash block as the trigger push (so `LABELS`/`PR_NUMBER` are
   in scope) and define behavior when `BKIT_AUTO_ROUTE_FILE` was already `rm`-ed at
   create-pr sub-step 9 (`:939`). State which mode's gate uses which source.
3. **Make the debug LOCAL-mode "fire CI exactly once" reasoning explicit**: confirm and
   document that the pre-PR close-workflow push at `:901` dispatches nothing (ci.yml
   `on.push` = dev/main only), so the LOCAL gate correctly sits at create-pr (`:944-949`)
   and the gate is not duplicated at `:901`.
4. **Re-derive all line anchors against the live tree.** Build is 1267 lines (not the
   cited ~1189-max), debug 1044, ship 1026, workflows.md 1130; `workflows.md:506` does not
   exist. The plan's byte-exact inlining depends on correct anchors.

## OPTIONAL

Worth incorporating but not blockers:

- **Reconcile `bkit-decide` exact-grep with the ship gate's existing fuzzy
  `test("test"; "i")` job-name match** (`bkit-ship.md:936`) — either adopt the same
  tolerance for consumer-renamed jobs or document why decide is exact while tests is fuzzy.
- **Scope the "byte-identical across 3 sites" acceptance check** to the genuinely shared
  sub-lines (poll loop + named symbols), since the gates legitimately differ (in-block vs
  file AUTO_ROUTE source, ship probe, no-self-heal-at-ship). The current claim of full
  byte-equality is unachievable and would make the acceptance check fail by construction.
- **Confirm `select(.name | test(...))` vs `statusCheckRollup[].name`** field shapes match
  between `gh pr view --json statusCheckRollup` (check runs) and `gh run list` (workflow
  runs) — they expose different JSON shapes; the build/debug rollup probe and ship run-list
  probe cannot share a jq filter verbatim.

## OUT OF SCOPE

Correctly deferred by the design; no action needed now:

- Full PUSH_MODE/EXISTING_PR build/debug branch-PR alignment (EC-1 underlying idempotency)
  — D2-risky, parked behind the `# TODO(#261-ec1)` placeholder; the pre-flight fail-fast is
  the agreed interim.
- EC-3 clean create-pr commit — relies on gate self-heal; deferred.
- `bkit-cloud.yml` stale-run guard hardening under a second coexisting run — separate
  workflow, separate change.
- `#279` squash-body `[skip ci]` leak — same class, ship side, explicitly not fixed here.
- Tuning `POLL_BUDGET_S` against real dispatch p99 — blocked on token org-scope; ships as a
  documented named symbol.
