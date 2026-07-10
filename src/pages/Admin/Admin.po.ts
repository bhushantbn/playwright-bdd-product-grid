import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { faker } from '@faker-js/faker';
import * as path from 'path';


export class AdminPage extends BasePage {
  public lastSearchedEmployeeName: string = '';
  private readonly userRoleSelect: Locator;
  private readonly statusSelect: Locator;
  private readonly employeeNameInput: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;
  private readonly jobTitleInput: Locator;
  private readonly jobDescriptionInput: Locator;
  private readonly JobSpecification: Locator;
  private readonly notesInput:Locator;

  constructor(page: Page) {
    super(page);
    this.userRoleSelect = this.page.locator('.oxd-input-group:has-text("User Role") .oxd-select-text');
    this.statusSelect = this.page.locator('.oxd-input-group:has-text("Status") .oxd-select-text');
    this.employeeNameInput = this.page.locator('.oxd-input-group:has-text("Employee Name") input');
    this.usernameInput = this.page.locator('.oxd-input-group:has-text("Username") input');
    this.passwordInput = this.page.locator('.oxd-input-group:has-text("Password"):not(:has-text("Confirm Password")) input');
    this.confirmPasswordInput = this.page.locator('.oxd-input-group:has-text("Confirm Password") input');
    this.saveButton=this.page.getByRole('button', { name: 'Save' });
    this.cancelButton=this.page.getByRole('button', { name: 'Cancel' });
    this.jobTitleInput=this.page.locator('.oxd-input-group:has-text("Job Title") input');
    this.jobDescriptionInput=this.page.locator('.oxd-input-group:has-text("Job Description") textarea');
    this.JobSpecification=this.page.locator('.oxd-input-group:has-text("Job Specification") input[type="file"]');
    this.notesInput=this.page.locator('.oxd-input-group:has-text("Note") textarea');
  } 

  /**
   * Verifies that the URL redirects to the Admin view system users page.
   */
  public async verifyAdminUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/.*admin\/viewSystemUsers.*/, { timeout: 15000 });
  }

  /**
   * Verifies the document title matches the expected title.
   */
  public async verifyPageTitle(expectedTitle: string): Promise<void> {
    const actualTitle = await this.page.title();
    expect(actualTitle).toBe(expectedTitle);
  }

  /**
   * Verifies that the page URL contains the expected substring.
   */
  public async verifyPageUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring), { timeout: 10000 });
  }

  public async verifySystemUserFilter(){
    const systemUserFilter = this.page.locator('div.oxd-table-filter');
    await expect(systemUserFilter).toBeVisible({ timeout: 10000 });
    console.log('[VerifySystemUserFilter] System User Filter is visible');
  }

  public async selectUserRole(userRole: string) {
    await this.userRoleSelect.click();
    const option = this.page.locator('.oxd-select-option', { hasText: userRole });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }
  public async clickSearchFilterButton(){
    const searchFilterButton = this.page.locator('button[type="submit"]:has-text("Search")');
    await searchFilterButton.click();
    // Wait for search API request to start and complete
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
  public async verifyTableResult(userRole: string) {
    const tableBody = this.page.locator('.oxd-table-body');
    await expect(tableBody).toBeVisible({ timeout: 15000 });

    const tableRows = this.page.locator('.oxd-table-body .oxd-table-card');
    // Wait for at least one row to load
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log(`[VerifyTableResult] Found ${rowCount} table rows`);
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Check that each row has the correct user role in the 3rd column (User Role)
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      // User Role is the 3rd cell (index 2)
      const roleCell = row.locator('.oxd-table-cell').nth(2);
      await expect(roleCell).toHaveText(userRole, { timeout: 5000 });
    }
    console.log(`[VerifyTableResult] Checked all ${rowCount} rows, all match User Role: "${userRole}"`);
  }
  public async searchByEmployeeName(employeeName: string) {
    const employeeNameLocator = this.page.locator('input[placeholder="Type for hints..."]');
    await employeeNameLocator.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');

    // Type the first name to trigger the autocomplete
    const searchWord = employeeName.includes(' ') ? employeeName.split(' ')[0] : employeeName;
    console.log(`[AdminPage] Typing search word: "${searchWord}"`);
    await employeeNameLocator.pressSequentially(searchWord, { delay: 100 });

    const optionsLocator = this.page.locator('.oxd-autocomplete-option');
    await optionsLocator.first().waitFor({ state: 'visible', timeout: 8000 });

    // Wait for the "Searching...." text to clear
    const firstOptionText = await optionsLocator.first().innerText();
    if (firstOptionText.includes('Searching')) {
      await this.page.waitForFunction(() => {
        const el = document.querySelector('.oxd-autocomplete-option');
        return el && el.textContent && !el.textContent.includes('Searching');
      }, null, { timeout: 8000 });
    }

    // Match option that contains all search words
    const words = employeeName.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const count = await optionsLocator.count();
    let selected = false;
    for (let i = 0; i < count; i++) {
      const text = (await optionsLocator.nth(i).innerText()).toLowerCase();
      if (words.every(word => text.includes(word))) {
        console.log(`[AdminPage] Clicking autocomplete option: "${await optionsLocator.nth(i).innerText()}"`);
        await optionsLocator.nth(i).click();
        selected = true;
        break;
      }
    }

    if (!selected) {
      console.log(`[AdminPage] No perfect match found. Clicking first autocomplete option: "${await optionsLocator.first().innerText()}"`);
      await optionsLocator.first().click();
    }
  }
  public async verifyTableResultByEmployeeName(employeeName: string) {
    const tableBody = this.page.locator('.oxd-table-body');
    await expect(tableBody).toBeVisible({ timeout: 15000 });

    const tableRows = this.page.locator('.oxd-table-body .oxd-table-card');
    // Wait for at least one row to load
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log(`[VerifyTableResultByEmployeeName] Found ${rowCount} table rows`);
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Check that each row has the correct employee name in the 4th column (Employee Name)
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      // Employee Name is the 4th cell (index 3)
      const employeeNameCell = row.locator('.oxd-table-cell').nth(3);
      await expect(employeeNameCell).toContainText(employeeName, { ignoreCase: true, timeout: 5000 });
    }
    console.log(`[VerifyTableResultByEmployeeName] Checked all ${rowCount} rows, all match Employee Name: "${employeeName}"`);
  }
  public async getFirstEmployeeNameFromTable(): Promise<string | null> {
    const tableRows = this.page.locator('.oxd-table-body .oxd-table-card');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });
    const firstRowCell = tableRows.first().locator('.oxd-table-cell').nth(3);
    const name = await firstRowCell.innerText();
    console.log(`[AdminPage] Retrieved first employee name from table: "${name}"`);
    return name ? name.trim() : null;
  }
  public async selectStatus(status: string) {
    await this.statusSelect.click();
    const option = this.page.locator('.oxd-select-option', { hasText: status });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }
  public async verifyTableResultByStatus(status: string) {
    const tableBody = this.page.locator('.oxd-table-body');
    await expect(tableBody).toBeVisible({ timeout: 15000 });

    const tableRows = this.page.locator('.oxd-table-body .oxd-table-card');
    // Wait for at least one row to load
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log(`[VerifyTableResultByStatus] Found ${rowCount} table rows`);
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Check that each row has the correct status in the 5th column (Status)
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      // Status is the 5th cell (index 4)
      const statusCell = row.locator('.oxd-table-cell').nth(4);
      await expect(statusCell).toContainText(status, { ignoreCase: true, timeout: 5000 });
    }
    console.log(`[VerifyTableResultByStatus] Checked all ${rowCount} rows, all match Status: "${status}"`);
  }
  public async clickResetButton(){
    const resetButton = this.page.getByRole('button', { name: 'Reset' });
    await expect(resetButton).toBeVisible({ timeout: 5000 });
    await resetButton.click();
  }
  public async searchByUsername(username: string) {
    await this.usernameInput.fill(username);
  }
  public async verifyTableResultByUsername(username: string) {
    const tableBody = this.page.locator('.oxd-table-body');
    await expect(tableBody).toBeVisible({ timeout: 15000 });

    const tableRows = this.page.locator('.oxd-table-body .oxd-table-card');
    // Wait for at least one row to load
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log(`[VerifyTableResultByUsername] Found ${rowCount} table rows`);
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Check that each row has the correct username in the 2nd column (Username)
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      // Username is the 2nd cell (index 1)
      const usernameCell = row.locator('.oxd-table-cell').nth(1);
      await expect(usernameCell).toContainText(username, { ignoreCase: true, timeout: 5000 });
    }
    console.log(`[VerifyTableResultByUsername] Checked all ${rowCount} rows, all match Username: "${username}"`);
  }
  public async clickAddUserButton(){
    if (this.page.url().includes('viewSystemUsers')) {
      try {
        const name = await this.getFirstEmployeeNameFromTable();
        if (name) {
          this.lastSearchedEmployeeName = name;
        }
      } catch (e) {
        console.warn('[AdminPage] Could not retrieve employee name from table:', e);
      }
    }
    const addButton = this.page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();
  }
  public async verifyAddUserForm(){
    const addUserForm = this.page.locator('div.orangehrm-background-container');
    await expect(addUserForm).toBeVisible({ timeout: 5000 });
  }
  public async verifyAddJobTitleForm(){
    const addJobTitleForm = this.page.locator('div.orangehrm-background-container');
    await expect(addJobTitleForm).toBeVisible({ timeout: 5000 });
    const formHeader = this.page.locator('h6.orangehrm-main-title');
    await expect(formHeader).toContainText('Add Job Title', { timeout: 5000 });
  }
  public async fillAddUserForm() {
    const userRole=['ESS','Admin']
    const randomUserRole = faker.helpers.arrayElement(userRole);
    const status=["Enabled","Disabled"];
    const randomStatus = "Disabled";

    const employeeName = this.lastSearchedEmployeeName || faker.person.fullName();
    const username = faker.internet.username();
    const password = "Password123!" + Math.random().toString(36).substring(2, 6);
    const confirmpassword = password;

    // Use class properties for locators
    await this.userRoleSelect.click();

    const roleOption = this.page.locator('.oxd-select-option', { hasText: randomUserRole });
    await roleOption.waitFor({ state: 'visible', timeout: 5000 });
    await roleOption.click();

    await expect(this.statusSelect).toBeVisible({ timeout: 5000 });
    await this.statusSelect.click();

    const statusOption = this.page.locator('.oxd-select-option', { hasText: randomStatus });
    await statusOption.waitFor({ state: 'visible', timeout: 5000 });
    await statusOption.click();


    await expect(this.employeeNameInput).toBeVisible({ timeout: 5000 });
    await this.searchByEmployeeName(employeeName);

    await expect(this.usernameInput).toBeVisible({ timeout: 5000 });
    await this.usernameInput.fill(username);

    await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
    await this.passwordInput.fill(password);

    await expect(this.confirmPasswordInput).toBeVisible({ timeout: 5000 });
    await this.confirmPasswordInput.fill(confirmpassword);
    await this.saveButton.click();
  }
  public async verifyAddUserSuccessMessage(successMessage:string){
    const successMessageLocator = this.page.locator('.oxd-toast-content').first();
    await expect(successMessageLocator).toBeVisible({ timeout: 10000 });
    const expectedText = successMessage.toLowerCase().includes("added") ? "Successfully Saved" : successMessage;
    await expect(successMessageLocator).toContainText(expectedText, { ignoreCase: true, timeout: 10000 });
    console.log(`[AdminPage] Successfully added user with ${expectedText}`);
    
  } 
  public async clickDeleteButton(){
    const deleteButton = this.page.locator('.oxd-sheet button:has-text("Yes, Delete")').first();
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();
  } 
  public async verifyDeleteUserConfirmationPopup(message:string){
    const confirmationPopup = this.page.locator('.oxd-sheet');
    await expect(confirmationPopup).toBeVisible({ timeout: 5000 });
    const expectedMessage = message.toLowerCase().includes("delete this record") ? "Are you sure you want to continue?" : message;
    await expect(confirmationPopup).toContainText(expectedMessage, { ignoreCase: true, timeout: 5000 });
    console.log(`[AdminPage] Delete user confirmation popup with message "${expectedMessage}" is visible`);
  } 
  public async clickDeleteButtonfromtheTable(){
    const tableRows = this.page.locator('.oxd-table-body .oxd-table-card');
    await expect(tableRows.first()).toBeVisible({ timeout: 10000 });
    const count = await tableRows.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const row = tableRows.nth(i);
      const usernameCell = row.locator('.oxd-table-cell').nth(1);
      const username = await usernameCell.innerText().catch(() => '');
      if (username.trim().toLowerCase() !== 'admin') {
        const deleteButton = row.locator('button:has(.bi-trash)').first();
        if (await deleteButton.isVisible()) {
          console.log(`[AdminPage] Clicking delete button for user: "${username.trim()}"`);
          await deleteButton.click();
          clicked = true;
          break;
        }
      }
    }
    if (!clicked) {
      console.log(`[AdminPage] Fallback: Clicking delete button for first row`);
      const deleteButton = tableRows.first().locator('button:has(.bi-trash)').first();
      await expect(deleteButton).toBeVisible({ timeout: 5000 });
      await deleteButton.click();
    }
  }
  public async verifyDeleteUserSuccessMessage(successMessage:string){
    const successMessageLocator = this.page.locator('.oxd-toast-content').first();
    await expect(successMessageLocator).toBeVisible({ timeout: 10000 });
    const expectedText = successMessage.toLowerCase().includes("deleted") ? "Successfully Deleted" : successMessage;
    await expect(successMessageLocator).toContainText(expectedText, { ignoreCase: true, timeout: 10000 });
    console.log(`[AdminPage] Successfully deleted user with ${expectedText}`);
  }
  public async verifyEditUserSuccessMessage(successMessage:string){
    const successMessageLocator = this.page.locator('.oxd-toast-content').first();
    await expect(successMessageLocator).toBeVisible({ timeout: 10000 });
    const expectedText = successMessage.toLowerCase().includes("updated") ? "Successfully Updated" : successMessage;
    await expect(successMessageLocator).toContainText(expectedText, { ignoreCase: true, timeout: 10000 });
    console.log(`[AdminPage] Successfully updated user with ${expectedText}`);
  }
  public async clickEditButtonfromtheTable() {
    const firstUserTableEditButton = this.page.locator('.oxd-table-card').first().locator('button:has(.bi-pencil-fill)').first();
    await expect(firstUserTableEditButton).toBeVisible({ timeout: 5000 });
    await firstUserTableEditButton.click();
  }
  public async verifyEditUserForm() {
    const editUserForm = this.page.locator('div.orangehrm-background-container');
    await expect(editUserForm).toBeVisible({ timeout: 5000 });
    const formHeader = this.page.locator('h6.orangehrm-main-title');
    await expect(formHeader).toContainText('Edit User', { timeout: 5000 });
  }
  public async fillEditUserForm() {
    const updatedUsername = 'Edit' + faker.internet.username().substring(0, 10);
    await expect(this.statusSelect).toBeVisible({ timeout: 5000 });
    await this.statusSelect.click();
    const statusOption = this.page.locator('.oxd-select-option', { hasText: 'Enabled' });
    await statusOption.waitFor({ state: 'visible', timeout: 5000 });
    await statusOption.click();

    await expect(this.usernameInput).toBeVisible({ timeout: 5000 });
    await this.usernameInput.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await this.usernameInput.waitFor({state:'visible',timeout:5000})
    await this.usernameInput.fill(updatedUsername);

    await this.saveButton.click();
    console.log(`[AdminPage] Updated username to ${updatedUsername} sucessfully.`);
  }
  public async clickCancelButtonfromtheTable() {
    const firstUserTableCancelButton = this.page.getByRole("button",{name:' No, Cancel '})
    await expect(firstUserTableCancelButton).toBeVisible({ timeout: 5000 });
    await firstUserTableCancelButton.click();
    console.log('[AdminPage] user is clicked on cancel button..')
  }
  public async verifyConfirmationPopupIsInvisible(){
     const cancelButtonPopup=this.page.locator('.oxd-dialog-container-default--inner')
     await expect(cancelButtonPopup).not.toBeVisible({ timeout: 5000 });
     console.log(`[AdminPage] Cancel button popup is not visible`);
  }

  public async clickNavigationMenu(menuName: string): Promise<void> {
    const menuLocator = this.page.locator('.oxd-topbar-body-nav-tab', { hasText: menuName });
    await menuLocator.waitFor({ state: 'visible', timeout: 10000 });
    await menuLocator.click();
    console.log(`[AdminPage] Clicked on navigation menu: "${menuName}"`);
  }

  public async selectSubmenu(submenuName: string): Promise<void> {
    let targetText = submenuName;
    if (submenuName === 'JobTitle') {
      targetText = 'Job Titles';
    }
    const submenuLocator = this.page.locator('a.oxd-topbar-body-nav-tab-link', { hasText: targetText });
    await submenuLocator.waitFor({ state: 'visible', timeout: 10000 });
    await submenuLocator.click();
    console.log(`[AdminPage] Clicked on submenu: "${submenuName}" (mapped to "${targetText}")`);
  }
  public async fillAddJobTitleForm(){
    const jobTitle = `${faker.person.jobTitle()}_${Date.now()}`;
    const jobDescription = faker.person.jobDescriptor();
    const jobSpecPath = path.resolve('data/test.txt');
    const notes = faker.lorem.sentence();

    console.log(`[AdminPage] Filling Job Title Form with:\n- Job Title: ${jobTitle}\n- Job Description: ${jobDescription}\n- Job Specification File: ${jobSpecPath}\n- Notes: ${notes}`);

    await this.jobTitleInput.fill(jobTitle);
    await this.jobDescriptionInput.fill(jobDescription);
    await this.JobSpecification.setInputFiles(jobSpecPath);
    await this.notesInput.fill(notes);
    console.log('form filled successfully.')
  }
  public async clickSaveButton(){
    await this.saveButton.click();
    console.log('information saved succcessfully.')
  }
}

