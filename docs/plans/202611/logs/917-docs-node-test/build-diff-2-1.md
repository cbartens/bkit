diff --git a/.bkit/templates/docs/testing.md b/.bkit/templates/docs/testing.md
index 119c2df50..710b21f4d 100644
--- a/.bkit/templates/docs/testing.md
+++ b/.bkit/templates/docs/testing.md
@@ -365,6 +365,17 @@ Each tier lists the rule to follow, then a **Not:** line naming the failure the
 - It is an observability gate, not a merge gate. It has its own workflow and is never in branch protection. When `bkit-tests-deploy` promotes inside CI, this probe is the health workflow, not a second file (`deployments.md` § Smoke trigger plumbing, § Promote before the lanes).
 - **Not:** a smoke suite wired into branch protection, or one so heavy that it cannot run on every deploy.
 
+## Test first
+
+`/bkit-build` runs each plan task's `**TEST FIRST:**` tests before their code and records each one failing (red) before the code step. This covers the unit and integration tiers only. The runners below are examples; declare the one the project uses.
+
+- **Declare `bkit:test:file`:** it runs the one test file bkit appends as its argument (a repo-relative path), and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`. pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`. jest: `jest --runTestsByPath` with the `jest-junit` reporter and `JEST_JUNIT_OUTPUT_FILE="$BKIT_TEST_REPORT"`. Node: `node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT"`; write Node tests with `node:test` (`test` / `describe` + `it`).
+  - **Node case names:** a `node:test` file reports one case per `test()` call, named by the leaf `test` / `it` name only (the junit reporter drops the enclosing `describe` names, so the plan names the leaf, never `suite > test`). A file that does not use `node:test` (a plain script) reports one case named after the file path as passed to the command, and that case counts as passed, so the plan names that test by the same path.
+  - **If** jest gets the path without `--runTestsByPath` → it reads the path as a regex, so a folder such as `(tabs)` matches no file and no report is written.
+  - **If** it is undeclared → the build reports test-first as not enforced.
+  - **If** the test files belong to more than one runner (for example, `.bats` and `node:test`) → point it at a script that picks the runner by file type.
+  - **If** `$BKIT_TEST_REPORT` is unset → pass no report flag. An empty `--outputFile.junit=` takes the next argument, the test file, as the report path, and overwrites it.
+
 ## Design assertions are a dimension, not a lane
 
 **Never add a design lane.** The lane axis is **resource profile** (a millisecond file read vs a booted app + browser), not subject matter, because design assertions span both. A `bkit-tests-design` job (or a design-only browser project) splits one concern across two profiles and buys nothing that the existing lanes do not already provide. Fold each assertion into the tier that already fits it. The CI topology, the capstone's `needs:` and the browser-project partition all stay unchanged. A real consumer's full design-system rollout landed with `bkit-ci.yml` byte-unchanged.
