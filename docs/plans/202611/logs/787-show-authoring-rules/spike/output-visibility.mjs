import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
for (const name of ["codex-edit-workspace", "cursor-edit-workspace", "cursor-shell-workspace"]) {
  const directory = path.join(root, name);
  const outputPath = path.join(directory, "host-output.txt");
  const errorPath = path.join(directory, "host-stderr.txt");
  const raw = fs.readFileSync(outputPath, "utf8");
  const stderr = fs.readFileSync(errorPath, "utf8");
  const events = raw.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  const hookEvents = fs.existsSync(path.join(directory, "hook-events.jsonl"))
    ? fs.readFileSync(path.join(directory, "hook-events.jsonl"), "utf8").trim().split("\n").filter(Boolean).length
    : 0;
  const summary = {
    case: name,
    hookEvents,
    sentinel: fs.readFileSync(path.join(directory, "sentinel.txt"), "utf8"),
    markerExists: fs.existsSync(path.join(directory, "received-marker.txt")),
    hostEvents: events.map((event) => ({ type: event.type, itemType: event.item?.type || null })),
    authRequired: stderr.includes("Authentication required"),
    outputLimitAttempted: false,
    outputLimitStatus: "BLOCKED: no live advisory hook was observed",
  };
  fs.writeFileSync(path.join(directory, "observations.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary));
  fs.unlinkSync(outputPath);
  fs.unlinkSync(errorPath);
}
