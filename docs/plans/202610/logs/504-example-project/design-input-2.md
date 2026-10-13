# Design Input — 504-example-project (run 2)

## Session Prompt

#504

Brief: Scoped revision of the closed design. The repo model and several decisions changed
during review; v3 (docs/plans/202610/504-example-project-design.md) is superseded. Treat the
decisions in https://github.com/cbartens/bkit/issues/504#issuecomment-6118563685 as binding,
and revise only the affected sections.

MODEL CHANGE: one persistent PUBLIC example repo (`cbartens/bkit-example`), not a fresh private
throwaway repo per run. Each run resets a dedicated folder (delete + re-create from the fixture)
and runs there; git history is the experiment history; the repo always shows the same example
folder. Drop from the design: `gh repo create --private`, repo teardown, the retention sweep,
the `delete_repo` scope preflight, throwaway-repo naming, and the N-independent-repos criterion.

ALSO SETTLED (carry verbatim):

- Fixture ships a near-empty `index.html` placeholder. Unchanged after a run = that run failed.
- Keep a deterministic pass/fail signal (`node --test` green + placeholder replaced + PR merged),
  usable later, but do NOT add a smoke job to bkit's own CI now (ad hoc runs only). Drop WS-6 and
  its CI-edit human-confirmation gate.
- Always install the latest bkit; record the version with each run; analysis groups by version.
- Results log: reuse/extend `.bkit/stats.jsonl`; no new format.
- Drawing layer: screenshot captured and reviewed as a recorded artefact, never pass/fail (#232).
- Tracker is GitHub, same as bkit (`--claude --tracker=github`).

SETTLE THESE (candidate resolutions — confirm or improve):

1. Results: they live in the persistent repo's `.bkit/stats.jsonl`, which accumulates across runs
   (only the dedicated folder is reset). The benchmark reads it directly and groups by
   `bkitVersion`. No separate aggregate store.
2. Branch model: `main` holds the canonical fixture (reproducible start), `dev` is integration
   (each run's PR merges here), each run resets the folder on its own `feat/*` branch, and the
   reset is itself a commit so history shows it.
3. Public-privacy check: the runner (and/or the run repo's CI) scans the output diff for
   secret/PII shapes and asserts no repo secrets/private files; a documented manual review runs
   before the first publish. Low effort — state it, don't over-build it.
4. Placeholder check: the fixture `index.html` carries a sentinel string; pass/fail asserts the
   sentinel is gone from the built page. Deterministic, no AI.
5. Demo and benchmark share the same repo and folder; demo = 1 run, benchmark = N runs.
6. Bootstrap: `cbartens/bkit-example` is created once (a `--bootstrap` mode or a documented
   one-liner) with the fixture on `main` and a `dev` branch; normal runs operate on the existing
   repo and never create or delete it.

WORKSTREAMS: update WS-1 (add placeholder), WS-3 (reset not create/delete), WS-4 (reduced),
WS-5, WS-7 (no retention, always-latest + recorded version, screenshot, owner-check); drop WS-6;
add WS-8 (results & stats). Keep everything else from v3 unchanged — fixture shape beyond the
placeholder, capstone CI, gate-chain assertion, docs contract table, deferral rows. Update the
success criteria, edge cases, breaking changes, risks and open questions to match the new model.

---

## Issue

## Goal

One small example project that runs through the whole bkit pipeline (design, plan, build, ship). It does two jobs:

- **Demo:** a new user runs it once and sees how bkit works, start to finish.
- **Benchmark:** we run it several times to tell whether a change to the prompts or workflows made bkit faster, cheaper or more reliable.

This is the "Tier 3" that #43 leaves out ("runs manually today; automating is a separate concern").

**One feature, kept simple.** Every addition makes a run longer and more expensive. The benchmark needs something that usually passes, and the demo has to be affordable for a new user. Bigger ideas are out of scope and recorded in a comment below for later.

## The app: an interactive explainer of how bkit works

The thing bkit builds is a page that shows how bkit works. Users click through it and watch the pipeline animate: design, plan, build, ship, a review sending work back, a failure going to debug, too many failures handing over to a human. A demo of bkit built by bkit.

- **Only the stable skeleton.** It shows the phases and the loops between them, which don't change between versions. It leaves out agent names and counts, which do change. The content comes from a fixed data file in the feature request, so the agents build the interactive part and don't invent how bkit works.
- **Complex logic, thin drawing.** The animation is driven by one function that answers "at this point in the run, which boxes are lit, which arrows are active, what does each counter read". `node --test` checks that function. The drawing code only paints what it returns. That keeps pass/fail checkable without a browser.

## Traps for review to catch

Planted in the feature request as requirements, without hinting at the mistakes:

- **Rewinding through a loop.** Scrub back past a "review sent it back" step and the retry counter must go back too. The easy bug leaves it at 2 instead of 1.
- **Parallel steps.** Some bkit reviewers run at the same time. A naive animation shows them one after another.
- **Reduced motion.** Users who set their system to reduce motion get a step-by-step view, not a forced animation or a blank page.
- **Keyboard only.** The whole walkthrough works without a mouse.

## The setup

- **Plain page, one logic file.** `index.html` holds the page. The logic lives in one plain JS file loaded with an ordinary `<script src>` tag (not `type="module"`), so the page works by double-clicking `index.html` with no server. Browsers refuse to load modules from a file opened off disk, so this rule goes into the fixed feature request rather than being left to the agents. The same JS file is tested directly by Node's built-in test runner (`node --test`).
- **No hosting, no deploy, no packages, no secrets.** Code, PRs and CI live on GitHub, and the app runs on the user's machine. CI just runs `node --test`. That matters because `/bkit-build` waits for CI to pass.
- **A fixed, pre-written feature request** (including the content data file), so every run starts from the same input.
- **Where it lives:** the starting state sits in bkit's repo under `examples/`, versioned together with bkit. A small script copies it into a fresh throwaway GitHub repo (`gh repo create --private`), runs `bkit install` there, and prints the command to start. Every run, demo or benchmark, starts from a new copy.
- **Why it can't run in place inside `examples/`:** ship would merge the finished app back into the folder, so the next run would have nothing to do. Ship would also write its plan logs and ledger entries into bkit's own `docs/`, the build would wait on bkit's full CI instead of the example's, and GitHub only reads CI files from `.github/workflows/` at the repo root anyway.

## Pass/fail vs measurement

From the Ponytail findings in #43's comment: what fails a run and what only gets recorded must be kept apart.

- **Pass/fail**, checked by running code, not by an AI grader: the logic tests pass (including the trap cases above), the PR merged.
- **Measured, never fails the run:** wall time, agent count, retries and loops (already written to `status.jsonl` and `.bkit/stats.jsonl`), and cost once there's a source for it (see open questions).
- **Not checked by CI:** whether the drawing matches the logic. The drawing layer is kept thin so there's little to break. In the demo, the user watching it is the check. A single browser test can be added later if the benchmark needs it.

## Two ways to run it

- **Demo:** one run, for a new user.
- **Benchmark:** several runs, reporting the middle result, because the AI behaves a bit differently each run and one run is noise (Ponytail used 10). Run it before a release or nightly, not on every PR, because the cost adds up.

## Open questions

- **What does one full run cost?** Not measured, and there's currently no source for it: bkit records no token or cost data (`.bkit/stats.jsonl` only has `compliance`, `counter` and `outcome` rows, and nothing in `.bkit/src/` tracks usage). Likely source is Claude Code's own session transcripts, which appear to record usage per message; other hosts would each need their own method. The ~$3.85/run figure in #43 is gstack's number, not ours.
- **Who should see the result?** Not decided. Options are in the later-ideas comment (item 7).

## Later ideas

Out of scope for this issue. Recorded in https://github.com/cbartens/bkit/issues/504#issuecomment-6075574881: run replay, a "your repo" report built from GitHub data, before vs after bkit, local diff input, the time-saved calculator (rejected for now), a "How this was built" panel, publishing the latest version, showing bkit extend existing code, and the other example apps considered.

## Related

- #43: the eval tiers this slots into, plus the Ponytail findings on measurement vs pass/fail and repeated runs.
- #45: this would give #45 the evidence it currently lacks (run the same example on each host and compare).
- #232: the shipped online compliance checks, whose rule that flaky graders must never fail CI applies here too.

## Later ideas from the brainstorm: out of scope, kept for revisiting

None of this is part of this issue. The issue is deliberately one simple feature: every addition makes a run longer and more expensive, the benchmark needs something that usually passes, and the demo has to be affordable for a new user. Recorded here so the ideas aren't lost.

### 1. Replay a real run

Instead of a scripted walkthrough, read a run's `status.jsonl` and animate what actually happened: which agents ran, what the reviewer flagged, where it looped back. Point it at the log of the run that built it and it shows its own construction. Point it at a user's runs and it becomes a run viewer they keep using.

- Real traps: a run that crashed with no final row, rows out of order, overlapping timestamps from agents running in parallel.
- Cost: it reads bkit's log format, so it has to change whenever that does. It's a real bkit feature, not a demo fixture.

### 2. "Your repo" report

When the example runs, bkit is already installed and `gh` is logged in as the user, so a local script can read anything they can see on GitHub. It doesn't need to run inside their real repo (ship would merge the demo into their codebase); `gh` works from the throwaway copy too.

**How:** a script runs `gh api` against their repo and writes a local `data.js` (not `.json`: a page opened from disk can't load a JSON file). The file is git-ignored so their data is never committed. No token ever goes into a web page.

**Data available:** commits, PRs (size, time open, reviews, merge time), review comments, CI runs (duration, failures, reruns), issues (age, labels), releases, contributors. Once bkit has been used: its run logs, `.bkit/stats.jsonl`, the ledgers, `bkit:*` labels.

**Analyses, best first:**

1. **Issues ready for bkit.** Rank open issues by how suited they are to the pipeline (clear description, stated outcome, sensible size) and end with "start with `/bkit-design` on #N". Biggest value add: it turns the demo into their first real use. Linear users' issues aren't on GitHub, so it needs a Linear path or skips for them.
2. **CI health.** Slowest jobs, failure rate, flaky jobs (same commit fails then passes on rerun). Directly useful for bkit: build waits on CI, so slow or flaky CI slows every run.
3. **Where PR time goes.** Opened to merged, PRs merged with no review, revert rate. Honest numbers from their own data that show the problems bkit's review steps target, without claiming bkit fixes them.
4. **Hotspots.** Files that change most and appear most in "fix" commits, i.e. where bugs cluster. Helps pick what to point bkit at first.

**Real traps:** bot PRs (e.g. Dependabot) counted as people, making PR time look great; GitHub returning 30 results by default, so "last year" silently covers three weeks; reverted PRs counted as successes; empty or brand-new repos crashing the charts.

**Constraints:** the benchmark would need a recorded snapshot instead of live data (every user's data differs). A user's data must never appear in anything published.

### 3. Before vs after bkit

For returning users only (a new user has no bkit runs): compare PRs made through bkit with the rest, on their own data. This is the honest version of a "time saved" calculator because it's measured on their work. Show it as a comparison, not "bkit saved you X", since bkit tends to be used on different kinds of work than the rest.

### 4. Local diff input

The user drops in a diff from their own machine (`git diff > change.diff`) and the page describes it: files touched, areas changed. No token, no network. Parsing a diff has real traps (renamed files, binary files, Windows line endings). An estimate of what bkit would cost on such a change could be added once the benchmark has measured real runs. Until then it describes, it doesn't estimate.

### 5. Time-saved calculator (rejected for now)

Without measured runs, every number in it would be an assumption shown as if it were a result: the same flattering-headline problem the Ponytail findings on #43 warn about. Commit size is also a poor guide to bkit's cost, since most of it is agents reading and reviewing, not writing lines. Revisit once the benchmark has real numbers ("bkit took a median of N minutes on this task", with the user entering their own by-hand estimate).

### 6. "How this was built" panel

Next to the app, a panel generated from that run's own logs: minutes taken, number of agents, what the reviewers caught and how it was fixed. Every number is real because it describes the run the user just watched. The reviewer catching the planted trap is the moment that sells bkit.

### 7. Publishing the latest version for people deciding whether to use bkit

On each release, the benchmark run builds the demo fresh; if it passes, publish it, labelled with the bkit version that built it. If it fails, the previous version stays up. Keep the run's paper trail alongside (design doc, plan, PR with the reviewer's comments and the fix), because that's what a careful evaluator wants to inspect.

Blocker: the bkit repo is private and the package is on GitHub Packages with `access: 'restricted'`, so outsiders can't see anything in it. For the public it needs a separate public repo (e.g. `cbartens/bkit-demo`) with GitHub Pages: GitHub shows committed HTML as source code, not a page, and Pages on a private repo needs a paid plan while the site is public anyway. Zero-hosting fallback: a GIF or screenshots in a README. Everything in the demo repo is public, so check the run picks up nothing private before the first publish.

### 8. Showing bkit extend existing code

A second feature built on the first (e.g. run replay on top of the explainer) would show bkit working on an existing codebase, not just from scratch. Most AI demos only show the latter. It also tests a different part of the pipeline.

### 9. Other example apps considered

- **Bill splitter.** Trap: $100 split three ways leaves a cent nobody pays. Very relatable, but so familiar the AI may handle it without review catching anything.
- **Meeting planner across time zones.** Trap: daylight saving silently moves the meeting an hour for one person. The most impressive catch; works with no packages (browsers and Node have time-zone support built in).
- **Recipe scaler.** Trap: scaling "1/3 cup" by 1.5 gives 0.4999999. Friendly, but a weak story.
- **Password strength checker.** Would exercise the security reviewer, but the trap is hard for non-technical viewers to appreciate, and it invites people to type real passwords in.

Context
128,636 tokens
12% used
$1.57 spent

> node scripts/example/new-run.mjs creates a fresh private GitHub repo

why not a public bkit-example repo and it's overwritten each time so history is preseved and public evidence at same time

> Repeating the setup script N times yields N independent throwaway repos

no same public repo but each test in a separate folder or maybe results just recorded in pr/push summary so history/data becomes rh runs and repo always displays same example folder and git history is experiment history

> Resolve the design's one self-declared unresolved boundary (WS-6 § Boundary). Decide — before WS-1/WS-6 planning — whether WS-1 ships a minimal static index.html (and any test subject the smoke job needs), or WS-6's smoke job asserts only over package.json/FEATURE-REQUEST.md. Note the tension the choice must weigh: dropping the index.html assertion weakens the fix for review-2 CRITICAL 2 (silent off-disk blank page), while adding one to the fixture brushes the rejected scaffolded-fixture approach.

explain in plain english

> Recommended: A — the source does not exist yet, and B/C build substrate for a spec that is not settled.

Comes later with 526 maybe

> Does the benchmark ship any tooling?

like what? I'd say no, keep it smiple

> Should bkit's own CI carry the example smoke job?

not for now, not integrated into ci yet, ad hoc runs only

> Which exact bkit version is pinned, and when is it bumped?

should always use the latest bkit version and version must be recorded together with results

> Is the drawing layer ever checked?

take a screenshot and analyse I think

> Should bkit install/bkit doctor warn when the tracker is none in a pipeline repo?

out of scope and no won't be tracker will be same as bkit repo

> How long are failed throwaway repos kept?

see above, same repo

> Who re-checks data.js against the current skeleton, and when?

should be data.jsonl in the example repo and data gets appended every time so it just grows with every experiment and run

---

> (A) add a minimal index.html to the fixture just so there's something to check — but that means shipping part of the app, which is the "scaffolded fixture" approach the design already rejected (pre-built pieces hint at the planted traps); or

ship empty / near empty html and if not changed / updated we know failed

we won't integrate into bkit ci yet but might later so we still want a pass / fail signal we can use

> How is "overwritten each time" done? Reset the tree to the fixture on a fresh branch per run, then PR → merge? The repo then doesn't always show the same folder (the merged app sits on dev).

dedicated folder deleted and re-created each time?

> Public means the planted traps and run logs are public. Item 7 already flagged "check the run picks up nothing private". With a public repo that check becomes load-bearing, not optional.

is that hard?

> The results log is a different artefact and .jsonl is fine there, because the page never reads it. I read you as meaning "the results log should be data.jsonl and grow every run" — confirm, because if you mean the page's content file, it breaks the off-disk requirement.

understood, so maybe best to re-use stats.jsonl and expand on that?

> c) "Always latest + record version" is workable only if the analysis groups by the recorded version. "Latest" resolved at run time means a sweep that straddles a bkit release is no longer one comparable set — the version column is what saves it. Worth stating explicitly in the design.

yes analysis will group by that of course

> d) A screenshot is a grader, and graders must never fail a run. #232 (cited by the issue) says flaky/AI graders must not fail CI. So the screenshot should be a recorded artefact you look at, never a pass/fail gate. If that's your intent, fine — I'd write it down that way.

agreed, not pass/fail

> WS-6 dissolves, three risks vanish (retention, delete_repo scope, Actions-minutes), four open questions close, and the CI-edit confirmation gate goes away. New items replace them: the public-repo privacy check, the reset mechanism, and the screenshot as a recorded (not gating) artefact.

document new WS in new comment

and document entire discussion and decisions above also

> This is a material design revision, and the workflow already closed with exactly that recommendation (/bkit-design #504). I'd suggest re-running the design with these as binding decisions so the docs, workstreams and the deferral rows all match — rather than me editing design-v3 by hand, which the workflow forbids (no post-hoc edits to a closed design).

do we really need to? what open design questions are ther? can bkit-plan not take over?

## Design discussion — repo model and open questions

Recording the review discussion on the v3 design and its outcome. These decisions are binding for the revision. The v3 design doc (`docs/plans/202610/504-example-project-design.md`) still describes the superseded model and needs a scoped revision before planning.

### 1. Change of direction: one persistent public repo

**Superseded (v3 / original #504 premise):** every run creates a fresh **private** throwaway repo (`gh repo create --private`), runs the pipeline there, and is deleted afterwards ("Every run, demo or benchmark, starts from a new copy").

**Decided:** one persistent **public** repo (`bkit-example`). Each run resets a dedicated folder — deleted and re-created from the fixture — and runs there. Git history is the experiment history; the repo always shows the same example.

Effects:

- **Removed:** `delete_repo` scope preflight, failed-repo retention sweep, per-repo Actions-minutes risk, throwaway-repo naming.
- **Added:** a public-privacy check before anything lands; the folder reset as the run's first step.
- **Also settled by this:** failed-run retention (moot — same repo) and the private-registry blocker in later-idea 7 (the repo is public anyway).

### 2. Decisions

| Topic                                 | Decision                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Repo model                            | One persistent public repo; dedicated folder reset (delete + re-create) per run; history = runs                              |
| Fixture `index.html`                  | Ships a **near-empty placeholder**. If it is unchanged after a run, the build did not produce the page → that run **failed** |
| Pass/fail signal                      | Deterministic and kept: `node --test` green + placeholder replaced + PR merged. Available for later CI use                   |
| bkit CI integration                   | **None for now** — ad hoc runs only; the pass/fail signal stays usable if it is wired in later                               |
| Cost                                  | Unmeasured for now; the source is #526 (per-workflow thread cost into `stats.jsonl`)                                         |
| Benchmark tooling                     | None — documented manual N-run, results read from the repo                                                                   |
| bkit version                          | Always install the **latest** at run time; **record the version with each run**; analysis groups by version                  |
| Drawing layer                         | **Screenshot captured and reviewed** as a recorded artefact — never pass/fail                                                |
| Tracker                               | GitHub, same as the bkit repo (`--tracker=github`)                                                                           |
| Tracker-`none` install/doctor warning | Out of scope                                                                                                                 |
| Results log                           | Lean: re-use and extend `.bkit/stats.jsonl` rather than a new format (confirm)                                               |

Two decisions worth stating plainly:

- The screenshot is a **grader**, and graders must never fail a run (#232). It is recorded for a human/AI to look at, never gated.
- "Always latest" means a sweep that straddles a bkit release is not one comparable set; grouping by the recorded version is what keeps the benchmark honest.

### 3. Still open (to settle in the revision)

1. **Where results live and how they are read.** Each run's `.bkit/stats.jsonl` sits in the run repo. The aggregate used for medians needs a defined home and read path.
2. **Persistent-repo branch semantics.** Which branch each run PRs into, what the default branch shows, and whether the folder reset is itself a commit in history.
3. **Public-privacy check.** What is scanned, when, and by what.
4. **Placeholder check specifics.** What "unchanged" means (e.g. hash compare) and where it runs.
5. **Demo vs benchmark.** Same repo/folder, or separate.
6. **Repo bootstrap.** Name/owner and how the persistent repo is first created.

### 4. Workstreams (revised)

- **WS-1 — Immutable fixture** (changed): as before, plus a near-empty `index.html` placeholder and the data/feature request. No test subject pre-written beyond the placeholder.
- **WS-2 — Fixture capstone CI** (unchanged): ~40-line `bkit-ci.yml`, single `bkit-tests-check` job, literal triggers, so the run repo's own merge gate passes.
- **WS-3 — Runner** (changed): resets the dedicated folder in the persistent public repo instead of creating/deleting a repo; installs latest bkit (`--claude --tracker=github`), asserts the gate chain, records the version. No create/delete, no `delete_repo` scope.
- **WS-4 — Runner verification** (reduced): bats over the `gh` stub for the reset and the gate-chain assertion.
- **WS-5 — bkit-side docs & contract table** (changed): documents the persistent repo, the version-grouping rule, the pass/fail signal, the screenshot artefact, and the results read path.
- **WS-6 — Source-side smoke job** (dropped): not integrated into bkit CI; the pass/fail signal is kept for a later decision.
- **WS-7 — Demo canary, benchmark, owner-check** (changed): no retention (same repo); always-latest install with recorded version; screenshot capture; content owner-check.
- **WS-8 — Results & stats** (new): extend `.bkit/stats.jsonl` with the fields the benchmark needs (version is already present), and define where the aggregate lives and how medians are computed and read.

/bkit-design #504

Brief: Scoped revision of the closed design. The repo model and several decisions changed
during review; v3 (docs/plans/202610/504-example-project-design.md) is superseded. Treat the
decisions in https://github.com/cbartens/bkit/issues/504#issuecomment-6118563685 as binding,
and revise only the affected sections.

MODEL CHANGE: one persistent PUBLIC example repo (`cbartens/bkit-example`), not a fresh private
throwaway repo per run. Each run resets a dedicated folder (delete + re-create from the fixture)
and runs there; git history is the experiment history; the repo always shows the same example
folder. Drop from the design: `gh repo create --private`, repo teardown, the retention sweep,
the `delete_repo` scope preflight, throwaway-repo naming, and the N-independent-repos criterion.

ALSO SETTLED (carry verbatim):

- Fixture ships a near-empty `index.html` placeholder. Unchanged after a run = that run failed.
- Keep a deterministic pass/fail signal (`node --test` green + placeholder replaced + PR merged),
  usable later, but do NOT add a smoke job to bkit's own CI now (ad hoc runs only). Drop WS-6 and
  its CI-edit human-confirmation gate.
- Always install the latest bkit; record the version with each run; analysis groups by version.
- Results log: reuse/extend `.bkit/stats.jsonl`; no new format.
- Drawing layer: screenshot captured and reviewed as a recorded artefact, never pass/fail (#232).
- Tracker is GitHub, same as bkit (`--claude --tracker=github`).

SETTLE THESE (candidate resolutions — confirm or improve):

1. Results: they live in the persistent repo's `.bkit/stats.jsonl`, which accumulates across runs
   (only the dedicated folder is reset). The benchmark reads it directly and groups by
   `bkitVersion`. No separate aggregate store.
2. Branch model: `main` holds the canonical fixture (reproducible start), `dev` is integration
   (each run's PR merges here), each run resets the folder on its own `feat/*` branch, and the
   reset is itself a commit so history shows it.
3. Public-privacy check: the runner (and/or the run repo's CI) scans the output diff for
   secret/PII shapes and asserts no repo secrets/private files; a documented manual review runs
   before the first publish. Low effort — state it, don't over-build it.
4. Placeholder check: the fixture `index.html` carries a sentinel string; pass/fail asserts the
   sentinel is gone from the built page. Deterministic, no AI.
5. Demo and benchmark share the same repo and folder; demo = 1 run, benchmark = N runs.
6. Bootstrap: `cbartens/bkit-example` is created once (a `--bootstrap` mode or a documented
   one-liner) with the fixture on `main` and a `dev` branch; normal runs operate on the existing
   repo and never create or delete it.

WORKSTREAMS: update WS-1 (add placeholder), WS-3 (reset not create/delete), WS-4 (reduced),
WS-5, WS-7 (no retention, always-latest + recorded version, screenshot, owner-check); drop WS-6;
add WS-8 (results & stats). Keep everything else from v3 unchanged — fixture shape beyond the
placeholder, capstone CI, gate-chain assertion, docs contract table, deferral rows. Update the
success criteria, edge cases, breaking changes, risks and open questions to match the new model.

47,872 tokens
5% used
$1.65 spent
