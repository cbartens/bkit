// bkit-upgrade-render.integration.test.ts — #251 regression
//
// `bkit upgrade` must re-render the bkit-managed OUTPUT files that the template walk
// (runUpgrade over .bkit/templates/) does NOT cover: host agents/commands (source-rendered
// from .bkit/prompts + .bkit/workflows) and the `.bkit/*.md` canonical docs (runBkitDocs).
// Before the fix, `bkit upgrade` left these stale — a consumer taking a new bkit version got
// new config but stale prompts/agents/commands/docs, and had to re-run `bkit install`.
//
// Strategy (in-test dogfood): spawn the real install + upgrade binaries against a tmpdir
// consumer. getPkgRoot resolves to THIS repo, so install renders the real sources into the
// tmpdir. We then tamper rendered outputs + the prompts.md managed block + add a consumer
// override row, run `upgrade`, and assert: agents/docs restored, managed block refreshed,
// consumer override preserved (markered block-merge survives upgrade — #245).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

let tmpDir: string;
let originalCwd: string;

const getInstallPath = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
const getTsxBin = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

function runBkit(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(getTsxBin(), [getInstallPath(), ...args], {
    cwd: tmpDir,
    encoding: "utf-8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    timeout: 90_000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-render-"));
  // Consumer prerequisites: package.json (with a recorded tracker) + a .git marker so the
  // --core preflight blocker is satisfied.
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify(
      {
        name: "upgrade-render-consumer",
        version: "0.0.0",
        devDependencies: {},
        bkit: { issueTracker: "github" },
      },
      null,
      2,
    ),
    "utf-8",
  );
  fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("#251 — bkit upgrade re-renders agents/commands + .bkit docs", () => {
  it("restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return; // tsx not available — skip (matches sibling suites)

    // --- Install: core + claude + opencode host (gives .claude/agents, .opencode/agents,
    //     .claude/commands, .opencode/commands, and the .bkit/*.md docs). ---
    const install = runBkit(["install", "--claude", "--opencode=nvidia"]);
    const installCombined = `${install.stdout}\n${install.stderr}`;
    // Sanity: install reached dispatch and produced the rendered outputs.
    expect(installCombined).toMatch(/\[bkit-install\]/);

    const claudeAgentsDir = path.join(tmpDir, ".claude", "agents");
    const opencodeAgentsDir = path.join(tmpDir, ".opencode", "agents");
    const promptsPath = path.join(tmpDir, ".bkit", "prompts.md");
    expect(
      fs.existsSync(claudeAgentsDir),
      `install must render ${claudeAgentsDir}\n${installCombined}`,
    ).toBe(true);
    expect(fs.existsSync(opencodeAgentsDir)).toBe(true);
    expect(fs.existsSync(promptsPath)).toBe(true);

    const claudeAgentFile = fs
      .readdirSync(claudeAgentsDir)
      .find((f) => f.startsWith("bkit-") && f.endsWith(".md"));
    const opencodeAgentFile = fs
      .readdirSync(opencodeAgentsDir)
      .find((f) => f.startsWith("bkit-") && f.endsWith(".md"));
    expect(claudeAgentFile, "expected a bkit-* agent in .claude/agents").toBeTruthy();
    expect(opencodeAgentFile, "expected a bkit-* agent in .opencode/agents").toBeTruthy();

    const claudeAgentPath = path.join(claudeAgentsDir, claudeAgentFile!);
    const opencodeAgentPath = path.join(opencodeAgentsDir, opencodeAgentFile!);
    const claudeOriginal = fs.readFileSync(claudeAgentPath, "utf-8");
    const opencodeOriginal = fs.readFileSync(opencodeAgentPath, "utf-8");

    const promptsOriginal = fs.readFileSync(promptsPath, "utf-8");
    expect(promptsOriginal).toContain("bkit:start");
    expect(promptsOriginal).toContain("bkit:end");

    // --- Tamper: rendered agents, the prompts.md managed block, and add a consumer override row. ---
    const AGENT_SENTINEL = "STALE-TAMPERED-AGENT-DO-NOT-KEEP";
    const MANAGED_SENTINEL = "STALE-TAMPERED-MANAGED-BLOCK";
    const OVERRIDE_ROW = "CONSUMER-OVERRIDE-ROW-MUST-SURVIVE";

    fs.writeFileSync(claudeAgentPath, `${AGENT_SENTINEL}\n${claudeOriginal}`, "utf-8");
    fs.writeFileSync(opencodeAgentPath, `${AGENT_SENTINEL}\n${opencodeOriginal}`, "utf-8");

    // Inject a sentinel INSIDE the managed block (right after the start marker) and append a
    // consumer override row AFTER the file's content (below bkit:end).
    const tamperedPrompts =
      promptsOriginal.replace(/(<!--\s*bkit:start\s*-->)/, `$1\n${MANAGED_SENTINEL}`).trimEnd() +
      `\n\n${OVERRIDE_ROW}\n`;
    expect(tamperedPrompts).toContain(MANAGED_SENTINEL); // replace actually landed
    fs.writeFileSync(promptsPath, tamperedPrompts, "utf-8");

    // --- Upgrade: must re-render everything install does. ---
    const upgrade = runBkit(["upgrade", "--non-interactive"]);
    const upgradeCombined = `${upgrade.stdout}\n${upgrade.stderr}`;
    expect(upgradeCombined).toMatch(/\[bkit-upgrade\]/);
    // Summary surfaces the re-render pass.
    expect(upgradeCombined).toMatch(/re-rendered:/);

    // Agents fully restored to their rendered form (tamper gone, byte-identical).
    const claudeAfter = fs.readFileSync(claudeAgentPath, "utf-8");
    const opencodeAfter = fs.readFileSync(opencodeAgentPath, "utf-8");
    expect(claudeAfter).not.toContain(AGENT_SENTINEL);
    expect(claudeAfter).toBe(claudeOriginal);
    expect(opencodeAfter).not.toContain(AGENT_SENTINEL);
    expect(opencodeAfter).toBe(opencodeOriginal);

    // prompts.md: managed block refreshed (sentinel gone) AND consumer override preserved.
    const promptsAfter = fs.readFileSync(promptsPath, "utf-8");
    expect(promptsAfter).not.toContain(MANAGED_SENTINEL);
    expect(promptsAfter).toContain(OVERRIDE_ROW);
  }, 180_000);
});
