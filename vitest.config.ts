import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [".bkit/src/**/*.test.ts", ".bkit/src/**/*.integration.test.ts"],
    // Strip inherited GIT_* env vars in every worker so temp-repo git ops can
    // never hit the real repo when the suite runs from a git hook (see
    // vitest.setup.ts for the 2026-07-13 branch-hijack incident).
    setupFiles: ["./vitest.setup.ts"],
    // Report-only coverage — dogfoods the bkit-stub:coverage scaffold shipped to
    // consumers. json-summary + json are load-bearing: vitest-coverage-report-action
    // reads coverage-summary.json and coverage-final.json. No thresholds by design
    // (report-only never reds the lane); a gate is opt-in per consumer.
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
    },
  },
});
