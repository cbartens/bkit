// bkit-telemetry-migrate.ts — migrate all legacy .md ledgers to JSONL:
//   docs/knowledge.md  → docs/knowledge.jsonl   (kind:"knowledge")
//   docs/decisions.md  → docs/decisions.jsonl   (kind:"decision")
//   docs/pending.md    → docs/deferrals.jsonl   (kind:"deferral")
//   .bkit/friction.md  → .bkit/friction.jsonl   (kind:"friction")
//
// Safety contract (DE-39, KN-8 class):
//   1. Creates a transient .md.bak before any write.
//   2. Writes all rows to .jsonl.
//   3. Verifies row-count parity against the .md.bak row count.
//   4. ONLY deletes the .md after parity is confirmed.
//   5. A parity mismatch OR absent .md.bak ABORTS with ZERO .md deleted.
//   6. Re-run is idempotent (no-op if .md already absent and .jsonl already populated).
//
// NEVER called from bkit upgrade — only via explicit `bkit telemetry migrate` invocation.
// This is enforced mechanically by bkit-telemetry-migrate.integration.test.ts (WS5-T2b).
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolveRepoSlug } from "./bkit-telemetry.js";
/**
 * Split a legacy `**Related:**` value into individual pointers.
 *
 * The field was free prose ("BAR-138, BAR-130, `docs/…/design.md`, KN-1"), so
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
 * The legacy field was free prose, not a token: `RESOLVED — closed by the bkit
 * 3.3.0 upgrade`, `resolved (#453, 2026-06-03) — migration 20260603150000`,
 * `partially-resolved — Phase 1 landed, Phase 2 open`. An exact-equality check
 * (`raw === "resolved"`) silently defaults every one of those to OPEN, marking
 * closed work as outstanding. Substring-match instead — the same rule the
 * friction builder already used, now shared so the two cannot drift again.
 *
 * `partially-resolved` deliberately reads as OPEN: work remains. It is matched
 * BEFORE the resolve check because it contains "resolv" as a substring.
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
 * The retired scale was `critical | normal | low`; `normal` is the middle of a
 * three-point scale, so it lands on MEDIUM rather than HIGH. Legacy entries
 * with no Severity (the whole of `friction.md`, which never had the field)
 * default to MEDIUM — the neutral point. This is an explicit unknown->neutral
 * mapping, NOT a claim about the row; re-triage on next touch.
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
        // Both were silently dropped before #234's severity/references restoration.
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
        // Was parsed and then discarded — the row builder emitted the title instead.
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
            // Was parsed and then discarded — the row builder emitted the title instead.
            _description: description,
            _source: extractField(entryBody, "Source"),
            // WHERE the friction happened. For a live friction row the orchestrator
            // writes exactly this into the envelope workflow/step, so preserving them
            // keeps migrated rows on the same axis as live ones — see buildFrictionRow.
            _workflow: extractField(entryBody, "Workflow"),
            _step: extractField(entryBody, "Step"),
            references: parseRelated(extractField(entryBody, "Related")),
            // The legacy friction.md format had no Severity field at all, so this is
            // always the unknown->neutral default rather than a migrated value.
            _severity: mapLegacySeverity(extractField(entryBody, "Severity")),
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
/** Strip the managed <!-- bkit:start --> … <!-- bkit:end --> header block from .md content. */
function stripManagedHeader(content) {
    const endMarker = "<!-- bkit:end -->";
    const idx = content.indexOf(endMarker);
    if (idx === -1)
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
        // `Discarded:` -> DecisionPayload.alternatives. The payload field has existed
        // since #234 but nothing ever populated it: 26 of bkit's 34 decision rows had
        // their alternatives left as prose inside `description`.
        const alternatives = extractField(body, "Discarded");
        // `Superseded by: DE-12` is a POINTER to another entry, so it belongs in
        // references (`status: SUPERSEDED` records the state; this records by what).
        const supersededBy = extractField(body, "Superseded by");
        // Build summary from title (clean trailing date/supersession markers)
        const summary = cleanTitle(title);
        // Build detail from body (preserve for agent readability)
        const detail = body.length > 0 ? body : undefined;
        // Build key: id-normalised-title slug.
        // Safe to embed the legacy id HERE (unlike an agent minting a fresh DE-{N}):
        // migration is a one-shot deterministic read of a static .md, so two runs
        // cannot race to claim the same number.
        const keySlug = stableKey(id, summary);
        // References: the entry's own legacy id FIRST, then everything its
        // `**Related:**` field pointed at. Both were dropped by the original
        // migration — the id survived in aliases[], the Related: graph did not.
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
 * Key that survives title truncation. `slugify(prefix-title.slice(0, 60))` is not
 * unique: two entries whose titles diverge only after char 60 collapse to one key,
 * and `fold()` keeps only the last — so the store silently holds one entity where
 * the log had two. Recurrence entries are the most exposed, because a recurrence is
 * titled like the original it recurs from; the real case was the two "Plan Step 11:
 * close-workflow STRAY guard rejects protocol-mandated ..." entries, which differ
 * only at char 61+. The digest is appended ONLY when truncation actually discards
 * characters, so short titles keep a clean, readable key.
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
    // Substring, not equality — `superseded by DE-12` / `superseded — …` are real
    // legacy spellings and an exact match silently reports them as ACTIVE.
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
        ts: opts.baseTs + opts.idx,
        kind: "deferral",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        type,
        category: entry.category ?? "other",
        severity: e._severity ?? "MEDIUM",
        // Title -> summary, prose -> description. Emitting the title as `description`
        // (and dropping the parsed prose) retained ~40% of the legacy content.
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
        ts: opts.baseTs + opts.idx,
        kind: "friction",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        // WHERE the friction happened, not who transported the row. A live friction
        // row's envelope workflow/step ARE the workflow/step the friction occurred in
        // (the orchestrator writing it is the workflow it happened in), so stamping
        // "migrate" here put every migrated row on a different axis from every live
        // one and blinded exactly the workflow/step dimensions the harvest slices by.
        // Falls back to the migrate provenance only when the legacy row had neither.
        workflow: e._workflow ?? "migrate",
        step: e._step ?? "bkit-telemetry-migrate",
        key: entry.key,
        category,
        scope,
        severity: e._severity ?? "MEDIUM",
        // Title -> summary, prose -> description (was emitting the title as description).
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
    // Idempotency: .md absent = already migrated for that pair.
    // pending/friction: absent .md = skip (never existed or already migrated).
    const knMdExists = fs.existsSync(knMdPath);
    const deMdExists = fs.existsSync(deMdPath);
    const pendingMdExists = fs.existsSync(pendingMdPath);
    const frictionMdExists = fs.existsSync(frictionMdPath);
    const knJsonlNonEmpty = fs.existsSync(knJsonlPath) && fs.readFileSync(knJsonlPath, "utf-8").trim().length > 0;
    const deJsonlNonEmpty = fs.existsSync(deJsonlPath) && fs.readFileSync(deJsonlPath, "utf-8").trim().length > 0;
    const knAlreadyDone = !knMdExists && knJsonlNonEmpty;
    const deAlreadyDone = !deMdExists && deJsonlNonEmpty;
    // pending/friction: .md absent = already done (either never existed or already migrated)
    const pendingAlreadyDone = !pendingMdExists;
    const frictionAlreadyDone = !frictionMdExists;
    if (knAlreadyDone && deAlreadyDone && pendingAlreadyDone && frictionAlreadyDone) {
        lines.push("[bkit-telemetry] migrate: already complete (idempotent no-op)");
        return {
            ran: false,
            dryRun,
            knowledgeRowCount: 0,
            decisionRowCount: 0,
            pendingRowCount: 0,
            frictionRowCount: 0,
            knowledgeMdDeleted: false,
            decisionsMdDeleted: false,
            pendingMdDeleted: false,
            frictionMdDeleted: false,
            lines,
            ok: true,
        };
    }
    // Determine repo slug from package.json or git remote
    const repo = detectRepo(cwd);
    // Use a stable base timestamp for this migration run
    const baseTs = Math.floor(Date.now());
    // ---------------------------------------------------------------------------
    // Parse knowledge.md (if not already done)
    // ---------------------------------------------------------------------------
    let knEntries = [];
    let knRows = [];
    if (!knAlreadyDone) {
        if (!knMdExists) {
            return abort(`knowledge.md not found at ${knMdPath}`, lines);
        }
        const knContent = fs.readFileSync(knMdPath, "utf-8");
        knEntries = parseKnowledgeMd(knContent);
        knRows = knEntries.map((entry, idx) => buildKnowledgeRow(entry, { repo, bkitVersion, baseTs, idx }));
        lines.push(`[bkit-telemetry] migrate: parsed ${knEntries.length} knowledge entries`);
    }
    else {
        lines.push("[bkit-telemetry] migrate: knowledge already migrated — skipping");
    }
    // ---------------------------------------------------------------------------
    // Parse decisions.md (if not already done)
    // ---------------------------------------------------------------------------
    let deEntries = [];
    let deRows = [];
    if (!deAlreadyDone) {
        if (!deMdExists) {
            return abort(`decisions.md not found at ${deMdPath}`, lines);
        }
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
        lines.push("[bkit-telemetry] migrate: decisions already migrated — skipping");
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
    // Dry-run: report and exit without writing
    if (dryRun) {
        lines.push(`[bkit-telemetry] migrate: dry-run — would write ${knRows.length} knowledge rows to ${knJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would write ${deRows.length} decision rows to ${deJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would append ${pendingRows.length} deferral rows to ${deferralsJsonlPath}`);
        lines.push(`[bkit-telemetry] migrate: dry-run — would append ${frictionRows.length} friction rows to ${frictionJsonlPath}`);
        lines.push("[bkit-telemetry] migrate: dry-run — no files written");
        return {
            ran: false,
            dryRun: true,
            knowledgeRowCount: knRows.length,
            decisionRowCount: deRows.length,
            pendingRowCount: pendingRows.length,
            frictionRowCount: frictionRows.length,
            knowledgeMdDeleted: false,
            decisionsMdDeleted: false,
            pendingMdDeleted: false,
            frictionMdDeleted: false,
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
    lines.push("[bkit-telemetry] migrate: complete");
    return {
        ran: true,
        dryRun: false,
        knowledgeRowCount: knRows.length,
        decisionRowCount: deRows.length,
        pendingRowCount: pendingRows.length,
        frictionRowCount: frictionRows.length,
        knowledgeMdDeleted: knMdDeleted,
        decisionsMdDeleted: deMdDeleted,
        pendingMdDeleted,
        frictionMdDeleted,
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
        knowledgeMdDeleted: false,
        decisionsMdDeleted: false,
        pendingMdDeleted: false,
        frictionMdDeleted: false,
        lines,
        ok: false,
        error: message,
    };
}
/**
 * The repo's `owner/repo` slug for the `repo` envelope field.
 *
 * The git remote is the ONLY authoritative source. package.json `name` was used
 * here previously and is NOT a slug — it is an npm package name, so bkit's own
 * ledgers were stamped `@cbartens/bkit` against a true slug of `cbartens/bkit`.
 * One character, but `repo` is part of identity() for every kind, so the two
 * spellings fork every entity between them.
 *
 * No remote (a repo that has never been pushed) -> "unknown/repo", loudly. A
 * wrong-but-plausible slug is worse than an obviously-absent one: it forks
 * silently, whereas "unknown/repo" shows up the moment anyone reads the ledger.
 */
function detectRepo(cwd) {
    const slug = resolveRepoSlug(cwd);
    if (slug)
        return slug;
    console.error(`[bkit-telemetry] no git remote at ${cwd} — stamping repo="unknown/repo"; rows will not join a per-repo slice`);
    return "unknown/repo";
}
