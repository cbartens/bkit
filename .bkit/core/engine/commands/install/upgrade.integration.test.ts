// commands/install/upgrade.integration.test.ts — Integration test: 0.4.x → 0.5.x customised hooks scenario.
//
// Tests: "Upgrade integration (customised hooks scenario)"
//
// Fixture: tests/fixtures/heavy-customised-consumer/
//
// Scenario:
//   A consumer had bkit@0.4.x installed with a customised .cursor/hooks.json:
//   - Consumer added `failClosed: true` and `loop_limit: 5` (consumer drift).
//   - bkit@0.5.x ships an updated hooks.json template.
//
//   `bkit upgrade` against this consumer must:
//   - NOT silently overwrite the consumer's `failClosed` and `loop_limit` fields.
//   - Report the conflict to stderr.
//   - Exit non-zero in --non-interactive mode.
//
// This test exercises the full runUpgrade function at the integration level,
// wiring the heavy-customised-consumer fixture to simulate a real upgrade path.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runUpgrade, updateCanonicalHashesAfterUpgrade, type UpgradeCandidate } from "./upgrade";
import { listFilesRecursive, remapTemplateDest } from "../../install/template-copies";
import { listStampedFiles } from "../../install/modules/index";
import { readInstallingVersion } from "../../install/modules/core";
import { getTemplatesRoot } from "../../shared/package-roots";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import {
  detectMarkerStyle,
  findLineAnchoredMarkers,
  selectMarkers,
} from "../../install/managed-block";
import {
  sha256,
  writeBkitVersion,
  readBkitVersion,
  readManagedVersion,
  type BkitVersion,
} from "../../install/version-file";

let tmpDir: string;
let originalCwd: string;

const FIXTURES_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../../../../tests/fixtures/heavy-customised-consumer",
);

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-integ-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seedCursorHooksFromFixture(): void {
  // Place the fixture's cursor-hooks.json at .cursor/hooks.json
  fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
  fs.copyFileSync(
    path.join(FIXTURES_DIR, "cursor-hooks.json"),
    path.join(tmpDir, ".cursor", "hooks.json"),
  );
}

function writeVersionFile(canonicalHashes: Record<string, string> = {}): void {
  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
  const v: BkitVersion = {
    pinnedVersion: "0.4.0",
    canonicalHashes,
    claudeAllowDerived: [],
  };
  writeBkitVersion(path.join(tmpDir, ".bkit", "version"), v);
}

// ---------------------------------------------------------------------------
// Scenario 1: Consumer has customised .cursor/hooks.json
//   - bkit@0.4.x installed: hooks.json had only SessionStart (bkit default)
//   - Consumer added failClosed + loop_limit → drift
//   - bkit@0.5.x ships new hooks.json template
//   - bkit upgrade must: detect conflict, NOT overwrite, report to stderr
// ---------------------------------------------------------------------------

describe("P4.T7 — upgrade integration: heavy-customised-consumer scenario", () => {
  it("detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", () => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      console.warn(`Fixture missing at ${FIXTURES_DIR} — skipping`);
      return;
    }

    seedCursorHooksFromFixture();

    // Simulate what bkit@0.4.x would have written as the canonical content:
    // A minimal hooks.json with just SessionStart (no consumer additions)
    const bkit04CanonicalContent =
      JSON.stringify(
        {
          hooks: {
            SessionStart: [
              {
                matcher: "",
                hooks: [{ type: "command", command: ".cursor/hooks/bkit-preflight.sh" }],
              },
            ],
          },
        },
        null,
        2,
      ) + "\n";

    // Record the 0.4.x canonical hash — disk content differs (consumer drift)
    writeVersionFile({ ".cursor/hooks.json": sha256(bkit04CanonicalContent) });

    // bkit@0.5.x template: updated hooks.json (adds a new hook event)
    const newTemplateContent =
      JSON.stringify(
        {
          hooks: {
            SessionStart: [
              {
                matcher: "",
                hooks: [{ type: "command", command: ".cursor/hooks/bkit-preflight.sh" }],
              },
            ],
            PostToolUse: [{ matcher: "Edit", hooks: [{ type: "command", command: "echo done" }] }],
          },
        },
        null,
        2,
      ) + "\n";

    const templatePath = path.join(tmpDir, ".bkit-template-hooks.json");
    fs.writeFileSync(templatePath, newTemplateContent, "utf-8");

    const result = runUpgrade([{ relPath: ".cursor/hooks.json", templatePath }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    // Conflict detected: consumer has failClosed, loop_limit (drift)
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]!.relPath).toBe(".cursor/hooks.json");
    expect(result.updated).not.toContain(".cursor/hooks.json");

    // Consumer content NOT overwritten
    const currentContent = fs.readFileSync(path.join(tmpDir, ".cursor", "hooks.json"), "utf-8");
    const currentDoc = JSON.parse(currentContent) as Record<string, unknown>;
    expect(currentDoc.failClosed).toBe(true);
    expect(currentDoc.loop_limit).toBe(5);
  });

  it("does not silently overwrite consumer drift in --non-interactive mode", () => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      console.warn(`Fixture missing at ${FIXTURES_DIR} — skipping`);
      return;
    }

    seedCursorHooksFromFixture();

    const bkit04CanonicalContent = JSON.stringify({ hooks: { SessionStart: [] } }, null, 2) + "\n";
    writeVersionFile({ ".cursor/hooks.json": sha256(bkit04CanonicalContent) });

    const newTemplateContent =
      JSON.stringify({ hooks: { SessionStart: [], PostToolUse: [] } }, null, 2) + "\n";
    const templatePath = path.join(tmpDir, ".bkit-template-hooks.json");
    fs.writeFileSync(templatePath, newTemplateContent, "utf-8");

    const result = runUpgrade([{ relPath: ".cursor/hooks.json", templatePath }], {
      nonInteractive: true,
      dryRun: false,
      cwd: tmpDir,
    });

    // Must report conflict, not update
    expect(result.conflicts).toHaveLength(1);
    expect(result.updated).toHaveLength(0);

    // Consumer file byte-identical to pre-upgrade (no overwrite)
    const diskContent = fs.readFileSync(path.join(tmpDir, ".cursor", "hooks.json"), "utf-8");
    const fixtureContent = fs.readFileSync(path.join(FIXTURES_DIR, "cursor-hooks.json"), "utf-8");
    expect(diskContent).toBe(fixtureContent);
  });

  it("conflict list has relPath and both content versions for AI-actionable diff", () => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      console.warn(`Fixture missing at ${FIXTURES_DIR} — skipping`);
      return;
    }

    seedCursorHooksFromFixture();

    const bkit04CanonicalContent = JSON.stringify({ hooks: { SessionStart: [] } }, null, 2) + "\n";
    writeVersionFile({ ".cursor/hooks.json": sha256(bkit04CanonicalContent) });

    const newTemplateContent =
      JSON.stringify({ hooks: { SessionStart: [], PostToolUse: [] } }, null, 2) + "\n";
    const templatePath = path.join(tmpDir, ".bkit-template-hooks.json");
    fs.writeFileSync(templatePath, newTemplateContent, "utf-8");

    const result = runUpgrade([{ relPath: ".cursor/hooks.json", templatePath }], {
      nonInteractive: true,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.conflicts).toHaveLength(1);
    const conflict = result.conflicts[0]!;
    expect(conflict.relPath).toBe(".cursor/hooks.json");
    // templateContent: the new bkit template
    expect(conflict.templateContent).toBe(newTemplateContent);
    // diskContent: consumer's modified version
    const fixtureContent = fs.readFileSync(path.join(FIXTURES_DIR, "cursor-hooks.json"), "utf-8");
    expect(conflict.diskContent).toBe(fixtureContent);
  });

  it("upgrades non-conflicting file while preserving conflicting consumer file", () => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      console.warn(`Fixture missing at ${FIXTURES_DIR} — skipping`);
      return;
    }

    seedCursorHooksFromFixture();

    const bkit04CanonicalHooksContent =
      JSON.stringify({ hooks: { SessionStart: [] } }, null, 2) + "\n";
    const oldAgentContent = "old agent content\n";

    // Two files: .cursor/hooks.json (conflict) + .claude/agents/bkit-test.md (clean update)
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-test.md"),
      oldAgentContent,
      "utf-8",
    );

    writeVersionFile({
      ".cursor/hooks.json": sha256(bkit04CanonicalHooksContent),
      ".claude/agents/bkit-test.md": sha256(oldAgentContent), // no consumer drift
    });

    const newHooksContent =
      JSON.stringify({ hooks: { SessionStart: [], PostToolUse: [] } }, null, 2) + "\n";
    const newAgentContent = "updated agent content\n";

    const templateHooks = path.join(tmpDir, ".bkit-template-hooks.json");
    const templateAgent = path.join(tmpDir, ".bkit-template-agent.md");
    fs.writeFileSync(templateHooks, newHooksContent, "utf-8");
    fs.writeFileSync(templateAgent, newAgentContent, "utf-8");

    const result = runUpgrade(
      [
        { relPath: ".cursor/hooks.json", templatePath: templateHooks },
        { relPath: ".claude/agents/bkit-test.md", templatePath: templateAgent },
      ],
      { nonInteractive: true, dryRun: false, cwd: tmpDir },
    );

    // Clean update applied
    expect(result.updated).toContain(".claude/agents/bkit-test.md");
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-test.md"), "utf-8")).toBe(
      newAgentContent,
    );

    // Conflicting file preserved
    expect(result.conflicts.map((c) => c.relPath)).toContain(".cursor/hooks.json");
    const fixtureContent = fs.readFileSync(path.join(FIXTURES_DIR, "cursor-hooks.json"), "utf-8");
    expect(fs.readFileSync(path.join(tmpDir, ".cursor", "hooks.json"), "utf-8")).toBe(
      fixtureContent,
    );
  });
});

// ---------------------------------------------------------------------------
// `bkit upgrade` does NOT force-create opt-in module files
//
// Updater configs are examples. Upgrade must not create them, and must not
// rewrite a copy the consumer already owns.
// ---------------------------------------------------------------------------

describe("issue #129 §5 — upgrade does not force-create opt-in module files", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runBkitUpgrade() {
    return spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--auto-apply"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
  }

  it("does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    // Minimal consumer: package.json + .bkit-version, no opt-in configs present.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    writeVersionFile();

    const result = runBkitUpgrade();

    // Opt-in files were never written (skipped at candidate collection).
    expect(fs.existsSync(path.join(tmpDir, ".github", "renovate.json5"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".github", "dependabot.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-set-dependabot.sh"))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(tmpDir, "scripts", "graphify", "bkit-graphify.sh"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".graphifyignore"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".serena", "project.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "docs", "capabilities.md"))).toBe(false);
    // Non-opt-in managed files DID get created — proving the walk ran (not a no-op).
    expect(fs.existsSync(path.join(tmpDir, ".gitignore"))).toBe(true);
    expect(result.status).toBe(0);
  });

  it("install --claude does not write Serena or graphify examples", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"));
    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--claude"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, "scripts", "graphify", "bkit-graphify.sh"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "scripts", "serena", "bkit-serena-mcp.sh"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".graphifyignore"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".serena", "project.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "docs", "capabilities.md"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "docs", "setup.md"))).toBe(true);
    expect(fs.readFileSync(path.join(tmpDir, "docs", "setup.md"), "utf-8")).toContain(
      ".bkit/templates.md",
    );
  });

  it("upgrade does not rewrite a consumer-owned bkit-graphify.sh", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    writeVersionFile();
    const owned = "#!/usr/bin/env bash\necho owned\n";
    fs.mkdirSync(path.join(tmpDir, "scripts", "graphify"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "scripts", "graphify", "bkit-graphify.sh"), owned, "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".serena"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".serena", "project.yml"), "project_name: owned\n", "utf-8");
    const result = runBkitUpgrade();
    expect(result.status).toBe(0);
    expect(
      fs.readFileSync(path.join(tmpDir, "scripts", "graphify", "bkit-graphify.sh"), "utf-8"),
    ).toBe(owned);
    expect(fs.readFileSync(path.join(tmpDir, ".serena", "project.yml"), "utf-8")).toBe(
      "project_name: owned\n",
    );
  });

  it("does not rewrite a consumer-owned .github/renovate.json5", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "consumer",
        bkit: { depUpdater: "renovate", renovateRunner: "self" },
      }),
      "utf-8",
    );
    writeVersionFile();
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    const owned = "{ stale: true }\n";
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), owned, "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-renovate.yml"),
      "name: Renovate\n",
      "utf-8",
    );

    runBkitUpgrade();

    expect(fs.readFileSync(path.join(tmpDir, ".github", "renovate.json5"), "utf-8")).toBe(owned);
    expect(
      fs.readFileSync(path.join(tmpDir, ".github", "workflows", "bkit-renovate.yml"), "utf-8"),
    ).toBe("name: Renovate\n");
  });

  it("preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6)", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    writeVersionFile();

    // docs/*.md have NO manifest entry — this proves the full CLI wiring
    // (collectTemplates → no format → content-detected block-merge) protects the
    // consumer's project prose written AFTER the end marker. End-to-end, not a unit stub.
    const consumerDoc =
      "<!-- bkit:start -->\n# Testing\n\n> stale bkit guidance to be replaced\n<!-- bkit:end -->\n\n" +
      "## Our project testing notes — MUST SURVIVE\n\n- Custom Vitest + Playwright suite.\n";
    fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "docs", "testing.md"), consumerDoc, "utf-8");

    runBkitUpgrade();

    const after = fs.readFileSync(path.join(tmpDir, "docs", "testing.md"), "utf-8");
    // Consumer prose after bkit:end is intact.
    expect(after).toContain("## Our project testing notes — MUST SURVIVE");
    expect(after).toContain("Custom Vitest + Playwright suite.");
    // bkit block was updated to the shipped template (not whole-file-overwritten).
    expect(after).not.toContain("stale bkit guidance to be replaced");
  });
});

// ---------------------------------------------------------------------------
// .mcp.json / .cursor/mcp.json — bkit owns only its tracker entry under `mcpServers`.
// Install and upgrade both reconcile that one entry (reconcileMcpJson); every other key
// is the consumer's.
// ---------------------------------------------------------------------------

describe("MCP config — install and upgrade own only bkit's tracker entry", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  function setup(): void {
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
  }

  it("present, unmodified .mcp.json + .cursor/mcp.json → same-version upgrade leaves them byte-identical", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    setup();
    expect(runCli(["install", "--claude", "--cursor", "--tracker=github"]).status).toBe(0);
    const mcpBefore = fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8");
    const cursorMcpBefore = fs.readFileSync(path.join(tmpDir, ".cursor", "mcp.json"), "utf-8");

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status).toBe(0);
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe(mcpBefore);
    expect(fs.readFileSync(path.join(tmpDir, ".cursor", "mcp.json"), "utf-8")).toBe(
      cursorMcpBefore,
    );
  });

  it("upgrade restores bkit's edited entry, keeps a consumer server, and check is then clean", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    setup();
    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
    const mcpPath = path.join(tmpDir, ".mcp.json");
    const installed = JSON.parse(fs.readFileSync(mcpPath, "utf-8")) as {
      mcpServers: Record<string, unknown>;
    };
    const bkitEntry = installed.mcpServers.github;
    const mine = { type: "stdio", command: "my-mcp" };
    fs.writeFileSync(
      mcpPath,
      JSON.stringify(
        { mcpServers: { mine, github: { type: "http", url: "https://edited.example/" } } },
        null,
        2,
      ) + "\n",
      "utf-8",
    );

    expect(runCli(["check"]).status).toBe(1); // bkit's entry differs → a write is pending

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
    const after = JSON.parse(fs.readFileSync(mcpPath, "utf-8")) as {
      mcpServers: Record<string, unknown>;
    };
    expect(after.mcpServers).toEqual({ mine, github: bkitEntry });
    expect(Object.keys(after.mcpServers)).toEqual(["mine", "github"]); // order kept

    const check = runCli(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  it("malformed .mcp.json fails install instead of being overwritten", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    setup();
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "{ not json", "utf-8");
    const install = runCli(["install", "--claude", "--tracker=github"]);
    expect(install.status).not.toBe(0);
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe("{ not json");
  });
});

// ---------------------------------------------------------------------------
// Install writes no template outside .bkit/templates/, upgrade never touches an
// adopted template copy, and refreshes only the managed block of .agents/context.md
// and .agents/skills.md
// ---------------------------------------------------------------------------

describe("#489 — install and upgrade leave the consumer's own files alone", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  // Every template the package ships, at the path a consumer would adopt it to.
  function templatePaths(): string[] {
    const root = getTemplatesRoot();
    return listFilesRecursive(root)
      .map((abs) => remapTemplateDest(path.relative(root, abs)))
      .sort();
  }

  it("an install with every host and cloud lane creates no template outside .bkit/templates/", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    const hosts = ["--claude", "--cursor", "--codex", "--opencode=openrouter"];
    // --auto=cursor needs the Linear tracker.
    for (const lane of ["--auto=claude", "--auto=cursor", "--auto=opencode"]) {
      const tracker = lane === "--auto=cursor" ? "--tracker=linear" : "--tracker=github";
      const install = runCli(["install", ...hosts, lane, tracker]);
      expect(install.status, `${lane}\n${install.stdout}\n${install.stderr}`).toBe(0);
    }

    const templates = templatePaths();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.filter((rel) => fs.existsSync(path.join(tmpDir, rel)))).toEqual([]);
    const copies = path.join(tmpDir, ".bkit", "templates");
    expect(listFilesRecursive(copies).length).toBe(templates.length);
  });

  it("an adopted copy of every template survives upgrade and check", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(runCli(["install", "--claude", "--cursor"]).status).toBe(0);

    const owned: Record<string, string> = {};
    for (const rel of templatePaths()) owned[rel] = `consumer's own ${rel}\n`;
    for (const [rel, content] of Object.entries(owned)) {
      fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, rel), content, "utf-8");
    }

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
    const check = runCli(["check"]);
    expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");

    for (const [rel, content] of Object.entries(owned)) {
      expect(fs.readFileSync(path.join(tmpDir, rel), "utf-8"), rel).toBe(content);
    }
  });

  it.each([
    [
      path.join(".agents", "context.md"),
      "\n\n## Enabled blocks\n\n<!-- context-fetch:start ours context=web -->\n```bash\necho ours\n```\n<!-- context-fetch:end -->\n",
    ],
    [
      path.join(".agents", "skills.md"),
      "\n\n## Project Skills\n\n| `ours/skills` | ours | ours |\n",
    ],
  ])(
    "check flags a stale %s block; upgrade refreshes it and keeps the consumer's content",
    (rel, consumer) => {
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
        "utf-8",
      );
      expect(runCli(["install", "--claude"]).status).toBe(0);
      const abs = path.join(tmpDir, rel);
      const fresh = fs.readFileSync(abs, "utf-8");
      const end = "<!-- bkit:end -->";
      // The block's own rules may quote the end marker, so the real one is the last.
      const endIdx = fresh.lastIndexOf(end);
      const managed = fresh.slice(0, endIdx + end.length);
      const stale = `${fresh.slice(0, endIdx)}stale rule\n${end}`;
      fs.writeFileSync(abs, stale + consumer, "utf-8");

      const flagged = runCli(["check"]);
      expect(flagged.status, `${flagged.stdout}\n${flagged.stderr}`).toBe(1);
      expect(`${flagged.stdout}\n${flagged.stderr}`).toContain(rel);

      const upgrade = runCli(["upgrade", "--auto-apply"]);
      expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
      expect(fs.readFileSync(abs, "utf-8")).toBe(managed + consumer);
      const check = runCli(["check"]);
      expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
    },
  );
});

// ---------------------------------------------------------------------------
// Every file bkit writes or refreshes carries the managed-version marker
//
// The inventory is what a real install writes: every file git would track after an
// install with every host and the claude cloud lane, minus JSON (no comment syntax) and
// the template copies (bkit never applies them). Gitignored generated files
// (`.claude/bkit-cloud.md`, `.bkit/advisories.md`) fall out with git's own ignore rules.
// ---------------------------------------------------------------------------

describe("#489 — managed-version marker on every file bkit writes", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    const r = spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 120_000,
    });
    return { status: r.status, out: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
  }

  function installEverything(): void {
    expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir }).status).toBe(0);
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    const hosts = ["--claude", "--cursor", "--codex", "--opencode=openrouter"];
    const install = runCli(["install", ...hosts, "--auto=claude", "--tracker=github"]);
    expect(install.status, install.out).toBe(0);
  }

  // JSON (an object or array document) has no comment syntax, so it carries no marker.
  const isJson = (text: string): boolean => /^\s*[{[]/.test(text);

  // Every non-JSON, non-template file the install left for git to track.
  function writtenFiles(): string[] {
    const r = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], {
      cwd: tmpDir,
      encoding: "utf-8",
    });
    return r.stdout
      .split("\n")
      .filter(Boolean)
      .map((rel) => path.normalize(rel))
      .filter((rel) => !rel.startsWith(path.join(".bkit", "templates") + path.sep))
      .filter((rel) => !isJson(fs.readFileSync(path.join(tmpDir, rel), "utf-8")))
      .sort();
  }

  // The first non-blank line inside the file's bkit block, or undefined without a block.
  function firstBlockLine(content: string): string | undefined {
    const style = detectMarkerStyle(content);
    if (style === null) return undefined;
    const start = findLineAnchoredMarkers(content, selectMarkers(style)[0])[0]!;
    return content
      .slice(content.indexOf("\n", start) + 1)
      .split("\n")
      .find((l) => l.trim() !== "");
  }

  it("every written file carries a marker at the installing version, and check derives the same set", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    installEverything();
    const version = readInstallingVersion();
    const written = writtenFiles();
    expect(written.length).toBeGreaterThan(0);

    const stamped = new Map(listStampedFiles(tmpDir).map((f) => [f.path, f.scope]));
    for (const rel of written) {
      const content = fs.readFileSync(path.join(tmpDir, rel), "utf-8");
      expect(readManagedVersion(content), rel).toBe(version);
      if (stamped.get(rel) === "block") {
        expect(readManagedVersion(firstBlockLine(content) ?? ""), `${rel} block line 1`).toBe(
          version,
        );
      }
    }
    expect(
      [...stamped.keys()].filter((rel) => fs.existsSync(path.join(tmpDir, rel))).sort(),
    ).toEqual(written);
  });

  it("check flags an old marker; upgrade restamps every marker with no conflict; check is then clean", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    installEverything();
    const version = readInstallingVersion();
    const written = writtenFiles();

    // Simulate an install made by an older bkit: every marker reads 4.0.0, and the
    // recorded hashes and pin are what that older bkit wrote.
    const versionFile = path.join(tmpDir, ".bkit", "version");
    const recorded = readBkitVersion(versionFile)!;
    for (const rel of written) {
      const abs = path.join(tmpDir, rel);
      const aged = fs
        .readFileSync(abs, "utf-8")
        .replaceAll(`bkit:managed v${version} `, "bkit:managed v4.0.0 ");
      fs.writeFileSync(abs, aged, "utf-8");
      if (rel in recorded.canonicalHashes) recorded.canonicalHashes[rel] = sha256(aged);
    }
    writeBkitVersion(versionFile, { ...recorded, pinnedVersion: "4.0.0" });

    const stale = runCli(["check"]);
    expect(stale.out).toContain("bkit-managed-stale");
    expect(stale.out).toContain(`${written.length} of ${written.length} bkit-managed file(s)`);
    expect(stale.out).toContain("(v4.0.0)");

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, upgrade.out).toBe(0);
    expect(upgrade.out).toContain("conflicts: 0");
    for (const rel of written) {
      expect(readManagedVersion(fs.readFileSync(path.join(tmpDir, rel), "utf-8")), rel).toBe(
        version,
      );
    }

    const check = runCli(["check"]);
    expect(check.out).toContain("0 write(s) would occur");
    expect(check.out).not.toContain("bkit-managed-stale");
  });
});

// ---------------------------------------------------------------------------
// Upgrade does not force-create uninstalled host/tooling modules
//
// claude/cursor/lint are each separately installable. The upgrade template walk is
// gated on sentinel-detected installation: a `--claude`-only consumer gets no
// cursor/lint files on upgrade.
// ---------------------------------------------------------------------------

describe("#255 — upgrade does not force-create uninstalled host/tooling modules", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  it("claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
    // claude files present; uninstalled-module sentinels absent after a claude-only install.
    expect(fs.existsSync(path.join(tmpDir, ".mcp.json"))).toBe(true);
    const uninstalledModuleFiles = [
      ".cursor/mcp.json",
      ".cursor/settings.json",
      ".github/workflows/bkit-ci.yml",
      ".vale.ini",
      ".husky/pre-commit",
      ".codex/hooks/bkit-readguard.cjs",
      ".opencode/plugin/bkit-readguard.js",
      ".agents/plugins/bkit/hooks/bkit-readguard.cjs",
    ];
    for (const f of uninstalledModuleFiles) {
      expect(fs.existsSync(path.join(tmpDir, f))).toBe(false);
    }

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status).toBe(0);

    // Upgrade did NOT force-create files for modules the consumer never installed.
    for (const f of uninstalledModuleFiles) {
      expect(fs.existsSync(path.join(tmpDir, f))).toBe(false);
    }
    // The walk still ran for installed modules + core (proves it isn't a blanket no-op).
    expect(fs.existsSync(path.join(tmpDir, ".gitignore"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".mcp.json"))).toBe(true);

    // No install↔upgrade divergence: check is clean after the upgrade.
    const check = runCli(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  it("upgrade creates a file a newer release adds to an installed opt-in host (#550)", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(
      runCli(["install", "--codex", "--antigravity", "--opencode=openrouter", "--tracker=github"])
        .status,
    ).toBe(0);
    // An older release's install: the host is there, the newer hook file is not.
    const added = [
      ".codex/hooks/bkit-readguard.cjs",
      ".opencode/plugin/bkit-readguard.js",
      ".agents/plugins/bkit/hooks/bkit-readguard.cjs",
    ];
    for (const f of added) fs.rmSync(path.join(tmpDir, f));
    expect(runCli(["check"]).status).toBe(1);

    expect(runCli(["upgrade", "--auto-apply"]).status).toBe(0);

    for (const f of added) {
      expect(fs.readFileSync(path.join(tmpDir, f), "utf-8")).toContain("bkit ReadGuard");
    }
    const check = runCli(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  it("upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file)", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(runCli(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
    const hooksJson = path.join(tmpDir, ".agents/plugins/bkit/hooks.json");
    fs.copyFileSync(
      path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "../../../../../tests/fixtures/antigravity-5.1.0/hooks.json",
      ),
      hooksJson,
    );

    expect(runCli(["upgrade", "--auto-apply"]).status).toBe(0);

    const groups = (
      JSON.parse(fs.readFileSync(hooksJson, "utf-8")) as {
        hooks: { PreToolUse: { matcher: string; hooks: { command: string }[] }[] };
      }
    ).hooks.PreToolUse;
    const guardrails = groups.filter((g) => g.hooks.some((h) => h.command.includes("guardrails")));
    expect(guardrails.map((g) => g.matcher)).toEqual(["view_file|run_command"]);
    expect(runCli(["check"]).status).toBe(0);
  });

  it("upgrade seeds missing bkit:gate:* names, so check stays clean (#489)", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const pkgPath = path.join(tmpDir, "package.json");
    fs.writeFileSync(
      pkgPath,
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(runCli(["install", "--claude"]).status).toBe(0);

    // A consumer missing the gate names, with one custom gate of its own.
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      scripts: Record<string, string>;
    };
    pkg.scripts = { "bkit:gate:static": "ruff check ." };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);

    const scripts = (
      JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { scripts: Record<string, string> }
    ).scripts;
    expect(scripts["bkit:gate:static"]).toBe("ruff check .");
    expect(scripts["bkit:gate:static-unit"]).toBe("pnpm bkit:gate:static && pnpm test");
    expect(scripts["bkit:deps:audit"]).toBe("pnpm audit");
    expect(scripts["slop:delta"]).toBeUndefined();
    expect(scripts.typecheck).toBeUndefined();

    const check = runCli(["check"]);
    expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });
});

// ---------------------------------------------------------------------------
// Upgrade re-renders ALL installed provider blocks into opencode.json
//
// When multiple providers are installed (e.g. openrouter + ollama), `bkit upgrade`
// re-renders and reconverges EVERY provider's block into opencode.json — not just the
// active one.
// ---------------------------------------------------------------------------

describe("#281 Task 3 — upgrade re-renders all installed provider blocks", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  it("upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary)", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    // Install first provider (ollama) — becomes initial active
    expect(runCli(["install", "--opencode=ollama", "--tracker=github"]).status).toBe(0);

    // Install second provider (openrouter) — becomes the active provider (last installed)
    expect(runCli(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const opencodePath = path.join(tmpDir, ".opencode", "opencode.json");
    expect(fs.existsSync(opencodePath)).toBe(true);

    // Both provider blocks must be present after install
    const afterInstall = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, unknown>;
    };
    expect(afterInstall.provider!["openrouter"]).toBeDefined();
    expect(afterInstall.provider!["ollama"]).toBeDefined();

    // Simulate template drift for the NON-active (ollama) block:
    // remove its `npm` field so we can verify upgrade reconverges it.
    const drifted = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, Record<string, unknown>>;
    };
    delete drifted.provider!["ollama"]!["npm"];
    fs.writeFileSync(opencodePath, JSON.stringify(drifted, null, 2) + "\n", "utf-8");

    // Confirm the npm field is gone before upgrade
    const withDrift = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, Record<string, unknown>>;
    };
    expect(withDrift.provider!["ollama"]!["npm"]).toBeUndefined();

    // Run upgrade — Task 3 should reconverge the ollama block
    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status).toBe(0);

    // After upgrade: the ollama block must have its `npm` field restored (re-rendered)
    const afterUpgrade = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, Record<string, unknown>>;
    };
    expect(afterUpgrade.provider).toBeDefined();
    expect(afterUpgrade.provider!["openrouter"]).toBeDefined();
    expect(afterUpgrade.provider!["ollama"]).toBeDefined();

    // The reconverged ollama block must carry the template-rendered `npm` field
    expect(afterUpgrade.provider!["ollama"]!["npm"]).toBe("@ai-sdk/openai-compatible");

    // The openrouter (active) block must also be intact (handled by the candidates walk)
    expect(afterUpgrade.provider!["openrouter"]!["npm"]).toBe("@ai-sdk/openai-compatible");
  });
});

// ---------------------------------------------------------------------------
// `bkit check` exits 0 (no drift) with multiple providers installed; dry-run parity holds.
// ---------------------------------------------------------------------------

describe("#281 AC — bkit check exits 0 with multiple providers installed", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  it("bkit check exits 0 after installing two providers (openrouter + ollama)", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    // Install both providers
    expect(runCli(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);
    expect(runCli(["install", "--opencode=opencode-go", "--tracker=github"]).status).toBe(0);

    // `bkit check --opencode` must exit 0 (no drift) — both provider blocks are already present
    const check = runCli(["check"]);
    expect(check.status, `bkit check failed:\n${check.stdout}\n${check.stderr}`).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// gateguard.cjs/gateguard.js markered-text upgrade round-trip: detectMarkerStyle
// (install/write.ts) recognises the slash-comment marker style. A real install, then a
// real upgrade.
// ---------------------------------------------------------------------------

describe("#422 — gateguard markered-text upgrade round-trip (site-9 regression)", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../cli.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../../../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  it("install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    const install = runCli(["install", "--claude", "--opencode=opencode-go", "--tracker=github"]);
    expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);

    const cjsPath = path.join(tmpDir, ".claude", "hooks", "bkit-gateguard.cjs");
    const jsPath = path.join(tmpDir, ".opencode", "plugin", "bkit-gateguard.js");
    const cjsOriginal = fs.readFileSync(cjsPath, "utf-8");
    const jsOriginal = fs.readFileSync(jsPath, "utf-8");
    expect(cjsOriginal).toContain("// bkit:start");
    expect(jsOriginal).toContain("// bkit:start");

    // Tamper OUTSIDE the block (consumer's own driver code — must survive) AND STALE
    // the INSIDE-block content (must be refreshed back to the shipped template on
    // upgrade). Block-merge is unconditional; the refreshed inside-block content shows
    // `detectMarkerStyle` read the `// bkit:start` template.
    const cjsTampered = cjsOriginal
      .replace(
        /function isGateConfig/,
        "function staleMarkerRegressionProbe() {}\nfunction isGateConfig",
      )
      .concat("\n// consumer's own extra driver logic\n");
    fs.writeFileSync(cjsPath, cjsTampered, "utf-8");
    const jsTampered = jsOriginal
      .replace(
        /function isGateConfig/,
        "function staleMarkerRegressionProbe() {}\nfunction isGateConfig",
      )
      .concat("\n// consumer's own extra driver logic\n");
    fs.writeFileSync(jsPath, jsTampered, "utf-8");

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, `upgrade failed:\n${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);

    const cjsAfter = fs.readFileSync(cjsPath, "utf-8");
    const jsAfter = fs.readFileSync(jsPath, "utf-8");
    // Outside-block tamper survived.
    expect(cjsAfter).toContain("// consumer's own extra driver logic");
    expect(jsAfter).toContain("// consumer's own extra driver logic");
    // Inside-block stale probe was refreshed away — proves the block round-tripped
    // through a real write, not a silent site-9 no-op.
    expect(cjsAfter).not.toContain("staleMarkerRegressionProbe");
    expect(jsAfter).not.toContain("staleMarkerRegressionProbe");
    expect(cjsAfter).toContain("// bkit:start");
    expect(cjsAfter).toContain("// bkit:end");
    expect(jsAfter).toContain("// bkit:start");
    expect(jsAfter).toContain("// bkit:end");

    const check = runCli(["check"]);
    expect(check.status, `check failed:\n${check.stdout}\n${check.stderr}`).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// upgrade-preservation
// ---------------------------------------------------------------------------
// upgrade-preservation
//
// `bkit upgrade` routes markered-text / json files through the SAME tier-aware writers
// the install path uses: markered-text → block-merge (writeTier2), json → deep-merge
// (writeTier2JsonContained). Consumer content outside the managed region (e.g.
// secret-protection rules in `.gitignore`, `mcpServers` in `.claude/settings.json`)
// survives an upgrade, while the bkit block is updated to the new template.
describe("upgrade-preservation", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-preserve-"));
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeAbs(rel: string, content: string): string {
    const abs = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
    return abs;
  }

  function writeTemplate(name: string, content: string): string {
    const abs = path.join(tmpDir, ".templates", name);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
    return abs;
  }

  function seedVersion(canonicalHashes: Record<string, string> = {}): void {
    const v: BkitVersion = { pinnedVersion: "2.4.0", canonicalHashes, claudeAllowDerived: [] };
    writeBkitVersion(path.join(tmpDir, ".bkit", "version"), v);
  }

  function upgrade(candidates: UpgradeCandidate[]) {
    return runUpgrade(candidates, { nonInteractive: true, dryRun: false, cwd: tmpDir });
  }

  // ---------------------------------------------------------------------------
  // markered-text — consumer content OUTSIDE the block must never be clobbered
  // ---------------------------------------------------------------------------

  describe("upgrade preserves consumer content outside the bkit block (markered-text)", () => {
    it(".gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)", () => {
      // Consumer installed cleanly under 2.4.0 then never hand-edited the file, so its
      // on-disk content equals the recorded canonical hash.
      const consumer =
        "# Consumer secrets — MUST survive\n" +
        ".env*.local\n" +
        "service-account-*.json\n" +
        "*.csv\n" +
        "\n" +
        "# <!-- bkit:start -->\n" +
        "node_modules/\n" +
        "STALE-bkit-entry/\n" +
        "# <!-- bkit:end -->\n";
      writeAbs(".gitignore", consumer);
      seedVersion({ ".gitignore": sha256(consumer) });

      const templatePath = writeTemplate(
        "gitignore",
        "# <!-- bkit:start -->\nnode_modules/\n.bkit/advisories.md\n# <!-- bkit:end -->\n",
      );

      const result = upgrade([{ relPath: ".gitignore", templatePath, format: "markered-text" }]);

      const after = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
      // Consumer content outside the block is intact.
      expect(after).toContain("service-account-*.json");
      expect(after).toContain(".env*.local");
      expect(after).toContain("*.csv");
      // bkit block updated to the new template content.
      expect(after).toContain(".bkit/advisories.md");
      expect(after).not.toContain("STALE-bkit-entry/");
      // Classified as an applied update, never a conflict/skip.
      expect(result.updated).toContain(".gitignore");
      expect(result.conflicts).toHaveLength(0);
    });

    it(".gitattributes — consumer custom attributes outside the block survive", () => {
      const consumer =
        "# Consumer attrs — MUST survive\n*.png binary\n*.lockb -diff\n\n# <!-- bkit:start -->\ndocs/pending.md merge=union\n# <!-- bkit:end -->\n";
      writeAbs(".gitattributes", consumer);
      seedVersion({ ".gitattributes": sha256(consumer) });

      const templatePath = writeTemplate(
        ".gitattributes",
        "# <!-- bkit:start -->\ndocs/pending.md     merge=union\ndocs/knowledge.md   merge=union\n# <!-- bkit:end -->\n",
      );

      upgrade([{ relPath: ".gitattributes", templatePath, format: "markered-text" }]);

      const after = fs.readFileSync(path.join(tmpDir, ".gitattributes"), "utf-8");
      expect(after).toContain("*.png binary");
      expect(after).toContain("*.lockb -diff");
      expect(after).toContain("docs/knowledge.md"); // new block content applied
    });

    it("docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)", () => {
      // docs/*.md are markered but managed as a directory, so they have NO manifest
      // `format`; the consumer's project prose lives after `bkit:end`. `format` is OMITTED
      // here — block-merge kicks in from the template's markers alone.
      const consumer =
        "<!-- bkit:start -->\n# Testing\n\n> bkit canonical guidance (OLD).\n<!-- bkit:end -->\n\n" +
        "## Our project testing notes — MUST survive\n\n" +
        "- We use Vitest + Playwright against a seeded Supabase branch.\n" +
        "- Nightly smoke suite tagged @smoke.\n";
      writeAbs("docs/testing.md", consumer);
      seedVersion({ "docs/testing.md": sha256(consumer) });

      const templatePath = writeTemplate(
        "testing.md",
        "<!-- bkit:start -->\n# Testing\n\n> bkit canonical guidance (NEW — slimmed).\n<!-- bkit:end -->\n",
      );

      const result = upgrade([{ relPath: "docs/testing.md", templatePath }]); // no format

      const after = fs.readFileSync(path.join(tmpDir, "docs/testing.md"), "utf-8");
      // Consumer prose after the end marker is intact.
      expect(after).toContain("## Our project testing notes — MUST survive");
      expect(after).toContain("seeded Supabase branch");
      expect(after).toContain("@smoke");
      // bkit block updated to the new (slimmed) guidance.
      expect(after).toContain("NEW — slimmed");
      expect(after).not.toContain("OLD");
      // Treated as a block-merge, never a whole-file conflict/overwrite.
      expect(result.conflicts).toHaveLength(0);
      expect(result.updated).toContain("docs/testing.md");
    });

    it("dest has NO bkit markers — block is appended at EOF, all consumer content preserved", () => {
      const consumer = "# Pre-existing consumer file, no bkit block\nlogs/\n.env\n";
      writeAbs(".gitignore", consumer);
      seedVersion();

      const templatePath = writeTemplate(
        "gitignore",
        "# <!-- bkit:start -->\nnode_modules/\n# <!-- bkit:end -->\n",
      );

      upgrade([{ relPath: ".gitignore", templatePath, format: "markered-text" }]);

      const after = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
      expect(after.startsWith(consumer)).toBe(true); // every original byte kept
      expect(after).toContain("<!-- bkit:start -->");
      expect(after).toContain("node_modules/");
    });
  });

  // ---------------------------------------------------------------------------
  // json — consumer-owned keys must survive the deep-merge
  // ---------------------------------------------------------------------------

  describe("upgrade preserves consumer keys (json deep-merge)", () => {
    it(".claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)", () => {
      const consumer = JSON.stringify(
        {
          mcpServers: { linear: { command: "npx", args: ["-y", "linear-mcp"] } },
          permissions: { allow: ["Read"] },
        },
        null,
        2,
      );
      writeAbs(".claude/settings.json", consumer + "\n");
      seedVersion({ ".claude/settings.json": sha256(consumer + "\n") });

      const templatePath = writeTemplate(
        "settings.json",
        JSON.stringify({ permissions: { allow: ["Bash"] }, bkitManaged: true }, null, 2) + "\n",
      );

      upgrade([{ relPath: ".claude/settings.json", templatePath, format: "json" }]);

      const after = JSON.parse(
        fs.readFileSync(path.join(tmpDir, ".claude/settings.json"), "utf-8"),
      );
      // The consumer's Linear MCP server definition is NOT dropped.
      expect(after.mcpServers?.linear?.command).toBe("npx");
      // bkit-managed key merged in.
      expect(after.bkitManaged).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // canonical hash + idempotency — the merged on-disk content is recorded, so a
  // second upgrade is a clean skip (never re-clobbers, never re-flags as drift).
  // ---------------------------------------------------------------------------

  describe("upgrade is idempotent for block-merge formats", () => {
    it("records the merged on-disk hash and skips on the second run", () => {
      const consumer =
        "# Consumer — keep\n*.csv\n\n# <!-- bkit:start -->\nnode_modules/\n# <!-- bkit:end -->\n";
      writeAbs(".gitignore", consumer);
      seedVersion({ ".gitignore": sha256(consumer) });

      const templatePath = writeTemplate(
        "gitignore",
        "# <!-- bkit:start -->\nnode_modules/\n.bkit/advisories.md\n# <!-- bkit:end -->\n",
      );
      const candidate: UpgradeCandidate = {
        relPath: ".gitignore",
        templatePath,
        format: "markered-text",
      };

      const first = upgrade([candidate]);
      expect(first.updated).toContain(".gitignore");
      updateCanonicalHashesAfterUpgrade(first, { dryRun: false, cwd: tmpDir });

      const merged = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
      const recorded = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
      // Hash recorded is of the MERGED disk content, not the template.
      expect(recorded!.canonicalHashes[".gitignore"]).toBe(sha256(merged));

      // Second run: block already current → no write, classified skipped, file untouched.
      const second = upgrade([candidate]);
      expect(second.updated).not.toContain(".gitignore");
      expect(second.skipped).toContain(".gitignore");
      expect(fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8")).toBe(merged);
    });
  });

  // ---------------------------------------------------------------------------
  // whole-file (byte-equal) owned files — bkit owns them end-to-end
  // ---------------------------------------------------------------------------

  describe("upgrade of an owned whole-file candidate", () => {
    const REL = ".bkit/owned/bkit-owned.sh";

    it("auto-updates when there is no consumer drift", () => {
      const old = "script v1\n";
      writeAbs(REL, old);
      seedVersion({ [REL]: sha256(old) }); // current == canonical
      const templatePath = writeTemplate("bkit-owned.sh", "script v2\n");

      const result = upgrade([{ relPath: REL, templatePath, format: "byte-equal-text" }]);

      expect(result.updated).toContain(REL);
      expect(fs.readFileSync(path.join(tmpDir, REL), "utf-8")).toBe("script v2\n");
    });

    it("honors contentOverride — writes rendered content, never the raw template", () => {
      const old = "rendered v1\n";
      writeAbs(REL, old);
      seedVersion({ [REL]: sha256(old) });
      const templatePath = writeTemplate("bkit-owned.sh", "@@SENTINEL@@\nraw v2\n");

      const result = upgrade([
        {
          relPath: REL,
          templatePath,
          format: "byte-equal-text",
          contentOverride: "rendered v2\n",
        },
      ]);

      expect(result.updated).toContain(REL);
      const written = fs.readFileSync(path.join(tmpDir, REL), "utf-8");
      expect(written).toBe("rendered v2\n");
      expect(written).not.toContain("@@SENTINEL@@"); // raw template never written
    });
  });

  // ---------------------------------------------------------------------------
  // token substitution on upgrade — upgrade substitutes {{TOKENS}} like install
  // (writeTier1), never writing the literal placeholder.
  // ---------------------------------------------------------------------------

  describe("upgrade substitutes template tokens (#129 §2)", () => {
    it("seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal", () => {
      seedVersion();
      const templatePath = writeTemplate(
        "bkit-owned.sh",
        "#!/usr/bin/env sh\n# guard: dev|{{DEFAULT_BRANCH}}\npnpm lint-staged\n",
      );

      const result = runUpgrade(
        [
          {
            relPath: ".bkit/owned/bkit-owned.sh",
            templatePath,
            format: "byte-equal-text",
          },
        ],
        {
          nonInteractive: true,
          dryRun: false,
          cwd: tmpDir,
          tokens: {
            DEFAULT_BRANCH: "main",
            PROJECT_NAME: "x",
            REPO_SLUG: "acme/x",
          },
        },
      );

      const after = fs.readFileSync(path.join(tmpDir, ".bkit/owned/bkit-owned.sh"), "utf-8");
      expect(after).toContain("dev|main");
      expect(after).not.toContain("{{DEFAULT_BRANCH}}");
      expect(result.updated).toContain(".bkit/owned/bkit-owned.sh"); // written (new)
    });
  });
});

// ---------------------------------------------------------------------------
// upgrade-render
// ---------------------------------------------------------------------------
// upgrade-render
//
// `bkit upgrade` re-renders the bkit-managed OUTPUT files that the template walk
// (runUpgrade over .bkit/templates/) does NOT cover: host agents/commands (source-rendered
// from .bkit/prompts + .bkit/workflows) and the `.bkit/*.md` canonical docs (runBkitDocs).
//
// Strategy (in-test dogfood): spawn the real install + upgrade binaries against a tmpdir
// consumer. getPkgRoot resolves to THIS repo, so install renders the real sources into the
// tmpdir. We then tamper rendered outputs + the prompts.md managed block + add a consumer
// override row, run `upgrade`, and assert: agents/docs restored, managed block refreshed,
// consumer override preserved (markered block-merge survives upgrade).
describe("upgrade-render", () => {
  let tmpDir: string;
  let originalCwd: string;

  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
  const getTsxBin = () =>
    path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );

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
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

      // --- Install: core + claude + opencode host (gives .claude/agents, .opencode/agents,
      //     .claude/commands, .opencode/commands, and the .bkit/*.md docs). ---
      const install = runBkit(["install", "--claude", "--opencode=openrouter"]);
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
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

      // Install the opencode host (openrouter) — opencode.json is templated with @@OPENCODE_*@@
      // sentinels that renderOpencodeJson resolves on install.
      const install = runBkit(["install", "--opencode=openrouter"]);
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

      // Upgrade renders opencode.json the SAME way install does (contentOverride): no literal
      // @@OPENCODE_*@@ sentinel keys.
      const upgrade = runBkit(["upgrade", "--auto-apply"]);
      expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\]/);

      const after = fs.readFileSync(opencodeJsonPath, "utf-8");
      expect(after, "upgrade must not leak raw @@…@@ sentinels into opencode.json").not.toContain(
        "@@",
      );
      const parsed = JSON.parse(after) as { provider?: Record<string, unknown>; theme?: string };
      // Provider block intact (openrouter), consumer key preserved by the deep-merge.
      expect(parsed.provider?.openrouter).toBeDefined();
      expect(parsed.theme).toBe("consumer-custom-theme");
    }, 180_000);

    it("opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback)", () => {
      const tsxBin = getTsxBin();
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

      type OpencodeDoc = {
        provider?: Record<string, { npm?: string; options?: Record<string, unknown> }>;
      };

      // Install the opencode host as the OpenCode Go built-in (apiKey only).
      const install = runBkit(["install", "--opencode=opencode-go"]);
      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);

      // (1) opencode.json has a built-in `opencode-go` block — options.apiKey only (no npm/baseURL).
      const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
      expect(fs.existsSync(opencodeJsonPath)).toBe(true);
      const installed = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
      expect(
        installed.provider?.["opencode-go"],
        "opencode-go gateway seeds an `opencode-go` provider block",
      ).toBeDefined();
      expect(installed.provider?.["opencode-go"]?.npm).toBeUndefined();
      expect(installed.provider?.["opencode-go"]?.options?.baseURL).toBeUndefined();
      expect(installed.provider?.["opencode-go"]?.options?.apiKey).toBe(
        "{env:BKIT_OPENCODE_API_KEY}",
      );

      // (2) The provider is recorded in the manifest — the authoritative upgrade-time detection signal.
      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
        bkit?: { opencodeProvider?: string };
      };
      expect(pkg.bkit?.opencodeProvider).toBe("opencode-go");

      // (3) Agents seeded with the opencode-go prefix (opencode-go/…).
      const agentsDir = path.join(tmpDir, ".opencode", "agents");
      const anAgent = fs.readdirSync(agentsDir).find((f) => f.endsWith(".md"));
      expect(anAgent).toBeTruthy();
      const agentBody = fs.readFileSync(path.join(agentsDir, anAgent!), "utf-8");
      expect(agentBody).toMatch(/model:\s*opencode-go\//);

      // (4) Upgrade must re-render opencode.json from the manifest provider — keeping the
      //     `opencode-go` block, NOT falling back to ollama.
      const upgrade = runBkit(["upgrade", "--auto-apply"]);
      expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\]/);
      const after = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
      expect(after.provider?.["opencode-go"]?.options?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
      expect(after.provider?.["opencode-go"]?.npm).toBeUndefined();
      expect(
        after.provider?.["ollama"],
        "upgrade must NOT re-render opencode-go as ollama",
      ).toBeUndefined();
    }, 180_000);
  });

  describe("#459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file", () => {
    it("a no-op upgrade does not re-record a hand-edited canonical file as bkit's content", () => {
      const tsxBin = getTsxBin();
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

      const install = runBkit(["install", "--claude"]);
      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);

      // Whole-file managed (Tier 1, no markers) → drift-detected via diffFile.
      const rel = ".bkit/.env.example";
      const abs = path.join(tmpDir, rel);
      const versionPath = path.join(tmpDir, ".bkit", "version");
      const recordedHash = (): string | undefined =>
        (
          JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
            canonicalHashes: Record<string, string>;
          }
        ).canonicalHashes[rel];

      const before = recordedHash();
      expect(before, `install must record a hash for ${rel}`).toBeTruthy();

      fs.appendFileSync(abs, "// consumer edit\n", "utf-8");

      // The CLI rebuilds the result it hands to the hash refresh — this exercises that seam.
      const upgrade = runBkit(["upgrade"]);
      expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\] Done\./);

      expect(fs.readFileSync(abs, "utf-8")).toContain("// consumer edit");
      expect(recordedHash(), "upgrade must not re-record the consumer's content").toBe(before);
    }, 180_000);

    it("re-records the hash of .cursor/allowlist.json when upgrade regenerates it, so uninstall still deletes it", () => {
      const tsxBin = getTsxBin();
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
      expect(runBkit(["install", "--cursor"]).status).toBe(0);

      const rel = path.join(".cursor", "allowlist.json");
      const abs = path.join(tmpDir, rel);
      const versionPath = path.join(tmpDir, ".bkit", "version");
      const recordedHash = (): string | undefined =>
        (
          JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
            canonicalHashes: Record<string, string>;
          }
        ).canonicalHashes[rel];
      expect(recordedHash()).toBe(sha256(fs.readFileSync(abs, "utf-8")));

      fs.appendFileSync(
        path.join(tmpDir, ".agents", "context.md"),
        "\n<!-- allowed-domains:start -->\nexample.com\n<!-- allowed-domains:end -->\n",
      );
      expect(runBkit(["upgrade"]).status).toBe(0);
      expect(fs.readFileSync(abs, "utf-8")).toContain("example.com");
      expect(recordedHash()).toBe(sha256(fs.readFileSync(abs, "utf-8")));

      expect(runBkit(["uninstall"]).status).toBe(0);
      expect(fs.existsSync(abs)).toBe(false);
    }, 180_000);
  });

  describe("advisories — check and upgrade report what install reports", () => {
    it("surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md", () => {
      const tsxBin = getTsxBin();
      expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
      const advisoriesPath = path.join(tmpDir, ".bkit", "advisories.md");

      const install = runBkit(["install", "--claude"]);
      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
      expect(fs.readFileSync(advisoriesPath, "utf-8")).toContain("test-file-script-missing");

      const check = runBkit(["check"]);
      expect(`${check.stdout}\n${check.stderr}`).toContain("test-file-script-missing");
      expect(fs.readFileSync(advisoriesPath, "utf-8")).toContain("test-file-script-missing");

      fs.writeFileSync(advisoriesPath, "STALE-ADVISORIES\n", "utf-8");
      const upgrade = runBkit(["upgrade"]);
      const upgradeCombined = `${upgrade.stdout}\n${upgrade.stderr}`;
      expect(upgrade.status, upgradeCombined).toBe(0);
      expect(upgradeCombined).toContain("test-file-script-missing");
      const after = fs.readFileSync(advisoriesPath, "utf-8");
      expect(after).not.toContain("STALE-ADVISORIES");
      expect(after).toContain("_Mode: upgrade_");
      expect(after).toContain("test-file-script-missing");
    }, 180_000);

    it("a dry-run upgrade leaves .bkit/advisories.md alone", () => {
      const advisoriesPath = path.join(tmpDir, ".bkit", "advisories.md");
      runBkit(["install", "--claude"]);
      fs.writeFileSync(advisoriesPath, "STALE-ADVISORIES\n", "utf-8");
      const upgrade = runBkit(["upgrade", "--dry-run"]);
      expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
      expect(fs.readFileSync(advisoriesPath, "utf-8")).toBe("STALE-ADVISORIES\n");
    }, 180_000);
  });
});

// ---------------------------------------------------------------------------
// Scenario: `bkit upgrade --to=<v>` atomic self-bump (#1) — dry-run preview
// A dry-run bump reports the plan and exits 0 WITHOUT shelling out to pnpm or
// re-rendering (runSelfBump returns before any IO), so this stays offline.
// ---------------------------------------------------------------------------

describe("Scenario: bkit upgrade --to self-bump dry-run (#1)", () => {
  it("previews the bump (pnpm add + re-render) and exits 0 without mutating", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "../../cli.ts");
    const tsxBin = path.resolve(dir, "../../../../../node_modules/.bin/tsx");
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    // Target a version far above the installed one so it's always a "bump", never a noop.
    const result = spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--to=99.0.0", "--dry-run"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined, combined).toContain("[dry-run] would bump @cbartens/bkit");
    expect(combined).toContain("99.0.0");
    expect(combined).toContain("pnpm add -D @cbartens/bkit@99.0.0");
    expect(result.status, `expected exit 0, got ${result.status}:\n${combined}`).toBe(0);
    // Dry-run must not have touched the consumer's package.json.
    const pkg = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    expect(pkg).not.toContain("99.0.0");
  });

  // In a pnpm workspace root, `pnpm add` refuses without -w (ERR_PNPM_ADDING_TO_ROOT),
  // so the self-bump passes -w. A pnpm-workspace.yaml at cwd is the workspace signal.
  it("passes -w when the consumer is a pnpm workspace root", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    fs.writeFileSync(path.join(tmpDir, "pnpm-workspace.yaml"), "packages:\n  - 'apps/*'\n");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "../../cli.ts");
    const tsxBin = path.resolve(dir, "../../../../../node_modules/.bin/tsx");
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--to=99.0.0", "--dry-run"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined, combined).toContain("pnpm add -D -w @cbartens/bkit@99.0.0");
    expect(result.status, `expected exit 0, got ${result.status}:\n${combined}`).toBe(0);
  });

  // The self-bump starts PACKAGE_RUNNER twice: `add -D ...` to install the target, then
  // `exec bkit upgrade` to re-render with the new binary. A stub on PATH records both.
  it("starts the package runner for the install and the re-exec", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-runner-"));
    const stubLog = path.join(stubDir, "calls.log");
    const stub = path.join(stubDir, PACKAGE_RUNNER);
    fs.writeFileSync(stub, `#!/bin/sh\necho "$*" >> "${stubLog}"\nexit 0\n`);
    fs.chmodSync(stub, 0o755);

    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "../../cli.ts");
    const tsxBin = path.resolve(dir, "../../../../../node_modules/.bin/tsx");
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    try {
      const result = spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--to=99.0.0"], {
        cwd: tmpDir,
        encoding: "utf-8",
        env: {
          ...process.env,
          NODE_NO_WARNINGS: "1",
          PATH: `${stubDir}${path.delimiter}${process.env.PATH ?? ""}`,
        },
        timeout: 60_000,
      });
      const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
      expect(result.status, `expected exit 0, got ${result.status}:\n${combined}`).toBe(0);
      expect(fs.readFileSync(stubLog, "utf-8").trim().split("\n")).toEqual([
        "add -D @cbartens/bkit@99.0.0",
        "exec bkit upgrade",
      ]);
    } finally {
      fs.rmSync(stubDir, { recursive: true, force: true });
    }
  });

  it("rejects --to=<version> with --latest (mutually exclusive) at exit 1", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }));
    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "../../cli.ts");
    const tsxBin = path.resolve(dir, "../../../../../node_modules/.bin/tsx");
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "upgrade", "--to=4.2.0", "--latest", "--dry-run"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined, combined).toContain("mutually exclusive");
    expect(result.status).toBe(1);
  });
});
