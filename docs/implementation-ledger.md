# Implementation ledger

26Oct2026:8geometry tests observed RED against real stub functions, then GREEN. Cases: literal contain odd margins/portrait/tiny dimension/crop bounds/distortion/upscale, stricttypes/keys/source/output/UTF16 limits. No browser pixels/decoder/persistence/HTTP/runtime/publication checked. Programme remains38/564.

Contract buildercheck: no owner-only blockers; corrected immutable-reopen wording. Candidate source folder is local implementation, not a public scaffold.

Tasks1/2 core:35tests GREEN (8geometry/9header/10store/8actualHTTP). Task3 controller:12tests initially GREEN, then2new recovery tests RED→GREEN;49current Node tests. Actual isolated Chromium pixel harness:6/7 before crop-edge fix,7/7 after;9MP output and16MP source are caps, not measured performance guarantees. Browser default drawImage sampled outside crop; scratch crop fixes actual pixel regression. Real PNG2872bytes/100×100 and manifest downloaded, hash exact. Not productUI/mobile/security evidence.

Ruling: export preparation creates two stable download links instead of silently attempting two automatic downloads — user explicitly downloads PNG and JSON from one frozen buffer; costs one extra click but avoids a blocked second download being reported as delivered.
Ruling: actual decision waits timed out twice; infer grounded3 for this session, not human approval — optional user steering remains live and may require visual changes. No selection telemetry sent.
Ruling: Node authentication/strictJSON patterns reused from owner Qabyl code, but all35/49 tests are this product own executions; historical Qabyl tests are not transferred.
