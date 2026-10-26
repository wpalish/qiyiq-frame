# QiyiqFrame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One original manual image geometry workflow with actual PNG pixels, source-bound frozen recipes and truthful recovery.
**Architecture:** Browser parses and decodes one image, computes numeric geometry, renders a single canvas and exports its frozen PNG plus manifest. A local Node/SQLite authenticated server stores immutable metadata recipes and audit; no image upload route. Source/header/geometry modules are shared pure ESM with server validation.
**Tech Stack:** Native Node24 ESM/SQLite, HTML/CSS/JS, browser Canvas2D; no dependencies/services.
**Spec:** ../../contract.md and PRODUCT.md. Builder check found no owner-only blockers, one reopen wording corrected. Programme authorization covers implementation choices; optional visual choice is pending, never approval by silence.

## Global Constraints
One PNG/JPEG1–8388608 bytes and <=16000000 decoded pixels. Reject animation/EXIF/MPF. Output100–3000px each; crop integer source rectangle or centered contain; transparent/white matte. Shared authenticated synthetic metadata, creator-only archive, globalCAS/freshUUID, empty/admin restore. No image/credentials/DB in public sources. Actual browser/exactCI/ZIP/index/review before counting.

## Review Focus
- Metadata header and decoded dimensions disagree: refuse; never silently rotate.
- Later source/settings invalidates earlier bitmap/blob: no stale download.
- Wrong reselected source for saved recipe: refuse without altering frozen record.
- Stale/unknown save: retain live input, explicit refresh, no automatic resend.
- Transparent edges and uneven integer margins: verify exported pixels and preview use same buffer.

## Task1 — pure image contract
Files: public/geometry.js (strict input/recipe normalization and geometry); public/image-header.js (bounded PNG/JPEG parser); test/geometry.test.js and test/header.test.js. Own fixture helper encodes known literal pixels via Node zlib; it is not the production parser.
- [ ] Write behavior tests for literal contain/crop geometry, strict types/keys/limits; watch fail.
- [ ] Implement pure normalized geometry; run green.
- [ ] Write PNG/JPEG corruption/animation/EXIF/limits tests; watch fail.
- [ ] Implement bounded header policy; run green. Browser remains final decode check.

## Task2 — persistent recipe commands
Files: module.js, lib/store.js, lib/auth.js, server.js; test/store.test.js and test/http.test.js. Reuse owned infrastructure patterns only after reading them.
- [ ] Write store create/archive/CAS/replay/clock/immutable/restore tests; watch fail then implement.
- [ ] Write real authenticated HTTP route/origin/body/rights/no-upload/restore refusal tests; watch fail then implement.
- [ ] Verify file reopen/empty restore/corrupt copies and exact whole workspace/audit on rejection.

## Task3 — generation controller and editor
Files: public/controller.js, public/app.js, public/index.html, public/styles.css and own synthetic fixture generator.
- [ ] After actual direction choice, record six-block brief and type/palette/control rules.
- [ ] Write race/reopen/export invalidation tests against real controller with controllable decode/encode boundaries; watch fail then implement.
- [ ] Build labeled native controls and canvas comparison. Read craft-floor immediately before UI edits.
- [ ] Real desktop/mobile/native keyboard file→contain/crop→PNG/manifest→save/reselect/stale/refresh/error. Inspect actual dimensions/pixels, manifest hashes and overflow. Capture validity/provenance; no fake touch/screenreader claims.

## Task4 — acceptance and release
- [ ] All own runtime tables and every existing privateDB preserved across own identified restart; never stop from remembered PID.
- [ ] Current full TAP pass, served bytes and source/capture hashes; one detector after visual round.
- [ ] Fresh Impeccable finish review, one material fix batch if required, documenter/DESIGN+sidecar.
- [ ] Three prior official hypotheses with original dates/unknown demand; no outreach without full clearance.
- [ ] Clean individual public repo/exactSHA CI, public ZIP/hash, current index/browser counts and one-time finalizer; state/automation100 updated in place. No extra product count until all gates hold.
