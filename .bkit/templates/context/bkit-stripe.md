<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Stripe — failed payment events

Fits: apps taking payments with Stripe. `context=runtime`: Events API entries in a window (default last day) whose type names a failure, dispute or refund, filtered by the API (id, type, created, livemode only — never customer, card or metadata). The Events API keeps about 30 days.

- Secret: `STRIPE_SECRET_KEY` — reuse the app's existing key, or a restricted key with read access to Events. The `sk_live_` / `sk_test_` prefix selects live vs test mode.
- Non-secret: `STRIPE_N` (events returned, default 50, max 100), `STRIPE_SINCE_S` (window in seconds, default 86400).
- CLI: none (`curl` + `jq`), no provision block.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start stripe context=runtime -->

```bash
# Stripe event stream — payment / subscription / dispute / refund failures (read-only GET).
# Headless: STRIPE_SECRET_KEY (secret, from env); the key prefix (sk_live_ / sk_test_) selects
# live vs test mode. PII-safe: only id / type / created / livemode surfaced.
# Filters at the source: every event type naming a failure, dispute or refund, in two calls
# (the API takes at most 20 `types[]` per call), merged newest first.
# Customise: STRIPE_N (<= 100); STRIPE_SINCE_S window in seconds (default 1 day; the API keeps ~30 days); the two type lists.
[ -n "${STRIPE_SECRET_KEY:-}" ] \
  || { echo "[context-fetch:stripe] skipped — STRIPE_SECRET_KEY unset" >&2; exit 0; }
SINCE_TS=$(( $(date +%s) - ${STRIPE_SINCE_S:-86400} ))
stripe_events() {
  TYPES=""
  for t in "$@"; do TYPES="$TYPES -d types[]=$t"; done
  # $TYPES unquoted on purpose: one `-d types[]=<name>` per word; type names hold no spaces.
  curl -sgG "https://api.stripe.com/v1/events" -u "${STRIPE_SECRET_KEY}:" \
    --data-urlencode "limit=${STRIPE_N:-50}" \
    --data-urlencode "created[gte]=${SINCE_TS}" \
    $TYPES
}
{
  stripe_events charge.failed charge.refunded charge.refund.updated \
    charge.dispute.created charge.dispute.updated charge.dispute.closed \
    charge.dispute.funds_withdrawn charge.dispute.funds_reinstated \
    payment_intent.payment_failed invoice.payment_failed invoice.finalization_failed \
    checkout.session.async_payment_failed setup_intent.setup_failed \
    refund.created refund.updated refund.failed
  stripe_events application_fee.refunded application_fee.refund.updated \
    payout.failed topup.failed source.failed source.refund_attributes_required \
    issuing_dispute.created issuing_dispute.updated issuing_dispute.closed \
    issuing_dispute.submitted issuing_dispute.funds_reinstated issuing_dispute.funds_rescinded \
    reporting.report_run.failed terminal.reader.action_failed test_helpers.test_clock.internal_failure
} | jq -s --argjson n "${STRIPE_N:-50}" '
    [.[] | if .error then error("[context-fetch:stripe] Stripe API error: \(.error.message)") else .data[] end]
    | sort_by(-.created) | .[:$n]
    | map({id, type, created, livemode})'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

stripe.com

<!-- allowed-domains:end -->
