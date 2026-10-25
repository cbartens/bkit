// Which numbered draft in a run's log folder is the newest: `bkit workflow promote`
// and the run's `plan` block (`run-facts.ts`) both pick the draft this way.
import * as fs from "node:fs";
/**
 * The highest `{workflow}-v{N}-{name}.md` draft, or null. `-v{N}-{k}.md` and `-v{N}-split.md`
 * are files an older bkit's plan split wrote; they are never a draft.
 */
export function highestVersion(dir, workflow) {
    if (!fs.existsSync(dir))
        return null;
    const re = new RegExp(`^${workflow}-v([0-9]+)-(.+)\\.md$`);
    let best = null;
    for (const f of fs.readdirSync(dir).sort()) {
        const m = re.exec(f);
        if (!m || /^[0-9]+$/.test(m[2]) || m[2] === "split")
            continue;
        const n = Number(m[1]);
        if (best === null || n > best.n)
            best = { file: f, n };
    }
    return best;
}
