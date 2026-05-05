import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeTier1, writeTier2, writeTier3, type WriteSet } from "./bkit-tiers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tiers-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const TOKENS = {
  NODE_VERSION: "22",
  DEFAULT_BRANCH: "main",
  PROJECT_NAME: "test-project",
};

// ---------------------------------------------------------------------------
// Tier 1 — fully managed (idempotent rewrite)
// ---------------------------------------------------------------------------

describe("writeTier1", () => {
  it("writes file when dest missing", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, ".cursor", "hooks.json");
    fs.writeFileSync(src, '{"hooks":[]}\n', "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.existsSync(dst)).toBe(true);
    expect(fs.readFileSync(dst, "utf-8")).toBe('{"hooks":[]}\n');
    expect(ws.writes).toHaveLength(1);
    expect(ws.writes[0]!.path).toBe(dst);
  });

  it("rewrites file when dest exists with different content (idempotent rewrite)", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    fs.writeFileSync(src, '{"hooks":["new"]}\n', "utf-8");
    fs.writeFileSync(dst, '{"hooks":["old"]}\n', "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.readFileSync(dst, "utf-8")).toBe('{"hooks":["new"]}\n');
    expect(ws.writes).toHaveLength(1);
  });

  it("no-op when dest matches src (idempotent — no double-count)", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    const content = '{"hooks":[]}\n';
    fs.writeFileSync(src, content, "utf-8");
    fs.writeFileSync(dst, content, "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(ws.writes).toHaveLength(0);
  });

  it("substitutes tokens in dest content", () => {
    const src = path.join(tmpDir, "tpl.yml");
    const dst = path.join(tmpDir, "out.yml");
    fs.writeFileSync(src, "node: {{NODE_VERSION}}\n", "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, false, ws);

    expect(fs.readFileSync(dst, "utf-8")).toBe("node: 22\n");
  });

  it("dry-run does not write to disk but records write in WriteSet", () => {
    const src = path.join(tmpDir, "hooks.json");
    const dst = path.join(tmpDir, "hooks-out.json");
    fs.writeFileSync(src, '{"hooks":[]}\n', "utf-8");
    const ws = makeWriteSet();

    writeTier1(src, dst, TOKENS, true, ws);

    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Tier 2 — managed-block (append if no markers, update if markers present)
// ---------------------------------------------------------------------------

describe("writeTier2 — html-comment markers", () => {
  it("appends block at EOF when dest exists with no markers (consumer content preserved)", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "CLAUDE.md");
    const templateBlock = "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    fs.writeFileSync(src, templateBlock, "utf-8");
    fs.writeFileSync(dst, "# Consumer heading\n\nConsumer content.\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("# Consumer heading");
    expect(result).toContain("Consumer content.");
    expect(result).toContain("<!-- bkit:start -->");
    expect(result).toContain("bkit content");
    expect(result).toContain("<!-- bkit:end -->");
    expect(ws.writes).toHaveLength(1);
  });

  it("updates only bkit block when dest already has markers", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "CLAUDE.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nnew block content\n<!-- bkit:end -->\n", "utf-8");
    fs.writeFileSync(
      dst,
      "# Consumer\n\n<!-- bkit:start -->\nold block\n<!-- bkit:end -->\n\nConsumer extras.\n",
      "utf-8",
    );
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("# Consumer");
    expect(result).toContain("Consumer extras.");
    expect(result).toContain("new block content");
    expect(result).not.toContain("old block");
    expect(ws.writes).toHaveLength(1);
  });

  it("writes whole file when dest is missing", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "new-file.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", false, ws);

    expect(fs.existsSync(dst)).toBe(true);
    expect(fs.readFileSync(dst, "utf-8")).toContain("bkit block");
    expect(ws.writes).toHaveLength(1);
  });

  it("dry-run records write without touching disk", () => {
    const src = path.join(tmpDir, "tpl.md");
    const dst = path.join(tmpDir, "new-file.md");
    fs.writeFileSync(src, "<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "html-comment", true, ws);

    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});

describe("writeTier2 — hash-comment markers", () => {
  it("appends block at EOF of existing YAML file with no markers (consumer jobs preserved)", () => {
    const src = path.join(tmpDir, "ci.yml");
    const dst = path.join(tmpDir, "ci-out.yml");
    const templateBlock = "# bkit:start\nbkit-gates:\n  steps: []\n# bkit:end\n";
    fs.writeFileSync(src, templateBlock, "utf-8");
    fs.writeFileSync(
      dst,
      "on: push\njobs:\n  consumer-job:\n    runs-on: ubuntu-latest\n    steps: []\n",
      "utf-8",
    );
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "hash-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("consumer-job:");
    expect(result).toContain("# bkit:start");
    expect(result).toContain("bkit-gates:");
    expect(result).toContain("# bkit:end");
    expect(ws.writes).toHaveLength(1);
  });

  it("updates bkit block when dest YAML already has hash-comment markers", () => {
    const src = path.join(tmpDir, "ci.yml");
    const dst = path.join(tmpDir, "ci-out.yml");
    fs.writeFileSync(src, "# bkit:start\nnew-step: true\n# bkit:end\n", "utf-8");
    fs.writeFileSync(dst, "# bkit:start\nold-step: true\n# bkit:end\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "hash-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("new-step: true");
    expect(result).not.toContain("old-step: true");
    expect(ws.writes).toHaveLength(1);
  });

  it("substitutes tokens inside the appended block", () => {
    const src = path.join(tmpDir, "ci.yml");
    const dst = path.join(tmpDir, "ci-out.yml");
    fs.writeFileSync(src, "# bkit:start\nnode-version: {{NODE_VERSION}}\n# bkit:end\n", "utf-8");
    fs.writeFileSync(dst, "# existing yaml\n", "utf-8");
    const ws = makeWriteSet();

    writeTier2(src, dst, TOKENS, "hash-comment", false, ws);

    const result = fs.readFileSync(dst, "utf-8");
    expect(result).toContain("node-version: 22");
    expect(result).not.toContain("{{NODE_VERSION}}");
  });
});

// ---------------------------------------------------------------------------
// Tier 3 — seed-or-print
// ---------------------------------------------------------------------------

describe("writeTier3", () => {
  it("writes file when dest is absent", () => {
    const src = path.join(tmpDir, "slop-scan.config.json");
    const dst = path.join(tmpDir, "slop-scan-out.json");
    fs.writeFileSync(src, '{"patterns":[]}\n', "utf-8");
    const printSink: string[] = [];
    const ws = makeWriteSet();

    const result = writeTier3(src, dst, false, printSink, ws);

    expect(result.wrote).toBe(true);
    expect(result.suggested).toBe(false);
    expect(fs.existsSync(dst)).toBe(true);
    expect(ws.writes).toHaveLength(1);
  });

  it("does NOT write when dest exists; pushes suggested diff to printSink", () => {
    const src = path.join(tmpDir, "slop-scan.config.json");
    const dst = path.join(tmpDir, "slop-scan-out.json");
    fs.writeFileSync(src, '{"patterns":["new"]}\n', "utf-8");
    fs.writeFileSync(dst, '{"patterns":["existing"]}\n', "utf-8");
    const printSink: string[] = [];
    const ws = makeWriteSet();

    const result = writeTier3(src, dst, false, printSink, ws);

    expect(result.wrote).toBe(false);
    expect(result.suggested).toBe(true);
    expect(fs.readFileSync(dst, "utf-8")).toBe('{"patterns":["existing"]}\n');
    expect(printSink.length).toBeGreaterThan(0);
    expect(ws.writes).toHaveLength(0);
  });

  it("dry-run: absent file → records would-be write in WriteSet without touching disk", () => {
    const src = path.join(tmpDir, "cfg.json");
    const dst = path.join(tmpDir, "cfg-out.json");
    fs.writeFileSync(src, '{"a":1}\n', "utf-8");
    const printSink: string[] = [];
    const ws = makeWriteSet();

    const result = writeTier3(src, dst, true, printSink, ws);

    expect(result.wrote).toBe(false); // dry-run: didn't actually write
    expect(result.suggested).toBe(false);
    expect(fs.existsSync(dst)).toBe(false);
    expect(ws.writes).toHaveLength(1);
  });
});
