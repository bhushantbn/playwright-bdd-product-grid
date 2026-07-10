import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file if it exists
dotenv.config();

export interface AppConfig {
  baseUrl: string;
  browserName: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  defaultTimeout: number;
  azureStorage: {
    connectionString: string;
    containerName: string;
  };
}

export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private config: AppConfig;

  private constructor() {
    const env = (process.env.ENV || 'dev').toLowerCase();
    const configPath = path.resolve(__dirname, `../test-data/config.${env}.json`);

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found at: ${configPath}`);
    }

    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(fileContent) as AppConfig;
    } catch (error) {
      throw new Error(`Failed to parse configuration file at ${configPath}: ${(error as Error).message}`);
    }

    // Allow overriding from environment variables
    this.overrideWithEnv();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  private overrideWithEnv(): void {
    if (process.env.BASE_URL) {
      this.config.baseUrl = process.env.BASE_URL;
    }
    if (process.env.BROWSER_NAME) {
      const browser = process.env.BROWSER_NAME.toLowerCase();
      if (browser === 'chromium' || browser === 'firefox' || browser === 'webkit') {
        this.config.browserName = browser as 'chromium' | 'firefox' | 'webkit';
      }
    }
    if (process.env.HEADLESS !== undefined) {
      this.config.headless = process.env.HEADLESS === 'true';
    }
    if (process.env.DEFAULT_TIMEOUT) {
      const timeout = parseInt(process.env.DEFAULT_TIMEOUT, 10);
      if (!isNaN(timeout)) {
        this.config.defaultTimeout = timeout;
      }
    }
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      this.config.azureStorage.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    }
    if (process.env.AZURE_CONTAINER_NAME) {
      this.config.azureStorage.containerName = process.env.AZURE_CONTAINER_NAME;
    }
  }
}
