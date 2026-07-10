import { Locator, Page } from '@playwright/test';

export class UIElement {
  private page: Page;
  private selector: string;
  private description: string;

  constructor(page: Page, selector: string, description: string) {
    this.page = page;
    this.selector = selector;
    this.description = description;
  }

  /**
   * Retrieves the raw Playwright Locator.
   */
  public getLocator(): Locator {
    return this.page.locator(this.selector);
  }

  /**
   * Safe action runner wrapper that executes a block of code with retries.
   */
  private async executeWithRetry<T>(action: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;
        console.warn(`[UIElement] Attempt ${attempt} failed for action on "${this.description}" (${this.selector}). Error: ${(error as Error).message}`);
        if (attempt < retries) {
          await this.page.waitForTimeout(delayMs);
        }
      }
    }
    throw new Error(`[UIElement] Action failed after ${retries} attempts on "${this.description}" (${this.selector}). Last error: ${lastError.message}`);
  }

  /**
   * Wait for the element to be visible.
   */
  public async waitForVisible(timeout = 10000): Promise<void> {
    console.log(`[UIElement] Waiting for "${this.description}" to be visible...`);
    await this.getLocator().waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for the element to be hidden.
   */
  public async waitForHidden(timeout = 10000): Promise<void> {
    console.log(`[UIElement] Waiting for "${this.description}" to be hidden...`);
    await this.getLocator().waitFor({ state: 'hidden', timeout });
  }

  /**
   * Clicks the element.
   */
  public async click(options?: { force?: boolean; timeout?: number }): Promise<void> {
    console.log(`[UIElement] Clicking on "${this.description}"`);
    await this.executeWithRetry(async () => {
      await this.getLocator().click({ ...options });
    });
  }

  /**
   * Fills the input field with text.
   */
  public async fill(value: string, options?: { timeout?: number }): Promise<void> {
    console.log(`[UIElement] Filling "${this.description}" with value: ${value}`);
    await this.executeWithRetry(async () => {
      await this.getLocator().fill(value, { ...options });
    });
  }

  /**
   * Retrieves the inner text of the element.
   */
  public async getText(): Promise<string> {
    console.log(`[UIElement] Getting text from "${this.description}"`);
    return await this.executeWithRetry(async () => {
      return await this.getLocator().innerText();
    });
  }

  /**
   * Check if the element is visible.
   */
  public async isVisible(): Promise<boolean> {
    console.log(`[UIElement] Checking visibility of "${this.description}"`);
    try {
      return await this.getLocator().isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get attribute value.
   */
  public async getAttribute(name: string): Promise<string | null> {
    console.log(`[UIElement] Getting attribute "${name}" from "${this.description}"`);
    return await this.executeWithRetry(async () => {
      return await this.getLocator().getAttribute(name);
    });
  }

  /**
   * Selects an option in a select element by label.
   */
  public async selectOption(valueOrLabel: string): Promise<string[]> {
    console.log(`[UIElement] Selecting option "${valueOrLabel}" in "${this.description}"`);
    return await this.executeWithRetry(async () => {
      return await this.getLocator().selectOption({ label: valueOrLabel });
    });
  }

  /**
   * Retrieves the selected option's visible text.
   */
  public async getSelectedText(): Promise<string> {
    console.log(`[UIElement] Getting selected option text from "${this.description}"`);
    return await this.executeWithRetry(async () => {
      return await this.page.evaluate((sel) => {
        const select = document.querySelector(sel) as HTMLSelectElement;
        return select ? select.options[select.selectedIndex].text : '';
      }, this.selector);
    });
  }
}
