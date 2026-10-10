// bkit-telemetry-normalise.ts — one-shot, idempotent normalisation of the
// key-bearing ledgers (docs/decisions.jsonl, docs/knowledge.jsonl) off the
// legacy sequential-alias scheme (.bkit/jsonl.md § Key & References).
//
// For every row it:
//   1. drops the legacy `aliases[]` field, demoting its values into
//      `references[]` (the current schema — sequential DE-{N} ids are
//      un-mintable under concurrency);
//   2. keeps `ts` as the identity — never touched;
//   3. re-keys ONLY rows whose legacy number COLLIDES (one DE-<n>/KN-<n> shared
//      by >1 key): strips the `de-<n>-` / `kn-<n>-` prefix so the misleading
//      shared number leaves the slug, preserving the legacy id as a `references[]`
//      pointer. Unique numbered keys are left alone — they resolve fine and
//      re-keying them would churn valid citations.
//
// Safety (mirrors bkit-telemetry-migrate's DE-39 / KN-8 contract): a transient
// .bak is written first, the rewrite goes to a .normalising temp, row-count
// parity is verified, and the original is replaced ONLY on parity — a mismatch
// ABORTS with the original untouched. Idempotent: a normalised ledger carries no
// `aliases[]` and no colliding numbered keys, so a re-run mutates no row and
// rewrites nothing. Read-heavy but never called from `bkit upgrade` — explicit
// `bkit telemetry normalise` only.
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { LEDGER_FILES, MINTED_KEY_PREFIX_RE, MINTED_KEY_RE, ownLegacyId, readLedgerRows, scanRows, } from "./bkit-telemetry-lint.js";
/** Short deterministic disambiguator for a re-key collision — same input, same suffix. */
function shortHash(text) {
    return createHash("sha256").update(text).digest("hex").slice(0, 7);
}
/** Append `items` to `refs` preserving order, skipping values already present. */
function mergeReferences(refs, items) {
    const out = Array.isArray(refs)
        ? refs.filter((v) => typeof v === "string")
        : [];
    const seen = new Set(out);
    for (const it of items) {
        if (!seen.has(it)) {
            out.push(it);
            seen.add(it);
        }
    }
    return out;
}
/**
 * Compute the normalised content for one ledger file. Pure (string in -> string
 * out); the write/parity cycle lives in the caller.
 *
 * `collisionKeyed` holds `${repo} ${ID}` for every legacy id that collides —
 * only rows whose own id is in that set get re-keyed.
 */
export function normaliseLedgerContent(raw, collisionKeyed) {
    const physicalLines = raw.split("\n");
    const parsed = [];
    for (const line of physicalLines) {
        if (line.trim() === "")
            continue;
        try {
            parsed.push({ line, row: JSON.parse(line) });
        }
        catch {
            parsed.push({ line, row: null }); // preserve malformed lines verbatim
        }
    }
    // Pass 1 — decide the new key for each ORIGINAL key that must be re-keyed.
    // Same-key recurrence rows must all map to the SAME new key, so the map is
    // keyed by original key string. Collision-safe: a stripped key that would
    // duplicate a DIFFERENT surviving key gets a deterministic hash suffix.
    const untouchedKeys = new Set();
    const toRekey = new Map(); // originalKey -> a representative row
    for (const { row } of parsed) {
        if (!row || typeof row.key !== "string")
            continue;
        const lid = ownLegacyId(row);
        const collides = lid !== null && collisionKeyed.has(`${row.repo ?? ""} ${lid}`);
        if (collides && MINTED_KEY_RE.test(row.key)) {
            if (!toRekey.has(row.key))
                toRekey.set(row.key, row);
        }
        else {
            untouchedKeys.add(row.key);
        }
    }
    const rekeyMap = new Map();
    const claimed = new Set(untouchedKeys);
    for (const originalKey of [...toRekey.keys()].sort()) {
        let candidate = originalKey.replace(MINTED_KEY_PREFIX_RE, "").replace(/^-+/, "");
        if (candidate === "")
            candidate = `entry-${shortHash(originalKey)}`;
        if (claimed.has(candidate) && candidate !== originalKey) {
            candidate = `${candidate}-${shortHash(originalKey)}`;
        }
        rekeyMap.set(originalKey, candidate);
        claimed.add(candidate);
    }
    // Pass 2 — emit. Mutate only rows that drop aliases or re-key; keep the rest verbatim.
    const out = [];
    let aliasesDropped = 0;
    let rekeyed = 0;
    for (const { line, row } of parsed) {
        if (!row || typeof row.key !== "string") {
            out.push(line);
            continue;
        }
        const hasAliases = Array.isArray(row.aliases);
        const newKey = rekeyMap.get(row.key);
        if (!hasAliases && newKey === undefined) {
            out.push(line); // untouched — preserve original text
            continue;
        }
        const lid = ownLegacyId(row); // capture BEFORE dropping aliases
        const demote = [];
        if (hasAliases) {
            for (const v of row.aliases)
                if (typeof v === "string")
                    demote.push(v);
            delete row.aliases;
            aliasesDropped++;
        }
        if (newKey !== undefined && lid)
            demote.push(lid);
        if (demote.length > 0)
            row.references = mergeReferences(row.references, demote);
        if (newKey !== undefined) {
            row.key = newKey;
            rekeyed++;
        }
        out.push(JSON.stringify(row));
    }
    const changed = aliasesDropped > 0 || rekeyed > 0;
    return {
        outContent: out.join("\n") + "\n",
        rowsTotal: parsed.length,
        aliasesDropped,
        rekeyed,
        changed,
    };
}
// ---------------------------------------------------------------------------
// Core normalisation with the parity-gated write cycle
// ---------------------------------------------------------------------------
export async function runNormalise(opts = {}) {
    const cwd = opts.cwd ?? process.cwd();
    const dryRun = opts.dryRun ?? false;
    const lines = [];
    // One combined scan so collisions are computed identically to `bkit telemetry
    // validate`; the resulting id set is then applied per-file during rewrite.
    const allRows = [];
    for (const rel of LEDGER_FILES) {
        allRows.push(...readLedgerRows(path.join(cwd, rel)));
    }
    const { collisions } = scanRows(allRows);
    const collisionKeyed = new Set(collisions.map((c) => `${c.repo} ${c.id}`));
    const ledgers = [];
    let anyWritten = false;
    for (const rel of LEDGER_FILES) {
        const filePath = path.join(cwd, rel);
        if (!fs.existsSync(filePath)) {
            lines.push(`[bkit-telemetry] normalise: ${rel} absent — skipping`);
            continue;
        }
        const raw = fs.readFileSync(filePath, "utf-8");
        const outcome = normaliseLedgerContent(raw, collisionKeyed);
        const stat = {
            file: rel,
            rowsTotal: outcome.rowsTotal,
            aliasesDropped: outcome.aliasesDropped,
            rekeyed: outcome.rekeyed,
            changed: outcome.changed,
        };
        ledgers.push(stat);
        if (!outcome.changed) {
            lines.push(`[bkit-telemetry] normalise: ${rel} already normalised — no change`);
            continue;
        }
        // Parity: every input row must survive as exactly one output row.
        const outRowCount = outcome.outContent.split("\n").filter((l) => l.trim() !== "").length;
        if (outRowCount !== outcome.rowsTotal) {
            return abort(`${rel} parity mismatch — ${outcome.rowsTotal} rows in, ${outRowCount} rows out; original untouched`, lines, dryRun, ledgers);
        }
        if (dryRun) {
            lines.push(`[bkit-telemetry] normalise: dry-run — ${rel}: would drop ${outcome.aliasesDropped} aliases[] field(s), re-key ${outcome.rekeyed} colliding row(s)`);
            continue;
        }
        // .bak safety, then atomic replace via a .normalising temp.
        const bakPath = filePath + ".bak";
        const tmpPath = filePath + ".normalising";
        fs.writeFileSync(bakPath, raw, "utf-8");
        fs.writeFileSync(tmpPath, outcome.outContent, "utf-8");
        if (!fs.existsSync(bakPath)) {
            if (fs.existsSync(tmpPath))
                fs.unlinkSync(tmpPath);
            return abort(`${rel}.bak absent after creation — parity gate; original untouched`, lines, dryRun, ledgers);
        }
        fs.renameSync(tmpPath, filePath); // atomic within the same directory
        fs.unlinkSync(bakPath);
        anyWritten = true;
        lines.push(`[bkit-telemetry] normalise: ${rel}: dropped ${outcome.aliasesDropped} aliases[] field(s), re-keyed ${outcome.rekeyed} colliding row(s)`);
    }
    if (dryRun)
        lines.push("[bkit-telemetry] normalise: dry-run — no files written");
    else if (!anyWritten)
        lines.push("[bkit-telemetry] normalise: nothing to do (idempotent no-op)");
    else
        lines.push("[bkit-telemetry] normalise: complete");
    return { ran: anyWritten, dryRun, ledgers, lines, ok: true };
}
function abort(message, lines, dryRun, ledgers) {
    lines.push(`[bkit-telemetry] ABORT: ${message}`);
    return { ran: false, dryRun, ledgers, lines, ok: false, error: message };
}
