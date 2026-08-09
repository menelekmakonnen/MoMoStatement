# MoMo Statement

MoMo Statement is a local-first React application for turning mobile-money SMS messages or XML backups into a searchable statement, cash-flow overview, evidence-led insights, and exportable records.

## Current product boundary

- Supported input: pasted MTN-style SMS messages, SMS Backup & Restore XML files, and an optional local Google Messages Web capture helper.
- Current storage: normalized transactions in the browser via Zustand/local storage.
- Current exports: CSV, JSON backup, and a compact PDF summary.
- Privacy posture: no transaction data is sent to a server by the core import flow.
- Provider scope: the parser is intentionally explicit about the currently supported MTN, Telecel, and AirtelTigo patterns; unsupported formats are reported rather than silently treated as valid.
- Messages Web scope: the optional helper loads rendered Google Messages history locally after explicit user start; it does not receive Google credentials, OTPs, QR codes, cookies, or the full message stream. See [`docs/MESSAGES_WEB_CAPTURE.md`](docs/MESSAGES_WEB_CAPTURE.md).

Authentication and the Google Apps Script integration remain separate product surfaces. They are not required for the local statement flow and should not be described as active until their invocation, authorization, and live verification paths are connected.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL and use **Try sample data** to exercise the complete import → statement → dashboard → export path.

To try automatic Messages Web loading in development, load [`local-capture-extension/`](local-capture-extension/) unpacked in Chrome or Edge, then pair Google Messages in Google’s own page before starting a capture from **Import → Messages Web**. A desktop browser is required for the helper; paste and XML remain the mobile-only fallback.

## Verify

```bash
npm run lint
npm test
npm run build
```

The design and acceptance rationale for the current pass is in [`docs/INSPIRATION_REVIEW.md`](docs/INSPIRATION_REVIEW.md). The governing product and engineering standards are [`ICUNI_Build_Standards.md`](<D:/ICUNI Group/ICUNI Labs/Orbit/ICUNI_Build_Standards.md>).

## Architecture notes

- `src/components/layout/` contains the responsive application shell, route-aware header, collapsible sidebar, and mobile navigation.
- `src/components/ui/` contains shared primitives such as inline SVG icons, the logo mark, buttons, and notifications.
- `src/pages/app/` contains the import, statement, dashboard, insights, export, and settings surfaces.
- `src/stores/` owns auth, UI, and normalized transaction state.
- `src/lib/parser/` contains the provider parsers and deterministic transaction helpers live in `src/stores/txnStore.js`.
- `gas/` is kept as an integration boundary; do not claim production connectivity without an authenticated live check.
