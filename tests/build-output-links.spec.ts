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

  test('a reference inside an HTML comment is not a reference', () => {
    const files = new Map([
      ['/index.html', page('<!-- <img src="/deleted.png"> --><p>kept</p>')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('markup-like text inside a script body is not a reference', () => {
    const files = new Map([
      [
        '/index.html',
        page('<script>const markup = \'<a href="/nope/">x</a>\'</script>'),
      ],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test("a script's own src is still checked", () => {
    const files = new Map([
      ['/index.html', page('<script src="/js/gone.js">const a = 1</script>')],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/js/gone.js', reason: 'missing' },
    ])
  })

  test('a url() inside a style body is not a reference', () => {
    const files = new Map([
      ['/index.html', page('<style>body { background: url(/nope.png) }</style>')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a percent-encoded fragment matches its decoded id', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume/#caf%C3%A9">c</a>')],
      ['/resume/index.html', page('<h2 id="café">c</h2>')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a percent-encoded path matches its decoded file', () => {
    const files = new Map([
      ['/index.html', page('<a href="/caf%C3%A9/">c</a>')],
      ['/café/index.html', page('c')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a malformed escape sequence is reported, not thrown', () => {
    const files = new Map([['/index.html', page('<a href="#%E0%A4%A">x</a>')]])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '#%E0%A4%A', reason: 'missing-fragment' },
    ])
  })

  test('a character reference in a path is decoded before resolving', () => {
    const files = new Map([
      ['/index.html', page('<a href="/a&amp;b/?x=1&amp;y=2">a</a>')],
      ['/a&b/index.html', page('a')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a character reference in an id satisfies the same reference in a fragment', () => {
    const files = new Map([
      ['/index.html', page('<a href="#x&amp;y">x</a><h2 id="x&amp;y">x</h2>')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a numeric character reference in a path is decoded', () => {
    const files = new Map([
      ['/index.html', page('<a href="/resume&#47;">r</a><a href="/license&#x2F;">l</a>')],
      ['/resume/index.html', page('r')],
      ['/license/index.html', page('l')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a character reference in an unresolved target is reported as written', () => {
    const files = new Map([['/index.html', page('<a href="/a&amp;b/">a</a>')]])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/a&amp;b/', reason: 'missing' },
    ])
  })

  test('a data URL in a srcset is skipped, commas in its payload and all', () => {
    const files = new Map([
      ['/index.html', page('<img srcset="data:image/png;base64,AAAA,BBBB 1x">')],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('srcset candidates separated by comma and space both resolve', () => {
    const files = new Map([
      ['/index.html', page('<img srcset="/a.png 1x, /b.png 2x">')],
      ['/a.png', ''],
      ['/b.png', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('srcset candidates separated by a bare comma both resolve', () => {
    const files = new Map([
      ['/index.html', page('<img srcset="/a.png,/b.png">')],
      ['/a.png', ''],
      ['/b.png', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('an encoded separator does not resolve, because the site would 404', () => {
    const files = new Map([
      ['/index.html', page('<link rel="stylesheet" href="/css%2Fstyle.css">')],
      ['/css/style.css', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/css%2Fstyle.css', reason: 'missing' },
    ])
  })

  test('an encoded separator in a relative path does not resolve either', () => {
    const files = new Map([
      ['/resume/index.html', page('<a href="..%2Flicense/">l</a>')],
      ['/license/index.html', page('l')],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/resume/index.html', target: '..%2Flicense/', reason: 'missing' },
    ])
  })

  test('a candidate after a descriptorless data URL is still checked', () => {
    const files = new Map([
      ['/index.html', page('<img srcset="data:image/png;base64,AAAA, /missing.png 2x">')],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/missing.png', reason: 'missing' },
    ])
  })

  test('a candidate after a data URL with a descriptor is still checked', () => {
    const files = new Map([
      ['/index.html', page('<img srcset="data:image/png;base64,AAAA 1x, /b.png 2x">')],
      ['/b.png', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([])
  })

  test('a comma-and-space separated pair with no descriptors yields both', () => {
    const files = new Map([
      ['/index.html', page('<img srcset="/a.png, /b.png">')],
      ['/a.png', ''],
    ])
    expect(findBrokenLinks(files)).toEqual([
      { page: '/index.html', target: '/b.png', reason: 'missing' },
    ])
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
