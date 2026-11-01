
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/shared/settings.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/shared/settings.test.ts (31 tests | 5 failed) 30ms
   ❯ readBkitConfig (30)
     ✓ defaults every key without package.json, without a bkit key, or with unparseable JSON 2ms
     ✓ reads each key 0ms
     ✓ reads tracker.default github 0ms
     ✓ reads tracker.default linear 0ms
     ✓ reads tracker.default jira 0ms
     ✓ reads tracker.default none 0ms
     ✓ reads an unsupported tracker.default as the default 0ms
     ✓ reads the per-moment tracker states, defaulting each missing or blank one 1ms
     ✓ reads the opencode provider, the installed providers and the cloud variant 0ms
     ✓ reads an unsupported or wrongly typed opencode provider as none 1ms
     ✓ keeps only supported provider names in providers.opencode.installed, and reads a non-array as none 1ms
     ✓ falls back to the default cloud variant on an unknown or wrongly typed cloud.agent 1ms
     ✓ opts out of the dependency-updater advisory only on the exact string none 1ms
     ✓ tells an explicitly set tracker.default and cloud.agent from an absent or empty one, whatever the value 2ms
     ✓ reports nothing explicit without package.json or with unparseable JSON 1ms
     ✓ reads workflows.minFreeGb as a number 0 or more, else the default 2ms
     ✓ reads tracker.github.project as a board, false as an opt-out, anything else as not configured 3ms
     ✓ falls back per key on a wrongly typed value 0ms
     ✓ keeps only non-empty string lanes, and reads a non-array testing.shipGate as none 1ms
     ✓ reads testing.minPushPaths as non-empty strings, keeps an explicit [], else the default 1ms
     ✓ asks at every point with 2 attempts by default, and 6 turns for the grill 0ms
     ✓ reads each ask point's ask and limit, falling back per key 1ms
     ✓ names each invalid ask setting by its dotted key 0ms
     ✓ tasks defaults to 3, 15, 10 and 3 1ms
     ✓ tasks falls back on an invalid value 3ms
     × defaults build.publish to true 2ms
     × reads an explicit publish.local false 1ms
     × coerces publish.remote false to true 0ms
     × lists every invalid build.publish key 1ms
     × reports a non-object publish block 0ms
   ✓ package manager (1)
     ✓ builds script and install commands from the one runner 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/shared/settings.test.ts > readBkitConfig > defaults build.publish to true
AssertionError: expected undefined to deeply equal { remote: true, local: true }

- Expected:
{
  "local": true,
  "remote": true,
}

+ Received:
undefined

 ❯ .bkit/core/engine/shared/settings.test.ts:352:42
    350|
    351|   it("defaults build.publish to true", () => {
    352|     expect(CONFIG_DEFAULTS.buildPublish).toEqual({ remote: true, local…
       |                                          ^
    353|     expect(readBkitConfig(root()).buildPublish).toEqual({ remote: true…
    354|     expect(readBkitConfig(root(JSON.stringify({ bkit: {} }))).buildPub…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/shared/settings.test.ts > readBkitConfig > reads an explicit publish.local false
AssertionError: expected undefined to deeply equal { remote: true, local: false }

- Expected:
{
  "local": false,
  "remote": true,
}

+ Received:
undefined

 ❯ .bkit/core/engine/shared/settings.test.ts:365:39
    363|
    364|   it("reads an explicit publish.local false", () => {
    365|     expect(publish({ local: false })).toEqual({ remote: true, local: f…
       |                                       ^
    366|     expect(publish({ local: "no" })).toEqual({ remote: true, local: tr…
    367|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/shared/settings.test.ts > readBkitConfig > coerces publish.remote false to true
AssertionError: expected undefined to deeply equal { remote: true, local: false }

- Expected:
{
  "local": false,
  "remote": true,
}

+ Received:
undefined

 ❯ .bkit/core/engine/shared/settings.test.ts:370:54
    368|
    369|   it("coerces publish.remote false to true", () => {
    370|     expect(publish({ remote: false, local: false })).toEqual({ remote:…
       |                                                      ^
    371|   });
    372|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/shared/settings.test.ts > readBkitConfig > lists every invalid build.publish key
AssertionError: expected [] to deeply equal [ 'build.publish.local' ]

- Expected
+ Received

- [
-   "build.publish.local",
- ]
+ []

 ❯ .bkit/core/engine/shared/settings.test.ts:374:78
    372|
    373|   it("lists every invalid build.publish key", () => {
    374|     expect(invalidBuildPublish({ publish: { local: "no", remote: false…
       |                                                                              ^
    375|       "build.publish.local",
    376|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/shared/settings.test.ts > readBkitConfig > reports a non-object publish block
AssertionError: expected undefined to deeply equal { remote: true, local: true }

- Expected:
{
  "local": true,
  "remote": true,
}

+ Received:
undefined

 ❯ .bkit/core/engine/shared/settings.test.ts:383:28
    381|
    382|   it("reports a non-object publish block", () => {
    383|     expect(publish(false)).toEqual({ remote: true, local: true });
       |                            ^
    384|     expect(invalidBuildPublish({ publish: false })).toEqual(["build.pu…
    385|     expect(invalidBuildPublish({ publish: [1] })).toEqual(["build.publ…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 26 passed (31)
   Start at  06:54:27
   Duration  163ms (transform 48%, tests 28%, setup 17%, import 6%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-x1y3nS/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
