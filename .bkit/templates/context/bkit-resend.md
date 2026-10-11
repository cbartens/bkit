<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Resend — email delivery failures

Fits: apps sending email through Resend. `context=runtime`: recent sends whose last delivery event is a bounce, complaint, failure or delay (id, last_event, created_at only — never to, from or subject).

- Secret: `RESEND_API_KEY` (`re_…`) — reuse the app's existing key.
- Non-secret: `RESEND_N` (sends scanned, default 100).
- CLI: none (`curl` + `jq`), no provision block.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start resend context=runtime -->

```bash
# Resend email delivery log — bounces / complaints / delays / failures (read-only GET).
# GET /emails lists recent sends; each item's `last_event` is its delivery status.
# PII-safe: to / from / subject are never surfaced — only id / last_event / created_at.
# Customise: RESEND_N; the last_event filter.
[ -n "${RESEND_API_KEY:-}" ] \
  || { echo "[context-fetch:resend] skipped — RESEND_API_KEY unset" >&2; exit 0; }
curl -s "https://api.resend.com/emails?limit=${RESEND_N:-100}" \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  | jq '[.data[]
        | select((.last_event // "") | test("bounce|complain|fail|delay"; "i"))
        | {id, last_event, created_at}]'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

resend.com

<!-- allowed-domains:end -->
