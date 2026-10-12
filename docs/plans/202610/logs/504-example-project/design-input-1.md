# Design Input — 504-example-project (run 1)

## Session Prompt

#504

---

# Design Feature (Workflow 1/5)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create design in `docs/plans/{YYYYMM}/` (canonical month bucket, set at start) — no plans, no code, no execution.

> Workflows: Design → Plan → Build → Debug → Ship. This run executes the Design workflow.

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
