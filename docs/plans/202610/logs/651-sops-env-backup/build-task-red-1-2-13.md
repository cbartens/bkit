> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/repo/dogfood-templates.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests | 1 failed) 24ms
❯ this repo adopts its own templates (64)
× every template has an entry, and every entry is a template 5ms
✓ .github/dependabot.yml 0ms
✓ scripts/ci/check-accepted-divergences.mjs 0ms
✓ scripts/ci/check-accepted-divergences.test.mjs 0ms
✓ scripts/ci/accepted-divergences.json 0ms
✓ scripts/ci/bkit-local-stack-lock.sh 0ms
✓ scripts/cleanup/bkit-disk-prune.mjs 0ms
✓ scripts/cleanup/bkit-disk-prune.machine.mjs 0ms
✓ scripts/launchd/ai.bkit.launchd.plist 0ms
✓ scripts/launchd/launchd.env.example 0ms
✓ docs/capabilities.md 0ms
✓ .claude/hooks/bkit-cloud-bootstrap.sh 1ms
✓ .github/workflows/bkit-ci.yml 3ms
✓ .github/workflows/bkit-cloud.yml 1ms
✓ .github/workflows/bkit-renovate.yml 0ms
✓ .github/workflows/bkit-trivy.yml 0ms
✓ .github/renovate.json5 1ms
✓ .github/ISSUE_TEMPLATE/bkit-idea.yml 0ms
✓ .github/ISSUE_TEMPLATE/bkit-change.yml 0ms
✓ .github/ISSUE_TEMPLATE/bkit-bug.yml 0ms
✓ .husky/pre-commit 0ms
✓ .husky/pre-push 0ms
✓ .prettierignore 0ms
✓ .lintstagedrc.json 0ms
✓ .oxlintrc.json 0ms
✓ scripts/ci/lanes/resolve-push-base.mjs 0ms
✓ scripts/ci/lanes/resolve-push-base.test.mjs 0ms
✓ scripts/ci/check-capstone.mjs 0ms
✓ scripts/ci/check-capstone.test.mjs 0ms
✓ scripts/ci/check-dependency-audit.mjs 0ms
✓ scripts/ci/check-dependency-audit.test.mjs 0ms
✓ scripts/ci/accepted-advisories.json 0ms
✓ .vale.ini 0ms
✓ .vale/styles/House/Filler.yml 0ms
✓ .vale/styles/House/Hedging.yml 0ms
✓ .vale/styles/House/LLMSlop.yml 0ms
✓ .vale/styles/House/Verbose.yml 0ms
✓ slop-scan.config.json 0ms
✓ .envrc 0ms
✓ .cursor/settings.json 0ms
✓ .cursor/environment.json 0ms
✓ .cursor/Dockerfile 0ms
✓ .graphifyignore 0ms
✓ .serena/project.yml 0ms
✓ scripts/graphify/bkit-graph-drift-rules.json 0ms
✓ scripts/graphify/bkit-graph-external-rules.json 0ms
✓ scripts/graphify/bkit-graph-drift.py 0ms
✓ scripts/graphify/bkit-graph-eager.py 0ms
✓ scripts/graphify/bkit-graph-imports.py 0ms
✓ scripts/graphify/bkit-graphify-rollup.py 1ms
✓ scripts/graphify/bkit-graphify.sh 0ms
✓ scripts/graphify/bkit-graph-eager-rules.json 0ms
✓ scripts/graphify/bkit-graph-pre-push.sh 0ms
✓ scripts/graphify/bkit-graph-repair.py 0ms
✓ scripts/graphify/bkit-graph-surface.py 0ms
✓ scripts/graphify/bkit-graphify-graphml.py 0ms
✓ scripts/cleanup/bkit-tmp-prune.mjs 0ms
✓ scripts/prettier/bkit-insert-ignore.mjs 0ms
✓ scripts/secrets/bkit-secrets.mjs 1ms
✓ scripts/secrets/bkit-secrets.config.mjs 0ms
✓ scripts/slop/bkit-slop-type-suppression.mjs 0ms
✓ scripts/serena/bkit-serena-mcp.sh 0ms
✓ scripts/serena/bkit-serena.mcp.json 0ms
✓ scripts/launchd/bkit-launchd-env.sh 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > every template has an entry, and every entry is a template
AssertionError: expected [ …(63) ] to deeply equal [ …(66) ]

- Expected

* Received

@@ -18,11 +18,10 @@
".husky/pre-push",
".lintstagedrc.json",
".oxlintrc.json",
".prettierignore",
".serena/project.yml",

- ".sops.yaml",
  ".vale.ini",
  ".vale/styles/House/Filler.yml",
  ".vale/styles/House/Hedging.yml",
  ".vale/styles/House/LLMSlop.yml",
  ".vale/styles/House/Verbose.yml",
  @@ -39,12 +38,10 @@
  "scripts/ci/lanes/resolve-push-base.mjs",
  "scripts/ci/lanes/resolve-push-base.test.mjs",
  "scripts/cleanup/bkit-disk-prune.machine.mjs",
  "scripts/cleanup/bkit-disk-prune.mjs",
  "scripts/cleanup/bkit-tmp-prune.mjs",
- "scripts/env-backup/bkit-env-backup.config.mjs",
- "scripts/env-backup/bkit-env-backup.mjs",
  "scripts/graphify/bkit-graph-drift-rules.json",
  "scripts/graphify/bkit-graph-drift.py",
  "scripts/graphify/bkit-graph-eager-rules.json",
  "scripts/graphify/bkit-graph-eager.py",
  "scripts/graphify/bkit-graph-external-rules.json",

❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts:686:41
684|
685| it("every template has an entry, and every entry is a template", () …
686| expect(Object.keys(ADOPTED).sort()).toEqual(templatePaths());
| ^
687| });
688|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 63 passed (64)
Start at 13:38:34
Duration 110ms (transform 46%, tests 40%, setup 6%, import 6%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mMAHkL/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
