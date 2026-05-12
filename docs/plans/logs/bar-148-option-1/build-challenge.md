Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Build Challenge

## Scope

Re-probe (attempt 2) of BAR-148 Option 1 implementation post-3rd-fix-cycle. Caller-flagged focus: confirm cursor mirror now matches canonical/claude for FID derivation logic. Probed: FID resolution across all three files, regression-test coverage, schema-propagation correctness, GHA workflow byte-equality (dogfood vs template), C3 test silent-skip behaviour, status.json `[-1]` semantics across upstream → router transitions.

## Pass items (verified — no further action required)

- **FID derivation now consistent across all three files (caller's primary concern resolved).** Verified by:
  - `.agents/workflows/bkit-ci-router.md:72` → `FID=$(echo "$BRANCH" | sed 's|^feat/||')`
  - `.claude/commands/bkit-ci-router.md:72` → identical line.
  - `.cursor/commands/bkit-ci-router.md:68` → identical line (offset shifted by 4 because cursor T2 transform strips the YAML `description:` frontmatter; this is by-design and matches the pattern for all other cursor mirrors).
  - `Grep "FID=\$\(ls docs/plans/logs"` returns NO matches anywhere in the repo (the previously-orphaned alphabetical scan is fully eradicated).
  - All three files contain the `If FID empty or equals BRANCH → Failure Path` guard (canonical/claude line 74, cursor line 70).
- **Dogfood vs template byte-equality.** `.github/workflows/bkit-ci-router.yml` and `.agents/templates/.github/workflows/bkit-ci-router.yml` are byte-identical (46 lines each, every line matches), and the snapshot in `__snapshots__/templates.test.ts.snap:3-49` records the same content as a regression guard.
- **Schema propagation (Path A).** All 5 upstream orchestrators (`bkit-plan.md`, `bkit-build.md`, `bkit-ship.md`, `bkit-debug.md`, `bkit-design.md`) initialise `commentId:""` placeholder during status init (line 84/103/104/114) and follow with a `commentId` patch step after `save_comment` resolves the comment ID (line 105/123/124/135). The patch commit message uses `[skip build] [skip ci]` so it does NOT trigger CI prematurely; the build's CI-trigger commit (Step 17 `close-workflow status trigger CI`) lands AFTER the patch commit, so the router-side checkout at `head_sha` will see the patched `commentId` value.
- **Router orchestrator structural correctness.** Step ordering: 1 Start → 2 Worktree Setup (PR resolution) → 3 Label Gate → 4 Stale-Run Guard → 5 Resolve PR & Conclusion → 6 Dispatch → 7 Close. Both `Auto`-label-absent and stale-SHA-mismatch paths exit no-op (line 177, 213) with `rm -f .router-lock` and `exit 0` (not Failure Path), matching the no-op-vs-failure semantics in the plan's Edge Cases table.
- **`runAutoModule` wiring.** `bkit-modules.ts:916` defines the function, registry has `auto: runAutoModule` (line 1213), dispatch order `["core","claude","cursor","ci","auto","lint","git-hooks"]` (line 1220-1228) places `auto` between `ci` and `lint` per plan; `bkit-cli.ts` adds `"auto"` to `ModuleFlag`, `MODULE_FLAGS`, and `ALL_MODULES`; help text and example documented.
- **Mirror regen integrity.** All three mirrors of `bkit-ci-router` agree on FID derivation, no drift detected via `Grep` cross-checks.

## Findings

### F1 — MEDIUM — Cursor mirror NOT in regression-test loop (test coverage gap, not current correctness)

- **Severity:** MEDIUM
- **Class:** mechanical
- **Location:** `.agents/scripts/release-workflow.test.ts:480-489`
- **Issue:** The `ROUTER_FILES` array used by the FID-resolution regression tests added during this build cycle covers only TWO files:

  ```ts
  const ROUTER_FILES = [
    { label: ".agents/workflows/bkit-ci-router.md (canonical)",  filePath: ... },
    { label: ".claude/commands/bkit-ci-router.md (mirror)",      filePath: ... },
  ];
  ```

  `.cursor/commands/bkit-ci-router.md` is not in the array. The 7 assertions inside `describe(\`FID resolution regression — ${label}\`)` therefore iterate over only 2 files (14 assertions total), not 3 (21 assertions). This is the EXACT gap that caused the prior build cycle's CRITICAL F1 to ship: the canonical and claude mirror got the fix, the cursor mirror was orphaned, and the test loop did not detect it.

- **Exploit / failure scenario:** A future maintainer edits `.agents/workflows/bkit-ci-router.md` (e.g., refactors the FID derivation again, or applies a different fix), runs `pnpm bkit install --claude` only (or forgets to run install at all), and pushes. The test loop covers canonical + claude → green. The cursor mirror drifts silently. Cursor IDE consumers (or any downstream invocation that resolves `.cursor/commands/`) see the stale/buggy version. The same class of CRITICAL bug (wrong-FID dispatch → cross-feature ship/debug action) recurs.
- **Why this is mechanical, not architectural:** Adding a third entry to the array is a single-line edit; `path.resolve(".cursor/commands/bkit-ci-router.md")` is the literal expected path. The existing `it("does NOT contain alphabetical directory-scan ...")` and `it("derives FID from branch name using sed prefix-strip ...")` assertions are content-only and will work against any of the three files.
- **Suggested fix:**

  ```ts
  const ROUTER_FILES = [
    {
      label: ".agents/workflows/bkit-ci-router.md (canonical)",
      filePath: path.resolve(".agents/workflows/bkit-ci-router.md"),
    },
    {
      label: ".claude/commands/bkit-ci-router.md (mirror)",
      filePath: path.resolve(".claude/commands/bkit-ci-router.md"),
    },
    {
      label: ".cursor/commands/bkit-ci-router.md (mirror)",
      filePath: path.resolve(".cursor/commands/bkit-ci-router.md"),
    },
  ];
  ```

  Run the suite locally; should pass against current corrected cursor mirror.

### F2 — LOW — C3 integration test (canonicalHashes) has two silent-skip branches that mask regressions

- **Severity:** LOW
- **Class:** mechanical
- **Location:** `.agents/scripts/bkit-install.integration.test.ts:843-846` and `:853-856`
- **Issue:** The C3 test is structured as:

  ```ts
  if (!fs.existsSync(versionFile)) {
    // .bkit-version may not be written if template dirs are missing in test env; skip gracefully
    return;
  }
  ...
  if (fs.existsSync(routerFile)) {
    expect(routerKey).toBeDefined();
    expect(bkitVersion?.canonicalHashes?.[routerKey!]).toMatch(/^[0-9a-f]{64}$/);
  }
  ```

  Both branches are silent skips. If `runAutoModule` regresses to the point where it fails to write the router file (missing template, exception, registry-mismapping), or if `recordCanonicalHash`/postDispatch never fires, the test passes WITHOUT any assertion executing. The "if missing template, skip gracefully" early return masks the very failure mode the plan called out as the matrix row 4 contract: "`.bkit-version#canonicalHashes` records a sha256 entry for `.github/workflows/bkit-ci-router.yml` post-install."

- **Exploit / failure scenario:** A future regression to `runAutoModule` (for example, `templatePath` constructed incorrectly so `fs.existsSync(templatePath)` returns `false` and the function early-returns at line 929-934) would cause `routerFile` to never be written. The test enters both silent-skip branches (no `.bkit-version`, no router file) and passes green — even though the contract is violated.
- **Suggested fix:** Replace the silent skips with explicit setup that establishes the template prerequisite (or symlinks `PKG_ROOT` into the temp dir so `templatePath` resolves), then assert unconditionally:

  ```ts
  // Setup: ensure template is reachable by symlinking or copying .agents/templates from PKG_ROOT
  const realTemplate = path.resolve(__dirname, "../templates/.github/workflows/bkit-ci-router.yml");
  // ... copy into the test PKG_ROOT mirror so runAutoModule's templatePath check passes ...

  runCoreModuleForC3(ctx);
  runAutoModule(ctx);
  for (const cb of postDispatch) cb();

  const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
  expect(fs.existsSync(versionFile)).toBe(true);

  const bkitVersion = readBkitVersion(versionFile);
  const routerKey = Object.keys(bkitVersion?.canonicalHashes ?? {}).find((k) =>
    k.includes("bkit-ci-router.yml"),
  );
  expect(routerKey).toBeDefined();
  expect(bkitVersion?.canonicalHashes?.[routerKey!]).toMatch(/^[0-9a-f]{64}$/);
  expect(fs.existsSync(path.join(tmpDir, ".github", "workflows", "bkit-ci-router.yml"))).toBe(true);
  ```

## Notes (informational, not findings)

- **Router strict-`commentId` precondition couples to upstream best-effort `save_comment` (architectural).** Step 1 sub-step 4 raises Failure Path if `.[-1].commentId == ""`. But sub-step 7 then calls `save_comment({ issueId, body })` to CREATE a new comment anyway (capturing the new id into `{COMMENT_ID}`), so the upstream `commentId` is not actually consumed for any append. If upstream's `save_comment` retry-once-then-continue policy left `commentId` empty, the router refuses to dispatch — even though it could have functioned without the upstream commentId. This couples router liveness to upstream Linear API success, contradicting the plan's stated "save\_\* is best-effort; NEVER gate" rule (line 23). Out of mechanical scope; flag for follow-up plan if observed in production.
- **GHA pwn-request surface (architectural — same as prior challenge).** `bkit-ci-router.yml` triggers on `workflow_run`, then `actions/checkout@v4 with ref: ${{ github.event.workflow_run.head_sha }}` checks out the head SHA (potentially attacker-controlled if a fork PR triggered upstream CI), then `pnpm install --frozen-lockfile` executes lifecycle scripts, all in a context where `ANTHROPIC_API_KEY` and `GH_BKIT_TOKEN` secrets are available BEFORE any label gate runs (label gate is Step 3 of the orchestrator, executed inside `claude-code-action@v1`, which runs AFTER `pnpm install`). Mitigations: `feat/**` branch filter is convention-only; `frozen-lockfile` blocks dep-tampering but not lifecycle scripts. Defending requires architectural changes (e.g., move `actions/checkout` until after a label-gate job that uses a different runner context, or `pnpm install --ignore-scripts`, or `pull_request_target` patterns). Out of scope for current cycle.
- **FID format validation gap (LOW — informational, not exploitable in practice).** Router accepts any branch matching `^feat/.+`; FID = `$BRANCH` minus `feat/` prefix. Upstream `bkit-build.md:97` enforces `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`, but the router's branch-derived FID has only the empty/equality guards. Git refname rules block `..` and most metacharacters, so path-traversal is not exploitable, but a malformed branch (e.g. `feat/UPPERCASE`) would yield a FID that doesn't match the canonical pattern; subsequent file-existence checks would fail naturally. Defense-in-depth only; not in scope.
- **Stale-run guard variable mismatch (LOW — informational, same as prior).** Step 4 compares `gh run list --branch ... --limit 1`'s `headSha` against `gh pr view`'s `headRefOid`. The intent ("is THIS router invocation for a stale SHA?") would be more directly satisfied by `CI_RUN_HEAD_SHA == PR_HEAD_SHA`. Functionally OK because `cancel-in-progress: true` mitigates the race window, but the variable choice still doesn't directly express the intent. Out of scope.
