Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/commands/install/install.integration.test.ts` `ships ten optional document starters on fresh install`
WROTE — TASK 1: `.bkit/core/engine/commands/install/install.integration.test.ts` `preserves the contents of a legacy managed document when reinstalling`
WROTE — TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership`
WROTE — TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `preserves ambiguous legacy markers and reports cleanup without blocking check`
WROTE — TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `previews project document migration without mutating the checkout`
WROTE — TASK 1: `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `preserves project document copies on full uninstall`
WROTE — TASK 2: `.bkit/core/engine/commands/install/install.integration.test.ts` `registers an adopted starter without duplicating project rows`
WROTE — TASK 2: `.bkit/core/engine/commands/install/install.integration.test.ts` `preserves indexed equivalents and warns about unsafe registration paths`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/templates.test.ts` `resolves documentation references against the correct ownership sources`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/template-path-refs.test.ts` `allows qualified project document reads and rejects mandatory template dependencies`
SOURCE — TASK 1: legacy wrapper/marker text from .bkit/shared/docs/setup.md (HEAD):1-3
SOURCE — TASK 1: Project Documents section after last bkit:end from .agents/docs.md:60-62
