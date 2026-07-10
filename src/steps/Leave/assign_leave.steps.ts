import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../hooks/hooks';

Given('User navigates to the Assign Leave page', async function (this: CustomWorld) {
  await this.assignLeavePage.navigateToAssignLeave();
  console.log("user navigates to assign leave page successfully.");
});

When('User enters employee name {string}', async function (this: CustomWorld, name: string) {
  const url = this.page ? this.page.url() : '';
  let resolvedName = name;

  if (name.toLowerCase() === 'seeded employee' || name.toLowerCase() === 'valid employee') {
    if ((this as any).resolvedSeededEmployee) {
      resolvedName = (this as any).resolvedSeededEmployee;
    } else {
      resolvedName = await this.assignLeavePage.getSeededEmployeeName();
      (this as any).resolvedSeededEmployee = resolvedName;
    }
    console.log(`[Steps] Seeded employee name resolved: "${resolvedName}"`);
  } else if (name.toLowerCase() === 'logged-in employee' || name.toLowerCase() === 'current employee') {
    resolvedName = await this.assignLeavePage.getLoggedInUsername();
    console.log(`[Steps] Dynamic employee name resolved: "${resolvedName}"`);
  }

  if (url.includes('Entitlement') || url.includes('entitlement')) {
    await this.entitlementsPage.enterEmployeeName(resolvedName);
    console.log("employee name entered on entitlements page successfully.");
  } else {
    await this.assignLeavePage.enterEmployeeName(resolvedName);
    console.log("employee name entered successfully.");  
  }
});

When('User selects leave type {string}', async function (this: CustomWorld, leaveType: string) {
  const url = this.page ? this.page.url() : '';
  if (url.includes('Entitlement') || url.includes('entitlement')) {
    await this.entitlementsPage.selectLeaveType(leaveType);
  } else {
    await this.assignLeavePage.selectLeaveType(leaveType);
  }
  console.log("leave type selected successfully.");
});

When('User enters From Date {string}', async function (this: CustomWorld, date: string) {
  if (date.toLowerCase() === 'dynamic from date') {
    const year = 2027;
    const month = Math.floor(Math.random() * 12) + 1; // 1 to 12
    const fromDay = Math.floor(Math.random() * 15) + 5; // 5 to 19
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dynamicDate = `${year}-${pad(fromDay)}-${pad(month)}`; // yyyy-dd-mm
    (this as any).dynamicYear = year;
    (this as any).dynamicFromDate = dynamicDate;
    (this as any).dynamicFromDay = fromDay;
    (this as any).dynamicMonth = month;
    console.log(`[Steps] Generated dynamic From Date: ${dynamicDate}`);
    await this.assignLeavePage.enterFromDate(dynamicDate);
    console.log("from date entered successfully.");
  } else {
    await this.assignLeavePage.enterFromDate(date);
    console.log("from date entered successfully.");
  }
});

When('User enters To Date {string}', async function (this: CustomWorld, date: string) {
  if (date.toLowerCase() === 'dynamic to date') {
    const year = (this as any).dynamicYear || 2027;
    const month = (this as any).dynamicMonth || 10;
    const fromDay = (this as any).dynamicFromDay || 5;
    const toDay = fromDay + 2; // 3 to 22
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dynamicToDate = `${year}-${pad(toDay)}-${pad(month)}`; // yyyy-dd-mm
    console.log(`[Steps] Generated dynamic To Date: ${dynamicToDate}`);
    await this.assignLeavePage.enterToDate(dynamicToDate);
    console.log("to date entered successfully.");
  } else {
    await this.assignLeavePage.enterToDate(date);
    console.log("to date entered successfully.");
  }
});

When('User enters comment {string}', async function (this: CustomWorld, comment: string) {
  await this.assignLeavePage.enterComments(comment);
  console.log("comment entered successfully.");
});

When('User clicks the Assign button', async function (this: CustomWorld) {
  await this.assignLeavePage.clickAssign();
  console.log("assign button clicked successfully.");
});

Then('User should see validation error {string} for field {string}', async function (this: CustomWorld, expectedError: string, fieldLabel: string) {
  const actualError = await this.assignLeavePage.getValidationError(fieldLabel);
  expect(actualError).toContain(expectedError);
  console.log(`validation error is visible for ${fieldLabel} and the error is ${actualError}`);
});

Then('User should see success toast message {string}', async function (this: CustomWorld, expectedMessage: string) {
  const actualMessage = await this.assignLeavePage.getToastMessage();
  expect(actualMessage).toContain(expectedMessage);
  console.log("success toast message is visible.");
});

Then('User should see confirm dialog box', async function (this: CustomWorld) {
  await this.assignLeavePage.verifyConfirmDialog();
  console.log("confirm dialog box is visible.");
});

When('User clicks the Confirm button', async function (this: CustomWorld) {
  await this.assignLeavePage.clickConfirmButton();
  console.log("confirm button clicked successfully.")
});
Then("User clicks the Cancel button",async function (this: CustomWorld) {
    await this.assignLeavePage.clickCancelButton();
    console.log("cancel button clicked successfully.")
});
Then('User should see require field validation message for employee name',async function (this: CustomWorld) {
  await this.assignLeavePage.verifyRequireFieldValidationMessage("Required");
  console.log("require field validation message is visible for employee name")
});
Then('User should see require field validation message for leave type',async function (this: CustomWorld) {
  await this.assignLeavePage.verifyRequireFieldValidationMessage("Required");
  console.log("require field validation message is visible for leave type")
});
Then('User should see require field validation message for from date',async function (this: CustomWorld) {
  await this.assignLeavePage.verifyRequireFieldValidationMessage("Required");
  console.log("require field validation message is visible for from date")
});
Then('User should see require field validation message for to date',async function (this: CustomWorld) {
  await this.assignLeavePage.verifyRequireFieldValidationMessage("Required");
  console.log("require field validation message is visible for to date")
});
Then('User should see require field validation message for comment',async function (this: CustomWorld) {
  await this.assignLeavePage.verifyRequireFieldValidationMessage("Required");
  console.log("require field validation message is visible for comment")
});

Then('User enters To Date greater then TO date {string}',async function (this: CustomWorld,date:string) {
  if (date.toLowerCase() === 'dynamic to date') {
    const year = (this as any).dynamicYear || 2027;
    const month = (this as any).dynamicMonth || 10;
    const fromDay = (this as any).dynamicFromDay || 5;
    const toDay = fromDay - 2; // Make sure To Date is before From Date to trigger validation
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dynamicToDate = `${year}-${pad(toDay)}-${pad(month)}`; // yyyy-dd-mm
    console.log(`[Steps] Generated dynamic To Date (before From Date): ${dynamicToDate}`);
    await this.assignLeavePage.enterToDate(dynamicToDate);
    console.log("to date entered successfully.");
  } else {
    await this.assignLeavePage.enterToDate(date);
    console.log("to date entered successfully.");
  }
});

Then('User should see validation errormessage {string}',async function (this: CustomWorld,expectedError:string) {
  await this.assignLeavePage.verifyInsufficientBalanceMessage(expectedError);
  console.log("insufficient balance message is visible.")
});
Then('User should see available balance message {string}',async function (this: CustomWorld,expectedMessage:string) {
  await this.assignLeavePage.verifySufficientBalanceMessage(expectedMessage);
  console.log("sufficient balance message is visible.")
});

When('user clicks on add entitlement link', async function (this: CustomWorld) {
  await this.entitlementsPage.clickAddEntitlementsLink();
  console.log("Clicked add entitlement link successfully.");
});

Then('User should navigate to entitlement page', async function (this: CustomWorld) {
  if (this.page) {
    await expect(this.page).toHaveURL(/.*addLeaveEntitlement.*/, { timeout: 10000 });
  } else {
    throw new Error("Playwright page instance is not available.");
  }
  console.log("Navigated to entitlement page successfully.");
});

Then('Add Leave entitlement radio button should be selected as {string}', async function (this: CustomWorld, type: string) {
  await this.entitlementsPage.verifyIndividualTypeRadioSelected();
  console.log(`Add Leave entitlement radio button is selected as ${type}`);
});

When('User selects leave period as {string}', async function (this: CustomWorld, period: string) {
  await this.entitlementsPage.selectLeavePeriod(period);
  console.log("Leave period selected successfully.");
});

When('User enters number of days {string}', async function (this: CustomWorld, days: string) {
  await this.entitlementsPage.enterEntitlementDays(days);
  console.log("Entered number of days successfully.");
});

When('User clicks the save button', async function (this: CustomWorld) {
  await this.entitlementsPage.clickSave();
  console.log("Clicked save button successfully.");
});

Then('User should see record entry in the table', async function (this: CustomWorld) {
  await this.entitlementsPage.verifyRecordInTable();
  console.log("Record entry is visible in the table.");
});

When('User navigates back to Assign Leave page', async function (this: CustomWorld) {
  await this.entitlementsPage.navigateBackToAssignLeave();
  console.log("Navigated back to Assign Leave page successfully.");
});

Then("User should see available balance message greater than or equal to {string} days", async function (this: CustomWorld, minDays: string) {
  await this.assignLeavePage.verifyBalanceGreaterThanOrEqual(parseFloat(minDays));
  console.log(`Available balance is greater than or equal to ${minDays} day(s).`);
});
