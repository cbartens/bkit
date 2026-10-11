// commands/telemetry.ts — `bkit telemetry <sub-verb>`: the telemetry summary every workflow's close step prints.
import * as fs from "node:fs";
import * as path from "node:path";
import { workflowTelemetry, foldFrom } from "../ledgers/telemetry.js";
// telemetry — sub-verb dispatcher. Advisory: exits 0 on failure after printing the
// error (fail-open pattern).
export function runTelemetryCommand(telemetrySubverb, complyPhase) {
    try {
        // `bkit telemetry summary [--phase <workflow>]` — THE telemetry summary, for
        // every workflow's close step.
        if (telemetrySubverb === "summary") {
            const statsPath = path.join(process.cwd(), ".bkit", "stats.jsonl");
            if (!fs.existsSync(statsPath)) {
                console.log("[bkit-telemetry] stats.jsonl not found — no telemetry rows yet");
                return;
            }
            const summary = workflowTelemetry(foldFrom([statsPath]), complyPhase ?? undefined);
            for (const line of summary.lines)
                console.log(line);
        }
        else {
            console.error(`[bkit] \`bkit telemetry\` requires a sub-verb. Valid values: summary`);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[bkit-telemetry] internal error (fail-open): ${msg}`);
    }
}
