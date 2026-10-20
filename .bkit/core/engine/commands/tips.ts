// commands/tips.ts — `bkit tips [--workflow=<name>] [--all]`: print the setup tips that
// apply to this repo. Each workflow passes its name at its close and gets the one tip that
// matters most there (`audit` / `utility` for the audit agent and the ledger / roadmap
// updaters); bare `bkit tips` prints the top three. The star line closes bare and phase
// output unless `bkit-star` is in `bkit.ignoreAdvisories`. Local checks only, no network; prints
// nothing when no tip fires and no star line shows; exits 0. What the last disk clean-up left
// for the person to decide (`bkit disk prune` notes) comes first, outside the tip cap.

import type { TipsContext } from "../cli.js";
import { collectTips, formatTips } from "../checks/tips/index.js";
import { formatNotes, readNotes } from "./workflow/disk.js";

export function runTipsCommand(
  all: boolean,
  workflow: TipsContext | null,
  cwd: string = process.cwd(),
): void {
  const { tips, star } = collectTips(cwd);
  const output = [formatNotes(readNotes(cwd)), formatTips(tips, { all, workflow, star })]
    .filter((part) => part !== "")
    .join("\n\n");
  if (output) console.log(output);
}
