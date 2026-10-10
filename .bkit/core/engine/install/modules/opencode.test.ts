// install/modules/opencode.test.ts — Unit tests for the opencode module.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectOpencodeYmlProviderDrift } from "./opencode";

// ---------------------------------------------------------------------------
// Module-level mock for node:child_process
// vi.hoisted() must be called at the module top-level (once) so Vitest can hoist
// the mock declaration before imports. Individual tests use mockReset +
// mockReturnValue / mockImplementation to configure per-case behaviour.
// ---------------------------------------------------------------------------
const { execSync, execFileSync, spawnSync } = vi.hoisted(() => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
  spawnSync: vi.fn(),
}));

vi.mock("node:child_process", () => ({ execSync, execFileSync, spawnSync }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalCwd = process.cwd();
  originalEnv = { ...process.env };
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-postinstall-test-"));
  process.chdir(tmpDir);
  // Default: git resolution fails → currentBranch null → isOnProtectedBranch true
  // (fail-safe). Tests that exercise a specific branch set GITHUB_REF_NAME/BASE_REF.
  spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env = originalEnv;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  execSync.mockReset();
  execFileSync.mockReset();
  spawnSync.mockReset();
});

// ---------------------------------------------------------------------------
// detectOpencodeYmlProviderDrift — self-installed /oc handler vs installed provider
// ---------------------------------------------------------------------------

describe("detectOpencodeYmlProviderDrift", () => {
  function writeOpencodeYml(model: string | null, envVar: string | null): void {
    const wfDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(wfDir, { recursive: true });
    const lines = [
      "name: opencode",
      "jobs:",
      "  opencode:",
      "    steps:",
      "      - name: Run opencode",
      "        uses: anomalyco/opencode/github@x",
    ];
    if (envVar) {
      lines.push("        env:");
      // Concatenate the ${{ }} ref — a template literal would parse ${{ as an expression.
      lines.push("          " + envVar + ": ${{ secrets." + envVar + " }}");
    }
    if (model) {
      lines.push("        with:");
      lines.push("          model: " + model);
    }
    fs.writeFileSync(path.join(wfDir, "opencode.yml"), lines.join("\n") + "\n");
  }

  function writePkg(provider: string | null): void {
    const bkit = provider ? { bkit: { opencodeProvider: provider } } : {};
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", version: "0.0.0", ...bkit }, null, 2),
    );
  }

  it("null when opencode.yml is absent (ship-safe existence guard)", () => {
    writePkg("openrouter");
    expect(detectOpencodeYmlProviderDrift(tmpDir)).toBeNull();
  });

  it("null when in sync (handler model prefix + secret match the installed provider)", () => {
    writePkg("openrouter");
    writeOpencodeYml("openrouter/moonshotai/kimi-k3", "BKIT_OPENROUTER_API_KEY");
    expect(detectOpencodeYmlProviderDrift(tmpDir)).toBeNull();
  });

  it("flags drift when the handler is pinned to a different provider than installed", () => {
    // Installed = opencode-go (BKIT_OPENCODE_API_KEY), handler = openrouter — the real repo state.
    writePkg("opencode-go");
    writeOpencodeYml("openrouter/moonshotai/kimi-k3", "BKIT_OPENROUTER_API_KEY");
    const f = detectOpencodeYmlProviderDrift(tmpDir);
    expect(f?.id).toBe("opencode-yml-provider-drift");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("opencode-go");
    expect(f?.detect).toContain("BKIT_OPENROUTER_API_KEY");
    expect(f?.action).toContain("BKIT_OPENCODE_API_KEY");
    expect(f?.action).toContain("opencode-go/<model>");
  });

  it("flags env-var drift even when the model prefix matches", () => {
    // model prefix opencode-go matches, but the secret env var is wrong (OPENROUTER vs OPENCODE).
    writePkg("opencode-go");
    writeOpencodeYml("opencode-go/some-model", "BKIT_OPENROUTER_API_KEY");
    const f = detectOpencodeYmlProviderDrift(tmpDir);
    expect(f?.id).toBe("opencode-yml-provider-drift");
  });

  it("distinguishes the two BKIT_OPENCODE_API_KEY gateways by model prefix", () => {
    // Both opencode-zen and opencode-go use BKIT_OPENCODE_API_KEY, so only the model prefix
    // (opencode vs opencode-go) tells them apart. Installed = go, handler pinned to zen.
    writePkg("opencode-go");
    writeOpencodeYml("opencode/zen-model", "BKIT_OPENCODE_API_KEY");
    const f = detectOpencodeYmlProviderDrift(tmpDir);
    expect(f?.id).toBe("opencode-yml-provider-drift");
    expect(f?.detect).toContain("opencode-go/<model>");
  });

  it("null when bkit.opencodeProvider is not recorded (cannot determine intended provider)", () => {
    writePkg(null);
    writeOpencodeYml("openrouter/moonshotai/kimi-k3", "BKIT_OPENROUTER_API_KEY");
    expect(detectOpencodeYmlProviderDrift(tmpDir)).toBeNull();
  });
});
