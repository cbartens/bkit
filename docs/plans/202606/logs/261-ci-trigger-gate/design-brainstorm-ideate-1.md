# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

> Scope note: this brainstorm covers the full #261 problem space (outcome-gate, EC-1/EC-2/EC-3, self-heal re-trigger + auto-route marker, degenerate/no-CI consumer, authoring constraints). It is grounded in the three real push sites: build `close-workflow` (`bkit-build.md:1166-1189`), debug `create-pr` (`bkit-debug.md:929-949`), ship post-merge (`bkit-ship.md:941-955`), plus the existing HEAD-clause assertion phrasing those sites already carry, debug's `PUSH_MODE`/`EXISTING_PR` detection (`bkit-debug.md:172-174`, `:904-917`), and the EC-2 abort commit (`bkit-build.md:95-96`).

## Approach A — Inline outcome-gate block appended to each final-push site, plus EC-2 abort-guard ⭐ Recommended

**Summary (one sentence):** Append a self-contained "CI-Dispatched gate" bash block immediately after each of the three existing loud-push commands, polling the real GitHub signal for the just-pushed HEAD and self-healing once with a clean empty re-trigger; separately, guard the EC-2 abort commit so it never pushes a `[skip ci]` HEAD onto a branch with an open PR.

This is the literal D2-safe kernel from the issue (§ D2-safe kernel items 1+2), implemented as a verbatim-aligned inline block. It extends the pattern the workflows already use: each push site already runs an inline HEAD-Subject Assertion (`bkit-build.md:1180-1185`, `bkit-debug.md:945-948`) right before the push — the gate is the symmetric _post_-push twin of that same block, sharing identical phrasing and the same per-site inlining discipline (no cross-reference to `workflows.md`).

Gate shape (one shared template, inlined at 3 sites with the workflow/event arg differing):

- After the loud push, poll the pushed HEAD's dispatched-run signal — build/debug: `gh pr view {PR_NUMBER} --json statusCheckRollup` for a `bkit-decide` check; ship: `gh run list --branch dev --commit "$PARENT_SHA"` (reusing the exact `gh run list` form already at `bkit-ship.md:930`). Poll ~60s (6×10s).
- If a run is dispatched → gate passes.
- If none after the budget **and** HEAD is clean (re-run the existing skip-token regex on `%B`) → self-heal: `git commit --allow-empty -m "chore({FID}): re-trigger ci${AUTO_ROUTE_SUFFIX}"` and push (reuse the exact `case "$B" in dev|main)…` push idiom), then poll once more.
- If the re-trigger **also** dispatches nothing → conclude "no CI workflow for this event" → log + no-op (handles bkit's degenerate setup / no-`ci`-module consumer; the self-heal _is_ the discriminator, exactly as the issue specifies — no `PUSH_MODE` branch needed).
- If still a clean HEAD with a run after re-trigger → pass. Cap: 1 re-trigger, else Failure Path.

EC-2 guard: at `bkit-build.md:95-96` (and the shared abort at `workflows.md:506`), branch on "does an open PR exist for this head?" (reuse debug's `gh pr list --head … --json number` probe). If yes → write the abort artifact and status but do **not** create/push a new `[skip ci]` HEAD onto the PR branch (leave last validated HEAD); plain abort-commit only when no PR exists. This is "don't fire CI on abort," D2-aligned.

- **Complexity: MEDIUM.** Three near-identical inline blocks + one abort-path conditional. No new files, no helper indirection. The polling loop and re-trigger commit are new bash but built entirely from idioms already present in these files (`gh run list`, skip-regex, `case "$B"` push, `AUTO_ROUTE_SUFFIX`).
- **Extensibility:** Good for the _gate_ axis — a fourth push site (or a future workflow) gets the same paste-aligned block. Poor for _behavioral_ drift: because it is duplicated 3× by the authoring rules (no cross-ref), any future tuning (poll budget, re-trigger cap) must be re-applied at every site in lockstep — the standing cost of bkit's inline-single-source doctrine.
- **Risk:** Main failure mode is **self-heal false-negative on slow CI** — a real run that simply hasn't registered a `statusCheckRollup` entry within 60s triggers an unnecessary re-trigger commit (cosmetic extra empty commit, not a correctness break) — or, worse, the re-trigger fires a _second_ `bkit-decide` and, on a cloud-auto-route consumer, a second auto-router pass. Mitigation: gate self-heal strictly on "rollup empty" not "rollup incomplete," and cap at 1. Secondary risk: `AUTO_ROUTE_SUFFIX` must be in-scope at the gate (re-derive in the gate's shell, mirroring `bkit-build.md:1168-1169` / `bkit-debug.md:936-943`), else the re-trigger strips the auto-route marker.
- **Maintenance:** Ongoing cost is the 3× lockstep edit per future change + the `deployments.md` (D2 record + KN-11) and `workflows.md § HEAD-Subject Assertion` rationale updates that the authoring rules mandate alongside. This is the explicit, accepted cost of the issue's chosen authoring model.
- **Reuse vs new:** High reuse. Gate = post-push twin of the existing inline assertion; `gh run list` form, skip-regex, push idiom, `AUTO_ROUTE_SUFFIX` derivation, EC-2 PR-probe all lifted verbatim from existing sites. Net-new = the poll loop + 1 re-trigger commit + 1 abort conditional.

**Scope boundary:** Approach A ships only the D2-safe kernel. EC-1 (build lacks debug's PR-exists detection) and EC-3 (clean create-pr) are deliberately **out of scope** here — they are the D2-risky items the issue says must be designed separately. A is correct and shippable without them; it converts EC-1→EC-2's silent skip into either a self-healed run or a clean Failure Path.

## Approach B — Approach A's gate, plus fold EC-1 idempotency into build via debug's existing PUSH_MODE detection (no mid-build loud push)

**Summary:** Everything in A, and additionally give build the `EXISTING_PR`/`PUSH_MODE` detection debug already has (`bkit-debug.md:172-174`, `:904-917`) so a re-run where `feat/{FID}` already has an open PR **short-circuits** Step 17's `gh pr create` (which currently errors → retry → Failure Path) — but routes the single CI-firing push through the _existing_ loud `close-workflow` push (Step 18) only, never adding a mid-flow `synchronize`.

This tackles the D2-risky EC-1 the way the issue frames it: "detect an existing PR to avoid the `gh pr create` failure chain, without introducing a mid-build loud push." The key D2-preserving move: when a PR already exists, build does **not** push at Step 17 at all — it records the PR, keeps the `create-pr [skip ci]` buried-commit semantics (or skips the commit entirely on resume), and lets the existing single Step-18 `close-workflow` push remain the one-and-only CI trigger. No new synchronize event is introduced mid-build.

- **Complexity: HIGH.** Adds a branch into build's Step 17 (`bkit-build.md:1084-1129`) that reconciles "PR exists" vs "create PR," must align build's branch/PR contract with debug's, and must prove the resume path never double-pushes. Touches the carefully-tuned commit-shape sequence (`worktree-setup [skip ci]` → summary clean → create-pr [skip ci] → close-workflow clean).
- **Extensibility:** Best long-term — build and debug converge on one branch/PR + CI-trigger contract (the issue's stated end-goal: "align build/debug/ship on one … contract"), so future workflow-shape changes apply uniformly.
- **Risk:** Main failure mode is a **D2 regression** — any misstep that lets the PR-exists path emit a clean push to a branch with an open PR re-introduces the exact mid-build `synchronize` auto-router defect §141/KN-30 fixed. This is precisely why the issue flags EC-1 as "must be designed, not hand-edited." Higher blast radius than A.
- **Maintenance:** Higher — the build/debug contract alignment is a standing invariant that every future edit to either workflow's PR/push sequence must preserve.
- **Reuse vs new:** Medium-high reuse of debug's detection logic, but net-new control flow in build's Step 17 and new resume-idempotency reasoning.

## Approach C — Centralize the gate as a generated/templated fragment instead of 3× hand-inlined blocks

**Summary:** Same gate semantics as A, but author it once as a single canonical fragment and have the render pipeline expand it into the three workflows, rather than hand-maintaining three verbatim copies.

This trades the issue's "inline at each site, no cross-references" authoring rule for a single-source-of-truth fragment, to kill the lockstep-edit maintenance tax A and B both carry.

- **Complexity: HIGH (and likely out-of-scope).** Requires render/templating infra that may not exist for _intra-workflow_ fragments (the existing `bkit:start/end` and tracker markers template _tracker variants_, not reusable bash blocks). Building a fragment-include mechanism is greenfield infra for one gate — violates YAGNI and "minimal new infra."
- **Extensibility:** Excellent for the gate axis (edit once), but introduces a new authoring concept every future contributor must learn.
- **Risk:** Directly contradicts the issue's hard authoring constraint ("self-contained, NO cross-references … inline the gate bash at each site"). Adopting it would require re-litigating an approved decision — main failure mode is shipping a mechanism the doctrine forbids.
- **Maintenance:** Lower per-gate-edit, but higher conceptual + tooling maintenance for the new include mechanism.
- **Reuse vs new:** Low reuse, high net-new infra. Listed for completeness; not recommended.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Approach A — inline outcome-gate (post-push twin of existing assertion) + EC-2 abort-guard | B (also fold EC-1), C (templated fragment) | A is exactly the issue's D2-safe kernel; ships fastest; pure reuse of existing idioms; zero D2-risk surface |
| Gate on dispatched-run **outcome** for the pushed HEAD, not a typed string | Keep typed HEAD-Subject string check only | Root cause is "checks a string we typed, not what GitHub did"; only the live signal closes the blind spot |
| Self-heal = 1 clean empty re-trigger, then re-poll; if still nothing → no-op (no-CI) | Loop re-triggers; immediate Failure Path on empty | Self-heal is the discriminator for degenerate/no-`ci` consumers; cap=1 keeps "fire CI exactly once" and bounds extra commits |
| Re-trigger commit carries the same `AUTO_ROUTE_SUFFIX` treatment as `close-workflow` | Plain re-trigger commit (no marker) | Re-trigger lands as the final HEAD; stripping the marker would drop cloud auto-route continuity (issue Open-Q) |
| Poll budget ~60s (6×10s), self-heal only when rollup **empty** (not incomplete) | Larger budget; heal on any non-green | Bounds false-negatives on slow CI; avoids firing a second auto-router pass on a real-but-slow run |
| EC-2: on abort, do NOT push a new `[skip ci]` HEAD onto a branch with an open PR | Always push abort-commit (status quo) | Leaves last validated HEAD; "don't fire CI on abort" is D2-aligned; closes the EC-1→EC-2 silent-skip chain |
| Degenerate/no-CI handled by the self-heal discriminator, no `PUSH_MODE` no-op | `PUSH_MODE`/`LOCAL`-based no-op | `LOCAL` still dispatches CI (it creates a PR); only "no workflow for this event" is a legitimate no-op |
| Defer EC-1 (build PR-exists detection) + EC-3 (clean create-pr) to a designed change (Approach B scope) | Fold into this change now | Issue flags both as D2-risky regression hazards requiring full design, not hand-edits |
| Inline per-site (3× lockstep), accept the duplication tax | C's templated fragment | Honors the standing authoring doctrine (self-contained, no cross-refs); C needs forbidden new infra |
