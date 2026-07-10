import { expect, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';

export class DropdownPage extends BasePage {
  private dropdown: UIElement;
  private dropdownLink: UIElement;
  private addRemoveLink: UIElement;
  private addElementBtn: UIElement;
  private deleteElementBtn: UIElement;
  private basicAuthLink: UIElement;

  constructor(page: Page) {
    super(page);
    this.dropdown = new UIElement(page, '#dropdown', 'Dropdown select element');
    this.dropdownLink = new UIElement(page, 'a[href="/dropdown"]', 'Dropdown link');
    this.addRemoveLink = new UIElement(page, 'a[href="/add_remove_elements/"]', 'Add/Remove Elements link');
    this.addElementBtn = new UIElement(page, 'button[onclick="addElement()"]', 'Add Element button');
    this.deleteElementBtn = new UIElement(page, 'button.added-manually', 'Delete element button');
    this.basicAuthLink = new UIElement(page, 'a[href="/basic_auth"]', 'Basic Auth link');
  }

  /**
   * Navigates to the dropdown page.
   */
  public async navigateToPage(): Promise<void> {
    await this.page.goto("https://the-internet.herokuapp.com/"); 
  }

  /**
   * click on dropdown link
   */
  public async clickDropdownLink(): Promise<void> {
    await this.dropdownLink.waitForVisible();
    await this.dropdownLink.click();
  }

  /**
   * Selects an option from the dropdown select list.
   */
  public async selectOptionByLabel(label: string): Promise<void> {
    await this.dropdown.waitForVisible();
    await this.dropdown.selectOption(label);
  }

  /**
   * Gets the currently selected option's visible text.
   */
  public async getSelectedOptionText(): Promise<string> {
    return await this.dropdown.getSelectedText();
  }

  /**
   * Clicks the Add/Remove Elements link, then clicks the Add Element button.
   */
  public async clickAddElementButton(): Promise<void> {
    const url = this.page.url();
    if (!url.includes('/add_remove_elements/')) {
      await this.addRemoveLink.waitForVisible();
      await this.addRemoveLink.click();
    }
    await this.addElementBtn.waitForVisible();
    await this.addElementBtn.click();
  }

  /**
   * Verifies if the Delete element is visible.
   */
  public async isDeleteElementVisible(): Promise<boolean> {
    await this.deleteElementBtn.waitForVisible();
    return await this.deleteElementBtn.isVisible();
  }

  /**
   * Clicks the Delete element.
   */
  public async clickDeleteElement(): Promise<void> {
    await this.deleteElementBtn.waitForVisible();
    await this.deleteElementBtn.click();
  }

  /**
   * Verifies if the Delete element is not visible.
   */
  public async isDeleteElementHidden(): Promise<boolean> {
    await this.deleteElementBtn.waitForHidden();
    return !(await this.deleteElementBtn.isVisible());
  }
  /**
   * Clicks the Basic Auth link.
   */
  public async clickBasicAuthLink(): Promise<void> {
    await this.basicAuthLink.waitForVisible();
    await this.basicAuthLink.click();
  }

  /**
   * Verifies if the login alert dialog is displayed.
   */
  public async isLoginAlertDialogDisplayed(): Promise<boolean> {
    return await this.page.evaluate(() => typeof window.prompt === 'function');
  }

  /**
   * Fills the alert dialog with the given credentials.
   */
  public async fillAlertDialog(username: string, password: string): Promise<void> {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    await this.page.setExtraHTTPHeaders({
      Authorization: `Basic ${credentials}`
    });
    await this.page.goto('https://the-internet.herokuapp.com/basic_auth');
    await expect(this.page).toHaveURL(/basic_auth/);
    await expect(this.page.locator('p')).toContainText('Congratulations!');
    console.log("Basic auth is working fine.");
  }
}
