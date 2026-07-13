<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Observability

> [!CAUTION]
> **Purpose:** Logging architecture, correlation tracing, telemetry pipelines, log drains.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - **Never log PII.** Scrub sensitive fields at the source.
> - Observability never blocks business logic.

## Debug Fetch

Runtime log fetching for `/bkit-debug` — the `debug-fetch:*` blocks it runs and their cloud CLI provisioning — is configured in `.agents/config.md`. Author and enable runtime-log sources there.

<!-- bkit:end -->
