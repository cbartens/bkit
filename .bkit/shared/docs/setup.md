<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Setup

> [!CAUTION]
> **Purpose:** Local development setup for humans: CLIs, configuration, secrets and troubleshooting.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Local seed / test fixtures must NEVER run against remote projects.

## Templates

Templates are optional. You copy and own them, and bkit never installs them. The catalog and install steps are in `.bkit/templates.md`.

## Agent hosts

Run each host (`claude`, `opencode`, `codex`) in its own terminal window, not inside an IDE or a desktop app.

- Separate processes let you restart one host without quitting the others.
- Terminal sessions inherit the direnv-loaded `.bkit/.env`. GUI-launched apps do not (`.bkit/providers.md` § macOS GUI-isolation).
- On macOS, use [Ghostty](https://ghostty.org).

## Remote access

This section matters mostly for the `opencode` host, because `claude` / `cursor` / `codex` ship their own mobile / desktop clients. Reach an OpenCode host terminal from another device over a private mesh VPN. Suggested services:

- [Tailscale](https://tailscale.com/), a mesh VPN. Its free Personal plan covers device-to-device access.
- [OpenLens](https://apps.apple.com/us/app/openlens-opencode-client/id6759910797), an OpenCode iOS client.

Set it up as follows:

- Bind:
  - Run `opencode service set hostname 0.0.0.0` for all interfaces, or set the tailnet IP for tailnet only.
  - Run `opencode service set port <port>`.
  - Run `opencode service start` to apply.
  - The loopback-only default keeps the service off the LAN. Tailnet ACLs still apply.
- HTTPS proxy: `tailscale serve --bg <port>` serves the port at `https://<host>.<tailnet>.ts.net`.
  - It requires tailnet HTTPS certificates to be enabled (on the DNS page).
  - It publishes machine names to the certificate-transparency log (free).
- Auth: HTTP Basic, with username `opencode`.
  - The password is in `~/.config/opencode/service.json`, mirrored at `~/.local/state/opencode/service.json`. It persists across restarts.
  - Run `opencode service set password <value>` to rotate it.
  - NEVER commit the password.
- Client CLI: `OPENCODE_PASSWORD=<password> opencode --server https://<host>.<tailnet>.ts.net`.
- Browser / app pairing: `opencode pair --url https://<host>.<tailnet>.ts.net` returns a one-time link with a 5-minute expiry.
- Pin the port. The service port is dynamic, but `serve` targets a fixed port, so pin it or the proxy breaks on restart.

<!-- bkit:end -->
