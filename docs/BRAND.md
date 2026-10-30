# LevelUp brand language

LevelUp helps people train consistently and see their progress. Use short, clear,
motivating sentences. Be confident and approachable; describe the action or progress
without promising results, shaming rest days or inventing rewards.

- Name: **LevelUp**
- Tagline: **Train today. Grow over time.**
- Short copy: **Your training. Your progress.**
- Description: **Plan your workouts, track your training, and see how far you've come.**
- Brand indigo: `#6857F2`; celebration lime: `#B9EE64`.
- Brand surface references: `#F7F8FB` and `#111827`.

`frontend/src/brand.js` holds the identity. The SVGs in `frontend/src/assets/brand/`
are original ascending steps with a system-font wordmark: horizontal, dark-background,
compact symbol and monochrome (`currentColor`, suitable for inline SVG use). There are
no added font or package dependencies. These small assets are inlined by the existing
Vite build. The logo's indigo is independent of the user's accent setting.

Keep HTML and manifest metadata in sync with `brand.js`; `frontend/src/brand.test.js`
checks their static copies. Translate interface copy with the existing `t()` mechanism
and locale packs; keep LevelUp's spelling. The tagline is identity/documentation copy,
not a new interface section.

## Phase 1 boundaries

New and missing theme preferences display Light. Invalid preferences also display
Light without being rewritten. Explicit Dark, Light and System remain supported.
Settings stays at Look & Home → Theme. The inline startup script resolves the existing
`gym_state_v1` preference before paint; App continues applying preferences and listening
for OS changes in System. There is no preference migration. Existing persistence,
sync, native splash timing, system-bar handling and accent selection stay intact.

The application surface remains the existing light `#f2f2f7` (dark `#000000`), rather
than applying the brand reference colours to semantic tokens. Fixed PWA background and
theme colours use the Light default: a static manifest cannot follow each person's
choice or OS theme. Runtime browser chrome still follows the effective theme. Existing
PWA icons and native identifiers are intentionally retained for Phase 2.

The pre-React script is allowed by a CSP hash in `web/Dockerfile`. Update that hash
whenever its contents change; `frontend/src/lib/csp.test.js` guards this relationship.
This is a source-only compatibility update, not a production infrastructure change.

The Plan subtitle still explains the current fixed-week or rotation mode. There is no
extra slot for “A plan that keeps you moving forward.” without removing useful mode
information or adding UI. Home retains its date, personalised greeting, rest-day label
and next-session information; its existing first-use card contains the new introduction.
Personal-record and history labels already describe the data accurately and stay intact.

## Attribution and remaining upstream names

LevelUp is based on openGym, © 2026 Duarte Santos, AGPL-3.0-or-later. Preserve LICENSE,
NOTICE.md and the About attribution. About links the fork's corresponding source, with
upstream credit and media notices retained.

Upstream download, update, store-rating and donation labels still name openGym because
their unchanged destinations provide or support openGym. Do not label an upstream APK
as a LevelUp release. Server/protocol diagnostics, import/export format names, backup
filenames and folders, app IDs, native resources, legal notices and historical/project
documentation also retain upstream identifiers. Broader Coach, pairing and protocol
copy is outside this core-screen pass. Do not rename machine values as a branding edit.

Exercise media is separately licensed by Gym visual and is not covered by the AGPL.
NOTICE.md permits a non-commercial fork to retain unmodified 180 px media with the
notice; commercial reuse needs its own licence. No media, licence text or attribution
was removed, transformed or regenerated in this phase. Confirm licensing before any
commercial distribution. The new SVGs do not derive from those media or competitor art.
