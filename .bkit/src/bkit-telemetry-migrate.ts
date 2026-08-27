// bkit-telemetry-migrate.ts — migrate all legacy .md ledgers to JSONL:
//   docs/knowledge.md  → docs/knowledge.jsonl   (kind:"knowledge")
//   docs/decisions.md  → docs/decisions.jsonl   (kind:"decision")
//   docs/pending.md    → docs/deferrals.jsonl   (kind:"deferral")
//   .bkit/friction.md  → .bkit/friction.jsonl   (kind:"friction")
//   docs/completed.md  → docs/roadmap.jsonl     (kind:"feature", status:"SHIPPED") — #380 fifth pair
//
// The fifth pair also performs the #380 Addendum 3 § S BOOTSTRAP SEED, same run:
// scans docs/plans/{YYYYMM}/{FID}-{design,plan}.md + folded per-FID status.jsonl
// and appends ONE `feature` row per in-flight FID at its detected phase, skipping
// FIDs already present in docs/roadmap.jsonl. Without it the roadmap projection
// has no rows for work already in flight on day one.
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
import { resolveRepoSlug, type TelemetryEvent, type TelemetrySeverity } from "./bkit-telemetry.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MigrateOptions {
  /** Repo root directory (defaults to process.cwd()). */
  cwd?: string;
  /** bkit version to stamp on migrated rows. */
  bkitVersion: string;
  /** Dry-run: log what would happen, write nothing. */
  dryRun?: boolean;
}

export interface MigrateResult {
  /** Whether the migration ran (false = already done, or dry-run). */
  ran: boolean;
  /** Whether this was a dry-run. */
  dryRun: boolean;
  /** Number of knowledge rows ported. */
  knowledgeRowCount: number;
  /** Number of decision rows ported. */
  decisionRowCount: number;
  /** Number of deferral rows ported from pending.md. */
  pendingRowCount: number;
  /** Number of friction rows ported from friction.md. */
  frictionRowCount: number;
  /** Number of `feature` rows (status:"SHIPPED") ported from docs/completed.md (#380). */
  featureRowCount: number;
  /** Number of #380 § S bootstrap-seed rows appended for in-flight FIDs (docs/plans/** scan). */
  seedRowCount: number;
  /** Whether knowledge.md was deleted (false on dry-run or if already migrated). */
  knowledgeMdDeleted: boolean;
  /** Whether decisions.md was deleted (false on dry-run or if already migrated). */
  decisionsMdDeleted: boolean;
  /** Whether docs/pending.md was deleted (false on dry-run or if already migrated). */
  pendingMdDeleted: boolean;
  /** Whether .bkit/friction.md was deleted (false on dry-run or if already migrated). */
  frictionMdDeleted: boolean;
  /** Whether docs/completed.md was deleted (false on dry-run or if already migrated) (#380). */
  completedMdDeleted: boolean;
  /** Human-readable log lines. */
  lines: string[];
  /** Whether migration succeeded (false = parity-gate abort). */
  ok: boolean;
  /** Error description (only when ok=false). */
  error?: string;
}

// ---------------------------------------------------------------------------
// Markdown parsers — parse KN-N and DE-N entries into structured rows
// ---------------------------------------------------------------------------

export interface ParsedEntry {
  /** Original id string, e.g. "KN-8" or "KN-CORE-1" or "DE-3". */
  id: string;
  /** Stable key slug derived from id + normalised title. */
  key: string;
  /** Title text. */
  title: string;
  /** Full body text (all bullet lines). */
  body: string;
  /** Summary line (first sentence of body or title). */
  summary: string;
  /** Detail content (rest of body after summary). */
  detail?: string;
  /** Category field value if found. */
  category?: string;
  /** Status field value if found (decision only). */
  status?: string;
  /** Rationale / Why field value if found (decision only). */
  rationale?: string;
  /** Root cause if found (knowledge only). */
  rootCause?: string;
  /** Fix or rule if found (knowledge only). */
  fix?: string;
  /**
   * References: the JSONL form of the legacy `**Related:**` field, plus this
   * entry's own former id (`KN-14` / `DE-7`) when it had one. Everything the
   * old ledger knew about how this entry connects to the rest of the repo.
   */
  references: string[];
  /**
   * Incident time in unix ms, read from the legacy heading — see parseTitleDate.
   * Undefined when the heading carried no date; the row builder then falls back
   * to the synthetic `baseTs + idx`.
   */
  entryTs?: number;
}

/**
 * Split a legacy `**Related:**` value into individual pointers.
 *
 * The field was free prose ("BAR-138, BAR-130, `docs/…/design.md`, KN-1"), so
 * split on commas and keep each item verbatim minus surrounding backticks —
 * items carry trailing qualifiers ("BAR-142 §A2", "`docs/pending.md` (per-key
 * deferred)") that are meaning, not noise, and are preserved as written.
 */
export function parseRelated(value: string | undefined): string[] {
  if (!value) return [];
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
export function parseLegacyStatus(value: string | undefined): "OPEN" | "CLOSED" {
  const raw = (value ?? "open").toLowerCase().replace(/`/g, "").trim();
  if (/partial|in progress|in-progress|wip/.test(raw)) return "OPEN";
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
export function mapLegacySeverity(value: string | undefined): TelemetrySeverity {
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
export function parseKnowledgeMd(content: string): ParsedEntry[] {
  return parseMdEntries(content, /^## (KN-(?:CORE-)?\d+): (.+)$/);
}

/**
 * Parse a decisions.md corpus into structured entries.
 * Handles `DE-{N}` namespace.
 */
export function parseDecisionsMd(content: string): ParsedEntry[] {
  return parseMdEntries(content, /^## (DE-\d+): (.+)$/);
}

/**
 * Parse docs/pending.md into deferral entries.
 * Skips the managed bkit:start/end header block; each `## Title` below it is one entry.
 */
export function parsePendingMd(content: string): ParsedEntry[] {
  const body = stripManagedHeader(content);
  const entries: ParsedEntry[] = [];
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

    const bodyLines: string[] = [];
    i++;
    while (i < lines.length) {
      const bl = lines[i];
      if (bl === undefined) {
        i++;
        continue;
      }
      if (/^## /.test(bl)) break;
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
    (
      entries[entries.length - 1] as ParsedEntry & {
        _type?: string;
        _workaround?: string;
        _source?: string;
        _severity?: TelemetrySeverity;
        _description?: string;
      }
    )._type = type;
    (entries[entries.length - 1] as ParsedEntry & { _severity?: TelemetrySeverity })._severity =
      severity;
    // Was parsed and then discarded — the row builder emitted the title instead.
    (entries[entries.length - 1] as ParsedEntry & { _description?: string })._description =
      description;
    (entries[entries.length - 1] as ParsedEntry & { _workaround?: string })._workaround =
      workaround;
    (entries[entries.length - 1] as ParsedEntry & { _source?: string })._source = source;
  }

  return entries;
}

/**
 * Parse .bkit/friction.md into friction entries.
 * Skips the managed bkit:start/end header block; each `## Title` below it is one entry.
 */
export function parseFrictionMd(content: string): ParsedEntry[] {
  const body = stripManagedHeader(content);
  const entries: ParsedEntry[] = [];
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

    const bodyLines: string[] = [];
    i++;
    while (i < lines.length) {
      const bl = lines[i];
      if (bl === undefined) {
        i++;
        continue;
      }
      if (/^## /.test(bl)) break;
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
    const entry: ParsedEntry & {
      _scope?: string;
      _remediation?: string;
      _status?: string;
      _source?: string;
      _workflow?: string;
      _step?: string;
      _confidence?: string;
      _lastConfirmed?: string;
      _severity?: TelemetrySeverity;
      _description?: string;
    } = {
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
 * domain term, `other` if none (#380 Directive 2).
 */
export function mapCompletedCategory(value: string | undefined): string {
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
  if (DOMAIN_SET.has(raw)) return raw;
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
 * `**Summary:**` / `**Related:**` (#380 Directive 2). Skips the managed
 * `bkit:start`/`bkit:end` header block. A heading missing Category or Summary
 * is NEVER silently skipped — it still produces a row (loud fallback), and a
 * diagnostic is pushed to `diagnosticLines` when supplied.
 */
export function parseCompletedMd(content: string, diagnosticLines: string[]): ParsedEntry[] {
  const body = stripManagedHeader(content);
  const entries: ParsedEntry[] = [];
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

    const bodyLines: string[] = [];
    i++;
    while (i < lines.length) {
      const bl = lines[i];
      if (bl === undefined) {
        i++;
        continue;
      }
      if (/^## /.test(bl)) break;
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

/** Strip the managed <!-- bkit:start --> … <!-- bkit:end --> header block from .md content. */
function stripManagedHeader(content: string): string {
  const endMarker = "<!-- bkit:end -->";
  const idx = content.indexOf(endMarker);
  if (idx === -1) return content;
  return content.slice(idx + endMarker.length);
}

function parseMdEntries(content: string, headingRe: RegExp): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
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
    const bodyLines: string[] = [];
    i++;
    while (i < lines.length) {
      const bodyLine = lines[i];
      if (bodyLine === undefined) {
        i++;
        continue;
      }
      if (/^## /.test(bodyLine)) break;
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
    const references: string[] = [
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
    (entries[entries.length - 1] as ParsedEntry & { _alternatives?: string })._alternatives =
      alternatives;
  }

  return entries;
}

function extractField(body: string, fieldName: string): string | undefined {
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
 * form, and the leading form is part of the title `stableKey` hashes — stripping
 * it would re-key the row, so a re-migration would mint new entities instead of
 * updating the existing ones.
 */
export function parseTitleDate(titleRaw: string): number | undefined {
  const m =
    /\((\d{4})-(\d{2})-(\d{2})\)\s*$/.exec(titleRaw) ?? /^(\d{4})-(\d{2})-(\d{2})\b/.exec(titleRaw);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const ms = Date.UTC(y, mo - 1, d);
  // Date.UTC rolls invalid days over (Feb 31 -> Mar 3); reject rather than lie.
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) {
    return undefined;
  }
  return ms;
}

function cleanTitle(title: string): string {
  // Strip trailing " (superseded by KN-17, ...)" and "(YYYY-MM-DD)" markers
  return title
    .replace(/\s*\(superseded by[^)]*\)/i, "")
    .replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, "")
    .trim();
}

function slugify(text: string): string {
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
function stableKey(prefix: string, title: string): string {
  const slug = slugify(`${prefix}-${title.slice(0, 60)}`);
  if (title.length <= 60) return slug;
  return `${slug}-${createHash("sha256").update(title).digest("hex").slice(0, 7)}`;
}

// ---------------------------------------------------------------------------
// Row builders
// ---------------------------------------------------------------------------

function buildKnowledgeRow(
  entry: ParsedEntry,
  opts: { repo: string; bkitVersion: string; baseTs: number; idx: number },
): TelemetryEvent {
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
  } as TelemetryEvent;
}

function buildDecisionRow(
  entry: ParsedEntry,
  opts: { repo: string; bkitVersion: string; baseTs: number; idx: number },
): TelemetryEvent {
  const ts = opts.baseTs + opts.idx;
  // Substring, not equality — `superseded by DE-12` / `superseded — …` are real
  // legacy spellings and an exact match silently reports them as ACTIVE.
  const statusValue: "ACTIVE" | "SUPERSEDED" = /supersed/i.test(entry.status ?? "")
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
    alternatives: (entry as ParsedEntry & { _alternatives?: string })._alternatives,
    description: entry.detail,
    status: statusValue,
  } as TelemetryEvent;
}

function buildDeferralRow(
  entry: ParsedEntry,
  opts: { repo: string; bkitVersion: string; baseTs: number; idx: number },
): TelemetryEvent {
  const e = entry as ParsedEntry & {
    _type?: string;
    _workaround?: string;
    _source?: string;
    _severity?: TelemetrySeverity;
    _description?: string;
  };
  const rawType = e._type ?? "issue";
  const type: "issue" | "feature" = rawType === "feature" ? "feature" : "issue";
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
    // Title -> summary, prose -> description. Emitting the title as `description`
    // (and dropping the parsed prose) retained ~40% of the legacy content.
    summary: entry.summary,
    description: e._description ?? entry.summary,
    remediation: e._workaround,
    source: e._source,
    status: parseLegacyStatus(entry.status),
    references: entry.references,
  } as TelemetryEvent;
}

function buildFrictionRow(
  entry: ParsedEntry,
  opts: { repo: string; bkitVersion: string; baseTs: number; idx: number },
): TelemetryEvent {
  const e = entry as ParsedEntry & {
    _scope?: string;
    _remediation?: string;
    _status?: string;
    _source?: string;
    _workflow?: string;
    _step?: string;
    _confidence?: string;
    _lastConfirmed?: string;
    _severity?: TelemetrySeverity;
    _description?: string;
  };
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
  const scope: "bkit-repo" | "consumer" | "universal" =
    rawScope === "consumer" ? "consumer" : rawScope === "universal" ? "universal" : "bkit-repo";
  const confidenceMap: Record<string, number> = { high: 1, medium: 0.5, low: 0.25 };
  const confidence = e._confidence
    ? (confidenceMap[e._confidence.toLowerCase()] ?? undefined)
    : undefined;
  let lastConfirmed: number | undefined;
  if (e._lastConfirmed) {
    const d = Date.parse(e._lastConfirmed);
    if (!isNaN(d)) lastConfirmed = d;
  }
  const status: "OPEN" | "CLOSED" | undefined =
    e._status === undefined ? undefined : parseLegacyStatus(e._status);
  return {
    ts: entry.entryTs ?? opts.baseTs + opts.idx,
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
  } as TelemetryEvent;
}

/**
 * Build a `feature` row (status:"SHIPPED") from a parsed `docs/completed.md`
 * entry (#380 Directive 2). `key` = the entry's stable slug — legacy
 * `completed.md` entries carry no FID, so the migrated key is NOT the FID
 * scheme live workflow closes use; it is still a stable, unique, content-minted
 * key, consistent with every other migrated ledger's key derivation.
 */
function buildFeatureRow(
  entry: ParsedEntry,
  opts: { repo: string; bkitVersion: string; baseTs: number; idx: number },
): TelemetryEvent {
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
  } as TelemetryEvent;
}

// ---------------------------------------------------------------------------
// #380 Addendum 3 § S — bootstrap seed (in-flight FID detection)
// ---------------------------------------------------------------------------

type InFlightStatus = "DESIGNED" | "PLANNED" | "BUILT" | "DEBUGGED";

const STATUS_RANK: Record<InFlightStatus, number> = {
  DESIGNED: 0,
  PLANNED: 1,
  BUILT: 2,
  DEBUGGED: 3,
};

/**
 * Parse one JSONL line, never throwing — returns `null` on a malformed line
 * instead of raising. Callers own the loud diagnostic (never a silent skip):
 * this helper's ONLY job is "did it parse", so the log line always names the
 * caller's file/context rather than a generic message from inside a shared
 * catch. Bounds the parse-MISS class to one non-throwing primitive instead of
 * one log-and-continue `catch` per call site.
 */
function tryParseJsonLine<T>(line: string): T | null {
  let parsed: T | null = null;
  try {
    parsed = JSON.parse(line) as T;
  } catch {
    parsed = null;
  }
  return parsed;
}

/**
 * Read every `key` already present in `docs/roadmap.jsonl` (best-effort,
 * tolerant of malformed lines) — the seed skips any FID already recorded,
 * regardless of its current folded status (Addendum 3 § S: "skipping FIDs
 * already present in the ledger").
 */
function existingRoadmapKeys(roadmapJsonlPath: string): Set<string> {
  const keys = new Set<string>();
  if (!fs.existsSync(roadmapJsonlPath)) return keys;
  const raw = fs.readFileSync(roadmapJsonlPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const obj = tryParseJsonLine<{ kind?: string; key?: string }>(trimmed);
    if (obj === null) {
      // tolerant — malformed lines are ignored, never abort the seed, but
      // ALWAYS logged loudly (never a silent skip)
      console.error(`[bkit-telemetry] seed: malformed docs/roadmap.jsonl line skipped`);
      continue;
    }
    if (obj.kind === "feature" && typeof obj.key === "string") keys.add(obj.key);
  }
  return keys;
}

/**
 * Detect an in-flight FID's phase from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md`
 * presence plus its folded `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (a
 * `workflow-done` row for `build`/`debug` promotes the detected phase). This is
 * the ONE-TIME bootstrap read the on-disk scan is repurposed into (Addendum 3
 * § S) — NOT the per-close sensing source, which is the ledger itself.
 */
function detectInFlightStatus(planDir: string, fid: string, hasPlan: boolean): InFlightStatus {
  let status: InFlightStatus = hasPlan ? "PLANNED" : "DESIGNED";
  const statusJsonlPath = path.join(planDir, "logs", fid, "status.jsonl");
  if (!fs.existsSync(statusJsonlPath)) return status;
  let raw: string;
  try {
    raw = fs.readFileSync(statusJsonlPath, "utf-8");
  } catch (err) {
    // best-effort — a read failure keeps the presence-derived status
    console.error(`[bkit-telemetry] seed: could not read ${statusJsonlPath} — ${String(err)}`);
    return status;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const obj = tryParseJsonLine<{ type?: string; workflow?: string }>(trimmed);
    if (obj === null) {
      // tolerant — malformed status.jsonl lines are ignored, never abort the
      // seed, but ALWAYS logged loudly (never a silent skip)
      console.error(`[bkit-telemetry] seed: malformed ${statusJsonlPath} line skipped`);
      continue;
    }
    if (obj.type !== "workflow-done") continue;
    const promoted: InFlightStatus | undefined =
      obj.workflow === "build" ? "BUILT" : obj.workflow === "debug" ? "DEBUGGED" : undefined;
    if (promoted && STATUS_RANK[promoted] > STATUS_RANK[status]) status = promoted;
  }
  return status;
}

/**
 * Scan `docs/plans/{YYYYMM}/` for `{FID}-design.md` / `{FID}-plan.md` and
 * append one `feature` seed row per in-flight FID not already present in
 * `docs/roadmap.jsonl`, at its detected status. Idempotent — re-running finds
 * every FID already present via `existingRoadmapKeys` and adds nothing.
 * Best-effort: any read error is logged and skipped, never thrown.
 */
export function seedInFlightFeatures(
  cwd: string,
  repo: string,
  bkitVersion: string,
  lines: string[],
): TelemetryEvent[] {
  const plansRoot = path.join(cwd, "docs", "plans");
  const roadmapJsonlPath = path.join(cwd, "docs", "roadmap.jsonl");
  if (!fs.existsSync(plansRoot)) return [];

  const existing = existingRoadmapKeys(roadmapJsonlPath);
  const seedRows: TelemetryEvent[] = [];
  const baseTs = Math.floor(Date.now()) + 50000;
  let idx = 0;

  let monthDirs: string[];
  try {
    monthDirs = fs
      .readdirSync(plansRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{6}$/.test(d.name))
      .map((d) => d.name);
  } catch (err) {
    lines.push(`[bkit-telemetry] seed: could not read ${plansRoot} — ${String(err)}`);
    return [];
  }

  for (const month of monthDirs) {
    const planDir = path.join(plansRoot, month);
    let files: string[];
    try {
      files = fs.readdirSync(planDir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    const fids = new Map<string, { hasDesign: boolean; hasPlan: boolean }>();
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
      if (existing.has(fid)) continue;
      const status = detectInFlightStatus(planDir, fid, presence.hasPlan);
      const row: TelemetryEvent = {
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
      } as TelemetryEvent;
      seedRows.push(row);
      existing.add(fid);
      idx++;
    }
  }

  if (seedRows.length > 0) {
    const ndjson = seedRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
    fs.appendFileSync(roadmapJsonlPath, ndjson, "utf-8");
    lines.push(
      `[bkit-telemetry] seed: appended ${seedRows.length} bootstrap feature row(s) to ${roadmapJsonlPath}`,
    );
  } else {
    lines.push("[bkit-telemetry] seed: no new in-flight FIDs to seed");
  }

  return seedRows;
}

// ---------------------------------------------------------------------------
// Core migration function
// ---------------------------------------------------------------------------

export async function runMigrate(opts: MigrateOptions): Promise<MigrateResult> {
  const cwd = opts.cwd ?? process.cwd();
  const dryRun = opts.dryRun ?? false;
  const bkitVersion = opts.bkitVersion;
  const lines: string[] = [];

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
  // migrated already OR never existed to begin with (e.g. a consumer that
  // only ever authored docs/completed.md and never had docs/knowledge.md /
  // docs/decisions.md). Gating this on jsonl-non-empty (as a prior revision
  // did) wrongly ABORTED the whole run — including the unrelated
  // completed.md -> roadmap.jsonl pair — for any consumer missing one of the
  // legacy pairs; every pair now shares the same absent-.md-means-skip rule
  // pending/friction/completed already used.
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
  const roadmapJsonlPath = path.join(cwd, "docs", "roadmap.jsonl");
  const completedBakPath = completedMdPath + ".bak";
  const completedMdExists = fs.existsSync(completedMdPath);
  const completedAlreadyDone = !completedMdExists;

  // Determine repo slug from package.json or git remote — resolved once, used
  // by every row builder AND the § S bootstrap seed (needed even on the
  // already-migrated fast path below).
  const repo = detectRepo(cwd);

  // A fresh consumer has no legacy `.md` ledgers AND no migrated rows, so neither
  // `knAlreadyDone` nor `deAlreadyDone` holds and the run fell through to
  // `abort("knowledge.md not found")` — printing "migrate failed" for a documented
  // no-op. Nothing to migrate is a clean outcome, not a failure.
  //
  // These two are derived HERE and used ONLY by this check. They deliberately do
  // NOT gate `knAlreadyDone` / `deAlreadyDone` above: gating idempotency on
  // jsonl-non-empty aborted the whole run for any consumer missing one legacy
  // pair, which is why every pair now shares the absent-.md-means-skip rule.
  // "Already migrated" still needs a rows-exist signal, so the fresh-consumer
  // test keeps it.
  const knJsonlNonEmpty =
    fs.existsSync(knJsonlPath) && fs.readFileSync(knJsonlPath, "utf-8").trim().length > 0;
  const deJsonlNonEmpty =
    fs.existsSync(deJsonlPath) && fs.readFileSync(deJsonlPath, "utf-8").trim().length > 0;
  // roadmap.jsonl joins the rows-exist signal because it is a migration TARGET:
  // a consumer whose only legacy ledger was `completed.md` has empty knowledge
  // and decisions ledgers even after a successful migrate, so testing those two
  // alone would report the second run as "nothing to migrate" on a repo that
  // has in fact already migrated.
  const roadmapJsonlNonEmpty =
    fs.existsSync(roadmapJsonlPath) && fs.readFileSync(roadmapJsonlPath, "utf-8").trim().length > 0;
  //
  // `completed.md` counts as a legacy ledger here. Omitting it would send a
  // consumer who only ever authored `docs/completed.md` — the exact case the
  // idempotency comment above calls out — down the nothing-to-migrate return,
  // stranding the one file that has rows to convert into `docs/roadmap.jsonl`.
  const noLegacyLedgers =
    !knMdExists &&
    !deMdExists &&
    !pendingMdExists &&
    !frictionMdExists &&
    !completedMdExists &&
    !knJsonlNonEmpty &&
    !deJsonlNonEmpty &&
    !roadmapJsonlNonEmpty;
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

  if (
    knAlreadyDone &&
    deAlreadyDone &&
    pendingAlreadyDone &&
    frictionAlreadyDone &&
    completedAlreadyDone
  ) {
    lines.push("[bkit-telemetry] migrate: already complete (idempotent no-op)");
    // The § S bootstrap seed still runs on an already-migrated repo — it is
    // idempotent (skips FIDs already present) and is the only path that seeds
    // in-flight FIDs discovered/added to docs/plans/** AFTER the first migrate.
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
  let knEntries: ParsedEntry[] = [];
  let knRows: TelemetryEvent[] = [];

  if (!knAlreadyDone) {
    const knContent = fs.readFileSync(knMdPath, "utf-8");
    knEntries = parseKnowledgeMd(knContent);
    knRows = knEntries.map((entry, idx) =>
      buildKnowledgeRow(entry, { repo, bkitVersion, baseTs, idx }),
    );
    lines.push(`[bkit-telemetry] migrate: parsed ${knEntries.length} knowledge entries`);
  } else {
    lines.push("[bkit-telemetry] migrate: knowledge.md absent — skipping");
  }

  // ---------------------------------------------------------------------------
  // Parse decisions.md (if not already done)
  // ---------------------------------------------------------------------------
  let deEntries: ParsedEntry[] = [];
  let deRows: TelemetryEvent[] = [];

  if (!deAlreadyDone) {
    const deContent = fs.readFileSync(deMdPath, "utf-8");
    deEntries = parseDecisionsMd(deContent);
    deRows = deEntries.map((entry, idx) =>
      buildDecisionRow(entry, {
        repo,
        bkitVersion,
        baseTs: baseTs + 10000,
        idx,
      }),
    );
    lines.push(`[bkit-telemetry] migrate: parsed ${deEntries.length} decision entries`);
  } else {
    lines.push("[bkit-telemetry] migrate: decisions.md absent — skipping");
  }

  // ---------------------------------------------------------------------------
  // Parse docs/pending.md (if not already done)
  // ---------------------------------------------------------------------------
  let pendingEntries: ParsedEntry[] = [];
  let pendingRows: TelemetryEvent[] = [];

  if (!pendingAlreadyDone) {
    const pendingContent = fs.readFileSync(pendingMdPath, "utf-8");
    pendingEntries = parsePendingMd(pendingContent);
    pendingRows = pendingEntries.map((entry, idx) =>
      buildDeferralRow(entry, { repo, bkitVersion, baseTs: baseTs + 20000, idx }),
    );
    lines.push(
      `[bkit-telemetry] migrate: parsed ${pendingEntries.length} pending (deferral) entries`,
    );
  } else {
    lines.push("[bkit-telemetry] migrate: pending.md absent — skipping");
  }

  // ---------------------------------------------------------------------------
  // Parse .bkit/friction.md (if not already done)
  // ---------------------------------------------------------------------------
  let frictionEntries: ParsedEntry[] = [];
  let frictionRows: TelemetryEvent[] = [];

  if (!frictionAlreadyDone) {
    const frictionContent = fs.readFileSync(frictionMdPath, "utf-8");
    frictionEntries = parseFrictionMd(frictionContent);
    frictionRows = frictionEntries.map((entry, idx) =>
      buildFrictionRow(entry, { repo, bkitVersion, baseTs: baseTs + 30000, idx }),
    );
    lines.push(`[bkit-telemetry] migrate: parsed ${frictionEntries.length} friction entries`);
  } else {
    lines.push("[bkit-telemetry] migrate: friction.md absent — skipping");
  }

  // ---------------------------------------------------------------------------
  // Parse docs/completed.md → docs/roadmap.jsonl `feature` rows (#380, fifth pair)
  // ---------------------------------------------------------------------------
  let completedEntries: ParsedEntry[] = [];
  let featureRows: TelemetryEvent[] = [];

  if (!completedAlreadyDone) {
    const completedContent = fs.readFileSync(completedMdPath, "utf-8");
    completedEntries = parseCompletedMd(completedContent, lines);
    featureRows = completedEntries.map((entry, idx) =>
      buildFeatureRow(entry, { repo, bkitVersion, baseTs: baseTs + 40000, idx }),
    );
    lines.push(
      `[bkit-telemetry] migrate: parsed ${completedEntries.length} completed (feature) entries`,
    );
  } else {
    lines.push("[bkit-telemetry] migrate: completed.md absent — skipping");
  }

  // Dry-run: report and exit without writing
  if (dryRun) {
    lines.push(
      `[bkit-telemetry] migrate: dry-run — would write ${knRows.length} knowledge rows to ${knJsonlPath}`,
    );
    lines.push(
      `[bkit-telemetry] migrate: dry-run — would write ${deRows.length} decision rows to ${deJsonlPath}`,
    );
    lines.push(
      `[bkit-telemetry] migrate: dry-run — would append ${pendingRows.length} deferral rows to ${deferralsJsonlPath}`,
    );
    lines.push(
      `[bkit-telemetry] migrate: dry-run — would append ${frictionRows.length} friction rows to ${frictionJsonlPath}`,
    );
    lines.push(
      `[bkit-telemetry] migrate: dry-run — would append ${featureRows.length} feature rows to ${roadmapJsonlPath} (+ bootstrap seed)`,
    );
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
      return abort(
        "ABORT: knowledge.md.bak absent after creation — parity gate triggered; ZERO .md deleted",
        lines,
      );
    }
    const knBakContent = fs.readFileSync(knBakPath, "utf-8");
    const knBakEntries = parseKnowledgeMd(knBakContent);
    if (knBakEntries.length !== knRows.length) {
      // Parity mismatch: remove the .jsonl we just wrote and abort
      fs.unlinkSync(knJsonlPath);
      fs.writeFileSync(knJsonlPath, "", "utf-8"); // restore empty sentinel
      return abort(
        `ABORT: knowledge parity mismatch — .bak has ${knBakEntries.length} entries, .jsonl has ${knRows.length} rows; ZERO .md deleted`,
        lines,
      );
    }
    lines.push(
      `[bkit-telemetry] migrate: knowledge parity confirmed (${knRows.length} rows = ${knBakEntries.length} .bak entries)`,
    );

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
      return abort(
        "ABORT: decisions.md.bak absent after creation — parity gate triggered; ZERO .md deleted",
        lines,
      );
    }
    const deBakContent = fs.readFileSync(deBakPath, "utf-8");
    const deBakEntries = parseDecisionsMd(deBakContent);
    if (deBakEntries.length !== deRows.length) {
      // Parity mismatch: restore empty .jsonl and abort
      fs.unlinkSync(deJsonlPath);
      fs.writeFileSync(deJsonlPath, "", "utf-8");
      return abort(
        `ABORT: decisions parity mismatch — .bak has ${deBakEntries.length} entries, .jsonl has ${deRows.length} rows; ZERO .md deleted`,
        lines,
      );
    }
    lines.push(
      `[bkit-telemetry] migrate: decisions parity confirmed (${deRows.length} rows = ${deBakEntries.length} .bak entries)`,
    );

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
      return abort(
        "ABORT: pending.md.bak absent after creation — parity gate triggered; ZERO .md deleted",
        lines,
      );
    }
    const bakEntries = parsePendingMd(fs.readFileSync(pendingBakPath, "utf-8"));
    if (bakEntries.length !== pendingRows.length) {
      fs.unlinkSync(migratingPath);
      return abort(
        `ABORT: pending parity mismatch — .bak has ${bakEntries.length} entries, wrote ${pendingRows.length} rows; ZERO .md deleted`,
        lines,
      );
    }
    lines.push(`[bkit-telemetry] migrate: pending parity confirmed (${pendingRows.length} rows)`);

    fs.appendFileSync(deferralsJsonlPath, fs.readFileSync(migratingPath, "utf-8"), "utf-8");
    fs.unlinkSync(migratingPath);
    lines.push(
      `[bkit-telemetry] migrate: appended ${pendingRows.length} deferral rows to ${deferralsJsonlPath}`,
    );

    fs.unlinkSync(pendingMdPath);
    pendingMdDeleted = true;
    lines.push(`[bkit-telemetry] migrate: deleted ${pendingMdPath}`);
    fs.unlinkSync(pendingBakPath);
    lines.push(`[bkit-telemetry] migrate: removed ${pendingBakPath}`);
  } else if (!pendingAlreadyDone && pendingRows.length === 0) {
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
      return abort(
        "ABORT: friction.md.bak absent after creation — parity gate triggered; ZERO .md deleted",
        lines,
      );
    }
    const bakEntries = parseFrictionMd(fs.readFileSync(frictionBakPath, "utf-8"));
    if (bakEntries.length !== frictionRows.length) {
      fs.unlinkSync(migratingPath);
      return abort(
        `ABORT: friction parity mismatch — .bak has ${bakEntries.length} entries, wrote ${frictionRows.length} rows; ZERO .md deleted`,
        lines,
      );
    }
    lines.push(`[bkit-telemetry] migrate: friction parity confirmed (${frictionRows.length} rows)`);

    fs.appendFileSync(frictionJsonlPath, fs.readFileSync(migratingPath, "utf-8"), "utf-8");
    fs.unlinkSync(migratingPath);
    lines.push(
      `[bkit-telemetry] migrate: appended ${frictionRows.length} friction rows to ${frictionJsonlPath}`,
    );

    fs.unlinkSync(frictionMdPath);
    frictionMdDeleted = true;
    lines.push(`[bkit-telemetry] migrate: deleted ${frictionMdPath}`);
    fs.unlinkSync(frictionBakPath);
    lines.push(`[bkit-telemetry] migrate: removed ${frictionBakPath}`);
  } else if (!frictionAlreadyDone && frictionRows.length === 0) {
    fs.unlinkSync(frictionMdPath);
    frictionMdDeleted = true;
    lines.push(`[bkit-telemetry] migrate: friction.md had 0 entries — deleted (no rows to append)`);
  }

  // ---------------------------------------------------------------------------
  // Parity-gated append cycle for docs/completed.md → docs/roadmap.jsonl (#380)
  // ---------------------------------------------------------------------------
  let completedMdDeleted = false;

  if (!completedAlreadyDone && featureRows.length > 0) {
    const completedContent = fs.readFileSync(completedMdPath, "utf-8");
    fs.writeFileSync(completedBakPath, completedContent, "utf-8");
    lines.push(`[bkit-telemetry] migrate: created ${completedBakPath}`);

    const migratingPath = roadmapJsonlPath + ".migrating";
    const newNdjson = featureRows.map((r) => JSON.stringify(r)).join("\n") + "\n";
    fs.writeFileSync(migratingPath, newNdjson, "utf-8");

    if (!fs.existsSync(completedBakPath)) {
      fs.unlinkSync(migratingPath);
      return abort(
        "ABORT: completed.md.bak absent after creation — parity gate triggered; ZERO .md deleted",
        lines,
      );
    }
    const bakEntries = parseCompletedMd(fs.readFileSync(completedBakPath, "utf-8"), []);
    if (bakEntries.length !== featureRows.length) {
      fs.unlinkSync(migratingPath);
      return abort(
        `ABORT: completed parity mismatch — .bak has ${bakEntries.length} entries, wrote ${featureRows.length} rows; ZERO .md deleted`,
        lines,
      );
    }
    lines.push(`[bkit-telemetry] migrate: completed parity confirmed (${featureRows.length} rows)`);

    fs.appendFileSync(roadmapJsonlPath, fs.readFileSync(migratingPath, "utf-8"), "utf-8");
    fs.unlinkSync(migratingPath);
    lines.push(
      `[bkit-telemetry] migrate: appended ${featureRows.length} feature rows to ${roadmapJsonlPath}`,
    );

    fs.unlinkSync(completedMdPath);
    completedMdDeleted = true;
    lines.push(`[bkit-telemetry] migrate: deleted ${completedMdPath}`);
    fs.unlinkSync(completedBakPath);
    lines.push(`[bkit-telemetry] migrate: removed ${completedBakPath}`);
  } else if (!completedAlreadyDone && featureRows.length === 0) {
    fs.unlinkSync(completedMdPath);
    completedMdDeleted = true;
    lines.push(
      `[bkit-telemetry] migrate: completed.md had 0 entries — deleted (no rows to append)`,
    );
  }

  // ---------------------------------------------------------------------------
  // #380 Addendum 3 § S — bootstrap seed: one `feature` row per in-flight FID
  // detected from docs/plans/** + folded status.jsonl, skipping FIDs already in
  // docs/roadmap.jsonl (incl. the SHIPPED rows just ported above). Idempotent —
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

function abort(message: string, lines: string[]): MigrateResult {
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
function detectRepo(cwd: string): string {
  const slug = resolveRepoSlug(cwd);
  if (slug) return slug;
  console.error(
    `[bkit-telemetry] no git remote at ${cwd} — stamping repo="unknown/repo"; rows will not join a per-repo slice`,
  );
  return "unknown/repo";
}
