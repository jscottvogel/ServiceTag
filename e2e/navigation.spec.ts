import { test, expect } from '@playwright/test'

test.describe('Navigation E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard')
    })

    test('should display navigation bar', async ({ page }) => {
        await expect(page.getByText('ServiceTag')).toBeVisible()
    })

    test('should navigate between pages', async ({ page }) => {
        // Navigate to Tags
        await page.getByRole('link', { name: /Tags/i }).click()
        await expect(page).toHaveURL('/tags')

        // Navigate to Profile
        await page.getByRole('link', { name: /Profile/i }).click()
        await expect(page).toHaveURL('/profile')

        // Navigate back to Dashboard
        await page.getByRole('link', { name: /Dashboard/i }).click()
        await expect(page).toHaveURL('/dashboard')
    })

    test('should highlight active navigation link', async ({ page }) => {
        const dashboardLink = page.getByRole('link', { name: /Dashboard/i }).first()
        await expect(dashboardLink).toHaveClass(/active/)
    })

    test('should display sign out button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible()
    })

    test('should toggle mobile menu', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        const menuButton = page.getByRole('button', { name: /menu/i })
        await menuButton.click()

        // Mobile menu should be visible
        const mobileMenu = page.locator('.mobile-menu')
        await expect(mobileMenu).toBeVisible()

        // Click again to close
        await menuButton.click()
        await expect(mobileMenu).not.toBeVisible()
    })

    test('should navigate from mobile menu', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        const menuButton = page.getByRole('button', { name: /menu/i })
        await menuButton.click()

        // Click Tags in mobile menu
        const mobileTags = page.locator('.mobile-nav-link').filter({ hasText: 'Tags' })
        await mobileTags.click()

        await expect(page).toHaveURL('/tags')
    })

    test('should display logo with animation', async ({ page }) => {
        const logo = page.locator('.logo-icon')
        await expect(logo).toBeVisible()
    })
})
