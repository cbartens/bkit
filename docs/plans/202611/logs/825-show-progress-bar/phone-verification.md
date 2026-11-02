# Claude App Phone Verification

> [!CAUTION]
> **Purpose:** Record the owner-run check that workflow progress prefixes remain on one line in the Claude app at 375px width.
>
> **Rules:**
>
> - Record the actual viewport and screenshots before setting the outcome to `passed` or `failed`.
> - Keep this external rendering observation separate from automated character-count checks.

Outcome: not run

No Claude app phone session or screenshot is available to this build agent. The rendered-layout criterion remains unverified. The build summary and handover must retain this outcome.

## Procedure

1. Open the Claude app on a device or viewport whose content width is 375 CSS pixels, and record the app version, platform and measured width below.
2. Display each complete line below as ordinary message text, outside a code block.
3. Capture a screenshot of each message at the normal font size and text zoom.
4. Confirm that `Progress: ███████░░░ 71%` and `Progress: ██████████ 100%` each stay on one line. The text after the percentage may wrap.
5. Record `passed` only if both prefixes remain intact; otherwise record `failed` and describe the wrap. Save the screenshot references and carry the outcome into the build summary or handover.

```text
Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3
Progress: ██████████ 100% · Step 14/14 Close Workflow
```

## Evidence

<!-- prettier-ignore -->
| Field | Observation |
| --- | --- |
| App version and platform | Not observed |
| Content viewport width | Target: 375 CSS pixels; not measured |
| Font size and text zoom | Not observed |
| 71% screenshot | Not captured |
| 100% screenshot | Not captured |
| Prefix wrapping | Not observed |
| Verified by and date | Not run |
| Outcome | not run |
