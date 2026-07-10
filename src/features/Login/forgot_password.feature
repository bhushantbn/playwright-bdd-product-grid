@no-auth
Feature: Forgot Password Functionality

  Background:
    Given User opens login page
    And User clicks on Forgot your password link

  @smoke @regression @forgot-password @TC_003
  Scenario Outline: Verify forgot password with multiple inputs
    When User enters reset username "<username>"
    And User clicks reset password button
    Then User should see reset result "<message>"

    Examples:
    | username | message                               |
    | Admin    | Reset Password link sent successfully |
    | invalid  | Reset Password link sent successfully |
    |          | Required                              |

  @regression @cancel @forgot-password @TC_004
  Scenario: Cancel password reset request
    When User clicks cancel button on reset page
    Then User should be redirected to the login page
