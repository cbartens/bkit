// install/project-docs.test.ts — Unit tests for project-doc ownership migration and indexing.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stripManagedWrapper } from "./managed-block";
import {
  LEGACY_STARTER_DIGESTS,
  LEGACY_STARTER_SOURCE_REVISION,
  PROJECT_DOC_TOPICS,
  legacyDigest,
  legacyStarterTopic,
  syncProjectDocs,
} from "./project-docs";

const WRAPPED = [
  "<!-- bkit:start -->",
  "",
  "<!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->",
  "",
  "# Noise",
  "",
  "Project text.",
  "",
  "<!-- bkit:end -->",
  "",
].join("\n");

describe("stripManagedWrapper", () => {
  it("removes the wrapper and keeps every other byte", () => {
    const r = stripManagedWrapper(WRAPPED);
    expect(r).toMatchObject({ status: "removed" });
    expect(r.content).toBe("# Noise\n\nProject text.\n");
  });

  it("keeps CRLF line endings", () => {
    const r = stripManagedWrapper(WRAPPED.replace(/\n/g, "\r\n"));
    expect(r.content).toBe("# Noise\r\n\r\nProject text.\r\n");
  });

  it("returns unmarked content as it is", () => {
    expect(stripManagedWrapper("# Noise\n")).toEqual({ status: "none", content: "# Noise\n" });
  });

  it("reports one lone marker, reversed markers and fenced markers as ambiguous", () => {
    expect(stripManagedWrapper("<!-- bkit:start -->\n# X\n")).toMatchObject({
      status: "ambiguous",
      problem: "missing-partner",
    });
    expect(stripManagedWrapper("<!-- bkit:end -->\n# X\n<!-- bkit:start -->\n")).toMatchObject({
      status: "ambiguous",
      problem: "inverted",
    });
    expect(stripManagedWrapper("```\n<!-- bkit:start -->\n```\n")).toMatchObject({
      status: "ambiguous",
      problem: "inside-fence",
    });
  });
});

describe("legacy starter digests", () => {
  it("has a digest for every topic", () => {
    for (const t of PROJECT_DOC_TOPICS) expect(LEGACY_STARTER_DIGESTS[t]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("recognises the real legacy text of a topic at the recorded revision", () => {
    for (const t of ["noise", "architecture", "technology", "observability"] as const) {
      let text: string;
      try {
        text = execFileSync(
          "git",
          ["show", `${LEGACY_STARTER_SOURCE_REVISION}:.bkit/shared/docs/${t}.md`],
          {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          },
        );
      } catch {
        continue; // history not available (shallow clone)
      }
      expect(legacyDigest(text)).toBe(LEGACY_STARTER_DIGESTS[t]);
      expect(legacyStarterTopic(text)).toBe(t);
    }
  });
});

describe("syncProjectDocs", () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "project-docs-"));
    fs.mkdirSync(path.join(root, "docs"));
    fs.mkdirSync(path.join(root, ".agents"));
    fs.writeFileSync(
      path.join(root, ".agents/docs.md"),
      "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n| Document | Scope |\n| --- | --- |\n",
    );
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it("migrates the wrapper and registers a row, then repeats as a no-op", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), WRAPPED);
    const first = syncProjectDocs(root, { dryRun: false });
    expect(first.migrated).toEqual(["docs/noise.md"]);
    expect(fs.readFileSync(path.join(root, "docs/noise.md"), "utf8")).toBe(
      "# Noise\n\nProject text.\n",
    );
    const index = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    expect(index).toContain("docs/noise.md");
    const second = syncProjectDocs(root, { dryRun: false });
    expect(second.migrated).toEqual([]);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(index);
  });

  it("writes nothing on a dry run", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), WRAPPED);
    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    const r = syncProjectDocs(root, { dryRun: true });
    expect(r.migrated).toEqual(["docs/noise.md"]);
    expect(fs.readFileSync(path.join(root, "docs/noise.md"), "utf8")).toBe(WRAPPED);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
  });

  it("keeps an ambiguous wrapper and reports it", () => {
    const text = "<!-- bkit:start -->\n# Noise\n";
    fs.writeFileSync(path.join(root, "docs/noise.md"), text);
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.ambiguous).toEqual([{ path: "docs/noise.md", problem: "missing-partner" }]);
    expect(fs.readFileSync(path.join(root, "docs/noise.md"), "utf8")).toBe(text);
  });

  it("adds no row when an indexed equivalent covers the topic", () => {
    fs.writeFileSync(path.join(root, "docs/noise.md"), "# Noise\n");
    fs.mkdirSync(path.join(root, "docs/other"));
    fs.writeFileSync(path.join(root, "docs/other/noise.md"), "# Our noise\n");
    fs.appendFileSync(
      path.join(root, ".agents/docs.md"),
      "| `docs/other/noise.md` | Equivalent to docs/noise.md |\n",
    );
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual([]);
    expect(r.equivalent).toHaveLength(1);
  });
  it("reports instead of throwing when docs is a regular file", () => {
    fs.rmSync(path.join(root, "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "docs"), "not a directory\n");
    const before = fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8");
    let report: ReturnType<typeof syncProjectDocs> | undefined;
    expect(() => {
      report = syncProjectDocs(root, { dryRun: false });
    }).not.toThrow();
    expect(report!.migrated).toEqual([]);
    expect(report!.registered).toEqual([]);
    expect(report!.unsafe.length).toBeGreaterThan(0);
    for (const u of report!.unsafe) expect(u.path).toMatch(/^docs\/.+\.md$/);
    for (const u of report!.unsafe) expect(u.reason.length).toBeGreaterThan(0);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toBe(before);
  });

  it("registers a present default doc when its only equivalent row points at a missing file", () => {
    fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\n\nReal content.\n");
    fs.appendFileSync(
      path.join(root, ".agents/docs.md"),
      "| `engineering/security.md` | Equivalent to docs/security.md |\n",
    );
    const r = syncProjectDocs(root, { dryRun: false });
    expect(r.registered).toEqual(["docs/security.md"]);
    expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")).toContain(
      "`docs/security.md`",
    );
  });
});
