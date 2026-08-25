Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

Every load-bearing claim below was re-verified against live source rather than trusted from the draft. The draft's source anchors are unusually accurate: `MODE` collision (`bkit-auto.md:70`), D6 checkout-before-push (`bkit-design.md:797-799` → `:806`), STRAY guard (`:802-803`), canonical assert (`:807`), PR-title assert (`bkit-ship.md:538-542`), `--body ""` (`:551-553`), blind `sleep 30` (`:556`), dev-sync block (`:733-751`), `isCloudOrCi` (`bkit-preflight.ts:1135`), install-time tracker resolution (`bkit-trackers.ts:1`), branch-naming rule (`rules.md:71`), `fix/{FID}` asymmetry (`bkit-debug.md:301`), marker parse (`bkit-auto.md:93-112`), marker-primary fallback (`bkit-cloud.yml:190-198`) — **all verified exact**. The 31 structural worktree ops is **exact**. The 7 sleeps / 3 kernels is **exact**.

The design fails on a different axis: its **mechanism** claims. The two loudest — the sourced shim and `push_files` — are each contradicted by the repo's own execution model. Both are fixable; neither is fatal to the design's shape.

## Ecosystem Search

**Capability 1 — server-side docs write (D5's `push_files`).**
What exists: `push_files` in the GitHub MCP `repos` toolset — verified live against `github/github-mcp-server` README, and `repos` **is enabled** in `.mcp.json` (`X-MCP-Toolsets: context,issues,pull_requests,repos,users,projects`). Signature confirmed: `branch` (required), `files[]` = array of `{path, content}`, `message` (required), `owner`, `repo`. `create_or_update_file` and `get_file_contents` also exist.
Fit: the tool is real and the parameters support D5's D1-closure (explicit `message`) — that half holds. **Gaps** (three, all material, see CRITICAL 2): `files[]` carries full **content**, not a diff; it is a Git-Data-API commit with "theirs" semantics, not a merge; and its parent is the dev head, so it cannot express `merge --squash -X ours`.
Recommendation: **ADAPT, not USE-AS-IS.** The tool exists but does not do what Flow 4 says it does ("the exact server-side equivalent of `git push origin dev`" — it is not).

**Capability 2 — shell-behaviour testing for a sourced `.bkit/scripts/*.sh` shim (D3).**
What exists: **bats**. `tests/counter-bus.bats` executes the real script (`bash -c ". '$COUNTER_BUS' && counter_init FOO && counter_get FOO"`) and CI runs it (`ci.yml:500-502`, `npx --yes bats tests/*.bats`). Mature, adopted, already wired.
Fit: exactly right for the shim. But the design names the **wrong engines** — see CRITICAL 5.
Recommendation: **USE-AS-IS** (`tests/bkit-runtime.bats`), correcting the design's "vitest suite / `bkit check`" wording.

**Capability 3 — sourced shell shim shipped via `bkit install` (D3 infra claim).**
What exists: the counter-bus pair, tracked in `.bkit/version:64-65`, mirrored to `.bkit/templates/.bkit/scripts/`. `bkit-modules.ts:234-237` confirms `.bkit/scripts/` templates ship by default unless explicitly excluded.
Fit: a new `.bkit/scripts/bkit-runtime.sh` rides install with a template copy + manifest regen. The design's "net-new is one file that rides `bkit install` like its siblings" is **correct**.
Recommendation: **USE-AS-IS.** Prior art worth a nod: `.bkit/scripts/bkit-mode.sh` was a sourced script **retired in #245**, and `bkit-modules.ts:1110-1130` still ships an advisory telling consumers to delete the orphan. Reintroducing a sourced `bkit-runtime.sh` on the heels of a retired `bkit-mode.sh` is fine, but the naming proximity deserves one line.

**Capability 4 — probing dev-push permission (`git push --dry-run origin dev`).**
What exists: nothing in-stack. `gh api repos/{o}/{r}/branches/dev/protection` needs admin scope; `gh api` has **zero occurrences** in `.bkit/workflows/` today.
Fit: `--dry-run` does not evaluate branch protection (no ref-update is sent, so the pre-receive hook never fires). It is unsound in the fail-dangerous direction — see CRITICAL 4.
Recommendation: **BUILD-CUSTOM — or better, drop the probe.** The existing `git push origin dev || { echo "dev push failed"; exit 1; }` (`bkit-design.md:806`) already fails loudly and correctly; the probe adds a false-positive path without adding safety.

## Stack Feasibility

Buildable with the approved stack, with two exceptions that must be respecified.

**The `WORKTREE_PATH` indirection claim is right in conclusion, wrong in mechanism — and the truth is cheaper than the draft says.** The draft's "**49** `{WORKTREE_PATH}` refs across 7 files" matches nothing measurable. Actual:

- braced `{WORKTREE_PATH}` = **54**, in **5** files (not 7) — all agent-prose subagent `Context` cwd lines
- shell `$WORKTREE_PATH` = **56**, in **7** files
- total = **110**
- literal `.worktrees/` = **38**

But the important structural fact the draft misses: **every shell `$WORKTREE_PATH` use is block-local to its assignment.** `bkit-design.md:216` assigns, `:217-237` use — one fenced block. `bkit-ship.md:248` assigns → `:249-287` use; `:933` assigns again → `:934-935` use. There are exactly **6 assignment sites**: `bkit-design.md:216`, `bkit-plan.md:220`, `bkit-build.md:278`, `bkit-debug.md:270`, `bkit-ship.md:248`, `bkit-ship.md:933`.

So D8 is **sound but misdescribed**. It is not "one indirection point"; it is **6 assignment sites + 1 header placeholder definition**. The 54 braced refs genuinely are free (they are agent-prose). Good news for scope — but a builder told "one indirection point" will look for one and not find it.

**Coupled sites D7 misses.** D7 names `bkit-design.md:30` "+ 5 peers". The `**Worktree:**` header rule exists in **5** files, not 6 (design/plan/build/debug/ship; `bkit-auto.md` has none). More importantly, three site classes are **unnamed** and each independently breaks adopt mode:

1. `bkit-design.md:23` (+4 peers) — the **Placeholders** rule _defines_ the token: "`{WORKTREE_PATH}` = absolute worktree path **set at worktree setup**, required for subagent `Context` cwd". Under adopt there is no worktree setup. The definition must change in 5 files.
2. Gate checklists — `- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)` at `bkit-design.md:288`, `bkit-plan.md:292`, `bkit-build.md:375`, `bkit-debug.md:364`, `bkit-ship.md:341`. Unsatisfiable in adopt mode.
3. `- [ ] Worktree removed...` at `bkit-design.md:869`, `bkit-plan.md:854`, `bkit-ship.md:971`.

That is **13 further sites** under D7's own "must ship in the same commit" logic.

**Constraint compliance.** ASCII operators: draft is clean (zero `≠ ≥ ≤`). Additive-over-rewrite: holds. Stack-agnostic: holds. Trackers-stay-on-MCP: holds (D12 correctly refuses a gh tracker fallback). **gh-primary / MCP-fallback: violated in spirit by D5** — see CRITICAL 3.

## Library / API Evaluation

<!-- prettier-ignore -->
| Item | Verdict |
| --- | --- |
| `push_files` (GitHub MCP `repos`) | Exists, toolset enabled, signature fits D1-closure. Fails on payload size, conflict semantics, and merge expressiveness. **ADAPT.** |
| `get_file_contents` | Exists — the correct primitive for the post-`push_files` re-read assert the draft currently specifies as a local `git show`. **USE-AS-IS.** |
| bats + `tests/*.bats` | Mature, CI-wired (`ci.yml:500-502`). Correct home for shim tests. **USE-AS-IS.** |
| counter-bus sourcing idiom | Real and generalisable **only** in its actual (stateless, re-source-per-block) form. **ADAPT** — see CRITICAL 1. |
| `git push --dry-run` | Unsound as a permission probe. **REJECT.** |
| Bundle / license / types | N/A — no new dependency. One shell file + one bats file. Zero bundle cost. |

## Integration Risk

**Blast radius: 6 workflow sources + `rules.md` + templates.** D19 is **correct** — `.claude`/`.cursor`/`.opencode` command mirrors are force-rendered and not drift-gated, so they are not edit sites.

But three integration seams are unnamed:

1. **`bkit-ci-dispatch-gate-alignment.test.ts` blocks Flow 5.** It asserts the shared kernel between the `# --- CI-Dispatch Gate shared kernel ---` delimiters is **byte-identical across build and debug** (#261, "WS-6 contract"). This **contradicts the draft's D3 justification** — the kernels are _not_ "'shared' in comment only", and it is _not_ true that "nothing mechanically enforces" them. There is a live test. Replacing them with `bkit_wait_ci` requires rewriting that test. Extraction is still the right call; the _evidence_ the draft cites for it is wrong, and the migration cost is unbudgeted.
2. **`ship:556` is deliberately out of that contract.** The same test header states "Ship is OUT of scope (keeps its pre-existing SQUASH_SHA-poll gate)." D11 deletes `sleep 30` from a gate that was explicitly excluded by a prior design. Probably still right — but it is a decision reversal, not a free win.
3. **`cloud-bootstrap.sh` lives in `.claude/hooks/`, not `.bkit/scripts/`** — tracked, in `.bkit/version:42`, with a template mirror at `.bkit/templates/.claude/hooks/`. The gh-hardening edit is a two-file mirror edit, not a `.bkit/` source edit.

**Mode-1 regression risk: low but real.** The two live mechanisms are (a) a per-block `git push --dry-run` if the shim is re-sourced per block (network round-trip × 34), and (b) the false-positive probe (CRITICAL 4) — which is mode-3-facing, not mode-1.

## PoC Approach

Two spikes, both under a day, resolving the two claims that gate everything else:

**Spike A — shim state (2h, no code shipped).** In a throwaway `/tmp` clone, write `bkit-runtime.sh` with `bkit_runtime_detect`. From a Claude Code session, source it in one Bash call and echo `$CAN_PUSH_DEV` in the **next** Bash call. This settles CRITICAL 1 in one observation. Then time `bkit_runtime_detect` with the `git push --dry-run` probe included, ×34, to price per-block re-derivation. Decide: cache-file vs re-probe vs prose-carry.

**Spike B — `push_files` against protected dev (3h).** On a scratch private repo with `dev` protected exactly as bkit's: (1) call `push_files` with a 2-file payload and assert the ref moved; (2) repeat with the real 162 KB / 9-file set from this FID's own log dir and observe whether the call is accepted; (3) push a conflicting edit to dev first and confirm whether `push_files` clobbers it (predicted: yes — opposite of `-X ours`); (4) assert with `get_file_contents` rather than `git show`. This closes Open Question 1, which the draft itself says must be resolved before build.

Both are pure observation. Neither writes to the bkit repo.

## Unknowns & Blockers

1. **Does sourced state survive a Bash-call boundary?** Predicted no (Spike A). Everything in Layer 0/1 depends on it.
2. **Does `dev` accept `push_files` from the bkit token?** The draft's own OQ1, correctly marked "Resolve before build".
3. **Which MCP server serves mode 3?** `.mcp.json`'s `github` (needs `GH_BKIT_TOKEN` in-sandbox) or claude.ai's proxy-brokered built-in (different tool names)? The `mcp__github__*` names in the §6c map only resolve for the former. Undiagnosed and load-bearing.
4. **Is `CAN_SLEEP` determinable at all?** No — see CRITICAL 6.
5. **Is the `search_issues`-zero-on-private-repo failure bkit-side or upstream?** Draft's OQ4; D12 mitigates the symptom only. Fair as scoped.

## Verdict Reasoning

CONCERNS, not FAIL. The design's _shape_ is sound and much of it is unusually well-evidenced: the capability table beats the mode flag, D6 is a genuine catch the issue never named, D7's sequencing coupling is real, D9/D14/D16/D18/D19 are correct and verified, and the 31/7/3 measurements are exact. None of that needs rework.

But three claims are stated as settled and are not true as written — the sourced shim cannot hold state across steps (CRITICAL 1), `push_files` is not "the same write, different transport" (CRITICAL 2), and the MCP fallback shares a credential with the gh path it is meant to rescue (CRITICAL 3). A builder handed this document today would implement Layer 0 and discover at integration time that no flag survives Step 1.

Not FAIL because every finding is addressable inside the current stack and scope: the shim needs a persistence mechanism (or per-block re-derivation), and D5 needs either a payload strategy or its own named fallback D5(a), which the draft already carries. The design proceeds; these must be closed first.

## CRITICAL

**1. The sourced shim cannot hold state across steps — Layer 0 and Flow 1 are not buildable as specified.**
Workflow steps are separate Bash tool calls. Shell state (vars, functions) does **not** survive between them; only cwd does — which is exactly what the header rule claims and bounds itself to: "`cd`s into `.worktrees/{FID}`; **cwd** persists across subsequent Bash calls" (`bkit-design.md:30` + 4 peers). Nothing claims variables persist.

The repo proves it: **34** `REPO_ROOT=$(...)` re-derivations across `.bkit/workflows/`; `WORKTREE_PATH` re-assigned **twice in one file** (`bkit-ship.md:248`, `:933`). The counter-bus does **not** generalise the way D3 says — every one of its 8 call sites **re-sources both files inside its own fenced block** (`bkit-build.md:573-574`, `:973-974`; `bkit-ship.md:591-592`; `bkit-debug.md:191-192`, `:432-433`, `:441`, `:451-452`) and passes every input in as an agent-substituted literal (`decide_next VERIFY_ATTEMPT "$VERIFY_ATTEMPT" "$MAX_VERIFY_ATTEMPT" step-7 failure-path`). It consumes one stdout line + an exit code **in the same block**. It never relies on persistence — that is _why_ it works. The idiom is "stateless pure function, re-sourced per block". The shim needs the opposite: `RUNTIME` + 4 `CAN_*` + `WORKTREE_PATH` resolved once at Step 1 and read at Step 2, Step 17, and the Close Workflow.

Flow 1 says "Emits 1 narrated line + 1 status.jsonl row at Step 1" — _once_. Nothing carries the flags forward. The design must pick and specify one:

- **(a) re-source + re-detect per block** — viable for pure env reads, but re-runs `gh auth status` **and** `git push --dry-run origin dev` on every block (network round-trip × 34). Also contradicts "side-effect-free": `--dry-run` is a network op that can 401 or hang.
- **(b) cache to a file** and source it per block — cheapest and matches the counter-bus register, but it is a **new artifact**, and the draft claims "no new artifact type is introduced" (D13).
- **(c) agent-prose carry** — works for the `CAN_*` flags that only prose rules read, but **collapses D3's central claim**. If gating is prose, then `bkit check` cannot assert that any rule _honours_ `CAN_PUSH_DEV`; only that `bkit_runtime_detect` computes it. D3's "it makes the fix testable; prose rules are advisory" then applies to detection only, not to consumption.

Note (c) is what Risk 5's own mitigation quietly concedes: "`bkit check` asserts every `CAN_*` flag has >= 1 reader" is a **presence grep** — precisely the "test asserting rule text is present will pass while shipping a broken close path" that Risk 7 and Success Criterion 1 reject. Internal contradiction; resolve it.

**2. `push_files` is not "the exact server-side equivalent of `git push origin dev`" — Flow 4 has four defects.**

- **Payload.** `files[]` carries full **content**, not a diff. This FID's own close set is **162,531 bytes across 9 files** (`docs/plans/202607/logs/341-three-runtimes/`) — before the canonical design doc exists. That is ~40k tokens **inlined into one tool call**, against §5b, which names token bloat as a primary reason MCP is a fallback, and against Flow 6's own "request minimal output". Splitting to `create_or_update_file` is worse: 9 calls, 9 dev commits, non-atomic, no rollback, and it blows D13's "max 1 transition per run" bound.
- **Conflict semantics are inverted.** `bkit-design.md:801` is `git merge --squash -X ours "feat/{FID}"` — on conflict, **dev wins**. `push_files` writes branch content unconditionally — **branch wins**. The two transports resolve the same conflict in opposite directions. This is not "same write, different transport"; it is the exact silent-divergence class the draft names as its own biggest accepted risk.
- **The STRAY guard becomes a tautology.** Flow 4 reads: "Compute the docs file set explicitly (allowlist, not denylist) -> STRAY guard: assert set matches `^docs/plans/|^\.bkit/friction\.md$` [preserved from :802-803]". If the set is _computed by_ the allowlist, asserting it matches the allowlist **can never fail**. The real guard (`:802-803`) runs over the **unfiltered** `git merge --squash` staging area and **aborts loudly** when the phase touched a source file. The allowlist version **silently omits** it. D5's "allowlist-by-construction, strictly stronger than STRAY's denylist grep" is backwards: it converts a loud abort into a silent drop. Fix: run STRAY over `git diff --name-only dev...feat/{FID}` (unfiltered) and Failure-Path on any out-of-allowlist entry — _then_ push the set.
- **The canonical assert is preserved in the wrong register.** Flow 4 says "re-read `dev:docs/plans/{YYYYMM}/{FID}-design.md` [preserved from :807]". `:807` is `git show "dev:..."` — a read of the **local** `dev` ref. After a server-side `push_files`, local `dev` was never fetched. If the canonical doc already exists on local `dev` from a prior run, this **passes while the write silently failed** — a false-positive assert, which is D1's exact aetiology. Must become `get_file_contents({ref: "dev"})` (verified to exist) or a `git fetch origin dev` first. D13 already demands "an independent re-read"; Flow 4 contradicts it.

**3. The MCP fallback shares a credential with the gh path it exists to rescue — GH_OK=false and MCP-available are correlated, not independent.**
`.mcp.json` authenticates with `Authorization: Bearer ${GH_BKIT_TOKEN}`. `cloud-bootstrap.sh:61-63` guards on `[ -n "${GH_BKIT_TOKEN:-}" ]` before `gh auth login --with-token`. **Both read `GH_BKIT_TOKEN`.** §2's premise for gh being flaky in mode 3 is that the platform withholds exactly that token — in which case `.mcp.json`'s `github` server gets an empty bearer and 401s too. Flow 6 (`GH_OK=false -> use the mapped MCP tool`) assumes an independence that the config does not provide. The escape is claude.ai's proxy-brokered built-in GitHub tools (§1: "proxy-managed → auth-reliable") — but those are a **different server with different tool names**, and the §6c map is written in `mcp__github__*` names that only resolve for `.mcp.json`. The design must state which server serves the fallback in mode 3 and under which names. Until then, the centerpiece change (#2) may be unreachable in the one runtime it targets.

Related: **D5 makes MCP the primary transport for shape-A closes in mode 3, not a fallback.** Flow 4 routes on `CAN_PUSH_DEV=false` regardless of `GH_OK` — so a mode-3 run with gh perfectly authed still closes via MCP. That contradicts design-input.md:13 ("gh stays **primary**... GitHub MCP is a **controlled fallback**, only when gh is unavailable"). A defensible reading exists — `push_files` is a fallback for _git_, not for _gh_ — but the design must say so, because as written Flow 4 branches on `CAN_PUSH_DEV` while Flow 6 branches on `GH_OK`, and D13 caps "max 1 gh→MCP transition per run". Does a mandatory shape-A `push_files` close consume that budget? If yes, a mode-3 run that already fell back once **cannot close**. If no, it is unrecorded. Unresolved either way.

**4. `git push --dry-run origin dev` fails dangerous, and its failure mode is the design's own Risk 1.**
Risk 3 frames this as "may not be a reliable probe behind the mode-3 proxy... needs a spike". That is too soft. `--dry-run` performs auth + ref advertisement but **sends no ref-update**, so the server-side pre-receive hook never runs and **branch protection is never evaluated**. It therefore returns **success where a real push would be rejected** — a false positive. False-positive `CAN_PUSH_DEV=true` in mode 3 selects the local path, which fires `git checkout dev` (`bkit-design.md:799`) on the live session — violating Success Criterion 2 and triggering Risk 1 verbatim. Secondary: with nothing to push it prints "Everything up-to-date" and exits 0 (false positive); with local dev behind it reports non-fast-forward and exits non-zero (false negative, unrelated to permission).

Constructive alternative the draft never considers: **make the checkout reversible instead of probing it**. Capture `git branch --show-current`, restore on exit/trap. That closes D6 without a probe, and the existing `git push origin dev || { ... exit 1; }` at `:806` already fails loudly and correctly.

**5. The testability claim names the wrong engines — three times.**
D3/Architecture: "unit-testable in the existing **vitest** suite, so **`bkit check`** can assert behaviour". Both wrong:

- Shell scripts are behaviour-tested in **bats**, not vitest. The precedent the design cites for everything else — counter-bus — is tested at `tests/counter-bus.bats`, which executes the real script; CI runs it at `ci.yml:500-502`. `pnpm test` is `vitest run` and **does not include bats** (`test:bats` is a separate script).
- **`bkit check` is a drift detector, not a test runner.** `bkit-install.ts:2402`: `const dryRun = verb === "check"`. It is the install engine in dry-run. It cannot assert the behaviour of a shell function. Risk 5's "`bkit check` asserts every `CAN_*` has >= 1 reader" would be a **vitest prose audit** (the `bkit-counter-prose-audit.test.ts` pattern), not `bkit check`.

Concrete for the builder: shim behaviour → `tests/bkit-runtime.bats`; prose-rule presence → a vitest audit modelled on `bkit-counter-prose-audit.test.ts`; drift → `bkit check` + `.bkit/version`. Three engines, three jobs. The draft merges them.

**6. `CAN_SLEEP` is not probeable, and `bkit_wait_ci` cannot be one bash function.**
Two distinct problems:

- **Not determinable from inside bash.** The mode-3 block on foreground `sleep` is a _harness_ policy enforced at the tool-call boundary, not a shell capability. A shim cannot probe it: the harness rejects the call containing `sleep` before the shell runs. So `CAN_SLEEP` can only be **identity-derived** — which the table does (`true/true/false/false`), but that makes it precisely the "identity-keyed capability claim [that] is wrong today" D2 forbids. OQ5 half-sees this ("`CAN_SLEEP` is the weakest"); it is worse than weak — it is the one flag that structurally cannot follow D2's own rule.
- **A worse second-order risk:** burying `sleep` inside a sourced function means the tool call reads `bkit_wait_ci`, with no literal `sleep` for the harness to gate on. If the block is enforced by command-string inspection, the shim **evades the guard** and converts a loud tool-level rejection into a silent hang. Must be established in Spike A before `bkit_wait_ci` is authored.
- **The `CAN_SLEEP=false` branch is not bash.** "yield: one check per orchestrator turn, bounded attempts" is _agent_ control flow — one tool call per turn, with the attempt counter surviving across turns. That is the same hard boundary D4 correctly draws for MCP ("bash can detect `GH_OK=false`... it cannot invoke the mapped tool"), and the design misses that it applies identically here. Layer 1's "`bkit_wait_ci` -> bounded poll; wait primitive selected by `CAN_SLEEP`" is therefore **not implementable as a single function**: one branch is bash, the other is prose + persisted state — which loops back to CRITICAL 1.

## OPTIONAL

- **Correct the D8 numbers and mechanism.** Not "49 refs across 7 files, one indirection point" but: **54** braced (5 files, genuinely free — they are agent-prose), **56** shell (block-local), **6 assignment sites** (`bkit-design.md:216`, `bkit-plan.md:220`, `bkit-build.md:278`, `bkit-debug.md:270`, `bkit-ship.md:248`, `bkit-ship.md:933`). The conclusion survives; the framing misleads.
- **Add the 13 unnamed coupled sites to D7**: the Placeholders rule `bkit-design.md:23` +4 peers (which _defines_ `{WORKTREE_PATH}` as "set at worktree setup"), the 5 "Worktree created/resumed" gate items (`:288`/`:292`/`:375`/`:364`/`:341`), and the 3 "Worktree removed" gate items (`:869`/`:854`/`:971`).
- **D1 is right and `RUNTIME` is clean.** `MODE=CI|BRIEF` verified at `bkit-auto.md:70-80`. Token census: `PUSH_MODE` ×25, `DEBUG_MODE` ×22, `MODE` ×11, `DIAGNOSE_MODE` ×4. `RUNTIME` has **2 repo hits**, both the comment `# RUNTIME GATING` (`bkit-cloud.yml:8` + its template) — describing _secret-presence auto-detect_, an unrelated sense. No variable collision; worth one line so the comment's sense is not conflated.
- **D16's characterisation is incomplete.** `bkit-ship.md:733-751` is not purely "refresh local dev + `pnpm install`": `:746` is `git push origin dev`, guarded by a non-skip-ci-ahead check at `:743-744`. Skipping is still almost certainly right (local dev is never ahead in mode 3), but the block does contain a push.
- **`bkit-design.md:807`'s canonical assert has no peer in `bkit-plan.md`** — plan's close (`:786-792`) has the STRAY guard (`:788-789`) but no `git show dev:` assert; only a gate checkbox at `:850`. If Flow 4 is a shared shape-A prologue, plan gains an assert it lacks today. Fine, but name it.
- **Drop `-X ours` from the comparison or address it.** If `push_files` ships, `bkit-design.md:801`'s `-X ours` is the only place the two transports' conflict behaviour is written down, and they disagree.

## OUT OF SCOPE

- **The `.agents/skills/using-git-worktrees/SKILL.md:191` claim is wrong and should be dropped from D20.** Flow 7 lumps it with the `/Users/christian` leak. Verified: `:191` is `Worktree ready at /Users/jesse/myproject/.worktrees/auth` — **`/Users/jesse`**, upstream (obra/superpowers) illustrative transcript output, not a bkit path coupling. The other two `/Users/jesse` hits (`systematic-debugging/CREATION-LOG.md:7`, `root-cause-tracing.md:36`) are the same. These are **vendored skill content**; editing them creates drift on the next skill sync. D20's real scope is `.bkit/templates/docs/plans/template.md:195` (ships to consumers — verified, correct) plus repo copies `docs/plans/template.md:191` and `:575` (both verified). That is the consumer bug; the vendored skill is not.
- **#342 lethal-trifecta mitigation** — correctly deferred; do not duplicate.
- **§6i relaxation for private-repo tracker corroboration** — correctly deferred (draft OQ3).
- **Shell-native MCP CLI shim** — correctly rejected/deferred; agreed, it is the right long-term shape and the wrong investment now.
- **`core.bare` flip disposition** (Risk 8, `bkit-design.md:798`, `bkit-ship.md:737`) — verified present in both blocks. Genuinely a laptop-only workaround (see the standing `bkit install` core.bare issue). Leave unconditional; it is a no-op where `core.bare` is already false, and gating it buys nothing.
