// --- Secret-file read tier: identical in the Cursor and Google Antigravity guardrails hooks
// (bkit renders it from one source). Same policy as Claude's settings.json `Read(...)` deny /
// ask rows and opencode's `permission.read` map; each host maps a tier to its own output
// shape and wording. Needs `secretFileKind` from `guardrails-tiers.js` above it.

/**
 * The read tier for a file path (`/` or `\` separated), first match wins:
 *   `{ tier: "deny", path }` — private-key material: `*.pem`, `*.p12`, `id_rsa`;
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
