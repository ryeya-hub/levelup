// @vitest-environment happy-dom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveTheme, themePreference } from './theme.js'

afterEach(() => vi.unstubAllGlobals())
describe('theme resolution and pre-React startup', () => {
  const html = readFileSync(resolve('index.html'), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  const startup = (raw, osDark, blocked = false) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const setItem = vi.fn()
    const events = {}, timers = []
    const win = { matchMedia: () => ({ matches: osDark }), addEventListener: (name, fn) => { events[name] = fn } }
    runInNewContext(script, { document: doc, window: win,
      localStorage: { getItem: () => { if (blocked) throw Error('denied'); return raw }, setItem },
      navigator: { language: 'en', userAgent: 'test' }, setTimeout: fn => timers.push(fn), location: { reload: vi.fn() } })
    return { doc, setItem, events, timers }
  }
  it.each([
    [null, false, 'light'], [null, true, 'light'], ['{}', true, 'light'],
    ['{"theme":"invalid"}', true, 'light'], ['{"theme":null}', true, 'light'],
    ['{"theme":"dark"}', false, 'dark'], ['{"theme":"light"}', true, 'light'],
    ['{"theme":"system"}', false, 'light'], ['{"theme":"system"}', true, 'dark'],
    ['broken JSON', true, 'light'], ['null', true, 'light'],
  ])('startup %s / OS dark %s resolves to %s without writing', (raw, osDark, effective) => {
    const { doc, setItem } = startup(raw, osDark)
    expect(doc.documentElement.dataset.theme).toBe(effective)
    expect(doc.querySelector('meta[name="theme-color"]').content).toBe(effective === 'dark' ? '#000000' : '#f2f2f7')
    expect(setItem).not.toHaveBeenCalled()
  })
  it('defaults to Light when storage is unavailable', () => {
    expect(startup(null, true, true).doc.documentElement.dataset.theme).toBe('light')
  })
  it('keeps RTL startup and watchdog recovery functional', () => {
    const { doc, timers } = startup('{"theme":"dark","lang":"ar"}', false)
    expect(doc.documentElement.dir).toBe('rtl')
    timers[0]()
    expect(doc.querySelector('#boot').getAttribute('role')).toBe('alert')
    expect(doc.querySelector('#boot .h').textContent).toBe('LevelUp is taking too long to start.')
    expect(doc.querySelector('#boot button').textContent).toBe('Reload')
  })
  it('keeps script load errors actionable', () => {
    const { doc, events } = startup(null, false)
    events.error({ target: { tagName: 'SCRIPT', src: '/missing.js' } })
    expect(doc.querySelector('#boot .h').textContent).toBe('LevelUp could not start on this browser.')
    expect(doc.querySelector('#boot code').textContent).toContain('/missing.js')
  })
  it('only System follows OS appearance; missing and invalid values display Light', () => {
    let dark = true
    vi.stubGlobal('matchMedia', () => ({ matches: dark }))
    expect(resolveTheme('system')).toBe('dark')
    dark = false
    expect(resolveTheme('system')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
    dark = true
    for (const value of ['light', null, undefined, '', 'invalid', 42]) {
      expect(themePreference(value)).toBe('light')
      expect(resolveTheme(value)).toBe('light')
    }
  })
})
