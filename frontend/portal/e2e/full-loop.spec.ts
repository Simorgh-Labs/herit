import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 1 — the core journey, driven end-to-end through the UI:
 * first-time sign-in (JIT registration) → create proposal → Resourcing →
 * publish CFEOI → contributor B finds it, submits an EOI, shares it →
 * owner approves it in the inbox → CFEOI closed → proposal submitted →
 * proposal withdrawn (terminal).
 *
 * User A1 is minted in global setup but never registered, so the JIT
 * registration form is genuinely first-time for every run.
 */

let state: RunState;

test.beforeAll(() => {
  state = readRunState();
});

const modal = (page: Page) => page.locator('div.fixed.inset-0').filter({ has: page.getByRole('checkbox') });

test('full loop: JIT sign-in through proposal withdrawal', async ({ browser }) => {
  test.setTimeout(300_000);

  const proposalTitle = `Community Health Outreach (E2E ${state.runId})`;
  const cfeoiTitle = `Data Platform Architect (E2E ${state.runId})`;
  const eoiMessage = `I led two national FHIR rollouts and would love to contribute. (E2E ${state.runId})`;
  let proposalId = '';
  let cfeoiId = '';

  // ---- User A1: anonymous, with the identity staged for the fake redirect ----
  const a1 = await openSession(browser, 'userA1-pending');

  await test.step('A1 signs in for the first time and lands on JIT registration', async () => {
    await a1.page.goto('/sign-in');
    // exact: the public nav renders its own "Sign In with Google" button.
    await a1.page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
    // The test-auth stub simulates the Entra redirect round-trip with a reload.
    await expect(a1.page.getByRole('banner').getByRole('link', { name: 'Create Proposal' })).toBeVisible();

    // First authenticated visit: not yet profiled → redirected to complete-profile.
    await a1.page.goto('/dashboard');
    await a1.page.waitForURL('**/auth/complete-profile');
    await expect(a1.page.getByRole('heading', { name: 'Complete Your Profile' })).toBeVisible();

    await a1.page.getByLabel('Full Name').fill('Expat User A1');
    await a1.page.getByLabel('Home Country / Nationality').fill('Australia');
    await a1.page.getByLabel('Current Residence').fill('Sydney, Australia');
    await a1.page.getByLabel('Expertise Tags').fill('Health IT, Data Platforms');
    await a1.page.getByLabel('I accept the terms and conditions').check();
    await a1.page.getByRole('button', { name: 'Join Herit' }).click();
    await a1.page.waitForURL('**/dashboard');
  });

  await test.step('A1 creates a standalone proposal (lands in Ideation)', async () => {
    // The dashboard body has its own Create Proposal quick action; use the nav's.
    await a1.page.getByRole('banner').getByRole('link', { name: 'Create Proposal' }).click();
    await a1.page.waitForURL('**/proposals/new');
    await a1.page.getByLabel('Proposal Title').fill(proposalTitle);
    await a1.page.getByLabel('Short Description').fill('Mobile outreach clinics staffed by diaspora clinicians.');
    await a1.page.getByLabel('Associated Organisation').selectOption({ label: state.childOrgName });
    await a1.page.getByLabel('Detailed Proposal').fill('A rolling program of mobile outreach clinics, connecting diaspora health professionals with underserved districts.');
    await a1.page.getByRole('button', { name: 'Save Proposal' }).click();

    await a1.page.waitForURL(/\/proposals\/[0-9a-f-]+\?created=true/);
    proposalId = /\/proposals\/([0-9a-f-]+)/.exec(a1.page.url())![1];
    await expect(a1.page.getByText('Proposal created!')).toBeVisible();
    await expect(a1.page.getByText('Ideation', { exact: true })).toBeVisible();
  });

  await test.step('A1 moves the proposal to Resourcing', async () => {
    await a1.page.getByRole('button', { name: 'Move to Resourcing' }).click();
    await expect(a1.page.getByRole('button', { name: 'Submit to Organisation' })).toBeVisible();
    await expect(a1.page.getByText('Resourcing', { exact: true })).toBeVisible();
  });

  await test.step('A1 shares the proposal so contributors can find it', async () => {
    await a1.page.getByRole('button', { name: 'Change' }).click();
    await a1.page.getByRole('radio', { name: 'Shared' }).check();
    await a1.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(a1.page.getByText('Visible to signed-in users')).toBeVisible();
  });

  await test.step('A1 publishes a CFEOI (immediately Open)', async () => {
    await a1.page.getByRole('link', { name: 'Publish a CFEOI' }).click();
    await a1.page.waitForURL('**/cfeois/new');
    await a1.page.getByLabel('Title').fill(cfeoiTitle);
    await a1.page.getByLabel('Description').fill('Architect the data-exchange layer for the outreach program.');
    // "Non-Human" also contains "Human", so anchor the accessible-name match.
    await a1.page.getByRole('radio', { name: /^Human/ }).check();
    await a1.page.getByLabel('Tags').fill('System Architecture, FHIR');
    await a1.page.getByRole('button', { name: 'Publish CFEOI' }).click();

    await a1.page.waitForURL(/\/cfeois\/[0-9a-f-]+\?published=true/);
    cfeoiId = /\/cfeois\/([0-9a-f-]+)/.exec(a1.page.url())![1];
    await expect(a1.page.getByText('CFEOI published successfully')).toBeVisible();
    await expect(a1.page.getByText('Open', { exact: true })).toBeVisible();
  });

  // ---- User B: registered contributor ----
  const b = await openSession(browser, 'userB');

  await test.step('B finds the CFEOI in the directory and submits an EOI', async () => {
    await b.page.goto('/cfeois');
    await b.page.getByPlaceholder('Search by title or tags…').fill(cfeoiTitle);
    await expect(b.page.getByRole('heading', { name: cfeoiTitle })).toBeVisible();
    await b.page.getByRole('link', { name: 'View Details' }).click();
    await b.page.waitForURL(`**/cfeois/${cfeoiId}`);

    await b.page.getByRole('link', { name: 'Express Interest' }).click();
    await b.page.waitForURL(`**/cfeois/${cfeoiId}/eois/new`);
    await b.page.getByLabel('Cover note').fill(eoiMessage);
    await b.page.getByRole('button', { name: 'Submit expression of interest' }).click();

    await b.page.waitForURL(`**/cfeois/${cfeoiId}?submitted=true`);
    await expect(b.page.getByText('Your expression of interest was submitted')).toBeVisible();
    await expect(b.page.getByRole('heading', { name: /You.ve expressed interest/ })).toBeVisible();
  });

  await test.step('the EOI is created Pending and Private (server state)', async () => {
    const apiB = await Api.forToken(state.identities.userB.token);
    const eoi = (await apiB.listMyEois()).find((e) => e.cfeoiId === cfeoiId);
    expect(eoi).toBeDefined();
    expect(eoi!.status).toBe('Pending');
    expect(eoi!.visibility).toBe('Private');
    await apiB.dispose();
  });

  await test.step('B shares the EOI from My EOIs', async () => {
    await b.page.goto('/my-eois');
    const card = b.page.locator('div.rounded-xl').filter({ has: b.page.getByRole('link', { name: cfeoiTitle }) });
    await card.getByRole('button', { name: 'Shared', exact: true }).click();
    await expect(card.getByRole('button', { name: 'Shared', exact: true })).toHaveClass(/bg-white/);

    const apiB = await Api.forToken(state.identities.userB.token);
    await expect
      .poll(async () => (await apiB.listMyEois()).find((e) => e.cfeoiId === cfeoiId)?.visibility)
      .toBe('Shared');
    await apiB.dispose();
  });

  await test.step("A1 sees B's real name (not a GUID fragment) in the inbox and approves it", async () => {
    const apiB = await Api.forToken(state.identities.userB.token);
    const submitterName = (await apiB.listMyEois()).find((e) => e.cfeoiId === cfeoiId)!.submitterName;
    await apiB.dispose();

    await a1.page.goto(`/cfeois/${cfeoiId}/eois`);
    await expect(a1.page.getByRole('heading', { name: 'Expressions of Interest' })).toBeVisible();
    const eoiCard = a1.page.locator('div.divide-y > div').filter({ hasText: eoiMessage });
    await expect(eoiCard).toBeVisible();
    await expect(eoiCard.getByText(submitterName, { exact: true })).toBeVisible();
    await expect(eoiCard.getByText(/^Submitter #/)).toHaveCount(0);
    await eoiCard.getByRole('button', { name: 'Approve' }).click();
    await expect(eoiCard.getByText('Approved')).toBeVisible();
  });

  await test.step('A1 closes the CFEOI (terminal, checkbox-gated)', async () => {
    await a1.page.goto(`/cfeois/${cfeoiId}`);
    await a1.page.getByRole('button', { name: 'Close CFEOI' }).click();
    const closeModal = modal(a1.page);
    await expect(closeModal.getByRole('heading', { name: 'Close CFEOI?' })).toBeVisible();
    await expect(closeModal.getByRole('button', { name: 'Close CFEOI' })).toBeDisabled();
    await closeModal.getByRole('checkbox').check();
    await closeModal.getByRole('button', { name: 'Close CFEOI' }).click();
    await expect(a1.page.getByText('This CFEOI is now closed.')).toBeVisible();
  });

  await test.step('A1 submits the proposal, then withdraws it (terminal, read-only)', async () => {
    await a1.page.goto(`/proposals/${proposalId}`);
    await a1.page.getByRole('button', { name: 'Submit to Organisation' }).click();
    await expect(a1.page.getByText('Submitted', { exact: true })).toBeVisible();

    await a1.page.getByRole('button', { name: 'Withdraw Proposal' }).click();
    const withdrawModal = modal(a1.page);
    await expect(withdrawModal.getByRole('heading', { name: 'Withdraw proposal?' })).toBeVisible();
    await expect(withdrawModal.getByRole('button', { name: 'Withdraw Proposal' })).toBeDisabled();
    await withdrawModal.getByRole('checkbox').check();
    await withdrawModal.getByRole('button', { name: 'Withdraw Proposal' }).click();

    await expect(a1.page.getByText('Withdrawn', { exact: true })).toBeVisible();
    await expect(a1.page.getByText('Proposal Withdrawn')).toBeVisible();
    await expect(a1.page.getByRole('button', { name: 'Move to Resourcing' })).toBeHidden();
    await expect(a1.page.getByRole('button', { name: 'Submit to Organisation' })).toBeHidden();
    await expect(a1.page.getByRole('button', { name: 'Withdraw Proposal' })).toBeHidden();
  });

  await test.step("B's EOI reflects the approval", async () => {
    const apiB = await Api.forToken(state.identities.userB.token);
    const eoi = (await apiB.listMyEois()).find((e) => e.cfeoiId === cfeoiId);
    expect(eoi?.status).toBe('Approved');
    await apiB.dispose();
  });

  await a1.context.close();
  await b.context.close();
});
