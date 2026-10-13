# Design Brainstorm & Ideas

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

Scope: scoped revision of the closed v3 design to the new repo model (one persistent PUBLIC
`cbartens/bkit-example`, per-run folder reset, git history = experiment history). The binding
decisions in the design input are treated as givens (persistent public repo; near-empty `index.html`
placeholder; deterministic pass/fail kept but no bkit-CI smoke job; always-latest bkit with the
version recorded; results reuse `.bkit/stats.jsonl`; screenshot as recorded artefact; GitHub
tracker). Only the load-bearing, still-open shape — **where evidence lives and what "the folder"
is** — varies between approaches.

Grounded facts used below: `.bkit/stats.jsonl` is written at repo root
(`.bkit/core/engine/ledgers/telemetry.ts`) and is **not** gitignored by bkit's managed block, so it
can be tracked and accumulate. Its rows already carry `bkitVersion`. bkit warns at
`MAX_ROWS_BEFORE_ROLLUP = 5000` rows and has no automatic rollup.

## Approach A — "Fixture on `main`, evidence in `dev` history" (the candidate, tightened) ⭐ Recommended

One persistent public repo. `main` holds the canonical fixture (the reproducible start) and never
runs. `dev` is integration. Each run is a `feat/*` branch that starts from `dev`, resets the app
tree from `main`'s fixture as its own commit (history shows the reset), builds the app, and PRs back
to `dev`. The accumulated results ledger is the repo's **own tracked `.bkit/stats.jsonl`**, which the
reset never deletes and every run appends to; the benchmark reads `dev` directly and groups rows by
`bkitVersion`. Bootstrap once. Demo = 1 run, benchmark = N runs, same repo and same folder.

- **Complexity:** `LOW-MEDIUM`
- **Extensibility:** a second example is a new fixture folder on `main` plus a folder-scoped reset; a
  per-host comparison is more runs grouped by host once it is recorded; the read path is already
  version-agnostic.
- **Risk:** main failure mode = the ledger and the reset share one commit line, so a reset scoped too
  wide (or any hard reset / `git clean`) can delete the only evidence; overlapping runs would
  conflict on `.bkit/stats.jsonl` appends; the file grows unbounded (bkit only warns at 5000 rows).
- **Maintenance:** lowest — no new store, no new branch, no new format; one bootstrap path plus a
  prose read procedure.
- **Friction vs ideal:** near-zero from the candidate. The only wrinkle: the run workspace is repo
  root, so "the dedicated folder" is really "root content minus `.bkit/`" — the reset set and the
  fixture set must be described as the same thing carefully.

## Approach B — "Evidence on its own append-only line"

Same repo, fixture and branch model as A, but the accumulated ledger is decoupled from the app's
history: each run's harvested rows are appended by the runner to a dedicated append-only `results`
branch (the same `.bkit/stats.jsonl` row format, committed only there, never carried by the app PR).
The benchmark reads the `results` branch and groups by `bkitVersion`. App history stays exactly one
reset commit plus one build PR per run, so `dev` is byte-comparable run over run.

- **Complexity:** `MEDIUM`
- **Extensibility:** evidence survives any app-tree experiment; a folded summary or a per-version
  view can be added later without touching app code; "runs are data" is structurally clean.
- **Risk:** two write paths to keep honest and a second ref to bootstrap and protect; a force-push or
  stray reset on `results` destroys everything at once; reviewers may read it as the "separate
  aggregate store" the candidate rejects (same rows, different ref).
- **Maintenance:** `MEDIUM` — the runner owns the append, the branch must be protected, and the docs
  table must explain two homes.
- **Friction vs ideal:** adds a branch plus a runner step; friction with the settled "reuse the repo's
  `.bkit/stats.jsonl`" home unless explicitly framed as one file on a dedicated ref.

## Approach C — "App in a dedicated folder, root as durable substrate"

Durable root holds `.bkit/`, the results ledger, docs and CI; the example app lives in one folder
(e.g. `example/`) that the run deletes and re-creates from the fixture on its `feat/*` branch. The
reset is literal and scoped by construction — "the dedicated folder" is a real directory, not a
description of root content. `main` still carries the canonical app folder. Closest to how bkit
extends an existing repo (later-idea 8).

- **Complexity:** `MEDIUM-HIGH`
- **Extensibility:** strongest for "extend existing code" and for multi-example; the folder boundary
  is the reset boundary, so adding examples does not touch the durable root.
- **Risk:** the fixture set and the reset set stop being the same set — root contract files
  (`package.json`, `.github/workflows/`, the `bkit` block, `.bkit/`) must be durable yet are also
  fixture content, so the split is subtle and easy to get wrong; bkit gates and CI run over root while
  the app sits in a subfolder.
- **Maintenance:** `HIGH` — CI path filters, scripts that `cd` into the folder, and a documented
  root-vs-folder contract to keep from drifting.
- **Friction vs ideal:** largest migration from the candidate (fixture, runner and CI all change), and
  it re-introduces scaffold-ish complexity the issue's "one feature, kept simple" rule resists.

## Decisions

| Decided                                                                                                                                                                                   | Alternatives                                                 | Why                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** — fixture on `main`, runs reset from it on `feat/*`, PR to `dev`, ledger in `dev` history                                                                                           | B (evidence branch); C (app-in-subfolder)                    | Lowest complexity and near-zero migration from the candidate; the read path and format already exist. B/C buy evidence durability and folder isolation the issue does not yet need (YAGNI), at a second ref or a split fixture. |
| Results ledger = the repo's own tracked `.bkit/stats.jsonl`, accumulating on `dev`; reset never touches it; read directly and grouped by `bkitVersion` (no aggregate)                     | A `results` branch (B); an external/aggregate store          | Reuses the existing file and row shape (`.bkit/stats.jsonl` is not gitignored; rows already carry `bkitVersion`). No new format, matching the settled decision.                                                                 |
| Number the runs in history — reset commit is distinguishable (commit-trailer / run id) and rows are grouped by `bkitVersion` at read time                                                 | Rely on raw git log                                          | Keeps history legible as experiment history, which is the whole reason the folder reset is a commit; version-grouping is what keeps a sweep straddling a release honest.                                                        |
| Placeholder pass/fail lives in the run repo's own deterministic `node --test` (fixture ships the sentinel `index.html` and one sentinel test); no AI, no browser                          | Capstone-CI `grep` on `index.html`; runner-side check        | Pass/fail must be code-checked and closed to AI. A fixture-shipped test keeps it inside `node --test`, which CI already runs; the near-empty placeholder is deliberately not a scaffold that hints a trap.                      |
| Public-privacy check runs **pre-push in the runner** (diff scan for secret/PII shapes) plus a one-time documented manual review at bootstrap, before the repo is public                   | CI scan after push; rely on the manual review alone          | A public repo is public the moment it is pushed, so a post-push CI scan is too late by construction; the runner is the only place that sees the diff before it leaves the machine.                                              |
| Bootstrap once (documented one-liner and/or a `--bootstrap` mode) that creates the public repo with the fixture on `main` and a pushed `dev`; normal runs never create or delete the repo | Create/delete per run (superseded); a heavier bootstrap tool | Normal runs must operate on the existing repo and never tear it down; one documented path keeps the destructive step out of the routine run.                                                                                    |
| Demo = 1 run, benchmark = N runs, same repo and same folder                                                                                                                               | Separate demo and benchmark repos                            | The folder reset makes N runs start from the same state anyway; a second repo would duplicate the seed path and drift.                                                                                                          |
| Accept the two long-term ledger frictions as recorded risks: unbounded `.bkit/stats.jsonl` growth (bkit warns at 5000 rows, no rollup) and single-writer appends                          | Automate rollup / per-run files                              | No rollup exists in bkit today; building one is substrate for a problem not yet hit, and runs are human-in-loop so concurrent appends are unlikely. State it; do not over-build it.                                             |
