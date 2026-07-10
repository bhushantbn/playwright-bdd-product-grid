import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../hooks/hooks';

Given('I navigate to the page', async function (this: CustomWorld) {
  await this.dropdownPage.navigateToPage();
});

When('I click on the dropdown link', async function (this: CustomWorld) {
  await this.dropdownPage.clickDropdownLink();
});

When('I select option {string} from the dropdown', async function (this: CustomWorld, optionLabel: string) {
  await this.dropdownPage.selectOptionByLabel(optionLabel);
});

Then('option {string} should be selected', async function (this: CustomWorld, expectedOptionLabel: string) {
  const selectedText = await this.dropdownPage.getSelectedOptionText();
  expect(selectedText).toBe(expectedOptionLabel);
});

When('I click on the add element button', async function (this: CustomWorld) {
  await this.dropdownPage.clickAddElementButton();
});

Then('I should see the Delete element', async function (this: CustomWorld) {
  const isVisible = await this.dropdownPage.isDeleteElementVisible();
  expect(isVisible).toBe(true);
});

Then('I click on the delete element', async function (this: CustomWorld) {
  await this.dropdownPage.clickDeleteElement();
});

Then('delete element should not be visible', async function (this: CustomWorld) {
  const isHidden = await this.dropdownPage.isDeleteElementHidden();
  expect(isHidden).toBe(true);
});

When('I click on basic auth link', async function (this: CustomWorld) {
  await this.dropdownPage.clickBasicAuthLink();
});

Then('login alert dialog should display', async function (this: CustomWorld) {
  const isDisplayed = await this.dropdownPage.isLoginAlertDialogDisplayed();
  expect(isDisplayed).toBe(true);
});

Then('I fill alert dialog with credentials {string} and {string}', async function (this: CustomWorld, username: string, password: string) {
  await this.dropdownPage.fillAlertDialog(username, password);
});
