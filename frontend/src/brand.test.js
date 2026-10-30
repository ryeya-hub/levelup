// @vitest-environment happy-dom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BRAND } from './brand.js'

describe('static brand metadata', () => {
  const html = readFileSync(resolve('index.html'), 'utf8')
  const manifest = JSON.parse(readFileSync(resolve('public/manifest.json'), 'utf8'))
  it('keeps the HTML and manifest consistent with the brand module', () => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect(doc.title).toBe(BRAND.title)
    expect(doc.querySelector('meta[name="description"]').content).toBe(BRAND.description)
    expect(doc.querySelector('meta[name="apple-mobile-web-app-title"]').content).toBe(BRAND.name)
    expect(manifest.name).toBe(BRAND.title)
    expect(manifest.short_name).toBe(BRAND.name)
    expect(manifest.description).toBe(BRAND.description)
    expect(manifest.theme_color).toBe('#f2f2f7')
    expect(manifest.background_color).toBe('#f2f2f7')
  })
  it('translates the new brand copy in every existing locale', () => {
    const packs = import.meta.glob('./locales/*.js', { eager: true, import: 'default' })
    const keys = [BRAND.motivation, BRAND.description, 'Welcome to LevelUp', 'Your progress starts here',
      'Plan your training, record every session, and watch your progress build.',
      'Build momentum, one session at a time.', 'Your training, at a glance', 'Stay consistent. See your progress.',
      'Your training plan', 'Start by creating your first routine.', 'Your progress',
      'See how your effort adds up.', 'Recent activity', 'About LevelUp']
    for (const [file, pack] of Object.entries(packs)) {
      for (const key of keys) expect(pack[key], `${file}: ${key}`).toBeTruthy()
    }
  })
})
