// install/modules/opencode.ts — the opencode host module: `.opencode/` agents and commands, and
// the provider-templated `opencode.json`.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  writeTier2,
  deepMergeJson,
  ensureDir,
  isJsonObject,
  mergeTrackerEntry,
  type WriteSet,
  type JsonValue,
} from "../write.js";
import { stampManagedVersion } from "../version-file.js";
import { applyOpencodeAgent, applyOpencodeCommand } from "../../render/hosts.js";
import type { PreflightFinding } from "../../checks/before/index.js";
import {
  getCoreRoot,
  getSharedRoot,
  getWorkflowsRoot,
  getPromptsRoot,
} from "../../shared/package-roots.js";
import { type IssueTracker, DEFAULT_ISSUE_TRACKER } from "../manifest.js";
import { substituteWorkflow } from "../../render/trackers.js";
import { resolveNetworkAllowlist, extractMcpServers, networkAllowlistBases } from "../cloud-env.js";
import { OPENCODE_PROVIDER_DEFAULTS } from "../../shared/egress.js";
import { parseJson, readJsonFile } from "../../shared/json.js";
import { readBkitConfig } from "../../shared/settings.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import type { ModuleContext } from "./index.js";
import { BKIT_PREFIX, installFile, listMdFiles, removeOrphans, trackMirrorWrite } from "./core.js";
import { isOpencodeProvider, opencodeProviderId } from "../../render/models.js";

export function renderOpencodeAgentsCommands(ctx: ModuleContext): string[] {
  const { dryRun, opencodeModelLookup, effortMap, opencodeProvider, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];
  // The opencode host cannot render without a provider — `--opencode=<provider>` is
  // unary at the CLI; an absent value here throws.
  if (!opencodeProvider) {
    throw new Error("renderOpencodeAgentsCommands: ctx.opencodeProvider is required");
  }
  const provider = opencodeProvider;

  // --- Agents: tracker substitution → applyOpencodeAgent → managed-version stamp (last) ---
  {
    const src = getPromptsRoot();
    const dest = ".opencode/agents";
    // dryRun-gated so `bkit check` stays read-only — installFile/removeOrphans below are
    // already dryRun-guarded, so the dir is only needed for a real write.
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyOpencodeAgent(
            substituteWorkflow(c, issueTracker).output,
            opencodeModelLookup,
            effortMap,
            provider,
          ),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    // dryRun still reports would-deletes into ws.writes so `bkit check` fails on stale mirrors.
    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }

  // --- Commands: tracker substitution + applyOpencodeCommand ---
  {
    const src = getWorkflowsRoot();
    const dest = ".opencode/commands";
    // dryRun-gated (see .opencode/agents above) — `bkit check` stays read-only.
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyOpencodeCommand(substituteWorkflow(c, issueTracker).output),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }
  return written;
}

// ---------------------------------------------------------------------------
// runOpencodeModule — opencode provider-agnostic host (opt-in via --opencode=<provider>)
//
// Additive alongside always-on claude/cursor: .opencode/agents/*.md (via applyOpencodeAgent),
// .opencode/commands/*.md (via applyOpencodeCommand + tracker substitution),
// .opencode/opencode.json (Tier-2 deep-contained), .opencode/plugin/bkit-gateguard.js (Tier-1).
//
// Dir names: .opencode/agents/ and .opencode/commands/ (plural) per opencode.ai/docs.
// Spike initially observed singular; official docs are plural — plural is correct.
//   .opencode/plugin/   (singular, not plugins/)
//
// Provider config is seeded into opencode.json; consumers tune model IDs and provider
// keys after install. opencode.json is Tier-2 deep-contained (ownership-mixed) so bkit
// reconverges its keys on upgrade without clobbering consumer additions (KN-17).
// ---------------------------------------------------------------------------

/**
 * The provider secret env var name for a bkit provider key (`BKIT_OPENROUTER_API_KEY`,
 * `BKIT_OPENCODE_API_KEY`, ...). Empty string for an unknown key. Mirrors
 * {@link opencodeProviderId}; used to compare a self-installed opencode.yml handler's `env:`
 * secret against the installed provider.
 */
export function opencodeProviderEnvVar(providerKey: string): string {
  return isOpencodeProvider(providerKey) ? OPENCODE_PROVIDER_DEFAULTS[providerKey].envVar : "";
}

/**
 * Detect drift between the self-installed `.github/workflows/opencode.yml` reactive `/oc` handler
 * and the installed opencode provider.
 *
 * opencode.yml is NOT bkit-managed: it is self-installed via `opencode github install` (the `/oc`
 * | `/opencode` comment handler — the opencode analogue of the App-generated claude.yml). It
 * HARDCODES two provider-specific values: a `model: <providerId>/<model>` line and a provider
 * secret `env:` var. `bkit install --opencode=<provider>` rewrites neither; this advisory names
 * the hand-edit.
 *
 * bkit-cloud.yml runs `opencode run` against the committed `.opencode/` config and fans one
 * `OPENCODE_PROVIDER_KEY` secret out to every provider env var, so it is not checked.
 *
 * No-op when opencode.yml is absent. No equivalent check for claude.yml (provider-fixed to
 * Claude). Severity "advisory": never gates `bkit check`; surfaces on both check and postinstall.
 */
export function detectOpencodeYmlProviderDrift(cwd: string): PreflightFinding | null {
  const ymlPath = path.join(cwd, ".github", "workflows", "opencode.yml");
  if (!fs.existsSync(ymlPath)) return null;

  // The installed provider — package.json `bkit.opencodeProvider` is the authoritative record
  // written on install. Absent/broken/unsupported → the null-guard below skips silently.
  const provider = readBkitConfig(cwd).opencodeProvider;
  if (!provider) return null;

  const expectedPrefix = opencodeProviderId(provider); // model id form is `<providerId>/<model>`
  const expectedEnvVar = opencodeProviderEnvVar(provider);
  if (!expectedEnvVar) return null; // unknown provider key — no registry entry to compare against.

  const content = fs.readFileSync(ymlPath, "utf-8");

  // The handler's hardcoded `model: <providerId>/<model>` line (opencode `run --model`).
  const ymlModel = content.match(/^\s*model:\s*(\S+)/m)?.[1] ?? null;
  const ymlPrefix = ymlModel ? ymlModel.split("/")[0] : null;
  // The handler's hardcoded provider secret — an `env:` key like BKIT_OPENROUTER_API_KEY / BKIT_OPENCODE_API_KEY.
  const ymlEnvVar = content.match(/^\s*([A-Z][A-Z0-9_]*(?:_API_KEY|_HOST)):/m)?.[1] ?? null;

  // Two independent drift signals. The model prefix is the precise one (it distinguishes the two
  // opencode gateways that share BKIT_OPENCODE_API_KEY); the env var catches a wrong/absent secret.
  const modelDrift = ymlPrefix !== null && ymlPrefix !== expectedPrefix;
  const envDrift = !new RegExp(`\\b${expectedEnvVar}\\b`).test(content);
  if (!modelDrift && !envDrift) return null;

  const foundModel = ymlModel ?? "(none)";
  const foundEnvVar = ymlEnvVar ?? "(none)";

  return {
    id: "opencode-yml-provider-drift",
    severity: "advisory",
    detect:
      ".github/workflows/opencode.yml (the self-installed /oc handler, NOT bkit-managed) is pinned to model `" +
      foundModel +
      "` with secret `" +
      foundEnvVar +
      "`, but the installed opencode provider is `" +
      provider +
      "` (model ids `" +
      expectedPrefix +
      "/<model>`, secret `" +
      expectedEnvVar +
      "`). The reactive handler will call the wrong provider's model and/or authenticate with the wrong (likely-unset) secret. bkit install does not rewrite this file.",
    action:
      "opencode.yml is self-installed via `opencode github install` and is NOT bkit-managed, so `bkit install --opencode=<provider>` will not fix it. Hand-edit the two hardcoded lines to match the installed provider:\n\n" +
      "      env:\n" +
      "        " +
      expectedEnvVar +
      ": ${{ secrets." +
      expectedEnvVar +
      " }}\n" +
      "      with:\n" +
      "        model: " +
      expectedPrefix +
      "/<model>   # a model your provider serves (see .opencode/opencode.json)\n\n" +
      "Keep opencode.yml in sync with .opencode/opencode.json on every provider switch. (bkit-cloud.yml needs no such edit: it reads .opencode/ and fans OPENCODE_PROVIDER_KEY out to every provider env var.)",
  };
}

// Sentinel values used in the opencode.json template for tracker-filtered mcp injection.
const OPENCODE_TRACKER_MCP_SENTINEL = '"@@OPENCODE_TRACKER_MCP@@": {}';

const OPENCODE_PROVIDER_KEY_SENTINEL = "@@OPENCODE_PROVIDER_KEY@@";

const OPENCODE_PROVIDER_ENV_VAR_SENTINEL = "@@OPENCODE_PROVIDER_ENV_VAR@@";

const OPENCODE_PROVIDER_BASE_URL_SENTINEL = "@@OPENCODE_PROVIDER_BASE_URL@@";

/**
 * Render the opencode.json template with tracker-filtered mcp + provider config.
 * Resolves the @@OPENCODE_TRACKER_MCP@@ sentinel into the correct mcpServers entry
 * and fills in provider-specific fields.
 *
 * Also injects derived **allow** rules for {@link resolveNetworkAllowlist} so
 * context-fetch / provider hosts do not prompt on either fetch surface: `curl *{domain}*` /
 * `wget *{domain}*` after the template's `curl *` / `wget *` ask (OpenCode bash is
 * last-match-wins), and `*{domain}*` into the `permission.webfetch` URL map (after its
 * `"*": "ask"`). Adds `<server>_*` allows for the consumer's `mcp-servers` block.
 */
export function renderOpencodeJson(
  templatePath: string,
  tracker: IssueTracker,
  provider: string,
  cwd: string = process.cwd(),
): string {
  const raw = fs.readFileSync(templatePath, "utf-8");
  // Strict allowlist: provider is gated to OPENCODE_PROVIDERS at the CLI, so it is always
  // a known key here. An unknown id throws; no substitute provider.
  if (!isOpencodeProvider(provider)) {
    throw new Error(`renderOpencodeJson: unknown opencode provider ${JSON.stringify(provider)}`);
  }
  const providerDefaults = OPENCODE_PROVIDER_DEFAULTS[provider];

  // Resolve tracker MCP entry
  // opencode's MCP schema differs from Claude/Cursor: remote servers use type "remote"
  // (NOT "http" — not in opencode's enum, which makes the whole config invalid) and read
  // secrets via {env:VAR} (NOT shell ${VAR}). See https://opencode.ai/config.json.
  // github: "oauth": false disables opencode's automatic OAuth. api.githubcopilot.com/mcp/
  // authenticates via the Authorization header and has no OAuth DCR, so a stale/empty
  // {env:BKIT_GH_TOKEN} would otherwise surface as a "sign in" prompt whose flow fails with
  // "dynamic auth not supported" instead of a clear 401. See opencode.ai/docs/mcp-servers.
  let mcpEntry: string;
  if (tracker === "github") {
    mcpEntry =
      '"github": { "type": "remote", "url": "https://api.githubcopilot.com/mcp/", "oauth": false, "headers": { "Authorization": "Bearer {env:BKIT_GH_TOKEN}", "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects,actions" } }';
  } else if (tracker === "linear") {
    mcpEntry = '"linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }';
  } else if (tracker === "jira") {
    // Same "oauth": false reason as github: the API token in the header is the only auth
    // bkit wires, so a bad one fails as a 401, not as an OAuth sign-in prompt.
    mcpEntry =
      '"jira": { "type": "remote", "url": "https://mcp.atlassian.com/v2/mcp", "oauth": false, "headers": { "Authorization": "Bearer {env:BKIT_JIRA_API_KEY}" } }';
  } else {
    mcpEntry = "";
  }

  let rendered = raw.replace(OPENCODE_TRACKER_MCP_SENTINEL, mcpEntry);
  rendered = rendered.replace(OPENCODE_PROVIDER_KEY_SENTINEL, provider);
  rendered = rendered.replace(OPENCODE_PROVIDER_ENV_VAR_SENTINEL, providerDefaults.envVar);
  rendered = rendered.replace(OPENCODE_PROVIDER_BASE_URL_SENTINEL, providerDefaults.baseURL);

  // Parse + re-serialize to normalise JSON (removes empty mcp entry if tracker=none)
  try {
    const renderedDoc = parseJson(rendered);
    if (!renderedDoc.ok) return rendered;
    const parsed = renderedDoc.value as Record<string, unknown>;
    // Clean up empty mcp object when tracker=none
    const mcp = parsed.mcp as Record<string, unknown> | undefined;
    if (mcp && Object.keys(mcp).length === 0) {
      delete parsed.mcp;
    }
    // Built-in opencode gateways (Zen/Go): opencode resolves the provider from models.dev,
    // so there is no npm driver and no baseURL — emit a minimal block keyed by the
    // opencode-side provider id carrying only the apiKey ({env:BKIT_OPENCODE_API_KEY}).
    if (providerDefaults.builtin) {
      const pid = providerDefaults.providerId ?? provider;
      const options: Record<string, unknown> = { apiKey: providerDefaults.apiPlaceholder };
      (parsed.provider as Record<string, unknown>) = { [pid]: { options } };
      injectOpencodeDerivedAllows(parsed, cwd);
      return JSON.stringify(parsed, null, 2) + "\n";
    }
    // For npm-based custom providers (e.g. openrouter), replace the api-openai provider
    // block with the npm-driver format: { npm, name, options: { baseURL, apiKey } }
    if (providerDefaults.npmPackage) {
      // Every custom provider carries an apiKey as {env:VAR}. opencode rejects an unknown
      // "api" field, so the block is rebuilt to the npm-driver shape only.
      const options: Record<string, unknown> = {
        baseURL: providerDefaults.baseURL,
        apiKey: providerDefaults.apiPlaceholder,
      };
      (parsed.provider as Record<string, unknown>) = {
        [provider]: {
          npm: providerDefaults.npmPackage,
          name: providerDefaults.displayName ?? provider,
          options,
        },
      };
    }
    injectOpencodeDerivedAllows(parsed, cwd);
    return JSON.stringify(parsed, null, 2) + "\n";
  } catch {
    return rendered;
  }
}

/**
 * Append derived allows for the consumer's resolved network allowlist (OpenCode
 * last-match-wins), and one `<server>_*` allow per declared MCP server — opencode names
 * MCP tools `<server>_<tool>` and matches permission keys as globs against the tool name.
 *
 * The allowlist is applied to BOTH fetch surfaces, so an allowlisted host does not prompt
 * whichever path the agent takes:
 *   - fetch tool — `permission.webfetch` is a URL-keyed map (`{ "*": "ask" }` from the
 *     template); opencode matches the resource against the URL, so `*{base}*` allows it;
 *   - shell fetch — `permission.bash` gains `curl *{base}*` / `wget *{base}*` after the
 *     template's `curl *` / `wget *` ask.
 */
function injectOpencodeDerivedAllows(parsed: Record<string, unknown>, cwd: string): void {
  const permission = parsed.permission as Record<string, unknown> | undefined;
  if (!permission) return;
  for (const server of extractMcpServers(cwd)) {
    permission[`${server}_*`] = "allow";
  }
  const bases = networkAllowlistBases(resolveNetworkAllowlist(cwd));
  if (typeof permission.bash === "object" && permission.bash !== null) {
    const bash = permission.bash as Record<string, string>;
    for (const base of bases) {
      bash[`curl *${base}*`] = "allow";
      bash[`wget *${base}*`] = "allow";
    }
  }
  // Fetch tool — opencode matches the webfetch resource against the requested URL.
  if (typeof permission.webfetch === "object" && permission.webfetch !== null) {
    const webfetch = permission.webfetch as Record<string, string>;
    for (const base of bases) {
      webfetch[`*${base}*`] = "allow";
    }
  }
}

/**
 * Reconcile a consumer's `.opencode/opencode.json` against the freshly-rendered template.
 * Install is additive across provider keys: existing blocks for other providers
 * (bkit-seeded or consumer-added) are preserved. For each provider key present in the
 * template, the block is REPLACED (not deep-merged), so a hijacked npm/baseURL does not
 * survive reinstall.
 *
 * To remove a stale bkit provider block (e.g. after switching providers), use the surgical
 * `removeOpencodeProviderBlock` below — called by the uninstall path, not install.
 *
 * Mirrors writeTier2JsonContained's contract (first-install write, idempotent no-op via
 * final equality, else merge), so dry-run and real runs compute the identical writeset.
 */
export function reconcileOpencodeJson(
  renderedTemplate: string,
  relDst: string,
  dryRun: boolean,
  ws: WriteSet,
): void {
  const template = JSON.parse(renderedTemplate) as Record<string, JsonValue>;

  if (!fs.existsSync(relDst)) {
    // First install — write template as-is.
    if (!dryRun) {
      ensureDir(path.dirname(relDst));
      fs.writeFileSync(relDst, JSON.stringify(template, null, 2) + "\n", "utf-8");
    }
    ws.writes.push({ path: relDst, action: "write" });
    return;
  }

  // Malformed consumer JSON is a hard stop: refuse to merge, require a fix.
  const read = readJsonFile(relDst);
  const existing = read.ok ? (read.value as Record<string, JsonValue> | null) : null;
  if (existing === null) {
    throw new Error(
      `[bkit] ${relDst} is malformed JSON — fix manually before running bkit install`,
    );
  }

  const merged = deepMergeJson(existing as JsonValue, template as JsonValue) as Record<
    string,
    JsonValue
  >;
  // The tracker `mcp` entry keeps the consumer's extra toolsets (`mergeTrackerEntry`), which
  // the plain merge above would overwrite with the template's list.
  const tmplMcp = template.mcp;
  const existingMcp = existing.mcp;
  if (isJsonObject(tmplMcp) && isJsonObject(existingMcp) && isJsonObject(merged.mcp)) {
    for (const [k, v] of Object.entries(tmplMcp)) {
      merged.mcp[k] = mergeTrackerEntry(existingMcp[k], v);
    }
  }
  // Replace (do not deep-merge) each provider key the template seeds — heals hijacked
  // npm/baseURL/name while keeping other provider keys additive.
  //
  // Preserve the EXISTING file's provider key order (deepMergeJson orders template keys
  // first, which is right for last-match-wins maps like permission.bash): rebuild from the
  // existing order — replacing template-seeded blocks in place — then append new template
  // providers in template order. Install and upgrade render the same order.
  const tmplProv = template.provider;
  if (tmplProv !== null && typeof tmplProv === "object" && !Array.isArray(tmplProv)) {
    const tmplProvObj = tmplProv as Record<string, JsonValue>;
    const existingProvObj =
      existing.provider !== null &&
      typeof existing.provider === "object" &&
      !Array.isArray(existing.provider)
        ? (existing.provider as Record<string, JsonValue>)
        : ({} as Record<string, JsonValue>);
    const orderedProv: Record<string, JsonValue> = {};
    for (const k of Object.keys(existingProvObj)) {
      orderedProv[k] =
        k in tmplProvObj
          ? (JSON.parse(JSON.stringify(tmplProvObj[k])) as JsonValue)
          : existingProvObj[k];
    }
    for (const [k, v] of Object.entries(tmplProvObj)) {
      if (!(k in orderedProv)) orderedProv[k] = JSON.parse(JSON.stringify(v)) as JsonValue;
    }
    merged.provider = orderedProv;
  }

  const mergedStr = JSON.stringify(merged, null, 2) + "\n";
  if (mergedStr === fs.readFileSync(relDst, "utf-8")) return; // idempotent guard
  if (!dryRun) {
    fs.writeFileSync(relDst, mergedStr, "utf-8");
  }
  ws.writes.push({ path: relDst, action: "update" });
}

/**
 * Remove exactly one bkit-seeded provider block from the consumer's opencode.json.
 * `dst` may be an absolute or relative path (fs.* accepts both).
 * Used by the surgical uninstall path — this is NOT called during install (install is additive).
 * Compares on opencodeProviderId(providerKey) to resolve the opencode-side block key.
 * The caller is responsible for passing only bkit-seeded provider keys; this function does not
 * validate providerKey against OPENCODE_PROVIDER_DEFAULTS (shared/egress.ts).
 */
export function removeOpencodeProviderBlock(
  dst: string,
  providerKey: string,
  dryRun: boolean,
  ws: WriteSet,
): void {
  if (!fs.existsSync(dst)) return;
  const read = readJsonFile(dst);
  const existing = read.ok ? (read.value as Record<string, JsonValue> | null) : null;
  if (existing === null) {
    console.warn(`[bkit] ${dst} is malformed — leaving as-is`);
    return;
  }
  const blockKey = opencodeProviderId(providerKey);
  const providerObj = existing.provider;
  if (providerObj === null || typeof providerObj !== "object" || Array.isArray(providerObj)) return;
  const pObj = providerObj as Record<string, JsonValue>;
  if (!(blockKey in pObj)) return; // already absent — idempotent
  delete pObj[blockKey];
  if (Object.keys(pObj).length === 0) delete existing.provider;
  const updatedStr = JSON.stringify(existing, null, 2) + "\n";
  if (!dryRun) {
    fs.writeFileSync(dst, updatedStr, "utf-8");
  }
  ws.writes.push({ path: dst, action: "update" });
}

export function runOpencodeModule(ctx: ModuleContext): void {
  const { dryRun, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  // See renderOpencodeAgentsCommands — the opencode host is unary; no provider throws.
  if (!ctx.opencodeProvider) {
    throw new Error("runOpencodeModule: ctx.opencodeProvider is required");
  }
  const provider = ctx.opencodeProvider;

  // Source-rendered agents/commands (.opencode/agents + .opencode/commands). Extracted to
  // renderOpencodeAgentsCommands so `bkit upgrade` re-renders them identically —
  // bkit-owned output, force-overwritten.
  renderOpencodeAgentsCommands(ctx);

  // --- opencode.json — Tier-2 deep-contained (reconverged on upgrade) ---
  {
    const opencodeShared = path.join(getSharedRoot(), ".opencode");
    const jsonSrc = path.join(opencodeShared, "opencode.json");
    const jsonDst = ".opencode/opencode.json";
    if (fs.existsSync(jsonSrc)) {
      // Render the template with tracker-filtered mcp + provider config, then reconcile it into
      // the consumer file. Install is additive: existing provider blocks are preserved.
      // reconcileOpencodeJson computes an identical writeset for dry-run vs real runs — no
      // `.bkit-staging` scratch file.
      const rendered = renderOpencodeJson(jsonSrc, issueTracker, provider, process.cwd());
      const prevLen = ws.writes.length;
      reconcileOpencodeJson(rendered, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}opencode: ${jsonDst}`);
      }
    }
  }

  // --- bkit-gateguard.js / bkit-readguard.js — Tier-2 markered-text (slash-comment); see install/manifest.ts ---
  for (const plugin of ["bkit-gateguard.js", "bkit-readguard.js"]) {
    const opencodeCore = path.join(getCoreRoot(), ".opencode", "plugin");
    const pluginSrc = path.join(opencodeCore, plugin);
    const pluginDst = `.opencode/plugin/${plugin}`;
    if (fs.existsSync(pluginSrc)) {
      // dryRun-gated — writeTier2 honours dryRun, so the dir is only needed for a real
      // write; `bkit check` stays read-only when gateguard's parent dir is absent.
      if (!dryRun) ensureDir(path.dirname(pluginDst));
      const prevLen = ws.writes.length;
      writeTier2(pluginSrc, pluginDst, ctx.tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}opencode: ${pluginDst}`);
      }
    }
  }

  // opencode post-install advisory — provider key + launch + model-ID lookup pointer.
  advisories.push({
    id: "opencode-setup",
    severity: "advisory",
    detect: `opencode host installed (provider: ${provider}). The opencode CLI and your provider credentials are required before running agents.`,
    action:
      `opencode setup for provider "${provider}":\n\n` +
      (() => {
        const pd = isOpencodeProvider(provider) ? OPENCODE_PROVIDER_DEFAULTS[provider] : undefined;
        if (!pd) {
          return (
            `  1. Set ${provider.toUpperCase()}_API_KEY in your environment / .bkit/.env.\n` +
            `  2. Update .opencode/opencode.json provider.${provider}.options.baseURL for your endpoint.\n`
          );
        }
        // opencode-native gateways (opencode-zen / opencode-go) → BKIT_OPENCODE_API_KEY only.
        // Built-in: no baseURL to seed; models use the opencode-side provider id.
        if (pd.builtin || pd.envVar === "BKIT_OPENCODE_API_KEY") {
          const modelPrefix = opencodeProviderId(provider);
          return (
            `  1. opencode gateway "${provider}". Create an API key at https://opencode.ai/auth (one BKIT_OPENCODE_API_KEY covers both opencode-zen and opencode-go).\n` +
            `  2. Set ${pd.envVar} in your environment / .bkit/.env:\n` +
            `     ${pd.envVar}=<your-api-key>\n` +
            `  3. Built-in provider (no npm/baseURL). Models are referenced as ${modelPrefix}/<id>.\n`
          );
        }
        return (
          `  1. Set ${pd.envVar} in your environment / .bkit/.env:\n` +
          `     ${pd.envVar}=<your-api-key>\n` +
          `  2. Provider base URL is pre-seeded: ${pd.baseURL}.\n`
        );
      })() +
      `  3. Launch opencode: \`opencode\` (CLI, reads .opencode/opencode.json automatically), or\n` +
      `     \`bkit opencode\` to launch the desktop app with .bkit/.env merged into its environment.\n` +
      `     macOS GUI apps launched from the Dock/Finder do not inherit the login-shell / direnv\n` +
      `     env — {env:KEY} placeholders in opencode.json resolve empty without this. Quit the\n` +
      `     running app first (a running instance ignores the new env).\n` +
      `  4. Model IDs: all four providers (openrouter, ollama, opencode-zen, opencode-go) install ready-to-run curated per-agent pins. ` +
      `Re-pin any agent via .bkit/prompts.md § Model Overrides or by probing the provider's live /v1/models — see .bkit/providers.md § Models. NOTE: every ollama pin (deepseek-v4.1-flash, kimi-k3) needs a paid Ollama plan. opencode-go pins (deepseek-v4.1-flash, kimi-k3) — prefer pins that stay within the Go 5h usage window; opencode-zen pins are existence-validated via models.dev (the /zen/v1/models REST probe cannot see Go-only models — models.dev is the source of truth).\n` +
      `  5. Verify with: \`bkit doctor\` (credentials + tools) and \`bkit status\` (installed hosts + providers).`,
  });
}
