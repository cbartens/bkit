// bkit-modules-upgrade.integration.test.ts — upgrade survival of consumer keys
//
// Tests that consumer-added keys in .claude/settings.json and .cursor/hooks.json
// survive a simulated bkit upgrade chain:
//   - v0.5.x → v0.8.x (Tier-1 to Tier-2 migration, old test suite)
//   - v0.8.x → v2.0.0 (envelope strip via migrateLegacyBkitEnvelope + writeTier2JsonContained)
//
// References:
//   - tests/fixtures/heavy-customised-consumer/    — v0.5.x consumer fixture
//   - tests/fixtures/heavy-customised-consumer-v1-envelope/ — v0.8.x consumer fixture

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  writeTier2JsonContained,
  migrateLegacyBkitEnvelope,
  type WriteSet,
  type JsonValue,
} from "./bkit-tiers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

const FIXTURE_DIR = path.resolve(__dirname, "../../tests/fixtures/heavy-customised-consumer");
const FIXTURE_V1_ENVELOPE_DIR = path.resolve(
  __dirname,
  "../../tests/fixtures/heavy-customised-consumer-v1-envelope",
);

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
// Pre-v2.0.0 fixture (v0.8.x envelope shape) → upgrade → schema-clean snapshot
// Task 9: v0.8.x → v2.0.0 upgrade chain using Task-0c fixture
// ---------------------------------------------------------------------------

describe("v0.8.x → v2.0.0 envelope migration (Task-0c fixture)", () => {
  it("fixture exists at tests/fixtures/heavy-customised-consumer-v1-envelope/", () => {
    expect(
      fs.existsSync(FIXTURE_V1_ENVELOPE_DIR),
      `Fixture missing at ${FIXTURE_V1_ENVELOPE_DIR}`,
    ).toBe(true);
    expect(fs.existsSync(path.join(FIXTURE_V1_ENVELOPE_DIR, "claude-settings.json"))).toBe(true);
    expect(fs.existsSync(path.join(FIXTURE_V1_ENVELOPE_DIR, "cursor-hooks.json"))).toBe(true);
    expect(fs.existsSync(path.join(FIXTURE_V1_ENVELOPE_DIR, "bkit-version.json"))).toBe(true);
  });

  it("migrateLegacyBkitEnvelope strips __bkit__ from claude-settings.json fixture; retains Stop hook", () => {
    const fixturePath = path.join(FIXTURE_V1_ENVELOPE_DIR, "claude-settings.json");
    const doc = JSON.parse(fs.readFileSync(fixturePath, "utf-8")) as Record<string, JsonValue>;
    expect(doc["__bkit__"]).toBeDefined(); // fixture has envelope

    // Template = schema-clean settings.json (no __bkit__)
    const template: Record<string, JsonValue> = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          { hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] },
        ],
      },
    };

    const result = migrateLegacyBkitEnvelope(doc, template);
    expect(result.stripped).toBe(true);
    expect(result.outDoc["__bkit__"]).toBeUndefined();
    // Consumer Stop hook preserved
    const hooks = result.outDoc.hooks as Record<string, JsonValue>;
    expect(hooks.Stop).toBeDefined();
  });

  it("writeTier2JsonContained writes schema-clean template when dest is absent", () => {
    const srcPath = path.join(tmpDir, "settings-template.json");
    const dstPath = path.join(tmpDir, ".claude", "settings.json");
    const template = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: { SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }] },
    };
    fs.writeFileSync(srcPath, JSON.stringify(template, null, 2) + "\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2JsonContained(srcPath, dstPath, false, ws);

    expect(fs.existsSync(dstPath)).toBe(true);
    const written = JSON.parse(fs.readFileSync(dstPath, "utf-8"));
    expect(written["__bkit__"]).toBeUndefined();
    expect(ws.writes).toHaveLength(1);
    expect(ws.writes[0]!.action).toBe("write");
  });

  it("upgrade chain v0.8.x → v2.0.0: consumer Stop hook preserved byte-identical", () => {
    // Start with v0.8.x fixture (has __bkit__ envelope + consumer Stop hook)
    const fixturePath = path.join(FIXTURE_V1_ENVELOPE_DIR, "claude-settings.json");
    const onDiskPath = path.join(tmpDir, ".claude", "settings.json");
    fs.mkdirSync(path.dirname(onDiskPath), { recursive: true });
    fs.copyFileSync(fixturePath, onDiskPath);

    const beforeDoc = JSON.parse(fs.readFileSync(onDiskPath, "utf-8")) as Record<string, JsonValue>;
    const stopHookBefore = JSON.stringify((beforeDoc.hooks as Record<string, JsonValue>).Stop);

    // Step 1: migrateLegacyBkitEnvelope (strips __bkit__)
    const templateSrcPath = path.join(tmpDir, "settings-template.json");
    const template = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: { SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }] },
    };
    fs.writeFileSync(templateSrcPath, JSON.stringify(template, null, 2) + "\n", "utf-8");
    const templateDoc = JSON.parse(fs.readFileSync(templateSrcPath, "utf-8")) as Record<
      string,
      JsonValue
    >;

    const migrResult = migrateLegacyBkitEnvelope(beforeDoc, templateDoc);
    expect(migrResult.stripped).toBe(true);
    fs.writeFileSync(onDiskPath, JSON.stringify(migrResult.outDoc, null, 2) + "\n", "utf-8");

    // Step 2: writeTier2JsonContained
    const ws = makeWriteSet();
    writeTier2JsonContained(templateSrcPath, onDiskPath, false, ws);

    // Verify: Stop hook byte-identical; no __bkit__
    const afterDoc = JSON.parse(fs.readFileSync(onDiskPath, "utf-8"));
    expect(afterDoc["__bkit__"]).toBeUndefined();
    expect(JSON.stringify((afterDoc.hooks as Record<string, JsonValue>).Stop)).toBe(stopHookBefore);
  });

  it("v0.8.x → v2.0.0: cursor hooks.json — failClosed + loop_limit preserved byte-identical", () => {
    const fixturePath = path.join(FIXTURE_V1_ENVELOPE_DIR, "cursor-hooks.json");
    const onDiskPath = path.join(tmpDir, ".cursor", "hooks.json");
    fs.mkdirSync(path.dirname(onDiskPath), { recursive: true });
    fs.copyFileSync(fixturePath, onDiskPath);

    const beforeDoc = JSON.parse(fs.readFileSync(onDiskPath, "utf-8")) as Record<string, JsonValue>;
    expect(beforeDoc.failClosed).toBe(true);
    expect(beforeDoc.loop_limit).toBe(5);

    // v2.0.0 template: Cursor v1 keyed-object schema
    const templateSrcPath = path.join(tmpDir, "hooks-template.json");
    const template = {
      version: 1,
      hooks: {
        sessionStart: [{ command: "echo '[bkit] session started'" }],
        sessionStop: [{ command: "echo '[bkit] session stopped'" }],
      },
    };
    fs.writeFileSync(templateSrcPath, JSON.stringify(template, null, 2) + "\n", "utf-8");
    const templateDoc = JSON.parse(fs.readFileSync(templateSrcPath, "utf-8")) as Record<
      string,
      JsonValue
    >;

    const migrResult = migrateLegacyBkitEnvelope(beforeDoc, templateDoc);
    expect(migrResult.stripped).toBe(true);
    // Schema flip: old flat-array hooks vs new keyed-object hooks → schemaFlipped may be true
    fs.writeFileSync(onDiskPath, JSON.stringify(migrResult.outDoc, null, 2) + "\n", "utf-8");

    const ws = makeWriteSet();
    writeTier2JsonContained(templateSrcPath, onDiskPath, false, ws);

    const afterDoc = JSON.parse(fs.readFileSync(onDiskPath, "utf-8"));
    expect(afterDoc["__bkit__"]).toBeUndefined();
    expect(afterDoc.failClosed).toBe(true);
    expect(afterDoc.loop_limit).toBe(5);
  });

  it("idempotency — running upgrade twice on v2.0.0 file is a no-op", () => {
    // File already in v2.0.0 schema (no __bkit__), fully contains template
    const templateSrcPath = path.join(tmpDir, "settings-template.json");
    const template = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: { SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }] },
    };
    fs.writeFileSync(templateSrcPath, JSON.stringify(template, null, 2) + "\n", "utf-8");

    const onDiskPath = path.join(tmpDir, "settings.json");
    const consumerDoc = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }],
        Stop: [{ hooks: [{ type: "command", command: "echo consumer" }] }],
      },
    };
    fs.writeFileSync(onDiskPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

    // First run
    const ws1 = makeWriteSet();
    writeTier2JsonContained(templateSrcPath, onDiskPath, false, ws1);
    expect(ws1.writes).toHaveLength(0); // already contained → no-op

    // Second run
    const ws2 = makeWriteSet();
    writeTier2JsonContained(templateSrcPath, onDiskPath, false, ws2);
    expect(ws2.writes).toHaveLength(0); // still no-op
  });
});

// ---------------------------------------------------------------------------
// Heavy-customised consumer fixture survival (BAR-131 fixture, v0.5.x era)
// Task 9: heavy-customised consumer fixture survival
// ---------------------------------------------------------------------------

describe("heavy-customised consumer fixture (v0.5.x era) — v2.0.0 contained write", () => {
  it("fixture directory exists", () => {
    expect(fs.existsSync(FIXTURE_DIR), `Fixture missing at ${FIXTURE_DIR}`).toBe(true);
  });

  it("consumer Stop hook survives writeTier2JsonContained", () => {
    // Simulate a consumer that already had the Stop hook and migrated __bkit__ manually
    const onDiskPath = path.join(tmpDir, "settings.json");
    const consumerDoc = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }],
        Stop: [{ hooks: [{ type: "command", command: "echo 'Consumer Stop hook'" }] }],
      },
      customKey: "consumer-value",
    };
    fs.writeFileSync(onDiskPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

    const templatePath = path.join(tmpDir, "template.json");
    const template = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: { SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }] },
    };
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

    const ws = makeWriteSet();
    writeTier2JsonContained(templatePath, onDiskPath, false, ws);

    const afterDoc = JSON.parse(fs.readFileSync(onDiskPath, "utf-8"));
    expect(afterDoc["__bkit__"]).toBeUndefined();
    // Consumer Stop hook survived
    expect(afterDoc.hooks.Stop).toBeDefined();
    expect(JSON.stringify(afterDoc.hooks.Stop)).toContain("Consumer Stop hook");
    // consumer-only key survived
    expect(afterDoc.customKey).toBe("consumer-value");
  });
});

// ---------------------------------------------------------------------------
// Cursor v1 keyed-object schema sanity (Task 8, cursor-v1-schema block)
// ---------------------------------------------------------------------------

describe("cursor-v1-schema sanity", () => {
  it("template has version===1, hooks.sessionStart/sessionStop arrays, no __bkit__", () => {
    const templatePath = path.resolve(__dirname, "../../.bkit/templates/.cursor/hooks.json");
    expect(fs.existsSync(templatePath)).toBe(true);
    const doc = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    expect(doc.version).toBe(1);
    expect(Array.isArray(doc.hooks.sessionStart)).toBe(true);
    expect(Array.isArray(doc.hooks.sessionStop)).toBe(true);
    expect(doc["__bkit__"]).toBeUndefined();
    // No flat-array hooks
    expect(Array.isArray(doc.hooks)).toBe(false);
  });
});

import { runClaudeModule } from "./bkit-modules";
import type { ModuleContext } from "./bkit-modules";
import type { PreflightFinding } from "./bkit-preflight";

// ---------------------------------------------------------------------------
// opencode reconverge on upgrade (sub-plan 4)
// Tests that consumer keys in opencode.json survive writeTier2JsonContained
// while bkit-managed keys are reconverged.
// ---------------------------------------------------------------------------

describe("opencode opencode.json reconverge on upgrade", () => {
  it("consumer-added provider key survives writeTier2JsonContained; bkit plugins key reconverged", () => {
    // Template = bkit's managed opencode.json shape
    const templatePath = path.join(tmpDir, "opencode-template.json");
    const template = {
      provider: {
        ollama: {
          npm: "@ai-sdk/openai-compatible",
          name: "Ollama (Local)",
          options: { baseURL: "http://localhost:11434/v1" },
        },
      },
      plugins: [".opencode/plugin/gateguard.js"],
    };
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

    // Consumer's existing opencode.json — has bkit-managed keys PLUS consumer additions
    const consumerPath = path.join(tmpDir, "opencode.json");
    const consumerDoc = {
      provider: {
        ollama: {
          npm: "@ai-sdk/openai-compatible",
          name: "Ollama (Local)",
          options: { baseURL: "http://localhost:11434/v1" },
        },
        // Consumer added their own (non-bkit) provider — must survive reconverge
        customllm: {
          options: { baseURL: "https://llm.internal.example/v1" },
          apiKey: "${CUSTOMLLM_API_KEY}",
        },
      },
      // Consumer added their own mcp config
      mcp: { myServer: { command: "npx", args: ["-y", "my-mcp-server"] } },
      plugins: [".opencode/plugin/gateguard.js"],
    };
    fs.writeFileSync(consumerPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

    const ws: WriteSet = { writes: [] };
    writeTier2JsonContained(templatePath, consumerPath, false, ws);

    const afterDoc = JSON.parse(fs.readFileSync(consumerPath, "utf-8"));

    // bkit ollama provider still present (reconverged)
    expect(afterDoc.provider?.["ollama"]?.options?.baseURL).toBe("http://localhost:11434/v1");
    // Consumer's custom (non-bkit) provider preserved
    expect(afterDoc.provider?.customllm?.apiKey).toBe("${CUSTOMLLM_API_KEY}");
    // Consumer's mcp config preserved
    expect(afterDoc.mcp?.myServer?.command).toBe("npx");
    // Plugin still wired
    expect(afterDoc.plugins).toContain(".opencode/plugin/gateguard.js");
  });

  it("opencode.json reconverge is idempotent", () => {
    const templatePath = path.join(tmpDir, "opencode-template.json");
    const template = {
      provider: {
        ollama: {
          npm: "@ai-sdk/openai-compatible",
          name: "Ollama (Local)",
          options: { baseURL: "http://localhost:11434/v1" },
        },
      },
      plugins: [".opencode/plugin/gateguard.js"],
    };
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

    const consumerPath = path.join(tmpDir, "opencode.json");
    const consumerDoc = {
      provider: {
        ollama: {
          npm: "@ai-sdk/openai-compatible",
          name: "Ollama (Local)",
          options: { baseURL: "http://localhost:11434/v1" },
        },
      },
      plugins: [".opencode/plugin/gateguard.js"],
      customKey: "consumer-value",
    };
    fs.writeFileSync(consumerPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

    const ws1: WriteSet = { writes: [] };
    writeTier2JsonContained(templatePath, consumerPath, false, ws1);
    expect(ws1.writes).toHaveLength(0); // already contained — no-op

    const ws2: WriteSet = { writes: [] };
    writeTier2JsonContained(templatePath, consumerPath, false, ws2);
    expect(ws2.writes).toHaveLength(0); // still no-op
  });
});

// ---------------------------------------------------------------------------
// seeded bkit-mode.sh deletion advisory (sub-plan 4 Task 6.3)
// Any seeded .bkit/scripts/bkit-mode.sh on disk triggers the deletion advisory,
// NOT silent preservation — bkit has no ccr router lane.
// ---------------------------------------------------------------------------

function makeModuleCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
  const advisories: PreflightFinding[] = [];
  const ws: WriteSet = { writes: [] };
  return {
    dryRun: false,
    tokens: {
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "owner/test-project",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    opencodeProvider: null,
    advisories,
    ws,
    logPrefix: "[test]",
    postDispatch: [],
    issueTracker: "none",
    cloudVariant: null,
    ...overrides,
  };
}

describe("bkit-mode.sh deletion advisory (Task 6.3 upgrade-migration)", () => {
  it("ANY seeded .bkit/scripts/bkit-mode.sh triggers deletion advisory, NOT silent preservation", () => {
    // Seed the consumer-side .bkit/scripts/bkit-mode.sh to simulate a prior install
    const modeShDir = path.join(tmpDir, ".bkit", "scripts");
    fs.mkdirSync(modeShDir, { recursive: true });
    const modeShPath = path.join(modeShDir, "bkit-mode.sh");
    fs.writeFileSync(modeShPath, "# seeded bkit-mode.sh from prior install", "utf-8");

    const advisories: PreflightFinding[] = [];
    const ctx = makeModuleCtx({ advisories, dryRun: true });

    // Change to tmpDir so fs.existsSync(".bkit/scripts/bkit-mode.sh") finds the file
    const originalCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      runClaudeModule(ctx);
    } finally {
      process.chdir(originalCwd);
    }

    // The deletion advisory MUST be present
    const deletionAdvisory = advisories.find((a) => a.id === "bkit-mode-sh-deletion-required");
    expect(
      deletionAdvisory,
      "expected bkit-mode-sh-deletion-required advisory to be emitted for seeded bkit-mode.sh",
    ).toBeDefined();

    // Advisory MUST NOT contain ccr/bkit mode/ollama/openrouter router framing
    const actionText = deletionAdvisory!.action ?? "";
    expect(actionText, "advisory must not reference ccr").not.toContain("ccr");
    expect(actionText, "advisory must not reference bkit mode command").not.toContain(
      "bkit mode --",
    );
    expect(actionText, "advisory must not reference ollama router framing").not.toMatch(
      /--local=ollama/,
    );
    expect(actionText, "advisory must not reference openrouter router framing").not.toMatch(
      /--cloud=openrouter/,
    );

    // Advisory MUST name the shell-rc source line removal step
    expect(actionText, "advisory must mention shell rc removal").toMatch(/zshrc|bashrc|shell rc/i);

    // Advisory MUST point at the replacement
    expect(actionText, "advisory must mention bkit install --opencode").toContain(
      "bkit install --opencode",
    );
  });

  it("no deletion advisory when .bkit/scripts/bkit-mode.sh is absent", () => {
    // Do NOT create the file in tmpDir
    const advisories: PreflightFinding[] = [];
    const ctx = makeModuleCtx({ advisories, dryRun: true });

    const originalCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      runClaudeModule(ctx);
    } finally {
      process.chdir(originalCwd);
    }

    const deletionAdvisory = advisories.find((a) => a.id === "bkit-mode-sh-deletion-required");
    expect(deletionAdvisory, "no advisory expected when file is absent").toBeUndefined();
  });
});
