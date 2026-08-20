# Design Brainstorm & Ideas

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

## Approach A — Capability-gated Path A/B ship rewrite ⭐ Recommended

Single rewrite of `bkit-ship.md` into the agreed control flow (verify → base-check → integrate-or-skip → re-validate-if-moved → merge → path-scoped ledger close), with bookkeeping target = `CAN_PUSH_DEV` from #341's runtime table (`true` → main-checkout `dev` tree; `false` → current branch / adopt tree), never the frozen `feat/{FID}` head. Capstone `bkit-tests-check` success keyed to exact PR `headSha` is the sole merge invariant; B2 always `gh workflow run` after a head move (CONFLICTING / buried skip-ci make wait-only unsound); staging is FID-scoped (`docs/plans/{YYYYMM}/logs/{FID}/` + named ledgers only). `.deferred-blocked` writer lands in the same rewrite so sweep FAIL cannot fall through without handover; status-hole detector stays a follow-up that consumes the new step vocabulary once it is stable.

- **Complexity:** MEDIUM — one workflow + mirrors + Failure Path/status-target fix; no new engine surface.
- **Extensibility:** Future head-move kinds (rebase, update-branch, conflict push) plug into one rule: move → re-validate → merge; capability table absorbs cloud vs laptop without reopening byte-identical path debates.
- **Risk:** Prose remains the executable SoT — agents can still invent step names or skip path-scoped staging unless gates/checklists are ruthless; #341 landing order can desync the flag name if 384 ships first against a hand-rolled synonym.
- **Maintenance:** Ongoing cost is keeping one ship narrative coherent; step table in `.bkit/workflows.md` stays the index. Lower than dual SoT, higher than today's silent convention.
- **Friction vs ideal:** Large but contained edit to `bkit-ship.md` / rendered mirrors / step table; drops unconditional rebase, Step 3 prior-run diffing, Step 6 `update-branch`-after-validate, Step 8 source-fix loop, and `git add -A` bookkeeping. Touches Failure Path order (append after abort-safe point, same tree as Step 1). Depends on #341 `CAN_PUSH_DEV` (comment alias `RUNTIME_DEVPUSHES`) existing or being stubbed identically.

## Approach B — Executable ship-merge kernel + thin workflow

Extract the load-bearing ship contract into a testable shell/TS kernel (`bkit-ship-kernel` / bats+vitest): merge-base classify, head-move detect, wait-or-unconditional-dispatch, capstone@`headSha` assert, path-scoped ledger commit, `.deferred-blocked` touch. Workflow markdown becomes a thin orchestrator (subagents + narration) that calls the kernel; bookkeeping target still capability-gated as in A.

- **Complexity:** HIGH — new script surface, counter-bus integration, dual documentation (prose must not diverge from kernel), CI for ship semantics that today have zero tests.
- **Extensibility:** Best long-term: new integrate strategies and CI quirks become kernel branches with regression tests; consumer friction rows become fixtures. Closes the structural "prose has no CI" hole that let 25–65% branch-side capture stay invisible.
- **Risk:** Two SoTs until discipline is enforced — agents read markdown, tests gate scripts; drift reintroduces the unwritten-convention failure mode. Scope creep into design/plan/build rebase policy.
- **Maintenance:** Highest ongoing cost (kernel + workflow + tests + mirrors), but each class of ship defect becomes a failing test instead of a consumer friction autopsy.
- **Friction vs ideal:** New package surface under `.bkit/scripts` or `.bkit/src`; larger build/plan than A; still needs the same Path A/B product decisions. Ideal if ignoring "minimal additive" #341 doctrine; conflicts with that doctrine unless scoped strictly to ship.

## Approach C — Head-move observer (collapse explicit Path A)

Do not key on `merge-base --is-ancestor` as a named Path A/B fork. Always attempt server-side integrate (`gh pr update-branch`); on CONFLICTING → B2 worktree resolve + `--force-with-lease`; then compare `headSha` before/after. Unchanged head ⇒ reuse existing capstone green (A-equivalent); moved head ⇒ unconditional re-validate (wait where auto-dispatch is expected, always dispatch after B2 / when zero runs). Bookkeeping and staging identical to A.

- **Complexity:** LOW–MEDIUM — one linear integrate story; fewer agent-visible branches; classification becomes an observation, not a forecast.
- **Extensibility:** New GitHub mergeability states map to "did head move?" without extending an A/B matrix; easy to teach.
- **Risk:** `update-branch` no-op vs failure vs conflict semantics must be watertight — mis-reading a failed update as "unchanged" merges a stale base; unnecessary API calls on every ship; agents may still push bookkeeping if the "never move head" rule is not separately absolute.
- **Maintenance:** Smaller narrative surface than A; harder to explain when integrate is a no-op vs a real rebase; debugging depends on before/after SHA logs.
- **Friction vs ideal:** Softens the agreed "Path A / Path B" vocabulary (still expressible in docs as derived labels). May surprise operators who want an explicit "dev has not moved → skip integrate" gate. Same ledger/capability constraints as A.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Lead with **Approach A** (capability-gated Path A/B rewrite) | B (executable kernel), C (head-move observer) | A matches the agreed product shape and #341 capability seam with MEDIUM complexity; B is the better 2-year SoT but violates minimal-additive and doubles maintenance now; C is elegant but weakens the explicit base-check contract humans already agreed. |
| Bookkeeping target = **`CAN_PUSH_DEV`** (`true` → dev tree; `false` → current branch) — never `feat/{FID}` for ledger commits | Always-dev-tree; always-current-branch; carry worktree→dev at Step 9 | Cloud cannot write main checkout; always-dev reopens #341 byte-identical path; carry-across was explicitly rejected. Comment name `RUNTIME_DEVPUSHES` aliases this flag. |
| **Every deliberate head move** (B1 update-branch, B2 force-with-lease) **followed by re-validation**; merge asserts **`bkit-tests-check` success at current `headSha`** | statusCheckRollup / "latest run on PR"; wait-only without dispatch; `[force full]` on squash as stale-base mitigation | Stale green is confirmed dangerous; CONFLICTING and buried skip-ci yield zero runs by construction; force-full is mitigation theatre once Path A means "base not stale". |
| **B2: unconditional `gh workflow run`** after head moves (not timeout fallback) | Wait-then-dispatch only; branch on repo config | No merge ref ⇒ no `pull_request` fire; buried `[skip ci]` poisons later auto-dispatch; one shape covers bkit + consumers. |
| **Path-scoped staging** only (`docs/plans/{YYYYMM}/logs/{FID}/` + explicitly named ledgers) | `git add docs/`; `git add -A` | Concurrent sessions on shared `dev` checkout; blanket add misattributes sibling FID work (observed). |
| **Finding 2 (`.deferred-blocked` writer) in-scope for 384** | Split to follow-up | Sweep FAIL without writer still falls through to STOP with no handover — same ship reliability class as the Path A/B rewrite; cheap once Failure Path is touched. |
| **Status-hole / expected-step-set detector deferred** | In-scope in 384 | Detector needs the post-rewrite step vocabulary as ground truth; shipping it against today's invented names encodes the bug. File follow-up; consumer ledgers remain the fixture corpus. |
| Drop ship's **unconditional rebase-on-resume**, **Step 3 prior-run regression diff**, **Step 8 source-fix retry**, **post-validate `gh pr update-branch`** | Patch each finding in place | They dissolve under frozen-head + Path A/B; local patches preserve the incompatible push/gate pair. |
| Design/plan/build/debug **keep** shared worktree + unconditional rebase | Force all phases read-only on feat | Out of scope — those phases have no head-match merge gate; revisit only if gating spreads. |
| Issue-body hygiene (general non-fire causes; #74 cancel-in-progress justification; B2 as common case) **recommended in Design doc**, not a separate approach | Leave corrections in comments only | Prevents Design/Plan from re-deriving narrowed causal models. |
