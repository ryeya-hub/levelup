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
    expect(doc.querySelector('link[rel="manifest"]').getAttribute('href')).toBe('manifest.json')
    expect(doc.querySelector('link[rel="manifest"]').getAttribute('crossorigin')).toBe('use-credentials')
    expect(doc.querySelector('link[rel="apple-touch-icon"]').getAttribute('href')).toBe('icon-180.png')
    expect(doc.querySelector('link[rel="icon"][type="image/png"]').getAttribute('href')).toBe('icon-180.png')
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
  it('keeps social metadata consistent with the brand and production domain', () => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    for (const [selector, content] of [
      ['meta[property="og:title"]', BRAND.title],
      ['meta[property="og:description"]', BRAND.description],
      ['meta[property="og:type"]', 'website'],
      ['meta[property="og:url"]', 'https://diyocean.com/'],
      ['meta[property="og:image"]', 'https://diyocean.com/social-preview.png'],
      ['meta[property="og:image:width"]', '1200'],
      ['meta[property="og:image:height"]', '630'],
      ['meta[name="twitter:card"]', 'summary_large_image'],
      ['meta[name="twitter:title"]', BRAND.title],
      ['meta[name="twitter:description"]', BRAND.description],
      ['meta[name="twitter:image"]', 'https://diyocean.com/social-preview.png'],
    ]) expect(doc.querySelector(selector)?.content, selector).toBe(content)
  })
  it('ships the referenced SVG and multi-size ICO browser favicons', () => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect(doc.querySelector('link[rel="icon"][type="image/svg+xml"]').getAttribute('href')).toBe('favicon.svg')
    expect(doc.querySelector('link[rel="icon"][type="image/x-icon"]').getAttribute('href')).toBe('favicon.ico')
    const svg = new DOMParser().parseFromString(readFileSync(resolve('public/favicon.svg'), 'utf8'), 'image/svg+xml')
    expect(svg.querySelector('svg').getAttribute('viewBox')).toBe('0 0 64 64')
    expect(svg.querySelector('svg').getAttribute('aria-label')).toBe(BRAND.name)
    const ico = readFileSync(resolve('public/favicon.ico'))
    expect([...ico.subarray(0, 4)]).toEqual([0, 0, 1, 0])
    expect(ico.readUInt16LE(4)).toBe(3)
    for (let i = 0; i < 3; i++) {
      const offset = 6 + i * 16
      expect([ico[offset], ico[offset + 1]]).toEqual([16 * (i + 1), 16 * (i + 1)])
      expect(ico.readUInt32LE(offset + 12) + ico.readUInt32LE(offset + 8)).toBeLessThanOrEqual(ico.length)
    }
  })
  it('ships a 1200 by 630 PNG sharing image', () => {
    const png = readFileSync(resolve('public/social-preview.png'))
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(png.subarray(12, 16).toString()).toBe('IHDR')
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
  })
})
