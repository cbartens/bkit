// checks/tips/index.ts — collect the firing setup tips and render them for `bkit tips`, the
// console checklist and `.bkit/advisories.md`. Catalogue + priority: ./catalogue.ts.
//
// Every `fires` reads the directory `tipsBase` returns — the main checkout, the tree the
// integration branch is checked out in — never the calling directory. A workflow runs in a
// worktree, but a worktree is an ephemeral branch: an empty or half-created one would fire
// every "file is missing" tip as a false gap. When no checkout is found at all, nothing fires.
import * as fs from "node:fs";
import * as path from "node:path";
import { git, mainCheckoutRoot } from "../../commands/lib.js";
import { ignoredAdvisoryIds, } from "../after/suppression.js";
import { ALL_WORKFLOWS, SETUP_TIPS } from "./catalogue.js";
/**
 * The directory the tips are checked against: the main checkout's root — the tree the
 * integration branch is checked out in — resolved from any worktree by
 * `mainCheckoutRoot` (git's common dir), else `cwd` when git cannot say. A bare main
 * repo has no checkout: the common dir's parent then belongs to no repo or to another
 * one, so the caller's own top level is used. `null` when the base is not a checkout
 * (holds neither `.git` nor `package.json`): a directory with nothing to check fires no
 * tip rather than every "missing" tip as a false gap.
 */
export function tipsBase(cwd) {
    const base = mainCheckoutOf(cwd) ?? git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
    if (!fs.existsSync(base))
        return null;
    return fs.existsSync(path.join(base, ".git")) || fs.existsSync(path.join(base, "package.json"))
        ? base
        : null;
}
/** `mainCheckoutRoot(cwd)` when git there resolves to the same common dir, else null. */
function mainCheckoutOf(cwd) {
    const commonDir = (dir) => git(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    const root = mainCheckoutRoot(cwd);
    if (root === null || !fs.existsSync(root))
        return null;
    const own = commonDir(cwd);
    return own !== null && commonDir(root) === own ? root : null;
}
/** Tips `bkit tips` prints without `--all` or `--workflow`. */
export const TIPS_CAP = 3;
/** Tips a workflow prints at its close (`bkit tips --workflow=<name>`). */
export const WORKFLOW_TIPS_CAP = 1;
/** Section heading in the console checklist and `.bkit/advisories.md`. */
export const SETUP_TIPS_HEADING = "Setup tips";
/** Opening line of `bkit tips` output, by how many tips it prints. */
export const tipsIntro = (n) => n === 1 ? "Setup tip for a smoother next run:" : "Setup tips for a smoother next run:";
/** Where the full tip list lives. */
export const TIPS_DETAILS_POINTER = "Details for every tip: .bkit/advisories.md § Setup tips (refreshed by `bkit check`).";
/** Last line of a workflow's `## bkit Tips`: how to silence what it shows, by id. */
export function silenceLine(ids) {
    const names = ids.map((id) => `\`${id}\``);
    const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
    const what = ids.length > 1 ? "these tips" : "this tip";
    return `**Want to silence ${what}?** Ask your agent to "add ${list} to \`bkit.advisories.ignore\` in package.json".`;
}
/** `bkit.advisories.ignore` key that silences `STAR_TIP`. */
export const STAR_TIP_ID = "bkit-star";
/** Older key that also silences `STAR_TIP`, so repos that set it keep the line off. */
export const STAR_TIP_OLD_ID = "star";
/**
 * Last line of `bkit tips` output while not silenced, in bare `bkit tips` and the phase
 * workflows only — audits and the ledger / roadmap updaters often run back to back. Not a
 * gap, so never in the checklist.
 */
export const STAR_TIP = "Do you like bkit? Then give it a star at [https://github.com/cbartens/bkit](https://github.com/cbartens/bkit)!";
/** `STAR_TIP` for a workflow's `## bkit Tips`, its question bold like each tip's title. */
export const STAR_TIP_PARAGRAPH = STAR_TIP.replace("Do you like bkit?", "**Do you like bkit?**");
/** Intro of the Setup tips section: who reads which field, and how to silence a tip. */
export const TIPS_SECTION_INTRO = "Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json. Full template catalogue: .bkit/templates.md.";
/** True when advisory `id` matches catalogue pattern `pattern` (trailing `*` = prefix). */
export function matchesAdvisory(pattern, id) {
    return pattern.endsWith("*") ? id.startsWith(pattern.slice(0, -1)) : id === pattern;
}
/** True when `ignored` names the tip's id or any advisory id it reuses. */
export function isTipSilenced(tip, ignored) {
    if (ignored.has(tip.id))
        return true;
    const patterns = tip.advisories ?? [];
    return [...ignored].some((id) => patterns.some((p) => matchesAdvisory(p, id)));
}
/** Every firing tip in priority order, minus the ones the root package.json silences. */
export function collectTips(cwd, catalogue = SETUP_TIPS) {
    const base = tipsBase(cwd);
    if (base === null)
        return { tips: [], suppressed: [], star: false };
    const ignored = ignoredAdvisoryIds(base);
    const tips = [];
    const suppressed = [];
    for (const tip of catalogue) {
        if (!tip.fires(base))
            continue;
        if (isTipSilenced(tip, ignored))
            suppressed.push({ id: tip.id, scope: "." });
        else
            tips.push(tip);
    }
    const star = !ignored.has(STAR_TIP_ID) && !ignored.has(STAR_TIP_OLD_ID);
    return { tips, suppressed, star };
}
/**
 * Drop advisory findings whose tip the root package.json silenced, so one
 * `bkit.advisories.ignore` entry silences a tip and the advisories it reuses. Blockers are
 * never dropped.
 */
export function dropTipSilencedAdvisories(findings, cwd, onSuppressed, catalogue = SETUP_TIPS) {
    const base = tipsBase(cwd);
    if (base === null)
        return findings;
    const ignored = ignoredAdvisoryIds(base);
    if (ignored.size === 0)
        return findings;
    const patterns = catalogue
        .filter((tip) => isTipSilenced(tip, ignored))
        .flatMap((tip) => tip.advisories ?? []);
    return findings.filter((f) => {
        if (f.severity !== "advisory" || !patterns.some((p) => matchesAdvisory(p, f.id)))
            return true;
        onSuppressed?.({ id: f.id, scope: "." });
        return false;
    });
}
/** One tip as numbered terminal lines: title, then line, ask and caution indented. */
function tipTextLines(tip, n) {
    const lines = [`${n}. ${tip.title}`, `   ${tip.line}`, `   Ask your agent: "${tip.ask}"`];
    if (tip.caution)
        lines.push(`   Caution: ${tip.caution}`);
    return lines;
}
/** One tip as one markdown paragraph for a workflow's `## bkit Tips` section. */
function tipParagraph(tip) {
    const caution = tip.caution ? ` Caution: ${tip.caution}` : "";
    return `**${tip.title}.** ${tip.line} Ask your agent: "${tip.ask}"${caution}`;
}
/**
 * `tips` with the ones that matter in `workflow` first, each group in catalogue order.
 * Comms tips name every workflow, so they stay first everywhere.
 */
export function orderForWorkflow(tips, workflow) {
    const own = tips.filter((t) => t.workflows?.includes(workflow));
    return [...own, ...tips.filter((t) => !own.includes(t))];
}
/** True when `STAR_TIP` closes the output in `workflow`: bare `bkit tips` or a phase workflow. */
export function starShownIn(workflow) {
    return !workflow || ALL_WORKFLOWS.includes(workflow);
}
/**
 * `bkit tips` output. `""` when no tip fires and no star line shows.
 *   - `workflow`: the `WORKFLOW_TIPS_CAP` tips that matter most in that workflow as
 *     one markdown paragraph each, then `STAR_TIP` when shown, then `silenceLine` naming both — the
 *     workflow appends them under its own `## bkit Tips` heading.
 *   - neither: the top `TIPS_CAP` tips as a numbered terminal list, where the rest live,
 *     then `STAR_TIP` when shown.
 *   - `all`: every tip as a numbered list (in the workflow's order when `workflow` is set).
 * `STAR_TIP` shows when `opts.star` is set and `starShownIn(workflow)`.
 */
export function formatTips(tips, opts = {}) {
    const star = !!opts.star && starShownIn(opts.workflow);
    if (opts.workflow && !opts.all)
        return formatWorkflowTips(tips, opts.workflow, star);
    const body = formatSetupTips(tips, opts);
    if (!star)
        return body;
    return body ? `${body}\n\n${STAR_TIP}` : STAR_TIP;
}
/** `formatTips` for a workflow's `## bkit Tips`: tips, star line, how to silence both. */
function formatWorkflowTips(tips, workflow, star) {
    const shown = orderForWorkflow(tips, workflow).slice(0, WORKFLOW_TIPS_CAP);
    const ids = shown.map((t) => t.id);
    const parts = shown.map(tipParagraph);
    if (star) {
        parts.push(STAR_TIP_PARAGRAPH);
        ids.push(STAR_TIP_ID);
    }
    if (ids.length === 0)
        return "";
    return [...parts, silenceLine(ids)].join("\n\n");
}
/** `formatTips` as a terminal list, without `STAR_TIP`. */
function formatSetupTips(tips, opts) {
    if (tips.length === 0)
        return "";
    const ordered = opts.workflow ? orderForWorkflow(tips, opts.workflow) : [...tips];
    const shown = opts.all ? ordered : ordered.slice(0, TIPS_CAP);
    const rest = tips.length - shown.length;
    const lines = [tipsIntro(shown.length), ""];
    shown.forEach((tip, i) => lines.push(...tipTextLines(tip, i + 1), ""));
    if (rest > 0)
        lines.push(`${rest} more: \`bkit tips --all\`.`);
    lines.push(TIPS_DETAILS_POINTER);
    return lines.join("\n");
}
/** The Setup tips block of the console checklist. `[]` when no tip fires. */
export function setupTipsChecklistLines(tips) {
    if (tips.length === 0)
        return [];
    const lines = [`--- ${SETUP_TIPS_HEADING} ---`, TIPS_SECTION_INTRO, ""];
    tips.forEach((tip, i) => {
        lines.push(`${i + 1}. ${tip.title} (${tip.id})`);
        lines.push(`   ${tip.line}`);
        lines.push(`   Why: ${tip.why}`);
        if (tip.caution)
            lines.push(`   Caution: ${tip.caution}`);
        lines.push(`   Ask your agent: "${tip.ask}"`);
        lines.push(`   Agent steps: ${tip.steps}`);
        lines.push("");
    });
    return lines;
}
/** The `## Setup tips` section of `.bkit/advisories.md`. `[]` when no tip fires. */
export function setupTipsMarkdownLines(tips) {
    if (tips.length === 0)
        return [];
    const lines = [`## ${SETUP_TIPS_HEADING}`, "", `> ${TIPS_SECTION_INTRO}`, ""];
    tips.forEach((tip, i) => {
        lines.push(`### ${i + 1}. ${tip.title} (\`${tip.id}\`)`, "");
        lines.push(tip.line, "");
        lines.push(`**Why:** ${tip.why}`, "");
        if (tip.caution)
            lines.push(`**Caution:** ${tip.caution}`, "");
        lines.push(`**Ask your agent:** "${tip.ask}"`, "");
        lines.push(`**Agent steps:** ${tip.steps}`, "");
    });
    return lines;
}
