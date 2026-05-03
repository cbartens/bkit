<!-- bkit:start -->

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Tiers strictly separated — Unit · Integration · E2E · Smoke.
> - Pre-push runs lint/typecheck/unit only; integration and E2E excluded. NEVER `--no-verify`.

<!-- bkit:end -->
