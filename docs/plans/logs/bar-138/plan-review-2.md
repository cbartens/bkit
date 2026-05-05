Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

## CRITICAL

None. All template-mandated sections are present and populated. Acceptance Scenario, Concrete Example, Edge Cases, and Derived Test Matrix are specific, testable, and traced to source. No drift from design. No missing requirements identified.

## OPTIONAL

**1. Task A4 commit-message prose is self-contradicting.**
Task A4 writes the incorrect commit message first, then corrects it in the same sentence ("is INCORRECT — use ..."). An executing agent reading fast could copy the wrong message. Suggest removing the negative example entirely and leaving only the correct message.

**2. `docs/knowledge.md` pnpm v7.20+ silent `.npmrc` ignore not pre-emptively added.**
The plan captures the symptom (generic 401 from npmjs.org, NOT "token missing") in print copy and calls it out verbatim in both `_MISSING_` and `_UNKNOWN_` constants. However, `docs/knowledge.md` is the canonical home for gotchas (per `.agents/docs.md`), and this footgun has the signature of a future debugging trap for any maintainer who encounters it outside of the installer print path. The plan defers this ("add KN-N entry then") — pre-emptive addition in Phase B alongside the print rewrites would be cleaner and costs little.

**3. `release.yml` structural test assertion precision.**
The Derived Test Matrix row for `release.yml` says the test should assert `NODE_AUTH_TOKEN: GITHUB_TOKEN`. The actual YAML value is `${{ secrets.GITHUB_TOKEN }}`. If the test file author reads the matrix row literally rather than the Architecture section, the assertion substring may be too loose or fail. The matrix row should say `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` to be unambiguous.

**4. `docs/pending.md` append boundary not called out.**
Task B10 for `decisions.md` explicitly notes appending below the `<!-- bkit:end -->` boundary marker. Task B11 for `docs/pending.md` does not mention the boundary. For consistency, and to prevent an agent from inserting mid-file, the same boundary callout should appear in B11.

**5. Smoke transcript save path in Task C5 is advisory, not normative.**
Task C5 says "save transcript to `docs/plans/logs/bar-138/smoke-pre.2.txt` (or comparable)". The "or comparable" hedge leaves the actual path unresolved, meaning the ship-phase summary attachment reference has no reliable path. Recommend pinning the exact path and removing the hedge.

## OUT OF SCOPE

**Consumer-side `.npmrc` template seeding.** The plan explicitly scopes out per-consumer migrations, but the scratch-consumer smoke (Task C3/C4) has the maintainer manually writing the two `.npmrc` lines. A future bkit enhancement could have `bkit install --full` optionally seed a `.npmrc` stub for new consumers. Not applicable to v0.4.0 — noted for a follow-up feature idea.
