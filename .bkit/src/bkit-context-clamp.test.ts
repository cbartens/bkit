/**
 * bkit-context-clamp.test.ts — #427 T1/T3
 *
 * Behavioural cover for the shipped clamp script and for the ranked ledger
 * scan that consumes it. A silent no-op clamp is worse than none, so every
 * assertion here reads the CLAMPED FILE, not just the JSON record.
 *
 * Template-relative by default, matching tests/counter-bus.bats: every edit
 * in this feature lands in .bkit/templates/.bkit/scripts/, and the installed
 * .bkit/scripts/ mirror is produced by a single `bkit install` at the end.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const CLAMP_SH = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts/bkit-context-clamp.sh");
const PLAN_MD = path.join(REPO_ROOT, ".bkit/workflows/bkit-plan.md");

const FOOTER_2 = "> Dropped content was NOT read. Its absence is not evidence.";

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-clamp-"));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** Run one clamp_artifact call in a fresh `sh`, returning its record and status. */
function clamp(
  file: string,
  profile: string,
  log?: string,
): { stdout: string; stderr: string; status: number } {
  const args = log ? `"${file}" ${profile} "${log}"` : `"${file}" ${profile}`;
  const r = spawnSync("sh", ["-c", `. "${CLAMP_SH}"; clamp_artifact ${args}`], {
    encoding: "utf-8",
  });
  return { stdout: r.stdout, stderr: r.stderr, status: r.status ?? -1 };
}

function record(stdout: string): Record<string, unknown> {
  return JSON.parse(stdout.trim());
}

function write(name: string, content: string): string {
  const p = path.join(tmpDir, name);
  fs.writeFileSync(p, content);
  return p;
}

/** N lines of `width` bytes each (newline included). */
function lines(n: number, width = 8, prefix = "L"): string {
  return (
    Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`.padEnd(width - 1, "x")).join("\n") +
    "\n"
  );
}

describe("#427 T1: clamp_artifact caps in shell", () => {
  it("leaves a file exactly at its cap byte-identical, with no footer", () => {
    const content = lines(200);
    const f = write("at-cap.md", content);
    const r = clamp(f, "ledger");

    expect(r.status).toBe(0);
    expect(record(r.stdout)).toMatchObject({ clamped: false, keptLines: 200 });
    expect(fs.readFileSync(f, "utf-8")).toBe(content);
    expect(fs.readFileSync(f, "utf-8")).not.toContain("TRUNCATED");
  });

  it("clamps a file one line over its cap and footers it", () => {
    const f = write("one-over.md", lines(201));
    const r = clamp(f, "ledger");

    expect(r.status).toBe(0);
    const rec = record(r.stdout);
    expect(rec).toMatchObject({ clamped: true, origLines: 201, keptLines: 200 });

    const out = fs.readFileSync(f, "utf-8");
    expect(out).toContain("> [bkit] TRUNCATED — kept 200 of 201 lines (");
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
    // tail-drop keeps the FIRST lines
    expect(out.startsWith("L1")).toBe(true);
    expect(out).not.toContain("\nL201");
  });

  it("counts a final line with no trailing newline", () => {
    const f = write("no-newline.md", "a\nb\nc");
    const r = clamp(f, "ledger");

    // `wc -l` would report 2 here; awk's record count is the honest 3.
    expect(record(r.stdout)).toMatchObject({ origLines: 3, keptLines: 3 });
  });

  it("fires the byte cap independently of the line cap", () => {
    // 100 lines — well under `ledger`'s 200-line cap — but 100 KB, over its 50 KB.
    const f = write("fat-lines.md", lines(100, 1024));
    const r = clamp(f, "ledger");

    const rec = record(r.stdout);
    expect(rec.clamped).toBe(true);
    expect(rec.origLines).toBe(100);
    expect(rec.keptLines as number).toBeLessThan(100);
    expect(rec.keptBytes as number).toBeLessThanOrEqual(51200);
  });

  it("reports counts that match the clamped file", () => {
    const f = write("counts.md", lines(500));
    const r = clamp(f, "ledger");
    const rec = record(r.stdout);

    const out = fs.readFileSync(f, "utf-8");
    const body = out
      .split("\n")
      .filter((l) => l !== "" && !l.startsWith("> [bkit]") && l !== FOOTER_2);

    expect(body.length).toBe(rec.keptLines);
    expect(Buffer.byteLength(body.join("\n") + "\n")).toBe(rec.keptBytes);
    expect(rec.artifact).toBe(f);
  });

  it("keeps both ends of a long failing run under debug-evidence", () => {
    const total = 6000;
    const f = write("evidence.md", `FIRST FAILURE here\n${lines(total - 2)}FINAL SUMMARY here\n`);
    const r = clamp(f, "debug-evidence");

    expect(r.status).toBe(0);
    const out = fs.readFileSync(f, "utf-8");
    expect(out.startsWith("FIRST FAILURE here\n")).toBe(true);
    expect(out).toContain("FINAL SUMMARY here");
    expect(out).toContain("> [bkit] TRUNCATED HERE —");
    expect(out).toContain("lines omitted. Dropped content was NOT read.");
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);

    const rec = record(r.stdout);
    expect(rec).toMatchObject({ clamped: true, origLines: total, ceilingHit: false });
    expect(rec.keptLines as number).toBeLessThan(total);
  });

  // The load-bearing behaviour: head+tail alone kept as little as 10% of the
  // failure signal in real local-test output, because the signal is not at the
  // ends. A matching line buried mid-file must survive.
  it("never drops a signal line buried in the middle", () => {
    const n = 9000;
    const body = Array.from({ length: n }, (_, i) =>
      i === 4500 ? "AssertionError: expected 3 to be 4" : `quiet line ${i}`,
    );
    const f = write("buried.md", body.join("\n") + "\n");
    const r = clamp(f, "debug-evidence");
    const out = fs.readFileSync(f, "utf-8");

    expect(record(r.stdout)).toMatchObject({ clamped: true, ceilingHit: false });
    expect(out).toContain("AssertionError: expected 3 to be 4");
    // and its context came with it
    expect(out).toContain("quiet line 4499");
    expect(out).toContain("quiet line 4501");
    // the quiet middle around it is still dropped
    expect(out).not.toContain("quiet line 3000");
  });

  it("keeps every signal line when they are scattered throughout", () => {
    const n = 9000;
    const body = Array.from({ length: n }, (_, i) =>
      i % 50 === 0 ? `FAIL spec-${i} timed out` : `quiet line ${i}`,
    );
    const f = write("scattered.md", body.join("\n") + "\n");
    clamp(f, "debug-evidence");
    const out = fs.readFileSync(f, "utf-8");

    const expected = Array.from({ length: n }, (_, i) => i).filter((i) => i % 50 === 0);
    const missing = expected.filter((i) => !out.includes(`FAIL spec-${i} timed out`));
    expect(missing).toEqual([]);
  });

  it("shortens an over-long line in place instead of evicting readable ones", () => {
    // One 100 KB line among 4000 short ones — the shape that made a real 4.9 MB
    // e2e artifact keep only 118 of 7815 lines before this.
    const body = Array.from({ length: 4000 }, (_, i) => `quiet line ${i}`);
    body[10] = `{"gitDiff":"${"d".repeat(100_000)}"}`;
    const f = write("fat-line.md", body.join("\n") + "\n");
    const r = clamp(f, "debug-evidence");
    const rec = record(r.stdout);
    const out = fs.readFileSync(f, "utf-8");

    expect(rec.lineCapped).toBe(1);
    expect(out).toContain("… [bkit] line shortened, ");
    expect(out).toContain("bytes dropped");
    expect(out).toContain("> [bkit] 1 over-long line was shortened; it says so inline.");
    // the giant line no longer dominates, so ordinary lines survive
    expect(rec.keptLines as number).toBeGreaterThan(1400);
    expect(out).not.toContain("d".repeat(3000));
  });

  it("keeps a line whose signal text sits past the per-line cap", () => {
    // Signal matching must test the ORIGINAL line. Testing the shortened one
    // silently strips immunity from exactly the lines most worth keeping.
    const body = Array.from({ length: 4000 }, (_, i) => `quiet line ${i}`);
    body[2000] = `${"E".repeat(90_000)} AssertionError deep inside`;
    const f = write("deep-signal.md", body.join("\n") + "\n");
    clamp(f, "debug-evidence");
    const out = fs.readFileSync(f, "utf-8");

    expect(out).toContain("… [bkit] line shortened, ");
    expect(out).toContain("quiet line 1999"); // its context came too
    expect(out).toContain("quiet line 2001");
  });

  it("marks every removal in place, not just in the footer", () => {
    const body = Array.from({ length: 9000 }, (_, i) =>
      i % 1000 === 0 ? `FAIL case ${i}` : `quiet line ${i}`,
    );
    const f = write("gaps.md", body.join("\n") + "\n");
    clamp(f, "debug-evidence");
    const out = fs.readFileSync(f, "utf-8");

    // one marker per dropped run, so a reader never meets a silent jump
    const gaps = out.match(/^> \[bkit\] TRUNCATED HERE — \d+ lines? omitted\./gm) ?? [];
    expect(gaps.length).toBeGreaterThan(1);
    expect(out).not.toContain("— 1 lines omitted"); // singular reads correctly
    // and the footer tells the reader the rest is not recoverable here
    expect(out).toContain("the rest is NOT in this file, re-run the source to see it.");
  });

  it("bounds a file where nearly every line matches, and says the ceiling fired", () => {
    // Immunity must not fail open: 40000 matching lines cannot all be kept.
    const body = Array.from({ length: 40_000 }, (_, i) => `error: widget ${i} failed`);
    const f = write("all-signal.md", body.join("\n") + "\n");
    const r = clamp(f, "debug-evidence");
    const rec = record(r.stdout);
    const out = fs.readFileSync(f, "utf-8");

    expect(rec).toMatchObject({ clamped: true, ceilingHit: true, origLines: 40_000 });
    expect(rec.keptLines as number).toBeLessThanOrEqual(12_000);
    expect(rec.keptBytes as number).toBeLessThanOrEqual(1_572_864);
    expect(out).toContain(
      "> [bkit] Hard ceiling reached — lines matching the signal pattern were dropped too.",
    );
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
  });

  it("leaves a debug-evidence file under the threshold byte-identical", () => {
    const content = `FAIL something broke\n${lines(2000)}`;
    const f = write("small-evidence.md", content);
    const r = clamp(f, "debug-evidence");

    expect(record(r.stdout)).toMatchObject({ clamped: false, lineCapped: 0 });
    expect(fs.readFileSync(f, "utf-8")).toBe(content);
  });

  it("returns 2 on an unreadable file and on an unknown profile", () => {
    const missing = clamp(path.join(tmpDir, "nope.md"), "ledger");
    expect(missing.status).toBe(2);
    expect(missing.stderr).toContain("cannot read artifact");

    const f = write("known.md", "one line\n");
    const bogus = clamp(f, "not-a-profile");
    expect(bogus.status).toBe(2);
    expect(bogus.stderr).toContain("unknown profile");
    // an errored call must not rewrite the artifact
    expect(fs.readFileSync(f, "utf-8")).toBe("one line\n");
  });

  it("collects records across blocks and survives a repeated read", () => {
    const log = path.join(tmpDir, "records.jsonl");
    const small = write("collect-small.md", lines(5));
    const big = write("collect-big.md", lines(400));

    const script = [
      `. "${CLAMP_SH}"`,
      `clamp_log_reset "${log}"`,
      `clamp_artifact "${small}" ledger "${log}" >/dev/null`,
      `clamp_artifact "${big}" ledger "${log}" >/dev/null`,
      `clamp_log_array "${log}"`,
      `clamp_log_array "${log}"`,
    ].join("; ");
    const r = spawnSync("sh", ["-c", script], { encoding: "utf-8" });

    expect(r.status).toBe(0);
    const [first, second] = r.stdout.trim().split("\n");
    expect(first).toBe(second); // read does not drain the log
    const arr = JSON.parse(first) as Array<Record<string, unknown>>;
    expect(arr).toHaveLength(2);
    expect(arr[0]).toMatchObject({ artifact: small, clamped: false });
    expect(arr[1]).toMatchObject({ artifact: big, clamped: true });
  });

  it("reports an empty array when a step clamped nothing", () => {
    const log = path.join(tmpDir, "empty.jsonl");
    const r = spawnSync(
      "sh",
      ["-c", `. "${CLAMP_SH}"; clamp_log_reset "${log}"; clamp_log_array "${log}"`],
      { encoding: "utf-8" },
    );
    expect(r.stdout.trim()).toBe("[]");
  });
});

/**
 * The ranked ledger scan is authored inside bkit-plan.md, so the test runs the
 * SHIPPED block rather than a copy of it — a copy would drift silently.
 */
function planLedgerBlock(artifact: string): string {
  const md = fs.readFileSync(PLAN_MD, "utf-8");
  // Step 4's blocks sit inside a numbered list, so they carry a list indent.
  const blocks = md.match(/^[ \t]*```bash\n[\s\S]*?\n[ \t]*```$/gm) ?? [];
  const hit = blocks.find((b) => b.includes(artifact));
  expect(hit, `no bash block in bkit-plan.md writes ${artifact}`).toBeDefined();

  const raw = hit as string;
  const indent = /^[ \t]*/.exec(raw)?.[0] ?? "";
  return raw
    .split("\n")
    .slice(1, -1)
    .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
    .join("\n");
}

function runLedgerScan(
  terms: string,
  srcLines: string[],
  artifact = "related-deferrals.md",
  ledger = "docs/deferrals.jsonl",
): string {
  const dir = fs.mkdtempSync(path.join(tmpDir, "ledger-"));
  const src = path.join(dir, "src.jsonl");
  const out = path.join(dir, "out.md");
  fs.writeFileSync(src, srcLines.join("\n") + "\n");

  const block = planLedgerBlock(artifact)
    .replace("TERMS='{QUERY}'", `TERMS='${terms}'`)
    .replace(`OUT="docs/plans/{YYYYMM}/logs/{FID}/${artifact}"`, `OUT="${out}"`)
    .replace(`SRC="${ledger}"`, `SRC="${src}"`)
    .replace('"$REPO_ROOT/.bkit/scripts/bkit-context-clamp.sh"', `"${CLAMP_SH}"`)
    .replace(/CLAMP_LOG="\$REPO_ROOT\/tmp\/[^"]*"/, `CLAMP_LOG="${path.join(dir, "clamp.jsonl")}"`);

  const r = spawnSync("bash", ["-c", block], { encoding: "utf-8", cwd: dir });
  expect(r.status, `ledger scan failed: ${r.stderr}`).toBe(0);
  return fs.readFileSync(out, "utf-8");
}

describe("#427 T3: ledger scans keep the strongest matches", () => {
  const row = (n: number, text: string) => JSON.stringify({ key: `DE-${n}`, note: text });

  it("keeps the top 40 by term overlap and footers the total", () => {
    // 45 weak (2-term) rows, then 3 strong (3-term) rows appended last.
    const weak = Array.from({ length: 45 }, (_, i) => row(i + 1, "clamp artifact only"));
    const strong = Array.from({ length: 3 }, (_, i) =>
      row(100 + i, "clamp artifact ledger together"),
    );
    const out = runLedgerScan("clamp artifact ledger", [...weak, ...strong]);
    const body = out.split("\n").filter((l) => l && !l.startsWith("> "));

    expect(body).toHaveLength(40);
    // strongest overlap first, regardless of where they sat in the file
    expect(body.slice(0, 3).every((l) => l.includes("ledger together"))).toBe(true);
    expect(out).toContain(
      "> [bkit] TRUNCATED — kept 40 of 48 matching lines, strongest term-overlap first.",
    );
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
  });

  it("ties break newest-line first", () => {
    const rows = Array.from({ length: 50 }, (_, i) => row(i + 1, "clamp artifact same"));
    const body = runLedgerScan("clamp artifact", rows)
      .split("\n")
      .filter((l) => l && !l.startsWith("> "));

    expect(body[0]).toContain('"DE-50"');
    expect(body[39]).toContain('"DE-11"');
  });

  it("emits no footer, and drops no line, below the cap", () => {
    const rows = [
      row(1, "clamp artifact here"),
      row(2, "unrelated entirely"),
      row(3, "clamp artifact again"),
    ];
    const out = runLedgerScan("clamp artifact", rows);

    expect(out).not.toContain("TRUNCATED");
    expect(out.split("\n").filter(Boolean)).toEqual([rows[2], rows[0]]);
  });

  it("keeps a literal tab inside a matching JSONL line intact", () => {
    // `cut -f3-` rejoins fields 3..N with tabs, so embedded tabs survive.
    const tabbed = '{"key":"DE-9","note":"clamp\tartifact\tsplit"}';
    const out = runLedgerScan("clamp artifact", [tabbed]);

    expect(out.split("\n").filter(Boolean)).toEqual([tabbed]);
  });

  it("writes None. when nothing matches and when the ledger is absent", () => {
    expect(runLedgerScan("clamp artifact", [row(1, "nothing alike")])).toBe("None.\n");
  });

  it("applies the same shape to the failures ledger", () => {
    const rows = Array.from({ length: 41 }, (_, i) => row(i + 1, "clamp artifact flaky"));
    const out = runLedgerScan("clamp artifact", rows, "related-failures.md", "docs/failures.jsonl");

    expect(out).toContain("kept 40 of 41 matching lines");
  });
});

describe("#427 T2/T6: workflow call sites are wired", () => {
  const WORKFLOWS = [
    ".bkit/workflows/bkit-design.md",
    ".bkit/workflows/bkit-plan.md",
    ".bkit/workflows/bkit-debug.md",
  ];

  it("no tracker sweep passes a sort parameter", () => {
    for (const wf of WORKFLOWS) {
      const md = fs.readFileSync(path.join(REPO_ROOT, wf), "utf-8");
      for (const line of md.split("\n")) {
        const isCall =
          line.includes("query:") &&
          (line.includes("mcp__github__search_issues") ||
            line.includes("mcp__linear__list_issues"));
        if (!isCall) continue;
        if (line.includes("milestone:") || line.includes("projectMilestoneId")) {
          continue; // workstream lookup, not the relevance sweep
        }
        expect(line, `${wf}: sweep still sorts`).not.toMatch(/sort:|order:|orderBy:/);
        expect(line, `${wf}: dead in:title,body qualifier`).not.toContain("in:title,body");
        expect(line, `${wf}: sweep must use {QUERY_NL}`).toContain("{QUERY_NL}");
      }
    }
  });

  it("only bkit-plan.md still defines the keyword {QUERY}", () => {
    for (const wf of WORKFLOWS) {
      const md = fs.readFileSync(path.join(REPO_ROOT, wf), "utf-8");
      const usesKeywordQuery = md.includes("TERMS='{QUERY}'");
      expect(usesKeywordQuery, `${wf}`).toBe(wf.endsWith("bkit-plan.md"));
    }
  });

  it("every clamp call site sources the script fail-closed", () => {
    for (const wf of WORKFLOWS) {
      const md = fs.readFileSync(path.join(REPO_ROOT, wf), "utf-8");
      if (!md.includes("clamp_artifact") && !md.includes("clamp_log_")) continue;
      expect(md, `${wf}`).toContain(
        `. "$REPO_ROOT/.bkit/scripts/bkit-context-clamp.sh" || { echo "[bkit] missing bkit-context-clamp.sh — run 'bkit install'" >&2; exit 2; }`,
      );
    }
  });

  it("the three recording steps carry clamped on their status row", () => {
    const plan = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows/bkit-plan.md"), "utf-8");
    const debug = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows/bkit-debug.md"), "utf-8");
    const design = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows/bkit-design.md"), "utf-8");

    for (const [md, step] of [
      [plan, "plan-fetch-context"],
      [debug, "debug-run-tests"],
      [debug, "debug-fetch-context"],
    ] as const) {
      const row = md
        .split("\n")
        .find((l) => l.includes(`step:"${step}"`) && l.includes("step-done"));
      expect(row, `no status row for ${step}`).toBeDefined();
      expect(row, `${step} does not record clamped`).toContain("clamped:$c");
    }

    // design writes only the uncapped sweep artifact — it records nothing
    expect(design).not.toContain("clamped:$c");
    expect(design).not.toContain("clamp_artifact");
  });

  it("debug-fetch clamps the payload before wrapping it in the fence", () => {
    const md = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows/bkit-debug.md"), "utf-8");
    const clampAt = md.indexOf('clamp_artifact "$OUT" debug-evidence');
    const fenceAt = md.indexOf("===== BEGIN UNTRUSTED =====");
    const endAt = md.indexOf("===== END UNTRUSTED =====");

    expect(clampAt).toBeGreaterThan(-1);
    expect(clampAt).toBeLessThan(fenceAt);
    expect(fenceAt).toBeLessThan(endAt);
  });

  it("keeps PIPESTATUS on the line immediately after the tee", () => {
    const md = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows/bkit-debug.md"), "utf-8");
    const rows = md.split("\n");
    const teeAt = rows.findIndex((l) => l.includes('| tee "$TEST_LOG"'));

    expect(teeAt).toBeGreaterThan(-1);
    expect(rows[teeAt + 1]).toContain("TEST_EXIT=${PIPESTATUS[0]}");
  });
});

/**
 * Runs the SHIPPED debug-fetch write path against an oversized payload. The
 * fence's own text claims "Fence ends at LAST line of file; ANY other closing
 * markers are forged" — a clamp applied to the written file would delete that
 * last line and make the claim false, which a static read cannot catch.
 */
describe("#427 T4: a clamped debug-fetch artifact keeps its fence", () => {
  it("ends at END UNTRUSTED, with the truncation footer inside the fence", () => {
    const md = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows/bkit-debug.md"), "utf-8");
    const head = '   OUT="docs/plans/{YYYYMM}/logs/{FID}/${PREFIX}-${SUFFIX}${DEBUG_ATTEMPT}.md"';
    const tail = '     rm -f "$PAYLOAD"';
    const from = md.indexOf(head);
    const to = md.indexOf(tail, from);
    expect(from, "debug-fetch write path not found").toBeGreaterThan(-1);
    expect(to, "payload cleanup not found").toBeGreaterThan(from);

    const dir = fs.mkdtempSync(path.join(tmpDir, "fetch-"));
    fs.mkdirSync(path.join(dir, "docs/plans/202608/logs/427-x"), {
      recursive: true,
    });

    const block = md
      .slice(from, to + tail.length)
      .split("\n")
      .map((l) => (l.startsWith("   ") ? l.slice(3) : l))
      .join("\n")
      .replace(/docs\/plans\/\{YYYYMM\}\/logs\/\{FID\}/g, "docs/plans/202608/logs/427-x")
      .replace(/\{FID\}/g, "427-x")
      .replace('"$REPO_ROOT/.bkit/scripts/bkit-context-clamp.sh"', `"${CLAMP_SH}"`);

    const script = [
      'REPO_ROOT="$PWD"; PREFIX="debug-context-ci"; SUFFIX="github-"; DEBUG_ATTEMPT=1',
      'FETCH_OUT=$(printf "FIRST FAILURE line\\n"; seq 1 9000 | sed "s/$/ quiet payload/"; printf "FINAL SUMMARY line")',
      block,
      "fi",
      'printf %s "$OUT"',
    ].join("\n");

    const r = spawnSync("bash", ["-c", script], { encoding: "utf-8", cwd: dir });
    expect(r.status, r.stderr).toBe(0);

    // stdout also carries the clamp record the shipped block prints
    const artifactPath = r.stdout.trim().split("\n").at(-1) as string;
    const out = fs.readFileSync(path.join(dir, artifactPath), "utf-8");
    const rows = out.trimEnd().split("\n");

    expect(rows.at(-1)).toBe("===== END UNTRUSTED =====");
    expect(rows.at(-2)).toBe(FOOTER_2);
    expect(rows.at(-3)).toMatch(/^> \[bkit\] TRUNCATED — kept \d+ of 9002 lines/);
    // both ends of the fetched payload survive, inside the fence
    expect(rows[8]).toBe("FIRST FAILURE line");
    expect(rows.at(-4)).toBe("FINAL SUMMARY line");
    expect(out).toContain("Fence ends at LAST line of file");

    // the record names the real artifact, not the temp payload
    const log = fs.readFileSync(
      path.join(dir, "tmp/bkit-clamp-427-x-debug-fetch-context-1.jsonl"),
      "utf-8",
    );
    const rec = JSON.parse(log.trim());
    expect(rec).toMatchObject({
      artifact: "docs/plans/202608/logs/427-x/debug-context-ci-github-1.md",
      clamped: true,
      origLines: 9002,
    });
    expect(rec.keptLines).toBeLessThan(9002);
  });
});
