# Build Skills Installed

## Technologies Identified

- Bash (the machine-lock script `.bkit/templates/scripts/ci/bkit-machine-lock.sh`)
- Perl (the helper inside `_local_stack_lock` that holds the lock and queue tickets)
- Vitest (unit and integration tests for the lock; the plan edits existing tests and adds new ones)
- Filesystem and process locking (`flock`, ticket files): covered by the Bash and Perl skills, not a separate technology

## Already Installed

- `bash-scripting`
- `perl-patterns`
- `vitest`
- `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `property-based-testing` (universal skills, present)

## Newly Installed

None

## Not Found

None. Every required technology already has a matching installed skill. TypeScript appears only as the language of the existing test files, not as a technology the feature adds, so no gap was opened for it.
