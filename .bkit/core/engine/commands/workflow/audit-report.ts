// The audit report's Findings table and the arithmetic built on it — severity totals, the
// ledger key of each finding and its `failure` ledger payload. A leaf module: it imports
// no sibling command, so `ledgers` and `issues` both read it.

import * as fs from "node:fs";
import * as path from "node:path";

import { queryLedger } from "../../ledgers/telemetry.js";
import { CommandError, EXIT } from "../lib.js";

// ---------------------------------------------------------------------------
// Audit report — the findings the report's table holds. The agent writes the table; the
// engine derives the severity totals and the ledger payloads from it, so none can disagree.
// ---------------------------------------------------------------------------

export const AUDIT_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];

export interface AuditFinding {
  severity: AuditSeverity;
  title: string;
  /** `path:line`. */
  location: string;
  /** The report's own ID for the finding (`<slug>-<n>`), when read from a report. */
  id?: string;
  /** The key of an existing ledger entry the agent judged to be this same item. */
  priorKey?: string;
}

/** The findings of an audit report, with the slug they belong to. */
export interface AuditReport {
  slug: string;
  findings: AuditFinding[];
}

/** Findings per severity. */
export function auditTotals(findings: readonly AuditFinding[]): Record<AuditSeverity, number> {
  return Object.fromEntries(
    AUDIT_SEVERITIES.map((s) => [s, findings.filter((f) => f.severity === s).length]),
  ) as Record<AuditSeverity, number>;
}

/** `CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2`, the Findings header value. */
export const auditFindingsLine = (totals: Record<AuditSeverity, number>): string =>
  AUDIT_SEVERITIES.map((s) => `${s} ${totals[s]}`).join(" \u00b7 ");

const kebab = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

export interface AuditEntry extends AuditFinding {
  /** Report-local, stable under reordering: `<slug>-<n>` over the severity/location/title order. */
  id: string;
  /** The ledger key: the judged prior key, else derived from the slug and title and unique in the ledger. */
  key: string;
}

/** A ledger row already holding a key: what finding it records, so a re-render can recognise it. */
export interface HeldRow {
  summary: string;
  locations: readonly string[];
}

/**
 * The findings in their one deterministic order, each with its ID and ledger key. A held key whose
 * row has the same summary and `file:line` is the same finding and is reused; a held key of a
 * different finding is a collision and gets a suffix.
 */
export function auditEntries(
  result: AuditReport,
  held: ReadonlyMap<string, HeldRow> = new Map(),
): AuditEntry[] {
  const rank = (s: AuditSeverity) => AUDIT_SEVERITIES.indexOf(s);
  const ordered = [...result.findings].sort(
    (a, b) =>
      rank(a.severity) - rank(b.severity) ||
      a.location.localeCompare(b.location) ||
      a.title.localeCompare(b.title) ||
      (a.priorKey ?? "").localeCompare(b.priorKey ?? ""),
  );
  const used = new Set(ordered.flatMap((f) => (f.priorKey === undefined ? [] : [f.priorKey])));
  return ordered.map((f, i) => {
    let key = f.priorKey;
    if (key === undefined) {
      const base = `audit-${result.slug}-${kebab(f.title) || "finding"}`;
      key = base;
      const same = (k: string) => {
        const row = held.get(k);
        return row !== undefined && row.summary === f.title && row.locations.includes(f.location);
      };
      for (let n = 2; used.has(key) || (held.has(key) && !same(key)); n += 1) key = `${base}-${n}`;
      used.add(key);
    }
    return { ...f, id: f.id ?? `${result.slug}-${i + 1}`, key };
  });
}

/** One `failure` ledger payload per finding, ready for `bkit ledgers append`. */
export function auditLedgerRows(
  result: AuditReport,
  held: ReadonlyMap<string, HeldRow> = new Map(),
): Array<Record<string, unknown>> {
  return auditEntries(result, held).map((e) => ({
    kind: "failure",
    key: e.key,
    summary: e.title,
    severity: e.severity,
    description: `${e.title} (${e.location}); audit ${result.slug} finding ${e.id}`,
    status: "OPEN",
  }));
}

/** The comment's header fields: the Findings line the report's table totals to. */
export function auditHeaderFields(report: AuditReport): Array<[string, string]> {
  return [["Findings", auditFindingsLine(auditTotals(report.findings))]];
}

const FINDINGS_HEADS = ["ID", "Severity", "Title", "Location", "Key"];

/** A cell without the code span an agent may wrap it in. */
const bare = (cell: string | undefined): string => (cell ?? "").trim().replace(/^`([^`]*)`$/, "$1");

/** The pipe tables of `text`, each as its own lines. */
function tablesIn(text: string): string[] {
  const tables: string[] = [];
  let run: string[] = [];
  for (const line of [...text.split("\n"), ""]) {
    if (line.startsWith("|")) run.push(line);
    else {
      if (run.length > 0) tables.push(run.join("\n"));
      run = [];
    }
  }
  return tables;
}

/** A table row's cells: the outer pipes dropped, `\\|` kept inside its cell. */
function cellsOf(line: string): string[] {
  const inner = line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "");
  return inner.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
}

/**
 * An agent-written pipe table read leniently: backslashes stay in a cell, an alignment
 * separator (`:---`) is skipped, and a lone `None` / `N/A` row is no row. A row with the wrong
 * cell count is refused by its first cell; the result is that refusal's text then.
 */
function readTable(text: string): { head: string[]; rows: Record<string, string>[] } | string {
  const lines = text.split("\n");
  const head = cellsOf(lines[0] ?? "");
  const rows: Record<string, string>[] = [];
  for (const line of lines.slice(1)) {
    const cells = cellsOf(line);
    if (cells.every((c) => /^:?-{1,}:?$/.test(c))) continue;
    if (cells.length === 1 && /^(None|N\/A)\.?$/.test(bare(cells[0]))) continue;
    if (cells.length !== head.length)
      return `row "${cells[0] ?? ""}" has ${cells.length} cells where the header has ${head.length}; escape a pipe in a cell as \\|`;
    rows.push(Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""])));
  }
  return { head, rows };
}

/**
 * The findings the report's `## Findings` table holds. Each row needs an `ID`, a known `Severity`,
 * a `Title`, a `Location` and a `Key` that is `new` or an `audit-<slug>-` key; a refusal names the
 * row's `ID`. A single `None` row is no finding.
 */
export function parseAuditReport(text: string, slug: string): AuditReport {
  const bad = (why: string) => new CommandError(EXIT.USAGE, `audit report: ${why}`);
  const from = text.search(/^## Findings\s*$/m);
  if (from < 0) throw bad("no `## Findings` section");
  const rest = text.slice(from).replace(/^## Findings\s*$/m, "");
  const next = rest.search(/^## /m);
  const section = next < 0 ? rest : rest.slice(0, next);
  const tables = tablesIn(section).map((t) => readTable(t));
  const broken = tables.find((t) => typeof t === "string");
  if (typeof broken === "string") throw bad(broken);
  const table = tables.find((t) => typeof t !== "string" && t.head.includes("ID")) as
    { head: string[]; rows: Record<string, string>[] } | undefined;
  if (table === undefined) throw bad("the Findings section has no table with an `ID` column");
  for (const name of FINDINGS_HEADS)
    if (!table.head.includes(name)) throw bad(`the Findings table has no \`${name}\` column`);
  const findings: AuditFinding[] = [];
  const ids = new Set<string>();
  const priors = new Set<string>();
  for (const row of table.rows) {
    const id = bare(row["ID"]);
    if (id === "" || id === "PENDING") throw bad("a Findings row has an empty ID");
    if (id === "None" || id === "N/A") continue;
    if (ids.has(id)) throw bad(`${id} repeats an ID`);
    ids.add(id);
    const severity = bare(row["Severity"]);
    if (severity === "") throw bad(`${id} has an empty Severity`);
    if (!AUDIT_SEVERITIES.includes(severity as AuditSeverity))
      throw bad(`${id} has an unknown Severity "${severity}"; use ${AUDIT_SEVERITIES.join("|")}`);
    const title = (row["Title"] ?? "").trim();
    if (title === "") throw bad(`${id} has an empty Title`);
    const location = bare(row["Location"]);
    if (!/^[^\s:,]+:\d+$/.test(location))
      throw bad(
        `${id} has a Location "${location}" that is not \`path:line\`; write one \`path:line\``,
      );
    const key = bare(row["Key"]);
    if (key === "") throw bad(`${id} has an empty Key; write \`new\` or the prior key`);
    if (key !== "new" && !key.startsWith(`audit-${slug}-`))
      throw bad(`${id} has an unknown key "${key}"; use \`new\` or an \`audit-${slug}-\` key`);
    if (key !== "new") {
      if (priors.has(key)) throw bad(`${id} repeats key ${key}`);
      priors.add(key);
    }
    findings.push({
      id,
      severity: severity as AuditSeverity,
      title,
      location,
      ...(key === "new" ? {} : { priorKey: key }),
    });
  }
  return { slug, findings };
}

/**
 * Every key the failures ledger (the working directory's `docs/failures.jsonl`, the file
 * `ledgers append` and `ledgers query` use) already holds, with the finding each row records,
 * so a derived audit key never lands on a different finding's row.
 */
export function ledgerKeys(cwd: string): Map<string, HeldRow> {
  const file = path.resolve(cwd, "docs", "failures.jsonl");
  const held = new Map<string, HeldRow>();
  if (!fs.existsSync(file)) return held;
  for (const row of queryLedger(fs.readFileSync(file, "utf8")).rows) {
    const r: Record<string, unknown> = { ...row };
    if (typeof r["key"] !== "string") continue;
    const locations = Array.isArray(r["references"])
      ? r["references"].filter((x): x is string => typeof x === "string")
      : [];
    const text = typeof r["description"] === "string" ? r["description"] : "";
    const fromText = /\((\S+:\d+)\);/.exec(text);
    if (fromText?.[1] !== undefined) locations.push(fromText[1]);
    held.set(r["key"], {
      summary: typeof r["summary"] === "string" ? r["summary"] : "",
      locations,
    });
  }
  return held;
}
