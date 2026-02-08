import { test, expect } from '@playwright/test'

test.describe('Service Tags E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tags')
    })

    test('should display service tags page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Service Tags' })).toBeVisible()
        await expect(page.getByText(/Manage all your service tags/i)).toBeVisible()
    })

    test('should display new tag button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /New Tag/i })).toBeVisible()
    })

    test('should display filter buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Active' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Pending' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()
    })

    test('should open create modal when clicking new tag', async ({ page }) => {
        await page.getByRole('button', { name: /New Tag/i }).click()

        await expect(page.getByText('Create New Service Tag')).toBeVisible()
        await expect(page.getByPlaceholderText('Enter tag title')).toBeVisible()
    })

    test('should close modal when clicking cancel', async ({ page }) => {
        await page.getByRole('button', { name: /New Tag/i }).click()
        await page.getByRole('button', { name: 'Cancel' }).click()

        await expect(page.getByText('Create New Service Tag')).not.toBeVisible()
    })

    test('should validate required fields in create form', async ({ page }) => {
        await page.getByRole('button', { name: /New Tag/i }).click()

        const createButton = page.getByRole('button', { name: 'Create Tag' })
        await createButton.click()

        // Form should not submit without required title
        await expect(page.getByText('Create New Service Tag')).toBeVisible()
    })

    test('should fill out create tag form', async ({ page }) => {
        await page.getByRole('button', { name: /New Tag/i }).click()

        await page.getByPlaceholderText('Enter tag title').fill('Test Tag')
        await page.getByPlaceholderText('Enter tag description').fill('Test Description')
        await page.getByPlaceholderText(/Development, Design/i).fill('Development')

        await page.locator('select').first().selectOption('high')
        await page.locator('select').last().selectOption('active')

        // Verify form is filled
        await expect(page.getByPlaceholderText('Enter tag title')).toHaveValue('Test Tag')
    })

    test('should filter tags by status', async ({ page }) => {
        // Click active filter
        await page.getByRole('button', { name: 'Active' }).click()

        // Active button should have active class
        const activeButton = page.getByRole('button', { name: 'Active' })
        await expect(activeButton).toHaveClass(/active/)
    })

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        await expect(page.getByRole('heading', { name: 'Service Tags' })).toBeVisible()
        await expect(page.getByRole('button', { name: /New Tag/i })).toBeVisible()
    })

    test('should display empty state when no tags', async ({ page }) => {
        // Assuming no tags exist
        const emptyState = page.getByText(/No tags found/i)
        if (await emptyState.isVisible()) {
            await expect(page.getByText(/Create your first service tag/i)).toBeVisible()
        }
    })
})
