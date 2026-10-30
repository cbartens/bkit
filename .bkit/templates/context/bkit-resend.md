<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Resend — email delivery failures

Fits: apps sending email through Resend. The `context=runtime` block returns recent sends whose last delivery event is a bounce, complaint, failure or delay. It returns only their id, last_event and created_at, never to, from or subject.

- Secret: `RESEND_API_KEY` (`re_…`). Reuse the app's existing key.
- Non-secret: `SINCE_ISO`, the window start (default 24 h ago).
- Non-secret: `RESEND_MAX_PAGES`, the number of pages of 100 sends each (default 30).
- CLI: none (`curl` and `jq`), so there is no provision block.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start resend context=runtime -->

```bash
# Resend email delivery log: bounces / complaints / delays / failures (read-only GET).
# GET /emails lists sends newest first, and `last_event` = the delivery status. One page of 100
# can cover less than a day, so the block pages with after=<last id> until a send predates the
# window. A non-200 page → `skipped`. The page cap → a TRUNCATED line.
# PII-safe: to / from / subject are never surfaced. The block prints only id / last_event / created_at.
# Customise: SINCE_ISO (window start, default 24 h ago; retention is 30 days); RESEND_MAX_PAGES (x 100 sends); the last_event filter. Positive control (suggested): run once over a window holding a known bounce (e.g. to Resend's bounce test address); nothing back = reader broken, not clean.
[ -n "${RESEND_API_KEY:-}" ] \
  || { echo "[context-fetch:resend] skipped — RESEND_API_KEY unset" >&2; exit 0; }
RESEND_FROM=$(jq -rn --arg t "${SINCE_ISO:-}" --argjson d "$(( $(date -u +%s) - 86400 ))" 'if $t == "" then $d else ($t | sub("\\.[0-9]+"; "") | fromdateiso8601) end' 2>/dev/null)
[ -n "$RESEND_FROM" ] \
  || { echo "[context-fetch:resend] skipped — SINCE_ISO not ISO-8601 (2026-01-31T00:00:00Z)" >&2; exit 0; }
RESEND_RESP=$(mktemp); RESEND_ALL=$(mktemp)
trap 'rm -f "$RESEND_RESP" "$RESEND_ALL"' EXIT
RESEND_AFTER=""; RESEND_PAGES=0; RESEND_NOTE=""
while :; do
  RESEND_PAGES=$((RESEND_PAGES + 1))
  RESEND_CODE=$(curl -s -o "$RESEND_RESP" -w '%{http_code}' \
    "https://api.resend.com/emails?limit=100${RESEND_AFTER:+&after=${RESEND_AFTER}}" \
    -H "Authorization: Bearer ${RESEND_API_KEY}")
  [ "$RESEND_CODE" = "200" ] \
    || { echo "[context-fetch:resend] skipped — api.resend.com HTTP ${RESEND_CODE:-000} on page $RESEND_PAGES (400/401 = bad key, 429 = rate limit, 000 = unreachable)" >&2; exit 0; }
  # created_at looks like "2026-01-31 02:50:14.901000+00". Convert it to epoch seconds for the
  # window test.
  jq -c --argjson from "$RESEND_FROM" '.data[]
    | . + {epoch: (.created_at[0:19] | sub(" "; "T") + "Z" | fromdateiso8601)}
    | select(.epoch >= $from)' "$RESEND_RESP" >> "$RESEND_ALL"
  RESEND_OLDEST=$(jq -r '[.data[].created_at[0:19] | sub(" "; "T") + "Z" | fromdateiso8601] | min // 0' "$RESEND_RESP")
  [ "$(jq -r '.has_more' "$RESEND_RESP")" = "true" ] && [ "$RESEND_OLDEST" -ge "$RESEND_FROM" ] || break
  [ "$RESEND_PAGES" -lt "${RESEND_MAX_PAGES:-30}" ] \
    || { RESEND_NOTE="stopped at RESEND_MAX_PAGES=${RESEND_MAX_PAGES:-30}; sends before $(jq -rn --argjson s "$RESEND_OLDEST" '$s | todate') NOT read"; break; }
  RESEND_AFTER=$(jq -r '.data[-1].id' "$RESEND_RESP")
  sleep 0.6   # Resend allows ~2 requests/s
done
printf '===== resend outbound since %s — %s send(s), %s page(s) =====\n' \
  "$(jq -rn --argjson s "$RESEND_FROM" '$s | todate')" "$(grep -c . "$RESEND_ALL")" "$RESEND_PAGES"
[ -z "$RESEND_NOTE" ] || { printf '===== TRUNCATED: %s =====\n' "$RESEND_NOTE"; echo "[context-fetch:resend] truncated — $RESEND_NOTE" >&2; }
echo "===== count by last_event ====="
jq -r '.last_event // "none"' "$RESEND_ALL" | sort | uniq -c | sort -rn
echo "===== bounce / complaint / failure / delay ====="
jq -c 'select((.last_event // "") | test("bounce|complain|fail|delay"; "i")) | {id, last_event, created_at}' "$RESEND_ALL"
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

resend.com

<!-- allowed-domains:end -->
