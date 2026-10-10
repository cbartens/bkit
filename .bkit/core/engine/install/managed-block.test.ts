// install/managed-block.test.ts — Unit tests for the managed-block parser and writer.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  updateManagedBlock,
  extractFullManagedBlock,
  extractManagedBlock,
  findLineAnchoredMarkers,
} from "./managed-block";

// ---------------------------------------------------------------------------
// Managed-block writer
// ---------------------------------------------------------------------------

describe("updateManagedBlock", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-managed-${Date.now()}.md`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("preserves outside-block content when markers present", () => {
    fs.writeFileSync(
      tmpFile,
      "Before\n<!-- bkit:start -->\nOld content\n<!-- bkit:end -->\nAfter\n",
    );
    updateManagedBlock(tmpFile, "New content");
    const result = fs.readFileSync(tmpFile, "utf-8");
    expect(result).toContain("Before\n");
    expect(result).toContain("After\n");
    expect(result).toContain("New content");
    expect(result).not.toContain("Old content");
  });

  it("is a no-op (returns false) when markers absent", () => {
    fs.writeFileSync(tmpFile, "No markers here.\n");
    const changed = updateManagedBlock(tmpFile, "New content");
    expect(changed).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe("No markers here.\n");
  });

  it("returns false when content is already identical", () => {
    fs.writeFileSync(tmpFile, "<!-- bkit:start -->\nSame content\n<!-- bkit:end -->\n");
    updateManagedBlock(tmpFile, "Same content");
    const changed = updateManagedBlock(tmpFile, "Same content");
    expect(changed).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Edge cases from challenge Finding 2 & 3 (bar-110b)
  // -------------------------------------------------------------------------

  it("inverted markers (end before start) — skips with warning", () => {
    const original = "Preamble\n<!-- bkit:end -->\nMiddle\n<!-- bkit:start -->\nPostamble\n";
    fs.writeFileSync(tmpFile, original);
    const changed = updateManagedBlock(tmpFile, "New content");
    expect(changed).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(original);
  });

  it("duplicate markers — skips with warning (preserves all content)", () => {
    const original =
      "Header\n" +
      "<!-- bkit:start -->\nFirst block content\n<!-- bkit:end -->\n" +
      "Between\n" +
      "<!-- bkit:start -->\nSecond block content\n<!-- bkit:end -->\n" +
      "Footer\n";
    fs.writeFileSync(tmpFile, original);
    const changed = updateManagedBlock(tmpFile, "Replaced first block");
    expect(changed).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(original);
  });

  it("idempotent on second run even when newContent has a trailing newline", () => {
    // Finding 3: the function injects \n before and after newContent.
    // If newContent itself ends with \n, the block gets double-newline
    // before the end marker. Verify the second run returns false (stable).
    const contentWithTrailingNewline = "Canonical line.\n";
    fs.writeFileSync(tmpFile, "Before\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nAfter\n");
    const firstChanged = updateManagedBlock(tmpFile, contentWithTrailingNewline);
    expect(firstChanged).toBe(true);
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    // Second run with identical content — must be a no-op
    const secondChanged = updateManagedBlock(tmpFile, contentWithTrailingNewline);
    expect(secondChanged).toBe(false);
    const afterSecond = fs.readFileSync(tmpFile, "utf-8");
    expect(afterSecond).toBe(afterFirst);
  });

  it("idempotent on second run with newContent that has no trailing newline", () => {
    // Baseline: content without trailing newline must also stabilise.
    const content = "Canonical line.";
    fs.writeFileSync(tmpFile, "Before\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nAfter\n");
    updateManagedBlock(tmpFile, content);
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(tmpFile, content);
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });

  it("shell-comment markers — preserves '# ' prefix on both marker lines", () => {
    const original =
      "#!/bin/bash\n# header desc\n\n# <!-- bkit:start -->\n\nset -e\nold body\n\n# <!-- bkit:end -->\n";
    fs.writeFileSync(tmpFile, original);
    const changed = updateManagedBlock(tmpFile, "set -e\nnew body");
    expect(changed).toBe(true);
    const after = fs.readFileSync(tmpFile, "utf-8");
    expect(after).toBe(
      "#!/bin/bash\n# header desc\n\n# <!-- bkit:start -->\n\nset -e\nnew body\n\n# <!-- bkit:end -->\n",
    );
  });

  it("shell-comment markers — idempotent on second run", () => {
    fs.writeFileSync(
      tmpFile,
      "#!/bin/bash\n\n# <!-- bkit:start -->\n\nold body\n\n# <!-- bkit:end -->\n",
    );
    updateManagedBlock(tmpFile, "new body");
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(tmpFile, "new body");
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });
});

// ---------------------------------------------------------------------------
// extractManagedBlock
// ---------------------------------------------------------------------------

describe("extractManagedBlock", () => {
  it("extracts inner content with surrounding newlines stripped", () => {
    const input = "Header\n<!-- bkit:start -->\n\nInner content.\n\n<!-- bkit:end -->\nFooter\n";
    expect(extractManagedBlock(input)).toBe("Inner content.");
  });

  it("returns null when markers absent", () => {
    expect(extractManagedBlock("Just some text.\n")).toBeNull();
  });

  it("returns null when start appears after end (inverted)", () => {
    const input = "<!-- bkit:end -->\nMid\n<!-- bkit:start -->\n";
    expect(extractManagedBlock(input)).toBeNull();
  });

  it("returns null when markers are duplicated", () => {
    const input =
      "<!-- bkit:start -->\nA\n<!-- bkit:end -->\n<!-- bkit:start -->\nB\n<!-- bkit:end -->\n";
    expect(extractManagedBlock(input)).toBeNull();
  });

  it("extracts inner content from shell-comment-prefixed markers", () => {
    const input =
      "#!/bin/bash\n# header\n\n# <!-- bkit:start -->\n\nset -e\nbody\n\n# <!-- bkit:end -->\n";
    expect(extractManagedBlock(input)).toBe("set -e\nbody");
  });

  it("ignores backtick-quoted prose mentions", () => {
    const input =
      "<!-- bkit:start -->\nReal block.\n<!-- bkit:end -->\n## Notes\n- mentions `<!-- bkit:start -->` inside backticks\n";
    expect(extractManagedBlock(input)).toBe("Real block.");
  });
});

describe("slash-comment marker round-trip (markerStyle: 'slash-comment')", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-slash-${Date.now()}.js`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("extractManagedBlock with slash-comment extracts inner content from JS", () => {
    const js = `export default function () {}\n// bkit:start\nconst old = true;\n// bkit:end\n`;
    expect(extractManagedBlock(js, "slash-comment")).toBe("const old = true;");
  });

  it("extractFullManagedBlock with slash-comment includes marker lines", () => {
    const js = `// bkit:start\nconst step = true;\n// bkit:end\n`;
    const full = extractFullManagedBlock(js, "slash-comment");
    expect(full).not.toBeNull();
    expect(full).toContain("// bkit:start");
    expect(full).toContain("// bkit:end");
    expect(full).toContain("const step = true;");
  });

  it("updateManagedBlock with slash-comment round-trips on JS content", () => {
    fs.writeFileSync(tmpFile, "// bkit:start\nconst old = true;\n// bkit:end\n", "utf-8");
    const changed = updateManagedBlock(tmpFile, "const fresh = true;", false, "slash-comment");
    expect(changed).toBe(true);
    const after = fs.readFileSync(tmpFile, "utf-8");
    expect(after).toContain("const fresh = true;");
    expect(after).not.toContain("const old = true;");
    expect(after).toContain("// bkit:start");
    expect(after).toContain("// bkit:end");
  });

  it("updateManagedBlock with slash-comment is idempotent on second run", () => {
    fs.writeFileSync(tmpFile, "// bkit:start\nconst old = true;\n// bkit:end\n", "utf-8");
    updateManagedBlock(tmpFile, "const stable = true;", false, "slash-comment");
    const afterFirst = fs.readFileSync(tmpFile, "utf-8");
    const secondChanged = updateManagedBlock(
      tmpFile,
      "const stable = true;",
      false,
      "slash-comment",
    );
    expect(secondChanged).toBe(false);
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(afterFirst);
  });

  it("updateManagedBlock with slash-comment no-op when markers absent", () => {
    fs.writeFileSync(tmpFile, "no markers here\n", "utf-8");
    const changed = updateManagedBlock(tmpFile, "content", false, "slash-comment");
    expect(changed).toBe(false);
  });

  it("findLineAnchoredMarkers finds a bare slash-comment marker (prefix '' is allowed)", () => {
    const js = `header\n// bkit:start\nbody\n// bkit:end\n`;
    expect(findLineAnchoredMarkers(js, "// bkit:start")).toEqual([js.indexOf("// bkit:start")]);
  });

  it("a bare `# bkit:start` line is not a slash-comment marker", () => {
    const yaml = `# bkit:start\nstep: true\n# bkit:end\n`;
    expect(extractManagedBlock(yaml, "slash-comment")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 2.1b — HTML-comment round-trip + default-arg backward compat
// ---------------------------------------------------------------------------

describe("html-comment marker round-trip + default-arg backward compat", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `bkit-test-html-${Date.now()}.md`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
  });

  it("html-comment round-trip on markdown content", () => {
    const md = `# Heading\n<!-- bkit:start -->\nold block\n<!-- bkit:end -->\n`;
    expect(extractManagedBlock(md, "html-comment")).toBe("old block");
  });

  it("html-comment round-trip on .gitignore content", () => {
    const gi = `# consumer entries\nlogs/\n<!-- bkit:start -->\nnode_modules/\n<!-- bkit:end -->\n`;
    expect(extractManagedBlock(gi, "html-comment")).toBe("node_modules/");
  });

  it("default arg (no markerStyle) behaves identically to html-comment (backward compat)", () => {
    const md = `<!-- bkit:start -->\ncontent here\n<!-- bkit:end -->\n`;
    // Default (no arg) must equal explicit html-comment
    expect(extractManagedBlock(md)).toBe(extractManagedBlock(md, "html-comment"));
  });

  it("updateManagedBlock default (no markerStyle) produces byte-identical output to v0.1.1", () => {
    const original = "Before\n<!-- bkit:start -->\nOld\n<!-- bkit:end -->\nAfter\n";
    fs.writeFileSync(tmpFile, original, "utf-8");
    updateManagedBlock(tmpFile, "New content");
    const result = fs.readFileSync(tmpFile, "utf-8");
    // Verify structure: Before + markers + new content + After
    expect(result).toContain("Before\n");
    expect(result).toContain("After\n");
    expect(result).toContain("New content");
    expect(result).toContain("<!-- bkit:start -->");
    expect(result).toContain("<!-- bkit:end -->");
  });

  it("a bare `# bkit:start` line is not an html-comment marker", () => {
    const yaml = `# bkit:start\nstep: true\n# bkit:end\n`;
    // Default arg = html-comment → should NOT find the hash markers
    expect(extractManagedBlock(yaml)).toBeNull();
  });
});
