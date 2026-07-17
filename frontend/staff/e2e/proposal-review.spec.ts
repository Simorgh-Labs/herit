import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 3 — the proposal review loop: an expat submits a proposal on the
 * portal (seeded through the same owner-only API path the portal UI uses),
 * staff drive it Submitted → Under Review → Approved through the staff UI, and
 * the expat's portal "My Proposals" reflects Approved. There is no reject
 * transition anywhere in the flow — deletion is the only negative outcome.
 */

let state: RunState;
let expatApi: Api;
let proposalTitle = '';
let proposalId = '';

const dialog = (page: Page) => page.getByRole('dialog');

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  const scope = `${state.runId}-w${testInfo.workerIndex}`;
  expatApi = await Api.forToken(state.identities.expat.token);

  proposalTitle = `Diaspora Mentorship Network (E2E ${scope})`;
  proposalId = await expatApi.createProposal({
    title: proposalTitle,
    shortDescription: 'Pair returning professionals with early-career locals.',
    longDescription: 'A structured mentorship network connecting diaspora professionals with local mentees.',
    organisationId: state.childOrgId,
  });
  // Owner-only transitions, exactly what the portal UI performs on submit.
  await expatApi.setProposalStatus(proposalId, 'Resourcing');
  await expatApi.setProposalStatus(proposalId, 'Submitted');
});

test.afterAll(async () => {
  await expatApi.dispose();
});

test('staff review a submitted proposal to approval, with no reject affordance', async ({ browser }) => {
  test.setTimeout(120_000);

  const staff = await openSession(browser, 'staff', 'staff-staff');

  await test.step('the proposal appears in the staff Submitted queue', async () => {
    await staff.page.goto(staff.url('/proposals?status=Submitted'));
    const row = staff.page.getByRole('link').filter({ hasText: proposalTitle });
    await expect(row).toBeVisible();
    await row.click();
    await staff.page.waitForURL(`**/proposals/${proposalId}`);
    await expect(staff.page.getByRole('heading', { name: proposalTitle, level: 1 })).toBeVisible();
  });

  await test.step('no reject affordance is present at Submitted', async () => {
    await expect(staff.page.getByRole('button', { name: /reject/i })).toHaveCount(0);
    await expect(staff.page.getByRole('button', { name: 'Start review' })).toBeVisible();
  });

  await test.step('staff start the review', async () => {
    await staff.page.getByRole('button', { name: 'Start review' }).click();
    await expect(dialog(staff.page).getByRole('heading', { name: 'Start review?' })).toBeVisible();
    await dialog(staff.page).getByRole('button', { name: 'Start review' }).click();
    await expect(dialog(staff.page)).toBeHidden();
    await expect(staff.page.getByRole('button', { name: 'Approve' })).toBeVisible();
    await expect(staff.page.getByRole('button', { name: /reject/i })).toHaveCount(0);
  });

  await test.step('staff approve the proposal (terminal)', async () => {
    await staff.page.getByRole('button', { name: 'Approve' }).click();
    await expect(dialog(staff.page).getByRole('heading', { name: 'Approve this proposal?' })).toBeVisible();
    await dialog(staff.page).getByRole('button', { name: 'Approve' }).click();
    await expect(dialog(staff.page)).toBeHidden();
    await expect(staff.page.getByText('No further review action — approval is terminal.')).toBeVisible();
    await expect(staff.page.getByRole('button', { name: /reject/i })).toHaveCount(0);
  });

  await test.step("the expat's portal My Proposals shows Approved", async () => {
    const portal = await openSession(browser, 'portal', 'portal-expat');
    await portal.page.goto(portal.url('/my-proposals'));
    const card = portal.page.getByRole('link').filter({ hasText: proposalTitle });
    await expect(card).toBeVisible();
    await expect(card.getByText('Approved')).toBeVisible();
    await portal.context.close();
  });

  await staff.context.close();
});
