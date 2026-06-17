<!-- bkit:start -->

<!-- bkit:managed v4.1.2 — do NOT edit; run `bkit upgrade` to refresh -->

# Webhooks

> [!CAUTION]
> **Purpose:** Registry of inbound webhook endpoints — URLs, providers, secret env var names.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - One row per endpoint (URL · provider · secret env var).
> - All public webhooks MUST verify payload signature. All handlers MUST be idempotent.

<!-- bkit:end -->
