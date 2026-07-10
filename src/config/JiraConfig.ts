import * as dotenv from 'dotenv';
dotenv.config();

export interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
  projectKey: string;
  enabled: boolean;
}

export const JIRA_CONFIG: JiraConfig = {
  host: process.env.JIRA_HOST || '',
  email: process.env.JIRA_EMAIL || '',
  apiToken: process.env.JIRA_API_TOKEN || '',
  projectKey: process.env.JIRA_PROJECT_KEY || '',
  enabled: process.env.JIRA_INTEGRATION_ENABLED === 'true',
};

export function validateJiraConfig(): void {
  if (!JIRA_CONFIG.enabled) return;
  const missing = [];
  if (!JIRA_CONFIG.host) missing.push('JIRA_HOST');
  if (!JIRA_CONFIG.email) missing.push('JIRA_EMAIL');
  if (!JIRA_CONFIG.apiToken) missing.push('JIRA_API_TOKEN');
  if (!JIRA_CONFIG.projectKey) missing.push('JIRA_PROJECT_KEY');

  if (missing.length > 0) {
    throw new Error(`[JiraConfig] Missing required variables: ${missing.join(', ')}`);
  }
}
