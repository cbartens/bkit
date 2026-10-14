// checks/tips/catalogue.ts — the setup-tip catalogue: one entry per template, tool or
// setting a consumer has not set up yet. Each workflow prints one tip at its close
// (`bkit tips --workflow=<name>`); `bkit tips` prints the top three; `.bkit/advisories.md`
// lists every firing tip under `Setup tips`.
//
// Array order is the priority: comms first (can workflows reach anything), then change
// quality (design → build), delivery (debug → ship), running cost, nice-to-have, and
// setup-specific plumbing last. `workflows` names where a tip matters: a workflow shows
// its own tips first, in array order, then the rest. Comms tips name every workflow, so
// they lead everywhere until fixed.
//
// Text rules: `line`, `why`, `caution` and `ask` are for the person, in plain English, and
// never name an outside service — examples of specific services go in `steps`, which is
// for the agent. A template's benefit reads the same here, in its `.bkit/templates.md`
// section opener and in the README's "Templates ready to adopt" row; change all three in
// the same commit.
//
// Detection rules: every `fires` is local (files, settings, environment) — no network.
// Where an advisory already detects the gap, `fires` calls that detector and `advisories`
// names its ids, so the tip and the advisory can never disagree and one
// `bkit.ignoreAdvisories` entry silences both.
import { detectContextFetchMissing } from "../before/context-fetch.js";
import { detectBlankDotenvKeys, detectDirenvMissing, detectDirenvNotAllowed, detectMissingDotenv, isCloudOrCi, } from "../before/env.js";
import { detectGhMcpToken, hasGithubMcpServer } from "../after/auth.js";
import { buildTrackerSetupAdvisory, readConsumerCloudAgents, readConsumerIssueTracker, } from "../after/github.js";
import { buildDepUpdaterSetupAdvisory } from "../after/tools.js";
import { detectInstalledHostModules } from "../../install/hosts.js";
import { readBkitConfig } from "../../shared/settings.js";
import { claudeSettingsHas, codexTopLevelHas, exists, hasLintStagedConfig, hasMcpServer, unlockedMcpServers, } from "./detect.js";
const hosts = (cwd) => detectInstalledHostModules(cwd);
/** Every phase workflow. A value import of `COMPLY_PHASES` would cycle through cli.ts. */
export const ALL_WORKFLOWS = ["design", "plan", "build", "debug", "ship"];
export const SETUP_TIPS = [
    // --- connect: can bkit talk to anything at all -------------------------------------
    {
        id: "tracker",
        workflows: ALL_WORKFLOWS,
        title: "Connect an issue tracker",
        line: "bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub or Linear, or switch this tip off if you don't want one.",
        why: "Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why.",
        ask: 'Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.issueTracker` in package.json and adds the tracker server to .mcp.json). If I don\'t want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead.',
        steps: '`.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "issueTracker": "none" }` in `package.json`.',
        advisories: ["tracker-setup-none"],
        fires: (cwd) => buildTrackerSetupAdvisory(cwd)?.id === "tracker-setup-none",
    },
    {
        id: "gh-mcp",
        workflows: ALL_WORKFLOWS,
        title: "Give bkit its GitHub token",
        line: "You chose GitHub as your tracker, but bkit has no GitHub token, so every attempt to read an issue or open a pull request will fail. Add the token.",
        why: "Choosing GitHub only tells bkit where your issues live. The token is what lets it actually sign in. Without it the setting looks right but nothing works, which is confusing to track down.",
        ask: "Add my GitHub token as `BKIT_GH_TOKEN` in .bkit/.env, check .mcp.json has the `github` server, then run `direnv allow` and tell me to restart the editor.",
        steps: "`.bkit/install.md` § Local env setup. The `github` server entry belongs in `.mcp.json` / `.cursor/mcp.json` (`.bkit/cloud.md` § MCP issue-tracker integration).",
        advisories: ["gh-mcp-token-unset-shell", "gh-mcp-token-empty-shell"],
        fires: (cwd) => readConsumerIssueTracker(cwd) === "github" &&
            (!hasGithubMcpServer(cwd) || detectGhMcpToken(cwd) !== null),
    },
    {
        id: "bkit-env",
        workflows: ALL_WORKFLOWS,
        title: "Create bkit's private settings file",
        line: "bkit's private settings file (.bkit/.env) is missing or has blank entries, so nothing that needs to sign in can. Create it and fill it in.",
        why: "This one file holds the sign-in tokens every bkit tool reads. It's never shared or committed. Most other tips depend on it, so do this one early.",
        ask: "Copy .bkit/.env.example to .bkit/.env and tell me which values I need to fill in.",
        steps: "`.bkit/install.md` § Local env setup.",
        advisories: ["mcp-env-missing-dotenv", "mcp-env-blank-key-*"],
        fires: (cwd) => {
            if (isCloudOrCi())
                return false;
            const tracker = readConsumerIssueTracker(cwd);
            return (detectMissingDotenv(cwd, tracker) !== null || detectBlankDotenvKeys(cwd, tracker).length > 0);
        },
    },
    {
        id: "direnv",
        workflows: ALL_WORKFLOWS,
        title: "Load your tokens automatically",
        line: "Your sign-in tokens are saved in .bkit/.env but not being loaded, so sign-ins will fail even though the file looks right. Set up direnv so they load whenever you open the project.",
        why: "A saved file does nothing until something reads it. This is the most frustrating kind of breakage: nothing looks wrong, but every sign-in fails. direnv (a small tool that loads settings when you open a folder) fixes it once.",
        ask: "Copy .bkit/templates/.envrc to .envrc, install direnv if it's missing (`brew install direnv` on a Mac, then add its shell hook), and run `direnv allow`.",
        steps: "`.bkit/templates.md` § direnv.",
        advisories: ["mcp-env-direnv-missing", "mcp-env-direnv-not-allowed"],
        fires: (cwd) => {
            if (isCloudOrCi() || !exists(cwd, ".bkit/.env"))
                return false;
            const tracker = readConsumerIssueTracker(cwd);
            return (!exists(cwd, ".envrc") ||
                detectDirenvMissing(cwd, tracker) !== null ||
                detectDirenvNotAllowed(cwd, tracker) !== null);
        },
    },
    // --- quality: is the change good -----------------------------------------------------
    {
        id: "serena",
        workflows: ["design", "plan", "build"],
        title: "Let agents look code up directly",
        line: "Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.",
        why: 'Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.',
        ask: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena).",
        steps: "`.bkit/templates.md` § Serena.",
        fires: (cwd) => !exists(cwd, ".serena/project.yml") || !hasMcpServer(cwd, "serena"),
    },
    {
        id: "ci-workflow",
        workflows: ["build", "ship"],
        title: "Automatic checks on every change",
        line: "Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.",
        why: 'This runs your tests and checks on GitHub every time something changes, and bkit\'s ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".',
        ask: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/bkit-ci.yml, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts.",
        steps: "`.bkit/templates.md` § CI workflow and § Gate tool scripts.",
        fires: (cwd) => !exists(cwd, `.github/workflows/${readBkitConfig(cwd).ciWorkflow}`),
    },
    {
        id: "husky",
        workflows: ["build"],
        title: "Catch problems before they leave your machine",
        line: "Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git.",
        why: "These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more.",
        ask: 'Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`.',
        steps: "`.bkit/templates.md` § Git hooks.",
        fires: (cwd) => !exists(cwd, ".husky/pre-commit"),
    },
    {
        id: "prettier",
        workflows: ["build"],
        title: "Consistent formatting",
        line: "There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.",
        why: "Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.",
        ask: 'Copy .bkit/templates/.prettierignore to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts.',
        steps: "`.bkit/templates.md` § Prettier.",
        fires: (cwd) => !exists(cwd, ".prettierignore"),
    },
    {
        id: "slop-scan",
        workflows: ["build"],
        title: "Catch junk code",
        line: "Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.",
        why: "Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.",
        ask: 'Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"slop:delta": "bkit ci slop"` to the package.json scripts.',
        steps: "`.bkit/templates.md` § slop-scan.",
        fires: (cwd) => !exists(cwd, "slop-scan.config.json"),
    },
    {
        id: "vale",
        workflows: ["design", "plan"],
        title: "Keep written docs tight",
        line: "Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.",
        why: "Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.",
        ask: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/House/ to .vale/styles/House/, then run `vale sync`.",
        steps: "`.bkit/templates.md` § Vale.",
        fires: (cwd) => !exists(cwd, ".vale.ini"),
    },
    {
        id: "lint-staged",
        workflows: ["build"],
        title: "Quick tidy-up on commit",
        line: "The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.",
        why: "It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.",
        ask: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/.lintstagedrc.json to .lintstagedrc.json.",
        steps: "`.bkit/templates.md` § lint-staged.",
        fires: (cwd) => !hasLintStagedConfig(cwd),
    },
    // --- delivery: did it land well ------------------------------------------------------
    {
        id: "cloud",
        workflows: ["ship"],
        title: "Finish cloud setup",
        line: "You've turned on cloud agents, but setup isn't finished, so cloud runs will stop partway. Finish the remaining steps.",
        why: "With cloud agents, bkit runs on its own: a change that passes its checks gets shipped and one that fails gets investigated, with nobody at the keyboard. That only works once every piece is in place.",
        ask: "Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml and .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh to .claude/hooks/ (for Cursor: .bkit/templates/.cursor/environment.json and .bkit/templates/.cursor/Dockerfile to .cursor/), run `gh secret set ANTHROPIC_API_KEY`, then tell me which dashboard settings are left.",
        steps: "`.bkit/cloud.md`; `.bkit/templates.md` § Cloud-agent workflow and § Cursor.",
        fires: (cwd) => {
            const cloud = readConsumerCloudAgents(cwd);
            if (cloud === "none")
                return false;
            if (cloud === "cursor") {
                return !exists(cwd, ".cursor/environment.json") || !exists(cwd, ".cursor/Dockerfile");
            }
            if (!exists(cwd, ".github/workflows/bkit-cloud.yml"))
                return true;
            return cloud === "claude" && !exists(cwd, ".claude/hooks/bkit-cloud-bootstrap.sh");
        },
    },
    {
        id: "context-fetch",
        workflows: ["debug"],
        title: "Let debugging see real errors",
        line: "When something breaks, the debug workflow can't see your live error reports or logs, so it has to guess from the code. Connect the services you use.",
        why: "This lets /bkit-debug read the actual errors from your error tracker, hosting and database. Without it the agent works from guesses, and real problems stay hidden because nothing brings in the evidence.",
        ask: "Copy the blocks for the services this project uses from .bkit/templates/context/ into .agents/context.md, below the `<!-- bkit:end -->` line, then tell me which tokens to add to .bkit/.env.",
        steps: "`.bkit/templates.md` § Context-fetch blocks.",
        advisories: ["context-fetch-missing"],
        fires: (cwd) => detectContextFetchMissing(cwd) !== null,
    },
    {
        id: "secrets-sync",
        workflows: ["debug", "ship"],
        title: "Keep passwords the same everywhere",
        line: "Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere.",
        why: 'The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values.',
        ask: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`.",
        steps: "`.bkit/templates.md` § Secrets sync.",
        fires: (cwd) => !exists(cwd, "scripts/secrets"),
    },
    // --- cost: running cost ---------------------------------------------------------------
    {
        id: "compaction-window",
        workflows: ["design", "plan", "build"],
        title: "Summarise long sessions earlier",
        line: "Long sessions only summarise themselves when they're nearly full, so every step re-reads a huge history, and that re-reading is most of what a run costs. Set an earlier summarise point.",
        why: "Each request re-reads the whole session so far. Left at the default, a session grows close to the model's full size before it summarises, and most subagents never summarise at all. An earlier summarise point keeps every request smaller.",
        caution: "Summaries lose some detail. A summarise point set too low can stop agents mid-run. 300,000 tokens is a starting value, not yet checked on a real build.",
        ask: 'Add `"autoCompactWindow": 300000` to .claude/settings.json. For Codex, add `model_auto_compact_token_limit = 300000` at the top of .codex/config.toml, above the first `[section]`.',
        steps: '`.bkit/providers.md` § Context compaction. Claude Code: `"autoCompactWindow": 300000` in `.claude/settings.json`. Codex: `model_auto_compact_token_limit = 300000` in `.codex/config.toml`, above the first `[section]` header.',
        fires: (cwd) => {
            const h = hosts(cwd);
            return ((h.has("claude") && !claudeSettingsHas(cwd, "autoCompactWindow")) ||
                (h.has("codex") && !codexTopLevelHas(cwd, "model_auto_compact_token_limit")));
        },
    },
    {
        id: "mcp-scope",
        workflows: ["design", "plan", "debug"],
        title: "Lock MCP servers to this project",
        line: "Some of this project's MCP servers can see every project on your account, so agents spend calls working out which one is yours. Lock them to this project.",
        why: "An MCP server (a connection that lets an agent use an outside service directly) that can see your whole account makes agents look up account and project IDs before they can do anything. Locked to one project, those lookup steps disappear and every call goes straight to the right place.",
        ask: "Lock each server URL in .mcp.json, .cursor/mcp.json and .opencode/opencode.json to this project, following .bkit/providers.md § MCP project scope.",
        steps: "`.bkit/providers.md` § MCP project scope. Lock the server URL to one account and project in every host's MCP file, e.g. `https://mcp.sentry.dev/mcp/<org>/<project>`, `https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true`, `https://mcp.vercel.com/<team>/<project>`.",
        fires: (cwd) => unlockedMcpServers(cwd).length > 0,
    },
    {
        id: "claude-connectors",
        workflows: ["design", "plan"],
        title: "Stop loading claude.ai connectors in this project",
        line: "Claude Code loads every connector on your claude.ai account in this project (for example email, calendar or file storage) and sends their names with every request, even when unused. If agents here don't use them, switch them off for this project.",
        why: "Every connector's tool names are re-sent on every request, which is the largest part of the starting load you can remove. The connectors keep working in ordinary Claude chats (web and desktop app) and in cloud routines; only Claude Code in this project stops loading them.",
        ask: 'Check whether agents in this project use any claude.ai connectors. If none, add `"disableClaudeAiConnectors": true` to .claude/settings.json.',
        steps: '`.bkit/providers.md` § claude.ai connectors. Move anything agents use through a connector onto the project\'s MCP file first, then set `"disableClaudeAiConnectors": true` in `.claude/settings.json`.',
        fires: (cwd) => hosts(cwd).has("claude") && !claudeSettingsHas(cwd, "disableClaudeAiConnectors"),
    },
    // --- optional: nice to have ------------------------------------------------------------
    {
        id: "graphify",
        workflows: ["design", "plan"],
        title: "A map of the code",
        line: "Optional: add graphify to keep an up-to-date map of how your code fits together.",
        why: "With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.",
        ask: 'Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify.',
        steps: "`.bkit/templates.md` § graphify.",
        fires: (cwd) => !exists(cwd, "scripts/graphify"),
    },
    {
        id: "dependabot-renovate",
        workflows: ["ship"],
        title: "Automatic updates",
        line: "Nothing keeps the project's libraries up to date. Add an updater so you get small, safe updates instead of one big risky one later.",
        why: "An updater opens a small pull request whenever a library you use has a new version. Skip it and updates pile up into one large upgrade that's far more likely to break something.",
        ask: "Copy .bkit/templates/.github/dependabot.yml to .github/dependabot.yml (or .bkit/templates/.github/renovate.json5 to .github/renovate.json5 for Renovate instead) and commit it to the default branch.",
        steps: "`.bkit/templates.md` § Dependabot and Renovate.",
        advisories: ["dep-updater-absent"],
        fires: (cwd) => buildDepUpdaterSetupAdvisory(cwd)?.id === "dep-updater-absent",
    },
    {
        id: "prettier-tables",
        workflows: ["design", "plan"],
        title: "Readable table changes",
        line: "Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed.",
        why: "Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved.",
        ask: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`.",
        steps: "`.bkit/templates.md` § Prettier tables.",
        fires: (cwd) => !exists(cwd, "scripts/prettier/bkit-insert-ignore.mjs"),
    },
    // --- setup: only some setups -----------------------------------------------------------
    {
        id: "cursor-files",
        title: "Cursor editor settings",
        line: "You use Cursor, but bkit's editor settings aren't added, so files aren't formatted when you save them. Add them.",
        why: "The settings file turns on format-on-save and recommends the project's extensions, so every edit made in Cursor already matches the project's formatting.",
        ask: "Copy .bkit/templates/.cursor/settings.json to .cursor/settings.json.",
        steps: "`.bkit/templates.md` § Cursor.",
        fires: (cwd) => hosts(cwd).has("cursor") && !exists(cwd, ".cursor/settings.json"),
    },
    {
        id: "launchd",
        title: "Tokens for apps opened from the Dock",
        line: "On a Mac, apps opened from the Dock don't see your sign-in tokens, so they start signed out even though the same thing works in the terminal. Add bkit's loader.",
        why: "The terminal loads your tokens, but apps started from the Dock or Finder skip that step. This one-time setup gives those apps the tokens too.",
        ask: "Copy .bkit/templates/scripts/launchd/bkit-launchd-env.sh to scripts/launchd/, .bkit/templates/scripts/launchd/launchd.env.example to ~/.config/bkit/launchd.env and .bkit/templates/scripts/launchd/ai.bkit.launchd.plist to ~/Library/LaunchAgents/ (fill in its paths), then run `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.",
        steps: "`.bkit/templates.md` § Launchd GUI environment.",
        fires: (cwd) => {
            if (process.platform !== "darwin" || isCloudOrCi())
                return false;
            const h = hosts(cwd);
            return (h.has("cursor") || h.has("opencode")) && !exists(cwd, "scripts/launchd");
        },
    },
];
