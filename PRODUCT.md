# QiyiqFrame

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Implementation delegated by the owner's autonomous100-product instruction: Node24 native ESM/SQLite local server, HTML/CSS/JavaScript and Canvas2D. No dependency, external API or image upload route is planned.

## Users
Scenario hypothesis: small photo/content teams preparing one owned or synthetic image. Demand, actual process and budget are unknown. All authenticated local staff share metadata; no tenant-isolation claim.

## Product Purpose
Explicit one-image crop or contain, original/result comparison, PNG plus measurement manifest, immutable saved geometry recipes reopened against the same source SHA256. Full contract: docs/contract.md.

## Positioning
Manual numeric geometry with visible source binding. No AI, background removal, generated scene or bulk processing. Reference21 is inspiration, not copied code or branding.

## Operating Context
Local synthetic workflow. Image bytes remain in the live browser; saved server recipes are metadata only. Reselect the exact file to reopen. Full reload may lose live bytes and drafts. These are implementation constraints to verify, not a completed privacy audit.

## Capabilities and Constraints
One PNG/JPEG <=8MiB and <=16MP. Bounded parser rejects PNG animation/eXIf and JPEG EXIF/MPF, including phone orientation metadata; no silent rotation. Outputs100–3000px each with separately bounded40MiB PNG encoding. Crop rectangle has integer source coordinates and can distort at a different aspect ratio; contain centers the full image. Transparent or white matte; interpolation does not recover detail. Explicit recipe save/export/archive, global revision/key guards, only creator archives. No physical quality, marketplace approval, rights, signatures or delivery proof. Core/backend and editor are now locally implemented;60Node tests and7isolated browser pixel cases plus actual largePNG export passed. Current desktop/mobile workflow, recovery, metadata restore and preservation are recorded. Full UI review returned3material state/recovery findings; scoped verdict scored all3resolved after current recaptures. Public repository/CI/archive records are managed by the programme; these local checks are not public hosting or customer acceptance.

## Evidence on Hand
Prior official-source research and three company hypotheses: reference-21-source-screen.json and outputs/commercial/photoroom-contact-screen.* in the programme workspace. No real images, clients, testimonials or metrics. Own synthetic fixtures will be authored. Optional editor-layout question is unanswered. Actual direction waits timed out; this session infers the paired-image direction under the recorded Impeccable procedure. No human visual approval or standing preference is claimed.

## Product Principles
1. Preview and PNG share one actual pixel buffer.
2. Source identity and geometry are explicit; restore never guesses.
3. Saves, exports and visibility changes require explicit actions.
4. Numeric checks do not certify photographs or marketplace acceptance.

## Accessibility & Inclusion
RU/KK task copy, native labeled numeric/file/select controls, visible focus, text alternative measurements and keyboard access to every action. Canvas is not the sole source of geometry or status.
