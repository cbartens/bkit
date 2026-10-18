// checks/tips/index.ts — collect the firing setup tips and render them for `bkit tips`, the
// console checklist and `.bkit/advisories.md`. Catalogue + priority: ./catalogue.ts.
import { ignoredAdvisoryIds, } from "../after/suppression.js";
import { ALL_WORKFLOWS, SETUP_TIPS } from "./catalogue.js";
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
/** `bkit.ignoreAdvisories` key that silences `STAR_TIP`. */
export const STAR_TIP_ID = "star";
/**
 * Last line of `bkit tips` output while not silenced, in bare `bkit tips` and the phase
 * workflows only — audits and the ledger / roadmap updaters often run back to back. Not a
 * gap, so never in the checklist.
 */
export const STAR_TIP = "Do you like bkit? Then give it a star at [https://github.com/cbartens/bkit](https://github.com/cbartens/bkit)!";
/** Intro of the Setup tips section: who reads which field, and how to silence a tip. */
export const TIPS_SECTION_INTRO = "Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.ignoreAdvisories` in package.json. Full template catalogue: .bkit/templates.md.";
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
    const ignored = ignoredAdvisoryIds(cwd);
    const tips = [];
    const suppressed = [];
    for (const tip of catalogue) {
        if (!tip.fires(cwd))
            continue;
        if (isTipSilenced(tip, ignored))
            suppressed.push({ id: tip.id, scope: "." });
        else
            tips.push(tip);
    }
    return { tips, suppressed, star: !ignored.has(STAR_TIP_ID) };
}
/**
 * Drop advisory findings whose tip the root package.json silenced, so one
 * `bkit.ignoreAdvisories` entry silences a tip and the advisories it reuses. Blockers are
 * never dropped.
 */
export function dropTipSilencedAdvisories(findings, cwd, onSuppressed, catalogue = SETUP_TIPS) {
    const ignored = ignoredAdvisoryIds(cwd);
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
/** One tip as markdown paragraphs for a workflow's `## bkit Tips` section. */
function tipMarkdownLines(tip) {
    const lines = [`**${tip.title}.** ${tip.line}`, "", `Ask your agent: "${tip.ask}"`];
    if (tip.caution)
        lines.push("", `Caution: ${tip.caution}`);
    return lines;
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
 * `bkit tips` output, then where the rest live, then `STAR_TIP` when `star` is set and
 * `starShownIn(workflow)`. `""` when no tip fires and no star line shows.
 *   - `workflow`: the `WORKFLOW_TIPS_CAP` tips that matter most in that workflow, as
 *     markdown paragraphs with no intro or numbers — the workflow appends them under its
 *     own `## bkit Tips` heading.
 *   - neither: the top `TIPS_CAP` tips as a numbered terminal list.
 *   - `all`: every tip as a numbered list (in the workflow's order when `workflow` is set).
 */
export function formatTips(tips, opts = {}) {
    const body = formatSetupTips(tips, opts);
    if (!opts.star || !starShownIn(opts.workflow))
        return body;
    return body ? `${body}\n\n${STAR_TIP}` : STAR_TIP;
}
/** `formatTips` without `STAR_TIP`. */
function formatSetupTips(tips, opts) {
    if (tips.length === 0)
        return "";
    const ordered = opts.workflow ? orderForWorkflow(tips, opts.workflow) : [...tips];
    const cap = opts.workflow ? WORKFLOW_TIPS_CAP : TIPS_CAP;
    const shown = opts.all ? ordered : ordered.slice(0, cap);
    const rest = tips.length - shown.length;
    const more = rest > 0 ? `${rest} more: \`bkit tips --all\`. ` : "";
    if (opts.workflow && !opts.all) {
        const lines = [];
        for (const tip of shown)
            lines.push(...tipMarkdownLines(tip), "");
        lines.push(`${more}${TIPS_DETAILS_POINTER}`);
        return lines.join("\n");
    }
    const lines = [tipsIntro(shown.length), ""];
    shown.forEach((tip, i) => lines.push(...tipTextLines(tip, i + 1), ""));
    if (more)
        lines.push(more.trimEnd());
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
