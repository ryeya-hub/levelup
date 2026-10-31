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
The current task explicitly prohibits changing sync algorithms to pass branding CI,
so that fix remains a separate review dependency. Do not skip the property, remove
the unchanged-save case from its generator, pin a passing seed, or retry until green.
