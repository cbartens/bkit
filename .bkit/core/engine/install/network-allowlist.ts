// install/network-allowlist.ts — `.bkit/allowlist.json`, the resolved network allowlist
// (shipped egress registry ∪ consumer `allowed-domains`) the guardrails hooks of Claude,
// Cursor, Codex and Antigravity read at runtime to host-check shell curl / wget. Core
// owns it: install (runCoreModule) and upgrade (renderManagedOutputs) both write it, so
// it exists for every host that reads it and `bkit check` reports it missing or stale.

import * as fs from "node:fs";
import * as path from "node:path";
import { resolveNetworkAllowlist } from "./cloud-env.js";
import { readBkitVersion } from "./version-file.js";
import type { WriteSet } from "./write.js";

/** Consumer-relative path of the install-written curl/wget allowlist. */
export const NETWORK_ALLOWLIST_RELPATH = path.join(".bkit", "allowlist.json");

/** Where the cursor module wrote the allowlist up to 5.2.4 (migrated away). */
export const RETIRED_NETWORK_ALLOWLIST_RELPATH = path.join(".cursor", "allowlist.json");

/** The allowlist file body: `{ domains }`, apex + `*.` wildcard per base, sorted. */
export function renderNetworkAllowlist(cwd: string): string {
  return JSON.stringify({ domains: resolveNetworkAllowlist(cwd) }, null, 2) + "\n";
}

/**
 * Write `.bkit/allowlist.json` whole (hand edits do not survive — `allowed-domains` in
 * `.agents/context.md` is the source), then migrate the retired copy. Every change is
 * recorded in `ws` under dry-run too, so `bkit check` fails until install / upgrade runs.
 * Returns the consumer-relative paths changed.
 */
export function writeNetworkAllowlist(
  cwd: string,
  dryRun: boolean,
  ws: WriteSet,
  logPrefix: string,
): string[] {
  const tag = dryRun ? "[dry-run] " : "";
  const changed: string[] = [];
  const abs = path.join(cwd, NETWORK_ALLOWLIST_RELPATH);
  const body = renderNetworkAllowlist(cwd);
  const prev = fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
  if (prev !== body) {
    if (!dryRun) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, body, "utf-8");
    }
    ws.writes.push({ path: NETWORK_ALLOWLIST_RELPATH, action: prev === null ? "write" : "update" });
    changed.push(NETWORK_ALLOWLIST_RELPATH);
    console.log(`${logPrefix} ${tag}core: ${NETWORK_ALLOWLIST_RELPATH}`);
  }
  if (migrateRetiredNetworkAllowlist(cwd, dryRun)) {
    ws.writes.push({ path: RETIRED_NETWORK_ALLOWLIST_RELPATH, action: "write" });
    changed.push(RETIRED_NETWORK_ALLOWLIST_RELPATH);
    console.log(
      `${logPrefix} ${tag}core: removed ${RETIRED_NETWORK_ALLOWLIST_RELPATH} (moved to ${NETWORK_ALLOWLIST_RELPATH})`,
    );
  }
  return changed;
}

/**
 * Migration (installs up to 5.2.4, `docs/migrations.md`): delete `.cursor/allowlist.json`
 * when `.bkit/version` records its hash — bkit wrote it and owned it whole. A file bkit
 * never recorded is left alone. Returns whether the file is (or, under dry-run, would be)
 * removed. The stale hash entry is pruned by the `.bkit/version` writer.
 */
function migrateRetiredNetworkAllowlist(cwd: string, dryRun: boolean): boolean {
  const abs = path.join(cwd, RETIRED_NETWORK_ALLOWLIST_RELPATH);
  if (!fs.existsSync(abs)) return false;
  const hashes = readBkitVersion(path.join(cwd, ".bkit", "version"))?.canonicalHashes ?? {};
  if (hashes[RETIRED_NETWORK_ALLOWLIST_RELPATH] === undefined) return false;
  if (!dryRun) fs.rmSync(abs);
  return true;
}
