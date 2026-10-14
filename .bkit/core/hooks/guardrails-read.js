// --- Secret-file read tier: identical in the Cursor and Google Antigravity guardrails hooks
// (bkit renders it from one source). Same policy as Claude's settings.json `Read(...)` deny /
// ask rows and opencode's `permission.read` map; each host maps a tier to its own output
// shape and wording.

/**
 * The read tier for a file path (`/` or `\` separated), first match wins:
 *   `{ tier: "deny", path }` — private-key material: `*.pem`, `*.p12`, `id_rsa`;
 *   `{ tier: "ask", path }`  — an env / secrets file: `.env`, `.env.*` except `.env.example`;
 *   null                     — nothing to say.
 */
function classifyRead(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  if (!p) return null;
  if (/\.pem$/i.test(p) || /\.p12$/i.test(p) || /(^|\/)id_rsa$/i.test(p)) {
    return { tier: "deny", path: p };
  }
  const base = p.split("/").pop() || p;
  if (base === ".env" || (/^\.env\./.test(base) && base !== ".env.example")) {
    return { tier: "ask", path: p };
  }
  return null;
}
