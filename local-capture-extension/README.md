# MoMo Statement local capture helper

This is an optional Chrome/Edge Manifest V3 extension that lets the MoMo Statement app load older Google Messages Web conversations and message history after the user explicitly starts a capture.

## Install for development

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select this `local-capture-extension` folder.
4. Open the MoMo Statement app from an allowed origin (`http://localhost`, `http://127.0.0.1`, or the configured production origin).
5. Choose **Messages Web**, select the networks to include, and open Google Messages Web.

The production host in `manifest.json` is intentionally explicit. If the app is deployed to another host, add that exact host to both the `host_permissions` and `content_scripts.matches` lists before distributing the helper.

## Privacy boundary

Google sign-in, account selection, OTPs, QR pairing, and any Google confirmation prompt stay on Google’s own page. The MoMo app never receives Google credentials, cookies, tokens, or the full Google Messages page. The helper inspects the rendered page locally only after the capture button is pressed. It sends back only candidates that match a selected network and a Mobile Money transaction signal; the app’s parser is the final acceptance gate.

The helper does not click Google’s pairing or “Use here” prompt. The user must confirm that prompt in Google’s own tab. It also does not make direct requests to Google or bypass the page’s normal controls.

## What the scan does

- walks the visible Google Messages conversation list;
- clicks the page’s own “Load more” control and scrolls the list to both ends until it stops changing;
- identifies likely MTN, Telecel Cash, and AirtelTigo conversations;
- opens each selected conversation and scrolls the rendered message pane toward older history;
- keeps message bodies local while filtering for provider and amount/transaction markers;
- sends only matched candidates to the local app in bounded batches for parsing and deduplication.

If Google changes its DOM, the helper reports that it could not identify a message pane instead of claiming that all messages were captured.

## Phone and mobile boundary

Google Messages Web can be paired with the Messages app on a phone, but an ordinary mobile Chrome browser cannot install and run this desktop content-script helper. The reliable workflow is therefore: pair the phone with Google Messages Web in a desktop browser, run the local helper there, and keep the resulting statement in the local MoMo app. On a mobile-only device, use the existing paste or SMS Backup & Restore XML fallback unless a future native mobile companion is built.

Review Google’s current service terms and any applicable account or device policies before distributing automated local scanning. The user remains in control of pairing, capture start, and stop.
