/**
 * Playwright Configuration Template
 *
 * Template Placeholders:
 * - {{BASE_URL}}: Application base URL (e.g., http://localhost:3000)
 * - {{PROJECT_NAME}}: Project name for test organization
 *
 * Features:
 * - Cross-browser testing (Chromium, Firefox, WebKit)
 * - Mobile viewport testing
 * - Screenshot on failure
 * - Video recording
 * - HTML reports
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.test' });

export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Test file pattern
  testMatch: '**/*.spec.ts',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI (adjust based on CI runner)
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || '{{BASE_URL}}',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'on-first-retry',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Global test timeout
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Configure projects for major browsers and devices
  projects: [
    // ==========================================================================
    // Desktop Browsers
    // ==========================================================================
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // ==========================================================================
    // Mobile Viewports
    // ==========================================================================
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // ==========================================================================
    // Branded Browsers (Optional)
    // ==========================================================================
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // ==========================================================================
  // Local Development Server
  // ==========================================================================
  webServer: {
    command: 'npm run dev',
    url: '{{BASE_URL}}',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // stdout: 'pipe',
    // stderr: 'pipe',
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Global setup/teardown (optional)
  // globalSetup: require.resolve('./e2e/global-setup.ts'),
  // globalTeardown: require.resolve('./e2e/global-teardown.ts'),
});

/**
 * Example Test File: e2e/example.spec.ts
 *
 * ```typescript
 * import { test, expect } from '@playwright/test';
 *
 * test.describe('Homepage', () => {
 *   test('should display the title', async ({ page }) => {
 *     await page.goto('/');
 *     await expect(page).toHaveTitle(/{{PROJECT_NAME}}/);
 *   });
 *
 *   test('should navigate to about page', async ({ page }) => {
 *     await page.goto('/');
 *     await page.click('text=About');
 *     await expect(page).toHaveURL('/about');
 *   });
 * });
 * ```
 */

/**
 * Example Page Object: e2e/pages/login.page.ts
 *
 * ```typescript
 * import { Page, Locator } from '@playwright/test';
 *
 * export class LoginPage {
 *   readonly page: Page;
 *   readonly emailInput: Locator;
 *   readonly passwordInput: Locator;
 *   readonly submitButton: Locator;
 *
 *   constructor(page: Page) {
 *     this.page = page;
 *     this.emailInput = page.getByLabel('Email');
 *     this.passwordInput = page.getByLabel('Password');
 *     this.submitButton = page.getByRole('button', { name: 'Sign in' });
 *   }
 *
 *   async goto() {
 *     await this.page.goto('/login');
 *   }
 *
 *   async login(email: string, password: string) {
 *     await this.emailInput.fill(email);
 *     await this.passwordInput.fill(password);
 *     await this.submitButton.click();
 *   }
 * }
 * ```
 */
