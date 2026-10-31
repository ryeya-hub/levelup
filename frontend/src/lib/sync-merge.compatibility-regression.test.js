import { describe, expect, it } from 'vitest'
import { mergeStates, stampChange, stampWorkout } from './sync-merge.js'

const clone = value => JSON.parse(JSON.stringify(value))
const base = () => ({
  unit: 'kg', _ts: 2000, restSec: 90, theme: 'dark', accent: 'orange',
  workouts: [{ id: 'w0', d: '2026-09-30', start: 1000, end: 2000,
    entries: [{ id: 'bench', sets: [{ w: 60, r: 5 }] }], note: '',
    _ts: 2000, _f: { entries: 2000, note: 2000 } }],
  routines: [], customEx: [], bodyweight: [], exWeights: {},
})
const merge = (a, b) => mergeStates(clone(a), clone(b))
function change(previous, at, edit) {
  const next = clone(previous)
  edit(next)
  if (next.workouts.length) stampWorkout(next.workouts[0], at)
  next._ts = stampChange(previous, next, at)
  return next
}
const removed = previous => change(previous, 100041, next => { next.workouts = [] })

describe('sync repair compatibility gates', () => {
  it('a recorded deletion beats an unchanged disconnected copy', () => {
    const original = base(), deletion = removed(original)
    expect(merge(original, deletion).workouts).toEqual([])
    expect(merge(deletion, original).workouts).toEqual([])
  })

  it('an explicit add-back remains visible after meeting the deletion again', () => {
    const original = base(), deletion = removed(original)
    const restored = change(deletion, 100060, next => { next.workouts = clone(original.workouts) })
    expect(restored.deleted.workouts.w0).toBe(-100060)
    expect(merge(restored, deletion).workouts).toEqual(restored.workouts)
    expect(merge(deletion, restored).workouts).toEqual(restored.workouts)
  })

  it('independent field edits survive without a deletion', () => {
    const original = base()
    const correction = change(original, 100030, next => { next.workouts[0].entries[0].sets[0].w = 20 })
    const note = change(original, 100052, next => { next.workouts[0].note = 'Controlled tempo' })
    const combined = merge(correction, note)
    expect(combined.workouts[0].entries[0].sets[0].w).toBe(20)
    expect(combined.workouts[0].note).toBe('Controlled tempo')
    expect(combined.workouts).toEqual(merge(note, correction).workouts)
    expect(merge(combined, correction).workouts).toEqual(combined.workouts)
    expect(combined.restSec).toBe(original.restSec)
    expect(combined.theme).toBe(original.theme)
    expect(combined.accent).toBe(original.accent)
  })

  it('converges with a genuine later note edit and existing field stamps', () => {
    const original = base()
    const correction = change(original, 100030, next => { next.workouts[0].entries[0].sets[0].w = 20 })
    const deletion = removed(original)
    const note = change(original, 100052, next => { next.workouts[0].note = 'Controlled tempo' })
    const left = merge(merge(correction, deletion), note)
    const right = merge(correction, merge(deletion, note))
    // Compare payload and bookkeeping: a matching immediate view alone is insufficient.
    expect(right.workouts).toEqual(left.workouts)
    expect(merge(merge(correction, note), deletion).workouts).toEqual(left.workouts)
    expect(right.deleted).toEqual(left.deleted)
  })

  it('converges for an already-saved legacy no-op, without replaying its stamper', () => {
    const original = base()
    delete original.workouts[0]._f
    const correction = change(original, 100030, next => { next.workouts[0].entries[0].sets[0].w = 20 })
    const deletion = removed(original)
    // Older installed clients have already emitted this record. A writer-only fix cannot repair it.
    const saved = clone(original)
    saved.workouts[0]._ts = saved._ts = 100052
    const left = merge(merge(correction, deletion), saved)
    expect(merge(correction, merge(deletion, saved)).workouts).toEqual(left.workouts)
  })
})
