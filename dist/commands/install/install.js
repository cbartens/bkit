// commands/install/install.ts — `bkit install` and `bkit check`: preflight, module dispatch,
// post-install checks. Check runs the same pipeline in dry-run mode.
import * as fs from "node:fs";
import * as path from "node:path";
import { OPENCODE_PROVIDERS } from "../../shared/egress.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import { dispatchModules } from "../../install/modules/index.js";
import { DEFAULT_ISSUE_TRACKER, } from "../../install/manifest.js";
import { parseJson, readJsonFile } from "../../shared/json.js";
import { readBkitConfig } from "../../shared/settings.js";
import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
import { detectInstalledModules, reportCheckDrift } from "./check.js";
import { runPreflight } from "../../checks/before/index.js";
import { formatChecklist, readChangelogVersionDelta, runPostInstallCheck, writeAdvisoriesArtifact, } from "../../checks/after/index.js";
import { collectTips } from "../../checks/tips/index.js";
import { findMissingOwnedHooks, detectOwnedHookMissing } from "../../checks/after/managed.js";
import { resolveTokens } from "../../install/placeholders.js";
import { parseModelLookup, applyModelOverrides, buildOpencodeModelLookup, buildAntigravityModelLookup, parseEffortMap, } from "../../render/models.js";
import { getBkitDocsRoot } from "../../shared/package-roots.js";
import { runUninstall } from "./uninstall.js";
// ---------------------------------------------------------------------------
// Staging scratch area
//
// `.bkit-staging/` is a per-run SCRATCH area: modules render derived files there
// (e.g. opencode.json) before comparing/merging into the consumer destination.
// runInstall Phase 2 cleans it up after every dispatch — success or failure —
// via `finally { discardAllStaging() }`. Dispatch writes module files directly to
// their destinations and is NOT atomic across modules; `bkit install` is idempotent,
// so re-running completes a partial install.
// ---------------------------------------------------------------------------
/** Staging root dir (relative to cwd). */
export const STAGING_ROOT = ".bkit-staging";
/**
 * Discard ALL staging dirs under STAGING_ROOT (cleanup on mid-install failure).
 */
export function discardAllStaging(cwd = process.cwd()) {
    const stagingRoot = path.join(cwd, STAGING_ROOT);
    if (fs.existsSync(stagingRoot)) {
        fs.rmSync(stagingRoot, { recursive: true, force: true });
    }
}
/**
 * The installed opencode provider, or exit(1) with the fix.
 *
 * `bkit check` / `bkit upgrade` take no `--opencode=` flag, so they read the provider the
 * consumer actually installed (package.json `bkit.opencodeProvider`, else the opencode.json
 * provider block). There is no default: a repo carrying `.opencode/` with no recorded
 * provider is a broken install.
 *
 * Call ONLY on a path already known to need the opencode host, never speculatively.
 */
export function requireOpencodeProvider(cwd, context) {
    const detected = detectOpencodeProvider(cwd);
    if (!detected) {
        console.error(`${LOG_PREFIX} ${context}: the opencode host is installed but no provider is recorded ` +
            `(package.json \`bkit.opencodeProvider\` and .opencode/opencode.json are both silent). ` +
            `Re-run \`bkit install --opencode=<provider>\` — one of ${OPENCODE_PROVIDERS.join(", ")}.`);
        process.exit(1);
    }
    return detected;
}
/**
 * Render a resolved module set back into valid CLI flags for
 * recovery-hint text. Skips core (implicit) and spells opt-ins with their value flags.
 */
export function modulesToCliFlags(mods, opencodeProvider, cloudVariant) {
    const out = [];
    if (mods.has("claude"))
        out.push("--claude");
    if (mods.has("cursor"))
        out.push("--cursor");
    if (mods.has("opencode"))
        out.push(`--opencode=${opencodeProvider ?? "<provider>"}`);
    if (mods.has("codex"))
        out.push("--codex");
    if (mods.has("antigravity"))
        out.push("--antigravity");
    if (mods.has("cloud"))
        out.push(`--auto=${cloudVariant ?? "<variant>"}`);
    return out.join(" ");
}
/**
 * Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4): cloud=claude and
 * cloud=opencode both require tracker=github (both use the bkit-cloud.yml template);
 * cloud=cursor requires tracker=linear. Mismatch is a hard error — checked BEFORE
 * any package.json write so no state is recorded on mismatch ("no files written
 * on hard error" invariant). Returns the error message to print, or `null` when
 * the tracker matches (or no cloud module/variant is in play).
 */
export function validateCloudTrackerMatch(cloudVariant, hasCloudModule, issueTracker) {
    if (cloudVariant === null || !hasCloudModule)
        return null;
    const requiredTracker = cloudVariant === "cursor" ? "linear" : "github";
    if (issueTracker === requiredTracker)
        return null;
    return (`[bkit] --auto=${cloudVariant} requires tracker=${requiredTracker}, ` +
        `but the resolved tracker is "${issueTracker}". ` +
        (issueTracker === DEFAULT_ISSUE_TRACKER || issueTracker === "none"
            ? `Set the tracker first: bkit install --tracker=${requiredTracker} --auto=${cloudVariant}`
            : `Re-run with the matching tracker: bkit install --tracker=${requiredTracker} --auto=${cloudVariant} (tracker switching is free).`));
}
/**
 * Detect the bkit opencode provider key a consumer installed.
 *
 * Resolution order:
 *  1. `package.json` `bkit.opencodeProvider` — the authoritative record written on install.
 *     This is the ONLY signal for managed-auth gateways (opencode) whose opencode.json carries no
 *     custom provider block.
 *  2. `.opencode/opencode.json` first provider key — for installs without the manifest field
 *     (the block is keyed by provider id, matching renderOpencodeJson).
 *  3. null — caller falls back to the install default so the model lookup still resolves.
 *
 * The manifest value is validated against the allowlist so a hand-edited package.json cannot
 * smuggle an unsupported provider into the render path.
 */
export function detectOpencodeProvider(cwd) {
    const stored = readBkitConfig(cwd).opencodeProvider;
    if (stored !== null)
        return stored;
    const jsonPath = path.join(cwd, ".opencode", "opencode.json");
    if (!fs.existsSync(jsonPath))
        return null;
    // Unparseable opencode.json — fall back to the default provider.
    const read = readJsonFile(jsonPath);
    if (!read.ok || typeof read.value !== "object" || read.value === null)
        return null;
    const cfg = read.value;
    if (cfg.provider && typeof cfg.provider === "object") {
        const first = Object.keys(cfg.provider)[0];
        if (!first)
            return null;
        // Zen's opencode.json block is keyed by the built-in id `opencode`, not the CLI key.
        return first === "opencode" ? "opencode-zen" : first;
    }
    return null;
}
/**
 * Returns all bkit-installed opencode providers from the consumer package.json
 * `bkit.opencodeProviders` array, filtered to valid OPENCODE_PROVIDERS entries; [] when
 * the field is absent.
 */
export function detectOpencodeProviders(cwd) {
    return readBkitConfig(cwd).opencodeProviders;
}
/**
 * Re-run Phase 1 detection after the writes. The Phase 1 advisory seeds (the first
 * `seedCount` entries of `current`) are replaced by the fresh ones; advisories pushed by
 * modules during dispatch are kept. Fresh blockers are returned so the caller fails on them.
 */
export function refreshPreflightAfterWrites(modules, cwd, issueTracker, seedCount, current) {
    const moduleAdvisories = current.slice(seedCount);
    const fresh = runPreflight(modules, cwd, undefined, issueTracker);
    return {
        advisories: [...fresh.advisories, ...moduleAdvisories],
        blockers: fresh.blockers,
    };
}
/**
 * The advisory pass that closes a real `bkit upgrade`: `bkit check`'s read-only pipeline
 * under upgrade's log prefix, printing the checklist and rewriting `.bkit/advisories.md`
 * (mode `upgrade`). Never exits — blockers and drift are reported, upgrade keeps its own
 * exit code.
 */
export function runUpgradeAdvisories() {
    return runInstall({
        verb: "check",
        modules: new Set(),
        tracker: null,
        cloudVariant: null,
        opencodeProvider: null,
    }, true);
}
/**
 * `bkit install`, and `bkit check` (the same pipeline, dry-run). `upgradeReport` runs the
 * check pipeline for runUpgradeAdvisories.
 */
export async function runInstall(args, upgradeReport = false) {
    const { verb, modules, tracker, cloudVariant, opencodeProvider, uninstallFlags } = args;
    const dryRun = verb === "check";
    if (dryRun && !upgradeReport)
        setLogPrefix("[bkit-check]");
    if (upgradeReport)
        console.log(`${LOG_PREFIX} Checking advisories (read-only)`);
    else if (dryRun)
        console.log(`${LOG_PREFIX} Running in check (dry-run) mode`);
    // `bkit check` scopes drift detection to what is INSTALLED (detected by sentinel files),
    // not to a fixed full set. `install` keeps its explicit resolved set.
    const effectiveModules = verb === "check" ? detectInstalledModules(process.cwd()) : modules;
    // RENDER-input provider resolution. `bkit check` takes no `--opencode=` flag, so the parsed
    // `opencodeProvider` is null on the check path; it falls back to the INSTALLED provider
    // (package.json `bkit.opencodeProvider`, else the opencode.json provider block). On install
    // `?? detect` never fires: opencode joins the module set only when `--opencode=<provider>`
    // was given. The PARSED `opencodeProvider` alone drives the persist-to-package.json logic
    // below (gated on `!dryRun` + a real flag). The tracker is resolved from package.json below,
    // so the tracker-dependent opencode mcp block renders the same way on check.
    const renderOpencodeProvider = opencodeProvider ?? detectOpencodeProvider(process.cwd());
    // Resolve issueTracker: --tracker= flag overrides; else read bkit.issueTracker from consumer
    // package.json; else default to "none".
    // A `--tracker=` value always applies, whether first-set or a re-set of an
    // already-recorded tracker.
    // Resolved BEFORE preflight: preflight's tracker-dependent detectors grade the tracker
    // this run INSTALLS, not the one on disk from the previous run. Read-only — no writes here.
    const issueTracker = tracker ?? readBkitConfig(process.cwd()).issueTracker;
    // --- Phase 1: Preflight (read-only, before any writes) ---
    // Must run BEFORE resolveTokens to short-circuit cleanly on blockers.
    const { blockers, advisories: preflightAdvisories } = runPreflight(effectiveModules, process.cwd(), undefined, issueTracker);
    if (blockers.length > 0) {
        console.log(`${LOG_PREFIX} Preflight blockers detected — aborting.`);
        const blockerBanner = formatChecklist(blockers);
        if (blockerBanner)
            console.log(blockerBanner);
        if (upgradeReport) {
            writeAdvisoriesArtifact(blockers, {
                cwd: process.cwd(),
                mode: "upgrade",
                version: readInstallingVersion(),
                logPrefix: LOG_PREFIX,
            });
            return;
        }
        process.exit(1);
    }
    // Resolve tokens once for the whole install
    const tokens = await resolveTokens(process.cwd()).catch((err) => {
        console.error(`${LOG_PREFIX} Token resolution failed: ${err.message}`);
        if (!upgradeReport)
            process.exit(1);
        return undefined;
    });
    if (tokens === undefined)
        return;
    // Parse model lookup (needed for cursor transforms).
    // DEFAULTS come from the PACKAGE's .bkit/prompts.md § Models (authoritative, matches the
    // prompt files about to be installed).
    // OVERRIDES come from the CONSUMER's installed .bkit/prompts.md `## Model Overrides`
    // section (below `bkit:end`) — per-agent, per-provider, preserved across upgrades.
    let modelLookup = new Map();
    let opencodeModelLookup = new Map();
    let codexModelLookup = new Map();
    let antigravityModelLookup = new Map();
    let effortMap = new Map();
    const promptsMdPath = path.join(getBkitDocsRoot(), "prompts.md");
    const consumerPromptsMdPath = path.join(process.cwd(), ".bkit", "prompts.md");
    if (fs.existsSync(promptsMdPath)) {
        try {
            modelLookup = parseModelLookup(promptsMdPath);
        }
        catch {
            // Not fatal — cursor module will fail per-file if a model is missing
        }
        // Consumer overrides merge after the base parse — parseModelOverrides is internally
        // guarded (returns [] when the file/section is absent), so it needs no catch here.
        applyModelOverrides(modelLookup, "cursor", consumerPromptsMdPath);
        if (effectiveModules.has("opencode")) {
            // On install `--opencode=<provider>` already set this; on check it comes from what the
            // consumer installed. Either way the opencode host cannot render without a real one.
            const provider = renderOpencodeProvider ?? requireOpencodeProvider(process.cwd(), "opencode render");
            try {
                opencodeModelLookup = buildOpencodeModelLookup(promptsMdPath, provider);
            }
            catch {
                // Not fatal — opencode module will fail per-file if a model is missing
            }
            applyModelOverrides(opencodeModelLookup, provider, consumerPromptsMdPath);
        }
        if (effectiveModules.has("codex")) {
            // Codex is nullary — one gateway (`openai`), so there is nothing to detect.
            try {
                codexModelLookup = buildOpencodeModelLookup(promptsMdPath, "openai");
            }
            catch {
                // Not fatal — codex module will fail per-file if a model is missing
            }
            applyModelOverrides(codexModelLookup, "openai", consumerPromptsMdPath);
        }
        if (effectiveModules.has("antigravity")) {
            // Antigravity is nullary — one gateway (`google`), so there is nothing to detect.
            try {
                antigravityModelLookup = buildAntigravityModelLookup(promptsMdPath);
            }
            catch {
                // Not fatal — antigravity module will fail per-file if a model is missing
            }
            applyModelOverrides(antigravityModelLookup, "google", consumerPromptsMdPath);
        }
        effortMap = parseEffortMap(promptsMdPath);
    }
    // Seed preflight advisories into ctx so modules can accumulate into the same list.
    const advisories = [...preflightAdvisories];
    const ws = { writes: [] };
    const postDispatch = [];
    // Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4) — see
    // validateCloudTrackerMatch for the full rationale. Checked BEFORE any
    // package.json write so no state is recorded on mismatch.
    const cloudTrackerError = validateCloudTrackerMatch(cloudVariant, modules.has("cloud"), issueTracker);
    if (cloudTrackerError) {
        console.error(cloudTrackerError);
        process.exit(1);
    }
    if (cloudVariant !== null && modules.has("cloud")) {
        // auto=opencode additionally requires the local opencode host to be installed first
        // (the cloud job runs against the committed .opencode/ — no model is hard-coded in YAML).
        if (cloudVariant === "opencode" && !fs.existsSync(path.join(process.cwd(), ".opencode"))) {
            console.error(`[bkit] --auto=opencode requires the local opencode host to be installed first.\n` +
                `Run: bkit install --opencode=<provider>  (e.g. --opencode=opencode-zen)\n` +
                `The cloud opencode job runs against the committed .opencode/ config — without it there is nothing to run.`);
            process.exit(1);
        }
    }
    // Persist bkit manifest fields to consumer package.json AFTER all hard-error gates pass.
    // This preserves the "no files written on mismatch" invariant. Two fields are recorded:
    //   - issueTracker: when a `--tracker=` value was given this run.
    //   - opencodeProvider: when an `--opencode=<provider>` value was given this run. This is
    //     the authoritative provider record detectOpencodeProvider reads on upgrade — REQUIRED
    //     for managed-auth gateways (opencode), whose opencode.json carries no provider block to
    //     detect from. Both are merged in one read-modify-write to avoid double-writing.
    const persistTracker = tracker !== null;
    const persistProvider = opencodeProvider !== null && effectiveModules.has("opencode");
    if ((persistTracker || persistProvider) && !dryRun) {
        const consumerPkgPath2 = path.join(process.cwd(), "package.json");
        if (fs.existsSync(consumerPkgPath2)) {
            try {
                const raw = fs.readFileSync(consumerPkgPath2, "utf-8");
                // A package.json that is not JSON is left as-is (the preflight blocker reports it).
                const parsed = parseJson(raw);
                if (parsed.ok) {
                    const pkg = parsed.value;
                    const bkit = (pkg.bkit ?? {});
                    if (persistTracker)
                        bkit.issueTracker = tracker;
                    if (persistProvider) {
                        bkit.opencodeProvider = opencodeProvider; // active (drives agent frontmatter)
                        // Update providers array (deduped).
                        const existingArr = Array.isArray(bkit.opencodeProviders)
                            ? [...bkit.opencodeProviders]
                            : [];
                        if (!existingArr.includes(opencodeProvider)) {
                            existingArr.push(opencodeProvider);
                        }
                        bkit.opencodeProviders = existingArr;
                    }
                    pkg.bkit = bkit;
                    const indentMatch = raw.match(/\n([ \t]+)"/);
                    const indent = indentMatch ? indentMatch[1] : "  ";
                    const trailingNewline = raw.endsWith("\n") ? "\n" : "";
                    fs.writeFileSync(consumerPkgPath2, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
                    if (persistTracker) {
                        console.log(`${LOG_PREFIX} Set bkit.issueTracker = "${tracker}" in package.json`);
                    }
                    if (persistProvider) {
                        console.log(`${LOG_PREFIX} Set bkit.opencodeProvider = "${opencodeProvider}" and updated bkit.opencodeProviders in package.json`);
                    }
                }
            }
            catch {
                // non-fatal
            }
        }
    }
    const ctx = {
        dryRun,
        tokens,
        modelLookup,
        opencodeModelLookup,
        codexModelLookup,
        antigravityModelLookup,
        effortMap,
        opencodeProvider: renderOpencodeProvider,
        advisories,
        ws,
        logPrefix: LOG_PREFIX,
        postDispatch,
        issueTracker,
        cloudVariant,
        // Stamped into every rendered agent + command as the managed-version marker.
        version: readInstallingVersion(),
        // Full host set for this run: dispatched ∪ already-on-disk. Read by the Antigravity
        // module to warn when Codex is also installed (both hosts' `bkit-*` workflow skills
        // then surface in Antigravity's skill selector).
        installedModules: new Set([
            ...effectiveModules,
            ...detectInstalledModules(process.cwd()),
        ]),
    };
    // --- Phase 2: Install (current behaviour — dispatch modules) ---
    // check dispatches the detected installed set; install dispatches the resolved set.
    //
    // `.bkit-staging/` is a per-run scratch area for rendered files (e.g. opencode.json) — NOT a
    // cross-module commit/rollback transaction. Module fns write directly to their consumer
    // destinations, so a mid-dispatch failure can leave files already written (postDispatch — the
    // `.bkit/version` pin — does not run). The error is surfaced, never swallowed, and the scratch
    // dir is always cleaned up. `bkit install` is idempotent, so re-running completes a partial
    // install. See README § Install staging directory.
    try {
        dispatchModules(effectiveModules, ctx);
    }
    finally {
        discardAllStaging();
    }
    const totalWrites = ws.writes.length;
    // Done banner first so the line count is easy to find above the checklist.
    // For check, "would occur" makes intent explicit; for install, writes already happened.
    if (dryRun) {
        console.log(`${LOG_PREFIX} ${totalWrites} write(s) would occur.`);
    }
    else {
        console.log(`${LOG_PREFIX} Done. ${totalWrites} write(s).`);
    }
    // Phase 2 has completed its writes. Re-run Phase 1 detection and use its result for the
    // post-install checklist, so the banner reflects the state on disk AFTER the writes.
    // Otherwise a drift finding Phase 2 just resolved (tier2-json-drift, tier2-text-drift,
    // bkit-version-pin-stale) is still reported as unresolved, contradicting the "Done"
    // banner above. `check` (dryRun) wrote nothing, so its Phase 1 findings already describe
    // the current state and are kept as-is. Module-accumulated advisories (pushed during
    // dispatch) are preserved; only the Phase 1 seeds are replaced, in their original order.
    let postWriteBlockers = [];
    if (!dryRun) {
        const refreshed = refreshPreflightAfterWrites(effectiveModules, process.cwd(), issueTracker, preflightAdvisories.length, advisories);
        ctx.advisories = refreshed.advisories;
        postWriteBlockers = refreshed.blockers;
    }
    // --- Phase 3: Post-install checks (re-detect + unified output) ---
    // Runs for both install AND check — detectors are read-only, so check produces
    // the same advisory set as install would emit against the same filesystem state.
    // Changelog version-delta header (A7): surface what changed in the installed version.
    const deltaHeader = readChangelogVersionDelta(readInstallingVersion());
    if (deltaHeader)
        console.log(deltaHeader);
    const suppressed = [];
    const postFindings = runPostInstallCheck(ctx.advisories, process.cwd(), suppressed);
    if (postWriteBlockers.length > 0) {
        console.log(`${LOG_PREFIX} Preflight blockers appeared after the writes — files are already written; fix the blocker and re-run.`);
        postFindings.unshift(...postWriteBlockers);
    }
    // check only: install has just written every hook file of the modules it dispatched, and a
    // missing bkit-cloud-bootstrap.sh after `install --claude` is not that run's fault.
    const missingHooks = dryRun ? findMissingOwnedHooks(process.cwd(), effectiveModules) : [];
    const missingHooksFinding = detectOwnedHookMissing(missingHooks);
    if (missingHooksFinding)
        postFindings.push(missingHooksFinding);
    const { tips, suppressed: suppressedTips } = collectTips(process.cwd());
    suppressed.push(...suppressedTips);
    const banner = formatChecklist(postFindings, suppressed, tips);
    if (banner)
        console.log(banner);
    writeAdvisoriesArtifact(postFindings, {
        cwd: process.cwd(),
        mode: upgradeReport ? "upgrade" : dryRun ? "check" : "install",
        version: readInstallingVersion(),
        logPrefix: LOG_PREFIX,
        suppressed,
        tips,
    });
    // Check mode: exit 1 on drift (see reportCheckDrift).
    if (dryRun) {
        if (!upgradeReport)
            reportCheckDrift(postFindings, totalWrites, missingHooks);
        return;
    }
    // P2.T9: exit-1 on Phase 3 blockers + recovery action text.
    // Blockers in Phase 3 are actionable hard-fails (e.g. gh-bkit-token gap in CI).
    // Advisory findings are informational only and do NOT exit-1.
    const phase3Blockers = postFindings.filter((f) => f.severity === "blocker");
    if (phase3Blockers.length > 0) {
        const recoveryFlags = modulesToCliFlags(effectiveModules, opencodeProvider, cloudVariant);
        const recoveryLine = `pnpm bkit uninstall ${recoveryFlags} && <fix the issue> && pnpm bkit install ${recoveryFlags}`;
        console.error(`${LOG_PREFIX} ${phase3Blockers.length} Phase 3 blocker(s) detected. Recovery:\n  ${recoveryLine}`);
        // P2.T10: --auto-revert: run uninstall in-process before exit-1
        if (uninstallFlags?.autoRevert) {
            console.log(`${LOG_PREFIX} --auto-revert: reverting install...`);
            const uninstallCtx = {
                cwd: process.cwd(),
                dryRun: false,
                // force: true — auto-revert must delete byte-equal-text files (e.g. .bkit/version)
                // that were just written in this install run. Without force, the hash guard keeps
                // any of them whose hash `.bkit/version` does not record.
                force: true,
                nuke: false,
                yes: true,
                logPrefix: "[bkit-uninstall]",
            };
            await runUninstall([...effectiveModules], uninstallCtx);
            console.log(`${LOG_PREFIX} --auto-revert: uninstall complete. Exiting 1.`);
        }
        process.exit(1);
    }
}
