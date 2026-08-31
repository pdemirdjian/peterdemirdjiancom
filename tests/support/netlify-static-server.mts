import { createServer, type ServerResponse } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { parse } from 'smol-toml'

// Serves public/ the way Netlify does: applies the [[redirects]] rules from
// netlify.toml (first match wins, force overrides existing files) and falls
// back to 404.html with a real 404 status. Host-based rules (HTTPS/www
// canonicalization) reference the production domain and cannot be exercised
// against localhost, so path-based rules are the testable surface.

interface RedirectRule {
  from: string
  to: string
  status: number
  force: boolean
}

interface HeaderRule {
  for: string
  values: Record<string, string>
}

const root = resolve(process.env.PUBLISH_DIR ?? 'public')
const port = Number(process.env.PORT ?? 8080)

const config = parse(readFileSync(resolve('netlify.toml'), 'utf8')) as {
  redirects?: Array<Record<string, unknown>>
  headers?: Array<{ for?: unknown; values?: unknown }>
}

const headerRules: HeaderRule[] = (config.headers ?? [])
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

// Netlify glob: * matches anything, across path segments; a trailing * is
// captured for :splat substitution.
function matchPath(pattern: string, path: string): { splat: string } | null {
  const regexSource = pattern
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
    .replace(/\.\*$/, '(.*)')
  const match = path.match(new RegExp(`^${regexSource}$`))
  if (!match) return null
  return { splat: match[1] ?? '' }
}

function isFile(file: string): boolean {
  return existsSync(file) && statSync(file).isFile()
}

type Resolved = { kind: 'file'; file: string } | { kind: 'redirect'; location: string }

// Maps a URL path to content under public/, mirroring Netlify's pretty URLs:
// non-canonical paths (/foo/index.html, /foo with a directory index) 301 to
// the trailing-slash form instead of serving the file directly.
function resolveContent(urlPath: string): Resolved | null {
  const candidate = resolve(join(root, urlPath))
  if (candidate !== root && !candidate.startsWith(root + sep)) return null
  if (urlPath.endsWith('/index.html')) {
    return { kind: 'redirect', location: urlPath.slice(0, -'index.html'.length) }
  }
  if (urlPath.endsWith('/')) {
    const index = join(candidate, 'index.html')
    return isFile(index) ? { kind: 'file', file: index } : null
  }
  if (isFile(candidate)) return { kind: 'file', file: candidate }
  if (isFile(`${candidate}.html`)) return { kind: 'file', file: `${candidate}.html` }
  if (isFile(join(candidate, 'index.html'))) return { kind: 'redirect', location: `${urlPath}/` }
  return null
}

// All [[headers]] rules whose `for` matches the request path apply, like on Netlify.
function headersFor(urlPath: string): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const rule of headerRules) {
    if (matchPath(rule.for, urlPath)) Object.assign(headers, rule.values)
  }
  return headers
}

function sendFile(res: ServerResponse, file: string, status: number, urlPath: string): void {
  const body = readFileSync(file)
  res.writeHead(status, {
    ...headersFor(urlPath),
    'Content-Type': mimeTypes[extname(file)] ?? 'application/octet-stream',
    'Content-Length': body.length,
  })
  res.end(body)
}

function sendNotFound(res: ServerResponse, urlPath: string): void {
  const notFoundPage = join(root, '404.html')
  if (existsSync(notFoundPage)) {
    sendFile(res, notFoundPage, 404, urlPath)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
  }
}

const server = createServer((req, res) => {
  // Netlify matches rules against the raw request path — percent-encoded
  // sequences are not decoded first (Hugo's output paths are all ASCII), so
  // /css%2Fstyle.css is a 404 in production, not the stylesheet.
  const urlPath = (req.url ?? '/').split('?')[0]
  if (!urlPath.startsWith('/')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
    return
  }

  for (const rule of redirects) {
    const match = matchPath(rule.from, urlPath)
    if (!match) continue
    // A non-forced rule is shadowed by existing content; later rules still apply.
    if (!rule.force && resolveContent(urlPath)) continue
    if (rule.status >= 300 && rule.status < 400) {
      res.writeHead(rule.status, { Location: rule.to.replace(':splat', match.splat) })
      res.end()
    } else {
      // Rewrite (e.g. status 404): serve the target's content with the rule's status.
      const target = resolveContent(rule.to.replace(':splat', match.splat))
      if (target?.kind === 'file') sendFile(res, target.file, rule.status, urlPath)
      else sendNotFound(res, urlPath)
    }
    return
  }

  const resolved = resolveContent(urlPath)
  if (!resolved) sendNotFound(res, urlPath)
  else if (resolved.kind === 'redirect') {
    res.writeHead(301, { Location: resolved.location })
    res.end()
  } else {
    sendFile(res, resolved.file, 200, urlPath)
  }
})

server.listen(port, () => {
  console.log(`netlify-static-server serving ${root} on http://localhost:${port}`)
})
