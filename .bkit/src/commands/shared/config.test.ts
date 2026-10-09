import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { CONFIG_DEFAULTS, readBkitConfig } from "./config";
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
      ciWorkflow: "test.yml",
      capstoneJob: "decide",
      worktreeCopy: [".env", "apps/web/.env.preview"],
      worktreeInstall: false,
      issueTracker: "linear",
      githubProject: { number: 1 },
      shipGateRequiredLanes: ["bkit-tests-e2e"],
    });
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
