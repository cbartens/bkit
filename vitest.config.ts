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
      // "text" pins skipFull: false explicitly — vitest 4.x auto-forces skipFull:
      // true on it under AI-agent detection (std-env `isAgent`, e.g. CLAUDECODE),
      // which silently drops any 100%-covered file's row from the printed table
      // (json-summary/json data is unaffected either way). Without this override,
      // an agent running `pnpm test:coverage:unit` sees a shorter table than a
      // human running the identical command — e.g. bkit-trackers.ts (100% branch)
      // vanishes from the report though it's fully measured.
      reporter: [["text", { skipFull: false }], "json-summary", "json"],
      reportOnFailure: true,
    },
  },
});
