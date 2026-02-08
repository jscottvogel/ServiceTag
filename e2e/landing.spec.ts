import { test, expect } from '@playwright/test'

test.describe('Landing Page E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should display landing page correctly', async ({ page }) => {
        // Check hero section
        await expect(page.getByRole('heading', { name: /Manage Your Services/i })).toBeVisible()
        await expect(page.getByText(/Like Never Before/i)).toBeVisible()

        // Check CTA buttons
        await expect(page.getByRole('button', { name: /Get Started Free/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /Watch Demo/i })).toBeVisible()
    })

    test('should navigate to auth page when clicking get started', async ({ page }) => {
        await page.getByRole('button', { name: /Get Started Free/i }).click()
        await expect(page).toHaveURL('/auth')
    })

    test('should display all feature cards', async ({ page }) => {
        await expect(page.getByText('Lightning Fast')).toBeVisible()
        await expect(page.getByText('Secure by Default')).toBeVisible()
        await expect(page.getByText('Mobile First')).toBeVisible()
        await expect(page.getByText('Real-time Sync')).toBeVisible()
    })

    test('should display stats section', async ({ page }) => {
        await expect(page.getByText('99.9%')).toBeVisible()
        await expect(page.getByText('Uptime')).toBeVisible()
        await expect(page.getByText('<100ms')).toBeVisible()
        await expect(page.getByText('Response Time')).toBeVisible()
    })

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        await expect(page.getByRole('heading', { name: /Manage Your Services/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /Get Started Free/i })).toBeVisible()
    })

    test('should have proper SEO meta tags', async ({ page }) => {
        const title = await page.title()
        expect(title).toContain('ServiceTag')

        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
        expect(metaDescription).toBeTruthy()
    })
})
