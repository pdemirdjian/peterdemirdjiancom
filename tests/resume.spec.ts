import { test, expect } from '@playwright/test'
import { person } from './support/site-config.mts'

test.describe('Resume Page', () => {
  test('should load resume page', async ({ page }) => {
    await page.goto('/resume/')
    
    // Check title
    await expect(page).toHaveTitle(/Pete Demirdjian/)
    
    // Check resume content exists - look for h2 headings
    await expect(page.locator('h2').first()).toBeVisible()
    await expect(page.getByText('Contact Info').first()).toBeVisible()
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
