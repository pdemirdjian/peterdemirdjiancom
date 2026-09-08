// Pure link checking over the build output, in memory. The caller loads the
// publish directory into a Map of site-relative path ('/resume/index.html') to
// file text and gets back every same-site reference that does not resolve.
// Nothing here touches the filesystem, so the rules are exercised directly by
// tests/build-output-links.spec.ts.

import { dirname, resolve as resolvePosix } from 'node:path/posix'

export interface BrokenLink {
  /** Site-relative path of the page the reference appears on. */
  page: string
  /** The reference exactly as written in the HTML. */
  target: string
  reason: 'missing' | 'missing-fragment'
}

/**
 * The build output as an in-memory map: site-relative path -> file text.
 * Non-HTML files (css, images, fonts) belong in the map too, with '' as their
 * text — only HTML is ever inspected, but every file must be present for
 * asset references to resolve.
 */
export type SiteFiles = ReadonlyMap<string, string>

/** Schemes that point off-site (or carry their own payload), so never checked. */
const OFF_SITE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

/** An open tag with its attribute text; quoted values may contain '>'. */
const TAG = /<([a-zA-Z][-\w]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g

/** Comments: markup inside them is text a browser never follows. */
const COMMENT = /<!--[\s\S]*?-->/g

/**
 * A script or style element, captured as its open tag plus its raw-text body.
 * The body is dropped and the open tag kept, because `<script src>` is a real
 * reference while a string literal or a CSS url() inside the body is not.
 */
const RAW_TEXT_ELEMENT = /(<(script|style)\b(?:[^>"']|"[^"]*"|'[^']*')*>)[\s\S]*?(?=<\/\2[\s>]|$)/gi

/** name=value pairs inside a tag's attribute text; value may be unquoted. */
const ATTR = /([-\w:.]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g

/** Attributes whose value is a single URL. */
const URL_ATTRS = new Set(['href', 'src'])

interface Reference {
  /** The reference as written, used verbatim in reports. */
  raw: string
  /** Path part, query stripped and percent-decoded, empty for a same-page fragment. */
  path: string
  /** Fragment without '#', percent-decoded, empty when the reference carries none. */
  fragment: string
}

/** The markup a browser would parse as markup: no comments, no raw-text bodies. */
function markupOf(html: string): string {
  return html.replace(COMMENT, '').replace(RAW_TEXT_ELEMENT, '$1')
}

/** A character reference: named (the five HTML markup ones) or numeric. */
const CHAR_REF = /&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi

const NAMED_CHAR_REFS: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

/**
 * Attribute text as the document means it: Hugo writes `&amp;` into any href
 * carrying a query string, so the reference is `&`, not `&amp;`. A named
 * reference this does not know is left as written.
 */
function decodeCharacterReferences(value: string): string {
  return value.replace(CHAR_REF, (reference, body: string) => {
    if (!body.startsWith('#')) return NAMED_CHAR_REFS[body.toLowerCase()] ?? reference
    const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : Number(body.slice(1))
    return Number.isSafeInteger(code) && code > 0 && code <= 0x10ffff
      ? String.fromCodePoint(code)
      : reference
  })
}

/**
 * Percent-decoded, so an encoded reference matches the id or the file name it
 * points at. A malformed escape sequence is left as written.
 */
function percentDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function attributesOf(html: string): Array<[string, string]> {
  const attrs: Array<[string, string]> = []
  for (const tag of markupOf(html).matchAll(TAG)) {
    for (const attr of tag[2].matchAll(ATTR)) {
      attrs.push([attr[1].toLowerCase(), attr[2] ?? attr[3] ?? attr[4] ?? ''])
    }
  }
  return attrs
}

const SPACE = /\s/

/**
 * Every candidate URL in a srcset value, dropping the descriptors. A URL never
 * contains whitespace, so whitespace ends one; a comma also ends one, except
 * inside a data URL, whose base64 payload is full of commas.
 */
function srcsetUrls(value: string): string[] {
  const urls: string[] = []
  let at = 0
  while (at < value.length) {
    while (at < value.length && (SPACE.test(value[at]) || value[at] === ',')) at++
    if (at >= value.length) break

    const start = at
    const commaEndsUrl = !value.startsWith('data:', start)
    while (at < value.length && !SPACE.test(value[at]) && !(commaEndsUrl && value[at] === ',')) at++
    const url = value.slice(start, at).replace(/,+$/, '')
    if (url !== '') urls.push(url)

    // The URL ended at whitespace, so descriptors run up to the next comma.
    if (at < value.length && SPACE.test(value[at])) {
      while (at < value.length && value[at] !== ',') at++
    }
  }
  return urls
}

/** Same-site references on a page, in document order, deduplicated. */
function referencesOf(html: string): Reference[] {
  const raws: string[] = []
  for (const [name, value] of attributesOf(html)) {
    if (URL_ATTRS.has(name)) raws.push(value)
    else if (name === 'srcset') raws.push(...srcsetUrls(value))
  }

  const seen = new Set<string>()
  const references: Reference[] = []
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (seen.has(trimmed)) continue
    seen.add(trimmed)

    // Character references first: only then does '#' mean a fragment, and only
    // then is '&' the '&' the document meant.
    const text = decodeCharacterReferences(trimmed)
    if (text === '' || text === '#' || OFF_SITE.test(text)) continue

    const hash = text.indexOf('#')
    const beforeHash = hash === -1 ? text : text.slice(0, hash)
    references.push({
      raw: trimmed,
      path: percentDecode(beforeHash.split('?')[0]),
      fragment: hash === -1 ? '' : percentDecode(text.slice(hash + 1)),
    })
  }
  return references
}

/** ids declared on a page, for fragment resolution. */
function idsOf(html: string): Set<string> {
  const ids = new Set<string>()
  for (const [name, value] of attributesOf(html)) {
    // Only character references: an id is literal text, never percent-encoded.
    if (name === 'id' && value !== '') ids.add(decodeCharacterReferences(value))
  }
  return ids
}

/**
 * The file a reference points at, or undefined when nothing matches. A
 * directory resolves to its index.html with or without a trailing slash,
 * mirroring the pretty URLs the deploy contract serves.
 */
function resolveFile(files: SiteFiles, page: string, path: string): string | undefined {
  const absolute = path.startsWith('/') ? path : resolvePosix(dirname(page), path)
  if (files.has(absolute)) return absolute
  const index = absolute.endsWith('/') ? `${absolute}index.html` : `${absolute}/index.html`
  return files.has(index) ? index : undefined
}

/** Every same-site reference in the build output that does not resolve. */
export function findBrokenLinks(files: SiteFiles): BrokenLink[] {
  const broken: BrokenLink[] = []
  const idCache = new Map<string, Set<string>>()
  const idsFor = (path: string): Set<string> => {
    let ids = idCache.get(path)
    if (!ids) {
      ids = idsOf(files.get(path) ?? '')
      idCache.set(path, ids)
    }
    return ids
  }

  for (const [page, html] of files) {
    if (!page.endsWith('.html')) continue

    for (const reference of referencesOf(html)) {
      const targetPage = reference.path === '' ? page : resolveFile(files, page, reference.path)
      if (targetPage === undefined) {
        broken.push({ page, target: reference.raw, reason: 'missing' })
        continue
      }
      if (reference.fragment === '' || !targetPage.endsWith('.html')) continue
      if (!idsFor(targetPage).has(reference.fragment)) {
        broken.push({ page, target: reference.raw, reason: 'missing-fragment' })
      }
    }
  }
  return broken
}
