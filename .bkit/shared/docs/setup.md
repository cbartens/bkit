<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Notation: one job per mark — `.bkit/authoring.md` § `Notation`.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Local seed / test fixtures must never run against remote projects.

## Templates

Optional, copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

## Agent hosts

Run each host (`claude`, `opencode`, `codex`) in its own terminal window — not inside an IDE or a desktop app.

- Separate processes: restart one host without quitting the others.
- Terminal sessions inherit the direnv-loaded `.bkit/.env`; GUI-launched apps do not (`.bkit/providers.md` § macOS GUI-isolation).
- macOS: [Ghostty](https://ghostty.org).

## Remote access

Mostly relevant to the `opencode` host — `claude` / `cursor` / `codex` ship their own mobile / desktop clients. Reach an OpenCode host terminal from another device over a private mesh VPN. Suggested services: [Tailscale](https://tailscale.com/) (mesh VPN; free Personal plan covers device-to-device access), [OpenLens](https://apps.apple.com/us/app/openlens-opencode-client/id6759910797) (OpenCode iOS client).

- Bind: `opencode service set hostname 0.0.0.0` (all interfaces) or the tailnet IP (tailnet only); `opencode service set port <port>`; `opencode service start` to apply. Loopback-only default keeps the service off the LAN; tailnet ACLs still apply.
- HTTPS proxy: `tailscale serve --bg <port>` → `https://<host>.<tailnet>.ts.net`. Requires tailnet HTTPS certificates enabled (DNS page); publishes machine names to the certificate-transparency log (free).
- Auth: HTTP Basic, username `opencode`, password in `~/.config/opencode/service.json` (mirror `~/.local/state/opencode/service.json`); persists across restarts; `opencode service set password <value>` to rotate. NEVER commit it.
- Client CLI: `OPENCODE_PASSWORD=<password> opencode --server https://<host>.<tailnet>.ts.net`.
- Browser / app pairing: `opencode pair --url https://<host>.<tailnet>.ts.net` → one-time link, 5-minute expiry.
- Pin the port: the service port is dynamic; `serve` targets a fixed port, so pin it or the proxy breaks on restart.

<!-- bkit:end -->
