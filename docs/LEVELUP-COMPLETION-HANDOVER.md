# LevelUp completion handover — 31 October 2026

Phase 1 is merged and verified. Sync repair is blocked by a demonstrated compatibility
problem requiring a broader history/rollout design. Phase 2 remains open under the
owner's explicit sync acceptance gate. No production deployment or APK publication
was initiated. This is a partial completion report, not a production-readiness claim.

## Repository and merge evidence

Authoritative source: `https://github.com/ryeya-hub/levelup.git`.
Work used isolated Windows worktrees under `C:/Users/W/Documents/ChatGPT/LevelUp!`.
The dirty `levelup` checkout with demo/seasonal experiments was not edited, stashed,
reset or cleaned. The deployment checkout at Desktop/Shards/OpenGym was not changed.
Nothing was pushed to original OpenGym. No history was force-pushed.

| Area | Status and evidence |
| --- | --- |
| Governance | Previously completed [PR #3](https://github.com/ryeya-hub/levelup/pull/3) remains intact. No CLA signature requested; historical CLA.md preserved. |
| Phase 1 | **Completed and verified**: [PR #1](https://github.com/ryeya-hub/levelup/pull/1), normal merge [3caee2c9f47044bed5b0f215653f72f448c9bde9](https://github.com/ryeya-hub/levelup/commit/3caee2c9f47044bed5b0f215653f72f448c9bde9). Parents: 627cbb545 and d7c0ca2ee. Merged tree exactly matches reviewed d7c0ca2ee. |
| Phase 1 CI | [Tests 41149829277](https://github.com/ryeya-hub/levelup/actions/runs/41149829277): frontend 6,571/6,571 and applicable API/MCP/build/integration checks passed; iOS gate passed in [41149829344](https://github.com/ryeya-hub/levelup/actions/runs/41149829344). Eight successful checks and five existing gated skips. |
| Sync reproduction | Original [draft #4](https://github.com/ryeya-hub/levelup/pull/4), head 47178969c2b0a452fa9e00f8f411d7092e0b76b0, preserved. Original [CI failure](https://github.com/ryeya-hub/levelup/actions/runs/41067068670/job/124101277264). |
| Sync repair | **Blocked**, [draft #5](https://github.com/ryeya-hub/levelup/pull/5), branch `fix/sync-merge-order-convergence`. No algorithm fix or persisted-format change committed. Reviewable evidence commit [617ea26a4](https://github.com/ryeya-hub/levelup/commit/617ea26a41e156963d0c12d45c95cb3777f54f5f); main integrated normally as b28d1862819245d6f0d09f835f0b5daa82833287. |
| Sync CI | [41153226473](https://github.com/ryeya-hub/levelup/actions/runs/41153226473): **6,575 passed, three failed** frontend; API and MCP passed. Failures exactly match the deterministic gates. No merge SHA. |
| Phase 2 | **Open / merge held**: [PR #2](https://github.com/ryeya-hub/levelup/pull/2), head 00dfd5b8b177fb17d7ba9a0cbd710353f7a8b40c. Phase 1 ancestry preserved; 42 incremental files. No sync fix exists to integrate, so no Phase 2 merge attempted. |
| Phase 2 CI | Existing [41149846381](https://github.com/ryeya-hub/levelup/actions/runs/41149846381): 6,584/6,584 frontend and 696/696 API passed. A random green run does not close the deterministic blocker. |

The owner explicitly approved temporarily disabling only Deploy demo to GitHub Pages
and Publish Docker images during the Phase 1 merge, to honour the no-deployment rule.
Both were restored immediately afterward. Pages retained zero runs; Docker retained
its one pre-existing manual run 41007778688. No publisher was manually started.
Test/security workflows and unrelated repository settings were not disabled or changed.
No branch protection/ruleset changes were needed. Future main merges can publish again;
use a separately authorised pause if merging without deployment remains required.

## Sync root cause, rejected candidate and compatibility

See [SYNC-MERGE-ORDER-BLOCKER.md](SYNC-MERGE-ORDER-BLOCKER.md) for precedence rules,
call-site analysis, exact seed/path and reproducible commands. Seed -429497304,
path 54:1:1:5:3:3:3:7 produces correction 20 kg at 100030, deletion at 100041,
unchanged save 60 kg at 100052. Intermediate deletion drops payload/field stamps;
a later merge then chooses 20 or 60 kg depending on grouping.

A minimal local experiment kept the old record timestamp on unchanged saves. It
passed the original 60/65 kg examples but failed both an already-persisted legacy
record and a genuine later note edit with existing `_f` stamps. It was fully removed.
The committed algorithm remains byte-identical to main/upstream for this repair.

Passing controls verify unchanged offline copies stay deleted, explicit restoration
works, independent edits merge without deletion, repeated delivery stays settled and
unrelated preferences remain intact. Existing legacy, reset, restore, unit conversion,
undo and offline suites passed. These controls **do not establish repair safety**:
the new convergence gates still fail for actual payload and relevant metadata.

Coarse legacy `_ts` cannot distinguish a genuine old-client edit from an unchanged
save. A complete fix needs retained competing history or an approved semantic change,
plus a server/old-client/backup/undo/reset/unit-conversion rollout design. No migration,
new metadata, database/API/storage key, backup format or account data was changed.
Per the owner's stop condition, that broader repair was **not attempted**. Additional
multi-seed soak testing and the full proposed compatibility matrix remain unverified;
there is no safe candidate to qualify yet. Do not clear user data as a workaround.

## Validation executed

Commands used PowerShell equivalents; logs are retained locally in sibling `cla-review/`.
Locked frontend install used `npm ci --ignore-scripts --no-audit --no-fund`, passed;
existing API dependencies had already been installed by the same command. No package
or lockfile changes. A restricted-runner EPERM prevented one initial test launch;
the normal permitted runner executed the actual tests below.

| Command/context | Actual result |
| --- | --- |
| Merged main: `cd frontend; npm run build` | Passed. Existing bundle/dynamic-import warnings retained. |
| Merged main: focused brand/theme/Settings/startup/CSP/Login suites | **125 passed, zero failed**, 13 files; `main-focused.log`. Verifies Light default, valid saved preferences, invalid fallback, System changes, accents and watchdog. |
| Investigation: deterministic order + compatibility files, `vitest run ... --maxWorkers=1` | **Four passed, three failed**, two files; `sync-compatibility-before.log`. |
| Rejected writer-only experiment, same command | **Five passed, two failed**; `sync-writer-only-experiment.log`. Experiment removed. |
| Investigation: existing merge/legacy/fuzz/stamps/restore/reset/unit/undo/offline suites | **186 passed**, 13 files; `sync-existing-compatibility.log`. |
| Investigation: `cd frontend; npm test -- --maxWorkers=4` | **6,553 passed, 25 failed**, 549 files / 6,578 tests; `frontend-current.log`. Not a passing suite. |
| API on unchanged Phase 2: `cd api; npm test` | **671 passed, 25 failed**, zero skipped, 696 tests; `api-current.log`. Same 25 failed subtest names as recorded baseline (previously 670 passed, one time-guard skip). |
| Phase 2: `cd frontend; npm run build` | Passed; `phase2-current-build.log`. |
| Phase 2: existing focused branding/Home/Stats/Login/onboarding/accent/theme/PWA/CSP/seasonal/accessibility command | **219 passed**, 30 files; `phase2-current-focused.log`. |
| Phase 2: `node scripts/check-brand-build.mjs` | Passed: 34 built HTML references, four manifest icons, social image. |
| Phase 2: bundled Python `scripts/generate-brand-assets.py --check` | Passed: seven image types/dimensions and maskable safe circle. |
| Phase 2: `node scripts/check-locales.mjs` | Passed: 19 packs, 2,590 keys each. |
| Phase 2: `node scripts/check-source-strings.mjs --strict` | Passed: 2,126 translated strings covered. |
| Final protected-file and whitespace audit | No production-code changes in repair; `git diff --check` passed. |

The full local frontend result contains the existing 21 Windows/path/date failures,
three deterministic sync gates, and one additional unchanged `sw-media.test.js` LRU
assertion. That cache assertion also failed in an isolated run, then passed 10/10 on
an unchanged repeat; Phase 2's identical test/worker passed 10/10. It uses fixed
event-loop settling waits. Treat this as an observed timing-sensitive failure,
not as a repaired or silently ignored test. Both source blob IDs match main; no
service-worker change was made. Linux draft CI had exactly the three sync failures.

Exact focused commands and individual Phase 1/2 changed-file inventories also remain
in [PHASE1-REPORT.md](PHASE1-REPORT.md) and Phase 2's
[PHASE2-REPORT.md](https://github.com/ryeya-hub/levelup/blob/feat/levelup-phase2-polish/docs/PHASE2-REPORT.md).

## Branding, PWA and interface status

Phase 1 main has LevelUp identity, approved indigo default through the existing custom
accent preference, compact Login icon, `LevelUp!`, left-to-right loading sequence and
Light default. Saved accents and Light/Dark/System choices are preserved by tests;
the tree is identical to the reviewed branch. No preference migration was introduced.

Phase 2 assets and scoped polish already exist and passed refreshed automated checks.
Its manifest preserves routing/scope/display/orientation and existing icon filenames;
separate maskable asset remains correctly declared. Social image is 1200×630.
The configured social origin and static-PWA limitations are documented in
[PHASE2-ASSETS.md](https://github.com/ryeya-hub/levelup/blob/feat/levelup-phase2-polish/docs/PHASE2-ASSETS.md).

Existing Phase 2 evidence includes 47 layout checks, 19 before/after screenshots,
320/375/390/768/1024/1440 widths, Light/Dark, German wrapping and Arabic RTL.
See its [responsive evidence](https://github.com/ryeya-hub/levelup/blob/feat/levelup-phase2-polish/docs/phase2/responsive-checks.json)
and [screenshots](https://github.com/ryeya-hub/levelup/tree/feat/levelup-phase2-polish/docs/phase2/screenshots).
This turn refreshed the populated demo Home render and automated UI/theme/asset checks;
it did not repeat every screenshot. Seasonal implementation/preferences remain unchanged.

**Awaiting external validation:** physical-device PWA icon/update refresh, installed
offline reopening after update, real passkey login, native integrations, assistive-device
review and actual 200% browser zoom. Automated offline/cache tests and static asset
checks are partial evidence only. No caching behaviour was changed to force an update.

Local preview verified through the in-app browser:
[http://127.0.0.1:5182/#/home](http://127.0.0.1:5182/#/home).
This is the seeded browser-only Phase 2 demo, no account needed; it is not a deployed
or authenticated production instance and contains no sync repair. Previously started
normal/mobile previews remain separate; no new public preview was deployed.

## Files changed by this investigation

- `frontend/src/lib/sync-merge.order-regression.test.js`: PR #4's reproduction/control,
  cherry-picked without changing its assertions.
- `frontend/src/lib/sync-merge.compatibility-regression.test.js`: persisted legacy,
  modern field-stamp and deletion/restoration controls; two failing convergence gates.
- `docs/SYNC-MERGE-ORDER-BLOCKER.md`: semantics, rejected experiment, compatibility stop.
- `docs/LEVELUP-COMPLETION-HANDOVER.md`: this evidence and remaining work.

No sync implementation, API, authentication, workout/progression/PR calculations,
user-facing actions, storage identifiers, backup/import contract, service worker,
native update source, dependency or seasonal behaviour was changed by this investigation.
LICENSE, NOTICE.md, upstream attribution, historical CLA.md and third-party asset
notices remain intact. Original exercise media was not regenerated or relicensed.
Future local author attribution still needs the owner to verify the configured commit
email or choose a verified/no-reply address; no original commits were rewritten.

## Remaining actions by severity

1. **High — data integrity:** review and approve a compatible retained-history design
   and cross-version rollout, implement it separately in #5, then pass deterministic,
   legacy/offline/undo/import/reset/unit and multiple-seed tests plus full CI.
2. **High — merge gate:** keep #2 and #5 unmerged. After safe sync repair merges,
   normally merge main into #2, verify preservation and rerun its acceptance checks.
3. **Medium — release validation:** complete installed-PWA/offline update, physical
   device, 200% zoom and assistive-device checks; investigate the cache-test timing.
4. **Low — local tooling:** retain documented Windows baseline failures; Linux CI
   remains authoritative supplemental evidence, not permission to dismiss new failures.

No production deployment, release publication or Android APK build/publication occurred.
