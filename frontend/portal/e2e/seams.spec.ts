import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 3 — seams and terminal states: the already-submitted CTA swap (and
 * its return after withdraw), Closed-CFEOI behaviour for contributor vs owner,
 * per-status Withdraw/Delete labels with the checkbox-gated modal, and the
 * auth/ownership guards on owner routes.
 */

let state: RunState;
let apiA: Api;
let apiB: Api;

let revisitCfeoiId = '';
let closedCfeoiId = '';
let pendingCfeoiTitle = '';
let approvedCfeoiTitle = '';
let rejectedCfeoiTitle = '';
let pendingCfeoiId = '';
let hostProposalId = '';

let scope = '';

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  // Worker-scoped suffix: if Playwright restarts the worker after a failure,
  // beforeAll runs again — fresh titles keep re-seeded fixtures unambiguous.
  scope = `${state.runId}-w${testInfo.workerIndex}`;
  apiA = await Api.forToken(state.identities.userA.token);
  apiB = await Api.forToken(state.identities.userB.token);

  const proposalId = await apiA.createProposal({
    title: `Seams host proposal (E2E ${scope})`,
    shortDescription: 'Host proposal for seam and terminal-state fixtures.',
    longDescription: 'Fixture proposal owning the CFEOIs used by scenario 3.',
    organisationId: state.childOrgId,
  });
  hostProposalId = proposalId;
  await apiA.setProposalVisibility(proposalId, 'Shared');
  await apiA.setProposalStatus(proposalId, 'Resourcing');

  const publish = (label: string) =>
    apiA.publishCfeoi({
      title: `Seams ${label} role (E2E ${scope})`,
      description: `Fixture CFEOI (${label}).`,
      resourceType: 'Human',
      proposalId,
    });

  revisitCfeoiId = await publish('revisit');
  closedCfeoiId = await publish('closing');
  pendingCfeoiId = await publish('pending');
  const approvedCfeoiId = await publish('approved');
  const rejectedCfeoiId = await publish('rejected');
  pendingCfeoiTitle = `Seams pending role (E2E ${scope})`;
  approvedCfeoiTitle = `Seams approved role (E2E ${scope})`;
  rejectedCfeoiTitle = `Seams rejected role (E2E ${scope})`;

  // B's EOIs in each reviewable status.
  await apiB.submitEoi(pendingCfeoiId, `Seams pending EOI (E2E ${state.runId})`);
  const approvedEoiId = await apiB.submitEoi(approvedCfeoiId, `Seams approved EOI (E2E ${state.runId})`);
  await apiB.setEoiVisibility(approvedEoiId, 'Shared');
  await apiA.setEoiStatus(approvedEoiId, 'Approved');
  const rejectedEoiId = await apiB.submitEoi(rejectedCfeoiId, `Seams rejected EOI (E2E ${state.runId})`);
  await apiB.setEoiVisibility(rejectedEoiId, 'Shared');
  await apiA.setEoiStatus(rejectedEoiId, 'Rejected');

  // A shared EOI on a CFEOI the owner then closes.
  const closedEoiId = await apiB.submitEoi(closedCfeoiId, `Seams closed-role EOI (E2E ${state.runId})`);
  await apiB.setEoiVisibility(closedEoiId, 'Shared');
  await apiA.setCfeoiStatus(closedCfeoiId, 'Closed');
});

test.afterAll(async () => {
  await Promise.all([apiA.dispose(), apiB.dispose()]);
});

const myEoiCard = (page: Page, cfeoiTitle: string) =>
  page.locator('div.rounded-xl').filter({ has: page.getByRole('link', { name: cfeoiTitle }) });

test('Express Interest is replaced after submission and returns after withdrawal', async ({ browser }) => {
  const eoiId = await apiB.submitEoi(revisitCfeoiId, `Seams revisit EOI (E2E ${state.runId})`);

  const { context, page } = await openSession(browser, 'userB');
  await page.goto(`/cfeois/${revisitCfeoiId}`);
  await expect(page.getByRole('heading', { name: /You.ve expressed interest/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Express Interest' })).toBeHidden();
  await expect(page.getByRole('link', { name: 'View in My EOIs' })).toBeVisible();

  // Withdraw-then-revisit: the CTA returns.
  await apiB.withdrawEoi(eoiId);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Express Interest' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /You.ve expressed interest/ })).toBeHidden();
  await context.close();
});

test('a Closed CFEOI accepts no interest but stays reviewable for the owner', async ({ browser }) => {
  const b = await openSession(browser, 'userB');
  await b.page.goto(`/cfeois/${closedCfeoiId}`);
  await expect(b.page.getByText('This CFEOI is now closed.')).toBeVisible();
  await expect(b.page.getByRole('heading', { name: 'This role is closed' })).toBeVisible();
  await expect(b.page.getByRole('link', { name: 'Express Interest' })).toBeHidden();
  await expect(b.page.getByRole('button', { name: 'Sign In to Express Interest' })).toBeHidden();
  await b.context.close();

  const a = await openSession(browser, 'userA');
  await a.page.goto(`/cfeois/${closedCfeoiId}/eois`);
  await expect(a.page.getByRole('heading', { name: 'Expressions of Interest' })).toBeVisible();
  await expect(a.page.getByText('This CFEOI is now closed.')).toBeVisible();
  await expect(a.page.getByText(`Seams closed-role EOI (E2E ${state.runId})`)).toBeVisible();
  await a.context.close();
});

test('My EOIs labels the removal action per status and gates it behind the checkbox', async ({ browser }) => {
  const { context, page } = await openSession(browser, 'userB');
  await page.goto('/my-eois');

  await expect(myEoiCard(page, pendingCfeoiTitle).getByRole('button', { name: 'Withdraw' })).toBeVisible();
  await expect(myEoiCard(page, approvedCfeoiTitle).getByRole('button', { name: 'Withdraw' })).toBeVisible();
  await expect(myEoiCard(page, rejectedCfeoiTitle).getByRole('button', { name: 'Delete' })).toBeVisible();

  // Delete the rejected EOI through the checkbox-gated confirmation modal.
  await myEoiCard(page, rejectedCfeoiTitle).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Delete expression of interest?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete EOI' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete EOI' }).click();

  await expect(page.getByText('Your expression of interest was deleted.')).toBeVisible();
  await expect(myEoiCard(page, rejectedCfeoiTitle)).toBeHidden();
  await context.close();
});

test('unauthenticated visits to owner routes redirect to sign-in', async ({ browser }) => {
  const { context, page } = await openSession(browser);
  await page.goto('/my-eois');
  await page.waitForURL('**/sign-in');
  await page.goto('/dashboard');
  await page.waitForURL('**/sign-in');
  await context.close();
});

test("a non-owner cannot reach another user's EOI inbox", async ({ browser }) => {
  const { context, page } = await openSession(browser, 'userB');
  await page.goto(`/cfeois/${pendingCfeoiId}/eois`);
  await expect(page.getByRole('heading', { name: 'Cannot view this inbox' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeHidden();
  await context.close();
});

test("expat B mutating expat A's proposal is rejected with 403 at the API", async () => {
  const response = await apiB.raw('PATCH', `/Proposals/${hostProposalId}/status`, JSON.stringify('Submitted'));
  expect(response.status()).toBe(403);
});

test("the by-id profile route is gone; only /me/profile can update a user's own profile", async () => {
  const other = await apiA.getMe();
  const response = await apiB.raw('PATCH', `/Users/${other.id}/profile`, { nationality: 'Nowhere' });
  expect(response.status()).toBe(404);
});
