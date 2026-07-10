import * as fs from 'fs';
import * as path from 'path';
import { JIRA_CONFIG } from '../config/JiraConfig';

export interface DefectDetails {
  summary: string;
  description: string;
  testCaseId: string;
  errorMessage: string;
  stackTrace: string;
  buildNumber: string;
  screenshotBuffer?: Buffer;
}

export class JiraService {
  private static instance: JiraService | null = null;
  private authHeader: string;
  private cachePath: string;

  private constructor() {
    const creds = `${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`;
    this.authHeader = `Basic ${Buffer.from(creds).toString('base64')}`;
    this.cachePath = path.resolve('./test-results/jira-created-bugs.json');
    this.initializeCache();
  }

  public static getInstance(): JiraService {
    if (!JiraService.instance) {
      JiraService.instance = new JiraService();
    }
    return JiraService.instance;
  }

  /**
   * Initializes the shared cache file if it does not exist.
   */
  private initializeCache(): void {
    const dir = path.dirname(this.cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.cachePath)) {
      fs.writeFileSync(this.cachePath, JSON.stringify({}), 'utf-8');
    }
  }

  /**
   * Safe file-based locking to read/write the shared bug cache (prevents parallel worker race conditions).
   */
  private async acquireCacheLockAndExecute<T>(action: (cache: Record<string, string>) => Promise<{ result: T; updatedCache?: Record<string, string> }>): Promise<T> {
    const lockFile = `${this.cachePath}.lock`;
    let acquired = false;
    const maxRetries = 10;
    const retryDelayMs = 500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create directory lock atomically using wx flag
        fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
        acquired = true;
        break;
      } catch (err) {
        // Lock is held by another worker, wait and retry
        await new Promise(resolve => setTimeout(resolve, retryDelayMs + Math.random() * 100));
      }
    }

    if (!acquired) {
      console.warn(`[JiraService] Could not acquire cache lock after ${maxRetries} attempts. Proceeding directly.`);
    }

    try {
      const fileContent = fs.readFileSync(this.cachePath, 'utf-8') || '{}';
      const cache = JSON.parse(fileContent);
      const { result, updatedCache } = await action(cache);
      
      if (updatedCache) {
        fs.writeFileSync(this.cachePath, JSON.stringify(updatedCache, null, 2), 'utf-8');
      }
      return result;
    } finally {
      if (acquired && fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
      }
    }
  }

  /**
   * Main entry point to report a scenario failure.
   */
  public async reportFailure(details: DefectDetails): Promise<void> {
    if (!JIRA_CONFIG.enabled) {
      console.log(`[JiraService] Jira integration is disabled. Skipping defect reporting for: ${details.testCaseId}`);
      return;
    }

    try {
      console.log(`[JiraService] Processing failure for test case ID: ${details.testCaseId}`);
      
      // Use process lock to avoid parallel workers querying/creating duplicate issues simultaneously
      await this.acquireCacheLockAndExecute(async (cache) => {
        let issueKey: string | null = cache[details.testCaseId] || null;

        if (issueKey) {
          console.log(`[JiraService] Defect found in local run cache: ${issueKey}. Appending comment.`);
          await this.addCommentAndAttachment(issueKey, details);
          return { result: void 0 };
        }

        // Query Jira to see if there is an active bug reported in a previous run
        issueKey = await this.searchActiveDefect(details.testCaseId);

        if (issueKey) {
          console.log(`[JiraService] Active defect found on Jira: ${issueKey}. Appending comment and caching.`);
          await this.addCommentAndAttachment(issueKey, details);
          cache[details.testCaseId] = issueKey; // Save to local cache
          return { result: void 0, updatedCache: cache };
        }

        // No active defect exists. Create a new Bug.
        console.log(`[JiraService] No active defect exists for ${details.testCaseId}. Creating a new Bug.`);
        const newIssueKey = await this.createDefect(details);
        
        if (newIssueKey) {
          console.log(`[JiraService] Defect created successfully: ${newIssueKey}`);
          if (details.screenshotBuffer) {
            await this.uploadAttachment(newIssueKey, details.screenshotBuffer, `failed-${details.testCaseId}.png`);
          }
          cache[details.testCaseId] = newIssueKey;
          return { result: void 0, updatedCache: cache };
        }

        return { result: void 0 };
      });
    } catch (error) {
      console.error(`[JiraService] Failed to report defect for ${details.testCaseId}:`, error);
    }
  }

  /**
   * Searches Jira for an active Bug matching the Test Case ID label.
   */
  private async searchActiveDefect(testCaseId: string): Promise<string | null> {
    // JQL query checks for unresolved issues tagged with the Test Case ID
    const jql = `project = "${JIRA_CONFIG.projectKey}" AND issuetype = Bug AND statusCategory != Done AND labels = "${testCaseId}"`;
    const url = `${JIRA_CONFIG.host}/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Jira search API returned status ${response.status}: ${errText}`);
    }

    const data: any = await response.json();
    if (data.issues && data.issues.length > 0) {
      return data.issues[0].key;
    }
    return null;
  }

  /**
   * Creates a new Jira bug defect.
   */
  private async createDefect(details: DefectDetails): Promise<string> {
    const url = `${JIRA_CONFIG.host}/rest/api/2/issue`;
    
    const body = {
      fields: {
        project: {
          key: JIRA_CONFIG.projectKey
        },
        summary: `[Automation Failure] Test Case ${details.testCaseId}: ${details.summary}`,
        description: `*Test Case ID:* ${details.testCaseId}\n*Execution Date:* ${new Date().toISOString()}\n*Build Number:* ${details.buildNumber}\n\n*Error Message:*\n{code}\n${details.errorMessage}\n{code}\n\n*Stack Trace:*\n{code:java}\n${details.stackTrace}\n{code}`,
        issuetype: {
          name: 'Bug'
        },
        labels: ['automation-failure', details.testCaseId]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Jira create API returned status ${response.status}: ${errText}`);
    }

    const data: any = await response.json();
    return data.key;
  }

  /**
   * Adds a failure comment to an existing bug and uploads latest screenshot.
   */
  private async addCommentAndAttachment(issueKey: string, details: DefectDetails): Promise<void> {
    // 1. Add failure comment
    const url = `${JIRA_CONFIG.host}/rest/api/2/issue/${issueKey}/comment`;
    const commentBody = {
      body: `*Automation Run Failure Comment*\n*Execution Date:* ${new Date().toISOString()}\n*Build Number:* ${details.buildNumber}\n\n*Latest Failure Details:*\n{code}\n${details.errorMessage}\n{code}`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(commentBody)
    });

    if (!response.ok) {
      console.warn(`[JiraService] Failed to add comment to ${issueKey}: ${await response.text()}`);
    }

    // 2. Upload latest screenshot attachment
    if (details.screenshotBuffer) {
      await this.uploadAttachment(issueKey, details.screenshotBuffer, `failed-${details.testCaseId}-${Date.now()}.png`);
    }
  }

  /**
   * Uploads an attachment to a Jira issue using native multipart/form-data.
   */
  private async uploadAttachment(issueKey: string, fileBuffer: Buffer, fileName: string): Promise<void> {
    const url = `${JIRA_CONFIG.host}/rest/api/2/issue/${issueKey}/attachments`;
    
    // Construct boundary and multipart form body manually
    const boundary = `----PlaywrightJiraMultipartBoundary${Date.now()}`;
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`;
    const footer = `\r\n--${boundary}--`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(header, 'utf-8'),
      fileBuffer,
      Buffer.from(footer, 'utf-8')
    ]);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'X-Atlassian-Token': 'no-check',
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: bodyBuffer
    });

    if (!response.ok) {
      console.warn(`[JiraService] Failed to upload attachment to ${issueKey}: ${await response.text()}`);
    }
  }
}
