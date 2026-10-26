# Reference21 implementation contract — 26 October2026

Pre-code design snapshot; current implementation/evidence status is in implementation-ledger.md.

Working name QiyiqFrame; original one-image geometry editor. The owner authorized autonomous bounded implementation in the100-product programme. The optional task-layout question is pending; no unanswered preference is recorded as approval. Native Node24 ESM/SQLite and browser canvas are an implementation choice within that standing scope. No code or runtime exists yet.

## Scope and approaches

Primary hypothesized user: a small photo/content service preparing one explicitly owned or synthetic image, checking the original against one PNG result. This is a scenario hypothesis, not observed demand. Success: explicit numeric crop/contain geometry, preview and downloaded PNG from the same rendered pixel buffer, plus a frozen metadata recipe that can be reopened after reselecting exactly the same file. Not a background remover, AI, scene composer, bulk normalizer, marketplace certification or physical quality inspection.

Considered: pure ephemeral browser editor (fewest moving parts, no durable recipe); server image processing (consistent decoder but uploads image bytes); browser pixels plus local authenticated metadata journal (chosen: useful durable recipes without an image upload route). The server validates numeric claims but cannot establish actual pixels, ownership or a download. Browser evidence must establish its own pixel/export behavior. No privacy/no-network promise before route and browser observation.

## Input and decode policy

One PNG or JPEG; byte length1–8388608; header width/height1–16000 and total<=16000000 pixels before browser decode. Decode bitmap dimensions must equal the parsed header, otherwise reject. Read magic bytes, never trust MIME or filename. PNG: valid signature, first/unique13-byte IHDR, valid supported PNG color/depth combinations, bounded chunk framing/CRC and required IDAT/IEND; reject animated acTL/fcTL/fdAT, eXIf and unknown critical chunks, trailing bytes and truncation. JPEG: SOI/EOI, bounded segment lengths, one supported8-bit SOF0 or SOF2 with1 or3 components, a scan; reject any APP1 Exif payload in this bounded version (including orientation1), MPF multi-picture APP2 and second SOI. Thus phone photos containing EXIF must first be flattened elsewhere; no silent orientation guessing. Browser decoder remains the final corruption check, not a complete format-security parser.

## Geometry and export

Output width/height integer100–3000, <=9000000 pixels. Mode contain uses full source with centered integer destination: scale=min(outW/srcW,outH/srcH); drawnW=max(1,min(outW,round(srcW*scale))), analogous height; x=floor((outW-drawnW)/2), y analogous. Crop uses explicit integer source x/y>=0,w/h>=1 and x+w<=sourceW,y+h<=sourceH; rectangle is stretched to output dimensions, with an explicit distortion warning when ratios differ. No hidden auto crop. Upscale permitted but labeled as interpolation, never restored detail. Matte is transparent or solid white; white fills the canvas before drawing and affects transparent source pixels too, not the original opaque background. High-quality browser canvas interpolation; byte-for-byte output across browsers is not promised.

Source/result preview derives from the same source bitmap and current settings. PNG download and its manifest are an explicit single export action over one frozen generated Blob. Any input/geometry/recipe/identity change invalidates that Blob before another export. Manifest version1 binds SHA256 of actual source bytes, parsed/decode dimensions, normalized geometry, matte, output dimensions, actual PNG Blob SHA256/byte length and a local generation timestamp. Hashes provide consistency, not authorship/authenticity. A recipe is metadata only; source bytes, account credentials, sessions and audit are not in its download.

## Persistence, rights and routes

All authenticated local staff share the synthetic metadata workspace; no tenant boundary is claimed. Auth/login/logout/me, health, static assets; GET workspace; POST recipes; POST recipe/:id/archive; admin export/empty restore and audit. No image upload endpoint, third-party integration or delivery route. Create freezes title1–120UTF16, sourceSHA256/format/byteLength/dimensions, geometry and owner/current server time. Global expectedRevision and globally new UUIDv4 command key are checked atomically. Only original creator may archive (admin cannot override); immutable recipe content is never edited; reopening loads frozen settings only after exact-file verification. Archive changes visibility only, old source fingerprint and geometry remain exact. GET/refresh/time perform no writes. Clock rollback before last accepted workspace event rejected. Admin JSON restore accepts only empty workspace and validates structure, normalized geometry, unique row/key IDs, archive transition/owner/referenced current account binding and event/key counts; accounts/auth/audit excluded. Consistent SQLite backup is separate private evidence.

## Client concurrency and recovery

Every file load/render/export request has a generation token. A later file, geometry, recipe, logout or session change invalidates earlier work; close discarded ImageBitmap and revoke discarded object URLs. Never display or download a late image/export. Error preserves last valid image while disabling export for the failed replacement until an explicit valid reselect. Input controls retain unsaved geometry/title after in-app metadata refresh/stale save. Full reload may lose browser-only bytes/drafts. Saved recipe reopen requires file SHA256, byte length, format and dimensions all equal; mismatch refuses without changing saved recipe. Unknown network write outcome calls for explicit refresh, never automatic resubmit. Auth identity change clears browser bytes/drafts/URLs; no-store is not memory erasure or secrecy.

## Before counting

Geometry/header/controller/store/actual authenticatedHTTP tests, actual PNG pixels/dimensions/hash in browser, corrupt/oversized/async replacement/reopen/stale/native keyboard, actual desktop/mobile captures with viewport/overflow provenance; own file restart/all5tables and prior DB preservation; independent fresh UI/source review and documentation; separate clean public repo/exact CI, ZIP and index/browser verification, then finalizer once. Prior27/41 tests are not reused as tests of this product. Three prior sourced business hypotheses retain their research dates and unverified demand status.
