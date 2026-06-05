import { describe, it, expect, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// Contract + behaviour test for the `slop:delta` gate (scripts/tooling/slop-delta.sh).
//
// The gate fails on NET worsening — `summary.netFindingCount` / `summary.netRepoScore` —
// NOT on raw "added" occurrences. slop-scan 0.3.0's delta is position-keyed, so a pure
// line-shift of a pre-existing finding reports as resolved@old + added@new at net zero;
// gating on raw "added" would false-positive on innocent edits (it did — see #226).
//
// Why this test exists: the helper reads those fields with a `|| 0` fallback. If a
// slop-scan upgrade renames or drops them, the fallback would SILENTLY turn the gate into
// a no-op — the exact dead-gate class #226 set out to kill, with no signal. This pins the
// contract so that schema drift fails loudly here instead.

const tmpDirs: string[] = [];
function mkTmp(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "slop-gate-"));
  tmpDirs.push(d);
  return d;
}
afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
});

function deltaSummary(base: string, head: string): Record<string, number> {
  const out = execFileSync(
    "npx",
    ["--no-install", "slop-scan", "delta", "--base", base, "--head", head, "--json"],
    { encoding: "utf8" },
  );
  return JSON.parse(out).summary;
}

// Mirror of the gate decision in scripts/tooling/slop-delta.sh (the node snippet).
function gateFails(s: Record<string, number>): boolean {
  return (s.netFindingCount || 0) > 0 || (s.netRepoScore || 0) > 0.001;
}

const CLEAN = "export function load(p: string) {\n  return JSON.parse(p);\n}\n";
const EMPTY_CATCH = "export function risky() {\n  try {\n    doThing();\n  } catch (e) {}\n}\n";

describe("slop:delta gate — net-delta contract (scripts/tooling/slop-delta.sh)", () => {
  it("slop-scan delta --json exposes the summary fields the helper gates on", () => {
    const base = mkTmp();
    const head = mkTmp();
    fs.writeFileSync(path.join(base, "x.ts"), CLEAN);
    fs.writeFileSync(path.join(head, "x.ts"), CLEAN);
    const s = deltaSummary(base, head);
    // If any of these go missing, the helper's `|| 0` silently disables the gate.
    for (const field of ["netFindingCount", "netRepoScore", "addedCount", "resolvedCount"]) {
      expect(s, `slop-scan delta --json must expose summary.${field}`).toHaveProperty(field);
    }
  });

  it("a genuinely new finding raises the net count → gate FAILS", () => {
    const base = mkTmp();
    const head = mkTmp();
    fs.writeFileSync(path.join(base, "x.ts"), CLEAN);
    fs.writeFileSync(path.join(head, "x.ts"), CLEAN);
    fs.writeFileSync(path.join(head, "y.ts"), EMPTY_CATCH); // net-new empty catch
    const s = deltaSummary(base, head);
    expect(s.netFindingCount).toBeGreaterThan(0);
    expect(gateFails(s)).toBe(true);
  });

  it("an identical tree nets to zero → gate PASSES", () => {
    const base = mkTmp();
    const head = mkTmp();
    fs.writeFileSync(path.join(base, "x.ts"), CLEAN);
    fs.writeFileSync(path.join(head, "x.ts"), CLEAN);
    const s = deltaSummary(base, head);
    expect(s.netFindingCount).toBe(0);
    expect(gateFails(s)).toBe(false);
  });

  it("a pre-existing finding that merely moves nets to zero → gate PASSES (the #226 fix)", () => {
    // Same empty catch in both trees, shifted down by lines added above it. Position-keyed
    // delta may report this as added@new + resolved@old, but the NET is zero — and the gate
    // must not fire. Whether slop-scan sees it as moved or unchanged, net stays zero.
    const base = mkTmp();
    const head = mkTmp();
    fs.writeFileSync(path.join(base, "y.ts"), EMPTY_CATCH);
    fs.writeFileSync(path.join(head, "y.ts"), "// new line one\n// new line two\n" + EMPTY_CATCH);
    const s = deltaSummary(base, head);
    expect(s.netFindingCount).toBe(0);
    expect(gateFails(s)).toBe(false);
  });
});
