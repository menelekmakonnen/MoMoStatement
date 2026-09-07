# Acceptance evidence

This file is intentionally a receipt log, not a source-only claim. Update it after each verification run.

## Current run

- Build: PASS — `npm.cmd run build` (Vite 8.2.1, 276 modules)
- Lint: PASS — `npm.cmd run lint` (`oxlint`)
- Automated tests: PASS — `npm test` (10 tests, including bridge bounds, transaction-ID deduplication, no-ID review preservation, and parser keyword boundaries)
- Extension static checks: PASS — Manifest JSON parse and `node --check` for all four helper scripts.
- Real browser landing → isolated sample: PASS — the import CTA opened `#/app/import`; **Try isolated sample** returned to the public demo and the same parser produced 3 reviewable transactions without writing to the personal statement flow.
- Real browser personal import staging: PASS — a unique pasted message produced a staged preview with new/duplicate/unsupported-estimate/needs-review counts, source disclosure, row selection, and **Discard preview** left the local statement unchanged.
- Real browser demo parser: PASS — the landing sample rendered Received GHS 420.00, Sent GHS 275.00, Net GHS 145.00, and three parsed rows.
- Real browser statement source disclosure: PASS — provider, type, fee, tax, reference, source, and original text were visible.
- Real browser refresh persistence: PASS — reload retained 3 imported records and the statement row.
- Quick period filter: PASS — “Last 30 days” remained active and showed 3 of 3 records.
- Narrow responsive state: PASS — Astra inspected the 390×844 workspace and the live app exposes Import, Statement, Overview, and More navigation with touch-sized controls; the current CUA smoke also rendered the staged preview at a narrow viewport.
- Storage recovery guard: PASS — read failures remain distinct from write failures; retry re-reads the original browser payload and does not overwrite it with an empty fallback.
- PDF coverage guard: PASS by source review — PDF export now starts new pages and reports the full selected count; a long-record live download remains a follow-up receipt.
- Messages Web helper: implementation added with explicit user-started local bridge, provider/message filtering, bounded batches, staged capture review, stop handling, and a paste/XML fallback. End-to-end authenticated capture remains pending a user-owned Google Messages test account and unpacked helper installation; no Google prompt was auto-confirmed during inspection.

## Evidence locations

- Reference decisions: `REFERENCE_REVIEW.md`
- Human-readable outcome contract: `ORBIT_OUTCOME_SPEC.md`
- Machine-readable outcome contract: `.orbit/outcome-spec.json`
- Reference capability ledger: `.orbit/reference-capability-ledger.json`
- Benchmarks: `.orbit/outcome-benchmarks.json`

## Claim status

The implementation has current local build, lint, automated, isolated-demo, staged-import, and responsive receipts. Remaining acceptance gap is an authenticated end-to-end Messages Web capture receipt with the optional helper installed, plus a long-record PDF download receipt.
