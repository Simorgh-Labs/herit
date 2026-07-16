import { expect, test } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 4 — flow 1, unauthenticated browsing: published RFPs and Public
 * proposals/CFEOIs are fully readable with no session, unpublished RFPs never
 * leak, and any attempt to interact prompts sign-in.
 */

let state: RunState;
let apiA: Api;
let staffApi: Api;

let publicProposalTitle = '';
let publicCfeoiTitle = '';
let draftRfpTitle = '';
let draftRfpId = '';

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  // Worker-scoped suffix: if Playwright restarts the worker after a failure,
  // beforeAll runs again — fresh titles keep re-seeded fixtures unambiguous.
  const scope = `${state.runId}-w${testInfo.workerIndex}`;
  apiA = await Api.forToken(state.identities.userA.token);
  staffApi = await Api.forToken(state.identities.staff.token);

  publicProposalTitle = `Unauth public proposal (E2E ${scope})`;
  publicCfeoiTitle = `Unauth public role (E2E ${scope})`;
  const proposalId = await apiA.createProposal({
    title: publicProposalTitle,
    shortDescription: 'Public fixture proposal for unauthenticated browsing.',
    longDescription: 'Anyone — including anonymous visitors — should be able to read this.',
    organisationId: state.childOrgId,
  });
  await apiA.setProposalVisibility(proposalId, 'Public');
  await apiA.setProposalStatus(proposalId, 'Resourcing');
  await apiA.publishCfeoi({
    title: publicCfeoiTitle,
    description: 'Open role under the public fixture proposal.',
    resourceType: 'Human',
    proposalId,
  });

  draftRfpTitle = `Unauth draft RFP (E2E ${scope})`;
  draftRfpId = await staffApi.createRfp({
    title: draftRfpTitle,
    shortDescription: 'Draft RFP that must never be visible to the public.',
    organisationId: state.rootOrgId,
    longDescription: 'Unpublished fixture RFP.',
  });
});

test.afterAll(async () => {
  try {
    await staffApi.deleteRfp(draftRfpId);
  } catch {
    // best-effort; run-scoped title keeps future runs unaffected
  }
  await Promise.all([apiA.dispose(), staffApi.dispose()]);
});

test('anonymous visitors see published RFPs only, and can read the detail', async ({ browser }) => {
  // Server-side: only Published RFPs are returned to anonymous callers.
  const anon = await Api.anonymous();
  const rfps = await anon.listRfps();
  expect(rfps.map((r) => r.title)).toContain(state.rfpTitle);
  expect(rfps.map((r) => r.title)).not.toContain(draftRfpTitle);
  expect(rfps.every((r) => r.status === 'Published')).toBe(true);
  await anon.dispose();

  const { context, page } = await openSession(browser);
  await page.goto('/rfps');
  await page.getByPlaceholder('Search by title, organisation, or tags…').fill(state.rfpTitle);
  await expect(page.getByRole('heading', { name: state.rfpTitle })).toBeVisible();
  await page.getByRole('link', { name: 'View Details' }).click();

  await expect(page.getByRole('heading', { name: state.rfpTitle, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sign in to contribute' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
  await context.close();
});

test('anonymous visitors can browse a Public proposal end-to-end', async ({ browser }) => {
  const { context, page } = await openSession(browser);
  await page.goto('/proposals');
  await page.getByPlaceholder('Search proposals by title or description...').fill(publicProposalTitle);
  await expect(page.getByRole('heading', { name: publicProposalTitle })).toBeVisible();
  await page.getByRole('link', { name: 'View Details' }).click();

  await expect(page.getByRole('heading', { name: publicProposalTitle, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Join the Team' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
  await context.close();
});

test('Express Interest prompts sign-in for anonymous visitors', async ({ browser }) => {
  const { context, page } = await openSession(browser);
  await page.goto('/cfeois');
  await page.getByPlaceholder('Search by title or tags…').fill(publicCfeoiTitle);
  await expect(page.getByRole('heading', { name: publicCfeoiTitle })).toBeVisible();
  await page.getByRole('link', { name: 'View Details' }).click();

  await page.getByRole('button', { name: 'Sign In to Express Interest' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Sign in required' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Sign in with Google', exact: true }).click();

  // The test-auth stub records the sign-in attempt; the session stays anonymous
  // because no identity was staged.
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem('herit.e2e.loginRequested')))
    .not.toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem('herit.e2e.auth'))).toBeNull();
  await context.close();
});
