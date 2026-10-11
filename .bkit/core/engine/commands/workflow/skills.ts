// bkit skills prune — ship's skill prune: uninstall every skill `.agents/skills.md` does not list.
//
// Build's install-skills step adds feature-specific skills with the skills CLI;
// ship removes them again before merge so they never reach dev. The candidates
// are the union of `.agents/skills/` folders and `skills-lock.json` keys: a skill
// whose folder is already gone still has a lock entry, and looping over folders
// alone leaves it installed. bkit's own `bkit-*` skills are never touched.
// Pruning is housekeeping: a missing registry skips it with a warning, and a
// failed uninstall is reported; neither stops the ship.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { COULD_NOT_RUN_EXIT_CODES } from "../../shared/package-manager.js";
import { EXIT, git, parseJson, type CommandSpec } from "../lib.js";

/** The skills.sh CLI, as `.agents/skills.md` documents it. */
export const SKILLS_CLI = ["npx", "skills"];

const REGISTRY = path.join(".agents", "skills.md");

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Listed = named in the registry as a whole word, where `-` counts as part of a name. */
export const listedIn = (registry: string, skill: string) =>
  new RegExp(`(^|[^A-Za-z0-9-])${escapeRegExp(skill)}([^A-Za-z0-9-]|$)`, "m").test(registry);

/** Installed skills: `.agents/skills/` folders plus `skills-lock.json` keys, sorted and unique. */
export function installedSkills(top: string, log: (m: string) => void): string[] {
  const names = new Set<string>();
  const dir = path.join(top, ".agents", "skills");
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }))
      if (e.isDirectory()) names.add(e.name);
  }
  const lock = path.join(top, "skills-lock.json");
  if (fs.existsSync(lock)) {
    const skills = (parseLock(fs.readFileSync(lock, "utf-8"), log) as { skills?: unknown }).skills;
    if (skills && typeof skills === "object") for (const k of Object.keys(skills)) names.add(k);
  }
  return [...names].sort();
}

function parseLock(raw: string, log: (m: string) => void): object {
  const parsed = parseJson(raw);
  if (parsed.ok && parsed.value !== null && typeof parsed.value === "object") return parsed.value;
  // An unreadable lock still leaves the folders to prune; say so rather than stop the ship.
  log("skills-lock.json is not valid JSON — pruning by .agents/skills/ folders only");
  return {};
}

export const skillsCommand: CommandSpec = {
  noun: "skills",
  summary: "Prune feature-specific skills before ship merges.",
  verbs: {
    prune: {
      summary: "Uninstall every non-bkit skill .agents/skills.md does not list (ship Step 7).",
      flags: [],
      output: {
        removed: "skills uninstalled",
        kept: "skills left installed: listed in .agents/skills.md, or bkit's own",
        failed:
          "unlisted skills still installed: the CLI failed, or could not run (warned, exit 0)",
        skipped:
          "no-registry when .agents/skills.md is missing and nothing was pruned (warned, exit 0); null otherwise",
      },
      run: (ctx) => {
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const registryFile = path.join(top, REGISTRY);
        // Without the registry every skill reads as unlisted and would be uninstalled.
        if (!fs.existsSync(registryFile)) {
          ctx.log(`WARNING ${REGISTRY} missing — skill prune skipped, nothing uninstalled`);
          ctx.emit({ removed: [], kept: [], failed: [], skipped: "no-registry" });
          return EXIT.OK;
        }
        const registry = fs.readFileSync(registryFile, "utf-8");
        const removed: string[] = [];
        const kept: string[] = [];
        const failed: string[] = [];
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
          const res = spawnSync(cmd!, [...args, "remove", skill, "-y"], {
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
          if (COULD_NOT_RUN_EXIT_CODES.has(status)) couldNotRun = true;
          failed.push(skill);
        }
        ctx.emit({ removed, kept, failed, skipped: null });
        if (couldNotRun) {
          ctx.log(
            `WARNING ${SKILLS_CLI.join(" ")} could not run — the skills in "failed" are still installed`,
          );
        } else if (failed.length > 0) {
          ctx.log(`WARNING could not uninstall ${failed.join(", ")} — still installed`);
        }
        return EXIT.OK;
      },
    },
  },
};
