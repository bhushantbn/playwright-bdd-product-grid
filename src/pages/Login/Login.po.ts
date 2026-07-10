import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';

export class LoginPage extends BasePage {
  private usernameInput: UIElement;
  private passwordInput: UIElement;
  private submitButton: UIElement;
  private alertMessage: UIElement;
  private forgotPasswordLink: UIElement;

  constructor(page: Page) {
    super(page);
    this.usernameInput = new UIElement(page, 'input[name="username"]', 'Username input field');
    this.passwordInput = new UIElement(page, 'input[name="password"]', 'Password input field');
    this.submitButton = new UIElement(page, 'button[type="submit"]', 'Login submit button');
    this.alertMessage = new UIElement(page, '.oxd-alert-content-text', 'Invalid credentials alert message');
    this.forgotPasswordLink = new UIElement(page, '.orangehrm-login-forgot', 'Forgot your password link');
  }

  /**
   * Submits the credentials to log in.
   */
  public async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Enters the username value.
   */
  public async enterUsername(username: string): Promise<void> {
    await this.usernameInput.waitForVisible(8000);
    await this.usernameInput.fill(username);
  }

  /**
   * Enters the password value.
   */
  public async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the login submit button.
   */
  public async clickLoginButton(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Clicks the "Forgot your password?" link.
   */
  public async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.waitForVisible(8000);
    await this.forgotPasswordLink.click();
  }

  /**
   * Retrieves the alert text from the invalid credentials alert banner.
   */
  public async getAlertText(): Promise<string> {
    await this.alertMessage.waitForVisible(5000);
    return await this.alertMessage.getText();
  }

  /**
   * Helper to verify if alert message is visible.
   */
  public async isAlertVisible(): Promise<boolean> {
    return await this.alertMessage.isVisible();
  }
}
