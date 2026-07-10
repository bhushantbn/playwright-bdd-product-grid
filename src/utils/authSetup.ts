import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_PATH = path.resolve(__dirname, '../../playwright/.auth/user.json');

export async function generateStorageState() {
  const dir = path.dirname(AUTH_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('[AuthSetup] Generating authenticated storage state...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="username"]', { timeout: 45000 });
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard redirect to ensure session cookies are set
    await page.waitForURL(/.*dashboard/, { timeout: 45000 });
    await context.storageState({ path: AUTH_PATH });
    console.log('[AuthSetup] Storage state successfully saved.');
  } catch (error) {
    console.error('[AuthSetup] Failed to generate storage state:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  generateStorageState();
}
