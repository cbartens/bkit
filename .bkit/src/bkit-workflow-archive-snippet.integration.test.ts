// bkit-workflow-archive-snippet.integration.test.ts — Behavioural regression for
// the supersede-and-archive step in the design / plan Close Workflow blocks.
// Spawns real bash to execute the extracted block against a fabricated tree.
//
// Root cause (#417): the close step copied the freshly generated document
// straight over the canonical one:
//
//   cp "$DESIGN_FINAL" "docs/plans/$YYYYMM/{FID}-design.md"
//
// Nothing checked whether a file was already there, so re-running design or plan
// on a feature that had already completed destroyed the previous document in the
// working tree. The fix moves any existing canonical into
// `docs/plans/{YYYYMM}/archive/{TIMESTAMP}-{FID}-...md` first.
//
// `archive/` is a SUBDIRECTORY on purpose: every read of these artefacts is an
// exact filename or a non-recursive glob, so a nested directory is invisible to
// all of them. Renaming in place is not safe — `{FID}-plan-{TS}.md` matches the
// sub-plan count glob in bkit-build.md and the task-count globs in bkit-ship.md
// and bkit-workflow-telemetry.sh. These tests pin the behaviour, not the literal
// path string.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");
const MONTH = "202605";
const FID = "68-digital-agent-mvp";

const roots: string[] = [];

afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true });
});

function makeRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-archive-"));
  roots.push(dir);
  return dir;
}

// Pull the fenced bash block that follows a numbered step heading, stripping the
// 3-space markdown indent so it runs as written.
function extractBashBlock(workflow: string, headingSnippet: string): string {
  const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), "utf-8");
  const idx = content.indexOf(headingSnippet);
  expect(idx, `heading not found in ${workflow}: ${headingSnippet}`).toBeGreaterThan(-1);
  const fenceStart = content.indexOf("```bash", idx);
  const bodyStart = content.indexOf("\n", fenceStart) + 1;
  const fenceEnd = content.indexOf("```", bodyStart);
  return content
    .slice(bodyStart, fenceEnd)
    .split("\n")
    .map((l) => l.replace(/^ {3}/, ""))
    .join("\n")
    .replaceAll("{FID}", FID);
}

function run(block: string, root: string): void {
  execFileSync("bash", ["-c", `cd "${root}"\nset -o pipefail\n${block}`], {
    encoding: "utf-8",
    stdio: "pipe",
  });
}

function write(root: string, rel: string, body: string): void {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
}

function read(root: string, rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf-8");
}

function archiveNames(root: string): string[] {
  const dir = path.join(root, "docs", "plans", MONTH, "archive");
  return fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
}

describe("design close: archive before overwrite", () => {
  const block = () =>
    // Anchor on the shortest unique prefix of the step heading, not the whole
    // sentence — the trailing clause is prose and gets reworded.
    extractBashBlock("bkit-design.md", "Archive any superseded design");

  it("moves an existing canonical design into archive/ and writes the new one", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "V1\n");
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v2-reviewed.md`, "V2 REVIEWED\n");
    write(root, `docs/plans/${MONTH}/${FID}-design.md`, "THE OLD DESIGN\n");

    run(block(), root);

    expect(read(root, `docs/plans/${MONTH}/${FID}-design.md`)).toBe("V2 REVIEWED\n");
    const archived = archiveNames(root);
    expect(archived).toHaveLength(1);
    expect(archived[0]).toMatch(new RegExp(`^\\d{8}T\\d{6}Z-${FID}-design\\.md$`));
    expect(read(root, `docs/plans/${MONTH}/archive/${archived[0]}`)).toBe("THE OLD DESIGN\n");
  });

  it("writes the canonical with no archive when there was no previous design", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "V1\n");

    run(block(), root);

    expect(read(root, `docs/plans/${MONTH}/${FID}-design.md`)).toBe("V1\n");
    expect(archiveNames(root)).toHaveLength(0);
  });

  it("does not archive when the design is unchanged", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "SAME\n");
    write(root, `docs/plans/${MONTH}/${FID}-design.md`, "SAME\n");

    run(block(), root);

    expect(archiveNames(root)).toHaveLength(0);
  });

  it("archives into the feature's own bucket, not the current month", () => {
    // Guards the companion fix in #416: the close step used to derive the bucket
    // with `date +%Y%m`, so a design that crossed a month boundary resolved
    // against an empty directory. MONTH is deliberately in the past.
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "V1\n");
    write(root, `docs/plans/${MONTH}/${FID}-design.md`, "OLD\n");

    run(block(), root);

    expect(fs.existsSync(path.join(root, "docs", "plans", MONTH, "archive"))).toBe(true);
    expect(read(root, `docs/plans/${MONTH}/${FID}-design.md`)).toBe("V1\n");
  });
});

describe("plan close: archive the whole superseded set", () => {
  const block = () => extractBashBlock("bkit-plan.md", "Archive any superseded plan");

  it("archives the main plan and every sub-plan under one timestamp", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "NEW PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "OLD PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-1.md`, "OLD SUB 1\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-2.md`, "OLD SUB 2\n");

    run(block(), root);

    expect(read(root, `docs/plans/${MONTH}/${FID}-plan.md`)).toBe("NEW PLAN\n");
    const archived = archiveNames(root);
    expect(archived).toHaveLength(3);
    for (const name of archived) {
      expect(name).toMatch(new RegExp(`^\\d{8}T\\d{6}Z-${FID}-plan(-[12])?\\.md$`));
    }
    // One run, one timestamp — the set stays identifiable as a set.
    const stamps = new Set(archived.map((n) => n.slice(0, 16)));
    expect(stamps.size).toBe(1);
  });

  it("leaves no stale sub-plan behind when the new split is smaller", () => {
    // The orphan case: 2 sub-plans previously, none now. Without the archive
    // move, {FID}-plan-1.md and -2.md would sit in the bucket looking active.
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "NEW PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "OLD PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-1.md`, "OLD SUB 1\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-2.md`, "OLD SUB 2\n");

    run(block(), root);

    const live = fs
      .readdirSync(path.join(root, "docs", "plans", MONTH))
      .filter((f) => f.endsWith(".md"))
      .sort();
    expect(live).toEqual([`${FID}-plan.md`]);
  });

  it("does not archive when the plan is unchanged", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "SAME\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "SAME\n");

    run(block(), root);

    expect(archiveNames(root)).toHaveLength(0);
  });
});

describe("archive/ is unreachable from the globs that read these artefacts", () => {
  // The reason archive/ is a subdirectory rather than a rename in place. Each
  // glob below is the real one from the workflow it names.
  const cases: Array<{ name: string; glob: string }> = [
    { name: "bkit-build.md sub-plan count", glob: `docs/plans/${MONTH}/${FID}-plan-*.md` },
    { name: "bkit-ship.md task count", glob: `docs/plans/${MONTH}/${FID}-plan*.md` },
    { name: "bkit-ship.md logs sweep", glob: `docs/plans/${MONTH}/logs/${FID}/*.md` },
  ];

  it.each(cases)("$name does not match archived files", ({ glob }) => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "LIVE\n");
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "DRAFT\n");
    write(root, `docs/plans/${MONTH}/archive/20260801T134500Z-${FID}-plan.md`, "OLD\n");
    write(root, `docs/plans/${MONTH}/archive/20260801T134500Z-${FID}-plan-1.md`, "OLD SUB\n");
    write(root, `docs/plans/${MONTH}/archive/20260801T134500Z-${FID}-design.md`, "OLD DESIGN\n");

    const out = execFileSync("bash", ["-c", `cd "${root}"\nls -1 ${glob} 2>/dev/null || true`], {
      encoding: "utf-8",
    });
    expect(out).not.toContain("archive/");
  });
});
