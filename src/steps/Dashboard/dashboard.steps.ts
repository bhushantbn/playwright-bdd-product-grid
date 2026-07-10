import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../hooks/hooks';
import { ConfigManager } from '../../config/ConfigManager';

Given('User is on the dashboard page', async function (this: CustomWorld) {
  const config = ConfigManager.getInstance().getConfig();
  const rootUrl = config.baseUrl.replace(/\/auth\/login\/?$/, '');
  const dashboardUrl = `${rootUrl}/dashboard/index`;
  console.log(`[DashboardSteps] Navigating directly to: ${dashboardUrl}`);
  await this.page!.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
  
  // Safe fallback: if session expired or failed, perform manual login
  if (this.page!.url().includes('/auth/login')) {
    console.log('[DashboardSteps] Redirected to login page. Performing fallback login...');
    await this.loginPage.login('Admin', 'admin123');
  }
  
  await this.page!.locator('.oxd-sidepanel').waitFor({ state: 'visible', timeout: 15000 });
});

Then('User should see dashboard header {string}', async function (this: CustomWorld, expectedHeader: string) {
  await this.dashboardPage.waitForDashboardHeader();
  const actualHeader = await this.dashboardPage.getHeaderTitle();
  expect(actualHeader).toBe(expectedHeader);
});

Then('User should see the sidebar navigation menu', async function (this: CustomWorld) {
  const isVisible = await this.dashboardPage.isSidebarVisible();
  expect(isVisible).toBe(true);
});

Then('User should see dashboard widgets:', async function (this: CustomWorld, dataTable) {
  const widgets = dataTable.raw().map((row: string[]) => row[0]);
  for (const widget of widgets) {
    const isVisible = await this.dashboardPage.isWidgetVisible(widget);
    expect(isVisible).toBe(true);
  }
});

When('User clicks sidebar menu item {string}', async function (this: CustomWorld, menuItem: string) {
  await this.dashboardPage.clickSidebarMenuItem(menuItem);
});

Then('User should see topbar header {string}', async function (this: CustomWorld, expectedHeader: string) {
  const actualHeader = await this.dashboardPage.getHeaderTitle();
  expect(actualHeader).toContain(expectedHeader);
});

When('User logs out', async function (this: CustomWorld) {
  await this.secureAreaPage.logout();
});

When('User clicks Quick Launch button {string}', async function (this: CustomWorld, buttonTitle: string) {
  await this.dashboardPage.clickQuickLaunchButton(buttonTitle);
});

Then('User should be redirected to the URL path {string}', async function (this: CustomWorld, expectedPath: string) {
  await expect(this.page!).toHaveURL(new RegExp(expectedPath), { timeout: 15000 });
});

When('User hovers over Quick Launch button {string}', async function (this: CustomWorld, buttonTitle: string) {
  await this.dashboardPage.hoverQuickLaunchButton(buttonTitle);
});

Then('the Quick Launch button {string} should display orange hover styles', async function (this: CustomWorld, buttonTitle: string) {
  const styles = await this.dashboardPage.getQuickLaunchButtonColor(buttonTitle);
  const isOrangeColor = styles.color.includes('255, 123, 29') || styles.backgroundColor.includes('255, 123, 29');
  expect(isOrangeColor).toBe(true);
});
