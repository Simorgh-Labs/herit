import type { Browser, BrowserContext, Page } from '@playwright/test';
import { originUrl, storageStatePath, type AppOrigin } from './config';

export interface Session {
  context: BrowserContext;
  page: Page;
  /** Absolute URL on the app this session targets, e.g. session.url('/rfps'). */
  url: (path: string) => string;
}

/**
 * Opens an isolated browser context for one of the identities whose storage
 * state global.setup.ts wrote, scoped to a specific app origin (staff or
 * portal), or an anonymous context when no storage-state name is given.
 * Because the staff and portal apps run on different ports, `page.goto` needs
 * an absolute URL — use `session.url(path)`. Callers should close the returned
 * context (or rely on worker shutdown at the end of the run).
 */
export async function openSession(browser: Browser, app: AppOrigin, stateName?: string): Promise<Session> {
  const context = await browser.newContext(
    stateName ? { storageState: storageStatePath(stateName) } : {},
  );
  const page = await context.newPage();
  const base = originUrl(app);
  return { context, page, url: (path: string) => `${base}${path}` };
}
