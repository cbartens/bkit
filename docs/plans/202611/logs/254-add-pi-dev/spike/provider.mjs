import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("runtime/provider");
mkdirSync(root, { recursive: true });
writeFileSync(resolve(root, "AGENTS.md"), "Read only the probe fixture.\n");
writeFileSync(resolve(root, "README.md"), "Probe fixture.\n");
const pi = resolve("runtime/node_modules/.bin/pi");
const extension = resolve("lifecycle.mjs");
const env = {
  PATH: process.env.PATH,
  PI_CODING_AGENT_DIR: resolve("runtime/pi-agent"),
  PI_TELEMETRY: "0",
  OPENROUTER_API_KEY: process.env.BKIT_OPENROUTER_API_KEY,
};
const settings = resolve("runtime/pi-agent/settings.json");
mkdirSync(resolve(settings, ".."), { recursive: true });
writeFileSync(settings, JSON.stringify({ retry: { enabled: false } }));

for (const [model, thinking] of [
  ["deepseek/deepseek-v4.1-flash-1017", "max"],
  ["openai/gpt-6.1-sol", "medium"],
  ["openai/gpt-6.1-sol", "high"],
]) {
  const result = spawnSync(
    pi,
    [
      "--provider",
      "openrouter",
      "--model",
      model,
      "--thinking",
      thinking,
      "--mode",
      "json",
      "--no-session",
      "--no-extensions",
      "--no-mcp",
      "--tools",
      "read",
      "--extension",
      extension,
      "--",
      "Call the read tool on README.md once, then reply OK.",
    ],
    { cwd: root, env, encoding: "utf8", timeout: 10000 },
  );
  const records = result.stdout.trim().split("\n").filter(Boolean).map(JSON.parse);
  const terminal = records.findLast(
    (r) => r.type === "message_end" && r.message.role === "assistant",
  );
  const readCalls = records.filter(
    (r) => r.type === "tool_execution_start" && r.toolName === "read",
  ).length;
  for (const line of result.stderr.split("\n").filter((line) => line.startsWith('{"probe":'))) {
    console.log(line);
  }
  console.log(
    JSON.stringify({
      selection: { model, thinking },
      readCalls,
      stopReason: terminal?.message.stopReason ?? null,
      error:
        terminal?.message.errorMessage?.replace(/sk-or-v1-[a-f\d]+/gi, "[redacted]") ??
        result.error?.code ??
        null,
      exit: result.status,
    }),
  );
}
