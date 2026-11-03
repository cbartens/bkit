import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach } from "vitest";

/** Consumer scripts run normally; the package-manager boundary stays offline. */
export function useGateRunner(marker?: string): void {
  let directory = "";
  let savedPath: string | undefined;
  let savedMarker: string | undefined;
  beforeEach(() => {
    savedPath = process.env.PATH;
    savedMarker = process.env.BKIT_TEST_GATE_MARKER;
    if (marker === undefined) delete process.env.BKIT_TEST_GATE_MARKER;
    else process.env.BKIT_TEST_GATE_MARKER = marker;
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gate-runner-"));
    fs.symlinkSync(
      fileURLToPath(new URL("./tests/fixtures/gates/pnpm.cjs", import.meta.url)),
      path.join(directory, "pnpm"),
    );
    process.env.PATH = `${directory}${path.delimiter}${savedPath ?? ""}`;
  });
  afterEach(() => {
    process.env.PATH = savedPath;
    if (savedMarker === undefined) delete process.env.BKIT_TEST_GATE_MARKER;
    else process.env.BKIT_TEST_GATE_MARKER = savedMarker;
    fs.rmSync(directory, { recursive: true, force: true });
  });
}

/** A minimal consumer still declares gates and verifies it is inside its checkout. */
export const gatePackage = {
  scripts: {
    "bkit:gate:min": "git rev-parse --verify HEAD >/dev/null",
    "bkit:gate:static-unit": "git rev-parse --verify HEAD >/dev/null",
  },
};
