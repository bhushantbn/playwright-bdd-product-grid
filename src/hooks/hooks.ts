import { BeforeAll, AfterAll, Before, After, Status, setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from '../config/ConfigManager';
import { BlobStorageManager } from '../utils/BlobStorage';
import * as fs from 'fs';
import * as path from 'path';
import { generateStorageState } from '../utils/authSetup';
import { JiraService } from '../utils/JiraService';

const AUTH_PATH = path.resolve(__dirname, '../../playwright/.auth/user.json');

import { LoginPage } from '../pages/Login/Login.po';
import { ForgotPasswordPage } from '../pages/Login/ForgotPassword.po';
import { DropdownPage } from '../pages/Heroku/heroku.po';
import { SecureAreaPage } from '../pages/Dashboard/SecureArea.po';
import { DashboardPage } from '../pages/Dashboard/Dashboard.po';
import { AssignLeavePage } from '../pages/Leave/AssignLeave.po';
import { EntitlementsPage } from '../pages/Leave/Entitlements.po';
import { AdminPage } from '../pages/Admin/Admin.po';

export class CustomWorld extends World {
  public context?: BrowserContext;
  public page?: Page;

  private _loginPage?: LoginPage;
  private _forgotPasswordPage?: ForgotPasswordPage;
  private _dropdownPage?: DropdownPage;
  private _secureAreaPage?: SecureAreaPage;
  private _dashboardPage?: DashboardPage;
  private _assignLeavePage?: AssignLeavePage;
  private _entitlementsPage?: EntitlementsPage;
  private _adminPage?: AdminPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  private getRequiredPage(): Page {
    if (!this.page) {
      throw new Error('Playwright page is not initialized.');
    }
    return this.page;
  }

  public get loginPage(): LoginPage {
    const page = this.getRequiredPage();
    return this._loginPage || (this._loginPage = new LoginPage(page));
  }

  public get forgotPasswordPage(): ForgotPasswordPage {
    const page = this.getRequiredPage();
    return this._forgotPasswordPage || (this._forgotPasswordPage = new ForgotPasswordPage(page));
  }

  public get dropdownPage(): DropdownPage {
    const page = this.getRequiredPage();
    return this._dropdownPage || (this._dropdownPage = new DropdownPage(page));
  }

  public get secureAreaPage(): SecureAreaPage {
    const page = this.getRequiredPage();
    return this._secureAreaPage || (this._secureAreaPage = new SecureAreaPage(page));
  }

  public get dashboardPage(): DashboardPage {
    const page = this.getRequiredPage();
    return this._dashboardPage || (this._dashboardPage = new DashboardPage(page));
  }

  public get assignLeavePage(): AssignLeavePage {
    const page = this.getRequiredPage();
    return this._assignLeavePage || (this._assignLeavePage = new AssignLeavePage(page));
  }

  public get entitlementsPage(): EntitlementsPage {
    const page = this.getRequiredPage();
    return this._entitlementsPage || (this._entitlementsPage = new EntitlementsPage(page));
  }

  public get adminPage(): AdminPage {
    const page = this.getRequiredPage();
    return this._adminPage || (this._adminPage = new AdminPage(page));
  }
}

setWorldConstructor(CustomWorld);
setDefaultTimeout(30000);

let globalBrowser: Browser;

function isSessionStale(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    const ageInMs = Date.now() - stats.mtimeMs;
    const maxAge = 1000 * 60 * 60; // 1 hour
    return ageInMs > maxAge;
  } catch {
    return true;
  }
}

BeforeAll(async function() {
  if (!fs.existsSync(AUTH_PATH) || isSessionStale(AUTH_PATH)) {
    console.log('[Hooks] Session state is missing or stale. Generating fresh auth state...');
    await generateStorageState();
  }

  const config = ConfigManager.getInstance().getConfig();
  const browserName = config.browserName;
  const headless = config.headless;

  console.log(`[Hooks] Launching browser: ${browserName} (headless: ${headless})`);

  switch (browserName) {
    case 'firefox':
      globalBrowser = await firefox.launch({ headless });
      break;
    case 'webkit':
      globalBrowser = await webkit.launch({ headless });
      break;
    case 'chromium':
    default:
      globalBrowser = await chromium.launch({ headless });
      break;
  }
});

Before(async function(this: CustomWorld, scenario) {
  const options: any = {
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  };

  const hasNoAuth = scenario.pickle.tags.some(tag => tag.name === '@no-auth');
  if (!hasNoAuth && fs.existsSync(AUTH_PATH)) {
    options.storageState = AUTH_PATH;
    console.log('[Hooks] Initializing BrowserContext with storageState.');
  } else {
    console.log('[Hooks] Bypassing storageState (clean state).');
  }

  this.context = await globalBrowser.newContext(options);
  this.page = await this.context.newPage();
});

After(async function(this: CustomWorld, scenario) {
  if (this.page) {
    if (scenario.result?.status === Status.FAILED) {
      console.log(`[Hooks] Scenario failed: "${scenario.pickle.name}". Taking screenshot...`);
      const screenshotDir = path.resolve('./test-results/screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const screenshotPath = path.join(
        screenshotDir,
        `failed-${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`
      );
      
      try {
        // Cancel any pending navigations to allow the screenshot renderer to settle
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.evaluate(() => window.stop()).catch(() => {});
        const screenshotBuffer = await this.page.screenshot({ path: screenshotPath, timeout: 5000 });
        await this.attach(screenshotBuffer, 'image/png');

        // Upload failure screenshot to Azure Blob Storage if configured
        const storageManager = new BlobStorageManager();
        await storageManager.uploadFile(screenshotPath);

        // Jira Defect Management Integration
        const tcTag = scenario.pickle.tags.find(tag => tag.name.startsWith('@TC_'));
        if (tcTag) {
          const testCaseId = tcTag.name.replace('@', '');
          const errorMsg = scenario.result?.message || 'Unknown error occurred.';
          const cleanStack = scenario.result?.message || 'No stack trace available.';
          const buildNumber = process.env.BUILD_NUMBER || 'LOCAL_RUN';

          const jiraService = JiraService.getInstance();
          await jiraService.reportFailure({
            summary: scenario.pickle.name,
            description: `Scenario "${scenario.pickle.name}" failed during execution.`,
            testCaseId,
            errorMessage: errorMsg,
            stackTrace: cleanStack,
            buildNumber,
            screenshotBuffer
          });
        }
      } catch (err) {
        console.warn(`[Hooks] Failed to capture or upload screenshot: ${(err as Error).message}`);
      }
    }

    await this.page.close();
  }

  if (this.context) {
    await this.context.close();
  }
});

AfterAll(async function() {
  if (globalBrowser) {
    console.log('[Hooks] Closing global browser instance.');
    await globalBrowser.close();
  }
});
