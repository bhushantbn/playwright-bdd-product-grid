@no-auth
Feature: Login Functionality

@smoke @regression @TC_005
Scenario Outline: Verify login with multiple users
  Given User opens login page
  When User enters username "<username>"
  And User enters password "<password>"
  And User clicks login button
  Then User should see "<message>"

  Examples:
  | username | password | message          |
  | admin    | admin123 | Login Successful |
  | invalid  | wrong123 | Login Failed     |
  |          | admin123 | Required         |
  | admin    |          | Required         |
