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

/**
 * Percent-decoded, so an encoded reference matches the id or the file name it
 * points at. A malformed escape sequence is left as written.
 */
function decode(value: string): string {
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

/** Every candidate URL in a srcset value, dropping the descriptors. */
function srcsetUrls(value: string): string[] {
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter((url) => url.length > 0)
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
    if (trimmed === '' || trimmed === '#' || OFF_SITE.test(trimmed)) continue
    if (seen.has(trimmed)) continue
    seen.add(trimmed)

    const hash = trimmed.indexOf('#')
    const beforeHash = hash === -1 ? trimmed : trimmed.slice(0, hash)
    references.push({
      raw: trimmed,
      path: decode(beforeHash.split('?')[0]),
      fragment: hash === -1 ? '' : decode(trimmed.slice(hash + 1)),
    })
  }
  return references
}

/** ids declared on a page, for fragment resolution. */
function idsOf(html: string): Set<string> {
  const ids = new Set<string>()
  for (const [name, value] of attributesOf(html)) {
    if (name === 'id' && value !== '') ids.add(value)
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
