import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCoreRoot, getTemplatesRoot } from "../../shared/package-roots";
import { detectContextFetchMissing } from "../before/context-fetch";
import { buildTrackerSetupAdvisory } from "../after/github";
import { buildDepUpdaterSetupAdvisory } from "../after/tools";
import { COMPLY_PHASES, TIPS_CONTEXTS } from "../../cli";
import { ALL_WORKFLOWS, EVERY_CONTEXT, SETUP_TIPS, type SetupTip } from "./catalogue";
import { STAR_TIP_ID, orderForWorkflow } from "./index";

const tip = (id: string): SetupTip => SETUP_TIPS.find((t) => t.id === id)!;

/** The advisory ids a tip reuses; none when it reuses none. */
const advisoriesOf = (t: SetupTip): readonly string[] => t.advisories ?? [];

/** The contexts a tip names; none when it names none. */
const workflowsOf = (t: SetupTip): readonly string[] => t.workflows ?? [];

/** Tips that matter in only some contexts: the comms tips, which name every context, are left out. */
const ownTips = (tips: readonly SetupTip[]): SetupTip[] =>
  tips.filter((t) => workflowsOf(t).length < EVERY_CONTEXT.length);

/** Own tips that name `ctx`, in catalogue order. */
const ownTipsFor = (ctx: string): SetupTip[] =>
  ownTips(SETUP_TIPS).filter((t) => workflowsOf(t).includes(ctx));

/** True when `pattern` names an advisory id in `ids`: exactly, or as a prefix when it ends in `*`. */
const matchesAdvisoryId = (pattern: string, ids: readonly string[]): boolean =>
  pattern.endsWith("*")
    ? ids.some((id) => id.startsWith(pattern.slice(0, -1)))
    : ids.includes(pattern);

/** Every `id: "<literal>"` / `` id: `<prefix>${…}` `` an advisory detector emits. */
function advisoryIdsInSource(): string[] {
  const root = path.join(getCoreRoot(), "engine");
  const ids: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (p !== path.join(root, "checks", "tips")) walk(p);
      } else if (e.name.endsWith(".ts") && !e.name.includes(".test.")) {
        const src = fs.readFileSync(p, "utf-8");
        for (const m of src.matchAll(/\bid: ["`]([a-z0-9-]+)/g)) ids.push(m[1]!);
      }
    }
  };
  walk(path.join(root, "checks"));
  walk(path.join(root, "install"));
  return ids;
}

/** Each `§ Section` in `steps`, paired with the nearest `.bkit/<doc>.md` before it. */
function docPointers(steps: string): Array<{ doc: string; section: string }> {
  const out: Array<{ doc: string; section: string }> = [];
  let doc: string | null = null;
  for (const m of steps.matchAll(/`(\.bkit\/[\w-]+\.md)`|§ (.+?)(?=\.\s|\.$|,|;|\)| and §|$)/g)) {
    if (m[1]) doc = m[1];
    else if (doc) out.push({ doc, section: m[2]!.trim() });
  }
  return out;
}

describe("SETUP_TIPS — catalogue", () => {
  it("every tip carries every text field", () => {
    for (const t of SETUP_TIPS) {
      for (const field of ["id", "title", "line", "why", "ask", "steps"] as const) {
        expect(t[field].trim(), `${t.id}.${field}`).not.toBe("");
      }
    }
  });

  it("ALL_WORKFLOWS names every phase workflow; EVERY_CONTEXT every tips context", () => {
    expect([...ALL_WORKFLOWS]).toEqual([...COMPLY_PHASES]);
    expect([...EVERY_CONTEXT]).toEqual([...TIPS_CONTEXTS]);
  });

  it("comms tips matter in every context, and every context has its own tips", () => {
    for (const id of ["tracker", "gh-mcp", "bkit-env", "direnv"]) {
      expect([...workflowsOf(tip(id))], id).toEqual([...EVERY_CONTEXT]);
    }
    for (const ctx of EVERY_CONTEXT) {
      expect(ownTipsFor(ctx).length, ctx).toBeGreaterThan(0);
    }
  });

  it.each([
    ["design", "serena"],
    ["plan", "serena"],
    ["build", "serena"],
    ["debug", "context-fetch"],
    ["ship", "ci-workflow"],
    ["audit", "serena"],
    ["utility", "serena"],
  ] as const)("%s leads with %s once the comms tips are done", (wf, first) => {
    const own = ownTips(orderForWorkflow(SETUP_TIPS, wf));
    expect(own[0]?.id).toBe(first);
  });

  it("audit tips are the code-reading, CI and dependency-safety ones", () => {
    const audit = ownTipsFor("audit").map((t) => t.id);
    expect(audit).toEqual(["serena", "ci-workflow", "graphify", "dependabot-renovate", "trivy"]);
  });

  it("every template path an ask names exists", () => {
    for (const t of SETUP_TIPS) {
      for (const m of t.ask.matchAll(/\.bkit\/templates\/([\w./-]*[\w/])/g)) {
        const rel = m[1]!;
        expect(fs.existsSync(path.join(getTemplatesRoot(), rel)), `${t.id}: ${rel}`).toBe(true);
      }
    }
  });

  it("ids are unique and never collide with an advisory id", () => {
    const ids = [...SETUP_TIPS.map((t) => t.id), STAR_TIP_ID];
    expect(new Set(ids).size).toBe(ids.length);
    const advisoryIds = new Set(advisoryIdsInSource());
    for (const id of ids) expect(advisoryIds.has(id), id).toBe(false);
  });

  it("every reused advisory id is one a detector emits", () => {
    const advisoryIds = advisoryIdsInSource();
    for (const t of SETUP_TIPS) {
      for (const pattern of advisoriesOf(t)) {
        expect(matchesAdvisoryId(pattern, advisoryIds), `${t.id} → ${pattern}`).toBe(true);
      }
    }
  });

  it("every docs pointer in steps resolves to a heading", () => {
    for (const t of SETUP_TIPS) {
      const pointers = docPointers(t.steps);
      expect(pointers.length, `${t.id} names no § section`).toBeGreaterThan(0);
      for (const { doc, section } of pointers) {
        const file = path.join(getCoreRoot(), doc);
        expect(fs.existsSync(file), `${t.id}: ${doc}`).toBe(true);
        const headings = fs
          .readFileSync(file, "utf-8")
          .split("\n")
          .filter((l) => /^#{2,4} /.test(l))
          .map((l) => l.replace(/^#+ /, ""));
        expect(
          headings.some((h) => h.startsWith(section)),
          `${t.id}: ${doc} § ${section}`,
        ).toBe(true);
      }
    }
  });
});

describe("SETUP_TIPS — detection", () => {
  let cwd: string;
  const write = (rel: string, content = "") => {
    fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
    fs.writeFileSync(path.join(cwd, rel), content);
  };
  const pkg = (bkit: Record<string, unknown>) => write("package.json", JSON.stringify({ bkit }));

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tips-catalogue-"));
    fs.mkdirSync(path.join(cwd, ".claude", "agents"), { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
    vi.unstubAllEnvs();
  });

  it("tracker fires exactly when tracker-setup-none does", () => {
    pkg({});
    expect(buildTrackerSetupAdvisory(cwd)?.id).toBe("tracker-setup-none");
    expect(tip("tracker").fires(cwd)).toBe(true);
    pkg({ tracker: { default: "none" } });
    expect(buildTrackerSetupAdvisory(cwd)).toBeNull();
    expect(tip("tracker").fires(cwd)).toBe(false);
  });

  it.each(["github", "linear", "jira"])("tracker stays quiet once %s is chosen", (tracker) => {
    pkg({ tracker: { default: tracker } });
    expect(buildTrackerSetupAdvisory(cwd)?.id).toBe(`tracker-setup-${tracker}`);
    expect(tip("tracker").fires(cwd)).toBe(false);
  });

  it("gh-mcp fires only for the GitHub tracker", () => {
    pkg({ tracker: { default: "linear" } });
    expect(tip("gh-mcp").fires(cwd)).toBe(false);
    pkg({ tracker: { default: "jira" } });
    expect(tip("gh-mcp").fires(cwd)).toBe(false);
    pkg({ tracker: { default: "github" } });
    expect(tip("gh-mcp").fires(cwd)).toBe(true); // no github server entry
    write(".mcp.json", JSON.stringify({ mcpServers: { github: { url: "https://x" } } }));
    vi.stubEnv("CI", "");
    vi.stubEnv("BKIT_GH_TOKEN", "tok");
    expect(tip("gh-mcp").fires(cwd)).toBe(false);
  });

  it.each([
    ["github", ["BKIT_GH_TOKEN=x"]],
    ["linear", ["BKIT_GH_TOKEN=x", "BKIT_LINEAR_API_KEY=y"]],
    ["jira", ["BKIT_GH_TOKEN=x", "BKIT_JIRA_API_KEY=y"]],
  ] as const)("bkit-env fires until every token the %s tracker needs is set", (tracker, lines) => {
    vi.stubEnv("CI", "");
    vi.stubEnv("CLAUDE_CODE_REMOTE", "");
    vi.stubEnv("CURSOR_REMOTE_AGENT", "");
    pkg({ tracker: { default: tracker } });
    write(".bkit/.env.example", "BKIT_GH_TOKEN=\n");
    expect(tip("bkit-env").fires(cwd)).toBe(true); // no .bkit/.env
    for (let i = 1; i < lines.length; i++) {
      write(".bkit/.env", `${lines.slice(0, i).join("\n")}\n`);
      expect(tip("bkit-env").fires(cwd), lines[i]).toBe(true);
    }
    write(".bkit/.env", `${lines.join("\n")}\n`);
    expect(tip("bkit-env").fires(cwd)).toBe(false);
  });

  it("issue-forms fires only for the GitHub tracker with no issue template folder", () => {
    pkg({ tracker: { default: "linear" } });
    expect(tip("issue-forms").fires(cwd)).toBe(false);
    pkg({ tracker: { default: "jira" } });
    expect(tip("issue-forms").fires(cwd)).toBe(false);
    pkg({ tracker: { default: "github" } });
    expect(tip("issue-forms").fires(cwd)).toBe(true);
    write(".github/ISSUE_TEMPLATE/bug_report.md");
    expect(tip("issue-forms").fires(cwd)).toBe(false);
  });

  it("direnv stays quiet until .bkit/.env exists", () => {
    vi.stubEnv("CI", "");
    vi.stubEnv("CLAUDE_CODE_REMOTE", "");
    vi.stubEnv("CURSOR_REMOTE_AGENT", "");
    expect(tip("direnv").fires(cwd)).toBe(false);
    write(".bkit/.env", "BKIT_GH_TOKEN=x\n");
    expect(tip("direnv").fires(cwd)).toBe(true); // no .envrc
  });

  it("context-fetch fires exactly when context-fetch-missing does", () => {
    write(".agents/context.md", "<!-- bkit:start -->\n<!-- bkit:end -->\n");
    expect(detectContextFetchMissing(cwd)).not.toBeNull();
    expect(tip("context-fetch").fires(cwd)).toBe(true);
    write(".agents/context.md", "<!-- bkit:end -->\n<!-- context-fetch:none -->\n");
    expect(detectContextFetchMissing(cwd)).toBeNull();
    expect(tip("context-fetch").fires(cwd)).toBe(false);
  });

  it("dependabot-renovate fires exactly when dep-updater-absent does", () => {
    fs.mkdirSync(path.join(cwd, ".github", "workflows"), { recursive: true });
    expect(buildDepUpdaterSetupAdvisory(cwd)?.id).toBe("dep-updater-absent");
    expect(tip("dependabot-renovate").fires(cwd)).toBe(true);
    write(".github/dependabot.yml", "version: 2\n");
    expect(buildDepUpdaterSetupAdvisory(cwd)).toBeNull();
    expect(tip("dependabot-renovate").fires(cwd)).toBe(false);
  });

  it("trivy fires once workflows exist and none runs the scan", () => {
    expect(tip("trivy").fires(cwd)).toBe(false);
    write(".github/workflows/bkit-ci.yml", "name: CI\n");
    expect(tip("trivy").fires(cwd)).toBe(true);
    write(
      ".github/workflows/scan.yaml",
      "steps:\n  - uses: docker://ghcr.io/aquasecurity/trivy:0.75.0\n",
    );
    expect(tip("trivy").fires(cwd)).toBe(false);
  });

  it("test-lint stays quiet until the repo lists a JS test runner", () => {
    expect(tip("test-lint").fires(cwd)).toBe(false);
    write("package.json", JSON.stringify({ devDependencies: { prettier: "^3.0.0" } }));
    expect(tip("test-lint").fires(cwd)).toBe(false);
  });

  it.each([
    ["vitest", "devDependencies"],
    ["jest", "dependencies"],
  ])("test-lint fires for %s in %s with no test linter", (runner, field) => {
    write("package.json", JSON.stringify({ [field]: { [runner]: "^1.0.0" } }));
    expect(tip("test-lint").fires(cwd)).toBe(true);
  });

  it.each([
    [".oxlintrc.json", "{}"],
    ["oxlint.config.ts", "export default {};\n"],
    ["eslint.config.js", 'import vitest from "@vitest/eslint-plugin";\nexport default [];\n'],
    [".eslintrc.json", '{ "extends": ["plugin:jest/recommended"] }'],
  ])("test-lint goes quiet once %s lints tests", (file, content) => {
    write("package.json", JSON.stringify({ devDependencies: { vitest: "^4.0.0" } }));
    expect(tip("test-lint").fires(cwd)).toBe(true);
    write(file, content);
    expect(tip("test-lint").fires(cwd)).toBe(false);
  });

  it("test-lint goes quiet when oxlint is a dependency", () => {
    write(
      "package.json",
      JSON.stringify({ devDependencies: { vitest: "^4.0.0", oxlint: "^1.0.0" } }),
    );
    expect(tip("test-lint").fires(cwd)).toBe(false);
  });

  it("test-lint still fires when the ESLint config names no test plugin", () => {
    write("package.json", JSON.stringify({ devDependencies: { vitest: "^4.0.0" } }));
    write(
      "eslint.config.js",
      'import js from "@eslint/js";\nexport default [js.configs.recommended];\n',
    );
    expect(tip("test-lint").fires(cwd)).toBe(true);
  });

  it("cloud fires only once cloud agents are chosen", () => {
    pkg({});
    expect(tip("cloud").fires(cwd)).toBe(false);
    pkg({ cloud: { agent: "claude" } });
    expect(tip("cloud").fires(cwd)).toBe(true);
    write(".github/workflows/bkit-cloud.yml");
    expect(tip("cloud").fires(cwd)).toBe(true); // bootstrap hook still missing
    write(".claude/hooks/bkit-cloud-bootstrap.sh");
    expect(tip("cloud").fires(cwd)).toBe(false);
  });

  it("ci-workflow follows a renamed bkit.testing.ciWorkflow", () => {
    pkg({ testing: { ciWorkflow: "ci.yml" } });
    expect(tip("ci-workflow").fires(cwd)).toBe(true);
    write(".github/workflows/ci.yml");
    expect(tip("ci-workflow").fires(cwd)).toBe(false);
  });

  it("ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names", () => {
    expect(tip("ci-workflow").ask).toContain("bkit.testing.ciWorkflow");
    expect(tip("ci-workflow").ask).not.toContain("to .github/workflows/bkit-ci.yml");
  });

  it("serena needs both the project file and an MCP entry", () => {
    write(".serena/project.yml");
    expect(tip("serena").fires(cwd)).toBe(true);
    write(".mcp.json", JSON.stringify({ mcpServers: { serena: { command: "s" } } }));
    expect(tip("serena").fires(cwd)).toBe(false);
  });

  it("compaction-window and claude-connectors fire per Claude Code setting", () => {
    expect(tip("compaction-window").fires(cwd)).toBe(true);
    expect(tip("claude-connectors").fires(cwd)).toBe(true);
    write(
      ".claude/settings.json",
      JSON.stringify({ autoCompactWindow: 300000, disableClaudeAiConnectors: false }),
    );
    expect(tip("compaction-window").fires(cwd)).toBe(false);
    expect(tip("claude-connectors").fires(cwd)).toBe(false);
  });

  it("host-specific tips stay quiet without their host", () => {
    fs.rmSync(path.join(cwd, ".claude"), { recursive: true });
    expect(tip("compaction-window").fires(cwd)).toBe(false);
    expect(tip("claude-connectors").fires(cwd)).toBe(false);
    expect(tip("cursor-files").fires(cwd)).toBe(false);
    fs.mkdirSync(path.join(cwd, ".cursor", "agents"), { recursive: true });
    expect(tip("cursor-files").fires(cwd)).toBe(true);
  });

  it("tmp-prune fires only once a pre-push hook exists without the prune script", () => {
    expect(tip("tmp-prune").fires(cwd)).toBe(false);
    write(".husky/pre-push");
    expect(tip("tmp-prune").fires(cwd)).toBe(true);
    write("scripts/cleanup/bkit-tmp-prune.mjs");
    expect(tip("tmp-prune").fires(cwd)).toBe(false);
  });

  it("min-push fires only once a pre-push hook exists without the min-push check", () => {
    expect(tip("min-push").fires(cwd)).toBe(false);
    write(".husky/pre-push", "pnpm bkit:gate:static-unit\n");
    expect(tip("min-push").fires(cwd)).toBe(true);
    write(".husky/pre-push", "pnpm -s bkit ci min-push $REFS\n");
    expect(tip("min-push").fires(cwd)).toBe(false);
  });

  it("disk-prune fires only once a pre-push hook exists without either step file", () => {
    expect(tip("disk-prune").fires(cwd)).toBe(false);
    write(".husky/pre-push");
    expect(tip("disk-prune").fires(cwd)).toBe(true);
    write("scripts/cleanup/bkit-disk-prune.mjs");
    expect(tip("disk-prune").fires(cwd)).toBe(false);
  });

  it("disk-prune stays quiet once the machine step file exists", () => {
    write(".husky/pre-push");
    const config = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tip-config-"));
    vi.stubEnv("XDG_CONFIG_HOME", config);
    try {
      fs.mkdirSync(path.join(config, "bkit"));
      fs.writeFileSync(path.join(config, "bkit", "disk-prune.mjs"), "export default [];\n");
      expect(tip("disk-prune").fires(cwd)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      fs.rmSync(config, { recursive: true, force: true });
    }
  });

  it("mcp-scope fires on an unlocked URL", () => {
    write(
      ".mcp.json",
      JSON.stringify({ mcpServers: { s: { url: "https://mcp.sentry.dev/mcp" } } }),
    );
    expect(tip("mcp-scope").fires(cwd)).toBe(true);
  });

  it("bkit-output-json fires while a copied script reads bkit output without --json", () => {
    expect(tip("bkit-output-json").fires(cwd)).toBe(false);
    write(".claude/hooks/bkit-cloud-bootstrap.sh", '"$BKIT" context list-blocks | jq -r .x\n');
    expect(tip("bkit-output-json").fires(cwd)).toBe(true);
    write(".claude/hooks/bkit-cloud-bootstrap.sh", '"$BKIT" context list-blocks --json | jq .x\n');
    expect(tip("bkit-output-json").fires(cwd)).toBe(false);
  });
});
