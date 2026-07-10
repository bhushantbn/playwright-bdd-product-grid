import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';

export class ForgotPasswordPage extends BasePage {
  private usernameInput: UIElement;
  private resetButton: UIElement;
  private cancelButton: UIElement;
  private successHeader: UIElement;
  private validationError: UIElement;

  constructor(page: Page) {
    super(page);
    this.usernameInput = new UIElement(page, 'input[name="username"]', 'Reset username input field');
    this.resetButton = new UIElement(page, 'button[type="submit"]', 'Reset Password button');
    this.cancelButton = new UIElement(page, 'button.orangehrm-forgot-password-button--cancel', 'Cancel button');
    // Using standard tag selector h6 as it matches OrangeHRM's card heading
    this.successHeader = new UIElement(page, 'h6', 'Success header message');
    this.validationError = new UIElement(page, '.oxd-input-field-error-message', 'Validation error message');
  }

  /**
   * Enters the username on the reset page.
   */
  public async enterUsername(username: string): Promise<void> {
    await this.usernameInput.waitForVisible(5000);
    await this.usernameInput.fill(username);
  }

  /**
   * Clicks the Reset Password button.
   */
  public async clickResetPassword(): Promise<void> {
    await this.resetButton.waitForVisible(5000);
    await this.resetButton.click({ timeout: 5000 });
  }

  /**
   * Clicks the Cancel button.
   */
  public async clickCancel(): Promise<void> {
    await this.cancelButton.waitForVisible(5000);
    await this.cancelButton.click();
  }

  /**
   * Retrieves the success title text.
   */
  public async getSuccessMessage(): Promise<string> {
    await this.successHeader.waitForVisible(8000);
    return await this.successHeader.getText();
  }

  /**
   * Retrieves the field validation error text.
   */
  public async getValidationError(): Promise<string> {
    await this.validationError.waitForVisible(5000);
    return await this.validationError.getText();
  }
}
