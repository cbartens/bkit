<!-- bkit:start -->

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

`/bkit-debug` scans for **first** `bash` fenced block between `<!-- debug-fetch:start -->` / `<!-- debug-fetch:end -->` **after** `<!-- bkit:end -->`. Agent customises (severity / freshness / limit), executes, writes stdout to `docs/plans/logs/{FID}/debug-context-runtime-{DEBUG_ATTEMPT}.md`.

**Authoring:**

- Tool-agnostic (`gcloud` / `aws` / `datadog`) — document auth + setup.
- Cover severity, time window, log name / stream, label filters; cross-platform tracing if multi-source. Idempotent + read-only.

**Example ONLY**:

- Final `<!-- debug-fetch:start -->` / `<!-- debug-fetch:end -->` markers with actual query example MUST sit **after** `<!-- bkit:end -->`.

<!-- debug-fetch:start -->

```bash
gcloud logging read 'logName="projects/<PROJECT_ID>/logs/<LOG_NAME>" AND severity>=ERROR' \
--freshness=4h --limit=50 --format=json
```

<!-- debug-fetch:end -->

<!-- bkit:end -->
