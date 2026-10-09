import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { TIMEOUTS } from "./timeouts";

const SHELL = path.resolve(__dirname, "../../../templates/.bkit/scripts/bkit-ship-timeouts.sh");

describe("TIMEOUTS", () => {
  // Retire with bkit-ship-timeouts.sh: until then the shell blocks and the commands
  // must wait the same number of seconds.
  it.skipIf(!fs.existsSync(SHELL))("holds every constant bkit-ship-timeouts.sh defines", () => {
    const shell = Object.fromEntries(
      fs
        .readFileSync(SHELL, "utf-8")
        .split("\n")
        .map((l) => /^([A-Z][A-Z0-9_]*)=([0-9]+)$/.exec(l.trim()))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m) => [m[1]!, Number(m[2])]),
    );
    expect(Object.keys(shell).length).toBeGreaterThan(0);
    expect(TIMEOUTS).toEqual(shell);
  });
});
