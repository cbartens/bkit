// audits/workflows/workflow-archive-snippet.integration.test.ts — the supersede-and-archive step
// in the design / plan Close Workflow blocks (`bkit workflows promote`). Spawns real bash to
// execute the extracted line against a fabricated tree.
//
// Before writing the canonical document, the close step moves any existing canonical
// into `docs/plans/{YYYYMM}/archive/{TIMESTAMP}-{FID}-...md`.
//
// `archive/` is a SUBDIRECTORY: every read of these artefacts is an exact filename or a
// non-recursive glob, which a nested directory is invisible to. These tests pin the
// behaviour, not the literal path string. The block's `bkit` calls (runtime assert,
// anchor-stamp) run from the repo's built dist/, linked into the fixture at the path the
// block resolves.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");
const MONTH = "202605";
const FID = "68-digital-agent-mvp";
const BKIT_BIN = path.resolve("dist/cli.js");
const STATUS = `docs/plans/${MONTH}/logs/${FID}/status.jsonl`;

const roots: string[] = [];

afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true });
});

// `bkit` resolves the repo through git, so `root` must be a real git repo. Its
// status log carries a resolved runtime row with no base SHA, so promote's
// anchor stamp (covered by the workflows command tests) is skipped and the
// archive logic runs alone.
function makeRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-archive-"));
  roots.push(dir);
  execFileSync("git", ["init", "-q"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "node_modules/.bin"), { recursive: true });
  fs.symlinkSync(BKIT_BIN, path.join(dir, "node_modules/.bin/bkit"));
  for (const workflow of ["design", "plan"]) {
    const row = {
      type: "runtime-resolved",
      workflow,
      at: "2026-05-01T00:00:00Z",
      runtime: "LOCAL",
      runtimeWorktrees: true,
      runtimeDevPushes: true,
      runtimeGithubCli: false,
      runtimeGithubCliExit: 127,
      runtimeGithubCliErr: "",
      baseSha: "",
    };
    fs.mkdirSync(path.dirname(path.join(dir, STATUS)), { recursive: true });
    fs.appendFileSync(path.join(dir, STATUS), `${JSON.stringify(row)}\n`);
  }
  return dir;
}

// The `workflows promote` line of a workflow's Close Workflow step, placeholders filled.
function promoteLine(workflow: string, root: string): string {
  const content = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), "utf-8");
  const close = content.slice(content.search(/^## .*Close Workflow/m));
  const line = close
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith('"{BKIT}" workflows promote ') && l.includes('--file="{STATUS}"'));
  expect(line, `promote line not found in ${workflow}`).toBeTruthy();
  const filled = line!
    .replaceAll("{BKIT}", path.join(root, "node_modules/.bin/bkit"))
    .replaceAll("{FID}", FID)
    .replaceAll("{YYYYMM}", MONTH)
    .replaceAll("{STATUS}", STATUS);
  expect(filled).not.toMatch(/\{[A-Z_]+\}/);
  return filled;
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
  const block = (root: string) => promoteLine("bkit-design.md", root);

  it("moves an existing canonical design into archive/ and writes the new one", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "V1\n");
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v2-reviewed.md`, "V2 REVIEWED\n");
    write(root, `docs/plans/${MONTH}/${FID}-design.md`, "THE OLD DESIGN\n");

    run(block(root), root);

    expect(read(root, `docs/plans/${MONTH}/${FID}-design.md`)).toBe("V2 REVIEWED\n");
    const archived = archiveNames(root);
    expect(archived).toHaveLength(1);
    expect(archived[0]).toMatch(new RegExp(`^\\d{8}T\\d{6}Z-${FID}-design\\.md$`));
    expect(read(root, `docs/plans/${MONTH}/archive/${archived[0]}`)).toBe("THE OLD DESIGN\n");
  });

  it("writes the canonical with no archive when there was no previous design", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "V1\n");

    run(block(root), root);

    expect(read(root, `docs/plans/${MONTH}/${FID}-design.md`)).toBe("V1\n");
    expect(archiveNames(root)).toHaveLength(0);
  });

  it("does not archive when the design is unchanged", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "SAME\n");
    write(root, `docs/plans/${MONTH}/${FID}-design.md`, "SAME\n");

    run(block(root), root);

    expect(archiveNames(root)).toHaveLength(0);
  });

  it("archives into the feature's own bucket, not the current month", () => {
    // MONTH is in the past; the block takes it as `{YYYYMM}`, the bucket
    // `bkit locks acquire` resolved (not `date +%Y%m`).
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/design-v1-draft.md`, "V1\n");
    write(root, `docs/plans/${MONTH}/${FID}-design.md`, "OLD\n");

    run(block(root), root);

    expect(fs.existsSync(path.join(root, "docs", "plans", MONTH, "archive"))).toBe(true);
    expect(read(root, `docs/plans/${MONTH}/${FID}-design.md`)).toBe("V1\n");
  });
});

describe("plan close: archive the whole superseded set", () => {
  const block = (root: string) => promoteLine("bkit-plan.md", root);

  // The agent's Bash tool runs zsh on macOS, where an unmatched glob (an unsplit
  // plan has no plan-v4-N.md) aborts the whole block with "no matches found".
  it.skipIf(spawnSync("zsh", ["-c", "true"]).status !== 0)(
    "runs under zsh for an unsplit plan with a superseded canonical",
    () => {
      const root = makeRoot();
      write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "NEW PLAN\n");
      write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "OLD PLAN\n");

      execFileSync("zsh", ["-c", `cd "${root}"\n${block(root)}`], {
        encoding: "utf-8",
        stdio: "pipe",
      });

      expect(read(root, `docs/plans/${MONTH}/${FID}-plan.md`)).toBe("NEW PLAN\n");
      expect(archiveNames(root)).toHaveLength(1);
    },
  );

  it("archives the main plan and every sub-plan under one timestamp", () => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "NEW PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "OLD PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-1.md`, "OLD SUB 1\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-2.md`, "OLD SUB 2\n");

    run(block(root), root);

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
    // The orphan case: 2 sub-plans previously, none now; {FID}-plan-1.md and -2.md are
    // archived.
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "NEW PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "OLD PLAN\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-1.md`, "OLD SUB 1\n");
    write(root, `docs/plans/${MONTH}/${FID}-plan-2.md`, "OLD SUB 2\n");

    run(block(root), root);

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

    run(block(root), root);

    expect(archiveNames(root)).toHaveLength(0);
  });
});

describe("archive/ is unreachable from the lookups that read these artefacts", () => {
  // Archived files are invisible to the workflows' non-recursive `find` lookups.
  // Each command below is the real one from the workflow it names.
  const cases: Array<{ name: string; cmd: string }> = [
    {
      name: "bkit-build.md sub-plan count",
      cmd: `find docs/plans/${MONTH} -maxdepth 1 -type f -name '${FID}-plan-*.md'`,
    },
    {
      name: "bkit-ship.md plan presence",
      cmd: `find docs/plans/${MONTH} -maxdepth 1 -type f -name '${FID}-plan*.md'`,
    },
  ];

  it.each(cases)("$name does not match archived files", ({ cmd }) => {
    const root = makeRoot();
    write(root, `docs/plans/${MONTH}/${FID}-plan.md`, "LIVE\n");
    write(root, `docs/plans/${MONTH}/logs/${FID}/plan-v2-reviewed.md`, "DRAFT\n");
    write(root, `docs/plans/${MONTH}/archive/20260801T134500Z-${FID}-plan.md`, "OLD\n");
    write(root, `docs/plans/${MONTH}/archive/20260801T134500Z-${FID}-plan-1.md`, "OLD SUB\n");
    write(root, `docs/plans/${MONTH}/archive/20260801T134500Z-${FID}-design.md`, "OLD DESIGN\n");

    const out = execFileSync("bash", ["-c", `cd "${root}"\n${cmd} 2>/dev/null || true`], {
      encoding: "utf-8",
    });
    expect(out).toContain(".md");
    expect(out).not.toContain("archive/");
  });
});
