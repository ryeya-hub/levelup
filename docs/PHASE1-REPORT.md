# LevelUp Phase 1 implementation report

Implemented locally on **30 October 2026 (Australia/Sydney)**. Nothing was pushed,
merged or deployed; production infrastructure was not modified.

## Repository and commits

- Origin: `https://github.com/ryeya-hub/levelup.git`
- Branch: `feat/levelup-phase1-brand`
- Baseline: `b6cfe2bbd3f099523ffbf2677438864e9a09a06f` (`main`).
- Foundation commit: `c1f6de53d` — identity, original SVGs, language and translations.
- Implementation commit: `0573a3e896dfe8561a7a8d23171ef0ebce8682c8` — screen wiring, metadata, Light default and regression tests.
- This report and screenshots are a subsequent documentation commit; the final chat
  reports its SHA.
- Working checkout: `C:\Users\W\Documents\ChatGPT\LevelUp!\levelup`.

The preferred checkout was found at `C:\Users\W\Desktop\Shards\OpenGym\source`.
It was copied, including Git history, into the writable workspace. The copied tree
was clean before creating the feature branch. No unrelated changes were overwritten;
the original checkout and surrounding deployment files were left untouched. No
additional project AGENTS.md files were found.

## Requirements 1–35

“Completed” includes a review resulting in no change where the request says “where
appropriate.” Exceptions are explicit below.

| # | Status | Implementation / exception |
|---|---|---|
| 1 | Completed | Small static `frontend/src/brand.js` module. |
| 2 | Completed | Display name LevelUp. |
| 3 | Completed | Approved tagline in identity and README; no extra UI added. |
| 4 | Completed | Approved description in identity, About, HTML and manifest. |
| 5 | Completed | Concise brand-language guidance in `BRAND.md`. |
| 6 | Completed | README introduction and hero; upstream credit, links and licensing preserved. |
| 7 | Completed | Original horizontal ascending-steps SVG wordmark. |
| 8 | Completed | Dark-background wordmark. |
| 9 | Completed | Compact standalone symbol, also used during React loading. |
| 10 | Completed | Monochrome `currentColor` SVG for inline use. |
| 11 | Completed | Brand-image alternative text is LevelUp; decorative boot screen remains hidden from assistive technology until an error. |
| 12 | Completed | Login uses the wordmark. |
| 13 | Completed | Welcome to LevelUp. |
| 14 | Completed | Your training. Your progress. |
| 15 | Completed | Momentum copy in the existing secondary footer; account/passkey explanation retained. |
| 16 | Completed | Your progress starts here. |
| 17 | Completed | Approved introductory supporting text. |
| 18 | Completed | Existing onboarding brand location uses the wordmark. |
| 19 | Completed | Onboarding/footer branding updated; permissions, privacy explanations and handlers retained. |
| 20 | Completed | Home guest heading displays LevelUp; personalised greeting retained. |
| 21 | Completed | Existing first-use heading uses Your training, at a glance. |
| 22 | Completed | Existing first-use supporting text uses the approved consistency copy. |
| 23 | Partly completed / partly skipped | First-use wording improved. Home has no separate rest-day explanation slot: its rest-day label, next-session information and controls remain accurate and unchanged. No new UI was added for extra rest-day prose. |
| 24 | Completed | Stats page introduction is Your progress. |
| 25 | Completed | Existing recent-workout list heading is Recent activity. |
| 26 | Completed | Plan introduction is Your training plan. |
| 27 | Skipped | Existing subtitle explains fixed-week versus rotation mode. Replacing it would remove useful information; no extra subtitle was added. |
| 28 | Completed | Existing empty-plan explanations use Start by creating your first routine. |
| 29 | Completed | Existing Stats subtitle uses See how your effort adds up. |
| 30 | Completed (reviewed) | Personal records, exercise-history and History labels already describe their data accurately; no calculation or label change needed. |
| 31 | Completed | Existing About page heading and Settings entry are About LevelUp. |
| 32 | Completed | Approved description in the existing About section. |
| 33 | Completed | Branding-only core references updated; legal/upstream destination references retained. |
| 34 | Completed | HTML title, description, Apple title and watchdog errors updated. |
| 35 | Completed | Manifest name/short name updated; start URL, scope, display, orientation and icon references preserved. |

## Mandatory Light default

**Confirmed.** `DEF.theme` is now `light`. Dark, Light and System stay in
Settings → Look & Home → Theme with the same component and handler. Valid saved
preferences remain intact. Missing/invalid values resolve to Light for display;
invalid saved values are not migrated or rewritten. No profile, storage-key or
sync-format migration was introduced.

The pre-React HTML script resolves `gym_state_v1.theme` before paint. Explicit Dark
uses the existing dark surface; System resolves the OS setting. Storage errors,
malformed JSON and absent/invalid values fall back to Light. Boot and watchdog
colours follow that effective choice. App retains its live System listener and
native system-bar calls. Startup script tests also exercise Arabic direction,
script-load failures, timeouts and recovery controls.

The browser's default theme colour and fixed manifest colours are `#f2f2f7`, the
existing Light surface. A static manifest cannot reflect each installed user's
theme. Runtime browser metadata still tracks the effective theme. Native app IDs,
splash timing and native resources were not changed. Existing PWA icons are retained
for Phase 2. Brand indigo is confined to artwork/startup branding; accents and
semantic colour tokens were not replaced.

## Automated verification

Node `v22.13.1`, npm `10.9.2`, Windows. Commands ran from the checkout root unless
otherwise stated. `--prefix` is equivalent to entering that package directory first.
Locked dependencies were installed with `npm ci --ignore-scripts --no-audit --no-fund`
in frontend, api and mcp. No package manifests, lockfiles or dependency versions changed.

| Exact command | Baseline | Final |
|---|---|---|
| `npm test --prefix frontend` | 6,516 passed, 22 failed; 535/543 files passed | 6,546 passed, 21 failed; 540/547 files passed |
| `npm run build --prefix frontend` | Passed | Passed |
| `npm test --prefix api` | 671 passed, 25 failed; 696 tests | Same: 671 passed, 25 failed |
| `npm test --prefix mcp` | 127 passed, 1 failed; 3 watcher errors | Same: 127 passed, 1 failed; 3 watcher errors |
| `node frontend/scripts/check-locales.mjs` | Not separately run before edits | Passed: 19 packs, 2,590 keys each |
| `node frontend/scripts/check-source-strings.mjs --strict` | Not separately run before edits | Passed: all 2,127 detected source strings covered |
| `git diff --check` | Clean | Passed |

Final focused command, run from `frontend`:

```text
node node_modules/vitest/vitest.mjs run src/brand.test.js src/lib/theme.test.js src/store/useStore.theme.test.jsx src/App.theme.test.jsx src/views/Settings.themes.test.jsx src/views/settings-pages.test.jsx src/lib/pt-br-locale.test.js src/lib/csp.test.js src/lib/boot-watchdog.test.js src/views/Login.password.test.jsx src/views/Settings.reset.test.jsx src/views/Settings.health.test.jsx src/views/Settings.sound.test.jsx --maxWorkers=4
```

**121 passed, 0 failed, 13 files passed.** There are 29 new tests in the full suite.
They cover fresh/default preferences, saved choices, invalid values, Settings
selection, real store writes and reloads, unchanged companion settings, live OS
changes, pre-React appearance, metadata parity and locale coverage.

The final frontend failure names are a subset of the baseline failures. The baseline
backup-media timeout passed in the final run; this is not claimed as a code fix.
Remaining failures involve existing Windows path/Unix-shell checks and date-sensitive
bodyweight/health-read assertions. Backend failures include existing Coach jobs,
file-permission and admin-socket tests. MCP retains its permission-test failure and
three `EPERM` watcher errors. Backend failure names match the baseline. None was
silently skipped or patched to conceal a failure. **The full suites are not green.**

Initial restricted-environment attempts failed on temporary-file renames before a
usable baseline; installation and tests were retried with normal access. The table
uses the completed comparable runs. The build retains its existing warning that
`scan-web.js` is imported both statically and dynamically.

Full local logs (ignored generated files):
[frontend baseline](../verification/baseline-frontend.log),
[frontend final](../verification/final-frontend.log),
[backend baseline](../verification/baseline-api.log),
[backend final](../verification/final-api.log),
[MCP baseline](../verification/baseline-mcp.log),
[MCP final](../verification/final-mcp.log),
[focused checks](../verification/focused.log),
[build](../verification/final-build.log).

## Browser regression checks and screenshots

Checked against disposable local browser profiles, never production user data:

- Fresh Login and mobile-flavour onboarding render in Light with the new assets/copy.
- Guest entry, Home/Plan/Stats/Settings/About navigation works.
- Dark selection survives reload. System remains selectable. Light selection and
  the existing Purple accent both survive reload; Green remains the initial accent.
- Created “Phase 1 smoke test”, edited its name, added Air Squat, logged all three
  sets, used the rest-timer Skip control, completed the workout and reloaded Stats.
  The saved workout, three sets, exercise progress and Recent activity entry remain.
- Exercise picker closes with Escape. Existing buttons and labels remain available
  in the accessibility tree, including the theme selector and brand alternative text.
- Arabic switches the document to `lang=ar`, `dir=rtl`; translated Settings/Home and
  the saved workout still render. Automated checks cover every locale pack and the
  derived Swiss German behaviour through existing tests.
- Local guest data loaded and saved while the API was unavailable. This checks local
  persistence, not a complete production service-worker offline/install test.

| View | Before | After |
|---|---|---|
| Login | [Dark baseline](phase1/screenshots/before-login.jpg) | [LevelUp / Light](phase1/screenshots/after-login.jpg) |
| Home | [Baseline](phase1/screenshots/before-home.jpg) | [LevelUp / Light](phase1/screenshots/after-home.jpg) |
| Plan | [Baseline](phase1/screenshots/before-plan.jpg) | [LevelUp / Light](phase1/screenshots/after-plan.jpg) |
| Progress (`Stats.jsx`) | [Baseline](phase1/screenshots/before-progress.jpg) | [Your progress](phase1/screenshots/after-progress.jpg) |
| Settings | [Baseline](phase1/screenshots/before-settings.jpg) | [LevelUp / Light](phase1/screenshots/after-settings.jpg) |
| About (within Settings) | [Baseline](phase1/screenshots/before-about.jpg) | [About LevelUp](phase1/screenshots/after-about.jpg) |
| Mobile onboarding | [Baseline](phase1/screenshots/before-onboarding.jpg) | [LevelUp / Light](phase1/screenshots/after-onboarding.jpg) |

Additional evidence: [Dark after reload](phase1/screenshots/after-theme-dark.jpg),
[Light with saved Purple accent](phase1/screenshots/after-theme-light-purple.jpg),
[Arabic / RTL Home](phase1/screenshots/after-home-arabic.jpg).

Captures use the browser's available desktop viewport and differ in dimensions.
An attempted phone viewport override did not produce reliable mobile screenshots;
device-size visual QA remains outstanding. Mobile onboarding here is the Vite mobile
flavour in a browser, not a native-device run. Existing seasonal artwork remains
visible because the test date is in its normal October window.

Not manually completed: authenticated login/logout with a real passkey/profile,
device pairing, native permission prompts, native system bars/splash, a positive
weighted personal-record flow, full network-off service-worker saving/loading, actual
PWA installation, exhaustive keyboard/screen-reader testing or every language/device.
Existing applicable automated suites were run; these limits are not represented as
manual passes.

## Files changed and purpose

| Files | Reason |
|---|---|
| `frontend/src/brand.js` | Static approved identity. |
| `frontend/src/assets/brand/levelup-wordmark.svg`, `levelup-wordmark-dark.svg`, `levelup-symbol.svg`, `levelup-wordmark-mono.svg` | Original vector assets, no competitor/licensed-media reuse. |
| `frontend/src/components/BrandLogo.jsx` | Reuse the light/dark wordmark with accessible names. |
| `frontend/src/index.css` | Only wordmark sizing and theme-specific asset visibility. |
| `frontend/src/views/Login.jsx` | Logo, heading, support/introductory branding; handlers unchanged. |
| `frontend/src/views/MobileOnboarding.jsx` | Existing introductory asset/copy; flow unchanged. |
| `frontend/src/views/PermissionSteps.jsx` | Product name in existing permission explanations only. |
| `frontend/src/views/Home.jsx` | Guest product heading and existing first-use copy. |
| `frontend/src/views/Plan.jsx` | Existing heading, empty state and branding in explanatory prose. |
| `frontend/src/views/Stats.jsx` | Existing introduction and recent-activity heading. |
| `frontend/src/views/Settings.jsx` | Display branding, About description/credit/source link and theme fallbacks. |
| `frontend/src/views/settings-pages.js` | Existing About page title; IDs/routes unchanged. |
| `frontend/src/store/useStore.js` | One-line default: dark → light. Nothing else in the store changed. |
| `frontend/src/lib/theme.js` | Shared, non-persisting display fallback/resolution. |
| `frontend/src/App.jsx` | Use the resolver and compact loading symbol; OS listener/native calls unchanged. |
| `frontend/index.html` | Consistent metadata, pre-paint theme, boot asset/colours and branded errors. |
| `frontend/public/manifest.json` | Display metadata and fixed Light colours; compatibility fields/icons retained. |
| `web/Dockerfile` | Only the existing inline-script CSP hash changed, to match the edited HTML. |
| `frontend/src/locales/{ar,bn,de,es,fr,hi,hu,it,ko,pl,pt-BR,pt,ru,sv,th,tr,uk,zh-TW,zh}.js` | Corresponding new copy and branding translations in every existing pack. |
| `frontend/src/lib/pt-br-locale.test.js` | Reviewed inheritance fingerprint after brand-name key/value updates; Brazilian copy remains explicit overrides. |
| `frontend/src/brand.test.js`, `frontend/src/lib/theme.test.js`, `frontend/src/store/useStore.theme.test.jsx`, `frontend/src/App.theme.test.jsx` | Metadata/locales, startup resolution, store reload and live OS-change coverage. |
| `frontend/src/views/Settings.themes.test.jsx` | Existing selector: missing/invalid defaults and all choices with unrelated settings preserved. |
| `frontend/src/lib/boot-watchdog.test.js` | Expected error product name only. |
| `frontend/src/views/Login.password.test.jsx` | Expected product name only. |
| `frontend/src/views/Settings.health.test.jsx`, `Settings.sound.test.jsx` | Expected product name in explanations only. |
| `frontend/src/views/Settings.reset.test.jsx` | Expected fork source-code link. |
| `frontend/src/views/settings-pages.test.jsx` | Expected About title. |
| `README.md`, `docs/BRAND.md` | Product introduction, copy guidance, compatibility and attribution boundaries. |
| `.gitignore` | Ignore local verification logs and disposable scripts. |
| `docs/PHASE1-REPORT.md`, `docs/phase1/screenshots/*.jpg` | Reviewable report and before/after evidence. |

## Contract and legal audit

Confirmed by reviewing the final diff: **no backend APIs, database schemas,
authentication logic, workout/progression/PR calculations, sync algorithms/contracts,
persisted keys/data types, navigation/action handlers, backup formats, service-worker
behaviour, payment/subscription/telemetry logic or dependencies were changed.** The
only stored-state implementation edit is the required default theme value. Existing
accent and accessibility controls remain in place. No new network integrations or
features were added. Small SVGs use the existing Vite asset-import pipeline.

Upstream names intentionally remain in legal attribution, historical documentation,
native assets/app IDs, storage/protocol/format identifiers, diagnostic copy and
upstream download/update/store/donation destinations. Unused legacy locale entries
are also retained. Support openGym still supports the upstream author; an upstream
APK is still labelled openGym. The About source link now points to the LevelUp fork.
See [BRAND.md](BRAND.md) for the boundary.

LICENSE and NOTICE.md are unchanged. openGym copyright/AGPL credit and the exact Gym
visual attribution remain in About. The original exercise media was not changed or
used to generate the new artwork. NOTICE.md permits a non-commercial fork to keep
unmodified 180 px media with its notice; a commercial fork needs its own licence.
No commercial distribution approval is implied by this implementation.

## Remaining risks and Phase 2 follow-ups

1. Rerun the full suites on the repository's Linux CI environment and resolve the
   pre-existing failures before treating the release as fully green.
2. Run device/installed-PWA checks for first paint, offline operation, passkeys,
   native permissions, responsive layouts and screen-reader/keyboard interaction.
3. New translations have full key/placeholder coverage but still need native-speaker
   editorial review. No supported locale was removed. Existing Light secondary-text
   contrast was preserved; a broader accessibility review remains useful.
4. Phase 2 can regenerate the PWA/native icon pack and address broader branding or
   layout refinements separately. Do not redirect upstream downloads or donation
   controls without a separate decision and suitable LevelUp release destinations.
5. Confirm exercise-media licensing for the intended distribution model before any
   commercial release. No deployment, push or merge was performed.
