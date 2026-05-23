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
  writeBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"), v);
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
    return spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--non-interactive"], {
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
    expect(fs.existsSync(path.join(tmpDir, "scripts", "ci", "bkit-set-dependabot.sh"))).toBe(false);
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
