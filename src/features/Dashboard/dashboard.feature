Feature: Dashboard Page Functionality

  Background:
    Given User is on the dashboard page

  @smoke @regression @dashboard @TC_006
  Scenario: Verify Dashboard page layout and components
    Then User should see dashboard header "Dashboard"
    And User should see the sidebar navigation menu
    And User should see dashboard widgets:
      | Time at Work      |
      | My Actions        |
      | Quick Launch      |
      | Buzz Latest Posts |

  @regression @dashboard @TC_007
  Scenario Outline: Navigate to other modules via the sidebar menu
    When User clicks sidebar menu item "<menuItem>"
    Then User should see topbar header "<headerTitle>"

    Examples:
      | menuItem | headerTitle      |
      | Admin    | Admin            |
      | PIM      | PIM              |
      | My Info  | Personal Details |

  @regression @dashboard @quicklaunch @TC_008
  Scenario Outline: Click on Quick Launch items and verify navigation
    When User clicks Quick Launch button "<buttonTitle>"
    Then User should be redirected to the URL path "<expectedPath>"

    Examples:
      | buttonTitle  | expectedPath                |
      | Assign Leave | /leave/assignLeave          |
      | Leave List   | /leave/viewLeaveList        |
      | Timesheets   | /time/viewEmployeeTimesheet |
      | Apply Leave  | /leave/applyLeave           |
      | My Leave     | /leave/viewMyLeaveList      |
      | My Timesheet | /time/viewMyTimesheet       |

  @regression @dashboard @quicklaunch @hover @TC_009
  Scenario Outline: Verify Quick Launch buttons have orange color on hover
    When User hovers over Quick Launch button "<buttonTitle>"
    Then the Quick Launch button "<buttonTitle>" should display orange hover styles

    Examples:
      | buttonTitle  |
      | Assign Leave |
      | Leave List   |
      | Timesheets   |
      | Apply Leave  |
      | My Leave     |
      | My Timesheet |

  @regression @dashboard @TC_010
  Scenario: Log out from Dashboard page
    When User logs out
    Then User should be redirected to the login page
