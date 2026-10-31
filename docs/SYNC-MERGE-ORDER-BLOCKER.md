# Existing sync merge-order blocker

This is an isolated regression reproduction, not a synchronisation fix. Do not
merge this branch until a separately reviewed application-logic fix makes it pass.
No existing test or sync implementation has been changed.

## Evidence

PR #2's original frontend CI run failed with 6,583 passed and one failed:
https://github.com/ryeya-hub/levelup/actions/runs/41067068670/job/124101277264

The failing property is `watch, phone and server end up the same whichever two
meet first` in `src/lib/sync-merge.property.test.js`.

- Seed: `-429497304`
- Shrink path: `54:1:1:5:3:3:3:7`
- Counterexample: A fixes workout `w0` to 20 kg; B deletes `w0`; C saves its
  original 60 kg value. Stamps are respectively 100030, 100041 and 100052.

Replaying the exact seed/path against both the unchanged upstream baseline
`b6cfe2bbd3f099523ffbf2677438864e9a09a06f` and Phase 2
`da1341ed2a169b73a239fafde41ec465d8b27c77` fails identically. The original property
and sync implementation have identical Git blob IDs across those revisions.

## Why merge order matters

The correction records an `entries` field stamp. The later unchanged save advances
the workout timestamp without an `entries` field stamp. Merging A with B removes
the earlier correction entirely; merging the result with C restores 60 kg. Merging
B with C first retains C, and then merging A selects A's stamped 20 kg entries.
Thus `(A merge B) merge C` and `A merge (B merge C)` disagree. The accompanying
test also checks a real 65 kg edit as a control.

Random generation determines whether CI encounters this case. Once generated, the
failure is deterministic; a successful random rerun does not resolve the defect.
This predates the branding changes and is not a platform-specific assertion.

## Reproduce

From `frontend` on this branch after installing locked dependencies:

```text
npm ci --ignore-scripts --no-audit --no-fund
node node_modules/vitest/vitest.mjs run src/lib/sync-merge.order-regression.test.js --maxWorkers=1
```

The 60 kg case currently fails; the 65 kg control passes. A proper fix must retain
delete/edit/undo semantics, old-device compatibility and field-level convergence.
The original branding task prohibited changing sync algorithms to pass branding CI.
The owner subsequently authorised a separate, compatibility-preserving repair;
the investigation below records why the first local candidate is insufficient.
Do not skip the property, remove
the unchanged-save case from its generator, pin a passing seed, or retry until green.

## Repair investigation — 2026-10-31

The isolated repair branch starts at verified Phase 1 head
`d7c0ca2eede5e86e0f0267696f59ccffd2a4e604`, with PR #4's reproduction
cherry-picked as `eb1955b8e`. Phase 1 has not yet been merged: the existing main-push
Pages and Docker publishers require an approved temporary pause to avoid deployment.
Before a repair can merge, integrate the resulting main normally; do not rewrite
the published evidence branch.

### Existing precedence and intended compatibility gates

| Situation | Behaviour to preserve or establish |
| --- | --- |
| Edit, then later deletion | Deletion removes the record. |
| Explicit restoration after deletion | Add-back's negative tombstone permits the restored record. |
| Genuine edit after deletion | Existing contract permits the edited record to remain; a blanket delete-wins rule would break this. |
| Unchanged stale save | Saving alone must not manufacture a field edit or defeat deletion. Already-persisted coarse timestamps cannot reliably identify such saves. |
| Independent field edits | Preserve both fields where their histories permit; do not replace field merging with whole-record last-writer-wins. |
| Same-field edits | Later field edit wins; existing undo rules and documented tie behaviour still apply. |
| Repeated delivery | Must not change settled payload or produce fresh semantic edit stamps. |
| Legacy record without `_f` | Its `_ts` records only coarse history. Absence of `_f` does not prove an unchanged save. Do not invent per-field edit times. |

`stampWorkout` advances the record timestamp. `stampChange` invokes `stampEntry`,
which advances `_ts` even if no payload field changed, but only stamps changed
fields in `_f`. `mergeEntry` combines fields, keeps maximum stamps and a maximum
record timestamp; `_u` handles field undo precedence. `stampDeletions` stores only
a signed timestamp per ID. `mergeDeletions` retains the latest absolute stamp,
with add-back winning ties. `applyDeletions` physically filters records whose
record time is not later than a positive tombstone. It does not retain their
payload or field history. Later merges therefore cannot recover those values.

The store, session editor, import/restore/reset paths, server stamping counterpart
and legacy lifting were inspected. The ordinary session editor already skips an
unchanged save; persisted records and older writers still require compatibility.
The API maintains its own stamping implementation (`api/sync-stamps.js`); a writer
change alone would not establish convergence across versions.

### Additional deterministic failures

`src/lib/sync-merge.compatibility-regression.test.js` adds real assertions, not
expected-failure or skipped tests:

1. A 20 kg correction at 100030, deletion at 100041, and genuine note edit at
   100052 diverge even when the base record already has `_f` stamps. Deleting A
   first yields 60 kg plus the note; keeping C first and then merging A yields
   20 kg plus the same note, with different `entries` stamps.
2. An already-saved old-client record with `_ts = 100052` and no `_f` reproduces
   the original divergence without invoking any current stamping helper.

Passing controls cover deletion against an unchanged offline copy, explicit
add-back, independent field edits without deletion, repeated delivery and unrelated
theme/accent/rest preferences.

### Rejected local experiment

A small `stampEntry` experiment retained the previous record timestamp when no
payload field changed. It made the original generated 60/65 kg reproduction pass,
but the two compatibility failures above remained: **five passed, two failed**.
The experiment was removed completely. The committed production algorithm is
unchanged. Without the experiment, the two files report **four passed, three
failed**. Existing legacy, reset, restore, unit conversion, undo, sync and offline
controls separately report **186 passed** across 13 files.

### Stop condition and next design review

A writer-only correction cannot repair information already discarded by a merge,
nor distinguish a legacy genuine edit from a legacy unchanged save when both have
only a coarse `_ts`. Simply treating all unstamped fields as edited at `_ts`
would overwrite independent corrections. Always preferring deletion would discard
valid later edits and explicit restorations. Neither is an acceptable shortcut.

A complete solution needs a reviewed representation retaining sufficient competing
field/payload history across deletion (or an explicitly approved change to existing
merge semantics). This is broader than the tested local timestamp correction.
Before implementing it, specify how the server, older installed clients, backup
imports, tombstone caps, undo metadata, reset and unit conversion preserve or
translate that history. An additive JSON field alone does not prove compatibility:
old clients may ignore, overwrite or omit it while still merging with the old rules.

Per the owner's stop condition, no persisted representation, migration, API or
production algorithm was changed. The repair remains blocked pending that design
and rollout review. Do not merge this draft or Phase 2 while these gates fail.
