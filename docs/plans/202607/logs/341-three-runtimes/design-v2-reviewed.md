Verdict: CONCERNS
<!-- verdict:end -->

# Design: Three-Runtime Workflow Execution (#341)

## Related Issues

Step 3.1's specified tool (`mcp__github__search_issues`) is non-functional on this PRIVATE repo — it returned `total_count: 0` for every query including the control, while `gh` returned 39 (see `related-issues.md`). The list below is sourced from `design-input.md`, NOT from search. This incident is itself design input (see Decision D12).

- #341 — Make workflows run in all runtimes local GH Actions claude.ai (open) — this design
- #134 — design→ship artifact-trail model (closed, not-planned) — superseded by the shipped per-phase ephemeral-branch model; removes §6h optionality
- #209 — state model / design-plan feat-locate (closed, shipped) — the reason worktrees + `feat/{FID}` span all five phases; drives D3 scope
- #234 — NDJSON `status.jsonl` (closed, shipped) — the per-step status commits that ride the phase branch
- #342 — Prompt-injection hardening (open, `bkit:design`) — owns the §5a lethal-trifecta mitigation referenced by §6f; adjacent, do NOT duplicate
- #99 — bkit workflow friction optimisation (open, `bug`) — general workflow-friction tracker

## Acceptance Scenario

### Narrative

A developer runs any bkit phase — from their laptop, from a GitHub-Actions runner, or from a claude.ai cloud session — and the phase behaves the same way in all three: it starts without aborting on step 1, never yanks the session onto another branch, and reliably lands its work on `dev`. When `gh` is unavailable in the cloud session, the phase still completes through a sanctioned, bounded fallback rather than an improvised one. Afterwards the developer can read the run's status trail and see which runtime was detected, what it was judged capable of, and which transport actually carried the close.

### Success Criteria

1. All five phases + `bkit-auto` complete end-to-end in each of the three runtimes; the mode-1 laptop path is verified non-regressed by a real end-to-end run (not a rule-text-presence test). **This run is also the only guarantee that prose rules _honour_ the capability flags** — no static engine can assert that (D3 as amended).
2. No run ever mutates the session's checked-out branch in a runtime that cannot restore it — zero `git checkout dev` when dev-push capability is absent (D6). **Held by a double-guard plus a reversible checkout (D23), so it survives a mis-detected flag** — not by probe accuracy, which v1 relied on and which `--dry-run` cannot deliver.
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens — **asserted post-hoc against the landed commit on whichever transport ran (D24)**, not inferred from a pre-merge PR-title grep — and the resulting CI-dispatch outcome on `dev` is asserted rather than assumed (D1 closed on both transports).
4. Any gh→MCP transition is bounded (max 1 per run), recorded in `status.jsonl`, confirmed by an independent re-read that asserts the intended effect actually happened, **and its recording is itself cross-checked mechanically (D25)** rather than trusted to the register that failed to record D2.
5. An MCP read returning empty/zero is never recorded as authoritative absence — it is corroborated or reported as unavailable, **with the corroboration attempt logged as its own distinguishable state** (D12 as amended).
6. **A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime** (Flow 1) — the silent-failure class this issue exists to fix, one layer earlier than v1 named it.
7. **No wait can hang.** Every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep` (D22), because a hang emits no row and no narration and so defeats every other criterion here.

### Key Edge Cases

- **Unknown runtime / runtime #4 already ships.** Cursor background agents (`providers.md:281`) detect via stdin JSON — no bash-visible primitive exists. Silent fallthrough to the mode-1 branch is the worst outcome; `unknown` must resolve to least-capable + loud.
- **Identity says capable, reality says not.** A mode-2 runner with the default read-only `GITHUB_TOKEN` cannot push dev; a rotated `GH_TOKEN` 401s (KN-CORE-1). Any identity-keyed capability claim is wrong today, not in six months. **Answered by making the real operation the certifier (D23), not by a probe** — `--dry-run` cannot see branch protection at all, so it would certify the read-only token as capable.
- **The fallback dies with the thing it rescues.** `.mcp.json` and `cloud-bootstrap.sh` both read `GH_BKIT_TOKEN` (verified) — the token whose absence _is_ the mode-3 gh failure. `GH_OK=false → use MCP` assumes an independence the config does not provide (D26).
- **MCP up but silently wrong.** The live `search_issues` incident: a clean `0` on the one surface (trackers, §6i) that has no fallback by design. gh fails loudly with an exit code; MCP failed quietly and wrongly.
- **Adopt mode collapses worktree isolation.** `WORKTREE_PATH == REPO_ROOT` means two phases on one session tree share a working tree; the existing `.lock` becomes the only concurrency guard (repo doctrine already forbids concurrent workflows on one clone).
- **Repo settings are invisible to git.** Branch protection on `dev` and auto-delete-head-branches are UI settings, changeable by any admin, and silently break every autonomous close.
- **`pwd` outside worktree fires on every step in adopt mode** (`bkit-design.md:30`) — adopt-or-mint is dead on arrival unless this rule changes in the same commit.

## Architecture

Four layers, split by **register** — what can be mechanised in bash, what must stay agent-prose, and what is a durable invariant.

```
Layer 0  RESOLUTION      .bkit/scripts/bkit-runtime.sh (sourced per block, bats-tested)
         bkit_runtime_detect -> RUNTIME + CAN_WORKTREE/CAN_SLEEP   (pure env reads, re-derived free)
                             -> GH_OK/CAN_PUSH_DEV                 (read back from the Step-1 row)
                             -> WORKTREE_PATH (6 assignment sites)
         Emits 1 narrated line + 1 status.jsonl row at Step 1; re-derives per block thereafter.

Layer 1  MECHANISM       .bkit/scripts/bkit-runtime.sh
         bkit_wait_ci    -> bounded poll, CAN_SLEEP=true branch ONLY (bash)
         The CAN_SLEEP=false branch is agent control flow, NOT bash (see D22).
         Replaces 7 sleeps / 4 poll constructs / 3 kernel blocks (test-gated, see D3).

Layer 2  PROCEDURE       workflow headers (.bkit/workflows/bkit-*.md), gated on CAN_*
         Branch model (adopt-or-mint) · Worktree rule rewrite · Close model (3 shapes)

Layer 3  INVARIANTS      .agents/rules.md (bkit:start/end block)
         Merge/commit body MUST be skip-token-free · Never foreground-sleep
         Fallback bounded + recorded + success-asserted · Empty MCP read is inconclusive
```

**Register correction — the shim is stateless, and that is load-bearing.** The v1 draft assumed `bkit_runtime_detect` resolves once at Step 1 and that the flags are readable at Step 2, Step 17 and the Close Workflow. **That is false and the repo proves it.** Workflow steps are separate Bash tool calls; only cwd survives — which is exactly what the header rule claims and bounds itself to (`bkit-design.md:30` + 4 peers: "`cd`s into `.worktrees/{FID}`; **cwd** persists across subsequent Bash calls"). Nothing claims variables persist, and **34** `REPO_ROOT=$(...)` re-derivations plus `WORKTREE_PATH` re-assigned twice in one file (`bkit-ship.md:248`, `:933`) are the repo working around exactly this. The counter-bus does **not** generalise as v1 claimed: all 8 call sites re-source both files **inside their own fenced block** (`bkit-build.md:573-574`, `:973-974`; `bkit-ship.md:591-592`; `bkit-debug.md:191-192`, `:432-433`, `:441`, `:451-452`) and pass every input as an agent-substituted literal, consuming one stdout line + an exit code in the same block. It is a **stateless pure function, re-sourced per block** — that is _why_ it works. See D21 for the state model this design adopts instead.

**Why the split.** `.agents/rules.md` is already `**Read in full:**` by every workflow header, already has a managed `bkit:start/end` block, and mirrors to exactly one template file — 2 files reach all 6 workflows. But it is doctrine-prose read by _all_ agents including subagents, so adopt-or-mint _procedure_ does not belong there. Invariants (universal, register-appropriate) go to `rules.md`; procedure stays in headers; mechanism goes to the shim.

**Why a shim is not new infra.** `.bkit/scripts/bkit-counter-bus.sh` / `bkit-counter-bus-config.sh` are already sourced by workflows (`bkit-build.md:573-574`, `bkit-ship.md:591-592`) and already pointed at from a header rule — verbatim: "**Limits:** `MAX_MERGE_ATTEMPT` is defined in `.bkit/scripts/bkit-counter-bus-config.sh`" (`bkit-ship.md:49`). The shim reuses that idiom 1:1 — **including its stateless, re-source-per-block register** (see D21). Net-new is one file that rides `bkit install` like its siblings (`.bkit/version:64-65` tracks the counter-bus pair; `bkit-modules.ts:234-237` ships `.bkit/scripts/` templates by default).

> **Naming note.** `.bkit/scripts/bkit-mode.sh` was a sourced script **retired in #245**, and `bkit-modules.ts:1110-1130` still ships an advisory telling consumers to delete the orphan. Reintroducing a sourced `bkit-runtime.sh` is fine — but the name must not be `bkit-mode.sh`, and D1's `RUNTIME`-not-`MODE` ruling applies to the filename too.

**Boundaries.**

- The shim owns detect / capability table / the CI-wait _bash_ branch / close-guard helpers.
- **Three engines, three jobs** — v1 conflated them, and the conflation inflated D3's testability claim:
  - **Shim behaviour → bats**, not vitest. `tests/counter-bus.bats` executes the real script and CI runs it (`ci.yml:500-502`, `npx --yes bats tests/*.bats`) — **verified**. `pnpm test` is `vitest run` and does **not** include bats (`test:bats` is a separate script, `package.json:42-43`). Shim tests land in `tests/bkit-runtime.bats`.
  - **Prose-rule presence → a vitest audit** modelled on `bkit-counter-prose-audit.test.ts`.
  - **Drift → `bkit check` + `.bkit/version`.** `bkit check` is **not** a test runner: `bkit-install.ts:2402` is `const dryRun = verb === "check"` — **verified**. It is the install engine in dry-run and cannot assert the behaviour of a shell function. Every v1 sentence saying "`bkit check` asserts behaviour" was wrong and is corrected below.
- **What is and is not behaviour-tested — stated plainly.** bats can test that `bkit_runtime_detect` _computes_ `CAN_PUSH_DEV` correctly. **Nothing mechanically tests that a prose rule _honours_ it.** A vitest prose audit is a presence grep — precisely the "test asserting rule text is present will pass while shipping a broken close path" that Risk 7 and Success Criterion 1 reject. D3 therefore buys testable **detection**, not testable **consumption**; the consumption guarantee rests on Success Criterion 1's real end-to-end run. This is an accepted limit (see Trade-offs), not a claim.
- The shim **cannot** own the gh→MCP substitution. MCP calls are agent tool invocations, not shell commands: bash can detect `GH_OK=false` and report it, but cannot invoke `mcp__github__merge_pull_request`. Change 2 stays prose in every approach. Any design claiming otherwise is wrong. **The identical boundary applies to `bkit_wait_ci`'s `CAN_SLEEP=false` branch** — v1 drew the line correctly for MCP and missed it here (D22).
- Mirrors (`.claude/`, `.cursor/`, `.opencode/`) are force-rendered from `.bkit/` and are not drift-gated — true edit cost is 6 sources (+templates), not 18 files. **Exception:** `cloud-bootstrap.sh` lives in `.claude/hooks/` (tracked, `.bkit/version:42`, template mirror at `.bkit/templates/.claude/hooks/`) — the gh-hardening edit is a two-file mirror edit, not a `.bkit/` source edit.

**Integration points:** `bkit-auto.md` Step 1 (FID resolution reorder), Step 2 of all five phases (branch model), Close Workflow of design/plan/ship (transport + D6 guard), `bkit-cloud.yml` (already marker-primary/branch-fallback — no change needed), `cloud-bootstrap.sh` (gh hardening).

## Data Model

### Capability table — one detection, four named flags

Identity is an **input to one table**, never a predicate at a call site. This is a 4-row table with named outputs plus two probes — not a 16-state lattice.

<!-- prettier-ignore -->
| RUNTIME | Detected by | CAN_WORKTREE | CAN_PUSH_DEV | CAN_SLEEP | GH_OK |
| --- | --- | --- | --- | --- | --- |
| 1 (local) | neither var set | true | true (optimistic; push fails loud) | true | probe |
| 2 (gh-action) | `GITHUB_ACTIONS`/`CI` | true | true (optimistic; push fails loud) | true | probe |
| 3 (claude.ai) | `CLAUDE_CODE_REMOTE=true` | false | false | false (identity) | probe |
| unknown | no primitive (e.g. Cursor bg agent) | false | false | false (identity) | probe |

- **`GH_OK` is probed** (`gh auth status`, loud, once at Step 1) — the seed already concedes this. Probed **once**, not per block (D21).
- **`CAN_PUSH_DEV` is NOT probed. The `git push --dry-run origin dev` probe is REJECTED — it fails dangerous.** `--dry-run` performs auth + ref advertisement but sends **no ref-update**, so the server-side pre-receive hook never runs and **branch protection is never evaluated**. It returns success where a real push would be rejected — a **false-positive `CAN_PUSH_DEV=true`**, which in mode 3 selects the local path and fires `git checkout dev` (`bkit-design.md:799`) on the live session: Success Criterion 2 violated and Risk 1 triggered verbatim. Secondary failure modes: nothing to push → "Everything up-to-date", exit 0 (false positive); local dev behind → non-fast-forward, exit non-zero (false negative, unrelated to permission). v1's Risk 3 framed this as "needs a spike"; it is not a spike question — the primitive is unsound for this purpose by construction. See D23.
- **What replaces the probe** (this is the repair, not a downgrade — mode 2's read-only token is still handled correctly):
  1. `CAN_PUSH_DEV` is **identity-derived and optimistic** where a worktree exists. It selects a _transport_; it does not certify a _permission_.
  2. **Permission stays certified by the real push**, which already fails loudly and correctly: `git push origin dev || { echo "dev push failed" >&2; exit 1; }` (`bkit-design.md:806`, **verified**). Mode 2's read-only `GITHUB_TOKEN` (§1) surfaces here — loudly, at the real operation — instead of being mis-certified by a dry run.
  3. **The D6 hazard is closed structurally, not by probe accuracy** — see D23's double-guard + reversible checkout. This is strictly stronger than a probe: it holds _even if_ the flag is wrong.
- **`CAN_SLEEP` is identity-derived and cannot be otherwise** — the mode-3 block on foreground `sleep` is a **harness policy enforced at the tool-call boundary**, not a shell capability; the harness rejects the call containing `sleep` before the shell runs, so no in-bash probe can observe it. This is the one flag that structurally cannot follow D2's own "never identity-keyed" rule, and it is marked as such rather than pretending otherwise (D22, OQ5).
- **`unknown` is least-capable + loud.** Never a silent fallthrough to mode 1.
- Rules read `CAN_*`. Only the table reads `RUNTIME`. **Exception, deliberate:** the close-path double-guard reads `CAN_WORKTREE` _as well as_ `CAN_PUSH_DEV` (D23) — a redundancy, on purpose, at the one site where being wrong is worst.
- **The table is a default, not a truth.** `GH_OK` is probed; `CAN_PUSH_DEV`/`CAN_SLEEP`/`CAN_WORKTREE` are asserted defaults. This sentence ships in the shim as a comment.

### `WORKTREE_PATH` — 6 assignment sites, not "one indirection point"

Measured (v1's "**49** refs across 7 files" matched nothing measurable and is corrected — a builder told "one indirection point" will look for one and not find it):

- braced `{WORKTREE_PATH}` = **54**, in **5** files — all agent-prose subagent `Context` cwd lines; genuinely free
- shell `$WORKTREE_PATH` = **56**, in **7** files — **every use is block-local to its assignment** (`bkit-design.md:216` assigns, `:217-237` use, one fenced block; `bkit-ship.md:248` → `:249-287`, then `:933` assigns _again_ → `:934-935`)
- **6 assignment sites** — `bkit-design.md:216`, `bkit-plan.md:220`, `bkit-build.md:278`, `bkit-debug.md:270`, `bkit-ship.md:248`, `bkit-ship.md:933` (**verified**)
- **31** structural `git worktree add|remove|prune|list` ops (verified exact); literal `.worktrees/` = **38**

- Mint mode: `WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"` (today's behaviour, unchanged).
- Adopt mode: `WORKTREE_PATH="$REPO_ROOT"`.

The 54 braced refs keep working untouched because only the variable's _contents_ change. D8's conclusion survives intact — but the mechanism is **6 assignment sites + 1 header placeholder definition**, and the block-local structure is _why_ the re-source-per-block state model (D21) costs nothing here: each block already re-derives what it needs.

### FID resolution order — a reorder, not an invention

`bkit-auto.md:93-112` **already** parses `<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->` from the PR body as the preferred source, and `bkit-cloud.yml:190-198` already does marker-primary / branch-fallback. The blocker is pure **ordering**: step 7 (`BRANCH` must start with `feat/`) and step 8 (`FID="${BRANCH#feat/}"`) abort before step 10 ever runs.

```
1. PR-body marker  <!-- bkit:issue=… bkit:fid={FID} -->   (preferred — already exists)
2. Branch-name derive  ${BRANCH#feat/}                     (fallback)
3. Neither -> Failure Path
```

The `feat/`-prefix hard-reject at `:86-87` is deleted, not relaxed. Cheapest item in the seed, mis-sized as part of "the biggest one".

### `status.jsonl` rows — the fallback audit trail (existing artifact, no new type)

<!-- prettier-ignore -->
| Row | When | Carries |
| --- | --- | --- |
| `runtime-resolved` | Step 1 | `RUNTIME`, four `CAN_*`, `WORKTREE_PATH`, `GH_OK`, **`ghProbeExit` + truncated `ghProbeErr`** (see below) |
| `transport-fallback` | on any gh→MCP transition | `from`, `to` (mapped tool), `reason`, `assertedBy` |
| `close-transport` | at phase close | which of the 3 close shapes ran, the landed SHA, **and the post-close skip-token scan result** (D24) |

- **The row is also the shim's own state store** (D21): Step 1 writes the probed flags; later blocks read them back rather than re-probing. This keeps "no new artifact type" literally true — the ledger already exists (#234) and already rides the phase branch.
- **Probe raw results, not just the derived boolean.** An operator seeing `GH_OK=false` cannot otherwise tell "gh genuinely unauthed" from "the probe itself errored oddly and defaulted false" without re-running it by hand. `ghProbeExit` + a truncated `ghProbeErr` are the difference between a 2-minute diagnosis and re-deriving state from scratch — which is the recovery story Risk 1 already claims, and which only works if the row is legible. (`CAN_PUSH_DEV` no longer has a probe to record — D23.)
- **Named readers.** An audit trail nobody reads is not an audit trail. Readers, both already in scope: (1) the Close Workflow itself, which mechanically cross-checks `runtime-resolved.GH_OK` against `transport-fallback` before accepting a close (D25); (2) on-call, post-incident. A periodic `transport-fallback`-frequency summariser was proposed in review and is **explicitly not adopted** — it is a new analysis feature, outside this issue's scope (see Open Questions).

### §6c gh→MCP map (reference table, prose-owned)

Unchanged from the issue, with two corrections:

1. The `git push origin dev` tail resolves to `push_files` for docs-only closes **only if D5 survives its spike** (see D5 as amended — the v1 claim that this is "the same write, different transport" is **withdrawn as false**).
2. **The map's `mcp__github__*` tool names are only valid for one of two candidate servers, and which one serves mode 3 is unresolved** (D26). The map is not portable across them.

Trackers are **absent** from this map by design (§6i).

## Components / Flows

### Flow 1 — Step 1 resolution (all phases)

`source .bkit/scripts/bkit-runtime.sh` → `bkit_runtime_detect` → **assert all five variables set and non-empty** → narrate one line (`RUNTIME=3 CAN_WORKTREE=false CAN_PUSH_DEV=false CAN_SLEEP=false GH_OK=true`) → append `runtime-resolved` to `status.jsonl`. Load-bearing for all six workflows, so it must be dead simple and side-effect-free.

**Step 1 is the only block that probes.** Every later block re-sources and re-derives the env-only flags for free, and reads the probed flags back from the row (D21).

**Shim-source failure must be loud — it is the silent-failure class this issue exists to fix, one layer earlier than anything v1 named.** If `.bkit/scripts/bkit-runtime.sh` is missing or stale (a worktree predating this ship; a mixed-version consumer), `source` fails and every `CAN_*` is **unset**. At every call site `[ "$CAN_PUSH_DEV" = true ]` is false for an unset var exactly as it is for an explicit `false` — so a **broken shim is bash-indistinguishable from a correctly-detected least-capable runtime**. It would degrade to "looks like a legitimate `unknown` row" instead of "detection itself failed", and produce a plausible-looking `runtime-resolved` row while nothing was detected at all.

```
source || Failure Path (loud: "runtime shim unavailable" != "least-capable runtime")
assert RUNTIME + CAN_WORKTREE + CAN_PUSH_DEV + CAN_SLEEP + GH_OK all set and non-empty
  -> else Failure Path, distinct message, distinct status.jsonl reason
```

Use `set -u`-style explicit emptiness checks (`[ -z "${CAN_PUSH_DEV:-}" ]`), not truthiness. The distinction between _absent_ and _false_ is the entire point and must be preserved in both the abort message and the row.

### Flow 2 — Branch model (Step 2, all five phases)

```
CAN_WORKTREE=true  -> mint feat/{FID} + git worktree add   (today's path, untouched)
CAN_WORKTREE=false -> adopt current branch in place; WORKTREE_PATH="$REPO_ROOT"
                      Assert current branch != dev -> else Failure Path
```

**Coupled, same commit:** the header rule `**Worktree:** ... If step ever finds pwd outside worktree → Failure Path` (`bkit-design.md:30` + 5 peers) becomes `pwd != WORKTREE_PATH => Failure Path`. In adopt mode `pwd` == repo root == "outside worktree" → guaranteed Failure Path on **every step**. This cannot be a follow-up; shipping adopt-or-mint without it ships a workflow that cannot take one step.

### Flow 3 — Close model: three shapes, not one

The seed's "PR-based phase-close" is a blanket over three structurally different closes. Separating them is what dissolves F1.

<!-- prettier-ignore -->
| Shape | Phases | Today | Mode-3 status |
| --- | --- | --- | --- |
| **A — docs-only land on dev** | design, plan | `checkout dev` + `merge --squash` + `push origin dev` | **Blocked** (D4 push + D6 checkout) — needs a transport |
| **B — commits on the persistent PR branch** | build, debug | push to `feat/`/`fix/` branch + PR ops | **Already works** (current branch is pushable) |
| **C — server-side PR merge + local dev sync** | ship | `gh pr merge` (server-side, works) then `checkout dev` + `pull` + `pnpm install` (`:733-751`) | Merge works; the **sync block is destructive** (D6) and is pure local housekeeping → **skip it**, do not re-transport it |

Shape C is the clearest correction to the seed: ship's merge is _already_ server-side. The `cd "$REPO_ROOT"` / `git checkout dev` block that follows exists only to refresh the local dev checkout and reinstall deps. In mode 3 nothing local needs dev — the right answer is to skip the block when `CAN_PUSH_DEV=false`, not to build a fallback transport for it.

### Flow 4 — Shape A transport (the D6 + F1 core)

> **v1's central claim is withdrawn.** v1 asserted `push_files` is "**the exact server-side equivalent of the `git push origin dev` that mode 1 already performs** — same write, different transport, no new capability requirement." **This is false**, in four independent ways (D5 as amended). Three are repaired below; the fourth (payload) is not repairable and is what demotes D5 from "dissolves the fork" to "one of two candidates, spike-gated".

```
STRAY guard FIRST, over the UNFILTERED diff — not over a set already filtered by the allowlist
  STRAY=$(git diff --name-only dev...feat/{FID} | grep -vE '^docs/plans/|^\.bkit/friction\.md$')
  [ -n "$STRAY" ] -> Failure Path (loud abort)          [semantics preserved from :802-803]
  -> only then compute the push set

CAN_WORKTREE=true AND CAN_PUSH_DEV=true                 [double-guard, D23 — both, not either]
  -> today's local path: checkout dev (trap-restore, D23), merge --squash -X ours, commit, push
  -> assert: git show "dev:docs/plans/{YYYYMM}/{FID}-design.md"          [local ref, correct here]

else -> NO checkout. Land the docs set server-side via the mapped tool (D5, spike-gated)
  -> explicit, skip-token-free `message`
  -> assert via get_file_contents({ref:"dev"})   -- NOT `git show dev:` (D5 defect 4)
  -> conflict precondition: assert dev head unmoved since the diff base (D5 defect 2)

BOTH paths -> post-close skip-token scan of the LANDED commit (D24) — transport-agnostic
BOTH paths -> transport-fallback consistency check (D25) before close-transport is accepted
Branch cleanup: skip in adopt mode (you are standing on the branch)
```

**Why the STRAY guard had to move to the front.** v1 read: "Compute the docs file set explicitly (allowlist, not denylist) → STRAY guard: assert set matches `^docs/plans/|^\.bkit/friction\.md$` [preserved from :802-803]". If the set is _computed by_ the allowlist, then asserting it matches the allowlist **can never fail** — a tautology. The real guard (**verified**, `bkit-design.md:802-803`) runs `git diff --cached --name-only` over the **unfiltered** `git merge --squash` staging area and **aborts loudly** when the phase touched a source file. v1's version **silently omits** the stray file instead. D5's claim that this is "allowlist-by-construction, strictly stronger than STRAY's denylist grep" is **backwards**: it converts a loud abort into a silent drop — F2 regressed, not closed.

**Why the canonical assert had to change register.** v1 said "re-read `dev:docs/plans/{YYYYMM}/{FID}-design.md` [preserved from :807]". `:807` is `git show "dev:..."` — a read of the **local** `dev` ref (**verified**). After a server-side `push_files`, local `dev` was never fetched. If the canonical doc already exists on local `dev` from a prior run, this **passes while the write silently failed** — a false-positive assert, which is **D1's exact aetiology**, and it directly contradicts D13's own demand for "an independent re-read". It becomes `get_file_contents({ref:"dev"})` (verified to exist in the enabled `repos` toolset) or a `git fetch origin dev` first. Preserving the _line_ while inverting its _meaning_ is worse than not preserving it.

**Note on plan.** `bkit-design.md:807`'s canonical assert has **no peer in `bkit-plan.md`** — plan's close (`:786-792`) has the STRAY guard (`:788-789`) but no `git show dev:` assert, only a gate checkbox at `:850`. If Flow 4 is a shared shape-A prologue, plan **gains** an assert it lacks today. That is an improvement, but it is a change, and it is named here rather than smuggled.

### Flow 5 — CI-wait (`bkit_wait_ci`)

Measured: **7 `sleep` statements in 4 poll constructs** — 6 inside already-bounded loops (`bkit-build.md:1298,1320`; `bkit-debug.md:1018,1040,1137,1159`), 1 bare `sleep 30` (`bkit-ship.md:556`). D5 is **2 shapes, not 3 sites**.

> **v1's evidence for extraction was wrong — the conclusion survives, the cost does not.** v1 said the three `# --- CI-Dispatch Gate shared kernel ---` blocks are "'shared' in comment only, physically duplicated" and that "nothing mechanically enforces" them. **False, verified:** `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` exists and asserts the kernel between the delimiters is **byte-identical across build and debug** (#261, "WS-6 contract"). Extraction into `bkit_wait_ci` is still right — but it **requires rewriting that live test**, a cost v1 did not budget. And the test's header states verbatim: "Ship is OUT of scope (keeps its pre-existing SQUASH_SHA-poll gate)" — so **D11's deletion of `ship:556`'s `sleep 30` is a reversal of a prior design decision, not a free win.** Probably still correct; recorded as a reversal so it is made knowingly.

**`bkit_wait_ci` is not one function.** v1's Layer 1 said "bounded poll; wait primitive selected by `CAN_SLEEP`". The two branches are in **different registers**:

```
CAN_SLEEP=true  -> BASH. bkit_wait_ci owns this branch:
                   bounded poll (attempt cap + elapsed cap, recorded)
                   timeout-wrapped sleep -> a blocked primitive fails LOUD, never hangs (D22)
CAN_SLEEP=false -> AGENT PROSE, not bash. "one check per orchestrator turn, bounded attempts"
                   is orchestrator control flow: one tool call per turn, attempt counter
                   surviving across turns. Bash cannot yield a turn.
ship:556 `sleep 30` -> deleted, replaced by the bounded poll for RUN_ID (a D11 reversal, above)
```

This is **the same hard boundary D4 draws correctly for MCP** ("bash can detect `GH_OK=false`... it cannot invoke the mapped tool") — v1 drew it for MCP and missed that it applies identically here. The bash branch is bats-testable; the yield branch is prose with the same advisory status as Change 2, and the cross-turn attempt counter is the counter-bus's existing job (D22).

**Two hazards specific to burying `sleep` in a sourced function** (both must be settled in Spike A before `bkit_wait_ci` is authored):

1. **Harness evasion.** If the mode-3 `sleep` block is enforced by command-string inspection, a tool call reading `bkit_wait_ci` contains **no literal `sleep`** for the harness to gate on — the shim would **evade the guard**, converting a loud tool-level rejection into a silent hang. The shim would then have _defeated_ the very protection that made `CAN_SLEEP` necessary.
2. **The dangerous misfire direction.** v1's Risk 5 discusses only the safe direction (`CAN_SLEEP=false` when sleep works → turn-yield inefficiency). The opposite is far worse: `CAN_SLEEP=true` where foreground `sleep` is **blocked** yields not a clean error but an **indeterminate hang** — and a hang produces **zero observability**: no `status.jsonl` row, no narrated line, because the step never completes to emit one. It is a strictly worse failure than anything D1–D5 named, since it precludes the narration mechanism the whole design leans on, and it ends only at an external session-level timeout. Mitigation: **the attempt/elapsed cap must be enforced by a mechanism that survives a blocked primitive** (`timeout`-wrapped), never by one that assumes `sleep` returns.

Deleting the blind `sleep 30` is a **mode-1 improvement, not a regression**: 30s is an unbounded guess that can be both too short (false "CI did not trigger") and wasteful.

### Flow 6 — gh→MCP fallback (prose, Layer 3)

> [!CAUTION]
> **This flow's premise is broken, and the break is upstream of this design.** `GH_OK=false → use MCP` assumes gh and MCP fail **independently**. They do not: **both read `GH_BKIT_TOKEN`.** `.mcp.json:7` authenticates with `"Authorization": "Bearer ${GH_BKIT_TOKEN}"`; `cloud-bootstrap.sh:61` guards `[ -n "${GH_BKIT_TOKEN:-}" ]` before `gh auth login --with-token` — **both verified**. §2's premise for gh being flaky in mode 3 is that the platform withholds _precisely that token_ — in which case `.mcp.json`'s `github` server gets an empty bearer and **401s too**. gh and MCP fail **together**, exactly when the fallback is needed.
>
> **This is a correction to #341's settled §6 direction, not merely to this draft.** §6's gh-primary/MCP-fallback structure — and the §6c map that implements it — is unsound as specified for mode 3 until D26 resolves which server serves the fallback and under which tool names. The centrepiece change (#2) may be **unreachable in the one runtime it targets**. Build must not proceed on §6 as written.

```
GH_OK=false -> use the §6c-mapped tool  [D26: WHICH server? .mcp.json's github (same dead token)
                                         or claude.ai's proxy-brokered built-in (different names)?]
            -> bounded: max 1 gh->MCP transition per workflow run
            -> recorded: `transport-fallback` row in status.jsonl
            -> success-asserted: independent re-read confirming the intended effect
               ("the tool returned something" != "it worked" — MCP has no exit code)
            -> retry: mechanical wait between attempts; the retry *decision* stays judgment
            -> request minimal output
Empty/zero MCP read -> INCONCLUSIVE, never authoritative absence.
                       Corroborate with a second MCP signal (e.g. a list_* call) or report unavailable.
                       -> record the corroboration attempt + result as its OWN distinguishable state,
                          never folded into "corroborated" vs "unavailable" (D12 as amended)
```

D2→D1 was an _unbounded, unrecorded_ improvisation. Bounding and recording it is what makes the fallback a controlled path rather than a licence to improvise. Every extra MCP call also widens the lethal-trifecta surface (§5a/#342).

**Budget interaction with D5 — unresolved, and it must be resolved before build.** Flow 4 routes shape-A closes on `CAN_PUSH_DEV`; Flow 6 routes on `GH_OK`. So a mode-3 run with gh **perfectly authed** still closes via MCP — which contradicts `design-input.md:13` ("gh stays **primary**... GitHub MCP is a **controlled fallback**, only when gh is unavailable"). A defensible reading exists and this design adopts it explicitly: **`push_files` is a fallback for _git_, not for _gh_** — a different primary, a different budget. It therefore does **not** consume D13's max-1-gh→MCP-transition budget. Stated plainly because the alternative reading is fatal: if a mandatory shape-A `push_files` close _did_ consume the budget, a mode-3 run that had already fallen back once **could not close at all**. If this reading is rejected at build, D13's bound must be re-scoped, not silently exceeded.

### Flow 7 — localized §4 fixes

- **Debug egress blindness** — allowlist + loudness; a self-skip `exit 0` must never read as "no runtime errors".
- **Playwright artifact seam** — no MCP artifact-download tool exists; failure signal lives in job logs (`get_job_logs`), only the rich report is lost. Open decision (see Risks).
- **Hard-coded macOS paths** — reframed: this is **not a mode-3 issue**. `.bkit/templates/docs/plans/template.md:195` leaks `/Users/christian/Documents/GitHub/create-t3-turbo` **to every consumer** in all three modes (plus repo copies at `docs/plans/template.md:191` and `:575`). Keep the fix in scope, but scope it as the shipped user-path coupling bug it is — bundling it behind a mode-3 milestone hides a consumer-facing defect.
  - **Correction (verified):** v1 bundled `.agents/skills/using-git-worktrees/SKILL.md:191` into this cluster. That is **wrong**. `:191` reads `Worktree ready at /Users/jesse/myproject/.worktrees/auth` — **`/Users/jesse`**, not `/Users/christian`: illustrative transcript output in **vendored upstream skill content** (obra/superpowers). The two sibling hits (`systematic-debugging/CREATION-LOG.md:7`, `root-cause-tracing.md:36`) are the same. It is not a bkit path coupling, it ships no consumer defect, and editing vendored content creates drift on the next skill sync. **Dropped from D20's scope.**
- **`bkit-worktree-{prune,sync}.md` disposition** — 18 + 16 worktree refs, unowned by "the six workflows", meaningless under adopt. Explicit disposition: **loud self-skip when `CAN_WORKTREE=false`**. Silent omission = obscure mode-3 failures in a workflow nobody scoped.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **D1. Flag is `RUNTIME`, never `MODE`** | Seed's `MODE`; `BKIT_MODE` | `bkit-auto.md:70-80` already binds `MODE=CI\|BRIEF` for phase routing — **verified**. The collision lands in the one workflow that most needs the flag (D4 lives there). Non-negotiable, and must be settled before any rule is authored. **Token census confirms `RUNTIME` is clean:** `PUSH_MODE` x25, `DEBUG_MODE` x22, `MODE` x11, `DIAGNOSE_MODE` x4; `RUNTIME` has **2 repo hits**, both the comment `# RUNTIME GATING` (`bkit-cloud.yml:8` + its template) describing _secret-presence auto-detect_ — an unrelated sense, no variable collision. Noted so the two senses are not conflated. Applies to the shim's **filename** too (see the `bkit-mode.sh` naming note in Architecture). |
| **D2. Rules branch on capabilities; identity feeds one table** | Identity (`RUNTIME=3`) at every call site | `RUNTIME=2 => CAN_PUSH_DEV` is **already false** (default `GITHUB_TOKEN` is read-only, §1). `bkit-preflight.ts:1135` **already** groups by capability (`CI \|\| CLAUDE_CODE_REMOTE \|\| CURSOR_REMOTE_AGENT`) — **verified**. Runtime #4 already ships with no enum slot. The "16 untested states" objection is answered by D3: the flags derive from a 4-row table (4 reachable rows, not 16), and the shim makes that table unit-testable. Capability + prose would deserve the objection; capability + shim does not. |
| **D3. Bash-expressible logic lives in `.bkit/scripts/bkit-runtime.sh`; headers hold thin pointers** (**AMENDED** — engines + testability scope corrected) | 5 prose rules x 6 headers (literal seed) | Justified by _measured_ duplication: 7 sleeps, 3 kernel blocks. Reuses the counter-bus sourcing idiom already pointed at from `bkit-ship.md:49` — **verified** — including its **stateless re-source-per-block** register (D21). Decisive: it makes **detection** testable; prose rules are advisory, and D1/D2 are the proof that advisory failed (the incident was an agent improvising _despite_ a "No Improv" header). The one branch that held was code (`bkit-build.md:1303`); the prose around it did not. **Three v1 corrections:** (1) shell behaviour is tested in **bats** (`tests/bkit-runtime.bats`), not vitest — `pnpm test` is `vitest run` and excludes bats (`package.json:42-43`, `ci.yml:500-502`, verified); (2) **`bkit check` cannot assert behaviour** — `bkit-install.ts:2402` is `const dryRun = verb === "check"`, the install engine in dry-run (verified); (3) the claim is now **testable detection, not testable consumption** — no engine tests that a prose rule _honours_ `CAN_PUSH_DEV`. D3 is still right; its v1 justification was overstated by one full register. |
| **D4. Change 2 (gh→MCP) stays prose in every approach** | Wrap the fallback in the shim | MCP calls are agent tool invocations, not shell commands. Bash can detect `GH_OK=false`; it cannot invoke the mapped tool. This is a hard boundary, not a preference. |
| **D5. Shape-A close via `push_files` — DEMOTED from "F1 resolution" to "spike-gated candidate, co-equal with D5(a)"** (**AMENDED** — v1's premise falsified) | **(a) PR-close + drop `[skip ci]` from close subjects — now CO-EQUAL, not a fallback**; (c) PR-close + a docs-only CI lane | **v1 claimed `push_files` "dissolves" the F1 fork because it is "the same write, different transport, no new capability requirement". That claim is false and is withdrawn.** The tool is real (GitHub MCP `repos` toolset, enabled in `.mcp.json`: `X-MCP-Toolsets: context,issues,pull_requests,repos,users,projects`; signature `branch`/`files[]{path,content}`/`message`/`owner`/`repo` confirmed) and the **`message` half holds** — D1 _is_ closed by construction on this transport. But four defects, three repaired in Flow 4 and one not: **(1) Payload — NOT repairable.** `files[]` carries full **content**, not a diff. This FID's own close set measured **162,531 bytes / 9 files** at review time and **193,040 bytes / 9 files** today — it only grows, and the canonical design doc is extra. That is ~40-48k tokens **inlined into one tool call**, straight into §5b (token bloat is a _primary reason_ MCP is a fallback) and against Flow 6's own "request minimal output". Splitting to `create_or_update_file` is worse: 9 calls, 9 dev commits, non-atomic, no rollback. **(2) Conflict semantics INVERTED** — `bkit-design.md:801` is `git merge --squash -X ours` (**dev wins**); `push_files` writes branch content onto the dev head unconditionally (**branch wins**). Two transports resolving the same conflict in **opposite directions** is the exact silent-divergence class this design names as its own biggest accepted risk. Repaired only by a dev-head-unmoved precondition — a narrower guarantee than `-X ours`, and it must be stated, not glossed. **(3) STRAY tautology** and **(4) local `git show` asserting a server-side write** — both repaired in Flow 4. **Consequence:** D5 no longer dissolves the fork; it trades on it. **(a) is promoted from "named fallback" to co-equal candidate** and, if branch protection forbids direct dev writes _or_ the payload proves unacceptable, becomes primary — which then makes §6d's "consider dropping `[skip ci]` from intermediate status-commit subjects" a **prerequisite, not an option**. (c) stays rejected as primary: it depends on consumer CI shape, which bkit does not own. **Both candidates are gated on Spike B (OQ1) — build must not guess.** Note the F1 pressure that motivated `push_files` is real and unchanged: a PR-close makes `docs({FID}): design DONE bkit [skip ci]` the PR title, which the PR-title assert (`bkit-ship.md:538-542`, **verified**) explicitly rejects and KN-11/DE-32 forbids. |
| **D6. D6 is in scope: guard the checkout, not just the push** | Treat D4 (push) as the whole close problem | **Verified**: `bkit-design.md:797-799` does `cd "$REPO_ROOT"` → `git checkout dev` _before_ `git push origin dev` at `:806` (peers: `bkit-plan.md:785`, `bkit-ship.md:736-738`). In mode 3 `REPO_ROOT` **is** the session tree, so the checkout yanks the live session off `claude/…` and fires **first**. Fixing only the push leaves the worse half. Named nowhere in the issue. |
| **D7. Rewrite the `pwd`-outside-worktree rule in the same change as adopt-or-mint** (**AMENDED** — 13 further coupled sites named) | Ship adopt-or-mint, fix the rule after | `bkit-design.md:30` — **verified**. In adopt mode `pwd` == repo root == "outside worktree" → Failure Path on every step. Hard sequencing coupling; not a follow-up. **v1 said "`bkit-design.md:30` + 5 peers"; the `**Worktree:**` rule exists in _5_ files, not 6 (`bkit-auto.md` has none), and three site classes go unnamed — each independently breaks adopt mode under D7's own same-commit logic:** (1) the **Placeholders** rule at `bkit-design.md:23` +4 peers, which _defines_ the token as "`{WORKTREE_PATH}` = absolute worktree path **set at worktree setup**" — under adopt there is no worktree setup, so the definition must change in 5 files; (2) the 5 gate items `- [ ] Worktree created/resumed (.worktrees/{FID}, pwd inside worktree)` (`bkit-design.md:288`, `bkit-plan.md:292`, `bkit-build.md:375`, `bkit-debug.md:364`, `bkit-ship.md:341`) — unsatisfiable in adopt mode; (3) the 3 `- [ ] Worktree removed` gate items (`bkit-design.md:869`, `bkit-plan.md:854`, `bkit-ship.md:971`). **13 further sites**, all in the same commit. |
| **D8. `WORKTREE_PATH` indirection — 6 assignment sites** (**AMENDED** — numbers corrected) | Rewrite every `{WORKTREE_PATH}` site; per-site `RUNTIME=3` guards | Conclusion survives; v1's framing misleads. Not "49 refs across 7 files, one indirection point" but **54** braced refs (5 files, agent-prose, genuinely free), **56** shell refs (7 files, every one block-local to its assignment), **6 assignment sites** — `bkit-design.md:216`, `bkit-plan.md:220`, `bkit-build.md:278`, `bkit-debug.md:270`, `bkit-ship.md:248`, `bkit-ship.md:933` (**verified**), plus 1 header placeholder definition. 31 structural ops verified exact. A builder told "one indirection point" will look for one and not find it. The block-local structure is also what makes D21's re-source-per-block model free. |
| **D9. FID decoupling = reorder, not invention** | Build a new tracker→FID resolver | **Verified**: `bkit-auto.md:93-112` already parses the marker; `bkit-cloud.yml:190-198` already does marker-primary/branch-fallback. Hoist the marker read above the `feat/` check at `:86-87`; branch-derive becomes fallback. |
| **D10. D1 fix = a named invariant both transports inherit** | Patch the MCP fallback to pass `commit_message` | **Verified**: `bkit-ship.md:551-553` already passes `--body ""`. D1 is a **fallback-path-only** gap — the invariant existed in exactly one place, owned by no rule, so the MCP path had nothing to inherit. Patching only the fallback rebuilds the same asymmetry that produced D1. |
| **D11. D5 = 2 shapes, not 3 sites** (**AMENDED** — records a decision reversal + an unbudgeted cost) | Per-site `sleep` swap | 6 of 7 sleeps sit in already-bounded loops; only `ship:556` is a blind wait. Fix the wait primitive + delete the blind wait. **Two v1 corrections:** (1) the three kernel blocks are **not** "shared in comment only" and it is **not** true that "nothing mechanically enforces" them — `bkit-ci-dispatch-gate-alignment.test.ts` asserts byte-identical kernels across build and debug (#261 WS-6 contract, **verified**); extraction requires **rewriting that live test**, a cost v1 did not budget. (2) That test states "Ship is OUT of scope (keeps its pre-existing SQUASH_SHA-poll gate)" — so deleting `ship:556` **reverses a prior design decision**. Still judged correct (a blind 30s guess is both unsound and wasteful), but taken knowingly, not as a free win. |
| **D12. Empty MCP read is inconclusive; corroborate via a second MCP call — no gh tracker fallback** (**AMENDED** — corroboration is not failure-independent) | Narrow gh read-path fallback for trackers on private repos | The live incident is the inverse of §6b (`MCP silently wrong`, not `gh down`) on the one surface with no fallback by design. But trackers are MCP-only (§6i) and repo doctrine forbids `gh` for GitHub/Linear tracker ops. Constraint-compatible fix: make `0` non-authoritative and corroborate **within MCP**. Step 3.1's own rule would otherwise have written `None.` and quietly falsified the record on every private-repo consumer. **Named weakness:** corroboration assumes the `list_*` call fails independently of the `search_*` call that returned the wrong zero — **not established**, because the root cause is undiagnosed (OQ4). If the defect is systemic to the server's search/list surface on private repos rather than specific to `search_issues`, the corroborating call returns an equally-wrong clean result and D12's own rule then records **"corroborated" over a still-false fact** — one hop deeper, same silent-wrong-result class. Mitigation (not a fix): log the corroboration attempt and result as its **own distinguishable state**, never folded into "corroborated"/"unavailable", so a later-discovered shared defect is diagnosable from the trail. Relaxing §6i → deferred (OQ3). |
| **D13. Fallback is bounded (max 1/run) + recorded + success-asserted** | Unbounded per-call fallback (seed as written) | D2→D1 was exactly an unbounded, unrecorded improvisation. MCP has no exit code (§5c), so "the tool returned something" != "it worked" — each mapped fallback needs an explicit re-read assertion. Recording reuses `status.jsonl`; **no new artifact type** is introduced. |
| **D14. Render-time gating REJECTED** | Reuse the tracker-marker mechanism (`<!-- bkit:mode 3 -->`) | **Verified** — `bkit-trackers.ts:1`: blocks resolve **at install time**. Tracker is known at install; runtime is not. One rendered file serves modes 1 and 3. Recorded explicitly so build does not re-propose it. |
| **D15. Invariants → `rules.md`; procedure → workflow headers; mechanism → shim** | All 5 rules in 6 headers; all 5 in `rules.md` | `rules.md` is `**Read in full:**` by every header + has a `bkit:start/end` block + one template mirror = 2 files reach all 6, no drift. But it is doctrine-prose read by **all** agents incl. subagents — adopt-or-mint procedure has the wrong register and a wider blast radius there. Split by register. |
| **D16. Ship's post-merge dev-sync block is skipped, not re-transported** (**AMENDED** — the block does contain a push) | Build a fallback transport for ship's `checkout dev` | **Verified** `bkit-ship.md:733-751`: the merge already happened server-side via `gh pr merge`. **Correction:** the block is _not_ purely "refresh local dev + `pnpm install`" as v1 said — `:746` is `git push origin dev`, guarded by a non-skip-ci-ahead check at `:743-744`. Skipping is still judged right (local dev is never ahead in mode 3, so the push is a no-op there), but the characterisation must be accurate: the decision skips a block **containing a push**, not merely local housekeeping. |
| **D17. `rules.md:71` branch-naming needs a reframe** | Silently adopt `claude/…` branches in violation | **Verified** `rules.md:71`: "agent branches MUST contain plan `{FID}` or `{ISSUE_ID}` in kebab case". Adopting a `claude/…` branch violates it, and mode 3 **cannot rename** (push is restricted to the current branch). Once FID comes from the tracker marker (D9), the branch name carries no meaning — the rule should say so. |
| **D18. Fix the `fix/{FID}` asymmetry while here** | Ignore until it bites | **Verified**: `bkit-debug.md:301` mints `fix/{FID}` while `bkit-auto.md:86` hard-rejects any non-`feat/` branch — already inconsistent today, independent of mode 3. Adopt-or-mint must not re-encode the `feat/`-only assumption. D9 removes the reject, which fixes this for free. |
| **D19. Mirror cost is 6 sources, not 18 files** | Treat `.claude`/`.cursor`/`.opencode` as edit sites | Mirrors are force-rendered from `.bkit/` and not drift-gated by `bkit check`. The "6 x 3" framing would wrongly push toward premature abstraction. |
| **D20. macOS-path fix stays in scope but is reframed as a consumer bug** (**AMENDED** — vendored skill dropped) | Keep bundled as a mode-3 §4 item; or split out entirely | It ships to consumers via `.bkit/templates/docs/plans/template.md:195` and is a user-path coupling bug in **all three modes**. In scope (it is cheap and §4 lists it), but labelled correctly so the milestone does not hide it. **Scope corrected:** the template (verified) + repo copies `docs/plans/template.md:191` and `:575` (verified). `.agents/skills/using-git-worktrees/SKILL.md:191` is **removed** — verified as `/Users/jesse`, vendored upstream transcript output, not a `/Users/christian` coupling; editing it creates skill-sync drift for zero consumer benefit. |
| **D21. STATE MODEL — the shim is stateless and re-sourced per block; probed flags round-trip through the Step-1 `status.jsonl` row** (**NEW** — repairs v1's broken assumption) | (a) re-source + re-detect (incl. probes) per block; (b) a new cache file; (c) agent-prose carry | **v1 assumed sourced state survives across steps. It does not** — steps are separate Bash calls; only cwd persists (`bkit-design.md:30` + 4 peers, verified). v1's Flow 1 resolved the flags once at Step 1 with **nothing carrying them forward**, so a builder would implement Layer 0 and discover at integration time that no flag survives Step 1. **Repair, not replacement** — the shim's shape is kept, its register corrected to match the counter-bus it cites (stateless pure function, re-sourced per block). Split by cost: **env-only flags** (`RUNTIME`, `CAN_WORKTREE`, `CAN_SLEEP`, `WORKTREE_PATH`) are pure, free and **re-derived per block** — this is what the repo already does 34x with `REPO_ROOT`; **probed flags** (`GH_OK`) are probed **once at Step 1** and **read back from the `runtime-resolved` row** thereafter. Rejects (a) — re-running `gh auth status` on every block is a network round-trip x34 and contradicts "side-effect-free". Rejects (b) — a cache file is a new artifact, which D13 forbids; the row **is** the store, so "no new artifact type" stays literally true (`status.jsonl` already exists, #234, and already rides the phase branch). Accepts the cost in (c) honestly rather than hiding it: prose still _consumes_ the flags, so D3 buys testable detection only (see D3 as amended). **`CAN_PUSH_DEV` is no longer probed at all (D23), which removes the most expensive half of this problem.** Spike A settles it before build. |
| **D22. `bkit_wait_ci` is bash for `CAN_SLEEP=true` only; the yield branch is agent prose** (**NEW**) | v1's "one function, wait primitive selected by `CAN_SLEEP`" | v1 drew the bash/agent boundary **correctly for MCP (D4) and missed that it applies identically here**. "One check per orchestrator turn, bounded attempts" is orchestrator control flow — one tool call per turn, attempt counter surviving across turns. **Bash cannot yield a turn**, so Layer 1 is not implementable as a single function: one branch is bash, the other is prose + persisted state (the counter-bus's existing job). Further: **`CAN_SLEEP` is not probeable** — the block is a _harness policy at the tool-call boundary_, not a shell capability; the harness rejects the call containing `sleep` before the shell runs. It is therefore the one flag that structurally **cannot** obey D2's "never identity-keyed" rule, and is marked as such rather than pretending. **Two hazards, both Spike-A gated:** (1) burying `sleep` in a sourced function may **evade a command-string harness guard**, converting a loud rejection into a silent hang — the shim defeating the protection that made the flag necessary; (2) `CAN_SLEEP=true` where sleep is blocked hangs **with zero observability** (no row, no narration — the step never completes to emit one), ending only at an external session timeout. Mitigation: the attempt/elapsed cap is enforced `timeout`-wrapped, by a mechanism that **survives a blocked primitive** rather than assuming `sleep` returns. |
| **D23. The `--dry-run` probe is REJECTED; D6 is closed structurally by a double-guard + reversible checkout** (**NEW** — replaces v1's probe) | v1's `git push --dry-run origin dev` probe; probe + narration only | **The probe fails dangerous.** `--dry-run` sends no ref-update, so the pre-receive hook never fires and **branch protection is never evaluated** — it returns success where a real push would be rejected. A false-positive `CAN_PUSH_DEV=true` in mode 3 selects the local path and fires `git checkout dev` (`bkit-design.md:799`) on the live session: **Success Criterion 2 violated, Risk 1 verbatim**. v1's Risk 3 called this "needs a spike"; it is not a spike question — the primitive is unsound for this purpose by construction. **Three-part replacement, each strictly stronger than the probe:** (1) **Double-guard** — the local-checkout branch requires `CAN_WORKTREE=true` **AND** `CAN_PUSH_DEV=true`. `CAN_WORKTREE` is free, unprobed and high-confidence, and in mode 3 it is _already known false_ at that exact call site; v1 branched on `CAN_PUSH_DEV` alone and consulted nothing else. Redundancy on purpose, at the one site where being wrong is worst. (2) **Reversible checkout** — capture `git branch --show-current`, restore on exit/trap. This closes D6 **even if both flags are wrong**, which no probe can do. (3) **The real push still certifies permission**, loudly: `git push origin dev \|\| { ... exit 1; }` (`:806`, verified) already exists — mode 2's read-only `GITHUB_TOKEN` surfaces there, at the real operation, instead of being mis-certified by a dry run. Net: D2's "identity-keyed claims are wrong today" objection is answered without a probe that lies. |
| **D24. Post-close skip-token scan of the LANDED commit — transport-agnostic** (**NEW**) | Rely on the pre-merge PR-title grep + the canonical-doc re-read | **D1's whole aetiology is "the body scan didn't cover where the token actually leaked", and that hole is still open.** Verified: the only mechanised check is a **pre-merge PR-title** grep (`bkit-ship.md:538-542`); the actual squash-merge body is **never re-scanned post-hoc** on either transport — and `bkit-ship.md:995-999` is exactly where D1 leaked, already computing `SQUASH_SHA` for its CI-run lookup. The canonical-doc re-read confirms the **write landed**, not that its **message was skip-token-free**. Per D4, bash cannot intercept the MCP call to grep the message _before_ it — but it **can** grep the commit _after_ it, on any transport: `git log -1 --format=%B <SHA>` (fetch first for a server-side write). Fully bash-expressible, transport-agnostic, and it makes Success Criterion 3's "asserted rather than assumed" true instead of aspirational. Recorded in the `close-transport` row. |
| **D25. `transport-fallback` recording is cross-checked mechanically, not trusted to prose** (**NEW**) | v1: the row is written by the same prose register that might skip the fallback rule | **The audit trail this design is built around was only as trustworthy as the compliance layer that produced D1/D2** — the row is written by the same prose register that might skip the fallback rule itself. That is the design repeating, at one remove, the exact failure shape it was commissioned to fix. Mechanical assertion at Close Workflow: **if `runtime-resolved.GH_OK=false` was logged at Step 1 and the close used a mapped tool, a `transport-fallback` row MUST exist — else Failure Path.** Bash-expressible (both rows are NDJSON in a file bash can read), and it makes the Close Workflow the first _named reader_ of the rows. |
| **D26. PRE-BUILD DECISION — which MCP server serves mode 3, under which tool names** (**NEW** — build must NOT guess) | Assume `.mcp.json`'s `github` server; assume claude.ai's proxy-brokered built-ins | **Verified:** `.mcp.json:7` = `"Authorization": "Bearer ${GH_BKIT_TOKEN}"`; `cloud-bootstrap.sh:61` guards `[ -n "${GH_BKIT_TOKEN:-}" ]`. **Both read the same credential**, so §2's premise (mode 3 withholds that token) makes gh and MCP fail **together** — the fallback shares the failure of the path it exists to rescue. The escape is claude.ai's proxy-brokered built-in GitHub tools (§1: "proxy-managed → auth-reliable"), but those are a **different server with different tool names**, and the §6c map is written in `mcp__github__*` names that resolve **only** for `.mcp.json`. This is a correction to #341's **settled §6 direction**, not just to this draft: until it is resolved, the centrepiece change (#2) may be unreachable in the one runtime it targets, and every `mcp__github__*` name in the map is provisional. **Named as an explicit pre-build decision because build cannot guess it and guessing wrong invalidates §6c wholesale.** |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Capability table derived from one detection** (ideate-3 A; the capability half of ideate-1 C) | **KEPT** | Identity is an input to one table; rules read `CAN_*`. Strictly dominates the mode flag at the same cost, and bkit's own TS already chose this shape (`bkit-preflight.ts:1135`). Blast radius of runtime #5 = one table row. |
| **Sourced runtime shim + thin header pointers** (ideate-1 A) | **KEPT, with its state model repaired** (D21) | The only option that makes **detection** testable (not consumption — D3 as amended); reuses the counter-bus idiom **including its stateless re-source-per-block register**, so it is not new infra; collapses measured duplication (7 sleeps, 3 kernels) instead of documenting around it. Two v1 justifications withdrawn: the kernels **are** mechanically enforced (`bkit-ci-dispatch-gate-alignment.test.ts`), and the shim cannot hold state across steps. |
| **Materialise MCP outcomes into a bash-readable artifact** (ideate-2 A, "sentinel-bridge") | **MERGED** | The insight is right — bash gates cannot branch on a tool call with no exit code. But the artifact already exists: `status.jsonl`. Merged as D13 (`transport-fallback` rows + explicit re-read assertion) and D12 (corroboration), reusing the NDJSON ledger instead of inventing a sentinel schema. Keeps the "no new artifact type" property the seed asks for. |
| **Split retry: mechanical wait, judgment trigger** (ideate-2) | **KEPT** | The wait is mechanisable today; the retry _decision_ is not without a shim that can call MCP. Takes the achievable half. |
| **Literal seed, minimally corrected** (ideate-1 B, ideate-3 B) | **REJECTED** (contributes the drift critique) | Its critique of over-abstraction is real and is why D2's table is 4 rows with 2 probes rather than a lattice. But its own defining weakness is fatal: ~5 rules x 6 headers with **no generator and no shared include** drift on first divergent fix, and nothing mechanically enforces 7 sleep sites. Its own best mitigation ("put the rules in `rules.md`") is adopted as D15. |
| **Prose-only fallback rule** (ideate-2 C) | **REJECTED** (kept as calibration baseline) | Functionally the control-flow shape already in effect when **both** D1 and the live `search_issues` incident occurred. Formalising the wording does not change the trust root that produced two silent-wrong-result failures in this issue's own history. |
| **Shell-native MCP CLI shim** (ideate-2 B) | **REJECTED** → deferred | Honestly the best long-term shape — real exit codes, `0 results` vs `call failed` as distinct codes, fallback testable outside a live agent session. But it is a bespoke CLI duplicating the MCP client's auth/session semantics, with its own token-scoping and injection surface, and squarely the new-tooling investment the guiding principle rules out. Recorded as a deferral, not silently dropped. |
| **Uniform PR-close in all runtimes; delete the local squash** (ideate-1 C, ideate-3 C) | **REJECTED as uniform — but its PR-close half is now co-equal for shape A** (D5 amended) | Its premise is the strongest objection to this design and is recorded in Trade-offs: two close models means mode 1 never exercises the mode-3 path, which is _exactly_ how D1 happened. Rejected **as a uniform replacement** because it breaks a hard constraint (regresses mode 1: design close would need network + PR + CI where it is offline and instant today), collides head-on with F1 at 5 PRs/feature, and hard-depends on branch-protection settings invisible to git. **But v1's stated reason for rejecting it — that "D5's `push_files` recovers most of its benefit... without the regression" — no longer holds as written**, since `push_files` is not the equivalent write v1 claimed (D5 amended). Its PR-close shape therefore returns as **D5(a), co-equal for shape A** pending Spike B. Its "demote the worktree to an accelerator no step depends on" is adopted as D8. |
| **Render-time mode gating via `bkit:mode` markers** | **REJECTED** | Impossible: `bkit-trackers.ts:1` resolves at install time; runtime is unknown then. Recorded so build does not re-propose it (D14). |

## Trade-offs Accepted

**Choosing the shim (D3) over pure prose:**

- **Gain:** testable **detection** (bats, `tests/bkit-runtime.bats` — not `bkit check`, which is a drift detector: `bkit-install.ts:2402`), one shared CI-wait kernel instead of three, F1/F2 guards implemented once instead of re-argued per workflow, best bus factor (`CAN_PUSH_DEV=false` is self-documenting; `RUNTIME=3` requires knowing the §1 table by heart).
- **Sacrifice:** one more file in the shipped surface and a version-drift seam (it rides `bkit install` like its siblings). A hair further from the literal "additive header rules" framing, justified by the header-pointer precedent at `bkit-ship.md:49`. **Plus an unbudgeted migration:** extracting the kernels requires rewriting `bkit-ci-dispatch-gate-alignment.test.ts` (#261 WS-6 contract).
- **Sacrifice, named plainly because v1 hid it:** the shim makes detection testable and **consumption is still prose**. Nothing mechanically asserts that a rule _honours_ `CAN_PUSH_DEV`. v1's Risk-5 mitigation ("`bkit check` asserts every `CAN_*` has >= 1 reader") is a **presence grep** — precisely the "test asserting rule text is present will pass while shipping a broken close path" that Risk 7 and Success Criterion 1 reject. That internal contradiction is resolved by **admitting the limit**: consumption is guaranteed by Success Criterion 1's real end-to-end run in each runtime, not by any grep.

**Choosing capability flags (D2) over identity:**

- **Gain:** correct today (mode 2's read-only token), correct for runtime #4 which already ships, and correct after a token rotation (KN-CORE-1).
- **Sacrifice:** one hop of indirection, and a real risk the next maintainer does not know the table is a **default, not a truth** — `GH_OK` is probed; the rest are assumed. Mitigation: the table is one block with that fact in a comment, plus a **vitest prose audit** (modelled on `bkit-counter-prose-audit.test.ts`) asserting every `CAN_*` has >= 1 reader — a presence grep, worth its low cost, and **not** a behaviour test (see above).
- **Sacrifice, unavoidable:** `CAN_SLEEP` **cannot** obey D2 — it is harness policy, unprobeable from bash (D22). One of four flags is identity-keyed by construction, which is the exact thing D2 forbids. Accepted and marked, not papered over.

**Choosing a server-side shape-A transport (D5) over PR-close — now a spike-gated fork, not a resolution:**

- **v1's claimed gain is withdrawn.** v1: "F1, F2, D1 and D6 all dissolve at once... no new infra dependency". Actual: **D1 dissolves** (explicit `message` — this half is real and verified). **F2 does not** — the allowlist-computed set makes STRAY a tautology, converting a loud abort into a silent drop unless the guard runs over the unfiltered diff first (Flow 4). **D6 is closed by D23, not by D5.** **F1 dissolves only if `push_files` is viable at all**, which the payload defect puts in doubt.
- **Sacrifice:** design/plan close is no longer structurally identical to build/ship close — the convergence comment 2 hoped for does not happen. Shape A's mode-3 transport is exercised only in mode 3 (the rot risk ideate-1 C and ideate-3 C name). Depends on the token being permitted to write `dev` directly — the same permission mode 1 exercises, but **on a different credential, which D26 shows may be the very credential mode 3 withholds**.
- **Sacrifice, newly surfaced:** ~193 KB / 9 files inlined into one tool call (§5b token bloat), and **conflict semantics inverted** vs `-X ours` — dev wins locally, branch wins server-side. Two transports resolving the same conflict in opposite directions is the silent-divergence class named below as this design's biggest accepted risk. Repaired only to a dev-head-unmoved precondition, which is a **narrower guarantee than `-X ours`**, not an equivalent one.

**Choosing two close transports over one:**

- **Gain:** mode 1 stays offline-capable and instant; no 5-PRs-per-feature churn; a GitHub outage does not block a local design close.
- **Sacrifice:** the mode-3 transport is the path nobody debugs interactively. This is the design's **biggest accepted risk** and it is D1's exact aetiology. Mitigations layered on: the invariant (skip-token-free body) is _named and shared_ rather than living in one transport (D10) **and now mechanically re-asserted post-close on both transports (D24)**; the fallback is bounded, recorded, re-asserted (D13) **and its recording is cross-checked (D25)**; mode-1 non-regression gets a real end-to-end test, not a rule-text-presence test.

## Risks & Open Questions

**Risks**

1. **Detection misfire is the worst 3am page.** An env var absent on a resumed session → a mode-3 run believes `CAN_PUSH_DEV=true` → hits D6 (`git checkout dev` on the live session). **Now structurally guarded, not merely narrated** (D23: the double-guard means `CAN_WORKTREE=false` also has to misfire, and the trap-restore makes the checkout reversible even if both do). Recovery is `git checkout claude/…` + re-run the close step (no state carried, flags re-derived) — the _narrated_ capability line makes this a 2-minute fix instead of an hour. This is why `unknown` must be least-capable + loud. Note v1 offered **only** post-hoc recovery narration here; narration is not a guard.
2. **The detection block becomes load-bearing for all six workflows.** It must be side-effect-free and dead simple. **Its own failure must be loud** — an unset `CAN_*` and an explicit `false` are bash-indistinguishable, so a broken/stale shim otherwise degrades into a plausible-looking least-capable run (Flow 1's post-source assertion).
3. **A blocked-`sleep` hang is a worse page than any D1–D5 named, because it produces _zero_ observability** — no row, no narration, no end short of an external session timeout (D22). v1 discussed only the safe misfire direction. `timeout`-wrapped caps are the mitigation; Spike A must confirm the platform errors rather than blocks, **and** that the shim does not evade a command-string harness guard.
4. **Repo settings are not in git.** Branch protection on `dev` (and auto-delete-head-branches for shape C) are UI settings, changeable by any admin, silently breaking every autonomous close. **Promoted from Risk-only to a committed pre-close assertion** — v1 recorded the recommendation ("should be preflight-asserted") but committed to nothing, so as written it shipped **without** the assertion, reproducing the exact "assumes a human will notice" failure the risk itself names. Assert the precondition where it is cheap and loud (the close path already fails loudly on a rejected push — `:806`), and write the dependency into `docs/deployments.md`, whose stated scope is branch protection. A Step-1 assertion is **not** adopted: it would need admin scope (`gh api repos/{o}/{r}/branches/dev/protection`), which the workflow token lacks and which `.bkit/workflows/` uses nowhere today (zero `gh api` occurrences).
5. **Capability flags that are set but read nowhere**, and backoff/timeout magic numbers copy-pasted per site. Mitigation: a **vitest prose audit** (not `bkit check` — see D3) asserts every `CAN_*` has >= 1 reader and every `sleep` in `.bkit/workflows/` sits under the CI-wait rule. **This is a presence grep and is explicitly not a behaviour guarantee** (Trade-offs).
6. **Every extra MCP call widens the lethal-trifecta surface** (§5a). Adjacent to #342 — do not duplicate its scope, but the bounded-fallback cap (D13) is a real mitigation and should be attributed as such.
7. **Mode-1 non-regression needs a real end-to-end test, not review.** A test asserting rule text is present will pass while shipping a broken close path.
8. **`core.bare` flip rides along in the close block** (`bkit-design.md:798`, `bkit-ship.md:737`, both verified present) — a laptop-specific workaround, meaningless in modes 2/3, sitting inside the exact block being rewritten. **Decided: leave unconditional.** It is a no-op where `core.bare` is already false; gating it behind `CAN_WORKTREE` buys nothing and adds a branch. (Related: the standing `bkit install` core.bare issue.)
9. **`push_files`'s conflict inversion is a silent-divergence generator.** Local `-X ours` (dev wins) vs server-side branch-wins is not a difference a reviewer sees; it surfaces only when dev moved under a mode-3 close. If D5 survives Spike B, the dev-head-unmoved precondition is the only thing standing between this and a silent clobber of a concurrent dev commit.

**Pre-build decisions — build MUST NOT guess at these**

These are not "nice to resolve". Each one, guessed wrong, invalidates a load-bearing part of the design. Two spikes close all four; both are pure observation and neither writes to the bkit repo.

1. **Which MCP server serves mode 3, and under which tool names? (D26)** `.mcp.json`'s `github` (needs `GH_BKIT_TOKEN` in-sandbox — the same token whose absence _is_ the fallback trigger) or claude.ai's proxy-brokered built-in (different tool names)? The §6c map's `mcp__github__*` names resolve **only** for the former. **Blocks:** the entire §6 gh→MCP direction, i.e. #341's centrepiece change. Undiagnosed and load-bearing.
2. **Does sourced shim state survive a Bash-call boundary? (D21)** Predicted **no** — Spike A settles it in one observation. **Blocks:** all of Layer 0/1. A builder handed v1 would implement the shim and discover at integration time that no flag survives Step 1.
3. **Does `dev` accept a direct `push_files` write from the bkit token, and is the payload accepted? (D5, OQ-legacy 1)** If branch protection forbids it **or** the ~193 KB / 9-file payload proves unacceptable, **D5(a) becomes primary** — PR-close + drop `[skip ci]` from close subjects — which then makes §6d's "consider dropping `[skip ci]` from intermediate status-commit subjects" a **prerequisite, not an option**. **Blocks:** shape-A close in mode 3.
4. **Does the mode-3 harness _error_ on foreground `sleep`, or _block_? And does it inspect command strings? (D22)** Errors → `timeout`-wrapped caps suffice. Blocks → the hang risk is real and the yield branch is mandatory. Inspects command strings → burying `sleep` in `bkit_wait_ci` **evades the guard**, which would be the shim defeating the protection that motivated the flag. **Blocks:** Layer 1.

**Spike A — shim state + sleep semantics (2h, no code shipped).** In a throwaway clone, write `bkit-runtime.sh` with `bkit_runtime_detect`. From a Claude Code session, source it in one Bash call and echo `$CAN_PUSH_DEV` in the **next**. Settles (2). Then time `bkit_runtime_detect` (env-only) x34 to price per-block re-derivation, and probe (4) directly.

**Spike B — `push_files` against protected dev (3h).** On a scratch private repo with `dev` protected as bkit's: (1) `push_files` a 2-file payload, assert the ref moved; (2) repeat with the real 193 KB / 9-file set from this FID's own log dir, observe acceptance; (3) push a conflicting edit to dev first and confirm whether `push_files` clobbers it (**predicted: yes** — opposite of `-X ours`); (4) assert with `get_file_contents`, not `git show`. Settles (3) and Risk 9.

**Open questions (non-blocking)**

1. **Artifact seam (§8.2):** job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception? No MCP artifact-download tool exists; only the rich Playwright report is lost, not the failure signal.
2. **Should §6i admit a narrow read-path corroboration outside MCP on private repos?** D12 says no (doctrine forbids `gh` for tracker ops) and corroborates within MCP instead. If MCP-internal corroboration proves unreliable — and D12's amended note explains why it may — this needs revisiting. Deferred.
3. **Is the `search_issues` zero-on-private-repo failure a bkit-side scope/config issue or an upstream MCP bug?** Not diagnosed. It is logged (`docs/failures.jsonl`, `.bkit/friction.jsonl`) but the root cause is unknown, and D12 mitigates the symptom, not the cause. This is a diagnosis task, not an operability property of this design.
4. **Which of the 4 `CAN_*` flags actually earn their keep?** `CAN_SLEEP` is the weakest — it is the one flag that cannot obey D2 (D22), and the turn-yield alternative still needs validation that it can bound a poll without degenerating into rate-limited tight-looping.
5. **Not adopted, recorded so it is not silently dropped:** a periodic `bkit-analysis` pass summarising `transport-fallback` frequency against `GH_OK=false` runs was proposed in review as an ongoing reader of the new rows. It is a **new analysis feature** and outside this issue's scope; D25 gives the rows a mechanical reader inside the Close Workflow, which is the part that belongs here. Revisit if fallback frequency becomes a live concern.

**Assumptions**

- Mode-3's proxy restricts `git push` to the current branch (infrastructure, not policy) — from §1, not re-verified here.
- `push_files`/`create_or_update_file` accept an explicit commit message and an explicit file list — **verified** against the GitHub MCP `repos` toolset (enabled in `.mcp.json`). This is the basis of D5's **D1 closure only**. v1 also rested **F2 closure** on it; that is withdrawn — an explicit file list does not close F2, it makes STRAY a tautology unless the guard runs over the unfiltered diff first (Flow 4).
- **`push_files` is a Git-Data-API commit parented on the dev head, not a merge** — it cannot express `merge --squash -X ours`. Assumed, pending Spike B step 3.
- The five phases' Step 2 branch logic is uniform enough that one adopt-or-mint rule covers all five (`bkit-design.md:216-229`, `bkit-plan.md:220-233` verified; build/debug/ship spot-checked only).
- The `CAN_SLEEP=false` yield branch can carry an attempt counter across turns via the existing counter-bus. Assumed, not verified — the counter-bus is proven for cross-invocation counters (`DEBUG_ATTEMPT`), which is the same shape.
