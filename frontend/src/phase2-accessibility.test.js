import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrast, mix, customAccentVars } from './lib/accent.js'

const css = readFileSync(resolve('src/index.css'), 'utf8')
const html = readFileSync(resolve('index.html'), 'utf8')
describe('Phase 2 scoped accessibility', () => {
  it('allows browser magnification and keeps the existing focus and reduced-motion rules', () => {
    const viewport = html.match(/name="viewport" content="([^"]+)"/)[1]
    expect(viewport).not.toMatch(/user-scalable=no|maximum-scale=1/)
    expect(viewport).toContain('viewport-fit=cover')
    expect(css).toContain(':focus-visible{outline:2.5px solid var(--acc)')
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
  })
  it('uses readable secondary text in the refined screens in both themes', () => {
    expect(css).toContain('--label-2:rgba(235,235,245,.78)')
    expect(css).toContain('--label-2:rgba(60,60,67,.82)')
    for (const background of ['#000000', '#1c1c1e']) {
      expect(contrast(mix(background, '#ebebf5', .78), background)).toBeGreaterThanOrEqual(4.5)
    }
    for (const background of ['#f2f2f7', '#ffffff']) {
      expect(contrast(mix(background, '#3c3c43', .82), background)).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('keeps small accent text readable while retaining selected accent fills', () => {
    expect(css).toContain('--text-acc:color-mix(in srgb,var(--acc) 60%,var(--label))')
    for (const theme of ['dark', 'light']) {
      const backgrounds = theme === 'dark' ? ['#000000', '#1c1c1e'] : ['#f2f2f7', '#ffffff']
      const label = theme === 'dark' ? '#ffffff' : '#000000'
      for (const source of ['#6857f2', '#30d158', '#0a84ff', '#ff9f0a', '#bf5af2', '#ff375f', '#ff453a', '#40c8e0', '#ffd60a', '#123abc', '#ffffff', '#000000']) {
        const accent = customAccentVars(source, theme)['--acc']
        const text = mix(accent, label, .4)
        for (const bg of backgrounds) {
          expect(contrast(text, bg), `${source} / ${theme}`).toBeGreaterThanOrEqual(4.5)
          expect(contrast(text, mix(bg, accent, .16)), `tinted ${source} / ${theme}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })
  it('keeps the existing yellow goal meaning readable on Light and Dark surfaces', () => {
    expect(css).toContain('--text-yellow:color-mix(in srgb,var(--yellow) 50%,var(--label))')
    for (const bg of ['#f2f2f7', '#ffffff']) {
      expect(contrast(mix('#ffcc00', '#000000', .5), bg)).toBeGreaterThanOrEqual(4.5)
    }
    for (const bg of ['#000000', '#1c1c1e']) {
      expect(contrast(mix('#ffd60a', '#ffffff', .5), bg)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
