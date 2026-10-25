/**
 * Owner waits — the wiring half.
 *
 * The harvest times each wait for the owner from the run's `owner-pause` and
 * `owner-answer` status rows (`scripts/harvest/bkit-harvest.mjs`, run `owner`).
 * A workflow that ends its turn for the owner's answers without writing
 * `owner-pause` hides that wait inside a step's minutes; one that never writes
 * `owner-answer` leaves the stop open for the rest of the run.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const WORKFLOWS_DIR = path.join(REPO_ROOT, ".bkit/core/workflows");
const REASONS = new Set(["decision", "grill", "draft", "loop", "assumed", "merge"]);

const workflows = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((name) => ({ name, content: fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8") }));

const waits = (content: string) =>
  content.split("\n").filter((l) => /end turn → wait for (answers|the answer)/.test(l));

describe("every owner wait writes owner-pause and owner-answer", () => {
  it("finds the owner waits (not vacuous)", () => {
    expect(workflows.filter((w) => waits(w.content).length > 0).map((w) => w.name)).toEqual([
      "bkit-build.md",
      "bkit-debug.md",
      "bkit-design.md",
      "bkit-ship.md",
    ]);
  });

  for (const { name, content } of workflows) {
    if (waits(content).length === 0) continue;
    const workflow = name.replace(/^bkit-|\.md$/g, "");

    it(`${name}: each wait records it before the turn ends`, () => {
      expect(waits(content).filter((l) => !/record the wait[^→]*→ end turn/i.test(l))).toEqual([]);
    });

    it(`${name}: writes owner-pause with a known reason and owner-answer`, () => {
      const pause = [
        ...content.matchAll(/--workflow=(\w+) --type=owner-pause --field=reason=(\w+)/g),
      ];
      expect(pause.length).toBeGreaterThan(0);
      for (const [, wf, reason] of pause) {
        expect(wf).toBe(workflow);
        expect(REASONS.has(reason!)).toBe(true);
      }
      expect(content).toContain(
        `"{BKIT}" status row --file="{STATUS}" --workflow=${workflow} --type=owner-answer`,
      );
    });
  }
});
