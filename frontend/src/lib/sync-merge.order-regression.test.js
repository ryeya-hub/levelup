import { describe, expect, it } from 'vitest'
import { mergeStates, stampChange, stampWorkout } from './sync-merge.js'

const clone = value => JSON.parse(JSON.stringify(value))
const base = () => ({
  unit: 'kg', workouts: [{ id: 'w0', d: '2026-09-30', start: 1000, end: 2000,
    entries: [{ id: 'bench', sets: [{ w: 60, r: 5 }] }] }],
  routines: [{ id: 'r0', name: 'Push', ex: [{ id: 'bench', sets: 3 }] }],
  customEx: [], bodyweight: [{ d: '2026-09-30', w: 80, t: 1 }], week: {}, dayPlan: {},
  queue: null, restSec: 90, exNotes: {}, favEx: [], gymCards: [], equipProfiles: [],
  exWeights: {}, barWeights: {}, _ts: 10,
})
const merge = (a, b) => mergeStates(clone(a), clone(b))
const visibleWorkouts = state => state.workouts.map(({ id, entries }) => ({ id, entries }))

function changed(weight, at) {
  const previous = base(), next = clone(previous)
  next.workouts[0].entries[0].sets[0].w = weight
  stampWorkout(next.workouts[0], at)
  next._ts = stampChange(previous, next, at)
  return next
}

describe('workout correction, deletion and later save on three copies', () => {
  it.each([60, 65])('converges when the last copy saves %s kg', weight => {
    // CI seed -429497304 shrank to a 20 kg correction, delete, then a 60 kg save.
    const A = changed(20, 100030)
    const previous = base(), B = clone(previous)
    B.workouts = []
    B._ts = stampChange(previous, B, 100041)
    const C = changed(weight, 100052)
    const left = visibleWorkouts(merge(merge(A, B), C))
    expect(visibleWorkouts(merge(A, merge(B, C)))).toEqual(left)
    expect(visibleWorkouts(merge(merge(C, A), B))).toEqual(left)
  })
})
