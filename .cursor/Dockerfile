# Cursor Background Agents Dockerfile.
# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# The `bkit toolchain` section below installs the toolchain bkit's workflows use
# (vale, gh, jq, python3, corepack-pinned pnpm). The image targets linux/amd64.
# Adapt the rest to your stack:
#   - `FROM` base image
#   - Node version (default 24, checksum-pinned; match `engines.node` / `.nvmrc`)
#   - System deps (curl, ca-certificates baseline; add libpq, ruby, etc.)
#   - Per-repo dev tooling (Playwright, Supabase CLI, AWS CLI, etc.)

# Base image digest-pinned — an `ubuntu:26.04` tag is mutable, so pinning the digest keeps builds
# reproducible and the supply chain fixed. Refresh with `docker pull ubuntu:26.04` (prints `Digest:`),
# or let Renovate's dockerfile manager bump it. Consumer-owned — repin to your own base as needed.
FROM ubuntu:26.04@sha256:2260313b31c8c011cd2eebe728008efac1b3982be73eb71348ea2648d2c0e09b

# --- Consumer-owned: base system + Node ------------------------------------
# bkit's toolchain assumes curl, ca-certificates, and Node >=24 are on PATH
# before the bkit toolchain section runs. Pin Node to match your repo's `engines.node`.
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates xz-utils \
    && rm -rf /var/lib/apt/lists/*
# Node — nodejs.org tarball checked against SHASUMS256.txt (linux-x64).
# renovate: datasource=node-version depName=node
ARG NODE_VERSION=24.21.0
ARG NODE_SHA256=fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6
RUN cd /tmp \
    && curl -fsSLO --retry 3 --retry-all-errors "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
    && echo "${NODE_SHA256}  node-v${NODE_VERSION}-linux-x64.tar.xz" | sha256sum -c - \
    && tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
    && rm -f "node-v${NODE_VERSION}-linux-x64.tar.xz"

# --- bkit toolchain (keep as shipped; diff against bkit's template) ---------
# Aligned with the Claude Code on the web setup script in bkit's `cloud.md`.
# Updates arrive in `.bkit/templates/.cursor/Dockerfile` on `bkit upgrade`; put repo
# extensions under Consumer extensions below.

# System deps the preflight hook + bkit workflows depend on.
RUN apt-get update && apt-get install -y --no-install-recommends \
      git jq python3 \
    && rm -rf /var/lib/apt/lists/*

# gh CLI — git push, PR ops, CI cache lookup. Release tarball checked against the release's checksums.txt.
# renovate: datasource=github-releases depName=cli/cli
ARG GH_VERSION=2.102.0
ARG GH_SHA256=bb766f710eef8ede859c18578c72c327597cd4c8a85b06001b1f3843c6019386
RUN cd /tmp \
    && curl -fsSLO --retry 3 --retry-all-errors "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_amd64.tar.gz" \
    && echo "${GH_SHA256}  gh_${GH_VERSION}_linux_amd64.tar.gz" | sha256sum -c - \
    && tar -xzf "gh_${GH_VERSION}_linux_amd64.tar.gz" -C /usr/local/bin --strip-components=2 "gh_${GH_VERSION}_linux_amd64/bin/gh" \
    && rm -f "gh_${GH_VERSION}_linux_amd64.tar.gz"

# vale — `pnpm lint:prose`. Version pinned for snapshot reproducibility; tarball checked before extract.
# renovate: datasource=github-releases depName=errata-ai/vale
ARG VALE_VERSION=3.9.1
ARG VALE_SHA256=fbc2eb47d0b8c50220ed1a2c5c611fbe0904ed567d638143d482016a18fd2db0
RUN cd /tmp \
    && curl -fsSLO --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" \
    && echo "${VALE_SHA256}  vale_${VALE_VERSION}_Linux_64-bit.tar.gz" | sha256sum -c - \
    && tar -xzf "vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -C /usr/local/bin vale \
    && chmod +x /usr/local/bin/vale \
    && rm -f "vale_${VALE_VERSION}_Linux_64-bit.tar.gz"

# pnpm — corepack-pinned to match `packageManager` in package.json.
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.34.6
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

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
