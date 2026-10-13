# Design Revision Notes 3 — 504-example-project (human, binding)

Fold in two things: (A) three existing GitHub-native tools, and (B) the outcome/trajectory
evaluation language and metrics. Human-authorised; keep everything else exactly as it is.

## A. Adopt three existing GitHub-native tools

1. **GitHub rulesets / branch protection** on the run repo — enforce two invariants natively
   instead of by convention:
   - block force-push and branch deletion on `dev` and `main` → the never-prune invariant
     (evidence must never be destroyed) becomes an enforced boundary;
   - require the `bkit-tests-check` check before merge into `dev` → "ship only merges when the
     capstone is green at head" is enforced by the platform, not only by ship.
   - **Careful:** the runner's per-run reset is a **direct push to `dev`**, so do NOT enable
     "require a pull request before merging" on `dev`; there, block force-push/deletion only and
     put the required check on the PR path into `dev`.
     Set this up once from the runner's bootstrap (its verify-and-repair covers ruleset drift, like
     the rest of the durable root).

2. **Actions Job Summary (`$GITHUB_STEP_SUMMARY`) + workflow annotations (`::warning::`)** —
   present the recorded observations (executed-test count, classic-script result, screenshot
   link) on the run page instead of inventing a presentation surface. Built in, zero deps,
   non-gating; a failed screenshot capture emits a loud `::warning::` (the design already wants
   that loudness).

3. **`actionlint`** — lint the example repo's hand-written `bkit-ci.yml`. bkit already runs
   actionlint in `bkit:lint:workflows`, so this is an existing pattern, not a new tool. The
   fixture workflow lives at `examples/bkit-explainer/harness/bkit-ci.yml` (not under
   `.github/workflows/`), so register it explicitly in bkit's workflow-lint coverage (WS-9).

## B. Adopt the outcome/trajectory evaluation language and metrics

Relabel and align the evaluation model with the standard framing. This is a naming and rubric
alignment, **not** a new gate — the liveness-only binary is unchanged.

- **Outcome-based evaluation** — the only binary: did the run implement the feature end-to-end?
  The pipeline ran design → plan → build → ship and the example repo's own CI is green at the
  merged PR. Assessed by code (the repo's tests plus the merge), never by an AI.
- **Trajectory-based evaluation** — the analysis, across exactly these three dimensions:
  1. **Tool efficiency** — loops, retries, redundant tool calls, agent count.
  2. **Cost & latency** — wall-clock execution time and $/run (cost still deferred to #526).
  3. **Code quality** — bloat, unused code, broken formatting; scored by LLM-as-a-judge (the
     analysis prompt) and by static analysis (formatting/lint/slop run over the produced app).

Map the signals that already exist onto these dimensions and keep them recorded, non-gating:

- executed-test count, classic-script result, blank page → **code quality**
- trap-catching by the workflow's own review → a recorded **correctness observation**, kept
  explicit and distinct (it is not a gate, and it must not be a score input that can fail a run)
- wall time and counters → **cost & latency**
- retries and loops → **tool efficiency**

The analysis report's rubric uses these three dimension names, so scores stay comparable to how
the field reports trajectory evaluation.

## Touchpoints

Prior-art/reuse rows for the three tools; the framing section becomes Outcome-based vs
Trajectory-based evaluation; the analysis rubric and its dimensions; the components table and the
data model wherever the report's dimensions and observations are described; and workstreams
WS-3 (CI: Job Summary, annotations, actionlint), WS-4 (runner: rulesets at bootstrap), WS-9
(registration: actionlint coverage for the fixture workflow).
