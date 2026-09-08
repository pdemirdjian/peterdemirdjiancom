import { parse } from 'smol-toml'

// The Netlify emulator: a pure request handler that serves a site the way
// Netlify does, under the deploy contract declared in netlify.toml. It applies
// the [[redirects]] rules (first match wins, force overrides existing files),
// stacks the [[headers]] rules, mirrors Netlify's pretty URLs, and falls back
// to 404.html with a real 404 status.
//
// Content reaches it through the `readFile` seam rather than the filesystem,
// and requests reach it as a raw request target rather than a socket, so every
// rule is exercisable without a build, a port, or a browser.

export interface RedirectRule {
  from: string
  to: string
  status: number
  force: boolean
}

export interface HeaderRule {
  for: string
  values: Record<string, string>
}

/** The headers, redirects and 404 behaviour a deploy promises. */
export interface DeployContract {
  redirects: RedirectRule[]
  headers: HeaderRule[]
}

export interface NetlifySiteOptions {
  /**
   * Reads a site-relative path such as `/resume/index.html`, returning null
   * when there is no such file.
   */
  readFile: (path: string) => Uint8Array | null
  contract: DeployContract
}

/**
 * Reads the testable surface of netlify.toml. Host-based rules (HTTPS/www
 * canonicalization) reference the production domain and cannot be matched
 * against a request path, so only path-based redirects are kept.
 */
export function parseDeployContract(toml: string): DeployContract {
  const config = parse(toml) as {
    redirects?: Array<Record<string, unknown>>
    headers?: Array<{ for?: unknown; values?: unknown }>
  }

  const headers: HeaderRule[] = (config.headers ?? [])
    .filter((h) => typeof h.for === 'string' && typeof h.values === 'object' && h.values !== null)
    .map((h) => ({ for: h.for as string, values: h.values as Record<string, string> }))

  const redirects: RedirectRule[] = (config.redirects ?? [])
    .filter((r) => typeof r.from === 'string' && r.from.startsWith('/'))
    .map((r) => ({
      from: r.from as string,
      to: String(r.to),
      status: typeof r.status === 'number' ? r.status : 301,
      force: r.force === true,
    }))

  return { redirects, headers }
}

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
}

function contentTypeFor(path: string): string {
  const dot = path.lastIndexOf('.')
  const slash = path.lastIndexOf('/')
  const extension = dot > slash ? path.slice(dot).toLowerCase() : ''
  return mimeTypes[extension] ?? 'application/octet-stream'
}

// Netlify glob: * matches anything, across path segments; a trailing * is
// captured for :splat substitution.
export function matchPath(pattern: string, path: string): { splat: string } | null {
  const regexSource = pattern
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
    .replace(/\.\*$/, '(.*)')
  const match = path.match(new RegExp(`^${regexSource}$`))
  if (!match) return null
  return { splat: match[1] ?? '' }
}

type Resolved =
  | { kind: 'file'; path: string; body: Uint8Array }
  | { kind: 'redirect'; location: string }

// Every redirect this handler issues targets a same-site path. Parse the
// candidate against a fixed origin and require that origin to survive: an
// absolute or protocol-relative target resolves elsewhere and is refused, and
// only the parsed path (never the raw input) reaches the Location header.
const siteOrigin = 'http://localhost'

function badRequest(): Response {
  return new Response('Bad Request', {
    status: 400,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export function createNetlifySite({ readFile, contract }: NetlifySiteOptions) {
  // Maps a URL path to content, mirroring Netlify's pretty URLs: non-canonical
  // paths (/foo/index.html, /foo with a directory index) 301 to the
  // trailing-slash form instead of serving the file directly.
  function resolveContent(urlPath: string): Resolved | null {
    if (urlPath.endsWith('/index.html')) {
      return { kind: 'redirect', location: urlPath.slice(0, -'index.html'.length) }
    }
    if (urlPath.endsWith('/')) {
      const index = `${urlPath}index.html`
      const body = readFile(index)
      return body ? { kind: 'file', path: index, body } : null
    }
    const exact = readFile(urlPath)
    if (exact) return { kind: 'file', path: urlPath, body: exact }
    const asHtml = readFile(`${urlPath}.html`)
    if (asHtml) return { kind: 'file', path: `${urlPath}.html`, body: asHtml }
    if (readFile(`${urlPath}/index.html`)) return { kind: 'redirect', location: `${urlPath}/` }
    return null
  }

  // All [[headers]] rules whose `for` matches the request path apply, like on Netlify.
  function headersFor(urlPath: string): Record<string, string> {
    const headers: Record<string, string> = {}
    for (const rule of contract.headers) {
      if (matchPath(rule.for, urlPath)) Object.assign(headers, rule.values)
    }
    return headers
  }

  function fileResponse(resolved: Resolved & { kind: 'file' }, status: number, urlPath: string) {
    // The DOM lib's BodyInit does not admit a Uint8Array over an arbitrary
    // ArrayBufferLike, which is what a filesystem read yields; the runtime
    // accepts any ArrayBufferView.
    return new Response(resolved.body as BodyInit, {
      status,
      headers: {
        ...headersFor(urlPath),
        'Content-Type': contentTypeFor(resolved.path),
        'Content-Length': String(resolved.body.length),
      },
    })
  }

  function redirectResponse(status: number, location: string): Response {
    let target: URL
    try {
      target = new URL(location, siteOrigin)
    } catch {
      return badRequest()
    }
    if (target.origin !== siteOrigin) return badRequest()
    return new Response(null, { status, headers: { Location: target.pathname + target.search } })
  }

  function notFoundResponse(urlPath: string): Response {
    const notFoundPage = readFile('/404.html')
    if (notFoundPage) {
      return fileResponse({ kind: 'file', path: '/404.html', body: notFoundPage }, 404, urlPath)
    }
    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  /**
   * Handles one request. `target` is the raw request target exactly as
   * received — Netlify matches rules against the raw, undecoded path, so
   * /css%2Fstyle.css is a 404 in production, not the stylesheet.
   */
  return function handle(target: string): Response {
    const urlPath = (target || '/').split('?')[0]
    // Reject degenerate request targets outright: anything not in origin-form,
    // traversal segments, duplicate slashes (which would make a derived Location
    // protocol-relative), and backslashes. None of these reach content on Netlify.
    if (
      !urlPath.startsWith('/') ||
      urlPath.includes('..') ||
      urlPath.includes('//') ||
      urlPath.includes('\\')
    ) {
      return badRequest()
    }

    for (const rule of contract.redirects) {
      const match = matchPath(rule.from, urlPath)
      if (!match) continue
      // A non-forced rule is shadowed by existing content; later rules still apply.
      if (!rule.force && resolveContent(urlPath)) continue
      if (rule.status >= 300 && rule.status < 400) {
        return redirectResponse(rule.status, rule.to.replace(':splat', match.splat))
      }
      // Rewrite (e.g. status 404): serve the target's content with the rule's status.
      const rewritten = resolveContent(rule.to.replace(':splat', match.splat))
      if (rewritten?.kind === 'file') return fileResponse(rewritten, rule.status, urlPath)
      return notFoundResponse(urlPath)
    }

    const resolved = resolveContent(urlPath)
    if (!resolved) return notFoundResponse(urlPath)
    if (resolved.kind === 'redirect') return redirectResponse(301, resolved.location)
    return fileResponse(resolved, 200, urlPath)
  }
}
