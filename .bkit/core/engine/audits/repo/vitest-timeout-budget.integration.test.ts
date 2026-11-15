// audits/repo/vitest-timeout-budget.integration.test.ts — a test file's own localLimit stays at
// its CI value when the run carries CI, even though vitest.setup.ts clears CI for the tests.
//
// A nested `vitest run` loads the repo's real vitest.setup.ts and evaluates a fixture file whose
// module-level localLimit(60_000) must read 60000 under CI=1.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, expect, it } from "vitest";

const ROOT = process.cwd();
const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

it("a file-level localLimit stays at the CI value under CI=1", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-budget-ci-"));
  temps.push(dir);
  fs.writeFileSync(
    path.join(dir, "vitest.config.mjs"),
    `export default { test: { globals: true, include: ["limit.test.mjs"], setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
  );
  const budget = JSON.stringify(path.join(ROOT, "vitest.timeout-budget.ts"));
  fs.writeFileSync(
    path.join(dir, "limit.test.mjs"),
    `import { localLimit, tierTimeouts } from ${budget};\nconst fileLimit = localLimit(60_000);\nconst tier = tierTimeouts(true);\nit("reads the CI value at module level", () => {\n  expect(fileLimit).toBe(60000);\n  expect(tier.testTimeout).toBe(30000);\n});\n`,
  );
  const run = spawnSync(
    path.join(ROOT, "node_modules/.bin/vitest"),
    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
    { cwd: ROOT, encoding: "utf-8", timeout: 60_000, env: { ...process.env, CI: "1" } },
  );
  const output = `${run.stdout}${run.stderr}`;
  expect(run.error, output).toBeUndefined();
  expect(run.status, output).toBe(0);
});
