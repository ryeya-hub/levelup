# Phase 2 assets and sharing metadata

The install icons and favicon reuse the original LevelUp SVG rectangles. The favicon
is text-free and transparent. Apple/PWA icons have an opaque light brand surface and
padding. The separate maskable image keeps every foreground pixel inside the central
80% safe-area circle; the generator asserts this after rendering.

The existing `icon-180.png` and `icon-512.png` paths remain valid, including service
worker notification references. The 512 standard icon is now `purpose: any`; only
`icon-maskable-512.png` is declared maskable. Manifest name, start URL, scope, standalone
mode, orientation and Light colours are unchanged. Service worker code is unchanged.

The 1200 × 630 social image uses original ascending geometry, the wordmark and approved
tagline, rendered with an existing system semibold font. It contains no workout data
or third-party exercise art. No font or runtime dependency has been added.

Regeneration uses Python with Pillow (available in the desktop's bundled runtime):

```text
python frontend/scripts/generate-brand-assets.py
python frontend/scripts/generate-brand-assets.py --social --font C:/Windows/Fonts/seguisb.ttf
python frontend/scripts/generate-brand-assets.py --check
```

The generated binaries are committed; ordinary builds do not require Python/Pillow.

Social metadata uses `https://diyocean.com/social-preview.png`. The public origin was
verified against the existing local `OpenGym/DEPLOYMENT.md` and `OpenGym/compose.yaml`
(`ORIGIN: https://diyocean.com`, `RP_ID: diyocean.com`), not inferred from the upstream
project's domain. The image is a source/build asset until a separately approved
deployment. A different host or subpath installation must update both absolute image
tags in `frontend/index.html`; tests intentionally guard the current configured URL.

Local checks cannot prove OS launcher refreshes, installed-PWA icon updates or social
crawler cache refreshes. Those may require an app update/reinstall or a crawler rescrape
after deployment. No production request or deployment was used to change those caches.

After a normal production build, `node frontend/scripts/check-brand-build.mjs frontend/dist` (from the repository root) checks built HTML, icon and social-image
references. The existing worker discovers supported HTML-linked assets as before;
ICO and manifest-only icon caching were not added or changed in this phase.
