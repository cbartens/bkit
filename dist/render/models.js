// render/models.ts — the `.bkit/prompts.md` § Models lookup: per-host model pins, consumer
// overrides, and the effort map.
import * as fs from "node:fs";
import { findLineAnchoredMarkers, selectMarkers } from "../install/managed-block.js";
import { LOG_PREFIX } from "../shared/log-prefix.js";
import { OPENCODE_PROVIDERS, OPENCODE_PROVIDER_DEFAULTS, } from "../shared/egress.js";
/**
 * Parse .bkit/prompts.md § Models table → Map<name, columnValue>.
 * columnHeader is the column header label to extract (e.g. "Cursor model", "opencode model").
 * The function is header-addressed: it finds the column by name, never by position.
 * Hard-fails (process.exit(1)) if the section or column header is not found.
 */
export function parseModelLookupForColumn(subagentsMdPath, columnHeader) {
    const content = fs.readFileSync(subagentsMdPath, "utf-8");
    const map = new Map();
    const modelsIdx = content.indexOf("## Models");
    if (modelsIdx === -1) {
        console.error(`${LOG_PREFIX} Could not find ## Models section in ${subagentsMdPath}`);
        process.exit(1);
    }
    const lines = content.slice(modelsIdx).split("\n");
    let inTable = false;
    let columnIndex = -1;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("|")) {
            if (inTable)
                break;
            continue;
        }
        inTable = true;
        const cols = trimmed
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean);
        // Header row: find the column index for our target header
        if (columnIndex === -1) {
            // Check if this is the header row by looking for the target column
            const lowerCols = cols.map((c) => c.toLowerCase().replace(/`/g, ""));
            const targetLower = columnHeader.toLowerCase().replace(/`/g, "");
            const idx = lowerCols.findIndex((c) => c === targetLower);
            if (idx !== -1) {
                columnIndex = idx;
            }
            // Also skip separator rows (all --- cells)
            if (trimmed.includes("---"))
                continue;
            continue;
        }
        // Separator row
        if (trimmed.includes("---"))
            continue;
        if (cols.length <= columnIndex)
            continue;
        const nameMatch = cols[0].match(/^`([^`]+)`$/);
        if (!nameMatch)
            continue;
        // Strip optional backtick wrapping from model value (table cells may use `model-name`)
        const modelRaw = cols[columnIndex];
        const modelClean = modelRaw.replace(/^`|`$/g, "");
        map.set(nameMatch[1], modelClean);
    }
    if (columnIndex === -1) {
        console.error(`${LOG_PREFIX} Could not find column "${columnHeader}" in ## Models table in ${subagentsMdPath}`);
        process.exit(1);
    }
    return map;
}
/**
 * Parse .bkit/prompts.md § Models table → Map<name, cursorModel>.
 * Header-addressed: finds the "Cursor model" column by header name. Delegates to
 * parseModelLookupForColumn.
 */
export function parseModelLookup(subagentsMdPath) {
    return parseModelLookupForColumn(subagentsMdPath, GATEWAY_COLUMN.cursor);
}
/**
 * Gateway key → its prompts.md § Models column header.
 *
 * § Models is keyed on GATEWAY, never on program — a gateway shared by two programs is one
 * column, not two. `anthropic` and `cursor` are the pinned gateways of the claude and cursor
 * programs.
 *
 * Cells hold the BARE, gateway-scoped model id. Any prefix a program's config format needs
 * is added at render time by formatModelPin — never stored in the table.
 *
 * Every allowlisted opencode provider MUST have an entry; the `satisfies Record<OpencodeProvider | …>`
 * check fails tsc when one is missing.
 */
const GATEWAY_COLUMN = {
    anthropic: "Anthropic",
    cursor: "Cursor",
    openrouter: "OpenRouter",
    ollama: "Ollama",
    "opencode-zen": "OpenCode Zen",
    "opencode-go": "OpenCode Go",
    openai: "OpenAI",
    google: "Google",
};
function isGatewayKey(value) {
    return Object.hasOwn(GATEWAY_COLUMN, value);
}
/**
 * Spell a model pin the way a program's config file expects it.
 *
 * The § Models cell is the bare, gateway-scoped model id (`kimi-k2.7-code`). Claude and
 * Cursor write it unchanged; opencode requires `<providerId>/<model>`, where providerId is
 * the opencode-side id and is NOT always the bkit gateway key — the `opencode-zen` gateway
 * is `opencode` on the opencode side. Route through opencodeProviderId, never the raw key.
 */
export function formatModelPin(program, gateway, bareModel) {
    if (program === "opencode")
        return `${opencodeProviderId(gateway)}/${bareModel}`;
    // claude / cursor / codex all take the bare id: Claude's and Cursor's gateway is implicit,
    // Codex names its gateway in `[model_providers.<id>]`.
    return bareModel;
}
/**
 * Build the per-agent model lookup for one gateway: an opencode provider, or the Codex
 * "openai" column. Source of truth = prompts.md § Models, which carries one curated column per
 * gateway ("OpenRouter", "Ollama", "OpenAI"). Header-addressed. Every key of GATEWAY_COLUMN
 * ships a column; any other key throws.
 */
export function buildOpencodeModelLookup(subagentsMdPath, provider) {
    if (!isGatewayKey(provider)) {
        throw new Error(`buildOpencodeModelLookup: no prompts.md § Models column for provider ${JSON.stringify(provider)}`);
    }
    return parseModelLookupForColumn(subagentsMdPath, GATEWAY_COLUMN[provider]);
}
/**
 * Build the per-agent Antigravity model lookup for Google models.
 * Source of truth = prompts.md § Models, "Google" column.
 */
export function buildAntigravityModelLookup(subagentsMdPath) {
    return parseModelLookupForColumn(subagentsMdPath, GATEWAY_COLUMN.google);
}
/**
 * Parse the consumer-owned `## Model Overrides` table (below the `bkit:end` marker)
 * from an installed prompts.md. Rows are `| Prompt | Provider | Model |`. Best-effort:
 * returns [] when the file, the marker, the section, or the rows are absent.
 * Only the region after the line-anchored `bkit:end` is read — the bkit-managed block is
 * never an override, even when its prose quotes the marker.
 */
export function parseModelOverrides(promptsMdPath) {
    if (!fs.existsSync(promptsMdPath))
        return [];
    const content = fs.readFileSync(promptsMdPath, "utf-8");
    const endIdx = findLineAnchoredMarkers(content, selectMarkers("html-comment")[1])[0];
    const region = endIdx === undefined ? "" : content.slice(endIdx);
    const ovIdx = region.indexOf("## Model Overrides");
    if (ovIdx === -1)
        return [];
    const out = [];
    let inTable = false;
    for (const line of region.slice(ovIdx).split("\n")) {
        const t = line.trim();
        if (!t.startsWith("|")) {
            if (inTable)
                break;
            continue;
        }
        inTable = true;
        const cells = t
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((s) => s.trim().replace(/^`|`$/g, ""));
        if (cells.length < 3)
            continue;
        const [prompt, provider, model] = cells;
        if (!prompt || !provider || !model)
            continue;
        if (prompt.toLowerCase() === "prompt")
            continue; // header row
        if (/^-+$/.test(prompt))
            continue; // separator row
        out.push({ prompt, provider, model });
    }
    return out;
}
/**
 * Merge consumer overrides (from `overridesPath`, an installed prompts.md) into a
 * per-agent model `lookup` for one host/provider key. Mutates `lookup` in place;
 * only rows whose Provider matches `providerKey` and whose Prompt is a known agent win.
 */
export function applyModelOverrides(lookup, providerKey, overridesPath) {
    for (const o of parseModelOverrides(overridesPath)) {
        if (o.provider.toLowerCase() === providerKey.toLowerCase() && lookup.has(o.prompt)) {
            lookup.set(o.prompt, o.model);
        }
    }
}
/**
 * Override rows (from `overridesPath`) naming no agent in `known`, deduplicated in file
 * order. `applyModelOverrides` skips such rows, so they are reported, not applied.
 */
export function unknownModelOverrides(overridesPath, known) {
    const out = [];
    for (const o of parseModelOverrides(overridesPath)) {
        if (!known.has(o.prompt) && !out.includes(o.prompt))
            out.push(o.prompt);
    }
    return out;
}
// column → (sourceEffort → target)
/**
 * Program → prompts.md effort-table column header.
 *
 * The effort table is keyed on PROGRAM, never on gateway — how hard to think is a property
 * of the program's config format (`effort:` on Claude and Cursor, `reasoningEffort:` on
 * opencode, on a different ladder), not of the model. Every opencode gateway therefore
 * shares one column. That is the opposite axis to GATEWAY_COLUMN, and keeping the two apart
 * is what stops either table growing as programs x gateways.
 */
const EFFORT_COLUMN_FOR_PROGRAM = {
    claude: "Claude",
    cursor: "Cursor",
    opencode: "OpenCode",
    codex: "Codex",
    antigravity: "Antigravity",
};
/**
 * Parse prompts.md effort→provider table (header starts with Default | Claude | …).
 * Returns column → (sourceEffort → target). Hard-fails if the table is absent/malformed.
 */
export function parseEffortMap(promptsMdPath) {
    if (!fs.existsSync(promptsMdPath)) {
        throw new Error(`${LOG_PREFIX} Effort map: file not found: ${promptsMdPath}`);
    }
    const content = fs.readFileSync(promptsMdPath, "utf-8");
    const lines = content.split("\n");
    let headerIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        if (!t.startsWith("|"))
            continue;
        const headers = t
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim().replace(/`/g, ""));
        if (headers[0]?.toLowerCase() === "default" &&
            headers.some((h) => h.toLowerCase() === "claude") &&
            headers.some((h) => /opencode/i.test(h))) {
            headerIdx = i;
            break;
        }
    }
    if (headerIdx === -1) {
        throw new Error(`${LOG_PREFIX} Could not find Effort → provider thinking table (Default | Claude | …) in ${promptsMdPath}`);
    }
    const headerCells = lines[headerIdx]
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim().replace(/`/g, ""));
    // Skip separator row
    let rowStart = headerIdx + 1;
    if (rowStart < lines.length && /^[|\s:-]+$/.test(lines[rowStart].trim()))
        rowStart++;
    const out = new Map();
    for (const h of headerCells)
        out.set(h, new Map());
    for (let i = rowStart; i < lines.length; i++) {
        const t = lines[i].trim();
        if (!t.startsWith("|"))
            break;
        const cells = t
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim().replace(/`/g, ""));
        if (cells.length < headerCells.length)
            continue;
        const sourceEffort = cells[0];
        if (!sourceEffort || /^-+$/.test(sourceEffort))
            continue;
        for (let c = 0; c < headerCells.length; c++) {
            const target = cells[c];
            if (!target)
                continue;
            out.get(headerCells[c]).set(sourceEffort, target);
        }
    }
    const defaultCol = out.get("Default");
    if (!defaultCol || defaultCol.size === 0) {
        throw new Error(`${LOG_PREFIX} Effort map Default column empty in ${promptsMdPath}`);
    }
    return out;
}
/**
 * Resolve the prompts.md effort-table column for a program.
 * Throws on an unknown program; never falls back. Callers pass a program ("claude" /
 * "cursor" / "opencode"), not a gateway.
 */
export function effortColumnForProgram(program) {
    const col = EFFORT_COLUMN_FOR_PROGRAM[program];
    if (!col) {
        throw new Error(`effortColumnForProgram: no prompts.md effort column for program ${JSON.stringify(program)}`);
    }
    return col;
}
/**
 * Look up the emitted thinking value for a program + source prompt effort.
 * Column resolution: program → named column → identity when the row is absent.
 */
export function lookupEffort(effortMap, program, sourceEffort) {
    return effortMap.get(effortColumnForProgram(program))?.get(sourceEffort) ?? sourceEffort;
}
/**
 * The opencode-side provider id for a bkit provider key. Equal to the key for all providers
 * (opencode → opencode, openrouter → openrouter, etc.). Model ids are `<providerId>/<model>`. Unknown
 * keys pass through unchanged.
 */
export function opencodeProviderId(providerKey) {
    if (!isOpencodeProvider(providerKey))
        return providerKey;
    return OPENCODE_PROVIDER_DEFAULTS[providerKey].providerId ?? providerKey;
}
/** Narrow a raw string to the opencode provider allowlist. */
export function isOpencodeProvider(value) {
    return OPENCODE_PROVIDERS.some((provider) => provider === value);
}
