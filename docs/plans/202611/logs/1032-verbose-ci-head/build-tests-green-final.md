Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1032-verbose-ci-head-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` "static and unit jobs each run a manual-run verbose marker step before Configure Verbose CI" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` "passes actionlint" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` ".github/workflows/bkit-ci.yml" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "no template comment says a marker is inert on workflow_dispatch" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "never writes NODE_OPTIONS to $GITHUB_ENV" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step fixture commits under a global git config that signs commits" | passed-accepted | passed |
| 4 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "no template doc says markers are inert on a dispatch" | red | passed |

## Gaps

None.

## Already landed

- Task 4 `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step fixture commits under a global git config that signs commits" — passed at the group's red, and the tests step accepted it: the fixture fix (-c commit.gpgsign=false plus failing on non-zero git exit) lives in the test file itself, so it passes now; no red is due

## Taken over

- Task 4 `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit" — taken over from Task 1; recorded `red` after the rewrite

  ```diff
     it("verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit", () => {
       for (const job of JOBS) {
         const r = runStep(markerScript(job), "fix: something [verbose ci]\n\nbody");
         expect(r.status, job).toBe(0);
         const lines = r.env.split("\n").filter(Boolean);
         expect(lines, job).toContain("VERBOSE_CI=1");
  -      expect(lines, job).toContain("TURBO_LOG_LEVEL=debug");
  +      expect(lines, job).toContain("TURBO_LOG_LEVEL=full");
         expect(lines, job).toContain("DEBUG=vercel:*,supabase:*");
         expect(
           lines.some((l) => l.startsWith("NODE_OPTIONS")),
           job,
         ).toBe(false);
       }
     });
  ```

