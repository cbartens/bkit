Verdict: PASS

<!-- verdict:end -->

# Build Challenge Remediation Log

DONE — Finding 1: Missing concurrency guard on release.yml — added concurrency block with cancel-in-progress: false (.github/workflows/release.yml)
DONE — Finding 2: Floating action major-version refs — pinned to commit SHAs: checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 (v4.3.1), setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 (v4.4.0), pnpm/action-setup@a15d269cd4658e1107c09f1fabf4cbd7bd1f308a (v4.4.0) (.github/workflows/release.yml)
DONE — Finding 3: Tarball ships test files — added .npmignore to exclude .agents/scripts/*.ts and .agents/scripts/__snapshots__/ from published tarball (.npmignore)
DONE — Finding 4: publishConfig.access: restricted is no-op on GH Packages — documented in ADR DE-3 with note on visibility semantics (docs/decisions.md)
DONE — Finding 5: No environment: protection on publish job — accepted for single-maintainer; documented in release.yml comment and ADR DE-3 (.github/workflows/release.yml, docs/decisions.md)

<!-- verdict:start -->
Verdict: PASS
<!-- verdict:end -->
