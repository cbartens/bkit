<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Serena — MCP server in cloud sessions

Fits: repos that wire the Serena MCP server (`.bkit/templates.md` § Serena). No fetch block: a provision block on its own installs the `serena` binary in Claude cloud sessions so the MCP server starts there too, and the `mcp-servers` entry lets every host run its tools without a prompt.

- Secret: none.
- CLI: `uv` (pre-installed on the Claude cloud image). The setup script runs as root, so the block pins uv's tool venv and bin dir to world-readable paths; under root's `$HOME` (mode 0700) the session user could not run the binary.
- Pin: replace `serena-agent==1.7.0` with the version you run locally; bump it deliberately.
- Domains: none to declare — PyPI comes with the cloud allowlist's default package-manager list.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:provision serena -->

```bash
# Install the Serena MCP server in cloud if absent (self-guarded; no-op when present).
# The setup script runs as ROOT: uv's default $HOME-relative paths land in /root (mode 0700),
# unreadable to the session user — pin the tool venv and its bin dir to world-readable paths.
command -v serena >/dev/null 2>&1 || {
  UV_TOOL_DIR=/opt/uv-tools UV_TOOL_BIN_DIR=/usr/local/bin \
    uv tool install serena-agent==1.7.0 && chmod -R a+rX /opt/uv-tools
}
```

<!-- context-fetch:end -->

<!-- mcp-servers:start -->

serena

<!-- mcp-servers:end -->
