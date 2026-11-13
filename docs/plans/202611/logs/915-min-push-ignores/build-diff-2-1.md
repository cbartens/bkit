diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 3e041f79b..41b57f0fa 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -307,11 +307,13 @@ chmod +x .husky/pre-commit .husky/pre-push
   - **If** every file changed since each pushed commit left `origin/dev` (else `origin/main`) is one bkit writes or one `bkit.testing.minPushPaths` adds → `bkit:gate:min` replaces the full gate, and `MIN_PUSH=1`.
   - The hook passes each remote-old and pushed-new commit as `bkit ci min-push --update=<old>:<new>`. A fast-forward bookkeeping increment also qualifies when a successful local full-gate receipt covers an ancestor of the old commit and every change since that checked commit is allowed.
   - `bkit ci push-gate --gate=<script>` runs the selected consumer script. A successful deepest full push gate records its clean, unchanged commit and script definitions in the repository's Git metadata. A failed or interrupted full check prevents reuse of earlier evidence until a later full check succeeds. Minimum and revert gates create no full-gate evidence. Receipts are local; a new clone starts without them.
-  - What bkit writes = ship's `--scope=pr` allow-list (`.bkit/workflows.md` § `/bkit-ship` — 14 steps) plus `docs/plans/**`.
+  - What bkit writes = ship's `--scope=pr` allow-list (`.bkit/workflows.md` § `/bkit-ship` — 14 steps) plus `docs/plans/**` and `docs/audits/**`.
+  - A change to a top-level `docs/templates/bkit-audit-*.md` also counts as written by bkit when the file's text through its single `<!-- bkit:end -->` line is the same at both ends of the range, so only the `Project Instructions` section below it changed. A new, deleted or renamed template, a second marker line, or any change at or above the marker keeps the full gate. A template with CRLF line endings never qualifies, because a marker followed by `\r` is not line-anchored. Other templates, such as `docs/templates/bkit-plan.md`, keep the full gate. "What bkit writes" in the `bkit ci min-push` summary covers the audit reports and the audit templates' project sections.
   - The setting takes `package.json` globs: `*` matches one folder and `**` any depth. The default is `[]`, which leaves what bkit writes alone, because the setting only adds to it.
   - `bkit ci min-push` decides from files, never from `[skip ci]`, because that is a typed label and GitHub reads the last commit only.
   - Empty trigger commits need checked-ancestor evidence. Missing evidence, unreadable ranges, rewritten history, or any outgoing ref carrying new code keeps the full gate. A new branch can still qualify from its complete bookkeeping-only branch diff.
 - Min-push paths: list only files that no code, build or test reads.
+  - The floor already covers `docs/plans/**` and `docs/audits/**`, so the setting lists neither.
   - Never list `docs/**`, because a doc can be test input.
   - **If** a test reads a ledger → put that test into `bkit:gate:min`.
 - `[skip ci]` guards:
diff --git a/.bkit/templates.md b/.bkit/templates.md
index f251aa5e0..a9be4b4c6 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -307,11 +307,13 @@ chmod +x .husky/pre-commit .husky/pre-push
   - **If** every file changed since each pushed commit left `origin/dev` (else `origin/main`) is one bkit writes or one `bkit.testing.minPushPaths` adds → `bkit:gate:min` replaces the full gate, and `MIN_PUSH=1`.
   - The hook passes each remote-old and pushed-new commit as `bkit ci min-push --update=<old>:<new>`. A fast-forward bookkeeping increment also qualifies when a successful local full-gate receipt covers an ancestor of the old commit and every change since that checked commit is allowed.
   - `bkit ci push-gate --gate=<script>` runs the selected consumer script. A successful deepest full push gate records its clean, unchanged commit and script definitions in the repository's Git metadata. A failed or interrupted full check prevents reuse of earlier evidence until a later full check succeeds. Minimum and revert gates create no full-gate evidence. Receipts are local; a new clone starts without them.
-  - What bkit writes = ship's `--scope=pr` allow-list (`.bkit/workflows.md` § `/bkit-ship` — 14 steps) plus `docs/plans/**`.
+  - What bkit writes = ship's `--scope=pr` allow-list (`.bkit/workflows.md` § `/bkit-ship` — 14 steps) plus `docs/plans/**` and `docs/audits/**`.
+  - A change to a top-level `docs/templates/bkit-audit-*.md` also counts as written by bkit when the file's text through its single `<!-- bkit:end -->` line is the same at both ends of the range, so only the `Project Instructions` section below it changed. A new, deleted or renamed template, a second marker line, or any change at or above the marker keeps the full gate. A template with CRLF line endings never qualifies, because a marker followed by `\r` is not line-anchored. Other templates, such as `docs/templates/bkit-plan.md`, keep the full gate. "What bkit writes" in the `bkit ci min-push` summary covers the audit reports and the audit templates' project sections.
   - The setting takes `package.json` globs: `*` matches one folder and `**` any depth. The default is `[]`, which leaves what bkit writes alone, because the setting only adds to it.
   - `bkit ci min-push` decides from files, never from `[skip ci]`, because that is a typed label and GitHub reads the last commit only.
   - Empty trigger commits need checked-ancestor evidence. Missing evidence, unreadable ranges, rewritten history, or any outgoing ref carrying new code keeps the full gate. A new branch can still qualify from its complete bookkeeping-only branch diff.
 - Min-push paths: list only files that no code, build or test reads.
+  - The floor already covers `docs/plans/**` and `docs/audits/**`, so the setting lists neither.
   - Never list `docs/**`, because a doc can be test input.
   - **If** a test reads a ledger → put that test into `bkit:gate:min`.
 - `[skip ci]` guards:
diff --git a/.bkit/version b/.bkit/version
index 6c9fbcb6c..257025db2 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -205,7 +205,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "d71b5fb0d3b1224e22c6de4944021d8571fdd8c003f1d6c2be9dd77334b13b10",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
-    ".bkit/templates.md": "163cbc1c932eba882ddedfd8f4c0077772270b9237ba3f09217fe7ab44afb224",
+    ".bkit/templates.md": "e042c6483057089d87ef2b3a2dde5dc1a65e5ef16221e48e1b23b888605e7c70",
     "docs/templates/bkit-audit-adoption.md": "d58749e215d3ba2c2a478c62ee478f400fcc708a5e9b0ffe2a9bae88060fe852",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
diff --git a/package.json b/package.json
index 5038422d8..c7573a1c3 100644
--- a/package.json
+++ b/package.json
@@ -55,7 +55,7 @@
   "license": "MIT",
   "scripts": {
     "bkit:gate:format": "node scripts/ci/bkit-test-awake.mjs pnpm lint-staged",
-    "bkit:gate:min": "node scripts/ci/bkit-test-awake.mjs --shell \"pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta && vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts\"",
+    "bkit:gate:min": "node scripts/ci/bkit-test-awake.mjs --shell \"pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta && vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/templates/template-no-userpath.test.ts\"",
     "bkit:gate:static": "node scripts/ci/bkit-test-awake.mjs --shell \"pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta\"",
     "bkit:gate:static-unit": "node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'",
     "bkit:gate:static-unit-integration": "node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'",
