// bkit-upgrade.integration.test.ts — Integration test: 0.4.x → 0.5.x customised hooks scenario.
//
// Tests: Derived Test Matrix row
//   "Upgrade integration (customised hooks scenario)" (P4.T7)
//
// Fixture: tests/fixtures/heavy-customised-consumer/ (committed in sub-plan-2 P2.T8a)
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
import { runUpgrade } from "./bkit-upgrade";
import { sha256, writeBkitVersion, readBkitVersion, type BkitVersion } from "./bkit-version";

let tmpDir: string;
let originalCwd: string;

const FIXTURES_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../tests/fixtures/heavy-customised-consumer",
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

function seedFixture(): void {
  // Copy fixture files into tmpDir
  const files = fs.readdirSync(FIXTURES_DIR);
  for (const file of files) {
    const src = path.join(FIXTURES_DIR, file);
    const dst = path.join(tmpDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dst);
    }
  }
}

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

    // The fixture hooks.json has consumer additions (failClosed, loop_limit)
    const fixtureContent = fs.readFileSync(path.join(FIXTURES_DIR, "cursor-hooks.json"), "utf-8");

    // Simulate what bkit@0.4.x would have written as the canonical content:
    // A minimal hooks.json with just SessionStart (no consumer additions)
    const bkit04CanonicalContent =
      JSON.stringify(
        {
          hooks: {
            SessionStart: [
              {
                matcher: "",
                hooks: [{ type: "command", command: ".cursor/hooks/preflight.sh" }],
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
                hooks: [{ type: "command", command: ".cursor/hooks/preflight.sh" }],
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
// Issue #129 §5 — `bkit upgrade` must NOT force-create opt-in module files
//
// Updater configs are examples. Upgrade must not create them, and must not
// rewrite a copy the consumer already owns.
// ---------------------------------------------------------------------------

describe("issue #129 §5 — upgrade does not force-create opt-in module files", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
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
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
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

  it("install --typescript does not write Serena or graphify examples", () => {
    if (!fs.existsSync(tsxBin)) return;
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"));
    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--typescript"], {
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
    if (!fs.existsSync(tsxBin)) return;
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
    if (!fs.existsSync(tsxBin)) return;
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
      path.join(tmpDir, ".github", "workflows", "renovate.yml"),
      "name: Renovate\n",
      "utf-8",
    );

    runBkitUpgrade();

    expect(fs.readFileSync(path.join(tmpDir, ".github", "renovate.json5"), "utf-8")).toBe(owned);
    expect(
      fs.readFileSync(path.join(tmpDir, ".github", "workflows", "renovate.yml"), "utf-8"),
    ).toBe("name: Renovate\n");
  });

  it("preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6)", () => {
    if (!fs.existsSync(tsxBin)) return;
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
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
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
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
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
    if (!fs.existsSync(tsxBin)) return;
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
    if (!fs.existsSync(tsxBin)) return;
    setup();
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "{ not json", "utf-8");
    const install = runCli(["install", "--claude", "--tracker=github"]);
    expect(install.status).not.toBe(0);
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe("{ not json");
  });
});

// ---------------------------------------------------------------------------
// #489 — upgrade never touches an adopted template copy or a create-if-missing file, and
// refreshes only the managed block of .agents/context.md
// ---------------------------------------------------------------------------

describe("#489 — upgrade leaves the consumer's own files byte-identical", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
  );

  function runCli(args: string[]) {
    return spawnSync(tsxBin, [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 90_000,
    });
  }

  it("adopted ci.yml, .husky/pre-push, .envrc and an edited .agents/skills.md survive upgrade and check", () => {
    if (!fs.existsSync(tsxBin)) return;
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(runCli(["install", "--claude", "--typescript"]).status).toBe(0);
    // skills.md was written once by install.
    expect(fs.existsSync(path.join(tmpDir, ".agents", "skills.md"))).toBe(true);

    const owned: Record<string, string> = {
      [path.join(".github", "workflows", "ci.yml")]: "name: my ci\non: push\n",
      [path.join(".husky", "pre-push")]: "#!/bin/sh\npnpm test\n",
      // A pre-.bkit/ directive an older bkit wrote: it is the consumer's line.
      ".envrc": "dotenv_if_exists .agents/.env\n",
      [path.join(".agents", "skills.md")]: "<!-- bkit:start -->\nstale\n<!-- bkit:end -->\nmine\n",
    };
    for (const [rel, content] of Object.entries(owned)) {
      fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, rel), content, "utf-8");
    }

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
    const check = runCli(["check"]);
    expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);

    for (const [rel, content] of Object.entries(owned)) {
      expect(fs.readFileSync(path.join(tmpDir, rel), "utf-8"), rel).toBe(content);
    }
  });

  it("check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's blocks", () => {
    if (!fs.existsSync(tsxBin)) return;
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(runCli(["install", "--claude"]).status).toBe(0);
    const abs = path.join(tmpDir, ".agents", "context.md");
    const fresh = fs.readFileSync(abs, "utf-8");
    const end = "<!-- bkit:end -->";
    // The block's own rules quote the end marker, so the real one is the last.
    const endIdx = fresh.lastIndexOf(end);
    const managed = fresh.slice(0, endIdx + end.length);
    const consumer =
      "\n\n## Enabled blocks\n\n<!-- context-fetch:start ours context=web -->\n```bash\necho ours\n```\n<!-- context-fetch:end -->\n";
    const stale = `${fresh.slice(0, endIdx)}stale rule\n${end}`;
    fs.writeFileSync(abs, stale + consumer, "utf-8");

    const flagged = runCli(["check"]);
    expect(flagged.status, `${flagged.stdout}\n${flagged.stderr}`).toBe(1);
    expect(`${flagged.stdout}\n${flagged.stderr}`).toContain(path.join(".agents", "context.md"));

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
    expect(fs.readFileSync(abs, "utf-8")).toBe(managed + consumer);
    const check = runCli(["check"]);
    expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// #255 — upgrade must not force-create uninstalled host/tooling modules
//
// claude/cursor/lint are each separately installable. The upgrade template walk is
// gated on sentinel-detected installation; seeding EVERY non-opt-in template would give
// a `--claude`-only consumer cursor/lint FILES on upgrade, which `bkit check` then flags
// as drift (install↔upgrade divergence).
// ---------------------------------------------------------------------------

describe("#255 — upgrade does not force-create uninstalled host/tooling modules", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
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
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
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
      ".github/workflows/ci.yml",
      ".vale.ini",
      ".husky/pre-commit",
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

  it("upgrade seeds missing bkit:gate:* names and re-points a legacy slop:delta, so check stays clean (#489)", () => {
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const pkgPath = path.join(tmpDir, "package.json");
    fs.writeFileSync(
      pkgPath,
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );
    expect(runCli(["install", "--claude"]).status).toBe(0);

    // A consumer from before core seeded the gates: no gate names, one custom gate,
    // and the slop:delta value an older bkit wrote.
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      scripts: Record<string, string>;
    };
    pkg.scripts = {
      "bkit:gate:static": "ruff check .",
      "slop:delta": "bash .bkit/scripts/bkit-slop-delta.sh",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

    expect(runCli(["upgrade", "--auto-apply"]).status).toBe(0);

    const scripts = (
      JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { scripts: Record<string, string> }
    ).scripts;
    expect(scripts["bkit:gate:static"]).toBe("ruff check .");
    expect(scripts["bkit:gate:static-unit"]).toBe("pnpm bkit:gate:static && pnpm test");
    expect(scripts["bkit:deps:audit"]).toBe("pnpm audit");
    expect(scripts["slop:delta"]).toBe("bkit ci slop");
    expect(scripts.typecheck).toBeUndefined();

    const check = runCli(["check"]);
    expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });
});

// ---------------------------------------------------------------------------
// #281 Task 3 — upgrade re-renders ALL installed provider blocks into opencode.json
//
// When multiple providers are installed (e.g. openrouter + ollama), `bkit upgrade`
// must re-render and reconverge EVERY provider's block into opencode.json — not just
// the active one. This ensures template changes (new keys, updated placeholders) reach
// all installed providers' blocks on every upgrade.
// ---------------------------------------------------------------------------

describe("#281 Task 3 — upgrade re-renders all installed provider blocks", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
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
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
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
// #281 AC — `bkit check` exits 0 (no drift) with multiple providers installed
//
// Spec: "bkit check exits 0 (no drift) with multiple providers installed; dry-run parity holds."
// ---------------------------------------------------------------------------

describe("#281 AC — bkit check exits 0 with multiple providers installed", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
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
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
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
// #334 — `bkit upgrade` auto-migrates context-fetch blocks observability.md → config.md
//
// install and upgrade are SEPARATE engines. The migration is wired into runCoreModule
// (install) AND the upgrade dispatch; without the upgrade wiring an upgrading consumer's
// context-fetch blocks stay stranded in docs/observability.md while /bkit-debug reads only
// .agents/context.md. End-to-end via a real `bkit upgrade --auto-apply`, not a unit stub.
// ---------------------------------------------------------------------------

describe("#334 — bkit upgrade migrates context-fetch blocks observability.md → .agents/context.md", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
  );

  function runBkitUpgrade() {
    return spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--auto-apply"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
  }

  it("moves a consumer context-fetch block out of observability.md into .agents/context.md", () => {
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    writeVersionFile();

    // Old layout: consumer copied a context-fetch block into observability.md's consumer
    // section (after bkit:end), alongside unrelated project prose.
    const obs =
      "<!-- bkit:start -->\n# Observability\n\n<!-- bkit:end -->\n\n" +
      "## Our runtime notes — MUST SURVIVE\n\n" +
      "<!-- context-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- context-fetch:end -->\n";
    fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "docs", "observability.md"), obs, "utf-8");

    const result = runBkitUpgrade();
    expect(result.status, `upgrade failed:\n${result.stdout}\n${result.stderr}`).toBe(0);

    // Block moved OUT of observability.md; unrelated consumer prose kept.
    const obsAfter = fs.readFileSync(path.join(tmpDir, "docs", "observability.md"), "utf-8");
    expect(obsAfter).not.toContain("context-fetch:start vercel");
    expect(obsAfter).toContain("## Our runtime notes — MUST SURVIVE");

    // Block moved INTO .agents/context.md (created by the upgrade render, then appended to).
    const contextAfter = fs.readFileSync(path.join(tmpDir, ".agents", "context.md"), "utf-8");
    expect(contextAfter).toContain("context-fetch:start vercel");
    expect(contextAfter).toContain("vercel logs --json");

    // The migration surfaced its log line.
    expect(result.stdout + result.stderr).toContain(
      "migrated 1 context-fetch block(s) docs/observability.md → .agents/context.md",
    );
  });
});

// ---------------------------------------------------------------------------
// #422 — gateguard.cjs/gateguard.js markered-text upgrade round-trip. This is the
// regression test for detectMarkerStyle (bkit-tiers.ts, site 9): if the slash-comment
// marker style is missing from its style list, `bkit upgrade` silently stops
// managing these files with no error and no drift signal — nothing
// else catches that. A real install, then a real upgrade, is the only way to prove it.
// ---------------------------------------------------------------------------

describe("#422 — gateguard markered-text upgrade round-trip (site-9 regression)", () => {
  const bkitInstallPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "bkit-install.ts",
  );
  const tsxBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../node_modules/.bin/tsx",
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
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    const install = runCli(["install", "--claude", "--opencode=opencode-go", "--tracker=github"]);
    expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);

    const cjsPath = path.join(tmpDir, ".claude", "hooks", "gateguard.cjs");
    const jsPath = path.join(tmpDir, ".opencode", "plugin", "gateguard.js");
    const cjsOriginal = fs.readFileSync(cjsPath, "utf-8");
    const jsOriginal = fs.readFileSync(jsPath, "utf-8");
    expect(cjsOriginal).toContain("// bkit:start");
    expect(jsOriginal).toContain("// bkit:start");

    // Tamper OUTSIDE the block (consumer's own driver code — must survive) AND STALE
    // the INSIDE-block content (must be refreshed back to the shipped template on
    // upgrade). Block-merge is unconditional — this is the discriminating signal for
    // the site-9 regression: without it, `detectMarkerStyle` mis-reads the `//
    // bkit:start` template as null, writeTier2 finds no block to manage, and this
    // stale content would silently survive the upgrade instead of being refreshed.
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
