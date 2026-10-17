import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectInstalledHostModules } from "./hosts";

describe("detectInstalledHostModules — installed host detection", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-detect-hosts-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("returns an empty set when no host agents dir exists (never seeds core)", () => {
    expect(detectInstalledHostModules(cwd).size).toBe(0);
  });

  it("detects only the hosts whose agents dir is present", () => {
    fs.mkdirSync(path.join(cwd, ".claude", "agents"), { recursive: true });
    fs.mkdirSync(path.join(cwd, ".opencode", "agents"), { recursive: true });
    expect([...detectInstalledHostModules(cwd)].sort()).toEqual(["claude", "opencode"]);
  });

  it("detects antigravity by its plugin manifest", () => {
    fs.mkdirSync(path.join(cwd, ".agents", "plugins", "bkit"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".agents", "plugins", "bkit", "plugin.json"), "{}");
    expect([...detectInstalledHostModules(cwd)]).toEqual(["antigravity"]);
  });

  it.each([
    ["hooks.json", "file"],
    ["agents", "dir"],
    ["skills", "dir"],
    ["hooks", "dir"],
  ])("detects antigravity from %s when the plugin manifest is gone", (rel, kind) => {
    const abs = path.join(cwd, ".agents", "plugins", "bkit", rel);
    if (kind === "dir") {
      fs.mkdirSync(abs, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, "{}");
    }
    expect([...detectInstalledHostModules(cwd)]).toEqual(["antigravity"]);
  });

  it("does not detect antigravity from a consumer plugin beside bkit's", () => {
    fs.mkdirSync(path.join(cwd, ".agents", "plugins", "other", "agents"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".agents", "plugins", "other", "plugin.json"), "{}");
    expect(detectInstalledHostModules(cwd).size).toBe(0);
  });
});
