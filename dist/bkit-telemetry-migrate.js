// bkit-telemetry-migrate.ts — migrate all legacy .md ledgers to JSONL:
//   docs/knowledge.md  → docs/knowledge.jsonl   (kind:"knowledge")
//   docs/decisions.md  → docs/decisions.jsonl   (kind:"decision")
//   docs/pending.md    → docs/deferrals.jsonl   (kind:"deferral")
//   .bkit/friction.md  → .bkit/friction.jsonl   (kind:"friction")
//   docs/completed.md  → .bkit/issues.jsonl     (kind:"feature", status:"SHIPPED")
//
// The fifth pair also performs the BOOTSTRAP SEED, same run: scans
// docs/plans/{YYYYMM}/{FID}-{design,plan}.md + folded per-FID status.jsonl and
// appends ONE `feature` row per in-flight FID at its detected phase, skipping FIDs
// already present in .bkit/issues.jsonl.
//
// Safety contract (DE-39):
//   1. Creates a transient .md.bak before any write.
//   2. Writes all rows to .jsonl.
//   3. Verifies row-count parity against the .md.bak row count.
//   4. ONLY deletes the .md after parity is confirmed.
//   5. A parity mismatch OR absent .md.bak ABORTS with ZERO .md deleted.
//   6. Re-run is idempotent (no-op if .md already absent and .jsonl already populated).
//
// NEVER called from bkit upgrade — only via explicit `bkit telemetry migrate` invocation.
// Enforced by bkit-telemetry-migrate.integration.test.ts.
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolveRepoSlug } from "./bkit-telemetry.js";
import { findLineAnchoredMarkers, selectMarkers } from "./bkit-markers.js";
/**
 * Split a legacy `**Related:**` value into individual pointers.
 *
 * The field is free prose ("BAR-138, BAR-130, `docs/…/design.md`, KN-1"), so
 * split on commas and keep each item verbatim minus surrounding backticks —
 * items carry trailing qualifiers ("BAR-142 §A2", "`docs/pending.md` (per-key
 * deferred)") that are meaning, not noise, and are preserved as written.
 */
export function parseRelated(value) {
    if (!value)
        return [];
    return value
        .split(",")
        .map((s) => s.trim().replace(/^`|`$/g, "").trim())
        .filter((s) => s.length > 0);
}
/**
 * Map a legacy `**Status:**` value onto OPEN/CLOSED.
 *
 * The legacy field is free prose, not a token: `RESOLVED — closed by the bkit
 * 3.3.0 upgrade`, `resolved (#453, 2026-06-03) — migration 20260603150000`,
 * `partially-resolved — Phase 1 landed, Phase 2 open`. Substring match, shared with
 * the friction builder.
 *
 * `partially-resolved` reads as OPEN. It is matched BEFORE the resolve check because
 * it contains "resolv" as a substring.
 */
export function parseLegacyStatus(value) {
    const raw = (value ?? "open").toLowerCase().replace(/`/g, "").trim();
    if (/partial|in progress|in-progress|wip/.test(raw))
        return "OPEN";
    return /recover|resolv|clos|fix|done|complet/.test(raw) ? "CLOSED" : "OPEN";
}
/**
 * Map a legacy `**Severity:**` value onto the current enum.
 *
 * The legacy scale is `critical | normal | low`; `normal` maps to MEDIUM. Legacy
 * entries with no Severity (the whole of `friction.md`, which has no such field)
 * default to MEDIUM — an unknown->neutral mapping, NOT a claim about the row.
 */
export function mapLegacySeverity(value) {
    switch (value?.toLowerCase().replace(/`/g, "").trim()) {
        case "critical":
            return "CRITICAL";
        case "high":
            return "HIGH";
        case "low":
            return "LOW";
        case "normal":
        case "medium":
            return "MEDIUM";
        default:
            return "MEDIUM";
    }
}
/**
 * Parse a knowledge.md corpus into structured entries.
 * Handles both `KN-CORE-{N}` (bkit-shipped) and `KN-{N}` (consumer) namespaces.
 */
export function parseKnowledgeMd(content) {
    return parseMdEntries(content, /^## (KN-(?:CORE-)?\d+): (.+)$/);
}
/**
 * Parse a decisions.md corpus into structured entries.
 * Handles `DE-{N}` namespace.
 */
export function parseDecisionsMd(content) {
    return parseMdEntries(content, /^## (DE-\d+): (.+)$/);
}
/**
 * Parse docs/pending.md into deferral entries.
 * Skips the managed bkit:start/end header block; each `## Title` below it is one entry.
 */
export function parsePendingMd(content) {
    const body = stripManagedHeader(content);
    const entries = [];
    const lines = body.split("\n");
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line === undefined) {
            i++;
            continue;
        }
        const match = /^## (.+)$/.exec(line);
        if (!match) {
            i++;
            continue;
        }
        const titleRaw = (match[1] ?? "").trim();
        const title = cleanTitle(titleRaw);
        const bodyLines = [];
        i++;
        while (i < lines.length) {
            const bl = lines[i];
            if (bl === undefined) {
                i++;
                continue;
            }
            if (/^## /.test(bl))
                break;
            bodyLines.push(bl);
            i++;
        }
        const entryBody = bodyLines.join("\n").trim();
        const type = extractField(entryBody, "Type") ?? "issue";
        const category = extractField(entryBody, "Category") ?? "other";
        const status = extractField(entryBody, "Status") ?? "open";
        const description = extractField(entryBody, "Description") ?? title;
        const workaround = extractField(entryBody, "Workaround");
        const source = extractField(entryBody, "Source");
        const severity = mapLegacySeverity(extractField(entryBody, "Severity"));
        const references = parseRelated(extractField(entryBody, "Related"));
        const key = stableKey("pending", title);
        entries.push({
            id: key,
            key,
            title,
            body: entryBody,
            summary: title,
            detail: entryBody.length > 0 ? entryBody : undefined,
            category,
            status,
            references,
            // reuse known fields; pending-specific fields stored in body
            rootCause: undefined,
            fix: workaround,
            rationale: source,
        });
        // attach custom fields for row builder
        entries[entries.length - 1]._type = type;
        entries[entries.length - 1]._severity =
            severity;
        entries[entries.length - 1]._description =
            description;
        entries[entries.length - 1]._workaround =
            workaround;
        entries[entries.length - 1]._source = source;
    }
    return entries;
}
/**
 * Parse .bkit/friction.md into friction entries.
 * Skips the managed bkit:start/end header block; each `## Title` below it is one entry.
 */
export function parseFrictionMd(content) {
    const body = stripManagedHeader(content);
    const entries = [];
    const lines = body.split("\n");
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line === undefined) {
            i++;
            continue;
        }
        const match = /^## (.+)$/.exec(line);
        if (!match) {
            i++;
            continue;
        }
        const titleRaw = (match[1] ?? "").trim();
        const title = cleanTitle(titleRaw);
        const bodyLines = [];
        i++;
        while (i < lines.length) {
            const bl = lines[i];
            if (bl === undefined) {
                i++;
                continue;
            }
            if (/^## /.test(bl))
                break;
            bodyLines.push(bl);
            i++;
        }
        const entryBody = bodyLines.join("\n").trim();
        const category = extractField(entryBody, "Category") ?? "other";
        const scope = extractField(entryBody, "Scope") ?? "bkit-repo";
        const description = extractField(entryBody, "Description") ?? title;
        const remediation = extractField(entryBody, "Suggested fix");
        const status = extractField(entryBody, "Status")?.replace(/`/g, "").trim();
        const confidenceStr = extractField(entryBody, "Confidence");
        const lastConfirmedStr = extractField(entryBody, "Last-confirmed");
        const key = stableKey("friction", title);
        const entry = {
            id: key,
            key,
            title,
            body: entryBody,
            summary: title,
            detail: entryBody.length > 0 ? entryBody : undefined,
            category,
            _description: description,
            _source: extractField(entryBody, "Source"),
            // WHERE the friction happened. For a live friction row the orchestrator
            // writes exactly this into the envelope workflow/step, so preserving them
            // keeps migrated rows on the same axis as live ones — see buildFrictionRow.
            _workflow: extractField(entryBody, "Workflow"),
            _step: extractField(entryBody, "Step"),
            references: parseRelated(extractField(entryBody, "Related")),
            // The legacy friction.md format has no Severity field at all, so this is
            // always the unknown->neutral default rather than a migrated value.
            _severity: mapLegacySeverity(extractField(entryBody, "Severity")),
            entryTs: parseTitleDate(titleRaw),
            _scope: scope,
            _remediation: remediation,
            _status: status,
            _confidence: confidenceStr,
            _lastConfirmed: lastConfirmedStr,
        };
        entries.push(entry);
    }
    return entries;
}
/**
 * Legacy `docs/completed.md` domain vocabulary (`infra | agentic | backend |
 * frontend | data | integrations | ai | testing | security | other`) mapped
 * onto the current deferral/failure/feature domain set. Values already in the
 * domain set pass through unchanged; everything else maps to its closest
 * domain term, `other` if none.
 */
export function mapCompletedCategory(value) {
    const DOMAIN_SET = new Set([
        "agentic",
        "correctness",
        "testing",
        "infra",
        "tooling",
        "observability",
        "security",
        "architecture",
        "docs",
        "other",
    ]);
    const raw = (value ?? "").toLowerCase().replace(/`/g, "").trim();
    if (DOMAIN_SET.has(raw))
        return raw;
    switch (raw) {
        case "backend":
        case "frontend":
        case "data":
            return "correctness";
        case "integrations":
            return "infra";
        case "ai":
            return "agentic";
        default:
            return "other";
    }
}
/**
 * Parse a `docs/completed.md` corpus into structured entries — one per
 * `## Title (YYYY-MM-DD)` heading, fields `**Category:**` / `**Artifacts:**` /
 * `**Summary:**` / `**Related:**`. Skips the managed
 * `bkit:start`/`bkit:end` header block. A heading missing Category or Summary
 * is NEVER silently skipped — it still produces a row (loud fallback), and a
 * diagnostic is pushed to `diagnosticLines` when supplied.
 */
export function parseCompletedMd(content, diagnosticLines) {
    const body = stripManagedHeader(content);
    const entries = [];
    const lines = body.split("\n");
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line === undefined) {
            i++;
            continue;
        }
        // "## Title (YYYY-MM-DD)" — the date suffix is load-bearing for entryTs.
        const match = /^## (.+?)\s*\((\d{4}-\d{2}-\d{2})\)\s*$/.exec(line);
        if (!match) {
            i++;
            continue;
        }
        const titleRaw = (match[1] ?? "").trim();
        const title = cleanTitle(titleRaw);
        const bodyLines = [];
        i++;
        while (i < lines.length) {
            const bl = lines[i];
            if (bl === undefined) {
                i++;
                continue;
            }
            if (/^## /.test(bl))
                break;
            bodyLines.push(bl);
            i++;
        }
        const entryBody = bodyLines.join("\n").trim();
        const categoryRaw = extractField(entryBody, "Category");
        const artifacts = extractField(entryBody, "Artifacts");
        const summary = extractField(entryBody, "Summary");
        const related = extractField(entryBody, "Related");
        if (!categoryRaw || !summary) {
            const diag = `[bkit-telemetry] migrate: completed.md entry "${title}" missing ${!categoryRaw ? "Category" : ""}${!categoryRaw && !summary ? "/" : ""}${!summary ? "Summary" : ""} — using loud fallback, NOT skipped`;
            diagnosticLines.push(diag);
        }
        const references = [...(artifacts ? parseRelated(artifacts) : []), ...parseRelated(related)];
        const key = stableKey("completed", title);
        entries.push({
            id: key,
            key,
            title,
            body: entryBody,
            summary: title,
            detail: summary ?? entryBody,
            category: mapCompletedCategory(categoryRaw),
            references,
            entryTs: parseTitleDate(`(${match[2]})`),
        });
    }
    return entries;
}
/**
 * Strip the managed <!-- bkit:start --> … <!-- bkit:end --> header block from .md content.
 * Only a line-anchored end marker ends the header; prose quoting it does not.
 */
function stripManagedHeader(content) {
    const endMarker = selectMarkers("html-comment")[1];
    const idx = findLineAnchoredMarkers(content, endMarker)[0];
    if (idx === undefined)
        return content;
    return content.slice(idx + endMarker.length);
}
function parseMdEntries(content, headingRe) {
    const entries = [];
    const lines = content.split("\n");
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line === undefined) {
            i++;
            continue;
        }
        const match = headingRe.exec(line);
        if (!match) {
            i++;
            continue;
        }
        const id = match[1] ?? "";
        const titleRaw = match[2] ?? "";
        // Strip trailing " (superseded by ...)" or "(YYYY-MM-DD)" suffixes for the key
        const title = titleRaw.trim();
        // Collect body lines until next heading or EOF
        const bodyLines = [];
        i++;
        while (i < lines.length) {
            const bodyLine = lines[i];
            if (bodyLine === undefined) {
                i++;
                continue;
            }
            if (/^## /.test(bodyLine))
                break;
            bodyLines.push(bodyLine);
            i++;
        }
        const body = bodyLines.join("\n").trim();
        // Extract structured fields from body
        const category = extractField(body, "Category");
        const status = extractField(body, "Status");
        const rationale = extractField(body, "Why") ?? extractField(body, "Rationale");
        const rootCause = extractField(body, "Root cause");
        const fix = extractField(body, "Fix or rule");
        // `Discarded:` -> DecisionPayload.alternatives.
        const alternatives = extractField(body, "Discarded");
        // `Superseded by: DE-12` is a POINTER to another entry, so it belongs in
        // references (`status: SUPERSEDED` records the state; this records by what).
        const supersededBy = extractField(body, "Superseded by");
        // Build summary from title (clean trailing date/supersession markers)
        const summary = cleanTitle(title);
        // Build detail from body (preserve for agent readability)
        const detail = body.length > 0 ? body : undefined;
        // Build key: id-normalised-title slug, embedding the legacy id.
        const keySlug = stableKey(id, summary);
        // References: the entry's own legacy id FIRST, then everything its
        // `**Related:**` field points at.
        const references = [
            id,
            ...parseRelated(extractField(body, "Related")),
            ...parseRelated(supersededBy),
        ];
        entries.push({
            id,
            key: keySlug,
            title,
            body,
            summary,
            detail,
            category,
            status,
            rationale,
            rootCause,
            fix,
            references,
        });
        entries[entries.length - 1]._alternatives =
            alternatives;
    }
    return entries;
}
function extractField(body, fieldName) {
    // Match "- **FieldName:** value" or "- **FieldName (note):** value"
    const re = new RegExp(`\\*\\*${fieldName}[^*]*\\*\\*:?\\s*(.+?)(?:\\n|$)`, "i");
    const m = re.exec(body);
    return m ? m[1]?.trim() : undefined;
}
/**
 * Incident time carried by a legacy heading, as unix ms — or undefined.
 *
 * `friction.md` used two conventions: the documented trailing `(YYYY-MM-DD)` and
 * an ad-hoc leading `YYYY-MM-DD — `. Both are read.
 *
 * The heading is NOT rewritten here. `cleanTitle` already removes the trailing
 * form; the leading form stays part of the title `stableKey` hashes.
 */
export function parseTitleDate(titleRaw) {
    const m = /\((\d{4})-(\d{2})-(\d{2})\)\s*$/.exec(titleRaw) ?? /^(\d{4})-(\d{2})-(\d{2})\b/.exec(titleRaw);
    if (!m)
        return undefined;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (mo < 1 || mo > 12 || d < 1 || d > 31)
        return undefined;
    const ms = Date.UTC(y, mo - 1, d);
    // Date.UTC rolls invalid days over (Feb 31 -> Mar 3); an invalid day is rejected.
    const back = new Date(ms);
    if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) {
        return undefined;
    }
    return ms;
}
function cleanTitle(title) {
    // Strip trailing " (superseded by KN-17, ...)" and "(YYYY-MM-DD)" markers
    return title
        .replace(/\s*\(superseded by[^)]*\)/i, "")
        .replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, "")
        .trim();
}
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}
/**
 * Key that survives title truncation: `slugify(prefix-title.slice(0, 60))` plus a
 * digest of the full title, appended ONLY when truncation discards characters.
 */
function stableKey(prefix, title) {
    const slug = slugify(`${prefix}-${title.slice(0, 60)}`);
    if (title.length <= 60)
        return slug;
    return `${slug}-${createHash("sha256").update(title).digest("hex").slice(0, 7)}`;
}
// ---------------------------------------------------------------------------
// Row builders
// ---------------------------------------------------------------------------
function buildKnowledgeRow(entry, opts) {
    const ts = opts.baseTs + opts.idx;
    return {
        ts,
        kind: "knowledge",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        references: entry.references,
        summary: entry.summary,
        description: entry.detail,
        rootCause: entry.rootCause,
        remediation: entry.fix,
    };
}
function buildDecisionRow(entry, opts) {
    const ts = opts.baseTs + opts.idx;
    // Substring, not equality — matches `superseded by DE-12` / `superseded — …`.
    const statusValue = /supersed/i.test(entry.status ?? "")
        ? "SUPERSEDED"
        : "ACTIVE";
    return {
        ts,
        kind: "decision",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        references: entry.references,
        summary: entry.summary,
        rationale: entry.rationale,
        alternatives: entry._alternatives,
        description: entry.detail,
        status: statusValue,
    };
}
function buildDeferralRow(entry, opts) {
    const e = entry;
    const rawType = e._type ?? "issue";
    const type = rawType === "feature" ? "feature" : "issue";
    return {
        ts: entry.entryTs ?? opts.baseTs + opts.idx,
        kind: "deferral",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        type,
        category: entry.category ?? "other",
        severity: e._severity ?? "MEDIUM",
        // Title -> summary, prose -> description.
        summary: entry.summary,
        description: e._description ?? entry.summary,
        remediation: e._workaround,
        source: e._source,
        status: parseLegacyStatus(entry.status),
        references: entry.references,
    };
}
function buildFrictionRow(entry, opts) {
    const e = entry;
    const rawCat = e.category ?? "other";
    const VALID_CATS = new Set([
        "human-confirm",
        "permission-prompt",
        "agent-rework",
        "manual-install",
        "tool-failure",
        "destructive-backout",
        "other",
    ]);
    const category = VALID_CATS.has(rawCat) ? rawCat : "other";
    const rawScope = e._scope ?? "bkit-repo";
    const scope = rawScope === "consumer" ? "consumer" : rawScope === "universal" ? "universal" : "bkit-repo";
    const confidenceMap = { high: 1, medium: 0.5, low: 0.25 };
    const confidence = e._confidence
        ? (confidenceMap[e._confidence.toLowerCase()] ?? undefined)
        : undefined;
    let lastConfirmed;
    if (e._lastConfirmed) {
        const d = Date.parse(e._lastConfirmed);
        if (!isNaN(d))
            lastConfirmed = d;
    }
    const status = e._status === undefined ? undefined : parseLegacyStatus(e._status);
    return {
        ts: entry.entryTs ?? opts.baseTs + opts.idx,
        kind: "friction",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        // WHERE the friction happened, not who transported the row: envelope workflow/step
        // are the workflow/step the friction occurred in, as on a live friction row. Falls
        // back to the migrate provenance only when the legacy row had neither.
        workflow: e._workflow ?? "migrate",
        step: e._step ?? "bkit-telemetry-migrate",
        key: entry.key,
        category,
        scope,
        severity: e._severity ?? "MEDIUM",
        // Title -> summary, prose -> description.
        summary: entry.summary,
        description: e._description ?? entry.summary,
        remediation: e._remediation,
        source: e._source,
        status,
        references: entry.references,
        confidence,
        lastConfirmed,
    };
}
/**
 * Build a `feature` row (status:"SHIPPED") from a parsed `docs/completed.md`
 * entry. `key` = the entry's stable, content-minted slug (legacy `completed.md`
 * entries carry no FID), derived like every other migrated ledger's key.
 */
function buildFeatureRow(entry, opts) {
    return {
        ts: entry.entryTs ?? opts.baseTs + opts.idx,
        kind: "feature",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        category: entry.category ?? "other",
        summary: entry.title,
        description: entry.detail ?? entry.title,
        status: "SHIPPED",
        references: entry.references,
    };
}
const STATUS_RANK = {
    DESIGNED: 0,
    PLANNED: 1,
    BUILT: 2,
    DEBUGGED: 3,
};
/**
 * Parse one JSONL line, never throwing — returns `null` on a malformed line.
 * Callers own the loud diagnostic (never a silent skip) and name their own
 * file/context in it.
 */
function tryParseJsonLine(line) {
    let parsed = null;
    try {
        parsed = JSON.parse(line);
    }
    catch {
        parsed = null;
    }
    return parsed;
}
/**
 * Read every `key` already present in `.bkit/issues.jsonl` (best-effort,
 * tolerant of malformed lines) — the seed skips any FID already recorded,
 * regardless of its current folded status.
 */
function existingIssueKeys(issuesJsonlPath) {
    const keys = new Set();
    if (!fs.existsSync(issuesJsonlPath))
        return keys;
    const raw = fs.readFileSync(issuesJsonlPath, "utf-8");
    for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        const obj = tryParseJsonLine(trimmed);
        if (obj === null) {
            // tolerant — malformed lines are ignored, never abort the seed, but
            // ALWAYS logged loudly (never a silent skip)
            console.error(`[bkit-telemetry] seed: malformed .bkit/issues.jsonl line skipped`);
            continue;
        }
        if (obj.kind === "feature" && typeof obj.key === "string")
            keys.add(obj.key);
    }
    return keys;
}
/**
 * Detect an in-flight FID's phase from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md`
 * presence plus its folded `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (a
 * `workflow-done` row for `build`/`debug` promotes the detected phase). A one-time
 * bootstrap read — NOT the per-close sensing source, which is the ledger itself.
 */
function detectInFlightStatus(planDir, fid, hasPlan) {
    let status = hasPlan ? "PLANNED" : "DESIGNED";
    const statusJsonlPath = path.join(planDir, "logs", fid, "status.jsonl");
    if (!fs.existsSync(statusJsonlPath))
        return status;
    let raw;
    try {
        raw = fs.readFileSync(statusJsonlPath, "utf-8");
    }
    catch (err) {
        // best-effort — a read failure keeps the presence-derived status
        console.error(`[bkit-telemetry] seed: could not read ${statusJsonlPath} — ${String(err)}`);
        return status;
    }
    for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        const obj = tryParseJsonLine(trimmed);
        if (obj === null) {
            // tolerant — malformed status.jsonl lines are ignored, never abort the
            // seed, but ALWAYS logged loudly (never a silent skip)
            console.error(`[bkit-telemetry] seed: malformed ${statusJsonlPath} line skipped`);
            continue;
        }
        if (obj.type !== "workflow-done")
            continue;
        const promoted = obj.workflow === "build" ? "BUILT" : obj.workflow === "debug" ? "DEBUGGED" : undefined;
        if (promoted && STATUS_RANK[promoted] > STATUS_RANK[status])
            status = promoted;
    }
    return status;
}
/**
 * Scan `docs/plans/{YYYYMM}/` for `{FID}-design.md` / `{FID}-plan.md` and
 * append one `feature` seed row per in-flight FID not already present in
 * `.bkit/issues.jsonl`, at its detected status. Idempotent — re-running finds
 * every FID already present via `existingIssueKeys` and adds nothing.
 * Best-effort: any read error is logged and skipped, never thrown.
 */
export function seedInFlightFeatures(cwd, repo, bkitVersion, lines) {
    const plansRoot = path.join(cwd, "docs", "plans");
    const issuesJsonlPath = path.join(cwd, ".bkit", "issues.jsonl");
    if (!fs.existsSync(plansRoot))
        return [];
    const existing = existingIssueKeys(issuesJsonlPath);
    const seedRows = [];
    const baseTs = Math.floor(Date.now()) + 50000;
    let idx = 0;
    let monthDirs;
    try {
        monthDirs = fs
            .readdirSync(plansRoot, { withFileTypes: true })
            .filter((d) => d.isDirectory() && /^\d{6}$/.test(d.name))
            .map((d) => d.name);
    }
    catch (err) {
        lines.push(`[bkit-telemetry] seed: could not read ${plansRoot} — ${String(err)}`);
        return [];
    }
    for (const month of monthDirs) {
        const planDir = path.join(plansRoot, month);
        let files;
        try {
            files = fs.readdirSync(planDir).filter((f) => f.endsWith(".md"));
        }
        catch {
            continue;
        }
        const fids = new Map();
        for (const f of files) {
            const designMatch = /^(.+)-design\.md$/.exec(f);
            const planMatch = /^(.+)-plan\.md$/.exec(f);
            if (designMatch?.[1]) {
                const fid = designMatch[1];
                fids.set(fid, {
                    ...(fids.get(fid) ?? { hasDesign: false, hasPlan: false }),
                    hasDesign: true,
                });
            }
            if (planMatch?.[1]) {
                const fid = planMatch[1];
                fids.set(fid, {
                    ...(fids.get(fid) ?? { hasDesign: false, hasPlan: false }),
                    hasPlan: true,
                });
            }
        }
        for (const [fid, presence] of fids) {
            if (existing.has(fid))
                continue;
            const status = detectInFlightStatus(planDir, fid, presence.hasPlan);
            const row = {
                ts: baseTs + idx,
                kind: "feature",
                repo,
                bkitVersion,
                workflow: "migrate",
                step: "bkit-telemetry-migrate-seed",
                key: fid,
                category: "other",
                summary: fid,
                description: `Bootstrap-seeded from on-disk plan artifacts (docs/plans/${month}/); detected status ${status}.`,
                status,
            };
            seedRows.push(row);
            existing.add(fid);
            idx++;
        }
    }
    if (seedRows.length > 0) {
        const ndjson = seedRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        fs.appendFileSync(issuesJsonlPath, ndjson, "utf-8");
        lines.push(`[bkit-telemetry] seed: appended ${seedRows.length} bootstrap feature row(s) to ${issuesJsonlPath}`);
    }
    else {
        lines.push("[bkit-telemetry] seed: no new in-flight FIDs to seed");
    }
    return seedRows;
}
// ---------------------------------------------------------------------------
// Core migration function
// ---------------------------------------------------------------------------
export async function runMigrate(opts) {
    const cwd = opts.cwd ?? process.cwd();
    const dryRun = opts.dryRun ?? false;
    const bkitVersion = opts.bkitVersion;
    const lines = [];
    const knMdPath = path.join(cwd, "docs", "knowledge.md");
    const knJsonlPath = path.join(cwd, "docs", "knowledge.jsonl");
    const knBakPath = knMdPath + ".bak";
    const deMdPath = path.join(cwd, "docs", "decisions.md");
    const deJsonlPath = path.join(cwd, "docs", "decisions.jsonl");
    const deBakPath = deMdPath + ".bak";
    const pendingMdPath = path.join(cwd, "docs", "pending.md");
    const deferralsJsonlPath = path.join(cwd, "docs", "deferrals.jsonl");
    const pendingBakPath = pendingMdPath + ".bak";
    const frictionMdPath = path.join(cwd, ".bkit", "friction.md");
    const frictionJsonlPath = path.join(cwd, ".bkit", "friction.jsonl");
    const frictionBakPath = frictionMdPath + ".bak";
    // Idempotency: .md absent = nothing to do for that pair, whether it was
    // migrated already OR never existed. Every pair shares this absent-.md-means-skip
    // rule; it does not depend on the .jsonl being non-empty.
    const knMdExists = fs.existsSync(knMdPath);
    const deMdExists = fs.existsSync(deMdPath);
    const pendingMdExists = fs.existsSync(pendingMdPath);
    const frictionMdExists = fs.existsSync(frictionMdPath);
    const knAlreadyDone = !knMdExists;
    const deAlreadyDone = !deMdExists;
    // pending/friction: .md absent = already done (either never existed or already migrated)
    const pendingAlreadyDone = !pendingMdExists;
    const frictionAlreadyDone = !frictionMdExists;
    const completedMdPath = path.join(cwd, "docs", "completed.md");
    const issuesJsonlPath = path.join(cwd, ".bkit", "issues.jsonl");
    const completedBakPath = completedMdPath + ".bak";
    const completedMdExists = fs.existsSync(completedMdPath);
    const completedAlreadyDone = !completedMdExists;
    // Determine repo slug from package.json or git remote — resolved once, used
    // by every row builder AND the bootstrap seed (needed even on the already-migrated
    // fast path below).
    const repo = detectRepo(cwd);
    // A fresh consumer has no legacy `.md` ledgers AND no migrated rows: a clean
    // nothing-to-migrate outcome, not a failure.
    //
    // These two are derived HERE and used ONLY by this check; they do NOT gate
    // `knAlreadyDone` / `deAlreadyDone` above. "Already migrated" needs a rows-exist
    // signal, so the fresh-consumer test keeps it.
    const knJsonlNonEmpty = fs.existsSync(knJsonlPath) && fs.readFileSync(knJsonlPath, "utf-8").trim().length > 0;
    const deJsonlNonEmpty = fs.existsSync(deJsonlPath) && fs.readFileSync(deJsonlPath, "utf-8").trim().length > 0;
    // issues.jsonl is part of the rows-exist signal: it is a migration TARGET.
    const issuesJsonlNonEmpty = fs.existsSync(issuesJsonlPath) && fs.readFileSync(issuesJsonlPath, "utf-8").trim().length > 0;
    //
    // `completed.md` counts as a legacy ledger here.
    const noLegacyLedgers = !knMdExists &&
        !deMdExists &&
        !pendingMdExists &&
        !frictionMdExists &&
        !completedMdExists &&
        !knJsonlNonEmpty &&
        !deJsonlNonEmpty &&
        !issuesJsonlNonEmpty;
    if (noLegacyLedgers) {
        lines.push("[bkit-telemetry] migrate: no legacy .md ledgers found — nothing to migrate");
        return {
            ran: false,
            dryRun,
            knowledgeRowCount: 0,
            decisionRowCount: 0,
            pendingRowCount: 0,
            frictionRowCount: 0,
            featureRowCount: 0,
            seedRowCount: 0,
            knowledgeMdDeleted: false,
            decisionsMdDeleted: false,
            pendingMdDeleted: false,
            frictionMdDeleted: false,
            completedMdDeleted: false,
            lines,
            ok: true,
        };
    }
    if (knAlreadyDone &&
        deAlreadyDone &&
        pendingAlreadyDone &&
        frictionAlreadyDone &&
        completedAlreadyDone) {
        lines.push("[bkit-telemetry] migrate: already complete (idempotent no-op)");
        // The bootstrap seed still runs on an already-migrated repo — idempotent (skips
        // FIDs already present); it seeds FIDs added to docs/plans/** after the first migrate.
        const seedRows = dryRun ? [] : seedInFlightFeatures(cwd, repo, bkitVersion, lines);
        return {
            ran: seedRows.length > 0,
            dryRun,
            knowledgeRowCount: 0,
            decisionRowCount: 0,
            pendingRowCount: 0,
            frictionRowCount: 0,
            featureRowCount: 0,
            seedRowCount: seedRows.length,
            knowledgeMdDeleted: false,
            decisionsMdDeleted: false,
            pendingMdDeleted: false,
            frictionMdDeleted: false,
            completedMdDeleted: false,
            lines,
            ok: true,
        };
    }
    // Use a stable base timestamp for this migration run
    const baseTs = Math.floor(Date.now());
    // ---------------------------------------------------------------------------
    // Parse knowledge.md (if not already done)
    // ---------------------------------------------------------------------------
    let knEntries = [];
    let knRows = [];
    if (!knAlreadyDone) {
        const knContent = fs.readFileSync(knMdPath, "utf-8");
        knEntries = parseKnowledgeMd(knContent);
        knRows = knEntries.map((entry, idx) => buildKnowledgeRow(entry, { repo, bkitVersion, baseTs, idx }));
        lines.push(`[bkit-telemetry] migrate: parsed ${knEntries.length} knowledge entries`);
    }
    else {
        lines.push("[bkit-telemetry] migrate: knowledge.md absent — skipping");
    }
    // ---------------------------------------------------------------------------
    // Parse decisions.md (if not already done)
    // ---------------------------------------------------------------------------
    let deEntries = [];
    let deRows = [];
    if (!deAlreadyDone) {
        const deContent = fs.readFileSync(deMdPath, "utf-8");
        deEntries = parseDecisionsMd(deContent);
        deRows = deEntries.map((entry, idx) => buildDecisionRow(entry, {
            repo,
            bkitVersion,
            baseTs: baseTs + 10000,
            idx,
        }));
        lines.push(`[bkit-telemetry] migrate: parsed ${deEntries.length} decision entries`);
    }
    else {
        lines.push("[bkit-telemetry] migrate: decisions.md absent — skipping");
    }
    // ---------------------------------------------------------------------------
    // Parse docs/pending.md (if not already done)
    // ---------------------------------------------------------------------------
    let pendingEntries = [];
    let pendingRows = [];
    if (!pendingAlreadyDone) {
        const pendingContent = fs.readFileSync(pendingMdPath, "utf-8");
        pendingEntries = parsePendingMd(pendingContent);
        pendingRows = pendingEntries.map((entry, idx) => buildDeferralRow(entry, { repo, bkitVersion, baseTs: baseTs + 20000, idx }));
        lines.push(`[bkit-telemetry] migrate: parsed ${pendingEntries.length} pending (deferral) entries`);
    }
    else {
        lines.push("[bkit-telemetry] migrate: pending.md absent — skipping");
    }
    // ---------------------------------------------------------------------------
    // Parse .bkit/friction.md (if not already done)
    // ---------------------------------------------------------------------------
    let frictionEntries = [];
    let frictionRows = [];
    if (!frictionAlreadyDone) {
        const frictionContent = fs.readFileSync(frictionMdPath, "utf-8");
        frictionEntries = parseFrictionMd(frictionContent);
        frictionRows = frictionEntries.map((entry, idx) => buildFrictionRow(entry, { repo, bkitVersion, baseTs: baseTs + 30000, idx }));
        lines.push(`[bkit-telemetry] migrate: parsed ${frictionEntries.length} friction entries`);
    }
    else {
        lines.push("[bkit-telemetry] migrate: friction.md absent — skipping");
    }
    // ---------------------------------------------------------------------------
    // Parse docs/completed.md → .bkit/issues.jsonl `feature` rows (fifth pair)
    // ---------------------------------------------------------------------------
    let completedEntries = [];
    let featureRows = [];
    if (!completedAlreadyDone) {
        const completedContent = fs.readFileSync(completedMdPath, "utf-8");
        completedEntries = parseCompletedMd(completedContent, lines);
        featureRows = completedEntries.map((entry, idx) => buildFeatureRow(entry, { repo, bkitVersion, baseTs: baseTs + 40000, idx }));
        lines.push(`[bkit-telemetry] migrate: parsed ${completedEntries.length} completed (feature) entries`);
    }
    else {
        lines.push("[bkit-telemetry] migrate: completed.md absent — skipping");
    }
    // Dry-run: report and exit without writing
    if (dryRun) {
        lines.push(`[bkit-telemetry] migrate: dry-run — would write ${knRows.length} knowledge rows to ${knJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would write ${deRows.length} decision rows to ${deJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would append ${pendingRows.length} deferral rows to ${deferralsJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would append ${frictionRows.length} friction rows to ${frictionJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would append ${featureRows.length} feature rows to ${issuesJsonlPath} (+ bootstrap seed)`);
        lines.push("[bkit-telemetry] migrate: dry-run — no files written");
        return {
            ran: false,
            dryRun: true,
            knowledgeRowCount: knRows.length,
            decisionRowCount: deRows.length,
            pendingRowCount: pendingRows.length,
            frictionRowCount: frictionRows.length,
            featureRowCount: featureRows.length,
            seedRowCount: 0,
            knowledgeMdDeleted: false,
            decisionsMdDeleted: false,
            pendingMdDeleted: false,
            frictionMdDeleted: false,
            completedMdDeleted: false,
            lines,
            ok: true,
        };
    }
    // ---------------------------------------------------------------------------
    // Parity-gated write cycle for knowledge (if needed)
    // ---------------------------------------------------------------------------
    let knMdDeleted = false;
    if (!knAlreadyDone) {
        // Step 1: create .md.bak
        const knContent = fs.readFileSync(knMdPath, "utf-8");
        fs.writeFileSync(knBakPath, knContent, "utf-8");
        lines.push(`[bkit-telemetry] migrate: created ${knBakPath}`);
        // Step 2: write .jsonl
        const knJsonl = knRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        fs.writeFileSync(knJsonlPath, knJsonl, "utf-8");
        lines.push(`[bkit-telemetry] migrate: wrote ${knRows.length} rows to ${knJsonlPath}`);
        // Step 3: parity check — re-read .bak and re-parse
        if (!fs.existsSync(knBakPath)) {
            return abort("ABORT: knowledge.md.bak absent after creation — parity gate triggered; ZERO .md deleted", lines);
        }
        const knBakContent = fs.readFileSync(knBakPath, "utf-8");
        const knBakEntries = parseKnowledgeMd(knBakContent);
        if (knBakEntries.length !== knRows.length) {
            // Parity mismatch: remove the .jsonl we just wrote and abort
            fs.unlinkSync(knJsonlPath);
            fs.writeFileSync(knJsonlPath, "", "utf-8"); // restore empty sentinel
            return abort(`ABORT: knowledge parity mismatch — .bak has ${knBakEntries.length} entries, .jsonl has ${knRows.length} rows; ZERO .md deleted`, lines);
        }
        lines.push(`[bkit-telemetry] migrate: knowledge parity confirmed (${knRows.length} rows = ${knBakEntries.length} .bak entries)`);
        // Step 4: delete .md
        fs.unlinkSync(knMdPath);
        knMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: deleted ${knMdPath}`);
        // Step 5: remove .bak
        fs.unlinkSync(knBakPath);
        lines.push(`[bkit-telemetry] migrate: removed ${knBakPath}`);
    }
    // ---------------------------------------------------------------------------
    // Parity-gated write cycle for decisions (if needed)
    // ---------------------------------------------------------------------------
    let deMdDeleted = false;
    if (!deAlreadyDone) {
        // Step 1: create .md.bak
        const deContent = fs.readFileSync(deMdPath, "utf-8");
        fs.writeFileSync(deBakPath, deContent, "utf-8");
        lines.push(`[bkit-telemetry] migrate: created ${deBakPath}`);
        // Step 2: write .jsonl
        const deJsonl = deRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        fs.writeFileSync(deJsonlPath, deJsonl, "utf-8");
        lines.push(`[bkit-telemetry] migrate: wrote ${deRows.length} rows to ${deJsonlPath}`);
        // Step 3: parity check
        if (!fs.existsSync(deBakPath)) {
            return abort("ABORT: decisions.md.bak absent after creation — parity gate triggered; ZERO .md deleted", lines);
        }
        const deBakContent = fs.readFileSync(deBakPath, "utf-8");
        const deBakEntries = parseDecisionsMd(deBakContent);
        if (deBakEntries.length !== deRows.length) {
            // Parity mismatch: restore empty .jsonl and abort
            fs.unlinkSync(deJsonlPath);
            fs.writeFileSync(deJsonlPath, "", "utf-8");
            return abort(`ABORT: decisions parity mismatch — .bak has ${deBakEntries.length} entries, .jsonl has ${deRows.length} rows; ZERO .md deleted`, lines);
        }
        lines.push(`[bkit-telemetry] migrate: decisions parity confirmed (${deRows.length} rows = ${deBakEntries.length} .bak entries)`);
        // Step 4: delete .md
        fs.unlinkSync(deMdPath);
        deMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: deleted ${deMdPath}`);
        // Step 5: remove .bak
        fs.unlinkSync(deBakPath);
        lines.push(`[bkit-telemetry] migrate: removed ${deBakPath}`);
    }
    // ---------------------------------------------------------------------------
    // Parity-gated append cycle for pending.md → deferrals.jsonl (if needed)
    // Uses a .migrating temp file so partial writes never corrupt the live .jsonl.
    // ---------------------------------------------------------------------------
    let pendingMdDeleted = false;
    if (!pendingAlreadyDone && pendingRows.length > 0) {
        const pendingContent = fs.readFileSync(pendingMdPath, "utf-8");
        fs.writeFileSync(pendingBakPath, pendingContent, "utf-8");
        lines.push(`[bkit-telemetry] migrate: created ${pendingBakPath}`);
        const migratingPath = deferralsJsonlPath + ".migrating";
        const newNdjson = pendingRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        fs.writeFileSync(migratingPath, newNdjson, "utf-8");
        if (!fs.existsSync(pendingBakPath)) {
            fs.unlinkSync(migratingPath);
            return abort("ABORT: pending.md.bak absent after creation — parity gate triggered; ZERO .md deleted", lines);
        }
        const bakEntries = parsePendingMd(fs.readFileSync(pendingBakPath, "utf-8"));
        if (bakEntries.length !== pendingRows.length) {
            fs.unlinkSync(migratingPath);
            return abort(`ABORT: pending parity mismatch — .bak has ${bakEntries.length} entries, wrote ${pendingRows.length} rows; ZERO .md deleted`, lines);
        }
        lines.push(`[bkit-telemetry] migrate: pending parity confirmed (${pendingRows.length} rows)`);
        fs.appendFileSync(deferralsJsonlPath, fs.readFileSync(migratingPath, "utf-8"), "utf-8");
        fs.unlinkSync(migratingPath);
        lines.push(`[bkit-telemetry] migrate: appended ${pendingRows.length} deferral rows to ${deferralsJsonlPath}`);
        fs.unlinkSync(pendingMdPath);
        pendingMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: deleted ${pendingMdPath}`);
        fs.unlinkSync(pendingBakPath);
        lines.push(`[bkit-telemetry] migrate: removed ${pendingBakPath}`);
    }
    else if (!pendingAlreadyDone && pendingRows.length === 0) {
        // No entries to port — still delete the .md (empty managed-header-only file)
        fs.unlinkSync(pendingMdPath);
        pendingMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: pending.md had 0 entries — deleted (no rows to append)`);
    }
    // ---------------------------------------------------------------------------
    // Parity-gated append cycle for .bkit/friction.md → .bkit/friction.jsonl
    // ---------------------------------------------------------------------------
    let frictionMdDeleted = false;
    if (!frictionAlreadyDone && frictionRows.length > 0) {
        const frictionContent = fs.readFileSync(frictionMdPath, "utf-8");
        fs.writeFileSync(frictionBakPath, frictionContent, "utf-8");
        lines.push(`[bkit-telemetry] migrate: created ${frictionBakPath}`);
        const migratingPath = frictionJsonlPath + ".migrating";
        const newNdjson = frictionRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        fs.writeFileSync(migratingPath, newNdjson, "utf-8");
        if (!fs.existsSync(frictionBakPath)) {
            fs.unlinkSync(migratingPath);
            return abort("ABORT: friction.md.bak absent after creation — parity gate triggered; ZERO .md deleted", lines);
        }
        const bakEntries = parseFrictionMd(fs.readFileSync(frictionBakPath, "utf-8"));
        if (bakEntries.length !== frictionRows.length) {
            fs.unlinkSync(migratingPath);
            return abort(`ABORT: friction parity mismatch — .bak has ${bakEntries.length} entries, wrote ${frictionRows.length} rows; ZERO .md deleted`, lines);
        }
        lines.push(`[bkit-telemetry] migrate: friction parity confirmed (${frictionRows.length} rows)`);
        fs.appendFileSync(frictionJsonlPath, fs.readFileSync(migratingPath, "utf-8"), "utf-8");
        fs.unlinkSync(migratingPath);
        lines.push(`[bkit-telemetry] migrate: appended ${frictionRows.length} friction rows to ${frictionJsonlPath}`);
        fs.unlinkSync(frictionMdPath);
        frictionMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: deleted ${frictionMdPath}`);
        fs.unlinkSync(frictionBakPath);
        lines.push(`[bkit-telemetry] migrate: removed ${frictionBakPath}`);
    }
    else if (!frictionAlreadyDone && frictionRows.length === 0) {
        fs.unlinkSync(frictionMdPath);
        frictionMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: friction.md had 0 entries — deleted (no rows to append)`);
    }
    // ---------------------------------------------------------------------------
    // Parity-gated append cycle for docs/completed.md → .bkit/issues.jsonl
    // ---------------------------------------------------------------------------
    let completedMdDeleted = false;
    if (!completedAlreadyDone && featureRows.length > 0) {
        const completedContent = fs.readFileSync(completedMdPath, "utf-8");
        fs.writeFileSync(completedBakPath, completedContent, "utf-8");
        lines.push(`[bkit-telemetry] migrate: created ${completedBakPath}`);
        const migratingPath = issuesJsonlPath + ".migrating";
        const newNdjson = featureRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        fs.writeFileSync(migratingPath, newNdjson, "utf-8");
        if (!fs.existsSync(completedBakPath)) {
            fs.unlinkSync(migratingPath);
            return abort("ABORT: completed.md.bak absent after creation — parity gate triggered; ZERO .md deleted", lines);
        }
        const bakEntries = parseCompletedMd(fs.readFileSync(completedBakPath, "utf-8"), []);
        if (bakEntries.length !== featureRows.length) {
            fs.unlinkSync(migratingPath);
            return abort(`ABORT: completed parity mismatch — .bak has ${bakEntries.length} entries, wrote ${featureRows.length} rows; ZERO .md deleted`, lines);
        }
        lines.push(`[bkit-telemetry] migrate: completed parity confirmed (${featureRows.length} rows)`);
        fs.appendFileSync(issuesJsonlPath, fs.readFileSync(migratingPath, "utf-8"), "utf-8");
        fs.unlinkSync(migratingPath);
        lines.push(`[bkit-telemetry] migrate: appended ${featureRows.length} feature rows to ${issuesJsonlPath}`);
        fs.unlinkSync(completedMdPath);
        completedMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: deleted ${completedMdPath}`);
        fs.unlinkSync(completedBakPath);
        lines.push(`[bkit-telemetry] migrate: removed ${completedBakPath}`);
    }
    else if (!completedAlreadyDone && featureRows.length === 0) {
        fs.unlinkSync(completedMdPath);
        completedMdDeleted = true;
        lines.push(`[bkit-telemetry] migrate: completed.md had 0 entries — deleted (no rows to append)`);
    }
    // ---------------------------------------------------------------------------
    // Bootstrap seed: one `feature` row per in-flight FID
    // detected from docs/plans/** + folded status.jsonl, skipping FIDs already in
    // .bkit/issues.jsonl (incl. the SHIPPED rows just ported above). Idempotent —
    // re-running adds no duplicate.
    // ---------------------------------------------------------------------------
    const seedRows = seedInFlightFeatures(cwd, repo, bkitVersion, lines);
    lines.push("[bkit-telemetry] migrate: complete");
    return {
        ran: true,
        dryRun: false,
        knowledgeRowCount: knRows.length,
        decisionRowCount: deRows.length,
        pendingRowCount: pendingRows.length,
        frictionRowCount: frictionRows.length,
        featureRowCount: featureRows.length,
        seedRowCount: seedRows.length,
        knowledgeMdDeleted: knMdDeleted,
        decisionsMdDeleted: deMdDeleted,
        pendingMdDeleted,
        frictionMdDeleted,
        completedMdDeleted,
        lines,
        ok: true,
    };
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function abort(message, lines) {
    const errLine = `[bkit-telemetry] ${message}`;
    lines.push(errLine);
    return {
        ran: false,
        dryRun: false,
        knowledgeRowCount: 0,
        decisionRowCount: 0,
        pendingRowCount: 0,
        frictionRowCount: 0,
        featureRowCount: 0,
        seedRowCount: 0,
        knowledgeMdDeleted: false,
        decisionsMdDeleted: false,
        pendingMdDeleted: false,
        frictionMdDeleted: false,
        completedMdDeleted: false,
        lines,
        ok: false,
        error: message,
    };
}
/**
 * The repo's `owner/repo` slug for the `repo` envelope field.
 *
 * The git remote is the ONLY authoritative source; package.json `name` is an npm
 * package name (`@cbartens/bkit`), not a slug (`cbartens/bkit`). `repo` is part of
 * identity() for every kind.
 *
 * No remote (a repo that has never been pushed) -> "unknown/repo", loudly.
 */
function detectRepo(cwd) {
    const slug = resolveRepoSlug(cwd);
    if (slug)
        return slug;
    console.error(`[bkit-telemetry] no git remote at ${cwd} — stamping repo="unknown/repo"; rows will not join a per-repo slice`);
    return "unknown/repo";
}
