// bkit-permissions-parity.integration.test.ts — one canonical gate set, asserted against every host.
//
// bkit's promise is that an agent is held to the same rules whichever IDE runs it.
// The three hosts express gates in three different languages:
//
//   Claude   .claude/settings.json     permissions.deny / .ask  — prefix patterns
//   opencode .opencode/opencode.json   permission.bash / .read  — globs, last-match-wins
//   Cursor   .cursor/hooks/guardrails.cjs                       — regexes in a script
//
// Three dialects drift silently. This file is the single table they must all
// satisfy: add a gate here and every host that lacks it fails until it has it.
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const CLAUDE_SETTINGS = ".bkit/templates/.claude/settings.json";
const OPENCODE_JSON = ".bkit/templates/.opencode/opencode.json";
const GUARDRAILS = path.resolve(".bkit/templates/.cursor/hooks/guardrails.cjs");

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

// ---------------------------------------------------------------------------
// The assertions
// ---------------------------------------------------------------------------

describe("cross-host gate parity — shell", () => {
  for (const g of SHELL_GATES) {
    it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — all three hosts`, () => {
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
    });
  }
});

describe("cross-host gate parity — file reads", () => {
  for (const g of READ_GATES) {
    it(`${g.expect.toUpperCase()} on reading \`${g.file}\` (${g.why}) — all three hosts`, () => {
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

describe("cross-host gate parity — KNOWN DIVERGENCE: curl / wget in a shell", () => {
  // The three hosts agree on the case that matters and diverge on one edge, so no row
  // goes into SHELL_GATES (which asserts a single verdict across all three).
  //
  //   Cursor   asks UNLESS every URL host is on the network allowlist (guardrails.cjs
  //            parses the command and matches host labels — the only correct one)
  //   opencode `curl *: ask`, then `curl *{domain}*: allow` per allowlisted host,
  //            last-match-wins. Substring, not host-parsed, so it is cruder than
  //            Cursor's: `curl https://evil.example/?x=github.com` matches the allow.
  //   Claude   ungated in a shell — runs under `Bash(*)`. Its WebFetch domain
  //            allowlist governs the WebFetch TOOL, never `curl` typed into Bash.
  //
  //   ALLOWLISTED host   → all three run it unprompted. This is the common path and
  //                        the one context-fetch blocks take.
  //   UNDECLARED host    → Cursor and opencode ask; Claude runs it.
  //
  // Claude carries no ask row by design. Its rules match a command PREFIX, not a URL
  // host, so per-domain allows are inexpressible and the only options are blanket-ask
  // or blanket-allow. Blanket-ask was shipped once and removed: a content-scoped `ask`
  // is evaluated before the auto-mode classifier and always forces a prompt, beating
  // even a matching `allow`, so every `context=web` block stalled — and a cloud session
  // has nobody to answer it. `deny` and the auto-mode classifier remain the backstops.
  //
  // Closing the edge case needs Cursor's host-parsing engine on the other two hosts (a
  // PreToolUse hook on Claude, a plugin on opencode), not a permission-table row.
  it.todo("curl/wget: port the host-parsing guardrail to Claude + opencode, then add rows");
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
