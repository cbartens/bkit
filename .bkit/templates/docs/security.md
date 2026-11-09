# Security

> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/security.md` and add its row to `.agents/docs.md` `## Project Documents`.

> [!CAUTION]
> **Purpose:** The project's authentication, authorization, input validation, rate limiting, secrets management and PII handling.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Auth standards live only here. Other docs link to this file and do not restate them.

## Supply-Chain (GitHub Actions)

Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot, Trivy scan, CVE handling) are described in `deployments.md` § Dependency updaters. This section holds the security invariants only.

**Token isolation:**

- Renovate PRs get a restricted `GITHUB_TOKEN`.
- They have no access to the cloud lane's model-auth secrets (`secrets.BKIT_ANTHROPIC_API_KEY` / the provider `BKIT_` keys / `secrets.BKIT_OPENAI_API_KEY`).
- They have no access to federated Claude tokens either. Only a `bkit-cloud.yml` job that matches the federation rule mints those.
- `bkit-cloud.yml` does not dispatch on Renovate PRs.
- As a result, a compromised dependency PR cannot reach agent API credentials.

**Scanner isolation:** The CI vulnerability scanner (e.g. `bkit-trivy.yml`) runs with `contents: read`, `persist-credentials: false` and no secret. Its image or action is pinned by digest, never by a floating tag. Setup is in `.bkit/templates.md` § Trivy.

## Project facts to record

Replace this section with the project's own content.

- How users and services authenticate, and how access is authorized.
- Input validation and rate limiting.
- Where secrets live and who can read them.
- Which personal data the project holds and how it is protected.
- The untrusted-content rules bkit applies to every workflow are in `.bkit/prompts.md` § Untrusted Content & Prompt Injection.
