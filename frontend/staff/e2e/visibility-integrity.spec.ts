import { expect, test } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 7 — visibility integrity: a Private proposal is visible to staff in
 * the "All proposals" tab by design, while remaining invisible to an anonymous
 * portal session. The staff read bypass and the public visibility filter must
 * coexist correctly — one assertion pair proves both.
 */

let state: RunState;
let expatApi: Api;
let proposalTitle = '';
let proposalId = '';

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  const scope = `${state.runId}-w${testInfo.workerIndex}`;
  expatApi = await Api.forToken(state.identities.expat.token);

  // Proposals are created Private by default; leave it Private.
  proposalTitle = `Confidential Vaccine Logistics (E2E ${scope})`;
  proposalId = await expatApi.createProposal({
    title: proposalTitle,
    shortDescription: 'Cold-chain logistics plan — not for public listing.',
    longDescription: 'A private working proposal for vaccine cold-chain logistics.',
    organisationId: state.childOrgId,
  });
});

test.afterAll(async () => {
  await expatApi.dispose();
});

test('a Private proposal is visible to staff but hidden from the public portal', async ({ browser }) => {
  test.setTimeout(120_000);

  await test.step('staff see the Private proposal in the All tab', async () => {
    const staff = await openSession(browser, 'staff', 'staff-staff');
    await staff.page.goto(staff.url('/proposals?status=All'));
    const row = staff.page.getByRole('link').filter({ hasText: proposalTitle });
    await expect(row).toBeVisible();
    await expect(row.getByText('Private')).toBeVisible();
    await staff.context.close();
  });

  await test.step('the public API and portal both withhold it from anonymous callers', async () => {
    const anon = await Api.anonymous();
    expect((await anon.listProposals()).map((p) => p.title)).not.toContain(proposalTitle);
    await anon.dispose();

    const portal = await openSession(browser, 'portal');
    await portal.page.goto(portal.url('/proposals'));
    await portal.page.getByPlaceholder('Search proposals by title or description...').fill(proposalTitle);
    await expect(portal.page.getByRole('heading', { name: proposalTitle })).toHaveCount(0);

    await portal.page.goto(portal.url(`/proposals/${proposalId}`));
    await expect(portal.page.getByText('This proposal is not publicly available.')).toBeVisible();
    await portal.context.close();
  });
});
