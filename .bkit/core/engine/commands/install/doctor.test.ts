// commands/install/doctor.test.ts — Unit tests for `bkit status`.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { runStatus } from "./doctor";

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
    expect(out()).toContain("parse-error");
  });
});
