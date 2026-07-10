import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../hooks/hooks';

Given('User opens login page', async function (this: CustomWorld) {
  await this.loginPage.navigate();
});

When('User enters username {string}', async function (this: CustomWorld, username: string) {
  const adjustedUsername = username.toLowerCase() === 'admin' ? 'Admin' : username;
  await this.loginPage.enterUsername(adjustedUsername);
});

When('User enters password {string}', async function (this: CustomWorld, password: string) {
  await this.loginPage.enterPassword(password);
});

When('User clicks login button', async function (this: CustomWorld) {
  await this.loginPage.clickLoginButton();
});

Then('User should see {string}', async function (this: CustomWorld, expectedMessage: string) {
  if (expectedMessage === 'Login Successful') {
    // Assert dashboard URL redirection on successful authentication
    await expect(this.page!).toHaveURL(/.*dashboard/, { timeout: 15000 });
  } else if (expectedMessage === 'Login Failed') {
    // Assert invalid credentials alert shows up on authentication failure
    const alertText = await this.loginPage.getAlertText();
    expect(alertText).toContain('Invalid credentials');
  } else if (expectedMessage === 'Required') {
    // Assert "Required" validation error element is visible below the empty field
    const validationError = this.page!.locator('.oxd-input-field-error-message').first();
    await expect(validationError).toBeVisible({ timeout: 10000 });
    await expect(validationError).toHaveText('Required');
  } else {
    throw new Error(`Unknown expected validation message: ${expectedMessage}`);
  }
});
