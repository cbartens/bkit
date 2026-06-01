import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [".bkit/src/**/*.test.ts", ".bkit/src/**/*.integration.test.ts"],
  },
});
