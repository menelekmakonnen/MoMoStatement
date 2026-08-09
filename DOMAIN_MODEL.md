# Domain model

## Transaction

| Field | Meaning | Authority / retention |
| --- | --- | --- |
| `id` | Stable local row identity | Generated from transaction identity; retained locally |
| `provider` | MTN, Telecel, or AirtelTigo | Parser classification |
| `type` | Received, cash in/out, sent, merchant, airtime, or other supported type | Parser classification |
| `amount` | Exact GHS amount | Original message parse; never rounded for display logic |
| `timestamp` / `date` | Transaction time | Original message parse |
| `balance` | Post-transaction balance where present | Original message parse |
| `fee` / `tax` | Explicit charges where present | Original message parse |
| `reference` / `txnId` | Provider reference | Original message parse |
| `counterpartyName` | Named sender, recipient, or merchant | Original message parse |
| `category` | Local review category | Derived/local, never presented as provider fact |
| `source` / `rawBody` | Parser source and original message | Provenance authority; retained for review |

## Relationships

- A raw message produces zero or one parsed transaction.
- A parsed transaction belongs to one provider and may have one category.
- A filter state selects transactions without mutating them.
- An export artifact is a snapshot of the selected transaction view; it does not own the source record.

## Ownership and retention

The statement owner controls import, review, export, and local clearing. Browser-local persistence is the current retention mechanism. There is no server-side account or shared workspace in the core beta path.
