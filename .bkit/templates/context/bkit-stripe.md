<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Stripe — failed payment events

Fits: apps taking payments with Stripe. `context=runtime`: recent Events API entries whose type names a failure, dispute, error or refund (id, type, created, livemode only — never customer, card or metadata). The Events API keeps about 30 days.

- Secret: `STRIPE_SECRET_KEY` — reuse the app's existing key, or a restricted key with read access to Events. The `sk_live_` / `sk_test_` prefix selects live vs test mode.
- Non-secret: `STRIPE_N` (events scanned, default 50).
- CLI: none (`curl` + `jq`), no provision block.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start stripe context=runtime -->

```bash
# Stripe event stream — payment / subscription / dispute / refund failures (read-only GET).
# Headless: STRIPE_SECRET_KEY (secret, from env); the key prefix (sk_live_ / sk_test_) selects
# live vs test mode. PII-safe: only id / type / created / livemode surfaced.
# Customise: STRIPE_N; the type filter; add `&type=` to the URL to narrow server-side.
[ -n "${STRIPE_SECRET_KEY:-}" ] \
  || { echo "[context-fetch:stripe] skipped — STRIPE_SECRET_KEY unset" >&2; exit 0; }
curl -s "https://api.stripe.com/v1/events?limit=${STRIPE_N:-50}" \
  -u "${STRIPE_SECRET_KEY}:" \
  | jq '[.data[]
        | select(.type | test("fail|dispute|error|refund"; "i"))
        | {id, type, created, livemode}]'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

stripe.com

<!-- allowed-domains:end -->
