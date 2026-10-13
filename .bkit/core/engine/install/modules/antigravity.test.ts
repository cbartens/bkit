// install/modules/antigravity.test.ts — the Antigravity host module: the workspace plugin
// (`.agents/plugins/bkit/`) — plugin.json, prompts, skills and hooks.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ANTIGRAVITY_AGENTS_DIR,
  ANTIGRAVITY_HOOKS_DIR,
  ANTIGRAVITY_PLUGIN_DIR,
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
  it("writes plugin prompts + workflow skills, and stamps the managed version", () => {
    const ctx = makeCtx();
    renderAntigravityAgentsSkills(ctx);

    // Subagent prompt mirror inside the plugin.
    const prompt = path.join(tmpDir, ANTIGRAVITY_AGENTS_DIR, "bkit-build-plan-execute.md");
    expect(fs.existsSync(prompt)).toBe(true);
    const promptBody = fs.readFileSync(prompt, "utf-8");
    expect(promptBody).toContain("name: bkit-build-plan-execute");
    expect(promptBody).toMatch(/^model: gemini-3\.8-/m);
    expect(promptBody).toContain("- view_file");
    expect(promptBody).toContain("bkit:managed v9.9.9");

    // Workflow skill inside the plugin.
    const skill = path.join(tmpDir, ANTIGRAVITY_SKILLS_DIR, "bkit-build", "SKILL.md");
    expect(fs.existsSync(skill)).toBe(true);
    const skillBody = fs.readFileSync(skill, "utf-8");
    expect(skillBody).toMatch(/^---\nname: bkit-build\n/);
    // Subagent references resolve to the PLUGIN's agents/ dir, never `.agents/prompts/`.
    expect(skillBody).toContain(".agents/plugins/bkit/agents/");
    expect(skillBody).not.toContain(".agents/prompts/");

    expect(ctx.ws.writes.length).toBeGreaterThan(0);
  });

  it("never writes Codex's `.agents/skills/`", () => {
    renderAntigravityAgentsSkills(makeCtx());
    expect(fs.existsSync(path.join(tmpDir, ".agents", "skills"))).toBe(false);
  });

  it("is idempotent — a second render writes nothing", () => {
    renderAntigravityAgentsSkills(makeCtx());
    const second = makeCtx();
    renderAntigravityAgentsSkills(second);
    expect(second.ws.writes.length).toBe(0);
  });
});

describe("runAntigravityModule", () => {
  it("writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory", () => {
    const ctx = makeCtx();
    runAntigravityModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, ANTIGRAVITY_PLUGIN_DIR, "plugin.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ANTIGRAVITY_PLUGIN_DIR, "hooks.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ANTIGRAVITY_HOOKS_DIR, "bkit-gateguard.cjs"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(tmpDir, ANTIGRAVITY_HOOKS_DIR, "bkit-guardrails.cjs"))).toBe(
      true,
    );
    expect(ctx.advisories.some((a) => a.id === "antigravity-setup")).toBe(true);
  });

  it("warns when Codex is also installed (skill-overlap advisory)", () => {
    const ctx = makeCtx({ installedModules: new Set(["core", "codex", "antigravity"]) });
    runAntigravityModule(ctx);
    expect(ctx.advisories.some((a) => a.id === "antigravity-codex-skill-overlap")).toBe(true);
  });

  it("stays silent about the overlap when Codex is absent", () => {
    const ctx = makeCtx({ installedModules: new Set(["core", "antigravity"]) });
    runAntigravityModule(ctx);
    expect(ctx.advisories.some((a) => a.id === "antigravity-codex-skill-overlap")).toBe(false);
  });

  it("migrates the pre-plugin layout (`.agents/prompts`, `.agents/hooks*`)", () => {
    // Seed the old layout.
    fs.mkdirSync(path.join(tmpDir, ".agents", "prompts"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", "prompts", "bkit-build.md"), "legacy\n");
    fs.writeFileSync(path.join(tmpDir, ".agents", "hooks.json"), "{}\n");
    fs.mkdirSync(path.join(tmpDir, ".agents", "hooks"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", "hooks", "bkit-gateguard.cjs"), "legacy\n");

    runAntigravityModule(makeCtx());

    expect(fs.existsSync(path.join(tmpDir, ".agents", "prompts", "bkit-build.md"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".agents", "hooks.json"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".agents", "hooks", "bkit-gateguard.cjs"))).toBe(false);
  });
});
