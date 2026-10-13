# Design Revision Notes 2 — 504-example-project (human, binding)

Two further human decisions, added after the first revision. Fold them in; they are
human-authorised, not agent-invented scope. Keep everything else exactly as in the design you
are revising.

## A. Fixture vs run split — keep the runs OUT of bkit's repo

State this split explicitly and keep it:

- **Fixture** — the starting state every run begins from — lives in bkit at
  `examples/bkit-explainer/`, versioned with bkit.
- **Runs** — the produced app and all run evidence — live in the persistent public run repo
  (`cbartens/bkit-example`). The pipeline never runs inside bkit.

Rationale to record: the pipeline's ship step merges in place, so in bkit it would land the
example app into bkit's own history and the next run would reset it again; a nested project
cannot have its own root `.github/workflows/` CI; bkit's own gates would scan generated output
indefinitely; and bkit is a product repo with its own release flow. `examples/` is not in the
published `files` list, so packaging is not the concern — repo flow is.

Honest caveat to state: "bkit change ↔ produced output" cannot be diffed in one view — they are
different repos. The run repo's history **is** the produced output per run, and each run's marker
commit stamps the exact bkit version, so the comparison is read from the run repo and mapped by
version.

## B. Evidence is committed to the run repo, not left as CI artefacts

CI artefacts expire (GitHub default ~90 days); the record must not. So the **screenshot and the
analysis report are committed into the run repo** as the permanent record. The run repo becomes
the single evidence store: produced app, screenshot, report, and `.bkit/stats.jsonl` numbers.

Mechanism — keep CI passive:

- CI still captures the screenshot at PR head (unchanged, non-gating) and may still upload it as
  an artefact; the artefact is at most a transfer/staging step, **not** the record.
- The **post-run analysis step commits** the screenshot beside the report in the run repo. CI does
  **not** write back to the repo — no `contents: write`, no bot commit, no loop guard.
- The analysis report records the run's **merge SHA** (and the bkit version) so two runs can be
  compared. Because each run resets `example/`, run N-1's output is not adjacent to run N's, so the
  side-by-side is a diff of the two runs' merge SHAs, not a consecutive diff.
- Cost: one small PNG per run, permanent in history.

## Touchpoints to update

Success criteria (screenshot and report are committed evidence, not ephemeral artefacts);
Architecture part 4 (CI) and part 5 (analysis); the components table; the CI contract table; the
data model (report and screenshot committed at known paths); the decisions rows (fixture-vs-run
split; committed evidence; run merge SHA recorded); and workstreams WS-3 (CI), WS-6 (analysis),
WS-7 (contract docs).
