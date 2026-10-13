import { test, expect } from '@playwright/test'
// The package entry ships no type declarations; this is the same module it
// re-exports, with the rules registered, and it carries core.d.ts.
import { HTMLHint } from 'htmlhint/dist/core/core.js'
import type { Ruleset } from 'htmlhint/dist/core/types.js'
import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { findBrokenLinks, type SiteFiles } from './support/build-output.mts'

// Verifies the build output: the files Hugo must have written, the HTML rules
// in .htmlhintrc, and that every same-site reference resolves. These checks
// used to be bash in the CI workflow; they run here so a developer and CI
// verify the build output through the same interface.

const publishDir = resolve(process.env.PUBLISH_DIR ?? 'public')

const REQUIRED_FILES = [
  '/index.html',
  '/resume/index.html',
  '/license/index.html',
  '/sitemap.xml',
  '/robots.txt',
  '/404.html',
]

/** Site-relative paths of every file in the publish directory. */
async function listFiles(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const paths: string[] = []
  for (const entry of entries) {
    const path = `${prefix}/${entry.name}`
    if (entry.isDirectory()) paths.push(...(await listFiles(join(dir, entry.name), path)))
    else paths.push(path)
  }
  return paths
}

/**
 * The build output in memory: HTML files carry their text, every other file is
 * present with '' so asset references resolve without reading binaries.
 */
async function loadBuildOutput(): Promise<SiteFiles> {
  const files = new Map<string, string>()
  for (const path of await listFiles(publishDir)) {
    const text = path.endsWith('.html')
      ? await readFile(join(publishDir, path), 'utf8')
      : ''
    files.set(path, text)
  }
  return files
}

let buildOutput: SiteFiles

test.beforeAll(async () => {
  buildOutput = await loadBuildOutput()
})

test('the build output contains every required file', () => {
  const missing = REQUIRED_FILES.filter((path) => !buildOutput.has(path))
  expect(missing, `missing from the build output: ${missing.join(', ')}`).toEqual([])
})

test('every same-site link in the build output resolves', () => {
  const broken = findBrokenLinks(buildOutput)
  const report = broken.map(({ page, target, reason }) => `${page} -> ${target} (${reason})`)
  expect(report, `broken links:\n${report.join('\n')}`).toEqual([])
})

test('every HTML file passes the .htmlhintrc rules', async () => {
  const ruleset: Ruleset = JSON.parse(await readFile(resolve('.htmlhintrc'), 'utf8'))
  const pages = [...buildOutput].filter(([path]) => path.endsWith('.html'))
  expect(pages.length).toBeGreaterThan(0)

  const problems = pages.flatMap(([path, html]) =>
    HTMLHint.verify(html, ruleset).map(
      (hint) => `${path}:${hint.line}:${hint.col} [${hint.rule.id}] ${hint.message}`
    )
  )
  expect(problems, `htmlhint:\n${problems.join('\n')}`).toEqual([])
})

test('home HTML and all portrait candidates weigh less than 300 KB', async () => {
  const html = buildOutput.get('/index.html') ?? ''
  const urls = new Set<string>()
  for (const tag of html.matchAll(/<(?:img|source)\b[^>]*>/g)) {
    const src = tag[0].match(/\bsrc="([^"]+)"/)?.[1]
    if (src) urls.add(src)
    const srcset = tag[0].match(/\bsrcset="([^"]+)"/)?.[1]
    for (const candidate of srcset?.split(',') ?? []) {
      urls.add(candidate.trim().split(/\s+/)[0])
    }
  }
  expect(urls.size).toBeGreaterThan(0)
  expect(buildOutput.has('/images/home.png')).toBe(false)
  let bytes = Buffer.byteLength(html)
  for (const url of urls) bytes += (await readFile(join(publishDir, url))).byteLength
  console.log(`Home HTML + image candidates: ${bytes} bytes`)
  expect(bytes).toBeLessThan(300_000)
})

test('Person metadata shares an absolute 1200×630 JPEG in the build output', async () => {
  const html = buildOutput.get('/index.html') ?? ''
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1]
  const twitter = html.match(/name="twitter:image" content="([^"]+)"/)?.[1]
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
  expect(og).toMatch(/^https:\/\/peterdemirdjian\.com\/images\/.+\.jpg$/)
  expect(twitter).toBe(og)
  expect(JSON.parse(json ?? '{}').image).toBe(og)

  const jpeg = await readFile(join(publishDir, new URL(og!).pathname))
  expect(jpeg.readUInt16BE(0)).toBe(0xffd8)
  // JPEG segments carry their own lengths; SOF0/SOF2 hold the frame dimensions.
  let dimensions: number[] | undefined
  for (let offset = 2; offset < jpeg.length;) {
    expect(jpeg[offset]).toBe(0xff)
    const marker = jpeg[offset + 1]
    if (marker === 0xc0 || marker === 0xc2) {
      dimensions = [jpeg.readUInt16BE(offset + 7), jpeg.readUInt16BE(offset + 5)]
      break
    }
    if (marker === 0xda || marker === 0xd9) break
    offset += 2 + jpeg.readUInt16BE(offset + 2)
  }
  expect(dimensions).toEqual([1200, 630])
})
