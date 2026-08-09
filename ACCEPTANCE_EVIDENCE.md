# Acceptance evidence

This file is intentionally a receipt log, not a source-only claim. Update it after each verification run.

## Current run

- Build: PASS — `npm.cmd run build` (Vite 8.2.1, 276 modules)
- Lint: PASS — `npm.cmd run lint` (`oxlint`)
- Automated tests: PASS — `npm test` (5 tests, including the Messages Web bridge bounds)
- Extension static checks: PASS — Manifest JSON parse and `node --check` for all four helper scripts.
- Real browser landing → import → sample: PASS — CTA opened `#/app/import`; sample produced 3 transactions.
- Real browser statement source disclosure: PASS — provider, type, fee, tax, reference, source, and original text were visible.
- Real browser refresh persistence: PASS — reload retained 3 imported records and the statement row.
- Quick period filter: PASS — “Last 30 days” remained active and showed 3 of 3 records.
- Narrow responsive state: CSS and responsive rules are present; the current in-app browser session does not expose a viewport override capability, so this remains a follow-up visual check.
- Messages Web helper: implementation added with explicit user-started local bridge, provider/message filtering, bounded batches, stop handling, and a paste/XML fallback. End-to-end authenticated capture remains pending a user-owned Google Messages test account and unpacked helper installation; no Google prompt was auto-confirmed during inspection.

## Evidence locations

- Reference decisions: `REFERENCE_REVIEW.md`
- Human-readable outcome contract: `ORBIT_OUTCOME_SPEC.md`
- Machine-readable outcome contract: `.orbit/outcome-spec.json`
- Reference capability ledger: `.orbit/reference-capability-ledger.json`
- Benchmarks: `.orbit/outcome-benchmarks.json`

## Claim status

The implementation has current local build, lint, and three outcome benchmark receipts. Remaining acceptance gaps are a real narrow-viewport visual pass and an authenticated end-to-end Messages Web capture receipt with the optional helper installed.
