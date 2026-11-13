Verdict: CONCERNS
Failures: 1
Fingerprint: 8d10a5911ba08c57830ac62815e6fdcb296a00b5170dc6f0e818da3b2cb16bc8
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Inputs: `docs/plans/202611/915-min-push-ignores-plan.md` (Tasks 1-7) and `tmp/bkit-diff-915-min-push-ignores.md` (full diff; no `partial diff coverage` header).
- Surfaces challenged: `minPushOutside` and `managedHead` (the new audit-template exception), `minPushPathspecs` (`docs/audits/**` floor), `minPush` / `minPushUpdates` (`--ref` / `--update`), `hasVerifiedIncrement` callback (receipt path), `checkLanding` (landing routine), the exported `gitRaw`, bkit's own `bkit:gate:min` script, and the `.bkit/templates.md` § Git hooks — Husky text.
- Docs cross-referenced: `.agents/docs.md` (index), `docs/security.md` (Untrusted Content & Prompt Injection, Shell Injection, PII, Supply-Chain), `.github/workflows/bkit-trivy.yml` (CI secret scan trigger). `docs/data-schema.md` and RLS: not applicable (no database).

## Notes

- Verified by probe: two blobs differing only in byte `0xFF` vs `0xFE` inside the managed block produce equal UTF-8-decoded heads (`heads equal: true`, `raw bytes equal: false`) in a scratch repo under the session scratchpad. That is Task 1. Impact is small: the attacker can only swap one undecodable byte for another, and `bkit check` (run on every push) flags such bytes between the markers as drift; the gap is real for the consumer-owned notes region above `<!-- bkit:start -->`, and it contradicts the "byte-identical" wording in `docs/decisions.jsonl` `915-min-push-audit-template-project-section`.
- Fail-closed paths checked and holding: a missing / unreadable blob (`gitRaw` maps a spawn error or ENOBUFS to a non-zero status, `maxBuffer` 256 MB), new / deleted / renamed templates (`--no-renames`), symlink or gitlink type changes (no markers or `cat-file blob` fails), CRLF markers (not line-anchored), a second marker line, nested paths and non-audit templates (anchored `AUDIT_TEMPLATE_RE`). Paths come from `git diff -z`, so quoted or non-ASCII names cannot slip past the regex. Every git call uses an argument array through `spawnSync`, per `docs/security.md` § Shell Injection; `--update` SHAs are hex-validated before they reach `cat-file`.
- Observation, not logged as a finding (owner decision on #915; same shape as the existing `docs/plans/**` floor): a `[skip ci]` push of an audit report skips every `push`-triggered workflow, including `bkit-trivy.yml`'s `--scanners secret` run on `dev`. Trivy there is detective, not preventive (the push has already landed), the next non-skip `dev` push rescans the whole tree, the audit templates already forbid copying log free text or credential values into reports (`docs/templates/bkit-audit-logs.md` Rules), and GitHub push protection still applies server-side where enabled. If the owner wants a secret scan on light-gate pushes, that belongs in the consumer's `bkit:gate:min`, not in this classifier.
- Observation, not logged: `docs/audits/**` accepts any file type at any depth (for example a `.ts` or nested `package.json`), not only `{YYYYMM}/{slug}.md` reports. This matches the owner's decided glob and the existing `docs/plans/**` floor, and nothing in bkit executes files from those trees.
- Observation, not logged: a mode-only change (100644 to 100755) to an audit template with an unchanged head is accepted and logged as "only its project section below <!-- bkit:end --> changed". The first line sits inside the compared head, so no new shebang can appear, and nothing executes these files.
- Log lines added by the diff name repo paths only; no PII, secrets or tenancy data are emitted (`docs/security.md` § PII). No new dependency, so no supply-chain change.
- No embedded directives were found in the diff or plan content.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A push that swaps one invalid UTF-8 byte for another (or for a literal U+FFFD) at or above an audit template's <!-- bkit:end --> takes the light gate, because minPushOutside compares UTF-8-decoded text, not bytes
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:651` · **Round:** 1
  - **DONE WHEN:** minPushOutside accepts an audit template only when its bytes through the bkit:end line are identical at both commits: the blob comparison no longer runs through the lossy encoding "utf-8" decode in gitRaw (for example, the head is cut and compared on a lossless decode such as latin1, or a head that contains U+FFFD keeps the file outside), so any byte change at or above the marker leaves the template in outside.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template whose managed block swaps one invalid UTF-8 byte for another, beside one changed only below its bkit:end` fails on exit 0 with `outside: []`, because base byte `0xFF` and head byte `0xFE` both decode to U+FFFD, so the two heads compare equal and T2 moves to `sections`
<!-- bkit:task 1 end -->
