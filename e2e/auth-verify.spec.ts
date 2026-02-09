import { test, expect } from '@playwright/test';

test('protected routes should show authenticator', async ({ page }) => {
    await page.goto('/dashboard');
    // The Authenticator usually has a 'Sign In' header or button
    // We check for the presence of the Authenticator UI elements
    await expect(page.getByText('Sign In').first()).toBeVisible();
});
