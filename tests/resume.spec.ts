import { test, expect } from '@playwright/test'
import { person } from './support/site-config.mts'

test.describe('Resume Page', () => {
  test('offers a PDF download and hides screen chrome when printed', async ({ page, request }) => {
    await page.goto('/resume/')
    await expect(page.locator('main h1')).toHaveText(`Resume — ${person.name}`)
    const download = page.getByRole('link', { name: 'Download PDF', exact: true })
    await expect(download).toBeVisible()
    await expect(download).toHaveAttribute('href', '/resume.pdf')
    const pdf = await request.get('/resume.pdf')
    expect(pdf.status()).toBe(200)
    expect(pdf.headers()['content-type']).toBe('application/pdf')
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')
    await page.emulateMedia({ media: 'print' })
    await expect(download).toBeHidden()
    await expect(page.locator('header')).toBeHidden()
    await expect(page.locator('footer')).toBeHidden()
    await expect(page.locator('main')).toContainText(person.name)
    await expect(page.locator('main')).toContainText(person.phone)
    await expect(page.locator('main')).toContainText(person.email)
    // A link whose text hides its URL prints the URL; contact links already show theirs.
    const project = page.locator('main li a[href="https://github.com/pdemirdjian/volume-price-analysis"]')
    expect(await project.evaluate((link) => getComputedStyle(link, '::after').content))
      .toContain('github.com/pdemirdjian/volume-price-analysis')
    expect(await page.locator('.contact-row a[href^="https://"]').first().evaluate((link) => getComputedStyle(link, '::after').content))
      .toBe('none')
  })
  test('should load resume page', async ({ page }) => {
    await page.goto('/resume/')

    // Check title
    await expect(page).toHaveTitle(/Pete Demirdjian/)

    await expect(page.locator('main h2')).toHaveText([
      'Contact Info',
      'Experience',
      'Skills',
      'Selected Projects & Open Source',
      'Education',
    ])
  })

  test('every job heading contains exactly one dates span', async ({ page }) => {
    await page.goto('/resume/')

    const jobHeadings = page.locator('main h4')
    await expect(jobHeadings.first()).toBeVisible()

    for (const heading of await jobHeadings.all()) {
      await expect(heading.locator('.dates')).toHaveCount(1)
      await expect(heading.locator('span.dates')).toHaveCount(1)
    }
  })

  test('should have contact information from Person', async ({ page }) => {
    await page.goto('/resume/')

    const contactRow = page.locator('p.contact-row')

    const emailLink = contactRow.getByRole('link', { name: person.email })
    await expect(emailLink).toHaveAttribute('href', `mailto:${person.email}`)

    await expect(contactRow.locator('span')).toHaveText(person.phone)

    const linkedinLink = contactRow.getByRole('link', { name: /linkedin/i })
    await expect(linkedinLink).toHaveAttribute('href', person.linkedin)
    await expect(linkedinLink).toHaveAttribute('rel', 'noopener')
    await expect(linkedinLink).toHaveAttribute('target', '_blank')
  })

  test('should navigate from home to resume', async ({ page }) => {
    await page.goto('/')

    await page.locator('header nav').getByRole('link', { name: 'Resume', exact: true }).click()

    // Verify we're on the resume page
    await expect(page).toHaveURL(/\/resume\/$/)
    await expect(page.getByRole('heading', { name: 'Contact Info', exact: true })).toBeVisible()
  })
})
