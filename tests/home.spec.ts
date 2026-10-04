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

  test('should display profile image', async ({ page }) => {
    await page.goto('/')
    
    // Check image loads
    const img = page.locator('img[alt="picture-of-me"]')
    await expect(img).toBeVisible()
  })

  test('should have footer with license info', async ({ page }) => {
    await page.goto('/')
    
    // Check footer exists and contains copyright
    await expect(page.locator('text=/© \\d{4} Peter Demirdjian/')).toBeVisible()
    await expect(page.getByRole('link', { name: /CC BY-NC-ND 4\.0/ })).toBeVisible()
  })
})
