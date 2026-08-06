/**
 * bkit-template-action-pins.test.ts — the shipped CI templates are SHA-pinned but
 * Renovate never sees them.
 *
 * `.github/renovate.json5` puts `.bkit/templates/**` in `ignorePaths`, which is
 * correct for consumers (bkit owns those files; new SHAs arrive via `bkit install`)
 * but leaves bkit itself with no bot watching them. The repo's own workflows get
 * bumped weekly; the templates they were copied from silently rot, and the drift
 * only surfaces when a consumer's CI breaks on an action bkit stopped testing
 * years earlier. The template snapshot pins the stale value as expected output, so
 * nothing else fails either.
 *
 * This test is that watcher: for every action BOTH surfaces pin, the SHAs must
 * match. Bumping the repo pin (or merging a Renovate PR) now fails here until the
 * template is bumped alongside it.
 *
 * Scope notes:
 *   - Floating tags (`@v4`) are out of scope — `bkit-cloud.yml` uses them by
 *     design on both sides (`docs/deployments.md` § GitHub Actions pinning).
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
 * Actions deliberately held back, with the reason. An entry here is a decision on
 * record, not an oversight — which is the whole difference this test buys. Remove
 * the entry when the template is bumped.
 */
const HELD_BACK: Record<string, string> = {
  "actions/setup-node":
    "repo pins v7 with `node-version-file: .nvmrc`; the template passes `node-version: {{NODE_VERSION}}`, so the v6 -> v7 major needs verifying against that input before it ships to consumers",
};

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
    // A stale HELD_BACK entry would silently exempt an action nobody uses.
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
