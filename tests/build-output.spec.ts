import { test, expect } from '@playwright/test'
// The package entry ships no type declarations; this is the same module it
// re-exports, with the rules registered, and it carries core.d.ts.
import { HTMLHint } from 'htmlhint/dist/core/core.js'
import type { Ruleset } from 'htmlhint/dist/core/types.js'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { findBrokenLinks, type SiteFiles } from './support/build-output.mts'
import { person, baseURL } from './support/site-config.mts'

// Verifies the build output: the files Hugo must have written, the HTML rules
// in .htmlhintrc, and that every same-site reference resolves. These checks
// used to be bash in the CI workflow; they run here so a developer and CI
// verify the build output through the same interface.

const publishDir = resolve(process.env.PUBLISH_DIR ?? 'public')

const REQUIRED_FILES = [
  '/index.html',
  '/resume/index.html',
  '/resume.pdf',
  '/license/index.html',
  '/2026/index.html',
  '/sitemap.xml',
  '/robots.txt',
  '/.well-known/security.txt',
  '/404.html',
]

test('the downloadable resume is a one or two page Letter PDF naming the current role', async () => {
  const pdf = await getDocument({ data: new Uint8Array(await readFile(join(publishDir, 'resume.pdf'))) }).promise
  expect(pdf.numPages).toBeGreaterThanOrEqual(1)
  expect(pdf.numPages).toBeLessThanOrEqual(2)
  const { info } = await pdf.getMetadata()
  expect((info as { Title?: string }).Title).toBe(`Resume — ${person.name}`)
  const pageTexts: string[] = []
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n)
    expect(page.view).toEqual([0, 0, 612, 792])
    const { items } = await page.getTextContent()
    pageTexts.push(items.map((item) => ('str' in item ? item.str : '')).join(' '))
  }
  // Chromium splits words into text runs at font-dependent points (e.g.
  // "Principa l" on Linux), so compare with all whitespace removed.
  const squash = (value: string) => value.replace(/\s+/g, '')
  const text = squash(pageTexts.join(''))
  expect(text).toContain(squash(person.jobTitle))
  expect(text).toContain(squash(person.employer))
  expect(text).toMatch(/Lastupdated(January|February|March|April|May|June|July|August|September|October|November|December)20\d{2}/)
})

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

/** Width and height of a JPEG, read from its SOF0/SOF2 frame header. */
async function jpegDimensions(url: string): Promise<number[] | undefined> {
  const jpeg = await readFile(join(publishDir, new URL(url).pathname))
  expect(jpeg.readUInt16BE(0)).toBe(0xffd8)
  // JPEG segments carry their own lengths; SOF0/SOF2 hold the frame dimensions.
  for (let offset = 2; offset < jpeg.length;) {
    expect(jpeg[offset]).toBe(0xff)
    const marker = jpeg[offset + 1]
    if (marker === 0xc0 || marker === 0xc2) {
      return [jpeg.readUInt16BE(offset + 7), jpeg.readUInt16BE(offset + 5)]
    }
    if (marker === 0xda || marker === 0xd9) break
    offset += 2 + jpeg.readUInt16BE(offset + 2)
  }
  return undefined
}

// Hugo names a processed image after its source file: headshot_hu_<hash>.jpg.
const HEADSHOT_RENDITION = /^https:\/\/peterdemirdjian\.com\/images\/headshot_hu_[^/]+\.jpg$/

test('Person share card is an absolute 1200×630 JPEG built from the headshot', async () => {
  const html = buildOutput.get('/index.html') ?? ''
  const meta = (attr: string, key: string) =>
    html.match(new RegExp(`${attr}="${key}" content="([^"]+)"`))?.[1]
  const og = meta('property', 'og:image')
  expect(og).toMatch(HEADSHOT_RENDITION)
  expect(meta('name', 'twitter:image')).toBe(og)
  expect(meta('name', 'twitter:card')).toBe('summary_large_image')
  expect(meta('property', 'og:image:width')).toBe('1200')
  expect(meta('property', 'og:image:height')).toBe('630')
  expect(meta('property', 'og:image:alt')).toContain(person.name)
  expect(meta('name', 'twitter:image:alt')).toBe(meta('property', 'og:image:alt'))
  expect(await jpegDimensions(og!)).toEqual([1200, 630])
  expect([...buildOutput.keys()].filter((path) => path.startsWith('/images/home'))).toEqual([])
})

test('Person JSON-LD image is a square headshot rendition, not the share card', async () => {
  const html = buildOutput.get('/index.html') ?? ''
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
  const image: string = JSON.parse(json ?? '{}').mainEntity.image
  expect(image).toMatch(HEADSHOT_RENDITION)
  expect(image).not.toBe(html.match(/property="og:image" content="([^"]+)"/)?.[1])
  const [width, height] = (await jpegDimensions(image)) ?? []
  expect(width).toBe(height)
  expect(width).toBeGreaterThanOrEqual(400)
})

test('security.txt publishes Person contact and a UTC expiry about a year after build time', async () => {
  const path = join(publishDir, '.well-known/security.txt')
  const text = await readFile(path, 'utf8')
  expect(text).toContain(`Contact: mailto:${person.email}\n`)
  expect(text).toContain('Preferred-Languages: en\n')
  expect(text).toContain(`Canonical: ${new URL('.well-known/security.txt', baseURL).href}\n`)
  const expires = text.match(/^Expires: (.+)$/m)?.[1] ?? ''
  expect(expires).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  const daysAfterBuild = (Date.parse(expires) - (await stat(path)).mtimeMs) / 86_400_000
  expect(daysAfterBuild).toBeGreaterThan(300)
  expect(daysAfterBuild).toBeLessThan(400)
})

test('the sitemap advertises only HTML pages with valid lastmod dates', async () => {
  const sitemap = await readFile(join(publishDir, 'sitemap.xml'), 'utf8')
  const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  expect(urls.length).toBeGreaterThan(0)
  for (const [, entry] of urls) {
    const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ''
    const url = new URL(loc)
    expect(url.origin).toBe(new URL(baseURL).origin)
    expect(['/tags/', '/categories/', '/resume.pdf']).not.toContain(url.pathname)
    const htmlPath = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname
    expect(htmlPath).toMatch(/\.html$/)
    expect(buildOutput.has(htmlPath)).toBe(true)
    const lastmod = entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? ''
    expect(lastmod).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(Date.parse(lastmod)).toBeGreaterThan(Date.parse("2020-01-01"))
  }
  const files = await readdir(publishDir)
  expect(files).not.toContain('tags')
  expect(files).not.toContain('categories')
  expect(files).not.toContain('index.xml')
})
