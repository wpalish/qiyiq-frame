# QiyiqFrame0.1 — local implementation in progress

Original bounded manual crop/contain editor inspired by the one-image task, not Photoroom code/branding, AI or background removal. Native Node24.15–24.x ESM/SQLite, no dependencies or external API. Server stores metadata recipes, not images; browser pixels and download are checked separately. This is not marketplace approval, proof of rights, quality or full tenant/security certification.

```sh
ADMIN_USER=your_local_name ADMIN_PASSWORD=your_long_synthetic_password npm start
```

Create only synthetic local accounts/images. Host127.0.0.1, PORT3000 (optional), DATABASE.data/qiyiq.sqlite (optional). Password>=14characters, no default. Keep .data/auth/private files outside Git/archives. Admin can create accounts through the interface. All authenticated accounts see shared metadata; only creator archives. No delete/unarchive/edit of frozen recipes.

Input: one PNG/JPEG<=8MiB/16MP; parser rejects EXIF/MPF/APNG/eXIf and browser must decode matching dimensions. Output100–3000px each. Crop is an explicit integer source rectangle, materialized before interpolation to prevent neighboring pixels bleeding into the crop. Different aspect ratios stretch; enlargement does not restore detail. White matte fills transparency too. PNG preparation creates two separate explicit download links (image+manifest); preparation is not downloading.

Save freezes metadata sourceSHA/geometry/title/owner/time; reopen requires exact source file. In-app metadata refresh preserves same-account live input; full reload may lose file/drafts; identity change clears interface input and revokes URLs. These are scoped implementation behaviors, not erasure of knowledge or copies. Unknown network write outcome requires refresh, never automatic resend.

Current evidence:49Node tests,7isolated actual Chromium pixel cases; a browser crop-edge regression was found and fixed. Full product UI/mobile/restart/preservation/review/publication remain pending. Not a published or counted39th product. Full contract docs/contract.md, ledger docs/implementation-ledger.md.

```sh
npm test
```

API:GET /health,/api/config,/api/session,/api/state;POST /api/login,/api/logout,/api/recipes,/api/recipes/:uuid/archive;admin GET/POST /api/users,GET /api/audit,/api/backup,POST /api/restore. Same Origin, CSRF, HttpOnly/SameSite cookie; JSON2MiB max; strict keys/types/decoded duplicate keys. Recipe command CAS/globalUUID/clock checked in one IMMEDIATE transaction. No image upload route. JSON backup excludes users/auth/sessions/audit; restore only empty metadata workspace/current referenced accounts. Full consistent SQLite backup is separate and private.

Noto Sans self-hosted from Google Fonts under OFL, license public/fonts/OFL.txt. Image fixtures authored from exact synthetic RGBA quadrants. No vendor/photo assets or real client data.
