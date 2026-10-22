> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/repo/dogfood-templates.test.ts

[test-timeout-budget] load average 15.9 on 10 cores: unit limits 7939ms per test, 15877ms per hook (x1.59)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (68 tests | 4 failed) 38ms
❯ this repo adopts its own templates (68)
× every template has an entry, and every entry is a template 8ms
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
✓ .github/workflows/bkit-ci.yml 5ms
✓ .github/workflows/bkit-cloud.yml 1ms
✓ .github/workflows/bkit-renovate.yml 0ms
✓ .github/workflows/bkit-trivy.yml 0ms
✓ .github/renovate.json5 1ms
✓ .github/ISSUE_TEMPLATE/bkit-idea.yml 0ms
✓ .github/ISSUE_TEMPLATE/bkit-change.yml 0ms
✓ .github/ISSUE_TEMPLATE/bkit-bug.yml 0ms
× .husky/pre-commit 1ms
× .husky/post-commit 0ms
✓ .husky/pre-push 0ms
✓ .prettierignore 0ms
✓ .lintstagedrc.json 0ms
✓ .sops.yaml 0ms
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
✓ scripts/graphify/bkit-graph-drift-rules.json 1ms
✓ scripts/graphify/bkit-graph-external-rules.json 0ms
✓ scripts/graphify/bkit-graph-drift.py 0ms
✓ scripts/graphify/bkit-graph-eager.py 0ms
✓ scripts/graphify/bkit-graph-imports.py 0ms
✓ scripts/graphify/bkit-graphify-rollup.py 1ms
✓ scripts/graphify/bkit-graphify.sh 1ms
✓ scripts/graphify/bkit-graph-eager-rules.json 0ms
✓ scripts/graphify/bkit-graph-pre-push.sh 0ms
✓ scripts/graphify/bkit-graph-repair.py 0ms
✓ scripts/graphify/bkit-graph-surface.py 0ms
✓ scripts/graphify/bkit-graphify-graphml.py 0ms
✓ scripts/cleanup/bkit-tmp-prune.mjs 0ms
× scripts/env-backup/bkit-env-backup.mjs 1ms
✓ scripts/env-backup/bkit-env-backup.config.mjs 0ms
✓ scripts/prettier/bkit-insert-ignore.mjs 0ms
✓ scripts/secrets/bkit-secrets.mjs 1ms
✓ scripts/secrets/bkit-secrets.config.mjs 0ms
✓ scripts/slop/bkit-slop-type-suppression.mjs 0ms
✓ scripts/serena/bkit-serena-mcp.sh 0ms
✓ scripts/serena/bkit-serena.mcp.json 0ms
✓ scripts/launchd/bkit-launchd-env.sh 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > every template has an entry, and every entry is a template
AssertionError: expected [ …(67) ] to deeply equal [ …(66) ]

- Expected

* Received

@@ -12,10 +12,11 @@
".github/workflows/bkit-ci.yml",
".github/workflows/bkit-cloud.yml",
".github/workflows/bkit-renovate.yml",
".github/workflows/bkit-trivy.yml",
".graphifyignore",

- ".husky/post-commit",
  ".husky/pre-commit",
  ".husky/pre-push",
  ".lintstagedrc.json",
  ".oxlintrc.json",
  ".prettierignore",

❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts:706:41
704|
705| it("every template has an entry, and every entry is a template", () …
706| expect(Object.keys(ADOPTED).sort()).toEqual(templatePaths());
| ^
707| });
708|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > .husky/pre-commit
AssertionError: .husky/pre-commit — dist freshness on a staged .bkit/core/engine change: anchor "node scripts/env-backup/bkit-env-backup.mjs encrypt < /dev/null\nfi\n" once: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ span .bkit/core/engine/audits/repo/dogfood-templates.test.ts:632:80
630| // Text from `from` (inclusive) to `to` (exclusive; null = end), searc…
631| function span(text: string, from: string, to: string | null, label: st…
632| expect(countOf(text, from), `${label}: anchor ${JSON.stringify(from)…
| ^
633| const start = text.indexOf(from);
634| if (to === null) return [start, text.length];
❯ apply .bkit/core/engine/audits/repo/dogfood-templates.test.ts:675:24
❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts:728:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

FAIL .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > .husky/post-commit
AssertionError: .husky/post-commit: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts:725:42
723| it.each(entriesWith("adopted"))("%s", (rel, entry) => {
724| const copyPath = copyPathOf(rel);
725| expect(fs.existsSync(copyPath), rel).toBe(true);
| ^
726| const template = fs.readFileSync(path.join(templatesRoot, rel), "u…
727| const copy = fs.readFileSync(copyPath, "utf-8");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > scripts/env-backup/bkit-env-backup.mjs
AssertionError: expected '#!/usr/bin/env node\n// Example. Copy…' to be '#!/usr/bin/env node\n// Example. Copy…' // Object.is equality

- Expected

* Received

@@ -578,13 +578,10 @@
await restore();
return;
case "rekey":
await rekey();
return;

-     case "restage":
-       for (const enc of presentEnc(repoTop())) console.log(decryptEnc(repoTop(), enc).text); // STUB
-       return;
      default:
        return;
  }
  }

❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts:730:18
728| const applied = apply(template, copy, entry.edits, rel);
729| expect(applied.problems).toEqual([]);
730| expect(copy).toBe(applied.text);
| ^
731| });
732| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 1 failed (1)
Tests 4 failed | 64 passed (68)
Start at 14:03:24
Duration 193ms (transform 46%, tests 39%, setup 7%, import 6%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-zbtpgV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
