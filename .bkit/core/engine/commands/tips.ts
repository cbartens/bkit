// commands/tips.ts — `bkit tips [--workflow=<name>] [--all]`: print the setup tips that
// apply to this repo. Each workflow passes its name at its close and gets the one tip that
// matters most there (`audit` / `utility` for the audit agent and the ledger / roadmap
// updaters); bare `bkit tips` prints the top three. The star line closes bare and phase
// output unless `bkit-star` is in `bkit.advisories.ignore`. Local checks only, no network; prints
// nothing when no tip fires and no star line shows; exits 0. What the last disk clean-up left
// for the person to decide (`bkit disk prune` notes) comes first, outside the tip cap.

import type { TipsContext } from "../cli.js";
import { collectTips, formatTips } from "../checks/tips/index.js";
import { formatNotes, readNotes } from "./workflow/disk.js";

/** What `bkit tips` prints: disk-prune notes, then the tips; "" when nothing applies. */
export function tipsText(all: boolean, workflow: TipsContext | null, cwd: string): string {
  const { tips, star } = collectTips(cwd);
  return [formatNotes(readNotes(cwd)), formatTips(tips, { all, workflow, star })]
    .filter((part) => part !== "")
    .join("\n\n");
}

export function runTipsCommand(
  all: boolean,
  workflow: TipsContext | null,
  cwd: string = process.cwd(),
): void {
  const output = tipsText(all, workflow, cwd);
  if (output) console.log(output);
}
