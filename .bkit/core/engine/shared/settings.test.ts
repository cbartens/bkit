import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { CONFIG_DEFAULTS, readBkitConfig } from "./settings";
import {
  LOCKFILE_REGENERATE,
  PACKAGE_RUNNER,
  installCommand,
  scriptCommand,
} from "./package-manager";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function root(pkg?: string) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-config-"));
  dirs.push(d);
  if (pkg !== undefined) fs.writeFileSync(path.join(d, "package.json"), pkg);
  return d;
}

describe("readBkitConfig", () => {
  it("defaults every key without package.json, without a bkit key, or with unparseable JSON", () => {
    expect(readBkitConfig(root())).toEqual(CONFIG_DEFAULTS);
    expect(readBkitConfig(root('{"name":"x"}'))).toEqual(CONFIG_DEFAULTS);
    expect(readBkitConfig(root("{nope"))).toEqual(CONFIG_DEFAULTS);
  });

  it("reads each key", () => {
    const cfg = readBkitConfig(
      root(
        JSON.stringify({
          bkit: {
            ciWorkflow: "test.yml",
            capstoneJob: "decide",
            worktree: { copy: [".env", "apps/web/.env.preview"], install: false },
            issueTracker: "linear",
            githubProject: { number: 1 },
            shipGateRequiredLanes: ["bkit-tests-e2e", ""],
          },
        }),
      ),
    );
    expect(cfg).toEqual({
      ...CONFIG_DEFAULTS,
      ciWorkflow: "test.yml",
      capstoneJob: "decide",
      worktreeCopy: [".env", "apps/web/.env.preview"],
      worktreeInstall: false,
      issueTracker: "linear",
      issueTrackerExplicit: true,
      githubProject: { number: 1 },
      shipGateRequiredLanes: ["bkit-tests-e2e"],
    });
  });

  it("reads the opencode provider, the installed providers and the cloud variant", () => {
    const cfg = readBkitConfig(
      root(
        JSON.stringify({
          bkit: {
            opencodeProvider: "opencode-go",
            opencodeProviders: ["openrouter", "opencode-go"],
            cloudAgents: "claude",
          },
        }),
      ),
    );
    expect(cfg.opencodeProvider).toBe("opencode-go");
    expect(cfg.opencodeProviders).toEqual(["openrouter", "opencode-go"]);
    expect(cfg.cloudAgents).toBe("claude");
    expect(cfg.cloudAgentsExplicit).toBe(true);
  });

  it("reads an unsupported or wrongly typed opencode provider as none", () => {
    const provider = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { opencodeProvider: v } }))).opencodeProvider;
    expect(provider("not-a-provider")).toBeNull();
    expect(provider("")).toBeNull();
    expect(provider(7)).toBeNull();
    expect(provider(["openrouter"])).toBeNull();
  });

  it("keeps only supported provider names in opencodeProviders, and reads a non-array as none", () => {
    const providers = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { opencodeProviders: v } }))).opencodeProviders;
    expect(providers(["ollama", "bogus", 3, null, "opencode-zen"])).toEqual([
      "ollama",
      "opencode-zen",
    ]);
    expect(providers("ollama")).toEqual([]);
    expect(providers({ 0: "ollama" })).toEqual([]);
  });

  it("falls back to the default cloud variant on an unknown or wrongly typed cloudAgents", () => {
    const cloud = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { cloudAgents: v } })));
    expect(cloud("cursor").cloudAgents).toBe("cursor");
    expect(cloud("opencode").cloudAgents).toBe("opencode");
    expect(cloud("none").cloudAgents).toBe("none");
    expect(cloud("gitlab").cloudAgents).toBe(CONFIG_DEFAULTS.cloudAgents);
    expect(cloud(true).cloudAgents).toBe(CONFIG_DEFAULTS.cloudAgents);
  });

  it("opts out of the dependency-updater advisory only on the exact string none", () => {
    const optOut = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { depUpdater: v } }))).depUpdaterOptOut;
    expect(optOut("none")).toBe(true);
    expect(optOut("renovate")).toBe(false);
    expect(optOut("None")).toBe(false);
    expect(optOut(true)).toBe(false);
    expect(readBkitConfig(root('{"bkit":{}}')).depUpdaterOptOut).toBe(false);
  });

  it("tells an explicitly set issueTracker and cloudAgents from an absent one, whatever the value", () => {
    const explicit = (bkit: unknown) => {
      const cfg = readBkitConfig(root(JSON.stringify({ bkit })));
      return [cfg.issueTrackerExplicit, cfg.cloudAgentsExplicit];
    };
    expect(explicit({})).toEqual([false, false]);
    expect(explicit(null)).toEqual([false, false]);
    expect(explicit({ issueTracker: "none", cloudAgents: "none" })).toEqual([true, true]);
    expect(explicit({ issueTracker: 5 })).toEqual([true, false]);
    expect(explicit({ cloudAgents: "bogus" })).toEqual([false, true]);
    expect(explicit({ issueTracker: null })).toEqual([true, false]);
  });

  it("reports nothing explicit without package.json or with unparseable JSON", () => {
    for (const dir of [root(), root("{nope"), root("[]")]) {
      const cfg = readBkitConfig(dir);
      expect(cfg.issueTrackerExplicit).toBe(false);
      expect(cfg.cloudAgentsExplicit).toBe(false);
    }
  });

  it("keeps githubProject false as an opt-out, apart from not configured", () => {
    expect(
      readBkitConfig(root(JSON.stringify({ bkit: { githubProject: false } }))).githubProject,
    ).toBe(false);
  });

  it("falls back per key on a wrongly typed value", () => {
    const cfg = readBkitConfig(
      root(
        JSON.stringify({
          bkit: { ciWorkflow: "", capstoneJob: 3, worktree: { copy: [".env", 1], install: "yes" } },
        }),
      ),
    );
    expect(cfg).toEqual(CONFIG_DEFAULTS);
  });

  it("keeps only non-empty string lanes, and reads a non-array shipGateRequiredLanes as none", () => {
    const lanes = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { shipGateRequiredLanes: v } })))
        .shipGateRequiredLanes;
    expect(lanes(["bkit-tests-unit", 42, null])).toEqual(["bkit-tests-unit"]);
    expect(lanes("bkit-tests-unit")).toEqual([]);
  });
});

describe("package manager", () => {
  it("builds script and install commands from the one runner", () => {
    expect(scriptCommand("bkit:gate:static-unit")).toEqual([
      PACKAGE_RUNNER,
      "bkit:gate:static-unit",
    ]);
    expect(installCommand({ frozen: true })).toEqual([
      PACKAGE_RUNNER,
      "install",
      "--frozen-lockfile",
    ]);
    expect(installCommand({ frozen: false })).toEqual([PACKAGE_RUNNER, "install"]);
    expect(LOCKFILE_REGENERATE["pnpm-lock.yaml"]![0]).toBe(PACKAGE_RUNNER);
  });
});
