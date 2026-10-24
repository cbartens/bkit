// commands/stats.ts — `bkit stats`: this repo's stats report.
//
// Reads THIS repo's `.bkit/stats.jsonl`, `.bkit/friction.jsonl` and `docs/deferrals.jsonl`,
// runs the computations in commands/analysis.ts over them, writes `.bkit/stats.md` and
// prints it. Never reads another repo, chat history or `harvest/`: the cross-repo report is
// `harvest/stats.md`, written by the harvest script in bkit's own checkout.
//
// `.bkit/stats.md` is committed. It holds no timestamp, so it changes only when the ledgers do.
// `chat` / `run` rows left in `.bkit/stats.jsonl` (written there before they moved to
// `harvest/`) are not counted.
//
// Advisory + inform-only: never gates a workflow, always exits 0.
// See DE-34 for the shared-entrypoint + crash-isolation contract.

import * as fs from "node:fs";
import * as path from "node:path";
import { markdownTable } from "../shared/text.js";
import { runAnalysis, type AnalysisReport } from "./analysis.js";

/** The ledgers `bkit stats` reads, relative to the repo root. */
export const STATS_SOURCES = [
  ".bkit/stats.jsonl",
  ".bkit/friction.jsonl",
  "docs/deferrals.jsonl",
] as const;

/** Where `bkit stats` writes its report, relative to the repo root. */
export const STATS_REPORT = ".bkit/stats.md";

/** Kinds the harvest owns: never counted in a repo's own report. */
const HARVEST_KINDS = new Set(["chat", "run"]);

const pct = (rate: number): string => `${(rate * 100).toFixed(1)}%`;

/** A markdown table under a prettier-ignore marker, or nothing when there are no rows. */
function table(head: string[], rows: (string | number)[][]): string[] {
  const lines = markdownTable(head, rows);
  return lines.length === 0 ? [] : ["<!-- prettier-ignore -->", ...lines, ""];
}

/** Sorted `[key, count]` pairs of a count map, largest first, then by name. */
function ranked(counts: Record<string, number>): [string, number][] {
  return Object.entries(counts).sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
}

/**
 * The report as markdown sections under `## ` headings. `title` is the `# ` heading;
 * `scope` the sentence under it saying which rows were read.
 */
export function renderStatsMarkdown(report: AnalysisReport, title: string, scope: string): string {
  const { counts, elapsed, regression, complianceRates, versionCompliance, deferralDiscipline } =
    report;
  const out: string[] = [`# ${title}`, "", scope, ""];

  out.push("## Rows", "");
  if (counts.total === 0) {
    out.push("No rows yet. Workflows append them at close.", "");
    return out.join("\n");
  }
  out.push(...table(["Kind", "Rows"], ranked(counts.byKind)));
  out.push(...table(["Workflow", "Rows"], ranked(counts.byWorkflow)));
  if (Object.keys(counts.byRepo).length > 1) {
    out.push(...table(["Repo", "Rows"], ranked(counts.byRepo)));
  }

  out.push("## Run durations", "");
  if (elapsed.count === 0) {
    out.push("No outcome row records a duration.", "");
  } else {
    out.push(
      ...table(
        ["Runs", "Mean (min)", "Median (min)", "Min (min)", "Max (min)"],
        [
          [
            elapsed.count,
            elapsed.meanMinutes.toFixed(1),
            elapsed.p50Minutes.toFixed(1),
            elapsed.minMinutes,
            elapsed.maxMinutes,
          ],
        ],
      ),
    );
  }

  out.push("## Change size vs failures", "");
  out.push(
    `A run counts as an error when it added failures. Dispatch-size threshold: ${regression.dispatchSizeThreshold} lines added.`,
    "",
  );
  out.push(
    ...table(
      ["Lines added", "Runs", "Errors", "Error rate"],
      regression.buckets
        .filter((b) => b.count > 0)
        .map((b) => [b.label, b.count, b.errorCount, pct(b.errorRate)]),
    ),
  );
  out.push(
    `Attempt counters: ${regression.shellBusCount} counted by the shell (trusted), ${regression.modelSelfReportCount} reported by the model (untrusted).`,
    "",
  );

  if (complianceRates.length > 0) {
    out.push("## Compliance by rule", "");
    out.push(
      ...table(
        ["Rule", "Pass", "Fail", "n/a", "Pass rate"],
        complianceRates.map((r) => [r.rule, r.passCount, r.failCount, r.naCount, pct(r.passRate)]),
      ),
    );
  }

  if (versionCompliance.length > 0) {
    out.push("## Compliance by bkit version", "");
    out.push(
      ...table(
        ["Version", "Runs", "Pass rate"],
        versionCompliance.map((v) => [v.version, v.totalRuns, pct(v.passRate)]),
      ),
    );
  }

  if (deferralDiscipline.length > 0) {
    out.push("## Deferral discipline", "");
    out.push("Deferrals adjudicated unjustified, by the writer that deferred.", "");
    out.push(
      ...table(
        ["Writer", "Model", "Deferrals", "Unjustified", "Rate", "Reasons"],
        deferralDiscipline.map((d) => [
          d.writer,
          d.model,
          d.total,
          d.unjustifiedCount,
          pct(d.unjustifiedRate),
          Object.entries(d.byReason)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([reason, n]) => `${reason}=${n}`)
            .join(" "),
        ]),
      ),
    );
  }

  return out.join("\n").replace(/\n+$/, "\n");
}

/** Build this repo's report from the ledgers under `root`. */
export function buildRepoStats(root: string): string {
  const files = STATS_SOURCES.map((rel) => path.join(root, rel)).filter((p) => fs.existsSync(p));
  return renderStatsMarkdown(
    runAnalysis(files, HARVEST_KINDS),
    "bkit stats",
    `This repo only: ${STATS_SOURCES.map((s) => `\`${s}\``).join(", ")}. Written by \`bkit stats\`; workflow closes append the rows.`,
  );
}

// stats — this repo's stats report. Advisory + inform-only: exits 0.
// See DE-34 for the shared-entrypoint + crash-isolation contract.
export function runStatsCommand(): void {
  try {
    const root = process.cwd();
    const markdown = buildRepoStats(root);
    fs.writeFileSync(path.join(root, STATS_REPORT), markdown, "utf-8");
    console.log(markdown);
    console.error(`[bkit-stats] wrote ${STATS_REPORT}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[bkit-stats] stats error (fail-open): ${msg}`);
  }
}
