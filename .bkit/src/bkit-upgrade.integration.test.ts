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

function writeVersionFile(
  canonicalHashes: Record<string, string> = {},
  tier3Hashes: Record<string, string> = {},
): void {
  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
  const v: BkitVersion = {
    pinnedVersion: "0.4.0",
    tier3Hashes,
    canonicalHashes,
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
// Opt-in modules (renovate, dependabot) ship only via an explicit
// `bkit install --renovate`/`--dependabot`. The upgrade template walk previously
// wrote EVERY template, so it created `.github/renovate.json5` on consumers that
// never opted in — opening duplicate dependency PRs next to existing Dependabot.
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
    // Non-opt-in managed files DID get created — proving the walk ran (not a no-op).
    expect(fs.existsSync(path.join(tmpDir, ".gitignore"))).toBe(true);
    expect(result.status).toBe(0);
  });

  it("DOES update .github/renovate.json5 when the consumer has already opted in (dest present)", () => {
    if (!fs.existsSync(tsxBin)) return;
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer" }),
      "utf-8",
    );
    writeVersionFile();
    // Consumer opted into Renovate previously — a stale config sits on disk.
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{ stale: true }\n", "utf-8");

    runBkitUpgrade();

    // The opt-in file is still present (processed as a candidate, not skipped/deleted).
    expect(fs.existsSync(path.join(tmpDir, ".github", "renovate.json5"))).toBe(true);
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
// #255 P3 — tracker-filtered .mcp.json / .cursor/mcp.json must not false-conflict
//
// .mcp.json and .cursor/mcp.json are seeded tracker-FILTERED on install (only the selected
// tracker's mcpServers entry). The upgrade walk now renders them the same way (buildMcpJson
// contentOverride, like bkit-cloud.yml #138 / opencode.json #245) — so a same-version run with
// an unmodified seed is byte-identical → skipped, NOT a spurious seed-or-print conflict.
// Drift detection on a real template change is unaffected (proven below).
// ---------------------------------------------------------------------------

describe("#255 P3 — same-version upgrade does not false-conflict tracker-filtered mcp.json", () => {
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

  it("present, unmodified .mcp.json + .cursor/mcp.json → same-version upgrade exits 0, no conflict", () => {
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    const install = runCli(["install", "--claude", "--cursor", "--tracker=github"]);
    expect(install.status).toBe(0);
    const mcpBefore = fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8");
    const cursorMcpBefore = fs.readFileSync(path.join(tmpDir, ".cursor", "mcp.json"), "utf-8");

    const upgrade = runCli(["upgrade", "--auto-apply"]);
    const out = `${upgrade.stdout ?? ""}${upgrade.stderr ?? ""}`;
    // Same-version, untouched seeds → clean exit, zero conflicts (the #255 P3 bug was exit 1 here).
    expect(upgrade.status).toBe(0);
    expect(out).not.toContain("conflict: .mcp.json");
    expect(out).not.toContain("conflict: .cursor/mcp.json");
    // Consumer-owned seeds left byte-identical (upgrade never rewrote them).
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe(mcpBefore);
    expect(fs.readFileSync(path.join(tmpDir, ".cursor", "mcp.json"), "utf-8")).toBe(
      cursorMcpBefore,
    );
  });

  it("CHANGED .mcp.json template + consumer-modified seed → still conflicts (drift detection intact)", () => {
    // A consumer edited their seeded .mcp.json.
    const consumerMcp =
      JSON.stringify(
        { mcpServers: { github: { type: "http", url: "https://CONSUMER-EDITED.example/mcp/" } } },
        null,
        2,
      ) + "\n";
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), consumerMcp, "utf-8");

    // What bkit recorded as the canonical baseline at the previous install.
    const oldBaseline =
      JSON.stringify(
        { mcpServers: { github: { type: "http", url: "https://api.githubcopilot.com/mcp/" } } },
        null,
        2,
      ) + "\n";
    writeVersionFile({ ".mcp.json": sha256(oldBaseline) });

    // A NEW bkit version ships a changed .mcp.json — passed as the tracker-rendered override
    // (this is what the install-side collectTemplates produces via buildMcpJson).
    const newRendered =
      JSON.stringify(
        {
          mcpServers: {
            github: {
              type: "http",
              url: "https://api.githubcopilot.com/mcp/",
              headers: { "X-MCP-Toolsets": "context,issues" },
            },
          },
        },
        null,
        2,
      ) + "\n";

    const result = runUpgrade(
      [
        {
          relPath: ".mcp.json",
          templatePath: path.join(tmpDir, ".unused-template"),
          seedOrPrint: true,
          contentOverride: newRendered,
        },
      ],
      { nonInteractive: true, dryRun: false, cwd: tmpDir },
    );

    // Template genuinely changed AND consumer drifted → real conflict, not a silent overwrite.
    expect(result.conflicts.map((c) => c.relPath)).toContain(".mcp.json");
    // Consumer's edit preserved (never clobbered).
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe(consumerMcp);
  });
});

// ---------------------------------------------------------------------------
// #255 follow-up — upgrade must not force-create uninstalled host/tooling modules
//
// Post-#252 claude/cursor/ci/lint/git-hooks are each separately installable. The upgrade
// template walk used to seed EVERY non-opt-in template, so a `--claude`-only consumer got
// cursor/ci/lint/git-hooks FILES on upgrade — but not the matching package.json scripts the
// install modules inject — and `bkit check` then flagged that as drift (install↔upgrade
// divergence). The walk is now gated on sentinel-detected installation.
// ---------------------------------------------------------------------------

describe("#255 follow-up — upgrade does not force-create uninstalled host/tooling modules", () => {
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

  it("claude-only install → upgrade seeds no cursor/ci/lint/git-hooks files, and check stays clean", () => {
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
});

// ---------------------------------------------------------------------------
// #281 Task 3 — upgrade re-renders ALL installed provider blocks into opencode.json
//
// When multiple providers are installed (e.g. nvidia + ollama-local), `bkit upgrade`
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

  it("upgrade reconverges ALL provider blocks — nvidia (active) + ollama-local (secondary)", () => {
    if (!fs.existsSync(tsxBin)) return; // CI without devDeps
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
      "utf-8",
    );

    // Install first provider (ollama-local) — becomes initial active
    expect(runCli(["install", "--opencode=ollama-local", "--tracker=github"]).status).toBe(0);

    // Install second provider (nvidia) — becomes the active provider (last installed)
    expect(runCli(["install", "--opencode=nvidia", "--tracker=github"]).status).toBe(0);

    const opencodePath = path.join(tmpDir, ".opencode", "opencode.json");
    expect(fs.existsSync(opencodePath)).toBe(true);

    // Both provider blocks must be present after install
    const afterInstall = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, unknown>;
    };
    expect(afterInstall.provider!["nvidia"]).toBeDefined();
    expect(afterInstall.provider!["ollama-local"]).toBeDefined();

    // Simulate template drift for the NON-active (ollama-local) block:
    // remove its `npm` field so we can verify upgrade reconverges it.
    const drifted = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, Record<string, unknown>>;
    };
    delete drifted.provider!["ollama-local"]!["npm"];
    fs.writeFileSync(opencodePath, JSON.stringify(drifted, null, 2) + "\n", "utf-8");

    // Confirm the npm field is gone before upgrade
    const withDrift = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, Record<string, unknown>>;
    };
    expect(withDrift.provider!["ollama-local"]!["npm"]).toBeUndefined();

    // Run upgrade — Task 3 should reconverge the ollama-local block
    const upgrade = runCli(["upgrade", "--auto-apply"]);
    expect(upgrade.status).toBe(0);

    // After upgrade: the ollama-local block must have its `npm` field restored (re-rendered)
    const afterUpgrade = JSON.parse(fs.readFileSync(opencodePath, "utf-8")) as {
      provider?: Record<string, Record<string, unknown>>;
    };
    expect(afterUpgrade.provider).toBeDefined();
    expect(afterUpgrade.provider!["nvidia"]).toBeDefined();
    expect(afterUpgrade.provider!["ollama-local"]).toBeDefined();

    // The reconverged ollama-local block must carry the template-rendered `npm` field
    expect(afterUpgrade.provider!["ollama-local"]!["npm"]).toBe("@ai-sdk/openai-compatible");

    // The nvidia (active) block must also be intact (handled by the candidates walk)
    expect(afterUpgrade.provider!["nvidia"]!["npm"]).toBe("@ai-sdk/openai-compatible");
  });
});
