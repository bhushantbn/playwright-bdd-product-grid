import { DataTable, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../hooks/hooks';

Then('User should be redirected to the Admin page URL', async function (this: CustomWorld) {
  await this.adminPage.verifyAdminUrl();
});

Then('User should see page title {string}', async function (this: CustomWorld, expectedTitle: string) {
  await this.adminPage.verifyPageTitle(expectedTitle);
});

Then('User should see page url contains {string}', async function (this: CustomWorld, expectedUrlPart: string) {
  await this.adminPage.verifyPageUrlContains(expectedUrlPart);
});
Then('User should see System User Filter', async function (this: CustomWorld) {
  await this.adminPage.verifySystemUserFilter();
});
Then('User selects user role {string} from System User Filter', async function (this: CustomWorld, userRole: string) {
  await this.adminPage.selectUserRole(userRole);
});
Then('User clicks on Search Filter button', async function (this: CustomWorld) {
  await this.adminPage.clickSearchFilterButton();
});
Then('User should see table result for {string} user role', async function (this: CustomWorld, userRole: string) {
  await this.adminPage.verifyTableResult(userRole);
});
Then('User fills employee name {string} in System User Filter', async function (this: CustomWorld, employeeName: string) {
  await this.adminPage.searchByEmployeeName(employeeName);
});
Then('User should see table result for {string} employee name', async function (this: CustomWorld, employeeName: string) {
  await this.adminPage.verifyTableResultByEmployeeName(employeeName);
});

Then('User selects status {string} from System User Filter', async function (this: CustomWorld, status: string) {
  await this.adminPage.selectStatus(status);
});
Then('User should see table result for {string} status', async function (this: CustomWorld, status: string) {
  await this.adminPage.verifyTableResultByStatus(status);
});
Then("User clicks on Reset button", async function(this:CustomWorld){
  await this.adminPage.clickResetButton();
});
Then("User should not see the table results as per search filter", async function(this:CustomWorld){
  await this.adminPage.verifyTableResultByStatus("");
})
Then("User fills username {string} in System User Filter", async function (this: CustomWorld, username: string) {
  await this.adminPage.searchByUsername(username);
})
Then("User should see table result for {string} username", async function (this: CustomWorld, username: string) {
  await this.adminPage.verifyTableResultByUsername(username);
})
Then("User clicks on Add button", async function (this: CustomWorld) {
  await this.adminPage.clickAddUserButton();
})
Then("User should see the Add User Form", async function (this: CustomWorld) {
  await this.adminPage.verifyAddUserForm();
})
Then("User fills the Add User Form with the following details", async function (this: CustomWorld) {
  
  await this.adminPage.fillAddUserForm();
})
Then("User should see {string} success message", async function (this: CustomWorld, successMessage: string) {
  if (successMessage.toLowerCase().includes("deleted")) {
    await this.adminPage.verifyDeleteUserSuccessMessage(successMessage);
  } else if (successMessage.toLowerCase().includes("added")) {
    await this.adminPage.verifyAddUserSuccessMessage(successMessage);
  } else if (successMessage.toLowerCase().includes("updated")) {
    await this.adminPage.verifyEditUserSuccessMessage(successMessage);
  }else{
    throw new Error(`Unknown success message type: ${successMessage}`);
  }

})
Then("User verify the added record in the table", async function(this:CustomWorld){
  await this.adminPage.verifyTableResultByEmployeeName(this.adminPage.lastSearchedEmployeeName);
})
Then("User clicks on Delete button from the first search result", async function(this:CustomWorld){
  await this.adminPage.clickDeleteButtonfromtheTable();
})
Then("User should see the confirmation popup with the message {string}", async function(this:CustomWorld,message:string){
  await this.adminPage.verifyDeleteUserConfirmationPopup(message);
})
Then("User clicks on Delete button", async function(this:CustomWorld){
  await this.adminPage.clickDeleteButton();
})
Then("User clicks on Edit button from the first search result", async function(this:CustomWorld){
  await this.adminPage.clickEditButtonfromtheTable();
})
Then("User should see the Edit User Form", async function (this: CustomWorld) {
  await this.adminPage.verifyEditUserForm();
})
Then("User updates the Edit User Form with the following details", async function (this: CustomWorld) {
  await this.adminPage.fillEditUserForm();
})
Then("User clicks on Cancel button", async function(this:CustomWorld){
  await this.adminPage.clickCancelButtonfromtheTable();
})
Then("User should not see the cancel delete confirmation popup", async function(this:CustomWorld){
  await this.adminPage.verifyConfirmationPopupIsInvisible();
})

Then('User click on {string} navigation menu', async function (this: CustomWorld, menuName: string) {
  await this.adminPage.clickNavigationMenu(menuName);
});

Then('User select JobTitle submenu', async function (this: CustomWorld) {
  await this.adminPage.selectSubmenu('JobTitle');
});

Then('User should see the Add Job Title Form', async function (this: CustomWorld) {
  await this.adminPage.verifyAddJobTitleForm();
});
Then("User fill the JobTitle Form",async function(this:CustomWorld){
  await this.adminPage.fillAddJobTitleForm();
})
Then("User click on save button",async function(this:CustomWorld){
  await this.adminPage.clickSaveButton();
})