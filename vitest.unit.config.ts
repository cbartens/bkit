import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.config.ts";

// The unit run's config: the shared config plus the branch-coverage floor. Only
// `test:coverage:unit` loads it (`-c`), so the floor never reaches the integration run.
// The Report Unit Coverage step in .github/workflows/bkit-ci.yml reads this file as raw
// text (`vite-config-path`) to print the floor as the target beside the measured figure:
// keep the floor on one unquoted line, and write no other coverage metric name followed
// by a colon and a number anywhere in this file, or the report scrapes the wrong value.
export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        thresholds: {
          branches: 78,
        },
      },
    },
  }),
);
