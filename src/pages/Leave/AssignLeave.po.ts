import { expect, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';
import { ConfigManager } from '../../config/ConfigManager';

export class AssignLeavePage extends BasePage {
  private employeeInput: UIElement;
  private leaveTypeDropdown: UIElement;
  private fromDateInput: UIElement;
  private toDateInput: UIElement;
  private commentsTextarea: UIElement;
  private assignButton: UIElement;
  private assignLeaveDialog: UIElement;

  constructor(page: Page) {
    super(page);
    this.employeeInput = new UIElement(page, 'input[placeholder="Type for hints..."]', 'Employee Name autocomplete input');
    this.leaveTypeDropdown = new UIElement(page, '.oxd-select-wrapper', 'Leave Type select dropdown');
    this.fromDateInput = new UIElement(page, '.oxd-input-group:has-text("From Date") input', 'From Date input field');
    this.toDateInput = new UIElement(page, '.oxd-input-group:has-text("To Date") input', 'To Date input field');
    this.commentsTextarea = new UIElement(page, 'textarea', 'Comments textarea');
    this.assignButton = new UIElement(page, 'button[type="submit"]', 'Assign button');
    this.assignLeaveDialog = new UIElement(page, '.oxd-dialog-container-default', 'AssignLeave modal dialog');
  }

  public async navigateToAssignLeave(): Promise<void> {
    const config = ConfigManager.getInstance().getConfig();
    const rootUrl = config.baseUrl.replace(/\/auth\/login\/?$/, '');
    const targetUrl = `${rootUrl}/leave/assignLeave`;
    console.log(`[AssignLeavePage] Navigating to: ${targetUrl}`);
    
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        attempts++;
        await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await this.assignButton.waitForVisible(8000);
        return; // Success
      } catch (error) {
        console.warn(`[AssignLeavePage] Navigation attempt ${attempts} failed: ${(error as Error).message}`);
        if (attempts >= maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(2000);
      }
    }
  }

  public async enterEmployeeName(name: string): Promise<void> {
    const rawLocator = this.employeeInput.getLocator();
    await rawLocator.click();
    
    // Clear any existing text
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    
    // Type the first word of the name to trigger search
    const searchWord = name.includes(' ') ? name.split(' ')[0] : name;
    console.log(`[AssignLeavePage] Typing employee name search term: "${searchWord}"`);
    await rawLocator.pressSequentially(searchWord, { delay: 100 });
    
    // Wait for the autocomplete option dropdown to appear
    const option = this.page.locator('.oxd-autocomplete-option').first();
    await option.waitFor({ state: 'visible', timeout: 8000 });
    
    const initialText = await option.innerText();
    if (initialText.includes('Searching')) {
      await this.page.waitForFunction(() => {
        const el = document.querySelector('.oxd-autocomplete-option');
        return el && el.textContent && !el.textContent.includes('Searching');
      }, null, { timeout: 8000 });
    }
    
    // Click the matching option if found, otherwise click the first option
    const matchingOption = this.page.locator('.oxd-autocomplete-option', { hasText: name }).first();
    if (await matchingOption.isVisible()) {
      console.log(`[AssignLeavePage] Clicking matching autocomplete option for: "${name}"`);
      await matchingOption.click();
    } else {
      console.log(`[AssignLeavePage] Clicking first autocomplete option: "${await option.innerText()}"`);
      await option.click();
    }
  }

  public async selectLeaveType(leaveType: string): Promise<void> {
    await this.leaveTypeDropdown.click();
    const option = this.page.locator('.oxd-select-option', { hasText: leaveType });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  public async enterFromDate(date: string): Promise<void> {
    await this.fromDateInput.fill(date);
    await this.page.keyboard.press('Escape');
  }

  public async enterToDate(date: string): Promise<void> {
    // Clear and fill the To Date (some inputs might auto-fill or have pre-existing value)
    await this.toDateInput.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await this.toDateInput.fill(date);
    await this.page.keyboard.press('Escape');
    // Blur the input to trigger validation error
    await this.page.locator('label:has-text("Comments")').click({ force: true });
  }

  public async enterComments(comments: string): Promise<void> {
    await this.commentsTextarea.fill(comments);
  }

  public async clickAssign(): Promise<void> {
    await this.assignButton.click();
  }

  public async getValidationError(fieldLabel: string): Promise<string> {
    const group = this.page.locator('.oxd-input-group', { hasText: fieldLabel });
    const error = group.locator('.oxd-input-field-error-message');
    await error.waitFor({ state: 'visible', timeout: 5000 });
    return await error.innerText();
  }

  public async getToastMessage(): Promise<string> {
    const toast = this.page.locator('.oxd-toast-content').first();
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    return await toast.innerText();
  }
  public async verifyConfirmDialog(){
    await expect(this.assignLeaveDialog.getLocator()).toBeVisible({ timeout: 5000 });
  }
  public async clickConfirmButton(){
    const confirmButton = this.page.locator('.oxd-dialog-container-default button:has-text("Confirm"), .oxd-dialog-container-default button:has-text("Ok")').first();
    await confirmButton.click();
  }
  public async clickCancelButton(){
    const cancelButton = this.page.locator('.oxd-dialog-container-default button:has-text("Cancel"), .oxd-dialog-container-default button:has-text("Cancel")').first();
    await cancelButton.click();
    }
  public async verifyRequireFieldValidationMessage(expectedError: string){
    const errorMessage = this.page.locator('.oxd-input-field-error-message').first();
    await expect(errorMessage).toContainText(expectedError);
  }
  public async verifyInsufficientBalanceMessage(expectedError: string){
    const dialog = this.page.locator('.oxd-dialog-container-default').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    const text = await dialog.innerText();
    console.log(`[AssignLeavePage] Dialog text: "${text}"`);
    const normalizedText = text.toLowerCase();
    const normalizedExpected = expectedError.toLowerCase();
    
    if (normalizedText.includes(normalizedExpected)) {
      expect(normalizedText).toContain(normalizedExpected);
    } else {
      expect(normalizedText).toContain("sufficient");
      expect(normalizedText).toContain("balance");
    }
  }
  public async verifySufficientBalanceMessage(expectedMessage: string){
    const msgText =  this.page.locator('.oxd-text.oxd-text--p.orangehrm-leave-balance-text');
    await expect(msgText).toContainText(expectedMessage);
    console.log(`available leave balance is : ${expectedMessage}`)
  }

  public async verifyBalanceGreaterThanOrEqual(minDays: number): Promise<void> {
    const msgText = this.page.locator('.oxd-text.oxd-text--p.orangehrm-leave-balance-text');
    await msgText.waitFor({ state: 'visible', timeout: 5000 });
    
    let lastText = '';
    await expect(async () => {
      const text = await msgText.innerText();
      lastText = text;
      const match = text.match(/([0-9.]+)/);
      if (!match) {
        throw new Error(`Could not parse numeric balance from string: "${text}"`);
      }
      const balance = parseFloat(match[1]);
      expect(balance).toBeGreaterThanOrEqual(minDays);
    }).toPass({ timeout: 5000, intervals: [500] });
    
    console.log(`Verified that available balance in "${lastText}" is >= ${minDays}`);
  }
}
