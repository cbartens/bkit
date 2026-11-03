// install/template-notes.ts — the old opening note above `<!-- bkit:start -->` in the
// installed doc templates (`docs/templates/bkit-*.md`).
//
// Each doc template opens its managed block with a `<!-- Note: … -->` comment, so every
// upgrade refreshes it. Installs from older releases still hold bkit's note above
// `<!-- bkit:start -->`, where upgrade never writes. This migration removes that copy
// when it is byte-identical to a wording bkit shipped. Any other text above the block is
// the consumer's and stays. Register: docs/migrations.md.
import * as fs from "node:fs";
import * as path from "node:path";
import { findLineAnchoredMarkers } from "./managed-block.js";
import { sha256 } from "./version-file.js";
/**
 * sha256 of each opening-note line a doc template carried above `<!-- bkit:start -->`,
 * collected from the history of `.bkit/core/docs/templates/` and
 * `.bkit/templates/docs/templates/`.
 */
export const RETIRED_TEMPLATE_NOTE_HASHES = new Set([
    // Audit templates, 5.0.0 – 5.2.2 ("Never overwrite.", `@bkit-audit-generate` last).
    "09669d937bb36d23473bfd32b1b4c850ab16f9404fb292312d4ece03430ae2ff",
    // Audit templates, 5.2.3 – 6.0.0 (adds the `bkit:anchor` sentence).
    "eeefcc0b47e569bf12f7215f40ce4d42d68b596a0ccea5f8e6127eb95f98bc61",
    // Audit templates, unreleased dev wording (`@bkit-audit-generate` first).
    "771ac2789eb695e49c4973711eacda22faff474a99aa954bc4fbb800a0389f53",
    // Plan template, 5.0.0 – 5.2.2 ("also stamped … recording its base commit").
    "f412345a8898a9201434c57672d522d8b5c44cb3cf64e4bb12057908c0031c3a",
    // Plan template, 5.2.3 – 6.0.0 (names `baseSha`, `baseRef`, `designPath`, `designBaseSha`).
    "7a49df77a90aa9d32ff43d4187302f31656f7195041ce143defaf7e5effc4e17",
    // Plan template, pre-5.0.0 dev wording, written as `<\!-- Note:` ("set once at design start").
    "b8c53cd711194b363c69c84657a04ed2c6c8dba428b0ea13b6810e368b00c721",
    // Plan template, unreleased dev wording (`@bkit-plan-generate` first).
    "c4b2c520134881923aab16c41501ccc263bbb21662435b4813dd9bf6ad82764f",
]);
const START_MARKER = "<!-- bkit:start -->";
const TEMPLATES_DIR = path.join("docs", "templates");
const OWNED_TEMPLATE = /^bkit-.+\.md$/;
/** An opening-note line, in the form bkit wrote it or the escaped form one dev build wrote. */
const NOTE_LINE = /^<\\?!-- Note:/;
/** What every shipped note names: the report or plan folder, or the agent that fills it. */
const BKIT_NOTE_TEXT = /docs\/(?:audits|plans)\/\{YYYYMM\}|@bkit-/;
const BOM = "\uFEFF";
/**
 * Removes each line above the single `<!-- bkit:start -->` whose text is a note wording
 * bkit shipped, with the blank line after it. When nothing else is left above the block,
 * every blank line there goes too. Every other line is kept. A leading byte-order mark is
 * kept. A file without exactly one line-anchored start marker is returned unchanged; that
 * includes a file with CRLF line endings throughout, whose marker the finder does not see.
 */
export function stripRetiredTemplateNotes(content) {
    const bom = content.startsWith(BOM) ? BOM : "";
    const body = content.slice(bom.length);
    const starts = findLineAnchoredMarkers(body, START_MARKER);
    if (starts.length !== 1)
        return { content, removed: 0, edited: [] };
    // The last element is the start marker's own line up to the marker, so it always stays.
    const lines = body.slice(0, starts[0]).split("\n");
    const drop = new Set();
    const edited = [];
    lines.forEach((line, i) => {
        if (!NOTE_LINE.test(line))
            return;
        if (RETIRED_TEMPLATE_NOTE_HASHES.has(sha256(line.replace(/\r$/, "")))) {
            drop.add(i);
            if (i + 1 < lines.length - 1 && lines[i + 1].trim() === "")
                drop.add(i + 1);
        }
        else if (BKIT_NOTE_TEXT.test(line)) {
            edited.push(line);
        }
    });
    if (drop.size === 0)
        return { content, removed: 0, edited };
    const head = lines.filter((_, i) => !drop.has(i)).join("\n");
    return {
        content: bom + (head.trim() === "" ? "" : head) + body.slice(starts[0]),
        removed: [...drop].filter((i) => NOTE_LINE.test(lines[i])).length,
        edited,
    };
}
/** Absolute paths already named in this process. */
const warned = new Set();
/**
 * Migration (installs up to 6.0.x, `docs/migrations.md`): for each installed
 * `docs/templates/bkit-*.md`, removes bkit's old opening note above `<!-- bkit:start -->`.
 * The removal is recorded in ws, so `bkit check` fails until upgrade runs. A note that
 * matches no shipped wording is kept. When it names what a bkit note names, install, upgrade
 * and `bkit check` print one line naming the file.
 */
export function migrateTemplateNotes(dryRun, ws, logPrefix) {
    if (!fs.lstatSync(TEMPLATES_DIR, { throwIfNoEntry: false })?.isDirectory())
        return;
    const tag = dryRun ? "[dry-run] " : "";
    for (const name of fs.readdirSync(TEMPLATES_DIR).sort()) {
        if (!OWNED_TEMPLATE.test(name))
            continue;
        const rel = path.join(TEMPLATES_DIR, name);
        if (!fs.lstatSync(rel).isFile())
            continue;
        const result = stripRetiredTemplateNotes(fs.readFileSync(rel, "utf-8"));
        // Upgrade runs this pass again as its closing dry-run check, so each file is named once.
        const abs = path.resolve(rel);
        if (result.edited.length > 0 && !warned.has(abs)) {
            warned.add(abs);
            const line = result.edited[0];
            const shown = line.length > 80 ? `${line.slice(0, 80)}…` : line;
            console.warn(`${logPrefix} ${rel}: the note above \`<!-- bkit:start -->\` matches no note bkit shipped, so it was kept: ${shown} bkit's own note now sits inside the block, where upgrade refreshes it. If yours is an edited copy of bkit's old note, delete it.`);
        }
        if (result.removed === 0)
            continue;
        if (!dryRun)
            fs.writeFileSync(rel, result.content, "utf-8");
        if (!ws.writes.some((w) => w.path === rel))
            ws.writes.push({ path: rel, action: "update" });
        console.log(`${logPrefix} ${tag}core: ${rel} — removed bkit's old note above \`<!-- bkit:start -->\` (it now sits inside the block)`);
    }
}
