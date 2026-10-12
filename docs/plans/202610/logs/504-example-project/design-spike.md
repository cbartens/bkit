Verdict: FAIL

<!-- verdict:end -->

# Design Spike

Settles the four `Unknowns & Blockers` from `design-review-1.md` (buildability lens, `Spike: TRUE`) plus one derived from its `PoC Approach` item 1. Probe code lives under `docs/plans/202610/logs/504-example-project/spike/` only; no tracked file outside it was created or edited.

## Claims

Ordered by blast radius.

| #   | Claim (falsifiable) — the design depends on this being true                                                                                                                                                                 | Design element resting on it                                                                                            | Class       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------- |
| C1  | In a repo whose default branch is `main` with a pushed `dev`, `bkit worktrees setup --workflow=design --fid=<FID> --month=<YYYYMM> --worktrees` exits 0, mints `feat/<FID>` off `origin/dev`, and installs deps.            | Runner flow (create + push `dev`, `pnpm install`); success criteria 1–2; the entire demo (its first workflow step).     | `SETTLED`   |
| C2  | A repo whose only CI job is `bkit-tests-check` (single job, no lanes, no `needs:`, no `!cancelled()`) yields a completed green run at PR head, and `bkit runs gate` returns exit 0 there.                                   | Hand-written ~40-line `bkit-ci.yml`; `bkit.capstoneJob`; success criterion 3; `/bkit-ship` merge gate.                  | `SETTLED`   |
| C3  | The dual-load guard (export when `module` exists, attach a global otherwise) lets one `.js` serve both a classic `<script src>` off `file://` and `require` under `node --test`.                                            | Fixture logic-file decision; the dual-load contract; the double-click demo deliverable.                                 | `SETTLED`   |
| C4  | `bkit install` + the seeded `bkit:gate:*` chain leave the fixture gate-clean — no `gate-missing-called-scripts` / `gate-noop` / `gate-tier-not-wired`, and `pnpm bkit:gate:static-unit` exits 0 — given pre-declared stubs. | Fixture `package.json` gate-stub decision.                                                                              | `SETTLED`   |
| C5  | The runner's documented install command, `bkit install --tracker=github` (as written), completes successfully.                                                                                                              | Runner flow step 5 ("THEN `bkit install --tracker=github`"); Decisions row "The setup script wires `--tracker=github`". | `DISPROVEN` |

## Method

Throwaway probes, all under `spike/`. Live-boundary probes ran against a real throwaway repo `cbartens/bkit-example-spike-20261012` (public → zero Actions minutes), created with `gh repo create --public --source . --push`.

| #   | What was built                                                                                                           | Where it ran                                | Exact command                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Fixture clone (`main` default, `dev` pushed, committed `pnpm-lock.yaml`), then the real worktree command.                | `spike/probe-worktree/clone`                | `node <bkit>/dist/cli.js worktrees setup --workflow=design --fid=504 --month=202610 --worktrees`                                                         |
| C2  | Fixture repo with a one-job `.github/workflows/bkit-ci.yml`; PR #1 (`feat/504-spike` → `dev`); then the real merge gate. | live `cbartens/bkit-example-spike-20261012` | `node <bkit>/dist/cli.js runs gate --repo cbartens/bkit-example-spike-20261012 --pr 1` (and `--head <sha> --branch feat/504-spike --event pull_request`) |
| C3  | `logic.js` with the guard, classic `index.html`, a `type="module"` variant, and a `require`-based test.                  | `spike/probe-dual-load`                     | `node --test`; `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --dump-dom file://<abs>/index.html`                        |
| C4  | Fixture `package.json` with pre-declared stub tool scripts + `bkit` block; git init; install; advisory replay; gate.     | `spike/probe-install`                       | `node <bkit>/dist/cli.js install --claude --tracker=github`; `node <bkit>/dist/cli.js doctor`; `bkit check`; `pnpm bkit:gate:static-unit`                |
| C5  | Same fixture, install invoked exactly as the design writes it.                                                           | `spike/probe-install`                       | `node <bkit>/dist/cli.js install --tracker=github`                                                                                                       |

`<bkit>` = the working-tree CLI (`.../504-example-project/dist/cli.js`, bkit 5.0.2). Environment: Node v24.16.0, pnpm 10.34.4, `gh` 2.88.1 authed as `cbartens` (scopes `gist, manage_runners:org, project, read:org, repo, workflow`).

## Evidence

Verbatim captured output; commands above.

**C1 — SETTLED** (worktree mint off `dev`, install included). First attempt lacked a committed lockfile:

```
[bkit-worktrees] ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
[bkit-worktrees] dependency install failed (exit 1)
WORKTREES_EXIT=5
```

After the runner's own step-4 `pnpm install` + commit produced `pnpm-lock.yaml`:

```
{"worktreePath":".../clone/.worktrees/504","repoRoot":".../clone","branch":"feat/504","mode":"created","owned":true,"rebaseConflict":false,"sentinel":null,"logDir":"...","baseSha":"7d8eaa624c3964f2d0de64692286ce90302ad262","copied":[],"copyMissing":[".env",".env.local"],"installed":true}
WORKTREES_EXIT=0
merge-base origin/dev HEAD: 7d8eaa624c3964f2d0de64692286ce90302ad262
dev tip:                    7d8eaa624c3964f2d0de64692286ce90302ad262
bkit installed in worktree: yes
```

**C2 — SETTLED** (single-job CI satisfies the merge gate). Check name, run, and both gate invocations:

```
bkit-tests-check  pass  11s  https://github.com/.../runs/38204611027/job/114665210506
completed  success  38204611027  bkit-ci  feat/504-spike  pull_request
GATE_PR_EXIT=0
{"code":0,"passed":true,"overridden":false,"head":"aac1a836476689272ca28a8501e16741585065f7","mergeHead":"aac1a836476689272ca28a8501e16741585065f7","testedHead":"aac1a836476689272ca28a8501e16741585065f7","runId":38204611027,"runUrl":"https://github.com/cbartens/bkit-example-spike-20261012/actions/runs/38204611027","conclusion":"success","capstone":"bkit-tests-check","ciWorkflow":"bkit-ci.yml","repo":"cbartens/bkit-example-spike-20261012","skippedLanes":[],"nonBookkeepingPaths":[],"reason":"capstone bkit-tests-check=success at head aac1a836476689272ca28a8501e16741585065f7 (run 38204611027, ...)"}
GATE_HEAD_EXIT=0   # identical stdout via --head <sha> --branch feat/504-spike --event pull_request
```

**C3 — SETTLED** (guard serves both loaders; module variant confirms the trap). `node --test`:

```
✔ guard exports evaluate under require (0.493ms)
ℹ tests 1   ℹ pass 1   ℹ fail 0
EXIT=0
```

Headless Chrome off `file://` (classic `<script src>` vs `type="module"`):

```
=== classic index.html off file:// ===
<div id="out">{"phase":"build","counters":{"attempts":2}}</div>
=== module index-module.html off file:// ===
<div id="out">EMPTY</div>
```

**C4 — SETTLED** (gate-chain clean). `install --claude --tracker=github` seeded the gates and wrote the bkit block; advisory ids were `context-fetch-missing, bkit-not-on-path, first-install-postinstall-steps, tracker-setup-github, github-project-board-sync-unconfigured, cloud-secrets-three-locations, vale-package-not-synced, mcp-env-missing-dotenv` — **no `gate-*` advisory**. Gate + drift:

```
bkit:gate:static => pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta
bkit:gate:static-unit => pnpm bkit:gate:static && pnpm test
bkit block: {"issueTracker":"github","capstoneJob":"bkit-tests-check","ciWorkflow":"bkit-ci.yml"}
GATE_EXIT=0     # pnpm bkit:gate:static-unit
BKIT_CHECK_EXIT=0
```

Caveat (corroborates the review's OPTIONAL note): with the hand-written CI present, one **warning-only** advisory does fire:

```
--- 7/8 [advisory] ci-yml-capstone-contract-drift ---
... the capstone `if: ${{ !cancelled() }}` guard ... (use `!cancelled()`, never `always()`).
... bkit-ci.yml is yours to own, so bkit can't rewrite it — this is a heads-up, not a hard failure.
```

**C5 — DISPROVEN** (documented install command fails):

```
$ node <bkit>/dist/cli.js install --tracker=github
[bkit] `bkit install` requires at least one module flag. Name what to install: --claude, --cursor, --codex, --opencode=<provider> (plus opt-in --auto=<claude|cursor>). Run `bkit help` for usage.
EXIT=1
```

Adding the flag (`install --claude --tracker=github`) succeeds (see C4).

## Design Impact

**C5 (`DISPROVEN`) invalidates the runner's documented install step.** The runner flow step 5 and the Decisions row both write `bkit install --tracker=github`; run literally it exits 1 _after_ the repo has been created and the fixture copied — i.e. it lands exactly on review-2's failure mode 2 (orphan, half-seeded private repo). The evidence supports a corrected command that names at least one module flag, e.g.:

```
bkit install --claude --tracker=github
```

Two consequences the design must absorb: the runner must name the host/module (the design does not say which), and review-2's preflight/`[Context]`-prefix request now matters, because the failure happens mid-sequence with the repo already existing.

No other claim is invalidated. C1–C4 rest intact on the evidence above.

## Unsettled

None.

(The live `bkit runs gate` and worktree probes were fully attempted at the real GitHub boundary, so no claim is `BLOCKED`.)

## Verdict Reasoning

`FAIL`: claim C5 is `DISPROVEN` by captured evidence, and the mapping is `FAIL = any claim DISPROVEN`. Four of the five load-bearing claims held under honest attempts at the real boundary — the worktree mint off `origin/dev` with `main` as default (C1), the single-job CI satisfying the ship merge gate (C2), the off-`file://`-plus-`require` dual-load guard (C3, with the module variant's `EMPTY` confirming exactly the trap the guard prevents), and the seeded gate chain staying clean (C4) — but the runner's written install command does not run. It is a one-flag fix, yet it is load-bearing (the first step that mutates the fresh repo) and was not caught by either review, so it must be fixed before planning.

Two operational notes carried into the design:

- **Throwaway repo left behind, and the design's own teardown has the same hole.** `gh repo delete cbartens/bkit-example-spike-20261012 --yes` returned `HTTP 403 … needs the "delete_repo" scope`, so the probe repo remains. Manual cleanup: `gh auth refresh -h github.com -s delete_repo && gh repo delete cbartens/bkit-example-spike-20261012 --yes`. The design's retention step ("delete green repos") makes the same call and the documented preflight (`gh auth status`, Node, pnpm) does not check for `delete_repo` — a silent gap worth a preflight assertion or a README line.
- **The uncaught install-command defect shares a failure shape with the tracker-`none` risk.** Both are silent-ish, mid-sequence, and only a read-back/preflight (review-2's OPTIONAL "tracker read-back") would catch them.
