
> @cbartens/bkit@6.2.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.2.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.2.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.2.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.2.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.2.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.2.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.2.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> bkit ci slop

[bkit-ci] base d421257ad14236532e99a74d44ff2d2562bc60bc (d421257ad14236532e99a74d44ff2d2562bc60bc) vs working tree
[bkit-ci] added 2, resolved 0, worsened 0; net findings 1, net score 2.20
[bkit-ci] Net-new / worsened findings:
[bkit-ci]   added     scripts/gate/bkit-text-ceiling.mjs:63  defensive.error-obscuring  Found 2 error-obscuring catch blocks
[bkit-ci]   added     scripts/gate/bkit-text-ceiling.mjs:242  defensive.error-obscuring  Found 2 error-obscuring catch blocks
[bkit-ci] FAIL — change adds/worsens slop on net.
[bkit-ci] - ONLY fix net-new, NEVER the baseline. New lines matching existing patterns are consistent, NOT slop.
[bkit-ci] - Type-suppression (any casts, double casts through unknown, @ts-* directives): Assert real type, else Record<string, unknown>, NEVER any; suppress only with written reason.
[bkit-ci] - Structure/defensive (over-fragmentation, pass-through-wrapper, empty-catch, ...): Fix in place; NEVER delete/move/merge files or rewire callers to satisfy — refactors are separate decisions, NOT lint side effects.
[bkit-ci] Inspect: slop-scan delta --base <base-worktree> --head .
passed: false
skipped: null
baseRef: d421257ad14236532e99a74d44ff2d2562bc60bc
base: d421257ad14236532e99a74d44ff2d2562bc60bc
added: 2
resolved: 0
worsened: 0
netFindingCount: 1
netScore: 2.1999999999999993
findings:

<!-- prettier-ignore -->
| status | path | line | ruleId | message |
| --- | --- | --- | --- | --- |
| added | scripts/gate/bkit-text-ceiling.mjs | 63 | defensive.error-obscuring | Found 2 error-obscuring catch blocks |
| added | scripts/gate/bkit-text-ceiling.mjs | 242 | defensive.error-obscuring | Found 2 error-obscuring catch blocks |
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
