// checks/before/repo.ts — repo preconditions: package.json present and parseable, a git repo,
// valid plan caps, a change issue form showing them, plans in task-block form, bkit on PATH.
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { parsePlanBlocks } from "../../commands/workflow/plan-blocks.js";
import { parseJson, readJsonFile } from "../../shared/json.js";
import { ASK_POINTS, CONFIG_DEFAULTS, invalidAskSettings, invalidTaskCaps, limitKey, readBkitConfig, } from "../../shared/settings.js";
import { isCloudOrCi } from "./env.js";
// ---------------------------------------------------------------------------
// Blocker detectors
// ---------------------------------------------------------------------------
export function detectNoPackageJson(cwd) {
    if (fs.existsSync(path.join(cwd, "package.json")))
        return null;
    return {
        id: "no-package-json",
        severity: "blocker",
        detect: "package.json not found in the current directory.",
        action: "Run `npm init -y` to create a minimal package.json, or copy one from an existing project, then re-run `pnpm bkit install`.",
    };
}
export function detectMalformedPackageJson(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return null;
    if (readJsonFile(pkgPath).ok)
        return null;
    return {
        id: "malformed-package-json",
        severity: "blocker",
        detect: "package.json exists but contains invalid JSON.",
        action: "Fix the JSON syntax error in package.json (run `node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\"` to locate the error), then re-run `pnpm bkit install`.",
    };
}
export function detectNotGitRepo(cwd, modules) {
    if (!modules.has("core"))
        return null;
    if (fs.existsSync(path.join(cwd, ".git")))
        return null;
    return {
        id: "not-git-repo",
        severity: "blocker",
        detect: "core install requested but .git/ directory not found — this is not a git repository.",
        action: "Run `git init` to initialise a git repo, then re-run. bkit installs into a git repository — its managed .gitignore/.gitattributes blocks require one (core is implicit; there is no --core flag to omit).",
    };
}
/**
 * Advisory: `package.json` `bkit.workflows.tasks` holds a plan cap that is not an integer >= 1.
 * Each such key falls back to its default in `readBkitConfig`.
 */
export function detectInvalidTaskCaps(cwd) {
    const workflows = bkitWorkflows(cwd);
    if (workflows === null)
        return null;
    const bad = invalidTaskCaps(workflows.tasks);
    if (bad.length === 0)
        return null;
    const caps = CONFIG_DEFAULTS.tasks;
    const keys = bad[0] === "tasks" ? Object.keys(caps) : bad;
    const named = bad.map((k) => `\`bkit.workflows.${k === "tasks" ? k : `tasks.${k}`}\``).join(", ");
    return {
        id: "bkit-tasks-invalid",
        severity: "advisory",
        detect: `package.json ${named} is not a whole number of 1 or more, so the plan check uses the default instead.`,
        action: `Set each to a whole number of 1 or more in package.json, or delete it to keep the default: ${keys
            .map((k) => `\`bkit.workflows.tasks.${k}\` (default ${caps[k]})`)
            .join(", ")}.`,
    };
}
const TASK_CAP_KEY = /`bkit\.workflows\.tasks\.(\w+)`/g;
/**
 * Each `bkit.workflows.tasks.<key>` the text names with a `(default N)` after it, on the same
 * line and before the next named key.
 */
export function taskCapDefaultsNamed(text) {
    const hits = [...text.matchAll(TASK_CAP_KEY)];
    return hits.flatMap((m, i) => {
        const from = m.index + m[0].length;
        const lineEnd = text.indexOf("\n", from);
        const end = Math.min(hits[i + 1]?.index ?? text.length, lineEnd === -1 ? text.length : lineEnd);
        const n = /\(default (\d+)\)/.exec(text.slice(from, end));
        return n ? [{ key: m[1], value: Number(n[1]) }] : [];
    });
}
const CHANGE_FORM = ".github/ISSUE_TEMPLATE/bkit-change.yml";
/**
 * Advisory: the change issue form names a plan cap with a `(default N)` that differs from the
 * value `readBkitConfig` gives for that key.
 */
export function detectTaskCapFormStale(cwd) {
    const file = path.join(cwd, CHANGE_FORM);
    if (!fs.existsSync(file))
        return null;
    const caps = readBkitConfig(cwd).tasks;
    const isCap = (k) => Object.hasOwn(caps, k);
    const stale = new Map();
    for (const { key, value } of taskCapDefaultsNamed(fs.readFileSync(file, "utf-8"))) {
        if (isCap(key) && caps[key] !== value)
            stale.set(key, value);
    }
    if (stale.size === 0)
        return null;
    const rows = [...stale];
    return {
        id: "bkit-tasks-form-stale",
        severity: "advisory",
        detect: `${CHANGE_FORM} shows plan caps that differ from package.json: ${rows
            .map(([k, v]) => `\`bkit.workflows.tasks.${k}\` (default ${v}) is ${caps[k]}`)
            .join(", ")}.`,
        action: `In ${CHANGE_FORM}, change the number in each "(default N)" after the key: ${rows
            .map(([k, v]) => `\`bkit.workflows.tasks.${k}\` "(default ${v})" → "(default ${caps[k]})"`)
            .join(", ")}. Or set the key in package.json \`bkit.workflows.tasks\` to the number the form shows.`,
    };
}
/** `package.json` `bkit.workflows` as an object; null when the file or block is unusable. */
function bkitWorkflows(cwd) {
    const read = readJsonFile(path.join(cwd, "package.json"));
    if (!read.ok)
        return null;
    const bkit = read.value?.bkit;
    if (bkit === null || typeof bkit !== "object" || Array.isArray(bkit))
        return null;
    const workflows = bkit.workflows;
    return workflows !== null && typeof workflows === "object" && !Array.isArray(workflows)
        ? workflows
        : {};
}
/**
 * Advisory when a `bkit.workflows.<workflow>.<point>` block holds an `ask` that is not
 * true/false, a limit that is not a whole number of 1 or more, or is not an object. Each such
 * key falls back to its default in `readBkitConfig`.
 */
export function detectInvalidAskSettings(cwd) {
    const workflows = bkitWorkflows(cwd);
    if (workflows === null)
        return null;
    const bad = invalidAskSettings(workflows);
    if (bad.length === 0)
        return null;
    const defaults = bad.map((k) => {
        const point = ASK_POINTS.find((p) => k === p || k.startsWith(`${p}.`));
        const d = CONFIG_DEFAULTS.asks[point];
        return `\`bkit.workflows.${point}\` (default \`{ "ask": ${d.ask}, "${limitKey(point)}": ${d.max} }\`)`;
    });
    return {
        id: "bkit-ask-settings-invalid",
        severity: "advisory",
        detect: `package.json ${bad.map((k) => `\`bkit.workflows.${k}\``).join(", ")} is not valid (\`ask\` takes true or false, a limit a whole number of 1 or more), so the default is used instead.`,
        action: `Fix or delete each in package.json: ${[...new Set(defaults)].join(", ")}.`,
    };
}
const PLAN_FILE = /^(.+)-plan\.md$/;
/** The FID's `docs/plans/{month}/logs/{FID}/status.jsonl` holds a ship `workflow-done` row. */
function fidShipped(monthDir, fid) {
    const file = path.join(monthDir, "logs", fid, "status.jsonl");
    if (!fs.existsSync(file))
        return false;
    return fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .some((line) => {
        const row = parseJson(line);
        if (!row.ok || typeof row.value !== "object" || row.value === null)
            return false;
        const { type, workflow } = row.value;
        return type === "workflow-done" && workflow === "ship";
    });
}
/**
 * Advisory: a `docs/plans/{YYYYMM}/{FID}-plan.md` whose FID has not shipped holds no task
 * blocks, so `/bkit-build` Step 3 converts it on the FID's next build. `archive/` and
 * `logs/` sit below the month folder and are not read.
 */
export function detectUnmarkedPlans(cwd) {
    const plans = path.join(cwd, "docs", "plans");
    if (!fs.existsSync(plans))
        return null;
    const unmarked = [];
    for (const month of fs.readdirSync(plans, { withFileTypes: true })) {
        if (!month.isDirectory())
            continue;
        const monthDir = path.join(plans, month.name);
        for (const entry of fs.readdirSync(monthDir, { withFileTypes: true })) {
            const fid = entry.isFile() ? PLAN_FILE.exec(entry.name)?.[1] : undefined;
            if (fid === undefined)
                continue;
            const text = fs.readFileSync(path.join(monthDir, entry.name), "utf-8");
            if (parsePlanBlocks(text).tasks.length > 0 || fidShipped(monthDir, fid))
                continue;
            unmarked.push(`docs/plans/${month.name}/${entry.name}`);
        }
    }
    if (unmarked.length === 0)
        return null;
    unmarked.sort();
    const one = unmarked.length === 1;
    return {
        id: "plan-task-markers-missing",
        severity: "advisory",
        detect: `${unmarked.length} ${one ? "plan has" : "plans have"} no task markers and will be converted to group and task blocks on the next \`/bkit-build\` of ${one ? "its" : "their"} FID: ${unmarked
            .map((p) => `\`${p}\``)
            .join(", ")}.`,
        action: "Nothing to do by hand: this matters only for builds still to run, and plans of shipped FIDs are not listed.",
    };
}
/**
 * Advisory: `bkit` is not on PATH.
 * bkit is a devDependency — without a shell alias, every invocation requires
 * `pnpm bkit <verb>` or `pnpm exec bkit <verb>`. Suggest the one-line alias.
 * Short-circuits in CI / cloud environments where the alias is irrelevant.
 */
export function detectBkitNotOnPath() {
    if (isCloudOrCi())
        return null;
    const result = spawnSync("which", ["bkit"], { encoding: "utf-8" });
    if (result.status === 0 && result.stdout.trim())
        return null;
    return {
        id: "bkit-not-on-path",
        severity: "advisory",
        detect: "`bkit` is not on PATH — commands must be run as `pnpm bkit <verb>` or `pnpm exec bkit <verb>`.",
        action: "[bkit] Add a shell alias so you can type `bkit <verb>` directly. Add to ~/.zshrc (or ~/.bashrc), then reload:\n\n" +
            "    alias bkit='pnpm bkit'\n" +
            "    source ~/.zshrc\n\n" +
            "For `bkit cursor` / `bkit opencode` (GUI app launchers), run from the repo root in\n" +
            "an external terminal (Terminal.app / iTerm2) — not from inside the running app.",
    };
}
