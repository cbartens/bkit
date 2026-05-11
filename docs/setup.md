<!-- bkit:start -->

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Local seed/test fixtures must never run against remote projects.

## Dispatch readiness (optional)

When enabling Claude Cowork Dispatch on this repo, run the one-time setup from `docs/dispatch.md` § One-time setup. Verify after install:

```sh
echo '{}' | bash .claude/hooks/preflight.sh   # exits 0 silently — IDE skip path
LINEAR_ISSUE_ID=test BKIT_PREFLIGHT_BYPASS=dispatch bash .claude/hooks/preflight.sh   # exits 0 with bypass message
```

<!-- bkit:end -->
