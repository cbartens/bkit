// install/hosts.ts — which host modules a consumer has installed.

import * as fs from "node:fs";
import * as path from "node:path";
import type { ModuleFlag } from "../cli.js";

/**
 * Detect which host modules a consumer has installed, by the presence of each host's
 * source-rendered agents directory. `bkit upgrade` re-renders only these hosts — never
 * force-creating an opencode/cursor tree — and setup tips key host-specific advice on them.
 */
export function detectInstalledHostModules(cwd: string): Set<ModuleFlag> {
  const mods = new Set<ModuleFlag>();
  if (fs.existsSync(path.join(cwd, ".claude", "agents"))) mods.add("claude");
  if (fs.existsSync(path.join(cwd, ".cursor", "agents"))) mods.add("cursor");
  if (fs.existsSync(path.join(cwd, ".opencode", "agents"))) mods.add("opencode");
  if (fs.existsSync(path.join(cwd, ".codex", "agents"))) mods.add("codex");
  if (fs.existsSync(path.join(cwd, ".agents", "plugins", "bkit", "plugin.json")))
    mods.add("antigravity");
  return mods;
}
