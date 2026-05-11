Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Review

## CRITICAL

### C1 — Task A4 commit-message bullet is self-contradictory and confusing

Task A4 Scope reads:

> Commit `feat(bar-138): publishConfig + release.yml for GH Packages [skip build] [skip ci]` is INCORRECT — this commit IS the code change that needs CI. Use `feat(bar-138): publishConfig + release.yml for GH Packages`.

Embedding "this is INCORRECT — use this instead" inside the runbook scope is fragile. An autonomous agent following the literal instruction risks copying the first quoted string. Rewrite as a single positive imperative: "Commit with message `feat(bar-138): publishConfig + release.yml for GH Packages` (no `[skip ci]` — release.yml must fire on the tag)." Move the rationale (why no skip-ci tag) into a one-line note below.

### C2 — Tag-push timing for `v0.4.0-pre.1` cannot work as described

Task A4 says: "Edit `package.json#version` → `0.4.0-pre.1`. Commit … Push branch. Tag `v0.4.0-pre.1` on the same SHA. Push tag." But `release.yml` is created in the same commit (Task A3 + A4 collapse into the pre.1 SHA per the runbook flow), so the workflow that fires on the tag is the one being introduced. That is fine in principle, but the runbook does NOT call out a known GitHub gotcha: workflow files added in the same push as a tag sometimes do NOT trigger on that tag if the tag ref is delivered before the default-branch ref. The plan should either (a) require pushing the branch first, waiting for the workflow to register on the branch's HEAD, then pushing the tag separately, or (b) explicitly note that if the tag-triggered run does not appear within ~30s, delete-tag + re-push-tag is the recovery, not a re-commit. Without this guard the agent will sit confused if the run never starts.

### C3 — Pre-release tags are cut from a feature branch but `release.yml` lives only on that branch — verify branch-to-tag mapping

Task A4 cuts `v0.4.0-pre.1` against `feat/bar-138-gh-packages-distribution` (branch tip), and `release.yml` is in that branch only. GitHub fires workflows from the workflow file at the tagged ref, so this works — but the plan never states it explicitly. The Merge Method note ("Pre-release tags `v0.4.0-pre.1` and `v0.4.0-pre.2` are cut against the feature branch (or against `dev` after intermediate squash-merges if the branch ships in stages)") is ambiguous. Pin the model to one approach: tags are cut on the feature branch's tip until production v0.4.0, which is cut on `main` post-merge. Otherwise the agent has two contradictory paths to choose from.

### C4 — Task B12 `pnpm check:dist` acceptance is logically inverted

Task B12 Acceptance reads:

> `pnpm check:dist` returns non-zero BEFORE running `pnpm build` (proves dist was stale), and zero AFTER (proves the rebuild matches committed dist after the edit).

The intent is correct (stale-check → rebuild → re-check passes), but the wording "proves the rebuild matches committed dist" is wrong: after `pnpm build` the dist on disk is the freshly emitted one, but it is NOT yet committed. `check:dist` must compare on-disk emit vs on-disk committed; if it passes after build it is because the build wrote the same bytes that are already committed (which would be impossible if the source actually changed — dist diff was real). This means either the source change was a no-op or the order is wrong. Correct flow: edit source → `pnpm build` (regenerates dist) → stage dist → commit → `pnpm check:dist` returns 0. Rewrite the acceptance accordingly so the agent does not get stuck re-running build and seeing check:dist still red.

### C5 — Pre-Flight checkbox for "Acceptance Scenario confirmed" / "Breaking Changes confirmed" duplicates the human-gate checkboxes but is not wired

Gate 1 lists three checkboxes: "Acceptance Scenario confirmed", "Breaking Changes confirmed", "Gate 1 - Verified". The first two duplicate the actual `👤 ✅ Human Confirmation` checkboxes earlier in the doc. The plan never spells out the rule "Gate 1 stays unchecked until the upstream human-gate boxes are `[x]`". Per the template, the summary subagent must `REVISE` if upstream is unchecked — but the runbook does not echo that constraint. Add a one-line cross-reference under Gate 1 so the agent does not race ahead.

## OPTIONAL

### O1 — Task A2 acceptance uses `node -e` to read `publishConfig`; prefer `jq`

`jq -r .publishConfig package.json` is shorter, more robust, and matches the rest of the runbook's CLI style.

### O2 — Task C3 scratch-repo location verification

"`tmp/` is git-ignored at repo root (verify against `.gitignore`)" — add the literal verification command (`grep -E '^tmp/?$' .gitignore`) so the agent does not hand-grep.

### O3 — Task D4 cuts v0.4.0 on `main` directly, but repo rules say "Production merge: ANY merge into default production branch (main) requires PR"

The plan acknowledges this with "via short-lived branch + fast-forward PR if branch protection requires", but the agent must not pick the wrong path. Either (a) require the PR path unconditionally and remove the "or directly on main" alternative, or (b) state that `main` is the production branch but tag pushes are version commits not merge commits and may bypass branch protection if so configured. Right now the runbook leaves it as "agent figures it out".

### O4 — Pre-release tag deletion sequence

Task A5 / B15 prescribe "delete the failed tag" via `git tag -d v0.4.0-pre.1; git push origin :refs/tags/v0.4.0-pre.1`. Worth noting that GitHub Packages will reject re-publishing the same version even after tag deletion if a publish actually succeeded — only re-tag if `npm publish` itself never ran. If publish ran and succeeded but a downstream step failed, the agent must bump to `pre.1.1` (or equivalent), not re-publish. Add this distinction.

### O5 — `pnpm publish` vs `npm publish` decision worth a one-line guard in `release.yml` itself

Add a comment block above the `npm publish` step: `# Use npm (NOT pnpm publish) — setup-node registry-url wiring assumes npm CLI; see DE-3.` Cheap defence against a future contributor "modernizing" the workflow.

### O6 — Smoke transcript path

Task C5 says "Save transcript to `docs/plans/logs/bar-138/smoke-pre.2.txt` (or comparable)". Pin the exact filename so the ship-phase summary subagent can find it deterministically.

### O7 — `docs/knowledge.md` left as "no change required"

The pnpm v7.20+ silent-`.npmrc`-ignore footgun is exactly the kind of post-mortem-style gotcha that belongs in `knowledge.md` proactively, not "if it surprises us during build". Add a `KN-N` entry now so the lesson is discoverable from outside the bkit-138 plan history.

### O8 — Test target ambiguity in Derived Test Matrix

Several test rows say "extend `.agents/scripts/bkit-modules.test.ts` (or new `.agents/scripts/package-manifest.test.ts`)". Decide one path. The matrix's own template rule says "No row without a target file" — `(or new file)` is a target choice, not a target file.

### O9 — Vercel `installCommand` removal is described as "removed via printed instructions" but bkit cannot enforce it

The risk that a consumer leaves the legacy `installCommand` in `vercel.json` and the new `.npmrc` then gets ignored (because pnpm runs via the shim's `&& pnpm install` tail) is real. Worth one extra line in the print copy: "If `vercel.json` has `installCommand` containing `git config --global url.…insteadOf`, removing it is mandatory — leaving it broken-but-present will cause silent fallback to npmjs.org." Belongs in B3.

## OUT OF SCOPE

### S1 — Per-consumer migration runbook

Plan correctly defers per-consumer PRs. Suggest creating a reusable consumer-migration template at `.agents/templates/migration-bar-138-consumer.md` so each consumer PR follows the same shape. NOT for this plan; future ergonomics.

### S2 — Changelog automation

Tag-push trigger is changelog-tooling-compatible; release-please / changesets adoption is mentioned in Future Recommendations. Out of scope here, but worth a `docs/pending.md` entry.

### S3 — Public mirror to npmjs.org

Some consumers (e.g. integration partners outside the GH org) may eventually need a public mirror. ADR `DE-3` already enumerates "npmjs.org rejected — private-org plan adds cost". Re-evaluate when consumer set expands beyond personal projects.

### S4 — Automated registry-side smoke test in CI

Currently smoke is manual (Task C4 + transcript). Could be automated post-publish via a tiny ephemeral repo + GitHub-hosted runner, but real PAT in CI introduces a new secret rotation surface. Defer.
