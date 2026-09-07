# MoMo Statement product direction

Status: active redesign direction, September 2026

This direction was authored through the Astra product/design review requested for this build. It deliberately does not use the ICUNI build-standards document as a design authority. The existing parser, local capture bridge, routes, and data boundaries remain the implementation substrate; the public promise and interaction quality are being reshaped around the product's actual value.

## Product thesis

MoMo Statement should feel like a beautifully clear record of everyday money. Its signature moment is the transformation from a real message into an inspectable statement row. Photography creates recognition; the statement earns trust.

Primary promise: **Your MoMo messages. A clear statement.**

Supporting promise: **Bring your messages together. Check every transaction. Download the record you need.**

Primary action: **Create my statement**. Secondary action: **Try a sample**.

The local workflow stays usable without an account. Sample data is isolated from personal records. Reported balances include their source/date context and are never presented as live balances, complete account history, or provider certification.

## Visual direction

- A Ghana-rooted red/gold/green ledger: off-white working surfaces, off-black framing, generous typography, and precise numerical alignment. Keep roughly 90% of the interface neutral; color carries action and meaning.
- Cover photography is reserved for recognition and context; working screens prioritize records and their source.
- Core light tokens: ink `#171916`, canvas `#F7F5EF`, surface `#FFFFFF`, gold action `#DDB447`, gold text/focus `#795609`, red `#A12B32`, green `#216B4B`, muted `#565C52`.
- Semantic colors: received `#216B4B`, outgoing/errors `#A12B32`, review/focus `#795609`. Bright gold is for action surfaces, never small text on light backgrounds.
- Display typography is Bricolage Grotesque; controls, prose, and tabular values use Public Sans with system fallbacks.
- Controls use 10px corners, panels/images use 16px corners, and pills are reserved for compact statuses or filters.
- Motion is short and state-driven: 120ms feedback, 180ms panels, 280ms source transformation, with opacity/transforms only. Reduced motion removes reveals and transforms.

## Cover contract

The cover uses the commissioned local asset at [`public/images/momo-cover.webp`](../public/images/momo-cover.webp): an eye-level Ghanaian shop counter, a person checking a phone beside a handwritten sales book, natural daylight, off-white and off-black surroundings, and restrained red, gold, and green details. It contains no readable private messages, account details, or brand marks.

Desktop uses a 5-column copy / 7-column image composition and a 6:5 image. Mobile puts copy and actions first, then uses a 4:3 crop. Beneath the photo, a solid proof strip shows a sample message beside its parsed amount and counterparty. **View source** reveals the exact fixture text. The WebP is the runtime asset; the PNG is fallback/source material.

## End-to-end journey

1. Create statement → choose paste, file, or optional desktop Messages Web capture.
2. Preview the import result → distinguish new, duplicate, unsupported, and needs-review records.
3. Add records → preserve input after failure and make the next action explicit for empty, malformed, interrupted, unsupported, storage-failure, and zero-match states.
4. Review the statement → show exact amounts, direction, provider, counterparty, fees, tax, reported balance, date provenance, and original message.
5. Export → summarize scope and count before PDF, CSV, or JSON output.

Unknown dates and balances remain unknown. Inferred timestamps are marked. Historical coverage is not inferred from imported volume.

Messages Web is optional: provider → helper readiness → pairing instructions → explicit start → live counts and Stop → review. The product says **capture available messages**, not “all history.” Mobile leads with paste/file because it is the dependable path on a phone.

## Workspace parity

The responsive workspace must keep Import, Statement, Overview, and More reachable below 768px. More exposes Insights, Export, and Settings in a compact menu. The statement is stacked on mobile without page-level horizontal scrolling; filters remain available through an accessible control/sheet pattern.

Settings must affect behavior: theme, provider preferences, storage status, backup/export, and confirmed clearing. Login/register and admin routes remain honest about their connected availability and do not become an account wall for local import.

## Performance and accessibility bar

- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on a representative mobile device.
- Cover is served responsively as WebP with intrinsic dimensions; current runtime WebP is 86KB and the PNG remains fallback/source material.
- Keep fonts self-hosted and bounded; do not add a chart/UI dependency for visual polish.
- Use 44px minimum targets, visible focus, semantic lists/fields/tabs, modal focus management, 200% zoom, and 320px reflow.
- Charts require a text equivalent. Content remains visible if animation initialization fails.
- Verify 390×844 and desktop with mixed-provider, duplicate, partial, unknown-date, empty, and large fixtures.

## Deliberate cuts

Cut repeated feature grids, ornamental dashboard chrome, testimonial-shaped guarantees, speculative premium tiers, decorative badges, confetti/count-up effects, scroll pinning, mandatory onboarding, and claims such as “private means encrypted storage.”

The release is successful when the cover attracts and the first real statement earns trust.
