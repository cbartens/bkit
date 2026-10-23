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
            github: { project: "https://github.com/users/me/projects/1/views/2", review: "QA" },
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
      github: {
        project: { ownerType: "user", owner: "me", number: 1 },
        projectUrl: "https://github.com/users/me/projects/1/views/2",
        progress: "In progress",
        review: "QA",
      },
      shipGateRequiredLanes: ["bkit-tests-e2e"],
    });
  });

  it.each(["github", "linear", "jira", "none"])("reads issueTracker %s", (tracker) => {
    const cfg = readBkitConfig(root(JSON.stringify({ bkit: { issueTracker: tracker } })));
    expect(cfg.issueTracker).toBe(tracker);
    expect(cfg.issueTrackerExplicit).toBe(true);
  });

  it("reads an unsupported issueTracker as the default", () => {
    const cfg = readBkitConfig(root(JSON.stringify({ bkit: { issueTracker: "asana" } })));
    expect(cfg.issueTracker).toBe(CONFIG_DEFAULTS.issueTracker);
  });

  it("reads the per-moment tracker states, defaulting each missing or blank one", () => {
    const cfg = readBkitConfig(
      root(
        JSON.stringify({
          bkit: {
            linear: { team: " ENG ", project: "Mobile app", review: "Code Review" },
            jira: {
              site: "https://acme.atlassian.net/",
              project: "MBA",
              progress: " Doing ",
              review: "",
            },
          },
        }),
      ),
    );
    expect(cfg.linear).toEqual({
      team: "ENG",
      project: "Mobile app",
      progress: "started",
      review: "Code Review",
    });
    expect(cfg.jira).toEqual({
      site: "https://acme.atlassian.net",
      project: "MBA",
      progress: "Doing",
      review: "In Review",
    });
    const wrong = readBkitConfig(root(JSON.stringify({ bkit: { linear: "x", jira: [1] } })));
    expect(wrong.linear).toEqual(CONFIG_DEFAULTS.linear);
    expect(wrong.jira).toEqual(CONFIG_DEFAULTS.jira);
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

  it("reads disk.minFreeGb as a number 0 or more, else the default", () => {
    const minFree = (disk: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { disk } }))).diskMinFreeGb;
    expect(minFree({ minFreeGb: 80 })).toBe(80);
    expect(minFree({ minFreeGb: 0 })).toBe(0);
    for (const bad of [{ minFreeGb: -1 }, { minFreeGb: "80" }, { minFreeGb: null }, {}, 5, null])
      expect(minFree(bad)).toBe(CONFIG_DEFAULTS.diskMinFreeGb);
  });

  it("reads github.project as a board, false as an opt-out, anything else as not configured", () => {
    const project = (value: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { github: { project: value } } }))).github;
    expect(project("https://github.com/orgs/acme/projects/7").project).toEqual({
      ownerType: "org",
      owner: "acme",
      number: 7,
    });
    expect(project(false)).toMatchObject({ project: false, projectUrl: null });
    for (const bad of [
      "https://github.com/acme/web",
      "https://github.com/orgs/acme/projects/0",
      "http://github.com/orgs/acme/projects/7",
    ])
      expect(project(bad)).toMatchObject({ project: null, projectUrl: bad });
    for (const unset of [undefined, "", 7, true, { owner: "acme", number: 7 }])
      expect(project(unset)).toMatchObject({ project: null, projectUrl: null });
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

  it("reads minPushPaths as non-empty strings, keeps an explicit [], else the default", () => {
    const book = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { minPushPaths: v } }))).minPushPaths;
    expect(book(["docs/plans/**", "", 3])).toEqual(["docs/plans/**"]);
    expect(book([])).toEqual([]);
    for (const bad of ["docs/plans/**", null, { 0: "docs/**" }])
      expect(book(bad)).toEqual(CONFIG_DEFAULTS.minPushPaths);
    expect(CONFIG_DEFAULTS.minPushPaths.some((p) => /^docs\/\*\*/.test(p))).toBe(false);
  });

  it("reads loopPause as a boolean, else true", () => {
    const pause = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { loopPause: v } }))).loopPause;
    expect(pause(false)).toBe(false);
    expect(pause(true)).toBe(true);
    for (const bad of ["yes", "false", 1, 0, null]) expect(pause(bad)).toBe(true);
    expect(readBkitConfig(root(JSON.stringify({ bkit: {} }))).loopPause).toBe(true);
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
