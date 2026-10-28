import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ASK_POINTS,
  CONFIG_DEFAULTS,
  invalidAskSettings,
  invalidTaskCaps,
  readBkitConfig,
} from "./settings";
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
            testing: {
              ciWorkflow: "test.yml",
              ciCapstone: "decide",
              shipGate: ["bkit-tests-e2e", ""],
            },
            workflows: { worktree: { copy: [".env", "apps/web/.env.preview"], install: false } },
            tracker: {
              default: "linear",
              github: { project: "https://github.com/users/me/projects/1/views/2", review: "QA" },
            },
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

  it.each(["github", "linear", "jira", "none"])("reads tracker.default %s", (tracker) => {
    const cfg = readBkitConfig(root(JSON.stringify({ bkit: { tracker: { default: tracker } } })));
    expect(cfg.issueTracker).toBe(tracker);
    expect(cfg.issueTrackerExplicit).toBe(true);
  });

  it("reads an unsupported tracker.default as the default", () => {
    const cfg = readBkitConfig(root(JSON.stringify({ bkit: { tracker: { default: "asana" } } })));
    expect(cfg.issueTracker).toBe(CONFIG_DEFAULTS.issueTracker);
  });

  it("reads the per-moment tracker states, defaulting each missing or blank one", () => {
    const cfg = readBkitConfig(
      root(
        JSON.stringify({
          bkit: {
            tracker: {
              linear: { team: " ENG ", project: "Mobile app", review: "Code Review" },
              jira: {
                site: "https://acme.atlassian.net/",
                project: "MBA",
                progress: " Doing ",
                review: "",
              },
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
    const wrong = readBkitConfig(
      root(JSON.stringify({ bkit: { tracker: { linear: "x", jira: [1] } } })),
    );
    expect(wrong.linear).toEqual(CONFIG_DEFAULTS.linear);
    expect(wrong.jira).toEqual(CONFIG_DEFAULTS.jira);
  });

  it("reads the opencode provider, the installed providers and the cloud variant", () => {
    const cfg = readBkitConfig(
      root(
        JSON.stringify({
          bkit: {
            providers: {
              opencode: { default: "opencode-go", installed: ["openrouter", "opencode-go"] },
            },
            cloud: { agent: "claude" },
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
      readBkitConfig(root(JSON.stringify({ bkit: { providers: { opencode: { default: v } } } })))
        .opencodeProvider;
    expect(provider("not-a-provider")).toBeNull();
    expect(provider("")).toBeNull();
    expect(provider(7)).toBeNull();
    expect(provider(["openrouter"])).toBeNull();
  });

  it("keeps only supported provider names in providers.opencode.installed, and reads a non-array as none", () => {
    const providers = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { providers: { opencode: { installed: v } } } })))
        .opencodeProviders;
    expect(providers(["ollama", "bogus", 3, null, "opencode-zen"])).toEqual([
      "ollama",
      "opencode-zen",
    ]);
    expect(providers("ollama")).toEqual([]);
    expect(providers({ 0: "ollama" })).toEqual([]);
  });

  it("falls back to the default cloud variant on an unknown or wrongly typed cloud.agent", () => {
    const cloud = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { cloud: { agent: v } } })));
    expect(cloud("cursor").cloudAgents).toBe("cursor");
    expect(cloud("opencode").cloudAgents).toBe("opencode");
    expect(cloud("none").cloudAgents).toBe("none");
    expect(cloud("gitlab").cloudAgents).toBe(CONFIG_DEFAULTS.cloudAgents);
    expect(cloud(true).cloudAgents).toBe(CONFIG_DEFAULTS.cloudAgents);
  });

  it("reads the dependency updater as renovate, dependabot or none; anything else is unset", () => {
    const updater = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { dependencies: { updater: v } } }))).depUpdater;
    expect(updater("renovate")).toBe("renovate");
    expect(updater("dependabot")).toBe("dependabot");
    expect(updater("none")).toBe("none");
    expect(updater("")).toBeNull();
    expect(updater("Renovate")).toBeNull();
    expect(updater(true)).toBeNull();
    expect(readBkitConfig(root('{"bkit":{}}')).depUpdater).toBeNull();
  });

  it("tells an explicitly set tracker.default and cloud.agent from an absent or empty one, whatever the value", () => {
    const explicit = (bkit: unknown) => {
      const cfg = readBkitConfig(root(JSON.stringify({ bkit })));
      return [cfg.issueTrackerExplicit, cfg.cloudAgentsExplicit];
    };
    expect(explicit({})).toEqual([false, false]);
    expect(explicit(null)).toEqual([false, false]);
    expect(explicit({ tracker: { default: "none" }, cloud: { agent: "none" } })).toEqual([
      true,
      true,
    ]);
    expect(explicit({ tracker: { default: 5 } })).toEqual([true, false]);
    expect(explicit({ cloud: { agent: "bogus" } })).toEqual([false, true]);
    expect(explicit({ tracker: { default: null } })).toEqual([true, false]);
    expect(explicit({ tracker: { default: "" }, cloud: { agent: "" } })).toEqual([false, false]);
  });

  it("reports nothing explicit without package.json or with unparseable JSON", () => {
    for (const dir of [root(), root("{nope"), root("[]")]) {
      const cfg = readBkitConfig(dir);
      expect(cfg.issueTrackerExplicit).toBe(false);
      expect(cfg.cloudAgentsExplicit).toBe(false);
    }
  });

  it("reads workflows.minFreeGb as a number 0 or more, else the default", () => {
    const minFree = (workflows: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { workflows } }))).diskMinFreeGb;
    expect(minFree({ minFreeGb: 80 })).toBe(80);
    expect(minFree({ minFreeGb: 0 })).toBe(0);
    for (const bad of [{ minFreeGb: -1 }, { minFreeGb: "80" }, { minFreeGb: null }, {}, 5, null])
      expect(minFree(bad)).toBe(CONFIG_DEFAULTS.diskMinFreeGb);
  });

  it("reads tracker.github.project as a board, false as an opt-out, anything else as not configured", () => {
    const project = (value: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { tracker: { github: { project: value } } } })))
        .github;
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
          bkit: {
            testing: { ciWorkflow: "", ciCapstone: 3 },
            workflows: { worktree: { copy: [".env", 1], install: "yes" } },
          },
        }),
      ),
    );
    expect(cfg).toEqual(CONFIG_DEFAULTS);
  });

  it("keeps only non-empty string lanes, and reads a non-array testing.shipGate as none", () => {
    const lanes = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { testing: { shipGate: v } } })))
        .shipGateRequiredLanes;
    expect(lanes(["bkit-tests-unit", 42, null])).toEqual(["bkit-tests-unit"]);
    expect(lanes("bkit-tests-unit")).toEqual([]);
  });

  it("reads testing.minPushPaths as non-empty strings, keeps an explicit [], else the default", () => {
    const book = (v: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { testing: { minPushPaths: v } } }))).minPushPaths;
    expect(book(["docs/plans/**", "", 3])).toEqual(["docs/plans/**"]);
    expect(book([])).toEqual([]);
    for (const bad of ["docs/plans/**", null, { 0: "docs/**" }])
      expect(book(bad)).toEqual(CONFIG_DEFAULTS.minPushPaths);
    expect(CONFIG_DEFAULTS.minPushPaths.some((p) => /^docs\/\*\*/.test(p))).toBe(false);
  });

  it("asks at every point with 2 attempts by default, and 6 turns for the grill", () => {
    const asks = readBkitConfig(root()).asks;
    expect(Object.keys(asks)).toEqual([...ASK_POINTS]);
    expect(asks["design.grill"]).toEqual({ ask: true, max: 6 });
    for (const p of ASK_POINTS.slice(1)) expect(asks[p]).toEqual({ ask: true, max: 2 });
  });

  it("reads each ask point's ask and limit, falling back per key", () => {
    const asks = (workflows: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { workflows } }))).asks;
    const set = asks({
      design: { grill: { ask: false, maxTurns: 4 } },
      build: { verify: { ask: false, maxAttempts: 3 }, tests: { maxAttempts: 0, ask: "no" } },
      debug: { fix: 5 },
      ship: { merge: { ask: false } },
    });
    expect(set["design.grill"]).toEqual({ ask: false, max: 4 });
    expect(set["build.verify"]).toEqual({ ask: false, max: 3 });
    expect(set["build.tests"]).toEqual({ ask: true, max: 2 });
    expect(set["debug.fix"]).toEqual({ ask: true, max: 2 });
    expect(set["ship.merge"]).toEqual({ ask: false, max: 2 });
    // The grill counts turns, not attempts: maxAttempts on it is ignored.
    expect(asks({ design: { grill: { maxAttempts: 9 } } })["design.grill"].max).toBe(6);
  });

  it("names each invalid ask setting by its dotted key", () => {
    expect(
      invalidAskSettings({
        build: { verify: { ask: "yes", maxAttempts: 2.5 }, tests: 3 },
        design: { grill: { maxTurns: 0 } },
      }),
    ).toEqual([
      "design.grill.maxTurns",
      "build.verify.ask",
      "build.verify.maxAttempts",
      "build.tests",
    ]);
    expect(invalidAskSettings({})).toEqual([]);
  });

  it("tasks defaults to 3, 15, 10 and 3", () => {
    const want = {
      maxPerGroup: 3,
      maxTestsPerGroup: 15,
      maxTestsPerTask: 10,
      maxTestFilesPerTask: 3,
    };
    expect(CONFIG_DEFAULTS.tasks).toEqual(want);
    expect(readBkitConfig(root()).tasks).toEqual(want);
    expect(readBkitConfig(root(JSON.stringify({ bkit: {} }))).tasks).toEqual(want);
    const set = {
      maxPerGroup: 4,
      maxTestsPerGroup: 20,
      maxTestsPerTask: 12,
      maxTestFilesPerTask: 4,
    };
    expect(
      readBkitConfig(root(JSON.stringify({ bkit: { workflows: { tasks: set } } }))).tasks,
    ).toEqual(set);
  });

  it("tasks falls back on an invalid value", () => {
    const caps = (tasks: unknown) =>
      readBkitConfig(root(JSON.stringify({ bkit: { workflows: { tasks } } }))).tasks;
    for (const bad of [0, -1, 2.5, "4", null, true, [4]])
      expect(caps({ maxPerGroup: bad, maxTestsPerTask: 12 })).toEqual({
        ...CONFIG_DEFAULTS.tasks,
        maxTestsPerTask: 12,
      });
    for (const bad of ["x", 4, null, [1]]) expect(caps(bad)).toEqual(CONFIG_DEFAULTS.tasks);
    expect(
      invalidTaskCaps({ maxPerGroup: 0, maxTestsPerGroup: 20, maxTestFilesPerTask: "3" }),
    ).toEqual(["maxPerGroup", "maxTestFilesPerTask"]);
    expect(invalidTaskCaps(undefined)).toEqual([]);
    expect(invalidTaskCaps(7)).toEqual(["tasks"]);
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
