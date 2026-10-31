import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BRAND } from './brand.js'

const read = name => readFileSync(resolve('public', name))
const manifest = JSON.parse(read('manifest.json'))
const html = readFileSync(resolve('index.html'), 'utf8')
const pngSize = bytes => {
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(bytes.toString('ascii', 12, 16)).toBe('IHDR')
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
}

describe('LevelUp install assets', () => {
  it('keeps the application identity, routes and install mode', () => {
    expect(manifest).toMatchObject({ name: BRAND.title, short_name: BRAND.name,
      description: BRAND.description, start_url: './', scope: './', display: 'standalone', orientation: 'portrait' })
  })
  it('uses the original compact SVG as a text-free favicon', () => {
    expect(read('favicon.svg').toString()).toBe(readFileSync(resolve('src/assets/brand/levelup-symbol.svg'), 'utf8').replace(/\r\n/g, '\n'))
    expect(read('favicon.svg').toString()).not.toMatch(/<text\b/)
    expect(html).toContain('type="image/svg+xml" href="favicon.svg"')
  })
  it('includes a valid ICO fallback with 16, 32 and 48 pixel entries', () => {
    const ico = read('favicon.ico')
    expect(ico.readUInt16LE(0)).toBe(0)
    expect(ico.readUInt16LE(2)).toBe(1)
    expect(ico.readUInt16LE(4)).toBe(3)
    expect([0, 1, 2].map(i => [ico[6 + i * 16], ico[7 + i * 16]])).toEqual([[16, 16], [32, 32], [48, 48]])
    expect(html).toContain('type="image/x-icon" href="favicon.ico"')
  })
  it.each([180, 192, 512])('ships a valid %i pixel PNG', size => {
    expect(pngSize(read(`icon-${size}.png`))).toEqual([size, size])
  })
  it('keeps the existing Apple path and gives the maskable artwork its own purpose', () => {
    expect(html).toContain('rel="apple-touch-icon" href="icon-180.png"')
    expect(pngSize(read('icon-maskable-512.png'))).toEqual([512, 512])
    expect(manifest.icons.find(i => i.src === 'icon-512.png').purpose).toBe('any')
    expect(manifest.icons.filter(i => i.purpose === 'maskable').map(i => i.src)).toEqual(['icon-maskable-512.png'])
    for (const icon of manifest.icons) expect(existsSync(resolve('public', icon.src)), icon.src).toBe(true)
  })
})

describe('sharing artwork', () => {
  it('ships a compact 1200 by 630 PNG', () => {
    const bytes = read('social-preview.png')
    expect(pngSize(bytes)).toEqual([1200, 630])
    expect(bytes.length).toBeLessThan(250_000)
  })
})
