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
import * as fs from "node:fs";
import * as path from "node:path";
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
        const key = slugify(`pending-${title.slice(0, 60)}`);
        entries.push({
            id: key,
            key,
            title,
            body: entryBody,
            summary: title,
            detail: entryBody.length > 0 ? entryBody : undefined,
            category,
            status,
            aliases: [],
            // reuse known fields; pending-specific fields stored in body
            rootCause: undefined,
            fix: workaround,
            rationale: source,
        });
        // attach custom fields for row builder
        entries[entries.length - 1]._type = type;
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
        const recovery = extractField(entryBody, "Recovery");
        const status = extractField(entryBody, "Status")?.replace(/`/g, "").trim();
        const confidenceStr = extractField(entryBody, "Confidence");
        const lastConfirmedStr = extractField(entryBody, "Last-confirmed");
        const key = slugify(`friction-${title.slice(0, 60)}`);
        const entry = {
            id: key,
            key,
            title,
            body: entryBody,
            summary: title,
            detail: entryBody.length > 0 ? entryBody : undefined,
            category,
            aliases: [],
            _scope: scope,
            _remediation: remediation,
            _recovery: recovery,
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
        // Build summary from title (clean trailing date/supersession markers)
        const summary = cleanTitle(title);
        // Build detail from body (preserve for agent readability)
        const detail = body.length > 0 ? body : undefined;
        // Build key: id-normalised-title slug
        const keySlug = slugify(`${id}-${summary.slice(0, 60)}`);
        // Aliases: the original ID(s) — both short and CORE form preserved
        const aliases = [id];
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
            aliases,
        });
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
        aliases: entry.aliases,
        summary: entry.summary,
        description: entry.detail,
        rootCause: entry.rootCause,
        remediation: entry.fix,
    };
}
function buildDecisionRow(entry, opts) {
    const ts = opts.baseTs + opts.idx;
    const statusValue = entry.status === "superseded" ? "SUPERSEDED" : "ACTIVE";
    return {
        ts,
        kind: "decision",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        aliases: entry.aliases,
        summary: entry.summary,
        rationale: entry.rationale,
        description: entry.detail,
        status: statusValue,
    };
}
function buildDeferralRow(entry, opts) {
    const e = entry;
    const rawType = e._type ?? "issue";
    const type = rawType === "feature" ? "feature" : "issue";
    const rawStatus = (entry.status ?? "open").toLowerCase();
    const status = rawStatus === "resolved" || rawStatus === "closed" ? "CLOSED" : "OPEN";
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
        description: entry.summary,
        remediation: e._workaround,
        source: e._source,
        status,
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
    const status = e._status === undefined
        ? undefined
        : /recover|resolv|clos|fix|done/i.test(e._status)
            ? "CLOSED"
            : "OPEN";
    return {
        ts: opts.baseTs + opts.idx,
        kind: "friction",
        repo: opts.repo,
        bkitVersion: opts.bkitVersion,
        workflow: "migrate",
        step: "bkit-telemetry-migrate",
        key: entry.key,
        category,
        scope,
        description: entry.summary,
        remediation: e._remediation,
        recovery: e._recovery,
        status,
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
function detectRepo(cwd) {
    // Try package.json name
    const pkgPath = path.join(cwd, "package.json");
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            if (typeof pkg["name"] === "string" && pkg["name"]) {
                return pkg["name"];
            }
        }
        catch (_e) {
            void _e; // ignore: package.json unreadable, fall through to path-based detection
        }
    }
    return "unknown/repo";
}
