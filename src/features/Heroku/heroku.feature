Feature: Heroku App Features
  As a user
  I want to perform operations on Heroku pages
  So that I can test different elements and dropdowns

  Background:
    Given I navigate to the page

  @smoke @dropdown @heroku_001
  Scenario: Select Option 1 from dropdown
    When I click on the dropdown link
    And I select option "Option 1" from the dropdown
    Then option "Option 1" should be selected

  @regression @dropdown @heroku_002
  Scenario: Select Option 2 from dropdown
    When I click on the dropdown link
    And I select option "Option 2" from the dropdown
    Then option "Option 2" should be selected

  @smoke @element-operations @heroku_003
  Scenario: Add Element
    When I click on the add element button
    Then I should see the Delete element

  @regression @element-operations @heroku_004
  Scenario: Perform operations on elements
    When I click on the add element button
    Then I should see the Delete element
    Then I click on the delete element
    Then delete element should not be visible

  @regression @basicauth @heroku_005
  Scenario: Validate Basic Auth
    When I click on basic auth link
    Then login alert dialog should display
    Then I fill alert dialog with credentials "admin" and "admin"
