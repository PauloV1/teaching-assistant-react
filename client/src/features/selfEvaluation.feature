Feature: Self-Evaluation
  As a student
  I want to submit my self-evaluations for a class
  So that I can assess my own performance on different goals

  Background:
    Given the server is running on "http://localhost:3005"
    And the client is running on "http://localhost:3004"
    And a student with CPF "123.456.789-00", name "João Silva" and email "joao.silva@example.com" exists
    And a class "Software Engineering" exists for semester "1" and year "2025"
    And the student "123.456.789-00" is enrolled in class "Software Engineering"

  Scenario: Student searches with valid credentials
    Given I am on the self-evaluation page
    When I enter "joao.silva@example.com" in the email field
    And I enter "123.456.789-00" in the CPF field
    And I click the "Search" button
    Then I should see a class selection dropdown
    And the dropdown should contain the class "Software Engineering (2025/1)"

  Scenario: Student searches with non-existent CPF
    Given I am on the self-evaluation page
    When I enter "joao.silva@example.com" in the email field
    And I enter "999.999.999-99" in the CPF field
    And I click the "Search" button
    Then I should see an error message containing "Student not found"

  Scenario: Student searches with mismatched email and CPF
    Given I am on the self-evaluation page
    When I enter "wrong.email@example.com" in the email field
    And I enter "123.456.789-00" in the CPF field
    And I click the "Search" button
    Then I should see an error message containing "email provided does not match"

  Scenario: Student submits self-evaluation for a goal
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    When I select the class "Software Engineering (2025/1)"
    Then I should see the evaluation goals table
    And I should see the goal "Requirements"
    And I should see the goal "Configuration Management"
    And I should see the goal "Project Management"
    And I should see the goal "Design"
    And I should see the goal "Tests"
    And I should see the goal "Refactoring"

  Scenario: Student selects MA grade for Requirements
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    When I select "MA" for goal "Requirements"
    Then the grade for "Requirements" should be "MA"

  Scenario: Student selects MPA grade for Configuration Management
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    When I select "MPA" for goal "Configuration Management"
    Then the grade for "Configuration Management" should be "MPA"

  Scenario: Student selects MANA grade for Project Management
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    When I select "MANA" for goal "Project Management"
    Then the grade for "Project Management" should be "MANA"

  Scenario: Student changes self-evaluation grade
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    And I have selected "MA" for goal "Design"
    When I select "MPA" for goal "Design"
    Then the grade for "Design" should be "MPA"

  Scenario: Student removes self-evaluation by selecting empty option
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    And I have selected "MA" for goal "Tests"
    When I select "-" for goal "Tests"
    Then the grade for "Tests" should be "-"

  Scenario: Student submits self-evaluations for multiple goals
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    When I select "MA" for goal "Requirements"
    And I select "MPA" for goal "Configuration Management"
    And I select "MA" for goal "Design"
    Then the grade for "Requirements" should be "MA"
    And the grade for "Configuration Management" should be "MPA"
    And the grade for "Design" should be "MA"

  Scenario: Student not enrolled in any class
    Given the server is running on "http://localhost:3005"
    And the client is running on "http://localhost:3004"
    And a student with CPF "987.654.321-00", name "Maria Santos" and email "maria.santos@example.com" exists
    And I am on the self-evaluation page
    When I enter "maria.santos@example.com" in the email field
    And I enter "987.654.321-00" in the CPF field
    And I click the "Search" button
    Then I should see a message containing "not enrolled in any classes"

  Scenario: Self-evaluation persists after page reload
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    And I have selected "MA" for goal "Requirements"
    When I reload the page
    And I enter "joao.silva@example.com" in the email field
    And I enter "123.456.789-00" in the CPF field
    And I click the "Search" button
    And I select the class "Software Engineering (2025/1)"
    Then the grade for "Requirements" should be "MA"

  Scenario: Student tries to search with empty email
    Given I am on the self-evaluation page
    When I enter "" in the email field
    And I enter "123.456.789-00" in the CPF field
    Then the "Search" button should be disabled

  Scenario: Student tries to search with empty CPF
    Given I am on the self-evaluation page
    When I enter "joao.silva@example.com" in the email field
    And I enter "" in the CPF field
    Then the "Search" button should be disabled

  Scenario: Student tries to search with both fields empty
    Given I am on the self-evaluation page
    When I enter "" in the email field
    And I enter "" in the CPF field
    Then the "Search" button should be disabled

  Scenario: Student searches with CPF without formatting
    Given I am on the self-evaluation page
    When I enter "joao.silva@example.com" in the email field
    And I enter "12345678900" in the CPF field
    And I click the "Search" button
    Then I should see a class selection dropdown
    And the dropdown should contain the class "Software Engineering (2025/1)"

  Scenario: Student enrolled in multiple classes
    Given the server is running on "http://localhost:3005"
    And the client is running on "http://localhost:3004"
    And a student with CPF "111.222.333-44", name "Carlos Oliveira" and email "carlos.oliveira@example.com" exists
    And a class "Software Engineering" exists for semester "1" and year "2025"
    And a class "Data Structures" exists for semester "1" and year "2025"
    And the student "111.222.333-44" is enrolled in class "Software Engineering"
    And the student "111.222.333-44" is enrolled in class "Data Structures"
    And I am on the self-evaluation page
    When I enter "carlos.oliveira@example.com" in the email field
    And I enter "111.222.333-44" in the CPF field
    And I click the "Search" button
    Then I should see a class selection dropdown
    And the dropdown should contain the class "Software Engineering (2025/1)"
    And the dropdown should contain the class "Data Structures (2025/1)"

  Scenario: Student switches between multiple classes
    Given the server is running on "http://localhost:3005"
    And the client is running on "http://localhost:3004"
    And a student with CPF "111.222.333-44", name "Carlos Oliveira" and email "carlos.oliveira@example.com" exists
    And a class "Software Engineering" exists for semester "1" and year "2025"
    And a class "Data Structures" exists for semester "1" and year "2025"
    And the student "111.222.333-44" is enrolled in class "Software Engineering"
    And the student "111.222.333-44" is enrolled in class "Data Structures"
    And I am on the self-evaluation page
    And I have searched with email "carlos.oliveira@example.com" and CPF "111.222.333-44"
    When I select the class "Software Engineering (2025/1)"
    And I select "MA" for goal "Requirements"
    And I select the class "Data Structures (2025/1)"
    And I select "MPA" for goal "Requirements"
    And I select the class "Software Engineering (2025/1)"
    Then the grade for "Requirements" should be "MA"

  Scenario: Student submits evaluation for all goals
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    When I select "MA" for goal "Requirements"
    And I select "MA" for goal "Configuration Management"
    And I select "MPA" for goal "Project Management"
    And I select "MA" for goal "Design"
    And I select "MPA" for goal "Tests"
    And I select "MA" for goal "Refactoring"
    Then the grade for "Requirements" should be "MA"
    And the grade for "Configuration Management" should be "MA"
    And the grade for "Project Management" should be "MPA"
    And the grade for "Design" should be "MA"
    And the grade for "Tests" should be "MPA"
    And the grade for "Refactoring" should be "MA"

  Scenario: Student clears all self-evaluations
    Given I am on the self-evaluation page
    And I have searched with email "joao.silva@example.com" and CPF "123.456.789-00"
    And I have selected the class "Software Engineering (2025/1)"
    And I have selected "MA" for goal "Requirements"
    And I have selected "MPA" for goal "Configuration Management"
    And I have selected "MA" for goal "Design"
    When I select "-" for goal "Requirements"
    And I select "-" for goal "Configuration Management"
    And I select "-" for goal "Design"
    Then the grade for "Requirements" should be "-"
    And the grade for "Configuration Management" should be "-"
    And the grade for "Design" should be "-"
