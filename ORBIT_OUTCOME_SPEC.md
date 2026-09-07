# Orbit Outcome Build Spec: Mobile Money Statement

Status: local implementation verified; narrow-viewport visual evidence remains pending. Verification evidence is recorded in `ACCEPTANCE_EVIDENCE.md` and `.orbit/outcome-benchmarks.json`.

## 1. Intended result

A Ghana mobile-money user can turn provider SMS messages into a trustworthy, searchable statement, understand the resulting cash flow, and hand off an exact export without surrendering the raw messages to a remote service.

## 2. Actors and authority

- **Initiator/operator:** the statement owner imports or pastes their own messages.
- **Authority:** the parser and stored transaction record are authoritative for displayed fields; the original message remains the provenance authority when a field needs checking.
- **Corrector:** the statement owner can clear local data and re-import corrected messages.
- **Receiver:** the statement owner or an accountant receives CSV, JSON, or PDF export.
- **Payment:** no payment or premium capability is enabled in this beta surface.

## 3. Domain model

The durable entities are `raw message`, `parsed transaction`, `provider`, `balance`, `category`, `filter state`, and `export artifact`. A transaction keeps a stable local id, provider, type, amount, date, balance, fee/tax where available, reference, counterparty, parser source, and original source text. Raw input is retained locally; no network upload is required for the core path.

## 4. State machine

`empty → input-ready → capturing-or-parsing → parsed → reviewed → exported`

Exception states are `invalid-input`, `partial-parse`, `empty-result`, `helper-unavailable`, `awaiting-pairing`, `needs-google-confirmation`, `dom-not-recognized`, `capture-stopped`, and `export-failed`. A user can retry read-only parsing, inspect the original source, clear local records, or return to import. Export is terminal only for the artifact; the statement remains editable through re-import.

## 5. Primary journey

1. **Arrival:** landing page states privacy, supported providers, and the real first action.
2. **First useful result:** “Start with a sample” opens Import and produces parsed records without credentials.
3. **Continued work:** paste/upload, optional local Messages Web capture, provider-aware parse, search, quick periods, filters, and source disclosure.
4. **Delivery:** CSV, JSON, or PDF export preserves the reviewed values.
5. **Outcome feedback:** the user can return to the statement, change filters, inspect source, or clear and retry.

## 6. Capability contracts

The machine-readable contracts are in `CAPABILITY_CONTRACTS.json`. The core path is local, unauthenticated, and free in the current beta. It reports unsupported or empty input rather than claiming a successful parse.

## 7. Product interaction grammar

The current product direction is the image-led Ghana-rooted ledger in `docs/PRODUCT_DIRECTION.md`: off-white working surfaces, off-black framing, red/gold/green meaning, strong numeric hierarchy, semantic SVG icons, short state-driven transitions, and source-backed review. Each transaction can open to its parsed fields and original message. The interface deliberately excludes emoji UI, fake AI insight claims, decorative charts that do not explain a value, dead CTA buttons, and unsupported PDF-import promises. Keyboard focus, native controls, responsive bottom navigation, and `prefers-reduced-motion` are required.

## 8. Acceptance contract

- Landing CTA reaches the real import route in one activation.
- Sample input uses the production parser and produces visible transactions.
- Refresh retains the locally stored statement.
- Search, provider/type/category filters, quick periods, and custom dates narrow the same records.
- A transaction disclosure shows source and parsed details without changing amounts.
- Export paths remain available and use the reviewed records.
- Messages Web capture never handles Google credentials and reports helper/pairing/DOM failures instead of claiming all messages were loaded.
- Build and lint pass; the real app is checked in desktop and narrow responsive states.

## 9. Reference baseline

See `REFERENCE_REVIEW.md`. Matched lessons are guided first use, tactile but restrained feedback, searchable compact tools, explicit input → result → handoff, and grouped money context. Unknown or access-limited references remain unknown; no invented parity is claimed.

## 10. ICUNI Advantage Contract

| Dimension | Target | Evidence gate |
| --- | --- | --- |
| Time-to-first-value | One public CTA reaches import; sample produces a result without sign-in. | Browser path and sample parse receipt. |
| Evidence / accuracy | Every row keeps exact amount and can reveal original source text. | Statement disclosure inspection and parser output. |
| Local/privacy control | Core records persist in browser storage; no required account or upload. | Refresh/revisit flow and source inspection. |
| Recovery | Empty, invalid, filtered-empty, and export paths explain the next action. | UI state checks and build/lint. |
| Accessibility / responsive use | Native controls, visible focus, no emoji-only affordances, mobile bottom navigation. | DOM semantics, keyboard path, narrow viewport check. |

## Claim gate

The product may claim “private, evidence-led statement review” only after the acceptance evidence and outcome benchmarks are updated with current run receipts. Compilation alone is not product proof.
