import { Page } from '@playwright/test';
import { ConfigManager } from '../config/ConfigManager';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a specific URL path relative to the configured baseUrl.
   */
  public async navigate(path = ''): Promise<void> {
    const config = ConfigManager.getInstance().getConfig();
    // Since the login page in the demo is at the base URL of our configuration,
    // we handle URL joining safely.
    const targetUrl = path ? `${config.baseUrl}${path}` : config.baseUrl;
    console.log(`[BasePage] Navigating to: ${targetUrl}`);
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Retrieves the title of the current page.
   */
  public async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Retrieves the current page URL.
   */
  public async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Retrieves the logged-in employee/user name from the top header dropdown.
   */
  public async getLoggedInUsername(): Promise<string> {
    const dropdownLocator = this.page.locator('.oxd-userdropdown-name');
    await dropdownLocator.waitFor({ state: 'visible', timeout: 15000 });
    const rawName = await dropdownLocator.innerText();
    return rawName.trim();
  }

  /**
   * Retrieves a standard seeded employee name from the PIM list dynamically.
   * This handles volatile database resets and guarantees the employee exists in PIM.
   */
  public async getSeededEmployeeName(): Promise<string> {
    const config = ConfigManager.getInstance().getConfig();
    const rootUrl = config.baseUrl.replace(/\/auth\/login\/?$/, '');
    const targetUrl = `${rootUrl}/pim/viewEmployeeList`;
    console.log(`[BasePage] Navigating to PIM list to fetch a valid employee name...`);
    
    const originalUrl = this.page.url();
    
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        attempts++;
        await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const firstRow = this.page.locator('.oxd-table-body .oxd-table-card').first();
        await firstRow.waitFor({ state: 'visible', timeout: 15000 });
        
        const cells = firstRow.locator('.oxd-table-cell');
        const firstName = await cells.nth(2).innerText();
        const lastName = await cells.nth(3).innerText();
        const employeeName = `${firstName.trim()} ${lastName.trim()}`;
        
        console.log(`[BasePage] Found seeded employee: "${employeeName}"`);
        // Navigate back
        await this.page.goto(originalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        return employeeName;
      } catch (error) {
        console.warn(`[BasePage] PIM list navigation attempt ${attempts} failed: ${(error as Error).message}`);
        if (attempts >= maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(2000);
      }
    }
    throw new Error('[BasePage] Failed to fetch seeded employee name.');
  }
}
