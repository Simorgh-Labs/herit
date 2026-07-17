import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 2 — RFP lifecycle driven through the staff UI (create → Draft →
 * Approve → Publish), with the outcome asserted on the expat portal: a
 * published RFP appears there, an edit-after-publish reaches the portal with no
 * re-approval, and a delete removes it from the portal.
 *
 * Per ADR-017 any staff user can perform every transition, so a plain staff
 * identity drives the whole flow.
 */

let state: RunState;

test.beforeAll(() => {
  state = readRunState();
});

/** The staff Modal renders a role="dialog"; scope confirm clicks to it. */
const dialog = (page: Page) => page.getByRole('dialog');

test('publish an RFP from the staff app and see it flow to the portal', async ({ browser }) => {
  test.setTimeout(120_000);

  const title = `Coastal Flood Modelling (E2E ${state.runId})`;
  const originalLong = `Original scope for the coastal flood modelling programme. (E2E ${state.runId})`;
  const editedLong = `Revised scope — now includes real-time sensor ingest. (E2E ${state.runId})`;
  let rfpId = '';

  const staff = await openSession(browser, 'staff', 'staff-staff');

  await test.step('staff creates a Draft RFP', async () => {
    await staff.page.goto(staff.url('/rfps/new'));
    await staff.page.getByLabel('Title').fill(title);
    await staff.page.getByLabel('Short description').fill('Model storm-surge risk for the national coastline.');
    await staff.page.getByLabel('Organisation').selectOption({ label: state.rootOrgName });
    await staff.page.getByLabel('Long description').fill(originalLong);
    await staff.page.getByLabel('Tags (optional)').fill('Climate, Modelling');
    await staff.page.getByRole('button', { name: 'Create RFP' }).click();

    await staff.page.waitForURL(/\/rfps\/[0-9a-f-]+\?created=true/);
    rfpId = /\/rfps\/([0-9a-f-]+)/.exec(staff.page.url())![1];
    await expect(staff.page.getByText('RFP created — it starts in Draft.')).toBeVisible();
    await expect(staff.page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  });

  await test.step('the Draft RFP is invisible to an anonymous portal visitor', async () => {
    const anon = await Api.anonymous();
    expect((await anon.listRfps()).map((r) => r.title)).not.toContain(title);
    await anon.dispose();
  });

  await test.step('staff approves the RFP (bare confirm)', async () => {
    await staff.page.getByRole('button', { name: 'Approve' }).click();
    await expect(dialog(staff.page).getByRole('heading', { name: 'Approve this RFP?' })).toBeVisible();
    await dialog(staff.page).getByRole('button', { name: 'Approve' }).click();
    await expect(dialog(staff.page)).toBeHidden();
    // Publish action only appears once the RFP is Approved.
    await expect(staff.page.getByRole('button', { name: 'Publish' })).toBeVisible();
  });

  await test.step('staff publishes the RFP (confirm-with-summary)', async () => {
    await staff.page.getByRole('button', { name: 'Publish' }).click();
    const publishModal = dialog(staff.page);
    await expect(publishModal.getByRole('heading', { name: 'Publish this RFP?' })).toBeVisible();
    // The publish confirm previews exactly what expats will see.
    await expect(publishModal.getByText(title)).toBeVisible();
    await publishModal.getByRole('button', { name: 'Publish' }).click();
    await expect(staff.page.getByText('Live on the portal —', { exact: false })).toBeVisible();
  });

  const portal = await openSession(browser, 'portal', 'portal-expat');

  await test.step('the published RFP appears in the portal RFP list', async () => {
    await portal.page.goto(portal.url('/rfps'));
    await portal.page.getByPlaceholder('Search by title, organisation, or tags…').fill(title);
    await expect(portal.page.getByRole('heading', { name: title })).toBeVisible();
  });

  await test.step('an edit after publish reaches the portal without re-approval', async () => {
    await staff.page.goto(staff.url(`/rfps/${rfpId}/edit`));
    await expect(staff.page.getByText('This RFP is live on the portal')).toBeVisible();
    await staff.page.getByLabel('Long description').fill(editedLong);
    await staff.page.getByRole('button', { name: 'Save changes' }).click();
    await staff.page.waitForURL(/\/rfps\/[0-9a-f-]+\?updated=true/);
    await expect(staff.page.getByText('RFP changes saved.')).toBeVisible();
    // Still Published — no re-approval step.
    await expect(staff.page.getByText('Live on the portal —', { exact: false })).toBeVisible();

    await portal.page.goto(portal.url(`/rfps/${rfpId}`));
    await expect(portal.page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await expect(portal.page.getByText(editedLong)).toBeVisible();
  });

  await test.step('deleting the published RFP removes it from the portal', async () => {
    await staff.page.goto(staff.url(`/rfps/${rfpId}`));
    await staff.page.getByRole('button', { name: 'Delete' }).click();
    const deleteModal = dialog(staff.page);
    await expect(deleteModal.getByRole('button', { name: 'Delete' })).toBeDisabled();
    await deleteModal.getByRole('checkbox').check();
    await deleteModal.getByRole('button', { name: 'Delete' }).click();
    await staff.page.waitForURL('**/rfps?deleted=true');
    await expect(staff.page.getByText('RFP deleted.')).toBeVisible();

    await portal.page.goto(portal.url('/rfps'));
    await portal.page.getByPlaceholder('Search by title, organisation, or tags…').fill(title);
    await expect(portal.page.getByRole('heading', { name: title })).toHaveCount(0);

    await portal.page.goto(portal.url(`/rfps/${rfpId}`));
    await expect(portal.page.getByRole('heading', { name: 'RFP not found' })).toBeVisible();
  });

  await staff.context.close();
  await portal.context.close();
});
