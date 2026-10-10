// bkit skills prune — ship's skill prune: uninstall every skill `.agents/skills.md` does not list.
//
// Build's install-skills step adds feature-specific skills with the skills CLI;
// ship removes them again before merge so they never reach dev. The candidates
// are the union of `.agents/skills/` folders and `skills-lock.json` keys: a skill
// whose folder is already gone still has a lock entry, and looping over folders
// alone leaves it installed. bkit's own `bkit-*` skills are never touched.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { COULD_NOT_RUN_EXIT_CODES } from "../../shared/package-manager.js";
import { CommandError, EXIT, git, parseJson } from "../lib.js";
/** The skills.sh CLI, as `.agents/skills.md` documents it. */
export const SKILLS_CLI = ["npx", "skills"];
export const EXIT_REMOVE_FAILED = 3;
export const EXIT_CLI_COULD_NOT_RUN = 4;
const REGISTRY = path.join(".agents", "skills.md");
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Listed = named in the registry as a whole word, where `-` counts as part of a name. */
export const listedIn = (registry, skill) => new RegExp(`(^|[^A-Za-z0-9-])${escapeRegExp(skill)}([^A-Za-z0-9-]|$)`, "m").test(registry);
/** Installed skills: `.agents/skills/` folders plus `skills-lock.json` keys, sorted and unique. */
export function installedSkills(top, log) {
    const names = new Set();
    const dir = path.join(top, ".agents", "skills");
    if (fs.existsSync(dir)) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true }))
            if (e.isDirectory())
                names.add(e.name);
    }
    const lock = path.join(top, "skills-lock.json");
    if (fs.existsSync(lock)) {
        const skills = parseLock(fs.readFileSync(lock, "utf-8"), log).skills;
        if (skills && typeof skills === "object")
            for (const k of Object.keys(skills))
                names.add(k);
    }
    return [...names].sort();
}
function parseLock(raw, log) {
    const parsed = parseJson(raw);
    if (parsed.ok && parsed.value !== null && typeof parsed.value === "object")
        return parsed.value;
    // An unreadable lock still leaves the folders to prune; say so rather than stop the ship.
    log("skills-lock.json is not valid JSON — pruning by .agents/skills/ folders only");
    return {};
}
export const skillsCommand = {
    noun: "skills",
    summary: "Prune feature-specific skills before ship merges.",
    verbs: {
        prune: {
            summary: "Uninstall every non-bkit skill .agents/skills.md does not list (ship Step 7).",
            flags: [],
            output: {
                removed: "skills uninstalled",
                kept: "skills left installed: listed in .agents/skills.md, or bkit's own",
                failed: "unlisted skills still installed: the CLI failed, or could not run",
            },
            exitCodes: {
                [EXIT_REMOVE_FAILED]: "the skills CLI failed to uninstall one or more skills",
                [EXIT_CLI_COULD_NOT_RUN]: "the skills CLI could not run (exit 126 / 127)",
            },
            run: (ctx) => {
                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                const registryFile = path.join(top, REGISTRY);
                // Without the registry every skill reads as unlisted and would be uninstalled.
                if (!fs.existsSync(registryFile)) {
                    throw new CommandError(EXIT.USAGE, `${REGISTRY} missing — refusing to prune every skill`);
                }
                const registry = fs.readFileSync(registryFile, "utf-8");
                const removed = [];
                const kept = [];
                const failed = [];
                let couldNotRun = false;
                for (const skill of installedSkills(top, ctx.log)) {
                    if (skill.startsWith("bkit-") || listedIn(registry, skill)) {
                        kept.push(skill);
                        continue;
                    }
                    if (couldNotRun) {
                        failed.push(skill);
                        continue;
                    }
                    const [cmd, ...args] = SKILLS_CLI;
                    const res = spawnSync(cmd, [...args, "remove", skill, "-y"], {
                        cwd: top,
                        encoding: "utf-8",
                        stdio: ["ignore", "pipe", "pipe"],
                    });
                    const status = res.error ? 127 : (res.status ?? 1);
                    if (status === 0) {
                        removed.push(skill);
                        continue;
                    }
                    ctx.log(`could not uninstall ${skill} (exit ${status}): ${(res.stderr ?? "").trim()}`);
                    if (COULD_NOT_RUN_EXIT_CODES.has(status))
                        couldNotRun = true;
                    failed.push(skill);
                }
                ctx.emit({ removed, kept, failed });
                if (couldNotRun) {
                    ctx.log(`${SKILLS_CLI.join(" ")} could not run — the skills in "failed" are still installed`);
                    return EXIT_CLI_COULD_NOT_RUN;
                }
                return failed.length > 0 ? EXIT_REMOVE_FAILED : EXIT.OK;
            },
        },
    },
};
