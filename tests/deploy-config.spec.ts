import { test, expect } from '@playwright/test'
import { request } from 'node:http'

// Verifies the deploy config in netlify.toml (headers, redirects, 404 handling)
// as served by tests/support/netlify-static-server.ts. Expected values here are
// the production contract; netlify.toml is the source under test.

test.describe('Security headers', () => {
  test('home page carries the security headers', async ({ request }) => {
    const headers = (await request.get('/')).headers()
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['strict-transport-security']).toBe(
      'max-age=31536000; includeSubDomains; preload'
    )
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toContain('geolocation=()')
  })

  test('subpages carry the security headers too', async ({ request }) => {
    const headers = (await request.get('/resume/')).headers()
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['x-frame-options']).toBe('DENY')
  })
})

test.describe('Redirects', () => {
  test('legacy /resume.html redirects 301 to /resume/', async ({ request }) => {
    const response = await request.get('/resume.html', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toBe('/resume/')
  })

  test('legacy /license.html redirects 301 to /license/', async ({ request }) => {
    const response = await request.get('/license.html', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toBe('/license/')
  })

  // Netlify pretty URLs: non-canonical paths 301 to the trailing-slash form.
  test('/resume redirects 301 to /resume/', async ({ request }) => {
    const response = await request.get('/resume', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toBe('/resume/')
  })

  test('/index.html redirects 301 to /', async ({ request }) => {
    const response = await request.get('/index.html', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toBe('/')
  })
})

// Playwright's request fixture resolves paths against baseURL, so a raw
// protocol-relative target like //evil.com never reaches the wire through it.
// Send the request target verbatim over node:http instead.
function rawGet(path: string): Promise<{ status: number; location: string | undefined }> {
  return new Promise((resolvePromise, reject) => {
    const req = request({ host: 'localhost', port: 8080, path, method: 'GET' }, (res) => {
      res.resume()
      res.on('end', () =>
        resolvePromise({ status: res.statusCode ?? 0, location: res.headers['location'] })
      )
    })
    req.on('error', reject)
    req.end()
  })
}

test.describe('Redirect target validation', () => {
  // A canonicalizing redirect derives its Location from the request path; an
  // off-site target (CWE-601) must be refused rather than echoed back.
  for (const path of ['//evil.com/index.html', '/\\evil.com/index.html', '//evil.com/resume']) {
    test(`${path} is refused with 400 and no Location`, async () => {
      const response = await rawGet(path)
      expect(response.status).toBe(400)
      expect(response.location).toBeUndefined()
    })
  }

  test('same-site canonicalization still redirects to a path', async () => {
    const response = await rawGet('/resume/index.html')
    expect(response.status).toBe(301)
    expect(response.location).toBe('/resume/')
  })
})

test.describe('Sensitive path blocks', () => {
  for (const path of ['/.env', '/.env.local', '/.git/config', '/node_modules/serve/package.json']) {
    test(`${path} returns 404`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status()).toBe(404)
    })
  }
})

test.describe('404 handling', () => {
  test('nonexistent path returns status 404 with the 404 page body', async ({ request }) => {
    const response = await request.get('/does-not-exist')
    expect(response.status()).toBe(404)
    expect(await response.text()).toContain('404')
  })
})

test.describe('Cache headers', () => {
  test('stylesheet is cacheable for an hour', async ({ request }) => {
    const response = await request.get('/css/style.css')
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toBe('public, max-age=3600')
  })

  test('fonts are cacheable for a year, immutable', async ({ request }) => {
    const response = await request.get('/fonts/archivo-latin.woff2')
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable')
  })
})
