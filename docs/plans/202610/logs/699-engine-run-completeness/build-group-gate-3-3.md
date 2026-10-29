
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/149 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 148 files.
passed: true
skipped: null
files: 148

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bkit ci slop

[bkit-ci] base 49bb597f63fa3f4d969a48f01aad17272e74079f (49bb597f63fa3f4d969a48f01aad17272e74079f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 49bb597f63fa3f4d969a48f01aad17272e74079f
base: 49bb597f63fa3f4d969a48f01aad17272e74079f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 17.9 on 10 cores: unit limits 8933ms per test, 17865ms per hook (x1.79)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
      Coverage enabled with v8

 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 181ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 68ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 100ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-4VfYiR/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nb7369/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-nDbtIL/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mFOYPB/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Baz9uy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/checks/status-holes.test.ts (43 tests) 276ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-77SGLU/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 916ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 160ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 1951ms
   ✓ the repo (7)
     ✓ has no coverage findings 1411ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 188ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 61ms
 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 38ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (9 tests) 515ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 133ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 3862ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
     ✓ stamps HEAD as run.parentSha and close-gate as by.step by default 396ms
     ✓ stamps the given run's parentSha and step, so the rows join the close's other rows 406ms
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 772ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 905ms
     ✓ passes every rule on a clean head 479ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 489ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 24ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 135ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793237378446.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793237378450.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793237378451.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793237378458.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 24ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (99 tests) 537ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (265 tests) 1634ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1048ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 823ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 39ms
 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 159ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 303ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 535ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 195ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-LEG7Kg/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 209ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 554ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 104ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 46ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 48ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 187ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 182ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 3410ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1008ms
     ✓ is null when pnpm fails or prints something that is not a version 2333ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 177ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 1138ms
   ✓ live ledgers are machine-readable (25)
     ✓ no row smuggles an unexpanded shell substitution into a field 303ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (279 tests) 339ms
 ✓ .bkit/core/engine/commands/lib.test.ts (65 tests) 9195ms
   ✓ repo facts on a real repository (4)
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 415ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 402ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 3945ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 3743ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 2277ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 391ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 329ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 357ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 293ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 2403ms
   ✓ .bkit/templates/context/ (74)
     ✓ bkit-github.md: github self-skips with no credentials 415ms
     ✓ bkit-github.md: github self-skips with no credentials 369ms
     ✓ install copies them into .bkit/templates/context/ 878ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 232ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (13 tests) 849ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (250 tests) 280ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 155ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 320ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 73ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (49 tests) 2699ms
   ✓ no workflow or prompt names a template path (49)
     ✓ .bkit/core/workflows/bkit-build.md names no template path 328ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 264ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 374ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 31ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 618ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 215ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (24 tests) 159ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 72ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 320ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 119ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (15 tests) 392ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 128ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 731ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 41ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 98ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 152ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 105ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1188ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1159ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (52 tests) 474ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 23856ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1317ms
     ✓ never pushes local dev commits missing from origin/dev 1397ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2018ms
     ✓ dev moved before every push: exhausted, nothing landed 2998ms
     ✓ any other refusal is returned, not retried 2234ms
     ✓ pushToDev replays a commit range onto origin/dev 1308ms
     ✓ a replay retries on the new dev when dev moved 1723ms
     ✓ pushToDev log line names what it lands 948ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1246ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1085ms
     ✓ a push that fails without a server answer is returned once, never retried 864ms
     ✓ a failed fetch is returned before anything is built 566ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1977ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1803ms
     ✓ lands from a clone whose fetch refspec omits dev 1520ms
     ✓ build throwing stops the landing and removes the throwaway checkout 840ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 79ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 190ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (26 tests) 1241ms
   ✓ tipsBase (4)
     ✓ returns the worktree's top level when the main repo is bare, never the bare repo's parent 326ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 1010ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 964ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 15717ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1923ms
       ✓ falls back to event.before when gh prints unparseable output 832ms
       ✓ reports last-green-run as the source when the green head is an ancestor 3386ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1244ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 3107ms
         ✓ tests ancestry against --head, not HEAD 2726ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2488ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 92ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 275ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 81ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 131ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 80ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
> [bkit] TRUNCATED HERE — 767 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 400 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
   ✓ bkit challenge merge (28)
     ✓ a finding whose round-1 task is ticked done but comes back in round 2 gets a new task 455ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 316ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 714ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1378ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 615ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 5714ms
   ✓ bkit disk prune — step files (9)
     ✓ min runs only min steps; max runs both 565ms
     ✓ a failing or throwing step is reported and the next step still runs 334ms
   ✓ bkit disk prune — notes (5)
     ✓ a sweep reports its notes and keeps them for that checkout until the next sweep 449ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 13744ms
   ✓ bkit issues labels (25)
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 443ms
     ✓ source file is not treated as gate config 846ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 727ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 3056ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ refuses while the holder's run stepped in the last 30 minutes 469ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 448ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 679ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 304ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 387ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 2900ms
     ✓ keeps each context's own section banner and drops every other context's 7214ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 693ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 500ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1123ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3478ms
     ✓ a refused dev push is logged, never fails the close 2913ms
     ✓ an unreachable remote is logged, never fails the close 1392ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 53520ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1408ms
     ✓ fails on a net score rise with no net count change 1654ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1249ms
     ✓ treats a net score at or below 0.001 as float noise 1270ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1049ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 433ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1487ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 848ms
     ✓ exits 4 on a dropped net field instead of silently passing 889ms
     ✓ exits 4 on no summary instead of silently passing 846ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1318ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 3867ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 4305ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 4965ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 954ms
     ✓ fails (exit 1) when vale reports alerts 831ms
     ✓ exits 6 on a vale runtime error 1068ms
     ✓ skips with exit 0 when no file matches 333ms
   ✓ bkit ci prose — write-good restore (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 798ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 877ms
     ✓ is a usage error when the commit cannot be read 558ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 1977ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1207ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1572ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1044ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 1479ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ jira with {"project":"PROJ2"}: "see https://any.atlassian.net/browse/PROJ2-9 and fix PROJ2-7" reads as "PROJ2-9" 327ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 2600ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 431ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 673ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 517ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 801ms
     ✓ 6. a FID that fails the format check exits 1 802ms
   ✓ bkit fids design --description-file --prompt-file (4)
     ✓ the issue's Parent design link wins; audit paths are listed in order 430ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 608ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 478ms
     ✓ staging failure: exit 4 and no commit is created, no false success 411ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 534ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 388ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 485ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 430ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1056ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 2811ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1566ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 892ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 955ms
     ✓ runs from the checkout top even when called from a subfolder 1948ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 2332ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 850ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1470ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1153ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1744ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1458ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 2700ms
     ✓ an unpinned repo reports nulls and asks no registry 1683ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 2496ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1605ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 2752ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1624ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1726ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 876ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1178ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 2164ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 2340ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 2022ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 2095ms
     ✓ --file into a missing directory is refused, not created 1404ms
   ✓ bkit runtime assert (8)
     ✓ derives runtimeHeadless from the row's runtime; the row never stores it 310ms
     ✓ no runtime-resolved row -> exit 4, loudly 683ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ creates the PR with the github marker first and the plan in the bkit block 820ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 862ms
     ✓ always writes the marker, even with no plan 453ms
     ✓ writes the linear marker shape, taking the tracker from package.json 571ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1049ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1024ms
     ✓ refuses a title carrying [no ci] before calling gh (exit 4) 311ms
     ✓ refuses a PR from dev, main, or the base itself 970ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 908ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1694ms
     ✓ exits 5 when the open-PR probe errors 702ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1041ms
     ✓ prs open refuses --base=main 307ms
     ✓ prs open still opens against any other base 660ms
     ✓ exits 6 when the created PR's base is not --base 2101ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 981ms
     ✓ exits 1 with found=false when there is none 544ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 2250ms
     ✓ --number reads one PR, mergeable included 1246ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1951ms
     ✓ exits 4 when gh errors and 80 when it needs auth 2535ms
   ✓ bkit prs scan-body (10)
     ✓ flags [ci skip] in the landed commit body (exit 1) 319ms
     ✓ flags [no ci] in the landed commit body (exit 1) 717ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 555ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 392ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 322ms
     ✓ passes a token-free body 341ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 396ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 334ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1877ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1921ms
     ✓ drops the force-build marker from the title subject 1664ms
     ✓ takes an explicit --subject 1785ms
     ✓ runs no merge when the PR is already MERGED 864ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1581ms
     ✓ prs merge refuses a PR whose base is main 1323ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1815ms
     ✓ prs merge refuses when the PR base is unknown 1250ms
     ✓ prs merge reads the base from the one pr view it already makes 1457ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1226ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 2825ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 2366ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 2084ms
     ✓ never reads dev's required checks without --only-if-required 2136ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 2014ms
     ✓ updates when a dev ruleset requires status checks 2293ms
     ✓ updates when dev's branch protection requires status checks 1474ms
     ✓ ignores dev rulesets that require no checks 1572ms
     ✓ updates when the repo cannot be resolved 847ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1067ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 901ms
     ✓ is not green when a check failed, naming it (exit 1) 867ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 567ms
     ✓ is not green on an empty rollup (total 0) 844ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 591ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1125ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 926ms
     ✓ is a no-op when the title already says so 722ms
     ✓ strips the marker, with or without its bkit prefix 1715ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1332ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 559ms
     ✓ records a skip token found in the body, then exits 1 643ms
     ✓ exits 8 on an unreadable commit, writing nothing 680ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 752ms
     ✓ needs --scan or --scan-result 419ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 44352ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 678ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 634ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 1378ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1631ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1055ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1768ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 2255ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 2899ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1619ms
     ✓ fetches the issue and its comments as GitHub returns them 2878ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 1117ms
     ✓ no key -> auth, and fetch is never called 1631ms
     ✓ GraphQL errors map by code; DNS failure is network 1031ms
     ✓ fetches title, url, state, labels, description and comments 337ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 977ms
     ✓ splits a body over 32,767 characters into consecutive comments 1272ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 652ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 623ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 1152ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1143ms
     ✓ a recent identical comment counts as done (the final close comment) 1208ms
     ✓ a failed post reports done false with the reason and never leaks a token 1066ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 940ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 516ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 568ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 1230ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1434ms
     ✓ a board the token cannot see is scope 967ms
     ✓ an HTTP 403 from gh is scope 1032ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1022ms
     ✓ github: no block, no blockers and no further reads 725ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 509ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 532ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 828ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 323ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 423ms
     ✓ a different marker hash posts 896ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1620ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ fetchIssue pages comments past the first page 427ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ an ADF comment or description body reads as text, never a JSON blob 464ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 8881ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 904ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 526ms
     ✓ resolves config from the repo root when run from a subdirectory 625ms
     ✓ exits 6 when the PUT fails 914ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 763ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 464ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 430ms
     ✓ asks a human to log in when gh is not authenticated 838ms
     ✓ exits 3 when gh repo view names no repository 590ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 587ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 790ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 676ms
     ✓ exits 6 when the api answer is not JSON 459ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests) 75539ms
   ✓ resolveGate (6)
     ✓ falls back to a shallower candidate when the deeper one is undeclared 369ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 399ms
     ✓ no package.json, no scripts, or unparseable -> null 542ms
     ✓ debug's live-first chain stops at the deepest declared tier 324ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1092ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1321ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1092ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1163ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 343ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 707ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1111ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1784ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1926ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 2703ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1614ms
     ✓ PASS is 0 failures with or without reports 2575ms
     ✓ clears a previous attempt's reports before the gate runs 1104ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1272ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 2020ms
     ✓ a log under the outbox is named main-checkout relative in the record 2365ms
     ✓ a log small enough is copied whole: not clamped, raw null 763ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 797ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ not a red: load error named after the file 364ms
   ✓ shipped task examples (9)
     ✓ this repo's change form shows the caps this repo's package.json sets 898ms
   ✓ bkit tests plan-check (27)
     ✓ plan-check refuses a task without DONE WHEN 776ms
     ✓ plan-check refuses DEPENDS ON a later group 474ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 496ms
     ✓ plan-check matches a Markdown heading symbol 472ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 421ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 457ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 543ms
     ✓ plan-check skips existence on ticked tasks 463ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 589ms
     ✓ plan-check refuses an unmapped matrix row 355ms
     ✓ plan-check refuses a delete with no supersession row 427ms
     ✓ plan-check refuses a matrix row mapped to two tasks 520ms
     ✓ plan-check refuses a task no matrix row maps to 326ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 618ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 463ms
     ✓ plan-check refuses a Task cell naming an undefined task 329ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 639ms
     ✓ plan-check refuses a group with 4 tasks 372ms
     ✓ plan-check accepts 3 tasks and 15 tests in one group 461ms
     ✓ plan-check report lists groups, not a verdict 581ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 411ms
     ✓ plan-check follows bkit.workflows.tasks 497ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 556ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 884ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 1259ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1392ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 864ms
     ✓ a script that cannot run is exit 4, not a rejected red 745ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 498ms
     ✓ green refuses a plan with no task markers 371ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1033ms
     ✓ green: --group audits only that group's tasks 681ms
     ✓ green: --group naming a group with no tasks is refused 611ms
     ✓ green: a code fence never closed is the reason, not missing task markers 332ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1231ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1349ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1145ms
     ✓ green prints a verdict and a fixable per gap 1156ms
     ✓ green verdict is FAIL when a gap is unfixable 624ms
     ✓ green leaves a diff-reading kind fixable null 839ms
     ✓ green prints verdict null when a gap needs a diff read 793ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 758ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 582ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 631ms
     ✓ green: every test a task names needs its own red and its own pass 812ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1892ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1286ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1002ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 1412ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1464ms
       ✓ green refuses an exception-only task from a workflow step commit 1194ms
       ✓ green clears an exception-only task from a human commit 800ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 87182ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 1306ms
     ✓ done --group writes group on the row 776ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1258ms
     ✓ --commit=none writes the row and leaves it uncommitted 601ms
     ✓ build-group-start records parentSha and group 754ms
     ✓ carries extra fields, parsed as JSON when they are JSON 1005ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 373ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 459ms
     ✓ refuses an empty artifact 532ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 516ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 568ms
     ✓ rejects ["--verdict=MAYBE"] 347ms
     ✓ rejects ["--failures=-1"] 401ms
     ✓ rejects ["--status=SKIPPED"] 315ms
     ✓ needs a message unless --commit=none 406ms
     ✓ reports a failed commit with exit 8 without writing the row 1980ms
     ✓ a failed commit leaves no row staged in the index 2046ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 3324ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 3501ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2988ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 2781ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 4523ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 1532ms
     ✓ a missing artifact exits 4 812ms
     ✓ empty artifact exits 0 717ms
     ✓ pending artifact exits 1 518ms
     ✓ no marker artifact exits 2 585ms
     ✓ disallowed artifact exits 3 639ms
     ✓ bad failures artifact exits 4 593ms
     ✓ a required field that is absent is invalid (re-prompt) 464ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 492ms
     ✓ only reads above the marker 457ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1620ms
     ✓ fails when no row was written for the step 571ms
     ✓ --ref reads the status file as committed on that ref, not from disk 2777ms
     ✓ --ref exits 3 when the ref does not carry the status file 1128ms
     ✓ fails on a placeholder left in the artifact 1425ms
     ✓ fails when the row's verdict differs from the artifact's 1271ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1174ms
     ✓ fails on a missing artifact 1327ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 1286ms
     ✓ refuses a negative or non-integer attempt (2) 488ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 849ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 501ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 467ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 474ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 425ms
     ✓ fails a diagnose row missing its strategy, passes with it 881ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1564ms
     ✓ names every missing field at once 702ms
     ✓ asks nothing of a step that writes none of them 511ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 1251ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 514ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 595ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 582ms
     ✓ records the header's Strategy on the row 453ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 509ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 882ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 615ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 678ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1525ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1882ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1176ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1232ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1400ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 854ms
     ✓ --post needs --number; without --post there is no tracker key 336ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 371ms
     ✓ checks the FID's shape for the wired tracker 327ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 625ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 773ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 846ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 804ms
       ✓ gate --issue without --fid is a usage error 336ms
       ✓ gate --issue="" under none keeps today's check 369ms
     ✓ --attempt-of checks the row carries the derived counter 830ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 2220ms
     ✓ writeStepRow refuses when a recorded path changed 2199ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 747ms
     ✓ writeStepRow appends its commit sha to the record 1443ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1883ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 58322ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 514ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 430ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 386ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 514ms
     ✓ refuses ["--workflow=build","--month=202610"] 330ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 383ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 2191ms
     ✓ adopts the main checkout even when called from a linked worktree 1350ms
     ✓ design refuses to work in place on dev 561ms
     ✓ plan refuses to work in place on dev 736ms
     ✓ build refuses to work in place on dev 846ms
     ✓ ship refuses to work in place on dev 572ms
     ✓ build in place on main is refused 543ms
     ✓ design and plan in place on main are refused 1180ms
     ✓ still adopts a cloud session branch whose upstream is main 1281ms
     ✓ refuses a detached HEAD 757ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 1930ms
     ✓ never in place on main 554ms
     ✓ refuses a detached HEAD before anything else 454ms
     ✓ adopts in place when the session is already on feat/{fid} 915ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 3410ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 2238ms
     ✓ a new run of the same FID rewrites startSha 4148ms
     ✓ a resume of the same FID reuses the record 4225ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 2071ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1676ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 2080ms
     ✓ a stale record without a lock is replaced 1957ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2550ms
     ✓ ship names a missing feat branch 564ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 2241ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 501ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 453ms
     ✓ fails with a fetch error when there is no origin to rebase onto 669ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 343ms
       ✓ checks no disk when there are no cleanup step files 538ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 710ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 563ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 643ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 330ms
     ✓ never commits an entry only the main checkout's copy list names 615ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 318ms
   ✓ bkit worktrees remove (12)
     ✓ removes a marked worktree with uncommitted changes and clears the marker 428ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 367ms
     ✓ tells a caller inside the removed worktree where to cd 382ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 904ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 650ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 683ms
       ✓ a branch already gone everywhere is reported deleted 548ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 637ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 2030ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 128107ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 528ms
     ✓ rate_limit returns the requested fixture state 362ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 312ms
   ✓ bkit runs gate (58)
     ✓ --fetch refreshes origin/<branch> before gating 1024ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 335ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 315ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 445ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 397ms
       ✓ refuses a skipped lane named in bkit.testing.shipGate (16) 412ms
     ✓ tells an API error (20) from no run (10) 330ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 315ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 530ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 477ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 646ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 534ms
     ✓ --event (5)
       ✓ --event push selects the green push run beside an in-flight pull_request run 734ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 351ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 324ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 728ms
       ✓ a source change past the validated head refuses (17) and names the path 800ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1721ms
       ✓ --validated without --month / --fid is a usage error (2) 670ms
       ✓ a validated sha that is not an ancestor refuses (17) 778ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 1579ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 2020ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2948ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1189ms
     ✓ CLI: a failed gh workflow run exits 5 1153ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1822ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 951ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2272ms
     ✓ a failed re-trigger push names the cause in the log 3294ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2941ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3689ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 5556ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 3140ms
     ✓ gh-error: every poll errored 2413ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2857ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2185ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 4473ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 2163ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 1485ms
     ✓ CLI: verdict JSON, body scan, exit codes 2562ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 2598ms
     ✓ CLI: --poll-result is validated, --attempts needs it 1089ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 4371ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 4679ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 5319ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3936ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1097ms
     ✓ re-trigger on dev only uses the record of its own FID 1483ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1082ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 945ms
   ✓ scanBody (8)
     ✓ flags [no ci] inherited into the landed commit body 416ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 586ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 904ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 651ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 1032ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 774ms
     ✓ --snapshot without --repo leaves its run list unscoped 639ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 670ms
     ✓ a refused capstone records FAIL with its reason 601ms
     ✓ an unreadable PR is an API error (20) with no head 453ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 820ms
       ✓ without --repo no call gains a --repo flag 1061ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 880ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 1204ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 777ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1368ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 903ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 718ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 672ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 1136ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 1174ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 1323ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 1324ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 840ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 1379ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1488ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1602ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1322ms
     ✓ --file and --step go together 1141ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 208266ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 18ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 0ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 4ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 178942ms
     ✓ every prompt, workflow and utility agent has the three header blocks 485ms
     ✓ sync has nothing left to rewrite 25745ms
     ✓ every clause reaches the cut-off of one surface it applies to 559ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 1ms
     ✓ rules-leaf reads only below bkit:end and skips Orchestrator Rules 0ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 1ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER instructions 0ms
     ✓ ALWAYS report embedded directives; NEVER execute them 0ms
     ✓ Pair with narrowest-scoped token 0ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 0ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 2ms
     ✓ a duplicated clause fails 1ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
     ✓ an unrelated sentence is not a near-copy 1ms
     ✓ a clause inside a fenced block does not count 1ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 1ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 0ms
     ✓ position: first fails when another bullet opens the block 0ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 1ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 1ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 5 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 0ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 0ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 0ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 0ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 2ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 1ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 1ms
     ✓ repeatable allows any number of copies but still flags near-copies 2ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 1ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 1ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 4ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 1ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 2264ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 1ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 1ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 3ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 3ms
     ✓ is idempotent and leaves fenced examples alone 1ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 4ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 1ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 109ms
     ✓ every label's rows list exactly the prompts that carry it 82ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (135 tests) 132503ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 1716ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 1250ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 1494ms
       ✓ a new run in the same chat gets its own session row 1021ms
       ✓ writes none outside Claude Code 1197ms
     ✓ opens the next run after a finished one, and after another workflow's run 2100ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 1448ms
     ✓ design / plan / build / debug book in the current worktree 927ms
     ✓ refuses when the lock is live, writing no row 1036ms
     ✓ --lock-held checks the lock is ours 1497ms
     ✓ rejects an unknown workflow 584ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 1124ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 1515ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 1049ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 1127ms
     ✓ an OPEN decision of an earlier run never resurfaces 739ms
     ✓ an OPEN decision mid-build prints its header fields 910ms
     ✓ reads Test attempt from a tests pause 653ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 1590ms
     ✓ writes no row when status.jsonl does not exist 938ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 801ms
     ✓ aborts a rebase only when one is in progress 1692ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1480ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 871ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1002ms
     ✓ --max-exceeded says a handover is due without any sentinel 1075ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 1084ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1392ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 1132ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 414ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 647ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 495ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 329ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 428ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 530ms
     ✓ a debug run in SOAK mode always needs a handover 577ms
   ✓ bkit workflows close (16)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1148ms
       ✓ counts subagents of an earlier chat the run's session rows name 1155ms
       ✓ records no context block, and still closes, outside a Claude Code session 1420ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 906ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1288ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1692ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1047ms
     ✓ always writes the telemetry, whatever the runtime 1575ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 944ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 943ms
     ✓ an unwritable stats path is logged and never fails the close 969ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1167ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1674ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 864ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 765ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1001ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 961ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1122ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1013ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1871ms
     ✓ --record-step writes the close step's row before workflow-done 1424ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 959ms
     ✓ --number without --outbox is a usage error 957ms
     ✓ --flush is ship only 439ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1288ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1410ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1824ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1353ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1209ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 468ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 417ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2227ms
     ✓ --flush with nothing to record commits and pushes nothing 1555ms
     ✓ --flush carries the named worktree's logs into the dev commit 2581ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2618ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1933ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3973ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2188ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2825ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1885ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2281ms
     ✓ --push on dev never carries a row whose references name another feature 2092ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2003ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4168ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2447ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1758ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2757ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1385ms
     ✓ a close that landed releases the lock 1450ms
     ✓ removes the worktree before it releases the lock 1805ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2326ms
       ✓ closePr refuses when the PR base is unknown 2594ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1068ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 510ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 573ms
     ✓ a second run's record does not let this FID's close commit 350ms
     ✓ record is present after workflows close and before the push 499ms
     ✓ failed handover from dev removes the record and keeps recorded paths 819ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 328ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 421ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (195 tests) 241095ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1031ms
     ✓ refuses a code conflict and aborts the rebase on the spot 929ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1342ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 971ms
     ✓ produces byte-identical output to merge=union 1903ms
     ✓ restores a trailing newline so the next append starts on its own line 1455ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 960ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1576ms
     ✓ refuses a union that leaves a line which is not JSON 956ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1180ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1691ms
     ✓ refuses a lockfile whose regenerate command fails 1465ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 797ms
     ✓ removes a stale sentinel when the rebase succeeds 987ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1375ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1679ms
   ✓ branches anchor-stamp (19)
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 437ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 755ms
       ✓ skips (12) with no anchor 724ms
       ✓ skips (12) when the base is unreachable in this clone 1467ms
       ✓ skips (12) when nothing landed since the base 1400ms
       ✓ runs (0) with the landed path count once dev moved 1532ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 996ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1687ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1036ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1642ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3260ms
     ✓ runs exactly one git push 2432ms
     ✓ --set-upstream records the upstream 2792ms
     ✓ refuses with no branch checked out 1425ms
     ✓ --mode=dev refuses a feature checkout 994ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2467ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1574ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 3003ms
     ✓ --mode=abort pushes when the branch has no open PR 4179ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2951ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 966ms
     ✓ --open-pr carries the MCP answer and skips gh 1350ms
     ✓ --mode=abort on dev pushes plainly without probing 1526ms
     ✓ rejects an unknown mode 1249ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4163ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 3371ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3753ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 7494ms
     ✓ skip-ci HEAD on the replay is refused 2342ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 11181ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 6021ms
     ✓ a level local dev is a plain push, recording nothing extra 4785ms
     ✓ a record with no commits pushes nothing 2586ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1730ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2813ms
     ✓ a rewritten branch is refused, never forced 2091ms
     ✓ refuses dev and main with exit 21 and pushes nothing 2040ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 3239ms
     ✓ refuses a detached HEAD (exit 5) 1473ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2511ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 3078ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2407ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2075ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1005ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2287ms
     ✓ an up-to-date branch is a no-op 1181ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2849ms
     ✓ a fetch that fails exits 10 1066ms
   ✓ branches scan-diff (24)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1792ms
     ✓ --paths with no match exits 1 1226ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 912ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1478ms
     ✓ --marker reads a diff over 1 MiB 1371ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1485ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1075ms
     ✓ scan-diff finds an added skip 1108ms
     ✓ scan-diff ignores a skip predating the base 1044ms
     ✓ scan-diff reports a disabled test with its line 1116ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 995ms
     ✓ scan-diff ignores a removed comment in a test file 2133ms
     ✓ scan-diff ignores an assertion moved within the file 1585ms
     ✓ scan-diff still reports a removed assertion 1334ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1169ms
     ✓ scan-diff finds an added pytest mark skip 1084ms
     ✓ scan-diff finds an added unittest skip 1597ms
     ✓ scan-diff finds an added bare skip call 1175ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1023ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1330ms
     ✓ scan-diff ignores an assertion whose expectation changed 937ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 965ms
     ✓ scan-diff reports a deleted test file 967ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 910ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2469ms
     ✓ a title that already carries the marker is left alone 1413ms
     ✓ with no open PR: pushes the marker commit and edits no title 1901ms
     ✓ a re-run is deduped: no second marker commit 1487ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2336ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 1057ms
     ✓ --title-set skips gh entirely 1235ms
     ✓ refuses dev and main (exit 21) 800ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 837ms
     ✓ Path B once dev moved; --head checks a given commit 1537ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1488ms
     ✓ --merge-docs merges dev when docs/ is behind 1306ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1434ms
     ✓ --merge-docs never merges on dev itself 1429ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1675ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1900ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1499ms
     ✓ exits 10 when the fetch fails 850ms
     ✓ refuses --merge-docs with --head, and an unknown --head 1222ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1565ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2363ms
     ✓ a failed install stops ship (16) 2087ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 2040ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1425ms
     ✓ exits 10 when the fetch fails 901ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 396ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 491ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2194ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1818ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2401ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1531ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3345ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2301ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 648ms
     ✓ local: names unpushed dev as the cause when the branch carries it 807ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 724ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1197ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1241ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 955ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 982ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 949ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 822ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 581ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1070ms
     ✓ land removes the worktree when only the copied .env is untracked 877ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 842ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1087ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1580ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 880ms
     ✓ landPr refuses a main-based PR without retrying 571ms
     ✓ landPr refuses when the PR base is unknown 550ms
     ✓ PR not open (closed): stops (17) at once, no retry 750ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 60000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:206:3
    204|   });
    205|
    206|   it("has no findings", { timeout: 60_000 }, () => {
       |   ^
    207|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    208|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 156 passed (157)
      Tests  1 failed | 6494 passed | 1 skipped (6496)
   Start at  11:29:31
   Duration  276.89s (tests 94%, transform 2%, setup 2%, import 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/699-engine-run-completeness/build-group-gate-3-3.log.reports/vitest-7199.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.22 |    81.91 |    95.1 |   90.54 |                   
 engine            |   75.47 |    79.27 |    87.5 |   75.86 |                   
  cli.ts           |   75.47 |    79.27 |    87.5 |   75.86 | ...11,921,926-928 
 ...e/checks/after |   90.64 |    85.19 |   94.56 |    94.4 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   96.96 |       90 |     100 |   98.14 | 299               
 .../checks/before |   94.44 |    88.31 |   95.45 |   97.76 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |   83.78 |    73.33 |     100 |     100 | ...38,144,152-171 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   92.66 |    92.77 |   86.36 |   92.77 | 154-162           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   83.16 |    76.57 |   87.83 |   83.87 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   76.04 |    71.95 |   85.93 |   77.82 | ...67-473,477-480 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   98.36 |    86.09 |   96.29 |   99.53 |                   
  ci.ts            |   98.36 |    86.09 |   96.29 |   99.53 | 164               
 ...mmands/install |    47.9 |    45.63 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.18 |      70 |   68.92 | ...1099,1122-1289 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.62 |    83.91 |   96.98 |   94.14 |                   
  branches.ts      |   89.52 |    81.52 |   97.41 |   91.04 | ...2084,2089,2114 
  challenge.ts     |   96.14 |    80.92 |     100 |   97.53 | ...50-352,586,610 
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1570,1735,1824 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,364       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |    98.3 |    95.03 |   98.71 |   98.87 | 160,446,915-916   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.39 |    80.09 |   96.94 |   95.22 | ...1589-1590,1618 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  plan-blocks.ts   |   90.59 |     82.6 |     100 |   90.67 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1153,1169-1170 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,219         
  roadmap.ts       |   96.63 |    91.42 |     100 |   97.15 | ...63,483-485,489 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 504-505           
  runs.ts          |   93.17 |    84.35 |     100 |   94.46 | ...1876,1908-1912 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...53,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |   97.29 |    95.54 |     100 |   98.45 | 103,203,407       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.15 |    81.34 |   89.55 |   88.46 | ...1449,1454,1456 
  summary.ts       |   95.07 |    87.43 |    91.3 |   93.78 | ...68-369,377-383 
  tasks.ts         |   83.58 |    66.66 |   85.71 |   87.82 | ...35,352,383,387 
  tests.ts         |   96.07 |    86.91 |   97.24 |   97.49 | ...1627,1632-1633 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.04 |    81.76 |   97.01 |   94.82 | ...1612,1785,2481 
  workstreams.ts   |   98.27 |    96.42 |     100 |     100 | 115               
  worktrees.ts     |   65.61 |    62.82 |   76.74 |   65.99 | ...57-960,963-964 
 engine/install    |   93.15 |    84.64 |   94.15 |   95.94 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 572-579           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.41 |    91.93 |   98.82 |   96.91 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 114               
  telemetry.ts     |   95.85 |    91.16 |   98.51 |   96.44 | ...1719,1762,2130 
 engine/render     |   90.65 |    82.42 |    98.3 |    92.7 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.36 |    97.29 |     100 |   99.26 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |    90.8 |     85.8 |   95.48 |    91.5 |                   
  instructions.ts  |    90.8 |     85.8 |   95.48 |    91.5 | ...1671-1753,1758 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.22% ( 15775/17680 )
Branches     : 81.91% ( 11050/13490 )
Functions    : 95.1% ( 2546/2677 )
Lines        : 90.54% ( 13816/15258 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1713 of 3420 lines (127 KB of 262 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
