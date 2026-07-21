# 🚀 Playwright BDD Production Framework Architecture

> **A Complete Enterprise-Level Playwright + Cucumber (BDD) Framework Architecture Guide**

---

# 📑 Table of Contents

- [Overview](#-overview)
- [High-Level Architecture](#-high-level-architecture)
- [Project Structure](#-project-structure)
- [Framework Components](#-framework-components)
- [Execution Flow](#-complete-execution-flow)
- [Design Patterns](#-design-patterns-used)
- [Key Advantages](#-key-advantages)
- [Framework Summary](#-framework-summary)

---

# 📌 Overview

This project follows an **Enterprise Test Automation Framework** built using:

- 🎭 Playwright
- 🥒 Cucumber (BDD)
- 📘 TypeScript
- 📄 Page Object Model (POM)
- ☁ Azure Blob Storage
- ⚙ Environment-based Configuration
- 📊 HTML Reports

The framework is designed to be:

- ✅ Scalable
- ✅ Maintainable
- ✅ Reusable
- ✅ Enterprise Ready
- ✅ CI/CD Friendly

---

# 🏗 High-Level Architecture

```text
                          ┌───────────────────────────────┐
                          │      Feature Files (.feature) │
                          │      Business Test Scenarios  │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │      Step Definitions         │
                          │     (Given / When / Then)     │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │      Custom Cucumber World    │
                          │ Browser • Context • Page      │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │      Page Object Model        │
                          │      BasePage + Pages         │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │       UIElement Wrapper       │
                          │ Retry • Wait • Logging • Error│
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │      Playwright Browser       │
                          │ Chromium • Firefox • WebKit   │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │     Azure Blob Storage        │
                          │ Failure Screenshot Upload     │
                          └───────────────────────────────┘
```

---

# 📂 Project Structure

```text
Playwright-BDD-ProductionGrid
│
├── src
│   ├── config
│   ├── features
│   ├── hooks
│   ├── pages
│   ├── steps
│   ├── utils
│   └── test-data
│
├── playwright.config.ts
├── cucumber.js
├── package.json
└── README.md
```

---

# 📖 Framework Components

---

## 🥒 1. Feature Layer

**Location**

```text
src/features/
```

Feature files contain business-readable test scenarios written in **Gherkin syntax**.

Example:

```gherkin
Feature: Login

Scenario: Valid Login
  Given User opens login page
  When User enters valid credentials
  Then User should see dashboard
```

### Purpose

- Business-readable scenarios
- Requirement-driven testing
- Easy collaboration with Product Owners & Business Analysts

---

## 📝 2. Step Definitions

**Location**

```text
src/steps/
```

Step definitions connect feature files to Playwright automation.

```text
Feature File
      │
      ▼
Step Definition
      │
      ▼
Page Object
```

### Responsibilities

- Map Given / When / Then
- Call Page Object methods
- Keep test logic clean

---

## 🌍 3. Custom World (Execution Context)

**Location**

```text
src/hooks/hooks.ts
```

Custom World stores shared objects across each scenario.

### Stores

- Browser
- Browser Context
- Page
- Page Objects
- Test Data

### Architecture

```text
Scenario
      │
      ▼
Custom World
      │
      ├── Browser
      ├── Context
      ├── Page
      ├── LoginPage
      ├── DashboardPage
      └── AdminPage
```

### Benefits

- Shared objects
- Lazy loading
- Better memory usage
- Cleaner code

---

## 🔄 4. Hooks

### BeforeAll

Runs once before all tests.

Responsibilities

- Launch Browser
- Validate Authentication
- Generate `user.json`

---

### Before

Runs before every scenario.

Responsibilities

- Create Browser Context
- Load Authentication
- Open New Page

---

### After

Runs after every scenario.

Responsibilities

- Capture Screenshot on Failure
- Attach Screenshot to Report
- Upload Screenshot to Azure Blob Storage

---

### AfterAll

Runs after all scenarios.

Responsibilities

- Close Browser

---

## 📄 5. Page Object Model (POM)

**Location**

```text
src/pages/
```

Every application page has its own class.

```text
LoginPage

DashboardPage

AdminPage

LeavePage
```

All pages inherit:

```text
BasePage
```

Architecture

```text
               BasePage
                   ▲
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼

 LoginPage   DashboardPage   AdminPage
```

### Benefits

- Reusable components
- Easy maintenance
- Reduced code duplication

---

## 🧩 6. BasePage

Contains common functionality shared across all pages.

Examples

- Navigate
- Get URL
- Get Title
- Common Menu Navigation
- User Information

---

## 🎯 7. UIElement Wrapper

**Location**

```text
src/utils/UIElement.ts
```

Instead of using

```typescript
await locator.click();
```

Framework uses

```typescript
await uiElement.click();
```

Internally performs

- Retry
- Logging
- Wait
- Visibility Checks
- Exception Handling

### Flow

```text
Step Definition

      │
      ▼

Page Object

      │
      ▼

UIElement Wrapper

      │
      ▼

Playwright Locator

      │
      ▼

Browser
```

### Benefits

- Stable automation
- Less flaky tests
- Better debugging

---

## 🔐 8. Authentication Framework

**Location**

```text
src/utils/authSetup.ts
```

Framework performs login only once.

```text
Login

      │
      ▼

Save Cookies

      │
      ▼

Save Local Storage

      │
      ▼

user.json

      │
      ▼

Reuse Session
```

### Benefits

- Faster execution
- Stable login
- Reusable authentication

---

## ⚙️ 9. Configuration Manager

**Location**

```text
src/config/
```

Uses the **Singleton Design Pattern**.

Supports

```text
Development

Staging

Production
```

Reads values from

```text
.env

Environment Variables

config.dev.json

config.stage.json

config.prod.json
```

Example

- Browser
- Base URL
- Username
- Password
- Headless Mode

---

## 🌐 10. Environment Flow

```text
ENV Variable

      │
      ▼

Configuration Manager

      │
      ▼

Load JSON Configuration

      │
      ▼

Initialize Framework
```

Switch environment

```bash
ENV=dev
```

or

```bash
ENV=prod
```

---

## ☁️ 11. Azure Blob Storage

When a test fails

```text
Take Screenshot

      │
      ▼

Upload to Azure Blob

      │
      ▼

Generate Shareable URL
```

### Benefits

- Cloud Storage
- Historical Evidence
- Easy Sharing

---

## 📊 12. Reporting

Framework generates

- HTML Report
- Screenshots
- Console Logs
- Failure Attachments

Report includes

- Passed Tests
- Failed Tests
- Duration
- Error Messages
- Screenshots

---

# 🚀 Complete Execution Flow

```text
npm test

      │
      ▼

Authentication Setup

      │
      ▼

Launch Browser

      │
      ▼

Load Feature Files

      │
      ▼

Execute Step Definitions

      │
      ▼

Page Objects

      │
      ▼

UIElement Wrapper

      │
      ▼

Playwright Browser

      │
      ▼

Execute Test

      │
      ▼

────────────────────────

PASS

      │
      ▼

Generate HTML Report

────────────────────────

FAIL

      │
      ▼

Take Screenshot

      │
      ▼

Upload Screenshot to Azure Blob

      │
      ▼

Attach Screenshot to Report

      │
      ▼

Generate HTML Report

────────────────────────

      │
      ▼

Close Browser
```

---

# 🎯 Design Patterns Used

| Pattern | Purpose |
|----------|---------|
| **Page Object Model (POM)** | Encapsulates page interactions |
| **Singleton** | Configuration Manager |
| **Wrapper Pattern** | UIElement wrapper around Playwright Locator |
| **Factory / Lazy Initialization** | Create Page Objects only when required |
| **Hook Pattern** | Test lifecycle management |
| **BDD Pattern** | Business-readable scenarios |

---

# ⭐ Key Advantages

- ✅ Enterprise-grade architecture
- ✅ Highly scalable
- ✅ Easy maintenance
- ✅ Business-readable scenarios
- ✅ Cross-browser support
- ✅ Parallel execution
- ✅ Reusable Page Objects
- ✅ Smart Retry Mechanism
- ✅ Environment-specific configuration
- ✅ Authentication reuse
- ✅ Automatic screenshots on failures
- ✅ Azure Blob Storage integration
- ✅ Rich HTML reporting
- ✅ CI/CD pipeline ready

---

# 📌 Framework Summary

```text
Feature Files
      │
      ▼
Step Definitions
      │
      ▼
Custom World
      │
      ▼
Page Objects
      │
      ▼
BasePage
      │
      ▼
UIElement Wrapper
      │
      ▼
Playwright Engine
      │
      ▼
Browser
      │
      ▼
Reports • Azure Blob Storage
```

---

# 🎉 Conclusion

This framework follows a **Layered Enterprise Architecture**, where each layer has a single responsibility.

It combines:

- 🎭 Playwright for browser automation
- 🥒 Cucumber for Behavior Driven Development
- 📄 Page Object Model for maintainability
- 🎯 UIElement Wrapper for resilient UI interactions
- ⚙️ Configuration Manager for environment flexibility
- ☁️ Azure Blob Storage for artifact management
- 📊 Rich HTML Reporting for execution visibility

This architecture ensures the framework is **robust**, **scalable**, **maintainable**, **reusable**, and **production-ready** for enterprise automation testing.