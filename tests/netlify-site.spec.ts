import { test, expect } from '@playwright/test'
import { createNetlifySite, parseDeployContract } from './support/netlify-site.mts'

// Browserless tests for the Netlify emulator: the deploy contract is an inline
// TOML string and the site content is an in-memory file map, so every rule of
// the contract can be exercised without a Hugo build or a browser.

const CONTRACT_TOML = `
[build]
  publish = "public"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"

[[headers]]
  for = "/css/*.css"
  [headers.values]
    Cache-Control = "public, max-age=3600"

# Host-based rules cannot be matched against a path and are dropped on parse.
[[redirects]]
  from = "http://example.com/*"
  to = "https://example.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/old/*"
  to = "/new/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/forced.html"
  to = "/forced-target/"
  status = 301
  force = true

[[redirects]]
  from = "/soft/*"
  to = "/hard/:splat"
  status = 301

[[redirects]]
  from = "/soft/kept"
  to = "/late/"
  status = 301
  force = true

[[redirects]]
  from = "/.env*"
  to = "/404"
  status = 404
`

const FILES = new Map<string, string>([
  ['/index.html', '<html>home</html>'],
  ['/404.html', '<html>404 not found</html>'],
  ['/foo/index.html', '<html>foo</html>'],
  ['/page.html', '<html>page</html>'],
  ['/forced.html', '<html>forced</html>'],
  ['/soft/kept.html', '<html>kept</html>'],
  ['/css/style.css', 'body { color: red }'],
])

function siteWith(files: Map<string, string>, toml = CONTRACT_TOML) {
  const encoder = new TextEncoder()
  return createNetlifySite({
    readFile: (path) => {
      const content = files.get(path)
      return content === undefined ? null : encoder.encode(content)
    },
    contract: parseDeployContract(toml),
  })
}

const site = siteWith(FILES)

test.describe('parseDeployContract', () => {
  test('keeps path-based redirects and drops host-based ones', () => {
    const contract = parseDeployContract(CONTRACT_TOML)
    expect(contract.redirects.map((r) => r.from)).toEqual([
      '/old/*',
      '/forced.html',
      '/soft/*',
      '/soft/kept',
      '/.env*',
    ])
    expect(contract.headers.map((h) => h.for)).toEqual(['/*', '/css/*.css'])
    expect(contract.headers[1].values['Cache-Control']).toBe('public, max-age=3600')
  })
})

test.describe('Redirect rules', () => {
  test('a glob rule substitutes :splat', () => {
    const response = site('/old/deep/path.html')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/new/deep/path.html')
  })

  test('a forced rule overrides existing content', () => {
    const response = site('/forced.html')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/forced-target/')
  })

  test('a non-forced rule applies when no content shadows it', () => {
    const response = site('/soft/other')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/hard/other')
  })

  test('a non-forced rule is shadowed by content while a later rule still applies', () => {
    const response = site('/soft/kept')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/late/')
  })

  test('a 404-status rewrite serves the target body with a 404 status', async () => {
    const response = site('/.env.local')
    expect(response.status).toBe(404)
    expect(await response.text()).toContain('404 not found')
  })
})

test.describe('Pretty URLs', () => {
  test('/foo redirects 301 to /foo/ when a directory index exists', () => {
    const response = site('/foo')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/foo/')
  })

  test('/foo/index.html redirects 301 to /foo/', () => {
    const response = site('/foo/index.html')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/foo/')
  })

  test('/foo/ serves the directory index', async () => {
    const response = site('/foo/')
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('foo')
  })

  test('a clean URL falls back to the .html file', async () => {
    const response = site('/page')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await response.text()).toContain('page')
  })
})

test.describe('Header rules', () => {
  test('every matching [[headers]] rule stacks on one path', () => {
    const response = site('/css/style.css')
    expect(response.status).toBe(200)
    expect(response.headers.get('x-frame-options')).toBe('DENY')
    expect(response.headers.get('cache-control')).toBe('public, max-age=3600')
    expect(response.headers.get('content-type')).toBe('text/css; charset=utf-8')
  })
})

test.describe('Degenerate request targets', () => {
  for (const target of ['//evil.com/index.html', '/\\evil.com/index.html', '/foo/../../etc']) {
    test(`${target} is refused with 400 and no Location`, () => {
      const response = site(target)
      expect(response.status).toBe(400)
      expect(response.headers.get('location')).toBeNull()
    })
  }
})

test.describe('Raw request targets', () => {
  test('a percent-encoded path is not decoded', async () => {
    const response = site('/css%2Fstyle.css')
    expect(response.status).toBe(404)
    expect(await response.text()).toContain('404 not found')
  })

  test('a query string is stripped before matching', async () => {
    const response = site('/page?utm=1')
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('page')
  })
})

test.describe('404 fallback', () => {
  test('missing 404.html falls back to a plain-text 404', async () => {
    const bare = siteWith(new Map([['/index.html', '<html>home</html>']]))
    const response = bare('/does-not-exist')
    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(await response.text()).toBe('Not Found')
  })
})
