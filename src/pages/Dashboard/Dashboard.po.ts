import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';

export class DashboardPage extends BasePage {
  private headerTitle: UIElement;
  private sidebarMenu: UIElement;

  constructor(page: Page) {
    super(page);
    this.headerTitle = new UIElement(page, '.oxd-topbar-header-title', 'Topbar header title');
    this.sidebarMenu = new UIElement(page, '.oxd-sidepanel', 'Sidebar panel');
  }

  /**
   * Waits for the dashboard header title to be visible.
   */
  public async waitForDashboardHeader(): Promise<void> {
    await this.headerTitle.waitForVisible(15000);
  }

  /**
   * Retrieves the current topbar header title text.
   */
  public async getHeaderTitle(): Promise<string> {
    await this.headerTitle.waitForVisible(10000);
    const topbarText = await this.headerTitle.getText();
    
    const mainTitle = this.page.locator('.orangehrm-main-title').first();
    if (await mainTitle.isVisible()) {
      const mainTitleText = await mainTitle.innerText();
      return `${topbarText} | ${mainTitleText}`;
    }
    
    return topbarText;
  }

  /**
   * Checks if the sidebar menu container is visible.
   */
  public async isSidebarVisible(): Promise<boolean> {
    return await this.sidebarMenu.isVisible();
  }

  /**
   * Checks if a sidebar menu item with the given text is visible.
   */
  public async isSidebarMenuItemVisible(itemName: string): Promise<boolean> {
    const menuItem = this.page.locator('.oxd-main-menu-item', { hasText: itemName });
    return await menuItem.isVisible();
  }

  /**
   * Clicks on a specific sidebar menu link by its text.
   */
  public async clickSidebarMenuItem(itemName: string): Promise<void> {
    const menuItem = this.page.locator('.oxd-main-menu-item', { hasText: itemName });
    await menuItem.waitFor({ state: 'visible', timeout: 20000 });
    await menuItem.click();
  }

  /**
   * Checks if a dashboard widget containing the given name is visible.
   */
  public async isWidgetVisible(widgetName: string): Promise<boolean> {
    const widget = this.page.locator('.orangehrm-dashboard-widget', { hasText: widgetName });
    return await widget.first().isVisible();
  }

  /**
   * Clicks on a specific Quick Launch button by its title attribute.
   */
  public async clickQuickLaunchButton(buttonTitle: string): Promise<void> {
    const button = this.page.locator(`.orangehrm-quick-launch-icon[title="${buttonTitle}"], button[title="${buttonTitle}"]`);
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
  }

  /**
   * Hovers over a specific Quick Launch button by its title.
   */
  public async hoverQuickLaunchButton(buttonTitle: string): Promise<void> {
    const button = this.page.locator(`.orangehrm-quick-launch-icon[title="${buttonTitle}"], button[title="${buttonTitle}"]`);
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.hover();
    // Wait for CSS transition to settle
    await this.page.waitForTimeout(1000);
  }

  /**
   * Retrieves the CSS color properties of a specific Quick Launch button.
   */
  public async getQuickLaunchButtonColor(buttonTitle: string): Promise<{ color: string, backgroundColor: string }> {
    const button = this.page.locator(`.orangehrm-quick-launch-icon[title="${buttonTitle}"], button[title="${buttonTitle}"]`);
    return await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor
      };
    });
  }
}
