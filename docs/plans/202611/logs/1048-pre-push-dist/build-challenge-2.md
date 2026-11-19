Verdict: PASS
Failures: 0
Fingerprint: b09b03fa8965f37dd8e758deb170d332a8a46fd949137906222901b7f420558a
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

The whole diff in `tmp/bkit-diff-1048-pre-push-dist.md` (full coverage; its first line is not `partial diff coverage`), read against the plan `docs/plans/202611/1048-pre-push-dist-plan.md`. Surfaces challenged: `parseRef` and `run` in `scripts/gate/bkit-check-dist.mjs` (new `--ref=<commit>` option, `git rev-parse --verify --end-of-options`, temporary index through `GIT_INDEX_FILE` + `git read-tree`), the `DIST_REF` block in `.husky/pre-push` (lines 391-407), the test changes in `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` and `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, and the doc lines in `docs/deployments.md` and `docs/testing.md`.

## Notes

- **Input validation (argument injection):** `parseRef` refuses an empty value or one starting with `-` before any git call, puts `--end-of-options` ahead of `<value>^{commit}`, and accepts only a 40-64 character lowercase hex result. Only that resolved hash reaches `git read-tree`. Every git call uses `spawnSync` with an argv array and no shell, which `docs/security.md` § Shell Injection requires. Probed live (git 2.56.0): `--ref=-x`, `--ref=--output=/tmp/x`, `--ref=`, `--ref=no-such-commit`, `--ref=HEAD:package.json`, `--ref` with no `=`, a later `--ref=-x` overriding a good one, and a stray `-x` all exit 1 with `[bkit] --ref value is not a commit` or `[bkit] unknown argument`, and leave no `tmp/check-dist-*` entry.
- **Hook input:** `DIST_REF` comes only from `PUSH_DEV_SHA` / `PUSH_BRANCH_SHA`, which the ref loop (`.husky/pre-push` lines 167-185) sets from git's own pre-push stdin for a non-zero local hash. The new `case` clears an all-zero or empty value, and the call quotes `--ref="$DIST_REF"`. `set -e` (line 20) still applies inside the new `if` body, so a failing check blocks the push.
- **Integrity gate (OWASP software and data integrity):** the authoritative freshness gates are unchanged and pass no argument: `.github/workflows/release.yml:63`, `.github/workflows/bkit-ci.yml:516` and `.husky/pre-commit:23` keep reading the index (a clean checkout in CI makes index equal commit). Because unknown arguments are refused rather than ignored, the script fails closed. For a tag push, a push to `main`, or a push of a branch that is not checked out, the hook falls back to the index, as before; the release path re-verifies `dist/` on the tagged commit itself (`docs/security.md` § Release path). Checking only `PUSH_DEV_SHA` when a push also updates the checked-out branch is the plan's settled design and is not a weaker state than before.
- **Temporary index file:** `tmp/check-dist-XXXXXX.index` sits beside the `mkdtemp` folder, under `tmp/**` (gitignored, `.gitignore:34`), and is removed in `finally`. Git writes it through an exclusive `.lock` file and a rename, so a planted symlink is replaced, not followed; `fs.rmSync` removes a link, not its target. Only someone who can already write the checkout could plant anything there, so no privilege is gained.
- **Compiling an arbitrary commit's tree:** the exported tree is limited to `.bkit/core/engine`, `tsconfig.json` and `package.json`; `tsc` runs no code from the tree, git's index path checks refuse `.git` and `..` entries on `read-tree`, filter drivers come only from local git config, and output hashes use `hash-object --no-filters`. The commit is the pusher's own, which is the same trust as the staged tree in index mode. This point was checked by reading the code, not by running a hostile tree.
- **Secrets, PII, data exposure:** none in the diff. Error text names only the argument or git's stderr, with no environment values. No consumer names in the doc edits.
- **Data access and tenancy:** not applicable (`docs/security.md` § RLS: bkit has no database).
- **Supply chain:** no dependency added or changed (`package.json` is not in the diff).
- **Docs cross-referenced:** `docs/security.md` § Trust boundaries, § Input validation, § Shell Injection, § Release & Distribution; `docs/deployments.md` § `dist/` commit policy and the pre-push check order (row 8); `docs/knowledge.jsonl` KN-7 (dist staleness). The diff agrees with all of them.
