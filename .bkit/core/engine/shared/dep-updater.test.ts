// shared/dep-updater.test.ts — which updater configs a repo holds.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectDepUpdater, findDepUpdaterConfigs } from "./dep-updater";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-dep-updater-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const write = (rel: string, body = "{}\n"): void => {
  fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, rel), body);
};

describe("findDepUpdaterConfigs", () => {
  it.each([
    "renovate.json",
    "renovate.jsonc",
    "renovate.json5",
    ".github/renovate.json",
    ".github/renovate.jsonc",
    ".github/renovate.json5",
    ".gitlab/renovate.json",
    ".gitlab/renovate.jsonc",
    ".gitlab/renovate.json5",
    ".renovaterc",
    ".renovaterc.json",
    ".renovaterc.jsonc",
    ".renovaterc.json5",
  ])("finds the Renovate config at %s", (rel) => {
    write(rel);
    expect(findDepUpdaterConfigs(tmpDir)).toEqual({ renovate: rel, dependabot: null });
  });

  it("finds a Renovate config kept under package.json renovate", () => {
    write("package.json", JSON.stringify({ name: "x", renovate: { extends: [] } }));
    expect(findDepUpdaterConfigs(tmpDir).renovate).toBe("package.json");
  });

  it("ignores a package.json renovate key that is not an object", () => {
    write("package.json", JSON.stringify({ name: "x", renovate: "yes" }));
    expect(findDepUpdaterConfigs(tmpDir).renovate).toBeNull();
  });

  it("does not take a file merely named like a Renovate config", () => {
    write(".github/renovate-local.json5");
    expect(findDepUpdaterConfigs(tmpDir).renovate).toBeNull();
  });

  it.each([".github/dependabot.yml", ".github/dependabot.yaml"])(
    "finds the Dependabot config at %s",
    (rel) => {
      write(rel, "version: 2\n");
      expect(findDepUpdaterConfigs(tmpDir)).toEqual({ renovate: null, dependabot: rel });
    },
  );
});

describe("detectDepUpdater", () => {
  it("names the one updater whose config is present", () => {
    write(".github/renovate.json5");
    expect(detectDepUpdater(tmpDir)).toBe("renovate");
  });

  it("is null when both configs are present", () => {
    write(".github/renovate.json5");
    write(".github/dependabot.yml", "version: 2\n");
    expect(detectDepUpdater(tmpDir)).toBeNull();
  });

  it("is null when neither config is present", () => {
    expect(detectDepUpdater(tmpDir)).toBeNull();
  });
});
