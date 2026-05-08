import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [".agents/scripts/**/*.test.ts", ".agents/scripts/**/*.integration.test.ts"],
  },
});
