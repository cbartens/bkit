# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Grounding (read at this worktree's HEAD): `fastForwardDev` at `.bkit/core/engine/commands/workflow/branches.ts:2863` returns `fast-forwarded | current | skipped | none` and folds "local dev has its own commits" and "git refused" into the same `skipped`. `landVerb` ignores the result of its own fetch at `branches.ts:2995`, so it can fast-forward against a stale `origin/dev`. `syncDevVerb` (`branches.ts:2454`) returns exit 16 when the install fails, which the ship workflow routes to the Failure Path. `pushToDev` (`.bkit/core/engine/commands/land.ts:222`) is the shared throwaway landing used by the design / plan close, ship close, FAILED records, the roadmap mirror and the debug own-commit replay. `landPr` and the plain fast-forward push in `pushOwnCommits` (`branches.ts:1222-1246`) do not go through it. In design and plan, the final return is built by `workflows close` (`bkit-design.md:578`) before `branches land` (`:583`). In debug, it is built at `bkit-debug.md:726`, before `branches push --mode=dev` at `:750`. In build, the mirror's output is discarded (`bkit-build.md:1230`, `>/dev/null`). Only ship builds its final return inside the verb that lands (`workflows.ts:1488`).

## Approach A — Converge at the terminal verb; local sync can never fail a landing ⭐ Recommended

**Summary:** One shared function, `syncLocalDev`, that never throws. It does one fresh fetch of `origin/dev`, classifies local `dev` against that tip on two separate axes (`relation`: equal / behind / ahead / divergent / unknown; `outcome`: fast-forwarded / unchanged / blocked:{dirty | occupied | git-refused | no-local-dev} / unavailable:{fetch-failed | internal} / pending:{close-pr-open} / not-applicable:{no-dev-push-runtime}). It fast-forwards only on `relation = behind`, using a compare-and-swap ref update, and returns the counts plus one pre-rendered plain line. It is called once by the last dev-touching engine verb of each path: `branches land` (design / plan), `workflows close` (ship after its flush, and build / debug after the earlier mirror), `branches push --mode=dev` (debug in place on `dev`), and `workflows handover --push|--flush` (Failure Paths). `roadmap mirror` also calls it, but its result is advisory, because the close that follows observes the same state again. `branches sync-dev` becomes a thin by-hand wrapper. Recovery is a read-only `bkit branches dev-status` plus `bkit branches dev-reconcile --stage=prepare|push|adopt`. The stages are stateless: each one rederives everything from git refs, and the thin `bkit-utility-sync-dev` prompt calls them in order. The sync is state-based, not event-based: it does not matter which push moved `origin/dev`; the last verb looks at where things stand and converges.

### Premortems

- **10x scale:**
  - *What breaks:* ten parallel closes in one clone all fetch at the end. The fetches collide on `refs/remotes/origin/dev` (`cannot lock ref`) and report a spurious `unavailable`. Two closes moving local `dev` at once could step backwards if each targets its own landed SHA. With 200 local-only commits × 50 files each, `dev-status`'s file-content proof spawns about 10k `git rev-parse` calls and takes minutes. With a merge-base years old, `git cherry` computes patch-ids for the whole upstream range.
  - *Observability:* `unavailable:fetch-failed` with the stderr in the log; the time `dev-status` takes.
  - *Recovery:* re-running `bkit branches sync-dev` converges, because it is idempotent.
- **6 months later:**
  - *What breaks:* a new verb that pushes `dev` is added and never calls `syncLocalDev`. Nothing fails; local lag just comes back on that path, which is the original bug again. The result words (`blocked:occupied`, …) drift between the engine, `.bkit/cli.md`, `.bkit/workflows.md` and the utility prompt. The retired ship step key `ship-switch-to-dev` is still listed as mandatory in `.bkit/core/engine/checks/status-holes.ts:58` (asserted at `status-holes.test.ts:386`), so every new ship run reports a status hole. Resume routes at `bkit-ship.md:293` and `:665` still send an in-flight run to "Step 13".
  - *Observability:* none for the forgotten verb unless a test enumerates the landing verbs; a status-holes failure for the step key.
  - *Recovery:* a contract test (see the guidance below); retire the key the same way as decision `ship-close-removes-worktree-after-landing`.
- **On-call at 3am:**
  - *Page shape:* the final message reads "Landed on dev (abc1234). Local dev not moved: divergent, 19 ahead / 1 behind; 17 of the 19 are already on GitHub as copies. Run /bkit-utility-sync-dev."
  - *What breaks:* in design, plan and debug the line is lost, because their final return was built before the landing. In build it is lost because the mirror's stdout goes to `/dev/null`. In recovery, the push succeeds and then `adopt` fails (for example, `dev` is checked out with edits), which leaves `origin/dev` holding replays and local `dev` on the old tip. If `origin/dev` moves while the owner is deciding on approval, the prepared SHA is stale.
  - *Observability:* the `localDev` object in each verb's emitted output; a `dev-status` table.
  - *Recovery:* because the stages are stateless, re-running `dev-status` after a half-finished reconcile shows every replayed commit as patch-id-matched, so `adopt` can simply be run again. A stale prepared SHA is rejected by git itself (plain push, not fast-forward), which leads to re-prepare, re-gate and re-ask, since one approval covers one push (`.agents/rules.md:96`).
- **Author leaves:**
  - *What breaks:* the rules for proving a commit is already published are subtle: a file snapshot versus a patch, why "unproven" counts as unpublished, the commit that was reverted on GitHub. A successor "simplifies" the file-content check into a patch-id-only check, or widens it to "any matching file", which silently drops work. Moving a checked-out `dev` to a commit that is not its descendant sits right next to the `git reset` ban (`.agents/rules.md:97`), and the reasoning that keeps it safe exists only in the author's head.
  - *Observability:* only named-scenario tests catch it.
  - *Recovery:* the `dev-backup/{YYYYMMDD-HHMMSS}` branch holds the old tip.

### Risk-mitigation guidance

- Make the emitted result type require `localDev` for every verb that lands on `dev`. Add a contract test that lists the callers of `pushToDev` and `runPush(… dev)` and asserts that each emits a `localDev`. This catches the forgotten new verb.
- Use the fetched `origin/dev` tip as the target, never the landed SHA. Move the ref with `git update-ref refs/heads/dev <new> <old>` (compare-and-swap) when `dev` is not checked out, and with `git merge --ff-only` when the main checkout is on `dev`. That way two parallel closes can never move local `dev` backwards, and the later close wins.
- Retry the end fetch on `devRefRace` with `landBackoffMs`, bounded by a named `TIMEOUTS` constant, not a literal.
- Wrap `syncLocalDev` in a catch-all that maps any exception to `unavailable:internal` and logs it. The caller's exit code is computed before the sync and is never changed by it.
- Each verb emits `localDevLine`. Ship's `workflows close` folds it into `finalReturn`. Design / plan (`bkit-design.md:604`, `bkit-plan.md`) and debug (`bkit-debug.md:874`, which already appends lines) append the line held from `branches land` / `branches push --mode=dev` at the final-return display. Build's close re-observes the state, so the discarded mirror output does not matter.
- When the install fails after a fast-forward, report it in the line (`installed: false`) and keep exit 0. This departs from today's exit 16 → Failure Path, and Q3 / Q11 need it; record it as a decision.
- `dev-status`: batch the proof with `git diff-tree -r --stdin` and `git cat-file --batch-check`. If the merge-base is beyond a named limit, report "classification partial" and treat the rest as unpublished; never treat it as published.
- Add a third class, `contested`, inside "unpublished": commits whose files `origin/dev` changed after the merge-base, including a revert of the same patch. They are still kept and still replayable (Q6 holds), but the prompt asks the owner about each one. This stops a change that was deliberately reverted on GitHub from coming back silently.
- `adopt`: create `dev-backup/{ts}` create-only first (`update-ref` with the zero old value, so a same-second collision fails instead of overwriting). Then move `dev` with compare-and-swap on the old tip, only if no worktree has `dev` checked out with tracked changes. Refuse otherwise and print the manual command. Document why this is not a `git reset` in the code comment and in `docs/decisions.jsonl`.
- Prove the gate in the throwaway checkout by reusing `checkLanding` / `runPushGate` with the full gate forced (`requiredPushGate`), so recovery and landings share one validation path.

## Approach B — Sync inside the landing funnel (`pushToDev` returns the local-sync result)

**Summary:** Add the fast-forward and classification to `pushToDev`'s `landed` branch (`land.ts:249-255`), so every throwaway landing syncs local `dev` right after its push. A second call is needed in `landPr`, `shipClose`'s close-PR route and the plain push in `pushOwnCommits`, because those do not land through `pushToDev`.

### Premortems

- **10x scale:**
  - *What breaks:* every landing syncs, including the mid-run mirror, so build / debug do two fetches and possibly two frozen installs per run. Q11's install now runs inside a primitive the Failure Path also uses. Blast radius: five callers share the side effect.
  - *Observability:* duplicate log lines.
  - *Recovery:* same as A.
- **6 months later:**
  - *What breaks:* `pushToDev` is a "push" primitive with a hidden write to the local branch. Its tests now need local-`dev` fixtures. A future caller that pushes `dev` from a context where the run's own checkout is `dev` mid-flight (debug in place) gets an unwanted fast-forward attempt. The three paths outside the funnel drift from the funnel's behaviour, which leaves two mechanisms.
  - *Observability:* none until someone notices the mismatch.
  - *Recovery:* refactor back out.
- **On-call at 3am:**
  - *What breaks:* a bug in the sync throws inside `pushToDev`'s `try`. `shipClose` maps any exception to `EXIT_FLUSH_FAILED` "close commit failed" (`workflows.ts:1527-1529`), so a close that actually landed is reported as failed. That directly breaks Q3. The line still never reaches design / plan / debug, whose final returns were built earlier, or build, whose mirror output goes to `/dev/null`.
  - *Observability:* a false failure page.
  - *Recovery:* a manual `sync-dev`.
- **Author leaves:**
  - *What breaks:* the behaviour is implicit. Nobody reading `branches land` can see where local `dev` moves.
  - *Observability:* none.
  - *Recovery:* read `land.ts`.

### Risk-mitigation guidance

- If B is picked: make the sync an opt-in parameter (`syncLocal: true`), not a default; guard it with a catch-all outside the landing `try`; and return it as a separate field so `DevPush` stays a pure landing result.
- Still surface the line from the terminal verb, as in A. The funnel solves when the sync happens, not how the user learns about it.

## Approach C — Workflow-level trailing `branches sync-dev` block

**Summary:** Keep the landing verbs as they are. Extend `branches sync-dev` to return the two-axis result and line. Add a final block after the last landing in each of the five workflows and their Failure Paths that runs it and appends the line. This departs from settled Q2, which moves ship's sync into `workflows close`, so it needs owner confirmation.

### Premortems

- **10x scale:**
  - *What breaks:* same fetch race as A. Each workflow adds a step key, gate and status row, so the status-holes corpus grows.
  - *Observability:* gate rows.
  - *Recovery:* re-run the block.
- **6 months later:**
  - *What breaks:* ordering lives in prose across 5 workflows × tracker variants × render snapshots, and the defect in #849 is exactly a prose ordering slip (ship Step 13 before Step 14). A workflow edit moves a landing after the sync block and the lag returns silently.
  - *Observability:* only a snapshot or invariant test that asserts the sync block is last.
  - *Recovery:* reorder the prose.
- **On-call at 3am:**
  - *What breaks:* an agent skips or misroutes the block (an `|| exit 1` turns a blocked sync into a Failure Path), so either no line appears or a landed close is reported as failed.
  - *Observability:* a missing gate row.
  - *Recovery:* a manual `sync-dev`.
- **Author leaves:**
  - *What breaks:* the knowledge is spread across six markdown files; the parity across the four hosts depends on everyone re-rendering.
  - *Observability:* `bkit check` drift.
  - *Recovery:* `bkit upgrade`.

### Risk-mitigation guidance

- If C is picked: add an invariant test per workflow asserting that the sync block follows the last dev-landing block; and give the block a route that never sends a blocked or unavailable result to the Failure Path.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| A: sync at the terminal verb of each path, converging on observed state | B: inside `pushToDev`; C: trailing workflow block | A keeps one call per run and owns the final message. B can turn a landed close into a failure (`workflows.ts:1527`) and misses `landPr` / the plain push. C reproduces the prose-ordering defect and departs from Q2. |
| Target the freshly fetched `origin/dev` tip | The landed SHA (today's `landVerb`) | Matches the edge case "one fetch, compare against that". A later close never moves local `dev` backwards. Fixes `landVerb` ignoring its fetch result (`branches.ts:2995`). |
| Two-axis result (`relation` × `outcome`) | One string enum (today's `skipped`) | Today `skipped` conflates "ahead" with "git refused", which is the misleading report the issue names. Two axes keep "landed" and "local state" apart. |
| Compare-and-swap ref move (`update-ref new old`; `merge --ff-only` when checked out) | `git fetch . sha:refs/heads/dev` | Atomic against parallel closes; a lost race reports instead of moving. |
| The sync never throws, never changes the caller's exit code | Propagate errors | Q3: the landing stays a success. |
| Install failure after a fast-forward is reported, exit 0 | Keep exit 16 → Failure Path | Q3 and Q11 conflict otherwise. A departure from today's `syncDevVerb`; the owner should confirm. |
| Verbs emit `localDevLine`; workflows append it at the final-return display | Rebuild final return after landing | The final return is built before the landing in design / plan / debug; appending already has a precedent at `bkit-debug.md:874`. |
| Stateless staged recovery (`dev-status`, `dev-reconcile --stage=…`) | A session file holding the prepared state | Every stage rederives from git, so a crash or a half-done reconcile is safe to rerun. |
| `contested` subclass inside unpublished | Treat all unproven alike | Keeps Q6 (unproven = unpublished) but stops a change reverted on GitHub from being replayed without the owner noticing. |
| A replay that applies empty is reported as "already present" | Only patch-id or content proof | Catches squash-then-edited cases that Q6's two proofs miss. Additive to Q6, so the owner should confirm. |

## Cross-Approach Risks

- **Final return built before landing:** in design / plan (`bkit-design.md:578` before `:583`; same shape in `bkit-plan.md:482` / `:487`), in debug (`bkit-debug.md:726` before `:750`) and in build (mirror output discarded at `bkit-build.md:1230`). Every approach needs an explicit way to bring the line to the user.
- **Debug's own-commit replay creates divergence by design:** `pushOwnCommits`' replay route (`branches.ts:1268-1272`) lands copies and leaves the originals on local `dev`, so after every such close local `dev` is divergent by construction. Automatic sync cannot fix it, because Q7 / the constraints allow fast-forwards only. Open question for the owner: should the report say "all N local-only commits are already on GitHub as copies", with recovery as the fix, or should the plain-push route be preferred more often?
- **Failure-record handover from a `dev` checkout:** the record lands on `origin/dev` while its files stay uncommitted or untracked in the checkout, so `merge --ff-only` refuses ("would be overwritten"). Expect `blocked:dirty` there every time; the line should say why, and a test should pin it.
- **Retiring ship Step 13:** `ship-switch-to-dev` is in `status-holes.ts:58` (mandatory per `status-holes.test.ts:386`), `step-table.ts:196`, `ship-invariants.test.ts:188` and the render snapshot `bkit-ship.none.txt:731`. Decision `ship-sync-dev-fast-forward-only-never-push-local-dev` froze the key to protect attempt counters. Old status logs must still validate; new runs must not need the key; resume from a run whose last DONE was Step 12 must route to Step 14.
- **Contract change:** the field is `localDev` from `branches land` but `devLocal` from `sync-dev` (`branches.ts:2464`). Unifying them touches the 13 files that `grep -l` finds under `.bkit/` (including `.bkit/core/workflows/bkit-ship.md`, `step-table.ts`, `close-squash.integration.test.ts`). Per Project Rules § Contract changes, read every hit in full.
- **Adopt versus the destructive-git rule:** moving a checked-out `dev` to a commit that is not its descendant amounts to a reset. It needs a documented, compare-and-swap-guarded mechanism that refuses on any tracked change, plus a backup branch created first; otherwise the utility will break `.agents/rules.md:97`.
- **Limits of the "already published" proof:** file-content equality can miss work that was squashed and later edited on GitHub (reported unpublished, replay conflicts), and can bring back work that was reverted on GitHub (see `contested`). Mode-only changes, submodules, LFS pointers and deletions each need a named test.
- **Gate cost and inputs in recovery:** the deepest gate in a throwaway checkout can take a long time and needs `prepareLandInputs` (copied ignored inputs, frozen install). Reuse `checkLanding` rather than a second validation path.
- **Backup branches:** `dev-backup/*` accumulates by design (Q8). A consumer with `push = refs/heads/*` or a mirror remote could publish them. The utility should warn about that config and never push them itself.
- **Runtimes that do not push `dev`:** cloud / adopt-mode runtimes (`RUNTIME_DEVPUSHES=false`) have no lasting local `dev`. They should report `not-applicable`, not `blocked`, to avoid noise.
- **Untrusted input in recovery:** commit messages and diffs shown by `dev-status` are attacker-controllable text (`docs/security.md:33`). The utility prompt must treat them as data and report any embedded directives.
- **Provider parity and indexes:** the new `bkit-utility-sync-dev` prompt needs host copies, a `.bkit/prompts.md` row and `.bkit/cli.md` rows for `dev-status` / `dev-reconcile`; the `sync-dev` row and the `.bkit/workflows.md` lines 141, 217 and 1131 describe Step 13 and must change in the same commit.
- **Measuring the fix:** nothing records how often local sync ends blocked or divergent, so "routine lag prevented" cannot be shown later. The main checkout must stay unwritten for design / plan, so any counter has to go to a place the verb already writes.
