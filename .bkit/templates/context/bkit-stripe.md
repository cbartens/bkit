<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Stripe — failed payment events

Fits: apps taking payments with Stripe. `context=runtime`: Events API entries in a window (default last day) whose type names a failure, dispute or refund, filtered by the API and paged across the whole window, plus every event whose webhook delivery failed (id, type, created, livemode only — never customer, card or metadata). The Events API keeps about 30 days.

- Secret: `STRIPE_SECRET_KEY` — reuse the app's existing key, or a restricted key with read access to Events. The `sk_live_` / `sk_test_` prefix selects live vs test mode.
- Non-secret: `STRIPE_SINCE_S` (window in seconds, default 86400), `STRIPE_MAX_PAGES` (pages of 100 events per type list, default 10).
- CLI: none (`curl` + `jq`), no provision block.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start stripe context=runtime -->

```bash
# Stripe event stream — payment / subscription / dispute / refund failures (read-only GET).
# Headless: STRIPE_SECRET_KEY (secret, from env); the key prefix (sk_live_ / sk_test_) selects
# live vs test mode. PII-safe: only id / type / created / livemode surfaced.
# Filters at the source: every event type naming a failure, dispute or refund, in two type lists
# (the API takes at most 20 `types[]` per call). Each list pages with starting_after while
# has_more, so a busy account still covers the whole window. A second pass reads events whose
# webhook delivery failed (delivery_success=false), any type. A non-200 page prints `skipped`;
# the page cap prints a TRUNCATED line.
# Customise: STRIPE_SINCE_S window in seconds (default 1 day; the API keeps ~30 days); STRIPE_MAX_PAGES (x 100 events per list); the two type lists. Positive control (suggested): before reading empty output as no errors, run once over a window holding an event you know exists (e.g. a test-mode `charge.failed` from a declined test card); nothing back = reader broken, not clean.
[ -n "${STRIPE_SECRET_KEY:-}" ] \
  || { echo "[context-fetch:stripe] skipped — STRIPE_SECRET_KEY unset" >&2; exit 0; }
SINCE_TS=$(( $(date +%s) - ${STRIPE_SINCE_S:-86400} ))
STRIPE_RESP=$(mktemp); STRIPE_FAILED=$(mktemp); STRIPE_UNDELIVERED=$(mktemp)
trap 'rm -f "$STRIPE_RESP" "$STRIPE_FAILED" "$STRIPE_UNDELIVERED"' EXIT
# stripe_pages <out-file> <extra curl args as one string> — pages the window into <out-file>.
stripe_pages() {
  out="$1"; extra="$2"; after=""; pages=0
  while [ "$pages" -lt "${STRIPE_MAX_PAGES:-10}" ]; do
    pages=$((pages + 1))
    # $extra unquoted on purpose: one `-d types[]=<name>` per word; type names hold no spaces.
    code=$(curl -sgG -o "$STRIPE_RESP" -w '%{http_code}' "https://api.stripe.com/v1/events" \
      -u "${STRIPE_SECRET_KEY}:" \
      --data-urlencode "limit=100" \
      --data-urlencode "created[gte]=${SINCE_TS}" \
      ${after:+--data-urlencode "starting_after=${after}"} $extra)
    [ "$code" = "200" ] \
      || { echo "[context-fetch:stripe] skipped — api.stripe.com HTTP ${code:-000} on page $pages (401 = bad key, 000 = unreachable)" >&2; return 1; }
    jq -c '.data[]' "$STRIPE_RESP" >> "$out"
    [ "$(jq -r '.has_more' "$STRIPE_RESP")" = "true" ] || return 0
    after=$(jq -r '.data[-1].id' "$STRIPE_RESP")
  done
  printf '===== TRUNCATED: stopped at STRIPE_MAX_PAGES=%s; events older than %s NOT read =====\n' "${STRIPE_MAX_PAGES:-10}" "$after"
  echo "[context-fetch:stripe] truncated — STRIPE_MAX_PAGES reached" >&2
}
types() { for t in "$@"; do printf ' -d types[]=%s' "$t"; done; }
stripe_pages "$STRIPE_FAILED" "$(types charge.failed charge.refunded charge.refund.updated \
    charge.dispute.created charge.dispute.updated charge.dispute.closed \
    charge.dispute.funds_withdrawn charge.dispute.funds_reinstated \
    payment_intent.payment_failed invoice.payment_failed invoice.finalization_failed \
    checkout.session.async_payment_failed setup_intent.setup_failed \
    refund.created refund.updated refund.failed)" || exit 0
stripe_pages "$STRIPE_FAILED" "$(types application_fee.refunded application_fee.refund.updated \
    payout.failed topup.failed source.failed source.refund_attributes_required \
    issuing_dispute.created issuing_dispute.updated issuing_dispute.closed \
    issuing_dispute.submitted issuing_dispute.funds_reinstated issuing_dispute.funds_rescinded \
    reporting.report_run.failed terminal.reader.action_failed test_helpers.test_clock.internal_failure)" || exit 0
stripe_pages "$STRIPE_UNDELIVERED" "-d delivery_success=false" || exit 0
printf '===== stripe failure-class events since %s — %s event(s) =====\n' \
  "$(jq -rn --argjson s "$SINCE_TS" '$s | todate')" "$(grep -c . "$STRIPE_FAILED")"
jq -sc 'unique_by(.id) | sort_by(-.created) | .[] | {id, type, created: (.created | todate), livemode}' "$STRIPE_FAILED"
printf '===== webhook deliveries failed (delivery_success=false) — %s event(s) =====\n' "$(grep -c . "$STRIPE_UNDELIVERED")"
jq -c '{id, type, created: (.created | todate), pending_webhooks}' "$STRIPE_UNDELIVERED"
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

stripe.com

<!-- allowed-domains:end -->
