# User journeys

## First-use path

`landing → Start with a sample → Import → sample parse → Review statement`

Success means the user sees real rows from the production parser without credentials or a dead-end CTA.

## Real import path

`Import → paste/upload/web input → local capture or Parse messages → parsed/partial/empty state → Review statement`

Failure states must say whether the input is unsupported, empty, partially parsed, helper-unavailable, awaiting Google pairing, or DOM-unrecognized and provide a safe next action. Google sign-in and pairing stay on Google’s own page.

## Review path

`Statement → search/provider/type/category/date filter → transaction row → View source and details → original source`

The review path must not change the parsed amount or hide the provenance needed to correct a record.

## Handoff path

`Statement or Dashboard → Export → CSV/JSON/PDF → local download`

Export is a user-owned handoff; the source statement stays available for another filter or export.
