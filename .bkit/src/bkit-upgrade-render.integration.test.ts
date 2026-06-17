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
    const upgrade = runBkit(["upgrade", "--auto-apply"]);
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

  it("upgrade renders opencode.json with provider/tracker sentinels resolved (no raw @@…@@ leak, #245)", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return; // tsx not available — skip (matches sibling suites)

    // Install the opencode host (nvidia) — opencode.json is templated with @@OPENCODE_*@@
    // sentinels that renderOpencodeJson resolves on install.
    const install = runBkit(["install", "--opencode=nvidia"]);
    expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);

    const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    expect(fs.existsSync(opencodeJsonPath)).toBe(true);
    // Install resolves every sentinel.
    expect(fs.readFileSync(opencodeJsonPath, "utf-8")).not.toContain("@@");

    // Add a consumer-owned key so we also confirm the Tier-2 deep-merge still preserves it.
    const tampered = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as Record<
      string,
      unknown
    >;
    tampered.theme = "consumer-custom-theme";
    fs.writeFileSync(opencodeJsonPath, JSON.stringify(tampered, null, 2) + "\n", "utf-8");

    // Upgrade must render opencode.json the SAME way install does (contentOverride) — NOT
    // deep-merge the raw template, which would inject the literal @@OPENCODE_*@@ sentinel keys.
    const upgrade = runBkit(["upgrade", "--auto-apply"]);
    expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\]/);

    const after = fs.readFileSync(opencodeJsonPath, "utf-8");
    expect(after, "upgrade must not leak raw @@…@@ sentinels into opencode.json").not.toContain(
      "@@",
    );
    const parsed = JSON.parse(after) as { provider?: Record<string, unknown>; theme?: string };
    // Provider block intact (nvidia), consumer key preserved by the deep-merge.
    expect(parsed.provider?.nvidia).toBeDefined();
    expect(parsed.theme).toBe("consumer-custom-theme");
  }, 180_000);

  it("opencode gateway (#282): install records the manifest provider; upgrade re-renders the opencode block (no ollama-local fallback)", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return; // tsx not available — skip (matches sibling suites)

    type OpencodeDoc = {
      provider?: Record<string, { npm?: string; options?: Record<string, unknown> }>;
    };

    // Install the opencode host as the opencode-native gateway (built-in provider, OPENCODE_API_KEY auth).
    const install = runBkit(["install", "--opencode=opencode"]);
    expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);

    // (1) opencode.json has a minimal built-in `opencode` provider block keyed by providerId —
    //     no npm driver, only the OPENCODE_API_KEY apiKey.
    const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    expect(fs.existsSync(opencodeJsonPath)).toBe(true);
    const installed = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
    expect(
      installed.provider?.opencode,
      "opencode gateway seeds an `opencode` provider block",
    ).toBeDefined();
    expect(installed.provider?.opencode?.npm).toBeUndefined();
    expect(installed.provider?.opencode?.options?.apiKey).toBe("{env:OPENCODE_API_KEY}");

    // (2) The provider is recorded in the manifest — the authoritative upgrade-time detection signal.
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { opencodeProvider?: string };
    };
    expect(pkg.bkit?.opencodeProvider).toBe("opencode");

    // (3) Agents seeded with the opencode-side prefix (opencode/…).
    const agentsDir = path.join(tmpDir, ".opencode", "agents");
    const anAgent = fs.readdirSync(agentsDir).find((f) => f.endsWith(".md"));
    expect(anAgent).toBeTruthy();
    const agentBody = fs.readFileSync(path.join(agentsDir, anAgent!), "utf-8");
    expect(agentBody).toMatch(/model:\s*opencode\//);

    // (4) Upgrade must re-render opencode.json from the manifest provider — keeping the
    //     `opencode` block, NOT falling back to ollama-local.
    const upgrade = runBkit(["upgrade", "--auto-apply"]);
    expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\]/);
    const after = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
    expect(after.provider?.opencode?.options?.apiKey).toBe("{env:OPENCODE_API_KEY}");
    expect(
      after.provider?.["ollama-local"],
      "upgrade must NOT re-render opencode as ollama-local",
    ).toBeUndefined();
  }, 180_000);
});
