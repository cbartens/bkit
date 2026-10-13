# Design Revision Notes 4 — 504-example-project (human, binding)

Fold the external-tools evaluation into the design. Human-authorised on issue #504 (the survey
comment and its verified fact-check) and confirmed in-session. Keep everything else exactly as
it is. The trajectory-rubric axes from the same discussion are **already folded** (rev-notes-3
§B) — do not duplicate them.

## A. Existing tools considered and rejected — prior art + decision

The design's "Reuse & Prior Art" section cites only bkit-internal reuse; the build-vs-buy call
is currently unexamined. Add an explicit **"existing tools considered and rejected"** block to
that section and a matching **decisions row**, both carrying the scope-mismatch rationale.

Source: the issue's external-tools survey comment, fact-checked — SlopCodeBench (SCBench, arXiv
2603.24755) and DeepSWE (Datacurve, arXiv 2607.07946) are real; the survey is legitimate.

Root cause for every rejection — **scope mismatch**: each of these benchmarks agent/model
capability on _their_ tasks; #504 benchmarks bkit's orchestration on _our_ task. Different
objects of study.

| Category                | Tools                                                                                                                   | Why rejected                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public benchmark suites | SWE-bench (Verified / Pro / Multi-SWE-bench), Terminal-Bench, DeepSWE, SlopCodeBench, ProgramBench, MLE-Bench, RE-Bench | Single-shot or per-checkpoint tasks with hidden graders scoring the agent. They skip exactly the part under test — the multi-phase cycle (design → plan → build → ship, human approvals, review loops) — and give no demo. |
| Agent-eval frameworks   | DeepEval, LangSmith / Agentevals, OpenAI Evals, Ragas                                                                   | They assert on an instrumented LLM app via an SDK. bkit is markdown workflows run by a host agent; there is no trace to feed them without building instrumentation. Adds tooling against the binding "keep it simple".     |
| Workflow harnesses      | Promptfoo, LangGraph Studio, Mastra Studio                                                                              | Closest fit, still no. bkit's deterministic trajectory (which command ran, when) is already recorded in `status.jsonl`; a YAML harness + runner + gate would re-add machinery for data we already have.                    |
| Execution sandboxes     | E2B, Daytona, Modal                                                                                                     | The design deliberately uses the real GitHub surface — real PR, real CI, real merge — and the public repo is the demo. A sandbox deletes the surface bkit exercises.                                                       |
| Durable execution       | DBOS, Temporal                                                                                                          | bkit already resumes via `status.jsonl` / worktrees, and the human hard stops are intentional. A durable-execution engine is a rewrite for zero gain.                                                                      |

**Decision row:** build-vs-buy examined and rejected — adopt no external suite, framework,
harness, sandbox, or durable-execution engine for this example; the benchmark stays the bkit
pipeline running on the real GitHub surface, evaluated by the design's own outcome binary and
trajectory rubric (rev-notes-3 §B).

## B. Deferrals

1. **Promote / reference `504-second-example-extending-existing-code`** (already in
   `docs/deferrals.jsonl`): SCBench's finding — agents degrade as they extend their own code —
   is the one place the survey has teeth, and this design's reset-to-fixture model never
   measures it. The design must reference this deferral explicitly as the planned answer to
   that blind spot.
2. **New deferral, added to `docs/deferrals.jsonl` in the same change**:
   `504-external-suite-comparison` — run bkit against an external benchmark suite later, for
   industry-comparable numbers. A legitimately different exercise and a heavy one; not this
   cycle. The design references it as the path to cross-field comparability.

## Touchpoints

Reuse & Prior Art section (new considered-and-rejected block); the decisions table (the
build-vs-buy row); wherever the design discusses comparability or blind spots (reference both
deferral keys). No changes to the outcome/trajectory framing, the rubric, the workstreams'
scope, or any gate.
