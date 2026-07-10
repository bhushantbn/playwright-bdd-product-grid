import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../hooks/hooks';

Given('User clicks on Forgot your password link', async function (this: CustomWorld) {
  await this.loginPage.clickForgotPassword();
});

When('User enters reset username {string}', async function (this: CustomWorld, username: string) {
  await this.forgotPasswordPage.enterUsername(username);
});

When('User clicks reset password button', async function (this: CustomWorld) {
  await this.forgotPasswordPage.clickResetPassword();
});

Then('User should see reset result {string}', async function (this: CustomWorld, expectedMessage: string) {
  if (expectedMessage === 'Reset Password link sent successfully') {
    // Assert success title
    const actualMessage = await this.forgotPasswordPage.getSuccessMessage();
    expect(actualMessage).toContain(expectedMessage);
  } else if (expectedMessage === 'Required') {
    // Assert field validation error
    const actualError = await this.forgotPasswordPage.getValidationError();
    expect(actualError).toContain(expectedMessage);
  } else {
    throw new Error(`Unknown expected reset result message: ${expectedMessage}`);
  }
});

When('User clicks cancel button on reset page', async function (this: CustomWorld) {
  await this.forgotPasswordPage.clickCancel();
});

Then('User should be redirected to the login page', async function (this: CustomWorld) {
  // Check that the URL redirects back to the login path
  await expect(this.page!).toHaveURL(/.*login/, { timeout: 15000 });
});
