<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Inngest — failed function runs

Fits: apps running durable functions on Inngest Cloud. `context=runtime`: recent `inngest/function.failed` system events — function id, run id, error message, and the opaque `*Id` keys of the triggering event.

- Secret: `INNGEST_SIGNING_KEY` — reuse the app's existing key. It is environment-scoped (branch environments and production have separate keys): use the key whose runs you want.
- Non-secret: `INNGEST_N` (events, default 25).
- CLI: none (`curl` + `jq`), no provision block.
- PII: the projection keeps only keys ending in `Id` from the triggering event's data. Keep free text and personal data out of `*Id` keys in your event payloads, or narrow the projection.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start inngest context=runtime -->

```bash
# Inngest Cloud — failed durable-function runs, exhausted retries (read-only).
# INNGEST_SIGNING_KEY is ENV-SCOPED (branch env vs production) — use the key for the env whose
# runs you want. Lists recent `inngest/function.failed` system events → function_id + run_id + error.
# PII-safe: surfaces ONLY /Id$/ keys from the triggering event; every other key is dropped.
# Customise: INNGEST_N; the ids projection (narrow it if any *Id key in your events carries PII).
[ -n "${INNGEST_SIGNING_KEY:-}" ] \
  || { echo "[context-fetch:inngest] skipped — INNGEST_SIGNING_KEY unset" >&2; exit 0; }
curl -s "https://api.inngest.com/v1/events?name=inngest/function.failed&limit=${INNGEST_N:-25}" \
  -H "Authorization: Bearer ${INNGEST_SIGNING_KEY}" \
  | jq '[.data[]
        | {id, ts, function_id: .data.function_id, run_id: .data.run_id,
           error: (.data.error.message // .data.error),
           ids: (.data.event.data // {} | with_entries(select(.key | test("Id$"))))}]'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

inngest.com

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

inngest

<!-- mcp-servers:end -->
