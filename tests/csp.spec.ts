import { test, expect } from '@playwright/test'
import { parseCsp } from './support/csp.mts'

test('CSP parser extracts concrete origins and ignores keywords and bare schemes', () => {
  const { directives, origins } = parseCsp(
    "default-src 'self'; script-src 'unsafe-inline' https://example.com; " +
    "img-src data: https: https://example.com https://images.example.com:8443; frame-ancestors 'none'"
  )
  expect(directives.get('default-src')).toEqual(["'self'"])
  expect([...origins]).toEqual(['https://example.com', 'https://images.example.com:8443'])
})

for (const source of ['example.com', '*.example.com', 'https://*.foo.com', 'example.com:8443', '*']) {
  test(`CSP parser rejects unsupported host source ${source}`, () => {
    expect(() => parseCsp(`default-src 'self'; img-src https://example.com ${source} data:`))
      .toThrow(`Unsupported CSP source: ${source}`)
  })
}
