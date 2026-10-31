import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const dir = resolve(process.argv[2] || 'dist')
const html = readFileSync(join(dir, 'index.html'), 'utf8')
const refs = [...html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)]
  .map(m => m[1]).filter(ref => !/^(?:https?:|data:|\/\/)/.test(ref))
for (const ref of refs) assert(existsSync(join(dir, ref)), `Missing HTML asset: ${ref}`)
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'))
for (const icon of manifest.icons) assert(existsSync(join(dir, icon.src)), `Missing icon: ${icon.src}`)
const social = html.match(/property="og:image" content="([^"]+)"/)?.[1]
assert(social, 'Missing social image metadata')
assert(existsSync(join(dir, new URL(social).pathname)), 'Missing built social image')
assert(html.includes('favicon.svg') && html.includes('favicon.ico'), 'Missing favicon formats')
console.log(`${refs.length} HTML references, ${manifest.icons.length} manifest icons and the social image exist in ${dir}.`)
