// bkit-modules.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, printSink, ws }
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → ci → lint → git-hooks
// .bkit-version is written LAST — in postDispatch after ALL modules complete (MED-4).
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { writeTier1, writeTier2, writeTier3 } from "./bkit-tiers.js";
import { runPayload, applyT1, applyT2, applyT3 } from "./bkit-install.js";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
function listMdFiles(dir, prefix) {
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => (prefix ? f.startsWith(prefix) : true));
}
function installFile(srcPath, destPath, transform, dryRun) {
    if (!transform) {
        if (fs.existsSync(destPath)) {
            const src = fs.readFileSync(srcPath);
            const dest = fs.readFileSync(destPath);
            if (src.equals(dest))
                return false;
        }
        if (!dryRun)
            fs.copyFileSync(srcPath, destPath);
        return true;
    }
    const src = fs.readFileSync(srcPath, "utf-8");
    const transformed = transform(src);
    if (fs.existsSync(destPath)) {
        const existing = fs.readFileSync(destPath, "utf-8");
        if (existing === transformed)
            return false;
    }
    if (!dryRun)
        fs.writeFileSync(destPath, transformed, "utf-8");
    return true;
}
function removeOrphans(destDir, sourceFiles, dryRun, prefix) {
    const BKIT_PREFIX = "bkit-";
    if (!fs.existsSync(destDir))
        return [];
    const removed = [];
    for (const f of fs.readdirSync(destDir)) {
        if (!f.endsWith(".md"))
            continue;
        if (prefix && !f.startsWith(prefix))
            continue;
        if (!sourceFiles.has(f)) {
            if (!dryRun)
                fs.rmSync(path.join(destDir, f));
            removed.push(f);
        }
    }
    return removed;
}
// Resolve the package root at runtime (same logic as bkit-init.ts).
function getPkgRoot() {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    return scriptDir.endsWith(`${path.sep}.agents${path.sep}scripts`)
        ? path.resolve(scriptDir, "..", "..")
        : path.resolve(scriptDir, "..");
}
// ---------------------------------------------------------------------------
// Core template files — directories/basenames owned ONLY by core module.
// These are templates that don't belong to ci/lint/git-hooks/claude/cursor modules.
// ---------------------------------------------------------------------------
// Top-level template directories/files that belong to core (not other modules)
const CORE_TEMPLATE_DIRS = new Set(["docs"]);
// Top-level template files (non-directory) that belong to core
const CORE_TEMPLATE_FILES = new Set(["AGENTS.md", "CLAUDE.md", "gitignore"]);
// Template subdirectories that belong to non-core modules (skip in core pass)
const NON_CORE_TEMPLATE_DIRS = new Set([
    ".github",
    ".vale",
    ".vale.ini",
    ".husky",
    ".prettierignore",
    ".cursor",
    ".claude",
]);
// Run templates pass only for core-owned files (top-level md files, docs/, .agents/ subtemplates).
// Each other module handles its own template files directly.
function runCoreTemplates(dryRun, pkgRoot, tokens, ws, logPrefix) {
    const root = path.join(pkgRoot, ".agents", "templates");
    if (!fs.existsSync(root))
        return;
    const tag = dryRun ? "[dry-run] " : "";
    // Process top-level entries
    for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
        const name = ent.name;
        // Skip non-core module dirs/files
        if (NON_CORE_TEMPLATE_DIRS.has(name))
            continue;
        // Only process known core files or core dirs
        if (!CORE_TEMPLATE_FILES.has(name) && !CORE_TEMPLATE_DIRS.has(name) && !ent.isDirectory()) {
            // Allow slop-scan.config.json through (lint module handles it), skip others
            continue;
        }
        if (ent.isDirectory() && !CORE_TEMPLATE_DIRS.has(name))
            continue;
        const srcPath = path.join(root, name);
        if (ent.isFile()) {
            // Remap (e.g. gitignore → .gitignore)
            const destName = name === "gitignore" ? ".gitignore" : name;
            const dstPath = destName;
            const prevLen = ws.writes.length;
            writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}core: ${dstPath}`);
            }
        }
        else if (ent.isDirectory()) {
            // Process the directory recursively
            processCoreTemplateDir(srcPath, name, dryRun, tokens, ws, logPrefix);
        }
    }
    // Note: .agents/ subtemplates in templates/.agents/ are intentionally NOT processed here.
    // They are handled by copyAdditive (which copies PKG_AGENTS → consumer .agents/ additively).
    // Processing them here would cause dry-run parity issues since copyAdditive skips existing files
    // in live mode but runCoreTemplates would re-record them in dry-run mode.
}
function processCoreTemplateDir(srcDir, relBase, dryRun, tokens, ws, logPrefix) {
    const tag = dryRun ? "[dry-run] " : "";
    if (!fs.existsSync(srcDir))
        return;
    for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, ent.name);
        const relPath = path.join(relBase, ent.name);
        if (ent.isDirectory()) {
            processCoreTemplateDir(srcPath, relPath, dryRun, tokens, ws, logPrefix);
        }
        else if (ent.isFile()) {
            const dstPath = relPath;
            const prevLen = ws.writes.length;
            writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}core: ${dstPath}`);
            }
        }
    }
}
// ---------------------------------------------------------------------------
// runCoreModule — payload pass + core templates + .bkit-version (LAST)
// ---------------------------------------------------------------------------
// `.bkit-version` excluded: it's a runtime artifact written by postDispatch,
// never source of truth. Including it would pollute consumer `.agents/` and
// break the dry-run/install parity check (postDispatch suppresses its own
// write when the file already matches pkgVersion).
const COPY_EXCLUDE = new Set(["skills", "scripts", "README.md", ".bkit-version"]);
function copyAdditive(src, dst, dryRun, log, relRoot) {
    let writes = 0;
    if (!fs.existsSync(src))
        return 0;
    const stats = fs.statSync(src);
    if (stats.isFile()) {
        if (fs.existsSync(dst))
            return 0;
        if (!dryRun) {
            fs.mkdirSync(path.dirname(dst), { recursive: true });
            fs.copyFileSync(src, dst);
            fs.chmodSync(dst, stats.mode);
        }
        log(path.relative(relRoot, dst));
        return 1;
    }
    if (!dryRun)
        fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        writes += copyAdditive(path.join(src, entry.name), path.join(dst, entry.name), dryRun, log, relRoot);
    }
    return writes;
}
export function runCoreModule(ctx) {
    const { dryRun, ws, printSink, logPrefix, postDispatch } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const cwd = process.cwd();
    const PKG_ROOT = getPkgRoot();
    const PKG_AGENTS = path.join(PKG_ROOT, ".agents");
    const PKG_PACKAGE_JSON = path.join(PKG_ROOT, "package.json");
    if (!fs.existsSync(PKG_AGENTS)) {
        console.error(`${logPrefix} Packaged .agents/ not found at ${PKG_AGENTS} — package corrupt?`);
        process.exit(1);
    }
    if (!fs.existsSync(PKG_PACKAGE_JSON)) {
        console.error(`${logPrefix} package.json not found at ${PKG_PACKAGE_JSON} — package corrupt?`);
        process.exit(1);
    }
    const pkgVersion = JSON.parse(fs.readFileSync(PKG_PACKAGE_JSON, "utf-8")).version;
    const target = path.join(cwd, ".agents");
    // Capture first-install signal NOW (before any writes) — used for the post-install banner.
    // The actual .bkit-version write is deferred to postDispatch so that a mid-install crash
    // in a subsequent module does NOT leave .bkit-version on disk (which would suppress the
    // first-install banner on retry).
    const versionFile = path.join(target, ".bkit-version");
    const isFirstInstall = !fs.existsSync(versionFile);
    // 1. Additive .agents/ payload copy (core subdirs only, excluding COPY_EXCLUDE)
    console.log(`${logPrefix} ${tag}Running core payload copy`);
    for (const entry of fs.readdirSync(PKG_AGENTS, { withFileTypes: true })) {
        if (COPY_EXCLUDE.has(entry.name))
            continue;
        const srcPath = path.join(PKG_AGENTS, entry.name);
        const dstPath = path.join(target, entry.name);
        copyAdditive(srcPath, dstPath, dryRun, (rel) => {
            console.log(`${logPrefix} ${tag}copy: ${rel}`);
            // Note: copyAdditive writes are internal .agents/ payload management (not consumer outputs).
            // We log them but do NOT add to ws (ws tracks consumer output files for parity checks).
        }, cwd);
    }
    // 2. Payload pass (bkit-prefix sync for workflows/prompts + templates mirror)
    console.log(`${logPrefix} ${tag}Running payload pass`);
    const { writes: payloadWrites } = runPayload(dryRun);
    if (payloadWrites > 0) {
        console.log(`${logPrefix} ${tag}payload: ${payloadWrites} file(s) synced`);
    }
    // 3. Core templates pass (only core-owned template files: AGENTS.md, CLAUDE.md, .gitignore, docs/)
    // Each other module handles its own template files directly.
    console.log(`${logPrefix} ${tag}Running core templates pass`);
    runCoreTemplates(dryRun, PKG_ROOT, ctx.tokens, ws, logPrefix);
    // 4. .bkit-version write — deferred to postDispatch so it only persists when ALL modules succeed.
    // This ensures a mid-install crash in a subsequent module does not suppress the first-install
    // banner on retry (MED-4).
    postDispatch.push(() => {
        let needsVersionWrite = !fs.existsSync(versionFile);
        if (!needsVersionWrite) {
            const existing = fs.readFileSync(versionFile, "utf-8").trim();
            if (existing !== pkgVersion)
                needsVersionWrite = true;
        }
        if (needsVersionWrite) {
            if (!dryRun) {
                fs.mkdirSync(target, { recursive: true });
                fs.writeFileSync(versionFile, pkgVersion + "\n", "utf-8");
            }
            console.log(`${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`);
            ws.writes.push({ path: versionFile, action: "write" });
        }
    });
    // 5. First-run extra logging (only when .bkit-version was absent at start of install)
    if (isFirstInstall) {
        // Build the script block as a proper JSON object so values are copy-paste safe.
        const scriptEntries = JSON.stringify({
            "lint:prose": 'bash -c \'if command -v vale >/dev/null 2>&1; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale not in PATH — skipping"; fi\'',
            "lint:slop": "slop-scan scan .",
            "format:check": "prettier --check .",
            prepare: "husky install",
        }, null, 2)
            .split("\n")
            .slice(1, -1) // strip outer { }
            .map((l) => `   ${l}`)
            .join("\n");
        printSink.push(`
[bkit] First install detected (.bkit-version was absent). Post-install steps:

1. Add GH_BKIT_TOKEN to your GitHub Actions repository secrets:
   - Create a PAT with read:packages scope (classic) or Packages: read (fine-grained)
   - GitHub Settings → Secrets and variables → Actions → New repository secret
   - Name: GH_BKIT_TOKEN
   - See README.md ## Consumer CI auth for full setup.

2. Add these scripts to your package.json "scripts" block (copy-paste ready):
${scriptEntries}
`);
    }
}
// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------
const BKIT_PREFIX = "bkit-";
export function runClaudeModule(ctx) {
    const { dryRun, tokens, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const pairs = [
        [".agents/workflows", ".claude/commands"],
        [".agents/prompts", ".claude/agents"],
    ];
    for (const [src, dest] of pairs) {
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            if (installFile(path.join(src, f), path.join(dest, f), null, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
        }
    }
    // Tier 1 — fully managed: settings.json + preflight hook
    const PKG_ROOT = getPkgRoot();
    const claudeTemplates = path.join(PKG_ROOT, ".agents", "templates", ".claude");
    const tier1Files = [
        [path.join(claudeTemplates, "settings.json"), ".claude/settings.json"],
        [path.join(claudeTemplates, "hooks", "preflight.sh"), ".claude/hooks/preflight.sh"],
    ];
    for (const [src, dst] of tier1Files) {
        if (!fs.existsSync(src))
            continue;
        const prevLen = ws.writes.length;
        writeTier1(src, dst, tokens, dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}claude: ${dst}`);
        }
    }
}
// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------
export function runCursorModule(ctx) {
    const { dryRun, tokens, modelLookup, printSink, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    // Commands: T1 + T2
    {
        const src = ".agents/workflows";
        const dest = ".cursor/commands";
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            const transform = (c) => applyT2(applyT1(c));
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
        }
    }
    // Agents: T3
    {
        const src = ".agents/prompts";
        const dest = ".cursor/agents";
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            const transform = (c) => applyT3(c, modelLookup);
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
        }
    }
    // Tier 1 — fully managed: hooks.json, preflight, shared rules
    const PKG_ROOT = getPkgRoot();
    const cursorTemplates = path.join(PKG_ROOT, ".agents", "templates", ".cursor");
    const tier1Files = [
        [path.join(cursorTemplates, "hooks.json"), ".cursor/hooks.json"],
        [path.join(cursorTemplates, "hooks", "preflight.sh"), ".cursor/hooks/preflight.sh"],
        [
            path.join(cursorTemplates, "rules", "00-shared-rules.mdc"),
            ".cursor/rules/00-shared-rules.mdc",
        ],
    ];
    for (const [src, dst] of tier1Files) {
        if (!fs.existsSync(src))
            continue;
        const prevLen = ws.writes.length;
        writeTier1(src, dst, tokens, dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}cursor: ${dst}`);
        }
    }
    // Tier 3 — seed-or-print: settings.json + consumer infra files
    const tier3Files = [
        [
            path.join(cursorTemplates, "settings.json"),
            ".cursor/settings.json",
            CURSOR_SETTINGS_MERGE_INSTRUCTIONS,
        ],
        [
            path.join(cursorTemplates, "Dockerfile"),
            ".cursor/Dockerfile",
            CURSOR_DOCKERFILE_MERGE_INSTRUCTIONS,
        ],
        [
            path.join(cursorTemplates, "environment.json"),
            ".cursor/environment.json",
            CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS,
        ],
    ];
    for (const [src, dst, msg] of tier3Files) {
        if (!fs.existsSync(src))
            continue;
        const prevLen = ws.writes.length;
        const result = writeTier3(src, dst, dryRun, printSink, ws, msg);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}cursor: ${dst}`);
        }
        else if (result.suggested) {
            console.log(`${logPrefix} ${tag}cursor: ${dst} (exists; AI merge instructions printed)`);
        }
    }
}
function checkBkitTokenSecret(secretName = "GH_BKIT_TOKEN") {
    try {
        const out = execSync(`gh secret list --json name -q '.[].name'`, {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 5000,
        });
        const names = out
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        return names.includes(secretName) ? "present" : "missing";
    }
    catch {
        return "unknown";
    }
}
const GH_BKIT_TOKEN_MISSING_INSTRUCTIONS = `[bkit] GH_BKIT_TOKEN secret NOT FOUND in this repo's GitHub Actions secrets.

Without it, CI runs that install @cbartens/bkit will fail at
\`pnpm install --frozen-lockfile\` because the GHA runner cannot authenticate
against the GitHub Packages npm registry.

IMPORTANT — pnpm v7.20+ silent-ignore footgun: if GH_BKIT_TOKEN is unset in
the runner environment, pnpm silently ignores the entire .npmrc file and falls
back to npmjs.org. The failure appears as an opaque 401 from npmjs.org (package
not found), NOT as a "token missing" error. If you see a 401 during pnpm
install, check GH_BKIT_TOKEN first.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  1. Ensure a .npmrc file exists at the repo root with these two lines:

        @cbartens:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}

     The \${GH_BKIT_TOKEN} form uses env-variable interpolation — do NOT
     hardcode the token value. pnpm reads this at install time.

  2. Set the GH_BKIT_TOKEN secret on this repo. The token must be a GitHub
     PAT (classic or fine-grained) with read:packages scope (classic) OR
     Packages: read permission (fine-grained). Generate at:
     https://github.com/settings/tokens

     Then run ONE of these to set it:

        gh secret set GH_BKIT_TOKEN --body='<paste-token-here>'

        # or, if user prefers piping from a file:
        gh secret set GH_BKIT_TOKEN < /path/to/file/with/token

     Web alternative: GitHub repo → Settings → Secrets and variables →
     Actions → New repository secret. Name: GH_BKIT_TOKEN.

  3. Ensure the install step in .github/workflows/ci.yml passes the env var:

        - name: Install dependencies
          run: pnpm install --frozen-lockfile
          env:
            GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}

  Verify secret set: gh secret list | grep GH_BKIT_TOKEN
`;
// ---------------------------------------------------------------------------
// Vercel detection + auth instructions
//
// Vercel runs its own `pnpm install` in a fresh build container and does NOT
// inherit the GitHub Actions auth-shim. If the consumer deploys to Vercel,
// the same private-dep auth issue surfaces a second time. Heuristic: presence
// of vercel.json at the repo root or under apps/<name>/. If present, push a
// dedicated AI instruction block alongside the GH-side one.
// ---------------------------------------------------------------------------
function detectVercelProject(cwd) {
    if (fs.existsSync(path.join(cwd, "vercel.json")))
        return true;
    const appsDir = path.join(cwd, "apps");
    if (!fs.existsSync(appsDir) || !fs.statSync(appsDir).isDirectory())
        return false;
    for (const entry of fs.readdirSync(appsDir, { withFileTypes: true })) {
        if (!entry.isDirectory())
            continue;
        if (fs.existsSync(path.join(appsDir, entry.name, "vercel.json")))
            return true;
    }
    return false;
}
const VERCEL_AUTH_INSTRUCTIONS = `[bkit] vercel.json detected — Vercel needs its own registry auth. Vercel runs pnpm install in a separate build container and does NOT inherit GitHub Actions secrets automatically.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  1. Ensure a .npmrc file exists at the repo root with these two lines:

        @cbartens:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}

     Commit this .npmrc to the repo — Vercel reads it during its build.
     The \${GH_BKIT_TOKEN} form uses env-variable interpolation at install
     time; do NOT hardcode the token value.

  2. Remove any legacy git-shim installCommand from vercel.json. If vercel.json
     has an installCommand that injects a git-credential-helper insteadOf rewrite,
     Remove it. Replace with plain pnpm install (or remove the installCommand key
     entirely to use Vercel's default):

        "installCommand": "pnpm install"

     Or simply delete the installCommand key if no other flags are needed.

  3. Set GH_BKIT_TOKEN as a Vercel environment variable for each environment:

        vercel env add GH_BKIT_TOKEN preview
        vercel env add GH_BKIT_TOKEN production

     Or via web: Vercel project → Settings → Environment Variables.
     The token must be a GitHub PAT with read:packages scope (classic) or
     Packages: read permission (fine-grained).

  4. Trigger a redeploy (push a commit) and watch the Vercel build log
     for pnpm install succeeding with the package resolved from
     https://npm.pkg.github.com/.
`;
const GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS = `[bkit] Could not auto-check GH_BKIT_TOKEN secret (gh CLI unavailable, unauthenticated, or this isn't a GitHub repo yet).

Manually verify the GH_BKIT_TOKEN secret exists on the consumer's GitHub
repo. It is required for the seeded ci.yml install step to authenticate
against the GitHub Packages npm registry when installing @cbartens/bkit.

IMPORTANT — pnpm v7.20+ silent-ignore footgun: if GH_BKIT_TOKEN is unset in
the runner environment, pnpm silently ignores the entire .npmrc file and falls
back to npmjs.org. The failure appears as an opaque 401 from npmjs.org (package
not found), NOT as a "token missing" error. If you see a 401 during pnpm
install, check GH_BKIT_TOKEN first.

INSTRUCTIONS FOR AN AI AGENT:

  1. Ensure a .npmrc file exists at the repo root with these two lines:

        @cbartens:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}

     The \${GH_BKIT_TOKEN} form uses env-variable interpolation — do NOT
     hardcode the token value.

  2. Once \`gh\` is installed and authenticated (\`gh auth login\`), verify:

        gh secret list | grep GH_BKIT_TOKEN

     If absent, the token must be a GitHub PAT with read:packages scope
     (classic) or Packages: read permission (fine-grained). Set it:

        gh secret set GH_BKIT_TOKEN --body='<paste-token-here>'

  3. Ensure the install step in .github/workflows/ci.yml passes the env var:

        - name: Install dependencies
          run: pnpm install --frozen-lockfile
          env:
            GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}
`;
// ---------------------------------------------------------------------------
// AI-actionable Tier 3 merge instructions
//
// Each constant is a self-contained instruction block: any AI agent
// (Claude/Cursor/Copilot/etc.) reading the install output can paste it as
// a prompt and apply the required merge without referring back to bkit
// docs. Use {{TEMPLATE_CONTENT}} as a placeholder — writeTier3 substitutes
// the live template content at print time.
// ---------------------------------------------------------------------------
const CI_YML_MERGE_INSTRUCTIONS = `[bkit] .github/workflows/ci.yml exists — bkit cannot safely YAML-merge jobs. Manual merge required.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .github/workflows/ci.yml. Compare it to the bkit reference workflow
  below (which represents the complete recommended CI gates for any bkit
  consumer). Your existing workflow likely has additional consumer-specific
  jobs and triggers — preserve those.

  Required merge actions:
  1. Ensure a .npmrc file exists at the repo root with these two lines:

        @cbartens:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}

     Commit this .npmrc file — the CI runner reads it during pnpm install.

  2. Ensure the install step passes GH_BKIT_TOKEN from the repo secret:

        - name: Install dependencies
          run: pnpm install --frozen-lockfile
          env:
            GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}

  3. Remove any 'Configure private-repo auth' step (git config --global
     url."...cbartens/bkit...".insteadOf "...") — this git auth-shim is
     obsolete. The .npmrc + env var approach replaces it entirely.

  4. Ensure the GitHub repo secret GH_BKIT_TOKEN is set with a PAT that has
     read:packages scope (classic) or Packages: read permission (fine-grained).

  5. Ensure 'package.json' has '"packageManager": "pnpm@<version>"' set.
     pnpm/action-setup@v4 reads this as single source of truth and will
     fail if it is missing or conflicts with a 'with: version:' block.

  6. Ensure the package.json scripts referenced by the workflow exist:
     "format:check", "lint:prose", "lint:slop". Run 'bkit install --lint'
     to seed them, or add manually.

  Do NOT remove or duplicate top-level 'name:', 'on:', or 'jobs:' keys.
  YAML allows only one of each per file.

  --- begin bkit reference workflow ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference workflow ---

  After merging, push to a feature branch and verify the workflow runs to
  green before merging to your default branch.
`;
const VALE_INI_MERGE_INSTRUCTIONS = `[bkit] .vale.ini exists — bkit cannot safely INI-merge (core options must precede [glob] sections per Vale spec). Manual merge required.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .vale.ini. Compare it to the bkit reference content below.

  Required merge actions:
  1. Ensure these three CORE options appear at the TOP of the file (above
     any [glob] section). If they are already present with different
     values, prefer the existing value:
        StylesPath = .vale/styles
        MinAlertLevel = warning
        Packages = write-good
  2. Ensure the SCOPED sections from the reference are present below the
     core options. If a section header (e.g. '[.agents/**]' or '[*.md]')
     already exists in the file, merge the rules into it rather than
     duplicating the header.
  3. Run 'vale sync' once after merging to install any newly-listed
     Packages (e.g. 'write-good').

  Vale will reject the file with error E201 if any core option appears
  AFTER a [glob] section, so ordering matters.

  --- begin bkit reference .vale.ini ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .vale.ini ---

  After merging, run 'vale .agents/' (or your scoped path) to verify the
  rules apply with no parse errors.
`;
const SLOP_SCAN_MERGE_INSTRUCTIONS = `[bkit] slop-scan.config.json exists — bkit will not overwrite. Review the reference defaults and merge if useful.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open slop-scan.config.json. Compare against the bkit reference below.
  Merge any new patterns/exclusions you find useful into the existing
  file. Keep your existing project-specific entries.

  --- begin bkit reference slop-scan.config.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference slop-scan.config.json ---
`;
const CURSOR_SETTINGS_MERGE_INSTRUCTIONS = `[bkit] .cursor/settings.json exists — bkit will not overwrite consumer Cursor config. Review the reference defaults and merge if useful.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/settings.json. Compare against the bkit reference below.
  Merge any new keys (e.g. plugin allowlists, MCP entries) you want.
  Keep your existing project-specific entries.

  --- begin bkit reference .cursor/settings.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/settings.json ---
`;
const CURSOR_DOCKERFILE_MERGE_INSTRUCTIONS = `[bkit] .cursor/Dockerfile exists — bkit will not overwrite. Reference shown below for comparison only.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/Dockerfile. The bkit reference is a minimal Cursor cloud-agent
  base image. If your file diverges intentionally (custom system deps,
  alternative base image, project-specific tooling), keep your version.
  Otherwise consider syncing to the reference.

  --- begin bkit reference .cursor/Dockerfile ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/Dockerfile ---
`;
const CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS = `[bkit] .cursor/environment.json exists — bkit will not overwrite. Reference shown below for comparison only.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/environment.json. Compare against the bkit reference below.
  Merge any new fields (e.g. terminal/install/start hooks) you want, but
  keep project-specific overrides.

  --- begin bkit reference .cursor/environment.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/environment.json ---
`;
// ---------------------------------------------------------------------------
// runCiModule — .github/workflows/ci.yml (Tier 3 seed-or-print)
//
// Switched from Tier 2 to Tier 3 in v0.2.1 — appending a complete workflow
// to an existing ci.yml produces duplicate top-level keys (invalid GHA YAML).
// Bkit can't safely YAML-merge, so we seed when absent and print AI-actionable
// merge instructions when present.
// ---------------------------------------------------------------------------
export function runCiModule(ctx) {
    const { dryRun, tokens, ws, printSink, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const PKG_ROOT = getPkgRoot();
    const templatePath = path.join(PKG_ROOT, ".agents", "templates", ".github", "workflows", "ci.yml");
    if (!fs.existsSync(templatePath)) {
        console.warn(`${logPrefix} CI template not found at ${templatePath} — skipping CI module`);
        return;
    }
    const dstPath = path.join(".github", "workflows", "ci.yml");
    const prevLen = ws.writes.length;
    const result = writeTier3(templatePath, dstPath, dryRun, printSink, ws, CI_YML_MERGE_INSTRUCTIONS, tokens);
    if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}ci: ${dstPath}`);
    }
    else if (result.suggested) {
        console.log(`${logPrefix} ${tag}ci: ${dstPath} (exists; AI merge instructions printed)`);
    }
    // Always remind which package.json scripts the workflow expects.
    // Seeded by --lint (and prepare); --ci alone does NOT add them.
    printSink.push(`[bkit] ci: the generated ci.yml invokes the following package.json scripts — ensure they exist (run \`bkit install --lint\` to seed them, or add manually):
   "lint:prose": "bash -c 'if command -v vale >/dev/null 2>&1; then vale $(find . -name \"*.md\" -not -path \"*/node_modules/*\"); else echo \"[bkit] vale not in PATH — skipping\"; fi'"
   "lint:slop": "slop-scan scan ."
   "format:check": "prettier --check ."`);
    // Check whether GH_BKIT_TOKEN secret is set on the consumer's GitHub repo.
    // The seeded ci.yml auth-shim depends on it. Skip the check on dry-run so
    // bkit check stays read-only and predictable.
    if (!dryRun) {
        const secretStatus = checkBkitTokenSecret();
        if (secretStatus === "missing") {
            printSink.push(GH_BKIT_TOKEN_MISSING_INSTRUCTIONS);
        }
        else if (secretStatus === "unknown") {
            printSink.push(GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS);
        }
        // "present" → silent, no extra noise
    }
    // Vercel surface — separate auth provisioning required if the consumer
    // deploys via Vercel. Heuristic-only (presence of vercel.json); skip
    // silently if the consumer doesn't use Vercel.
    if (detectVercelProject(process.cwd())) {
        printSink.push(VERCEL_AUTH_INSTRUCTIONS);
    }
}
// ---------------------------------------------------------------------------
// runLintModule — vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore
// ---------------------------------------------------------------------------
export function runLintModule(ctx) {
    const { dryRun, tokens, printSink, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const PKG_ROOT = getPkgRoot();
    const templatesBase = path.join(PKG_ROOT, ".agents", "templates");
    // .vale.ini — Tier 3 (seed-or-print) since v0.2.1
    // Was Tier 2 but appending a managed-block at EOF puts core options after
    // [glob] sections, which Vale rejects (E201). Tier 3 seeds the whole file
    // when absent and prints AI-actionable merge instructions when present.
    const valeIniSrc = path.join(templatesBase, ".vale.ini");
    if (fs.existsSync(valeIniSrc)) {
        const valeDst = ".vale.ini";
        const prevLen = ws.writes.length;
        const valeRes = writeTier3(valeIniSrc, valeDst, dryRun, printSink, ws, VALE_INI_MERGE_INSTRUCTIONS);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${valeDst}`);
        }
        else if (valeRes.suggested) {
            console.log(`${logPrefix} ${tag}lint: ${valeDst} (exists; AI merge instructions printed)`);
        }
    }
    // .vale/styles/House/ — Tier 1 (fully managed)
    const valeStylesSrc = path.join(templatesBase, ".vale", "styles", "House");
    if (fs.existsSync(valeStylesSrc)) {
        const valeStylesDst = path.join(".vale", "styles", "House");
        ensureDir(valeStylesDst);
        for (const file of fs.readdirSync(valeStylesSrc)) {
            const srcPath = path.join(valeStylesSrc, file);
            const dstPath = path.join(valeStylesDst, file);
            if (!fs.statSync(srcPath).isFile())
                continue;
            const prevLen = ws.writes.length;
            writeTier1(srcPath, dstPath, tokens, dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}lint: ${dstPath}`);
            }
        }
    }
    // slop-scan.config.json — Tier 3 (seed-or-print)
    const slopSrc = path.join(templatesBase, "slop-scan.config.json");
    if (fs.existsSync(slopSrc)) {
        const slopDst = "slop-scan.config.json";
        const prevLen = ws.writes.length;
        const slopRes = writeTier3(slopSrc, slopDst, dryRun, printSink, ws, SLOP_SCAN_MERGE_INSTRUCTIONS);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${slopDst}`);
        }
        else if (slopRes.suggested) {
            console.log(`${logPrefix} ${tag}lint: ${slopDst} (exists; AI merge instructions printed)`);
        }
    }
    // .prettierignore — Tier 2 hash-comment
    const prettierSrc = path.join(templatesBase, ".prettierignore");
    if (fs.existsSync(prettierSrc)) {
        const prettierDst = ".prettierignore";
        const prevLen = ws.writes.length;
        writeTier2(prettierSrc, prettierDst, tokens, "hash-comment", dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${prettierDst}`);
        }
    }
}
// ---------------------------------------------------------------------------
// runGitHooksModule — .husky/pre-commit + .husky/pre-push (Tier 2 hash-comment)
// ---------------------------------------------------------------------------
export function runGitHooksModule(ctx) {
    const { dryRun, tokens, printSink, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const PKG_ROOT = getPkgRoot();
    const huskyTemplatesDir = path.join(PKG_ROOT, ".agents", "templates", ".husky");
    if (!fs.existsSync(huskyTemplatesDir)) {
        console.warn(`${logPrefix} .husky templates not found at ${huskyTemplatesDir} — skipping git-hooks module`);
        return;
    }
    ensureDir(".husky");
    for (const hookName of ["pre-commit", "pre-push"]) {
        const srcPath = path.join(huskyTemplatesDir, hookName);
        if (!fs.existsSync(srcPath))
            continue;
        const dstPath = path.join(".husky", hookName);
        const prevLen = ws.writes.length;
        writeTier2(srcPath, dstPath, tokens, "hash-comment", dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}git-hooks: ${dstPath}`);
            // Ensure hook is executable after write
            if (!dryRun && fs.existsSync(dstPath)) {
                fs.chmodSync(dstPath, 0o755);
            }
        }
    }
    // Print-sink: suggest prepare script
    printSink.push('[bkit] git-hooks: add "prepare": "husky install" to your package.json scripts to activate hooks.');
}
// ---------------------------------------------------------------------------
// MODULE_REGISTRY — maps ModuleFlag → ModuleFn
// ---------------------------------------------------------------------------
export const MODULE_REGISTRY = {
    core: runCoreModule,
    claude: runClaudeModule,
    cursor: runCursorModule,
    ci: runCiModule,
    lint: runLintModule,
    "git-hooks": runGitHooksModule,
    // "full" is never directly in the registry — resolveModules expands it to all modules
};
// Canonical dispatch order
export const MODULE_DISPATCH_ORDER = [
    "core",
    "claude",
    "cursor",
    "ci",
    "lint",
    "git-hooks",
];
/**
 * Dispatch modules in canonical order.
 * ctx.ws is populated by each module fn; printSink is flushed by caller.
 * After all modules complete, ctx.postDispatch callbacks are run in order.
 */
export function dispatchModules(modules, ctx) {
    for (const flag of MODULE_DISPATCH_ORDER) {
        if (!modules.has(flag))
            continue;
        const fn = MODULE_REGISTRY[flag];
        if (!fn)
            continue;
        fn(ctx);
    }
    // Run deferred finalisation callbacks (e.g. .bkit-version write) only after all modules succeed.
    for (const cb of ctx.postDispatch) {
        cb();
    }
}
