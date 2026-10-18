// commands/tips.ts — `bkit tips [--workflow=<name>] [--all]`: print the setup tips that
// apply to this repo. Each workflow passes its name at its close and gets the one tip that
// matters most there; bare `bkit tips` prints the top three. The star line closes the output
// unless `star` is in `bkit.ignoreAdvisories`. Local checks only, no network; prints nothing
// when no tip fires and the star line is silenced; exits 0.

import type { ComplyPhase } from "../cli.js";
import { collectTips, formatTips } from "../checks/tips/index.js";

export function runTipsCommand(
  all: boolean,
  workflow: ComplyPhase | null,
  cwd: string = process.cwd(),
): void {
  const { tips, star } = collectTips(cwd);
  const output = formatTips(tips, { all, workflow, star });
  if (output) console.log(output);
}
