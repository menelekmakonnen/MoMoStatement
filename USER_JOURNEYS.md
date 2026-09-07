# User journeys

## First-use path

`landing → Try a sample → isolated parser result`

Success means the user sees real rows from the production parser without credentials, and the sample never enters personal local storage.

## Real import path

`Import → paste/upload/web input → local capture or Parse messages → parsed/partial/empty state → Review statement`

Failure states must say whether the input is unsupported, empty, partially parsed, helper-unavailable, awaiting Google pairing, or DOM-unrecognized and provide a safe next action. Google sign-in and pairing stay on Google’s own page.

## Review path

`Statement → search/provider/type/category/date filter → transaction row → View source and details → original source`

The review path must not change the parsed amount or hide the provenance needed to correct a record.

## Handoff path

`Statement or Dashboard → Export → CSV/JSON/PDF → local download`

Export is a user-owned handoff; the source statement stays available for another filter or export.
