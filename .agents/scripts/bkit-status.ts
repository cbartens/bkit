// Contract for `status.json` entries written by the bkit workflow harness.
//
// Each step in a workflow's status array must conform to `Step`. Writers
// (orchestrator subagents, harness scripts) should call `validateInvariants`
// before persisting an entry to catch verdict/failures contradictions early.

export type Step = {
  step: string;
  status: "DONE" | "FAILED";
  at: string;
  commitSha: string;
  artifacts: string[];
  verdict?: "PASS" | "FAIL" | "CONCERNS";
  attempt?: number;
  subPlan?: number;
  failures?: number;
  strategy?: "STANDARD" | "PIVOT" | "FINAL";
};

export function validateInvariants(step: Step): { ok: boolean; reason?: string } {
  if (step.verdict === undefined) return { ok: true };
  if (step.failures === undefined) return { ok: false, reason: "verdict requires failures" };
  if (step.verdict === "PASS" && step.failures !== 0)
    return { ok: false, reason: "PASS requires failures=0" };
  if (step.verdict === "FAIL" && step.failures <= 0)
    return { ok: false, reason: "FAIL requires failures>0" };
  if (step.failures < 0) return { ok: false, reason: "failures must be non-negative" };
  return { ok: true };
}
