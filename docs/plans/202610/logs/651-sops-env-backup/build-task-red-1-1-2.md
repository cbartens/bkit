> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts (5 tests | 3 failed) 6ms
❯ hasTool (5)
✓ returns true for an executable file on PATH 1ms
× ignores a file on PATH that is not executable 2ms
× hasTool returns false for a missing tool outside CI 0ms
× hasTool throws naming the tool when CI is set 1ms
✓ returns true under CI when the tool is present 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts > hasTool > ignores a file on PATH that is not executable
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts:38:34
36| it("ignores a file on PATH that is not executable", () => {
37| fs.writeFileSync(path.join(dir, "fake-tool"), "#!/bin/sh\n", { mod…
38| expect(hasTool("fake-tool")).toBe(false);
| ^
39| });
40|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

FAIL .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts > hasTool > hasTool returns false for a missing tool outside CI
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts:42:41
40|
41| it("hasTool returns false for a missing tool outside CI", () => {
42| expect(hasTool("no-such-tool-xyz")).toBe(false);
| ^
43| });
44|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts > hasTool > hasTool throws naming the tool when CI is set
AssertionError: expected [Function] to throw an error

- Expected:
  null

* Received:
  undefined

❯ .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts:47:47
45| it("hasTool throws naming the tool when CI is set", () => {
46| process.env.CI = "true";
47| expect(() => hasTool("no-such-tool-xyz")).toThrow(/no-such-tool-xy…
| ^
48| process.env.CI = "1";
49| expect(() => hasTool("no-such-tool-xyz")).toThrow(/the CI lane mus…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 2 passed (5)
Start at 13:28:29
Duration 85ms (transform 57%, tests 19%, setup 13%, import 5%, worker 5%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-X63qgC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
