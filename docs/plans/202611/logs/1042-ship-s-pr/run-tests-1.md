
> @cbartens/bkit@6.2.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.2.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.2.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.2.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.2.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.2.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.2.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

 .bkit/core/.bkit/workflows.md
 993:1012  error  Don't start a sentence with 'So '.  write-good.So 


 docs/testing.md
 959:1344  error  Don't start a sentence with '; so '.  write-good.So 

✖ 2 errors, 0 warnings and 0 suggestions in 152 files.
passed: false
skipped: null
files: 152
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
