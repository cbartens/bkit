// bkit-postinstall.ts — Phase 3: re-detect AFTER writes; produce the unified output.
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync, execFileSync } from "node:child_process";
/**
 * Detect whether GH_BKIT_TOKEN is set in the shell environment.
 * Returns "present" or "missing" — never reads the value.
 */
export function detectShellToken() {
    return Boolean(process.env.GH_BKIT_TOKEN) ? "present" : "missing";
}
/**
 * Detect whether .npmrc has both required GH Packages registry lines.
 * - "present"  → both `@cbartens:registry=` and `_authToken=${GH_BKIT_TOKEN}` present
 * - "missing"  → .npmrc exists but lacks one or both lines (emit advisory)
 * - "unknown"  → .npmrc is absent (silent skip — absence alone is not misconfiguration)
 */
export function detectNpmrcAuth(cwd) {
    const npmrcPath = path.join(cwd, ".npmrc");
    if (!fs.existsSync(npmrcPath))
        return "unknown";
    const content = fs.readFileSync(npmrcPath, "utf-8");
    const hasRegistry = content.includes("@cbartens:registry=");
    const hasAuthToken = content.includes("_authToken=${GH_BKIT_TOKEN}");
    return hasRegistry && hasAuthToken ? "present" : "missing";
}
/**
 * Detect whether GH_BKIT_TOKEN secret is set on the consumer's GitHub repo.
 * Returns "present" | "missing" | "unknown".
 * "unknown" if gh CLI unavailable, unauthenticated, or not a GitHub repo.
 */
export function detectGhSecret(secretName = "GH_BKIT_TOKEN") {
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
/**
 * Detect whether a Vercel project exists in the consumer's repo.
 * Heuristic: presence of vercel.json at root or under apps/<name>/.
 */
export function detectVercelProject(cwd) {
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
/**
 * Detect whether GH_BKIT_TOKEN is present in a Vercel environment.
 * Short-circuits silently (returns null, no finding) if detectVercelProject is false.
 */
export function detectVercelEnv(env, cwd = process.cwd()) {
    if (!detectVercelProject(cwd))
        return "unknown";
    // Runtime guard: reject unexpected env values even though TypeScript narrows them.
    if (env !== "preview" && env !== "production")
        return "unknown";
    try {
        const out = execFileSync("vercel", ["env", "ls", env], {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 10000,
        });
        return out.includes("GH_BKIT_TOKEN") ? "present" : "missing";
    }
    catch {
        return "unknown";
    }
}
// ---------------------------------------------------------------------------
// Other post-install detectors
// ---------------------------------------------------------------------------
/**
 * Detect whether the ci.yml install step is missing GH_BKIT_TOKEN env mapping.
 * Returns null if no ci.yml or if the step structure is unrecognised (no false positives).
 *
 * Severity is elevated to "blocker" when `.npmrc` references `${GH_BKIT_TOKEN}` —
 * in that combination, the next CI run 401s opaquely against the registry. This
 * makes the finding render at the top of the checklist with the loudest label;
 * Phase 3 doesn't exit-1 (writes already happened) but visibility matches the risk.
 */
export function detectCiYmlMissingTokenEnv(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const content = fs.readFileSync(ciPath, "utf-8");
    // Only flag if we can clearly see an install step without the env mapping.
    // Require presence of an Install step before flagging (avoid false positives).
    if (!content.includes("pnpm install"))
        return null;
    // Use a regex to handle whitespace/quoting variations:
    //   GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}
    //   GH_BKIT_TOKEN: "${{ secrets.GH_BKIT_TOKEN }}"
    //   GH_BKIT_TOKEN:${{secrets.GH_BKIT_TOKEN}}
    if (/GH_BKIT_TOKEN\s*:\s*["']?\$\{\{\s*secrets\.GH_BKIT_TOKEN\s*\}\}["']?/.test(content))
        return null;
    // Elevate to blocker if .npmrc references ${GH_BKIT_TOKEN} — next CI run breaks.
    const npmrcPath = path.join(cwd, ".npmrc");
    let npmrcRequiresToken = false;
    if (fs.existsSync(npmrcPath)) {
        const npmrcContent = fs.readFileSync(npmrcPath, "utf-8");
        npmrcRequiresToken = npmrcContent.includes("${GH_BKIT_TOKEN}");
    }
    return {
        id: "ci-yml-missing-token-env",
        severity: npmrcRequiresToken ? "blocker" : "advisory",
        detect: npmrcRequiresToken
            ? ".github/workflows/ci.yml has a pnpm install step with no GH_BKIT_TOKEN env block, and .npmrc references ${GH_BKIT_TOKEN}. The next CI run will 401 against the GitHub Packages registry."
            : ".github/workflows/ci.yml contains a pnpm install step but no GH_BKIT_TOKEN env mapping.",
        action: "Add the following env block to the install step in .github/workflows/ci.yml:\n\n" +
            "    - name: Install dependencies\n" +
            "      run: pnpm install --frozen-lockfile\n" +
            "      env:\n" +
            "        GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}\n\n" +
            "Also confirm the secret exists: `gh secret list | grep GH_BKIT_TOKEN`. If absent: `gh secret set GH_BKIT_TOKEN --body=$GH_BKIT_TOKEN`.\n\n" +
            "This ensures the GitHub Actions runner can authenticate against the GitHub Packages npm registry.",
    };
}
/**
 * Detect whether vale is installed but write-good styles are not synced.
 * Returns null if vale is not on PATH (silent skip — not an error).
 */
export function detectValePackageNotSynced(cwd) {
    try {
        execSync("vale --version", {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 5000,
        });
    }
    catch {
        return null; // vale not on PATH — silent skip
    }
    if (fs.existsSync(path.join(cwd, ".vale", "styles", "write-good")))
        return null;
    return {
        id: "vale-package-not-synced",
        severity: "advisory",
        detect: "vale is on PATH but .vale/styles/write-good/ is absent — vale packages not synced.",
        action: "Run `vale sync` (one-time per repo) to download the write-good package. The lint:prose script soft-skips when write-good is absent, but prose linting won't work until synced.",
    };
}
/**
 * Detect whether new devDependencies were added in this run (via WriteSet).
 * Returns null if no devDeps were added.
 */
export function detectDevDepsNeedFetch(ws) {
    const hasDevDepsAdded = ws.writes.some((w) => w.devDepsAdded && w.devDepsAdded.length > 0);
    if (!hasDevDepsAdded)
        return null;
    const allAdded = ws.writes
        .flatMap((w) => w.devDepsAdded ?? [])
        .filter((v, i, a) => a.indexOf(v) === i);
    return {
        id: "devdeps-need-fetch",
        severity: "advisory",
        detect: `bkit added [${allAdded.join(", ")}] to package.json devDependencies in this run.`,
        action: "Run `pnpm install` to fetch the newly-added devDependencies before running `pnpm bkit check` or pushing.",
    };
}
// ---------------------------------------------------------------------------
// GH_BKIT_TOKEN action strings (verbatim from bkit-modules.ts constants)
// ---------------------------------------------------------------------------
const GH_BKIT_TOKEN_MISSING_ACTION = "Ensure a .npmrc file exists at the repo root with these two lines:\n\n" +
    "    @cbartens:registry=https://npm.pkg.github.com\n" +
    "    //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n\n" +
    "Then set the GH_BKIT_TOKEN secret on this repo. The token must be a GitHub PAT (classic or fine-grained) with read:packages scope (classic) OR Packages: read permission (fine-grained). Generate at: https://github.com/settings/tokens\n\n" +
    "Run ONE of these to set it:\n\n" +
    "    gh secret set GH_BKIT_TOKEN --body='<paste-token-here>'\n\n" +
    "Ensure the install step in .github/workflows/ci.yml passes the env var:\n\n" +
    "    - name: Install dependencies\n" +
    "      run: pnpm install --frozen-lockfile\n" +
    "      env:\n" +
    "        GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}\n\n" +
    "IMPORTANT — pnpm v7.20+ silent-ignore footgun: if GH_BKIT_TOKEN is unset in the runner environment, pnpm silently ignores the entire .npmrc file and falls back to npmjs.org. The failure appears as an opaque 401 from npmjs.org (package not found), NOT as a 'token missing' error. If you see a 401 during pnpm install, check GH_BKIT_TOKEN first.\n\n" +
    "Verify secret set: gh secret list | grep GH_BKIT_TOKEN";
const GH_BKIT_TOKEN_UNKNOWN_ACTION = "Could not auto-check GH_BKIT_TOKEN secret (gh CLI unavailable, unauthenticated, or this isn't a GitHub repo yet).\n\n" +
    "Manually verify the GH_BKIT_TOKEN secret exists on the consumer's GitHub repo. It is required for the seeded ci.yml install step to authenticate against the GitHub Packages npm registry when installing @cbartens/bkit.\n\n" +
    "IMPORTANT — pnpm v7.20+ silent-ignore footgun: if GH_BKIT_TOKEN is unset in the runner environment, pnpm silently ignores the entire .npmrc file and falls back to npmjs.org. The failure appears as an opaque 401 from npmjs.org (package not found), NOT as a 'token missing' error.\n\n" +
    "Once `gh` is installed and authenticated (`gh auth login`), verify:\n\n" +
    "    gh secret list | grep GH_BKIT_TOKEN\n\n" +
    "If absent, set it:\n\n" +
    "    gh secret set GH_BKIT_TOKEN --body='<paste-token-here>'";
const VERCEL_MISSING_ACTION = "Ensure a .npmrc file exists at the repo root with these two lines:\n\n" +
    "    @cbartens:registry=https://npm.pkg.github.com\n" +
    "    //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n\n" +
    "Commit this .npmrc to the repo — Vercel reads it during its build.\n\n" +
    "Remove any legacy git-shim installCommand from vercel.json. Replace with plain pnpm install (or remove the installCommand key entirely):\n\n" +
    '    "installCommand": "pnpm install"\n\n' +
    "Set GH_BKIT_TOKEN as a Vercel environment variable for each environment:\n\n" +
    "    vercel env add GH_BKIT_TOKEN preview\n" +
    "    vercel env add GH_BKIT_TOKEN production\n\n" +
    "Or via web: Vercel project → Settings → Environment Variables.\n" +
    "The token must be a GitHub PAT with read:packages scope (classic) or Packages: read permission (fine-grained).";
// ---------------------------------------------------------------------------
// formatChecklist — pure renderer
// ---------------------------------------------------------------------------
/**
 * Format a list of findings into the post-install checklist banner.
 * Returns `""` when findings is empty — callers can `if (banner)` to stay silent.
 * No console.log inside — caller logs.
 *
 * Format per finding:
 *   --- i/N [severity] id ---
 *   DETECT: ...
 *   ACTION: ...
 */
export function formatChecklist(findings) {
    if (findings.length === 0)
        return "";
    const banner = "=".repeat(58);
    const total = findings.length;
    const lines = [];
    lines.push(`\n${banner}`);
    lines.push(`[bkit] Post-install checklist (${total} item${total === 1 ? "" : "s"})`);
    lines.push(banner);
    lines.push("\nINSTRUCTIONS FOR AN AI AGENT — copy this entire block into a\n" +
        "coding assistant to apply each item. Each ACTION is self-contained.\n");
    for (let i = 0; i < findings.length; i++) {
        const f = findings[i];
        lines.push(`\n--- ${i + 1}/${total} [${f.severity}] ${f.id} ---`);
        lines.push(`DETECT: ${f.detect}`);
        lines.push(`ACTION: ${f.action}`);
    }
    lines.push(`\n${banner}\n`);
    return lines.join("\n");
}
// ---------------------------------------------------------------------------
// runPostInstallCheck — main Phase 3 entry point
// ---------------------------------------------------------------------------
/**
 * Re-run token-surface + ci.yml + vale-sync + devDeps detectors after writes.
 *
 * - Intra-phase dedup: Phase 3 findings are deduped by id (first occurrence wins).
 * - Cross-phase dedup: Phase 3 wins on id conflict (re-detection is more accurate).
 * - dryRun: if true, skip Phase 3 detectors and return preflightAdvisories as-is
 *   (check mode stays read-only; Phase 1 advisories still rendered by caller).
 *
 * cwd defaults to process.cwd().
 */
export function runPostInstallCheck(preflightAdvisories, ws, modules, cwd = process.cwd(), dryRun = false) {
    if (dryRun) {
        // Dry-run: skip Phase 3; return preflight advisories only (deduped defensively).
        return dedupeById([...preflightAdvisories]);
    }
    const phase3 = [];
    // Shell token
    const shellStatus = detectShellToken();
    if (shellStatus === "missing") {
        phase3.push({
            id: "gh-bkit-token-missing-shell",
            severity: "advisory",
            detect: "GH_BKIT_TOKEN is not set in the shell environment.",
            action: "Export GH_BKIT_TOKEN in your shell profile (e.g. ~/.zshrc or ~/.bashrc):\n\n    export GH_BKIT_TOKEN=<your-pat>\n\nThe token must be a GitHub PAT with read:packages scope (classic) or Packages: read permission (fine-grained). Generate at: https://github.com/settings/tokens",
        });
    }
    // .npmrc auth
    const npmrcStatus = detectNpmrcAuth(cwd);
    if (npmrcStatus === "missing") {
        phase3.push({
            id: "npmrc-missing-gh-packages",
            severity: "advisory",
            detect: ".npmrc exists but is missing the required @cbartens registry and/or _authToken lines.",
            action: "Add these two lines to .npmrc at the repo root:\n\n" +
                "    @cbartens:registry=https://npm.pkg.github.com\n" +
                "    //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n\n" +
                "The ${GH_BKIT_TOKEN} form uses env-variable interpolation — do NOT hardcode the token value. pnpm reads this at install time.",
        });
    }
    // "unknown" (absent) → silent skip per spec
    // GH secret
    const ghSecretStatus = detectGhSecret();
    if (ghSecretStatus === "missing") {
        phase3.push({
            id: "gh-bkit-token-secret-missing",
            severity: "advisory",
            detect: "gh secret list confirms GH_BKIT_TOKEN secret is NOT set on this GitHub repo.",
            action: GH_BKIT_TOKEN_MISSING_ACTION,
        });
    }
    else if (ghSecretStatus === "unknown") {
        phase3.push({
            id: "gh-bkit-token-secret-unknown",
            severity: "advisory",
            detect: "Could not verify GH_BKIT_TOKEN secret (gh CLI unavailable, unauthenticated, or not a GitHub repo).",
            action: GH_BKIT_TOKEN_UNKNOWN_ACTION,
        });
    }
    // Vercel env (only if a Vercel project is detected)
    if (detectVercelProject(cwd)) {
        const previewStatus = detectVercelEnv("preview", cwd);
        if (previewStatus === "missing") {
            phase3.push({
                id: "vercel-env-missing-preview",
                severity: "advisory",
                detect: "vercel.json detected but GH_BKIT_TOKEN is absent from Vercel preview environment.",
                action: VERCEL_MISSING_ACTION,
            });
        }
        const productionStatus = detectVercelEnv("production", cwd);
        if (productionStatus === "missing") {
            phase3.push({
                id: "vercel-env-missing-production",
                severity: "advisory",
                detect: "vercel.json detected but GH_BKIT_TOKEN is absent from Vercel production environment.",
                action: VERCEL_MISSING_ACTION,
            });
        }
        // "unknown" → silent skip (CLI absent / unauthed)
    }
    // ci.yml missing token env
    const ciYml = detectCiYmlMissingTokenEnv(cwd);
    if (ciYml)
        phase3.push(ciYml);
    // vale not synced
    const vale = detectValePackageNotSynced(cwd);
    if (vale)
        phase3.push(vale);
    // devDeps need fetch
    const devDeps = detectDevDepsNeedFetch(ws);
    if (devDeps)
        phase3.push(devDeps);
    // Intra-phase dedup (first occurrence wins)
    const deduped = dedupeById(phase3);
    // Dedupe the incoming preflightAdvisories (ctx.advisories may contain module-emitted
    // duplicates in addition to runPreflight's already-deduped output).
    const dedupedPreflight = dedupeById(preflightAdvisories);
    // Cross-phase dedup: Phase 3 wins on conflict (remove preflight entries whose id
    // appears in Phase 3, then merge Phase 3 at the front for the winning position).
    const phase3Ids = new Set(deduped.map((f) => f.id));
    const filteredPreflight = dedupedPreflight.filter((f) => !phase3Ids.has(f.id));
    // Final order: preflight advisories (that weren't superseded) first, then Phase 3
    return [...filteredPreflight, ...deduped];
}
// ---------------------------------------------------------------------------
// Dedup helper (exported for unit-testability; consumers should not rely on this)
// ---------------------------------------------------------------------------
export function dedupeById(findings) {
    const seen = new Set();
    return findings.filter((f) => {
        if (seen.has(f.id))
            return false;
        seen.add(f.id);
        return true;
    });
}
