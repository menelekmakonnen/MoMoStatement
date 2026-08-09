# MoMo Statement reference review

Reviewed 2026-08-08 against `ICUNI_Build_Standards.md` §20. The sources below are inspiration and evidence for mechanisms, not visual templates. MoMo Statement keeps its own product identity, copy, parser model, and interaction grammar.

## Selected observations

| Reference | Evidence class | Transferable mechanism | MoMo Statement adaptation |
| --- | --- | --- | --- |
| [Mix Analyzer](https://mixanalytic.com/) | `LIVE_OBSERVED` | A sample report appears before commitment; scores lead to specific next checks; illustrative, unavailable, and customer-result states are labelled. | Import page has a sample fixture, explicit parse status, local-data messaging, truthful empty states, and evidence-led insight copy. |
| [Pipp Money](https://apps.apple.com/us/app/pipp-money/id6766039759) | `DETAILED_PRIMARY` | Cash-flow views, multiple wallets/currencies, import/export, and privacy are framed around understanding daily money rather than merely recording transactions. | Dashboard prioritises received/sent/net flow, provider coverage, exact exports, and local-first privacy. Multi-wallet and multi-currency are deliberately not claimed yet. |
| [Mukafi](https://mukafi.com/en) | `LIVE_OBSERVED` | A focused calculator asks for only the inputs needed, explains the result, shows a breakdown, and keeps privacy and source context visible. | The statement keeps the first import short, exposes fee/tax/reference/source details on demand, and makes the export contract explicit. Legal calculations are outside this product boundary. |
| [Jotweave](https://www.jotweave.com/) | `LIVE_OBSERVED` | The first surface answers what is due, waiting, or needs review; raw capture remains connected to the structured result. | Import-to-review handoff is visible, raw message text stays on the transaction, and statement/insight pages expose the next review action. |
| [Clyde local workspace](https://clyde-survival.com/demo/) | `LIVE_OBSERVED` | Local/offline tools communicate unavailable states and make retrieval provenance visible instead of masking missing context. | The app labels local mode, empty states, parser results, and unsupported inputs; it does not imply cloud sync or live provider access. |
| [FinSignals](https://finsignals.ai/) | `LIVE_OBSERVED` | Structured result envelopes separate signal, source, coverage, and next action from narrative noise. | Parser status, transaction metadata, dashboard calculations, and export counts stay structured and reviewable; no financial advice claim is added. |
| [Calcorithm](https://calcorithm.com/) | `LIVE_OBSERVED` | Useful results appear quickly as inputs change, with no account required for the basic calculation. | Search, date filters, and the sample parser respond locally and immediately; connected actions remain opt-in and separately labelled. |
| [The PM Toolkit](https://thepmtoolkit.app/) | `LIVE_OBSERVED` | Claims carry confidence, provenance, and a visible source chain; inferred content is marked instead of presented as fact. | Insights are labelled observations/heuristics, the dashboard states that values are computed from imported records, and exports preserve parser metadata. |
| [My-CC](https://my-cc.io/) | `LIVE_OBSERVED` | High-risk actions pause for review and leave an audit-readable record; the user can see the order of operations. | Destructive local clearing requires confirmation, export cards explain the output contract, and the import journey shows what happens next. |
| [SeamUI](https://seamui.dev/) | `LIVE_OBSERVED` | Small spring/touch responses make controls feel physical; motion is state-driven and bounded. | Buttons, nav items, logo, resize handle, and cards use short GPU-friendly transitions. Reduced-motion users receive a no-motion path. |
| [EventFlow](https://event-flow.net/) | `SURFACE_ONLY` | The public surface exposes a large operational vocabulary: import helpers, live dashboards, permissions, audit logs, reports, and offline workflows. | The app shell now has real page separation and a persistent nav; operational/admin breadth remains future work until each capability has a backend contract and verification evidence. |
| `https://financetest-nine.vercel.app/` from the supplied corpus | `LIVE_OBSERVED` | The linked deployment presents a guided, step-based personal-finance setup with one clear next action per step. | The import CTA enters the real workspace and sample data produces the first useful result without credentials; no game framing or emoji UI is copied. |

Additional direct checks from the supplied corpus:

- [Studio Micho](https://studiomicho.com/) reinforced compact operational dashboards and an explicit listen → prototype → build → delivery loop. This informed the evidence-console density and import → review → export journey.
- [Calcurama](https://calcurama.com/) reinforced searchable, compact tool discovery. This informed statement search, provider/type/category filters, quick periods, custom dates, and direct export.
- [Lendtrain](https://www.lendtrain.com/) reinforced explicit input → result → next-action explanations and visible caveats. This informed parser status, source disclosure, and handoff copy without importing financial advice or rate claims.

## Deliberate exclusions

- No copied brand assets, screenshots, source code, proprietary data, or trade dress.
- No unsupported “AI” claims in the core statement journey. The current insight pass is a transparent heuristic layer.
- No chart library for dashboard charts. The build standards require dependency-free SVG charts, so the charts are original, data-backed SVGs.
- No automatic cloud sync or multi-wallet model is claimed until its permissions, ownership, privacy, and recovery contracts are implemented.
- Paste-import timestamps are marked as inferred, so time-based review heuristics do not present the import time as an observed transaction time.

## Current acceptance focus

1. Paste the sample messages and receive a visible parsed-result status.
2. Open the statement and verify provider, type, counterparty, reference, amount, fee, and balance.
3. Search and filter the imported records without losing the raw source.
4. Open dashboard and insights and see only values computed from the imported records.
5. Export CSV, JSON, or PDF and preserve the selected range and source metadata where the format supports it.
6. Repeat the first-use path at desktop and mobile widths; navigation remains reachable and text does not depend on colour alone.
