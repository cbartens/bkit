/**
 * bkit-template-action-pins.test.ts — the shipped CI templates are SHA-pinned but
 * Renovate never sees them.
 *
 * `.github/renovate.json5` puts `.bkit/templates/**` in `ignorePaths`. For every action
 * BOTH the repo's workflows and the templates pin, the SHAs match: bumping the repo pin
 * (or merging a Renovate PR) fails here until the template is bumped alongside it.
 *
 * Scope notes:
 *   - Floating refs (`@v4`, `@main`) fail outright: every third-party `uses:` in
 *     a shipped template is SHA-pinned (`docs/deployments.md` § GitHub Actions
 *     pinning), so the template ships exactly what bkit runs.
 *   - Template-only actions (nothing in `.github/workflows/` uses them) have no
 *     reference pin to compare against and are skipped.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const REPO_WORKFLOWS = path.join(REPO_ROOT, ".github/workflows");
const TEMPLATE_WORKFLOWS = path.join(REPO_ROOT, ".bkit/templates/.github/workflows");

/**
 * Actions held back, with the reason. Remove the entry when the template is bumped.
 */
const HELD_BACK: Record<string, string> = {};

const PIN_RE = /uses:\s*([a-zA-Z0-9._/-]+)@([0-9a-f]{40})\s*#\s*(\S+)/g;

interface Pin {
  sha: string;
  tag: string;
  file: string;
}

/**
 * action name -> every SHA-pinned `uses:` of it under `dir`.
 *
 * A list, not one entry: mid-Renovate-bump the repo legitimately pins one action
 * at two SHAs (a PR touches `ci.yml` before `claude.yml`), and a template pin
 * matching EITHER is a pin the repo demonstrably runs.
 */
function pins(dir: string): Map<string, Pin[]> {
  const out = new Map<string, Pin[]>();
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".yml") && !entry.endsWith(".yaml")) continue;
    const body = fs.readFileSync(path.join(dir, entry), "utf-8");
    for (const m of body.matchAll(PIN_RE)) {
      const list = out.get(m[1]!) ?? [];
      list.push({ sha: m[2]!, tag: m[3]!, file: entry });
      out.set(m[1]!, list);
    }
  }
  return out;
}

const describePins = (list: Pin[]): string =>
  list.map((p) => `${p.tag} (${p.sha.slice(0, 10)}, ${p.file})`).join(" | ");

describe("shipped CI templates track the repo's own action pins", () => {
  it("finds SHA-pinned actions on both surfaces", () => {
    expect(pins(REPO_WORKFLOWS).size).toBeGreaterThan(0);
    expect(pins(TEMPLATE_WORKFLOWS).size).toBeGreaterThan(0);
  });

  it("every template `uses:` is SHA-pinned with a tag comment", () => {
    // Commented-out stubs count: consumers uncomment them as shipped.
    const unpinned: string[] = [];
    for (const entry of fs.readdirSync(TEMPLATE_WORKFLOWS)) {
      if (!entry.endsWith(".yml") && !entry.endsWith(".yaml")) continue;
      const lines = fs.readFileSync(path.join(TEMPLATE_WORKFLOWS, entry), "utf-8").split("\n");
      lines.forEach((line, i) => {
        if (!/uses:\s*[^\s@]+@/.test(line)) return;
        if (/uses:\s*[a-zA-Z0-9._/-]+@[0-9a-f]{40}\s*#\s*\S+/.test(line)) return;
        unpinned.push(`${entry}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(
      unpinned,
      "pin each to `@<40-char-sha> # vX.Y.Z` (`git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'`)",
    ).toEqual([]);
  });

  it("every template pin is one the repo actually runs", () => {
    const repo = pins(REPO_WORKFLOWS);
    const template = pins(TEMPLATE_WORKFLOWS);
    const drifted: string[] = [];

    for (const [action, tpls] of template) {
      const ours = repo.get(action);
      if (!ours) continue; // template-only action — no reference pin
      if (action in HELD_BACK) continue;
      const running = new Set(ours.map((p) => p.sha));
      for (const tpl of tpls) {
        if (running.has(tpl.sha)) continue;
        drifted.push(
          `${action}: template ${tpl.tag} (${tpl.sha.slice(0, 10)}, ${tpl.file}) not among repo pins ${describePins(ours)}`,
        );
      }
    }

    expect(
      drifted,
      "Renovate does not scan .bkit/templates/** — bump the template pin by hand alongside the repo one, or add it to HELD_BACK with a reason",
    ).toEqual([]);
  });

  it("every held-back action is still pinned on both surfaces", () => {
    // Every HELD_BACK entry names an action the templates use.
    const repo = pins(REPO_WORKFLOWS);
    const template = pins(TEMPLATE_WORKFLOWS);
    for (const action of Object.keys(HELD_BACK)) {
      expect(repo.has(action), `HELD_BACK names ${action}, absent from .github/workflows`).toBe(
        true,
      );
      expect(
        template.has(action),
        `HELD_BACK names ${action}, absent from .bkit/templates/.github/workflows`,
      ).toBe(true);
    }
  });

  it("held-back actions have genuinely drifted (drop the entry once they match)", () => {
    const repo = pins(REPO_WORKFLOWS);
    const template = pins(TEMPLATE_WORKFLOWS);
    for (const action of Object.keys(HELD_BACK)) {
      const running = new Set(repo.get(action)!.map((p) => p.sha));
      const stillDrifted = template.get(action)!.some((p) => !running.has(p.sha));
      expect(stillDrifted, `${action} now matches a repo pin — remove it from HELD_BACK`).toBe(
        true,
      );
    }
  });
});
