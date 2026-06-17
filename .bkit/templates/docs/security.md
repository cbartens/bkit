<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Security

> [!CAUTION]
> **Purpose:** Authentication, authorization, input validation, rate limiting, secrets management, PII handling.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Auth standards live ONLY here. Other docs link, do not restate.

## Supply-Chain (GitHub Actions)

Action SHA-pinning and the dependency-update pipeline — Renovate / Dependabot activation, private-registry read-auth, consumer customization (`renovate-local.json5`), and CVE handling — are CI/CD pipeline rules. Their canonical home is `deployments.md` § GitHub Actions pinning; this section keeps only the security-relevant invariant.

**Token isolation:** Renovate PRs run with a restricted `GITHUB_TOKEN` and have no access to `secrets.ANTHROPIC_API_KEY` / `secrets.LINEAR_API_KEY` — `bkit-auto` will not dispatch on them by design. A compromised or malicious dependency PR therefore cannot reach the agent's API credentials.

<!-- bkit:end -->
