import { chromium } from '@playwright/test'
import { resolve } from 'node:path'
import { createPublishServer } from '../tests/support/netlify-static-server.mts'
import { person } from '../tests/support/site-config.mts'

const publishDir = process.env.PUBLISH_DIR ?? 'public'
const server = createPublishServer(publishDir)
await new Promise<void>((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

try {
  // A launch failure must fail the Netlify build with Chromium's original error.
  const browser = await chromium.launch()
  try {
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('No PDF render server address')
    const page = await browser.newPage({ colorScheme: 'light' })
    const response = await page.goto(`http://127.0.0.1:${address.port}/resume/`)
    if (!response?.ok()) throw new Error(`Resume page returned ${response?.status()}`)
    await page.emulateMedia({ media: 'print' })
    await page.evaluate(() => document.fonts.ready)
    // Chromium writes the HTML document title as the PDF Title, so name the
    // document after Person rather than the site's page title.
    await page.evaluate((title) => { document.title = title }, `Resume — ${person.name}`)
    await page.pdf({
      path: resolve(publishDir, 'resume.pdf'),
      format: 'Letter',
      preferCSSPageSize: true,
      printBackground: true,
    })
    console.log(`Generated ${publishDir}/resume.pdf`)
  } finally {
    await browser.close()
  }
} finally {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}
