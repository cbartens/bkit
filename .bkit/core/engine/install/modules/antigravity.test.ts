// install/modules/antigravity.test.ts — the Antigravity host module: prompt, skill and
// hook rendering into `.agents/`.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ANTIGRAVITY_PROMPTS_DIR,
  ANTIGRAVITY_SKILLS_DIR,
  applyAntigravityWorkflowSkill,
  renderAntigravityAgentsSkills,
  runAntigravityModule,
} from "./antigravity";
import { buildAntigravityModelLookup, parseEffortMap } from "../../render/models";
import { getBkitDocsRoot } from "../../shared/package-roots";
import { DEFAULT_ISSUE_TRACKER } from "../manifest";
import type { ModuleContext } from "./index";

const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");

let originalCwd: string;
let tmpDir: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-antigravity-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
  return {
    dryRun: false,
    tokens: { DEFAULT_BRANCH: "main", PROJECT_NAME: "p", REPO_SLUG: "o/r" },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
    effortMap: parseEffortMap(promptsMd),
    advisories: [],
    ws: { writes: [] },
    logPrefix: "[test]",
    postDispatch: [],
    issueTracker: DEFAULT_ISSUE_TRACKER,
    version: "9.9.9",
    ...overrides,
  };
}

describe("applyAntigravityWorkflowSkill", () => {
  it("resolves tracker blocks then emits name + description frontmatter", () => {
    const wf = '---\ndescription: "Ship Feature"\n---\n\n# Ship\n\nBody.\n';
    const out = applyAntigravityWorkflowSkill(wf, "bkit-ship", DEFAULT_ISSUE_TRACKER);
    expect(out).toMatch(/^---\nname: bkit-ship\n/);
    expect(out).toContain('description: "Ship Feature"');
    expect(out).toContain("# Ship");
  });
});

describe("renderAntigravityAgentsSkills", () => {
  it("writes prompt mirrors, workflow skills, and stamps the managed version", () => {
    const ctx = makeCtx();
    renderAntigravityAgentsSkills(ctx);

    // Prompt mirror for a known agent.
    const prompt = path.join(tmpDir, ANTIGRAVITY_PROMPTS_DIR, "bkit-build-plan-execute.md");
    expect(fs.existsSync(prompt)).toBe(true);
    const promptBody = fs.readFileSync(prompt, "utf-8");
    expect(promptBody).toContain("name: bkit-build-plan-execute");
    expect(promptBody).toMatch(/^model: gemini-3\.8-/m);
    expect(promptBody).toContain("- view_file");
    expect(promptBody).toContain("bkit:managed v9.9.9");

    // Workflow skill.
    const skill = path.join(tmpDir, ANTIGRAVITY_SKILLS_DIR, "bkit-build", "SKILL.md");
    expect(fs.existsSync(skill)).toBe(true);
    const skillBody = fs.readFileSync(skill, "utf-8");
    expect(skillBody).toMatch(/^---\nname: bkit-build\n/);
    expect(skillBody).toContain(".agents/prompts/");

    // Every write is tracked for check drift.
    expect(ctx.ws.writes.length).toBeGreaterThan(0);
  });

  it("is idempotent — a second render writes nothing", () => {
    renderAntigravityAgentsSkills(makeCtx());
    const second = makeCtx();
    renderAntigravityAgentsSkills(second);
    expect(second.ws.writes.length).toBe(0);
  });
});

describe("runAntigravityModule", () => {
  it("writes hooks.json, both hook scripts, and emits the setup advisory", () => {
    const ctx = makeCtx();
    runAntigravityModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, ".agents", "hooks.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".agents", "hooks", "bkit-gateguard.cjs"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".agents", "hooks", "bkit-guardrails.cjs"))).toBe(true);
    expect(ctx.advisories.some((a) => a.id === "antigravity-setup")).toBe(true);
  });
});
