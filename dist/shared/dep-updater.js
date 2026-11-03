// shared/dep-updater.ts — which dependency updater a repo runs, read from the config files the
// updater itself reads.
import * as fs from "node:fs";
import * as path from "node:path";
import { readPackageJson } from "./package-json.js";
export const DEP_UPDATERS = ["renovate", "dependabot"];
export const DEP_UPDATER_NAMES = {
    renovate: "Renovate",
    dependabot: "Dependabot",
};
// Renovate's repository config locations, in its lookup order (docs.renovatebot.com
// § Configuration options); a `renovate` block in package.json comes last.
const RENOVATE_FILES = [
    "renovate.json",
    "renovate.jsonc",
    "renovate.json5",
    ".github/renovate.json",
    ".github/renovate.jsonc",
    ".github/renovate.json5",
    ".gitlab/renovate.json",
    ".gitlab/renovate.jsonc",
    ".gitlab/renovate.json5",
    ".renovaterc",
    ".renovaterc.json",
    ".renovaterc.jsonc",
    ".renovaterc.json5",
];
const DEPENDABOT_FILES = [".github/dependabot.yml", ".github/dependabot.yaml"];
const firstExisting = (cwd, files) => files.find((f) => fs.existsSync(path.join(cwd, f))) ?? null;
export function findDepUpdaterConfigs(cwd) {
    let renovate = firstExisting(cwd, RENOVATE_FILES);
    if (!renovate) {
        const read = readPackageJson(cwd);
        const block = read.ok ? read.pkg.renovate : undefined;
        if (block !== null && typeof block === "object" && !Array.isArray(block)) {
            renovate = "package.json";
        }
    }
    return { renovate, dependabot: firstExisting(cwd, DEPENDABOT_FILES) };
}
/** The one updater whose config is present; null when there is none, or both. */
export function detectDepUpdater(cwd) {
    const { renovate, dependabot } = findDepUpdaterConfigs(cwd);
    if (renovate && !dependabot)
        return "renovate";
    if (dependabot && !renovate)
        return "dependabot";
    return null;
}
