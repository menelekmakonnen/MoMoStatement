# Reference review: Mobile Money Statement

Observation date: 2026-08-08

The supplied text contained 125 unique URLs. The review below records only the references that exposed a useful, inspectable interaction or product contract. No code, assets, copy, or trade dress is copied from these systems.

## What we can learn

| Reference | Observed pattern | Adaptation in Mobile Money Statement | Boundary |
| --- | --- | --- | --- |
| [SeamUI](https://seamui.dev/) | Tactile controls use restrained depth, spring-like feedback, and visible pressed/focus states. | Filter chips, buttons, disclosures, and the landing demo use CSS-only state changes with accessible focus and reduced-motion handling. | Keep motion quiet and functional; no decorative interaction layer. |
| [Studio Micho](https://studiomicho.com/) | Terminal-like identity paired with operational dashboards, real-time KPIs, and an explicit listen → prototype → build → delivery loop. | The app uses a compact operations-console density, evidence-led dashboard copy, and a clear import → review → export path. | The product remains a private statement tool, not a studio portfolio or real-time service. |
| [FutureVision](https://financetest-nine.vercel.app/) | First use is a guided, small-step flow with one clear action per step and visible progress. | The public CTA reaches the import workspace in one click; sample data gives a first useful result without requiring credentials. | No copied game framing, labels, or emoji UI. |
| [Calcurama](https://calcurama.com/) | A searchable, compact tool library makes a broad capability set discoverable without a crowded menu. | Statement search, provider/type/category filters, quick periods, and direct export keep high-value operations findable. | We expose only capabilities the parser and export paths actually support. |
| [Lendtrain](https://www.lendtrain.com/) | Input → result → next action is explicit; the interface explains what the output means and calls out estimates and handoff. | Import explains the parser result, statement rows retain original source text, and export is presented as the handoff. | No financial advice, rate promises, or third-party account connection. |
| [Pipp Money](https://apps.apple.com/us/app/pipp-money/id6766039759) | A useful mental model translates raw money events into daily/weekly/monthly views, with grouped history and quick input. | MoMo records remain exact while dashboard summaries and date-range filters turn raw messages into reviewable cash-flow context. | We do not invent recurring expenses or normalize away the source transaction. |

## Access-limited or non-actionable references

- Rally Earth timed out during inspection.
- PM Toolkit exposed only its consent surface in the available session.
- TickTaco returned an unreadable digit-heavy DOM in the available session.
- Several other links were portfolios, private tools, or source-only references without enough observable behaviour to establish parity.

These are recorded as unknown rather than treated as implementation requirements.

## Resulting design decisions

1. The first public action must enter the real workspace, not a dead button or a waitlist.
2. The sample demo must use the production parser, so its result is trustworthy evidence of the actual workflow.
3. Imported records must survive refresh locally and preserve the original message for correction and audit.
4. Search, quick date ranges, provider/type/category filters, and export are the statement's compact toolbelt.
5. Visual polish comes from hierarchy, spacing, SVG icons, glass surfaces, and short CSS transitions—not emoji, fake AI claims, or heavy animation.

## Originality and non-regression boundary

The implementation borrows interaction lessons only. It does not reproduce reference branding, layout, proprietary code, assets, or product-specific claims. Ghana provider parsing, exact GHS amounts, local persistence, source traceability, and the existing React/HashRouter architecture remain the product authority.
