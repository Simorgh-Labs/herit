import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 4 — takedown cascade: deleting a proposal that has a CFEOI with an
 * EOI removes the whole subtree. The contributor's portal "My EOIs" no longer
 * lists the CFEOI, and the API confirms the CFEOI and EOI are gone.
 */

let state: RunState;
let expatApi: Api;
let expatBApi: Api;
let proposalTitle = '';
let proposalId = '';
let cfeoiTitle = '';
let cfeoiId = '';
let eoiId = '';

const dialog = (page: Page) => page.getByRole('dialog');

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  const scope = `${state.runId}-w${testInfo.workerIndex}`;
  expatApi = await Api.forToken(state.identities.expat.token);
  expatBApi = await Api.forToken(state.identities.expatB.token);

  proposalTitle = `Rural Telehealth Rollout (E2E ${scope})`;
  proposalId = await expatApi.createProposal({
    title: proposalTitle,
    shortDescription: 'Bring telehealth kits to remote clinics.',
    longDescription: 'A staged rollout of telehealth equipment and training to rural clinics.',
    organisationId: state.childOrgId,
  });
  await expatApi.setProposalStatus(proposalId, 'Resourcing');
  await expatApi.setProposalVisibility(proposalId, 'Shared');

  cfeoiTitle = `Telehealth Field Engineer (E2E ${scope})`;
  cfeoiId = await expatApi.publishCfeoi({
    title: cfeoiTitle,
    description: 'Install and maintain telehealth kits on site.',
    resourceType: 'Human',
    proposalId,
  });
  eoiId = await expatBApi.submitEoi(cfeoiId, `Happy to run the rural installs. (E2E ${scope})`);
});

test.afterAll(async () => {
  await Promise.all([expatApi.dispose(), expatBApi.dispose()]);
});

test('deleting a proposal cascades to its CFEOI and EOI', async ({ browser }) => {
  test.setTimeout(120_000);

  const portal = await openSession(browser, 'portal', 'portal-expatB');

  await test.step("the contributor's My EOIs lists the CFEOI to start", async () => {
    await portal.page.goto(portal.url('/my-eois'));
    await expect(portal.page.getByRole('link', { name: cfeoiTitle })).toBeVisible();
  });

  const staff = await openSession(browser, 'staff', 'staff-staff');

  await test.step('staff delete the proposal (checkbox-gated takedown)', async () => {
    await staff.page.goto(staff.url(`/proposals/${proposalId}`));
    await expect(staff.page.getByRole('heading', { name: proposalTitle, level: 1 })).toBeVisible();
    // The CFEOI is listed under the proposal before deletion (substring match —
    // the link's accessible name also includes the EOI count and status).
    await expect(staff.page.getByRole('link', { name: cfeoiTitle })).toBeVisible();

    await staff.page.getByRole('button', { name: 'Delete proposal' }).click();
    const deleteModal = dialog(staff.page);
    await expect(deleteModal.getByText('its CFEOIs and their EOIs are permanently deleted', { exact: false })).toBeVisible();
    await expect(deleteModal.getByRole('button', { name: 'Delete proposal' })).toBeDisabled();
    await deleteModal.getByRole('checkbox').check();
    await deleteModal.getByRole('button', { name: 'Delete proposal' }).click();
    await staff.page.waitForURL('**/proposals?deleted=true');
    await expect(staff.page.getByText('Proposal deleted.')).toBeVisible();
  });

  await test.step('the CFEOI and EOI are gone at the API level', async () => {
    // The CFEOI no longer resolves, and the contributor no longer owns the EOI.
    const cfeoiLookup = await expatApi.raw('GET', `/Cfeoi/${cfeoiId}`);
    expect(cfeoiLookup.status()).toBe(404);
    const remainingEois = await expatBApi.listMyEois();
    expect(remainingEois.map((e) => e.id)).not.toContain(eoiId);
  });

  await test.step("the contributor's portal My EOIs no longer lists the CFEOI", async () => {
    await portal.page.goto(portal.url('/my-eois'));
    await expect(portal.page.getByRole('link', { name: cfeoiTitle })).toHaveCount(0);
  });

  await staff.context.close();
  await portal.context.close();
});
