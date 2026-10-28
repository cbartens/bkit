// checks/tips/catalogue.ts — the setup-tip catalogue: one entry per template, tool or
// setting a consumer has not set up yet. Each workflow, `@bkit-audit-generate` and the
// ledger / roadmap updaters print one tip at their close (`bkit tips --workflow=<name>`,
// `audit` / `utility` for the agents); `bkit tips` prints the top three;
// `.bkit/advisories.md` lists every firing tip under `Setup tips`.
//
// Array order is the priority: comms first (can workflows reach anything), then change
// quality (design → build), delivery (debug → ship), running cost, nice-to-have, and
// setup-specific plumbing last. `workflows` names where a tip matters: a workflow shows
// its own tips first, in array order, then the rest. Comms tips name every context, so
// they lead everywhere until fixed.
//
// Text rules: `line`, `why`, `caution` and `ask` are for the person, in plain English, and
// never name an outside service — examples of specific services go in `steps`, which is
// for the agent. A template's benefit reads the same here, in its `.bkit/templates.md`
// section opener and in the README's "Templates ready to adopt" row; change all three in
// the same commit.
//
// Detection rules: every `fires` is local (files, settings, environment) — no network. The
// `cwd` it receives is the main checkout (checks/tips/index.ts `tipsBase`), never the
// calling worktree, so a tip reflects the repo the integration branch carries.
// Where an advisory already detects the gap, `fires` calls that detector and `advisories`
// names its ids, so the tip and the advisory can never disagree and one
// `bkit.advisories.ignore` entry silences both.

import * as fs from "node:fs";
import * as path from "node:path";

import { machineStepsPath, REPO_STEPS } from "../../commands/workflow/disk.js";
import { detectContextFetchMissing } from "../before/context-fetch.js";
import {
  detectBlankDotenvKeys,
  detectDirenvMissing,
  detectDirenvNotAllowed,
  detectMissingDotenv,
  isCloudOrCi,
} from "../before/env.js";
import { detectGhMcpToken, hasGithubMcpServer } from "../after/auth.js";
import { buildTrackerSetupAdvisory } from "../after/github.js";
import { buildDepUpdaterSetupAdvisory } from "../after/tools.js";
import { detectInstalledHostModules } from "../../install/hosts.js";
import { readBkitConfig } from "../../shared/settings.js";
import type { ComplyPhase, TipsContext } from "../../cli.js";
import {
  anyWorkflowMentions,
  claudeSettingsHas,
  codexTopLevelHas,
  exists,
  hasJsTestRunner,
  hasLintStagedConfig,
  hasMcpServer,
  hasTestLinter,
  readsBkitText,
  unlockedMcpServers,
} from "./detect.js";

export interface SetupTip {
  /** `bkit.advisories.ignore` key; never an advisory id (those go in `advisories`). */
  id: string;
  /** Contexts the tip matters in; absent = shown only after every context's own tips. */
  workflows?: readonly TipsContext[];
  /** Short label. */
  title: string;
  /** What `bkit tips` prints: what goes wrong today, then what to do. */
  line: string;
  /** What goes wrong without it, for the person. */
  why: string;
  /** Printed with the tip wherever it appears. */
  caution?: string;
  /** A sentence the person can paste to their agent. */
  ask: string;
  /** Where the agent finds the exact steps. */
  steps: string;
  /** Advisory ids this tip reuses the check of; a trailing `*` matches an id prefix. */
  advisories?: readonly string[];
  /** True when the gap exists. Local checks only. */
  fires: (cwd: string) => boolean;
}

const hosts = (cwd: string) => detectInstalledHostModules(cwd);

/** Every phase workflow. A value import of `COMPLY_PHASES` would cycle through cli.ts. */
export const ALL_WORKFLOWS: readonly ComplyPhase[] = ["design", "plan", "build", "debug", "ship"];

/** Every `bkit tips --workflow=` context: the phase workflows, then the two agent closes. */
export const EVERY_CONTEXT: readonly TipsContext[] = [...ALL_WORKFLOWS, "audit", "utility"];

export const SETUP_TIPS: readonly SetupTip[] = [
  // --- connect: can bkit talk to anything at all -------------------------------------
  {
    id: "tracker",
    workflows: EVERY_CONTEXT,
    title: "Connect an issue tracker",
    line: "bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one.",
    why: "Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why.",
    ask: 'Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don\'t want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead.',
    steps:
      '`.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`.',
    advisories: ["tracker-setup-none"],
    fires: (cwd) => buildTrackerSetupAdvisory(cwd)?.id === "tracker-setup-none",
  },
  {
    id: "gh-mcp",
    workflows: EVERY_CONTEXT,
    title: "Give bkit its GitHub token",
    line: "You chose GitHub as your tracker, but bkit has no GitHub token, so every attempt to read an issue or open a pull request will fail. Add the token.",
    why: "Choosing GitHub only tells bkit where your issues live. The token is what lets it actually sign in. Without it the setting looks right but nothing works, which is confusing to track down.",
    ask: "Add my GitHub token as `BKIT_GH_TOKEN` in .bkit/.env, check .mcp.json has the `github` server, then run `direnv allow` and tell me to restart the editor.",
    steps:
      "`.bkit/install.md` § Local env setup. The `github` server entry belongs in `.mcp.json` / `.cursor/mcp.json` (`.bkit/cloud.md` § MCP issue-tracker integration).",
    advisories: ["gh-mcp-token-unset-shell", "gh-mcp-token-empty-shell"],
    fires: (cwd) =>
      readBkitConfig(cwd).issueTracker === "github" &&
      (!hasGithubMcpServer(cwd) || detectGhMcpToken(cwd) !== null),
  },
  {
    id: "bkit-env",
    workflows: EVERY_CONTEXT,
    title: "Create bkit's private settings file",
    line: "bkit's private settings file (.bkit/.env) is missing or has blank entries, so nothing that needs to sign in can. Create it and fill it in.",
    why: "This one file holds the sign-in tokens every bkit tool reads. It's never shared or committed. Most other tips depend on it, so do this one early.",
    ask: "Copy .bkit/.env.example to .bkit/.env and tell me which values I need to fill in.",
    steps: "`.bkit/install.md` § Local env setup.",
    advisories: ["mcp-env-missing-dotenv", "mcp-env-blank-key-*"],
    fires: (cwd) => {
      if (isCloudOrCi()) return false;
      const tracker = readBkitConfig(cwd).issueTracker;
      return (
        detectMissingDotenv(cwd, tracker) !== null || detectBlankDotenvKeys(cwd, tracker).length > 0
      );
    },
  },
  {
    id: "direnv",
    workflows: EVERY_CONTEXT,
    title: "Load your tokens automatically",
    line: "Your sign-in tokens are saved in .bkit/.env but not being loaded, so sign-ins will fail even though the file looks right. Set up direnv so they load whenever you open the project.",
    why: "A saved file does nothing until something reads it. This is the most frustrating kind of breakage: nothing looks wrong, but every sign-in fails. direnv (a small tool that loads settings when you open a folder) fixes it once.",
    ask: "Copy .bkit/templates/.envrc to .envrc, install direnv if it's missing (`brew install direnv` on a Mac, then add its shell hook), and run `direnv allow`.",
    steps: "`.bkit/templates.md` § direnv.",
    advisories: ["mcp-env-direnv-missing", "mcp-env-direnv-not-allowed"],
    fires: (cwd) => {
      if (isCloudOrCi() || !exists(cwd, ".bkit/.env")) return false;
      const tracker = readBkitConfig(cwd).issueTracker;
      return (
        !exists(cwd, ".envrc") ||
        detectDirenvMissing(cwd, tracker) !== null ||
        detectDirenvNotAllowed(cwd, tracker) !== null
      );
    },
  },

  // --- quality: is the change good -----------------------------------------------------
  {
    id: "serena",
    workflows: ["design", "plan", "build", "audit", "utility"],
    title: "Let agents look code up directly",
    line: "Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.",
    why: 'Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.',
    ask: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena).",
    steps: "`.bkit/templates.md` § Serena.",
    fires: (cwd) => !exists(cwd, ".serena/project.yml") || !hasMcpServer(cwd, "serena"),
  },
  {
    id: "ci-workflow",
    workflows: ["build", "ship", "audit"],
    title: "Automatic checks on every change",
    line: "Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.",
    why: 'This runs your tests and checks on GitHub every time something changes, and bkit\'s ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".',
    ask: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts.",
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
    id: "test-lint",
    workflows: ["build"],
    title: "Catch tests that can't fail",
    line: "Nothing checks your test files, so a test that asserts nothing, or asserts only inside an if, still passes and the suite stays green having proved nothing. Add Oxlint with bkit's test rules.",
    why: "Oxlint (a fast code linter) fails the check on a test with no assertion, a branch inside a test, an assertion that may never run, a malformed assertion, or a promise nobody waits for. Without it those tests pass whatever the code does.",
    ask: "Run `pnpm add -D oxlint oxlint-tsgolint`, copy .bkit/templates/.oxlintrc.json to .oxlintrc.json, and set the `lint` script in package.json to run `oxlint -c .oxlintrc.json --type-aware --deny-warnings` (add `&&` and the current lint command if the script already has one). Then fix every hit in the tests themselves.",
    steps: "`.bkit/templates.md` § Oxlint.",
    fires: (cwd) => hasJsTestRunner(cwd) && !hasTestLinter(cwd),
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
    ask: "Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml and .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh to .claude/hooks/ (for Cursor: .bkit/templates/.cursor/environment.json and .bkit/templates/.cursor/Dockerfile to .cursor/), run `gh secret set ANTHROPIC_API_KEY` (or, keyless, `gh variable set` ANTHROPIC_FEDERATION_RULE_ID and ANTHROPIC_ORGANIZATION_ID from a Claude Console federation rule), then tell me which dashboard settings are left.",
    steps: "`.bkit/cloud.md`; `.bkit/templates.md` § Cloud-agent workflow and § Cursor.",
    fires: (cwd) => {
      const cloud = readBkitConfig(cwd).cloudAgents;
      if (cloud === "none") return false;
      if (cloud === "cursor") {
        return !exists(cwd, ".cursor/environment.json") || !exists(cwd, ".cursor/Dockerfile");
      }
      if (!exists(cwd, ".github/workflows/bkit-cloud.yml")) return true;
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
    caution:
      "Summaries lose some detail. A summarise point set too low can stop agents mid-run. 300,000 tokens is a starting value, not yet checked on a real build.",
    ask: 'Add `"autoCompactWindow": 300000` to .claude/settings.json. For Codex, add `model_auto_compact_token_limit = 300000` at the top of .codex/config.toml, above the first `[section]`.',
    steps:
      '`.bkit/providers.md` § Context compaction. Claude Code: `"autoCompactWindow": 300000` in `.claude/settings.json`. Codex: `model_auto_compact_token_limit = 300000` in `.codex/config.toml`, above the first `[section]` header.',
    fires: (cwd) => {
      const h = hosts(cwd);
      return (
        (h.has("claude") && !claudeSettingsHas(cwd, "autoCompactWindow")) ||
        (h.has("codex") && !codexTopLevelHas(cwd, "model_auto_compact_token_limit"))
      );
    },
  },
  {
    id: "mcp-scope",
    workflows: ["design", "plan", "debug"],
    title: "Lock MCP servers to this project",
    line: "Some of this project's MCP servers can see every project on your account, so agents spend calls working out which one is yours. Lock them to this project.",
    why: "An MCP server (a connection that lets an agent use an outside service directly) that can see your whole account makes agents look up account and project IDs before they can do anything. Locked to one project, those lookup steps disappear and every call goes straight to the right place.",
    ask: "Lock each server URL in .mcp.json, .cursor/mcp.json and .opencode/opencode.json to this project, following .bkit/providers.md § MCP project scope.",
    steps:
      "`.bkit/providers.md` § MCP project scope. Lock the server URL to one account and project in every host's MCP file, e.g. `https://mcp.sentry.dev/mcp/<org>/<project>`, `https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true`, `https://mcp.vercel.com/<team>/<project>`.",
    fires: (cwd) => unlockedMcpServers(cwd).length > 0,
  },
  {
    id: "claude-connectors",
    workflows: ["design", "plan"],
    title: "Stop loading claude.ai connectors in this project",
    line: "Claude Code loads every connector on your claude.ai account in this project (for example email, calendar or file storage) and sends their names with every request, even when unused. If agents here don't use them, switch them off for this project.",
    why: "Every connector's tool names are re-sent on every request, which is the largest part of the starting load you can remove. The connectors keep working in ordinary Claude chats (web and desktop app) and in cloud routines; only Claude Code in this project stops loading them.",
    ask: 'Check whether agents in this project use any claude.ai connectors. If none, add `"disableClaudeAiConnectors": true` to .claude/settings.json.',
    steps:
      '`.bkit/providers.md` § claude.ai connectors. Move anything agents use through a connector onto the project\'s MCP file first, then set `"disableClaudeAiConnectors": true` in `.claude/settings.json`.',
    fires: (cwd) =>
      hosts(cwd).has("claude") && !claudeSettingsHas(cwd, "disableClaudeAiConnectors"),
  },

  // --- optional: nice to have ------------------------------------------------------------
  {
    id: "issue-forms",
    workflows: ["design", "plan", "debug"],
    title: "Issue forms",
    line: "Optional: add issue forms so every new issue asks for what the agent reads first.",
    why: "Each workflow starts from the issue. A form for an idea, a well-defined change or a bug asks for the problem, what done looks like, or the steps to reproduce. Without one, issues often arrive as a title and a line, and the agent has to guess.",
    ask: "Copy .bkit/templates/.github/ISSUE_TEMPLATE/ to .github/ISSUE_TEMPLATE/ and commit it to the default branch.",
    steps: "`.bkit/templates.md` § Issue forms.",
    fires: (cwd) =>
      readBkitConfig(cwd).issueTracker === "github" && !exists(cwd, ".github/ISSUE_TEMPLATE"),
  },
  {
    id: "graphify",
    workflows: ["design", "plan", "audit"],
    title: "A map of the code",
    line: "Optional: add graphify to keep an up-to-date map of how your code fits together.",
    why: "With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.",
    ask: 'Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify.',
    steps: "`.bkit/templates.md` § graphify.",
    fires: (cwd) => !exists(cwd, "scripts/graphify"),
  },
  {
    id: "dependabot-renovate",
    workflows: ["ship", "audit"],
    title: "Automatic updates",
    line: "Nothing keeps the project's libraries up to date. Add an updater so you get small, safe updates instead of one big risky one later.",
    why: "An updater opens a small pull request whenever a library you use has a new version. Skip it and updates pile up into one large upgrade that's far more likely to break something.",
    ask: 'Copy .bkit/templates/.github/dependabot.yml to .github/dependabot.yml (or .bkit/templates/.github/renovate.json5 to .github/renovate.json5 for Renovate instead), set `bkit.dependencies.updater` in package.json to `"dependabot"` (or `"renovate"`), and commit both to the default branch.',
    steps: "`.bkit/templates.md` § Dependabot and Renovate.",
    advisories: ["dep-updater-absent"],
    fires: (cwd) => buildDepUpdaterSetupAdvisory(cwd)?.id === "dep-updater-absent",
  },
  {
    id: "trivy",
    workflows: ["ship", "audit"],
    title: "Security scan",
    line: "Nothing stops a change that adds a known-vulnerable library, a risky container setting or a leaked password from merging. Add the scan that fails the check when it finds one.",
    why: "An updater only offers fixes, and only once a fixed version exists. The scan checks every change, plus once a day, so a known problem fails the check before it merges and one with no fix yet still shows up.",
    ask: "Copy .bkit/templates/.github/workflows/bkit-trivy.yml to .github/workflows/bkit-trivy.yml, replace {{DEFAULT_BRANCH}} with my default branch, and commit it.",
    steps:
      "`.bkit/templates.md` § Trivy. Accept a finding in `.trivyignore.yaml` with `statement` + `expired_at`; never drop `--include-dev-deps`.",
    fires: (cwd) =>
      exists(cwd, ".github/workflows") && !anyWorkflowMentions(cwd, "aquasecurity/trivy"),
  },
  {
    id: "dependency-audit",
    workflows: ["ship", "audit"],
    title: "Fail on a known-vulnerable dependency",
    line: "A library with a published security advisory can sit in the lockfile for months: the updater only offers a fix, and nothing fails the check when one is missing. Add the gate that stops a known problem before it reaches CI.",
    why: "An updater never blocks anything, so a risk with no fix yet, or one nobody merged, stays invisible. The gate names each exception with a reason and an expiry, fails on a new one, and fails even when it cannot get an answer — so a known problem is never a silent pass.",
    ask: "Copy .bkit/templates/scripts/ci/check-dependency-audit.mjs and .bkit/templates/scripts/ci/accepted-advisories.json to scripts/ci/, then paste the `Dependency audit` block from .bkit/templates/.husky/pre-push into .husky/pre-push above the gates.",
    steps:
      "`.bkit/templates.md` § Dependency audit. Each acceptance needs a `reason` and a `YYYY-MM-DD` `expires`.",
    fires: (cwd) =>
      exists(cwd, ".husky/pre-push") && !exists(cwd, "scripts/ci/check-dependency-audit.mjs"),
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
  {
    id: "tmp-prune",
    title: "Clear out old scratch files",
    line: "Scratch files agents leave in tmp/ are never cleared, so the folder keeps growing. Add the clean-up that runs when you push.",
    why: "Agents leave logs and scratch files in tmp/ on every run. Each push deletes the ones untouched for a week, so the folder stays small without anyone thinking about it.",
    ask: "Copy .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs to scripts/cleanup/, then copy the `tmp/ prune` block from .bkit/templates/.husky/pre-push into .husky/pre-push above the gates.",
    steps: "`.bkit/templates.md` § tmp/ prune.",
    fires: (cwd) =>
      exists(cwd, ".husky/pre-push") && !exists(cwd, "scripts/cleanup/bkit-tmp-prune.mjs"),
  },
  {
    id: "min-push",
    workflows: ["plan", "ship"],
    title: "Quick pushes for logs and records",
    line: "Pushing only plan logs and records still runs every test. Add the quick path for those pushes.",
    why: "A workflow's last push is often just its logs and records. The quick path checks only formatting and wording on such a push, so it takes seconds and never waits on anything another session is using. Any other file still runs everything.",
    ask: 'Copy the min-push parts of .bkit/templates/.husky/pre-push into .husky/pre-push: PUSH_SHAS / PUSH_SHARED_SHAS in the stdin loop, the `Min push` and `CI-suppressor guard on dev / main` blocks, and the `bkit:gate:min` branch. Wrap slow checks below the gates in `if [ "$MIN_PUSH" != "1" ]`.',
    steps: "`.bkit/templates.md` § Git hooks.",
    fires: (cwd) =>
      exists(cwd, ".husky/pre-push") &&
      !fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8").includes("bkit ci min-push"),
  },
  {
    id: "disk-prune",
    workflows: ALL_WORKFLOWS,
    title: "Keep enough disk free for new worktrees",
    line: "Build caches, Docker images and simulators fill the disk until a workflow cannot make its worktree. Add your own clean-up steps, run after commits and pushes.",
    why: "bkit deletes nothing on its own: you choose the steps, starting from examples that only delete what comes back by itself. Commits run the cheap steps, pushes run the rest, and a workflow runs them before making a worktree on a nearly full disk.",
    ask: "Copy .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs to scripts/cleanup/ and/or .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs to ~/.config/bkit/disk-prune.mjs, edit the steps, then paste the `disk prune` block from the end of each .bkit/templates/.husky hook at the end of yours.",
    steps: "`.bkit/templates.md` § Disk prune.",
    fires: (cwd) =>
      exists(cwd, ".husky/pre-push") &&
      !exists(cwd, REPO_STEPS) &&
      !fs.existsSync(machineStepsPath()),
  },

  // --- setup: only some setups -----------------------------------------------------------
  {
    id: "bkit-output-json",
    title: "Scripts that read bkit's replies",
    line: "A hook, script or CI step reads bkit's replies as JSON, but bkit replies in plain text unless the call passes `--json`. Add `--json` to those bkit calls.",
    why: "bkit answers in short text lines by default because agents read them. A script expecting JSON gets nothing it can parse, so its step quietly does nothing.",
    ask: "Add --json to every bkit call whose output a hook, script or CI workflow parses (piped to jq, or read with JSON.parse), then rerun `bkit tips` until this tip is gone.",
    steps:
      "`.bkit/workflows.md` § Workflow commands. Files: `.claude/hooks/`, `.husky/`, `.github/workflows/`, `scripts/`.",
    fires: (cwd) => readsBkitText(cwd).length > 0,
  },
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
      if (process.platform !== "darwin" || isCloudOrCi()) return false;
      const h = hosts(cwd);
      return (h.has("cursor") || h.has("opencode")) && !exists(cwd, "scripts/launchd");
    },
  },
];
