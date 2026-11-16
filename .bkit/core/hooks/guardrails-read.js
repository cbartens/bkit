// --- Secret-file read tier: identical in the Cursor and Google Antigravity guardrails hooks
// (bkit renders it from one source). Claude's settings.json `Read(...)` rows and opencode's
// `permission.read` map list fewer key names; each host maps a tier to its own output
// shape and wording. Needs `secretFileKind` from `guardrails-tiers.js` above it.

/**
 * The read tier for a file path (`/` or `\` separated), first match wins:
 *   `{ tier: "deny", path }` — a private-key file (`mayNameKeyFile`);
 *   `{ tier: "ask", path }`  — an env / secrets file: `.env`, `.env.*` except `.env.example`;
 *   null                     — nothing to say.
 */
function classifyRead(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  const kind = secretFileKind(p);
  if (kind === "key") return { tier: "deny", path: p };
  if (kind === "env") return { tier: "ask", path: p };
  return null;
}
