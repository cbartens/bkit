// install/template-notes.test.ts — the migration that removes bkit's old opening note above
// `<!-- bkit:start -->` from installed `docs/templates/bkit-*.md`.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  migrateTemplateNotes,
  RETIRED_TEMPLATE_NOTE_HASHES,
  stripRetiredTemplateNotes,
} from "./template-notes";
import { sha256 } from "./version-file";
import type { WriteSet } from "./write";

/**
 * Every opening-note wording bkit placed above `<!-- bkit:start -->`, copied byte for byte
 * from the history of the doc templates.
 */
const SHIPPED_NOTES: ReadonlyArray<readonly [string, string]> = [
  [
    "audit 5.0.0 – 5.2.2",
    "<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->",
  ],
  [
    "audit 5.2.3 – 6.0.0",
    "<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->",
  ],
  [
    "audit, unreleased dev",
    "<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->",
  ],
  [
    "plan 5.0.0 – 5.2.2",
    "<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is also stamped with a `bkit:anchor` block recording its base commit; never hand-author or edit it. `@bkit-plan-generate` fills this template. -->",
  ],
  [
    "plan 5.2.3 – 6.0.0",
    "<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->",
  ],
  [
    "plan, pre-5.0.0 dev (`<\\!--`)",
    "<\\!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is also stamped with a `bkit:anchor` block recording its base commit; never hand-author or edit it. -->",
  ],
  [
    "plan, unreleased dev",
    "<!-- Note: @bkit-plan-generate fills this template. The plan lives at `docs/plans/{YYYYMM}/{FID}-plan.md`, the canonical month bucket, where `{YYYYMM}` is the month the first workflow run for `{FID}` created it, set once. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/`, and may be deleted. The canonical copy is stamped with a `bkit:anchor` block that records the base commit (`baseSha`), its ref (`baseRef`) and the design it targets (`designPath`, `designBaseSha`). NEVER write or edit that block by hand. -->",
  ],
];

/** The audit-template note 5.2.3 – 6.0.0 installed above `<!-- bkit:start -->`. */
const AUDIT_NOTE_6_0_0 =
  "<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->";

/** The plan-template note 5.2.3 – 6.0.0 installed above `<!-- bkit:start -->`. */
const PLAN_NOTE_6_0_0 =
  "<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->";

const BLOCK =
  "<!-- bkit:start -->\n\n<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->\n\n<!-- Note: new wording -->\n\n# Security Audit\n\n<!-- bkit:end -->\n\n## Project Instructions\n\n- Mine.\n";

const CONSUMER_NOTE = "<!-- Note: our security lead signs off each report. -->";

const AUDIT = path.join("docs", "templates", "bkit-audit-security.md");
const PLAN = path.join("docs", "templates", "bkit-plan.md");

describe("stripRetiredTemplateNotes", () => {
  it.each(SHIPPED_NOTES)("removes the shipped note: %s", (_label, note) => {
    const r = stripRetiredTemplateNotes(`${note}\n\n${BLOCK}`);
    expect(r).toEqual({ content: BLOCK, removed: 1, edited: [] });
  });

  it("holds exactly the hashes of the shipped wordings", () => {
    const fromHistory = new Set(SHIPPED_NOTES.map(([, note]) => sha256(note)));
    expect(fromHistory.size).toBe(SHIPPED_NOTES.length);
    expect(fromHistory).toEqual(RETIRED_TEMPLATE_NOTE_HASHES);
  });

  it("removes a shipped note when only the lines above the block end in CRLF", () => {
    const r = stripRetiredTemplateNotes(`${PLAN_NOTE_6_0_0}\r\n\r\n${BLOCK}`);
    expect(r.removed).toBe(1);
    expect(r.content).toBe(BLOCK);
  });

  it("leaves a file with CRLF line endings throughout unchanged", () => {
    const text = `${PLAN_NOTE_6_0_0}\n\n${BLOCK}`.replace(/\n/g, "\r\n");
    expect(stripRetiredTemplateNotes(text)).toEqual({ content: text, removed: 0, edited: [] });
  });

  it("removes a shipped note after a byte-order mark, and keeps the mark", () => {
    const r = stripRetiredTemplateNotes(`\uFEFF${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`);
    expect(r).toEqual({ content: `\uFEFF${BLOCK}`, removed: 1, edited: [] });
  });

  it("leaves a file with two start markers unchanged", () => {
    const text = `${AUDIT_NOTE_6_0_0}\n\n${BLOCK}\n${BLOCK}`;
    expect(stripRetiredTemplateNotes(text)).toEqual({ content: text, removed: 0, edited: [] });
  });

  it("leaves a shipped note below the block unchanged", () => {
    const text = `${BLOCK}\n${AUDIT_NOTE_6_0_0}\n`;
    expect(stripRetiredTemplateNotes(text)).toEqual({ content: text, removed: 0, edited: [] });
  });

  it("keeps a consumer's own note without naming it", () => {
    const text = `${CONSUMER_NOTE}\n\n${BLOCK}`;
    expect(stripRetiredTemplateNotes(text)).toEqual({ content: text, removed: 0, edited: [] });
  });

  it("keeps the consumer's own lines above the block", () => {
    const r = stripRetiredTemplateNotes(`# Our audits\n\n${AUDIT_NOTE_6_0_0}\n${BLOCK}`);
    expect(r.content).toBe(`# Our audits\n\n${BLOCK}`);
  });

  it("keeps an edited note, and names it", () => {
    const edited = AUDIT_NOTE_6_0_0.replace("Never overwrite.", "Never overwrite a report.");
    const text = `${edited}\n\n${BLOCK}`;
    expect(stripRetiredTemplateNotes(text)).toEqual({
      content: text,
      removed: 0,
      edited: [edited],
    });
  });

  it("leaves a migrated file, and a file without one start marker, unchanged", () => {
    expect(stripRetiredTemplateNotes(BLOCK)).toEqual({ content: BLOCK, removed: 0, edited: [] });
    const noBlock = `${AUDIT_NOTE_6_0_0}\n\n# Security Audit\n`;
    expect(stripRetiredTemplateNotes(noBlock).content).toBe(noBlock);
  });
});

describe("migrateTemplateNotes", () => {
  let tmpDir: string;
  let originalCwd: string;
  let warn: ReturnType<typeof vi.spyOn>;
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-template-notes-"));
    process.chdir(tmpDir);
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const seed = (rel: string, text: string): void => {
    fs.mkdirSync(path.dirname(rel), { recursive: true });
    fs.writeFileSync(rel, text, "utf-8");
  };
  const run = (dryRun = false): WriteSet => {
    const ws: WriteSet = { writes: [] };
    migrateTemplateNotes(dryRun, ws, "[test]");
    return ws;
  };
  const paths = (ws: WriteSet): string[] => ws.writes.map((w) => path.normalize(w.path));

  it("removes the exact old note from every installed template and records each write", () => {
    seed(AUDIT, `${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`);
    seed(PLAN, `${PLAN_NOTE_6_0_0}\n\n${BLOCK}`);
    const ws = run();
    expect(fs.readFileSync(AUDIT, "utf-8")).toBe(BLOCK);
    expect(fs.readFileSync(PLAN, "utf-8")).toBe(BLOCK);
    expect(paths(ws)).toEqual([AUDIT, PLAN]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining(`core: ${AUDIT} — removed`));
  });

  it("under dry-run records the same writes and leaves the files", () => {
    const old = `${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`;
    seed(AUDIT, old);
    const dry = run(true);
    expect(fs.readFileSync(AUDIT, "utf-8")).toBe(old);
    expect(paths(dry)).toEqual(paths(run()));
  });

  it("keeps an edited note and prints a line naming the file", () => {
    const text = `${AUDIT_NOTE_6_0_0.replace("never hand-author", "do not hand-author")}\n\n${BLOCK}`;
    seed(AUDIT, text);
    const ws = run();
    expect(fs.readFileSync(AUDIT, "utf-8")).toBe(text);
    expect(ws.writes).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`${AUDIT}: the note above`));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("…"));
  });

  it("names an edited note once across a dry run and a real run", () => {
    seed(
      AUDIT,
      `${AUDIT_NOTE_6_0_0.replace("Never overwrite.", "Never overwrite a report.")}\n\n${BLOCK}`,
    );
    run(true);
    run();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("shows a short edited note whole, without an ellipsis", () => {
    const short = "<!-- Note: @bkit-audit-generate fills this. -->";
    seed(AUDIT, `${short}\n\n${BLOCK}`);
    run();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`kept: ${short} bkit's own note`));
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("…"));
  });

  it("keeps a consumer's own note and prints nothing about it", () => {
    const text = `${CONSUMER_NOTE}\n\n${BLOCK}`;
    seed(AUDIT, text);
    expect(run().writes).toEqual([]);
    expect(fs.readFileSync(AUDIT, "utf-8")).toBe(text);
    expect(warn).not.toHaveBeenCalled();
  });

  it("skips a symlinked template and leaves its target unchanged", () => {
    const old = `${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`;
    seed("elsewhere.md", old);
    fs.mkdirSync(path.dirname(AUDIT), { recursive: true });
    fs.symlinkSync(path.resolve("elsewhere.md"), AUDIT);
    expect(run().writes).toEqual([]);
    expect(fs.readFileSync("elsewhere.md", "utf-8")).toBe(old);
    expect(fs.lstatSync(AUDIT).isSymbolicLink()).toBe(true);
  });

  it("leaves an already-migrated file untouched, and is idempotent", () => {
    seed(AUDIT, `${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`);
    run();
    const mtime = fs.statSync(AUDIT).mtimeMs;
    expect(run().writes).toEqual([]);
    expect(fs.readFileSync(AUDIT, "utf-8")).toBe(BLOCK);
    expect(fs.statSync(AUDIT).mtimeMs).toBe(mtime);
    expect(warn).not.toHaveBeenCalled();
  });

  it("ignores a missing templates folder and the consumer's own templates", () => {
    expect(run().writes).toEqual([]);
    const own = path.join("docs", "templates", "our-runbook.md");
    seed(own, `${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`);
    expect(run().writes).toEqual([]);
    expect(fs.readFileSync(own, "utf-8")).toBe(`${AUDIT_NOTE_6_0_0}\n\n${BLOCK}`);
  });
});
