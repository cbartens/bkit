import { describe, expect, it } from "vitest";

import {
  COULD_NOT_RUN_EXIT_CODES,
  LOCKFILE_REGENERATE,
  PACKAGE_RUNNER,
  installCommand,
  scriptCommand,
} from "./package-manager";

describe("shared/package-manager", () => {
  it("runs package scripts and installs with pnpm", () => {
    expect(PACKAGE_RUNNER).toBe("pnpm");
    expect(scriptCommand("bkit:gate:static-unit")).toEqual(["pnpm", "bkit:gate:static-unit"]);
  });

  it("a frozen install refuses to change the lockfile; an unfrozen one may", () => {
    expect(installCommand({ frozen: true })).toEqual(["pnpm", "install", "--frozen-lockfile"]);
    expect(installCommand({ frozen: false })).toEqual(["pnpm", "install"]);
  });

  it("regenerates the pnpm lockfile without touching node_modules", () => {
    expect(LOCKFILE_REGENERATE["pnpm-lock.yaml"]).toEqual(["pnpm", "install", "--lockfile-only"]);
  });

  it("every lockfile entry is a non-empty argv of plain words", () => {
    for (const [lockfile, argv] of Object.entries(LOCKFILE_REGENERATE)) {
      expect(argv.length, lockfile).toBeGreaterThan(0);
      for (const word of argv) expect(word, lockfile).toMatch(/^[A-Za-z0-9=._-]+$/);
    }
  });

  it("126 and 127 mean the command could not run; ordinary failures do not", () => {
    expect([...COULD_NOT_RUN_EXIT_CODES].sort()).toEqual([126, 127]);
    for (const code of [0, 1, 2, 128]) expect(COULD_NOT_RUN_EXIT_CODES.has(code)).toBe(false);
  });
});
