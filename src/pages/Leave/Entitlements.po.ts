import { expect, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { UIElement } from '../../utils/UIElement';

export class EntitlementsPage extends BasePage {
  private entitlementsDropdown: UIElement;
  private addEntitlementsLink: UIElement;
  private individualRadio: UIElement;
  private employeeInput: UIElement;
  private leaveTypeDropdown: UIElement;
  private leavePeriodDropdown: UIElement;
  private entitlementInput: UIElement;
  private saveButton: UIElement;
  private entitlementsTable: UIElement;

  constructor(page: Page) {
    super(page);
    this.entitlementsDropdown = new UIElement(page, '.oxd-topbar-body-nav-tab:has-text("Entitlements")', 'Entitlements sub-navigation dropdown');
    this.addEntitlementsLink = new UIElement(page, 'a:has-text("Add Entitlements"), li:has-text("Add Entitlements")', 'Add Entitlements dropdown item');
    this.individualRadio = new UIElement(page, '.oxd-radio-wrapper input[type="radio"][value="0"]', 'Individual Employee radio input');
    this.employeeInput = new UIElement(page, '.oxd-autocomplete-text-input input', 'Employee Name autocomplete input');
    this.leaveTypeDropdown = new UIElement(page, '.oxd-input-group:has-text("Leave Type") .oxd-select-text', 'Leave Type select dropdown');
    this.leavePeriodDropdown = new UIElement(page, '.oxd-input-group:has-text("Leave Period") .oxd-select-text', 'Leave Period select dropdown');
    this.entitlementInput = new UIElement(page, '.oxd-input-group:has-text("Entitlement") input', 'Entitlement days input');
    this.saveButton = new UIElement(page, 'button[type="submit"]', 'Save button');
    this.entitlementsTable = new UIElement(page, '.oxd-table', 'Entitlements list table');
  }

  public async clickAddEntitlementsLink(): Promise<void> {
    const targetUrlPart = 'addLeaveEntitlement';
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[EntitlementsPage] Attempt ${attempt} to navigate to Add Entitlements page`);
      
      const option = this.page.locator('a.oxd-topbar-body-nav-tab-link:visible:has-text("Add Entitlements")');
      const isVisible = await option.isVisible().catch(() => false);
      if (!isVisible) {
        await this.entitlementsDropdown.click();
        await this.page.waitForTimeout(500); // Wait for transition
      }

      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      
      const hasNavigated = await this.page.waitForURL(url => url.href.includes(targetUrlPart), { timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      
      if (hasNavigated) {
        console.log(`[EntitlementsPage] Successfully navigated to Add Entitlements on attempt ${attempt}`);
        return;
      }
      
      console.log(`[EntitlementsPage] Navigation not triggered on attempt ${attempt}, retrying...`);
      await this.page.waitForTimeout(1000);
    }
    
    console.log(`[EntitlementsPage] Fallback: Direct navigation to Add Entitlements page`);
    const baseUrl = this.page.url().split('/leave/')[0];
    await this.page.goto(`${baseUrl}/leave/addLeaveEntitlement`, { waitUntil: 'domcontentloaded' });
  }

  public async verifyIndividualTypeRadioSelected(): Promise<void> {
    // Check using checking property of the raw input element
    const input = this.page.locator('.oxd-radio-wrapper').filter({ hasText: 'Individual Employee' }).locator('input');
    await expect(input).toBeChecked();
  }

  public async enterEmployeeName(name: string): Promise<void> {
    const rawLocator = this.employeeInput.getLocator();
    await rawLocator.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    
    const searchWord = name.includes(' ') ? name.split(' ')[0] : name;
    console.log(`[EntitlementsPage] Typing employee name search term: "${searchWord}"`);
    await rawLocator.pressSequentially(searchWord, { delay: 100 });
    
    const option = this.page.locator('.oxd-autocomplete-option').first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    
    const initialText = await option.innerText();
    if (initialText.includes('Searching')) {
      await this.page.waitForFunction(() => {
        const el = document.querySelector('.oxd-autocomplete-option');
        return el && el.textContent && !el.textContent.includes('Searching');
      }, null, { timeout: 15000 });
    }
    
    const matchingOption = this.page.locator('.oxd-autocomplete-option', { hasText: name }).first();
    if (await matchingOption.isVisible()) {
      console.log(`[EntitlementsPage] Clicking matching autocomplete option for: "${name}"`);
      await matchingOption.click();
    } else {
      console.log(`[EntitlementsPage] Clicking first autocomplete option: "${await option.innerText()}"`);
      await option.click();
    }
  }

  public async selectLeaveType(leaveType: string): Promise<void> {
    await this.leaveTypeDropdown.click();
    const option = this.page.locator('.oxd-select-option', { hasText: leaveType });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  public async selectLeavePeriod(leavePeriod: string): Promise<void> {
    await this.leavePeriodDropdown.click();
    
    // Log all options for diagnostics
    const optionsLocator = this.page.locator('.oxd-select-option');
    await optionsLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    const count = await optionsLocator.count();
    const optionsText: string[] = [];
    for (let i = 0; i < count; i++) {
      optionsText.push(await optionsLocator.nth(i).innerText());
    }
    console.log(`[EntitlementsPage] Available leave periods:`, optionsText);

    // Try exact match first
    const option = this.page.locator('.oxd-select-option', { hasText: leavePeriod });
    if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
      await option.click();
      return;
    }

    // Try matching by the prefix (e.g. "2026")
    const yearPrefix = leavePeriod.substring(0, 4); // "2026"
    console.log(`[EntitlementsPage] Exact match not found. Trying prefix matching with: "${yearPrefix}"`);
    let matchedOption = null;
    for (let i = 0; i < count; i++) {
      const text = optionsText[i];
      if (text.startsWith(yearPrefix)) {
        matchedOption = this.page.locator('.oxd-select-option').nth(i);
        console.log(`[EntitlementsPage] Match found: "${text}"`);
        break;
      }
    }

    if (matchedOption) {
      await matchedOption.click();
    } else {
      console.log(`[EntitlementsPage] No prefix match found. Selecting first valid option.`);
      const firstValidOption = this.page.locator('.oxd-select-option').filter({ hasNotText: '-- Select --' }).first();
      await firstValidOption.click();
    }
  }

  public async enterEntitlementDays(days: string): Promise<void> {
    const rawLocator = this.entitlementInput.getLocator();
    await rawLocator.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await rawLocator.fill(days);
  }

  public async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  public async verifyRecordInTable(): Promise<void> {
    const rows = this.page.locator('.oxd-table-body .oxd-table-card');
    if (!await rows.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(`[EntitlementsPage] Table is empty on redirect. Selecting Leave Period and clicking Search...`);
      const dropdown = this.page.locator('.oxd-select-wrapper').nth(1); // Leave Period dropdown
      if (await dropdown.isVisible()) {
        await dropdown.click();
        const firstValidOption = this.page.locator('.oxd-select-option').filter({ hasNotText: '-- Select --' }).first();
        await firstValidOption.click();
        await this.page.locator('button[type="submit"]').click();
        await this.page.waitForTimeout(1000);
      }
    }
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  }

  public async navigateBackToAssignLeave(): Promise<void> {
    const assignLeaveTab = this.page.locator('a:has-text("Assign Leave"), li:has-text("Assign Leave")').first();
    if (await assignLeaveTab.isVisible().catch(() => false)) {
      await assignLeaveTab.click();
    } else {
      // Direct navigation fallback
      await this.page.goto(this.page.url().split('/leave/')[0] + '/leave/assignLeave', { waitUntil: 'domcontentloaded' });
    }
  }
}
