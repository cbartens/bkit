import { writeSync } from "node:fs";

export default function probe(pi) {
  pi.on("session_start", (event, ctx) => {
    const readiness = process.env.BKIT_PI_PROBE_REFUSE !== "1";
    writeSync(
      2,
      JSON.stringify({
        probe: "startup",
        reason: event.reason,
        mode: ctx.mode,
        hasUI: ctx.hasUI,
        trusted: ctx.isProjectTrusted(),
        provider: ctx.model?.provider ?? null,
        model: ctx.model?.id ?? null,
        thinking: ctx.thinkingLevel,
        tools: pi.getActiveTools().sort(),
        ownerDecision: ctx.hasUI ? "interactive" : "blocked",
        readiness,
      }) + "\n",
    );
    if (!readiness) process.exit(78);
  });
  pi.on("before_provider_request", () => {
    writeSync(2, '{"probe":"provider_request"}\n');
  });
  pi.on("before_agent_start", (event) => {
    if (process.env.BKIT_PI_PROBE_SKILL !== "1") return;
    const expanded =
      event.prompt.includes("Pi-specific probe skill") && event.prompt.includes("probe-argument");
    writeSync(2, JSON.stringify({ probe: "explicit_skill", expanded }) + "\n");
    process.exit(expanded ? 77 : 76);
  });
  pi.registerCommand("probe-reload", {
    description: "Reload the disposable probe session",
    handler: async (_args, ctx) => ctx.reload(),
  });
}
