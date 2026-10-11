// install/write.integration.test.ts — Integration tests for the managed-JSON writer.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WriteSet } from "./write";
import { writeTier2JsonContained } from "./write";

// ---------------------------------------------------------------------------
// modules-upgrade
// ---------------------------------------------------------------------------
// modules-upgrade — upgrade survival of consumer keys
//
// Tests that consumer-added keys in .claude/settings.json, .cursor/hooks.json and
// .opencode/opencode.json survive writeTier2JsonContained.
//
// Fixture: tests/fixtures/heavy-customised-consumer/
describe("modules-upgrade", () => {
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  let tmpDir: string;
  let originalCwd: string;

  const FIXTURE_DIR = path.resolve(
    __dirname,
    "../../../../tests/fixtures/heavy-customised-consumer",
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
  // Heavy-customised consumer fixture survival (BAR-131 fixture)
  // Task 9: heavy-customised consumer fixture survival
  // ---------------------------------------------------------------------------

  describe("heavy-customised consumer fixture — contained write", () => {
    it("fixture directory exists", () => {
      expect(fs.existsSync(FIXTURE_DIR), `Fixture missing at ${FIXTURE_DIR}`).toBe(true);
    });

    it("consumer Stop hook survives writeTier2JsonContained", () => {
      // A consumer that added its own Stop hook and a custom key
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
      const templatePath = path.resolve(__dirname, "../../../shared/.cursor/hooks.json");
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
        plugins: [".opencode/plugin/bkit-gateguard.js"],
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
        plugins: [".opencode/plugin/bkit-gateguard.js"],
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
      expect(afterDoc.plugins).toContain(".opencode/plugin/bkit-gateguard.js");
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
        plugins: [".opencode/plugin/bkit-gateguard.js"],
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
        plugins: [".opencode/plugin/bkit-gateguard.js"],
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
});
