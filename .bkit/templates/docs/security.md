<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Security

> [!CAUTION]
> **Purpose:** Authentication, authorization, input validation, rate limiting, secrets management, PII handling.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Auth standards live ONLY here. Other docs link, do not restate.

## Supply-Chain (GitHub Actions)

Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot activation, private-registry read-auth, `renovate-local.json5` customization, CVE handling) are CI/CD pipeline rules → canonical home `deployments.md` § GitHub Actions pinning; this section keeps only the security invariant.

**Token isolation:** Renovate PRs use a restricted `GITHUB_TOKEN` with no access to cloud-lane model-auth secrets (`secrets.ANTHROPIC_API_KEY` / `secrets.OPENCODE_PROVIDER_KEY`) — `bkit-cloud.yml` will not dispatch on them by design. A compromised dependency PR cannot reach agent API credentials.

<!-- bkit:end -->
