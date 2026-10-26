// PROBE 5 — does the design's friction row shape actually pass the telemetry codec?
//
// Review CRITICAL 4: `by.step` is mandatory on every row, and the design never says what it
// holds on the calls with no `--step=`.
// Review OPTIONAL 8: `scope` is required by `.bkit/jsonl.md` but absent from the design's example.
// Also checks that `writerProblem` admits an engine-written row with the active run's workflow.
import {
  KIND_WRITERS,
  SCHEMA,
  mintTs,
  validate,
  writerProblem,
} from "../../../../../../.bkit/core/engine/ledgers/telemetry.js";

const envelope = (row: Record<string, unknown>) => ({
  schema: SCHEMA,
  ts: mintTs(),
  repo: "github.com/cbartens/bkit",
  bkit: { version: "6.0.0" },
  ...row,
});

/** The design's example row, verbatim from design-v1-draft.md § Data Model. */
const DESIGN_EXAMPLE = {
  kind: "friction",
  by: { workflow: "build", step: "build-plan-verify" },
  key: "tests-run/build-plan-verify",
  category: "tool-failure",
  severity: "MEDIUM",
  description: "bkit tests run exited 1 (undeclared for this verb) during build-plan-verify",
};

const cases: Array<[string, Record<string, unknown>]> = [
  ["design example row, verbatim (no envelope)", DESIGN_EXAMPLE],
  ["envelope + design example row", envelope(DESIGN_EXAMPLE)],
  ["envelope + row, no scope", envelope({ ...DESIGN_EXAMPLE, scope: undefined })],
  ["envelope + row, scope: consumer", envelope({ ...DESIGN_EXAMPLE, scope: "consumer" })],
  [
    "envelope + row, by.step = '' (the unknown-step case)",
    envelope({ ...DESIGN_EXAMPLE, by: { workflow: "build", step: "" } }),
  ],
  [
    "envelope + row, by.step = 'tests-run' (noun-verb sentinel)",
    envelope({ ...DESIGN_EXAMPLE, by: { workflow: "build", step: "tests-run" }, key: "tests-run" }),
  ],
];

for (const [label, row] of cases) {
  const v = validate(row);
  const w = v.ok ? writerProblem(row) : "(not reached)";
  console.log(`\n${label}`);
  console.log(`  validate     : ${v.ok ? "OK" : `REFUSED — ${v.reason}`}`);
  console.log(`  writerProblem: ${w === undefined ? "OK (admitted)" : String(w)}`);
}

console.log(
  `\nKIND_WRITERS.friction.orchestrators = ${JSON.stringify(
    KIND_WRITERS.friction.orchestrators === "any"
      ? "any"
      : [...KIND_WRITERS.friction.orchestrators],
  )}`,
);

// Does an unknown row type really pass the status.jsonl fold untouched?
const { fold } = await import("../../../../../../.bkit/core/engine/ledgers/status.js");
const events = [
  { type: "workflow-started", workflow: "build", at: "2026-10-26T00:00:00Z" },
  {
    type: "engine-call",
    workflow: "build",
    at: "2026-10-26T00:01:00Z",
    noun: "tests",
    verb: "run",
    flags: ["gate"],
  },
  { type: "completeness", workflow: "build", at: "2026-10-26T00:02:00Z", run: 1, verdict: "CLEAN" },
  { type: "workflow-done", workflow: "build", at: "2026-10-26T00:03:00Z" },
];
console.log(`\nfold over rows with the two new types: ${JSON.stringify(fold(events as never))}`);
