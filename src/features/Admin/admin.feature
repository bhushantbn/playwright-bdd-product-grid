Feature: Admin Module Navigation

  Background:
    Given User is on the dashboard page

  @smoke @regression @admin @TC_019
  Scenario: Verify navigation to the Admin module and check its Title
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    And User should see page title "OrangeHRM"

  @smoke @regression @admin @TC_020
  Scenario: Verify navigation to the Admin module and check its URL
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    And User should see page url contains "/viewSystemUsers"

  @smoke @regression @admin @TC_021
  Scenario: Verify navigation to the Admin and see the System User Filter component
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    And User should see System User Filter

  @smoke @regression @admin @TC_022
  Scenario: Verify Search Filter By Admin User Role
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User selects user role "Admin" from System User Filter
    Then User clicks on Search Filter button
    Then User should see table result for "Admin" user role

  @regression @admin @TC_023
  Scenario: Verify Search Filter By ESS User Role
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User selects user role "ESS" from System User Filter
    Then User clicks on Search Filter button
    Then User should see table result for "ESS" user role

  @regression @admin @TC_024
  Scenario: Verify Search Filter By Employee Name
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User fills employee name "seeded employee" in System User Filter
    Then User clicks on Search Filter button
    Then User should see table result for "seeded employee" employee name

  @regression @admin @TC_025
  Scenario: Verify Search Filter By Enabled Status
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    And User selects status "Enabled" from System User Filter
    And User clicks on Search Filter button
    Then User should see table result for "Enabled" status

  @regression @admin @TC_026
  Scenario: Verify Search Filter By Disabled Status
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    And User selects status "Disabled" from System User Filter
    And User clicks on Search Filter button
    Then User should see table result for "Disabled" status

  @regression @admin @TC_027
  Scenario: Verify Search Filter By username
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    And User fills username "Admin" in System User Filter
    And User clicks on Search Filter button
    Then User should see table result for "Admin" username

  @regression @admin @TC_028
  Scenario: Verify Reset Filter Functionality
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    And User selects status "Enabled" from System User Filter
    And User clicks on Search Filter button
    Then User should see table result for "Enabled" status
    Then User clicks on Reset button
    Then User should not see the table results as per search filter

  @regression @admin @TC_029 @adduser
  Scenario: Verify Add User Functionality
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User clicks on Add button
    Then User should see the Add User Form
    Then User fills the Add User Form with the following details
    Then User should see "Successfully Added" success message
    Then User fills employee name "seeded employee" in System User Filter
    Then User clicks on Search Filter button
    Then User should see table result for "seeded employee" employee name

  @regression @admin @TC_030 @deleteuser
  Scenario: Verify Delete User Functionality
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User clicks on Add button
    Then User should see the Add User Form
    Then User fills the Add User Form with the following details
    Then User should see "Successfully Added" success message
    Then User fills employee name "seeded employee" in System User Filter
    And User selects status "Disabled" from System User Filter
    Then User clicks on Search Filter button
    Then User clicks on Delete button from the first search result
    Then User should see the confirmation popup with the message "Are you sure you want to delete this record?"
    Then User clicks on Delete button
    Then User should see "Successfully Deleted" success message

  @regression @admin @TC_031 @edituser
  Scenario: Verify Edit User Functionality
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User fills employee name "Shayma azhrani" in System User Filter
    And User selects status "Enabled" from System User Filter
    Then User clicks on Search Filter button
    Then User clicks on Edit button from the first search result
    Then User should see the Edit User Form
    Then User updates the Edit User Form with the following details
    Then User should see "Successfully Updated" success message

  @regression @admin @TC_032 @Canceldeleteuser
  Scenario: Verify Cancel Delete User Functionality
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User should see System User Filter
    Then User fills employee name "seeded employee" in System User Filter
    Then User clicks on Search Filter button
    Then User should see table result for "seeded employee" employee name
    Then User clicks on Delete button from the first search result
    Then User should see the confirmation popup with the message "Are you sure you want to delete this record?"
    Then User clicks on Cancel button
    Then User should not see the cancel delete confirmation popup

  @regression @admin @TC_033 @JobTitle
  Scenario: Verify Add Job Title Functionality
    When User clicks sidebar menu item "Admin"
    Then User should be redirected to the Admin page URL
    Then User click on "Job" navigation menu
    Then User select JobTitle submenu
    Then User clicks on Add button
    Then User should see the Add Job Title Form
    Then User fill the JobTitle Form
    Then User click on save button
    Then User should see "Successfully Added" success message
        
