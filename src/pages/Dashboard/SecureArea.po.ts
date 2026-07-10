import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';

export class SecureAreaPage extends BasePage {
  private userDropdown: UIElement;
  private logoutLink: UIElement;

  constructor(page: Page) {
    super(page);
    this.userDropdown = new UIElement(page, '.oxd-userdropdown-tab', 'User Profile Dropdown');
    this.logoutLink = new UIElement(page, 'a:has-text("Logout")', 'Logout option link');
  }

  /**
   * Clicks the profile dropdown and logs out.
   */
  public async logout(): Promise<void> {
    await this.userDropdown.waitForVisible(15000);
    await this.userDropdown.click();
    await this.logoutLink.waitForVisible(5000);
    await this.logoutLink.click();
  }
}
