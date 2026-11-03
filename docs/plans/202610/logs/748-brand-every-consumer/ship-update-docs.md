# Docs Update

## Files Modified

- `README.md`

## Drift Resolved

- `README.md` (sync content, line 344): `pnpm graph:refresh` → `pnpm bkit:graph:refresh`. This closes the one hit left by the plan's Task 12 grep, which was meant to hit only `docs/migrations.md`.
- Already synced in this branch, checked against the plan's `Documentation Updates` table and left as they are: `.agents/docs.md`, `.agents/rules.md` (Branding bullet), `.bkit/README.md`, `.bkit/install.md`, `.bkit/instructions.md`, `.bkit/pipeline.md`, `.bkit/templates.md`, `.bkit/workflows.md`, `CHANGELOG.md` (Unreleased breaking-change entry), `CONTRIBUTING.md`, `docs/deployments.md`, `docs/migrations.md` (five migration rows plus the `ci-scripts-old-names` row), `docs/security.md`, `docs/setup.md`, `docs/technology.md`, `docs/testing.md`, `docs/templates/bkit-audit-duplication.md`, `docs/capabilities.md`.
- Left untouched on purpose:
  - `ai.bkit.launchd.plist` in `.bkit/templates.md` is the machine-local install name; the template source is `bkit-launchd.plist`.
  - Old script names in `.bkit/instructions.md` sit in each clause's retired-wording list.
  - Old names in `docs/audits/202610/*` are dated audit reports.
  - `docs/roadmap.md` is generated.
- Memory: `MEMORY.md` holds only pointers, with no duplicate or stale content about #748, so no change.
- History: the repo is not shallow (`git rev-parse --is-shallow-repository` prints `false`), so no history is unread.

## Pending Items

From `ship-pending-items.md`:

- `748-brand-every-consumer-old-name-warning-matches-prose-graph`: the old-script-name warning matches the English word "graph" (`core.ts:836`).
- `748-brand-every-consumer-readme-names-pnpm-graph-refresh`: fixed above in `README.md:344`; the ledger row stays open until the caller closes it.
- `748-brand-every-consumer-knowledge-rows-name-old-script-and-style-names`: four ACTIVE `docs/knowledge.jsonl` lessons still name the old names. I did not edit the ledger, because ledger writes are out of this step's scope.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-941`: symlinked `.husky` / `.github` parents are written through.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1301`: symlinked `.vale.ini` gives no warning.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-911`: `bkit.testing.ciWorkflow` with `../` is a write target.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-884`: a nested `scripts/ci/` path is rewritten to a missing file.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1112`: a job line with a comment or CRLF gets no job `name:`.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1201`: an entry in `House/` named like a moved rule is deleted with the directory.
- `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-896`: an unparseable `package.json` still lets the hooks be rewritten.
- `748-rename-unprefixed-template-script-files`: open question, likely resolved by this branch.
- `748-names-outside-the-branding-rule`: scope-declared, still OPEN.

## Blockers

None
