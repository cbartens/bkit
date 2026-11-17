Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "acknowledges only complete selected blocks on verified routes" | red | failure: expected null to be 2 // Object.is equality |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "reserves notices inside conservative host budgets" | red | failure: expected null to be 3 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts

[test-timeout-budget] load average 40.3 on 10 cores: unit limits 24650ms per test, 49300ms per hook (x4.93)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

 ❯ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (341 tests | 2 failed) 29748ms
   ✓ gateguard behaviour parity — advisory content (210)
     ✓ claude (42)
       ✓ first edit to an existing file gets the investigation checklist 106ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 94ms
       ✓ a gate-config path gets the weaken-the-gate advisory 89ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 102ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 101ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 115ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 114ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 92ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 92ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 102ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 103ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 99ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 92ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 89ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 89ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 90ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 92ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 98ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 91ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 98ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 98ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 101ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 95ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 95ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 86ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 114ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 103ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 110ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 130ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 117ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 109ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 98ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 87ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 103ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 93ms
       ✓ ordinary file README.md is not treated as a gate config 101ms
       ✓ ordinary file src/index.ts is not treated as a gate config 100ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 93ms
       ✓ mixed-purpose package.json is not treated as a gate config 96ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 91ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 94ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 99ms
     ✓ cursor (42)
       ✓ first edit to an existing file gets the investigation checklist 108ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 98ms
       ✓ a gate-config path gets the weaken-the-gate advisory 112ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 102ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 107ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 98ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 100ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 89ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 92ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 91ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 99ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 91ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 94ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 112ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 108ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 97ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 111ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 86ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 99ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 85ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 88ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 91ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 89ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 118ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 98ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 98ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 90ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 99ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 132ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 104ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 89ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 127ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 97ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 99ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 96ms
       ✓ ordinary file README.md is not treated as a gate config 91ms
       ✓ ordinary file src/index.ts is not treated as a gate config 99ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 88ms
       ✓ mixed-purpose package.json is not treated as a gate config 90ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 88ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 97ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 92ms
     ✓ opencode (42)
       ✓ first edit to an existing file gets the investigation checklist 93ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 31ms
       ✓ a gate-config path gets the weaken-the-gate advisory 24ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 68ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 36ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 24ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 24ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 70ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 51ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 28ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 59ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 36ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 39ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 58ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 57ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 42ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 23ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 61ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 24ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 102ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 38ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 25ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 25ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 29ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 202ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 105ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 57ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 66ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 24ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 26ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 64ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 50ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 82ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 43ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 43ms
       ✓ ordinary file README.md is not treated as a gate config 64ms
       ✓ ordinary file src/index.ts is not treated as a gate config 29ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 61ms
       ✓ mixed-purpose package.json is not treated as a gate config 56ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 28ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 44ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 33ms
     ✓ codex (42)
       ✓ first edit to an existing file gets the investigation checklist 121ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 94ms
       ✓ a gate-config path gets the weaken-the-gate advisory 87ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 116ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 117ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 107ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 116ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 91ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 94ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 95ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 109ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 94ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 95ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 96ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 91ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 96ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 96ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 123ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 97ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 102ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 99ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 102ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 118ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 90ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 93ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 105ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 105ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 105ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 93ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 100ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 89ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 101ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 90ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 93ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 95ms
       ✓ ordinary file README.md is not treated as a gate config 99ms
       ✓ ordinary file src/index.ts is not treated as a gate config 94ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 117ms
       ✓ mixed-purpose package.json is not treated as a gate config 89ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 88ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 102ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 101ms
     ✓ antigravity (42)
       ✓ first edit to an existing file gets the investigation checklist 102ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 105ms
       ✓ a gate-config path gets the weaken-the-gate advisory 91ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 95ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 99ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 105ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 100ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 105ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 105ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 107ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 111ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 104ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 237ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 93ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 93ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 103ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 106ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 103ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 103ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 92ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 94ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 104ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 97ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 106ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 98ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 102ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 88ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 94ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 103ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 97ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 97ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 101ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 93ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 97ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 93ms
       ✓ ordinary file README.md is not treated as a gate config 100ms
       ✓ ordinary file src/index.ts is not treated as a gate config 93ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 109ms
       ✓ mixed-purpose package.json is not treated as a gate config 104ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 93ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 96ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 101ms
   ✓ gateguard behaviour parity — template copies (25)
     ✓ claude: a consumer's .bkit/templates/.vale.ini is not a gate config 99ms
     ✓ claude: a consumer's root .vale.ini is a gate config 91ms
     ✓ claude: bkit's own .bkit/templates/.vale.ini is a gate config 95ms
     ✓ claude: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 98ms
     ✓ claude: a folder that merely ends in .bkit/templates is not a template copy 93ms
     ✓ cursor: a consumer's .bkit/templates/.vale.ini is not a gate config 93ms
     ✓ cursor: a consumer's root .vale.ini is a gate config 101ms
     ✓ cursor: bkit's own .bkit/templates/.vale.ini is a gate config 101ms
     ✓ cursor: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 97ms
     ✓ cursor: a folder that merely ends in .bkit/templates is not a template copy 98ms
     ✓ opencode: a consumer's .bkit/templates/.vale.ini is not a gate config 24ms
     ✓ opencode: a consumer's root .vale.ini is a gate config 33ms
     ✓ opencode: bkit's own .bkit/templates/.vale.ini is a gate config 26ms
     ✓ opencode: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 26ms
     ✓ opencode: a folder that merely ends in .bkit/templates is not a template copy 25ms
     ✓ codex: a consumer's .bkit/templates/.vale.ini is not a gate config 103ms
     ✓ codex: a consumer's root .vale.ini is a gate config 96ms
     ✓ codex: bkit's own .bkit/templates/.vale.ini is a gate config 107ms
     ✓ codex: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 106ms
     ✓ codex: a folder that merely ends in .bkit/templates is not a template copy 103ms
     ✓ antigravity: a consumer's .bkit/templates/.vale.ini is not a gate config 98ms
     ✓ antigravity: a consumer's root .vale.ini is a gate config 112ms
     ✓ antigravity: bkit's own .bkit/templates/.vale.ini is a gate config 99ms
     ✓ antigravity: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 104ms
     ✓ antigravity: a folder that merely ends in .bkit/templates is not a template copy 99ms
   ✓ gateguard behaviour parity — docs density advisory (25)
     ✓ claude: fires on docs/architecture.md (a docs markdown file) 93ms
     ✓ claude: fires on .bkit/shared/docs/architecture.md (nested docs tree) 128ms
     ✓ claude: does not fire on Documents/architecture.md (segment match, not substring) 101ms
     ✓ claude: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 97ms
     ✓ claude: does not fire on docs/knowledge.jsonl (gated on .md) 101ms
     ✓ cursor: fires on docs/architecture.md (a docs markdown file) 102ms
     ✓ cursor: fires on .bkit/shared/docs/architecture.md (nested docs tree) 102ms
     ✓ cursor: does not fire on Documents/architecture.md (segment match, not substring) 107ms
     ✓ cursor: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 102ms
     ✓ cursor: does not fire on docs/knowledge.jsonl (gated on .md) 95ms
     ✓ opencode: fires on docs/architecture.md (a docs markdown file) 28ms
     ✓ opencode: fires on .bkit/shared/docs/architecture.md (nested docs tree) 26ms
     ✓ opencode: does not fire on Documents/architecture.md (segment match, not substring) 23ms
     ✓ opencode: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 25ms
     ✓ opencode: does not fire on docs/knowledge.jsonl (gated on .md) 35ms
     ✓ codex: fires on docs/architecture.md (a docs markdown file) 109ms
     ✓ codex: fires on .bkit/shared/docs/architecture.md (nested docs tree) 105ms
     ✓ codex: does not fire on Documents/architecture.md (segment match, not substring) 96ms
     ✓ codex: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 105ms
     ✓ codex: does not fire on docs/knowledge.jsonl (gated on .md) 86ms
     ✓ antigravity: fires on docs/architecture.md (a docs markdown file) 98ms
     ✓ antigravity: fires on .bkit/shared/docs/architecture.md (nested docs tree) 96ms
     ✓ antigravity: does not fire on Documents/architecture.md (segment match, not substring) 101ms
     ✓ antigravity: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 110ms
     ✓ antigravity: does not fire on docs/knowledge.jsonl (gated on .md) 94ms
   ✓ gateguard behaviour parity — dedup (10)
     ✓ claude: second touch of the same file in the same session is silent 152ms
     ✓ claude: a different file in the same session warns again 229ms
     ✓ cursor: second touch of the same file in the same session is silent 169ms
     ✓ cursor: a different file in the same session warns again 190ms
     ✓ opencode: second touch of the same file in the same session is silent 29ms
     ✓ opencode: a different file in the same session warns again 50ms
     ✓ codex: second touch of the same file in the same session is silent 160ms
     ✓ codex: a different file in the same session warns again 189ms
     ✓ antigravity: second touch of the same file in the same session is silent 183ms
     ✓ antigravity: a different file in the same session warns again 202ms
   ✓ gateguard behaviour parity — modes (15)
     ✓ claude: BKIT_GATEGUARD=off is a total no-op 58ms
     ✓ claude: BKIT_GATEGUARD=deny blocks the first touch with the checklist 94ms
     ✓ claude: deny mode allows the retry (dedup lets the second call through) 151ms
     ✓ cursor: BKIT_GATEGUARD=off is a total no-op 63ms
     ✓ cursor: BKIT_GATEGUARD=deny blocks the first touch with the checklist 90ms
     ✓ cursor: deny mode allows the retry (dedup lets the second call through) 255ms
     ✓ opencode: BKIT_GATEGUARD=off is a total no-op 1ms
     ✓ opencode: BKIT_GATEGUARD=deny blocks the first touch with the checklist 30ms
     ✓ opencode: deny mode allows the retry (dedup lets the second call through) 28ms
     ✓ codex: BKIT_GATEGUARD=off is a total no-op 71ms
     ✓ codex: BKIT_GATEGUARD=deny blocks the first touch with the checklist 117ms
     ✓ codex: deny mode allows the retry (dedup lets the second call through) 174ms
     ✓ antigravity: BKIT_GATEGUARD=off is a total no-op 65ms
     ✓ antigravity: BKIT_GATEGUARD=deny blocks the first touch with the checklist 230ms
     ✓ antigravity: deny mode allows the retry (dedup lets the second call through) 179ms
   ✓ gateguard behaviour parity — no-op and fail-open (5)
     ✓ claude: an edit payload with no file path is ignored 69ms
     ✓ cursor: an edit payload with no file path is ignored 78ms
     ✓ opencode: an edit payload with no file path is ignored 1ms
     ✓ codex: an edit payload with no file path is ignored 64ms
     ✓ antigravity: an edit payload with no file path is ignored 73ms
   ✓ gateguard behaviour parity — state folders (21)
     ✓ claude: dedup state lives in a per-user folder 64ms
     ✓ claude: another user's shared folder does not cost the session its dedup 122ms
     ✓ claude: an unwritable state folder still delivers the checklist 67ms
     ✓ claude: deny mode with an unwritable state folder never blocks the retry 162ms
     ✓ cursor: dedup state lives in a per-user folder 72ms
     ✓ cursor: another user's shared folder does not cost the session its dedup 142ms
     ✓ cursor: an unwritable state folder still delivers the checklist 68ms
     ✓ cursor: deny mode with an unwritable state folder never blocks the retry 139ms
     ✓ opencode: dedup state lives in a per-user folder 2ms
     ✓ opencode: another user's shared folder does not cost the session its dedup 6ms
     ✓ opencode: an unwritable state folder still delivers the checklist 2ms
     ✓ opencode: deny mode with an unwritable state folder never blocks the retry 3ms
     ✓ codex: dedup state lives in a per-user folder 73ms
     ✓ codex: another user's shared folder does not cost the session its dedup 121ms
     ✓ codex: an unwritable state folder still delivers the checklist 66ms
     ✓ codex: deny mode with an unwritable state folder never blocks the retry 134ms
     ✓ antigravity: dedup state lives in a per-user folder 71ms
     ✓ antigravity: another user's shared folder does not cost the session its dedup 143ms
     ✓ antigravity: an unwritable state folder still delivers the checklist 68ms
     ✓ antigravity: deny mode with an unwritable state folder never blocks the retry 145ms
     ✓ opencode: an unwritable state folder warns once per session, not on every edit 3ms
   ✓ antigravity deny-once delivery — retry folder (3)
     ✓ another user's shared retry folder does not cost the checklist 145ms
     ✓ an unwritable retry folder allows the call instead of denying it with no way through 184ms
     ✓ adviseOnce returns allow, never throws, when the retry folder cannot be written 7ms
   ✓ gateguard structural parity (21)
     ✓ claude: carries slash-comment markers with start before end 0ms
     ✓ claude: the managed block never emits or reads stdin 0ms
     ✓ claude: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ cursor: carries slash-comment markers with start before end 0ms
     ✓ cursor: the managed block never emits or reads stdin 0ms
     ✓ cursor: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ opencode: carries slash-comment markers with start before end 1ms
     ✓ opencode: the managed block never emits or reads stdin 0ms
     ✓ opencode: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ codex: carries slash-comment markers with start before end 0ms
     ✓ codex: the managed block never emits or reads stdin 0ms
     ✓ codex: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ antigravity: carries slash-comment markers with start before end 0ms
     ✓ antigravity: the managed block never emits or reads stdin 0ms
     ✓ antigravity: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ claude and cursor blocks are byte-identical 1ms
     ✓ every host's generated block carries the shared engine verbatim 1ms
     ✓ the codex block carries the same advisory texts as the claude twin 0ms
     ✓ the codex block matches apply_patch and parses the V4A envelope 0ms
     ✓ codex advises on the *** Move to: target of a renaming patch 205ms
     ✓ the opencode block carries the same advisory texts as the CJS twins 1ms
   ✓ gateguard parity — documented deviations (4)
     ✓ only Claude distinguishes Edit from Write for the new-file nudge 95ms
     ✓ blocking is expressed differently per host but means the same thing 200ms
     ✓ Antigravity delivers the checklist by denying the first edit once; the retry passes 191ms
     ✓ malformed stdin is a CJS-hook concern only 141ms
   ❯ codex gateguard — complete-block batching (2)
     × reserves notices inside conservative host budgets 78ms
     × acknowledges only complete selected blocks on verified routes 86ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts > codex gateguard — complete-block batching > reserves notices inside conservative host budgets
AssertionError: expected null to be 3 // Object.is equality

- Expected:
3

+ Received:
null

 ❯ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts:795:34
    793|     expect(finished).toBe(started);
    794|     // The omitted-target count is exact.
    795|     expect(omittedCount(advice)).toBe(targets.length - started);
       |                                  ^
    796|
    797|     // Zero-fit block: one multi-byte basename whose single block exce…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts > codex gateguard — complete-block batching > acknowledges only complete selected blocks on verified routes
AssertionError: expected null to be 2 // Object.is equality

- Expected:
2

+ Received:
null

 ❯ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts:817:33
    815|     expect(first).toContain("shown-first.ts");
    816|     expect(first).not.toContain("later-reminder.ts");
    817|     expect(omittedCount(first)).toBe(2);
       |                                 ^
    818|
    819|     // Only the complete shown block is acknowledged; unshown paths st…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 339 passed (341)
   Start at  18:41:02
   Duration  30.07s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-04P1nQ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
