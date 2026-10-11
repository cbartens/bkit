// checks/after/vercel.ts — the Vercel project link, env and install command auth.
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
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
 * Detect whether BKIT_GH_TOKEN_INSTALL is present in a Vercel environment.
 *
 * B3 Vercel CLI hang guard: pre-checks `.vercel/project.json` and SKIPS `vercel env ls`
 * when the file is absent. Does NOT shell out unless the project file exists — this
 * avoids the CLI login prompt / TTY hang in non-interactive CI environments.
 *
 * Fallback: if detectVercelProject finds vercel.json but .vercel/project.json is absent,
 * the project is not yet linked to a Vercel deployment — skip CLI call.
 */
export function detectVercelEnv(env, cwd = process.cwd()) {
    if (!detectVercelProject(cwd))
        return "unknown";
    // Runtime guard: reject unexpected env values even though TypeScript narrows them.
    if (env !== "preview" && env !== "production")
        return "unknown";
    // B3: Guard against `vercel env ls` hanging when the project is not linked.
    // `.vercel/project.json` is written by `vercel link` — absent means not linked.
    // Without this guard, `vercel env ls` blocks on a TTY login prompt in CI.
    const vercelProjectFile = path.join(cwd, ".vercel", "project.json");
    if (!fs.existsSync(vercelProjectFile))
        return "unknown";
    try {
        const out = execFileSync("vercel", ["env", "ls", env], {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 10000,
        });
        return out.includes("BKIT_GH_TOKEN_INSTALL") ? "present" : "missing";
    }
    catch {
        return "unknown";
    }
}
/**
 * Detect Vercel projects whose `vercel.json` does not authenticate to GH Packages in its
 * install step. Vercel runs `pnpm install` in a fresh container with no pre-install shell
 * hook, so the token must be written by an `installCommand` that runs
 * `pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"` before install — the
 * registry-only project .npmrc carries no token on pnpm >=10.34.3. A vercel.json with no
 * installCommand (or one whose installCommand lacks that `pnpm config set`) 401s on the
 * @cbartens/bkit download even when BKIT_GH_TOKEN_INSTALL is present in the Vercel env.
 *
 * Uses a raw-content regex (like detectCiYmlMissingTokenEnv), not JSON.parse, so a
 * non-standard-but-valid vercel.json still matches.
 *
 * Returns the offending vercel.json paths (relative to cwd); empty when all authenticate.
 */
export function detectVercelInstallCommandMissingAuth(cwd) {
    // `\\?["']?` tolerates the JSON-escaped (`\"//npm…`), plain-quoted, and unquoted forms
    // an installCommand string may take inside vercel.json.
    const authPattern = /pnpm\s+config\s+set\s+\\?["']?\/\/npm\.pkg\.github\.com\/:_authToken=/;
    const offenders = [];
    const check = (file) => {
        if (!fs.existsSync(file))
            return;
        if (!authPattern.test(fs.readFileSync(file, "utf-8")))
            offenders.push(path.relative(cwd, file));
    };
    check(path.join(cwd, "vercel.json"));
    const appsDir = path.join(cwd, "apps");
    if (fs.existsSync(appsDir)) {
        for (const entry of fs.readdirSync(appsDir, { withFileTypes: true })) {
            if (entry.isDirectory())
                check(path.join(appsDir, entry.name, "vercel.json"));
        }
    }
    return offenders;
}
export const VERCEL_MISSING_ACTION = "Add the @cbartens registry mapping to .npmrc at the repo root (the token is NOT stored here):\n\n" +
    "    @cbartens:registry=https://npm.pkg.github.com\n\n" +
    "Commit this .npmrc — Vercel reads it during its build.\n\n" +
    "Vercel runs pnpm install in a fresh container and cannot run a pre-install shell step, so write the auth token via an installCommand in vercel.json:\n\n" +
    '    "installCommand": "pnpm config set //npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL && pnpm install"\n\n' +
    "Set BKIT_GH_TOKEN_INSTALL as a Vercel environment variable for each environment:\n\n" +
    "    vercel env add BKIT_GH_TOKEN_INSTALL preview\n" +
    "    vercel env add BKIT_GH_TOKEN_INSTALL production\n\n" +
    "Or via web: Vercel project → Settings → Environment Variables.\n" +
    "The token must be a GitHub PAT with read:packages scope (classic) or Packages: read permission (fine-grained).\n\n" +
    "Why the installCommand: pnpm >=10.34.3 does not authenticate a project-.npmrc ${BKIT_GH_TOKEN_INSTALL} env-substitution (it 401s on download), so the token must reach pnpm's user-level config via `pnpm config set` before install.";
