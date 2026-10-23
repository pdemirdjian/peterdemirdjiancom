import { test, expect } from '@playwright/test'
import { parse } from 'smol-toml'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const hugoConfig = parse(
  readFileSync(path.resolve(__dirname, '../hugo.toml'), 'utf-8')
) as {
  title: string
  params: {
    description: string
    person: {
      name: string
      shortName: string
      jobTitle: string
      employer: string
      school: string
      email: string
      image: string
      linkedin: string
      github: string
    }
  }
}

const person = hugoConfig.params.person

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(hugoConfig.title)

    // Check meta description
    const description = await page.locator('meta[name="description"]').first()
    await expect(description).toHaveAttribute('content', hugoConfig.params.description)

    // Check Open Graph tags - use first() to handle multiple tags
    const ogTitle = await page.locator('meta[property="og:title"]').first()
    await expect(ogTitle).toHaveAttribute('content', /.+/) // Just check it has content

    const ogType = await page.locator('meta[property="og:type"]').first()
    await expect(ogType).toHaveAttribute('content', 'website')

    const ogUrl = await page.locator('meta[property="og:url"]').first()
    await expect(ogUrl).toHaveAttribute('content', /https:\/\/peterdemirdjian\.com/)

    const ogImage = await page.locator('meta[property="og:image"]').first()
    await expect(ogImage).toHaveAttribute(
      'content',
      /^https:\/\/peterdemirdjian\.com\/images\/.+\.jpg$/
    )

    // Check canonical link
    const canonical = await page.locator('link[rel="canonical"]').first()
    await expect(canonical).toHaveAttribute('href', /https:\/\/peterdemirdjian\.com/)
  })

  test('should have favicon', async ({ page }) => {
    await page.goto('/')

    // Check favicon exists
    const favicon = await page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', '/images/favicon.ico')
  })

  test('should render ProfilePage JSON-LD with Person on the home page', async ({ page }) => {
    await page.goto('/')

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent()
    const data = JSON.parse(jsonLd ?? '{}')

    expect(data['@context']).toBe('https://schema.org')
    expect(data['@type']).toBe('ProfilePage')
    expect(Number.isFinite(Date.parse(data.dateModified))).toBe(true)
    const entity = data.mainEntity
    expect(entity['@type']).toBe('Person')
    expect(entity.alternateName).toBe(person.shortName)
    expect(entity.worksFor).toEqual({ '@type': 'Organization', name: person.employer })
    expect(entity.alumniOf).toEqual({ '@type': 'CollegeOrUniversity', name: person.school })
    expect(entity.url).toBe('https://peterdemirdjian.com/')
    expect(entity.image).toMatch(/^https:\/\/peterdemirdjian\.com\/images\/.+\.jpg$/)
    expect(entity.sameAs).toEqual([person.linkedin, person.github])
    expect(entity.name).toBe(person.name)
    expect(entity.jobTitle).toBe(person.jobTitle)
    expect(entity.email).toBe(`mailto:${person.email}`)
  })
})

test('resume shows its last update and dateModified metadata', async ({ page }) => {
  await page.goto('/resume/')
  await expect(page.getByText(/^Last updated (January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2}$/)).toBeVisible()
  const modified = await page.locator('[itemscope] [itemprop="dateModified"]').getAttribute('datetime')
  expect(Number.isFinite(Date.parse(modified ?? ''))).toBe(true)
})
