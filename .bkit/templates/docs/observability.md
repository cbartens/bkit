<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Observability

> [!CAUTION]
> **Purpose:** Logging architecture, correlation tracing, telemetry pipelines, log drains.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - **Never log PII.** Scrub sensitive fields at the source.
> - Observability never blocks business logic.

## Debug Fetch

Runtime log fetching for `/bkit-debug` (`debug-fetch:*` blocks + cloud CLI provisioning) → configure in `.agents/config.md`. Author and enable runtime-log sources there.

<!-- bkit:end -->
