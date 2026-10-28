// render/hosts.ts — workflow and prompt sources → host agent, command and skill copies
// (claude T1/T2, cursor T3, opencode, codex, antigravity) and the frontmatter parser they share.
import { formatModelPin, lookupEffort } from "./models.js";
import { LOG_PREFIX } from "../shared/log-prefix.js";
/**
 * Convert a Claude `tools:` frontmatter block (a YAML array of capitalized tool names,
 * e.g. `- Read`/`- Write`) into opencode's `AgentConfig.tools` shape: an object map of
 * lowercase tool names → true (`tools:\n  read: true`). opencode REJECTS the array form
 * ("tools: Expected object | undefined, got [...]"), and its tool names are lowercase.
 * MCP tools are `<server>_<tool>` on opencode, so Claude's `mcp__<server>__<tool>` (or
 * `mcp__<server>__*`) is respelled rather than lowercased; the key may be a `*` pattern.
 * Returns "" when there are no tools (field omitted — also valid per the schema).
 */
export function opencodeToolsBlock(toolsBlock) {
    if (!toolsBlock)
        return "";
    const names = [];
    for (const m of toolsBlock.matchAll(/^[ \t]*-[ \t]*([A-Za-z][\w*-]*)/gm))
        names.push(m[1]);
    if (names.length === 0) {
        // Fallback: inline array form `tools: [Read, Write]`.
        const inline = toolsBlock.match(/\[([^\]]*)\]/);
        if (inline) {
            for (const t of inline[1].split(",")) {
                const n = t.trim().replace(/['"]/g, "");
                if (n)
                    names.push(n);
            }
        }
    }
    if (names.length === 0)
        return "";
    let out = "tools:\n";
    for (const n of names) {
        const mcp = /^mcp__(.+?)__(.+)$/.exec(n);
        out += `  ${mcp ? `${mcp[1]}_${mcp[2]}` : n.toLowerCase()}: true\n`;
    }
    return out;
}
/**
 * Antigravity built-in tool names. Antigravity (`.agents/`) uses lower_snake_case tool
 * names that differ from Claude's capitalized set, so the declared `tools:` block must be
 * respelled — an unknown tool name is not guaranteed to resolve on that host. Unknown
 * Claude names are passed through unchanged (best effort); MCP tools keep their
 * `mcp__<server>__<tool>` spelling.
 */
const ANTIGRAVITY_TOOL_MAP = {
    read: "view_file",
    glob: "list_dir",
    grep: "grep_search",
    write: "write_to_file",
    edit: "replace_file_content",
    bash: "run_command",
    websearch: "search_web",
    webfetch: "read_url",
};
/**
 * Convert a Claude `tools:` frontmatter block into Antigravity's tool vocabulary
 * (`view_file`, `write_to_file`, `replace_file_content`, `run_command`, `grep_search`,
 * `list_dir`, …). Emits the same YAML list shape as the source so a consumer can read the
 * file. Returns "" when there are no tools (field omitted — also valid).
 */
export function antigravityToolsBlock(toolsBlock) {
    if (!toolsBlock)
        return "";
    const names = [];
    for (const m of toolsBlock.matchAll(/^[ \t]*-[ \t]*([A-Za-z][\w*-]*)/gm))
        names.push(m[1]);
    if (names.length === 0) {
        // Fallback: inline array form `tools: [Read, Write]`.
        const inline = toolsBlock.match(/\[([^\]]*)\]/);
        if (inline) {
            for (const t of inline[1].split(",")) {
                const n = t.trim().replace(/['"]/g, "");
                if (n)
                    names.push(n);
            }
        }
    }
    if (names.length === 0)
        return "";
    let out = "tools:\n";
    for (const n of names) {
        if (n.startsWith("mcp__")) {
            out += `  - ${n}\n`;
            continue;
        }
        out += `  - ${ANTIGRAVITY_TOOL_MAP[n.toLowerCase()] ?? n}\n`;
    }
    return out;
}
/**
 * OC1: opencode agent frontmatter rewrite.
 * Emits: mode, name, description, model, tools (Claude array → opencode object map),
 * variant (the effort table's value for this agent, from the one shared "OpenCode"
 * ladder). The variant is a SEPARATE field, not a `#`-suffix on the model: 1.x reads
 * `variant:` natively, 2.0 joins `model` + `variant` internally, and a variant joined
 * to the model string with `#` breaks 1.x (its model id lookup keeps the suffix). The
 * ollama gateway is exempt from `variant:` — its provider builds model entries with no
 * variants, so any variant there is a hard 2.0 error; omit it and let opencode use its
 * own default. Drops: Claude-only fields (permissionMode, maxTurns, is_background,
 * readonly) and the original effort field. Hard-fails with non-zero exit if model
 * lookup missing for name.
 */
/**
 * Thinking-effort values each opencode-served model actually exposes (`reasoning_options` in
 * models.dev, read 2026-10-28). The host ladder assumes `max` is always available; it is not —
 * OpenCode hard-errors on a `variant:` the model does not expose, and `toggle`-only models carry
 * no effort variant at all. Unlisted models pass the mapped value through unchanged.
 */
const OPENCODE_VARIANT_LEVELS = {
    "deepseek-v4.1-flash": ["none", "low", "high", "max"],
    "minimax-m3.1-flash": ["low", "medium", "high", "xhigh", "max"],
    "glm-5.3-flash": ["low", "high", "max"],
    "gemini-4-argon": ["low", "medium", "high"],
    "mimo-v2.6-pro": [],
    "kimi-k3": [],
};
const VARIANT_RANK = ["none", "low", "medium", "high", "xhigh", "max"];
/**
 * The variant to emit for `model` at mapped `variant`: the value itself when the model exposes
 * it, else the highest level the model does expose at or under it, else its lowest. A model
 * with no effort control (`toggle`-only) gets null, so no `variant:` line is written.
 */
export function clampOpencodeVariant(model, variant) {
    if (!variant)
        return null;
    const slug = Object.keys(OPENCODE_VARIANT_LEVELS)
        .sort((a, b) => b.length - a.length)
        .find((key) => model.split("/").pop()?.includes(key) || model.includes(key));
    if (!slug)
        return variant;
    const levels = OPENCODE_VARIANT_LEVELS[slug];
    if (levels.length === 0)
        return null;
    if (levels.includes(variant))
        return variant;
    const wanted = VARIANT_RANK.indexOf(variant);
    const atOrUnder = levels
        .filter((l) => VARIANT_RANK.indexOf(l) <= wanted)
        .sort((a, b) => VARIANT_RANK.indexOf(b) - VARIANT_RANK.indexOf(a));
    return atOrUnder[0] ?? levels[0];
}
export function applyOpencodeAgent(content, opencodeModelLookup, effortMap, provider) {
    const subagent = requireSubagentModel(content, opencodeModelLookup, "opencode");
    if (!subagent)
        return content;
    const { fmBlock, afterFm, parsed, name, model: opencodeModel } = subagent;
    const description = parsed.get("description") ?? "";
    const effort = parsed.get("effort");
    const toolsBlock = extractFrontmatterField(fmBlock, "tools");
    // autoCompactWindow dropped: no per-agent setting, see providers.md § Context compaction.
    let newFm = "---\n";
    newFm += `mode: subagent\n`;
    newFm += `name: ${name}\n`;
    if (description.includes("\n")) {
        const indented = description.split("\n").join("\n  ");
        newFm += `description: |\n  ${indented}\n`;
    }
    else {
        newFm += `description: ${description}\n`;
    }
    // Thinking effort is a model variant in its own `variant:` field. Program-keyed: every
    // opencode gateway shares the one "OpenCode" ladder; the gateway is not consulted —
    // except ollama, which cannot carry a variant at all (see the function docstring).
    const modelPin = formatModelPin("opencode", provider ?? "", opencodeModel);
    newFm += `model: ${modelPin}\n`;
    const variant = provider !== "ollama" && effort && effortMap
        ? clampOpencodeVariant(opencodeModel, lookupEffort(effortMap, "opencode", effort))
        : null;
    if (variant)
        newFm += `variant: ${variant}\n`;
    newFm += opencodeToolsBlock(toolsBlock);
    newFm += "---\n";
    return newFm + afterFm;
}
/**
 * Remap frontmatter `effort:` through the prompts.md effort table for a host column
 * (Claude / Cursor). Used by Claude (native `effort:`) and Cursor (emits `effort:` from
 * the Cursor column so thinking intent survives the T3 rewrite).
 */
export function applyEffortRemap(content, effortMap, host) {
    const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
    if (!fmMatch)
        return content;
    const fmBlock = fmMatch[2];
    const afterFm = content.slice(fmMatch[0].length);
    const parsed = parseFrontmatter(fmBlock);
    const effort = parsed.get("effort");
    if (!effort)
        return content;
    const mapped = lookupEffort(effortMap, host, effort);
    if (mapped === effort)
        return content;
    const newFm = fmBlock.replace(/^effort:\s*\S+\s*$/m, `effort: ${mapped}`);
    return `---\n${newFm}\n---\n${afterFm}`;
}
/**
 * Escape a body for a TOML basic multi-line string (`"""` … `"""`).
 *
 * The body is emitted as a basic multi-line string with every sequence that would terminate
 * or corrupt it (backslashes, a triple-quote run) neutralised.
 */
export function escapeTomlMultiline(body) {
    return body
        .replace(/\\/g, "\\\\") // backslash first, or the escapes below get double-escaped
        .replace(/"""/g, '\\"\\"\\"')
        .replace(/\r\n/g, "\n");
}
/** Emit a TOML `key = "value"` line, escaping the basic-string metacharacters. */
function tomlString(key, value) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `${key} = "${escaped}"\n`;
}
/**
 * Convert a Claude-format prompt (`.bkit/prompts/*.md`) into a Codex agent definition
 * (`.codex/agents/<name>.toml`).
 *
 * Field mapping — `name`, `description` and `developer_instructions` are REQUIRED by Codex:
 *   name                    <- frontmatter `name`
 *   description             <- frontmatter `description`
 *   developer_instructions  <- the markdown body
 *   model                   <- § Models `OpenAI` column (bare id; Codex names its gateway
 *                              in `[model_providers.<id>]`, not in the pin)
 *   model_reasoning_effort  <- § Effort `Codex` column
 *
 * NOT emitted — `tools:`. Codex has no per-agent tool allowlist (openai/codex#6049 is open);
 * `sandbox_mode` is not emitted either. The declared `tools:` block is NOT enforced on this
 * host (documented in providers.md).
 */
export function applyCodexAgent(content, codexModelLookup, effortMap) {
    const subagent = requireSubagentModel(content, codexModelLookup, "codex");
    if (!subagent)
        return content;
    const { afterFm, parsed, name, model } = subagent;
    const body = afterFm.trim();
    const effort = parsed.get("effort");
    // autoCompactWindow dropped: a role file's model_auto_compact_token_limit is discarded (openai/codex core/src/agent/role.rs:37-48).
    let out = "";
    out += tomlString("name", name);
    out += tomlString("description", parsed.get("description") ?? "");
    out += tomlString("model", formatModelPin("codex", "openai", model));
    if (effort && effortMap) {
        out += tomlString("model_reasoning_effort", lookupEffort(effortMap, "codex", effort));
    }
    out += `developer_instructions = """\n${escapeTomlMultiline(body)}\n"""\n`;
    return out;
}
/**
 * Session-prompt anchor prepended to every opencode command body. OpenCode
 * substitutes `$ARGUMENTS` with everything typed after the slash command before
 * the template is sent to the model; this anchor carries the user's input into the
 * command. One top anchor, at the head where the workflows' Step 1 issue-extraction
 * ("scan session prompt") reads it. The managed-version stamp is prepended afterwards,
 * so this renders just below it.
 */
export const OPENCODE_SESSION_PROMPT_ANCHOR = "**Session prompt:**\n\n$ARGUMENTS\n\n---\n\n";
/**
 * Command invocation rewrite, parameterised by the host's tool names. The rest of the
 * rewrite (the `@name` → `/name` respelling on **Subagent:** lines) is host-agnostic.
 * - `Agent` tool → the host's subagent tool (delegating to a child agent)
 * - `Skill` tool → the host's skill tool (loading a slash-command skill)
 * - @name → /name on **Subagent:** lines:
 *   - bare `**Subagent:** @name` (exact line)
 *   - real workflow shape `**Subagent:** Invoke \`@name\`…` (incl. indented lists)
 * - Caution placeholder `Invoke using \`@name\`` → `\`/name\``
 * Does NOT rewrite body prose, npm scopes, emails, or gate-checklist `@agent` refs.
 */
function rewriteInvocations(content, tools) {
    let result = content.replace(/`Agent` tool/g, `\`${tools.agent}\` tool`);
    result = result.replace(/using `Agent` tool/g, `using \`${tools.agent}\` tool`);
    result = result.replace(/`Skill` tool/g, `\`${tools.skill}\` tool`);
    result = result.replace(/using `Skill` tool/g, `using \`${tools.skill}\` tool`);
    // Backticked `@agent` on any **Subagent:** line (numbered, list-indented, or bare).
    result = result.replace(/^([^\n]*?\*\*Subagent:\*\*[^\n]*?)`@([a-z][a-z0-9-]*)`/gm, "$1`/$2`");
    // Bare `@agent` immediately after **Subagent:** (exact-line form).
    result = result.replace(/^([^\n]*?\*\*Subagent:\*\* )@([a-z][a-z0-9-]*)\b/gm, "$1/$2");
    result = result.replace(/Invoke using `@name`/g, "Invoke using `/name`");
    return result;
}
/**
 * Cursor command invocation rewrite. Cursor's one `Task` tool covers BOTH the subagent
 * and the skill surface, so both Claude tools rewrite to `Task`. Paired with applyT1 in
 * the Cursor render pipeline.
 */
export function applyT2(content) {
    return rewriteInvocations(content, { agent: "Task", skill: "Task" });
}
/**
 * OpenCode command invocation rewrite. OpenCode 2.0 splits the surfaces: delegating to a
 * child agent uses the `subagent` tool, and loading a skill uses the dedicated `skill`
 * tool. (OpenCode 1.x had a single `task` tool; 2.0 renamed it and added `skill`.)
 */
export function applyOpencodeToolRewrites(content) {
    return rewriteInvocations(content, { agent: "subagent", skill: "skill" });
}
/**
 * OC2: opencode command rewrite.
 * - Strips leading YAML frontmatter block (same as T1).
 * - Rewrites invocation spelling for opencode (see `applyOpencodeToolRewrites` — the
 *   `subagent` / `skill` tools, NOT Cursor's single `Task`).
 * - Prepends the session-prompt `$ARGUMENTS` anchor.
 */
export function applyOpencodeCommand(content) {
    // Step 1: strip frontmatter (same as T1)
    const stripped = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\n+/, "");
    // Step 2: rewrite invocations to opencode's tool names.
    const result = applyOpencodeToolRewrites(stripped);
    // Step 3: prepend the session-prompt anchor so the slash-command args survive.
    return OPENCODE_SESSION_PROMPT_ANCHOR + result;
}
// T1: Replace the leading YAML frontmatter block with its `description:` value as a
// plain first line, for Cursor commands. Cursor prints a command file's literal first
// line as the description in the picker and hover, and it does not read frontmatter.
// Derived from the frontmatter at render time. No frontmatter, or frontmatter without
// `description`, falls back to a plain strip.
export function applyT1(content) {
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!fm)
        return content;
    const body = content.slice(fm[0].length).replace(/^\n+/, "");
    const eol = fm[0].includes("\r\n") ? "\r\n" : "\n";
    const raw = parseFrontmatter(fm[1]).get("description")?.trim() ?? "";
    const description = raw.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
    return description ? `${description}${eol}${eol}${body}` : body;
}
// Parse simple YAML frontmatter block (key: value, or key: | multiline)
export function parseFrontmatter(fmBlock) {
    const map = new Map();
    const lines = fmBlock.split("\n");
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)/);
        if (!keyMatch) {
            i++;
            continue;
        }
        const key = keyMatch[1];
        const valueOnLine = keyMatch[2].trim();
        if (valueOnLine === "|") {
            const blockLines = [];
            i++;
            while (i < lines.length) {
                const nextLine = lines[i];
                if (/^[a-zA-Z_][a-zA-Z0-9_-]*:/.test(nextLine))
                    break;
                blockLines.push(nextLine.replace(/^ {2}/, ""));
                i++;
            }
            map.set(key, blockLines.join("\n").trim());
        }
        else {
            map.set(key, valueOnLine);
            i++;
        }
    }
    return map;
}
// Extract a YAML field's raw block (including continuation lines) from a frontmatter string.
// Handles both inline (`field: [a, b]`) and multi-line list (`field:\n  - a\n  - b`) formats.
// Returns null if field absent.
function extractFrontmatterField(fmBlock, field) {
    const re = new RegExp(`^(${field}:[ \\t]*[^\\n]*(?:\\n[ \\t]+[^\\n]*)*)`, "m");
    const m = fmBlock.match(re);
    return m ? m[1] : null;
}
// Shared opening of the subagent renderers: split off the frontmatter, require `name`, look
// the model up. Returns null when `content` has no frontmatter (the renderer passes it
// through); exits 1 when `name` or the model is missing. `host` qualifies the model-lookup
// message ("" for the unqualified Cursor message).
function requireSubagentModel(content, lookup, host) {
    const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
    if (!fmMatch)
        return null;
    const fmBlock = fmMatch[2];
    const parsed = parseFrontmatter(fmBlock);
    const name = parsed.get("name") ?? "";
    if (!name) {
        console.error(`${LOG_PREFIX} Subagent frontmatter missing 'name' field`);
        process.exit(1);
    }
    const model = lookup.get(name);
    if (!model) {
        console.error(`${LOG_PREFIX} Missing ${host ? `${host} ` : ""}model lookup for ${name}`);
        process.exit(1);
    }
    return { fmBlock, afterFm: content.slice(fmMatch[0].length), parsed, name, model };
}
// T3: Cursor subagent frontmatter rewrite.
// Emits: name, description, model, tools (passthrough — Cursor 2.4+ accepts identical tool names per BAR-113),
// effort (from prompts.md Cursor column). Drops: permissionMode, maxTurns, readonly, is_background.
// Hard-fails with non-zero exit if model lookup missing for name.
export function applyT3(content, modelLookup, effortMap) {
    const subagent = requireSubagentModel(content, modelLookup, "");
    if (!subagent)
        return content;
    const { fmBlock, afterFm, parsed, name, model: cursorModel } = subagent;
    const description = parsed.get("description") ?? "";
    const effort = parsed.get("effort");
    const toolsBlock = extractFrontmatterField(fmBlock, "tools");
    // autoCompactWindow dropped: no per-agent setting, see providers.md § Context compaction.
    let newFm = "---\n";
    newFm += `name: ${name}\n`;
    if (description.includes("\n")) {
        const indented = description.split("\n").join("\n  ");
        newFm += `description: |\n  ${indented}\n`;
    }
    else {
        newFm += `description: ${description}\n`;
    }
    newFm += `model: ${formatModelPin("cursor", "cursor", cursorModel)}\n`;
    if (effort && effortMap) {
        newFm += `effort: ${lookupEffort(effortMap, "cursor", effort)}\n`;
    }
    if (toolsBlock)
        newFm += `${toolsBlock}\n`;
    newFm += "---\n";
    return newFm + afterFm;
}
/**
 * Antigravity subagent-definition directory — the `agents/` folder of the bkit workspace
 * plugin (`.agents/plugins/bkit/`). The host install lives entirely inside the plugin so
 * `.agents/` root stays Codex's.
 */
export const ANTIGRAVITY_AGENTS_DIR = ".agents/plugins/bkit/agents";
/**
 * Antigravity command/skill invocation rewrite. Antigravity has no native subagent tool:
 * the orchestrator loads a subagent prompt in-session with `view_file` and executes its
 * step contract, so both Claude tools (`Agent` / `Skill`) respell to `view_file`. A
 * `**Subagent:** @name` reference resolves to the rendered prompt file it must load
 * (`<agentsDir>/<name>.md`). Does NOT rewrite body prose or gate-checklist `@agent` refs.
 */
export function applyAntigravityToolRewrites(content, agentsDir = ANTIGRAVITY_AGENTS_DIR) {
    let result = content.replace(/`Agent` tool/g, "`view_file` tool");
    result = result.replace(/using `Agent` tool/g, "using `view_file` tool");
    result = result.replace(/`Skill` tool/g, "`view_file` tool");
    result = result.replace(/using `Skill` tool/g, "using `view_file` tool");
    // Backticked `@agent` on any **Subagent:** line (numbered, list-indented, or bare).
    result = result.replace(/^([^\n]*?\*\*Subagent:\*\*[^\n]*?)`@([a-z][a-z0-9-]*)`/gm, `$1\`view_file\` \`${agentsDir}/$2.md\``);
    // Bare `@agent` immediately after **Subagent:** (exact-line form).
    result = result.replace(/^([^\n]*?\*\*Subagent:\*\* )@([a-z][a-z0-9-]*)\b/gm, `$1\`view_file\` \`${agentsDir}/$2.md\``);
    result = result.replace(/Invoke using `@name`/g, `Invoke using \`view_file\` \`${agentsDir}/name.md\``);
    return result;
}
/**
 * Convert a Claude-format subagent prompt (`.bkit/core/prompts/*.md`) into an Antigravity
 * prompt (`.agents/plugins/bkit/agents/<name>.md`).
 *
 * Antigravity loads subagent prompts from `.agents/plugins/bkit/agents/` and executes them
 * in-session (the orchestrator loads the file with `view_file`). The frontmatter is rewritten to
 * Antigravity's vocabulary: `name`/`description` preserved, the model pin from the
 * `.bkit/prompts.md` § Models `Google` column (bare `gemini-3.8-*` id), the thinking
 * `effort` remapped through the `Antigravity` column, and the `tools:` block respelled to
 * Antigravity tool names. Claude-only fields (permissionMode, maxTurns, is_background,
 * readonly) are dropped. Hard-fails with non-zero exit if the model lookup is missing.
 */
export function applyAntigravityPrompt(content, modelLookup, effortMap) {
    const subagent = requireSubagentModel(content, modelLookup, "antigravity");
    if (!subagent)
        return content;
    const { fmBlock, afterFm, parsed, name, model } = subagent;
    const description = parsed.get("description") ?? "";
    const effort = parsed.get("effort");
    const toolsBlock = extractFrontmatterField(fmBlock, "tools");
    // autoCompactWindow dropped: no per-agent setting, see providers.md § Context compaction.
    let newFm = "---\n";
    newFm += `name: ${name}\n`;
    if (description.includes("\n")) {
        const indented = description.split("\n").join("\n  ");
        newFm += `description: |\n  ${indented}\n`;
    }
    else {
        newFm += `description: ${description}\n`;
    }
    newFm += `model: ${formatModelPin("antigravity", "google", model)}\n`;
    if (effort && effortMap) {
        newFm += `effort: ${lookupEffort(effortMap, "antigravity", effort)}\n`;
    }
    newFm += antigravityToolsBlock(toolsBlock);
    newFm += "---\n";
    return newFm + afterFm;
}
/**
 * Convert a workflow orchestrator (`.bkit/core/workflows/*.md`) into an Antigravity
 * SKILL.md (`.agents/plugins/bkit/skills/<name>/SKILL.md`). Antigravity auto-discovers
 * skills under a workspace plugin's `skills/`; `name` and `description` are frontmatter
 * keys, and the body is the workflow steps verbatim with invocations respelled to
 * Antigravity's in-session prompt loading (see applyAntigravityToolRewrites).
 */
export function applyAntigravitySkill(content, skillName, agentsDir = ANTIGRAVITY_AGENTS_DIR) {
    const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
    let body;
    let description = `bkit ${skillName} workflow`;
    if (fmMatch) {
        const parsed = parseFrontmatter(fmMatch[2]);
        description = (parsed.get("description") ?? description).replace(/^"|"$/g, "");
        body = content.slice(fmMatch[0].length);
    }
    else {
        body = content;
    }
    const rewritten = applyAntigravityToolRewrites(body, agentsDir);
    return `---\nname: ${skillName}\ndescription: "${description.replace(/"/g, '\\"')}"\n---\n${rewritten}`;
}
