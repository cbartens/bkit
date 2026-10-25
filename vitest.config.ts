import * as path from "node:path";

import { defineConfig } from "vitest/config";

import { unitTimeouts } from "./vitest.timeout-budget.ts";

// `bkit tests run` hands every gate a folder in BKIT_TEST_REPORT_DIR and counts the
// failing test cases in the JUnit files written there. One file per vitest process,
// so the unit and integration runs of one gate never overwrite each other.
const reportDir = process.env.BKIT_TEST_REPORT_DIR;
const junit = reportDir
  ? {
      reporters: ["default", "junit"],
      outputFile: { junit: path.join(reportDir, `vitest-${process.pid}.xml`) },
    }
  : {};

export default defineConfig({
  test: {
    include: [
      ".bkit/core/engine/**/*.test.ts",
      ".bkit/core/engine/**/*.integration.test.ts",
      "scripts/harvest/**/*.test.ts",
    ],
    // Strip inherited GIT_* env vars in every worker so temp-repo git ops can
    // never hit the real repo when the suite runs from a git hook (see
    // vitest.setup.ts for the 2026-07-13 branch-hijack incident).
    setupFiles: ["./vitest.setup.ts"],
    // Unit-tier limits scaled to the machine's load when the config loads. This spread is
    // sampled ONCE; vitest.setup.ts re-reads the same budget as each test FILE starts, so a
    // load ramp mid-run cannot starve late files past a stale limit.
    ...unitTimeouts(),
    ...junit,
    // Report-only coverage — dogfoods the bkit-stub:coverage scaffold shipped to
    // consumers. json-summary + json are load-bearing: vitest-coverage-report-action
    // reads coverage-summary.json and coverage-final.json. No thresholds here, so the
    // integration run stays report-only; the unit floor lives in vitest.unit.config.ts.
    coverage: {
      provider: "v8",
      // "text" pins skipFull: false explicitly — vitest 4.x auto-forces skipFull:
      // true on it under AI-agent detection (std-env `isAgent`, e.g. CLAUDECODE),
      // which silently drops any 100%-covered file's row from the printed table
      // (json-summary/json data is unaffected either way). Without this override,
      // an agent running `pnpm test:coverage:unit` sees a shorter table than a
      // human running the identical command — e.g. render/trackers.ts (100% branch)
      // vanishes from the report though it's fully measured.
      reporter: [["text", { skipFull: false }], "json-summary", "json"],
      reportOnFailure: true,
    },
  },
});
