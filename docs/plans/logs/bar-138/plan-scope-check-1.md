Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

1. **Derived Test Matrix row 1 has no automated test task — only manual `node -e` checks at task A2.**
   The matrix declares: "`package.json` manifest fields render correctly… → Unit (Vitest), `.agents/scripts/bkit-modules.test.ts` (extend) or new `.agents/scripts/package-manifest.test.ts`". No build task in Phase A/B/C/D creates a Vitest assertion against `publishConfig.registry`, `publishConfig.access`, `private`, `repository.url`, or `description`. Task A2 only emits a one-off `node -e` shell check, which is not the Vitest unit test the matrix specifies. Either (a) add a test task in Phase C that extends `.agents/scripts/bkit-modules.test.ts` (or creates `package-manifest.test.ts`) asserting the manifest fields, or (b) downgrade the matrix row's "Type" cell from "Unit (Vitest)" to "Manual + grep/node-e" to match A2's verification. Bidirectional 1:1 mapping is currently broken.

2. **Derived Test Matrix row 2 (release.yml structural assertion test) has no build task.**
   Matrix declares: "`release.yml` triggers on tag-push (`v*`) and contains: setup-node 20 + registry-url + scope, full check suite, `npm publish` with `NODE_AUTH_TOKEN: GITHUB_TOKEN`, `permissions: packages: write`. → Schema/lint (yamllint + structural assertion), `.agents/scripts/release-workflow.test.ts` (new)". No runbook task creates `.agents/scripts/release-workflow.test.ts`. Task A3's verification is "Visual diff against the design doc" plus `grep`/yamllint, not the structural Vitest test the matrix promises. Add a Phase C task to create `release-workflow.test.ts` parsing the YAML and asserting the trigger, permissions, node-version, registry-url, scope, and publish-step env, OR remove this row from the matrix and rely on A3's grep+yamllint verification only.

3. **`CI_YML_MERGE_INSTRUCTIONS` rewrite (Task B4) is not represented as a row in the Derived Test Matrix.**
   Tasks B1, B2, B3, B5 each have a corresponding matrix row enumerating the print-constant rewrite. B4 (rewrites `CI_YML_MERGE_INSTRUCTIONS`) does not, despite being asserted by Task C1's test. Add a matrix row: "`CI_YML_MERGE_INSTRUCTIONS` print sink contains rewritten `.npmrc` + `env: GH_BKIT_TOKEN` + `read:packages` guidance and no `Configure private-repo auth` directive | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend)" so the matrix is bidirectionally complete.

## OPTIONAL

1. **B7 verification ("Push to feature branch and confirm `ci.yml` runs green") races with A4's instruction to push the branch first to register `release.yml`.** The sequencing is intentional (A4 needs the workflow file indexed before the tag push), but B7 lands several tasks later — by then the branch has already been pushed and CI may have run on partial state. Consider clarifying that B7's verification is "next push after B7 commit", not a fresh push.

2. **Task A4 acceptance window ("within ~30s") for the tag-triggered run is heuristic.** Recommend adding a fallback timeout (e.g. 5 min) and explicit "if still missing after recovery, file blocker" so the agent doesn't loop on the recovery flow.

3. **No task verifies the published tarball's `files` glob actually contains `dist/`, `.agents/`, `README.md` post-publish.** Tasks A4/B14/D4 assert the version is listed in GH Packages but do not inspect tarball contents. A `npm view @cbartens/bkit@0.4.0-pre.1 dist.tarball` + tar listing in either A5 or C4 would catch a misconfigured `files` array before the production cut.

4. **Task C5 hard-codes `docs/plans/logs/bar-138/smoke-pre.2.txt` and `smoke-pre.3.txt` filenames.** If the smoke needs `pre.4` or later, the canonical-filename rule forces an ad-hoc decision. Consider phrasing as "smoke-{final-pre-tag}.txt" with the rule "always reference the final passing transcript in the ship comment".

5. **Edge case "registry returns 5xx during `npm publish`" is not enumerated.** GH Packages has had outages; a transient 5xx during A4/B14/D4 is currently undifferentiated from a permissions/auth misconfig. Consider an edge-case row covering retry semantics (release.yml is tag-triggered; re-running the same tag is the recovery, but the plan does not state this).

## OUT OF SCOPE

1. Per-consumer migration PRs (`app-gether-life`, `www-visitfrasercoast-com`) — already deferred to `docs/pending.md` per Task B11; correctly out of scope here.

2. Changelog automation (release-please / changesets) — explicitly out of scope per "Future-phase recommendations" section; correctly deferred.

3. Bumping bkit-self CI to Node 22 — explicitly out of scope per Out of Scope section; correctly deferred.

4. Pre-publish provenance / sigstore attestations on the registry tarball — not mentioned anywhere in the plan; could be a future hardening pass once v0.4.0 is stable. Out of scope for this PR.

5. Automated `npm view` smoke in `release.yml` post-publish step (verifying the tarball is fetchable from the registry within the same workflow run) — would close the loop on Task A5's gate without requiring a separate scratch-consumer manual smoke. Out of scope for v0.4.0 but worth a follow-up issue.
