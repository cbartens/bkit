// audits/templates/template-shape.test.ts — the plan and audit templates hold shape only.
//
// A template is copied into every plan and report it seeds, so each instruction line in
// it is paid for again in every copy and every read of that copy. Instructions live in
// the prompts that act on them (`.bkit/instructions.md` records who carries what); the
// templates keep headings, tables, placeholders, checkbox labels and owner callouts.
// The few lines engine code parses out of a plan stay, and keep their exact form.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlanBlocks } from "../../commands/workflow/plan-blocks";
import { getCoreRoot } from "../../shared/package-roots";

const templatesDir = () => path.join(getCoreRoot(), "docs", "templates");
const promptsDir = () => path.join(getCoreRoot(), "prompts");
const workflowsDir = () => path.join(getCoreRoot(), "workflows");

/** The `bkit:start` / `bkit:end` block of a template. */
function managed(file: string): string {
  const text = fs.readFileSync(file, "utf-8");
  const start = text.indexOf("<!-- bkit:start -->");
  const end = text.indexOf("<!-- bkit:end -->");
  expect(start, file).toBeGreaterThan(-1);
  expect(end, file).toBeGreaterThan(start);
  return text.slice(start, end);
}

const planTemplate = () => managed(path.join(templatesDir(), "bkit-plan.md"));

const auditTemplates = () =>
  fs
    .readdirSync(templatesDir())
    .filter((f) => /^bkit-audit-.+\.md$/.test(f))
    .sort();

// `LEDGER_ROWS_LINE` copies the parser in `commands/workflow/ledgers.ts`; task blocks are
// read by `parsePlanBlocks` in `commands/workflow/plan-blocks.ts`.
const LEDGER_ROWS_LINE = /^\*\*Ledger rows:\*\*(.*)$/m;

/** Text that only an instruction to an agent carries. */
const PLAN_INSTRUCTION_MARKERS = [
  "**CRITICAL",
  "AI AGENT INSTRUCTION",
  "do not stop for user permission",
  "Dashboard Ban",
  "Default =",
  "**Agent:**",
  "**Rules:**",
];
const STANDING_WORD = /\b(?:NEVER|ALWAYS|MUST|ONLY)\b/;

const PLAN_HEADINGS = [
  "# [Plan Title] Implementation Plan",
  "## Context & Goals",
  "## 👤 ⚠️ Acceptance Scenario",
  "### Narrative",
  "### Success Criteria",
  "### Process Sketch",
  "### Concrete Example",
  "### Edge Cases",
  "### Derived Test Matrix",
  "### 👤 ✅ Human Confirmation",
  "## 👤 ⚠️ Breaking Changes & Naming Review",
  "### 👤 ✅ Human Confirmation",
  "## 👤 ⚠️ Open Questions & Assumptions",
  "### 👤 ✅ Human Confirmation",
  "## Alternative Approaches & Recommendations",
  "## Out of Scope",
  "## Suggested Scope Expansion",
  "## Security & Privacy",
  "## Pre-Flight / Dependencies",
  "### Core",
  "### Conditional",
  "### 🔒 Gate 1: Prerequisites Check",
  "## Data Schema Integration",
  "### Data Schema Usage",
  "### Data Schema Changes",
  "## Reuse Inventory",
  "## Architecture & Component Changes",
  "### Database Migrations",
  "### [Component Area 1]",
  "#### [MODIFY] `path/to/file.ext`",
  "#### [new] `path/to/file.ext`",
  "#### [DELETE] `path/to/file.ext`",
  "### Cron Jobs & Scheduled Tasks",
  "## Supersession Inventory",
  "## Documentation Updates",
  "## Rollback Strategy",
  "## Agent Execution Runbook",
  "### TASK GROUP 1: [e.g., Item status in the API]",
  "### 🔒 Gate 2: Code Implementation Check",
  "### 🔒 Gate 3: Testing & Documentation Check",
  "## Verification Plan",
  "### Automated Tests",
  "### 🔒 Gate 4: Automated Verification Check",
  "### 👤 Manual Verification",
];

/** Lines every audit template carried before they moved into `bkit-audit-generate`. */
const AUDIT_MOVED = [
  "Read-only audit; never edit code, config, or data.",
  "`Universal Instructions` apply to all projects",
  "Local audit instructions / overrides",
  "Any tools mentioned in `Universal Instructions` are examples only",
  "Use dense token-efficient phrasing",
  "Read `.agents/docs.md` → load docs",
  "Every claim cites this run's evidence",
  "Read this document once at session start",
  "**Checkpoint",
  "**Credentials:**",
  "Verify only when applicable.",
  "one cheap read-only call per tool this run uses",
  "record version and date read",
  "Audited commit = this report's `bkit:anchor` `baseSha`",
  "Findings table and every `Report` section have no `PENDING`",
  "`Universal` = proposed step changes",
  "`Project Instructions` below `bkit:end` are consumer-owned",
  "Scale per `.bkit/jsonl.md` § Severity.",
];

/** Step 1 keeps its title and `Done when` once its procedure moved out. */
const STEP_1_KEPT = /\*\*Step 1 — Previous Run:\*\*.*\*\*Done when:\*\*/;

/** The opening note: the HTML comment naming the output path and the agent that fills it. */
const OPENING_NOTE = /^<!-- Note: @bkit-(?:audit|plan)-generate fills this template\. .* -->$/;

describe("template shape", () => {
  it("every template opens its block with bkit:start, the managed marker, then the note", () => {
    // `bkit upgrade` refreshes only the block, so a note above `bkit:start` would go stale.
    const names = fs.readdirSync(templatesDir()).filter((f) => /^bkit-.+\.md$/.test(f));
    const wrong = names.filter((name) => {
      const head = fs
        .readFileSync(path.join(templatesDir(), name), "utf-8")
        .split("\n")
        .filter((l) => l.trim() !== "")
        .slice(0, 3);
      return (
        head[0] !== "<!-- bkit:start -->" ||
        head[1] !== "{{BKIT_MANAGED_MARKER}}" ||
        !OPENING_NOTE.test(head[2] ?? "")
      );
    });
    expect(names).toContain("bkit-plan.md");
    expect(wrong).toEqual([]);
  });

  it("plan template is shape only", () => {
    const block = planTemplate();
    const found = PLAN_INSTRUCTION_MARKERS.filter((m) => block.includes(m));
    // The opening note names the output path for the filling agent; it is the one comment kept.
    const standing = block
      .split("\n")
      .filter((l) => STANDING_WORD.test(l) && !OPENING_NOTE.test(l));
    expect({ found, standing }).toEqual({ found: [], standing: [] });
  });

  it("plan template keeps machine-read lines and headings in order", () => {
    const block = planTemplate();
    const lines = block.split("\n");
    expect(lines.filter((l) => /^#{1,6} /.test(l))).toEqual(PLAN_HEADINGS);
    expect(LEDGER_ROWS_LINE.test(block)).toBe(true);
    const parsed = parsePlanBlocks(block);
    expect(parsed.errors).toEqual([]);
    expect(parsed.tasks.length).toBeGreaterThan(0);
    for (const t of parsed.tasks) {
      expect(t.doneWhen, `TASK ${t.task}`).toBeDefined();
      expect(t.testFirst, `TASK ${t.task}`).toBeDefined();
    }
  });

  it("audit templates are shape only", () => {
    const blocks = auditTemplates().map((name) => ({
      name,
      lines: managed(path.join(templatesDir(), name)).split("\n"),
    }));
    const leftovers = blocks.flatMap(({ name, lines }) =>
      AUDIT_MOVED.filter((m) => lines.some((l) => l.includes(m))).map((m) => `${name}: ${m}`),
    );
    const lostSteps = blocks
      .filter(({ lines }) => !lines.some((l) => STEP_1_KEPT.test(l)))
      .map(({ name }) => `${name}: Step 1 — Previous Run`);
    const prompt = fs.readFileSync(path.join(promptsDir(), "bkit-audit-generate.md"), "utf-8");
    expect({
      leftovers,
      lostSteps,
      promptDefers: /Follow all instruction in template|Template read-only rules/.test(prompt),
    }).toEqual({ leftovers: [], lostSteps: [], promptDefers: false });
  });

  it("audit gate boxes say what they check", () => {
    // The report is read without the prompt, so a bare label leaves its reader guessing.
    const bare = auditTemplates().flatMap((name) =>
      managed(path.join(templatesDir(), name))
        .split("\n")
        .filter((l) => /^\s*- \[ \] \*\*[^*:]+\*\*\s*$/.test(l))
        .map((l) => `${name}: ${l.trim()}`),
    );
    expect(bare).toEqual([]);
  });

  // Execute works from a group brief that carries no gate boxes, and no agent ticks a plan
  // gate, so no prompt or workflow has a gate at which to ask for permission.
  it("no prompt or workflow carries a gate no-permission line", () => {
    const carriers = [promptsDir(), workflowsDir()].flatMap((dir) =>
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) =>
          /stop to ask for permission/i.test(fs.readFileSync(path.join(dir, f), "utf-8")),
        )
        .map((f) => f),
    );
    expect(carriers).toEqual([]);
  });

  it("no plan prompt defers a rule to the template", () => {
    const deferral =
      /per template\b|template rule|template shape|per `docs\/templates\/bkit-plan\.md` §|Follow all instruction in template/;
    const deferring = fs
      .readdirSync(promptsDir())
      .filter((f) => /^bkit-(?:build-)?plan-.+\.md$/.test(f))
      .filter((f) => deferral.test(fs.readFileSync(path.join(promptsDir(), f), "utf-8")))
      .sort();
    expect(deferring).toEqual([]);
  });
});
