> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/land.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/land.test.ts (25 tests | 3 failed) 3424ms
✓ landBackoffMs (2)
✓ doubles from the start wait, caps it, and jitters down by at most half 1ms
✓ ten tries wait at most three minutes in all 0ms
✓ devMoved / devRefused (3)
✓ dev moved before or while the push was sent: retry 0ms
✓ a server refusal (hook, ruleset, HTTP 403): the PR route 0ms
✓ no server answer: neither 0ms
✓ landDir (6)
✓ names the throwaway beside the feature worktrees 0ms
✓ refuses "../x" as a feature id 0ms
✓ refuses "a/b" as a feature id 0ms
✓ refuses "" as a feature id 0ms
✓ refuses ".hidden" as a feature id 0ms
✓ refuses "a..b" as a feature id 0ms
✓ withoutHooks (1)
✓ points core.hooksPath nowhere for the call, then restores the environment 0ms
❯ pushToDev (13)
✓ lands the commit on origin/dev and leaves the main checkout alone 233ms
✓ never pushes local dev commits missing from origin/dev 229ms
✓ dev moved: rebuilds on the new dev and pushes again 378ms
✓ dev moved before every push: exhausted, nothing landed 658ms
✓ any other refusal is returned, not retried 347ms
× pushToDev replays a commit range onto origin/dev 235ms
× a replay retries on the new dev when dev moved 177ms
× pushToDev log line names what it lands 255ms
✓ runs no git hooks in the throwaway checkout, and says so 230ms
✓ removes a locked throwaway a killed landing left behind, then lands 242ms
✓ a push that fails without a server answer is returned once, never retried 174ms
✓ a failed fetch is returned before anything is built 115ms
✓ build throwing stops the landing and removes the throwaway checkout 149ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/land.test.ts > pushToDev > pushToDev replays a commit range onto origin/dev
Error: replayBuild is not implemented
❯ Object.build .bkit/core/engine/commands/workflow/branches.ts:650:11
648| export function replayBuild(_shas: string[]): (dir: string) => void {
649| return () => {
650| throw new Error("replayBuild is not implemented");
| ^
651| };
652| }
❯ .bkit/core/engine/commands/land.ts:129:11
❯ withoutHooks .bkit/core/engine/commands/land.ts:86:18
❯ Module.pushToDev .bkit/core/engine/commands/land.ts:124:29
❯ .bkit/core/engine/commands/land.test.ts:252:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

FAIL .bkit/core/engine/commands/land.test.ts > pushToDev > a replay retries on the new dev when dev moved
Error: replayBuild is not implemented
❯ .bkit/core/engine/commands/workflow/branches.ts:650:11
648| export function replayBuild(_shas: string[]): (dir: string) => void {
649| return () => {
650| throw new Error("replayBuild is not implemented");
| ^
651| };
652| }
❯ Object.build .bkit/core/engine/commands/land.test.ts:270:9
❯ .bkit/core/engine/commands/land.ts:129:11
❯ withoutHooks .bkit/core/engine/commands/land.ts:86:18
❯ Module.pushToDev .bkit/core/engine/commands/land.ts:124:29
❯ .bkit/core/engine/commands/land.test.ts:266:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/commands/land.test.ts > pushToDev > pushToDev log line names what it lands
AssertionError: expected 'git hooks skipped in the throwaway de…' to contain 'it lands bookkeeping, or the commits …'

Expected: "it lands bookkeeping, or the commits a debug run on dev made"
Received: "git hooks skipped in the throwaway dev checkout — it lands bookkeeping only"

❯ .bkit/core/engine/commands/land.test.ts:289:18
287| });
288| const line = log.find((l) => l.startsWith("git hooks skipped"));
289| expect(line).toContain("it lands bookkeeping, or the commits a deb…
| ^
290| expect(log.join("\n")).not.toContain("bookkeeping only");
291| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 22 passed (25)
Start at 13:20:27
Duration 3.65s (tests 95%, transform 4%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mmXbRA/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
