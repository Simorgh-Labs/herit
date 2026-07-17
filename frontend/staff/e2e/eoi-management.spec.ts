import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 5 — staff EOI management: staff approve and reject Pending EOIs, see
 * submissions the applicant marked Private together with their email (staff
 * read-access spans every visibility level), and delete an EOI through the
 * checkbox-gated modal.
 */

let state: RunState;
let expatApi: Api;
let expatBApi: Api;
let expatCApi: Api;
let proposalId = '';
let cfeoiId = '';

const dialog = (page: Page) => page.getByRole('dialog');
/** Header and data rows are both `div.grid`; filtering by a submitter name selects the data row. */
const rowFor = (page: Page, name: string) => page.locator('div.grid').filter({ hasText: name });

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  const scope = `${state.runId}-w${testInfo.workerIndex}`;
  expatApi = await Api.forToken(state.identities.expat.token);
  expatBApi = await Api.forToken(state.identities.expatB.token);
  expatCApi = await Api.forToken(state.identities.expatC.token);

  proposalId = await expatApi.createProposal({
    title: `Border Health Screening (E2E ${scope})`,
    shortDescription: 'Screening kiosks at major crossings.',
    longDescription: 'Deploy health-screening kiosks and staff them with trained volunteers.',
    organisationId: state.childOrgId,
  });
  await expatApi.setProposalStatus(proposalId, 'Resourcing');
  await expatApi.setProposalVisibility(proposalId, 'Shared');
  cfeoiId = await expatApi.publishCfeoi({
    title: `Screening Volunteer Lead (E2E ${scope})`,
    description: 'Coordinate volunteer screening teams.',
    resourceType: 'Human',
    proposalId,
  });
  // Both left Pending and Private (the default) so staff review from a clean slate.
  await expatBApi.submitEoi(cfeoiId, `Volunteer coordination is my background. (E2E ${scope})`);
  await expatCApi.submitEoi(cfeoiId, `I ran the last screening drive. (E2E ${scope})`);
});

test.afterAll(async () => {
  await Promise.all([expatApi.dispose(), expatBApi.dispose(), expatCApi.dispose()]);
});

test('staff approve, reject, and delete EOIs, seeing Private submissions and emails', async ({ browser }) => {
  test.setTimeout(120_000);

  const nameB = state.identities.expatB.name;
  const nameC = state.identities.expatC.name;

  const staff = await openSession(browser, 'staff', 'staff-staff');
  await staff.page.goto(staff.url(`/proposals/${proposalId}/cfeois/${cfeoiId}/eois`));
  await expect(staff.page.getByRole('heading', { name: 'Expressions of Interest' })).toBeVisible();

  await test.step('staff see both Private submissions with the email column', async () => {
    await expect(staff.page.getByText(state.identities.expatB.email)).toBeVisible();
    await expect(staff.page.getByText(state.identities.expatC.email)).toBeVisible();
    await expect(rowFor(staff.page, nameB).getByText('Private')).toBeVisible();
  });

  await test.step('staff approve one EOI and reject the other', async () => {
    await rowFor(staff.page, nameB).getByRole('button', { name: 'Approve' }).click();
    await expect(rowFor(staff.page, nameB).getByText('Approved')).toBeVisible();

    await rowFor(staff.page, nameC).getByRole('button', { name: 'Reject' }).click();
    await expect(rowFor(staff.page, nameC).getByText('Rejected')).toBeVisible();
  });

  await test.step('staff delete an EOI through the checkbox-gated modal', async () => {
    await rowFor(staff.page, nameC).getByRole('button', { name: 'Delete (staff only)' }).click();
    const deleteModal = dialog(staff.page);
    await expect(deleteModal.getByRole('heading', { name: 'Delete this expression of interest?' })).toBeVisible();
    await expect(deleteModal.getByRole('button', { name: 'Delete permanently' })).toBeDisabled();
    await deleteModal.getByRole('checkbox').check();
    await deleteModal.getByRole('button', { name: 'Delete permanently' }).click();

    // The deleted submission disappears from the list once the query refetches.
    await expect(rowFor(staff.page, nameC)).toHaveCount(0);
    // The approved submission is untouched.
    await expect(rowFor(staff.page, nameB).getByText('Approved')).toBeVisible();
  });

  await staff.context.close();
});
