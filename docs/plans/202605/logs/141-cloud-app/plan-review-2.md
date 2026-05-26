Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

All cited file paths, line numbers, and symbols in the draft were re-verified against the
live worktree (`.worktrees/141-cloud-app`). Path/line/symbol accuracy is high — the plan's
"line numbers re-checked against current `dev`" claim holds for: `bkit-cloud.yml` template
(151 lines: permissions 67-73, concurrency 64, header framing 22-25, `@@CLOUD_TRACKER_*@@`
sentinels), rendered copy (150 lines, Linear-free), `bkit-modules.ts` (`renderCloudWorkflow`
1910-1921, `runCloudModule` 1923-2084, advisory id 2064, `github.token` line 2075,
`mentionTipLine` 2060-2062, `setConsumerBkitField` 2013, `MODULE_REGISTRY` 2090,
`MODULE_DISPATCH_ORDER` 2104), `bkit-cli.ts` (`cloud` in MODULE_FLAGS 60, OPTIN_MODULES 78,
generic parse 240, `--force` 200, printUsage 300-305, examples 333), `bkit-install.ts`
(tracker resolution 919-962, post-install ~988), `bkit-manifest.ts` (`CLOUD_MANIFEST`
211-221, `CloudAgents` block 113-138), build/debug/ship gate lines, preflight `Auto` sites,
`cloud.md` (matrix 23, path E 30, alignment note 47, `github.token` framing 367/369),
`claude.yml` (id-token 25, assigned 9), `bkit-cloud.md` orchestrator (Step 2 143-181, Step 3
185-230), `deployments.md` § CI trigger 309-321. The CRITICAL items below are dependency
inversions in the execution ordering, not path errors.

## CRITICAL

1. **T2.3 close-workflow marker depends on a `bkit:auto` re-read that runs AFTER the
   commit it must gate — ordering inversion (build path).**
   The FINAL SCOPE decision 8 requires `bkit [auto route]` on the close-workflow commit
   "only when the issue carried `bkit:auto` at close time." The plan (Block 2 / T2.3) says
   to "reuse" the kill-switch re-read at `bkit-build.md:963-970". But that re-read is Step 4,
while the close-workflow commit is created at `bkit-build.md:947`and pushed at`:951`—
the re-read happens AFTER the commit is already made and pushed. As written the task is
not executable: the marker decision needs a`bkit:auto`value that does not yet exist at
commit time. The plan must either (a) move a`bkit:auto`re-read BEFORE line 947, or
(b) explicitly source the decision from the Step-1`issue-read` `{LABELS}`
(`bkit-build.md:138-141`) — which is "build-start time," not "close time," a semantic the
   plan must then justify against decision 8. The "reuse the 963-970 re-read" instruction
   resolves to neither and is a fabricated dependency (cites an artefact that is not
   available when consumed).

2. **T2.4 marks the wrong commit on the dominant debug re-trigger path (PR-mode), and
   inherits the same post-commit re-read inversion.**
   T2.4 / Block 2 names "the debug re-trigger commit (create-pr at line 844 / close path)"
   as the carrier of `bkit [auto route]`. But in `bkit-debug.md` the commit that is HEAD at
   CI time is mode-dependent:
   - PR-mode (`DEBUG_MODE=pr`, existing PR — the normal auto-route re-trigger): the loud
     trigger is the **close-workflow** commit at `bkit-debug.md:806`, pushed at `:810`, and
     `TRIGGER_PR=0` (line 824) means the create-pr commit at `:844` never runs. The marker
     must go on `:806`, not `:844`.
   - local-mode: the create-pr commit at `:844` creates the PR that fires CI.
     T2.4 targets only `:844`, so in the common PR-mode case the marked commit is never created
     and the actual HEAD (`:806`) is unmarked → the two-tier gate (T2.7) never sees the marker →
     auto-route silently does not fire. This breaks the load-bearing "marked commit must be
     HEAD at CI time" invariant (decision 8 / D2). Additionally, the debug kill-switch re-read
     at `bkit-debug.md:863-870` (Step 12) runs after BOTH `:806` and `:844`, so the same
     "only when bkit:auto at close time" re-use inversion as item 1 applies here.

3. **Block 2 internal ordering vs. the marker-gate dependency is under-specified for the
   two-tier gate's HEAD assumption.**
   The two-tier CI gate (T2.7) reads `github.event.workflow_run.head_commit.message` for
   `bkit [auto route]`. This is only correct if the marked close-workflow commit is the
   literal HEAD of the push that triggers CI. Items 1-2 show the marker placement is not yet
   pinned to the HEAD commit on either path. Because T2.7's `Done when` only asserts
   "job skips without the marker" (a negative test) and not "fires when the marked
   close-workflow commit is HEAD," the plan has no task that verifies the positive end of the
   gate dependency (marker present on HEAD → job runs → dispatch). Combined with the
   FINAL-SCOPE note that this surface has "no executable unit harness for GHA `if:`", the
   marker→HEAD→gate chain is asserted but never demonstrated. Add an explicit
   ordering/verification step (e.g. a render/grep assertion that the close-workflow commit
   message — and the debug PR-mode trigger commit — carries the marker, plus a
   YAML-review/positive-case item) so the Block 2 backbone (`marker being HEAD` → gate) is
   actually closed, not just declared.

## OPTIONAL

- **Auth-model coherence between `claude.yml` and `bkit-cloud.yml` is asserted but the
  mechanisms differ.** `claude.yml:37` authenticates via `claude_code_oauth_token`
  (`CLAUDE_CODE_OAUTH_TOKEN`), while `bkit-cloud.yml` will use `ANTHROPIC_API_KEY` + OIDC
  (`id-token: write`). T4.1 says "both authenticate as the App" — true at the App-identity
  level, but the secret/token surface is not identical. The plan should state explicitly that
  this divergence is intended (OAuth-token App for mention path, API-key+OIDC for the CI
  path) so a builder does not "reconcile" them into one mechanism.

- **`claude.yml` is bkit-repo-only, not a shipped template.** Confirmed: no
  `.agents/templates/**/claude.yml` exists; only the live `.github/workflows/claude.yml`.
  T4.1 notes this, but the consumer-facing `@claude /bkit-<phase>` capability therefore
  depends entirely on the consumer running `/install-github-app` (which generates their own
  `claude.yml`). The plan could make explicit that Block 4's `claude.yml` edits do not reach
  consumers via `bkit install`, so checklist item (10) is bkit-repo-verifiable only and
  consumer coverage rides on the advisory (T1.7) + `/install-github-app`.

- **T2.2 cites `deployments.md:321` as the contract for both worktree-setup AND create-pr,
  but `:321` lists only create-pr (not worktree-setup).** The doc list at line 321
  (`start-workflow, summary, create-pr, … worktree-cleanup`) does not include
  `worktree-setup`. The divergence the plan fixes is real (both `bkit-build.md:260` and `:915`
  are currently untagged), but the worktree-setup half is a genuinely new contract addition,
  not a "workflow lags the doc" fix. T2.5's documentation task (`deployments.md` update)
  should add worktree-setup to the line-321 list so the contract and the workflow agree.

- **T1.5 manifest-split approach left open ("split CLOUD_MANIFEST … or keep one manifest +
  gate emission").** Leaving the uninstall-correctness approach undecided is reasonable for a
  plan, but the `Done when` ("uninstall removes the variant's files") only works if the
  manifest knows which variant owns which file. Recommend the plan pick the split-manifest
  approach (or a per-entry variant tag) so uninstall of a `cloud=claude` install does not
  orphan `.cursor/*` and vice versa — the very orphaning FINAL SCOPE decision 3 calls out.

## OUT OF SCOPE

- Broadening App trigger surfaces beyond `issue_comment` (`pull_request_review_comment`,
  `pull_request_review`) — `claude.yml` already wires these (lines 6-19); the plan correctly
  defers them as "Future" until the primary path is verified live.
- The live-dispatch runtime verification (checklist item 1) is correctly carried as a
  human-gated post-merge item, not automatable in-plan.
- Linear-side relabelling in a live workspace (consumer action) — correctly out of scope;
  bkit ships the renamed snippets only.
