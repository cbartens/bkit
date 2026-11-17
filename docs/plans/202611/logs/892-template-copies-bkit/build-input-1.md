## Session Prompt — this run's, newer than everything below

/bkit-build #892

## Issue description — oldest

### Failing test or CI run

none yet

### What happened

After `bkit upgrade` refreshes the reference copies under `.bkit/templates/`, they cannot be committed in a consumer repo. The pre-commit hook (`pnpm bkit:gate:format` → `lint-staged`) reformats them back to their old shape, so:

- the commit ends with `✖ Prevented an empty git commit!` (or silently drops the template changes when committed as `git commit -- <paths>`), and
- the pre-push hook then fails with `[bkit-check] check: 17 write(s) would occur — DRIFT DETECTED`, so nothing can be pushed.

Cause: bkit ships sample configs inside the consumer repo at `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore`. lint-staged auto-discovers the nested `.lintstagedrc.json` as a real config for the files under `.bkit/templates/` and runs `prettier --write` from that directory. From there, prettier does not apply the root `.prettierignore` (which does list `.bkit/templates/`), so it formats the copies:

```
root:          prettier --file-info .bkit/templates/scripts/ci/bkit-test-awake.mjs → {"ignored":true}
cwd templates: prettier --file-info scripts/ci/bkit-test-awake.mjs               → {"ignored":false,"inferredParser":"babel"}
```

### What should happen

Template copies refreshed by `bkit upgrade` commit byte-for-byte as shipped, and `bkit check` reports no drift afterwards. The sample configs under `.bkit/templates/` must not act as live configs for the consumer repo.

### Steps to reproduce

1. Consumer repo with the adopted `.husky/pre-commit` template, `bkit:gate:format` = `pnpm lint-staged`, and the root `.prettierignore` listing `.bkit/templates/`.
2. Have several `.bkit/templates/scripts/**` copies differ from the shipped 6.1.1 versions, and run `bkit upgrade`.
3. `git add .bkit/templates/scripts && git commit -m test`.
4. lint-staged logs `.bkit/templates/.lintstagedrc.json — 17 files`, runs prettier, and prevents an empty commit. `bkit check` still shows drift.

Verified workaround: `lint-staged --config .lintstagedrc.json` (an explicit config disables nested discovery). With it, all 17 files stay staged unchanged.

### How often

Every time, on any upgrade that changes template copies prettier would reformat.

### Affected area

- `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` (shipped sample configs)
- the seeded `scripts.bkit:gate:format` default (`pnpm lint-staged`)
- `.bkit/templates/.husky/pre-commit`

### Where and when

bkit 6.1.1, lint-staged 17.6.0, prettier 3.9.10, macOS. Seen in `bartens-biz/app-voxlocal-io` on 2026-11-08. `app-gether-life` has the identical setup and the same prettier behaviour. It only escaped so far because its 6.1.1 upgrade changed a single, formatter-stable template script.

### Evidence

Reproduced in a throwaway clone: copying the shipped `.bkit/templates/scripts/` over the repo's copies and running `lint-staged` gives 0 staged files afterwards. With `lint-staged --config .lintstagedrc.json`, 17 remain staged.

Possible fixes, for whoever picks this up: ship the samples under names lint-staged and prettier do not discover (for example `lintstagedrc.example.json`), or seed `bkit:gate:format` with an explicit `--config`.

### References

- lint-staged docs on how it discovers config files in subfolders ("How to use lint-staged in a multi-package monorepo?")

## Issue comment — posted 2026-11-08T12:14:21.000Z

Verified: the bug is real and the cause in the report is right.

Reproduced in a throwaway consumer-style repo with bkit's own lint-staged 17.6.0 and prettier 3.9.10. The setup was a root `.lintstagedrc.json`, a root `.prettierignore` listing `.bkit/templates/`, and the shipped `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore`.

- `prettier --file-info` on a template script gives `ignored: true` from the repo root and `ignored: false` from inside `.bkit/templates/`. Prettier only reads the `.prettierignore` in the folder it runs from, and the shipped sample one does not list `scripts/`.
- A staged, unformatted `.bkit/templates/scripts/ci/x.mjs` got reformatted on commit. lint-staged logged `.bkit/templates/.lintstagedrc.json — 1 file`, so it picked the nested sample config as the live one for that folder.
- With `lint-staged --config .lintstagedrc.json` the same file stayed staged byte-for-byte. The workaround holds.
- `app-gether-life` has the same setup: both sample files under `.bkit/templates/`, `.bkit/templates/` in the root `.prettierignore`, and `bkit:gate:format` = `pnpm lint-staged`.

Not reproduced here: the `bkit check` drift count on pre-push. It follows directly from the reformatted copies, but I did not run it.

The bkit repo itself does not hit this. Here `.bkit/templates/` is the source and is meant to be formatted, and the two lint-staged configs are identical.

Things a fix has to cover:
- Seeded default: `.bkit/core/engine/install/manifest.ts:242` (`"bkit:gate:format": "pnpm lint-staged"`).
- Renaming the sample files means updating the references that name the current path: `.bkit/templates.md:57` and `:343`, the tip at `.bkit/core/engine/checks/tips/catalogue.ts:250`, and the dogfood entries in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`.
- Existing consumers keep the script they already have, so changing the seeded default alone will not fix them. That needs a migration registered in `docs/migrations.md`.

## Issue comment — posted 2026-11-08T12:23:46.000Z

Fix chosen: rename the two sample files so lint-staged and prettier stop treating them as live configs. Next step is `/bkit-build`, not debug: the cause is already proven, so there is nothing left to diagnose.

**The fix**

- Rename `.bkit/templates/.lintstagedrc.json` → `.bkit/templates/lintstagedrc.example.json` and `.bkit/templates/.prettierignore` → `.bkit/templates/prettierignore.example`. Neither tool looks for files under those names, so the copies under `.bkit/templates/` get formatted (or left alone) by the root config only.
- Seeding `bkit:gate:format` with `--config .lintstagedrc.json` on its own is not enough. It only protects that one script: anyone who runs `lint-staged` without the flag hits the bug again, and prettier still skips the root `.prettierignore` whenever it runs from inside `.bkit/templates/`.

**What the fix has to cover**

- The references to the old names: `.bkit/core/engine/install/manifest.ts:242` (check that the seeded default still fits), `.bkit/templates.md:57` and `:343`, the tip at `.bkit/core/engine/checks/tips/catalogue.ts:250`, and the dogfood pairs in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`. In the bkit repo the root `.lintstagedrc.json` and `.prettierignore` keep their names; only the template side is renamed.
- A migration for existing consumers. `bkit upgrade` does not delete template files bkit no longer ships, so after the rename a consumer would still have the old `.bkit/templates/.lintstagedrc.json` and still hit the bug. The migration deletes the old sample only when it is byte-identical to a shipped version. An edited copy is left in place, with a warning naming the manual delete. Register it in `docs/migrations.md` and test it in `core.integration.test.ts` and `upgrade.integration.test.ts`, the same as the other template migrations.
- A test that proves the original failure is gone: a staged, unformatted file under `.bkit/templates/scripts/` commits unchanged with the plain `pnpm lint-staged` script.

**Worth one check during the build (not verified)**

`.bkit/templates/.oxlintrc.json` may be the same kind of trap, because oxlint can also pick up config files in subfolders. bkit's own scripts pass `-c .oxlintrc.json`, which should rule that out, but nobody has checked what consumers' seeded lint scripts run. If it is the same trap, rename it in the same change.
