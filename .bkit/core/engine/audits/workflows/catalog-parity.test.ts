// audits/workflows/catalog-parity.test.ts — catalog-parity guards.
//
// Recomputes the canonical catalogs from disk and asserts the bkit-authored index
// docs stay in sync. Deterministic, no install.
//
// Direction matters: file -> doc. Every catalog FILE must be documented, but the docs
// MAY describe entries that have no dedicated file.

import * as fs from "node:fs";
import * as path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { getBkitDocsRoot, getPromptsRoot, getWorkflowsRoot } from "../../shared/package-roots";
import { applyCodexSkill } from "../../install/modules/codex";
import { applyAntigravitySkill, applyOpencodeCommand, applyT1, applyT2 } from "../../render/hosts";
import { substituteWorkflow } from "../../render/trackers";

const PROMPTS_INDEX = path.join(getBkitDocsRoot(), "prompts.md");
const WORKFLOWS_INDEX = path.join(getBkitDocsRoot(), "workflows.md");

// Canonical catalog entry names = sorted `.md` basenames (extension stripped),
// computed once from disk (e.g. "bkit-design-review-1").
const mdRe = /\.md$/;
const PROMPT_NAMES = fs
  .readdirSync(getPromptsRoot())
  .filter((f) => mdRe.test(f))
  .map((f) => f.replace(mdRe, ""))
  .sort();
const WORKFLOW_NAMES = fs
  .readdirSync(getWorkflowsRoot())
  .filter((f) => mdRe.test(f))
  .map((f) => f.replace(mdRe, ""))
  .sort();

describe("catalog parity — workflows", () => {
  const index = fs.readFileSync(WORKFLOWS_INDEX, "utf-8");

  it("has at least one workflow file (sanity)", () => {
    expect(WORKFLOW_NAMES.length).toBeGreaterThan(0);
  });

  it("every .bkit/workflows/*.md file has a `### `/<name>`` section in workflows.md", () => {
    const undocumented = WORKFLOW_NAMES.filter((n) => !index.includes("### `/" + n + "`"));
    expect(undocumented).toEqual([]);
  });
});

describe("catalog parity — prompts", () => {
  const index = fs.readFileSync(PROMPTS_INDEX, "utf-8");

  it("has at least one prompt file (sanity)", () => {
    expect(PROMPT_NAMES.length).toBeGreaterThan(0);
  });

  it("every .bkit/prompts/*.md agent is referenced in the prompts.md catalog", () => {
    const missing = PROMPT_NAMES.filter((n) => !index.includes(n));
    expect(missing).toEqual([]);
  });
});

interface ReportingWorkflow {
  readonly host: string;
  readonly body: string;
  readonly name: string;
  readonly tracker: "github" | "linear" | "jira" | "none";
  readonly label: string;
}

let reportingWorkflowCache: readonly ReportingWorkflow[] | undefined;

function renderedReportingWorkflows(): readonly ReportingWorkflow[] {
  if (reportingWorkflowCache) return reportingWorkflowCache;
  reportingWorkflowCache = Object.freeze(
    WORKFLOW_NAMES.flatMap((name) => {
      const source = fs.readFileSync(path.join(getWorkflowsRoot(), `${name}.md`), "utf8");
      return (["github", "linear", "jira", "none"] as const).flatMap((tracker) => {
        const resolved = substituteWorkflow(source, tracker);
        expect(resolved.orphans, `${name}/${tracker}`).toEqual([]);
        return [
          { host: "claude", body: resolved.output },
          { host: "cursor", body: applyT2(applyT1(resolved.output)) },
          { host: "codex", body: applyCodexSkill(source, name, tracker) },
          { host: "antigravity", body: applyAntigravitySkill(resolved.output, name) },
          { host: "opencode", body: applyOpencodeCommand(resolved.output) },
        ].map((rendered) =>
          Object.freeze({
            ...rendered,
            name,
            tracker,
            label: `${name}/${tracker}/${rendered.host}`,
          }),
        );
      });
    }),
  );
  return reportingWorkflowCache;
}

const isWired = (workflow: ReportingWorkflow) => workflow.tracker !== "none";
const isUnwired = (workflow: ReportingWorkflow) => workflow.tracker === "none";
const isAuto = (workflow: ReportingWorkflow) => workflow.name === "bkit-auto";
const isPhase = (workflow: ReportingWorkflow) => workflow.name !== "bkit-auto";
const isLinear = (workflow: ReportingWorkflow) => workflow.tracker === "linear";
const isJira = (workflow: ReportingWorkflow) => workflow.tracker === "jira";

function reportingCommands(body: string): string[] {
  return [...body.matchAll(/```bash\n([\s\S]*?)```/g)].flatMap((match) =>
    (match[1] ?? "")
      .split("\n")
      .filter((line) => /issues comment.*--post/.test(line) && !/--kind=failure/.test(line)),
  );
}

function commentsClause(body: string): string {
  return body.split("\n").find((line) => line.startsWith("- **Comments:**")) ?? "";
}

function commentGates(body: string): string[] {
  return body
    .split("\n")
    .filter((line) => /^- \[[ x]\]/.test(line) && /comment|tracker.*(?:post|deliver)/i.test(line));
}

describe("rendered workflow comment contracts", () => {
  beforeAll(() => {
    renderedReportingWorkflows();
  });

  it("reuses the complete immutable rendered workflow matrix", () => {
    const rendered = renderedReportingWorkflows();
    expect(rendered).toHaveLength(6 * 4 * 5);
    expect(renderedReportingWorkflows()).toBe(rendered);
    expect(Object.isFrozen(rendered)).toBe(true);
    expect(rendered.every(Object.isFrozen)).toBe(true);
  });

  it("renders explicit invocation association at fileless and lifecycle posting sites", () => {
    const rendered = renderedReportingWorkflows();
    expect(rendered).toHaveLength(6 * 4 * 5);
    for (const { body, label } of rendered.filter(isUnwired)) {
      expect(body, label).not.toMatch(
        /mcp__github__add_issue_comment|mcp__linear__save_comment|mcp__jira__addOrEditJiraIssueComment/,
      );
    }
    for (const { body, label } of rendered.filter(isWired)) {
      const commands = reportingCommands(body);
      expect(commands.length, label).toBeGreaterThan(0);
      for (const command of commands) expect(command, label).toMatch(/--(?:session-dir|file)=/);
    }
    for (const { body, label } of rendered.filter(isWired).filter(isAuto)) {
      expect(body, label).toMatch(
        /auto[^\n]*(?:separate|distinct)[^\n]*(?:phase|invocation)|(?:phase|invocation)[^\n]*(?:separate|distinct)[^\n]*auto/i,
      );
    }
    for (const { body, label } of rendered.filter(isWired).filter(isPhase)) {
      const starts = [...body.matchAll(/^[^\n]*workflows start[^\n]*$/gm)];
      expect(starts.length, label).toBeGreaterThan(0);
      for (const start of starts) expect(start[0], label).toContain("--session-dir=");
    }
  });

  it("renders engine progress authority with verbatim create only agent fallback", () => {
    const rendered = renderedReportingWorkflows().filter(isWired);
    for (const { body, label } of rendered) {
      const clause = commentsClause(body);
      expect(clause.length, label).toBeGreaterThan(0);
      expect(clause, label).toMatch(/engine[^\n]*(?:append|edit|updat)/i);
      expect(clause, label).toContain("commentFile");
      expect(clause, label).toMatch(/byte-for-byte|verbatim/);
      expect(clause, label).toMatch(/new comment|create-only/);
      expect(clause, label).toMatch(/NEVER edit|never edit|do not edit/i);
    }
    for (const { body, label } of rendered.filter(isLinear))
      expect(commentsClause(body), label).toMatch(/no `id`|without[^\n]*`id`/);
    for (const { body, label } of rendered.filter(isJira))
      expect(commentsClause(body), label).toMatch(/no `commentId`|without[^\n]*`commentId`/);
  });

  it("renders nonfatal comment fallback friction and attempted delivery gates", () => {
    for (const { body, label } of renderedReportingWorkflows().filter(isWired)) {
      const clause = commentsClause(body);
      expect(clause, label).toMatch(
        /nonfatal|non-fatal|never[^\n]*(?:stop|block)|does not[^\n]*(?:stop|block)/i,
      );
      expect(clause, label).toMatch(/friction/i);
      expect(clause, label).toMatch(/best effort|best-effort/i);
      expect(clause, label).toMatch(/continu/i);
      expect(clause, label).not.toMatch(/(?:failure|error)[^\n]*→ \*\*Failure Path\*\*/i);
      const gates = commentGates(body);
      expect(gates.length, label).toBeGreaterThan(0);
      for (const gate of gates) {
        expect(gate, label).toMatch(/attempt|skip|not required|when applicable/i);
        expect(gate, label).not.toMatch(
          /successful delivery|comment (?:delivered|posted successfully)/i,
        );
      }
    }
  });

  it("every rendered issues comment call carries a workflow-run proof its workflow holds", () => {
    const holdsSession = /`sessionDir` as `SESSION_DIR`/;
    for (const { body, label } of renderedReportingWorkflows().filter(isWired)) {
      const calls = body
        .split("\n")
        .filter((line) => /"\{BKIT\}" issues comment|bin\/bkit" issues comment/.test(line));
      expect(calls.length, label).toBeGreaterThan(0);
      for (const call of calls) {
        expect(call, label).toMatch(/--session-dir="\{SESSION_DIR\}"|--file=/);
      }
      const passesSession = calls.filter((call) => call.includes('--session-dir="{SESSION_DIR}"'));
      for (const call of passesSession) {
        expect(body, `${label}: ${call}`).toMatch(holdsSession);
      }
    }
    const auto = renderedReportingWorkflows().filter(isAuto);
    expect(auto.length).toBeGreaterThan(0);
    for (const { body, label } of auto) expect(body, label).toMatch(holdsSession);
  });

  it("the audit prompt's issues comment call carries its outbox body file", () => {
    const prompt = fs.readFileSync(path.join(getPromptsRoot(), "bkit-audit-generate.md"), "utf8");
    const calls = prompt.split("\n").filter((line) => /issues comment --post/.test(line));
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call).toMatch(/--body-file="\{OUTBOX_ROOT\}\/audit-\{slug\}\//);
    }
  });

  it("no rendered Comments clause tells an agent to omit its run proof", () => {
    for (const { body, label } of renderedReportingWorkflows().filter(isWired)) {
      const clause = commentsClause(body);
      expect(clause.length, label).toBeGreaterThan(0);
      expect(clause, label).not.toMatch(/Omit `--session-dir`/);
      expect(clause, label).toMatch(/NEVER drop `--session-dir`/);
    }
  });
});
