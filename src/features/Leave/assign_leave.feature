Feature: Assign Leave Functionality

  Background:
    Given User navigates to the Assign Leave page

  @regression @assign-leave @TC_011
  Scenario: Verify validation errors for required fields
    When User clicks the Assign button
    Then User should see validation error "Required" for field "Employee Name"
    And User should see validation error "Required" for field "Leave Type"

  @regression @assign-leave @TC_012
  Scenario: Successfully assign leave to an employee for insuficiant balance
    When User enters employee name "seeded employee"
    And User selects leave type "CAN - FMLA"
    And User enters From Date "dynamic From Date"
    And User enters To Date "dynamic To Date"
    And User enters comment "Automated leave assignment"
    And User clicks the Assign button
    And User should see confirm dialog box
    When User clicks the Confirm button
    Then User should see success toast message "Successfully Saved"

  @regression @assign-leave @TC_013
  Scenario: Successfully cancel leave assignment for insuficiant balance
    When User enters employee name "seeded employee"
    And User selects leave type "CAN - FMLA"
    And User enters From Date "dynamic From Date"
    And User enters To Date "dynamic To Date"
    And User enters comment "Automated leave assignment"
    And User clicks the Assign button
    And User should see confirm dialog box
    When User clicks the Cancel button

  @regression @assign-leave @TC_014
  Scenario: Verify Nagative test scenario for assign leave
    When User clicks the Assign button
    Then User should see validation error "Required" for field "Employee Name"
    And User should see validation error "Required" for field "Leave Type"
    And User should see validation error "Required" for field "From Date"
    And User should see validation error "Required" for field "To Date"

  @regression @assign-leave @TC_015
  Scenario: Verify Nagative test scenario for toDate greater than fromDate
    When User enters employee name "seeded employee"
    And User selects leave type "CAN - Bereavement"
    And User enters From Date "dynamic From Date"
    And User enters To Date greater then TO date "dynamic To Date"
    Then User should see validation error "To date should be after from date" for field "To Date"

  @regression @assign-leave @TC_016
  Scenario: Verify Nagative test scenario for assign leave to employee with insuficiant balance
    When User enters employee name "seeded employee"
    And User selects leave type "CAN - Bereavement"
    And User enters From Date "dynamic From Date"
    And User enters To Date "dynamic To Date"
    And User enters comment "Automated leave assignment"
    And User clicks the Assign button
    Then User should see validation errormessage "Balance not sufficient"

  @regression @assign-leave @TC_017
  Scenario: Verify Nagative test scenario for assign leave to employee with s balance
    When User enters employee name "Amelia Brown"
    And User selects leave type "CAN - Bereavement"
    Then User should see available balance message "0.00 Day(s)"

  @regression @assign-leave @TC_018 @E2E-scenario
  Scenario: verify added entitlement balance visible to leave assignment page
    When user clicks on add entitlement link
    Then User should navigate to entitlement page
    And Add Leave entitlement radio button should be selected as "Individual Typle"
    Then User enters employee name "seeded employee"
    Then User selects leave type "CAN - Bereavement"
    Then User selects leave period as "2026-01-01 - 2026-31-12"
    Then User enters number of days "1"
    Then User clicks the save button
    Then User should see confirm dialog box
    When User clicks the Confirm button
    Then User should see success toast message "Successfully Saved"
    Then User should see record entry in the table
    When User navigates back to Assign Leave page
    When User enters employee name "seeded employee"
    And User selects leave type "CAN - Bereavement"
    Then User should see available balance message greater than or equal to "1" days
