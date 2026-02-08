import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication
        await page.goto('/dashboard')
    })

    test('should display dashboard header', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
        await expect(page.getByText(/Welcome back/i)).toBeVisible()
    })

    test('should display stat cards', async ({ page }) => {
        await expect(page.getByText('Total Tags')).toBeVisible()
        await expect(page.getByText('Active')).toBeVisible()
        await expect(page.getByText('Completed')).toBeVisible()
        await expect(page.getByText('Pending')).toBeVisible()
    })

    test('should display quick actions', async ({ page }) => {
        await expect(page.getByText('Quick Actions')).toBeVisible()
        await expect(page.getByText('New Service Tag')).toBeVisible()
        await expect(page.getByText('View All Tags')).toBeVisible()
        await expect(page.getByText('My Profile')).toBeVisible()
        await expect(page.getByText('Analytics')).toBeVisible()
    })

    test('should navigate to tags page when clicking view all tags', async ({ page }) => {
        await page.getByText('View All Tags').click()
        await expect(page).toHaveURL('/tags')
    })

    test('should navigate to profile when clicking my profile', async ({ page }) => {
        await page.getByText('My Profile').click()
        await expect(page).toHaveURL('/profile')
    })

    test('should display navigation bar', async ({ page }) => {
        await expect(page.getByText('ServiceTag')).toBeVisible()
        await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /Tags/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible()
    })

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

        // Mobile menu should be visible
        const menuButton = page.getByRole('button', { name: /menu/i })
        await expect(menuButton).toBeVisible()
    })

    test('should open mobile menu on mobile devices', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        const menuButton = page.getByRole('button', { name: /menu/i })
        await menuButton.click()

        // Mobile navigation links should be visible
        const mobileLinks = page.locator('.mobile-nav-link')
        await expect(mobileLinks.first()).toBeVisible()
    })
})
