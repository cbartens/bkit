<!-- Provenance artifact for #325. Built collaboratively (not via the autonomous /bkit-plan pipeline); this records context, decisions, and the shipped surface. -->

# Self-hosted Renovate runner (#325) — Implementation Plan

## Context & Goals

Large pnpm-11 monorepo consumers exceed Mend Community Cloud's **3 GB hosted-runner memory ceiling**. `app-gether-life` fails every Renovate run with `kernel-out-of-memory` (3.0/3.0 GB, killed <4 min) — all dependency PRs blocked. Existing mitigations (worker cap, `minimumReleaseAge` — #308/#370, KN-41) are exhausted. Ship an opt-in self-hosted runner that moves execution to `ubuntu-latest` (~16 GB).

**Success Criteria:**

- `pnpm bkit install --renovate=self` ships a bkit-managed `.github/workflows/renovate.yml` running `renovatebot/github-action` against the SAME `renovate.json5`.
- Mend stays the default; a plain re-install preserves an existing self-hosted mode (no silent revert).
- Migrating mend ↔ self is idempotent; `bkit check` stays green.

## Locked decisions (user)

1. Build the reusable bkit feature first, then dogfood into gether.
2. Migrate the bkit repo itself to self-hosted (drops bkit's Mend dependency).
3. Default platform token = fine-grained PAT `GH_BKIT_TOKEN`; self-managed GitHub App documented as the no-expiry hardening path. `GITHUB_TOKEN` disqualified (its PRs don't trigger CI). See DE-34.

## Shipped surface

| Area         | File(s)                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Flag + type  | `.bkit/src/bkit-cli.ts` (`--renovate`), `.bkit/src/bkit-manifest.ts` (`RENOVATE_RUNNERS`/`parseRenovateRunner`, manifest entry)      |
| Module       | `.bkit/src/bkit-modules.ts` (`runRenovateModule` write/reclaim + self-hosted activation advisory)                                    |
| Threading    | `.bkit/src/bkit-install.ts` (`detectRenovateRunner`, ctx, recovery hints)                                                            |
| Advisories   | `.bkit/src/bkit-postinstall.ts` (`renovate-self-hosted-mend-both-active`; OOM advisory suppressed self-hosted)                       |
| Workflow     | `.bkit/templates/.github/workflows/renovate.yml` (SHA-pinned, `GH_BKIT_TOKEN`, `RENOVATE_HOST_RULES`, `RENOVATE_ALLOWED_ENV=PNPM_*`) |
| Config fence | `.bkit/templates/.github/renovate.json5` (`ignorePaths` + DO-NOT-BUMP for `renovate.yml`)                                            |
| Docs         | `docs/deployments.md` §Self-hosted Renovate + presence-matrix row; `docs/knowledge.md` KN-CORE-10; `docs/decisions.md` DE-34         |
| Tests        | cli/manifest/templates-content/modules-integration/postinstall                                                                       |

**Architecture:** `--renovate` is a WHERE sub-mode of the renovate module (mirrors `cloud`'s `--auto=` axis); config is single-source (mode = presence of `renovate.yml`); recorded in `package.json` `bkit.renovateRunner`.

## Verification (done)

- `pnpm vitest run` — 1755 pass / 2 skip. `pnpm build` clean; `check:dist` current (passes on commit).
- Scratch-consumer dogfood (real CLI, clean dir): fresh→mend (no workflow), →self (workflow), plain re-install PRESERVES self, `bkit check` exit 0, →mend reclaims workflow, invalid flag rejected. All pass.
- bkit-repo self-migrate: install → `bkit check` GREEN; new template ships in `pnpm pack` tarball.
- `renovatebot/github-action` + `actions/checkout` SHA-pinned; `actionlint` clean (template + rendered).
- `renovate-config-validator`: my changes clean; caught the pre-existing `allowedEnv` gap → fixed via `RENOVATE_ALLOWED_ENV=PNPM_*` in the workflow.
- Adversarial build-challenge gate (8 areas verified clean). Found + fixed one HIGH: `detectRenovateRunner`'s file-presence fallback would have force-overwritten a consumer's OWN bespoke `.github/workflows/renovate.yml` on a plain `--dependency=renovate` install → now byte-equal-guarded (only a workflow byte-equal to bkit's canonical template counts as bkit-owned). Regression test + real-CLI dogfood confirm the bespoke file is preserved. One LOW fixed (guard the reclaim against a missing workflow template); one LOW accepted (OOM-advisory suppression keys on workflow presence — the migration window is covered by the both-active advisory).

## Remaining — manual (needs operator; per repo)

1. Provision `GH_BKIT_TOKEN` (fine-grained PAT: Contents/PRs/Workflows/Issues RW, Metadata R) as a repo Actions secret. Confirm `GH_BKIT_TOKEN_INSTALL` present.
2. Land `renovate.json5` + `renovate-local.json5` + `renovate.yml` on the default branch.
3. **Suspend the Mend Renovate App** for the repo (GitHub UI; no `gh api`).
4. `workflow_dispatch` with `dryRun=full` / `logLevel=debug` — confirm auth + config load (settles the autodiscover approach), private-registry lookups 200 (not 401), and adoption of the existing Dependency Dashboard + open PRs.
5. Then install into `app-gether-life` to unblock it.
