Verdict: CONCERNS
Affected: 7

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

- **TASK 8: Upgrade migration for the renamed CI script files** — class: `Reword`
  - Landed change: `migrateShortcutsToLite` is gone from `.bkit/core/engine/install/modules/core.ts`. Commit 79b96cfcb `feat(715-retire-lite-workflows): retire lite workflows; add build publish true/false (#790)` replaced it with `migrateRetiredLite` (`core.ts:425`, called by `runBkitDocs` at `core.ts:330`), and `docs/migrations.md` now has the row "Lite workflows retired".
  - Why `Reword`, not `Broken`: the pattern the READ points at still exists. `migrateRetiredLite` (`core.ts:466-480`) and `migrateRetiredDevLock` (`core.ts:490-497`) both delete a file and push `{ path, action: "write" }`. `CI_SCRIPT_RENAMES` (`.bkit/core/engine/checks/after/ci-yml.ts:654`, still not exported), `detectCiScriptsOldNames` (`ci-yml.ts:679`) and `runBkitDocs` are all where the task expects them.
  - Re-run must resolve: point the Task 8 READ (`migrateShortcutsToLite` ... lines 360-370) at `migrateRetiredLite` (`core.ts:425-481`) or `migrateRetiredDevLock` (`core.ts:490-497`). Fix the same name outside the task blocks too: Reuse Inventory rows "Record a migration write without a canonical hash" and "Move a consumer's adopted CI script units", Breaking Changes row "Engine type (internal)", and the Architecture text for `core.ts`.
- **TASK 7: Unhashed write class and the husky / CI token migration** — class: `Reword`
  - Landed change: the install postDispatch canonical-hash loop in `.bkit/core/engine/install/modules/core.ts` moved from ~1027-1060 to `core.ts:1223-1280`, with its logic unchanged. The commits were 79b96cfcb (715 retire lite), 163e09176 `feat(699): pre-push bookkeeping guard, ciSkipPaths, one min-push floor`, ade710750 (796) and 52bab3514 (99). The copy-and-own contract line in `.bkit/core/.bkit/templates.md` moved from line 12 to line 11 when the header was rewritten (747 docs commits, f1ae6fd08).
  - Approach still holds: `WriteEntry`, `runBkitDocs`, `ciWorkflowPath` (`.bkit/core/engine/shared/settings.ts:421`), `mergeCanonicalHashes` and the `TEMPLATE_COPIES_DIR` / `PAYLOAD_LINK_RELPATHS` skips are all unchanged in content.
  - Re-run must resolve: change the UPDATE line range for the hash loop to `core.ts:1223-1280`, and change `.bkit/core/.bkit/templates.md:12` to `:11` in both the UPDATE and the DONE WHEN.
- **TASK 1: Rename `lint:prose` / `slop:delta` everywhere they are wired** — class: `Reword`
  - Landed changes: several line anchors no longer point at the named text.
    - The gate advisory moved from `core.ts` ~1098 to `core.ts:1294` (79b96cfcb, 163e09176, ade710750).
    - The `.bkit/core/.bkit/workflows.md` gate chains moved from ~1405-1421 to `workflows.md:1473-1474`, and the tool-script prose to `:1509` (92e679f53 and a4b8f47c6 `fix(801-test-lock-per-case)`, 8f2c66b40 (802), 79b96cfcb).
    - The `.bkit/templates/.husky/pre-push` comment moved from 195 to `:240`, and `.husky/pre-push` from 292 to `:386` (2a9d563d9 `feat(hooks): pre-push writes tmp/pre-push.log`, 163e09176, f1ae6fd08).
    - The `.bkit/core/.bkit/templates.md` gate block is now at `:156-190`, and the Vale/slop text that was at ~246-263 is now at `:331-352` (747 rewrite, 8f857fd5e health template).
    - The template `bkit-ci.yml` Vale comment moved from 813 to `:798`.
    - In `core.integration.test.ts`, the advisory test moved from 261 to `:271`, and the `bkit:gate:format` case from 290-294 to `:306-310`.
  - Approach still holds: `BKIT_GATE_SCRIPTS` (`manifest.ts:239-252`), `detectValeMissing` (`tools.ts:29`, still reads `"lint:prose"` at `:35`), `unresolvedGateCalls` (`local-gate-audit.test.ts:91`) and every named test title are all still present. None of the rename work has landed.
  - Re-run must resolve: refresh the moved line anchors above. The grep-based DONE WHEN can stay as it is.
- **TASK 3: Rename `graph*` to `bkit:graph*`; branding guard for script and file names** — class: `Reword`
  - Landed changes: several line anchors moved.
    - The graphify block in `.bkit/core/.bkit/templates.md` moved from ~485-555 to `:621-660` (json keys at `:637-645`), through the 747 rewrite, 79b96cfcb, 163e09176 and ade710750.
    - The `.husky/pre-push` graphify hints moved from 259/263/274 to `:343`, `:353`, `:357` and `:368` (163e09176, 2a9d563d9, f1ae6fd08).
    - In `docs/templates/bkit-audit-duplication.md`, the project-part lines moved from 242/246/249 to `:295` and `:299` (d3dade5a9, 754301ca2, f9789e64a, 89c47b259 audit-template rewrites).
    - The `dogfood-templates.test.ts` `docs/capabilities.md` entry moved from 459 to `:463`.
    - The `bkit-graphify-rollup.py` header moved from ~763-785 to `:769-802`, and the `slop:delta` hint from 672 to `:677`.
    - In bkit's own `.github/workflows/bkit-ci.yml`, lines 531/551 are now `:536` and `:556`.
  - Approach still holds: the root `package.json` `graph*` keys (`:88-96`) and `bkit:generate` (`:66`, still calls `pnpm graph:refresh`) are unchanged in shape, and no branding work has landed.
  - Re-run must resolve: refresh these line anchors.
- **TASK 2: Rename the two unprefixed launchd template files** — class: `Reword`
  - Landed changes: several line anchors moved.
    - In `.bkit/core/.bkit/templates.md`, the placeholder rows moved from 84-85 to `:87-88`, the Launchd GUI environment table and `cp` lines from 324-334 to `:422-433`, the `launchctl` lines from 336-337 to `:435-436`, and line 350 to `:457`. This came from the 747 rewrite, 8f857fd5e and 79b96cfcb.
    - The `dogfood-templates.test.ts` `ADOPTED` launchd keys moved from 611/615 to `:641` and `:645` (0b0a53041, 8f857fd5e, 917262724).
    - In `templates-content.test.ts`, `PLIST` / `ENV_EXAMPLE` and the describes moved from 692-693/731/748 to `:749-750`, `:788` and `:805` (0b0a53041, 8f857fd5e, d01026028, 92e679f53).
  - Approach still holds: the two old files still ship (`.bkit/templates/scripts/launchd/ai.bkit.launchd.plist`, `launchd.env.example`), and they are the only unprefixed files under `.bkit/templates/scripts` and `.bkit/templates/context`. The catalogue launchd tip is still at `catalogue.ts:450`.
  - Re-run must resolve: refresh the line anchors.
- **TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs** — class: `Reword`
  - Landed changes: several line anchors moved.
    - The `.bkit/core/.bkit/workflows.md` tool-script prose moved from 1421 to `:1509` (801, 802 and 715 commits).
    - The `.bkit/core/.bkit/install.md` old names moved from 241 to `:262` and `:265` (ee318c0de `fix(765): finish making the prose gate fail when Vale is unavailable`, 52bab3514, ade710750).
    - In `.bkit/shared/docs/deployments.md`, line 380 is now `:445` (79b96cfcb, 2b4512402, 163e09176, f9789e64a). That row says "a large pnpm graph", which is prose and not a `pnpm graph` script call.
    - Smaller drifts: `.bkit/core/.agents/rules.md` 131 is now `:130`, `.bkit/core/.bkit/README.md` ~282 is `:271`, `pipeline.md` 100 is `:99`, and `.bkit/shared/docs/testing.md` 17 is `:18`.
  - Approach still holds: the `slop-gate` clause is still in `.bkit/instructions.md` (`:1815`, with retired wordings at `:1826-1827`), and `instructions:show` / `instructions:sync` are still in `package.json:99-100`.
  - Re-run must resolve: refresh the moved anchors, and confirm whether the `deployments.md` Renovate row needs any edit at all.
- **TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood** — class: `Reword`
  - Landed changes: several line anchors moved.
    - In `docs/testing.md`, ~763 is now `:853` and 640-641 is `:730-731` (00e258265 `fix(triage-v61-fixes)`, 79b96cfcb, f1ae6fd08, ade710750).
    - In `docs/deployments.md`, the project part moved from ~485-499 to `:556-575` (79b96cfcb, f1ae6fd08, 2b4512402, 163e09176).
    - In `docs/security.md`, the `slop:delta` mention moved from line 143 to `:166` (747 doc rewrites 20b9ceac6 and 2e9ec43c0).
    - In `docs/setup.md`, ~55 and ~82 are now `:66` and `:93` (f9789e64a, 20b9ceac6).
    - In `docs/technology.md`, the Vale row (`pnpm lint:prose`) moved from 83 to `:80`, and the slop-scan row (`pnpm slop:delta`) from 86 to `:83`. Neither base nor dev names `House` in this file.
  - Approach still holds: `.agents/docs.md:72` and `:75`, `CHANGELOG.md`, and the DONE WHEN greps are all unaffected.
  - Re-run must resolve: refresh the anchors, including the Documentation Updates rows for `docs/security.md` (143 is now 166) and `docs/technology.md` (~83 is now 80 and 83; drop `House`).
