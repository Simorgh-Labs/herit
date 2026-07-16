import type { Browser, BrowserContext, Page } from '@playwright/test';
import { storageStatePath } from './config';

/**
 * Opens an isolated browser context for one of the identities whose storage
 * state global.setup.ts wrote ('userA', 'userB', 'userA1-pending'), or an
 * anonymous context when no name is given. Callers should close the returned
 * context (or rely on worker shutdown at the end of the run).
 */
export async function openSession(browser: Browser, stateName?: string): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext(
    stateName ? { storageState: storageStatePath(stateName) } : {},
  );
  const page = await context.newPage();
  return { context, page };
}
