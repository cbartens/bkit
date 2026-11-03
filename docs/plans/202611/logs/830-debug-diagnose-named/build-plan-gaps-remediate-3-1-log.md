Verdict: FAIL
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
BLOCKED — bkit:generate: initial instruction check required registry entries for the changed close guard and pushed-head routes; registry updated before retry (tmp/gap3-generate.log)
DONE — Gap 1: selected CI proof on main — Step 11 includes selected CI regardless of PR flags, holds the final push SHA, and requires configured plus selected-workflow proof before success; red-before/green-after regression and all 36 workflow audits pass (tmp/gap3-red.log, tmp/gap3-green.log)
DONE — bkit:generate: final generation passed with registry, workflow catalog and rendered provider copies synchronized (tmp/gap3-generate-final.log)
DONE — Built CLI dogfood: fresh scratch consumer install passed and all five provider Debug workflows preserve main selected-CI proof, pushed SHA capture and missing-head stop; .bkit/version exists (tmp/gap3-dogfood.mjs, tmp/gap3-install.log)
DONE — Contract trace: existing VERIFY_HEAD now comes from the final non-dev push, PR dispatch refreshes it, and dev uses DEV_SHA; selected CI reaches the same verification after resume with no field, artifact or verdict schema change. Local discovery, no-plan handling and fix/reproduction generation routing retain their existing paths.
DONE — Changed-file gate: exit 0; 36 related and 7096 path-reference Vitest unit/integration tests pass, with 2 existing skips; 2 node files and 5 bats checks pass. Lint, formatting and production/test typechecks pass (tmp/gap3-changed.log)
