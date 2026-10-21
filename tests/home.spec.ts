import { test, expect } from '@playwright/test'
import { heroActions, menuEntries, person, siteTitle } from './support/site-config.mts'

test.describe('Home Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/Pete Demirdjian/)
    
    // Check main content exists - use specific h2
    await expect(page.locator('h2#about-me')).toContainText('About Me')
  })

  test('should render navigation from config', async ({ page }) => {
    await page.goto('/')

    const nav = page.locator('header nav')
    const entries = [
      ...menuEntries,
      { name: 'LinkedIn', url: person.linkedin },
      { name: 'GitHub', url: person.github },
      { name: 'Email', url: `mailto:${person.email}` },
    ]
    await expect(nav.getByRole('link')).toHaveCount(entries.length + 1)
    await expect(nav.getByRole('link', { name: siteTitle, exact: true })).toHaveAttribute('href', '/')
    const links = nav.locator('ul').getByRole('link')
    await expect(links).toHaveCount(entries.length)
    await expect(links).toHaveText(entries.map(({ name }) => name))
    for (const { name, url } of entries) {
      const link = nav.locator('ul').getByRole('link', { name, exact: true })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', url)
    }
  })

  test('should render hero actions from config', async ({ page }) => {
    await page.goto('/')

    const hero = page.locator('.hero-actions')
    const links = hero.getByRole('link')
    await expect(links).toHaveCount(heroActions.length)
    await expect(links).toHaveText(heroActions.map(({ name }) => name))
    for (const [index, { name, url }] of heroActions.entries()) {
      const link = hero.getByRole('link', { name, exact: true })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', url)
      await expect(link).toHaveAttribute('class', index === 0 ? 'btn btn-primary' : 'btn')
      if (url.startsWith('http')) {
        await expect(link).toHaveAttribute('rel', 'noopener')
        await expect(link).toHaveAttribute('target', '_blank')
      } else {
        await expect(link).not.toHaveAttribute('rel')
        await expect(link).not.toHaveAttribute('target')
      }
    }
  })

  test('should display headshot in the hero', async ({ page }) => {
    await page.goto('/')

    const img = page.locator('.hero').getByRole('img', { name: 'Portrait of Peter Demirdjian' })
    await expect(img).toBeVisible()
    await expect(img).toHaveAttribute('width', '200')
    await expect(img).toHaveAttribute('height', '200')
    await expect(img).toHaveAttribute('fetchpriority', 'high')
    await expect(img).not.toHaveAttribute('loading', 'lazy')
    await expect(img).toHaveAttribute('srcset', /\.webp 1x, .*\.webp 2x/)
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
    const box = await img.boundingBox()
    const isMobileLayout = await page.evaluate(() => window.matchMedia('(max-width: 700px)').matches)
    expect(box?.width).toBeCloseTo(isMobileLayout ? 112 : 200, 0)
    expect(box?.height).toBeCloseTo(box!.width, 0)
  })

  test('should list selected work, linking public projects only', async ({ page }) => {
    await page.goto('/')

    const items = page.locator('ul.projects li')
    await expect(items).toHaveCount(4)
    await expect(items.filter({ hasText: 'Homelab' }).getByRole('link')).toHaveCount(0)
    await expect(page.locator('ul.projects a[href="https://github.com/pdemirdjian/volume-price-analysis"]')).toBeVisible()
  })

  test('nav fits on one row on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/')
    const tops = await page.locator('header nav ul > li').evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().top)))
    expect(new Set(tops).size).toBe(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('should have footer with license info', async ({ page }) => {
    await page.goto('/')
    
    // Check footer exists and contains copyright
    await expect(page.locator('text=/© \\d{4} Peter Demirdjian/')).toBeVisible()
    await expect(page.getByRole('link', { name: /CC BY-NC-ND 4\.0/ })).toBeVisible()
  })
})
