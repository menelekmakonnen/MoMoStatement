# Messages Web capture boundary

## User outcome

The Messages Web import can load older conversation pages and older message history after the statement owner starts a local capture. The helper selects only the checked Mobile Money networks, filters for transaction-shaped messages, and sends bounded candidates to the existing parser. Parser rejection remains a normal outcome; the helper never treats “scanned” as “valid transaction.”

## Trust and authority

- The user performs Google sign-in, account selection, phone pairing, and any “Use here” confirmation on Google’s page.
- The MoMo app does not collect Google credentials, OTPs, QR codes, cookies, or access tokens.
- A normal page cannot read a separately opened Google tab across origins, so the optional Manifest V3 helper is the explicit local bridge.
- The helper does not call Google APIs or fetch private endpoints. It inspects the rendered DOM in the Google tab only after the user presses **Start local capture**.
- Only provider-matched, transaction-shaped candidates cross the bridge; the app parses and deduplicates them into local storage.
- Stop is available during the scan. If the DOM changes and a message pane cannot be identified, the helper reports an error rather than claiming completeness.

## Loading algorithm

1. Find the rendered conversation list.
2. Collect unique conversation links, click Google’s own “Load more” control when present, and move the list to both ends until no new links appear.
3. Use conversation name and preview as an early network filter.
4. Open each selected conversation through its visible link.
5. Move the visible message pane from the newest end toward the top, allowing older messages to render, and deduplicate candidates by sender, timestamp, and body.
6. Require a Ghana-currency/amount marker plus a transaction marker and a selected-network match before sending a candidate to the app.

## Mobile boundary

Google Messages Web can be paired with a phone, but ordinary mobile Chrome cannot install this desktop content-script helper. The supported workflow is a desktop Chrome/Edge browser paired to the phone. Mobile-only users retain paste and SMS Backup & Restore XML import. A future native mobile companion would be a separate product and permission review, not an assumption hidden inside this web app.

## Installation and verification

Load `local-capture-extension/` unpacked in Chrome or Edge, pair Google Messages in its own tab, and then use the Messages Web tab in the app. The helper is intentionally host-scoped in `manifest.json`; add a deployment origin explicitly before distributing it. Verify with a user-owned test account and representative transaction messages, then confirm that only parsed rows appear in the local statement and that stopping the run prevents further batches.

Review [Google Messages for web](https://support.google.com/messages/answer/7611075?hl=en) and [Google’s Terms of Service](https://policies.google.com/terms?hl=en-US) for current pairing, cache, automation, and account-policy constraints before production distribution.
