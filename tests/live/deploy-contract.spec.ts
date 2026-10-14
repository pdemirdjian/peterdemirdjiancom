import { readFileSync } from 'node:fs'
import { test, expect, type APIResponse } from '@playwright/test'
import { matchPath, parseDeployContract } from '../support/netlify-site.mts'

const contract = parseDeployContract(readFileSync('netlify.toml', 'utf8'))

function expectContractHeaders(response: APIResponse, path: string) {
  const headers = response.headers()
  const expected: Record<string, string> = {}
  for (const rule of contract.headers) {
    if (matchPath(rule.for, path)) Object.assign(expected, rule.values)
  }
  for (const [name, value] of Object.entries(expected)) {
    expect.soft(headers[name.toLowerCase()], `${path} ${name}`).toBe(value)
  }
}

for (const [path, status] of [
  ['/', 200],
  ['/resume/', 200],
  ['/css/style.css', 200],
  ['/404.html', 200],
  ['/does-not-exist', 404],
] as const) {
  test(`${path} honours the deploy contract`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 })
    expect.soft(response.status(), `${path} status`).toBe(status)
    expectContractHeaders(response, path)
  })
}

test('the home page image honours the deploy contract', async ({ request, baseURL }) => {
  // Hugo generates the portrait filename; discover it without a local build.
  const home = await request.get('/')
  const image = (await home.text()).match(/<meta property="og:image" content="([^"]+)"/)
  expect(image, 'home page declares an og:image').not.toBeNull()
  const path = new URL(image![1], baseURL).pathname
  expect(path).toMatch(/^\/images\//)
  const response = await request.get(path, { maxRedirects: 0 })
  expect.soft(response.status(), `${path} status`).toBe(200)
  expectContractHeaders(response, path)
})

for (const rule of contract.redirects.filter((rule) => rule.status >= 300 && rule.status < 400)) {
  test(`${rule.from} redirects under the deploy contract`, async ({ request, baseURL }) => {
    const path = rule.from.replace(/\*/g, 'live-check')
    const match = matchPath(rule.from, path)!
    const response = await request.get(path, { maxRedirects: 0 })
    expect.soft(response.status(), `${path} status`).toBe(rule.status)
    const location = response.headers()['location']
    expect(location, `${path} Location`).toBeDefined()
    expect(new URL(location, baseURL).href).toBe(
      new URL(rule.to.replace(':splat', match.splat), baseURL).href,
    )
  })
}

test('www redirects 301 to the apex', async ({ request, baseURL }) => {
  test.skip(new URL(baseURL!).origin !== 'https://peterdemirdjian.com', 'Only check www when targeting the apex')
  const response = await request.get('https://www.peterdemirdjian.com/', { maxRedirects: 0 })
  expect.soft(response.status()).toBe(301)
  expect(response.headers()['location']).toBe('https://peterdemirdjian.com/')
})
