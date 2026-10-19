// commands/install/doctor.test.ts — Unit tests for `bkit status`.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { formatOpencodeModelPins, readOpencodeModelPins, runStatus } from "./doctor";

describe("runStatus — read-only host/provider status", () => {
  let cwd: string;
  let logSpy: MockInstance<typeof console.log>;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-status-"));
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    logSpy.mockRestore();
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const out = () => logSpy.mock.calls.map((c) => String(c[0])).join("\n");

  it("reports every host absent for an empty dir", () => {
    runStatus(cwd, "[bkit]");
    expect(out()).toContain("claude:  absent");
    expect(out()).toContain("cursor:  absent");
    // Codex presence is probed in the cwd argument, never process.cwd().
    expect(out()).toContain("codex:   absent");
    expect(out()).toMatch(/opencode: absent/);
    expect(out()).toContain("Installed hosts: none");
  });

  it("reports installed hosts, the claude model from settings, and a multi-provider opencode line", () => {
    fs.mkdirSync(path.join(cwd, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, ".claude", "settings.json"),
      JSON.stringify({ model: "claude-opus-4-8" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(cwd, ".cursor"), { recursive: true });
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, ".opencode", "opencode.json"),
      JSON.stringify({ model: "openrouter/foo" }),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { opencodeProviders: ["openrouter", "openrouter"] } }),
      "utf-8",
    );
    runStatus(cwd, "[bkit]");
    const o = out();
    expect(o).toContain("claude:  INSTALLED");
    expect(o).toContain("claude-opus-4-8");
    expect(o).toContain("cursor:  INSTALLED");
    expect(o).toContain("opencode: INSTALLED");
    expect(o).toContain("providers:"); // plural label for >1 provider
    expect(o).toContain("(active)");
    expect(o).toContain("Installed hosts: claude, cursor, opencode");
  });

  it("surfaces a parse-error for a malformed opencode.json", () => {
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".opencode", "opencode.json"), "{ bad", "utf-8");
    runStatus(cwd, "[bkit]");
    expect(out()).toContain("opencode.json: parse-error");
  });

  const writeAgent = (name: string, model: string | null): void => {
    const dir = path.join(cwd, ".opencode", "agents");
    fs.mkdirSync(dir, { recursive: true });
    const modelLine = model === null ? "" : `model: ${model}\n`;
    fs.writeFileSync(
      path.join(dir, name),
      `---\nmode: subagent\nname: ${name}\n${modelLine}---\n\nBody.\n`,
      "utf-8",
    );
  };

  it("reports the per-agent model pins rendered into .opencode/agents/", () => {
    writeAgent("bkit-a.md", "openrouter/deepseek/deepseek-v4.1-flash");
    writeAgent("bkit-b.md", "openrouter/deepseek/deepseek-v4.1-flash");
    writeAgent("bkit-c.md", "openrouter/moonshotai/kimi-k3");
    writeAgent("bkit-d.md", null);
    fs.writeFileSync(path.join(cwd, ".opencode", "opencode.json"), "{}", "utf-8");
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({
        bkit: { opencodeProvider: "openrouter", opencodeProviders: ["openrouter"] },
      }),
      "utf-8",
    );
    runStatus(cwd, "[bkit]");
    const o = out();
    expect(o).toContain(
      "opencode: INSTALLED  (provider: openrouter / models: openrouter/deepseek/deepseek-v4.1-flash (2 agents), openrouter/moonshotai/kimi-k3 (1 agent))",
    );
    expect(o).not.toContain("unknown");
  });

  it("names the single pin, and opencode.json's own default model when set", () => {
    writeAgent("bkit-a.md", "opencode-go/kimi-k3");
    fs.writeFileSync(
      path.join(cwd, ".opencode", "opencode.json"),
      JSON.stringify({ model: "opencode-go/glm-5.3" }),
      "utf-8",
    );
    runStatus(cwd, "[bkit]");
    expect(out()).toContain("model: opencode-go/kimi-k3; default model: opencode-go/glm-5.3");
  });

  it("says no pin is rendered when .opencode/agents/ carries none", () => {
    fs.mkdirSync(path.join(cwd, ".opencode"), { recursive: true });
    runStatus(cwd, "[bkit]");
    expect(out()).toContain("model: none pinned in .opencode/agents/");
  });
});

describe("readOpencodeModelPins / formatOpencodeModelPins", () => {
  it("groups pins by model, most-used first, ties by id", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-pins-"));
    try {
      const dir = path.join(cwd, ".opencode", "agents");
      fs.mkdirSync(dir, { recursive: true });
      const pin = (f: string, m: string) =>
        fs.writeFileSync(path.join(dir, f), `---\nmodel: ${m}\n---\n`, "utf-8");
      pin("a.md", "p/z");
      pin("b.md", "p/y");
      pin("c.md", "p/y");
      pin("d.md", "p/x");
      fs.writeFileSync(path.join(dir, "notes.txt"), "model: p/ignored\n", "utf-8");
      const pins = readOpencodeModelPins(cwd);
      expect(pins).toEqual([
        { model: "p/y", agents: 2 },
        { model: "p/x", agents: 1 },
        { model: "p/z", agents: 1 },
      ]);
      expect(formatOpencodeModelPins(pins)).toBe(
        "models: p/y (2 agents), p/x (1 agent), p/z (1 agent)",
      );
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("returns [] when .opencode/agents/ is absent", () => {
    expect(readOpencodeModelPins(path.join(os.tmpdir(), "bkit-no-such-dir-xyz"))).toEqual([]);
  });
});
