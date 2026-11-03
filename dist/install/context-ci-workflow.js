// install/context-ci-workflow.ts — the CI-run lookup in the consumer's `context=ci` and
// `context=e2e` blocks in `.agents/context.md`.
//
// A lookup without `--workflow` takes the newest run of any workflow on the branch. Other
// workflows (a security scan, a cloud agent) often finish after CI and pass, so the block reads
// their run and reports nothing failing. The consumer owns the copies below
// `<!-- bkit:end -->`, so upgrade rewrites a lookup only when it is byte-identical to the line
// an older bkit template carried. Register: docs/migrations.md.
import * as fs from "node:fs";
import * as path from "node:path";
import { readBkitConfig } from "../shared/settings.js";
import { findLineAnchoredMarkers, selectMarkers } from "./managed-block.js";
const CONTEXT_FILE = path.join(".agents", "context.md");
const LOOKUP_TAIL = '=$(gh run list --branch "$(git branch --show-current)" --limit 1 \\';
/** The shipped lookup's first line: `RUN_JSON` in `bkit-github.md`, `RUN_ID` in the e2e blocks. */
const SHIPPED_LOOKUP = new RegExp(`^(RUN_JSON|RUN_ID)${LOOKUP_TAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
/** Any lookup of the current branch's runs, shipped or edited. */
const ANY_LOOKUP = /gh run list --branch "\$\(git branch --show-current\)"/;
const NAMES_WORKFLOW = /(?:^|\s)(?:--workflow|-w)(?:\s|=)/;
const PLAIN_FILE_NAME = /^[\w.-]+$/;
/**
 * Rewrites each shipped CI-run lookup below the first line-anchored `<!-- bkit:end -->` so it
 * reads only `workflow`'s runs: a `CI_WORKFLOW="${CI_WORKFLOW:-<workflow>}"` line goes above
 * it, and the lookup gains `--workflow "$CI_WORKFLOW"`. A lookup that names a workflow on
 * either line is already scoped and stays. An edited lookup, or any lookup when `workflow` is
 * not a plain file name, stays and is listed in `unscoped`. A line ending in CR keeps it.
 */
export function scopeCiRunLookups(content, workflow) {
    const endAt = findLineAnchoredMarkers(content, selectMarkers("html-comment")[1])[0];
    if (endAt === undefined)
        return { content, rewritten: 0, unscoped: [] };
    const lines = content.slice(endAt).split("\n");
    const plainName = PLAIN_FILE_NAME.test(workflow);
    const out = [];
    const unscoped = [];
    let rewritten = 0;
    lines.forEach((line, i) => {
        const bare = line.replace(/\r$/, "");
        const next = lines[i + 1] ?? "";
        if (!ANY_LOOKUP.test(bare) || NAMES_WORKFLOW.test(bare) || NAMES_WORKFLOW.test(next)) {
            out.push(line);
            return;
        }
        if (!plainName || !SHIPPED_LOOKUP.test(bare)) {
            unscoped.push(bare);
            out.push(line);
            return;
        }
        const cr = line.endsWith("\r") ? "\r" : "";
        out.push(`CI_WORKFLOW="\${CI_WORKFLOW:-${workflow}}"${cr}`);
        out.push(line.replace(" --limit 1 ", ' --workflow "$CI_WORKFLOW" --limit 1 '));
        rewritten++;
    });
    if (rewritten === 0)
        return { content, rewritten, unscoped };
    return { content: content.slice(0, endAt) + out.join("\n"), rewritten, unscoped };
}
/** Absolute paths already named in this process. */
const warned = new Set();
/**
 * Migration (installs up to 6.0.x, `docs/migrations.md`): scopes each shipped CI-run lookup in
 * `.agents/context.md` to the workflow file `bkit.testing.ciWorkflow` names. Recorded in ws as
 * an update; the canonical hash covers the managed block only. A lookup it leaves unscoped is
 * named once per process, so the consumer can add `--workflow` by hand.
 */
export function migrateContextCiWorkflow(dryRun, ws, logPrefix) {
    if (!fs.lstatSync(CONTEXT_FILE, { throwIfNoEntry: false })?.isFile())
        return;
    const workflow = readBkitConfig(process.cwd()).ciWorkflow;
    const result = scopeCiRunLookups(fs.readFileSync(CONTEXT_FILE, "utf-8"), workflow);
    // Upgrade runs this pass again as its closing dry-run check, so each file is named once.
    const abs = path.resolve(CONTEXT_FILE);
    if (result.unscoped.length > 0 && !warned.has(abs)) {
        warned.add(abs);
        console.warn(`${logPrefix} ${CONTEXT_FILE}: ${result.unscoped.length} CI run lookup(s) read the newest run of every workflow on the branch, so a later passing workflow hides a failed ${workflow} run. Add \`--workflow "${workflow}"\` to each \`gh run list --branch\` line by hand (the shipped form in .bkit/templates/context/bkit-github.md shows how).`);
    }
    if (result.rewritten === 0)
        return;
    if (!dryRun)
        fs.writeFileSync(CONTEXT_FILE, result.content, "utf-8");
    if (!ws.writes.some((w) => path.normalize(w.path) === CONTEXT_FILE)) {
        ws.writes.push({ path: CONTEXT_FILE, action: "update" });
    }
    console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${CONTEXT_FILE} — CI run lookups now read only ${workflow} runs (${result.rewritten})`);
}
