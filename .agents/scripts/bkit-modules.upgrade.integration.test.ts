// bkit-modules.upgrade.integration.test.ts — Two-version upgrade-survival regression (P3.T9)
//
// Tests that consumer-added keys in .claude/settings.json and .cursor/hooks.json
// survive a simulated bkit upgrade from Tier-1 (v0.5.x) to Tier-2 (v0.8.x).
//
// References tests/fixtures/heavy-customised-consumer/ from P2.T8a (sub-plan-2).
// Dependency: this test REQUIRES the fixture from P2.T8a.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  writeTier2Json,
  migrateTier1JsonToTier2,
  type WriteSet,
} from "./bkit-tiers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

const FIXTURE_DIR = path.resolve(__dirname, "../../tests/fixtures/heavy-customised-consumer");

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

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
// Two-version upgrade scenario: Tier-1 (v0.5.x) → Tier-2 (v0.8.x)
//
// Simulates: consumer has bkit@0.5.0 installed (Tier-1 full-overwrite).
// Consumer added: hooks.Stop in .claude/settings.json; failClosed+loop_limit in .cursor/hooks.json.
// bkit@0.8.0 upgrade runs: migration lifts old shape into __bkit__; consumer keys survive.
// Second install (bkit@0.8.x → bkit@0.8.x+1): consumer keys still survive after Tier-2 update.
// ---------------------------------------------------------------------------

describe("two-version upgrade-survival regression (gether scenario)", () => {
  it("fixture exists at tests/fixtures/heavy-customised-consumer/", () => {
    expect(fs.existsSync(FIXTURE_DIR), `Fixture missing at ${FIXTURE_DIR}`).toBe(true);
    expect(fs.existsSync(path.join(FIXTURE_DIR, "claude-settings.json"))).toBe(true);
    expect(fs.existsSync(path.join(FIXTURE_DIR, "cursor-hooks.json"))).toBe(true);
  });

  it("consumer Stop hook survives upgrade from Tier-1 (v0.5.0) to Tier-2 (v0.8.0)", () => {
    // Setup: simulate a consumer with bkit@0.5.0 Tier-1 installation
    // The fixture claude-settings.json has Stop hook + SessionStart (from sub-plan-2 P2.T8a)
    const fixtureClaude = path.join(FIXTURE_DIR, "claude-settings.json");
    const onDiskClaude = path.join(tmpDir, ".claude", "settings.json");
    fs.mkdirSync(path.dirname(onDiskClaude), { recursive: true });
    fs.copyFileSync(fixtureClaude, onDiskClaude);

    // Verify: consumer has a Stop hook (consumer-added)
    const beforeUpgrade = JSON.parse(fs.readFileSync(onDiskClaude, "utf-8"));
    expect(beforeUpgrade.hooks?.Stop).toBeDefined();
    const consumerStopHook = JSON.stringify(beforeUpgrade.hooks.Stop);

    // Step 1: Run migration (bkit@0.8.0 upgrade — migrateTier1JsonToTier2)
    const migrated = migrateTier1JsonToTier2(onDiskClaude, ".claude/settings.json", "0.5.0");
    expect(migrated).toBe(true);

    // Verify migration: __bkit__ envelope present; Stop hook preserved outside envelope
    const afterMigration = JSON.parse(fs.readFileSync(onDiskClaude, "utf-8"));
    expect(afterMigration.__bkit__).toBeDefined();
    expect(afterMigration.__bkit__.hooks.SessionStart).toBeDefined();
    expect(JSON.stringify(afterMigration.hooks?.Stop ?? afterMigration.Stop)).toContain("Consumer Stop hook");

    // Step 2: Run writeTier2Json (bkit@0.8.0 install with updated template)
    // Create a mock template with __bkit__ + updated SessionStart
    const mockTemplatePath = path.join(tmpDir, "settings-template.json");
    const mockTemplate = {
      __bkit__: {
        hooks: {
          SessionStart: [
            {
              hooks: [
                {
                  type: "command",
                  command: "bash .claude/hooks/preflight.sh",
                },
              ],
            },
          ],
        },
      },
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          {
            hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }],
          },
        ],
      },
    };
    fs.writeFileSync(mockTemplatePath, JSON.stringify(mockTemplate, null, 2) + "\n", "utf-8");

    const ws = makeWriteSet();
    writeTier2Json(mockTemplatePath, onDiskClaude, false, ws);

    // Verify: consumer Stop hook still present after writeTier2Json
    const afterInstall = JSON.parse(fs.readFileSync(onDiskClaude, "utf-8"));
    expect(afterInstall.__bkit__).toBeDefined();
    // Consumer Stop hook should survive (outside __bkit__)
    const consumerHooks = afterInstall.hooks;
    const stopHook = consumerHooks?.Stop;
    expect(stopHook).toBeDefined();
    expect(JSON.stringify(stopHook)).toContain("Consumer Stop hook");
  });

  it("consumer failClosed + loop_limit survive upgrade from Tier-1 (v0.5.0) to Tier-2", () => {
    const fixtureCursor = path.join(FIXTURE_DIR, "cursor-hooks.json");
    const onDiskCursor = path.join(tmpDir, ".cursor", "hooks.json");
    fs.mkdirSync(path.dirname(onDiskCursor), { recursive: true });
    fs.copyFileSync(fixtureCursor, onDiskCursor);

    // Verify fixture has consumer fields
    const beforeUpgrade = JSON.parse(fs.readFileSync(onDiskCursor, "utf-8"));
    expect(beforeUpgrade.failClosed).toBe(true);
    expect(beforeUpgrade.loop_limit).toBe(5);

    // Step 1: Run migration
    const migrated = migrateTier1JsonToTier2(onDiskCursor, ".cursor/hooks.json", "0.5.0");
    expect(migrated).toBe(true);

    const afterMigration = JSON.parse(fs.readFileSync(onDiskCursor, "utf-8"));
    expect(afterMigration.__bkit__).toBeDefined();
    expect(afterMigration.failClosed).toBe(true);
    expect(afterMigration.loop_limit).toBe(5);

    // Step 2: Run writeTier2Json with updated template
    const mockTemplatePath = path.join(tmpDir, "hooks-template.json");
    const mockTemplate = {
      __bkit__: {
        hooks: [
          { event: "sessionStart", command: "echo '[bkit] session started'" },
          { event: "sessionStop", command: "echo '[bkit] session stopped'" },
        ],
      },
      hooks: [
        { event: "sessionStart", command: "echo '[bkit] session started'" },
        { event: "sessionStop", command: "echo '[bkit] session stopped'" },
      ],
    };
    fs.writeFileSync(mockTemplatePath, JSON.stringify(mockTemplate, null, 2) + "\n", "utf-8");

    const ws = makeWriteSet();
    writeTier2Json(mockTemplatePath, onDiskCursor, false, ws);

    // Verify: consumer fields survive
    const afterInstall = JSON.parse(fs.readFileSync(onDiskCursor, "utf-8"));
    expect(afterInstall.failClosed).toBe(true);
    expect(afterInstall.loop_limit).toBe(5);
    expect(afterInstall.__bkit__).toBeDefined();
  });

  it("second consecutive upgrade: consumer keys byte-identical after second writeTier2Json", () => {
    // Simulate v0.8.0 → v0.8.1 upgrade (Tier-2 → Tier-2): already has __bkit__, no migration needed
    const onDiskPath = path.join(tmpDir, "settings.json");
    const consumerDoc = {
      __bkit__: {
        hooks: {
          SessionStart: [{ hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] }],
        },
      },
      hooks: {
        Stop: [{ hooks: [{ type: "command", command: "echo 'Consumer Stop hook'" }] }],
      },
      customKey: "consumer-value",
    };
    fs.writeFileSync(onDiskPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");
    const consumerStopBefore = JSON.stringify(consumerDoc.hooks.Stop);

    // bkit@0.8.1 template with updated SessionStart
    const templatePath = path.join(tmpDir, "template-v081.json");
    const template = {
      __bkit__: {
        hooks: {
          SessionStart: [{ hooks: [{ type: "command", command: "bash .claude/hooks/preflight-v2.sh" }] }],
        },
      },
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "bash .claude/hooks/preflight-v2.sh" }] }],
      },
    };
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

    const ws = makeWriteSet();
    writeTier2Json(templatePath, onDiskPath, false, ws);

    const afterUpgrade = JSON.parse(fs.readFileSync(onDiskPath, "utf-8"));
    // bkit key updated
    expect(JSON.stringify(afterUpgrade.__bkit__)).toContain("preflight-v2.sh");
    // Consumer Stop hook byte-identical
    expect(JSON.stringify(afterUpgrade.hooks.Stop)).toBe(consumerStopBefore);
    // Other consumer keys unchanged
    expect(afterUpgrade.customKey).toBe("consumer-value");
  });

  it("writeTier2Json throws when template is missing __bkit__ (regression: rollback safety)", () => {
    const templatePath = path.join(tmpDir, "no-bkit-template.json");
    const dstPath = path.join(tmpDir, "dst.json");
    // Template without __bkit__ — simulates accidental rollback to pre-v0.8.0 template
    fs.writeFileSync(templatePath, JSON.stringify({ hooks: { SessionStart: [] } }), "utf-8");

    const ws = makeWriteSet();
    expect(() => writeTier2Json(templatePath, dstPath, false, ws)).toThrow(/__bkit__/);
  });
});
