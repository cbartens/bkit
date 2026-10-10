# Cursor Background Agents Dockerfile.
# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# The `bkit toolchain` section below installs the toolchain bkit's workflows use
# (vale, gh, jq, python3, corepack-pinned pnpm). Adapt the rest to your stack:
#   - `FROM` base image
#   - Node major (default 20; pin to match `engines.node` / `.nvmrc`)
#   - System deps (curl, ca-certificates baseline; add libpq, ruby, etc.)
#   - Per-repo dev tooling (Playwright, Supabase CLI, AWS CLI, etc.)

# Base image digest-pinned — an `ubuntu:26.04` tag is mutable, so pinning the digest keeps builds
# reproducible and the supply chain fixed. Refresh with `docker pull ubuntu:26.04` (prints `Digest:`),
# or let Renovate's dockerfile manager bump it. Consumer-owned — repin to your own base as needed.
FROM ubuntu:26.04@sha256:2260313b31c8c011cd2eebe728008efac1b3982be73eb71348ea2648d2c0e09b

# --- Consumer-owned: base system + Node ------------------------------------
# bkit's toolchain assumes curl, ca-certificates, and Node >=20 are on PATH
# before the bkit toolchain section runs. Pin Node to match your repo's `engines.node`.
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL --retry 3 --retry-all-errors https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# --- bkit toolchain (keep as shipped; diff against bkit's template) ---------
# Aligned with the Claude Code on the web setup script in bkit's `cloud.md`.
# Updates arrive in `.bkit/templates/.cursor/Dockerfile` on `bkit upgrade`; put repo
# extensions under Consumer extensions below.

# System deps the preflight hook + bkit workflows depend on.
RUN apt-get update && apt-get install -y --no-install-recommends \
      git jq python3 \
    && rm -rf /var/lib/apt/lists/*

# gh CLI — git push, PR ops, CI cache lookup.
RUN curl -fsSL --retry 3 --retry-all-errors https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# vale — `pnpm lint:prose`. Version pinned for snapshot reproducibility.
ARG VALE_VERSION=3.9.1
RUN cd /tmp \
    && curl -fsSLO --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" \
    && tar -xzf "vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -C /usr/local/bin vale \
    && chmod +x /usr/local/bin/vale \
    && rm -f "vale_${VALE_VERSION}_Linux_64-bit.tar.gz"

# pnpm — corepack-pinned to match `packageManager` in package.json.
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

# --- Consumer extensions ---------------------------------------------------
# Add per-repo install steps here. Uncomment / adapt as needed:
#
# Playwright Chromium for E2E (drop if your repo has no Playwright tests):
# RUN npx playwright install --with-deps chromium
#
# Supabase CLI (postgres-backed apps):
# RUN curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz \
#     | tar -xz -C /usr/local/bin supabase
#
# Postgres client (psql) for inspect / db: scripts:
# RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
#     && rm -rf /var/lib/apt/lists/*
