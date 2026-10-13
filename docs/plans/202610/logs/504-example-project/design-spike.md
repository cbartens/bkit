Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

Settles the load-bearing unknowns the review flagged `Spike: TRUE` (U1, U2) plus the corrected-invocation unknowns the revision notes bind (U3), restated as falsifiable claims. Ordered by blast radius. Probe code lives only under `docs/plans/202610/logs/504-example-project/spike/`; no tracked file outside that directory was created or edited.

| #   | Claim (falsifiable) — the design depends on this being true                                                                                                                                                                                 | Design element resting on it                                                                                                              | Class       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| C1  | The corrected test invocation the revision notes bind (glob `node --test "example/**/*.test.js"`) is valid for the capstone on any Node LTS the design may pin.                                                                             | Fixture-harness `scripts.test`; the capstone `tests` step; the executed-count assertion; the whole pass/fail signal; success criterion 3. | `DISPROVEN` |
| C2  | An invocation form exists that runs `example/`'s tests on Node 20, 22 and 24 alike, so the design keeps a free choice of LTS.                                                                                                               | Same elements as C1; the remedy the design can adopt without coupling form to pin.                                                        | `SETTLED`   |
| C3  | `node --test` exits 0 over zero discovered tests, so a green capstone can be vacuous without an executed-count assertion.                                                                                                                   | The executed-count assertion (review-2 CRITICAL 2); "green == validated".                                                                 | `SETTLED`   |
| C4  | An executed-count assertion (≥1 passed) is deterministic and AI-free, and applied unconditionally it reds every reset push to `dev` — the reset state always has zero tests — so it must be PR-only.                                        | The assertion's placement in the capstone; success criterion 3 ("reset pushes … never red `dev`").                                        | `SETTLED`   |
| C5  | A deterministic classic-script assertion (`<script src>` present, no `type="module"`) classifies a built page correctly across attribute orders and quote styles.                                                                           | The PR-only blank-page signal (review-2 CRITICAL 4); the off-disk demo deliverable.                                                       | `SETTLED`   |
| C6  | With the PR-only sentinel, classic-script and privacy steps plus the non-gating screenshot/upload steps added to the single `bkit-tests-check` job, the capstone is present and green at PR head and `bkit runs gate` returns exit 0 there. | The hand-written `bkit-ci.yml`; `bkit.capstoneJob` / `bkit.ciWorkflow`; `/bkit-ship`'s merge gate; success criterion 3.                   | `SETTLED`   |
| C7  | A reset-shaped push to `dev` (fixture present, sentinel present, zero tests) leaves the same job green, because the PR-only steps skip.                                                                                                     | "reset pushes to `dev` run tests only"; the claim that a run's own reset never reds `dev`.                                                | `SETTLED`   |
| C8  | The CI screenshot step captures the built page and uploads it as an artefact without being able to fail the run.                                                                                                                            | Revision notes §3 (screenshot in CI, non-gating, CI-only dependency).                                                                     | `SETTLED`   |
| C9  | `--bootstrap`'s verify path is idempotent against a live public repo: it detects drift, repairs it, re-verifies clean, and never creates or deletes the repo.                                                                               | Success criterion 1; the durable root harness's only refresh path; the drift-repair story for `main` + `bkit-ci.yml` + the capstone name. | `SETTLED`   |
| C10 | One full pipeline run completes design → plan → build → ship on the persistent repo with the capstone green at the merged PR, and its rows land in `.bkit/stats.jsonl`.                                                                     | Success criteria 1–4; the benchmark's premise (N runs, version-grouped medians); the run-marker read path.                                | `BLOCKED`   |

## Method

Throwaway probes under `spike/`; live-boundary probes ran against the throwaway public repo `cbartens/bkit-example-spike-20261012` (public ⇒ zero Actions minutes). No new dependencies were installed; no dependency tree or build output was created.

| #      | What was built                                                                                                                                                                                                               | Where it ran                                                       | Exact command                                                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1, C2 | `example/` + root `package.json` trees, one with a `*.test.js` and one without; a 4-form × 3-version matrix over `node --test`.                                                                                              | `spike/probe-node-test/{withtests,notests}`; CI on `ubuntu-latest` | `bash matrix.sh "$PWD"` (Node 24.16.0, and `fnm exec --using=22.23.2 bash matrix.sh "$PWD"`); CI: `node --test --test-reporter=tap "example/**/*.test.js"` vs `node --test example` on Node 20.20.2 |
| C3     | The zero-match glob and the empty-tree bare run.                                                                                                                                                                             | `spike/probe-node-test/notests`                                    | `node --test "notests/**/*.test.js"`; `node --test` in an empty tree                                                                                                                                |
| C4     | `assert-count.sh` — TAP-report parse + `# pass ≥ 1` assertion; run against a 1-test tree and a 0-test tree.                                                                                                                  | `spike/probe-node-test`                                            | `bash assert-count.sh "root/example/**/*.test.js"`; `bash assert-count.sh "root/notests/**/*.test.js"`                                                                                              |
| C5     | `assert-classic.sh` + five HTML pages: 2 classic (attribute order / quote-style variants), 3 module variants (attr-first, inline, deferred).                                                                                 | `spike/probe-classic`                                              | `bash assert-classic.sh <file>` ×5                                                                                                                                                                  |
| C6     | PR-head state: `example/` with the built page, `logic.js` and its test; the design's final 70-line single-job `bkit-ci.yml`; PR #2 → `dev`.                                                                                  | live repo, run `38212991262`; gate from a checkout of the run repo | `gh pr create …`; `node <bkit>/dist/cli.js runs gate --pr 2` (cwd = run-repo checkout)                                                                                                              |
| C7     | Reset-shaped `dev` (fixture `example/index.html` carrying the sentinel, zero tests) with the same final workflow; push to `dev`.                                                                                             | live repo, run `38213206402`                                       | `git push origin dev`                                                                                                                                                                               |
| C8     | The PR-only `google-chrome --headless=new --screenshot` + `actions/upload-artifact@v4` steps, both `continue-on-error: true`.                                                                                                | live repo, run `38212991262`                                       | `gh api repos/…/actions/runs/38212991262/artifacts`                                                                                                                                                 |
| C9     | `new-run.mjs --bootstrap` — cut-down create-or-verify-and-repair: `gh repo view` exists-check, per-file sha compare of `main` (fixture, sentinel asserted) and `dev` (harness), repair by re-publishing the source of truth. | live repo; `spike/probe-bootstrap`                                 | `node new-run.mjs --bootstrap --repo cbartens/bkit-example-spike-20261012` ×4 (verify, re-verify, drift-injected, re-verify)                                                                        |
| C10    | Nothing — the claim needs the human hard stops and the runner the design has not built yet.                                                                                                                                  | —                                                                  | —                                                                                                                                                                                                   |

`<bkit>` = the working-tree CLI (`…/504-example-project/dist/cli.js`, bkit 5.0.2). Environment: Node 24.16.0 (repo default) and 22.23.2 (fnm) locally, Node 20.20.2 / 22.23.3 on the runner; pnpm 10.34.4; `gh` authed as `cbartens` (scopes `gist, manage_runners:org, project, read:org, repo, workflow`).

## Evidence

Verbatim captured output; commands above. GitHub log lines are shown with the `bkit-tests-check\t<step>\t<timestamp>` prefix stripped.

**C1 — `DISPROVEN`** (the bound glob form is not valid on Node 20 LTS). CI, Node 20.20.2 (`setup-node@v4`, `node-version: "20"`, run `38212887513`):

```
node: v20.20.2
--- 20.A: glob, NO test files present ---
20.A_RC=1
20.A_OUT_START
Could not find '/home/runner/work/bkit-example-spike-20261012/bkit-example-spike-20261012/example/**/*.test.js'
20.A_OUT_END
--- 20.B: bare dir positional (the draft's form) ---
20.B_RC=0
TAP version 13
1..0
# tests 0
--- 20.D: with a temp test file added ---
20.D_RC=1
Could not find '/home/runner/work/bkit-example-spike-20261012/bkit-example-spike-20261012/example/**/*.test.js'
--- 20.E: cd example && bare node --test, temp test present ---
20.E_RC=0
1..1
# tests 1
# pass 1
```

Same glob form on Node 22.23.3 (CI, same run) — valid only because the version is ≥ 22:

```
node: v22.23.3
--- 22.A: glob, NO test files present ---
22.A_RC=0
1..0
# tests 0
--- 22.D: with a temp test file added ---
22.D_RC=0
1..1
# pass 1
```

Local matrix, Node 24.16.0 and Node 22.23.2 (`bash matrix.sh "$PWD"`):

```
=== tests-present ===
v24.16.0 F1 node --test example                         rc=1  tests=1    first_err=Error: Cannot find module '…/example'
v24.16.0 F2 node --test "example/**/*.test.js"          rc=0  tests=1
v24.16.0 F3 (cd example && node --test)                 rc=0  tests=1
v24.16.0 F4 node --test (bare root)                     rc=0  tests=1
=== no-tests ===
v24.16.0 F1 node --test example                         rc=1  tests=1    first_err=Error: Cannot find module '…/example'
v24.16.0 F2 node --test "example/**/*.test.js"          rc=0  tests=0
v24.16.0 F3 (cd example && node --test)                 rc=0  tests=0
v24.16.0 F4 node --test (bare root)                     rc=0  tests=0

=== tests-present ===
v22.23.2 F1 node --test example                         rc=1  tests=1    first_err=# Error: Cannot find module '…/example'
v22.23.2 F2 node --test "example/**/*.test.js"          rc=0  tests=1
v22.23.2 F3 (cd example && node --test)                 rc=0  tests=1
v22.23.2 F4 node --test (bare root)                     rc=0  tests=1
=== no-tests ===
v22.23.2 F1 node --test example                         rc=1  tests=1    first_err=# Error: Cannot find module '…/example'
v22.23.2 F2 node --test "example/**/*.test.js"          rc=0  tests=0
v22.23.2 F3 (cd example && node --test)                 rc=0  tests=0
v22.23.2 F4 node --test (bare root)                     rc=0  tests=0
```

A failing test makes both surviving forms exit non-zero, so neither is green by accident (Node 22.23.2 and 24.16.0):

```
### node 22.23.2
F2 glob  rc=1
F3 cd    rc=1
### node 24.16.0
F2 glob  rc=1
F3 cd    rc=1
```

**C2 — `SETTLED`** (a portable form exists): form **F3**, `cd example && node --test`, returned `rc=0` on Node 20.20.2 (CI `20.C_RC=0`, `20.E_RC=0`), Node 22.23.2 and Node 24.16.0 (matrix above) — with tests present and with zero tests. F4 (bare root `node --test`) held on 22 and 24; it was not run on 20.

**C3 — `SETTLED`** (vacuous green is real). Zero matching files, Node 24.16.0:

```
### P4: glob matching ZERO test files
ℹ tests 0
ℹ pass 0
P4_EXIT=0
```

TAP reporter, zero tests, both Node 20.20.2 (CI `20.B_RC=0`) and Node 22.23.3 (CI `22.A_RC=0`) print `1..0` / `# pass 0` and exit 0.

**C4 — `SETTLED`** (deterministic, and unconditional placement reds the reset push):

```
### A1: executed-count assertion, tests present
node_rc=0 tests=1 pass=1
ASSERT_RESULT=PASS
A1_EXIT=0

### A2: executed-count assertion, ZERO tests (reset-commit shape)
node_rc=0 tests=0 pass=0
ASSERT_RESULT=FAIL(executed_count=0)
A2_EXIT=1
```

Live confirmation that the reset shape carries zero tests — `dev` push `38213206402`, `tests` step, job conclusion `success`:

```
if [ "push" = "pull_request" ] && [ "${pass:-0}" -lt 1 ]; then
  echo "::error::no tests executed"; exit 1
fi
TAP version 13
1..0
# tests 0
# pass 0
```

The first live attempt (`38212731480`) is the cautionary datapoint: with the same `dev` reset state and the same `tests` step, the job concluded `failure` and the failure was **not** the count assertion — it was `node --test` itself:

```
{"conclusion":"failure","name":"bkit-tests-check","steps":[… {"conclusion":"failure","name":"tests"}, {"conclusion":"skipped","name":"sentinel gone (PR only)"} …]}
##[error]Process completed with exit code 1.
```

`$out` never reached the log because `out=$(…)` under `bash -e` aborts on the substitution's non-zero status and discards the capture. On Node 20 that non-zero status is the unexpanded glob (C1).

**C5 — `SETTLED`** (classic-script assertion):

```
### good/index.html            has_script_src=1 has_type_module=0  CLASSIC_ASSERT=PASS  EXIT=0
### good/variant.html          has_script_src=1 has_type_module=0  CLASSIC_ASSERT=PASS  EXIT=0
### bad/index.html             has_script_src=1 has_type_module=1  CLASSIC_ASSERT=FAIL  EXIT=1
### bad/inline-module.html     has_script_src=1 has_type_module=1  CLASSIC_ASSERT=FAIL  EXIT=1
### bad/module-first.html      has_script_src=1 has_type_module=1  CLASSIC_ASSERT=FAIL  EXIT=1
```

**C6 — `SETTLED`** (capstone present + green at PR head with the PR-only steps added). PR #2 head `b9b9452`, run `38212991262`, job `bkit-tests-check`:

```
{"conclusion":"success","name":"bkit-tests-check","steps":[
 {"conclusion":"success","name":"tests"},
 {"conclusion":"success","name":"sentinel gone (PR only)"},
 {"conclusion":"success","name":"classic-script assertion (PR only)"},
 {"conclusion":"success","name":"privacy scan (PR only)"},
 {"conclusion":"success","name":"screenshot (PR only, non-gating)"},
 {"conclusion":"success","name":"upload screenshot (PR only, non-gating)"}]}
```

```
# tests 1 … # pass 1
privacy scan clean
```

Merge gate, run from a checkout of the run repo — the way `/bkit-ship` runs it:

```
[bkit-runs] capstone bkit-tests-check=success at head b9b94525193039f9ca27f660a1ec773c7a3d458c (run 38212991262, https://github.com/cbartens/bkit-example-spike-20261012/actions/runs/38212991262)
{"code":0,"passed":true,"overridden":false,"head":"b9b94525193039f9ca27f660a1ec773c7a3d458c","mergeHead":"b9b94525193039f9ca27f660a1ec773c7a3d458c","testedHead":"b9b94525193039f9ca27f660a1ec773c7a3d458c","runId":38212991262,"conclusion":"success","capstone":"bkit-tests-check","ciWorkflow":"bkit-ci.yml","repo":"cbartens/bkit-example-spike-20261012","skippedLanes":[],"nonBookkeepingPaths":[],"reason":"capstone bkit-tests-check=success at head b9b9452… (run 38212991262, …)"}
GATE_PR_EXIT=0
```

**C7 — `SETTLED`** (reset push to `dev` stays green). `dev` push `38213206402`, design's final workflow, reset-shaped `dev`:

```
{"conclusion":"success","name":"bkit-tests-check","steps":[
 {"conclusion":"success","name":"tests"},
 {"conclusion":"skipped","name":"sentinel gone (PR only)"},
 {"conclusion":"skipped","name":"classic-script assertion (PR only)"},
 {"conclusion":"skipped","name":"privacy scan (PR only)"},
 {"conclusion":"skipped","name":"screenshot (PR only, non-gating)"},
 {"conclusion":"skipped","name":"upload screenshot (PR only, non-gating)"}]}
```

Same shape on run `38212887513`. The earlier `38212731480` is the counter-case (C4): same push, `tests` step unconditional, job `failure`.

**C8 — `SETTLED`** (screenshot captured + uploaded, non-gating):

```
7879 bytes written to file shot.png
-rw-r--r-- 1 runner runner 7879 Oct 12 06:32 shot.png
With the provided path, there will be 1 file uploaded
Uploaded bytes 3378
Finished uploading artifact content to blob storage!
```

```
{"expired":false,"file_count":"b9b94525193039f9ca27f660a1ec773c7a3d458c","name":"run-screenshot","size_in_bytes":3378}
```

Both screenshot steps carry `continue-on-error: true` and the job concluded `success`; the job ran 11 s total on `ubuntu-24.04` with dbus errors on stderr that did not affect the exit status.

**C9 — `SETTLED`** (bootstrap verify-and-repair idempotent). Four consecutive runs:

```
===== RUN 1 (verify on live repo, expect drift) =====
[bkit-example] preflight ok (node 24.16.0, gh authed)
[bkit-example] repo-exists cbartens/bkit-example-spike-20261012 (PUBLIC) -> verify mode
[bkit-example] verified 4 item(s) across main+dev; drift=5
[bkit-example]   drift: main:example/data.js MISSING
[bkit-example]   drift: main:example/index.html MISSING
[bkit-example]   drift: dev:.github/workflows/bkit-ci.yml DIFFERS
[bkit-example]   drift: dev:package.json DIFFERS
[bkit-example]   drift: main:example/index.html SENTINEL-ABSENT
[bkit-example] repair-pushed main (2 file(s))
[bkit-example] repair-pushed dev (2 file(s))
[bkit-example] verify-and-repair complete: repaired 5 item(s); repo never created or deleted
RUN1_EXIT=0

===== RUN 2 (expect: no drift, no write = idempotent) =====
[bkit-example] verified 4 item(s) across main+dev; drift=0
[bkit-example] verify-and-repair complete: no drift, no write, no repo create/delete (idempotent)
RUN2_EXIT=0
```

Drift injected out-of-band, then re-run:

```
DRIFT_PUSHED dev=5d17bd77052548d7434c7c2822bc9a9a3ed63dc1

===== RUN 3 (deliberate drift on dev -> expect detect+repair) =====
[bkit-example] verified 4 item(s) across main+dev; drift=1
[bkit-example]   drift: dev:.github/workflows/bkit-ci.yml DIFFERS
[bkit-example] repair-pushed dev (1 file(s))
RUN3_EXIT=0

===== RUN 4 (expect idempotent again) =====
[bkit-example] drift=0
[bkit-example] verify-and-repair complete: no drift, no write, no repo create/delete (idempotent)
RUN4_EXIT=0
```

`main` was untouched by the repair that only concerned `dev`, and `dev` settled: `AFTER main=68ba5339… dev=ae67282a…`.

**C10 — `BLOCKED`**, see Unsettled.

**Gate invocation caveat (discovered, outside the claim set).** `bkit runs gate --repo <owner/other> --pr N` reads the PR from the **current checkout**, not `--repo`:

```
$ node <bkit>/dist/cli.js runs gate --repo cbartens/bkit-example-spike-20261012 --pr 2      # cwd = bkit worktree
[bkit-runs] no run of bkit-ci.yml exists at head 2767a85460740cf31f3cfde9f0a1b92a5e2ece5f (total_count=0)
GATE_PR_EXIT=10

$ gh pr view 2 --json number,headRefOid,title     # from the bkit worktree
{"headRefOid":"2767a85460740cf31f3cfde9f0a1b92a5e2ece5f","number":2,"title":"fix(bar-130): drop dual pnpm SoT — pnpm/action-setup@v4 conflict"}
```

It resolved PR #2 of `cbartens/bkit`, not of the repo named by `--repo`. Invoked from a checkout of the run repo — the way `/bkit-ship` invokes it — the same `--pr 2` returns exit 0 (C6).

## Design Impact

**C1 (`DISPROVEN`) invalidates the test invocation exactly as the revision notes bind it.** The bound correction is the glob `node --test "example/**/*.test.js"`; the design's capstone pins its Node version (v1-draft `Decisions`: "pinned **and recorded** Node version") but does not yet name it. On Node 20 LTS the glob is not a pattern at all — Node 20 passes it through as a literal path and exits 1 (`Could not find '…/example/**/*.test.js'`) whether or not tests exist; on Node 22/24 the same form is correct. Meanwhile the draft's original `node --test example` is the mirror image: exit 0 on Node 20, `MODULE_NOT_FOUND` exit 1 on 22/24. So **the invocation form and the Node pin are one coupled decision, not two**, and neither document currently states it that way: adopting the bound correction while keeping the Node 20 pin (the version in the design's own live probe artefact, `node-version: "20"`) makes the capstone fail on **every** run — the "always red ⇒ no run ever completes ⇒ zero data" outcome the revision notes §2 call out.

The evidence supports a form that holds across all three versions in play, so the pin stays a free choice:

- `cd example && node --test` (F3) — `rc=0` on 20, 22 and 24, with tests present and with zero tests; `rc=1` on a failing test.
- `node --test` bare from the repo root (F4) — `rc=0` and recursive discovery of `example/*.test.js` on 22 and 24; **not run on 20**, so it does not yet qualify as portable.
- The glob (F2) — only on Node ≥ 22; usable **if** the design fixes the pin at 22 or later and records it.

Either way the design must state the pin and the form together, and the fixture-harness `scripts.test`, the capstone `tests` step and the `examples/README.md` contract table must all carry the same pair.

**C4 (`SETTLED`) invalidates "assert the executed count ≥ 1" as an unconditional step.** The reset-shaped `dev` state has zero tests by construction (the fixture ships none), and the executed-count assertion fails on zero (`ASSERT_RESULT=FAIL(executed_count=0)`, exit 1). Applied unconditionally it reds `dev` on every run, contradicting success criterion 3 and the "reset pushes … never red `dev`" decision. The evidence supports conditioning it exactly like the sentinel and privacy steps — PR-only — which run `38213206402` demonstrates end-to-end: `tests` green over `# pass 0` on a `push` event, all four PR-only steps `skipped`, job `success`.

**Discovered defect, outside the claim set (no design element invalidated, reported because a probe tripped it).** `bkit runs gate --repo <owner/other-repo> --pr N` resolves the PR from the current checkout rather than from `--repo` (`gh pr view N` is called without `--repo`); from outside the run repo it silently gates an unrelated PR (exit 10 naming `cbartens/bkit`'s PR #2 head). The design's own paths are unaffected — `/bkit-ship` runs inside the run repo — but any future runner- or bats-side use of `--repo` + `--pr` would read the wrong PR. Not fixed here: probe scope is the spike tree, and `.agents/rules.md` § Discovered bugs routes this to `docs/failures.jsonl`, which is outside this subagent's write scope. Handing it to the caller.

## Unsettled

**C10 — `BLOCKED`.** Whether one full pipeline run completes design → plan → build → ship on the persistent repo with the capstone green at the merged PR, and its rows land in `.bkit/stats.jsonl`.

- **Needs:** the `scripts/example/new-run.mjs` runner (not built — this spike wrote a cut-down bootstrap only); a filed issue on the run repo; the bkit pipeline running inside that repo; and the two human hard stops (design sign-off, plan sign-off) that no probe code can satisfy.
- **Risk carried into the design:** every claim C1–C9 is settled against a _hand-built_ approximation of the run repo in which this spike chose `example/`'s contents, the workflow steps and the Node pin itself. The pipeline's own output — whether the agents produce a `node --test`-green page at all, whether `/bkit-ship` merges under the real gate path, whether the reset commit's `git log --grep` marker and the `outcome` rows correlate, and whether `bkit upgrade --latest` + `bkit install --claude --tracker=github` leave the harness intact inside a real run — is untested. The benchmark's central artefact (`.bkit/stats.jsonl` accumulating N runs, version-grouped) is therefore unverified by this spike.

**CI-boundary behaviour only a real run can confirm (stated plainly, not probed):**

- The `always-latest` upgrade path — `bkit upgrade --latest` re-resolving `@cbartens/bkit` inside the run repo and the read-backs (tracker `github`, `.bkit-version` `pinnedVersion`, every seeded `bkit:gate:*` script resolving) are unexercised; this spike never installed bkit into the run repo.
- The seeded `bkit:gate:static-unit` chain inside the run repo (post-install), and therefore Build Step 14's gate, are unexercised here.
- GitHub-hosted-runner drift: the screenshot probe ran on `ubuntu-24.04`, image `20261004.327.1`; the `google-chrome` availability and the dbus noise are properties of that image, not of the design. A later image may move either.
- `/bkit-ship`'s squash-merge into `dev` and the post-merge `--capstone-only` check were not run — only the pre-merge `gate --pr` path was.

**Probe limitation, stated so it is not read as coverage.** The C9 repair path re-publishes the source-of-truth files (`main`'s fixture, `dev`'s harness) but does **not** prune files that are present in the repo and absent from the source of truth. "Repair drift" is proven for _changed_ and _missing_ files, not for _stale extra_ files.

**Create half of the bootstrap, and why it was not re-run.** `gh repo create --public` was not executed this session. The only repository available for a create-path probe is one that does not yet exist, and this session's `gh` token lacks the `delete_repo` scope (`gh auth status` scopes: `gist, manage_runners:org, project, read:org, repo, workflow`; the prior cycle's cleanup attempt returned `HTTP 403 … needs the "delete_repo" scope`), so a second throwaway public repo could not be removed afterwards. The create half rests on the prior cycle's captured run — repo `cbartens/bkit-example-spike-20261012`, `PUBLIC`, `createdAt 2026-10-12T04:38:11Z`, `defaultBranchRef main`, created by the command recorded in `design-spike.md` at commit `3210bda1` — and on this session's use of that artefact; the repair half, which the review flagged as never run, was run directly (C9). The throwaway probe repo both cycles used still exists and needs manual cleanup once `delete_repo` is granted: `cbartens/bkit-example-spike-20261012`.

## Verdict Reasoning

`FAIL`: claim C1 is `DISPROVEN` by captured evidence, and the mapping is `FAIL = any claim DISPROVEN`. Eight of the nine probeable claims held at the boundary — the vacuous-green reality (C3) and the deterministic executed-count (C4) and classic-script (C5) assertions, the single-job capstone staying present and green at PR head with the PR-only sentinel/classic/privacy steps and non-gating screenshot/upload added (C6), the reset-shaped `dev` push staying green because those steps skip (C7), the screenshot artefact actually produced and uploaded (C8), and `--bootstrap`'s verify path detecting drift, repairing it and re-verifying clean without ever creating or deleting the repo (C9) — but the corrected invocation the revision notes bind does not run on Node 20 LTS, and no document yet ties the invocation form to the Node pin. That coupling is load-bearing: it decides whether the capstone gates a real test run or reds every run.

It is not `CONCERNS` because a bound requirement is contradicted, not merely unproven; it is not a reason to touch the design's shape, because the evidence supplies the fix in the same breath (C2: `cd example && node --test` holds on 20, 22 and 24; or pin ≥ 22 and keep the glob and record it). It is not `PASS` because C10 is `BLOCKED` — the design's central artefact, one end-to-end run whose numbers land in `.bkit/stats.jsonl`, needs the runner and the human hard stops, so it remains the largest untested assumption entering planning.

Three items should reach planning explicitly: the **invocation + pin pair** (C1/C2), the **PR-only placement of the executed-count assertion** (C4, which no review had caught and which the revision notes' wording does not fix by itself), and the **`--repo` mis-scoping in `bkit runs gate`** (discovered, handed over for `docs/failures.jsonl`).
