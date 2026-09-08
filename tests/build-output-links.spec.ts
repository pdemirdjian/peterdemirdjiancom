import { test, expect } from '@playwright/test'
import { findBrokenLinks } from './support/build-output.mts'

// Unit tests for the link resolver over an in-memory build output. The map is
// site-relative path -> file text; non-HTML files carry '' because only HTML is
// ever inspected. tests/build-output.spec.ts runs the same function over the
// real build output.

const page = (body: string) => `<!DOCTYPE html><html><head><title>t</title></head><body>${body}</body></html>`

test.describe('findBrokenLinks', () => {
  test('a root-relative link to an existing file resolves', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume/index.html">r</a>')],
      ['/resume/index.html', page('r')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a directory link resolves with and without a trailing slash', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume/">a</a><a href="/license">b</a>')],
      ['/resume/index.html', page('r')],
      ['/license/index.html', page('l')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a relative link resolves against the page directory', () => {
    const files = new Map([
      ['/resume/index.html', page('<a href="../license/">l</a><a href="detail/">d</a>')],
      ['/license/index.html', page('l')],
      ['/resume/detail/index.html', page('d')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a link to a page that is not in the output is reported missing', () => {
    const files = new Map([['/index.html', page('<a href="/nope/">x</a>')]])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/nope/', reason: 'missing' },
    ])
  })

  test('a fragment that no id on the target page matches is reported', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume/#skills">s</a>')],
      ['/resume/index.html', page('<h2 id="experience">e</h2>')],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/resume/#skills', reason: 'missing-fragment' },
    ])
  })

  test('a fragment matching an id on the target page resolves', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume/#skills">s</a>')],
      ['/resume/index.html', page('<h2 id="skills">s</h2>')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a same-page fragment is checked against the page it appears on', () => {
    const files = new Map([
      ['/index.html', page('<a href="#main">m</a><a href="#gone">g</a><main id="main">m</main>')],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '#gone', reason: 'missing-fragment' },
    ])
  })

  test('every candidate URL in a srcset is checked', () => {
    const files = new Map([
      [
        '/index.html',
        page('<img src="/images/a.png" srcset="/images/a.png 1x, /images/b@2x.png 2x">'),
      ],
      ['/images/a.png', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/images/b@2x.png', reason: 'missing' },
    ])
  })

  test('stylesheet and script references are checked', () => {
    const files = new Map([
      [
        '/index.html',
        page('<link rel="stylesheet" href="/css/style.css"><script src="/js/gone.js"></script>'),
      ],
      ['/css/style.css', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/js/gone.js', reason: 'missing' },
    ])
  })

  test('off-site schemes and a bare fragment are skipped', () => {
    const files = new Map([
      [
        '/index.html',
        page(
          '<a href="https://example.com/x">a</a>' +
            '<a href="http://example.com/x">b</a>' +
            '<a href="//example.com/x">c</a>' +
            '<a href="mailto:someone@example.com">d</a>' +
            '<a href="tel:+15555550100">e</a>' +
            '<img src="data:image/gif;base64,R0lGOD">' +
            '<a href="#">f</a>' +
            '<a href="">g</a>'
        ),
      ],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a query string is stripped before resolving', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume/?v=2#skills">r</a>')],
      ['/resume/index.html', page('<h2 id="skills">s</h2>')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('each broken target is reported once per page', () => {
    const files = new Map([
      ['/index.html', page('<a href="/nope/">a</a><a href="/nope/">b</a>')],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/nope/', reason: 'missing' },
    ])
  })
})
