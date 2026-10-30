// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('../lib/api.js', () => ({ api: vi.fn() }))
vi.mock('./useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn() }) } }))
import { freshState, DEF, restoredStateFor, useStore } from './useStore.js'
import { resolveTheme } from '../lib/theme.js'
import { BRAND } from '../brand.js'
import { accentValue, customAccentVars } from '../lib/accent.js'

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals() })
describe('theme preference compatibility', () => {
  it('uses brand indigo for new profiles through the existing custom-accent setting', () => {
    const state = freshState()
    expect(accentValue(state)).toBe(BRAND.primary.toLowerCase())
    for (const theme of ['light', 'dark']) {
      expect(customAccentVars(accentValue(state), theme)['--acc']).toBe(BRAND.primary.toLowerCase())
    }
  })
  it('retains saved Green and custom accent preferences', () => {
    for (const preference of [{ accent: 'lime' }, { accent: 'custom', accentCustom: '#123abc' }]) {
      const saved = { ...freshState(), ...preference }
      expect(restoredStateFor(freshState(), saved)).toEqual(saved)
    }
  })
  it('fresh profiles and missing remote preferences default to Light', () => {
    expect(DEF.theme).toBe('light')
    expect(freshState().theme).toBe('light')
    const restored = restoredStateFor(freshState(), { routines: [], workouts: [] })
    expect(restored.theme).toBe('light')
  })
  it.each(['dark', 'light', 'system'])('keeps the synced %s preference and other settings', theme => {
    const remote = { ...freshState(), theme, accent: 'violet', unit: 'lb', sound: false, lang: 'ar' }
    expect(restoredStateFor(freshState(), remote)).toEqual(remote)
  })
  it('invalid values display Light without rewriting the synced preference', () => {
    const remote = { ...freshState(), theme: 'invalid' }
    const restored = restoredStateFor(freshState(), remote)
    expect(restored.theme).toBe('invalid')
    expect(resolveTheme(restored.theme)).toBe('light')
  })
  it('persists theme changes and reloads them without changing unrelated settings', async () => {
    const state = { ...freshState(), accent: 'violet', unit: 'lb', lang: 'ar', sound: false }
    useStore.setState({ S: state, user: null })
    for (const theme of ['dark', 'light', 'system']) {
      useStore.getState().update(s => { s.theme = theme })
      const saved = JSON.parse(localStorage.getItem('gym_state_v1'))
      expect(saved).toMatchObject({ theme, accent: 'violet', unit: 'lb', lang: 'ar', sound: false })
      // A new module instance runs the real loadState() path used by a reload.
      vi.resetModules()
      const { useStore: reloaded } = await import('./useStore.js')
      expect(reloaded.getState().S).toMatchObject({ theme, accent: 'violet', unit: 'lb', lang: 'ar', sound: false })
    }
  })
})
