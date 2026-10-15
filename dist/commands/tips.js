// commands/tips.ts — `bkit tips [--workflow=<name>] [--all]`: print the setup tips that
// apply to this repo. Each workflow passes its name at its close and gets the one tip that
// matters most there; bare `bkit tips` prints the top three. Local checks only, no
// network; prints nothing when no tip fires; exits 0.
import { collectTips, formatTips } from "../checks/tips/index.js";
export function runTipsCommand(all, workflow, cwd = process.cwd()) {
    const output = formatTips(collectTips(cwd).tips, { all, workflow });
    if (output)
        console.log(output);
}
